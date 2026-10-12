# claude/deeprails4 - DEEP RAILS 4: the fixes, GREAT DRILL 4's GEARS, THE TWIN LINES (switch sides), THE RAIL RAIDERS (Opus greybox, 2026-10-12)

Base: origin/claude/foremanrim 33d0714c. Brief: scratch/brief-deeprails4.md (Daniel played DR3 live 10-12; photo scratch/daniel-dr3-drill-floor-1012.jpg). Port 8868, page runs one at a time.
Opus built mechanics + boss AI and STOPPED before the 12-seed tune: a Sonnet ART lane (list below) and a Sonnet TUNE lane follow.

## FIXES
1. DUCK + SWITCH ROOM (commit 6b4c7bb4). Each switch's beam moved back / its bridge moved on, and a switch answers E from MC.swReach 46 px (points stay 30) and a blow on its whole
   stand. Beam's far edge -> bridge: was 48 px at three of four switches (0.32 s at cruise), now 96-112 px (0.64-0.75 s at cruise; at a held brake, a crawl, 2-2.2 s).
   yard: beam 145-146, switch 151, bridge 156-161 (roof 143-163). drift: beam 174-175, switch 180, bridge 183-188. works: beam 749-750, switch 755, bridge 757-762 - THE LIFT's
   foot stretch starts at 763 (was 761; its buffer 764). exam: beam 929-930, switch 935, bridge 937-942, the last deep gap 945 (all +70 now, see THE TWIN LINES).
   Real deaths stay where they were (the exam bridge, the deep gaps). tools/minecart.mjs asserts >= 0.6 s at cruise beam -> bridge and swReach >= 44.
2. A STATION RIGHT AFTER THE FOREMAN (6b4c7bb4): his gate is at 922 (was 852), the station at 924 (was 854) - a death in the duck + switch exam, the last deep gap or at the drill
   comes back there, never before him. The station that stood past the exam (903 then) is MOVED, not added (A10b: 6 stations; checkpoint-gaps green; the post-Foreman one is
   the door checkpoint before the drill). Asserted (a station within 4 of his gate, none between it and the arena).
3. THE GREAT DRILL's VULNERABLE READ (4fc6c861): jammed, the whole rig SLUMPS (nose down about its rear foot, eased in over 0.25 s), its bit stops and SMOKES, sparks spit from
   the bit and the gears, the driver slumps over his levers (eyes shut, stars) - and it LIFTS back over the window's last 0.4 s, then the ward. The gold outline + timer (B10) stay.
4. THE FLOOR (4fc6c861): the tunnel's brick courses under the low line (Daniel's photo: "reads as a wall") are a FLOOR now - riveted diamond-tread plates under the line, a
   hazard-striped edge lip, the rail bed falling away in foreshortened rows. Collision untouched.
(Fixes 3+4 landed in one commit with the gears: they share the rig/tunnel drawing.)

## GREAT DRILL 4 - THE GEARS (Daniel: each gear powers one attack, break one = that attack gone for the phase; ~half gears, half body)
- THE GEAR TOWER up its rear face, one bank per height, each driving one attack (src/great-drill.js GEARS):
  CHAIN WINCH (the grapple chain) - the gear housing, struck standing on the LOW line; SPIN-UP GEAR (the lunge) - under the deck's lip, struck from a JUMP off the LOW line;
  DYNAMITE FEED (the dynamite) - on the deck, struck from the MID line standing back from the cab; ROOF WINCH (boulders P1, roof collapse P3) - the mast head, the HIGH line
  (P3, the high line down: a JUMP off the MID line). The reverse ram is the drive itself: no gear stops it.
- A phase shows only its attacks' banks: P1 dyn+roof, P2 chain+lunge+dyn, P3 all four (the others are shuttered). Gears are foes of their own ('drillgear', like the kraken's
  arms: every hero's blow, shot, skill, burn finds them), always hittable, whole blows (no armour), 120 hp each (greybox). Broken: it smokes, sparks, stops, the attack is GONE for
  the phase (a windup of it cancelled), and the rig STALLS - the shared OPEN read on the cab, 3.0 s, its own smaller purse (5%), then the B3 ward. A new phase bolts on new gears.
