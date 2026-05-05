'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, X, FileText } from 'lucide-react';

type SavedPrompt = {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  createdAt: string;
};

type SavedPromptsModalProps = {
  onClose: () => void;
};

function PromptRow({ prompt }: { prompt: SavedPrompt }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-left"
        >
          <FileText size={11} className="shrink-0 text-teal-700" />
          <div>
            <p className="font-mono text-xs text-zinc-300">{prompt.fileName}</p>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-600 line-clamp-1">
              {prompt.content.slice(0, 80)}…
            </p>
          </div>
        </button>
        <button
          onClick={copy}
          className="ml-4 flex shrink-0 items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors hover:text-teal-300"
        >
          {copied ? <Check size={11} className="text-teal-400" /> : <Copy size={11} />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-zinc-800/70 px-4 py-3">
          <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-zinc-500">
            {prompt.content}
          </pre>
        </div>
      )}
    </div>
  );
}

export function SavedPromptsModal({ onClose }: SavedPromptsModalProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then((data: { prompts?: SavedPrompt[] }) => setPrompts(data.prompts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex w-[640px] max-w-[95vw] flex-col rounded border border-zinc-800 bg-[#09090b] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-teal-700/80">
            saved prompts
          </span>
          <button onClick={onClose} className="text-zinc-600 transition-colors hover:text-zinc-300">
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-5" style={{ maxHeight: '480px' }}>
          {loading ? (
            <p className="animate-pulse font-mono text-xs text-zinc-600">loading...</p>
          ) : prompts.length === 0 ? (
            <p className="font-mono text-xs text-zinc-600">no saved prompts yet</p>
          ) : (
            prompts.map(p => <PromptRow key={p.id} prompt={p} />)
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/70 px-5 py-2.5">
          <p className="font-mono text-[10px] text-zinc-700">
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} saved · click any row to expand
          </p>
        </div>
      </div>
    </div>
  );
}
