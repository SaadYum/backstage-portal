from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
ORG_DOCS_ROOT = REPO_ROOT / 'org-docs'
OUTPUT_INDEX = ORG_DOCS_ROOT / 'org-index.yaml'
OUTPUT_REGISTRY = ORG_DOCS_ROOT / 'docs' / 'repository-registry.md'
CATALOG_FILES = [
    REPO_ROOT / 'catalog' / 'backend-components.yaml',
    REPO_ROOT / 'catalog' / 'frontend-components.yaml',
]
REQUIRED_REPO_FIELDS = [
    'schema_version',
    'name',
    'description',
    'domain',
    'lifecycle',
    'owners',
    'entrypoints',
    'dependencies',
    'interfaces',
    'security',
    'environments',
    'runbook_links',
    'dashboards',
    'slo_sla',
]


def read_yaml(path: Path) -> Any:
    with path.open('r', encoding='utf-8') as handle:
        return yaml.safe_load(handle)


def read_yaml_documents(path: Path) -> list[dict[str, Any]]:
    with path.open('r', encoding='utf-8') as handle:
        return [doc for doc in yaml.safe_load_all(handle) if doc]


def validate_repo_metadata(repo_metadata: dict[str, Any]) -> None:
    missing = [field for field in REQUIRED_REPO_FIELDS if field not in repo_metadata]
    if missing:
        raise ValueError(f"repo.yaml is missing required fields: {', '.join(missing)}")

    owners = repo_metadata.get('owners', {})
    if not owners.get('team'):
        raise ValueError('repo.yaml owners.team must be set')

    if not isinstance(repo_metadata.get('entrypoints'), list) or not repo_metadata['entrypoints']:
        raise ValueError('repo.yaml entrypoints must contain at least one entry')


def build_catalog_repositories() -> list[dict[str, Any]]:
    repositories: list[dict[str, Any]] = []
    for catalog_file in CATALOG_FILES:
        for entity in read_yaml_documents(catalog_file):
            if entity.get('kind') != 'Component':
                continue

            metadata = entity.get('metadata', {})
            spec = entity.get('spec', {})
            name = metadata['name']
            component_path = Path('catalog/components') / name
            docs_path = component_path / 'docs'
            depends_on = [dependency.removeprefix('component:') for dependency in spec.get('dependsOn', [])]
            annotations = metadata.get('annotations', {})
            techdocs_ref = annotations.get('backstage.io/techdocs-ref', '')

            produced_interfaces: list[dict[str, str]] = []
            consumed_interfaces: list[dict[str, str]] = []
            contract_refs: list[str] = []

            api_doc = docs_path / 'api.md'
            integrations_doc = docs_path / 'integrations.md'

            if api_doc.exists():
                produced_interfaces.append(
                    {
                        'type': 'http',
                        'name': f'{name}-rest-api',
                        'description': 'REST API documented in TechDocs and indexed centrally.',
                        'contract': 'org-docs/contracts/publisher-service.openapi.yaml',
                    }
                )
                contract_refs.append('contract:publisher-service-http-api')

            if integrations_doc.exists():
                consumed_interfaces.append(
                    {
                        'type': 'http',
                        'name': 'publisher-service-rest-api',
                        'description': 'Consumes publisher-service endpoints documented in integrations.md.',
                        'dependency': 'publisher-service',
                    }
                )

            if name == 'platform-infra':
                produced_interfaces.append(
                    {
                        'type': 'runbook',
                        'name': 'platform-operations-runbooks',
                        'description': 'Operational procedures and environment guidance for the platform.',
                        'contract': 'doc:runbook:platform-operations',
                    }
                )

            repositories.append(
                {
                    'id': f'repo:{name}',
                    'name': name,
                    'description': metadata.get('description', ''),
                    'domain': 'publishing-platform',
                    'lifecycle': spec.get('lifecycle', 'unknown'),
                    'owner': spec.get('owner'),
                    'type': spec.get('type'),
                    'system': spec.get('system'),
                    'repo_path': str(component_path),
                    'techdocs_ref': techdocs_ref,
                    'docs_paths': [str(docs_path / 'index.md')],
                    'dependencies': depends_on,
                    'interfaces': {
                        'produces': produced_interfaces,
                        'consumes': consumed_interfaces,
                    },
                    'contract_refs': contract_refs,
                }
            )
    return sorted(repositories, key=lambda repo: repo['name'])


