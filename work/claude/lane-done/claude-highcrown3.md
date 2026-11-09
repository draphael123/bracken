# HIGHCROWN 3 + THE GOBLIN PRINCESS - greybox build (opus, code-only) - claude/highcrown3

Branch `claude/highcrown3` off `claude/gq2mech` (97fbca72d), worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-highcrown3`. Pushed. NOT merged, NOT deployed.
Plan: scratch/lane-reports/hcplan.md (APPROVED 11-06 22:34) with Daniel's change: a bit LONGER, do NOT cut the Captains Hall or the bakehouse yard.

## Route length
| | columns | route (tools/level-quality.mjs crown) | shrines |
|---|---|---|---|
| before (97fbca72d) | 665 | 780 tiles | 8 |
| after | 765 | 874 tiles (+94, **+12.1%**, inside Daniel's +10-15%) | 8 |
Nothing cut: the Captains Hall and the bakehouse yard are untouched. 100 columns are INSERTED at the banquet's east door (new `insertColumns` in src/level.js, the inverse of cutColumns, applied last), so her hall, escape and tower top slide east whole.

## What was built
- **src/level.js** `insertColumns(R, c, n)`: grid, ents, movers, pools, zones, alarms, winds, arena/arenaRoof/mini, gqEscape, routeSupports, hcDeco, doors - all shifted. AMBUSH.crown: her CAPTAIN (heavy elite, `AMBUSH_CAPTAINS.crown = 'heavy'`, affix WARDING) + soldier + javelin; door shrine moved off it.
- **src/highcrown2.js** `HC3` + `highcrownThree()` (final columns):
  - 479-522 BANQUET = PRE-THRONE REHEARSAL + ambush room: bell rope (487), grate mid-hall (499), servery door (510) + winch (507), murder hole over the servery; shrine at its EAST door (524,23).
  - 523-622 THE BATTLEMENTS: wall walk row 21, snow + told headwind gusts, 2 ALARM TOWERS (557-566, 602-611: passage, roof archer, ladder up the east face, guardroom door + winch, murder hole), the broken stretch 576-584 (stone corbels, 6-row drop to a lower walk + ladder: time cost, no death; no spikes anywhere).
  - 623-648 THE BELL TOWER (L.mini gprincess): floor row 21, belfry landing 630-641 row 19 (3-row jump), tower bell grate col 636, rope 627, guardroom door 643 + winch 641, hatch, inner stair door col 648 (mini gate) onto the terrace; then her hall at 659.
  - The Leads (stack, gutter, spikes, whelp, turret alarm) are gone into it.
  - 6 MURDER HOLES (player-worked): #1 bailey (was the timed crane stone), #3 vestibule east lintel, #4 keep high gallery, banquet servery, tower 1, tower 2.
- **src/bell-winch.js** (NEW, pure): struck / ringBell / ringFresh / grateGlow / underGrate / waveOpen / crankWinch / waveTick / hornLeft / waveKinds (+1 soldier at 3-4 seats) / MURDER. **src/gqueen-hands.js now runs on it** (gq2mech's 50 asserts still green).
- **src/goblin-princess.js** (NEW): GP numbers (hp 1100, 0.5x outside openings, 0.4x hiding behind a guard - never 0; pinned x1.35 3.5 s, stunned x1.25 2.5 s, stagger/preen x1.0; one opening <= 20% of her bar; ends at 10%), rapier lunge (glint, parry -> stagger), 3/4-poke flurry -> preen, trinkets (bounce, knock away), fan gust (push, never off anything), belfry hop/perch, 'GUARDS!' at 70/35% (horn 6 s, 3 winch blows each inside 2 s keep them in; she hides behind guards), TOWER BELL (any seat: she BOLTS for the hatch, glow 0.9/0.6 s, grate drops -> PINNED, else SHE DUCKED; cd 8 s, queued 1 s; a hero on the landing is shoved clear), tantrum at 50% (x0.8 gaps, tiara boomerang - parry -> CONKED/STUNNED, stomp ripple - jump), escape at 10% (MOTHER!, hatch, mini done, never killed, her guards flee). Plus the CHASE (once per checkpoint life; rings both towers), the towers' guardroom winch waves, the banquet rehearsal (Captain storms to the rope, pinned under the grate; servery horn + winch), gpPlan + labDuty, greybox drawing.
- **src/main.js**: spawn case, EHP, take (+ the Captain's pin x1.35), update -> escape -> `miniEnd` (no corpse), no contact damage, frame, drawOver, level hooks (updateVillage/drawVillage), gpGrateDrop/Tick/Clear, the generic `murderhole` prop (blow on slot or chain, 40 dmg, heavies/elites staggered 1 s, reload 10 s, never hurts a hero), bestiary row, MINI_DONE, COLS, SPR (greybox = soldier sheet + drawn gown/tiara), rush row, BK.gprincessHands.
- Data: boss-greed (opening + own cap), boss-read, marks (BY_HAND/MARK/ANSWER/HEIGHT), threat, audio voice, elite-kit, ambush, lab.js duty, tools/boss-rows `crown:mini`.
- **tools/gprincess.mjs** (NEW, 109 node asserts, registered in check.mjs). Tools updated for the insert: crown-exam (765 cols; no Leads whelp - no spikes on the battlements instead), gqueen3 + gq2-lab (pixel literals +1600), crown-requests (3 unstable lamps).

## Verified (node only, one at a time, free RAM 2.8-4.8 GB before each run)
`node tools/X.mjs` for X = gprincess (all ok, 109), gq2mech (all ok), crown-exam, gqueen3, gq2-lab, boss-rows, elites, checkpoint-gaps, checkpoints, signs, tells, answer-tags, blow-tags, boss-read, goblin-lint, architecture, comments, anchor-lint, crown-requests, dangling-paths, keys, killzones, traps: all exit 0. `node tools/level-quality.mjs crown`: CLEARS THE BAR (route 874). `node --check` on every touched file.
**Two slips, disclosed:** (1) I ran `tools/highcrown2.mjs` early on without checking - it is a PAGE tool and opened ONE headless page for ~1 min (free RAM 3.5 GB at the time); it exited by itself, no headless chrome/node left (checked by command line, nothing killed). It passed. (2) keys/killzones/traps ran in the same shell call as a RAM reading of 1.1 GB (Daniel's playtest load); they are light (seconds) and passed, but they ran under the 2.5 GB line.

## OWED
- **Browser proof** (one page at a time, outside a gate): the chase reads (her greybox actor; she is also visible standing in her tower before the chase ends - hide the mini until `chaseDone`), real blows on the rope / winches / murder-hole chains for all 9 heroes incl. ranged (attackBox is the melee box - same open question as gq2mech), the grate on her and on the banquet Captain (a heavy inside a dropped PORT column: check he is not pushed out oddly), the escape -> miniEnd -> inner stair door, the mini plate/name, textfit, the page halves of highcrown2.mjs / rule-openings / boss-fight-end (her clamp at 10% means a kill blow ends via the 2 s escape) / boss-openings / crown-route / map-scale, the curve restamp (`node tools/level1-pilot.mjs crown --curve` and `--write`: level hash changed), the walker on the battlements (it must learn winches/bells), campaign-xp at integ. `tools/check.mjs` full suite not run.
- **Art (HC3ART, art before live)**: her sheet (~22 frames), gems/tiara/fan/handbell, the battlements backdrop, crenels/merlons, tower roofs + archer loops, guardroom doors + gates (hcDeco `guarddoor`/`gpwinch`/`gpbell`/`hatch` are laid for it, ignored by the current art), corbels, the bell tower, banquet servery dressing, cameo in the Queen's intro; mini music (rec CC0 minuet; `goblinroyal` stands in); her SFX/voice (kit gobbig x1.5 stands in).
- **Tune (n=6, WITH flasks)**: crown:mini 60-70% (hp 1100, pin 3.5, cd 8, horn 6, the cap), then crown (the Queen after the new approach), the banquet Captain + servery.
- Not built from the plan: the bell-tower gallery archer during the chase; the 09-24 leftovers (lootHeap filler etc.) - CROWNREVIEW2 has not reported on this branch.

## Questions for Daniel (each BUILT as the rec)
1. **The hall balcony shrine (358/37) STAYS.** HCPLAN dropped it, but without it the keep climb is 238 route tiles shrine to shrine (checkpoint-gaps: <= 200). Result: 8 shrines, same count as before, the banquet's moved to its east door. Rec: keep. Alt: drop it and move the keep-door shrine up the hall.
2. **Murder hole #2 is in the banquet (over the servery), not over the crag tower gate** - the crag gate has no floor or vault over it. Rec: keep.
3. **The banquet's servery horns on its own** 4 s after you meet the Captain (not only when you ring) - so both verbs are in play together, as the brief says. Rec: keep. Alt: the servery opens only when you ring the rope.
4. **Guardroom doors are background doors** (the wave appears at the door if not cranked; no grid portcullis to block the walk). Rec: keep; art draws the gate.
5. **The belfry landing is 3 rows up**, not 4 (the reach model's plain jump is 3). Rec: keep.
6. **The battlements have no whelp** (the Leads' spike pit is gone; crown-exam now asserts no spikes on the battlements). Rec: keep.
7. **Hide the Princess in her tower until the chase ends** (today both are visible for a moment). Rec: yes, in the browser-proof lane.
8. **Her Captain's affix is WARDING** (the old brute's). Rec: keep unless the proof shows it fights the grate pin; alt UNSTOPPABLE.
