# Org Knowledge Base

`org-docs` is the canonical entrypoint for the demo organization's shared knowledge. It is designed to be readable by humans, ingestible by machines, and easy to refresh automatically from repository metadata plus product source-of-truth docs.

## What lives here

- **Repository Registry** — inventory of repos, ownership, lifecycle, dependencies, and primary interfaces
- **Architecture** — org-level view of systems, boundaries, and knowledge flow
- **Product Specs** — versioned feature requirements with explicit implementation mappings
- **Contracts** — machine-readable APIs and cross-repo integration references
- **Runbooks** — deploy, incident, environment, and operational guidance
- **Glossary** — shared domain language used across product and engineering docs
- **Metadata Schema** — the `repo.yaml` contract used to keep repo inventory consistent

## Source-of-truth model

| Need | Canonical source |
|---|---|
| Org navigation | `org-docs/docs/**` |
| Machine-ingestible repo metadata | `/home/runner/work/backstage-portal/backstage-portal/repo.yaml` |
| Generated org index | `/home/runner/work/backstage-portal/backstage-portal/org-docs/org-index.yaml` |
| Per-repo technical docs | `catalog/components/*/docs/**` |
| Repo ownership and lifecycle | `catalog/*.yaml` and `repo.yaml` |
| Cross-repo HTTP contract | `org-docs/contracts/publisher-service.openapi.yaml` |

## Retrieval-friendly structure

Each document is scoped to a stable retrieval unit:

- `repo:<name>` for repository records in the generated registry and org index
- `product:<name>` for specs that map features to repositories
- `contract:<name>` for API and integration artifacts
- `doc:runbook:<name>` for operational procedures
- `doc:glossary:<name>` for shared language and domain terms

## Continuous freshness

A GitHub Actions workflow validates the metadata contract, regenerates the machine index, checks generated files into sync, and verifies that the TechDocs site still builds. This keeps the knowledge base demoable without relying on a live chat workflow.
