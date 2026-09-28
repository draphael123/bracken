# claude/combatpass2: the combat pass, part 2 (fewer, better, deadlier foes)

Daniel's seven decisions of 2026-09-28, built on part 1's attack tokens (claude/combatpass, `src/attack-tokens.js`). Opus lane.
Branch `claude/combatpass2`, based on claude/combatpass c97cc5f (part 1, not yet on master), with origin/master (batch38) merged in.

## What changed

### 1. Heavies come alone (`src/attack-tokens.js`)
- **A red `!!` blow costs 2 tokens**, the whole purse, so while it is coming nothing else is.
- **A heavy turned away is next.** Two light blows taking turns would otherwise keep the purse from ever emptying and the red blow
  would never be thrown. The purse is saved for it (`heavyQ`, up to 2.5 s), and it stands in close (30 px) meanwhile.
- **The longest wait is next.** Found while measuring: the ring held the slow brute far out while quick foes took every free
  token, so a brute could wait a whole fight. After 2 s on the ring, the longest-waiting foe is made next the same way.
- A brute turned away while winding his overhead throws the overhead when his turn comes (one clause in his inline AI).

### 2. No untold hits: all 24 harming foes on the UNTOLD list now wind up on a mark
Each has a readable windup, a mark (`!` or `!!`, audited by `tools/tells.mjs`) and an ANSWER tag. `UNTOLD` in `src/marks.js` is
empty and `tools/answer-tags.mjs` keeps it so; the four harmless ones (folk, sentry, squirrel, dummy) moved to `HARMLESS`.

| foe | its tell | mark | answer |
|---|---|---|---|
| spitter | fills its cheeks, mouth open | ! | block |
| lurker | cap lifts, eyes open under it (then lunges from further off) | ! | block |
| hopper | squats, swells its throat; only the leap bites | ! | block |
| sporeling | sits back, then hops mouth first (the sprig's bite) | ! | block |
| weaver | draws its legs in and rears | ! | block |
| sweep | the pop out of the chimney (was a windup with no mark) | ! | block |
| kite | stops over you and lifts the stone into sight | ! | block |
| bone archer, grave husk, dead apprentice | already had tells; their table rows were missing, so no mark showed | ! | block |
| hound | drops on its haunches; the pounce goes low, under a shield | !! | jump |
| rolling bale | settles and rocks on the gust before each roll; bowls a shield over | !! | jump |
| storm crow | hangs on the wind and caws; comes at the head, over a shield | !! | duck |
| horn gust | the breath he takes (it shoves you: knockback, so it is told in red) | !! | duck |
| sapper | holds the lit bomb up, fizzing, then drops it and runs | !! | dodge |
| spitcap | swells (the spore cloud comes up even if a shield stops the spore) | !! | dodge |
| thief | crouches for the grab, then darts | !! | dodge |
| wight | lifts its hands out of the mist; mist comes round a shield | !! | dodge |
| holdfast | roots come up round your feet; grips only if you are still there | !! | dodge |
| shardling | hunches and rings, then sheds its points all round it | !! | dodge |
| shy dead (boo) | opens its hands from its face and grins; turn on it and it freezes | !! | dodge |
| ember wisp | stops and flares white-hot, then darts; only the dart burns | !! | dodge |
| lamprey | coils and stops dead in the water, then lunges to latch | !! | dodge |
| clinger | legs come off the wall one by one, rattling; no shield faces up | !! | dodge |

- A touch of a sporeling, lurker, hopper or ember wisp standing about hurts nobody now (they moved from TOUCH_ALWAYS to BODY_BLOW).
  The Hornet Queen's drone hoppers keep their old touch: her fight is her script.
- **Three foes that did no damage at all now do.** In the code on the base, the hound, the storm crow and the shy dead never hurt on
  touch: they were on the body-blow list, but they had no attack mode for the check to see. Their pounce, dive and swoop now hurt,
  after the tell. See Q3.
- Some red marks were chosen so that no level lost an answer. With all-yellow marks, 22 levels would ask for fewer than three answers.
  With these marks it is the same 15 levels as on the base (`tools/answer-tags.mjs`).
- The crows and the bales are the moor's weather: they tell their coming, but they are outside the purse (a string of five crows
  does not queue).

