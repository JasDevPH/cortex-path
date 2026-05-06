import { createGroq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Named model instances
export const groqLarge   = groq("llama-3.3-70b-versatile"); // interpret/ingest
export const groqFast    = groq("llama-3.1-8b-instant");    // fallback
export const groqQwen    = groq("qwen/qwen3-32b");          // primary
export const groqGptOss  = groq("openai/gpt-oss-20b");      // chat fallback

export const MODEL_LIMITS = {
  "qwen/qwen3-32b": { rpm: 60, rpd: 1000, tpm: 6000, tpd: 500000 },
  "llama-3.3-70b-versatile": { rpm: 30, rpd: 1000, tpm: 12000, tpd: 100000 },
  "llama-3.1-8b-instant": { rpm: 30, rpd: 14400, tpm: 6000, tpd: 500000 },
  "openai/gpt-oss-20b": { rpm: 30, rpd: 1000, tpm: 8000, tpd: 200000 },
} as const;

export type ModelName = keyof typeof MODEL_LIMITS;

export const MODEL_MAP = {
  "qwen/qwen3-32b": groqQwen,
  "llama-3.3-70b-versatile": groqLarge,
  "llama-3.1-8b-instant": groqFast,
  "openai/gpt-oss-20b": groqGptOss,
} as const;

// Keep alias so any remaining imports stay working
export const cortexModel = groqLarge;

type AiModel = Parameters<typeof streamText>[0]["model"];

function is429(err: unknown): boolean {
  // Vercel AI SDK wraps API errors — check both statusCode property and message text
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (e["statusCode"] === 429 || e["status"] === 429) return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("rate_limit");
  }
  return false;
}

/** Fallback wrapper for non-streaming calls (ingest/batch) */
export async function generateWithFallback(
  params: Omit<Parameters<typeof generateText>[0], "model">,
  chain: AiModel[] = [groqQwen, groqLarge, groqFast]
): Promise<Awaited<ReturnType<typeof generateText>>> {
  let lastErr: unknown;
  for (let i = 0; i < chain.length; i++) {
    try {
      return await generateText({ ...params, model: chain[i] } as Parameters<typeof generateText>[0]);
    } catch (err) {
      lastErr = err;
      if (is429(err) && i < chain.length - 1) continue;
      throw err;
    }
  }
  throw lastErr ?? new Error("All models in fallback chain exhausted");
}

/** Fallback wrapper for streaming calls (chat, interpret).
 *  Catches synchronous throws (immediate 429, bad config). Stream-level
 *  errors surface to the client as a truncated response — user can retry. */
export async function streamWithFallback(
  params: Omit<Parameters<typeof streamText>[0], "model">,
  chain: AiModel[] = [groqQwen, groqLarge, groqFast]
): Promise<ReturnType<typeof streamText>> {
  let lastErr: unknown;
  for (let i = 0; i < chain.length; i++) {
    try {
      return streamText({ ...params, model: chain[i] } as Parameters<typeof streamText>[0]);
    } catch (err) {
      lastErr = err;
      if (is429(err) && i < chain.length - 1) continue;
      throw err;
    }
  }
  throw lastErr ?? new Error("All models in fallback chain exhausted");
}
