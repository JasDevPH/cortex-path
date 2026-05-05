'use client';

import { useState, useCallback } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setIsLoading(true);

      try {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });

        if (!res.ok || !res.body) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'Something went wrong. Please try again.',
            };
            return updated;
          });
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: updated[updated.length - 1].content + chunk,
            };
            return updated;
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, clear };
}
