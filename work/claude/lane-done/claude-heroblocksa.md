# claude/heroblocksa - HERO BLOCKS A (Freebooter HOOK CATCH + Blood Knight BLOCK)
Branch claude/heroblocksa off master 416af6c2 (BATCH133). Not merged, not deployed. Pyromancer and src/skill-k.js untouched.

## Built (per rec)
FREEBOOTER (src/hook-catch.js new; main.js pirate block, damagePlayer0 pirate branch, firePistol, heavyWind)
- TAP C = HOOK CATCH, raised on the PRESS: ~0.4 s snap (not holdable), 0.85 s to the next. HOLD C past 0.2 s is still the hook throw (a hold converts the snap to the throw).
- First 0.2 s = PERFECT catch: blocks any yellow blow, SNAGS the weapon (foe staggered 1.0 s, boss 0.45 s, hook line drawn, shared riposte window), seats the ball, +14 wind, +3 plunder, and the NEXT pistol shot (3 s) is instant (wind 0.04) and x1.5 when the mark is within 56 px (POINT BLANK).
- A thrown thing (arrow, spit, stone, bolt) in the perfect half is caught and FLUNG BACK at its thrower (same rewards); in the late half it is caught and dropped (8 wind).
- Late half (0.2-0.4 s): plain catch at a block's wind price with the shared block feel row; a HEAVY blow (raw >= 26) BREAKS THROUGH: half lands, shoved 1.9x, BROKE THROUGH. No wind left = half lands. Red blows never caught; piercing only on the beat.
- Pose: his existing block frames; a gold arc/grapnel drawn across his front. New SFX hookSnap/hookCatch.
- Controls/help text updated: controls card ("TAP C CATCH, HOLD HOOK"), hero card, trial lines in level.js, riposte look, wood sign (keeps the word PARRY), tools/skill-icons.mjs assert.
BLOOD KNIGHT (src/blood-kit.js GUARD + hooks; parry/spike machinery untouched)
- Blood-paid guard: all blood a held blow costs lies on the bar as DEBT (share 1.0 vs 0.6 for a normal hit; winnable back), '-N DEBT' number, the HP bar flashes.
- THE BLADE DRINKS: each held blow = a notch (3 max, 12 s life, drawn as three blood ticks up the steel); 3 = the next held heavy comes one tier higher (never past T5), spent on it.
- CRIMSON PARRY: the ward-release parry now also bleeds the thrower (3 s) and says CRIMSON PARRY (THROWN BACK kept: tools assert it). Spike already bled. Hit-stop/slow-mo/reclaim-all were already there.
- Block weight: freeze 0.06-0.10 s by ward fill (+0.03 heavy), a 'hurt'-tagged shake (visible on the default ON HIT setting), red spark spray + blood kicked off, wet heavy clang (SFX.bkGuard), armour glow pulsing with debt.
- Plain dodge rec = moot (per 22:02).

## Tests
- tools/heroblocksa.mjs (new): pure + page, GREEN. tools/blood-kit.mjs green, skill-icons.mjs green, flip-actions.mjs green, riposte.mjs: teach + all-heroes rows pass (pirate: tap parries, red = TOO STRONG); the elite section ran past my 280 s cap, not rerun to the end.
- node --check on all touched files. tools/check.mjs NOT run.
## Screens (contact strips, 3 frames apart)
scratch\lane-reports\heroblocksa-shots\ (copy in work/heroblocksa-shots/): hb-catch-perfect-snag, hb-catch-arrow-flung-back, hb-catch-late-heavy-breaks-through, hb-bk-ward-three-blows, hb-bk-ward-notched-full, hb-bk-crimson-parry. No video clip made. Tool: tools/heroblocksa-shots.mjs.
## Boss rates (wood L3, rookery L14; human profile w/ flasks, practiced, 4 seeds, branch vs master)
pirate wood 3/4 vs 3/4; rookery 3/4 vs 3/4. reaper wood 2/4 vs 4/4; rookery 4/4 vs 3/4. Total 12/16 vs 13/16. Within n=4 noise; the bots never use the catch/ward (guard 0/0/0), so this only shows nothing else moved. Real bot impact of the catch is unmeasured.
## Runs still needed
Human playtest of the catch timing (perfect half 0.2 s, snap 0.4 s); riposte.mjs full; a bot that actually catches (bots tap C by old timing); impact-matrix block row for both heroes; Pyro lane merge: both use tap/hold C - no code overlap (pirate-only), controls card line only.
## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Heavy rule: I let a PERFECT catch turn even heavies (as the old parry did, keeps boss rates) and only the late catch breaks through at raw >= 26. Alt: heavies break through always. Built: rec.
2. 'Chip goes to debt not HP': built as share-1.0 debt (hp drops, all of it winnable back). Alt: guard costs no HP at all until debt drains. Built: rec.
3. Perfect window 0.2 s from press (was 0.2 s from release): the snap is now more forgiving overall but the perfect part starts at the press.
4. Notch life 12 s - ok?
