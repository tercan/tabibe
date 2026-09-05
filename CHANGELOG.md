# Changelog

Changelog language: English | [Türkçe](docs/tr/CHANGELOG.md)

This file documents all notable changes in the project.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

## [1.5.0] - 2026-09-06 00:30

### Added

- Added a notes library and quick capture flow with notebooks, tags, local recovery drafts and sample notes.
- Added French, German and Italian interface support, bringing supported languages to 13.
- Added an offline multilingual privacy policy and synchronized public policy pages.

### Changed

- Restored the original Pages logo, uppercase navigation, two-color hero, statistics and section order; added an accessible dark/light preview carousel and local Inter fonts.
- Simplified note controls and refined new-tab surfaces, keyboard actions and RTL layouts.
- Rebuilt the English and Turkish GitHub Pages site with actual screenshots, current features, release downloads, installation instructions and local data limits.
- Generate site pages from shared localized content, with local assets, metadata, sitemap and responsive accessibility checks.
- Raised the development runtime requirement to Node.js 22.19+ for the current Lighthouse toolchain.

### Fixed

- Respect the browser’s default search provider through Chrome Search API; migrate unversioned preferences once and preserve subsequent explicit choices.
- Corrected search-provider target sizing and keyboard focus.
- Verify release ZIP contents against the production build and include the project license.

### Security

- Updated the Lighthouse and supporting development dependencies; the full npm audit reports no known vulnerabilities.
- Clarified storage, backup, recovery-copy, support and Limited Use disclosures without promising encryption or guaranteed data recovery.

## [1.4.0] - 2026-07-18 00:48

### Added

- Added an icon-based Markdown toolbar for bold, italic, bulleted list, checklist, and link insertion with selection-preserving editing
- Added a responsive Markdown preview with GFM task lists, tables, code, headings, and external links
- Added Unicode-aware word and character counts to the note editor
- Added localized blank, daily plan, meeting, and checklist templates with an accessible keyboard-operated template menu

### Changed

- Extracted the note editor into a focused component and kept formatting, template generation, metrics, and URL policy in tested domain modules
- Changed the primary add-note control into a compact template chooser while preserving blank notes as the first option

### Security

- Rendered previews without raw HTML or remote images, restricted elements to an explicit allowlist, and limited links to `http`, `https`, and `mailto`

## [1.3.0] - 2026-07-18 00:31

### Added

- Added multi-select note management with select-all, bulk tag add/remove, archive, restore, and delete actions
- Added fast note capture with `Alt+Shift+N`, plus workspace `N` and `/` commands for a new note and search when focus is outside editable fields
- Added plural delete confirmation, feedback, and undo behavior for bulk note removal

### Changed

- Unified single and bulk deletion on the same ordered restore path so undo preserves original note positions
- Kept browser-reserved shortcuts and text-entry keys untouched while a title, content, search, or form field has focus

### Fixed

- Prevented a consumed quick-capture request from reopening as a blank note when the notes panel is mounted again

## [1.2.0] - 2026-07-18 00:12

### Added

- Added centralized, color-token-based note tags with create, rename, delete, multi-tag assignment, and tag-aware search
- Added pinned, tag, and date filters with persistent updated/created/title sorting and visible result counts
- Added explicit cross-tab conflict decisions to keep the local version, use the other tab version, or preserve both as copies

### Changed

- Migrated application data to schema v2 with note `tagIds`, monotonic revisions, centralized `noteTags`, and safe broken-reference cleanup
- Extended backup format v2 and import previews with note tags while preserving v1 and v0.3 backup compatibility

### Security

- Added optimistic revision checks that block stale note writes before they can silently overwrite a newer tab version

## [1.1.0] - 2026-07-17 23:43

### Added

- Added persistent left and right placement controls for the notes panel
- Added a full-screen notes workspace with responsive three-column, two-column, and single-view layouts

### Changed

- Suspended panel pinning while full screen is active and restored the saved pin state when returning to panel mode
- Preserved physical panel placement in right-to-left locales and extended focus trapping, scroll locking, and keyboard navigation to the full-screen workspace

## [1.0.1] - 2026-07-17 23:28

### Added

- Added distinct folder surfaces with item counts and a dedicated notebook icon for My Notes

### Changed

- Reduced quick-access icon sizing, softened folder colors, and strengthened focus indicators across interactive surfaces

### Fixed

- Prevented monogram fallbacks from remaining underneath loaded brand and favicon images
- Kept successfully loaded favicons visible by cancelling their fallback timeout

