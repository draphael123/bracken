# claude/redcleanup - RED CLEANUP lane (10-26) - branch claude/redcleanup off master 72bb1c7b (BATCH122), worktree bracken-redcleanup, PORT 6607

Rule kept: fix at the cause, no test weakened, skipped or deleted. One commit per red (all pushed). Every tool run ALONE, one browser at a time.
Machine note: other lanes and a gate ran all afternoon; memguard KILLed headless Chromes at 13:47, 13:49 and 13:57 (scratch/memguard.log) - one of my runs lost its page that way and sat 301 s on Runtime.evaluate. Same shape as the "hangs" (Part 2).

## PART 1 - the reds
| tool | cause | fix | before -> after |
|---|---|---|---|
| berserker | TEST: the double-chop case held the attack with K.atk only; the tier wind (chargetiers) counts from a real PRESS, so the blow was a part-wind of 57.6 (floor 60); the brute also bit through the hold | case now BK.press('atk'), holds 36 frames inside T1, brute kept off the bite (as the tiers case p1). Floor stays 60 and reads 61.06 | FAIL 57.6 -> ok, green x2 (d15148e5) |
| dune-worm | TEST: "THE OPENING in the page" dealt 26 not 30 (x1.5 of 20). The game freezes a beat on a boss opening (the world did not tick for 4 frames after the stun), so src/anti-mash.js openTick had not yet seen the NEW opening; the blow counted as the 2nd landing of the hide case's opening (pay 0.85 -> 26) | the case steps frames until the opening is SEEN (stOpenWas) before the blow, as a hero must | FAIL dealt 26 -> ok dealt 30, green x2 |
| bells | REAL GAME BUG. THE UNDERCROWN works: the level's auto cart (ent cart 82,33 auto) rolls through the hall at load and updateCarts RUNS DOWN every foe on the rail - it killed the works WARDEN (sentry, 22 hp) about 0.5 s after every load, so the bell, the gate (col 85, rows 30-33) and the sign "THE WARDEN'S BELL SHUTS THE GALLERY" could never happen (rule line vs code) | one token in src/main.js updateCarts: the cart's run-down skips e.t === 'sentry' (the rest of the squad is still run down) | FAIL "undercrown works#0 bell never rung" -> ok (7 alarms), green x2 |
| rule-openings | two TEST pins on old numbers. (a) gargoyle: crash was only watched AFTER the 20-frame strike loop, but crashG 1500 drops him onto the spikes inside it. (b) POISE: bosses use the universal BREAK BAR (anti-mash.js, claude/difficulty 97206a12, 10-16: outside an opening a tap = 0 and a heavy = fill.heavy 26 x outside 0.6; inside an opening a cut = 3); the test pinned "heavy >= 30" and called hurtEnemy untagged (verb null -> 0) | (a) crash recorded inside the strike loop; (b) blows tagged (hurtAs light/heavy) and the expected numbers READ from AM.BREAK (heavy >= 15.6, cut >= 3); tap still exactly 0. The design change is cited in the file | FAIL gargoyle + POISE -> ok, green x2 |
| slopes-trace | three causes. wood + kings: level geometry rebuilt on purpose (palisadewood 554 -> 550 cols, kingswood2 714x28 -> 690x44) -> rebased. burial + canal: grids and ents IDENTICAL to the baseline's, so I bisected (first-parent, 8 runs): first bad = merge 35b29de5 (claude/curvefix1, 10-18, the TIER retune; the mover is untouched since 10-12) -> rebased on that stated change. kings was also FLAKY: with the sound on, footsteps and hits draw the seeded Math.random on the audio clock, so two fresh pages of the same tree differed at frame 712 | rebased wood, kings, burial, canal (keep and welltown keep their old baselines); the tool's page now opens with audio: false (two fresh pages frame-identical on all six levels) | FAIL 4 of 6 -> ok, every frame identical, green x2 |
| small-adds | NOT mine (SMALL FIXES 3, claude/smallfix3 0921c619, not merged yet). Still fails "spore/mother paladin: missed 4 of 11, ranger: missed 5 of 7" on this base | untouched | red until smallfix3 merges; re-check then |
| mash-gate oreroad row | already restamped on master 72bb1c7b by the BATCH122 gate (mash-bot oreroad --level --write: all 3 heroes die at 0% hp on both, L15 deaths 1-2) | none needed (I did not re-run mash-bot: the restamp is on this base) | mash-gate: 50 levels hold, green x2 |
| textfit-levelcard (also on the red list) | the levelcard scope loads EVERY campaign level on one accumulating page and outlived the 480 s scope limit | levelcard added to textfit's batched and recycled scopes (10 levels a page, own job) | 480 s timeout -> ok in 162 s and 137 s, 0 issues, --strict green x2 |

