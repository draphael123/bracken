# claude/colossus3 - THE GLASS COLOSSUS after Daniel's 10-07 play ("good") (Opus, 2026-10-07)

Base: master 56c2cf92 (live; includes the GLASSSEA2 Colossus rework). Branch claude/colossus3. Port 8719.

## STATUS: done

## WHAT CHANGED (Daniel's three fixes)

### 1. THE SUN LANCE IS A LOT SLOWER (src/glass-colossus.js COL, stepColossus 'lance')
- **The windup** goes from 0.98 s to **1.65 s**, and from 0.85 s to **1.45 s at dawn**.
  - A sun gathers at its chest and grows over the windup.
  - The tell line and the X are drawn as before.
  - The words say **"!! SUN LANCE: A MIRROR, OR JUMP IT"**.
- **The beam travels.** It no longer lands along the whole line at once. A **bolt** runs out from its chest at **190 px/s** and burns only the **56 px** behind its head.
  - A hero at the wall sees it come for about 1.5 s, then jumps it as it passes. The floor behind the bolt is safe.
  - At a FACING mirror the bolt stops at the mirror's face. It is thrown back into the chest, which CRACKS. **The mirror opening is unchanged.**
- **v2 bot:** it jumps the bolt as its head arrives. Its bait (behind the mirror) is unchanged.

### 2. NO ADDS: THE SWARM CALL IS GONE. P2's new move is THE CRACK LINE (B5)
- **The tell** (`crackTell` 1.15 s) is **told** with the hard-tell sound, a colour and the words:
  - Its foot on your side lifts and grinds.
  - An **amber glow** runs along the floor from its foot to **30 px past where you stand**. A red post marks the end.
  - The words say **"!! CRACK LINE: JUMP OR STEP ASIDE"**.
  - It comes one windup at a time.
- **The attack.** Glass spikes then erupt along the line, foot first, with a front running out at 260 px/s.
  - A spike bites for 0.22 s as it rises. The spikes are 22 px high and do 52 damage.
  - To avoid them, **jump**, step **past the line's end**, or be up on a **knee hold**.
- **The P2 opening is kept and earned.** A mirror turned TO THE FIRE puts firelight on its crack. **As the spikes finish**, it strains, the words say "THE FIRE HOLDS THE CRACK: ITS SHOULDERS BLAZE", and the shoulders blaze. So you dodge the line, then climb and punish.
  - (My first build let the firelight cancel the spikes. Then nobody who had turned the mirror ever answered the move, and the fight ran 78%. See the rates below.)
- **Chain P2:** crack, quake, shards, stomp, crack, quake, stomp. B12: no crack line in the lockout after a ward.
- **Removed from the fight:**
  - the `swarm` / `swarmTell` modes;
  - the hands' `spawnSkitter` / `coSwarm` code;
  - the swarm draw.
  - The level's own crack swarm is untouched.
- **Mark row:** `colossus|crackTell` is **!!** (BY_HAND), ANSWER **jump**, HEIGHT **low**. I ran `tells --write`; the MARK table regenerated and the `swarmTell` row is gone.
- **Hint lines** in src/hint-lines.js, renamed from SWARM to CRACK:
  - `IT SPLITS THE GLASS TO YOU: FIRELIGHT ON ITS CRACK HOLDS IT`
  - `TURN A MIRROR TO THE FIRE: ITS LIGHT HOLDS THE CRACK`
  - `THE FIRE HOLDS THE CRACK: ITS SHOULDERS BLAZE`
- **v2 bot:**
  - If there is time in the tell, it steps off the line past its end. Otherwise it jumps the spike front.
  - When the fire is held and it is already up a hold, it stays up.

### 3. THE BOMBS INTO THE ARENA: the cause is shared, and so is the fix
- **The cause.** The walls of every boss arena and mini arena are **6 rows high** (`setWall`). They shut only the **way in**. Every level foe left outside them kept its AI, so a thrower's arc went **over** the wall.
  - In THE GLASS SEA, the two **shard-throwers** (a `slinger` reskin) stand on the Colossus Steps at **cols 598 and 601, row 30**. That is 3-6 tiles west of the west wall (col 603), about 3 rows above the arena floor and within the sling's 230 px sight of the arena's west half. They slung shards into the arena for the whole fight.
  - **The boss bot never saw this**, because src/lab.js clears the level's foes before a boss fight. That is why no rate run ever caught it.
