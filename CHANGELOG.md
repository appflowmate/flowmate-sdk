# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-09

### Added

- `response()` — build a single FlowMate response with msg, shortcut, data, and url
- `responses()` — build multiple sequential responses (multi-action)
- `text()` — shorthand for text-only responses
- `shortcut()` — shorthand for shortcut-triggering responses
- `toJSON()` — serialize responses to JSON string
- `toResponse()` — create a `Response` object ready for server handlers
- `parseRequest()` — parse and validate incoming FlowMate requests
- `validateHttpsUrl()` — validate HTTPS-only URLs
- `extractBearerToken()` — extract Bearer token from Authorization header
- Full TypeScript type definitions for the FlowMate protocol
