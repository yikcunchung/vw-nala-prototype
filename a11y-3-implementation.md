# A11y 3 of 3 — What to build

**App:** VW NaLa (`nala`). **Target:** production vw.com — AEM + React SPA Editor +
styled-components.
**Companions:** `a11y-1-criteria.md` (every criterion, pass/fail) ·
`a11y-2-automated-testing.md` (what the tools can and cannot prove).

**Scope:** the whole page. This app is standalone — there is no component-versus-page split.

**BLUF:** Build nala so that keyboard and screen-reader users can reach the *result*, not just the
controls. That is where this app actually failed. **Roughly half the required behaviour lives in
JavaScript**, so treat the vanilla reference as a *behavioural specification* and never as DOM to
copy — a port that lifts the markup and rewrites the logic will silently drop it.

**How to read this.** §1–§6 are **prescriptive**: the contract the port must meet, not a description
of the current build. §7 is **descriptive** — what the reference build measurably does today, for
diffing against. Where the two disagree, §1–§6 win.

---

## Start here — the two defects that shipped, and that no tool caught

`README.md` carries the six rules a porting developer needs, code-first. This file is the detail
behind them, and the spec an auditor checks against. Both defects were found by driving the build,
not by scanning it: **axe at 96 rules, WAVE and Nu passed both.**

| Rule | What went wrong | Cost if missed |
|---|---|---|
| **A6** | The visible result carried `aria-hidden="true"` — because it animates and must not be counted aloud — leaving a **1×1 clipped `aria-live` region as the only readable copy**. A live region's job is to interrupt on change, not to be browsed. | **The app's entire output was unreachable.** A screen-reader user could operate every control and never learn the answer. Found by ear; invisible to every tool in the required toolchain. |
| **B8** | The "Learn more" CTA was a `<button>` with no handler: focusable, announced as a button, and doing nothing on activation. | An interaction dead end. Worse than the control not existing, because it advertises an affordance it does not have. |

Two process traps:

- **An implicit group around the readout** made `VO+Right` announce only the two focusable children
  and skip the label and the number; it needed `VO+Shift+Down`. Do not group a readout — see B7.
- **VoiceOver + Chrome skipped static text that Safari announced** — text present and unignored in
  *Chrome's own* accessibility tree. Test VoiceOver in **Safari**; Chrome is a second opinion only,
  and disagreements get recorded rather than treated as ground truth.

**This app shipped 0 unnamed graphics** — range-simulator exposed **16**, cost-simulator 9,
charging-time 7, all clean to axe, WAVE and Nu. A1 keeps that fixed; §6 proves it.

---
# 1. Semantics and naming

### A1 — Every inline `<svg>` is either named or hidden

`SC 1.1.1` · **Level A**

Chrome maps a bare `<svg>` to `role=image`, `name=""`, `ignored=false`: an unnamed graphic exposed
to assistive technology. It is not "decorative by default".

```jsx
// ✗ exposed, unnamed — this is the defect that shipped
<svg width="24" height="24" viewBox="0 0 24 24"><path d="…"/></svg>

// ✓ decorative: remove it from the tree
<svg aria-hidden="true" focusable="false" width="24" height="24">…</svg>

// ✓ meaningful: give it a role AND a name
<svg role="img" aria-label="Volkswagen" width="32" height="32">…</svg>
```

> **No scanner catches this.** `svg-img-alt` and `role-img-alt` are **inapplicable** to an `<svg>`
> with no `role`; `image-alt` only inspects `<img>`. axe, WAVE and Nu ran clean on pages carrying up
> to 16. **Assert the tree:** `0` `role=image` nodes unnamed and not `ignored`.

Decide it at the icon component, never per call site:

```jsx
export const Icon = ({ label, ...p }) =>
  label ? <svg role="img" aria-label={label} {...p}/> 
        : <svg aria-hidden="true" focusable="false" {...p}/>;
```

---

