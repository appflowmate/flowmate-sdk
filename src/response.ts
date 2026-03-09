import type { FlowMateResponse, ResponseOptions } from "./types.ts";
import { validateHttpsUrl } from "./validation.ts";

/**
 * Build a single FlowMate response.
 *
 * @example
 * ```ts
 * response({ msg: "Hello!" })
 * // => { msg: "Hello!" }
 *
 * response({ msg: "Done", shortcut: "BackupPhotos", data: { count: 42 } })
 * // => { msg: "Done", shortcut: "BackupPhotos", data: { count: 42 } }
 * ```
 */
export function response(options: ResponseOptions): FlowMateResponse {
  if (!options.msg && options.msg !== "") {
    throw new Error("msg is required");
  }

  const res: FlowMateResponse = { msg: options.msg };

  if (options.shortcut !== undefined) {
    if (typeof options.shortcut !== "string" || options.shortcut.length === 0) {
      throw new Error("shortcut must be a non-empty string");
    }
    res.shortcut = options.shortcut;
  }

  if (options.data !== undefined) {
    res.data = options.data;
  }

  if (options.url !== undefined) {
    res.url = validateHttpsUrl(options.url);
  }

  return res;
}

/**
 * Build an array of FlowMate responses (multi-action).
 * FlowMate executes shortcuts sequentially in order.
 *
 * @example
 * ```ts
 * responses([
 *   { msg: "Starting backup...", shortcut: "BackupPhotos" },
 *   { msg: "Uploading...", shortcut: "UploadToCloud", data: { dest: "s3" } }
 * ])
 * ```
 */
export function responses(items: ResponseOptions[]): FlowMateResponse[] {
  if (items.length === 0) {
    throw new Error("At least one response is required");
  }
  return items.map(response);
}

/**
 * Build a simple text-only response.
 *
 * @example
 * ```ts
 * text("Hello from the server!")
 * // => [{ msg: "Hello from the server!" }]
 * ```
 */
export function text(msg: string): FlowMateResponse[] {
  return [response({ msg })];
}

/**
 * Build a response that triggers a Shortcut.
 *
 * @example
 * ```ts
 * shortcut("Play Music", "PlaySpotify", { playlist: "chill" })
 * // => [{ msg: "Play Music", shortcut: "PlaySpotify", data: { playlist: "chill" } }]
 * ```
 */
export function shortcut(
  msg: string,
  name: string,
  data?: Record<string, unknown>
): FlowMateResponse[] {
  return [response({ msg, shortcut: name, data })];
}

/**
 * Serialize responses to a JSON string ready to send.
 * Returns the standard FlowMate array format.
 */
export function toJSON(items: FlowMateResponse[]): string {
  return JSON.stringify(items);
}

/**
 * Create a Response object ready to return from a server handler.
 * Sets Content-Type to application/json.
 */
export function toResponse(
  items: FlowMateResponse[],
  status = 200
): Response {
  return new Response(toJSON(items), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
