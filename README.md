# navel

An introspection toolkit for examining Claude Code's internals—system prompts, tool definitions, hook events, documentation—across every published version.

And the name? Exactly what you think it is: a whole lot of navel-gazing. The Claude logo even looks like a belly button if you squint even a little bit.

<!-- navel:begin:badges -->
![Versions](https://img.shields.io/badge/versions-350-blue?style=flat&logo=claude) ![Hooks](https://img.shields.io/badge/hooks-21-green?style=flat&logo=claude) ![Commands](https://img.shields.io/badge/commands-81-orange?style=flat&logo=claude) ![Last sync](https://img.shields.io/badge/last_sync-2026--03--11-lightgrey?style=flat)
<!-- navel:end:badges -->

## What it does

- **Caches every published version** of `@anthropic-ai/claude-code` from npm (direct tarball download, no npm required)
- **Captures the full system prompt** sent to the API on first message—the entire `messages.create()` payload including tool definitions
- **Tracks hook events** across versions and cross-references them against official documentation (spoiler: some hooks exist in code but have zero docs)
- **Syncs official docs** from code.claude.com with change detection and diffing
- **Diffs everything**—prompts between versions, docs between syncs

## Quick start

```bash
git clone https://github.com/claylo/navel.git
cd navel
bin/navel update
```

That's it. `update` syncs the npm cache, fetches docs, scans for hooks, and captures the latest version's prompt.

## Commands

```
navel prompts capture latest          # capture the system prompt
navel prompts diff v2.1.62 v2.1.63   # what changed between versions?
navel prompts diff-all                # which versions changed the prompt?
navel prompts inspect latest          # metadata: tools, model, token limits
navel prompts tools latest            # list every tool in the payload

navel npm sync                        # download new versions from registry
navel docs sync                       # fetch docs (with change detection)
navel docs diff                       # show what changed in the last sync
navel hooks sync                      # scan for hook events + check docs coverage
navel commands sync                   # scan for bundled slash commands

navel status                          # dashboard
navel outdated                        # your installed claude vs latest
navel update                          # sync everything, capture new prompt
```

Run `navel prompts help` for the full prompt subcommand list.

## Prerequisites

- **jq** — `brew install jq` / `apt install jq`
- **ripgrep** — `brew install ripgrep` / `apt install ripgrep`
- **curl** — ships with macOS and most Linux distros
- **node** — required for prompt capture only (`navel prompts capture`)

## Where data lives

| Directory | Contents |
|-----------|----------|
| `npm/versions/` | Cached npm packages (one per version) |
| `reports/hooks.json` | Hook events, history, and docs coverage |
| `reports/commands.json` | Bundled slash commands, history, and docs coverage |
| `reports/docs-changes.json` | Documentation change log across syncs |
| `prompts/versions/` | Captured system prompts and raw payloads |
| `docs/` | Official documentation from code.claude.com |
| `docs/diffs/` | Unified diffs between doc syncs |

When installed via Homebrew, data goes to `~/.navel/` (override with `NAVEL_HOME`). When running from a repo checkout, data stays in the repo.

## How prompt capture works

Claude Code assembles its system prompt **entirely client-side** before sending it to the API. `navel` exploits this: it runs `node cli.js` with `ANTHROPIC_BASE_URL` pointed at a local HTTP server that intercepts the first `messages.create()` request, captures the full payload, responds with minimal SSE, and exits. Takes about 5 seconds per version.

The captured payload includes everything—system prompt blocks, tool definitions with schemas, model parameters. That's what you're diffing when you run `navel prompts diff`.

## Interesting findings

- Three hook events (`Elicitation`, `ElicitationResult`, `Setup`) exist in the code but have **zero documentation** anywhere in the official docs
- The system prompt is 100% client-side—auth method doesn't change it, there's no server-side injection (theoretically possible, not observed)
- Tool definitions change more frequently than you'd expect between minor versions

## License

MIT
