# claude/fenroad2art (sonnet) - THE FEN ROAD 2 art pass (LANE C of scratch/brief-fenroad2-1022.md)

Base claude/fenroad2 11221138. ART ONLY: level hash unchanged (level-quality fenroad clears with the existing pilot/curve/mash stamps). PORT 8781, one headless Chrome at a time.
New: src/redraw/{fen_backdrop,fen_site_art,fen_planks_art,bog_leech_art,hero_plank_poses}.js. Rewritten: stilt_walker_art.js. Hooked: main.js, fen_road_art.js, fen-road-hands.js, fen-planks.js, bog-leech.js, stilt-walker.js (frame choice only).
Tools: tools/fenroad2art-{shots,sheets,strips,heroes}.mjs.

## DRAWN
- **THE FEN BACKDROP** (was the shared round-canopy forest): far hazy bald-cypress line + far stilt huts with flickering lanterns, a heron crossing the sky now and then; the Stockade's palisade now sits between the far line and the mid row;
  MID row of great bald cypress (fluted trunks, root flare, KNEES, flat feathery crowns, swaying MOSS curtains), layered ground mist (far bank, mid bank, low drift in front), the mid row REFLECTED in the murky water,
  a heron on a snag in the shallows (3, flies off when you come near), dragonflies over the reeds, near trunks + hanging moss at the screen edge. Five area tints (cuttings olive / crews green-brown / stilt posts dark teal / palisade road smoke and rust / crossing grey).
- **THE STOCKADE ON THE HORIZON**: tent roofs and a second row of stakes behind the wall as it nears, torch flicker at the gate and towers.
- **WORK SITES / BOARDWALK KIT** (fen_site_art.js, ~36 placed from the road itself, none within a tile of a sign/lashing/checkpoint/gap/etc.): lamp posts (glowing), sawhorse with a saw and a board, barrels + rope, a tarp lean-to, the PILE-DRIVER tripod with its weight, plank stacks, half-built PILINGS out in the water (cap beam waiting), hung nets, braziers, skull stakes, stake rows, banners.
- **STILT-WALKER** (15 -> 20 frames): a goblin whose own short legs are strapped to long poles - hip, knee, shin with lashings, footplate, 14 px of pole under it; the walk is a real cycle: foot off (15/16), high step (1/2: knee up, pole trailing, body riding up), reach (17/18), LAND (19: dust, pole flexing, body dropped), 13 stomp windup (stilt reared high over you), 14 stomp (driven down, dust). Planted pole bows (flex). Step events now also throw a ring of dust along the boards + splinters. Ground tells restyled: dark foot-shadow with four closing ticks (steps), red target ring + cross + falling column (stomp).
- **BOG LEECH** 6 frames (lurk, rear, lunge, latched swollen red, flop, hurt): glossy segmented body, ochre dorsal stripe, ringed sucker mouth with teeth; lurking: shape under the water, slow ripple ring, eye-dots that open and shut, the back breaking the surface now and then.
- **PLANKS**: the bundle (stack on two sawhorses, roped, red rag, tally marks, mallet, sawdust, glint), the carried/flying/resting plank, the ghost plank (pulsing pale span with arrows into each lip), your laid road (fresh pale boards, nails, hemp lashing at each end), the BROKEN road (snapped board ends hanging off each lip, snapped stringer, the crew's red-rag stake, sunk tilted boards, a dangling rope) and the **PEAT HOLE** with its own painter (black fibrous bog, oily skin, a slow whirl, floating clods, gas bubbles that heave up and burst; not the generic mud).
- **HERO POSES, all 9** (hero_plank_poses.js): each hero's OWN baked frame with weapon and lead arm cleared, redrawn in his own sleeve/glove colours: CARRY (plank overhead in both hands, idle + the run's legs), LAY (crouched, plank low/angled, then set down), THROW (arms up-forward open-handed, follow-through). Installed per hero at the level load.

## CHECKS (PORT 8781)
fen-road 150/150, bog-troll 39/39, level-quality fenroad CLEARS (hash unchanged), visible-supports fenroad 0 of 37, signs ok (1010), ability-poses 77/77 (0 debt), textfit --strict scoped to fenroad: bestiary/levelcard/hints + hud/talk/plates 0 issues.
**mobile-perf (4x CPU, 915x412, with a release gate running beside it):** fenroad@20 45-50 fps, @165 47-54, @232 53-54, @350 55, @430 53 (busy 14-18 ms). The first frames after load show a one-off hitch (level bake) - sprites are now baked at the level load. Bake layers: every static picture baked once; far layer only at parallax 'full' (phones are 'near').
NOT RUN: full suite / QUICK gate (the coordinator's), unscoped textfit hud/levelcard (the known hang).

## PICTURES (work/claude/lane-done/)
- BEFORE (base) at the same spots: fenroad2art-before-{col4,col45,col92,col113,col160,col232,col280,col330,col375,col402,hole-teach,plank-carry-ghost,hero-carry,plank-laid,stilt-lift,leech-rear,leech-latched}.png; greybox sheets: fenroad2-stiltwalker-sheet.png, fenroad2-leech-sheet.png.
- AFTER: the same names with `after`; sheets fenroad2art-after-{stiltwalker-sheet,stiltwalker-sheet2,stiltwalker-walk,leech-sheet}.png; in-page strips fenroad2art-after-{stilt-walk-strip,heroes-carry,hero-lay-throw,leech-strip}.png; all nine heroes' pose frames fenroad2art-after-heroes-poses.png (base frames: ...-heroes-base.png).

## SELF-GRADE: B (vs Rootway / Lumber Trail B+): backdrop B+ (reads as a fen at once, mid layer baked, area tints), stilt-walker A- (real legs, real cycle), leech B+, planks/kit B, peat hole B- (reads as black bog but the surface is quiet at 1x), hero poses B- (composited from each hero's own frames, so a pose is a drawn arm + plank over a cleared body, not hand-redrawn per hero; the weapon is simply absent while carrying).
Weak spots: reflections are arched blobs at 1x; hero carry poses share one plank angle; lay/throw frames are 2 each.

## QUESTIONS FOR DANIEL (rec first)
1. The hero hides his weapon while carrying a plank (the frame is cleared). REC keep (reads clearly). ALT: weapon slung on the back (needs a per-hero pass).
2. The stilt-walker is now ~6 px taller than before (his legs read). REC keep; hitbox untouched.
3. Heron on snags (3) and the sky heron: REC keep, sparingly. ALT remove if they distract.
