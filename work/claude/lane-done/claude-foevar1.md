# foevar1 (lane F1, desert) - 11-10, code-only, branch claude/foevar1 @ 49e5d43f9 (from batch157 be938d79f), pushed
Change: src/cast-pass.js only. New row key `fromSkin` (thin a level's own reskin; the swapped foe drops it); 17 rows over caravan, underwell, glasssea, ksar, buriedcity, sealedpyramid. Only foes the road has already introduced are used (one-new-foe stays green): waterthief (Well Town), fire scorpion (Well Town, DF2H hands live on every level), raptor (Red Gorge, = vulture machine), sand-drowned ambusher (Buried City), construct, cutthroat, vulture.

## Per level (kinds / variety score, before -> after)
- caravan 7/5.7 -> 7/5.7: cutthroat 14->11, scorpion 9->12 (threat 3 for 3). Capped: it is the first desert level, anything else would debut a later foe early.
- underwell 12/9.2 -> 13/10.5: venomscorpion 13->8, +waterthief 5 (scorpion total 42% -> ~28%).
- glasssea 7/5.9 -> 10/8.7: glassscorpion 13->9 (+4 fire scorpion), nighthunter 11->8 (+3 waterthief), vulture 8->5 (+3 raptor).
- ksar 10/7.8 -> 13/11.1: wallslinger 18->14 (+4 raptor), ksarblade 18->10 (+5 waterthief, +3 fire scorpion).
- buriedcity 6/4.7 -> 9/7.3: sandslinger 14->8 (+3 raptor, +3 vulture), sanddrowned 11->8 (+3 fire scorpion). Constructs unchanged (signature).
- sealedpyramid 12/7.2 -> 13/9.0: plain mummy 23->18 (+2 construct, +2 sand-drowned, +1 cutthroat tomb robber), jackal 11->9 (+2 vulture, outer court). tombWait/trap-guard mummies untouched, so mummy+tombskel is still ~42% (was 49%).

## Sand Goblin
NOT placed raw. `sandgob` is in the goblin lists (goblin-lint, foe-cast-lint fail it past the Queen) and the `ambusher` IS its machine (ambusher touchable = sandGobTouchable, same buried/under steps), already reskinned as sanddrowned/sandbound. The reskin exists; I spread it (pyramid +2, buriedcity kept). A distinct sandgob skin would need new art + a card: not done.
## Checked unplaced foes (AI/art load in node)
sandgob (SPR.sandgob, newSandGob, step, bestiary row), raptor (RGH.raptorStep, no RG needed), waterthief (WTH.thiefStep, steals a sip only if the hero has sips). assassin / bellman: only in the old level.js builder block, not touched (no art-loading check run past the grep).

## Checks (node only)
OK: foe-cast-lint (all rows meet min), one-new-foe, threat-holes, goblin-lint, curve (danger index within +-2 per level: caravan 133, underwell 166, glasssea 137->139, ksar 220, buriedcity 148, pyramid 221->219; no new wall), node --check cast-pass.js, desert-bosses/rules/sets/caravan/desert-foes/art tools. sealed-pyramid.mjs: 1 FAIL ("appended last in LEVELS") is pre-existing, unrelated.
RED (expected, owed): level-quality - all 6 levels fail pilot + mash ("level changed since its pilot ran", hash mismatch). Those tools use cdp, so not run: owed after the gate: `node tools/level1-pilot.mjs <id> --write` and `node tools/mash-bot.mjs <id> --level <id> --write` for caravan underwell glasssea ksar buriedcity sealedpyramid.
Skipped (cdp): save-safety, foe-footing is node-only and ran (my swaps are on existing ents' own x,y; the flagged footing rows are foes I did not swap), desert-foes2, ksar, buried-city, bandits, underwell tools, QUICK gate.

## Owed browser walk (stills per level)
caravan: a claw in the garrison where a blade was. underwell: a waterthief at a well (sip theft, run). glasssea: fire scorpion on glass (hiss + patch told, hurts), raptor over the dunes, waterthief. ksar: raptor on the walls (no ledge clipping), fire scorpion at a gate, waterthief. buriedcity: raptor/vulture circle over streets, fire scorpion on sand. sealedpyramid: construct/drowned/cutthroat in a tomb corridor, jackal->vulture outer court. Confirm no foe in a pit/wall, and that raptor stoop dmg (12) feels right at glasssea/ksar d44-45.

## Questions (rec first)
1. Raptor dmg 12 (vs vulture 10) now appears at ksar/buriedcity/glasssea: keep? Rec yes (threat 2.5 = the slinger it replaces).
2. Waterthief outside the Well Town steals a sip: fine in underwell (wells), odd at ksar/glasssea (where it is cutthroat-in-blue). Rec keep, re-skin later if it reads wrong in the walk.
3. Caravan stays at 7 kinds (first desert level). Rec accept; or pull the Well Town's fire/oil scorpion earlier in a later lane.
4. Distinct Sand Goblin skin (art lane)? Rec no; the sand-drowned already is it.
