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
  its own after ~4 s. Without this cap she walls off the level. (Her held X, FAULT LINE, writes no stone at all: see ROUND 3.)

## The weapon: THE STAVE (not the Pyromancer's staff)
Daniel wanted a staff, made unmistakably hers. The difference is shape, grip and USE:
- **Short, thick, two-handed:** a raw standing stone lashed to the head (wider than her own head), an iron-shod butt.
- **Held across her body like a quarterstaff**, both ends used. (The Pyromancer holds hers upright, one-handed, like a wand.)
- **Magic comes out of the GROUND, not the tip:** every crack, wall and quake starts with the **butt struck into the
  earth** — a thud and a dust ring. The Pyromancer *points*; the Geomancer *strikes the ground*. This is her silhouette.
- **She plants it and it stands upright by itself:** her cast pose, and where the Quake radiates from.
- Palette: grey stone, moss green, faint amber runes in the stone. Sound: thud, crack, grinding stone.

## Base moves
| input | move | |
|---|---|---|
| X x3 | **stave combo** | head-strike, butt-jab, a full quarterstaff SPIN. The third **shatters any stone piece it hits**, spraying shards forward — her "finish the combo HERE" decision |
| UP+X | **Spur** | a stone spike juts up in front of her (anti-air) |
| hold X | **FAULT LINE** (from round 3, 2026-09-24; it replaces UPHEAVAL) | she slams the stave and a CRACK RACES ALONG THE FLOOR ahead of her, hitting everything along its length once - a LINE, not a spot. The charge sets its LENGTH (22 px at the quickest release to 160 at a full wind) and its DAMAGE (1.0x to 1.4x); a foe touching her is hit at once by the quickest. A FULL charge ends in a ROCK SPIKE that launches what it hits. It follows the floor: it stops at a gap and at a wall (never across a pit, never up through rock: A12), and the line it will take is drawn on the floor while she winds (C1). It writes no rock |
| hold C | **ROCK SHIELD** (her defence, from 2026-09-24; it was RAISE WALL) | a stone slab on her lead arm that moves with her (at guard pace). It takes TWO blows - visibly cracked after the first, broken by the second (a burst of shards). A RED blow shatters it at once, fresh or cracked: red still means move. Raised as a blow lands = PERFECT BLOCK: the weapon bounces off, the attacker staggers, and it costs the shield nothing. No wind to raise or hold, and NO refill by itself |
| DOWN+C (or C with nothing on her arm) | **THE MEND** | the only refill: the stave struck into the ground - 0.6 s, the thud at 0.3 s with a dust ring, her own pose (gMend) - and the shield is whole. A blow, a jump or a roll breaks it off |
| plunge | **STONEFALL** | lands like a boulder: a short shockwave that knocks down grounded foes |
| X in a dash | **ROLLING STONE** | kicks a small boulder forward that bowls through little foes (and X as she surfaces from a BURROW, the same) |
| dodge | **BURROW** (from 2026-09-24; it was a shoulder roll) | she sinks into the floor (invulnerable for the dodge's grace), travels a short way under it with the ground heaving over her, and bursts up ahead in a spray of rock. Passes UNDER a blow along the ground, never across a pit or gap: no floor under her leading foot and she comes up at the last solid cell. Never comes up inside rock or a foe (A12). Poses: sink, under, burst |
| meter **TREMOR** | fills from blows the shield stops (a perfect block most) and foes her stone launches | full, tap C on the ground: **THE QUAKE** — the floor heaves, every grounded foe is knocked down, loose rock falls, each told by a shadow (C1/C3) |

## Abilities (bought; the same ladder and PRICE_AT table as the Knight and Warden)
| lv | ability | |
|---|---|---|
| 1 | **STONE STEP** | a pillar under her own feet: an extra jump from mid-air (platforming + escape) |
| 3 | **BOULDER** | a big boulder rolls along the floor, bounces off walls, bowls foes over |
| 5 | **SPIKE ROW** | a row of spikes erupts ahead: hits and briefly roots |
| 7 | **ARCHWAY** | a stone bridge across a gap for ~6 s; shelter from falling things beneath it |
| 9 | **STONE WALL** (from 2026-09-24; LODESTONE is gone) | her old C, bought back: a wall of stone rises in front of her for four seconds - it stops a YELLOW blow and a shot, one raised as the blow lands bounces their weapon off, and a RED blow smashes through it. Its own pose (gWall) |
| 12 | **ENTOMB** | seals a foe in stone ~3 s; hits on the tomb crack it for bonus damage. Bosses: a short open window instead |
| 14 | **THE RIFT** (renamed in round 3: FAULT LINE is her held X now; the ability is unchanged - see ROUND 3, open question) | a crack runs along the floor and the ground each side lurches, launching foes |
| 17 | **GOLEM** | a small stone golem fights beside her for 10 s |
| 20 | **AVALANCHE** (capstone) | boulders rain across the room, each with a warning shadow |

## Passives (arrive with hero level, per Daniel's levelling decision) — three branches
- **EARTH (the stones; it was "the pillars" until round 3):** 4 pieces instead of 3 (THE FOURTH STONE); every stone piece lasts two seconds longer (BEDROCK - the pillar exception is gone with the pillar); HIGHER GROUND: her step rises a stone taller and a full FAULT LINE's spike throws higher; THROWN DOWN: a foe her stone throws into the air lands harder.
- **SHIELD (the defence; was WALL, reworded 2026-09-24):** STONEFACE - a shield raised on the beat throws an arrow back the
  way it came; SHRAPNEL - a shield that is broken or shattered bursts into shards that fly at the nearest foe; BULWARK - a
  RED blow that shatters her shield finds her at half its force (it can no longer keep the shield whole: red still means move).
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
**SUPERSEDED in round 3: UPHEAVAL is gone, and FAULT LINE is her held X (ROUND 3, 1, below).** Kept as the record of what it was.
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

### 2. A sprite that reads GEOMANCER, not a recoloured mage (and not a goblin)
- A SLATE-GREY robe and hood (src/chars.js GEO_PAL: cool, dark, so the stone on her is the lightest thing about her).
- Two RUNE-CARVED STONE PLATES on her shoulders (GEO_BODY rows 5-8): pale worked stone standing up past the line of her
  jaw like a pair of standing stones, a moss crown and an amber rune cut in each - the squarest thing at shoulder height
  in the cast.
- The standing-stone STAVE (THE STAVE, above; the polish lane's lopsided stone head kept).
- GRIT AND PEBBLES float round her while she casts: winding UPHEAVAL (rising with the wind), any of her nine, THE MEND,
  THE QUAKE (src/geomancer.js draw0).
- Every frame and pose keeps its count and timing: only the palette and the body rows changed.
- Before/after: docs/geomancer/frames-before.png / frames-after.png (every frame), docs/geomancer/look-before.png /
  look-after.png (beside the Pyromancer and the Knight at 5x, and in the first level: standing, running, winding, C held;
  `node tools/geomancer-look.mjs before|after`).

### 3. THE ROCK SHIELD replaces RAISE WALL as her guard
- src/geomancer.js `guard / shieldTakes / startMend / mendUpdate`, GEO.shield `{ hp: 2, hold: 0.2, mend: 0.6, mendAt: 0.3 }`;
  main.js damagePlayer asks it first. A tap still guards for `hold` (0.2 s), so a tap on the beat is a perfect block.
- Shots: a shot that reaches her is a blow on the shield like any other (it costs a hit); with STONEFACE one met on the beat
  is thrown back.
- **Where the old wall went: STONE WALL, level 9, in LODESTONE's place** (Daniel, 2026-09-24; she stays at nine). Same slot,
  price (240) and cooldown (7 s), 18 wind, on the ground only; `kit.stoneWall` calls `raiseWall`, and `wallTakes` still answers a
  blow on it. LODESTONE's code, pose and catalog row are gone. A save that bought LODESTONE loads owning STONE WALL in the same
  loadout slot (src/progression.js `renameSkills`, run before the save is judged - otherwise the old id would refuse the save).
- Proved: tools/geomancer.mjs `shield` - two yellow blows break it, one red breaks it fresh or cracked, a perfect block costs
  nothing, raising and holding costs no wind, ten seconds idle leave it broken, THE MEND restores it, a blow breaks the mend
  off. RED on the old code (the wall took a third yellow blow; no shield state).

### 4. HER DODGE IS BURROW
- main.js `geoBurrowStep / geoSurface` (the dodge still owns the grace, cost and cooldown: 0.3 s, 190 px/s). On the floor only
  (Daniel, 2026-09-24: keep it exactly so). Swimming, her dodge is the ordinary swimming dash; in the air she has no dodge of her
  own (no air roll), so nothing burrows; walking a ceiling (magePlayer) it is the ordinary roll. tools/geomancer.mjs `dodges`
  asserts all three (the swimming one proved red by letting the burrow start in the water).
- THROUGH FLOOR ONLY: each frame, no floor (solid or one-way) under her leading foot and she stops and comes up there.
- A12: where she comes up, rock in her body, no floor, or a living foe's box means the spot is taken; she is put at the
  nearest clear footing within 48 px, ahead first.
- Told: a burst of earth as she goes in, a dirt trail (particles) along the floor while under, no after-images, the
  hump-of-earth frame, and a spray of rock and a thud as she comes up. Poses `burrow` 0/1/2 = sink / under / burst.
- X as she surfaces (within 0.2 s, buffered from the end of the burrow) is a dash-X: the ROLLING STONE (dashCutNow).
- Proved: tools/geomancer.mjs `burrow` - toward a pit she comes up at the last solid cell on her feet; onto a foe stood
  exactly where a dodge lands her she comes up clear of it and out of rock; a blow along the ground while under does not
  land; X as she surfaces kicks the stone. RED on the old roll for the pit (she fell 84 px), the foe (she ended inside it)
  and the stone (none); the "blow passes over her" line was already true of the roll's grace.

### Decided after the rework (Daniel, 2026-09-24)
- ARROWS use up a shield hit (unless STONEFACE throws them back): kept as built.
- The pillar's SHATTER does not hurt foes: kept as built (it is a visual; the blow is the eruption).
- THE BOSS BOT uses her shield (src/lab.js runbossLab): a yellow tell within 50 px is TAPPED on the beat (DEFLECT_TAP - a
  perfect block, which costs the stone nothing), a red one or a far one is rolled as before, and with a cracked or broken
  shield, nothing winding up and the boss 110 px clear, she MENDS (DOWN+C) and stands on it. In the three pinned boss fights
  (wood / kings / spire) no blow ever cracked it, so the mend never ran there.

## ROUND 3 (Daniel played her live, 2026-09-24; every item approved by him; lane geo3)
The colour scheme is GOOD and kept. One commit per item.

### 1. HEAVY BECOMES FAULT LINE (it replaces UPHEAVAL, hold X)
- **Why:** Upheaval bet on a SPOT and the foe walked off it, so it was unreliable. FAULT LINE is a LINE: she slams the stave
  and a crack races along the floor ahead of her, hitting everything along its length (once each).
- **Numbers** (`GEO.fault` in src/geomancer.js): length `22 + 138 * wound` px (22 at the quickest release, 160 at a full
  wind); damage `1.0 + 0.4 * wound` of her blow; the crack runs at 520 px/s (160 px in 0.31 s) and its seam stays 0.35 s
  more. Her wind stays 0.5 s and any release past the first beat fires. The quickest release covers a foe touching her, and
  that foe is hit IN THE RELEASE FRAME. A FULL wind (98%+) ends in a rock SPIKE at the tip: +0.6 of her blow and a launch
  (vy -360; -440 with HIGHER GROUND) of what it hits; a boss, a flyer or a pinned thing is hit and staggered, not thrown.
- **It follows the floor (A12):** `faultPath` walks the floor under her two pixels at a time and stops at the first GAP (no
  solid or one-way floor) and the first WALL (rock one row up, at her feet' height). It never crosses a pit, never climbs a
  step, never goes up through rock. It writes no rock anywhere: the spike is drawn, not built, and gone in 0.6 s.
- **Told (C1):** while she winds, the line it will take is drawn on the floor in amber dashes, out to where it will stop,
  ending in a bar at a wall or a gap and in the spike's point at a full wind (the same `faultPath` the blow uses).
- **What went with the pillar:** UPHEAVAL, its pillar kind and its shatter, the foot spike, BEDROCK's pillar exception; the
  yard's UPHEAVAL station is now a FAULT LINE station (two straw men five tiles apart, "catch both in one", twice); the
  controls card, the hero card and the hero pick line, the yard's drill line, the trial's subtitle and the move sheet
  (tools/geomancer-shots.mjs) say FAULT LINE. EARTH is re-worded: HIGHER GROUND (her step, and the spike throws higher),
  BEDROCK (every piece), THROWN DOWN (a foe her stone throws). The branch title is THE STONES, not THE PILLARS.
- **The bought FAULT LINE (level 14) is renamed THE RIFT** so two things are not called the same; its id (`faultLine`),
  price and behaviour are unchanged, so saves keep it. OPEN for Daniel: the two are now close cousins - see the lane report.
- The lab bot (src/lab.js strike) lets go when the crack will run past the foe's near edge.
- Proved: tools/geomancer.mjs `heavy` - contact hit at once; full > quickest damage; full runs 160 px; stops at a pit
  (the foe over it untouched) and at a wall (the foe behind it untouched); three foes in a line all hit; a full charge's
  spike launches (93 px) and a 0.6 crack that runs past a foe throws nothing. RED on the UPHEAVAL code (no crack: 0 px,
  full 0 damage, [0, 0, 68] along the line, the far foe not hit).

## Open (decide when she is built, not now)
- Her name and look beyond the stave. (Built as THE GEOMANCER; the look is now THE REWORK 2, above.)
- ~~Whether she is a starter (free) or a cheap early unlock.~~ **DECIDED (Daniel, 2026-09-24): a STARTER - free from the
  start like the Knight and the Warden**, on the hero pick with them and always offered to player two in co-op.
- Whether ARCHWAY/STONE STEP open "Geomancer-only" optional routes, and how many.
