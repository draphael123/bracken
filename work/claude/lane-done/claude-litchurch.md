# claude/litchurch - THE LIT CHURCH + THE PALADIN, the Opus greybox (2026-10-08)

Base: claude/batch79 11c4b577. Concept: `.claude/briefs/the-lit-church-concept.md` (Daniel 10-01, now committed, with the 10-07 settled lines appended: cruciform
order, organ gallery KEPT, Archdeacon KEPT, reliquary = silver + shortcut, Paladin = B11 duelist with a light bar, the Towpath fork, THE CRUSADER, 800 coins).
Rules followed: scratch/common-1008.md (+ common-1006-night, design-standard A1-A12/A10 amended/A10b/B1-B14, brief-levelsweep v2). Greybox art only.

## What it is
`church`, THE LIT CHURCH, an OPTIONAL class spur (`classFor: 'paladin'`, `opensOn: { level: 'waymeet', medal: 'bronze' }`, `needs: 'waymeet'`), APPENDED to LEVELS,
map node (12,138) on the inland sheet, `spur: true`. Clearing it sells THE PALADIN hero for 800 coins (`coinPrice: 800, coinNeeds: 'church'`).
**FORK HOOK for the integrator** (src/lit-church.js `FORK`): when claude/towpath lands, `needs` and `opensOn.level` become `'towpath'` (the fork is the Towpath's
first screen, its lychgate: hill path to the church / river path to the canal) and the map node moves up the Towpath's hill. Nothing else reads it.

