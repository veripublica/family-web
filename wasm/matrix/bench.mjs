// Timing bench for the build matrix: loads each variant's web-target pkg in
// Node (22+), times validate(). Module compilation is excluded on purpose —
// .wasm size is the proxy for download+compile and is measured separately.
//
// Usage: node bench.mjs <matrix-out-dir> <out-name> <big.epub> [small.epub]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [OUT, NAME, BIG, SMALL] = process.argv.slice(2);
if (!OUT || !NAME || !BIG) {
  console.error("usage: node bench.mjs <matrix-dir> <out-name> <big.epub> [small.epub]");
  process.exit(2);
}
const big = new Uint8Array(readFileSync(BIG));
const small = SMALL ? new Uint8Array(readFileSync(SMALL)) : null;

const variants = readdirSync(OUT)
  .filter((d) => existsSync(`${OUT}/${d}/${NAME}.js`))
  .sort();

const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return { median: s[Math.floor(s.length / 2)], min: s[0] };
};

console.log("variant\tbig_median_ms\tbig_min_ms\tsmall_median_ms\treport_signature");
for (const v of variants) {
  const mod = await import(pathToFileURL(`${OUT}/${v}/${NAME}.js`));
  mod.initSync({ module: new WebAssembly.Module(readFileSync(`${OUT}/${v}/${NAME}_bg.wasm`)) });

  // Sanity gate: every variant must produce the identical report, or the
  // timing comparison is meaningless.
  const r = mod.validate(big, undefined);
  const sig = `${r.valid}/${r.errors}/${r.warnings}/${r.messages.length}`;

  for (let i = 0; i < 3; i++) mod.validate(big, undefined); // warm-up
  const runsBig = [];
  for (let i = 0; i < 15; i++) {
    const t0 = performance.now();
    mod.validate(big, undefined);
    runsBig.push(performance.now() - t0);
  }
  let smallMedian = "";
  if (small) {
    const runs = [];
    for (let i = 0; i < 50; i++) {
      const t0 = performance.now();
      mod.validate(small, undefined);
      runs.push(performance.now() - t0);
    }
    smallMedian = stats(runs).median.toFixed(2);
  }
  const B = stats(runsBig);
  console.log(`${v}\t${B.median.toFixed(1)}\t${B.min.toFixed(1)}\t${smallMedian}\t${sig}`);
}
