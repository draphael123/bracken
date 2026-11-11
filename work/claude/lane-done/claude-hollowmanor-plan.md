# THE HOLLOW MANOR + THE CASTELLAN'S GHOST - opus greybox plan (claude/hollowmanor, 11-10; NO own brief)
Branch claude/hollowmanor off master 9f29067e9 (batch156). Worktree wt-hollowmanor. Flag MANOR_SHIPS = false (src/mn-flag.js; `?mn=1`, `globalThis.__MN`,
tools/mn-on.mjs). Flag off = master exactly (tools/manor.mjs proves it). Pattern: claude/silk (flag, lines, builder, hands, pure boss + boss hands, tagged
main.js one-liners `(claude/hollowmanor)`, one node tool). ('HMH' is taken in main.js: the hands are MNH, the boss hands CSH.)

## Sources (no own brief)
- scratch/briefs-untracked-backup-1009/haunted-levels-concept-2026-10-01.md (Daniel-approved 10-01 interview): POSSESSED ARMOUR (a suit fights only while a
  ghost is in it; knock the ghost out, it can re-possess), PHASING GHOSTS, ROOMS THAT REARRANGE WHEN UNWATCHED (the fair's facing rule), lights going out
  as a threat; SET PIECE the CANDELABRA blackout chase (agency: route, which candles to relight); foes reused + ONE new: the POLTERGEIST (ranged, throws
  furniture); PORTRAIT KEYS open THE SEALED NURSERY; boss THE CASTELLAN'S GHOST: possesses the armoury ONE SET AT A TIME (KNIGHT / HALBERD / DUELIST /
  GREATSWORD, ~25-30 s each, openings earned by each set's moveset), FINAL: he swaps bodies MID-COMBO between the racks.
- !! 10-15 ~20:50 Daniel: placed AFTER THE SILK UNDERCROFT: Burial -> Silk -> HOLLOW MANOR -> Witchlight. brief-wispwood-1108: Burial -> Wispwood -> Silk -> Manor -> Stair.
- brief-ghosttrain-tourney-1016 (build order: after Silk and Manor), brief-audit-1023/1025 (order Silk -> Manor -> Ghost Train + Tourney), week-plan-1115 l.55.
- brief-duskroad-1026: the Dusk Road is NOT a manor (no overlap to avoid there).
- Changed by Daniel's later rules: NO RELIC (11-01: no relic rewards) -> the nursery pays a SILVER + coins. Fewer checkpoints (START + 2). Boss B15 (>= 0.4x).

## Road + saves
- On master: THE BURIAL CAVERNS -> THE HOLLOW MANOR -> THE WITCHLIGHT STAIR. LEVELS row APPENDED only while mnOn(); it takes the stair's CURRENT needs
  (burial on master; 'silk' if claude/silk's push runs first, which makes Burial -> (Wispwood) -> Silk -> Manor -> Stair), then `witchlight.needs = 'manor'`.
- `mnRoadMig` (flag on, once): the manor's needs / burial / the stair cleared -> PROG.roadOpen.witchlight; the stair cleared -> PROG.roadOpen.manor (an extra).
  Kept through levelLocked's existing roadKept clause (src/route-insert.js) - no levelLocked edit, no new PROG flag but the once-marker.
- Map node spliced before the stair (after silk's when both land); map-spacing/grammar/roads pick the spot (Academy holds (184,58), Silk (168,70)).

## The rule: 'THE HOUSE MOVES WHEN YOU LOOK AWAY. THE ARMOUR MOVES WHEN A GHOST GETS IN.' Three drawn verbs
- TURN YOUR BACK: SHIFTING PANELS (`mnshift`: a bookcase, a wall, a stair) have two states; a panel swaps ONCE when no hero has faced it for 0.6 s (the boo's
  `watched` rule: in front of P.face, within 260 px), and waits to be watched again before it can swap back. Heard (a grinding creak), never seen. Built grid =
  the permissive state; the hands set state A on a reset. Never swaps solid onto a hero.
- KNOCK THE GHOST OUT, THEN LAY IT TO REST: a POSSESSED SUIT (the `armour` in skin 'mnsuit', run by the hands) falls when its hp is gone: its GHOST (a wisp,
  slow, glowing) flies to the nearest EMPTY SUIT (a rack `mnrack`, or the pile it left) and re-possesses it in 3.5 s (the suit rises, told). Strike the wisp
  in flight = LAID TO REST. A ghost re-possesses at most twice.
- LIGHT: CANDELABRA (`mncandelabra` stand: strike = carry it; a light, a dark-mask hole). WALL CANDLES (`mncandle`) are lit or out; touch one with a lit
  candelabra = lit. A lit candle is a ward: SHADES (`haunt` in skin 'mnshade') will not enter its light. A shade's touch SNUFFS the candelabra (relight it at any
  lit candle).
- SET PIECE THE BLACKOUT (the long gallery): crossing its door, the candles go out one by one behind and ahead of you (each flickers 1 s first: told), shades
  rise from the walls and chase through them (phasing). Agency: which candles to relight, which route (high gallery or low hall).
- PORTRAIT KEYS (`mnportrait` x3): strike a family portrait = its key. Three keys open THE SEALED NURSERY door (`mndoor`): SILVER 2 + coins.
- BOOS (master's, unchanged) in the rooms that shift: turning your back to move a room lets them drift in. The rule pays twice.

## Sections (W 340 x H 40), Rootway recipe (TEACH -> TEST -> REMIX -> EXAM), signs at point of use
- 0-59 THE CELLAR STAIR + SERVANTS' HALL (TEACH): up out of the undercroft cellars; the first shifting panel (REQUIRED TURN: a pantry wall that only opens
  when you face away); the first possessed suit + its rack (knock out, lay to rest); portrait 1.
- 60-139 THE PORTRAIT GALLERY (TEST): a shifting stair (the way up appears unwatched), suits + racks, the POLTERGEIST taught, boos in a shifting room,
  portrait 2, SILVER 1 behind a panel that shifts the other way.
- 140-209 THE LONG GALLERY (REMIX: THE BLACKOUT set piece): the candelabra, candles, shades, a high and a low route; SHRINE 1 at its far door.
- 210-273 THE NURSERY WING (EXAM): shifting rooms + suits + poltergeists + boos together, portrait 3, THE SEALED NURSERY (3 keys) = SILVER 2.
- 274-287 THE ARMOURY DOOR: SHRINE 2. 288-339 THE GREAT HALL (the armoury): the boss. Exit: the stair to the Witchlight road (a sign).
- Landmark: the great hall's tower and its lit high window seen over the roofs the whole level (drawBack). Palette: grey stone, faded green damask, ONE
  accent: ghost-green (the possessed visor, wisps, the Castellan). Candles warm amber (light, not accent).
- Foes: POSSESSED SUIT (heavy), BOO (master's), SHADE (runner), POLTERGEIST (ranged: the ONE new foe). No goblins (act IV). Role mix 4.
- Checkpoints START + 2 (checkRun 200). Music borrows a stock track + 'boss3' (report-only; Daniel picks).

## THE CASTELLAN'S GHOST (`castellan`, ~3200 hp, tune owed)
- B15: x0.45 outside openings (never untouchable); OPENING = THE GHOST KNOCKED HALF OUT (x2, 3 s, capped 12%/opening). Set floors 80/60/40/20%.
- Four racks in the hall; the live set's visor glows ghost-green, the bar names it ('THE CASTELLAN - THE HALBERD'). Break a set (its share of his hp) ->
  he LEAVES it (told 1.4 s, a wisp crosses to the next rack; untargetable only in flight, 1.4 s - the set floor holds him, he is never out of reach longer).
- Each set's opening is earned by an ACTION against its moveset (guard broken by an action):
  1 KNIGHT (sword + shield; shield front x0.4): TOLD THRUST (0.8 s !, blockable 16), SHIELD BASH (0.7 s !!, a lunge 18): DODGE THE BASH -> he stumbles past, OPEN.
  2 HALBERD (reach): LOW SWEEP (0.7 s !!, jump it, 16), OVERHEAD CHOP (1.0 s !!, 22): a chop that misses BITES THE FLOOR -> stuck, OPEN.
  3 DUELIST (rapier): FEINT (0.3 s ! that does not come) + LUNGE (0.5 s !, blockable 14), FLURRY (3 told stabs 0.35 s each, blockable 10): BLOCK ALL THREE -> winded, OPEN.
  4 GREATSWORD (slow): ARMOUR-BREAKER arc (1.2 s !!, unblockable 26 - a block breaks the guard), WHIRL (1.0 s !!, two spins 20): survive the whirl -> dizzy, OPEN.
- FINAL (last 20%) "HE SWAPS BODIES MID-COMBO": a combo of 3 moves, each from a different rack (the rack's visor lights first: which set is live reads);
  between combos his WISP crosses the hall for 1.8 s: STRIKE THE WISP = OPEN (x2, 6% cap) - the level's verb (lay it to rest).
- Every move: own windup pose, release pose, sound (POSE / SOUND tables). 60-70% WITH flasks = the tune lane (n=6).

## Files
New: src/mn-flag.js, src/mn-lines.js, src/hollow-manor.js (builder), src/manor-hands.js (panels, suits + wisps, candles, shades, poltergeist, portraits,
door, greybox), src/castellan.js (pure fight), src/castellan-hands.js (world, POSE, greybox), tools/manor.mjs (flag off + on + boss bot), tools/mn-on.mjs.
Shared one-liners: src/level.js, src/main.js (tagged), src/threat.js, src/marks.js, tools/level-quality.mjs (GATE, REPORT_ONLY, ROLES skins),
tools/additional-areas.mjs.
Checks (node only, no browser, no check.mjs): tools/manor.mjs, level-quality manor + gate, checkpoint-gaps, checkpoint-stand, solid-islands, signs, spawns,
killzones, boss-read, answer-tags, tells, one-new-foe, goblin-lint, deadends, map-grammar/spacing/roads, additional-areas, blow-tags, threat-holes,
foe-pass, death-fx, comments, architecture.
