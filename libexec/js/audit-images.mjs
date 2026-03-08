#!/usr/bin/env node
// Audit all image references in built HTML pages.
// Expects REPO_ROOT env var (set by libexec/dash).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel dash')");
  process.exit(1);
}

const buildDir = join(REPO_ROOT, "build", "_html");
const files = readdirSync(buildDir).filter(f => f.endsWith(".html")).sort();
const allImages = [];

for (const file of files) {
  const slug = basename(file, ".html");
  const html = readFileSync(join(buildDir, file), "utf-8");

  const imgMatches = html.matchAll(/src=["']([^"']+)["']/g);
  for (const m of imgMatches) {
    const src = m[1];
    if (src.startsWith("data:")) continue;

    if (src.startsWith("http://") || src.startsWith("https://")) {
      allImages.push({ slug, src: src.substring(0, 120), status: "external" });
    } else {
      const localPath = join(buildDir, src);
      if (existsSync(localPath)) {
        allImages.push({ slug, src, status: "ok" });
      } else {
        allImages.push({ slug, src, status: "MISSING" });
      }
    }
  }
}

// Report
const missing = allImages.filter(i => i.status === "MISSING");
const localOk = allImages.filter(i => i.status === "ok");
const external = allImages.filter(i => i.status === "external");

console.log(`Local images OK: ${localOk.length}`);
console.log(`Local images MISSING: ${missing.length}`);
missing.forEach(i => console.log(`  ${i.slug}: ${i.src}`));
console.log();
console.log(`External images: ${external.length}`);

// Group external by domain
const domains = {};
external.forEach(i => {
  try {
    const u = new URL(i.src);
    domains[u.hostname] = (domains[u.hostname] || 0) + 1;
  } catch (e) {
    domains["INVALID"] = (domains["INVALID"] || 0) + 1;
  }
});
Object.entries(domains)
  .sort((a, b) => b[1] - a[1])
  .forEach(([d, c]) => console.log(`  ${d}: ${c}`));

// Show pages with images
console.log();
console.log("Pages with images:");
const bySlug = {};
allImages.forEach(i => {
  if (!bySlug[i.slug]) bySlug[i.slug] = [];
  bySlug[i.slug].push(i);
});
Object.entries(bySlug).forEach(([slug, imgs]) => {
  const m = imgs.filter(i => i.status === "MISSING").length;
  const ext = imgs.filter(i => i.status === "external").length;
  const ok = imgs.filter(i => i.status === "ok").length;
  console.log(`  ${slug}: ${imgs.length} images (${ok} local ok, ${ext} external, ${m} missing)`);
});
