# navel — Claude Code Introspection Toolkit

Tracks commands, hooks, feature flags, and documentation across Claude Code releases.

## Architecture

- `bin/navel` — CLI dispatcher (subcommands: update, commands sync, hooks sync, docs sync, etc.)
- `libexec/update-commands-list` — scans minified cli.js for slash commands, classifies status, cross-references docs
- `libexec/update-hooks-list` — scans for hook registrations
- `libexec/update-docs` — parallel fetch of docs from code.claude.com with SHA256 manifest
- `libexec/update-readme` — generates badges and reports/README.md
- `libexec/update-npm` — fetches new npm versions
- `reports/commands.json` — canonical output: commands, descriptions, status, history, docs coverage
- `reports/hooks.json` — canonical output: hooks, history, docs coverage
- `npm/.cache/commands/` — cached per-version command extraction (avoids re-scanning old versions)
- `npm/.cache/hooks/` — cached per-version hook extraction
- `npm/.cache/flags/` — cached per-version feature flag wrapper→flag_name mappings
- `docs/adr/` — architectural decision records
- `tests/` — bats tests (`just test`)

## Key Patterns: Resolving Minified cli.js

Claude Code ships as a single minified `cli.js` (~12MB). Function names are mangled
every build, but **string literals survive minification**. This is the foundation of
all scanning.

### Command Registration (5 patterns)

The minifier reorders object properties, so commands appear in multiple forms:

```
type:"local",name:"clear"                      ← type before name
type:"local-jsx",name:"help"                   ← type before name (JSX)
type:"prompt",name:"commit"                    ← type before name (prompt)
name:"doctor",...type:"local"                   ← name before type (same statement)
{name:"vim",...isEnabled                        ← name-first with isEnabled marker
name:"statusline",progressMessage:              ← skill-like builtin
name:"review",description:"..."...async         ← skill-registered command
```

All patterns use `rg` with `[^;]` to stay within one statement. Results are deduped
with `sort -u`.

### Feature Flag Resolution (the key technique)

Feature flag functions (`e8`, `r2`) take string arguments that survive minification:

```javascript
// Minified — the string "tengu_marble_whisper" is ALWAYS present:
function gz6(){return e8("tengu_marble_whisper",!1)}
```

**Step 1**: Find all wrapper functions in one pass:
```bash
rg -o 'function [A-Za-z0-9_]+\(\)\{return (e8|r2)\("tengu_[a-z_]+"' cli.js
```

This gives you the mapping: `gz6 → tengu_marble_whisper`, `SE → tengu_keybinding_customization_release`, etc.

**Step 2**: Check each command's `isEnabled` body:
```bash
rg -o 'name:"COMMAND"[^;]*isEnabled:\(\)=>[^,}]*' cli.js
```

**Step 3**: Classify:
- `()=>!1` → **disabled** (dead code)
- `()=>!0` → **available**
- Calls a wrapper from Step 1 → **gated** (server-side feature flag)
- Direct `e8("tengu_...")`/`r2(...)` call → **gated**
- Anything else → **available** (runtime condition)

These mappings are cached in `npm/.cache/flags/{version}.tsv`.

### Why This Works

The minifier renames identifiers but cannot change:
- String literal values (`"tengu_marble_whisper"`)
- Function call structure (`e8(...)`, `r2(...)`)
- Object property names (`isEnabled:`, `name:`, `type:`, `description:`)
- Boolean literals (`!0` = true, `!1` = false)

We only resolve **one level** of indirection (wrapper → flag call). This is a
deterministic regex match — no inference needed.

### When This Breaks

If Anthropic introduces a **new command registration pattern**, the scanner will miss
commands and the count will drop. The regression detection in `update-commands-list`
should catch this. To fix:

1. Find the new command in cli.js: `rg -o '.{0,30}name:"NEW_CMD".{0,200}' cli.js`
2. Identify the registration structure
3. Add a new `rg` pattern to the extraction section
4. Clear the cache for the affected version: `rm npm/.cache/commands/{version}.txt`

## Version Sorting

**CRITICAL**: `versions.json` is not semver-sorted. Always pipe through `sort -V`:
```bash
jq -r '.[]' versions.json | sort -V
```
Without this, `2.1.9` sorts after `2.1.70` (lexicographic), causing the scanner to
use the wrong "latest" version.

## Running

```bash
just test          # run all bats tests
just update        # full navel update
just status        # show counts
bin/navel update   # same as just update
```

## Commit Style

Clay runs his own `git commit` with conventional commit messages. Do not commit
unless explicitly asked.
