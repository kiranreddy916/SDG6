// Generates DEMO SAMPLE report pages into reports/samples/ so every report link
// on the SDG 6 page has a working local destination during development.
//
//   npm run samples
//
// Rules followed by every sample:
//   - Clearly labelled "DEMO SAMPLE — NOT AN OFFICIAL SRM UNIVERSITY–AP REPORT"
//     at the top, in the footer and on every printed page.
//   - Uses only facts already in src/content.js (taken from the supplied
//     source documents). Nothing is invented: where an official report would
//     need more data, the sample says the detail is not provided, and any
//     table structure is marked "Example structure only" with no values.
//   - No approvals, signatures, results or claims.
//   - No hyperlinks inside the reports: related documents and source sections
//     are named as plain text. The only control is the page's Back button.
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { reports, evidenceGroups, campus, community, figures, sdgCell, site } from '../src/content.js';

const OUT = 'reports/samples';
const DEMO = 'DEMO SAMPLE — NOT AN OFFICIAL SRM UNIVERSITY–AP REPORT';
const NP = 'Not provided in source';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n.toLocaleString('en-US');
const slugOf = (key) => reports[key].url.split('/').pop();

const chapters = Object.fromEntries([...campus.chapters, ...community.stories].map((c) => [c.id, c]));
const groupOf = (key) => {
  if (key.startsWith('annual')) return 'Annual reports';
  return evidenceGroups.find((g) => g.items.includes(key))?.label ?? 'Report';
};

/* ------------------------------------------------------------------ */
/* Per-report configuration                                           */
/* from:        page sections whose source text is reproduced         */
/* period:      reporting period, only where the source states one    */
/* template:    an EMPTY example table (structure only)               */
/* notProvided: what an official report would need that the source    */
/*              documents do not contain                              */
/* ------------------------------------------------------------------ */
const months2025 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => `${m} 2025`);

