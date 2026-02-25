import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { load_sites, save_sites, add_site, add_folder, remove_folder } from '../lib/storage.js';
import SiteModal from './SiteModal.jsx';
import ContextMenu from './ContextMenu.jsx';
import Folder from './Folder.jsx';

/**
 * 1. Icon URL helpers
 */

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function get_favicon_url(site_url) {
  try {
    const parsed = new URL(site_url);
    // Only http/https URLs have valid favicons
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

/**
 * 2. SpeedDial component
 */

function SpeedDial({ icon_style, theme }) {
  const { t } = useTranslation();
  const [sites, set_sites] = useState([]);
  const [is_loading, set_is_loading] = useState(true);
  const [modal_open, set_modal_open] = useState(false);
  const [modal_mode, set_modal_mode] = useState('site');
  const [editing_site, set_editing_site] = useState(null);
  const [context_menu, set_context_menu] = useState(null);
  const [drag_index, set_drag_index] = useState(null);
  const [drag_over_index, set_drag_over_index] = useState(null);
  const [drag_over_folder_id, set_drag_over_folder_id] = useState(null);
  const drag_node = useRef(null);
  const dragging_site_ref = useRef(null);
  const sites_ref = useRef([]);
  const drag_index_ref = useRef(null);
  const swap_timer_ref = useRef(null);
  
  // Keep sites_ref and drag_index_ref in sync with state
  useEffect(() => {
    sites_ref.current = sites;
  }, [sites]);

  useEffect(() => {
    drag_index_ref.current = drag_index;
  }, [drag_index]);
  const [simple_icons_whitelist, set_simple_icons_whitelist] = useState(new Set());
  const [animation_parent] = useAutoAnimate({ duration: 300 });

  useEffect(() => {
    load_sites().then((loaded) => {
      set_sites(loaded);
      set_is_loading(false);
    });

    // Fetch Simple Icons whitelist with cache (TTL: 30 days)
    const CACHE_KEY = 'tabibe-icon-whitelist';
    const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

    function apply_whitelist(list) {
      set_simple_icons_whitelist(new Set(list));
    }

    function fetch_and_cache() {
      fetch('https://api.iconify.design/collection?prefix=simple-icons')
        .then(res => res.json())
        .then(data => {
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

  /**
   * 3. Navigation handlers
   */

  function handle_click(url) {
    if (drag_node.current || !url) return;

    const trimmed_url = url.trim();

    // Handle special protocols (chrome://, edge://, about:)
    const is_browser_protocol = trimmed_url.startsWith('chrome://') || 
                               trimmed_url.startsWith('edge://') || 
                               trimmed_url.startsWith('about:');
    
    if (is_browser_protocol && typeof chrome !== 'undefined' && chrome.tabs) {
      // Use tabs API for browser protocols
      // Try update current tab first, fallback to create new tab if it fails
      chrome.tabs.update({ url: trimmed_url }, () => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: trimmed_url });
        }
      });
      return;
    }

    window.location.href = trimmed_url;
  }

  function handle_key_down(event, url) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handle_click(url);
    }
  }

  /**
   * 4. Icon helpers
   */

  const DEFAULT_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>')}`;

  function get_icon_src(site) {
    if (!site || site.type === 'folder') return TRANSPARENT_PIXEL;

    const has_valid_slug = site.icon_slug && simple_icons_whitelist.has(site.icon_slug);

    if (icon_style === 'simple') {
      // Priority 1: icon_slug confirmed in Simple Icons
      if (has_valid_slug) {
        return get_simple_icon_url(site.icon_slug, theme);
      }
      // Priority 2: No valid slug — try favicon (will be grayscale via CSS)
      if (site.url) {
        return get_favicon_url(site.url);
      }
      // Priority 3: No URL either — default icon
      return DEFAULT_ICON;
    }

    // Favicon mode
    // Priority 1: icon_slug confirmed in Simple Icons
    if (has_valid_slug) {
      return get_simple_icon_url(site.icon_slug, theme);
    }
    // Priority 2: favicon
    if (site.url) {
      return get_favicon_url(site.url);
    }

    return DEFAULT_ICON;
  }

  function handle_icon_error(event, site) {
    const img = event.target;

    // Preventive check: If we already tried everything, stop.
    if (img.dataset.iconError === 'final') return;

    if (icon_style === 'simple') {
      // Simple mode: simple icon failed → try favicon (grayscale)
      if (img.dataset.iconError !== 'favicon-attempt' && site.url) {
        img.src = get_favicon_url(site.url);
        img.classList.add('speed-dial-icon--fallback');
        img.dataset.iconError = 'favicon-attempt';
        return;
      }
      // Favicon also failed — show default icon
      img.src = DEFAULT_ICON;
      img.classList.remove('speed-dial-icon--fallback');
      img.dataset.iconError = 'final';
      return;
    }

    // Favicon mode: favicon or simple icon failed → show default icon
    img.src = DEFAULT_ICON;
    img.classList.add('speed-dial-icon--fallback');
    img.dataset.iconError = 'final';
  }

  /**
   * 5. Drag and drop handlers
   */

  function handle_drag_start(event, index) {
    drag_node.current = event.currentTarget;
    dragging_site_ref.current = sites[index];
    set_drag_index(index);
    drag_index_ref.current = index; // Immediate sync
    event.dataTransfer.effectAllowed = 'move';
  }

  function handle_drag_enter(event, index) {
    event.preventDefault();
  }

  function handle_drag_over(event, index) {
    event.preventDefault();
    const current_drag_index = drag_index_ref.current;
    if (current_drag_index === null) return;
    
    event.dataTransfer.dropEffect = 'move';
    
    // Zone-based logic: Calculate mouse position relative to target
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Zones: Left 25% (swap), Middle 50% (drop-into), Right 25% (swap)
    const is_in_middle = x > width * 0.25 && x < width * 0.75;
    
    const dragged_site = sites[current_drag_index];
    const target_site = sites[index];

    // Case A: Dragging over a folder
    if (target_site.type === 'folder' && dragged_site.type !== 'folder') {
      if (is_in_middle) {
        // Clear swap timer immediately if we are in drop-into zone
        if (swap_timer_ref.current) {
          clearTimeout(swap_timer_ref.current);
          swap_timer_ref.current = null;
        }

        // Highlighting for drop-into
        if (drag_over_folder_id !== target_site.id) {
          set_drag_over_folder_id(target_site.id);
          set_drag_over_index(null);
        }
        return;
      }
      
      // Fall through to reorder logic if not in middle (at edges)
      set_drag_over_folder_id(null);
    }

    // Case B & Case A (edges): Reordering logic with Dwell Time
    if (index !== current_drag_index) {
      // If we move to a different index, clear existing timer
      if (swap_timer_ref.current && drag_over_index !== index) {
        clearTimeout(swap_timer_ref.current);
        swap_timer_ref.current = null;
      }

      // Start a new timer if not already pending for this index
      if (!swap_timer_ref.current) {
        set_drag_over_index(index);
        swap_timer_ref.current = setTimeout(() => {
          perform_swap(index);
          swap_timer_ref.current = null;
        }, 550); // ~550ms dwell time for reorder
      }
    }
  }

  function perform_swap(index) {
    const current_drag_index = drag_index_ref.current;
    if (current_drag_index === null) return;

    set_sites((prev) => {
      const new_sites = [...prev];
      const [removed] = new_sites.splice(current_drag_index, 1);
      new_sites.splice(index, 0, removed);
      return new_sites;
    });
    set_drag_index(index);
    drag_index_ref.current = index; // Immediate sync for next swap event
    set_drag_over_index(index);
  }

  function handle_drag_leave(event) {
    // If we move between children of the li, don't clear
    const related = event.relatedTarget;
    if (related && event.currentTarget.contains(related)) return;
    
    if (swap_timer_ref.current) {
      clearTimeout(swap_timer_ref.current);
      swap_timer_ref.current = null;
    }
    set_drag_over_folder_id(null);
    set_drag_over_index(null);
  }

  async function handle_drop(event, drop_index) {
    event.preventDefault();
    // Always use the latest sites from ref to prevent stale data saves
    await save_sites(sites_ref.current);
    handle_drag_end();
  }

  function handle_drag_end() {
    if (swap_timer_ref.current) {
      clearTimeout(swap_timer_ref.current);
      swap_timer_ref.current = null;
    }
    drag_node.current = null;
    dragging_site_ref.current = null;
    set_drag_index(null);
    drag_index_ref.current = null; // Sync
    set_drag_over_index(null);
    set_drag_over_folder_id(null);
  }

  async function handle_drop_on_folder(folder_id) {
    const site = dragging_site_ref.current;
    if (!site || site.type === 'folder') return;

    // Use latest sites from ref
    const current_sites = [...sites_ref.current];
    const updated = current_sites.filter((s) => {
      if (s.type === 'folder') return s.id !== site.id;
      return s.url !== site.url;
    });

    const folder = updated.find((s) => s.id === folder_id);
    if (folder && folder.type === 'folder') {
      // Avoid duplicates
      if (!folder.children.find((c) => c.url === site.url)) {
        folder.children.push(site);
      }
    }
    set_sites(updated);
    await save_sites(updated);
    handle_drag_end();
  }

  /**
   * 6. Context menu and modal handlers
   */

  function handle_context_menu(event, site, folder_id = null) {
    event.preventDefault();
    set_context_menu({
      x: event.clientX,
      y: event.clientY,
      site,
      is_folder: false,
      folder_id,
    });
  }

  function handle_folder_context_menu(event, folder) {
    event.preventDefault();
    set_context_menu({
      x: event.clientX,
      y: event.clientY,
      site: folder,
      is_folder: true,
    });
  }

  function handle_add_click() {
    set_editing_site(null);
    set_modal_mode('site');
    set_modal_open(true);
  }

  function handle_add_folder_click() {
    set_editing_site(null);
    set_modal_mode('folder');
    set_modal_open(true);
  }

  function handle_edit(site) {
    set_editing_site(site);
    set_modal_mode(site.type === 'folder' ? 'folder' : 'site');
    set_modal_open(true);
  }

  const handle_close_modal = useCallback(() => {
    set_modal_open(false);
    set_editing_site(null);
  }, []);

  async function handle_save(data) {
    if (modal_mode === 'folder') {
      if (editing_site) {
        const sites_list = await load_sites();
        const index = sites_list.findIndex((s) => s.id === editing_site.id);
        if (index !== -1) {
          sites_list[index].name = data.name;
          await save_sites(sites_list);
          set_sites(sites_list);
        }
      } else {
        const updated = await add_folder(data.name);
        set_sites(updated);
      }
    } else {
      if (editing_site) {
        // Need to find if site is in root or inside a folder
        const sites_list = await load_sites();
        let found = false;
        
        // Check root
        const root_index = sites_list.findIndex((s) => s.id === editing_site.id);
        if (root_index !== -1) {
          sites_list[root_index] = { ...sites_list[root_index], ...data };
          found = true;
        } else {
          // Check folders
          for (const folder of sites_list) {
            if (folder.type === 'folder' && folder.children) {
              const child_index = folder.children.findIndex((s) => s.id === editing_site.id);
              if (child_index !== -1) {
                folder.children[child_index] = { ...folder.children[child_index], ...data };
                found = true;
                break;
              }
            }
          }
        }
        
        if (found) {
          await save_sites(sites_list);
          set_sites(sites_list);
        }
      } else {
        const updated = await add_site(data);
        set_sites(updated);
      }
    }
    handle_close_modal();
  }

  async function handle_delete(item) {
    if (item.type === 'folder') {
      const updated = await remove_folder(item.id);
      set_sites(updated);
    } else {
      // Find and remove site from root or any folder
      const sites_list = await load_sites();
      
      // Try root first
      const root_filtered = sites_list.filter((s) => s.id !== item.id);
      if (root_filtered.length !== sites_list.length) {
        await save_sites(root_filtered);
        set_sites(root_filtered);
        return;
      }
      
      // Try inside folders
      let changed = false;
      for (const folder of sites_list) {
        if (folder.type === 'folder' && folder.children) {
          const original_len = folder.children.length;
          folder.children = folder.children.filter((c) => c.id !== item.id);
          if (folder.children.length !== original_len) {
            changed = true;
            break;
          }
        }
      }
      
      if (changed) {
        await save_sites(sites_list);
        set_sites(sites_list);
      }
    }
  }

  async function handle_remove_from_folder(site, folder_id) {
    const sites_list = await load_sites();
    const folder = sites_list.find((s) => s.id === folder_id);
    
    if (folder && folder.type === 'folder') {
      // Remove from folder
      folder.children = folder.children.filter((c) => c.id !== site.id);
      // Add to root
      sites_list.push(site);
      await save_sites(sites_list);
      set_sites(sites_list);
    }
  }

  if (is_loading) {
    return null;
  }

  return (
    <nav className="speed-dial" aria-label={t('speed_dial_aria_label')}>
      <ul className="speed-dial-grid" ref={animation_parent}>
        {sites.map((item, index) => {
          if (item.type === 'folder') {
            return (
              <Folder
                key={item.id}
                folder={item}
                icon_style={icon_style}
                theme={theme}
                get_icon_src={get_icon_src}
                handle_icon_error={handle_icon_error}
                on_click={handle_click}
                on_context_menu={handle_context_menu}
                on_folder_context_menu={handle_folder_context_menu}
                is_drag_over={drag_over_folder_id === item.id}
                is_dragging={drag_index === index}
                on_drag_start={(e) => handle_drag_start(e, index)}
                on_drag_enter={(e) => handle_drag_enter(e, index)}
                on_drag_over={(e) => handle_drag_over(e, index)}
                on_drag_leave={handle_drag_leave}
                on_drop={(e) => {
                  e.preventDefault();
                  if (dragging_site_ref.current?.type === 'folder') {
                    // Folders cannot drop into folders, treat as standard reorder finalize
                    handle_drop(e, index);
                  } else {
                    handle_drop_on_folder(item.id);
                  }
                }}
                on_drag_end={handle_drag_end}
              />
            );
          }

          return (
            <li
              key={item.id}
              draggable="true"
              onDragStart={(e) => handle_drag_start(e, index)}
              onDragEnter={(e) => handle_drag_enter(e, index)}
              onDragOver={(e) => handle_drag_over(e, index)}
              onDragLeave={handle_drag_leave}
              onDrop={(e) => handle_drop(e, index)}
              onDragEnd={handle_drag_end}
              className={`${drag_index === index ? 'speed-dial-item--dragging' : ''} ${drag_over_index === index ? 'speed-dial-drop-target' : ''}`.trim()}
            >
              <div
                className="speed-dial-item"
                role="link"
                tabIndex={0}
                onClick={() => handle_click(item.url)}
                onKeyDown={(e) => handle_key_down(e, item.url)}
                onContextMenu={(e) => handle_context_menu(e, item)}
                aria-label={`${item.name} - ${item.url}`}
              >
                <div className="speed-dial-icon-wrapper">
                  <img
                    className={`speed-dial-icon${icon_style === 'simple' ? (item.icon_slug ? ' speed-dial-icon--simple' : ' speed-dial-icon--fallback') : ''}`}
                    src={get_icon_src(item)}
                    alt=""
                    aria-hidden="true"
                    width="40"
                    height="40"
                    loading="lazy"
                    onError={(e) => handle_icon_error(e, item)}
                  />
                </div>
                <span className="speed-dial-label">{item.name}</span>
              </div>
              {/* /.speed-dial-item */}
            </li>
          );
        })}
        <li>
          <div
            className="speed-dial-item speed-dial-item--add"
            role="button"
            tabIndex={0}
            onClick={handle_add_click}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handle_add_click();
              }
            }}
            aria-label={t('speed_dial_add')}
          >
            <div className="speed-dial-icon speed-dial-icon--add">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="speed-dial-label">{t('speed_dial_add')}</span>
          </div>
          {/* /.speed-dial-item--add */}
        </li>
        <li>
          <div
            className="speed-dial-item speed-dial-item--add"
            role="button"
            tabIndex={0}
            onClick={handle_add_folder_click}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handle_add_folder_click();
              }
            }}
            aria-label={t('speed_dial_add_folder')}
          >
            <div className="speed-dial-icon speed-dial-icon--add">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </div>
            <span className="speed-dial-label">{t('speed_dial_add_folder')}</span>
          </div>
          {/* /.speed-dial-item--add-folder */}
        </li>
      </ul>
      {/* /.speed-dial-grid */}

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
          site={editing_site}
          mode={modal_mode}
          on_save={handle_save}
          on_close={handle_close_modal}
        />
      )}
      {/* /.speed-dial */}
    </nav>
  );
}

export default SpeedDial;
