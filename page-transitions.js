(() => {
  const root = document.documentElement;
  const projects = new Set(['design-system-web.html', 'design-system-mobile.html']);
  const page = url => new URL(url, location.href).pathname.split('/').pop() || 'index.html';
  const returnKey = 'portfolio-project-return-v1';

  function loadProjectImages(entry) {
    entry.querySelectorAll('.gallery-slide img[data-src]').forEach(image => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }

  function readReturn() {
    try { return JSON.parse(sessionStorage.getItem(returnKey)); }
    catch { return null; }
  }

  function remember(project) {
    const track = document.querySelector('#design-system-cases .gallery-track');
    if (!track) return;
    const state = {
      url: location.href, project, entryKey: window.navigation?.currentEntry?.key,
      top: window.scrollY, left: track.scrollLeft, width: innerWidth,
      visible: [...document.querySelectorAll('.reveal')].flatMap((el, i) => el.classList.contains('visible') ? [i] : [])
    };
    try { sessionStorage.setItem(returnKey, JSON.stringify(state)); }
    catch { /* Native history restoration remains available without storage. */ }
  }

  function restoreReturn() {
    if (page(location.href) !== 'index.html' || window.portfolioReturnRestored) return;
    const state = readReturn();
    const from = window.navigation?.activation?.from?.url || document.referrer;
    if (!state || !from || !projects.has(page(from)) || page(from) !== state.project) return;
    const entry = document.getElementById('design-system-cases');
    if (!entry) return;
    window.portfolioReturnRestored = true;
    root.classList.add('portfolio-returning');
    loadProjectImages(entry);
    document.querySelectorAll('.project-entry').forEach(item => {
      const open = item === entry;
      item.classList.toggle('open', open);
      item.querySelector('.project-item').setAttribute('aria-expanded', String(open));
      item.querySelector('.project-gallery').inert = !open;
    });
    document.querySelectorAll('.reveal').forEach((el, i) => {
      if (state.visible.includes(i) || el === entry) el.classList.add('visible');
    });
    // Flush the expanded geometry with transitions disabled, before restoring scroll.
    entry.getBoundingClientRect();
    const track = entry.querySelector('.gallery-track');
    track.scrollTo({ left: state.left, behavior: 'instant' });
    const top = state.width === innerWidth ? state.top
      : Math.max(0, scrollY + entry.getBoundingClientRect().top - document.querySelector('nav').getBoundingClientRect().height - 8);
    document.querySelector('nav').classList.toggle('scrolled', top > 60);
    if (window.portfolioLenis) window.portfolioLenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo({ top, behavior: 'instant' });
    // Flush again so a following view-transition snapshot sees the exact destination.
    entry.getBoundingClientRect();
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    if (!link || link.target || link.hasAttribute('download')) return;
    if (page(location.href) === 'index.html' && link.matches('.case-study-link')) {
      remember(page(link.href));
      return;
    }
    if (!projects.has(page(location.href)) || !link.matches('.nav-back')) return;
    const state = readReturn();
    if (!state || state.project !== page(location.href)) return;
    const entries = window.navigation?.entries();
    const current = window.navigation?.currentEntry;
    const previous = current && entries[current.index - 1];
    if (previous?.key === state.entryKey) {
      event.preventDefault();
      history.back();
    }
  });

  addEventListener('pageshow', () => {
    // In transition-capable browsers, layout must only be restored in pagereveal.
    // Measuring or scrolling in pageshow can reveal the page too early and abort
    // the cross-document transition (particularly on history restoration).
    if ('onpagereveal' in window) return;
    restoreReturn();
    // Also handle browsers without cross-document view transitions.
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('portfolio-returning')));
  });

  function prepare(transition, from, to, incoming) {
    if (!transition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const opening = from === 'index.html' && projects.has(to);
    const closing = projects.has(from) && to === 'index.html';
    if (!opening && !closing) return;

    const project = opening ? to : from;
    const onIndex = page(location.href) === 'index.html';
    const link = onIndex && [...document.querySelectorAll('.case-study-link')]
      .find(item => page(item.href) === project);
    const image = onIndex ? link?.querySelector('img') : document.querySelector('.case-preview img');
    if (!image) return;

    let gallery;
    let previousTransition;
    if (onIndex && incoming && !window.portfolioReturnRestored) {
      // Prepare the return destination before the browser captures its geometry.
      // Do not replay the accordion/scroll entrance underneath the shared image.
      const entry = link.closest('.project-entry');
      loadProjectImages(entry);
      gallery = entry.querySelector('.project-gallery');
      previousTransition = gallery.style.transition;
      gallery.style.transition = 'none';
      document.querySelectorAll('.project-entry.open').forEach(other => {
        if (other === entry) return;
        other.classList.remove('open');
        other.querySelector('.project-item').setAttribute('aria-expanded', 'false');
        other.querySelector('.project-gallery').inert = true;
      });
      entry.classList.add('open', 'visible');
      entry.querySelector('.project-item').setAttribute('aria-expanded', 'true');
      gallery.inert = false;
      const track = link.closest('.gallery-track');
      track.scrollTo({ left: link.offsetLeft - track.querySelector('.gallery-slide').offsetLeft, behavior: 'instant' });
      const nav = document.querySelector('nav');
      nav.classList.add('scrolled');
      const top = Math.max(0, window.scrollY + entry.getBoundingClientRect().top - nav.getBoundingClientRect().height - 8);
      if (window.portfolioLenis) window.portfolioLenis.scrollTo(top, { immediate: true });
      else window.scrollTo({ top, behavior: 'instant' });
    }

    const bounds = image.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight || bounds.right <= 0 || bounds.left >= innerWidth || (!incoming && (!image.complete || !image.naturalWidth))) {
      if (gallery) gallery.style.transition = previousTransition;
      return;
    }

    root.dataset.projectTransition = opening ? 'open' : 'close';
    image.style.viewTransitionName = 'project-artwork';
    const cleanup = () => {
      delete root.dataset.projectTransition;
      image.style.removeProperty('view-transition-name');
      if (gallery) gallery.style.transition = previousTransition;
    };
    transition.finished.then(cleanup, cleanup);
  }

  addEventListener('pageswap', event => {
    if (!event.activation) return;
    const from = page(location.href);
    const to = page(event.activation.entry.url);
    if (from === 'index.html') {
      window.portfolioReturnRestored = false;
      if (projects.has(to)) remember(to);
    }
    prepare(event.viewTransition, from, to, false);
  });
  addEventListener('pagereveal', event => {
    const activation = window.navigation?.activation;
    restoreReturn();
    if (activation?.from) prepare(event.viewTransition, page(activation.from.url), page(location.href), true);
    const finishReturn = () => root.classList.remove('portfolio-returning');
    if (event.viewTransition) event.viewTransition.finished.then(finishReturn, finishReturn);
    else requestAnimationFrame(() => requestAnimationFrame(finishReturn));
  });
})();
