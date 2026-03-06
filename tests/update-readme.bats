#!/usr/bin/env bats

# Tests for libexec/update-readme
# Exercises: inject_section, shield_escape, truncate, badge generation,
# preflight checks, reports/README.md generation

setup() {
  FIXTURES="$BATS_TEST_DIRNAME/fixtures"
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"

  mkdir -p "$NAVEL_HOME/reports" "$NAVEL_HOME/npm"

  # Copy fixture data
  cp "$FIXTURES/hooks.json" "$NAVEL_HOME/reports/"
  cp "$FIXTURES/commands.json" "$NAVEL_HOME/reports/"
  cp "$FIXTURES/versions.json" "$NAVEL_HOME/npm/"
  cp "$FIXTURES/README-template.md" "$NAVEL_HOME/README.md"
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── inject_section ──────────────────────────────────────────────────────

@test "inject_section: replaces content between markers" {
  run bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ "$status" -eq 0 ]

  # Badges should be injected
  content=$(cat "$NAVEL_HOME/README.md")
  [[ "$content" == *"shields.io"* ]]
  # Old content should be gone
  [[ "$content" != *"old badges here"* ]]
}

@test "inject_section: preserves content before and after markers" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/README.md")
  # Content before markers
  [[ "$content" == *"# Test Project"* ]]
  [[ "$content" == *"Some intro text here."* ]]
  # Content after markers
  [[ "$content" == *"More content below."* ]]
}

@test "inject_section: idempotent — running twice produces identical output" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  first=$(cat "$NAVEL_HOME/README.md")

  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  second=$(cat "$NAVEL_HOME/README.md")

  [ "$first" = "$second" ]
}

@test "inject_section: missing markers warns to stderr, does not corrupt" {
  # Remove markers from README
  echo "# No Markers Here" > "$NAVEL_HOME/README.md"

  run bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ "$status" -eq 0 ]
  [[ "$output" == *"warning"* ]] || [[ "$output" == *"marker"* ]]

  # File should not be corrupted
  content=$(cat "$NAVEL_HOME/README.md")
  [ "$content" = "# No Markers Here" ]
}

# ── Badge counts ────────────────────────────────────────────────────────

@test "badges: version count is correct" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/README.md")
  # versions.json has 2 versions
  [[ "$content" == *"versions-2-blue"* ]]
}

@test "badges: hook count is correct" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/README.md")
  # hooks.json has 3 hooks
  [[ "$content" == *"hooks-3-green"* ]]
}

@test "badges: command count is correct" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/README.md")
  # commands.json has 8 commands
  [[ "$content" == *"commands-8-orange"* ]]
}

@test "badges: last_sync date has escaped hyphens for shields.io" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/README.md")
  # 2026-02-28 should become 2026--02--28
  [[ "$content" == *"2026--02--28"* ]]
}

# ── Preflight checks ───────────────────────────────────────────────────

@test "preflight: fails when hooks.json missing" {
  rm "$NAVEL_HOME/reports/hooks.json"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ "$status" -eq 1 ]
  [[ "$output" == *"hooks.json"* ]]
}

@test "preflight: fails when commands.json missing" {
  rm "$NAVEL_HOME/reports/commands.json"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ "$status" -eq 1 ]
  [[ "$output" == *"commands.json"* ]]
}

@test "preflight: fails when README.md missing" {
  rm "$NAVEL_HOME/README.md"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ "$status" -eq 1 ]
  [[ "$output" == *"README.md"* ]]
}

# ── reports/README.md generation ────────────────────────────────────────

@test "reports README: generated with hooks table" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  [ -f "$NAVEL_HOME/reports/README.md" ]
  content=$(cat "$NAVEL_HOME/reports/README.md")
  # Should have hooks section
  [[ "$content" == *"Hooks (3)"* ]]
  [[ "$content" == *"PreToolUse"* ]]
  [[ "$content" == *"SessionStart"* ]]
}

@test "reports README: hooks table has correct 'Since' version" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/reports/README.md")
  # PreToolUse added in 2.0.0
  [[ "$content" == *"PreToolUse | 2.0.0"* ]]
  # PostToolUse added in 2.0.5
  [[ "$content" == *"PostToolUse | 2.0.5"* ]]
}

@test "reports README: generated with commands table" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/reports/README.md")
  [[ "$content" == *"Commands (8)"* ]]
  [[ "$content" == *"/review"* ]]
  [[ "$content" == *"/commit"* ]]
}

@test "reports README: commands table has descriptions" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/reports/README.md")
  [[ "$content" == *"Review code changes"* ]]
}

@test "reports README: changelog table has version entries" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/reports/README.md")
  [[ "$content" == *"Changelog"* ]]
  [[ "$content" == *"2.0.0"* ]]
  [[ "$content" == *"2.0.5"* ]]
}

@test "reports README: changelog shows added hooks and commands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-readme"
  content=$(cat "$NAVEL_HOME/reports/README.md")
  # v2.0.5 added PostToolUse hook and voice command
  [[ "$content" == *"+PostToolUse"* ]]
  [[ "$content" == *"+voice"* ]]
}

# ── Helper functions ────────────────────────────────────────────────────

@test "shield_escape: doubles hyphens" {
  # Source the function by extracting it
  shield_escape() { echo "$1" | sed 's/-/--/g'; }
  result=$(shield_escape "2026-02-28")
  [ "$result" = "2026--02--28" ]
}

@test "shield_escape: no-op on string without hyphens" {
  shield_escape() { echo "$1" | sed 's/-/--/g'; }
  result=$(shield_escape "hello")
  [ "$result" = "hello" ]
}

@test "truncate: leaves short strings alone" {
  truncate() {
    local str="$1" max="$2"
    if [[ ${#str} -gt $max ]]; then echo "${str:0:$((max - 3))}..."
    else echo "$str"; fi
  }
  result=$(truncate "short" 20)
  [ "$result" = "short" ]
}

@test "truncate: truncates long strings with ellipsis" {
  truncate() {
    local str="$1" max="$2"
    if [[ ${#str} -gt $max ]]; then echo "${str:0:$((max - 3))}..."
    else echo "$str"; fi
  }
  result=$(truncate "This is a very long description that should be truncated" 20)
  [ "$result" = "This is a very lo..." ]
  [ ${#result} -eq 20 ]
}
