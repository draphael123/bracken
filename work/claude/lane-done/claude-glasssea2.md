# claude/glasssea2 - THE GLASS SEA after Daniel's 10-07 playtest (Opus, 2026-10-07)

Base: origin/master b4300130 (batch75). Branch claude/glasssea2. Port 8695 for the first session, 8701 after the restart.

## STATUS: done

### Session 1 (committed + pushed before the credits stop)
1. bca7aa1e MIRROR LIGHT. Beams now start where their light comes from and end on the face they hit. The draw order is post, then beams, then glass. There is a glint at every bounce. New check: no beam runs up a mirror's post.
2. 2173992d THE CRACK SWARM made obvious. The skitter is bigger and has a glow. The swarm is first met at dusk at the obelisk (THE CRACK STIRS), and a fire teaches that the swarm will not cross firelight.
3. 06cabffd TWO MIRROR-PLATFORMING SECTIONS:
   - A teaches: a rocking mirror over a soft pit.
   - B, THE HAWK GAP, is the remix: two mirrors out of step over real cracks.

### Session 2 (this restart): THE GLASS COLOSSUS (item 4), commit 595f7341, plus re-stamps
- **Numbers** (src/glass-colossus.js COL):
  - hp 2000 -> 680, which is about a third.
  - Tells are about 15% quicker:
    - lance 0.98 (0.85 at dawn);
    - stomp 0.72;
    - shards 0.85;
    - shake 0.85;
    - swarm 1.02;
    - wave 0.85.
  - Gaps 0.45 / 0.40 / 0.32.
  - Damage is up about x1.6 so that a 680 giant is still a threat:
    - lance 92;
    - stomp 60;
    - rain 37;
    - shake 29;
    - wave 53;
    - sweep 47;
    - quake 45.
  - Opening cap 0.10 (68 hp an opening). Leg purse 0.10 / 0.06 / 0.05.
  - A fight lasts about 85-110 s (B6).
- **Two new told attacks**, one windup at a time. Each has a sound, a word and a colour:
  - P1, THE SHARD SWEEP (`sweepTell` 0.75 s):
    - Its arm (the pose raises it) reaches to the wall on your side.
    - A red and white dotted line runs along the floor, and the words say "!! JUMP THE SWEEP". The sound is the hard tell.
    - Then a glass arm drags in along the floor to its feet, 18 px high. You jump it, or stand on any hold.
  - P2, THE GLASS QUAKE (`quakeTell` 0.9 s):
    - Three floor plates are marked: under you and 76 px to either side, with a 36 px gap between them. They flash red and white, and the words say "!! OFF THE PLATES". The sound is the hard tell.
    - The plates heave up and hit you.
    - For 3 s after that they lie as slick tilted shards that slide you outward at 70 px/s. The first time, it says THE GLASS IS SLICK: IT SLIDES YOU.
  - New chains:
    - P1: lance, stomp, sweep, shards, lance, sweep, shards, stomp.
    - P2: swarm, quake, shards, stomp, swarm, quake, stomp.
    - P3: lance, shards, wave, sweep, lance, stomp, quake.
- **A VERY clear mirror read:**
  - The shelf-mirrors start TO THE SKY, so the fight asks for the TURN first. The fight opens with the told line "TURN THE MIRROR TO HIM: HIS LANCE COMES BACK INTO HIS CHEST".
  - While no mirror faces it in P1, a bobbing gold sign stands over the nearest mirror: "TURN THE MIRROR TO HIM (E)", with an arrow and a faint guide line to the chest.
  - The 10 s stall nudge now says TURN THE MIRROR TO HIM.
  - A target ring sits on the chest, and a dotted gold guide runs from every mirror that faces it.
  - The lance stops at the mirror's face. The reflected beam is drawn from the mirror into the chest core as it cracks.
  - In P1 it knocks the mirror that cracked it back TO THE SKY, so every opening wants a fresh turn.
  - Other phases get guide lines too:
    - P2: dotted guides from the crack to the shoulders, which go gold when the relay holds.
    - P3: dotted guides from the mirrors to the crown.
