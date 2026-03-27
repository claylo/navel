#!/usr/bin/env bats

# Tests for libexec/update-hooks-list
# Exercises: hook rg pattern, version history, docs scanning

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
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── Pattern extraction ──────────────────────────────────────────────────

@test "hook scanner: extracts HookName:{summary:... pattern" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o '[A-Za-z]+:\{summary:"[^"]*"' "$cli" | sed 's/:{summary:.*//' | sort)
  echo "$result"
  [[ "$result" == *"PreToolUse"* ]]
  [[ "$result" == *"SessionStart"* ]]
}

@test "hook scanner: v2 adds PostToolUse hook" {
  cli="$NAVEL_HOME/npm/versions/v2.0.5/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o '[A-Za-z]+:\{summary:"[^"]*"' "$cli" | sed 's/:{summary:.*//' | sort)
  echo "$result"
  [[ "$result" == *"PostToolUse"* ]]
}

# ── Full scanner execution ──────────────────────────────────────────────

@test "hook scanner: produces valid JSON with all expected keys" {
  run bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  [ "$status" -eq 0 ]
  [ -f "$NAVEL_HOME/reports/hooks.json" ]

  keys=$(jq -r 'keys[]' "$NAVEL_HOME/reports/hooks.json" | sort)
  [[ "$keys" == *"docs_checked_at"* ]]
  [[ "$keys" == *"hooks"* ]]
  [[ "$keys" == *"hooks_docs"* ]]
  [[ "$keys" == *"hooks_history"* ]]
}

@test "hook scanner: correct hook count" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  count=$(jq '.hooks | length' "$NAVEL_HOME/reports/hooks.json")
  echo "hook count: $count"
  # v2.0.5 has: PreToolUse, PostToolUse, SessionStart
  [ "$count" -eq 3 ]
}

@test "hook scanner: version history tracks additions" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"

  # v2.0.0: PreToolUse, SessionStart
  v1_count=$(jq '.hooks_history["2.0.0"].added | length' "$NAVEL_HOME/reports/hooks.json")
  [ "$v1_count" -eq 2 ]

  # v2.0.5: PostToolUse
  v2_added=$(jq -r '.hooks_history["2.0.5"].added[]' "$NAVEL_HOME/reports/hooks.json")
  echo "v2.0.5 added: $v2_added"
  [ "$v2_added" = "PostToolUse" ]
}

# ── Docs scanning ───────────────────────────────────────────────────────

@test "hook scanner: docs scanning finds documented hooks" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  doc=$(jq -r '.hooks_docs.PreToolUse.documented' "$NAVEL_HOME/reports/hooks.json")
  [ "$doc" = "true" ]

  mentions=$(jq '.hooks_docs.PreToolUse.mentions' "$NAVEL_HOME/reports/hooks.json")
  echo "PreToolUse mentions: $mentions"
  [ "$mentions" -gt 0 ]
}

@test "hook scanner: docs scanning tracks source files" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  files=$(jq -r '.hooks_docs.PreToolUse.doc_files[]' "$NAVEL_HOME/reports/hooks.json")
  echo "PreToolUse doc_files: $files"
  [[ "$files" == *"getting-started.md"* ]]
  [[ "$files" == *"reference.md"* ]]
}

# ── Edge cases ──────────────────────────────────────────────────────────

@test "hook scanner: works without docs directory" {
  rm -rf "$NAVEL_HOME/docs"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Warning"* ]]
  count=$(jq '.hooks | length' "$NAVEL_HOME/reports/hooks.json")
  [ "$count" -gt 0 ]
}

@test "hook scanner: handles version with no hooks" {
  # Create a version with an empty cli.js
  mkdir -p "$NAVEL_HOME/npm/versions/v2.0.1/node_modules/@anthropic-ai/claude-code"
  echo "// no hooks here" > "$NAVEL_HOME/npm/versions/v2.0.1/node_modules/@anthropic-ai/claude-code/cli.js"
  echo '["2.0.0","2.0.1","2.0.5"]' > "$NAVEL_HOME/npm/versions.json"

  run bash "$BATS_TEST_DIRNAME/../libexec/update-hooks-list"
  [ "$status" -eq 0 ]
  count=$(jq '.hooks | length' "$NAVEL_HOME/reports/hooks.json")
  [ "$count" -eq 3 ]
}
