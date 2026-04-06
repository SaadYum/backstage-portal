# Runbooks

Runbooks capture the operational layer of the knowledge base. In this demo, the canonical operational component is `platform-infra`.

## Environments

| Environment | Deployment target | Primary source |
|---|---|---|
| local | developer workstation | `README.md` quick start + `platform-infra` docs |
| github-space | hosted demo workspace | `README.md` quick start |
| future stage / prod | external deployment targets | `platform-infra` runbooks when those repos are modeled directly |

## Operational responsibilities

- **Deployments:** defined by `platform-infra`
- **Incidents:** first-response guidance should live in platform runbooks and be linked here
- **On-call ownership:** inferred from repo ownership until dedicated on-call metadata is added
- **Environment changes:** must update both the component docs and central runbook summary

## Current source docs

`catalog/components/platform-infra/docs/index.md` references the operational source paths that should back future runbook pages:

- `runbooks/deploy.md`
- `runbooks/rollback.md`
- `runbooks/db-migration.md`
- `runbooks/incident-response.md`

This org-level page is the stable entrypoint while those per-repo operational artifacts mature.
