# publisher-service

## Purpose

`publisher-service` is the core backend service of the publishing platform. It handles content ingestion from upstream sources, orchestrates processing pipelines (validation, transformation, enrichment), and exposes a REST API consumed by both frontend applications.

## Ownership

| Attribute | Value               |
|-----------|---------------------|
| Team      | team-backend        |
| Lifecycle | production          |
| Type      | service             |
| System    | publishing-platform |

## How to Run

### Prerequisites

- Node.js ≥ 20
- `platform-lib` installed (see `dependsOn` in catalog)

### Start in development mode

```bash
cd catalog/components/publisher-service
npm install
npm run dev          # starts on http://localhost:4000
```

### Environment variables

| Variable            | Required | Default               | Description                          |
|---------------------|----------|-----------------------|--------------------------------------|
| `PORT`              | No       | `4000`                | HTTP port to listen on               |
| `LOG_LEVEL`         | No       | `info`                | Pino log level                       |
| `DB_URL`            | Yes      | —                     | PostgreSQL connection string         |
| `CONTENT_BUCKET`    | Yes      | —                     | Object-storage bucket name           |
| `AUTH_SECRET`       | Yes      | —                     | Shared secret for bearer-token auth  |

## Dependencies

| Component     | Type     | Reason                                      |
|---------------|----------|---------------------------------------------|
| platform-lib  | library  | HTTP client, data models, error classes     |

## Architecture

```
Client (console-ui / manager-ui)
        │  HTTP / Bearer token
        ▼
  publisher-service
        │
        ├── ContentIngestionPipeline
        │       └── validates → transforms → stores
        │
        ├── PostgreSQL (persistence)
        └── Object Storage (binary assets)
```
