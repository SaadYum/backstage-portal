# Backstage Portal

A fully local [Backstage](https://backstage.io) developer portal demo with [TechDocs](https://backstage.io/docs/features/techdocs/) powered by MkDocs. The primary demo experience is now an **Org Knowledge Base** built around `org-docs`, strict repo metadata, and generated org-level indexing.

---

## Quick start

### 1. Prerequisites

| Tool | Minimum version | Install guide |
|---|---|---|
| Node.js | 20 | https://nodejs.org |
| Yarn | 4.x via Corepack | `corepack enable` |
| Python | 3.9 | https://www.python.org/downloads/ |
| pip | 21 | bundled with Python ≥ 3.4 |

### 2. Install TechDocs MkDocs plugin (once)

```bash
pip3 install mkdocs-techdocs-core
```

### 3. Install Node dependencies (once)

```bash
yarn install
```

### 4. Run locally

```bash
yarn dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:7007 |

Open **http://localhost:3000**. The catalog is pre-populated from the local `catalog/` directory and `org-docs` is registered as the central documentation component.

---

## Org Knowledge Base

The knowledge base is intentionally docs-first:

- **Canonical entrypoint:** `org-docs/`
- **Per-repo machine metadata:** `repo.yaml`
- **Generated machine index:** `org-docs/org-index.yaml`
- **Generated human registry:** `org-docs/docs/repository-registry.md`
- **Cross-repo contract artifact:** `org-docs/contracts/publisher-service.openapi.yaml`

### Knowledge-base sections

- Repository registry
- Architecture overview
- Product specs
- Contracts
- Runbooks
- Glossary/domain model
- Metadata schema

### Automation

`python3 scripts/generate_org_knowledge_base.py` validates the root `repo.yaml`, reads catalog metadata, and regenerates the org-level artifacts. CI runs the same generator in `--check` mode to catch stale files.

## Repository layout

```text
backstage-portal/
├── packages/
│   ├── app/                    # Backstage React frontend
│   └── backend/                # Backstage backend
├── catalog/                    # Sample catalog entities + component TechDocs
│   ├── groups.yaml
│   ├── backend-components.yaml
│   ├── frontend-components.yaml
│   └── components/
├── org-docs/                   # Canonical Org Knowledge Base TechDocs site
│   ├── docs/
│   ├── contracts/
│   └── org-index.yaml
├── scripts/
│   └── generate_org_knowledge_base.py
├── repo.yaml                   # Root repo metadata contract
├── docs/
│   └── demo-script.md
├── app-config.yaml
└── package.json
```

## Catalog entities represented in the demo

| Component | Kind | Owner | DependsOn |
|---|---|---|---|
| publishing-platform | System | team-backend | — |
| platform-lib | Component | team-backend | — |
| publisher-service | Component | team-backend | platform-lib |
| console-ui | Component | team-frontend | publisher-service |
| manager-ui | Component | team-frontend | publisher-service |
| platform-infra | Component | team-backend | — |

## Validation

The workflow at `.github/workflows/catalog-docs-check.yml` validates that:

- repo and catalog YAML remain valid
- generated knowledge-base artifacts are up to date
- required org-docs files exist
- every component and org-docs TechDocs site still builds

See [`docs/demo-script.md`](docs/demo-script.md) for a walkthrough of the docs-first demo flow.