THE RULE (the LEVELS line, asserted equal to src/lit-church.js's header): "LIGHT IS THE CLERGY'S: A LIT ROOM MAKES THE PRIESTS STRONG, A DARK ONE LETS THE DEAD UP.
CARRY A FLAME TO LIGHT A LAMP; A BLOW SNUFFS IT."
- Every ROOM (13) is LIT while a lamp in it burns, DARK when all are out (drawn: the room's dark, its name + LIT/DARK on entry; the bed adds a low choir in the dark).
- THE FLAME: E at a fire (brazier, votive stand, vigil candle, any lit lamp) -> a taper, 14 s, drawn shrinking; a blow that lands puts it out. E at a dark lamp lights it.
- SNUFF: a blade through a lit lamp. LIT: a priest's blows x1.3, his prayer x1.5, the dead burn. DARK: priests x0.7 / prayer x0.5, the dead hit x1.8 and come up
  through the room's GRATES (told: the grate glows cold 1 s first; 3 at most). Priests walk to a snuffed lamp and RE-LIGHT it (1.5 s rite; a blow cuts it, and he
  waits 2.5 s); THE ACOLYTE runs for it and lights it in 0.6 s (catch him).
- THE ORGAN: STRIKE a BELLOWS -> its pipe breathes 2.8 s (a lift column); E at the KEY DESK -> told chord (0.55 s, dust gathers) then a 2.6 s gust WEST.
- THE CRYPT: sealed by the SEAL LAMP's light (snuff it: the hatch opens). LAMP THREE cracks the crossing's crypt grate (the only way up) and arms THE DARK RISES.

## The cross (src/lit-church.js, 290 x 60; hands src/lit-church-hands.js; route 574 tiles)
1. GRAVEYARD + WEST DOOR (TEACH): the brazier, the porch lamp opens the west door; the open grave's wight in the dark.
2. NARTHEX + NAVE (TEST): a priest by a lit lamp over a grate (snuff lesson); pews, triforium (crossbow), the pulpit priest, two lamp encounters with knights + acolyte.
3. CROSSING + NORTH TRANSEPT (TEST): two-row piers up to LAMP ONE (votive stand, priest pair, knight, acolyte); THE BELLOWS (required) up through the gallery floor.
4. ORGAN GALLERY (REMIX, dark until lamp two): pipe ranks (2-row stairs), a pipe bellows to a stub + silver, THE BROKEN LOFT (9 cols, required chord gust, a haunt at
   the jump), LAMP TWO at the console.
5. WEST TOWER: THE SEAL LAMP (required snuff) -> drop -> the crypt hatch.
6. CRYPT (REMIX): ossuary shelves, a bone pit, corpse candles, THE SEALED VAULT (the one ambush: husk THORNED + wight, haunt, bone archer; silver on its top shelf),
   the altar: vigil candle + LAMP THREE.
7. THE DARK RISES (SET PIECE): up the crypt well's 7 two-row landings; the dark climbs 24 px/s, bites 6%/0.6 s, takes your flame, raises haunts; a lit sconce just over
   it HOLDS it 5 s (and is a fresh flame) but wakes the clergy on that landing. Out on the crossing: the nave goes dark behind you. The rood screen's third sconce wants
   the carried flame (sconces 1/2 light from their chapel lamps).
8. SOUTH TRANSEPT (EXAM): THE ARCHDEACON (elite, WARDING; room-wide prayer in the light) on his dais, the high lamp up a bellows, the templar on THE CHARNEL PIT's lip
   (2 wide, a real death, told by a sign), grates. His gate holds the sanctuary. THE RELIQUARY (5 candle stubs: a silver + THE SACRISTY DOOR, a shortcut from the
   crypt altar room to the exam that skips the well).
9. THE SANCTUARY: THE PALADIN.
Checkpoints: 4 (157,30 / 82,18 / 145,53 / 238,40): one per 144 route tiles; checkpoint-gaps green.

## THE PALADIN (src/paladin-boss.js pure fight + bot plan pbPlan; src/paladin-boss-hands.js) - id `paladinboss`
B11 DUELIST, FULL_DAMAGE (no chip; greed counted). His AEGIS turns a frontal blow at his height while he guards (walk/recover) - CLANK, "HIS AEGIS: GO ROUND" - and
FEEDS his LIGHT (+13). Behind / from a jump / in his tells, swings, mend, kindle: lands whole and DRAINS it (-10, heavy -17). A shield that turns his hammer or bash
dims him (-6); one answered ON THE BEAT is a RIPOSTE (-12, he reels 0.8 s). THE LIGHT BAR is drawn over him (gold tick up when fed, red notch when drained).
Lamps: his regen is 2.6/s per lit sanctuary lamp; snuffing one (a blade, in the open) dims him -14; with two dark he KINDLES one (told, 1.4 s, a blow cuts it; 7 s cd).
STARVED (bar 0) he FALTERS 3.0 s on one knee (gold ring + timer, x1.8, cap 13%/falter, B4 still), then a told 3 s WARD (light back to 65).
P1 THE OATH: HAMMER CHAIN (! 2-3 blows), AEGIS BASH (! a shield takes it - the concept's shield bash), MEND (no mark, gold glow + word; cut = light stays spent).
P2 (60%) NEW: RADIANCE (!! a red cross + column for EACH LAMP STILL BURNING). P3 (30%) NEW: JUDGEMENT (!! hammer leap to your ring; the floor burns 2.6 s).
Hp 3200; dmg chain 24 / bash 36 / rad 40 / leap 46 / holy 8. Theme 'paladin' (+ :p2 :p3) composed in code; level bed 'litchurch' composed (organ + plainchant).

## Waymeet's boss is THE CRUSADER
`closedhelm`'s bestiary name, BEAST_SHORT, the boss plates ("THE CRUSADER  THE WARD IS DOWN" / "HIS OATH") and the boss rush (reads the card) - names only.

## Numbers
- **Boss** (`boss-rates.mjs church --ways=practiced --profile=human+dry`, L22, n=36): **knight 3/12, warden 6/12, pyro 12/12 = 58%, in band, no hero at 0**;
  fights ~92 s mean. (6-seed passes on the way: 50%, 60%, 56% (knight 0/6 -> fixed by the blockable bash + riposte), 67%, 61%...)
- **Mash boss**: 0/6 (dead in 34-55 s, he keeps 86-96%). **Mash level** (stamped, level then boss): every hero dies - knight 2 deaths, warden 2, pyro 3 (the sealed vault holds it).
- **Level-1 pilot**: 16 blows, 9 deaths over 3 runs; **curve** act 4: 486%/run, 11 deaths in 3 runs (band 120-600%, 1-12).
- **Route pilot** (`tools/lit-church-route.mjs`, real keys, god, no foes): **all seven heroes walk the whole route, 0 lifts** (flame, porch, piers, lamp one, bellows,
  pipes, chord jump, lamp two, seal, hatch, crypt, lamp three, the well relay, rood sconce, charnel pit, sanctuary door).
- **Walker** (`level-walk.mjs church`, L22 typical build; measured before the vault ambush fix that now kills the mash bot): 0 deaths, arrivals 46-80%, measured 28-52% of the route - STUCK points are the walker's hands at the
  piers/transept (160-164,28) and the well (163,39), not holes (the route pilot walks them). Target 1-2 deaths missed: see Q4.
- **Archdeacon** (elite-lab): mash 0/3, human 4/6 (67%), 11 s.
- **level-quality**: church CLEARS THE BAR and is in GATE (flat 0%, bands 10, 6 gadget kinds / 4 developed, secrets 2, checks 1/144, roles 5, ranged 13, ruleFight 11/11).

## Shared-tool changes (small, each says why)
- src/reachcore.js: `L.reachDoors` (doors a level's rule opens stand open in the full fill) and `L.reachVents` (a column of air the level's hands raise).
- tools/pacing.mjs: `L.reachGusts` (a verb-blown gust) and `L.routeVia` (the route walked leg by leg through the places the rule sends you, in order - stacked rooms).
- tools/level-walk.mjs: no far skip-ahead on a level with `routeVia` (it revisits its own columns).
- tools/dangling-paths.mjs: its "tools/lit-church.mjs not built yet" line removed (it is built). tools/boss-rows.mjs: + 'church'.

## Checks run (green)
lit-church (new, 323 asserts, in check.mjs), level-quality (gated), checkpoints, checkpoint-gaps, architecture, skins, signs, one-new-foe (church = [acolyte]),
sprinkle-cap, map-grammar, homepaths, comments, audio-assets, boss-music, threat-holes, answer-tags, goblin-lint (church in FIXED), boss-greed, tells (regenerated),
hint-shown (source + page; 2 PALADIN flavour lines left the silent list), elites (church ok), boss-fight-end (56 fights), boss-openings, stuck (static + runtime),
corpses, npc-removal, mash-gate, curve-gate, the route pilot (7 heroes).
**Red, not mine (pre-existing on 11c4b577, verified on a base build):** dangling-paths (src/jenny-greenteeth*.js citations), level-quality canal pilot stale (canal's
hash is the same on base), slopes-trace canal (identical diff on base), elites ksar, map-spacing fair/burial/witchlight notes.
**Not run:** the 40-minute suite. NOTE: one base-comparison slopes-trace ran on PORT 8737 from a throwaway worktree of 11c4b577 (removed) - the only run off 8734.

## Music (listed only: NOTHING downloaded; licences read on each page today)
1. (REC, level) "Cathedral" by Umplix - CC0. https://opengameart.org/content/cathedral-0 (organ + choir, calm, emotional)
2. (REC, boss) "Church combat" by Centurion_of_war - CC-BY 4.0 (credit). https://opengameart.org/content/church-combat (church organ, boss, upbeat, holy)
3. (alt, crypt/level) "Dark Shrine Loop" by qubodup - CC0. https://opengameart.org/content/dark-shrine-loop (cathedral, dark, calm loop)

## UNVERIFIED
- No Daniel playtest: THE PALADIN is a new boss (B9 gate). No human eye on the greybox in play; every number is a bot's.
- The bot does the riposte only as its block happens to land on the beat; the pyro wins 12/12 (same spread as the Ksar's Hawk-Mistress).
- The dark-rising set piece is proven in the fake-world test and the route pilot (god); not with foes by a human-speed bot.
- All cast art is recolours (priest/archdeacon = the bandit mystic's sheet; acolyte = Waymeet's runner; knights/crossbow = Waymeet's). The Paladin is drawn as shapes.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **THE PYRO wins 12/12** (k 3/12, w 6/12; overall 58%). Rec: keep, judge in your playtest. Alt: a P3 answer to range.
2. **The bash is blockable (!)** - the concept's "shield bash (!)"; with it unblockable the knight went 0/6. Rec: keep.
3. **A turned hammer dims his light; one answered on the beat is a RIPOSTE (he reels)** - the concept's "bait, riposte". Rec: keep.
4. **The walker reads the level as soft at L22 with skills (0 deaths, arrive 46-80%)** while the mash bot drops to 4-17% and the level-1 pilot dies 9 times. Rec: your
   playtest first; then a step on the foes (LEVEL_DMG is 1.5 already). Alt: more grate dead / a second exam foe.
5. **Checkpoint retreads**: a death in the vault/ossuary goes back to the gallery checkpoint (~150 route tiles: tower, drop, hatch, crypt); a death in the exam goes
   back to the crypt altar (re-climb the well - the dark does not rise again once you got out). Rec: keep (A10b spacing). Alt: a shrine at the hatch foot (56,53).
6. **Opens on a bronze medal at Waymeet** (class spurs use opensOn); becomes the Towpath's fork when it lands. Rec: bronze. Alt: cleared only.
7. **The reliquary's shortcut** is the sacristy door: crypt altar room <-> south transept (skips the well after a death at checkpoint three). Rec: keep.
8. **Any swing snuffs a lamp it passes through** (also the sanctuary's - the rule's verb). Rec: keep (it is the snuff). Alt: only a downward strike snuffs.
9. **The exam asks no verb of its own** (fight the Archdeacon; snuff/bellows/grates optional there). Rec: keep for the greybox; the review lane may make the high lamp
   matter for his gate.
10. **The charnel pit is 2 wide** (every hero clears it; the templar's shove makes it the risk). Rec: keep.
11. **The concept's "priests re-light the arena lamps in P2"** is not built (no adds, your 10-07 preference) - he KINDLES them himself. Rec: keep.
12. **Music**: pick from the three above (rec "Cathedral" + "Church combat"). The bed and his theme stay composed in code until you do.

# claude/litchurch - THE PALADIN TUNE (2026-10-08, Opus; Daniel: "even it out before he plays it")
Built on 96dd8c5a. Measured: `PORT=8734 BOT_PROFILE=human+dry node tools/boss-rates.mjs church --ways=practiced --profile=human+dry --seeds=12` (L22, dry, 12 seeds a hero).
Helper (not a check): work/claude/paladintune/pb-diag.mjs prints his counts (S.n), the damage each of his moves did, and the hero's state the frame before each hit.

## Rates
| | knight | warden | pyro | overall |
|---|---|---|---|---|
| before (greybox+art, re-measured, 6 seeds) | 3/6 | 3/6 | 6/6 | 67% |
| after (12 seeds) | **7/12 (58%)** | **5/12 (42%)** | **8/12 (67%)** | **56%, in band** |
Fight lengths (mean): wins knight 91 s, warden 128 s, pyro 108 s; deaths 69-92 s. **Mash boss 0/6** (re-stamped, boss row only: dead in 34-37 s, he keeps 87-96%).

## Why the pyro was free (fixed)
Her staff's BURN TICKS (2 dmg each, 0.3 s, no blow behind them) went through his `take` as if they were blows. From behind / in his tells, 21-40 ticks a fight
LANDED and each drained his light by a full blow's 10 (another 47-50 paid x1.8 in his falters). She starved him without swinging. Now:
- `burnOn` (src/paladin-boss.js) - a burn tick NEVER touches his light (no feed, no drain); whole outside his ward (B15), **x1 (was x1.8)** inside the falter's cap, 0 in his ward.
- **His returning light puts the fire out**: the ward after a falter sets `e.burn = 0`.
- src/main.js (3 small lines): `BURN_TICK` is raised round the burn tick's `wardedDamage` call and handed to the Paladin's hands (`ctx.burnTick`), so the firedrop and other no-blow hits stay blows.

## Why the knight struggled (fixed)
pb-diag: 12 of his 21 hits landed while he was AIRBORNE (the knight's reach 22 leaves "jump his aegis" as his only safe way in, and he cannot shield in the air), and the
shield's own answer paid almost nothing (a blocked bash: -6 light, nothing else; a riposte only on a perfect guard). Now:
- **A BASH TAKEN ON A SHIELD (or a deflect) REBOUNDS HIM**: `reboundT` **0.6 s** in 'reel' (committed: blows land), told "HIS BASH ON YOUR SHIELD: HE REBOUNDS" / "THE BASH REBOUNDS"
  (both added to src/hint-lines.js). The concept's shield bash, answered by the shield - a window a roll does not make.
- Light: `turned` **6 -> 8** (a hammer/bash turned plainly), `riposte` **12 -> 16** (on the beat). `reelT` unchanged at 0.8 (tried 1.2: worse - the bot was still mid-swing when he came back).
- **B15 (Daniel 10-08) on his aegis**: a blow his aegis turns now bites at **`aegisTake` 0.4** (was 0) - still clanks, still says HIS AEGIS, still FEEDS his light (+13). Hammering the front for a minute still never opens him (asserted).
- The bot (pbPlan, the boss's own human bot): a SHIELD hero now BAITS him most cycles (`PLAN.bait` **0.6**: stand just off his maul, guard up) instead of always jumping the aegis,
  and walks in on a reel ("in on his reel") instead of only swinging if already in reach. Pyro/warden reads are unchanged.
Unchanged: hp 3200, every damage number, tells, timings, falter 3.0 s x1.8 cap 13%, ward 3 s, P2 radiance, P3 judgement, kindle, lamps, all poses (lit-church-aloft green).

## Checks (PORT 8734 only), green
lit-church (330: the aegis assert now reads B15's 0.4 and still feeds - a deliberate design change; new asserts for the burn tick, the rebound and the riposte), lit-church-aloft,
boss-read, tells, boss-greed, mash-bot (church --arena-only --write: boss row only). Not run: the 40-minute suite. Nothing killed but my own tools' own children.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **B15 on his aegis**: a frontal blow on his guard now lands at 0.4 (and still feeds his light). Rec: keep (your 10-08 floor). Alt: 0.25 if the front feels too profitable in your playtest.
2. **A shield-taken bash rebounds him 0.6 s** (only shields/deflects; a roll does not). Rec: keep - it is the knight's (and the hero Paladin's) window. Alt: perfect-guard only.
3. **His returning light snuffs a fire on him**, and burn pays x1 in a falter. Rec: keep. Alt: leave the fire burning through the ward.
4. **Warden at 5/12 (42%)** - inside 40-70 but the low one. Rec: judge in your playtest. Alt: the warden's deflect counts as "on the beat" for the riposte.
5. **Your playtest gate (B9)** - he is new; every number above is a bot's.
