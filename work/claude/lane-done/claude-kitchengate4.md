# claude/kitchengate4 - KITCHEN GATE 4: THE COAL TRENCH, THE MEAT-HOOK RAILS, THE SECOND HELPING (opus greybox)
Branch `claude/kitchengate4` off `claude/batch133` (416af6c2). Brief: scratch/brief-kitchengate4-1030.md (Daniel approved all 3 recs 10-30 17:30). NOT merged, NOT deployed.
GREYBOX: art before live - the sonnet art lane comes next (section ART NEEDS).

## WHAT WAS BUILT
**A. THE COAL TRENCH** (src/kitchen-gate.js arena block, src/grubbag.js geom/stepCoals)
- The floor under the serving line's **east half** is cut 3 rows down to a coal bed (old cols 403-410, real 573-580), a one-row **chain-link step** at each end (bed -> step 16 px, step -> floor 32 px; a base jump rises 51). The hatch, the stove/bellows, the line's foot and his table side keep the old floor. (Brief said "from about the first shelf" - see Q5: the full-length trench broke the fight.)
- A fall in = **COAL BITE** (GB.coal.dmg 8, `spare: true` - never a death on its own - and `noKnock`), told `THE COALS: CLIMB OUT`; on the coals it bites again every 1.4 s (no pin: never twice inside 1.4 s, plus the hero's own hit i-frames).
- **THE GREASE SPILL LIGHTS IT**: a 0.6 s red glow (told `THE GREASE LIGHTS THE COALS`), then 6 s lit - bite x2 and the steps bite too (the climb out is hot). Greybox draw: embers, glow, flames.
- No gold sprinkled in/over the trench (L.noCoin); the east torch moved off it; the hall's back wall drawn down into the trench.
- Bot: climbs out at the nearer step; crosses the trench by the line (up its near end); never walks a dodge into the coals.
- Real keys, all 9 heroes (tools/kitchengate4-keys.mjs): bitten, out at both ends in 0.7-1.4 s, alive.

**B. THE MEAT-HOOK RAILS + THE PLATTER DROP** (L.zipLines `arena: true`, ids kg-arena-a / kg-arena-b)
- LOWER rail from the hatch (rope 20 px over the line, taken with UP from the line - `upOnly`, see below), its red hop stretch hands off to the UPPER rail, which climbs over the trench and **ends over his platter**. Ridden to its end, every hero comes down ON the platter (flown for 9 heroes x 3 holds).
- **DROP ON THE PLATTER = THE 3rd OPENING `KNOCKED OFF HIS FEET`** (grubbag.js platterDrop, hands detect a hero let go of an arena rail landing on the platter within 1.6 s): the dishes on the line are KNOCKED FLYING, a cooling pepper stove is hot again, and he is open GB.drop {t 3, x2, cap 0.06} (shared gold ring + timer), then the told WARD. One per 12 s; never stacks on the bomb's stun/chilli (the longer stands, only the food flies). boss-greed and gbOpen know the new mode; B15 floor unchanged (well fed x0.45, ward x0.4).
- A hero left on the platter is tipped off toward him after 0.8 s (no contact damage).
- Taught: a sign at the hall's door `RIDE THE HOOK, DROP ON HIS PLATTER.` + the told line.
- **src/zipline.js: ONE flag added, `upOnly`** (a rope taken only with UP). Found by the rates: jumping up onto the line at its foot SNATCHED the lower hook by touch (the bot never batted a bomb). The regrab fix (P.zipSkip / zipHard) is untouched; tools/zipline.mjs green.
- Real keys, all 9 heroes: UP takes the lower rail, JUMP in the red stretch hands off, he lands on the platter -> KNOCKED OFF HIS FEET, a blade x2.

**C. FOOD BONUS LEGIBLE + THE SECOND HELPING** (grubbag.js eat/start, hands draw)
- A dish eaten: belly SWELLS 0.4 s (POSE.eatSwell, belly 1.2), a BIG green `+N` (text size 10 vs 6), `MORE!`; GB.dish heal 0.05 / cap 0.1 UNCHANGED.
- Each dish owes ONE SECOND HELPING (never stacks), spent on his next LOB / FLING / GREASE (belch, sweep, bell, grab leave it owed): DOUBLE LOB (one more ham, the far side, 0.25 s after the last), FASTER FLING (330 -> 412 px/s), LONGER GREASE WAVE (burn 1.8 -> 2.52 s). Windups/tells NOT shortened (B16); `SECOND HELPING` said + drawn and a gold/red rim on his throwing hand during the windup. No change to what he takes.

**D. ORDER UP** - the bell runs both hook rails x1.6 (z.speed set by the hands, restored after; the rush's own red stretch `hopRush` flown for every hero) and the ATTENDANTS RIDE DOWN THE HOOKS from the hatch (staggered 0.9 s; lower rail -> swing to the upper -> drop off its end on the platter; main.js one guarded line `GBH.ride`). A blow knocks one off (`ATTENDANT FALLS`); on the coals they burn. Max 2 as before.

**E. THE BOT** (gbPlan) - the hook route (UP under the lower hook, kick in the red stretch, ride to the platter) weighed 0.3 per move of his (0.45 v2), only with the drop ready, no bomb/chilli on the line and no bomb next out; trench climb; trench crossing by the line; jumps the sweep on the beat at the platter end. lab.js passes `zip` and maps `up`/`kick`.

Also: walking back WEST against the line over the trench it carries you half as hard (the line is the way back to the hatch now).

## TUNE (tools/boss-rates.mjs kitchengate --ways=practiced --profile=human, campaign L20, flasks kit, seeds 301-306)
| state | knight | warden | pyro | total |
|---|---|---|---|---|
| BASE batch133 (3 seeds, same seeds) | 2/3 | 1/3 | 3/3 | 67% |
| first cut, full-length trench | 0/3 | 0/3 | 0/3 | 0% (bot stuck on coals, drop eating the bombs, hook snatched by jumps) |
| fixes + east-half trench, dmgMul 2.6 | 1/3 | 1/3 | 1/3 | 33% |
| + half carry walking back, drop 3.5 s/.08, dmgMul 2.6 | 3/3 | 2/3 | 3/3 | 89% |
| same, dmgMul 2.9 (6 seeds) | 4/6 | 4/6 | 6/6 | 78% |
| **FINAL: dmgMul 2.9 (unchanged), drop 3 s / cap .06 (brief rec), 6 seeds** | **5/6** | **2/6** | **6/6** | **72% (HIGH +2)** |
- **DRY** (human+dry, 3 seeds): 2/3 1/3 1/3 = 44% (kitchengate2: 42%).
- **Fight length (wins):** knight 102-112 s (was 110-133), warden 167-192 s (was 147-175), pyro 114-152 s (was 129-132). Knight ~12% shorter; overall about the same.
- **Mash**: boss 0/6 (0 blows landed, dead in 18-48 s); level mode dies with every hero. Stamped.
- Coal share: the bot rarely touches the coals now (0-2 bites a fight); its deaths are flings / lobs / sweeps as before. The warden still the low hero (as in every Grubbag tune; the warden bot misses flings).
- **The tune lane should**: 12-seed confirm; if it stays at 72%+, nudge down via GB.drop.cd 12 -> 14 or the carry-back 0.5 -> 0.65 (not dmgMul).

## CHECKS RUN (one tool at a time, PORT 6600, memguard running, never check.mjs)
GREEN: tools/kitchengate.mjs (194 ok - ~45 new asserts: trench, bite, lit coals, rails, upOnly, platter landing, rush hop, drop, second helping x3 moves, swell, hands fake world: rail speed, attendants on hooks, knock-off, coals, platter drop + shove, bot hook route/trench), tools/kitchengate4-keys.mjs (NEW, real keys x 9 heroes), kitchengate-probe, zipline, reach-heroes kitchengate (0 crossings), boss-read, tells, boss-openings, untold-told, boss-heal, checkpoint-gaps (kitchengate row unchanged), level-quality kitchengate (CLEARS THE BAR), mash-gate (after re-stamp: 53 levels hold).
RED not mine: boss-fight-end 2/68 = THE CHURCH page CRASHED (Inspector.targetCrashed, the fight never started, low RAM beside the gate); kitchengate's own row: ended in 6 s.
GREEN: tools/corpses.mjs (every reskin in its own skin; the attendants burned on the coals use the existing kill path).
Re-stamped (level then boss): docs/level1-pilot.json (47 hits/2 deaths, was 40/2), docs/level1-curve.json, docs/mash-bot.json.
Not run: full suite (forbidden), mark-integrity (stamp after art), stuck-spots glint (no stuck-spot entry added - the steps and the hooks are in plain sight in a boss hall; Q6).

## SCREENSHOTS (work/claude/lane-done/, tools/kitchengate-shots.mjs gb-trench,gb-trench-lit,gb-hookA,gb-hookB,gb-drop,gb-second,gb-swell,gb-bell-hooks)
kitchengate-gb-trench.png, -gb-trench-lit.png, -gb-hookA.png, -gb-hookB.png, -gb-drop.png, -gb-second.png, -gb-swell.png, -gb-bell-hooks.png (+ gb-sit, gb-grease). Copies in scratch/lane-reports/kitchengate4-*.png.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **Trench length**: the brief's full-line trench (old 399-410) made the hatch side unreachable except by walking back up the conveyor: 0% for every hero. REC (built): the EAST half only (403-410) - the stove, the hatch and the line's foot keep their floor; the way to HIM is over the coals (the line or the hooks). Alt: full length + a gangway.
2. **What the drop knocks flying**: the brief said every item. REC (built): the DISHES only - a bomb or chilli on the line rides on (knocking them off cancelled the player's own openings and halved the bot's bomb stuns). Alt: everything flies (harder, the drop competes with the bombs).
3. **Carry walking back**: REC (built): over the trench the line carries you half as hard while you walk west against it (it is the only way back to the hatch). Alt: full carry (much harder: 33% at a lower dmgMul).
4. **Lower hook UP-only** (src/zipline.js `upOnly`, one flag): REC keep - a jump up onto the line must never snatch the hook. The upper hook stays touch-catchable (the hop) and can also be taken by a jump from the line - REC keep (every hero reaches the drop, B12).
5. **Drop opening**: REC (built) the brief's 3 s / cap 0.06 / one per 12 s. Q2/Q3/Q4 of the brief built as recommended (climb, 3 s/12 s, lob/fling/grease only, both rails from P1, bell speeds them in P2+).
6. **Stuck-spot glint for the steps/hooks**: REC none (a boss hall, both in view, the sign + told lines teach it). Alt: add src/stuck-spots entries in the art lane.

## NEXT LANE: SONNET ART (art before live), then SONNET TUNE (12-seed)
ART NEEDS: the coal bed (embers; the glow; the lit flare), the chain-link steps (chains on the step faces), the arena hook rails' hooks + carcasses (kitchen rail art already draws them - check the two arena rails in view), the platter-drop landing (splatter, dishes flying), the belly swell (POSE.eatSwell) and the big `+N` / `MORE!` read, the SECOND HELPING rim on his hand, attendants hanging on hooks (an attendant 'hang' frame), the hall's back wall below the old floor line in the trench. The cauldron hangs close over the upper rail's end - check the art doesn't overlap the rider.
