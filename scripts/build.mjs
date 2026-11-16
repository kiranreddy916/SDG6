// Pre-renders the page into dist/ so it works as plain static HTML
// (no JavaScript needed to see content; JS only adds the mobile menu and
// current-section highlighting).
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { renderPage } from '../src/render.js';

const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

let html = await readFile('index.html', 'utf8');
html = html
  .replace('<div id="app"><!--APP--></div>', `<div id="app" data-prerendered="true">\n${renderPage()}\n</div>`)
  .replace(/\s*<noscript>[\s\S]*?<\/noscript>/, '');

await writeFile(`${out}/index.html`, html);
for (const dir of ['src', 'styles', 'assets', 'reports']) await cp(dir, `${out}/${dir}`, { recursive: true });

console.log('Built dist/index.html');
