import { prisma } from '@cortexpath/database';
import { cortexModel } from '@/lib/ai/groq';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { streamText } from 'ai';
import { getSessionFromRequest } from '@/lib/get-session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
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
      .filter(f => f.summary)
      .map(f => `[${f.name}] ${f.summary}`)
      .join('\n');

    const result = streamText({
      model: cortexModel,
      system: context
        ? `You are CortexPath's AI assistant. Answer questions about the developer's codebase concisely. Reference file names in square brackets when relevant.\n\nCODEBASE CONTEXT:\n${context}`
        : `You are CortexPath's AI assistant. No files have been ingested yet. Let the user know they should select a project folder to build up the codebase context first.`,
      prompt: message,
    });

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
