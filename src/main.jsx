import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import I18nProvider from './components/I18nProvider.jsx';
import App from './App.jsx';
import { AppErrorBoundary } from './components/AppRecovery.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </I18nProvider>
  </StrictMode>,
);
