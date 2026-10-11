# claude/riposteart: THE RIPOSTE'S ART (Sonnet, 2026-10-11), on claude/riposte 8364480c

All 8 art items + the MIXED UP fold. Port 8838. Sheets: work/claude/shots/riposteart/sheet.png (baked parry x2 + riposte x3 frames, 8 heroes), live.png (in-game, real input), hud.png (pips, P2 tab, poise bar, boss reads).

1. PARRY POSE x8: `F.parry` (catch frame 0.09 s, hold) per hero in src/chars.js `riposteKit` (knight shield + star, warden turned shaft, berserker crossed axes, paladin aegis maul + halo, pyro palm/flare, geomancer stone-skin crust, freebooter bound cutlass, death knight blade held in both hands). Drawn from P.rpPoseT (now counts down) in the player pass.
2. RIPOSTE STRIKE x8: `F.ripo` 3 frames (step-in, cut/thrust with a gold flash at the point, follow-through), keyed off P.swingRiposte && P.atk (beats PARRY.ripBeats .05/.14); the recovery holds frame 2 (the knight's third-cut flourish no longer replaces it).
3. GLINT per weapon: `PARRY_ART` (hand, tip, style, colour) in src/riposte.js; `RP.drawGlint` (steel, shaft, ember, halo, stone, blood, rage) replaces the knight-only offset.
4. GOLD FLASH + SOUND: `rpParryFx` (hero-colour ring + star, 0.09 s gold tint on the body, 0.02 s screen flash only with flashes on and motion allowed) and `SFX.parryTone(hero)` = a per-hero layer on the recorded pools imp_steel/imp_steelH/imp_stone/imp_wood + synth, under the existing parry sound.
5. FOE PARRIED RECOIL: `RP.parriedPose` keyed snap/rebound/stagger/come-to (heavier bodies and elites rock less, flyers lift) replaces the break slump for parried foes; foes are procedural-pose, so one shared keyed recoil serves every kind. Plus `drawParried`: a closing gold window bar and a knocked-weapon glint over its head.
6. BOSS OPEN/WARD READ: `drawRead` now a clock ring (sweeping arc, head dot, four turning stars; duelist gets a second ring; break flashes), six-plate pale shell going dark for the ward, crossed-blades / shield mark over the head with the timer bar. Reduce-motion steady.
7. POISE BAR POLISH: quarter notches, bright head pixel, colour warming with fill, READY pulse + end caps at 85%, dotted grey ward, white/gold break. Same 120x1 / 28x1 footprint.
8. PIPS: gem sprite (5x5 diamonds, pitch 6) in both HUD modes; co-op P2 pips on a small tab hung under the P2 plate (so the hero name never loses a letter).
CODE: MIXED UP folded into the chain. Removed the parallel bonus (3 verbs in 4 s -> next blow x1.5 + break + long stagger; mixedUp(), P.mixedT, `mixed`). The chain says MIXED UP once as the third pip lands (MIX.word). tools/riposte.mjs chain updated as a STATED DESIGN CHANGE: asserts no blow lands x1.5 over the chain (max 130) and the word comes at pip 3 exactly. noteVerb/varietyMul (the meter feed) untouched.

## CHECKS (all green, PORT 8838, sequential)
riposte (full, plus new MIXED UP assertions: chain,teach re-run after the edit), NEW riposte-shots (every hero's catch drawn from 'parry', strike through ripo 0-1-2; added to npm run check), pixels (46 levels, 2963 sprites), mark-integrity, ability-poses (69/69, jump arcs), hero fingerprints (hero-keys-strip, base 8364480c vs now: warden/pyro/paladin/pirate/reaper/geomancer/berserker byte-identical; knight differs but knight differs run-to-run on the same tree too: noise, as in earlier lanes), textfit hud,plates --strict (0 everywhere; hud frames now carry 5 pips) + hud-default, mobile-perf, modulepreload, audio-assets, knight-rework (the old mixedT touch is harmless).
Not run: ui-hud pictures tool, the full suite.

## QUESTIONS FOR DANIEL
1. Foes have no per-kind frames (poses are procedural), so the PARRIED recoil is one keyed shared pose with weight/flyer variants. Rec: keep. Alt: per-kind recoil frames for sprig/soldier/cutlass first.
2. MIXED UP no longer breaks the foe. Rec: keep (the chain is the one mix-up reward). Alt: let pip 5 break a common foe once.
3. Glint hand/tip offsets (PARRY_ART) are eyeballed from the baked frames; a pixel pass in the shots may nudge them.
