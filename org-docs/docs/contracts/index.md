# Contracts

Contracts are the deterministic layer of the knowledge base. They reduce ambiguity by pairing prose docs with machine-readable artifacts.

## Current contract inventory

| Contract ID | Type | Producer | Consumers | Source |
|---|---|---|---|---|
| `contract:publisher-service-http-api` | OpenAPI 3.0 | `publisher-service` | `console-ui`, `manager-ui` | `org-docs/contracts/publisher-service.openapi.yaml` |

## Contract rules

- Prefer OpenAPI for HTTP services.
- Keep machine-readable contract files under `org-docs/contracts/**`.
- Link each contract back to the human docs that explain behavior and operational context.
- Update the corresponding product spec when a contract change affects feature behavior.

## Human references

- `catalog/components/publisher-service/docs/api.md`
- `catalog/components/console-ui/docs/integrations.md`
- `catalog/components/manager-ui/docs/integrations.md`
