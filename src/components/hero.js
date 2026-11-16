import { esc, join } from '../lib/html.js';
import { hero, site } from '../content.js';
import { photo, waterline } from './shared.js';

/* Faint concentric rings: a still ripple behind the headline. */
const ripple = `
  <svg class="hero__ripple" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
    ${[60, 120, 180, 240, 300].map((r) => `<circle cx="300" cy="300" r="${r - 2}"/>`).join('')}
  </svg>`;

export function heroSection() {
  return `
  <section class="hero" aria-labelledby="hero-title">
    ${ripple}
    <div class="hero__inner wrap">
      <div class="hero__copy">
        <p class="hero__goal">
          <img src="${esc(site.sdgTile.src)}" alt="${esc(site.sdgTile.alt)}" width="72" height="72">
          <span>${esc(hero.goal)}<br><span class="hero__goal-uni">${esc(site.universityLong)}</span></span>
        </p>
        <h1 id="hero-title">${esc(hero.title)}</h1>
        <p class="hero__lede">${esc(hero.lede)}</p>
        <ul class="hero__meta" role="list">${join(hero.meta, (m) => `<li>${esc(m)}</li>`)}</ul>
        <div class="hero__actions">
          ${join(hero.actions, (a, i) => `<a class="btn ${i === 0 ? 'btn--primary' : 'btn--ghost'}" href="${esc(a.href)}">${esc(a.label)}${i === 0 ? '<span class="btn__arrow" aria-hidden="true">↓</span>' : ''}</a>`)}
        </div>
      </div>
      <div class="hero__visual">
        ${photo(hero.image, { loading: 'eager', className: 'photo--hero' })}
      </div>
    </div>
    ${waterline('waterline--hero')}
  </section>`;
}
