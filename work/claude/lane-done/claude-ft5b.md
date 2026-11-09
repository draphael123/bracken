# ft5b: FALLING TOWER 5, the boss arena outside (THE SPIRE FIELD), behind FT5_SHIPS (off)

Branch: `claude/ft5b`, built off `claude/ft5a` at fb7e23952 and pushed. This was an opus lane and code only: no browser and no full suite. One page check opened a page by itself (see Checks).

## How to see it
- **In the browser:** `?ft5=1&dev=1&ft5boss=1[&hero=<id>]` puts you on THE CROWN (checkpoint 4). The spire field starts one step east. Nothing is saved.
- **Boss jump:** `?ft5=1&boss=undeadmage` also works. It stands you on the west spire, past the start line.
- **Win rates (for the tune lane):** `node tools/boss-rates.mjs fallingtower --ft5`. The `--ft5` flag sets `globalThis.__FT5` in the page before the fight's level is built.

## What's built (src/spire-field.js fills ft5a's stub; every number is relative to FT5_ARENA)

**Layout**
- Six spires stand out of his poison sea, row 70. Their tops, west to east: 63 / 61 / 56 / 59 / 55 / 53.
- Three masonry ledges sit between them. Two are corbels on spire faces.
- The crown is level with the west spire.
- Three spires carry a CRACKED BUTTRESS: bell, moon and crown.

**P1, on foot (100 to 50%)**
- **His spells:** the chase rooms' set (fire, ice, hand, mark). From 75% he adds storm, rings, bend, bone storm, decoy and trap. Same tells and numbers as now.
- **Hover height:** he stays at least 72 px over the ground you stand on, and no more than 80 px above that. A jump does not drag him.
- **Tides:** at 85, 70 and 60% of his health.
  - Each is told 1.6 s ahead: banner, thunder, the surface bubbling.
  - Each rises 4 rows over 2.5 s (70 → 66 → 62 → 58), then holds.
  - The sea drops 1 row while he is open.
- **Topples:** at tide 1 the west spire goes over, at tide 2 the well spire, at tide 3 the gate spire.
  - Each is told 1.5 s: red base, crack, lean.
  - Each lays a bridge. The well spire's bridge joins the bell spire to the moon spire.
  - A spire will not go over while a hero stands on it. It holds for up to 6 s more.
- **Poison:** a seat that touches it takes 21 and is thrown onto the nearest top. It never kills ('spare'). Each seat gets a 1.2 s hold before it can be hit again.
- **Openings:** his bolt struck back, his mark finding no one, a roll through his exit ring (now works on foot), or a buttress dropped on him.
  - Every opening drops him onto the nearest spire top, open x2 for 3 s. This is the chase rooms' rule.
  - **Buttress:** strike it while he is in its fall box (a ghost outline shows the box) and the spire top comes down on him.
  - If he is outside the box, the buttress falls anyway, one use, and the miss is said.
  - While his ward holds, it does not fall.
- **Health floor:** he cannot go below 50% on foot. At the floor HE HOLDS is said, and his 'down' is cut to 0.35 s.

**The fade at 50%** (waits until his current spell is finished)
- He rises (0.6 s), then fades (1.2 s, alpha to 0).
- Every platform shimmers his green for 1.0 s, then clears top-down over 0.5 s. The sea drains, so nobody falls into poison.
- Seats fall, capped at 420 px/s.
- A rug flies up under each live seat. Downed seats are included. A seat far from the lead is pulled to it first.
- No damage and i-frames for the whole beat. His shots are cleared.
- The arena becomes the carpet box: same x, rows runFloor-15 to +3.
- He re-forms 1.0 s after the last seat is caught. There is no 'wake'; his first cast follows 1.0 s later.

**P2, on the carpet (50 to 0%)**
- main.js's own carpet/hall fight, in the same box.
- Realms: FIRE at 40%, ICE at 20%. The poison realm is retired.
  - **Opened in place:** while he tears the realm, carpets are drawn toward its middle at 160 px/s. Nobody is teleported and the camera never cuts.
- He enrages at 30%.
- His realm ward now chips at 0.4 (FT5 only) instead of turning blades completely. This is the plan's resist floor.

**Win and camera**
- **Win:** his door opens where he falls (L.sanctum). It leads to the SAND rows 6-12 over the field (dune skin), a sign, and the gate at x34.
- **Camera:** spireStep starts the fight and widens the lock to the box over 0.8 s (worst 3.5 px a frame). No snap. Same x lock in both phases.
- **Retry:** a death sends you to the crown with every tile of the box back, the sea down, the arena back to P1, and the whole fight again.

