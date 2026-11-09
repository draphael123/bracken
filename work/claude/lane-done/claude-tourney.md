# tourney: THE TOURNEY + THE CHAMPION (opus greybox, behind TOURNEY_SHIPS)
Branch claude/tourney (off master 85d152eb8), pushed. Not merged, not deployed. Tip: see the push (this file is in the tip commit). Plan: scratch/lane-reports/tourney-plan.md.
Verdict: READY as a greybox (code-only, node-checked). Not browser-walked, no art, boss not tuned.

## Built
- **Flag:** `src/ty-flag.js` TOURNEY_SHIPS = false; `tyOn()` = the flag, `?ty=1`, or `globalThis.__TY` (`tools/ty-on.mjs`). Flag off = master exactly (proved).
- **Road:** WAYMEET -> THE TOURNEY -> THE TOWPATH. LEVELS row APPENDED only while tyOn(); then `towpath.needs = 'tourney'`.
  Old saves: `tyRoadMig` (flag on, once): Waymeet or the towpath cleared -> `PROG.towpathOpen` (levelLocked clause). Map node at inland (24,116).
- **Level** `src/tourney.js` (372 x 40, ground row 30), rule 'THE LISTS RUN ONE WAY. MEET THE LANCE, OR LEAVE THE LANE.' Sunny (default sky), not haunted.
  - 0-43 THE GATE MEADOW (teach, foot): a tilt lane with a LANCER and its TILT RAIL (one-way, 2 rows up, a gap you must drop through), the first QUINTAIN, its CARRY up to the stable loft (silver 1).
  - 44-119 THE PRACTICE LISTS (teach, MOUNTED): rings, a hurdle, the bank, a ditch, a quintain at the gallop, a horse archer on the bank, a lancer to unhorse, the groom.
  - 120-175 THE GRANDSTANDS (develop, foot): five tiers and the back wall the road goes over, the royal box, two rigging lines (zip, bunting), knights, a crossbowman, the first horse archer. Shrine 172.
  - 176-264 THE GREAT LISTS (twist, MOUNTED): the high list, the water jump (dry ditch in greybox), the sunken list, two lancers the other way, two horse archers, rings + targets, hurdles.
  - 265-299 THE PAVILIONS (exam, foot): tents, the quintain on the high pavilion's roof -> the crow's nest (silver 2), the armourer's cellar (a paid pocket), knights + an archer. Shrine 296.
  - 300-371 THE CHAMPION'S LISTS: the boss. Checkpoints START + 2 (checkRun 200). Mounted: 162 of 302 run columns (54%).