### A2 — An icon-only control needs a real name, not a hidden one

`SC 4.1.2, 2.4.4` · **Level A**

The control carries `aria-label`; the icon inside is `aria-hidden`. The name must sit on the thing
that is focusable.

---

### A3 — A `<select>` carries a concise, STABLE `aria-label`

`SC 1.3.1, 4.1.2` · **Level A**

```html
<select id="select-veh" aria-label="my car model variant">…</select>
```

**Do not stitch the name out of the surrounding sentence with `aria-labelledby`.** This app shipped
that scheme and it failed: JS rewrites one referenced span on every change, so the accessible name
moved with the value (§7). This is the exception, not new general advice — in a talking-sentence UI
the prose is not a label and the on-control text is the value. Where a control does have a real
visible label, prefer `aria-labelledby` pointing at it.

The cost is a recorded **SC 2.5.3** decision: the names deliberately do not echo the visible prose,
so an auditor reading that prose as the label would fail all four (`a11y-1`).

**Trap:** `<option>` text is **not** the label. Comparing concatenated option text against the
accessible name manufactures failures that do not exist.

---

### A4 — The visible label sits inside the accessible name

`SC 2.5.3` · **Level A**

The name must **contain the visible text, contiguously**, or a speech-input user cannot activate the
control by saying what they see.

```jsx
// ✗ visible "Motor / Battery Capacity", name "Motor and battery capacity"
//   one character — "/" written as the word "and" — is a Level A failure
// ✗ visible "Learn more", name "Read more about range"   (visible text absent)
// ✓ append, never splice:  visible "Learn more",
//   name "Learn more about range on volkswagen.co.uk (opens in a new tab)"

```

**axe has no rule for this at all.** Check it by hand, against the accessibility tree.

---

### A5 — One `h1`, no skipped levels, real landmarks

`SC 1.3.1, 2.4.1, 2.4.6` · **Level A / AA**

One `h1`; heading levels descend without gaps; `role="banner"` on the topbar and a `<main>`; and a
skip link as the **first** tab stop, pointing at an id that exists.

---

### A6 — A visually hidden polite live region, updated on every path

`SC 4.1.3` · **Level AA**

```html
<p id="nala-live" class="sr-only" aria-live="polite" aria-atomic="true"></p>
```

It must already be in the DOM at load — injecting and writing in the same tick is not announced.
Write from **every** path that changes the result. Empty at rest, populated transiently:

```js
var liveTimer = null, firstPaint = true;
function announce(km) {
  if (firstPaint) { return; }          // load is not a change
  clearTimeout(liveTimer);
  liveEl.textContent = 'Estimated range ' + km + ' kilometres.';
  liveTimer = setTimeout(function () { liveEl.textContent = ''; }, 3000);
}
```

Three things, each load-bearing:

- **`firstPaint`** — a region populated at first paint reads as page content, not as an update.
- **Cleared after use** — a permanently populated region is announced again when the user browses
  the panel, so the value is heard twice.
- **3000ms, not less** — a region refilled faster is dropped outright by some readers, losing the
  announcement altogether.

**Never the only readable copy of the result.** It was, here.

> **Keep the `.sr-only` clip.** `position:absolute; width:1px; height:1px; clip:rect(0,0,0,0);
> clip-path:inset(50%); white-space:nowrap`. Set an explicit `color` — a clipped region inheriting a
> matching colour reads as a 1:1 contrast error to WAVE even though nothing renders.

---

### A7 — `lang` on the document, and on any passage that differs

`SC 3.1.1, 3.1.2` · **Level A / AA**

`<html lang="en">`. If a CMS field can hold a string in another language, the component rendering it
must be able to emit `lang` alongside it.

---
# 2. Keyboard and focus

### B1 — Everything the mouse can do, the keyboard can do

`SC 2.1.1` · **Level A**

