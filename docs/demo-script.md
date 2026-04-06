# Backstage Portal — Demo Script

This guide walks you through starting Backstage, navigating the UI, and exploring the sample catalog and TechDocs.

---

## 1. Start Backstage

### Prerequisites

| Tool             | Minimum version | How to check         |
|------------------|-----------------|----------------------|
| Node.js          | 20              | `node --version`     |
| Yarn (Classic)   | 1.22            | `yarn --version`     |
| Python           | 3.9             | `python3 --version`  |
| pip              | 21              | `pip3 --version`     |

### Install TechDocs generator (once only)

TechDocs uses MkDocs to render documentation. Install the core plugin:

```bash
pip3 install mkdocs-techdocs-core
```

### Install JavaScript dependencies (once only)

```bash
yarn install
```

> This installs all Backstage frontend and backend packages. It may take a few minutes on first run.

### Start the portal

```bash
yarn dev
```

Backstage starts two processes:

| Process  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:7007     |

Open **http://localhost:3000** in your browser. The catalog is automatically populated from the local `catalog/` directory.

---

## 2. Navigating the UI

### Step 1 — Catalog home

The home page defaults to the **Catalog** view (all components).  
You will see entries for:

- `platform-lib`
- `publisher-service`
- `console-ui`
- `manager-ui`
- `platform-infra`

Use the **Kind** filter on the left sidebar to switch between Components, Systems, Groups, and Users.

### Step 2 — Explore the System

1. Change the **Kind** filter to **System**.
2. Click **publishing-platform**.
3. The system page shows all components that belong to this system.

### Step 3 — Dependency graph

1. Click any component, e.g. **console-ui**.
2. Switch to the **Relations** tab (or look for the **Dependencies** card).
3. You will see that `console-ui` dependsOn `publisher-service`, which in turn dependsOn `platform-lib`.

### Step 4 — TechDocs

1. From any component page, click the **Docs** tab.
2. Backstage generates the MkDocs site on-the-fly (first load may take a few seconds).
3. For `publisher-service`, you will see two pages in the left sidebar:
   - **Overview** (`index.md`) — purpose, ownership, how to run
   - **REST API Reference** (`api.md`) — endpoint table, request/response examples, error codes
4. For `console-ui` and `manager-ui`, you will see:
   - **Overview** (`index.md`)
   - **Integrations** (`integrations.md`) — which API endpoints they call and why
5. Try navigating to `platform-lib` docs to read about the shared library.

### Step 5 — Groups

1. Change the **Kind** filter to **Group**.
2. Explore `team-backend` and `team-frontend` to see which components each team owns.

---

## 3. Example questions to ask an LLM

Use these when exploring the catalog with an AI assistant (e.g. GitHub Copilot Chat or any LLM with access to this repo):

| Question | Where the answer lives |
|----------|------------------------|
| "What services does console-ui depend on?" | Catalog: `console-ui` → Relations tab; or `catalog/frontend-components.yaml` |
| "What endpoints does manager-ui call?" | TechDocs: `manager-ui` → Docs → Integrations |
| "How do I authenticate to publisher-service?" | TechDocs: `publisher-service` → Docs → REST API Reference → Authentication section |
| "What error code does publisher-service return for a missing resource?" | TechDocs: `publisher-service` → Docs → REST API Reference → Error Codes table |
| "Which team owns platform-lib?" | Catalog: `platform-lib` component card shows owner `team-backend` |
| "What shared library do all services use?" | Catalog: dependency graph, or search for `platform-lib` |
| "How do I run publisher-service locally?" | TechDocs: `publisher-service` → Docs → Overview → How to Run |
| "What environment variables does manager-ui need?" | TechDocs: `manager-ui` → Docs → Overview → Environment variables |

---

## 4. What is in the Catalog vs TechDocs

| Information type                  | Location         |
|-----------------------------------|------------------|
| Component name, owner, lifecycle  | Catalog          |
| System membership                 | Catalog          |
| Dependency relationships          | Catalog          |
| How to run a component locally    | TechDocs         |
| API endpoint table                | TechDocs         |
| Request / response examples       | TechDocs         |
| Error codes                       | TechDocs         |
| Which API endpoints a UI calls    | TechDocs         |
| Operational runbooks              | TechDocs         |
