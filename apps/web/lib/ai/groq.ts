import { createGroq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Named model instances
export const groqLarge   = groq("llama-3.3-70b-versatile"); // 100K TPD  — interpret/ingest (quality)
export const groqFast    = groq("llama-3.1-8b-instant");    // 500K TPD  — final fallback (high quota)
export const groqQwen    = groq("qwen/qwen3-32b");          // 500K TPD, 60 RPM — primary chat
export const groqGptOss  = groq("openai/gpt-oss-20b");      // 200K TPD  — chat fallback 1

// NOTE: compound-beta / compound-beta-mini internally call llama-3.3-70b-versatile
// and drain the same 100K TPD quota — do NOT use for chat.
export const groqCompact  = groq("compound-beta-mini"); // reserved — not active
export const groqCompound = groq("compound-beta");       // reserved — not active

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
  chain: AiModel[] = [groqLarge, groqFast]
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
  chain: AiModel[] = [groqLarge, groqFast]
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
