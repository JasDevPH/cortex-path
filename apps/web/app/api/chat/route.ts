import { prisma } from '@cortexpath/database';
import { groqQwen, groqGptOss, groqFast, streamWithFallback } from '@/lib/ai/groq';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { checkRateLimit } from '@/lib/rate-limit';
import { getSessionFromRequest } from '@/lib/get-session';

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Per-minute guard — prevents burst draining the shared org quota
    const rlMin = checkRateLimit(session.user.id, 'chat:min', 3, 60_000);
    if (!rlMin.allowed) {
      return new Response(
        JSON.stringify({ error: 'Sending too fast. Please wait a moment before trying again.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }

    // Per-day guard — protects the 1K RPD org limit across users
    const rl = checkRateLimit(session.user.id, 'chat', 20);
    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: 'Daily chat limit reached. Try again tomorrow.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Reset': String(rl.resetAt) } }
      );
    }

    const { message } = await req.json();

    const embedding = await generateEmbedding(message);
    const vectorStr = `[${embedding.join(',')}]`;

    const files = await prisma.$queryRaw<
      { name: string; summary: string | null }[]
    >`
      SELECT name, summary,
             1 - (embedding <=> ${vectorStr}::vector(384)) AS score
      FROM "File"
      WHERE embedding IS NOT NULL
        AND "userId" = ${session.user.id}
      ORDER BY embedding <=> ${vectorStr}::vector(384)
      LIMIT 5
    `;

    const context = files
      .filter((f: { name: string; summary: string | null }) => f.summary)
      .map((f: { name: string; summary: string | null }) => `[${f.name}] ${f.summary}`)
      .join('\n');

    const result = await streamWithFallback(
      {
        system: context
          ? `You are CortexPath's AI assistant. Answer questions about the developer's codebase concisely. Reference file names in square brackets when relevant.\n\nCODEBASE CONTEXT:\n${context}`
          : `You are CortexPath's AI assistant. No files have been ingested yet. Let the user know they should select a project folder to build up the codebase context first.`,
        prompt: message,
      },
      [groqQwen, groqGptOss, groqFast] // qwen3-32b → gpt-oss-20b → llama-3.1-8b
    );

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
