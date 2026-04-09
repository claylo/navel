#!/usr/bin/env node
// pdf-render.mjs — Convert MDX docs to Typst markup for PDF generation.
//
// Pipeline: MDX → flatten components → markdown2typst → .typ files
//
// Reads docs/*.md, flattens interactive MDX components (Tabs, Accordions,
// Cards) into plain markdown, then converts to Typst via markdown2typst.
// Writes individual .typ files to build/_typ/pages/ and a pages.typ
// manifest that main.typ imports.
//
// Expects REPO_ROOT and NAVEL_HOME env vars (set by libexec/pdf).
// REPO_ROOT = install prefix (node_modules). NAVEL_HOME = data home (docs, reports, build).

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";
import { preprocessMdx, truncateChangelog, parseNavTabs } from "./dash-transforms.mjs";

const REPO_ROOT = process.env.REPO_ROOT;
if (!REPO_ROOT) {
  console.error("error: REPO_ROOT not set (run via 'navel pdf')");
  process.exit(1);
}
const NAVEL_HOME = process.env.NAVEL_HOME || REPO_ROOT;

const docsDir = join(NAVEL_HOME, "docs");
const buildDir = join(NAVEL_HOME, "build", "_typ");
const pagesDir = join(buildDir, "pages");
const mdOutDir = join(NAVEL_HOME, "build", "_md");
const nm = join(REPO_ROOT, "node_modules");

// ── Load markdown2typst ───────────────────────────────────────────────

const { markdown2typst } = await import(join(nm, "markdown2typst/dist/markdown2typst.js"));

// ── Load nav order ────────────────────────────────────────────────────

const reportsDir = process.env.NAVEL_REPORTS_DIR || join(NAVEL_HOME, "reports");
const navPath = join(reportsDir, "nav.json");
if (!existsSync(navPath)) {
  console.error(`error: nav.json not found in ${reportsDir} — run 'navel docs sync' first`);
  process.exit(1);
}
const { navMap: NAV_GROUP_MAP, navOrder: NAV_ORDER } = JSON.parse(readFileSync(navPath, "utf-8"));

// ── MDX Parser ───────────────────────────────────────────────────────
// Two-pass MDX→markdown flattener inspired by dioxus-mdx (MIT).
// Pass 1: Parse MDX into a DocNode AST (recursive, handles nesting).
// Pass 2: Serialize AST back to clean, flat markdown.

// ── AST node types ──────────────────────────────────────────────────

// DocNode := { type, ...fields }
// Types: markdown, callout, card, cardGroup, tabs, steps,
//        accordionGroup, codeBlock, codeGroup, frame

// ── Parser utilities ────────────────────────────────────────────────

/** Find closing </tagName>, tracking nesting depth. */
function findClosingTag(content, tagName) {
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let depth = 1;
  let pos = 0;

  while (depth > 0 && pos < content.length) {
    const nextOpen = content.indexOf(openTag, pos);
    const nextClose = content.indexOf(closeTag, pos);

    if (nextClose === -1) return -1; // no closing tag

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Verify it's actually an opening tag (not a substring match)
      const charAfter = content[nextOpen + openTag.length];
      if (charAfter === ">" || charAfter === " " || charAfter === "\n") {
        depth++;
      }
      pos = nextOpen + openTag.length;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      pos = nextClose + closeTag.length;
    }
  }
  return -1;
}

/** Extract attribute value from a tag string: title="Foo" → Foo */
function extractAttr(tagContent, attrName) {
  const m = tagContent.match(new RegExp(`${attrName}="([^"]*)"`));
  return m ? m[1] : null;
}

/** Dedent content that was indented inside MDX components.
 *  Finds the minimum indentation across non-empty, non-image lines and
 *  strips it. Standalone image lines get fully trimmed since they're
 *  block-level elements that don't need indentation. */
