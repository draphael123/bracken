# claude/deeprails3 - DEEP RAILS 3 + THE FOREMAN (cart mini) + GREAT DRILL 3 (Opus greybox, 2026-10-11)

Base: origin/claude/batch86 06c0f5e3. Brief: scratch/brief-deeprails3.md (Daniel 10-10 live). Port 8848. Opus built level + mechanics + boss and STOPPED: a Sonnet
TUNE lane (Foreman + Drill numbers) and a Sonnet ART lane follow (art list below). Every open choice built as recommended (questions at the end).

## SECTION MAP (src/minecart.js, columns)
| cols | area | what is there now (new in **bold**) |
|---|---|---|
| 0-170 | THE LAMP YARD (teach) | gap, beam, pump gap, ram, crusher, the yard points; **DUCK + SWITCH TAUGHT in the tunnel: low roof 146-160, beam 147, switch `yardSw` 151, bridge 154-159 (a cheap fall)**; station one moved 148 -> **164** |
| 171-309 | THE DARK DRIFT (test) | **DUCK + SWITCH TESTED in the pitch dark: low roof 174-188, beam 177, switch `driftSw` 180, bridge 182-187** (the old tippler ledge and the upper rail there removed); fork A (+ a bat at 206), hidden lever, spur |
| 310-471 | THE GOBLIN LINE | rail breaks, rock, thrower, rider, caster, slow cart; **A GOBLIN ON A ROOF TIMBER (perch, 437) over the low beam 440: he chops as you pass - duck, or cut him off** (replaces the gl4 pair); exam gap |
| 472-624 | THE GLOW CAVERN | unchanged (cave-in chase, the fork at speed, the lava ramp) |
| 625-675 | THE WRECK (on foot) | unchanged |
| 676-760 | THE CRUSHER WORKS (remix) | **a miner on the line at 688 (ram)**; crushers, gate; **A RIDER WHO SWINGS IN (hook miner on the parallel line, 718)** replaces the archer pacer; the works' deep gap 736 (exam); **DUCK + SWITCH REMIXED off it: low roof 748-760, beam 749, switch `worksSw` 752, bridge 754-759 (cheap)**; the lift stretch starts at **761** (was 758) |
| 761-785 | THE LIFT (on foot) | unchanged (buffer 762, station 772) |
| 786-899 | THE FLOODED RUN (exam) | the junction, the deep gap 813; **THE FOREMAN'S LOOP 822-851 (THE MINI)**, his gate at 852; **DUCK + SWITCH EXAM: low roof 855-868, beam 857, switch `examSw` 860, bridge 862-867 over the flood (a REAL death, told)** straight into the last deep gap 870 (duck, switch, pump, jump); the rune caster on the lip removed |
| 900-959 | THE SMELTER / THE BORE | smelter points; **A GOBLIN WHO LEAPS onto your line off his ledge at 948 (told: '!' + his shadow on your rail; brake off it, then ram him)** replaces the bore miner |
| 960- | THE GREAT DRILL | GREAT DRILL 3 (below) |
ARCS (tools/minecart.mjs reads them): points / speed / combat as before (combat exam = the Foreman's loop) + **switch: teach 146-160, test 174-188, remix 748-760, exam 855-868, boss (the drill's chute points)**. TELL_LINES regenerated from the tells (32; every new one 5 words, 2.2-5.2 s ahead, 1.8 s apart).

## THE FOREMAN - THE CART MINI (src/foreman.js pure + src/minecart-hands.js; L.mini boss 'brute', mini:true, wKey 'foreman', foeHp x22)
- An ENDLESS LOOPING STRETCH (822-851): the Great Drill's treadmill (H.treadmill) - the world runs past at cruise, his cart and yours hold their places; the tunnel is drawn
  edge to edge (MCA.tunnel, a new `wet` variant: trestle legs over black water; nothing static drawn over it). One line: a high line over it caught every jump, so it was
  removed - THE JUMP GOES ON HIM. The loop's line is solid (no gap: a shake-off never kills). The mini room's wall/gate/camLock are main.js's (miniActive), his gate at 852.
