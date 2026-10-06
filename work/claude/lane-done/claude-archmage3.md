# claude/archmage3 - THE FALLING TOWER'S ORRERY LOFT AND THE UNDEAD ARCHMAGE, READABLE

Brief: scratch/brief-archmage3.md (Daniel 10-04, the revised one: no bone golem), plus Daniel's archmage notes of 10-05 (sent by the coordinator mid-lane).
Base: master 2423ff42 (batch68, with ARCHMAGE2 and the INTEG67 retune live).

## 1. The live tower's ice is gone

- The only ice in the live tower (from before ARCHMAGE2) was THE OPEN CROWN's crystal ledges.
  - Every fourth ledge of the crown's climb was the Sunspire's CRYST tile: pale blue glass that cracked under you.
  - Those ledges are now the crown's own slate ledges (src/tower-ascent.js). The crown's failing stone is still its hazard.
  - `hasCryst` is off for the level.
- ARCHMAGE2's ICE STAIR is a different mechanic, and it is kept.
  - It is one flight of the spiral stair, where his frost spell makes the steps slick for 4.5 s.
  - It is not the crystal Daniel saw in the live build.
  - QUESTION 1 covers it.

## 2. THE ORRERY LOFT (src/spiral-chase.js, src/lab.js chaseClimb, src/stuck-spots.js)

- A new flight just under THE LAST STAIR. The stair now has ten flights.
- There is no stair over the void. You cross on the clock's brass orrery: two wheels of three worlds, using the same `wheel` mover as the Mage's Folly orrery, with 32 px bars.
  - **Inner wheel.** Step on as a world comes up level with the board step. Ride it over the top, and walk off onto the pier as it comes down.
  - **Outer wheel.** Board from the pier, and JUMP OFF AT THE TOP of the turn for the landing.
- **The turning is told:**
  - a brass orbit with chevrons running the way the wheel turns;
  - a pawl click (SFX.ratchet) as a world comes level with the ledge you are on;
  - a sign: "THE ORRERY TURNS. NO STAIR CROSSES HERE: ITS WORLDS DO.";
  - a hint-box line the first time you reach it.
- **Glint and stall nudge** (the shared guide, two spots).
  - The next world round on each wheel glints. It is marked `m.next`, kept by `orreryTick`.
  - The nudge comes after 10 s, and never while you ride that wheel.
- **No soft-lock.**
  - The rising dark's caps apply unchanged: it never rises past an unstood landing.
  - A world comes round to each boarding ledge every 2.2-2.4 s.
  - If you miss a step-off, you ride round again.
  - The dark's knock-up still lands you on a ledge. Its contact damage no longer also knocks you off the ledge it threw you onto (`noKnock` for knockTo chases).
- With ten flights, the first flight runs right, so you now come out of his ring on the LEFT (arrive 82, checkpoint 84,146; CHECK_PIN moved).
- **Climb time** (tower-chase, stair bot, health held up): 67-111 s, median about 85-89 s. Before, it was 59-80 s. The loft itself takes about 11 s.
- **THE RULE BITES:** with the worlds taken out, the reach fill reaches neither the pier, the landing nor the carpet.

## 3. The Undead Archmage (src/undead-mage.js, src/archmage-acts.js (new, drawing only), src/redraw/lich.js, src/mage-realms.js)

### a. Phase transitions, each its own told set piece

Each realm he tears (75/50/25%) now plays its own 2.8 s picture before it takes you. Each has its own banner in the hint box and its own sounds:
- **Fire:** THE SKY CRACKS. Glowing cracks race from the screen's edges to him and burst orange.
- **Ice:** HIS RINGS GATHER AND FREEZE. Six of his rings circle in on him and frost white.
- **Poison:** HIS DARK SURGES UP THE SKY. The stair's violet-black dark rises up the screen with the mire's green on it.

Every transition is a breather: his shots, rings, skulls, orbits, lines, void and echoes are cleared, and nothing is cast through it. The realm SHATTERS into shards when you come out of it.

### b. Two new told moves

- **HIS ORRERY** (orbitTell !!, 1.2 s).
  - Worlds come out on orbits round HIM (shown dotted through the tell), then swing for 3 s, each ring turning the opposite way to the one inside it.
  - Keep between two orbits, or out past the last one.
  - A fourth world is added in his last stage.
  - It foreshadows the orrery loft.
