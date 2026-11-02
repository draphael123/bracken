# claude/beast3art - BATTERING BEAST 3 ART (Sonnet, art-only; base claude/beast3 09f2363a)
Art only: no gameplay, tuning, telegraph length or hitbox changed. Not merged, not deployed.

## BAKED / REDRAWN (src/redraw/battering_beast_art.js, src/battering-beast-hands.js drawing only)
- HEAD: skull + chamfron lifted a full step, lit iron collar at the horn root, wider brighter eye slit with a glow line.
- GIRTHS: thin dark straps with three iron rings each (lowest takes the ram's chain) - no more "posts down the flank".
- RAM: 2-frame sway under him in walk, chain links with a lit top edge and dark centre, a ram shadow on the floor.
- BANNERS: big banner has a real 2-frame ripple (folds travel, swallow tail snaps); P2 torn banner = three rags of different lengths swinging on their own beat. Every pose now bakes both flutter frames.
- THE HORNSMAN: much bigger brass horn bell (gold rim, lit mouth, tassel, note lines on the blast); a REEL pose (rocks back, hand to helm, horn slipping) for ORDER LOST; THE HORNSMAN FALLS is now a tumble off the gantry's back (spin, bounce, lies, fades, dust) instead of a burst.
- ARCHERS (gate lintel + palisade rank): redrawn ~36 px at the scaffold archer's scale - quiver, boots, bracer, recurve bow; idle / draw (arrow nocked pointing high) / loose (string forward, bright arrow streak climbing).
- LANES: hazard-striped boards in the wave colour, end stakes with pennants, a numbered sign plate on a post (the digit printed on it), column edges; arrows in flight are 2-tone shafts with steel heads, fletching and a streak; landed arrows stand in the floor.
- TIMBERS: bark ridges/chips/gouges that turn with the roll, growth rings round a pith with a split; dust trail while rolling; the wall-top teeter is now a visible tilt with chips falling.
- BREACH: the gap is a view of the forest (trunks, leaf clumps, a light shaft) with splintered jambs; snapped stakes have jagged tops + chips; the RUBBLE STEP is a real heap (packed earth, stones, jutting broken stakes with lashings, nail, sawdust, grass, flat walkable top at the cell row; stage 2 piles plank ends).
- WALL: slam impact flash + dust ring at the wall (wallHit); wallBack is "winded" (breath clouds, chips falling, drool) not dazed stars; slam splinters are varied shards (were a ladder).
Not done: the Hornsman reel/fall have no new sound (none requested).

## SHOTS: scratch/lane-reports/beast3art-shots/  (beast3-*.png = after; BEFORE-beast3-*.png = beast3's stills)
Fight shots (look-walk, volley-horn, volley-arrows, volley-lost, wall-tell, wall-slam, wall-breach, p2-flail + -zoom), beast3-poses (all poses), and close-up sheets beast3-art-beast / art-clearing / art-fall-end (new tag `art` in tools/beast3-shots.mjs; the slam shot now uses hero x 497 and modeT .42).

## CHECKS
tools/palisadewood.mjs green; tools/palisadeart.mjs green (level hash 344234fcd689, B16 frames distinct, console clean); tools/hornsman.mjs green; MI_ONLY=batteringbeast mark-integrity: no marked windup seen in 40 s (not a validation - owed to the tune lane); boss sanity palisadewood practiced knight n=3: 0/3 (deaths 78/107/96 s, boss left 26/1/26%) - no page errors; art did not touch tuning, compare to r6 (knight 2/6).
NOT RUN: textfit, boss-openings, mash, level-reach (page, not needed for art; the lane numerals are ctx.text size 7 over the plate).

## BRANCH
claude/beast3art, worktree bracken-beast3art (sha in git log; last commit "beast3art: ...").

## NOTES FOR THE TUNE LANE
- No timing/hitbox change. Lane sign plates + pennants are drawn over the lane (visual only); the lanes are still BB.order's 44 px.
- Fight length unchanged by art; the knight is still the weak hero (0/3 here, 2/6 at r6): look at him + paladin first.
- Frames now bake 2 flutter steps for every pose (memory +~35 small canvases, negligible).
- Re-run mark-integrity with a longer MI_SECS (orderTell/wallTell never appeared in 40 s) and boss-openings/mash/textfit as the lane noted.

## QUESTIONS (rec built)
1. The camera clamps at the east wall, so the slam's head impact sits at the screen edge; the flash is drawn at his shoulder so it can be seen. Rec: keep.
2. Hornsman fall/reel carry no new SFX. Rec: leave (sound lane if wanted).
