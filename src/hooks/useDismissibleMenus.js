import { useEffect } from 'react';

const DISMISSIBLE_MENU_SELECTOR = 'details[data-dismissible-menu][open]';

function getOpenMenus(container) {
  const openMenus = Array.from(container.querySelectorAll(DISMISSIBLE_MENU_SELECTOR));

  if (container.matches?.(DISMISSIBLE_MENU_SELECTOR)) openMenus.unshift(container);
  return openMenus;
}

function useDismissibleMenus(containerRef) {
  useEffect(() => {
    function handlePointerDown(event) {
      const container = containerRef.current;
      const target = event.target;
      if (!container || !(target instanceof Node)) return;

      getOpenMenus(container).forEach((menu) => {
        if (!menu.contains(target)) menu.removeAttribute('open');
      });
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;

      const container = containerRef.current;
      if (!container) return;

      const openMenus = getOpenMenus(container);
      if (openMenus.length === 0) return;

      const focusedMenu = openMenus.find((menu) => menu.contains(document.activeElement));
      event.preventDefault();
      event.stopPropagation();
      openMenus.forEach((menu) => menu.removeAttribute('open'));
      (focusedMenu || openMenus.at(-1))?.querySelector('summary')?.focus({ preventScroll: true });
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [containerRef]);
}

export default useDismissibleMenus;
