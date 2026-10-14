# claude/towpath2 - THE TOWPATH 2 + THE FOG KNIGHT 2 (OPUS lane: level + boss mechanics, greybox)

Base: 2cf3294b, merged origin/master (batch92) before the stamps. Brief: scratch/brief-towpath2.md. Built on the current combat (flask lever / act dial,
riposte + poise, damage-% stagger, the human bot). A sonnet ART lane and a sonnet TUNE lane follow.

## WHAT WAS BUILT

### The rule (A1-A3): THE FOG LIES ON THE LOW WATER. THE LOCKS LIFT YOU OUT OF IT.
- Every pound (tail race, river, basin, sunk basin, last cut) and every lock's LOW water carries a fog bank FOG_H = 4 rows deep (src/towpath.js `bank`,
  src/towpath-hands.js `fogAt(x, y)`). Drawn: a rolling layer with a pale, moving top edge; the lantern and lamps burn clearings in it.
- In the fog (the hero's eyes under the edge): a watchman sees you only lit, a dozer wakes only to a lit hero or one at his elbow; you see only your clearing.
  Above it (a lock filled, a beam, a roof, the aqueduct): clear air - every eye sees you, lit or not. HUD: `LANTERN: LIT  IN THE FOG / CLEAR AIR`.
- Fill a lock: the punt lifts you OUT of the fog; drain: you sink into it (tools/towpath.mjs proves it for A, F1, F2, F3, Y).
- LEVELS rule line changed to match (A1).

### The level (8 sections, 494 columns, 60 rows - no two consecutive sections on one verb)
0 LYCHGATE (fork kept) - the lock-keeper's HUT moved here: the lantern before the first lock; hurt-spike teach; the FIRST WRAITH.
1 MILL-POND LOCK - teach: the lock lifts you out of the fog; above it the cottage crossbow sees you.
2 THE MILL - drain the race, climb the wheel, THE SACK HOIST (winch on each floor) to the sack floor under a crossbow, the gantry, the tail race's swing
  bridge HIGH over the race's fog (bridge teach), the yard pocket in the fog; hedge-knight champion exam; shrine 1.
3 THE LOCK FLIGHT - F1 drain-then-fill (punt down INTO the fog, ride out), F2 fill to drown the pair (or fight them in its fog), F3 ride up out of the fog
  under the watchman's beam; bargeman champion; THE LOCK-KEEPER'S TOWER (landmark, ladder climb, lamp beacon, silver).
4 THE AQUEDUCT (SET PIECE 1) - the dry broken iron trough over a gorge: OPEN THE SLUICE and the water floats the moored barge over a 22-column break in
  clear air under a watchman (east sluice sends it back). Then THE BROKEN ARCHES: the platforming section + exam (A14) - six piers, 2-col gaps, down into
  the basin's fog where only the lantern shows the next pier; a wraith among them; shrine 2 at the foot.
5 THE BASIN (SET PIECE 2) - swing bridge strands the dozing rat squad; THE SUNKEN BARGES hull to hull (masts climbable, silver); THE BASIN CRANE: stand on
  the hook, strike its capstan, ride out of the fog up 17 rows to the warehouse roofs (watchman + dozer up there).
6 THE LAST LOCK (exam) - drain X and CROSS ITS FLOOR in thick fog among the irons (only your light shows them; a wraith reaches for that light); culvert;
  Y refilled up out of the fog; the last cut; deck foreman; shrine 3.
7 THE TOWPATH'S END - the Fog Knight's arena (below).
Rides are boarded from above (hoist notch, trough channel, crane notch). All rides are rigBands (reach model). Glint + nudge on every new gadget
(tp-hoist, tp-aq, tp-crane). Second heights for the band measure (gantries, racks, lofts) stand on the island-post kit.

### THE FOG WRAITH (the one new foe; src/fog-wraith.js)
Lives in the fog banks (never above an edge). Dim: fog - a blade passes through ("ONLY FOG: LIGHT IT"), it chills you (hp drain, no stagger/knock, A13).
In a LIT lantern's or lamp's light: hardened (edges, glowing eyes), cut. Close to a lit lantern: SMOTHER (yellow !, 0.8 s): cut it, or raise a guard
toward it and the flame is shielded; let it close and the lantern goes out. 7 wraiths (<= 35% of the cast). The GRINDYLOW is the canal's again
(one-new-foe NEW_EXACTLY: towpath ['fogwraith'], canal ['grindylow','willowisp'] - see QUESTIONS).

### THE FOG KNIGHT 2 (src/fog-knight.js, src/fog-knight-hands.js)
Kept: stance fight (B11, now with an ARROW at where a blow lands), the lantern BURN (bar + BURNING), the bridge scatter, told ward, the double (MIST
label, visor glow), the shroud. The arena: the cut + swing bridge, three BOLLARDS, four GATE BEAMS, THE ARENA LOCK at two heights (real chamber, punt,
lower gate, upper quay, three paddles, refills itself 12 s after a drain), two lamps. The level's rule in the fight (B17): the fog line lies on the cut's
water - knee-deep P1, over your head P2, the shroud P3. Above it (bollard/beam/quay/the lock FILLED) his tells come early and he sees you (and lashes you
down); in it and dim, he loses you. FILL to see, DRAIN to hide (and drain grounds the double).
Attack list (each told with sound + word + colour, own windup + release pose, B16):
1. HIS SWORD (! block / parry)            2. THE FOG LUNGE (!! roll in its last beat)
3. THE TOWROPE LASH - NEW P1 (!! jump or roll; hooks + drags you to him, then a told cut; lashes down a hero STOOD high and seen)
4. THE LOCK SURGE - NEW P2 (!! a wall of canal water sweeps the towpath from the gate: get up on a bollard/beam/quay/punt, or jump it)
5. THE FOG DOUBLE - P2 (a mist copy a beat late; drain the lock to ground it)
6. THE FOG SPEARS - NEW P3 (!! 5 lances in a told line round you; the spots show bright in a light; step off the line or get on a beam)
7. THE DISSOLVE PLUNGE - NEW P3 (!! sinks into the fog, shadow + glow on the LIT spot - you, or a lamp if you dim by one; drops sword-down; stuck after:
   every blow lands). His once-a-cycle blink (shared with the shroud step and the re-form), never within 3 s of his opening (B12).
8. OUT OF THE SHROUD - P3 (! a cut from behind out of the fog)
Phases: P1 lash; P2 surge + double; P3 spears + dissolve plunge + shroud step - more than B5's one-a-phase, Daniel's explicit call (in the header).
Numbers now: hp 1850, gaps 0.75/0.65/0.55, dmg cut 30 lunge 32 lash 14 surge 26 spear 24 plunge 34. NOT dial-exempt (the act-4 dial still applies;
the tune lane decides). fkPlan answers every new move (jump the chain, bollard at the surge, far end of the spear line, off the shadow, roll THROUGH the
lunge late). The hands keep `S.landedOn` (what landed, how the hero stood, the bot's reading) - tools/fogknight-ledger.mjs prints it.

## BOSS SANITY (tools/boss-rates.mjs towpath --seeds=3 --profile=human --flasks=kit --jobs=1, practiced)
Baseline (old knight): 2/3 3/3 3/3 = 89%, fights 50-130 s.
FOG KNIGHT 2 final (after the batch92 merge): practiced 1/3 2/3 2/3 = 56% | first 1/2 0/2 1/2 = 33% | built 1/2 1/2 1/2 = 50% (band 60-70: LOW -4 on practiced; no hero at 0 on practiced). Fights 82-156 s (90-150 target). Deaths mostly at 9-27% boss hp left. Early runs went 22% -> 33% -> 44% -> 56% as the bot learned the new answers (log: ../towpath2-logs/rates-*.log).
Dry: not measured (tune lane).

## CHECKS
GREEN: tools/towpath.mjs (311 checks, rewritten for the rework: rule, fog banks per lock/pound, punt in/out of fog, rides, arches, wraith, all knight moves + bot answers), tools/towpath-probe.mjs (page smoke: every ride carries the hero, wraith stays in its fog, no page errors), level-quality towpath (CLEARS THE BAR, gated), reach-heroes (8 heroes, 0 crossings), level-reach, checkpoint-gaps, one-new-foe, signs, stuck (static + runtime), hint-shown, boss-openings, boss-fight-end, boss-greed, weak-bosses, corpses, mark-integrity, untold-told, riposte, survival, tells, boss-read, blow-tags, solid-islands, answer-tags, threat-holes, mash-gate, curve-gate, mash-carry, textfit (scoped hints,bestiary,hud --strict: 0 issues), goblin-lint, audit, comments, dangling-paths, map-spacing.
STAMPED: mash level (knight/warden/pyro all die, 7-8 deaths) THEN boss (0/6), level-1 pilot (35 blows, 8 deaths), curve (act 4: 388%/run, in band).
DELIBERATE TEST CHANGES (stated, not weakenings): one-new-foe NEW_EXACTLY (Q2); blow-tags NOT_BOSS += FWR.wraithTake (a common foe, like the wisp); solid-islands towpath allowance 15 -> 2 (tightened: the island-post kit); towpath.mjs dark-paddle assertion fog -> dark (Q4); shrines 3 (was 3) with the new spacing.

## REDS
- Boss band: 56% practiced at 3 seeds (LOW -4) - the TUNE lane (12 seeds) owns it; levers: FK.gap, FK.dmg, hp 1850, the dial.
- mark-integrity: a FLAKY pre-existing PHANTOM on the Undead Archmage (undeadmage|poisonTell / markTell) - reproduced on untouched master 2cf3294b; my final run was green.
- Not run (per the prompt): full textfit, 12-seed loops, the suite. tools/towpath-route.mjs (the old route pilot, not in the suite) still walks the first greybox's columns - stale; the walker (BK.walkHint) is updated and the mash/pilot walkers ran the level 100%.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. THE CHURCH FORK - the brief says it goes away when church2 moves the church off Waymeet. church2 has not landed, so I KEPT the lychgate + 'tpchurch' door
   (removing it would orphan the church's road). Rec: the church2 lane deletes it (section 0, columns 13-39) when it lands.
2. THE GRINDYLOW leaves the towpath (A9: the fog wraith is the ONE new foe). one-new-foe's NEW_EXACTLY changed (towpath: fogwraith; canal: grindylow +
   willowisp - the canal's original two). Rec: keep.
3. THE ARENA'S WATER - the brief says "fill to see his tells early, drain to hide from the lash". Built literally with the level's rule: the arena lock
   FILLED lifts its punt out of the fog (you see him, he sees you and lashes you down); DRAINED, the punt sinks into the fog (hidden). Rec: keep.
4. THE LAST LOCK'S DARK PADDLE stood "in thick fog" (an old towpath.mjs assertion). Under the new rule the bank over the FULL lock is out of the fog (the
   fog is on its low water); the paddle is still dark (unlit lamp, night) and still needs the lantern - the assertion now says "in the dark". Rec: keep.
5. DIAL: he stays on the act-4 pressure dial. Rec: the tune lane measures 12 seeds and decides DIAL_EXEMPT then.
6. Shrines: three (156, 325, 439 -> walked 154 / +148 / +135). The aqueduct-head shrine was dropped (80 walked tiles after the first: under MIN).
7. Music: the level and the knight still play the composed-in-code beds (towpath / fogknight). Rec: Daniel picks a CC0 track for the new night towpath.

## ART LIST (greybox -> art lane; reference shots: work/claude/towpath2/*.png from `PORT=.. node tools/towpath-probe.mjs shots`)
LEVEL / LOOK: night palette (cold blue-green, moonlit), Waymeet roofs fading to silhouette; FOG BANK layer (rolling body, bright clear top edge, per-bank
depth); will-o'-wisps (decor); drowned willows (limb footing), eel traps, gibbet, bollards, milestones; lock gates + gauges; punts.
- Lock-keeper's hut in the fog (lantern hook, empty armour stand with fog in the visor).
- Mill: wheel/race (exists), loft + SACK FLOOR interior, SACK HOIST (deck, shaft ropes, notch, two WINCH props), sack door, gantry, tail-race gantry-beam
  swing bridge, yard pocket.
- Lock flight: F1-F3, top-gate beam, footbridge, LOCK-KEEPER'S TOWER (walls, two floors, ladder, roof beacon lamp) - the landmark.
- AQUEDUCT: iron trough on arches (west span walkway + channel, east span), the BREAK (sagged iron, fallen arches), two SLUICE posts (shut/open),
  the BARGE (moored dry / floating), running water + waterfall through the break, two sluice gantries (hang them off the trough: solid-islands' last 2),
  the gorge walls, the river far below with its fog.
- BROKEN ARCHES: six ruined pier tops in the basin's west water.
- BASIN: quays, swing bridge, net-drying rack, SUNKEN BARGES (two hulls awash + masts with rigging as climbable poles), BASIN CRANE (mast, jib, chain,
  HOOK platform, quay notch, two CRANE CAPSTAN props), two warehouses + alley.
- LAST LOCK: X floor with irons (readable only in light), culvert, Y, last cut, deck; lamps lit / unlit / guttering.
FOG WRAITH (all frames, B16): drift soft x2 (translucent, no legs, hood + long arms), HARDENED (sharp edge, glowing eyes), SMOTHER windup (arm reaching
for the flame) + release (hand closing on it), recoil (shielded), death (comes apart upward), chill fx on the hero.
FOG KNIGHT 2 (Crusader scale; armour CONSUMED BY FOG - rust-black plate, weed, barnacles, cracked great helm with fog spilling from the slit, plates
missing, lower body mist, sword trailing mist): idle glide, walk glide; stances HIGH / LOW / FULL (+ the arrow glyphs); cutTell/cut/cutRec;
lungeTell/lunge/lungeRec; lashTell (chain whirled) / lash (throw) + CHAIN + HOOK sprites; surgeTell (sword raised to the gate) / surge (struck);
spearTell (knelt, point in the canal) / spears (blade torn up); sinkTell (melting into the bank) / plunge (falling point-down) / plungeRec (stuck in the
stones); shroudTell / stepTell / stepCut; doubleTell + the MIST DOUBLE; empty (open: plates sag) ; reel; ward; dissolve / reform; death (the plate falls in
a heap, the fog goes off over the water). FX: wall of water (surge) + gate crest gauge, fog lances + told spots (bright in light), plunge shadow + glow,
arena fog line. ARENA: lock at two heights (lower gate, chamber, punt, upper quay), bollards x3, gate beams x4, lamps x2.
