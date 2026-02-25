/**
 * 1. Default speed dial sites
 */

const DEFAULT_SITES = [
  { name: 'Google', url: 'https://www.google.com', icon_slug: 'google' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon_slug: 'youtube' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', icon_slug: 'wikipedia' },
  { name: 'ChatGPT', url: 'https://chatgpt.com', icon_slug: 'openai' },
  { name: 'Notion', url: 'https://www.notion.so', icon_slug: 'notion' },
  { name: 'Gmail', url: 'https://mail.google.com', icon_slug: 'gmail' },
  { name: 'Google Translate', url: 'https://translate.google.com', icon_slug: 'googletranslate' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon_slug: 'netflix' },
  { name: 'Spotify', url: 'https://open.spotify.com', icon_slug: 'spotify' },
  { name: 'Google Maps', url: 'https://maps.google.com', icon_slug: 'googlemaps' },
  { name: 'Google Drive', url: 'https://drive.google.com', icon_slug: 'googledrive' },
  { name: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon_slug: 'whatsapp' },
  { name: 'Instagram', url: 'https://www.instagram.com', icon_slug: 'instagram' },
  { name: 'Facebook', url: 'https://www.facebook.com', icon_slug: 'facebook' },
  { name: 'X', url: 'https://x.com', icon_slug: 'x' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', icon_slug: 'linkedin' },
  { name: 'Pinterest', url: 'https://www.pinterest.com', icon_slug: 'pinterest' },
  { name: 'Twitch', url: 'https://www.twitch.tv', icon_slug: 'twitch' },
];

const STORAGE_KEY = 'tabibe-sites';

/**
 * 2. Storage adapter — chrome.storage.local with localStorage fallback
 */

function has_chrome_storage() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

function storage_get(key) {
  return new Promise((resolve) => {
    if (has_chrome_storage()) {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    } else {
      // Fallback for dev server
      try {
        const raw = localStorage.getItem(key);
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    }
  });
}

function storage_set(key, value) {
  return new Promise((resolve) => {
    if (has_chrome_storage()) {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
      resolve();
    }
  });
}

/**
 * 3. CRUD operations for speed dial sites
 */

async function load_sites() {
  const sites = await storage_get(STORAGE_KEY);
  if (sites && Array.isArray(sites) && sites.length > 0) {
    return sites;
  }
  // First run: seed with defaults and persist
  await storage_set(STORAGE_KEY, DEFAULT_SITES);
  return DEFAULT_SITES;
}

async function save_sites(sites) {
  await storage_set(STORAGE_KEY, sites);
}

async function add_site(site) {
  const sites = await load_sites();
  sites.push(site);
  await save_sites(sites);
  return sites;
}

async function remove_site(url) {
  const sites = await load_sites();
  const filtered = sites.filter((s) => s.url !== url);
  await save_sites(filtered);
  return filtered;
}

async function update_site(original_url, updated_site) {
  const sites = await load_sites();
  const index = sites.findIndex((s) => s.url === original_url);
  if (index !== -1) {
    sites[index] = { ...sites[index], ...updated_site };
  }
  await save_sites(sites);
  return sites;
}

/**
 * 4. Folder operations
 */

async function add_folder(name) {
  const sites = await load_sites();
  const folder = {
    type: 'folder',
    id: `folder-${Date.now()}`,
    name,
    children: [],
  };
  sites.push(folder);
  await save_sites(sites);
  return sites;
}

async function remove_folder(folder_id) {
  const sites = await load_sites();
  const filtered = sites.filter((s) => s.id !== folder_id);
  await save_sites(filtered);
  return filtered;
}

async function update_folder(folder_id, updated) {
  const sites = await load_sites();
  const index = sites.findIndex((s) => s.id === folder_id);
  if (index !== -1) {
    sites[index] = { ...sites[index], ...updated };
  }
  await save_sites(sites);
  return sites;
}

async function add_site_to_folder(folder_id, site) {
  const sites = await load_sites();
  const folder = sites.find((s) => s.id === folder_id);
  if (folder && folder.type === 'folder') {
    folder.children.push(site);
  }
  await save_sites(sites);
  return sites;
}

async function remove_site_from_folder(folder_id, site_url) {
  const sites = await load_sites();
  const folder = sites.find((s) => s.id === folder_id);
  if (folder && folder.type === 'folder') {
    folder.children = folder.children.filter((c) => c.url !== site_url);
  }
  await save_sites(sites);
  return sites;
}

async function get_all_data() {
  const data = {};
  
  // 1. Get all from localStorage (settings, theme, etc.)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('tabibe-')) {
      data[key] = localStorage.getItem(key);
    }
  }

  // 2. Get from chrome.storage.local (sites, folders, etc.)
  if (has_chrome_storage()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        // Only include tabibe- keys
        Object.keys(result).forEach(key => {
          if (key.startsWith('tabibe-')) {
            data[key] = typeof result[key] === 'string' ? result[key] : JSON.stringify(result[key]);
          }
        });
        resolve(data);
      });
    });
  }

  return data;
}

async function set_all_data(data) {
  const keys = Object.keys(data);
  const chrome_data = {};

  for (const key of keys) {
    if (!key.startsWith('tabibe-')) continue;

    const value = data[key];
    
    // 1. Set to localStorage
    localStorage.setItem(key, value);

    // 2. Prepare for chrome.storage.local
    if (has_chrome_storage()) {
      try {
        // If it's a JSON string, try to parse it (sites list etc. are stored as objects in chrome.storage)
        chrome_data[key] = JSON.parse(value);
      } catch {
        chrome_data[key] = value;
      }
    }
  }

  // 3. Persist to chrome.storage.local
  if (has_chrome_storage() && Object.keys(chrome_data).length > 0) {
    return new Promise((resolve) => {
      chrome.storage.local.set(chrome_data, () => {
        resolve();
      });
    });
  }
}

export {
  DEFAULT_SITES,
  storage_get,
  storage_set,
  get_all_data,
  set_all_data,
  load_sites,
  save_sites,
  add_site,
  remove_site,
  update_site,
  add_folder,
  remove_folder,
  update_folder,
  add_site_to_folder,
  remove_site_from_folder,
};
