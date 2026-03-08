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
  return source.replace(/^export\s+const\s+\w+\s*=[\s\S]*?^};$/gm, "");
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
