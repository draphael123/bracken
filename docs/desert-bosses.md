# The desert arc's bosses and minis, as logic (`src/desert-bosses.js`, `node tools/desert-bosses.mjs`)

Nine fights on one small engine: THE BANDIT KING, THE ROC, THE GLASS COLOSSUS, THE FALLEN HIGH PRIEST, THE HOURGLASS KING,
THE SCARAB MOTHER, and the minis THE GLASS STALKER, THE SAND WARDEN, THE EMBALMER. (The Dune Worm and the Skeleton King have their
own machines.) Each is data: four told attacks (three for a mini) with the house marks, a chain, a phase, and a `rule` - the
opening the player makes. Not wired in; for the build, `bossStep(B, world, dt)` returns `tell / act / hit / open / phase2` events.

## What the check proves (7 fights each, two fighters, both reacting 0.25 s late)
- A1/A3: every attack told (>= 0.45 s) with `!` or red X, and every one fires. A5/A6: never untouchable over 2 s (the Scarab Mother's
  burrow is the longest, 1.7 s), a window after each.
- **Every attack has an answer in a quarter-second**: a fighter that only blocks `!` and runs or jumps out of X takes 0 hits, in all 63 fights.
- **The opening is caused**: the fighter who works the rule opens each boss 2-7 times a minute; the one who only fights, 0 (or, for
  the three that open by standing in the right place, a third of the rate or less). And the rule wins faster in all nine.
- Each rule's negative: the right input at the wrong moment opens nothing (a pour on a boss that isn't burning, the wheel with 8 s
  left in his glass, a plate trodden with her out of its reach...).

## What the checks changed from the briefs
- **A GUARD**: blows on these bosses do half damage, except in the recovery after an attack (full) and the opening (double). Without
  it just swinging beat every rule (the Skeleton King's armour is the same idea). The Sand Warden, packed sand and brass, turns 65%.
- **The engine walks the chain in order**: a boss walks, or backs off, into its next attack's range and moves on after 1.5 s.
  Picking "the first attack in range" meant a knight who stayed close saw only the sweep.
- **THE ROC** holds off while the horn blows, then dives on your spot as the torrent comes. The torrent throws it up on the *nearer*
  bank (on the far one you couldn't reach it before the opening ended).
- **THE FALLEN HIGH PRIEST**: the altar mirror's crank is *at the altar* (x 370). On the far wall, the priest never got to the strip.
  Phase 2 (sunset: one low red beam) is only a faster chain here; the build owes the sunset.
- **THE SCARAB MOTHER** charges from the far end: she scuttles back to at least 160 px off to charge (patience 2.5 s). Fight her by
  a plate and her charges run through the trap in front of it.
- **THE SAND WARDEN's room is off to one side of the gate** (x 480-600), not in the middle. In the middle the knight opened it by
  accident as often as on purpose. It won't walk into the room while the sand hisses; its halberd LUNGE carries it in. You can wade the
  room; only the last of the fill buries you.
