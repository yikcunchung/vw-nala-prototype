# A11y 2 of 3 — What the automated tests cover, and what they cannot

**App:** VW NaLa (`nala`).
**Audited:** 2026-08-22 against the live deployment, headless Chrome 151.0.7922.174, axe-core 4.13.0
(`axe.version` read from the engine, not the bundle filename).
**Deployed at:** https://yikcunchung.github.io/vw-nala-prototype/
**Companions:** `a11y-1-criteria.md` (every criterion) · `a11y-3-implementation.md` (what to build).

The single most important sentence in this pack:

> **A clean automated run is necessary and nowhere near sufficient.** This app scores 0 axe
> violations, 0 WAVE errors and 0 HTML validity errors — and that result could not see the
> unnamed-graphic defect that the accessibility tree found, cannot test SC 2.5.3, cannot judge
> whether a name is *correct* rather than merely present, and cannot tell you what a screen reader
> actually says.

---

# 0. Scope of this evidence — read before quoting a number

This app is a **standalone page**, so `axe.run(document)` covers the whole conformance surface.
There is no component-versus-page split.

The local `index.html` and the deployed build are **byte-identical**.

---

# 1. Tool coverage at a glance

| Tool | Good for | Blind spots that matter here |
|---|---|---|
| **axe-core 4.13.0** | Structural ARIA, names, roles, contrast on solid backgrounds | **No `label-in-name` rule at all** (SC 2.5.3). **Cannot see an unnamed inline `<svg>` that has no `role`** — trap 10. Cannot see behaviour. Punts on contrast over gradients. **Nine rules are off by default, including `target-size`** — trap 1 |
| **WAVE 3.3.1.0** | A genuinely different engine; catches empty labels and sr-only contrast axe passes | Needs a public URL. Reports `.sr-only` contrast as an error even when clipped to 1×1 |
| **Nu HTML validator** | SC 4.1.1 Parsing, still normative under EN 301 549 | Says nothing about semantics or naming |
| **Accessibility tree (CDP)** | Ground truth for name / role / value | Exposure is not announcement — §5 |
| **Real key and pointer events** | The only way to test behaviour | Slow; assert state after every event |

## Required toolchain — coverage against it

| Required | Status | Note |
|---|---|---|
| **axe DevTools 4.131.2** | ◐ **Equivalent, not identical** | This audit ran **axe-core 4.13.0**, the library the extension embeds, over CDP with **no `runOnly` filter and all nine default-disabled rules force-enabled (96 rules)** — a superset of the extension's default scan. One run through the 4.131.2 UI is still worth doing to satisfy the protocol literally; expect agreement — §6 Run 3 |
| **WAVE Evaluation Tool 3.3.1.0** | ◐ **Hosted done, extension outstanding** | Real engine via `wave.webaim.org/report#/<url>` against the public URL: **0 errors, 0 contrast errors, AIM 10/10**. Valid here — this app does not lazy-build, so hosted WAVE saw the real page. The **extension** run remains, and is the only way to reach the **modal-open** state — §6 Run 2 |
| **Zoom 400% and 320 × 256 px** | ✅ **Done** | `320×256 @ deviceScaleFactor 4`. **dsf 1 is a small screen, not a zoomed one** |
| **Operated via the keyboard** | ✅ **Done** | Driven with real `Input.dispatchKeyEvent` |
| **NVDA 2026.1.1.55980** | ❌ **Not done** | The one real gap. Protocol in §6 Run 1, checklist in §7 |
| **PAC 26.1.0.0** | ⚪ **Not applicable** | PAC checks PDF/UA-1 (ISO 14289-1). This app ships no PDFs (`*.pdf` count: 0). If brochures or price lists are added they are a separate surface under EN 301 549 clause 10 |

### NVDA vs VoiceOver — a deviation to record

VoiceOver is planned instead of NVDA. Record that as a **deviation**, not a substitution. The two
disagree exactly where this app is interesting: a `<select>` named via `aria-labelledby`, live-region
politeness, and controls built from a visually hidden `<input>` behind a styled `<label>`. NVDA is
normally tested with Firefox or Chrome, VoiceOver with Safari, so the browser differs too. Budget an
NVDA pass before formal sign-off.

