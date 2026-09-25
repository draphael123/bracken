# Lane report: THE DEEP reworked, and THE DIVING BELL (claude/deep2)

Branch `claude/deep2`, off `claude/keep2` (`f19d236`), merged with `origin/master` (`f288f9c`) at the end. Brief:
`docs/briefs/deep-rework-2.md`. Daniel, 2026-09-25: "The deep level is too short, and the boss is too easy." Built to rules
A1/A2/A6/A10/A11/A12, B9, C1, E, F10, N and S.

## Commits

| commit | what |
|---|---|
| `8b4cb53` | the brief; `tools/bell-pilot.mjs` (the Bell, 7 heroes x 3 seeds, bossLab, refill, 150 s) and `tools/deep-walk.mjs` (the F9 walker down the Deep, costed per section, a capture per section); the BEFORE numbers and captures (run from a clean copy of `f19d236`) |
| `4a80c31` | the build, in one commit (see "Deviations"): the holds, the tribute ship, the knights, the Bell's opening, the harder Bell, phase 3 and its art, the bot, the checks |
| `4ae8cf9` | the AFTER numbers and captures |
| `646d3d5` | merge `origin/master`: `check.mjs` every name from both sides; `main.js` keep2's DMG tail and HAS_HURT with master's EHP and COLS, `drawRoom` takes all four painters; `marks.js` hand-written part identical but the Vault Keeper's row, MARK regenerated |
| (this) | this report and the post-merge check log |

## What I built

1. **The middle holds are three kinds of ship** (`src/deep-holds.js`, painted in room-local coordinates, fixed to the room): the Wreck
   Stack's four are CARGO HOLDS (unplaned frames, cargo nets, lashed crates, chocked barrels, sacks, a hoist hook), the Kelp Forest's
   are GALLEYS (sooted bulkhead, cold brick firebox and hood with weed glowing in it, pots and ladles, the mess table, weed through the
   seams), the Coral Garden's are GUN DECKS (gun-deck red, gunports with hanging lids, guns on carriages, shot garlands, rammer and
   sponge, and **a cannon thrown off its carriage, lying on its side** with the carriage upturned). A fourth kind, the TRIBUTE hold,
   is the new ship's.
2. **A hull strake under every deck (B9, rule N):** the two courses under each deck board are `L.hullZones`, drawn as the ship's own
   timber. Asserted as a RULE: every deck board in the trench laid on a slab three rows thick or less with water under it is hull. On
   the old code that rule finds **415** boards on rock, not the review's one screenshot.
3. **THE SUNK TRIBUTE SHIP** (`src/tribute-ship.js`), +44 rows between the Coral Garden and the Glowing Drop, the Deep only (`insertRows`
   carries everything under the cut down: grid, creatures, water, air, zones, currents, the arena; the Keep crops the shared source
   before it and does not move). Upright and wedged wall to wall, so she is the only way on. Her rigging (three masts stepped in her
   deck, yards, a crow's nest with a bell of air, a silver on the fore yard's end: S7), then four decks crossed in turn - the weather
   deck, THE TRIBUTE HOLD ('tween deck: banners with the goblin crown, the tribute lashed in rows, spilled coin), the orlop (her brig
   and magazine, `L.cabins`), the bilge (her own ballast, stove in, and out into the Drop). **Three hatches that do not line up, and
   every one BLOWS HOT** (she sank on the vents): unweighted the current throws you back up it; with a stone you walk down through
   it (the game's existing vent rule lets ballast through at a quarter). Stones on every hatch deck, **prise at the stones**, a
   merrowspear covering the first hatch. Air as the level gives it: the crow's-nest bell, a diving bell on her deck, two pockets her
   beams kept, two clams, a kelp bladder off her rail, and the hatch vents. Three checkpoints (landing, tribute hold, orlop).
4. **Three DROWNED KNIGHTS** (`src/drowned-knights.js`, reused): in the Coral Garden's last throat (the only way down), at the foot of
   the first hatch (you arrive heavy and slow), and by the last hatch. **No Drowned Captain** (see questions).
5. **THE DIVING BELL VENTS ONLY TO A STONE ON HIS CROWN (A11).** `vent()` is off the end of every attack and off his charge's wall stop
   (that is a clang and a 0.6 s stop now). A ballast stone let go above him and falling into the valve box on his crown vents him:
   open 3 s at x2.2; shut he takes x0.45. A stone still in your hands opens nothing. **A12:** two platforms of her timber hung by rope
   (drawn, not ladder tiles: a rope tile caught the swimmer) six rows over his floor, each with a rack that sets its stone back when
   it splits on his valve or lies on the floor for 3 s. The floor's two loose stones are gone (walking into one made you heavy under
   his ring). **With you over him, he comes to stand under you** and does not attack until he is there - so a hero on a rack gets his
   pressure bell and steps off over his crown. A cold ring marks the valve while you hold a stone. Sign and bestiary say so.
