import { esc, join } from '../lib/html.js';
import { community } from '../content.js';
import { photo, reportList, sectionHead, factList, waveEdge } from './shared.js';

function story(s, i) {
  return `
  <article class="story ${i % 2 ? 'story--flip' : ''}" id="${esc(s.id)}" aria-labelledby="${esc(s.id)}-h">
    <div class="story__media">${photo(s.image)}</div>
    <div class="story__text">
      <p class="eyebrow eyebrow--small">${esc(s.kicker)}</p>
      <h3 id="${esc(s.id)}-h">${esc(s.title)}</h3>
      ${join(s.body, (p) => `<p>${esc(p)}</p>`)}
      ${s.list ? `<ul class="ticks" role="list">${join(s.list, (l) => `<li>${esc(l)}</li>`)}</ul>` : ''}
      ${factList(s.facts, 'facts--inline')}
      ${reportList(s.reports)}
    </div>
  </article>`;
}

export function communitySection() {
  const t = community.timeline;
  return `
  <section class="community" id="community" aria-labelledby="community-title">
    ${waveEdge('top')}
    <div class="wrap">
      ${sectionHead({ id: 'community', no: '03', eyebrow: 'Water in the community', title: 'Beyond the campus boundary', intro: community.intro, tone: 'section-head--light' })}

      <div class="timeline">
        <h3 class="timeline__title">${esc(t.caption)}</h3>
        <ol role="list">
          ${join(t.items, (it) => `
          <li><a href="${esc(it.href)}">
            <span class="timeline__when">${esc(it.when)}</span>
            <span class="timeline__what">${esc(it.what)}</span>
          </a></li>`)}
        </ol>
      </div>

      <div class="stories">${join(community.stories, story)}</div>
    </div>
    ${waveEdge('bottom')}
  </section>`;
}