- **THE GRAVE SCRIPT** (scriptTell !!, 1.2 s).
  - He writes his runes in lines across the whole sky, every band but one dark line. The dark line is never the band you are in or next to it.
  - Fly to the dark line.
  - From stage 2 he writes it twice, and the dark line moves between them.

### c. A clear default ward, and Daniel's 10-05 notes (all built)

- **The ward is drawn by default.**
  - It is a pale shell of turning runes round him.
  - A turned blow flares it white, sends a ripple out from the hit point, puts WARDED over him and plays his ward's note (SFX.aegis). This is wired in main.js greedHit, and also for blows during his wake and his tear.
- **An opening SHATTERS the shell,** and he burns gold while he is open, in his hall as well as in the realms.
- **REFLECT BREAKS HIS WARD (note 1).**
  - His FIREBOLT is marked as reflectable: orange, with a white heart and a turning gold ring.
  - Any hero's blow that meets it STRIKES IT BACK (main.js `strike` = attackBox).
  - Home, it BREAKS HIS WARD. That is a new opening, 'reflected', for openT 3.6 s.
  - Openings are now only ever caused by the player: a reflect, a dodge through his ring, or a death mark that finds no one.
  - **The anti-spam ward:** for 3 s after any opening his ward HOLDS. It is told by a doubled bright shell. During the hold, a reflect, a ring dodge or a missed mark only rings off it.
  - Nothing else of his can be struck back: not his echo's fire, not ice, bent bolts, trap bolts or the hand.
- **THE COLOUR RULE (note 2), on the game's convention.**
  - **YELLOW rim = guard it:** his fire, ice, hand, bent and trap bolts, and the realms' bolts.
  - **RED rim = dodge it:** skulls, his orrery's worlds, the script's lines (now red-tinted), the death mark, the poison orbs, the storm column and the void.
  - **Measured on the carpet** (scratch tool, 4 bolts per hero): holding guard takes every yellow bolt with 0 damage for all 8 heroes (knight, warden, pyro with her ember ward, paladin, pirate, reaper, geomancer, death knight).
- **LESS HECTIC LATE (note 3).** In his last stage:
  - no spells in pairs;
  - no phylactery echo (stage 2 only now);
  - no new spell while the last one's skulls, worlds or lines are out, or while 3 of his bolts are in the air.
  - The red blows hit harder instead: storm 28, mark 34, skull 15, world 22, script 24.
- **THE STAFF (note 4).**
  - The fire, ice, poison and death poses now point the staff, head forward and up, with both hands on it. There is no fist thrust.
  - Every bolt leaves the staff head (MAGE.staff: 20 px ahead, 51 px up). This applies in his hall, in the realms and on the stair.
- The bestiary card names the ward, the orrery and the grave script.

### d. Numbers (human-speed bot, tools/combat-pilots.mjs, corrected harness)

**Tuning runs before Daniel's 10-05 notes** (12 fights each, wins knight / warden / pyro):

| health | result |
|---|---|
| 1500 | 9/12 (4/1/4) |
| 1800 | 8/12 (4/0/4) |
| 2100 | 8/12 (4/0/4) |
| 1700, new moves' damage up | 10/12 (4/2/4) |

**Re-measured after the 10-05 changes:**

| health | wins (knight / warden / pyro) |
|---|---|
| 1700 | 8/12 (4/0/4) |
| 2000, red blows harder | 9/12 (4/1/4) |
| **2400 (ships)** | **14/24 = 58%** |

At 2400, per hero:
- **knight 6/8** (wins in 93-112 s)
- **warden 0/8** (dies with 17-62% of his health left; one timeout at 19%)
- **pyro 8/8** (116-151 s)

Fights run 93-151 s. At 2000 the warden got 1/4 but the total was 75%. Health cannot fix the warden without putting knight and pyro at 100%: she needs about twice the knight's time. This is reported, not over-tuned (HERO KIT is on her kit). Seeds per hero: 16 before the notes, 16 after.

**Mash bot** (re-stamped by the bot, level then boss):
- boss 0/6;
- level: every hero dies 4-5 times;
- the Sexton mini is unchanged and stays report-only, as before.

## 4. The map: the tower leads into the desert

