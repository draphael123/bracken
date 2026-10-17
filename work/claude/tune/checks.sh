cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-flotilla2tune"
export PATH="/c/Program Files/nodejs:$PATH" PORT=6896
for t in floaters solid-islands killzones traps deadends collectables keys spawns elites checkpoint-gaps checkpoint-stand checkpoint-thin checkpoints stuck tells boss-greed boss-read admirals-champion; do echo "== $t"; node tools/$t.mjs 2>&1 | tail -6 | cut -c1-260; echo "exit ${PIPESTATUS[0]}"; done
echo "== reach-heroes"; node tools/reach-heroes.mjs 2>&1 | tail -12 | cut -c1-260; echo "exit ${PIPESTATUS[0]}"
echo "== level-quality"; node tools/level-quality.mjs flotilla 2>&1 | tail -6 | cut -c1-260; echo "exit ${PIPESTATUS[0]}"
echo ALLDONE