const config = {
  drinkingTests: {
    from: ['drinking-water'], focus: 'Water testing',
    template: {
      caption: 'Example structure for laboratory results — no values are provided in the source',
      head: ['Parameter', 'Result', 'Unit', 'Acceptable limit', 'Sample date'],
      rows: ['TDS', 'Hardness', 'Alkalinity', 'Suspended solids', 'Total coliform'].map((p) => [p, NP, NP, NP, NP]),
    },
    notProvided: ['Name of the third-party laboratory', 'Sampling points, dates and frequency', 'Measured results and the standard limits applied', 'Laboratory certificates'],
  },
  freeDrinking: {
    from: ['drinking-water'],
    notProvided: ['A location list of the 190 drinking-water points', 'Capacity of each RO plant', 'Maintenance and cleaning schedule for dispensers and coolers'],
  },
  policy: {
    from: ['policy'],
    notProvided: ['Full text and clauses of the policy', 'Approving authority and approval record', 'Responsible offices and implementation procedure'],
  },
  measurement: {
    from: ['measurement'], period: 'Calendar year 2025',
    template: {
      caption: 'Example structure for the month-wise record — monthly values are not provided in the source',
      head: ['Month', 'Metered use (kL)'],
      rows: [...months2025.map((m) => [m, NP]), ['Total, calendar year 2025', `${fmt(431579)} (as stated in source)`]],
    },
    notProvided: ['Month-wise meter readings', 'Readings by building or supply line', 'Meter calibration records'],
  },
  extraction: {
    from: ['extraction'], period: 'Calendar year 2025',
    template: {
      caption: 'Water received by source, calendar year 2025 — per-source volumes are not provided in the source',
      head: ['Source', 'How it is measured (as stated)', 'Volume (kL)'],
      rows: [
        ['CRDA supply', NP, NP],
        ['Kondaveeti Vagu', 'Metered at the intake', NP],
        ['River water pumped to the CRDA sump', 'Estimated from logged pump running hours', NP],
        ['Tanker water received at Phase 1 and Phase 2', NP, NP],
        ['Total received', 'Daily meter readings compiled into monthly records', `${fmt(517311)} (as stated in source)`],
      ],
    },
    notProvided: ['Volume received from each source', 'Monthly records', 'Groundwater recharge estimates for the 11 rainwater harvesting systems'],
  },
  wastewater: {
    from: ['wastewater'],
    template: {
      caption: 'Plant summary — individual plant capacities are not provided in the source',
      head: ['Plants', 'Type (as stated)', 'Capacity'],
      rows: [
        ['2 plants', 'Conventional aeration-based', NP],
        ['2 plants', 'Chemical-free Bio STP', NP],
        ['All 4 plants', '—', '1,943 kL/day total (as stated in source)'],
      ],
    },
    notProvided: ['Capacity of each plant', 'Daily treated-water quality readings', 'Monthly NABL-certified laboratory results', 'The written SOP displayed at the plant'],
  },
  reuse: {
    from: ['reuse'], period: 'Calendar year 2025',
    template: {
      caption: 'Use of reused treated water, calendar year 2025',
      head: ['Use', 'Share (as stated)', 'Volume (kL)'],
      rows: [['Toilet flushing', '75%', NP], ['Cooling', '20%', NP], ['Gardening', '5%', NP], ['Total reused', '100%', `${fmt(143535)} (as stated in source)`]],
    },
    notProvided: ['Volume for each use in kilolitres', 'Monthly reuse records', 'Treated-water quality at the point of reuse'],
  },
  pollution: {
    from: ['pollution'],
    notProvided: ['Findings of the external energy, environment and green audit', 'Incident or spill records', 'Inspection schedule'],
  },
  sopChemical: {
    from: ['pollution'], sop: true,
    notProvided: ['The full procedure text', 'Document number, version and approval details', 'Chemical inventory and storage locations'],
  },
  sopSpill: {
    from: ['pollution'], sop: true,
    notProvided: ['The full procedure text', 'Document number, version and approval details', 'Emergency contact list and escalation chart'],
  },
  building: {
    from: ['building-standards'],
    notProvided: ['Fixture inventory by building', 'Locations of the washrooms that do not yet have dual-flush toilets', 'Tank-cleaning records'],
  },
  planting: {
    from: ['planting'],
    notProvided: ['Species list with drought-tolerance classification', 'Counts or shares for each classification', 'Irrigation schedules'],
  },
  usage: {
    from: ['usage'],
    notProvided: ['Number and locations of signs', 'Any measured change in use'],
  },
  education: {
    from: ['community-education'],
    notProvided: ['Participant numbers', 'Water-sample test results from the villages', 'Dates of the Ainavolu discussions and the school session', 'Survey questions and findings'],
  },
  cooperation: {
    from: ['we-meet'], period: '27 February – 1 March 2025',
    notProvided: ['Speaker and participant lists', 'Text of the compendium of research abstracts', 'Text of the policy brief and its recommendations', 'Names of the new partners'],
  },
  wider: {
    from: ['ese'], period: '19 September 2025',
    notProvided: ['List of participating institutions and models', 'Names of the sustainability leaders', 'Feedback or evaluation'],
  },
};

