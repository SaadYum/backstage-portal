# Docs Chat

## How it works

Docs Chat adds a Backstage page and backend API that answer questions using retrieved documentation snippets.

1. The backend indexes Markdown files from `org-docs/docs/**` and component docs under `catalog/components/**/docs/**`.
2. Files are chunked by headings, and each chunk keeps the source file, page, and heading metadata.
3. On each question, the backend retrieves the most relevant chunks and sends only those snippets to GitHub Models.
4. The UI renders the answer along with clickable TechDocs source links.

## Live indexing

Docs Chat watches the docs directories at runtime. Editing a Markdown file automatically triggers an incremental reindex so results update without restarting Backstage.

Use these endpoints for troubleshooting:

- `GET /api/docs-chat/status` — current index version, last indexed time, chunk count
- `POST /api/docs-chat/reindex` — force a full reindex
- `POST /api/docs-chat/query` — ask a question using `{ "question": "..." }`

## Required environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_MODELS_TOKEN` | Optional | Enables grounded answer generation through GitHub Models |
| `GITHUB_MODELS_MODEL` | Optional | Overrides the default model (`openai/gpt-4.1-mini`) |
| `GITHUB_MODELS_ENDPOINT` | Optional | Overrides the default chat completions endpoint |

If `GITHUB_MODELS_TOKEN` is missing, Docs Chat still returns relevant sources and a clear message that the LLM is unavailable.

## Example questions

- Which components depend on `publisher-service`?
- How does `manager-ui` use the publisher API?
- What authentication does `publisher-service` require?
- Where is the TechDocs content for `platform-lib` stored?
- What docs are missing if I ask about a capability that is not documented yet?

## Status endpoint verification

Editing a watched Markdown file increments the Docs Chat index version without restarting Backstage.
