# HIGHLINES1 lane report (claude/highlines1, 11-05): THE HIGH LINES greybox + THE HOOKJACK
Branch `claude/highlines1` (worktree bracken-highlines1), off `claude/highlines-kit` 339c06329 (master 929cc4786). Code tip 5da754790 (+ this report commit).
POST-DEMO and CODE-ONLY: no browser was opened and no Chrome started; no PIDs were left running. NOT merged, NOT deployed.
**Level id `highlines`.** It is on the DEV list only: hidden, with no `needs`, appended last in LEVELS (index 71), and reached with `?level=highlines`. It is not on the road, the map, the demo slice, the level-quality GATE or the boss rush.

## What changed
- `src/highlines.js` (new): `HL_DATA` (pure data: landings, nets, checkpoints, secrets, exit, the line kit and the hookjacks) plus `buildHighLines`. The level is an 80 x 240 shaft between two cliff walls. Landings are one-way decks, so the node sweep and the page agree (nothing bonks a rider from below).
- `src/hookjack.js` (new, pure, in the style of gale-harpy.js): the foe.
- `src/highlines-hands.js` (new): wires the line kit and the Hookjack into main.js, following docs/linekit.md's sketch.
- `src/main.js`: 16 one-line hooks tagged `claude/highlines1`, each guarded with `typeof HLX`:
  - load and reset, kitStep in updateMovers, riderStep in updatePlayer, and the moveBody skip while held;
  - the `lk` mover sync and the spawn, update and take cases for the foe;
  - draw for the lines, rider and foe, the climb pose while on a line, and a gale-harpy shove that sways a rider instead of tearing him off;
  - an UP-key jump (ArrowUp/W) takes a line and works points but never kicks off. The kick is Z, Space or the pad's A.
- `src/level.js`: the import plus `LEVELS.push({ id: 'highlines', ..., hidden: true, dev: true })`.
- `tools/highlines.mjs` (new node proof). `tools/check.mjs` now runs it as `take('highlines')`.
- `tools/level-quality.mjs`:
  - it now reads `L.lineKit` as gadgets (line kinds, points, gondola, counterweight, wind, lee, cut, side lines; place = row on a tall level);
  - `hookjack` is added to the ROLES `heavy` list.
- `tools/one-new-foe.mjs`: skips `lv.dev` levels while they are off the road.
- `docs/linekit.md`: status changed to WIRED.

## Layout, band by band (rows: smaller is higher; route about 340 tiles; 3 checkpoints)
| band | rows | what | foes |
|---|---|---|---|
| 1 FOOTHOLD | 232-206 | **CP1** line-yard. Two grip winches, W1 and W2 (strike to haul, the ratchet holds), each over a cargo net. A miss costs a climb, not hp | crag ram on L1; crossbow on L2 shooting at W2's riders |
| 2 JUNCTIONS | 206-188 | W3 winch with a **points** board: hold UP and you take the side glide S2 to **SILVER ONE**. Then a fast **glide** F1 west and a **kick gap** to F2 (a miss drops you onto W3 or W2). Then the W4 winch | crag harpy diving at glide riders |
| 3 WIND GORGE | 188-164 | Two told crosswind boxes with glides only: G2 east has a tailwind, G3 west a headwind, and riders sway. The winches W5 and W6 sit only in the **lee rocks** at each wall | crossbow on L5; two gale harpies in the gorge |
| 4 AMBUSH | 171-133 | **Cuttable** winches H1, H2 and H3. The first Hookjack rides down H1, with the gorge glide G3 under it as the net. A **cutter** saws H2 from its station (a level down). Points on H2 lead onto the side winch S4 and **SILVER TWO**. A rider Hookjack waits on H3 | 3 Hookjacks; crossbow at the cutter's station |
| 5 LEE HUT | 134-118 | **CP2**. On foot, no line overhead: a 7-lip crevice climb with told rockfall up to the shelf | 2 crag rams on the shelf |
| 6 COUNTERWEIGHT | 118-102 | Stand in the cage and strike the hopper: the stone outweighs any party. In co-op, one hero rides weight A down to send the cage up | crossbow at the station |
| 7 GONDOLA | 102-85 | The **set piece**: board the cab, it hauls up, **creaks** (told), **snaps**, falls, hooks onto the LO glide and docks at the far station | crag harpy |
| 8 EXAM | 104-57 | **No nets.** Winches E1, E2 and E3; E2 runs inside an `exam` wind (sway). The **cutter race** on E1: strike hard and you top it before his 2.2 s saw. Two rider Hookjacks on E2 (never two swipes within 0.8 s), one on E3. A miss falls whole bands | 4 Hookjacks; gale harpy; crossbow |
| CAVE MOUTH | 58-44 | **CP3** before the boss door. A short on-foot climb to **SKYHOOK's landing**, a 40-wide **arena stub** with no boss. The gate leads on into the Ore Road | (SKYHOOK is a later lane) |

