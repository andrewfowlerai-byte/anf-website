#!/usr/bin/env node
/**
 * Re-capture the screens behind the guided walkthroughs on /work/<slug>.
 *
 * Every image on a walkthrough is a real screenshot of the running build with
 * its sample data, never a mockup, so a lead is walked through exactly what they
 * get. That only stays true if the captures are refreshed when a build changes.
 *
 *   node scripts/capture-walkthrough.mjs            all of them
 *   node scripts/capture-walkthrough.mjs family     just one
 *
 * Requires playwright. It is deliberately NOT a dependency of this repo: this is
 * a static site, the screenshots are committed, and nobody should need a browser
 * engine to build the marketing site. It resolves from anf-crm, which has it for
 * the e2e suite.
 *
 * Two shapes of build, because the samples are two different things:
 *   routes   an app with real navigation. Go to each href and shoot the viewport.
 *   sections a marketing site that scrolls. Scroll each section into view and shoot.
 *
 * Three things this script exists to get right, all learned the hard way:
 *   - Navigate by href rather than clicking a label. The nav entries are real
 *     links and clicking by text is brittle against whitespace and nesting.
 *   - Dismiss the app's own onboarding modal first, or every capture is a
 *     screenshot of a dialog with the real screen blurred out behind it.
 *   - Wait after navigating. These apps animate in, and a screenshot taken too
 *     early catches a half-faded page that looks broken rather than calm.
 */
import { chromium } from 'file:///C:/Users/fowle/anf-crm/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'walkthrough');

/** Route builds list nav labels; section builds list {name, section} pairs.
 * @type {Record<string, {url:string, mode:'routes'|'sections', unlock?:string, enter?:string, dismiss?:string, shots:any[]}>} */
const BUILDS = {
  family: {
    url: 'https://aubreeseverything.com',
    mode: 'routes',
    enter: 'text=/try the live demo/i',
    dismiss: 'text=/^Skip$/',
    // label in the app nav -> file name is derived from it
    shots: ['Today', 'Weekly menu', 'Grocery list', 'Kids hub', 'Chores & allowance', 'Travel', 'Advisory board'],
  },
  'solo-agent': {
    url: 'https://solo-agent.anfconsult.com',
    unlock: 'kiara2026',
    mode: 'routes',
    shots: ['Today', 'Pipeline', 'Buyers', 'Reconnect', 'Open house', 'Commissions', 'Spending insights'],
  },
  bar: {
    url: 'https://bar.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'our-story', section: 1 },
      { name: 'the-menu', section: 2 },
      { name: 'golden-hour', section: 3 },
      { name: 'build-yours', section: 4 },
    ],
  },
  retail: {
    url: 'https://retail.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'check-in', section: 1 },
      { name: 'wear-it-well', section: 2 },
      { name: 'shop', section: 3 },
      { name: 'journal', section: 4 },
      { name: 'give-back', section: 5 },
    ],
  },
  'realtor-site': {
    url: 'https://realtor-site.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'philosophy', section: 1 },
      { name: 'collection', section: 2 },
      { name: 'neighborhoods', section: 3 },
      { name: 'guide', section: 4 },
      { name: 'reviews', section: 5 },
    ],
  },
  'realtor-leads': {
    url: 'https://realtor-leads.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'summer-guide', section: 1 },
      { name: 'full-guide', section: 2 },
      { name: 'home-value', section: 4 },
      { name: 'new-to-cleveland', section: 5 },
    ],
  },
  'simple-site': {
    url: 'https://simple-site.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'how-she-works', section: 2 },
      { name: 'recent-work', section: 3 },
      { name: 'contact', section: 4 },
    ],
  },
  'dual-business': {
    url: 'https://dual-business.anfconsult.com',
    mode: 'sections',
    shots: [
      { name: 'hero', section: 0 },
      { name: 'promise', section: 1 },
      { name: 'portfolio', section: 2 },
      { name: 'territory', section: 3 },
      { name: 'approach', section: 4 },
      { name: 'about', section: 5 },
    ],
  },
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function capture(browser, name, cfg) {
  const dir = join(OUT, name);
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  let ok = 0;

  try {
    await page.goto(cfg.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500);

    // Some samples sit behind a passcode. These codes are already printed next
    // to their links on the public /work page, so they are not secrets; they are
    // friction. Removing the gates entirely is the real fix, tracked separately.
    if (cfg.unlock) {
      try {
        await page.fill('input[type=password]', cfg.unlock);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3500);
      } catch { /* not gated today */ }
    }

    if (cfg.enter) {
      await page.click(cfg.enter, { timeout: 10000 });
      await page.waitForTimeout(4000);
    }
    if (cfg.dismiss) {
      try { await page.click(cfg.dismiss, { timeout: 6000 }); await page.waitForTimeout(1200); }
      catch { /* the modal only shows on a first visit */ }
    }

    if (cfg.mode === 'routes') {
      // Build label -> href from what is actually on screen, then navigate.
      const routes = await page.evaluate(() => {
        const m = {};
        document.querySelectorAll('a[href^="/"]').forEach((a) => {
          const t = (a.textContent || '').trim();
          const r = a.getBoundingClientRect();
          if (t && t.length < 26 && r.width > 0 && !m[t]) m[t] = a.getAttribute('href');
        });
        return m;
      });
      const origin = new URL(cfg.url).origin;
      for (const label of cfg.shots) {
        const href = routes[label];
        if (!href) { console.log(`    MISS ${slugify(label)} (no such nav item)`); continue; }
        await page.goto(origin + href, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2400);
        await page.screenshot({ path: join(dir, `${slugify(label)}.jpg`), type: 'jpeg', quality: 80 });
        console.log(`    ok   ${slugify(label)}  ${href}`);
        ok++;
      }
    } else {
      // Scroll a named section into view. The index is pinned in the config
      // rather than inferred from order, because label order and DOM order are
      // not the same thing on any of these sites and a mislabelled capture puts
      // the wrong caption under a real screenshot.
      const count = await page.evaluate(() => document.querySelectorAll('section').length);
      for (const shot of cfg.shots) {
        if (shot.section >= count) {
          console.log(`    MISS ${shot.name} (wanted section ${shot.section}, page has ${count})`);
          continue;
        }
        if (shot.section === 0) {
          await page.evaluate(() => window.scrollTo(0, 0));
        } else {
          await page.evaluate((n) => {
            const el = document.querySelectorAll('section')[n];
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'instant' });
          }, shot.section);
        }
        await page.waitForTimeout(1500);
        await page.screenshot({ path: join(dir, `${shot.name}.jpg`), type: 'jpeg', quality: 80 });
        console.log(`    ok   ${shot.name}  (section ${shot.section})`);
        ok++;
      }
    }
  } catch (err) {
    console.log(`    ERROR ${String(err.message).split('\n')[0].slice(0, 90)}`);
  }
  await page.close();
  return ok;
}

const only = process.argv[2];
const names = only ? [only] : Object.keys(BUILDS);
if (only && !BUILDS[only]) {
  console.log(`No build called "${only}". Known: ${Object.keys(BUILDS).join(', ')}`);
  process.exitCode = 1;
} else {
  const browser = await chromium.launch();
  let total = 0;
  for (const name of names) {
    console.log(`\n${name}`);
    total += await capture(browser, name, BUILDS[name]);
  }
  await browser.close();
  console.log(`\n${total} screens captured into public/walkthrough/`);
}
