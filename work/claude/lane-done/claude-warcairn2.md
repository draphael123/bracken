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

## Rates (rough - the sonnet tune lane owns 60-70%; L21, practiced, human profile, campaign level)
| state | with flasks (kit) kn/wa/ge/ra/be/py | dry (bare) |
|---|---|---|
| first build (old heroHp) | 6 seeds: 3/6 2/6 4/6 3/6 4/6 3/6 = 53%. Lab diag: he threw ~once a fight (bot stood inside throw.min 90) and never reached a frenzy (rage peaked 75-80) | - |
| throw cd 9->7, min 90->60; rage land/taken/hit 12/8/2 -> 16/10/4 | 6 seeds: 3/6 6/6 6/6 4/6 6/6 5/6 = 83% | - |
| **FINAL: + heroHp x1.15 on every row** | **6 seeds: 5/6 2/6 5/6 3/6 5/6 5/6 = 69% (in band)** | 3 seeds: 2/3 2/3 3/3 2/3 3/3 2/3 = 78% (n is too small) |
- In 6 diagnostic lab fights (knight/warden/ranger) there were 27 throws, 19 grabs and **15 staggers**, the main opening. There were also 4 frenzies, each broken by a drum (4 breaks), and the counter fired. No hero went 0/N. Seed noise is about ±2 wins per hero at n=6.
- Logs: `bracken-warcairn2/work/tmp-warcairn2/rates{1,2,3}.log`, `rates-dry.log` (untracked).

## Checks
- **Node (all rc 0 on the final tree):**
  - warcairn (~190 asserts, including the hatchet fake world, the respawn reset, the boss D/E/F and the bot)
  - level-quality warcairn: CLEARS THE BAR
  - tells (+ `--write`, the counterTell rows), signs, stuck --static, checkpoint-gaps (start + 2 shrines KNOWN row, unchanged), anchor-lint, elites, reach-heroes, sprinkle-cap, mash-gate, solid-islands, one-new-foe, goblin-lint, answer-tags, boss-read, comments, dangling-paths, foe-pass, spawns, floaters, leveling
  - curve-shape, threat-holes, dressing, blow-tags, traps, collectables, deadends, ambush-*, checkpoints/-stand/-thin, architecture, watchtowers, curve-gate (rc 0 mid-lane; the boss-number change since then does not touch them)
- **Page (PORT 6237, one browser at a time, at least 3.2 GB free each time):**
  - warcairn-probe, all ok. That includes real keys: E at the rack, UP+ATTACK at the lip, and the bridge comes down. In the ring his hatchet sticks, E takes it, ATTACK throws it back and he STAGGERS. In his frenzy a blade does x0 and the game says RING THE DRUM.
  - level1-pilot --write: knight, 3 runs, walked 100%, 4 deaths (was 0), 94 lifts.
  - mash-bot --write: 100% walked, 1-2 deaths each, held in rooms.
  - boss-greed: ok.
  - boss-rates as above.
- **Not run:** the full suite (by rule), textfit (no bestiary/store change), hint-shown, mobile-perf.
- **Reviewer** (read-only sonnet subagent vs the Mage's Folly): it scored **9/12**. I fixed all of these:
  - the respawn desync (MUST): the cut bridge and fallen stones were not reset, and the same bug left War Cairn 1's drum gates open after a death
  - the gorge lob window (MUST): it was 3 tiles with the rack outside it. The rack is now at the lip, the box is bigger and the window is cols 61-64
  - the yard rack and the use-signs
  - the false 'low line is safe' sign
  - harpies 6 -> 9
  - his hatchet now sticks within reach (at most 56 px past the hero, 1.7 s, never on a broken slab)
  - the counter's own windup pose and a 0.55 s tell
  - a drop inside a fallen stone is now pushed on top

  Not changed (notes): a plain rack hatchet carried into the ring is a 24-damage poke, not a stagger. Nest hatching only watches player one (co-op).

## Screenshots (scratch/lane-reports/)
warcairn2-gorge-arc.png, -gorge-throw, -gorge-down, -yard-stone, -yard-fallen, -totem, -nest-face, -ring-stone, -chief-hatchet, -chief-rage, -chief-frenzy (RAGE/FRENZY bar, RING A DRUM, the summit cairn + braziers), -summit-braziers. All greybox (tools/warcairn2-shots.mjs).

## ART PASS 2 notes (for the sonnet art lane - brief-warcairn2-1030.md section 4)
1. **Palette: SLATE + SNOW.** Cold blue-grey slate, snow on every flat top and lip (no ice), wind-scoured streaks. The one accent stays war-paint red.
2. **Red war-paint hide BANNERS** on antler poles, one at each named area's start and along the climb.
3. **HIDE TENTS + ANTLER TOTEMS:** a camp in the Drum Gates yard and on the Clan Ring rim (smoke from a fire pit), and two more totem deco variants.
4. **THE BIGGER SUMMIT CAIRN + 2 DRUM BRAZIERS:** greybox now in `war-cairn-hands.js drawSummit`. Iron bowls on antler legs, flaring red on a beat, in his frenzy, and on his drum.
5. **The hatchet kit:**
   - every piece is greybox in `war-cairn-hatchets.js H.draw`: the rack (a carved stone post with 3 hatchets), the hatchet itself (lying / held / spinning), the hauled bridge standing up, its haul rope and tie post, and the swing-down
   - the hanging stone (rope, slate arm) and its landed block
   - the hanging totem and its shatter
   - the twig-and-bone nests on the tower, the gorge span and the high-line span, and their fall
6. **Hero carry pose:** `P.hatchetPose` = 'carry' / 'throw' is set but drawn by nothing (like P.potPose).
7. **The Chieftain:**
   - his RAGE bar art (`BZH.drawHud`)
   - the COUNTER read (row 28 = the bzShrug frame)
   - STAGGERED, with his own hatchet in his shoulder (it uses the hurt frame 27 now)
   - the thong on the TUG
   - the frenzy haze: it is a flat red rect plus a ring now and reads as a pink block (see chief-frenzy.png)
8. **Levels not touched:** the hash moved, so pilot and mash were re-stamped. The art lane must not change the grid.

## QUESTIONS FOR DANIEL (recommendation first; the rec is what is built)
1. Is the gorge's hauled bridge the ONE required hatchet throw (a lock)? **Rec: yes** (A4). Alt: an optional shortcut only.
2. The frenzy holds until a drum is rung, with a 12 s safety cap. **Rec: keep the cap** so a fight can never stall. Alt: no cap.
3. While you hold his hatchet he is one-handed and you cannot swing. **Rec: yes** (carry it to him or drop it with E). Alt: it flies back to him after ~4 s held.
4. A standing nest re-hatches a harpy every 12 s while you are near. **Rec: yes.** Alt: nests only stun.
5. His hatchet sticks for 1.7 s (you said ~1.5) and comes down at most 56 px past you. **Rec: keep 1.7.** At 1.5 the reviewer found it often out of reach after you jump it. Alt: 1.5 s.
6. Rams by the drum at 306 can butt you east into the slab gap at 311-317 (a real pit in the exam half). **Rec: keep**, since rams on narrow ledges is what you asked for and the charge is told '!'. Alt: move it a ledge west.
7. Daniel's frenzy exception means 0 damage, told on every hit. **Rec: keep, as built.** The bar reads 'FRENZY: RING A DRUM'.
