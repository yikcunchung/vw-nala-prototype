# A11y 3 of 3 — What to build

**App:** VW NaLa (`nala`). **Target:** production vw.com — AEM + React SPA Editor +
styled-components.
**Companions:** `a11y-1-criteria.md` (every criterion, pass/fail) ·
`a11y-2-automated-testing.md` (what the tools can and cannot prove).

**Scope:** the whole page. This app is standalone — there is no component-versus-page split.

> **Do not copy the reference build.** It is vanilla HTML/JS and it is a *behavioural
> specification*, not source to port. A meaningful share of the required behaviour lives in
> JavaScript — a port that copies the DOM and rewrites the logic will silently drop it.

---

## Start here — the defect that shipped, and that no tool caught

This app is the **exception** in the suite: it shipped with **0 unnamed graphics**. Every inline
`<svg>` already carried `aria-hidden="true"` or a name, and the car render had a real descriptive
`alt`. The other three simulators did not — range-simulator exposed **16** unnamed graphics,
cost-simulator 9, charging-time 7, and **axe, WAVE and Nu all reported clean** on every one of them.

Treat that as the lesson rather than a clean bill: the pattern is one attribute, it is easy to miss
on a new icon, and no scanner in the required toolchain will tell you. **A1 is the rule that keeps
it fixed; the accessibility-tree assertion in the Definition of Done is the check that proves it.**

---
# 1. Semantics and naming

### A1 — Every inline `<svg>` is either named or hidden

`SC 1.1.1` · **Level A**

Chrome maps a bare `<svg>` to `role=image`, `name=""`, `ignored=false`. It is therefore **exposed to
assistive technology as an unnamed graphic** — it is not "decorative by default".

```jsx
// ✗ exposed, unnamed — this is the defect that shipped
<svg width="24" height="24" viewBox="0 0 24 24"><path d="…"/></svg>

// ✓ decorative: remove it from the tree
<svg aria-hidden="true" focusable="false" width="24" height="24">…</svg>

// ✓ meaningful: give it a role AND a name
<svg role="img" aria-label="Volkswagen" width="32" height="32">…</svg>
```

> **No scanner catches this.** `svg-img-alt` and `role-img-alt` are **inapplicable** to an `<svg>`
> with no `role`; `image-alt` only inspects `<img>`. axe, WAVE and Nu all returned clean on pages
> carrying up to 16 of these. **The accessibility tree is the only check that works** — assert
> `0` nodes with `role=image` that are unnamed and not `ignored`.

**In React:** put it in the icon component itself, so it cannot be forgotten per call site.

```jsx
export const Icon = ({ label, ...p }) =>
  label ? <svg role="img" aria-label={label} {...p}/> 
        : <svg aria-hidden="true" focusable="false" {...p}/>;
```

---

### A2 — An icon-only control needs a real name, not a hidden one

`SC 4.1.2, 2.4.4` · **Level A**

If a control's only content is an icon, the control carries `aria-label`; the icon inside it is
`aria-hidden`. Never name the icon and leave the button unnamed — the name must sit on the thing
that is focusable.

---

### A3 — A `<select>` is named by its visible label

`SC 1.3.1, 4.1.2` · **Level A**

Use `aria-labelledby` pointing at the visible label element. Do not retype the label into an
`aria-label` — that is how the visible text and the name drift apart (see A4).

**Trap:** a `<select>`'s `<option>` text is **not** its label. An audit that compares concatenated
option text against the accessible name will manufacture failures that do not exist.

---

### A4 — The visible label sits inside the accessible name

`SC 2.5.3` · **Level A**

If a control has a visible text label, the accessible name must **contain that text, contiguously**
— otherwise a speech-input user cannot activate it by saying what they see.

```jsx
// ✗ visible "Motor / Battery Capacity", name "Motor and battery capacity"
//   one character — "/" written as the word "and" — is a Level A failure
// ✗ visible "Learn more", name "Read more about range"   (visible text absent)
// ✓ append, never splice:  visible "Learn more",
//   name "Learn more about range on volkswagen.co.uk (opens in a new tab)"
```

**axe has no rule for this at all.** It must be checked by hand, against the accessibility tree.

---

### A5 — One `h1`, no skipped levels, real landmarks

`SC 1.3.1, 2.4.1, 2.4.6` · **Level A / AA**

One `h1`; heading levels descend without gaps; `role="banner"` on the topbar and a `<main>`; and a
skip link as the **first** tab stop, pointing at an id that exists.

---

### A6 — A visually hidden polite live region, updated on every path

`SC 4.1.3` · **Level AA**

```html
<p id="nala-live" class="sr-only" aria-live="polite"></p>
```

The region must already be in the DOM at load — injecting it and writing to it in the same tick is
not announced. Write to it from **every** path that changes the result, not just the common one.

