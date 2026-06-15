#!/usr/bin/env bash
# Validate a shadcn registry is reachable and returns valid JSON.
# Usage: validate-registry.sh <registryBaseUrl> [component-name]
# Example: validate-registry.sh https://ogimagecn.vercel.app/r og-image

set -euo pipefail

BASE_URL="${1:-}"
COMPONENT="${2:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: validate-registry.sh <registryBaseUrl> [component-name]"
  echo "Example: validate-registry.sh https://ogimagecn.vercel.app/r og-image"
  exit 1
fi

# Strip trailing slash
BASE_URL="${BASE_URL%/}"

REGISTRY_URL="${BASE_URL}/registry.json"
PASS=0
FAIL=0
WARN=0

ok()   { echo "✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "⚠ $1"; WARN=$((WARN + 1)); }

echo "Validating registry at: $BASE_URL"
echo "---"

# Check registry.json
HTTP_CODE=$(curl -sSL -o /tmp/registry-index.json -w "%{http_code}" "$REGISTRY_URL" || echo "000")

if [[ "$HTTP_CODE" == "200" ]]; then
  ok "registry.json reachable (HTTP 200)"
else
  fail "registry.json returned HTTP $HTTP_CODE at $REGISTRY_URL"
fi

# Validate JSON
if [[ -f /tmp/registry-index.json ]]; then
  if python3 -c "import json; json.load(open('/tmp/registry-index.json'))" 2>/dev/null; then
    ok "registry.json is valid JSON"
  else
    FIRST_CHARS=$(head -c 80 /tmp/registry-index.json | tr -d '\n')
    if echo "$FIRST_CHARS" | grep -qi '<html'; then
      fail "registry.json returned HTML, not JSON"
    else
      fail "registry.json is not valid JSON"
    fi
  fi
fi

# Check for items/components in index
if [[ -f /tmp/registry-index.json ]] && python3 -c "import json; json.load(open('/tmp/registry-index.json'))" 2>/dev/null; then
  ITEM_COUNT=$(python3 -c "
import json
data = json.load(open('/tmp/registry-index.json'))
items = data.get('items') or data.get('components') or []
if isinstance(items, list):
    print(len(items))
elif isinstance(data, list):
    print(len(data))
else:
    print(0)
" 2>/dev/null || echo "0")

  if [[ "$ITEM_COUNT" -gt 0 ]]; then
    ok "registry index lists $ITEM_COUNT item(s)"
  else
    warn "registry index has no items/components array — may still be valid"
  fi
fi

# Check sample component
if [[ -n "$COMPONENT" ]]; then
  COMPONENT_URL="${BASE_URL}/${COMPONENT}.json"
  COMP_CODE=$(curl -sSL -o /tmp/registry-component.json -w "%{http_code}" "$COMPONENT_URL" || echo "000")

  if [[ "$COMP_CODE" == "200" ]]; then
    ok "component $COMPONENT.json reachable (HTTP 200)"
    if python3 -c "import json; json.load(open('/tmp/registry-component.json'))" 2>/dev/null; then
      ok "component $COMPONENT.json is valid JSON"
    else
      fail "component $COMPONENT.json is not valid JSON"
    fi
  else
    fail "component $COMPONENT.json returned HTTP $COMP_CODE at $COMPONENT_URL"
  fi
else
  warn "no sample component provided — pass a component name as second argument"
fi

# Check homepage (derive from base if /r path)
HOMEPAGE="${BASE_URL%/r}"
if [[ "$HOMEPAGE" != "$BASE_URL" ]]; then
  HOME_CODE=$(curl -sSL -o /dev/null -w "%{http_code}" "$HOMEPAGE" || echo "000")
  if [[ "$HOME_CODE" == "200" ]]; then
    ok "homepage reachable at $HOMEPAGE"
  else
    warn "homepage returned HTTP $HOME_CODE at $HOMEPAGE"
  fi
fi

echo "---"
echo "Results: $PASS passed, $WARN warnings, $FAIL failed"

if [[ "$FAIL" -gt 0 ]]; then
  echo "Preflight FAILED — fix blockers before submitting to directories."
  exit 1
fi

echo "Preflight PASSED"
exit 0
