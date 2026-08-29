#!/usr/bin/env node
/**
 * Re-capture the screens behind a guided walkthrough.
 *
 * Every image on /work/<slug> is a real screenshot of the running build with its
 * sample data, never a mockup, so a lead is walked through exactly what they get.
 * That only stays true if the captures are refreshed when the build changes.
 *
 *   node scripts/capture-walkthrough.mjs
 *
 * Requires playwright. It is not a dependency of this repo (this is a static
 * site and the screenshots are committed), so it resolves from anf-crm, which
 * has it for its e2e suite.
 *
 * Two things this script exists to get right, both learned the hard way:
 *  - Navigate by href rather than clicking labels. The nav entries are real
 *    links, and clicking by text is brittle against whitespace and nesting.
 *  - Dismiss the app's own onboarding modal first, or every capture is a
 *    screenshot of a dialog with the actual screen blurred out behind it.
 */
import { chromium } from 'file:///C:/Users/fowle/anf-crm/node_modules/playwright/index.mjs';
const OUT = 'C:/Users/fowle/anf-website/public/walkthrough/family';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto('https://aubreeseverything.com', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.click('text=/try the live demo/i');
await p.waitForTimeout(4500);
// The app runs its own onboarding modal on first load, which blurs everything
// behind it. Dismiss it or every capture is a screenshot of a dialog.
try { await p.click('text=/^Skip$/', { timeout: 6000 }); await p.waitForTimeout(1200); console.log('dismissed onboarding'); }
catch { console.log('no onboarding modal found'); }

// Map every sidebar label to its route, then navigate rather than click. The
// demo flag lives in storage, so staying in the same context keeps the sample
// family loaded across navigations.
const routes = await p.evaluate(() => {
  const m = {};
  document.querySelectorAll('a[href^="/"]').forEach((a) => {
    const t = (a.textContent || '').trim();
    const r = a.getBoundingClientRect();
    if (t && t.length < 26 && r.width > 0) m[t] = a.getAttribute('href');
  });
  return m;
});
console.log('routes found:', Object.keys(routes).length);

const WANT = ['Today', 'Weekly menu', 'Grocery list', 'Kids hub', 'Chores & allowance', 'Travel', 'Advisory board'];
for (const label of WANT) {
  const href = routes[label];
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!href) { console.log(`  MISS ${slug} (no route)`); continue; }
  await p.goto('https://aubreeseverything.com' + href, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `${OUT}/${slug}.jpg`, type: 'jpeg', quality: 80 });
  const h = await p.evaluate(() => (document.querySelector('h1,h2')?.textContent ?? '').trim().slice(0, 50));
  console.log(`  ok   ${slug.padEnd(20)} ${href.padEnd(12)} "${h}"`);
}
await b.close();
