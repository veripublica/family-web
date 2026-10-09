#!/usr/bin/env node
// veripublica family-web — check-copies.mjs
//
// A consumer never edits its copy; a change worth making is made here. That rule
// lived in a README section and in a comment in every demo's own page, and it was
// still broken twice (#14): epubveri added two components to its copy of demo.css,
// beside their neighbours, and nothing noticed. A comment only stops the person
// who reads it. This is the guard that does not depend on that.
//
// It reads each consumer's PUBLISHED copies — what readers actually get — takes
// the template version from the copy's own first line, and compares the bytes
// with that version in this repository's tags. Nothing is installed in any
// consumer and nothing is asked of them.
//
// Three outcomes per file:
//   identical  the copy is a template version, byte for byte
//   behind     identical to an older version than the latest — not a failure;
//              consumers re-copy on their own schedule
//   DRIFT      the bytes match no tag of the version the file claims — the copy
//              was edited. This is the one that fails.
//
// Run: node template/check-copies.mjs        (needs the tags: git fetch --tags)

import { execFileSync } from "node:child_process";

// Who copies what (CLAUDE.md "Consumers", template README "Consumption model").
const CONSUMERS = [
  { name: "epubveri", base: "https://veripublica.github.io/epubveri/", files: ["tokens.css", "demo.css"] },
  { name: "epubsana", base: "https://veripublica.github.io/epubsana/", files: ["tokens.css", "demo.css"] },
  { name: "kepubverto", base: "https://veripublica.github.io/kepubverto/", files: ["tokens.css", "demo.css"] },
  { name: "conventions", base: "https://veripublica.github.io/conventions/assets/", files: ["tokens.css"] },
];

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 24 });
const versionOf = (text) => text.split("\n", 1)[0].match(/template v(\d+)\b/)?.[1];

// Every tagged byte-state of every template file, by template version.
// Patch tags carry the same bytes as their minor tag; keeping all of them costs
// nothing and makes "matches some tag of that version" exact.
const tags = git("tag", "--list", "v*").split("\n").filter(Boolean);
const known = new Map(); // "demo.css" -> Map(version -> Set(content))
let latest = 0;
for (const tag of tags) {
  for (const file of ["tokens.css", "demo.css"]) {
    let text;
    try {
      text = git("show", `${tag}:template/${file}`);
    } catch {
      continue; // the file did not exist at that tag
    }
    const v = versionOf(text);
    if (!v) continue;
    latest = Math.max(latest, Number(v));
    if (!known.has(file)) known.set(file, new Map());
    if (!known.get(file).has(v)) known.get(file).set(v, new Set());
    known.get(file).get(v).add(text);
  }
}
if (!latest) {
  console.error("No template versions found in tags. Run: git fetch --tags");
  process.exit(1);
}

const rows = [];
let drift = 0;
let unreachable = 0;
await Promise.all(
  CONSUMERS.flatMap((c) =>
    c.files.map(async (file) => {
      const url = c.base + file;
      let text;
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        text = await r.text();
      } catch (e) {
        unreachable++;
        rows.push([c.name, file, "UNREACHABLE", `${url}: ${e.message}`]);
        return;
      }
      const v = versionOf(text);
      if (!v) {
        drift++;
        rows.push([c.name, file, "DRIFT", "first line names no template version"]);
        return;
      }
      if (known.get(file)?.get(v)?.has(text)) {
        rows.push([c.name, file, Number(v) < latest ? "behind" : "identical", `v${v}`]);
        return;
      }
      // Name the first line that differs, so the report points at the edit. A
      // version can have more than one byte-state (v0.3.1 changed comments in
      // v3's files), so compare with the one the copy is closest to.
      const got = text.split("\n");
      const firstDiff = (want) => {
        const i = got.findIndex((line, j) => line !== want[j]);
        return i === -1 ? got.length : i;
      };
      const want =
        [...(known.get(file)?.get(v) ?? [])]
          .map((t) => t.split("\n"))
          .sort((a, b) => firstDiff(b) - firstDiff(a))[0] ?? [];
      const at = firstDiff(want);
      drift++;
      rows.push([
        c.name,
        file,
        "DRIFT",
        want.length
          ? `claims v${v}; first difference at line ${at + 1} (${got.length - want.length >= 0 ? "+" : ""}${got.length - want.length} lines)`
          : `claims v${v}, which no tag has`,
      ]);
    }),
  ),
);

rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
const w = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length)));
for (const r of rows) console.log(r.map((c, i) => (i < 3 ? c.padEnd(w[i]) : c)).join("  "));
console.log();

if (drift || unreachable) {
  console.error(`${drift} edited cop${drift === 1 ? "y" : "ies"}, ${unreachable} unreachable. A consumer never edits its copy: the change goes upstream, the copy is re-copied.`);
  process.exit(1);
}
console.log(`Every published copy is a template version, byte for byte (latest: v${latest}).`);
