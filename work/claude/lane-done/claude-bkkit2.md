# claude/bkkit2 - THE BLOOD KNIGHT, KIT 2: the Red Host as blood magic + BLOOD SPIKE on any blow (opus, 10-21)

Base: origin/claude/batch111 793fd0ce (bkfeel + bkpolish = the current Blood Knight). Brief: scratch/brief-bkkit2-1021.md. PORT 8789. No merge, no deploy.

## 1. THE RED HOST - HIS BLOOD MAGIC (no summoning left in the hero)
One rule, one module (src/blood-kit.js `BLOOD.host`, `payBlood`, `drainGive`; main.js hooks tagged `claude/bkkit2`):
**the Red Host's spells are PAID IN BLOOD** - a slice of max health goes on the bar as BLOOD DEBT (BLOOD PRICE's rule, never his last
point, shown-not-taken in a trial) - **and what they land WINS IT BACK**. No stamina cost (DRAIN excepted). A first-cast hint says so
(twice a save): "THE RED HOST IS PAID IN BLOOD: IT GOES ON THE BAR AS DEBT. LAND IT TO WIN IT BACK."

| new skill (save id) | input | cost | effect |
|---|---|---|---|
| **BLOODWORMS** (`summonSkeleton`, was SUMMON THRALL; L1 root) | its slot (F/G) | 6% max hp as debt; 12 s wait (8 s with QUICKENED BLOOD) | 2 worms (3 with THE BROOD) burst out of the ground beside him, crawl to a foe (whatever he struck last if within 260 px, else the nearest within 220), leap/latch and bite 3 times (+1 a THICK BLOOD point), 0.45 s apart: each bite = 0.25x sword (min 2, +2/THICK BLOOD point), bleeds 1.2 s, and **wins that much debt back**. A worm with no foe waits 5 s and dies. Foes can't hit worms (they latch, they don't body-block). |
| **BLOOD BOLT** (`gravecall`, was THE RED CALL; L8) | its slot | 4% as debt; 3 s wait | a fast crimson bolt (340 px/s, ~220 px) thrown at the nearest foe ahead (aimed up to 60 px up/down; else level) to the first foe or wall: 0.75x sword (+2/THICK BLOOD), bleeds 2 s, marks, LAID OPEN applies; **its whole price comes back when it lands** (a miss costs the 4%). |
| **DRAIN** (`bidden`, was the passive BIDDEN; now an active, L8, 220 coins) | its slot | 18 wind; 9 s wait | a held tether to the nearest foe ahead (100 px): for 1.2 s, every 0.2 s it takes 0.22x sword and gives it to him - **into his debt first (all of it), then 40% of the rest as health**. He stands (walks at 16) while draining; a hit, a dodge, a swing, the plunge or the foe leaving 1.4x range lets go. Nothing in reach: "NOTHING TO DRAIN", nothing spent. |
| **RED GROUND** (`unholyGround`, same name; L4) | its slot | 5% as debt (was 33 wind); 11 s wait | a pool of his blood on the floor (52 px, 6 s +1/rank): foes in it **wade at half speed** (never a boss or a mini), are marked, bled 1.2 s and bitten 3 (+2/THICK BLOOD) every 0.4 s; **he holds his debt standing in it** (no drain) and every bite wins a drop back. (It no longer raises the dead.) |

Passives reworked (ids kept):
| id | name | now |
|---|---|---|
| graveGoods (growth, max 2) | BLOODED STEEL -> **THICK BLOOD** | worms bite 2 harder + 1 more bite a point; BLOOD BOLT and RED GROUND +2 a point (its old hidden +5 on THE CULL plunge is untouched) |
| gleaner | QUICKENED BLOOD | BLOODWORMS waits a third less (8 s, not 12) |
| press | THE PRESS -> **THE BROOD** | BLOODWORMS sends three |
| ossuary | SPENT BLOOD | a worm done (bitten out or out of time) takes 3 s off BLOODWORMS' wait |
| secondDeath | BURST VESSEL | a worm done bursts: cuts + bleeds what is within 34 px |
| graveProvides (cap) | THE BLOOD PROVIDES | a kill (not boss/mini) with BLOODWORMS learned sends a worm out of the body (max 6 out) |
| coldComfort (branch 0) | COLD COMFORT -> **KEEN PRICE** | while BLOOD PRICE's edge is on the blade, x1.25 more (it read the summon) |
| dueRites | DUE RITES | unchanged |
Also de-undeaded outside the tree: CRIMSON TIDE's hands are now grasping blood SPIKES (draw + desc), BLOOD CHAIN's green rune chain is crimson ("a chain of blood"), RED GROUND/chain/tide FX are crimson. Hero card, TREE_WHO ("THE RED HOST: BLOOD MAGIC, PAID IN BLOOD"), DK_KEYS F text, ability-preview shapes, passive glyphs (no skulls) updated.

