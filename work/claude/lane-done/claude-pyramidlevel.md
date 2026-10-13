# claude/pyramidlevel - THE SEALED PYRAMID, LEVEL EXTENSION (Opus, 2026-10-13) - LANE A of scratch/briefs-sealedpyramid-1013.md

Base: origin/master 7d920edb (batch90: sealedpyramid + spart + sptune). Port 8894. Daniel: "way too short".
**Art is placeholder** for every new piece (readable greybox). Art before live: lane C draws them (list below).

## What changed

The level is now 1052 columns wide (was 498). The first half is unchanged. The Scarab Mother's lair (452-491) now sits **mid-level**. Her east door opens onto **the second half**, a climb back up through the pyramid to the burial chamber.

The new half is built in `src/sealed-pyramid-tombs.js` (`buildTombHalf`). The new traps run on the old engine in `src/sealed-pyramid-hands.js`.

The rule line (PYRAMID_RULE) is unchanged and still true: every new hazard is a **trap fired from a pale plate**.

| kind | what it does |
|---|---|
| **GAS** | The embalmers' jets. A green cloud stands in the reach for 2.4-2.6 s. A hero in it loses a share of his bar and takes the caverns' venom. A foe in it is unmade. |
| **OIL** (fire) | The plate tips a brazier into a channel cut in the floor. The fire RUNS the channel at 220-260 px/s, then burns for 3 s. A mummy's linen catches. |
| **FLOOD** (water) | The plate opens a sluice. A BORE runs the floor reach first (a share and a shove; the dead drown). Then the water RISES over 3-5 s, holds for 9-12 s and drains. You swim up on it. The pool follows the trap every frame. |
| **TOMBS** | 19 lidded niches. Coming near cracks the lid (told: crack, dust, "!" / "THE LID CRACKS: THE DEAD GET UP"). The dead climb out 1.0 s later. Their ents wait, and the hands spawn them. A respawn shuts every tomb again. |

**THE TOMB GUARD** (the skeleton) is the mummy's machine in bone (`src/mummy.js` SKEL, cnSkin `tombskel`), so the level still has one new foe (A9).
- **CUT** `!` can be blocked. **LEAP-CHOP** `!!` must be stepped out of.
- It is LIGHT: it never presses a plate (mummies are heavy and do).
- Dry bone does not catch fire.
- Marks are in `src/marks.js`. It has a placeholder 8-frame sheet with its own windup and release pose per move (B16).

### The new sections

