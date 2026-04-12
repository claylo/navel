// dash-transforms.mjs — Pure transformation functions for docset rendering.
// Extracted for testability. No side effects, no I/O.

// ── Link rewriting ─────────────────────────────────────────────────────
// Convert /en/foo → foo.html and /en/foo#bar → foo.html#bar

export function rewriteLinks(html) {
  return html.replace(
    /href="\/en\/([a-z0-9-]+)(#[^"]*)?"/g,
    (_, slug, anchor) => {
      return `href="${slug}.html${anchor || ""}"`;
    },
  );
}

// ── Inject section label above h1 ──────────────────────────────────────

export function injectSectionLabel(html, slug, navGroupMap) {
  const group = navGroupMap[slug];
  if (!group) return html;
  const label = `<p class="section-label">${group}</p>`;
  return html.replace(/(<h1)/, `${label}$1`);
}

// ── Convert first blockquote after h1 into page description ────────────

export function convertPageDescription(html) {
  return html.replace(
    /(<\/h1>\s*)<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/,
    (_, before, content) =>
      `${before}<p class="page-description">${content}</p>`,
  );
}

// ── Slugify ────────────────────────────────────────────────────────────

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Extract title from first H1 ───────────────────────────────────────

export function extractTitle(html) {
  const m = html.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (m) return m[1].replace(/<[^>]+>/g, "").trim();
  return "Claude Code";
}

// ── Dash anchor injection ──────────────────────────────────────────────

export function injectDashAnchors(html) {
  return html.replace(
    /<(h[23])([^>]*)>(.*?)<\/\1>/g,
    (match, tag, attrs, inner) => {
      if (attrs.includes('data-component-part="card-title"')) {
        return match;
      }
      const level = tag === "h2" ? "Section" : "Entry";
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const encoded = encodeURIComponent(text);
      const slug = slugify(text);
      const anchor = `<a name="//apple_ref/cpp/${level}/${encoded}" class="dashAnchor"></a>`;
      const idAttr = attrs.includes("id=") ? "" : ` id="${slug}"`;
      return `${anchor}<${tag}${attrs}${idAttr}>${inner}</${tag}>`;
    },
  );
}

// ── MDX preprocessing ──────────────────────────────────────────────────

export function preprocessMdx(source) {
  return source
    // Strip inline exports emitted by some MDX pages:
    //   export const NAME = { ... };
    .replace(/^export\s+const\s+\w+\s*=[\s\S]*?^};$/gm, "")
    // Strip the <AgentInstructions>...</AgentInstructions> boilerplate block
    // the docs source now prepends to nearly every page — instructions aimed
    // at LLM agents reading the page, not human readers. Without this, the
    // inner prose ("IMPORTANT: ... Submitting Feedback ...") leaks into the
    // PDF (MDX tag stripper preserves inner text) and the Dash docset.
    // Trailing \n? absorbs the blank line the block usually sits on.
    .replace(/<AgentInstructions\b[^>]*>[\s\S]*?<\/AgentInstructions>\n?/g, "")
    // Strip self-closing <Experiment ... treatment={<OtherComponent .../>} />.
    // Experiment is a runtime A/B test wrapper that only makes sense in the
    // live site. The nested JSX expression defeats the generic HTML-tag
    // stripper (which stops at the first > and would leave "} />" dangling),
    // so we remove the whole tag here at the markdown stage. The regex
    // tolerates any simple attributes before the `{…}` expression and a
    // single level of JSX nesting inside the expression.
    .replace(/<Experiment\b[^{>]*\{[^}]*\}\s*\/>\n?/g, "");
}

// ── Context window flattening ─────────────────────────────────────────
// Extracts the EVENTS data from the ContextWindow React component and
// replaces <ContextWindow /> with a static markdown representation.
// Must run BEFORE preprocessMdx (which strips the export block).

const CW_VIS_LABELS = {
  hidden: "not visible in terminal",
  brief: "one-liner in terminal",
  full: "visible in terminal",
};