- **Pace:** up (winches), then down fast (glides and kicks), wind traverse, the fight band, a walk, a puzzle, the ride, then the exam.
- **Foes:** existing ones (crossbows, crag harpies, gale harpies, crag rams) plus 7 Hookjacks. There are **no goblins**: the Hookjack is a human ropeway rigger.
- **Music:** `skysail` (CC0, unused since the Sky Ship left the road).
- **Rule line:** "HANG ON AND STRIKE: EVERY BLOW HAULS A WINCH LINE UP AND THE RATCHET HOLDS YOU. MISS A LINE AND YOU DROP A LEVEL."

## The Hookjack (src/hookjack.js)
A brigand rigger of the line crews on a hand-cranked trolley with an iron boat-hook. HP 36, no contact damage.
- **Ride:** he cranks along his line at a hero within 170 px, at 110 px/s. His hook is a front **guard**: front blows land at x0.4 (clank, said once); blows from behind land whole.
- **Tell:** at 20 px he stops and draws the hook back for **0.7 s**, with a yellow `!` and his own sound. **He is open:** any blow or shot lands whole and he **loses his grip and falls**. On a landing he then fights on foot; into the void he is gone.
- **Swipe:** 0.2 s, 28 px reach, 12 damage, and the rider is **knocked off the line**.
  - A **parry** (any hero's tap C, read as damagePlayer 'blocked' plus parryT) makes him **spin** for 1.2 s with a gold ring, and one blow drops him.
  - A **held guard** takes no damage and keeps the grip, but pushes you back 24 px along the line.
  - The noStack rule holds a second tell, still open, so two Hookjacks never swipe within 0.8 s of each other.
- **Cutter (the ambush):** waits on foot at a cuttable line's station. While a hero rides that line more than 48 px away, he **saws** for **2.2 s**, told by a red `!!`, a rasp and a fray bar. He is open while sawing, and a blow or shot stops the saw. If the saw runs out the line **parts** and riders drop a level; the kit lint guarantees a catch under every cuttable line. He cuts **once**: when the line is strung again (8 s) he hooks on and rides down at you.
- **On foot:** the same told hook draw and swipe.
- **Every hero can beat him:** the tell stands at 20 px, inside the shortest melee reach (the Warden's bare jab 15 + 5, the Ranger's knife 17 + 5). The parry is the shared tap C. The Ranger's dodge i-frames and the Berserker's TAKE IT go through damagePlayer as usual. Ranged heroes hit him through hurtEnemy like any foe.
- **Greybox picture:** distinct poses for ride, tell, swipe, spin, fall, saw and foot.

## Checks (Node only, one at a time)
- `node tools/highlines.mjs`: **1743 checks OK (57 s)**.
  - lint clean; the grid agrees with the data; no line runs through rock;
  - 3 checkpoints, 2 silvers, no goblins, every placed foe on a deck;
  - all 8 bands present;
  - **810 drops** (every hand line, every 16 px, calm and gust) all land; 32 of them fall more than 40 rows (the exam's cost);
  - **the sweep**: all 9 master heroes at 1 seat, plus the knight at 2, 3 and 4 seats, each 248-255 states. From all 3 checkpoints the exit is reached, with 0 soft-locks, 0 stuck states and both silvers reached;
  - the full Hookjack set (guard, tell, open, fall, swipe, guard push, parry spin, noStack, cutter told saw, stop, cut a level down then ride, the exam race, foot, void) and the 12-hero counter row.
- `node tools/line-kit.mjs`: 648 OK (the kit is untouched).
- `tools/level-quality.mjs highlines`: **misses only `secrets`** ("1 silver off the route"); every other row is ok (mechanics 10 kinds / 5 developed, roles 3, unlocks, checks 3, bands 23, flat 0%). The reason: pacing's walker cannot ride kit lines and counts SILVER ONE as on its guessed route. The node sweep is the real reach proof (both silvers sit at the end of side lines). Owed: reachcore/pacing support for kit lines.
- `anchor-lint highlines`: 33 listed, not failed (24 islands, 9 cantilevers). These are the one-way decks; the art lane draws iron gantry pylons and brackets.
- foe-footing highlines ok; checkpoint-gaps ok; demo-cut all green; goblin-lint ok; one-new-foe ok (dev levels skipped).
- `dangling-paths` ok (12292 files). `node --check` passes on main.js and every new file.
- NOT run: tools/check.mjs (the full suite), or any browser tool (hint-shown, textfit, level-reach, save-safety, zipline and corpses use a browser).

## Browser owed (nothing here has run in the page)
1. A **walk** of the level in the page: the line kit wiring (take, stroke, kick, drop, points, top hop), the moveBody skip, the cab and weight movers carrying heroes (including the falling cab), checkpoints, respawn, and the gate.
2. **Hang-attack feel per hero**: does a swing start while hanging? Is a lunge, dash or vault on a line acceptable? (The kit holds the hero on the line every frame, so a lunge is cosmetic for now.) Tap C on a line, the tuck, ultimates.
3. **Pilots per hero** (level1-pilot, mash-bot) and the co-op leash on falls.
4. **Hookjack in the page**: parry and guard results from damagePlayer for all 12 heroes; ranged shots open him; his death (no SPR yet, so no corpse is drawn).
5. **Reviewer vs THE MAGE'S FOLLY** (a read-only agent), before Daniel sees it.
6. **Camera**: look up the line on winches (CAM_FOOT 0.68 to 0.80) is not wired.

## Art owed (art before live)
- **Tiles and props:** a granite/rime tile kit; iron gantry decks and rock lips with drawn pylons and brackets (fixes anchor-lint); winch drum and crank grip with ratchet pawl; points boards; glide trolley; snap fray; gondola cab (iron and canvas); cage, weight, hopper and stone; lee rocks; gust streaks; cargo nets.
- **Backdrop:** the **CAVE MOUTH** backdrop that grows as you climb (vertical parallax), the Lee Hut (stone with an iron roof), and the arena stub.
- **Hookjack sheet** (about 16x22): ride 2, tell 2, swipe 1, spin 2, fall 2, foot 4, saw 2, plus a bestiary card. **Sounds:** crank rasp, hook twang, guard clank, saw.
- **Integ, when it goes live:** EHP.hookjack, a bestiary entry, foe-cast/contrast-rim rows, the map node, `needs: 'skyroad'`, `oreroad.needs → 'highlines'`, a level-quality GATE row and pilot rows.

## Questions for Daniel (recommended answer first; the lane built the rec)
1. **Is the Hookjack a man or a goblin?** REC: a human rigger of the line crews, since your standing note says no goblins. ALT: a goblin. The road order technically allows it (this level is before the Goblin Queen), but it would be the only goblin on the crag climb.
2. **Cutter: one cut per Hookjack, or repeating?** REC: ONE cut, after which he rides down at you. A repeating saw could lock out melee-only heroes. ALT: he saws again after every restring.
3. **Is a miss in the exam a long fall with no net?** REC: yes, as built. A miss in band 8 drops you whole bands (sometimes to the gondola dock or the crevice); there is no hp cost unless you land in the void. ALT: one net under E2.
4. **Do wind boxes allow winches outside the exam?** REC: no, as built: wind only in its own sections, with glides inside and winches in the lee. ALT: allow sway on winches in band 3 too.
5. **Arena stub size?** REC: 40 x 18 tiles at the cave mouth (the boss lane can shrink it). ALT: carve the plan's 32 x 16 now.
