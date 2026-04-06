# console-ui

## Purpose

`console-ui` is the internal operations console for the publishing platform. It gives platform operators real-time visibility into content pipelines, lets them manually trigger or retry publish jobs, and surfaces system health metrics.

## Ownership

| Attribute | Value               |
|-----------|---------------------|
| Team      | team-frontend       |
| Lifecycle | production          |
| Type      | website             |
| System    | publishing-platform |

## How to Run

### Prerequisites

- Node.js ≥ 20
- `publisher-service` running on `http://localhost:4000` (or configure `VITE_API_BASE_URL`)

### Start in development mode

```bash
cd catalog/components/console-ui
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

### Environment variables

| Variable              | Default                        | Description                             |
|-----------------------|--------------------------------|-----------------------------------------|
| `VITE_API_BASE_URL`   | `http://localhost:4000/api/v1` | Base URL for publisher-service REST API |
| `VITE_AUTH_TOKEN`     | `dev-token`                    | Bearer token for local development      |

## Dependencies

| Component         | Type    | Reason                                                |
|-------------------|---------|-------------------------------------------------------|
| publisher-service | service | All content data and pipeline operations are fetched from the publisher-service REST API |

## Key Features

- **Pipeline monitor** — live status table of all in-progress and recent publish jobs
- **Content list** — paginated, searchable view of all content items
- **Retry/cancel controls** — operator actions on individual jobs
- **Health dashboard** — uptime and error-rate charts sourced from the `/health` endpoint
