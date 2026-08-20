#!/usr/bin/env node
/**
 * fill.js — lead-gen landing page builder
 *
 * Usage: node fill.js
 *
 * Reads client-data.yaml, replaces {{TOKEN}} placeholders in index.html
 * and book.html, writes finished pages + hero image to dist/.
 * No validation, no IF blocks — this template is meant to stay simple.
 * Every token below must have a value in client-data.yaml or it will be
 * left unfilled in the output (the script warns about any it finds).
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

if (!fs.existsSync('client-data.yaml')) {
  console.error('ERROR: client-data.yaml not found. Copy client-data.example.yaml and fill it in.');
  process.exit(1);
}

const data = yaml.load(fs.readFileSync('client-data.yaml', 'utf8')) || {};

function fill(html) {
  for (const [key, value] of Object.entries(data)) {
    html = html.split(`{{${key}}}`).join(String(value));
  }
  return html;
}

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

for (const file of ['index.html', 'book.html', 'thank-you.html']) {
  let html = fs.readFileSync(file, 'utf8');
  html = fill(html);

  const unfilled = html.match(/\{\{[A-Z_0-9]+\}\}/g);
  if (unfilled) {
    console.log(`  ⚠️  ${file} — unfilled tokens: ${[...new Set(unfilled)].join(', ')}`);
  }

  fs.writeFileSync(path.join('dist', file), html, 'utf8');
  console.log(`  ✓  ${file}`);
}

const heroSrc = data.HERO_IMAGE_FILE || 'hero.webp';
if (fs.existsSync(heroSrc)) {
  const heroOut = path.basename(heroSrc);
  fs.copyFileSync(heroSrc, path.join('dist', heroOut));
  console.log(`  ✓  ${heroOut} (from ${heroSrc})`);
  console.log(`     (make sure index.html's .hero background-image url() matches "${heroOut}")`);
} else {
  console.log(`  ⚠️  hero image not found at ${heroSrc} — not copied to dist/`);
}

console.log('\n✅  Build complete. Output in dist/.');
