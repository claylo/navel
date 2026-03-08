#!/usr/bin/env bats

# Tests for libexec/js/dash-transforms.mjs
# Exercises: link rewriting, section labels, slug generation, title extraction,
# Dash anchors, changelog truncation, JSX escaping, nav parsing, version sorting

TRANSFORMS="$BATS_TEST_DIRNAME/../libexec/js/dash-transforms.mjs"
FIXTURES="$BATS_TEST_DIRNAME/fixtures/dash"

# Helper: run a JS expression against the transforms module
run_transform() {
  node --input-type=module -e "
import * as T from '$TRANSFORMS';
$1
"
}

# ── Link rewriting ──────────────────────────────────────────────────────

@test "rewriteLinks: /en/slug → slug.html" {
  result=$(run_transform 'console.log(T.rewriteLinks("<a href=\"/en/overview\">Overview</a>"))')
  [[ "$result" == '<a href="overview.html">Overview</a>' ]]
}

@test "rewriteLinks: /en/slug#anchor → slug.html#anchor" {
  result=$(run_transform 'console.log(T.rewriteLinks("<a href=\"/en/hooks#lifecycle\">Hooks</a>"))')
  [[ "$result" == '<a href="hooks.html#lifecycle">Hooks</a>' ]]
}

@test "rewriteLinks: external links unchanged" {
  result=$(run_transform 'console.log(T.rewriteLinks("<a href=\"https://example.com\">Ext</a>"))')
  [[ "$result" == '<a href="https://example.com">Ext</a>' ]]
}