**Shared edits**
- `undead-mage.js`: `e.legStep` (spireLeg runs where c.chase runs), `e.enrageAt`, `e.onFoot` ring breach, `e.realmKinds`.
- `mage-realms.js`: `A.inPlace`, `e.realmKinds`.
- `tower-fall5.js`: spreads `field.level`, `calm` and `skins` (3 lines).
- `hint-lines.js`: SPIRE_SAY added.
- `boss-run.mjs` and `boss-rates.mjs`: the `--ft5` flag.
- New files: `src/spire-lines.js`, `tools/ft5-arena.mjs`.

**main.js:** 8 tagged lines `(claude/ft5b)`:
- the import
- spireReset in spawnEntities
- spireStep beside ft5Update
- the realm ward chip under FT5
- the P1 health floor
- the field draw
- his fade alpha
- the dev entry

## Checks (node)
- **tools/ft5-arena.mjs (new): ok.** It covers:
  - the build
  - reach from the crown to every spire top
  - the lock tween
  - tides tied to his health, with at least 3 spire tops above every tide and every top reachable from every other
  - a topple waiting for the hero to step off, and the sea dropping while he is open
  - poison contact per seat
  - all 4 openings landing him on a top, open
  - buttress crush, miss and ward-hold
  - the 50% floor
  - a chip of 0.4 on foot, on the carpet and in a realm
  - the fade: 4 seats caught (one downed, one far away), 0 damage, i-frames throughout, no wake, box cleared, sea drained, catches in the carpet box, worst hero move 7.3 px a frame
  - P2: realm in place and centred, fire then ice, no poison realm, enraged at 30%
  - reset
  - an end-to-end fight on foot with his real casts: 3 tides, 3 topples, the fade, P2 at 50% after 19 s
  - with the flag off, master's tower is unchanged
- **fallingtower5.mjs (ft5a's): ok.** With the flag off, both hashes still match master.
- **FT5 on:** level-quality fallingtower clears the bar. Also ok: solid-islands, signs, spawns, killzones, deadends, checkpoint-gaps, checkpoint-stand, tells, answer-tags, slopes.
- **Flag off:** tower-hall, boss-read and undead-moves are ok. The node parts of undead-realms and tower-chase pass; I cut their page halves off to run them.
- **Page check:** tools/hint-shown.mjs opened one headless page by itself. Free RAM was 2.7 GB, it passed, and it closed itself.

## Owed
- **Browser stills (plan sec 8, the ft5b part):**
  - the crown → arena widen
  - P1 tides 1, 2 and 3
  - a spire topple, and a buttress crushing him
  - the fade (3 frames: shimmer, falling, caught)
  - P2 first cast
  - the fire realm and the ice realm in place
  - the win door
  - the co-op catch (2 seats, 2 carpets)
- **Page checks:**
  - boss-openings
  - the max camera move measured across the whole fight (node only proves the hero's move per frame and the lock tween)
  - undead-realms and tower-chase page halves, archmage-rings, realm-shots, boss-greed
  - textfit for the 12 new lines
  - mobile-perf (the sea draw and the fade shimmer loop over the 65x65 box)
- **Tune lane:** boss-rates `fallingtower --ft5`, n=6. The lab bot has never fought him on foot, so it may need a P1 pilot.
- **Not built:**
  - his misses knocking masonry loose over told shadows (FT4a FALL4 needs L.ft2)
  - slabs floating up on the tide as rafts
  - the camera lock's bottom rising with the tide
- **Art:** the sea, spires, buttresses, fade, rugs and sand are greybox. P2 draws the FT4 hall backdrop (its walls and witchfire floor) outdoors.

## Questions (rec = what I built)
1. **Buttress topple:** the plan says "that spire is now a bridge". **Rec/built:** it drops masonry on him only, with no tiles laid, so the reach guarantees stay simple. The tide topples are the bridges.
2. **Tide marks:** 85, 70 and 60%. The plan's bands are 100-85, 85-70, 70-50. **Rec/built:** the third tide comes at 60%, so the last band is fought at high water.
3. **The fall:** capped at 420 px/s, so the hero moves at most 7.3 px a frame and the camera follows smoothly. **Rec: keep.** The alternative is a free fall, which reaches about 10 px a frame.
4. **P2 backdrop:** it is still the FT4 hall (walls and witchfire floor). **Rec:** the art lane turns it into open sky and moon, and keeps the fire floor as the carpet's floor rule.
5. **Masonry from his misses, tide rafts, the rising camera bottom:** not built. **Rec:** add them only if the browser walk or the tune shows P1 reads flat.
6. **Realm ward:** it chips at 0.4 under FT5 only. FT4 on master still turns blades completely in a realm. **Rec:** fine, since FT4 is retired at the flip.
