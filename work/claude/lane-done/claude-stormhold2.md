# Lane report: claude/stormhold2 (STORMHOLD, rebuilt again)

Branch `claude/stormhold2` off `origin/claude/stormhold` (5f3ede7, the held branch Daniel played and said "still
didn't seem appropriate"). Merged `origin/master` (abcd773, batch 34) - the branch was old, from before batch 6, so
the merge conflicted in `src/level.js`, `src/main.js`, `src/threat.js` and `src/marks.js`. `tools/check.mjs` union'd
cleanly (no conflict there at all - `bash ../scratch/resolve-std.sh` only needed the marks.js half). The spawn line
(`['tools/' + t + '.mjs']`) is still there, grep verified.

## The merge

- **src/threat.js** and one block of **src/level.js**/**src/main.js**: purely additive (our `scalder`/`whelp` threat
  entries, our imports, our sprite bakes side by side with master's) - kept both.
- **The big one**: master had grown its *own* inline `stormhold()` function directly in `src/level.js` (commits
  `ac0fb9e`..`5e0fd7b`) while this lane held its own build in `src/stormhold-town.js`. Two Stormholds. Per the brief
  ("keeping master's behaviour everywhere outside Stormhold"), I took this lane's `stormhold-town.js` build inside
  Stormhold and deleted master's inline version entirely (not left as dead code) - the LEVELS registry entry now
  points at `stormholdTown()`.
- **DMG/EHP/HAS_HURT/COLS/GOBLINISH/FLYERS**: master had grown these considerably (the desert, the Undercrown, bell
  moves) while this lane had added `scalder`/`leadfoot` entries master didn't have yet - merged as a union, nothing
  dropped from either side. Verified with `node --check` on every touched file.
- **CAM_FOOT**: master replaced the old literal `0.58` with a named constant (`claude/camera` lane); this lane's
  tower `climbLook` camera offset was rewritten on top of the constant instead of the literal.
- **tools/check.mjs**: auto-merged clean. The one name missing from the union (`tide-reaver`) is the batch31/32
  fix removing a check master had already deleted for a reason - confirmed via `git log --oneline --all | grep
  tide-reaver`, not re-added.
- **Two stale placeholders I found and fixed post-merge**: `SMALL_ADDS`/`AMBUSH.storm` and `ELITES.storm`/
  `POISE_SKIP` in `src/level.js` still pointed at the *pre-merge* held-branch layout's old columns (from before this
  lane's town was rebuilt to 672 columns) - a dangling-paths-style leftover. Fixed both against the real, current
  geometry (see below); `tools/elites.mjs` was failing storm before the fix (`FAIL storm pike@250,29 gate 257`, a
  pike with no such gate).

## What I built on top of the merge (docs/level-design/wood-to-highcrown-design.md "## 11. STORMHOLD")

The held branch already answered most of the brief: 700 (was 672) columns, three towers with the three keys on their
top decks, and THE SCALDER pouring pitch down the ladders. Daniel's task and the audit's plan asked for four things
on top of that, plus the length and the fire archers:

1. **LONGER.** 672 -> 700 columns (the bridgehead yard grew by 28 for the exam below; everything from the Long
   Bridge on shifted with it via one `BRIDGE_SHIFT` constant, so nothing upstream of the Wall Watch moved).
2. **Tall watchtowers, keys at the top** - already true on the held branch (Gate Watch 13 rows, Bell Watch 11, Wall
   Watch 7); kept as-is. `tools/watchtowers.mjs` proves the ladder, the rope, the key and the sign for all three.
3. **Walkways.** The held branch already had a roof road (Market Square) and a wall-walk (the Curtain Wall, two wall
   towers). Added one more: a rope span between the Smoke Row roofs (207-209), a hard road that pays (a silver) and
   doubles as this lane's cutter-with-a-rope (below).
4. **The audit's beats:**
   - **Sentries get a bell, via `L.alarms`** (Highcrown's own alarm system - `tools/bells.mjs` already existed and
     checks it in full: rung, dropped, lifted, quiet if the bell's broken, the 20s clock). Two, both new: one in
     Smoke Row (the *first* bell taught in the game, ahead of Highcrown's own first sign about it), and one standing
     the Bell Watch's own ladder route between its two Scalders - so the window shortcut past the first one is a
     real choice (skip a fight), not just a shortcut for its own sake.
   - **Cutters get ropes.** The held branch had zero `cutter` entities and zero rope spans in the town (the audit's
     gap - `updateCutter` in `src/main.js` idles as a plain melee foe when `e.bridge` doesn't match a real
     `L.bridges` entry). Added one cutter on the new Smoke Row rope, wired to it for real (`bridge: 207`).
   - **An exam at the bridgehead**, RULES S3: a checkpoint opens it (533), a pike line stands under a fire-cage
     weight - the Lance's own verb, cut the cage down on what stands under it - and nothing sits between there and
     the checkpoint outside his arena (574). Verified no checkpoint in between.
   - **The Lance's lookouts and archers stay as on master; no fire archers.** The held branch still had three
     hardcoded `fire: true` archers on his bridge (exactly what Daniel had master remove on 2026-09-25) - replaced
     with `lanceLookouts()` from `src/lance-support.js`, the same call master's version made. Also found and removed
     two *more* fire archers elsewhere in the town (the Halls, the Curtain Wall) that the brief's "no fire archers
     anywhere in Stormhold" covers and the held branch had missed.

## Proof every key is reachable

- **Static**: `tools/reach.mjs storm` - "everything is reachable... nothing stranded" (after fixing one exam coin
  that floated over the fire-cage with no foothold under it - moved to the ground).
- **`tools/watchtowers.mjs`**: for all three towers, the reach model's own geometry checks (ladder reaches the deck,
  rope clears rock, key sits on the deck, sign names it) - green.
- **A real walk, not a teleport onto the key**: `scratch/storm-tower-walk.mjs` (one-off, in the shared scratch
  directory, not part of the suite) drives the Gate Watch with true `keys.up`/`left`/`right` input against the
  ladder's actual NET tiles - the east ladder (46, rows 30-35) to the landing, then the west ladder (41, rows 23-30)
  to the deck - and confirms the brass key is picked up by real proximity (`P.props` shows it `got`, and
  `BK.marks.has('key:brass')`). Ran with `BK.god`/`P.inv` held up through the climb so a stray hit from the
  Scalder or the sprig on the landing (both real, both still there) doesn't produce a false negative on the *path*;
  the fight around them is exactly what `tools/watchtowers.mjs` and normal play already exercise.

## Checks run (named, per the rules - not the full suite)

`watchtowers`, `bells`, `lance-support`, `keys`, `elites`, `checkpoint-gaps`, `reach`, `ambush-reach`, `small-adds`,
`camera-fill` (touched `src/main.js`'s camera merge line), and the new **`tools/stormhold2.mjs`** (registered in
`tools/check.mjs`'s list, verified with grep) - asserts the five things nothing else checked: length > the held
branch's 672, all three towers a real climb (>=6 rows) with the key on the deck, at least one town rope walkway off
the boss's own bridge, at least one cutter holding a *real* rope, the exam's shape (checkpoint -> foe under a fire
cage -> nothing -> arena checkpoint), and zero fire archers anywhere in the level. All green:

```
Stormhold2: 700 columns (held branch was 672); three towers, all a real climb, keys on their decks; 1 town
walkway(s) off the boss bridge; 2 bell(s) live; 1 cutter(s) holding a real rope; the exam (checkpoint 533 ->
cage@551 -> foe@546 -> arena checkpoint 574); no fire archers.
```

`bells` output for Stormhold's two new alarms (from the full run, both sections):
```
"storm smokerow#0":{"ran":true,"rungF":111,"on":true,"dropped":true,"watch":2,"done":true,"lifted":true,
  "locksHeld":true,"quiet":true,"clockS":20.1,"clockLifted":true,"reset":true}
"storm bellwatch#0":{"ran":true,"rungF":119,"on":true,"dropped":true,"watch":2,"done":true,"lifted":true,
  "locksHeld":true,"quiet":true,"clockS":20,"clockLifted":true,"reset":true}
```

## The Lance pilot (his fight changed: lookouts replaced the fire archers)

3 heroes x 1 seed, refill mode, 150s cap, before (held branch's fire archers) / after (this lane's
`lanceLookouts()`) - `scratch/lance-pilot-3.mjs`, run by temporarily swapping `src/stormhold-town.js` for the
pre-change file and back (diffed clean afterward, `git status` shows only the intended changes):

| hero | before | after |
|---|---|---|
| knight | win, 74.0s, 200 taken, 0 archers | win, 74.0s, 200 taken, 2 archers, 0 cut |
| warden | win, 55.8s, 151 taken, 0 archers | win, 49.1s, 130 taken, 2 archers, 1 cut |
| pyro | win, 38.5s, 37 taken, 0 archers | win, 27.8s, 62 taken, 1 archer, 1 cut |

All six fights win. `archers`/`archersCut` only appear "after" because the summoned-bowman mechanic didn't exist on
the held branch (it had three archers standing still on the bridge instead); their appearance confirms the swap is
live. No regression in outcome; times and damage taken stay in the same range hero-to-hero.

## Unverified / not covered here

- I did not re-run the full suite (credits; per the rules, only named checks touching what I changed, plus
  storm/lance/alarm checks - all of which are above).
- The rooftop rope's "hard road pays" silver (200,23) and the exam's coin placements were checked only by
  `tools/reach.mjs`'s flood fill, not walked by a bot.
- `tools/lab-reach.mjs storm` produced no output (it may not take a level-name filter the way I called it); I did
  not chase this further since `tools/reach.mjs` and `tools/watchtowers.mjs` already cover Stormhold's reachability
  in full.

## QUESTIONS FOR DANIEL

1. **The Bell Watch's alarm garrison spawns hearthgobs up in the belfry itself**, in a fairly small space next to
   the key and the second Scalder. It's brief (20s clock or clear it) and it's meant to punish the ladder route
   specifically, but if it reads as too cramped once you've played it, the alternative is to move the garrison's
   spawn point down to the second floor instead (still blocks progress, more room to fight in).
   *My recommendation*: leave it as built and see how it plays - the belfry is meant to feel like a squeeze once
   you've been caught, and the alarm auto-clears in 20s regardless.
2. **The new Smoke Row rope span is short** (3 tiles, 207-209) because the two existing roofs there were already
   close together, and I chose not to move the forge roof to lengthen it (would have meant re-checking every ent
   placed relative to it). It still teaches "the rope frays where he stands, don't linger" and pays a hard-road
   silver, but it's a smaller beat than the Gate Watch's or Bell Watch's climbs.
   *My recommendation*: ship it as a small beat, not a second big set-piece - Smoke Row's real content is still the
   chimneys.
3. **The level is 700 columns now, up 28 from the held branch's 672** (all of it the bridgehead exam). I didn't
   lengthen any of the earlier sections (the road, the market, Smoke Row, the Bell Close, the Halls, or the Curtain
   Wall's climb) beyond the town-scale walkway/cutter addition, since the held branch's own sections already read as
   full per the audit ("the mechanic map" table shows a beat every 20-40 columns already).
   *My recommendation*: if "longer" meant substantially longer throughout (not just the exam), say which section and
   I'll extend it in a follow-up - extending blind risks diluting a section that's already tuned.

## Commit

`53cbae0` - "Stormhold, rebuilt again: taller climbs stay, plus the alarm, a rope, and the exam" (on top of the
merge commit `9300af8`, "Merge origin/master (abcd773) into claude/stormhold2"). Pushed to `origin/claude/stormhold2`.

## Follow-up (coordinator flag)

Deleting master's inline `stormhold()` in the merge dropped two of its own changes that had nothing to do with the
layout itself and landed on master after this lane's held branch forked:

1. **claude/npcs** (Daniel, 2026-09-26, "they don't add much"): every decorative talker/quest-giver removed
   game-wide. `tools/npc-removal.mjs` was failing on Stormhold two ways - the squire NPC (outside a shop) and no
   live level's relics including `shoes` (the former quest's reward, now orphaned). Fixed: removed the squire
   (road-in sign area) and the three HILL FOLK quest strays (Smithy, Tannery, Longhouse); the `quest` field is gone
   from the returned level object; the `shoes` relic is now a direct pickup at (130,7) in the Longhouse rafters -
   master's own exact spot for it once its version dropped the same quest (`git show abcd773:src/level.js` around
   its now-deleted `stormhold()`). `tools/npc-removal.mjs` is green.
2. **THE QUEEN'S LANCE's own boss track**: master's stormhold() played `music: 'lance'` (audio/lance.ogg, "Boss
   Battle #3 [8-bit re-upload]" V3 by nene, CC0) in his arena, benching the generic `musCastle`; that track was added
   to the game after this lane's held branch forked, so its own build never picked it up. Restored.

Diffed master's full deleted `stormhold()` against this build line by line for anything else Stormhold-specific
that could have been lost - his end lookouts/platforms, the rock goblin, the lantern posts and silver on the
bridge, checkpoints, signs, arena tint/fx/trigger, palette. Everything else was already correct: the held branch's
own bridge geometry already matches master's at the same P0-relative offsets (lantern posts at +8/+26/+44/+62/+80/
+98, rock goblin at +92, silver at +71, the Lance himself at +18), and this lane's earlier commit had already
ported the lookouts via `lanceLookouts()` and removed the fire archers. No other regression found. Checkpoints and
section content elsewhere in the town aren't comparable 1:1 (this lane's layout is a different, longer design from
master's flat one, per the brief), so I didn't try to port those - only genuine drops of master's own later fixes.

**Conservative choices taken (Daniel asleep) - flagging both:**
- Placed the `shoes` relic at master's own exact spot (130,7) rather than picking a new hidden spot on the new
  layout, since that rafter/archer perch is unchanged between the two builds (same room, same platforming) and
  reusing a spot Daniel already approved once seemed safer than inventing a new one.
- Did not add a new sign or fanfare where the squire used to stand - the road-in sign right there already covers
  the tower/key rule, and other de-NPC'd levels (checked marsh/burning via `tools/npc-removal.mjs -v`) don't add
  replacement text either, so silence looked like the established pattern rather than a gap.

Checks re-run: `npc-removal`, `stormhold2`, `keys`, `reach storm`, `lance-support`, `elites`, `bells`,
`collectables` - all green. Commit `09da6f0`, pushed to `origin/claude/stormhold2`.
