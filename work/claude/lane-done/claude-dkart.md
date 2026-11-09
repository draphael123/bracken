# DKART (claude/dkart, 11-08) - Death Knight "topple the standard" art, flag OFF (BOSSLIFT_DK_SHIPS / ?bosslift)
Branch claude/dkart off claude/dklift efed5bb51. Worktree bracken-lanes/bracken-dkart. Not merged, not deployed.

## Painted (code-drawn pixel art, house palette + #1b1626 outline; only fillRect/drawImage so it renders in Node)
- src/dk-lift-art.js (new): CUT POLE FALL = 3 keyframes (12/38/66 deg; cloth lagging, snapped straight, flung past) on the splintered foot + chips, then the LYING pole (torn cloth in folds, gold finial) and the stump left in the stone; mirrored for a leftward fall.
  POLE ACROSS HIS BACK (baked per lean, cloth on the upper side so he stays readable); FALL SHADOW (chevrons growing to a tip bar; violet, red + breathing on his side); WARD SHATTER (crack web, shards, sparks, 0.55 s);
  landing / laying-down DUST; CRACK in the stone under a pin; BOUND-THRALL THREAD (braid, bead at the thrall, ring at the pole, beads running up) and its SNAP when the last standard falls.
- src/chars.js: reaper kit gets F.pinned (2 frames): hunched on both knees under the pole, fists on the stone, blade let fall; then the HEAVE (shoulders up, red straining). src/unburied-foes.js: BK_POSES 41,42 = pinned, hurt moved to 43 (BK_HURT, still last row), bkFrame 'pinned' -> BK_PIN (flag on only; flag off still 25).
- unburied-foes.js draw: bkLiftDraw rewritten on the art; poles creak (1 px sway) while he stands under one; HE STEPS CLEAR = a smear from where he was; new drawUnbFront (1 hook line in main.js, after the creatures) draws the pole over him.
- Sounds: SFX.dkPin (new, heavy thud + haft split + stone), 'creak' -> SFX.creak (cut and under-pole), 'pin' key replaces heavy+crack at the pin, 'stdfall' when a pole lands unpinned.
- tools/dkart-sheet.mjs: Node sprite renderer + checks; PNGs in scratch/dkart-node (dkart-poles, dkart-fall, dkart-pinned, dkart-fx).

## Checks (node, one at a time, no browser)
dk-topple ok (flag-off hash db0e8493a98ac40e intact) | unburied-art ok | unburied-fights ok | comments ok | blow-tags ok | answer-tags ok | dkart-sheet ok | node --check on the 5 touched src files ok.

## Owed (browser; gate holds RAM)
Stills with ?bosslift: cut -> fall -> pin (both directions), pinned beat 1/2 at 1.4x darkened, ward break while a pole lands, P2 last-pole collapse (threads snap, dead lie down), step-clear smear, the 84 px poles against the chapel walls.
Also owed from dklift: deathknight-pilot, dk2, blood-kit, boss-openings, boss-greed, unburied2/3-shots, n=6 tune, nightly suite. (Dev URL: <dev-host>/?bosslift, the Unburied Field boss arena.)

## Questions (rec built)
1. Pinned pole sits over his shoulders with cloth up top; if it hides too much in play, lower the cloth (rec: judge in the stills).
2. Step-clear has only a smear, no own pose (needs a time-aware frame pick). Rec: ship as is.
