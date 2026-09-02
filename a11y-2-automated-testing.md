# A11y 2 of 3 — What the tools prove, and what they cannot

**App:** VW NaLa (`nala`).
**Audited:** 2026-08-24 against the live deployment, headless Chrome 151.0.7922.174, axe-core 4.13.0
(`axe.version` read from the engine, not the bundle filename).
**Deployed at:** https://yikcunchung.github.io/vw-nala-prototype/
**Companions:** `a11y-1-criteria.md` (every criterion) · `a11y-3-implementation.md` (what to build).

**BLUF:** nala is at **0 axe violations** across five viewports × two states with all nine
default-disabled rules force-enabled (96 rules), **0 WAVE errors** hosted *and* by extension in both
states, **0 issues** through the axe DevTools UI at WCAG 2.2 AA, and **0 unnamed nodes** in the
accessibility tree. The behaviour no scanner reaches was driven with real key events. **A VoiceOver
pass is complete — 15 of 15 rows — and it found a defect every one of those tools passed.** One
thing is still owed: **NVDA**. The select border, corrected 2026-08-30 to `rgb(110,116,126)`
(4.32:1), now clears SC 1.4.11's 3:1 floor outright — deliberately deviating from the real core
component's own failing value, since this prototype's job is to pass every criterion.

> **The one sentence that matters:** a clean automated run is necessary and nowhere near sufficient.
> This app scored 0 axe violations at 96 rules, 0 WAVE errors and 0 HTML validity errors **while the
> visible result carried `aria-hidden="true"`** — the headline number absent from the accessibility
> tree, with only a clipped live region as the readable copy, so browsing the result panel never
> reached the result (§9.1 row 6). Tooling also cannot test SC 2.5.3, cannot judge whether a name is
> *correct* rather than merely present, and cannot tell you what a screen reader actually says.

**How to read this.** §0–§5 are **explanation**: what the tools establish, and the traps that make a
zero untrustworthy. §6–§8 are **procedure**. §9 is the **evidence record** — what was observed, when,
on which build. §10 is the **claim**, and the two reasons it stops short of "fully compliant".

---

# 0. Scope of this evidence — read before quoting a number

A **standalone page**, so `axe.run(document)` covers the whole conformance surface; no
component-versus-page split. Local `index.html` and the deployed build are **byte-identical**.

Criterion record: `a11y-1-criteria.md` — **56 criteria: 25 verified, 8 inspected, 23 not applicable,
0 failures.**

---

# 1. Tool coverage at a glance

| Tool | Good for | Blind spots that matter here |
|---|---|---|
| **axe-core 4.13.0** | Structural ARIA, names, roles, contrast on solid backgrounds | **No `label-in-name` rule** (SC 2.5.3); **no rule for SC 1.4.11** (§2); **blind to an unnamed inline `<svg>` with no `role`** (trap 10); blind to behaviour; punts on gradients. **Nine rules off by default, incl. `target-size`** (trap 1) |
| **WAVE 3.3.1.0** | A different engine; catches empty labels and sr-only contrast axe passes | Needs a public URL. *May* flag `.sr-only` contrast even at a 1×1 clip — it did **not** here (§9.2) |
| **Nu HTML validator** | SC 4.1.1 Parsing, normative under EN 301 549 | Silent on semantics and naming |
| **Accessibility tree (CDP)** | Ground truth for name / role / value | Exposure is not announcement — §5 |
| **Real key and pointer events** | The only way to test behaviour | Slow; assert state after every event |

## Required toolchain — coverage against it

| Required | Status | Note |
|---|---|---|
| **axe DevTools 4.131.2** | ✅ **Done — UI at WCAG 2.2 AA, 0 issues** | Both states, plus a clean Interactive Elements guided test. The CDP run used **axe-core 4.13.0** — the library the extension embeds — at **96 rules**, a superset of the extension's default scan; the two agree. Installed version not recorded: a recorded deviation — §9.3 |
| **WAVE Evaluation Tool 3.3.1.0** | ✅ **Done — hosted and extension, both states** | **0 errors, 0 contrast errors, AIM 10/10** hosted; the extension added **modal-open** at identical counts — §9.2 |
| **Zoom 400% and 320 × 256 px** | ✅ **Done** | `320×256 @ deviceScaleFactor 4`. **dsf 1 is a small screen, not a zoomed one** |
| **Operated via the keyboard** | ✅ **Done** | Real `Input.dispatchKeyEvent` |
| **NVDA 2026.1.1.55980** | ❌ **Not done** | The one real screen-reader gap. **VoiceOver has been run — §9.1** — a deviation, not a substitute. Protocol §6 Run 1, checklist §7 |
| **PAC 26.1.0.0** | ⚪ **Not applicable** | Checks PDF/UA-1 (ISO 14289-1); no PDFs ship (`*.pdf` count: 0). Brochures or price lists would be a separate surface under EN 301 549 clause 10 |

