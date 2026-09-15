# BRACKEN animation, grounding and silhouette audit

Findings only: nothing in the game was changed. Every number here was read off the running game (headless Chrome on port 5908, master 48b33b9) by the tools listed at the end. The ranked lists come first, then the full tables.

**Kinds:** "bug" = the code or art does something other than it plainly intends. "design" = it works as written, and the result is unclear.

## Top findings

### 1. Grounding and contact during play
1. **[bug] The pyromancer hovers 2 px above the floor** on 90% of 381 standing samples (median +2 px), across the marsh, the Hanging Wood, the Long Water, Underleaf and the Hexed Fields. Nothing of her touches the ground.
2. **[bug] The Quartermaster (Flotilla) is drawn 9 px below where the game stands him**, on all 17 samples. His boots meet the deck, so his collision body floats 9 px above the feet you see. He is drawn at 1.25x scale.
3. **[bug] Weapons are drawn into the ground.**
   - The Death Knight's lowest pixel sits a median 6 px under the floor on 96% of 405 samples (Kingswood, Stormhold, the Hurricane, Waymeet).
   - The knight's hanging sword tip sits 2 px under it on 69% of 486 samples, and the freebooter's 2 px under on 64% of 368.
4. **[bug] Small, steady sinks:**
   - the lurker 3 px on 92% of 49 samples (the wood, the spore caves);
   - the goat 3 px on 70% of 133 (the scree, Highcrown);
   - the hare 2 px on 89% (the moor);
   - the runner 2 px on 63% (Waymeet, the fields).
5. **[bug, verify] Bodies hover in the Undercrown:** the miner +3 px on 89% of 135 samples, the propman +2 px on 85% of 102. Both stand on the same tile set there, so its art's top rows may be the cause; that has not been confirmed. The shardling's +6 px may be a float by design.
6. **[design] Every hero's shadow blob travels up with his feet** when he jumps: 115-200 samples per hero more than 6 px off the floor. The shadow does not stay on the ground under him.

### 2. Animation coverage
7. **[design] 35 creatures show no recoil frame when hit.** The bosses among them: the Captain, the Chief, the Forgemaster, the Great Hound, the Herald, the Owl, the Quartermaster and the Queen. 33 are simply missing from `HAS_HURT` (main.js:3281). The harpy and the rook are listed there and still drew no recoil in the harness.
8. **[design] Four windups draw the standing frame, so the mark is the only warning:** the owl's `fanTell`, the frog's `tongueTell`, the windcaller's `stoneTell`, the Archmage's `blinkTell`.
9. **[design] Hero actions without frames of their own, the same for all five heroes:**
   - the low sweep and the dash attack draw light 1's frames (`atk:0-3`);
   - the rising cut draws the air swing's (`air:1-2`);
   - the dash shows a run frame;
   - swimming shows idle and run frames;
   - a parry shows block frame 0.

   Also on the knight: he carries two different shields, a small round buckler in the idle, run, air, hurt and three-cut frames, and a big kite shield only in the heavy, rush and block frames (see `anim/knight-8x.png`). It is drawn in every frame.
10. **[design] Turns and deaths:** 96 of the 106 creatures that turned round flip in a single frame, with no turn frame. The bat, the cutlass and the wasp leave no body when killed.

### 3. Silhouette and readability
11. **[design] Outlines that blend into their ground** (share of the outline under 1.5:1 contrast):
    - the drowned king on the Deep: 88%;
    - the sworn sword on Waymeet: 87%;
    - the thorn in Bracken Wood: 83% (median 1.14:1);
    - the berserker and the grandmother in Underleaf: 82%;
    - the Queen in Bracken Wood: 73%;
    - the homunculus and the broom in the Mage's Folly: 71-72%.
12. **[design] Confusable pairs, and sprites with no facing cue.**
    - The cutlass and the netter share the Flotilla, the Hurricane, the Deep and the Causeway: their silhouettes correlate 0.82 and their colours are 28 apart.
    - The miner and the sentry share the Spire, Stormhold and the Undercrown: silhouettes correlate 0.81.
    - 14 front-facing sprites show no facing cue at all (0% of the standing frame changes under a mirror), among them the sprig, sapper, assassin, shaman, spider, harpy, kite, bat, weaver and mimic.
    - The biggest drawn-versus-box mismatches: the ploughman at 3.4x its box's width, the mounted lancer at 3.2x wide and 2.8x tall.

**Coverage matrix summary** over 106 creatures (idle, walk, turn, windup per tell, attack, hurt, stagger, death): OWN 426 cells, SHARED 154, NONE 365.

## What could not be measured

- **Landing dust.** Once the hero was only sampled calm (the fix that keeps swing trails and ward rings out of his body), no landing was caught. Not measured.
- **Ship decks.** The Flotilla and Hurricane crews (sailor, boarder, bosun) read about 9 px sunk against the deck's tile top. I could not settle where the plank art's visible top edge sits, so those are not reported.
- **Hanging and floating bodies** don't stand, and are excluded: the spider on its thread, the spitcap under its web, the petrel.
- **Contrast** was read at one place per creature (where it first appears), not three places per level: the cheap version.
- **Creatures missing from coverage and silhouettes:**
  - own draw path: the king, the kraken, the sweep;
  - the harness's forced modes broke them: the grub queen, the roc, the scarecrow king;
  - did not spawn: the eel, the masthead.
- **Pose transforms** (a tilt, a squash) are not in the frame hash, so a tilted idle frame counts as SHARED.
- **Knocked and ragdoll states** were not forced, so they are not in the matrix.
- **The hero's death** is drawn by its own path, which reuses the hurt and crouch frames rotated (main.js:16704). It is not in the hero matrix.

## Tools, sheets and how to re-run

**Tools** (run from the worktree root in Git Bash):
- `tools/audit-contact.mjs`: grounding during play;
- `tools/audit-anim.mjs`: hero state coverage;
- `tools/audit-hitboxes.mjs`: the creature coverage and silhouette data, in the same sweep as the combat audit;
- `tools/audit-report.mjs`: builds the tables.

```
OUT=<dir> SECS=40 EVERY=10 PORT=5908 node tools/audit-contact.mjs
OUT=<dir> SCRATCH=<dir> PORT=5908 node tools/audit-anim.mjs
COMBAT=<dir> CONTACT=<dir> ANIM=<dir> node tools/audit-report.mjs <outdir>
```

**Sheets.** They stay out of git with the combat sheets, in the session scratchpad `C:/Users/danie/AppData/Local/Temp/claude/C--Users-danie-OneDrive-Desktop-Claude-Cowork/a33bc100-61df-41bc-b6c4-648830f76229/scratchpad/`:
- `animation/contact-worst30.png`: the worst 30 creature contact cases, floor line red, lowest body row cyan, on the real frame;
- `animation/contact.json`;
- `anim/heroes-<hero>.png`: every baked hero frame;
- `anim/knight-8x.png`;
- `anim/anim.json`;
- `combat/silhouettes.png`, `combat2/silhouettes.png`, `combat3/silhouettes.png`: every measured creature at 1x and 3x on its own ground, split over the three sweep passes.

## 1. Grounding and contact during play

8674 samples over 23 levels (the playtest bot, 40 s a level, lifted to a quarter, half and three quarters of the way along). Gap = floor line minus the row under the lowest opaque pixel: -1 is the one-pixel overlap the art uses to meet the ground; SUNK <= -2, HOVER >= +2 while standing. "physics" rows had no tile top near the feet (a ramp, a slope, an odd tile) and are measured against the game's own foot line.

### wood (knight; reached column 325 of 528)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:knight | 163 | 133 | 52 | -3 | -3 / -1 | 106 | 0 | 0 | 22 |
| sprig | 75 | 69 | 0 | 0 | -2 / 4 | 2 | 6 | 0 | 5 |
| spit | 18 | 18 | 0 | -1 | -2 / 4 | 4 | 3 | 0 | 0 |
| shield | 25 | 25 | 0 | -1 | -2 / 2 | 4 | 1 | 0 | 0 |
| thorn | 77 | 76 | 0 | 0 | -2 / 4 | 2 | 3 | 0 | 1 |
| lurker | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |

