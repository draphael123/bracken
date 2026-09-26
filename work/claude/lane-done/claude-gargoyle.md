# Lane claude/gargoyle: THE GATE GARGOYLE, reworked (2026-09-25/26)

Daniel, after playing the Witchlight Stair: "The boss needs to be much further zoomed out, and the platforms don't need to be quite
as high up. I'd like the boss to be bigger, and also be able to smash through platforms and fall on the floor and get stunned if
he does this." Brief: `docs/briefs/gargoyle-rework.md`.

## Commits
- f632fcc: the brief.
- cad7945: the tools first. `gargoyle-pilot` gained --refill, --secs, --heroes all and its own roll per pass (opts.seed; before
  this, every pass replayed pass one). `gargoyle-shots` captures the fight. `gargoyle-smash` is the new check: **red on the old
  code, 16 of 22 failing** (`work/gargoyle/smash-check-on-old-code.log`).
- d0f6100: the rework itself, with boss-openings and witchlight updated and gargoyle-smash added to the list.
- 849bc63: the after pilot.
- 159f445: merged origin/master (b3dec71). check.mjs kept every name from both sides (163: uphill and deep-descent from master,
  gargoyle-smash from here). This merge commit uses git's default message, so it has no Co-Authored-By line.
- The commit that adds this report.

## What I built
1. **Zoomed out.** `setView('zoom')` when he wakes, and 'gargoyle' added to `desiredView()`. `render()` calls desiredView every
   frame, so a zoom set only at the wake was gone by the next drawn frame. The new check caught this: it failed until the fix.
   In the fight, the camera follows `gargCam`. It frames you and him together, weighted towards you, always keeps you in view,
   and keeps the garden floor in view while you are over it.
2. **A compressed room.** The arena is **44 tiles (c 346-390), down from 79**. The tower's foot moved in to c 391 and the level
   now ends at 395 wide. There are **six slabs, 6-7 rows over the garden floor (they were 11-13)**, three of them cracked. The
   arena's lip and his perch came down with them (`WL.TOP` and `WL.PERCH`). No gap between slabs is over 3 tiles. Three rune
   columns lift you from the floor back up (c 361, 374, 382). Nothing else on the stair moved.
3. **Bigger.** He is **45 px, up from 30**, redrawn at K = 1.5 on a 132x100 sheet rather than scaled up. His wing fingers are
   2 px bone, the horns are ridged, each foot has three claws, and there is a neck, so a raised head no longer floats. He has
   two new poses: **STUNNED** (sprawled on the floor, witchlight dim, the slab in pieces around him) and **CRASH**.
   Everything that reads his size goes through `GARG.K`: hitbox, dive reach, mouth, gust, hover and marks. E6 is checked: no
   frame touches the top or sides of its canvas.
4. **Smashes through (A11).** His dive now lands one of two ways:
   - **You are still on the slab:** he hits you and lands on it.
   - **You left it late:** nobody takes his weight. For 0.24 s a crack runs across the slab, then it breaks. He **crashes to
     the garden floor, STUNNED for 2.5 s, and every blow counts double**. Anyone under the slab takes 12.
   - **Any slab breaks.** `GARG.smashAny = true`; set it to false and only cracked slabs break.
   - **Slabs grow back.** A broken slab returns after **6 s (11 s in phase two)**, and at least **three slabs always stand**.
   - **Tells (C1):** the red shadow on the slab; a second shadow on the floor under it once the slab is empty; the spreading
     crack; the crash (shake, rubble, dust ring); and a green ring with circling stars plus a bar showing the stun time left.
     A broken slab shows as a dotted outline that brightens in its last second before it returns.
   - The hang is gone. The bestiary text says the new rule.
5. **The bot** leaves the slab late, drops off its edge to him when he is down, cuts him on the floor, and climbs back up a
   rune column when he rises.

## Before and after (bossLab, refill, 150 s cap, 3 rolls, 7 heroes = 21 fights)
| | wins | median win | median taken | taken per minute | openings per fight |
|---|---|---|---|---|---|
| BEFORE (the hang) | 13/21 (Warden 0/3, Reaper 1/3) | 105.5 s | 112 | 49 | 3 |
| AFTER (smash and stun) | **21/21** | **61.6 s** | 64 | 54 | 5 |

His danger per minute is about the same, and the bot now takes some hits from the crash and while he is stunned. What changed
is that his opening can be caused every time and is worth more, so every hero kills him, in about 40% less time.
Logs: `work/gargoyle/pilot-{before,after}.{log,json}`.
Captures: `work/gargoyle/before-*.png` (320x180) and `after-*.png` (the zoomed 629x311 view: wake, dive tell, smash, stunned).

## Checks (named, not the suite), after the merge: 22 of 22 green
gargoyle-smash (new), witchlight, boss-openings, boss-fight-end, arena-supplies, tells, mini-names, floaters, architecture,
footing-art, checkpoint-stand, checkpoints, audit, content-audit, textfit, readability, ore-road, comments, syntax, homepaths,
dangling-paths, one-new-foe. `tools/queue-bosses.mjs`, which is not in the list, also passes (12 frames, 132x100, anchor OK).
Log: `work/gargoyle/checks-final.log`.

Two rules in the older checks had to change, not just their numbers:
- witchlight's "the slabs are reached" was really checking "anything in the arena at row 31 or higher". It passed because of the
  lip, never because of the slabs; the reach model does not ride slabs. It now reads the lip from `WL.TOP`, and gargoyle-smash
  asks about the slab chain itself (gaps of at most 3, and the columns reach past it).
- witchlight's "10 slabs, 8 rows up" is now "6 slabs, 6 rows up", matching the new room.

## UNVERIFIED
- **Nobody has played it by hand.** The feel of the crash and of dropping to punish him, how the camera moves, and whether 2.5 s
  is long enough for a person rather than a bot all need a real play.
- The zoomed view was measured only at 1280x720 (629x311). gargCam is tested in Node at 480x270, 512x288 and 640x360.
- The normal-health pilot (one life) was not re-run. Only the refill pilot the brief asked for was.
- The new frames were checked on Node contact sheets and in one page capture each, not watched in motion.
- At the right edge of the zoomed view, the backdrop tower art sits over the arena. That is a look question for Daniel.

## Found in passing, not fixed (outside this lane)
- **Ten bosses switch to the zoomed view at their wake but are not in `desiredView()`**, so render() puts them back to normal on
  the next drawn frame: harbormaster, pyromancer, bellcrab, closedhelm, drownedking, prince, grandmother, troll, strawking,
  archmage. It is the same bug I fixed for the Gargoyle. One-line fix each, but it changes how ten fights look, so it needs
  Daniel's OK.

## QUESTIONS FOR DANIEL
1. **He is now much easier to kill: bots win 21/21 in about a minute, where they won 13/21 in about 1:45.** The opening is
   reliable and pays double. Recommendation: play it first. If it is too easy, shorten the stun (2.5 s to 2 s) or make only
   cracked slabs break (`GARG.smashAny = false`), rather than giving him more health.
2. **Any slab, or only cracked ones?** It is set to any, as you asked. Recommendation: keep any. It reads more clearly, and the
   cracked slabs still work as held-still footing.
3. **The ten other bosses that lose their zoom** (list above): turn it on for all of them? Recommendation: yes, as one small
   separate change with a check that every boss zoomed at its wake is also in desiredView.
4. **Slab regrowth of 6 s, and 11 s in phase two:** does the room feel short of footing in phase two? Recommendation: leave it
   until you have played it.
