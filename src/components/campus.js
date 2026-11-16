import { esc, join, prose } from '../lib/html.js';
import { campus, waterLoop } from '../content.js';
import { photo, reportList, sectionHead, factList } from './shared.js';

const pad = (i) => String(i + 1).padStart(2, '0');

function loop() {
  return `
  <div class="loop" aria-labelledby="loop-title" data-reveal="once">
    <h3 class="loop__title" id="loop-title">How water moves through campus</h3>
    <ol class="loop__stages" role="list">
      ${join(waterLoop, (s, i) => `
      <li class="loop__stage">
        <span class="loop__node" aria-hidden="true">${pad(i)}</span>
        <h4><a href="${esc(s.href)}">${esc(s.stage)}</a></h4>
        <ul role="list">${join(s.points, (p) => `<li>${prose(p)}</li>`)}</ul>
      </li>`)}
    </ol>
    <p class="loop__return"><span aria-hidden="true">↺</span> Treated water returns to campus use instead of being discharged.</p>
  </div>`;
}

function keyedList(items) {
  return `<ul class="keyed" role="list">${join(items, ([k, v]) => `<li>${k ? `<strong>${esc(k)}</strong>` : ''}<span>${prose(v)}</span></li>`)}</ul>`;
}

function chapter(c, i) {
  const aside = [];
  if (c.image) aside.push(photo(c.image));
  if (c.facts) aside.push(factList(c.facts, 'facts--policy'));

  const blocks = [];
  if (c.subsections) blocks.push(join(c.subsections, (s) => `<h4 class="minor">${esc(s.title)}</h4><p>${prose(s.body)}</p>`));
  if (c.list) blocks.push(`<h4 class="minor">${esc(c.list.title)}</h4>${keyedList(c.list.items)}`);
  if (c.process) blocks.push(`
    <h4 class="minor">${esc(c.process.title)}</h4>
    <ol class="process" role="list">${join(c.process.steps, ([k, v]) => `<li><strong>${esc(k)}</strong><span>${esc(v)}</span></li>`)}</ol>`);
  if (c.breakdown) {
    const b = c.breakdown;
    blocks.push(`
    <figure class="breakdown" data-reveal>
      <figcaption>${prose(b.caption)}</figcaption>
      <div class="breakdown__bar" aria-hidden="true">${join(b.parts, (p, j) => `<span class="seg seg--${j}" style="--w:${p.pct}%"></span>`)}</div>
      <ul class="breakdown__legend" role="list">${join(b.parts, (p, j) => `<li><span class="swatch seg--${j}" aria-hidden="true"></span><span class="num">${p.pct}%</span> ${esc(p.label)}</li>`)}</ul>
    </figure>`);
  }
  if (c.specs) blocks.push(`
    <table class="specs">
      <caption>${esc(c.specs.caption)}</caption>
      <tbody>${join(c.specs.rows, ([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`)}</tbody>
    </table>`);
  if (c.details) blocks.push(`
    <details class="disclosure">
      <summary><span>${esc(c.details.summary)}</span><span class="disclosure__hint">Technical detail</span></summary>
      <div class="disclosure__body">
        <p>${esc(c.details.intro)}</p>
        ${keyedList(c.details.items)}
      </div>
    </details>`);

  return `
  <article class="chapter ${aside.length ? 'chapter--aside' : ''}" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-h">
    <header class="chapter__head">
      <p class="chapter__kicker"><span class="chapter__no">${pad(i)}</span>${esc(c.kicker)}</p>
      <h3 id="${esc(c.id)}-h">${esc(c.title)}</h3>
    </header>
    <div class="chapter__body">
      <div class="chapter__text">
        ${join(c.body, (p) => `<p>${prose(p)}</p>`)}
        ${blocks.join('')}
      </div>
      ${aside.length ? `<div class="chapter__aside">${aside.join('')}</div>` : ''}
    </div>
    ${reportList(c.reports)}
  </article>`;
}

export function campusSection() {
  return `
  <section class="campus" id="campus" aria-labelledby="campus-title">
    <div class="wrap">
      ${sectionHead({ id: 'campus', no: '02', eyebrow: 'Water systems and campus management', title: 'On campus: every drop accounted for', intro: campus.intro })}
      ${loop()}
      <div class="campus__layout">
        <nav class="toc" aria-label="Campus topics">
          <p class="toc__title">Campus topics</p>
          <ol role="list">${join(campus.chapters, (c, i) => `<li><a href="#${esc(c.id)}" data-toc-link="${esc(c.id)}"><span class="num">${pad(i)}</span>${esc(c.kicker)}</a></li>`)}</ol>
        </nav>
        <div class="chapters">${join(campus.chapters, chapter)}</div>
      </div>
    </div>
  </section>`;
}
