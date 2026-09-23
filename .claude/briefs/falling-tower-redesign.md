# THE FALLING TOWER, REDESIGNED — brief (batch 4; written 2026-09-21, build in its own session, Opus)

## What Daniel asked for (2026-09-20)
"Mostly an UPWARD ascent" through the collapsing tower, ending on a **MAGIC CARPET the player flies**, fighting the
**Undead Archmage in the air**. He must **look properly undead**, **float**, cast **dodgeable** spells (some from the
first fight) plus **poison** and **death magic**, and **when enraged be much faster and teleport more**. The current
reversed-Folly structure (walk DOWN the old Folly while it sheds floors behind you) is to be **replaced, not tuned**.

## What exists today (read these, nothing else first)
- `src/level.js:7168` - `fallingtower` = `fallingTower({source: theMagesFolly()})`; GARRISON row at :7303, ELITES at :7574
  (three hand-placed elites whose coords die with the old layout: rewrite them).
- `src/tower-return.js` (89 lines) - the reversal: filters the Folly's ents, `START={x:695,y:15}`, `L.fallingTower`,
  `L.reverseTower`. `src/tower-finish.js` (25) - the arena end. Both get REPLACED by one new `src/tower-ascent.js`.
- `src/undead-mage.js` (44 lines) - `updateUndeadMage` (fire/ice/storm tells, blink, slabs that fall, `liveTowerBounds`),
  `bakeUndeadMage` = the Folly archmage's frames RECOLOURED. That recolour is why he doesn't read as undead.
- main.js `updateUndeadMage` wrapper ~13062 (a fall below the arena floor = 18 dmg + teleport back), `updateArchmage`
  ~9997 (the first fight: blink/bolt/rend/slam/spit/swipe/ward - the source of "spells from the first fight").
- Tests that pin the old shape and must be rewritten or retired with it: `tools/tower-return.mjs`,
  `tower-return-runtime.mjs`, `tower-finish.mjs` (+ `-runtime`), `boss-openings.mjs` (undeadmage opening),
  `undead-foes.mjs`, `tools/fixtures/tower-browser.js`. marks.js rows `undeadmage|*Tell`.

## The shape
1. **THE ASCENT (~70% of the level).** A tall level (like the Undercrown, `tall:{...}`, but going UP): start at the
   Folly's broken foot, climb ~180 rows through 5 floors that each look different (library stacks, the orrery cage,
   the burst cistern, the bell loft, the open crown), each floor collapsing from BELOW on a timer once you pass it
   (reuse the shedding slab code: a floor you leave falls away, so there is no going back, and pressure comes from
   under you, not behind). Verbs already in the game only: ledges, ropes (NET), crumbling floors, lifts, brooms/imps/
   apprentices/husks, and the Sunspire's crystal ledges (`T.CRYST` + `L.hasCryst`, now live since batch 3).
   Rule for every level (memory): GARRISON row + no blanket `calm`; target 3.5-4.5 foes/screen measured with a
   VERTICAL shape tool (`work/claude/vshape.mjs`, written in batch 3 - shape.mjs cannot measure a vertical level).
2. **THE CARPET.** At the crown the roof is gone; a flying carpet waits on the parapet. Stepping on = a new player
   mode `P.carpet`: free 8-way flight, ~160 px/s, slight inertia and bob, no ground, attacks work as normal (air
   attacks), a gentle drift so it never feels like noclip. Falling is impossible; being hit knocks the carpet back.
   Lives in `src/carpet.js` (update + draw), hooked BESIDE the other per-level updates (**never inside updateSea**).
   Bot/test hook: `BK.carpet` for tools. Camera: an open sky arena ~3 screens wide, the tower's ruin falling past.
3. **THE ARCHMAGE, UNDEAD AND FLOATING.** A NEW baker (like `src/redraw/prince.js`), not a recolour: a skull face with a
   torn jaw, grave-green eyelights, ribs through a rotted robe, a trailing shredded hem instead of legs (he floats: no
   feet, ever), his staff cracked with a green fire in the head. Frames: idle float x2, cast tells (fire/ice/storm/
   poison/death), blink out/in, enraged (flame-crowned), hurt, die.
   **Spells** (every one telegraphed, every one dodgeable by flying; `!` blockable, red ✕ unblockable per the touch
   rule): FIREBOLT (first fight, aimed), ICE LANCES (first fight, a fan), STORM column (first fight, ✕), **POISON
   CLOUD** (slow green orbs that burst into a lingering cloud = P.venomT like Burial's pits - area denial in the sky),
   **DEATH MAGIC**: a grasping hand of black-green that homes slowly and is dodged by out-flying it, and a DEATH MARK
   ring on the player that detonates after 2 s unless you fly out of it (✕). **Opening** (tools/boss-openings.mjs
   rule: a player-made opening): after DEATH MARK he is exposed for ~2.5 s while he re-gathers.
   **Enrage (<40%)**: move/cast speed ×1.6, blink every ~3 s instead of ~8, spells chain in pairs, the carpet's sky
   narrows as the storm walls close in. Touch never hurts unless an attack is in progress (the TOUCH RULE).
4. **Kept**: the name, the medal times (re-derive from a pilot), music `fallingtower`, the unlock (`needs: 'mage'`).

## Build order (one session, credit rules as KICKOFF)
1. `tools/tower-ascent.mjs` first (built + reach + page), then the level (numbers: vshape before/after), 2. carpet
(unit test: 8-way flight, no fall, knockback), 3. the new Archmage baker (ONE cropped screenshot), 4. the fight + its
opening + enrage (a pilot/bot that flies and dodges, >= 21 runs, normal health), 5. retire the old tower tests in the
same commit that replaces what they pinned, 6. ONE `npm run check`, commit, push, deploy, verify.
Risk to budget for: the carpet is a new traversal mode - expect the suite's reach/footing/killzone tools to need a
"carpet zone" exemption (the arena has no floor by design).
