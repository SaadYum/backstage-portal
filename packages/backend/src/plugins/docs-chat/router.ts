import express, { Router } from 'express';
import type { DocsChatIndex } from './service';

export async function createRouter(options: { index: DocsChatIndex }) {
  const router = Router();
  router.use(express.json());

  router.get('/status', (_request, response) => {
    response.json(options.index.getStatus());
  });

  router.post('/reindex', async (_request, response, next) => {
    try {
      const status = await options.index.fullReindex('manual');
      response.json(status);
    } catch (error) {
      next(error);
    }
  });

  router.post('/query', async (request, response, next) => {
    try {
      const question = request.body?.question;
      if (typeof question !== 'string' || !question.trim()) {
        response.status(400).json({ error: 'A non-empty `question` string is required.' });
        return;
      }

      const result = await options.index.answerQuestion(question.trim());
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
