import { LoggerService } from '@backstage/backend-plugin-api';
import { watch, type FSWatcher } from 'node:fs';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
const ROOT_DOCS_ENTITY = 'org-docs';
const DEFAULT_MODEL = process.env.GITHUB_MODELS_MODEL ?? 'openai/gpt-4.1-mini';
const DEFAULT_ENDPOINT =
  process.env.GITHUB_MODELS_ENDPOINT ??
  'https://models.inference.ai.azure.com/chat/completions';

export type DocsChatSource = {
  title: string;
  url: string;
  excerpt: string;
};

type Chunk = {
  id: string;
  filePath: string;
  pageTitle: string;
  heading: string;
  excerpt: string;
  content: string;
  searchableText: string;
  url: string;
  anchor?: string;
  sourceType: 'component' | 'org-docs';
};

type IndexedFile = {
  mtimeMs: number;
  chunks: Chunk[];
};

export type DocsChatStatus = {
  version: number;
  lastIndexedAt: string | null;
  chunkCount: number;
  fileCount: number;
  llmAvailable: boolean;
};

export class DocsChatIndex {
  private readonly logger: LoggerService;
  private readonly repoRoot: string;
  private readonly files = new Map<string, IndexedFile>();
  private readonly watchers = new Map<string, FSWatcher>();
  private refreshTimer?: NodeJS.Timeout;
  private version = 0;
  private lastIndexedAt: string | null = null;
  private refreshInFlight?: Promise<void>;

  constructor(options: { logger: LoggerService; repoRoot: string }) {
    this.logger = options.logger;
    this.repoRoot = options.repoRoot;
  }

  async init() {
    await this.fullReindex('startup');
    await this.syncWatchers();
  }

