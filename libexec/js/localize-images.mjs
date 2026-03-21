#!/usr/bin/env node
// Download external resources and rewrite references to local paths.
//
// Handles two types of remote references:
//   1. <img src="https://...">       — images in HTML (per-page, slug-prefixed)
//   2. url(https://...) in HTML       — CSS mask-image icons from Mintlify (shared)
//
// Expects REPO_ROOT and NAVEL_HOME env vars (set by libexec/dash).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel dash')");
  process.exit(1);
}
const NAVEL_HOME = process.env.NAVEL_HOME || REPO_ROOT;

const buildDir = join(NAVEL_HOME, "build", "_html");
const imgDir = join(buildDir, "images");
const iconsDir = join(buildDir, "icons");
// Ensure output dirs exist
for (const dir of [imgDir, iconsDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

let downloadCount = 0;
let rewriteCount = 0;

// ── Download helper (shared cache by local path) ──────────────────────

function download(url, localPath) {
  if (existsSync(localPath)) return true;
  const name = basename(localPath);
  console.log(`  Downloading: ${name}`);
  try {
    execSync(`curl -sL -o "${localPath}" "${url}"`, { timeout: 30000 });
    downloadCount++;
    return true;
  } catch (e) {
    console.error(`  FAILED: ${name} — ${e.message}`);
    return false;
  }
}

// ── Phase 1 & 2: Process HTML files ───────────────────────────────────

const htmlFiles = readdirSync(buildDir).filter(f => f.endsWith(".html")).sort();

for (const file of htmlFiles) {
  const filePath = join(buildDir, file);
  let html = readFileSync(filePath, "utf-8");
  let modified = false;
  const slug = basename(file, ".html");

  // Phase 1: <img src="https://..."> — per-page images
  const srcPattern = /src="(https?:\/\/[^"]+)"/g;
  let match;
  const srcReplacements = [];

  while ((match = srcPattern.exec(html)) !== null) {
    const fullMatch = match[0];
    const url = match[1].replace(/&amp;/g, "&");
    const urlObj = new URL(url);
    const rawFilename = urlObj.pathname.split("/").pop();
    const localFilename = `${slug}--${rawFilename}`;
    const localPath = join(imgDir, localFilename);

    if (download(url, localPath)) {
      srcReplacements.push({ from: fullMatch, to: `src="images/${localFilename}"` });
    }
  }

  for (const r of srcReplacements) {
    html = html.replace(r.from, r.to);
    modified = true;
    rewriteCount++;
  }

  // Phase 2: url(https://...) in inline CSS — shared icons
  // Mintlify renders icon="foo" as mask-image:url(https://cdn/.../foo.svg)
  // Each URL appears twice per element (-webkit-mask-image + mask-image)
  const cssUrlPattern = /url\((https?:\/\/[^)]+)\)/g;
  const urlReplacements = new Map(); // url → local relative path

  while ((match = cssUrlPattern.exec(html)) !== null) {
    const url = match[1];
    if (urlReplacements.has(url)) continue;

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    // e.g. /v7.1.0/regular/hammer.svg → regular--hammer.svg
    const localFilename = pathParts.length >= 2
      ? `${pathParts[pathParts.length - 2]}--${pathParts[pathParts.length - 1]}`
      : pathParts[pathParts.length - 1];
    const localPath = join(iconsDir, localFilename);

    if (download(url, localPath)) {
      urlReplacements.set(url, `icons/${localFilename}`);
    }
  }

  for (const [url, localRel] of urlReplacements) {
    // Replace all occurrences of this URL in the file
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const globalPattern = new RegExp(`url\\(${escaped}\\)`, "g");
    const count = (html.match(globalPattern) || []).length;
    html = html.replace(globalPattern, `url(${localRel})`);
    if (count > 0) {
      modified = true;
      rewriteCount += count;
    }
  }

  if (modified) {
    writeFileSync(filePath, html);
    console.log(`  Rewrote ${file}`);
  }
}

console.log(`\nDone: ${downloadCount} downloaded, ${rewriteCount} references rewritten`);
