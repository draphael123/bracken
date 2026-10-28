# HIGHCROWN 2 ART lane (sonnet) - claude/highcrown2 (on top of greybox 5608179e). Not merged, not deployed.
HEAD: see the last commit on claude/highcrown2 (pushed). Level hash UNCHANGED: crown 9c42eb2a437a before and after (drawing only; no grid/ents/movers edits).

## Drawn (new src/redraw/highcrown2_art.js; hooks gated on L.hc2Kit in main.js + route-art.js; data in src/highcrown2.js: R.hc2Kit, R.hcDeco, R.hcDoors)
1. Kitchen-stair door behind the shut port (cols 0-4): voussoir arch, iron-bound oak, stair going down with hearth glow.
2. Gate arches (bailey 23-27, ward grate 72-76, vestibule west/east): voussoir ring + keystone with the crown glyph over the lintel, jamb stones, portcullis grooves, hoist-chamber slot with chain.
3. Murder-hole slot (33,53) in the wall-walk soffit, corbelled lips + ring.
4. Hoist (all Highcrown winches): stone cheeks, iron-banded oak drum + crank, chain over a pulley at the gate head. Crag tower gate: iron beam + corbel over the arch.
5. Grate + bell (grate bell over the ward arch, Queen's boss gate): square iron bars, strap bands, tines; cast-bronze bell on an iron bracket pinned in stone corbels (was drawLanceGate placeholder).
6. Barracks: stone room (beams iron-strapped, loops, two-tier bunks, shields), oak iron-strapped door tile (PORT tile at 79), eave corbel.
7. Tall hall (rows 26-63): new castle-stone interior 'hchall' - ashlar, corbel table, pilasters with capitals, blind arcade, lancet windows with moonlight shafts, Queen's purple tapestries on rods, panelled dado. Replaces the brown panelling.
8. Every one-way ledge in the castle (x<530) is now a stone slab: lit lip, mortar course, soffit shadow, corbel-stepped free ends. Supports are castle piers (battered plinth, ashlar courses, stepped corbel capital) and heavy iron chains (wall plate bolt, links, collar) instead of church piers. Auto-pass gives every previously unsupported run a pier or corbels (wall-backed: corbels along it; free: piers). Corbels under the west balcony and the high gallery. Chandeliers hang from an iron ring in a stone boss on a link chain.
## Checks (all green; pre-existing reds untouched)
floaters ok; architecture ok; level-quality crown CLEARS; highcrown2.mjs ok; dressing ok; tells ok; boss-read ok; textfit bestiary 0 issues.
solid-islands: crown was 6 bare islands (the hung landings) when my kinds were unknown to the tool -> taught tools/solid-islands.mjs 'hcchain' = chain; now crown 1/allowed 1.
anchor-lint: not on this branch (claude/rookery2) - floaters + architecture used. mobile-perf crown scene (4x CPU, 915x412): 55.8 fps, p95 18.5 ms, worst 35.7 ms - inside budget. (Only the start scene measured; the hall's baked 1328x608 wall is one drawImage.)
## Not drawn / weak
- Queen ring-the-bell: no new sprite pose (her existing ringTell frame is used); the tell is still the greybox red particles up the grate column. Rec: a dedicated bell-rope pull frame + a ring-of-light on the grate in a later boss-art pass.
- Ward bell pull-rope not added (the bell prop sprite has its own frame); stair mass is plain masonry tiles (no arched undercroft); barracks bunks are thin; 'eave' deco code is unused.
- Crown start 'start' shot not checked behind the intro banner (the banner hides the arch ring in winch-gate/start frames).
- Queen not watched in motion by me (no art change to her; highcrown2.mjs page check green).
## Questions
1 Queen ring pose/grate-drop FX art pass later? rec yes. 2 Keep timber for barracks beams/door/bunks and winch drums only? built so.
## Best shots (work/claude/shots/highcrown2art/): vest-west.png, hall-landings.png, hall-floor.png, sheet.png (+ before: work/claude/shots/highcrown2/sheet.png)
