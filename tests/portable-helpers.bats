#!/usr/bin/env bats

# Tests for _portable.sh helpers: _timeout and _resolve_claude_exe

setup() {
  . "$BATS_TEST_DIRNAME/../libexec/_portable.sh"
}

# ── _timeout ───────────────────────────────────────────────────────────

@test "_timeout: successful command completes" {
  run _timeout 5 echo "hello"
  [ "$status" -eq 0 ]
  [ "$output" = "hello" ]
}

@test "_timeout: command within time limit succeeds" {
  run _timeout 5 sleep 0.1
  [ "$status" -eq 0 ]
}

# ── _resolve_claude_exe ────────────────────────────────────────────────

@test "_resolve_claude_exe: finds cli.js for cli.js-era" {
  local tmpdir
  tmpdir=$(mktemp -d)
  mkdir -p "$tmpdir/node_modules/@anthropic-ai/claude-code"
  echo "// cli" > "$tmpdir/node_modules/@anthropic-ai/claude-code/cli.js"

  result=$(_resolve_claude_exe "$tmpdir/node_modules/@anthropic-ai/claude-code")
  echo "result: $result"
  [[ "$result" == *"node"* ]]
  [[ "$result" == *"cli.js"* ]]
  rm -rf "$tmpdir"
}

@test "_resolve_claude_exe: finds binary for binary-era" {
  local tmpdir
  tmpdir=$(mktemp -d)
  local pkg="$tmpdir/node_modules/@anthropic-ai/claude-code"
  mkdir -p "$pkg/node_modules/@anthropic-ai/claude-code-darwin-arm64"
  echo "#!/bin/sh" > "$pkg/node_modules/@anthropic-ai/claude-code-darwin-arm64/claude"
  chmod +x "$pkg/node_modules/@anthropic-ai/claude-code-darwin-arm64/claude"

  result=$(_resolve_claude_exe "$pkg")
  echo "result: $result"
  [[ "$result" == *"/claude" ]]
  [[ "$result" != "node "* ]]
  rm -rf "$tmpdir"
}

@test "_resolve_claude_exe: returns empty for missing package" {
  local tmpdir
  tmpdir=$(mktemp -d)
  result=$(_resolve_claude_exe "$tmpdir/nonexistent" 2>/dev/null) || true
  [ -z "$result" ]
  rm -rf "$tmpdir"
}
