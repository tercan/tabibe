import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => (
      !element.hasAttribute('disabled')
      && element.getClientRects().length > 0
      && window.getComputedStyle(element).visibility !== 'hidden'
    ));
}

function focusElement(element) {
  if (element && typeof element.focus === 'function') {
    element.focus({ preventScroll: true });
  }
}

function useFocusTrap({ containerRef, isActive, initialFocusRef, onEscape }) {
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return undefined;

    const container = containerRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frameId = requestAnimationFrame(() => {
      const focusTarget = initialFocusRef?.current || getFocusableElements(container)[0] || container;
      focusElement(focusTarget);
    });

    function handleKeydown(event) {
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        focusElement(container);
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!container.contains(activeElement)) {
        event.preventDefault();
        focusElement(firstElement);
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        focusElement(lastElement);
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        focusElement(firstElement);
      }
    }

    document.addEventListener('keydown', handleKeydown);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeydown);

      if (previousFocus && document.contains(previousFocus)) {
        focusElement(previousFocus);
      }
    };
  }, [containerRef, initialFocusRef, isActive]);
}

export default useFocusTrap;