**THE HALL OF THE DEAD** (493-610)
- The first tomb is taught on the flat.
- A shelf tomb.
- THE GROOVE OF THE RISEN: three tombs in a stone's road; lure the risen under it. A mummy treading its pale stone fires it on you.
- The upper hall's pair.
- **EXAM:** THE BRASS WARDEN (the Buried City's construct elite, SHIELDED) standing in a groove whose stone runs from behind him. His tomb guard rises behind him. Gate at 611.

**THE EMBALMERS' GALLERY** (611-735, poison)
- The Burial Caverns' breathing vents (`L.gasVents`) are taught on the flat.
- The gas is taught on a guard.
- The gas corridor is spent: plate, pale stones, refuge shelves, and a mummy that treads them behind you.
- THE BLOWERS' NICHE: a floor plate gasses the niche over your head.
- **EXAM:** THE OLD STINGER (venom-scorpion elite, VENOMOUS) on the vents, the gas plate before him. Gate at 727.

**THE OIL CHANNELS** (736-862, fire)
- The channel is taught on a guard.
- The long channel is spent: refuges, with the risen walking it.
- THE OIL FALL: fire poured from a high walk onto the squad gathered below.
- Fire scorpions.
- **EXAM:** THE TOMB-WARDEN II (BURNING) in the last channel. Gate at 853.

**THE FLOODED CRYPT** (863-962, water)
- THE CISTERN (taught, REQUIRED): drop in, tread the plate, stand clear of the bore, swim up to the lip.
- THE CRYPT (REQUIRED): the high door at row 30 is reached only on the water. The bore drowns the risen squad.
- **EXAM:** THE BRASS WARDEN II (UNSTOPPABLE) keeps the sluice plate at the crypt's east end. Lure him into the bore's reach.

**THE KING'S STAIR** (963-1006): the A14 platforming section, with its own exam.
- Narrow courses over a scarab well (spikes).
- Four of them GIVE (the Burial Caverns' `L.crumble`).
- The plate-course fires a dart volley over the last run. Spend it, then run the giving courses.

**THE BURIAL CHAMBER** (1007-1047): the end arena slot. It is a placeholder room, and the level's gate is at 1049.

### Reused content (brief item 3)
- Mummies, tomb jackals, dart-blowers and scarabs.
- The Buried City's construct (2 elites) and sand-drowned.
- Venom scorpions and fire scorpions.
- The Burial Caverns' gas vents and giving courses.
- A callback prop at 501: the robbers' bones with a sand-gate key and a broken hourglass.

### Shrines (A10b)
- 170, 252, 337, 448 (before her lair), 615, 737, 858, 1003 (before the burial chamber).
- No shrine closer than 90 columns in the second half.
- level-quality: 8 checkpoints, one per 133 route tiles.

### Cast (D)

| foe | count |
|---|---|
| mummy | 23 (34.8%, under the 35% cap) |
| tombskel | 11 |
| jackal | 11 |
| dartblower | 8 |
| scarab | 6 |
| construct | 2 |
| venom scorpion | 2 |
| fire scorpion | 2 |
| sand-drowned | 1 |
| vulture | 1 |

Roles: runner, melee, ranged, heavy.

### King's Pyramid (scratch/brief-kingspyramid.md, the !! 10-13 lines)
None of its set pieces are reused here: no fixed mirrors, no thrown fire or burning barriers, no kegs, no switch-crushers on the Deathless, no lift descent. Everything here is tomb- and plate-flavoured: lids, the plate-fired gas, oil and sluice, and the giving courses.

## Minutes walked (tools/level-walk.mjs, campaign L41, human+first, 1 seed)

| hero | before | after |
|---|---|---|
| knight | 195 s (3.3 min), whole level | **427 s (7.1 min)**, whole level: 185 s first half + 242 s second |
| warden | did not finish (walker stuck in the counterweight shafts, also on master) | second half alone **344 s (5.7 min)** |
| pyro | did not finish (walker stuck in the pits, also on master) | second half alone **248 s (4.1 min)** |

- That is **2.2x** for the knight. Reference walks with the same tool: Buried City knight 424 s, Ksar 328 s.
- The brief's "12-15 min" is a human figure; the bot walks about 2x faster than a first-time player. So the level now plays like the Buried City.
- Second half per section (knight / warden / pyro):

| section | knight | warden | pyro |
|---|---|---|---|
| hall | 55 s | 76 s | 46 s |
| gas | 66 s | 85 s | 76 s |
| oil | 49 s | 84 s | 53 s |
| crypt + stair | 63 s | 90 s | 65 s |

- Arrivals at shrines: 49-75%. 0 deaths. The hazards do most of the damage (the walker does not work the plates).

## Hooks left for LANE B (claude/pyramidboss)

**`src/sealed-pyramid-tombs.js` `MINI_SLOT`** = `{ sx: 452, R: 57, W: 40, eastDoor: { col: 492, y0: 51, y1: 56 }, check: 448 }`
- This is her antechamber where it was; `stageScarabMother(…, 452, 57)` is unchanged.
- **Today she is still the level's `L.arena`.** I added three things to cover that:
  - Her east door is cut, and `arena.wallR` shuts it while she fights.
  - `arena.until`: main.js bossStart wakes her only inside her room. It is opt-in, and only this level sets it.
  - `L.routePastBoss: true`: opt-in in tools/pacing.mjs (the route ends at the gate), tools/level-walk.mjs (hands her off like a mini) and tools/elites.mjs (gates behind her are judged by the ground past them).
- **To do:** make her `L.mini` (wallL 451, gate 492), then **delete `routePastBoss` and `arena.until`**.

**`BOSS_SLOT`** = burial chamber x 1007-1046, floor 24, roof 4 (20 tall).
- West door col 1006, rows 18-23. East door col 1047, rows 18-23. The gate ent is at 1049. The shrine is at 1003.
- **Ledges** (the counterweight ledges on chains): 1009-1014 and 1039-1044, row 17, oneway, with chain decor.
- **Switch mounts:** decor at (1008,10) and (1045,10).
- **Pale plates:** decor only, no traps yet: 1017-18, 1026-27, 1035-36.
- **Ceiling trap slots:** carved at rows 2-3, cols 1020-22 and 1031-33.
- **Placeholder:** the great-sarcophagus prop at 1027.
- **To do:** put the boss here as `L.arena` (and `gateAfterBoss` stays).

**Engine:**
- The trap engine takes new kinds through `L.traps`: block, darts, stone, gas, oil, flood.
- A trap on `e.boss` calls `ctx.bossTrap(e, kind, t)`, so the Sarcophagus can be flipped by any of them.
- Tombs (`L.tombs` + `tombWait` ents) can serve his Grave Call. `ctx.spawnEnt` is wired.

## Checks (PORT 8894; one browser at a time) - green unless noted

**Node:**
- sealed-pyramid **197/197** (82 old + new section F: hazards on plates, each exam's elite in a reach, tombs, the two sluice locks, the stair, the slots, shrine spacing).
- level-quality: every row green except the stale stamps (re-stamped below).
- reach-heroes: 14 route targets × 8 heroes, 0 misses.
- deadends (3, all pay), drawn-solids, stuck --static, solid-islands, architecture, signs, floaters, spawns, killzones, collectables.
- checkpoint-gaps, elites (82, all ok), one-new-foe, level-reach, tells (922 rows), untold-told, hint-shown.

**Page:**
- corpses ok, boss-fight-end (62 fights), mark-integrity MI_ONLY=scarabmother (charge/snap/spit posed + landed), untold-told.
- probe (work/claude/pyramidlevel/probe.mjs): every machine fires, a tomb spawns its dead, both sluices rise, and you swim out.

STAMPS_AND_LATE_CHECKS

## Reds
- **Walker (pre-existing on master 7d920edb; not this lane's change):** warden and pyro never finish the FIRST half. The warden sticks on the first counterweight: he jumps on the block instead of riding it. The pyro sticks in the pits / deep way.
  - The cause is that the hint's `wait: true` is not a key the walker reads; it reads `hold`.
  - I tried `hold` and it made the shafts worse for pyro, so I reverted it.
  - This needs a walker-hands lane.
- **textfit --strict:** the full run's "boss" scope timed out at 480 s on this PC under load (Runtime.evaluate; not a text failure). Rerun result below.

## ART needs for LANE C (placeholders today)
1. **The tomb niches and their lids:**
   - shut / cracking (the shake, the cracks, "!") / open (the lid fallen);
   - a gilt face on a mummy's lid, a bone ankh on a guard's.
2. **THE TOMB GUARD** (src/redraw/sealed_pyramid_cast.js bakeSkeleton): 8 frames on the mummy's contract.
   - Each move needs its own windup and release (B16): CUT TELL / CUT, LEAP TELL (crouch) / LEAP; plus a hurt frame.
   - Its bestiary card.
3. **Gas:** jets in the floor and in the niche walk, the armed wisps, the cloud (the "GAS" word is a placeholder), the breathing vents restyled as embalmers' grates.
4. **Oil:**
   - the channel's black sheen;
   - the brazier on its stand, upright and tipped;
   - the running flame front, the burning channel;
   - the oil fall's gutter on the walk and its burning curtain.
5. **Sluices:**
   - the bronze grille in the wall and its water gauge;
   - the bore (a foam front; "THE BORE" word is a placeholder);
   - the crypt's water (today the default clear pool);
   - the cistern and crypt rooms, sarcophagi.
6. **The King's Stair:** the giving courses (the crumble is drawn in the caverns' plank style today), the scarab well, the dart wall in the west wall.
7. **The burial chamber** (lane B's arena): the side ledges on chains, the switch mounts, the pale floor plates, the ceiling slots, the great sarcophagus.
8. **Per-section tile palettes** (sealed_pyramid_tiles.js secOf borrows the first half's) and room styles (`pyTombs`, `pyGas`, `pyOil`, `pyCrypt`, `pyStair`, `pyBurial` fall back to the gallery's).
9. **The robbers' callback prop** at 501.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. **Where does her lair sit?** Rec: mid-level at the old antechamber, with the second half climbing back up to the burial chamber (built). Alt: a new lair room further on.
2. **Hazard damage** is the trap share by section: teach 24%, test 34%, exam 50%. The gas adds venom; the bore adds a shove. Rec: keep (told, never an untold death).
   - Alt: make the stair's well a real death in its exam (A10 amended allows it).
3. **Pyro's fire and the hazards.** Pyro's jet can LIGHT the ambient breathing vents (the Burial Caverns' rule). A lit vent stops puffing for 20 s and burns foes in it.
   - The plate-fired gas, oil and sluices cannot be worked by his fire. The oil catches only from its brazier.
   - Rec: keep (a pyro skill, not a bypass). Alt: seal the vents against fire.
4. **The tomb guard is the mummy's machine** (still one new foe). Rec: keep. Alt: a separate skeleton AI (that would make it a second new foe).
5. **No shrine right after her lair** (spacing). The next one is 615, and a death in the hall walks back through her (dead) room. Rec: keep.
