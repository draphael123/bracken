# claude/ksar2 - THE BANDIT KSAR 2, PART A (Opus mechanics lane), 2026-10-08 -> resumed 2026-10-09

Brief: `scratch/brief-ksar2.md` (all recs) + `scratch/common-1008.md` (bosses WITH FLASKS 60-70%, profile human; A13 drains).
Branch base: live master 3595a284 + origin/claude/zipline (merged, 9b6f394d). The first lane died mid-work (coordinator lost connection);
the resume lane read the 7 uncommitted files, kept all of them (sound: see "Resume"), and finished the measuring.

## Built (part A)
1. **THE ROOFTOPS** (`src/hawk-mistress.js` HM_STAGE/geom, `src/ksar-hands.js` shafts): the Hawk-Mistress fights across three flat roofs at one
   height with two 2-wide SPIKED SHAFTS between them. A fall bites `KS.shaftPct` = 25% (A10) and the HOT UPDRAFT throws you up onto the nearer
   roof's edge (never a death, never a soft-lock; foes thrown out too). She LEAPS roof to roof after you (told, B12: lands on your roof).
2. **HER THREE NEW TOLD MOVES, one a phase (B5)**: WHIP SNARE (P1 `!!`: wraps and YANKS you toward the nearest shaft; JUMP or ROLL breaks it),
   KNIFE FAN (P2 `!`: three knives HIGH / MID / LOW drawn on her hand; duck / jump / shield), KEG KICK (P3 `!!`: a lit keg rolls at you; jump it,
   or STRIKE IT BACK - it blows under her = an OPENING; over a shaft it drops in and blows there).
3. **THE HAWK's two told attacks** (her kit, unkillable): RAKE DIVE (P1+, a told line) and SNATCH (P2+, hangs, locks, drops; caught, it
   carries you over a shaft and lets go). STRIKE or BLOCK it mid-dive -> it FLINCHES, is SENT OFF, she whistles = an opening. B15 floor 0.4x.
4. **THE SUN v2, game-wide** (36b94ed1): `src/sun-hands.js` on the SHARED `src/drain.js` (A13). Resume: drain.js's header now documents the
   whole API (players / take / god / onBeat / beat, set / stop / step / sources / rate / clear, a breath example) and `tools/ksar.mjs` checks it
   (share of max hp a second, beats, god skip, touches nothing but hp, two sources stack, stop / clear). **For THE LONG WATER 2:**
   `const D = makeDrains({ players: () => ctx.players, take: (pp, n) => ..., god })`, then `D.set(pp, 'breath', rate, { name, col })` while the
   breath bar is empty and `D.stop(pp, 'breath')` on surfacing; `D.step(dt)` each frame; `D.sources(pp)` for the HUD.
5. **THE LONGER KSAR** (628 -> 862 columns): THE POWDER QUARTER (torch throwing on `src/carry-throw.js` kind `torch`, archer nests blinded by
   flasks, the teach zip line, THE POWDER RUN carry, THE RAISED BRIDGE rope burnt by a torch, THE POWDER TRAIL), THE KEG ALLEY exam (a chain of
   eight kegs, two deadly breaks, a gong + lookout, a raider line you CUT), THE LINE TO THE ROOFS (required zip line), CP 7. Glint + nudge,
   walker hints, hint lines, marks rows.

## Resume (2026-10-09)
- Kept + committed the dead lane's 7 files (4dccd500): the hawk's snatch tell renamed `hawkGrabTell` (main.js's harpy owns `snatchTell` - one
  mode name, two marks), a spire overhang shading THE GLASS SEA's rocking-mirror teach pit, an awning at the Ksar's 181-187, the four desert mash
  rows re-stamped (caravan, welltown, glasssea, ksar).
- Glass Sea mash level row re-stamped again after the teach-pit shade (cecb55a0). Pilot + curve rows re-stamped for ksar, glasssea, welltown.
- An awning over the outer walls' FOURTH BREACH (218-224): its shield's shove into the spikes was fought in full sun (506685fa).
- Walker: the tower stair (one-way boards zigzagging at 783-789 with a shared column) read STUCK for knight + pyro. Fixes: the walker takes a
  stair from its foot when the next node is more than a jump over him but close across (tools/level-walk.mjs), and `H.walkHint` stands him at the
  boards' shared column 786 and jumps straight up (src/ksar-hands.js). (A solid-stone stair was tried and dropped: a 2-wide face has no headroom
  between steps - he bonks.)
- `tools/cdp.mjs`: `LAB_BOOT_MS` env overrides the 90 s lab-reload deadline (this morning the PC sat at 100% CPU with 115+ Chrome processes from
  ~10 lanes; most page runs died with "the fresh lab page did not initialize").

## Numbers
BOSS - THE HAWK-MISTRESS (L35, practiced, 197c3d1c tune hp 2850; the resume changed no boss number):
- WITH FLASKS (profile human, 8 seeds): **63%** - knight 7/8, warden 3/8, pyro 5/8 (wins ~95-110 s). In band (60-70%).
- DRY (human+dry, 6 seeds, this session): **44%** - knight 3/6, warden 1/6, pyro 4/6 (wins 76-103 s).
- MASH boss 0/6 (row holds, `mash-gate` green).
LEVEL:
- god routes (ksar-route god=1 foes=0): all 7 heroes walked the whole route in the first lane (0 lifts) on today's geometry (the resume
  added only an awning, which is shade, not collision). A re-run during the stone-stair experiment lifted the alley leg (its script hops the
  board stair) - the experiment was reverted.
