import {
  MODEL_MAP,
  type ModelName,
  streamWithFallback,
  groqQwen,
  groqLarge,
  groqFast,
} from "@/lib/ai/groq";
import { prisma } from "@cortexpath/database";
import { getSessionFromRequest } from "@/lib/get-session";
import { recordUsage, checkUsageStatus } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the CortexPath Lead AI Engineer. You have been given the REAL code, file path, imports, exports, and dependency graph for a file in this project. Use all of this information to produce a highly accurate, personalized analysis. Do NOT make assumptions — derive every insight directly from the actual code and metadata provided.

Generate a structured summary using EXACTLY this format:

### 1. ARCHITECTURAL BLUEPRINT
- **Role**: Identify the architectural role (e.g., Data Ingress Layer, UI Component, API Middleware, Edge Function)
- **Context**: Where this file sits in the monorepo hierarchy and which services it communicates with
- **Complexity**: Rate 1–10 based on cyclomatic complexity and number of dependencies

### 2. LOGICAL NARRATIVE
- **The Mission**: 2-sentence plain-English summary of what this file exists to do and why
- **Mechanics**: Brief technical flow — the key functions, hooks, or classes and how they chain together
- **Mentor Moment**: Identify one design pattern or technical concept used here and explain it concisely so the developer learns something new

### 3. SECURITY & RESILIENCE
- **Observation**: Identify one concrete security risk, missing validation, or resilience gap
- **Enhancement**: Provide a specific fix or code snippet to address it

### 4. OPTIMIZATION
- **Observation**: Identify one performance bottleneck or inefficiency (e.g., unnecessary re-renders, N+1 queries, blocking operations)
- **Tuning**: Suggest a more efficient approach with reasoning

### 5. SYSTEM DESIGN
- **Standard**: Evaluate against one SOLID or DRY principle — does this file follow it? Where does it break?
- **Standardization**: State whether this logic belongs in /packages/shared for the Mobile Librarian app to reuse

### 6. BLAST RADIUS & IMPACT
- **Fragility Score**: Rate 1–10 — how catastrophic is a bug in this file to the rest of the system?
- **Downstream Ripple**: Which components, routes, or services directly depend on this file and would break if it changed?

### 7. SUSTAINABILITY & FINOPS
- **Efficiency Index**: Rate A–F — how lean is this file in terms of compute, memory, and I/O usage?
- **Predicted Cloud Cost**: Estimate Low / Med / High based on operations performed (e.g., LLM calls, DB writes, vector searches, cold-start risk)

### 8. MENTOR CHALLENGE
- **Current Level**: Identify where this file sits on Bloom's Taxonomy (e.g., Remembering, Understanding, Applying, Analyzing, Evaluating, Creating)
- **The Leap**: Give one specific, actionable refactor challenge that would push the developer one level higher on the taxonomy

Use a terminal-chic tone: professional, precise, and insightful. No filler. Teach, don't describe.`;

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    const userId = session.user.id;

    const {
      fileName,
      filePath,
      codeSnippet,
      model = "qwen/qwen3-32b",
    } = (await req.json()) as {
      fileName: string;
      filePath: string;
      codeSnippet: string;
      model?: ModelName;
    };

    // 1. Check DB-backed rate limits for the requested model
    const usageCheck = await checkUsageStatus(userId, model);
    if (usageCheck.status === "denied") {
      return new Response(
        JSON.stringify({ error: `Daily limit reached for ${model}.` }),
        { status: 429 },
      );
    }

    // 2. Fetch metadata
    let imports: string[] = [];
    let exports: string[] = [];
    let impactedBy: string[] = [];
    if (filePath) {
      const [fileRows, rippleRows] = await Promise.all([
        prisma.$queryRaw<{ imports: string[]; exports: string[] }[]>`
          SELECT imports, exports FROM "File"
          WHERE path = ${filePath} AND "userId" = ${userId} LIMIT 1
        `,
        prisma.$queryRaw<{ path: string }[]>`
          SELECT path FROM "File"
          WHERE ${filePath} = ANY(imports) AND "userId" = ${userId} LIMIT 30
        `,
      ]);
      if (fileRows[0]) {
        imports = fileRows[0].imports ?? [];
        exports = fileRows[0].exports ?? [];
      }
      impactedBy = rippleRows.map((r: { path: string }) => r.path);
    }

    const contextBlock = [
      `File path : ${filePath || fileName}`,
      imports.length ? `Imports   : ${imports.join(", ")}` : null,
      exports.length ? `Exports   : ${exports.join(", ")}` : null,
      impactedBy.length
        ? `Depended on by: ${impactedBy.join(", ")}`
        : "Depended on by: (no other file imports this one)",
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `${contextBlock}\n\n\`\`\`\n${codeSnippet}\n\`\`\``;

    // 3. Define fallback chain based on selected model
    let chain = [groqQwen, groqLarge, groqFast];
    if (model === "llama-3.3-70b-versatile") chain = [groqLarge, groqFast];
    if (model === "llama-3.1-8b-instant") chain = [groqFast];

    // 4. Stream with fallback
    const result = await streamWithFallback(
      {
        system: SYSTEM_PROMPT,
        prompt,
        onFinish: async (event) => {
          // Record usage for the model that actually finished
          // The SDK provides the model name/ID in the event
          const finishedModel =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (event as any).modelId || (event as any).model || model;
          await recordUsage(
            userId,
            String(finishedModel),
            event.usage.totalTokens,
          );
        },
      },
      chain,
    );

    return result.toTextStreamResponse({
      headers: {
        "X-Usage-Status": usageCheck.status,
      },
    });
  } catch (error: unknown) {
    console.error("[API Interpret] Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
