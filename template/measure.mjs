#!/usr/bin/env node
// veripublica family-web — measure.mjs
//
// The house rule: "Every recommendation carries the numbers that produced it and the
// scripts to reproduce them. If a number is missing, the recommendation is missing."
//
// tokens.css and demo.css are full of measured claims — every severity token clears WCAG
// AA on its background; every state chip clears AA on its own wash; the focus ring clears
// 3:1 against everything it can land beside; --fatal is far enough from --err to be told
// apart. Until this file existed, those were numbers in comments with no way to reproduce
// them, which by the rule above means they were not recommendations at all. (issue #11)
//
// This does not take the palette as arguments. It READS tokens.css and demo.css, so it
// measures what actually ships, and a comment cannot drift away from its own number.
//
// Run:  node template/measure.mjs          verify every claim; exit 1 if any fails
//       node template/measure.mjs --table   also print the full matrix (use when adding
//                                           a token — this is the calculator)
//
// NOT measured here: target sizes (WCAG 2.2 SC 2.5.8, 24x24). They depend on rendered
// line-height, and reconstructing that from CSS would be a fragile answer to a question a
// browser answers properly. The theme toggle's 29.2px is computed in demo.css's comment
// from font-size and padding; if you change either, redo it there by hand.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (f) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), "utf8");

/* ---------- color math ---------- */

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

// WCAG 2.1 contrast ratio.
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// color-mix(in srgb, C p%, transparent) composited over BG is a plain sRGB lerp — which is
// why a chip's text must be measured against THIS, not against --bg. Missing that is the
// whole of #4.
const hex2 = (n) => Math.round(n * 255).toString(16).padStart(2, "0");
const wash = (c, bg, p) => "#" + rgb(c).map((v, i) => hex2(v * p + rgb(bg)[i] * (1 - p))).join("");

// CIE L*a*b* (D65) and ΔE2000 — "can a reader tell these two apart?"
const lab = (h) => {
  const [r, g, b] = rgb(h).map(lin);
  const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const Y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const Z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
  const f = (t) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  const [fx, fy, fz] = [f(X / 0.95047), f(Y / 1), f(Z / 1.08883)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

const deltaE = (h1, h2) => {
  const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2);
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const A1 = a1 * (1 + G), A2 = a2 * (1 + G);
  const Cp1 = Math.hypot(A1, b1), Cp2 = Math.hypot(A2, b2);
  const h1p = (Math.atan2(b1, A1) * 180 / Math.PI + 360) % 360;
  const h2p = (Math.atan2(b2, A2) * 180 / Math.PI + 360) % 360;
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  let dhp = Cp1 * Cp2 === 0 ? 0 : h2p - h1p;
  if (dhp > 180) dhp -= 360;
  if (dhp < -180) dhp += 360;
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * Math.PI) / 360);
  const Lbp = (L1 + L2) / 2, Cbp = (Cp1 + Cp2) / 2;
  const hbp = Cp1 * Cp2 === 0 ? h1p + h2p
    : Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;
  const T = 1 - 0.17 * Math.cos(((hbp - 30) * Math.PI) / 180)
    + 0.24 * Math.cos((2 * hbp * Math.PI) / 180)
    + 0.32 * Math.cos(((3 * hbp + 6) * Math.PI) / 180)
    - 0.2 * Math.cos(((4 * hbp - 63) * Math.PI) / 180);
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    * Math.sin((60 * Math.exp(-(((hbp - 275) / 25) ** 2)) * Math.PI) / 180);
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2
    + Rt * (dCp / Sc) * (dHp / Sh));
};

/* ---------- read the palette out of the files that ship ---------- */

const tokensCss = read("./tokens.css");
const demoCss = read("./demo.css");

