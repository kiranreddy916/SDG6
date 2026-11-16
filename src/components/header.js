import { esc, join } from '../lib/html.js';
import { site } from '../content.js';

export function header() {
  const crumbHome = site.sustainabilityHomeUrl
    ? `<a href="${esc(site.sustainabilityHomeUrl)}">Sustainability</a>`
    : `<span>Sustainability</span>`;

  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-header>
    <div class="site-header__inner wrap">
      <a class="brand" href="#top" aria-label="${esc(site.university)} — SDG 6, back to top">
        <img class="brand__tile" src="${esc(site.sdgTile.src)}" alt="" width="44" height="44">
        <span class="brand__text">
          <span class="brand__name">${esc(site.university)}</span>
          <span class="brand__sub">SDG 6 · Clean Water and Sanitation</span>
        </span>
      </a>

      <nav class="site-nav" aria-label="On this page">
        <button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav-list" data-nav-toggle>
          <span class="site-nav__toggle-bars" aria-hidden="true"></span>
          <span class="site-nav__toggle-label">Menu</span>
        </button>
        <ul class="site-nav__list" id="site-nav-list" role="list" data-nav-list>
          ${join(site.nav, (n) => `<li><a href="#${esc(n.id)}" data-nav-link="${esc(n.id)}">${esc(n.label)}</a></li>`)}
        </ul>
      </nav>
    </div>
    <nav class="crumbs wrap" aria-label="Breadcrumb">
      <ol role="list">
        <li>${esc(site.university)}</li>
        <li>${crumbHome}</li>
        <li aria-current="page">SDG 6</li>
      </ol>
    </nav>
    <span class="site-header__progress" aria-hidden="true"></span>
  </header>`;
}
