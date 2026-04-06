# manager-ui

## Purpose

`manager-ui` is the content manager portal for the publishing platform. It gives content authors and editors a rich interface for drafting, scheduling, previewing, and submitting content for publication.

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
cd catalog/components/manager-ui
npm install
npm run dev          # Vite dev server on http://localhost:5174
```

### Environment variables

| Variable              | Default                        | Description                             |
|-----------------------|--------------------------------|-----------------------------------------|
| `VITE_API_BASE_URL`   | `http://localhost:4000/api/v1` | Base URL for publisher-service REST API |
| `VITE_AUTH_TOKEN`     | `dev-token`                    | Bearer token for local development      |

## Dependencies

| Component         | Type    | Reason                                                      |
|-------------------|---------|-------------------------------------------------------------|
| publisher-service | service | All content CRUD and publish operations go through the publisher-service REST API |

## Key Features

- **Rich text editor** — markdown-based editor with live preview
- **Scheduling** — pick a `scheduledAt` datetime to auto-publish content
- **Draft / publish workflow** — save as draft, then submit for publishing
- **Tag management** — add and remove tags with autocomplete
- **Revision history** — view previous versions of a content item
