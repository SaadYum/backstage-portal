import { Content, ContentHeader, InfoCard, Link, Page, Progress } from '@backstage/core-components';
import { discoveryApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import SendIcon from '@material-ui/icons/Send';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_ANSWER = 'Ask a question about the docs to get a grounded answer and TechDocs sources.';

type DocsChatSource = {
  title: string;
  url: string;
  excerpt: string;
};

type DocsChatStatus = {
  version: number;
  lastIndexedAt: string | null;
  chunkCount: number;
  fileCount: number;
  llmAvailable: boolean;
};

export function DocsChatPage() {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [question, setQuestion] = useState('Which components depend on publisher-service?');
  const [answer, setAnswer] = useState(DEFAULT_ANSWER);
  const [sources, setSources] = useState<DocsChatSource[]>([]);
  const [status, setStatus] = useState<DocsChatStatus | undefined>();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const baseUrl = await discoveryApi.getBaseUrl('docs-chat');
      const response = await fetchApi.fetch(`${baseUrl}/status`);
      if (!response.ok) {
        throw new Error(`Status request failed with ${response.status}`);
      }
      const payload = (await response.json()) as DocsChatStatus;
      setStatus(payload);
      setError(undefined);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoadingStatus(false);
    }
  }, [discoveryApi, fetchApi]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const submitQuestion = useCallback(async () => {
    setSubmitting(true);
    setError(undefined);

    try {
      const baseUrl = await discoveryApi.getBaseUrl('docs-chat');
      const response = await fetchApi.fetch(`${baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => undefined)) as { error?: string } | undefined;
        throw new Error(payload?.error ?? `Query failed with ${response.status}`);
      }

      const payload = (await response.json()) as { answer: string; sources: DocsChatSource[] };
      setAnswer(payload.answer);
      setSources(payload.sources);
      await loadStatus();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSubmitting(false);
    }
  }, [discoveryApi, fetchApi, loadStatus, question]);

  const triggerReindex = useCallback(async () => {
    setReindexing(true);
    setError(undefined);
    try {
      const baseUrl = await discoveryApi.getBaseUrl('docs-chat');
      const response = await fetchApi.fetch(`${baseUrl}/reindex`, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Reindex failed with ${response.status}`);
      }
      const payload = (await response.json()) as DocsChatStatus;
      setStatus(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setReindexing(false);
    }
  }, [discoveryApi, fetchApi]);

  const statusSummary = useMemo(() => {
    if (!status) {
      return 'Loading index status…';
    }

    return `Version ${status.version} • ${status.chunkCount} chunks • ${status.fileCount} files • ${status.llmAvailable ? 'LLM configured' : 'LLM unavailable'}`;
  }, [status]);

  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Docs Chat" />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <InfoCard title="Ask about the docs">
              <Box display="flex" flexDirection="column" gridGap={16}>
                <TextField
                  label="Question"
                  multiline
                  value={question}
                  onChange={event => setQuestion(event.target.value)}
                  variant="outlined"
                  fullWidth
                />
                <Box display="flex" gridGap={12}>
                  <Button
                    color="primary"
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => void submitQuestion()}
                    disabled={submitting || !question.trim()}
                  >
                    Ask Docs Chat
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => void triggerReindex()}
                    disabled={reindexing}
                  >
                    Reindex Docs
                  </Button>
                </Box>
                {error ? <Typography color="error">{error}</Typography> : null}
              </Box>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard title="Index status">
              {loadingStatus ? <Progress /> : null}
              <Typography variant="body2">{statusSummary}</Typography>
              {status?.lastIndexedAt ? (
                <Typography variant="body2" color="textSecondary">
                  Last indexed: {new Date(status.lastIndexedAt).toLocaleString()}
                </Typography>
              ) : null}
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <InfoCard title="Answer">
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {submitting ? 'Thinking…' : answer}
              </Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <InfoCard title="Sources">
              {sources.length ? (
                <List>
                  {sources.map(source => (
                    <ListItem key={`${source.url}:${source.title}`} alignItems="flex-start">
                      <ListItemText
                        primary={<Link to={source.url}>{source.title}</Link>}
                        secondary={source.excerpt}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Sources appear here after you ask a question.
                </Typography>
              )}
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
