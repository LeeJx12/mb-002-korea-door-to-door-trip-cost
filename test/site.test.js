const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('node:test');
const { JSDOM } = require('jsdom');

const base = 'https://leejx12.github.io/mb-002-korea-door-to-door-trip-cost/';
const home = fs.readFileSync('index.html', 'utf8');

function makeDom(url = `${base}?route=busan`) {
  const events = [];
  const dom = new JSDOM(home, {
    runScripts: 'dangerously', url, pretendToBeVisual: true,
    beforeParse(window) {
      window.mb002EventAdapter = (name, payload) => events.push({ name, payload });
      window.confirm = () => true;
    },
  });
  return { dom, doc: dom.window.document, events };
}

describe('canonical pages and bounded route set', () => {
  for (const route of ['', 'seoul-busan/', 'seoul-gangneung/', 'seoul-jeonju/']) {
    test(route || 'root', () => {
      const html = fs.readFileSync(path.join(route, 'index.html'), 'utf8');
      assert.match(html, /<meta name="description"/);
      assert.match(html, new RegExp(`<link rel="canonical" href="${base}${route}"`));
      assert.match(html, /<h1>/);
    });
  }
  test('root links exactly the three existing route pages', () => {
    const { doc } = makeDom();
    assert.deepEqual([...doc.querySelectorAll('nav.routes a')].map(a => a.getAttribute('href')), ['./seoul-busan/', './seoul-gangneung/', './seoul-jeonju/']);
  });
});

describe('progressive decision flow and calculator regressions', () => {
  test('only route, party, direction and compare precede collapsed assumptions', () => {
    const { doc } = makeDom();
    assert.equal(doc.querySelector('#assumption-details').open, false);
    assert.deepEqual([...doc.querySelectorAll('.decision-grid select,.decision-grid input')].map(x => x.id), ['route', 'people', 'round']);
    assert.equal(doc.querySelectorAll('#assumption-details input').length, 9);
    assert.ok(doc.querySelector('#calc').compareDocumentPosition(doc.querySelector('#assumption-details')) & 4);
  });

  test('default and edited values preserve calculation semantics', () => {
    const { doc } = makeDom();
    doc.querySelector('#calc').click();
    assert.match(doc.querySelector('#decision').textContent, /버스가 다음 선택지보다 28,333원 저렴합니다/);
    assert.match(doc.querySelector('#decision').textContent, /약 3명부터/);
    assert.match(doc.querySelector('#decision').textContent, /시간·편의는 금액 비교에 포함되지 않았습니다/);
    assert.deepEqual([...doc.querySelectorAll('#totals .money')].map(x => x.textContent), ['166,333원', '269,200원', '138,000원']);
    doc.querySelector('#people').value = '4';
    doc.querySelector('#fuel').value = '1800';
    doc.querySelector('#fuel').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    doc.querySelector('#calc').click();
    assert.deepEqual([...doc.querySelectorAll('#totals .money')].map(x => x.textContent), ['173,000원', '508,400원', '246,000원']);
    assert.match(doc.querySelector('#totals .lowest').textContent, /자차/);
  });

  test('all three routes retain round-trip and one-way formula coverage', () => {
    const { doc } = makeDom();
    const expected = {
      busan: { round: ['166,333원', '269,200원', '138,000원'], one: ['90,667원', '149,600원', '84,000원'] },
      gangneung: { round: ['94,333원', '138,400원', '108,000원'], one: ['52,167원', '83,200원', '68,000원'] },
      jeonju: { round: ['89,500원', '164,400원', '98,000원'], one: ['49,750원', '95,200원', '62,000원'] },
    };
    for (const [route, totals] of Object.entries(expected)) {
      doc.querySelector('#route').value = route;
      doc.querySelector('#route').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
      doc.querySelector('#round').value = '2';
      doc.querySelector('#calc').click();
      assert.deepEqual([...doc.querySelectorAll('#totals .money')].map(x => x.textContent), totals.round);
      doc.querySelector('#round').value = '1';
      doc.querySelector('#calc').click();
      assert.deepEqual([...doc.querySelectorAll('#totals .money')].map(x => x.textContent), totals.one);
    }
  });

  test('route changes preserve edits and reset restores the selected preset', () => {
    const { doc } = makeDom();
    doc.querySelector('#fuel').value = '1800';
    doc.querySelector('#fuel').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    doc.querySelector('#route').value = 'gangneung';
    doc.querySelector('#route').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    assert.equal(doc.querySelector('#fuel').value, '1800');
    assert.equal(doc.querySelector('#distance').value, '220');
    assert.match(doc.querySelector('#fuel-help').textContent, /직접 수정/);
    doc.querySelector('#reset').click();
    assert.equal(doc.querySelector('#fuel').value, '1700');
    assert.match(doc.querySelector('#fuel-help').textContent, /기준값/);
  });

  test('tie and no-crossover decision sentence variants are explicit', () => {
    const { doc } = makeDom();
    for (const id of ['parking', 'origin', 'local']) doc.querySelector(`#${id}`).value = '0';
    for (const id of ['distance', 'toll', 'rail', 'bus']) doc.querySelector(`#${id}`).value = '0';
    doc.querySelector('#calc').click();
    assert.match(doc.querySelector('#decision').textContent, /최저 총액이 같습니다\(차이 0원\)/);
    doc.querySelector('#distance').value = '10000';
    doc.querySelector('#calc').click();
    assert.match(doc.querySelector('#decision').textContent, /10명까지 자차가 두 대중교통 모두보다 저렴해지지 않습니다/);
  });
});

