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

export { apiBaseUrl };
