# Dev spec — AI Composer input placeholder animation

**Component:** AI Composer message input (`Ask the composer to change anything`)
**Status:** Spec for production. Prototype reference: `app.js` → *animated input placeholder (typewriter nudges)*.
**Owner:** Design (Aleksandra) · **Implements in:** dashboard-frontend-monorepo (Angular)

---

## 1. Purpose

The empty composer input animates its **placeholder** through a rotating set of example
prompts, typed out one character at a time. It teaches users what they can say to the
Composer without adding any persistent chrome, and keeps an idle panel feeling alive.

It is a **hint only**. It must never interfere with typing, never submit anything, and
never be mistaken for real input.

---

## 2. Behaviour at a glance

```
base string shown → type nudge 1 → hold → clear → type nudge 2 → hold → … → loop
        ▲                                                                      │
        └──────────────────────  user focuses / types  ◄──────────────────────┘
                                  (animation stops)
```

The animation drives **only** the native `placeholder` attribute. No extra DOM nodes,
no overlay, no contenteditable.

---

## 3. States

| State | Trigger | Placeholder behaviour |
|---|---|---|
| **Idle / animating** | Input empty **and** not focused | Cycles through the nudge list, typing char-by-char with a trailing cursor. |
| **Focused** | Input receives focus (still empty) | Animation **pauses**. Show the base string (`Ask the composer to change anything`). Resume on blur if still empty. |
| **Has value** | Input contains any text | Animation stops immediately. `placeholder` is irrelevant (hidden by the browser). On clear + blur, animation resumes from the base string. |
| **Disabled / sending** | A request is in flight | Animation paused; placeholder static or empty per the disabled input style. |
| **Reduced motion** | `prefers-reduced-motion: reduce` | **No typing animation.** Show the base string statically. Optional: rotate the *full* strings on a slow fade every ~4 s, but never per-character. |

Focus and reduced-motion are the two behaviours to implement for production — see
§9 Prototype parity.

---

## 4. Timing

Single interval tick drives the whole thing. All timing derives from the tick.

| Token | Value | Notes |
|---|---|---|
| `TICK` | **45 ms** | Master interval. One character is revealed per tick while typing. |
| Type speed | ~**45 ms/char** (≈22 chars/s) | = 1 char per tick. |
| `HOLD` | **28 ticks ≈ 1 260 ms** | Dwell on the fully-typed string before advancing. |
| Clear | **instant** | On advance, the string resets to empty and the next one types in from char 0. No backspace animation. |
| Loop | continuous | After the last nudge, wrap to index 0. |
| Cursor blink | none (steady) | The cursor glyph is shown only while typing (see §6). |

**Full cycle per nudge** = `(chars × 45 ms) + 1 260 ms`. Example: a 30-char string ≈
`1 350 + 1 260 = 2 610 ms` on screen.

> Backspace-to-clear is intentionally **not** used — it doubles cycle time and reads as
> fussy. If product wants it later, add a `DELETE` phase at ~25 ms/char.

---

## 5. Content — the nudge strings

Ordered list. First entry is the **base string** and is also the resting/focus/reduced-motion
placeholder.

```
0  Ask the composer to change anything      ← base
1  Try “add Polish as a language”
2  Try “make the greeting warmer”
3  Try “remove the Extract Data skill”
4  Try “rename Tessa to Emma”
5  Try “run a configuration audit”
```

**Authoring rules**
- Index 0 is the generic base; indexes 1+ are concrete, each starting `Try “…”`.
- Use curly quotes `“ ”`, not straight quotes.
- One capability per nudge; mirror real, working Composer commands.
- Keep each ≤ ~34 characters so it fits the input at the narrowest panel width (452 px) without clipping.
- Localise the strings; do **not** localise by translating mid-animation — swap the whole set per locale.

---

## 6. Cursor

- Glyph: `▏` (U+258F, left one-eighth block) appended to the currently-typed substring.
- Shown **only during the typing phase**; removed during `HOLD`.
- It is literal text inside the `placeholder`, inheriting the placeholder colour
  (`--text-placeholder`). No separate element, no CSS caret.

---

## 7. Accessibility

