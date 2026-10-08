# REVIEW: THE MONASTERY ('spire') - read-only, MONREVIEW lane, 2026-10-08
Worktree bracken-monreview (claude/monreview off claude/batch79), port 8739. No gameplay code changed. Level: theMonastery() src/level.js 2038-2416
(+ post-build layers: SET DRESSING spire at ~7906, ambush 'THE CLOISTER' ~8316, designed squads), art src/redraw/monastery.js.
Evidence: pictures in scratch/review-monastery-shots/ (page shots 960x540 + 4 data maps map_20/78/130/170.png, cyan dots = walked route);
probe scripts in scratch/review-monastery-tools/ (_mr_*.mjs; copy into tools/ to run: vent rides, hop tester, geometry lints, cellar/plate probes).
The temple2 lane owns the golem + Daniel's "fall through raised blocks"; nothing here redoes its boss design.

## 0. HEADLINE
Daniel's "random floating platforms / misplaced geometry" are REAL and mostly one cause: the level was authored with ONE-ROW and ROOM
errors in its last section and with natural-rock slabs that no check judges. The "heating pads" = the INCENSE BRAZIERS (vent ents, drawn as
glowing bowls): I could NOT reproduce a permanent stuck with real keys for any hero, but I found one dead pad that never lifts anyone
(the crawl brazier hangs a tile above the floor), a 2 px nook under a landing slab, and fall-resets that cost 12 rows when a ride is mis-timed.
Gameplay verdict: the machines are good ideas but ~half of the required rule uses are one idea (stand in smoke, steer off, timing only),
the foes never touch the rule, the last section has no exam (its wheel is geometrically impossible), and the stuck guide knows only the baskets.

## 1. MUST-FIX BUGS (for the temple2 lane; ordered by how loudly the player sees them)

### M1. THE CRAWL BRAZIER HOVERS A TILE ABOVE THE FLOOR AND NEVER LIFTS ANYONE  (src/level.js 2341)
- `brazier(74, 35, 2, ...)` takes the FLOOR row (every other call passes the floor top: 196, 186, 178, 118, 110, 80, 69, 62) and puts the vent at row-1.
  The crawl's floor top is row 36 (rows 36-38 are the slab; hollow = rows 32-35), so the vent's base is y=560 px, the floor 576. A vent lifts only while
  `P.y <= pr.y + 2` (main.js ~25738); a walking hero has feet 576.  Probe (real keys, centred in the column, 15 s): knight, warden, pyro all stay at
  y=576, never lifted. It is drawn at head height (screenshot crawl-brazier.png: the knight stands UNDER a floating bowl). Jump into it and it pins you
  under the roof slab (row 31) for ~2 s. The "exam: incense carries you up past the wheel" does nothing.
- Fix: `brazier(74, 36, ...)` (and see M2 - the lift rises 2 rows into a 4-row hollow, so it should be re-thought, not just moved).
- Only vent in the level with a floor gap (all 9 vents checked: 8 have gap 0).
- WHY MISSED: tools/floaters.mjs + groundEnts only know STANDS_T = sign/check/brazier(the FIRE prop)/lantern/bell...; `vent` is not in it and floaters.mjs never
  mentions vents; nothing asserts "a vent's base row has footing under it".  tools/monastery3-beats.mjs even PINS the vent at (74,3x).
- Add: lint in tools/floaters.mjs - every `vent` (incense/heat/wind) needs a footing tile under (x, y+1) or a declared `air:true`; and a real-key probe
  (scratch/review-monastery-tools/_mr_vent.mjs): each vent lifts a grounded hero standing in its column.

