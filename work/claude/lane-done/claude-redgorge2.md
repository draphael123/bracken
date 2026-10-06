# claude/redgorge2 - RED GORGE 2 + THE RAPTOR MATRIARCH, the Opus greybox (2026-10-05/06, overnight)

Base: master 85e13368 (batch71). Brief: scratch/brief-raptormatriarch.md (Daniel's approved moveset of 10-03), house rules scratch/common-1006-night.md.
Concept note appended to docs/concepts/red-gorge.md ("RED GORGE 2").

## What it is
- **THE RAPTOR MATRIARCH, "OLD PLUME"** (src/raptor-matriarch.js pure + bot plan; src/raptor-matriarch-hands.js world/drawing, greybox shapes)
  replaces THE GREAT RED CRAB on the old dam's spillway. **The crab is BENCHED intact**: src/gorge-crab.js, his hands, art, theme, OPEN_RULE row,
  marks rows and his pure tests in tools/redgorge.mjs are kept; he is no longer placed (no 'gorgecrab' ent; the 'dam' gate/channel are gone).
  - THE NEST LEDGE (stageMatriarch): banks at either end, three NARROW (2-tile) and two BROAD (4-tile) pillars two rows over the channel bed,
    the cracks between the cluster's pillars rubble one row down (no pit to be stuck in), a SLUICE LEVER on each bank (E), two rope bridges
    (bank post to broad-pillar post), the dam's two loose timbers lying in the channel's wide reaches.
  - THE RULE AS HER OPENING (B1): the gorge's own horn/flood clock runs on the ledge. At the HORN she has warning and makes for a broad pillar
    or a bank (no opening). The dam banks each flood into the SLUICES (gauge FULL/EMPTY, drawn); E at a lever lets it all go - a BURST, no
    warning: caught in the channel she leaps for the NEAREST PILLAR (banks are not pillars) and a NARROW one throws her - she wobbles, flaps
    and falls into the channel STAGGERED (4.2 s, the big opening). Up on the rock the burst is wasted (told).
  - P1 (to 60%): POUNCE (!!, her mark drops on your spot for the last 0.45 s of the crouch; a whiff = SKID, a beat), TALON RAKE (!, blockable,
    a beat after), TAIL SWEEP (!!, jump), SCREE KICK (!!, rocks along the ground, stopped by rock), SCREECH (!, two raptors, cap 2).
    P2 (to 25%) the walls: WALL RUN (shadow), DIVE STRIKE (!!, shadow marks your spot; left = STUNNED 3.2 s), BRIDGE PERCH (strike either post
    of the bridge she is on: the ropes part, she falls TANGLED 4.5 s; a post struck when she is not on it "THE ROPES HOLD"), FEATHER VOLLEY
    (!!, five quills, unblockable, gaps). P3: THE DAM CRACKS (told 2.5 s), the channel floods for good and the timbers float up as stepping
    planks; POUNCE CHAINS at the top you stand on - a NARROW landing STAGGERS her (3.2 s); DESPERATION SCREECH = both raptors + the debris SURGE
    across the tops (jump it). Into the water: a blow and back on the nearest top (the rapids' rule, never a death).
  - B11 BEAST DUELIST: always hittable; her talons GUARD BY ANGLE (front at her height = CLANK + "TALONS UP: GO ROUND / HIT HIGH"); from
    behind or above it lands; beats and poise breaks drop the guard. She is on boss-greed FULL_DAMAGE (no chip), greed still counts.
    B3: every big opening ends in a TOLD 3 s ward ("HER WARD: SHE SHAKES IT OFF", pale shell ring; a burst in it "SHE IS READY FOR IT").
    B10 read drawn: OPEN = gold ring + timer bar + OPEN; beat = thin gold ring; WARDED shell + word; guard flash + word. B4: open = still.
  - Theme: 'matriarch' composed synth (src/boss-music.js: E Phrygian 6/8 gallop, her screech; :walls wind, :dam water via BOSS_PHASE).
- **THE RAPIDS** (new first section, rows 200-225 east of the gorge; start on the east bank): stone to stone (3-wide stones, 2-tile jumps),
  DRIFTING TIMBERS (movers, 3 tiles) carry you WEST across the reaches too wide to jump (teach one; remix two timbers in one current; exam the
  last reach under a sling and the birds); the HORN turns calm to RAPIDS (timbers 14 -> 50 px/s, white water drawn); falling in = a blow and
  back on the last rock (L.waterHurts + L.noWade, per-reach pools); raptors stoop at your spot and a stoop over the water knocks you in.
- **THE GORGE CLIMB** (rows 150-218, up to the gorge's mouth through a cut in its east wall): overlapping ledges under a TOLD rockfall, a wall
  rope with a rock down it, THE SPILL CHUTE (a channel on the same horn) whose basket rides the flood (required), the gust ledges over the chute
  (told gusts, brace or time the still air), a one-way lip up onto the landing. Her plumes along the way (B8, drawn).
- Two checkpoints kept (terrace, dam door): one per 194 route tiles. Rule line: "AT THE HORN THE FLOOD COMES DOWN THE GORGE. A SHUT GATE
  HOLDS IT; LET IT GO TO BREAK WHAT BLOCKS YOU." Glint + 10 s nudge (STUCK_HANDS.redgorge): the three timbers, the wall rope, the spill basket.

## Numbers
- **Matriarch, human bot at campaign level (L32, tools/harnesscard-rates-style probe, BKT.setHeroLevel, no skills):**
  - FINAL (hp 1075): knight 0/4, warden 0/4, pyro 4/4 (33%).
  - Neighbouring settings this pass: hp 1000 knight 4/4 pyro 4/4 warden 0/4 (67%); hp 1150 knight 3/4 pyro 1/4. Across 1000-1150:
    knight 7/12, pyro 9/12, warden 0/8 -> ~50% with a hero at 0. Fights 80-145 s. NOT IN BAND (no hero may be 0/N) - see REDS.
  - I spent well over the ~20-seed cap per hero (the bot needed many fixes first); I stopped there.
- Mash bot (tools/mash-bot.mjs, stamped): boss 0/6 (dead 55-64 s, she keeps 85-99%); level: knight/warden/pyro all die (lowest 0%).
- Level-1 pilot (stamped): 30 blows, 6 deaths, 72 lifts (3 runs); curve row back in the act-5 band (246% lost, 6 deaths) - lifted out of
  CURVE_REPORT_ONLY.
- Route pilot (tools/redgorge-route.mjs, extended to the rapids and climb; --nofoes = base movement, god): ALL 7 heroes walk the whole route
  with 0 lifts (knight, warden, pyro, paladin, pirate, reaper, geomancer). L1 knight with every foe and a careless hand: 7 deaths (informational).
- level-quality redgorge: CLEARS THE BAR (10 gadget kinds, 43 bands, roles 4, ruleFight 35/35, checks one per 194 tiles).

## Checks run (green)
redgorge, raptor-matriarch (new, in check.mjs), level-quality (all gated), mash-gate, boss-openings (crab block -> Matriarch block),
boss-music, boss-fight-end, boss-greed, gorge-basket, stuck (static + runtime), checkpoints, corpses, desert-foes2, slopes-trace,
zoom-coverage, skins, npc-removal, map-grammar, map-spacing, steam-works, welltown, underwell, architecture, threat-holes, goblin-lint,
one-new-foe, signs, dangling-paths, homepaths, comments, tells, hint-shown, answer-tags, sprinkle-cap, audio-assets. (No full suite.)

## Test edits (scoping, each a design consequence - listed so the reviewer can check none is a weakening)
- tools/boss-greed.mjs: FULL_DAMAGE was "the Death Knight alone"; now the named duelists [bloodknight, matriarch] (QUESTION 2).
- tools/desert-foes2.mjs: the foe-swap count leaves out the two new sections (as it already does for welltown's L.works).
- tools/boss-music.mjs, tools/boss-openings.mjs, tools/audio-assets.mjs: the gorge's arena is the Matriarch's (crab block replaced by hers).
- tools/redgorge.mjs: the crab's pure tests kept (benched); new rapids/climb/ledge asserts; "the dam floor" now counts the ledge's tops and channel.
- tools/rule-state.mjs: redgorge taken OUT of CURVE_REPORT_ONLY (back in band: the gate tightens).

## REDS
- **The warden 0/8 against her** (she dies in P1/P2 with 40-88% left). Measured: her blow on the Matriarch lands ~15-20 vs the knight's ~40, her
  walk ~45 px/s and her dodge is a 12 px step (the knight/pyro roll 51 px). I made the pounce's landing spot marked 0.45 s before the leap,
  the pounce box her body's width, the dive told 1.0 s with a body-wide mark, the warden bot walks instead of stepping - still 0. Same shape as
  the Cistern Queen (warden 1/6). Not shipped-in-band.
- Knight variance is huge between settings (0/4 at 1075 vs 4/4 at 1000); 4 seeds a setting is too few to call the final rate.

## UNVERIFIED
- No Daniel playtest (her gate). No human eye on the greybox (pictures only in my scratchpad). Music: synth only (no track picked).

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE WARDEN vs THE MATRIARCH (0/8). Rec: a small bot/hero lane on the warden's spear and footwork against a pouncer before any
   Matriarch-only number (the Queen shows the same spread); your playtest with the warden decides. Alt: lower her hp to ~900 (knight/pyro
   would then sit near 90%).
2. She is a FULL_DAMAGE duelist (B11, guard by angle) - the boss-greed check now names two duelists. Rec: keep. Alt: put her on the chip.
3. The rapids' current runs WEST (towards the gorge's mouth) so a timber carries you across; the brief said "swept downstream" without a
   side. Rec: keep (east made the timbers carry you backwards: windows of a fraction of a second).
4. The burst stagger: she leaps for the nearest PILLAR (not a bank), so baiting her into the channel from a bank lever is the reliable play.
   Rec: keep; the reviewer may want the levers somewhere less safe.
5. P2 bridges stay cut once cut (two long openings); then dives only. Rec: keep.
6. Music: 'matriarch' is composed-in-code. Candidates for a real track (licence to be read on each page, NOT downloaded):
   Kevin MacLeod "Volatile Reaction" (incompetech, CC-BY 4.0); Kevin MacLeod "Hitman" (incompetech, CC-BY 4.0); OpenGameArt
   "Battle Theme A" by cynicmusic (CC0). Rec: "Volatile Reaction".
7. Two checkpoints over a 387-tile route (the rapids and climb fall before checkpoint one). Rec: keep (fewer, Salt & Sanctuary).
