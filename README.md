# Tabibe

Language: English | [Türkçe](docs/tr/README.md)

A modern, minimalist, and high-performance new tab extension for Chromium-based browsers.

**Current version:** `0.4.1`

## About

Tabibe turns the new tab experience into a personal control and productivity space. It combines quick access, folders, notes, search, themes, background customization, and backup tools into a clean single-screen workflow.

### Core Features

- Clock and date view
- Search bar with Google, Bing, DuckDuckGo, and Yandex
- Quick access grid for site and folder management
- Add, edit, delete, and undo flows for sites and folders
- Add sites from inside folders, edit folders in place, and use a safe folder deletion decision screen
- Drag and drop on the main screen, inside folders, and from folders back to the main screen
- Clearer drop targets and move animations during drag and drop
- Multi-note system with title, content, search, active/archive views, and pinning
- Empty-note prevention
- Note deletion confirmation with undo support
- Light and dark theme support
- Light/dark background color groups with automatic theme switching
- Matched background color switching when toggling themes
- Local background image upload
- Resilient site icons with a pinned local Simple Icons catalog, optional Chrome favicons, and an always-available monogram fallback
- Searchable icon selector with automatic, brand, site, and letter modes
- WCAG-aware contrast, visible keyboard focus, reduced-motion support, and minimum target sizing
- JSON import/export for all app data, including sites, folders, settings, and multi-note data
- 10 UI languages: Türkçe, English, Español, Português, Русский, العربية, हिन्दी, বাংলা, 中文, 日本語
- Daily quotes: Turkish and English quote pools; other UI languages fall back to English quotes

### Design Philosophy

- Modern and minimalist flat design
- Sharp corners
- Solid colors, no gradients
- Clear and readable typography

## Technology Stack

- **UI Library:** React
- **Build Tool:** Vite
- **Styling:** Vanilla CSS
- **Extension Manifest:** Chrome Extension Manifest V3
- **Data Layer:** chrome.storage.local / localStorage

## Data and Privacy

Tabibe stores data in the user's browser. Sites, folders, notes, settings, and background preferences are managed through a versioned state repository backed by `chrome.storage.local`, with `localStorage` used in local development. Import/export is handled locally through validated JSON files with preview, rollback, and undo support.

Brand icons are bundled with the extension and do not require a third-party icon service. Chrome's favicon provider is optional and is enabled only after explicit user permission; a local monogram remains available when no brand or favicon can be resolved.

Tabibe does not include analytics, advertising, telemetry, or a remote application backend. See the [Privacy Policy](docs/privacy-policy.md) for the complete permission and data-handling disclosure.

## Development

### Requirements

- Node.js (v18+)
- npm or yarn
- Chromium-based browser such as Chrome, Edge, Brave, or Opera

### Installation

```bash
git clone https://github.com/tercan/tabibe.git
cd tabibe
npm install
```

### Development Server

```bash
npm run dev
```

### Quality Checks

```bash
npm run quality
npm run test:e2e
npm run audit
```

### Load as an Extension

1. Build the project: `npm run build`
2. Open `chrome://extensions` in a Chromium-based browser
3. Enable "Developer mode"
4. Use "Load unpacked" and select the `dist/` folder

## License

This project is released under the [GPL v3](LICENSE) license.

Bundled brand icons are sourced from [Simple Icons](https://simpleicons.org/) `16.26.0` and retain the upstream CC0-1.0 license and trademark disclaimer in the extension package.