- His ARMOURED cart shuttles on your line ahead of you: DRIFT (told: HE SLOWS + brake sparks + '!', 0.55 s, then he drops back at you - 72 / 96 / 120 px/s as he is
  stomped: the told speed change), PICK ('!' 0.75 s, a pick lobbed at where your cart will be - its mark slides on the running rail; stomped once he throws a second a beat
  later), RAM (from the first stomp: '!! HE BRAKES HARD: RAM', red shoes + a red sweep box, 0.95 s, then ~125 px back down the line: brake out of its reach, or jump).
  One move at a time. Met in your cart he is a BUMP (armoured: 10, thrown back); his ram 20; the pick 15.
- THE KEY (B14 FROM ABOVE): land on him from above - the game's own head-stomp (src/main.js -> MCH.stomp), a plunge (knock with pl), or coming down into his tub's space -
  BOARDS him: a STOMP takes 25% of him, you stand on his cart (pinned; your own cart drawn rolling on under you), he is OPEN (gold ring + timer bar: blades whole) for
  0.85 s, then '!! HE LURCHES' (0.75 s, the cart rocks) throws you up and back INTO YOUR OWN CART (+0.8 s inv), then a told 3 s BRACE (B3: lid spikes up; a landing then is
  turned - a clank + 'BRACED', 4%). Jump off early and he braces at once. Blades from your own cart clank x0.4 ('ARMOURED: JUMP ON HIM', B15). Four boardings at most.
- The tells inside the level are held while he rides (nothing told over his fight); 'THE FOREMAN: JUMP ON HIM' before the loop. Stuck spot 'mc-foreman' re-lined.
- Spawned in his cart at load (he waits on his loop: the game, the lab and boss-fight-end find him alive); his fight starts when the lead hero rides past the trigger.
- Lab bot (src/lab.js branch + foremanPlan): holds its place, jumps as he drops back (a reaction late, misses 12%), brakes out of the ram, off the pick's mark, strikes aboard.
  Cart pilot (tools/cart-pilot.mjs foreman()): the same, in the level.

## CART COMBAT 2 / DUCK + SWITCH
- Perch, swing rider, jumper (MC.perch*/swing*/leap*): all EXISTING foes (miner), told ('!' + the chop line / the hook / the shadow), the chop ducked with the beam's own
  duckClears; a blow knocks the perched / swinging goblin off (dies); the leaper lands and is a goblin on your line (ram / bump / strike).
- SWITCHES are levers with `sw: true` (the yard points' machinery): the bridge is OUT by default, laid by a blow or E; drawn broken (ends, a hanging plank, red pips,
  'BRIDGE OUT') until laid; glint ring until set; 4 stuck-spot entries (mc-yardSw/driftSw/worksSw/examSw). Under a LOW ROOF (rock 3 rows up) the cart cannot jump the
  6-wide bridge (probe: a pumped hop rises 18 px and falls in, every switch, tools/minecart-route.mjs --probe).

## GREAT DRILL 3 (src/great-drill.js, src/great-drill-hands.js)
- THE OPENING = THROW THE POINTS (B1): every ore cycle the chute rattles (ORE!) and its POINTS LEVER rises 230 px ahead and comes down the tunnel (a tall trackside post:
  a blow or E from ANY line - every hero, from the cart; brake to read it). Thrown -> the chute dumps its own ore into its gears: JAMMED 4.6 s (gold outline + timer, cab x2,
  capped), then the told 3 s ward (no lever, an ore cart shrugged off). Missed -> it kicks the ORE CART off its back (the ram, kept as the bonus way).
- NEW MOVES, one windup at a time: P1 DYNAMITE (the driver's arm 0.5 s, then a fizzing stick on your line sliding at you, 1.3 s fuse: change line, brake, pump past or be in
  the air); P2 SPIN-UP LUNGE (1.0 s whine + sparks + a red head-height line down your line, then its head along it at head height: DUCK in the tub) and GRAPPLE CHAIN (0.9 s
  the hook swings, flies 0.3 s; on your line on the rail = SNAGGED: dragged at its rear until you JUMP or STRIKE - CHAIN CUT); P3 the roof takes the HIGH line + ROOF
  COLLAPSE (1.25 s dust + shadows over every line on two spots - where you hold and 150 px ahead: pump through or brake). Kept: reverse ram, boulders (P1). Spark spray retired.
