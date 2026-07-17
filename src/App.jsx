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
import { createDefaultSettings, loadSettings, saveSettings } from './lib/storage.js';
import { detectLocale } from './i18n/translationContext.js';
import useFaviconPermission from './hooks/useFaviconPermission.js';
import useBackgroundImageUrl from './hooks/useBackgroundImageUrl.js';

const NotePanel = lazy(() => import('./components/NotePanel.jsx'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel.jsx'));

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const { locale, setLocale, t } = useTranslation();
  const faviconPermission = useFaviconPermission();
  const [settings, setSettings] = useState(() => createDefaultSettings(getSystemTheme()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notePanelOpen, setNotePanelOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [settingsLoadState, setSettingsLoadState] = useState('loading');

  const {
    theme,
    iconStyle,
    searchEngine,
    showClock,
    showSearch,
    notePinned,
    backgroundColor,
    backgroundImage,
    showMemory,
    locale: selectedLocale,
  } = settings;
  const renderedBackgroundImage = useBackgroundImageUrl(backgroundImage);

  useEffect(() => {
    let active = true;

    loadSettings()
      .then((savedSettings) => {
        if (active) {
          setSettings(savedSettings);
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

  function handleToggleNotePin() {
    updateSettings({ notePinned: !notePinned });
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
    loadSettings()
      .then((savedSettings) => {
        setSettings(savedSettings);
        setSettingsLoadState('ready');
      })
      .catch(() => setSettingsLoadState('error'));
  }

  if (settingsLoadState === 'loading') return <AppLoading />;
  if (settingsLoadState === 'error') return <AppRecovery onRetry={handleRetrySettingsLoad} />;

  const className = [
    'new-tab',
    notePinned ? 'new-tab--pinned' : '',
    backgroundImage ? 'new-tab--custom-background' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={className} lang={locale} style={getBackgroundStyle()}>
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
        {(notePanelOpen || notePinned) && (
          <NotePanel
            is_open={notePanelOpen}
            is_pinned={notePinned}
            on_close={() => setNotePanelOpen(false)}
            on_toggle_pin={handleToggleNotePin}
          />
        )}
      </Suspense>
      <Footer
        theme={theme}
        on_toggle_theme={toggleTheme}
        icon_style={iconStyle}
        on_toggle_icon_style={toggleIconStyle}
        on_open_settings={() => setSettingsOpen(true)}
        on_open_notes={() => setNotePanelOpen(true)}
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
