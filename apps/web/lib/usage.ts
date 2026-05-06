import { prisma } from "@cortexpath/database";
import { MODEL_LIMITS, type ModelName } from "./ai/groq";

const THRESHOLD = 0.9; // 90%

export async function recordUsage(userId: string, model: string, tokens: number = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.usage.upsert({
      where: {
        userId_model_date: {
          userId,
          model,
          date: today,
        },
      },
      update: {
        requests: { increment: 1 },
        tokens: { increment: tokens },
      },
      create: {
        userId,
        model,
        date: today,
        requests: 1,
        tokens,
      },
    });
  } catch (err) {
    console.error("[recordUsage] Failed:", err);
  }
}

export async function checkUsageStatus(userId: string, model: ModelName) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usage = await prisma.usage.findUnique({
      where: {
        userId_model_date: {
          userId,
          model,
          date: today,
        },
      },
    });

    if (!usage) return { status: 'safe', rpdLeft: MODEL_LIMITS[model].rpd, tpdLeft: MODEL_LIMITS[model].tpd };

    const limits = MODEL_LIMITS[model];
    const rpdUsage = usage.requests / limits.rpd;
    const tpdUsage = usage.tokens / limits.tpd;

    if (rpdUsage >= 1 || tpdUsage >= 1) {
      return { status: 'denied', rpdLeft: 0, tpdLeft: 0 };
    }

    if (rpdUsage >= THRESHOLD || tpdUsage >= THRESHOLD) {
      return { status: 'verge', rpdLeft: limits.rpd - usage.requests, tpdLeft: limits.tpd - usage.tokens };
    }

    return { status: 'safe', rpdLeft: limits.rpd - usage.requests, tpdLeft: limits.tpd - usage.tokens };
  } catch (err) {
    console.error("[checkUsageStatus] Failed:", err);
    // Return a safe default to allow the request to proceed if usage tracking fails
    return { status: 'safe', rpdLeft: MODEL_LIMITS[model].rpd, tpdLeft: MODEL_LIMITS[model].tpd };
  }
}
