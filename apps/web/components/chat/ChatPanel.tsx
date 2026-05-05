'use client';

import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { SendHorizontal, Trash2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/hooks/useAIChat';

type ChatPanelProps = {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export function ChatPanel({ messages, isLoading, onSend, onClear, onClose }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-96 w-80 flex-col rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
        <span className="font-mono text-xs text-zinc-400">cortex://chat</span>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              className="text-zinc-700 transition-colors hover:text-zinc-400"
            >
              <Trash2 size={11} />
            </button>
          )}
          <button
            onClick={onClose}
            className="font-mono text-xs text-zinc-700 transition-colors hover:text-zinc-400"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="font-mono text-xs text-zinc-700">
              ask anything about your codebase
            </span>
            <span className="font-mono text-[10px] text-zinc-800">
              e.g. &quot;where do we handle auth?&quot;
            </span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800 px-3 py-2.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ask anything..."
          disabled={isLoading}
          className="flex-1 bg-transparent font-mono text-xs text-zinc-300 outline-none placeholder:text-zinc-700 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="text-zinc-600 transition-colors hover:text-zinc-300 disabled:opacity-30"
        >
          <SendHorizontal size={13} />
        </button>
      </div>
    </div>
  );
}
