export PATH="/c/Program Files/nodejs:$PATH"
cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-bztune"
export PORT=8856
for t in riposte ability-poses dances mark-integrity; do echo "=== $t"; node tools/$t.mjs 2>&1 | tail -5 | cut -c1-240; done
echo "=== pixels"; node tools/headless.mjs floats 2>&1 | tail -4 | cut -c1-240
echo "=== mash"; node tools/mash-bot.mjs stockade,underleaf --heroes=berserker --seeds=3 2>&1 | tail -12 | cut -c1-200
echo "=== rates"; node tools/boss-rates.mjs stockade,underleaf,reef,hanging,mage,ksar --heroes=berserker --ways=practiced --seeds=12 --profile=human --flasks=kit --jobs=3 --out=work/claude/bztune/rates8.json 2>&1 | tail -9 | cut -c1-120
echo ALLDONE
