// Keep the artwork continuous between its gallery position and the modal.
let lbSlides = [], lbIndex = 0, lastLightboxTrigger = null;
let previousBodyOverflow = '', lbMotion = null, lbFlight = null, lbHiddenImage = null;
let lbClosing = false, lbRevision = 0;
const lbEl = document.getElementById('lightbox');
const lbStage = document.getElementById('lightbox-stage');
const lbReduced = matchMedia('(prefers-reduced-motion: reduce)');

function clearLightboxMotion() {
  lbRevision++;
  lbMotion?.cancel();
  lbMotion = null;
  lbFlight?.remove();
  lbFlight = null;
  lbHiddenImage?.style.removeProperty('visibility');
  lbHiddenImage = null;
  lbStage.style.removeProperty('visibility');
}

function renderLightbox() {
  const source = lbSlides[lbIndex].querySelector('img');
  const image = source.cloneNode();
  image.src = source.currentSrc || source.src || source.dataset.src;
  image.removeAttribute('data-src');
  image.loading = 'eager';
  lbStage.replaceChildren(image);
  document.getElementById('lb-counter').textContent = `${lbIndex + 1} / ${lbSlides.length}`;
}

function flyLightboxImage(from, to, closing) {
  const image = lbStage.querySelector('img');
  if (lbReduced.matches || !image?.complete || !image.naturalWidth ||
      !from.width || !from.height || !to.width || !to.height) return null;
  lbHiddenImage = lbSlides[lbIndex].querySelector('img');
  lbHiddenImage.style.visibility = 'hidden';
  lbStage.style.visibility = 'hidden';
  lbFlight = image.cloneNode();
  lbFlight.className = 'lightbox-flight';
  lbFlight.alt = '';
  lbFlight.setAttribute('aria-hidden', 'true');
  Object.assign(lbFlight.style, {
    left: `${to.left}px`, top: `${to.top}px`,
    width: `${to.width}px`, height: `${to.height}px`
  });
  lbEl.append(lbFlight);
  const transform = rect => `translate(${rect.left - to.left}px, ${rect.top - to.top}px) scale(${rect.width / to.width}, ${rect.height / to.height})`;
  lbMotion = lbFlight.animate([
    {transform: transform(from)}, {transform: 'none'}
  ], {duration: closing ? 460 : 620, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both'});
  return lbMotion.finished;
}

document.querySelectorAll('.gallery-slide:not(.case-study-link)').forEach(slide => {
  slide.addEventListener('click', () => {
    if (lbEl.open) return;
    clearLightboxMotion();
    lbClosing = false;
    lastLightboxTrigger = slide;
    const entry = slide.closest('.project-entry');
    lbSlides = [...entry.querySelectorAll('.gallery-slide:not(.case-study-link)')];
    lbIndex = lbSlides.indexOf(slide);
    const name = entry.querySelector('.project-name');
    document.getElementById('lb-project').textContent = name.dataset.title || name.textContent.trim();
    const from = slide.querySelector('img').getBoundingClientRect();
    renderLightbox();
    if (typeof projectScrollFrame !== 'undefined') cancelAnimationFrame(projectScrollFrame);
    previousBodyOverflow = document.body.style.overflow;
    window.portfolioLenis?.stop();
    document.body.style.overflow = 'hidden';
    lbEl.showModal();
    lbEl.querySelector('.lightbox-close').focus({preventScroll: true});
    const to = lbStage.querySelector('img').getBoundingClientRect();
    const finished = flyLightboxImage(from, to, false);
    const revision = lbRevision;
    lbEl.getBoundingClientRect();
    lbEl.classList.add('open');
    finished?.then(() => {
      if (revision === lbRevision) clearLightboxMotion();
    }, () => {});
  });
});

function stepLightbox(dir) {
  if (!lbEl.open || lbClosing) return;
  clearLightboxMotion();
  lbIndex = (lbIndex + dir + lbSlides.length) % lbSlides.length;
  renderLightbox();
  if (!lbReduced.matches) lbStage.animate([{opacity: .35}, {opacity: 1}], {duration: 180});
}

function closeLightbox() {
  if (!lbEl.open || lbClosing) return;
  lbClosing = true;
  const from = (lbFlight || lbStage.querySelector('img')).getBoundingClientRect();
  clearLightboxMotion();
  const slide = lbSlides[lbIndex];
  lastLightboxTrigger = slide;
  const track = slide.closest('.gallery-track');
  const bounds = track.getBoundingClientRect();
  const card = slide.getBoundingClientRect();
  // If the visitor browsed the modal, return to the image now being viewed.
  if (card.right <= bounds.left || card.left >= bounds.right) {
    track.scrollTo({left: slide.offsetLeft - track.querySelector('.gallery-slide').offsetLeft, behavior: 'instant'});
  }
  const to = slide.querySelector('img').getBoundingClientRect();
  const visible = to.bottom > 0 && to.top < innerHeight;
  const finished = visible ? flyLightboxImage(from, to, true) : null;
  lbEl.classList.add('closing');
  lbEl.classList.remove('open');
  const revision = lbRevision;
  const fade = finished ? null : lbStage.animate([{opacity: 1}, {opacity: 0}], {
    duration: lbReduced.matches ? 100 : 180
  });
  (finished || fade.finished).then(() => {
    if (revision === lbRevision && lbEl.open) lbEl.close();
  }, () => {});
}

lbEl.addEventListener('cancel', event => {
  event.preventDefault();
  closeLightbox();
});
lbEl.addEventListener('close', () => {
  clearLightboxMotion();
  lbEl.classList.remove('open', 'closing');
  lbClosing = false;
  document.body.style.overflow = previousBodyOverflow;
  window.portfolioLenis?.start();
  lastLightboxTrigger?.focus({preventScroll: true});
});
document.addEventListener('keydown', event => {
  if (!lbEl.open) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    stepLightbox(event.key === 'ArrowRight' ? 1 : -1);
  }
});
// A resize invalidates the captured geometry; settle into the current layout.
window.addEventListener('resize', () => {
  if (!lbEl.open) return;
  clearLightboxMotion();
  if (lbClosing) lbEl.close();
});