### marsh (pyro; reached column 389 of 502)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pyro | 108 | 46 | 0 | 3 | -1 / 5 | 0 | 42 | 0 | 22 |
| turtle | 39 | 37 | 0 | -1 | -2 / 5 | 6 | 6 | 0 | 2 |
| sprig | 60 | 58 | 1 | 0 | -2 / 5 | 2 | 6 | 0 | 0 |
| archer | 38 | 38 | 0 | -1 | -2 / 4 | 4 | 2 | 0 | 0 |
| hopper | 29 | 20 | 2 | -1 | -2 / 3 | 3 | 1 | 0 | 8 |
| spit | 2 | 2 | 0 | -2 | -2 / -2 | 2 | 0 | 0 | 0 |

### stockade (paladin; reached column 380 of 494)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| sprig | 83 | 78 | 0 | 0 | -2 / 5 | 0 | 10 | 0 | 4 |
| thorn | 54 | 53 | 0 | 0 | -2 / 4 | 1 | 5 | 0 | 0 |
| archer | 28 | 28 | 0 | -1 | -2 / 4 | 2 | 1 | 0 | 0 |
| hero:paladin | 140 | 79 | 0 | -1 | -5 / -1 | 2 | 0 | 0 | 21 |
| sapper | 33 | 33 | 0 | 0 | -1 / 6 | 0 | 2 | 0 | 0 |
| brute | 2 | 2 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |

### spore (pirate; reached column 450 of 552)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pirate | 198 | 156 | 0 | -2 | -3 / -1 | 103 | 0 | 0 | 35 |
| sporeling | 128 | 128 | 0 | 0 | -9 / 7 | 16 | 31 | 0 | 0 |
| lurker | 48 | 48 | 0 | -3 | -4 / 3 | 37 | 7 | 0 | 0 |
| spitcap | 29 | 29 | 0 | 1 | -7 / 30 | 5 | 8 | 0 | 0 |
| thorn | 4 | 4 | 0 | 2 | 0 / 2 | 0 | 2 | 0 | 0 |
| weaver | 6 | 6 | 2 | -1 | -3 / 2 | 1 | 1 | 0 | 0 |
| shaman | 2 | 2 | 0 | -2 | -2 / -2 | 2 | 0 | 0 | 0 |
| spider | 1 | 1 | 1 | -9 | -9 / -9 | 1 | 0 | 0 | 0 |
| shield | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| drone | 37 | 0 | 0 | - | null / null | 0 | 0 | 0 | 1 |

### kings (reaper; reached column 479 of 618)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:reaper | 112 | 96 | 0 | -6 | -7 / -5 | 96 | 0 | 0 | 14 |
| shield | 74 | 74 | 0 | 0 | -2 / 5 | 3 | 16 | 0 | 0 |
| archer | 56 | 56 | 0 | -1 | -9 / 4 | 7 | 3 | 0 | 0 |
| thief | 92 | 80 | 0 | 0 | -2 / 4 | 3 | 5 | 0 | 9 |
| hound | 25 | 14 | 0 | 0 | -3 / 5 | 1 | 2 | 0 | 9 |
| sprig | 40 | 36 | 0 | 0 | -2 / 5 | 0 | 2 | 0 | 2 |
| brute | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| pike | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |

### scree (knight; reached column 427 of 552)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| goat | 101 | 101 | 0 | -3 | -4 / 4 | 82 | 2 | 0 | 0 |
| hero:knight | 157 | 91 | 4 | -2 | -3 / 1 | 59 | 0 | 0 | 60 |
| troll | 54 | 54 | 0 | -1 | -4 / 5 | 10 | 2 | 0 | 0 |
| rockgoblin | 1 | 1 | 0 | -3 | -3 / -3 | 1 | 0 | 0 | 0 |
| harpy | 86 | 0 | 0 | - | null / null | 0 | 0 | 0 | 8 |
| sprig | 2 | 2 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| shield | 2 | 2 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |

### hanging (pyro; reached column 75 of 110)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pyro | 110 | 95 | 1 | 2 | -2 / 3 | 1 | 90 | 0 | 0 |
| sprig | 59 | 53 | 0 | 0 | -2 / 5 | 0 | 6 | 0 | 3 |
| owl | 29 | 23 | 3 | 1 | -2 / 6 | 3 | 3 | 0 | 0 |
| spider | 1 | 1 | 1 | 2 | 2 / 2 | 0 | 1 | 0 | 0 |

### spire (paladin; reached column 94 of 96)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:paladin | 208 | 160 | 0 | -1 | -7 / -1 | 9 | 0 | 0 | 36 |
| sprig | 19 | 17 | 0 | 0 | -2 / 4 | 0 | 2 | 0 | 1 |

### moor (pirate; reached column 245 of 908)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pirate | 127 | 61 | 0 | -2 | -3 / -1 | 40 | 0 | 0 | 54 |
| hare | 42 | 27 | 0 | -2 | -3 / 2 | 23 | 1 | 0 | 8 |
| sailer | 111 | 0 | 0 | - | null / null | 0 | 0 | 0 | 3 |
| harpy | 34 | 0 | 0 | - | null / null | 0 | 0 | 0 | 1 |
| kite | 26 | 0 | 0 | - | null / null | 0 | 0 | 0 | 13 |
| rockgoblin | 1 | 1 | 0 | 1 | 1 / 1 | 0 | 0 | 0 | 0 |

### storm (reaper; reached column 342 of 430)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hearthgob | 148 | 148 | 0 | 1 | -2 / 8 | 26 | 63 | 0 | 0 |
| hero:reaper | 90 | 72 | 0 | -6 | -7 / -4 | 72 | 0 | 0 | 17 |
| archer | 45 | 45 | 0 | 2 | -8 / 11 | 9 | 32 | 0 | 0 |
| cutter | 34 | 34 | 0 | 2 | -2 / 10 | 2 | 20 | 0 | 0 |
| brute | 42 | 42 | 0 | -1 | -2 / -1 | 8 | 0 | 0 | 0 |
| lance | 10 | 8 | 0 | -2 | -2 / 31 | 6 | 1 | 0 | 0 |
| sprig | 26 | 24 | 0 | 0 | -2 / 5 | 1 | 2 | 0 | 2 |
| shield | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| sentry | 1 | 1 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 0 |
| pike | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |

### crown (knight; reached column 538 of 688)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:knight | 125 | 50 | 0 | -2 | -3 / -1 | 33 | 0 | 0 | 54 |
| soldier | 101 | 101 | 0 | -1 | -3 / 2 | 9 | 5 | 0 | 0 |
| heavy | 40 | 40 | 0 | 0 | -2 / 5 | 1 | 11 | 0 | 0 |
| goat | 32 | 32 | 0 | -1 | -3 / 3 | 8 | 1 | 0 | 0 |
| hearthgob | 10 | 10 | 0 | 2 | -1 / 4 | 0 | 5 | 0 | 0 |
| archer | 27 | 27 | 0 | 0 | -2 / 3 | 0 | 3 | 0 | 0 |
| javelin | 1 | 1 | 0 | 2 | 2 / 2 | 0 | 1 | 0 | 0 |

### longwater (pyro; reached column 411 of 482)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| scout | 113 | 113 | 0 | -1 | -2 / 5 | 31 | 7 | 0 | 0 |
| hero:pyro | 90 | 46 | 1 | 2 | 1 / 3 | 0 | 25 | 0 | 40 |
| tideguard | 60 | 48 | 0 | -1 | -3 / 3 | 8 | 2 | 3 | 1 |
| crab | 16 | 16 | 0 | -1 | -9 / 1 | 6 | 0 | 0 | 0 |
| siren | 4 | 4 | 2 | 0 | -2 / 3 | 1 | 1 | 0 | 0 |

### reef (paladin; reached column 363 of 460)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| petrel | 46 | 46 | 25 | 0 | -9 / 9 | 10 | 12 | 0 | 0 |
| sailor | 113 | 111 | 1 | -1 | -2 / 5 | 6 | 13 | 1 | 0 |
| scout | 84 | 84 | 0 | -1 | -2 / 4 | 8 | 7 | 0 | 0 |
| tideguard | 25 | 23 | 0 | -1 | -9 / 0 | 4 | 0 | 0 | 0 |
| hero:paladin | 91 | 46 | 2 | -1 | -9 / -1 | 3 | 0 | 0 | 42 |
| netter | 48 | 48 | 0 | 0 | -2 / 5 | 0 | 2 | 0 | 0 |
| siren | 2 | 2 | 0 | 4 | 1 / 4 | 0 | 1 | 0 | 0 |

