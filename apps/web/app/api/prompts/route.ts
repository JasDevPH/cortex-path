import { prisma } from '@cortexpath/database';
import { NextResponse } from 'next/server';
import { getSessionFromHeaders, getSessionFromRequest } from '@/lib/get-session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getSessionFromHeaders();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await prisma.$queryRaw<
      { id: string; filePath: string; fileName: string; content: string; createdAt: Date }[]
    >`
      SELECT id, "filePath", "fileName", content, "createdAt"
      FROM "SavedPrompt"
      WHERE "userId" = ${session.user.id}
      ORDER BY "createdAt" DESC
    `;
    return NextResponse.json({ prompts: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { filePath, fileName, content } = await req.json() as {
      filePath: string;
      fileName: string;
      content: string;
    };
    if (!filePath || !content) {
      return NextResponse.json({ error: 'filePath and content required' }, { status: 400 });
    }
    await prisma.$executeRaw`
      INSERT INTO "SavedPrompt" (id, "filePath", "userId", "fileName", content, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${filePath}, ${session.user.id}, ${fileName}, ${content}, NOW(), NOW())
      ON CONFLICT ("filePath") DO UPDATE SET content = ${content}, "fileName" = ${fileName}, "userId" = ${session.user.id}, "updatedAt" = NOW()
    `;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