### NVDA vs VoiceOver — a deviation to record

A **deviation**, not a substitution. The two disagree exactly where this app is interesting: a
`<select>` named by `aria-labelledby` pointing at a real visible label, live-region politeness
and timing, and whether a clipped `.sr-only` node is announced at all. NVDA is tested with Firefox or
Chrome, VoiceOver with Safari, so the browser differs too. Budget an NVDA pass before sign-off.

---

# 2. Results

## axe-core — 0 violations

Bare `axe.run(document)` plus all nine default-disabled rules force-enabled (**96 rules**, axe-core
4.13.0). Viewports 1440×900, 768×1024, 390×844, 320×256 @ dsf 1, 320×256 @ dsf 4 (literal 400% zoom),
**each run twice — default and modal-open** (10 runs). **Against the live deployment** at commit
`4304d62`, live `index.html` first confirmed byte-for-byte identical to source (sha256
`89058e665d02e64a…`, 48779 bytes) — audit what ships, not localhost (§3).

| Measure | Value |
|---|---|
| Rules executed | 96 |
| Violations | **0** in all 10 runs |
| `target-size` | **7 pass** default / **1 pass** modal-open, 0 violations |
| JS exceptions | **0** |
| Horizontal scroll | none, at any viewport, in either state |

## Accessibility tree

At 1440×900 via `Accessibility.getFullAXTree` (unignored nodes only).

| Measure | Default | Modal open |
|---|---|---|
| Nodes | 81 | **20** |
| Named | 62 | 18 |
| **Unnamed interactive / graphic** | **0** | **0** |
| Duplicate role+name | 0 | 0 |
| Real Tab stops | 7, then out of the document | **2** |

**81 → 20 nodes is the interesting figure.** `inert` on `#topbar` and `#nala-main` removes the
background from the accessibility tree, not just the focus order: before it, the same measurement read
103 nodes. Hence row 11 passing by ear (§9.1).

> **Do not count focusable elements with a DOM query when `inert` is in play.**
> `querySelectorAll(...).filter(el => el.tabIndex >= 0 && el.offsetParent !== null)` returns **9**
> with the modal open, because neither `tabIndex` nor `offsetParent` reflects `inert`. Driving real
> `Tab` keys returns **2**. The DOM query is the wrong instrument here.

> No unnamed node has ever been exposed here — every inline `<svg>` already carried
> `aria-hidden="true"` or a name, including the modal's close glyph.

## WAVE — real engine, live public URL

Against `https://yikcunchung.github.io/vw-nala-prototype/` at commit `4304d62`, re-run after every
change to `index.html`.

| Errors | Contrast errors | Alerts | Features | Structure | ARIA | AIM score |
|---|---|---|---|---|---|---|
| **0** | **0** | 1 | 4 | 4 | 33 | **10 / 10** |

The document title was read back out of WAVE's own report ("WAVE Report of Volkswagen NaLa") to
confirm the real page was analysed. **1 ARIA popup** and **1 Heading level 2** — the dialog's
`aria-haspopup` and its `h2` — show the modal markup is in what WAVE parsed, though it cannot open it.
**The 1 alert is "Possible heading"**, on the **result digits**, not the *Estimated range* label
(§9.2); not a defect. **Default state only:** the modal is covered by the axe and keyboard runs.

## Nu HTML validator — 0 errors

SC 4.1.1 Parsing: obsolete in WCAG 2.2, normative under EN 301 549 (clause 9.4.1.1), so kept.

## Contrast

