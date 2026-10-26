#!/bin/bash
export PATH="/c/Program Files/nodejs:$PATH"; cd "$(dirname "$0")/../.."
for t in underleaf underleafart hanging-pilots; do echo "== $t"; node tools/$t.mjs 2>&1 | grep -E "FAIL|all green|: ok|passed|checks" | tail -4 | cut -c1-200; echo "exit ${PIPESTATUS[0]}"; done
