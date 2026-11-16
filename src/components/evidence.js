import { esc, join } from '../lib/html.js';
import { evidence, evidenceGroups, reports } from '../content.js';
import { linkAttrs, reportItem, sectionHead } from './shared.js';

function annualCard(key) {
  const r = reports[key];
  return `<li class="annual"><a ${linkAttrs(r)}>
    <span class="annual__period">${esc(r.period)}</span>
    <span class="annual__title">${esc(r.title).replace(/(\d{4})–(\d{2})/g, '<span class="nowrap">$1–$2</span>')}</span>
    <span class="annual__foot"><span class="annual__status">${esc(evidence.linkLabel)} <span aria-hidden="true">→</span></span></span>
  </a></li>`;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function evidenceSection() {
  return `
  <section class="evidence" id="evidence" aria-labelledby="evidence-title">
    <div class="wrap">
      ${sectionHead({ id: 'evidence', no: '05', eyebrow: 'Evidence and resources', title: 'Reports, policy and procedures', intro: evidence.intro })}

      <div class="evidence__annual" id="docs-annual">
        <h3 class="minor-head">SDG 6 annual reports <span class="tag">By academic year</span></h3>
        <p class="muted">${esc(evidence.annualIntro)} Annual reports follow the academic year; the water figures on this page are for calendar year 2025.</p>
        <ul class="annuals" role="list">${join(evidence.annual, annualCard)}</ul>
      </div>

      <div class="evidence__index">
        <h3 class="minor-head">Supporting documents</h3>
        <div class="doc-groups">
          ${join(evidenceGroups, (g) => `
          <section class="doc-group" id="docs-${esc(g.id)}" aria-labelledby="docs-${esc(g.id)}-h">
            <h4 id="docs-${esc(g.id)}-h">${esc(g.label)} <span class="doc-group__count">${plural(g.items.length, 'document', 'documents')}</span></h4>
            <ul class="docs docs--index" role="list">${join(g.items, (k) => reportItem(k))}</ul>
          </section>`)}
        </div>
      </div>
    </div>
  </section>`;
}