Every control that is not a native `<button>`, `<a>`, `<select>` or `<input>` needs an explicit key
handler. Assert the **state change**, not just that the handler fired.

---

### B2 — A custom widget exposes role, name **and** value, on every path

`SC 4.1.2` · **Level A**

The value must be written from every path that can change it — keyboard, drag, click-on-track:

```html
<div role="slider" tabindex="0"
     aria-label="Current charge level"
     aria-valuemin="0" aria-valuemax="100"
     aria-valuenow="20" aria-valuetext="20 percent">
```

**Derive the ARIA from state, never imperatively in one branch only.** In React
`aria-valuenow={value}`, so desync is impossible.

> **A CDP caveat, not a defect:** `Accessibility.getPartialAXTree` reports `valuetext: ""` for
> *every* ARIA widget, even when `aria-valuetext` is set. Whether it reaches the platform API is not
> measurable over CDP — it needs a real screen reader. Do not read that empty string as a failure.

---

### B3 — Focus order matches visual order

`SC 2.4.3` · **Level A**

Drive real `Tab` and assert `document.activeElement` at each stop. A control that moves visually at
a breakpoint must move in the DOM too, not be repositioned with CSS `order`.

---

### B4 — A visible focus indicator on every control, styled consistently

`SC 2.4.7` · **Level AA**

`outline: 2px solid #C86C03`, **no `outline-offset`**, on **every** focusable thing including skip
links and inline links; a browser-default ring passes but looks inconsistent. Exception: the skip
link uses `outline-offset: -4px` so the ring sits inside its own chip.

`#C86C03` clears the 3:1 SC 1.4.11 threshold on all three surfaces this app puts a control on:
**3.44:1** on the cream page, **4.22:1** on the navy result panel, **3.75:1** on the modal white. A
single navy ring would have been invisible on the navy panel.

**Never remove an outline without replacing it.** Where the real control is a hidden `<input>`
behind a styled surrogate, ring the surrogate:

```css
.vw-switch input:focus-visible ~ .vw-switch-track { outline: 2px solid #C86C03; }
```

---

### B5 — A focused control is never left under sticky chrome

`SC 2.4.11` · **Level AA**

Use `scroll-padding-top` / `scroll-padding-bottom` equal to the fixed bars' height, or a `focusin`
handler that scrolls the control clear. Measure the focused rect **after the scroll settles** — a
synchronous read after `.focus()` catches a smooth scroll mid-flight and reports a false failure.

---

### B6 — No keyboard trap

`SC 2.1.2` · **Level A**

Tab must cycle through every stop and out the other side; disclosures and panels must be escapable.

**A modal dialog is the permitted exception**, if Escape always closes it and focus returns to the
opener. Enforce containment two ways — a `keydown` handler cycling Tab inside the dialog **and**
`inert` on the background — because the handler only fires while focus is already inside, so a trip
out to browser chrome and back lands on a background control. `inert` also removes the background
from the **accessibility tree**, not just the focus order. Clear `inert` *before* restoring focus, or
the `.focus()` call is silently ignored.

---

### B7 — A scrollable region is keyboard reachable

`SC 2.1.1` · **Level A** (ACT rule `0ssw9k`)

A region that scrolls must be focusable so a keyboard user can scroll it: `tabindex="0"`.

**Add `role="group"` and a name only for a landmark-like container**, never a scrollable paragraph:
`#nala-range-modal-body` carries `tabindex="0"` and nothing else, deliberately. A `role="group"`
there announces an extra grouping to descend into — the grouping that made a VoiceOver tester
conclude the result panel was unreadable (`a11y-2` §9.1 row 5). Consistent with B8 item 4.

> **Two rules disagree by construction.** axe's experimental `focus-order-semantics` flags
> `tabindex="0"` on a `role="group"`. It is `best-practice` + `experimental`, carries **no `wcag2*`
> tag**, and maps to no WCAG criterion. **Keep the `tabindex`** — 2.1.1 wins.

