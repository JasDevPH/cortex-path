'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  FolderOpen, Folder, CheckCircle, RefreshCw, AlertCircle,
  ChevronRight, ChevronDown, FileCode, FolderRoot,
  Loader2, Check, Zap,
} from 'lucide-react';
import type { IngestStatus, FileResult } from '@/hooks/useIngestor';

// ─── Tree builder ────────────────────────────────────────────────────────────

type TreeFile = { kind: 'file'; name: string; path: string; file: FileResult };
type TreeDir  = { kind: 'dir';  name: string; path: string; children: TreeNode[] };
type TreeNode = TreeFile | TreeDir;

function buildTree(files: FileResult[]): TreeNode[] {
  const root: TreeDir = { kind: 'dir', name: '', path: '', children: [] };

  for (const file of files) {
    const parts = file.path.replace(/\\/g, '/').split('/');
    let cur = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const seg = parts[i];
      const p   = parts.slice(0, i + 1).join('/');
      let dir = cur.children.find((n): n is TreeDir => n.kind === 'dir' && n.name === seg);
      if (!dir) {
        dir = { kind: 'dir', name: seg, path: p, children: [] };
        cur.children.push(dir);
      }
      cur = dir;
    }

    cur.children.push({ kind: 'file', name: parts[parts.length - 1], path: file.path, file });
  }

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map(n => n.kind === 'dir' ? { ...n, children: sort(n.children) } : n);

  return sort(root.children);
}

// ─── Tree row ────────────────────────────────────────────────────────────────