> **Keep the `.sr-only` clip.** `position:absolute; width:1px; height:1px; clip:rect(0,0,0,0);
> clip-path:inset(50%); white-space:nowrap`. Set an explicit `color` on it — a clipped region that
> inherits a matching colour reads as a 1:1 contrast error to WAVE even though nothing renders.

---

### A7 — `lang` on the document, and on any passage that differs

`SC 3.1.1, 3.1.2` · **Level A / AA**

`<html lang="en">`. If a CMS field can hold a string in another language, the component rendering it
must be able to emit `lang` alongside it.

---
# 2. Keyboard and focus

### B1 — Everything the mouse can do, the keyboard can do

`SC 2.1.1` · **Level A**

Every custom control — anything that is not a native `<button>`, `<a>`, `<select>` or `<input>` —
needs an explicit key handler. Assert the **state change**, not just that the handler fired.

---

### B2 — A custom widget exposes role, name **and** value, on every path

`SC 4.1.2` · **Level A**

A slider built from a `<div>` needs the full contract, and the value must be written from every
path that can change it — keyboard, drag, and click-on-track:

```html
<div role="slider" tabindex="0"
     aria-label="Current charge level"
     aria-valuemin="0" aria-valuemax="100"
     aria-valuenow="20" aria-valuetext="20 percent">
```

**Derive the ARIA from state, never set it imperatively in one branch only.** In React:
`aria-valuenow={value}`, so desync is impossible.

> **A CDP caveat, not a defect:** `Accessibility.getPartialAXTree` reports `valuetext: ""` for
> *every* ARIA widget, even when `aria-valuetext` is set. Whether it reaches the platform API is not
> measurable over CDP — it needs a real screen reader. Do not read that empty string as a failure.

---

### B3 — Focus order matches visual order

`SC 2.4.3` · **Level A**

Drive real `Tab` and assert `document.activeElement` at each stop. Responsive layouts are where this
breaks: a control that moves visually at a breakpoint must move in the DOM too, not be repositioned
with CSS `order`.

---

### B4 — A visible focus indicator on every control, styled consistently

`SC 2.4.7` · **Level AA**

`outline: 2px solid #C86C03` with **no `outline-offset`**. Apply it to **every** focusable thing
including skip links and inline links — a control that falls back to the browser's default ring
still passes, but it is a visible inconsistency and the first thing an auditor notices.

The one exception is the skip link, which uses `outline-offset: -4px` so the ring sits inside its
own filled chip rather than bleeding onto the page behind it.

`#C86C03` is chosen because it clears the 3:1 SC 1.4.11 threshold against **all three** surfaces
this app puts a control on: **3.44:1** on the cream page, **4.22:1** on the navy result panel, and
**3.75:1** on the modal white. A single navy ring would have been invisible on the navy panel.

**Never remove an outline without replacing it.** If the real control is a visually hidden
`<input>` behind a styled surrogate, style the ring on the surrogate:

```css
.vw-switch input:focus-visible ~ .vw-switch-track { outline: 2px solid #C86C03; }
```

---

### B5 — A focused control is never left under sticky chrome

`SC 2.4.11` · **Level AA**

Use `scroll-padding-top` / `scroll-padding-bottom` on the scroll container equal to the height of
the fixed bars, or a `focusin` handler that scrolls the control clear. Verify by measuring the
focused control's rect against the viewport **after the scroll settles** — a synchronous read right
after `.focus()` catches a smooth scroll mid-flight and reports a false failure.

---

### B6 — No keyboard trap

`SC 2.1.2` · **Level A**

Tab must cycle through every stop and out the other side. Any disclosure or panel must be escapable.

**A modal dialog is the permitted exception** — it may contain focus, but only if Escape always
closes it and focus returns to the element that opened it. Containment must be enforced two ways,
not one: a `keydown` handler that cycles Tab inside the dialog, **and** `inert` on the background
regions. The handler alone is not enough, because it only fires while focus is already inside the
dialog — a trip out to the browser chrome and back would land on a background control and escape the
cycle. Remove `inert` *before* restoring focus on close, or the `.focus()` call is silently ignored.

---

### B7 — A scrollable region is keyboard reachable

`SC 2.1.1` · **Level A** (ACT rule `0ssw9k`)

A region that scrolls must be focusable so a keyboard user can scroll it: `tabindex="0"` plus
`role="group"` and an accessible name.

> **Two rules disagree here, by construction.** axe's experimental `focus-order-semantics` flags
> `tabindex="0"` on a `role="group"` as a defect. It is tagged `best-practice` + `experimental`,
> carries **no `wcag2*` tag**, and maps to no WCAG criterion. **Keep the `tabindex`** — 2.1.1 wins.

---

### B8 — A modal dialog announces its own content, not just its name

