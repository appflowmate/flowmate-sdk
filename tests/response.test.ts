import { describe, expect, test } from "bun:test";
import { response, responses, text, shortcut, toJSON, toResponse } from "../src/index.js";

describe("response", () => {
  test("builds a simple text response", () => {
    const res = response({ msg: "Hello!" });
    expect(res).toEqual({ msg: "Hello!" });
  });

  test("builds a response with shortcut", () => {
    const res = response({ msg: "Done", shortcut: "BackupPhotos" });
    expect(res).toEqual({ msg: "Done", shortcut: "BackupPhotos" });
  });

  test("builds a response with all fields", () => {
    const res = response({
      msg: "Done",
      shortcut: "Upload",
      data: { count: 42 },
      url: "https://example.com/result",
    });
    expect(res).toEqual({
      msg: "Done",
      shortcut: "Upload",
      data: { count: 42 },
      url: "https://example.com/result",
    });
  });

  test("allows empty string msg", () => {
    const res = response({ msg: "" });
    expect(res).toEqual({ msg: "" });
  });

  test("rejects HTTP url", () => {
    expect(() =>
      response({ msg: "test", url: "http://example.com" })
    ).toThrow("URL must be HTTPS");
  });

  test("rejects empty shortcut name", () => {
    expect(() => response({ msg: "test", shortcut: "" })).toThrow(
      "shortcut must be a non-empty string"
    );
  });
});

describe("responses", () => {
  test("builds multiple responses", () => {
    const res = responses([
      { msg: "Step 1", shortcut: "First" },
      { msg: "Step 2", shortcut: "Second", data: { key: "val" } },
    ]);
    expect(res).toHaveLength(2);
    expect(res[0]!.shortcut).toBe("First");
    expect(res[1]!.data).toEqual({ key: "val" });
  });

  test("rejects empty array", () => {
    expect(() => responses([])).toThrow("At least one response");
  });
});

describe("text", () => {
  test("builds a text-only response array", () => {
    const res = text("Hello!");
    expect(res).toEqual([{ msg: "Hello!" }]);
  });
});

describe("shortcut", () => {
  test("builds a shortcut response with data", () => {
    const res = shortcut("Playing", "PlayMusic", { playlist: "chill" });
    expect(res).toEqual([
      { msg: "Playing", shortcut: "PlayMusic", data: { playlist: "chill" } },
    ]);
  });

  test("builds a shortcut response without data", () => {
    const res = shortcut("Running", "MyShortcut");
    expect(res).toEqual([{ msg: "Running", shortcut: "MyShortcut" }]);
  });
});

describe("toJSON", () => {
  test("serializes responses to JSON", () => {
    const json = toJSON([{ msg: "Hi" }]);
    expect(JSON.parse(json)).toEqual([{ msg: "Hi" }]);
  });
});

describe("toResponse", () => {
  test("creates a Response with correct headers", () => {
    const res = toResponse([{ msg: "Hi" }]);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  test("supports custom status code", () => {
    const res = toResponse([{ msg: "Created" }], 201);
    expect(res.status).toBe(201);
  });
});
