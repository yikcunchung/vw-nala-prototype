# A11y 1 of 3 — WCAG 2.2 criterion checklist

**App:** VW NaLa (`nala`), a single-page simulator.
**Audited:** 2026-08-23 against the live deployment at commit **`4304d62`**.
**Deployed at:** https://yikcunchung.github.io/vw-nala-prototype/
**Live verified identical to source:** `index.html` on Pages is byte-for-byte equal to the audited
file (sha256 `89058e665d02e64a…`, 48779 bytes), so every figure below describes what actually ships.
**Scope:** the whole page. This app is standalone, so there is no component-versus-page split and
nothing is out of scope. **PDFs are excluded** — the app ships none; they would be a separate
conformance surface under EN 301 549 clause 10, checked with PAC.
**Companion documents:** `a11y-2-automated-testing.md` (what the tools can and cannot prove) ·
`a11y-3-implementation.md` (what to build).

The conformance target is **Level A + AA** — what EN 301 549 clause 9 requires, and therefore
BFSG / the European Accessibility Act. That is **56 criteria** (32 A + 24 AA). The 31 Level AAA
criteria are not required and are not listed.

> **If EN 301 549 becomes the formal target**, note that V3.2.1 (2021-03) references **WCAG 2.1**,
> not 2.2. The only practical delta is **4.1.1 Parsing** — obsolete in 2.2 but normative in 2.1 and
> listed by EN as clause 9.4.1.1. It is satisfied here and kept in the table rather than dropped, so
> the EN path is not silently broken.

| Status | Meaning |
|---|---|
| ✅ Pass | Verified by driving the app — real pointer and key events, or measured pixels |
| ✅ Pass\* | Verified by code and accessibility-tree inspection, **not** driven |
| ⚪ N/A | The app has no such content |
| ⚖️ Decide | Passes, but on an arguable reading — record the decision |
| ❌ Inherited | Fails, and the cause is a **core design-system value** this app does not own |

**56 criteria assessed. 1 inherited failure, 0 failures owned by this app, 0 open items.**
22 verified · 8 inspected · 24 not applicable · 1 decision to record · 1 inherited failure.

---

# 1. Perceivable


## 1.1 Text Alternatives

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.1.1** | Non-text Content | A | Yes | ✅ Pass | **0 unnamed interactive or graphic nodes in the accessibility tree**, in both the default and modal-open states. The car render carries `alt="Volkswagen ID.7, front three-quarter view"`; the VW logo is `role="img"` named "Volkswagen"; every decorative SVG — including the modal close glyph — is `aria-hidden="true"`. The modal backdrop `#nala-range-backdrop` is `aria-hidden="true"`. axe `image-alt` / `svg-img-alt` clean at 5 viewports. |


## 1.2 Time-based Media

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.2.1** | Audio-only and Video-only (Prerecorded) | A | No | ⚪ N/A | No audio-only or video-only content. |
| **1.2.2** | Captions (Prerecorded) | A | No | ⚪ N/A | No prerecorded video with audio. |
| **1.2.3** | Audio Description or Media Alternative (Prerecorded) | A | No | ⚪ N/A | No prerecorded video. |
| **1.2.4** | Captions (Live) | AA | No | ⚪ N/A | No live media. |
| **1.2.5** | Audio Description (Prerecorded) | AA | No | ⚪ N/A | No prerecorded video. |


## 1.3 Adaptable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.3.1** | Info and Relationships | A | Yes | ✅ Pass | Semantics carry the structure: one `h1`, `role="banner"` topbar, `main#nala-main`, and the sentence UI is a `role="group"`. Four `<select>`s, each with a programmatic name. The range info modal is a `role="dialog"` with `aria-modal="true"`, named by its own `h2#nala-range-modal-title` via `aria-labelledby`. axe 0 violations on all structure rules. |
| **1.3.2** | Meaningful Sequence | A | Yes | ✅ Pass* | DOM order matches visual order — the reading sentence *is* the DOM order. The modal is appended last in the DOM and is only reachable while open, so it never interleaves with the page sequence. |
| **1.3.3** | Sensory Characteristics | A | Yes | ✅ Pass* | No instruction depends on shape, size, or position. Each control is identified by its own label text. |
| **1.3.4** | Orientation | AA | Yes | ✅ Pass | No `@media (orientation:)` rule exists anywhere. Content works in portrait and landscape; nothing locks orientation. |
| **1.3.5** | Identify Input Purpose | AA | No | ⚪ N/A | No field collects information about the user — no name, address, email or payment input. `autocomplete` has nothing to identify. |