`SC 4.1.2` · **Level A** · `SC 2.4.3` · **Level A**

The range info modal is the reference implementation. Five things have to hold together:

```html
<div id="overlay" hidden>
  <div id="backdrop" aria-hidden="true"></div>
  <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" tabindex="-1">
    <h2 id="dlg-title">Estimated range</h2>
    <p id="dlg-body" tabindex="0">…the explanation…</p>
  </div>
</div>
```

1. **`hidden` on the wrapper when closed**, so the dialog is absent from the accessibility tree
   rather than merely invisible.
2. **`aria-labelledby` → a real heading inside the dialog.** Do not hand-write a duplicate string.
3. **The backdrop is a sibling, `aria-hidden="true"`** — never an ancestor of the dialog, and never
   the same element as the overlay.
4. **Initial focus goes to the body copy, not the close button.** A screen reader announces the
   dialog's *name* on open but not its *content*; landing on the close button leaves the entire
   explanation unread. Give the paragraph `tabindex="0"` and focus it. This also makes the copy
   keyboard-scrollable when it overflows, which B7 requires anyway. **Do not also add
   `aria-describedby` pointing at the same paragraph** — it would then be announced twice.
5. **The trigger declares `aria-haspopup="dialog"`** and carries **no `aria-expanded`**.
   `aria-expanded` belongs to the disclosure pattern; a button that opens a modal is not a
   disclosure, and advertising a state you do not maintain is worse than advertising none.

Escape, the close button, and a backdrop click must all close it and all restore focus to the
trigger. See B6 for why the focus trap needs `inert` as well as a Tab handler.

---
# 3. Pointer and targets

### C1 — Every target is at least 24×24 CSS px

`SC 2.5.8` · **Level AA**

> **axe will not catch this for you.** `target-size` is `enabled: false` by default in axe-core
> 4.13.0, so a stock run reports "0 violations" without testing target size at all. Turn it on:
> `axe.run(el, { rules: { 'target-size': { enabled: true } } })`.

A visually small control can still be a compliant target if a transparent `::before` enlarges the
**hit area** — and that is a legitimate technique, not a loophole. WCAG defines a target as "the
region of the display that will accept a pointer action":

```css
.thumb { width: 18px; height: 18px; }
.thumb::before {                    /* the real 24x24 target */
  content: ""; position: absolute; inset: 50% auto auto 50%;
  width: 24px; height: 24px; transform: translate(-50%, -50%);
  pointer-events: auto;             /* and the parent must not clip it */
}
```

**Prove it, do not assume it.** Ray-cast `document.elementFromPoint` outward from the centre in
0.5px steps and confirm the hit region really is ≥24×24 — and that a real drag *starts* from the
enlarged area, not just a hit-test.

**If a target genuinely is undersized**, the spacing exception is the fallback, and the test depends
on the neighbour:

- against a **full-size** neighbour: a 24px-diameter circle centred on the undersized target must
  not intersect the neighbour's **box** — i.e. **≥12px from centre to box edge**
- against **another undersized** target: **≥24px centre-to-centre**

Using centre-to-centre against a full-size neighbour is the wrong test and gives a falsely
comfortable number.

---

### C2 — Activation happens on the up-event

`SC 2.5.2` · **Level A**

Native `<button>` gets this free. A custom control must fire on `pointerup`/`click`, never
`pointerdown`, so a user can drag off to abort.

---

### C3 — Dragging always has a non-drag alternative

`SC 2.5.7` · **Level AA**

A slider thumb that can be dragged must also respond to arrow keys, and ideally to a click on the
track. Arrow keys alone satisfy the criterion.

---
# 4. Visual

### D1 — Text contrast ≥4.5:1, measured on composited pixels

`SC 1.4.3` · **Level AA**

Over a gradient, an image, or an overlapping element, axe returns **`incomplete`**, not a pass.
Those must be resolved by hand, on real pixels.

**How to measure without producing a false result:**

- `Page.captureScreenshot` `clip` is **document-absolute**; `getBoundingClientRect()` is
  **viewport-relative**. Screenshot the viewport and crop in PIL with viewport-relative coordinates.
  A ratio of exactly `1.00:1` with one unique colour means your crop missed.
- Crop to the **glyph band** — the union of `Range.getClientRects()` over the text nodes — so the
  element's own border is excluded. A 1px border can occupy enough of a padding-box crop to be
  picked as "the background" and produce a false failure.
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

Content may scroll in **one** direction only. A horizontal carousel inside a bounded, keyboard-
operable region is the permitted two-dimensional exception; page-level horizontal scroll is not.

Sufficient techniques: **C31** (flexbox), **C32** (media queries + grid), **C34** (un-fix sticky).

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
   **not** through a custom component unless you forward them. Spread `{...rest}` onto the DOM node.