---

# 2. Results

## axe-core — 0 violations

Bare `axe.run(document)` plus all nine default-disabled rules force-enabled (**96 rules**,
axe-core 4.13.0). Viewports: 1440×900, 768×1024, 390×844, 320×256 @ dsf 1, and 320×256 @ dsf 4
(literal 400% zoom). **Each viewport run twice — default state and modal-open state** (10 runs).

**Run against the live deployment**, not a local copy, at commit `40b75d8` — and the live
`index.html` was confirmed byte-for-byte identical to source first (sha256 `0a9f6652d7815e81…`).
Auditing localhost and *reporting* it as live is the easiest way to publish a figure that does not
describe what ships; see §3.

| Measure | Value |
|---|---|
| Rules executed | 96 |
| Violations | **0** in all 10 runs |
| `target-size` | **7 pass** default / **8 pass** modal-open, 0 violations |
| JS exceptions | **0** |
| Horizontal scroll | none, at any viewport, in either state |

## Accessibility tree

Measured at 1440×900 via `Accessibility.getFullAXTree` (unignored nodes only).

| Measure | Default | Modal open |
|---|---|---|
| Nodes | 84 | 103 |
| Named | 64 | 80 |
| **Unnamed interactive / graphic** | **0** | **0** |
| Duplicate role+name | 0 | 0 |
| Focusable controls | 7 | 9 |

> No unnamed node has ever been exposed here — every inline `<svg>` already carried
> `aria-hidden="true"` or a name, including the modal's close glyph.

## WAVE — real engine, live public URL

Run against `https://yikcunchung.github.io/vw-nala-prototype/` at commit `40b75d8`, and re-run
after every subsequent change to `index.html` — an earlier run against the pre-dialog build is not
evidence for this one.

| Errors | Contrast errors | Alerts | Features | Structure | ARIA | AIM score |
|---|---|---|---|---|---|---|
| **0** | **0** | 1 | 4 | 4 | 33 | **10 / 10** |

The run was confirmed to have analysed the real page — the document title was read back out of
WAVE's own report ("WAVE Report of Volkswagen NaLa"), not assumed. WAVE also reports **1 ARIA
popup** and **1 Heading level 2**, which are the dialog's `aria-haspopup` and its `h2` title, so the
modal structure is demonstrably in what WAVE parsed even though it cannot open it.

**The 1 alert is "Possible heading"** — WAVE flags the bold standalone *Estimated range* label. It
is deliberately a label for the value readout, not a section heading. Not a defect.

**This run covers the page in its default state only.** WAVE analyses a URL, so it cannot open the
range info modal. The modal is covered by the axe runs above and by the driven keyboard tests below.

## Nu HTML validator — 0 errors

SC 4.1.1 Parsing. Obsolete in WCAG 2.2 but normative under EN 301 549 (clause 9.4.1.1), so it is
checked and kept.

## Contrast

**One SC 1.4.11 failure, inherited from the core component library.** The `<select>` border
`--border-input: rgb(161,164,172)` (`#a1a4ac`) measures **2.29:1** against the cream page background
`rgba(246,245,242,1)`. SC 1.4.11 Non-text Contrast requires **3:1** for the visual boundary of a
control. **This value comes from the VW core component library and is not owned by this prototype** —
it is recorded and raised upstream, not patched locally. Note that **axe cannot see this**: the
`color-contrast` rule implements SC 1.4.3 (text) only, and axe-core ships no rule for 1.4.11 border
contrast. A tool-clean run does not clear this criterion.

**Text contrast — all pass.** Measured on composited pixels:

| Pair | Ratio | Threshold | Result |
|---|---|---|---|
| Modal body `#1b2236` on white | 15.81:1 | 4.5:1 | pass |
| Consumption `rgb(208,209,213)` on navy `#1b2236` | 10.36:1 | 4.5:1 | pass |
| Chevron glyph `#293043` on cream | 12.05:1 | 3:1 | pass |
| Focus ring `#C86C03` on cream | 3.44:1 | 3:1 | pass |
| Focus ring `#C86C03` on navy | 4.22:1 | 3:1 | pass |
| Focus ring `#C86C03` on modal white | 3.75:1 | 3:1 | pass |
| **Select border `rgb(161,164,172)` on cream** | **2.29:1** | **3:1** | **fail (inherited)** |

