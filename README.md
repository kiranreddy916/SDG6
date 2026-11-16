# SRM University–AP · SDG 6 Clean Water and Sanitation page

A public web page for SDG 6, built from the two `.docx` files in this folder (left unchanged).
It has no dependencies: plain HTML, CSS and ES modules. Node 18+ runs the local server and the build.

## Run

```bash
npm start          # dev server → http://localhost:5173 (page is assembled in the browser)
npm run samples    # regenerates the demo sample reports in reports/samples/
npm run build      # regenerates samples, then pre-renders a static page into dist/
npm run preview    # build, then serve dist/ → http://localhost:5174
```

To deploy, upload the contents of `dist/` to any static host.

## Where things live

| Path | What it is |
| --- | --- |
| `src/content.js` | **All editable content**: figures, text, image captions, report titles and links, SDG Cell contact |
| `src/components/*.js` | Section templates (header, hero, figures, campus, community, evidence, SDG Cell + footer) |
| `src/render.js` | Puts the sections together into one page |
| `src/main.js` | Small browser enhancements: mobile menu, current-section highlight, header shadow |
| `styles/tokens.css` | Colours, type scale, spacing |
| `styles/layout.css`, `styles/sections.css` | Layout and section styles |
| `styles/water.css` | The few water effects (hero waterline, wave edges, pipe flow, bar fills, reading line) — all still under reduced motion |
| `assets/images/` | Photos and the SDG 6 tile, taken from inside the SDG 6 `.docx` (the frames the Word layout drew around the photos were cropped off) |
| `assets/brand/` | Official SRM University–AP logo and site icon, as published on www.srmap.edu.in (header logo and favicon). Used unaltered; replace with university-supplied files if available |
| `reports/samples/` | **Demo sample reports** (generated — do not edit by hand) |
| `scripts/sample-reports.mjs` | Generates the demo sample reports from `src/content.js` |
| `scripts/serve.mjs`, `scripts/build.mjs` | Zero-dependency dev server and pre-render build |

## Report links and demo samples

The source documents give no report URLs (only `[Link 1]`–`[Link 18]` placeholders). So that every link works during
development, each report in `src/content.js → reports` points to a generated page in `reports/samples/`.

**These are demo samples, not official SRM University–AP reports.** Each one is labelled
"DEMO SAMPLE — NOT AN OFFICIAL SRM UNIVERSITY–AP REPORT" at the top, in the footer and as a watermark. They only
repeat facts already on the page. Where an official report would need more data, they say "Not provided in source", and
any data table is marked "Example structure only".

When an official document is published, replace `sample('…')` for that report with its real URL. The generator skips
reports that no longer point to a sample. `ref` is the `[Link n]` number from the source document.

## Reporting periods

- Water volumes (received, used, reused) are for **calendar year 2025**.
- Annual SDG 6 reports are by **academic year** (2024–25, 2025–26).

Figures are shown as the source document gives them. They have not been independently verified.
