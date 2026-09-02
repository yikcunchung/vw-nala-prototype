# A11y 1 of 3 — WCAG 2.2 criterion checklist

**App:** VW NaLa (`nala`), a single-page simulator.
**Audited:** 2026-08-24 against live at commit **`4304d62`** —
https://yikcunchung.github.io/vw-nala-prototype/
**Live matches source:** `index.html` on Pages is byte-for-byte the audited file
(sha256 `89058e665d02e64a…`, 48779 bytes), so every figure describes what ships.
**Scope:** the whole page; standalone, nothing out of scope. **No PDFs** — those would be a separate
conformance surface under EN 301 549 clause 10, checked with PAC.
**Companions:** `a11y-2-automated-testing.md` (what tools prove) · `a11y-3-implementation.md`.

Target **Level A + AA**, per EN 301 549 clause 9, hence BFSG / the European Accessibility Act:
**56 criteria** (32 A + 24 AA). The 31 AAA criteria are not required and not listed.

> EN 301 549 V3.2.1 (2021-03) references **WCAG 2.1**, not 2.2. Only delta: **4.1.1 Parsing** —
> obsolete in 2.2, normative in 2.1, EN clause 9.4.1.1. Satisfied and kept deliberately.

| Status | Meaning |
|---|---|
| ✅ Pass | Verified by driving the app — real pointer and key events, or measured pixels |
| ✅ Pass\* | Verified by code and accessibility-tree inspection, **not** driven |
| ⚪ N/A | The app has no such content |
| ⚖️ Decide | Passes, but on an arguable reading — record the decision |
| ❌ Inherited | Fails, and the cause is a **core design-system value** this app does not own |

**56 criteria assessed. 0 failures, 0 open criteria.**
(NVDA is an outstanding *run*, not an open criterion — see the end of this document.)
25 verified · 8 inspected · 23 not applicable · 0 failures.
(SC 1.4.11 was corrected 2026-08-30 from an inherited-failure state to a plain pass — moved from
"inherited" to "verified.")

---

# 1. Perceivable


## 1.1 Text Alternatives

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.1.1** | Non-text Content | A | Yes | ✅ Pass | **0 unnamed nodes in the AX tree**, both states. Car render `alt="Volkswagen ID.7, front three-quarter view"`; logo `role="img"` "Volkswagen"; every decorative SVG and the backdrop `#nala-range-backdrop` are `aria-hidden="true"`. axe `image-alt` / `svg-img-alt` clean, 5 viewports. |


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
| **1.3.1** | Info and Relationships | A | Yes | ✅ Pass | One `h1`, `role="banner"` topbar, `main#nala-main`, sentence UI `role="group"`. Four `<select>`s, each programmatically named. Modal `role="dialog"` + `aria-modal="true"`, `aria-labelledby` its own `h2#nala-range-modal-title`. axe 0 violations on structure rules. |
| **1.3.2** | Meaningful Sequence | A | Yes | ✅ Pass* | DOM order matches visual order — the reading sentence *is* the DOM order. The modal is appended last, reachable only while open. |
| **1.3.3** | Sensory Characteristics | A | Yes | ✅ Pass* | No instruction depends on shape, size or position; each control is named by its label. |
| **1.3.4** | Orientation | AA | Yes | ✅ Pass | No `@media (orientation:)` rule anywhere. Works portrait and landscape. |
| **1.3.5** | Identify Input Purpose | AA | No | ⚪ N/A | Collects no user information — no name, address, email or payment field. |