### M2. THE THIRD PRAYER WHEEL (CRAWL "EXAM") IS GEOMETRICALLY IMPOSSIBLE  (level.js 2342, sign 2343)
- `wheel(35, 77, 34, 1, 'b')`: pivot boards (77-79,34), arm boards (75-77,32) [state b] / (79-81,32) [state a]. The hollow is rows 32-35 under a solid
  row 31 (and 30): a board at row 32 can't be stood on (feet at row 32's top -> head inside row 31). My lint: `ONEWAY with SOLID directly above` = exactly
  75,32 76,32 77,32; reach flood: "UNREACHED oneway (75-77,32)". A 4-row hollow cannot hold a 2-up/2-across stair at all.
  The wheel only flips boards stuck under the ceiling. The sign for it ("FLIP IT WITH ONE OF THEM ON ITS STAIR") stands at x=45, 32 tiles from the wheel,
  in the 1-row crawl, and no foe ever rides a wheel stair, so even the sign's promise is unimplemented.
- Net: the level's EXAM (A4: last section, remix, required use) has NO rule use. After the hanging village-style "towers + wheel" the final climb (chimney,
  crawl, stair 36->30) uses no bell/wheel/brazier at all.
- Fix: move the exam wheel to where there is height - e.g. turn the final stair `stair(36,30,30,62,38,11)` (x30-62, rows 30-36, 6 rows) into a wheel stair, or
  put it in the ringing-floor approach - and re-pin tools/monastery3-beats.mjs (it asserts pivot [77,34] and so enshrines this). See Idea 3.
- WHY MISSED: floodReach marks the arm tiles unreachable but nothing says "every arm tile of every pwheel state is reachable"; level-quality's ruleFight counts
  `tbell/brazier` ents near encounters, not whether the machine works; architecture.mjs doesn't read pwheel arms.
- Add: check in tools (new `tools/monk-machines.mjs` or inside stuck.mjs): for each pwheel, for BOTH states, each arm board has >= 1 row (hero 14 px: 1 row) clear above
  and is reached by floodReach with that state laid down.

### M3. FLOATING GRASS-AND-DIRT SLABS IN A STONE MONASTERY = the "random floating platforms"
Found with a SOLID-island lint (tools/_mr_geo2.mjs: SOLID components not joined to the wall/bedrock):
| where | tiles | what you see |
|---|---|---|
| THE LIP, bellows | (16-18, 67) | a 3-tile grass-topped dirt chunk hung in open sky with a stalactite under it, over the 5-wide plat (16-20,69) - lip-bellows.png |
| THE LAST HOP, nest roof | (89-91, 27) island; (85-87, 27) + pillar (87, 28-29) | two grassy dirt stones over the thorn bed, one on a 1-wide pillar - last-hop.png. They are the way to the gate (and the silver at 90,26). |
- Why they look wrong: the level's palette dresses SOLID that is not inside an L.masonry rect with grass/dirt (palette grass '#7c8a56', dirt '#726255'); every real monastery
  floor is in `masonry`. These are in none.
- Fix: put them in masonry + give them a corbel/arch/pier from the facade kit (a ruined arch stub, a bracket off the roof wall), or swap to ONEWAY boards with
  posts. The lip should be a proper lintel (it is a "ceiling" over a nook - see M5).
- The other SOLID "islands" are fine (towers' wall shafts over their doors, the golem hall roof 29-50 x48-49 which is a built chapel - hall-roof.png, the crawl floor slab
  67-90 x36-38 and the cloister/dorm slabs in masonry).
- WHY MISSED: tools/architecture.mjs deliberately judges only masonry/facades/structures/houses/stones ("natural rock is the mountain, not judged"); floaters.mjs is props only;
  floodReach + pacing happily route over them (they are valid footing); nothing says "a SOLID island in the open that is not masonry".
- Add: `tools/solid-islands.mjs` (copy of _mr_geo2.mjs part 1): SOLID components not joined to bedrock/walls must be fully inside L.masonry or listed `L.islands` with a reason.