6. **HARDER:** claw 26 (was 20), slam 34 (28), pressure 24 (18), charge 32 (26); tells ~20% shorter (claw 0.62, slam 0.85, pressure
   0.8, charge 0.7); 0.42 s rest between attacks (0.32 in phase 2), where every attack used to end in a 1.8 s vent. **Health left at
   750** (see numbers: the pilots do not ask for more).
7. **PHASE 3: THE BELL CRACKS AND HE COMES OUT** at a third of his health: a 1.3 s crack (not a window), the cracked bell left on the
   floor (`bakeBellShell`), and the crab out of it (`bakeBellcrabOut`, own 9-frame set: run, snip tell/snip, scuttle tell/scuttle, leap
   tell/leap, hurt; contact sheet `work/deep2/bell-out-sheet.png`): low, soft (x1.3 always), fast (96 px/s), desperate (0.26 s rests),
   three told attacks - SNIP (yellow `!`), SCUTTLE (red `!!`), LEAP at where you were (yellow `!`, its landing ring marked). Marks
   regenerated.
8. **Phase 2 is not changed** (Daniel did not choose one): two proposals below.
9. **The bot** (`src/lab.js`) plays the stone: swims up to a rack's stone (stops level with it: the water floats you past), waits on the
   rack for him to come under, steps off toward him, lets go over the valve, walks off the rack to cut him while he vents, lets a
   missed stone go on the floor.

## Numbers, before and after

| | before (`f19d236`) | after |
|---|---|---|
| grid | 162 x 204 | 162 x 248 |
| main route (`tools/pacing.mjs`) | 299 tiles | 468 tiles (**+57%**) |
| length (`tools/curve.mjs` cols) | 684 | 816 (**+19%**) |
| INDEX (curve) | 155 | 154 |
| checkpoints on the route / worst gap | 11 of 14 / 51 | 13 of 17 / 80 |
| alternations (pacing) | 17 | 29 |
| required breath, worst leg (`tools/breath.mjs`, on its 6 s scale; the Deep drains at half) | 2.60 s (43%) | 4.50 s (75%), the orlop crossing |

**THE DIVING BELL**, `tools/bell-pilot.mjs`, 7 heroes x 3 seeds (seed and a 7 px nudge a seed), refill, 150 s
(`work/deep2/pilot-before.json`, `pilot-after.json`):

| | before | after |
|---|---|---|
| wins | 20 / 21 | **5 / 21** (geomancer 3/3, pirate 2/3, knight/warden/pyro/paladin/reaper 0) |
| median win | 123.6 s | 98.7 s |
| median damage taken | 32 | **408** |
| vents | 550 (26 a fight, every one on his own clock) | 220 (10.5 a fight, every one a stone on his crown) |
| cracked (phase 3 reached) | - | 9 / 21 |

The timeouts end with him at 5-65% (median ~43%). The bot is still a poor stone-player: most of its damage comes from standing on a
rack in his pressure bell. **I did not tune to a number** and did not raise his health; the pilots say the opposite - if anything
he is now too hard for the bot (see questions).

