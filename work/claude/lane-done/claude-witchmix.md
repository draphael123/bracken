# claude/witchmix — THE WITCHLIGHT STAIR's answer mix

## The problem
THE WITCHLIGHT STAIR asked the player for only one answer. Every common foe there
(zombie, bonearcher, bonegob, imp, broom, husk, armour, apprentice, topiary, whelp)
throws a told blow that is answered by BLOCK, and only block. The rule (Daniel,
combat pass, answer tags): a level's foe mix should cover at least 3 of the 4
answers (block / dodge / jump / duck).

Combat pass part 1 (the `ANSWER` table in src/marks.js, `tools/answer-tags.mjs`) is
not on this lane's base (claude/gargoyle5, off master). I could not run the
`answer-tags` check, so coverage below is computed by hand, using the same
classification combat pass part 1 already assigns these foes on `claude/combatpass2`
(the behaviour is identical either way - only the tagging metadata is new there).

## What changed
Two designed placements, both swaps of an existing block-only foe for an existing
common foe that already throws a told, non-block blow - no new encounters, no raised
counts.

1. **THE BATTLEMENTS, "THE FIRST BREACH"** (src/witchlight.js): the `armour` at
   column 393 is now a `heavy` (THE KING'S CHAMPION - full plate, already used as a
   castle/barbican guard everywhere else in the game, e.g. "a heavy knight holds the
   barbican" in the Stockade). He throws a windup at that breach that is genuinely
   marked: the overhead (`raise`) and the grab (`grabTell`) are both a told red `!!`
   (`damagePlayer(..., { unblockable: true })`, src/main.js:8978,8985) - **dodge**.
   His sweep (`windUp`) stays a told yellow `!` - **block**. `armour` itself is not
   removed from the level: it still stands in the Cloister (three encounters), so
   `one-new-foe` and the level's own "five new foes" credit are untouched.

2. **THE ROOTED GARDEN, "THE WARDEN'S LAWN"**: the `imp` at column 314 is now a
   `hound` (WAR HOUND - a goblin dog, already common across the campaign), placed as
   the Hedge Warden's own dog loosed on his lawn, right before his gate. Its close-
   range leap (src/main.js:20679) is a genuine low pounce meant to be jumped or
   stomped as it lands (its own bestiary line: "leaps low at the last stride. Stomp
   it, swing as it lands, or put fire between you.") - **jump**. `imp` is not removed
   from the level either: it still appears in "THE FIRST COLUMN", "THE IMPS IN THE
   SHAFT" and "THE HEDGE-TOP IMPS".

Both are one-line swaps in `src/witchlight.js` (the `meet(...)` calls for "THE FIRST
BREACH" and "THE WARDEN'S LAWN"). No tiles, no new `ent()` calls, no touch to the
Hedge Warden, the Gate Gargoyle, or either of their arenas.

## UNVERIFIED / caveat
`hound`'s leap does not currently show a windup mark on this base (no `number(...)`
call in `src/main.js`'s hound branch - it is on `marks.js`'s own "untold" side of the
line until combat pass PART 2 lands, which is what adds tells to the 24 previously-
untold common foes, hound included, and tags it `hound|pounceTell: jump`). The
*behaviour* is real and already jump-shaped (a telegraphed close-range low leap with
a "stomp it" bestiary answer), but the player currently gets no on-screen cue before
it happens - only the run-toward-you tell. `heavy`'s dodge blow has no such gap: both
`raise` and `grabTell` already print a told red `!!` in the current build.

## Answer coverage
Computed by hand from the moves actually thrown in `src/main.js`, classified the way
`claude/combatpass2`'s `ANSWER` table classifies the same moves (see above for why
that table isn't runnable here).

- **Before**: `{ block }` — every common foe in the level (zombie, bonearcher,
  bonegob, imp, broom, husk, armour, apprentice, topiary, whelp) throws only a told
  yellow `!`, or an untold grab/rise with no blow at all. 1 of 4 answers.
- **After**: `{ block, dodge, jump }` — `heavy` adds a told red `!!` (dodge, on two
  separate blows) at THE FIRST BREACH; `hound` adds a low leap answered by jump at
  THE WARDEN'S LAWN, with the caveat above. 3 of 4 answers, meeting the rule.
- `duck` is not covered. The one common foe with a duck-answered blow in
  `combatpass2` (a diving strike) is not a foe this base has; I did not invent one,
  per FEWER, BETTER FOES and "don't make design decisions beyond your brief."

## Checks run (this subset only, not the full suite)
```
node tools/check.mjs witchlight,whelps,spawns,elites,one-new-foe,gargoyle-stomp,architecture,checkpoints,skins,dangling-paths,boss-fight-end,npc-removal
node tools/check.mjs slopes-trace
```
All green:
```
ok  dangling-paths   ok  elites   ok  spawns   ok  checkpoints   ok  skins
ok  one-new-foe      ok  witchlight   ok  boss-fight-end   ok  architecture
ok  whelps           ok  npc-removal  ok  gargoyle-stomp   ok  slopes-trace
```
`answer-tags` could not be run: it is not on this lane's base (combat pass part 1
isn't on master yet). Coverage above was computed by hand instead, as directed.

`npm run check` (the full suite) was not run, per the lane rules.

## QUESTIONS FOR DANIEL
1. **`hound`'s missing tell.** Built as recommended above (the behaviour already
   reads as "jump," and the bestiary text says so), but it wears no on-screen mark
   until combat pass part 2 lands and tells the previously-untold common foes. If you
   want every non-block answer in Witchlight visibly marked *now*, the honest fix is
   either to wait for that part-2 lane to land first, or to swap this one placement
   for `brute` instead (a goblin with a club - its overhead `raise` is already a told
   red `!!`, dodge-answered, same as `heavy`'s) and accept the level covers only
   `{block, dodge}` until a real told-jump common foe exists. **Recommendation: keep
   `hound` as built** - the design intent (a jump answer, in a designed spot, fitting
   the garden) is already correct and forward-compatible with part 2; swapping it out
   now just to avoid an unmarked tell trades away the actual fix for a narrower one.
2. **No `duck` coverage.** The rule asks for 3 of 4, which the level now meets; I did
   not add a fourth answer since I found no existing common foe with a duck-answered
   blow to place (`combatpass2`'s one duck example, a diving strike, does not exist
   in this base). **Recommendation: leave it** - inventing a new foe or a new blow to
   hit 4/4 is outside "place a few EXISTING common foes," and the brief only asks
   for >= 3.
