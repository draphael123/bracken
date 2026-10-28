# claude/abbot3: THE FALSE ABBOT 3 - "THE HOUSE ANSWERS THE BLOW" (Opus build + tune)

Brief: `scratch/brief-abbot3-1026.md` (Daniel 10-26, "No this works"). Base: claude/batch125 a36bf11c. Worktree `bracken-lanes/bracken-abbot3`, PORT 8823.
Greybox gameplay build: the art lane (sonnet) owns the look. Not merged, not deployed.

## What changed (how you HURT him - his attacks are kept)
His ward now comes from the house. Each phase he prays at one of the monastery's devices. The device glows while it blesses him. The level's verb turns that device on him, and that is the opening (`src/false-abbot.js`, the house layout is `arena.house` in `src/level.js`, the world side is `src/main.js` abbotHouse/abbotHouseStep/abbotPhase3/abbotHouseReset).
- **P1 THE BELL BRIDGES (hp > 66%).** The belfry has a WEST TOWER (deck 17-22@24, step 22-25@27), the great bell's GALLERY (the old beam walk) and an EAST TOWER (74-79@24, step 70-73@27). They are joined by two BRIDGES (23-42@24, 68-73@24), and each bridge hangs from a BELL under each of its ends. The bells hang at a standing hero's head height, so you strike them from the floor. He swings up onto the bridge nearest you on his rope, a few steps out from its bell, and KNEELS (3.2 s). That bell glows. Strike it and the bridge's tiles are taken up: he FALLS with it and lands STUNNED, which is THE OPENING (4.2 s, x2). A bridge he is merely crossing drops him too. The bridge is hauled back up after 6.5 s, told 1.4 s ahead by a creak, the rope, and the bridge swinging up.
- **P2 THE CHAIR (66-33%).** "HE CUTS HIS BRIDGES" (told): both bridges drop for good. His red-and-gilt abbot's CHAIR hangs at row 23 beside the great bell, on a rope over the roof beam to a BASKET (a `lift` mover at 52@28, one hop up). He swings up into the chair and prays out of reach (5 s). RIDE THE BASKET DOWN and the chair comes down with it and spills him out, which is THE OPENING. After a finished prayer he comes down on the rope to fight.
- **P3 THE WHEEL AND THE SMOKE (< 33%).** "THE WHEEL TURNS FOR HIM": two PRAYER WHEELS are set up, one under each end of the gallery. They are real `pwheel` props laid at runtime, each with its 2-board stair turned AWAY. He kneels at the wheel nearest you (3.4 s). His censer is set down beside him and SMOKES, a column that LIFTS you (the incense rule). Ride the smoke up, or strike the wheel to turn its stair up over him, then PLUNGE on him for THE OPENING. Striking the wheel he prays at also spoils the rite. In P3 a plunge on him while he is warded breaks the ward and opens him too.
- **THE FINALE.** In P3, a blow that would take him under 5% beats him DOWN instead. He kneels for 8 s and THE GREAT BELL glows. Ring it and the note goes through him: the last blow, a kill. The blade on him while he is beaten does B15's 0.4, never nothing. If the bell is not rung he gets up, and after that the blade can finish him. At any other time the great bell only rings ("IT WAITS FOR THE LAST BLOW"). Standing under it is no longer a mechanic.
- **The device is always near you.** A hero walks about 56 px/s and the room is 1470 px wide, so he prays at the bridge, bell or wheel nearest the HERO. The chair and basket sit by the great bell, in the middle of the room.
- **Kept:** censer, chain (cast/haul/reel), bell rope + slam (it now goes UP onto a bridge or tower when you stand there), false light (it lands on your level), coals, knell (P2+), the rite as his heartbeat (heals 8%, wards x0.4, 6 s), and the congregation. B15 floor 0.4, B10 WARDED clank.
- **Gone:** baiting him under the great bell, and the sanctus bell post (the devices took their places). `abbotSanctus` is kept as a null stub.
- **Smaller changes:** coals now start a stride out from him (`coalFrom` 34), so they punish standing off rather than the blade at his elbow. Censer tell 0.55 -> 0.7 s. Censer damage 20 -> 15, chain 16 -> 12. Congregation in P2+ is 2 every 6 s (was 3 every 4.2 s), and 12% of it is archers (was 25%). The well's trapdoor (35-45@30) is BARRED while he fights and reopens on every try: a plunge or a crouch on it used to drop the bot into the well mid-fight (240 s timeouts). The camera looks up from the floor during his fight so the chair and bridges stay in frame. arena.y0 is 20.
- **Bestiary** (main.js) rewritten. The old text said "a FIFTH". Signs: 22,29 is now the bridges' sign, and 50,29 is the chair/basket sign (moved from 30). The hints: "A BELL DROPS THE BRIDGE IT HOLDS..." and "THE GREAT BELL IS THE LAST BLOW...".
- **Numbers:** hp 3000 -> **3700**; BOSS_HIT abbot 1.35 -> **0.95**.
- **Bot (`src/lab.js`, abbot branch rewritten).** It reads the house by where he IS (deck, chair, smoke), because his pose reaches it a reaction late. Its order is:
  1. Walk off the boards; step off the whole line of his coals.
  2. Ring the great bell when he is beaten; get on him when he is open.
  3. Guard or hop the chain; step off the slam mark and the false light's mark.
  4. Censer (shield up, or out of reach); coals tell (in at his elbow, or past the line).
  5. Arrows.
  6. On a bridge: strike its nearest bell. In the chair: hop into the basket centred and ride it to the bottom. At the wheel: ride the smoke and plunge.
  7. Adds; fight him on the floor.
