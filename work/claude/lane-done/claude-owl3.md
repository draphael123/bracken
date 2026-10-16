# claude/owl3: THE OWL REEVE 3 (Hanging Village boss, harder)

Branch `claude/owl3` off origin/master 7ade0605 (BATCH96). Only the boss, the crown arena, the bot's owl hands and the owl checks were touched.

## What she does now (all of these are Daniel's 10-15 calls)
- **A lamp lasts a moment** (`OWL_LAMP` in src/main.js).
  - A struck lamp burns 2.0 s. For its last 0.8 s it gutters (the glow and the lamp stutter dark and bright), then it says OUT.
  - Whatever puts a lamp out leaves the wick smoking for 2.5 s. That covers burning down, a crash, a dazzle, her wing beat or her hoot.
  - A smoking wick will not take a light: the strike clanks and says THE WICK SMOKES.
  - Striking a lamp that is already lit does not top it up. It used to reset to 14 s.
  - **One crash spends it.** A swoop, skim or plunge into the light, or a dazzle by it, puts that lamp out and says THE LAMP IS SPENT.
  - Her crash opening itself is unchanged: x2 for 4 s, then her told ward.
- **The wing beat is a real gust.** This is the `gustTell` → `gust` pair.
  - Windup (0.8–1.0 s, frame 13): she shows "WING BEAT: BRACE" and the wind gathers at her and creeps along the boards the way it will blow.
  - Release (frame 14): a `gustShove` of 230 px/s away from her for 1.5–1.8 s. It goes through `updateMoorWind`, the same path as the Windcaller's howl.
  - Holding down or block on the boards braces you. A hero on a vine is not moved.
  - Every lit floor lamp downwind of her goes out (BLOWN OUT).
  - The lip of the drop it is blowing toward flashes red and says THE DROP.
  - She uses the wing beat more: its weight in her move bag went from 1 to 2.
- **THE DROP (new geometry).** The crown had no drop, so I built one: two 3-tile breaks in the crown boards at tiles 24–26 and 83–85, open to the night below.
  - Falling in costs the hazard share (27%). You are put back on the arena side of the break, with 1.2 s of grace before the next gust can move you (`owlDropStep`).
  - Spiders that fall in are removed.
  - Her CAUGHT carry never drops you over a break.
  - A new sign at tile 10 explains it, and the lamp sign at tile 8 is reworded.
- **BONE PELLET LOB, a new move in both phases.**
  - Windup (frame 15, hunched and coughing): 2 marks in phase 1, 3 in phase 2, drawn on the boards as red rings with a cross. The marks are aimed around you, slightly ahead of where you are moving, and kept off the drops.
  - Release (frame 16, beak open): the pellets arc onto the marks one after another and burst into splinters. Radius 16 px, 22 damage, no shield turns them.
  - Tell table: `!!`, dodge, low.
- **Bug fixed: her skim and swoop now keep their speed.** A blow's knockback on her (the pyromancer's fire) could set her `vx` to 0. She then hung in the skim, striking the hero every second until he died. The skim also has a 1.6 s cap now.
- **Bestiary card** rewritten for the new moves.

## Bot (src/lab.js, owl only)
- **Lamps:** waits on a lamp's inner side, away from the drop. Lights the lamp only as she comes (the swoop or skim line is set, or she is stalking for the plunge), from the lamp's far side from her.
- **Pellets:** steps at least 30 px off the marks. The bot reads the marks from the floor, not from her pose.
- **Wing beat:** braces late in the windup and through the gust.
- **The drop:**
  - Hops a break only when his goal is on the other side.
  - Near a break's lip, nothing carries him toward it.
- **Plunge:** steps out from under her shadow when no lamp is ready. Times the skim jump from her mantle.
- **Owl excluded from:**
  - The shared stuck-hop. Its hop off the lamp carried him into the drop.
  - The shared stamina rest. It stood him still on pellet marks and backed him toward the drop.

## Tuning
`BOSS_HIT.owl` 1.45 → 1.2. Her health is unchanged.

## Rates (campaign L8, practiced, tools/boss-rates.mjs, 12 seeds a hero)
| profile | knight | warden | pyro | total |
|---|---|---|---|---|
| **human (flasks), the target** | 9/12 | 11/12 | 3/12 | **64%** (in band) |
| human+dry | 3/12 | 7/12 | 2/12 | 33% |
| human, BOSS_HIT 1.3 (intermediate) | 8/12 | 10/12 | 2/12 | 56% |

- Fights run about 100–190 s.
- Pyro is the weakest hero here. She has 128 health and gets about 6 openings a fight, against about 10 for the others.
- **Mash: boss 0/6, mini 0/6.** The hanging-village mash rows in `docs/mash-bot.json` were re-stamped, level first and then boss, because the crown change altered the level hash.

## Checks (single, PORT 8955)
- **Green:** owl-lamps (updated to the 2 s lamp), owl-swoop, **owl-gust (new, in check.mjs)**, tells (MARK rewritten with `--write`), answer-tags, duck, boss-greed, boss-read, floaters, goblin-lint, boss-openings, boss-fight-end, hanging-walk, hanging-exam, hanging-pilots, hanging-hoist, hanging-hoist-walk, mobile-perf.
- **textfit (hints, bestiary, boss):** 0 problems.
  - The first run flagged a collide/overdraw on THE WEAVER (the hanging mini's plate). A re-run was clean, so I'm treating it as flaky.
  - The full textfit timed out in an unrelated scope (`talk[warden]`, 480 s) on this loaded PC.
- **Reds:**
  - arena-shut fails on **minecart** only. Hanging is ok; minecart has no change on this branch.
  - Earlier, I ran duck and floaters without PORT, so they ran on this checkout's own port block, not 8955. Both were green.

## Art list for the sonnet pass (greybox now)
1. Owl frames 13/14: the wing beat's windup (wings flung up and back) and release (wings driven down and forward). These are lift variants in `bakeOwl`, src/chars.js.
2. Owl frames 15/16: the pellet cough (hunched, throat full) and the pellet out (beak wide, pellet in it).
3. THE DROP's two breaks (tiles 24–26 and 83–85). Right now they are just carved tiles showing the crown's sky. They need broken plank ends, rope ends, and a drawn void with the village far below.
4. Wing-beat wind: the streaks are 1 px white lines in `drawOwlReads`. Add needle and leaf debris across the boards and something on the drop's lip besides the red edge.
5. The bone pellet sprite (5×5 greybox), its burst of splinters, and the board marks.
6. The lamp's gutter flicker and smoking wick (particles now).

## QUESTIONS FOR DANIEL
1. **The drop.** The crown had none, so I cut two 3-tile breaks, one toward each end.
   - **Recommended, and built:** a fall costs a hazard's quarter and puts you back on the boards. It is not a death.
   - Alternative: make it a real death (A10 amended allows real pits once taught). That would push her well under the band.
2. **Pyro is at 3/12 (25%) while warden is at 11/12.** The total is in band and no hero is at 0.
   - **Recommended, and built:** leave it. Pyro is low HP and gets fewer openings, and this is a bot-reading gap more than the fight's.
   - Alternative: a pyro-friendly lever, such as letting her ember also light a lamp from range (it already does through `embers`), or a longer crash window.
3. **Lamp numbers.**
   - **Recommended, and built:** 2.0 s burn, 0.8 s gutter, 2.5 s smoking cooldown.
   - If it reads too tight in your hands, the burn can go to 2.5 s.

## Commits
b048e965 (the rework), c065aa80 (mash re-stamp), 35a742db (BOSS_HIT 1.2), and the report and mash commit after them.