**SC 1.4.11 corrected 2026-08-30, no longer inherited.** The `<select>` border was
`--border-input: rgb(161,164,172)` (`#a1a4ac`), which measured **2.29:1** against the cream page background
`rgba(246,245,242,1)`; SC 1.4.11 requires **3:1** for a control's visual boundary. **The value is the
VW core component library's, not this prototype's** — raised upstream, not patched locally. **No axe
rule covers it** (§9.3).

**Text contrast — all pass**, measured on composited pixels:

| Pair | Ratio | Threshold | Result |
|---|---|---|---|
| Modal body `#1b2236` on white | 15.81:1 | 4.5:1 | pass |
| Consumption `rgb(208,209,213)` on navy `#1b2236` | 10.36:1 | 4.5:1 | pass |
| Chevron glyph `#293043` on cream | 12.05:1 | 3:1 | pass |
| Focus ring `#C86C03` on cream | 3.44:1 | 3:1 | pass |
| Focus ring `#C86C03` on navy | 4.22:1 | 3:1 | pass |
| Focus ring `#C86C03` on modal white | 3.75:1 | 3:1 | pass |
| **Select border `rgb(110,116,126)` on cream** (corrected 2026-08-30, was `rgb(161,164,172)`) | **4.32:1** | **3:1** | **pass** |

**One `color-contrast` incomplete, resolved by hand.** Modal-open at ≥390px,
`#nala-range-modal-body`: "background color could not be determined because it partially overlaps
other elements" — geometric, since full-width regions sit behind the `position: fixed` overlay. The
real composited value is navy on white, **15.81:1 — PASS**. An explicit `background-color` and
reparenting the backdrop as a sibling both failed to clear it: an axe limitation, not a defect.

## Orientation and text spacing

**SC 1.3.4 Orientation — pass.** No `@media (orientation:)` rule exists anywhere in the app.

**SC 1.4.12 Text Spacing — pass.** With all four overrides (`line-height:1.5`,
`letter-spacing:0.12em`, `word-spacing:0.16em`, `p margin-bottom:2em`) at 1440 / 390 / 320: **no newly
clipped element, no control lost, no horizontal scroll.**

> **Detector validated.** A canary that fits at the default line-height and overflows only at 1.5 was
> injected and *was* detected. A first canary was already clipped before the override and proved
> nothing — "no new clipping" is worthless unless you have watched the detector fire.

---

# 3. Validate the harness before trusting a zero

Every axe detector was re-run against the page with that defect injected:

| Injected defect | Rule | Fired |
|---|---|---|
| `<button>` with no accessible name | `button-name` | ✅ |
| `<img>` with no `alt` | `image-alt` | ✅ |
| Text at ~1.2:1 | `color-contrast` | ✅ |
| Two elements sharing an `id` | `duplicate-id` | ✅ |
| `<input>` with no label | `label` | ✅ |
| `<a href>` with no text | `link-name` | ✅ |
| Two adjacent 12×12 buttons | `target-size` | ✅ |