- HALF GEARS / HALF BODY (rec, built): ITS GEARS HOLD IT - at each phase line (60%, 30%) and at its end the drive will not give until HALF the phase's banks are broken
  (1 of 2, 2 of 3, 2 of 4). A blow that would cross a shut line stops at it and the rest is HELD (B15: not lost - 'ITS GEARS HOLD IT: HIT THE GEARS', up to 12% of it) and lands
  the moment a gear opens the gate ('THE DRIVE GIVES'). Once a gate opens, no blow runs past the NEXT line. The bar name says GEARS n/need while a gate is shut; a blinking
  'ITS GEARS HOLD IT: BREAK n MORE' over the cab at the line. So the body alone never passes a line and the gears alone never empty the bar.
  Enforced on what LANDS (src/main.js, after every multiplier and finisher), and on burn/bleed ticks.
- B11/B14 read: a turned blow on the armoured cab alternates 'ARMOURED: HIT THE GEARS' / 'ARMOURED: THROW ITS POINTS' while gears are up; a blow on a broken bank says BROKEN.
- B16: each gear-driven windup has its own rig pose (dynamite: rears and the cab arm; lunge: crouches nose-down; chain: rears back; rocks/collapse: heaves and shudders) and its
  gear SPINS UP (glows, whirs, its label lights) through the windup - the tell names the gear.
- Bot (drillPlan): while a gate is shut it breaks a bank (its own line's first, else dyn, chain, roof, lunge), standing back on the bank's line or jumping and striking rising;
  every dodge still wins over it. tools/drill-gears.mjs measures the split; tools/drill-trace.mjs traces a fight (phase, hp, gate, held, gears).

## SWITCH SIDES - THE TWIN LINES (786-856, a new section; everything after it moved +70: the flooded run 856, the Foreman 892-922, the smelter 970, the drill 1030, W 1070)
- Two lines through the works' last yard: HIGH (row 27, on trestles; you come off the lift on it) and LOW (row 30, the yard floor). Each stretch is blocked on BOTH sides: a
  LOW BEAM on the low line (DUCK) and a GAP in the high line over it (JUMP) - pick your side. Change sides by a SIDE SWITCH (the level's verb: a points lever on the high line,
  thrown OPEN it drops you to the low line - drawn as a two-armed post, green/blue lamp) or the cart's jump (low -> high) / down + jump (high -> low). A fall through a high gap
  lands you on the low line at its beam (cheap: duck as you drop).
- TEACH 790-800 (sign + tell 'HIGH: JUMP. LOW: DUCK', switch twinA), TEST 804-814 (no sign; the ORE over the high gap - only the high line's jump takes it - and the low side's
  mend + coins), REMIX 830-841 (switch twinC, the split with a raider alongside), EXAM: the flooded run's fork made a split - HIGH: a gap (868-870, over the low beam) then a
  crusher (moved 870 -> 873) / LOW: the beam then the gate. ARCS.sides, asserted (gaps over beams, low line under, a switch before each, one-side rewards, the exam fork).
- The ore that hung over the goblin line's caster (400) moved to the twin lines (still ten).

## THE RAIL RAIDERS - CART COMBAT 3 (in the twin lines, 806-858)
- Goblin miners in carts (EXISTING foe + the riders' machinery: A9 - no new foe type) that roll up from behind and sit ALONGSIDE on the OTHER line: told THROW ('!' + arm back,
  0.7 s: a pick at your mark - brake off it), told BOARDING ('!!' + a crouch on the rim + a plank sliding out, 0.85 s, and his shadow on your rail: then the leaper's leap onto
  your line ahead - brake off the shadow, then ram him / strike). His tub rolls on empty. Strike across (a jump-cut up to him, a drop-cut down) and he is knocked off. On YOUR
  line he rolls ahead at his own pace (pump and RAM him into the rails); behind you he drops back. They hop the twin lines' gaps and peel off down a siding at 858.
  Tell 'RAIDERS ALONGSIDE: RAM OR STRIKE'. Asserted.

## CHECKS (PORT 8868, one page run at a time)
RESULTS_PLACEHOLDER

## 3-SEED BOSS SPOT (boss-rates minecart --ways=practiced --seeds=3 --profile=human, kit flasks, L13) - NOT TUNED (the Sonnet tune lane: 12 seeds)
SPOT_PLACEHOLDER

## ART LIST FOR THE SONNET LANE (greybox now: src/redraw/deeprails4_art.js, minecart_art.js rig/tunnel, the hands' calls; pictures work/claude/shots/dr4/, tools/dr4-shots.mjs)
1. THE GEAR TOWER (MCA.gearTower): four banks on a riveted mast up the rig's rear face - each its own look (a winch drum + chain for the CHAIN WINCH, a boom pivot for the
   SPIN-UP GEAR, a stick hoist feeding the cab window for the DYNAMITE FEED, a jib + cable to the roof for the ROOF WINCH); states: turning, SPUN UP (its windup: glow, whir,
   blur), BROKEN (cracked, hanging off its axle, smoke plume, spark drips), SHUTTERED (not in this phase); health pips; labels CHAIN/LUNGE/DYNAMITE/ROOF (+JUMP) - keep the read.