### flotilla (pirate; reached column 325 of 400)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pirate | 151 | 113 | 5 | -2 | -6 / 2 | 66 | 2 | 0 | 25 |
| boarder | 63 | 63 | 0 | -1 | -4 / 5 | 14 | 5 | 0 | 0 |
| lookout | 40 | 40 | 0 | -1 | -2 / 4 | 12 | 6 | 0 | 0 |
| quarter | 17 | 17 | 0 | -9 | -9 / -4 | 17 | 0 | 0 | 0 |
| marine | 57 | 57 | 57 | -1 | -2 / 4 | 8 | 3 | 0 | 0 |
| sailor | 15 | 15 | 0 | 0 | -9 / 5 | 1 | 3 | 0 | 0 |
| cutlass | 5 | 5 | 0 | -5 | -7 / 1 | 4 | 0 | 0 | 0 |
| bosun | 2 | 2 | 0 | -5 | -7 / -5 | 2 | 0 | 0 | 0 |
| netter | 1 | 1 | 0 | -2 | -2 / -2 | 0 | 0 | 0 | 0 |
| crab | 1 | 1 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 0 |

### hurricane (reaper; reached column 427 of 760)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:reaper | 180 | 157 | 0 | -5 | -7 / 0 | 142 | 0 | 0 | 20 |
| cutlass | 114 | 104 | 0 | 2 | -3 / 8 | 8 | 62 | 0 | 7 |
| marine | 20 | 20 | 11 | -3 | -4 / 2 | 16 | 1 | 8 | 0 |
| scout | 14 | 12 | 0 | 3 | -2 / 6 | 2 | 9 | 0 | 1 |
| boarder | 16 | 16 | 0 | -1 | -9 / 1 | 7 | 0 | 0 | 0 |
| tideguard | 8 | 8 | 0 | 7 | -1 / 9 | 0 | 6 | 0 | 0 |
| petrel | 5 | 5 | 5 | -1 | -4 / -1 | 1 | 0 | 0 | 0 |
| stormshaman | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| bosun | 39 | 39 | 0 | 0 | -9 / 0 | 1 | 0 | 0 | 0 |
| lookout | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| sailor | 23 | 23 | 0 | 0 | -1 / 1 | 0 | 0 | 0 | 0 |

### lamplit (knight; reached column 548 of 700)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:knight | 128 | 103 | 0 | -2 | -9 / -1 | 68 | 0 | 0 | 17 |
| watch | 141 | 141 | 0 | -1 | -5 / 4 | 47 | 15 | 0 | 0 |
| tideguard | 40 | 40 | 0 | -2 | -3 / 4 | 17 | 2 | 0 | 0 |
| wight | 27 | 27 | 0 | -1 | -5 / 3 | 12 | 3 | 0 | 0 |
| scout | 15 | 15 | 0 | -2 | -3 / 0 | 8 | 0 | 0 | 0 |
| sailor | 2 | 2 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |

### underleaf (pyro; reached column 404 of 520)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pyro | 150 | 112 | 0 | 2 | -1 / 4 | 0 | 107 | 0 | 36 |
| assassin | 34 | 34 | 0 | 2 | -1 / 5 | 0 | 23 | 0 | 0 |
| berserker | 68 | 65 | 0 | -1 | -3 / 2 | 9 | 1 | 0 | 0 |
| spider | 8 | 8 | 8 | -9 | -9 / -9 | 8 | 0 | 0 | 0 |
| thief | 13 | 13 | 0 | 0 | -1 / 5 | 0 | 3 | 0 | 0 |
| brute | 30 | 26 | 0 | -1 | -2 / 0 | 2 | 0 | 0 | 0 |
| shield | 13 | 7 | 0 | -1 | -2 / 2 | 0 | 1 | 0 | 0 |
| archer | 23 | 11 | 0 | 0 | -1 / 0 | 0 | 0 | 0 | 0 |
| sprig | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| pike | 2 | 2 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| sapper | 18 | 7 | 0 | 0 | 0 / 1 | 0 | 0 | 0 | 0 |

### deep (paladin; reached column 103 of 304)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| scout | 111 | 111 | 0 | -1 | -2 / 5 | 2 | 14 | 0 | 0 |
| crab | 96 | 96 | 0 | 0 | -2 / 5 | 1 | 10 | 0 | 0 |
| lookout | 44 | 44 | 0 | -1 | -2 / 4 | 1 | 7 | 0 | 0 |
| sailor | 74 | 74 | 0 | 0 | -2 / 5 | 0 | 5 | 0 | 0 |
| netter | 40 | 40 | 0 | 0 | -2 / 5 | 1 | 2 | 0 | 0 |
| cutlass | 26 | 26 | 0 | -1 | -2 / 5 | 0 | 3 | 0 | 0 |
| hero:paladin | 44 | 28 | 0 | -1 | -5 / -1 | 1 | 0 | 0 | 15 |
| petrel | 2 | 2 | 1 | 3 | 0 / 3 | 0 | 1 | 0 | 0 |

### causeway (pirate; reached column 484 of 612)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pirate | 78 | 38 | 0 | -2 | -3 / -1 | 25 | 0 | 0 | 34 |
| cutlass | 55 | 55 | 0 | -1 | -2 / 5 | 7 | 8 | 0 | 0 |
| petrel | 31 | 31 | 19 | -1 | -7 / 4 | 9 | 5 | 0 | 0 |
| crab | 58 | 58 | 0 | 0 | -3 / 2 | 10 | 2 | 0 | 0 |
| tideguard | 44 | 44 | 0 | -1 | -9 / 2 | 10 | 2 | 0 | 0 |
| watch | 5 | 5 | 0 | -1 | -8 / 4 | 1 | 1 | 0 | 0 |
| scout | 3 | 3 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| sailor | 1 | 1 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 0 |

### waymeet (reaper; reached column 209 of 776)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:reaper | 146 | 80 | 0 | -6 | -9 / -4 | 80 | 0 | 0 | 64 |
| swornsword | 211 | 209 | 0 | -1 | -6 / -1 | 64 | 0 | 0 | 2 |
| runner | 31 | 29 | 0 | -2 | -5 / 0 | 18 | 0 | 0 | 1 |

### undercrown (knight; reached column 85 of 104)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| miner | 135 | 135 | 0 | 3 | -1 / 9 | 0 | 120 | 0 | 0 |
| propman | 102 | 102 | 0 | 2 | 1 / 32 | 0 | 87 | 0 | 0 |
| hero:knight | 157 | 109 | 38 | -2 | -3 / 2 | 62 | 8 | 0 | 47 |
| rockgoblin | 96 | 96 | 0 | 1 | -2 / 6 | 4 | 25 | 6 | 0 |
| shardling | 31 | 31 | 0 | 6 | 1 / 11 | 0 | 28 | 0 | 0 |
| sprig | 32 | 28 | 0 | 3 | 1 / 8 | 0 | 27 | 0 | 2 |
| clinger | 1 | 1 | 1 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| bat | 118 | 0 | 0 | - | null / null | 0 | 0 | 0 | 6 |

### fields (pyro; reached column 558 of 712)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| hero:pyro | 136 | 82 | 0 | 2 | -1 / 3 | 0 | 79 | 0 | 38 |
| wight | 87 | 87 | 11 | -1 | -4 / 6 | 42 | 13 | 5 | 0 |
| scarecrow | 87 | 81 | 0 | -2 | -2 / 5 | 9 | 1 | 0 | 5 |
| hedgeknight | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| runner | 1 | 1 | 0 | -2 | -2 / -2 | 1 | 0 | 0 | 0 |
| crossbow | 1 | 1 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 0 |
| haunt | 101 | 0 | 0 | - | null / null | 0 | 0 | 0 | 58 |

### mage (paladin; reached column 569 of 712)