function dedent(text) {
  const lines = text.split("\n");
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    // Skip standalone image lines when calculating min indent —
    // they may be extra-indented (Mintlify Frame style)
    if (/^\s*!\[/.test(line)) continue;
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent === Infinity) minIndent = 0;
  return lines.map(l => {
    // Fully trim standalone image lines
    if (/^\s*!\[/.test(l)) return l.trim();
    if (minIndent === 0) return l;
    return l.slice(Math.min(minIndent, l.length));
  }).join("\n");
}

// ── Component parsers ───────────────────────────────────────────────
// Each returns { node, rest } or null.

const CALLOUT_TYPES = ["Tip", "Note", "Warning", "Info", "Check", "Caution", "Callout"];

function tryParseCallout(content) {
  for (const type of CALLOUT_TYPES) {
    if (!content.startsWith(`<${type}`)) continue;
    const tagEnd = content.indexOf(">");
    if (tagEnd === -1) continue;
    const afterOpen = content.slice(tagEnd + 1);
    const closeIdx = findClosingTag(afterOpen, type);
    if (closeIdx === -1) continue;
    const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
    const rest = afterOpen.slice(closeIdx + `</${type}>`.length);
    return {
      node: { type: "callout", calloutType: type === "Callout" ? "Note" : type, content: inner },
      rest,
    };
  }
  return null;
}

function tryParseTabs(content) {
  if (!content.startsWith("<Tabs")) return null;
  const tagEnd = content.indexOf(">", 5);
  if (tagEnd === -1) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "Tabs");
  if (closeIdx === -1) return null;
  const inner = afterOpen.slice(0, closeIdx);
  const rest = afterOpen.slice(closeIdx + "</Tabs>".length);

  // Parse individual <Tab> elements
  const tabs = [];
  let remaining = inner.trim();
  while (remaining.length > 0) {
    remaining = remaining.trim();
    const tabMatch = remaining.match(/^<Tab\s+title="([^"]*)"[^>]*>/);
    if (tabMatch) {
      const title = tabMatch[1];
      const tabAfterOpen = remaining.slice(tabMatch[0].length);
      const tabCloseIdx = findClosingTag(tabAfterOpen, "Tab");
      if (tabCloseIdx !== -1) {
        const tabInner = dedent(tabAfterOpen.slice(0, tabCloseIdx)).trim();
        tabs.push({ title, content: parseContent(tabInner) });
        remaining = tabAfterOpen.slice(tabCloseIdx + "</Tab>".length);
        continue;
      }
    }
    // Skip to next <Tab or break
    const next = remaining.indexOf("<Tab", 1);
    if (next === -1) break;
    remaining = remaining.slice(next);
  }

  return { node: { type: "tabs", tabs }, rest };
}

function tryParseSteps(content) {
  if (!content.startsWith("<Steps")) return null;
  const tagEnd = content.indexOf(">", 6);
  if (tagEnd === -1) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "Steps");
  if (closeIdx === -1) return null;
  const inner = afterOpen.slice(0, closeIdx);
  const rest = afterOpen.slice(closeIdx + "</Steps>".length);

  const steps = [];
  let remaining = inner.trim();
  while (remaining.length > 0) {
    remaining = remaining.trim();
    const stepMatch = remaining.match(/^<Step\s+[^>]*title="([^"]*)"[^>]*>/);
    if (stepMatch) {
      const title = stepMatch[1];
      const stepAfterOpen = remaining.slice(stepMatch[0].length);
      const stepCloseIdx = findClosingTag(stepAfterOpen, "Step");
      if (stepCloseIdx !== -1) {
        const stepInner = dedent(stepAfterOpen.slice(0, stepCloseIdx)).trim();
        steps.push({ title, content: parseContent(stepInner) });
        remaining = stepAfterOpen.slice(stepCloseIdx + "</Step>".length);
        continue;
      }
    }
    const next = remaining.indexOf("<Step", 1);
    if (next === -1) break;
    remaining = remaining.slice(next);
  }

  return { node: { type: "steps", steps }, rest };
}

function tryParseAccordionGroup(content) {
  if (!content.startsWith("<AccordionGroup")) return null;
  const tagEnd = content.indexOf(">", 15);
  if (tagEnd === -1) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "AccordionGroup");
  if (closeIdx === -1) return null;
  const inner = afterOpen.slice(0, closeIdx);
  const rest = afterOpen.slice(closeIdx + "</AccordionGroup>".length);

  return { node: { type: "accordionGroup", items: parseAccordions(inner) }, rest };
}

function tryParseStandaloneAccordion(content) {
  if (!content.startsWith("<Accordion")) return null;
  // Ensure it's not AccordionGroup
  if (content.startsWith("<AccordionGroup")) return null;
  const tagEnd = content.indexOf(">");
  if (tagEnd === -1) return null;
  const tagContent = content.slice(10, tagEnd);
  const title = extractAttr(tagContent, "title");
  if (!title) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "Accordion");
  if (closeIdx === -1) return null;
  const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
  const rest = afterOpen.slice(closeIdx + "</Accordion>".length);

  return {
    node: { type: "accordionGroup", items: [{ title, content: parseContent(inner) }] },
    rest,
  };
}

