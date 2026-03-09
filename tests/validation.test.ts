import { describe, expect, test } from "bun:test";
import { parseRequest, validateHttpsUrl, extractBearerToken } from "../src/index.ts";

describe("parseRequest", () => {
  const validSessionId = "550e8400-e29b-41d4-a716-446655440000";

  test("parses a valid request array", () => {
    const body = JSON.stringify([
      { sessionId: validSessionId, action: "sendMessage", chatInput: "hello" },
    ]);
    const req = parseRequest(body);
    expect(req.sessionId).toBe(validSessionId);
    expect(req.chatInput).toBe("hello");
  });

  test("parses a single object (not wrapped in array)", () => {
    const body = {
      sessionId: validSessionId,
      action: "sendMessage",
      chatInput: "hello",
    };
    const req = parseRequest(body);
    expect(req.chatInput).toBe("hello");
  });

  test("parses Uint8Array body", () => {
    const json = JSON.stringify([
      { sessionId: validSessionId, action: "sendMessage", chatInput: "hello" },
    ]);
    const body = new TextEncoder().encode(json);
    const req = parseRequest(body);
    expect(req.chatInput).toBe("hello");
  });

  test("rejects invalid JSON string", () => {
    expect(() => parseRequest("not json")).toThrow("Invalid JSON");
  });

  test("rejects invalid sessionId", () => {
    const body = JSON.stringify([
      { sessionId: "not-a-uuid", action: "sendMessage", chatInput: "hello" },
    ]);
    expect(() => parseRequest(body)).toThrow("sessionId must be a valid UUID");
  });

  test("rejects empty chatInput", () => {
    const body = JSON.stringify([
      { sessionId: validSessionId, action: "sendMessage", chatInput: "" },
    ]);
    expect(() => parseRequest(body)).toThrow("chatInput must be a non-empty");
  });

  test("rejects chatInput over 10,000 chars", () => {
    const body = JSON.stringify([
      {
        sessionId: validSessionId,
        action: "sendMessage",
        chatInput: "a".repeat(10_001),
      },
    ]);
    expect(() => parseRequest(body)).toThrow("10,000 character limit");
  });

  test("rejects empty array", () => {
    expect(() => parseRequest([])).toThrow("at least one object");
  });
});

describe("validateHttpsUrl", () => {
  test("accepts HTTPS url", () => {
    expect(validateHttpsUrl("https://example.com")).toBe(
      "https://example.com"
    );
  });

  test("rejects HTTP url", () => {
    expect(() => validateHttpsUrl("http://example.com")).toThrow(
      "URL must be HTTPS"
    );
  });

  test("rejects invalid url", () => {
    expect(() => validateHttpsUrl("not a url")).toThrow("Invalid URL");
  });
});

describe("extractBearerToken", () => {
  test("extracts token from Bearer header", () => {
    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
  });

  test("is case-insensitive", () => {
    expect(extractBearerToken("bearer mytoken")).toBe("mytoken");
  });

  test("returns null for missing header", () => {
    expect(extractBearerToken(null)).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });

  test("returns null for non-Bearer auth", () => {
    expect(extractBearerToken("Basic abc123")).toBeNull();
  });
});
