import { describe, expect, it } from 'vitest';
import {
  deleteFolder,
  deleteSite,
  getAllSites,
  getCurrentFolderId,
  moveFolderChild,
  moveRootItem,
  moveSiteToFolder,
  moveSiteToRoot,
  renameFolder,
  upsertSite,
} from './speedDialOperations.js';

function createSites() {
  return [
    { id: 'a', name: 'A', url: 'https://a.example' },
    {
      id: 'folder',
      type: 'folder',
      name: 'Folder',
      children: [
        { id: 'b', name: 'B', url: 'https://b.example' },
        { id: 'c', name: 'C', url: 'https://c.example' },
      ],
    },
    { id: 'd', name: 'D', url: 'https://d.example' },
  ];
}

describe('speed dial operations', () => {
  it('flattens sites and resolves folder locations without mutation', () => {
    const sites = createSites();
    expect(getAllSites(sites).map((site) => site.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(getCurrentFolderId(sites, sites[1].children[0])).toBe('folder');
    expect(sites).toEqual(createSites());
  });

  it('inserts and relocates a site without mutating the source', () => {
    const sites = createSites();
    const inserted = upsertSite(
      sites,
      { name: 'E', url: 'https://e.example' },
      'folder',
      () => 'e',
    );
    const relocated = upsertSite(inserted, { ...inserted[0], name: 'A2' }, 'folder');

    expect(inserted[1].children.at(-1).id).toBe('e');
    expect(relocated.find((item) => item.id === 'folder').children.at(-1).name).toBe('A2');
    expect(sites).toEqual(createSites());
  });

  it('renames folders and reorders root items', () => {
    const sites = createSites();
    expect(renameFolder(sites, 'folder', 'Updated')[1].name).toBe('Updated');
    expect(moveRootItem(sites, 0, 2).map((item) => item.id)).toEqual(['folder', 'd', 'a']);
    expect(sites).toEqual(createSites());
  });

  it('reorders folder children', () => {
    const sites = createSites();
    expect(moveFolderChild(sites, 'folder', 0, 1)[1].children.map((site) => site.id)).toEqual([
      'c',
      'b',
    ]);
    expect(sites).toEqual(createSites());
  });

  it('moves sites between root and folders', () => {
    const sites = createSites();
    const inFolder = moveSiteToFolder(sites, 'a', 'folder');
    const atRoot = moveSiteToRoot(inFolder, 'b');

    expect(inFolder.map((item) => item.id)).toEqual(['folder', 'd']);
    expect(inFolder[0].children.map((site) => site.id)).toEqual(['b', 'c', 'a']);
    expect(atRoot.at(-1).id).toBe('b');
    expect(sites).toEqual(createSites());
  });

  it('rejects duplicate URLs when moving into a folder', () => {
    const sites = createSites();
    sites.push({ id: 'duplicate', name: 'Duplicate', url: 'https://b.example' });
    expect(moveSiteToFolder(sites, 'duplicate', 'folder')).toBeNull();
  });

  it('deletes a site from any location', () => {
    const sites = createSites();
    expect(deleteSite(sites, 'b')[1].children.map((site) => site.id)).toEqual(['c']);
    expect(deleteSite(sites, 'a').map((item) => item.id)).toEqual(['folder', 'd']);
    expect(sites).toEqual(createSites());
  });

  it('deletes folders with either move or delete semantics', () => {
    const sites = createSites();
    expect(deleteFolder(sites, 'folder', 'move').map((item) => item.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(deleteFolder(sites, 'folder', 'delete').map((item) => item.id)).toEqual(['a', 'd']);
    expect(sites).toEqual(createSites());
  });
});
