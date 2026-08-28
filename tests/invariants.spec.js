// @ts-check
// Guards the fixes that NO scanner can see.
//
// Every assertion here corresponds to something axe (96 rules), WAVE and Nu all
// report clean on. Two of them were real shipped defects found only by driving a
// screen reader — see a11y-2-automated-testing.md §9.1 rows 6 and 13. Without this
// file, any of them can be reverted by someone tidying up and every tool will
// still pass.
//
// Invariant IDs refer to a11y-3-implementation.md.

const { test, expect } = require('@playwright/test');

const NAMES = {
  'select-veh': 'of my car model variant',
  'select-env': 'when I mostly drive',
  'select-wea': 'in weather condition',
  'select-occ': 'weather and I am driving',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
});

/* ─── A6 · the result must be reachable ───────────────────────────────────────
   THE defect that shipped. #nala-value carried aria-hidden="true" because it
   animates, leaving a 1x1 clipped live region as the only readable copy — so the
   app's entire output was unreachable to a screen reader. Passed by every tool. */
test('A6 the result value is NOT aria-hidden', async ({ page }) => {
  await expect(page.locator('#nala-value')).not.toHaveAttribute('aria-hidden', 'true');
});

test('A6 the live region is EMPTY at rest', async ({ page }) => {
  // Populated at rest = announced a second time when browsing, and read as page
  // content rather than as an update on load.
  await expect(page.locator('#nala-live')).toHaveText('');
});

test('A6 the live region speaks on change, then clears', async ({ page }) => {
  await page.selectOption('#select-veh', 'gtx');
  await expect(page.locator('#nala-live')).toContainText('kilometres', { timeout: 2000 });
  // Cleared afterwards — but not so fast that a reader drops it. 3s in the build.
  await expect(page.locator('#nala-live')).toHaveText('', { timeout: 6000 });
});

test('A6 the live region is atomic', async ({ page }) => {
  await expect(page.locator('#nala-live')).toHaveAttribute('aria-atomic', 'true');
});

test('A6 load does not announce', async ({ page }) => {
  // firstPaint guard: there is no change to report on load.
  await page.waitForTimeout(600);
  await expect(page.locator('#nala-live')).toHaveText('');
});

/* ─── A3 · names must be stable ───────────────────────────────────────────────
   The previous scheme stitched names from the sentence via aria-labelledby, and
   one referenced span is rewritten by JS — so the accessible name moved with the
   value. Names must not change when values do. */
test('A3 the four select names are exactly as specified', async ({ page }) => {
  for (const [id, name] of Object.entries(NAMES)) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-label', name);
  }
});

test('A3 names do not change when values change', async ({ page }) => {
  await page.selectOption('#select-veh', 'gtx');
  await page.selectOption('#select-env', 'motorway');
  await page.selectOption('#select-wea', 'cold');
  await page.selectOption('#select-occ', 'family');
  await page.waitForTimeout(700);
  for (const [id, name] of Object.entries(NAMES)) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-label', name);
  }
});

test('A3 no select is named by aria-labelledby', async ({ page }) => {
  // Regression guard: reintroducing the stitched scheme is the failure mode.
  const n = await page.locator('select[aria-labelledby]').count();
  expect(n).toBe(0);
});

/* ─── B8 · dialog announces its own content ───────────────────────────────────
   Focus must land on the body copy. A reader announces a dialog's NAME on open
   but not its CONTENT, so focusing the close button leaves the explanation
   unread — the exact defect the sibling Visualizer shipped. */
test('B8 opening the dialog focuses its body copy, not the close button', async ({ page }) => {
  await page.click('#nala-info-btn');
  await page.waitForTimeout(500);
  await expect(page.locator('#nala-range-modal-body')).toBeFocused();
});

test('B8 the trigger declares haspopup and no aria-expanded', async ({ page }) => {
  const btn = page.locator('#nala-info-btn');
  await expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
  expect(await btn.getAttribute('aria-expanded')).toBeNull();
});