## [1.0.0] - 2026-07-17 04:16

### Added

- Added a release-readiness gate for version synchronization, permission scope, CSP, localization, runtime icon sources, secret scanning, documentation, and ZIP contents
- Added tested v0.3.0 backup migration with complete current-format re-export and automatic rollback verification for failed restore writes
- Added synchronized English and Turkish Chrome Web Store listing copy and direct privacy-policy links in the extension and public project pages
- Added a translation contract test that keeps all 10 UI locales aligned

### Changed

- Promoted the tested data, icon, accessibility, architecture, localization, and performance work from the 0.x roadmap to the stable 1.0.0 release baseline
- Extended CI to block releases that contain stale versions, broad permissions, forbidden files, external runtime icon services, or incomplete store documentation
- Aligned the documented and enforced development runtime with the Node.js 20.19+ requirement of the quality toolchain

### Security

- Verified that the stable package requires only `storage`, keeps `favicon` and `system.memory` optional, executes no remote code, and contains no known dependency vulnerabilities

## [0.6.1] - 2026-07-17 04:04

### Added

- Added Lighthouse release budgets for performance, accessibility, best practices, and SEO
- Added automated CSS architecture checks for tokens, spacing, shadows, gradients, radii, and letter spacing
- Added lifecycle tests for background object URLs and event-driven browser statistics

### Changed

- Lazy-loaded notes, settings, context menus, and site/folder modal flows to reduce initial JavaScript to 113,447 gzip bytes
- Replaced the 30-second tab/window polling loop with Chrome event listeners and visibility-based refresh
- Split the monolithic stylesheet into token, reset, base, layout, component, utility, responsive, and animation layers

### Fixed

- Released generated background object URLs when the image changes or the new-tab page closes
- Restored Escape-key closing and focus trapping when the note panel is reopened after its data loads asynchronously

## [0.6.0] - 2026-07-17 03:42

### Added

- Added keyboard-accessible left/right ordering, move-to-folder, and move-to-main actions with live position announcements and undo
- Added persistent language selection, root language/direction synchronization, and complete extension metadata for all 10 supported locales
- Added explicit duplicate URL decisions to update the existing site or add another copy
- Added public HTTP warnings with separate local development and private network notices
- Added asynchronous save progress and disabled states to site and folder forms

### Changed

- Replaced the context menu role model with a simpler native button and select action list, including trigger focus restoration
- Converted directional layout rules to logical CSS properties and added right-to-left handling for panels, toggles, toasts, and portals
- Moved low-priority tab, window, and memory counters into a compact mobile information menu

### Fixed

- Preserved the user's selected UI language across new-tab reloads instead of always following the browser language
- Prevented duplicate records from being silently accepted without an explicit user decision

## [0.5.0] - 2026-07-17 03:21

### Added

- Added tested domain operation modules for site, folder, and note mutations
- Added dedicated hooks for speed-dial persistence, drag coordination, note lifecycle management, and reference-counted body scroll locking
- Added application loading, storage recovery, guarded reset, backup-before-reset, and undo recovery states
- Added unit coverage for recovery flows, storage reset/undo, navigation, shared scroll locking, and extracted domain operations

### Changed

- Split speed-dial data, drag behavior, overlays, navigation, and mutation logic out of the main presentation component
- Split note persistence, filtering, creation, update, archive, restore, and delete behavior out of the note panel
- Centralized search-engine configuration and backup-file generation to remove component coupling and duplicated resource handling

### Fixed

- Replaced full-page reload recovery with an isolated speed-dial storage retry
- Prevented concurrent panels and modals from releasing another surface's body scroll lock
- Ensured object URLs created for backup downloads are always revoked

## [0.4.1] - 2026-07-17 02:53

### Added

- Added English and Turkish privacy policies that document local data handling, network behavior, and optional permissions
- Added automated theme contrast, keyboard focus, target size, reduced-motion, CSP, and permission-scope checks

### Changed

- Made optional favicon and system memory permissions revocable from the controls that enable them
- Expanded reduced-motion handling to CSS transitions, keyframes, and drag-and-drop move effects
- Hardened extension packaging against hidden files, source maps, credentials, archives, source directories, and symbolic links

### Fixed

- Updated light and dark theme tokens to meet WCAG 2.2 AA text, control, and focus contrast thresholds across every background preset
- Restored visible focus indicators and increased compact controls and settings links to a minimum 24 CSS pixel target

### Security

