# batch34: the pyromancer missing the Mother's sporelings

**Cause.** claude/npcs removed ~50 decorative NPC placements and quest "stray" pickups across levels (Sporewood
included: the elder near the start, three clean-cap strays). Nothing in that change touches combat, but the boss
lab's row is dice-pinned by seeding `Math.random` once, before `BK.load`, and many common-foe spawns (`Math.random()`
draws for idle timers etc.) consume that stream in level order as the level loads. Removing entities ahead of the
Mother's arena shifted how many draws are spent before her fight starts, which shifted her attack timing and
sporeling movement inside the pinned fight - exposing a pre-existing weakness in the Mother pilot's own add-chasing
code (`src/lab.js`, the `boss.t==='mother'` branch): it walked the hero to only `LAB_REACH[h]*.6` from an approaching
sporeling before swinging. The low sweep's own forward lunge (every hero's `lowSweep()` sets `P.vx = P.face*130`,
paladin excepted) added to a sporeling already closing the last few px, and for the pyromancer - the widest reach of
the six besides the warden - that stand-off (18 px) left less room than the lunge covers: the swing landed past
where the sporeling had scuttled to. Verified by instrumenting the ledger's swing entries (aim position/velocity vs.
player position/velocity at swing start) and reproducing the pattern: player facing and closing on the target
correctly, but overshooting it during the sweep's own lunge.

**Fix.** `src/lab.js`, the Mother's sporeling-chase line: stand-off changed from `LAB_REACH[h]*.6` to
`LAB_REACH[h]-2` (matches the reach the swing actually reaches from, instead of a fraction of it that left slack for
the lunge). Tried `LAB_REACH[h]-4` (the stand-off the Abbot/Grandmother add-chasing branches already use) first -
that also cleared the ledger but left the Mother's warden row at the assertion's exact limit (2 of 6, 33%). `-2`
clears every row with margin (worst row 25%, limit 33%). This is a general pilot fix, not per-hero, and not a
threshold change - `tools/small-adds.mjs`'s `MAX_MISS`/`MIN_SWINGS` are untouched.

**Checks run (all green):**
- `node tools/small-adds.mjs` - 24 rows swung at small foes; 5 of 86 missed (6%); worst judged row 25% (limit 33%)
- `node tools/mother-pilot.mjs` - flaked once on a cdp module-fetch error (listed flake), green alone on retry
- `node tools/spore-caps.mjs` - green
- `node tools/keep.mjs` - green
- `node tools/npc-removal.mjs` - green

**Commit:** see `git log` on `claude/batch34` (this lane's HEAD after push).
