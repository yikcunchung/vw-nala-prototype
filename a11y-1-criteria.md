# A11y 1 of 3 — WCAG 2.2 criterion checklist

**App:** VW NaLa — Private Vehicles (`nala`) — a single-page simulator.
**Audited:** 2026-08-22 against the live deployment.
**Deployed at:** https://yikcunchung.github.io/vw-nala-prototype/
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

**56 criteria assessed. 0 failures and 0 open items.** 22 verified · 9 inspected · 24 not applicable · 1 decision to record.

---

# 1. Perceivable


## 1.1 Text Alternatives

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.1.1** | Non-text Content | A | Yes | ✅ Pass | **0 unnamed nodes in the accessibility tree.** The car render carries `alt="Volkswagen ID.7, front three-quarter view"`; the VW logo is `role="img"` named "Volkswagen"; every decorative SVG is `aria-hidden="true"`. axe `image-alt` / `svg-img-alt` clean at 3 viewports. |


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
| **1.3.1** | Info and Relationships | A | Yes | ✅ Pass | Semantics carry the structure: one `h1`, `role="banner"` topbar, `main#nala-main`, and the sentence UI is a `role="group"`. Four `<select>`s, each with a programmatic name. axe 0 violations on all structure rules. |
| **1.3.2** | Meaningful Sequence | A | Yes | ✅ Pass* | DOM order matches visual order — the reading sentence *is* the DOM order. Tab reaches all 7 controls in the order they read. |
| **1.3.3** | Sensory Characteristics | A | Yes | ✅ Pass* | No instruction depends on shape, size, or position. Each control is identified by its own label text. |
| **1.3.4** | Orientation | AA | Yes | ✅ Pass | No `@media (orientation:)` rule exists anywhere. Content works in portrait and landscape; nothing locks orientation. |
| **1.3.5** | Identify Input Purpose | AA | No | ⚪ N/A | No field collects information about the user — no name, address, email or payment input. `autocomplete` has nothing to identify. |


## 1.4 Distinguishable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.4.1** | Use of Color | A | Yes | ✅ Pass* | Colour is never the only channel: the selected `<option>` is conveyed by the control value, not by colour. |
| **1.4.2** | Audio Control | A | No | ⚪ N/A | No audio plays automatically or otherwise; `audio[autoplay]` / `video[autoplay]` count is 0. |
| **1.4.3** | Contrast (Minimum) | AA | Yes | ✅ Pass | **No `color-contrast` node entered the incomplete bucket at any viewport** — axe computed a ratio for every text node and none failed. |
| **1.4.4** | Resize Text | AA | Yes | ✅ Pass | 400% zoom (320×256 @ dsf 4): 0 violations, no horizontal scroll, nothing clipped, all 7 controls reachable. |
| **1.4.5** | Images of Text | AA | Yes | ✅ Pass* | No images of text. All text is live text. |
| **1.4.10** | Reflow | AA | Yes | ✅ Pass | At 320×256 @ dsf 4: `scrollWidth 320 == clientWidth 320`, **zero elements overflow the right edge**, in all 8 interaction states. Vertical scroll only. |
| **1.4.11** | Non-text Contrast | AA | Yes | ✅ Pass* | Control boundaries and the focus ring are drawn in navy `#1b2236` on light backgrounds — far above 3:1. |
| **1.4.12** | Text Spacing | AA | Yes | ✅ Pass | All four overrides applied (line-height 1.5, letter-spacing .12em, word-spacing .16em, paragraph 2em) at 1440 / 390 / 320: **no newly clipped element, no control lost, no horizontal scroll.** Detector validated against a canary that fits at the default line-height and overflows at 1.5. |
| **1.4.13** | Content on Hover or Focus | AA | No | ⚪ N/A | No hover- or focus-triggered overlay. `#nala-details` is a click-toggled disclosure, not hover content. |


# 2. Operable


