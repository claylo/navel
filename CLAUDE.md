# navel — Claude Code Introspection Toolkit

Tracks commands, hooks, feature flags, and documentation across Claude Code releases.

## Architecture

- `bin/navel` — CLI dispatcher (subcommands: update, commands sync, hooks sync, docs sync, etc.)
- `libexec/_portable.sh` — shared helpers: platform detection, binary-era support, reports dir
- `libexec/update-commands-list` — scans for slash commands, classifies status, cross-references docs
- `libexec/update-hooks-list` — scans for hook registrations
- `libexec/update-env-vars-list` — scans for environment variable references
- `libexec/update-tools-list` — extracts tool definitions from prompt captures, tracks adds/removes/modifications
- `libexec/search` — cross-version string search across cached npm versions
- `libexec/update-docs` — parallel fetch of docs from code.claude.com with SHA256 manifest
- `libexec/update-readme` — generates badges and reports/README.md
- `libexec/update-npm` — fetches new npm versions, installs platform packages for binary-era versions
- `libexec/prompts` — prompt capture gateway and diff generation
- `reports/commands.json` — canonical output: commands, descriptions, status, history, docs coverage
- `reports/hooks.json` — canonical output: hooks, history, docs coverage
- `reports/tools.json` — canonical output: tools, descriptions, schemas, history, docs coverage
- `npm/.cache/commands/` — cached per-version command extraction (avoids re-scanning old versions)
- `npm/.cache/hooks/` — cached per-version hook extraction
- `npm/.cache/flags/` — cached per-version feature flag wrapper→flag_name mappings
- `npm/.cache/strings/` — cached `strings -a` output for binary-era versions (used by search)
- `prompts/diffs/` — committed unified diffs between consecutive system prompt captures
- `docs/adr/` — architectural decision records
- `tests/` — bats tests (`just test`)

## Key Patterns: Scanning Claude Code Source

### Two eras of packaging

- **cli.js era (v0.2.33–v2.1.112):** Claude Code ships as a single minified `cli.js` (~12MB).
- **Binary era (v2.1.113+):** Claude Code ships as a Bun-compiled native binary (~195MB Mach-O).

The cutover is hardcoded in `_portable.sh` as `BINARY_CUTOVER="2.1.113"`. The
`_scannable_source()` helper abstracts this: for cli.js versions it returns the JS file
directly; for binary versions it runs `strings -a` to extract string literals into a temp
file. Either way, the caller gets a path that `rg`/`grep` can scan with identical patterns.

**`strings -a` is critical.** The default `strings` on macOS skips non-standard Mach-O
sections. Bun embeds JS source in a `__bun` section (segment `__BUN`) which is ~133MB of
the binary. Without `-a`, zero application strings are found.

**Binary versions produce duplicates.** Bun embeds source twice (source + bytecode), so
scanners must dedup with `sort -u`.

### String literals survive both minification and compilation

Function names are mangled every build, but **string literals survive**. This is the
foundation of all scanning — it works identically against cli.js and `strings -a` output.

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

1. Find the new command in the scannable source: `rg -o '.{0,30}name:"NEW_CMD".{0,200}' <source>`
2. Identify the registration structure
3. Add a new `rg` pattern to the extraction section
4. Clear the cache for the affected version: `rm npm/.cache/commands/{version}.txt`

If Anthropic changes binary packaging (different compiler, stripped strings, encrypted
bundles), `_scannable_source` will return an empty or useless temp file. The regression
detection (command count drop) should still catch it. To investigate:

1. Check what `strings -a` produces: `strings -a <binary> | wc -l`
2. Look for known strings: `strings -a <binary> | grep 'name:"help"'`
3. If strings are gone, a new extraction method is needed — update `_scannable_source`

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
