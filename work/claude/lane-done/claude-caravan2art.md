# Lane report: `claude/caravan2art` (2026-10-10) - THE SUNKEN CARAVAN art pass + the UPPER RUIN ROUTE

Sonnet lane, base master ce20a08d (batch83). Shots: work/claude/caravan2art/{before,after,worm}/ (tools/caravan2art-shots.mjs, tools/caravan2art-worm.mjs).

## 1. UPPER RUIN ROUTE (level change; Daniel accepted it for the art pass)
- Houses 1, 2, 3 are now low towers (the tower idiom: a door at each foot, ledges two rows apart inside, a hatch onto the roof), and the Watchtower
  lost its east crown stub. A ruined VIADUCT of laid stone at row 20 (8+ rows over the sand: out of the sun rule's overhang, so the high road is the
  SUNNY road) runs house1 -> house2 -> the Watchtower's wall (a 2-row hop) and on east over the ox line's first pit; house3's roof has a deck east
  (to 242, short of the first dune's crest - the slide tool probes that column from the top) and west (208-226). One collapsed bay to jump.
  Piers drawn behind the play every <= 6 tiles on firm flat sand (L.facades; tools/architecture.mjs + solid-islands green). Coins on the deck
  (S7), one placed cutthroat on the long run, a sign at house1. Optional: the road under it is still the whole level. calm rects keep the sprinkler
  from putting the garrison on the deck.
- level-quality: **multi-height 18% -> 42%** (bar 40%), caravan CLEARS and is now in GATE. reach-heroes 0 known crossings (all 7 heroes).
- Re-stamped: pilot 187% lost a run / 4 deaths in 3 runs (act-5 band 150-700%, 2-12), curve row, mash level then boss rows (mash 0/6 holds).
- The Dune Worm and his arena are untouched (numbers, hp, ledges): his 10-09 rate (WITH flasks 63%) stands; this lane changed his drawing only.

## 2. ART (src/redraw/caravan2_art.js new; desert_foes.js; main.js hooks; no number, timing or hitbox changed)
- THE SINKING WAGON BED: baked, 3 sink states (afloat / going in / lip only), wheel rim, bows + rag of cloth, iron straps; the lip warning is a row of
  pixels, not a bar.
- THE ROAD'S SLABS: cut sandstone slab tiles (end / mid / single) with a crack and drifted foot; the crumble cracks draw over them as before.
- WRECKAGE AND ROCK (no generic wood/logs): crate stacks + amphora, rock piles, a broken cart wheel, torn tilt-cloth - L.wreckage (visual only, not in
  the level hash), drawn behind the play on firm flat sand clear of doors/signs/pits.
- THE GREAT RIBCAGE (desert2.js bake, previously unused): the landmark behind the sinking wagons' basin (L.ribcages).
- QUICKSAND READS: its own tile set with a mouth (the dune wall drops in) at each end, a whirl, a wet dark body, a bubble, a moving sheen - same zone,
  same rules; the arena's two patches use it too.
- THE DUNE SLIDES: wind-combed ripples baked onto each steep face, a sand spray behind a sliding hero, a lip of grains blowing off each crest.
- THE DUNE WORM: three new frames in bakeDuneWorm (DW_F.stunned head-against-the-ledge with dazed eyes, breathTell rear + swollen throat, breath
  jaws wide); the SAND BREATH is drawn as flickering sand grains (a dotted floor decal tells where it goes first); the WARD is a ring of walking
  pixels (violet = WARDED); GRIT is an ordered-dither vignette; the rising ledges' piers are masonry drawn BEHIND the play; the shade under a
  standing ledge is drawn in the level's one violet.

## Checks (PORT 8809, own server, never the full suite)
Green: caravan, caravan-level, caravan-slides (all heroes), caravan-worms, headless floats ("pixels"), dune-worm, boss-openings, desert-ledge-art,
solid-islands, dressing, reach-heroes, level-reach, level-quality (caravan clears; its one other miss is MINECART's curve, not this lane), curve-gate,
mash-gate, textfit --strict, signs, corpses, architecture.
Not green and not this lane: tools/mobile-perf.mjs "map ran at 22.6 fps (budget 40)" - the PC was loaded (several lanes + stamping); the map is untouched.

## QUESTIONS FOR DANIEL (rec first)
1. The high road is in the sun with a looter on it: it pays coin and the sun back only under the viaduct. Rec (built): leave as is; if you want
   it kinder, add an awning on the long run.
2. The viaduct stops 4 tiles short of the first dune because tools probe the crest column from the top. Rec (built): fine.
3. Quicksand "teach -> exam" is told by signs + the encounters (10-09), not by a tint; rec: leave, or a deeper tint in the exam's pits (art only).

## Finish pass (10-10 late)
- Resumed after the failed session: committed the leftover work (ledge shade drawn under the Dune Worm's ledges; viaduct east of house3 shortened to 9 so it stops short of the first dune crest; caravan added to level-quality GATE), then re-stamped pilot, curve, mash level and mash boss rows. level-quality: CARAVAN CLEARS (multi-height 42%, curve 170% / 3 deaths, 5 checkpoints). curve-gate and mash-gate green.
- Re-ran all of caravan, caravan-level, caravan-slides, caravan-worms, solid-islands, dressing, signs, corpses, reach-heroes, level-reach, textfit --strict: green (textfit showed one COLLIDE/OVERDRAWN on boss_fight_hanging_mini once, a flake: clean on rerun, not this lane). mobile-perf green this run (the earlier 22.6 fps was machine load). There is no tools/pixels.mjs in this tree; pixel checks run inside caravan.mjs and headless floats.
