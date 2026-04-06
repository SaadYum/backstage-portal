# Architecture Overview

The demo organization has two layers of architecture:

1. **Publishing Platform** — the product system represented by the sample component repos in the Backstage catalog.
2. **Org Knowledge Base** — the documentation layer that indexes those repos, their contracts, and shared operating knowledge.

## Publishing Platform landscape

```text
platform-lib ──► publisher-service ──► console-ui
                              └──────► manager-ui
platform-infra supports deployment, environments, and operations across the stack.
```

## Knowledge flow

```text
repo.yaml + catalog/*.yaml + TechDocs markdown + contract artifacts
                     │
                     ▼
      scripts/generate_org_knowledge_base.py
                     │
        ├── org-docs/org-index.yaml
        └── org-docs/docs/repository-registry.md
                     │
                     ▼
       TechDocs renders a single org-level entrypoint
```

## Architectural decisions

- **Canonical entrypoint:** `org-docs` is the first place humans and automation should look.
- **Strict metadata:** `repo.yaml` defines the stable machine contract for repo identity, ownership, dependencies, interfaces, and environments.
- **Contracts over prose:** important integrations should be represented by deterministic artifacts such as OpenAPI.
- **Generated inventory:** the registry and index are generated so the human and machine views stay aligned.

## Implementation boundaries

| Area | Primary paths |
|---|---|
| Org Knowledge Base shell | `org-docs/**` |
| Generator and validation logic | `scripts/generate_org_knowledge_base.py` |
| Repository metadata example | `repo.yaml` |
| Product component docs | `catalog/components/*/docs/**` |
| Ownership and lifecycle metadata | `catalog/backend-components.yaml`, `catalog/frontend-components.yaml`, `catalog/groups.yaml` |