### 3. Held wind-ups (`src/foe-tactics.js`, on `board.on.grant`)
The brute's sweep, the soldier's slash and wind-up, the sworn sword's cut, the hedge knight's swing, the pike's thrust and the sprig's
bite are sometimes (35%) held a beat longer when the token is granted: about a third to three fifths of a second more on the screen.
The mark stays up the whole time. The tell is never shortened, a red `!!` is never held, and neither is a swing already under way.
The panic-roller rolls into it.

### 4. A visible poise break on every common foe (`src/poise-break.js`)
- The break already had its own sound (`SFX.poiseBreak`), a white flare round the silhouette and a stop.
- **23 common foes had no stagger bar at all, so nothing broke them.** They were in no family of the family table: the caravan's
  bandits, the Unburied Field's dead, the drowned knights, the scorpion, the vulture, the sheargob and others. They carry one now:
  the light bar, or the heavy infantry's for six of them.
- **A broken foe stands open** for the whole break: it reels back off its guard (a pose, `staggerPose`), with three gold stars over it.
- **Broken is not winding up.** A foe broken mid-tell shows no mark and holds no token, and it gives its token back the moment the
  break lands. When it comes to, its tell is taken up again with at least 0.35 s to run, so the blow is told a second time.

### 5. Finishers (`src/finishers.js`)
- **A melee blow that reaches a broken common foe finishes it**, whatever its health.
- **The tell:** the stars close in and go white when the hero is near enough that his next blow will be the finisher.
- **Each hero has his own finisher:** his word (EXECUTED, IMMOLATED, REAPED, RUN THROUGH, SMITTEN, SHATTERED, SKEWERED), a 0.14 s
  stop, a white flash, the camera in close, a ring in his colour and a small signature: the knight's step-in, the pyromancer's
  flame, the Death Knight's red shade, the Freebooter's coins, the Paladin's light, the Geomancer's amber shards, the Warden's green
  ring. He also gets 0.45 s of invulnerability and 3 hp.
- **New frames were too costly:** the finisher plays on the hero's own attack frames. The swing that reached the foe is the
  finishing blow.
- Never on a boss, a mini, an elite captain, anything inside a boss or mini fight, the Boss Rush, the harmless or the straw men.
- The seven names are now in `MOVE_WORDS`, so they are shown. They were hidden before, including on the old low-health finisher.

