# Tabibe

Language: English | [Türkçe](docs/tr/README.md)

A modern, minimalist, and high-performance new tab extension for Chromium-based browsers.

**Current version:** `1.5.0`

## Download 1.5.0

- [Tabibe 1.5.0 ZIP](https://github.com/tercan/tabibe/releases/download/v1.5.0/tabibe-v1.5.0.zip)
- [GitHub release](https://github.com/tercan/tabibe/releases/tag/v1.5.0)
- [Website / Installation](https://tercan.github.io/tabibe/)

## About

Tabibe turns the new tab experience into a personal control and productivity space. It combines quick access, folders, notes, search, themes, background customization, and backup tools into a clean single-screen workflow.

### Core Features

- Saved site shortcuts and folders with drag-and-drop and keyboard reordering
- Local bundled brand icons, optional Chrome site icons and letter fallbacks
- Quick note capture from the footer or `Alt+Shift+N`
- A notes library with notebooks, tags, text search, pinned notes and archive views
- Markdown writing and preview, checklists, local save status and recovery drafts
- Revision-aware handling of conflicting note edits across tabs
- Browser-default search through Chrome Search API, plus explicitly selected alternatives
- Light/dark themes, solid background colors and images from your device
- Clock, date, local tab/window counts and an optional memory indicator
- Validated JSON backup import/export, preview and one-step restore undo
- 13 interface languages: English, Türkçe, Français, Deutsch, Italiano, Español, Português, Русский, العربية, हिन्दी, বাংলা, 中文 and 日本語
- Right-to-left Arabic, keyboard controls, reduced-motion support and layouts for narrow windows
- A bundled privacy policy available offline in all 13 languages

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

Search defaults to Chrome’s chosen provider through the `search` permission. You can explicitly choose another provider in Tabibe. Legacy unversioned provider preferences reset once to the browser default. Local storage and JSON backups are not encrypted by Tabibe; keep important backups safe.

## Development

### Requirements

- Node.js 22.19+ (Node.js 24 recommended)
- npm or yarn
- Chromium-based browser such as Chrome, Edge, Brave, or Opera

### Installation

```bash
git clone https://github.com/tercan/tabibe.git
cd tabibe
npm ci
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

### GitHub Pages

Run `npm run build:site` to generate the English and Turkish site from `docs/locales/`. Preview it with `npm run preview:site`. The public site is served from `main:/docs`; internal working documents stay outside version control in `documents/`.

### Load as an Extension

1. Build the project: `npm run build`
2. Open `chrome://extensions` in a Chromium-based browser
3. Enable "Developer mode"
4. Use "Load unpacked" and select the `dist/` folder

## License

This project is released under the [GPL v3](LICENSE) license.

Bundled brand icons are sourced from [Simple Icons](https://simpleicons.org/) `16.26.0` and retain the upstream CC0-1.0 license and trademark disclaimer in the extension package.
