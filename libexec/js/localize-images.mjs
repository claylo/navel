#!/usr/bin/env node
// Download external images and rewrite HTML src attributes to local paths.
// Expects REPO_ROOT env var (set by libexec/dash).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel dash')");
  process.exit(1);
}

const buildDir = join(REPO_ROOT, "build", "_html");
const imgDir = join(buildDir, "images");

// Ensure images dir exists
if (!existsSync(imgDir)) {
  mkdirSync(imgDir, { recursive: true });
}

const files = readdirSync(buildDir).filter(f => f.endsWith(".html")).sort();
let downloadCount = 0;
let rewriteCount = 0;

for (const file of files) {
  const filePath = join(buildDir, file);
  let html = readFileSync(filePath, "utf-8");
  let modified = false;

  // Find all external image src attributes
  const extPattern = /src="(https?:\/\/[^"]+)"/g;
  let match;
  const replacements = [];

  while ((match = extPattern.exec(html)) !== null) {
    const fullMatch = match[0];
    const url = match[1];

    // Decode HTML entities in URL
    const cleanUrl = url.replace(/&amp;/g, "&");

    // Extract a clean filename from the URL path
    const urlObj = new URL(cleanUrl);
    const pathParts = urlObj.pathname.split("/");
    const rawFilename = pathParts[pathParts.length - 1];

    // Prefix with slug to avoid collisions
    const slug = basename(file, ".html");
    const localFilename = `${slug}--${rawFilename}`;
    const localPath = join(imgDir, localFilename);
    const relativePath = `images/${localFilename}`;

    // Download if not already cached
    if (!existsSync(localPath)) {
      console.log(`Downloading: ${localFilename}`);
      try {
        execSync(`curl -sL -o "${localPath}" "${cleanUrl}"`, { timeout: 30000 });
        downloadCount++;
      } catch (e) {
        console.error(`  FAILED: ${e.message}`);
        continue;
      }
    } else {
      console.log(`Cached: ${localFilename}`);
    }

    replacements.push({ from: fullMatch, to: `src="${relativePath}"` });
  }

  // Apply replacements
  for (const r of replacements) {
    html = html.replace(r.from, r.to);
    modified = true;
    rewriteCount++;
  }

  if (modified) {
    writeFileSync(filePath, html);
    console.log(`  Rewrote ${file}`);
  }
}

console.log(`\nDone: ${downloadCount} downloaded, ${rewriteCount} src attributes rewritten`);
