# platform-infra

## Purpose

`platform-infra` contains all infrastructure-as-code (IaC) definitions, CI/CD pipeline configurations, and operational runbooks for the publishing platform. It is the single source of truth for how the platform is deployed, scaled, and monitored.

## Ownership

| Attribute | Value               |
|-----------|---------------------|
| Team      | team-backend        |
| Lifecycle | production          |
| Type      | infrastructure      |
| System    | publishing-platform |

## How to Run

### Prerequisites

- Docker and Docker Compose (for local infrastructure)
- Access to the target cloud environment (for remote deployments)

### Start the full platform locally

```bash
cd catalog/components/platform-infra
docker compose up -d
```

This starts:
- PostgreSQL 16 on port `5432`
- Object-storage emulator (MinIO) on port `9000`
- publisher-service on port `4000`

## Repository Structure

```
platform-infra/
├── docker/            # Dockerfiles and compose files
├── terraform/         # Cloud resource definitions (IaC)
├── ci/                # Reusable CI/CD pipeline YAML fragments
├── scripts/           # Operational helper scripts (migrations, seed data)
└── runbooks/          # Step-by-step guides for common operations
```

## Key Runbooks

| Runbook                          | Description                                     |
|----------------------------------|-------------------------------------------------|
| `runbooks/deploy.md`             | How to deploy a new version to production       |
| `runbooks/rollback.md`           | How to roll back to a previous release          |
| `runbooks/db-migration.md`       | Running and verifying database migrations       |
| `runbooks/incident-response.md`  | First-response steps for production incidents   |

## Dependencies

`platform-infra` has no catalog `dependsOn` relationships. Other components depend on the infrastructure it provisions.
