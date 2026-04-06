import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { docsChatModule } from './modules/docs-chat';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, navModule, docsChatModule],
});
