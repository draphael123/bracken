# HURRICANE DECK 2 (claude/hurricane2, opus) - lane done

Base: origin/master b74ce76e (BATCH97). Branch claude/hurricane2, pushed.

## WHAT WAS BUILT
- **ONE SPINE.** Rule line (A1, matches the code): "THE SEA AND THE SKY TAKE TURNS: THE WAVE KNOCKS YOU FLAT, THE LIGHTNING SHOWS YOU THE WAY."
  Only three systems are left: the WAVE, the ROLL and the LIGHTNING.
  - The wave pushes. It shoves you down her deck with no stun, no flinch and no i-frames, and costs health as a drain (A13).
  - A line catches you (L.autoGrab). You grab a shroud or ratline when you fall into it with no sideways key held, or when the sea shoves you into it.
  - The rigging climbs 1.35x faster.
  - The lightning fells the foremast into a bridge, lights the dark powder store, and opens the Captain.
- **ONE SHIP, read bow to stern:**
  - BOW: the wave, taught. A swing off the forecastle onto a shroud. Forepeak silver. Tideguard exam, then a shrine.
  - FOREMAST, crossing 1: the sky marks the foremast and fells it across the breach onto the galley roof. A gull comes at you down it. A sea witch is on the roof.
  - MAINMAST, crossing 2: up the ratlines and out along the main yard, on its lifts. A boarder and a tideguard come the other way. Her hatch covers ride the sea below as a low road.
  - THE WEATHER DECK: the ambush, with the roll taught there.
  - THE EYE: dead calm, a shrine, the bread-room silver.
  - STERN, with the storm back about twice as hard:
    - Crossing 3: hatch covers heaving on the swell.
    - The aft gun breaks loose as she heels and smashes the cargo. You can also go over on the crossjack yard.
    - At the poop break you either drop into the DARK POWDER STORE (lit only by the sky) or take the rope swing.
    - Crossing 4: the rope swing onto the mizzen, then run her topmast as it breaks span by span behind you.
    - The stern exam is a boarder elite who holds the boarding net (the gate). Then a shrine.
  - THE CAPTAIN.
- **CUT:** the pump brake, the oil, the second ship, the lifeboat and davit, the oil beam, the bulkhead guns, the splitting waists and the long keel swim.
  - She is now AGROUND on the bar, so the sea under her is no longer a road around the crossings.
  - No rail spans a breach or a hatch.
- **NO FLOATING PLANKS:** solid-islands for the hurricane goes 17 -> 0. Every platform is a yard, a spar, a topmast or a hatch cover on lashings.
- **THE CAPTAIN 2** (src/main.js updateCaptain / capRead / capStruck):
  - A duelist (front wall 0.4, GO ROUND) with five told moves: sabre two-cut, pistols, grapnel, keg, and calling the sea.
  - THE WAVE: when the sea comes he MAKES FOR A LINE, and the line he wants is marked. Take it, or keep him off it, and the wave KNOCKS HIM FLAT: OPEN x2 with the gold ring and clock.
  - THE SKY: in his fight the strikes mark the deck BETWEEN you. If he walks into one he is STRUCK: OPEN x1.5.
  - A cut taken on the shield also opens him for 1.6 s, at x1.5.
  - After an opening, a told 3 s WARD (pale shell, WARDED): 0.4 from every side. He is never below 0.4x (B15).
  - His phases speed the sea through capSeaK (this used to be a write to L.wash that outlived a death).
- **Engine:**
  - L.felled can be a list (felledAll). It takes a `clear` for the yard that falls with the mast.
  - The reach fill sees a felled mast (src/reachcore.js).
  - skyGlow lights darkZones marked storm:true.
  - storm2.bossEvery.
  - seaDrain.
  - THREAT cargo: 0. Cargo is a struck prop, not a foe.

## BOSS RATES (practiced, campaign L20)
- **With flasks (human, n = 12 per hero):** knight 6/12, warden 12/12, pyro 7/11 (one fight did not record) = **71%**. That is 1 point over the 60-70% band; no hero at 0. Fights last 45-160 s.
- **Dry (human+dry, n = 6 per hero):** knight 0/6, warden 2/6, pyro 2/6 = 22%. This is reported only, as B6 allows.
- **Mash:** boss 0/6; the level mash fails every hero (3-6 deaths each). Rows were stamped level first, then boss. The level-1 pilot and its curve row were stamped too.