@test "rewriteLinks: multiple links in one string" {
  result=$(run_transform '
    const html = "See <a href=\"/en/hooks\">hooks</a> and <a href=\"/en/mcp#setup\">MCP</a>";
    console.log(T.rewriteLinks(html));
  ')
  [[ "$result" == *'hooks.html"'* ]]
  [[ "$result" == *'mcp.html#setup"'* ]]
}

# ── Slugify ──────────────────────────────────────────────────────────────

@test "slugify: plain text" {
  result=$(run_transform 'console.log(T.slugify("Getting started"))')
  [[ "$result" == "getting-started" ]]
}

@test "slugify: strips special characters" {
  result=$(run_transform 'console.log(T.slugify("What'\''s new in 2.0?"))')
  [[ "$result" == "what-s-new-in-2-0" ]]
}

@test "slugify: no leading/trailing hyphens" {
  result=$(run_transform 'console.log(T.slugify("  Hello World!  "))')
  [[ "$result" == "hello-world" ]]
}

# ── Extract title ────────────────────────────────────────────────────────

@test "extractTitle: simple h1" {
  result=$(run_transform 'console.log(T.extractTitle("<h1>Claude Code overview</h1>"))')
  [[ "$result" == "Claude Code overview" ]]
}

@test "extractTitle: h1 with inner HTML" {
  result=$(run_transform 'console.log(T.extractTitle("<h1><span>Hooks</span> reference</h1>"))')
  [[ "$result" == "Hooks reference" ]]
}

@test "extractTitle: h1 with attributes" {
  result=$(run_transform 'console.log(T.extractTitle("<h1 class=\"title\" id=\"main\">Settings</h1>"))')
  [[ "$result" == "Settings" ]]
}

@test "extractTitle: fallback when no h1" {
  result=$(run_transform 'console.log(T.extractTitle("<h2>Not a title</h2>"))')
  [[ "$result" == "Claude Code" ]]
}

# ── Section label injection ──────────────────────────────────────────────

@test "injectSectionLabel: adds label above h1" {
  result=$(run_transform '
    const nav = { overview: "Getting started", hooks: "Reference" };
    console.log(T.injectSectionLabel("<h1>Overview</h1>", "overview", nav));
  ')
  [[ "$result" == '<p class="section-label">Getting started</p><h1>Overview</h1>' ]]
}

@test "injectSectionLabel: no-op for unknown slug" {
  result=$(run_transform '
    console.log(T.injectSectionLabel("<h1>Unknown</h1>", "nope", {}));
  ')
  [[ "$result" == "<h1>Unknown</h1>" ]]
}

# ── Page description conversion ──────────────────────────────────────────

@test "convertPageDescription: blockquote after h1 → page-description" {
  result=$(run_transform '
    const html = "</h1>\n<blockquote>\n<p>A brief description</p>\n</blockquote>";
    console.log(T.convertPageDescription(html));
  ')
  [[ "$result" == *'class="page-description"'* ]]
  [[ "$result" == *'A brief description'* ]]
  # Should not contain blockquote
  [[ "$result" != *'<blockquote>'* ]]
}

@test "convertPageDescription: later blockquotes untouched" {
  result=$(run_transform '
    const html = "</h1>\n<p>text</p>\n<blockquote>\n<p>A note</p>\n</blockquote>";
    console.log(T.convertPageDescription(html));
  ')
  [[ "$result" == *'<blockquote>'* ]]
}

# ── Dash anchor injection ────────────────────────────────────────────────

@test "injectDashAnchors: h2 gets Section anchor" {
  result=$(run_transform 'console.log(T.injectDashAnchors("<h2>Getting started</h2>"))')
  [[ "$result" == *'//apple_ref/cpp/Section/Getting%20started'* ]]
  [[ "$result" == *'class="dashAnchor"'* ]]
  [[ "$result" == *'id="getting-started"'* ]]
}

@test "injectDashAnchors: h3 gets Entry anchor" {
  result=$(run_transform 'console.log(T.injectDashAnchors("<h3>Usage</h3>"))')
  [[ "$result" == *'//apple_ref/cpp/Entry/Usage'* ]]
}

@test "injectDashAnchors: skips card titles" {
  result=$(run_transform '
    console.log(T.injectDashAnchors("<h3 data-component-part=\"card-title\">Card</h3>"));
  ')
  # Should NOT contain dashAnchor
  [[ "$result" != *'dashAnchor'* ]]
  [[ "$result" == '<h3 data-component-part="card-title">Card</h3>' ]]
}

@test "injectDashAnchors: preserves existing id" {
  result=$(run_transform 'console.log(T.injectDashAnchors("<h2 id=\"custom\">Title</h2>"))')
  [[ "$result" == *'id="custom"'* ]]
  # Should NOT add a second id
  [[ "$result" != *'id="title"'* ]]
}

@test "injectDashAnchors: strips inner HTML for anchor name" {
  result=$(run_transform 'console.log(T.injectDashAnchors("<h2><code>foo</code> bar</h2>"))')
  [[ "$result" == *'//apple_ref/cpp/Section/foo%20bar'* ]]
}

# ── MDX preprocessing ────────────────────────────────────────────────────

@test "preprocessMdx: strips export const blocks" {
  result=$(run_transform '
    const src = "# Title\n\nexport const Foo = () => {\n  return null;\n};\n\nMore text";
    console.log(T.preprocessMdx(src));
  ')
  [[ "$result" != *'export const'* ]]
  [[ "$result" == *'# Title'* ]]
  [[ "$result" == *'More text'* ]]
}

# ── JSX angle bracket escaping ───────────────────────────────────────────

@test "escapeJsxAngleBrackets: escapes placeholder tokens" {
  result=$(run_transform 'console.log(T.escapeJsxAngleBrackets("use <name> here"))')
  [[ "$result" == 'use &lt;name&gt; here' ]]
}

@test "escapeJsxAngleBrackets: escapes hyphenated placeholders" {
  result=$(run_transform 'console.log(T.escapeJsxAngleBrackets("cd <outside-dir>"))')
  [[ "$result" == 'cd &lt;outside-dir&gt;' ]]
}

@test "escapeJsxAngleBrackets: preserves real HTML tags" {
  result=$(run_transform 'console.log(T.escapeJsxAngleBrackets("<a href=\"x\">link</a>"))')
  [[ "$result" == '<a href="x">link</a>' ]]
}

@test "escapeJsxAngleBrackets: preserves common HTML tags" {
  for tag in p div span code pre img br hr strong em ul ol li table tr td th; do
    result=$(run_transform "console.log(T.escapeJsxAngleBrackets('<$tag>'))")
    [[ "$result" == "<$tag>" ]] || { echo "FAIL: <$tag> was escaped"; return 1; }
  done
}

@test "escapeJsxAngleBrackets: mixed content" {
  result=$(run_transform '
    console.log(T.escapeJsxAngleBrackets("Fixed <code>cd <outside-dir> && <cmd></code> prompt"));
  ')
  [[ "$result" == *'<code>'* ]]
  [[ "$result" == *'&lt;outside-dir&gt;'* ]]
  [[ "$result" == *'&lt;cmd&gt;'* ]]
  [[ "$result" == *'</code>'* ]]
}

# ── Changelog truncation ────────────────────────────────────────────────

@test "truncateChangelog: truncates to N versions" {
  result=$(run_transform "
    const { readFileSync } = await import('node:fs');
    const md = readFileSync('$FIXTURES/changelog-sample.md', 'utf-8');
    const out = T.truncateChangelog(md, 2);
    const versions = out.match(/^## \d/gm) || [];
    console.log(versions.length);
  ")
  [[ "$result" == "2" ]]
}

@test "truncateChangelog: adds remainder link" {
  result=$(run_transform "
    const md = (await import('node:fs')).readFileSync('$FIXTURES/changelog-sample.md', 'utf-8');
    console.log(T.truncateChangelog(md, 2));
  ")
  [[ "$result" == *'Plus 3 earlier versions'* ]]
  [[ "$result" == *'full changelog'* ]]
}

@test "truncateChangelog: escapes angle brackets" {
  result=$(run_transform "
    const md = (await import('node:fs')).readFileSync('$FIXTURES/changelog-sample.md', 'utf-8');
    console.log(T.truncateChangelog(md, 5));
  ")
  [[ "$result" == *'&lt;outside-dir&gt;'* ]]
  [[ "$result" == *'&lt;name&gt;'* ]]
  # Real HTML preserved
  [[ "$result" == *'<a href='* ]]
}

@test "truncateChangelog: no truncation when under limit" {
  result=$(run_transform "
    const md = (await import('node:fs')).readFileSync('$FIXTURES/changelog-sample.md', 'utf-8');
    const out = T.truncateChangelog(md, 100);
    console.log(out.includes('earlier version') ? 'truncated' : 'full');
  ")
  [[ "$result" == "full" ]]
}

# ── Nav parsing ──────────────────────────────────────────────────────────

@test "parseNavTabs: extracts slugs from simple pages" {
  result=$(run_transform "
    const tabs = JSON.parse((await import('node:fs')).readFileSync('$FIXTURES/nav-tabs.json', 'utf-8'));
    const { navOrder } = T.parseNavTabs(tabs);
    console.log(navOrder.join(','));
  ")
  [[ "$result" == *'overview'* ]]
  [[ "$result" == *'quickstart'* ]]
  [[ "$result" == *'cli-reference'* ]]
}

@test "parseNavTabs: strips en/ prefix" {
  result=$(run_transform "
    const tabs = JSON.parse((await import('node:fs')).readFileSync('$FIXTURES/nav-tabs.json', 'utf-8'));
    const { navOrder } = T.parseNavTabs(tabs);
    console.log(navOrder.some(s => s.startsWith('en/')) ? 'has-prefix' : 'clean');
  ")
  [[ "$result" == "clean" ]]
}

@test "parseNavTabs: maps slugs to group names" {
  result=$(run_transform "
    const tabs = JSON.parse((await import('node:fs')).readFileSync('$FIXTURES/nav-tabs.json', 'utf-8'));
    const { navMap } = T.parseNavTabs(tabs);
    console.log(navMap['overview']);
    console.log(navMap['hooks']);
  ")
  echo "$result"
  [[ "$(echo "$result" | head -1)" == "Getting started" ]]
  [[ "$(echo "$result" | tail -1)" == "Reference" ]]
}

@test "parseNavTabs: handles nested groups" {
  result=$(run_transform "
    const tabs = JSON.parse((await import('node:fs')).readFileSync('$FIXTURES/nav-tabs.json', 'utf-8'));
    const { navMap } = T.parseNavTabs(tabs);
    console.log(navMap['vs-code']);
    console.log(navMap['jetbrains']);
  ")
  echo "$result"
  [[ "$(echo "$result" | head -1)" == "IDE integrations" ]]
  [[ "$(echo "$result" | tail -1)" == "IDE integrations" ]]
}

@test "parseNavTabs: preserves navigation order" {
  result=$(run_transform "
    const tabs = JSON.parse((await import('node:fs')).readFileSync('$FIXTURES/nav-tabs.json', 'utf-8'));
    const { navOrder } = T.parseNavTabs(tabs);
    console.log(navOrder.join(','));
  ")
  # overview should come before cli-reference (first tab before second)
  local overview_pos cli_pos
  overview_pos=$(echo "$result" | tr ',' '\n' | grep -n '^overview$' | cut -d: -f1)
  cli_pos=$(echo "$result" | tr ',' '\n' | grep -n '^cli-reference$' | cut -d: -f1)
  [[ "$overview_pos" -lt "$cli_pos" ]]
}

# ── Version sorting ──────────────────────────────────────────────────────

@test "semverSort: sorts correctly (2.1.9 before 2.1.71)" {
  result=$(run_transform '
    const sorted = T.semverSort(["v2.1.71", "v2.1.9", "v2.1.70", "v2.0.1"]);
    console.log(sorted.join(","));
  ')
  [[ "$result" == "v2.0.1,v2.1.9,v2.1.70,v2.1.71" ]]
}

@test "semverSort: handles versions without v prefix" {
  result=$(run_transform '
    const sorted = T.semverSort(["2.1.10", "2.1.2", "2.1.1"]);
    console.log(sorted.join(","));
  ')
  [[ "$result" == "2.1.1,2.1.2,2.1.10" ]]
}

@test "semverSort: does not mutate input" {
  result=$(run_transform '
    const input = ["v2.0.0", "v1.0.0"];
    T.semverSort(input);
    console.log(input.join(","));
  ')
  [[ "$result" == "v2.0.0,v1.0.0" ]]
}
