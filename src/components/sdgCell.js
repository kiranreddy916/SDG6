import { esc, join } from '../lib/html.js';
import { sdgCell, site } from '../content.js';
import { sectionHead } from './shared.js';

export function sdgCellSection() {
  const c = sdgCell.contact;
  return `
  <section class="cell" id="sdg-cell" aria-labelledby="sdg-cell-title">
    <div class="wrap cell__grid">
      <div>
        ${sectionHead({ id: 'sdg-cell', no: '05', eyebrow: 'Who reports on SDG 6', title: 'The SDG Cell' })}
        <p class="cell__about">${esc(sdgCell.about)}</p>
        <p class="muted">${esc(sdgCell.governance)}</p>
        <ul class="people" role="list">
          ${join(sdgCell.people, (p) => `
          <li>
            <span class="people__role">${esc(p.role)}</span>
            <span class="people__name">${esc(p.name)}</span>
            <span class="people__unit">${esc(p.unit)}</span>
          </li>`)}
        </ul>
      </div>
      <address class="contact">
        <p class="contact__label">Contact</p>
        <p class="contact__office">${join(c.office, (l) => `${esc(l)}<br>`)}</p>
        <p>${join(c.address, (l) => `${esc(l)}<br>`)}</p>
        <p class="contact__label">${esc(c.emailLabel)}</p>
        <p><a class="contact__email" href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
        ${site.sustainabilityHomeUrl ? `<p><a href="${esc(site.sustainabilityHomeUrl)}">Sustainability at ${esc(site.university)}</a></p>` : ''}
      </address>
    </div>
  </section>`;
}

export function footer() {
  return `
  <footer class="site-footer">
    <div class="wrap site-footer__inner">
      <div class="site-footer__id">
        <span class="site-footer__logo"><img src="${esc(site.logo.src)}" alt="${esc(site.logo.alt)}" width="${site.logo.width}" height="${site.logo.height}" loading="lazy"></span>
        <span>SDG 6 · Clean Water and Sanitation</span>
      </div>
      <p class="site-footer__note">Water figures on this page are for calendar year 2025 as reported by the university. Annual SDG 6 reports are organised by academic year (2024–25, 2025–26).</p>
      <p class="site-footer__top"><a href="#top">Back to top <span aria-hidden="true">↑</span></a></p>
    </div>
  </footer>`;
}
