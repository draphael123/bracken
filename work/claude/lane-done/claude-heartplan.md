# HEARTPLAN - Heart of the Mountain: THE FIRE DRAKE (mini) + THE DEMON KING (sky fight on the drake's back)
Lane claude/heartplan (Opus, boss design), 11-04. Brief: scratch/arc-mountain-demon.md UPDATE 11-04 17:28/17:29 + priority-1016 '!! 11-04 17:28/17:29'.
PLANNING + a node-only greybox of the drake. Nothing wired into main.js, nothing merged, no browser run. Built after the desert arc (Daniel 11-04).

## 0. What changed on the branch
- `src/fire-drake.js` - THE FIRE DRAKE as a pure fight (bog-troll style): one numbers table `FD` (the tune lane's), `geom`, `newFight`, `stepDrake`,
  `takeBlow` (B15), `fdOpen`/`fdTelling`/`readOf` (B10), `POSE` (B16 windup != release), the bot plan `fdPlan` + `PLAN` clock, `FD_SAY` lines.
- `tools/fire-drake.mjs` - node check (~1 s, no browser): B15 floor, the chain rule (lunge past the ring = JERKED, inside = bite), purse cap, the
  phase tears (once each, told, never through an opening), every told move has two poses, the bot steps outside the ring / jumps the tail / gets off a
  dive ring, beaten = it tears the last chain and falls (never killed).
- `tools/fire-drake-lab.mjs` - the NODE LAB ENTRY: a 1-D duel of the real `stepDrake` vs. a hero model per kit (reach, blow, swing time, hp, flasks,
  parry/roll) driven by `fdPlan` with the human reaction clock; prints win% / time / hp left per hero over n seeds. A first read for the tune lane
  BEFORE the drake is wired; the real number is bossLab after wiring (lane D1 below). `node tools/fire-drake-lab.mjs --n=12`.

## 1. Story beats (the order of the level's end)
1. THE SEAL CHAMBER: the caldera floor, a round obsidian SEAL in the middle, the FIRE DRAKE CHAINED TO IT by three white-hot chains (it is the seal's
   guardian, not the villain - arc doc). The chains are the seal: every chain it tears to reach you CRACKS THE SEAL further.
2. THE DRAKE FIGHT (mini). Its last chain goes when its bar empties: it lunges one final time, the chain parts, it crashes onto the seal - the seal
   SPLITS. The drake is BEATEN, NOT KILLED (it carries you next).
3. SCENE A "THE SEAL BREAKS" (~10 s, skippable on replay): white light up through the cracks, a laugh under the floor, a column of black fire; THE DEMON
   KING rises out of it HALF-FORMED (smoke below the waist, cracked obsidian skin, ember veins: "still regaining power"), rises up the crater's throat
   and the volcano ERUPTS behind him. The wounded drake drags itself up, lowers its neck to you (its duty: stop him). You climb on; it takes off.
   CHECKPOINT here (rec, Q2): a death in the sky fight restarts the sky fight.
4. THE SKY FIGHT (3 phases) on the drake's back over the erupting volcano.
5. SCENE B "THE ESCAPE" (~12 s): the last return knocks him down onto the drake's neck; you run up the back; the DRAKE twists its head and blasts him
   off (the guardian's revenge). He falls, catches himself on wings of smoke, LAUGHS, and dives into the crater - the caldera CRACKS OPEN beneath him
   (THE BREACH), corruption pouring down the mountain. The drake glides down to the crater rim and lands; you step off. Card: "HE IS NOT DONE. NOR
   ARE YOU." -> the Demon Act map; first node THE BREACH. He is the act's final boss.

## 2. THE FIRE DRAKE (mini boss) - THE CHAIN RULE
B1 (the boss is the level's rule personified): the Heart's fire half is about heat and reach; the drake is BOUND. Its chains have a drawn reach: a
SCORCHED RING on the floor round the seal at the chain's length (always visible, glows when a chain is taut).
- Its LUNGE goes straight at you. Inside the ring it BITES (red !!, roll through it or be out of the line). Outside the ring the chain SNAPS TAUT: it is
  yanked back, crashes on its side: JERKED - the gold ring + bar (B10), blows x1.75, one jerk worth at most 18% of its bar (a purse, like Bog Troll).
- Outside the ring it BREATHES: a cone that starts ~30 px from its jaw, so the safe place from the breath is UNDER ITS CHIN, inside the ring - where the
  claws and tail are. The fight is a DANCE ACROSS THE RING: out to bait the lunge, in to dodge the breath, out again.
- After the breath it PANTS (smoke from the nostrils, 1.0 s): a soft window x1.0. Outside openings its scales turn blows: x0.5 (B15 floor is 0.4;
  its ward after a jerk is x0.4, told: blazing scales, WARDED).
- Never invulnerable: in the air (the dive's hover) blows land x0.5 like anywhere else; warden/up-attacks reach it.

### Phases (one new move per phase, B5; P2 a different fight: it FLIES)
| Phase | bar | chain ring (px from the seal centre) | new |
|---|---|---|---|
| P1 THREE CHAINS | 100-60% | 110 | claw, tail, breath, lunge |
| P2 TWO CHAINS (tears one: told 1.6 s roar, the seal cracks stage 1) | 60-30% | 160 | THE WING GUST + DIVE (it flies; a dive past the ring is jerked out of the air) |
| P3 ONE CHAIN (tears another: seal stage 2, the caldera starts to erupt) | 30-0% | 205 | THE MAGMA SLAM (shockwave both ways: jump the crest) + floor VENTS erupt on a cycle (told glow) |
| BEATEN | 0 | - | it lunges once more, the LAST chain parts, it falls on the seal: scene A |

The arena is ~30 tiles (480 px) wide with the seal in the middle: the P3 ring leaves a ~20 px band at each wall PLUS two basalt LEDGES (24 px high,
outside the P2 ring) - the breath is a floor-to-chest cone and does not reach a ledge, the dive does. Ledges are the safe lure in P1, not in P2+.

### Move list (tells by phase P1/P2/P3; damage = hp off the hero; every move has its OWN windup pose, release pose and sound - B16)
| Move | mark | tell s | release | hitbox / answer | dmg |
|---|---|---|---|---|---|
| CLAW RAKE | ! yellow | 0.70/0.60/0.55 (foreleg reared, claws glow) | 0.18 s swipe | 72 px ahead, 30 high - block/parry/step out | 18 |
| TAIL LASH | !! red | 0.80/0.70/0.65 (tail coils, scale rattle) | 0.25 s sweep | 90 px behind + 40 ahead, LOW (14 px): JUMP | 20 |
| FLAME BREATH | !! red | 1.00/0.90/0.85 (chest glows through scales, neck back, inhale) | cone 0.9 s, ticks 0.3 s | 30..(ring+140) px ahead, floor to 34 px: get under the chin or onto a ledge (P1) | 9 / tick |
| PANT (after breath) | gold soft | - | 1.0 s | x1.0 | - |
| CHAIN LUNGE | !! red + taut chains glow | 0.85/0.80/0.75 (crouch, wings half open, links white-hot) | 0.35 s dash to min(hero, ring) | inside: BITE r 22 (roll / leave the line); outside: JERKED | 26 |
| JERKED (opening) | gold ring + bar | - | 3.5/3.0/2.6 s | x1.75, purse 18% of bar, then WARD 2.5 s x0.4 | - |
| WING GUST + DIVE (P2+) | !! red ring | crouch 0.8, hover 1.2 (gust pushes you 60 px/s away from the seal), ring 0.9 | slam r 34 | leave the ring on the floor; past the chain's ring the dive is jerked mid-air -> JERKED | 24 |
| MAGMA SLAM (P3) | !! red | 1.0 (both forelegs high, seal glows) | wave 175 px/s both ways, crest 9 high | JUMP the crest; vents erupt after it | 22 |
| VENTS (P3, environmental) | red glow | 1.0 glow | 0.8 s geyser, 24 wide | step off the glow | 20 |
| CHAIN TEAR (phase change) | roar | 1.6 | - | no damage; it is NOT open (B3 shell-free: blows x0.5) | - |

AI: walks inside its ring toward you (44 px/s, P3 54); close (< 80 px) claw 55% / tail 45% (tail 80% if you are behind it); outside the ring lunge 50% /
breath 50% (P2+ dive 30% of those); never the same move three times running; rest 0.55/0.45/0.4 s between moves.

### HP / EHP
- Rec EHP.firedrake = 2600 (FD.hp). Peers in the table: forgemaster 1800 (mini), lampreeve 2000 (mini), homunculus 2400, skeleton king 2400,
  undeadmage 2800, gqueen 3300. A "more complex mini" at the end of the game, first of two fights back to back -> rec band 70-80% with flasks
  (the minis' band), 75-110 s. The sky fight carries the 60-70%. (Q3.)
- Its blows on the hero sit at the late-game line (Gorm 3 P2 22-28, Bog Troll 15-24): the hero has 90-120 hp, so a bite + a tail = half.

## 3. THE DEMON KING - THE SKY FIGHT ON THE DRAKE'S BACK
### The arena (the drake's back) - a new player mode P.mount (sibling of the carpet's P.carpet, src/carpet.js)
- The view is LOCKED on the drake: the drake flies right across a 320x180 view, its BACK is a flat platform ~192 px (12 tiles) from the wing-root
  ridge behind the neck (x1) to the tail root (x0), at ~y 120. The neck/head (right) and tail (left) are drawn past it; the wings beat above/below
  (drawn, never solid). The SKY scrolls past (parallax), not the hero.
- The hero WALKS, JUMPS, DODGES, ATTACKS with the normal kit (ground physics on a moving platform: P.onMover = the back). NO FALLING OFF: the ends
  are walls (the neck's spines, the tail fin); a jump's arc is capped at the sky box top; a hit that would knock you back knocks you DOWN on the back
  (prone 0.5 s, i-frames 0.6 s) instead. No pits, no fall damage, no kill zone.
- THE BANK (the drake tilts): told by the drake (head turns, a roar, the near wing dips) 1.0 s, then the back tilts +-8 deg for 1.6 s (3 baked bank
  poses, the HUD and bolts stay level): the hero slides 30 px/s downhill (walk against it), bolts' approach angle changes. P1 every ~12 s, P2 ~9 s,
  P3 ~7 s; never during a knockdown window.
- Background: P1 circling the crater at the rim's height (the eruption below-right), P2 higher (lava bombs arc past), P3 above the ash column
  (the volcano small below, lightning in the ash).

### The reflect rule (Daniel 11-04 17:29 rec 1, approved)
- THE HELLBOLT: a red-black orb with a white core, r 7, slow (150 px/s, P2 170, P3 185), aimed at the hero's chest from where he floats.
- ANY attack that meets a bolt RETURNS it: a blow box (main.js attackBox, the archmage's `blowMeets` with its +8 px top pad) OR any hero projectile
  (arrow, pistol ball, fireball, stone shard, javelin, hammer, hatchet, frost bolt). A RETURN flies back pale gold, homing (the archmage's `homeStep`),
  210 px/s, and hits him for swordDmg x1.2 and ONE PIP.
- A PARRY/GUARD ON THE BEAT (the hero's own parry window) = a POWER RETURN: white-gold, 320 px/s, swordDmg x2.0, TWO PIPS, and he can never bat it back.
- THREE PIPS = KNOCKDOWN: he tumbles out of the sky and CRASHES ONTO THE DRAKE'S BACK (always on the back, between you and the neck): DOWNED 4.0 s
  (P2 3.6, P3 3.2), blows x1.5, gold ring + bar. Then he rises with a told REPULSE (0.6 s: arms out, a black ring) that knocks you down (6 dmg) and a
  2 s ward x0.4 while he flies back up. Pips reset.
- A held guard that is NOT on the beat BLOCKS the bolt (no damage, the bolt pops, no pip). A bolt that hits you: 14 dmg, knocked down.
- THE RALLY (P2+): he BATS a normal return back at you (tell: he raises a claw, the bolt flashes red again) - 40% in P2, 70% in P3, each volley +15%
  speed, max 3 volleys a rally; a power return is never batted. So the parry is how you end rallies quickly; any hit still works.
- RESIST FLOOR (rec 2, approved): no invulnerability exception. When he SWOOPS LOW (his non-bolt attacks) blows land x0.4 (chip). Knockdowns
  (and the returns that cause them) are the main damage. Rough budget: a knockdown cycle = 3 x1.2 + ~5 blows x1.5 = ~11 swordDmg; chip adds ~10%.

### Per-kit reflect table (every hero can return every bolt; the "power" column is that kit's on-the-beat move)
| Hero | normal return (any of) | POWER RETURN (2 pips) | notes |
|---|---|---|---|
| Knight | sword cut, shield bash, heavy cut, pogo off it | PERFECT GUARD (C raised as it lands) | held shield = block, no pip |
| Warden | any thrust (tip or haft), UP+X for overhead bolts, javelin | C DEFLECT on the beat ("swats what flies at her") | the long reach makes her the easiest returner: tip return x1.3 like her tip rule? NO - one flat return value for all (fairness) |
| Pyromancer | staff cut, held fireball (any step), fire stomp ring | FLAME WARD tapped on the beat | a step-3+ fireball meeting a bolt explodes AND returns it (one return, not two) |
| Freebooter | cutlass, pistol ball | HOOK CATCH on the beat ("flings an arrow back") | the hook catch seats the pistol as usual |
| Paladin | maul, hammer throw, verdict strike (if it meets) | LIGHT-WARD raised on the beat (perfect guard) | held light-ward = block |
| Geomancer | stave, stone shard, fault-line spike | RUNE-WARD raised as it lands (already "throws a shot back") | a held rune-ward = block; pillars do not stand on the back (rec: her stones plant flat on the drake - Q5) |
| Blood Knight | red rhythm cuts, blood lash, crimson crescent wave | a FIVE-TIER HEAVY released as it meets the bolt (tier 2+) | he has no tap parry: his "bigger return" is the timed heavy |
| Berserker | flurry, chops, whirl, hatchet | TAKE IT (hold C) raised as it lands | |
| Ranger | any arrow (tap or drawn), knife, DOWN+X shot | a STEADY SHOT (released in the steady window) through the bolt | arrows dropped on the back are walked over as usual (they stay on the drake) |
| Rimebinder (mountain arc hero) | staff, frost bolt, rime lance | ICE WALL tapped on a blow (her parry) | thralls do NOT return bolts (no free pips) |
| Demon Hunter (demon act hero; only if he exists before this fight is replayed) | blades, dash-through cut | the dash on the beat (i-frame pass through the bolt) | |
| any 12th / future hero | any blow or shot | its tap-C guard on the beat; with no tap guard, its charged release | the rule a new hero inherits by default |
Co-op: either hero returns; pips are shared; a knockdown lands between the two.
Bolt height: P1 bolts come at chest height (a forward blow meets them). P2 adds HIGH arcs over the hero (UP attack / up-air / a jump cut). P3
mixes both. Every hero has an up attack or a jump cut that meets a high bolt (checked per kit in lane S3).

### Phases (P2 and P3 each a different fight: one new mechanic each, per Daniel's list) - bar 3 x 1200 = EHP 3600 (rec)
| Phase | his bar | new | knockdowns to clear (at ~11 swordDmg each, L40 ~30 swordDmg -> ~330 a cycle) |
|---|---|---|---|
| P1 PLAIN BOLTS | 1200 | single hellbolts (every 2.4 s), THE CLAW SWOOP | ~3 |
| P2 FAKE-OUTS + DOUBLE BOLTS | 1200 | the FEINT, the DOUBLE BOLT, THE RALLY (40%), THE CHAIN WHIP, high arcs | ~3-4 |
| P3 IMPS | 1200 | IMPS land on the back while he fires; LAVA BOMBS from the eruption; rally 70% | ~4 |
Phase change: at a phase's empty bar he is knocked down one last time, screams, the volcano erupts higher, the drake climbs (5 s, a breather,
no damage either way), music lifts.

### Move list (Demon King)
| Move | phase | mark | tell s | release / answer | dmg |
|---|---|---|---|---|---|
| HELLBOLT | all | ! (a returnable gold ring round the bolt) | 0.70/0.60/0.55 (palm up, the orb grows, rising choir hum) | arm thrown forward; return it | 14 + knocked down |
| FEINT | P2+ | the orb grows DIM and flickers, no white core | 0.6 | he pulls it back (nothing flies), the REAL bolt 0.4 s later (white core) - a swing at the feint is wasted | - |
| DOUBLE BOLT | P2+ | two orbs, one per hand | 0.8 | two bolts 0.35 s apart (one chest, one high in P3): two returns = two pips | 14 each |
| RALLY (bat back) | P2+ | he raises a claw, the bolt flashes red | 0.25 | the bolt comes back 15% faster; return it again | 14 |
| CLAW SWOOP | all | !! red line drawn across the back at head height | 0.9 (rises, cape flares, a shriek) | swoops low across the back 0.5 s: DUCK/roll/jump; he is LOW: x0.4 chip | 18 |
| CHAIN WHIP | P2+ | !! the seal's broken chain glows HIGH or LOW | 0.85 | a lash along the back: LOW = jump, HIGH = duck; he hangs low 1.0 s after: chip x0.4 | 20 |
| IMPS | P3 | two glyph rings on the back where they land | 1.0 | two imps (existing 'imp' foe, 20 hp, reskin demon-red) claw you while he fires; cap 2 alive | 8 |
| LAVA BOMBS | P3 (environment, told by the eruption) | red rings on the back | 1.1 | step off the rings; the drake banks to throw some off (a bank tilts the rings) | 16 |
| REPULSE (after a knockdown) | all | black ring | 0.6 | knocked down, then his 2 s ward | 6 |
A mash bot must lose: mashing returns some bolts but never parries, eats feints, and the swoop/whip punish it (lane S5 checks mash 0/6).

### HP / EHP vs the table
- EHP.demonking = 3600 as three 1200 bars (Gorm pattern: hp1/hp2/hp3). Peers: gqueen 3300, tollmaster 3450, grubbag 3600, lance 4650.
- Win band 60-70% WITH flasks (Daniel's target) for the sky fight, checkpoint at its start (Q2). Fight 120-170 s.
- The drake (mini) 2600 at 70-80%.

## 4. Art list (art before live - both fights ship only after their art merges)
FIRE DRAKE (grounded, ~96x64, a Lambton-worm wyrm: long body, two forelegs, short wings, horned head, ember-lit belly scales):
idle 4, walk 4, claw tell/release 2, tail tell/release 2, breath tell (chest glow) + breath cone fx 3, pant 2, lunge tell/dash 2, JERKED (on its side) 2,
rise 2, chain-tear roar 2, takeoff 2, hover wingbeat 4, dive tell/dive 2, magma slam tell/release 2, collapse on the seal 3, the B16 poses = 20 pictures.
Chains: link sprite 6x4 + procedural sag/taut line, taut glow; the SEAL dais (obsidian + runes, 3 crack stages + light shafts); the scorched RING decal
(3 radii); basalt ledges; floor vents (idle/glow/geyser 3); caldera backdrop (lava lake, crater walls, the magma glow rising in P3).
DRAKE MOUNT (flying, side view ~300x90, the same drake): flap cycle 6, glide 1, bank-left/bank-right 2, head-turn roar 1, flinch 1, final blast 2.
The back as a tile-like strip (scales, wing-root ridge, neck spines = the wall, tail fin = the wall).
DEMON KING (~40x56 floating, half-formed: no legs - a smoke tail; horn crown, cracked obsidian skin, ember veins, the broken seal chain on one wrist):
float idle 4, bolt windup 2 + release 1, feint (dim orb) 1, double-bolt windup 1, bat-back 1, swoop tell/swoop 2, chain whip tell high/low + release 3,
summon 1, tumble 3, downed on the back 2, rise + repulse 2, scene poses (rising from the seal 3, laugh 2, smoke wings + dive 3).
BOLTS: hellbolt (orb + core, 2 frames), feint orb, normal return (pale gold) + trail, power return (white-gold) + trail, pips HUD (3).
IMPS: reskin of the existing 'imp' foe (demon red) + glyph landing ring.
SKY BACKGROUNDS: 4 parallax layers x 3 altitudes (ash sky with red under-glow, distant ranges, the volcano cone + eruption + lava fountains animated,
passing ash clouds/foreground embers), lava bombs, lightning in the ash (P3).
SCENES: seal break light column, eruption plume, the Breach crack opening (crater top-down-ish side view), rim landing.
SOUND (own per move, B16): drake roar, inhale, claw scrape, tail rattle, chain clank / taut twang / snap, wingbeat, dive whistle, magma slam, vent hiss;
demon bolt hum, feint fizzle, return crack, power-return chime, bat-back, swoop shriek, chain whip crack, knockdown crash, imp shriek, laugh.
MUSIC: CC0 downloads, Daniel's go before each (two tracks: the drake, the sky fight; the escape can reuse the sky theme).

## 5. Build plan (sonnet-sized lanes; Opus only where the memory rule says boss/new-foe) - total ~29% of a day's credit, ~2 working days
| Lane | model | what | needs | effort |
|---|---|---|---|---|
| D1 DRAKEWIRE | opus | `src/fire-drake-hands.js`: wire this branch's module into main.js (spawn 'firedrake', EHP.firedrake, chains/ring/vents draw greybox, hit/hurt glue, B10 read, lines into hint-lines, bossLab hands + `fdPlan`), arena in the Heart greybox | the V3 level greybox (or a lab room) | 4% |
| D2 DRAKEART | sonnet | the drake sprite set, chains, seal stages, ring, vents, caldera backdrop, sounds | D1 | 3% |
| D3 DRAKETUNE | sonnet | bossLab n=6 per demo-band hero -> 70-80% with flasks, mash 0/6 | D1+D2 | 2% |
| S1 SKYMOUNT | opus | P.mount mode: the back as a moving platform, walls at the ends, knock-DOWN instead of knock-back, the BANK, parallax sky scroll, co-op both on the back | - | 4% |
| S2 DEMONKING | opus | `src/demon-king.js` pure (moves, pips, rally, knockdown landing on the back, phases, imps/bombs) + `src/reflect-kit.js` (the per-kit table above as data: which verbs return, which are power) + node check | S1 for the hands | 4% |
| S3 REFLECTKIT | sonnet | per-hero probes: every hero x {chest, high} bolt x {normal, power} returns as the table says; projectiles meet bolts | S2 | 2.5% |
| SC SCENES | sonnet | scene A (seal breaks -> mount) + scene B (escape -> THE BREACH card -> map), skippable on replay, ends on the map | D1, S1 | 2.5% |
| S4 SKYART | sonnet | drake mount, Demon King, bolts/returns, imps reskin, 3-altitude parallax, scene art, sounds | S2 | 4% |
| S5 SKYTUNE | sonnet | bossLab n=6 -> 60-70% with flasks, mash 0/6, per-hero floor 40% | S3+S4 | 3% |
Order: D1 -> (D2 || S1) -> S2 -> (S3 || SC || S4) -> D3 + S5. Nothing goes live before its art merges.

## 6. Questions for Daniel (each with the rec; the rec is what this plan and the greybox build)
1. Is the drake KILLED or BEATEN? REC: BEATEN, not killed - it carries you in the sky fight and blasts the Demon King off at the end (the arc doc's
   "killing it is the mistake" becomes "beating it - tearing its chains - is the mistake"). Built that way: hp 0 = it tears the last chain and falls.
2. Checkpoint between the two fights? REC: YES, a checkpoint (a shrine) at the end of scene A, and the sky fight restarts at mount-up; flasks refill
   there as at any shrine. Back-to-back with no checkpoint would make the drake a 3-minute tax on every sky-fight retry.
3. Drake band? REC: the drake is a MINI at 70-80% with flasks (first of two); the sky fight carries 60-70%.
4. The drake's opening = the CHAIN RULE (bait the lunge past the ring: JERKED x1.75)? REC: yes (as greyboxed). It ties the fight to the story - its
   own lunges tear the chains that hold the seal.
5. Geomancer's stones / pillars on the drake's back? REC: her stones plant FLAT on the back (no pillar step, no wall) - a pillar would be a free
   platform over the bolts; her rune-ward stays (it is her parry).
6. What is the 12th hero? REC: the table covers the 9 live heroes + Rimebinder + Demon Hunter; any future hero inherits "any blow/shot = return,
   on-beat tap guard (or charged release) = power return". Tell me the 12th and lane S3 adds its row.
7. Should a POWER RETURN be 2 pips or just faster/harder? REC: 2 pips (a parry visibly speeds the fight up; the mash bot never gets it).
8. The rally: does he bat returns back in P1 too? REC: NO - P1 teaches the plain return; the rally starts in P2 (40%) and P3 (70%).

## 7. Checks run
- `node tools/fire-drake.mjs` - see the run line in the commit / below.
- `node tools/fire-drake-lab.mjs --n=12` - first read below (a 1-D model, NOT bossLab: the tune lane re-reads after wiring).
- No browser run (none needed: the module is pure and not wired). No suite run (nothing in main.js changed).
