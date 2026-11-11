# hollowmanor: THE HOLLOW MANOR + THE CASTELLAN'S GHOST (opus greybox, behind MANOR_SHIPS)
Branch `claude/hollowmanor` (off master 9f29067e9 = batch156), pushed. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\wt-hollowmanor`. Not merged, not deployed.
Code tip b0dad1b15 (the report commit sits on top). Plan: scratch/lane-reports/hollowmanor-plan.md (no own brief: the 10-01 haunted-levels concept + Daniel's 10-15 placement).
Verdict: **READY AS A GREYBOX.** Code only, node-checked flag off and on. Not browser-walked (no headless browsers), no art, boss not tuned.

## Built
- **Flag:** `src/mn-flag.js` MANOR_SHIPS = false; `mnOn()` = the flag, `?mn=1`, or `globalThis.__MN` (`tools/mn-on.mjs`). Flag off = master exactly (LEVELS / burial /
  witchlight hash = master 9f29067e9's, taken from a `git archive` export before any edit). ('HMH' is taken in main.js: the hands are MNH, the boss hands CSH.)
- **Road:** THE BURIAL CAVERNS -> THE HOLLOW MANOR -> THE WITCHLIGHT STAIR. The LEVELS row is APPENDED only while mnOn(), AFTER `applyInserts` (so it runs after
  silk's push): it takes the stair's CURRENT needs (burial on master; 'silk' when claude/silk lands -> Burial > (Wispwood) > Silk > Manor > Stair, Daniel 10-15),
  then `witchlight.needs = 'manor'`. Old saves: `mnRoadMig` (flag on, once) through `PROG.roadOpen` + levelLocked's existing roadKept clause - no levelLocked edit.
  Map node (192,78), plate right (see Q6).
- **Level** `src/hollow-manor.js` (340 x 40). Rule: 'THE HOUSE MOVES WHEN YOU LOOK AWAY. THE ARMOUR MOVES WHEN A GHOST GETS IN.' Dark 0.42; ONE accent ghost-green;
  the landmark = the great hall's tower and its lit high window over the roofs (drawBack, greybox).
  - 0-59 THE SERVANTS' HALL (teach): up the cellar stair; the first suit + its rack; THE MOVING DOOR (REQUIRED TURN: its doorway is high until you face away);
    portrait 1; the first boo.
  - 60-139 THE PORTRAIT GALLERY (test): the poltergeist taught, portrait 2, THE SHIFTING STAIR (REQUIRED TURN) up to a balcony ten rows up; boos; a low hall pocket
    under the balcony (a suit, coins); SILVER 1 behind a bookcase that swings when nobody faces it (an alcove hung from the roof).
  - 140-209 THE LONG GALLERY (remix, THE BLACKOUT set piece): take the candelabra; past the door the candles flicker and go out one by one; 5 shades wake and come
    through the walls; a high walk and a low hall; relight candles to make wards. SHRINE 1 (col 198).
  - 210-273 THE NURSERY WING (exam): a moving door among suits, poltergeists and boos; portrait 3; THE SEALED NURSERY (three keys) = SILVER 2.
  - 274-287 THE ARMOURY DOOR: SHRINE 2 (col 280). 288-339 THE GREAT HALL: the boss. Checkpoints START + 2 (checkRun 200). Placed by hand (calm). No goblins.
- **The verbs** `src/manor-hands.js` (every changed cell kept and put back on a reset):
  - TURN YOUR BACK: a panel swaps ONCE when a hero is near (260 px) and none faces it for 0.6 s (the boo's `watched` rule), then waits to be watched again. Never
    while a hero or foe stands in/by its cells. Drawn: an EYE (open while watched) + the other state dotted. Built grid = the open state B (no floating walls).
  - KNOCK IT OUT: a possessed suit falls -> its WISP flies 3.5 s to the nearest empty suit (rack, else its own pile) and stands it up (told 1.0 s, IT RISES);
    a blow on the wisp = LAID TO REST. A ghost stands suits up at most twice, then fades (no XP farm).
  - LIGHT: a candelabra stand (touch/strike = carry, lit); a lit flame relights candles; a lit candle relights a snuffed candelabra; a lit candle is a ward shades
    will not enter nor lunge into. Portraits: a blow = a key; three open the nursery.
- **Foes:** POSSESSED SUIT (`armour` + cnSkin 'mnsuit', 70 hp, heavy): told THRUST (0.8 s, !, 14), every 3rd a told CLEAVE (1.0 s, !!, 20, unblockable) that BITES THE
  FLOOR when it misses (STUCK 1.4 s, x1.5). SHADE (`haunt` + 'mnshade', 20 hp, runner): asleep in the walls until the blackout, then phases after you, told lunge (!!, 10)
  that SNUFFS the candelabra. BOO: master's, unchanged. **THE POLTERGEIST** `poltergeist` (the one new foe, 30 hp, ranged): faint/phased (x0.5) until it LIFTS a chair /
  plate / candlestick / book (told 0.8 s, !) and throws it (10, blockable: CLATTER); SPENT 1 s after (x1). MARK/ANSWER/HEIGHT rows in src/marks.js.
- **Boss THE CASTELLAN'S GHOST** `castellan` (3200 hp): pure fight `src/castellan.js`; world, POSE table, sounds, greybox `src/castellan-hands.js`.
  - B15: x0.45 in the armour, x0.4 on the knight's shield (front), KNOCKED HALF OUT = OPEN x2 3 s capped 12%/opening; never untouchable. Set floors 80/60/40/20%.
  - ONE SET AT A TIME, four racks, the live visor lit, the bar names the set; break a set -> HE LEAVES IT (told 1.4 s) for the next rack. Openings earned by an ACTION:
    KNIGHT thrust (0.8 s !, blockable 16) / SHIELD BASH (0.7 s !!, a 135 px lunge, 18): DODGE THE BASH -> stumble. HALBERD low sweep (0.7 s !!, jump, 16) / OVERHEAD
    CHOP (1.0 s !!, 22, aimed where you stand): MOVE -> it bites the floor. DUELIST feint (a ! that never comes) / lunge (0.5 s !, blockable 14) / FLURRY (3 stabs 0.35 s,
    blockable 10): BLOCK ALL THREE -> winded. GREATSWORD ARMOUR-BREAKER (1.2 s !!, unblockable 26) / WHIRL (1.0 s !!, 2 spins 20): hit no one -> dizzy.
  - FINAL (20% -> 0) HE SWAPS BODIES MID-COMBO: 3 moves, each from a different rack (that visor lights 0.5 s first), then his WISP crosses the hall 1.8 s:
    STRIKE THE WISP -> knocked out, OPEN (x2, 6% cap) - the level's verb.
- **main.js:** 19 single tagged lines `(claude/hollowmanor)`, all behind mnOn()/MNH/CSH/their ents. Dev: `?mn=1&dev=1`, `&mnsec=1..4`, `&mnboss=1`, `?mn=1&boss=castellan`.
- **Shared one-liners:** src/level.js (import + push after applyInserts), src/threat.js (tail), src/marks.js (BY_HAND row + Object.assign before marksMissed),
  tools/level-quality.mjs (GATE 'manor', REPORT_ONLY music/pilot/mash/curve, ROLES pushes after the literal), tools/additional-areas.mjs (road pairs).

## Node checks (no browser, no check.mjs; free RAM 4.8-5.3 GB before each batch; logs scratch/hollowmanor-logs/)
- **tools/manor.mjs: all ok, flag off and on.** Off: master signature, old-save rule over 4 fake saves untouched, 19 hooks guarded, the hands take only their own skins.
  On: road + grandfathering (4 cases); build; the fill reaches every shrine/silver/stand/portrait/rack/the boss; **REQUIRED TURNS proved** (moving door, shifting stair,
  wing door: far side out of reach in state A, in reach after a turned back) + the watch rule (facing = nothing, 0.3 s = not yet, 0.6 s = moves, once, back again
  after a watch, never with a hero in the doorway, never with nobody near); bookcase secret; nursery (2 keys shut, 3 open); reset; blackout (flicker then out, 9
  candles); ward (0 hurt in 4 s in the light vs 50 + snuffed in the dark); suits (thrust, cleave -> stuck), wisp -> rack -> rises, struck -> rest, fades after 2;
  poltergeist (phased x0.5, lift + throw 10, blocked = clatter).
  - **Castellan bot** (40 sword, 640 hp pool, answers 75% of tells): WINS in 93 s with 564/640 left; sets in order (12.9 / 10.7 / 15.4 / 15.1 s, final 39.3 s);
    openings earned: dodged bash 1, chop bit the floor 2, flurry blocked 1, whirl missed 2, wisp struck 2; 2216 dealt open vs 1048 through the armour; every move out of
    its own windup (4 seeds). A bot that never answers: 1 lucky opening, DIES at 101 s. Damage maths: 40 -> 16 shield / 18 armour / 80 open; cap and set floor hold.
- **level-quality manor (flag on): CLEARS THE BAR** - vs Mage's Folly: flat 0% (Folly 11%), bands 5 / 44%, gadgets 6 kinds / 4 developed (Folly 12/4: mnrack x10,
  mnshift x4, mncandle x3, mnportrait x3), secrets 2 (Folly 3), checks 2 (1 per 156 route tiles), density 1.42 (Folly 1.03) / 8% empty screens (Folly 23%),
  4 roles, 5 ranged, route 14 rows / 2 pockets (Folly 30 rows). WARN (report-only): pilot, mash, blocking 18%. Full gate passes flag on AND off.
- **ok flag on AND off (25 tools):** checkpoint-gaps, checkpoint-stand, solid-islands, signs, spawns, killzones, boss-read, answer-tags, tells, one-new-foe, goblin-lint,
  deadends (2, both pay), map-grammar, map-spacing, map-roads, additional-areas, blow-tags, threat-holes, foe-pass, death-fx, comments, architecture, route-insert,
  floating-geometry (listed: 13 one-way galleries), anchor-lint (listed: 2 cantilevers).
- Fixed on the way: a filler shrine at col 103 (shrine 1 moved to 198), the moving doors floated in the permissive grid (built grid now = state B), HEIGHT 'mid'
  is not a row (now 'high'), a whirl that hit every frame (blows keyed per move), the map node crossing the stair->folly road.

## Owed
- **Browser walk** (dev URLs above), never run in a page. Watch: the eye read and the swap timing (0.6 s) at each panel, the stair appearing behind you, suits'
  told thrust/cleave on the master armour sprite (my modes are new to its poseOf), wisp flight + rise, blackout pacing (1.4 s a candle), shade lunge vs a carried
  flame, candle touch height, poltergeist throws, every Castellan move + the four openings + the final's swaps and wisp, co-op.
- **Art lane (sonnet, >= B before live):** manor kit (grey stone, faded green damask, NOT generic wood), panels (bookcases, doors, the stair), candles/candelabra,
  racks + piles, portraits, the nursery door, the tower landmark, shade + poltergeist + furniture, suit skin with a lit visor, THE CASTELLAN (four sets + wisp;
  POSE table is the brief; `src/redraw/castellan_art.js` to come); map node art + blurb; transition rows (cellar stair in from the undercroft).
- **Tune (n=6 WITH flasks, 60-70%, mash 0/6, 90-150 s):** boss-run/boss-rates need `--mn` (globalThis.__MN in the page). The node bot's 93 s is a skilled reader:
  hp likely fine. Page tools not run: level1-pilot, mash-bot, map-scale, map-forks, reach-heroes, stuck, textfit (mn-lines), hint-shown, mobile-perf, boss-openings, boss-greed.
- **Music:** borrows 'cave' + 'boss3' (report-only). **Map spot:** (192,78) passes on master only (Q6).
- **Not built:** bestiary cards (poltergeist, castellan, skins), boss-rush row, SAY_LINES routing of mn-lines, tools/manor.mjs not wired into check.mjs,
  the Plague Village (the 10-01 concept's sister level).

## Merge notes
- **claude/silk:** textual clash in tools/additional-areas.mjs (same line: combine to burial>silk>manor>witchlight), tools/level-quality.mjs GATE line (keep both ids),
  and src/main.js right after `const DESERT_PATH` (both node lines: KEEP SILK'S FIRST, then MN_NODE, so the map reads silk > manor > stair). level.js is order-safe
  (mine runs after applyInserts, silk's before). Other main.js/marks/EHP lines sit at different anchors (one unchanged line apart).
- **claude/wispwood / claude/academy:** additional-areas same line; GATE line. Academy's stair->academy->folly is after the stair: no `needs` clash.
- **The map:** wispwood (142,74) + silk (168,70) + academy (184,58) ALREADY fail map-spacing together without the manor (silk/academy plates have no free side);
  adding the manor at (192,78) only adds a manor<->academy node-box overlap. Needs one relayout of the inland stretch Burial -> Folly.

## Questions (rec = what I built; none block)
1. **Rule/verbs:** TURN YOUR BACK (panels) + KNOCK IT OUT (suits/wisps) + LIGHT (candelabra blackout). **Rec: keep** (all three from your 10-01 concept).
2. **A ghost re-possesses at most twice** (then fades), and a blow on its wisp lays it to rest. **Rec: keep.** Alt: unlimited until laid to rest.
3. **Poltergeist vs the haunt:** the haunt already throws a pitchfork; the poltergeist throws furniture, phased between throws. **Rec: keep** (your concept's one new foe).
4. **No relic in the nursery** (11-01 'no relic rewards'): silver + coins. **Rec: keep.**
5. **Castellan 3200 hp, four sets x 20% + final 20%**; node bot 93 s. **Rec: tune lane at n=6 with flasks** (likely 3200-3600).
6. **Map node (192,78)**, east of the burial->stair line: the only master-clean spots clear of where Silk/Academy sit. **Rec: one map lane relays the inland
   stretch when Wispwood/Silk/Manor/Academy merge** (they crowd it even without the manor).
7. **Panels swap once per look-away and never with someone in them**; the stair goes again behind you (a drop back down is the way back). **Rec: keep.**
8. **Pits:** none in the manor (it is a house). **Rec: keep.**
9. **Music:** 'cave' + 'boss3' borrowed. **Rec: Daniel picks** (a creaking-house level bed; a stately, haunted armoury boss theme).
10. **Checkpoints START + 2** (198, 280). **Rec: keep.**
