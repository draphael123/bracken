# HC3ART - Highcrown 3 + the Goblin Princess art pass (sonnet, code-only) - claude/highcrown3

Code tip **89b3881bc** (pushed; a report commit follows it). NOT merged to master, NOT deployed. Art before live: the browser proof below is still owed.

## Merge
`claude/gq2mech` (70315f94e) merged into highcrown3 (bf2496329). Conflicts:
- src/bell-winch.js (add/add): the two versions differed ONLY in two header-comment lines (tool names), so gq2mech's version was taken. No API difference; highcrown3's callers (goblin-princess.js) untouched; gprincess (109 asserts), tools/bell-winch.mjs and gq2mech all green on it.
- src/main.js, 3 hunks: imports (kept gq2mech's FVR import plus the GPM/BWM line); EHP (kept `gprincess`, took gq2mech's chief 540); gatebell/lancebell props (kept gq2mech's storm-ledge offset plus the `murderhole` case).
- tools/check.mjs: node list keeps `bell-winch` and `gprincess`, adds `hc3art-sheet`.

## Drawn (all in code, px.js primitives only; level hash UNCHANGED - drawing only)
- **THE GOBLIN PRINCESS** (src/redraw/goblin_princess_art.js, 34 frames 54x46, faces right, hit box 12x20, last frame = hurt for HAS_HURT): a small green goblin, pink gown with the Queen's purple sash, gold tiara with gems, pony-tail and bun, long ears, rapier, fan, gem purse.
  Frames: 0-1 idle, 2-5 run, 6-7 lunge told/release (glint on the tip), 8-10 flurry told + two pokes, 11-12 trinket told/toss, 13-14 fan told/gust, 15-16 hop told/air, 17-18 tiara off the head / thrown, 19-20 stomp told/stomp, 21-22 preen, 23 PINNED (cowering behind the dropped bars), 24 STUNNED (crooked tiara, spiral eyes, stars), 25 stagger, 26-27 flee/bolt, 28 hide, 29 perch, 30 escape (MOTHER!), 31 defeat (sat down crying, tiara on the floor), 32 the chase's handbell, 33 hurt.
  `gpFrame(e)` maps every mode (replaces the greybox's borrowed soldier sheet + drawn gown). Parts: cut gems that glint, the tumbling tiara (green-white once parried), the stomp ripple, the fan gust.
- **BATTLEMENTS** (src/redraw/hc3_art.js): far wards/ridges with lit windows and Queen's banners under a snow haze (parallax 0.35, behind the facades); the wall-walk PARAPET (merlons + crenels on the world grid, snow caps, loops, drifts, courses; ragged stumps at the broken stretch, rubble on the lower walk); the TWO ALARM TOWERS dressed (machicolation course with murder slots, arch springers at both passage mouths, archers' loops, Queen's crown banners).
- **BELL TOWER**: belfry arches with louvres and a dark bell, cornice, finial + pennant; her roof HATCH (iron-strapped oak, or open to the night with a rope ladder - open while she escapes).
- **Props (state-driven, in goblin-princess.js drawWorld)**: GUARDROOM DOOR (shut oak / raised on a dark guardroom with ember light + helmets / iron gate dropped with sparks; horn bar as a gilt pennant), WINCH BOX (stone cheeks, banded drum, 4-pose crank, chain run to its door, 3 pips for the blows), cast-bronze ALARM BELL (swings while sounding), the banquet's BELL ROPE (a bell in the vault + hemp rope with a knotted grip, swings when rung), the TOWER BELL over its grate (+ rope run along the ceiling to the wall pull), the grate's told column reuses HC2A.drawGrateFx, the 6 MURDER HOLES (iron-lipped slot, loaded glow, pull-chain with grip, a cut stone that tumbles with dust).
- **ROOMS** (keyed off the existing 'royal' interiors, so no level data moved): CAPTAINS HALL (ashlar, corbel table, iron-plated dado, pilasters, lancets, purple / goblin-green banners, shields, crossed pikes) and BANQUET HALL (vault cornice, arcade of tall windows, great hearth with animated fire, Queen's banners, plate rack by the servery).
- **BAKEHOUSE YARD**: stone beehive ovens (glow, soot, flue), flour sacks with the goblin brand, iron cooling racks (black loaves), a quenching trough (steam) at 7 spots on the existing ledges/floors. No wood/logs; timber only on doors, the hatch and winch drums.
- Hooks (main.js, all `L.hc3`-gated, try/catch with the greybox as fallback): far pass before facades, parapet after, front pass (towers, belfry, rubble, yard), paintRoom, murder holes, SPR.gprincess = GPA.sheet() + HAS_HURT.

## Bake tool / sheet
`node tools/hc3art-sheet.mjs [out.png]` (no browser; uses tools/node-canvas.mjs) writes `work/claude/lane-done/hc3art-sheet.png` (all 34 frames x2) and `hc3art-sheet-world.png` (doors, winch, bell, rope, hatch, murder holes, yard, Princess parts, battlements, broken stretch, bell tower top, both halls).
Lints: every frame drawn at one size, no two frames identical, white-flash silhouette == sprite, windup frame != release frame for all 7 moves (B16), every mode maps to a valid frame. Registered in tools/check.mjs. Copies in scratch\lane-reports\hc3art-sheet*.png.

## Node results (one at a time, free RAM 5.4 GB; no browser/cdp/puppeteer used - sources checked first)
`node --check` main.js, goblin-princess.js, hc3_art.js, goblin_princess_art.js, check.mjs, hc3art-sheet.mjs: ok.
exit 0: gprincess (109), gq2mech, bell-winch, hc3art-sheet, crown-exam, gqueen3, boss-read, tells, comments, goblin-lint, architecture, anchor-lint, dangling-paths, signs, answer-tags, checkpoint-gaps, floaters, elites, ambush-reach; `level-quality.mjs crown`: clears the bar.
**Red, inherited (not mine):** `tools/blow-tags.mjs` fails on `hurtEnemy0: frogTake(e)` - frogking2's `frogTake` (batch151 side, arrived with the gq2mech merge) calls a boss hook without the blow tag; it was green on highcrown3 before the merge. The fix belongs to the frogking lane.

## OWED
- **Browser stills** (one page, outside a gate): her 34 frames in the fight and the chase (size / feet alignment vs the old soldier box, hurt flash, hurt = last frame), the battlements from the stair (far wards, parapet height vs hero height - 26 px, merlon/crenel rhythm, snow), both towers (arches, banners, door/winch/bell states: shut, raised + horn, gate down), the broken stretch, the bell tower (belfry, bell over the grate, rope run, hatch open on escape), the banquet (hearth, rope + bell, servery door + winch, plate rack by 510), the Captains Hall, a bakehouse oven set at 264/309/322, murder holes loaded / spent / falling.
- **level-quality** page parts, mobile-perf crown scene (far strip = 1 drawImage x2, rooms = one baked image each, parapet ~12 rects per 16 px) and textfit for the plate/name.
- **n=6 Princess tune WITH flasks** (crown:mini 60-70%): no numbers touched by this lane; still owed from highcrown3.
- Not drawn / weak: no tile-level portcullis for the guardroom gates (background doors, by design); the Princess cameo in the Queen's intro; mini music/SFX; the tower roofs are the existing conical facade plus the new cornice/banners (no new roof kit); frames 16 (hop), 23/28 (pinned/hide) read but are plainer than the rest; she is still visible in her tower during the chase (owed: hide until chaseDone, highcrown3 q7).

## Questions (rec first)
1. The Captains Hall / Banquet room art is keyed off the 'royal' interiors' west columns (K.CAPT 431, K.BANQ 479 in hc3_art.js). Rec: keep; if the level is re-shifted update K (a crown-exam assert tying K to the built level is a cheap follow-up).
2. Bakehouse oven positions are hard-coded columns (K.YARD) on the current ledges. Rec: keep; the proof lane should check none clips a ledge tile above it.