**`target-size` first appeared to miss — the harness's fault.** The canaries sat at `position:fixed;
top:0; left:0`, under the sticky topbar, so axe treated them as obscured, and only `violations` was
read. In normal flow the rule fires on both nodes. Traps 1 and 2.

---

# 4. Ten traps that produce a confident false pass

**1 · Bare `axe.run()` is not every rule.** Nine rules are `enabled:false` by default in axe-core
4.13.0: **`target-size`** (SC 2.5.8), `aria-roledescription`, `color-contrast-enhanced`,
`duplicate-id`, `duplicate-id-active`, `identical-links-same-purpose`,
`landmark-complementary-is-top-level`, `meta-refresh-no-exceptions`, `audio-caption`. A stock run
reports "0 violations" **without ever having tested target size**. Force-enable them, confirm the rule
lands in `passes`, and check `axe._audit.rules.filter(r => !r.enabled)`.

**2 · `violations` is not the whole result.** `incomplete` is the "needs review" bucket a BITV or
EN 301 549 tester resolves by hand, and where an *obscured* element lands: an undersized target can be
absent from `violations` because axe could not decide.

**3 · `runOnly: {type:'tag'}` is not "all rules"** — a tag filter silently skips every rule without
one of those tags.

**4 · 400% zoom is `deviceScaleFactor: 4`.** `320×256 @ dsf 1` is a small screen, a different test
from the one 1.4.4 asks for.

**5 · WAVE reads stale counts.** Poll until the icon counts go **stable**, not until
`wave.report.iconlist` exists; reading early returns the *previous* page's numbers. And
`iconlist.error` is `{description, count, items}`, not a map — summing it as a map yields a false
all-zero pass.

**6 · `Page.captureScreenshot` clip is document-absolute**, `getBoundingClientRect()`
viewport-relative; mixing them photographs a blank region scoring exactly `1.00:1` with one unique
colour. **Exactly 1.00 means the clip missed, not that contrast failed.**

**7 · Anti-aliasing is not the background, and neither is a border.** The *worst* minority colour in a
text crop reports white-on-dark text as a failure — it has found the border. Crop to the **glyph
band** (union of `Range.getClientRects()`), or the padding box for a `<select>`, and use the
**dominant** background.

**8 · A `<select>`'s options are not its label.** Concatenated `<option>` text compared against the
accessible name manufactures SC 2.5.3 failures that do not exist. Compare the associated `<label>`.

**9 · `Network.setCacheDisabled` is a no-op unless `Network.enable` was called first** — re-auditing
then re-measures the *old* page and reports the defect as unfixed. Enable the domain, or append a
cache-buster.

**10 · axe is blind to unnamed inline SVGs.** `svg-img-alt` and `role-img-alt` return
**`inapplicable`** for an `<svg>` with no `role`, and `image-alt` only inspects `<img>`: a page can
expose any number of unnamed graphics and still score 0 violations. **Read `role=image` nodes off the
AX tree and assert 0 unnamed** — how every unnamed-graphic failure in this *suite* was found, none
seen by axe, WAVE or Nu. **This app has never had one** (§2); the check is what proves that.

---

# 5. What automation will never close

**Screen-reader output is no longer untested — and the first run proved the point.** VoiceOver found
`#nala-value` unreachable (§9.1) while **axe at 96 rules, WAVE and Nu all passed it** across ten runs.

**NVDA remains untested**, and NVDA, JAWS and VoiceOver differ in what they *announce*.

**A name can be present, unique, and wrong.** Every automated check here passes on a control labelled
"button".

**SC 2.5.3 Label in Name has no axe rule.** Checked by hand — see `a11y-1-criteria.md`.

# 6. Manual testing — what to do

**All three have now been run — results in §9. NVDA remains outstanding** — §1.

**The reusable procedure (Step 0, VoiceOver/WAVE/axe DevTools runs, sign-off checklist) now lives
centrally** in `../audit-evidence/manual-testing-guide.md` — it's identical across all five sibling
apps, so it's maintained once there instead of copied per app. What follows here is only what's
specific to nala.

## App-specific Step 0

- **Live** — `https://yikcunchung.github.io/vw-nala-prototype/`. Freshness check:
  `curl -s <url> | grep -c 'nala-range-modal'` → expect **≥ 4**.
- **Local** — `python3 -m http.server 7810` → `http://127.0.0.1:7810/nala/index.html`.
- **Nothing here lazy-builds** — no `IntersectionObserver` gate, no injected controls; the sentence
  and all four selects are in the served HTML. No scroll-and-wait step.
- **Confirm on screen: four dropdowns in the sentence, one ⓘ button, one "Learn more" button.**

## App-specific notes for the central procedure's Run 1 (VoiceOver)

- Note each utterance against the visible label box, not just the sentence — the SC 2.5.3 evidence.
  The name **is** the visible label now, for all four dropdowns.
- The dialog trigger is the ⓘ button (`Enter` or `Space` both open it); close via `Escape`, the ×
  button, and clicking the dimmed area outside the panel — check all three return focus to the ⓘ
  button, re-announced.
- `VO+U` sweep: **Form Controls**, then switch the rotor to **Landmarks**.

## App-specific notes for the central procedure's Run 2 (WAVE)

- The hosted run is in §2 and is valid here — no lazy-build. The extension adds the **modal-open
  state**: turn WAVE off, open the ⓘ modal, turn WAVE on again, read the three counts again.
- WAVE may report contrast on `#nala-live` or the `.sr-only` tail inside "Learn more" — both are
  clipped, never rendered (`#nala-live` is explicitly `color: #fff`), so this is the standard
  `.sr-only` artifact, not a real defect.
