# WASM build profile — measured, not assumed

**Status: adopted recommendation, 2026-07-10.** Applies to the family's
browser-WASM crates (`epubveri-wasm`, `epubsana-wasm`, and any future sibling).
Everything below is from running builds and benchmarks, not from folklore; the
scripts to reproduce are in [`matrix/`](./matrix/).

## The recommendation

```toml
# workspace Cargo.toml
[profile.release]
opt-level = 2        # keep the existing default
lto = true
codegen-units = 1
```

That is the whole change. It is the only configuration in the matrix that is a
**strict win** — smaller *and* faster than the status quo, with no trade-off to
argue about:

- **−6.2 %** `.wasm` size (1.096 MB → 1.027 MB; gzip 448 KB → 423 KB)
- **−2.4 %** validation time on a real book
- cost: release builds take ~40 s instead of ~20 s

Note that `[profile.release]` lives in the **workspace** manifest, so this also
applies to the CLI binaries — where fat LTO is generally a win too (smaller,
same or faster). If a repo ever needs different tuning per artifact, that is a
new measurement, not an assumption.

## Why every other obvious choice was rejected

Measured on: Apple M2 Pro, rustc 1.96.0, wasm-pack 0.15.0 (`--target web`,
default `wasm-opt -O` pass on every variant, so comparisons are like-for-like),
Node 22.16 with `initSync` on a precompiled module. Speed = median of 15
`validate()` runs on a real 1.2 MB EPUB (*Project Hail Mary*), after warm-up;
run-to-run noise is ~2 %. Every variant produced a byte-identical verdict
(`valid=false / 3 errors / 1 warning / 4 messages`) — the sanity gate for
comparing them at all.

| Variant | `.wasm` | gzip | validate (ms) | size Δ | speed Δ |
| --- | --- | --- | --- | --- | --- |
| **A — today** (opt-level 2, no LTO) | 1 095 804 | 447 580 | 287.8 | — | — |
| B — thin LTO | 1 095 803 | 447 564 | 287.2 | ±0 % | ±0 % |
| **C — fat LTO + CU=1** ← adopted | 1 027 423 | 423 191 | 281.0 | **−6.2 %** | **−2.4 %** |
| D — C + `opt-level = "z"` | 771 597 | 324 326 | 480.8 | −29.6 % | **+67 %** |
| E — C + `opt-level = 3` | 1 056 886 | 432 664 | 278.6 | −3.6 % | −3.2 % |
| F — D + `panic = "abort"` | 770 478 | 323 999 | 479.7 | −29.7 % | +67 % |
| G — C + `opt-level = "s"` | 949 071 | 390 587 | 316.3 | −13.4 % | +9.9 % |
| E + manual `wasm-opt -Oz` | 1 052 779 | 432 818 | 279.1 | −3.9 % | −3.0 % |
| G + manual `wasm-opt -Oz` | 942 810 | 390 513 | 318.1 | −14.0 % | +10.5 % |

**`opt-level = "z"` — rejected.** The standard advice for WASM ("optimize for
size") buys −30 % size at **+67 % runtime**: 288 ms → 481 ms per book. The
download saving is paid once and gzip already halves it; the slowdown is paid on
every single validation. Our priority order (performance, speed, low resource
use) reads this table one way only.

**`opt-level = "s"` — rejected for the demos.** A genuine middle point (−13 %
size, +10 % time), and the right choice *if* download size ever becomes the
constraint. For a demo page fetched once and cached, it is the wrong side of
the trade.

**Thin LTO — rejected.** Zero effect on size or speed here (the default
`wasm-opt -O` pass appears to flatten whatever it changed), and it was the
slowest build of the whole matrix. Fat LTO or nothing.

**`panic = "abort"` — pointless here.** 1 119 bytes saved on top of D. This
also settles a side debate: `console_error_panic_hook`'s few KB are affordable,
so keep diagnosable panics in the demos rather than chasing kilobytes that
measurably do not exist.

**Extra `wasm-opt` passes — rejected.** Running binaryen's `-Oz` or `-O4` on
top of wasm-pack's default `-O` moves size and speed by ≤ 1 %. Not worth a
custom pipeline step.

**E (`opt-level = 3`) — the honest runner-up.** ~1 % faster than C, 3 % bigger,
inside measurement noise. C is adopted because it is the smaller diff from the
status quo and its speed is statistically indistinguishable; a tool that later
proves hot-path-bound should re-measure E rather than assume it.

## Method notes, for the next person who measures

- Profile variants were driven by **`CARGO_PROFILE_RELEASE_*` environment
  variables** — no manifest was edited to produce the matrix, so it can run
  against a clean checkout.
- wasm-pack ran its default `wasm-opt -O` on **every** variant; the manual
  `-Oz`/`-O4` rows used wasm-pack's own cached binaryen on top of that.
- The benchmark deliberately excludes module compilation: `.wasm` size is the
  proxy for download + compile, and the table reports it separately.
- Two runs of the same variant differed by ~2 % — treat any delta inside that
  as noise, and re-run before believing it.
- These numbers are epubveri's. **Do not assume they transfer** to epubsana or
  any other crate — the whole point of this document is that nobody here
  assumes. Adopting C elsewhere costs one build and one size check.

## Related, not yet done

- **Move validation into a Web Worker** in both demo pages: today `validate()`
  runs synchronously on the UI thread, so a large book freezes the page before
  the "Validating…" status even paints. Transfer the `ArrayBuffer`
  (zero-copy) and the peak memory also drops.
- **Extract the shared demo template** into this repository: the two demo pages
  are the same hand-copied template and have already drifted (`.counts` is
  `.9rem` in one, `.95rem` in the other). Tokens + skeleton belong here, in one
  copy.
