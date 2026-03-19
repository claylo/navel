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
