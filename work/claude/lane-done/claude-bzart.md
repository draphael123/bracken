# claude/bzart - BERSERKER 2 ART (Sonnet, 2026-10-11) - branch claude/bzart off claude/berserker2 c3d128db

## Drawn (src/chars.js bakeBerserkerHero; every placeholder alias from berserker2 is gone)
- bzFlurryL (bearded axe, quick down-chop) / bzFlurryR (hatchet, low rising backhand), 5 frames each, smear beats added; bzCross 5 frames (heads cross in front); `ripo` 3 frames redrawn AS the cross-chop.
- bzAirSpin 5 (both axes carried round a circle), bzPlunge 2 (heads under his boots, crossing), bzTake 2 (crossed X at the chest; absorb shudder + sparks), bzCoil 3, bzPounce 2, bzPLand 2 (crouch-c.js now picks frame 0 then 1 by pounceRec), bzWhet 4 (bearded axe flat, hatchet dragged along it, sparks; one-handed: a whetstone in the off hand).
- One-axe (bare) set: every key above bakes with the off axe absent (flurryR = flurryL, whet = stone); sheet has BARE rows.
- THE BODY: braid + bead behind the ear, plaited beard with a bead, bone necklace + trophy tooth, fur pelt hanging at the back, laced leather kilt, blue war-paint bands along both arms (bzArmInk), TWO DIFFERENT AXES (bearded axe lead; HATCHET off hand: short pale haft, red cord, small straight dark head). Drinks, 3 dances, follow-through, skins/tiers untouched and green.
- RAGE STATE: red eyes + red veins on the arms = a pixel list c.rgo carried on each frame (no canvas, no extra bake cost: heroSet bake 280 ms, same as base), laid over the frame by drawSet while BZK.raging() (rage >= 50 or frenzy); steam breath puffs (berserker.js draw) at rage >= 50.
- REND notches: diagonal gashes cut into the foe's flank (a stack each, fading); CRACKED: a jagged crack across the foe + three shards (0.55 s). TAKE IT flash: gold/white starburst growing over the beat window, small orange flicker while held (berserker.js draw).
## Code item (Daniel 10-11): FRENZY = DOWN+C at full rage (src/berserker.js); plain C at full rage is TAKE IT. Text updated: hero pick line, pick desc, BZ_TEACH, HUD tag 'FRENZY: DOWN+C', controls row, crouch hint ('... FULL RAGE: DOWN + C.'), yard station text + pad hint, moves list (scratch/brief-moves.md), tools/berserker.mjs (presses DOWN; waits 60 frames after the duck before the rend chops - the 30-frame wait left him standing up and cost a crack, 2 of 3 runs).
## Checks (PORT 8853, one at a time)
- GREEN: berserker (after the wait fix, 2/2), riposte, ability-poses 69/69, dances, weapon-skins (1168 bakes), flasks2 (drink), pixels (headless floats: 46 levels, 2963 sprites), textfit pick/menu/hud/hints --strict (0 issues), modulepreload (0 not listed).
- Hero fingerprints (hero-keys-strip timing JSON, mine vs a detached base worktree c3d128db): warden byte-identical; knight, pyro, paladin, pirate, reaper, geomancer differ only in tick dt jitter (e.g. 0.108 vs 0.096) - the same run-to-run noise berserker2 reported; no box or cost moved. Every shared edit is gated on his body (BODY_REF === BZ_BODY).
- mark-integrity: 1 phantom (undeadmage markTell) - base also has one (undeadmage poisonTell), flaky, not his.
- mobile-perf: FAILS on mine AND on base under load from the other lanes (title/map/wood frames 900-1700 ms); bake cost measured directly instead = equal to base.
## Notes for the next lanes
- The lab bot taps C only, so at a full bar it now TAKES IT instead of frenzying (it used to frenzy). boss-rates for him will read lower until the bot presses DOWN+C at full rage (one-line in src/lab.js ~l.1763); tune lane should decide.
- Sheet: work/claude/shots/bzart/sheet.png (main, RAGE, BARE, BARE RAGE rows); pick shot: work/claude/shots/bzart/pick.png.
## QUESTIONS FOR DANIEL (rec first)
1. Lab bot at full rage: make it hold DOWN+C (frenzy) like a player? Rec: yes, in the tune lane (kept out of this art lane so no rates move).
2. Hatchet reads as a long thin stick in flurryR at 1x (arm + haft). Rec: keep; or shorten that frame's off-arm in a polish pass.
