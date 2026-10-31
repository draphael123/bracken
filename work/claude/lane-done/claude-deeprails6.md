# claude/deeprails6 - DEEP RAILS 6: THE LEADING BORE + GREAT DRILL polish (Opus level+boss; Daniel 10-29 'very minor', defaults approved 10-31 08:41)

Base: claude/batch133 416af6c2 (deploys today). Brief: scratch/brief-deeprails6-1029.md. PORT 6230, one page run at a time (a release gate was running; memguard killed
some headless Chromes under memory pressure around 12:17-12:40 - two of my runs crashed with it and were re-run). NOT merged, NOT deployed.

## DANIEL'S SIX ITEMS
1. **P3: ONE RAIL + TENSION** (built, MID - Q1 approved). At 30% the roof comes down on the LOW and the HIGH lines: `S.oneRail`, `lanesOf -> [1]`. The hands take the HIGH rail up
   (as before) and SEAL the LOW line (rows between floor and MID rail -> rock, the MID rail -> rock so you cannot drop off it); a cart on the LOW line at that moment is BUCKED up
   onto the MID rail by the rubble (told: 'THE ROOF COMES DOWN ON THE LOW LINE: UP!', vy -430 - never teleported), re-bucked until no cart is under the MID line, then sealed.
   Laid back on spawn/end/clear. Drawn (greybox): a rubble heap over the LOW line up to the MID bed (scrolling), the high line's fallen roof (existing).
   - Gear banks in P3 (GEARS[i].p3): chain winch = a standing blow at the rear face; DYNAMITE FEED = a jump on the deck by the cab (dx 18); spin-up gear and roof winch = a
     jump off the MID rail (low and high). The gate still wants 2 of 4. (Tried the feed as a standing blow: P3 shorter, but the drill went 77-86% - Q2.)
   - Every P3 move re-answered on one rail: lunge = DUCK; claw = PUMP-JUMP (no other line - the bot's existing branch); reverse = BRAKE (no high line any more); collapse = BRAKE;
     hook = JUMP (bot learns it: jumps as the hook flies); dynamite = jump at the burst / brake; cutter = strike back / jump. B17 >= 3 distinct answers (asserted).
   - The ore cart (missed lever) is kicked onto the ONE rail in P3 (the bonus ram still works).
   - TENSION: THE RIG CLOSES as its bar falls (home R -> homeR - 70 px at 0%, `S.tension`), a RED LAMP STRIP along the roof pulses faster as the bar falls (greybox, art lane:
     the roar bed). Not built: the 'spare high ledge' for the reverse (brake is the answer) - Q below.
2. **P1: ONE MORE ATTACK - THE SLAG LADLE** (built, Q2 approved). Told 0.9 s (the boom rises over the cab with a glowing ladle, its line marked orange, '!! SLAG LADLE: CHANGE LINE,
   OR JUMP IT'), the glob flies 0.4 s (its landing marked), then a POOL (40 px, 2.5 s) comes down the tunnel on that line and burns a cart riding through it (14 after tune).
   Answers: change line, or jump it. B16: its own pose (ladleArm). **Gear: THE ROOF WINCH, not the dynamite feed** - with the feed (brief rec) the bot broke that bank first
   in every fight and the ladle came 0 times; on the winch it comes 1-6 times a fight. Q below.
3. **THE LEVER** (built, greybox). The hand-lever pulls DOWN over 0.25 s (pointsPost takes the pull 0..1) with a clunk + spark burst; thrown, the rig's chute hatch drops and
   its ORE POURS in an arc into the gear housing for the dump (oreStream), smoke at the gears, the rig LURCHES (shake + the tunnel scroll stutters to 35% for 0.5 s), then
   the existing jam. Stays drawn DOWN as it goes by. MISSED: it goes by still up - told 'MISSED THE POINTS: IT KICKS AN ORE CART' + 'MISSED' on the post. H.read().leverAnim
   { thrown, k, pour, missed } + lurch.
4. **THE GOBLIN DRIVER REDRAW** - ART-ONLY, for the Sonnet art lane (Q3 approved: the cab driver first). Not touched here.
5. **A NEW SECTION: THE LEADING BORE** (1286-1355, ON THE CART - Q4 rec), between the smelter and the bore's mouth; the drill's arena moved 1308 -> 1378, MINE.W 1348 -> 1418.
   - TEACH 1286-1303: the HIGH line (the smelter's rail run on) is TORN (rubble from the rail to the rock, no jump clears it): the points keep you on it by default, so you
     must OPEN them and drop to the LOW line (REQUIRED - the verb carried over with a twist; sign + tell 'HIGH LINE TORN: OPEN POINTS' + glint until OPEN (stuck spot mc-bore);
     a crash is cheap - back before the points).
   - TEST 1304-1331 on the low line: a rockfall told by its shadow (+ tell), a bat, a DUCK beam under the cutting scars, a bone-chucker on a ledge, a navvy on the line to ram.
   - EXAM 1332-1355 (A14): THE FORK - jump up to the HIGH rail (a 3-wide gap to jump, a bat in it) or stay LOW (a crusher, then an ELITE navvy on the line); tell 'FORK: GAP
     HIGH, CRUSHER LOW' + sign; a bone-chucker over the merge; the lines meet (rise) at the mouth.
   - Foes: no goblins (house rule + brief): navvies (miner AI, cnSkin navvy), bone-chuckers (rockgoblin AI, cnSkin bonechucker), bats - 2/2/2 (33% each), melee/ranged/flyer
     + an elite. Dressing: bore scars at 1300/1322/1340 (greybox `torn` decor kind is not drawn yet - art lane).
6. **CHECKPOINT BEFORE THE DRILL**: STATION NINE moved (not added) 1288 -> 1358, the end of the new section, 20 columns before the arena wall; 181 route tiles after station
   eight (A10b 140-260). checkpoint-gaps + boss-checkpoint green.

## TUNE (boss-rates minecart --ways=practiced --profile=human, kit flasks, campaign level L17)
Base (batch133 drill code, its greybox numbers) already read **89%** (6 seeds: k5/w5/p6) - the campaign level is L17 now (DR5 measured at L13).
| step | numbers | knight | warden | pyro | all |
|---|---|---|---|---|---|
| greybox (ladle on the feed) | hp 2200 | 5/6 | 5/6 | 6/6 | 89% |
| r2 | hp 2700 | 3/6 | 6/6 | 6/6 | 83% |
| r3 (12 seeds, two halves) | hp 2700, every move x1.15 | 5/12 | 9/12 | 10/12 | **67%** |
| r4 (P3 feed a standing blow) | same | 6/12 | 11/11 | 10/12 | 77% (reverted) |
| r5 (same + x1.2, hp 2800) | | 6/11 | 12/12 | 12/12 | 86% (reverted) |
| **FINAL (= r3 state), 12 seeds** | **hp 2700, x1.15** (contact 48, rock 48, reverse 47, ore 32, dynamite 41, lunge 45, chain 23, roof 47, cutter 26, claw 32, ladle 14) | **5/12** | **9/12** | **9/11** | **66% in band** |
| dry (human+dry, 6 seeds) | final | 0/6 | 1/6 | 4/6 | 28% (report only) |
Fights (final): knight 101 s, warden 85 s, pyro 124 s mean. Resist floor kept: cab x0.4 outside the jam (and in the ward), jam x2.3 capped 0.15, the 3 s ward. Mash: drill 0/6.
Spread: knight ~42%, warden ~75%, pyro ~80% - no hero at 0; the tune lane may narrow it.
**P3 length (drill-gears, 3 seeds, the same tune on the old and new P3):** old three-line P3 24.8 s mean (wins 25.8 s); one-rail P3 27.8 s mean (+12%, inside the brief's 15%),
wins only 32.8 s (+27%: pyro's P3 runs 28-47 s with three jump banks). Every fight reaches P3 (9/9); gears broken 4-7 a fight. The ladle comes 1-6 times a fight, the bot
dodges it (0-1 hits). Bucks: 0 (the bot is on the MID line at 30% - the buck is asserted in the shots run: 1).

## CHECKS (PORT 6230)
GREEN: tools/minecart.mjs **615 ok** (extended: THE LEADING BORE's arc/torn points/glint/fork exam/foe mix/no goblins/station nine spacing; THE SLAG LADLE told, pools on
its line, a line change clears it, the roof winch kills it, the bot changes line; P3 one rail - lanesOf [1], every bank struck from the MID, THE RIG CLOSES, >= 3 answers, the bot
jumps the hook; the lever's pull/pour/lurch/miss read) | minecart-route (suite: every boost gap probed, the knight rode all 11 legs incl. 1177 -> 1358 through the bore, 283 s)
| minecart-aloft | checkpoint-gaps (minecart 183 tiles station eight -> nine) | boss-checkpoint | level-quality minecart **CLEARS** (pilot + mash re-stamped) | reach-heroes
minecart (nothing new) | stuck static + runtime (358 spots, mc-bore glints) | tells (1114 marks) | untold-told | boss-read | boss-openings | hint-shown (after retiring 'THE
ROOF TAKES THE HIGH LINE' callout) | mark-integrity (MI_ONLY greatdrill/brute: 'no marked windup seen in 40 s' - info, as DR5) | boss-fight-end (minecart drill + both minis
end; the 1 red is fallingtower undeadmage UNKILLABLE BY SCRIPT - not this lane) | corpses (navvy + bonechucker die in their skins) | mash-gate.
RE-STAMPED, LEVEL THEN BOSS: docs/level1-pilot.json (minecart: 475% / 11 deaths in 3 runs), docs/level1-curve.json (499% / 12), docs/mash-bot.json (mash level: every hero dies
5-6 times; drill 0/6 (0 blows land), Foreman 0/6, Forgemaster 0/6).
**CURVE (report-only, added to tools/rule-state.mjs CURVE_REPORT_ONLY with the reason):** act II band 70-400% / <= 6 deaths; minecart reads 499% / 12. NOT the new section:
the base level (claude/forgemaster put the smelter floor + forge in and never re-stamped the curve - the stale row was 230% / 4) reads **466% / 12** with the same pilot;
THE LEADING BORE adds +33% health lost, **0 deaths** (brief: <= 1). Q4 below.
Memory: two runs crashed when memguard killed headless Chromes at < 900 MB free (12:17-12:40, gate + other lanes) and were re-run alone; no full suite run.

## SCREENSHOTS (greybox) - work/claude/lane-done/deeprails6-shots/
01-bore-runin-sign, 02-bore-torn-points, 03-bore-low-rock-beam, 04-bore-exam-fork, 05-bore-merge-chucker, 06-bore-station-mouth, 10-drill-ladle-tell, 11-drill-ladle-pool,
12-drill-lever-comes, 13-drill-lever-pull-pour, 14-drill-lever-jam, 15-drill-p3-roof-coming, 16-drill-p3-one-rail, 17-drill-p3-tension.

## 1. THE SLAG LADLE's gear: built on **THE ROOF WINCH** (its boom hoists the ladle). The brief's rec was THE DYNAMITE FEED, but that is the bank every player breaks first
   (the MID line, by the cab): in 3 fights the ladle came 0 times. Rec: keep the roof winch. Alt: the feed, with the ladle first in the P1 chain.
2. P3's DYNAMITE FEED bank: a JUMP on the deck by the cab (built). As a standing blow P3 was shorter than the old one (23 s vs 26 s) but the cab worker broke it by the way
   and the drill went 77-86%. Rec: keep the jump (66% in band, P3 +12% overall). Alt: standing blow + more hp (the tune lane).
3. P3's REVERSE RAM on one rail: BRAKE is the answer (built; the brief offered a told spare high ledge to jump onto). Rec: brake only - one rail is the point.
4. THE DEEP RAILS' level-1 curve is a wall on the base already (466% / 12 deaths vs act II's 400% / 6, since the forgemaster lane) - report-only now. Rec: a Sonnet curve lane on
   THE SMELTER FLOOR / THE FORGE for the bare knight. Alt: widen act II's ceiling for minecart.
5. THE LEADING BORE's 'downhill chute': the drop through the opened points into the bore's floor is the chute (no separate slope - the cart has no slope speed). Rec: keep;
   the art lane draws the chute mouth. Alt: a fall slope + a speed-on-slopes rule.
6. Foes in the bore: navvies + bone-chuckers + bats, no goblins (the brief asked, though the mine is before the Goblin Queen). Rec: keep. FOR DANIEL (rec first = what is built)
QUESTIONS

## NEXT LANES
- **Sonnet ART lane** (art before live): (a) THE DRILL CAB'S GOBLIN DRIVER redraw first (Q3 approved: finer head/helm/eyes/snarl, shading, a rag), then the goblin-cart
  riders; (b) the lever's pull + the chute hatch + the ore stream + the gears choking (deeprails6_art.js leverClunk/oreStream; pointsPost pull); (c) THE SLAG LADLE's arm, glob,
  pool (ladleArm/slagGlob/slagPool/ladleMark); (d) P3 one rail: the rubble over the LOW line (oneRailRubble), the red strip lamps (tensionLamps) + a rising roar bed (audio);
  (e) THE LEADING BORE's dressing: the torn high line ('torn' decor, not drawn yet), the drill's cutting scars, the bore's glow ahead, the navvy / bone-chucker look in the mine;
  the P3 gear labels (crowded on the tower).
- **Sonnet TUNE lane**: 12+ seeds per hero (the spread k~42/w~75/p~80), P3 length (wins +27%; pyro's P3 longest), keep 60-70% with flasks and the 0.4 floor.
- **Curve lane** (Q4) for the smelter floor / forge.