- **The fix is in src/main.js, for every arena:**
  - `arenaShut(A, except)` runs when a boss wakes (`bossStart`) or a mini wakes. Every level foe standing outside the walls (x outside x0..x1) is **held**:
    - its AI does not run;
    - a stone in flight is spent;
    - a whirling sling is stopped.
  - `arenaHeld(e)` lets them go when the fight ends. A death rebuilds the foes anyway.
  - Adds that a fight spawns later are never held.
- **New check: tools/arena-shut.mjs** (in the page, on its own port).
  - In **every boss and mini fight (53)**, with the level's foes left in, every level foe outside the walls is held, is never carried into the arena, and throws nothing.
  - **CONTROL:** in THE GLASS SEA with the hold lifted, the throwers sling **10 stones** into the arena in 6 s. The leak was real, and the hold is what closes it.
- **Other arenas with the same exposure:** ranged foes placed 1-16 tiles outside an arena's walls, from a scratch audit of the built levels. The shared fix covers all of them. The ones within about 15 rows of the arena floor:

| Level | Boss or mini | Ranged foes outside the walls |
| --- | --- | --- |
| spore | MOTHER CAP | a spitcap 12 tiles W, 1 row up |
| longwater | HERALD | two scouts 8 and 15 tiles W, 4 rows up |
| underleaf | GRANDMOTHER | a sapper 12 tiles W |
| causeway | KRAKEN | a netter 11 tiles W, 1 row up |
| waymeet | PALADIN | a drunk (thrower) 5 tiles W |
| waymeet | LANCER mini | a drunk 10 tiles W |
| theatre | PUPPETEER | a goblin priest 7 tiles W, 1 row up |
| welltown | DJINN | three bandit mystics / lampbearer 7-11 tiles W, at the floor |
| witchlight | GARGOYLE | an apprentice 10 tiles W and a bone archer 15 tiles W |
| oreroad | WINCHMASTER | a javelin 10 tiles W, 6 rows up |
| redgorge | MATRIARCH | slingers 7-12 tiles W and a dynamiter 13 tiles W, rows 26 against floor row 22 (one dynamiter 1 tile E is far below) |
| unburied | BARROW RIDER mini | two bone archers 2 and 4 tiles W, at the floor |

  Further off vertically, and not likely to reach: the hanging owl's, the spire golem's, and the undercrown prince's.

## BOSS RATES (tools/boss-rates.mjs glasssea --ways=practiced --profile=human, campaign level L34, measured DRY, PORT 8719)
**Final, 12 seeds: knight 6/12, warden 3/12, pyro 10/12 = 53%, in band. No hero is at 0.**
- Wins took 79-144 s (most 85-100 s). Deaths came at 38-119 s.

The tuning path, in order:

| Build | Result | Seeds |
| --- | --- | --- |
| slower lance, no adds, a held crack cancels the spikes | 78% (6/2/6) | 6 |
| the crack always erupts; the blaze follows | 61% (4/2/5) | 6 |
| the same | **53% (6/3/10)** | 12 |

- No hp change and no damage change; the band came back with the crack line alone.
- The warden runs low (3/12) and the pyro high (10/12), as on glasssea2 (4-5/12 and 11/12).

## RE-STAMPS
- The level's data is unchanged (src/glass-sea.js is untouched; levelHash is the same), so **only the BOSS row** was re-stamped: .
- The boss holds **0/6**: every mash hero is dead in 15-22 s with the boss at 93-100%.
-  passes. The level row is unchanged.

## CHECKS RUN (targeted; no full suite)
Green:
- glasssea (122)
- tells ( for the new mark)
- answer-tags
- hint-shown
- boss-read
- boss-fight-end (54 fights)
- boss-openings
- boss-greed
- arena-shut (new; 53 fights + the control)
- mash-bot - boss-rates (above)