## PART 2 - the four sweeps (the "hang" = one page for 30-66 levels + a silent 30-60 min limit)
Reproduced on this base: the OLD drawn-solids-sweep ran 900 s (my timeout) with ZERO output. Each LEVEL is fast (<= 11 s), so it is accumulated page state plus the PC being short of RAM (memguard KILLs a headless Chrome under the floor and the tool then waits out its whole Runtime.evaluate limit).
Fix (new tools/sweep-pages.mjs, used by all four): ONE LEVEL PER CALL, a fresh Chrome every 5-11 levels, a hard per-level limit (SWEEP_LEVEL_MS, default 150 s; boss-fight-end 240 s) that turns a hang into a NAMED red (TIMEOUT/LOST PAGE <level>), one line per level as it goes (with free MB), and a WAIT for free RAM >= 1500 MB before each new page (waits, never skips). A timeout is red even in the report-only tools. Every check kept.
| sweep | before (master) | after (this branch, whole tool end to end, one run, machine busy with other lanes) | target |
|---|---|---|---|
| drawn-solids-sweep | 250 s timeout (batch121); 900 s with no output (my repro); 1500 s timeout (batch122) | 250 s (chunk 6), then 158 s (chunk 11), 66 levels, rc 0 | < 250 s ok |
| corpses | 609-611 s rc 1 | 249 s, rc 0, 105 ok rows | < 300 s ok |
| visible-supports | 1500-1800 s timeout | 407 s, rc 0 (1381 findings, report-only, art backlog) | < 600 s ok |
| boss-fight-end | 40 min with no output | 539 s, rc 0, 66 fights (50 bosses + 16 minis) all end | < 15 min ok |
Environmental part (brief step e): scratch/nightly.sh has NEVER run - there is no scratch/nightly-*.log or .verdict, so there is no history to say whether the four hung in the nightly. nightly.sh needs no change (no tool name or flag changed).

## Left red / open
- small-adds: waits for smallfix3 to merge.
- drawn-solids-sweep REPORT-ONLY count of phases with undrawn cells varied between my two runs (14, then 16): art backlog, not a hang; an art lane should look at the phase-dependent finding. Not changed here.
- the cart still runs down the rest of the works squad (the snuffer dies in the first 4 s of a load): question 1.
- checks re-run after touching src/main.js: level-quality ok, one-new-foe ok.

## QUESTIONS FOR DANIEL (rec built)
1. Undercrown works: the auto cart (speed 110, west along the rail from col 82) kills the snuffer and the squad on every load, not only the warden. Rec built: the minimal fix (the sentry is spared; bells.mjs green). Rec for the level lane: move the cart's rail/start clear of the squad, or hold the cart until the hero is within about 20 tiles, then drop the sentry exemption.
2. slopes-trace baselines are now "current mover" baselines for wood/kings/burial/canal (like welltown); only keep still holds the pre-slopes build. Rec: fine (the mover has been live a month).
3. Sweep limits: rec keep 150 s a level (SWEEP_LEVEL_MS) and let the gates treat TIMEOUT as red; a silent stall is worse than a slow pass.
4. The gate-report template can now drop the "known reds" for berserker, dune-worm, bells, rule-openings, slopes-trace, textfit-levelcard and the four hangs. small-adds stays until smallfix3 merges.

## Commits on claude/redcleanup (one per red)
berserker d15148e5; dune-worm; bells (src/main.js); rule-openings; slopes-trace (wood + kings); drawn-solids + tools/sweep-pages.mjs; corpses; visible-supports; boss-fight-end; textfit levelcard; slopes-trace (burial + canal + kings, audio off). See git log master..claude/redcleanup.
