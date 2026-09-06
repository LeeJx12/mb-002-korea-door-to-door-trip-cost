const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const base = 'https://leejx12.github.io/mb-002-korea-door-to-door-trip-cost/';
const routes = ['', 'seoul-busan/', 'seoul-gangneung/', 'seoul-jeonju/'];

for (const route of routes) {
  const html = fs.readFileSync(path.join(route, 'index.html'), 'utf8');
  assert.match(html, /<meta name="description"/);
  assert.match(html, new RegExp(`<link rel="canonical" href="${base}${route}"`));
  assert.match(html, /<h1>/);
}

const home = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(home, { runScripts: 'dangerously', url: `${base}?route=busan` });
const doc = dom.window.document;
assert.equal(doc.querySelector('#route').value, 'busan');
assert.equal(doc.querySelector('#distance').value, '400');
assert.equal(doc.querySelectorAll('#out .r').length, 3);
assert.match(doc.querySelector('#out').textContent, /자차/);
assert.match(doc.querySelector('#out').textContent, /KTX\/철도/);
assert.match(doc.querySelector('#out').textContent, /버스/);

// Exercise editable values and the user-triggered calculation path.
doc.querySelector('#people').value = '4';
doc.querySelector('#fuel').value = '1800';
doc.querySelector('#calc').click();
assert.match(doc.querySelector('#out').textContent, /173,000원/);
assert.match(doc.querySelector('#out').textContent, /508,400원/);
assert.match(doc.querySelector('#out').textContent, /246,000원/);
assert.equal(doc.querySelector('#out .best').textContent.includes('자차'), true);

for (const route of ['busan', 'gangneung', 'jeonju']) {
  assert.match(home, new RegExp(`seoul-${route === 'busan' ? 'busan' : route}`));
}
console.log('Validated four routes, SEO metadata, presets, editable calculator totals, and cheapest-result state.');
