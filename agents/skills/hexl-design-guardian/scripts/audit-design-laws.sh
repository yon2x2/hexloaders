#!/usr/bin/env bash
# HEXLOADERS design-law audit. Run from repo root. Exit 1 if any findings.
# Usage: bash agents/skills/hexl-design-guardian/scripts/audit-design-laws.sh
set -u
FAIL=0

run_grep() { # $1 = pattern (ERE), $2 = extra exclusion filter (ERE or empty)
  if [ -n "$2" ]; then
    grep -rEn --exclude-dir=ui --exclude-dir=node_modules --exclude-dir=dist \
      --include='*.ts' --include='*.tsx' --include='*.css' "$1" src 2>/dev/null \
      | grep -viE "$2" || true
  else
    grep -rEn --exclude-dir=ui --exclude-dir=node_modules --exclude-dir=dist \
      --include='*.ts' --include='*.tsx' --include='*.css' "$1" src 2>/dev/null || true
  fi
}

check() { # $1 = label, $2 = pattern, $3 = exclusion filter (or "")
  local hits
  hits=$(run_grep "$2" "$3")
  if [ -n "$hits" ]; then
    FAIL=1
    echo "── LAW VIOLATION: $1"
    echo "$hits" | head -15
    echo ""
  fi
}

check "gray/non-BW hex colors" '#[0-9a-fA-F]{6}' '#000000|#ffffff'
check "organic easing (incl. bare ease, camelCase)" 'ease-in-out|cubic-bezier|ease-out|ease-in|\bease\b' 'steps\(|ease-step|//|/\*|release|increase|decrease'
check "box-shadow (css + camelCase)" 'box-shadow|boxShadow|shadow-(sm|md|lg|xl|2xl)' ''
check "border-radius != 0" 'rounded-(sm|md|lg|xl|full)|border-radius:\s*[1-9]|borderRadius' 'borderRadius:\s*0|borderRadius: \{'
check "blur / gradient" 'blur\(|bg-gradient|linear-gradient|radial-gradient' 'graph-grid'
check "non-120ms-multiple durations" '\b(100|150|200|250|300|350|500|700|1000)ms' '120|240|360|480|600|840|1200|2400|//|/\*'

if [ "$FAIL" -eq 0 ]; then echo "✓ design laws clean"; else echo "✗ violations found — see SKILL.md fix table"; fi
exit $FAIL
