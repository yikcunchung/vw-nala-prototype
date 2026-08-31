# VW NaLa — accessibility reference build

A working, WCAG 2.2 AA reference build of the NaLa feature app. **It is a behavioural
specification, not source to copy.** About half of what matters here lives in JavaScript.

**Live:** https://yikcunchung.github.io/vw-nala-prototype/

---

## If you are the developer porting this — read this section only

You need **six things**. Everything else in this repo is evidence for auditors.

### 1. Give each dropdown a real visible label, split static from dynamic

```html
<span id="select-veh-model-static">Model: </span><span id="select-veh-family">ID.7</span>
<select id="select-veh" aria-labelledby="select-veh-model-static select-veh-family">…</select>
```

Each select is named by `aria-labelledby`, pointing at its own small visible label —
"Model:"/family, "Road type", "Weather", "Occupancy" — not a plain `aria-label` string.
Where the label has a part that changes (the vehicle family), it lives in its **own**
separate span, so the static half can never drift. This mirrors the real core Select
component's `label` + `isFloating` props: one static string, recomputed per render if
part of it needs to vary — not a hand-rewritten DOM node.

**Do not reunite the static and dynamic halves into one element.** An earlier version
pointed `aria-labelledby` at a single span whose whole text JS rewrote on every change,
so the name mutated including the part that should never move. Splitting them is what
fixes it, not avoiding `aria-labelledby` altogether.

### 2. Do not hide the result number

```html
<p id="nala-value">600 km</p>          <!-- no aria-hidden -->
```

It animates, and hiding it was the obvious way to stop a screen reader counting
"600, 599, 598…". **That hid the answer.** A screen reader only reads changing text
if it is inside a live region — so leaving it visible is already silent.

### 3. Announce changes in a live region that is empty when idle

```html
<p id="nala-live" class="sr-only" aria-live="polite" aria-atomic="true"></p>
```

```js
liveEl.textContent = 'Estimated range ' + km + ' kilometres.';
setTimeout(() => { liveEl.textContent = ''; }, 3000);   // clear, but not sooner
```

Empty when idle, or it gets read twice. Cleared after ~3s, not faster — some screen
readers drop a region that refills too quickly. And skip the very first render: page
load is not a change.

### 4. When the dialog opens, focus the **text**, not the close button

```js
modalBody.focus();        // NOT closeButton.focus()
```

A screen reader reads a dialog's *title* when it opens but not its *content*. Focus
the close button and the whole explanation is never spoken.

### 5. Add `inert` to the page behind the dialog

```js
topbar.setAttribute('inert', '');
main.setAttribute('inert', '');
// on close: remove inert BEFORE calling .focus(), or the focus call is ignored
```

A Tab handler alone is not enough — it only runs when focus is already inside.

### 6. If it looks like a control, make it work

"Learn more" was a `<button>` with no click handler. It was focusable, announced as
a button, and did nothing. Make it a real `<a href>`.

---

## How you know you are done

```bash
npm install
npm test
```

**80 tests over 4 viewports.** They encode all six rules above plus the scanner
checks. Green means you have it.

The tests are also the shortest readable spec in this repo —
[`tests/invariants.spec.js`](tests/invariants.spec.js) is ~200 lines with a comment
above each block explaining what broke and why.

> **These six exist because every one of them passed axe, WAVE and Nu while being
> wrong.** Two shipped as real defects and were found only by listening with a screen
> reader. A clean scanner run does not tell you this app works.

---

## Everything else in this repo

You do not need these to build. They exist so an auditor can verify the claim.

| File | Who it is for |
|---|---|
| [`a11y-3-implementation.md`](a11y-3-implementation.md) | The full version of the six rules, plus 17 more that are standard for any VW app (contrast, target size, reflow). Read §1–§6 if you want the reasoning. |
| [`a11y-2-automated-testing.md`](a11y-2-automated-testing.md) | What the tools prove and what they cannot, the manual test procedure, and the recorded results. For whoever re-runs the audit. |
| [`a11y-1-criteria.md`](a11y-1-criteria.md) | All 56 WCAG A/AA criteria, one row each, pass/fail. For the auditor. Look up a criterion; do not read it through. |

## A deliberate departure from the core component

The real core Select border, `rgb(161,164,172)`, is **2.29:1** against the page — below the
3:1 SC 1.4.11 floor. This build uses `rgb(110,116,126)` (**4.32:1**) instead: darker than the
core value on purpose, so the prototype demonstrates full outright compliance rather than
reproducing a known upstream contrast bug. Do not "correct" it back toward `rgb(161,164,172)`
— that direction was tried and reverted.