---

### B8 — A modal dialog announces its own content, not just its name

`SC 4.1.2` · **Level A** · `SC 2.4.3` · **Level A**

The range info modal is the reference implementation. Five things hold together:

```html
<div id="overlay" hidden>
  <div id="backdrop" aria-hidden="true"></div>
  <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" tabindex="-1">
    <h2 id="dlg-title">Estimated range</h2>
    <p id="dlg-body" tabindex="0">…the explanation…</p>
  </div>
</div>
```

1. **`hidden` on the wrapper when closed**, so the dialog is absent from the tree, not merely
   invisible.
2. **`aria-labelledby` → a real heading inside the dialog**, not a hand-written duplicate.
3. **The backdrop is a sibling, `aria-hidden="true"`** — never an ancestor of the dialog, never the
   overlay itself.
4. **Initial focus goes to the body copy, not the close button**: a reader announces the dialog's
   *name* on open but not its *content*, so the close button leaves the explanation unread.
   `tabindex="0"` on the paragraph also makes it keyboard-scrollable (B7). **Do not add
   `aria-describedby` to that same paragraph** — it would be announced twice.
5. **The trigger declares `aria-haspopup="dialog"` and no `aria-expanded`** — `aria-expanded`
   belongs to the disclosure pattern, and advertising an unmaintained state is worse than none.

Escape, the close button and a backdrop click must all close it and restore focus to the trigger.
B6 covers the `inert` half of the trap.

---
# 3. Pointer and targets

### C1 — Every target is at least 24×24 CSS px

`SC 2.5.8` · **Level AA**

> **axe will not catch this for you.** `target-size` is `enabled: false` by default in axe-core
> 4.13.0, so a stock run reports "0 violations" without testing target size at all. Turn it on:
> `axe.run(el, { rules: { 'target-size': { enabled: true } } })`.

A visually small control still complies if a transparent `::before` enlarges the **hit area** —
legitimate, since WCAG defines a target as "the region of the display that will accept a pointer
action":

```css
.thumb { width: 18px; height: 18px; }
.thumb::before {                    /* the real 24x24 target */
  content: ""; position: absolute; inset: 50% auto auto 50%;
  width: 24px; height: 24px; transform: translate(-50%, -50%);
  pointer-events: auto;             /* and the parent must not clip it */
}
```

**Prove it:** ray-cast `document.elementFromPoint` outward from the centre in 0.5px steps, and
confirm a real drag *starts* from the enlarged area, not just a hit-test.

**If a target genuinely is undersized**, the spacing exception is the fallback and the test depends
on the neighbour:

- against a **full-size** neighbour: a 24px-diameter circle centred on the undersized target must
  not intersect the neighbour's **box** — i.e. **≥12px from centre to box edge**
- against **another undersized** target: **≥24px centre-to-centre**

Centre-to-centre against a full-size neighbour is the wrong test and reads falsely comfortable.

---

### C2 — Activation happens on the up-event

`SC 2.5.2` · **Level A**

Native `<button>` gets this free. A custom control must fire on `pointerup`/`click`, never
`pointerdown`, so a user can drag off to abort.

---

### C3 — Dragging always has a non-drag alternative

`SC 2.5.7` · **Level AA**

A draggable slider thumb must also respond to arrow keys, and ideally to a click on the track.
Arrow keys alone satisfy the criterion.

---
# 4. Visual

### D1 — Text contrast ≥4.5:1, measured on composited pixels

`SC 1.4.3` · **Level AA**

Over a gradient, an image or an overlapping element, axe returns **`incomplete`**, not a pass.
Resolve those by hand, on real pixels:

- `Page.captureScreenshot` `clip` is **document-absolute**; `getBoundingClientRect()` is
  **viewport-relative**. Screenshot the viewport and crop viewport-relative. Exactly `1.00:1` with
  one unique colour means the crop missed.
