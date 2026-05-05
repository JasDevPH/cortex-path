import { prisma } from "@cortexpath/database";
import { getSessionFromRequest } from "@/lib/get-session";

export const runtime = "nodejs";

type FileRow = {
  id: string;
  path: string;
  name: string;
  ext: string;
  imports: string[];
  exports: string[];
  summary: string | null;
  score: number;
};

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { embedding, topK = 5 } = await req.json();
    const vectorStr = `[${(embedding as number[]).join(",")}]`;

    const results = await prisma.$queryRaw<FileRow[]>`
      SELECT id, path, name, ext, imports, exports, summary,
             1 - (embedding <=> ${vectorStr}::vector(384)) AS score
      FROM "File"
      WHERE embedding IS NOT NULL
        AND "userId" = ${session.user.id}
      ORDER BY embedding <=> ${vectorStr}::vector(384)
      LIMIT ${topK}
    `;

    return Response.json(results);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
