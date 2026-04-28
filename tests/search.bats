#!/usr/bin/env bats

# Tests for libexec/search and _cached_scannable_source

setup() {
  FIXTURES="$BATS_TEST_DIRNAME/fixtures"
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"
  export NAVEL_REPORTS_DIR="$NAVEL_HOME/reports"

  mkdir -p "$NAVEL_HOME/npm/versions"
  cp -R "$FIXTURES/npm/versions/v2.0.0" "$NAVEL_HOME/npm/versions/"
  cp -R "$FIXTURES/npm/versions/v2.0.5" "$NAVEL_HOME/npm/versions/"
  cp "$FIXTURES/versions.json" "$NAVEL_HOME/npm/versions.json"
  mkdir -p "$NAVEL_HOME/npm/.cache/strings"
  mkdir -p "$NAVEL_HOME/reports"
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── _cached_scannable_source ─────────────────────────────────────────

@test "search: _cached_scannable_source returns path for cli.js version" {
  source "$BATS_TEST_DIRNAME/../libexec/_portable.sh"
  pkg_dir="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code"
  result=$(_cached_scannable_source "$pkg_dir" "$NAVEL_HOME/npm/.cache/strings" "2.0.0")
  [ -f "$result" ]
  [[ "$result" == *"cli.js" ]]
}

# ── Basic search ─────────────────────────────────────────────────────

@test "search: finds pattern present in both versions" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" "PreToolUse"
  [ "$status" -eq 0 ]
  [[ "$output" == *"2.0.0"* ]]
  [[ "$output" == *"2.0.5"* ]]
}

@test "search: reports absence when pattern not found" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" "NonexistentThing12345"
  [ "$status" -eq 0 ]
  [[ "$output" != *"✓"* ]]
}

@test "search: shows first-seen version" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" "PostToolUse"
  [ "$status" -eq 0 ]
  [[ "$output" == *"2.0.5"*"✓"* ]]
  line_2_0_0=$(echo "$output" | grep "2.0.0" || true)
  [[ "$line_2_0_0" != *"✓"* ]]
}

# ── --since filtering ────────────────────────────────────────────────

@test "search: --since filters out earlier versions" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" --since 2.0.5 "PreToolUse"
  [ "$status" -eq 0 ]
  [[ "$output" != *"2.0.0"* ]]
  [[ "$output" == *"2.0.5"* ]]
}

# ── Error handling ───────────────────────────────────────────────────

@test "search: exits with usage when no pattern given" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search"
  [ "$status" -ne 0 ]
  [[ "$output" == *"usage"* ]]
}

# ── Dispatcher integration ───────────────────────────────────────────

@test "search: accessible via bin/navel search" {
  # bin/navel sets NAVEL_HOME to the repo root in checkout mode, so we
  # can't inject fixtures here — just verify dispatch reaches the script
  # (not "unknown command") and exits cleanly.
  run bash "$BATS_TEST_DIRNAME/../bin/navel" search "PreToolUse"
  [ "$status" -eq 0 ]
  [[ "$output" != *"unknown command"* ]]
  [[ "$output" == *"Pattern"* ]]
}

@test "search: navel search --help shows usage and exits 0" {
  run bash "$BATS_TEST_DIRNAME/../bin/navel" search --help
  [ "$status" -eq 0 ]
  [[ "$output" == *"usage"* ]]
}

# ── --json and --context flags ───────────────────────────────────────

@test "search: --json outputs valid JSON with expected keys" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" --json "PreToolUse"
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.pattern and .versions' >/dev/null
  matched=$(echo "$output" | jq '.matched')
  [ "$matched" -gt 0 ]
}

@test "search: --context shows snippet in output" {
  run bash "$BATS_TEST_DIRNAME/../libexec/search" --context 10 "PreToolUse"
  [ "$status" -eq 0 ]
  [[ "$output" == *"PreToolUse"* ]]
}