- **The horse** `src/tourney-hands.js`: positional rides (L.ty.rides). Open lists = THE MINECART'S PACE MODEL (imports src/minecart.js `cartSpeed`/`MC`: trot 150, RIGHT gallop 230, LEFT rein to a walk 50, never back); a hurdle ridden into = told bump (12) + bounce. Arena = two-way (LEFT/RIGHT gallop, nothing pulls up), ends when he is unhorsed.
  **Couch = HOLD ATTACK** (a tap still swings; main.js swallows the heavy in the saddle): lowers 0.18 s, holds 1.4 s, then the arm TIRES 0.7 s. At pace >= 110 it takes rings, targets, spins quintains, UNHORSES lancers (main's own unhorse) and horse archers; dmg = swordDmg x 1.5.
  **Quintain:** struck -> arm comes round told 0.45 s: upright = 10 + flung; ducked = passes over; BLOCK = carried up, no hurt (L.strikers tells the reach: both silvers are reached only by the carry, proved).
- **New foe (one):** THE HORSE ARCHER `tyarcher` (64 hp): circles its beat, told draw ('!', MARK/ANSWER/HEIGHT rows), aimed arrow 14 (blockable); x0.6 in the saddle; couched lance unhorses him -> shoots standing.
- **Boss THE CHAMPION** (`tychampion`; 'champion' is the Admiral's) `src/ty-champion.js` (pure) + `src/ty-champion-hands.js` (world, POSE table, greybox draw). 2800 hp, x0.45 outside openings, x2 in them capped 14%/opening, P1 floor 50%.
  - P1 MOUNTED JOUST: wheel -> pass; lance drops told at 170 px ('!!', the GOLD BOSS glints); cross him couched at pace = CLEAN, his lance SHATTERS -> LANCELESS (open) until his SQUIRE runs a new one out of the pavilion; strike the squire (blow or lance) = he drops it (next in 2.5 s), cap 9 s then he fetches it himself. Uncouched = his hit 22 + knock (blocked 11). From pass 3 he FEINTS (late drop, 92 px). Near him on the wheel: LANCE SWEEP (0.55, 16, blockable). Nobody ahead of his lance = he wheels early (no stall). 3rd shattered lance or a clean pass at the floor = UNHORSED (open 2.5 s) -> P2, your horse led off.
  - P2 ON FOOT: FLAIL (0.6, 18, blockable), OVERHEAD every 3rd (0.9 '!!', 26, unblockable; a whiff = MIRED open 1.3 s), SHIELD RUSH (0.7, 16 + knock), THE HERALD'S HORN = one rival knight at a time (sworn sword / hedge knight). Behind his shield: x1.
- **main.js:** 24 single tagged lines `(claude/tourney)`, every one behind tyOn()/TYH/CPH/its ents. Dev: `?ty=1&dev=1`, `&tysec=1..5`, `&tyboss=1`, `?ty=1&boss=tychampion`.
- **Shared one-liners:** src/level.js (import + guarded push), src/threat.js, src/marks.js (horse archer rows + LANCER ANSWER/HEIGHT rows: block / low - the lancer is a common foe now), tools/level-quality.mjs (GATE, REPORT_ONLY music/pilot/mash/curve, ROLES ranged tyarcher), tools/additional-areas.mjs.

## Checks (node only; RAM checked >= 2.5 GB before each batch)
- **tools/tourney.mjs: all ok (flag off and on).** Flag off: LEVELS / Waymeet / towpath signature = master 85d152eb8 (hashed from a `git archive` export), the save rule + gate clause over 4 fake saves = master, all 24 hooks guarded. Flag on: road + grandfathering (4 cases), build, reach, carry load-bearing, horse paces, hurdle, couch + tired arm, ring at gallop / nothing at a walk, quintain upright/duck/brace, gallop past the arm, lancer + archer unhorsed, arrows blocked, groom, arena two-way, B15/B16, the Champion end to end.
  - Bot (30 sword, 640 hp pool): perfect reads W 86.6 s 640/640 (3 passes, 3 clean, P2 at 22 s). Misreading 30%: 6/6 W, 388-506 hp left. Misreading 50%: 6/6 W, 202-414 left. Without the couch: LOST (no joust to win). **He reads SOFT for a node bot - see tune.**
- **level-quality tourney (flag on): CLEARS THE BAR** - bands 6 / 48% multi-height, 7 gadget kinds / 5 developed, secrets 2, checks 2 (1 per 175), density 1.08 (1 empty screen), 3 roles, route 20 rows / 2 pockets. WARN (report-only): music, pilot, mash, ruleFight. Full gate flag on and off: every gated level clears.
- **ok flag on:** deadends (2 pockets, both pay), spawns, killzones, checkpoint-gaps, checkpoint-stand, boss-read, signs, answer-tags, solid-islands (every board on drawn timber: L.structures), anchor-lint + floating-geometry (listed only).
- **ok flag on AND off:** map-grammar, map-spacing, map-roads, additional-areas.
- **tells.mjs fails identically on master** ("MARK is not the table this audit writes: run --write") - pre-existing, not this lane.
- **MISTAKE, disclosed:** I ran tools/map-scale.mjs in the map batch without checking it first; its step 4 opens a headless page (tools/cdp.mjs). It errored at openPage on both runs; afterwards the only headless Chromes on the PC were the release suite's (tools/visible-supports.mjs, parent alive) - nothing of mine was left running and I killed nothing. map-scale stays OWED (browser).

## Owed
- **Browser walk** (dev URLs above): the horse (paces, hurdle bump, the -8 px seat), couch/tired/ring/target, the quintain carry to the loft and the crow's nest, the tilt rail vs the lancer's charge, the rigging lines, the archer, every Champion move + the squire + P2 + the win; a co-op still (two horses).
- **Art lane (sonnet):** all greybox - horse + mounted hero pose + lance, the barded charger and THE CHAMPION's POSE art (`src/redraw/ty_champion_art.js` to come), squire, horse archer, quintains, rings/targets, tilt rails/posts, hurdles, grandstand + royal box, tents/pavilions, stalls, the water jump (make it water), Waymeet's wall, bunting; map node art + blurb; transition rows.
- **Tune (n=6, with flasks, to 60-70%):** boss-run / boss-rates need a `--ty` flag (sets `globalThis.__TY` in the page, as `--gt` / `--ft5`). The page bot has never couched a lance: it needs a pilot hook (hold ATK at ~0.45 s before the crossing). Node bot says he is soft (2800 hp).
- **Page tools not run:** level1-pilot (pilot + curve rows), mash-bot (mash row), map-scale, map-forks, reach-heroes (the quintain carry for every hero's legs), stuck, textfit (ty-lines), hint-shown, mobile-perf, boss-openings, boss-greed.
- **Not built:** bestiary cards (tyarcher, tychampion), a boss-rush row, MARK rows for the Champion's tells (he wears his own !/!! via ctx.number), no roll suppression in the saddle (a roll is overridden by the horse's pace but still animates), tools/tourney.mjs not wired into check.mjs.

## Questions (rec = what I built; none block)
1. **Map node (24,116), north of Waymeet:** the only body-of-sheet spots that cleared grammar + spacing were this V (Waymeet -> north to the meadow -> down to the towpath -> up the canal) or an out-and-back spur east of the towpath (60-100,154). **Rec: keep (24,116)**; the art lane may relay the inland sheet.
2. **A mounted boss** after you cut the Queen's Lance's horse (10-29, "looks weird on the horse"): the brief's Q3 = A is a mounted joust. **Rec: keep, and make the barded charger + mounted hero the art lane's first item**; P2 is on foot anyway.
3. **The horse is forward-only in the open lists** (the cart's model, the shared code) and two-way only in the boss lists. **Rec: keep.**
4. **Couch = HOLD ATTACK** (tap still swings). **Rec: keep.** Alternative: DOWN + ATTACK.
5. **Quintain carry:** BLOCK = flung up unhurt, upright = 10 + flung, duck = clear. Both silvers need the carry. **Rec: keep.**
6. **The water jump is a dry ditch** in the greybox. **Rec: the art lane makes it shallow water (no swim).**
7. **Music:** borrows stock 'marketday' (level) and 'boss2' (arena), report-only. **Rec: Daniel picks CC0/CC-BY tracks** (a fanfare/festival tune; a herald-brass boss theme).
8. **Champion 2800 hp reads soft** in the node sim. **Rec: the tune lane sets it at n=6 with flasks** once boss-rates has `--ty` and a couch pilot.
9. **THE DUSK ROAD** (10-26: Waymeet -> Tourney -> DUSK ROAD -> Towpath) is not built: the tourney leads to the towpath for now. **Rec: the Dusk Road lane takes `towpath.needs` when it lands.**
10. **The lancer is a common foe now** (tilt lanes): I added his ANSWER/HEIGHT rows (charge/swipe/cut: block, low). **Rec: keep.**