## 1.4 Distinguishable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.4.1** | Use of Color | A | Yes | ✅ Pass* | Colour is never the only channel: the selected `<option>` is conveyed by the control value, not by colour. |
| **1.4.3** | Contrast (Minimum) | AA | Yes | ✅ Pass | All text clears 4.5:1. Measured: modal body navy `#1b2236` on white **15.81:1**; consumption text `rgb(208,209,213)` on the navy panel **10.36:1**. One `color-contrast` node enters the *incomplete* bucket in the modal-open state at ≥390px — `#nala-range-modal-body`, where axe reports "background could not be determined because it partially overlaps other elements" because the full-width page regions sit geometrically behind the fixed overlay. **Resolved by hand to 15.81:1 PASS.** |
| **1.4.2** | Audio Control | A | No | ⚪ N/A | No audio plays automatically or otherwise; `audio[autoplay]` / `video[autoplay]` count is 0. |
| **1.4.4** | Resize Text | AA | Yes | ✅ Pass | 400% zoom (320×256 @ dsf 4): 0 violations in both states, no horizontal scroll, nothing clipped, all controls reachable. |
| **1.4.5** | Images of Text | AA | Yes | ✅ Pass* | No images of text. All text is live text. |
| **1.4.10** | Reflow | AA | Yes | ✅ Pass | At 320×256 @ dsf 4: `scrollWidth 320 == clientWidth 320`, **zero elements overflow the right edge**, in both the default and modal-open states. Vertical scroll only. The modal is `width: 91.66vw` with `max-height: calc(100% - 24px)` and `overflow-y: auto`, so long copy scrolls inside it rather than overflowing the page. |
| **1.4.11** | Non-text Contrast | AA | Yes | ❌ **Inherited** | **The `<select>` border fails.** `--border-input: rgb(161,164,172)` (`#a1a4ac`) against the cream page background `rgba(246,245,242,1)` measures **2.29:1** — below the required 3:1 for the visual boundary of a control. **This value comes from the VW core component library and is not owned by this prototype**, so it is recorded here and raised upstream rather than patched locally. Everything else in this criterion passes: the focus ring `#C86C03` measures **3.44:1** on cream, **4.22:1** on the navy panel and **3.75:1** on the modal white — all above 3:1. Mitigating but *not* sufficient on its own: the chevron glyph `#293043` is **12.05:1** on cream, so the control remains identifiable; a strict reading of 1.4.11 still requires the boundary itself to reach 3:1. |
| **1.4.12** | Text Spacing | AA | Yes | ✅ Pass | All four overrides applied (line-height 1.5, letter-spacing .12em, word-spacing .16em, paragraph 2em) at 1440 / 390 / 320: **no newly clipped element, no control lost, no horizontal scroll.** Detector validated against a canary that fits at the default line-height and overflows at 1.5. |
| **1.4.13** | Content on Hover or Focus | AA | No | ⚪ N/A | No hover- or focus-triggered overlay. The range info modal is **click/Enter/Space-triggered**, not hover or focus, so it is outside this criterion. It is nonetheless dismissible (Escape and a backdrop click both close it) and persistent (it stays until dismissed). |


# 2. Operable


## 2.1 Keyboard Accessible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.1.1** | Keyboard | A | Yes | ✅ Pass | All controls operable by keyboard — **7 focusable in the default state, 9 with the modal open**. Verified with real key events (`keyDown` → `char` → `keyUp`, which is required for Chrome to activate a `<button>`): the info button opens the modal on both **Enter and Space**; the close button closes it on **Enter**; every `<select>` operable with arrows. |
| **2.1.2** | No Keyboard Trap | A | Yes | ✅ Pass | The dialog's focus containment is the **permitted modal exception**, not a trap: **Escape always closes it and returns focus to `#nala-info-btn`** (driven and confirmed). Tab cycles `#nala-range-modal-close` → `#nala-range-modal-body` → close → … and Shift+Tab reverses it. While open, `#topbar` and `#nala-main` carry `inert`, so focus cannot leak to the background even via a browser-chrome round-trip; `inert` is removed before focus is restored on close. Outside the modal, Tab cycles all 7 stops and out. |
| **2.1.4** | Character Key Shortcuts | A | No | ⚪ N/A | No single-character key shortcuts are registered. Escape is not a character key. |


