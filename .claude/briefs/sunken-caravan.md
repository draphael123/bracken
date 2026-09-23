# THE SUNKEN CARAVAN — first desert level, brief (agreed with Daniel 2026-09-21; needs the SLOPES engine batch first)

## What Daniel asked for
"After the falling tower we need to work on a desert map." He approved THE SUNKEN CARAVAN, with THE DUNE WORM as the BOSS
and NO mini-boss, and slopes for the dunes (their own engine batch, `.claude/briefs/slopes.md`, built first).

## Where it sits
The first level of a new DESERT arc: down off the tower's hill into the edge of the desert. On the world map a new sheet or a
new band past the inland road (decide in the build: worlds are BANDS, not skins - memory lesson). `needs: 'fallingtower'`.

## The level
You follow the road of a great caravan a sandstorm buried years ago: wagons, beasts and cargo half-sunk in the dunes.
- **THE SUN (the mechanic).** Open sand is sunlight; standing in it builds SUNSTROKE (a meter: the view swims, then health
  goes). SHADE resets it: awnings, cliff overhangs, wagon-wreck shadows, and in places the moving shadows of vultures
  overhead. Every screen asks "where is the next shade?". Name it SUNSTROKE, not heat (the pyro already has P.heat).
- **Hazards.** QUICKSAND (sinks you slowly; escape by jumping repeatedly - survivable, NOT deadly water), SANDFALLS (loose
  sand pouring off ledges that pushes you down), a SANDSTORM act (the screen hazes, gusts push you - the existing wind).
- **Platforming.** Dune slopes and SLIDING (hold down on a slope: fast slide, jump off the end for a long leap), climbing
  the buried wagons, swinging on caravan ropes (existing swings).
- **Enemies.** Scorpions (claw `!`, sting red ✕), diving vultures, sand goblins that burrow out of the dunes, bandits
  looting the wrecks. GARRISON row + no blanket calm, ELITES row, 3.5-4.5 foes/screen, a prop worked every ~3 screens.
- **Acts** (suggested): the caravan road (learn the sun and shade) -> the dune sea (slopes, slides, quicksand, vultures) ->
  the sandstorm (gusts, low visibility, sandfalls) -> the worm's hollow (boss).

## THE DUNE WORM (boss; no mini)
A great worm that hunts you under the sand, shown by a RIPPLE racing at you along the surface. Arena: the dug-out heart of
the buried caravan - sand floor, wagon wrecks standing in it, shade and sun patches.
- **THE RIPPLE (tell)** — the sand bulges and runs at where you are; it tracks, then commits.
- **BREACH** red ✕ — it bursts up under the end of the ripple in a column: jump aside / off the sand.
- **SAND SPRAY** `!` — surfaced, it sprays a fan of grit: block or put a wreck between you.
- **LUNGE AND DIVE** red ✕ — an arc out of the sand and back in across the arena: the shadow shows the landing.
- **THE SWALLOW** red ✕ — a sinkhole under you that drags you toward its mouth: jump out repeatedly (the quicksand verb).
- **THE OPENING (player-made):** bait its breach into a WAGON WRECK - stand in front of a wreck, dodge late, and it bursts up
  into the timbers and sticks, head out, ~3 s, double damage. A breach in open sand opens NOTHING (tools/boss-openings.mjs).
- **PHASE 2 (<50%)**: two ripples, one a decoy; the sandstorm comes in (gusts, haze); each wreck it sticks in is smashed and
  gone - fewer places to make the opening. The sun keeps working in the arena: fight in the shade when you can.
- Touch rule, one clear answer per attack, new baker, pilot >= 21 runs at normal health.

## Build order (probably two sessions: level, then boss)
`tools/sunken-caravan.mjs` first, in check.mjs; numbers (shape.mjs); sunstroke + shade; hazards; the worm + opening + pilot;
ONE `npm run check`, commit, push, deploy, verify.