function TreeRow({
  node,
  depth,
  selectedPath,
  onFileSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedPath?: string;
  onFileSelect?: (f: FileResult) => void;
}) {
  const [open, setOpen] = useState(true);
  const pad = depth * 12 + 8;

  if (node.kind === 'dir') {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ paddingLeft: pad }}
          className="flex w-full items-center gap-1 py-[3px] pr-2 font-mono text-xs text-cx-text-2 hover:bg-cx-card-raised hover:text-foreground transition-colors"
        >
          {open
            ? <ChevronDown  size={11} className="shrink-0 text-cx-text-3" />
            : <ChevronRight size={11} className="shrink-0 text-cx-text-3" />}
          {open
            ? <FolderOpen size={13} className="shrink-0 text-yellow-600" />
            : <Folder     size={13} className="shrink-0 text-yellow-700/70" />}
          <span className="truncate">{node.name}</span>
        </button>

        {open && (
          <div className="relative">
            <span
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-cx-card-border"
              style={{ left: pad + 5 }}
            />
            {node.children.map(child => (
              <TreeRow
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = node.path === selectedPath;
  return (
    <button
      onClick={() => onFileSelect?.(node.file)}
      style={{ paddingLeft: pad + 14 }}
      className={`flex w-full items-center gap-1.5 py-[3px] pr-2 font-mono text-xs transition-colors ${
        isSelected
          ? 'bg-cx-accent-bg text-cx-accent'
          : 'text-cx-text-3 hover:bg-cx-card-raised hover:text-cx-text-2'
      }`}
    >
      <FileCode size={12} className={`shrink-0 ${isSelected ? 'text-cx-accent' : 'text-blue-600/70'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ─── Processing View ─────────────────────────────────────────────────────────

const STATUS_MSGS = [
  'Parsing AST imports and exports...',
  'Generating vector embeddings...',
  'Syncing summaries to Neon cloud...',
  'Building the architecture mirror...',
  'Running Groq logic analysis...',
  'Mapping the dependency graph...',
  'Extracting wisdom from your code...',
  'Mirroring your codebase to the cloud...',
];

function ProcessingView({
  progress,
  currentFile,
}: {
  progress: { current: number; total: number };
  currentFile: string;
}) {
  const [log, setLog] = useState<string[]>([]);
  const [msgIdx, setMsgIdx] = useState(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!currentFile) return;
    setLog(prev =>
      prev[prev.length - 1] === currentFile ? prev : [...prev, currentFile].slice(-40),
    );
  }, [currentFile]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 0 && progress.current > 0) setSpeed(progress.current / elapsed);
  }, [progress.current]);

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % STATUS_MSGS.length), 2400);
    return () => clearInterval(id);
  }, []);

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const eta = speed && speed > 0 ? Math.round((progress.total - progress.current) / speed) : null;

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(45,212,191,0.07) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute left-1/3 top-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-cx-accent-bg blur-3xl" />

      {/* Header */}
      <div className="relative z-10 pt-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cx-accent opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cx-accent" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-cx-accent">
            cortex ingestion active
          </span>
        </div>
        <p className="font-mono text-xs text-cx-text-3">
          mapping{' '}
          <span className="tabular-nums text-cx-accent-muted">{progress.total}</span> files to the cloud mirror
        </p>
      </div>

      {/* Live terminal feed */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-cx-card-border bg-cx-card-raised">
        <div className="flex shrink-0 items-center justify-between border-b border-cx-card-border px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Zap size={9} className="text-cx-accent-muted" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-cx-text-3">
              live feed
            </span>
          </div>
          <span className="font-mono text-[9px] tabular-nums text-cx-text-3">
            {progress.current} / {progress.total}
          </span>
        </div>

        <div ref={logRef} className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {log.length === 0 && (
            <p className="animate-pulse font-mono text-[10px] text-cx-text-3">
              warming up the pipeline...
            </p>
          )}
          {log.map((file, i) => {
            const isActive = i === log.length - 1;
            return (
              <div
                key={`${file}-${i}`}
                className={`flex items-center gap-2 font-mono text-[10px] ${
                  isActive ? 'text-cx-accent' : 'text-cx-text-3'
                }`}
              >
                {isActive ? (
                  <Loader2 size={9} className="shrink-0 animate-spin text-cx-accent" />
                ) : (
                  <Check size={9} className="shrink-0 text-cx-accent-border" />
                )}
                <span className="truncate">{file}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress + stats */}
      <div className="relative z-10 shrink-0 pb-1">
        <p className="mb-2 h-3 overflow-hidden font-mono text-[10px] text-cx-text-3">
          {STATUS_MSGS[msgIdx]}
        </p>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-cx-card-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-lime-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
          <span className="text-cx-text-3">
            {speed !== null ? `${speed.toFixed(1)} files/sec` : '—'}
          </span>
          <span className="tabular-nums font-semibold text-cx-accent">{pct}%</span>
          <span className="text-cx-text-3">
            {eta !== null ? `~${eta}s left` : 'calculating...'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

type FolderIngestorProps = {
  status: IngestStatus;
  progress: { current: number; total: number };
  results: FileResult[];
  currentFile: string;
  folderName?: string;
  selectedPath?: string;
  onSelect: () => void;
  onReset: () => void;
  onFileSelect?: (file: FileResult) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function FolderIngestor({
  status, progress, results, currentFile, folderName,
  selectedPath, onSelect, onReset, onFileSelect,
}: FolderIngestorProps) {
  const tree = useMemo(() => buildTree(results), [results]);

  if (status === 'idle') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <button
          onClick={onSelect}
          className="flex items-center gap-2 rounded border border-cx-accent-border bg-cx-accent-bg px-6 py-3 font-mono text-sm text-cx-accent transition-all hover:border-cx-accent hover:shadow-[0_0_16px_rgba(45,212,191,0.15)]"
        >
          <FolderOpen size={15} />
          select project folder
        </button>
        <span className="font-mono text-xs text-cx-text-3">
          reads files locally · syncs vectors to cloud
        </span>
      </div>
    );
  }

  if (status === 'processing') {
    return <ProcessingView progress={progress} currentFile={currentFile} />;
  }

  if (status === 'done') {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-1 flex shrink-0 items-center justify-between border-b border-cx-card-border pb-2">
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <FolderRoot size={13} className="shrink-0 text-yellow-500" />
            <span className="truncate font-semibold">{folderName || 'project'}</span>
            <span className="ml-1 text-[10px] text-cx-text-3">
              · {results.length} file{results.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 font-mono text-[10px] text-cx-text-3 transition-colors hover:text-cx-accent"
          >
            <RefreshCw size={10} />
            new
          </button>
        </div>

        <div className="mb-2 flex shrink-0 items-center gap-1.5 px-0.5 font-mono text-[10px] text-cx-accent-muted">
          <CheckCircle size={10} />
          synced to cloud
        </div>

        <div className="flex-1 overflow-y-auto">
          {tree.map(node => (
            <TreeRow
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2 font-mono text-xs text-red-400">
        <AlertCircle size={13} />
        ingestion failed
      </div>
      <button onClick={onReset} className="font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent">
        try again
      </button>
    </div>
  );
}
