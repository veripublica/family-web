#!/usr/bin/env node
// veripublica family-web — check-tokens.mjs
//
// tokens.css states every color twice: once in a light-dark() pair, and once in
// the @supports floor for browsers that lack light-dark(). The floor carries a
// comment saying the two must match — but a comment is a wish, and two copies of
// a value in one file is exactly the drift this repository exists to end.
//
// This makes the wish loud. It fails if a pair and the floor disagree, or if a
// token appears in one and not the other.
//
// Run: node template/check-tokens.mjs
//
// DELETE THIS FILE together with the floor block in tokens.css. Once every value
// is stated once, there is nothing left to check, and a check that can never fail
// is a lie about how much is being verified.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("./tokens.css", import.meta.url));
const css = readFileSync(path, "utf8");

const pairs = new Map();
for (const [, name, light, dark] of css.matchAll(
  /(--[\w-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)/g,
)) {
  pairs.set(name, { light: light.toLowerCase(), dark: dark.toLowerCase() });
}

const floorStart = css.indexOf("@supports not");
if (floorStart === -1) {
  console.error("No @supports floor found. If it was deleted on purpose, delete this script too.");
  process.exit(1);
}
const [floorLightSrc, floorDarkSrc = ""] = css.slice(floorStart).split("prefers-color-scheme: dark");

const plain = (src) => {
  const out = new Map();
  for (const [, name, hex] of src.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    out.set(name, hex.toLowerCase());
  }
  return out;
};
const floor = { light: plain(floorLightSrc), dark: plain(floorDarkSrc) };

const problems = [];
for (const [name, pair] of pairs) {
  for (const mode of ["light", "dark"]) {
    const got = floor[mode].get(name);
    if (got === undefined) problems.push(`${name}: missing from the ${mode} floor`);
    else if (got !== pair[mode]) problems.push(`${name} (${mode}): pair says ${pair[mode]}, floor says ${got}`);
  }
}
for (const mode of ["light", "dark"]) {
  for (const name of floor[mode].keys()) {
    if (!pairs.has(name)) problems.push(`${name}: in the ${mode} floor but has no light-dark() pair`);
  }
}

if (problems.length) {
  console.error(`tokens.css: floor has drifted from the light-dark() pairs\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\n${problems.length} problem(s). Fix tokens.css, or delete the floor and this script.`);
  process.exit(1);
}

console.log(`tokens.css: ${pairs.size} tokens, floor matches every light-dark() pair.`);
