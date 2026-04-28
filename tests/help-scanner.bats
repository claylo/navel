#!/usr/bin/env bats

# Tests for libexec/update-help-list
# Exercises: help capture, recursive subcommands, version history, docs scanning

setup() {
  FIXTURES="$BATS_TEST_DIRNAME/fixtures"
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"
  export NAVEL_REPORTS_DIR="$NAVEL_HOME/reports"

  mkdir -p "$NAVEL_HOME/npm/versions"
  cp -R "$FIXTURES/npm/versions/v2.0.0" "$NAVEL_HOME/npm/versions/"
  cp -R "$FIXTURES/npm/versions/v2.0.5" "$NAVEL_HOME/npm/versions/"
  cp "$FIXTURES/versions.json" "$NAVEL_HOME/npm/versions.json"
  mkdir -p "$NAVEL_HOME/reports"

  mkdir -p "$NAVEL_HOME/docs"
  cp "$FIXTURES/docs/"*.md "$NAVEL_HOME/docs/"

  # Help scanner uses mock-claude instead of real binary.
  export NAVEL_HELP_USE_MOCK=1
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── Basic extraction ───────────────────────────────────────────────────

@test "help scanner: produces valid JSON with all expected keys" {
  run bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  echo "$output"
  [ "$status" -eq 0 ]
  [ -f "$NAVEL_HOME/reports/help.json" ]

  keys=$(jq -r 'keys[]' "$NAVEL_HOME/reports/help.json" | sort)
  [[ "$keys" == *"docs_checked_at"* ]]
  [[ "$keys" == *"help"* ]]
  [[ "$keys" == *"help_docs"* ]]
  [[ "$keys" == *"help_history"* ]]
}

@test "help scanner: cache file created per version" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  [ -f "$NAVEL_HOME/npm/.cache/help/2.0.0.json" ]
  [ -f "$NAVEL_HOME/npm/.cache/help/2.0.5.json" ]
}

@test "help scanner: cache file has correct structure" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"

  # Root node has required keys
  jq -e '.command' "$cache"
  jq -e '.text' "$cache"
  jq -e '.options' "$cache"
  jq -e '.subcommands' "$cache"

  # Command path is correct
  cmd=$(jq -r '.command' "$cache")
  [ "$cmd" = "claude" ]
}

@test "help scanner: extracts top-level options" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"

  # v2.0.5 has --print, --continue, --worktree, --help, --version
  opts=$(jq -r '.options[]' "$cache" | sort)
  echo "options: $opts"
  [[ "$opts" == *"--print"* ]]
  [[ "$opts" == *"--worktree"* ]]
  [[ "$opts" == *"--help"* ]]
}

# ── Subcommand recursion ──────────────────────────────────────────────

@test "help scanner: captures subcommands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"

  subcmds=$(jq -r '.subcommands | keys[]' "$cache" | sort)
  echo "subcommands: $subcmds"
  [[ "$subcmds" == *"auth"* ]]
  [[ "$subcmds" == *"mcp"* ]]
  [[ "$subcmds" == *"plugin"* ]]
}

@test "help scanner: captures sub-subcommands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"

  # mcp should have add, list, remove
  mcp_subcmds=$(jq -r '.subcommands.mcp.subcommands | keys[]' "$cache" | sort)
  echo "mcp subcommands: $mcp_subcmds"
  [[ "$mcp_subcmds" == *"add"* ]]
  [[ "$mcp_subcmds" == *"list"* ]]

  # mcp.add should have --transport option
  mcp_add_opts=$(jq -r '.subcommands.mcp.subcommands.add.options[]' "$cache")
  echo "mcp add options: $mcp_add_opts"
  [[ "$mcp_add_opts" == *"--transport"* ]]
}

@test "help scanner: auth has login sub-subcommand with --method" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"

  auth_subcmds=$(jq -r '.subcommands.auth.subcommands | keys[]' "$cache" | sort)
  echo "auth subcommands: $auth_subcmds"
  [[ "$auth_subcmds" == *"login"* ]]

  login_opts=$(jq -r '.subcommands.auth.subcommands.login.options[]' "$cache")
  echo "auth login options: $login_opts"
  [[ "$login_opts" == *"--method"* ]]
}

# ── History tracking ──────────────────────────────────────────────────

@test "help scanner: history tracks added options" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local report="$NAVEL_HOME/reports/help.json"

  # v2.0.5 added --worktree compared to v2.0.0
  added=$(jq -r '.help_history["2.0.5"].added_options.claude[]' "$report" 2>/dev/null)
  echo "v2.0.5 added options: $added"
  [[ "$added" == *"--worktree"* ]]
}

@test "help scanner: history tracks added subcommands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local report="$NAVEL_HOME/reports/help.json"

  # v2.0.5 added plugin subcommand
  added=$(jq -r '.help_history["2.0.5"].added_subcommands.claude[]' "$report" 2>/dev/null)
  echo "v2.0.5 added subcommands: $added"
  [[ "$added" == *"plugin"* ]]
}

@test "help scanner: history tracks added sub-subcommand options" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local report="$NAVEL_HOME/reports/help.json"

  # v2.0.5 added --transport to mcp add
  added=$(jq -r '.help_history["2.0.5"].added_options["claude.mcp.add"][]' "$report" 2>/dev/null)
  echo "v2.0.5 mcp add added options: $added"
  [[ "$added" == *"--transport"* ]]
}

# ── Cache hit ─────────────────────────────────────────────────────────

@test "help scanner: second run uses cache" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local cache="$NAVEL_HOME/npm/.cache/help/2.0.5.json"
  local mtime1
  mtime1=$(stat -f '%m' "$cache" 2>/dev/null || stat -c '%Y' "$cache")

  sleep 1
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local mtime2
  mtime2=$(stat -f '%m' "$cache" 2>/dev/null || stat -c '%Y' "$cache")

  # Cache file should not be rewritten
  [ "$mtime1" = "$mtime2" ]
}

# ── Docs cross-reference ─────────────────────────────────────────────

@test "help scanner: docs cross-reference populates for known options" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  local report="$NAVEL_HOME/reports/help.json"

  # help_docs should have entries
  count=$(jq '.help_docs | length' "$report")
  echo "help_docs entries: $count"
  [ "$count" -gt 0 ]
}

# ── Edge cases ────────────────────────────────────────────────────────

@test "help scanner: works without docs directory" {
  rm -rf "$NAVEL_HOME/docs"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Warning"* ]]
  jq -e '.help' "$NAVEL_HOME/reports/help.json"
}

@test "help scanner: handles version where exe is missing" {
  # Create a version with no cli.js and no binary
  mkdir -p "$NAVEL_HOME/npm/versions/v2.0.1/node_modules/@anthropic-ai/claude-code"
  echo '{"name":"@anthropic-ai/claude-code","version":"2.0.1"}' > \
    "$NAVEL_HOME/npm/versions/v2.0.1/node_modules/@anthropic-ai/claude-code/package.json"
  echo '["2.0.0","2.0.1","2.0.5"]' > "$NAVEL_HOME/npm/versions.json"

  run bash "$BATS_TEST_DIRNAME/../libexec/update-help-list"
  [ "$status" -eq 0 ]
  # Should still produce a report from the other two versions
  count=$(jq '.help.claude.subcommands | keys | length' "$NAVEL_HOME/reports/help.json")
  [ "$count" -gt 0 ]
}
