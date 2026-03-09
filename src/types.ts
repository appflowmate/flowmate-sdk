/**
 * FlowMate standard request format.
 * Sent as a JSON array: [FlowMateRequest]
 */
export interface FlowMateRequest {
  sessionId: string;
  action: "sendMessage";
  chatInput: string;
}

/**
 * A single response action from the server.
 * The server returns an array of these: FlowMateResponse[]
 */
export interface FlowMateResponse {
  /** Message to display in the chat. Required. */
  msg: string;
  /** iOS Shortcut name to trigger. Optional. */
  shortcut?: string;
  /** Arbitrary data payload passed to the Shortcut. Optional. */
  data?: Record<string, unknown>;
  /** HTTPS URL to associate with the response. Optional. Must be HTTPS. */
  url?: string;
}

/**
 * Server response wrapped in an "output" array.
 * Alternative format: [{ output: [FlowMateResponse] }]
 */
export interface FlowMateWrappedResponse {
  output: FlowMateResponse[];
}

/**
 * Options for the response builder.
 */
export interface ResponseOptions {
  /** Message to display. Required. */
  msg: string;
  /** Shortcut name to trigger. */
  shortcut?: string;
  /** Data payload for the shortcut. */
  data?: Record<string, unknown>;
  /** HTTPS URL. Will be validated. */
  url?: string;
}

/**
 * Parsed incoming request from FlowMate app.
 */
export interface ParsedRequest {
  sessionId: string;
  chatInput: string;
}
