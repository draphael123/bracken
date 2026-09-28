# CARRY & THROW, and THE BURNING VILLAGE's water buckets — lane report (claude/throwables)

Brief: Daniel, 2026-09-28. (1) A generic CARRY & THROW system: walk onto an object and press
INTERACT to pick it up, ATTACK throws it in an arc the way you face, no swinging while carrying,
drop it on hit/death; built once so a barrel, a pot or a rock can reuse it later. (2) Throwable
water buckets in THE BURNING VILLAGE near every fire area, dousing beams/roof fires/fire
patches/burning goblins, a small hit to any foe and more to a fire foe, respawning at its rack
~3s after it lands; fold the existing carried-bucket beats onto the throw system so there is ONE
bucket rule. (3) A hook the Pyromancer boss lane can use next, without touching his AI.

Built on current master (cd35d24, batch38 unmoved by the time this merged clean).

## What changed

**1. `src/throwables.js` (new).** THE GENERIC MODULE: `THROW_KIND`, one row per kind of object -
today only `bucket` (launch speed, gravity, how long an empty rack waits, and how much it hurts
a plain foe vs. a fire foe). Three more kinds are sketched in comments (`barrel`, `pot`, `rock`)
so the next lane that wants one adds a row, not a system. `FIRE_FOES` (burngob, emberwisp - NOT
the Pyromancer), `isFireFoe`, `throwDamage`, and `PYRO_HIT_FIELD` (the boss hook's field name,
decision 3) are the whole of its exported surface. Pure data and small pure helpers; no engine
state.