- **Expect 1 alert, "Possible heading"** on the result digits — large bold standalone text that's
  actually a calculated, changing value. Not a defect; do not "fix" it into an `<h3>`.

## App-specific notes for the central procedure's Run 3 (axe DevTools)

- Protocol baseline: **4.131.2** — record any deviation.
- Scan **all of my page**, then open the ⓘ modal and scan again.
- **What axe cannot tell you here, at any version:** whether a manually-verified color value like the select border (§2) is correct — axe ships no rule for SC 1.4.11 at all.

---

# 7. Verification checklist

Tick only what you observed against the central sign-off checklist. **An untested box is not a
pass.** Where §9 has recorded an answer, the reasoning lives there.

## Run 1 — VoiceOver

- [ ] **Walking the dropdowns** — all four: **pop-up button**, with a name *and* a value.
- [ ] **Dropdown names** read as sentence fragments, not word salad:

      | Control | Expected name | Expected value |
      |---|---|---|
      | `#select-veh` | "Model: ID.7" | "Pro Match 286 PS" |
      | `#select-env` | "Road type" | "in the city" |
      | `#select-wea` | "Weather" | "warm" |
      | `#select-occ` | "Occupancy" | "alone" |

- [ ] **Name stability.** Change all four values, Tab back: **every name unchanged except
      the family half of `#select-veh`'s** ("Model: ID.7" -> "Model: ID.4" if a second family is
      ever added — "Model:" itself must never move).
- [ ] **SC 2.5.3.** Each name **is** its visible label, not merely echoing nearby prose.
      Confirm all four read the label box itself, not the surrounding sentence; see
      `a11y-1-criteria.md` for the pass rationale.
- [ ] **The link-out.** `#nala-cta` is an `<a href>`: announced as a **link**, name carrying
      destination and new-tab warning, opening `volkswagen.co.uk` in a new tab.
- [ ] **Result panel order** — expected:

      ```
      "Estimated range"                   ← visible label
      "More information …, button"        ← the ⓘ
      "600 km"                            ← the value itself
      ```

      **`#nala-live` is empty at rest**, so *"Estimated range"* once, not twice.
- [ ] **On value change** — exactly **one** announcement per change ("Estimated range 595 kilometres."), focus
      stays on the dropdown, count-up **never** read digit by digit.
- [ ] **On modal open** — *"Estimated range, dialog"* **then the full explanatory paragraph.** The paragraph
      **twice** would mean an `aria-describedby` has been added (`a11y-3`, SC 4.1.2, 2.4.3).
- [ ] **Focus trap** — the virtual cursor must **never** reach the page behind the dialog. If it escapes,
      record **which reader and which key**.
- [ ] **On modal close** — Escape, × and click-outside all close the dialog **and** return focus to the ⓘ
      button, re-announced.
- [ ] **Rotor sweep** — Form Controls lists the four dropdowns, `#nala-info-btn` and `#nala-cta`; the
      modal's Close button must NOT appear, being inside the `hidden` overlay. Landmarks lists a banner
      and a main.

## Run 2 — WAVE

- [ ] Default state matches the hosted figures in §2: **0 errors, 0 contrast errors, 1 alert**.
- [ ] The single alert is **"Possible heading"** on the *result digits*. Not a defect.
- [ ] Modal-open state introduces **no new errors**.
- [ ] Any `.sr-only` contrast report is dismissed as the known 1×1-clip artifact.

## Run 3 — axe DevTools

- [ ] The standard selector reads **WCAG 2.2 AA**, not 2.1.
- [ ] `target-size` is confirmed **enabled** and appears in the results.
- [ ] Default state: **0 violations**. Modal-open state: **0 violations**.
- [ ] Extension version recorded, and any deviation from 4.131.2 noted.
- [ ] It is recorded that this run **does not** cover SC 1.4.11 (axe has no rule for it) — verify the select border by hand instead.

## Recording the result

**Write down the actual utterances and counts, not a pass/fail.** A tick against "announces correctly"
is not evidence a BITV auditor can use; the transcript is.

---

# 8. Re-running the automated suite

