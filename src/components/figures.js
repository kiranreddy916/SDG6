import { esc, join, num, unit } from '../lib/html.js';
import { figures } from '../content.js';
import { sectionHead } from './shared.js';

/** Proportion bar drawn from two source figures; the stated label is the source's own wording. */
function shareBar(share) {
  const pct = (share.part / share.whole) * 100;
  return `
  <figure class="share" data-reveal>
    <div class="share__track" role="img" aria-label="${esc(`${num(share.part)} kilolitres reused, ${share.statedLabel} ${share.of.replace('kL', 'kilolitres')}`)}">
      <span class="share__fill" style="--w:${pct.toFixed(2)}%"></span>
    </div>
    <figcaption><strong>${esc(share.statedLabel)}</strong> ${esc(share.of)}</figcaption>
  </figure>`;
}

function ratioBar([part, whole]) {
  return `<span class="ratio" aria-hidden="true"><span style="--w:${((part / whole) * 100).toFixed(2)}%"></span></span>`;
}

export function figuresSection() {
  const volumes = join(figures.volumes, (v) => `
    <li class="volume volume--${esc(v.id)}">
      <p class="volume__label">${esc(v.label)}</p>
      <p class="volume__value"><span class="num">${num(v.value)}</span> <span class="volume__unit">${unit(v.unit)}</span></p>
      <p class="volume__detail">${esc(v.detail)}</p>
      ${v.share ? shareBar(v.share) : ''}
      <a class="more" href="${esc(v.href)}">How this is measured<span class="visually-hidden">: ${esc(v.label)}</span></a>
    </li>`);

  const facilities = join(figures.facilities, (f) => `
    <li class="facility">
      <a href="${esc(f.href)}">
        <span class="facility__value num">${esc(f.value)}${f.of ? `<span class="facility__of"> of ${esc(f.of)}</span>` : ''}</span>
        <span class="facility__label">${esc(f.label)}</span>
        ${f.extra ? `<span class="facility__extra"><span class="num">${esc(f.extra.value)}</span>&nbsp;${unit(f.extra.unit)} ${esc(f.extra.label)}</span>` : ''}
        ${f.ratio ? ratioBar(f.ratio) : ''}
      </a>
    </li>`);

  return `
  <section class="figures" id="figures" aria-labelledby="figures-title">
    <div class="wrap">
      ${sectionHead({ id: 'figures', no: '01', eyebrow: `At a glance · ${figures.period}`, title: 'Water on campus, in figures' })}

      <div class="figures__group">
        <h3 class="figures__subhead"><span>Water volumes</span><span class="tag">${esc(figures.period)}</span></h3>
        <ol class="volumes" role="list">${volumes}</ol>
        <p class="note"><span class="note__mark" aria-hidden="true">i</span>${esc(figures.volumesNote)}</p>
      </div>

      <div class="figures__group">
        <h3 class="figures__subhead"><span>Campus facilities</span><span class="tag">As reported for 2025</span></h3>
        <ul class="facilities" role="list" data-reveal>${facilities}</ul>
      </div>

      <p class="source-note">${esc(figures.sourceNote)} <abbr title="kilolitres">kL</abbr> = kilolitres (1&nbsp;kL = 1,000 litres).</p>
    </div>
  </section>`;
}
