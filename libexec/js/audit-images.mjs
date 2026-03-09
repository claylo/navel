#!/usr/bin/env node
// Audit all external resource references in built HTML and CSS.
// Checks <img src>, CSS url(), and @font-face — the same patterns
// that localize-images.mjs rewrites.
//
// Expects REPO_ROOT env var (set by libexec/dash).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel dash')");
  process.exit(1);
}

const buildDir = join(REPO_ROOT, "build", "_html");
const allRefs = [];

function addRef(slug, src, type, status) {
  allRefs.push({ slug, src: src.substring(0, 120), type, status });
}

function checkLocal(src) {
  return existsSync(join(buildDir, src)) ? "ok" : "MISSING";
}

function isExternal(src) {
  return src.startsWith("http://") || src.startsWith("https://");
}

// ── Audit HTML files ──────────────────────────────────────────────────

const htmlFiles = readdirSync(buildDir).filter(f => f.endsWith(".html")).sort();

for (const file of htmlFiles) {
  const slug = basename(file, ".html");
  const html = readFileSync(join(buildDir, file), "utf-8");

  // <img src="..."> and other src attributes
  for (const m of html.matchAll(/src=["']([^"']+)["']/g)) {
    const src = m[1];
    if (src.startsWith("data:")) continue;
    const status = isExternal(src) ? "external" : checkLocal(src);
    addRef(slug, src, "img-src", status);
  }

  // CSS url(https://...) in inline styles (mask-image icons, etc.)
  for (const m of html.matchAll(/url\((https?:\/\/[^)]+)\)/g)) {
    addRef(slug, m[1], "css-url", "external");
  }
  for (const m of html.matchAll(/url\(([^)]+)\)/g)) {
    const src = m[1];
    if (isExternal(src) || src.startsWith("data:")) continue;
    addRef(slug, src, "css-url", checkLocal(src));
  }
}

// ── Audit theme.css ───────────────────────────────────────────────────

const themePath = join(buildDir, "theme.css");
if (existsSync(themePath)) {
  const css = readFileSync(themePath, "utf-8");
  for (const m of css.matchAll(/url\("([^"]+)"\)/g)) {
    const src = m[1];
    const status = isExternal(src) ? "external" : checkLocal(src);
    addRef("theme.css", src, "font-face", status);
  }
}

// ── Report ────────────────────────────────────────────────────────────

const missing = allRefs.filter(r => r.status === "MISSING");
const localOk = allRefs.filter(r => r.status === "ok");
const external = allRefs.filter(r => r.status === "external");

console.log(`Local refs OK: ${localOk.length}`);
console.log(`Local refs MISSING: ${missing.length}`);
missing.forEach(r => console.log(`  ${r.slug} [${r.type}]: ${r.src}`));
console.log();
console.log(`External refs: ${external.length}`);

// Group external by domain
const domains = {};
external.forEach(r => {
  try {
    const u = new URL(r.src);
    domains[u.hostname] = (domains[u.hostname] || 0) + 1;
  } catch {
    domains["INVALID"] = (domains["INVALID"] || 0) + 1;
  }
});
Object.entries(domains)
  .sort((a, b) => b[1] - a[1])
  .forEach(([d, c]) => console.log(`  ${d}: ${c}`));

if (external.length > 0) {
  console.log("\nExternal refs by page:");
  const bySlug = {};
  external.forEach(r => {
    if (!bySlug[r.slug]) bySlug[r.slug] = [];
    bySlug[r.slug].push(r);
  });
  Object.entries(bySlug).forEach(([slug, refs]) => {
    console.log(`  ${slug}: ${refs.length}`);
    refs.forEach(r => console.log(`    [${r.type}] ${r.src}`));
  });
}

// Exit with error if any external resources found (useful in CI)
if (external.length > 0) {
  process.exit(1);
}
