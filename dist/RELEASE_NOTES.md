![navel](https://github.com/claylo/navel/releases/download/v1.0.0/navel-gh-header.png)

## navel v1.0.0 — "Omphaloskepsis"

An introspection toolkit for examining Claude Code's internals — commands, hooks, feature flags, system prompts, and documentation — across every published npm version.

### Highlights

- **347 npm versions** tracked, cached, and scannable
- **80 slash commands** extracted and classified as `available`, `gated` (behind GrowthBook feature flags), or `disabled`
- **21 hook events** with first-seen version attribution and docs coverage tracking
- **Feature flag resolution** — maps minified wrapper functions back to flag names like `tengu_marble_whisper` via string literal extraction
- **System prompt capture** — intercepts the full `messages.create()` payload by running Claude Code against a local HTTP server
- **Doc sync with change detection** — parallel-fetches 59 doc pages from code.claude.com, SHA256-hashes them, diffs between syncs
- **Per-version caching** — only new versions get scanned, full update in ~30s
- **47 bats tests** covering command extraction, hook scanning, badge generation, and edge cases

### Notable discoveries

- Two hook events (`Elicitation`, `ElicitationResult`) exist in code since v2.1.63 with zero official documentation
- The system prompt is assembled 100% client-side — no server-side injection observed
- Tool definitions change more frequently between minor versions than you'd expect

### Quick start

```bash
git clone https://github.com/claylo/navel.git
cd navel
bin/navel update
```

Requires `jq`, `ripgrep`, and `curl`. Node only needed for `navel prompts capture`.

### How it works

Claude Code ships as a single minified `cli.js` (~12MB). Function names are mangled, but **string literals survive minification**. navel exploits this with targeted `rg` patterns to extract command registrations, hook events, and feature flag mappings — no AST parsing, no deobfuscation, just regex on immutable strings.