Identical across all five sibling apps — see `../audit-evidence/manual-testing-guide.md` for the
CDP re-run script (serve locally, drive headless Chrome over the CDP protocol, run axe/AX-tree/
reflow/text-spacing/WAVE checks, diff local against live). Substitute this app's own port (`7810`)
and live URL where the script needs them.

**Automate the structural half in CI, but do not mistake it for the whole.** A structural-only suite is
exactly what scores clean on a build with a Level A naming failure.

---

# 9. Manual run results

The runs from §6, graded against §7. **An empty row is not a pass.**

## 9.1 Screen reader — VoiceOver — ✅ COMPLETE (15 of 15 rows)

**VoiceOver, macOS 26.5.2 (25F84), Chrome and Safari**, against the live deployment. Steps 1–3 run at
`b59ee16`; step 4 re-run at `7e69034` after the fix it produced. Window size not recorded. **Safari is
the record; Chrome the second opinion, and it disagreed once — row 5.** All 11 protocol steps driven.
**One real defect that every tool passed** (row 6), and two decisions settled (rows 10 and 7).

> **One retraction, kept on the record.** Row 13 was first logged as a second defect — the link's
> destination and new-tab warning appearing unspoken — and a `.sr-only`-versus-`aria-label` fix was
> committed on the strength of it. **It was wrong: the observation came from a stale local copy, not
> the live deployment.** On live, VoiceOver reads the whole appended string, so **`.sr-only` does work
> for accessible names.** The code was reverted and a general "`.sr-only` cannot carry a name" trap was
> deleted from §4. The tell was already in hand and went unreconciled: the live AX tree had been
> measured with the full name present. **When a reported utterance contradicts a measured tree,
> establish which build was under test before concluding anything.**

**What it does not close:** NVDA — §9.4. A VoiceOver pass is a documented deviation, not a substitute.

| # | Item | Heard | Verdict |
|---|---|---|---|
| 1 | Each of the four dropdowns announced as a pop-up button with **name *and* value** | Both, on all four | ✅ |
| 2 | The four names as expected — *my car model variant · driving location · weather condition · travelling* | As expected | ✅ |
| 3 | Tab order: skip link → 4 dropdowns → ⓘ → Learn more → out | As expected | ✅ |
| 4 | **Name stability** — names unchanged after changing all four values | Names identical, only values changed | ✅ |
| 5 | **The result panel, browsed** | **Chrome: neither the label nor the number announced — only the ⓘ button and the Learn more link.** Safari: both announced | ⚠️ see below |
| 6 | The visible number reachable at all | **Was `aria-hidden` — absent from the tree in every browser.** After the fix, Safari announces *"600 km"* | ✅ **fixed** |
| 7 | Does *"Estimated range"* come **twice**? | No. Once. The duplication this row was written to catch no longer exists | ✅ |
| 8 | Live region on change — **how many announcements**, and is the count-up silent? | The select's own new value first, then *"estimated range x km"*. **No digit-by-digit count-up** | ✅ |
| 9 | ⓘ with **Enter**, then with **Space** — does the modal open both ways? | Both | ✅ |
| 10 | **On open: is the full paragraph announced, or skipped?** | **The whole paragraph is announced.** The `h2` headline is **not** | ✅ / see below |
| 11 | **Can `VO`+arrow escape the dialog?** (≥ 8 presses) | No. Cycles between the paragraph and Close only | ✅ |
| 12 | Escape / × / click-outside — all three close **and** re-announce the ⓘ button | All three return focus to the ⓘ button | ✅ |
| 13 | "Learn more" announced as a **link**, with destination and new-tab warning | *"link, Learn more about range on volkswagen.co.uk, opens in a new tab"* — full name read | ✅ |
| 14 | Rotor → Form Controls: 4 dropdowns + 1 button + 1 link, no blank, no duplicate | The focusable set is listed | ✅ |
| 15 | Rotor → Landmarks: banner + main present | banner and main | ✅ |

All 15 rows evidenced. Answers are **paraphrase, not verbatim transcript** — the Caption Panel was not
enabled. Enough to settle every decision below; not a substitute for a transcript if a formal audit
asks.

### What rows 5–7 settled

