# GQ6GEO - three more Goblin Geomancers (S1) + THE GEODE CALL (S4)
Lane GQ6GEO, code only, 11-13. Branch claude/gq6geo (worktree bracken-gq6geo), off master 76e05f9c4 (master had not moved at the end). Pushed. Nothing merged, nothing deployed. No browser run by this lane.
Both slices are behind their OWN flag, default OFF, with URL / env overrides. With both OFF the Highcrown level hash is master's (3e2c11ae45a2) and every proof of the existing geomancer / Highcrown / Queen code is unchanged.

## FLAGS
- GQ6GEO_SHIPS (src/gq6geo.js) / ?gq6geo=1 / BRACKEN_GQ6GEO=1 (tools/cdp.mjs sets window.BRACKEN_GQ6GEO) - slice S1, placement.
- GQ6CALL_SHIPS (src/gq6geo.js) / ?gq6call=1 / BRACKEN_GQ6CALL=1 (cdp hook added) - slice S4, the attack. ART BEFORE LIVE: this one cannot ship until the art list below is drawn.

## S1 - THE 3 PERCHES (final positions; the plan's columns were ~128 / ~295 / ~400)
All three stand on a ONE-WAY ledge laid on a pier or a chain (existing hcpier / hcchain art), 5-7 rows over the route. Placement is laid by a new LAST build wrapper in src/level.js (gobgeoLate, src/gobgeo-level.js) on the finished level, so the seeded garrison / coin sprinkles draw exactly what they drew before: flag ON = flag OFF + 3 ledges, 6 supports, 3 geomancers, 3 signs, nothing else moves (proved: take the perches out and the hash is master's again). My first try laid them inside gobgeoLay and the sprinkle then dropped a javelineer on the Crag ledge and reshuffled four other foes and eight coins - that is why they are laid last.
1. THE CRAG WALK: geomancer 140 / row 42, ledge 138-142 floor row 43 on piers down to the tower block's top (row 48). Not 128: columns 110-150 have no off-route standable tile at all (the ramp, the plank bridge 124-132 and the block top are all route), so I lifted him onto a pier ledge over the block, where he sees the plank bridge and the ramp top (x 122-150, 15 route columns, clear line). Off the route (a plain jump cannot reach him), flagged early (gentle: his own rock sent back knocks him off the pier, stunned 2 s; he never uses the call). Sign on the bridge at 126/53. Nearest shrine 24 tiles.
2. THE BAKEHOUSE YARD: geomancer 300 / row 39, ledge 298-302 floor row 40 on piers down to the yard's top plank walk (row 45), over the net climb. Sees x 284-314 (22 columns): the upper half of the climb and the walk down the east side. Off the route, early, no call. Sign at 285/55. Nearest shrine 42 tiles.
3. THE KEEP: geomancer 406 / row 38, ledge 404-408 floor row 39 hung on two chains from the tall hall's row-32 slab, over the long landing (row 45) and 7 rows above it. Sees x 385-427 (36 columns): the whole landing and the climb to it. Not early: the first user of the call. It IS reachable by dropping through the one-way walk above (row 32): a hero can land on his ledge and fight him (optional; flagged below as a question). Sign on the landing at 416/45. Away from the hall's chandelier at 398 so a sent-back rock does not go through it. Nearest shrine 42 tiles.
Count: 10 -> 13 geomancers; none within 30 columns of another; none within 12 tiles of a shrine, none in an arena, no foe within 4 columns / 5 rows.

## S4 - THE GEODE CALL AS BUILT
- Mode callTell (a 4th windup in GG_MODES only when the flag is on). Takes the throw where n % 4 == 2 (whatever throw it would have been), only if he sees you, you are >= 60 px away, there are >= 4 rows of air over your head, and the caps allow it: one live call per geomancer, two in the level at once. Never the sealed teach geomancer (448) or any early one (86, 366, 140, 300).
- TELL 0.8 s. The landing aim follows you; it LOCKS at 0.5 s (a red ring + clank), then you have 0.3 s with a fixed ring. A small violet ring closes over your head during the tell. A stagger/blow in the tell cancels it (no stone).
- STONE falls 0.6 s on the locked spot (the Queen's portal boulder drawn at 0.6x, her rock-shadow growing under it). Lands: radius 14 px, 9 damage (a roll or a block takes none; a hero standing 15 px off takes none). Burst + thud.
- BURST: 2 hanging shards at +-13 px, chest height, hanging 1.2 s (the Queen's glint over each). ANY hero blow or hero shot (src/hero-strikes.js: the melee box, the ranger's arrow, the pyro's ember, the pirate / warden ball, the berserker's hatchet and axe, the paladin's hammer, the reaper's scythe, the geomancer's own stone shard - all nine classes) sends one home: it flies to him at 320 px/s and hurts him for his OWN ROCK's damage (max(14, 36% of his 44) = 16) + STAGGERED 1.4 s; its twin falls apart (one payoff per call). Left alone both fade and nobody is hurt (the call costs you only the stone, if you stood in the ring).
- Counter for every class: leave the ring (you have the 0.8 s tell), then one blow / arrow / ember / shot / bash on a shard 15 px from you. A shield also takes the stone.
- Marks: 'gobgeo|callTell' registered in the four tables of src/marks.js (yellow !, answer dodge, height low, BY_HAND). tools/tells.mjs / mark-integrity use the table; tells.mjs passes (--write not run: the primer does not call for it).
- Lab bot hand geoCall (src/lab.js, hooked at the top of labBotFrame; null with the flag off): leaves the told ring (rolls through it when cornered in the last 0.3 s), then walks to and strikes the nearest hanging shard (melee heroes walk in; the five shooters fire from up to 120 px). Proved for all nine hero names in a fake room (the bot's attack key puts the right kind of blow or shot in the world).

## COMMITS (claude/gq6geo, pushed)
- 8010c7c73 S1: gq6geo.js flags + numbers, gobgeoLate + the last wrapper in level.js, tools/gq6geo.mjs
- 4da869632 S4: rules (gob-geomancer.js), hands (gobgeo-hands.js), marks, lab hand, cdp hooks, tools/gq6call.mjs, tools/gobgeo.mjs made flag-aware
- 49cac0c98 the node proof draws through a recording stub
(final sha = 49cac0c98)

## PROOFS (all node, no browser), flags OFF and ON
- tools/gq6geo.mjs: OFF 7 + ON 686 checks, green. (OFF: level hash = pinned master 3e2c11ae45a2, 10 geomancers, no ledges. ON: 13; standable perch (ledge, 3 rows of air, floor under his leash, piers / chains), sight to the route (>= 8 columns with a clear line, in his dx / dy band), off-route (Keep: drop-only), no shrine within 12, no arena, no foe beside him, 30+ columns from other geomancers, signs on route tiles, the level with the perches removed hashes to master, the route flood fill loses nothing and gains only the ledges, arena and shrines reached exactly as before.) ON hash 988d65f37d3f.
- tools/gq6call.mjs: OFF 4 + ON 75 checks, green (tell 0.8 s + aim lock at 0.5 s + stone on the locked spot; rotation 3 calls in 12; refusals for teach / early / 50 px / 3 rows of air / caps; the stone 9 within 14 px with the edge cases; hang 1.2 s; fade; blow and 7 projectile kinds send a shard home; 4 seats; stagger 1.4 s and his own rock's damage; caps 2 per level, 1 per geomancer in a 3-geomancer sim; no call under a ceiling; early / teach never call; cancel and clear; draw code runs; lab bot x 9 hero names).
- tools/gobgeo.mjs 96 asserts, green in all four flag combos (made flag-aware: 13 geomancers, 4 windups).
- Both modes green (exit 0): crown-exam, gprincess, gqueen3, gq4q, gq5q2, queen-stair, spawns (2665 creatures; ON the same), sprinkle-cap, solid-islands, floaters (3757 -> 3760 standing things ON = the 3 geomancers), floating-geometry, reach (76 to check by hand, same ON and OFF).
- Also green, both modes: tools/architecture.mjs (77 levels, 613 pieces, everything stands on something), comments, tells (1196 rows), checkpoints (290 checkpoints), level-quality (every gated level clears the bar; the old hash row for 'crown' goes stale only when the flag is on), geomancer.mjs (the hero's: 122 s, exit 0, OFF; ON ran in the first batch, exit 0), dangling-paths and homepaths (OFF).
- Pre-existing reds: none reproduced. The crown music-borrow red the primer names did not show in these per-tool runs (it lives in the full suite, which this lane did not run; check.mjs forbidden).
- Not run (they open a browser): mark-integrity.mjs, stuck.mjs, highcrown2.mjs, gobgeo-page.mjs, crown-requests.mjs and every *-shots tool. I STARTED mark-integrity.mjs by mistake inside my batch (it opens a headless Chrome); I killed only my own process tree (the node, its timeout wrappers, the one chrome and the batch script, PIDs 19104 / 18668 / 21052 / 2572 / 13240) about two minutes in, and re-ran the batch without it. The browser lane's Chrome (parent 19056) was not touched.

## ART LIST (every frame / asset the art lane draws before GQ6CALL can ship)
1. Geomancer pose CALL TELL (staff raised high in both hands, amethyst geode blazing, a violet ring forming over the staff): 2 frames (a 2-frame wobble, as the Queen's geodeTell). Today it wears frame 6 (the rock's staff-up pose): src/redraw/gob_geomancer_art.js ggFrame 'callTell'.
2. Geomancer pose CALL RELEASE (staff slammed / pointed down at the floor, mouth open): 1 frame. Today the release reuses frame 7 (the throw). NOTE the sheet's last frame is the hurt pose (main.js HAS_HURT, GG_FRAMES 15): insert the three new frames before it and move GGF.hurt, or append and fix HAS_HURT.
3. The falling stone: today the Queen's boulder (gq4_art drawBoulder) scaled 0.6 in canvas space (may blur): bake a 12 px version (3 rotations) of it.
4. The 2 hanging shards: today geomancer chunks (drawChunk) + the Queen's hang-glint; a proper amethyst shard pair (2 sizes) + glint would read better.
5. The told rings: today canvas strokes (violet ring over the hero, an ellipse on the floor that turns red at the lock): bake a 3-frame ring FX (violet close, red lock, burst).
6. Sound: tell (crumble + thud), lock (clank), fall (leap), landing (thud + crack) are existing sfx - an own tell sound and landing are owed (every move told: own sound).
S1 needs NO art (existing hcpier / hcchain, existing sign).

## BROWSER OWED
S1 (flag ?gq6geo=1; no art needed, can ship alone once these pass)
1. Stills at 1x of the 3 perches from where the hero stands: Crag Walk (from the plank bridge 124-132 / row 53), Bakehouse (from the net top and the east steps), the Keep (from the landing, row 45): is the geomancer, his pier / chain, the sign and the route in one 320x180 view; does his rock arc read?
2. Camera: the Keep ledge is 7 rows over the landing and the Crag 5 over the bridge - is he on screen when he tells? (the camera shows ~11 rows)
3. n=6 level-run deaths per section (Crag walk, Bakehouse yard, tall hall) flag ON vs OFF; a first-time hero must not be hit from off screen.
4. A hero who drops through the row-32 walk onto the Keep ledge: no soft-lock, he can be fought, the chain art reads.
5. Stamps to refresh the day GQ6GEO flips ON: docs/level1-pilot.json, docs/mash-bot.json, docs/level1-curve.json (all carry the 'crown' hash 3e2c11ae45a2 -> 988d65f37d3f), and tools/gq6geo.mjs MASTER_HASH if Highcrown changes first.
S4 (flag ?gq6call=1; blocked on the art list)
6. The call tell read at 1x: is 0.8 s with the violet ring and the red lock readable; is 0.3 s after the lock enough to leave the ring for the slowest hero; stills of tell / fall / landing / hang.
7. n=6 per hero (nine classes): leave the ring, strike a shard - does each hero's REAL attack hit the 9 px box on a shard 15 px away (pyro ember, pirate / warden ball, ranger arrow, geomancer stone, berserker hatchet, paladin hammer, reaper scythe)? Does a parry of the stone behave (damagePlayer parry path)?
8. The bot in real play: labBotFrame only runs where a lab duel / level pilot calls it - confirm geoCall is reached in a Keep level-run pilot (tools/geomancer-pilots / gobgeo-page LEAD), and that a bot that ignores the tell does die to it.
9. Boulder at 0.6x via canvas scale: blur / draw cost; hang glint cost.
10. The mark: yellow ! over callTell on screen (mark-integrity needs the page).
11. Balance: stone 9 + a shard home = 16 of his 44 (36%). One call per ~9 s. Tune lane: stone dmg, hang time, one payoff vs two.

## NOT VERIFIED
Everything in a real page: the draws (a recording stub only proves the code runs), main.js's real foeUpdate flow (attack-token board, perch lobs), the real hero attack boxes against the 9 px shard box, co-op beyond the 4-seat fake room, the lab hook in a real level run, frame time. The Keep ledge drop and the sight bands are geometry, not played. tools/check.mjs and the full suite were not run.

## QUESTIONS (rec first; built as the rec)
1. "max one call per geomancer": at ONCE (built) or ONCE EVER? Rec: at once; once-ever makes the rehearsal almost never happen.
2. Both shards pay out, or one payoff per call? Rec: one (built; the first home dissolves its twin).
3. The Keep geomancer is reachable by a drop from the walk above - keep (optional kill)? Rec: keep; otherwise move the ledge 2 rows up.
4. Crag Walk and Bakehouse are 'early' (gentle, never call) and the Keep is the first caller. Rec: keep.
5. Ship order: S1 can ship alone (no art), S4 waits for the art list. Rec: S1 first behind its flag, S4 after the art lane.
