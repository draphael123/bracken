# claude/colart - GLASS COLOSSUS ART (sonnet, art + draw code only)
Base claude/colossusrework d97c1cc2. Collision, hp, damage, timing, level data untouched (no hash moved).

## DRAWN (all of the ## ART list)
1. STRIDE: poseOf 'walk' rewritten (art values only): front foot slides back after landing, lifts 14 px, swings out, lands on the footfall; rear foot hops/drags; arms counter-swing by step parity; sawtooth-free. Footfall dust + glass chips + shock streak at the landing foot, sole sparks on the planted foot, dust at both heels in walkTell. Holds' slabs ease to his centre in DRAWING (tiles still re-lay by column).
2. GAZE: both eyes flare (bloom, star, inward rings in the tell); faint aim line; live: cone of light eye->spot, white-hot spot with heat bloom + embers, cooling slag trail (only where lit); real shadow wedges behind every disc (promise in the tell, solid in the sweep) with a lit edge; a facing disc glints (starburst, thrown sparks); shaded disc takes a dim beam.
3. SHARD LUNGE: glass spear grows out of his fist in lungeTell (tip up-back, comes round onto the mark, trembles), flies in 0.07 s on release, embeds, shatters; spikes erupt over the mark; on a mirror the disc cracks and flies glass.
4. Four arena fires are Glass Sea BRAZIERS (bronze bowl, glass-lump fuel; the flame leans into its mirror and burns tall when that mirror is TO THE FIRE); TOO FAR FROM HIM gets a dim brazier->disc run and a fading beam stub (fire: along the floor; dawn: skyward).
5. Tool: tools/colossus-art-shots.mjs (+braziers, toofar, toofar3, a `look` option); tools/colossus-art-cost.mjs (new, arena ms/frame).
Files: src/redraw/glass_colossus_art.js, src/glass-colossus-hands.js, src/glass-colossus.js (poseOf walk only), src/glass-sea-hands.js (arena fires -> brazier).

## SHOTS: work/claude/shots/colart/ contact-stills.png, contact-strips.png (before | after), before/ before2/ after/.

## SELF-GRADE: B. New pieces each have windup + release (B16), read the same colours/marks (B10). Soft spots: the stride is subtle at game scale (a crab-step on a front-on sprite), the lunge spikes are busy over the mirror, gaze shadow wedge is large for a facing disc at the far wall.

## CHECKS (all green)
glasssea 153 ok, glasssea-aloft ok, colossus-respawn OK, boss-read ok, tells ok, mark-integrity MI_ONLY=colossus ok (lungeTell not reached by the bot in 110 s - phase 1 only; gaze/walk posed 3/3), boss-fight-end 62/62.
Mobile-perf spot (tools/colossus-art-cost.mjs, 4x CPU, noisy shared PC): idle/walk/gaze/lunge medians 8-27 ms, p90 10-40 ms, same as the d97c1cc2 baseline. textfit not run: no text strings or scopes touched.
Reds: none.

## QUESTIONS FOR DANIEL
1. The gaze shadow for a FACING disc runs to the wall (matches the rule) and reads as a big dark slab. Rec: keep, it is the safe zone; alt: fade it faster.
2. Mark-integrity cannot see lungeTell (bot never reaches phase 2 in 40-110 s). Rec: a later bot/phase-forcing option.
