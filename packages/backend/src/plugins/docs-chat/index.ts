import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import path from 'node:path';
import { createRouter } from './router';
import { DocsChatIndex } from './service';

export const docsChatPlugin = createBackendPlugin({
  pluginId: 'docs-chat',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        lifecycle: coreServices.lifecycle,
        logger: coreServices.logger,
      },
      async init({ httpRouter, lifecycle, logger }) {
        const index = new DocsChatIndex({
          logger,
          repoRoot: path.resolve(process.cwd()),
        });

        await index.init();

        httpRouter.addAuthPolicy({ path: '/status', allow: 'user-cookie' });
        httpRouter.addAuthPolicy({ path: '/query', allow: 'user-cookie' });
        httpRouter.addAuthPolicy({ path: '/reindex', allow: 'user-cookie' });
        httpRouter.use(await createRouter({ index }));

        lifecycle.addShutdownHook(async () => {
          index.stop();
        });
      },
    });
  },
});
