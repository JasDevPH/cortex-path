'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const LS_KEY = 'cortex-sessions-v1';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function makeSession(): ChatSession {
  return {
    id: uid(),
    title: 'New chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadFromStorage(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

/** Strips <think>...</think> reasoning blocks emitted by qwen models before display. */
function stripThinkBlocks(text: string): string {
  // Remove fully closed blocks
  let out = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  // If a block is still open (streaming), hide everything from the opening tag onwards
  const openIdx = out.indexOf('<think>');
  if (openIdx !== -1) out = out.slice(0, openIdx);
  return out.trimStart();
}

function saveToStorage(sessions: ChatSession[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  } catch {
    // Storage quota exceeded or unavailable — silently skip
  }
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);
  const initialized = useRef(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const loaded = loadFromStorage();
    if (loaded.length > 0) {
      setSessions(loaded);
      setActiveId(loaded[0].id);
    } else {
      const s = makeSession();
      setSessions([s]);
      setActiveId(s.id);
    }
  }, []);

  // Persist whenever sessions change (debounced via React's batching)
  useEffect(() => {
    if (sessions.length > 0) saveToStorage(sessions);
  }, [sessions]);

  // If active session was deleted, fall back to first available
  useEffect(() => {
    if (!activeId && sessions.length > 0) {
      setActiveId(sessions[0].id);
    }
  }, [activeId, sessions]);

  const activeSession = sessions.find(s => s.id === activeId) ?? null;

  const newSession = useCallback(() => {
    const s = makeSession();
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
  }, []);

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        const fresh = makeSession();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        setActiveId(next[0].id);
      }
      return next;
    });
  }, [activeId]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isThrottled || !activeId) return;

    const capturedSessionId = activeId;
    const userMsg: ChatMessage = { role: 'user', content: text };

    // Append user message + auto-title from first message
    setSessions(prev => prev.map(s => {
      if (s.id !== capturedSessionId) return s;
      return {
        ...s,
        title: s.messages.length === 0 ? text.slice(0, 45) : s.title,
        messages: [...s.messages, userMsg],
        updatedAt: Date.now(),
      };
    }));

    setIsLoading(true);

    // Add empty assistant placeholder
    setSessions(prev => prev.map(s =>
      s.id === capturedSessionId
        ? { ...s, messages: [...s.messages, { role: 'assistant', content: '' }], updatedAt: Date.now() }
        : s
    ));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        const errText = res.status === 429
          ? (res.headers.get('Retry-After')
              ? 'Sending too fast — please wait a moment.'
              : 'Daily chat limit reached. Try again tomorrow.')
          : 'Something went wrong. Please try again.';
        setSessions(prev => prev.map(s => {
          if (s.id !== capturedSessionId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = { role: 'assistant', content: errText };
          return { ...s, messages: msgs, updatedAt: Date.now() };
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snap = stripThinkBlocks(accumulated);
        setSessions(prev => prev.map(s => {
          if (s.id !== capturedSessionId) return s;
          const msgs = [...s.messages];
          msgs[msgs.length - 1] = { role: 'assistant', content: snap };
          return { ...s, messages: msgs, updatedAt: Date.now() };
        }));
      }
    } finally {
      setIsLoading(false);
      setIsThrottled(true);
      setTimeout(() => setIsThrottled(false), 3_000);
    }
  }, [isLoading, isThrottled, activeId]);

  return {
    sessions,
    activeId,
    activeSession,
    isLoading,
    isThrottled,
    send,
    newSession,
    switchSession,
    deleteSession,
  };
}
