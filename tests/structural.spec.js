// @ts-check
// The scanner half. Runs axe INSIDE Playwright rather than jest-axe: jsdom has no
// layout, so target-size and reflow cannot be evaluated there at all.
//
// Both states are covered. With the dialog open, `inert` removes the background
// from the accessibility tree, so the modal-open numbers are legitimately much
// smaller — that is the fix working, not a regression.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// The nine rules axe ships with `enabled: false`. target-size is SC 2.5.8 — a
// stock run reports "0 violations" having never tested it.
const DISABLED_BY_DEFAULT = [
  'target-size', 'aria-roledescription', 'color-contrast-enhanced',
  'duplicate-id', 'duplicate-id-active', 'identical-links-same-purpose',
  'landmark-complementary-is-top-level', 'meta-refresh-no-exceptions', 'audio-caption',
];

async function axeRun(page) {
  return new AxeBuilder({ page }).options({
    rules: Object.fromEntries(DISABLED_BY_DEFAULT.map(r => [r, { enabled: true }])),
  }).analyze();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
});

test('axe reports 0 violations, default state', async ({ page }) => {
  const r = await axeRun(page);
  expect(r.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
});

test('axe reports 0 violations with the dialog open', async ({ page }) => {
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  const r = await axeRun(page);
  expect(r.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
});

test('target-size actually ran — a silent skip is the trap', async ({ page }) => {
  const r = await axeRun(page);
  const ran = [...r.passes, ...r.violations, ...r.incomplete].some(x => x.id === 'target-size');
  expect(ran, 'target-size must appear in the results, or SC 2.5.8 was never tested').toBe(true);
});

test('no unnamed interactive or graphic node, either state', async ({ page }) => {
  const unnamed = async () => page.evaluate(() => {
    const sel = 'button, a[href], select, [role=button], [role=link], [role=dialog], svg[role], img';
    return [...document.querySelectorAll(sel)]
      .filter(el => {
        if (el.closest('[hidden]') || el.closest('[aria-hidden=true]')) return false;
        if (el.getAttribute('aria-hidden') === 'true') return false;
        const n = (el.getAttribute('aria-label') || el.getAttribute('alt') ||
                   el.textContent || '').trim();
        return n === '';
      })
      .map(el => el.tagName + (el.id ? '#' + el.id : ''));
  });
  expect(await unnamed()).toEqual([]);
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  expect(await unnamed()).toEqual([]);
});

test('no JS exceptions on load or through a full interaction pass', async ({ page }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.reload({ waitUntil: 'domcontentloaded' });
  for (const [id, v] of [['select-veh','gtx'],['select-env','motorway'],['select-wea','cold'],['select-occ','family']]) {
    await page.selectOption('#' + id, v);
  }
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  expect(errs).toEqual([]);
});

test('no horizontal scroll at this viewport, either state', async ({ page }) => {
  const h = () => page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(await h()).toBe(false);
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  expect(await h()).toBe(false);
});
