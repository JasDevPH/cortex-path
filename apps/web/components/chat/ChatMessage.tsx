'use client';

import type { ChatMessage as ChatMessageType } from '@/hooks/useAIChat';

export function ChatMessage({ role, content }: ChatMessageType) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded px-3 py-2 font-mono text-xs leading-relaxed ${
          isUser
            ? 'bg-zinc-800 text-zinc-200'
            : 'border border-zinc-800 bg-zinc-900 text-zinc-300'
        }`}
      >
        {!isUser && (
          <span className="mb-1 block text-[10px] text-zinc-600">cortex://</span>
        )}
        {content || <span className="animate-pulse text-zinc-600">▊</span>}
      </div>
    </div>
  );
}