- **Tests:** `tools/false-abbot.mjs` is rewritten for the house. This is a stated design change, not a weakened test: 78 checks cover the bridges, chair, wheel/smoke/plunge, finale, the house being worth at least double (57 s vs 400 s), tells, marks, block/hard, and frames.

## Rates (boss-rates spire, practiced, L12 campaign, flasks kit, profile human, 12 seeds/hero)
| run | hp / BOSS_HIT | knight | warden | pyro | all |
|---|---|---|---|---|---|
| **final, WITH flasks** | **3700 / 0.95** | **3/12** | **11/12** | **9/12** | **64% in band** |
| dry (human+dry), 6 seeds | 3700 / 0.95 | 0/6 | 5/6 | 4/6 | 50% |
| mash bot (boss) | | 0/2 | 0/2 | 0/2 | **0/6** (stamped) |

Win lengths: knight 82-106 s, warden 65-181 s (median about 100), pyro 51-114 s (median about 75). Several pyro wins are under the 90 s target. The knight's 9 losses left him at 6-39%.
The tuning path is in `work/abbot3/r*.log` (uncommitted).

## Checks run (targeted; the full suite was NOT run)
- **Green:** false-abbot (78 ok), belfry, monk-machines (170 ok), monastery3-beats, solid-islands, floaters, architecture, comments, tells, untold-told, boss-openings, damage-caps, blow-tags, level-quality spire, reach-heroes spire (0 crossings), stuck --static, false-abbot-art, boss-read, boss-greed, ability-poses, gob-priest, mark-integrity (MI_ONLY=abbot), boss-fight-end (all 68 fights), zoom-coverage, textfit hints/bestiary/worldplates, small-adds (worst row 20%).
- **Mash rows re-stamped**, level THEN boss (`docs/mash-bot.json`).
- **Red, not this lane:**
  - mash-gate: `crown: the level changed since the mash bot ran`. This lane's diff touches only spire.
  - relics: `storm` has 3 problems (vault silver). Not spire.
  - Neither was checked against the base.

## Pictures
Greybox, before art: `scratch/lane-reports/abbot3-p1-bridge-rite.png`, `-p1-bridge-drops.png`, `-p2-chair.png`, `-p3-wheel-smoke.png`, `-finale-beaten.png`.

## QUESTIONS FOR DANIEL (rec first; built = the rec)
1. **The knight is 3/12 while the warden is 11/12** (abbot2 was also 3/12). His losses come from the censer inside its reach, greed reprisals and the congregation. Rec: a knight-shield bot pass in the sonnet re-tune; the overall rate is in band and no hero is at 0. Built: censer 15 and told 0.7 s, chain 12, coals a stride out, fewer bows.
2. **Two bells per bridge and two wheels, and he picks the device nearest you.** The brief named one of each. The room is 1470 px and a hero walks about 56 px/s, so a single far device was never reachable inside a prayer. Rec: keep. Built.
3. **The chair and basket rope:** riding the basket DOWN brings the chair DOWN, as you described. Rec: the art lane draws a catch or windlass on the beam so it reads as a mechanism. Built: a plain beam and two pulleys.
4. **Finale:** while he is beaten down the blade does 0.4 (B15, never a wall) and the great bell kills him. The window is 8 s, then he rises and can be finished by the blade. Rec: keep. Built.
5. **Some pyro wins are under 90 s** (51-58 s, her burst in the openings). Rec: accept for now, or cap one opening's share like the Coffin King. Not built.
6. **The trapdoor is barred during his fight.** Rec: keep; it stops a mid-fight fall into the well. Built.

## For the art lane (sonnet)
All of these are canvas primitives in `drawAbbotHouse` and need real art:
- the bridge bells and their hangers and ropes;
- a dropped bridge hanging off its tower and swinging back up;
- the chair (a red box with gilt now);
- the roof beam and pulleys;
- the smoke column and the set-down censer;
- the wheel glow;
- the great bell's finale glow.

His frames are unchanged. 'fall' uses hurt (17) and 'beaten' uses downed (16); give the fall and the spill their own poses (B16). The basket uses the monastery's basket sprite.

## Final sha / branch
See the lane report in `scratch/lane-reports/abbot3.md` for the final sha.
