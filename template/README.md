# The family demo template — v2

The shared look of the veripublica WASM demo pages, in **one copy**. Extracted
2026-07-10 from `epubveri-wasm` and `epubsana-wasm`, whose demos were the same
hand-copied template and had already begun to drift (`.counts` was `.9rem` in
one and `.95rem` in the other — small, but that is how divergence starts).

## What changed in v2

| Change | What it means for you |
| --- | --- |
| **Severity is five values, lowercase** (#1) | ⚠️ **A demo still emitting `class="sev ERROR"` renders severities uncolored after re-copying** — see below. This is the one to check. |
| **The drop zone is keyboard-reachable** (#5) | ⚠️ It was not, since v1: `display: none` on the file input made the demo's only interaction mouse-only. Fixed in `demo.css`; **no markup change** — re-copying is the fix. |
| **A focus layer, and form controls** (#6) | Nothing to do. Focus rings appear where there were none. `select`, checkbox and radio now come styled, so a demo that needs one just writes the markup. |
| **A `data-theme` hook, and an optional toggle** (#3) | Nothing to do. Auto light/dark is unchanged; the toggle is opt-in. |
| **Chip wash 14% → 8%** (#4) | Verdict chips read slightly flatter. They now pass WCAG AA in light mode; at 14% both variants failed. |

If your demo already renders lowercase severities, re-copying `tokens.css` and
`demo.css` is the whole upgrade — and it is worth doing for #5 alone.

## Versions: there are two numbers, on purpose

- **The template version** (`v2`) is the *generation of the look*. It is what a
  consumer writes in its copy comment, and what answers "am I behind?".
- **The repository tag** (`v0.2.0`) is the *exact bytes*. A fix to
  `wasm/BUILD-PROFILE.md` moves the tag and not the template; no demo needs to
  re-copy for it.

| Template | family-web tag |
| --- | --- |
| v1 | v0.1.0 |
| v2 | v0.2.0 |

Two numbers is two things to keep in step, so the copy comment carries **both** —
one grep answers which generation a demo is on *and* which bytes it took:

```html
<!-- family-web template v2 (family-web v0.2.0) -->
```

## Files

| File | What it is |
| --- | --- |
| `tokens.css` | The design tokens (colors, light/dark, and the `data-theme` hook). Byte-identical in both demos at extraction; now canonical here. |
| `demo.css` | The page skeleton (base layer, identical at extraction) plus the family components (verdict chip, severity colors, findings table, buttons, badge base, family footer nav, theme toggle) — each promoted from the one demo that had it, so the next tool reuses instead of reinventing. |
| `skeleton.html` | The page shape. Copy, then fill every `TOOL:` comment. |
| `check-tokens.mjs` | Not copied by consumers. Fails loudly if `tokens.css`'s `@supports` floor drifts from its `light-dark()` pairs. Deleted together with the floor. |

## Consumption model: copy + version note

No build dependency, no submodule. A demo repo:

1. copies `tokens.css` and `demo.css` next to its `demo/index.html`;
2. links them and deletes the corresponding rules from its inline `<style>`,
   keeping only tool-specific rules there;
3. records the template version and the tag it came from, in a comment:
   `<!-- family-web template v2 (family-web v0.2.0) -->`.

When the template changes, family-web bumps the version in the file headers
and the consuming repos re-copy on their own schedule. The version comment is
what makes "which demos are behind?" a grep instead of an investigation.

**The one rule:** a consumer never edits its copy of `tokens.css`/`demo.css`.
If a change is worth making, it is worth making here, for everyone — that is
the entire point of the single copy. Page-local styles live in the page.

## Where does my new style go?

**You never open an issue to *use* the template. Only to *change* it.** A demo that
needs something writes it in its own `<style>` and ships today; nothing here can
block a release.

The line between what belongs in the shared files and what stays in the page:

| Stays in your page | Belongs in `demo.css` |
| --- | --- |
| **Your tool's vocabulary** — epubsana's badge tiers (`.AutoSafe`, `.ConfirmNeeded`), its fix cards; epubveri's `.id` column | **Generic UI primitives** — form controls, focus, tables, buttons, links. Nothing about them is specific to one tool. |
| **Page layout** — margins, spacing between your own sections | **Anything `conventions` names** — severity is shared *because the family spec defines the vocabulary*, not because two demos happened to want it. |

And the rule the two columns follow:

> **The design layer may run ahead of demand. The semantic layer may not.**

Generic primitives are built here *before anyone asks*, which is why `select`,
checkbox and radio already exist though no tool has used one. That is not a
violation of the family's *no value is invented for an unnamed need* — that rule
protects **contracts**, where an unused slot is a lie about what the spec means. A
styled `<select>` is not a contract; nobody has to consume it. Waiting for a named
need would only guarantee that the first tool writes its own dropdown page-local and
the second writes a different one — the exact drift this repository exists to end.
A tool's own vocabulary is the other case: there, guessing *is* inventing, and it
waits.

If you write something page-local that a sibling would plausibly want, open an issue
**and keep shipping**. The issue changes the shared file on family-web's schedule;
your release does not wait for it, and when it lands you delete your local rule.

## Adoption notes for the two existing demos

Owners decide when; here is exactly what changes visually.

**epubveri-wasm** — no visual change except: `.counts` bottom margin `1rem` →
`.5rem` (canonical), and the footer gains the family nav. Its inline `<style>`
shrinks to roughly one rule (`.id { white-space: nowrap }`). The `<h1>`'s
inline `style=` moves to the shared `.demo-tag` class.

**epubsana-wasm** — `.counts` `.95rem` → `.9rem` and margins to the canonical
`1rem 0 .5rem` (one point smaller, slightly more space below; if the actionbar
spacing matters, override the margin locally — margins are page layout, that
is legitimate). Buttons and `.badge` base move to the shared file with
**identical rules** (no visual change); the badge *tiers* (`.AutoSafe`,
`.ConfirmNeeded`), `.fix` cards, `.after`, `.actionbar`, `.preview` stay
page-local. Footer gains the family nav.

Neither demo's JS changes. (The Web-Worker recommendation in
[`../wasm/BUILD-PROFILE.md`](../wasm/BUILD-PROFILE.md) is separate work.)

## Severity: one thing to check when you re-copy

The `.sev` classes are **lowercase, five values** — `fatal`, `error`, `warning`,
`info`, `usage` — spelled exactly as the JSON envelope spells `severity`
(conventions FORMATS.md §1.3). The class name is the envelope string written
straight into the DOM; there is no translation step, and the shared file carries
no uppercase aliases.

So a demo whose JS still writes the old uppercase spelling (`class="sev ERROR"`)
will render severities in plain body color after re-copying — legible, but
uncolored, and silently so. Either move the demo to the envelope spelling in the
same change, or keep its uppercase rule in the page's local `<style>` until it
converges. Both are fine; doing neither is the one that looks like nothing
happened.

`fatal` is the only severity with a background wash — see the note in
`tokens.css` for why the color alone cannot carry its rank in dark mode. Tools
that inherit a severity onto a derived item (epubsana's fix cards take the
severity of the finding they address) get the wash there too, which is correct:
a fix for a fatal finding is as urgent as the finding.

## Form controls and focus

Native controls, kept native. `demo.css` sets **one property** —
`accent-color: var(--accent)` — and that styles checkbox, radio, range and progress
in both themes, with no markup and no JS. `select` matches the button shape and keeps
the browser's own arrow and popup, which are faster, more accessible, and far better
on a phone than anything drawn with pseudo-elements. Write the `<input>`; you are
done.

**Focus.** There was no `:focus` rule in the template until v2 — the whole layer was
missing, which is how a keyboard-unreachable drop zone (#5) survived a release. The
ring is `--accent` at 2px with a 2px offset, and it clears WCAG 2.2 SC 1.4.11's 3:1
against every color it can land beside (light: 7.24 / 6.76 / 5.33 against `--bg`,
`--card`, `--border`; dark: 6.97 / 6.33 / 4.84).

**One thing you have to do yourself: wrap a checkbox or radio in its `<label>`.**

```html
<label class="opt"><input type="checkbox" checked> Show usage findings</label>
```

A native checkbox is about 13px, well under WCAG 2.2 SC 2.5.8's 24×24 minimum. The
template does **not** resize it — an author-unmodified control falls under the
standard's user-agent exception, and a stretched checkbox looks wrong in every
browser for different reasons. The label is what makes the target big enough, and
it is a line of HTML, not CSS. That is why it is documented here rather than
solved in the shared file.

## Theme: three states, and the toggle is optional

`tokens.css` reads one attribute on `<html>`:

| `data-theme` | Result |
| --- | --- |
| absent | **auto** — the OS decides. This is the v1 behaviour, unchanged. |
| `"dark"` | dark, whatever the OS says |
| `"light"` | light, whatever the OS says |

That is the whole hook, and it lives in the tokens because it has to: *"a consumer
never edits its copy"* makes a page-local override of the dark values illegal by
the one rule. A consumer that wants a toggle **sets the attribute**; a consumer
that doesn't want one copies nothing extra and still gets auto light/dark. The
conventions site, which takes `tokens.css` alone with its own Jekyll layout, gets
the hook for free.

`skeleton.html` carries a reference toggle in two parts, and they are not
interchangeable:

- **In `<head>`, inline, not deferred** — reads the stored choice and sets the
  attribute *before the first paint*. This placement is the feature. Move it to
  the module script at the bottom and a reader who chose dark gets a white flash
  on every load, which is the bug the toggle exists to avoid.
- **In the footer** — the button that cycles auto → dark → light and persists the
  choice. Delete this and the page is auto-only; nothing else breaks.

Both are guarded on `CSS.supports("color", "light-dark(…)")`, and `demo.css` hides
the button under the same `@supports` test. On a browser without `light-dark()`
the attribute would move the scrollbars and nothing else, and a control that
appears to do something while doing nothing is worse than no control.

### Why `tokens.css` says every color twice

`light-dark()` is Baseline *newly available* (May 2024) — not yet widely
available, and Safari's version is bound to the OS, so the tail does not close on
its own. If the tokens used `light-dark()` alone, then on those browsers every
`var(--x)` would be invalid at computed-value time and the entire semantic color
layer — severity ramp, verdict chip, link color — would disappear **silently**: a
legible page that has quietly stopped saying anything.

So the file states the modern values once, in `light-dark()` pairs, and restates
them in an `@supports not (…)` floor that gives those browsers exactly the v1
behaviour. The duplication is real and it is a drift vector, so it is not left to
a comment: **`node template/check-tokens.mjs`** fails if the two ever disagree.
When the support bar moves, delete the floor *and* the script — a check that can
no longer fail is a lie about how much is being verified.
