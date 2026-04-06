import { PageBlueprint, createFrontendModule } from '@backstage/frontend-plugin-api';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

export const docsChatModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    PageBlueprint.make({
      params: {
        path: '/docs-chat',
        title: 'Docs Chat',
        icon: <QuestionAnswerIcon />,
        loader: () => import('./DocsChatPage').then(m => <m.DocsChatPage />),
      },
    }),
  ],
});
