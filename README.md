# Backstage Portal

A fully local [Backstage](https://backstage.io) developer portal demo with [TechDocs](https://backstage.io/docs/features/techdocs/) powered by MkDocs. Everything runs on your machine or inside a GitHub Space — no paid services required.

---

## Quick start

### 1. Prerequisites

| Tool           | Minimum version | Install guide                     |
|----------------|-----------------|-----------------------------------|
| Node.js        | 20              | https://nodejs.org                |
| Yarn (Classic) | 1.22            | `npm install -g yarn`             |
| Python         | 3.9             | https://www.python.org/downloads/ |
| pip            | 21              | bundled with Python ≥ 3.4         |

### 2. Install TechDocs MkDocs plugin (once)

```bash
pip3 install mkdocs-techdocs-core
```

### 3. Install Node dependencies (once)

```bash
yarn install
```

### 4. Run in Space / locally

```bash
export GITHUB_MODELS_TOKEN=your_github_models_token   # optional, enables grounded answers
yarn dev
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:7007 |

Open **http://localhost:3000** — the catalog is pre-populated on first boot.

If `GITHUB_MODELS_TOKEN` is not set, the Docs Chat page still works in source-only mode and returns the most relevant TechDocs links with a clear message that the LLM is unavailable.

---

## What's inside

```
backstage-portal/
├── packages/
│   ├── app/          # Backstage React frontend
│   └── backend/      # Backstage Node.js backend
├── catalog/          # Sample catalog entities (YAML) + TechDocs
│   ├── groups.yaml               # Groups: team-backend, team-frontend
│   ├── backend-components.yaml   # platform-lib, publisher-service
│   ├── frontend-components.yaml  # console-ui, manager-ui, platform-infra
│   └── components/
│       ├── platform-lib/         # mkdocs.yml + docs/
│       ├── publisher-service/    # mkdocs.yml + docs/ (incl. api.md)
│       ├── console-ui/           # mkdocs.yml + docs/ (incl. integrations.md)
│       ├── manager-ui/           # mkdocs.yml + docs/ (incl. integrations.md)
│       └── platform-infra/       # mkdocs.yml + docs/
├── docs/
│   └── demo-script.md   # Walk-through of the UI and LLM questions
├── examples/             # Backstage scaffold examples (kept as-is)
├── app-config.yaml       # Main Backstage config (TechDocs + catalog locations)
└── package.json          # Root workspace (yarn dev → backstage-cli repo start)
```

## Catalog entities

| Component           | Kind      | Owner         | DependsOn         |
|---------------------|-----------|---------------|-------------------|
| publishing-platform | System    | team-backend  | —                 |
| platform-lib        | Component | team-backend  | —                 |
| publisher-service   | Component | team-backend  | platform-lib      |
| console-ui          | Component | team-frontend | publisher-service |
| manager-ui          | Component | team-frontend | publisher-service |
| platform-infra      | Component | team-backend  | —                 |

## TechDocs

Each component has a `mkdocs.yml` and a `docs/` folder:

- `index.md` — purpose, ownership, how to run, dependencies
- `api.md` *(publisher-service only)* — REST API reference (Markdown, no OpenAPI)
- `integrations.md` *(console-ui, manager-ui)* — which endpoints each UI calls and why

See [`docs/demo-script.md`](docs/demo-script.md) for a full click-through guide.

## Docs Chat

- Open **Docs Chat** from the sidebar
- Ask a question about the docs
- Review the grounded answer and click through to TechDocs sources
- The backend watches `org-docs/docs/**` and `catalog/components/**/docs/**`; edits are re-indexed automatically without restarting Backstage

Docs Chat configuration is documented in [`org-docs/docs/docs-chat.md`](org-docs/docs/docs-chat.md).

## CI

A GitHub Actions workflow at `.github/workflows/catalog-docs-check.yml` runs on every push and pull request to verify:

- All YAML catalog files are valid
- All `mkdocs.yml` files reference existing `docs/index.md` files
