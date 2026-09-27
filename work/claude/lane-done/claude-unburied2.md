# Lane claude/unburied2 — THE UNBURIED FIELD rework: done

Base: `origin/master` + `origin/claude/batch14` + `origin/claude/polish` (merge `122f8ca`; check.mjs names from both
sides kept, the dressing row merged, the SPEARHEAD line kept as batch14 rescoped it). Master had not moved at the end.
Design written down first and kept current: `docs/briefs/unburied-rework.md`.

## Commits
| item | sha | what |
| --- | --- | --- |
| merge fix | `d70e825` | dangling-paths: `docs/polish/` landed with the polish merge |
| 1 ambush | `9e0e12f` | `tools/ambush-reach.mjs` (new check) + the Sealed Crypt made winnable |
| 2 Barrow Rider | `f8f8f8e` | the Standard-Bearer removed everywhere, THE BARROW RIDER in his place |
| 3 Death Knight | `a720697` | the First Death Knight fights with the Death Knight hero's kit |
| 4 theming | `dae3ec8` | scenery art, crows, ground mist, THE OLD TRENCH LINE |
| 5 INDEX | `7ddbe18` | 89 before, 89 after |

## 1. What the ambush-reachability check found, across all levels
`tools/ambush-reach.mjs` shuts every ambush room the way `ambushShut` does, puts the hero where the lock catches him, and
asks the reach model (`src/reachcore.js`, rides on) for the captain - with gates, stake walls (PALISADE) and ice as rock.
**21 rooms; exactly one fails: THE SEALED CRYPT** (husk@338 from the lock at 321). The other 20 pass.
Why nothing saw it: the reach model's walk stops only at SOLID - it walks through PALISADE and PORT. The chapel's peg wall
(330, rows 26-36, solid floor under it) was on the level's ONLY way on, and the room's real captain was the husk behind
it (a wight had the "captain" tag, but a wight is not an ambush leader, so the tag was never read). `tools/unburied.mjs`
now also crosses the field with every stake wall as rock and no peg in it: red at column 329 before, green after.
Fix: the peg wall moved to the nave over a new crypt stair (as the other peg walls stand over trenches); the crypt is one
floor. `BK.ambushLab`: **1/6 heroes opened it before; 6/6 after, 16.4-30.5 s, all inside Q's 15-35 s**.

## 2. THE BARROW RIDER, as built
Mounted: **THE RIDE-THROUGH `!!`** (draws back to his wall, paws, gallops the room's length THROUGH you and on - jump or
dodge), **REARING TRAMPLE `!`** (close round the horse; standing under him always draws it), **GRAVE-FIRE `!`** (2 slow
green bolts, 3 in phase two, aimed to land where you stand and a stride past), **THE LANCE LINE `!!`** (8 lances out of
the ground toward you). A11 (caused): strike him as he rides through and he is out of the saddle, OPEN 3.2 s x1.6.
Phase two (A10): the horse falls apart; ON FOOT - **THE BANNER THRUST `!`** and the lance line; after 7 s the bones crawl
back (**THE REMOUNT**, a quiet tell) - strike them twice and they scatter, OPEN; left alone he remounts and the horse
holds for 3 moves before coming apart again. 720 health. 24-frame sprite + a runaway horse. Removed with the
Standard-Bearer: his fight, baker (and the draft bake in `src/redraw/queue_bosses2.js`), marks rows, bestiary,
BEAST_SHORT, COLS, EHP, threat row, MINI_DONE, voices, sign, mini name, draft greybox ent, and the checks that named him.

## 3. The First Death Knight: what went, what came
**Went:** THE SWATHE (no version in the hero's kit), THE REAPING (its drag became DEATH GRIP, its ground BLOOD BOIL), THE
SHORT CUT (became THE CLEAVE), the passing's delayed mark (BLOOD BOIL does that job), and the old A11 (the Reaping
cutting his own dead). RAISE became SUMMON SKELETON / GRAVECALL.
**Came in:** THE CLEAVE `!`, DEATH GRIP `!!` (a catch drags you to him and the cleave follows, told again), BLOOD BOIL
`!!`, THE LONG PASSING `!!`, BLOOD WARD (quiet) -> BLOOD NOVA `!!` (grows with every blow the ward kept), SUMMON
SKELETON (quiet); phase two keeps the approved "he is the banner" and adds GRAVECALL (three) and BLOOD SURGE `!!`; his own
nova finishes his dead. **A11 is the hero's own rule: a FULL ward struck again BREAKS** and he reels open. 17 poses on the
polish lane's silhouette. Health 1150 -> 1000.

