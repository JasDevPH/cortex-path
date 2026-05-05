import { prisma } from "@cortexpath/database";
import { getSessionFromHeaders } from "@/lib/get-session";

export const runtime = "nodejs";

type GraphFile = { id: string; path: string; name: string; summary: string | null; imports: string[] };

export async function GET() {
  try {
    const session = await getSessionFromHeaders();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const files = await prisma.$queryRaw<GraphFile[]>`
      SELECT id, path, name, summary, imports
      FROM "File"
      WHERE "userId" = ${session.user.id}
    `;

    const pathToId = new Map(files.map((f: GraphFile) => [f.path, f.id]));

    const nodes = files.map((f: GraphFile) => ({
      id: f.id,
      data: { label: f.name, path: f.path, summary: f.summary },
      position: { x: 0, y: 0 },
    }));

    const edges: { id: string; source: string; target: string }[] = [];
    for (const f of files) {
      for (const imp of f.imports) {
        const targetId = pathToId.get(imp);
        if (targetId) {
          edges.push({ id: `${f.id}-${targetId}`, source: f.id, target: targetId });
        }
      }
    }

    return Response.json({ nodes, edges });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
