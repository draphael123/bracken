# claude/fogknightart3 - FOG KNIGHT 3: HAND-DRAWN PIXEL SHEET (SONNET art)
Base 1a1a6487 (fogknightart2). Art only: src/redraw/fog_knight_art.js (same exports, same pose keys, same anchors/hands/tips so marks and hitboxes are untouched).

## DONE
- The Crusader is authored as painted polygons / IK limbs baked to frames (waymeet.js bakePaladinBoss), not stacked rects. The knight now follows that spirit with real pixel art: helm (16x20), breastplate + faulds (26x26), pauldrons (16x9, the far one the same rows in a darker map), heater with the lock-gate sigil (15x20), fist (6x6) and the SHROUD (36x36) are palette-map ROW STRINGS (one char = one pixel), stamped; arms and the sword are crisp pixel lines with a 3-tone round brush + dark underlay (no more boxy arms).
- SHROUD: a tattered fog cloak off the shoulders, flaring behind him, hanging in tongues that sway row by row and dissolve (dither) into single wisps and thread-streaks drifting up/away; only thin flat wisps on the floor - the egg/ellipse pedestal and the full-stance egg wrap are gone (swirling pixel streaks instead).
- Helm: flat crown, brim and chin bands in rust, cross slit lit by the fog, crack, tattered rust pennon streaming back. Shoulder line and V-taper to a rust belt; fog showing through a split in the plate.
- Poses: all keys kept (walk/stances, cut/lunge/lash/surge/spear tell-release-rec, step, sink, plunge/plungeRec, shroudTell, doubleTell, empty, reel, sleep/wake). Fewer authored drawings, reused by pose (arms/sword re-aimed per pose).
- Shots: work/claude/fogknightart3/compare-crusader-v3.png (Crusader above, knight at 1x/2x), knight-sheet.png (all poses). Tool: tools/fogknight-zoom.mjs (new).

## CHECKS (one page at a time, PORT 8927, beside a running suite) - ALL GREEN
towpath.mjs 311 ok; towpath-probe ok; corpses ok; mark-integrity fogknight rows (cutTell/lashTell/lungeTell posed+landed); mobile-perf towpath 52.8 fps (under load of the suite; 60.2 last pass) inside the budget; textfit bestiary+hints 0 issues. Log: checks.log.

## SELF-GRADE
Knight B (up from B-/C+): one silhouette with a flowing, dissolving cloak, readable helm and shield, clean fists on the grip. Still below the Crusader in polish: the figure is a little squat/wide-shouldered, the mid-greys of arm and torso are close, and several guard/recover poses differ mostly by the sword and arms (reused body drawing). Ship rule (>= B) met but marginally.

## QUESTIONS FOR DANIEL
1. Ship at B, or an Opus pass to hand-draw per-pose body frames (not re-aimed arms)? Rec: ship; spend credit elsewhere.
2. The shield is one authored size now (the old 18/22/24/26 variants collapsed) - fine? (rec yes)
