# Publishing Platform Content Lifecycle

- **Spec ID:** `product:publishing-platform`
- **Status:** active
- **Canonical docs owner:** `team-backend`

## Problem statement

The publishing platform needs a clear description of how content moves from authoring through publication so that platform teams, frontend teams, and future automation tools can all answer the same implementation questions consistently.

## Non-goals

- Defining every storage detail of downstream publishing systems
- Capturing frontend wireframes or visual design guidance

## User journeys

1. An author creates or edits content in `manager-ui`.
2. An operator monitors processing state and health in `console-ui`.
3. `publisher-service` validates, stores, and publishes content.
4. `platform-lib` provides shared models and client utilities.
5. `platform-infra` defines how the platform is deployed and operated.

## Functional requirements

- Authors can create, update, schedule, publish, and delete content.
- Operators can monitor publish jobs and inspect platform health.
- The backend exposes authenticated HTTP APIs for content lifecycle operations.
- Shared models and helpers stay consistent across dependent repos.

## Data model

Core entities:

- `ContentItem`
- `PublishJob`
- `HealthStatus`
- `User role` (`author`, `operator`)

## API and contract references

- Human reference: `catalog/components/publisher-service/docs/api.md`
- Machine-readable contract: `org-docs/contracts/publisher-service.openapi.yaml`

## Edge cases

- Validation failures during create or update
- Unauthorized or forbidden publish attempts
- Downstream dependency outages during publish or status polling
- Content scheduled for future publication

## Metrics and rollout plan

- Measure publish success rate, time-to-publish, and API error-rate trends.
- Roll out new contract or workflow changes first in local/demo environments before production adoption.

## Implementation mapping

| Feature area | Repository | Key path |
|---|---|---|
| Author workflow | `manager-ui` | `catalog/components/manager-ui/docs/index.md` and `catalog/components/manager-ui/docs/integrations.md` |
| Operator workflow | `console-ui` | `catalog/components/console-ui/docs/index.md` and `catalog/components/console-ui/docs/integrations.md` |
| Content API and publish pipeline | `publisher-service` | `catalog/components/publisher-service/docs/index.md` and `catalog/components/publisher-service/docs/api.md` |
| Shared models and clients | `platform-lib` | `catalog/components/platform-lib/docs/index.md` |
| Environments and operations | `platform-infra` | `catalog/components/platform-infra/docs/index.md` |
