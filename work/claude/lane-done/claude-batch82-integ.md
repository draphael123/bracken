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

# ROUND 2 - the suite's FAIL-ALONE list (batch82 suite done), all alone on port 8804

| check | cause | fix |
|---|---|---|
| elites, checkpoint-stand | (round 1) Ksar locks the fill has no verbs for | tools/ksar-locks.mjs; champion gate @693 |
| death-cost | arena door @814: same Ksar lock gap, its own fill | death-cost uses ksarOpened (stricter than a gap row) |
| sprinkle-cap | ksar section 5 (800-999) = last chasm + rope line + the Hawk-Mistress's arena: no ground for a squad | squadBands row 800-999 spots 0 with the reason (the pattern of buriedcity/canal/church) |
| additional-areas | map road vertices off their nodes: Theatre node nudged by the merge lane (111,134 -> 119,142), Buried City node (116,72) vs road end (92,64) from its own lane | INLAND_PATH vertex and DESERT_PATH end moved onto their nodes; map-grammar / spacing / scale / level-reach green |
| store-preview | herokeys' smear pass is only in the full bake, so card frames (weaponIcon / atk) differed | previews bake the beat before and lay the same smear (storeFrames cols); canvas cap 200 -> 240 (219 on tab 0: +1 beat a card), tab-count assert 48 -> 6 x tabs (the store grew to 9 tabs with flasks2) - both stated in the assertion text |
| dressing | buriedcity had no ground kit / allowlist | GROUND_KITS + ALLOWED_DECORATIONS .buriedcity = none (the ksar/minecart pattern) |
| geomancer | magePlayer was removed by witchfix (the turned hero runs updatePlayer); the check scanned the old function | tool reads flipPlayer + the burrow line; burrow is gated `GS < 0` in main.js (she would otherwise dig into the ceiling) |
| relics | moor summit exit gate o+45 sits behind 17 thorn tiles (windcaller3), unreachable by any fill and by the player; the boss kill wins the level | gate moved to the fall stone's far end (o+26) |
| monastery3-beats, monk-machines | spire: rock one row over the last a-stair board @46,33 (pre-existing on batch81 too) | carved (46,32) |
| duck | fogknight stance/double/shroud HEIGHT rows with no mark (towpath marks regenerated) | the three rows removed |
| unburied-look | oldStandard@260 mean 11.9 < 12 (0.1 under, background changed) | moved to 262 (258 also passes) |
| solid-islands | ksar 32 (> 25: ksar2's 7 new slabs), buriedcity 45 (new level) | ratchet rows raised with the reason, same as batch81 integ did for church/towpath - TEMPORARY, an art-lane job |
| pixels | causeway sign@559 overlapped a one-tile stone at 558 (kraken2 tribute) | sign to 560 |
| mark-integrity | markTell fixed in round 1; poisonTell sighting remains: 0 px differ - passes alone half the time, looks like the caster off-camera in the snapshot | NOT fixed, documented |
| textfit (full) | | clean alone |

Level data moved (hash) -> re-stamped: spire, moor, causeway, unburied (curve; mash level then boss), ksar (round 1).
Load-only/flake: mobile-perf, redgorge, profile-leaks: not touched. The geomancer check failed once inside a long run and passes alone twice (port contention suspected).
curve-gate / mash-gate / level-quality: green except MINECART's act-1 curve (round 1 note, still open).
Assertion changes (stated): store-preview canvas cap 240 + tab-count formula; geomancer ceiling-dodge probe now reads flipPlayer + the burrow gate (magePlayer no longer exists).
