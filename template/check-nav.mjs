#!/usr/bin/env node
// veripublica family-web — check-nav.mjs
//
// The family nav is fetched at runtime from nav.json (#2), so a mistake there
// goes live on every demo within minutes, without a release to catch it. This is
// the check that stands where a release would have stood.
//
// It fails if nav.json is malformed, if an entry would be skipped by the page's
// own filter, or if any URL does not open for an anonymous visitor — which is
// how every demo on template v3 showed a publisher a 404 for epublift (#12).
//
// It also holds the family's address rule (#13): a member lives under
// github.com/veripublica/, and the exceptions are listed below by exact URL. The
// page itself only checks the host — a new exception is a line here, not a
// re-copy in every demo — so this list is where that decision is enforced.
//
// It does NOT judge membership. Whether a tool belongs on the nav is #10's rule —
// "a publisher would click it and be glad" — and that is a judgement made in an
// issue, not a check.
//
// It also compares nav.json with the fallback list in skeleton.html. Between
// template releases the two may differ (that is the point of #2); at a release
// they must not, so --release turns the difference into a failure.
//
// Run: node template/check-nav.mjs [nav.json path or URL] [--release]
//      (default: the published https://veripublica.github.io/family-web/nav.json)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LIVE = "https://veripublica.github.io/family-web/nav.json";

// Where a member may live. Adding an exception is a decision: make it in an issue.
const ORG = "https://github.com/veripublica/";
const EXCEPTIONS = new Set([
  "https://github.com/ePubLift/epublift", // came before the family (#12)
]);
const allowed = (url) => (url.startsWith(ORG) && /^[\w.-]+$/.test(url.slice(ORG.length))) || EXCEPTIONS.has(url);
const args = process.argv.slice(2);
const release = args.includes("--release");
const source = args.find((a) => !a.startsWith("--")) ?? LIVE;

const problems = [];

let data;
try {
  const text = /^https?:\/\//.test(source)
    ? await fetch(source).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
    : readFileSync(source, "utf8");
  data = JSON.parse(text);
} catch (e) {
  console.error(`nav.json: cannot read ${source}: ${e.message}`);
  process.exit(1);
}

// The page's own filter (skeleton.html), plus the address rule. An entry the page would skip is an
// entry nobody sees, so it is a problem here, not a silent drop.
const tools = Array.isArray(data?.tools) ? data.tools : null;
if (!tools?.length) problems.push(`no "tools" array, or it is empty`);
const names = new Set();
for (const [i, t] of (tools ?? []).entries()) {
  if (typeof t?.name !== "string" || !t.name.trim()) problems.push(`tools[${i}]: no name`);
  else if (names.has(t.name)) problems.push(`tools[${i}]: "${t.name}" listed twice`);
  else names.add(t.name);
  if (!/^https:\/\/[^\s]+$/.test(t?.url ?? "")) problems.push(`tools[${i}] (${t?.name}): url must be https:// with no spaces, got ${JSON.stringify(t?.url)}`);
  else if (!allowed(t.url)) problems.push(`tools[${i}] (${t?.name}): ${t.url} is neither a ${ORG}<repo> URL nor a listed exception`);
}

// Anonymous, as a publisher would arrive: no token, no cookies. GitHub answers a
// private or missing repository with 404, so this is also the "is it public" test.
const good = (tools ?? []).filter((t) => /^https:\/\/[^\s]+$/.test(t?.url ?? ""));
await Promise.all(
  good.map(async (t) => {
    try {
      const r = await fetch(t.url, { redirect: "follow" });
      if (r.status !== 200) problems.push(`${t.name}: ${t.url} answers HTTP ${r.status}`);
    } catch (e) {
      problems.push(`${t.name}: ${t.url} unreachable (${e.cause?.code ?? e.message})`);
    }
  }),
);

// The fallback list in skeleton.html: the <a> elements inside #family-tools.
const html = readFileSync(fileURLToPath(new URL("./skeleton.html", import.meta.url)), "utf8");
const box = html.match(/<span id="family-tools">([\s\S]*?)<\/span>/);
const fallback = box
  ? [...box[1].matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, url, name]) => `${name.trim()} ${url}`)
  : null;
const current = good.map((t) => `${t.name} ${t.url}`);
let drift = null;
if (!fallback) problems.push(`skeleton.html: no <span id="family-tools"> fallback list found`);
else if (fallback.join("\n") !== current.join("\n")) {
  drift = `skeleton.html fallback: ${fallback.map((f) => f.split(" ")[0]).join(", ")}\n` +
          `nav.json:               ${current.map((f) => f.split(" ")[0]).join(", ")}`;
  if (release) problems.push(`the fallback list in skeleton.html differs from nav.json (names, URLs or order):\n    ${drift.replace(/\n/g, "\n    ")}`);
}

if (problems.length) {
  console.error(`nav.json (${source}): ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`nav.json: ${good.length} tools, every URL opens anonymously.`);
if (drift) console.log(`note: the fallback differs — fine between releases, fold it into the next template version:\n  ${drift.replace(/\n/g, "\n  ")}`);
