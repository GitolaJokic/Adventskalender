// Run with Node.js: node tests/calendar.cjs
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.listeners = {}; this.classList = { add() {}, remove() {} }; this.textContent = ''; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(name, value) { this[name] = value; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  querySelectorAll() { return []; }
  querySelector(selector) { for (const child of this.children) { if (selector.startsWith('.') ? child.className === selector.slice(1) : child.tagName === selector) return child; const nested = child.querySelector(selector); if (nested) return nested; } return null; }
  removeAttribute(name) { delete this[name]; }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
}
async function calendar(date, search = '', days = [], reduced = true, initialStore = {}) {
  const nodes = new Map(), store = new Map(Object.entries(initialStore)), timers = [];
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element(id)); return nodes.get(id); };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [date])); } static now() { return new Date(date).getTime(); } }
  vm.runInNewContext(source, {
    document: { getElementById: get, createElement: tag => new Element(tag), addEventListener() {} },
    location: { search, protocol: 'https:', href: 'https://example.org/advent/' },
    Date: Clock, URL, URLSearchParams, navigator: {}, window: { addEventListener() {}, matchMedia: () => ({ matches: reduced }) }, setInterval() {}, setTimeout: fn => timers.push(fn),
    localStorage: { getItem: k => store.get(k), setItem: (k, v) => store.set(k, v) },
    fetch: async () => ({ ok: true, json: async () => ({ year: 2026, days }) })
  });
  await new Promise(resolve => setImmediate(resolve));
  return { get, store, timers, doors: get('doors').children };
}
(async () => {
  let c = await calendar(new Date(2026, 10, 15));
  assert.equal(c.doors.length, 24); assert.ok(c.doors.every(d => d.className.includes('locked')));
  c.doors[0].listeners.click(); assert.ok(c.get('door-dialog').open); assert.equal(c.store.size, 0);
  c = await calendar(new Date(2026, 11, 5, 0, 0, 0));
  assert.equal(c.doors.filter(d => !d.className.includes('locked')).length, 5);
  c.doors[4].listeners.click(); assert.equal(c.store.get('dezemberpost:2026:opened'), '[5]');
  c.doors[4].listeners.click(); assert.equal(c.store.get('dezemberpost:2026:opened'), '[5]');
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1');
  assert.ok(c.doors.every(d => !d.className.includes('locked')));
  c.doors[23].listeners.click(); assert.ok([...c.store.keys()].every(k => k.includes(':preview:')));
  c = await calendar(new Date(2027, 0, 1)); assert.ok(c.doors.every(d => !d.className.includes('locked')));
  c = await calendar(new Date(2026, 11, 1), '', [{ day: 1, title: '<script>literal text</script>', text: 'Nachricht', image: 'javascript:alert(1)', voucher: { title: 'Testgutschein' } }]);
  c.doors[0].listeners.click();
  assert.equal(c.get('door-content').querySelector('h2').textContent, '<script>literal text</script>');
  assert.ok(!c.get('door-content').children.some(el => el.tagName === 'img' && el.className !== 'dialog-animal'));
  const voucher = c.get('door-content').children.find(el => el.className === 'voucher');
  const redeem = voucher.children.at(-1); redeem.listeners.click(); assert.ok(redeem.disabled); assert.equal(redeem.textContent, 'Schon eingelöst ♡');
  c = await calendar(new Date(2026, 10, 15), '', [], false);
  c.doors[0].listeners.click();
  assert.equal(c.get('door-dialog').open, undefined);
  assert.ok(c.doors[0].querySelector('.door-animal').src.endsWith('teddy-strict.svg'));
  c.doors[1].listeners.click(); assert.equal(c.timers.length, 1);
  c.timers[0](); assert.equal(c.get('door-content').querySelector('h2').textContent, 'Na, nicht schummeln!');
  assert.equal(c.store.size, 0);
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1', [], false);
  c.doors[1].listeners.click(); assert.equal(c.get('door-dialog').open, undefined);
  assert.ok(c.doors[1].querySelector('.door-animal').src.endsWith('cow.svg'));
  c.timers[0](); assert.equal(c.get('door-dialog').open, true);
  assert.equal(c.store.size, 0); assert.ok(c.get('doors').children[1].className.includes('opened'));
  c.timers[0](); assert.equal(c.store.size, 0); assert.ok(c.get('doors').children[1].className.includes('opened'));
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1', [], false);
  c.doors[2].listeners.click();
  c.doors[2].listeners.animationend({ animationName: 'paw-reach-left' });
  assert.equal(c.get('door-dialog').open, undefined);
  c.doors[2].listeners.animationend({ animationName: 'animal-turn-door' });
  assert.equal(c.get('door-dialog').open, true);
  c.timers[0](); assert.equal(c.store.size, 0); assert.ok(c.get('doors').children[2].className.includes('opened'));
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1', [], false);
  c.doors[1].listeners.click();
  c.doors[1].listeners.animationend({ animationName: 'animal-turn-door' });
  assert.equal(c.get('door-dialog').open, undefined);
  c.doors[1].listeners.animationend({ animationName: 'animal-hop-and-turn' });
  assert.equal(c.get('door-dialog').open, true);
  c = await calendar(new Date(2026, 11, 5), '', [], false);
  assert.ok(c.doors.slice(0, 4).every(d => d.className.includes('opened')));
  assert.ok(!c.doors[4].className.includes('opened'));
  assert.ok(c.doors[5].className.includes('locked'));
  assert.ok(c.doors[0].querySelector('.door-animal').src.endsWith('teddy.svg'));
  assert.ok(c.doors[1].querySelector('.door-animal').src.endsWith('cow.svg'));
  assert.ok(c.doors[2].querySelector('.door-animal').src.endsWith('snowflake.svg'));
  c.doors[0].listeners.click();
  assert.equal(c.get('door-dialog').open, true);
  assert.equal(c.timers.length, 0); // Past days reopen immediately.
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1&datum=2026-12-12');
  assert.ok(c.doors.slice(0, 11).every(d => d.className.includes('opened')));
  assert.ok(!c.doors[11].className.includes('opened'));
  c = await calendar(new Date(2026, 10, 15), '?datum=2026-12-12');
  assert.ok(c.doors.every(d => d.className.includes('locked'))); // Real calendar ignores the preview date.
  // Default test mode resets on reload, including during/after December.
  c = await calendar(new Date(2026, 11, 20), '?vorschau=1', [], false, {
    'dezemberpost:2026:preview:opened': '[1,2,3]',
    'dezemberpost:2026:preview:redeemed': '[1]'
  });
  assert.ok(c.doors.every(d => !d.className.includes('opened')));
  c.doors[0].listeners.click(); assert.equal(c.get('door-dialog').open, undefined);
  c.timers[0](); assert.ok(c.get('doors').children[0].className.includes('opened'));
  assert.equal(c.store.get('dezemberpost:2026:preview:opened'), '[1,2,3]'); // Old preview data is ignored and never changed.
  const reloaded = await calendar(new Date(2026, 11, 20), '?vorschau=1', [], false, Object.fromEntries(c.store));
  assert.ok(reloaded.doors.every(d => !d.className.includes('opened')));
  // Production retains today's state and still locks future dates.
  c = await calendar(new Date(2026, 11, 1), '', [], false, { 'dezemberpost:2026:opened': '[1]' });
  assert.ok(c.doors[0].className.includes('opened'));
  assert.ok(c.doors.slice(1).every(d => d.className.includes('locked')));
  c.doors[0].listeners.click(); assert.equal(c.timers.length, 0);
  c = await calendar(new Date(2026, 10, 15), '?vorschau=1', [{day:1, title:'Eine Nachricht von Teddy', text:'Hallo Wioletta!'}]);
  c.doors[0].listeners.click();
  assert.ok(c.get('door-content').querySelector('.dialog-animal').src.endsWith('teddy-alive.svg'));
  assert.equal(c.get('door-content').querySelector('.letter-text').textContent, 'Hallo Wioletta!');
  assert.equal(c.get('door-content').scrollTop, 0);
  console.log('Bestanden: Teddy auf Tag 1, neue Kuscheltiere, vergangene Türchen automatisch offen, direktes Wiederöffnen, Vorschau-Datum, Tieranimationen, strenge Tiere vor gesperrten Türchen, Mehrfachklickschutz, reduzierte Bewegung; 24 Türchen, Datumsfreigabe, Vorschau-Trennung, Fortschritt, Jahreswechsel, sichere Text-/Medienausgabe, Gutscheine.');
})().catch(error => { console.error(error); process.exitCode = 1; });
