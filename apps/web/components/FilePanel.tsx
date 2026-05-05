'use client';

import { useState } from 'react';
import { FileCode, Play } from 'lucide-react';

type FilePanelProps = {
  onInterpret: (fileName: string, code: string) => void;
  isLoading: boolean;
};

export function FilePanel({ onInterpret, isLoading }: FilePanelProps) {
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <FileCode size={13} className="text-zinc-600" />
        <input
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          placeholder="filename.ts"
          className="flex-1 bg-transparent font-mono text-xs text-zinc-300 outline-none placeholder:text-zinc-700"
        />
      </div>

      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder={`// paste your code here...\nexport function example() {\n  // ...\n}`}
        spellCheck={false}
        className="flex-1 resize-none bg-transparent font-mono text-xs leading-relaxed text-zinc-400 outline-none placeholder:text-zinc-800"
      />

      <button
        onClick={() => onInterpret(fileName || 'untitled.ts', code)}
        disabled={isLoading || !code.trim()}
        className="flex items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-900/60 px-4 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Play size={11} />
        {isLoading ? 'interpreting...' : 'interpret logic'}
      </button>
    </div>
  );
}