**Boss blood thralls stay the boss's** (src/unburied-foes.js untouched; the boss tells SUMMON THRALL / THE RED CALL are his). The hero's thrall machinery (risen[]) is left in place but nothing of the hero's puts one up.

### SAVE-ID MAPPING (no refunds needed - every bought id still names a bought active)
| old (owned in saves) | new | note |
|---|---|---|
| summonSkeleton SUMMON THRALL | BLOODWORMS | same slot, same id - the "minion" option |
| gravecall THE RED CALL | BLOOD BOLT | same id |
| unholyGround RED GROUND | RED GROUND (pool) | same id |
| bidden BIDDEN (passive, free by level) | DRAIN (active) | a v1 save that bought BIDDEN owns DRAIN (gift); others buy it (the passive was free, so no points lost). Its effect (worms go for what you struck last) is built into BLOODWORMS. |
| passives above | reworked in place | passives come with levels - nothing to map |
Counts: actives 76 -> 77, passives 188 -> 187 (skill-icons / skill-passives asserts moved, commented).

## 2. BLOOD SPIKE
- **Any foe's blow** landing within BLOOD.spike.beat (0.22 s, unchanged) of the kneel beginning is spiked - high, middling or low, from either side (checked BEFORE the duck, so a high blow on the beat is spiked rather than ducked). Red (unblockable) blows, drains (pct) and source-less hazards are not. Off the beat only a LOW blow is turned (the plain low guard, unchanged).
- The spikes strike the attacker only within 56 px (an archer's arrow is turned and the debt comes back, but the archer is not stabbed across the room).
- The parry's weight: freeze 0.16 s, crimson held breath 0.12 s, the crimson wash (0.2 s, flashes setting), white flash, zoom, rumble, its **own SFX.bkSpike** (bind on the planted blade, stone splitting, wet tear, low thud, falling bell pair).
- **Pose**: BLOOD SPIKE is 3 beats held 0.42 s (was 2 / 0.3): short spikes, full spikes, and a new third frame - half off the knee, the blade wrenched up out of the ground, the spikes sinking back dark.
- Words: crouch hint "DOWN: A LOW GUARD. KNEEL AS ANY BLOW LANDS: BLOOD SPIKE.", trial kneel station and hero card likewise.

## 3. BOT, YARD, HINTS
- Lab: the reaper's F-summon branch is gone; src/bot-profile.js TYPICAL_SKILLS.reaper = soulReap, boneArmor, gravecall, summonSkeleton, bidden, unholyGround (best first, cut to the level's slots) with SKILL_RANGE bolt 180 / worms 150 / drain 90 / pool 36; the generic skill hands (src/lab-perceive.js) cast them in 'built' rows and never over a held DRAIN. 'practiced' rows (the standard) cast no skills, as before.
- Yard (trial_reaper): his tree step is now **THE RED HOST** (kind 'host', 3 landings of any Red Host spell; BLOODWORMS is lent on F when he has none of it; the price is shown, not taken). Words: TRIAL_NAME/TRIAL_SAY 'host'.
- MOVE_WORDS: BLOODWORMS, DRAIN, RED GROUND, NOTHING TO DRAIN float; hint-shown baseline rewritten (THE RED CALL gone, RED GROUND now drawn).
- Icons (main.js MORE_ICONS): BLOODWORMS two worms out of the ground, BLOOD BOLT a flying drop, RED GROUND a bubbling pool, DRAIN a clawed hand with blood coming to it.
- Poses (B16): BLOOD BOLT `bkBolt` (2 frames: palm along the edge, palm flung out with the bolt), DRAIN `bkDrain` (3: clawed reach, pulled back fist with beads, held with lights up), BLOODWORMS keeps `call` (blade planted, hand raised, blood coming up), RED GROUND keeps `unholy`.