- The map already ran the main road from THE FALLING TOWER up the sand seam into THE SUNKEN CARAVAN (caravan `needs: 'fallingtower'`).
- What it did not do was take you there. Winning the tower put you back on the tower's node.
- Now LEVELS gets `leadsTo: 'caravan'`. On the win card the map puts you on THE SUNKEN CARAVAN's node (main.js `leadOn`), if it is open.
- The level's own end is unchanged: his portal to the sand, and the gate signed "THE ROAD TO THE SUNKEN CARAVAN".
- map-spacing and map-grammar are green. No save migration is needed, because no node moved.

## Checks (named runs, PORT 8613)

Green:
- tower-chase, tower-ascent, tower-flyers, checkpoint-gaps, checkpoint-stand, tower-collapse, tower-cutouts, tower-hall
- archmage-room, archmage-folly, archmage-rings, undead-foes, undead-realms, undead-moves
- boss-openings, boss-greed, boss-fight-end, boss-music, audio-assets, tells (`--write` run), hint-shown, stuck (static and runtime), mash-gate, level-quality
- map-spacing, map-grammar, modulepreload, architecture, checkpoints, skins, npc-removal, answer-tags
- tower-collapse, tower-cutouts, tower-hall, archmage-room, archmage-folly, undead-foes, corpses, dangling-paths
- slopes-trace (unchanged for every level, no rebase), pixels (floats)

**Red, and not this lane:** textfit (bestiary + hints): one TRUNCATED, "DJINN OF THE GREAT WELL", the known Djinn string from INTEG67. The longer Archmage card fits.

**Deliberate test changes:**
- tower-chase:
  - ten flights;
  - gaps over 2 tiles are allowed only on the orrery's two voids, which must be at least 5 tiles. A new orrery block: the rule bites, a world comes round every few seconds, the turning is told, the flight is signed;
  - the stand test walks right and no longer counts the killing contact as a "throw";
  - the climb time bound is now median 60-100 s and slowest at most 130 s. It was slowest at most 95; the brief now asks for 80-100 s.
- archmage-rings: his order is 16 moves; round 3's 12 are all still in it.
- stuck (runtime): while a hero is held at a spot, a level chase is held at its start. Otherwise the rising dark throws a hero who stalls on the loft's pier up onto its landing at about 9 s, before the 10 s nudge. That is the no-soft-lock rule working, not the guide failing. The pier's glint is a fixed point over the void where the outer worlds come level: a world turning that close kept resetting the stall clock.
- undead-moves:
  - new blocks for the orrery, the grave script, the ward, the three phase changes, the reflect and its hold, the staff origin, and the less hectic last stage;
  - the echo's origin is the staff head.

## Collisions / merge notes

- src/boss-greed.js is untouched. If BOSS WAVE 2 changes an Archmage number there, keep both. His OPEN_RULE is `mageOpen`, which now also counts 'reflected'.
- **main.js edits are small and local:**
  - imports;
  - his hp row (`undeadmage:2400`);
  - the carpet `strike` hook;
  - greedHit's ward flare;
  - the gold tint when open;
  - the orrery draw call;
  - `leadOn`;
  - the chase contact's `noKnock`.
- marks.js was regenerated by `tells --write` (two new by-hand rows).

## UNVERIFIED

- **DANIEL'S PLAYTEST GATE:** nobody has played the loft or the fight by hand.
- Only the orrery, the transitions, the ward, the orbits, the script and the new pose were looked at, in screenshots. The reflect itself was measured in the page, not seen.
- The 80-100 s climb is the bot's number; a first-time player will be slower.

## QUESTIONS FOR DANIEL (the recommended option is the one built)

1. **The ICE STAIR** (ARCHMAGE2's slick flight) is not the live ice you saw, which was the crown's crystal, now gone.
   - Rec: keep the ice stair.
   - Alt: remove it as well, if "no ice" meant all ice.
2. **The warden is 0/8** at the shipping health.
   - Rec: ship 2400 (58% overall, in band) and let HERO KIT's warden pass lift her.
   - Alt: 2000 (75%, warden about 1/4).
3. **Which bolts reflect.**
   - Rec: only his plain firebolt (gold ring and white heart).
   - Alt: his ice lances as well.
4. **The loft's nudge comes at 10 s, but the rising dark reaches a stalled hero on the pier at about 9 s and throws him up to the landing.**
   - Rec: keep it. The glint is up from the start, and the throw is the no-soft-lock rule.
   - Alt: an earlier nudge for that spot (the guide would need a per-spot delay).
5. **The orrery loft's step-off for the outer wheel is a jump at the top.**
   - Rec: keep it.
   - Alt: a pier on the far side so you can walk off.
