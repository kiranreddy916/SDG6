import { renderPage } from './render.js';

const app = document.getElementById('app');
// Pre-rendered builds (npm run build) already contain the markup.
if (app && !app.dataset.prerendered) app.innerHTML = renderPage();

/* ---------- Mobile navigation ---------- */
const toggle = document.querySelector('[data-nav-toggle]');
const list = document.querySelector('[data-nav-list]');

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('nav-open', open);
}
if (toggle && list) {
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
}

/* ---------- Report links with no URL yet: clickable, but go nowhere ---------- */
document.addEventListener('click', (e) => {
  if (e.target.closest('a[data-no-link]')) e.preventDefault();
});

/* ---------- Header shadow + reading "waterline" along the header ---------- */
const headerEl = document.querySelector('[data-header]');
const onScroll = () => {
  if (!headerEl) return;
  headerEl.classList.toggle('is-scrolled', window.scrollY > 8);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  headerEl.style.setProperty('--progress', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Data bars fill each time they scroll into view ----------
   One IntersectionObserver watches every [data-reveal] element. When an
   element is at least 30% visible it fills; once it has fully left the
   viewport its fill is reset instantly (no reverse animation), so it replays
   on the next entry. data-reveal="once" plays a single time.
   Only armed when motion is allowed; without JS or with reduced motion the
   bars are simply drawn at their final size. */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && reveals.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
      if (isIntersecting && intersectionRatio >= 0.3) {
        if (target.classList.contains('is-revealed')) return;
        target.classList.remove('is-reset');
        void target.offsetWidth; // commit the empty state before filling
        target.classList.add('is-revealed');
        if (target.dataset.reveal === 'once') io.unobserve(target);
      } else if (!isIntersecting) {
        target.classList.add('is-reset');
        target.classList.remove('is-revealed');
      }
    });
  }, { threshold: [0, 0.3] });

  const arm = () => {
    const on = !motionQuery.matches;
    document.documentElement.classList.toggle('motion-ok', on);
    reveals.forEach((el) => (on ? io.observe(el) : io.unobserve(el)));
  };
  motionQuery.addEventListener?.('change', arm);
  arm();
}

/* ---------- Current-section highlighting (nav + campus topics) ---------- */
// The current section is the last one whose top has passed a line 35% down
// the viewport, and whose bottom has not.
function spy(attr) {
  const links = [...document.querySelectorAll(`[${attr}]`)];
  const targets = links.map((a) => document.getElementById(a.getAttribute(attr)));
  return () => {
    const line = window.innerHeight * 0.35;
    let current = -1;
    targets.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = i;
    });
    links.forEach((a, i) => {
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
}
const spies = [spy('data-nav-link'), spy('data-toc-link')];
let ticking = false;
const runSpies = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { spies.forEach((s) => s()); ticking = false; });
};
window.addEventListener('scroll', runSpies, { passive: true });
window.addEventListener('resize', runSpies);
runSpies();

/* ---------- Open the matching <details> when a hash points inside it ---------- */
function revealHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id ? document.getElementById(id) : null;
  const d = el ? el.closest('details') : null;
  if (d) d.open = true;
}
window.addEventListener('hashchange', revealHash);
revealHash();

/* ---------- Scroll position on Back / Forward ----------
   The page restores the visitor's own scroll position when they come back
   with Back or Forward (or reload), instead of the browser's restore, which
   races with the page being built and can lose to a leftover "#evidence" in
   the URL. A fresh visit to a #section link still opens that section.

   Each history entry gets a short id in history.state; positions are kept
   per id in sessionStorage. A position is saved at the moment the visitor
   leaves an entry (link click, leaving the page, or Back/Forward), so the
   fix does not depend on scroll events having fired. */
const instant = (y) => window.scrollTo({ top: y, left: 0, behavior: 'instant' });
const STORE = 'sdg6-scroll';
let positions = {};
try { positions = JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch { /* storage unavailable: memory only */ }
const persist = () => { try { sessionStorage.setItem(STORE, JSON.stringify(positions)); } catch { /* ignore */ } };

function entryId() {
  if (history.state?.k) return history.state.k;
  const k = Math.random().toString(36).slice(2, 10);
  try { history.replaceState({ ...(history.state || {}), k }, ''); } catch { /* ignore */ }
  return k;
}
let current = entryId();
const remember = () => { positions[current] = Math.round(window.scrollY); persist(); };

window.addEventListener('pagehide', remember);
// An in-page #link creates a new history entry: record where we were first.
document.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) remember(); }, true);
let saveTimer;
window.addEventListener('scroll', () => { clearTimeout(saveTimer); saveTimer = setTimeout(remember, 200); }, { passive: true });

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const navType = performance.getEntriesByType?.('navigation')[0]?.type;
const saved = positions[current];
let place = null;
if ((navType === 'back_forward' || navType === 'reload') && typeof saved === 'number') {
  place = () => instant(saved);
} else if (location.hash) {
  // Direct link to a section: go there (also covers markup built after load).
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) place = () => target.scrollIntoView({ behavior: 'instant' });
}
if (place) {
  place();
  // Web fonts can arrive after this and change text heights, which moves the
  // page. Re-apply once they are ready, unless the visitor has already scrolled.
  let userMoved = false;
  const moved = () => { userMoved = true; };
  ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((t) => window.addEventListener(t, moved, { once: true, passive: true }));
  document.fonts?.ready.then(() => { if (!userMoved) place(); });
}

// Back/Forward between in-page entries (e.g. "#community" and the page top).
window.addEventListener('popstate', (e) => {
  clearTimeout(saveTimer);
  if (e.state?.k) {
    // Traversal to a known entry: save where we were, then return to where it was.
    remember();
    current = e.state.k;
    if (typeof positions[current] === 'number') instant(positions[current]);
  } else {
    // A new #section entry (the previous position was saved on click).
    current = entryId();
  }
});