function parseAccordions(content) {
  const items = [];
  let remaining = content.trim();
  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (remaining.startsWith("<Accordion") && !remaining.startsWith("<AccordionGroup")) {
      const tagEnd = remaining.indexOf(">");
      if (tagEnd !== -1) {
        const tagContent = remaining.slice(10, tagEnd);
        const title = extractAttr(tagContent, "title") || "Untitled";
        const afterOpen = remaining.slice(tagEnd + 1);
        const closeIdx = findClosingTag(afterOpen, "Accordion");
        if (closeIdx !== -1) {
          const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
          items.push({ title, content: parseContent(inner) });
          remaining = afterOpen.slice(closeIdx + "</Accordion>".length);
          continue;
        }
      }
    }
    const next = remaining.indexOf("<Accordion", 1);
    if (next === -1) break;
    remaining = remaining.slice(next);
  }
  return items;
}

function tryParseCardGroup(content) {
  if (!content.startsWith("<CardGroup")) return null;
  const tagEnd = content.indexOf(">", 10);
  if (tagEnd === -1) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "CardGroup");
  if (closeIdx === -1) return null;
  const inner = afterOpen.slice(0, closeIdx);
  const rest = afterOpen.slice(closeIdx + "</CardGroup>".length);

  return { node: { type: "cardGroup", cards: parseCards(inner) }, rest };
}

function tryParseStandaloneCard(content) {
  if (!content.startsWith("<Card")) return null;
  if (content.startsWith("<CardGroup")) return null;
  const tagEnd = content.indexOf(">");
  if (tagEnd === -1) return null;
  const tagContent = content.slice(5, tagEnd);
  const title = extractAttr(tagContent, "title");
  if (!title) return null;
  const href = extractAttr(tagContent, "href");

  // Self-closing card?
  if (content[tagEnd - 1] === "/") {
    return { node: { type: "card", title, href, content: "" }, rest: content.slice(tagEnd + 1) };
  }

  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "Card");
  if (closeIdx === -1) return null;
  const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
  const rest = afterOpen.slice(closeIdx + "</Card>".length);

  return { node: { type: "card", title, href, content: inner }, rest };
}

function parseCards(content) {
  const cards = [];
  let remaining = content.trim();
  while (remaining.length > 0) {
    remaining = remaining.trim();
    const result = tryParseStandaloneCard(remaining);
    if (result) {
      cards.push(result.node);
      remaining = result.rest;
      continue;
    }
    const next = remaining.indexOf("<Card", 1);
    if (next === -1) break;
    remaining = remaining.slice(next);
  }
  return cards;
}

function tryParseCodeGroup(content) {
  if (!content.startsWith("<CodeGroup")) return null;
  const tagEnd = content.indexOf(">", 10);
  if (tagEnd === -1) return null;
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "CodeGroup");
  if (closeIdx === -1) return null;
  const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
  const rest = afterOpen.slice(closeIdx + "</CodeGroup>".length);

  // Extract code blocks from inner content
  return { node: { type: "codeGroup", content: parseContent(inner) }, rest };
}

function tryParseFrame(content) {
  if (!content.startsWith("<Frame")) return null;
  const tagEnd = content.indexOf(">", 6);
  if (tagEnd === -1) return null;
  // Self-closing?
  if (content[tagEnd - 1] === "/") {
    return { node: { type: "frame", content: [] }, rest: content.slice(tagEnd + 1) };
  }
  const afterOpen = content.slice(tagEnd + 1);
  const closeIdx = findClosingTag(afterOpen, "Frame");
  if (closeIdx === -1) return null;
  const inner = dedent(afterOpen.slice(0, closeIdx)).trim();
  const rest = afterOpen.slice(closeIdx + "</Frame>".length);

  return { node: { type: "frame", content: parseContent(inner) }, rest };
}

function tryParseMCPServersTable(content) {
  if (!content.startsWith("<MCPServersTable")) return null;
  const m = content.match(/^<MCPServersTable[^>]*\/?>(?:<\/MCPServersTable>)?/);
  if (!m) return null;
  return { node: { type: "markdown", text: "*(See MCP documentation for server details)*" }, rest: content.slice(m[0].length) };
}

// ── Code block extraction ───────────────────────────────────────────

