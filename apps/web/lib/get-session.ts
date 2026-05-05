import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/** Call in GET route handlers (no req param available). */
export async function getSessionFromHeaders() {
  return auth.api.getSession({ headers: await headers() });
}

/** Call in POST/PATCH route handlers where req is available. */
export async function getSessionFromRequest(req: Request) {
  return auth.api.getSession({ headers: req.headers });
}