## 2.1 Keyboard Accessible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.1.1** | Keyboard | A | Yes | ✅ Pass | All 7 controls operable by keyboard. Details toggle driven with real Enter/Space; every `<select>` operable with arrows. |
| **2.1.2** | No Keyboard Trap | A | Yes | ✅ Pass | No trap. Tab cycles through all 7 stops and out; the disclosure does not capture focus. |
| **2.1.4** | Character Key Shortcuts | A | No | ⚪ N/A | No single-character key shortcuts are registered. |


## 2.2 Enough Time

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.2.1** | Timing Adjustable | A | No | ⚪ N/A | No time limit exists anywhere in the app. |
| **2.2.2** | Pause, Stop, Hide | A | No | ⚪ N/A | Nothing moves, blinks, scrolls, or auto-updates. The range figure changes only on user input. |


## 2.3 Seizures and Physical Reactions

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.3.1** | Three Flashes or Below Threshold | A | Yes | ✅ Pass* | Nothing flashes. No animation exceeds three cycles per second; transitions are single-shot eases. |


## 2.4 Navigable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.4.1** | Bypass Blocks | A | Yes | ✅ Pass | `a.skip-link → #nala-main`; the target exists and the link is the first tab stop, with a custom 2px white `:focus-visible` ring. |
| **2.4.2** | Page Titled | A | Yes | ✅ Pass | `<title>Volkswagen NaLa — Private Vehicles</title>` — descriptive and unique. |
| **2.4.3** | Focus Order | A | Yes | ✅ Pass | Focus order follows the sentence, which is also the visual order. All 7 controls reached in DOM order at 1440 and at 320×256 @ dsf 4. |
| **2.4.4** | Link Purpose (In Context) | A | No | ⚪ N/A | No links other than the skip link, which is named. |
| **2.4.5** | Multiple Ways | AA | No | ⚪ N/A | A standalone single page. SC 2.4.5 applies to a *set* of web pages; there is no set. |
| **2.4.6** | Headings and Labels | AA | Yes | ✅ Pass | One `h1`, no other headings, so no skipped levels. Every control's label describes its purpose. |
| **2.4.7** | Focus Visible | AA | Yes | ✅ Pass | Every focused control shows a `2px solid` outline; verified on all 7 stops at both viewports. |
| **2.4.11** | Focus Not Obscured (Minimum) | AA | Yes | ✅ Pass | No fixed or sticky element overlaps a focused control. Every focused control measured inside the viewport, including at 320×256. |


## 2.5 Input Modalities

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.5.1** | Pointer Gestures | A | Yes | ✅ Pass* | No path-based or multipoint gesture. Every control is a single tap or click. |
| **2.5.2** | Pointer Cancellation | A | Yes | ✅ Pass* | All activation is on the up-event — native `<button>` and `<select>` semantics; no `mousedown` handlers. |
| **2.5.3** | Label in Name | A | Yes | ⚖️ Decide | 8 of 9 controls exact. **Decide:** `#nala-wea` reads "in `[warm ▾]` weather" but is named "in which weather" — the sr-only word "which" is spliced between the two visible words, so the contiguous visible string is not a substring of the name. Both visible words appear in order, so a per-word reading passes; a strict speech-input test ("click in weather") would not match. |
| **2.5.4** | Motion Actuation | A | No | ⚪ N/A | No device-motion or user-motion actuation. |
| **2.5.7** | Dragging Movements | AA | No | ⚪ N/A | No dragging movement anywhere — no slider, no drag handle. |
| **2.5.8** | Target Size (Minimum) | AA | Yes | ✅ Pass | No target under 24×24. The smallest, `button#nala-info-btn`, measures **23.797 × 24** as a border box but its real pointer target is **~36.7 × 36.8** via `::before` — hit-tested by ray-casting `elementFromPoint`, all four corners at ±12 return the button. It also clears the spacing exception with 66px to its nearest neighbour. axe `target-size`: 7 pass, 0 violations. |


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
| **3.2.2** | On Input | A | Yes | ✅ Pass | Changing a `<select>` updates the range figure and the live region. That is the app's declared purpose, announced, and no context change occurs — focus stays put and no navigation happens. |
| **3.2.3** | Consistent Navigation | AA | No | ⚪ N/A | Applies across a set of web pages. This is a standalone page. |
| **3.2.4** | Consistent Identification | AA | No | ⚪ N/A | Applies across a set of web pages. This is a standalone page. |
| **3.2.6** | Consistent Help | A | No | ⚪ N/A | No help mechanism is offered, and the criterion applies across a set of pages. |


