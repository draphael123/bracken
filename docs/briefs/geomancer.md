# THE GEOMANCER — a brief (a third starter hero)

**Status: APPROVED by Daniel, 2026-09-23; BEING BUILT 2026-09-24 on `claude/geomancer` (lane M).** She is a
**STARTER CLASS: free from the start, like the Knight and the Warden** (Daniel's decision, 2026-09-24 - see Open, below).
She is built on the batch-6 systems (two ability slots, src/hero-poses.js); the passives are defined so that either the
equip-a-passive loadout of today or the unlock-by-level system another lane is building can carry them.

## The one idea
The Knight **absorbs** a blow. The Warden **turns** it at range. The Geomancer **builds something in its way**, then
uses what she built: as a platform, as a weapon, as a trap. Magic that changes the level itself, which is what a
platformer's magic should be. She also opens routes the other heroes cannot take, so levels may hide Geomancer-only
shortcuts (never required: B4).

## Stats and the one rule
- **95 health**, slightly slower on foot than the other starters, heavy blows.
- **At most 3 stone pieces** (walls, steps, arches) exist at once; a fourth crumbles the oldest. Every piece crumbles on
  its own after ~4 s. Without this cap she walls off the level. (UPHEAVAL's pillar is not under the cap: it shatters in
  under half a second - see the rework below.)

## The weapon: THE STAVE (not the Pyromancer's staff)
Daniel wanted a staff, made unmistakably hers. The difference is shape, grip and USE:
- **Short, thick, two-handed:** a raw standing stone lashed to the head (wider than her own head), an iron-shod butt.
- **Held across her body like a quarterstaff**, both ends used. (The Pyromancer holds hers upright, one-handed, like a wand.)
- **Magic comes out of the GROUND, not the tip:** every pillar, wall and quake starts with the **butt struck into the
  earth** — a thud and a dust ring. The Pyromancer *points*; the Geomancer *strikes the ground*. This is her silhouette.
- **She plants it and it stands upright by itself:** her cast pose, and where the Quake radiates from.
- Palette: grey stone, moss green, faint amber runes in the stone. Sound: thud, crack, grinding stone.

## Base moves
| input | move | |
|---|---|---|
| X x3 | **stave combo** | head-strike, butt-jab, a full quarterstaff SPIN. The third **shatters any stone piece it hits**, spraying shards forward — her "finish the combo HERE" decision |
| UP+X | **Spur** | a stone spike juts up in front of her (anti-air) |
| hold X | **UPHEAVAL** | **the charge sets the distance** (rework, 2026-09-24): let go at once and a STONE SPIKE juts up at her front foot and hits whatever is touching her (it writes no rock, so it can never trap her); hold, and the eruption point walks out to ~132 px (twice the old 66) with a mark on the floor where it will come up (C1). The pillar LAUNCHES whatever stands there and SHATTERS ~0.4 s later - a crack frame, then a burst of shards. It is a blow, not a platform |
| tap C | **RAISE WALL** (her defence) | a wall rises in front of her: stops projectiles and YELLOW blows. Raised as a blow lands = the attacker's weapon bounces off and it staggers (her perfect guard). RED blows smash through it: red still means move |
| plunge | **STONEFALL** | lands like a boulder: a short shockwave that knocks down grounded foes |
| X in a dash | **ROLLING STONE** | kicks a small boulder forward that bowls through little foes |
| meter **TREMOR** | fills from walls that stop blows and pillars that launch foes | full, tap C on the ground: **THE QUAKE** — the floor heaves, every grounded foe is knocked down, loose rock falls, each told by a shadow (C1/C3) |

## Abilities (bought; the same ladder and PRICE_AT table as the Knight and Warden)
| lv | ability | |
|---|---|---|
| 1 | **STONE STEP** | a pillar under her own feet: an extra jump from mid-air (platforming + escape) |
| 3 | **BOULDER** | a big boulder rolls along the floor, bounces off walls, bowls foes over |
| 5 | **SPIKE ROW** | a row of spikes erupts ahead: hits and briefly roots |
| 7 | **ARCHWAY** | a stone bridge across a gap for ~6 s; shelter from falling things beneath it |
| 9 | **LODESTONE** | a magnetic stone that pulls armoured foes and thrown weapons toward it (into a pillar, into each other) |
| 12 | **ENTOMB** | seals a foe in stone ~3 s; hits on the tomb crack it for bonus damage. Bosses: a short open window instead |
| 14 | **FAULT LINE** | a crack runs along the floor and the ground each side lurches, launching foes |
| 17 | **GOLEM** | a small stone golem fights beside her for 10 s |
| 20 | **AVALANCHE** (capstone) | boulders rain across the room, each with a warning shadow |

## Passives (arrive with hero level, per Daniel's levelling decision) — three branches
- **EARTH (the pillars):** 4 pieces instead of 3; her step and arch last longer (BEDROCK no longer keeps a pillar: it is a blow); pillars rise taller; a launched foe lands harder.
- **WALL (the defence):** a perfect wall throws arrows back; a cracked wall bursts into shrapnel; a wall takes one red
  blow's full force without breaking.
- **TREMOR (the meter):** fills faster; the Quake reaches further; Stonefall's knockdown lasts longer.

## Rules she must satisfy when built
- Every ability has a POSE of its own (the check lane E adds), and ~120 frames to match the other starters.
- Every stone piece is legible: rising pieces are told, crumbling pieces visibly crack first (C1).
- A12 / level geometry: pillars and walls must never trap her or a foe inside rock, never block a route permanently,
  and the 3-piece cap + 4 s crumble hold in every level. A check asserts both.
- Balance: each ability against the Knight's and Warden's at the same level (skill-balance-probe), and a full level
  + boss pilot pass like every hero gets.
- The Editor and Boss Rush are parked: do not add her to either.

## THE REWORK (Daniel played her; all four items approved 2026-09-24, lane geo2)
### 1. UPHEAVAL: the charge sets the distance, and close foes are hittable
- Was: `upheavalX() = 26 + 40*wound` px ahead, and a release under 55% of the wind did nothing - so even the quickest
  heavy landed a body-length away and a foe touching her was never hit; the pillar then stood ~4 s as a platform.
- Now (`GEO.wind/reach0/reachK/spikeUpTo/pillarLife` in src/geomancer.js): her wind is 0.5 s (the others' 0.32) and ANY
  release past the first beat fires. Inside the first 15% of it, a SPIKE at her front foot (hits what is in contact, pops
  the light ones up, writes no rock). Past that, a pillar at `12 + 120*wound` px (full: 132), with the old "finds its
  footing under a foe within a hand of the aim" kept. The marker on the floor while she winds is the same answer the
  blow uses (`upheavalAim`), spike or pillar.
- The pillar shatters `GEO.pillarLife` = 0.42 s after it erupts (0.12 rising, a crack for the last 0.16, then a burst
  of shards). It takes no place under THE CAP and never lifts HER.
- **What it cost:** nothing in the levels - no level has a Geomancer-only shortcut yet (the "Open" question below was
  never acted on), and no check stood on a pillar. STONE STEP and ARCHWAY are separate pieces and keep their lifetimes.
  Her yard's UPHEAVAL station (tools/hero-trials.mjs) held X to a full wind and now holds it for the 60 px it needs.
- Proved: `tools/geomancer.mjs` `heavy` - a foe at contact is hit by the minimal charge, a full charge reaches >= 120 px,
  the pillar is gone within 0.5 s. RED on the old code (hurt 0, 64 px, still standing after 2.5 s).

## Open (decide when she is built, not now)
- Her name and look beyond the stave. (Built as THE GEOMANCER: a moss-green hood and mantle over grey stone-cloth.)
- ~~Whether she is a starter (free) or a cheap early unlock.~~ **DECIDED (Daniel, 2026-09-24): a STARTER - free from the
  start like the Knight and the Warden**, on the hero pick with them and always offered to player two in co-op.
- Whether ARCHWAY/STONE STEP open "Geomancer-only" optional routes, and how many.
