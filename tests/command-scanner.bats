#!/usr/bin/env bats

# Tests for libexec/update-commands-list
# Exercises: rg patterns, mcp__ filtering, private:!0 filtering,
# version history tracking, docs scanning, undocumented detection

setup() {
  FIXTURES="$BATS_TEST_DIRNAME/fixtures"
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"

  # Mirror fixture tree into temp NAVEL_HOME
  mkdir -p "$NAVEL_HOME/npm/versions"
  cp -R "$FIXTURES/npm/versions/v2.0.0" "$NAVEL_HOME/npm/versions/"
  cp -R "$FIXTURES/npm/versions/v2.0.5" "$NAVEL_HOME/npm/versions/"
  cp "$FIXTURES/versions.json" "$NAVEL_HOME/npm/versions.json"
  mkdir -p "$NAVEL_HOME/reports"

  # Docs fixtures
  mkdir -p "$NAVEL_HOME/docs"
  cp "$FIXTURES/docs/"*.md "$NAVEL_HOME/docs/"
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# ── Pattern extraction ──────────────────────────────────────────────────

@test "command scanner: finds type:local commands" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o 'type:"local(-jsx)?",name:"[a-z][-a-z_]*"' "$cli" \
    | sed 's/.*name:"//;s/"//' | sort)
  echo "$result"
  [[ "$result" == *"clear"* ]]
  [[ "$result" == *"compact"* ]]
  [[ "$result" == *"color"* ]]
}

@test "command scanner: finds type:local-jsx commands" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o 'type:"local(-jsx)?",name:"[a-z][-a-z_]*"' "$cli" \
    | sed 's/.*name:"//;s/"//' | sort)
  echo "$result"
  [[ "$result" == *"help"* ]]
  [[ "$result" == *"config"* ]]
}

@test "command scanner: finds type:prompt commands" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o 'type:"prompt",name:"[a-z][-a-z_]*"' "$cli" \
    | sed 's/.*name:"//;s/"//' | sort)
  echo "$result"
  [[ "$result" == *"commit"* ]]
}

@test "command scanner: finds skill-registered commands with async" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  result=$(rg -o 'name:"[a-z][-a-z_]*",description:"[^"]*"[^;]*async ' "$cli" \
    | sed 's/name:"//;s/".*//' | sort)
  echo "$result"
  [[ "$result" == *"review"* ]]
}

@test "command scanner: filters mcp__ prefix" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  # The raw prompt pattern picks up mcp__
  raw=$(rg -o 'type:"prompt",name:"[a-z][-a-z_]*"' "$cli" | sed 's/.*name:"//;s/"//')
  echo "raw: $raw"
  [[ "$raw" == *"mcp__"* ]]

  # After grep -v filter, mcp__ is gone
  filtered=$(echo "$raw" | grep -v '^mcp__')
  echo "filtered: $filtered"
  [[ "$filtered" != *"mcp__"* ]]
}

@test "command scanner: filters private:!0 commands" {
  cli="$NAVEL_HOME/npm/versions/v2.0.0/node_modules/@anthropic-ai/claude-code/cli.js"
  # claude-local should be detected as private
  run rg -q 'name:"claude-local"[^;]*private:!0' "$cli"
  [ "$status" -eq 0 ]
}

# ── Full scanner execution ──────────────────────────────────────────────

@test "command scanner: produces valid JSON with all expected keys" {
  run bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  [ "$status" -eq 0 ]
  [ -f "$NAVEL_HOME/reports/commands.json" ]

  # Validate all 6 keys
  keys=$(jq -r 'keys[]' "$NAVEL_HOME/reports/commands.json" | sort)
  [[ "$keys" == *"commands"* ]]
  [[ "$keys" == *"commands_docs"* ]]
  [[ "$keys" == *"commands_history"* ]]
  [[ "$keys" == *"descriptions"* ]]
  [[ "$keys" == *"docs_checked_at"* ]]
  [[ "$keys" == *"status"* ]]
}

@test "command scanner: correct command count (no mcp__, no private)" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  count=$(jq '.commands | length' "$NAVEL_HOME/reports/commands.json")
  echo "command count: $count"
  # v2.0.5 has: clear, color, compact, voice (local); help, config (local-jsx);
  # commit (prompt, mcp__ filtered); review (skill-async)
  # claude-local filtered by private:!0
  [ "$count" -eq 8 ]
}

@test "command scanner: mcp__ not in output commands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  run jq -e '.commands | index("mcp__")' "$NAVEL_HOME/reports/commands.json"
  [ "$status" -ne 0 ]
}

@test "command scanner: private command not in output" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  run jq -e '.commands | index("claude-local")' "$NAVEL_HOME/reports/commands.json"
  [ "$status" -ne 0 ]
}

@test "command scanner: version history tracks additions" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  # v2.0.0 should have the initial batch
  v1_added=$(jq '.commands_history["2.0.0"].added | length' "$NAVEL_HOME/reports/commands.json")
  echo "v2.0.0 added: $v1_added"
  [ "$v1_added" -gt 0 ]

  # v2.0.5 should have "voice" as new
  v2_added=$(jq -r '.commands_history["2.0.5"].added[]' "$NAVEL_HOME/reports/commands.json")
  echo "v2.0.5 added: $v2_added"
  [[ "$v2_added" == *"voice"* ]]
}

@test "command scanner: extracts descriptions" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  desc=$(jq -r '.descriptions.review' "$NAVEL_HOME/reports/commands.json")
  echo "review desc: $desc"
  [ "$desc" = "Review code changes" ]
}

# ── Docs scanning ───────────────────────────────────────────────────────

@test "command scanner: docs scanning finds documented commands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  doc=$(jq -r '.commands_docs.commit.documented' "$NAVEL_HOME/reports/commands.json")
  [ "$doc" = "true" ]
}

@test "command scanner: docs scanning finds undocumented commands" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  doc=$(jq -r '.commands_docs.compact.documented' "$NAVEL_HOME/reports/commands.json")
  [ "$doc" = "false" ]
}

@test "command scanner: undocumented commands have no doc files" {
  bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  undoc_files=$(jq -r '.commands_docs.compact.doc_files | length' "$NAVEL_HOME/reports/commands.json")
  [ "$undoc_files" -eq 0 ]
}

# ── Edge cases ──────────────────────────────────────────────────────────

@test "command scanner: works without docs directory" {
  rm -rf "$NAVEL_HOME/docs"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Warning"* ]]
  # Should still have commands, just no docs info
  count=$(jq '.commands | length' "$NAVEL_HOME/reports/commands.json")
  [ "$count" -gt 0 ]
}

@test "command scanner: handles empty version set" {
  echo '["1.0.0"]' > "$NAVEL_HOME/npm/versions.json"
  run bash "$BATS_TEST_DIRNAME/../libexec/update-commands-list"
  [ "$status" -eq 0 ]
  count=$(jq '.commands | length' "$NAVEL_HOME/reports/commands.json")
  [ "$count" -eq 0 ]
}
