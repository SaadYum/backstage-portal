import {
  NavItemBlueprint,
  PageBlueprint,
  createFrontendModule,
  createRouteRef,
} from '@backstage/frontend-plugin-api';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

const docsChatRouteRef = createRouteRef({ id: 'docs-chat' });

export const docsChatModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    PageBlueprint.make({
      params: {
        path: '/docs-chat',
        routeRef: docsChatRouteRef,
        title: 'Docs Chat',
        icon: <QuestionAnswerIcon />,
        loader: () => import('./DocsChatPage').then(m => <m.DocsChatPage />),
      },
    }),
    NavItemBlueprint.make({
      params: {
        title: 'Docs Chat',
        icon: QuestionAnswerIcon,
        routeRef: docsChatRouteRef,
      },
    }),
  ],
});
