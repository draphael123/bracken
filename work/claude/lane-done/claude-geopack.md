# GEOPACK lane report (claude/geopack = claude/stonewall + claude/ltfork) - 11-05, code only, nothing merged or deployed

## What was built
New files: src/tech-geomancer.js (GEO_TECH, GEO_UPGRADES, GEO_PAR), src/geo-tech.js (all effects, makeGeoTech built inside makeGeomancer), tools/geo-tech.mjs (node-only). Registered in src/progression.js (one import, one TECHNIQUES row, one UPGRADES row). Hooks: src/geomancer.js (crumble/recall/update/draw/clear/ultimate/upgrades), src/main.js (api.tech/api.upg, ultRegister, three C-chord branches, foe slow clock, MOVE_WORDS, LIGHT STONE, EMPOWERED+, GEODE flag).
Her resource is the BOARD (standing stones) since claude/geoid; the TREMOR bar the brief gates on is gone, so the gates were re-read as stones. Every blow = swordDmg x k (dmg(k,'geoTech')), no flat damage, bosses never staggered or pinned (damage, or an OPEN via e.disarmOpenT), one hit-stop per cast, FX use Math.random on particles only. Cooldowns live on P (geoSlingAt, geoStepAt, geoWellAt, geoCapAt).

| L | tech | input | k | cd / cost | what |
|---|---|---|---|---|---|
| 25 | SLINGSTONE (fixed) | UP+C, board not full | 1.3 | 3 s / 20 st | low lob ~140 px, pierces one foe (hits two), stone grind on the lift, flat crack on impact |
| 30 A | TOPPLE (offence) | stone fist (3rd cut) on a pillar | 0.9 per foe | 0 / the stone | slab falls away from her along the floor; first common foe held 1.0 s; boss damage only |
| 30 B | STONE STEP (mobility) | UP+C beside a pillar | none | 2 s / 10 st | pillar grows 2 cells (max 4 tall), she rises onto the top; refused with no room |
| 35 | SEISMIC WELL (fixed) | DOWN+C with NO stone up | 0.6 pop | 14 s / 0 | r 45 sump 1.2 s: commons slowed x0.45 and drawn in, boss slowed x0.8 (never in a windup) and never pulled, pop knocks commons down |
| 40 A | SHATTER RECALL (defence) | tap DOWN with a foe within 64 px | 0.45, max 2 bursts/foe | recall cd | stones burst on arrival (spent); nothing near = re-plant as before |
| 40 B | CAIRN (control) | a foe breaks a stone (gnaw/ram) | 0.4, max 2/foe | 0 | 3 gravel mines, 14 s, burst when a foe walks over |
| 45 | GEODE (fixed) | hold X to the auto-pillar (T3 + 0.8 s) | 2.0 | 0 extra (the pillar's own 38) | the pillar's first foe is crystallised, bursts 1.5 s later; a boss is not encased, it is OPENED UP 1.5 s |
| 50 A | THE GREAT FAULT (wave) | UP+C at a full board | 0.8 x3 = 2.4 | 40 s | 3 waves 0.7 s apart across the screen (band +-70 px), each raises a 3-wide ONEWAY shelf 3 cells up (6 s, not one of the 3 stones, tell dashes drawn first); boss OPENED UP 1.2 s on wave 3 |
| 50 B | THE STONE HOST (host) | UP+C at a full board | 0.2 x 12 hits max/foe = 2.4 | 40 s | every standing stone wakes as a golem 10 s, charges the nearest foe (110 px/s, a hit per 1.25 s, 0.25 s flinch on commons only) |

Capstones replace MOUNTAIN COLLAPSE on the same chord once picked (the base stays for a player who defers the capstone). Both spend the board; one 40 s clock on P.

Forks: roles 30 offence/mobility, 40 defence/control, 50 wave/host; trade lines CRUSH OR CLIMB / BURST OR MINES / FAULT OR HOST; both L50 carry capstone:true. L40 A is NOT the retired crouch Stone Skin (Daniel 11-04 11:24): it is the bigger recall. Parity (GEO_PAR, asserted): L40 0.1125 vs 0.114 dps-units, L50 0.06 vs 0.06 (single foe: 3x16 = 12x4 damage at sword 20). L30 B deals no damage (mobility) so nothing to compare.

## Upgrades: 9 ship (minimum 8)
EMPOWERED+ (I window 4 s; II +8% empowered blows), SHARDS+ (I two shards, II three + pierce), FAULT LINE+ (I RIFT and spike launch 25% higher, II fault line 40% longer), LIGHT STONE (I rising pillar -8 st, II wall -8 st), BOULDER+ (+1 bounce per rank), GOLEM+ (I 12 s, II +30% hit), ENTOMB+ (I breaks on the 2nd blow, II blows land 1.7x not 1.5x), QUARRY (fist plants a knee stone 0.8 s / 1.6 s sooner: refills the board for the capstones; the ONE feeder, shared by both), RECALL+ (I cd -0.5 s, II bowl +30%).
DROPPED from the brief: TREMOR FLOW (no TREMOR bar exists) and WIDE QUAKE (a wider collapse zone makes a foe take more than its n boulders: breaks the damage parity the avalanche was built on). No per-capstone feeder pair: upgrade cards come at L27-L49, before the L50 pick, so a feeder tied to one capstone could be a dead card; QUARRY feeds both.
Brief rewrites to fit the live kit: THE RIFT = the fault-line skill; ENTOMB II (bosses OPEN at the 2nd crack), GOLEM II (stagger) and EMPOWERED II (throw back at k 1.0) replaced by simple constants.

## Commits (pushed to origin claude/geopack)
ebd3bf0e8 geopack 1 (data + effects + hooks), b5b0a79b3 geopack 2 (tools + tech-cards + move words), plus the report commit (branch tip).

## Node results (no browser opened; check.mjs not run)
node --check main.js, geomancer.js, geo-tech.js, tech-geomancer.js, progression.js, tech-cards.mjs, geo-tech.mjs: OK. tools/tech-cards.mjs PASS (new 'geomancer kit' check), tools/progression.mjs PASS, tools/coop-progress.mjs PASS, tools/geo-tech.mjs PASS (14 checks over a fake world: sword x k per technique, boss law, caps, cooldowns, stops, capstone 40 s clock, fork cards / lock / road-to-L50, nine upgrades each change the number they name, chord else-if order scanned in main.js, no flat damage / pin / invulnerability in geo-tech.js).
Level-up card / banner / controls card: the framework is hero-agnostic (hasKit / TECHNIQUES); no 'knight' literal skipped the geomancer. The controls card lists only the ultimate row (ULT_NAMES stays MOUNTAIN COLLAPSE); UP+C sling / step and DOWN+C well are taught by the banner / teach text only (owed: a controls-card row per picked technique). tools/keys.mjs is the level key/gate tool, not input keys, so the no-conflict assert lives in tools/geo-tech.mjs (source scan of the chord else-if order).

## Browser owed (not run)
tools/geo-board.mjs, tools/geomancer.mjs (the pre-existing suites: confirm avalanche / recall / stave unchanged with every tech() false), tools/textfit (new names, what / teach lines, trade lines, the ROAD strip), tools/hint-shown.mjs (new MOVE_WORDS), popclutter on the fault / host casts, a LOOK at every tell (sling arc, slab, well sump, gravel, crystal, fault fronts + shelf tells, host golems), a real-input play of UP+C (sling / step / ultimate / ward must not collide), DOWN+C well vs detonate, topple on the third cut (P.lastSwingT assumed set, as the wall-burst code does), co-op (the tech id list is not in the hero snapshot yet, same gap as kfork).
Not built: capstone preview clip, yard TRY station, AI companion path (they never read tech(); lab bots do not use sling / step / well / capstones, so bot tune numbers are unchanged), ability-law.mjs (absent on this branch), new SFX files (reuses geoRise / geoThud / geoCrumble / geoQuake / geoBlast / geoShard and the cutStage chime for the geode).

## Art owed
Dedicated sprites for the slung stone, topple slab, well sump, crystal, fault fronts and shelf tell, host golems (flat-colour primitives in the house stone palette now; the host reuses the golem silhouette); poses reuse gHeave / gStep / gAval, so a TOPPLE and a SLING pose; capstone preview art.

## Expected boss-rate impact (for the tune lanes; no win-rate run, those open browsers)
- Techniques 25-45 are small: SLINGSTONE 1.3 / 3 s, TOPPLE 0.9 per foe once, WELL 0.6 once per 14 s, GEODE 2.0 once per held pillar. A few points up for an offence build, flat for control / mobility picks.
- LARGE: a capstone pick LOWERS boss burst. MOUNTAIN COLLAPSE deals avalanche.boss 8.0 x n(3) boulders = about 24 swords to a boss (6 to commons); THE GREAT FAULT / STONE HOST deal 2.4 swords to one foe (the law) on a 40 s clock. A capstone Geomancer is about 90% weaker on the ultimate vs bosses than the base. A player can defer the capstone (the card offers an upgrade) and keep MOUNTAIN COLLAPSE, so the Admiral / Tusker rows are unchanged for those saves. The tune lane decides the direction (Q1).

## Questions (recs first; none block)
1. Collapse vs capstones. Rec: keep the capstones at the sec 4 law (2.4 swords) and have the tune lane pull MOUNTAIN COLLAPSE's boss k (8.0 x3) toward the same ceiling so a capstone is a side-grade, not a trap. Alt: lift both capstones (k 1.6 / 0.4) and accept more burst.
2. SEISMIC WELL input. Rec: DOWN+C with no stone up (with a stone it is DETONATE). Alt: hold DOWN+X.
3. TOPPLE trigger. Rec: the stone fist (3rd cut), deliberate. Alt: any X, which spends the fuel by accident.
4. GEODE trigger. Rec: the auto-pillar after the 0.8 s hold ('a T4 held 0.8 s'). Alt: a real fourth tier on the stave meter.
5. Capstone cooldown while resting. Rec: UP+C then does SLINGSTONE / the ward as usual, no cue. Alt: a RESTING word.
6. Per-capstone feeder upgrades. Rec: QUARRY serves both. Alt: two feeder slots gated to L50+ (needs a card filter).
