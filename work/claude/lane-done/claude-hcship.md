# HCSHIP - the Highcrown set integrated for the full game (sonnet, code only, 11-08) - claude/hcship

Branch claude/hcship off origin/master 923e8ad42, worktree bracken-lanes/bracken-hcship. Pushed. NOT merged to master, NOT deployed, no browser of any kind started, tools/check.mjs not run, nothing stashed, nothing killed.

## Merge notes (order as asked)
1. claude/gq2mech (70315f94e). It already contains claude/gq2 (rev-list gq2mech..gq2 = 0 commits), so nothing was needed from claude/gq2. One conflict: tools/boss-run.mjs (master's WARDEN_ULT_HAND block vs gq2mech's ROW_MIN_SECS block): kept both.
2. claude/highcrown3 (d013aa614): clean.
3. claude/hc3art (1fe7d1375, rounds 1-3): one conflict in tools/boss-run.mjs. Its merge had taken master's whole fightJs line, which DROPPED gq2mech's pieces. Re-applied by hand after the merge: maxSecs uses ROW_MIN_SECS (her row never runs under 360 s), the row returns gq, and line() prints the gq stage / stuns / p1 / escape / p2 / bar. Without this the n=6 Queen run would have used the 240 s clock and timed out real wins.
4. claude/airship (d6766686f, THE DUSKWING rename): this branch is old (base 42a1d4cd) and carries the whole desert chain (Great Dune, Colossus 4, Sun rooms, route-insert). Conflicts: tools/cdp.mjs, src/level.js, src/main.js (4 hunks: import lines, EHP, the respawn clear line, the told-blows-only line). Resolution = master/Highcrown side kept, airship's additions layered on (SRH sun-room hands, thunderwyrm/wyrmling/sandskiff EHP, DNH/ASH clear, thunderwyrm told-blow skip, both LEVELS rows). **Everything airship adds is behind flags that are OFF (AS_SHIPS=false, GD_SHIPS=false, asOn/gdOn): LEVELS is master's array, no index or save moves, the Duskwing is not player-visible.** So the only effect on the live game is dead code size. Rec: it is safe to ship inside this set; if Daniel wants a smaller blast radius, merge hcship without airship (merge 4 is the last merge commit).

## Fixes made on top (commit "hcship: integ fixes ...")
- SHE IS TOO QUICK hint (src/goblin-princess.js chaseStep): the chase now STARTS (shout + hint) only for a hero still on the approach (x < the chase end - 2 tiles). A hero already at her tower (a teleport, a dev jump) finds the chase done and gets no hint and no shout. The existing gprincess asserts (109) still pass.
- tools/tells.mjs was red on the airship branch itself: its marks sat in the generated MARK table by hand. Moved them to BY_HAND in src/marks.js and regenerated with tools/tells.mjs --write. The wyrmling's mode spitTell collided by NAME with six other creatures' spitTell, so it is now sparkTell (src/wyrmling.js, src/airship-hands.js, tools/airship.mjs, marks rows). Pose and sound NAMES are unchanged.
- tools/blow-tags.mjs: DNH.take / ASH.take in main.js now receive the blow tag (the hands ignore it for now; the rule is that every boss hook gets it).
- tools/kitchengate.mjs, palisadewood.mjs, rookery.mjs lift the levelLocked clause out of main.js into a Function; airship added roadKept(...) to that clause, so they threw ReferenceError. They now pass a roadKept stub.
- docs/updates.json: WHAT'S NEW batch 153 on top (5 lines, each <= 90 chars; the Duskwing is not mentioned because it is hidden).

## Checks that passed (node only, one at a time, no Chrome; free RAM 1.1 GB at the start, the tools are light)
exit 0: gprincess (109), gq2mech, bell-winch, gqueen3, hc3art-sheet, crown-exam (765 cols), level-quality crown (clears the bar), demo-cut, warden-id, boss-read, boss-rows, goblin-lint, comments, architecture, anchor-lint, tells (after the BY_HAND move), signs, floaters, dangling-paths, answer-tags, blow-tags, crown-requests, checkpoints, checkpoint-gaps (worst gap within 200), elites, keys, killzones, traps (exit 0; its "46 traps to fix" line is the existing report), map-grammar, map-spacing, airship (94 ok), kitchengate, palisadewood, rookery, npc-removal, homepaths, shop-gates, occluders, swim-shrines, talents, curve-gate; node --check on all 70 changed .js/.mjs files.
NOT run on purpose (they open Chrome): map-scale, map-forks, highcrown2, textfit and the whole page list below. tools/check.mjs: forbidden.
**Flaky, pre-existing:** tools/gq2-lab.mjs failed 2 of 12 runs here AND 2 of 12 on the unmerged gq2mech tip: the CO-OP assert "her portal shards fly at seat two and hit him" depends on an unseeded random. Rec: seed it in a later small lane; do not read one red as a regression.

