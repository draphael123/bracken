# claude/canalfix3 - THE FOG CANAL after Daniel's play (Opus, 2026-10-02)

Base: claude/batch55 d12c0941 (master + COMBAT3 + CANALART). origin/claude/batch55 and origin/master merged before this report (both already up to date).
All seven items Daniel approved are built (the six in the brief and item 7, SAFE SWIMS, added mid-lane). Pictures: `work/claude/canalfix3/before` and `/after` (`tools/canalfix3-shots.mjs`, one run each).

## What changed

**1. Clarity** (`src/canal-hands.js` holdTarget / clarity / drawGlint, `src/hint-lines.js` CANAL_NUDGE)
- Whatever holds the barge GLINTS: a warm pulsing star and ring over it, drawn over the fog. When it is off the screen, a chevron sits at the screen's edge and points to it. What glints:
  - at a shut gate, the paddle of the chamber that is not level (the nearest one to her bow);
  - at a bridge, its capstan;
  - at the fog wall, the ready horn;
  - in the basin lock, its paddle while the door is out of reach.
- Her lantern swings toward the machine.
- If she has been held about 10 s and the hero has not come 3 tiles nearer or struck it, one line names the machine without saying how, and repeats every 25 s:
  - THE GATE IS SHUT: FIND ITS PADDLE
  - THE BRIDGE HOLDS HER: FIND ITS CAPSTAN
  - THE FOG HOLDS HER: FIND THE FOGHORN
  - THE DOOR IS TOO HIGH: THE LOCK UNDER HER IS LOW
- **Every stall point**, listed by `tools/canal-pilot.mjs` (STALL POINTS line). Each one now glints:
  - the first lock's paddle;
  - the mill bridge capstan;
  - the garrison capstan (far bank);
  - the fog wall's bank horn, then the pier horn;
  - the set lock's drain paddle;
  - the flight's three fill paddles (the gate face, the balance beam, the summit);
  - the summit bridge capstan;
  - the basin horn and capstan;
  - the basin lock's paddle (the door).
- Two stalls are not barge holds and keep their own hints: THE LONG ARCH (she goes on without you) and the foreman's door.

