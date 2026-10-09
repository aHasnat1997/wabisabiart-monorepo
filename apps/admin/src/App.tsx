import { Refine } from '@refinedev/core';
import { KBarProvider } from '@refinedev/kbar';
import {
  useNotificationProvider,
  RefineSnackbarProvider,
} from '@refinedev/mui';
import GlobalStyles from '@mui/material/GlobalStyles';
import CssBaseline from '@mui/material/CssBaseline';
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router';
import { BrowserRouter } from 'react-router';
import { useTranslation } from 'react-i18next';
import { authProvider } from './authProvider.js';
import { ColorModeContextProvider, BrandContextProvider } from './contexts/index.js';
import { RootRoute } from './routes/index.js';
import { rootResources } from './resources/index.js';
import { DialogManager, dialogRegistry } from './components/dialogs/index.js';
import { customDataProvider } from './providers/dataProvider.js';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <KBarProvider>
        <ColorModeContextProvider>
          <BrandContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: 'auto' } }} />
          <RefineSnackbarProvider>
            <Refine
              routerProvider={routerProvider}
              dataProvider={customDataProvider(API_URL)}
              authProvider={authProvider}
              i18nProvider={i18nProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                breadcrumb: false,
              }}
              notificationProvider={useNotificationProvider}
              resources={rootResources}
            >
              <RootRoute />
              <DialogManager dialogs={dialogRegistry} />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </RefineSnackbarProvider>
          </BrandContextProvider>
        </ColorModeContextProvider>
      </KBarProvider>
    </BrowserRouter>
  );
};

export default App;