## BROWSER PROOF STILL OWED before this can go live
Outside the gate; one headless page at a time, >= 3 GB free; no GATE-RUNNING.flag / BROWSER-HOLD.flag in the scratch folder. PORT=8644 is the boss-rates default; give each tool its own port if two run.
1. **Princess n=6 WITH flasks, target 60-70% pooled** (hcplan and highcrown3 say 60-70; the tool's own minis band is 75-85, so read the pooled % yourself, not the band label; per-hero floor 40%, mash 0/6):
   `PORT=8644 node tools/boss-rates.mjs crown:mini --ways=built --seeds=6 --heroes=knight,warden,geomancer,ranger,berserker,pyro,paladin,pirate,reaper --jobs=1`
   Her numbers: hp 1100, pin 3.5 s, bell cd 8, horn 6, three winch blows, 0.5x outside openings.
2. **Goblin Queen n=6 with the new bell/grate opening** (target 60-70% WITH flasks; her row runs on a 360 s clock automatically; read the gq stage / stun / p1 / esc / p2 fields):
   `PORT=8644 node tools/boss-rates.mjs crown --ways=built --seeds=6 --heroes=knight,warden,geomancer,ranger,berserker,pyro,paladin,pirate,reaper --jobs=1`
   Starting numbers: P1 2400, P2 1600, chip 0.4x outside openings, bell cd 10, pin 4.0 x1.35, horn 5.5, 3 blows, charge 250 px/s dmg 14.
3. **In-game stills** of the gate drop (guardroom gate DOWN after three timed winch blows: the one thing hc3art never drew in-game), the tower hatch (shut, and open on her escape), and the murder holes loaded / spent / mid-fall (6 holes: bailey, vestibule east lintel, keep high gallery, banquet servery, tower 1, tower 2). Tool (hc3art's, one page, not in the suite):
   `HC3_GROUPS=spots,rooms,chase,fight,cameo node tools/hc3art-shots.mjs`, then add or aim shots at those three.
4. **CROWNREVIEW2 walk** (read-only sonnet browser review, writes crownreview2.md; it has NOT reported on this branch): Highcrown start to Queen with a real hero.
   `PORT=8708 node tools/level-walk.mjs crown --heroes=knight,warden,pyro --seeds=2` plus a look at: two THE LEADS signs (09-24 leftover, likely gone with the Leads), lootHeap filler, bunched checkpoints (364/63 vs 358/37), battlements parapet height vs a 26 px hero, the broken stretch, the bell tower rope run.
5. Page halves still owed by the lanes: `node tools/highcrown2.mjs` (ring / b15 still assert the plate), rule-openings, boss-fight-end (her 10% clamp ends via the 2 s escape), boss-openings, crown-route, `node tools/gqueen3-page.mjs` (all nine heroes parry a forced crown / shard), untold-told, attack-tokens, map-scale, mobile-perf crown scene, textfit (new signs, her plate and name, the Duskwing card), campaign-xp at integ.
6. **Real-swing proof for every hero's blow on the rope / winches / murder-hole chains**, including the ranged heroes (pyro / ranger / geomancer: attackBox is the melee box, an open question in both lane reports) and a heavy captain inside a dropped grate column.
7. **Curve restamp** (level hash moved): `node tools/level1-pilot.mjs crown --curve`, then `--write`.
8. hc3art in-game items not yet seen: the chase actor's draw order, her 34 frames (feet alignment, hurt flash) in a real fight.
9. Stand-ins: her music (goblinroyal), SFX and voice (gobbig x1.5).

## Open questions (rec first)
1. Ship the Duskwing rename inside this set although the level is flagged off? Rec: yes (inert, one string). Alt: drop merge 4.
2. Princess band: 60-70 (as planned) or the tool's minis 75-85? Rec: 60-70 pooled, it was approved in the plan.
3. Keep the hall balcony shrine (358/37) (highcrown3 q1)? Rec: keep (else the keep climb is 238 route tiles between shrines).
4. Guardroom gates stay background doors (highcrown3 q4)? Rec: keep; only draw the DOWN state in the still pass.
5. Princess cameo is drawing only, not an actor (hc3art q1)? Rec: yes.
6. Princess portrait banner in the Queen's hall at the next Queen art pass (hc3art q2)? Rec: yes.
7. Seed the gq2-lab co-op shard assert? Rec: yes, tiny fix lane.
8. Ranged heroes on the bell and winches (attackBox is melee): count their projectiles as blows? Rec: yes for rope and winches, decide after the real-swing proof (item 6).
9. Princess music: a CC0 minuet that goes frantic in the tantrum (hc3art rec). Rec: yes, a sound lane after the n=6 lands.
