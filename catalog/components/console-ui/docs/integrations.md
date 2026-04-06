# console-ui — Integrations

`console-ui` communicates exclusively with **publisher-service** over its REST API. No other backend services are called directly.

---

## publisher-service Integration

**Base URL:** `http://localhost:4000/api/v1` (configurable via `VITE_API_BASE_URL`)  
**Auth:** `Authorization: Bearer <token>`

### Endpoints Used

| Method | Path                         | Feature in console-ui         | Why it is needed                                                    |
|--------|------------------------------|-------------------------------|---------------------------------------------------------------------|
| GET    | `/content`                   | Content List page             | Populate the paginated table of all content items                   |
| GET    | `/content/{id}`              | Content Detail drawer         | Load full metadata and body for a selected item                     |
| POST   | `/content/{id}/publish`      | Retry / Publish button        | Manually trigger the publish pipeline for an item                   |
| GET    | `/content/{id}/status`       | Pipeline status badge         | Poll (every 5 s) for the latest pipeline status of an in-flight job |
| GET    | `/health`                    | Health dashboard widget       | Display uptime and version; shows degraded banner if status ≠ `ok`  |

### Error Handling

All API errors surface a toast notification using the `error.message` field from the response body. Network failures trigger a full-page retry prompt after three consecutive failures.

### Authentication Flow

On startup the app reads `VITE_AUTH_TOKEN` from the environment and attaches it as a Bearer header on every request. In production the token is injected by the container runtime from a secret store — no token is stored in the browser.
