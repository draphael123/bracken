# claude/batch82-integ (Sonnet) - BATCH82 integ round 1

Base claude/batch82 288bfe3e. Worktree bracken-batch82-integ, port 8804. Commits on claude/batch82-integ (4b64a1e4 at report time).

## 1. Ksar elites + checkpoints - a TOOL GAP, not a route bug
- The Ksar's route is a chain of verbs the reach fill has none for: the gate winch portcullis (col 257), keg-blasted arches (store, tower, powder run A/B, trail wall, alley), reeds a torch burns, the raised rope bridge a torch drops. All are solid cells in the built grid, so the fill stops at col 256. tools/ksar-route.mjs (real keys, every hero) walks the whole road with the verbs.
- Proved: with those cells opened the way src/ksar-hands.js opens them, checkpoint-stand stands at every Ksar checkpoint (702 and 808 included) and the champion @683 is reached.
- New tools/ksar-locks.mjs `ksarOpened(L)` (opens barricades, reeds, the gate column, the rope column + ONEWAY span; the grille stays bars). Used by tools/elites.mjs (solvedRule) and tools/checkpoint-stand.mjs. The four stale Ksar MODEL_GAPS rows (276/392/489/581) are removed - the list shrank, nothing forgiven.
- The champion now HOLDS A GATE: src/ksar.js bridgeElite `gate: 693` (10 tiles from him, 2 before the trail bars). Cols 689-692 were rejected by elites.mjs (gate rows 31-33 can be hopped round); 693 holds. elites: 75 elites, ok. level changed -> ksar pilot, curve, mash (level, then boss) re-stamped.

## 2. Kraken (causeway row), campaign L22, kit flasks, profile human, practiced
- hp 670 (as merged): knight 12/12, warden 10/12, pyro 11/11 (+1 harness ERR, page-server collision) = 94% HIGH (+34).
- Dry (human+dry, 6 seeds/hero): knight 2/6, warden 1/6, pyro 6/6 = 50% (in band; hp believed 670).
- Mash (tools/mash-bot.mjs causeway --arena-only): 0/6, dead in 53-67 s.
- hp-only retune tried, hp is not the lever: 880 -> 97%; 1150 -> 94% (wins take ~175 s); 1500 -> 72% but only because fights hit the 240 s timeout (3 of 18) and last 150-230 s. Reverted to 670 (no change to main.js, boss row untouched).
- Reading: with-flasks 94% vs dry 50% - the kit's flasks (flasks2) carry the fight, same as likely for other bosses. Retune needs damage/pressure, not hp.

## 3. Buried City credit
'JaggedStone (Aron Elal)' in audio.js (TRACKS comment + MUSIC_CREDITS), credits.js (CC_BY row + 'by' line), boss-music.js comment, audio/CREDITS.txt (lines 71, 282, 283). The composer NAMES page keeps 'JaggedStone' (ALIAS in composers(): the long form truncated in a column). textfit credits: 0 truncated; audio-assets, buried-city, soundtest green.

## 4. Merge lane reds, checked alone
signs ok, survival ok (all spans told), mash-gate ok (46), curve-gate ok except below, level-quality: only MINECART miss (below). Stale rows moor/caravan/ksar/minecart re-measured (curve), ksar pilot + mash.

## 5. Title hero row, seven heroes
tools/titlescene.mjs gained section 2b: DEFAULT_HEROES widened to all seven in the page; every pick index 0-6 draws on screen, all names present and none overlapping, heading clear, RIGHT walks 1..6,0, seven tap boxes, confirm on 3/5/6 takes pyro/pirate/reaper. Green (existing assertions untouched).

## 6. mark-integrity phantom pose
Cause: undeadFrame mapped markTell -> F.death, the same frame as boneWait / orbitWait / markWait; when the windup followed one of those the "mode before" rendered identically. markTell now draws F.storm (the lightning mark; stormTell/orbit/script/pull are all marked so they are never a "prior" mode). poisonTell (1 sighting, F.poison) is NOT explained by the table - no unmarked mode maps to F.poison; MI_ONLY=undeadmage alone is green on both. Left documented, flaky under load.

## Assertion changes
None weakened. Added: titlescene 7-hero section. Removed: four Ksar MODEL_GAPS rows (stricter).

## STILL RED / for coordinator
- level-quality curve: MINECART (act 1 'THE GREENWOOD' band 40-250%, <=3 deaths): bot measured 223% / 4 deaths, re-run 271% / 3 deaths - borderline both ways, a different row each time. The row was MISSING on batch81 too. Not retuned (a level-design call).

## QUESTIONS FOR DANIEL
1. Kraken is 94% with flasks (50% dry). hp does not move it. Rec: leave hp, tune the kit (fewer flasks at causeway depth) or arm damage in a kraken lane - or accept, since flasks2 lifts every boss.
2. Minecart's act-1 curve band: relax the band for a ride level, or soften its hazards? Rec: soften one hazard.
3. Ksar champion gate at 693 crosses the powder trail's last third (fire still runs; logic is not tile-gated) - fine?
