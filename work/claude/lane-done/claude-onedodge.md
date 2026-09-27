# Lane ONE DODGE (claude/onedodge) - report

Daniel: "we have a dodge roll... why not just make it a standard dodge like when you double tap the keys. Doesn't really
make sense to have two separate dodges." Done: **there is one move.** Branch `claude/onedodge` = `origin/master` + `origin/claude/geo2`
(merged twice: once at the start, and again at `80035b2` for the STONE WALL / bot-shield follow-up) + this lane.

## Shas

| sha | what |
|---|---|
| `0fd9755` | One dodge: the double tap and V are the same move (mechanics, passives, trials, hints, signs, controls card, `tools/one-dodge.mjs`) |
| (merge) | `origin/claude/geo2` at `80035b2`, merged clean |
| (this file) | the report |

## The one move

- **Asked for** by tapping a way twice, **or** by V / SHIFT / pad B. The button stays: a stick cannot be double-tapped
  reliably, and every tell in the game was timed for one instant press. The controls card now says so (`TELLS ARE TIMED FOR ONE PRESS`).
- The double tap is read **with the other presses** (the play-state input buffer), not inside `updatePlayer`: it simply
  *is* the dodge button, pointed (`P.dbuf` + `P.dbufDir`). So a double tap made during a hitstop is no longer lost, and a
  perch, a pin, a landing and the ceiling (magePlayer) all answer it the same way as V.
- **Goes** the way you tapped. The button goes the way you hold, else the way you face.
- **Grace**: the dodge's own, from its start (`P.dodgeInv`: the roll's length for most; STEP_INV 0.09 s for the Warden).
- **Carries like the dash did**: the dash's pace, held and bleeding off to a run (so every gap the dash cleared is still
  cleared - the signs in the first wood and the open yard say so).
