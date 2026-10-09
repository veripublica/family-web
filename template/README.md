# The family demo template — v5

The shared look of the veripublica demo pages, in **one copy**. Extracted
2026-07-10 from `epubveri-wasm` and `epubsana-wasm`, whose demos were the same
hand-copied template and had already begun to drift (`.counts` was `.9rem` in
one and `.95rem` in the other — small, but that is how divergence starts).

## What changed in v5

Two components arrive, and the copies say what they are. Re-copy both stylesheets.
`skeleton.html` changed only inside the nav script: replace that `<script>`, and
nothing else in your page.

| Change | What it means for you |
| --- | --- |
| **`.opt` and `.viewopts` are in `demo.css`** (#15) | An option row (a checkbox with a sentence of explanation) and a view-controls row (label, control, action pushed to the end), both from epubveri, where they were generic and had been written into its copy. Write the markup and you are done — the usage is in `demo.css`'s comment above each. The `<code>` tint in `.opt` is `--wash` now, not 12%: at 12% `--muted` on it failed AA over a card (4.46:1); at 8% the worst case is 4.74:1, and `measure.mjs` holds it. **epubveri:** delete your local copies of both. |
| **The copies say they are copies** (#14) | The first comment of `tokens.css` and `demo.css` now says: do not edit, page styles go in your page, and `check-copies.mjs` will find an edited copy. Nothing renders differently. |
| **The nav script checks the host** (#13) | A `nav.json` entry is used only if its URL is on `https://github.com/`. Which repositories may appear is checked in family-web, where a new exception is one line — so no demo re-copies for it. |
| **"You are here" survives a rename** (#16) | The script recognises your tool by its `aria-current` link's name **or** URL. Change either one in `nav.json` and the mark stays; change both at once and it is lost until your next re-copy — the one known limit. |

## What changed in v4

Every change is in the family nav in `skeleton.html`; the stylesheets changed
only in their version header. A demo that has adopted v3 replaces its footer
nav with the new one (the links, the `#family-tools` wrapper and the script
after it) and updates its copy comment.

| Change | What it means for you |
| --- | --- |
| **`kepubverto` is on the family nav** (#12) | The family's EPUB → KEPUB converter for Kobo readers, with its own page that converts a book in the browser. It passes the membership rule (#10): a publisher can run it on a book. It sits after `epubsana` — verify → repair → convert, the order a book goes through them — and before `epublift`, which wraps all three. |
| **The `epublift` link works** | It pointed at `github.com/veripublica/epublift`, which does not exist — every demo's nav showed a publisher a 404. `epublift` lives at `github.com/ePubLift/epublift`; change the `href`. |
| **The list updates itself** (#2) | The nav fetches the current list from family-web's `nav.json` and replaces the links with it. When a tool joins the family, **every live demo shows it within about ten minutes, and no other tool has to release**. The links in your markup stay: they are the fallback, shown offline, on a local server, or if the fetch fails. Keep your own tool's `aria-current="page"` link — that is how the script recognises which tool it is on. What is fetched is data, not code: it is turned into links with `textContent`, never parsed as HTML or run. |

## What changed in v3

All three are markup changes in `skeleton.html`, so a demo that has already
adopted must edit its page — re-copying the stylesheets is not enough.

| Change | What it means for you |
| --- | --- |
| **The theme toggle is standard, and top-right** (#7) | Every demo ships it, in the `.topbar` beside the `<h1>` — not in the footer, and not wherever each demo felt like. A standard control placed differently on every page is only half standard. It still hides itself where `light-dark()` is unsupported: "standard" means every demo *ships* it, not that it always renders. |
| **The current tool's footer link is live** (#8) | Every sibling in the family nav is a link now, the current tool included. These point at **GitHub repositories, not at the page you are on** — so the current tool's repo was the one link a visitor most wanted, rendered as dead text. Mark it `aria-current="page"`; it is distinguished by **weight, not color**. |
| **"· WASM demo" is gone from the `<h1>` and `(WASM)` from the `<title>`** (#9) | Engineer language on a user-facing page. The reader has an EPUB to check, not a runtime to shop for; the `.sub` line already says the thing that matters (no upload, no server) and the footer still carries the build provenance. |
| **`conventions` is out of the family nav** (#10) | The nav lists **tools a reader can use**, not the machinery behind them — see the rule below. `conventions` is a spec, not something a publisher can run; it stays one hop away via the veripublica link. |

## What changed in v2 — if you are coming from v1

| Change | What it means for you |
| --- | --- |
| **Severity is five values, lowercase** (#1) | ⚠️ **A demo still emitting `class="sev ERROR"` renders severities uncolored after re-copying** — see below. This is the one to check. |
| **The drop zone is keyboard-reachable** (#5) | ⚠️ It was not, since v1: `display: none` on the file input made the demo's only interaction mouse-only. Fixed in `demo.css`; **no markup change** — re-copying is the fix. |
| **A focus layer, and form controls** (#6) | Nothing to do. Focus rings appear where there were none. `select`, checkbox and radio now come styled, so a demo that needs one just writes the markup. |
| **A `data-theme` hook** (#3) | Auto light/dark is unchanged. The toggle it introduced is standard as of v3. |
| **Chip wash 14% → 8%** (#4) | Verdict chips read slightly flatter. They now pass WCAG AA in light mode; at 14% both variants failed. |

## Versions: there are two numbers, on purpose

- **The template version** (`v5`) is the *generation of the look*. It is what a
  consumer writes in its copy comment, and what answers "am I behind?".
- **The repository tag** (`v0.5.0`) is the *exact bytes*. A fix to
  `wasm/BUILD-PROFILE.md` moves the tag and not the template; no demo needs to
  re-copy for it.

| Template | family-web tag |
| --- | --- |
| v1 | v0.1.0 |
| v2 | v0.2.0 |
| v3 | v0.3.0 |
| v4 | v0.4.0 |
| v5 | v0.5.0 |

Two numbers is two things to keep in step, so the copy comment carries **both** —
one grep answers which generation a demo is on *and* which bytes it took:

```html
<!-- family-web template v5 (family-web v0.5.0) -->
```

## Files

| File | What it is |
| --- | --- |
| `tokens.css` | The design tokens (colors, light/dark, and the `data-theme` hook). Byte-identical in both demos at extraction; now canonical here. |
| `demo.css` | The page skeleton (base layer, identical at extraction) plus the family components (verdict chip, severity colors, findings table, buttons, badge base, family footer nav, theme toggle) — each promoted from the one demo that had it, so the next tool reuses instead of reinventing. |
| `skeleton.html` | The page shape. Copy, then fill every `TOOL:` comment. |
| `check-tokens.mjs` | Not copied by consumers. Fails loudly if `tokens.css`'s `@supports` floor drifts from its `light-dark()` pairs. Deleted together with the floor. |
| `check-nav.mjs` | Not copied by consumers. Checks `nav.json`: the shape the page's script accepts, every URL under `github.com/veripublica/` or a listed exception (#13), and every URL opening for an anonymous visitor. `--release` also fails if the fallback list in `skeleton.html` differs from it. Run weekly and on every `nav` push by `.github/workflows/family-checks.yml`. |
| `check-copies.mjs` | Not copied by consumers. Reads every consumer's **published** `tokens.css` / `demo.css` and compares the bytes with the template version the copy's first line claims. An edited copy fails it (#14); a copy that is merely behind does not. Run weekly by the same workflow. |
| `measure.mjs` | Not copied by consumers. Reads the palette out of `tokens.css` and `demo.css` and verifies every measured claim their comments make — WCAG AA, chip-on-its-own-wash, focus-ring non-text contrast, ΔE2000 separation. **Run it before changing any color.** `--table` prints the full matrix. |

## Consumption model: copy + version note

No build dependency, no submodule. A demo repo:

1. copies `tokens.css` and `demo.css` next to its `demo/index.html`;
2. links them and deletes the corresponding rules from its inline `<style>`,
   keeping only tool-specific rules there;
3. records the template version and the tag it came from, in a comment:
   `<!-- family-web template v5 (family-web v0.5.0) -->`.

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

Both demos are still on their pre-template inline styles, so each is a **first
adoption**, straight to v3.

**epubveri-wasm** — `.counts` bottom margin `1rem` → `.5rem` (canonical), and the
footer gains the family nav. Its inline `<style>` shrinks to roughly one rule
(`.id { white-space: nowrap }`). The `<h1>`'s inline `style=` and its
`· WASM demo` text both go: the heading becomes the tool's name alone (#9). If you
want a quiet qualifier there later, `.demo-tag` is the class for it — but do not
put `WASM` back in it.

**epubsana-wasm** — `.counts` `.95rem` → `.9rem` and margins to the canonical
`1rem 0 .5rem` (one point smaller, slightly more space below; if the actionbar
spacing matters, override the margin locally — margins are page layout, that
is legitimate). Buttons and `.badge` base move to the shared file with
**identical rules** (no visual change); the badge *tiers* (`.AutoSafe`,
`.ConfirmNeeded`), `.fix` cards, `.after`, `.actionbar`, `.preview` stay
page-local. Footer gains the family nav.

Both gain the theme toggle, which is standard from v3 (#7), and both must mark
their own entry in the family nav with `aria-current="page"` — a live link, not a
`<span>` (#8).

Neither demo's JS changes for the adoption itself. (The Web-Worker recommendation
in [`../wasm/BUILD-PROFILE.md`](../wasm/BUILD-PROFILE.md) is separate work, and
epubveri's move to the envelope shape is its own — see veripublica/epubveri#8.)

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

## Changing a color

Run it. Do not eyeball it.

```
node template/measure.mjs           # 26 claims; exit 1 if one stops holding
node template/measure.mjs --table   # the full matrix — use this when adding a token
node template/check-tokens.mjs      # the @supports floor still matches the pairs
```

`measure.mjs` reads the palette out of `tokens.css` and `demo.css` rather than taking it
as arguments, so it measures **what actually ships** and a comment cannot drift away from
its own number. It checks four things, and each one exists because skipping it cost us
something:

| Check | Why it is there |
| --- | --- |
| WCAG AA (4.5:1) on `--bg` | The baseline. |
| A chip against **its own wash**, not `--bg` | The wash raises the background luminance. Measuring against `--bg` is what hid the verdict chip failing AA for two versions (#4). |
| Focus ring at 3:1 against **`--bg`, `--card` *and* `--border`** | WCAG 2.2 SC 1.4.11. A ring that clears the page but not the card it sits on is not a ring. |
| ΔE2000 ≥ 10 between `--fatal`/`--err` and `--usage`/`--muted` | Contrast says "legible". ΔE says "**told apart**". Every deeper-red `--fatal` candidate in dark mode was legible and none was distinguishable — that is what forced the wash (#1). |

Target sizes (WCAG 2.2 SC 2.5.8, 24×24) are **not** in the script: they depend on rendered
line-height, and reconstructing that from CSS would be a fragile answer to a question a
browser answers properly. The theme toggle's 29.2px is worked out in `demo.css`'s comment
from font-size and padding; change either and redo it by hand.

## The family nav: what goes on it

> **The nav lists the tools a reader can use. Not the machinery behind them.**

| On it | Off it |
| --- | --- |
| `epubveri`, `epubsana`, `kepubverto`, `epublift` — things a visitor might go and run | `conventions`, `family-web`, `styloria` — specs, templates, libraries |

The nav ran for two versions with a *list* and no *rule*, which is how `conventions`
— a document about CLI flags and exit codes — ended up on a page written for
publishers. The tell was there the whole time: **`family-web` was never on the nav**,
though it is exactly the same kind of repository. One internal repo listed, the other
omitted, because nobody had asked the question from the reader's side.

Nothing becomes unreachable. The nav's first link is the **veripublica organisation**,
where a curious technical reader finds everything, `conventions` included. The removal
costs one hop for the few and returns a line that means something to the many.

Do not add a repository here because it is "part of the family." Add it because a
publisher would click it and be glad. (#10)

### Where the list lives (#2)

The list a reader sees is **`nav.json`**, published from family-web's `nav` branch to
`https://veripublica.github.io/family-web/nav.json` — the same host as the live
demos. The demo's script fetches it and rebuilds the links; the links written in the
page are the fallback. So adding a tool to the family is a change to `nav.json` and
nothing else: it is live within GitHub Pages' ten-minute cache, and no demo releases
for it.

`nav.json` is a **data channel, not a template file**. It has no template version, and
changing it is not a release — the one place in the family where `main`-style
publishing (push = live) is allowed, and only for this file, which is why it has a
branch of its own. What stands in for the release is the check:

```sh
node template/check-nav.mjs path/to/nav.json   # before pushing the nav branch
node template/check-nav.mjs                    # the published file
node template/check-nav.mjs --release          # at a template release: fallback must match
```

The workflow `.github/workflows/family-checks.yml` runs it after every push to `nav`
(on GitHub's `page_build` event, from `main`) and every Monday against the published
file — the second is the one that catches a sibling repository renamed or made private,
which no push of ours would. Branch rules on `nav` forbid force-pushes and deletion.

**Where a member may live (#13).** Under `github.com/veripublica/`, or as an exception
listed by exact URL in `check-nav.mjs` — today one, `epublift`. A new exception is a
decision made in an issue and a one-line change there; no demo re-copies for it.

Every entry carries its **full URL**. Never derive one from a tool's name: `epublift`
lives at `github.com/ePubLift/epublift`, outside the `veripublica` organisation, and the
nav pointed at a 404 for three versions because someone assumed otherwise (#12).

Every entry is a **link**, the current tool included, marked `aria-current="page"` and
distinguished by **weight, not color** (#8). The page has a color grammar — `--accent`
means *link*, `--fg` means *text* — and recoloring the current tool to `--fg` would
make it the only link on the page denying in color what it affirms with its underline.

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

## Theme: three states, and the toggle is standard

`tokens.css` reads one attribute on `<html>`:

| `data-theme` | Result |
| --- | --- |
| absent | **auto** — the OS decides. This is the v1 behaviour, unchanged. |
| `"dark"` | dark, whatever the OS says |
| `"light"` | light, whatever the OS says |

That is the whole hook, and it lives in the tokens because it has to: *"a consumer
never edits its copy"* makes a page-local override of the dark values illegal by
the one rule. Setting the attribute is all a page has to do — which is why the
conventions site, taking `tokens.css` alone with its own Jekyll layout, gets the
hook for free.

**Every demo ships the toggle** (v3, #7). It was opt-in in v2, and that was wrong:
it made light/dark a per-page coin flip, and a reader who finds the control on
epubveri and not on epubsana has learned nothing about either tool — only that the
family is inconsistent.

`skeleton.html` carries it in two parts, and they are not interchangeable:

- **In `<head>`, inline, not deferred** — reads the stored choice and sets the
  attribute *before the first paint*. This placement is the feature. Move it to
  the module script at the bottom "to tidy up" and a reader who chose dark gets a
  white flash on every load, which is the bug the toggle exists to avoid.
- **In the `.topbar`, top-right beside the `<h1>`** — the button that cycles
  auto → dark → light and persists the choice.

**The position is fixed by the template, not left to the demo.** It lived in the
footer in v2, and that was a scavenger hunt — worst on a long findings table, which
is exactly when a reader reaches for dark. Top-right is where people have learned to
look, and a control that is standard everywhere but findable in a different place on
each page is only half standard.

The honest cost: the toggle is now the **first Tab stop**, ahead of the drop zone.
One keypress, and focus order still matches visual order — but it is a cost, paid
deliberately rather than overlooked.

Both are guarded on `CSS.supports("color", "light-dark(…)")`, and `demo.css` hides
the button under the same `@supports` test. On a browser without `light-dark()` the
attribute would move the scrollbars and nothing else, and a control that appears to
do something while doing nothing is worse than no control. So **"standard" means
every demo ships it, not that it always renders** — the two are not the same claim,
and only the first one is ours to make.

The one page the template cannot reach: the **conventions site** has its own layout
and never copies `skeleton.html`. It has the hook and supplies its own control when
it wants one. Worth saying plainly, so "every page in the family has a toggle" does
not quietly become false.

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
