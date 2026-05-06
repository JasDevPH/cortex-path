import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type ModelName } from '@/lib/ai/groq';

const LS_PREFIX = 'cortex:interp:';

function lsKey(filePath: string, model: string) {
  return `${LS_PREFIX}${model}:${filePath}`;
}

export function useInterpret() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelName>('qwen/qwen3-32b');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ status: 'safe' | 'verge' | 'denied', message?: string } | null>(null);
  const queryClient = useQueryClient();

  const interpret = useCallback(async (
    fileName: string,
    codeSnippet: string,
    filePath: string,
    savedLogicSummary?: string | null,
    modelOverride?: ModelName,
  ) => {
    if (!filePath && !codeSnippet.trim()) return;

    const initialModel = modelOverride || selectedModel;
    const cacheKey = ['interpretation', initialModel, filePath];

    // 1. React Query in-memory cache
    const cached = queryClient.getQueryData<string>(cacheKey);
    if (cached) {
      setSummary(cached);
      return;
    }

    // 2. localStorage
    try {
      const stored = localStorage.getItem(lsKey(filePath, initialModel));
      if (stored) {
        setSummary(stored);
        queryClient.setQueryData(cacheKey, stored);
        return;
      }
    } catch { /* ignore */ }

    // 3. DB-persisted logicSummary (only if model matches primary default)
    if (savedLogicSummary && initialModel === 'qwen/qwen3-32b') {
      setSummary(savedLogicSummary);
      queryClient.setQueryData(cacheKey, savedLogicSummary);
      try { localStorage.setItem(lsKey(filePath, initialModel), savedLogicSummary); } catch { /* ignore */ }
      return;
    }

    setIsLoading(true);
    setSummary('');
    setRateLimitInfo(null);

    const models: ModelName[] = ['qwen/qwen3-32b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    const startIndex = models.indexOf(initialModel);
    const chain = startIndex === -1 ? [initialModel] : models.slice(startIndex);

    try {
      for (let i = 0; i < chain.length; i++) {
        const currentModel = chain[i];
        
        try {
          const res = await fetch('/api/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, filePath, codeSnippet, model: currentModel }),
          });

          if (res.status === 429) {
            if (i < chain.length - 1) {
              console.warn(`[useInterpret] ${currentModel} limit hit, falling back...`);
              continue; // try next model in loop
            }
            const data = await res.json();
            setRateLimitInfo({ status: 'denied', message: data.error || 'Rate limit reached.' });
            return;
          }

          if (!res.ok || !res.body) {
            if (i < chain.length - 1) continue;
            return;
          }

          const status = res.headers.get('X-Usage-Status') as 'safe' | 'verge' | 'denied';
          if (status) setRateLimitInfo({ status });

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
            queryClient.setQueryData(['interpretation', currentModel, filePath], full);
            try { localStorage.setItem(lsKey(filePath, currentModel), full); } catch { /* ignore */ }

            if (currentModel === 'qwen/qwen3-32b') {
              fetch('/api/files', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: filePath, interpretation: full }),
              }).catch(() => {});
            }
          }
          
          return; // Success, break the loop
        } catch (err) {
          if (i < chain.length - 1) continue;
          throw err;
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, selectedModel]);

  const reset = useCallback(() => {
    setSummary('');
    setIsLoading(false);
    setRateLimitInfo(null);
  }, []);

  return { summary, isLoading, interpret, reset, selectedModel, setSelectedModel, rateLimitInfo };
}
