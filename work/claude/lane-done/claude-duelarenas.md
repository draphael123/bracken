# DUELARENAS-A (S2) - claude/duelarenas (on claude/duelfoes), 11-12 16:02. CODE-ONLY, node-proven, flag DUEL_ARENAS default OFF
Not merged, not deployed, no flag flipped, no browser opened.

## Built (file:line)
- FIRST COMMIT (6c0e8f651): the Pit's goblin doors. src/duel-foes.js FOE.minSeat 6 -> 3; src/pvp-duel.js foeTick measures only UPRIGHT seats (pickDoor = the door farthest from the nearest one; none >= 3 tiles = retried a second later). Seats at the Pit's start cols 5/20 are exactly 3 tiles from doors 2/23, so a goblin now enters at 10 s with nobody moving. tools/duel-foes.mjs updated, ALL OK. Not registered in check.mjs: no sibling duel proof is (pvp-duel / duel-roster / duel-foes are run by hand), so there was no list entry to add.
- src/duel-arenas.js (new, pure): DUEL_ARENAS flag (?duelarenas / window.__DUELARENAS); ARENAS table (:24) {id, level, name, line, kit, W, H, floor, spots, music, foeDoors (read from FOE_ARENAS: one copy), hops}; resolveArena (:40, RANDOM only from BUILT levels); buildStockade (:48); hopGoal (:65, the bots' climb).
- THE STOCKADE (src/duel-arenas.js STK:19): 24x22, floor row 19, seats cols 4/19/8/15, Stockade palette only (dress camp, ledges lashed, sky night; generic path = pitArt false), music `stockade`, NO level-runtime kit flag. Tiers (row, cols): r16 [2-5] [18-21]; r13 shelf [4-19]; r10 [4-10] [13-19]; r7 lookout [10-13]. Every board is held by the camp's own `stkpost` routeSupports (11 poles) down to the floor or the board a tier down; each tier overlaps the one below by >= 1 column so it is jumped onto from straight under. Two torches on the floor. foeDoors cols 2/21, goblins sprig/archer/hound (0.5/0.25/0.25; src/duel-foes.js FOE_ARENAS.stockade).
- level.js:8209 `if (DUEL_ARENAS) LEVELS.push(duel_stockade)` appended LAST (saves count by index); nothing is registered with the flag off. level.js import line 55.
- main.js: duelIndex(arena) :7872, pitArt() :7874 (the Pit's level has no kit field = 'arena', so it draws exactly as before) replacing the 6 ART sites (tiles, leaf colours, arena backdrop, parallax, near trees, yard props); the 3 is-a-duel checks (noShrine, lowerOk, Return to map) stay L.duelPit. duelEnter :7884 draws RANDOM once via resolveArena from the built levels, then loads that level.
- src/pvp-duel.js: SETTING_CHOICES.arena (:43), cleanSettings (:52, the `arena` key ONLY when the flag is on - flag off the settings are byte-identical to duelfoes), arenaId / foeCols per arena (:286), st.arena (:371; rematch keeps it - same level), FIGHT banner + the count name the arena (arenaLabel :445, "THE STOCKADE (RANDOM)" when random), tavern card ARENA row + plain line (:461), botThink(..., hops) (:160-184: a foe a tier or more above for 0.45 s -> walk under the next board, jump, steer onto it in the air; the generic jump-spam is suppressed then), debug().arena.
- src/duel-roster.js: ARENA row FIRST on the RULES tab when ctx.arenas() (:31), RULE_FMT.arena, one-line description under it (reuses the plain-words line), row pitch 13 -> 11 when there are 10 rows (ARENA + GOBLINS + FRIENDLY FIRE) so the line at y 153 stays clear; 7 or 9 rows unchanged.
- tools/cdp.mjs: opts.duelArenas / opts.duelFoes (the dev switches); tools/pvp-duel.mjs duel section: ARENA=stockade (and GOBLINS=1) env.

## Node proofs (all run, all OK)
- tools/duel-arenas.mjs (new): ON process + a flag-OFF child. Per arena (ARENA_CASES = ARENA_ORDER, so the next arena is proven with no new test code): builds, walls closed, floor wall to wall, ents harmless, no kit flag, 4 spots >= 4 cols apart on open floor, music id exists (audio.js musicKnown), foeDoors open floor, goblin kinds + weights; Stockade EVERY board reachable by the REAL jump model (src/reach-hero.js, all 9 heroes; apex 49.4 px, a 3-row rise is marginal but identical to the Pit's), from the floor only the low ledges (staggered), nothing floats (src/demo-supports.js runsOf: every deck has anchors, worst 3 cols) and every pole stands under a board and ends on floor/board; Pit hash pinned 6f54950b97f8... (mock painter AND the real LEVELS entry after every wrapper); settings clean / remembered per slot / old save / cycle pit > stockade > random / names; RANDOM never picks a missing arena (4000 rolls, edge rolls, missing level, none built); RULES rows 10/8/9/7 by flags, ARENA first, last row clears the plain-words line; mock match on the Stockade (spawn cols 4/19/8/15 floor row 19, banner + count name the arena, RANDOM label, rematch keeps it, goblins from doors 2/21 only >= 3 tiles from a seat, kinds sprig/archer/hound); hopGoal cases; a SIMULATED BOT with the real movement numbers reaches the lookout from all 4 spots, normal + easy, 4 seeds each: 32/32, NORMAL slowest 7.5 s (easy slowest 31.5 s); the same bot without hops never gets above the low ledges; no hops = the old bot step for step; main.js wiring (source); filenames. Flag OFF child: no arena key anywhere, the Pit is the only arena, no extra level, last level still highlines, Pit hash, RULES 7 rows, banner silent, hops not passed.
- Existing: tools/pvp-duel.mjs (pure, sim) ok, tools/duel-roster.mjs ok, tools/duel-foes.mjs ALL OK. node --check main.js / level.js ok.

## Deviations
1. Boards are T.ONEWAY (the painter's plat), not T.PLANK: same one-way rule, the 'lashed' ledge set skins both; the demo float gate counts both.
2. The plan's sketch was reshaped so every tier overlaps the one below (the sketch had gaps of 2-3 columns; the real jump model reaches ~38 px along at a 3-row rise, so a bot edge-jumped and fell, and a 3-col gap is unreachable). Same tiers/rows, wider shelf (cols 4-19).
3. No ropes: posts only (stkpost). The only rope-like tile (NET) is a climbable platform and would change play. The lookout stands on 2 poles that end on the shelf.
4. Stockade doors 2/21 are 2 tiles from seats 4/19, so at round start no goblin enters until a seat moves (3-tile rule); on the Pit they now do (first commit).
5. The Pit's own planks have no anchors by the demo float measure (r11, r14 x2 - printed as info). The arena set draws its own stands; "Pit must draw identically" so untouched. If Daniel's floating-props flag includes the Pit, a follow-up must add supports in its arena art.
6. Plan said 9 hard-wired checks: 6 are art (replaced); 3 are is-a-duel logic (kept as L.duelPit).
7. Hop trigger is "a tier (3 rows) above", not "2 rows"; a 2-row difference is a jump of the foe's.

## BROWSER OWED (desktop; one browser at a time, >= 1500 MB free; flag via window.__DUELARENAS / ?duelarenas=1, goblins also ?duelfoes=1)
- AI-vs-AI on the Stockade: `ARENA=stockade PAIRS=knight:pyro,warden:ranger N=2 node tools/pvp-duel.mjs duel`; then the 9-hero sweep `ARENA=stockade N=2 node tools/pvp-duel.mjs duel`; with goblins `ARENA=stockade GOBLINS=1` plus settings goblins many (4 seats and teams per the duelfoes owed list). Assert: every match ends inside the cap, no soft-lock, no flask, BK.duel().debug().arena.id === 'stockade'.
- Bots reach the lookout: in a stockade duel log a bot's y over time (BK.players() y <= 7*16) - expect inside ~10-20 s of a long fight; nobody stuck on one tier for 20 s.
- Stills: one per tier (floor with seats, r16 ledge, shelf, r10 ledge, lookout) incl. the poles under every board and the two torches (nothing floats; the camp dress sprinkles landmark props on the floor: check none float); the count + FIGHT banner naming the arena and "(RANDOM)"; the RULES tab with ARENA selected (10 rows, line clear); the tavern card (?duelcard) ARENA row.
- Camera fit at 4 seats on a 24x22 level (seats on 3 tiers at once; 352 px tall vs VH 180).
- textfit: 'THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT.' and 'RANDOM - ONE OF THEM, PICKED WHEN THE FIGHT STARTS.' on the 300 px roster line at size 6 and the 196 px card at size 8 (through fit); 'THE STOCKADE (RANDOM)' on the banner; ARENA row value '< THE STOCKADE >' in 110 px.
- The Pit looks unchanged with the flag ON and OFF (arena set sand/oak/crowd, brazier decor, backdrop, music arenayard).
- Goblins on the Stockade: an archer's arrow = a goblin blow (arrows carry owner: e -> damagePlayer who), hound contact the same; confirm no arrow/bite kills a seat and no archer chain-locks (grace 0.4 s).
- RANDOM / rematch / leave: pick RANDOM several times (both arenas appear), REMATCH stays in the arena, BACK TO THE INN returns to the tavern.

## How the NEXT slice adds an arena (Rootway / Kitchen)
1. src/duel-arenas.js: a builder (painter level: walls, floor, boards, routeSupports of that arena's kit - nothing floats - returning `duelPit: { floor, spots, gate: null, arena: '<id>', kit, foeDoors, hops }`), a row in ARENAS + its id in ARENA_ORDER (the picker, RANDOM, banner and proofs follow).
2. src/duel-foes.js: its FOE_ARENAS line (doors + kinds + weights).
3. src/level.js: one `if (DUEL_ARENAS) LEVELS.push({ id: 'duel_<id>', ..., hidden: true })` line after the Stockade's (append only).
4. src/duel-roster.js RULE_FMT.arena: add the name (a copy, the roster has no imports; tools/duel-arenas.mjs asserts it equals arenaName()).
5. Rootway vents (the one told feature): art-only prop / ent, nothing in the runtime changes; hops takes any board list (wait-for-puff is a later bot rule). The Kitchen's kgKit is art only: pitArt() reads the kit string, add a branch there if its art is a kit rather than the arena set.
6. If a camera needs shrinking, W/H are in the ARENAS row.
No change to the picker, settings, banner or match code.

## Questions (recommendation BUILT)
1. Hop trigger "a tier up" vs the plan's "2+ tiers up": built a tier (3 rows). Rec keep.
2. ARENA row first on the RULES tab (built) vs last. Rec first.
3. Give the Pit's planks real supports (deviation 5)? Rec yes if Daniel's floating-props flag covers the Pit, as its own small art lane.
4. ARENA as a column on the balance table: the plan says after S3.
Branch claude/duelarenas.
