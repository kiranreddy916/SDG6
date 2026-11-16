import { esc, join } from '../lib/html.js';
import { reports, evidence } from '../content.js';

/** A photo supplied in the SDG 6 source document, with its descriptive caption. */
export function photo(img, { className = '', loading = 'lazy' } = {}) {
  if (!img) return '';
  return `
  <figure class="photo ${img.small ? 'photo--small' : ''} ${className}">
    <img src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.width}" height="${img.height}" loading="${loading}" decoding="async">
    <figcaption>${esc(img.caption)}</figcaption>
  </figure>`;
}

/* ------------------------------------------------------------------ */
/* Water edges                                                        */
/* One wave period is 720 units wide; the tile repeats it so it can   */
/* drift sideways seamlessly (see .waterline in layout.css).          */
/* ------------------------------------------------------------------ */
const wave = (w, mid, amp) => {
  let d = `M0 ${mid}`;
  for (let x = 0; x < w; x += 720) d += ` Q${x + 180} ${mid - amp} ${x + 360} ${mid} T${x + 720} ${mid}`;
  return d;
};

/** Animated waterline: a back and a front wave, filled with the next section's colour. */
export function waterline(className = '') {
  return `
  <div class="waterline ${className}" aria-hidden="true">
    <svg class="waterline__back" viewBox="0 0 2880 56" preserveAspectRatio="none"><path d="${wave(2880, 26, 14)} V56 H0 Z"/></svg>
    <svg class="waterline__front" viewBox="0 0 2880 56" preserveAspectRatio="none"><path d="${wave(2880, 34, 10)} V56 H0 Z"/></svg>
  </div>`;
}

/** A still, low wave edge between two sections. `side` is 'top' or 'bottom'. */
export function waveEdge(side, className = '') {
  return `
  <div class="wave-edge wave-edge--${side} ${className}" aria-hidden="true">
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none"><path d="${wave(1440, 22, 12)} V40 H0 Z"/></svg>
  </div>`;
}

/**
 * Attributes for a report link. With a URL it goes there; without one it is
 * still a clickable link, but src/main.js stops it from navigating anywhere.
 */
export function linkAttrs(r) {
  return r.url ? `href="${esc(r.url)}"` : `href="#" data-no-link`;
}

/** A report reference, rendered as a plain link row ending in "Link". */
export function reportItem(key, { showType = false } = {}) {
  const r = reports[key];
  if (!r) return '';
  const meta = `${showType ? `<span class="doc__type">${esc(r.type)}</span>` : ''}${r.period ? `<span class="doc__period">${esc(r.period)}</span>` : ''}`;
  return `<li class="doc">
      <a class="doc__link" ${linkAttrs(r)}>
        <span class="doc__title">${esc(r.title)}</span>
        ${meta}
        <span class="doc__status">${esc(evidence.linkLabel)}<span aria-hidden="true"> →</span></span>
      </a></li>`;
}

export function reportList(keys, opts) {
  if (!keys?.length) return '';
  return `<div class="evidence-inline">
    <p class="evidence-inline__label">Evidence</p>
    <ul class="docs" role="list">${join(keys, (k) => reportItem(k, opts))}</ul>
  </div>`;
}

export function sectionHead({ id, eyebrow, title, intro, tone = '', no }) {
  return `
  <header class="section-head ${tone}">
    <p class="eyebrow">${no ? `<span class="eyebrow__no">${esc(no)}</span>` : ''}${esc(eyebrow)}</p>
    <h2 id="${esc(id)}-title">${esc(title)}</h2>
    ${intro ? `<p class="section-head__intro">${esc(intro)}</p>` : ''}
  </header>`;
}

export function factList(facts, className = '') {
  if (!facts?.length) return '';
  return `<dl class="facts ${className}">${join(facts, (f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)}</dl>`;
}
