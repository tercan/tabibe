import { useState, useEffect } from 'react';
import { useTranslation } from './hooks/useTranslation.jsx';
import Clock from './components/Clock.jsx';
import SearchBar from './components/SearchBar.jsx';
import SpeedDial from './components/SpeedDial.jsx';
import NotePanel from './components/NotePanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Footer from './components/Footer.jsx';

/**
 * 1. Theme detection and management
 */

function get_initial_theme() {
  const saved = localStorage.getItem('tabibe-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 2. Icon style management
 */

function get_initial_icon_style() {
  const saved = localStorage.getItem('tabibe-icon-style');
  if (saved === 'favicon' || saved === 'simple') return saved;
  return 'favicon';
}

/**
 * 3. Settings persistence helpers
 */

function get_setting(key, fallback) {
  const saved = localStorage.getItem(`tabibe-${key}`);
  if (saved === null) return fallback;
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return saved;
}

function set_setting(key, value) {
  localStorage.setItem(`tabibe-${key}`, String(value));
}

/**
 * 4. Main application component
 */

function App() {
  const { locale } = useTranslation();
  const [theme, set_theme] = useState(get_initial_theme);
  const [icon_style, set_icon_style] = useState(get_initial_icon_style);
  const [settings_open, set_settings_open] = useState(false);
  const [search_engine, set_search_engine] = useState(() => get_setting('search-engine', 'google'));
  const [show_clock, set_show_clock] = useState(() => get_setting('show-clock', true));
  const [show_search, set_show_search] = useState(() => get_setting('show-search', true));

  const [note_panel_open, set_note_panel_open] = useState(false);
  const [note_pinned, set_note_pinned] = useState(() => get_setting('note-pinned', false));
  const [bg_color, set_bg_color] = useState(() => get_setting('bg-color', ''));
  const [bg_image, set_bg_image] = useState(() => get_setting('bg-image', ''));
  const [show_memory, set_show_memory] = useState(() => get_setting('show-memory', false));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tabibe-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tabibe-icon-style', icon_style);
  }, [icon_style]);

  function reset_background() {
    set_bg_color('');
    set_bg_image('');
    set_setting('bg-color', '');
    set_setting('bg-image', '');
  }

  function toggle_theme() {
    set_theme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Reset background when manually toggling theme to ensure contrast
      reset_background();
      return next;
    });
  }

  function toggle_icon_style() {
    set_icon_style((prev) => (prev === 'favicon' ? 'simple' : 'favicon'));
  }

  function handle_change_search_engine(engine_id) {
    set_search_engine(engine_id);
    set_setting('search-engine', engine_id);
  }

  function handle_toggle_clock() {
    set_show_clock((prev) => {
      set_setting('show-clock', !prev);
      return !prev;
    });
  }

  function handle_toggle_search() {
    set_show_search((prev) => {
      set_setting('show-search', !prev);
      return !prev;
    });
  }


  function handle_toggle_memory() {
    if (!show_memory && typeof chrome !== 'undefined' && chrome.permissions) {
      chrome.permissions.request({ permissions: ['system.memory'] }, (granted) => {
        if (granted) {
          set_show_memory(true);
          set_setting('show-memory', true);
        }
      });
    } else {
      set_show_memory((prev) => {
        set_setting('show-memory', !prev);
        return !prev;
      });
    }
  }

  function handle_toggle_note_panel() {
    set_note_panel_open((prev) => !prev);
  }

  function handle_toggle_note_pin() {
    set_note_pinned((prev) => {
      set_setting('note-pinned', !prev);
      return !prev;
    });
  }

  function handle_change_bg_color(color) {
    set_bg_color(color);
    set_bg_image('');
    set_setting('bg-color', color);
    set_setting('bg-image', '');

    // Auto-theme switching logic
    const light_colors = ['#f8f9fa', '#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec', '#f3e5f5'];
    if (light_colors.includes(color)) {
      set_theme('light');
    } else {
      set_theme('dark');
    }
  }

  function handle_change_bg_image(data_url) {
    // Convert dataURL to blob URL for safer usage
    try {
      const arr = data_url.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8 = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8[i] = bstr.charCodeAt(i);
      }
      const blob = new Blob([u8], { type: mime });
      const blob_url = URL.createObjectURL(blob);
      set_bg_image(blob_url);
    } catch {
      set_bg_image(data_url);
    }
    // Always persist the dataURL version (blob URLs don't survive reload)
    set_setting('bg-image', data_url);
  }

  function handle_reset_bg() {
    reset_background();
    
    // Reset theme to system preference on explicit BG reset from settings
    const system_dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set_theme(system_dark ? 'dark' : 'light');
  }

  function get_bg_style() {
    const style = {};
    if (bg_image) {
      style.backgroundImage = `url(${bg_image})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
    } else if (bg_color) {
      style.backgroundColor = bg_color;
    }
    return style;
  }

  return (
    <main className={`new-tab ${note_pinned ? 'new-tab--pinned' : ''}`} lang={locale} style={get_bg_style()}>
      {show_clock && <Clock />}
      {show_search && <SearchBar search_engine={search_engine} />}
      <SpeedDial icon_style={icon_style} theme={theme} />
      <NotePanel 
        is_open={note_panel_open} 
        is_pinned={note_pinned} 
        on_close={() => set_note_panel_open(false)} 
        on_toggle_pin={handle_toggle_note_pin}
      />
      <Footer
        theme={theme}
        on_toggle_theme={toggle_theme}
        icon_style={icon_style}
        on_toggle_icon_style={toggle_icon_style}
        on_open_settings={() => set_settings_open(true)}
        on_open_notes={() => set_note_panel_open(true)}
        show_memory={show_memory}
      />
      <SettingsPanel
        is_open={settings_open}
        on_close={() => set_settings_open(false)}
        search_engine={search_engine}
        on_change_search_engine={handle_change_search_engine}
        show_clock={show_clock}
        on_toggle_clock={handle_toggle_clock}
        show_search={show_search}
        on_toggle_search={handle_toggle_search}
        show_memory={show_memory}
        on_toggle_memory={handle_toggle_memory}
        bg_color={bg_color}
        bg_image={bg_image}
        on_change_bg_color={handle_change_bg_color}
        on_change_bg_image={handle_change_bg_image}
        on_reset_bg={handle_reset_bg}
      />
      {/* /.new-tab */}
    </main>
  );
}

export default App;
