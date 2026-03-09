# flowmate-sdk

SDK for building [FlowMate](https://flow-mate.app)-compatible server responses. Parse incoming requests from the FlowMate iOS app and build properly formatted responses — including text messages, iOS Shortcut triggers, data payloads, and URLs.

## Install

```bash
bun add flowmate-sdk
```

```bash
npm install flowmate-sdk
```

## Quick Start

```ts
import { parseRequest, text, toResponse } from "flowmate-sdk";

Bun.serve({
  port: 3000,
  async fetch(req) {
    const { sessionId, chatInput } = parseRequest(await req.json());
    return toResponse(text(`Echo: ${chatInput}`));
  },
});
```

## API

### Response Builders

#### `text(msg)`

Build a simple text response.

```ts
import { text } from "flowmate-sdk";

text("Hello from the server!");
// => [{ msg: "Hello from the server!" }]
```

#### `shortcut(msg, name, data?)`

Build a response that triggers an iOS Shortcut.

```ts
import { shortcut } from "flowmate-sdk";

shortcut("Starting backup...", "BackupPhotos", { destination: "icloud" });
// => [{ msg: "Starting backup...", shortcut: "BackupPhotos", data: { destination: "icloud" } }]
```

#### `response(options)`

Build a single response with full control over all fields.

```ts
import { response } from "flowmate-sdk";

response({
  msg: "File ready",
  shortcut: "OpenFile",
  data: { path: "/documents/report.pdf" },
  url: "https://example.com/report.pdf",
});
```

#### `responses(items)`

Build multiple responses for sequential Shortcut execution. FlowMate runs them in order, passing results between Shortcuts.

```ts
import { responses } from "flowmate-sdk";

responses([
  { msg: "Downloading...", shortcut: "DownloadFile", data: { id: 42 } },
  { msg: "Processing...", shortcut: "ConvertToPDF" },
  { msg: "Done!", shortcut: "ShareFile" },
]);
```

### Serialization

#### `toJSON(items)`

Serialize responses to a JSON string.

```ts
import { response, toJSON } from "flowmate-sdk";

const json = toJSON([response({ msg: "Hello" })]);
// => '[{"msg":"Hello"}]'
```

#### `toResponse(items, status?)`

Create a `Response` object with `Content-Type: application/json`. Ready to return from any server handler.

```ts
import { text, toResponse } from "flowmate-sdk";

toResponse(text("Hello"));
// => Response { status: 200, headers: { "Content-Type": "application/json" } }

toResponse(text("Created"), 201);
// => Response { status: 201, ... }
```

### Request Parsing

#### `parseRequest(body)`

Parse and validate an incoming FlowMate request. Accepts a JSON string, `Uint8Array`, or already-parsed object.

```ts
import { parseRequest } from "flowmate-sdk";

const { sessionId, chatInput } = parseRequest(await req.json());
```

Validates:
- `sessionId` is a valid UUID
- `chatInput` is a non-empty string (max 10,000 characters)

#### `extractBearerToken(header)`

Extract the token from an `Authorization: Bearer <token>` header.

```ts
import { extractBearerToken } from "flowmate-sdk";

const token = extractBearerToken(req.headers.get("Authorization"));
if (token !== process.env.AUTH_TOKEN) {
  return new Response("Unauthorized", { status: 401 });
}
```

#### `validateHttpsUrl(url)`

Validate that a URL uses HTTPS. FlowMate rejects non-HTTPS URLs.

```ts
import { validateHttpsUrl } from "flowmate-sdk";

validateHttpsUrl("https://example.com"); // => "https://example.com"
validateHttpsUrl("http://example.com"); // throws Error
```

## Protocol Reference

### Request Format

FlowMate sends a POST request with a JSON array:

```json
[
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "action": "sendMessage",
    "chatInput": "Hello server"
  }
]
```

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

### Response Format

The server must return a JSON array of response objects:

```json
[
  {
    "msg": "Message to display in chat",
    "shortcut": "ShortcutName",
    "data": { "key": "value" },
    "url": "https://example.com"
  }
]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `msg` | string | Yes | Message displayed in the FlowMate chat |
| `shortcut` | string | No | Name of the iOS Shortcut to trigger |
| `data` | object | No | Arbitrary data passed to the Shortcut |
| `url` | string | No | HTTPS URL associated with the response |

**Multiple actions:** Return multiple objects in the array. FlowMate executes shortcuts sequentially, in order.

## Example: Full Server

```ts
import { parseRequest, extractBearerToken, text, shortcut, responses, toResponse } from "flowmate-sdk";

const AUTH_TOKEN = process.env.AUTH_TOKEN!;

Bun.serve({
  port: 3000,
  async fetch(req) {
    // Authenticate
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (token !== AUTH_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse request
    const { sessionId, chatInput } = parseRequest(await req.json());
    const command = chatInput.toLowerCase().trim();

    // Route commands
    if (command === "backup") {
      return toResponse(
        shortcut("Starting backup...", "BackupPhotos", { date: new Date().toISOString() })
      );
    }

    if (command === "deploy") {
      return toResponse(
        responses([
          { msg: "Running tests...", shortcut: "RunTests" },
          { msg: "Building...", shortcut: "BuildProject" },
          { msg: "Deployed!", shortcut: "NotifyTeam", data: { channel: "general" } },
        ])
      );
    }

    return toResponse(text(`You said: ${chatInput}`));
  },
});
```

## TypeScript Types

All types are exported for use in your own code:

```ts
import type {
  FlowMateRequest,
  FlowMateResponse,
  ResponseOptions,
  ParsedRequest,
} from "flowmate-sdk";
```

## Requirements

- Bun >= 1.0 or Node.js >= 18
- TypeScript >= 5 (optional, for type checking)

## License

MIT