**One `color-contrast` incomplete, resolved by hand.** In the modal-open state at ≥390px axe reports
1 node needing review: `#nala-range-modal-body`, with "background color could not be determined
because it partially overlaps other elements". The cause is geometric — the full-width page regions
sit behind the `position: fixed` overlay, so axe cannot trace a single background. The real
composited value is navy on white, **15.81:1 — PASS**. Setting an explicit `background-color` on the
paragraph and reparenting the backdrop as a sibling were both tried and neither clears the flag; it
is an axe limitation with fixed overlays, not a defect.

## Orientation and text spacing

**SC 1.3.4 Orientation — pass.** No `@media (orientation:)` rule exists anywhere in the app.

**SC 1.4.12 Text Spacing — pass.** With all four overrides applied (`line-height:1.5`,
`letter-spacing:0.12em`, `word-spacing:0.16em`, `p margin-bottom:2em`) at 1440 / 390 / 320:
**no newly clipped element, no control lost, no horizontal scroll.**

> **Detector validated.** A canary that fits at the default line-height and overflows only at 1.5
> was injected and *was* detected. A first canary was already clipped before the override and
> therefore proved nothing — "no new clipping" is worthless unless you have watched the detector fire.

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

**`target-size` first appeared to miss, and that was the harness's fault.** The canaries had been
injected at `position:fixed; top:0; left:0` — underneath the sticky topbar, so axe treated them as
obscured — and only `violations` was read. In normal flow the rule fires on both nodes. Traps 1 and 2.

---

# 4. Ten traps that produce a confident false pass

**1 · Bare `axe.run()` is not every rule.** Nine rules are `enabled:false` by default in axe-core
4.13.0: **`target-size`** (SC 2.5.8), `aria-roledescription`, `color-contrast-enhanced`,
`duplicate-id`, `duplicate-id-active`, `identical-links-same-purpose`,
`landmark-complementary-is-top-level`, `meta-refresh-no-exceptions`, `audio-caption`. A stock run
reports "0 violations" **without ever having tested target size**. Pass
`{rules:{'target-size':{enabled:true}, …}}` and confirm the rule appears in `passes`. Check
`axe._audit.rules.filter(r => !r.enabled)` before believing a rule ran.

**2 · `violations` is not the whole result.** `incomplete` is the "needs review" bucket a BITV or
EN 301 549 tester must resolve by hand. It is also where an *obscured* element lands — so a
genuinely undersized target can be missing from `violations` because axe could not decide, not
because it passed.

**3 · `runOnly: {type:'tag'}` is not "all rules".** A tag filter silently skips every rule without
one of those tags.

**4 · 400% zoom is `deviceScaleFactor: 4`.** `320×256 @ dsf 1` is a small screen — a different test,
and not the one 1.4.4 asks for.

**5 · WAVE reads stale counts.** Poll until the icon counts go **stable**, not until
`wave.report.iconlist` merely exists. Reading early returns the *previous* page's numbers. Also
`iconlist.error` is `{description, count, items}`, not a map — summing it as a map yields a false
all-zero clean pass.

**6 · `Page.captureScreenshot` clip is document-absolute.** `getBoundingClientRect()` is
viewport-relative. Mixing them photographs a blank region: the element scores exactly `1.00:1` with
one unique colour. **A ratio of exactly 1.00 means the clip missed, not that contrast failed.**

**7 · Anti-aliasing is not the background, and neither is a border.** Taking the *worst* minority
colour in a text crop reports white-on-dark text as a failure — it has found the element's own
border. Crop to the **glyph band** (union of `Range.getClientRects()`), or the padding box for a
`<select>`, and use the **dominant** background.

**8 · A `<select>`'s options are not its label.** Comparing concatenated `<option>` text against the
accessible name manufactures SC 2.5.3 failures that do not exist. Compare the associated `<label>`.