### M4. PLANKS HANGING IN THE SKY WITH NO POSTS OR ROPES (scaffold + side routes)
- THE SCAFFOLD (44-81 x 53-78; eight 4-wide boards climbing right) "the monks left up the east face" has no poles/hangers drawn (scaffold.png) - boards hover between piers.
  The side routes (86-92 x 200-216 gatehouse, 4-10 x 176-194 terraces' near end, 84-90 x 60-78 bellows' far side) are two alternating columns of 3-wide boards
  in front of arches/piers (bellows-east.png, side-east.png, sidestair-w.png). Only the stacks' walkway has hangers (`hangers[]`, 3 posts).
  This is the "random floating platforms" read: dozens of planks, nothing holding any of them.
- Fix (art + data, no tile change): L.monk.hangers for each board chain (posts down to the nearest floor or rope up to the slab over it); the scaffold as a
  `monkScaffold` facade with poles + cross-braces; side routes as a goat path with a rope rail. Cheapest: extend `hangers` + add 3 facade rects.
- Check to add: `tools/architecture.mjs` could count, for each run of ONEWAY boards that is not a wheel arm / mover / crumble, whether a hanger/facade/structure covers it.

### M5. THE FIRST BELLOWS PLUME LANDS YOU ON THE LIP, NOT IN THE ALCOVE IT WAS BUILT FOR  (level.js 2271-2276)
- Plume 1 (14,79) h=13 rows exits at row 67; the lip slab (16-18,67) is right there. Real-key ride, all three heroes: you land on the lip at (18.5, 67) - two rows ABOVE the plat (16-20,69).
  The plat under it is a 1-row nook: standing headroom is 16 px (rows 68) vs the hero's 14 px - 2 px - with a stal hanging in it (17,68). You can still step right into plume 2's column
  from the lip (|dx|<12 px of x=312), so the chain survives by accident.
- Fix: decide the landing. Either drop the lip (plat becomes the landing; stal becomes a hanging lintel higher up) or move the plat under row 69 -> 70 and keep the lip as a roof.
  Same pass as M3.

### M6. THE STUCK GUIDE KNOWS ONE MACHINE  (src/stuck-spots.js 129-131: spire = baskets only)  [A6]
No glint/nudge for: the incense columns (required: terrace 74/79/75 @195-177, flue 90/86 @117-109; optional bellows 14/19/25), the two bells (11,117 drawbridge; 73,117 flue span),
the two route wheels (scriptorium 47,169; cloister 20,97), the crawl. Signs exist for most (they say "STAND IN THE SMOKE...") but the way arrow / 10 s nudge never fire.
Add one STUCK entry per machine (zone, `at`, line <= 62 chars), `done` = the bell's mark / wheel state. tools/stuck.mjs --static already runs them.

### M7. LEVEL-QUALITY `secrets` FAILS  (node tools/level-quality.mjs spire -> "FAIL secrets 1 silver/relic off the route (>=2)")
Silvers: reading loft (29,151), scaffold-top shrine (81,63), gate (90,26). Add one off-route silver (the bellows alcove 6,79 is the obvious home: it has a mend, coins and a shrine and nothing to find).
Every other row is ok (flat 0%, bands 41, mechanics 6 kinds, checks 1/98 tiles, roles 4, ruleFight 7/7, curve act 2 knight 102%/0 deaths/3 runs, route 188 rows, 0 back).

### M8. SMALLER ONES (verify in the same pass)
- TRAPDOOR CELLARS EXIT WITH 1.4 px TO SPARE: 3 cellars (66-74@218, 14-22@196, 80-90@80), hollow 2 rows + floor at top+3; jump rise measured 3.09 tiles vs 3.00 needed,
  identical for knight/warden/pyro (exitedOf 4/4 each). Any jump debuff/low-stamina variant leaves you in the pit with a looter. Make the hollow 1 row shallower or add a 2-step.