// theme={...} is stripped in flattenComponents() before we get here
const FENCE_RE = /^(`{3,})(\w*)\s*(?:(\S+))?\s*$/;

function extractCodeBlocks(text) {
  const nodes = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const fenceMatch = lines[i].trim().match(FENCE_RE);
    if (fenceMatch) {
      const fence = fenceMatch[1]; // the backticks
      const lang = fenceMatch[2] || null;
      const filename = fenceMatch[3] || null;
      const codeLines = [];
      i++;
      // Find closing fence
      while (i < lines.length) {
        const closeTrimmed = lines[i].trim();
        if (closeTrimmed.startsWith(fence) && closeTrimmed.replace(/`/g, "").trim() === "") {
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      nodes.push({ type: "codeBlock", language: lang, code: codeLines.join("\n"), filename });
    } else {
      // Collect markdown lines until next fence
      const mdLines = [];
      while (i < lines.length && !lines[i].trim().match(FENCE_RE)) {
        mdLines.push(lines[i]);
        i++;
      }
      const md = mdLines.join("\n").trim();
      if (md) nodes.push({ type: "markdown", text: md });
    }
  }
  return nodes;
}

// ── Main recursive parser ───────────────────────────────────────────

const COMPONENT_PATTERNS = [
  "<Tip", "<Note", "<Warning", "<Info", "<Check", "<Caution", "<Callout",
  "<Tabs", "<Steps", "<AccordionGroup", "<Accordion",
  "<CardGroup", "<Card", "<CodeGroup", "<Frame", "<MCPServersTable",
];

function findNextComponent(content) {
  let minIdx = -1;
  for (const pat of COMPONENT_PATTERNS) {
    const idx = content.indexOf(pat);
    if (idx !== -1 && (minIdx === -1 || idx < minIdx)) {
      minIdx = idx;
    }
  }
  return minIdx;
}

const PARSERS = [
  tryParseCallout, tryParseTabs, tryParseSteps,
  tryParseAccordionGroup, tryParseStandaloneAccordion,
  tryParseCardGroup, tryParseStandaloneCard,
  tryParseCodeGroup, tryParseFrame, tryParseMCPServersTable,
];