**9 · `Network.setCacheDisabled` is a no-op unless `Network.enable` was called first.** Re-auditing
after an edit then silently re-measures the *old* page and reports the defect as unfixed. Enable the
domain, or append a cache-busting query string.

**10 · axe is blind to unnamed inline SVGs.** `svg-img-alt` and `role-img-alt` return
**`inapplicable`** for an `<svg>` with no `role`, and `image-alt` only inspects `<img>`. A page can
expose any number of unnamed graphics and still score 0 violations. **Read `role=image` nodes off
the AX tree and assert 0 unnamed** — that is how every unnamed-graphic failure in this suite was
found, and neither axe nor WAVE nor Nu saw any of them.

---

# 5. What automation will never close

**Real screen-reader output has never been tested.** The accessibility tree confirms what is
*exposed*; NVDA, JAWS and VoiceOver differ in what they *announce*. No headless pass closes this.

**A name can be present, unique, and wrong.** Every automated check here passes on a control
labelled "button". Names must be read against what they describe.

**SC 2.5.3 Label in Name has no axe rule.** It was checked by hand — see `a11y-1-criteria.md`.

# 6. Manual testing — what to do

Three runs remain, in this order: **VoiceOver**, **WAVE extension**, **axe DevTools UI**. NVDA is a
fourth and is the one real gap (§1).

**Actions only, in the order you perform them. Do not judge anything as you go** — write down what
happened and grade it against **§7** afterwards. Judging in the moment is how "it seemed fine"
becomes evidence.

## Step 0 — before any tool, every single run

1. Decide **live or local**, and be deliberate:
   - **Live** — `https://yikcunchung.github.io/vw-nala-prototype/`. Use this if the evidence must
     describe what ships. **Verify it is current first:**
     `curl -s <url> | grep -c 'nala-range-modal'` → expect **≥ 4**. Pages lags a merge by 1–3 min.
   - **Local** — `python3 -m http.server 7810` → `http://127.0.0.1:7810/nala/index.html`. Hosted
     WAVE cannot reach localhost; the extension can.
2. **Nothing here lazy-builds.** Unlike the Visualizer, this app has no `IntersectionObserver` gate
   and no injected controls — the sentence and all four selects are in the served HTML. There is no
   scroll-and-wait step, and no risk of auditing an empty shell.
3. **Confirm on screen: four dropdowns in the sentence, one ⓘ button, one "Learn more" button.**
4. **Write down:** browser + version, OS version, window size, date, live or local.

## Run 1 — VoiceOver (macOS)

Safari first, Chrome as a second opinion. `Cmd+F5` toggles VoiceOver. `VO` = `Ctrl+Option`.
Move `VO+Right` / `VO+Left`, activate `VO+Space`, rotor `VO+U`.

Do Step 0, then — **writing down the spoken words after each action:**

1. `VO+Right` from the top until you have passed the whole sentence. Note what is said at each of
   the four dropdowns.
2. `Tab` to each dropdown in turn. Note the name **and** the value spoken.
3. On `#select-wea`, note the exact utterance — this is the SC 2.5.3 evidence.
4. Continue `VO+Right` into the dark result panel. **Note every string spoken, in order**, from the
   words "Estimated range" through to the consumption line.
5. Change any dropdown (`VO+Space`, arrow, `Return`). Note what is announced, and how many times.
6. `Tab` to the ⓘ button. Press `Enter`.
7. Note what is spoken **immediately** on open, in full.
8. Press `VO+Right` repeatedly — at least eight times.
9. Press `Escape`. Note what is spoken.
10. Reopen with `Space` instead of `Enter`. Close with the × button. Then reopen and close by
    clicking the dimmed area outside the panel. Note the spoken result each time.
11. `VO+U` → **Form Controls**, arrow the whole list. Then switch the rotor to **Landmarks**.

## Run 2 — WAVE 3.3.1.0

The hosted run is already recorded in §2 (**0 errors, 0 contrast errors, AIM 10/10**). It is valid
here — this app does not lazy-build, so hosted WAVE analysed the real page. The extension run adds
one thing the hosted service cannot do: **the modal-open state.**

1. Install the WAVE extension (Chrome or Firefox).
2. Load the page. Do **Step 0**. Click the WAVE toolbar icon. Read **Errors**, **Contrast**,
   **Alerts** — confirm they match the hosted numbers in §2.
