# Tabibe Privacy Policy

English | [Türkçe](privacy-policy.tr.md) | [Français](privacy-policy.fr.md) | [Deutsch](privacy-policy.de.md) | [Italiano](privacy-policy.it.md)

**Effective date:** September 5, 2026

Tabibe is a Chromium new-tab extension designed to work locally in your browser. It does not include analytics, advertising, telemetry, user accounts, or a remote application backend.

## Data stored on your device

Tabibe stores quick-access sites and folders, notes and notebooks, appearance settings, uploaded background images, and feature preferences in chrome.storage.local. This information remains in your local browser profile and is not transmitted to the developer.

Backup export creates a JSON file on your device. Backup import reads only the file you select, validates it locally, and writes accepted data to local extension storage.

Saved URLs and names, note text, tags, timestamps, local record IDs and recovery drafts are used only for your new-tab workspace. Tabibe does not provide cloud sync. In the browser demo, localStorage is used instead of extension storage.

## Browser permissions

Tabibe follows the principle of least privilege:

- storage is required to save extension data in your local browser profile.
- search is required to send a search you submit to Chrome’s default search provider through the Chrome Search API. It does not change your browser’s search settings.
- favicon is optional. When you enable site icons, Tabibe may use Chrome’s built-in favicon provider for addresses already known by the browser. You can revoke this permission from Settings.
- system.memory is optional. It is requested only when you enable the memory indicator and can be revoked by disabling that indicator.

Tabibe reads tab/window counts for the local indicator, without the tabs permission or access to tab URLs, titles or browsing history. Optional memory values are displayed temporarily and are not stored or sent to the developer. It does not read other pages, cookies, passwords or device sensors.

## Network activity

Brand icons are bundled locally from Simple Icons. Saved site addresses are not sent to an external icon service, and Tabibe does not make analytics or telemetry requests.

Only searches you submit and links you open (including links in notes) navigate outside Tabibe. Search uses your browser’s default provider unless you explicitly choose another provider in Tabibe. Queries are not saved by Tabibe. Destination sites receive normal connection data, such as your IP address, under their own policies. Browser services operate under the browser provider’s policies.

## Your controls

You can edit or delete sites, folders, notes, and notebooks; change or reset appearance preferences; grant or revoke optional permissions; and export or restore a validated backup from Settings.

## Retention and deletion

Deleting an item removes it from the active workspace. Undo copies, recovery drafts and the snapshot created before a backup restore or data reset can retain earlier content locally. Clearing Tabibe’s entire extension storage or uninstalling it removes that local extension data. Exported JSON files and device/browser backups remain until you delete them separately.

## Storage and service limits

Local storage and exported JSON files are not encrypted by Tabibe. This is not a password vault; avoid storing passwords, payment details or other sensitive information. Protect your browser profile, device and backups. The developer does not hold a copy of your local workspace and cannot retrieve, delete or restore it remotely.

No guarantee of uninterrupted operation, loss-free storage, recovery or ongoing support is made. To the extent permitted by applicable law, the software is provided as is, without additional warranties. Mandatory consumer rights and liabilities that cannot legally be excluded remain unaffected. These limits do not reduce the data-use commitments in this policy.

## Limited Use

Tabibe’s use of user data, including information obtained through Chrome APIs, follows the Chrome Web Store User Data Policy and its Limited Use requirements. Data is used only for the disclosed new-tab features. It is not sold or used for advertising, profiling, credit decisions or unrelated purposes. The developer has no access to local workspace content unless you choose to share it for support.

## Changes to this policy

Material changes to this policy will be documented with the related Tabibe release. The effective date will be updated when the policy changes.

## Contact

Developer: Tercan Keskin. Use the project issue tracker for privacy questions. GitHub issues are public: do not attach private notes, backup files or credentials. Information you voluntarily submit is processed by GitHub under its policies and may be read by the developer to answer your request. The public project website is hosted by GitHub Pages, whose hosting policies also apply.

[Open the Tabibe issue tracker](https://github.com/tercan/tabibe/issues)

[English](https://tercan.github.io/tabibe/privacy/?lang=en)
