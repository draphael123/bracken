# claude/palisadewood - THE PALISADE WOOD + THE BATTERING BEAST (opus greybox, level + boss)

Base 408eb9bc (master, BATCH117). Branch claude/palisadewood. Not merged, not deployed. Brief scratch/brief-palisadewood-1015.md (+ the 10-18 AUTUMN note).
PORT 6640 (this worktree's tools/ports.mjs block), one headless Chrome at a time, free RAM checked before each (3.0-7.6 GB free during the run).
Helpers in work/tmp-palisadewood/ (uncommitted). GREYBOX: art comes in a later sonnet lane (art before live).

## WHAT LANDED
- **src/palisade-wood.js** - the level, laid by hand (443 x 44). **src/palisade-hands.js** - its rule, the stake-setter, the skyline landmark, greybox drawing.
  **src/battering-beast.js** (pure fight + bot plan) + **src/battering-beast-hands.js** (world binding + greybox drawing).
- **Road:** THE ROOTWAY -> THE PALISADE WOOD -> KINGSWOOD. LEVELS stays append-only: the row is `LEVELS.push(...)` right under the array (so a branch that edits the
  array's last row - batch118's hornetsnest row - merges clean). kings.needs = 'palisadewood'. Map node (178,58) on the Rootway->Kingswood segment, blurb in map-blurbs.
- **Old saves (src/main.js progDefaults, once: PROG.palisadeRoadMig):** a save with the Rootway or Kingswood cleared keeps KINGSWOOD open (PROG.kingsOpen in levelLocked).
  THE PALISADE WOOD needs only the Rootway, so a save that cleared Kingswood finds it UNLOCKED as an extra, never cleared, never required - asserted in
  tools/palisadewood.mjs (gate function over fake PROGs) and in tools/map-forks.mjs (real save slot, page).
- **Rule line (true to the code):** THE WALL IS STILL GOING UP: KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN.
  A PROP (L.hoists, the Rootway/Kingswood data shape - the guide, reach fill and pilot bot read it) = a timber shore drawn with a WEDGE at its foot, a ROPE lashing and
  shivering STRAIN marks, glinting while it holds. Any blow knocks it. RESULT SHOWN FIRST: a dotted ghost of the ramp/bridge cells, a plumb line under walkways and stake racks,
  a dotted roll road for stakes. Loads: **ramp** (a scaffold section folds into steps - stays), **tower/bridge** (a half-built watchtower / the gatehouse scaffold falls across a gap
  - stays), **crew** (a walkway's boards go, the crew falls hurt, debris crushes under it), **stakes** (drop, crush, roll through the patrol, scatter at a wall; a stake wall in
  their road goes down too).
- **THE STAKE-SETTER** (the one new foe; a sprig body + `pw.pwSetter`): within 7 tiles on his floor he tells ('!', mallet up, 0.7 s) and hammers a 2-row stake wall between
  you; 2 blows knock it down, or jump it; it falls by itself after 12 s; never into a hero, only on floor. 4 placed (teach 138, yard gate 186, wall end 287, gate road 369).
- **Five named areas** (L.sections, banner on entry, sign at each entrance, shrine closing each exam - A10c):

| area | cols | arc | contents |
|---|---|---|---|
| THE FELLED EDGE | 0-104 | TEACH | the Rootway's caps thin into stumps; THE FIRST PROP (scaffold -> ramp up a 5-row ledge, REQUIRED, safe); a crew on a walkway (teach); hound, brute+shield+archer, stake-thrower+pike; exam THE FELLING CREW (brute + shield under the crew's walkway, archer behind); shrine 102 |
| THE STAKE YARD | 104-204 | TEST | stacked stakes roll through a pike + 2 sprigs; THE STAKE-SETTER taught; THE WATCHTOWER over the 8-wide gap (REQUIRED; pit with boards back up, silver in the woodcutters' hollow); landing into a shield; exam THE YARD GATE (setter + shield + perched archer, a stake rack over them); shrine 202 |
| THE SCAFFOLDS | 204-306 | REMIX + A14 | scaffold tiers up the palisade face, THE WALL'S RAMP (REQUIRED: a 7-row wall, the scaffold folds into a board stair); THE UNFINISHED WALL TOP: slot gaps (a fall is a climb on rungs), LOOSE BOARDS that give way (crumbles), a stake-throwing crew over them, archer over slot one, THE UNBUILT SPAN's watchtower (REQUIRED), a half-built tower to climb over (silver on its top scaffold); exam THE WALL'S END (brute + setter + archer, the crew's walkway over the brute); shrine 299 |
| THE HALF-BUILT GATEHOUSE | 306-390 | EXAM | siege engines, battering-ram frame, supply carts on to Kingswood's Royal Road; THE DITCH (its gatehouse scaffold falls across - REQUIRED); the gate's stakes roll back west through the passage's shield + pike; crew over the gate's far side; setter + brute; shrine 386 |
| THE OLD FOREST GATE | 390-443 | BOSS | THE BATTERING BEAST |

