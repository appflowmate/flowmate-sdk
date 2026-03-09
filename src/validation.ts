import type { ParsedRequest } from "./types.ts";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse and validate an incoming FlowMate request body.
 * Expects a JSON array with one object: [{ sessionId, action, chatInput }]
 *
 * @param body - Raw request body (string, Buffer, or already parsed object)
 * @returns Parsed request with sessionId and chatInput
 * @throws Error if the request format is invalid
 */
export function parseRequest(body: unknown): ParsedRequest {
  let parsed: unknown;

  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body);
    } catch {
      throw new Error("Invalid JSON in request body");
    }
  } else if (body instanceof ArrayBuffer || body instanceof Uint8Array) {
    try {
      const text = new TextDecoder().decode(body);
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON in request body");
    }
  } else {
    parsed = body;
  }

  // FlowMate sends requests as an array
  const arr = Array.isArray(parsed) ? parsed : [parsed];

  const item = arr[0];
  if (!item || typeof item !== "object") {
    throw new Error("Request must contain at least one object");
  }

  const obj = item as Record<string, unknown>;

  const sessionId = obj.sessionId;
  if (typeof sessionId !== "string" || !UUID_REGEX.test(sessionId)) {
    throw new Error("sessionId must be a valid UUID");
  }

  const chatInput = obj.chatInput;
  if (typeof chatInput !== "string" || chatInput.length === 0) {
    throw new Error("chatInput must be a non-empty string");
  }

  if (chatInput.length > 10_000) {
    throw new Error("chatInput exceeds 10,000 character limit");
  }

  return { sessionId, chatInput };
}

/**
 * Validate that a URL is HTTPS.
 * FlowMate only accepts HTTPS URLs.
 */
export function validateHttpsUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`URL must be HTTPS, got: ${parsed.protocol}`);
  }

  return url;
}

/**
 * Extract the Bearer token from an Authorization header.
 *
 * @param header - The Authorization header value
 * @returns The token string, or null if not a Bearer token
 */
export function extractBearerToken(
  header: string | null | undefined
): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}
