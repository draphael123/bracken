# claude/deeprails2 - DEEP RAILS 2 + GREAT DRILL 2 (Opus, 2026-10-09, Daniel's live playtest: "I like the concept, it just needs work" - DKC mine carts)

Base: origin/claude/batch81 a41b1f60 + origin/claude/reachcore (merged first; conflicts in check.mjs / main.js / reachcore.js solved as a union; docs json kept ours).
Brief: scratch/brief-deeprails2.md. Port 8801. Every open choice built as recommended (questions at the end).

## 0. MAIN ROAD
- `storm.needs = 'minecart'`, `minecart.needs = 'oreroad'` (no hidden / secret / needsKills). Road: Ore Road -> THE DEEP RAILS -> Stormhold.
- Map (crag sheet): the node is ON the road (no spur). Relaid with a search over the real `layoutPlates` + every map-spacing rule: Ore Road (281,103 -> 281,109), DEEP RAILS
  (239,80), Stormhold (264,55 -> 267,55) + plate sides; the board says **DEEP RAILS** (new `board:` field, src/map-plates.js + main.js draw - the full name stays on the
  info panel). Every node disc that showed before still shows (the full-name plate either covered its own disc or the Ore Road's). map-grammar ok, map-spacing: only the 2
  pre-existing lamplit/keep offences (batch81 integ item). Pictures: work/claude/deeprails2-map/dr2d-crag-*.png.
- tools/ore-road.mjs asserted storm needs oreroad: updated to the new order (Daniel's design call, not a weakening). Old saves mid-road (Ore Road cleared, Stormhold not)
  now meet the Deep Rails before Stormhold (question 3).

## A. THE CART (src/minecart.js MC, src/minecart-hands.js)
- RULE (asserted = code header): "THE CART NEVER STOPS. HOLD RIGHT TO PUMP, LEFT TO BRAKE, AND THROW THE POINTS AT THE JUNCTIONS."
- ALWAYS FORWARD: cruise 150, RIGHT pumps to 230, LEFT brakes HARD (sparks off the wheels + a screech) down to a CRAWL of 50 - never stopped, never backed (the reverse
  gear is gone; a wall/gate crash throws the cart back a length and it rolls on). The speedometer reads true (CRUISE / PUMP / BRAKE / RAM! + a red ram tick).
- RAM at >= 200 (full pump): a goblin on the line (60), a goblin cart from behind (off the line), the foreman's cart; slower = a BUMP (12, thrown back a length).
- DKC verbs: jumps, ducks, points at told junctions, RAILS THAT BREAK behind you (break front 170 px/s from 56 px back: cruise is caught, pump escapes - taught at 314,
  remixed under the cave-in chase), a LAUNCH RAMP over the lava (cruise falls short 112 px, pump flies 191 px over a 160 px pit - probe-measured), cart-to-cart (slow carts:
  ram or hop in). Teach -> test -> remix -> exam in ARCS (points / speed / combat).
- CART REDRAW (MCA.heroCart): a riveted, flared iron tub with a rolled rim, spoked wheels that turn with the pace, a brake shoe that glows and throws sparks, a lean on
  jumps; drawn in two parts (back wall + dark inside BEHIND the hero, front over his legs) and the hero raised 3 px so his head and chest sit IN it. Always faces forward.
- TWO ON-FOOT STRETCHES (positional: FOOT in src/minecart.js): THE WRECK (632: the cart hits a buffer and derails, you're thrown out onto the works yard - a loading deck
  fight: sapper, deck brute, gantry archer - a cart waits at 674) and THE LIFT (758: the line ends, a cage lift (vertical mover) up 10 rows, a cart waits at 783).
- AREAS (A8): THE LAMP YARD (lantern-lit), THE DARK DRIFT (171-309: pitch, darkZone 0.88 - the cart's HEADLAMP CONE + holes for goblin lanterns, levers, crushers,
  beams; no lamp posts), THE GOBLIN LINE (green cast), THE GLOW CAVERN (lava pit + glow, high roof, the cave-in chase), THE WRECK / CRUSHER WORKS / THE LIFT (works cast),
  THE FLOODED RUN (black water under the exam's trestles, cold cast), THE SMELTER + THE BORE.

## B. COMBAT IN THE CART
- Swing from the cart; RIDERS on parallel lines: one rides at HIS OWN PACE (172: cruise and he pulls away shooting, pump to catch him); the caster's runes; the pair.
- THROWERS on ledges (goblin miners, existing type): told '!' + a MARK on your rail where your cart will be (runeAt, 1.0 s): brake off it (or pump past). Two: 372, 714.
- THE FOREMAN (the exam's ELITE, brute + eliteName, affix UNSTOPPABLE, gate 868 holds the line): an ARMOURED cart on your line - blades x0.35 with a told clank
  'ARMOURED: RAM HIM', a RAM at full pump takes a third of him (three rams) and throws your cart back a length to pump again; he lobs bombs back (told marks).
  tools/elites.mjs now checks minecart (PENDING removed) - green.
- No new foe type (one-new-foe: minecart exactly none): archer, gobmage, miner, brute, sapper, tippler, bat. Living goblins OK (before the Goblin Queen on the road).

## C. THE GREAT DRILL 2 (src/great-drill.js pure + bot, src/great-drill-hands.js, MCA.rig / MCA.tunnel)
- LOOK: a conventional drill rig - gear housing with three bare red cogs + striped ram plate, a deck, an armoured CAB with the GOBLIN DRIVER (looking back at you),
  engine block, smokestack (smoke), tracks + road wheels, a big fluted conical BIT drilling the rock face ahead. Bestiary card/text redone.
- ARENA: an ENDLESS LOOPING TUNNEL drawn edge to edge over the whole screen while it fights (wall, ribs, lamps, floor, three lines - one pace, far rock at half): no static
  tile, no stray ring, no half-moving scenery. The rig drills AHEAD of you; you chase it (the tunnel treadmill).
- OPENING (kept + clarified): it is a mining rig - it kicks a LOADED ORE CART off its back onto the LOW line ('ORE!', it pulls ahead to make room); PUMP AND RAM IT (>= 200)
  and it flies back into the gears: JAMMED 4.6 s (gold OUTLINE on cab + gears, timer bar - B10; cab x2, capped 20%/jam; it drifts back to you). Met slower = a crash.
  Then a told 3 s ward ('IT CLEARS ITS GEARS: ITS PLATES ARE UP') - blades still x0.4 (B15), an ore cart then is shrugged off (B3).
- OUTSIDE THE JAM the cab is ARMOURED x0.4 with a clank + 'ARMOURED: JAM ITS GEARS' (B15 floor; never totally invulnerable - asserted in every mode).
- MOVES: P1 BOULDER DROP (told sliding shadows on two of three lines, 1.1 s) + REVERSE RAM (!! lamps + klaxon 1.25 s, 97 px sweep: brake out of it, or JUMP UP to the
  HIGH line - it runs on over the rig's flat roof to its stack, 150 px in); P2 NEW: SPARK SPRAY (told amber cone down YOUR line 0.9 s, then 1 s of sparks: change line or
  brake out of reach); P3: THE ARENA CHANGES - the roof takes the HIGH line (two lines left: the reverse must be braked). 'greatdrill' synth theme kept.
- hp 2600 (EHP; ~3040 with normal health at L13).

## NUMBERS
- GREAT DRILL, WITH FLASKS (tools/boss-rates.mjs minecart --ways=practiced --profile=human, campaign L13; --flasks=kit is NOT on this base - the human profile drinks
  the campaign kit's flasks), 12 seeds a hero: knight 7/12, warden 11/12, pyro 7/12 = **69%** (band 60-70), no hero at 0. Fights: knight 74-115 s, warden 70-100 s,
  pyro 109-147 s.
- DRY (human+dry) 6 seeds: knight 1/6, warden 2/5 (+1 page-init ERR), pyro 1/6 = 24%.
- MASH (stamped LEVEL then BOSS): level - every hero dies (6-7 deaths, lowest 0%); THE GREAT DRILL 0/6 (dead in 27-36 s).
- WALKER (tools/level-walk.mjs, campaign L13, typical build, human+first; NEW: in a cart level the walker's hands are the cart pilot's): knight 1 death / arrive 48%
  ("on target"), warden 0 / 56%, pyro 0 / 47% (target 1-2 deaths, arrive < 50%). The plain walker cannot ride (stuck at the yard points, 8 falls at a pump gap).
- CART PILOT base inputs (god, no foes): ALL SEVEN heroes ride every leg. At L13 with foes: warden/pyro ride it all; the knight died once in the exam (the rune gap).
- PROBE: every pump gap (cruise falls in, pump clears, 8 px early clears); the lava ramp (cruise falls short, pump lands 628).
- LEVEL-1 PILOT (stamped): 42 hits, 5 deaths / 3 runs, walked 100%, 28 lifts. level-quality minecart: CLEARS THE BAR. No curve row (question 5).

## CHECKS RUN (green unless said)
minecart (259, rewritten for the new design - stricter where it touched: the 5-word rule now really splits on spaces), minecart-aloft (ramp lip/landing, the tunnel arena),
minecart-route (base x7, L13 x3, probe), level-quality, elites, one-new-foe, checkpoint-gaps (station one moved 144 -> 148: A10b), collectables, deadends, spawns,
killzones, traps (19, all pre-existing skyroad/keep), solid-islands, slopes, goblin-lint, comments, homepaths, dangling-paths, ore-exam, ore-road, stormhold2, crown-route,
map-grammar, map-spacing (2 pre-existing lamplit), class-spurs, level-reach, reach-heroes (the lava ramp's pit is a ride: src/reachcore.js carry; also fixed a SyntaxError
from reachcore - an apostrophe in a single-quoted reason), hint-shown (all new lines routed), boss-greed, audio-assets, boss-music, content-audit, weak-bosses,
rule-openings, boss-openings, boss-fight-end. NOT RUN: the full suite (shared PC), textfit, the --page variants of minecart-aloft, corpses (page).

## REDS
- None of mine known. map-spacing's lamplit/keep (2) are batch81's. The full suite not run.

## QUESTIONS FOR DANIEL (recommendation first - it is what is built)
1. The warden wins the drill 11/12 (knight / pyro 7/12; 69% overall, in band). Her spear's reach strikes the cab from back where the reverse cannot reach. Rec: ship at
   these numbers (hero-agnostic tuning would push knight/pyro under 60%); alt: a reach-capped cab (a short window) - not built.
2. The cart still waits 1.2 s at the start and at each station (RIGHT goes at once) - a beat to read the first tell. Rec: keep. Brake floor 50 px/s (a crawl). Rec: keep.
3. Old saves with the Ore Road cleared but Stormhold not: Stormhold is now locked until the Deep Rails. Rec: keep (it is the main road now); alt: grandfather them.
4. The map board reads "DEEP RAILS" (the info panel keeps THE DEEP RAILS): the full name could not sit on the road without covering a node. Rec: keep.
5. No curve row (the level-1 knight's walk of a cart level is not its curve: 373%/run). Rec: the curve owner gives cart levels the cart pilot (or report-only).
6. The walker in a cart level now rides with the cart pilot's hands (tools/level-walk.mjs). Rec: keep (without it the walker can't measure the level at all).
7. The hero always faces forward in the cart (DKC): a goblin behind you is dodged (pace), not struck. Rec: keep.
8. Music: the drill's theme is still composed in code; picks (unchanged from the minecart lane): "Machines" (Tsorthan Grove, CC-BY 4.0), "Basilisk Boss Battle Loop"
   (beardalaxy, CC0), "Boss Battle (loop)" (Alex McCulloch, CC0). Rec: "Machines".

## ART FOLLOW-UP (Sonnet pass) - stills: work/claude/minecart-art/dr2-after (before: dr2-before)
- THE HERO'S CART: proper sprite (wider tub, rim highlight, wheel spokes, brake sparks), a SEATED riding pose (the hero's idle frames stand), lean/tilt polish.
- THE FOREMAN: sit him IN the armoured cart (he stands over it at EL.big 1.5 now), a foreman cnSkin (hard hat, lamp, whip), dents per ram.
- THE RIG: real pixel art - cab interior + the goblin driver's animation (levers, looking back), jam smoke, ward plates, the spark jet, reverse lamps, the ore cart
  on its back deck and the kick-off, track links, the bit's spoil spray, the rock face.
- THE TUNNEL loop: richer parallax far wall, ore glints, a seamless check at every VW.
- AREAS: THE GLOW CAVERN (open cavern backdrop, lava falls landmark, glow on the walls), THE FLOODED RUN (water surface, reflections, drips), THE DARK DRIFT (cone
  falloff, broken lamps, eyes in the dark), THE WRECK (tumbling wreck sprite, works yard dressing), THE LIFT (cage, counterweight, head frame).
- Set pieces: ramp kicker, breaking rail (rot, sag, debris), thrower ledges + the thrown pick, buffer stops, the lob marks.
