# claude/desertfoes - the desert's second cast (off claude/welltown5 d15485c9)

Daniel 10-03: the desert roster was mostly cutthroats and Well Town felt samey. Five new faces, one of them a new creature.

## What each foe is, and where

| Foe | What it is | Where |
|---|---|---|
| FIRE SCORPION (`scorpion` + `cnSkin: 'firescorpion'`) | The scorpion's AI (claw !, sting X), recoloured ember with smouldering sparks. Its sting and its death leave a BURNING PATCH: 8 s, 4 damage every 0.6 s to a hero standing in it. The POUR puts it out (it is a pourable, so the HUD says E: POUR), and so does the gorge's water. The first patch you see says WATER PUTS IT OUT, and a glint sits over the patches for 6 s. | Well Town: the bazaar (103), mud wall one (266), roof E (392) |
| VENOM SCORPION (`cnSkin: 'venomscorpion'`) | The scorpion's AI in green. A sting that lands adds the Cistern Queen's venom: her own numbers (3 stacks at most, each slows stamina's return by 25% for 6 s), shown on the venom HUD. It wears off by itself when the Queen is not in the room. It can be placed anywhere, and is meant for the Underwell as her brood. | Well Town cisterns (gallery 213, sump 222); Red Gorge (narrows landing 9/64, summit climb 33/35) |
| SANDWORM (`sandworm`, the one new foe) | The sand goblin's buried machine with the Dune Worm's ripple tell. It lurks, then a ripple tracks you under the sand (it can't be hit). It stops and the sand domes up: LUNGE TELL !!, 0.6 s, so step off. Then the lunge (14 damage), 1.3 s up and swaying (open to hits), a burrow, and it comes up again ahead of you. It never leaves its bed (`bed: [x0, x1]` in tiles). THE FLOOD FLUSHES IT: at the horn it goes deep (or burrows first, then goes deep) and stays down until the water has passed. New sprite, no goblin in it. | Red Gorge: the dry riverbed (channel floor, cols 22-26) at the gorge mouth |
| DYNAMITE BANDIT (`sapper` + `cnSkin: 'dynamiter'`) | The sapper's AI under a man's skin. He stays 44-120 px away, lights a stick and holds it high (!!, 0.7 s, fuse spitting), then throws it to where you stand. It lies fizzing inside a blinking red blast ring (36 px, explode's radius) for 1 s, and it lands on rope-bridge planks too. THE FLOOD DOUSES THE FUSE: a stick in running water fizzles (steam + THE FLOOD DOUSES THE FUSE), and so does one lit in his hand while he stands in the flood. If he dies holding a lit stick he drops it. Otherwise he drops nothing. | Red Gorge: the mouth (15), the basket's top (12/99), beside the summit slinger (37/26) |
| SHIELD GUARD (`shield` + `cnSkin: 'shieldguard'`) | The shieldgob's AI under a man's skin: the front turns blows, he turns slowly, a heavy blow or a plunge breaks him, the shove is told (!), and he forms a shield wall in front of a dynamiter (sappers are in COVERED). In the channel the flood takes half his life. | Red Gorge: the basket foot (30/117), bridge three's span (23/93), bridge five's head (35/41) |

## Placement counts, before -> after

**Well Town** (40 foes, the same 40: a swap, not additions)
- cutthroat 11 -> 5
- water-thief 10 -> 11 (gate 45)
- bandit bowman 11 -> 11
- scorpion 7 + elite 1 -> 5 + elite 1
- fire scorpion 0 -> 3
- venom scorpion 0 -> 2
- vulture 0 -> 2 (over roofs B and E in the open sun: its shadow is moving shade)
- The Kasbah courtyard is left alone: welltown.mjs requires 5 of cutthroat|archer|thief there.

**Red Gorge** (36 -> 37, the +1 is the worm)
- cutthroat 19 -> 11 (53% -> 30%)
- slinger 9 -> 9 (24%)
- raptor 5 -> 5
- scorpion 2 + elite 1 -> 2 + elite 1
- venom scorpion 0 -> 2
- dynamite bandit 0 -> 3
- shield guard 0 -> 3
- sandworm 0 -> 1
- Types: 5 -> 8 (>= 6). No type is over 35%.

L1 pilot (knight, 3 runs, re-stamped): Well Town 34 -> 30 hits, 3 -> 3 deaths. Red Gorge 12 -> 12 hits, 3 -> 3 deaths.

## Files
- New: src/desert-foes2.js (pure rules), src/desert-foes2-hands.js (patches, venom, the worm's flood, the fuse), src/redraw/desert_foes2.js (art), tools/desert-foes2.mjs (the proof: Node part, plus a page part on the real Well Town and gorge).
- main.js: small hooks only. Spawn case, EHP, CV tables, sprites, bestiary cards, the cnSkin carried from ent to foe, the dynamiter's branch in the sapper AI, a stick landing on planks and fizzling in water, the ring, the corpse skin, the hands wired in, and a pourable.
- Others:
  - marks.js: the sandworm's mark, answer and height, then tells --write
  - threat.js and hint-lines.js
  - one-new-foe: redgorge brings exactly raptor + sandworm
  - goblin-lint: FIXED += redgorge
  - check.mjs: desert-foes2 added
  - well-town.js and red-gorge.js placements
  - docs/level1-pilot.json and docs/mash-bot.json re-stamped (level rows only)

## Checks
See the final commit message and the coordinator report. Run: desert-foes2, welltown, redgorge, level-quality welltown redgorge, mash-gate, goblin-lint, one-new-foe, hint-shown, tells, threat-holes, answer-tags, djinn, cistern-queen, boss-openings, touch.

## Not run on this base (UNVERIFIED)
- tools/corpses.mjs and tools/gorge-basket.mjs live on master (batch58), not on claude/welltown5. My attempt to merge master was refused by the permission system, so neither was run.
  - gorge-basket kills every foe before it measures the baskets, so the new placements cannot touch it. I did not edit src/red-gorge-hands.js.
  - corpses: master's reskinSet() already picks any e.cnSkin, so these reskins die in their own skins there. My corpse line stands aside when c.set is present. corpses.mjs only walks canal/fair/theatre: add 'welltown' and 'redgorge' to its list at merge.
- Merge notes:
  - tools/check.mjs list line will conflict with master's: keep both sides' names.
  - goblin-lint.mjs: my FIXED line and master's new block are separate hunks.

## Questions for Daniel (recommendation first)
1. Burning patches burn out after 8 s on their own. Rec: keep (the pour is the quick way; an endless patch would pile up). Alternative: they burn until poured.
2. The Well Town cisterns are still two roles (melee + runner), as before. Rec: leave the cistern hall to scorpions and thieves (it is underground and dark). Alternative: a bowman on the gallery.
3. The sandworm has one placement in the gorge: the channel floor at the mouth is the only sand riverbed (higher up it is plank bridges and ropes). Rec: keep one, and use it in the Underwell's sand rooms. Alternative: widen the mouth's riverbed for a second worm.
4. The dynamite bandit's stick does damage to other bandits in its blast (explode hurts every foe within the ring). Rec: keep (luring his stick onto his friends is a good trick). Alternative: bandits only.
