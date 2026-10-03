# claude/corpses - reskinned foes die in their own skin (Sonnet, 2026-10-02)

Base: origin/master 007b5b54. Daniel (playing the canal): "the reskinned enemies use a goblin sprite when they die."

## The cause
The living draw (src/main.js, the `sprSet` chain) picks a foe's sheet by reskin flags (canal `cnSkin` / `lamplighter`, the Fair's `shy` / `juggler`,
the Theatre's cast, the bone archer). `spawnCorpse` and the draw of the body looked `SPR[e.t]` up again, so a dead bargeman fell as a goblin gaffer,
a watchman as the goblin archer, the lamplighter as the snuffer, and the same for the Fair and the Theatre (not just the canal).

## The fix (src/main.js, small and local)
- `reskinSet(e)`: one function for the reskin sets, mirroring the living draw (cnSkin, lamplighter, bone archer, haunted bat, theatre cast, shy, juggler,
  and the Well Town's `bandit` bowman: a no-op until claude/welltown merges, so it needs no follow-up).
- `spawnCorpse` stores it on the body (`c.set`), the corpse frame is taken from that set (last frame = hurt pose where the base has one), the V2 death
  frame (an index into the BASE sheet) is skipped for a reskin, and the corpse draw reads `c.set` first.
- The living knocked-back frame (HAS_HURT) and the V2 hurt flash also use the reskin's own set / only an index that exists in it.
- The corpse records `c.shown` (the set it drew) for the test.

## The proof
- NEW `tools/corpses.mjs` (page check, in check.mjs): every reskinned foe on the build (canal x5 skins, fair shy + juggler, theatre flyman / prompter /
  patron / footlights / usher) is drawn alive, struck, killed; the set the BODY drew must be the set it lived in and its frame must exist in it.
  RED on the base: all 12 drew the base sheet (gaffer x3, archer x3, snuffer, drunk x3, gobpriest, mummer). Green after: 12/12.
- `tools/goblin-lint.mjs`: new source asserts (reskinSet exists and covers every flag the living draw reskins by - incl. `e.bandit`; spawnCorpse stores
  c.set; the corpse draw reads it). RED on the base main.js, green after.
- Pictures (8x crops of the body, same moment): `work/claude/corpses/before` (goblin green) and `work/claude/corpses/after` (the man), one pair per reskin.

## Other leaks (game-wide)
- On master, all of them are fixed by the same function: the canal's five skins, the Fair's coconut-shy stallholder and knife juggler, the Theatre's
  flyman / prompter / patron / footlights usher / usher. (The Theatre ones were also leaking: its stagehand-cast are drunk / mummer / archer / gobpriest bases.)
- NOT ON MASTER, to check when they merge: Well Town and Red Gorge add `e.bandit` (SPR.banditArcher) - covered in advance by reskinSet and goblin-lint
  fails if the living draw adds a flag reskinSet lacks. Theatre3 / welltown own bosses (`bossBodies` use `e.lastSet`, so they were already right).
- Not touched: mid-fight forms that swap `e.t` (c.t) - corpse switch cases (`master` -> masterFoot, `king` -> kingUp, `spit` -> stem) keep their own
  sheet; none is a reskin.

## UNVERIFIED
- Watched stills only, not a hand-played kill; the corpse of a foe killed OFF screen draws the same way (the set is chosen at death, not at draw).
- Corpse pose of a reskin with no hurt frame (bargeman / rat / foreman): stand frame 0, as the goblin gaffer's was.
