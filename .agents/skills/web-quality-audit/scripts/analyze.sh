#!/usr/bin/env bash
# Read-only HTML quality analyzer (v2). Only private temporary discovery state.
# stderr = human logs, stdout = structured JSON.
set -euo pipefail

MAX_FINDINGS=100
MAX_PER_CATEGORY_PER_FILE=20  # cap per high-volume check per file so one category can't fill MAX_FINDINGS

fail() {
  local type="$1" msg="$2" suggestion="$3"
  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg type "$type" \
      --arg msg "$msg" \
      --arg suggestion "$suggestion" \
      '{success: false, error: {type: $type, message: $msg, retryable: false, suggestion: $suggestion}}'
  else
    printf '{"success":false,"error":{"type":"%s","message":"%s","suggestion":"%s","retryable":false}}\n' \
      "$type" "$msg" "$suggestion"
  fi
  exit 1
}

command -v jq >/dev/null 2>&1 || \
  fail "missing_dependency" "jq is required for safe JSON output" "Install: brew install jq"

[ $# -ge 1 ] || fail "invalid_input" "No target provided" "Usage: $0 <file_or_directory>"
TARGET="$1"
[ -e "$TARGET" ] || fail "invalid_input" "Target not found: $TARGET" "Pass an existing file or directory path"

ISSUES=()
WARNINGS=()

has_html() {
  local status=0
  grep -qi -- "$1" "$2" || status=$?
  if [ "$status" -gt 1 ]; then
    fail "incomplete_scan" "HTML file could not be inspected" "Resolve file read errors and rerun"
  fi
  return "$status"
}

analyze_html() {
  local file="$1"
  echo "Analyzing: $file" >&2

  has_html "<!doctype html>" "$file" || ISSUES+=("$file:0: Missing HTML5 doctype")
  has_html 'charset.*utf-8' "$file" || WARNINGS+=("$file:0: Missing or non-UTF-8 charset")
  has_html 'name="viewport"' "$file" || ISSUES+=("$file:0: Missing viewport meta tag")
  has_html '<html[^>]*lang=' "$file" || ISSUES+=("$file:0: Missing lang attribute on <html>")
  has_html '<title>' "$file" || ISSUES+=("$file:0: Missing <title> tag")

  # <img> without alt — two-pass replaces broken PCRE lookahead
  local alt_count=0 tags='' status=0
  tags=$(grep -noE '<img[^>]*>' "$file") || status=$?
  [ "$status" -le 1 ] || fail "incomplete_scan" "Image-tag inspection failed" "Resolve file read errors and rerun"
  while IFS=: read -r ln tag; do
    [ -n "$ln" ] || continue
    if grep -qE 'alt=' <<<"$tag"; then continue; fi
    if [ "$alt_count" -ge "$MAX_PER_CATEGORY_PER_FILE" ]; then
      WARNINGS+=("$file:0: <img>-without-alt findings truncated (>${MAX_PER_CATEGORY_PER_FILE} in this file)")
      break
    fi
    WARNINGS+=("$file:$ln: <img> without alt attribute")
    alt_count=$((alt_count + 1))
  done <<<"$tags"

  # Non-HTTPS URLs with line numbers
  local http_count=0 urls=''
  status=0
  urls=$(grep -noE 'http://[^"'\''[:space:]>]*' "$file") || status=$?
  [ "$status" -le 1 ] || fail "incomplete_scan" "URL inspection failed" "Resolve file read errors and rerun"
  while IFS=: read -r ln _; do
    [ -n "$ln" ] || continue
    if [ "$http_count" -ge "$MAX_PER_CATEGORY_PER_FILE" ]; then
      WARNINGS+=("$file:0: Non-HTTPS URL findings truncated (>${MAX_PER_CATEGORY_PER_FILE} in this file)")
      break
    fi
    WARNINGS+=("$file:$ln: Non-HTTPS URL")
    http_count=$((http_count + 1))
  done <<<"$urls"
}

# A checked manifest preserves discovery failures and keeps arrays in this shell.
if [ -d "$TARGET" ]; then
  discovered=$(mktemp)
  trap 'rm -f -- "$discovered"' EXIT
  find "$TARGET" -type f \( -name "*.html" -o -name "*.htm" \) -print0 >"$discovered" || \
    fail "incomplete_scan" "HTML file discovery failed" "Resolve traversal errors and rerun"
  while IFS= read -r -d '' file; do
    analyze_html "$file"
  done <"$discovered"
elif [ -f "$TARGET" ]; then
  analyze_html "$TARGET"
else
  fail "invalid_input" "Target is not a regular file or directory: $TARGET" "Pass a path to an .html/.htm file or a directory"
fi

issue_total=${#ISSUES[@]}
warning_total=${#WARNINGS[@]}

to_json_array() {
  printf '%s\0' "$@" | jq -Rs 'split("\u0000") | map(select(length > 0))'
}

if [ "$issue_total" -gt 0 ]; then
  issues_json=$(to_json_array "${ISSUES[@]:0:$MAX_FINDINGS}")
else
  issues_json='[]'
fi

if [ "$warning_total" -gt 0 ]; then
  warnings_json=$(to_json_array "${WARNINGS[@]:0:$MAX_FINDINGS}")
else
  warnings_json='[]'
fi

echo "Scanned. $issue_total issues, $warning_total warnings." >&2

jq -n \
  --argjson issues "$issues_json" \
  --argjson warnings "$warnings_json" \
  --argjson issue_total "$issue_total" \
  --argjson warning_total "$warning_total" \
  --argjson max "$MAX_FINDINGS" \
  '{
    success: true,
    issues: $issues,
    warnings: $warnings,
    issueCount: $issue_total,
    warningCount: $warning_total,
    truncated: (($issue_total > $max) or ($warning_total > $max))
  }'
