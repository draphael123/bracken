# claude/crusaderposes - THE CRUSADER pose polish (art only)
Branch claude/crusaderposes, base origin/master ce20a08d. Only src/redraw/waymeet.js (bakePaladinBoss) + tools/crusader-sheet.mjs (error-safe, noWait). Frame indices, canvas, anchor, pack w/h unchanged: no timing, hitbox or glint window touched.
Sheets: work/claude/crusaderposes/before.png / after.png (all 31 frames, 3x).

## Changed
- Heavier silhouette on every frame: wider breastplate, big gold-rimmed pauldrons (far one too), plate tassets with a gold hem over the thighs, wider belt.
- Scabbard (leather, gold mouth + chape) on the hip in all frames; the grab frames show the sword sheathed with hilt, crossguard, pommel.
- GRAB 22-26: proper open gauntlet (palm, four fingers, thumb, gold knuckles); 24 hand up over the helm.
- GLINT frames: bigger 8-ray star on the point (15/18/21/30).
- BRAND 27: both hands on the grip, shield slung on his back, blade has a lit double outline. 28: wider knees, floor crack and dust where the blade enters.
- DELAYED overhead 20/21: lower crouch, back knee down (kneel), blade flat behind the helm.
- Recoveries 16/19: helm bowed (bowed 5) and the shield arm dropped lower.
- FOLLOW-UP 29/30: blade held low and level across the body, shield lowered so it reads apart from the cut tell.
- DEATH 12: kneeling, shield let fall, point in the floor with a crack, leaning on the hilt, helm on his chest.

## Not done
- Extra held frames for 14/17 (anticipation 2-3 frames per the style guide) need new frame indices + a main.js mapping, which touches timing code: not art-only. Question 1.
- Flat red tells (bash line, leap ring, oath ring, radiance columns) to dithered decals: those live in main.js, not the sprite bake. Question 2.

## Checks (PORT 8813)
paladin-enrage ok, tells ok, boss-read ok, untold-told ok, blow-tags ok, mark-integrity MI_ONLY=closedhelm ok (cut, delay, bash, grab posed+landed), pixels (headless floats) ok.
boss-rates NOT re-run: the sprite bake cannot change the sim (w/h/anchor identical, no code outside the bake); 40-minute cost skipped.

## QUESTIONS
1. Add held anticipation frames (14b/17b) with a main.js frame map? Rec: yes, in a lane that may touch the draw code.
2. Convert the old tell rings/lines to dithered decals? Rec: yes, separate main.js lane.
