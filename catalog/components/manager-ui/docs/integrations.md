# manager-ui — Integrations

`manager-ui` communicates exclusively with **publisher-service** over its REST API. No other backend services are called directly.

---

## publisher-service Integration

**Base URL:** `http://localhost:4000/api/v1` (configurable via `VITE_API_BASE_URL`)  
**Auth:** `Authorization: Bearer <token>`

### Endpoints Used

| Method | Path                    | Feature in manager-ui           | Why it is needed                                                         |
|--------|-------------------------|---------------------------------|--------------------------------------------------------------------------|
| GET    | `/content`              | Content List / Dashboard        | Load the author's content items to populate the dashboard and list view  |
| POST   | `/content`              | New Article form                | Create a new draft content item after the author completes the form      |
| GET    | `/content/{id}`         | Edit Article page               | Load existing content body and metadata into the editor                  |
| PUT    | `/content/{id}`         | Save changes in editor          | Persist full updates when the author clicks Save                         |
| PATCH  | `/content/{id}`         | Scheduling / tag updates        | Apply partial updates (e.g., change `scheduledAt` or tags only)          |
| DELETE | `/content/{id}`         | Delete confirmation modal       | Permanently remove a content item at the author's request                |
| POST   | `/content/{id}/publish` | Publish button                  | Submit the item to the publish pipeline immediately                      |
| GET    | `/content/{id}/status`  | Publish progress indicator      | Poll (every 3 s) while a publish job is in flight to update the UI badge |

### Error Handling

Validation errors (HTTP 400/422) are displayed inline on the relevant form field using the `details` array from the error response. All other errors show a dismissible banner at the top of the page. After three consecutive network failures the app prompts the user to reload.

### Authentication Flow

On startup the app reads `VITE_AUTH_TOKEN` from the environment and attaches it as a Bearer header on every request. In production the token is injected by the container runtime from a secret store — no token is stored in the browser.