- **Reduced motion is mandatory.** When `prefers-reduced-motion: reduce`, do not animate;
  render the base string statically. Gate the interval on a `matchMedia` check and
  re-evaluate on change.
- **Screen readers:** the animated `placeholder` must not be announced on every tick.
  Keep a **stable `aria-label`** on the input (`"Ask the composer to change anything"`)
  so assistive tech reads a fixed label regardless of the visible placeholder churn.
- Placeholder text is a hint, never the accessible name — the `aria-label` above covers that.
- Contrast: placeholder colour must meet the same ratio requirement as any hint text.

---

## 8. Edge cases

| Case | Required behaviour |
|---|---|
| User types then clears the field | Resume from the **base string**, not mid-nudge. |
| User focuses an empty field | Pause; show base string. Resume on blur. |
| Panel resized narrow | Strings already capped at ~34 chars; no ellipsis logic needed. |
| Tab backgrounded | `setInterval` throttles naturally; on return, continue — no catch-up burst. Acceptable. |
| Component destroyed | **Clear the interval** on teardown (`ngOnDestroy`). No dangling timers. |
| RTL locale | Typing still reveals left-to-right by string index; cursor sits at the logical end. Verify glyph placement per locale. |

---

## 9. Prototype parity

The prototype (`app.js`) implements the core loop but **omits two production behaviours** —
implement these when porting:

1. **Focus pause** — prototype keeps animating while an empty input is focused; production
   must pause and show the base string on focus.
2. **`prefers-reduced-motion`** — prototype always animates; production must respect the
   media query.

Everything else (timings, content, cursor, `input.value` guard) matches this spec.

---

## 10. Reference implementation

### Prototype (vanilla JS, current)

```js
const PLACEHOLDERS = [
  "Ask the composer to change anything",
  "Try “add Polish as a language”",
  "Try “make the greeting warmer”",
  "Try “remove the Extract Data skill”",
  "Try “rename Tessa to Emma”",
  "Try “run a configuration audit”",
];
let phIndex = 0, phTick = 0;
const TICK = 45, HOLD = 28;
setInterval(() => {
  if (input.value) return;                 // guard: never animate over real input
  const cur = PLACEHOLDERS[phIndex];
  phTick++;
  if (phTick >= cur.length + HOLD) { phIndex = (phIndex + 1) % PLACEHOLDERS.length; phTick = 0; }
  const shown = cur.slice(0, Math.min(phTick, cur.length));
  input.placeholder = shown + (phTick < cur.length ? "▏" : "");
}, TICK);
```

### Production shape (Angular, spec-complete)

```ts
private tick = 0;
private idx = 0;
private timer?: number;
private readonly TICK = 45;
private readonly HOLD = 28;
private readonly NUDGES = [/* strings from §5 */];

ngAfterViewInit() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) { this.placeholder = this.NUDGES[0]; return; }
  this.timer = window.setInterval(() => this.step(), this.TICK);
}

private step() {
  if (this.value || this.focused) {          // guard: real input OR focused
    this.placeholder = this.NUDGES[0];
    this.tick = 0; this.idx = 0;
    return;
  }
  const cur = this.NUDGES[this.idx];
  this.tick++;
  if (this.tick >= cur.length + this.HOLD) { this.idx = (this.idx + 1) % this.NUDGES.length; this.tick = 0; }
  const shown = cur.slice(0, Math.min(this.tick, cur.length));
  this.placeholder = shown + (this.tick < cur.length ? '▏' : '');
}

ngOnDestroy() { if (this.timer) clearInterval(this.timer); }
```

---

## 11. QA checklist

- [ ] Empty, unfocused input cycles all nudges in order and loops.
- [ ] Typing 1 char stops the animation instantly; no flicker behind the text.
- [ ] Clearing + blurring resumes from the **base** string (index 0).
- [ ] Focusing an empty input pauses and shows the base string; blur resumes.
- [ ] `prefers-reduced-motion: reduce` → static base string, no per-char animation.
- [ ] Screen reader announces a stable label, not the churning placeholder.
- [ ] No console errors; interval cleared on component teardown (no leak).
- [ ] Longest nudge does not clip at the 452 px panel width.
- [ ] Cursor glyph appears only while typing, gone during the hold.