- Bot (drillPlan): throws the lever as it passes (E, misses 12%), ducks the lunge, jumps a snag, brakes/changes line off dynamite and the roof. Bestiary text updated.

## THE CURVE (act-1 row: was 270% > 250)
- tools/level1-pilot.mjs now gives a CART level the CART PILOT's hands (tools/cart-pilot.mjs, ROUTE_PLAN + fight) instead of the walker's; in a cart level's mini the
  pilot fights it out (a waypoint lift there is a teleport INTO the mini room, which had the knight dying in the loop every run). --events now names each death's spot.
- One hazard softened (Daniel: soften now): THE FOREMAN's hits (pick 20 -> 15, bump 12 -> 10, ram 22 -> 20, +0.8 s inv after his lurch).
- STAMPED: curve **108% / 2 deaths** (band 40-250%, 0-3 deaths) - green; pilot 28 blows / 2 deaths / walked 100%.

## CHECKS (PORT 8848, page runs one at a time) - green unless said
- tools/minecart.mjs 363 (rewritten where the design changed: the Foreman elite block -> the Foreman MINI block; the GREAT DRILL 2 spark-spray / P2 asserts -> GREAT
  DRILL 3's lever opening, four new moves, their dodges, the bot; NEW blocks: cart combat 2, duck + switch - low roof, a pumped hop under it short of the bridge, the pit,
  told, exam = real death / else cheap). Every old promise that still holds is still asserted.
- level-quality minecart: CLEARS THE BAR - incl. **curve 108% / 2 deaths (act-1 band)**, pilot, mash (boss 0/6, mini 0/6, level: every hero dies), density (28% empty).
- Re-stamped LEVEL then BOSS: docs/level1-curve.json, docs/level1-pilot.json, docs/mash-bot.json (mash level knight/warden/pyro lowest 0%, 4-5 deaths; drill 0/6, dead in
  32 s; Foreman 0/6, dead in 36-47 s).
