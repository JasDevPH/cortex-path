'use client';

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { useAIChat } from '@/hooks/useAIChat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, send, clear } = useAIChat();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={send}
          onClear={clear}
          onClose={() => setIsOpen(false)}
        />
      )}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Toggle chat"
        className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all ${
          isOpen
            ? 'border-zinc-500 bg-zinc-800 text-zinc-200'
            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
        }`}
      >
        <Zap size={15} />
      </button>
    </div>
  );
}
