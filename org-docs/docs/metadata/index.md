# Repository Metadata Schema

Every repository should publish a small `repo.yaml` file with a stable structure. This is the primary machine-ingestible contract for ownership, lifecycle, dependencies, interfaces, and environments.

## Required fields

| Field | Purpose |
|---|---|
| `schema_version` | Version the metadata contract. |
| `name` | Canonical repo name. |
| `description` | Human-readable repo purpose. |
| `domain` | Business or platform domain. |
| `lifecycle` | Active, deprecated, or experimental state. |
| `owners` | Team ownership and communication channel. |
| `entrypoints` | Apps, services, packages, or docs roots exposed by the repo. |
| `dependencies` | Internal repos and external services relied on by the repo. |
| `interfaces` | Interfaces produced and consumed by the repo. |
| `security` | Auth, permissions, and data-sensitivity model. |
| `environments` | Environment names and deployment targets. |
| `runbook_links` | Operational docs references. |
| `dashboards` | Monitoring or observability links. |
| `slo_sla` | Reliability commitments when they exist. |

## Demo implementation

The canonical example in this repository lives at `/home/runner/work/backstage-portal/backstage-portal/repo.yaml`.

## Automation contract

`scripts/generate_org_knowledge_base.py` validates `repo.yaml`, reads catalog metadata, and regenerates:

- `org-docs/org-index.yaml`
- `org-docs/docs/repository-registry.md`

CI uses the same generator in `--check` mode so stale generated files fail the build.
