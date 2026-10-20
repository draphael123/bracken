# claude/marsh3 - MARSH WOOD 3 (opus): the raft label, readable pads, +45% level, the Frog King's music

Base: live master 2a360cc5 (BATCH107). Brief: scratch/brief-marsh3-1020.md items 1-4. PORT 8785, one headless Chrome at a time, only my own PIDs
(one hung walker of mine - node 25064 with its serve 19132 and chrome 25288 - was killed by PID after memguard took its page). Helpers in work/tmp-marsh3/ (uncommitted).

## WHAT LANDED

### 4. FROG KING MUSIC - the cause found and fixed (track NOT swapped)
- **Finding:** the arena does point at audio/frogking.ogg and on a fast local line the file plays ~1 s after the intro card. But the game fetched all
  **867 sound clips at once** at audio start (initAudio), and a music file asked for in the first minute queued behind them. Measured with a 1.6 Mbit/s
  DevTools throttle, cold into the court: **frogking.ogg arrived after ~52 s**, and for all that time the audio.js synth loop (the generic C-major
  arpeggio, "a generic theme") played. Any fast arrival at the King (a boss jump, a continue near the court, a slow line, a phone) gets the synth.
  The preload also only started 40 tiles out (~6 s of walking).
- **Fix (src/audio.js, src/main.js):** music fetches `priority: 'high'`; the clips load **8 at a time, priority low, and pause while a music file is
  loading**; the arena track preloads **100 tiles out**; and **a track that has a file now waits for it in silence** - the synth only stands in for
  file-less tracks (synth boss themes, Waymeet, Greenteeth) or a file that failed 3 times (`trackFailed`). Same throttle after the fix: **7.7 s, zero
  synth frames**. New check **tools/music-priority.mjs** (registered in tools/check.mjs).
- **Candidates for Daniel (no downloads done; licences as read in scratch/music-candidates-1019.md):**
  1. "Drums in the Deepwood" - Elyvilon, CC-BY 4.0 (scratch/music-dl-1019/2-2-deepwood-drums.mp3, 3:31) - the pack's aggressive leather-drum title cue.
  2. "Diabolical swamp" - Android128, CC-BY 3.0 (2-3-diabolical-swamp.mp3, 1:14) - the bolder, percussion-led, actually-swampy one (may read synthetic).
  3. "Battle Theme B for RPG" - cynicmusic, CC0 (opengameart.org/content/battle-theme-b-for-rpg, not downloaded) - big orc-style timpani boss cue.
  REC: hear the live fix first (the Cloudmurk cut may now be what he wanted); if still too quiet/ambient, Drums in the Deepwood (same composer/credit line).

### 1. THE RAFT TEXT BOX - centred and pinned
- The CALL RAFT plate (marsh cranks) drew 62x12 by hand with the words' top on its middle row (they hung out of the bottom, a pixel right). Now
  `worldPlateLabel` (main.js) sizes the plate from the ink and centres both ways. **textfit scope `worldplates`** (new issue type OFFCENTRE, hard),
  added to the suite's textfit row in tools/check.mjs; RED on the old drawing, green now.