describe('source, action and accessible error contracts', () => {
  test('all 27 presets have complete source and freshness metadata', () => {
    const { dom } = makeDom();
    const registry = dom.window.MB002.presets;
    assert.deepEqual(Object.keys(registry), ['busan', 'gangneung', 'jeonju']);
    for (const [route, preset] of Object.entries(registry)) {
      assert.equal(Object.keys(preset).length, 9);
      for (const item of Object.values(preset)) {
        for (const key of ['value', 'unit', 'source_name', 'checked_at', 'review_by', 'route', 'direction_scope', 'kind', 'caveat']) assert.notEqual(item[key], undefined);
        assert.ok(item.source_url || item.method);
        assert.equal(item.route, route);
        assert.match(item.checked_at, /^\d{4}-\d{2}-\d{2}$/);
        assert.match(item.review_by, /^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test('stale, missing-source, edited and reset states remain explicit', () => {
    const { dom, doc } = makeDom();
    dom.window.MB002.presets.busan.fuel.review_by = '2000-01-01';
    dom.window.MB002.presets.busan.toll.source_name = '';
    dom.window.MB002.presets.busan.toll.source_url = '';
    dom.window.MB002.presets.busan.toll.method = '';
    doc.querySelector('#route').value = 'gangneung';
    doc.querySelector('#route').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    doc.querySelector('#route').value = 'busan';
    doc.querySelector('#route').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.match(doc.querySelector('#fuel-help').textContent, /검토 기한 지남/);
    assert.match(doc.querySelector('#toll-help').textContent, /출처 확인 필요/);
    doc.querySelector('#fuel').value = '1800';
    doc.querySelector('#fuel').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.match(doc.querySelector('#fuel-help').textContent, /직접 수정/);
    doc.querySelector('#reset').click();
    assert.match(doc.querySelector('#fuel-help').textContent, /검토 기한 지남/);
    doc.querySelector('#calc').click();
    assert.match(doc.querySelector('#trust').textContent, /검토 기한 지난 기준값 2개/);
    assert.match(doc.querySelector('#decision').textContent, /직접 확인해야 하며/);
  });

  test('one post-result action opens a local checklist and fires once', () => {
    const { doc, events } = makeDom();
    doc.querySelector('#calc').click();
    assert.equal(doc.querySelectorAll('#result-action').length, 1);
    assert.equal(doc.querySelector('#result-action').textContent.trim(), '선택 전 공식 운임·시간 확인하기');
    assert.equal(doc.querySelector('#official-checklist').querySelectorAll('a').length, 0);
    doc.querySelector('#result-action').click();
    doc.querySelector('#result-action').click();
    assert.equal(doc.querySelector('#official-checklist').hidden, false);
    assert.equal(events.filter(x => x.name === 'result_action').length, 1);
  });

  test('invalid inputs replace stale output, focus alert, and suppress events/action', () => {
    const { doc, events } = makeDom();
    doc.querySelector('#calc').click();
    const before = events.filter(x => x.name === 'comparison_complete').length;
    doc.querySelector('#people').value = '2.5';
    doc.querySelector('#eff').value = '0';
    doc.querySelector('#calc').click();
    assert.equal(doc.querySelector('#result').hidden, true);
    assert.equal(doc.querySelector('#errors').hidden, false);
    assert.equal(doc.querySelector('#people').getAttribute('aria-invalid'), 'true');
    assert.equal(doc.activeElement.id, 'errors');
    assert.equal(events.filter(x => x.name === 'comparison_complete').length, before);
    assert.doesNotMatch([...doc.querySelectorAll('#totals .money')].map(x => x.textContent).join(' '), /NaN|Infinity/);
  });

  test('blank, malformed, negative and non-enum values are invalid without coercion', () => {
    const { doc, events } = makeDom();
    const invalid = { people: '', round: '3', eff: '0', fuel: '-1', distance: '', toll: '-1', parking: '-1', rail: '', bus: '-1', origin: '-1', local: '' };
    for (const [id, value] of Object.entries(invalid)) doc.querySelector(`#${id}`).value = value;
    doc.querySelector('#calc').click();
    assert.equal(doc.querySelectorAll('[aria-invalid="true"]').length, 11);
    assert.equal(doc.querySelectorAll('#error-list li').length, 11);
    assert.equal(doc.querySelector('#result').hidden, true);
    assert.equal(events.filter(x => x.name === 'comparison_complete').length, 0);
  });

  test('unknown query route safely falls back with a visible notice', () => {
    const { doc } = makeDom(`${base}?route=unknown`);
    assert.equal(doc.querySelector('#route').value, 'busan');
    assert.equal(doc.querySelector('#route-notice').hidden, false);
    assert.match(doc.querySelector('#route-notice').textContent, /기본 경로/);
  });
});

describe('transport-neutral measurement', () => {
  test('events fire with allowlisted fields and unique-state dedupe', () => {
    const { doc, events } = makeDom();
    assert.equal(events.filter(x => x.name === 'acquisition_view').length, 1);
    doc.querySelector('#people').value = '3';
    doc.querySelector('#people').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    doc.querySelector('#people').dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
    assert.equal(events.filter(x => x.name === 'comparison_start').length, 1);
    doc.querySelector('#calc').click();
    doc.querySelector('#calc').click();
    assert.equal(events.filter(x => x.name === 'comparison_complete').length, 1);
    const allowed = { acquisition_view: ['schema_version','page_version','landing_type','route','source_bucket'], comparison_start: ['schema_version','page_version','route','entry_surface','assumptions_opened'], comparison_complete: ['schema_version','page_version','route','direction','party_bucket','assumptions_edited','lowest_mode','crossover_bucket','stale_bucket'] };
    for (const event of events.filter(x => allowed[x.name])) assert.deepEqual(Object.keys(event.payload).sort(), allowed[event.name].sort());
  });

  test('no adapter is a safe local CustomEvent no-op path', () => {
    const dom = new JSDOM(home, { runScripts: 'dangerously', url: base, pretendToBeVisual: true });
    assert.ok(dom.window.MB002);
    assert.doesNotThrow(() => dom.window.MB002.emitEvent('unknown_event', { raw: 'blocked' }));
  });
});

describe('responsive and accessibility release contract', () => {
  test('mobile CSS stacks content and prevents intrinsic overflow', () => {
    assert.match(home, /\*\{box-sizing:border-box\}/);
    assert.match(home, /overflow-wrap:anywhere/);
    assert.match(home, /@media\(max-width:700px\)\{\.decision-grid,\.assumption-grid,\.totals\{grid-template-columns:1fr\}/);
    assert.match(home, /button,summary\{min-height:44px\}/);
    assert.match(home, /@media\(prefers-reduced-motion:reduce\)/);
  });
  test('semantic, focus, live-region and error primitives exist in DOM order', () => {
    const { doc } = makeDom();
    assert.ok(doc.querySelector('form fieldset legend'));
    assert.equal(doc.querySelectorAll('label[for]').length, 12);
    assert.ok(doc.querySelector('details > summary'));
    assert.equal(doc.querySelector('#result-title').getAttribute('tabindex'), '-1');
    assert.equal(doc.querySelector('#result-live').getAttribute('aria-live'), 'polite');
    assert.equal(doc.querySelector('#errors').getAttribute('role'), 'alert');
    const result = doc.querySelector('#result');
    assert.ok(result.querySelector('#decision').compareDocumentPosition(result.querySelector('#totals')) & 4);
    assert.ok(result.querySelector('#totals').compareDocumentPosition(result.querySelector('#trust')) & 4);
    assert.ok(result.querySelector('#trust').compareDocumentPosition(result.querySelector('#result-action')) & 4);
  });
});
