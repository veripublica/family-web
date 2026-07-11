# The family demo template — v1

The shared look of the veripublica WASM demo pages, in **one copy**. Extracted
2026-07-10 from `epubveri-wasm` and `epubsana-wasm`, whose demos were the same
hand-copied template and had already begun to drift (`.counts` was `.9rem` in
one and `.95rem` in the other — small, but that is how divergence starts).

## Files

| File | What it is |
| --- | --- |
| `tokens.css` | The design tokens (colors, light/dark). Byte-identical in both demos at extraction; now canonical here. |
| `demo.css` | The page skeleton (base layer, identical at extraction) plus the family components (verdict chip, severity colors, findings table, buttons, badge base, family footer nav) — each promoted from the one demo that had it, so the next tool reuses instead of reinventing. |
| `skeleton.html` | The page shape. Copy, then fill every `TOOL:` comment. |

## Consumption model: copy + version note

No build dependency, no submodule. A demo repo:

1. copies `tokens.css` and `demo.css` next to its `demo/index.html`;
2. links them and deletes the corresponding rules from its inline `<style>`,
   keeping only tool-specific rules there;
3. records the template version in a comment:
   `<!-- family-web template v1 -->`.

When the template changes, family-web bumps the version in the file headers
and the consuming repos re-copy on their own schedule. The version comment is
what makes "which demos are behind?" a grep instead of an investigation.

**The one rule:** a consumer never edits its copy of `tokens.css`/`demo.css`.
If a change is worth making, it is worth making here, for everyone — that is
the entire point of the single copy. Page-local styles live in the page.

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