- **In the air: once per landing** (SLIPSTREAM: twice). Water is footing, as before.
- **Follow-ups**: X early in it is the DASH ATTACK (the Geomancer's ROLLING STONE) and ends it; a jump out of it is a
  running jump and ends it (the Warden's: the vault).
- **One wind cost** (the dodge's: `dodgeCost()`, the Warden's `stepCost()`), **one cooldown** (the dodge's; `P.dashCd` mirrors it for the lab's hands).

## Per hero: what their one dodge is now

| hero | the move |
|---|---|
| Knight | the roll: 0.3 s of grace at the dash's pace (265); X early = THE SHOULDER CHARGE |
| Warden | THE STEP. V is her back-step, as ever: she does not turn, 0.09 s grace, two quick then the wait, no dash in it. A double tap points it: backward is the back-step; **forward** is the same step going in (265), and a jump out of it VAULTS; X early = THE LUNGE |
| Pyromancer | THE CINDER ROLL / scorch: alight through it (burns what she passes), costs 8 heat, 0.34 s grace at 300; X early = THE FLAMING SLIDE |
| Paladin | THE SHOULDER: the pauldron goes first and turns what it meets, 0.26 s at 230; X early = THE SHIELDLESS CHARGE |
| Freebooter | THE ROLL at 285, +90 while the RUM is in him; X early = THE BOARDING LUNGE |
| Death Knight | THE PASSING: untouchable, leaves the wake that takes the blows and goes off; X early = THE GREATSWORD RUSH |
| Geomancer | BURROW on the floor (under it and up ahead; ROLLING STONE as she surfaces). In the air, in water and on a ceiling she has no floor to go into: a plain dodge (the dash in it, so X early is the ROLLING STONE) |

## Every passive that touched either move - new wording

| passive (hero) | was | now |
|---|---|---|
| AIR ROLL `airRoll` (knight) | dodge once in the air, every jump | your dodge in the air lifts you a little, where it would only hold you level |
| SWASHBUCKLE `swash` (pirate) | roll once in the air, every jump | your roll in the air lifts you a little, where it would only hold you level |
| SLIPSTREAM `airDash` (knight) | dash twice before you land | dodge twice before you land, not once |
| TUMBLING CUT `rollCut` (pirate) | an unaimed swing out of a roll is a dash attack: it carries you on and throws what it hits | an unaimed swing anywhere in a roll is the dash attack, not only early in it |
| HEAVY TREAD `heavyTread` (paladin) | the shoulder dash sends a quake rolling on ahead of you | the shoulder (your dodge) sends a quake rolling on ahead of you |
| LONG PASSING `longPassing` (reaper) | the passing goes half again as far, and marks everything it goes through | the passing (your dodge) goes half again as far, and marks everything it goes through |
| LIGHT FOOT `lightFoot` (warden) | the hop back carries her 15% further a point | her step, back or forward, carries her 15% further a point |
| GIVE GROUND `giveGround` (warden) | the hop back staggers whatever had got inside the spear | the step back staggers whatever had got inside the spear |
| VAULTER `vaulter` (warden) | the pole vault costs no wind: dash, plant it and go as often as you like | the pole vault costs no wind: step forward, jump, and go as often as you like |
| AIR POINT `airPoint` (warden) | leaving a pin hands back her jump and her dash | leaving a pin hands back her jump and her air step |
| ENDLESS SKY `endlessSky` (knight) | ...gives back your air roll and your jump | ...gives back your air dodge and your jump |
| unchanged, still true | | LIGHT STEP, FOOTING (dodge cost), EVASION, ASH CLOAK, PHOENIX TRAIL ("every dodge"), RUM ("a longer roll"), QUICK HANDS ("out of a roll"), LONG VAULT |

Two notes on meaning. **TUMBLING CUT had been dead**: it set `P.dashLate`, which `dashCutNow()` never read for a hero with a
`DASH_STRIKE` row, and since round two every hero has one; it now widens the dash-attack window to the whole roll (unaimed
swings only, so it never buries the rising cut or the low sweep). **AIR ROLL / SWASHBUCKLE** used to be the only way to
dodge in the air at all; everyone has one air dodge now, so they became the lift (vy -80 instead of holding the fall at 40).

## What else changed

- **Trials**: THE DODGE (knight, pyro, reaper, pirate, paladin) says "TAP A WAY TWICE, OR V", pad hint "B, OR THE STICK
  TWICE"; THE DASH ATTACK says "DODGE AT HIM (TAP A WAY TWICE, OR V) AND X AT ONCE", pad "B, THEN X AT ONCE".
- **Hints**: the dash-attack lesson and first-use hints say DODGE, not DASH. Hero descriptions: "X early in a dodge".
- **Signs**: "TAP A WAY TWICE TO DODGE: IT CLEARS A GAP" (first wood, open yard); "A DODGE, THEN X, IS A DASH ATTACK".
- **Controls card**: the `dash` and `dodge` rows are one `dodge` row (TAP A WAY TWICE, OR V / SHIFT - B) plus the reason
  line; the Warden's row reads `step: V BACK, OR TAP A WAY TWICE`. The card now spaces its rows to fit: at 8 px apiece
  `drop` and `to shrine` had already run off its foot on master (twenty rows) - pre-existing, fixed on the way.
- **Bots**: nothing had to be rewritten. The lab's dash hands (double tap, then X while `P.dash`) now make the dodge and
  cut out of it; every `BK.press('dodge')` / in-page `apress('dodge')` that holds a way while pressing now goes that way
  (before, it went the way the hero faced the frame before, which was often INTO the blow).
- **New check** `tools/one-dodge.mjs` (in `check.mjs`): tap = dodge with grace, tapped way, dash in it, same cost as the
  button; button by face and by hold; once in the air; X early = dash attack and ends it; jump out of it; Warden back-step
  (no turn, no dash) and forward step + vault; Geomancer burrow on the floor, plain dash in the air. **Proved red first**
  on the pre-merge code: 6 of its 14 assertions failed there (the tap had no grace, cost 8 vs 16, the button carried no
  dash, the air dash had no grace, the Warden's tap had no step in it, the Geomancer had no air dodge).

## Lab before / after (bossLab, dice pinned per row, normal health, 7 heroes x 3 seeds = 21 fights a boss)

Both runs on code without the geo2 follow-up (`45b7efb` base vs `0fd9755`), so the only difference is this lane.

| boss | before | after | move |
|---|---|---|---|
| wood | 67% | 67% | 0 |
| kings | 100% | 100% | 0 |
| spire | 57% | 57% | 0 |
| crown | 29% | 38% | +9 |
| reef | 19% | 24% | +5 |
| flotilla (quarter) | 57% | 67% | +10 (at the line, not over) |
| **hurricane (captain)** | **0%** | **24%** | **+24** |
| deep | 62% | 67% | +5 |
| waymeet | 62% | 71% | +9 |
| **undercrown (prince)** | **24%** | **57%** | **+33** |

**Two bosses moved more than 10 points - reported, not retuned** (bosses are out of this lane):
- **The Captain (hurricane) 0% -> 24%**: the Death Knight 0/3 -> 3/3 and the Pyromancer 0/3 -> 2/3; every other hero still 0/3.
- **The Prince (undercrown) 24% -> 57%**: Freebooter 0/3 -> 3/3, Death Knight 1/3 -> 3/3, Pyromancer 1/3 -> 3/3,
  Geomancer 0/3 -> 2/3; the Knight and the Warden went 1/3 -> 0/3.
- Likely causes, in order: (1) the bots' "hold away and press dodge" now goes away - before, the button went the way the
  hero faced last frame, so a bot often rolled *into* the blow; (2) the dodge now carries the dash's pace (the Death
  Knight's passing went from 205 to 265, x1.5 with LONG PASSING), so the no-shield heroes get further from a blow.
  Seed-to-seed noise at 21 fights is several points, so the +5/+9/+10 rows are within it; +24 and +33 are not.

## Checks

Subset run (the gate was NOT run, per the lane rules): combat-feel, attack-buffer, attack-animation, starter-kits,
ability-poses, skill-passives, talents, levelling (+ levelling-runtime), progression (+ progression-runtime), reaper-input,
knight-rework, geomancer, pilot-actions, boss-openings, boss-fight-end, combat-replay, tells, textfit, skill-menu, comments,
syntax, one-dodge, hero-trials: **all green**, run twice - once on `0fd9755`, and again after the geo2 re-merge (`80035b2`); syntax on the re-merge covered every file the merge touched (`node --check`).
- `signs`: 1 of 592 signs over two lines - `trial_geomancer @32`, the Geomancer yard's ROCK SHIELD step, which came in with
  geo2 and fails identically on the pre-lane base. Not this lane's; one of mine (the open-yard sign) did run over and was
  shortened back to two lines.
- `dangling-paths` (run as a courtesy, not on the list): 9 citations in `docs/INTEGRATOR.md` and `docs/SECOND-PC.md` to files in no commit - all from master, none from this lane; `homepaths` green.
- No re-runs of failing checks were needed: nothing on the list failed.

## Parked questions, with recommendations

1. **The Warden's button always steps back** (it does not follow the held way, as everybody else's does). Kept because
   the back-step is her whole defence and the bots rely on it. *Recommend: keep.* Her double tap already points it.
2. **Captain and Prince got easier for the no-shield heroes** (+24, +33). *Recommend: re-run their pilots after this
   merges before touching either boss - the bot-direction fix may be the lab catching up with what a player always did,
   in which case the old numbers were the wrong ones.*
3. **The Pyromancer can dodge during JET RECOVERY** (the button always could; the dash could not). *Recommend: keep - a
   grace move locked for 0.22 s after the jet makes putting it out a trap.*
4. **The roll draws the same whatever it is asked with**; the old dash's streaks now play at its start. *Recommend: a
   look pass in the real game (Node renders lie about light) - especially the Paladin's shoulder at 230, which was 170.*
5. **A double tap now also leaves a perch or a pin** (it is the dodge button). *Recommend: keep - one move, one meaning.*
6. **Variety (MIXED UP)** counted `dash` as a verb and the V dodge as none; the one move counts once as `dodge`.
   *Recommend: keep.*
