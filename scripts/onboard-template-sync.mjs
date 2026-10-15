#!/usr/bin/env node
/**
 * Dev only. Copies a compiled onboarding template from ../anf-crm into
 * src/lib/onboarding/dev/local/ so `npm run dev:onboard` can show a real
 * client's form. That folder is gitignored: a client's template holds their
 * business details and owner-only questions, and this repo is public.
 *
 *   npm run dev:onboard:sync            (med_spa)
 *   node scripts/onboard-template-sync.mjs <template_key>
 *
 * Without a local copy the mock serves src/lib/onboarding/dev/sample.template.json.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = process.argv[2] || 'med_spa';
if (!/^[a-z][a-z0-9_]{1,39}$/.test(key)) {
  console.error('Usage: node scripts/onboard-template-sync.mjs <template_key>');
  process.exit(1);
}
const camel = key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const source = join(root, '..', 'anf-crm', 'src', 'lib', 'onboardingTemplates', `${camel}.ts`);
let text;
try {
  text = readFileSync(source, 'utf8');
} catch {
  console.error(`Not found: ${source}. Check out anf-crm next to this repo and run its template generator first.`);
  process.exit(1);
}
// The generated file holds the template as one JSON string: JSON.parse("...").
const m = /JSON\.parse\(("(?:[^"\\]|\\.)*")\)/.exec(text);
if (!m) {
  console.error('Could not read the template out of ' + source);
  process.exit(1);
}
const template = JSON.parse(JSON.parse(m[1]));
const outDir = join(root, 'src', 'lib', 'onboarding', 'dev', 'local');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${key}.template.json`);
writeFileSync(out, JSON.stringify(template) + '\n');
console.log(`copied ${key} v${template.version} to src/lib/onboarding/dev/local/ (gitignored)`);
