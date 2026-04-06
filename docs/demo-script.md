# Backstage Portal — Org Knowledge Base Demo Script

This guide walks through the docs-first demo path for the Backstage portal.

---

## 1. Start Backstage

### Prerequisites

| Tool | Minimum version | How to check |
|---|---|---|
| Node.js | 20 | `node --version` |
| Yarn | 4.x via Corepack | `yarn --version` |
| Python | 3.9 | `python3 --version` |
| pip | 21 | `pip3 --version` |

### Install dependencies

```bash
pip3 install mkdocs-techdocs-core
yarn install
```

### Start the portal

```bash
yarn dev
```

| Process | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:7007 |

Open **http://localhost:3000**.

---

## 2. Show the catalog context

1. Start on the **Catalog** home page.
2. Highlight the main components:
   - `platform-lib`
   - `publisher-service`
   - `console-ui`
   - `manager-ui`
   - `platform-infra`
3. Open `publishing-platform` under **Systems** to show how the sample repos fit together.
4. Open any component's **Docs** tab to show that per-repo TechDocs still exist as detailed source material.

---

## 3. Show the canonical org docs entrypoint

1. Open the `org-docs` component from the catalog.
2. Click the **Docs** tab.
3. Walk the left navigation and explain that this is now the single stable entrypoint for:
   - repository registry
   - architecture
   - product specs
   - contracts
   - runbooks
   - glossary
   - metadata schema

### Key page flow

- **Overview** — explains the source-of-truth model and retrieval-friendly IDs.
- **Repository Registry** — shows what each represented repo does, who owns it, and what it depends on.
- **Architecture** — shows how repo metadata and docs feed the generated knowledge base.
- **Product Specs** — show explicit mappings from features to repo paths.
- **Contracts** — point to the machine-readable OpenAPI file for `publisher-service`.
- **Runbooks / Glossary / Metadata Schema** — show operational guidance, shared language, and the repo metadata contract.

---

## 4. Demo the machine-ingestible layer

Use the repo view or terminal to show these files:

- `/home/runner/work/backstage-portal/backstage-portal/repo.yaml`
- `/home/runner/work/backstage-portal/backstage-portal/org-docs/org-index.yaml`
- `/home/runner/work/backstage-portal/backstage-portal/org-docs/contracts/publisher-service.openapi.yaml`

Explain:

- `repo.yaml` is the stable per-repo metadata contract.
- `org-index.yaml` is the generated org-level inventory for automation and future retrieval systems.
- the OpenAPI file is the deterministic contract for the main cross-repo HTTP surface.

---

## 5. Demo continuous freshness

Run:

```bash
python3 scripts/generate_org_knowledge_base.py --check
```

Then point out the CI workflow in `.github/workflows/catalog-docs-check.yml`:

- validates YAML
- checks generated knowledge-base files are up to date
- verifies required docs exist
- builds every TechDocs site

This makes the knowledge base demoable even without showing a live chat workflow.

---

## 6. Example questions this structure now answers cleanly

| Question | Best source |
|---|---|
| "What repos are part of the publishing platform?" | `org-docs` → Repository Registry |
| "Who owns manager-ui and what does it depend on?" | `org-docs` → Repository Registry |
| "Where is the content lifecycle implemented?" | `org-docs` → Product Specs |
| "What fields are in the publisher-service API contract?" | `org-docs/contracts/publisher-service.openapi.yaml` |
| "Where do deployment and incident docs belong?" | `org-docs` → Runbooks |
| "What metadata does every repo need to publish?" | `org-docs` → Metadata Schema |
