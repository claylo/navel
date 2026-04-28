# Portable wrappers for macOS / Linux differences.
# Source this file: . "$(dirname "$0")/_portable.sh"
# Caches uname result so it's called once per script.

_UNAME_S="${_UNAME_S:-$(uname -s)}"

# File modification time as "YYYY-MM-DD HH:MM"
_stat_mtime() {
  case "$_UNAME_S" in
    Darwin) stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$1" ;;
    *)      stat -c '%y' "$1" | cut -c1-16 ;;
  esac
}

# Reports output directory
# CI writes to reports/ (committed). Local writes to local-reports/ (gitignored).
# Override with NAVEL_REPORTS_DIR for explicit control.
_reports_dir() {
  local repo_root="${1:-.}"
  if [[ -n "${NAVEL_REPORTS_DIR:-}" ]]; then
    echo "$NAVEL_REPORTS_DIR"
  elif [[ "${CI:-}" == "true" ]]; then
    echo "${repo_root}/reports"
  else
    echo "${repo_root}/local-reports"
  fi
}

# SHA-256 checksum (stdin or file args, output: hash  filename)
_sha256() {
  case "$_UNAME_S" in
    Darwin) shasum -a 256 "$@" ;;
    *)      sha256sum "$@" ;;
  esac
}

# Native binary cutover — versions >= this ship as platform binaries, not cli.js
BINARY_CUTOVER="2.1.113"

_is_binary_version() {
  [[ "$(printf '%s\n' "$BINARY_CUTOVER" "$1" | sort -V | head -1)" == "$BINARY_CUTOVER" ]]
}

_find_claude_binary() {
  local pkg_dir="$1"
  local platform_dir
  platform_dir=$(ls -d "$pkg_dir/node_modules/@anthropic-ai"/claude-code-* 2>/dev/null | head -1)
  [[ -n "$platform_dir" ]] && echo "$platform_dir/claude"
}

# Returns a file path suitable for scanning with rg/grep.
# For cli.js versions: returns cli.js directly.
# For binary versions: dumps strings -a to a temp file.
# Caller must clean up temp files (path won't end in .js).
_scannable_source() {
  local pkg_dir="$1"
  if [[ -f "$pkg_dir/cli.js" ]]; then
    echo "$pkg_dir/cli.js"
    return 0
  fi
  local binary
  binary=$(_find_claude_binary "$pkg_dir")
  if [[ -n "$binary" && -f "$binary" ]]; then
    local tmp
    tmp=$(mktemp)
    strings -a "$binary" > "$tmp" 2>/dev/null
    echo "$tmp"
    return 0
  fi
  return 1
}

# Like _scannable_source but caches strings -a output for binary versions.
# Args: pkg_dir cache_dir version
# For cli.js: returns cli.js directly (no cache needed).
# For binaries: returns cached strings file at cache_dir/version.txt.
_cached_scannable_source() {
  local pkg_dir="$1" cache_dir="$2" version="$3"
  if [[ -f "$pkg_dir/cli.js" ]]; then
    echo "$pkg_dir/cli.js"
    return 0
  fi
  local cache_file="${cache_dir}/${version}.txt"
  if [[ -f "$cache_file" ]]; then
    echo "$cache_file"
    return 0
  fi
  local binary
  binary=$(_find_claude_binary "$pkg_dir")
  if [[ -n "$binary" && -f "$binary" ]]; then
    mkdir -p "$cache_dir"
    strings -a "$binary" > "$cache_file" 2>/dev/null
    echo "$cache_file"
    return 0
  fi
  return 1
}