- **Landmark:** THE PALISADE LINE (stakes + watchtowers across the skyline) and THE HALF-BUILT GATEHOUSE (one tower roofed, one a scaffold frame) growing as you come
  (PWH.drawSky, greybox silhouettes). The route climbs row 37 -> row 2 (9 bands).
- **AUTUMN** (Daniel 10-18): autumn sky/palette (russet + gold), falling leaves weather, russet tints warming toward the gate, 17 harvest props (baskets, nut piles, rakes,
  sheaves, apples) drawn as greybox shapes; fruit trees, hay. Timber is on theme. Goblins are fine here (road order: the Goblin Queen is act II+).
- **THE BATTERING BEAST** (header in src/battering-beast.js; beast boss with a rule opening, always hittable):
  - armour x0.4 (ARMOURED, the B15 floor), plunge on his back x1, WARDED x0.4 for 3 s after every STUCK (B3). Never fully invulnerable.
  - OPENING = THE LEVEL'S VERB: two scaffolds (decks 3 rows up), each on a PROP at its inner foot; one blow tips it into the clearing (fall line drawn gold, red while he is in
    it). ON HIM -> STUCK (x2, capped 13% of him). IN HIS PATH -> the wreck is a wall to him, his charge rams it -> STUCK, wreck spent; the crew props it back up 11 s later.
    A charge into the wall/old gate -> DAZED (x1.25).
  - 4 told attacks (own windup + release pose each, B16): 1 RAM CHARGE (!! - jump it, get onto a deck, or a wreck between you; the run line shows where it ends), 2 STAKE SWEEP
    (! - the ram swung low both sides: jump; a block holds but jars), 3 HANDLERS' VOLLEY (!! - stakes on red-marked spots, aimed where you stand, a deck too), P2 4 THE TRAMPLE
    (!! - a ground ring both ways: jump).
  - P2 (50%): THE HARNESS - a glinting gold buckle on his back (reach it from a deck or a jump); 3 cuts -> the harness parts, the ram breaks loose, he bolts and smashes into the
    palisade at the east end (set piece), LOOSE x2 for 4.2 s, handlers thrown off -> no more volley.
  - No adds. Music: generic pool 'boss3' (the level plays Kingswood's autumn track as a placeholder - music row REPORT_ONLY until Daniel picks a CC0/CC-BY track).
- **Wiring:** level.js (import, push, kings.needs); main.js (PWH/BBH construction + reset/update/strike/draw/sky/guide props/setter step + mallet, bestiary card + entry, BOSS_T,
  POISE_SKIP, roar, BOSS_FELL 'THE OLD GATE HOLDS', death case, bar name, RUSH, BK hooks pwood/batteringBeast(Hands), spawn break list, map node, migration);
  his EHP/BEAST_SHORT/COLS/KNOCK_SKIP rows are set on ONE separate line next to his hands (merge-clean); lab.js bot branch + PLAN clock; boss-greed (OPEN_RULE + OWN_WARD),
  boss-read (ARMOURED/WARDED), hint-lines (PW_SAY + BB_SAY), threat (props 0, beast 6), foe-react (act I + LEVEL_DMG 1.5), island-posts (POST_LEVELS.add on its own line),
  reachcore (props' steps/spans count as done), playtest (pilot bot strikes props like cleats), stuck-spots (5 required props), level-quality (GATE + REPORT_ONLY music),
  boss-rows, map-blurbs, map-plate-spots (spore's board moved to [12,-22]: the only spot clear of the new node - see REDS).

## CHECKS (PORT 6640; one headless Chrome at a time, free RAM 3.0-8.7 GB checked before each)
- NEW **tools/palisadewood.mjs** (Node, registered in check.mjs on its own line + check-timings) - **all green**: road + append, map node, rule line, gated, 5 areas tile the
  level, skyline drawn, autumn; THE OLD-SAVE RULE over fake PROGs (Kingswood cleared -> Kingswood open AND the palisade unlocked as an extra, not cleared; a Rootway-only old
  save keeps Kingswood; a new-road save must walk the palisade; palisade cleared opens Kingswood); fill reaches every shrine/silver/the beast; a shrine closes each area;
  **5 REQUIRED props proven LOCKS** (edgeRamp, yardTower, wallRamp, wallTower, gateBridge), crews/stakes are weapons; props on footing, cells land in open air, stake roads end
  at walls through foes; 4 setters; the hands in a fake world (ramp, bridge, crew, stakes roll, setter tells + plants a 2-row wall, 2 blows knock it down, never into a hero);
  every line routed; the beast pure (STUCK on him / via a wreck, x2 capped, 0.4x ward after, DAZED off the wall x1.25, ARMOURED 0.4x, plunge whole, P2 trample at half,
  3 buckle cuts -> LOOSE and no more volley, 4 told attacks, ! and !!, B16 poses distinct, the bot plan reads tells); boss-greed / boss-read wired.
- NEW **tools/palisadewood-probe.mjs** (page smoke) - **all green, 0 page errors**: lands in play (no god); every prop kind comes down in the real game; a real death keeps ramps
  and bridges and puts walkways back; a setter plants a wall and 2 blows drop it; banners; the beast wakes; a scaffold knocked on him = STUCK, he tears out (ward); a charge
  into a wreck = STUCK.
- NEW tools/palisadewood-shots.mjs (stills, not in the suite).
- green: **level-quality palisadewood CLEARS** (gated; music row REPORT_ONLY - placeholder track), **solid-islands** (0 left), **reach-heroes: all 9 heroes, 0 crossings**,
  **map-forks** (incl. 3 new palisade asserts), map-grammar, map-spacing, **map-scale**, stuck --static, signs (all fit 2 lines), deadends (5, all paid), checkpoint-gaps (DENSE
  report only: 90-102 route tiles, the A10c structure, as Kingswood), one-new-foe, sprinkle-cap, threat-holes, hint-shown --static, check.mjs palisadewood subset.
- NOT run: the full suite (the BATCH118 gate is on this PC), corpses/floaters/textfit/boss-jump/boss-select (page tools; the bestiary card + entry are new - textfit bestiary
  belongs in the integ run).
- **My slip, fixed:** `node tools/check.mjs --only=palisadewood` is not a filter (positional ids are), so it began the FULL suite; I stopped it within ~2 min and killed only its
  own process tree by PID (23364 + children, wrapper 23504). It changed no files.

## STAMPS / DIFFICULTY (final level hash)
- docs/level1-pilot.json: fresh L1 knight, 3 runs: 13 hits, 0 deaths, 101% hp a run, walked 100%.
- docs/level1-curve.json: **118% hp a run, 1 death in 3** - act I band (40-250%). (Foes: act I list + LEVEL_DMG 1.8 in src/foe-react.js - the v2 "weightier" knob.)
- docs/mash-bot.json LEVEL: knight 3 deaths / warden 1 / pyro 3 (lowest hp 0% each) - holds. BOSS: **0/6** (boss left 83-88%).
- **THE WALKER** (level-walk, campaign L6, human+first, 2 seeds a hero, 95% of the route measured, **0 stuck** after the fixes):

| hero | deaths | arrive mean/min | vs act-I target (0.5-1.5 deaths, arrive < 65%) |
|---|---|---|---|
| knight | 0.0 | 78 / 54 | soft |
| warden | 0.0 | 66 / 45 | arrival ~on target, deaths low |
| pyro | 0.0 | 88 / 72 | soft (as on the other act-I levels: rootway 0/81, kings pyro 0/90) |
  Walker fixes made: saw pit 2 deep; the wall's tiers a straight stair; the wall ramp's prop moved to the scaffold's foot on the yard (the pilot hands strike a prop only within
  4 rows); a one-tile step out of each wall-top slot; a 2+1 step to the upper yard; the half-built tower's top lowered; a pike for a shield on the felled ground (walker stall).
- **THE BATTERING BEAST** (boss-rates practiced, campaign L6, flasks kit, BOT_PROFILE human, n=12 a hero):

| | knight | warden | pyro | total | fights |
|---|---|---|---|---|---|
| **with flasks** | 12/12 | 7/12 | 6/12 | **69% - in band (act I end, lean high)** | 56-192 s |
| dry (human+dry, n=6) | 6/6 | 2/6 | 0/6 | 44% | 56-192 s |
| mash (boss) | 0/2 | 0/2 | 0/2 | **0/6** | |
  Tuning path: 100% (first build) -> damage up + the volley aimed at the deck you stand on (decks were a safe haven) -> 58% -> charge 13 / ram hitbox 24 px (pyro could not
  jump it) -> 72-75% -> STUCK 3.0 s, cap 11% -> 72% -> sweep / trample 17 -> **69%**. Final: hp 1500, charge 13, sweep 17 (a block jars 0.8), volley 12, trample 17.

## REDS
- **Spread: knight 12/12 vs pyro 6/12** with flasks (dry pyro 0/6). The knight bot lives behind wrecks and blocks the sweep; pyro dies mostly to charges. No hero at 0 with flasks.
- **Knight fights reach 192 s** (target 90-150; warden 56-109, pyro 113-149) - the knight's wreck-wait loop.
- **Walker deaths 0.0** all three (act-I target 0.5-1.5) - soft like the other act-I levels; the level-1 curve is mid-band (118%).
- **Merge vs claude/batch118** (git merge-tree): only TWO conflicts - `src/main.js` levelLocked (resolve: TAKE THIS BRANCH's line - it already carries batch118's
  `marshOpen` clause plus `kingsOpen`) and `docs/level1-curve.json` (adjacent appended rows: keep both / re-stamp). LEVELS is pushed under the array, island-posts and the
  beast's table rows are on their own lines, map-forks' block sits apart from batch118's - those merge clean.
- `src/map-plate-spots.js` is GENERATED; I hand-set spore's board to [12,-22] (a static search: the only spot clear of the new node and every info card). Re-running
  tools/map-plates-solve.mjs moves ~30 boards and still leaves spore on its signpost.

## STILLS (greybox, god-mode knight; no "before" - the level is new)
work/claude/lane-done/palisadewood-{edge,edge-ramp-after,crew,yard-stakes,yard-tower,yard-tower-after,setter-wall,scaffolds,wall-ramp-after,wall-top,unbuilt-span,gatehouse,
gate-passage}.png and palisadewood-beast-{walk,chargeTell,charge,sweepTell,sweep,volleyTell,trampleTell,stuck,loose}.png (640x360). The camera leads the hero, so some props
sit just off the right edge in the area stills (palisadewood-crew.png shows a prop, the standing scaffold section and a crew walkway; the probe proves every one in play).

## ART NOTES (sonnet art lane; nothing here changes the level hash)
- src/palisade-hands.js drawProp / frame / drawWorld / drawSky / setterOver + harvest props are greybox: the PROP (shore + wedge + rope + strain marks + glint), the standing
  scaffold section and its folded steps, the watchtower toppling, the gatehouse scaffold, the crew walkway (legs, falling boards, debris), the stake rack / stack / roll /
  scatter, the stake wall, the setter's mallet and stakes, baskets / nuts / rakes / sheaves / apples, the skyline palisade + half-built gatehouse.
- src/battering-beast-hands.js: POSE is the contract (each mode its own windup + release); drawBeast (plated beast, chained ram, harness + buckle, 2 handlers), scafDraw
  (stand / tip / wreck / spent / rising), the old forest gate (west wall), the palisade end (east wall), bakeBatteringBeastCard.
- Reskins wanted (greybox uses plain kinds): rockgoblin -> STAKE-THROWER, the pw.pwSetter sprig -> STAKE-SETTER, brute -> MAUL CREW; a timber tile kit and area backdrops;
  the level's own track + a boss track.

## QUESTIONS FOR DANIEL (rec + what I built)
1. **The prop's verb: any blow, or heavy / a thrown rock only?** Rec + built: ANY blow (every hero, and the bots work it); a rock throw can be added if you want it heavier.
2. **The P2 harness: optional or required?** Rec + built: an OPTIONAL big opening (3 cuts on the buckle from a deck or a jump -> LOOSE, no more volleys); the fight ends on damage.
3. **Where he batters:** rec + built: THE OLD FOREST GATE you came through is the clearing's west wall (a charge into it: THE OLD GATE HOLDS); the harness set piece sends him
   into the palisade's unfinished east end.
4. **Music:** placeholder = Kingswood's autumn track in the level (REPORT_ONLY) and the boss pool 'boss3' in the clearing. Rec: a CC0 autumn track + a heavy drum boss track.
5. **No mini** (443 cols, under the ~650 the brief set). Rec: none.
6. **Spread knight 12/12 vs pyro 6/12** (69% total). Rec: accept for the greybox, re-check after the art pass.