## Pilot win rates (bossLab, normal health, dice pinned, `opts.salt` per pass, 4 passes x 6 heroes)
| fight | wins | median win | by hero |
| --- | --- | --- | --- |
| First Death Knight, before | 4/24 = 17% | 76.8 s | knight 4/4, everyone else 0/4 |
| First Death Knight, first build | 1/24 = 4% | 130 s | the cleave did most of it |
| First Death Knight, after (tuned) | **13/24 = 54%** | 74.6 s | warden, pyro, pirate 4/4; reaper 1/4; knight, paladin 0/4 |
| Barrow Rider | **13/24 = 54%** | 64.7 s | knight, pyro, pirate 4/4; reaper 1/4; warden, paladin 0/4 |
The salt changes almost nothing: these fights are deterministic, so 24 rows are six fights played four times (only the
reaper's rows ever differed). Files: `docs/unburied2/knight-pilot-before.txt`, `knight-pilot-after.txt`, `rider-pilot.txt`.
`tools/unburied-pilot.mjs` now passes `opts.salt`; it did not before, so every earlier multi-pass pilot of this level
replayed pass one.

## 5. INDEX
89 before, 89 after (the index counts contents; the Rider scores as a mini like the Standard-Bearer, scenery is not
counted). `docs/unburied2/curve-before.txt`, `curve-after.txt`.

## Screenshots committed (real page, BK.step renders, 2x)
`docs/unburied2/rider-sheet.png` + rider-{ride-tell, ride-gallop, trample-tell, grave-fire, lance-tell, lance-line,
horse-falls, foot-thrust, remount-bones}.png; `knight-sheet.png` + knight-{cleave, grip, grip-chain, boil, passing, ward,
nova, summon, gravecall, surge}.png; `field-before-*.png` / `field-after-*.png` (10 spots each); `crypt-after-*.png`.
Camera: `tools/unburied2-shots.mjs <rider|knight|field|crypt> [tag]`.

## Checks
Final subset run, one pass, all green (31): unburied, unburied-fights, tells, boss-openings, boss-fight-end,
arena-supplies, one-new-foe, threat-holes, audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints,
skins, dressing, signs, ambush-single, **ambush-reach (new)**, elites, mini-names, map-grammar, textfit, pixels, comments,
syntax, homepaths, dangling-paths (+ content-audit run alone). Re-runs: none needed at the end; during the work `signs`
failed once on the Rider's first sign (3 lines) and was fixed; `dangling-paths` failed once on the merge (fixed, `d70e825`).
Every new assertion was proved red first: ambush-reach and the stake-wall crossing against the old level; 15 + 17
mutations of the fights module against unburied-fights, 3 + 3 against boss-openings, 2 against the trench-line assertion.
Never ran the full `npm run check`.

## Parked questions for Daniel (each with a recommendation)
1. **The reach model walks through stake walls and gates** (`src/reachcore.js` stops a walk only at SOLID). It hid the
   Sealed Crypt and it hides any palisade on a route anywhere. *Recommend:* a lane of its own that makes PALISADE/PORT
   walls in the model and re-runs every reach tool - expect it to find more, like the grass report did.
2. **The toppled tower is crossed only by the trebuchet's breach**: the peg wall at 246 cannot be climbed over, so the
   "climb stays" comment is not true in play. *Recommend:* play it; if the tower climb should be a real second way on
   (B4), give the 246 wall a way over or under.
3. **The pilots are deterministic**, so "four passes" is one fight per hero. *Recommend:* have bossLab vary the hero's
   start position or reaction delay by the salt, so a pass means something.
4. **Balance by a person:** Rider and Death Knight both at 54% for the bot, with the paladin at 0/4 on both (he eats the
   trample and the cleave). *Recommend:* play both as the paladin before any more tuning.
5. **Ride-through timing:** jumping a 290 px/s gallop is tight on flat floor (the wreck ledges help). *Recommend:* feel
   check; if it is too tight, lengthen the ride tell (1.0 s) before slowing the horse.
