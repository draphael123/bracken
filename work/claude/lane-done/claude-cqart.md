# claude/cqart - CISTERN QUEEN art pass (art + draw code only)

Base claude/cqueenrework 4cfe8edb. No collision, hp, damage or timing changed (only a draw-only view tweak: reel rot -0.18 -> -0.24, tx -8 -> -10; she has no stinger target while broken). Level hash unchanged.

## Drawn (src/redraw/cistern_queen_art.js, src/cistern-queen-hands.js)
1. HOT: ember-orange shell palette, a glow under the plates, every seam open and burning (dark-red lip / orange / pale core), white-hot back rim, cracks across tail joints, tapered flame tongues (were candles), seams sink to dull red as the burn runs out.
2. DOUSED: dark cool wet shell, sheen on each plate, beads, runnels, swelling drops on the belly, falling drops in world-gravity, floor rings.
3. BLACKENED: ash-grey palette, black fissures, ash flakes, a dying ember in the cracks, smoke wisps + falling ash + a grey clock.
4. STINGER BROKEN: a torn, jagged stump (pale flesh, dark core, glint), venom welling and dripping; a white snap star on the first beat of the reel.
5. REEL (B16): own frame - near claw flung over her shoulder, far claw wide and low, both gaping; front legs snatched up, back legs buckled, tremor; flash only on the first beat.
6. WELLHEAD: dressed-stone lintel (courses, joints, relief, rope groove, drip moulding, end blocks), a stone curb with iron band, iron cheek-plate frame with a turning sheave, a stave bucket with hoops/bail that lands on the curb and TIPS its water: stream, splash, the lintel darkens and runs wet, runnels and drips off both edges, drying over ~6 s. PERCH stance: legs crouched wide with toes hooked over the lip (legs 'perch').
7. Steel vs gold: the free stinger is capped in a steel sleeve + two rivetted plates when armoured (bare when HOT / stuck / open); the ring differs by SHAPE: gold = round pulsing ring + star, steel = four cold corner-brackets + a sliding glint. Checked at 1x/2x in the contact sheet (15a-c).
8. Sound: SFX.stingerBreak (src/audio.js) = CC0 imp_bone deep-crack pool (Zane Little, already on disk) at two pitches + crumble + a sharp tick; the break now calls c.sound('stingBreak'). No downloads.

Contact sheet: work/claude/shots/cqart/after/contact.png (all frames, 'before' alongside in .../before). Tool: tools/cqart-shots.mjs (PORT=n node tools/cqart-shots.mjs after).

## Grade (polish scorecard): B
B10 shared read kept (gold = pays, steel = armoured, gold ring on open, clocks). B16 reel + perch own frames. Held at B, not A: the DOUSED shell reads a little muted/grey; the perch tail clips the top of the boss camera (framing, not touched); no animated tilt of the bucket beyond ~1.2 s.

## Checks (PORT 8896, one browser at a time)
GREEN: cistern-queen (147), underwell, boss-read, tells, mark-integrity (the Archmage red from the rework report is not present here), boss-fight-end (62/62), mobile-perf (redgorge spot, in budget).
NOT GREEN / NOT RUN: textfit --strict aborted on its own scope timeout (talk[warden] 481 s on a busy PC); I added no new words, so nothing of mine to fit. `pixels` tool does not exist on this base - not run.

## QUESTIONS FOR DANIEL
1. The perch puts her tail above the top of the boss camera; rec: raise the arena camera ~24 px while she is on the wellhead (a gameplay/camera lane, not built).
2. DOUSED palette: rec leave; alternative a more saturated blue shell.