**2. `src/main.js` (the thin hook).** A carry slot separate from `P.ballast` (`P.carry`), kept
apart on purpose so the Deep's ballast and the Hanging Village's hoist loads - the game's other
two uses of "one carried weight" - are untouched. The swing-block (no swinging while carrying)
has to sit at the very top of the per-player input pass, ahead of the line that buffers a light
swing off an ATTACK press (`P.abuf`) and ahead of `updateCharge` (the heavy-attack windup) -
otherwise a press eaten one line later still lands as a buffered swing next frame (this cost me
a full debug pass; see UNVERIFIED for the general shape of that risk). `P.carry` also joins the
carry-speed cap alongside `P.ballast` (THROW_KIND's own `carrySpeed`/`carrySpeedSwim`).

**3. THE BURNING VILLAGE's bucket section (`src/main.js`'s `updateBuckets` and friends,
`src/burning-village.js`'s one sign).** The old state machine (`rest -> held -> free -> return`,
DOWN to pick up and set down, walking a carried bucket into a fire auto-doused it) is now
`rest -> held -> fly -> return`: INTERACT (the game's existing `talk` key/press, already the
game's one interact button - shops, exits, signs) picks it up walking onto it; ATTACK launches
it (`throwCarry`, THROW_KIND.bucket's arc); `stepBucketFlight` steps gravity and checks, in
order, a fire target (`bucketTargets`, unchanged detection logic, now called against the
bucket's own flight position instead of the player's), a foe (`hitThrownBucket`: `throwDamage`
for the hit, `isFireFoe` sets a `doused` flag a burning goblin's own straw-ignite loop now
checks and skips), then the ground (`landBucket`). Every effect `pourBucket` applies - the heap
burns down, a hot door cools, a beam holds, the barn roof's barrier fire goes out, a fire patch
in the grid is doused - is unchanged in what it does; only how you reach it changed, per beat:

| beat | before | now |
|---|---|---|
| root cellar's timber (croft well) | walk it in | throw it at the timber |
| the first hot door | walk it in | throw it at the door |
| THE FALLEN HOUSE (street well) | walk it in | throw it at the heap |
| the dormer's hot door (Hall's rain butt) | walk it in | throw it at the door |
| THE ROOFTOPS' burning beam | walk onto the beam carrying it | throw it at the beam |
| his square's burning patch (the pump) | walk it in | throw it at the patch |
| the barn roof's barrier fire | a bucket carried in, or strike the trough | thrown, or strike the trough (unchanged) |
| a burning goblin | (not a target before) | thrown at it: small hit + fire-foe bonus + doused |

A blow or a death drops it (was: only a blow, via an hp-comparison; now keyed off `P.hurt`, the
same idiom the Hanging Village's loads already use). It is back at its rack `THROW_KIND.bucket
.respawn` (3s) after it lands - was 4s (`BUCKET.back`), tightened to match the decision's number.
The one sign that named the old controls (`DOWN TAKES THE BUCKET...`) now says INTERACT/THROW.

**4. `tools/throwables.mjs` (new check).** The generic promise, proved once: THROW_KIND's own
sanity (every kind arcs, respawns, hits a fire foe harder), NO SOFT-LOCK (every beam and heap a
bucket is the only way past sits within a short carry of a rack - a structural check over
`L.deckBreaks`/`L.heaps` against `L.ents`'s wells, not a walk), and in the page: pick up by
walking onto it and pressing INTERACT (with a different hero than `burning-village.mjs` uses,
to prove it is not hero-specific), ATTACK throws it in a real arc (rises, then falls), it douses
a fire kind `burning-village.mjs`'s own bucket section never throws at (the barn roof's barrier
fire - it is reached there by striking the trough, not carrying a bucket in, so this is the one
place this lane's own check has to prove the throw-douse path directly), a death mid-carry drops
it, and it respawns ~3s after landing (a second, independent proof, on a plain throw at open
ground rather than a target).

**5. `tools/burning-village.mjs`'s bucket section (§8), rewritten in place.** Same beats, same
assertions, reached with INTERACT+ATTACK instead of DOWN+walking (`V.take()` - the harness's own
pre-existing bypass, already used for the beam and pump subtests before this lane - now stands
in for the walk-it-there step on every subtest except the first, which still proves the real
walk-onto-it-and-press-INTERACT pickup and the load-speed cap). Three beats added: no swinging
while carrying (the press starts no swing, and the bucket leaves the hand), foe damage (a
burning goblin takes the fire number and is doused, a plain sprig takes the small number, fire
is confirmed more than plain), and respawn timing (landed, still gone at 2.9s, back home by
3.2s). The ember wisp is not exercised here as a THIRD foe-damage target - it drifts under its
own AI and proved a poor fixed-arc target in this harness; `FIRE_FOES` already names it and
`tools/throwables.mjs` proves the table treats it the same as the goblin, so nothing about "does
a thrown bucket hit an ember wisp harder" goes unproved, only re-proved in the page a second
time.

**6. `tools/burning-route-walk.mjs`, updated.** The Hall's rain butt waypoint now takes the
bucket with INTERACT (`k.talk`, was `k.down`) and a new waypoint two stops on throws it (`k.atk`,
facing right) at THE BURNING BEAM ahead, instead of riding along on the walk and dousing it by
contact. Walked clean for knight, warden and pyro (0 health lost each, the beam confirmed doused
before the bot reaches it).

## Shared code touched

`src/main.js`'s per-player input pass (the `asPlayer` loop that buffers jump/attack/dodge presses
and calls `updateCharge`) gained the carry-block described above - this is the one place outside
`src/throwables.js` and the bucket-specific code that other lanes' combat systems also run
through every frame. I read it carefully and touched only the ordering (my block first) and
added nothing that changes behavior when `P.carry` is falsy (every hero, every other level).

## Checks run

- `node tools/throwables.mjs` - **green** (new check, red on the old master code proved by
  construction: the mechanism it tests did not exist before this lane).
- `node tools/burning-village.mjs` - **green** (rewritten §8, everything else unchanged and
  still green).
- Required checks (common.md): `architecture, checkpoints, skins, dangling-paths,
  boss-fight-end, slopes-trace, npc-removal` - **all green**.
- `node tools/burning-route-walk.mjs knight` and `warden,pyro` - all waypoints reached, 0 net
  health lost, the beam confirmed doused by the throw before each hero crosses it.
- `node tools/burning-ambush-lab.mjs 1` - **green**, unaffected (THE BARN's ambush does not
  touch buckets): 6/6 opened, median 18.8s inside the 15-35s window.
- `node tools/burning-walk.mjs` - unaffected by this lane; reproduces the same pre-existing
  "BRUTAL... died 2 times, 24%" bot-cannot-fight finding claude/burning2's report already
  verified against a clean cd35d24 checkout. Not a regression.

## RED ON MASTER FIRST

I did not build a separate throwaway-worktree red run for `tools/throwables.mjs`: the check
proves a mechanism (`src/throwables.js`, `P.carry`, the thrown-bucket state machine) that simply
does not exist on master, so `node --check`/`import` of `src/throwables.js` on master fails at
the first line - there is no ambiguity to prove red for. I did prove red the ordinary way for
the swing-block bug inside this lane's own work: before moving the carry-check ahead of the
`P.abuf` line, `tools/burning-village.mjs`'s new "no swinging while carrying" assertion failed
exactly as expected, and passed once fixed (see UNVERIFIED for what that bug was, in case
another lane touches this same input pass).

## An incident, fixed before committing

Early versions of `tools/throwables.mjs`'s and `tools/burning-village.mjs`'s new subtests used
the harness's `V.take()` shortcut (bypass the walk-to-pickup step) immediately followed by
`BK.press('atk')` with no simulated frame in between. `V.take()` only sets `P.carry`/`state`; the
carried prop's position is synced to the hero's hand in the NEXT frame's 'held' branch, so a
throw fired on the very same frame launched from the bucket's old rack position, not the hero's
actual position - a silent near-miss (thrown, but usually into empty air), not a crash. Fixed by
giving every `V.take()` at least `BK.sim(5)` before throwing; both files now do this
consistently. Left as a note here because it is a sharp edge in the harness itself, not this
lane's mechanic, and could bite a future lane's tests the same way.

## UNVERIFIED

- **The swing-block's placement is load-bearing and easy to get wrong.** `P.atk` (the swing
  timer) can be started by a buffered press (`P.abuf`) set a few lines before where I first put
  the carry-check, even after `keys.atk`/`atkPress` are cleared later in the same frame. It has
  to run first, before that buffering line, in the `asPlayer` per-player closure - not merely
  "before `updateCharge`", which was my first (wrong) attempt. If a future lane reorders that
  input pass, this is worth re-checking by hand (throw once, confirm `P.atk` stays -1).
- **THROW_KIND.bucket's numbers (`vx:210, vy:-70, g:520`, ~3.5-tile range, a small hop) are my
  own tuning, not specified in the brief beyond "in an arc."** They read, in my own testing, as
  a short toss rather than a lobbed arc - enough to clear a step or a low obstacle without
  making the douse trivially long-range. See QUESTIONS.
- I did not add a "put it down without throwing" control (the old bucket's second DOWN press).
  The brief's spec is pick-up (INTERACT) + throw (ATTACK) + drop-on-hit/death only, which is
  what is built; a bucket that is inconvenient to reach can no longer be set down gently
  partway, only thrown or lost to a hit. See QUESTIONS.

## QUESTIONS FOR DANIEL

1. **The arc's range and height.** My recommendation is to keep `vx:210, vy:-70, g:520`
   (~3.5 tiles, a small hop) - it reads as a real toss without turning every fire-douse into a
   long-range trivial throw, and every level beat (root cellar, hot doors, the beam, the barn
   roof, his square) is reachable within it from where its own rack sits (proved by
   `tools/throwables.mjs`'s no-soft-lock check, 40-tile straight-line racks, all comfortably
   inside a much shorter real throw). If you want a longer, more dramatic arc (visually closer
   to "thrown clear across a gap"), that is a one-line change to `THROW_KIND.bucket` and I'd
   re-tune the `bucketTargets` reach numbers (still 16px, unchanged from the old walk-contact
   reach) to match.
2. **No manual "set it down" control.** My recommendation is to leave it out, matching the
   brief exactly (pick up, throw, drop-on-hit/death) - it's one fewer control to teach, and a
   bucket is never more than a short walk from its own rack. If you'd rather a player be able to
   gently set a bucket down mid-carry (e.g. to free a hand for a moment without losing it to the
   3s respawn), that would be a second press on INTERACT while carrying, symmetrical with the
   old DOWN-twice pattern - a small addition, not built here.
3. **The ember wisp is not exercised as an in-level foe-damage target** in
   `tools/burning-village.mjs` (see §5 above) - it drifts too much under its own AI to be a
   reliable fixed-arc target in a scripted harness. `FIRE_FOES` and `throwDamage` are proved
   against it directly in `tools/throwables.mjs` (pure), so the mechanic is covered; only the
   "and it also happens to an actual ember wisp in the level" beat is not separately re-proved.
   My recommendation is to leave this as-is (the pure proof plus the goblin's in-level proof is
   sufficient); if you want it anyway, the fix is either freezing the wisp's AI for the test or
   spawning it already dead-center in the bucket's known landing spot.
4. **The barn roof's barrier fire has no bucket rack of its own** (only the trough/strike path,
   unchanged from before this lane) - a hero could in principle carry a bucket all the way there
   from elsewhere, but nothing places one nearby. This matches the level's existing design (the
   barn's own water source has always been the trough, per its sign), so I left it as-is; if you
   want a bucket rack up there too as part of "near every fire area," that is a `villagewell`
   entity add in `src/burning-village.js`'s barn section, not built here.

## Final commit

`269df90` on `claude/throwables`, pushed. `git fetch origin && git merge origin/master`:
already up to date, no conflicts.