- Crop to the **glyph band** — the union of `Range.getClientRects()` over the text nodes — excluding
  the element's own border. A 1px border can occupy enough of a padding-box crop to be picked as
  "the background", producing a false failure.
- Take the **dominant** background, not the worst minority colour. At 12px the glyph core is under
  1% of the crop, so the most *frequent* off-background pixel is an anti-aliasing mid-tone.

---

### D2 — Non-text contrast ≥3:1

`SC 1.4.11` · **Level AA**

Control boundaries, focus rings and selected-state indicators.

---

### D3 — No content loss at 320×256 CSS px

`SC 1.4.10, 1.4.4` · **Level AA**

**400% zoom is `setDeviceMetricsOverride{ width:320, height:256, deviceScaleFactor:4 }`.**
`dsf 1` is a small screen — a different test.

Content may scroll in **one** direction only. A horizontal carousel inside a bounded,
keyboard-operable region is the permitted two-dimensional exception; page-level horizontal scroll is
not. Sufficient techniques: **C31** (flexbox), **C32** (media queries + grid), **C34** (un-fix
sticky).

---

### D4 — The text-spacing overrides must not clip anything

`SC 1.4.12` · **Level AA**

```css
* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; }
p { margin-bottom:2em !important; }
```

Nothing may newly clip, no control may be lost, no horizontal scroll may appear.

> **Build target sizes out of `padding`, not `line-height`.** This criterion invites the user to
> override `line-height`, so a 24px target built on line-height collapses under the very override
> you are being tested against. Padding is unaffected.

---

### D5 — Never lock orientation

`SC 1.3.4` · **Level AA**

No `@media (orientation:)` rule that hides or restricts content.

---
# 5. React, styled-components and AEM — the ones that bite

1. **`styled-components` drops unknown props.** `aria-*` and `role` pass through on DOM elements but
   **not** through a custom component unless forwarded. Spread `{...rest}` onto the DOM node.
2. **AEM `EditableComponent` injects a wrapper `<div>`**, breaking any parent-child ARIA
   relationship (a `radiogroup` owning its radios, `aria-labelledby` across a boundary) once each
   child is separately authorable. Keep such a group as **one** component, or wire `aria-owns`.
3. **Conditional rendering destroys focus.** Unmounting a panel while focus is inside drops it to
   `<body>`. Return focus to the opener explicitly.
4. **`useId()` for every label association** — hand-written ids collide once a component is placed
   twice on a page, and `duplicate-id-aria` is a real failure.
5. **A CSS-in-JS `:focus-visible` must survive minification.** Verify the ring in the built bundle.
6. **Icons: name or hide at the component boundary** (A1). A per-call-site decision will be missed.
7. **Live regions must mount before they are written to.** Render unconditionally; write on update.

---

# 6. Definition of Done

- [ ] **axe with `target-size` explicitly enabled** — off by default, so without that line CI passes
      SC 2.5.8 without testing it
- [ ] **Accessibility tree asserted** — `0` unnamed `role=image` nodes, `0` unnamed interactive
      nodes, every duplicate role+name pair reviewed
- [ ] **Real keyboard run** — Tab / Shift+Tab / Enter / Space / Arrows / Escape, asserting
      `document.activeElement` and the resulting state at each step
- [ ] **All states, not just the default** — open every dialog, select every option, re-run after each
- [ ] **Reflow at 320×256 @ dsf 4** — nothing lost, no page-level horizontal scroll
- [ ] **Contrast on composited pixels** wherever text sits over a gradient or imagery
- [ ] **SC 2.5.3 by hand** — visible label contained in the accessible name. No tool does this
- [ ] **Names are correct**, not merely present and unique — read each against what it describes
- [ ] **Screen reader** — one pass with NVDA or VoiceOver. Not optional
- [ ] **The suite fails when it should** — inject the defect and confirm the detector fires

---

# 7. App-specific notes