## CHECKS RUN
**Green:**
- Node checks: level-quality hurricane (now GATED; CLEARS THE BAR), storm-ship (re-pointed), stuck (static + runtime), checkpoint-gaps, checkpoints, solid-islands, floating-geometry, floaters, signs, killzones, collectables, traps, spawns, elites, ambush-listed, ambush-reach, deadends, audit, dressing, keys, goblin-lint, threat-holes, one-new-foe, reach-heroes (all 9 heroes reach every route target), sea-requests, ship-fixes, boss-read, blow-tags, arena-supplies, answer-tags, boss-music, checkpoint-stand, ambush-single, sprinkle-cap, architecture, occluders, swim-shrines, map-grammar, dangling-paths, comments, npc-removal.
- Page checks: storm-ship-runtime (re-pointed), runtime-footing (Hurricane row moved to the forepeak marine), boss-greed, boss-openings, textfit hurricane --strict, sea-runtime, relics.

**Red:**
- rule-openings: the POISE row fails. It fails identically on master b74ce76e, so it is not this lane.
- mark-integrity: hit my 25-minute timeout on the full roster, so it is not done. Run it at integration.

**Walker** (level-walk, L20, typical build, 1 seed):
- The knight walks the whole route.
- The warden and pyro reach the boss (97% walked), each with one walker STUCK the walker recovers from:
  - The warden fights in the ambush room, then stands on a riding hatch cover while the static route swims.
  - The pyro fights on the crossjack yard.
- 0 deaths; arrives with 53-59% health. Target is 1-2 deaths and under 50%, so it MISSES on the easy side.

## MERGE NOTES vs claude/flotilla2 (no Flotilla file was edited; shared lines below)
These are one-line conflicts that are trivial to resolve:
- tools/storm-ship.mjs (a one-line file): take mine. It already carries flotilla's `m.deck` rule.
- tools/level-quality.mjs GATE: keep both 'flotilla' and 'hurricane'.
- tools/solid-islands.mjs ALLOW line: both drop to 0.
- src/checkpoint-thin.js: the flotilla and hurricane lines sit next to each other. Both are now [].
- src/stuck-spots.js: the hurricane block sits right after flotilla's.

src/storm-ship.js line 7 is byte-identical to flotilla's, so it merges clean.

## QUESTIONS FOR DANIEL (my recommendation and what I built)
1. **Per-hero split.** The knight is at 6/12 while the warden is at 12/12 with flasks. The pyro wins in about 100 swings against the knight's 450, so her fire seems to slip past the duelist wall. This probably affects the Lance and Paladin too.
   Rec: a short audit of the duelist wall against the pyro's fire and burn. I built 71% overall and gave the knight a shield opening.
2. **Walker difficulty.** The walker finishes with 0 deaths, arriving at 53-59%. The mash bot fails every hero.
   Rec: accept for now and re-read after the art pass. I built a 14-damage wave (x1.4 past the eye) and a tideguard on the yard.
3. **Aground on the bar.** I grounded her so no one can swim under the crossings.
   Rec: keep it. The art lane draws the bar.
4. **Auto-grab.** It catches a hero falling INTO a line with no sideways key held. Letting go of a line drops you.
   Rec: keep.
5. **Captain text left for integration.** The boss plate still says "THE CAPTAIN  BEACHED" while he is flat, and WALL_HINT still says "BEACHED". Both sit inside flotilla's hunks.
   Rec: reword to "KNOCKED FLAT" at integration.
6. **The deck rail.** The pre-existing deck rail (a one-way tile on row 19) lifts a hero a row after any jump.
   Rec: a polish item.
7. **Deck foes and lost footing.** Foes on the open deck did not fall when runtime-footing dug out their footing, but the forepeak marine did. Nothing in the level removes deck footing, so it does not matter in play.
   Rec: note only.

## ART LIST (Sonnet art/sound pass; the level ships only after this)
1. **Foremast:** standing mast, ratlines and fore yard. Its fall, lying from the breach onto the galley roof (it uses the old main-mast drawing today). The stump.
2. **Main yard on its three lifts:** yard, lift ropes, the main stay from the yard to the deck.
3. **Hatch covers** (ent mover `hatch: true`, 3 breaches): gratings on lashings to the coamings, plus spray on the heave. They are a generic plank today.
4. **Breaches (4):** stove-in planking, broken frames, open to the sea down to the BAR. Her hull below the waterline, sand on the bar.
5. **The mizzen standing in the stern breach** from the bar to its top: no stock deco reaches, so this is ART. The broken topmast's five spans and their fall (crack per span). The stern stay.
6. **Rope swings (3):** off the forecastle, onto the mizzen, and off the spanker gaff in the arena.
7. **Galley deckhouse** (173-196) and the **poop break house** (452-474). The **dark powder store** with light through the deck seams on a strike.
8. **Cargo** lashed across the waist (438-439), and the loose gun's smash.
9. **The Captain's new poses:**
   - braced on a line (borrows frame 10)
   - KNOCKED FLAT (borrows frame 12)
   - STRUCK
   - the WARD shell
   - the "line he wants" marker
   
   Every move keeps its own windup and release pose (B16).
10. **Sound:** wave knockdown, CAUGHT grab, topmast span crack, Captain flat, Captain struck, ward.
