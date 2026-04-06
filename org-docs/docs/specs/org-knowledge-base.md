# Org Knowledge Base Specification

- **Spec ID:** `product:org-knowledge-base`
- **Status:** active
- **Canonical docs owner:** `team-backend`

## Problem statement

The original demo relied too heavily on a live chat experience. That made the system harder to explain, harder to trust, and harder to keep current. The replacement goal is a documentation-first knowledge base that stays useful even without an LLM in the loop.

## Non-goals

- Building a full enterprise-wide repo crawler in this repository
- Replacing per-repo docs with a single monolithic markdown file
- Depending on a live RAG pipeline to make the demo understandable

## User journeys

1. An engineer opens `org-docs` and quickly understands what repositories exist and who owns them.
2. A product or platform lead navigates from a spec to the repos and folders that implement it.
3. An automation job reads `repo.yaml` and `org-index.yaml` to build a searchable inventory.
4. A future LLM or retrieval system indexes these docs in stable chunks without rewriting the structure.

## Functional requirements

- Provide a single stable documentation entrypoint.
- Standardize machine-readable repo metadata via `repo.yaml`.
- Generate a machine-ingestible org index.
- Keep human-readable registry pages and machine-readable artifacts in sync.
- Validate freshness in CI on pushes, pull requests, and a nightly schedule.

## Data model

The minimal knowledge model includes:

- repositories
- owners
- lifecycle
- dependencies
- interfaces
- products
- contracts
- runbooks

## Edge cases

- Missing `repo.yaml` fields must fail validation.
- Generated files drifting from source docs must fail validation.
- A repo with no internal dependencies must still appear in the registry with an explicit `none` dependency state.

## Metrics and rollout

- **Demo success metric:** a reviewer can answer ownership, dependency, and implementation-mapping questions by starting in `org-docs`.
- **Freshness metric:** CI fails when generated knowledge-base artifacts are stale.
- **Rollout:** start with this repository, then replicate the metadata contract to additional repos.

## Implementation mapping

| Capability | Repository / path |
|---|---|
| Org TechDocs shell | `/home/runner/work/backstage-portal/backstage-portal/org-docs` |
| Repo metadata contract | `/home/runner/work/backstage-portal/backstage-portal/repo.yaml` |
| Generated index and registry | `/home/runner/work/backstage-portal/backstage-portal/scripts/generate_org_knowledge_base.py` |
| Backstage catalog metadata inputs | `/home/runner/work/backstage-portal/backstage-portal/catalog/*.yaml` |