- minecart-route: base inputs x3 (god, no foes) ride; **L13 with foes x3 ride every leg incl. the Foreman** (239-254 s); --probe: every pump gap, the ramp, and **every
  bridge left out** (a pumped hop under its roof falls in). **WIRED into tools/check.mjs** (flake fixed: 110 s a leg, the cart's history cleared on a station put; the
  suite run = probe + the knight's base ride).
- boss-openings (2 new sections): GREAT DRILL - a minute left alone opens nothing; its points lever thrown jams it **4.6 s**. THE FOREMAN - a minute left alone takes nothing
  and never opens; a jump onto his cart stomps 555 / 1848 and opens him 1.7 s, then lurch + brace. boss-fight-end: all 61 fights end (15 minis incl. the Foreman).
- elites (minecart is now a level with a mini: no gated elite wanted - stated in tools/elites.mjs), reach-heroes (8 route targets, every hero), stuck (static + runtime: the
  4 switch spots + the re-lined Foreman spot), deadends, one-new-foe, checkpoint-gaps, collectables, spawns, killzones, solid-islands, tells, mark-integrity, untold-told,
  signs, hint-shown (17 new lines routed, 6 dead drill lines removed), minecart-aloft, corpses, mobile-perf.
- textfit (scoped hints,bestiary,boss): did not conclude - the page stopped answering a key event for 15 s (the PC was loaded). Re-run it in integ.
- NOT run: the full suite (shared PC).

## 3-SEED SANITY (tools/boss-rates.mjs --ways=practiced --seeds=3 --profile=human, flasks kit, L13) - NOT tuned: the Sonnet tune lane follows
- GREAT DRILL 3: knight 3/3, warden 3/3, pyro 3/3 = **100% (HIGH; band 60-70)**; fights 77-97 s (knight, warden), 122-132 s (pyro) - band 90-150; taken 77-182.
- THE FOREMAN (mini): knight 3/3, warden 3/3, pyro 3/3 = **100% (HIGH; band 75-85)**; fights 28-67 s (band 40-75); taken 0-33. The lab bot reads him perfectly (brakes off
  every pick mark and ram; boards with a 12% miss). For the tune lane: the second pick cutting off the brake, a faster phase-3 drift, a harder bump on a missed boarding,
  his HP (foeHp 22) - and the mash check after each turn.

## ROAD WARDENS (claude/order not in this base) - where an ORE-chapter Warden exam would go
- THE WRECK's loading deck (645-662, on foot): the level's only real footing fight (the deck brute at 660 is the slot). An ORE-plated knight (heavy / throw key) holding the
  yard before the waiting cart (674), with the SNUFF: the yard's lanterns go out round him (lamp-smash darkness). Nowhere else in a cart level can a knight stand and fight;
  the Foreman stays the exam's mini.

## ART LIST FOR THE SONNET LANE (every new thing is a greybox shape in src/redraw/minecart_art.js or the hands)
1. THE FOREMAN: a foreman cnSkin (hard hat, lamp, whip) SEATED in the armoured cart (he stands at brute size now); tell poses - drift (leaning back, shoes glowing), pick (arm
   back), ram (braced, red shoes), lurch (the cart rocking), stomped squash; the BRACE lid spikes (MCA.fmSpikes); dents per stomp.
2. The hero STANDING on the Foreman's cart rim, and his own EMPTY cart rolling under him (heroCart 'empty' is used now).
3. THE FOREMAN'S LOOP backdrop: a flooded-run variant of the drill tunnel (MCA.tunnel wet: trestle legs over black water) - cold teal, its own lamps: THE FLOODED RUN, not the bore.
4. LOW ROOF (MCA.lowRoof): a timbered low ceiling + props, per area palette (yard / dark drift / works / flood).
5. SWITCH: its own lever (a red-handled bridge switch, not the points' disc) + THE BRIDGE (MCA.bridge): a hinged span that swings down into place when struck; broken ends while out.
6. PERCHED GOBLIN (roof timber MCA.perchBeam, crouch, chop, knocked-off fall); SWINGING RIDER (hook on a pole, the swing); LEAPER (ledge crouch, leap arc, landing dust, shadow).
7. GREAT DRILL 3: the chute's POINTS LEVER post (MCA.mast reused) + the dump (ore pouring into the gears); the driver's DYNAMITE throw + a fused stick (MCA.lobbed reused); the
   SPIN-UP cutter head on a boom from its rear (greybox lines); the HOOK + chain; ROOF COLLAPSE rubble; the P3 gouges.
8. SFX: spin-up whine, chain rattle, fuse fizz, stomp clank (mapped to existing sounds now). Bestiary card + text for THE FOREMAN as a mini.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. The Foreman's loop has ONE line: a high line over it caught every jump, so you could never come down on him. Rec: keep (the ram is braked, or jumped).
2. His opening is the STOMP (25%) + 0.85 s aboard, then the lurch - not a 3 s window (the brief's >= 3 s is the drill's: its jam is 4.6 s). Rec: keep - a mini, a duel of jumps.
3. The curve keeps the act-1 band (40-250%) the brief names, though the road puts the Deep Rails in act 2 (Ore Road -> Deep Rails -> Stormhold). Rec: keep (green at 108%);
   alt: add minecart to ACTS[1] in src/foe-react.js (it also moves its foes' damage tier) - not done.
4. The chute's points lever passes at cruise: ~0.4 s to strike / E, ~1.5 s if you brake. Rec: keep (brake to read it is the cart's verb).
5. The GREAT DRILL 2 spark spray is retired (the lunge is the rear's line attack). Rec: keep.
6. Old saves that cleared the Deep Rails meet the Foreman mini on a replay. Rec: keep.
7. Station one moved 148 -> 164 (past the switch teach). Rec: keep.
