
(() => {
  const gallery = document.getElementById('team-gallery');
  if (!gallery) return;

  const SELECTOR_CARD = '.team-card';
  const SELECTOR_FRONT = '.team-card__face--front';
  const SELECTOR_BACK  = '.team-card__face--back';

  const getCards = () => Array.from(gallery.querySelectorAll(SELECTOR_CARD));

  // --- State helpers -------------------------------------------------------
  function setExpanded(card, expanded) {
    card.classList.toggle('is-active', expanded);
    card.setAttribute('aria-expanded', String(expanded));
    const front = card.querySelector(SELECTOR_FRONT);
    const back  = card.querySelector(SELECTOR_BACK);
    if (front) front.setAttribute('aria-hidden', expanded ? 'true' : 'false');
    if (back)  back.setAttribute('aria-hidden',  expanded ? 'false' : 'true');
  }
  function toggle(card) { setExpanded(card, !card.classList.contains('is-active')); }
  function closeAll() { getCards().forEach(c => setExpanded(c, false)); }

  // Prepare cards for focus/ARIA
  getCards().forEach(c => {
    if (!c.hasAttribute('tabindex')) c.tabIndex = 0;
    if (!c.hasAttribute('role')) c.setAttribute('role', 'button');
    // initialize ARIA visibility
    setExpanded(c, c.classList.contains('is-active'));
  });

  // --- Pointer/drag guard (avoid flips while horizontal scrolling) --------
  let pointerActive = false, startX = 0, startY = 0, suppressClick = false;
  const DRAG_TOL = 6; // px

  gallery.addEventListener('pointerdown', (e) => {
    const card = e.target.closest(SELECTOR_CARD);
    if (!card) return;
    pointerActive = true; suppressClick = false;
    startX = e.clientX; startY = e.clientY;
  });
  gallery.addEventListener('pointermove', (e) => {
    if (!pointerActive) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > DRAG_TOL || dy > DRAG_TOL) suppressClick = true;
  });
  const endPointer = () => { pointerActive = false; setTimeout(() => (suppressClick = false), 0); };
  gallery.addEventListener('pointerup', endPointer);
  gallery.addEventListener('pointercancel', endPointer);

  // --- Click (event delegation) -------------------------------------------
  gallery.addEventListener('click', (e) => {
    const card = e.target.closest(SELECTOR_CARD);
    if (!card) return;
    if (suppressClick) return;               // user was dragging/scrolling
    if (e.target.closest('a, button')) return; // let links/buttons work
    toggle(card);
  });

  // --- Keyboard support ----------------------------------------------------
  gallery.addEventListener('keydown', (e) => {
    const card = e.target.closest(SELECTOR_CARD);
    if (!card) return;
    const cards = getCards();
    const idx = cards.indexOf(card);
    const moveFocus = (i) => { cards[i]?.focus(); };

    switch (e.key) {
      case 'Enter':
      case ' ':      e.preventDefault(); toggle(card); break;
      case 'Escape': setExpanded(card, false); break;
      case 'ArrowRight':
      case 'ArrowDown': e.preventDefault(); moveFocus(Math.min(cards.length-1, idx+1)); break;
      case 'ArrowLeft':
      case 'ArrowUp':   e.preventDefault(); moveFocus(Math.max(0, idx-1)); break;
      case 'Home':      e.preventDefault(); moveFocus(0); break;
      case 'End':       e.preventDefault(); moveFocus(cards.length-1); break;
    }
  });

  // --- Click outside closes all -------------------------------------------
  document.addEventListener('click', (e) => {
    if (!gallery.contains(e.target)) closeAll();
  });

  // --- Public API for programmatic control --------------------------------
  window.TeamCards = {
    open(id) {
      const card = gallery.querySelector(`${SELECTOR_CARD}[data-member="${id}"]`);
      if (card) {
        closeAll();
        setExpanded(card, true);
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        card.focus();
      }
    },
    closeAll,
    toggleByEl(el) { const card = el?.closest?.(SELECTOR_CARD); if (card) toggle(card); }
  };
})();
