# Tabibe

Language: English | [Türkçe](docs/tr/README.md)

A modern, minimalist, and high-performance new tab extension for Chromium-based browsers.

**Current version:** `1.1.0`

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
- Keyboard-accessible left/right reordering and site movement between the main screen and folders
- Multi-note workspace with title, content, search, active/archive views, pinning, left/right placement, and responsive full-screen layouts
- Empty-note prevention
- Note deletion confirmation with undo support
- Light and dark theme support
- Light/dark background color groups with automatic theme switching
- Matched background color switching when toggling themes
- Local background image upload
- Resilient site icons with a pinned local Simple Icons catalog, optional Chrome favicons, and an always-available monogram fallback
- Searchable icon selector with automatic, brand, site, and letter modes
- WCAG-aware contrast, visible keyboard focus, reduced-motion support, and minimum target sizing
- Recoverable loading and storage error states with retry, validated backup, guarded reset, and one-step undo
- Explicit safety decisions for public HTTP addresses and duplicate URLs, with distinct local/private network notices
- JSON import/export for all app data, including sites, folders, settings, and multi-note data
- 10 UI languages: Türkçe, English, Español, Português, Русский, العربية, हिन्दी, বাংলা, 中文, 日本語
- Persistent in-app language selection, localized extension metadata for all 10 languages, and right-to-left Arabic layouts
- Lazy-loaded notes, settings, and modal tools with event-driven browser usage counters
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

## Architecture

Tabibe separates persisted data access, domain operations, drag-and-drop coordination, and presentation overlays. Site, folder, and note mutations are implemented as tested pure operations; React hooks own asynchronous persistence and lifecycle behavior; top-level recovery boundaries keep unexpected rendering or storage failures from producing a blank new tab. Optional panels are loaded on demand, browser counters react to Chrome events, and component CSS is organized around enforced design tokens.

## Data and Privacy

Tabibe stores data in the user's browser. Sites, folders, notes, settings, and background preferences are managed through a versioned state repository backed by `chrome.storage.local`, with `localStorage` used in local development. Import/export is handled locally through validated JSON files with preview, rollback, and undo support.

Brand icons are bundled with the extension and do not require a third-party icon service. Chrome's favicon provider is optional and is enabled only after explicit user permission; a local monogram remains available when no brand or favicon can be resolved.

Tabibe does not include analytics, advertising, telemetry, or a remote application backend. See the [Privacy Policy](docs/privacy-policy.md) for the complete permission and data-handling disclosure. The public [Chrome Web Store listing copy](docs/store-listing.md) documents the same behavior and permission scope.

## Development

### Requirements

- Node.js 20.19+ (Node.js 22 recommended)
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
npm run lighthouse
npm run audit
npm run package:extension
npm run check:release
```

### Load as an Extension

1. Build the project: `npm run build`
2. Open `chrome://extensions` in a Chromium-based browser
3. Enable "Developer mode"
4. Use "Load unpacked" and select the `dist/` folder

## License

This project is released under the [GPL v3](LICENSE) license.

Bundled brand icons are sourced from [Simple Icons](https://simpleicons.org/) `16.26.0` and retain the upstream CC0-1.0 license and trademark disclaimer in the extension package.
