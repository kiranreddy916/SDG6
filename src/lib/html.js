// Tiny string-template helpers. Pure functions: safe to run in the browser
// or in Node (used by scripts/build.mjs to pre-render the page).

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Join an array of strings (or a mapped array) with no separator. */
export const join = (arr, fn = (x) => x) => (arr || []).map(fn).join('');

/** Format a number the way the source document does (431,579). */
export const num = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : esc(n));

/** Accessible unit abbreviations used across the page. */
const UNITS = {
  'kL': 'kilolitres',
  'kL/day': 'kilolitres per day',
};
export const unit = (u) => (UNITS[u] ? `<abbr title="${UNITS[u]}">${esc(u)}</abbr>` : esc(u));

/** Replace "kL/day" and "kL" in prose with accessible abbreviations. */
export const prose = (text) =>
  esc(text).replace(/(\d)\s(kL\/day|kL)\b/g, (_, d, u) => `${d}&nbsp;${unit(u)}`);
