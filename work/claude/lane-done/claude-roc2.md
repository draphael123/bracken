# ROC2 lane report (claude/roc2, Opus; base origin/claude/botreads 2dbafe77)

## The brief

Daniel played the Sky Road on 10-06:

> Sky Road is an impressive level, I like the design. But we need to better use the BOSS with the level's MECHANICS. You can jump on the gliding platforms / thermals and actually hit her, so she DOESN'T NEED TO BE INVULNERABLE BY DEFAULT. She'll need to be a little harder: TWO MORE ATTACKS, move a little FASTER, the LIGHTNING RODS should LIGHT UP a lot more, ELECTRICAL attacks.

I built the coordinator's recommended design. All the work is in `src/roc-eyrie.js`, plus small local hooks elsewhere.

## What changed

### 1. She is never invulnerable by default (B13). She guards by height (B11).

`src/roc-eyrie.js` `H.take` is called from main.js wardedDamage. The Roc is on `FULL_DAMAGE` in `src/boss-greed.js`, so the twentieth chip is gone, but greed is still counted.

| Where the blow comes from | Damage | What the player sees |
|---|---|---|
| **The air the level gives**: riding a thermal, gliding on the cloak, or from above a plain jump's reach (floor - 60 px, so a roost or a crest counts) | **x1.15** | Said once: FROM THE AIR: SHE TAKES IT WHOLE. Counts as the right blow, so no greed (`e.angleHit`). |
| A plain hop | x0.6 | |
| The floor, as she swoops low | x0.25 | The shared read: a clank, a flash and **GUARDS LOW** (`BR.turned`, `src/boss-read.js` `TURN_WORD.roc`). Teaching line, once: HER TALONS GUARD LOW: RIDE THE AIR TO HER. |
| An opening (stuck in the nest, or knocked down) | x1.5 | |
| Her ward | 0 | WARDED (B10, the auto turned blow) |

- **The thermal plunge stays the big opening**: knocked down, open 3.2 s, then a told **3 s ward** (B3; it was 3.5).
- **The room's blows land whole**: the lightning on her mast, and the plunge's own knock.
- **The belfry Roc is untouched.** main.js's old Roc multiplier (x0.1 in the air) now runs only off the eyrie. It had been running on top of the eyrie fight as well.
- **The play is to strike the nest's sun-stone**, which wakes the thermal under her circle. The v2 bot does this.

### 2. About 15% faster (`EYRIE.spd` 1.15)

- Her flight, her dive (diveV 420 to 483), her lerps, her rises, her skid and her rests all scale by 1.15.
- The tells are x0.87, and none is under 0.5 s:

| Tell | Was | Now |
|---|---|---|
| dive | 1.0 s | 0.87 s |
| gale | 0.8 s | 0.7 s |
| feathers | 0.7 s | 0.61 s |
| snatch | 0.85 s | 0.74 s |
| cloud | 0.9 s | 0.78 s |
| bolt | 1.3 s | 1.13 s |
| second storm dive | | 0.7 s |

### 3. Three phases, one new move each (B5)

The phase breaks are at 2/3 and 1/3 of her health.

