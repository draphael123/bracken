# WAR CAIRN 2 - the opus rework lane (claude/warcairn2)

Branch `claude/warcairn2` off master a005867a (BATCH129 live), worktree `bracken-lanes/bracken-warcairn2`. Brief: `scratch/brief-warcairn2-1030.md` (Daniel's 10-30 07:36 approved recs).
**Status: GREYBOX BUILT. The node checks and page checks are green, and the boss rate has a rough read. NOT merged and NOT deployed. Art before live:** this waits for the sonnet ART PASS 2 lane, then the sonnet tune lane.

## What changed
### 1. THE HATCHET, the level's new verb (`src/war-cairn-hatchets.js`, new; bound by `src/war-cairn-hands.js`)
- **Where you get one:** from a **rack** (L.wcRacks: shoulder 62, chimney head 145, yard 187, Totem Face 264, Clan Ring 346), or from a **drop**. An axeman or the hatchet-thrower drops his hatchet when he falls, and it lies there for 14 s.
- **Carry and throw:** it rides on P.carry (`THROW_KIND.hatchet`, light, and you can still climb).
  - E takes it, and E again sets it down. A blow that lands on you knocks it from your hand.
  - ATTACK throws it on the TOLD ARC (`carry-throw.js KINDS.hatchet`). No key throws it flat and fast, UP lobs it, DOWN tosses it short.
- **What it knocks down (L.wcCuts), with no pillars:**
  - **The gorge's HAULED BRIDGE** (TEACH, and the one REQUIRED throw: a LOCK). A lob from the lip (cols 61-64, where the rack is) hits the rope post across the gap, and the bridge swings down.
  - **A HANGING CAIRN STONE** in the exam yard (TEST): it crushes the axeman under it and stays as a step.
  - **A HANGING TOTEM** over the low line's crossed-axe guard (REMIX): it crushes him and shatters.
  - **A HANGING CAIRN STONE** in the Clan Ring (EXAM): it lands on the champion's ground, thrown from the rim.
  - **Three HARPY NESTS** (watchtower, gorge, high line). While a nest stands it hatches a harpy again every 12 s while you are near. Knocked down, its harpies take half their health and reel. A blade knocks a nest down too.
  - **A drum:** a hatchet on a drum is a beat, so you can beat the drummer's drum from range.
  - **A foe:** 24 damage and a stumble.
- **The read:** racks glint, lying hatchets glint, and a carried one shows its arc and landing ring. Targets wear a gold glint ring while you hold a hatchet. There are signs at each first use (rack/edge, yard stone, totem). There is a stall nudge at the gorge (`stuck-spots wc-gorge`).
- **Bots:** the pilot learns a `load: 'throw'` hoist (`src/playtest.js`): to the rack, E, to the lip, UP + ATTACK. The lab's Chieftain bot takes his hatchet and throws it back.
- **Respawn fix (also a War Cairn 1 bug):** respawn does not lay the grid again. A death with a drum gate open, a slab level or a cornice gone used to leave it that way for good. `WCH.reset` and the hatchet reset now put back every changed cell: gates shut, slabs hanging, snow whole, the bridge hauled up, fallen stones taken up. This is proved in `tools/warcairn.mjs`.

### 2. More of the clan's beasts (no goblins)
- **Crag harpies 6 -> 9.** There are 2 more at the gorge, 2 on the high line's nest, and free ones over the broken piers, the gate run and the ring's rim. Six of them are nest-bound.
- **Rams 2 -> 5:** crag goats on the narrow ledges at 259, 306 and 339.
- **Berserkers:** the exam yard's runner is now an ELITE, there is a new ELITE asleep on the low line, and there is a runner on the ring's seats.
- **Mix:** 33 foes. Soldier (clanaxe) 27% is the largest type. There are 4 roles and 1 ranged (the thrower).

### 3. THE BERSERKER CHIEFTAIN 2 (`src/bzchief.js`, `src/bzchief-hands.js`)
- **D. THE HATCHET BACK (the main opening).** His axe throw now **sticks** in the floor for 1.7 s. It shows a gold ring with a timer and the text 'E: HIS HATCHET'. It comes down at most 56 px past the hero it was thrown at, and never on a broken slab.
  - E takes it. He stays one-handed, and you cannot swing while you hold it.
  - ATTACK throws it back. If it meets him he **STAGGERS**: open x2 for 3 s (capped 15%), then the told ward.
  - If nobody takes it, he **tugs it back** on its thong (told, harmless). This replaces the old walk-to-fetch.
  - If you miss, it sticks where it lands and the window starts again.
- **E. FULL-RAGE FRENZY = FULLY INVULNERABLE until a drum is rung** (Daniel's second resist-floor exception).
  - Every blow clanks 'RING THE DRUM' with sparks. A red ring and the words RING A DRUM sit on him, and the bar reads 'FRENZY: RING A DRUM'.
  - The frenzy holds until a beat breaks it, with a 12 s safety cap. Drums re-arm in 6 s. In P3 his own drum stays his, and the other one breaks him.
  - His own hatchet thrown in a frenzy does not stagger him.
- **F. HE FIGHTS LIKE THE BERSERKER HERO.**
  - A hero-style **RAGE bar** sits over his plate (`BZH.drawHud`). It is red as it fills, grey 'RAGE (HELD)' in P1, and blinks gold 'FRENZY' when full. It also names TAKE IT xN / ONE AXE.
  - TAKE IT now **absorbs** blows from the front into rage. When the stance drops, he **COUNTERS**: a told !! riposte (dodge) with its own windup pose (`bzShrug`, BZC_POSES row 28, 0.55 s), which is a cross-chop at +6 per blow he absorbed (cap +18). If it whiffs, his axes stick in the stone.
- **Kept:** flurry, cross-chop, double chop, whirl, P2 pounce, P3 ground-splitter (the ring narrows), the stuck cross-chop, his parry on the beat, B15 >= x0.4 everywhere else (proved).
- **Summit:** a greybox BIGGER SUMMIT CAIRN behind the ring (stacked slate, pole, antlers, red rag) and a DRUM BRAZIER beside each arena drum. The braziers flare red on a beat, in his frenzy, and on his drum.

## Files
src/war-cairn-hatchets.js (new), src/war-cairn.js, src/war-cairn-hands.js, src/bzchief.js, src/bzchief-hands.js, src/main.js (hooks: WCH ctx, BZH hurtBoss, E, HUD, the wcrope ent), src/throwables.js, src/lab.js, src/playtest.js, src/stuck-spots.js, src/marks.js (counterTell rows), src/threat.js, tools/warcairn.mjs (+50 asserts), tools/warcairn-probe.mjs (real-key hatchet + boss), tools/warcairn2-shots.mjs (new, not in the suite), docs/level1-pilot.json + docs/mash-bot.json (re-stamped).