### 6. Pogo chains (`src/pogo-chain.js`)
- Every plunge onto a head rebounds at 330 (the knight's pogo), and a stomp counts in the chain. Three heads without the ground
  say CHAIN!, as before.
- **Two heroes could not use a head as ground:**
  - **The Death Knight's plunge** tore a shade out of the foe and then fell through into a ground swing: he never came back up.
  - **The Pyromancer's firedrop** burned the head under her boots before she landed on it, so she fell. It now passes the head she
    is coming down on.
- **The Warden keeps her rule:** she never bounces. On footing she pins or perches, and over a drop she vaults (300 or 345).

### 7. Reactive foes (`src/foe-tactics.js`, on `TOKENS.waitMove`)
- **The archer backs off** to bow range (about 110 px) while it waits, instead of standing at a sword's reach.
- **The shield presses in** shield-first and brings its shield round at its own slow pace (0.65-1.4 s). Part 1's ring had turned
  every waiting foe to face you instantly, which undid the shieldgob's lesson.
- **The brute covers up:** the third light cut of a flurry off his front is turned (COVERED). A heavy blow goes through, and
  he never covers in his windup, his recovery or broken.

### Squads
`SQUAD` in `src/foe-tactics.js` is the hook for the SPRINKLE-CUT lane: the roles (a shield is cover, an archer a shooter, a horn a
caller, a priest a healer, a banner a banner) and `capBonus`, the purse a banner adds (0). Nothing is placed in any level.

### The hooks in `src/main.js`
- one import line per module
- `TOKENS.exempt` + `TOKEN_HAZARDS`
- `tkApi.heavy`
- `installTactics`
- `FIN_API` / `POGO_API`
- `braceHit`, `FINISH_OK`, `drawOpen`, `staggerPose` and `pogoBounce` at their call sites
- `breakBeat` calls `broke` + `tokenRelease`
- `windingUp` gained `!(e.broken > 0) &&`
- `poiseMax` reads the two new sets
- `BK.combat2()` for the harnesses

The creature edits for the tells are inline where each creature lives.

## New checks (all in `tools/check.mjs`'s list; each run red on c97cc5f in a throwaway `git worktree`, never a stash)
- **`attack-tokens` (extended):** nobody else winds up under a red `!!`; and at least four red blows are thrown over the two crowds.
  - Now 40 s, dice seeded.
  - Red on base: 40 and 30 frames of another windup under a red.
- **`answer-tags` (extended):** `UNTOLD` must be empty, and a common foe with no told blow must be `HARMLESS`.
  - Red on base: the 24 untold hits.
- **`untold-told` (new, page):** each foe that was untold, set beside a standing hero, winds up on a mark and never hurts him without one.
  - Red on base: every one of them.
  - Skipped (answer-tags still holds them): the lamprey (water) and the clinger (a wall over a hero in the air).
- **`foe-tactics` (new, Node + page):**
  - braceHit's rules
  - held tells: never shorter, some held, never all held, the mark on every frame
  - the waiting archer at bow range
  - the waiting shield's turn at least 0.6 s
  - Red on base: no module.
- **`finishers` (new, page):**
  - 25 common foes break within six heavy blows, with the beat, and stand open at least 1.5 s with no windup and no token.
  - Each of 7 heroes finishes a broken sworn sword with one real press, and not an unbroken one.
  - Red on base: no harness, and 23 foes have no bar.
- **`pogo-chain` (new, page):** each of 7 heroes comes back up off a head over a drop (plunge ≥ 300, stomp ≥ 200) and chains two.
  - Red on base: the Pyromancer falls, and no stomp counts.

## Numbers, before and after
**Damage taken by the F9 bot** (`node tools/combat-damage.mjs waymeet,kings knight 1,2 5400`: knight, 90 s, no god mode, dice pinned).
Before is claude/combatpass c97cc5f (part 1), measured on this PC today; after is this branch after the merge.

| level, seed | before (part 1) | after (part 2) |
|---|---|---|
| Waymeet 1 | 81 hp, 0 deaths, to col 120 | 125 hp, 1 death, to col 83 |
| Waymeet 2 | 74 hp, 0 deaths, to col 123 | 85 hp, 0 deaths, to col 101 |
| King's Road 1 | 121 hp, 1 death, to col 142 | 148 hp, 1 death, to col 141 |
| King's Road 2 | 140 hp, 0 deaths, to col 178 | 84 hp, 0 deaths, to col 183 |

- **Three of four runs cost more, and the bot got less far on the Waymeet.** That is the direction of "deadlier": the held
  wind-ups catch a bot that swings on the mark, the brute covers up, the purse makes crowds wait their turn in close.
- **The King's Road seed 2 cost less.**
- **As in part 1, most of each run's damage is booked to no named attacker** (`P.killer` empty), and part 1's own numbers for the
  same runs differed from today's before-run. Read the bot as a rough guide.
- **Crowd of six** (`tools/attack-tokens.mjs`, now 40 s):
  - at most 2 attacking at once
  - a red `!!` never under or beside another windup, and 3-5 red blows thrown
  - the waiting foes never still
- **Boss lab:**
  - small-adds: 3 of 65 swings at small adds missed (5%); worst judged row 29%, limit 33%. Part 1 had 5 of 86 and 25%.
  - boss-openings: green.

## Checks run (named, never the suite), after merging origin/master (batch38)
All green in one `npm run check -- ...` run on the merged branch:
- **This lane's checks:** tells, answer-tags, attack-tokens, untold-told, foe-tactics, finishers, pogo-chain
- **The brief's list:** spawns, elites, ambush-single, one-new-foe, boss-fight-end, small-adds, boss-openings, ability-poses
- **The 7 required checks:** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (kings rebased on purpose, see Q7), npc-removal

Three notes:
- **The merge** conflicted in `tools/check.mjs`'s list (every name from both sides kept), `src/main.js` (the hedge-roots line
  kept beside the token line) and `src/marks.js` (MARK regenerated with `node tools/tells.mjs --write`, 586 rows).