- THE PLATE-AND-CAGE (60,131): real keys: knight and warden step on it, take 15 hp unblockable + ~1.5 s caged; PYRO walks over it and nothing happens (hp unchanged, no cage) - check why
  (P.ground/y test in main.js 25716). The sign says "STAND ON THE PLATE", i.e. it invites the player to trap himself; enemies also spring it (the code counts them) - use that (Idea 4).
- `ent('sentry', 20, 198)` stands IN the root cellar hollow; its comment says "posted on the root cellar" (should be y 195).
- tools/monastery3-beats.mjs pins the dead third wheel and the floating vent (assert near('gobpriest',71,35), pwheel pivot [77,34]); update with the fix.
- The ambush 'THE CLOISTER' (row 99, walls 40/74, troll + bat + harpy + fledgling) is the one designed fight in the cloister; its walls shut on you. Not reproduced stuck; the flying foes make "kill them all" slow for a knight - worth a 60 s play.

### What "STUCK" the walker reports is NOT the level (and why)
tools/level-walk.mjs spire (3 heroes x 3 seeds, campaign level 8, typical build): every run STUCK in 3 sections: (1) terrace braziers (77,185 / 76,177), (2) tower 1 stair (12,123),
(3) cloister wheel stair (30,88 / 38,79) / sometimes the scaffold (75,65). "walked 68-82%, measured 12% of the route".
Real-key checks say the level lets you through: all 8 route rides pass for all three heroes (steering windows 30-90%, see section 3), every route hop that is not a machine edge passes
(tools/_mr_hops.mjs: failures are only vent rides, the scriptorium wheel flip, the book hoist, plus the stacks hop 61,137->56,136 which passes with an edge-hug jump: 15% knight/warden, 26% pyro of my variants).
So these are WALKER HAND GAPS (no vent hands, tower-stair planner, pwheel). Consequence: difficulty v2 cannot be measured on 88% of this level until the walker learns vents/wheels (WALK_HINTS or a vent hand).

## 2. SCORE (design-standard v2)

### Rule (A1-A5)  -  weak middle: ~2 of 5
| item | verdict |
|---|---|
| A1 one sentence, true to code | "WHAT THE MONKS BUILT STILL ANSWERS A BLOW. CLIMB." is true for bells and wheels (strike -> bridge / stair), false for incense (no blow), baskets (weight), failing timber (weight). Three different rules under one line. |
| A2 a verb | bells + wheels yes (strike changes route; wheel reversible). INCENSE (the most-used machine) is a timing ride with no player action on the machine: a hazard you wait for. |
| A3 state drawn | good: coals glow 0.6 s before a breath, wheel boards spin, bridge drops, basket sinks. The smoke column itself is four faint 4 px streaks. |
| A4 teach/test/remix/exam | Teach: a sign at every first use (good). Test/remix: >=3 kinds (bell, wheel, incense, hoist, failing timber, plate) yes. Exam: NO - last section has no rule use (M2). Required use before the boss: bells and wheels yes. |
| A5 fights during the rule | tool: ruleFight 7/7 (priests at the drawbridge, troll+priest at the stair...) but no foe is touched by the rule: bells ring at nothing, wheels turn under nobody, smoke carries only you. The only foe interaction written is the priests' blessing. |
Required-route rule uses (route 491 tiles): incense 4 rides (terrace 2, flue 2), bell 2 (+ guard bells optional), wheel 2 (scriptorium, cloister) [+1 dud], hoist 1, failing timber 1 (optional board), plate 0 (optional). The 3 bellows braziers + alcove + golem hall are the left BRANCH; the road reaches the nest stair via the scaffold -> east side route.

