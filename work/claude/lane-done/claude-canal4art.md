# claude/canal4art - the Legging Tunnel's and Jenny's raft duel's art pass (Sonnet, overnight 2026-10-06)

Base: origin/claude/canal4 46d209ad. ART ONLY: no layout, mechanic, number, foe or rule moved (the only data-side edit is none; every change is drawing).
Stills: work/claude/lane-done/canal4art/before and /after (tunnel t1-t9, Jenny j-01..j-14). Tools: tools/canal4art-shots.mjs, tools/canal4art-jenny-shots.mjs (not in the suite).

## The Legging Tunnel (src/redraw/canal_tunnel.js, hooks in src/canal-hands.js, canal_props.js, canal_tiles.js)
- VAULT: brick barrel vault in London stock, a dressed stone springing course with a lit arris, the vault shading away overhead, cast-iron lining rings every 64 px (flanged, bolted, rust-streaked), damp streaks and salts, a slime tide-line, dead gas-lamp brackets, chalk leggers' tallies, drips ringing the water. The deep lock's shaft is dressed ashlar with tide bands, ring-bolts and a white painted depth gauge.
- PORTAL: a stone archivolt with a keystone (a carved lantern) over the mouth and an iron plate on chains: LEGGING TUNNEL. A DEEP LOCK plate hangs on chains from the gallery's underside. (3x5 pixel face for the plates.)
- LOW BEAMS: each rib is a cast-iron arch rib with an iron tie-bar on two hanger rods, yellow hazard chevrons, a drip. Lit they read; dimmed they vanish (the rule).
- LEDGE: granite leggers' slab, boot-polished, lit lip, iron nosing, iron strut brackets (tile kit, x 248-344 rows 14-16).
- LANTERN LIGHT TELLS WHAT YOU CAN SEE: lit = a warm additive reach plus a dashed rim at the edge of what she shows; dimmed = a red ember and a short cold dashed ring (all you see). The theatre glow is quieter (x0.45) inside the tunnel so the dark reads; kept outside it.
- STOP-PLANKS: iron channel grooves, tar-black planks with iron straps, a yellow/black banded top plank (the thing to look for), a lifting eye, slime at the waterline; a chain runs up to a SHEAVE on the ledge and a rope runs from it to the WINDLASS, so the link between planks and windlass is drawn. WINDLASS: bedplate, cast frames, wound drum, ratchet wheel and pawl, brass crank, WIND plate. THE DEEP LOCK'S PADDLE GEAR: heavy frame, climbing rack, spoked handwheel (green when up).
- MOON SHAFT: iron grating, a moon, a shaft of moonlight with turning motes, a pool and rings on the water.
- NOTHING FLOATS: new tools/canal-aloft.mjs (in check.mjs, Node): tie-bars on solid ribs, the portal on solid hill, the sheave and windlass and paddle gear on ledges, the hung plate under real ledge, the grating between walls.

## Jenny (src/redraw/greenteeth_kelp.js, hooks in src/jenny-greenteeth-hands.js)
- KELP BODY (HIT HIGH): a blue-teal mantle round hips and legs, twisted-stipe belt with pale bladders, ragged pale hem; her head is bare. KELP HOOD (HIT LOW): a tall rust-brown peaked cowl, two lappets, amber crown bladders, her eyes burning in the dark of it; her legs are bare. Different colour AND silhouette; the bar word and gold outline kept. Wary = both.
- Phase 3 shift: the kelp streams sideways and gold swap chevrons run both ways between hips and head, with flecks of both kelps (told, as before by the bar).
- RAFT: lashed timbers on riveted iron straps, ring-bolts, hemp lashings, tarred iron-hooped barrel floats under the edges, rope fenders; the barge hull and lantern kept. Heave / lower arrows untouched.
- CLAWS STUCK: three long hooked claws driven into the deck, the timber split, splinters, a frayed lashing, a gold line under them, the gold ring and OPEN kept.

## Checks (PORT 8662), all green
greenteeth, canal, canal-water, canal-aloft (new), signs, hint-shown, level-quality, tells (exit 0), render-layers, floaters.
## UNVERIFIED / reds
- textfit timed out at 280 s on the busy PC (it had passed every scope it reached; no text I touched is in its scopes) - rerun in the suite.
- Not run: slopes-trace, mash/curve gates (no number moved), a full-suite. Stills only, no human eye in play; the dashed light rim and ember are subtle on a phone.
## QUESTIONS FOR DANIEL
1. The light rim: dashed ring at the lantern's reach. Rec keep; drop it if it feels like a UI circle.
2. Exit portal: not drawn (the exit is a lock gate, a plate there would hang from nothing). Rec leave.