| body | samples | standing | on physics floor | median gap | min / max | SUNK | HOVER | TIP | AIR SHADOW |
|---|---|---|---|---|---|---|---|---|---|
| turret | 72 | 72 | 10 | -1 | -8 / 3 | 10 | 2 | 0 | 0 |
| hero:paladin | 116 | 91 | 0 | -1 | -1 / -1 | 0 | 0 | 0 | 25 |
| topiary | 66 | 51 | 0 | -1 | -2 / 0 | 0 | 0 | 0 | 14 |
| imp | 83 | 0 | 0 | - | null / null | 0 | 0 | 0 | 75 |
| broom | 26 | 0 | 0 | - | null / null | 0 | 0 | 0 | 19 |
| armour | 37 | 37 | 0 | -1 | -2 / 1 | 0 | 0 | 0 | 0 |

### Drawn bottom against the feet line, from the baked frames (px below the anchor; 1 is the one-pixel overlap, 0 stands exactly on it)

| body | frames | min | max |
|---|---|---|---|
| knight | idle | 3 | 3 |
| knight | run | 1 | 3 |
| knight | land | 5 | 7 |
| knight | block | 4 | 6 |
| pyro | idle | -1 | -1 |
| pyro | run | -3 | -2 |
| pyro | land | 0 | 1 |
| pyro | block | -2 | -2 |
| paladin | idle | 5 | 5 |
| paladin | run | 1 | 1 |
| paladin | land | 7 | 9 |
| paladin | block | 3 | 4 |
| pirate | idle | 1 | 1 |
| pirate | run | 1 | 3 |
| pirate | land | 2 | 4 |
| pirate | block | 1 | 1 |
| reaper | idle | 3.7 | 4.9 |
| reaper | run | 4.9 | 7.3 |
| reaper | land | 7.3 | 9.8 |
| reaper | block | 8.5 | 9.8 |
| assassin | frame 0 | -2 | -2 |
| berserker | frame 0 | 2.5 | 2.5 |
| captain | frame 0 | 3.9 | 3.9 |
| clinger | frame 0 | 2 | 2 |
| forgemaster | frame 0 | 2 | 2 |
| frog | frame 0 | 2 | 2 |
| goat | frame 0 | 2 | 2 |
| golem | frame 0 | 2 | 2 |
| grandmother | frame 0 | 2 | 2 |
| greathound | frame 0 | 2 | 2 |
| grub | frame 0 | 2 | 2 |
| lance | frame 0 | 2.3 | 2.3 |
| lurker | frame 0 | 2 | 2 |
| queen | frame 0 | 2 | 2 |
| rockgoblin | frame 0 | 2 | 2 |
| runner | frame 0 | 2 | 2 |
| shaman | frame 0 | 2 | 2 |
| shardling | frame 0 | -2 | -2 |
| spider:big | frame 0 | 2.1 | 2.1 |
| stormshaman | frame 0 | 2 | 2 |
| swornsword | frame 0 | 2 | 2 |
| wight | frame 0 | 2 | 2 |
| windcaller | frame 0 | 2 | 2 |

## 2. Animation coverage: state x creature

Read by forcing each state in the page and hashing the pixels of the frame drawn. OWN = at least one frame no other listed state uses; SHARED-x = every frame drawn is one state x also draws; NONE = no frame of its own (or never seen). Pose transforms applied at draw time (a tilt, a squash) are not in the hash, so a tilted idle frame counts as SHARED. Cells counted: OWN 426, SHARED 154, NONE 365.

