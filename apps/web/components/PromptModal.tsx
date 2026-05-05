'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, X, BookmarkCheck } from 'lucide-react';

type PromptModalProps = {
  fileName: string;
  filePath: string;
  content: string;
  onClose: () => void;
};

const LS_PROMPT_PREFIX = 'cortex:prompt:';

export function PromptModal({ fileName, filePath, content, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-save to localStorage + DB on mount
  useEffect(() => {
    // localStorage
    try {
      localStorage.setItem(LS_PROMPT_PREFIX + filePath, content);
    } catch { /* quota exceeded */ }

    // DB (fire-and-forget)
    fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, fileName, content }),
    })
      .then(() => setSaved(true))
      .catch(() => {});
  }, [filePath, fileName, content]);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex w-[640px] max-w-[95vw] flex-col rounded border border-zinc-800 bg-[#09090b] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-teal-700/80">
              generated prompt
            </span>
            <span className="font-mono text-[10px] text-zinc-600">·</span>
            <span className="font-mono text-xs text-zinc-500 truncate max-w-[200px]">{fileName}</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 font-mono text-[10px] text-teal-600">
                <BookmarkCheck size={10} />
                saved
              </span>
            )}
            <button
              onClick={copy}
              className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 transition-colors hover:text-teal-300"
            >
              {copied ? <Check size={11} className="text-teal-400" /> : <Copy size={11} />}
              {copied ? 'copied' : 'copy'}
            </button>
            <button
              onClick={onClose}
              className="text-zinc-600 transition-colors hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Prompt content */}
        <textarea
          readOnly
          value={content}
          className="h-[420px] w-full resize-none bg-transparent p-5 font-mono text-xs leading-relaxed text-zinc-400 focus:outline-none"
        />

        {/* Footer */}
        <div className="border-t border-zinc-800/70 px-5 py-2.5">
          <p className="font-mono text-[10px] text-zinc-700">
            auto-saved · paste into any AI assistant · reload to find it under saved prompts
          </p>
        </div>
      </div>
    </div>
  );
}
