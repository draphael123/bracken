# claude/order: THE BROKEN ORDER, the recurring elite knights (Opus core, 2026-10-11)

- **Brief:** scratch/brief-elite-order.md, including the ADDED and !! sections, plus brief-combat2.md section 4 and its UPDATE.
- **Base:** origin/claude/batch86 06c0f5e3.
- **Branch:** claude/order.
- **Port:** 8844.
- **Art:** placeholder sprites only. The list for the Sonnet art lane is below.

## WHAT IS BUILT

### Modules
- **src/order-chapters.js** holds the data. It has no page or canvas code.
  - `ORDER`: the order's name (rec THE OATHBROKEN), its sigil (a broken milestone), and `master`, the hook for a later order boss. Nothing reads `master` yet.
  - `BODY`: the four bodies.
  - `CHAPTERS`: all 10 regions, keyed through the src/exit-gates.js `KIND_OF` table. Each has a palette, a title, a word colour, 2 signature moves and the battle mage's element. FROST, ASH and HOLLOW are named in `LATER`.
  - `SIG`: the signature moves.
  - `TWISTS`: one row per level twist.
  - `ORDER_AT`: maps a level to its body, chapter, twist, signature moves, affix, hp factor, position, gate and the elite it replaces.
  - `PLANNED`: Daniel's example twists for the roll-out lanes. Nothing reads it.
  - `ORDER_MARKS`: the mark for each windup.
  - `knightRow(id)`: the row that src/level.js `ELITES` uses.
- **src/order-knights.js** holds the runtime: the AI, the twist hooks, the guard rules, the placeholder art and the FX.

### How a knight is wired
- **The knights are elite kinds, not a parallel system.** Each has its own `ELITE` row (`mod: true`, like the construct and the drowned captain) and one dispatch line in `updateElite`.
- **The existing elite code runs them unchanged.** That covers the plate, affix, guard by angle, poise opening, riposte to a mash, ROUSED, leash, gate and purse.
- **Their moves run in `OK.elite()`**, called from `updateEnemies`.
- **Corpses:** each knight wears his chapter skin as `cnSkin` (for example `oathmaul_thorn`), so he dies in it. tools/corpses.mjs now covers wood, marsh and oreroad.
- **Undead or human only:** all four are men of the order. The GRAVE chapter is flagged undead for later.

### The four bodies (kits)

| Body | Moves | Defence and anti-plunge |
|---|---|---|
| **DUELIST** `oathblade` (sword and shield) | **CUT** (yellow !). The blade **glints** on the parry beat; a parry on it makes him reel into the riposte, and two ripostes break his guard. **LUNGE** (yellow !, duck under it: HEIGHT high). | Guard by angle; ripostes a mash. Rule **a, GUARDS HIGH**: a plunge clanks and bounces you, with no damage either way. |
| **BRUTE** `oathmaul` (greatmaul) | **SLAM** (red !!); the maul stays in the floor, STUCK, which is his opening. **SWEEP** (yellow !). | Unmoved like an UNSTOPPABLE elite (elite-kit `unmoved` checks his body). Rule **d, CATCH + THROW**: a told red !! grab; he throws you to the safe side. |
| **LANCER** `oathlance` (war lance) | **THRUST** (yellow !, long reach). **CHARGE** (yellow !). A charge turned on a shield rebounds him, dazed. One that hits pins you to a wall. Dodged into a wall, he is dazed. At a ledge he **TEETERS**: open, with his guard down, and a heavy throws him off. | Rule **b, ANTI-AIR**: a told upward thrust, then an open recovery. |
| **BATTLE MAGE** `oathmage` (blade and focus) | **CAST** (yellow !): his chapter's element as a bolt. A shield turns it; a parry **sends it back**, which interrupts him. A blow while he casts **INTERRUPTS** him: 1.3 s open with his guard down. **BLADE** (yellow !) up close. He keeps to mid range and backs off. | **Wards a shot off his front (WARDED)**; a dash goes through. |

