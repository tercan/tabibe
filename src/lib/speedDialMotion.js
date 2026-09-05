const MOVE_DURATION = 520;
const ENTER_EXIT_DURATION = 220;
const MOVE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

function shouldReduceMotion() {
  return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function getDelta(oldCoords, newCoords) {
  return {
    x: oldCoords.left - newCoords.left,
    y: oldCoords.top - newCoords.top,
  };
}

function createNoopEffect(element) {
  return new KeyframeEffect(element, [{ opacity: 1 }, { opacity: 1 }], {
    duration: 1,
    easing: 'linear',
  });
}

function speedDialMoveAnimation(element, action, oldCoords, newCoords) {
  if (shouldReduceMotion()) return createNoopEffect(element);

  if (action === 'remain' && oldCoords && newCoords) {
    const delta = getDelta(oldCoords, newCoords);

    if (delta.x === 0 && delta.y === 0) {
      return createNoopEffect(element);
    }

    return new KeyframeEffect(
      element,
      [
        {
          transform: `translate(${delta.x}px, ${delta.y}px)`,
        },
        {
          transform: `translate(${Math.round(delta.x * 0.18)}px, ${Math.round(delta.y * 0.18)}px)`,
          offset: 0.72,
        },
        {
          transform: 'translate(0, 0)',
        },
      ],
      {
        duration: MOVE_DURATION,
        easing: MOVE_EASING,
      },
    );
  }

  if (action === 'add') {
    return new KeyframeEffect(
      element,
      [
        { opacity: 0, transform: 'scale(0.96)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      {
        duration: ENTER_EXIT_DURATION,
        easing: MOVE_EASING,
      },
    );
  }

  if (action === 'remove') {
    return new KeyframeEffect(
      element,
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(0.96)' },
      ],
      {
        duration: ENTER_EXIT_DURATION,
        easing: 'ease-out',
      },
    );
  }

  return createNoopEffect(element);
}

export { shouldReduceMotion };
export default speedDialMoveAnimation;
