const ROOT_FOLDER_ID = 'root';

function cloneSites(sites) {
  return sites.map((item) => {
    if (item.type === 'folder') {
      return {
        ...item,
        children: Array.isArray(item.children) ? item.children.map((child) => ({ ...child })) : [],
      };
    }

    return { ...item };
  });
}

function getAllSites(sites) {
  return sites.flatMap((item) => (item.type === 'folder' ? item.children || [] : [item]));
}

function getFolders(sites) {
  return sites.filter((item) => item.type === 'folder');
}

function locateSite(sites, siteId) {
  for (let index = 0; index < sites.length; index += 1) {
    const item = sites[index];

    if (item.type !== 'folder' && item.id === siteId) return { type: 'root', index };

    if (item.type === 'folder' && Array.isArray(item.children)) {
      const childIndex = item.children.findIndex((child) => child.id === siteId);
      if (childIndex !== -1) {
        return { type: 'folder', folderId: item.id, folderIndex: index, childIndex };
      }
    }
  }

  return null;
}

function getCurrentFolderId(sites, site) {
  if (!site || site.type === 'folder') return ROOT_FOLDER_ID;
  const location = locateSite(sites, site.id);
  return location?.type === 'folder' ? location.folderId : ROOT_FOLDER_ID;
}

function removeSiteFromDraft(sites, siteId) {
  const location = locateSite(sites, siteId);
  if (!location) return null;

  if (location.type === 'root') return sites.splice(location.index, 1)[0];
  return sites[location.folderIndex].children.splice(location.childIndex, 1)[0];
}

function insertSiteIntoDraft(sites, site, folderId) {
  if (folderId && folderId !== ROOT_FOLDER_ID) {
    const folder = sites.find((item) => item.type === 'folder' && item.id === folderId);
    if (folder) {
      folder.children.push(site);
      return;
    }
  }

  sites.push(site);
}

function upsertSite(sites, siteData, folderId, idFactory = () => crypto.randomUUID()) {
  const nextSites = cloneSites(sites);
  const location = siteData.id ? locateSite(nextSites, siteData.id) : null;
  const site = { ...siteData, id: siteData.id || idFactory() };

  if (!location) {
    insertSiteIntoDraft(nextSites, site, folderId);
    return nextSites;
  }

  if (location.type === 'root' && folderId === ROOT_FOLDER_ID) {
    nextSites[location.index] = site;
    return nextSites;
  }

  if (location.type === 'folder' && location.folderId === folderId) {
    nextSites[location.folderIndex].children[location.childIndex] = site;
    return nextSites;
  }

  removeSiteFromDraft(nextSites, site.id);
  insertSiteIntoDraft(nextSites, site, folderId);
  return nextSites;
}

function renameFolder(sites, folderId, name) {
  const nextSites = cloneSites(sites);
  const folder = nextSites.find((item) => item.type === 'folder' && item.id === folderId);
  if (!folder) return null;
  folder.name = name;
  return nextSites;
}

function moveRootItem(sites, fromIndex, toIndex) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= sites.length || toIndex >= sites.length) {
    return null;
  }

  const nextSites = cloneSites(sites);
  const [item] = nextSites.splice(fromIndex, 1);
  nextSites.splice(toIndex, 0, item);
  return nextSites;
}

function moveFolderChild(sites, folderId, fromIndex, toIndex) {
  const nextSites = cloneSites(sites);
  const folder = nextSites.find((item) => item.type === 'folder' && item.id === folderId);

  if (
    !folder ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= folder.children.length ||
    toIndex >= folder.children.length
  ) {
    return null;
  }

  const [site] = folder.children.splice(fromIndex, 1);
  folder.children.splice(toIndex, 0, site);
  return nextSites;
}

function moveSiteToFolder(sites, siteId, folderId) {
  const nextSites = cloneSites(sites);
  const folder = nextSites.find((item) => item.type === 'folder' && item.id === folderId);
  const location = locateSite(nextSites, siteId);
  if (!folder || !location || location.type !== 'root') return null;

  const site = nextSites[location.index];
  if (site.type === 'folder' || folder.children.some((child) => child.url === site.url))
    return null;

  nextSites.splice(location.index, 1);
  folder.children.push(site);
  return nextSites;
}

function moveSiteToRoot(sites, siteId) {
  const nextSites = cloneSites(sites);
  const location = locateSite(nextSites, siteId);
  if (!location || location.type !== 'folder') return null;

  const [site] = nextSites[location.folderIndex].children.splice(location.childIndex, 1);
  nextSites.push(site);
  return nextSites;
}

function deleteSite(sites, siteId) {
  const nextSites = cloneSites(sites);
  const removed = removeSiteFromDraft(nextSites, siteId);
  return removed && removed.type !== 'folder' ? nextSites : null;
}

function deleteFolder(sites, folderId, mode) {
  const nextSites = cloneSites(sites);
  const index = nextSites.findIndex((item) => item.type === 'folder' && item.id === folderId);
  if (index === -1) return null;

  const folder = nextSites[index];
  if (mode === 'move') nextSites.splice(index, 1, ...folder.children);
  else nextSites.splice(index, 1);
  return nextSites;
}

export {
  ROOT_FOLDER_ID,
  cloneSites,
  deleteFolder,
  deleteSite,
  getAllSites,
  getCurrentFolderId,
  getFolders,
  locateSite,
  moveFolderChild,
  moveRootItem,
  moveSiteToFolder,
  moveSiteToRoot,
  renameFolder,
  upsertSite,
};