- mash level (L35): knight 4 deaths, warden 4, pyro 3, all lowest hp 0% - the mash bot cannot clear it.
- level-quality ksar / glasssea / welltown: CLEAR THE BAR. Caravan (not gated) misses bands / mechanics / roles - pre-existing, untouched.
- level-1 pilot (curve, act 5 wants <= 12 deaths in 3 runs): five samples of the same level hash read 14 / 12 / 11 / 15 / 12 - BORDERLINE;
  the committed curve row is the 12 sample (the median). See QUESTIONS 2.
- campaign walker (human+first, 1 seed): after the stair fixes, 600 s frame cap: warden 3 deaths (2 spike falls at the 3rd/4th breaches + 1 sun), arrive 57%, walked 63%; knight 0 deaths, arrive 59%, walked 91% (no STUCK - the tower stair passes now; ran out of frames in the alley/tower section, 321 s); pyro 1 death (a fall), arrive 92%, walked 91%, STUCK once at the powder run (652,33, the carry-a-keg wall - it passed there on the earlier run). Target (1-2 deaths, arrive < 50%): warden a death over, knight + pyro too comfortable. Before the fixes: knight + pyro STUCK at the tower stair, warden 4 deaths / 29% walked. Next: walker hands for the powder-run carry (the walkHint runs the stack -> wall loop; the pyro dropped out of it once) and a 2nd seed when the PC is quiet.
DESERT RE-CHECK (sun v2): Glass Sea god routes all 7 heroes (first lane); desert mash rows re-stamped, all hold. Desert bosses WITH FLASKS under
the sun v2 drain (Dune Worm, the Well Town boss, the Colossus by day) were NOT re-measured - the PC could not hold a page; see QUESTIONS 3.

## Checks run (resume)
tools/ksar.mjs 214 ok; tools/glasssea.mjs 126 ok; tools/caravan.mjs all passed; tools/tells.mjs ok; tools/mash-gate.mjs 41 levels hold;
tools/level-quality.mjs ksar glasssea welltown clear; boss-rates ksar human+dry; level1-pilot x5; mash-bot --level glasssea, ksar; level-walk ksar.
Not run: the full suite (machine at 100% all morning).

## For the SONNET ART LANE (part B) - everything here is greybox
- **FORTRESS READ** (`src/redraw/ksar_set.js`): curtain walls with crenellations along the outer wall walk (72-231) and the alley; corner towers
  (tower two 97-102, tower three 158-164, the hawk tower, the alley tower 790-795); a GATEHOUSE silhouette at 257-272 with the portcullis, grille
  and winch; arrow slits; banners; the keep over the souq as the landmark in view on most screens.
- **THE HAWK-MISTRESS REDRAW** (`src/hawk-mistress-hands.js` poses + `KSA.bakeMistressSet`): silhouette, turban/veil, layered robes, gold,
  the gauntlet and scarred falconer's arm; the hawk hooded with jesses; real windups for lashTell / snareTell / fanTell (three knives fanned high
  / mid / low on the hand) / kegTell (the kick) / hawkGrabTell + rakeTell (the whistle); the leap pose (today walkA); an idle with personality
  (whistles the hawk back, taunts).
- **THE ROOFTOPS**: three flat roofs (parapets, rugs, drying racks), the two SPIKED SHAFTS with an UPDRAFT read (heat shimmer + rising grit -
  today an orange wash and grey triangles), the roofs' gongs and flask racks.
- **NEW PROPS**: the powder store and its kegs (set / lit / carried / fused), the bricked walls and their rubble when blown, reed barricades
  (whole / burning / burnt), torch racks + a carried / flying / burning torch, the raised rope bridge (raised / burning / down), the powder trail
  (dry / lit, the fire running), archer nests (blinded state), zip-line rigs (posts, anchors, the handle, a cut rope's dangling end), raider lines,
  the alley tower's zigzag stair (boards today), awnings everywhere (they are the shade: their footprints must stay readable).
- Keep the SUN v2 reads (shade footprints, shimmer, hero heat, HUD sun) legible over the new art.

## QUESTIONS FOR DANIEL
1. **The warden vs the Hawk-Mistress**: 3/8 with flasks, 1/6 dry (knight 7/8, pyro 5/8). Rec: leave the boss at 63% overall and let the hero-
   balance lane look at why the warden trails here (not diagnosed in this lane). Built: nothing (in band overall, no hero 0/N).
2. **The Ksar's level-1 curve is borderline** (L1 knight 11-15 deaths in 3 runs; the act-5 bar is <= 12) since the level grew to 862 columns
   with the sun v2. Rec: accept (it is the longest desert level and the curve is an L1 hero on an L35 level); if it flips red in the suite,
   ease the keg alley's second break (763-765) to a hurt-pit. Built: the median sample committed.
3. **Desert bosses under the sun v2 drain** were not re-measured with flasks (Dune Worm, Well Town, Colossus). Rec: the batch's re-measure lane
   runs `boss-rates.mjs caravan,welltown,glasssea --profile=human` when the PC is quieter. Built: nothing.
4. **The lab-reload deadline**: rec keep `LAB_BOOT_MS` (default unchanged 90 s) and have the coordinator cap parallel page lanes at ~6.
