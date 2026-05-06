import { Platform } from "react-native";

const defaultApiBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || defaultApiBaseUrl
).replace(/\/+$/, "");

type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: string | null;
};

type AuthResponse = {
  user?: AuthUser;
  session?: unknown;
  token?: string;
};

type ApiErrorBody = {
  error?: string | { message?: string };
  message?: string;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function readBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (typeof body !== "object" || body === null) {
    return fallback;
  }

  const apiBody = body as ApiErrorBody;

  if (typeof apiBody.error === "string") {
    return apiBody.error;
  }

  if (
    typeof apiBody.error === "object" &&
    apiBody.error !== null &&
    typeof apiBody.error.message === "string"
  ) {
    return apiBody.error.message;
  }

  if (typeof apiBody.message === "string") {
    return apiBody.message;
  }

  return fallback;
}

async function postAuth(path: string, body: object) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const responseBody = await readBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(responseBody, "The request failed. Please try again."),
    );
  }

  return responseBody as AuthResponse;
}

export function signInWithEmail(email: string, password: string) {
  return postAuth("/api/sign-in", { email, password });
}

export function signUpWithEmail(
  name: string,
  username: string,
  email: string,
  password: string,
) {
  return postAuth("/api/sign-up", { name, username, email, password });
}

export function signOut() {
  return postAuth("/api/sign-out", {});
}

/** Strips <think>...</think> reasoning blocks emitted by qwen models. */
function stripThinkBlocks(text: string): string {
  let out = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const openIdx = out.indexOf("<think>");
  if (openIdx !== -1) out = out.slice(0, openIdx);
  return out.trimStart();
}

/**
 * Streams a chat message to /api/chat, calling onChunk with each
 * progressive text update (think-blocks already stripped).
 */
export async function streamChatMessage(
  message: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: "POST",
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    if (response.status === 401)
      throw new ApiError(401, "Please sign in again.");
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new ApiError(
        429,
        retryAfter
          ? "Sending too fast — please wait a moment."
          : "Daily limit reached. Try again tomorrow.",
      );
    }
    throw new ApiError(response.status, "Something went wrong. Please try again.");
  }

  if (!response.body) {
    throw new ApiError(500, "No response stream received.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(stripThinkBlocks(accumulated));
  }
}

export { apiBaseUrl };
