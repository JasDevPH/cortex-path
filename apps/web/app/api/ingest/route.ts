import { initCortexParser } from "@/lib/ast/crawler";
import { cortexModel } from "@/lib/ai/groq";
import { prisma } from "@cortexpath/database";
import { generateText } from "ai";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { filePath, fileContent, embedding } = await req.json();

    const { imports, exports } = initCortexParser(fileContent, filePath);

    // Groq summary — 10 s timeout; if it fails the file still gets saved
    let summary: string | null = null;
    try {
      const groqResult = await Promise.race([
        generateText({
          model: cortexModel,
          system: `You are the CortexPath Logic Interpreter. Explain code logic in plain English (max 3 sentences). Focus on architectural intent and dependencies.`,
          prompt: `File: ${filePath}\n\n${fileContent.slice(0, 3000)}`,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Groq timeout")), 10_000)
        ),
      ]);
      summary = groqResult.text;
    } catch (groqErr) {
      console.error("[ingest] Groq failed:", groqErr);
    }

    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);

    const file = await prisma.file.upsert({
      where: { path: filePath },
      create: { path: filePath, name: fileName, ext, imports, exports, summary },
      update: { imports, exports, summary },
    });

    if (embedding?.length) {
      const vectorStr = `[${(embedding as number[]).join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "File" SET embedding = $1::vector WHERE id = $2`,
        vectorStr,
        file.id
      );
    }

    return Response.json({ id: file.id, path: filePath, name: fileName, summary });
  } catch (error: unknown) {
    console.error("[ingest] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