**The sentence UI is the hard part.** The `<select>`s sit inside a running sentence — "What is the
range **of my [ID.7]** when I mostly drive **[motorway]** in **[cold]** weather and I am driving
**[alone]**" — so prose surrounds every control and could be mistaken for its label. **Append, never
splice.**

```html
<!-- ✓ concise, STABLE aria-label — not stitched from the visible sentence:
     JS rewrites the ID.7 token, so a stitched name moves with the value. -->
<span id="select-w1">of my</span>                          <!-- prose, not a label -->
<span id="select-veh-family" class="fl-label">ID.7</span>  <!-- the VALUE's family -->
<select id="select-veh" aria-label="my car model variant">…</select>

<!-- ✗ aria-labelledby="select-w1 select-veh-family select-veh-hint" (ids since
     deleted) yields "of my ID.7 variant" — the NAME MOVES WITH THE VALUE. -->
```

The four names are *my car model variant*, *driving location*, *weather condition* and *travelling*:
purpose, not prose. A **recorded 2.5.3 decision** (`a11y-1-criteria.md`), not a free win.

**Responsive names are a trap, though this one is gone.** A former `syncEnvLabel()` rewrote the
environment select's `aria-label` when the visible copy changed at the 400px breakpoint: a name
derived from responsive visible text must itself be responsive, or 2.5.3 breaks at one width only.
Reintroduce visible-text-derived names and 2.5.3 needs verifying at every breakpoint.

**`button#nala-info-btn` measures 23.797 × 24**, not 24×24 — the CSS declares `23.803px` and Blink's
LayoutUnit snapping renders it as 23.797, so **both numbers are correct and neither is a typo.**
`offsetWidth` rounds up to 24 and
`getBoundingClientRect()` does not. It passes SC 2.5.8 comfortably because `::before` makes the real
target ~36.0 × 36.0 (C1) and the nearest other target is 86.8px away. A manual DevTools check of the
border box reads 23.8 and flags it, so the `::before` is load-bearing for the explanation though not
for the pass. Do not remove it.

**Superseded, recorded so it is not re-derived.** `select#select-occ` was once named "weather and I
am driving", inherited from the visible span, so it opened with a word belonging to the *previous*
control — correct per 2.5.3, confusing to hear.

---

# 8. What is still open

Four items a port inherits. None is a blocker; all are to be decided deliberately rather than
discovered.

| Item | State | What to do |
|---|---|---|
| **Select border contrast** | **SC 1.4.11 fails.** `rgb(161,164,172)` on the cream page is **2.29:1**; needs 3:1. | **Upstream** — a core component value, not a prototype choice, so never darken it locally. `#8b8e96` is the nearest passing shade at 3.01:1. |
| **One car render, three variants** | `assets/` ships one image; `alt` describes only what is shown, so it stays accurate but cannot describe the selected variant. | Add one render per variant, assigning `src` and `alt` **together**. Never `alt` alone — the alternative would describe an image nobody is looking at (SC 1.1.1). |
| **Dialog heading not announced** | Focus lands on the body copy, so a reader speaks the paragraph but not the `h2`. | **Leave it.** Focusing the container announces the heading and skips the paragraph — the defect the sibling Visualizer shipped. `aria-describedby` was rejected: the paragraph is 945 characters and long descriptions get truncated by some readers. If revisited, A/B by ear. |
| **SC 2.5.3 on all four select names** | Passes on the reading that the prose is *context* and the on-control text is the *value*, so no select has a visible **label**. | A recorded decision, not a pass by default. An auditor reading the prose as the label would fail all four; the only clean close is a **design** change, a visible label per control. |

**Not open, and not to be reopened:** the concise `aria-label` naming scheme (A3), the empty-at-rest
live region (A6), `inert` on the background while the dialog is open (B6), and the `::before`
hit-area expansion on the info button (C1). Each replaced something that measurably failed; the
reasoning sits next to each rule so it is not undone by someone tidying up.