- **tells** still lists the scalder's pour and ladle as windups with no mark. They are marked on the next line, which the audit
  does not read. This predates the lane.

## Unverified
- **Nothing was looked at on screen.** That covers the stars, the reel pose, the tells' poses (most reuse an existing frame: the
  wisp's flare is a new white glow, the sapper's fuse is sparks) and the finisher beat.
- **Co-op:** finishers and pogo use the acting hero `P`; not played with two.
- **The lamprey's and the clinger's tells** are proved only by the tables and a read of the code (no water or wall in the harness).
- **The Hound Master's fight:** the hounds he whistles loose were harmless on touch before and now pounce (told, red, unblockable).
  Its boss-openings and boss-fight-end are green, but no bot pilot was run for him.
- **The bot numbers** (knight only) are rough, as in part 1: most hp is booked to no named attacker.

## QUESTIONS FOR DANIEL (the recommended option is what is built)
1. **Finishers kill a broken common foe outright, from any health.** Built: yes, any melee blow on it.
   - *Recommendation:* keep. The break is the hard part (a heavy blow, a riposte, a plunge), and Blasphemous does exactly this.
   - *Alternative:* only below half health.
2. **Crows now hurt** (a red `!!`, 12, unblockable). On the base a string of storm crows did no damage at all: the body-blow check
   never saw them attacking.
   - *Recommendation:* keep. The bestiary says they hurt, and each crow now tells its dive.
   - *Alternative:* yellow `!` (the shield turns them) if the Sky Road plays too hard before the crouch exists.
3. **Hounds and the shy dead hurt now too** (same bug as the crows), each after its tell.
   - *Recommendation:* keep.
   - Watch the Stockade's kennel pack and the Hound Master's loosed hounds in a playtest.
4. **Heavies in a crowd are rarer.** A red `!!` needs the whole purse, so a crowd of six throws about 3-5 in 40 s (the base threw
   about 6 in 20 s, overlapping others).
   - *Recommendation:* keep. That is "heavies come alone".
   - *Alternative:* if crowds feel soft, raise `TOKENS.perHero` to 3 for light blows only.
5. **The longest wait is next** (added, not in the brief). Without it a slow brute could wait a whole fight on the ring.
   - *Recommendation:* keep. It is what made heavies measurable at all.
6. **Crows and bales are outside the purse** (they are weather).
   - *Recommendation:* keep.
7. **The King's Road's slopes-trace was rebased** (kings only). 88 of 1900 frames differ from frame 1079: a walk now comes down on
   a foe's head (the stomp, unchanged) where the foe used to be moving. The mover is untouched, and wood, keep and burial stay
   identical.
   - *Recommendation:* accept the rebase.
8. **Answer coverage is unchanged:** the same 15 levels ask for fewer than three answers, and Witchlight is still block-only.
   - *Recommendation:* the level lanes fix it, as in part 1.
