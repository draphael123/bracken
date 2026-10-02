# claude/paladinmace: the paladin's heavy two-handed flanged mace (Sonnet)
Art only. Hitboxes, timings, frame counts, stats unchanged.
- src/chars.js, knightFrame `maul` branch (every paladin pose and skin goes through it): a long oak haft (butt 3 px behind the hand, leather grip wrap, gold pommel/socket), a big head - two flanges round a studded core, spike tip, outlined, drawn gap-free at any angle - and BOTH hands on the haft in every pose (gauntlet at the grip; off hand a stride up the haft, with a short forearm; where an ability supplies its own off arm the second gauntlet sits at its end).
- Weapon skins: only the head (core, flanges, stud, spike) uses WT/withWeapon; haft, wrap, socket, pommel, gauntlets keep their own colours.
- Captures: work/claude/paladinmace/before.png, after.png (all poses), before-skins.png, after-skins.png (steel/ember/frost/moon x 10 poses), capture.mjs.
- UNVERIFIED: not felt in motion; weight comes from the existing pose tables (head trailing in carry/slide, planted in idle/block/kneel) - no pose table was redrawn.
## QUESTIONS FOR DANIEL
1. Head is ~7x8 px, haft ~11 px: recommend keep; say if you want it bigger/smaller.
- Slide and kneel poses raised 2-3 px so the longer haft butt stays above the floor (slide, crouch-feet).