- **OPEN read (B10)**: a doubled gold ring of 30 px, "OPEN: STRIKE", a 60x4 timer bar, and gold chevrons on the holds that reach the opening (hip for the chest, shoulders for the blaze and the crown).
- **Shelf-mirror clipping**: the relay and dawn beams are now drawn BEFORE the shelf-mirrors and land at the disc's face, so no beam crosses the bronze.
- **The POSE CLOCK**:
  - `poseOf(e, S, t)` gives S.pose every frame.
  - src/redraw/glass_colossus_art.js now bakes the arms and the shins and feet as separate per-side parts. bakeBody is still the whole giant.
  - In the draw, the trunk leans and bobs, a foot lifts, and the arms swing. A fist never goes under the floor.
  - In idle, it shifts its weight on a 3.2 s clock.
- **v2 bot** (colPlan `eyes`, passed from src/lab.js as `!!LABP.v2`):
  - It does not react twice: the eyes already delay and misread. Its hands' own fumbles (the bait, the turn, the grip) stay.
  - It turns a mirror TO HIM when none faces.
  - It jumps the sweep, and steps off a quake plate (or jumps it).
- **Marks**: BY_HAND, answer and height rows for colossus|sweepTell (!!, jump, low) and colossus|quakeTell (!!, dodge, low). I then ran `tells --write`, which regenerated the MARK table; the reflow is that tool's own output. The new lines are routed in src/hint-lines.js, and two lines that are gone were removed.
- **Coordinator's B14 note**: the Colossus's plunge bonus now goes by the blow TAG. This is one local edit at main.js COH.take: `plunge || blow === 'plunge'`. The pyro's firedrop now gets x2.4 too.
- **Art shots**: tools/glasssea-art-shots.mjs has new shots a6-a13 (turn sign, reflect, sweep tell and sweep, quake tell, slick, stomp, sweep wind), written to work/claude/glasssea-art/after/.

### Test changes (design changes approved by Daniel, not weakenings)
- tools/glasssea.mjs "lance into a FACING mirror" (and the bot's lance test) now TURN the mirror first, because the mirrors start TO THE SKY. Daniel asked for this ("TURN THE MIRROR TO HIM").
- The plunge-on-blazing test now uses a blow of 20, not 30. 30 x 2.4 = 72 is over the new 68 opening cap of a 680 giant; the cap is the rule.
- New asserts:
  - the mirrors start to the sky;
  - one turn faces the mirror;
  - P1 knocks the mirror back to the sky;
  - the sweep is told from the wall, hits on the floor, and misses on a hold;
  - the quake marks three plates with a real gap, hits, slides you outward, and settles;
  - the numbers match Daniel's ask;
  - every mode has a pose key, idle shifts its weight, and the stagger trembles 1 px or less;
  - the bot turns the mirror, jumps the sweep, and steps off a plate.
- That makes 110 checks in all.

### BOSS RATES (tools/boss-rates.mjs glasssea --ways=practiced --profile=human, campaign level L34, PORT 8701)
Final, 12 seeds: knight 5/12, warden 4/12, pyro 11/12 = **56%, in band**. No hero is at 0.

The tuning path, in order:
| Change | Result | Seeds |
| --- | --- | --- |
| hp 680, cap 0.2 | 100% in 45 s | 2 |
| cap 0.1, legs 0.10/0.06/0.05 | 92% | 8 |
| damage x1.4, gaps 0.45/0.40/0.32 | 79% | 8 |
| damage x1.2 | 67% | 8 |
| damage x1.1 | 56% | 12 |

The pyro runs easy, as it did on the hp-2000 Colossus (9/10 then).

### Checks run (targeted; no full suite)
Green:
- glasssea (110)
- glasssea-aloft
- hint-shown
- tells
- boss-openings
- boss-greed
- boss-fight-end
- boss-read
- answer-tags
- boss-rates (above)

Re-stamps: see RE-STAMPS below.

## RE-STAMPS (commit a0bd2ec7; LEVEL first, THEN the boss; only the glasssea rows)
- `level1-pilot glasssea --write`: 36 blows, 3 deaths, walked 100%. `--curve` was re-stamped too.
- `mash-bot glasssea --level glasssea --write`, then `mash-bot glasssea --write`: the boss holds **0/6** (every mash hero dies in 14-17 s with the boss at 100%).
- **The mash margin had gone.** Session 1's level changes, now at campaign L34, let the mash bot clear the level: warden 45% and pyro 53%, against the gate's 40%.
  - An hp trace (a scratch copy of mash-bot, since deleted) showed that its losses on the level are crack falls, in about 8-10% chunks. A foe added anywhere moved nothing: I tried a thrower on the spire, two scorpions past the gap, a hunter at the skull's foot and a third hawk, and backed them all out.
  - The fix: THE HAWK GAP's two real cracks now bite **32** (the road's cracks bite 20). The exam of the rocking mirrors costs more to fail. This is a per-crack `dmg`, used by glass-sea-hands.
  - The mash lows are now knight 12%, warden 33% and pyro 38%, with 0 deaths.
  - level-quality glasssea: **CLEARS THE BAR**.