- **I. THE OPEN SKY**: her kit, as before.
- **II. THE DEAD AIR (new)**. The phase opens with the line THE AIR GOES DEAD.
  - She drags a **storm cloud over YOUR thermal**: the column you are riding, or, if you are not in the air, the live column nearest you.
  - **The tell (0.95 s)**: a red !! over the column, and the cloud darkens and crackles. Teaching line, once: A STORM CLOUD OVER YOUR AIR: OUT OF THE COLUMN.
  - **The cloud caps the column.** Its underside sits 34 px over your head, and the air under it carries you up into it and no higher.
  - **When it lands**: the thermal dies (the level's rule, turned on you). Its underside is **electrified** for 1.5 s: unblockable, 18 x hitK.
  - **The answer**: leave the column in the tell (glide away), or plunge down out of it.
- **III. THE STORM.** The phase opens with the line THE STORM ROLLS IN.
  - As before: the rim thermals die, she perches, the mast bolt knocks her down, and the storm dive comes in twos.
  - **CHAIN LIGHTNING (new)**:
    - **The charge (1.45 s, a red !! at every mast)**: every mast **charges**. A charge level fills each mast's iron bands from the foot up; they glow, crackle and throw sparks. A **rising hum** (new `SFX.mastHum(k)`) quickens with the charge.
    - **The strike**: the arc runs **mast to mast** (0.2 s a hop), each bolt down a mast, and the **floor between** them goes live for 0.3 s: unblockable, 20 x hitK.
    - **The answer**: be off the mast floor (the rims, the roosts) or in the air. Teaching line, once: THE MASTS CHARGE: OFF THE FLOOR.

### 4. The masts light up much more

- The **charge level** sits on every mast:
  - a dim 0.05 in phase I;
  - 0.14 in phase II;
  - **0.45 at all times in the storm**;
  - climbing to 1.0 on a told bolt or the chain.
- Drawn additively: a big glow at the top, a **halo down the iron**, a **light pool** on the floor, lit bands (white and flickering at full charge), and St Elmo's crackle.
- In the storm, sparks fly off the masts, the arena darkens (0.26), and far sheet lightning flickers now and then.
- Pictures are in `work/claude/roc2/`:
  - 1-phase1
  - 2/3: the dead air, its tell and live
  - 4: the storm
  - 5/5b: the chain charging
  - 6: the arc

### 5. The bot

The plan is `src/roc-eyrie.js` `planEyes`. It runs under `o.eyes` (v2) only, so the legacy plan is byte-identical; lab.js only gained `pl.jump`, which the legacy plan never sets.

- **In the air**: it cuts her where she flies, glides to her at her height, and wakes the nest's stone.
- **The dead air**: it steps out of the column.
- **The chain**: it hops as the arc reaches its stretch of floor. Its timing has an eye error: sometimes early, sometimes late.
- **Reaction time**: the dead air and the chain are **seen a reaction after they appear** (0.2-0.35 s, its own die). A first version read them on the frame they were born; that was dishonest, and it is fixed.
- **Every hero reaches her with base movement**: no skills, and 11-33 air hits a fight on knight, warden and pyro.

### 6. Tables

- MARK, regenerated once: `node tools/tells.mjs --write` (`roc|deadAirTell` !!, `roc|chainTell` !!).
- BY_HAND rows for the same two tells.
- ANSWER: deadAirTell dodge, chainTell jump.
- HEIGHT: both low.
- `src/hint-lines.js`: the five new lines.

## Numbers

All runs: `PORT=8688 node tools/boss-rates.mjs skyroad --ways=practiced --jobs=2`, profile human, campaign level L10, normal health.

| Config | Seeds/hero | kn | wa | py | Total |
|---|---|---|---|---|---|
| Before (botreads, the old Roc) | 6 | 6/6 | 5/6 | 6/6 | 94% |
| hp 1100, first build | 8 | 5/8 | 3/8 | 5/8 | 54% |
| + the dead air under the HUD fixed, mast art | 8 | 5/8 | 4/8 | 7/8 | 67% |
| + dead air / chain bite 15 to 18 / 17 to 20 | 8 | 5/8 | 4/8 | 7/8 | 67% |
| rests 1.05/0.9/0.8 (reverted) | 8 | 8/8 | 5/8 | 5/8 | 75% |
| hp 1200 | 12 | 10/12 | 5/12 | 9/12 | 67% |
| **FINAL: hp 1200 + the honest reaction on the new tells** | 12 | **11/12** | **3/12** | **7/12** | **58% in band** |

- **No hero is at 0.** I stopped once the number was in band; that is 12 seeds per hero at the final config, inside the cap.
- **Win times**: knight 85-130 s, pyro 93-146 s, warden 140-198 s. Warden wins run over the 150 s window; see Q2.
- **Per fight**: 11-19 openings, 6-13 plunges, 11-33 air hits, 1-3 dead airs and 0-2 chains (phase III is the last third).
- **Damage taken** is mostly her talons (the dive), her feathers and the mast bolts. The two new moves land on the bot now and then: the chain did 40 to a warden, and the dead air 30 to a pyro.
- **Mash boss: 0/6.**
  - The knight and the warden die at 33 s having landed 0/1161 blows.
  - The pyro dies at 29 s with her at 99%.

## Checks (PORT 8688 only, each one run alone; the suite is the coordinator's)

**Green:**
- skyroad
- skyroad-probe (re-run once: on the first try its dev server did not come up under load)
- skyroad-aloft (and `--page`)
- boss-read
- boss-openings
- boss-greed
- boss-fight-end
- tells
- answer-tags
- hint-shown

**Two assertions were updated for Daniel's design change, not weakened:**
- **skyroad-probe** said "outside an opening a blow is a scratch (<= 0.1)". It now asserts that:
  - an open blow lands at x1.4 or more;
  - a floor blow lands between x0.15 and x0.35 (GUARDS LOW);
  - an air blow lands at x1.1 or more.
- **boss-greed**: its named duelists off the chip (`DUELISTS`) gain `roc` beside the Death Knight and the Matriarch. The test's own comment says a new name there is a design call, so it is Q1.

**Mash rows re-stamped** with tools/mash-bot.mjs, level first and then the boss. Only the skyroad block of docs/mash-bot.json changed.
- **Level (L9)**: no hero clears it.
  - knight: lowest health 10%
  - warden: lowest health 6%
  - pyro: dies
- **Boss**: 0/6. `node tools/mash-bot.mjs --assert skyroad` holds.

**Reds**: none of mine. `tools/tells.mjs` prints that `updateScalder` pourTell and ladleTell are entered with no mark. That was there before this lane and is not the Roc.

## UNVERIFIED

- Not played by hand. The pictures are god-mode stills from a scratch script.
- The chain and the dead air are proved by the bot's fights and the pictures, not by a dedicated probe assertion.
- Frame cost of the additive mast glows, about 9 gradients a frame in the storm, was not timed on a phone.
- The dead air over a rim crest: the rim thermals' crest (y 24) is under the HUD. The cloud is held at y 72 or lower, so a hero above it has it UNDER him: the thermal dies and he falls into the live underside unless he glides away. This is shown in the pictures, not played.

## QUESTIONS FOR DANIEL (each built as recommended)

1. **The Roc is off the chip** (`FULL_DAMAGE`, next to the Death Knight and the Matriarch) and guards by height.
   - *Rec:* keep. This is your 10-06 call made literal.
   - *Built:* x1.15 from the air the level gives, x0.6 from a hop, x0.25 from the floor (GUARDS LOW), x1.5 open, 0 in her 3 s ward.
2. **The spread is wide**: knight 11/12, warden 3/12, pyro 7/12, and the warden's wins run 140-198 s. Her shed feathers are a yellow ! that his shield turns, and the knight takes little else.
   - *Rec:* your playtest first. If the warden feels long, ease her for him by her snatch struggle (`EYRIE.mash`), not her health. If the knight feels easy, make the storm's feathers charged (unblockable, red !!), which fits "electrical".
   - *Built:* neither.
3. **Three phases instead of two**, to keep B5's one new move per phase: II is the dead air at 2/3, III the storm and the chain at 1/3. The storm is now a third of her, not a half.
   - *Rec:* keep.
4. **Her health is 1100 to 1200**: she is hittable far more often, so the fight needed more of her.
   - *Rec:* keep.
5. **Music is unchanged.** The arena still plays `rocphoenix`. No music was in this brief, so there are no new picks.
