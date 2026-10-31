# claude/ft4b - FALLING TOWER 4, LANE B: THE TOWER COMES DOWN AROUND YOU (Opus greybox, level restructure)

Base: claude/ft4a 3dd808be (lane A's level - the hall moved, so the hash had already changed). Brief: scratch/brief-fallingtower4-1029.md section 2,
approved 10-29 16:00 with all 4 recs (+ the 22:49 "go with recs" on lane A's 6). Branch claude/ft4b (worktree bracken-lanes/bracken-ft4b), pushed.
NOT merged, NOT deployed. Greybox: art before live (ft4art paints it). Lane C (living realms) runs beside it off the same base - this lane touched
no realm code (mage-realms.js, undead-mage.js untouched).

## What was built

### 1. THREE ACTS (src/tower-front.js `acts`, src/tower-ascent.js the `ft4` block)
| act | floors | the front | debris |
|---|---|---|---|
| **I. THE FIRST CRACK** (teach) | Library Stacks, Reading Room | **off** - floors still fall behind you as before | 4.4 s |
| **II. IT GIVES** (test) | Observatory, Pendulum Gallery, Alchemy Lab | **on, slow** (16 -> 20 -> 24 px/s, a told surge a floor) | 3.5 s |
| **III. RACE TO THE TOP** (exam) | Bell Loft + Treasury, the Crown, the Outer Face | **on, fast** (24 -> 30 -> 36 px/s), waits for THE BELL FALLS | 2.5 s, **two shadows** (one behind you) |
A banner the first time you enter each act (ACT I - THE FIRST CRACK / ACT II - IT GIVES / ACT III - RACE TO THE TOP).

### 2. THE COLLAPSE FRONT (acts II, III) - src/chase.js's chaser, the spiral stair's proven engine
- A told edge under you: the tower failing (the chase's rock look + band + danger glow + rumble), a **red crack 1 s ahead of its edge** (ft4Draw),
  stone breaking off both walls in a wave. **The camera leads down** to show it (chase autoscroll `show`, the hero keeps 55% of the view ahead).
- **Fair**: rubber band (slow 0.35-0.4x near you), **caps** - it never passes the landing over you until you have stood on it; **over a ride it waits under
  the ride's start** (the observatory's telescope + failing stair + dome, the pendulums, the poison stones, the treasury's tilting floor, the crown walk):
  it only reaches you on a plain stair if you dawdle (the lab's spine, the treasury tiers, the Outer Face).
- **It HURTS (21, about a quarter) and THROWS YOU UP** onto the nearest footing still there (knockTo) - **it never kills**: its blow is `spare`d
  (main.js damagePlayer0: leaves 1 hp) - Daniel's pick #2. Contact holds it back 1.2 s (no chain hits).
- **What it rises past goes**: the floors' tiles clear row by row behind its edge (tower-ascent.js updateTowerAscent `frontY`, floors 2-5 `byFront`;
  replaces "a floor arms when you stand over it" for acts II/III), their rope holes sealed once you are over them; the lean grows as they go (FT2).
- **Safe spot**: a fall into THE DROP / a pit never puts you back on footing the front has taken (main.js updateFt4 moves P.safe over its edge).
- Act II's starts on the observatory's failing stair and stops at **the lab's braced room**; act III's waits for the bell, starts on the bell deck and stops on
  **the Outer Face's top plank** (the finish: THE SNAP). Each braced room: two buttresses either side of the shrine, "THE BUTTRESS HOLDS: BREATHE".
- A plug pillar holds it 8 s (main.js holdDark now holds a running front too).

### 3. FIVE SET PIECES (each told, each changes the route visibly, none a drop-trap)
1. **THE SHELVES GO** (act I, the library's upper stacks): a quake as you reach the 5th-from-top tier; three free-standing bookcases lean + creak 1.0 s
   (their landing red) and go over toward you in sequence, 1.1 s apart (14 a hit). **The last leans on its cracked pillar ('lib-top', new, signed)**:
   strike it and the case lies down as a stair of its shelves from that tier to the rope's - a shortcut past the stair's west turn. The TEACH ramp by
   the library floor (lib-ramp) is kept as it was (brief: keep).
2. **THE DOME COMES IN** (act II, the Observatory): boarding the telescope starts it; the dome's ribs break from the far side (east first), told 1.0 s,
   and land as **two ledges - a second stair from the telescope's low step to its high one** (proved: tools/fallingtower4.mjs, the reach fill with the
   telescope taken away). **FROZEN RIBS** (the queued realm floors: his ice leaks into act II) - they are slick.
3. **THE GALLERY SHEARS** (act II, the Pendulum Gallery): only once you are **on the last pendulum**: a crack runs floor to ceiling (told 2.0 s, red, grit)
   and the far half - the landing + the last tier - **drops two rows**; the pendulum lands you on the sheared half; a body on it rides it down; the rope is
   let down to meet it (the lab is still reached - proved).
4. **THE BELL FALLS** (act III, after the Sexton): the great bell (greybox bronze, hung low enough to be on the screen from the deck) swings, its chain
   and the deck under it go red (told 1.4 s), then it drops, **smashes through the deck** (its bays break - they come back as before) and on down;
   "THE BELL IS DOWN: THE TOWER GOES" - and **act III's front starts**. A death after it: the Sexton stays beaten (B18), the bell re-falls when you come back.
5. **THE OUTER FACE PEELS** (act III): act III's front comes up the face with you; the planks under it come off in the wind (rattle + red when it is
   within 56 px), the top plank (the shrine's) never.
THE SNAP (exists) is the finish line.

### 4. A PILLAR CHOICE - PLUG OR WEAPON (brief #3, with #1's mechanism)
- tower-supports.js: a pillar can have **`sides`** - what a blow does depends on the side you strike it FROM (its ghost shows the outcome for the side you
  stand on); a death stands it undecided again.
- **lab-plug** (the lab's stair, over the well the front comes up): struck from the side you arrive on, its rubble **PLUGS THE WELL - the front holds
  8 s**; walk past it and strike it from the far side and its masonry **comes down on THE ARMOUR** on the landing over you. Signed at the point of use.

### 5. FOUR SHRINES (Daniel #4: 8 -> 4)
- the Observatory's braced room (16,217: act I's end), the Lab's braced room (40,125: act II's end, before the Sexton), the Outer Face's top plank
  (7,56: act III's end), the spiral stair's foot (84,146: before him). The level's START is the library's. Removed: library floor, reading room
  gallery, pendulum gallery, past the Sexton's gate (checkpoint-thin.js pin/drop tables rewritten: the builder places only the four).
- checkpoint-gaps: act II runs **263 route tiles** between braced rooms -> added to its KNOWN list with the reason (Daniel's 8 -> 4).
  level-quality "checks": 4, one per 191 route tiles (>= 90) - clears.

## Checks
- **Node, green:** fallingtower4 (NEW: acts, 4 shrines, fronts' lint + caps + a simulated climb at 2/6/12 s a landing - never caught on a ride, never
  caught climbing briskly, caught when dawdling (front2 5x, front3 16x at 12 s a landing), the ribs a second stair, the shear, shelves, bell, peel, PLUG OR
  WEAPON both sides), fallingtower2, tower-chase (node part; its stair-chase read updated), checkpoint-gaps (act II's 263 tiles KNOWN), checkpoints,
  checkpoint-stand, tower-flyers, **level-quality fallingtower CLEARS** (4 checkpoints, one per 191 route tiles), killzones, deadends, solid-islands,
  tower-cutouts, signs, spawns, floating-geometry, floaters, tells, answer-tags, comments, elites, one-new-foe, collectables, map-spacing, dangling-paths,
  architecture, curve-shape, boss-read, stuck --static, **reach-heroes fallingtower: all 9 heroes route, 0 crossings**, mash-gate (after the re-stamp).
- **Page, green (one browser at a time, RAM checked each time, PORT 6521):** tower-ascent (updated: four shrines, two braced), tower-collapse, chase,
  fallingtower2-keys, hint-shown, stuck (runtime, 350 spots).
- **Page, RED - tower-chase full:** "paladin strikes none of his shots back on the stair" (returned 0 in 72 s). That is lane A's throw-back assert on the
  SPIRAL STAIR, which this lane did not touch (spiral-chase.js / lab.js unchanged); lane A's report already flagged it as thin ("pyro/paladin/reaper 1 each
  ... if it flakes, rec raise the stair bot's try rate, not drop the assert"). Not fixed here (boss-bot code, lane A / ft4tune).
- **Re-stamped (the level hash changed):** docs/level1-pilot.json (knight fresh, 3 runs: **21 deaths**, 66 hits, walked 100% - was 19 / 50),
  docs/level1-curve.json (**15 deaths, 624% hp a run** - was 20; act 4 band 120-600%: over the bare-knight ceiling, report-only in acts III-V as before),
  docs/mash-bot.json fallingtower LEVEL row (L39 warden 8 deaths / pyro 7 deaths, lowest hp 0% - the mash bot does not clear it).
- **Stale, not re-stamped:** curve-gate's campaign-walker row for fallingtower (the walker cannot measure this tower - brief risk 4; flotilla and hurricane
  are stale on the base too). Boss rows untouched: the fight is lane A's and unchanged here (boss rates not re-run - no boss code changed).
- Not run: the full suite, textfit, mobile-perf, pixels, level-walk.
- Frames: the bell greybox does not show in ft4b-bell/ft4b-bell-fall (the deck's red tell does; the bell is hung 5 rows over the deck) - a draw-order or
  position bug to look at in ft4art (the fall logic is proved by fallingtower4).

## Not built (brief section 2 items left - see the questions)
- Pillar choices #2 CHAINS, #4 SHORTCUT AT A COST, #5 FOES USE IT, #6 BRACE OR BREAK (only #3 PLUG OR WEAPON, with #1's which-side mechanism, is built).
- The back wall breaking open to the storm (act II) and his silhouette pacing outside (act III) - art (ft4art).
- The bell physically holing every floor below (it breaks the bell deck; under it is drawn) - no hole you could fall down to a sealed floor (a soft-lock).
- The Sexton's own rework (bells as weapon) - brief: its own mini lane.

## ART TODO (ft4art, sonnet - all greybox now)
- The FRONT: today the chase engine's 'rock' look + red glow (reads as lava in the lab frame): paint it as the tower failing - breaking masonry, dust, a
  ragged stone lip, debris falling into the dark; the red crack line ahead of it (1-px greybox now).
- THE SHELVES GO: the free-standing bookcases (greybox brown boxes with book spines), their lean, their fall (rotation about the foot), lying cases with spilled
  books; the 'held' case leaning on lib-top (its stair is the pillar's 'ramp' resting paint).
- THE DOME's ribs: brass ribs breaking off the dome (greybox slate slab now), lying frozen (rimed blue lines now).
- THE GALLERY SHEARS: the floor-to-ceiling crack (red dashes now), the drop (instant tile swap + shake now: an eased 0.3 s slide would read better).
- THE BELL: a proper great bell + yoke, its swing, the smash through the deck (dust column, splinters), the hollow below.
- THE OUTER FACE PEELS: planks tearing off (greybox plank strip falling now).
- The braced rooms' buttresses (greybox stone posts with iron bands).
- Frames (scratch/lane-reports/): ft4b-shelves, ft4b-shelves-fall, ft4b-shelves-held, ft4b-shelves-stair, ft4b-front2-start, ft4b-dome, ft4b-dome-ribs, ft4b-shear, ft4b-sheared, ft4b-front2-lab, ft4b-bell, ft4b-bell-fall, ft4b-front3, ft4b-peel (.png; greybox, knight, god mode, pieces forced where a ride triggers them). Reviewer (sonnet, read-only): PASS WITH FIXES - fixed: the front never kills (spare), the bell deck told red, the cases wording; the rest are the questions below.

## QUESTIONS FOR DANIEL (rec first; each built as the rec)
1. **More pillar choices?** Built: PLUG OR WEAPON (with the which-side mechanism) + the shelves' held case. Not built: CHAINS, SHORTCUT AT A COST, FOES USE
   IT, BRACE OR BREAK. Your 10-29 16:13 note says falling pillars are OVERUSED. **Rec: stop here** - the set pieces and the front carry the collapse; a
   tower with 9 pillars is already pillar-heavy. Alt: add CHAINS in the dome (one more choice).
2. **Act III has no shrine between the lab and the face's top** (the Sexton, the bell, the treasury, the crown, the face: 167 route tiles - inside the
   200 rule). **Rec: keep 4** (your pick). Alt: a soft "bell down" respawn at the crown's foot (no shrine drawn).
3. **The front's pace:** act II 16->24 px/s, act III 24->36 px/s, 21 a contact, never kills; it waits under every ride. **Rec: keep, tune in ft4tune
   with the level pilot** (21 deaths, was 19; the curve run 15, was 20).
4. **Act II's 263 tiles between braced rooms** (checkpoint-gaps KNOWN). **Rec: keep** (the front never kills). Alt: a 5th shrine on the pendulum gallery.
5. **The bell breaks only the bell deck** (its bays come back as before), not a hole through every floor (a hole down to sealed floors would be a
   soft-lock). **Rec: keep; art draws it smashing on down.**
6. **tower-chase's paladin throw-back red** (lane A's stair assert, untouched here). **Rec: ft4tune raises the stair bot's return try rate** (lane A's rec).