function parseContent(content) {
  const nodes = [];
  let remaining = content.trim();

  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (!remaining) break;

    // Try each component parser
    let matched = false;
    for (const parser of PARSERS) {
      const result = parser(remaining);
      if (result) {
        nodes.push(result.node);
        remaining = result.rest.trim();
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // No component matched — collect markdown until next component
    const nextIdx = findNextComponent(remaining);
    let markdown;
    if (nextIdx === 0) {
      // Component-like tag at pos 0 but no parser matched — skip past it
      const skip = remaining.indexOf(">") + 1 || 1;
      markdown = remaining.slice(0, skip);
      remaining = remaining.slice(skip);
    } else if (nextIdx > 0) {
      markdown = remaining.slice(0, nextIdx);
      remaining = remaining.slice(nextIdx);
    } else {
      markdown = remaining;
      remaining = "";
    }

    // Parse code blocks from the markdown chunk
    const parsed = extractCodeBlocks(markdown);
    nodes.push(...parsed);
  }

  return nodes;
}

// ── AST → Markdown serializer ───────────────────────────────────────
// Walks the DocNode tree and emits clean, flat markdown.

function serializeNodes(nodes) {
  const parts = [];
  for (const node of nodes) {
    parts.push(serializeNode(node));
  }
  return parts.join("\n\n");
}

function serializeNode(node) {
  switch (node.type) {
    case "markdown":
      return node.text;

    case "callout": {
      // Render as blockquote with bold type label
      const lines = node.content.split("\n");
      return `> **${node.calloutType}:**\n` + lines.map(l => `> ${l}`).join("\n");
    }

    case "tabs": {
      const parts = [];
      for (const tab of node.tabs) {
        parts.push(`**${tab.title}:**\n\n${serializeNodes(tab.content)}`);
      }
      return parts.join("\n\n");
    }

    case "steps": {
      // Emit as H4 headings — they don't appear in the TOC (depth: 2)
      // and the template's v(0.8em) pre-spacing prevents orphaning.
      const parts = [];
      for (let i = 0; i < node.steps.length; i++) {
        const step = node.steps[i];
        parts.push(`#### Step ${i + 1}: ${step.title}\n\n${serializeNodes(step.content)}`);
      }
      return parts.join("\n\n");
    }

    case "accordionGroup": {
      const parts = [];
      for (const item of node.items) {
        parts.push(`**${item.title}**\n\n${serializeNodes(item.content)}`);
      }
      return parts.join("\n\n");
    }

    case "card": {
      if (node.href) {
        return `- **[${node.title}](${node.href})**` + (node.content ? `\n${node.content}` : "");
      }
      return `- **${node.title}**` + (node.content ? `\n${node.content}` : "");
    }

    case "cardGroup": {
      return node.cards.map(c => serializeNode({ ...c, type: "card" })).join("\n");
    }

    case "codeBlock": {
      const lang = node.language || "";
      // Use enough backticks to avoid ambiguity with inner fences.
      // Find the longest consecutive backtick run in the code content
      // and use one more than that (minimum 3).
      const maxTicks = (node.code.match(/`+/g) || [])
        .reduce((max, m) => Math.max(max, m.length), 0);
      const fence = "`".repeat(Math.max(3, maxTicks + 1));
      return `${fence}${lang}\n${node.code}\n${fence}`;
    }

    case "codeGroup": {
      return serializeNodes(node.content);
    }

    case "frame": {
      // Frames are visual wrappers — just emit content
      return serializeNodes(node.content);
    }

    default:
      return "";
  }
}

// ── Top-level flattener ─────────────────────────────────────────────

function flattenComponents(md) {
  let out = md;

  // Strip the llms.txt "Documentation Index" blockquote
  out = out.replace(
    /^>\s*##\s*Documentation Index[\s\S]*?(?=\n(?!>))/m,
    "",
  );

  // Strip import/export statements (MDX-only)
  out = preprocessMdx(out);

  // Strip Mintlify theme attributes from code fence lines — these
  // break FENCE_RE when they appear after a filename, causing the
  // fence to not be recognized and content to collapse into one line.
  // Uses global replace (not line-anchored) because fences inside
  // MDX components like <Step> are indented.
  out = out.replace(/\s*theme=\{[^}]*\}/g, "");

  // Convert <img> tags to markdown images before parsing
  out = out.replace(
    /<img\s+[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/g,
    (_, src, alt) => `![${alt}](${src})`,
  );
  out = out.replace(
    /<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/g,
    (_, alt, src) => `![${alt}](${src})`,
  );
  out = out.replace(/<img\s+[^>]*\/?>/g, "");

  // Strip leading whitespace from standalone image lines —
  // these are block images that were indented inside MDX components.
  // Without this, 4+ spaces of indent turns them into markdown code blocks.
  out = out.replace(/^[ \t]+(!\[[^\]]*\]\([^)]*\))\s*$/gm, "$1");

  // Parse MDX → AST
  const ast = parseContent(out);

  // Serialize AST → clean markdown
  out = serializeNodes(ast);

  // Clean up remaining HTML tags (e.g. <br/>, stray tags) but skip
  // content inside code blocks and inline code spans where angle
  // brackets are meaningful (`<arg>`, HTML in Python examples, etc.).
  {
    const lines = out.split("\n");
    let inFence = false;
    let fenceLen = 0;
    out = lines.map(line => {
      const trimmed = line.trim();
      const fenceMatch = trimmed.match(/^(`{3,})/);
      if (fenceMatch) {
        const ticks = fenceMatch[1].length;
        if (!inFence) {
          inFence = true;
          fenceLen = ticks;
          return line;
        } else if (ticks >= fenceLen && trimmed.replace(/`/g, "").trim() === "") {
          inFence = false;
          fenceLen = 0;
          return line;
        }
      }
      if (inFence) return line; // preserve HTML inside code blocks
      // Protect inline code spans: `<arg>`, `<model>` etc.
      let cleaned = line.replace(/`([^`\n]*)`/g, (m) =>
        m.replace(/</g, "\x00LT\x00").replace(/>/g, "\x00GT\x00"));
      // Strip remaining HTML tags in prose
      cleaned = cleaned.replace(/<\/?[a-zA-Z][^>]*>/g, "");
      // Restore protected angle brackets
      cleaned = cleaned.replace(/\x00LT\x00/g, "<").replace(/\x00GT\x00/g, ">");
      return cleaned;
    }).join("\n");
  }

  // Clean up excessive blank lines
  out = out.replace(/\n{4,}/g, "\n\n\n");

  return out;
}

// ── Line unwrapping ──────────────────────────────────────────────────
// Source markdown from code.claude.com hard-wraps at ~80 columns.
// In Typst, list item continuations must be indented — unindented
// continuation lines become new paragraphs.  Joining wrapped lines
// before markdown2typst conversion fixes this globally.

const BLOCK_START_RE = /^(\s*[-*+]\s|#{1,6}\s|\d+\.\s|>\s|!\[|\||<[A-Z])/;

function unwrapLines(md) {
  const lines = md.split("\n");
  const result = [];
  let inFence = false;
  let fenceLen = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track code fences — match opening/closing by backtick count.
    // A closing fence must have at least as many backticks as the
    // opening fence and contain nothing else (CommonMark §4.5).
    const fenceMatch = trimmed.match(/^(`{3,})/);
    if (fenceMatch) {
      const ticks = fenceMatch[1].length;
      if (!inFence) {
        inFence = true;
        fenceLen = ticks;
        result.push(line);
        continue;
      } else if (ticks >= fenceLen && trimmed.replace(/`/g, "").trim() === "") {
        inFence = false;
        fenceLen = 0;
        result.push(line);
        continue;
      }
      // Inner fence (fewer backticks or has trailing content) — pass through
      result.push(line);
      continue;
    }

    // Pass through lines inside code fences
    if (inFence) {
      result.push(line);
      continue;
    }

    // Blank lines are paragraph separators — always keep
    if (trimmed === "") {
      result.push(line);
      continue;
    }

    // Lines starting a new block element — always keep
    if (BLOCK_START_RE.test(line)) {
      result.push(line);
      continue;
    }

    // Continuation line: join to previous non-blank line
    if (result.length > 0 && result[result.length - 1].trim() !== "") {
      result[result.length - 1] += " " + trimmed;
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

// ── Image localization ───────────────────────────────────────────────
// Download external images and rewrite markdown references to local
// paths so markdown2typst generates #image() instead of placeholders.

const imagesDir = join(buildDir, "images");
if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

let imgDownloaded = 0;
let imgCached = 0;

function downloadImage(url, localPath) {
  if (existsSync(localPath)) { imgCached++; return true; }
  try {
    execSync(`curl -sL -o "${localPath}" "${url}"`, { timeout: 30000 });
    imgDownloaded++;
    return true;
  } catch (e) {
    console.error(`    FAILED: ${basename(localPath)} — ${e.message}`);
    return false;
  }
}

/** Rewrite ![alt](https://...) to ![alt](images/slug--filename) */
function localizeImages(md, slug) {
  return md.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
    (match, alt, url) => {
      try {
        const urlObj = new URL(url);
        const rawFilename = urlObj.pathname.split("/").pop();
        const localFilename = `${slug}--${rawFilename}`;
        const localPath = join(imagesDir, localFilename);
        if (downloadImage(url, localPath)) {
          // Path is relative to pages/ dir where .typ files live
          return `![${alt}](../images/${localFilename})`;
        }
      } catch { /* malformed URL — leave as-is */ }
      return match;
    },
  );
}

// ── Title extraction from frontmatter or first heading ────────────────

function extractTitle(md) {
  // Check for # heading
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return "Untitled";
}

// ── Main ──────────────────────────────────────────────────────────────

if (!existsSync(pagesDir)) mkdirSync(pagesDir, { recursive: true });
if (!existsSync(mdOutDir)) mkdirSync(mdOutDir, { recursive: true });

const files = readdirSync(docsDir)
  .filter((f) => f.endsWith(".md"))
  .sort();

console.log(`Processing ${files.length} docs...`);

let ok = 0;
let failed = 0;
let skipped = 0;
const errors = [];
const manifest = [];

for (const file of files) {
  const slug = basename(file, ".md");
  const mdPath = join(docsDir, file);

  try {
    let md = readFileSync(mdPath, "utf-8");

    // Skip files that are full HTML pages (bad fetch)
    if (md.trimStart().startsWith("<!DOCTYPE") || md.trimStart().startsWith("<html")) {
      process.stdout.write(`  ~ ${slug} (not MDX, skipped)\n`);
      skipped++;
      continue;
    }

    // Truncate changelog to keep PDF reasonable
    if (slug === "changelog") {
      md = truncateChangelog(md);
    }

    // Flatten interactive components to print-friendly markdown
    md = flattenComponents(md);

    // Download external images and rewrite to local paths
    md = localizeImages(md, slug);

    // Unwrap hard-wrapped lines so list item continuations don't
    // break out of their parent item in Typst output
    md = unwrapLines(md);

    // Write clean markdown (post-flatten, pre-Typst) for indexing
    writeFileSync(join(mdOutDir, `${slug}.md`), md);

    // Extract title before conversion
    const title = extractTitle(md);

    // Protect complex code spans from markdown2typst's broken backtick
    // escaping. Double-backtick spans (`` content ``) containing inner
    // backticks produce \` escapes that Typst can't parse. Replace with
    // indexed placeholders that survive conversion as simple code spans,
    // then restore with proper Typst multi-backtick raw text.
    const rawSpanStore = [];
    // Double-backtick code spans with inner backticks: `` !`cmd` ``
    // CRITICAL: [^`\n] in content and [ ] (space only) for padding
    // prevent matching across newlines or code fence boundaries.
    md = md.replace(/`` *((?:[^`\n]|`(?!`))+?) *``/g, (match, content) => {
      if (!content.includes("`")) return match;
      const idx = rawSpanStore.length;
      rawSpanStore.push(content.trim());
      return `\`NAVEL_RAW_${idx}\``;
    });
    // Single-backtick code spans wrapping triple+ backticks: ` ```! `
    md = md.replace(/` (```[^`\n]*?) `/g, (match, content) => {
      const idx = rawSpanStore.length;
      rawSpanStore.push(content.trim());
      return `\`NAVEL_RAW_${idx}\``;
    });

    // Convert markdown → Typst via markdown2typst
    let typstContent;
    try {
      typstContent = markdown2typst(md);
    } catch (e) {
      // If markdown2typst fails, fall back to raw content wrapped in raw block
      console.error(`  ! ${slug}: markdown2typst failed (${e.message}), using raw`);
      typstContent = `= ${title}\n\n${md}`;
    }

    // Restore protected raw text spans with proper Typst delimiters
    if (rawSpanStore.length > 0) {
      typstContent = typstContent.replace(/`NAVEL_RAW_(\d+)`/g, (_, idxStr) => {
        const content = rawSpanStore[parseInt(idxStr)];
        const maxTicks = (content.match(/`+/g) || [])
          .reduce((max, m) => Math.max(max, m.length), 0);
        // Typst inline raw needs 3+ backtick delimiters to contain backticks.
        // 2-backtick `` is parsed as two empty single-backtick raw spans.
        const delimLen = Math.max(3, maxTicks + 1);
        const delim = "`".repeat(delimLen);
        // Typst needs space padding when content starts/ends with backtick
        const pad = content.startsWith("`") || content.endsWith("`") ? " " : "";
        return `${delim}${pad}${content}${pad}${delim}`;
      });
    }

    // Rewrite internal /en/slug links to Typst cross-references
    // markdown2typst renders [text](/en/foo) as #link("/en/foo")[text]
    // We convert to #link(<foo>)[text] for internal navigation,
    // but only if the target page exists. Otherwise, use plain text.
    const allSlugs = new Set(files.map(f => basename(f, ".md")));
    typstContent = typstContent.replace(
      /#link\("\/en\/([a-z0-9-]+)(#[^"]*)?"\)\[([^\]]*)\]/g,
      (_, linkSlug, anchor, text) => {
        if (allSlugs.has(linkSlug)) {
          return `#link(<${linkSlug}>)[${text}]`;
        }
        // Target page doesn't exist — render as plain text
        return text;
      },
    );

    // Fix empty bold markers in table headers — markdown2typst renders
    // empty table cells as [**] which is invalid Typst.
    typstContent = typstContent.replace(/\[\*\*\]/g, "[]");

    // Fix merged consecutive code blocks — markdown2typst sometimes
    // joins closing/opening fences across block boundaries.
    // Pattern 1: `` ` ```bash  (fence split into backtick fragments)
    typstContent = typstContent.replace(/^`` ` ```(\w*)$/gm, "```\n\n```$1");
    // Pattern 2: ```content between blocks```lang  (fences merged with
    // intervening paragraph text)
    typstContent = typstContent.replace(/^```(.+?)```(\w+)$/gm, "```\n\n$1\n\n```$2");

    // Fix escaped backticks in raw text — markdown2typst uses \` for
    // literal backticks inside raw text, but Typst treats raw text as
    // literal (no escape processing). We scan each line for raw text
    // spans containing \` and rebuild them with multi-backtick delimiters.
    //
    // Examples:
    //   `Ctrl+\``         → ``Ctrl+` ``
    //   `!\``command\``   → `` !`command` ``
    //   `\`\`\`!`         → ```` ```! ````
    if (typstContent.includes("\\`")) {
      typstContent = typstContent.split("\n").map(line => {
        if (!line.includes("\\`")) return line;
        // Replace raw spans containing \` — match opening `, content
        // with at least one \`, and closing `. Iterate since fixing one
        // span may reveal another (adjacent spans can merge).
        let prev;
        do {
          prev = line;
          line = line.replace(/`([^`\n]+?\\`[^`\n]*?)`/g, (_, inner) => {
            const unescaped = inner.replace(/\\`/g, "`");
            const maxTicks = (unescaped.match(/`+/g) || [])
              .reduce((max, m) => Math.max(max, m.length), 0);
            // Typst inline raw needs 3+ backtick delimiters to contain backticks.
            const delimLen = Math.max(3, maxTicks + 1);
            const delim = "`".repeat(delimLen);
            // Typst multi-backtick raw text needs space padding when
            // content starts or ends with a backtick
            const pad = unescaped.startsWith("`") || unescaped.endsWith("`") ? " " : "";
            return `${delim}${pad}${unescaped}${pad}${delim}`;
          });
        } while (line !== prev);
        return line;
      }).join("\n");
    }

    // Convert callout blockquotes to gentle-clues admonitions.
    // markdown2typst renders our callouts as:
    //   #quote[\n  *Type:*\n  content\n]
    // We replace with gentle-clues: #info[content], #tip[content], etc.
    {
      const calloutMap = {
        "Info": "info",
        "Tip": "tip",
        "Warning": "warning",
        "Note": "info",
        "Check": "success",
        "Caution": "danger",
        "Callout": "info",
      };
      // Match #quote[\n  *Type:*\n  content\n]
      // The content may span multiple lines and contain nested Typst markup.
      typstContent = typstContent.replace(
        /#quote\[\s*\n\s*\*([A-Za-z]+):\*\s*\n([\s\S]*?)\n\s*\]/g,
        (match, type, content) => {
          const gcFunc = calloutMap[type];
          if (!gcFunc) return match; // not a known callout type
          const trimmed = content.replace(/^\s+/gm, "").trim();
          return `#${gcFunc}(title: "${type}")[${trimmed}]`;
        },
      );
    }

    // Convert the first #quote[...] after the page heading to a styled
    // subtitle. On the website this is the page description — larger text,
    // muted color, no blockquote styling. We emit it as a Typst text()
    // block that matches the site's 18px/muted description.
    typstContent = typstContent.replace(
      /(= .+\n)\s*\n#quote\[\s*\n([\s\S]*?)\n\s*\]/,
      (match, heading, content) => {
        const trimmed = content.replace(/^\s+/gm, "").trim();
        return `${heading}\n#text(size: 11pt, fill: rgb("#6e6e6e"))[${trimmed}]\n`;
      },
    );

    // Add page label and gentle-clues import at the top.
    // Each page needs its own import since #include has isolated scope.
    const hasCallouts = /#(?:info|tip|warning|memo|success|danger)[\[(]/.test(typstContent);
    let preamble = `#metadata(none) <${slug}>\n`;
    if (hasCallouts) {
      preamble += `#import "../../../pdf/callouts.typ": info, tip, warning, danger, memo, success\n`;
    }
    typstContent = preamble + typstContent;

    // Shift all headings down one level so nav group parts can be H1.
    // = Title → == Title, == Section → === Section, etc.
    typstContent = typstContent.replace(/^(=+)/gm, "=$1");

    // Write individual page file
    const outPath = join(pagesDir, `${slug}.typ`);
    writeFileSync(outPath, typstContent);

    manifest.push({ slug, title });
    ok++;
    process.stdout.write(`  + ${slug}\n`);
  } catch (err) {
    failed++;
    errors.push({ slug, error: err.message });
    process.stderr.write(`  x ${slug}: ${err.message}\n`);
  }
}

// ── Write manifest (pages.typ) ────────────────────────────────────────
// Imports each page in nav order. main.typ #include's this file.

const orderedSlugs = [];

// Nav-ordered pages first
for (const slug of NAV_ORDER) {
  if (manifest.find((m) => m.slug === slug)) {
    orderedSlugs.push(slug);
  }
}

// Then any pages not in nav (shouldn't happen, but safe)
for (const { slug } of manifest) {
  if (!orderedSlugs.includes(slug)) {
    orderedSlugs.push(slug);
  }
}

let pagesTyp = "// Auto-generated by pdf-render.mjs — do not edit\n";
pagesTyp += "// One #include per doc page, in navigation order.\n";
pagesTyp += "// Nav groups emit H1 part headings; pages are offset +1 level.\n\n";
let lastGroup = null;
for (const slug of orderedSlugs) {
  const entry = manifest.find((m) => m.slug === slug);
  const group = NAV_GROUP_MAP[slug];

  // Emit a part heading when the nav group changes
  if (group && group !== lastGroup) {
    pagesTyp += `// ── ${group} ──\n`;
    pagesTyp += `= ${group}\n\n`;
    lastGroup = group;
  }

  pagesTyp += `#include "pages/${slug}.typ"\n`;
  pagesTyp += `#pagebreak(weak: true)\n\n`;
}

writeFileSync(join(buildDir, "pages.typ"), pagesTyp);
console.log(`\nWrote pages.typ (${orderedSlugs.length} pages in nav order)`);

console.log(`\nImages: ${imgDownloaded} downloaded, ${imgCached} cached`);
console.log(`Done: ${ok} converted, ${skipped} skipped, ${failed} failed.`);
if (errors.length > 0) {
  console.log("\nFailed files:");
  for (const { slug, error } of errors) {
    console.log(`  ${slug}: ${error}`);
  }
}
