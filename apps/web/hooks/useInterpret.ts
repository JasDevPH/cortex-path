'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const LS_PREFIX = 'cortex:interp:';

function lsKey(filePath: string) {
  return LS_PREFIX + filePath;
}

export function useInterpret() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const interpret = useCallback(async (
    fileName: string,
    codeSnippet: string,
    filePath: string,
    savedLogicSummary?: string | null,
  ) => {
    // Need at least a path or code to call the API meaningfully
    if (!filePath && !codeSnippet.trim()) return;

    const cacheKey = ['interpretation', filePath];

    // 1. React Query in-memory cache (same session, instant)
    const cached = queryClient.getQueryData<string>(cacheKey);
    if (cached) {
      setSummary(cached);
      return;
    }

    // 2. localStorage (cross-session, no API call)
    try {
      const stored = localStorage.getItem(lsKey(filePath));
      if (stored) {
        setSummary(stored);
        queryClient.setQueryData(cacheKey, stored);
        return;
      }
    } catch {
      // localStorage unavailable — fall through
    }

    // 3. DB-persisted logicSummary (after page reload, before local cache warms)
    if (savedLogicSummary) {
      setSummary(savedLogicSummary);
      queryClient.setQueryData(cacheKey, savedLogicSummary);
      try { localStorage.setItem(lsKey(filePath), savedLogicSummary); } catch { /* ignore */ }
      return;
    }

    // 3. Stream from API (first time only)
    setIsLoading(true);
    setSummary('');

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, filePath, codeSnippet }),
      });

      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setSummary(full);
      }

      if (full) {
        // Populate React Query cache
        queryClient.setQueryData(cacheKey, full);

        // Persist to localStorage
        try {
          localStorage.setItem(lsKey(filePath), full);
        } catch {
          // quota exceeded — skip silently
        }

        // Persist to DB (fire-and-forget, best-effort)
        fetch('/api/files', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: filePath, interpretation: full }),
        }).catch(() => {});
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const reset = useCallback(() => {
    setSummary('');
    setIsLoading(false);
  }, []);

  return { summary, isLoading, interpret, reset };
}
