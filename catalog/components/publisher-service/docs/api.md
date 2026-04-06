# publisher-service — REST API Reference

> **Format:** Markdown only (no OpenAPI/Swagger).  
> All request and response bodies are JSON unless noted otherwise.

---

## Base URL

```
http://localhost:4000/api/v1
```

In a deployed environment replace `localhost:4000` with the service's internal hostname.

---

## Authentication

All endpoints require a **Bearer token** in the `Authorization` header.

```
Authorization: Bearer <token>
```

Tokens are issued by the platform identity service. For local development, set `AUTH_SECRET` in your environment and use any non-empty string as the token (dev mode only).

---

## Endpoints

| Method | Path                          | Description                              |
|--------|-------------------------------|------------------------------------------|
| GET    | `/content`                    | List all content items (paginated)       |
| POST   | `/content`                    | Create a new content item                |
| GET    | `/content/{id}`               | Retrieve a single content item           |
| PUT    | `/content/{id}`               | Replace a content item                   |
| PATCH  | `/content/{id}`               | Partially update a content item          |
| DELETE | `/content/{id}`               | Delete a content item                    |
| POST   | `/content/{id}/publish`       | Trigger the publish pipeline for an item |
| GET    | `/content/{id}/status`        | Get the current pipeline status          |
| GET    | `/health`                     | Liveness probe (no auth required)        |

---

## Request / Response Examples

### `GET /content`

**Request**

```http
GET /api/v1/content?page=1&limit=20 HTTP/1.1
Host: localhost:4000
Authorization: Bearer <token>
```

**Response `200 OK`**

```json
{
  "data": [
    {
      "id": "cnt_01HX8Z",
      "title": "Introduction to Platform Publishing",
      "status": "draft",
      "owner": "guest",
      "createdAt": "2024-03-01T09:00:00Z",
      "updatedAt": "2024-03-15T14:22:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

### `POST /content`

**Request**

```http
POST /api/v1/content HTTP/1.1
Host: localhost:4000
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My New Article",
  "body": "Full markdown body here...",
  "tags": ["news", "platform"],
  "scheduledAt": null
}
```

**Response `201 Created`**

```json
{
  "id": "cnt_02JY9A",
  "title": "My New Article",
  "status": "draft",
  "owner": "guest",
  "createdAt": "2024-04-01T10:00:00Z",
  "updatedAt": "2024-04-01T10:00:00Z"
}
```

---

### `POST /content/{id}/publish`

**Request**

```http
POST /api/v1/content/cnt_02JY9A/publish HTTP/1.1
Host: localhost:4000
Authorization: Bearer <token>
```

**Response `202 Accepted`**

```json
{
  "jobId": "job_99ZZ1",
  "contentId": "cnt_02JY9A",
  "status": "queued",
  "estimatedCompletionSeconds": 15
}
```

---

### `GET /health`

**Request**

```http
GET /api/v1/health HTTP/1.1
Host: localhost:4000
```

**Response `200 OK`**

```json
{
  "status": "ok",
  "uptime": 3620,
  "version": "1.4.2"
}
```

---

## Error Codes

All errors return a JSON body with `error` and `message` fields.

| HTTP Status | Error Code            | Meaning                                                  |
|-------------|-----------------------|----------------------------------------------------------|
| 400         | `VALIDATION_ERROR`    | Request body or query parameter failed schema validation |
| 401         | `UNAUTHORIZED`        | Missing or invalid Bearer token                         |
| 403         | `FORBIDDEN`           | Token valid but insufficient permissions                 |
| 404         | `NOT_FOUND`           | The requested resource does not exist                    |
| 409         | `CONFLICT`            | Item is already in the requested state                   |
| 422         | `UNPROCESSABLE`       | Business-logic validation failure                        |
| 429         | `RATE_LIMITED`        | Too many requests — back off and retry                   |
| 500         | `INTERNAL_ERROR`      | Unexpected server error                                  |
| 503         | `SERVICE_UNAVAILABLE` | Downstream dependency unavailable                        |

**Example error response**

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Field 'title' is required and must be a non-empty string.",
  "details": [
    { "field": "title", "issue": "required" }
  ]
}
```
