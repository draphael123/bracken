# BRACKEN — the level design guide (from Daniel's feedback)

Written 2026-09-26 from Daniel's playtests and decisions across the 25-26 September cycle. It is the *why* behind
RULES-LEVELS-AND-BOSSES.md: the rules say what a level must pass; this says what Daniel wants a level to feel like.
Every level lane reads it before it builds, and works down `docs/NEW-LEVEL-CHECKLIST.md` (the process: concept, greybox, review, fixes, art; and every lesson as a box). When a rule here and a number elsewhere disagree, ask Daniel.

## 1. What a level is
- **One rule, carried all the way.** A level has one idea (the tide, the sun, the wind, the buckets) and it is TAUGHT safely,
  DEVELOPED under pressure, TWISTED into a new use, COMBINED with something else, and EXAMINED before the boss. Daniel's
  complaint about most levels: the idea is used once and dropped. (RULES S3, the design audit.)
- **Layout, uniqueness, escalation - not decoration.** "It doesn't seem like this pass actually changes the level content"
  - polish without new beats is not a level fix. Every section should be a place with its own problem.
- **No repeated shapes inside a level.** Three identical horn towers, two identical forks, seven walk-across tiers: make them
  three different problems.
- **Levels feel like places.** Its own backdrop per section, props that fit (no wood ledges in a desert, no grass in a stone
  tower, no castle ledges in a ruin), its own music. A castle has battlements, towers, walkways; a mine has more than one ore;
  a desert has tall ruins you climb.
- **Longer is fine when it is fuller.** Daniel asked for longer levels (the Reef, the Long Water, the Deep, the Flotilla,
  Stormhold, the Unburied Field) - always with new content, never stretched corridors. The Burial Caverns were cut because
  they were long AND repetitive.

## 2. Difficulty
- **Hard by placement, not by numbers** (RULES S): foes where they make the ground harder, jumps that can fail, an exam before
  the boss, checkpoints spaced (one per section, ~120-160 walked tiles apart and always one before every boss/mini/ambush door - RULES S4, Daniel 2026-09-28), healing earned. "Without overwhelming players with tons of enemies."
- **FEWER, BETTER FOES (Daniel, 2026-09-28/29; the sprinkle cut).** Open floor is not filled with a grid of foes ("a dozen enemies, no challenge"). A level's
  foes are DESIGNED ENCOUNTERS: a shield covering an archer, a hornblower behind a brute, a priest or banner to kill first, a lone heavy on a ledge; placed
  at a chokepoint, on a ledge, or beside spikes, water or barrels, so the ground is part of the fight. Make a foe deadly one-on-one through damage and AI,
  NEVER through more hp. The rules a level lane builds to (src/foe-tactics.js SPRINKLE and PLAN, enforced by tools/sprinkle-cap.mjs):
  - Every SECTION of a level (200 columns; 60 rows on a tall level) stands at least one designed encounter: put the squad in the level's own builder,
    or list its kinds in PLAN[levelId] and the garrison builder (src/level.js garrison()) places them on the best ground in each section: members
    two tiles apart on one floor, hero side first, tagged squad:'<name>' (never garrison:true).
  - What is still SPRINKLED (garrison rows in src/level.js, flagged garrison:true) is filler and is capped: at most 2 in any one screen (30 columns; on a
    tall level 22 rows too) and 1 a screen over the whole level. A new level's row is small; the encounters carry it.
  - No sprinkled topiary (the Folly's maze is gone). Boss arenas and ambush rooms keep their own designed spawns; the sprinkler never enters them.
  - A level placed wholly by hand has no sprinkle to cap: it is still held to the same rule by hand (an encounter in every section, none of it filler).
- **Levels were too easy next to their bosses.** Close that gap with the level, not by softening bosses.
- **Nothing annoying:** no health sponges, untold off-screen shots, stun-locks, untold knockback into pits, respawns.
- **Meters squeeze** (the desert sun drains harder the longer you stay out, with shade to earn).

## 3. Movement and terrain
- **Terrain should do things.** Slopes (you slow going up, slide down), zip lines, breakable walls with secrets, failing stone,
  bouncers, gusts, explosive barrels, chase set-pieces, pushable blocks and plates, swinging ropes. Reuse what the engine has.
- **Ice is saved for the snow levels** - they will use it as their main mechanic; don't spend it elsewhere.
- **Every hero must be able to do the level.** A mechanic that needs a shield (bracing in the wind) must work for a hero without
  one (crouch braces for everyone). Test the Pyromancer and the Freebooter, not only the Knight.
- **No softlocks, ever.** Walk it with real keys, no god mode (the Deep shipped unbeatable twice; the Kraken's arms stuck in
  platforms). A way down or across must never depend on the reach model's 6-tile jump.

## 4. Bosses
- **The opening is caused** (RULES A11), ideally by the level's own mechanic: the Goblin Queen breaks her own pillars; the
  Diving Bell vents only when a stone hits his valve; the Reefmaw beaches himself on a dodged lunge; the Gargoyle smashes through
  a slab you leave late.
- **Bosses change the fight in phase 2** (the Reefmaw comes ashore; the Bell cracks open; the Kraken inks), not just speed up.
- **Bosses fit the place and the story.** A mini-boss that makes no sense for the level goes (the Tide Reaver); a hero's class
  level ends with that hero as the boss (the Death Knight, the Paladin, the Freebooter), and beating them unlocks them to buy.
- **Scale and camera:** a big room needs the zoomed view and a big boss; zoom must frame him and you together.
- **Bosses summon what fits them** (the Gate Gargoyle calls small gargoyles, not imps).
- **Play first, then tune:** bot numbers guide; Daniel's hands decide. Ease a hard boss by his opening (longer window, faster
  stones), not by cutting what makes him interesting.

## 5. The road between levels
- **Levels flow into each other** (Sonic 3; the Falling Tower's portal into the desert): walk out of the boss room, a short strip
  where the scenery blends into the next place, the next level already running. The map stays for replays and side roads.
- **Class levels are side roads** you can walk onto from the junction, opened by a silver time on the level before.
- **Transitions tell the story:** the next place on the skyline as you leave.

## 6. Sound
- **Every level and boss has its own track**; minis share a mini theme unless they deserve their own. Downloads need Daniel's
  yes per file (CC0 only). The level's track can carry into its boss (the Unburied Field's Night on Bald Mountain).

## 7. How to work with Daniel
- **Ask design questions with a recommendation;** never decide them. Bundle them; keep them short.
- **Show, then ask:** a brief or a greybox first for new levels (stop for approval), before art and bosses.
- **Report plainly** what went live and what to try.
- **Credits are finite:** Sonnet for level/art/polish, Opus for boss and foe AI; slim testing; one level per lane; a daily cap.
