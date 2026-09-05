/**
 * 1. Local installation helper
 */
async function handleCopyAddress(event) {
  const button = event.currentTarget;
  const target = document.getElementById(button.dataset.copyTarget);
  const status = document.getElementById('copy-status');
  if (!target || !status) return;
  try {
    await navigator.clipboard.writeText(target.textContent);
    status.textContent = button.dataset.success;
  } catch {
    status.textContent = button.dataset.error;
  }
}

/**
 * 2. Compact navigation without hiding links when JavaScript is unavailable
 */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const button = header?.querySelector('.menu-toggle');
  const navigation = document.getElementById('primary-navigation');
  if (!button || !navigation) return;
  const compact = matchMedia('(max-width: 40rem)');
  let expanded = false;

  function renderNavigation() {
    button.hidden = !compact.matches;
    navigation.hidden = compact.matches && !expanded;
    button.setAttribute('aria-expanded', String(compact.matches && expanded));
    button.setAttribute(
      'aria-label',
      expanded ? button.dataset.menuClose : button.dataset.menuOpen,
    );
  }
  function closeNavigation(restoreFocus = false) {
    expanded = false;
    renderNavigation();
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', () => {
    expanded = !expanded;
    renderNavigation();
    if (expanded) navigation.querySelector('a')?.focus();
  });
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !compact.matches) return;
    closeNavigation();
    const heading = document.querySelector(link.getAttribute('href'))?.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      closeNavigation(true);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (expanded && !header.contains(event.target)) closeNavigation();
  });
  compact.addEventListener('change', () => closeNavigation());
  renderNavigation();
}

/**
 * 3. User-controlled appearance carousel
 */
function initCarousel(carousel) {
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const controls = carousel.querySelector('.preview-controls');
  const stage = carousel.querySelector('.hero-stage');
  const play = carousel.querySelector('[data-play]');
  const previous = carousel.querySelector('[data-previous]');
  const next = carousel.querySelector('[data-next]');
  const label = carousel.querySelector('.preview-label');
  if (slides.length < 2 || !play || !previous || !next || !controls || !stage) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const ROTATION_INTERVAL = 6000;
  let activeIndex = 0;
  let userPaused = true;
  let hovered = false;
  let timer = null;
  let pointerWasPaused = null;

  function canRotate() {
    return !motion.matches && slides.every((slide) => !slide.dataset.failed);
  }
  function updateControls() {
    play.disabled = !canRotate();
    const playing = !userPaused && canRotate();
    play.setAttribute(
      'aria-label',
      motion.matches
        ? carousel.dataset.reducedLabel
        : playing
          ? carousel.dataset.pauseLabel
          : carousel.dataset.playLabel,
    );
    play.title = play.getAttribute('aria-label');
    play.querySelector('.play-icon').hidden = playing;
    play.querySelector('.pause-icon').hidden = !playing;
    stage.setAttribute('aria-live', playing ? 'off' : 'polite');
    carousel.dataset.playing = String(playing);
    carousel.dataset.activeIndex = String(activeIndex);
  }
  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    label.textContent = slides[activeIndex].dataset.slideLabel;
    updateControls();
  }
  function scheduleRotation() {
    clearTimeout(timer);
    if (userPaused || hovered || document.hidden || !canRotate()) return;
    timer = setTimeout(() => {
      showSlide(activeIndex + 1);
      scheduleRotation();
    }, ROTATION_INTERVAL);
  }
  function pauseRotation() {
    userPaused = true;
    updateControls();
    scheduleRotation();
  }
  function moveSlide(delta) {
    pauseRotation();
    showSlide(activeIndex + delta);
  }
  play.addEventListener('pointerdown', () => {
    // Preserve the intended click action before focus pauses automatic rotation.
    pointerWasPaused = userPaused;
  });
  play.addEventListener('keydown', () => {
    pointerWasPaused = null;
  });
  play.addEventListener('blur', () => {
    pointerWasPaused = null;
  });
  play.addEventListener('click', () => {
    userPaused = pointerWasPaused === null ? !userPaused : !pointerWasPaused;
    pointerWasPaused = null;
    updateControls();
    scheduleRotation();
  });
  previous.addEventListener('click', () => moveSlide(-1));
  next.addEventListener('click', () => moveSlide(1));
  controls.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveSlide(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  carousel.addEventListener('focusin', pauseRotation);
  carousel.addEventListener('mouseenter', () => {
    hovered = true;
    scheduleRotation();
  });
  carousel.addEventListener('mouseleave', () => {
    hovered = false;
    scheduleRotation();
  });
  document.addEventListener('visibilitychange', scheduleRotation);
  motion.addEventListener('change', pauseRotation);
  slides.forEach((slide) => {
    const image = slide.querySelector('img');
    function handleImageError() {
      slide.dataset.failed = 'true';
      slide.querySelector('.slide-loading').hidden = true;
      slide.querySelector('a').hidden = true;
      slide.querySelector('.slide-error').hidden = false;
      slide.setAttribute('aria-busy', 'false');
      pauseRotation();
    }
    slide.setAttribute('aria-busy', String(!image.complete));
    slide.querySelector('.slide-loading').hidden = image.complete;
    image.addEventListener('load', () => {
      slide.setAttribute('aria-busy', 'false');
      slide.querySelector('.slide-loading').hidden = true;
    });
    image.addEventListener('error', handleImageError);
    if (image.complete && !image.naturalWidth) handleImageError();
  });
  controls.hidden = false;
  carousel.dataset.ready = 'true';
  showSlide(0);
}

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', handleCopyAddress);
});
initNavigation();
document.querySelectorAll('[data-carousel]').forEach(initCarousel);
