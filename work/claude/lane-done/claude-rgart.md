# claude/rgart - RED GORGE ART (the rework's ART needs)

Base: claude/redgorgerework 21f2dba5. Art + draw code only: no collision, hp, damage, timing or level change (src/level.js, src/red-gorge.js, src/raptor-matriarch.js untouched, so the level hash is unchanged).
Pictures: `work/claude/shots/rgart/before/` and `after/` (made with `tools/rgart-shots.mjs <before|after>`), the side-by-side `contact-sheet.png` (`tools/rgart-sheet.mjs`), and her new frames `cast-new.png` (`tools/redgorge2-cast-sheet.mjs`).

## What was drawn
- **Standpipe baskets** (`src/redraw/matriarch_sluice.js`): a coursed stone column with iron bands, a bronze spout cap and a glass sight-tube, on the CHANNEL side of each basket (so it clears bridge A's mast and cairn on the bank side; the basket deck draws in front of the bridge it rises past). A brass pressure GAUGE whose needle falls as the charge drains (red zone low), a stone culvert at the foot, the water column the deck rides (lit edges, rising bubbles), a plank deck with iron-shod ends and a rope cradle to a ring and hook, side rails. Replaces the placeholder boxes.
- **The sluice WAVE** is a foam wall: a steep face, curling lip, spray flung ahead, a long wash behind, streaks and bubbles.
- **Lever marker + line:** a gold key-cap badge with a pixel E over a pointer (`LEVER` / `PULL (E)` text unchanged), a pulse ring when it is the one to pull; the lever-to-her line is marching gold dashes with chevrons toward her, a reticle at her feet, dots down the lever's post.
- **Her frames (B16, `src/redraw/matriarch_cast.js`):** TUMBLE (8-frame cartwheel with a native-pixel rotate, wings flailing, beak wide; used for the knock-off flight and the bridge-cut fall) + TUMBLEEND (brace, squat); THE LURE (her own low crouch at you: trailing wing, gold calm eye, claw curling you in - it no longer wears the pounce's red-eyed crouch); THE SURGE CALL (stamp, head thrown at the dam, water-blue eyes, spray - it shared the screech); STUNNED (soaked, crest plastered, water running off - it shared `down` with staggered/tangled, which stay dry).
- **The Spillway** (`src/redraw/spillway_art.js`):
  - Backdrop (cols 46-95): the dam's masonry face above row 32 (courses, iron ties, weeps, crenelled crown, a heavy cornice at its foot), raw red rock strata below, a basin shade; the dry stained SPILLWAY CHUTE down the channel columns (weir lip, kerb stones, polished slabs, tide-lines, salt crust, dried slime, a cracked stilling floor).
  - Crest: a timber davit with a sheave over the lip and the rope run through it, rope-burn scuffs, a spare coil.
  - sp3: a timber crane on the head's edge and a link CHAIN from the paddle wheel's cog up to its sheave (the chain marches when the wheel runs). Any basket hung more than 4 tiles from its water-wheel gets this.
  - Head shelf: flagstone paving; stone corbel slabs for ledges in the masonry; her door gets a carved lintel, a pier with talon scars, hung plumes and bones; the basin floor under the chute gets a scoured apron.

## Self-grade on the polish scorecard: B
KIT 2 (own tiles + wall), PAL 2, PLAT 2 (baskets/crane/davit read as the machine), LMK 2 (door, davit, crane), SET 2, DRESS 1, LIGHT 1, AMB 1 (no new ambience), THEME 2 = 15/18. Held to B, not A: not hand-played (stills only), the red-rock backdrop and the basin apron are the plainest parts, and her tumble was seen on the sheet and in one forced still, not in a live knock-off.

## Checks
- Pass: tools/redgorge.mjs, tools/raptor-matriarch.mjs, boss-read, tells.
- mark-integrity: only the known `undeadmage|poisonTell` PHANTOM (not mine; the matriarch rows are posed and land).
- boss-fight-end: 62/62 pass.
- textfit: started (TEXTFIT_PAGES=1 --strict) but did not finish within 25 min on the loaded PC and was stopped. No new words were added (LEVER / PULL (E) / UP unchanged, the E is drawn in pixels), so nothing new to fit.
- mobile-perf spot: NOT run (PC memory, and a suite was due). Everything new is baked once (the wall, tiles) or a few fillRects per frame; the wave and baskets are about 100 rects. Worth a frame-cost run on the Spillway.

## UNVERIFIED / notes
- Stills only. The tumble is in the game only through `S.fly.then === 'knocked'` and mode `falling`; checked on a forced fly.
- Pre-existing, not touched: her left-facing frames are mirrored about the canvas centre while the anchor is AX=80 (the body is ~16 px off the right-facing one). Cosmetic; a fix would be a mirrored anchor in `drawBoss`.

## QUESTIONS FOR DANIEL
1. Do you want her left/right body offset (above) fixed? Rec: yes, a one-line change; not done here because her hit/draw alignment was tuned with it.
2. The backdrop above the dam's crown (rows < 12) is still the generic sunset sky. Rec: keep (it reads as the open sky over the basin).
