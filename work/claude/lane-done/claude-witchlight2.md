# claude/witchlight2: THE BATTLEMENTS, THE GARGOYLE WHELP, and whelps at the Gate Gargoyle's call

Brief: `docs/briefs/witchlight-whelps.md`. Daniel, 2026-09-26: "a section with small gargoyle enemies before the boss. It
could last around a minute. Boss is good, but he should summon those minis rather than the demons."

## What changed
- **A new small foe, THE GARGOYLE WHELP** (`src/gargoyle-whelp.js` holds its numbers, frames and art; `updateWhelp` in
  `src/main.js`). It sits as stone on a merlon or spout, and a blow only chips it (1 damage, a spark, "STONE"). When it has seen
  you it crouches and screeches: `crouchTell`, a yellow `!` (a shield turns it), with a dashed line showing its path. Then it
  swoops in a straight line. A hit does 9 and SHOVES you (175 px/s). If you guard it, it clangs off and lies dazed. Where it
  lands it is soft and takes every blow. Then it flies home and turns back to stone. Broken, it crumbles. It has its own sheet
  of 9 frames (all inside the canvas, E6), its own screech, hurt and death voices (E9), a bestiary row, a short name, colours
  and a threat weight (2.5), and its marks are regenerated (`tools/tells.mjs --write`).
- **A new section, THE BATTLEMENTS** (columns 333-432 of the Witchlight Stair). It runs from the Hedge Warden's gate to the
  Gargoyle's lip: the upper stair, a wall-walk with a 3-tile breach over spikes, a dry moat under a cornice with a narrow
  2-tile ledge between two spouts (one whelp each side), and a checkpoint on the far wall at 395. Then THE EXAM (395-440):
  a sliding slab, a merlon stump under a whelp, a SINKING slab, a fallen merlon block, a rune column up to the gatehouse
  cornice under a last whelp, and a descent under a bone archer and an apprentice to the checkpoint at 440, outside the
  arena. Every moat has a rope only on its near wall, so a fall costs you the climb back and never lets you skip ahead.
  5 whelps, 16 encounters in the level.
- **The level grows by 100 columns** (W 395 -> 495). The Gargoyle's room (arena, slabs, lifts, tower's foot) moved right by
  exactly 100 columns and nothing else about it changed. His numbers, slabs, dive, smash and stun are untouched, and
  gargoyle-smash is green.
- **The Gate Gargoyle's PERCH SHRIEK calls whelps, not imps.** The cadence is the same: every 13 s at most, 2-3 at a time,
  never more than 3 alive. They sit on the tower's face and swoop across his room. They crumble when he dies.
- **Fix this session:** the whelps he called sit more than 420 px from a hero at the far end of his 44-tile room, so the
  usual range freeze left them asleep and they never swooped. Whelps he called are now always updated. `tools/whelps.mjs`
  had caught this (red before the fix, green after).
- Merged origin/master (119d8ae). I hand-resolved the conflicts in main.js (the DMG/EHP rows, where master dropped the Tide
  Reaver) and in the generated block of marks.js, then regenerated the marks. The throwaway debug script it used is deleted.
- `tools/whelps.mjs` is new and registered in `tools/check.mjs`.

## Numbers: the Gate Gargoyle pilot (refill, 150 s cap, seed pass0)
| hero | BEFORE secs / taken | AFTER secs / taken |
|---|---|---|
| knight | 74.3 / 164 | 52.8 / 24 |
| warden | 75.5 / 93 | 53.2 / 57 |
| pyro | 69.4 / 72 | 89.2 / 166 |
All won, before and after; 5 openings a fight both times. The median win went from 74.3 s to 53.2 s and the median damage
taken from 93 to 57. With one seed this is mostly noise. The pilot's `hitBy` only counts his own attacks, so damage from his
adds (imps before, whelps after) isn't broken out. Files: `work/witchlight2/pilot-before.*` (7 heroes x 3 seeds; the rows
above are its pass 0) and `work/witchlight2/pilot-after.*`.

## The section, walked by the play bot (no god mode)
- With every foe removed, the bot crosses from 337 to the exam and then falls into the exam moat, because it never uses the
  rune column at 417 (the bot just walks toward the target). I checked the column by hand in the page: knight, pyro and
  pirate each ride it up and step onto the cornice ledge. From the cornice (420) all of them reach the lip in 6 s.
- With the foes in, the bot can't fight (RULES M). Knight and pirate die at the breach under the whelp, armour and archer.
  Pyro gets to 430.

## Checks run alone, all green
whelps (new), witchlight, gargoyle-smash, boss-openings, boss-fight-end, arena-supplies, mini-names, tells, one-new-foe,
threat-holes, content-audit, audit, signs, spawns, deadends, checkpoints, checkpoint-gaps, checkpoint-stand, architecture,
occluders, ground-depth, footing-art, small-adds, textfit (hints,bestiary,store,tree,menu,hud,pick,practice,plates --strict),
pixels (`node tools/headless.mjs floats`: 32 levels, 2737 sprites), slopes-trace (witchlight is not one of its four levels,
so no rebase), comments, dangling-paths, syntax (node --check on every src and tools file).
Note: pixels hung for 35 min inside `npm run check` (on its own port) while other lanes were loading the machine. Run
directly, it passed in 54 s.

## UNVERIFIED
- Nobody has walked the section with real keys, and the bot can't do the whole section (see above). Human time through it
  is estimated at about a minute; it hasn't been measured.
- The whelps' push over the breach and the narrow ledge hasn't been tuned by hand.
- The tell measures 1.0 s in the page (0.65 s in the table). Something in the game stretches tells; I didn't chase it.

## QUESTIONS FOR DANIEL
1. **Whelp strength:** 28 health, a 9-damage swoop, a 175 px/s shove. Recommendation: keep these until you've played it; if
   the shove into the moats feels unfair, lower the shove, not the tell.
2. **Whelps he calls sit on the tower's face and dive the length of his room** (2.2 s of swoop). Recommendation: keep; if his
   fight gets too busy, call 2 at a time instead of 2-3.
3. **The exam moat's rope goes back to the exam's start (399),** so a fall in the exam costs the whole exam. Recommendation:
   keep it, since that is S3's point; add a second rope at the fallen merlon block (415) if it feels too harsh.