**2. A night city street** (`src/redraw/canal_tiles.js`, `canal_props.js`, `canal_backdrop.js`)
- **Ground:** stone ledges on corbels replace the timber towpaths. Cobbles cover the open street and quay tops. The warehouse and mill floors are brick jack-arches on iron beams.
- **Iron:** the swing-bridge decks are cast-iron plate, and the ladders are iron. Iron railings and bollards line the street, the towpaths, the high footbridges and the theatre bridge. The signs are cast-iron plaques. The low-bridge timbers are now iron girders, and the booms are iron spars, not logs. The capstan, horn and crank wood is iron too.
- **Rooms:** the mill is brick inside. The warehouse has cast-iron columns and barrels instead of crates.
- **Backdrop:** town roofs and mill chimneys replace the fields and poplars. Brick terraces replace the hedges. Railings and iron bollards replace the reeds and timber posts.
- Palette dress is now `canal` (the village's dovecote, lychgate, yews and stocks are gone). There is no forest bough or grass near layer, and no sprinkled grass.
- **Wood stays only on** the lock gates, the barge, the skiff and the one jetty (the fog wall's pier).
- Gameplay geometry is unchanged for this item. slopes-trace is identical, so the canal was not rebased.

**3. No goblins** (`src/redraw/canal_foes_art.js`, `src/fog-canal.js`, `src/main.js`)
- Each goblin keeps its AI under a human skin. The skin is set by `canal.cnSkin`, which main.js draws as `SPR[cnSkin]`; the frame order and boxes are unchanged.
  - gaffer → BARGEMAN (flat cap, waistcoat, boat hook)
  - boarding gang → RIVER RAT (red cap, striped jersey)
  - the elite → THE DECK FOREMAN (bowler, long coat, watch chain)
  - archer → WATCHMAN (night-watch greatcoat, crossbow)
  - the lamplighter is a man now (it was a green-skinned snuffer)
- Five new bestiary cards. A kill counts on the card, and the "killed by" name is the man's.
- New check `tools/goblin-lint.mjs` (in check.mjs):
  - It **fails** a living goblin with no reskin in the canal (28 reskinned).
  - It **reports** the living goblins in other levels past the Goblin Queen (`crown`).
  - Undead goblins (the `bonegob`, a bone archer) are exempt, per your note.
  - Proved red on the old code (28 bare goblins).

**4. No water keeps you** (`src/canal-hands.js`, `src/fog-canal.js`, new check `tools/canal-water.mjs`)
- **The bug found:** the ground the canal hands you back to could be ON the water.
  - A bright weed mat that gives way was recorded as safe ground, so you were handed back onto air, fell in again, and repeated. The page test caught it: the hero ended at the level start.
  - The same happened on a wading bed.
  - Now no hand-back ground is ever at or under a water surface.
- The race, the mill cut and the lower river have no stair out. Outside the weir run they now hand you back after 1.0 s of wading (`handBack`; a 10-damage bite, to the basin bank).
- **The check:** every water body at every height it can stand at must give a way out.
  - Deep water must hand you back, which means over 9 px deep at every level.
  - Wading or swimming water must reach dry ground within 14 tiles (24 for a swim) with a real jump: 3 up, 4 across, ladders climbed.
  - It also proves the hands keep both promises.
  - Both new page assertions were proved red on the old code.

**5. The wisp** (`src/canal-foes.js` stepWisp / wispTake)
- It is rebuilt on the Burning Village's ember wisp: the same wide turning circle, it never corners you, and it falls away after a dart.
- It is cold green, with the same id `willowisp` (one-new-foe green).
- **Harassing:** close in, it gutters (a yellow !: the shield turns it) and darts through where you stood for 14. That is its damage; its health is still 1.
- Popped, it is an ember for 2.2 s and **re-forms once**. Strike the ember and it is out for good.
- It keeps its lure-ahead trick and the horn rule (clear air sends it home).
- Tested in tools/canal.mjs (pure).

**6. Jenny Greenteeth** (`src/jenny-greenteeth.js`, `-hands.js`, `src/redraw/greenteeth_art.js`)
- **a. She contests the paddles.**
  - A paddle is WORKED: 4 / 4 / 5 strikes by phase, 0.3 s apart. That is 1.2-1.5 s at the walkway, and green pips show the progress.
  - The work slips back after 1.3 s left alone.
  - Her blow landing on you shakes you off the paddle: the work is lost, and the line is SHAKEN OFF THE PADDLE.
  - While you work it she comes to that gate and reaches and lashes at the walkway every 0.28 s. Lured at her light in the fog, she still reaches for whoever works the paddle beside it.
- **b. She fights in her openings.** Stranded or flushed, she SNAPS (a yellow !: block it, or step back; 22) and SWIPES low (a red !!: jump it; 20) at a hero beside her. Her first blow comes at 0.5 s and then every 0.75 s. The window stays 3 s (boss-openings green).
- **c. Each phase breaks the last trick.**
  - The flood comes with the paddle you drained her with knotted.
  - Flushed from a culvert, she goes back into the SAME culvert with its paddle knotted (cut it, then work it).
  - In the fog both lamp hooks are bound with weed (cut each free first).
  - The fog now has a second cycle, THE DARK: low water, a new weed pattern, the drain choked, so the flood lamp is the way.
- **d. Bigger.**
  - She is drawn 1.6x through her own scaled primitives: a canvas of 84x71, which was 52x44.
  - Her body box is 32x44 (was 18x24), and she sits half out of the water. Her eyes and mark were moved to match.
- **Her blows hit harder; her health is unchanged.** Old → new:

| blow | before | after |
|---|---|---|
| grab | 10 | 14 |
| drag | 3 | 4 |
| lash | 14 | 20 |
| reach | 14 | 20 |
| bite | 16 | 22 |
| surge | 12 | 18 |

- boss-greed: her rows are untouched (OWN_WARD, OPEN_RULE gtOpen).

**7. Safe swims, GREEN = HERS** (`src/fog-canal.js` swim(), `src/canal-hands.js` swimStep, `src/canal-foes.js` e.bump)
- Jenny's water (every canal pool) is tinted murky green, with a scum of weed on it.
- A safe swim is clear dark blue behind an iron grate. It uses the game's own swim and breath.
- **THE FLOODED CELLAR**, under the wet dock and the quay:
  - In by a drain grate in the dock's bed (drop through it); out up an iron ladder.
  - The silver lies at the bottom. It is the gorge ledge's silver moved, so the canal keeps the campaign's three, and the ledge has coins now.
  - Its grate faces the Waymeet pound.
- **THE CISTERN**, under the basin lock and the corridor:
  - In by a hatch in the corridor floor before checkpoint three, and an iron ladder.
  - A mend and coins are inside.
  - The basin lock's bed over it is an iron grate.
- **No sign:** the first time you swim one, the nearest grindylow swims to the grate, clanks into the bars and goes back.
- Both swims are optional and off the way, and covered by canal-water. The hatches were placed so slopes-trace stays identical. The basin fog now stops at the lock floor (row 49) so it does not lie over the cistern.

## Numbers

| | before | after |
|---|---|---|
| Jenny, mash bot (`tools/mash-bot.mjs canal`, 3 heroes x 2 seeds) | 0/6 (knight and warden dead; pyro TIMED OUT twice, boss left 95%) | **0/6, all six dead** (boss left 71% / 85% / 47%) |
| Jenny, human-speed bot (`tools/combat-pilots.mjs canal`, 1 seed) | **3/3**: knight win 67.8 s (took 32), warden win 57.9 s (31), pyro win 64.9 s (27) | **2/3 = 67%**: knight win 31.8 s (28), warden win 122.9 s (76), pyro DEATH 82.3 s (boss left 40%) |
| canal level-1 knight route pilot (`tools/canal-pilot.mjs`) | 1 death, 283 damage, lowest 16 | 0 deaths, 242 damage, lowest 23, 2 dips under 40% (target met); the same "MISS down the race into the basin" leg as before |
| level1-pilot (re-stamped) | 65 hits, 6 deaths, 91 lifts | 77 hits, 9 deaths, 98 lifts |
| level-quality canal | clears the bar | clears the bar (secrets 3, pockets/branches 6, density 2.33) |

The knight's human-bot fight got shorter (31.8 s). His stranded blows land 25-147 each, which is the hero's own damage x1.3 or x2.5. Health is not the lever, so I left it.

## Checks (named, never the suite): all GREEN on the final branch
- **New:** goblin-lint, canal-water.
- **Canal and boss:** canal, greenteeth (pure and page), one-new-foe, boss-greed, mash-gate, boss-openings, boss-fight-end (48 fights), level-quality.
- **Text and marks:** tells, hint-shown, textfit, untold-told, foe-tactics.
- **Level structure:** npc-removal, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, slopes-trace (every level identical, no rebase), sprinkle-cap.
- **Art:** dressing, floaters, pixels, footing-art, occluders, render-layers, readability.
- **Pilots run** (tools, not checks): canal-pilot (knight), combat-pilots (knight / warden / pyro, before and after), mash-bot (boss and level, `--write`), level1-pilot (`--write`).

## Goblins left past the Goblin Queen (REPORTED by goblin-lint, for a sweep lane)
- lamplit: snuffer x6
- harbor: horn (hornblower) x2
- undercrown: miner x12, rockgoblin x12, propman x8, sprig x6, sentry x1

The Fair's 4 archers are its knife jugglers already and are not counted. Undead goblins are exempt.

## UNVERIFIED
- Nothing was played by hand. I looked at stills only (`work/claude/canalfix3/after`):
  - the glint shows on the garrison capstan and the horn;
  - the grindylow's bump ring shows beyond the cellar grate in one still;
  - Jenny is bigger, in one awake still.
- Not seen moving: her snap and swipe tells in an opening, the crank pips, the knotted hooks, the lantern swing.
- The human-bot numbers are 1 seed per hero. The mash numbers are 2 seeds per hero.
- Co-op: the nudge, the glint and her "comes for you" read the nearest or any hero; a second hero working the other paddle is untested.
- The ember wisp's dart is now blockable (the canal brief's "a shield turns it"). The Burning Village's ember is unchanged.

## QUESTIONS FOR DANIEL (recommendation built)
1. **The "culvert shortcut under a lock" swim.** A real shortcut past a lock lets the hero reach the mill with no lock rising, which breaks "each machine is the lock somewhere" (tools/canal.mjs asserts it). I built two optional swims: the cellar, whose run under the quay is the culvert, and the cistern. *Rec: keep.* *Alternative:* a one-way culvert from the mill back down to the lock steps.
2. **The gorge ledge's silver is now the cellar's**, so the canal keeps three silvers and the ledge keeps coins. *Rec: keep.*
3. **The race, the cut and the lower river hand you back after 1 s of wading outside the weir run** (10 damage, to the basin bank). *Rec: keep.* *Alternative:* lit stairs at each race step, which is a geometry change and a slopes-trace rebase.
4. **Jenny's numbers:**
   - blows up about 40%;
   - crank 4 / 4 / 5 strikes;
   - opening snap 22 and swipe 20.
   
   The human bot is 2/3, but the knight is still quick. *Rec: keep.* *Alternative:* crank 5 in phase 1.
5. **The nudge** comes after 10 s with no headway and repeats every 25 s. *Rec: keep.*
6. **The canal's wisp dart is blockable** (a yellow !, 14 damage). The ember wisp's is unblockable. *Rec: keep*, since the brief says a shield turns it.
7. **A goblin sweep lane** for lamplit, harbor and the undercrown (list above). *Rec:* a Sonnet art lane, using the same `cnSkin`-style reskins.