### Identity (A8)  -  estimated ~15/18 (not run through audit-identity; judged on the shots)
Strong: own facade kit (monkTower/Cloister/Arcade/Chapel/Wall/Curtain, rose window in the golem hall), landmark towers and a cloud line at row 100 with the sun above it, 2+ set pieces that are verbs (bell towers + drawbridge; wheel stairs; the book hoist), lights (candles, stained glass), wind ambient, own track + boss/mini tracks, warm palette fix.
Losses: floating grass/dirt chunks (M3) and planks without posts (M4) break the architecture claim the level is otherwise built on (Daniel's 09-25 "ground all of it" fix covered masonry only); the incense columns are barely drawn.

### Enemies (A9)  -  fine on mix, empty on rule
59 foes: gobpriest 10 (17%), fledgling 11 + harpy 9 (fliers 34%, just under the 35% cap), rockgoblin 8, bat 6, sentry 6, sprig 4, gobmage 3, troll 2 (1 elite), ram/goat elite 1; roles heavy 4 / melee 42 / ranged 11 / support 10. One new type only (the priest, already shipped). No goblins-after-Queen problem: the road is hanging -> spire -> moor -> ... Highcrown (Goblin Queen, needs: storm) is later, so living goblins are correct here.
Gap: no foe twist tied to bells/wheels/incense (A9 asks for one).

### Difficulty v2
- Level mash bot (tools/mash-bot.mjs --level spire, campaign L7, no --write): knight lowest hp 0%, hp lost 300%, 3 deaths; warden 296%, 2 deaths; pyro 300%, 3 deaths. It loses the level with every hero (A10 ok). It needed 48-49 lifts (4-6 "HELD: put back by a room it could not finish").
- Walker (campaign L8, typical build, 3 heroes x 3 seeds, profile human+first): 0 deaths, hp lost 0-45% over the 12% it could measure, checkpoint arrivals 92-100% (target < 50%), kills 8-18 a run; the one duel it fought, troll SWIFT@49-50 ("elite at the scriptorium stair"), was WON in 9-16 s with 100 -> 57-62% hp. Reads "too easy" where measured; the rest is unmeasured (see above).
- Level-quality 'curve': act 2 knight lost 102% in 3 runs, 0 deaths (band 70-400%, 0-6) - the low end of the band.
- Checkpoints 5 kept (one per 98 route tiles; src/checkpoint-thin.js removes 6 of 11 authored); shrines are fine on spacing (A10b wants ~140-260; here ~98 -> slightly dense).
- Where it could carry weight: there is NO section exam. Honest rec: exam = the troll on the new wheel stair with the drop behind (Idea 3).

### Stuck points per hero
Real keys, god mode on, foes dead, fresh seed: knight / warden / pyro identical except as noted.
- RIDES (centred in column, steer after the top; 20 timings each; wins): terrace v1 (74,195 -> plat 76-80@186) knight 8, warden 8, PYRO 18; v2 (79,185 -> 73-77@178) 14/14/14; v3 (75,177 -> 73-77@172) 12/12/10; flue v1 (90,117 -> 85-88@110) 10/10/10; flue v2 (86,109 -> 85-89@100) 12/12/8; bellows v1 (-> lip) 18/18/16; bellows v2 (19,68 -> plat 23-27@62) 6/6/8 = the tightest (30-40%): the plat is 2.7 tiles from the column and 2 rows below the peak - miss it and you fall 12 rows to the floor at row 80 and must redo plume 1; bellows v3 10/10/10. Terrace v1 is hero-sensitive (knight/warden 40% vs pyro 90%) - look at why.
- pinned-under-ceiling frames: 0-2 in every column (no pin-stick). The crawl pad (M1) never lifts anyone.
- Machines the walker can't drive - hop-tested instead: wheel flip, hoist, bell are fine by real keys; wheel-in-crawl impossible (M2).
- Cellars (M8): exit margin 1.4 px.
- I could not reproduce a PERMANENT stuck. If Daniel still means something else by "heating pads" (the FIRE brazier prop at the cloister 11,99 - not solid; the plate - M8; the glowing smoke columns), ask him which, with the column number.

### Rewards
3 silvers (reading loft 29,151 with its desk; scaffold-top shrine 81,63; gate-side 90,26 in the boss room) + 1 vault ent in the arena (38,29) + 7 mends (6 are 'stash' mends at the walls). No collectible kind feeds a themed vault (A11: the quality tool: 0 collectible kinds, 1 interactive). M7 fails the off-route count. Opportunity: the monks' hidden offerings = bell-struck alcoves (Idea 2).

## 3. IDEAS (ranked; each keeps the look; machines become verbs that change the route)
Cost S = hours, M = a lane-day, L = more. "cols" are tile columns/rows in the current level.

1. STRIKE THE CENSER  (S-M)  [rule A2/A3, fixes the most-repeated element]
   The player DOES: hit a brazier (any hero, any blow, like a bell) and it breathes NOW for the usual 2.2 s (told by the coal glow + a puff ring); then it recharges ~3 s (shown by the bowl going dark, ember rim returning). The cycle stays as the idle rhythm, so timing-only players still progress.
   Where: terrace 74/79/75 @195-177, flue 90/86 @117-109, bellows 14/19/25 (optional branch), the crawl pad (fix M1 first). Make 3-4 of them DOUSED (cold, no cycle) until struck, so a chain is "strike, climb, strike the next from the ledge" - the player places the lift.
   Why: 4 of the required machine uses + 3 optional are this one idea; at 30-90% steering windows the miss costs 12 rows; hitting the bowl lets you re-launch from the ledge without falling and turns wait-and-steer into act-and-steer. Serves "what the monks built answers a blow". Code: vent gets `pr.struckT` set from hb overlap (same hook as tbellBox in updateMonkProps), draw uses existing warm state. Also kills the "heating pad stuck" complaint class (you always control the next breath).

2. THE BELL IS A NOTE, NOT JUST A LATCH  (S-M)  [A5 fights, A9 twist, A11 reward]
   The player DOES: strike a bell and a told, drawn ring (r ~ 6 tiles, 1 s) DAZES goblins/fledglings/harpies in it (flinch + 1.5 s, priests' blessing broken), the same note language as the golem's bell stagger and the Abbot's bell, so the level teaches the boss's verb. Drawbridge fight (x 16-48 @112-117: harpy, fledgling, priest at 42) is built for it; add a bell on tower 2 (44, ~125) for the bell yard (47-66 @131: 2 rock goblins + priest + the plate) and an offering alcove behind a struck bell (silver for M7).
   cols: 11,117 / 73,117 / new 44,12x. Shares code with the temple2 lane's "bells stagger the guardian" (item 2) - implement ONE `bellNote(pr)` ring and let both use it. Cost: ring + daze hook (foe-react.js flinch) + one bell + one silver.

3. THE STAIR GOES OUT FROM UNDER HIM, AND THE EXAM IS REAL  (M)  [A2, A4 exam, A5, B-side difficulty]
   The player DOES: lure the troll/rock goblins up a wheel stair, then strike the wheel: the boards lift for 0.7 s and drop whoever stands on them (fall damage; the wheel code already lifts boards "nothing is ever crushed"), or flips the stair under YOU as the risk. Goblins path up stairs, so make the wheel strike an attack.
   Where: replace the dead crawl wheel with the final stair `stair(36,30,30,62,38,11)` (x30-62, rows 30-36 = 6 rows) or the scriptorium stair (47,169 -> 7 boards, the troll elite at 61,171 already stands at its foot): exam = troll on the stair, you at the wheel, hazard behind, CP after (the standard's section-exam shape). Implement the sign's own promise ("flip it with one of them on its stair").
   Why: gives the level the exam it lacks and the first foe interaction with the rule. Needs M2 fixed.

4. THE CAGE IS A TRAP YOU SET  (S-M)  [A5, replaces a pad that punishes the player]
   The player DOES: lure the looters onto the plate (the code already springs it for ANY foe standing on it) so the cage lands on THEM (it hurts foes: 30) - or tip it on the ambush troll. Rewrite the sign to "STILL SET TO CATCH A THIEF. LURE ONE ONTO THE PLATE" (today it invites you to spring it on yourself for 15 hp unblockable).
   Where: bell yard (60,131; 55-66 camp), plus a second plate+cage over the cloister ambush (48-56 @99) where troll + bat + harpy + fledgling are shut in with you. Fix the pyro no-trigger (M8) first. Cost S (data + sign) to M (second cage).

5. EMBER BRAZIERS + HARPIES  (S)  [A9 twist, uses code already in main.js]
   `ember: true` on a brazier throws coals half a second into its breath and brings a bird overhead down (main.js ~25736) - no brazier in the level sets it (comment at level.js 2319 promises "two braziers in the roof"). The player DOES: ride the smoke while the coals fly and harpies dive on the column; or lure a harpy over a breathing bowl. cols: the three bellows bowls (14/19/25 @80-62) and the harpy at (30,64); crawl pad after M1. Cost S.

6. LOOSE MASONRY ANSWERS A BLOW  (S-M)  [rule line, A5]
   13 `stal` stones shiver and drop when YOU pass under (level.js 2361). Let a blow bring them down on demand: strike the stone and it falls on whatever is under it (priests at 42,117 / 57,79 / 41,79 and the drawbridge landing are all under slab edges). The player DOES: pick the moment; foes under the lip eat it; the lip at (17,68) becomes a deliberate trap. Needs only a hit-test on the existing stal prop.

7. A SECOND CHOICE AT THE FIRST WHEEL  (M)  [A4 remix]
   The scriptorium wheel's two states already lead somewhere different (b = reading loft + silver, a = the stacks stair). Make the choice cost something: 'a' drops you in the troll's lane (Idea 3), 'b' goes the loft way past the gobmage's reading. Reuse the existing boards; add a second silver for M7. Cost M (placement, balance).

8. COUNTERWEIGHT AS A DUEL  (M-L)  [A4 remix]
   Put a second basket pair in tower 2 (x 42-47, rows 118-131) as the fast way up; an elite that stands in the other basket lifts you (heavier side sinks): the player DOES: wait/strike to rebalance. Largest build; only after 1-3.

### TOP-3 RECOMMENDATION
1. IDEA 1 (strike the censer) together with M1 - biggest gameplay change for the least code, and it answers Daniel's pads directly.
2. IDEA 3 (stair goes out from under him) rebuilt on a real exam stair - fixes M2, gives the level a section exam and the first foe-rule interaction.
3. IDEA 2 (the bell is a note) - one shared `bellNote` with the temple2 guardian's stagger, adds a verb to the drawbridge and bell-yard fights, and a place for the second off-route silver.
Cheap rider: IDEA 5 (ember braziers) in the same brazier pass.
Bug pass order for the temple2 lane: M1 + M2 (1 row, 1 wheel) -> M3/M5 (masonry + the lip) -> M4 (hangers/scaffold facade) -> M6 (stuck spots) -> M7 (silver) -> M8; new checks: vent-footing lint, wheel-arm headroom lint, solid-islands lint, stuck.mjs coverage assert "each tbell/pwheel/incense vent has a STUCK entry", and teach the walker vents/wheels so difficulty v2 can be measured.

## QUESTIONS FOR DANIEL (rec first)
1. "Heating pads that get you stuck" - which one? I built the rec: braziers (incense) - crawl pad dead, ride misses fall 12 rows. If you meant the plate in the bell yard (stuns 1.5 s, 15 hp) or the cloister fire brazier, say so.
2. Exam wheel: rec = rebuild it on the final nest stair with the troll (Idea 3); alternative = delete the third wheel and make the crawl a pure squeeze + ember braziers (Idea 5).
3. Brazier verb: rec = strike-to-breathe with a cold/snuffed variant (Idea 1); alternative = leave timing and add a timing gauge (smaller, weaker).