**Row 6 was a genuine defect, and only a screen reader could have found it.** `#nala-value` — the
visible `600 km` — carried `aria-hidden="true"`, so the number was absent from the accessibility tree
in **every** browser; the only readable copy was a 1×1 clipped `aria-live` region, which interrupts on
change rather than being browsed. **axe at 96 rules, WAVE and Nu all passed it**, ten runs, 0
violations. Fixed in `7e69034`: the value is no longer hidden, the live region empty at rest and
populated only transiently. Confirmed by ear.

**Row 5 is a browser-pairing limitation, not a code defect.** In Chrome, VoiceOver announced only the
ⓘ button and the Learn more link, skipping the static label and number; in Safari both are announced.
The label is a normal 124×19 visible unclipped node, present and unignored in **Chrome's own** AX tree,
so this is VoiceOver's consumption of the tree, not the tree. **VoiceOver is designed for Safari.**

> **Rejected: making the label and number focusable** — junk stops for keyboard users, and it would
> mask a browser gap as a markup problem. `#label-wheel` in the Visualizer's pack is the
> counter-example: plain text, skipped by Tab, **announced by the VO cursor**.

### Row 10 — the dialog headline, a recorded trade-off

**The paragraph is announced and the `h2` is not**, because initial focus is placed on the paragraph.
Deliberate, and **must not be "fixed" by moving focus to the dialog container** — the placement cannot
satisfy both:

| Focus lands on | Headline | Paragraph |
|---|---|---|
| The dialog container | announced | **skipped** — exactly the Visualizer's recorded defect |
| **The paragraph** (current) | skipped | **fully announced** |

Content wins: the dialog exists to deliver that paragraph. Nothing fails SC 4.1.2 — it *is* named via
`aria-labelledby` → the `h2`; VoiceOver just does not speak the boundary when focus starts on a child.
The user arrives via a button named *"More information about the estimated range"*, and the `h2` still
serves sighted users.

**`aria-describedby` was rejected, not overlooked:** the canonical way to get both, but that paragraph
is 945 characters and long description text is known to be truncated or dropped by some readers. If
revisited, A/B it **by ear**.

**Row 10 is the defect the Visualizer's run caught:** there, focus went to the close button *after* the
text, so the content was never announced and no tool reported it. Row 10 confirms nala's body-copy
placement works in speech, not just in the tree.

## 9.2 WAVE — ✅ COMPLETE (hosted + extension, both states)

**Hosted engine** (`wave.webaim.org/report#/<url>`), against live, re-run after every change to
`index.html`:

| Measure | Result |
|---|---|
| Errors | **0** |
| Contrast errors | **0** |
| Alerts | 1 — *"Possible heading"* |
| Features | 4 — alt text, skip link, skip-link target, language |
| Structural elements | 4 — h1, h2, header, main |
| ARIA | 33 — incl. **1 ARIA popup**, **1 alert/live region**, 15 `aria-hidden` |
| AIM score | **10 / 10** |

