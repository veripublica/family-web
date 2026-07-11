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
| [`template/`](./template/) | **The family demo template, v3** — `tokens.css`, `demo.css`, `skeleton.html`, extracted from the two existing demos the day their hand-copied styles were caught drifting. Consumption: copy + version note, no build dependency. Adoption notes, and what changed in each version, are in its README. |

## The house rule this repository exists to serve

**Measured, not assumed.** Every recommendation in here carries the numbers
that produced it and the scripts to reproduce them. If a number is missing,
the recommendation is missing.

## License

**`AGPL-3.0-only OR LicenseRef-veripublica-Commercial`** — the family's house
dual license, covering everything in this repository: documentation,
measurement scripts, and the shared template assets to come. See
[`LICENSE`](./LICENSE) for the AGPL text and
[`LICENSE-COMMERCIAL.md`](./LICENSE-COMMERCIAL.md) for the commercial option.
(The conventions *spec* is CC-BY-4.0 because a convention is meant to be
adopted; this repository is code and analysis, and takes the code license.)
