'use client';

import { notification } from '@/components/ui/notification';
import { useState, useCallback, useRef, useEffect } from 'react';

export type IngestStatus = 'idle' | 'processing' | 'done' | 'error';

export type FileResult = {
  name: string;
  path: string;
  summary: string | null;
  logicSummary?: string | null;
  imports: string[];
  exports: string[];
  content?: string | null;
};

const BATCH_SIZE = 10;

const CODE_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.cs', '.cpp', '.c', '.h',
  '.vue', '.svelte', '.rb', '.php', '.swift', '.kt',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out',
  '__pycache__', '.cache', '.turbo', 'coverage', '.vercel',
]);

// Exact file names to never ingest
const SKIP_FILES = new Set([
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  'tsconfig.json', 'tsconfig.node.json', 'tsconfig.app.json',
  '.env', '.env.local', '.env.development', '.env.production', '.env.test',
  '.gitignore', '.gitattributes', '.prettierrc', '.eslintrc', '.editorconfig',
  'Makefile', 'Dockerfile', '.dockerignore', 'LICENSE', 'README.md',
  'CHANGELOG.md', 'migration_lock.toml',
]);

// Prefix patterns — skip if file name starts with any of these
const SKIP_PREFIXES = ['.env.'];

// Suffix patterns — skip if file name matches *.<pattern>
const SKIP_SUFFIXES = [
  '.config.ts', '.config.js', '.config.mjs', '.config.cjs',
  '.config.json', '.min.js', '.min.css', '.d.ts', '.map',
  '.lock', '.toml', '.yaml', '.yml', '.xml', '.csv',
  '.md', '.mdx', '.txt', '.log',
];

function shouldSkipFile(name: string): boolean {
  if (SKIP_FILES.has(name)) return true;
  if (SKIP_PREFIXES.some(p => name.startsWith(p))) return true;
  if (SKIP_SUFFIXES.some(s => name.endsWith(s))) return true;
  return false;
}

type FileEntry = { name: string; path: string; content: string };

async function collectFiles(
  dir: FileSystemDirectoryHandle,
  base: string,
  out: FileEntry[]
) {
  for await (const [name, handle] of dir as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    if (handle.kind === 'directory') {
      if (!SKIP_DIRS.has(name)) {
        await collectFiles(
          handle as FileSystemDirectoryHandle,
          base ? `${base}/${name}` : name,
          out
        );
      }
    } else {
      const ext = name.slice(name.lastIndexOf('.'));
      if (CODE_EXTS.has(ext) && !shouldSkipFile(name)) {
        try {
          const file = await (handle as FileSystemFileHandle).getFile();
          const content = await file.text();
          if (content.trim().length > 0 && file.size < 500_000) {
            out.push({ name, path: base ? `${base}/${name}` : name, content });
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const LS_FOLDER_KEY = 'cortex:folderName';

export function useIngestor() {
  const [status, setStatus] = useState<IngestStatus>('idle');
  const [initializing, setInitializing] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<FileResult[]>([]);
  const [currentFile, setCurrentFile] = useState('');
  const [folderName, setFolderName] = useState(() => {
    try { return localStorage.getItem(LS_FOLDER_KEY) ?? ''; } catch { return ''; }
  });

  // Session-only cache: path → raw file content for on-click interpret
  const contentCache = useRef<Map<string, string>>(new Map());

  const getContent = useCallback((path: string) => contentCache.current.get(path) ?? '', []);

  // Load previously ingested files from DB on mount
  useEffect(() => {
    fetch('/api/files')
      .then((r) => r.json())
      .then((data: { files?: FileResult[] }) => {
        if (data.files && data.files.length > 0) {
          setResults(data.files);
          setStatus('done');
          data.files.forEach(f => {
            if (f.content) contentCache.current.set(f.path, f.content);
          });
        }
      })
      .catch(() => {/* silently ignore — user can still ingest manually */})
      .finally(() => setInitializing(false));
  }, []);

  const selectFolder = useCallback(async () => {
    try {
      const dirHandle = await (
        window as unknown as {
          showDirectoryPicker: (opts?: object) => Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker({ mode: 'read' });

      const name = dirHandle.name;
      setFolderName(name);
      try { localStorage.setItem(LS_FOLDER_KEY, name); } catch { /* ignore */ }

      const files: FileEntry[] = [];
      await collectFiles(dirHandle, '', files);

      if (files.length === 0) {
        setStatus('idle');
        return;
      }

      // Cache content for interpret-on-click
      contentCache.current = new Map(files.map((f) => [f.path, f.content]));

      // Wipe the previous project's DB rows so the map doesn't show ghost nodes
      // setResults([]);
      // await fetch('/api/files', { method: 'DELETE' });

      const batches = chunk(files, BATCH_SIZE);
      setProgress({ current: 0, total: files.length });
      setStatus('processing');

      const allResults: FileResult[] = [];
      let processed = 0;

      for (const batch of batches) {
        setCurrentFile(
          batch.length === 1
            ? batch[0].name
            : `${batch[0].name} + ${batch.length - 1} more`
        );

        try {
          const res = await fetch('/api/ingest/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              files: batch.map((f) => ({ filePath: f.path, fileContent: f.content })),
            }),
          });

          if (res.ok) {
            const data = await res.json() as { results: FileResult[] };
            allResults.push(...data.results);
          }
        } catch {
          // batch failed — continue with next batch
        }

        processed += batch.length;
        setProgress({ current: processed, total: files.length });
      }

      setResults(allResults);
      setStatus('done');
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setStatus('idle');
      } else {
        console.error('[useIngestor]', err);
        setStatus('error');
      }
    }
  }, []);

  const reset = useCallback(async () => {
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    setResults([]);

    const res = await fetch('/api/files', { method: 'DELETE' });
    if (!res.ok) return notification({type: "error", message: "Failed to reset/delete project"})
    
    setCurrentFile('');
    setFolderName('');
    contentCache.current.clear();
    try { localStorage.removeItem(LS_FOLDER_KEY); } catch { /* ignore */ }
  }, []);

  return { status, initializing, progress, results, currentFile, folderName, selectFolder, reset, getContent };
}