export function flattenContextWindow(source) {
  if (!source.includes("<ContextWindow")) return source;

  const events = parseContextWindowEvents(source);
  if (!events.length) return source;

  const md = renderContextWindowMarkdown(events);
  return source.replace(/<ContextWindow\s*\/?>/, md);
}

export function parseContextWindowEvents(source) {
  // Find the EVENTS array: useMemo(() => [...].filter(
  const marker = "EVENTS = useMemo(() => [";
  const start = source.indexOf(marker);
  if (start === -1) return [];

  const arrayStart = source.indexOf("[", start + marker.length - 1);

  // Find matching close bracket via depth tracking
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) { arrayEnd = i; break; }
    }
  }
  if (arrayEnd === -1) return [];

  const arrayContent = source.slice(arrayStart + 1, arrayEnd);

  // Split into individual objects by tracking brace depth
  const objects = [];
  depth = 0;
  let objStart = -1;
  for (let i = 0; i < arrayContent.length; i++) {
    if (arrayContent[i] === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (arrayContent[i] === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        objects.push(arrayContent.slice(objStart, i + 1));
        objStart = -1;
      }
    }
  }

  return objects.map(parseContextWindowEvent).filter((e) => e !== null);
}

function parseContextWindowEvent(objStr) {
  const t = matchFloat(objStr, "t");
  if (t === null) return null;

  return {
    t,
    kind: matchQuotedStr(objStr, "kind"),
    label: matchQuotedStr(objStr, "label"),
    tokens: matchInt(objStr, "tokens") || 0,
    subTokens: matchInt(objStr, "subTokens") || 0,
    vis: matchQuotedStr(objStr, "vis"),
    desc: matchQuotedStr(objStr, "desc"),
    tip: matchQuotedStr(objStr, "tip"),
    link: matchQuotedStr(objStr, "link"),
  };
}

