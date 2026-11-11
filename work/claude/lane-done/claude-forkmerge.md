# FORKMERGE lane report (claude/forkmerge, from origin/claude/knightfork 028f1af9f) - 11-10

Code-only, node-only: no browser, no tools/check.mjs, nothing killed, no stash, nothing merged to master or deployed. GATE-RUNNING.flag was present; every tool's imports were read first (none of the ones run touches cdp/headless/puppeteer). FORKS_SHIP stays false. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-forkmerge.

## Merged tips (origin tips at fetch time, merged one at a time with a commit each)
palfork 1d83f8ad4, pyrofork d457ae036, geofork fe2127684, bersfork 7069eb1c5, rangerfork 4c442f62f, wardenfork 85a8abebe, freefork 22730738a, bkfork 02b2f846f. Order as listed. Branch claude/forkmerge (pushed).

## Conflicts and resolutions
- src/forks.js import + REG lines (every merge): union, all nine heroes registered (knight paladin pyro geomancer berserker ranger warden pirate reaper).
- src/main.js helper block after `const kb` (every merge): union.
- HELPER NAME CLASH (not a textual conflict, found by reading): palfork AND pyrofork both defined `pb()`, and `pb` is a live local name in 20 places of main.js (calls inside those scopes would hit the local). Renamed palfork's to `plb()` and pyrofork's to `pyb()` (main.js, forks-paladin.js, forks-pyro.js, both tools, both lane reports' code refs). New tools/fork-helper-scope.mjs (node --expose-internals; acorn) proves every kb/plb/pyb/gb/rb/wb/fb/bb/bzFk('...') call resolves to the top-level helper (no shadowing local) and that main.js has no duplicate top-level names: OK.
- pyrofork: heatShield damage line = HEAD's bastion/mirror mitigation chain + pyro sides.
- bersfork: the dodge-cast line keeps knight SHOULDER IN/SIDESTEP + berserker SLIP + pyro pySmokeStart; swingDmg keeps plb pquick + bers SPLITTER (`bzFk('bfoverhead')`).
- rangerfork: swingDmg knife line = ranger sides, rest kept.
- wardenfork / bkfork: traits.js identical foldGone hunks (took one); traits.js keeps palfork's coreLevel in traitUpText.
- freefork: dodge block + swing rate (`* (fb('fswift') ? 1.2 : 1)`) + brand/heart lines (turncoat line + pyro sides) combined; traits-b.js / tools/traits.mjs import lines deduped.
- bkfork: cdOf = bk line (bkglb, bkgla, mail terms) + freefork boarding term; dodge pace line = pyro phoenix factor + bk longPassing sides; atk line uses bkFzMod().swing.

## Consistency fixes
1. TRAIT PAIR RANK SCALING. The question is runtime-neutral: a trait fork opens at TRAIT_FORK_LEVEL 20 = RANK_AT[2], so every trait side already reads at rank III (scale exactly 1.0) for every hero. Still converted Paladin: 14 sites in main.js now scale the delta over the base through trk/trm (litany, shockwave, smite, beacon, retribution, crusade, earthshaker, martyr, sanctuary, doubleJudge; discrete sides stay discrete). Knight and Pyro sites already multiply the whole value by trk(trait) (scale by construction). BERSERKER is NOT converted: his sides are constants that replace the rank-III number (wrapping each in lerp(base, side, K(id)) is about 20 hand edits with different bases) - runtime identical today. A new tools/forks.mjs check pins the invariant (TRAIT_FORK_LEVEL >= RANK_AT[2] and traitMul = 1), so lowering the open level fails loudly. Owed only if the open level is ever lowered: convert the Berserker sides.
2. ONE foldRetire hook: wardenfork's `foldRetire: true` + `foldGone()` in src/traits.js. Paladin, Pyro (blaze/inferno), Freebooter (4), Berserker (bzHide/bzSplit), Ranger (4; rgApex stays in static `retired`), Warden and Blood Knight (overflow) all use it now; the five flag-aware `get retired()` / `get folded()` getters are gone (traits-paladin.js folded is a plain object + foldRetire, `fortress` the only static retired id). tools/traits.mjs and the paladin/ranger tool asserts updated; unused forksShip imports removed.
3. ENDURANCE rider: untouched, the single knightfork implementation (THRESH.e[1] getter).
4. tools/forks.mjs empty-hero asserts now use a hero id nobody has ('nobody'); new check "all nine heroes": 11 ladder rungs each on the FORK_LADDER levels, side ids unique across all heroes, trait pairs open at rank III.
5. Berserker L50 ultimate (UP+C at full rage, RED TIDE / GREAT AXE): APPROVED 11-10 by Daniel (coordinator message) = final design; no isolation constant added; dropped from the question list.

## Check results (node only)
| tool | flag off | flag on (?forks=on preload) |
|---|---|---|
| forks | PASS | n/a (asserts the shipped flag) |
| knight-forks, paladin-forks, pyro-forks, geo-forks, berserker-forks, ranger-forks, warden-forks, freebooter-forks, bloodknight-forks | PASS (9/9) | PASS (9/9) |
| tech-cards | PASS | n/a (asserts the flag-off Knight kit) |
| progression, coop-progress, traits, old-save-traits | PASS | PASS |
| fork-helper-scope | OK | - |
| node --check every src/*.js | OK | - |
| freebooter-flagoff-ast | PASSED on claude/freefork alone; NOT runnable on the merged tree (its base is the knightfork main.js, other heroes' edits are in the tree now). freebooter-forks.mjs prints a skip line for that one check on forkmerge. OWED: a merged-base AST proof (base = merge of all-but-one lane) if machine proof of flag-off equality for the whole tree is wanted; today's evidence = each lane's own audit/proof + the per-hero node tools above. |

Not run (browser-owned): tools/check.mjs, textfit, tavern, geomancer.mjs, geo-board.mjs, ranger.mjs, blood-kit.mjs, dk2, heroblocksa, berserker.mjs, hero-trials, mash-gate, hero-keys-sheet, freebooter-kill, herald-pirate, and every lane's page tool.

## ONE sequential browser proof list (lab ?forks=on&traits=on; one browser at a time, >= 1500 MB free, no GATE-RUNNING/BROWSER-HOLD)
0. Flag OFF smoke first, per hero in this order: Knight, Warden, Geomancer, Ranger, Pyro, Berserker, Paladin, Freebooter, Blood Knight: L30 plays as base (existing per-hero tools: knight-chain, geomancer, geo-board, ranger, pyro-kit, berserker, blood-kit, dk2, heroblocksa, freebooter-kill, herald-pirate, hero-trials, mash-gate, hero-keys-sheet); inn has no signpost; tavern.mjs + unlocks.mjs spacing.
1. Fork card flow, ONE hero fully (Knight), then a spot check on each other hero: gainXp to L50, stat card first, one CHOOSE YOUR PATH card at 21,22,24,27,29,32,36,38,43,48,50, no level deals two choice cards; take B; banner; strip 11 pips compact A/B on 320x180.
2. textfit across all 9 heroes: 22 fork cards each (names <= 14, what <= 96, teach <= 155-175), 9-10 trait cards each, 'A SURGE; SKILLS COOL 10% FASTER', the strip; longest names: COUNTER-NOCK, CLOSE QUARTERS, STEADY BREATH, HAUL TO BLADE, THREE BARRELS, BOARDING PARTY, SPLINTER SHOT, CRIMSON FRENZY, WARDEN'S REACH, MTN COLLAPSE, FOURTH STONE, PIECES OF 8.
3. THE CROSSROADS board at 320x180 for each hero: ABILITIES 11 rows (4 rows + detail), TRAITS tab 9-10 rows, locked rows "? L<n>", unslotted-skill / unworn-trait notes, TAB, ESC, touch taps. Walk to the signpost (tile 20).
4. Per-hero fork moves, one use per side on a dummy (each lane's item 3, unchanged): Knight (11 rungs), Paladin, Pyro, Geomancer, Berserker, Ranger, Warden, Freebooter, Blood Knight. Watch items: knight thrown/thrown2 hand-off; paladin MIRROR false turns; pyro ward parry hook (f null); geo ONE STAVE meter; ranger STEADY BREATH meter; warden HIGH VAULT landing; freebooter GRAPPLE stuck pose; BK SHORT TIERS meter; berserker OPEN VEINS notches.
5. Trait pairs, one use each (TRAITS_SHIP on, trait worn, first-wear card at L20+): 10 + 10 + 10 + 9 + 10 + 10 + 10 + 10 + 10. Folded ids gone from the traits menu for Warden, Ranger, Pyro, Paladin, Freebooter, Berserker, Blood Knight (the single foldRetire hook).
6. Old saves: real L35 / L50 Knight (DEEP SUNDER / SHIELD THROW+ ranks) flag on then off; real L25/L50 saves of the other 8 heroes load flag on then off, nothing owed; a TRAITS-on save with blaze/inferno/bzHide/bzSplit/overflow worn when the flag flips.
7. Duel: EVEN L1 vs YOUR LEVEL with each forked hero (EVEN must play base). Co-op: partner client does not crash on golem2/host/mines, cloud/storm/hawk, kegs/haul, twin spears, LONG/DEEP FRENZY clock.
8. Rung art checklist (greybox owed): each hero report's item 8; flip only after these.

## n=6 power-check plan (one JOINT tune lane, after the demo gate and after the re-point merges below)
n=6 WITH flasks, 60-70% band, levels 30 and 50, bosses = each hero's tune rows (Crusader, Chieftain, Bog Troll, Hornet Queen, Warcairn, Stockade, Rookery, Goblin Queen, Death Knight, Admiral, Tusker per the lane reports). Per hero: (1) all A + default traits; (2) all B; (3) re-run the worse side to n=12 only if A and B sit more than 8 points apart. Nine heroes sequentially, one browser, memguard first. First-to-watch sides (hand math): Knight QUICK STEEL, Paladin AEGIS STEP + BRAND, Pyro SPARK STAFF, Geomancer HIGH RIFT + DEEP DIVE, Berserker OPEN VEINS + OVERHEAD, Ranger DEAD CENTRE + SPLIT SHOT, Warden TWIN JAVELIN, Freebooter SWIFT BLADE / PAYDAY, Blood Knight SHORT TIERS. Bot blind spots are listed per lane (beat parries, burrow, kneel on the beat). Run AFTER the palrework / berserkerid / bkrework re-points (their numbers move the base).

## Flip order
1. TRAITS_SHIP first (Warden Q10 / BK Q10: with TRAITS off the folded sides read the same for A and B players; trait pairs need worn traits). Playtest window.
2. Merge palrework, berserkerid (identity only; drop its 6 techniques / 8 upgrades; keep UNBOWED / SCARRED traits), bkrework, each followed by its re-point pass (sites in the palfork / bersfork / bkfork reports).
3. Browser proof list above, art passes, joint n=6 tune.
4. FORKS_SHIP last.

## DANIEL questions (batched; each with rec; none blocking)
(Berserker L50 ultimate: approved 11-10, final.)
1. Merge order for the three rework branches (palrework, berserkerid, bkrework) vs the forks: REC merge each, then one re-point pass per hero before any flip (forks are built on master's kits).
2. Knight Q1 QUICK STEEL makes the run FOUR cuts for riposte/evade/flourish/flurry too: REC keep; revert to "15% quicker only" if it feels wrong.
3. Paladin Q1 DIVINE SHIELD loses the 2 s untouchable on both sides (BASTION 8 s x0.7 / MIRROR 3 s x0.85): REC keep (boss law); alt 0.5 s untouchable on cast.
4. Pyro Q2 FIRESTORM / FLASHOVER sides ADD a ring after the base burst: REC keep, trim in the n=6.
5. Geomancer Q4 capstones keep the collapse's budget (24 swords on a boss at n=3), not geopack's 2.4: REC keep; the tune lane may lower all together.
6. Berserker Q4 LAST STAND A = 5 s of "cannot drop below 1 hp": REC keep 5 s; fall back to 4 s + no flinch if it trivialises a boss.
7. Ranger Q1 sig rung = SMOKE ARROW (her plunge has no sides worth a card) and Q8 VEIL dissolves boss yellow shots for 1.5 s: REC keep both; VEIL can become foes-only blind if the boss lane objects.
8. Warden Q5 the hold-C text still says "brace" but the code is the javelin throw: REC fix the TEXT in the text lane.
9. Freebooter Q5/Q6 L50 forks the existing BLACK FLAG (LONG PARLEY / PAYDAY) and the flag is still plain C at a full purse (every other ult is UP+C): REC leave to the rogue-rework lane (re-key 'ult' there).
10. Blood Knight Q2 forkplan's new-move sides (PLANT THE BLADE, MORTGAGE, REQUIEM UNBOUND ...) are not built, parameter forks of existing moves instead: REC accept; LAST RITES is dead on master (rewired to the Frenzy), REC cut it in the rework.
11. Trait pairs stay dark until TRAITS_SHIP is on for every hero: REC accept (they come alive together).

## Other notes for later lanes
- Berserker trait sides could be converted to rank-scaled (lerp) if the trait-fork open level is ever lowered (fix 1).
- main.js has mixed LF/CRLF only in lines this merge touched; git normalizes (autocrlf).
- The palfork / pyrofork lane reports still say pb(); the code and tools say plb() / pyb().