2. Each gear-driven WINDUP POSE of the rig (B16; now a tilt/heave of the whole rig): dynamite (cab hatch open, the arm), lunge (crouch, the boom unfolding), chain (rears, the
   drum unspooling), rocks/collapse (the roof jib striking up) - its own frames, not a tilt.
3. THE JAM SLUMP (MCA.jamFx + rig tilt/slump): the bit jammed and smoking, sparks, the driver knocked silly - make it a real slumped pose set + the lift back (steam hiss).
4. THE STALL (a gear broken): a shudder + a burst of the broken bank; sound gearBreak (mapped to crack + clank + rubble now).
5. THE TUNNEL FLOOR (MCA.tunnelFloor): the walkway plates / lip / rail bed in the bore's palette (wet variant untouched).
6. THE TWIN LINES: the works yard's two-line set (high trestle line, low yard floor), the high gaps' broken rail ends, the beams; the SIDE SWITCH post (MCA.sideSwitch, a two-armed
   post pointing at its line); a landmark for the yard (e.g. a crossover gantry).
7. THE RAIL RAIDERS: a raider skin (now the gobrider tub + miner), the THROW pose, the BOARDING crouch + plank (MCA.raidPlank) and leap (the leaper's trail), the empty tub
   rolling on, the siding at the yard's end they peel off into.
8. Bestiary: the gear banks are parts, not foes (no card); the raider is a miner variant (rec: a line on the miner's card).

## QUESTIONS FOR DANIEL (rec first = what is built)
1. HALF GEARS / HALF BODY: built as a GATE (each phase line holds until half its banks are broken; blows past it are held, not lost) + a stall per broken gear. Rec: keep.
   Alt: no gate - broken gears only make each lever jam pay more (softer: the body alone still wins, slowly).
2. Gears come back each phase (the brief's 'gone for the phase'). Rec: keep (the fight stays half gears). Alt: broken stays broken for the fight (gears front-loaded in P1-P2).
3. The station that stood past the exam moved to right after the Foreman (one station, not two). Rec: keep (a drill death runs the exam's duck + switch again, ~107 tiles).
   Alt: keep both (3 stations in ~150 columns: A10b dense).
4. THE TWIN LINES went in as a new 70-column section before the flooded run (the level is 1070 wide). Rec: keep. Alt: fit the splits into the goblin line (no new width, but the
   switch-sides teach would sit on top of the thrower and rider teaches).
5. Raiders are existing miners with a new behaviour, not a new foe (A9). Rec: keep; the art lane may give them their own skin (still a variant).
