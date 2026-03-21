#!/usr/bin/env node
// fetch-nav.mjs — Extract navigation structure from code.claude.com
//
// The Mintlify site embeds its nav config as double-escaped JSON in the
// HTML. This script fetches the overview page, finds the tabs/groups/pages
// structure, and writes it to build/_html/nav.json.
//
// Expects REPO_ROOT and NAVEL_HOME env vars (set by libexec/dash).

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseNavTabs } from "./dash-transforms.mjs";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel dash')");
  process.exit(1);
}
const NAVEL_HOME = process.env.NAVEL_HOME || REPO_ROOT;

const reportsDir = join(NAVEL_HOME, "reports");
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

const DOCS_URL = "https://code.claude.com/docs/en/overview";

console.log("Fetching navigation structure...");

const res = await fetch(DOCS_URL);
if (!res.ok) {
  console.error(`error: fetch failed with ${res.status}`);
  process.exit(1);
}

const html = await res.text();

// The nav structure is embedded as double-escaped JSON inside a script tag.
// Look for the variant with simple string page slugs (not the sidebarTitle variant).
const marker = '\\"pages\\":[\\"en/overview\\"';
const markerIdx = html.indexOf(marker);
if (markerIdx === -1) {
  console.error("error: navigation structure not found in page HTML");
  process.exit(1);
}

// Back up to find "tabs": and extract the full JSON array
const searchStart = Math.max(0, markerIdx - 2000);
const chunk = html.substring(searchStart, markerIdx + 50000);
const unescaped = chunk.replace(/\\"/g, '"');

const tabsKey = '"tabs":';
const pagesKey = '"pages":["en/overview"';
const pagesPos = unescaped.indexOf(pagesKey);
const tabsPos = unescaped.lastIndexOf(tabsKey, pagesPos);

if (tabsPos === -1) {
  console.error("error: could not find tabs array start");
  process.exit(1);
}

const fromTabs = unescaped.substring(tabsPos + tabsKey.length);

// Find the balanced end of the outer array
let depth = 0;
let end = 0;
for (let i = 0; i < fromTabs.length && i < 100000; i++) {
  if (fromTabs[i] === "[") depth++;
  if (fromTabs[i] === "]") depth--;
  if (depth === 0) { end = i + 1; break; }
}

const tabs = JSON.parse(fromTabs.substring(0, end));

const output = parseNavTabs(tabs);
const { navOrder } = output;
const outPath = join(reportsDir, "nav.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`  ${navOrder.length} pages in ${tabs.length} tabs`);
console.log(`  Wrote ${outPath}`);