- Removed the unnecessary required `tabs` permission while retaining tested Tabs API navigation behavior
- Added an explicit extension-page CSP limited to local scripts, assets, images, and connections

## [0.4.0] - 2026-07-17 02:39

### Added

- Added a pinned local Simple Icons 16.26.0 catalog with searchable brand selection and bundled license notices
- Added optional Chrome favicon support that is requested only through an explicit user action
- Added deterministic local monograms so every saved site has a visible offline fallback
- Added automatic, brand, site, and letter icon preferences with a live preview in the site form

### Changed

- Replaced the legacy icon slug field with a structured icon preference model and automatic migration
- Replaced runtime Iconify, Simple Icons CDN, and Google S2 icon requests with local assets and Chrome's built-in favicon provider

### Fixed

- Fixed missing site icons when no Simple Icons match exists or an image request fails, times out, or is unavailable offline
- Fixed cached local SVG loads remaining on the monogram fallback because the image load event completed before state synchronization

## [0.3.1] - 2026-07-17 02:17

### Added

- Added a versioned application state schema and a single asynchronous storage repository for sites, folders, notes, and settings
- Added unit, extension E2E, accessibility, lint, format, dependency audit, bundle budget, and package validation quality gates
- Added import preview, staged restore verification, automatic rollback, and one-step restore undo

### Changed

- Optimized uploaded background images locally before storage and added file type and size validation
- Updated note persistence with visible save states and lifecycle flushing when the new-tab page is hidden or closed
- Updated site and folder mutations to restore the previous UI state and report an error when persistent storage fails

### Fixed

- Preserved intentionally empty dashboards during migration instead of repopulating default sites
- Prevented empty notes and invalid imported data from entering persistent state
- Fixed unsafe or unsupported URL protocols being accepted through add, edit, navigation, or backup restore flows

### Security

- Updated vulnerable build dependencies and verified the dependency audit with zero known vulnerabilities
- Restricted stored background images to supported raster data URLs and bounded state field sizes

## [0.3.0] - 2026-05-03 17:54

### Added

- Added a multi-note system with title, content, pinning, search, active/archive views, and undoable deletion instead of a single note field
- Added automatic migration from the legacy `tabibe-note` data into the new `tabibe-notes` multi-note structure

### Changed

- Converted the note panel into a productivity panel with note list and editor flows
- Updated the note panel to open on the list first and switch to a single-column editor view with a back button when a note is selected
- Tightened the note list by removing excerpt and date rows so long titles have more room
- Moved the active/archive filters next to the search input and made them more compact
- Added stronger borders and active/hover emphasis to note rows so notes are easier to distinguish
- Updated note deletion with an in-panel confirmation screen before undoable deletion
- Removed the large add site and add folder cards from the main quick access grid; add actions now live in the top-right toolbar
- Converted folder modal header actions from text buttons to accessible icon buttons
- Split background colors into light/dark groups and updated theme switching to follow the selected color group automatically
- Expanded import validation to include the `tabibe-notes` array

## [0.2.0] - 2026-05-03 02:40

### Added

- Added a folder deletion decision screen with options to move folder contents to the main screen or delete them with the folder
- Added visible add site, add folder, and management-mode toolbar controls to the quick access area
- Added a visible action button on site and folder cards as an alternative to right-click actions
- Added undo notifications for site deletion, folder deletion, removing from folder, and moving to folder
- Added target location selection, URL-based name/icon suggestions, card preview, and duplicate URL warning to the site add/edit form
- Added add site from folder, edit folder, safe folder deletion, and empty-state action support to the folder modal
- Added drag-and-drop sorting for sites inside folders
- Added drag-and-drop support for moving sites from a folder back to the main screen
- Added an animated target card preview on the main grid while dragging from a folder to the main screen
- Added shared focus trap and focus restoration infrastructure for modals and panels
- Added accessible status messages for import/export flows in the settings panel

### Changed

- Made folder deletion safer by moving contained sites to the main screen by default
- Updated the optional icon slug field in the site add/edit form to behave as a manual override
- Updated quick access cards to open edit flows in management mode instead of navigating
- Added new quick access UI strings to all existing translation files
- Made Escape/Tab keyboard behavior consistent across the site modal, folder modal, note panel, and settings panel
- Moved import/export feedback in the settings panel from `alert()` to inline `aria-live` messages
- Simplified quick access management controls into icon-focused actions positioned independently in the top-right corner
- Added custom move animation so target icons make room during main-screen and in-folder drag-and-drop sorting
- Fixed icon style selection so favicon and Simple Icons modes change the real source priority
- Added favicon-based black-and-white hybrid icons when a site is not available in Simple Icons

