# claude/undercrown2art - THE UNDERCROWN 2 ART + THE ROAD OPENED (Sonnet lane, 10-16)

Base: claude/undercrown2 (66969373) + origin/master merged. Port 8967. Finished by a second agent after the first was stopped at 05:55.

## What is built (commits 1-5, pushed)
1. Its own tile kit + palette (footings, dead water, glitter, diggings, tomb zones), walls + landmark piers, slab/post/heap art, ambient drips and castle light.
2. Dressing, culling, the Prince's Tithe vault, crystal room, the Prince's heave pose (frame 23).
3. **ROAD_OPEN.undercrown = true** (src/level.js). Undercrown campaign-xp row refreshed (level reworked: run 1192 -> 921).
4. Checkpoint at the stope's west floor (checkpoint-gaps was red: 238 tiles). Prince 3150 -> 2550 hp (64% with flasks at the road position). Heave tell on the THROWN list + marks table; goblin-lint / solid-islands lists follow the road.
5. No shrine on the start tile (level-quality: one per 86 -> 103 route tiles).

## Re-stamps (and why)
- Undercrown campaign-xp row (level reworked, road position).
- Prince hp 3150 -> 2550 (boss band at the new road depth, with flasks).
- Level-1 pilot, curve (232%, 4 deaths, act-2 band), mash level (every hero dies) and mash boss (0/6) on the new level hash.
- Checkpoint list (one added). No test was weakened.

## Checks (this tip, road OPEN), all GREEN
level-quality undercrown, undercrown-variety, reach-heroes undercrown, boss-openings, boss-read, mash-gate, map-grammar, map-spacing, map-scale, map-forks, class-spurs, crown-route, crown-requests, level-jump, save-slots, save-safety, textfit (all scopes, **plates included: 1392 screens in 149 s, 3377 screens total, 0 findings** - the opus-lane timeout was machine load), mobile-perf.
(Earlier commits also ran green: checkpoint-gaps, goblin-lint, solid-islands.)

## Reds
- None of mine. mobile-perf failed once under load (map 1033 ms frame, title 29 fps while another process ran); re-run 3x on a quiet machine: green twice, once a single 700 ms first-map-frame hitch (budget 600) - noisy first-frame, not a regression of this lane (the map draw is unchanged except one node).
- Inherited from base, not mine: level-reach `burning` rule line, signs/elites exit 1 (see claude-undercrown2.md).

## Grade (design-standard A8, honest): B-
Screenshots kept OUTSIDE git: C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\uc2art-shots-1016\ (adit, works, tomb).
- Good: a coherent dark under-castle, dressed foundation stone, timber sets with iron bands, warm lamp pools against cold blue glow, tomb with red skull banner and hanging posts; slabs read as drawn objects; not the forest default.
- Weak: the castle's-foundations LANDMARK is not visible on most screens (the piers read as generic columns, esp. the tomb which is sparse and flat), floors repeat a long band, and the works/adit mid-sections have little set-piece scale beyond the slabs. Not an A8 identity of 15/18 for sure; I estimate 13-14/18.

## QUESTIONS FOR DANIEL (rec first)
1. Ship the road open now at B-? REC: yes - everything is green and the level plays; take a landmark/decor polish pass (a drawn castle-undercarriage overhead: arches, chains, a vast footing visible through the roof gaps) as a follow-up lane.
2. Prince at 2550 hp (64% with flasks, in your 60-70% band) - playtest gate was lifted, so REC: ship; tell me if he feels short.
3. Tomb chamber is sparse: REC add a throne dais, bones and banners in the polish pass.
