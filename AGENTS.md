# family-web: detail for code agents and maintainers

`README.md` is the short introduction. This file holds the detail, and is kept
true at every release. The template's own documentation (what changed in each
version, how to adopt it, the component rules) is
[`template/README.md`](./template/README.md); the WASM build measurement is
[`wasm/BUILD-PROFILE.md`](./wasm/BUILD-PROFILE.md). This file points to them
rather than repeating them.

## Status

Latest tag `v0.8.0`, template `v8` (2026-10-31). `measure.mjs` verifies 36
measured claims. The template is used by five demo pages (epubveri,
epubsana, kepubverto, paginaverto, imagoverto) and, for `tokens.css` only, by
the conventions site.

## Scope

What the family's browser-facing surfaces have in common, in one copy so the
copies cannot drift:

- **The demo template:** `tokens.css` (colors, light and dark, the
  `data-theme` hook), `demo.css` (page skeleton and the family components),
  `skeleton.html` (the page shape), and the checks that guard them.
- **The family nav list:** `nav.json` on the `nav` branch, read at runtime by
  every demo.
- **The WASM release profile:** the measured `[profile.release]`
  recommendation for the family's WASM crates, and the scripts that produced
  it.

The family's behavioural contract (flags, exit codes, output naming, machine
formats) is not here; it is [`conventions`](https://github.com/veripublica/conventions).

Rules the repository follows:

- **Measured, not assumed.** A recommendation carries its numbers and the
  script that reproduces them. If a number is missing, the recommendation is
  missing.
- **An unexercised component is an unverified one.** A changed component is
  rendered in a page and measured before it ships.
- **The design layer may run ahead of demand; the semantic layer may not.**
  Generic UI primitives (form controls, focus, tables, buttons) are built
  before anyone asks. A tool's own vocabulary, and anything conventions names,
  waits for a named need (template README, "Where does my new style go?").
- **Decisions are made in issues.** Issue, discussion, a Decision comment
  (what, why, what was rejected), then the change.

## What it declines to do

- **No build dependency, no package, no submodule.** Consumers copy files.
- **No edits in a consumer's copy.** A change worth making is made here, for
  everyone. `check-copies.mjs` fails an edited copy.
- **No issue needed to use the template,** only to change it. A demo that
  needs something writes it in its own page and ships; nothing here blocks a
  tool's release.
- **No tool vocabulary in `demo.css`** (epubsana's badge tiers, epubveri's id
  column): it stays in the tool's page.
- **No coupling of a token to a `demo.css` selector.** The conventions site
  takes `tokens.css` alone, so it must work standalone.
- **No machinery on the nav.** It lists tools a reader can run, not specs,
  templates or libraries (#10).
- **No website.** The Pages root of this repository 404s on purpose; Pages
  serves `nav.json` and nothing else.

## Layout

| Path | What it is |
| --- | --- |
| `template/tokens.css` | Design tokens. Shipped. |
| `template/demo.css` | Page skeleton and family components. Shipped. |
| `template/skeleton.html` | The page shape; fill every `TOOL:` comment. Its nav links are the fallback for `nav.json`. Shipped. |
| `template/README.md` | Consumer documentation: versions, adoption, component rules, nav rule, theme, form controls. |
| `template/measure.mjs` | Verifies every measured claim the CSS comments make. Not copied. |
| `template/check-tokens.mjs` | Fails if the `@supports` floor in `tokens.css` drifts from its `light-dark()` pairs. Not copied; deleted together with the floor. |
| `template/check-nav.mjs` | Checks `nav.json`. Not copied. |
| `template/check-copies.mjs` | Compares each consumer's published copies with the version they claim. Not copied. |
| `wasm/BUILD-PROFILE.md` | The WASM release-profile recommendation, with the numbers that rejected every alternative. |
| `wasm/matrix/run_matrix.sh` | Builds a wasm-pack crate under each profile variant (cargo env overrides, no manifest edit) and records sizes. |
| `wasm/matrix/bench.mjs` | Times `validate()` for each variant in Node 22+. |
| `.github/workflows/family-checks.yml` | The only workflow: runs `check-nav.mjs` and `check-copies.mjs`. |
| branch `nav` | Orphan branch holding `nav.json` only, served by GitHub Pages. |

## Commands

All need Node; nothing is installed.

```sh
node template/measure.mjs              # exit 1 if any measured claim fails
node template/measure.mjs --table      # also print the full contrast matrix
node template/check-tokens.mjs         # exit 1 if floor and pairs disagree
node template/check-nav.mjs [path|URL] # default: the published nav.json
node template/check-nav.mjs --release  # also: skeleton.html fallback must equal nav.json
node template/check-copies.mjs         # needs the tags: git fetch --tags
```

`measure.mjs` reads the palette from `tokens.css` and `demo.css`, so it
measures what ships: WCAG AA (4.5:1) for text, 3:1 for non-text and the focus
ring, each state chip on its own wash, and ΔE2000 ≥ 10 between colors that
must be told apart. It does not measure target sizes. Run it, and
`check-tokens.mjs`, before changing any color.

`check-nav.mjs` fails on a malformed `nav.json`, an entry the page's script
would skip, a URL outside `github.com/veripublica/` that is not a listed
exception (today one: `epublift`, at `github.com/ePubLift/epublift`), or a URL
that does not open for an anonymous visitor. It does not judge membership;
that is decided in an issue.

`check-copies.mjs` reads every consumer's published `tokens.css` and
`demo.css`, takes the version from the copy's first line, and compares the
bytes with that version's tags. Per file: `identical`, `behind` (an older
version, not a failure), or `DRIFT` (matches no tag of the claimed version,
which fails).

The WASM matrix:

```sh
wasm/matrix/run_matrix.sh <crate-dir> <out-dir> <out-name>
node wasm/matrix/bench.mjs <out-dir> <out-name> <big.epub> [small.epub]
```

## Versions

Two numbers, on purpose:

- **Template version** (`v8`): the generation of the look. It is in the first
  line of `tokens.css`, `demo.css` and `skeleton.html`, in both READMEs, and in
  each consumer's copy comment. It changes only when a shipped template file
  changes.
- **Repository tag** (`v0.8.0`): the exact bytes. A template version is a
  minor tag (`vN` = `v0.N.0`); a change anywhere else (docs, checks, `wasm/`)
  is a patch tag, and no consumer re-copies for it.

A consumer records both: `<!-- family-web template v8 (family-web v0.8.0) -->`.

## Consumers

| Consumer | Takes |
| --- | --- |
| epubveri, epubsana, kepubverto, paginaverto, imagoverto demos | `tokens.css` + `demo.css`, page markup from `skeleton.html` |
| conventions site | `tokens.css` only, verbatim, in its own layout |

At a template version bump a demo re-copies `tokens.css` and `demo.css`, edits
its page markup if `skeleton.html` changed (the template README's "What
changed" section says which), and updates its copy comment. A patch tag needs
nothing. Consumers re-copy on their own schedule. Demos are live at
`https://veripublica.github.io/<tool>/`.

## The nav channel

The nav a reader sees is `nav.json`, published from the orphan `nav` branch to
`https://veripublica.github.io/family-web/nav.json`. Each demo fetches it at
runtime; the links in its page are the fallback. Adding a tool is a change to
`nav.json` only, live within GitHub Pages' ten-minute cache, with no release
anywhere.

`nav.json` has no version, and a push to `nav` is not a release. In place of
one, `node template/check-nav.mjs <file>` must pass before the push. Every
entry carries its full URL; never derive one from a tool's name. Branch rules
on `nav` forbid force-pushes and deletion. Between template releases the
fallback in `skeleton.html` may lag `nav.json`; at a template release they must
match (`--release`).

## Releases

A release is an annotated git tag on `main`, pushed to GitHub. There are no
GitHub Releases, no registry and no release assets.

1. **Kind.** A shipped template file changed: new template version and minor
   tag. Anything else: patch tag, template unchanged.
2. **Bumps (template release only):** the first-line header in the three
   shipped files; `template/README.md` (title, a "What changed in vN" section,
   the template-to-tag table, the copy-comment example); the root
   `README.md` ("the current one is template vN").
3. **Checks:** `measure.mjs` and `check-tokens.mjs` exit 0;
   `grep -rn "template v" template/ README.md` shows one version;
   `check-nav.mjs --release` exits 0 (template releases only; on a patch tag
   it may fail, and the tag message says so); the working tree is clean apart
   from the release.
4. **Tag:** `git tag -a v0.X.Y -m "family-web v0.X.Y — template vN"`, with a
   body that says what changed and what a consumer must re-copy.
5. **Push** `main` and the tag, then confirm with `git ls-remote --tags origin
   v0.X.Y` that the remote tag's commit equals `git rev-parse v0.X.Y^{}`.

## Workflow

`.github/workflows/family-checks.yml` builds, tests and releases nothing. It
runs the two checks whose subject changes without a release here:

- **`nav`** on every Pages build (a push to `nav`; run from `main`) and weekly:
  `check-nav.mjs` on the pushed file, and on the served file except right
  after a push, while Pages' cache may still hold the old one.
- **`copies`** weekly (Mondays, 06:17 UTC) and on manual dispatch:
  `check-copies.mjs` with every tag fetched.

A Pages-build run comes after the push, so it alerts rather than prevents; the
local check before pushing is the gate.

## Licence

`AGPL-3.0-only OR LicenseRef-veripublica-Commercial`, for everything in this
repository: documentation, scripts and the template files. See
[`LICENSE`](./LICENSE) and [`LICENSE-COMMERCIAL.md`](./LICENSE-COMMERCIAL.md).
