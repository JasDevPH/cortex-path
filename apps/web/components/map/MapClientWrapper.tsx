'use client';

import dynamic from 'next/dynamic';

export const ArchitectureMap = dynamic(
  () =>
    import('./ArchitectureMap').then(m => ({ default: m.ArchitectureMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-black font-mono text-sm text-zinc-500">
        <span className="animate-pulse">loading cortex map...</span>
      </div>
    ),
  }
);
