// Assembles the full page markup from components. Pure: runs in the browser
// (src/main.js) and in Node (scripts/build.mjs pre-renders it into dist/).
import { header } from './components/header.js';
import { heroSection } from './components/hero.js';
import { figuresSection } from './components/figures.js';
import { campusSection } from './components/campus.js';
import { communitySection } from './components/community.js';
import { evidenceSection } from './components/evidence.js';
import { sdgCellSection, footer } from './components/sdgCell.js';

export function renderPage() {
  return [
    header(),
    `<main id="main" tabindex="-1">`,
    heroSection(),
    figuresSection(),
    campusSection(),
    communitySection(),
    sdgCellSection(),
    evidenceSection(),
    `</main>`,
    footer(),
  ].join('\n');
}
