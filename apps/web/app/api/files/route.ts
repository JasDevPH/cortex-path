import { prisma } from '@cortexpath/database';
import { NextResponse } from 'next/server';
import { getSessionFromHeaders, getSessionFromRequest } from '@/lib/get-session';

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

type FileRow = { name: string; path: string; summary: string | null; logicSummary: string | null; imports: string[]; exports: string[]; content: string | null };

export async function GET() {
  try {
    const session = await getSessionFromHeaders();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const files = await prisma.$queryRaw<FileRow[]>`
      SELECT name, path, summary, "logicSummary", imports, exports, content
      FROM "File"
      WHERE "userId" = ${session.user.id}
      ORDER BY "updatedAt" DESC
    `;
    return NextResponse.json({ files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSessionFromHeaders();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.$executeRaw`DELETE FROM "File" WHERE "userId" = ${session.user.id}`;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { path, interpretation } = await req.json() as { path: string; interpretation: string };
    if (!path || !interpretation) {
      return NextResponse.json({ error: 'path and interpretation required' }, { status: 400 });
    }
    await prisma.$executeRaw`
      UPDATE "File" SET "logicSummary" = ${interpretation}, "updatedAt" = NOW()
      WHERE path = ${path} AND "userId" = ${session.user.id}
    `;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