test('B8 Learn more is a real link, not a button', async ({ page }) => {
  // It was a <button> with no handler: focusable, announced as a button, inert.
  const cta = page.locator('#nala-cta');
  expect((await cta.evaluate(el => el.tagName)).toLowerCase()).toBe('a');
  await expect(cta).toHaveAttribute('target', '_blank');
  expect(await cta.getAttribute('rel')).toContain('noopener');
  // Name must carry destination + new-tab warning, with the visible text as prefix.
  const name = (await cta.textContent() || '').replace(/\s+/g, ' ').trim();
  expect(name.startsWith('Learn more')).toBe(true);
  expect(name).toContain('new tab');
});

/* ─── B6 · containment is real, not advisory ──────────────────────────────────
   aria-modal alone leaks to the virtual cursor. inert additionally removes the
   background from the accessibility tree. */
test('B6 inert is applied to the background while open, and cleared on close', async ({ page }) => {
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  await expect(page.locator('#topbar')).toHaveAttribute('inert', '');
  await expect(page.locator('#nala-main')).toHaveAttribute('inert', '');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  expect(await page.locator('#topbar').getAttribute('inert')).toBeNull();
  expect(await page.locator('#nala-main').getAttribute('inert')).toBeNull();
});

test('B6 Tab is trapped to the two controls inside the dialog', async ({ page }) => {
  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  const seen = new Set();
  for (let i = 0; i < 6; i++) {
    seen.add(await page.evaluate(() => document.activeElement?.id));
    await page.keyboard.press('Tab');
  }
  expect([...seen].sort()).toEqual(['nala-range-modal-body', 'nala-range-modal-close']);
});

test('B6 all three dismissals restore focus to the trigger', async ({ page }) => {
  const focused = () => page.evaluate(() => document.activeElement?.id);

  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  expect(await focused()).toBe('nala-info-btn');

  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  await page.click('#nala-range-modal-close');
  await page.waitForTimeout(600);
  expect(await focused()).toBe('nala-info-btn');

  await page.click('#nala-info-btn');
  await page.waitForTimeout(450);
  await page.click('#nala-range-backdrop', { position: { x: 5, y: 5 } });
  await page.waitForTimeout(600);
  expect(await focused()).toBe('nala-info-btn');
});

/* ─── D2 · the focus ring must clear every surface it appears over ────────────
   cream page, navy result panel, modal white. A navy ring is invisible on navy. */
test('D2 every tab stop renders the audited focus ring', async ({ page }) => {
  // Asserted on the COMPUTED value after real keyboard focus, on EVERY stop — not
  // on stylesheet text and not on one element. Three reasons, each a way this test
  // could have been fake:
  //   - browsers normalise #C86C03 to rgb(200, 108, 3), so a source-text check
  //     passes while the ring is broken;
  //   - :focus-visible does not match a programmatic .focus(), so a .focus()
  //     check measures nothing at all;
  //   - the ring is set by SEVERAL rules (selects, icon button, CTA, skip link).
  //     Checking one let a mutation to another through — this test was rewritten
  //     after mutation testing caught exactly that.
  await page.evaluate(() => document.body.focus());
  const seen = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return { id: el.id || el.tagName, color: s.outlineColor, style: s.outlineStyle,
               width: parseFloat(s.outlineWidth) };
    });
    if (!r) break;
    if (seen.some(x => x.id === r.id)) break;
    seen.push(r);
  }
  expect(seen.length, 'expected to reach several focusable controls').toBeGreaterThanOrEqual(6);
  for (const r of seen) {
    expect(r.color, `focus ring colour on ${r.id}`).toBe('rgb(200, 108, 3)');
    expect(r.style, `focus ring style on ${r.id}`).toBe('solid');
    expect(r.width, `focus ring width on ${r.id}`).toBeGreaterThanOrEqual(2);
  }
});
