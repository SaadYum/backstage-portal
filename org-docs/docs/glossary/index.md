# Glossary and Domain Model

## Shared terms

| Term | Meaning |
|---|---|
| `ContentItem` | A publishable unit of content created and managed by authors. |
| `PublishJob` | The asynchronous workflow that validates and publishes a content item. |
| `publisher-service` | Backend service that owns the content lifecycle API and publish orchestration. |
| `platform-lib` | Shared library that provides common models, helpers, and service clients. |
| `console-ui` | Operator-facing UI for monitoring jobs and platform health. |
| `manager-ui` | Author-facing UI for creating, editing, and scheduling content. |
| `Org Knowledge Base` | The central `org-docs` experience plus machine-readable metadata and generated indices. |

## Why this matters

Using the same domain terms across specs, registry entries, contracts, and runbooks improves both human understanding and future retrieval quality.
