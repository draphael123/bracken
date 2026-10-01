# claude/fairfix2 - the Harvest Fair, made hard and full (ranged foes, platforming, tickets as keys, the effigy fire, the Queen's spear)

Base: claude/fairfix 8c1e9210, merged with master 6b12a26c (batch51). Opus lane. Two sub-lanes ran in their own worktrees and were merged:
claude/fairfix2-backdrop (Sonnet, the fairground backdrop) and claude/fairfix2-spear (Opus, the Wicker Queen's spear).

## Step 0: merging master (batch51)

- Conflicts in src/audio.js, src/main.js, src/marks.js, src/threat.js, tools/audio-assets.mjs, tools/check.mjs and tools/level-quality.mjs. I kept both sides everywhere.
- **Name clash.** Master's Puppeteer owns the entity type `marionette` (one of his puppets). The fair's looked-at puppet is now `stringjack` ("THE STRING-JACK"). Its logic (src/fair-foes.js) is unchanged.
- The theatre's `needs` and the road (Waymeet -> theatre -> fair -> fields) survive.
- level-quality after the merge:
  - Master's boss themes (src/boss-music.js) now count as real tracks. Without that, the Folly's `archmage` room failed music.
  - The encounter-density ceiling went from 2.0 to 2.5. The theatre, which merged gated under the old bodies-per-screen bar, reads 2.13 encounters a screen (docs/LEVEL-QUALITY.md says why).
- The fair is re-gated: `GATE = ['theatre', 'fair']`.

## What changed in the fair (src/harvest-fair.js, src/fair-keys.js, src/redraw/fair_keys.js)

1. **Ranged foes, reused and reskinned.** Each one sits in a designed encounter with a facing foe, so it hits the back you turn.
   - **Coconut-shy stallholder** (Waymeet drunk, `shy`, look 'shy' in bakeDrunk). On a roof over the gate's mummer.
     - Throws every 1.4-1.9 s.
     - At release it leads a running hero (`FK.shyLead`).
     - Coconut 14, shy-ball 18 (unblockable).
   - **Knife jugglers** (goblin archer, `juggler`, new art `bakeJuggler`). Four of them:
     - over the stall-row pincer;
     - on the far bank of the wheel's pit;
     - on the helter-skelter tower top;
     - over the exam's rick.
     - Each throws a flat knife (300 px/s) where you are going, after a told 0.45 s draw, every 1.7 s. It throws down up to 120 px.
   - **Crows** at head height, with a mummer at the foot of the maze's stair: duck the crows and the mummer is at your back.
   - A squad keeps to one floor (tools/sprinkle-cap.mjs). A roof's foes are their own squad with `cover: '<road squad>'`.
2. **Real platforming.**
   - The fallen big top: two tent poles in a 6-wide spiked pit (gate).
   - The Big Wheel over a 10-wide spiked pit: the wheel is the only way across. Board low, ride up; step off at the top onto the landing (the high road), or drop from it to the far bank.
   - The collapsing stalls: two crumbling stall roofs over an 8-wide spiked pit (src/tower-collapse.js, now run in the fair). Or climb to the top roof and ride the **bunting rope** (a slide line) down over the pit.
   - Spikes on the hall roof under swing chair one.
   - The fire chase's high lane (below).
3. **Level 1 with no abilities is a challenge.**
   - **Mummers and horses are sharper; no health added** (`FAIR_MUMMER`, `FAIR_HORSE`; the theatre's stay as they were):
     - Mummers creep at 64 (was 40), glow 0.42 s (was 0.6), hit for 22 (was 14) and recover in 0.6 s.
     - Horses hit for 30 (was 22) and charge 240 px.
     - The Queen's crowned mummers keep the plain numbers.
   - **The fair's mummers drop off a roof after you** (up to 4 rows, never onto spikes).
   - **New pincers:**
     - The pincer: one mummer on a roof drops in behind you, with the juggler.
     - A horse at the edge of the collapsing-stalls pit (its charge puts you in), with a mummer on the roof over it.
     - A horse riding the far end of the midway carousel: the ride turns your back to it.
4. **Tickets are keys.**
   - No booth. A ticket is never spent.
   - Three gates, each with a sign giving its price:
     - THE LOFT: 5 tickets, past the crow's nest.
     - THE HAYLOFT: 12 tickets, only reached by the tall striker.
     - THE BACK LOT: all 35 tickets, a hatch by the last stall. It holds the fair's own relic **THE FORTUNE-TELLER'S GLASS** (new, `handglass`: what creeps within 64 px behind you is seen) and the third silver.
   - The HUD plate reads "TICKETS n/35" and "KEYS TO THE GATES. ALL: THE BACK LOT".
   - Tickets, opened gates and struck targets survive a death on the level.
5. **Bull's-eyes open things.**
   - One hangs under wheel car 3 and goes round with it. It runs up planks to a prize shelf over the wheel.
   - One in the corn maze drops a cage's bars, with a ticket behind them.
   - The three galleries still open their planks.
6. **Hidden paths.**
   - **The door in the glass:** in the hall of mirrors, stand by the cracked panel facing the true glass and a door shows. UP takes you to the fortune-teller's room (tickets and a heart).
   - The two ticket gates (the hayloft is also a striker-launch path).
   - The back lot.
   - The two old plug cellars stay.
7. **+10. The fairground backdrop** (sub-lane, new src/redraw/fair_backdrop.js):
   - Far: harvest fields, distant bonfires and the Waymeet steeple.
   - Mid: tents, stall roofs, two lit big wheels and swaying lantern strings.
   - Near: crowd and bunting, with fireflies and sparks.
   - Dusk to night along the level and with height.
   - The effigy grows in stages behind the fair. The fourth stage stands in the world at the fire's start, BURNS with the chase, and is ash after it.
   - The wicker green is unchanged.
8. **The Wicker Queen's SPEAR replaces the sickle** (sub-lane):
   - High thrust: duck. It also hits riders.
   - Low thrust: jump. It misses riders.
   - Tell 1.1 s, with a red line running out at the thrust's height. Reach 96 px, 22 damage.
   - She thrusts only at a hero looking at her. A turned back gets the stab from behind (26), which a look in its glow cancels.
   - The floor burn is the spear butt.
   - Marks, hint lines, bestiary and art are updated. The arena sign is "SHE MOVES WHEN YOU LOOK AWAY. SPEAR HIGH: DUCK. LOW: JUMP. FLOOR BURNS: RIDE."
9. **The ghost train is gone. THE EFFIGY CATCHES FIRE** (src/chase.js, look 'fire', kill on contact, told speed-ups). Cross the start line and the effigy goes up, and the fire runs down the straw lane. You choose a lane:
   - **LOW:** burning bunting to duck or wait under (timed), two fallen stalls to hop, and two mummers.
   - **HIGH:** seven stall roofs, each giving way 0.7 s after you land.
   - The lanes meet for the climb out. The fire takes any mummer it overtakes.

## Numbers before / after

**Level-1, no-ability pilot** (tools/fair-pilot.mjs, new):
- The hero is fresh: xp 0, no skills, loadout or items, foes ON, no god mode.
- It walks the low road, turning to the nearest foe within reach (a quarter-second to react) and swinging.
- It does not block, dodge or duck.
- Same tool before and after; its route was updated for the new pits.

| hero | before (8c1e9210 + master) | after |
|---|---|---|
| knight | 95 hp lost, 0 deaths, door reached | **284 lost, 1 death**, door reached (horses 144, knives 62, mummers 39) |
| warden | 95 lost, 0 deaths | **314 lost, 1 death** (horses 160, mummers 88, knives 35) |
| pyro | 100 lost, 0 deaths | **185 lost, 0 deaths** (horses 72, knives 56, mummers 30) |

**Level quality** (fair; the Folly clears 10/10 and the theatre clears):

| measure | before | after |
|---|---|---|
| flat (empty / ground) | 4% / 26% | 4% / 22% |
| bands | 5, 44% | 5, 52% |
| mechanics | 10 kinds, 5 developed | 11 kinds, 5 developed |
| secrets | 2 | 4 |
| checks | 5, 130 tiles each | 5, 130 tiles each |
| density | 0.84 enc/screen, 22 encounters | 1.00 enc/screen, 26 encounters (1.5 foes a screen), 20% empty |
| bar | 10/10 (not gated) | 10/10, gated |

**Foes:** 27 -> 37:
- 19 mummers, 6 horses, 3 string-jacks, 2 barkers.
- Plus 1 coconut shy, 4 jugglers and 2 crows.
- Every one is in a squad or is an elite.

**Shrines:** five, unchanged (8, 199, 383, 466, 600). The barker call (0.9 s) and the dark door guard (176 / 88 px) are unchanged.

**The Wicker Queen's bossLab** (normal health, salt 1; from the spear sub-lane):

| hero | before | after |
|---|---|---|
| knight | won 77.2 s, took 50 | won 94.8 s, took 80 |
| warden | won 105.7 s, took 16 | won 112.1 s, took 69 |
| pyro | won 107.6 s, took 74 | died at 92.8 s with her at 24%, took 91 (salts 2 and 3: won 141.9 s, took 76) |

## Checks (all green on the final branch)

- harvest-fair, wicker-queen, level-quality (theatre + fair; mage 10/10)
- boss-fight-end, boss-openings, boss-jump
- architecture, checkpoints, checkpoint-gaps, skins, dangling-paths
- slopes-trace (unchanged: it does not trace the fair), slopes
- npc-removal, hint-shown, audio-assets, tells, theatre
- chase, duck, signs, sprinkle-cap, elites, one-new-foe, answer-tags, untold-told, foe-tactics, threat-holes
- collectables, keys, traps, killzones, spawns, deadends, floaters, audit, content-audit
- map-grammar, comments, homepaths, frame-cost, render-layers
- Route pilot tools/fair-route.mjs: low, high and strike roads green (knight, foes removed).

traps reports the fair's three pockets between the stall pit and the wheel pit as "ASSISTED?" (the way out is the wheel), and stays ok.

## UNVERIFIED

- Nobody has played it. Untested by hand:
  - the wheel crossing on the low road (it took the bot a 3/4 turn and a drop from the landing);
  - the knife and coconut leads;
  - the drop-off-a-roof mummers;
  - the fire's high lane timing (0.7 s roofs);
  - the 1-tile tent-pole tops.
- The pilot does its platforming perfectly (scripted hops) and has 360-degree awareness. A real level-1 player will take more from the pits and less from foes behind them.
- The door in the glass is proved pure (it shows only facing the true glass) but not walked through in the page.
- The bull's-eye on the wheel car is proved pure (it moves with the car, opens when struck where the car is) but not struck in the page.
- The backdrop's per-frame cost passes frame-cost. Its effigy fire was captured by the sub-lane with a test override, before my chase existed.
- The juggler and the stallholder have no bestiary cards of their own (they are reskins of the drunk and the archer).
- Mutation proof: the new harvest-fair assertions describe things the old fair did not have (no ranged foes, gates, back lot, bull's-eyes on rides, mirror door or fire lanes). I did not run the new test against the old build.

## QUESTIONS FOR DANIEL (each with my recommendation; the recommendation is what is built)

1. **37 foes (was 27)**: the 7 ranged reskins, two edge horses and a mummer. Rec: keep. Each one is in a designed encounter. If it is too much, cut the carousel horse (put the mummer back) first.
2. **Ticket keys survive a death on the level.** Otherwise "all the tickets" needs a deathless run. Rec: keep.
3. **The back lot needs all 35 tickets.** Some are in secrets and behind the 12-ticket gate. Rec: keep: it is the completionist's relic. A gentler option is "30 of 35".
4. **THE FORTUNE-TELLER'S GLASS (new relic)**: foes within 64 px behind you are seen (fair foes only, not the Queen). Rec: keep. It is mostly a replay prize, since it comes at the end.
5. **The fire kills on contact** (as the ghost train did), with a shrine 10 columns before it. Rec: keep.
6. **The Queen's spear thrusts only at a hero looking at her; a turned back gets the stab.** Pyro lost one of three seeds. Rec: keep, and tune after you play: ease the stab, not the spear.
7. **The mummers' roof drop** is the "AI" half of "harder mummers". Rec: keep. It is fair-only, and the scarecrows in the maze do not drop.
8. **The encounter-density ceiling is now 2.5** (the theatre reads 2.13). Rec: keep.