## 1.4 Distinguishable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **1.4.1** | Use of Color | A | Yes | ✅ Pass* | The selected `<option>` is conveyed by the control value, not by colour. |
| **1.4.3** | Contrast (Minimum) | AA | Yes | ✅ Pass | All text clears 4.5:1: modal body navy `#1b2236` on white **15.81:1**, consumption text `rgb(208,209,213)` on navy **10.36:1**. One node is *incomplete* modal-open at ≥390px — `#nala-range-modal-body`, axe reports "background color could not be determined because it partially overlaps other elements" — the full-width page regions sit behind the fixed overlay. **Resolved by hand to 15.81:1 PASS.** |
| **1.4.2** | Audio Control | A | No | ⚪ N/A | No audio. `audio[autoplay]` / `video[autoplay]` count is 0. |
| **1.4.4** | Resize Text | AA | Yes | ✅ Pass | 400% zoom (320×256 @ dsf 4): 0 violations both states, no horizontal scroll, nothing clipped, all controls reachable. |
| **1.4.5** | Images of Text | AA | Yes | ✅ Pass* | No images of text. All text is live text. |
| **1.4.10** | Reflow | AA | Yes | ✅ Pass | At 320×256 @ dsf 4: `scrollWidth 320 == clientWidth 320`, **zero elements overflow the right edge**, both states; vertical scroll only. `width: 91.66vw` / `max-height: calc(100% - 24px)` / `overflow-y: auto` keeps long modal copy scrolling inside. **Open risk, not yet re-closed:** `.fl-select`/`.fl-sizer`'s `max-width:240px` safety clamp was removed on request (2026-08-30) — it existed specifically to cap the vehicle select's width regardless of option text length (`.fl-sizer` is `white-space:nowrap`, so its content's intrinsic width now drives the control's rendered width with nothing capping it). Current placeholder content ("Model: ID.7" / "GTX 4MOTION 340 PS") still measures well within budget, so this pass holds **for today's content**. Verified with one real production option string ("Pro mit Infotainment-Paket 220 kW (299 PS) / 77 kW·h"): 376px needed against a 266.667px budget at 320 CSS px — a confirmed 170px page-level horizontal overflow once that lands. Re-test this row against real content before shipping, not just the placeholder. |
| **1.4.11** | Non-text Contrast | AA | Yes | ✅ Pass | **Corrected 2026-08-30:** `--border-input` is now `rgb(110,116,126)` (4.32:1 on cream `rgba(246,245,242,1)`), clearing 3:1 outright — no exception needed. This deliberately deviates from the real production core Select component (which uses the failing `rgb(161,164,172)`, 2.29:1, verified by pixel-sampling a live screenshot): **this prototype's purpose is to demonstrate a build that passes every criterion outright, regardless of whether the upstream core component itself does.** Focus ring `#C86C03` passes: **3.44:1** cream, **4.22:1** navy, **3.75:1** modal white. |
| **1.4.12** | Text Spacing | AA | Yes | ✅ Pass | Four overrides (line-height 1.5, letter-spacing .12em, word-spacing .16em, paragraph 2em) at 1440 / 390 / 320: **nothing clipped, no control lost, no horizontal scroll.** Detector validated on a canary that fits at default line-height and overflows at 1.5. |
| **1.4.13** | Content on Hover or Focus | AA | No | ⚪ N/A | No hover- or focus-triggered overlay; the modal is **click/Enter/Space-triggered**. Dismissible anyway (Escape, backdrop click), persistent until dismissed. |


# 2. Operable


## 2.1 Keyboard Accessible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.1.1** | Keyboard | A | Yes | ✅ Pass | **7 focusable default, 9 with the modal open**, all keyboard-operable. Real key events (`keyDown` → `char` → `keyUp`, required for Chrome to activate a `<button>`): info button opens on **Enter and Space**, close on **Enter**, selects on arrows. |
| **2.1.2** | No Keyboard Trap | A | Yes | ✅ Pass | Permitted modal exception, not a trap: **Escape always closes and returns focus to `#nala-info-btn`** (driven). **2 real Tab stops inside the dialog**, Shift+Tab reverses. `#topbar` and `#nala-main` carry `inert` plus a Tab handler while open, so focus cannot leak — not even via a browser-chrome round-trip, which is the case the Tab handler alone cannot cover; `inert` is removed before focus is restored. Outside, Tab cycles all 7 stops and out. |
| **2.1.4** | Character Key Shortcuts | A | No | ⚪ N/A | No single-character shortcuts. Escape is not a character key. |