## CHECKS (PORT 8789, one headless Chrome at a time, RAM-gated >= 1.5 GB)
GREEN: **blood-kit** (new: payBlood/drainGive pure; spike on a plain blow on the beat with the wash, no spike off the beat, a far attacker not struck; BLOODWORMS / BLOOD BOLT / DRAIN / RED GROUND each paid as debt, landing and winning it back, worms raise no thrall, DRAIN spends nothing with no target, pool holds the debt + slows/bleeds; the yard's RED HOST step done by lent worms with no health taken), **dk2** (timing moved past the beat, commented), skill-icons, skill-passives, talents, progression, skill-menu, reaper-input, crouch-b, crouch-hint, hero-trials, ability-poses (77/77; first run timed out under load with no output, rerun alone 160 s green), pose-frames, unburied-fights, hint-shown, comments, node --check on every touched file.
**textfit --strict hints,store,tree,pick,trial,hud,menu: 0** (1139 screens).
Not run: full suite (nightly), mash/level rows (no foe/level/boss number changed).

## RATES
boss-rates, profile human, kit flasks, campaign level, **reaper only** (he is not banded), 6 seeds a cell, jobs 1. base = origin/claude/batch111 in a temp worktree (removed).

| row (L) | practiced base | practiced lane | built base | built lane (final) | ref: built knight / warden (lane) |
|---|---|---|---|---|---|
| marsh (3) | 5/6 | 5/6 | 5/6 | 6/6 | - |
| stockade (3) | 2/6 | 2/6 | 2/6 | 6/6 | 4/6 / 6/6 |
| crown - Goblin Queen (17) | 4/6 | 4/6 | 3/6 | 6/6 | 5/6 / 1/6 |
| canal (28) | 0/6 | 0/6 | 3/6 | 2/6 | - |

- **practiced is identical** (the standard rows cast no skills; the bot does not time kneels, so BLOOD SPIKE never fires for it). k/w/p rows are untouched (no foe/boss number changed).
- **built**: at L3 the base reaper had NO skill (his typical kit was BLOOD MAIL L14 + BLOODLETTING L20), so built = bare; now he has BLOODWORMS (7-10 casts a fight) and wins all six. At L17 BLOOD BOLT + BLOODWORMS + BLOOD MAIL: 6/6 vs 3/6 (knight 5/6). First pass (bolt 0.9x / 2.2 s, worm bite 0.3x) also went 6/6 / 6/6 with ~20 bolts a fight, so I cut the bolt to 0.75x / 3 s and the bite to 0.25x and aimed the bolt (the canal's 30 level bolts a fight were missing and costing debt: 0/6 before the aim, 2/6 after). Canal is the reaper's standing hard row (practiced 0/6 both).
- Read: the Red Host makes the BUILT Blood Knight strong in acts I-II (on a par with the knight's built rows, above at the Queen). Tune numbers live in src/blood-kit.js BLOOD.host + CD_MAX (main.js) if you find him too strong (Q8).

## REDS
None open.

## ART NOTES (for the art lane)
- **BLOODWORMS**: procedural 5-segment worms (drawBkHost) - want a 3-4 frame crawl cycle (arch/stretch), a latch/bite frame (curled, mouth open, a spurt per bite) and a burst frame; the ground "burst out" is particles only - a small crater/splash sprite would sell it.
- **BLOOD BOLT**: a drawn drop + trail - want a 2-3 frame spinning clot with a wet tail and an impact splash sprite.
- **DRAIN tether**: a quadratic red line with running beads + a pulsing ring on the foe - want a sagging braided blood rope sprite, the foe's wound opening at its end, and the beads entering his fist.
- **RED GROUND pool**: flat ellipses + bubble rings - want a pool sprite set (spread-in 2 frames, idle ripple 3 frames, drying-out 2 frames) per tile width, and a wade ripple on a foe's feet.
- **Icons**: the four 10x12 pixIcons are serviceable greybox; a crimson pass (shared palette with BLOOD WELL / BLOOD LEECH icons) would tie the tree.
- **Poses**: bkBolt (2) and bkDrain (3) are first-pass rig frames; BLOODWORMS reuses `call` (its comment says blood now, but the frames still draw the red "flame" in the raised hand - a fist squeezing blood onto the ground fits better). BLOOD SPIKE's new third frame wants a polish at 1x.
- CRIMSON TIDE spikes are procedural; a 3-frame spike-rise sprite would match the BLOOD MOON geysers.
- The boss's blood thralls are untouched (still the skeleton shapes in clotted crimson).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Which old skill becomes which.** REC + BUILT: SUMMON THRALL -> BLOODWORMS (the L1 root, his "minion"), THE RED CALL -> BLOOD BOLT, RED GROUND -> RED GROUND (pool), BIDDEN (passive) -> DRAIN (active). ALT: BLOOD BOLT as the L1 root and the worms at L8.
2. **Paid in blood, no wind.** REC + BUILT: the Red Host costs 4-6% health as debt (won back on landing), not stamina; DRAIN costs 18 wind instead. ALT: a small wind cost on top.
3. **DRAIN's heal past the debt (40%).** REC + BUILT: yes, so DRAIN is useful with no debt (about 14 hp at L20 without debt). ALT: debt only (purest "no other heal" rule).
4. **BLOOD SPIKE on ANY blow, from either side.** REC + BUILT: any foe blow on the beat, both sides, high ones too (a high blow on the beat is spiked, not ducked); red blows still go through. ALT: front only.
5. **The tree's name.** Kept THE RED HOST (the worms are his host). ALT: THE RED ART / BLOOD MAGIC.
6. **KEEN PRICE (was COLD COMFORT).** REC + BUILT: x1.25 while the BLOOD PRICE edge is up. Name is mine - one-line change.
8. **Strength.** REC: ship as tuned (built reaper 6/6 at the Stockade and the Queen, knight 5/6 there); if he feels too strong, the first lever is BLOODWORMS 12 s -> 15 s.
7. **Bot.** REC + BUILT: the Red Host is in his TYPICAL_SKILLS (built rows only); the standard 'practiced' rows still cast nothing.
