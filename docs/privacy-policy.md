# Tabibe Privacy Policy

Language: English | [Türkçe](privacy-policy.tr.md)

**Effective date:** July 17, 2026

Tabibe is a Chromium new-tab extension designed to work locally in the user's browser. It does not include analytics, advertising, telemetry, user accounts, or a remote application backend.

## Data Stored

Tabibe stores quick-access sites and folders, notes, appearance settings, uploaded background images, and feature preferences in `chrome.storage.local`. This information remains in the local browser profile and is not transmitted to the developer.

Backup export creates a JSON file on the user's device. Backup import reads only the file selected by the user, validates it locally, and writes accepted data to local extension storage.

## Permissions

- `storage` is required to save extension data in the local browser profile.
- `favicon` is optional. When the user explicitly enables site icons, Tabibe may use Chrome's built-in favicon provider for URLs already known by the browser. The permission can be revoked from Tabibe's settings.
- `system.memory` is optional. It is requested only when the user enables the memory indicator and can be revoked by disabling that indicator.

Tabibe does not request access to browsing history, tab metadata, page content, cookies, downloads, camera, microphone, location, or contacts.

## Network Activity

Brand icons are bundled locally from Simple Icons. Tabibe does not send saved site addresses to an external icon service and does not make telemetry or analytics requests.

Network navigation occurs only when the user opens a saved site, submits a search to the selected search provider, or follows a visible project/developer link.

## Data Control

Users can edit or delete individual sites, folders, and notes, reset appearance settings, export a backup, restore a validated backup, or remove all extension data by uninstalling Tabibe and clearing its local storage through the browser.

## Changes

Material changes to this policy will be documented with the related Tabibe release. The effective date above will be updated when the policy changes.

## Contact

Privacy questions can be submitted through the project's [GitHub repository](https://github.com/tercan/tabibe).
