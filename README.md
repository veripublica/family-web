# veripublica family-web

Shared web infrastructure for the [veripublica](https://github.com/veripublica)
tool family — the things the tools' **browser-facing surfaces** have in common,
kept in one copy so they cannot drift apart.

The family's *behavioural* contract (flags, exit codes, output naming, machine
format) lives in [`conventions`](https://github.com/veripublica/conventions).
This repository is its web-side sibling: how the WASM demos are built, and —
soon — how they look.

## Contents

| Path | What it is |
| --- | --- |
| [`wasm/BUILD-PROFILE.md`](./wasm/BUILD-PROFILE.md) | The measured release-profile recommendation for the family's WASM crates — every alternative benchmarked, with the numbers that rejected it. |
| [`wasm/matrix/`](./wasm/matrix/) | The scripts that produced those numbers. Parametrized; run them against any sibling crate before assuming the results transfer. |

## Planned

- **Shared demo template** — `tokens.css` (the family's colors and typography,
  light/dark), a demo-page skeleton, and cross-links between the tools' demo
  pages. The two existing demos (`epubveri-wasm`, `epubsana-wasm`) are the same
  hand-copied template and have already begun to drift; the single copy will
  live here. Consumption model: copy + version note, no build dependency.

## The house rule this repository exists to serve

**Measured, not assumed.** Every recommendation in here carries the numbers
that produced it and the scripts to reproduce them. If a number is missing,
the recommendation is missing.

## License

Not yet declared — to be decided by the owner before any external reuse.
(The tools are `AGPL-3.0-only OR LicenseRef-veripublica-Commercial`; the
conventions spec is `CC-BY-4.0`; this repository's mix of documentation and
embeddable assets needs its own decision.)