Nothing is red.

### Test changes (deliberate design changes Daniel asked for, not weakenings)
- **glasssea, "Daniel 10-07: quicker tells (`lanceTell < 1.0`)".** That was glasssea2's assertion. Daniel's later ask, after playing it, reverses it, so it is now **"the SUN LANCE A LOT SLOWER: told >= 1.5 s (>= 1.3 at dawn), bolt <= 220 px/s"**. The hp and chain parts are kept.
- **glasssea, "an unheld swarm call pours skitters".** Daniel's "no adds" means this test is replaced by the crack-line tests:
  - it is told from the foot to past you;
  - it hits a hero on the line;
  - it does not hit a hero past its end or on a knee hold;
  - held, the spikes come and then the shoulders blaze;
  - 30 s of P2 call no adds.
- **glasssea, the two lance tests.** They step until the (slower) bolt lands instead of a fixed 2.0 s.
- **New asserts:**
  - the bolt travels;
  - only the bolt burns;
  - the bot steps off the crack line and jumps its front;
  - no swarm anywhere in the chains or the hands;
  - a pose key for every mode.

## POSE KEYS for the COLOSSUS ART lane (src/glass-colossus.js poseOf / POSE_KEYS; the fields are px)
fields: `{ key, lean (+ = toward +x), bob (+ = down), footL, footR (lift up), armL: [dx outward, dy], armR: [dx outward, dy] }`

| key | mode(s) | what it does |
| --- | --- | --- |
| idle | idle | a 3.2 s weight shift: lean ±3, the free foot lifts up to 4, the arms ±2 against it, a 1 px bob |
| sleep | sleep | slumped |
| wake | wake | rises over 1.6 s |
| lanceWind | lanceTell | leans back, arms drawn in and up. **The windup is now 1.65 s (1.45 at dawn): the art lane can hold the gather longer** |
| lanceFire | lance | leans in +3. **The bolt travels for up to about 1.7 s: hold the pose while it runs** |
| stompRaise | stompTell | the foot on its facing side lifts 4 -> 12; it leans away |
| stompDown | stomp | |
| sweepWind | sweepTell | the arm on the sweep's side goes out 8 and up 18; it leans away |
| sweep | sweep | that arm thrown out 16 along the floor; it leans in |
| shardShrug | shardTell, shards | |
| quakeRaise | quakeTell | both arms up 16 |
| quakeSlam | quake | |
| **crackWind** (NEW, replaces swarmCall) | crackTell | the foot on the line's side lifts and grinds 3 -> 10 over the tell; the fist on that side drawn down (+3, +6), the other arm up a little (+2, -3); it leans back 1 |
| **crackDrive** (NEW) | crack | the foot drives down; it leans 3 along the line, bob 2; the arm on that side out and down (+6, +8) |
| shake | shakeTell, shake | sway; ±3 at 40 Hz in the shake |
| waveRoll | waveTell, wave | |
| phase | phase | |
| stagger | cracked, blazing, dazzled | B4: slumped 3, a tremble of 1 px or less |

**swarmCall is gone.** The parts are split as before: bakePart(ph, 'armL' | 'armR' | 'legL' | 'legR') and bakeCore(ph).

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **THE CRACK LINE always erupts; the firelight opens the shoulders after it.** Rec: keep (dodge, then punish). Alt: firelight cancels the spikes. That is gentler, but a player who has turned the mirror never answers P2's new move, and the bot ran 78%.
2. **THE SUN LANCE as a travelling bolt** (190 px/s, 56 px long) after a 1.65 s windup. Rec: keep. Alt: an instant beam with a longer windup only. That is easier to read, but less reaction time once it fires.
3. **THE ARENA IS SHUT for every boss and mini.** Level foes outside the walls freeze while the fight is live. Rec: keep (one shared rule). Alt: per-arena placement fixes (move the throwers). They would leak again with the next level.
4. **THE PLAYTEST GATE (B9):** please play the slower lance and the crack line.