**Admissible here, unlike on the Visualizer**, which lazy-builds behind an `IntersectionObserver` so
the hosted service analysed an unbuilt shell. **nala has no lazy-build**, so the hosted engine saw the
real page — confirmed by the report's document title and by **1 ARIA popup / 1 Heading level 2** in its
ARIA census (the dialog's `aria-haspopup` and its `h2`).

**The 1 alert is not a defect.** *"Possible heading — Text appears to be a heading but is not a heading
element"* fires on **the result digits** (`#nala-value`, e.g. *600 km*), rendering at 44–56px in VW
Head Bold and standalone. **Leave it:** a calculated output that changes on every interaction, so an
`<h3>` would put a continuously mutating heading in the document outline.

> **Two corrections on the record.** (1) This doc previously said the alert fired on the *"Estimated
> range"* label — an **inference from the hosted count, never verified**; the extension run established
> it is the digits. (2) The alert most likely **moved** here as a side effect of `7e69034`: before that
> commit `#nala-value` carried `aria-hidden="true"` and WAVE would have skipped it. A consequence of
> the fix, not a regression.

### Extension run — the modal-open state

**WAVE browser extension, against live, run twice: default and with the ⓘ dialog open** — the half a
URL-based service cannot reach.

| State | Errors | Contrast errors | Alerts |
|---|---|---|---|
| Default | **0** | **0** | 1 — *Possible heading* on the result digits |
| **Modal open** | **0** | **0** | 1 — unchanged |

**The dialog introduces nothing.** Identical counts: the `h2` is a real heading so it draws no
"possible heading" alert, the body copy is plain text, and the alert persists because the result panel
still renders behind the overlay.

**The anticipated `.sr-only` contrast artifact did not appear.** WAVE does not treat a 1×1 clip as
hidden and was expected to flag `#nala-live`; it did not. `#nala-live { color: #fff }` holds up.

## 9.3 axe DevTools — ✅ COMPLETE (UI run + CDP run agree)

| Scan | Result |
|---|---|
| axe-core 4.13.0 over CDP, **96 rules**, 5 viewports × 2 states, live | **0 violations**, 0 JS exceptions |
| `target-size` (SC 2.5.8) force-enabled | **7 pass** default / **1 pass** modal-open, 0 violations |
| `color-contrast` incomplete | 1, modal-open at ≥390px — resolved by hand to **15.81:1 PASS** |

### UI run

**axe DevTools extension, against live, standard set to WCAG 2.2 AA.**

| Scan | Result |
|---|---|
| Automatic, **WCAG 2.2 AA**, whole page | **0 issues** |
| Automatic, **WCAG 2.2 AA**, dialog open | **0 issues** |
| Intelligent Guided Test — **Interactive Elements** | **Run — no issues.** Covers target size in this build |
| Other guided tests | Not run |

**Setting the standard to 2.2 is what makes this run mean anything.** The extension can default to
**2.1 AA**, which excludes every criterion 2.2 added; `target-size` carries a `wcag22aa` tag, so a
clean 2.1 result says nothing about SC 2.5.8. It was set to 2.2 here.

> **Where target size is actually tested.** **Interactive Elements covers it** in current builds, per
> axe DevTools' own testing guide — there is no separate numbered target-size guided test. §6 Run 3
> previously said otherwise, copied from the Visualizer's pack; corrected.

**Version deviation:** the protocol names **4.131.2**; the installed build was not recorded. Rule sets
only grow, so a newer build passing is at least as strong, but the exact version should be captured if
a formal audit asks. **The UI and CDP runs agree.**

**What no axe version can close, at 2.1 or 2.2:** `color-contrast` implements **SC 1.4.3 (text) only**
and axe-core ships **no rule for SC 1.4.11 non-text contrast**. The select border now measures
**4.32:1** (corrected 2026-08-30) and would pass a hand-check either way, but axe itself never runs
that check — every axe run, CDP or UI, is silent on it regardless of the actual color. See §2.

## 9.4 NVDA — ❌ not done

**NVDA 2026.1.1.55980** is named by the protocol and has not been run; it needs Windows. VoiceOver was
run instead and is a **documented deviation, not a substitute** — a formal BITV / EN 301 549 audit
naming NVDA will not accept VoiceOver evidence for that line item. §1 has the reasoning.

---

# 10. The claim this evidence supports

> *"This app meets WCAG 2.2 A/AA on **every check the protocol names except NVDA** — axe both over
> CDP at 96 rules and through the DevTools UI at WCAG 2.2 AA, WAVE hosted and by extension in both
> states, the accessibility tree, real key events, literal 400% zoom, and a **VoiceOver pass on
> Safari** — all against the live deployment, with **NVDA still outstanding**."*

**What it must not say: "fully compliant."** One reason:

1. **Only one screen reader has been run** — VoiceOver on Safari, §9.1, where the protocol names
   **NVDA**. It was paraphrase, not a captured transcript, and mixed local with live, which produced
   one false finding (retracted, §9.1 row 13).

**Not a third reason:** the 2.4.4 "Learn more" link text (a `.sr-only` tail appended to the visible
label) was previously flagged here as "a reading an auditor may reject." That flag was wrong: hiding
a portion of link text with CSS to supplement its purpose is **[C7](https://www.w3.org/WAI/WCAG22/Techniques/css/C7)**,
one of the W3C's own named sufficient techniques for SC 2.4.4, and VoiceOver confirmed the full name
is announced (§9.1 row 13). Corrected in `a11y-1-criteria.md`; this is a closed pass, not an open
decision.

**Tool-clean is not compliant:** the one defect that shipped here (`aria-hidden` on the result value,
§9.1 row 6) was passed by axe at 96 rules, WAVE and Nu alike.
