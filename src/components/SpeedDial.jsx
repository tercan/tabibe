import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { load_sites, save_sites } from '../lib/storage.js';
import speedDialMoveAnimation from '../lib/speedDialMotion.js';
import SiteModal from './SiteModal.jsx';
import ContextMenu from './ContextMenu.jsx';
import Folder from './Folder.jsx';
import SpeedDialIcon from './SpeedDialIcon.jsx';
import FolderDeleteModal from './FolderDeleteModal.jsx';

/**
 * 1. Icon URL helpers
 */

const ROOT_FOLDER_ID = 'root';
const FOLDER_DROP_DELAY = 250;
const FOLDER_SWAP_DELAY = 650;
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function get_favicon_url(site_url) {
  try {
    const parsed = new URL(site_url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return `https://www.google.com/s2/favicons?domain=${parsed.origin}&sz=64`;
  } catch {
    return '';
  }
}

function get_simple_icon_url(slug, theme) {
  const color = theme === 'dark' ? 'e8eaed' : '212121';
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}

function get_suggested_icon_slug(site_url) {
  try {
    const parsed = new URL(site_url);
    return parsed.hostname.replace(/^www\./, '').split('.')[0].toLowerCase();
  } catch {
    return '';
  }
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function FolderPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * 2. Site list helpers
 */

function clone_sites(sites) {
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

function get_all_sites(sites) {
  const all_sites = [];

  sites.forEach((item) => {
    if (item.type === 'folder') {
      (item.children || []).forEach((child) => all_sites.push(child));
      return;
    }

    all_sites.push(item);
  });

  return all_sites;
}

function get_folders(sites) {
  return sites.filter((item) => item.type === 'folder');
}

function locate_site(sites, site_id) {
  for (let index = 0; index < sites.length; index += 1) {
    const item = sites[index];

    if (item.type !== 'folder' && item.id === site_id) {
      return { type: 'root', index };
    }

    if (item.type === 'folder' && Array.isArray(item.children)) {
      const child_index = item.children.findIndex((child) => child.id === site_id);
      if (child_index !== -1) {
        return { type: 'folder', folder_id: item.id, folder_index: index, child_index };
      }
    }
  }

  return null;
}

function get_current_folder_id(sites, site) {
  if (!site || site.type === 'folder') return ROOT_FOLDER_ID;

  const location = locate_site(sites, site.id);
  if (location && location.type === 'folder') return location.folder_id;

  return ROOT_FOLDER_ID;
}

function remove_site_by_id(sites, site_id) {
  const location = locate_site(sites, site_id);
  if (!location) return null;

  if (location.type === 'root') {
    const [removed] = sites.splice(location.index, 1);
    return removed;
  }

  const folder = sites[location.folder_index];
  const [removed] = folder.children.splice(location.child_index, 1);
  return removed;
}

function insert_site(sites, site, folder_id) {
  if (folder_id && folder_id !== ROOT_FOLDER_ID) {
    const folder = sites.find((item) => item.type === 'folder' && item.id === folder_id);
    if (folder) {
      folder.children = Array.isArray(folder.children) ? folder.children : [];
      folder.children.push(site);
      return;
    }
  }

  sites.push(site);
}

function upsert_site(sites, site_data, folder_id) {
  const updated_sites = clone_sites(sites);
  const existing_location = site_data.id ? locate_site(updated_sites, site_data.id) : null;
  const site = {
    ...site_data,
    id: site_data.id || crypto.randomUUID(),
  };

  if (!existing_location) {
    insert_site(updated_sites, site, folder_id);
    return updated_sites;
  }

  if (existing_location.type === 'root' && folder_id === ROOT_FOLDER_ID) {
    updated_sites[existing_location.index] = site;
    return updated_sites;
  }

  if (existing_location.type === 'folder' && existing_location.folder_id === folder_id) {
    updated_sites[existing_location.folder_index].children[existing_location.child_index] = site;
    return updated_sites;
  }

  remove_site_by_id(updated_sites, site.id);
  insert_site(updated_sites, site, folder_id);
  return updated_sites;
}

function update_folder_name(sites, folder_id, name) {
  const updated_sites = clone_sites(sites);
  const folder_index = updated_sites.findIndex((item) => item.type === 'folder' && item.id === folder_id);

  if (folder_index === -1) {
    return null;
  }

  updated_sites[folder_index] = {
    ...updated_sites[folder_index],
    name,
  };

  return updated_sites;
}

function move_folder_child(sites, folder_id, from_index, to_index) {
  const updated_sites = clone_sites(sites);
  const folder = updated_sites.find((item) => item.type === 'folder' && item.id === folder_id);

  if (!folder || !Array.isArray(folder.children)) {
    return null;
  }

  if (
    from_index < 0
    || to_index < 0
    || from_index >= folder.children.length
    || to_index >= folder.children.length
  ) {
    return null;
  }

  const [removed_site] = folder.children.splice(from_index, 1);
  folder.children.splice(to_index, 0, removed_site);

  return updated_sites;
}

function is_in_folder_swap_zone(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const edge_x = rect.width * 0.12;
  const edge_y = rect.height * 0.12;

  return x < edge_x
    || x > rect.width - edge_x
    || y < edge_y
    || y > rect.height - edge_y;
}

/**
 * 3. SpeedDial component
 */

function SpeedDial({ icon_style, theme }) {
  const { t } = useTranslation();
  const [sites, set_sites] = useState([]);
  const [is_loading, set_is_loading] = useState(true);
  const [modal_open, set_modal_open] = useState(false);
  const [modal_mode, set_modal_mode] = useState('site');
  const [editing_site, set_editing_site] = useState(null);
  const [modal_folder_id, set_modal_folder_id] = useState(ROOT_FOLDER_ID);
  const [folder_delete_candidate, set_folder_delete_candidate] = useState(null);
  const [context_menu, set_context_menu] = useState(null);
  const [manage_mode, set_manage_mode] = useState(false);
  const [undo_state, set_undo_state] = useState(null);
  const [drag_index, set_drag_index] = useState(null);
  const [drag_over_index, set_drag_over_index] = useState(null);
  const [drag_over_folder_id, set_drag_over_folder_id] = useState(null);
  const [folder_child_drag_state, set_folder_child_drag_state] = useState(null);
  const [folder_child_drag_over_index, set_folder_child_drag_over_index] = useState(null);
  const drag_node = useRef(null);
  const dragging_site_ref = useRef(null);
  const drag_click_block_ref = useRef(false);
  const sites_ref = useRef([]);
  const drag_index_ref = useRef(null);
  const folder_child_drag_state_ref = useRef(null);
  const drag_click_timer_ref = useRef(null);
  const folder_drop_timer_ref = useRef(null);
  const folder_drop_candidate_ref = useRef(null);
  const folder_drop_target_ref = useRef(null);
  const folder_swap_timer_ref = useRef(null);
  const folder_swap_candidate_ref = useRef(null);
  const undo_timer_ref = useRef(null);
  const [simple_icons_whitelist, set_simple_icons_whitelist] = useState(new Set());
  const [animation_parent] = useAutoAnimate(speedDialMoveAnimation);

  useEffect(() => {
    sites_ref.current = sites;
  }, [sites]);

  useEffect(() => {
    drag_index_ref.current = drag_index;
  }, [drag_index]);

  useEffect(() => {
    load_sites().then((loaded) => {
      set_sites(loaded);
      set_is_loading(false);
    });

    const CACHE_KEY = 'tabibe-icon-whitelist';
    const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

    function apply_whitelist(list) {
      set_simple_icons_whitelist(new Set(list));
    }

    function fetch_and_cache() {
      fetch('https://api.iconify.design/collection?prefix=simple-icons')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.uncategorized) {
            apply_whitelist(data.uncategorized);
            const cache_data = { list: data.uncategorized, timestamp: Date.now() };
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ [CACHE_KEY]: cache_data });
            } else {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cache_data));
            }
          }
        })
        .catch(() => {});
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([CACHE_KEY], (result) => {
        const cached = result[CACHE_KEY];
        if (cached && cached.list && (Date.now() - cached.timestamp) < CACHE_TTL) {
          apply_whitelist(cached.list);
        } else {
          fetch_and_cache();
        }
      });
    } else {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached && cached.list && (Date.now() - cached.timestamp) < CACHE_TTL) {
            apply_whitelist(cached.list);
            return;
          }
        }
      } catch { /* empty */ }
      fetch_and_cache();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (undo_timer_ref.current) {
        clearTimeout(undo_timer_ref.current);
      }
      if (drag_click_timer_ref.current) {
        clearTimeout(drag_click_timer_ref.current);
      }
      if (folder_drop_timer_ref.current) {
        clearTimeout(folder_drop_timer_ref.current);
      }
      if (folder_swap_timer_ref.current) {
        clearTimeout(folder_swap_timer_ref.current);
      }
    };
  }, []);

  /**
   * 4. Navigation handlers
   */

  function handle_click(url) {
    if (drag_node.current || drag_click_block_ref.current || !url) return;

    const trimmed_url = url.trim();
    const is_browser_protocol = trimmed_url.startsWith('chrome://')
      || trimmed_url.startsWith('edge://')
      || trimmed_url.startsWith('about:');

    if (is_browser_protocol && typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.update({ url: trimmed_url }, () => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: trimmed_url });
        }
      });
      return;
    }

    window.location.href = trimmed_url;
  }

  function handle_key_down(event, site) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (manage_mode) {
        handle_edit(site);
        return;
      }
      handle_click(site.url);
    }
  }

  /**
   * 5. Icon helpers
   */

  const DEFAULT_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>')}`;

  function get_icon_source_order() {
    return icon_style === 'simple' ? ['simple', 'favicon-simple'] : ['favicon', 'simple'];
  }

  function get_icon_url_by_source(site, source) {
    if (!site || site.type === 'folder') return '';

    if (source === 'simple') {
      const slug = site.icon_slug || get_suggested_icon_slug(site.url);

      if (slug && simple_icons_whitelist.has(slug)) {
        return get_simple_icon_url(slug, theme);
      }
    }

    if ((source === 'favicon' || source === 'favicon-simple') && site.url) {
      return get_favicon_url(site.url);
    }

    return '';
  }

  function get_icon_metadata(site, failed_sources = new Set()) {
    if (!site || site.type === 'folder') {
      return { src: TRANSPARENT_PIXEL, source: 'fallback' };
    }

    for (const source of get_icon_source_order()) {
      if (failed_sources.has(source)) continue;

      const src = get_icon_url_by_source(site, source);
      if (src) {
        return { src, source };
      }
    }

    return { src: DEFAULT_ICON, source: 'fallback' };
  }

  function render_site_icon(site) {
    return (
      <SpeedDialIcon
        site={site}
        getIconMetadata={get_icon_metadata}
        iconResetKey={`${icon_style}:${theme}:${site.id}:${site.url || ''}:${site.icon_slug || ''}`}
      />
    );
  }

  /**
   * 6. Drag and drop handlers
   */

  function block_click_after_drag() {
    drag_click_block_ref.current = true;

    if (drag_click_timer_ref.current) {
      clearTimeout(drag_click_timer_ref.current);
    }

    drag_click_timer_ref.current = setTimeout(() => {
      drag_click_block_ref.current = false;
      drag_click_timer_ref.current = null;
    }, 150);
  }

  function handle_drag_start(event, index) {
    drag_node.current = event.currentTarget;
    dragging_site_ref.current = sites[index];
    set_drag_index(index);
    drag_index_ref.current = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', sites[index]?.id || '');
  }

  function handle_drag_enter(event) {
    event.preventDefault();
  }

  function clear_folder_drop_candidate() {
    if (folder_drop_timer_ref.current) {
      clearTimeout(folder_drop_timer_ref.current);
      folder_drop_timer_ref.current = null;
    }

    folder_drop_candidate_ref.current = null;
    folder_drop_target_ref.current = null;
    set_drag_over_folder_id(null);
  }

  function clear_folder_swap_candidate() {
    if (folder_swap_timer_ref.current) {
      clearTimeout(folder_swap_timer_ref.current);
      folder_swap_timer_ref.current = null;
    }

    folder_swap_candidate_ref.current = null;
  }

  function queue_folder_drop_candidate(folder_id) {
    if (folder_drop_candidate_ref.current === folder_id) return;

    clear_folder_drop_candidate();
    folder_drop_candidate_ref.current = folder_id;

    folder_drop_timer_ref.current = setTimeout(() => {
      if (folder_drop_candidate_ref.current === folder_id) {
        folder_drop_target_ref.current = folder_id;
        set_drag_over_folder_id(folder_id);
        set_drag_over_index(null);
      }
      folder_drop_timer_ref.current = null;
    }, FOLDER_DROP_DELAY);
  }

  function queue_folder_swap_candidate(index) {
    if (folder_swap_candidate_ref.current === index) return;

    clear_folder_swap_candidate();
    folder_swap_candidate_ref.current = index;

    folder_swap_timer_ref.current = setTimeout(() => {
      if (folder_swap_candidate_ref.current === index && folder_drop_target_ref.current === null) {
        perform_swap(index);
      }
      folder_swap_timer_ref.current = null;
    }, FOLDER_SWAP_DELAY);
  }

  function handle_drag_over(event, index) {
    event.preventDefault();
    const current_drag_index = drag_index_ref.current;
    if (current_drag_index === null) return;

    event.dataTransfer.dropEffect = 'move';

    const current_sites = sites_ref.current;
    const dragged_site = current_sites[current_drag_index];
    const target_site = current_sites[index];
    if (!dragged_site || !target_site) return;

    if (target_site.type === 'folder' && dragged_site.type !== 'folder') {
      if (is_in_folder_swap_zone(event)) {
        clear_folder_drop_candidate();
        set_drag_over_index(index);
        queue_folder_swap_candidate(index);
      } else {
        clear_folder_swap_candidate();
        set_drag_over_index(index);
        queue_folder_drop_candidate(target_site.id);
      }
      return;
    }

    clear_folder_drop_candidate();
    clear_folder_swap_candidate();

    if (index !== current_drag_index) {
      set_drag_over_index(index);
      perform_swap(index);
    }
  }

  function perform_swap(index) {
    const current_drag_index = drag_index_ref.current;
    if (current_drag_index === null) return;
    if (current_drag_index === index) return;

    const new_sites = [...sites_ref.current];
    if (current_drag_index < 0 || index < 0 || current_drag_index >= new_sites.length || index >= new_sites.length) {
      return;
    }

    const [removed] = new_sites.splice(current_drag_index, 1);
    new_sites.splice(index, 0, removed);
    set_sites(new_sites);
    sites_ref.current = new_sites;
    set_drag_index(index);
    drag_index_ref.current = index;
    set_drag_over_index(index);
  }

  function handle_drag_leave(event) {
    const related = event.relatedTarget;
    if (related && event.currentTarget.contains(related)) return;

    clear_folder_swap_candidate();
    set_drag_over_index(null);
  }

  async function handle_drop(event, target_index = null) {
    event.preventDefault();

    if (
      typeof target_index === 'number'
      && folder_drop_target_ref.current === null
      && drag_index_ref.current !== target_index
    ) {
      perform_swap(target_index);
    }

    await save_sites(sites_ref.current);
    handle_drag_end();
  }

  function handle_drag_end() {
    if (drag_node.current) {
      block_click_after_drag();
    }

    clear_folder_swap_candidate();
    drag_node.current = null;
    dragging_site_ref.current = null;
    set_drag_index(null);
    drag_index_ref.current = null;
    set_drag_over_index(null);
    clear_folder_drop_candidate();
  }

  async function handle_drop_on_folder(folder_id) {
    const site = dragging_site_ref.current;
    if (!site || site.type === 'folder') return;

    const current_sites = clone_sites(sites_ref.current);
    const previous_sites = clone_sites(current_sites);
    const removed_site = remove_site_by_id(current_sites, site.id);

    if (!removed_site) return;

    const folder = current_sites.find((item) => item.type === 'folder' && item.id === folder_id);
    if (!folder || folder.children.find((child) => child.url === removed_site.url)) {
      handle_drag_end();
      return;
    }

    folder.children.push(removed_site);
    await persist_sites(current_sites);
    queue_undo(t('toast_site_moved_folder'), previous_sites);
    handle_drag_end();
  }

  function handle_folder_child_drag_start(event, folder_id, child_index) {
    event.stopPropagation();
    const folder = sites_ref.current.find((item) => item.type === 'folder' && item.id === folder_id);
    const child = folder?.children?.[child_index] || null;
    const next_drag_state = { folder_id, index: child_index };

    drag_node.current = event.currentTarget;
    dragging_site_ref.current = child;
    folder_child_drag_state_ref.current = next_drag_state;
    set_folder_child_drag_state(next_drag_state);
    set_folder_child_drag_over_index(child_index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', child?.id || '');
  }

  function handle_folder_child_drag_enter(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handle_folder_child_drag_over(event, folder_id, child_index) {
    event.preventDefault();
    event.stopPropagation();

    const current_drag_state = folder_child_drag_state_ref.current;
    if (!current_drag_state || current_drag_state.folder_id !== folder_id) return;

    event.dataTransfer.dropEffect = 'move';

    if (child_index === current_drag_state.index) return;

    set_folder_child_drag_over_index(child_index);
    perform_folder_child_swap(folder_id, child_index);
  }

  function perform_folder_child_swap(folder_id, child_index) {
    const current_drag_state = folder_child_drag_state_ref.current;
    if (!current_drag_state || current_drag_state.folder_id !== folder_id) return;
    if (current_drag_state.index === child_index) return;

    const next_sites = move_folder_child(
      sites_ref.current,
      folder_id,
      current_drag_state.index,
      child_index
    );

    if (!next_sites) return;

    const next_drag_state = { folder_id, index: child_index };
    set_sites(next_sites);
    sites_ref.current = next_sites;
    folder_child_drag_state_ref.current = next_drag_state;
    set_folder_child_drag_state(next_drag_state);
    set_folder_child_drag_over_index(child_index);
  }

  function handle_folder_child_drag_leave(event) {
    event.stopPropagation();
    const related = event.relatedTarget;
    if (related && event.currentTarget.contains(related)) return;

    set_folder_child_drag_over_index(null);
  }

  async function handle_folder_child_drop(event, folder_id, child_index) {
    event.preventDefault();
    event.stopPropagation();

    const current_drag_state = folder_child_drag_state_ref.current;
    if (current_drag_state && current_drag_state.folder_id === folder_id) {
      perform_folder_child_swap(folder_id, child_index);
      await save_sites(sites_ref.current);
    }

    handle_folder_child_drag_end();
  }

  async function handle_folder_child_drop_to_root(event, folder_id) {
    event.preventDefault();
    event.stopPropagation();

    const dragged_site = dragging_site_ref.current;
    const current_drag_state = folder_child_drag_state_ref.current;

    if (!dragged_site || !current_drag_state || current_drag_state.folder_id !== folder_id) {
      handle_folder_child_drag_end(event);
      return;
    }

    const current_sites = clone_sites(sites_ref.current);
    const previous_sites = clone_sites(current_sites);
    const removed_site = remove_site_by_id(current_sites, dragged_site.id);

    if (!removed_site) {
      handle_folder_child_drag_end(event);
      return;
    }

    current_sites.push(removed_site);
    await persist_sites(current_sites);
    queue_undo(t('toast_site_removed_from_folder'), previous_sites);
    handle_folder_child_drag_end(event);
  }

  function handle_folder_child_drag_end(event) {
    event?.stopPropagation();

    if (drag_node.current) {
      block_click_after_drag();
    }

    drag_node.current = null;
    dragging_site_ref.current = null;
    folder_child_drag_state_ref.current = null;
    set_folder_child_drag_state(null);
    set_folder_child_drag_over_index(null);
  }

  /**
   * 7. Undo and persistence helpers
   */

  async function persist_sites(next_sites) {
    set_sites(next_sites);
    sites_ref.current = next_sites;
    await save_sites(next_sites);
  }

  function queue_undo(message, previous_sites) {
    if (undo_timer_ref.current) {
      clearTimeout(undo_timer_ref.current);
    }

    set_undo_state({ message, previous_sites });
    undo_timer_ref.current = setTimeout(() => {
      set_undo_state(null);
      undo_timer_ref.current = null;
    }, 7000);
  }

  async function handle_undo() {
    if (!undo_state) return;

    if (undo_timer_ref.current) {
      clearTimeout(undo_timer_ref.current);
      undo_timer_ref.current = null;
    }

    await persist_sites(undo_state.previous_sites);
    set_undo_state({ message: t('toast_restored'), previous_sites: null });

    undo_timer_ref.current = setTimeout(() => {
      set_undo_state(null);
      undo_timer_ref.current = null;
    }, 2500);
  }

  /**
   * 8. Context menu and modal handlers
   */

  function open_context_menu(event, site, folder_id = null) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();

    set_context_menu({
      x: event.clientX || rect.right,
      y: event.clientY || rect.bottom,
      site,
      is_folder: site.type === 'folder',
      folder_id,
    });
  }

  function handle_action_click(event, site, folder_id = null) {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();

    set_context_menu({
      x: rect.right,
      y: rect.bottom,
      site,
      is_folder: site.type === 'folder',
      folder_id,
    });
  }

  function handle_add_click(folder_id = ROOT_FOLDER_ID) {
    set_editing_site(null);
    set_modal_folder_id(folder_id);
    set_modal_mode('site');
    set_modal_open(true);
  }

  function handle_add_folder_click() {
    set_editing_site(null);
    set_modal_folder_id(ROOT_FOLDER_ID);
    set_modal_mode('folder');
    set_modal_open(true);
  }

  function handle_edit(site) {
    set_editing_site(site);
    set_modal_folder_id(get_current_folder_id(sites, site));
    set_modal_mode(site.type === 'folder' ? 'folder' : 'site');
    set_modal_open(true);
  }

  const handle_close_modal = useCallback(() => {
    set_modal_open(false);
    set_editing_site(null);
    set_modal_folder_id(ROOT_FOLDER_ID);
  }, []);

  async function handle_save(data, target_folder_id = ROOT_FOLDER_ID) {
    if (modal_mode === 'folder') {
      const sites_list = clone_sites(sites_ref.current);

      if (editing_site) {
        const folder_id = data.id || editing_site?.id;
        const next_sites = update_folder_name(sites_list, folder_id, data.name)
          || update_folder_name(await load_sites(), folder_id, data.name);

        if (!next_sites) {
          return false;
        }

        await persist_sites(next_sites);
      } else {
        sites_list.push({
          type: 'folder',
          id: crypto.randomUUID(),
          name: data.name,
          children: [],
        });
        await persist_sites(sites_list);
      }
    } else {
      const sites_list = clone_sites(sites_ref.current);
      const site_data = {
        ...(editing_site || {}),
        ...data,
        id: editing_site?.id || data.id || crypto.randomUUID(),
      };
      const next_sites = upsert_site(sites_list, site_data, target_folder_id);
      await persist_sites(next_sites);
    }

    handle_close_modal();
    return true;
  }

  async function handle_delete(item) {
    if (item.type === 'folder') {
      set_folder_delete_candidate(item);
      return;
    }

    const sites_list = clone_sites(await load_sites());
    const previous_sites = clone_sites(sites_list);

    const removed_site = remove_site_by_id(sites_list, item.id);
    if (!removed_site) return;

    await persist_sites(sites_list);
    queue_undo(t('toast_site_deleted'), previous_sites);
  }

  async function handle_confirm_folder_delete(mode) {
    if (!folder_delete_candidate) return;

    const sites_list = clone_sites(await load_sites());
    const previous_sites = clone_sites(sites_list);
    const index = sites_list.findIndex((site) => (
      site.id === folder_delete_candidate.id && site.type === 'folder'
    ));

    if (index === -1) {
      set_folder_delete_candidate(null);
      return;
    }

    const folder = sites_list[index];
    const children = Array.isArray(folder.children) ? folder.children : [];

    if (mode === 'move') {
      sites_list.splice(index, 1, ...children);
      await persist_sites(sites_list);
      set_folder_delete_candidate(null);
      queue_undo(t('toast_folder_deleted'), previous_sites);
      return;
    }

    sites_list.splice(index, 1);
    await persist_sites(sites_list);
    set_folder_delete_candidate(null);
    queue_undo(t('toast_folder_deleted_with_contents'), previous_sites);
  }

  async function handle_remove_from_folder(site, folder_id) {
    const sites_list = clone_sites(await load_sites());
    const previous_sites = clone_sites(sites_list);
    const folder = sites_list.find((item) => item.id === folder_id && item.type === 'folder');

    if (!folder) return;

    const child_index = folder.children.findIndex((child) => child.id === site.id);
    if (child_index === -1) return;

    const [removed_site] = folder.children.splice(child_index, 1);
    sites_list.push(removed_site);
    await persist_sites(sites_list);
    queue_undo(t('toast_site_removed_from_folder'), previous_sites);
  }

  if (is_loading) {
    return null;
  }

  const folders = get_folders(sites);
  const all_sites = get_all_sites(sites);
  const is_dragging_any = drag_index !== null || folder_child_drag_state !== null;
  const root_drop_preview_site = folder_child_drag_state
    ? sites.find((item) => item.id === folder_child_drag_state.folder_id)?.children?.[folder_child_drag_state.index] || null
    : null;

  return (
    <nav className={`speed-dial${manage_mode ? ' speed-dial--manage' : ''}${is_dragging_any ? ' speed-dial--dragging' : ''}`} aria-label={t('speed_dial_aria_label')}>
      <div className="speed-dial-toolbar" role="toolbar" aria-label={t('speed_dial_toolbar_label')}>
        <div className="speed-dial-toolbar-actions">
          <button
            className="speed-dial-toolbar-button"
            type="button"
            onClick={() => handle_add_click()}
            aria-label={t('speed_dial_add')}
            title={t('speed_dial_add')}
          >
            <PlusIcon />
          </button>
          <button
            className="speed-dial-toolbar-button"
            type="button"
            onClick={handle_add_folder_click}
            aria-label={t('speed_dial_add_folder')}
            title={t('speed_dial_add_folder')}
          >
            <FolderPlusIcon />
          </button>
        </div>
        <button
          className={`speed-dial-toolbar-button${manage_mode ? ' speed-dial-toolbar-button--active' : ''}`}
          type="button"
          onClick={() => set_manage_mode((prev) => !prev)}
          aria-label={manage_mode ? t('speed_dial_done') : t('speed_dial_manage')}
          aria-pressed={manage_mode}
          title={manage_mode ? t('speed_dial_done') : t('speed_dial_manage')}
        >
          {manage_mode ? <CheckIcon /> : <EditIcon />}
        </button>
      </div>
      {/* /.speed-dial-toolbar */}

      <ul className="speed-dial-grid" ref={animation_parent}>
        {sites.map((item, index) => {
          if (item.type === 'folder') {
            return (
              <Folder
                key={item.id}
                folder={item}
                render_icon={render_site_icon}
                on_click={handle_click}
                on_context_menu={open_context_menu}
                on_action_menu={handle_action_click}
                on_add_site={() => handle_add_click(item.id)}
                on_edit_folder={() => handle_edit(item)}
                on_delete_folder={() => handle_delete(item)}
                is_manage_mode={manage_mode}
                is_modal_blocked={modal_open || !!folder_delete_candidate}
                is_drag_over={drag_over_folder_id === item.id || drag_over_index === index}
                is_folder_drop_target={drag_over_folder_id === item.id}
                is_dragging={drag_index === index}
                folder_child_drag_state={folder_child_drag_state}
                folder_child_drag_over_index={folder_child_drag_over_index}
                on_drag_start={(e) => handle_drag_start(e, index)}
                on_drag_enter={handle_drag_enter}
                on_drag_over={(e) => handle_drag_over(e, index)}
                on_drag_leave={handle_drag_leave}
                on_drop={(e) => {
                  e.preventDefault();
                  if (dragging_site_ref.current?.type === 'folder') {
                    handle_drop(e);
                  } else if (
                    folder_drop_target_ref.current === item.id
                    || folder_drop_candidate_ref.current === item.id
                  ) {
                    handle_drop_on_folder(item.id);
                  } else {
                    handle_drop(e, index);
                  }
                }}
                on_drag_end={handle_drag_end}
                on_child_drag_start={handle_folder_child_drag_start}
                on_child_drag_enter={handle_folder_child_drag_enter}
                on_child_drag_over={handle_folder_child_drag_over}
                on_child_drag_leave={handle_folder_child_drag_leave}
                on_child_drop={handle_folder_child_drop}
                on_child_drop_to_root={handle_folder_child_drop_to_root}
                on_child_drag_end={handle_folder_child_drag_end}
              />
            );
          }

          return (
            <li
              key={item.id}
              draggable="true"
              onDragStart={(e) => handle_drag_start(e, index)}
              onDragEnter={handle_drag_enter}
              onDragOver={(e) => handle_drag_over(e, index)}
              onDragLeave={handle_drag_leave}
              onDrop={handle_drop}
              onDragEnd={handle_drag_end}
              className={`${drag_index === index ? 'speed-dial-item--dragging' : ''} ${drag_over_index === index ? 'speed-dial-drop-target' : ''}`.trim()}
            >
              <div className="speed-dial-card">
                <div
                  className="speed-dial-item"
                  role="link"
                  tabIndex={0}
                  onClick={() => (manage_mode ? handle_edit(item) : handle_click(item.url))}
                  onKeyDown={(e) => handle_key_down(e, item)}
                  onContextMenu={(e) => open_context_menu(e, item)}
                  aria-label={`${item.name} - ${item.url}`}
                >
                  <div className="speed-dial-icon-wrapper">
                    {render_site_icon(item)}
                  </div>
                  <span className="speed-dial-label">{item.name}</span>
                </div>
                {/* /.speed-dial-item */}
                <button
                  className="speed-dial-action-button"
                  type="button"
                  onClick={(e) => handle_action_click(e, item)}
                  aria-label={`${item.name} ${t('speed_dial_actions')}`}
                  title={t('speed_dial_actions')}
                >
                  <MoreIcon />
                </button>
              </div>
              {/* /.speed-dial-card */}
            </li>
          );
        })}
        {root_drop_preview_site && (
          <li className="speed-dial-root-drop-preview" aria-hidden="true">
            <div className="speed-dial-card">
              <div className="speed-dial-item">
                <div className="speed-dial-icon-wrapper">
                  {render_site_icon(root_drop_preview_site)}
                </div>
                <span className="speed-dial-label">{root_drop_preview_site.name}</span>
              </div>
            </div>
          </li>
        )}
      </ul>
      {/* /.speed-dial-grid */}

      {undo_state && (
        <div className="toast" role="status" aria-live="polite">
          <span>{undo_state.message}</span>
          {undo_state.previous_sites && (
            <button className="toast-action" type="button" onClick={handle_undo}>
              {t('toast_undo')}
            </button>
          )}
        </div>
      )}

      {context_menu && (
        <ContextMenu
          x={context_menu.x}
          y={context_menu.y}
          on_edit={() => handle_edit(context_menu.site)}
          on_delete={() => handle_delete(context_menu.site)}
          on_remove_from_folder={
            context_menu.folder_id ? () => handle_remove_from_folder(context_menu.site, context_menu.folder_id) : null
          }
          on_close={() => set_context_menu(null)}
        />
      )}

      {modal_open && (
        <SiteModal
          key={`${modal_mode}-${editing_site?.id || 'new'}-${modal_folder_id}`}
          site={editing_site}
          mode={modal_mode}
          folders={folders}
          current_folder_id={modal_folder_id}
          existing_sites={all_sites}
          on_save={handle_save}
          on_close={handle_close_modal}
        />
      )}
      {folder_delete_candidate && (
        <FolderDeleteModal
          folder={folder_delete_candidate}
          onMoveContents={() => handle_confirm_folder_delete('move')}
          onDeleteContents={() => handle_confirm_folder_delete('delete')}
          onClose={() => set_folder_delete_candidate(null)}
        />
      )}
      {/* /.speed-dial */}
    </nav>
  );
}

export { ROOT_FOLDER_ID };
export default SpeedDial;