| creature | idle | walk | turn | windup (per tell) | attack | hurt | stagger | death |
|---|---|---|---|---|---|---|---|---|
| angler | NONE | OWN | NONE (flips) | biteTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| archer | NONE | NONE | NONE (never turned) | NONE | NONE | OWN | OWN | OWN (leaves a body) |
| archmage | OWN | NONE | NONE (flips) | boltTell:OWN blinkTell:SHARED-idle wardTell:OWN rendTell:NONE swipeTell:NONE slamTell:NONE spitTell:NONE openTell:NONE | NONE | OWN | OWN | NONE (never killed) |
| armour | NONE | OWN | NONE (flips) | swingTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| assassin | OWN | NONE | NONE (flips) | markTell:OWN stabTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| bat | OWN | OWN | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-walk | NONE (vanishes) |
| berserker | NONE | OWN | NONE (flips) | windTell:OWN flailTell:OWN | OWN | OWN | SHARED-hurt | OWN (leaves a body) |
| boarder | NONE | OWN | NONE (flips) | throwTell:OWN | SHARED-walk | OWN | SHARED-walk | OWN (leaves a body) |
| bosun | OWN | OWN | NONE (flips) | swingTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| broom | NONE | OWN | NONE (flips) | dashTell:OWN | SHARED-walk | OWN | SHARED-walk | OWN (leaves a body) |
| brute | OWN | OWN | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| captain | OWN | NONE | NONE (flips) | sabreTell:OWN hookTell:NONE kegTell:NONE shootTell:NONE | OWN | SHARED-idle | SHARED-idle | OWN (leaves a body) |
| chief | NONE | OWN | NONE (flips) | NONE | NONE | SHARED-walk | SHARED-walk | OWN (leaves a body) |
| clinger | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| closedhelm | NONE | OWN | NONE (flips) | cutTell:OWN thrustTell:NONE bashTell:NONE judgeTell:NONE | OWN | NONE (never hurt) | SHARED-walk | NONE (never killed) |
| crab | NONE | OWN | NONE (flips) | pinchTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| crossbow | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| crow | NONE | NONE | NONE (flips) | NONE | NONE | OWN | OWN | OWN (leaves a body) |
| cutlass | OWN | SHARED-idle | NONE (flips) | slashTell:OWN | SHARED-idle | OWN | SHARED-idle | NONE (vanishes) |
| cutter | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| drone | NONE | NONE | NONE (never turned) | NONE | NONE | NONE (never hurt) | OWN | NONE (never killed) |
| drownedking | NONE | OWN | NONE (flips) | anchorTell:OWN ramTell:OWN diveTell:OWN haulTell:OWN debtTell:NONE slamTell:NONE | OWN | OWN | OWN | OWN (leaves a body) |
| drunk | OWN | NONE | NONE (flips) | lobTell:OWN bottleTell:OWN | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| eel:big | NONE | OWN | NONE (flips) | lungeTell:OWN | OWN | OWN | SHARED-hurt | OWN (leaves a body) |
| farmhand | NONE | OWN | NONE (flips) | swingTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| forgemaster | NONE | OWN | NONE (flips) | bellowsTell:SHARED-walk slamTell:OWN tongsTell:OWN whirlTell:OWN leapTell:NONE dragTell:NONE anvilTell:NONE ladleTell:NONE breathTell:NONE sprayTell:NONE hurlTell:NONE dropTell:NONE pourTell:NONE | OWN | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| frog | OWN | OWN | NONE (flips) | tongueTell:SHARED-idle inhaleTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| goat | OWN | SHARED-idle | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| golem | NONE | OWN | NONE (flips) | stompTell:OWN shroudTell:OWN throwTell:NONE | OWN | NONE (never hurt) | SHARED-walk | NONE (never killed) |
| grandmother | NONE | OWN | NONE (flips) | feelTell:OWN sweepTell:OWN fireTell:OWN listenTell:OWN throwTell:OWN vanishTell:NONE | OWN | OWN | OWN | OWN (leaves a body) |
| greathound | OWN | SHARED-idle | NONE (flips) | lungeTell:OWN pounceTell:OWN howlTell:OWN snapTell:NONE | OWN | SHARED-idle | SHARED-idle | OWN (leaves a body) |
| grub | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| harpy | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-idle | OWN (leaves a body) |
| haunt | OWN | OWN | NONE (flips) | throwTell:OWN | SHARED-walk | OWN | SHARED-idle | OWN (leaves a body) |
| hearthgob | OWN | OWN | NONE (flips) | NONE | NONE | OWN | SHARED-walk | OWN (leaves a body) |
| heavy | OWN | OWN | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| hedgeknight | OWN | SHARED-idle | NONE (flips) | swingTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| herald | OWN | NONE | NONE (flips) | sweepTell:OWN thrustTell:OWN hurlTell:NONE callTell:NONE glideTell:NONE spearTell:NONE maelTell:NONE | OWN | SHARED-idle | SHARED-idle | OWN (leaves a body) |
| heronfoe | OWN | NONE | NONE (flips) | strikeTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| holdfast | OWN | NONE | NONE (never turned) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| homunculus | NONE | OWN | NONE (flips) | swipeTell:OWN batTell:SHARED-walk golemTell:OWN mouseTell:NONE | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| hopper | NONE | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-hurt | OWN (leaves a body) |
| horn | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| hound | NONE | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-hurt | OWN (leaves a body) |
| imp | OWN | NONE | NONE (flips) | throwTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| javelin | NONE | OWN | NONE (never turned) | NONE | NONE | SHARED-walk | SHARED-walk | OWN (leaves a body) |
| kite | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| lampreeve | NONE | OWN | NONE (flips) | sweepTell:OWN snuffTell:OWN drawTell:NONE hookTell:NONE | OWN | OWN | SHARED-hurt | OWN (leaves a body) |
| lance | NONE | OWN | NONE (flips) | bashTell:OWN sweepTell:OWN thrustTell:OWN vaultTell:NONE galeTell:NONE javTell:NONE whirlTell:NONE guardTell:NONE rushTell:NONE | OWN | NONE (never hurt) | SHARED-walk | NONE (never killed) |
| lancer | OWN | NONE | NONE (flips) | swipeTell:OWN chargeTell:OWN cutTell:NONE | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| lookout | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| lurker | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| marine | OWN | NONE | NONE (flips) | shootTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| marshlight | OWN | NONE | NONE (never turned) | flareTell:OWN | SHARED-idle | OWN | SHARED-idle | OWN (leaves a body) |
| mimic | OWN | NONE | NONE (never turned) | biteTell:NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| miner | NONE | OWN | NONE (flips) | swingTell:OWN smashTell:NONE | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| netter | NONE | OWN | NONE (flips) | castTell:OWN | NONE | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| owl | OWN | OWN | NONE (flips) | hootTell:OWN screechTell:OWN fanTell:SHARED-idle skimTell:NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| petrel | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| pike | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| ploughman | NONE | OWN | NONE (flips) | goadTell:OWN chargeTell:OWN headTell:SHARED-walk | OWN | OWN | OWN | OWN (leaves a body) |
| prince | NONE | OWN | NONE (flips) | cutTell:OWN snuffTell:NONE callTell:NONE sinkTell:NONE crownTell:NONE | OWN | OWN | OWN | OWN (leaves a body) |
| prise | NONE | OWN | NONE (flips) | reachTell:OWN | OWN | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| propman | NONE | OWN | NONE (flips) | setTell:OWN throwTell:OWN | NONE | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| pumpkin | OWN | OWN | NONE (flips) | puffTell:OWN biteTell:SHARED-walk | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| quarter | OWN | NONE | NONE (flips) | slashTell:OWN stanceTell:OWN shootTell:OWN | OWN | SHARED-idle | SHARED-idle | OWN (leaves a body) |
| queen | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| ramlord | OWN | OWN | NONE (flips) | callTell:OWN tossTell:OWN leapTell:OWN stampTell:OWN buttTell:OWN | OWN | NONE (never hurt) | SHARED-idle | NONE (never killed) |
| reefmaw | OWN | NONE | NONE (flips) | riseTell:OWN biteTell:OWN spitTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| rockgoblin | NONE | OWN | NONE (flips) | NONE | NONE | OWN | SHARED-walk | OWN (leaves a body) |
| rook | OWN | OWN | NONE (flips) | diveTell:OWN | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| runner | OWN | OWN | NONE (flips) | stabTell:OWN | OWN | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| sailer | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-hurt | OWN (leaves a body) |
| sailor | OWN | SHARED-idle | NONE (flips) | hookTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| sapper | NONE | NONE | NONE (flips) | NONE | NONE | OWN | OWN | OWN (leaves a body) |
| scarecrow | OWN | NONE | NONE (never turned) | swipeTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| scout | OWN | OWN | NONE (never turned) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| sentry | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| shaman | NONE | NONE | NONE (flips) | NONE | NONE | OWN | OWN | OWN (leaves a body) |
| shardling | NONE | OWN | NONE (flips) | NONE | NONE | OWN | SHARED-walk | OWN (leaves a body) |
| shield | OWN | SHARED-idle | NONE (flips) | shoveTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| siren | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| snuffer | OWN | NONE | NONE (flips) | swipeTell:OWN snuffTell:OWN | OWN | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| soldier | OWN | SHARED-idle | NONE (flips) | slashTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| spider | OWN | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| spider:big | OWN | NONE | NONE (flips) | dropTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| spit | NONE | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-hurt | OWN (leaves a body) |
| spitcap | OWN | NONE | NONE (flips) | NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| sporeling | NONE | NONE | NONE (never turned) | NONE | NONE | OWN | OWN | OWN (leaves a body) |
| sprig | OWN | SHARED-idle | NONE (flips) | biteTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| stormshaman | NONE | NONE | NONE (flips) | NONE | NONE | OWN | SHARED-hurt | OWN (leaves a body) |
| swornsword | OWN | OWN | NONE (flips) | cutTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| thief | NONE | OWN | NONE (flips) | NONE | NONE | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| thorn | OWN | SHARED-idle | NONE (flips) | NONE | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| tideguard | OWN | SHARED-idle | NONE (flips) | thrustTell:OWN | OWN | OWN | OWN | OWN (leaves a body) |
| tollmaster | OWN | NONE | NONE (flips) | ledgerTell:OWN darkTell:OWN floodTell:NONE rodTell:NONE tollTell:NONE | OWN | OWN | SHARED-hurt | OWN (leaves a body) |
| topiary | OWN | SHARED-idle | NONE (flips) | swipeTell:OWN | OWN | OWN | SHARED-idle | OWN (leaves a body) |
| troll | NONE | OWN | NONE (flips) | swatTell:OWN throwTell:OWN | OWN | OWN | SHARED-walk | OWN (leaves a body) |
| turret | OWN | NONE | NONE (flips) | chargeTell:OWN | NONE | OWN | SHARED-idle | OWN (leaves a body) |
| turtle | OWN | OWN | NONE (flips) | snapTell:SHARED-walk | OWN | NONE (never hurt) | SHARED-idle | NONE (never killed) |
| urchin | NONE | OWN | NONE (never turned) | NONE | NONE | SHARED-walk | SHARED-walk | OWN (leaves a body) |
| wasp | NONE | NONE | NONE (flips) | NONE | NONE | OWN | OWN | NONE (vanishes) |
| watch | NONE | OWN | NONE (flips) | thrustTell:OWN sweepTell:NONE | OWN | NONE (never hurt) | SHARED-walk | NONE (never killed) |
| weaver | OWN | NONE | NONE (flips) | spitTell:NONE dropTell:NONE reelTell:NONE | NONE | SHARED-idle | SHARED-hurt | OWN (leaves a body) |
| wight | OWN | OWN | NONE (flips) | NONE | NONE | SHARED-walk | SHARED-hurt | OWN (leaves a body) |
| windcaller | OWN | NONE | NONE (flips) | stoneTell:SHARED-idle howlTell:NONE wallTell:NONE | SHARED-idle | OWN | SHARED-idle | OWN (leaves a body) |

### Heroes

**knight** (baked keys: idle 8, run 6, jump 2, fall 2, land 2, apex 1, skid 1, climb 2, atk 5, plunge 1, brace 1, rush 2, bash 1, recover 1, hurt 2, crouch 1, block 2, heavy 3, roll 4, atkB 5, atkC 5, air 5, fidget 22)

