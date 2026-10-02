# claude/airupart: hand-drawn air up-slash (Sonnet)
Art only. Frame counts (4 + the jump frame), timings, hitboxes, the 'rise' blow kind are unchanged.
- src/chars.js: the procedural airUp branch of directionalPoses is replaced by hand tables (AIRUP_BODY, AIRUP_ANG, AIRUP_HAND, AIRUP_WEAPON): coil, rise, arch, follow-through; tucked legs, helm/shoulder lift, plume, the free arm flung back (warden, freebooter), two-handers on both hands (paladin, death knight, geomancer, pyromancer); one blade length per hero so the arc reads as one swing. Skins inherit it (palette recolours of the same bake).
- src/main.js: drawAirUpCrescent replaces the thin arc: a tapered crescent (soft body, colour, white leading core) in each hero's own colours, fading through the follow-through (0.17-0.24 s, visual only).
- Captures: work/claude/airupart/before.png / after.png (7 heroes x 5 frames, 4x), after-ingame.png (real game, 4 beats), capture.mjs, gameshots.mjs.
- Checks green: verb-matrix, attack-animation, ability-poses, skins, geomancer, pixels, architecture, dangling-paths, slide, crouch-feet.
- UNVERIFIED: not felt in motion; only the default skin was captured.
