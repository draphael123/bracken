cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-flotilla2tune"
export PATH="/c/Program Files/nodejs:$PATH" PORT=6896
echo "== pilot"; node tools/level1-pilot.mjs flotilla --write 2>&1 | tail -5
echo "== curve"; node tools/level1-pilot.mjs flotilla --curve 2>&1 | tail -5
echo "== mash level"; node tools/mash-bot.mjs --level flotilla --write 2>&1 | tail -8
echo "== mash boss"; node tools/mash-bot.mjs flotilla --write 2>&1 | tail -8
echo "== level-quality"; node tools/level-quality.mjs flotilla 2>&1 | tail -6 | cut -c1-240
echo STAMPDONE