/* ------------------------------------------------------------------ */
/* Rendering helpers                                                  */
/* ------------------------------------------------------------------ */
const p = (t) => `<p>${esc(t)}</p>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const table = ({ caption, head, rows }, note) => `
  <table>
    <caption>${esc(caption)}${note ? `<span class="tag">${esc(note)}</span>` : ''}</caption>
    <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td${c === NP ? ' class="np"' : ''}>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody>
  </table>`;

function sectionFromSource(c) {
  const out = [];
  out.push(...(c.body || []).map(p));
  (c.subsections || []).forEach((s) => out.push(`<h3>${esc(s.title)}</h3>`, p(s.body)));
  if (c.list?.items) out.push(`<h3>${esc(c.list.title)}</h3>`, ul(c.list.items.map(([k, v]) => (k ? `<strong>${esc(k)}:</strong> ${esc(v)}` : esc(v)))));
  if (Array.isArray(c.list)) out.push(ul(c.list.map(esc)));
  if (c.process) out.push(`<h3>${esc(c.process.title)}</h3><ol>${c.process.steps.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ol>`);
  if (c.specs) out.push(table({ caption: c.specs.caption, head: ['Fixture', 'Standard'], rows: c.specs.rows }));
  if (c.breakdown) out.push(table({ caption: c.breakdown.caption, head: ['Use', 'Share'], rows: c.breakdown.parts.map((x) => [x.label, `${x.pct}%`]) }));
  if (c.facts) out.push(`<dl>${c.facts.map((f) => `<dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd>`).join('')}</dl>`);
  if (c.details) out.push(`<h3>${esc(c.details.summary)}</h3>`, p(c.details.intro), ul(c.details.items.map(([k, v]) => `<strong>${esc(k)}:</strong> ${esc(v)}`)));
  return out.join('\n');
}

const sopNote = `
  <p>The source states that the two written Standard Operating Procedures together cover
  <strong>prevention, containment, response, clean-up, waste disposal and reporting</strong>.
  The procedure text itself is not included in the source documents, so the outline below only
  lists those stated areas and the measures described on the page.</p>
  ${table({ caption: 'Example structure for the procedure — content not provided in the source', head: ['Section', 'Procedure text'], rows: ['Prevention', 'Containment', 'Response', 'Clean-up', 'Waste disposal', 'Reporting'].map((x) => [x, NP]) }, 'Example structure only')}`;

function page({ key, title, period, group, bodyHtml, notProvided, related }) {
  const r = reports[key];
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>[DEMO SAMPLE] ${esc(title)}</title>
<link rel="stylesheet" href="sample.css">
</head>
<body>
<div class="demo-banner" role="note"><strong>${esc(DEMO)}</strong><span>Prepared only to test website links. Not reviewed, approved or issued by the university.</span></div>
<main>
  <p class="back"><button type="button" class="back__btn" data-back><span aria-hidden="true">← </span>Back</button></p>
  <header>
    <p class="kicker">${esc(site.university)} · SDG 6 Clean Water and Sanitation · ${esc(group)}</p>
    <h1>${esc(title)}</h1>
    <dl class="meta">
      <div><dt>Document type</dt><dd>${esc(r.type)} (demo sample)</dd></div>
      <div><dt>Reporting period</dt><dd>${esc(period || r.period || 'Not stated in source')}</dd></div>
      <div><dt>Status</dt><dd>Demo sample — not an official report</dd></div>
    </dl>
  </header>

  <section class="about">
    <h2>About this sample</h2>
    <p>This page stands in for the official “${esc(title)}” so that the link on the SDG 6 web page can be tested.
    It reproduces only information already given in the university’s SDG 6 page content. It contains no new data,
    results, approvals or signatures. Replace this link with the official document when it is published.</p>
  </section>

  ${bodyHtml}

  <section>
    <h2>Not provided in the source documents</h2>
    <p>An official version of this report would be expected to include details that the supplied documents do not contain:</p>
    ${ul(notProvided.map(esc))}
  </section>

  ${related?.length ? `<section><h2>Related sample reports</h2>${ul(related.map((k) => `${esc(reports[k].title)} <span class="muted">(demo sample)</span>`))}</section>` : ''}

  <footer>
    <p><strong>${esc(DEMO)}</strong></p>
    <p>Source: SDG 6 page content supplied by SRM University–AP. Contact for the official document: ${esc(sdgCell.contact.office.join(', '))}, ${esc(sdgCell.contact.email)}.</p>
  </footer>
</main>
${backScript}
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Topic reports                                                      */
/* ------------------------------------------------------------------ */
function topicReport(key) {
  const c = config[key];
  const sections = c.from.map((id) => {
    const ch = chapters[id];
    return `<section>
      <h2>${esc(ch.kicker)}: what the source states</h2>
      ${sectionFromSource(ch)}
      <p class="cite">Source section: ${esc(ch.title)} on the SDG 6 page.</p>
    </section>`;
  }).join('\n');
  const extra = [
    c.sop ? `<section><h2>Procedure outline</h2>${sopNote}</section>` : '',
    c.template ? `<section><h2>Data table</h2>${table(c.template, 'Example structure only')}<p class="muted">Cells marked “${NP}” are intentionally empty. Only figures stated in the source are filled in.</p></section>` : '',
  ].join('\n');
  const group = groupOf(key);
  const siblings = evidenceGroups.find((g) => g.items.includes(key))?.items.filter((k) => k !== key) ?? [];
  return page({ key, title: reports[key].title, period: c.period, group, bodyHtml: sections + extra, notProvided: c.notProvided, related: siblings });
}

/* ------------------------------------------------------------------ */
/* Annual reports: an outline of the year's SDG 6 topics. Water       */
/* figures in the source are for calendar year 2025, not the academic */
/* year, so they are shown with that label and not re-attributed.     */
/* ------------------------------------------------------------------ */
function annualReport(key) {
  const r = reports[key];
  const vol = figures.volumes.map((v) => [v.label, `${fmt(v.value)} kL`, 'Calendar year 2025']);
  const fac = figures.facilities.map((f) => [f.label, f.of ? `${f.value} of ${f.of}` : f.extra ? `${f.value} (${f.extra.value} ${f.extra.unit} ${f.extra.label})` : f.value, 'As reported for 2025']);
  const topics = Object.keys(config).map((k) => esc(reports[k].title));
  const dated = community.timeline.items.map((i) => `<strong>${esc(i.when)}:</strong> ${esc(i.what)}`);
  const body = `
  <section>
    <h2>Reporting period</h2>
    <p>This annual report covers <strong>${esc(r.period.toLowerCase())}</strong>. The water figures available in the source are reported for
    <strong>calendar year 2025</strong>, which does not match the academic year. They are reproduced below with their own
    period label and have not been converted or re-attributed. Academic-year figures are not provided in the source.</p>
  </section>
  <section>
    <h2>Key figures as stated in the source</h2>
    ${table({ caption: 'Water volumes', head: ['Measure', 'Value', 'Period'], rows: vol })}
    <p class="muted">${esc(figures.volumesNote)}</p>
    ${table({ caption: 'Campus facilities', head: ['Facility', 'Value', 'Period'], rows: fac })}
  </section>
  <section>
    <h2>Dated community activities in 2025</h2>
    ${ul(dated)}
    <p class="muted">These dates are calendar dates from the source; which of them fall within ${esc(r.period.toLowerCase())} has not been assessed here.</p>
  </section>
  <section>
    <h2>Topic reports</h2>
    <p>Sample reports for each SDG 6 topic (all demo samples):</p>
    ${ul(topics)}
  </section>
  <section>
    <h2>About the SDG Cell</h2>
    <p>${esc(sdgCell.about)}</p>
    <p class="muted">The official annual report would be issued through the SDG Cell. This demo sample was not prepared or reviewed by it.</p>
  </section>`;
  return page({
    key, title: r.title, period: r.period, group: 'Annual reports', bodyHtml: body,
    notProvided: ['Figures for the academic year itself', 'Targets, progress against targets and commentary', 'Approval and publication details', 'Year-on-year comparison'],
    related: ['annual2425', 'annual2526'].filter((k) => k !== key),
  });
}

/* Back button (a page control, not a link inside the report). If the visitor
   came from a page on this site, it goes back in browser history, so the SDG 6
   page returns them to the exact section and scroll position they left.
   Opened directly or from another site, it opens the SDG 6 Reports section. */
const backScript = `<script>
document.addEventListener('click', function (e) {
  if (!e.target.closest || !e.target.closest('[data-back]')) return;
  var ref = '';
  try { ref = document.referrer ? new URL(document.referrer).origin : ''; } catch (err) {}
  if (ref === location.origin && history.length > 1) history.back();
  else location.href = '../../index.html#evidence';
});
</script>`;

const css = `/* Shared styles for the DEMO SAMPLE report pages. */
:root { --ink:#0b2230; --muted:#4d6470; --line:#cad8da; --paper:#f5f8f7; --accent:#086a8a; --demo:#8a2b14; --demo-bg:#fff1ea; }
* { box-sizing: border-box; }
body { margin:0; background:var(--paper); color:#13242d; font:16px/1.6 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif; }
.demo-banner { position:sticky; top:0; z-index:2; display:flex; flex-wrap:wrap; gap:.25rem 1rem; align-items:baseline; padding:.7rem 1.25rem; background:var(--demo-bg); color:var(--demo); border-bottom:2px solid var(--demo); font-size:.9rem; }
.demo-banner strong { letter-spacing:.04em; }
main { max-width:52rem; margin:0 auto; padding:1.5rem 1.25rem 4rem; background:#fff; border-inline:1px solid var(--line); min-height:100vh; position:relative; overflow:hidden; }
main::before { content:'DEMO SAMPLE'; position:absolute; top:14rem; left:50%; transform:translateX(-50%) rotate(-24deg); font:700 clamp(3rem,10vw,6rem)/1 Georgia,serif; color:rgba(138,43,20,.06); pointer-events:none; white-space:nowrap; }
a { color:var(--accent); }
a:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
.back { margin:0 0 1.5rem; }
.back__btn { font:600 .9rem/1.2 inherit; font-family:inherit; color:var(--accent); background:none; border:1px solid var(--line); border-radius:2px; padding:.45rem .8rem; cursor:pointer; }
.back__btn:hover { border-color:var(--accent); background:#f0f7f9; }
.back__btn:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
.kicker { font-size:.78rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); margin:0 0 .5rem; }
h1 { font:500 clamp(1.8rem,1.4rem + 2vw,2.6rem)/1.15 Georgia,'Times New Roman',serif; color:var(--ink); margin:0 0 1.25rem; }
h2 { font:500 1.35rem/1.25 Georgia,'Times New Roman',serif; color:var(--ink); margin:2.25rem 0 .75rem; padding-top:1rem; border-top:1px solid var(--line); }
h3 { font-size:1rem; margin:1.5rem 0 .4rem; color:var(--ink); }
.meta { display:grid; grid-template-columns:repeat(auto-fit,minmax(12rem,1fr)); gap:.75rem 1.5rem; margin:0; padding:1rem 0; border-block:2px solid var(--ink); }
.meta dt { font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
.meta dd { margin:.1rem 0 0; font-weight:600; }
.about { background:var(--demo-bg); border-left:4px solid var(--demo); padding:.25rem 1.25rem 1rem; margin-top:1.5rem; }
.about h2 { border:0; margin-top:.75rem; }
dl:not(.meta) dt { font-weight:700; margin-top:.5rem; }
dl:not(.meta) dd { margin:0 0 .25rem; }
table { width:100%; border-collapse:collapse; margin:1rem 0; font-size:.94rem; }
caption { text-align:left; font-weight:700; padding-bottom:.5rem; }
caption .tag { display:inline-block; margin-left:.6rem; padding:.1rem .45rem; font-size:.7rem; letter-spacing:.06em; text-transform:uppercase; color:var(--demo); border:1px solid currentColor; vertical-align:middle; }
th, td { text-align:left; padding:.55rem .6rem; border-bottom:1px solid var(--line); vertical-align:top; }
thead th { border-bottom:2px solid var(--ink); font-size:.82rem; }
td.np { color:var(--muted); font-style:italic; }
.cite, .muted { color:var(--muted); font-size:.9rem; }
footer { margin-top:3rem; padding-top:1rem; border-top:2px solid var(--demo); color:var(--demo); font-size:.9rem; }
.index-list li { margin:.35rem 0; }
@media (max-width:600px) { table { display:block; overflow-x:auto; } main { border:0; } }
@media print {
  body { background:#fff; } main { border:0; max-width:none; }
  .demo-banner { position:fixed; top:0; left:0; right:0; }
  main { padding-top:4rem; }
  main::before { position:fixed; top:45%; }
  .back { display:none; }
}
`;

function indexPage() {
  const groups = [{ label: 'Annual reports', items: ['annual2425', 'annual2526'] }, ...evidenceGroups];
  return `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>[DEMO SAMPLES] SDG 6 report samples</title><link rel="stylesheet" href="sample.css"></head>
<body><div class="demo-banner" role="note"><strong>${esc(DEMO)}</strong><span>Every document in this folder is a demo sample.</span></div>
<main><p class="back"><button type="button" class="back__btn" data-back><span aria-hidden="true">← </span>Back</button></p>
<h1>SDG 6 report samples</h1>
<p>These pages exist only so the report links on the SDG 6 page can be tested. Each reproduces information from the SDG 6 page content and lists what an official report would still need. Replace each link with the official document once published.</p>
${groups.map((g) => `<h2>${esc(g.label)}</h2><ul class="index-list">${g.items.map((k) => `<li>${esc(reports[k].title)}</li>`).join('')}</ul>`).join('')}
<footer><p><strong>${esc(DEMO)}</strong></p></footer></main>${backScript}</body></html>
`;
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/sample.css`, css);
await writeFile(`${OUT}/index.html`, indexPage());
let n = 0;
for (const key of Object.keys(reports)) {
  if (!reports[key].url?.startsWith(`${OUT}/`)) continue; // official URL set: no sample needed
  const html = key.startsWith('annual') ? annualReport(key) : topicReport(key);
  await writeFile(`${OUT}/${slugOf(key)}`, html);
  n += 1;
}
console.log(`Wrote ${n} demo sample reports to ${OUT}/`);