3. **Now the part only the extension can do.** Turn WAVE off, **open the ⓘ modal**, turn WAVE on
   again. Read the three counts a second time.
4. Note the `.sr-only` nodes. WAVE does not treat a 1×1 clip as hidden and may report contrast on
   `#nala-live` or on the `.sr-only` tail inside the "Learn more" link. That is a **known artifact** —
   both are clipped, never rendered, and `#nala-live` is explicitly `color: #fff` for this reason.
   (The old `#select-veh-hint` / `#select-wea-hint` spans no longer exist — the selects now use a
   direct `aria-label`.)

> **Expect 1 alert, "Possible heading."** It is the bold *Estimated range* label. It is a label for
> the readout, not a section heading. Not a defect — do not "fix" it into an `<h3>`.

## Run 3 — axe DevTools

1. Install the axe DevTools extension. DevTools → **axe DevTools** tab.
2. **Note the version.** The protocol names **4.131.2**. A newer build is fine — rule sets only
   grow — but **record the deviation** rather than leaving a reader to find the mismatch.
3. Load the page. Do **Step 0**.
4. ⚠️ **Set the standard to WCAG 2.2 AA.** The extension may default to **2.1 AA**, which excludes
   every criterion 2.2 added — including **`target-size`, the SC 2.5.8 rule**. A clean 2.1 result is
   real and says nothing about the six new criteria. This is the single most important step here.
5. In rule settings, **enable the rules that are off by default**, `target-size` above all. If the
   UI will not confirm which rules ran, record that — do not claim 2.5.8 was covered.
6. **Scan all of my page.** Then **open the ⓘ modal and scan again.**
7. Run the **Interactive Elements** guided test, then **Test #16 Target Size**.

> **Guided-test zeros are not passes.** The Intelligent Guided Tests are semi-automated and must
> each be launched by hand. An unrun test reports "Runs: 0, Total issues: 0", and the summary rolls
> that up as "Guided Issues: 0" — which reads as a clean sheet to anyone skimming an export.

> **What axe cannot tell you here, at any version:** the **SC 1.4.11 select-border failure** in §2.
> axe's `color-contrast` rule implements SC 1.4.3 (text) only and axe-core ships **no rule for
> 1.4.11 border contrast**. A clean axe DevTools run does not clear that criterion.

---

# 7. Verification checklist

Tick only what you observed. **An untested box is not a pass.**

## Run 1 — VoiceOver

- [ ] **Step 1–2** — each of the four dropdowns is announced as a **pop-up button** with a name
      *and* a value, not one or the other.
- [ ] **Step 2** — the composed names read as sentence fragments, not word salad:

      | Control | Expected name | Expected value |
      |---|---|---|
      | `#select-veh` | "my car model variant" | "Pro Match 286 PS" |
      | `#select-env` | "driving location" | "in the city" |
      | `#select-wea` | "weather condition" | "warm" |
      | `#select-occ` | "number of people in the car" | "alone" |

- [ ] **Step 2 — name stability.** Change all four values, then Tab back through them. **Every name
      must be unchanged.** The previous `aria-labelledby` scheme failed this: `#select-veh`'s name
      contained a token JS rewrites, so the name moved with the value.
- [ ] **Step 3 — the SC 2.5.3 judgement call.** The names deliberately do **not** echo the visible
      sentence prose. Listen to a dropdown, then read the words on screen around it, and record
      whether a speech-input user looking at that sentence would plausibly say the name. This is the
      evidence for the recorded 2.5.3 decision in `a11y-1-criteria.md` — the reading being relied on
      is that the prose is *context*, not a label.
- [ ] **Step 3 — the link-out.** `#nala-cta` is an `<a href>`, not a button. Confirm it is announced
      as a **link**, that the name carries destination and the new-tab warning, and that activating
      it opens `volkswagen.co.uk` in a new tab.