| state | key:frame drawn | coverage |
|---|---|---|
| idle | idle:0 idle:1 idle:2 idle:3 | OWN |
| run | run:0 run:1 run:3 run:5 | OWN |
| skid | skid:0 | OWN |
| jump | jump:0 jump:1 | OWN |
| apex | apex:1 | OWN |
| fall | fall:0 fall:1 | OWN |
| land | land:0 land:1 | OWN |
| crouch | crouch:0 | OWN |
| dodge | roll:0 roll:2 | OWN |
| dash | run:0 | SHARED-run |
| block | block:0 block:1 | OWN |
| parry | block:0 | SHARED-block |
| climb | climb:0 climb:1 | OWN |
| swim | idle:0 run:3 | OWN |
| light 1 | atk:0 atk:1 atk:2 atk:3 atk:4 | OWN |
| light 2 | atkB:0 atkB:1 atkB:2 atkB:3 atkB:4 | OWN |
| light 3 | atkC:0 atkC:1 atkC:2 atkC:3 atkC:4 | OWN |
| air swing | air:0 air:1 air:2 air:3 air:4 | OWN |
| heavy | heavy:0 heavy:1 atk:3 | OWN |
| brace | brace:0 | SHARED-heavy |
| shield rush | rush:1 | OWN |
| rising cut | air:1 air:2 atk:1 | OWN |
| low sweep | atk:0 atk:1 atk:2 | SHARED-light 1 |
| dash attack | atk:0 atk:2 atk:3 | SHARED-light 1 |
| plunge | plunge:0 | OWN |
| hurt | hurt:0 hurt:1 | OWN |
| cast | idle:0 | SHARED-idle |
| blast | idle:0 | SHARED-idle |

Pixel-identical frames under different keys: idle:0 = atk:4 = atkB:4 = atkC:4; idle:5 = fidget:18 = fidget:19; idle:7 = fidget:20 = fidget:21; jump:1 = air:4; brace:0 = heavy:0; bash:0 = heavy:1; recover:0 = heavy:2

**pyro** (baked keys: idle 8, run 6, jump 2, fall 2, land 2, apex 1, skid 1, climb 2, atk 5, heavy 3, plunge 1, hurt 2, crouch 1, block 2, cast 2, blast 2, roll 4, atkB 5, air 5, fidget 19, atkC 5)

| state | key:frame drawn | coverage |
|---|---|---|
| idle | idle:0 idle:1 idle:2 idle:3 | OWN |
| run | run:0 run:1 run:3 run:5 | OWN |
| skid | skid:0 | OWN |
| jump | jump:0 jump:1 | OWN |
| apex | apex:1 | OWN |
| fall | fall:0 fall:1 | OWN |
| land | land:0 land:1 | OWN |
| crouch | crouch:0 | OWN |
| dodge | roll:0 roll:2 | OWN |
| dash | run:0 | SHARED-run |
| block | block:0 block:1 | OWN |
| parry | block:0 | SHARED-block |
| climb | climb:0 climb:1 | OWN |
| swim | idle:0 run:3 | OWN |
| light 1 | atk:0 atk:1 atk:2 atk:3 atk:4 | OWN |
| light 2 | atkB:0 atkB:1 atkB:2 atkB:3 atkB:4 | OWN |
| light 3 | atkC:0 atkC:1 atkC:2 atkC:3 atkC:4 | OWN |
| air swing | air:0 air:1 air:2 air:3 air:4 | OWN |
| heavy | heavy:0 heavy:1 atk:3 | OWN |
| brace | heavy:0 | SHARED-heavy |
| shield rush | run:0 | SHARED-run |
| rising cut | air:1 air:2 atk:1 | OWN |
| low sweep | atk:0 atk:1 atk:2 | SHARED-light 1 |
| dash attack | atk:0 atk:2 atk:3 | SHARED-light 1 |
| plunge | plunge:0 | OWN |
| hurt | hurt:0 hurt:1 | OWN |
| cast | cast:0 cast:1 | OWN |
| blast | blast:0 blast:1 | OWN |

Pixel-identical frames under different keys: idle:0 = fidget:17 = fidget:18; jump:1 = air:4; atk:4 = atkB:4 = atkC:4

**paladin** (baked keys: idle 8, run 6, jump 2, fall 2, land 2, apex 1, skid 1, heavy 3, climb 2, atk 5, plunge 1, hurt 2, crouch 1, block 2, cast 2, blast 2, roll 4, atkB 5, atkC 5, air 5, fidget 23)

| state | key:frame drawn | coverage |
|---|---|---|
| idle | idle:0 idle:1 idle:2 idle:3 | OWN |
| run | run:0 run:1 run:3 run:5 | OWN |
| skid | skid:0 | OWN |
| jump | jump:0 jump:1 | OWN |
| apex | apex:1 | OWN |
| fall | fall:0 fall:1 | OWN |
| land | land:0 land:1 | OWN |
| crouch | crouch:0 | OWN |
| dodge | roll:0 roll:2 | OWN |
| dash | run:0 | SHARED-run |
| block | block:0 block:1 | OWN |
| parry | block:0 | SHARED-block |
| climb | climb:0 climb:1 | OWN |
| swim | idle:0 run:3 | OWN |
| light 1 | atk:0 atk:1 atk:2 atk:3 atk:4 | OWN |
| light 2 | atkB:0 atkB:1 atkB:2 atkB:3 atkB:4 | OWN |
| light 3 | atkC:0 atkC:1 atkC:2 atkC:3 atkC:4 | OWN |
| air swing | air:0 air:1 air:2 air:3 air:4 | OWN |
| heavy | heavy:0 heavy:1 atk:3 | OWN |
| brace | heavy:0 | SHARED-heavy |
| shield rush | run:0 | SHARED-run |
| rising cut | air:1 air:2 atk:1 | OWN |
| low sweep | atk:0 atk:1 atk:2 | SHARED-light 1 |
| dash attack | atk:0 atk:2 atk:3 | SHARED-light 1 |
| plunge | plunge:0 | OWN |
| hurt | hurt:0 hurt:1 | OWN |
| cast | cast:0 cast:1 | OWN |
| blast | blast:0 blast:1 | OWN |

Pixel-identical frames under different keys: idle:5 = fidget:20 = fidget:21; idle:7 = fidget:22; jump:1 = air:4; atk:3 = blast:1; atk:4 = atkB:4 = atkC:4

**pirate** (baked keys: idle 8, run 6, jump 2, fall 2, land 2, apex 1, skid 1, heavy 3, climb 2, atk 5, plunge 1, hurt 2, crouch 1, block 2, cast 2, blast 2, roll 4, atkB 5, atkC 5, air 5, fidget 25)

| state | key:frame drawn | coverage |
|---|---|---|
| idle | idle:0 idle:1 idle:2 idle:3 | OWN |
| run | run:0 run:1 run:3 run:5 | OWN |
| skid | skid:0 | OWN |
| jump | jump:0 jump:1 | OWN |
| apex | apex:1 | OWN |
| fall | fall:0 fall:1 | OWN |
| land | land:0 land:1 | OWN |
| crouch | crouch:0 | OWN |
| dodge | roll:0 roll:2 | OWN |
| dash | run:0 | SHARED-run |
| block | block:0 block:1 | OWN |
| parry | block:0 | SHARED-block |
| climb | climb:0 climb:1 | OWN |
| swim | idle:0 run:3 | OWN |
| light 1 | atk:0 atk:1 atk:2 atk:3 atk:4 | OWN |
| light 2 | atkB:0 atkB:1 atkB:2 atkB:3 atkB:4 | OWN |
| light 3 | atkC:0 atkC:1 atkC:2 atkC:3 atkC:4 | OWN |
| air swing | air:0 air:1 air:2 air:3 air:4 | OWN |
| heavy | heavy:0 heavy:1 atk:3 | OWN |
| brace | heavy:0 | SHARED-heavy |
| shield rush | run:0 | SHARED-run |
| rising cut | air:1 air:2 atk:1 | OWN |
| low sweep | atk:0 atk:1 atk:2 | SHARED-light 1 |
| dash attack | atk:0 atk:2 atk:3 | SHARED-light 1 |
| plunge | plunge:0 | OWN |
| hurt | hurt:0 hurt:1 | OWN |
| cast | cast:0 cast:1 | OWN |
| blast | blast:0 blast:1 | OWN |

Pixel-identical frames under different keys: idle:7 = fidget:24; jump:1 = air:4; atk:4 = atkB:4 = atkC:4