2. **AEM `EditableComponent` injects a wrapper `<div>`.** Anything relying on a parent-child ARIA
   relationship (a `radiogroup` owning its radios, `aria-labelledby` across a boundary) breaks when
   each child becomes separately authorable. Keep such a group as **one** component, or wire
   `aria-owns` explicitly.
3. **Conditional rendering destroys focus.** Unmounting a panel while focus is inside drops focus to
   `<body>`. Return focus to the opener explicitly.
4. **`useId()` for every label association** — hand-written ids collide once a component is placed
   twice on a page, and `duplicate-id-aria` is a real failure.
5. **A CSS-in-JS `:focus-visible` must survive minification.** Verify the ring in the built bundle,
   not just in dev.
6. **Icons: name or hide at the component boundary** (A1). A per-call-site decision will be missed.
7. **Live regions must mount before they are written to.** Render the region unconditionally; write
   into it on update.

---

# 6. Definition of Done

- [ ] **axe with `target-size` explicitly enabled** — it is off by default, so without that line CI
      passes SC 2.5.8 without ever testing it
- [ ] **Accessibility tree asserted** — `0` unnamed `role=image` nodes, `0` unnamed interactive
      nodes, every duplicate role+name pair reviewed
- [ ] **Real keyboard run** — Tab / Shift+Tab / Enter / Space / Arrows / Escape, asserting
      `document.activeElement` and the resulting state at each step
- [ ] **All states, not just the default** — open every dialog, select every
      option, and re-run the checks after each
- [ ] **Reflow at 320×256 @ dsf 4** — nothing lost, no page-level horizontal scroll
- [ ] **Contrast on composited pixels** wherever text sits over a gradient or imagery
- [ ] **SC 2.5.3 by hand** — visible label contained in the accessible name. No tool does this
- [ ] **Names are correct**, not merely present and unique — read each against what it describes
- [ ] **Screen reader** — one pass with NVDA or VoiceOver. Not optional
- [ ] **The suite fails when it should** — inject the defect and confirm the detector fires

---

# 7. App-specific notes

**The sentence UI is the hard part.** The controls are `<select>`s embedded in a running sentence —
"What is the range **of my [ID.7]** when I mostly drive **[motorway]** in **[cold]** weather and I am
driving **[alone]**". That makes A4 (SC 2.5.3) unusually delicate: each control's accessible name is
assembled from the sentence fragments around it.

**The rule that works: append, never splice.**

```html
<!-- ✓ A concise, STABLE aria-label. Not stitched together from the visible
     sentence: that made the name move with the value, because JS rewrites the
     ID.7 token. A name must not change when the value changes. -->
<span id="select-w1">of my</span>                      <!-- prose, not a label -->
<span id="select-veh-family" class="fl-label">ID.7</span>  <!-- the VALUE's family -->
<select id="select-veh" aria-label="my car model variant">…</select>

<!-- ✗ do NOT stitch a name out of the visible sentence spans:
     aria-labelledby="select-w1 select-veh-family select-veh-hint"
     yields "of my ID.7 variant", and JS rewrites the ID.7 token — so the
     NAME MOVES WITH THE VALUE. Names must be stable. -->
```

The four names are *my car model variant*, *driving location*, *weather condition* and *number of
people in the car* — concise, stable, and describing purpose rather than echoing the prose. That is
a **recorded 2.5.3 decision**, not a free win: see `a11y-1-criteria.md`. It rests on reading the
sentence words as context and the on-control text as the value, so that no select has a visible
*label*. An auditor may disagree.

**A responsive name is a trap worth knowing even though it is now gone.** This app previously ran a
`syncEnvLabel()` that rewrote the environment select's `aria-label` when the visible copy changed at
the 400px breakpoint — because *if a name is derived from visible text and that text is responsive,
the name must be responsive too, or 2.5.3 breaks at one width only.* The concise-label scheme
removes the whole class of bug: a name that never derives from visible copy cannot drift from it.
**If you reintroduce visible-text-derived names, verify 2.5.3 at every breakpoint, not just the
widest.**

**`button#nala-info-btn` measures 23.797 × 24**, not 24×24 — `offsetWidth` rounds up to 24 and
`getBoundingClientRect()` does not. It passes SC 2.5.8 comfortably because `::before` makes the real
target ~36.7 × 36.8 (C1), and it has 66px of clearance besides. But **a manual DevTools check of the
border box will read 23.8 and flag it**, so the `::before` is load-bearing for the explanation even
though it is not load-bearing for the pass. Do not remove it.

**Superseded — kept only so the reasoning is not repeated.** `select#select-occ` used to be named
"weather and I am driving", inherited wholesale from the visible span. It
opens with a word belonging to the *previous* control. Correct per 2.5.3, mildly confusing to hear.
Worth revisiting if the sentence is ever restructured.