## 2.2 Enough Time

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.2.1** | Timing Adjustable | A | No | ⚪ N/A | No time limit exists anywhere in the app. |
| **2.2.2** | Pause, Stop, Hide | A | No | ⚪ N/A | Nothing moves, blinks, scrolls, or auto-updates. The range figure changes only on user input; the modal's 300ms fade is a single-shot transition on a user action. |


## 2.3 Seizures and Physical Reactions

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.3.1** | Three Flashes or Below Threshold | A | Yes | ✅ Pass* | Nothing flashes. No animation exceeds three cycles per second; transitions are single-shot eases. `prefers-reduced-motion: reduce` collapses every transition to 0.001ms, including the modal's. |


## 2.4 Navigable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.4.1** | Bypass Blocks | A | Yes | ✅ Pass | `a.skip-link → #nala-main`; the target exists and the link is the first tab stop, with a custom `2px solid #C86C03` `:focus-visible` ring at `outline-offset: -4px`. |
| **2.4.2** | Page Titled | A | Yes | ✅ Pass | `<title>Volkswagen NaLa</title>` — descriptive and unique. |
| **2.4.3** | Focus Order | A | Yes | ✅ Pass | Focus order follows the sentence, which is also the visual order. All 7 controls reached in DOM order at 1440 and at 320×256 @ dsf 4. Opening the modal moves focus to its close button; closing returns it to the invoking button — both driven and confirmed. |
| **2.4.4** | Link Purpose (In Context) | A | Yes | ✅ Pass | Two links. The skip link is named. The **"Learn more" CTA is an external link-out** to `volkswagen.co.uk/…/range-simulator.html`; bare *"Learn more"* is the classic non-descriptive link text, so an appended `.sr-only` tail gives it purpose and destination: full name **"Learn more about range on volkswagen.co.uk (opens in a new tab)"**. Appended, never spliced, so the visible text stays a contiguous prefix. `rel="noopener noreferrer"` with `target="_blank"`. |
| **2.4.5** | Multiple Ways | AA | No | ⚪ N/A | A standalone single page. SC 2.4.5 applies to a *set* of web pages; there is no set. |
| **2.4.6** | Headings and Labels | AA | Yes | ✅ Pass | `h1` "What is the range …" and, inside the dialog, `h2#nala-range-modal-title` "Estimated range" — no skipped levels. Every control's label describes its purpose. |
| **2.4.7** | Focus Visible | AA | Yes | ✅ Pass | Every focused control shows a `2px solid #C86C03` outline — verified on all stops at both viewports and in both states. Contrast of the ring: 3.44:1 on cream, 4.22:1 on navy, 3.75:1 on the modal white; all clear the 3:1 requirement. |
| **2.4.11** | Focus Not Obscured (Minimum) | AA | Yes | ✅ Pass | No fixed or sticky element overlaps a focused control. The modal's own header is `position: sticky; top: 0` **inside the scrolling dialog**, and the only focusable element that can scroll under it is `#nala-range-modal-body`, whose focus ring stays visible because the body scrolls rather than the ring. Every focused control measured inside the viewport, including at 320×256. |