**reaper** (baked keys: idle 8, run 6, jump 2, fall 2, land 2, apex 1, skid 1, heavy 3, climb 2, atk 5, plunge 1, hurt 2, crouch 1, block 2, cast 2, blast 2, roll 4, atkB 5, atkC 5, air 5, fidget 25)

| state | key:frame drawn | coverage |
|---|---|---|
| idle | idle:0 idle:1 idle:2 idle:3 | OWN |
| run | run:0 run:1 run:3 run:5 | OWN |
| skid | skid:0 | OWN |
| jump | jump:0 jump:1 | OWN |
| apex | apex:1 | OWN |
| fall | fall:0 fall:1 | OWN |
| land | land:0 land:1 | OWN |
| crouch | crouch:0 | OWN |
| dodge | roll:0 roll:2 | OWN |
| dash | run:0 | SHARED-run |
| block | block:0 block:1 | OWN |
| parry | block:0 | SHARED-block |
| climb | climb:0 climb:1 | OWN |
| swim | idle:0 run:3 | OWN |
| light 1 | atk:0 atk:1 atk:2 atk:3 atk:4 | OWN |
| light 2 | atkB:0 atkB:1 atkB:2 atkB:3 atkB:4 | OWN |
| light 3 | atkC:0 atkC:1 atkC:2 atkC:3 atkC:4 | OWN |
| air swing | air:0 air:1 air:2 air:3 air:4 | OWN |
| heavy | heavy:0 heavy:1 heavy:2 | OWN |
| brace | heavy:0 | SHARED-heavy |
| shield rush | run:0 | SHARED-run |
| rising cut | air:1 air:2 atk:1 | OWN |
| low sweep | atk:0 atk:1 atk:2 | SHARED-light 1 |
| dash attack | atk:0 atk:2 atk:3 | SHARED-light 1 |
| plunge | plunge:0 | OWN |
| hurt | hurt:0 hurt:1 | OWN |
| cast | cast:0 cast:1 | OWN |
| blast | blast:0 blast:1 | OWN |

Pixel-identical frames under different keys: idle:7 = fidget:24; jump:1 = air:4; atk:4 = atkB:4 = atkC:4

- spore: spider and spider:big are drawn with the very same standing frame (one sprite set under two names).
- hanging: spider and spider:big are drawn with the very same standing frame (one sprite set under two names).
- spire: kite and sprig are drawn with the very same standing frame (one sprite set under two names).
## 3. Silhouette and sprite readability

