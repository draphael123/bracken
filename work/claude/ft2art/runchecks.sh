export PATH="/c/Program Files/nodejs:$PATH"; cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-ft2art"; export PORT=8808
for t in "$@"; do s=$(date +%s); timeout 900 node tools/$t.mjs > work/claude/ft2art/chk-$t.log 2>&1; echo "$t exit=$? $(( $(date +%s)-s ))s"; done
