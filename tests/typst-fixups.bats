#!/usr/bin/env bats

# Tests for libexec/js/typst-fixups.mjs
# Exercises: fixEscapedBackticks (repair of markdown2typst \` escape output)

FIXUPS="$BATS_TEST_DIRNAME/../libexec/js/typst-fixups.mjs"

# Helper: pass input via env var to avoid multi-level shell/JS escape hell.
# Test strings contain literal `\` sequences that MUST survive unmolested.
run_fixup() {
  TYPST_INPUT="$1" node --input-type=module -e "
import { fixEscapedBackticks } from '$FIXUPS';
process.stdout.write(fixEscapedBackticks(process.env.TYPST_INPUT));
"
}

# ── Parity guard: leave clean multi-span lines alone ──────────────────────

@test "fixEscapedBackticks: multi-span line with literal backslash untouched" {
  # REGRESSION: 2026-04-12 PDF build failure. Line had three adjacent inline
  # raw spans; the middle one ended with a literal backslash. Old regex
  # greedy-matched across span boundaries and produced broken triple-backticks.
  input='- Fixed `ctrl+]`, `ctrl+\`, and `ctrl+^` keybindings'
  result=$(run_fixup "$input")
  [[ "$result" == "$input" ]]
}

@test "fixEscapedBackticks: even-parity line with trailing-backslash span untouched" {
  input='text with `foo\` and `bar` spans'
  result=$(run_fixup "$input")
  [[ "$result" == "$input" ]]
}

@test "fixEscapedBackticks: line with no backslash escapes passes through" {
  input='plain `foo` and `bar`'
  result=$(run_fixup "$input")
  [[ "$result" == "$input" ]]
}

# ── Odd parity: actual markdown2typst escape gets rewritten ───────────────

@test "fixEscapedBackticks: odd-parity span rewrites to multi-backtick raw" {
  # markdown2typst emits \` for a backtick inside content — Typst cannot
  # parse this; we must rewrite to a multi-backtick raw block.
  input='some `foo\`bar` text'
  result=$(run_fixup "$input")
  # No more broken escape
  [[ "$result" != *'\`'* ]]
  # Unescaped content appears intact
  [[ "$result" == *'foo`bar'* ]]
  # Opens and closes with 3+ backticks
  [[ "$result" == *'```'* ]]
}

@test "fixEscapedBackticks: content ending in backtick gets space padding" {
  # Markdown2typst input representing `Ctrl+\`` (content = "Ctrl+`").
  input='key `Ctrl+\``'
  result=$(run_fixup "$input")
  [[ "$result" != *'\`'* ]]
  # Must contain the padded form: ``` Ctrl+` ```
  [[ "$result" == *'` '*'`'* ]]
}

# ── End-to-end: rewritten output compiles cleanly in Typst ────────────────

@test "fixEscapedBackticks: rewritten odd-parity line compiles with typst" {
  if ! command -v typst >/dev/null; then
    skip "typst not installed"
  fi
  input='some `foo\`bar` text'
  tmpdir=$(mktemp -d)
  printf '%s\n' "$(run_fixup "$input")" > "$tmpdir/t.typ"
  run typst compile "$tmpdir/t.typ" "$tmpdir/t.pdf"
  rm -rf "$tmpdir"
  [[ $status -eq 0 ]]
}

@test "fixEscapedBackticks: untouched multi-span line compiles with typst" {
  if ! command -v typst >/dev/null; then
    skip "typst not installed"
  fi
  input='- Fixed `ctrl+]`, `ctrl+\`, and `ctrl+^` keybindings'
  tmpdir=$(mktemp -d)
  printf '%s\n' "$(run_fixup "$input")" > "$tmpdir/t.typ"
  run typst compile "$tmpdir/t.typ" "$tmpdir/t.pdf"
  rm -rf "$tmpdir"
  [[ $status -eq 0 ]]
}

# ── Multi-line: line-by-line application ──────────────────────────────────

@test "fixEscapedBackticks: processes each line independently" {
  # Two lines — one with literal backslash (untouched), one with real escape (rewritten).
  input=$'- First `ctrl+\\`, next\n- Second `foo\\`bar` escape'
  result=$(run_fixup "$input")
  # First line has even parity (2 backticks) — unchanged
  [[ "$result" == *'- First `ctrl+\`, next'* ]]
  # Second line has odd parity (3 backticks) — rewritten
  [[ "$result" == *'foo`bar'* ]]
  [[ "$result" != *'foo\`bar'* ]]
}