def build_org_index(repo_metadata: dict[str, Any], catalog_repositories: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        'schema_version': 1,
        'canonical_docs': {
            'component': 'org-docs',
            'docs_root': 'org-docs/docs',
            'registry_page': 'org-docs/docs/repository-registry.md',
        },
        'repositories': [
            {
                'id': f"repo:{repo_metadata['name']}",
                **repo_metadata,
            },
            *catalog_repositories,
        ],
        'products': [
            {
                'id': 'product:publishing-platform',
                'name': 'publishing-platform',
                'description': 'End-to-end publishing platform spanning shared libraries, backend APIs, frontend apps, and infrastructure.',
                'repositories': [repo['name'] for repo in catalog_repositories],
                'spec_refs': ['doc:spec:publishing-platform-content-lifecycle'],
            },
            {
                'id': 'product:org-knowledge-base',
                'name': 'org-knowledge-base',
                'description': 'Documentation-first knowledge base experience exposed through org-docs and generated indices.',
                'repositories': [repo_metadata['name']],
                'spec_refs': ['doc:spec:org-knowledge-base'],
            },
        ],
        'contracts': [
            {
                'id': 'contract:publisher-service-http-api',
                'name': 'publisher-service-http-api',
                'type': 'openapi',
                'owner': 'team-backend',
                'source': 'org-docs/contracts/publisher-service.openapi.yaml',
                'producers': ['publisher-service'],
                'consumers': ['console-ui', 'manager-ui'],
            }
        ],
        'runbooks': [
            {
                'id': 'doc:runbook:platform-operations',
                'name': 'platform-operations',
                'source': 'org-docs/docs/runbooks/index.md',
                'backing_docs': ['catalog/components/platform-infra/docs/index.md'],
            }
        ],
    }


def build_primary_repository_record(repo_metadata: dict[str, Any]) -> dict[str, Any]:
    return {
        'name': repo_metadata['name'],
        'description': repo_metadata['description'],
        'owner': repo_metadata['owners']['team'],
        'lifecycle': repo_metadata['lifecycle'],
        'type': 'portal',
        'system': 'publishing-platform',
        'repo_path': '.',
        'docs_paths': ['org-docs/docs/index.md'],
        'dependencies': repo_metadata['dependencies']['internal_repositories'],
        'interfaces': repo_metadata['interfaces'],
    }


def render_registry_markdown(
    repo_metadata: dict[str, Any], catalog_repositories: list[dict[str, Any]]
) -> str:
    primary_repository = build_primary_repository_record(repo_metadata)
    repositories = [primary_repository, *catalog_repositories]
    lines = [
        '# Repository Registry',
        '',
        '> Generated by `scripts/generate_org_knowledge_base.py`. Do not edit manually.',
        '',
        'The registry is the human-readable inventory for the demo organization. It summarizes what exists, why it exists, who owns it, what it depends on, and where its canonical docs live.',
        '',
        '## Summary',
        '',
        '| Repository | Purpose | Owner | Lifecycle | Depends on |',
        '|---|---|---|---|---|',
    ]

    for repository in repositories:
        dependencies = ', '.join(repository['dependencies']) if repository['dependencies'] else '—'
        lines.append(
            f"| `{repository['name']}` | {repository['description']} | `{repository['owner']}` | `{repository['lifecycle']}` | {dependencies} |"
        )

    for repository in repositories:
        lines.extend(
            [
                '',
                f"## `{repository['name']}`",
                '',
                f"- **Purpose:** {repository['description']}",
                f"- **Owner:** `{repository['owner']}`",
                f"- **Lifecycle:** `{repository['lifecycle']}`",
                f"- **Type:** `{repository['type']}`",
                f"- **System:** `{repository['system']}`",
                f"- **Repo path:** `{repository['repo_path']}`",
                f"- **TechDocs source:** `{repository['docs_paths'][0]}`",
            ]
        )

        if repository['dependencies']:
            lines.append(f"- **Dependencies:** {', '.join(f'`{dependency}`' for dependency in repository['dependencies'])}")
        else:
            lines.append('- **Dependencies:** none')

        produced = repository['interfaces']['produces']
        consumed = repository['interfaces']['consumes']
        if produced:
            lines.append('- **Interfaces produced:**')
            for interface in produced:
                lines.append(
                    f"  - `{interface['name']}` ({interface['type']}): {interface['description']}"
                )
        if consumed:
            lines.append('- **Interfaces consumed:**')
            for interface in consumed:
                lines.append(
                    f"  - `{interface['name']}` ({interface['type']}): {interface['description']}"
                )

    lines.append('')
    return '\n'.join(lines)


def compare_or_write(path: Path, content: str, check: bool) -> bool:
    existing = path.read_text(encoding='utf-8') if path.exists() else None
    if check:
        return existing == content

    path.write_text(content, encoding='utf-8')
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description='Generate org knowledge base artifacts.')
    parser.add_argument('--check', action='store_true', help='Fail if generated files are out of date.')
    args = parser.parse_args()

    repo_metadata = read_yaml(REPO_ROOT / 'repo.yaml')
    validate_repo_metadata(repo_metadata)
    catalog_repositories = build_catalog_repositories()
    org_index = build_org_index(repo_metadata, catalog_repositories)
    registry_markdown = render_registry_markdown(repo_metadata, catalog_repositories)
    org_index_yaml = yaml.safe_dump(org_index, sort_keys=False, allow_unicode=True)

    index_ok = compare_or_write(OUTPUT_INDEX, org_index_yaml, args.check)
    registry_ok = compare_or_write(OUTPUT_REGISTRY, registry_markdown, args.check)

    if args.check and not (index_ok and registry_ok):
        if not index_ok:
            print(f'Stale generated file: {OUTPUT_INDEX.relative_to(REPO_ROOT)}')
        if not registry_ok:
            print(f'Stale generated file: {OUTPUT_REGISTRY.relative_to(REPO_ROOT)}')
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
