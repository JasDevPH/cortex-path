import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const result = await auth.api.signOut();

  return NextResponse.json(result);
}