const light = {}, dark = {};
for (const [, name, l, d] of tokensCss.matchAll(
  /(--[\w-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/g,
)) {
  light[name] = l.toLowerCase();
  dark[name] = d.toLowerCase();
}
if (!Object.keys(light).length) {
  console.error("No light-dark() pairs in tokens.css. If the floor was inverted, fix this script.");
  process.exit(1);
}

const washMatch = demoCss.match(/--wash:\s*(\d+(?:\.\d+)?)%/);
if (!washMatch) {
  console.error("No --wash in demo.css. The chip checks below have nothing to measure against.");
  process.exit(1);
}
const WASH = Number(washMatch[1]) / 100;

const modes = [["light", light], ["dark", dark]];

/* ---------- the claims, and the thresholds that make them claims ---------- */

const AA_TEXT = 4.5;      // WCAG 2.1 SC 1.4.3, normal text
const NON_TEXT = 3;       // WCAG 2.2 SC 1.4.11, focus rings and other non-text
const APART = 10;         // ΔE2000 — below this, two severities read as the same color

// Severity text is set on --bg; `info` deliberately reuses --muted (no --info token).
const SEVERITY = ["--fatal", "--err", "--warn", "--muted", "--usage"];
// State chips draw their text on a --wash of their own color, not on --bg. See #4.
const CHIPS = [[".verdict.valid", "--ok"], [".verdict.invalid", "--err"], [".sev.fatal", "--fatal"]];
// A focus ring must clear 3:1 against everything it can land beside, not just the page.
const RING_AGAINST = ["--bg", "--card", "--border"];
// Pairs a reader must be able to tell apart at a glance.
const PAIRS = [["--fatal", "--err"], ["--usage", "--muted"]];

const rows = [];
const fail = [];
const check = (ok, mode, what, got, want, unit) => {
  rows.push({ mode, what, got, want, unit, ok });
  if (!ok) fail.push(`${mode.padEnd(5)} ${what} — ${got.toFixed(2)}${unit}, needs ${want}${unit}`);
};

for (const [mode, t] of modes) {
  for (const tok of SEVERITY) {
    if (!(tok in t)) { fail.push(`${mode} ${tok} — not in tokens.css`); continue; }
    const r = contrast(t[tok], t["--bg"]);
    check(r >= AA_TEXT, mode, `${tok} on --bg`, r, AA_TEXT, ":1");
  }
  for (const [chip, tok] of CHIPS) {
    const bg = wash(t[tok], t["--bg"], WASH);
    const r = contrast(t[tok], bg);
    check(r >= AA_TEXT, mode, `${chip} on its own ${washMatch[1]}% wash`, r, AA_TEXT, ":1");
  }
  for (const against of RING_AGAINST) {
    const r = contrast(t["--accent"], t[against]);
    check(r >= NON_TEXT, mode, `focus ring vs ${against}`, r, NON_TEXT, ":1");
  }
  for (const [a, b] of PAIRS) {
    const d = deltaE(t[a], t[b]);
    check(d >= APART, mode, `${a} vs ${b} (told apart)`, d, APART, " ΔE");
  }
}

/* ---------- report ---------- */

if (process.argv.includes("--table")) {
  let mode = null;
  for (const r of rows) {
    if (r.mode !== mode) { mode = r.mode; console.log(`\n${mode.toUpperCase()}  (--bg ${(mode === "light" ? light : dark)["--bg"]})`); }
    const val = r.unit === " ΔE" ? r.got.toFixed(1) : r.got.toFixed(2);
    console.log(`  ${r.what.padEnd(38)} ${val.padStart(6)}${r.unit.padEnd(3)} min ${r.want}   ${r.ok ? "ok" : "FAIL"}`);
  }
  console.log("");
}

if (fail.length) {
  console.error(`tokens.css / demo.css: ${fail.length} measured claim(s) no longer hold\n`);
  for (const f of fail) console.error(`  ${f}`);
  console.error("\nEither the palette moved or the comments lie. Fix one of them.");
  process.exit(1);
}

console.log(
  `palette: ${Object.keys(light).length} tokens, wash ${washMatch[1]}%. ` +
  `${rows.length} measured claims hold (AA ${AA_TEXT}:1 text, ${NON_TEXT}:1 non-text, ΔE ≥ ${APART}).`,
);
