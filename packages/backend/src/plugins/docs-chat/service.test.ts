import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DocsChatIndex, chunkMarkdownDocument } from './service';

const logger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

describe('chunkMarkdownDocument', () => {
  it('creates TechDocs URLs with anchors for component docs', () => {
    const chunks = chunkMarkdownDocument(
      '/workspace/catalog/components/publisher-service/docs/api.md',
      '# Publisher Service API\n\n## Authentication\n\nUse a bearer token.\n',
    );

    expect(chunks.some(chunk => chunk.url === '/docs/default/component/publisher-service/api#authentication')).toBe(true);
  });

  it('creates central docs TechDocs URLs for org docs', () => {
    const chunks = chunkMarkdownDocument(
      '/workspace/org-docs/docs/docs-chat.md',
      '# Docs Chat\n\n## Example Questions\n\nAsk grounded questions.\n',
    );

    expect(chunks.some(chunk => chunk.url === '/docs/default/component/org-docs/docs-chat#example-questions')).toBe(true);
  });
});

describe('DocsChatIndex', () => {
  it('retrieves the most relevant docs chunks from indexed markdown', async () => {
    const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-chat-index-'));

    await mkdir(path.join(repoRoot, 'org-docs', 'docs'), { recursive: true });
    await mkdir(path.join(repoRoot, 'catalog', 'components', 'manager-ui', 'docs'), {
      recursive: true,
    });

    await writeFile(
      path.join(repoRoot, 'org-docs', 'docs', 'docs-chat.md'),
      '# Docs Chat\n\n## Missing docs\n\nIf an answer is missing, say which document needs to be added.\n',
      'utf8',
    );
    await writeFile(
      path.join(repoRoot, 'catalog', 'components', 'manager-ui', 'docs', 'integrations.md'),
      '# Manager UI Integrations\n\n## Publisher Service\n\nmanager-ui calls POST /content and GET /content/{id}.\n',
      'utf8',
    );

    const index = new DocsChatIndex({ logger, repoRoot });
    await index.fullReindex('test');

    const results = index.retrieve('What endpoints does manager-ui call?', 3);

    expect(results[0]?.url).toContain('/docs/default/component/manager-ui/integrations');
    expect(results[0]?.excerpt).toContain('POST /content');

    index.stop();
    await rm(repoRoot, { recursive: true, force: true });
  });
});