## 2.2 Enough Time

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.2.1** | Timing Adjustable | A | No | ⚪ N/A | No time limit anywhere. |
| **2.2.2** | Pause, Stop, Hide | A | No | ⚪ N/A | Nothing moves, blinks, scrolls or auto-updates. The range figure changes only on input; the modal's 300ms fade is single-shot. |


## 2.3 Seizures and Physical Reactions

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.3.1** | Three Flashes or Below Threshold | A | Yes | ✅ Pass* | Nothing flashes; no animation exceeds three cycles per second. `prefers-reduced-motion: reduce` collapses every transition to 0.001ms. |


## 2.4 Navigable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.4.1** | Bypass Blocks | A | Yes | ✅ Pass | `a.skip-link → #nala-main`; target exists, link is the first tab stop, `2px solid #C86C03` ring at `outline-offset: -4px`. |
| **2.4.2** | Page Titled | A | Yes | ✅ Pass | `<title>Volkswagen NaLa</title>` — descriptive and unique. |
| **2.4.3** | Focus Order | A | Yes | ✅ Pass | Order follows the sentence, which is the visual order; all 7 controls in DOM order at 1440 and 320×256 @ dsf 4. The modal focuses **its body copy, not the close button**, so the explanation is announced, not skipped; closing returns focus to the invoking button. Driven and heard (`a11y-2` §9.1 rows 10, 12). |
| **2.4.4** | Link Purpose (In Context) | A | Yes | ✅ Pass | Two links; the skip link is named. The **"Learn more" CTA links out** to `volkswagen.co.uk/…/range-simulator.html`; bare *"Learn more"* is non-descriptive, so an appended `.sr-only` tail gives the full name **"Learn more about range on volkswagen.co.uk (opens in a new tab)"** — appended, never spliced, so the visible text stays a contiguous prefix. `rel="noopener noreferrer"`, `target="_blank"`. This is not an arguable reading: **[C7 "Using CSS to hide a portion of the link text"](https://www.w3.org/WAI/WCAG22/Techniques/css/C7) is itself one of the W3C's named sufficient techniques** for this SC (paired with G53), and it is exactly what's implemented here — a CSS-hidden span supplementing the visible text, not replacing or contradicting it. VoiceOver confirmed the full name is announced (a11y-2 §9.1 row 13). |
| **2.4.5** | Multiple Ways | AA | No | ⚪ N/A | Applies to a *set* of pages. This is one standalone page. |
| **2.4.6** | Headings and Labels | AA | Yes | ✅ Pass | `h1` "What is the range …", dialog `h2#nala-range-modal-title` "Estimated range" — no skipped levels. Every label describes its control. |
| **2.4.7** | Focus Visible | AA | Yes | ✅ Pass | Every focused control shows a `2px solid #C86C03` outline — all stops, both viewports, both states. Ring contrast 3.44:1 cream, 4.22:1 navy, 3.75:1 modal white. |
| **2.4.11** | Focus Not Obscured (Minimum) | AA | Yes | ✅ Pass | Nothing fixed or sticky overlaps a focused control. The modal header is `position: sticky; top: 0` **inside the scrolling dialog**; only `#nala-range-modal-body` scrolls under it, and its ring stays visible because the body scrolls, not the ring. All focused controls measured inside the viewport, including at 320×256. |


## 2.5 Input Modalities

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **2.5.1** | Pointer Gestures | A | Yes | ✅ Pass* | No path-based or multipoint gesture; every control is a single tap or click. |
| **2.5.2** | Pointer Cancellation | A | Yes | ✅ Pass* | Activation is on the up-event — native `<button>` and `<select>`, no `mousedown` handlers. |
| **2.5.3** | Label in Name | A | Yes | ✅ Pass | Each select is named by `aria-labelledby` pointing at its own real, visible label span: "Model:"+family for `#select-veh` (split into a static prefix and the mutating family value, in separate elements so the static half never drifts), "Road type" for `#select-env`, "Weather" for `#select-wea`, "Occupancy" for `#select-occ`. The name **is** the visible label, not merely compatible with it — closes 2.5.3 outright, not on an arguable reading. |
| **2.5.4** | Motion Actuation | A | No | ⚪ N/A | No device- or user-motion actuation. |
| **2.5.7** | Dragging Movements | AA | No | ⚪ N/A | No dragging — no slider, no drag handle. |
| **2.5.8** | Target Size (Minimum) | AA | Yes | ✅ Pass | Nothing under 24×24. The smallest, `button#nala-info-btn`, is a **23.797 × 24** border box with a real target of **~36.0 × 36.0** via a transparent `::before` — ray-cast with `elementFromPoint`, all four corners at ±12 return the button. Nearest other target **86.8px**; modal close **32 × 32**. axe `target-size`: **7 pass / 0 violations** default, **1 pass / 0 violations** modal-open — 1 because `inert` removes every background target. |


# 3. Understandable


## 3.1 Readable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.1.1** | Language of Page | A | Yes | ✅ Pass | `<html lang="en">`; axe `html-has-lang` clean. |
| **3.1.2** | Language of Parts | AA | No | ⚪ N/A | Every string is English; no passage changes language. |


## 3.2 Predictable

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.2.1** | On Focus | A | Yes | ✅ Pass* | No control acts on `focus`. |
| **3.2.2** | On Input | A | Yes | ✅ Pass | Changing a `<select>` updates the range figure and the live region — the declared purpose, no context change: focus stays, no navigation. Opening the dialog is a deliberate activation, not a side-effect. |
| **3.2.3** | Consistent Navigation | AA | No | ⚪ N/A | Applies across a set of pages. This is standalone. |
| **3.2.4** | Consistent Identification | AA | No | ⚪ N/A | Applies across a set of pages. This is standalone. |
| **3.2.6** | Consistent Help | A | No | ⚪ N/A | No help mechanism, and it applies across a set of pages. |


## 3.3 Input Assistance

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **3.3.1** | Error Identification | A | No | ⚪ N/A | No input can be in error: every control is a closed `<select>` with valid options. |
| **3.3.2** | Labels or Instructions | A | Yes | ✅ Pass | Each control has a real visible label — "Model:"+family, "Road type", "Weather", "Occupancy" — sitting inside its own floating-label box, not just implied by the surrounding sentence. |
| **3.3.3** | Error Suggestion | AA | No | ⚪ N/A | No validated input, so no correction to suggest. |
| **3.3.4** | Error Prevention (Legal, Financial, Data) | AA | No | ⚪ N/A | Nothing is submitted, purchased or legally committed; the app computes an estimate and stores nothing. |
| **3.3.7** | Redundant Entry | A | No | ⚪ N/A | No multi-step process re-asks for information. |
| **3.3.8** | Accessible Authentication (Minimum) | AA | No | ⚪ N/A | No authentication of any kind. |


# 4. Robust


## 4.1 Compatible

| SC | Name | Lvl | Relevant | Status | Evidence / what to do |
|---|---|---|---|---|---|
| **4.1.1** | Parsing | A | Yes | ✅ Pass | Nu HTML validator **0 errors**. Obsolete in WCAG 2.2 but normative under EN 301 549 clause 9.4.1.1, so kept deliberately. |
| **4.1.2** | Name, Role, Value | A | Yes | ✅ Pass | 0 unnamed, **0 duplicate role+name**. Every `<select>` exposes role, name and value, and **the four names are stable — identical after changing all four values** (verified: `tests/invariants.spec.js`'s name-stability tests, resolving each `aria-labelledby` before and after changing every select). `#nala-cta` is a real `<a href>` exposing **`role=link`**; `#nala-info-btn` has `aria-haspopup="dialog"`; `#nala-range-modal` is `role="dialog"` + `aria-modal="true"` + `aria-labelledby`. **No `aria-expanded` anywhere.** |
| **4.1.3** | Status Messages | AA | Yes | ✅ Pass | `#nala-live` (`aria-live="polite"`) announces the recomputed range without moving focus: 600 → 595 km, driven. Empty at rest, cleared after 3000ms. |

---

# What is actually left to do

**No open failures.** SC 1.4.11's `<select>` border was corrected 2026-08-30 from the real core
component's failing `rgb(161,164,172)` (2.29:1) to `rgb(110,116,126)` (4.32:1) — this prototype's
purpose is to demonstrate a build that passes every criterion outright, not replicate an upstream
component's own contrast failure. See the SC 1.4.11 row above.

**No open decisions.** SC 2.5.3 (Label in Name) is a plain pass, closed by a real visible label, not an arguable reading. SC 2.4.4 (Link Purpose in Context) is likewise a plain pass, not a judgement call: its "Learn more" sr-only tail is W3C's own named sufficient technique C7, not a workaround an auditor could reasonably reject — see the criteria table above.

**Automated runs complete.** axe-core 4.13.0 at **96 rules** (all nine default-disabled
force-enabled, including `target-size`): **0 violations** across 5 viewports × 2 states, 0 JS
exceptions. Protocol `a11y-2` **§6**, checklist **§7**, results **§9**; **§9.1 is 15 of 15 rows
evidenced.** NVDA is the only outstanding run.

| Run | Status | Notes |
|---|---|---|
| **VoiceOver** | ✅ **done** | Live on Safari, Chrome as second opinion — §9.1. **Found a real defect every tool passed:** the visible result carried `aria-hidden`, so the number was unreachable. Fixed. Both open questions settled — no leak to the virtual cursor, no duplicate label. |
| **WAVE** | ✅ **done** | Hosted and by extension, live, both states — §9.2. **0 errors, 0 contrast errors, AIM 10/10.** 1 alert: *Possible heading* on the **result digits**, a calculated value. |
| **axe DevTools UI** | ✅ **done** | **WCAG 2.2 AA**, both states, **0 issues**, Interactive Elements guided test clean — §9.3. Agrees with the CDP run. Installed version not recorded — a deviation to capture if audited formally. |

**NVDA 2026.1.1.55980 has not been run** — the one real screen-reader gap. VoiceOver is a
**deviation, not a substitute**: a formal BITV / EN 301 549 audit naming NVDA will not accept it.

# Decisions an auditor could challenge

23 of the 56 A/AA criteria have **no machine-testable ACT rule**, several of them live here (1.4.11,
1.4.13, 2.5.1, 2.5.2, 2.5.8, 2.4.11): "passes" there is a **judgement**, not a test result.

**The strongest claim this evidence supports:**

> *"This app meets WCAG 2.2 A/AA on **every check the protocol names except NVDA** — axe over CDP at
> 96 rules and via the DevTools UI at 2.2 AA, WAVE hosted and by extension in both states, the
> accessibility tree, real key events, literal 400% zoom, and a **VoiceOver pass on Safari**, all
> against live — with **two run-level trade-offs** in `a11y-2` §9.1."*

Not "fully compliant": **NVDA has never run**, and the SC 1.4.10 real-content overflow risk (above)
is not yet re-closed. SC 1.4.11 previously failed via an inherited core component value; it's now a
plain pass since the prototype deliberately deviates from that value.

**VoiceOver is why the manual passes exist.** It found `#nala-value` carrying
`aria-hidden="true"` — the headline number absent from the accessibility tree, only a clipped live
region as readable copy, so browsing the result panel never reached it. **axe at 96 rules, WAVE and
Nu all passed it**, ten runs, zero violations. Tool-clean is not compliant.