function matchQuotedStr(s, name) {
  // Single-quoted: label: 'System prompt'
  let m = s.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (m) return m[1].replace(/\\'/g, "'");
  // Double-quoted: desc: "Claude's notes..."
  m = s.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (m) return m[1].replace(/\\"/g, '"');
  return null;
}

function matchInt(s, name) {
  const m = s.match(new RegExp(`${name}:\\s*(\\d+)`));
  return m ? parseInt(m[1]) : null;
}

function matchFloat(s, name) {
  const m = s.match(new RegExp(`${name}:\\s*([0-9.]+)`));
  return m ? parseFloat(m[1]) : null;
}

const CW_STARTUP_END = 0.2;

function renderContextWindowMarkdown(events) {
  const fmt = (n) =>
    n >= 1000
      ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"
      : String(n);

  // Group events by session phase using kind transitions
  const phases = [];
  let currentPhase = null;

  for (const e of events) {
    let phase;
    if (e.t < CW_STARTUP_END) {
      phase = "What loads at startup";
    } else if (e.kind === "sub") {
      phase = "Inside the subagent";
    } else if (e.kind === "compact") {
      phase = "Compaction";
    } else if (e.kind === "user") {
      phase = "You";
    } else {
      phase = "Claude works";
    }

    if (phase !== currentPhase) {
      phases.push({ name: phase, events: [] });
      currentPhase = phase;
    }
    phases[phases.length - 1].events.push(e);
  }

  const lines = [];
  lines.push(
    "The session below walks through a realistic flow with representative token counts.",
    "Token values are illustrative — actual amounts vary with your CLAUDE.md size, MCP servers, and file lengths.",
    "",
  );

  for (const phase of phases) {
    lines.push(`### ${phase.name}`, "");
    for (const e of phase.events) {
      const tokenStr =
        e.tokens > 0
          ? `~${fmt(e.tokens)} tokens`
          : e.subTokens > 0
            ? `~${fmt(e.subTokens)} tokens (in subagent)`
            : "";
      const visStr = e.vis ? CW_VIS_LABELS[e.vis] || e.vis : "";
      const meta = [e.kind, tokenStr, visStr].filter(Boolean).join(" · ");

      lines.push(`- **${e.label}** — ${meta}`);
      if (e.desc) {
        lines.push(`  ${e.desc}`);
      }
      if (e.tip) {
        lines.push(`  *Tip: ${e.tip}*`);
      }
      if (e.link) {
        lines.push(`  [Learn more →](${e.link})`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ── Mintlify <Update> flattening ───────────────────────────────────────
// Converts <Update label="2.1.84" description="March 26, 2026"> ... </Update>
// into ## 2.1.84 / *March 26, 2026* / content.
// Must run BEFORE truncateChangelog (which needs ## headers to count versions)
// and before escapeJsxAngleBrackets (which mangles the opening tags but
// leaves orphaned </Update> closers that break the MDX parser).

export function flattenUpdateComponents(md) {
  // Opening tag → ## heading + date line
  md = md.replace(
    /<Update\s+label="([^"]*)"\s+description="([^"]*)"[^>]*>/g,
    (_, label, desc) => `## ${label}\n\n*${desc}*\n`,
  );
  // Closing tag → empty
  md = md.replace(/<\/Update>/g, "");
  return md;
}

// ── Changelog truncation + JSX escaping ────────────────────────────────

const HTML_TAGS = new Set([
  "a","abbr","b","br","code","div","em","h1","h2","h3","h4","h5","h6",
  "hr","i","img","li","ol","p","pre","span","strong","sub","sup",
  "table","tbody","td","th","thead","tr","u","ul","details","summary",
]);

export function escapeJsxAngleBrackets(md) {
  return md.replace(/<([a-zA-Z][a-zA-Z0-9_-]*(?:\s[^>]*)?)>/g, (match, inner) => {
    const tag = inner.split(/\s/)[0].toLowerCase();
    if (HTML_TAGS.has(tag)) return match;
    return `&lt;${inner}&gt;`;
  });
}

export function truncateChangelog(md, maxVersions = 30) {
  const lines = md.split("\n");
  const totalVersions = lines.filter((l) => /^## \d/.test(l)).length;
  let versionCount = 0;
  let cutoff = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^## \d/.test(lines[i])) {
      versionCount++;
      if (versionCount > maxVersions) {
        cutoff = i;
        break;
      }
    }
  }
  let result = cutoff < lines.length ? lines.slice(0, cutoff) : [...lines];
  if (cutoff < lines.length) {
    const remaining = totalVersions - maxVersions;
    result.push(
      "",
      `*Plus ${remaining} earlier version${remaining !== 1 ? "s" : ""} — see [full changelog](https://code.claude.com/docs/en/changelog) on the web.*`,
    );
  }
  return escapeJsxAngleBrackets(result.join("\n"));
}

// ── Nav structure parsing ──────────────────────────────────────────────
// Parses the tabs/groups/pages structure from the site's embedded JSON.

export function parseNavTabs(tabs) {
  const navMap = {};
  const navOrder = [];

  function processPages(pages, groupName) {
    for (const page of pages) {
      if (typeof page === "string") {
        const slug = page.replace(/^en\//, "");
        navMap[slug] = groupName;
        navOrder.push(slug);
      } else if (page.group && page.pages) {
        processPages(page.pages, page.group);
      }
    }
  }

  for (const tab of tabs) {
    for (const group of tab.groups) {
      processPages(group.pages, group.group);
    }
  }

  return { navMap, navOrder };
}

// ── Version sorting ────────────────────────────────────────────────────

export function semverSort(versions) {
  return [...versions].sort((a, b) => {
    const pa = a.replace(/^v/, "").split(".").map(Number);
    const pb = b.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    }
    return 0;
  });
}

// ── Claude directory flattening ───────────────────────────────────────
// Extracts the FILE_TREE data from the ClaudeExplorer React component and
// replaces <ClaudeExplorer /> with a static markdown representation.
// Must run BEFORE preprocessMdx (which strips the export block).

export function flattenClaudeDirectory(source) {
  if (!source.includes("FILE_TREE")) return source;

  const commandsNote = cdParseCommandsNote(source);
  const tree = cdParseTree(source);
  if (!tree) return source;

  const md = cdRenderMarkdown(tree, commandsNote);
  return source.replace(/<ClaudeExplorer\s*\/?>/, md);
}

// ── Scanning utilities ────────────────────────────────────────────────

// Find matching close brace/bracket, skipping template literals.
// Only tracks backtick strings — single/double quotes are left untracked
// because JSX text contains apostrophes that aren't string delimiters.
// Braces inside quote-delimited strings in this data are always balanced,
// so skipping them doesn't affect the count.
function cdScanToClose(str, start, open, close) {
  let depth = 0;
  let inTmpl = false;
  for (let i = start; i < str.length; i++) {
    const ch = str[i];
    if (inTmpl) {
      if (ch === "\\") { i++; continue; }
      if (ch === "`") inTmpl = false;
      continue;
    }
    if (ch === "`") { inTmpl = true; continue; }
    if (ch === open) depth++;
    if (ch === close) { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// Find matching </> for an already-opened <> fragment.
function cdFindFragmentEnd(str, start) {
  let depth = 1;
  let i = start;
  while (i < str.length) {
    if (str[i] !== "<") { i++; continue; }
    if (str[i + 1] === "/") {
      if (str[i + 2] === ">") {
        depth--;
        if (depth === 0) return i;
        i += 3; continue;
      }
      const gt = str.indexOf(">", i + 2);
      i = gt !== -1 ? gt + 1 : i + 1;
      continue;
    }
    if (str[i + 1] === ">") { depth++; i += 2; continue; }
    if (/[A-Za-z]/.test(str[i + 1])) {
      const gt = str.indexOf(">", i + 1);
      i = gt !== -1 ? gt + 1 : i + 1;
      continue;
    }
    i++;
  }
  return -1;
}

// Convert JSX helpers (<C>, <A>, fragments, expressions) to markdown.
function cdJsxToMd(str) {
  return str
    .replace(/\{'\s*'\}/g, " ")
    .replace(/\{'([^']*)'\}/g, "$1")
    .replace(/<C>([\s\S]*?)<\/C>/g, "`$1`")
    .replace(/<A\s+href="([^"]*)">([\s\S]*?)<\/A>/g, (_, href, text) => {
      const dash = href.replace(
        /^\/en\/([a-z0-9-]+)(#.*)?$/,
        (__, slug, anchor) => `${slug}.html${anchor || ""}`,
      );
      return `[${text}](${dash})`;
    })
    .replace(/<>/g, "")
    .replace(/<\/>/g, "")
    .trim();
}

// Split array content by top-level commas, respecting template literals and JSX.
// Only tracks backtick strings — apostrophes in JSX text aren't string delimiters.
function cdSplitElements(content) {
  const elems = [];
  let inTmpl = false;
  let jsxD = 0;
  let braceD = 0;
  let brackD = 0;
  let start = 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inTmpl) {
      if (ch === "\\") { i++; continue; }
      if (ch === "`") inTmpl = false;
      continue;
    }
    if (ch === "`") { inTmpl = true; continue; }
    if (ch === "{") { braceD++; continue; }
    if (ch === "}") { braceD--; continue; }
    if (ch === "[") { brackD++; continue; }
    if (ch === "]") { brackD--; continue; }
    if (ch === "<") {
      if (content[i + 1] === "/") {
        jsxD--;
        if (content[i + 2] === ">") { i += 2; continue; }
        const gt = content.indexOf(">", i + 2);
        if (gt !== -1) i = gt;
        continue;
      }
      if (content[i + 1] === ">") { jsxD++; i++; continue; }
      if (/[A-Z]/.test(content[i + 1])) {
        jsxD++;
        const gt = content.indexOf(">", i + 1);
        if (gt !== -1) i = gt;
        continue;
      }
      continue;
    }
    if (ch === "," && jsxD === 0 && braceD === 0 && brackD === 0) {
      elems.push(content.slice(start, i).trim());
      start = i + 1;
    }
  }
  const last = content.slice(start).trim();
  if (last) elems.push(last);
  return elems.filter((e) => e.length > 0);
}

// Convert an array element (string literal or JSX fragment) to markdown.
function cdElemToMd(elem) {
  if (elem.startsWith("'")) {
    const m = elem.match(/^'((?:[^'\\]|\\.)*)'$/);
    return m ? m[1].replace(/\\'/g, "'") : elem;
  }
  if (elem.startsWith('"')) {
    const m = elem.match(/^"((?:[^"\\]|\\.)*)"$/);
    return m ? m[1].replace(/\\"/g, '"') : elem;
  }
  if (elem.startsWith("`")) {
    const m = elem.match(/^`([\s\S]*)`$/);
    return m ? m[1] : elem;
  }
  if (elem.startsWith("<>")) {
    return cdJsxToMd(elem.slice(2).replace(/<\/>$/, ""));
  }
  return cdJsxToMd(elem);
}

// ── Field extractors ──────────────────────────────────────────────────

function cdMatchStr(str, name) {
  let m = str.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (m) return m[1].replace(/\\'/g, "'");
  m = str.match(new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (m) return m[1].replace(/\\"/g, '"');
  return null;
}

function cdExtractText(str, name) {
  const s = cdMatchStr(str, name);
  if (s !== null) return s;

  const re = new RegExp(`${name}:\\s*<>`);
  const m = re.exec(str);
  if (m) {
    const fragStart = m.index + m[0].length;
    const fragEnd = cdFindFragmentEnd(str, fragStart);
    if (fragEnd !== -1) return cdJsxToMd(str.slice(fragStart, fragEnd));
  }
  return null;
}

function cdExtractArray(str, name) {
  const re = new RegExp(`${name}:\\s*\\[`);
  const m = re.exec(str);
  if (!m) return null;

  const openIdx = str.indexOf("[", m.index);
  const closeIdx = cdScanToClose(str, openIdx, "[", "]");
  if (closeIdx === -1) return null;

  return cdSplitElements(str.slice(openIdx + 1, closeIdx)).map(cdElemToMd);
}

function cdExtractTemplate(str, name) {
  const re = new RegExp(`${name}:\\s*\``);
  const m = re.exec(str);
  if (!m) return null;

  const start = m.index + m[0].length;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "\\") { i++; continue; }
    if (str[i] === "`") return str.slice(start, i);
  }
  return null;
}

function cdExtractDesc(str) {
  const m = str.match(/description:\s*/);
  if (!m) return null;

  const valStart = m.index + m[0].length;
  if (str[valStart] === "[") {
    const closeIdx = cdScanToClose(str, valStart, "[", "]");
    if (closeIdx === -1) return null;
    return cdSplitElements(str.slice(valStart + 1, closeIdx)).map(cdElemToMd);
  }
  return cdExtractText(str, "description");
}

// ── Tree parsing ──────────────────────────────────────────────────────

function cdParseCommandsNote(source) {
  const m = source.match(
    /commandsNote\s*=\s*useMemo\(\(\)\s*=>\s*<>([\s\S]*?)<\/>,\s*\[\]/,
  );
  if (!m) return "";
  return cdJsxToMd(m[1]);
}

function cdParseTree(source) {
  const marker = "FILE_TREE = useMemo";
  const start = source.indexOf(marker);
  if (start === -1) return null;

  const objOpen = source.indexOf("({", start);
  if (objOpen === -1) return null;
  const objStart = objOpen + 1;
  const objEnd = cdScanToClose(source, objStart, "{", "}");
  if (objEnd === -1) return null;

  const treeStr = source.slice(objStart, objEnd + 1);

  return {
    project: cdExtractSection(treeStr, "project"),
    global: cdExtractSection(treeStr, "global"),
  };
}

function cdExtractSection(treeStr, name) {
  const re = new RegExp(`${name}:\\s*\\{`);
  const m = re.exec(treeStr);
  if (!m) return null;

  const braceStart = treeStr.indexOf("{", m.index);
  const braceEnd = cdScanToClose(treeStr, braceStart, "{", "}");
  if (braceEnd === -1) return null;

  const sectionStr = treeStr.slice(braceStart, braceEnd + 1);
  return {
    label: cdMatchStr(sectionStr, "label"),
    children: cdParseChildren(sectionStr),
  };
}

function cdParseChildren(parentStr) {
  const m = parentStr.match(/children:\s*\[/);
  if (!m) return [];

  const arrStart = parentStr.indexOf("[", m.index);
  const arrEnd = cdScanToClose(parentStr, arrStart, "[", "]");
  if (arrEnd === -1) return [];

  const content = parentStr.slice(arrStart + 1, arrEnd).trim();
  if (!content) return [];

  const nodes = [];
  let depth = 0;
  let inTmpl = false;
  let objStart = -1;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inTmpl) {
      if (ch === "\\") { i++; continue; }
      if (ch === "`") inTmpl = false;
      continue;
    }
    if (ch === "`") { inTmpl = true; continue; }
    if (ch === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        nodes.push(content.slice(objStart, i + 1));
        objStart = -1;
      }
    }
  }

  return nodes.map(cdParseNode);
}

function cdParseNode(nodeStr) {
  // Strip children so field regexes don't match inside child nodes.
  const cm = nodeStr.match(/children:\s*\[/);
  const own = cm ? nodeStr.slice(0, cm.index) : nodeStr;

  return {
    label: cdMatchStr(own, "label") || "",
    type: cdMatchStr(own, "type"),
    icon: cdMatchStr(own, "icon"),
    badge: cdMatchStr(own, "badge"),
    autogen: /autogen:\s*true/.test(own),
    hasNote: /note:\s*commandsNote/.test(own),
    oneLiner: cdExtractText(own, "oneLiner"),
    when: cdExtractText(own, "when"),
    description: cdExtractDesc(own),
    contains: cdExtractArray(own, "contains"),
    tips: cdExtractArray(own, "tips"),
    exampleIntro: cdExtractText(own, "exampleIntro"),
    example: cdExtractTemplate(own, "example"),
    docsLink: cdMatchStr(own, "docsLink"),
    children: cdParseChildren(nodeStr),
  };
}

// ── Rendering ─────────────────────────────────────────────────────────

function cdRenderMarkdown(tree, commandsNote) {
  const lines = [];

  lines.push("## Project scope", "");
  if (tree.project) {
    for (const node of tree.project.children) {
      cdRenderNode(lines, node, 0, commandsNote);
    }
  }

  lines.push("## Global scope", "");
  if (tree.global) {
    for (const node of tree.global.children) {
      cdRenderNode(lines, node, 0, commandsNote);
    }
  }

  return lines.join("\n");
}

function cdRenderNode(lines, node, depth, commandsNote) {
  const h = "#".repeat(Math.min(depth + 3, 6));
  // Escape angle brackets so MDX doesn't treat <agent-name> as JSX
  let heading = node.label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (node.badge) heading += ` \`${node.badge}\``;
  else if (node.autogen) heading += " `auto-generated`";
  lines.push(`${h} ${heading}`, "");

  if (node.oneLiner) lines.push(`*${node.oneLiner}*`, "");

  if (node.hasNote && commandsNote) {
    lines.push(`> **Note:** ${commandsNote}`, "");
  }

  if (node.when) lines.push(`**When:** ${node.when}`, "");

  if (node.description) {
    const descs = Array.isArray(node.description)
      ? node.description
      : [node.description];
    for (const d of descs) lines.push(d, "");
  }

  if (node.contains && node.contains.length > 0) {
    lines.push("**Configures:**");
    for (const item of node.contains) lines.push(`- ${item}`);
    lines.push("");
  }

  if (node.tips && node.tips.length > 0) {
    lines.push("**Tips:**");
    for (const tip of node.tips) lines.push(`- ${tip}`);
    lines.push("");
  }

  if (node.example) {
    if (node.exampleIntro) lines.push(node.exampleIntro, "");
    const lang =
      node.icon === "json" ? "json" : node.icon === "md" ? "markdown" : "";
    lines.push("```" + lang, node.example, "```", "");
  }

  if (node.docsLink) {
    const link = node.docsLink.replace(
      /^\/en\/([a-z0-9-]+)(#.*)?$/,
      (_, slug, anchor) => `${slug}.html${anchor || ""}`,
    );
    lines.push(`[Documentation →](${link})`, "");
  }

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      cdRenderNode(lines, child, depth + 1, commandsNote);
    }
  }
}
