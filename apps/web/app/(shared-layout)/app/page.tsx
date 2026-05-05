'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Map, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FolderIngestor } from '@/components/FolderIngestor';
import { LogicCard } from '@/components/LogicCard';
import { useIngestor } from '@/hooks/useIngestor';
import { useInterpret } from '@/hooks/useInterpret';
import { authClient } from '@/lib/auth-client';
import type { FileResult } from '@/hooks/useIngestor';

export default function Home() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { status, progress, results, currentFile, folderName, selectFolder, reset, getContent } = useIngestor();
  const { summary, isLoading: isInterpreting, interpret } = useInterpret();

  const [selectedFile, setSelectedFile] = useState<FileResult | null>(null);

  const handleFileSelect = (file: FileResult) => {
    setSelectedFile(file);
    const content = getContent(file.path);
    interpret(file.name, content || file.summary || '', file.path, file.logicSummary);
  };

  const header = (
    <header className="flex items-center gap-3 border-b border-cx-card-border px-6 py-2">
      <Image
        src="/cortexpath_logo.png"
        alt="CortexPath"
        width={130}
        height={40}
        className="h-8 w-auto rounded"
        priority
      />
      <span className="font-mono text-xs text-cx-text-3">/ ingester</span>
      <nav className="ml-auto flex items-center gap-4">
        <Link
          href="/map"
          className="flex items-center gap-1.5 font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-accent"
        >
          <Map size={11} />
          architecture map
        </Link>
        <ThemeToggle />
        {session && (
          <button
            onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/'; } } })}
            className="font-mono text-xs text-cx-text-3 transition-colors hover:text-cx-text-2"
          >
            sign out
          </button>
        )}
      </nav>
    </header>
  );

  if (sessionLoading) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        {header}
        <div className="flex flex-1 items-center justify-center">
          <span className="animate-pulse font-mono text-xs text-cx-text-3">authenticating...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="font-mono text-xs text-cx-text-3">sign in to access your codebase</p>
          <Link
            href="/auth"
            className="flex items-center gap-2 rounded border border-cx-accent-border bg-cx-accent-bg px-4 py-2 font-mono text-xs text-cx-accent transition-all hover:border-cx-accent hover:bg-cx-accent-bg"
          >
            <LogIn size={12} />
            sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {header}

      <main className="flex flex-1 divide-x divide-cx-card-border overflow-hidden">
        <section className="flex w-1/2 flex-col overflow-hidden p-6">
          <p className="mb-4 shrink-0 font-mono text-[10px] uppercase tracking-widest text-cx-accent-muted">
            project
          </p>
          <FolderIngestor
            status={status}
            progress={progress}
            results={results}
            currentFile={currentFile}
            folderName={folderName}
            selectedPath={selectedFile?.path}
            onSelect={selectFolder}
            onReset={() => { reset(); setSelectedFile(null); }}
            onFileSelect={handleFileSelect}
          />
        </section>

        <section className="flex w-1/2 flex-col overflow-hidden p-6">
          <p className="mb-4 shrink-0 font-mono text-[10px] uppercase tracking-widest text-cx-accent-muted">
            logic summary
          </p>
          <div className="min-h-0 flex-1">
            <LogicCard
              fileName={selectedFile?.name ?? ''}
              filePath={selectedFile?.path ?? ''}
              summary={summary}
              isLoading={isInterpreting}
              code={selectedFile ? getContent(selectedFile.path) : ''}
              imports={selectedFile?.imports ?? []}
              exports={selectedFile?.exports ?? []}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
