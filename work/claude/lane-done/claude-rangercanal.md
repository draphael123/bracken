# claude/rangercanal - why the Ranger lost the canal (sonnet, 2026-10-14)
Base claude/herocolors c86433f1 (Ranger hp 110 / dmg 16). Port 8920, boss-rates human profile, kit flasks, practiced, --jobs=1. Boss numbers untouched.

## The cause (traced with tools/ranger-canal-trace.mjs: per-frame x/y/mode/hp, hits by mode)
1. **Not a hazard / flying-boss / arena problem and not the restock hand.** She stood on the raft every time; every death is two big blows (gulp/snap/hunt 95-150, swell 84-95 of a 234 bar), the lantern branch of the bot never restocks/picks up, no arrows were lost to water.
2. **The flask threshold (the real gap).** The human bot drinks under 35% of the bar. The gulp takes 150: the Ranger (bar 234) is left on 84 = 35.9% -> does NOT drink, the next swell/snap (84-95) kills her with 3 flasks unused. The knight (bar 224) is left on 74 = 33% -> drinks. Six of her 24 fights ended before 30 s that way (knight: 0).
3. **The "12/12 knight" column is stale.** On this base the knight is 8/24 (6/12) on the canal.
4. Two real, smaller Ranger defects (fixed, measured nil on their own: 7/24 vs 6/24):
   - KIT: the Lantern-Eater read an arrow's angle off her POSTURE WHEN IT LANDS, not how it was loosed. UP+X (the rising shot, her HIGH key on the lure) lands a beat later with her back on her feet -> read MID -> clanked. Now the blow's tag decides: 'rise' and 'plunge' arrows are HIGH (src/lantern-eater.js blowAngle(P, blow), src/lantern-eater-hands.js take, same one-liner in src/fog-knight-hands.js). tools/lantern-eater.mjs now proves it (fails without the fix: angle mid, clank).
   - BOT: the lab planned her phase-2 gum sweep from her bow's stand-off (64 px) - 58 px from the rail, out of her own 28 px sweep. src/lab.js LE_RG_REACH = 28 for the Lantern-Eater branch.
5. Misc: seeds 1/3/11 (and others) replay identically (same dice), so 12 seeds are ~8 distinct fights; trust the 24-seed numbers.

## The fix (bot hand, src/lab.js + src/bot-profile.js)
`botShouldDrinkBig`: besides drinkAt (35%), once a single blow has taken `drinkBig` (0.4) of the bar, the human drinks whenever the bar <= 1.1 x the biggest blow so far (the next one would kill). Profile field `drinkBig: 0.4` on `human`; set 0 to turn off. Only triggers on bosses whose blows are >= 40% of the bar.

## Canal L26, practiced, human, kit flasks (wins)
| | knight | ranger |
|---|---|---|
| before, 12 seeds | 6/12 | 3/12 |
| before, 24 seeds | 8/24 | 6/24 (6 deaths < 30 s) |
| kit + reach fix only, 24 | - | 7/24 |
| after all, 12 seeds | 9/12 | 7/12 |
| after all, 24 seeds | 13/24 (54%) | 15/24 (62%), 0 deaths < 30 s |
Canal overall now 58% (band 60-70, LOW -2). Mean fight 74 s knight / 80 s ranger.

## Checks (green)
tools/ranger.mjs OK, tools/boss-openings.mjs exit 0, tools/lantern-eater.mjs ok (+ new ranger rise-shot assert), tools/towpath.mjs 169 ok (fog knight), tools/lab-reach.mjs, tools/lab-order.mjs, tools/survival.mjs. New tool: tools/ranger-canal-trace.mjs (T0/T1 env dumps frames).

## QUESTIONS FOR DANIEL
1. `drinkBig` is on the shared `human` profile, so it also changes every other boss whose single blow is >= 40% of the bar (their rates may rise a little). REC keep (a person at 36% after a 64% blow drinks); BUILT on. Say if you want it ranger/canal-only or off (drinkBig: 0 in src/bot-profile.js).
2. The Fog Knight's hands got the same 'rise' = HIGH tag read (a Ranger rising shot). REC keep; BUILT.
3. A denied command: I tried to kill my own still-running boss-rates run (taskkill of my PID) and it was denied; I let it finish instead.
