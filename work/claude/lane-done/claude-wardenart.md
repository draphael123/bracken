# claude/wardenart - WARDEN ART FIXES (demo), art only
Branch claude/wardenart off claude/batch141 (828f83af); worktree ...\bracken-lanes\bracken-wardenart. Tip: see `git log -1` on the branch (final commit below).

## Changed (src/main.js, src/chars.js, tools/warden-art-gif.mjs; no timing/damage/physics change)
1. ULTIMATE (Warden's Reach): she is drawn from her BARE set (no baked spear) for all of wReachT, so the upright spear standing beside her is gone; the existing ghost spear is now the only spear. Same switch the javelin-out state already used (KD in the player draw).
2. JAVELIN CHARGE-UP: new baked frames F.javWind[0..2] (chars.js wardenKitPoses), one per hold tier (arm drawn back further each tier, feet wider, tier 3 coiled low with shoulders hitched), chosen in the draw by P.wthHold (tier-1). The spear itself is drawn in wthDraw while winding: level, in the throwing hand, longer (14/18/22 px), thicker with a dark edge, glowing harder per tier, tier 3 shakes + sparks at the point. Removed the placeholder kitPose('javThrow') from wthTick. Uses only the existing tier clocks (WTH.steps); release/flight untouched.

## Pictures (scratch\lane-reports\wardenart\)
before\ult.gif (1.2 MB), after\ult.gif (1.2 MB); before\charge.gif (1.7 MB), after\charge.gif (1.7 MB): hold C through 3 tiers + release. Also *-strip.png and charge-zoom.png (stills). Made by tools/warden-art-gif.mjs (dependency-free GIF writer).
Note: the ult GIF's second beat presses attack, but a thrust is not visible in the strip; ult thrust frames in the bare set are NOT eyeballed (OWED, see below).

## Checks
- node --check on main.js: ok. tools/heroblocks-b.mjs warden: OK (1st run page crash, rerun green). tools/warden-id.mjs: 36 checks green. tools/warden-id-live.mjs: green.
- tools/ability-poses.mjs: page CRASHES (Inspector.targetCrashed) at random points under load, with or without my change: mine 4x (knight skill 6 once, early otherwise), the same tool on the UNCHANGED tree passed once (77/77) and crashed once at skill 32. Warden-only skills ran clean with my change. Treated as the known headless-Chrome memory flake, OWED: one clean pass when RAM is free.
- textfit: not run (no text changed).

## Owed
- Eyeball Warden thrusts DURING the ult (bare-handed atk frames + ghost spear).
- ability-poses.mjs one clean pass (flake above).
- Gate/merge: not done (not my lane).

## Questions (rec)
- Q: during the ult should she hold a fist-grip on the ghost spear? Rec: no, the beam from her hand reads fine for the demo.
