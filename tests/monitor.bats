#!/usr/bin/env bats

# Tests for navel monitor + libexec/notify
# Exercises: target validation, auto-detection, build pass/fail,
# notification dispatch, log creation

setup() {
  TMPDIR_ORIG="$(mktemp -d)"
  export NAVEL_HOME="$TMPDIR_ORIG"

  REPO_ROOT="$BATS_TEST_DIRNAME/.."
  REAL_LIBEXEC="$REPO_ROOT/libexec"

  # Create mock libexec with real notify + mock build scripts
  MOCK_LIBEXEC="$TMPDIR_ORIG/libexec"
  mkdir -p "$MOCK_LIBEXEC"

  # Copy real portable and notify
  cp "$REAL_LIBEXEC/_portable.sh" "$MOCK_LIBEXEC/"
  cp "$REAL_LIBEXEC/notify" "$MOCK_LIBEXEC/"

  # Create mock docs so auto-detect doesn't bail
  mkdir -p "$NAVEL_HOME/docs"
  echo "# test" > "$NAVEL_HOME/docs/test.md"

  # Ensure no Pushover credentials leak into tests
  unset PUSHOVER_USER_KEY
  unset PUSHOVER_APP_TOKEN
}

teardown() {
  rm -rf "$TMPDIR_ORIG"
}

# Helper: create a mock build script in MOCK_LIBEXEC
mock_build() {
  local name="$1" exit_code="$2" output="${3:-}"
  cat > "$MOCK_LIBEXEC/$name" <<SCRIPT
#!/usr/bin/env bash
echo "$output"
exit $exit_code
SCRIPT
  chmod +x "$MOCK_LIBEXEC/$name"
}

# ── notify ────────────────────────────────────────────────────────────

@test "notify: requires title" {
  run "$REAL_LIBEXEC/notify"
  [[ $status -ne 0 ]]
  [[ "$output" == *"title required"* ]]
}

@test "notify: requires message" {
  run "$REAL_LIBEXEC/notify" "Title"
  [[ $status -ne 0 ]]
  [[ "$output" == *"message required"* ]]
}

@test "notify: skips silently without credentials" {
  unset PUSHOVER_USER_KEY PUSHOVER_APP_TOKEN
  run "$REAL_LIBEXEC/notify" "Test" "Body"
  [[ $status -eq 0 ]]
  [[ "$output" == *"skipping"* ]]
}

@test "notify: accepts --title and --message flags" {
  run "$REAL_LIBEXEC/notify" --title "T" --message "M"
  [[ $status -eq 0 ]]
  [[ "$output" == *"skipping"* ]]
}

@test "notify: accepts --stdin for message body" {
  run bash -c 'echo "piped body" | '"$REAL_LIBEXEC/notify"' --title "T" --stdin'
  [[ $status -eq 0 ]]
  [[ "$output" == *"skipping"* ]]
}

@test "notify: rejects unknown flags" {
  run "$REAL_LIBEXEC/notify" --bogus "T"
  [[ $status -ne 0 ]]
  [[ "$output" == *"unknown flag"* ]]
}

# ── monitor: target validation ────────────────────────────────────────

@test "monitor: rejects unknown target" {
  mock_build dash 0
  # Source the navel dispatcher inline with overridden LIBEXEC
  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor bogus
  '
  [[ $status -ne 0 ]]
  [[ "$output" == *"unknown monitor target"* ]]
}

# ── monitor: success path ────────────────────────────────────────────

@test "monitor: reports OK when build succeeds" {
  mock_build dash 0 "Docset built"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash
  '
  echo "$output"
  [[ $status -eq 0 ]]
  [[ "$output" == *"dash: OK"* ]]
  [[ "$output" == *"All builds OK"* ]]
}

@test "monitor: creates log file on success" {
  mock_build pdf 0 "PDF done"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor pdf
  '
  [[ -f "$NAVEL_HOME/logs/monitor.log" ]]
  grep -q "pdf: OK" "$NAVEL_HOME/logs/monitor.log"
}

# ── monitor: failure path ────────────────────────────────────────────

@test "monitor: detects build failure and returns non-zero" {
  mock_build dash 1 "error: node_modules missing"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash
  '
  echo "$output"
  [[ $status -ne 0 ]]
  [[ "$output" == *"dash: FAILED"* ]]
  [[ "$output" == *"1 build(s) failed: dash"* ]]
}

@test "monitor: logs failure output" {
  mock_build pdf 1 "error: typst not found"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor pdf
  '
  [[ -f "$NAVEL_HOME/logs/monitor.log" ]]
  grep -q "pdf: FAILED" "$NAVEL_HOME/logs/monitor.log"
  grep -q "typst not found" "$NAVEL_HOME/logs/monitor.log"
}

@test "monitor: calls notify on failure" {
  mock_build dash 1 "render failed"

  # Replace notify with a spy
  cat > "$MOCK_LIBEXEC/notify" <<'SPY'
#!/usr/bin/env bash
echo "$1" > "$NAVEL_HOME/logs/notify-title.txt"
echo "$2" > "$NAVEL_HOME/logs/notify-body.txt"
SPY
  chmod +x "$MOCK_LIBEXEC/notify"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash
  '
  [[ -f "$NAVEL_HOME/logs/notify-title.txt" ]]
  grep -q "dash build failed" "$NAVEL_HOME/logs/notify-title.txt"
  grep -q "render failed" "$NAVEL_HOME/logs/notify-body.txt"
}

# ── monitor: multiple targets ────────────────────────────────────────

@test "monitor: runs multiple targets" {
  mock_build dash 0 "Docset built"
  mock_build pdf 0 "PDF done"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash pdf
  '
  echo "$output"
  [[ $status -eq 0 ]]
  [[ "$output" == *"dash: OK"* ]]
  [[ "$output" == *"pdf: OK"* ]]
}

@test "monitor: mixed pass/fail reports correct count" {
  mock_build dash 0 "OK"
  mock_build pdf 1 "compile error"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash pdf
  '
  echo "$output"
  [[ $status -ne 0 ]]
  [[ "$output" == *"dash: OK"* ]]
  [[ "$output" == *"pdf: FAILED"* ]]
  [[ "$output" == *"1 build(s) failed: pdf"* ]]
}

@test "monitor: plural title when multiple builds fail" {
  mock_build dash 1 "dash error"
  mock_build pdf 1 "pdf error"

  cat > "$MOCK_LIBEXEC/notify" <<'SPY'
#!/usr/bin/env bash
echo "$1" > "$NAVEL_HOME/logs/notify-title.txt"
SPY
  chmod +x "$MOCK_LIBEXEC/notify"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor dash pdf
  '
  echo "$output"
  [[ $status -ne 0 ]]
  grep -q "2 build(s) failed" "$NAVEL_HOME/logs/notify-title.txt"
}

# ── monitor: auto-detect ────────────────────────────────────────────

@test "monitor: skips when no docs exist" {
  rm -rf "$NAVEL_HOME/docs"

  run bash -c '
    export NAVEL_HOME='"$NAVEL_HOME"'
    export LIBEXEC='"$MOCK_LIBEXEC"'
    source '"$REPO_ROOT"'/libexec/_portable.sh
    DOCS_DIR="$NAVEL_HOME/docs"
    die() { echo "error: $*" >&2; exit 1; }
    _require() { true; }
    '"$(sed -n '/^cmd_monitor/,/^}/p' "$REPO_ROOT/bin/navel")"'
    cmd_monitor
  '
  [[ $status -eq 0 ]]
  [[ "$output" == *"No docs found"* ]]
}
