# claude/exitgates - THEMED EXIT GATES (art only)

**Where the old gate was drawn:** `src/main.js:29202` (`g.drawImage(PROP.gate, gate.x - 24 - cx, gate.y - 52 - cy)`), sprite `ART.bakeGate()` at `src/art.js:473` (one mossed stone arch for every level; PROP built at `main.js:960`). The goal trigger is `main.js:9731` (|dx|<12, |dy|<30, atGate()) - untouched. `gate` is set from the level's 'gate' ent at load (`main.js:2140`).

## What changed
- NEW `src/exit-gates.js`: table `KIND_OF` (level id -> region landmark), ten baked landmarks, `draw()`, `prime()`. Baked once per kind at level load (`EG.prime` next to the gate ent), never on a frame; every bake helper clamps to the canvas (no negative-y pixel).
- `src/main.js`: import + `EGSFX`, prime at the gate ent, and the one draw line replaced by `EG.draw(...)`. index.html modulepreload list regenerated (+1 module). `PROP.gate`/`bakeGate` left in place (still used by the editor/pause art at main.js:30962).
- Landmarks: forest = mossed stone arch + oak doors; marsh = lashed timber stockade gate; fungus = two toadstool caps over a mycelium veil; crag = standing-stone trilithon + prayer flags + rising hide curtain; mine = headframe with lift cage (cage doors part); storm = crenellated gatehouse + portcullis; coast = ship-timber gate with a bulkhead hatch; canal = lock with mitre gates + balance beams; inland = STONE slate-roofed lychgate with iron wicket (Waymeet's is the timber one); desert = sandstone doorway with a sliding slab.
- SHARED READ: gold lantern on top of every gate + a gold ribbon: dark brass when far, LIT within 120 px (flare, halo, ribbon streams, chime = existing SFX.lightFull once). Within 64 px the doors open (existing SFX.gateOpen once), doorway fills with warm light. Eases by time. If the gate is locked (L.arena not won) lantern stays dark, door shut. No new audio asset, no input lock.
- Collision, goal trigger, levels, hashes, deadends, route data: not touched.

## Levels with NO gate (boss kill = win): nothing to draw, left alone
marsh, stockade, spore, kings, scree, crown, hurricane, lamplit, causeway, fields, mage, witchlight, oreroad, unburied. (Adding a landmark would need a new ent = hash change, forbidden.) Their regions still get their landmark on the levels that do have a gate (burning, rootway, underleaf, hanging/spire/moor/skyroad, minecart, ...).

## Checks (PORT 8827, run sequentially, release suite running alongside)
- pixels ok (46 levels, 2963 sprites); mark-integrity ok; deadends ok (264 dead ends, all pay); syntax/comments/homepaths/dangling-paths/content-audit/floaters ok; modulepreload ok (402 listed).
- level-quality: MINECART "curve" FAIL (act 1 knight lost 270% > 250). tools/level-quality.mjs is pure node on level data and never imports main.js/exit-gates, so it cannot be this lane; I did not run a base comparison. Everything else clears.
- Route pilots: towpath-route green (all heroes walked, 0 deaths); harbor-route green. redgorge-route / ksar-route report deaths/failed legs (bot-lift routes; art-only change, not compared against base). welltown-route.mjs dies with a SyntaxError inside its own page script (tool bug, not mine).

## Shots (work/claude/shots/exitgates/)
`sheet.png` (all ten, shut / half open lit / open), and per level closed / lit / open + zoom: wood (forest), burning (marsh), rootway (fungus), hanging (crag), minecart (mine), storm, longwater (coast), canal, burial (inland), caravan (desert). Tools: tools/exitgates-sheet.mjs, tools/exitgates-shots.mjs (god mode; sets gateOpen, parks the boss trigger).

## QUESTIONS FOR DANIEL (rec first)
1. Open animation: you walk 64px -> 12px (win trigger) in ~0.3 s, so on a run you see the doors part as the win card lands. Rec (built): keep the trigger as is. Alternative: a short hold (needs a logic change, out of this lane).
2. Lit Church got the lychgate kind (region canal by chain, but a church); say if it should be the canal lock instead. Trials (hidden) use the forest arch default.
3. Fourteen boss-win levels have no gate at all; want a decorative landmark behind the arena exit later (needs a hash-changing lane)?
