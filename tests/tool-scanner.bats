#!/usr/bin/env bats

# Tests for libexec/update-tools-list
# Exercises: tool extraction from prompt captures, version history, schema change detection

setup() {
  FIXTURES="$BATS_TEST_DIRNAME/fixtures"
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"
  export NAVEL_REPORTS_DIR="$NAVEL_HOME/reports"

  mkdir -p "$NAVEL_HOME/prompts/versions"
  cp -R "$FIXTURES/prompts/versions/v2.0.0" "$NAVEL_HOME/prompts/versions/"
  cp -R "$FIXTURES/prompts/versions/v2.0.5" "$NAVEL_HOME/prompts/versions/"
  mkdir -p "$NAVEL_HOME/reports"

  mkdir -p "$NAVEL_HOME/docs"
  cp "$FIXTURES/docs/"*.md "$NAVEL_HOME/docs/"
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── Basic extraction ──────────────────────────────────────────────────

@test "tool scanner: produces valid JSON with all expected keys" {
  run bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"
  [ "$status" -eq 0 ]
  [ -f "$NAVEL_HOME/reports/tools.json" ]

  keys=$(jq -r 'keys[]' "$NAVEL_HOME/reports/tools.json" | sort)
  [[ "$keys" == *"docs_checked_at"* ]]
  [[ "$keys" == *"tools"* ]]
  [[ "$keys" == *"tools_descriptions"* ]]
  [[ "$keys" == *"tools_history"* ]]
  [[ "$keys" == *"tools_docs"* ]]
  [[ "$keys" == *"tools_schemas"* ]]
}

@test "tool scanner: correct tool count from latest version" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"
  count=$(jq '.tools | length' "$NAVEL_HOME/reports/tools.json")
  echo "tool count: $count"
  # v2.0.5 has: Agent, Bash, Edit, Read, TodoWrite
  [ "$count" -eq 5 ]
}

# ── History tracking ─────────────────────────────────────────────────

@test "tool scanner: tracks tools added per version" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"

  # v2.0.0: Bash, Edit, Read (3 tools added)
  v1_added=$(jq '.tools_history["2.0.0"].added | length' "$NAVEL_HOME/reports/tools.json")
  [ "$v1_added" -eq 3 ]

  # v2.0.5: Agent, TodoWrite added
  v2_added=$(jq -r '.tools_history["2.0.5"].added | sort | .[]' "$NAVEL_HOME/reports/tools.json")
  echo "v2.0.5 added: $v2_added"
  [[ "$v2_added" == *"Agent"* ]]
  [[ "$v2_added" == *"TodoWrite"* ]]
}

@test "tool scanner: tracks tools modified per version" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"

  # v2.0.5: Bash modified (added run_in_background param)
  modified=$(jq -r '.tools_history["2.0.5"].modified // [] | .[]' "$NAVEL_HOME/reports/tools.json")
  echo "v2.0.5 modified: $modified"
  [[ "$modified" == *"Bash"* ]]
}

# ── Schema tracking ──────────────────────────────────────────────────

@test "tool scanner: stores input_schema for each tool" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"

  # Bash should have run_in_background in its schema (from latest version)
  has_bg=$(jq '.tools_schemas.Bash.properties | has("run_in_background")' "$NAVEL_HOME/reports/tools.json")
  [ "$has_bg" = "true" ]
}

@test "tool scanner: stores description for each tool" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"
  desc=$(jq -r '.tools_descriptions.Bash' "$NAVEL_HOME/reports/tools.json")
  [[ "$desc" == *"bash command"* ]]
}

# ── Edge cases ───────────────────────────────────────────────────────

@test "tool scanner: works with single captured version" {
  rm -rf "$NAVEL_HOME/prompts/versions/v2.0.5"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"
  [ "$status" -eq 0 ]
  count=$(jq '.tools | length' "$NAVEL_HOME/reports/tools.json")
  [ "$count" -eq 3 ]
}

@test "tool scanner: works without docs directory" {
  rm -rf "$NAVEL_HOME/docs"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-tools-list"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Warning"* ]]
  count=$(jq '.tools | length' "$NAVEL_HOME/reports/tools.json")
  [ "$count" -gt 0 ]
}

# ── Dispatcher integration ───────────────────────────────────────────

@test "tool scanner: accessible via bin/navel tools sync" {
  run bash "$BATS_TEST_DIRNAME/../bin/navel" tools sync
  [ "$status" -eq 0 ]
  [ -f "$NAVEL_HOME/reports/tools.json" ]
}
