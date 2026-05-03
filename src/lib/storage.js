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
    // Migration: ensure all items have an id
    let needs_save = false;
    for (const item of sites) {
      if (!item.id) {
        item.id = crypto.randomUUID();
        needs_save = true;
      }
      // Also migrate children inside folders
      if (item.type === 'folder' && item.children) {
        for (const child of item.children) {
          if (!child.id) {
            child.id = crypto.randomUUID();
            needs_save = true;
          }
        }
      }
    }
    if (needs_save) {
      await storage_set(STORAGE_KEY, sites);
    }
    return sites;
  }
  // First run: seed with defaults and persist
  const seeded = DEFAULT_SITES.map((s) => ({ ...s, id: crypto.randomUUID() }));
  await storage_set(STORAGE_KEY, seeded);
  return seeded;
}

async function save_sites(sites) {
  await storage_set(STORAGE_KEY, sites);
}

async function add_site(site) {
  const sites = await load_sites();
  sites.push({ ...site, id: site.id || crypto.randomUUID() });
  await save_sites(sites);
  return sites;
}

async function remove_site(url) {
  const sites = await load_sites();
  const filtered = sites.filter((s) => s.url !== url);
  await save_sites(filtered);
  return filtered;
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
  // Validate data structure
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid data format');
  }

  const keys = Object.keys(data).filter((k) => k.startsWith('tabibe-'));

  if (keys.length === 0 || keys.length > 50) {
    throw new Error('Invalid key count');
  }

  // Validate tabibe-sites if present
  if (data['tabibe-sites']) {
    try {
      const sites = typeof data['tabibe-sites'] === 'string'
        ? JSON.parse(data['tabibe-sites'])
        : data['tabibe-sites'];
      if (!Array.isArray(sites)) {
        throw new Error('tabibe-sites must be an array');
      }
    } catch {
      throw new Error('Invalid sites data');
    }
  }

  // Validate tabibe-notes if present
  if (data['tabibe-notes']) {
    try {
      const notes = typeof data['tabibe-notes'] === 'string'
        ? JSON.parse(data['tabibe-notes'])
        : data['tabibe-notes'];

      if (!Array.isArray(notes)) {
        throw new Error('tabibe-notes must be an array');
      }

      notes.forEach((note) => {
        if (!note || typeof note !== 'object' || Array.isArray(note)) {
          throw new Error('Invalid note item');
        }
      });
    } catch {
      throw new Error('Invalid notes data');
    }
  }

  const chrome_data = {};

  for (const key of keys) {
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
  get_all_data,
  set_all_data,
  load_sites,
  save_sites,
  add_site,
  remove_site,
  add_folder,
  remove_folder,
};