### Fixed

- Added a theme-aware clock surface so time and date remain readable over background images in light and dark themes
- Fixed theme toggling while a background image is loaded so it no longer resets the image
- Fixed theme toggling so a selected preset background color moves to the matching color in the opposite light/dark group
- Fixed the archived empty state in the note panel so it is no longer pushed to the bottom
- Prevented empty notes from being added to the note list or persisted storage
- Fixed the optional icon slug field being automatically refilled from the URL during save when left blank
- Fixed folder edit modal save/cancel from inside a folder so the user stays in the folder
- Fixed add site modal save/cancel from inside a folder so the user stays in the folder
- Fixed favicon-based black-and-white fallback icons not appearing for sites missing from Simple Icons because of CSS masking
- Fixed a risk where a site could disappear when moving to a folder that already contained the same URL
- Fixed dropping an icon over a folder triggering icon-folder sorting instead of folder move behavior
- Restored icon-folder position swapping through edge zones while keeping folder move as the default behavior
- Made drops started in the center of a folder count as folder moves even before the hover delay completes
- Fixed folder edit save failures caused by using an old storage snapshot instead of the current quick access list
- Prevented the folder edit modal from opening with stale form state and silently swallowing save errors
- Fixed folder edit modal crashes when opening with folder data that has no URL field

## [0.1.2] - 2026-05-03 02:29

### Changed

- Updated the in-app version display to read from `package.json` at build time

### Fixed

- Synchronized version references in `package.json`, `package-lock.json`, `manifest.json`, and the settings screen as `0.1.2`
- Removed the unused legacy `APP_VERSION` constant

## [0.1.1] - 2026-02-25 17:45

### Added

- Added a modern landing page under `docs/`, aligned with the project design system using a dark theme and sharp corners
- Added English and Turkish language support for the landing page
- Updated `package.json` and `manifest.json` versions to `0.1.1`

## [0.1.0] - 2026-02-25 15:24

### Added

- Set up the Vite + React project foundation
- Created the Chrome Extension Manifest V3 configuration with `newtab` override and `storage` permission
- Built the global Vanilla CSS architecture with CSS reset, design tokens, and light/dark themes
- Added Clock, SearchBar, SpeedDial, NotePanel, SettingsPanel, and Footer components
- Added drag-and-drop site sorting and foldering support
- Added the site add/edit modal (`SiteModal`)
- Added the right-click context menu (`ContextMenu`)
- Added multilingual support for TR, EN, ZH, ES, HI, AR, PT, BN, RU, and JA
- Added the GPL v3 license file
- Defined responsive design breakpoints
- Created the shared `CloseIcon` component
- Added unique site ID support with UUID and backward-compatible migration
- Added optional `system.memory` permission and a settings toggle
- Added the `show_memory` setting for memory status display
- Added Simple Icons whitelist caching with a 30-day TTL
- Paused footer polling with the Page Visibility API
- Defined CSS `@keyframes` animations (`fade_in`, `slide_up`)
- Added an extension information card to the settings panel
- Added backup file date-time formatting as `YYYYMMDD-HHmm`
- Added file size and data shape validation for imports
- Created `README.md`, `CHANGELOG.md`, and `.gitignore`

### Changed

- Reworked icon priority as Simple Icon to Favicon to default globe
- Fixed Google Favicon API requests by sending the origin with protocol (`https://`)
- Added viewport overflow handling for ContextMenu
- Added scroll locking while the folder modal is open
- Added `chrome.runtime.lastError` checks in Footer
- Increased the footer polling interval from 5 seconds to 30 seconds
- Added background image storage conversion from `dataURL` to `blob URL`
- Expanded the drag-and-drop target area to full width
- Moved drop target highlighting onto the `icon-wrapper`

### Fixed

- Removed dead code (`show_note`, unused props, CRUD functions)
- Changed site matching from URL-based to ID-based
- Fixed NotePanel overlay accessibility (`aria-hidden` to `role="presentation"`)
- Fixed the icon slug field not being saveable as empty during edit
- Prevented Simple Icons 404 errors with whitelist checks
- Fixed double encoding in the default globe icon data URI
- Fixed `handle_icon_error` data URI string comparison

### Security

- Moved `system.memory` permission to `optional_permissions`
- Added structural validation for imported data, including max 50 keys and sites array checks
