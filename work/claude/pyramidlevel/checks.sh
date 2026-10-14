#!/bin/bash
# claude/pyramidlevel page checks, one browser at a time
export PATH="/c/Program Files/nodejs:$PATH"; export PORT=8894
cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-pyramidlevel"
run() { echo "== $*"; timeout 2400 node "$@" 2>&1 | tail -6 | cut -c1-400; }
run tools/sealed-pyramid-stuck.mjs
run tools/corpses.mjs
run tools/textfit.mjs --strict
run tools/boss-openings.mjs
run tools/boss-fight-end.mjs
MI_ONLY=scarabmother run tools/mark-integrity.mjs
run tools/untold-told.mjs
echo ALLDONE