  stop() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }

  getStatus(): DocsChatStatus {
    return {
      version: this.version,
      lastIndexedAt: this.lastIndexedAt,
      chunkCount: this.getAllChunks().length,
      fileCount: this.files.size,
      llmAvailable: Boolean(process.env.GITHUB_MODELS_TOKEN),
    };
  }

  async fullReindex(reason: string) {
    this.logger.info(`Docs Chat full reindex started (${reason})`);

    const scannedFiles = await this.scanCandidateFiles();
    this.files.clear();

    for (const [filePath, mtimeMs] of scannedFiles.entries()) {
      const indexed = await this.indexFile(filePath, mtimeMs);
      if (indexed) {
        this.files.set(filePath, indexed);
      }
    }

    this.version += 1;
    this.lastIndexedAt = new Date().toISOString();
    await this.syncWatchers();

    this.logger.info(
      `Docs Chat full reindex completed (${reason}) with ${this.files.size} files and ${this.getAllChunks().length} chunks`,
    );

    return this.getStatus();
  }

  scheduleRefresh(reason: string) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      void this.incrementalRefresh(reason);
    }, 250);
  }

  async answerQuestion(question: string) {
    const chunks = this.retrieve(question, 5);
    const sources = chunks.map(chunk => ({
      title: chunk.heading,
      url: chunk.url,
      excerpt: chunk.excerpt,
    }));

    if (!chunks.length) {
      return {
        answer:
          'I could not find any relevant documentation for that question. Add or expand the matching docs page, then try again.',
        sources: [],
      };
    }

    if (!process.env.GITHUB_MODELS_TOKEN) {
      return {
        answer:
          'LLM is unavailable because `GITHUB_MODELS_TOKEN` is not configured. Here are the most relevant TechDocs sources for this question.',
        sources,
      };
    }

    try {
      const answer = await this.generateAnswer(question, chunks);
      return { answer, sources };
    } catch (error) {
      this.logger.warn('Docs Chat LLM request failed, falling back to source-only response', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        answer:
          'LLM is currently unavailable. Review the linked TechDocs sources below for the best grounded answer.',
        sources,
      };
    }
  }

  retrieve(question: string, topN = 5): Chunk[] {
    const normalizedQuestion = normalizeText(question);
    const questionTerms = uniqueTerms(normalizedQuestion);

    const scored = this.getAllChunks()
      .map(chunk => ({
        chunk,
        score: scoreChunk(chunk, normalizedQuestion, questionTerms),
      }))
      .filter(result => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, topN)
      .map(result => result.chunk);

    return scored;
  }

  private async incrementalRefresh(reason: string) {
    if (this.refreshInFlight) {
      await this.refreshInFlight;
      return;
    }

    this.refreshInFlight = (async () => {
      const scannedFiles = await this.scanCandidateFiles();
      let changed = false;

      for (const [filePath] of this.files.entries()) {
        if (!scannedFiles.has(filePath)) {
          this.files.delete(filePath);
          changed = true;
        }
      }

      for (const [filePath, mtimeMs] of scannedFiles.entries()) {
        const current = this.files.get(filePath);
        if (!current || current.mtimeMs !== mtimeMs) {
          const next = await this.indexFile(filePath, mtimeMs);
          if (next) {
            this.files.set(filePath, next);
          } else {
            this.files.delete(filePath);
          }
          changed = true;
        }
      }

      if (changed) {
        this.version += 1;
        this.lastIndexedAt = new Date().toISOString();
        this.logger.info(`Docs Chat incremental reindex completed (${reason})`, {
          fileCount: this.files.size,
          chunkCount: this.getAllChunks().length,
          version: this.version,
        });
      }

      await this.syncWatchers();
    })();

    try {
      await this.refreshInFlight;
    } finally {
      this.refreshInFlight = undefined;
    }
  }

  private getAllChunks() {
    return [...this.files.values()].flatMap(file => file.chunks);
  }

  private async scanCandidateFiles() {
    const files = new Map<string, number>();
    const roots = [
      path.join(this.repoRoot, 'org-docs', 'docs'),
      path.join(this.repoRoot, 'catalog', 'components'),
    ];

    const visit = async (currentPath: string): Promise<void> => {
      let stats;
      try {
        stats = await stat(currentPath);
      } catch {
        return;
      }

      if (stats.isDirectory()) {
        const entries = await readdir(currentPath);
        await Promise.all(entries.map(entry => visit(path.join(currentPath, entry))));
        return;
      }

      if (!stats.isFile()) {
        return;
      }

      if (isCandidateDocPath(currentPath)) {
        files.set(currentPath, stats.mtimeMs);
      }
    };

    await Promise.all(roots.map(root => visit(root)));

    return files;
  }

  private async syncWatchers() {
    const directories = new Set<string>();

    for (const filePath of this.files.keys()) {
      directories.add(path.dirname(filePath));
    }

    for (const root of [
      path.join(this.repoRoot, 'org-docs'),
      path.join(this.repoRoot, 'org-docs', 'docs'),
      path.join(this.repoRoot, 'catalog'),
      path.join(this.repoRoot, 'catalog', 'components'),
    ]) {
      if (await pathExists(root)) {
        directories.add(root);
      }
    }

    for (const directory of [...this.watchers.keys()]) {
      if (!directories.has(directory)) {
        this.watchers.get(directory)?.close();
        this.watchers.delete(directory);
      }
    }

    for (const directory of directories) {
      if (this.watchers.has(directory)) {
        continue;
      }

      try {
        const watcher = watch(directory, () => {
          this.scheduleRefresh(`watch:${path.relative(this.repoRoot, directory)}`);
        });

        watcher.on('error', error => {
          this.logger.warn(`Docs Chat watcher error for ${directory}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        });

        this.watchers.set(directory, watcher);
      } catch (error) {
        this.logger.warn(`Failed to watch Docs Chat directory ${directory}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async indexFile(filePath: string, mtimeMs: number): Promise<IndexedFile | undefined> {
    try {
      const raw = await readFile(filePath, 'utf8');
      const chunks = chunkMarkdownDocument(filePath, raw);
      if (!chunks.length) {
        return undefined;
      }
      return { mtimeMs, chunks };
    } catch (error) {
      this.logger.warn(`Failed to index Docs Chat file ${filePath}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }

  private async generateAnswer(question: string, chunks: Chunk[]) {
    const snippetText = chunks
      .map(
        (chunk, index) => `Source ${index + 1}: ${chunk.heading}\nURL: ${chunk.url}\nExcerpt: ${chunk.excerpt}\n\n${chunk.content}`,
      )
      .join('\n\n---\n\n');

    const response = await fetch(DEFAULT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.GITHUB_MODELS_TOKEN}`,
        'api-key': process.env.GITHUB_MODELS_TOKEN ?? '',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.1,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              'You answer only from the provided documentation snippets. If the snippets are insufficient, say which documentation is missing or incomplete. Do not invent facts. Prefer concise answers and cite source numbers inline, for example [1].',
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nDocumentation snippets:\n\n${snippetText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Models request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      throw new Error('GitHub Models response did not include an answer');
    }

    return answer;
  }
}

export function chunkMarkdownDocument(filePath: string, rawContent: string): Chunk[] {
  const docLocation = resolveDocumentLocation(filePath);
  if (!docLocation) {
    return [];
  }

  const cleanedContent = rawContent.replace(/\r\n/g, '\n');
  const pageTitle =
    extractFirstHeading(cleanedContent) ?? humanizeSegment(docLocation.pageSlug ?? docLocation.entityName);

  const sections = splitByHeadings(cleanedContent);
  const chunks = sections
    .map((section, index) => {
      const heading = section.heading ?? pageTitle;
      const excerpt = createExcerpt(section.content);
      if (!excerpt) {
        return undefined;
      }

      const anchor = slugifyHeading(heading);
      const url = buildTechDocsUrl(docLocation, anchor);
      const searchableText = normalizeText(
        [docLocation.entityName, pageTitle, heading, excerpt, section.content].join(' '),
      );

      return {
        id: `${filePath}:${index}:${anchor}`,
        filePath,
        pageTitle,
        heading: `${humanizeSegment(docLocation.entityName)} — ${heading}`,
        excerpt,
        content: section.content.trim(),
        searchableText,
        url,
        anchor,
        sourceType: docLocation.sourceType,
      } satisfies Chunk;
    })
    .filter((chunk): chunk is Chunk => Boolean(chunk));

  return chunks;
}

function resolveDocumentLocation(filePath: string):
  | {
      entityName: string;
      pageSlug?: string;
      sourceType: 'component' | 'org-docs';
    }
  | undefined {
  const normalized = filePath.split(path.sep).join('/');
  const componentMatch = normalized.match(/\/catalog\/components\/([^/]+)\/docs\/(.+)\.md$/);
  if (componentMatch) {
    return {
      entityName: componentMatch[1],
      pageSlug: componentMatch[2] === 'index' ? undefined : componentMatch[2],
      sourceType: 'component',
    };
  }

  const orgDocsMatch = normalized.match(/\/org-docs\/docs\/(.+)\.md$/);
  if (orgDocsMatch) {
    return {
      entityName: ROOT_DOCS_ENTITY,
      pageSlug: orgDocsMatch[1] === 'index' ? undefined : orgDocsMatch[1],
      sourceType: 'org-docs',
    };
  }

  return undefined;
}

function buildTechDocsUrl(
  location: { entityName: string; pageSlug?: string },
  anchor?: string,
) {
  const pagePath = location.pageSlug ? `/${location.pageSlug}` : '';
  const anchorPath = anchor ? `#${anchor}` : '';
  return `/docs/default/component/${location.entityName}${pagePath}${anchorPath}`;
}

function splitByHeadings(rawContent: string) {
  const lines = rawContent.split('\n');
  const sections: Array<{ heading?: string; content: string }> = [];
  let currentHeading: string | undefined;
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      if (buffer.join('').trim()) {
        sections.push({ heading: currentHeading, content: buffer.join('\n').trim() });
      }
      currentHeading = match[2].trim();
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }

  if (buffer.join('').trim()) {
    sections.push({ heading: currentHeading, content: buffer.join('\n').trim() });
  }

  return sections;
}

function extractFirstHeading(rawContent: string) {
  return rawContent
    .split('\n')
    .map(line => line.match(/^#\s+(.*)$/)?.[1]?.trim())
    .find(Boolean);
}

function createExcerpt(content: string) {
  return content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s/-]+/g, ' ');
}

function uniqueTerms(value: string) {
  return [...new Set(value.split(/\s+/).filter(term => term.length > 2))];
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) {
    return 0;
  }
  return haystack.split(needle).length - 1;
}

function scoreChunk(chunk: Chunk, normalizedQuestion: string, questionTerms: string[]) {
  let score = 0;

  for (const term of questionTerms) {
    score += countOccurrences(chunk.heading.toLowerCase(), term) * 8;
    score += countOccurrences(chunk.pageTitle.toLowerCase(), term) * 5;
    score += countOccurrences(chunk.searchableText, term);
  }

  const condensedQuestion = normalizedQuestion.replace(/\s+/g, ' ').trim();
  if (condensedQuestion && chunk.searchableText.includes(condensedQuestion)) {
    score += 25;
  }

  if (chunk.sourceType === 'component') {
    score += 2;
  }

  return score;
}

function slugifyHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function humanizeSegment(segment: string) {
  return segment
    .split('/')
    .map(part =>
      part
        .split('-')
        .map(piece => piece.charAt(0).toUpperCase() + piece.slice(1))
        .join(' '),
    )
    .join(' / ');
}

function isCandidateDocPath(filePath: string) {
  return filePath.endsWith('.md') && /(?:\/org-docs\/docs\/|\/catalog\/components\/.*\/docs\/)/.test(filePath);
}

async function pathExists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}
