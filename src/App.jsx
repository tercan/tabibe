import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from './hooks/useTranslation.js';
import Clock from './components/Clock.jsx';
import SearchBar from './components/SearchBar.jsx';
import SpeedDial from './components/SpeedDial.jsx';
import Footer from './components/Footer.jsx';
import { AppLoading, AppRecovery } from './components/AppRecovery.jsx';
import {
  getBackgroundPresetTheme,
  getEquivalentBackgroundPresetColor,
} from './lib/backgroundPresets.js';
import {
  createDefaultSettings,
  loadSettings,
  mergeDevelopmentDemoNotes,
  saveSettings,
} from './lib/storage.js';
import { detectLocale } from './i18n/translationContext.js';
import useFaviconPermission from './hooks/useFaviconPermission.js';
import useBackgroundImageUrl from './hooks/useBackgroundImageUrl.js';
import { getBackgroundAppearance } from './lib/backgroundAppearance.js';

const NotePanel = lazy(() => import('./components/NotePanel.jsx'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'));

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

async function loadPreparedSettings() {
  let demoError = null;

  if (import.meta.env.DEV) {
    try {
      const demoResult = await mergeDevelopmentDemoNotes();
      if (demoResult.status !== 'not-requested') {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('demo-notes');
        window.history.replaceState(window.history.state, '', cleanUrl);
      }
    } catch (error) {
      demoError = error;
    }
  }

  return { settings: await loadSettings(), demoError };
}

function App() {
  const { locale, setLocale, t } = useTranslation();
  const faviconPermission = useFaviconPermission();
  const [settings, setSettings] = useState(() => createDefaultSettings(getSystemTheme()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesRequest, setNotesRequest] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const [settingsLoadState, setSettingsLoadState] = useState('loading');

  const {
    theme,
    iconStyle,
    searchEngine,
    showClock,
    showSearch,
    noteSort,
    backgroundColor,
    backgroundImage,
    showMemory,
    locale: selectedLocale,
  } = settings;
  const renderedBackgroundImage = useBackgroundImageUrl(backgroundImage);
  const backgroundAppearance = getBackgroundAppearance({
    backgroundColor,
    hasBackgroundImage: Boolean(backgroundImage),
  });

  useEffect(() => {
    let active = true;

    loadPreparedSettings()
      .then(({ settings: savedSettings, demoError }) => {
        if (active) {
          setSettings(savedSettings);
          setStorageError(Boolean(demoError));
          setSettingsLoadState('ready');
        }
      })
      .catch(() => {
        if (active) setSettingsLoadState('error');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setLocale(selectedLocale || detectLocale());
  }, [selectedLocale, setLocale]);

  useEffect(() => {
    function handleQuickCaptureShortcut(event) {
      if (!event.altKey || !event.shiftKey || event.metaKey || event.ctrlKey) return;
      if (event.key.toLocaleLowerCase() !== 'n') return;
      event.preventDefault();
      const requestId = crypto.randomUUID();
      setNotesRequest({ type: 'capture', requestId, captureSessionId: requestId });
    }

    document.addEventListener('keydown', handleQuickCaptureShortcut);
    return () => document.removeEventListener('keydown', handleQuickCaptureShortcut);
  }, []);

  useEffect(() => {
    if (backgroundImage) return;
    const presetTheme = getBackgroundPresetTheme(backgroundColor);
    if (presetTheme && presetTheme !== theme) updateSettings({ theme: presetTheme });
  }, [backgroundColor, backgroundImage, theme]);

  async function updateSettings(patch) {
    setStorageError(false);
    setSettings((currentSettings) => ({ ...currentSettings, ...patch }));

    try {
      const savedSettings = await saveSettings(patch);
      setSettings(savedSettings);
      return true;
    } catch {
      setStorageError(true);
      loadSettings()
        .then(setSettings)
        .catch(() => setSettingsLoadState('error'));
      return false;
    }
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const patch = { theme: nextTheme };

    if (!backgroundImage) {
      const nextBackgroundColor = getEquivalentBackgroundPresetColor(backgroundColor, nextTheme);
      if (nextBackgroundColor) patch.backgroundColor = nextBackgroundColor;
    }

    updateSettings(patch);
  }

  function toggleIconStyle() {
    updateSettings({ iconStyle: iconStyle === 'favicon' ? 'simple' : 'favicon' });
  }

  function handleChangeSearchEngine(engineId) {
    updateSettings({ searchEngine: engineId });
  }

  function handleToggleClock() {
    updateSettings({ showClock: !showClock });
  }

  function handleToggleSearch() {
    updateSettings({ showSearch: !showSearch });
  }

  function handleToggleMemory() {
    if (!showMemory && globalThis.chrome?.permissions) {
      chrome.permissions.request({ permissions: ['system.memory'] }, (granted) => {
        if (chrome.runtime.lastError) {
          setStorageError(true);
          return;
        }
        if (granted) updateSettings({ showMemory: true });
      });
      return;
    }

    if (showMemory && globalThis.chrome?.permissions?.remove) {
      chrome.permissions.remove({ permissions: ['system.memory'] }, () => {
        if (chrome.runtime.lastError) {
          setStorageError(true);
          return;
        }
        updateSettings({ showMemory: false });
      });
      return;
    }

    updateSettings({ showMemory: !showMemory });
  }

  function handleChangeNoteSort(nextSort) {
    updateSettings({ noteSort: nextSort });
  }

  function handleOpenNoteCapture() {
    const requestId = crypto.randomUUID();
    setNotesRequest({ type: 'capture', requestId, captureSessionId: requestId });
  }

  function handleOpenNoteLibrary() {
    const requestId = crypto.randomUUID();
    setNotesRequest({ type: 'library', requestId, captureSessionId: null });
  }

  function handleExpandNoteCapture() {
    setNotesRequest((currentRequest) =>
      currentRequest ? { ...currentRequest, type: 'library' } : currentRequest,
    );
  }

  function handleChangeLocale(nextLocale) {
    updateSettings({ locale: nextLocale });
  }

  async function handleRequestFaviconPermission() {
    const granted = await faviconPermission.requestPermission();
    if (granted) await updateSettings({ faviconFallback: true });
    return granted;
  }

  async function handleRevokeFaviconPermission() {
    const revoked = await faviconPermission.revokePermission();
    if (revoked) await updateSettings({ faviconFallback: false });
    return revoked;
  }

  function handleChangeBackgroundColor(color, nextTheme) {
    const presetTheme = nextTheme || getBackgroundPresetTheme(color) || theme;
    updateSettings({
      backgroundColor: color,
      backgroundImage: '',
      theme: presetTheme,
    });
  }

  function handleChangeBackgroundImage(dataUrl) {
    return updateSettings({ backgroundImage: dataUrl });
  }

  function handleResetBackground() {
    updateSettings({
      backgroundColor: '',
      backgroundImage: '',
      theme: getSystemTheme(),
    });
  }

  function getBackgroundStyle() {
    if (renderedBackgroundImage) {
      return {
        backgroundImage: `url(${renderedBackgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return backgroundColor ? { backgroundColor } : {};
  }

  function handleRetrySettingsLoad() {
    setSettingsLoadState('loading');
    loadPreparedSettings()
      .then(({ settings: savedSettings, demoError }) => {
        setSettings(savedSettings);
        setStorageError(Boolean(demoError));
        setSettingsLoadState('ready');
      })
      .catch(() => setSettingsLoadState('error'));
  }

  if (settingsLoadState === 'loading') return <AppLoading />;
  if (settingsLoadState === 'error') return <AppRecovery onRetry={handleRetrySettingsLoad} />;

  const className = ['new-tab', backgroundImage ? 'new-tab--custom-background' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <main
      className={className}
      data-background-kind={backgroundAppearance.kind}
      lang={locale}
      style={{ ...getBackgroundStyle(), ...backgroundAppearance.cssVariables }}
    >
      {showClock && <Clock />}
      {showSearch && <SearchBar search_engine={searchEngine} />}
      <SpeedDial
        icon_style={iconStyle}
        has_favicon_permission={faviconPermission.hasPermission}
        on_request_favicon_permission={handleRequestFaviconPermission}
      />
      <Suspense
        fallback={
          <span className="visually-hidden" role="status">
            {t('app_loading')}
          </span>
        }
      >
        {notesRequest && (
          <NotePanel
            request={notesRequest}
            note_sort={noteSort}
            on_close={() => setNotesRequest(null)}
            on_open_library={handleExpandNoteCapture}
            on_change_sort={handleChangeNoteSort}
          />
        )}
      </Suspense>
      <Footer
        on_open_settings={() => setSettingsOpen(true)}
        on_open_note_capture={handleOpenNoteCapture}
        on_open_note_library={handleOpenNoteLibrary}
        show_memory={showMemory}
      />
      <Suspense
        fallback={
          <span className="visually-hidden" role="status">
            {t('app_loading')}
          </span>
        }
      >
        {settingsOpen && (
          <SettingsPanel
            is_open={settingsOpen}
            on_close={() => setSettingsOpen(false)}
            iconStyle={iconStyle}
            onToggleIconStyle={toggleIconStyle}
            theme={theme}
            onToggleTheme={toggleTheme}
            search_engine={searchEngine}
            on_change_search_engine={handleChangeSearchEngine}
            show_clock={showClock}
            on_toggle_clock={handleToggleClock}
            show_search={showSearch}
            on_toggle_search={handleToggleSearch}
            show_memory={showMemory}
            on_toggle_memory={handleToggleMemory}
            locale={locale}
            on_change_locale={handleChangeLocale}
            favicon_permission={faviconPermission}
            on_request_favicon_permission={handleRequestFaviconPermission}
            on_revoke_favicon_permission={handleRevokeFaviconPermission}
            bg_color={backgroundColor}
            bg_image={backgroundImage}
            on_change_bg_color={handleChangeBackgroundColor}
            on_change_bg_image={handleChangeBackgroundImage}
            on_reset_bg={handleResetBackground}
          />
        )}
      </Suspense>
      {storageError && (
        <div className="toast toast--error" role="alert">
          <span>{t('app_storage_error')}</span>
          <button type="button" className="toast-action" onClick={() => setStorageError(false)}>
            {t('modal_cancel')}
          </button>
        </div>
      )}
      {/* /.new-tab */}
    </main>
  );
}

export default App;
