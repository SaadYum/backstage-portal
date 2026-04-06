import {
  coreServices,
  createBackendPlugin,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
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
          repoRoot: resolvePackagePath('backend', '../..'),
        });

        await index.init();

        httpRouter.addAuthPolicy({ path: '/status', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/query', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/reindex', allow: 'unauthenticated' });
        httpRouter.use(await createRouter({ index }));

        lifecycle.addShutdownHook(async () => {
          index.stop();
        });
      },
    });
  },
});
