# claude/deeprails6art - DEEP RAILS 6 ART (Sonnet, 2026-10-31), on branch claude/deeprails6 (continues the greybox; NOT merged, NOT deployed)

Base: claude/deeprails6 a55558ce. Port 6230 (one page at a time; >= 6 GB free each run). Art only: no hit box, timing, tune, cell or level hash touched (stepDrill / great-drill.js / minecart.js
untouched). Files: src/redraw/deeprails6_art.js (the pieces), src/redraw/minecart_art.js (rig calls the new driver; old scar() removed - the new one is exported via deeprails6_art),
src/great-drill-hands.js (gear tags, ore tag, tensionLamps scroll arg, roar bed call), src/minecart-hands.js (decor 'torn' + 'rumble' draw), src/audio.js (drillRoar).

## THE SIX, in order
1. **GOBLIN DRIVER (the cab)** - goblinDriver(): a hand-set 22x15 sprite in the cab glass: mining helm with a lit lamp + rust streak, 3/4 face looking back at you (brows, slit-pupil red
   eyes that glance/blink, flat nose, tusks + snarl), big ears, knotted red rag at the collar (tails flutter), leather jerkin with strap, a hand on a rocking lever, a dark outline against a
   graded amber glass, head bobs a pixel on the engine beat; jammed: slumped, eyes shut, helm over his face, glass bright gold. Head is 13x12 px (was 10x9): the screen is the pixel (the
   canvas is 320x180 / 629x311), so "2x the pixels" is not possible without changing the cab box (gameplay) - the extra pixels all went into the face. Same sprite on the boss card.
   The goblin-cart riders (tub 'gob') were NOT redrawn (only the cab driver was in the default); see Q2.
2. **LEVER + ORE POUR** - leverClunk: a 4-step smear of the swing, ring + spark burst at the stop, gate-head flash; pointsPost left as the greybox. oreStream: the chute hatch drops on a hinge,
   ore chunks (shaded, outlined, gold / copper flecks) go up-and-out clear of the cab glass then straight down the rig's rear face into the gear housing, grit + sparks off the cogs, a red
   glow, BLACK smoke as the gears choke.
3. **SLAG LADLE** - ladleArm: turret + ram + two-joint boom + a bowl that tips to pour on the last 30% of the tell, brimming slag, drips, haze. ladleMark: hazard stripes running along the
   rail + chevrons. slagGlob: wobbling blob, hot core, spark tail. slagPool: rounded runny bead -> crusting plates with orange cracks -> cold scab, bubbles, steam, glow.
4. **P3** - oneRailRubble: two layers of outlined boulders on long-period profiles (two slow swells + per-boulder jitter, hashed per scroll cell: the heap never repeats - Daniel's
   blotch/jitter note), snapped props, twisted rail ends, dust off the crest, still-falling rocks with dust trails while it seals. tensionLamps: cable on staples, caged red lamp every
   40 px (now scrolling with the tunnel), a sweeping beacon cone on every third lamp past half, a red wash on the beat - all quicken as the bar falls. ROAR: audio drillRoar(k) (synth
   saw/sine/noise bed) on a 1.7 -> 0.6 s pulse as tension rises (S.roarT, sound only; falls back to rumble). Synth only - no sample file added (REC map untouched).
5. **THE LEADING BORE** - decor 'torn' drawn at last (tornHigh): the high line's rail dips off split sleepers and snaps, a sloped heap of warm slag-rock climbs to the rock's underside,
   glowing cracks, a snapped prop, a split beam, a twisted rail, dust still coming down ('FALLEN IN' reads above it). scar(): the drill's cutting scars redrawn (fractured rim lit
   upper-left, broken flute rings, chisel marks, steel / hot flecks, spoil at the foot; warmer from col 1322 toward the bore) and BAKED once per (r, column) (0.9 ms -> 0.002 ms a frame).
   boreGlow on the existing 'rumble' decor (1343-1386): an additive haze thickening toward the mouth + lit motes.
6. **GEAR LABELS DECLUTTERED** - one column of plated tags left of the tower (a dark plate under each word, JUMP = a small up-arrow on the plate instead of a second text line, a dotted
   leader to the bank, pushed apart >= 11 px so none overlaps another); the P3 deck bank no longer prints over the cab glass; a broken bank carries no tag; the chute's 'ORE!' word is now a tag in
   the same column (it used to land on DYNAMITE).

## SCREENSHOTS (3x frames + zooms; before = greybox a55558ce rendered with the same script, after = this branch)
work/claude/deeprails6art-shots/before/  and  /after/  (same names): 01-bore-runin, 02-bore-torn-points, 02b-bore-torn-heap, 02c-torn-zoom, 03-bore-low (scar top-left), 04-bore-exam-fork,
05-bore-merge, 06-bore-mouth, 10-drill-idle, 10b-drill-ore-tag, 11-cab-zoom (the driver), 12-ladle-tell, 13-ladle-zoom, 14-ladle-glob-pool, 14b-glob-pool-zoom, 15-lever-comes,
16-lever-pour, 17-pour-zoom, 18-lever-jam, 19-p3-coming, 20-p3-one-rail, 21-p3-tension. Greybox originals: work/claude/lane-done/deeprails6-shots/. (Capture script: work/tmp-deeprails6art/shots.mjs, untracked.)

## CHECKS (all green)
tools/minecart.mjs 615 ok (same count as the greybox; it asserts the lever / ladle / P3 / bore state, not pixels) | tools/minecart-aloft.mjs (static A-E ok) | tools/audio-assets.mjs ok
(drillRoar guarded; SFX call table intact) | a draw-cost probe in the page (work/tmp-deeprails6art/perf.mjs): rubble+lamps 0.29 ms, rig+driver 0.18, ladle+pool+glob 0.15, torn 0.16, scar 0.002,
glow 0.01 per frame (desktop). Screenshots of every state above rendered with no page errors. NOT run (no art baseline covers these, nothing stamped): the full suite, boss-rates (no tune
touched), level-quality / curve / mash re-stamps (not needed: no level or boss numbers changed), minecart-aloft --page (F/G fail on master already), mobile-perf (probe above instead).

## GAMEPLAY CHANGES NEEDED: none made. Draws that would want one: (a) a finer driver than the screen's pixel grid would need a bigger cab window (cab box = hit box); (b) the ore stream
starts at the cab roof hatch because that is where the hands pass it - a hatch on the rig's REAR deck would be truer to "chute" but moves the pass-in point (hands arg only, no gameplay).

## QUESTIONS (rec first)
1. Is the new driver (13x12 head, lamp helm, tusks) the right "finer"? Rec: ship as is; alt: a 2nd frame of animation (a roar when the P3 lamps beat) - small, art-only.
2. Goblin-cart riders (MCA.tub 'gob' / 'caster') were not redrawn (default was the driver first). Rec: next art lane, same method (hand-set sprite + outline), ~20 min.
3. Roar bed is synth only. Rec: keep; alt: layer the CC0 r_rumble clip like drillLunge does (REC map) for a fuller bed - needs a listen on Daniel's speakers.
4. Tags: the column puts every bank's word at the left of the tower. Rec: keep; alt: show a tag only for the bank under your cursor/line (less text, but less read).
