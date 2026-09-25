# claude/fallingtower: THE FALLING TOWER, reworked (lane report)

Lane on this PC, 2026-09-25. Branch `claude/fallingtower` off master `4cc3bb4`. `origin/master` merged again at the end (the
Highcrown and Sporewood batch: two conflicts, `tools/check.mjs` - every name from both sides kept - and `src/ambush.js` - the crown's
room and the tower's both kept). Pushed after every green commit. Nothing touches master, nothing is deployed, and the full
`npm run check` was NOT run: only the lane subset below. Level editor and Boss Rush are parked: nothing was added to either. The PC
shut down once mid-lane; the working tree was clean afterwards and nothing was lost.

Design: `docs/briefs/falling-tower-rework.md` (written first, amended where building changed it - each amendment is marked there).

## Commits

| sha | chunk |
|---|---|
| `aa036aa` | the brief |
| `437b8cb` | 1. FAILING STONE: the mechanic, taught and used; before captures |
| `c017031` | 2. THE SEXTON (mini) and THE ORRERY PIT (ambush); the shared INDEX count |
| `00d54bf` | 3. the look: slate, leaning, holed to the sky; after captures |
| `a837318` | the F9 walk tool; the sanctum portal counted as a ride in the reach model |
| `d987434` | merge of origin/master |
| (this commit) | this report |

## 1. The mechanic: FAILING STONE (`src/tower-collapse.js`)

"THE TOWER IS FALLING: STONE THAT CRACKS COUNTS DOWN, AND THEN IT GOES." Cracks and a dust trickle show before anything is touched.
Weight starts a count drawn over the stone (3 yellow, 2 orange, 1 red) with a crack sound on every second. Then the stone goes. It
comes back 4 s later, never into anybody standing in its tiles, and at once on a respawn (B4). Under every section there is safe
footing and a way back up (C5); `tools/tower-collapse.mjs` checks both for every section.

Its uses, in route order:
1. **THE LIBRARY STACKS, taught safe.** The stair's second tier fails three rows over the floor, next to a sign.
2. **THE ORRERY CAGE, a collapse that opens the way down.** The observers' gallery is a closed room, and its failing floor is the
   only way on: it drops you into the pit, where the ambush shuts. The reach model is told about this (`opens`) and the check proves
   the collapse is load-bearing.
3. **THE ORRERY CAGE, a race up a failing stair.** Six tiers fail from the bottom up, each 1.1 s after the one below. A fall lands you
   on the pit's roof, and the stair stands again after.
4. **THE PENDULUM GALLERY, a floor you must leave in time.** The first ride's landing counts 2.5 s from the moment you land. Under it
   is the gallery floor, clear of the gears, with a new rope back up. That floor had been a pocket with no way out.
5. **THE BELL LOFT, the Sexton's deck** (below).
6. **THE OPEN CROWN, breaking up.** One ledge in four of the last climb counts 2.5 s. I added this while building and amended the brief.

The old whole-floor fall ("every floor you leave falls") stays as the tower's frame.

## 2. THE SEXTON (`src/sexton.js`, art `src/redraw/sexton.js`) and THE ORRERY PIT

**THE SEXTON** is the tower's dead bell-ringer. He is fought on a deck of failing planks over a two-row bell pit, with two stone
ringers' walks two rows up (A12). The room's roof is the bell frame, and the portcullis at col 52 lifts when he falls.

| attack | mark | what it does |
|---|---|---|
| THE SWING | `!` | the bell on its chain, in front of him: guard it |
| THE RUSH | `!` | he charges the length of the deck: guard it or jump him |
| THE TOLL | `!!` | strikes the deck and the pit, but not the walks or the air. It also starts every plank within 5 tiles counting (3 s) |
| THE BELL DROPS | `!!` | a shadow marks your spot and a bell falls from the frame onto it |

- **The opening is caused (A11).** He will not walk onto a counting plank. His rush is committed, though, so if he rushes you across one
  it breaks and he is caught in the pit, open for 3.2 s at double damage. `tools/boss-openings.mjs` proves both halves: a rush over
  whole planks opens 0 s, a rush over a counting plank opens 3.2 s.
- **Phase two (A10), at half health: "HE RINGS THE WHOLE DECK."** Every plank counts on each toll, on a 2 s count, and the bells come
  in pairs.
- **Wiring:** all four tells are in `windingUp()` and forced in `tools/sexton.mjs`. He has his own 14-frame sheet, a bestiary row,
  `BEAST_SHORT`, death and hurt voices, `MINI_DONE`, THREAT 4, and hp 520. He replaces the bell loft's elite armour.

**THE ORRERY PIT** (rule Q, one captain and one wave). You come down into it through the gallery floor, and the gates drop. The captain
is **THE HEAD NOVICE**, a new elite apprentice (rule `wall`, hp x3, room multiplier 1.4). With him come an armour, a tome and a broom.

- **Why an apprentice leads it:** `elites.mjs` rightly failed an armour captain, because the Folly next door is also led by an armour.
- **The room:** 31 tiles between the gates, and a low roof so it holds you. The door checkpoint is on the gallery above.
- **The page proof** (`tools/tower-collapse.mjs`): the room locks, both gates hold a hero running and jumping at them, and the
  captain's fall opens it.
- **Checks:** `ambush-single` and `ambush-reach` are green.
- **Time (`BK.ambushLab`, 7 heroes):** knight 22.3 s, warden 20.6, pyro 23.3, paladin 24.0, pirate 22.1, reaper 19.9, geomancer 20.4.
  All are inside Q's 15-35 s window.

The orrery's elite became the ambush captain and the loft's warden became the Sexton. ELITES keeps only the cistern's husk, so neither
named fight sits back to back with an elite.

## 3. The look (`src/redraw/fallen_tower.js`)

- **The Folly's pieces are gone:** its library backdrop, olive brick, violet ribs, windows and gloom.
- **Its own stone ('fallen'):** cold slate-blue ashlar, cracked, with dust in the joints, plus slate ledges and wooden planks.
- **Every room is its own broken wall:** coursing run out of true (the lean), leaning buttresses, and holes knocked through to the night
  sky with wind streaking across them. Dust sifts down, and chains and bell-ropes sway.
- **Each floor keeps its identity:** toppling stacks, the reading room's broken windows, the orrery's broken rings, the clock's cracked
  face, the cistern's pipes and seep, the bell frame's timbers and bells, and the crown, which is mostly sky.
- **Readable:** the back wall is two steps darker than the footing, and nothing is drawn in front of the camera indoors (`occluders`).
- **Frame cost** (probe of steps with rendering, median): 8-11 ms after, against 12-14 ms before.

## 4. INDEX, pilots and the walk

**INDEX** (`tools/curve.mjs`): the Folly is **122 -> 124** and the Falling Tower **96 -> 119**. The step goes from **-26 to -5**,
inside RAMP_DROP (-8).

This comes from what the level now contains, not padding: a new mini, the ambush crowd, and the failing stone counted as the hazard it
is. The counting moved into one function, `measureLevel()` in `src/threat.js`, which both curve.mjs and the bot now call (the bot never
counted ambush crowds). Two rule fixes apply to every level:

- An ambush captain counts as the elite it is.
- Floor that gives way counts as hazard: `L.crumbles`, and `L.deckBreaks` on the Hurricane and in the Burning Village.

Whole ramp reprinted: 7 steps out of line, down from 8. The Folly's rise over Witchlight is now +30, where it was +28.

**The Sexton pilot** (`tools/sexton-pilot.mjs`, normal health, salts 1-3, 7 heroes): **14/21 (67%), median win 41 s**, 2.9 pits a fight.

| hero | wins |
|---|---|
| pyro | 2/3 |
| paladin | 3/3 |
| pirate | 3/3 |
| reaper | 3/3 |
| geomancer | 3/3 |
| knight | **0/3** |
| warden | **0/3** |

**THE UNDEAD ARCHMAGE (NOT retuned; `LEVEL=fallingtower node tools/duneworm-pilot.mjs`, normal health, 7 heroes):**

| | salts 1-3 | salts 4-6 | together |
|---|---|---|---|
| before (pre-lane code) | 4/21 (19%), median win 89 s | 3/21 (14%) | 7/42 = 17% |
| after | 1/21 (5%), median win 64 s | 2/21 (10%) | 3/42 = 7% |

His code, arena, carpet and sanctum are untouched by this lane. The drop is inside the lab's dice noise at these counts, but it points
one way. The only thing of mine he touches is `hazardFoe`'s new pool bottom, which cannot matter in the sky. I did not chase it further.
The Dune Worm lane's 24% (5/21) was taken on older code.

**F9 walk** (`tools/fallingtower-walk.mjs`, the play bot, no god mode): 0 deaths for both heroes.

| hero | walked | reach |
|---|---|---|
| knight | 92% | 93% |
| warden | 86% | 93% |
| pre-lane code | 94% | 92% |

The findings are unchanged from before:

- **STUCK:** at tile 54, the parapet door into the sanctum. The bot cannot fly the carpet, and the old tower stopped at the same place.
- **BLANK:** one sweep frame.
- **FLOAT:** the pre-existing gears deco.

The gate reads ASSISTED, as it did before. It is behind the portal on purpose, and the reach model now counts the sanctum as a ride.

**Captures:** `docs/fallingtower/before/` (13 spots, pre-lane code) and `docs/fallingtower/after/` (15, the same spots plus the gallery
and the bell deck). Node renders are in `docs/fallingtower/art/`.

## 5. Checks

The lane subset was run after each chunk and again after the final merge: audit, traps, killzones, collectables, spawns, deadends,
floaters, checkpoints, checkpoint-gaps, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites, ambush-single,
ambush-reach, occluders, ground-depth, tower-ascent, archmage-room, mini-names, tells, boss-openings, boss-fight-end, arena-supplies,
textfit, comments, syntax, homepaths, dangling-paths, content-audit, readability, light-support, render-layers, folly-runtime, and the
new **tower-collapse** and **sexton**. `architecture` does not exist in the repo.

Re-runs:

- **dangling-paths** failed twice mid-lane on files cited before they were committed. Each time it passed alone once they were staged.
- **tower-collapse** failed once with "could not reach the browser" and passed alone straight after.

Every new assertion was seen red on sabotaged code first:

- tower-collapse: no `opens` in reachcore, no return, no reset.
- sexton: the opening removed, the drop removed from the order.
- boss-openings: the Sexton's opening removed.

Rules fixed rather than rows (each is general, each found by this level):

- **`hazardFoe`** drowned any creature anywhere BELOW a pool's columns. The cistern "drowned" the pit's captain 80 rows under it.
- **`traps.mjs`** called the floor of a deadly pool a pocket.
- **`reachcore`** did not treat the sanctum portal as a ride.
- **curve.mjs and the bot** each counted a level their own way.
- **`tools/tower-ascent.mjs`** pinned three elites. It now pins one, with the reason.

## Questions for Daniel

1. **The Sexton is 67% overall, but 0/3 for the knight and 0/3 for the warden** (they die to the swing and the toll). Recommendation:
   play him yourself before tuning. If the knight and warden struggle too, lengthen the toll's tell from 1.0 s to 1.15 s rather than
   cutting his health, since the toll is what the room is about.
2. **The Undead Archmage reads 7% on 42 fights after the lane against 17% before**, with his code untouched. Recommendation: have the
   lane that owns him re-pilot at more salts before anyone reads this as a change. Either way the finale is far below the 60-75% band,
   as the Dune Worm lane already reported.
3. **The INDEX rule change touches every level.** An ambush captain now counts x3 and falling floor counts as hazard, so the Folly reads
   124 (was 122), the Hurricane 141, the Burning Village 93 and the crown 126. Recommendation: keep it. It is the rule the table already
   applies to elites on the road, and the numbers only moved where those things exist.
4. **The HEAD NOVICE is a new elite kind** (an apprentice captain who wards his crowd). Recommendation: keep it. An armour captain
   failed the neighbouring-rooms rule against the Folly.
5. **The wind through the holes in the walls is deliberately faint.** Recommendation: look at it in play and say if it should read
   louder.
