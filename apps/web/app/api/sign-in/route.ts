import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();

  const result = await auth.api.signInEmail({
    body: {
      email: body.email,
      password: body.password,
    },
  });

  return NextResponse.json(result);
}