Contrast is WCAG contrast of every outline pixel against the ground pixel just outside it, read off the real canvas where the creature stands in its first level (one place per creature: the cheap version of the brief's three places per level). Asymmetry = share of the standing frame's opaque pixels that change under a mirror.

| creature | level | median edge contrast | outline under 1.5:1 | mirror asymmetry | drawn body px | collision box | drawn / box (w / h) |
|---|---|---|---|---|---|---|---|
| angler | longwater | 2.58 | 17% | 0.272 | 35x23 | 20x14 | 1.8 / 1.6 |
| archer | marsh | 2.19 | 34% | 0.217 | 13x14 | 8x10 | 1.6 / 1.4 |
| archmage | mage | 1.34 | 56% | 0.206 | 25x50 | 16x34 | 1.6 / 1.5 |
| armour | mage | 1.67 | 43% | 0.15 | 28x39 | 12x26 | 2.3 / 1.5 |
| assassin | underleaf | 1.15 | 69% | 0 | 12x13 | 9x15 | 1.3 / 0.9 |
| bat | spire | 1.12 | 68% | 0 | 10x10 | 10x6 | 1 / 1.7 |
| berserker | underleaf | 1.24 | 82% | 0.067 | 23.8x17.5 | 14x20 | 1.7 / 0.9 |
| boarder | flotilla | 2.39 | 24% | 0.117 | 19x26 | 12x20 | 1.6 / 1.3 |
| bosun | flotilla | 1.64 | 44% | 0.156 | 18x24 | 12x20 | 1.5 / 1.2 |
| broom | mage | 1.29 | 72% | 0.312 | 25x14 | 12x10 | 2.1 / 1.4 |
| brute | stockade | 1.13 | 67% | 0.076 | 20x18 | 12x16 | 1.7 / 1.1 |
| captain | hurricane | 1.42 | 56% | 0.088 | 33.8x42.9 | 18x28 | 1.9 / 1.5 |
| chief | stockade | 1.49 | 52% | 0.196 | 43x50 | 22x34 | 2 / 1.5 |
| clinger | undercrown | 2.25 | 18% | 0 | 10x12 | 10x11 | 1 / 1.1 |
| closedhelm | waymeet | 1.68 | 36% | 0.138 | 36x66 | 24x50 | 1.5 / 1.3 |
| crab | longwater | 1.94 | 35% | 0.149 | 25x14 | 14x9 | 1.8 / 1.6 |
| crossbow | waymeet | 2.12 | 21% | 0.179 | 14x14 | 10x12 | 1.4 / 1.2 |
| crow | wood | 1.41 | 53% | 0.114 | 15x9 | 9x5 | 1.7 / 1.8 |
| cutlass | flotilla | 1.83 | 31% | 0.292 | 18x23 | 10x18 | 1.8 / 1.3 |
| cutter | hanging | 1.42 | 53% | 0.106 | 11x12 | 10x13 | 1.1 / 0.9 |
| drone | spore | 2.09 | 13% | 0.055 | 12x10 | 9x7 | 1.3 / 1.4 |
| drownedking | deep | 1.32 | 88% | 0.132 | 32x32 | 30x32 | 1.1 / 1 |
| drunk | waymeet | 2.04 | 40% | 0.244 | 20x35 | 10x20 | 2 / 1.8 |
| eel:big | longwater | 2.03 | 23% | 0.231 | 51x15.3 | 34x12 | 1.5 / 1.3 |
| farmhand | fields | 1.66 | 28% | 0.357 | 23x28 | 12x22 | 1.9 / 1.3 |
| forgemaster | crown | 1.5 | 48% | 0.351 | 42x34 | 40x32 | 1.1 / 1.1 |
| frog | marsh | 2.55 | 18% | 0.225 | 52x40 | 40x30 | 1.3 / 1.3 |
| goat | scree | 2.28 | 8% | 0.235 | 17x14 | 14x11 | 1.2 / 1.3 |
| golem | spire | 10.28 | 21% | 0.139 | 39x38 | 30x34 | 1.3 / 1.1 |
| grandmother | underleaf | 1.3 | 82% | 0.108 | 40x43 | 20x40 | 2 / 1.1 |
| greathound | kings | 1.32 | 59% | 0.23 | 46x24 | 32x17 | 1.4 / 1.4 |
| grub | spire | 2.05 | 34% | 0.06 | 18x8 | 14x7 | 1.3 / 1.1 |
| harpy | scree | 1.42 | 69% | 0 | 20x15 | 12x7 | 1.7 / 2.1 |
| haunt | fields | 1.36 | 64% | 0.021 | 13x26 | 8x20 | 1.6 / 1.3 |
| hearthgob | storm | 1.4 | 62% | 0.092 | 12x15 | 10x13 | 1.2 / 1.2 |
| heavy | kings | 3.06 | 5% | 0.437 | 36x26 | 16x22 | 2.3 / 1.2 |
| hedgeknight | waymeet | 6.85 | 0% | 0.01 | 14x19 | 12x16 | 1.2 / 1.2 |
| herald | longwater | 3.96 | 13% | 0.273 | 33x47 | 18x36 | 1.8 / 1.3 |
| heronfoe | marsh | 2.25 | 16% | 0.313 | 25x27 | 10x20 | 2.5 / 1.4 |
| holdfast | deep | 1.49 | 51% | 0 | 12x14 | 12x14 | 1 / 1 |
| homunculus | mage | 1.33 | 71% | 0.029 | 21.3x41.3 | 14x22 | 1.5 / 1.9 |
| hopper | wood | 2.24 | 24% | 0.075 | 14x10 | 8x6 | 1.8 / 1.7 |
| horn | moor | 2.97 | 21% | 0.157 | 11x15 | 8x10 | 1.4 / 1.5 |
| hound | stockade | 1.34 | 69% | 0.357 | 20x12 | 12x7 | 1.7 / 1.7 |
| imp | mage | 1.64 | 48% | 0.158 | 22x23 | 10x12 | 2.2 / 1.9 |
| javelin | kings | 1.5 | 51% | 0.404 | 16x20 | 8x12 | 2 / 1.7 |
| kite | spire | 1.86 | 32% | 0 | 16x12 | 10x12 | 1.6 / 1 |
| lampreeve | lamplit | 6.08 | 6% | 0.621 | 31.4x44.8 | 12x28 | 2.6 / 1.6 |
| lance | storm | 1.68 | 29% | 0.201 | 29.9x43.7 | 26x30 | 1.2 / 1.5 |
| lancer | waymeet | 1.41 | 52% | 0.505 | 70x83.8 | 22x30 | 3.2 / 2.8 |
| lookout | reef | 1.3 | 58% | 0.196 | 16x21 | 8x16 | 2 / 1.3 |
| lurker | wood | 4.61 | 5% | 0.114 | 13x15 | 12x12 | 1.1 / 1.3 |
| marine | flotilla | 4.98 | 14% | 0.223 | 18x19 | 10x18 | 1.8 / 1.1 |
| marshlight | fields | 1.39 | 69% | 0.351 | 12x16 | 10x10 | 1.2 / 1.6 |
| mimic | mage | 1.51 | 48% | 0.004 | 18x14 | 16x12 | 1.1 / 1.2 |
| miner | spire | 2.57 | 20% | 0.323 | 12x16 | 10x11 | 1.2 / 1.5 |
| netter | longwater | 2.13 | 14% | 0.238 | 18x23 | 10x18 | 1.8 / 1.3 |
| owl | hanging | 3.19 | 12% | 0.006 | 26x32 | 44x26 | 0.6 / 1.2 |
| petrel | reef | 2.01 | 22% | 0.191 | 21x13 | 10x8 | 2.1 / 1.6 |
| pike | stockade | 1.5 | 51% | 0.515 | 23x12 | 10x12 | 2.3 / 1 |
| ploughman | fields | 2.3 | 32% | 0.641 | 67x47 | 20x34 | 3.4 / 1.4 |
| prince | undercrown | 4.67 | 0% | 0.182 | 34x74 | 22x60 | 1.5 / 1.2 |
| prise | deep | 1.39 | 68% | 0.242 | 16x10 | 14x10 | 1.1 / 1 |
| propman | undercrown | 1.42 | 73% | 0.164 | 17.5x16.3 | 12x13 | 1.5 / 1.3 |
| pumpkin | fields | 2.25 | 15% | 0.229 | 21x16 | 14x12 | 1.5 / 1.3 |
| quarter | flotilla | 7.36 | 9% | 0.205 | 26.3x37.5 | 12x22 | 2.2 / 1.7 |
| queen | wood | 1.3 | 73% | 0.395 | 54x37 | 40x20 | 1.4 / 1.9 |
| ramlord | scree | 1.85 | 43% | 0.389 | 71x44 | 48x32 | 1.5 / 1.4 |
| reefmaw | reef | 1.71 | 42% | 0.397 | 44x19 | 30x12 | 1.5 / 1.6 |
| rockgoblin | scree | 2.04 | 22% | 0.121 | 12x16 | 10x11 | 1.2 / 1.5 |
| rook | fields | 2.14 | 27% | 0.5 | 21x13 | 9x6 | 2.3 / 2.2 |
| runner | waymeet | 1.82 | 5% | 0.089 | 10x15 | 8x12 | 1.3 / 1.3 |
| sailer | moor | 1.53 | 50% | 0.149 | 13x13 | 12x14 | 1.1 / 0.9 |
| sailor | reef | 2.3 | 10% | 0.256 | 20x25 | 10x18 | 2 / 1.4 |
| sapper | stockade | 1.14 | 63% | 0 | 10x14 | 8x12 | 1.3 / 1.2 |
| scarecrow | fields | 1.73 | 11% | 0.338 | 29x29 | 12x22 | 2.4 / 1.3 |
| scout | longwater | 3.53 | 15% | 0.182 | 14x22 | 8x16 | 1.8 / 1.4 |
| sentry | spire | 2.1 | 29% | 0.23 | 12x16 | 8x11 | 1.5 / 1.5 |
| shaman | spore | 1.65 | 14% | 0 | 14x19 | 12x13 | 1.2 / 1.5 |
| shardling | spire | 2.04 | 11% | 0.074 | 11x10 | 9x11 | 1.2 / 0.9 |
| shield | wood | 2.56 | 26% | 0.27 | 15x16 | 10x14 | 1.5 / 1.1 |
| siren | longwater | 1.88 | 32% | 0.698 | 21x21 | 12x16 | 1.8 / 1.3 |
| snuffer | hanging | 2.16 | 32% | 0.023 | 12x14 | 10x14 | 1.2 / 1 |
| soldier | kings | 3.09 | 7% | 0.187 | 23x19 | 10x14 | 2.3 / 1.4 |
| spider | spore | 4.41 | 6% | 0 | 14x10 | 10x8 | 1.4 / 1.3 |
| spider:big | spore | 1.47 | 51% | 0 | 29.4x21 | 20x16 | 1.5 / 1.3 |
| spit | wood | 2.09 | 27% | 0 | 16x14 | 12x12 | 1.3 / 1.2 |
| spitcap | spore | 1.54 | 48% | 0 | 14x14 | 12x14 | 1.2 / 1 |
| sporeling | spore | 2.17 | 20% | 0.021 | 12x12 | 8x10 | 1.5 / 1.2 |
| sprig | wood | 2.74 | 29% | 0 | 16x12 | 8x10 | 2 / 1.2 |
| stormshaman | kings | 3.09 | 10% | 0.187 | 15x19 | 10x14 | 1.5 / 1.4 |
| swornsword | waymeet | 1.44 | 87% | 0.068 | 16x17 | 10x14 | 1.6 / 1.2 |
| thief | kings | 3.09 | 16% | 0.174 | 11x16 | 8x11 | 1.4 / 1.5 |
| thorn | wood | 1.14 | 83% | 0.113 | 18x15 | 12x11 | 1.5 / 1.4 |
| tideguard | longwater | 3.78 | 10% | 0.216 | 16x28 | 10x20 | 1.6 / 1.4 |
| tollmaster | lamplit | 4.53 | 1% | 0.109 | 43.8x35 | 20x30 | 2.2 / 1.2 |
| topiary | mage | 1.62 | 47% | 0.217 | 34x30 | 16x22 | 2.1 / 1.4 |
| troll | scree | 2.88 | 25% | 0.178 | 26x25 | 18x21 | 1.4 / 1.2 |
| turret | mage | 2.64 | 27% | 0.029 | 16x21 | 12x14 | 1.3 / 1.5 |
| turtle | marsh | 3.45 | 20% | 0.098 | 27x13 | 16x10 | 1.7 / 1.3 |
| urchin | longwater | 1.21 | 72% | 0.066 | 19x21 | 12x12 | 1.6 / 1.8 |
| wasp | wood | 1.81 | 32% | 0.098 | 12x9 | 8x6 | 1.5 / 1.5 |
| watch | lamplit | 3.34 | 8% | 0.286 | 16x31 | 12x22 | 1.3 / 1.4 |
| weaver | spore | 1.69 | 37% | 0 | 14x10 | 10x8 | 1.4 / 1.3 |
| wight | lamplit | 2.41 | 23% | 0.148 | 11x16 | 8x13 | 1.4 / 1.2 |
| windcaller | moor | 2.44 | 25% | 0.326 | 38x44 | 16x32 | 2.4 / 1.4 |

### Confusable pairs (same level)

| level | a | b | silhouette correlation | size ratio | colour distance |
|---|---|---|---|---|---|
| spire | miner | sentry | 0.812 | 1 | 24 |
| storm | miner | sentry | 0.812 | 1 | 24 |
| flotilla | cutlass | netter | 0.818 | 1 | 28 |
| hurricane | cutlass | netter | 0.818 | 1 | 28 |
| deep | cutlass | netter | 0.818 | 1 | 28 |
| causeway | cutlass | netter | 0.818 | 1 | 28 |
| undercrown | miner | sentry | 0.812 | 1 | 24 |