**The walk (S8)**, `tools/deep-walk.mjs`, knight, no god mode, 30000 frames (`walk-before.json`, `walk-after.json`). The walker only
knows across and strokes for the surface; the tool gives it the way down (the nearest opening in the next band) and it is lifted to
the next section's checkpoint when it sticks. Before, it stuck in the Coral Garden (229 blows, 14 deaths, deepest row 154). After, it
crossed the garden (11 blows) and **the hardest section is THE TRIBUTE SHIP: 180 blows, 1375 hp, 16 deaths, 10 lifts** - it cannot
carry a stone down a hot hatch, which is the section's whole verb, so that number is the bot's limit as much as the level's.
Deepest row 191 (the ship's orlop). Neither walk reached the Bell.

Captures: `work/deep2/before-*.png`, `after-*.png` (a section each), `after-look-*.png` (each hold kind, the four ship decks, the Bell
rack), `bell-out-sheet.png`.

## Rule S, item by item

- **S1** placements: a knight in the garden's last throat, a knight at the foot of the first hot hatch (you arrive heavy), a knight
  by the last hatch between the stones and the way down, the merrowspear covering the first hatch on the weather deck, the prise at
  the stones on every hatch deck. `tools/deep-rework.mjs` asserts each knight is by a hatch or throat.
- **S2** NOT MET in the usual sense: the Deep is a swim, and below the shelf there are no jumps. What fails here is a hot hatch taken
  without a stone, or a stone lost to a prise on the way to one (it throws you back up a deck). Not measured with the real jump.
- **S3** the exam is still the Bell Grave's approach and the arena door as before; the ship is now the level's hardest stretch and the
  rehearsal (stones, prise, knights, air) for a boss who opens to a stone. NOT restructured into a formal exam before the door.
- **S4** checkpoints: no pair closer than 40 route tiles except the arena door (checkpoints/checkpoint-gaps green); worst gap 80.
- **S5** no free hearts added; the two `mend`s in the ship are dead-end pockets (section R), filled automatically.
- **S6** the ship is flooded (not air, as the wrecks' holds are): the required worst leg rose from 43% to 75% of a breath on the tool's
  scale. NOT measured as a third of the route above the warning point.
- **S7** the fore yard's silver is off the way down, up in the rigging.
- **S8** walked and piloted before and after (above).

## Checks

Added: **`deep-rework`** (in the suite; `['tools/' + t + '.mjs']` confirmed). Every new assertion seen red first: the holds and the
strake on the old code (415 boards), the Bell's one vent and his attacks-leave-him-shut on the old `main.js`, the start-to-door flood
on a mutation (a mast to the ceiling sealed the ship off - the first cut did exactly that, and `breath.mjs` saw it only as a print),
`boss-openings`' new Bell case on `f19d236` (throws). Changed on purpose: `keep.mjs` (the Bell's four attacks must now leave the shell
SHUT, a stone on his crown opens him), `normal-health` (its winnable normal-health row is Kingswood's; the Deep's was the easy Bell),
`boss-openings` (the Bell case). The keep2 report's citation of its deleted `vault-keeper` module reworded (dangling-paths).

Run after the merge (`work/deep2/check-final.log`): every check named in the prompt plus deep-rework, room-patterns, pixels,
whirlpools, the merged longwater-river, bandits, class-spurs and `tools/breath.mjs`: **57 green, 1 red**. **pixels is
red on the Keep's `checkpoint@259,59` only, and it is red on `f19d236` too** - claude/keep2's, not this lane's. The full suite was not
run (lane rule).

## Deviations

- The five chunks landed as ONE build commit (`4a80c31`): `main.js` carries the holds' hook, the racks' stones and the Bell in the
  same file, and splitting it by hand into green intermediate states was not worth the risk. Everything in it was green together.
- The ship makes the route +57%, not ~+25% (the level's length by the curve's measure is +19%): she is crossed four times.
- The first baseline check run was polluted by my edits landing mid-run; I killed it and took every BEFORE number from a clean copy
  of `f19d236`.

## UNVERIFIED

- **Nobody has PLAYED it.** Whether the stone-on-the-crown reads without the sign, whether a person on a rack steps off over his crown
  as naturally as the bot is made to, and whether 5/21 means "hard" or "unfair" for a person, are all open.
- Phase 3 was seen fighting in the pilots (9 cracks, 5 kills) and on the contact sheet, not framed in a page capture: the capture
  script's camera did not frame the floor.
- The gun decks read dark in the captures (the red is under the level's tint and wash); the cannon on its side is hard to see at 1x.
- Node renders lie about light; the holds were checked in page captures, not played.
- The walker never carried a stone down a hot hatch; a person has not either.

## QUESTIONS FOR DANIEL

1. **Phase 2 (A10): which change?** Two proposals, neither built:
   - **(a) THE PRISE COME OUT OF HIS BELL.** At half health he vents a brood of prise that go for YOUR stone (the level's third thing,
     "the prise that steal your stone"): from then on a stone has to be protected on the way to his crown. One sentence: "now
     something is after my stone."
   - **(b) HE PLUGS HIS OWN VALVE.** At half health he heaves a ballast stone of his own onto his crown: a dropped stone bounces off
     until you knock his plug loose (a told blow to his crown from above - a plunge), then the stone works. One sentence: "now I have
     to unplug him first."
   *Recommendation:* **(a)** - it uses the level's own foe and rule, and it asks something new without a second step to learn.
2. **Is he now too hard?** The bot wins 5 of 21 (it won 20 of 21), and takes a median 408 damage (was 32). The bot is a poor
   stone-player, so a person should do better. *Recommendation:* play it first; if it is too hard, raise the vent's damage (x2.2 ->
   x2.6) or reset the racks faster (2.2 s -> 1.5 s) before touching his health or his hits.
3. **The Drowned Captain in the Deep?** You said the knights also go in the Deep, and three do. The Captain is the Keep's new foe (F10:
   the Keep would introduce nothing new if the Deep met him first), so I left him out. *Recommendation:* keep him the Keep's.
4. **The route is +57% (the level's length +19%).** You asked for longer; the ship is crossed four times. *Recommendation:* keep it;
   if it drags, drop the orlop crossing (the second hatch moves over the third).
5. **With you over him, he comes to stand under you and does not attack until he gets there.** That is what makes the stone land;
   the cost is that hovering over him postpones his attacks for as long as he takes to walk under you. *Recommendation:* keep it; if
   it reads as passive, let him keep his pressure attack while walking.
6. **The two loose stones on his floor are gone** (only the rack stones remain). *Recommendation:* keep it - a floor stone was a trap
   under his ring.