- **Every windup is told:** the mark from `ORDER_MARKS` in its colour, a word over his plate in the chapter's colour, and a sound.
- **One windup at a time:** the elite's `eliteMay`/`eliteTake`, plus `lastTellT` for the anti-plunge reactions.

### Chapter signature moves (built)
- **THORN (forest)**
  - VINE PULL (yellow !): a briar lash that hauls you in to him.
  - SNARE (red !!): a told patch at your feet. Spring it while standing there and you are ROOTED for 0.8 s.
- **BOG (marsh)**
  - MUD (red !!): a told patch that becomes mud for 4.5 s. It slows your feet (`P.syrupT`).
  - WADE (passive): mud never slows him.
- **ORE (mine)**
  - ORE-PLATED (passive, 2 plates): a light blade only **chips** them (x0.4, a clank, ORE). A heavy, a riposte or a throw **CRACKS** one (x0.5 through).
  - SNUFF (quiet, no mark): puts out the nearest lit lamp. While it is dark, his ore regrows one plate every 4 s (RE-PLATED). Strike the lamp to relight it.
- The other 7 chapters' moves are named in the table but not built.

### The three chapters wired into real exams (knights replace the old elites, not add to them)

| Level | Knight | Replaces | Gate | Signature moves | Level twist (from the level's own rule) | Affix |
|---|---|---|---|---|---|---|
| **wood**, FOREST / THORN | **THE BRIAR MAUL** (brute), col 147 | the warding shield captain | 157 | VINE PULL | **TIMBER**: once roused he fells the pine across the yard (a red strip; 18 if you are under it). The trunk lies there and holds him a beat; a SLAM or SWEEP swung across it **STICKS IN THE WOOD** (1.7 s open). Ties "fell the pine" to "the sting sticks in wood". | WARDING (the sprigs at 139-143) |
| **marsh**, MARSH / BOG | **THE BOG BLADE** (duelist), col 98 | the thorned spike goblin | 105 | MUD + WADE | **SHOVE** (yellow !): the channel is at your back. His shield shove drives you toward the deep water; a shield turns it to a step, and a parry earns the riposte. | VENOMOUS (the marsh's fit) |
| **oreroad**, MINE / ORE | **THE ORE LANCE** (lancer), col 458 | the King's Champion | 472 | ORE-PLATED (snuff is not wired here: the only lamp stands in the gate column) | **RUST** (red !!): he grinds his lance butt on the drum yard's plates. The patch under you rusts red and gives a beat later. "Do not stand on rust." His ORE teaches the Winchmaster's heavy/throw key first (B14). | SWIFT |

- **Knights hold the gate:** each holds his existing elite gate (batch81 `eliteGate`). The gate is drawn in the region's barrier look, with his chapter **banner** hung on its face at chest height: a swallowtail in the chapter cloth with the broken milestone.
- **The gate lifts when he falls:** `eliteWatch`, unchanged, says THE WAY IS OPEN.

### The twist mechanism
- A twist is a `TWISTS` row (level, rule, mark, word, numbers) plus a move id in `TWIST_MOVE`, run by a case in `elite()`. The timber twist also has two small helpers, `woodBite` and `logAhead`.
- A roll-out lane adds a twist by adding a row, a move case and an `ORDER_MARKS` entry.
- tools/order-knights.mjs fails if a twist is wired outside its own level, or if two levels of one region share one.

## HOOKS
- **src/main.js**, every hook commented `(claude/order)`:
  - import
  - `SPR` base bake
  - the data block: `HAS_HURT`, `EHP`, `COLS` for bodies and skins
  - 4 `BEASTS` cards
  - the spawn case
  - the 4 `ELITE` rows
  - 4 `updateElite` dispatch lines (`return false`, mod)
  - `OK` install after `EK`
  - `OK.world(dt)` at the top of `updateEnemies`
  - `OK.elite` / `OK.walk` after `updateElite`
  - the plunge-loop GUARDS HIGH line
  - frame selection
  - FX and banner draw at the top of the enemy draw loop
  - `BK.order`
- **src/elite-kit.js:**
  - `orderGuard`, called first in `take()` (ORE chip/crack, the mage's ward)
  - `unmoved` also covers the brute's body
  - the old affix rows `wood|shield`, `marsh|thorn` and `oreroad|heavy` are removed (the knights carry their affix on the ent)
- **src/level.js:**
  - `ELITES` wood/marsh/oreroad = `knightRow(id)`
  - `elites()` gains `replaces`: the replaced ent is removed and the knight keeps its `enc`/`squad`
- **src/marks.js:** imports `ORDER_MARKS` and adds `BY_HAND`, `ANSWER` and `HEIGHT` rows for every body x windup. `MARK` was regenerated with `tells --write`.
- **tools:**
  - New: tools/order-knights.mjs (in `npm run check`) and tools/order-shots.mjs.
  - tools/corpses.mjs: added wood, marsh and oreroad.
  - tools/level-quality.mjs `ROLES`: the duelist, brute and lancer are heavy; the mage is ranged.

## CHECKS (PORT 8844, sequential)
- **tools/order-knights.mjs: 91 checks, all pass.**
  - The table: bodies, chapters, twists wired only on their level, one affix that fits, replace-not-add, and every windup's mark in `BY_HAND` and `ORDER_MARKS`.
  - The guard layer.
  - Every move of all 4 bodies is used and TOLD (mark, colour, word, sound).
  - One windup at a time: 2 knights started 9 windups, none within 0.45 s of each other.
  - Anti-plunge a, b and d. The brute is unmoved like UNSTOPPABLE. ORE chips and cracks. The mage is interrupted and wards.
  - **The duelist's CUT is parried on the beat and he reels.**
  - All 3 twists work.
  - All 3 exams in the real levels: skin and name, gate shut with the banner, the gate lifts on death, he dies in his skin. No page errors.
- **tells:** passes, 910 rows; `MARK` rewritten.
- **answer-tags:** passes, 46 levels.
- **elites:** passes, 77 elites. Mash bot 0/3 against every knight.
- **corpses:** passes (knights die in their reskin).
- **untold-told, boss-read, riposte, knock-into:** all pass.
- **mark-integrity** covers bosses and minis only. The full run flagged `undeadmage|markTell` PHANTOM once; `MI_ONLY=undeadmage` passes. It is flaky and not touched here.
- **one-new-foe:** passes (the order is new in wood only).
- **goblin-lint:** passes.
- **level-quality, wood/marsh/oreroad:** every miss is pre-existing (none of the three is a gated level). Marsh now meets `roles` (heavy + melee + ranged).
- **Pilots re-stamped** (`level1-pilot --write`, then `--curve`). The pilot rows pass. The curve rows:
  - wood: 215% health lost, 5 deaths (FAIL: act 1 wants at most 3 deaths). Its old curve row was already stale.
  - marsh: 275% health lost, 3 deaths (FAIL: over the 250% band). It was 195% with 1 death before.
  - oreroad: 225% health lost, 4 deaths (ok).
  - The two pilot runs vary a lot: wood was 125% with 1 death in the `--write` run.
- **Mash rows re-stamped, level THEN boss:** wood, marsh and oreroad bosses 0/6, `--assert` passes. The level runs die or are HELD, as before.

## 3-SEED SANITY OF EACH KNIGHT EXAM (tools/elite-lab.mjs, human bot x3 seeds + mash x1, campaign level; NO tuning)
The seeds came out identical, so each row is effectively one fight per hero.

| Knight | Knight (hero) | Warden | Pyro | Human wins | Mash |
|---|---|---|---|---|---|
| THE BRIAR MAUL (wood, L1) | dies at 45 s (him 65% left) | wins 51 s / 51 s / timeout 60 s (him 9% left) | wins 16 s | **5/9** | 0/3 |
| THE BOG BLADE (marsh) | dies at 44-46 s (him 19-25% left) | timeout 60 s x3 (him 28-67% left) | wins 17 s | **3/9** | 0/3 |
| THE ORE LANCE (oreroad, L12) | dies at 38.5 s (him 79% left) | timeout 60 s, hero at 1% | wins 27 s | **3/9** | 0/3 |

- **Hero deaths:** maul 3/9, blade 3/9, lance 3/9 (all the knight), plus 3 to 4 timeouts.
- **All three are under the elites' 75-85% target.** The human bot rarely parries and never times a heavy, which is what these knights ask for.
- **The ore lance:** its first version turned a light blade completely (the knight hero did 0% in 60 s). I changed it once, to a x0.4 chip (B15's floor), as a design-standard fix, not tuning. It is still 3/9.
- The flask sweep's elite tuning is the place to bring them into band (see question 2).

## ART LIST (the Sonnet art lane)
1. **The four bodies at Crusader quality, 8 frames each** (`frames()`/`MODE_FRAME` in src/order-knights.js), with keyframed windups and follow-through:
   - 0-1: walk.
   - 2: the windup.
   - 3: the blow.
   - 4: the recovery, which is the opening. It is reused for the maul STUCK, the lance's dazed/TEETER (needs arms wheeling) and woodStuck.
   - 5 and 6: the body's own poses:
     - duelist: the lunge drawn back, and GUARDS HIGH (shield over the helm)
     - brute: the sweep drawn back, and the CATCH (hands up)
     - lancer: the lance couched for the charge, and the UPWARD thrust
     - mage: the blade drawn back, and the blade
   - 7: hurt. The mage's INTERRUPTED pose reuses it today.
2. **Death and corpse frames per body**, in skin. Today the corpse is the hurt frame.
3. **Heraldry and chapter skins:**
   - The broken milestone on chest, shield and banner.
   - Palettes and props for the 3 built chapters: THORN briar wraps and leaf crest, BOG mud-caked greaves and reed plume, ORE plate studs.
   - The other 7 palettes are already in `CHAPTERS.pal`.
4. **The ORE plates:** studs on the pauldrons in 2, 1 and 0 (cracked) states. Today they are 3x2 studs over him.
5. **The gate banner as a baked sprite per chapter**, with the sway. Today it is rects in `drawBanner`.
6. **FX:**
   - the VINE lash (today a line)
   - the SNARE briars springing
   - the MUD patch and the RUST patch
   - the felled PINE: the fall, the lying trunk, and chips when a blade bites
   - the battle mage's bolt per element (10)
   - the duelist's parry GLINT (today a white star), drawn over the sprite
   - the lamp-snuff spark
7. **Bestiary portraits** for the 4 cards.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The order's name.**
   - Rec: **THE OATHBROKEN** (built). "Warden" is already a hero and the warden armour.
   - Alternative: THE ROAD WARDENS. Renaming is one line, `ORDER` in src/order-chapters.js.
2. **The knights' difficulty.** The human bot wins 33-56% against all three, with the elite target at 75-85%. The marsh curve went from 195% to 275% health lost.
   - Rec: **leave the numbers for the flask sweep's elite pass** (built as is, per the brief: no tuning loops). That pass should first teach the bot the parry and the heavy, which these knights exist to teach.
   - Alternative: lower `hp` in `ORDER_AT` now, to about x0.7.
3. **One affix per knight is mandatory.** tools/elites.mjs fails any placed elite without one; the brief called it optional.
   - Rec: **keep the rule** (built: WARDING, VENOMOUS, SWIFT).
   - Alternative: exempt order knights in elites.mjs.
4. **An UNSTOPPABLE elite, and so the brute, is never thrown even when broken.** Knock-into spends the break before `knockFoe` asks `unmoved`.
   - Rec: **a one-line knock-into follow-up** so the finisher-on-break throws a broken UNSTOPPABLE (the brief's "until broken").
   - Alternative: keep it; he is the knock-into target that "stays put".
5. **The BATTLE MAGE's first wiring.** He is built and lab-checked but not placed.
   - Rec: **SPORE battle mage at Sporewood's shield exam (col 412)** in the roll-out.
6. **SNUFF on the Ore Road.** The only drum-yard lamp stands in the gate column, so the move is not wired there.
   - Rec: **wire SNUFF on The Deep Rails (minecart)**, where the cart lamps are.
7. **Co-op.** SNARE and MUD act on the hero the knight is fighting (the main P that frame), not on both.
   - Rec: leave as is until co-op playtests.
