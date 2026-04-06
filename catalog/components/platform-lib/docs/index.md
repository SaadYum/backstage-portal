# platform-lib

## Purpose

`platform-lib` is the shared utility library for the publishing platform. It provides reusable helpers, data models, and service-client abstractions consumed by every other component in the system, ensuring consistency and reducing code duplication.

## Ownership

| Attribute | Value           |
|-----------|-----------------|
| Team      | team-backend    |
| Lifecycle | production      |
| Type      | library         |
| System    | publishing-platform |

## How to Install

Add the library as a dependency in your project:

```bash
# npm
npm install @platform/platform-lib

# yarn
yarn add @platform/platform-lib
```

## How to Run (development)

```bash
git clone <repo-url>
cd catalog/components/platform-lib
npm install
npm test           # unit tests
npm run build      # compile TypeScript → dist/
```

## Key Modules

| Module              | Description                                           |
|---------------------|-------------------------------------------------------|
| `src/models/`       | Shared TypeScript interfaces and types                |
| `src/http/`         | Typed HTTP client wrappers with retry/timeout support |
| `src/errors/`       | Standardised error classes used across all services   |
| `src/utils/`        | Date formatting, ID generation, validation helpers    |
| `src/config/`       | Environment-variable loader with schema validation    |

## Dependencies

This library has **no internal platform dependencies** — it is the foundation layer and only depends on third-party packages.

| Package         | Purpose                        |
|-----------------|--------------------------------|
| `zod`           | Runtime schema validation      |
| `axios`         | HTTP client                    |
| `dayjs`         | Date/time utilities            |
| `pino`          | Structured logging             |

## Versioning Policy

`platform-lib` follows semantic versioning. Breaking changes increment the major version and require a migration guide in `CHANGELOG.md`.