- [ ] **Step 4 — the one thing most likely to need a change.** Expected order is:

      ```
      "Estimated range"                   ← visible label
      "More information …, button"        ← the ⓘ
      "Estimated range 600 kilometres."   ← the sr-only live region
      ```

      so the phrase *"Estimated range"* is spoken **twice**. The visible `600 km` is
      `aria-hidden="true"` because it animates and must not be counted out loud.
      **Record whether that reads as redundant or merely verbose.** If it needs fixing, the remedy
      is to leave `#nala-live` **empty at rest** and populate it only transiently, restoring
      `#nala-value` to a readable node. **Do not apply that blind** — it trades a browse-mode
      repetition for the risk that some readers drop a too-rapidly-repopulated region.
- [ ] **Step 5** — exactly **one** announcement per change ("Estimated range 595 kilometres."),
      focus stays on the dropdown, and the count-up is **never** read digit by digit.
- [ ] **Step 7 — the reason focus is placed where it is.** Expected: *"Estimated range, dialog"*
      **followed by the full explanatory paragraph.** Focus is put on the body copy, not the close
      button, precisely because a reader announces a dialog's *name* on open but not its *content*.
      A **skipped paragraph** is the failure this placement exists to prevent; the paragraph spoken
      **twice** would mean an `aria-describedby` has been added (see `a11y-3` invariant B8).
- [ ] **Step 8 — the check automation cannot make.** The virtual cursor must **never** reach the
      page behind the dialog. `aria-modal="true"` plus `inert` blocks *focus*, but `VO`+arrow
      navigates the AX tree directly and has historically escaped `aria-modal` containers. If it
      escapes, record **which reader and which key** — `inert` is the mitigation and is already
      applied.
- [ ] **Steps 9–10** — all three dismissals (Escape, × button, click outside) close the dialog
      **and** return focus to the ⓘ button, which is re-announced.
- [ ] **Step 11** — Form Controls lists exactly the four dropdowns and the two buttons; Landmarks
      lists a banner and a main.

## Run 2 — WAVE

- [ ] Default state matches the hosted figures in §2: **0 errors, 0 contrast errors, 1 alert**.
- [ ] The single alert is **"Possible heading"** on the *Estimated range* label. Not a defect.
- [ ] Modal-open state introduces **no new errors**.
- [ ] Any `.sr-only` contrast report is dismissed as the known 1×1-clip artifact.

## Run 3 — axe DevTools

- [ ] The standard selector reads **WCAG 2.2 AA**, not 2.1.
- [ ] `target-size` is confirmed **enabled** and appears in the results.
- [ ] Default state: **0 violations**. Modal-open state: **0 violations**.
- [ ] Extension version recorded, and any deviation from 4.131.2 noted.
- [ ] It is recorded that this run **does not** cover the SC 1.4.11 select-border failure.

## Recording the result

**Write down the actual utterances and counts, not a pass/fail.** A tick against "announces
correctly" is not evidence a BITV auditor can use; the transcript is.

---

# 8. Re-running the automated suite

```
# 1. serve the build, then drive a real browser over CDP
python3 -m http.server 7810 --bind 127.0.0.1
chrome --headless=new --remote-debugging-port=9345 --disable-gpu
#    pick the debug target by matching type == "page" AND the expected URL.
#    NEVER take the first target from /json — it is often an extension page.

# 2. Network.enable BEFORE Network.setCacheDisabled, or add ?cb=<nonce>
# 3. axe.run(document, {rules:{'target-size':{enabled:true}, ...}})
#    read violations AND incomplete; assert target-size lands in passes
# 4. AX tree: Accessibility.getFullAXTree
#      -> assert 0 role=image nodes that are unnamed and not ignored
#      -> review every duplicate role+name pair
# 5. Real keys: Input.dispatchKeyEvent, assert document.activeElement after each
# 6. Reflow: Emulation.setDeviceMetricsOverride 320x256 @ dsf 4   (= 400% zoom)
# 7. Text spacing: inject the four overrides, diff the clipped-element set,
#    and prove a canary fires before believing the result
# 8. WAVE: wave.webaim.org/report#/<public-url>, poll until counts are STABLE
# 9. Diff local against live first — audit what is actually deployed
```

**Automate the structural half in CI, but do not mistake it for the whole.** A structural-only suite
is exactly what scores clean on a build with a Level A naming failure.
