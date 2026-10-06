# claude/heroposes - own pose frames for the 8 HERO KIT late actives (Sonnet, base master 85e13368)

## What changed (art and pose tables only; no balance, no timers, no boxes)
New baked pose keys in src/chars.js (pyroKitPoses, paladinKitPoses, pirateKitPoses, reaperKitPoses), each 3 frames, drawn on the existing rigs/pipeline:
| active | key | frames |
|---|---|---|
| Flashover | flash | palm cupped round a spark / sleeves snapped out with the big flare / recoil |
| Firestorm | storm | staff swung up flat overhead / crosswise with a flare each end, robe belled, embers every side / staff down, embers falling |
| Dawnburst | dawn | maul in to the chest, head bowed / head back, maul high and forward, rays level / glow dying |
| Holy Wrath | wrath | maul cocked far back / held out level, light up off both shoulders / settled, fire dimmer |
| Powder Keg | keg | on his heels with the lit cask / underhand lob, cask trailing a spark / follow-through |
| Heavy Seas | seas | cutlass back to brace / swept low, wall of sea off the point / wave rolling on |
| Bone Armor | bone | arms crossed on the blade / head back, plates of bone closing / last plates seated |
| Soul Reap | reap | blade drawn back / scything cut with green crescent / off hand drawing the soul in |
src/hero-poses.js: POSE_BEATS rows for the eight. src/main.js: the eight kitPose(...) calls now name them (key swap only).
## Checks
- tools/ability-poses.mjs: the eight SHARED_OK entries removed; new block asserts each late active draws ONLY its own key, with baked frames = beats + 1, and is not on SHARED_OK. Green: 60 of 60, jump arcs, posed dodges.
- node --check on the 4 files; crouch-feet, hint-shown, skill-icons green. NOT run: full suite.
- Pictures: before-/after-{paladin,pyro,pirate,reaper}.png (real page, tools/pose-shots.mjs) and frames-*.png (tools/pose-frames.mjs, old vs new keys side by side), in this folder. docs/poses2/*.png regenerated.
## UNVERIFIED
Pyro/paladin/reaper in-game crops were only checked on the frame sheets plus the pirate in-game sheet; weapon-skin sets were not individually inspected.
## QUESTIONS FOR DANIEL
1. Poses are 3 frames at the old cast lengths; polish pass for more frames (rec: only if any frame reads wrong in play).