## 2.5 Input Modalities

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.5.1** | Pointer Gestures | A | Yes | ✅ Pass* | No path-based or multipoint gesture. Every control is a single tap or click. |
| **2.5.2** | Pointer Cancellation | A | Yes | ✅ Pass* | All activation is on the up-event — native `<button>` and `<select>` semantics; no `mousedown` handlers. |
| **2.5.3** | Label in Name | A | Yes | ⚖️ Decide | **The decision changed shape — the previous `#select-wea` splice no longer exists.** Every select now carries a concise `aria-label` that deliberately does *not* mirror the surrounding sentence prose. **The reading this rests on:** the words around each dropdown (*"of my"*, *"in"*, *"weather and I am driving"*) are running prose and the on-control text is the *value*, so no select has a visible *label* and 2.5.3 is satisfied trivially — the same position already settled for the Visualizer's `#select-model-lg`. **The counter-reading an auditor could take:** in a talking-sentence UI the prose *is* the label, in which case all four names would fail. Recorded, not hidden. **Why the new names are still the right call:** the old scheme made `#select-veh`'s name **mutate with its value** (JS rewrote the `ID.7` token feeding it) — names must be stable — and named the occupancy select *"weather and I am driving"*, which opens with a word about the previous control and never mentions people. |
| **2.5.4** | Motion Actuation | A | No | ⚪ N/A | No device-motion or user-motion actuation. |
| **2.5.7** | Dragging Movements | AA | No | ⚪ N/A | No dragging movement anywhere — no slider, no drag handle. |
| **2.5.8** | Target Size (Minimum) | AA | Yes | ✅ Pass | No target under 24×24. The smallest, `button#nala-info-btn`, measures **23.797 × 24** as a border box but its real pointer target is **~36.7 × 36.8** via a transparent `::before` — hit-tested by ray-casting `elementFromPoint`, all four corners at ±12 return the button. The modal close button is a plain **32 × 32**. axe `target-size`: **7 pass / 0 violations** default, **1 pass / 0 violations** modal-open — one, not more, because `inert` removes every background control from the tree while the dialog is open, leaving its close button as the only target to measure. |


# 3. Understandable


## 3.1 Readable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.1.1** | Language of Page | A | Yes | ✅ Pass | `<html lang="en">`; axe `html-has-lang` clean. |
| **3.1.2** | Language of Parts | AA | No | ⚪ N/A | Every string in the app is English. No passage changes language, so no `lang` attribute is needed. |


## 3.2 Predictable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.2.1** | On Focus | A | Yes | ✅ Pass* | Focus alone changes nothing — no control acts on `focus`. |
| **3.2.2** | On Input | A | Yes | ✅ Pass | Changing a `<select>` updates the range figure and the live region. That is the app's declared purpose, announced, and no context change occurs — focus stays put and no navigation happens. Opening the dialog is a deliberate activation, not an input side-effect. |
| **3.2.3** | Consistent Navigation | AA | No | ⚪ N/A | Applies across a set of web pages. This is a standalone page. |
| **3.2.4** | Consistent Identification | AA | No | ⚪ N/A | Applies across a set of web pages. This is a standalone page. |
| **3.2.6** | Consistent Help | A | No | ⚪ N/A | No help mechanism is offered, and the criterion applies across a set of pages. |


## 3.3 Input Assistance

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.3.1** | Error Identification | A | No | ⚪ N/A | No input can be in error. Every control is a closed `<select>` with valid options only. |
| **3.3.2** | Labels or Instructions | A | Yes | ✅ Pass | Every control carries a concise `aria-label` describing its purpose — *my car model variant*, *driving location*, *weather condition*, *travelling*. The visible sentence supplies the same meaning to sighted users. |
| **3.3.3** | Error Suggestion | AA | No | ⚪ N/A | No validated input, so no error to suggest a correction for. |
| **3.3.4** | Error Prevention (Legal, Financial, Data) | AA | No | ⚪ N/A | Nothing is submitted, purchased, or legally committed. The app computes an estimate and stores nothing. |
| **3.3.7** | Redundant Entry | A | No | ⚪ N/A | No multi-step process re-asks for information. |
| **3.3.8** | Accessible Authentication (Minimum) | AA | No | ⚪ N/A | No authentication of any kind. |


# 4. Robust


## 4.1 Compatible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **4.1.1** | Parsing | A | Yes | ✅ Pass | Nu HTML validator: **0 errors**. Obsolete in WCAG 2.2 but normative under EN 301 549 clause 9.4.1.1, so it is checked and kept. |
| **4.1.2** | Name, Role, Value | A | Yes | ✅ Pass | 0 unnamed and 0 duplicate role+name in both states. Every `<select>` exposes role, name and value, and **the four names are stable — verified identical after changing all four values**, which the previous `aria-labelledby` scheme was not. `#nala-cta` is a real `<a href>` exposing **`role=link`**, not a button. `#nala-info-btn` declares `aria-haspopup="dialog"`; `#nala-range-modal` is `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. **No `aria-expanded` anywhere** — nothing advertises a state it does not maintain. |
| **4.1.3** | Status Messages | AA | Yes | ✅ Pass | `#nala-live` (`aria-live="polite"`) announces the recomputed range without moving focus. Tracked correctly across state changes: 600 → 595 km driven and confirmed. |