- Route pilot, base movement (god, no foes): knight, warden, pyro, paladin, pirate, reaper and geomancer all walk it, with 0 deaths.
- The foes-on careless-hero mode is not a gate. In it, a fresh level-1 hero has 2-4 lifts and 8-12 deaths.
- Also green after the re-stamps: stuck (static + runtime, 73 spots), signs, glasssea (110).

## POSE KEYS for a COLOSSUS ART lane (src/glass-colossus.js poseOf / POSE_KEYS; the fields are px)
fields: `{ key, lean (+ = toward +x), bob (+ = down), footL, footR (lift up), armL: [dx outward, dy], armR: [dx outward, dy] }`

| key | mode(s) | what it does |
| --- | --- | --- |
| idle | idle | 3.2 s weight shift: lean ±3, the free foot lifts up to 4, arms ±2 against it, a 1 px bob |
| sleep | sleep | slumped |
| wake | wake | rises over 1.6 s |
| lanceWind | lanceTell | leans back, arms drawn in and up |
| lanceFire | lance | leans in +3 |
| stompRaise | stompTell | the foot on its facing side lifts 4 -> 12; it leans away |
| stompDown | stomp | |
| sweepWind | sweepTell | the arm on the sweep's side goes out 8 and up 18; it leans away |
| sweep | sweep | that arm thrown out 16 along the floor; it leans in |
| shardShrug | shardTell, shards | |
| quakeRaise | quakeTell | both arms up 16 |
| quakeSlam | quake | |
| swarmCall | swarmTell, swarm | the facing fist down into the crack |
| shake | shakeTell, shake | sway; ±3 at 40 Hz in the shake |
| waveRoll | waveTell, wave | |
| phase | phase | |
| stagger | cracked, blazing, dazzled | B4: slumped 3, a tremble of 1 px or less |

The parts are already split for it: bakePart(ph, 'armL' | 'armR' | 'legL' | 'legR') and bakeCore(ph).

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. The rocking mirrors need a TURN before they rock. Rec: keep. Alt: they rock on their own.
2. The teaching pit (A) is soft; THE HAWK GAP's cracks are real. Rec: keep.
3. The swarm teach is at the obelisk at dusk. Rec: keep.
4. The Colossus at hp 680 needed about x1.6 damage on every blow to stay in band; at 680 with the old blows the bot won 92% in about 85 s. Rec: keep (a short, dangerous fight). Alt: hp about 1000 with blows about x1.25.
5. Its pyro rate is 11/12 against 4-5/12 for the knight and the warden (the pyro is safe at range on the floor). Rec: accept for now, and re-check in your playtest. Alt: a pyro-specific counter (for example, the shard rain leads a ranged hero).
6. B14 KEY (coordinator's keys audit): make P2's blazing shoulders a PLUNGE-only key, with the word FROM ABOVE. NOT built: the bot cannot plunge in this fight yet, and B14 wants the key taught in the level first. Rec: fold it into the keys-act5 lane after keys-core lands. The plunge bonus already counts the pyro's firedrop by tag.
7. THE PLAYTEST GATE (B9): the reworked Colossus ships only after you play it.
8. THE HAWK GAP's cracks now bite 32, not 20, to restore the mash margin at L34. A fall there costs about 12% of a level-34 hero. Rec: keep (it is the rocking mirrors' exam). Alt: keep 20, and find the margin with a harder encounter. I found that foes barely move the mash low here.