### 2. READABLE LILY PADS (src/redraw/lilypad.js, main.js)
- Pads are drawn **on the water** (after its surface band - before, the deep water's pale band covered them to a sliver), with a **dark water lip**
  and a **bright rim**. **Two tints:** pads that SINK (the rule, every existing pad) are a warmer yellow-green; pads that HOLD (`firm: true`, new) are
  the cool deep green with a mint rim (they dip 3 px and stay). **The tell:** a sinking pad being stood on wobbles a pixel (faster as it goes) and
  throws ripple rings across the water. `lamp: true` = a firm pad with a marsh light over it (the night stretch). No timing change to existing pads.

### 3. THE LONGER MARSH - +226 columns (502 -> 728, +45%), src/marsh3.js
Opened before THE MUD FLATS (the exam and the court slide right by 226; REVIEW.marsh court pads follow `L.marsh3`).
- **A. THE REED RUN (444-525):** a raft on the CURRENT (new `current: true` raft, main.js `stepCurrentRaft`: board and the water takes her, keeps going
  1 s after a hop, never sails home alone, reset at death). Reed stands stand up out of the channel (low ones to step, tall ones to hop) - without a hop
  they shove you off the back into the biting water. Frogs climb aboard (never out of a stand), a frog on a stand leaps aboard, a spitter on a reed tuft
  over the run, a bowman on a stilt lookout at its end; a silver on the high tuft. Shrine 523.
- **B. THE BOOM (526-595):** a second current raft stops at a LOG BOOM (T.PORT column at her row: she halts at its face, drawn as the marsh's sunk-log
  gate). Step over it, hop a pad chain (firm/sinking mix) to the lever on a stilt deck, strike (lever `say`), hop back, ride on over water the pads never
  cross (the raft passes under the deck). Exam: a thorn four strides into the narrow far bank. Shrine 598. Route forced lever -> back to the raft (L.routeVia).
- **C. THE NIGHT PADS (596-669):** a dark zone (0.74) over a pad crossing: a marsh light over every pad that holds (holes in the dark + the light drawn
  over it), the sinking ones are dark leaves; three river eels in gaps make you WAIT, and only lit pads let you; a spitter on a tuft, a wasp. Shrine 667.
- Banks get stilt walks (bands), all new columns calm (designed foes only). The grove far-bank shrine (440) is dropped (CHECK_DROP) - a shrine per new
  section kept, 6 shrines / 100 route tiles. Stuck-spot guides: ms-reedrun, ms-boom (lever -> back to the raft), ms-night. Walk hint `marsh` (the boom).
- Bot/walker: playtest.js makeBot hops a solid tile in the way while riding; level-walk steers back onto a current raft after a hop.
- Bog Leech NOT built (time went to making the new sections walkable) - question below.

## CHECKS (green unless noted)
level-quality marsh **CLEARS THE BAR** (728 cols, route 600, bands 5/41%, mechanics 7 kinds incl. lever, checks 6/100, density 1.14, route 14 rows);
**solid-islands 0**; signs (2-line fit); marsh2-beats; marsh-exam (exam 667-688); rafts; raft-call; reed-island; lethal-water (LISTED marsh 10 -> 13:
the three new waters); checkpoints; elites; spawns; one-new-foe; hint-shown ('THE BOOM HOLDS HER' routed; the current raft's FROG/DOCKED flavour dropped);
music-priority; music-start; soundtest; boss-music; audio-assets; audio-mix; textfit worldplates; node --check on every touched file.
stuck static + runtime (270 spots, incl. the new ms-reedrun, ms-boom chain lever -> back to the raft, ms-night); textfit worldplates,levelcard --strict 0 problems.
REPORT-ONLY: checkpoint-gaps A10b marsh (DENSE 64/70 between the new shrines - Daniel's "a shrine per section" vs the 100-260 guide).
NOT RUN: the full suite, textfit-full, boss-fight-end, cast-poses.

## RE-STAMPS (with reasons: level hash moved)
- docs/level1-pilot.json marsh: L1 knight **169% hp a run, 2 deaths** (3 runs) - act I band 40-250 (was 102%/0 on the short level).
- docs/level1-curve.json marsh: **158% / 3 deaths** (was 131%/1).
- docs/mash-bot.json marsh: LEVEL then BOSS - level: knight/warden/pyro all die (12-14 deaths); boss **0/6** (boss left 85-100%).

## NUMBERS
- **Walker (campaign L3, human+first, 1 seed per run, several runs while fixing):** the knight clears all three new sections (STUCKs only at the base's
  known 153,17 / 312,17); warden/pyro/paladin runs vary - remaining new-section STUCKs seen: pyro at the reed run's middle stands (490,19) and the far
  bank of the boom (589,19); warden/paladin at the lever deck (567/558). Base spots (85,15 / 97,15 / 153,17 / 312,17 / 355,24 sluice house / 676 gar hole)
  still show. The walker is noisy run to run (600 s frame cap hit on some).
- **Frog King, boss-rates practiced, profile human, flasks kit, L3, 16 seeds:** branch **16/16 12/16 9/16 = 77% (HIGH +7)**; base 2a360cc5 same tool/seeds
  **14/16 12/16 5/16 = 65%**; branch with the level extension switched off 73%; hp 780 trial 75% (reverted - hp is not the lever, the run-to-run
  spread is). **The King's code is untouched**; the shift tracks the seeded random stream (more entities spawned before the fight) and noise
  (~+-3 wins per 48). 8-seed runs: branch 83%, base 67%.

## REDS / KNOWN
- Frog King reads HIGH at 77% on this branch with the boss unchanged (see NUMBERS) - question 1.
- textfit levelcard: two runs died on the page (memguard killed headless pages at 12:41-12:45 under low RAM); the third run (RAM 5 GB) passed: 0 problems.
- Walker STUCKs in the new sections for pyro/warden/paladin on some seeds (above). Humans have the signs + glints; the bots are the weak link.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. FROG KING at 77% with flasks on this branch (65% on base, same seeds; his code untouched). REC + BUILT: leave him (the spread is RNG/noise; a hp
   bump to 780 did nothing measurable) and re-measure on the merged tree at 24 seeds. ALT: shorten his openings (the 7.5% cap -> 6.5%).
2. THE MUSIC: REC hear the fixed Cloudmurk first; ALT swap to Drums in the Deepwood / Diabolical swamp / Battle Theme B (above). Nothing swapped.
3. SHRINES: REC + BUILT a shrine per new section (your brief) and dropped the grove far-bank shrine (440) to keep level-quality's 90 route tiles a shrine.
   ALT: two shrines for the three sections (closer to the 100-260 guide).
4. BOG LEECH: not built. REC: add it in the art/tune lane on the night pads (latches in the dark, roll to shake it off) as the marsh's one new foe.
5. Synth fallback for loading files is now silence (game-wide). REC + BUILT: silence; ALT keep the arpeggio only on the title screen at boot.

## ART NOTES (the sonnet art lane must draw)
1. REED STANDS (src/marsh3.js REED_STANDS, cols 460, 470, 480-481, 491, 501, 510; tops row 17/18 down to the bed): today plain dirt columns - draw
   them as dense bound reed clumps standing out of the water, the raft pushing through them (they are SOLID; the raft passes through visually).
2. THE CURRENT RAFTS (444-520, 530-590): a rougher marsh raft (reed-lashed bog-oak, a pole lashed flat) and a current wake on the water ahead of them.
3. THE LOG BOOM (col 552 rows 18-21): the region's 'sunklogs' gate draws it today - a floating boom of chained logs, and its swing-open state.
4. THE LEVER DECK (569-572 row 17) + lever: a stilt deck on two piles with the lever as a marsh winch/pole; the bowman's lookout (514-518 row 12) and
   the bank stilt walks (row 15 over each new bank) need the marsh2 stilt deck art (marsh2_art WALKS does not list them yet).
5. THE NIGHT PADS (596-669): a night palette for that stretch (moon, darker water), MARSH LIGHTS (src/redraw/lilypad.js drawPadLight is a greybox flame),
   reed tufts at 628/631.
6. PADS (lilypad.js): the two tints, rim and wobble are greybox-quality pixels - keep the read (sink = yellow-olive, hold = cool green, rim, dark lip).
7. The island-posts poles under the reed tufts in the reed run read as bamboo poles - draw them as reed bundles (forest-supports 'marsh' kit).

## FILES
src/audio.js, src/main.js, src/marsh3.js (new), src/redraw/lilypad.js (new), src/level.js, src/checkpoint-thin.js, src/stuck-spots.js, src/hint-lines.js,
src/playtest.js, src/walk-hints.js, tools/music-priority.mjs (new), tools/textfit.mjs, tools/check.mjs, tools/level-walk.mjs, tools/lethal-water.mjs,
docs/level1-pilot.json, docs/level1-curve.json, docs/mash-bot.json.
