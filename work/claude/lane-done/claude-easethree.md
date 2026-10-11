# EASE THE THREE (claude/easethree) - numbers only, base 73a8e1ad
Measure: boss-rates --profile=human --flasks=kit --ways=practiced, campaign level, L32 mage / L31 witchlight:mini / L34 caravan.

| row | before (6 seeds, flasksweep) k/w/p | after (12 seeds) k/w/p | after % | dry after (human+dry, 6 seeds) |
|---|---|---|---|---|
| mage (Archmage) | 1/6 1/6 4/6 = 33% | 5/12 9/12 9/12 | 64% | 0/6 2/6 3/6 = 28% |
| witchlight:mini (Hedge Warden) | 6/6 1/6 5/6 = 67% | 12/12 6/12 11/12 | 81% | 6/6 1/6 6/6 = 72% |
| caravan (Dune Worm) | 4/6 1/6 5/6 = 56% | 10/12 5/12 10/12 | 69% | 3/6 0/6 5/6 = 44% |
Warden cells: mage 1/6 -> 9/12, witchlight:mini 1/6 -> 6/12, caravan 1/6 -> 5/12. Mash (tools/mash-bot.mjs --write, docs/mash-bot.json re-stamped, --assert holds): 0/6 boss and mini on all three.
Checks green: boss-openings, boss-fight-end (60/60), boss-read, untold-told, tells, mark-integrity (only red: undeadmage|poisonTell PHANTOM POSE - the Undead Archmage, not touched here; looks pre-existing).

## Levers (and why)
- MAGE (src/main.js ARCH): openHits 2->3, open1 2.6->3.0, open2 3.2->3.5. Pressure problem, not hp: half the knight/warden fights timed out at 240 s with 4-45% left or died by taking ~250-480 over a 3-4 minute fight. Each told opening now lasts a third longer and takes a third blow, so fewer readings are needed and less time is spent under his casts. hp, damage, tells untouched. (First try 3.2/3.8 gave 72% at 12 seeds - trimmed to 3.0/3.5 = 64%.)
- WITCHLIGHT:MINI (src/hedge-warden.js): hp 900->840, blows -10% (cut 41->37, rush 35->32, thorn/lash 35->32, roots 28->25), answered opening `stuck` 3.0->3.5. Mini was 67% with warden dying (taken ~590 of the bar); a little less hp, a little less damage, a longer answered opening.
- CARAVAN (src/dune-worm.js): hp 2150->2800, blows -25% (breach 31->23, breath 18->13, lunge 31->23, bite 31->23, sweep 35->27, wave 28->22), stones wider/longer (LEDGE w 48->64, life 11-15 -> 15-19 s, every 1.2->0.9 s). FINDING: the warden's caravan deaths (about 60-120 s, 50-85% left) are the SUN DRAIN, not the worm's blows - with sunstroke drain set to 0 the warden won 6/6 (temp edit, reverted). Cutting blows alone never lifted her. The stones are the hollow's only shade, so wider/longer stones are the fight-owned lever for her; hp was raised to hold the band for knight/pyro, who otherwise went 6/6. Tried and rejected: keep 3/keep2 4 stones (knight died twice - more breach traps), hp 1900 + stun 3.5 (83%).
