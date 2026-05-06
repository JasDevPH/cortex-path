import { initCortexParser } from "@/lib/ast/crawler";
import { generateWithFallback } from "@/lib/ai/groq";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@cortexpath/database";
import { checkRateLimit } from "@/lib/rate-limit";
import path from "path";
import { getSessionFromRequest } from "@/lib/get-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IngestFile = {
  filePath: string;
  fileContent: string;
};

type FileResult = {
  path: string;
  name: string;
  summary: string | null;
};

function needsSummary(filePath: string, fileContent: string): boolean {
  const name = path.basename(filePath);
  if (name.endsWith(".d.ts")) return false;
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(name)) return false;
  if (/\.(config|setup)\.(ts|js|mjs|cjs)$/.test(name)) return false;
  if (fileContent.trim().split("\n").length < 5) return false;
  return true;
}

async function batchSummarize(
  files: IngestFile[]
): Promise<Record<string, string>> {
  const eligible = files.filter((f) => needsSummary(f.filePath, f.fileContent));
  if (eligible.length === 0) return {};

  const filesList = eligible
    .map(
      (f) =>
        `=== ${path.basename(f.filePath)} ===\n${f.fileContent.slice(0, 1200)}`
    )
    .join("\n\n");

  try {
    const { text } = await Promise.race([
      generateWithFallback({
        system:
          "You are a code analyzer. Always respond with valid JSON only — no markdown, no explanation.",
        prompt: `Summarize each file in one plain-English sentence (max 30 words).
Return ONLY a JSON object where keys are the exact filenames shown: {"filename.ts": "summary"}

${filesList}`,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Groq batch timeout")), 60_000)
      ),
    ]);

    // Clean up response string - remove markdown code blocks if present
    const cleanText = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    
    // Attempt to extract JSON from the cleaned text
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("[ingest/batch] No JSON object found in response");
      return {};
    }
    
    try {
      return JSON.parse(match[0]) as Record<string, string>;
    } catch (parseErr) {
      console.error("[ingest/batch] JSON parse failed for text:", match[0], parseErr);
      return {};
    }
  } catch (err) {
    console.error("[ingest/batch] Groq failed:", err);
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const rl = checkRateLimit(userId, 'ingest', 20);
    if (!rl.allowed) {
      return Response.json(
        { error: 'Daily ingest limit reached. Try again tomorrow.' },
        { status: 429, headers: { 'X-RateLimit-Reset': String(rl.resetAt) } }
      );
    }

    const { files } = (await req.json()) as { files: IngestFile[] };
    if (!Array.isArray(files) || files.length === 0) {
      return Response.json({ results: [] });
    }

    // Groq summarization + server-side embeddings run in parallel
    const [summaries, embeddings] = await Promise.all([
      batchSummarize(files),
      Promise.all(files.map((f) => generateEmbedding(f.fileContent))),
    ]);

    // Parallel DB upserts
    const results = await Promise.all(
      files.map(async (f, i): Promise<FileResult> => {
        const fileName = path.basename(f.filePath);
        const ext = path.extname(f.filePath);
        const summary = summaries[fileName] ?? null;
        const embedding = embeddings[i];

        let parsed = { imports: [] as string[], exports: [] as string[] };
        try {
          parsed = initCortexParser(f.fileContent, f.filePath);
        } catch {
          // ts-morph parse failure is non-fatal
        }

        const file = await prisma.file.upsert({
          where: { path: f.filePath },
          create: {
            path: f.filePath,
            name: fileName,
            ext,
            imports: parsed.imports,
            exports: parsed.exports,
            summary,
            content: f.fileContent,
          },
          update: {
            imports: parsed.imports,
            exports: parsed.exports,
            summary,
            content: f.fileContent,
          },
        });

        // Set userId separately (not in typed client until prisma generate runs)
        await prisma.$executeRaw`UPDATE "File" SET "userId" = ${userId} WHERE id = ${file.id}`;

        if (embedding.length) {
          const vectorStr = `[${embedding.join(",")}]`;
          await prisma.$executeRawUnsafe(
            `UPDATE "File" SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            file.id
          );
        }

        return { path: f.filePath, name: fileName, summary };
      })
    );

    return Response.json({ results });
  } catch (error: unknown) {
    console.error("[ingest/batch] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
