import { renderInTestApp, mockApis } from '@backstage/frontend-test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocsChatPage } from './DocsChatPage';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('DocsChatPage', () => {
  it('submits a question and renders answer and sources', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/docs-chat/status')) {
        return jsonResponse({
          version: 3,
          lastIndexedAt: '2026-04-06T11:00:00.000Z',
          chunkCount: 12,
          fileCount: 4,
          llmAvailable: false,
        });
      }

      if (url.endsWith('/api/docs-chat/query')) {
        expect(init?.method).toBe('POST');
        return jsonResponse({
          answer: 'console-ui and manager-ui both depend on publisher-service.',
          sources: [
            {
              title: 'Console Ui — Overview',
              url: '/docs/default/component/console-ui',
              excerpt: 'console-ui depends on publisher-service.',
            },
          ],
        });
      }

      if (url.endsWith('/api/docs-chat/reindex')) {
        return jsonResponse({
          version: 4,
          lastIndexedAt: '2026-04-06T11:05:00.000Z',
          chunkCount: 12,
          fileCount: 4,
          llmAvailable: false,
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    await renderInTestApp(<DocsChatPage />, {
      apis: [mockApis.fetch({ baseImplementation: fetchMock })],
    });

    await waitFor(() => {
      expect(screen.getByText(/Version 3/i)).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText('Question'));
    await userEvent.type(screen.getByLabelText('Question'), 'Which components depend on publisher-service?');
    await userEvent.click(screen.getByRole('button', { name: /Ask Docs Chat/i }));

    await waitFor(() => {
      expect(
        screen.getByText('console-ui and manager-ui both depend on publisher-service.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Console Ui — Overview')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/docs-chat/query',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
