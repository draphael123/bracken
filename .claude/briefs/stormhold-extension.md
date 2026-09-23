# STORMHOLD LONGER + THE QUEEN'S LANCE, TWO MORE ATTACKS (agreed with Daniel 2026-09-22)

## Why
Daniel: "stormhold should be a bit longer, and the boss should have one or two more attacks." Today: 430 wide, the Lance's
arena at x 302, ~300 tiles of road in four sections (Under Street, Smoke Row, the Halls, the Long Bridge) plus pass two
(Chimneys, the feast). The Lance already has ~9 moves (thrust, bash, sweep, whirl, vault, javelin, gale, guard, rush), so
the new ones must use what only his fight has: THE BRIDGE and THE STORM. Not another swing.

## The level: THE CURTAIN WALL (new section, ~100-120 tiles, between the Halls and the Long Bridge)
The way to the bridge goes up the OUTSIDE of the castle wall in the storm.
- A CLIMB, not another street: ~20 rows up the wall face (ledges, arrow-slit sills, a chain hoist), then the wall-walk to the
  bridge gate. Contrast with the flat, indoor Halls. Remember the reach model: at a 3-row rise the knight carries ~2 tiles
  across - ledges overlap. Use grow() to open the gap so nothing after it renumbers by hand; ELITES coords past it shift -
  grep level.js for 'storm'.
- LIGHTNING RODS (the section's mechanic): iron rods on the merlons glow and crackle, then a bolt strikes everything within a
  few tiles. Told, readable, and usable - lure goblins under them. Teaches the storm before the boss uses it. Red ✕ over the
  rod's tell; touch rule applies.
- MURDER HOLES on the climb drop stones on a clock (told, blockable `!`); GUSTS on the wall-walk push toward the edge
  (Gale Moor's wind code). No death drops: a fall lands on the ledge below.
- OPTIONAL MINI at the bridge gate: THE GATE SERJEANT, a heavy goblin with the winch key (Stormhold has no mid-level beat).
  If built: his own tells, touch rule, a player-made opening proven in tools/boss-openings.mjs, pilot >= 21 runs.
- Kit: GARRISON row covers it (no blanket calm), 3.5-4.5 foes/screen (vshape for the climb), checkpoint at the foot and on the
  wall-walk, a silver in a rod alcove, dead ends paid, signs <= 2 lines.

## The boss: two new attacks, one a phase
1. THE HOOK (phase one, `!` blockable): he hooks the span's rope rail and heaves - the planks tilt toward him and you slide
   into his thrust; guarding braces you. THE OPENING: stand on a STONE PIER when he heaves and nothing tilts - the hook jams
   in the rope and he spends ~2 s tearing it free, open. (Proof: same heave on planks vs on a pier.)
2. CALLING THE BOLT (phase two, red ✕): the lance thrown away, he drives its broken shaft into the planks as a rod; ~1.5 s
   later a bolt strikes it and runs along the wet planks both ways - jump it or be on a pier. THE ANSWER: strike the rod once
   before it lands and it falls - the bolt finds HIM instead (open, double). Pays off the Curtain Wall's rods.
- Marks: add the rows to src/marks.js (BY_HAND if the fight is inline) and `node tools/tells.mjs --write`.
- Pilot: he has never been piloted against the target - measure BEFORE the change (24 fights, normal health), then after;
  aim 60-75%. Put variety in the fight (random start in his order / cd jitter) or the passes come out identical.

## Size
Curtain Wall + Serjeant ~1 session; the two attacks ~half. One long session or two short. Queued after the Gate Gargoyle half.

## THE NUMBERS (read from updateLance, main.js - find it by `function updateLance(`; 2026-09-22)
How he chooses today: per-attack cooldown timers counted down in his two stances - phase one `case 'pace'` (chargeT,
thrustT, sweepT, bashT 1.5, vaultT 4, javT 3, galeT 2) and phase two `case 'guard'` (whirlT 5 -> 7, bashT -> 3, sweepT -> 1.9,
rushT 2). Tells today run 0.36-0.8 s (bashTell 0.36-0.42, guardTell 0.38, sweepTell 0.45, thrustTell 0.5, whirlTell 0.65,
galeTell/couch 0.8). He is open only when committed: reel 1.4-1.5 s, stumble 1.2 s, planted 2.8 s, recover 0.7-0.75 s.
Braced (nothing lands) in LANCE_BRACED. Bridge: deck row BY 30; seven piers every 18 columns from P0 302, each 5 wide; spans
of 13 between them; a lookout plat 3 rows up on piers 1-5. Add both moves as ONE MORE TIMER each, the same way:
1. THE HOOK - phase one, in `pace`. hookT: first 5 s, then 9 s. Chosen when the hero is on a SPAN (not a pier, not a lookout)
   40-120 px off. hookTell 0.7 s, yellow `!` (a blow a shield turns: the heave). The heave, 1.1 s: that span tilts toward
   him - the hero slides toward him at 90 px/s (15 px/s while blocking: the brace), and it ends in his existing thrustTell.
   THE OPENING: the hero on a PIER when the heave lands -> nothing tilts, the hook jams in the rope: mode 'hookJam', 2.0 s,
   open like 'planted' (his plate is no use to him). A heave that catches the hero on planks opens nothing.
   Proof (boss-openings.mjs): the same heave with the hero on a span vs on a pier -> no open vs open >= 1.8 s.
2. CALLING THE BOLT - phase two, in `guard`. boltT: first 4 s after the phase, then 10 s. He drives the broken shaft into
   the planks one step in front of him: a ROD prop (1 hp) and boltTell 1.5 s, red cross (`!!`) with a crackle rising on it.
   The bolt: strikes the rod and runs along the planks of the span it stands in and the next span each way - 22 damage
   (DMG.lanceBolt), unblockable, to anything standing on planks; piers, lookouts and the air are safe.
   THE ANSWER: strike the rod once during the tell -> it falls, the bolt finds HIM: mode 'struck', 2.5 s, open, double.
   Proof: the tell left alone -> the bolt, no open; the rod struck -> 'struck', open >= 2 s.
Marks (updateLance is inline, so BY_HAND rows + `node tools/tells.mjs --write`): 'lance|hookTell':'!', 'lance|boltTell':'!!'.
Order of work: pilot him FIRST as he is (24 fights, normal health, `BK.bossLab({bosses:['storm']...})` like
tools/grave-warden-pilot.mjs; add jitter to his timers if the passes come out identical), then add the moves, then pilot
again - aim 60-75%. The lab bot needs: stand on a pier when hookTell shows (the player's answer), strike the rod on boltTell.

## THE CURTAIN WALL GREYBOX EXISTS
Branch claude/prep: src/draft/curtain-wall.js (the section painter, local columns, CURTAIN constants) and
tools/curtain-wall.mjs (splices it into the real Stormhold at x 276 and measures it: bridge reached, climb 21 rows, the
Serjeant's gate holds, route-breaks clean). Build it with grow(L, R, 276, 112) inside stormhold() and shift every hand-placed
x >= 276 (ELITES 'storm', REVIEW, tools) by 112. The climb goes DOWN into the gorge and up the outside of the wall because
rows 0-18 are the house interiors (indoorRow 18). NEW props to build: 'rod' (lightning rod, told red cross), 'murderhole'
(a stone down a column, told `!`), 'gateserjeant' (the mini). Placed foes are light (1.7 a screen): add ENCOUNTERS, not a
sprinkle (Daniel, 2026-09-22).
