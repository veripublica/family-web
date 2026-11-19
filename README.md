# veripublica family-web

The veripublica tools each have a demo page that runs the tool in your
browser, through WebAssembly, for example
[epubveri's](https://veripublica.github.io/epubveri/). This repository holds
what those pages share, so that each tool doesn't keep its own copy that
slowly drifts away from the others. I started it the day I caught two demos'
hand-copied styles already disagreeing.

Most of it is the family demo template: `tokens.css` holds the colors, in
light and dark, `demo.css` the page layout and the common components, and
`skeleton.html` the page shape. The demos copy these files and note which
version they took; the current one is template v8. There is nothing to
install and no build step. Every color claim in the stylesheets, such as text
contrast meeting WCAG AA, is checked by a script in the same folder, so the
numbers in the comments can be re-run rather than trusted.
[`template/README.md`](./template/README.md) explains how to adopt it and what
changed in each version.

The repository also holds the list of tools in the demos' shared navigation,
and my measurements of release settings for the family's WebAssembly builds,
in [`wasm/BUILD-PROFILE.md`](./wasm/BUILD-PROFILE.md), with the scripts that
produced them. The tools' command-line behaviour, their options and exit
codes, is agreed in a sibling repository,
[conventions](https://github.com/veripublica/conventions).

If you want the template for your own page, copy the three files from
`template/` and keep the version comment at the top of each. If something in
it is wrong or missing, open an issue here. The rules, the checks and the
release steps are in [`AGENTS.md`](./AGENTS.md).

## Licence

`AGPL-3.0-only OR LicenseRef-veripublica-Commercial`. See [`LICENSE`](./LICENSE)
and [`LICENSE-COMMERCIAL.md`](./LICENSE-COMMERCIAL.md).
