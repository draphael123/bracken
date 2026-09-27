# THE WITCHLIGHT STAIR: THE BATTLEMENTS, AND THE GARGOYLE WHELPS (brief, 2026-09-26)

Daniel, 2026-09-26: "The Witchlight Stair has the boss right after the mini boss. I'd like a section with small gargoyle
enemies before the boss. It could last around a minute. Boss is good, but he should summon those minis rather than the
demons." Built to RULES-LEVELS-AND-BOSSES.md A2, C1, E6, E9, F10 and section S. **The Gate Gargoyle's fight is otherwise
untouched**: his room, slabs, dive, smash, stun, camera and numbers stay exactly as they are.

## 1. A new small foe: THE GARGOYLE WHELP
A stone gargoyle about the size of an imp, the Gate Gargoyle's brood. Its own silhouette: a hunched stone body, horns, folded
bat wings, a tail, two witchlight eyes.
- **PERCHED** on a merlon, a spout or a cornice, it is stone: a blow glances off it (1 damage, a spark, "STONE"). Its eyes
  glow brighter when it has seen you.
- **THE SWOOP (told, A2):** it crouches and screeches (`crouchTell`, 0.65 s, a yellow `!`: a shield turns it), then dives in a
  straight line at where you are. A hit shoves you hard - off a ledge, off a slab, into the breach. Blocked, it bounces off
  and lies dazed longer.
- **LANDED** at the end of the dive, on a floor or a slab, it is flesh-soft stone: every blow counts. After about 1.3 s it
  flaps back up to its perch (hittable on the way) and turns to stone again.
- **CRUMBLES** when broken: it breaks into chips and dust, its own voice (E9: a grinding crack, a thin screech cut off, pebbles).
- Own sprite sheet (perched, watching, crouch, swoop, fly, landed, crumble, hurt), bestiary row, marks, threat weight, full
  wiring. It fills a gap in the roster: a foe that is SAFE until it moves and whose danger is the push, not the damage.

## 2. A new section: THE BATTLEMENTS (about 100 columns, between the Hedge Warden's gate and the Gargoyle's lip)
The tower's upper stair and wall-walk, a massif of the tower's stone with breaches cut into it. Every fall lands in a dry
moat under the walk (a fall to an earlier point, S2) with a rope up its near wall; no fall bypasses the section.
- **THE UPPER STAIR:** out of the Warden's gate, stone steps two rows each up to the wall-walk.
- **THE FIRST BREACH (S1: a whelp over a jump):** a 3-tile gap in the walk; a whelp perched on a merlon at the far side
  swoops as you jump.
- **THE SPOUTS (S1: a pair that covers a narrow ledge):** cornice ledges over the moat; a narrow two-tile ledge with a whelp
  on a spout above each side of it, taking turns.
- **Checkpoint** on the far wall, 40+ route tiles from the one outside the Warden's gate.
- **THE EXAM (S3), the last ~45 columns:** the level's own rule under pressure. Drifting and sinking slabs over the moat with
  a whelp that swoops at the landing (S1), a rune column lift, then a descent under an apprentice's fire to the Gargoyle's
  lip. It rehearses the boss: stone that dives at you while you stand on slabs. No checkpoint inside it; the one after it
  stands outside the arena (B6).
- The level grows by the section's width: everything from the lip onwards (the arena, the slabs, the lifts, the tower's foot,
  the Gargoyle) moves right by the same number of columns and nothing else moves.

## 3. The Gate Gargoyle calls whelps
His PERCH SHRIEK (same cadence: every 13 s at most, two or three at a time, never more than three up) now calls whelps out of
the tower's cornices instead of imps. They perch on the tower's face, stone, and swoop at you across his room from there:
told like any whelp. When he dies they crumble with him. Nothing else in his fight changes.

## Proof
- `tools/whelps.mjs` (new; red on the old code first): the whelp's stone perch, its told swoop, the shove, the landing,
  the return, the crumble and its voice; the section's placements (S1), jumps (S2), exam and checkpoints (S3/S4); the
  Gargoyle's shriek calls whelps and they go when he does.
- The Gargoyle's pilot (7 heroes, refill, 150 s, 3 seeds) before and after; the section walked by the play bot and by real
  keys; captures in `work/witchlight2/`.