---

# What is actually left to do

**One inherited failure, owned upstream:**

| SC | Finding | Owner |
|---|---|---|
| **1.4.11** Non-text Contrast | `<select>` border `rgb(161,164,172)` = **2.29:1** on the cream background; needs 3:1. | **VW core component library** — not this prototype. Raise upstream; do not patch locally. |

**One decision to record.** It passes; it needs a recorded position, not code:

| SC | Decision |
|---|---|
| **2.5.3** Label in Name | The four selects carry concise `aria-label`s (*my car model variant*, *driving location*, *weather condition*, *travelling*) that deliberately do **not** echo the surrounding sentence prose. This passes on the reading that the prose is *context* and the on-control text is the *value*, so no select has a visible **label** — the position already settled for the Visualizer's `#select-model-lg`. An auditor who instead treats a talking-sentence UI's prose as the label would fail all four. **Record the position; do not quietly re-stitch the names out of the visible words** — that is what made `#select-veh`'s name mutate with its value. |

**Automated runs: complete.**
- axe-core 4.13.0, **96 rules** (all nine default-disabled rules force-enabled, including `target-size`): **0 violations** across 5 viewports × 2 states, 0 JS exceptions.
- **WAVE hosted, against the live deployment: 0 errors, 0 contrast errors, AIM score 10/10.** 1 alert ("Possible heading" on the bold *Estimated range* label — intentionally a label, not a heading).

**All tool runs are complete. NVDA is the only outstanding run.** Protocol in `a11y-2-automated-testing.md` **§6**, checklist in **§7**,
and results are recorded in **§9** — actions, grading and evidence are deliberately three separate
sections so the tester records what happened rather than judging in the moment. **§9.1 is currently
empty**: no screen reader has been run, and an empty row there is not a pass.

| Run | Status | Why it is still open |
|---|---|---|
| **VoiceOver** | ✅ **done** | Run against live on Safari, with Chrome as a second opinion — `a11y-2` §9.1. **It found a real defect every tool passed:** the visible result carried `aria-hidden`, so the number was unreachable. Fixed. Both open questions settled: the dialog does **not** leak to the virtual cursor, and the duplicated label no longer exists. |
| **WAVE extension** | ✅ **done** | Run against live in both states — `a11y-2` §9.2. **0 errors, 0 contrast errors** with the dialog open as well as closed; the dialog introduces nothing. The 1 alert is *Possible heading* on the result digits, which are a calculated value, not a section title. |
| **axe DevTools UI** | ✅ **done** | Run at **WCAG 2.2 AA** in both states, 0 issues, Interactive Elements guided test clean — `a11y-2` §9.3. Agrees with the CDP run. Installed version not recorded: a deviation to capture if a formal audit asks. |

**NVDA 2026.1.1.55980 is the one real screen-reader gap.** VoiceOver has now been run (`a11y-2`
§9.1) and is a **deviation, not a substitution** — a formal BITV / EN 301 549 audit naming NVDA will
not accept VoiceOver evidence for that line item.

# Decisions an auditor could challenge

24 of the 56 A/AA criteria have **no machine-testable ACT rule**, and several apply directly here
(1.4.11, 1.4.13, 2.5.1, 2.5.2, 2.5.8, 2.4.11). For those, "passes" reflects a **judgement**, not a
test result.

**The strongest claim this evidence supports:**

> *"This app meets WCAG 2.2 A/AA on every automated and runtime check available, with one
> non-text-contrast failure inherited from the core component library and one discretionary
> decision recorded, pending screen-reader verification."*

Note what that does **not** say: it does not say "fully compliant". The select-border failure is
real and measurable even though this app does not own the fix, and real screen-reader output has
never been tested. The one defect class found on this suite (unnamed graphics, SC 1.1.1) was
invisible to axe, WAVE and Nu alike — tool-clean is not the same as compliant.