## 3.3 Input Assistance

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.3.1** | Error Identification | A | No | ⚪ N/A | No input can be in error. Every control is a closed `<select>` with valid options only. |
| **3.3.2** | Labels or Instructions | A | Yes | ✅ Pass | Every control is labelled by the sentence it sits in, via `aria-labelledby`. |
| **3.3.3** | Error Suggestion | AA | No | ⚪ N/A | No validated input, so no error to suggest a correction for. |
| **3.3.4** | Error Prevention (Legal, Financial, Data) | AA | No | ⚪ N/A | Nothing is submitted, purchased, or legally committed. The app computes an estimate and stores nothing. |
| **3.3.7** | Redundant Entry | A | No | ⚪ N/A | No multi-step process re-asks for information. |
| **3.3.8** | Accessible Authentication (Minimum) | AA | No | ⚪ N/A | No authentication of any kind. |


# 4. Robust


## 4.1 Compatible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **4.1.1** | Parsing | A | Yes | ✅ Pass | Nu HTML validator: **0 errors**. Obsolete in WCAG 2.2 but normative under EN 301 549 clause 9.4.1.1, so it is checked and kept. |
| **4.1.2** | Name, Role, Value | A | Yes | ✅ Pass | **AX tree: 120 nodes, 24 named, 0 unnamed, 0 duplicate role+name.** Every `<select>` exposes role, name and value; `#nala-info-btn` and `#nala-cta` keep `aria-expanded` synchronised — verified across 8 states. |
| **4.1.3** | Status Messages | AA | Yes | ✅ Pass | `#nala-live` (`aria-live="polite"`) announces the recomputed range. Tracked correctly through 8 state changes: 600 → 595 → 440 → 343 → 319 → 381 km. |

---

# What is actually left to do

**No open criteria and no known failures.** Every Level A/AA criterion is verified, inspected, or
not applicable.

**One decision to record.** It passes; it needs a recorded position, not code:

| SC | Decision |
|---|---|
| **2.5.3** Label in Name | `#nala-wea` reads "in `[warm ▾]` weather" and is named "in which weather". The sr-only word "which" sits between the two visible words, so the visible string is not contiguous in the name. Per-word it passes; a speech-input user saying "in weather" would not match. Either drop the sr-only word or move it to the end, as `#nala-veh` already does ("of my ID.7 **variant**"). |

**One thing no automated pass can close:** a screen-reader run. VoiceOver is planned; the protocol
names NVDA 2026.1.1.55980, so record that as a deviation. Two tool runs also remain — one pass
through the axe DevTools 4.131.2 UI, and a WAVE run from the browser extension. See
`a11y-2-automated-testing.md`.

# Decisions an auditor could challenge

24 of the 56 A/AA criteria have **no machine-testable ACT rule**, and several apply directly here
(1.4.11, 1.4.13, 2.5.1, 2.5.2, 2.5.8, 2.4.11). For those, "passes" reflects a **judgement**, not a
test result.

**The strongest claim this evidence supports:**

> *"This app meets WCAG 2.2 A/AA on every automated and runtime check available, pending
> screen-reader verification."*

That is stronger than a tool-clean claim, and unlike a tool-clean claim it is true — the one real
defect found here (unnamed graphics, SC 1.1.1) was invisible to axe, WAVE and Nu alike.
