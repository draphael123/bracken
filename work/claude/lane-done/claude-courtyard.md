# Lane claude/courtyard: THE WARDED COURTYARD (the Mage's Folly's new opening) and the common whelp's fireball, done

Branch `claude/courtyard`, off claude/gargoyle5 efac5d7 (master 05deabe + the Gate Gargoyle's two fireballs). origin/master had not moved
past that when I fetched at the end, so nothing needed merging. Nothing is merged into master and nothing is deployed.

## What changed

### 1. THE WARDED COURTYARD replaces THE OVERGROWN GROUNDS (`src/level.js`, theMagesFolly)
- **The hedge maze, topiary lawn, wall hedge, gatekeeper's stall and breach are gone** (old x 0-117, 118 columns).
- **The new courtyard is x 0-63 (64 columns).** The tower's front door is now column 64 (it was 118).
- **The level is shorter: W 712 -> 658.** Everything after the courtyard moved **54 columns left** (see "The column shift" below).
- It teaches the tower's rule outdoors: **strike a rune and the paving slides.** There are three beats:
  - **TAUGHT: THE WARDED STEP (x 7-24).**
    - A terrace five rows high: one row too high for any hero to jump.
    - A rune on a warding post (x 10) slides a paving slab out of the floor (x 12-13) up to row G-3.
    - That gives a stair of two rows a step: mounting block (x 11), then the slab, then the terrace.
    - The first dead apprentice stands on the terrace.
  - **DEVELOPED: THE WARDED BRIDGE (x 26-40).**
    - The yard's drain is 8 columns wide and 4 rows deep, with spikes at the bottom. It is too wide for any jump.
    - The drain is a wind zone (`src/spike-winds.js`, as on the Witchlight Stair). A fall costs one bite, and the wind brings you back to the near lip.
    - The rune on the lip (x 27) raises a **one-way** slab (x 30-33) out of the ground under the spikes to floor level. That leaves two jumps of 2 tiles.
    - The slab is `sunk`: the ground stays whole under the spikes after it rises, so there is no pocket to fall into.
    - A whelp sits on a corbel right over the drain (x 32). With you on the bridge, it dives *through* the one-way slab and sticks on the spikes. Stomp it there, and the wind lifts you with no bite.
    - An apprentice on the far lip (x 38) throws while you cross.
  - **COMBINED: THE BARRED GATE AND ITS WARDED POSTERN (x 41-63).**
    - The gatehouse (x 51-57) is kept, barred, with a portcullis drawn down on its face (`L.mage.portcullis`) and the sign "THE GATE IS BARRED AND WILL STAY BARRED".
    - The way through is the **postern**: a 3-row stack of slabs across a passage at floor level. Its rune (x 50) slides it up into the wall. This is the "path".
    - In front of it is a gate ditch: spikes and a wind zone, x 42-48, crossed on a **cracked ledge** (x 44-46) under a whelp on the gatehouse's corbel (x 50). Leave the ledge late and the whelp dives through it and sticks on the spikes.
    - A last apprentice waits at the tower door (x 61).
- **Foes in section 1: before, 13** (7 topiary, 3 imps, 3 brooms). **After, 5:** 3 apprentices and 2 whelps, all placed by hand. The whole yard is `calm`, so nothing is sprinkled into it.
- **Checkpoints in the yard:** before 6, 47, 79, 114. After: 5 and 40, then the library's (69).
- **The library now DEVELOPS the rule.** Its sign reads "THE RUNES WORK IN HERE TOO, ON WHOLE STACKS..." instead of introducing it.
- **The runes reuse the library's machinery.** A new `ward()` helper builds a runeshelf in paving stone, with its rune on a post. In main.js the shelves gained three things:
  - `tile`: what the slab becomes once it is up (T.ONEWAY for the bridge);
  - `sunk`;
  - a `post` flag on the rune prop.

  Their art (a paving slab with a cut rune that goes cold once it has moved, and the warding post) and a new "THE PAVING MOVES" hint are in main.js.

### 2. The backdrop
- **Before:** the Folly's redress drew the *library shelving* behind the outdoor grounds (see `work/courtyard/before.png`).
- **After:** the yard gets its own backdrop, `drawCourtyardBack` in `src/tower-ascent.js`, drawn only before the door:
  - **the tower** rising ahead on a slow parallax, with buttresses, courses, lit violet and warm windows, and a faint violet glow in its stone;
  - **the yard's crenellated back wall**, with an arch and a lit brazier every 12 tiles, carried down behind the drain and the ditch.
- The yard is paved: a new `paving` skin in `src/redraw/mage_world.js`.

### 3. The common whelp's ONE fireball (`src/gargoyle-whelp.js`, main.js updateWhelp)
- **The numbers** (`WH.ball`): 78 px/s, radius 4, 6 damage, a 0.8 s tell, one ball.
- **The Gate Gargoyle's, unchanged:** 90 px/s, radius 6, 10 damage, a 1.1 s tell, two balls. His are still two (asserted).
- **The tell** is the new `fireTell`, with a yellow `!`. `tells.mjs --write` added `whelp|fireTell: '!'`, and the tell is also in `windingUp`. The whelp rears back on its perch in a new pose (frame 9, "spit"), and fire gathers in its jaws, drawn growing to the throw. It throws in the crouch frame.
- **The ball** is his: the Gate Gargoyle's `stepBall` gained an optional spec, and the ball drawing was split out as `drawBall`, so both share one set of rules:
  - a shield takes it;
  - a dodge roll passes through it;
  - stone or a slab breaks it.
- **The answer tag:** the ball hurts as `damagePlayer(..., { who: whelp, blow: 'THE FIREBALL' })`, so the death line reads "GARGOYLE WHELP THE FIREBALL - YELLOW: THE SHIELD TURNS IT".
- **Its AI:**
  - It **spits** when it sees you but you are past its dive (`WH.ball.sight`: 200 px along, and up as well as down).
  - It **dives** when you are in reach.
  - After a dive, its next attack is a spit if it can spit. So it alternates and is never only one thing.
  - Whelps the Gate Gargoyle calls follow the same rule.
- **Where it applies:** every whelp, including the Witchlight Stair's eight and the Gargoyle's called ones.
- **Bestiary:** "...Out of its reach it spits one small fireball instead; a shield takes it." `textfit bestiary --strict`: 0 findings.

### 4. Every whelp over spikes
- **Folly:** both yard whelps sit over a wind zone's spikes, with footing they dive through onto them (the one-way bridge, the cracked ledge).
- **Witchlight:** all 8 whelps already sit over the moat's wind-zone spikes. The new check asserts it.

## The column shift (-54 from the library on)
- Every column literal in theMagesFolly from section 2 on was moved by a script, outside strings: 470 numbers, including the section headers' "(x ...)" comments. Examples:
  - library 118-262 -> 64-208
  - lab 263-380 -> 209-326
  - orrery 381-500 -> 327-446
  - flip floor 501-590 -> 447-536
  - observatory 591-655 -> 537-601
  - study/arena 656-700 -> 602-646 (arena x0 657 -> 603, trigger 662 -> 608)
  - mini gate 262 -> 208
  - ambush walls 218/234 -> 164/180
  - `mage.dais / flood / stacks / weight / cage / hung` and `outside` 118 -> 64
  - noCoin, calm, weather and ambient ranges
- **Hard-coded columns outside the function:**
  - `src/level.js` ELITES `mage: armour 408 -> 354`.
  - `src/tower-ascent.js` polishTower: the tower skin started at the literal 118 and now reads `L.mage.outside`. The deco filter `e.x >= 118` now uses the same door column. The alchemy-lab sign was found by `e.x === 268` and is now found by its text.
- **Checks that named Folly columns:**
  - `tools/tower-ascent.mjs:154`: the skin at `118` becomes `m.mage.outside`, asserted to be 64.
  - `tools/fixtures/folly-browser.js` (run by folly-runtime): the shot columns 170/278/600 become 116/224/546.
- Nothing else in `tools/` or `src/` names a Folly column. I grepped for `'mage'`, `.mage`, the old boundary columns, and every tool naming mage, folly, archmage, tower, whelp or witchlight.

## Checks (each run by name; the full suite was not run)
- **New `courtyard`**, added to check.mjs's list. It has 26 soft assertions:
  - the yard's size and the shifted rooms;
  - the three slabs' shapes, including the unjumpable terrace and drain;
  - the runes on posts;
  - the barred gate kept;
  - the library sign;
  - every whelp on both levels over wind-zone spikes, and the yard whelps over dive-through footing;
  - the ball smaller, weaker and no faster than his, with his still two;
  - the `!` mark and the pose;
  - **on the page:**
    - each rune struck moves its slab (new place footing, old place open);
    - a whelp over the bridge dives through it, sticks, is stomped, and the wind lifts you with no bite;
    - past its dive it spits one told ball that hurts less than one of his;
    - a knight's shield takes it (0);
    - a Witchlight whelp spits too.
- **Red on the base:** in a throwaway `git worktree` of efac5d7 (no stash), 16 Node assertions fail and then the page part throws.
- **Green:** courtyard, whelps, gargoyle-stomp, gargoyle-playtest, witchlight, tells, boss-fight-end (45 fights end), checkpoints, checkpoint-stand, checkpoint-gaps, architecture, skins, dangling-paths, npc-removal, slopes-trace (every frame identical: no rebase), tower-ascent, folly-runtime, archmage-room, killzones, deadends, elites, spawns, traps, signs, collectables, threat-holes, one-new-foe, mini-walls, additional-areas, content-audit, comments, homepaths, and `node tools/textfit.mjs bestiary --strict`.
- **signs failed once:** the new library sign ran to three lines, so it was shortened.
- **killzones failed once and was fixed:** the bridge slab's empty bed under the drain's spikes was a reachable spike tile. That is why the bridge is now `sunk`.
- No `answer-tags` check exists in tools/.

## Capture
- Before and after, from the real page: `work/courtyard/before.png` and `work/courtyard/after.png`, made by `tools/courtyard-shots.mjs` (not in the suite).
- Each sheet has four panels across section 1.
- **After:** the paved yard, the post and the step slab, the drain with the sunk bridge under its spikes, the gate ditch with the cracked ledge, the corbel whelp, the portcullis, and the tower's windows over the yard wall.

## UNVERIFIED
- Nobody has played it by hand. No pilot was run: no boss changed.
- The whelp's alternation (dive, then spit) was checked in scripted cases only.
- The backdrop tower's flicker uses `performance.now` and was seen only in stills.
- MEDALS.mage (660/920/1300) was left as it was, although the level is 54 columns shorter.

## QUESTIONS FOR DANIEL
1. **The yard is 64 columns with three beats: step, bridge, postern.** *Recommendation: play it as is.* If it feels short, the forecourt (x 58-63) can take a fourth beat that combines two slabs.
2. **The whelp spits past its dive and alternates after a dive.** *Recommendation: keep it.* If whelps feel too busy on the Witchlight Stair, make them spit only when you are out of dive reach (one line in updateWhelp).
3. **Its fireball: 6 damage, r 4, 78 px/s, a 0.8 s tell.** *Recommendation: keep it.* It is clearly lesser than his 10 / r 6 / 90 / 1.1 x2.
4. **The garrison list still names 'topiary' (5)** for the tower's sprinkled foes, although their hedge maze is gone. The yard itself is calm. *Recommendation:* drop topiary from GARRISON.mage in a later pass. I did not touch it, because tools/curve.mjs owns those numbers.
5. **Medal times for the Folly:** the level lost 54 columns and gained three rune beats. *Recommendation:* leave them until a timed run.
