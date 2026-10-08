# REVIEW: HIGHCROWN ('crown') - read-only, CROWNREVIEW lane, 2026-10-08
Worktree bracken-crownreview (claude/crownreview off claude/batch79, ff'd to origin), port 8747 only (server PID 31600, stopped by PID). No gameplay code changed.
Level: highcrown() + highcrownWhole() src/level.js ~3036-3560 (the build is 940 x 100; every section is written in FINAL columns, see sec.4).
Evidence: scratch/review-highcrown-shots/ (30 spot pages 960x540; some spots were teleported into the hero-dead overlay, the art reads fine),
probe scripts in scratch/review-highcrown-tools/ (_cr_*.mjs; copy into tools/ to run: hop tester over the pacing route, edge-jump probe, SOLID-island lint,
mover dump, column map). Road: Ore Road -> Deep Rails -> Stormhold -> THE QUEEN'S FORGE -> THE KITCHEN GATE -> Highcrown.
Brief changes honoured: ARMOURY (Forgemaster mini) CUT -> Queen's Forge; the OPENING CRAG CLIMB is CUT outright (the Kitchen Gate starts underground and
comes up the kitchen stair); Highcrown opens inside the walls. NOTE: the Kitchen Gate concept (10-01) still says the Forgemaster STAYS here: superseded.

## 0. HEADLINE
1. No broken geometry, no soft-lock, no hero-specific stuck in the main route that real keys can reproduce. floaters/architecture/keys/crown-exam all clean. The
   walker's WALL/STUCK spots are walker-hand gaps (verified below), most of them in the sections that are being cut anyway.
2. The real weaknesses are DESIGN: (a) the level is 940 columns and ~40% of it is two unrelated "get there" stretches (the crag road + the siege lines + the
   armoury) before the castle even starts; (b) the RULE is absent from most of the middle (siege, crag, scaffolds, bakehouse, armoury have no bell or gate at
   all) and the bell is only ever the ENEMY's tool - the player breaks it, never rings it; (c) the keep is three flat 80-column corridors; (d) at campaign L12
   everything but the pits is a walkover (checkpoint arrival 93%) and THE GOBLIN QUEEN IS 18/18 for the human bot, 32-137 s (target 50-60%, 90-150 s).
3. After the two cuts the level is ~600 columns / two thirds of today's route / ~60% of the play time. Specific cut columns and joins: sec.4.

## 1. MUST-FIX (ordered)
### M1. THE ARMOURY CUT LEAVES A HARD JOIN: the pit exam runs straight into the burning yard   (sec.4 gives the columns)
Today the forge-house (cols 464-587) is the break between two pure platforming sections (scaffold pit 394-463, bakehouse yard 588-659, both "fall = death over
fire/bottomless"). Delete it and you have 3 consecutive hazard crossings with ONE checkpoint apart by 5 columns (check 465 and check 589). Fix in sec.4:
vestibule exam + keep ONE of the two checkpoints.
### M2. TABLES THAT PIN COLUMNS WILL GO STALE   (not a bug today; it will be red tomorrow)
- src/checkpoint-thin.js CHECK_DROP.crown = [[12,95],[196,63],[282,63],[326,63],[395,63],[660,63],[750,51]] names the OLD dropped checkpoints; tools/checkpoint-gaps.mjs fails a drop
  that names no checkpoint -> rerun `node tools/checkpoint-thin.mjs --write` after the cut.
- src/stuck-spots.js crown (cr-chapel zone [672,10,768,28], steps at 728/714/682/760) and tools/crown-exam.mjs (temperer 255 / 621 / 727, Captains Hall javelineer 792,
  whelp wind zone 864-870, 'pacing before the Queen') pin columns; R.winds, R.alarms (ward 321, hall 735, chapel 715, leads 880), R.tints, R.calm, R.weather/ambient,
  arena x0/x1/hole/rubble and `mini` are all FINAL-column literals. Cutting must go through ONE helper (sec.4), not hand edits.
- crown:mini row in tools/boss-rows.mjs + docs/mash-bot.json mash rows + the Forgemaster in src/boss-greed.js / marks.js / audio.js / threat.js move with the Forgemaster
  to the Forge level; remove 'crown:mini' from BOSS_ROWS (and src/main.js:3866 { lv:'crown', boss:'forgemaster', mini:true }).
### M3. THE STUCK GUIDE (A6) COVERS ONLY THE CHAPEL KEYS   (src/stuck-spots.js 110-115)
Route needs with no glint / 10 s nudge: the three ward-side key gates (brass 322 / iron 736 / bone 714: only the chapel pair is written), the bucket ride over the pit (412,41),
the hoist lift (450 -> gantry end), the bakehouse swing (629,46) and its ladders, the leads' ladders (849-855, 859-864), the winch at the keep door (670). Add one entry each
(`done` = the gate's open mark / the mover's `done`). S.
### M4. LEVEL-QUALITY RED LINES (node tools/level-quality.mjs crown)
FAIL mechanics ("11 gadget kinds, 0 in 3+ places": weight x2, bell x2, lockgate x2, winch x2, hotplate, rod, cart, swing x1 ... the quality tool counts per place) and FAIL music
("highcrown; boss room goblinroyal BORROWED: also kings"). The mechanics line is the symptom of finding C below (the gate/bell exists in 4 halls and nowhere else); the
music line needs Daniel's track pick. `secrets` passes with exactly 2 off-route silvers (445,55 pit deck; 695,13 choir loft): after the road silver (54,59) is cut it is still
2 - fragile; add one when the new start area is laid (Idea 1).
### M5. NOT A BUG, CHECKED (so nobody re-hunts them)
- FLOATING / MISPLACED: SOLID-island lint (scratch/review-highcrown-tools/_cr_geo2.mjs) finds only built things: gatehouse tower 231-241 (over the arch), ward-gate wall 321-323,
  siege bastion 185-191, barbican 79-92, keep walls 677-753, forge-house 468-585. No orphan slab, no one-way under a solid, no creature in rock (cascade 64,73 is a water prop).
  tools/floaters + architecture: "141 standing things, every one can be set down; every built piece stands on something".
- THE WARDEN'S 8 WALL-DEATHS AT x123-140 (walker, 3/3 seeds, "THE FIRE@138,69"): real keys, edge run-up, 8 tries each: siege hop pier 136 -> mantlet 139,62 knight 6/8, warden 6/8,
  pyro 6/8; mantlet 141 -> ram roof 147,63 knight 7/8, warden 8/8, pyro 7/8. The walker jumps from mid-tile; humans pass. (Whole section is cut anyway.)
- THE PIT BUCKET (swing px 412, arm 5 tiles, decks A 399-406 row 46 / B 417-424 row 46): authored centre 414.5 vs actual 412 looked like a 2.5-column offset, but decks are at 399/417, so
  its sweep (x 406.6-417.4, y 44.1-46.0 for a 3-wide platform) matches the gap exactly: low at the left (jump on at 409-410, 2.4 tiles from deck A's edge), top-right at 417.4 so you step
  OFF 2 rows down onto B. Geometry sound. I could NOT build a key-driven ride probe that boarded (my timing, _cr_bucket.mjs, is unfinished): the walker's 7 of 9 fall deaths at 405-414,101 are the
  bucket gap, i.e. the bot cannot ride. A human ride test (3 heroes) is the one open item - unmeasured, not found broken. The pit's tower decks + the 10-wide gap = the level's best "exam".
- Hop tester over the whole pacing route (253 nodes, 3 heroes, scratch/review-highcrown-tools/_cr_hops.mjs): 62 hop "failures" = 5 ladder climbs (NET: 390,49-391,53; leads 859-888), 4 mover
  rides (bucket 406->417, lift 446->452, swing 622->635), 4 walk-off drops (653,61->659,63; 844,23->850,25; 752,55->752,53 stair), the siege/pier hops above (pass with a run-up), none a true wall.
- Signs: longest 89 characters, all at their point of use; none on props, hazards or through walls.

## 2. SCORE (design-standard v2)
### Rule A1-A5 (12-pt: A1 /2, A2 /3, A3 /2, A4 /3, A5 /2)  =  8.5 / 12
| item | score | why |
|---|---|---|
| A1 sentence true to code (2) | 1.5 | "EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT" is exact for the ward (286/304 -> grate 321), hall (706/730 -> 735), chapel (730,19 -> 715), leads (879 -> 880) and the queen's hall. It describes 4 of ~11 places. |
| A2 a verb (3) | 2 | Winches (3): strike -> HOLD the gate; the hound-under-the-drop teaches it (good). Bells: the PLAYER only DENIES them (catch the sentry / break the bell). He never RINGS one except at the Queen (grate on her). The verb is half-written. |
| A3 state drawn (2) | 1.5 | Alarm gates, bell, garrison turn-out are drawn and told; the gate lifting after 20 s / clear is shown. The bell rope of the queen's grate is shown. |
| A4 teach/test/remix/exam (3) | 2 | Teach: winch (226) and bell (246) in the first 20 columns of the ward = good. Test: hall, chapel. Remix: leads (bell on a turret), banquet (chandeliers). Exam: crown-exam pins "--PPX-FF-FR" before the Queen. Gap: nothing between the ward and the keep (crag, pit, siege, armoury, bakehouse = 330 route tiles) uses the rule, and the bells are skippable. |
| A5 fights during the rule (2) | 1.5 | ruleFight 10 of 37 designed encounters; alarm garrisons are the right idea (a hall turns on you). |
### Identity A8 (18-pt, estimated from the shots)  =  13 / 18
+ own tile kit (crown masonry courses + facades: curtain, tower, chasm, burning), its own palette + wind/fire/hall/crowd ambient beds per section, towers and the keep as landmarks, 3 big only-here set pieces that are verbs (the scaffold pit: bucket + hoist + chains; the burning bakehouse yard; the banquet hall's chandeliers; the leads' spiked gutter), a real own track (music 'highcrown').
- Flat: the four keep floors and the Captains Hall / banquet are 80-column corridors of floor + banner + torch + coins (shots 23-28), the same dressing at every floor; the kitchen floor (F1: hearthgobs, braziers, barrels, "folk") is what THE KITCHEN GATE is about to be - it will read as a copy.
- Music borrowed for the boss (goblinroyal also plays in the Kings level) - quality tool FAIL.
- Roster: ~104 foes; soldier 22 + javelin 22 + heavy 12 + archer 7 + pike 2 + shield 3 = 68 (65%) are the human-garrison kit; goblins are hearthgob 10, rockgoblin 2, gobmage 1, brute 1, whelp 1 (+ Queen). Whether `soldier` is skinned goblin in the build I did not verify (the foe-less shots hide it): QUESTION below.
### Enemies A9
Mix is fine (roles 4: heavy 17, melee 91, ranged 33, runner 4; no type over 35%; ONE new type = the temperer, capped at 3). The rule-tied twists are the sentries (they run for the bell) and the temperer; nothing else touches the gate (the hound under the winch gate 236 is the one good pairing; it is cut with the gatehouse approach). Walker elite duels: heavy UNSTOPPABLE@208 won 5-23 s losing 0-12%; hearthgob BURNING@710 won 19 s; brute WARDING@838 won 8 s losing 0%: the elites are walkovers at L12.
### Difficulty v2 (campaign L12, typical build, walker 3 heroes x 3 seeds, human+first; no --write)
| hero | deaths/run | hp at checkpoints | what it was |
|---|---|---|---|
| knight | 1 / 3 / 8(wall) | 93% (arrive), lowest 81% | falls into the pit at 405-414,101 (4), fire at 603-647,67 (4) ; elites won |
| warden | 8 / 8 / 8 (wall, siege fire x138) | 93% / 72% | walker hands (above) - unmeasured past x140 |
| pyro | 6 / 2 / 3 | 85% / lowest 59% | fire in the bakehouse (x603-647) and the pit |
Targets (1-2 deaths, arrive < 50%) are MISSED at 93% / 85%: every death is a FALL, never a foe (crown: "0 foe deaths, 3-8 deaths are fire/falls"). The level is hazard-hard and foe-soft. Level mash bot (tools/mash-bot.mjs --level crown, no --write): knight 9 deaths / lowest hp 0%, warden 10, pyro 9 - the mash bot loses with every hero (A10 ok). level-quality curve ok (act 2: 307% hp lost, 4 deaths in 3 level-1 runs).
### Pacing / length  (tools/pacing.mjs: route 1192 tiles; 11 checkpoints, worst gap 129; 12 optional pockets; "fight 40 platform 35 set-piece 27 rest 8 light 46 empty 2")
Section | cols | route share | knight bot s (s2, 1 death; humans ~x1.5)
- THE ROAD (gully, shoulder, gorge, barbican, broken bridge) | 0-111 | 17% (235 of 1398 manhattan) | ~60
- THE SIEGE LINES (burning ditch) | 112-191 | 6% | 44
- castle rock, drawbridge, gatehouse | 192-241 | 4% | (in 44)
- WARD courtyard (sentry, bell, barracks, key) | 242-323 | 6% | ~51 (to the crag cp)
- CRAG WALK | 324-393 | 7% | (in 51 / 91)
- SCAFFOLD PIT (bucket, gantry, lift) | 394-463 | 9% | ~91 (194 on the seed that fell 3x)
- ARMOURY + FURNACE LINE | 464-587 | 9% | 14 (bot hands the mini off) + 75-120 real mini fight
- BAKEHOUSE YARD (fire) | 588-659 | 6% | ~18-40
- KEEP: hall, kitchens, gallery, chapel, keys | 660-761 | 22% (309) | ~150
- CAPTAINS HALL + BANQUET | 762-849 | 7% | ~60
- LEADS + QUEEN'S HALL | 850-939 | 7% | ~60 + the fight
Total ~490 s bot without the mini (8 min); a human first run ~12-16 min before the Queen. PADDING: the road + siege lines (they exist to arrive), and the keep's three 80-col floors (22% of the route, 6 consecutive F's = 48 tiles from x745, the longest uniform fight stretch in the level). Not padding: ward, pit, bakehouse, leads, banquet.
### Rewards
423 coins, 3 silvers (445,55 / 695,13 / road 54,59 - cut), 3 mends, 4 keys that open gates (A11: keys are not collectibles: "0 collectible kinds, 1 interactive"), no vault ent except the choir loft's (141,13 old). Nothing pays the hard lines (the pit's deck C silver at 445,55 is the only risk-for-reward). OPPORTUNITY: put the hall bells in the loot loop (Idea 2).

## 2b. THE GOBLIN QUEEN vs B1-B15 (BOT_PROFILE=human+dry tools/queen-pilot.mjs 240 s x 6 seeds, knight/warden/pyro, campaign L12; 18 fights)
Rates: knight 6/6, warden 6/6, pyro 6/6 = 18/18 (100%). Win times: knight 38 / 85 / 137 / 57 / 33 / 81 s, warden 32 / 47 / 53 / 66 / 108 / 55 s, pyro 56 / 87 / 45 / 60 / 100 / 72 s (median 60 s, range 32-137).
Openings per fight: pillar pins 1-3, chandelier 1-3, grate 0-2 (the grate pinned her in roughly half the fights, i.e. the level rule IS an opening - good).
| rule | verdict |
|---|---|
| B1 boss = the rule personified | PASS: the hall bell drops a grate on her (winch 909,18; sign 913), her pillars, her chandeliers. |
| B2 fighter, not a wall | PARTLY: outside gqOpen (pinned or plate off) the blow lands at x0.05 (src/boss-greed.js chip 0.05, chipBy has no gqueen entry). Told "HER PLATE TURNS BLADES". |
| B3 anti-spam ward / B4 stagger = still | not checked as a code read; fights show 1-5 "courts" a fight, i.e. she resets. |
| B5 moves from who she is | fine (point / decree / sceptre / sweep / slam / hall leap / quake / shadow, all told: marks.js). |
| B6 numbers | FAIL: 100% (target 50-60% per hero, report per hero), 32-137 s (target 90-150 s). Too many openings (3 pillars + 6 chandeliers + grate, all standing, per round). |
| B7 arena | no soft-lock found in 18 fights. |
| B8 approach sets her up | PASS: banner/throne, the keep's whole rule, the Captains Hall and banquet. |
| B9 Daniel's playtest gate | not mine. |
| B10 shared read | uses the ! / !! marks and the named pin calls; not re-audited here. |
| B11/B14 hittable + key | duelist-ish puzzle boss: opening-keyed (pillar blow, chandelier cut, bell). The key is TAUGHT: chandeliers in the banquet, the bell in 3 halls. |
| B12 reachable openings | all 3 heroes get pins; warden fastest (32-66 s). |
| B13 waiting-room invulnerability | the x0.05 chip outside an opening IS the waiting room if the player can't make an opening; the bot always can. |
| B15 resistance floor (>= 0.4x) | FAIL as written (0.05). The chip sweep will convert it to >= 0.4x - which makes her EVEN easier (more damage outside openings) unless her openings get rarer or her tells/damage rise. RETUNE TOGETHER: (a) pillars rebuild only on round 3 / one chandelier per round, (b) she RINGS HER OWN BELL (Idea 6). |

## 3. IDEAS (ranked; keep the castle's look; every one works with the cuts)
1. THE BAILEY OPENS WITH A GATE YOU CAN HOLD  (S-M)   [A4 teach; the Kitchen Gate hand-off; serves the rule line]
   The player DOES: comes up the kitchen stair INTO the gatehouse passage (tower 231-241 stays as the left wall: its outer portcullis (col 236) is the one that shuts behind him, drawn already shut), walks out
   into the lower bailey (old 242-262), and the FIRST thing in view is a portcullis hung over the way on (new, ~old col 256, row 58-63) with a winch beside it and a hound under it - the existing winch teach moved
   from the dropped front gate (228) to here - while archers on the wall walk (row 52, 242-295: already there) cover it from ARROW SLITS (draft src/draft/curtain-wall.js) and a MURDER HOLE over
   the passage pours oil on a square marked on the floor (told: a hanging brazier + drip; 1 s; 25% hp). Strike the winch: the grate holds and you run under; the oil falls on the guard who steps in after you.
   Where: new start x238,y63 (old col numbering; becomes col 7 after cutting 0-230); gate ~old 256, murder hole ~old 262; the existing check 242 is the START checkpoint, the road picket (257-300) stays.
   Why: the old gatehouse approach (drawbridge, hound under the gate, signs 226/6) is what is being cut; the winch is the first rule teach and must come back in the first 20 columns. Cost S (data + sign) to M (murder-hole prop).
2. RING IT YOURSELF: THE BELL IS A LURE  (M)   [A2 verb; A5 fights; the boss's mechanic taught first]
   The player DOES: climbs to the ward's bell (old 304,63, behind the sentry at 286) and RINGS it on purpose: the garrison (the 3-4 soldiers/heavies idling in the road picket, old 257-300) run for the hall, the grate at
   321 drops - and the player holds the winch at the far end (taught in Idea 1) to drop the SECOND grate on the pack as it passes under (this is the Queen's grate move in small). Rung wrong, you have shut your
   own way for 20 s (told). Silver behind the barracks door pays the clever (secrets count +1).
   Where: ward 286-323 (one bell, one winch 'drop' grate at ~315, the barracks door 95 old), hall 706-736 (the same idea with the stair gate), chapel 730,19 (loudest bell, two sentries). Reuses ent bell / winch (drop:true, bell:true) from the queen's hall; the code to drop a grate on foes already exists.
   Why: today bells are only an enemy tool - a player who sees the sentry first never touches the rule again. It makes the Queen's fight (bell while she stands under) a thing the level already taught. Cost M.
3. THE VESTIBULE EXAM  (S-M)   [A4 exam; fills the armoury gap]
   The player DOES: after the pit, enters a 24-column ward gate (cols 464-487 old) where ONE weighty elite (the heavy 'UNSTOPPABLE' already in the roster, or a heavy + sentry with a bell) stands on footing; behind the player the alarm
   grate drops when he steps in; the checkpoint is AFTER it (the existing check 465 moves to ~487). One bell, one gate, one duel: the standard's section-exam shape, and the pit -> bakehouse join stops being two hazards in a row. Where: old 464-487;
   cost S-M (it is the existing 'ward' alarm template with a heavy).
4. THE KEEP CLIMBS INSTEAD OF WALKING  (M-L)   [padding; A5]
   The player DOES: crosses ONE tall hall (old 660-761, rows 20-63) by stairs + balconies instead of three flat floors - cutting a chandelier on the garrison as he goes (the level's weight verb), ringing the hall bell at the top to lock the lower stair behind. The kitchen floor (F1, old 124-206 rows 42-53, hearthgobs/braziers) goes - it is the Kitchen Gate's job now. Where: F0/F1/F2 (rows 26-63). Cost M-L; saves ~15% of the route and the longest uniform fight stretch. Serves identity ("a keep, not a corridor").
5. THE BAKEHOUSE BELL IS A SLUICE  (M)   [A2/A3; the rule where it is absent]
   The player DOES: the yard (old 588-659) is fire platforming; add a cistern gate over it: rung bell -> its grate (a sluice) DROPS and the fire pits (firepit 599, firevents 610/648) go out for 6 s (steam rising, told), hearthgobs burn out of their cover. Ring it at the start of the long fire run (X+36..X+47 hoist beam). Cost M. Replaces 'hold your breath and run' with 'ring, then run' - the exact lesson of idea 2 in a new setting (remix).
6. THE QUEEN RINGS HER OWN BELL  (M, boss lane; B6/B15)   [boss = the rule personified]
   She stands at the bell rope and RINGS it: told by a word (RUNG!), a sound and the grate dropping between you and her (2 s); you must cut the rope with a throw/jump-cut to lift it or climb the pillar rubble over it. This is her new move for round 3 (one new move per phase) and the pace the bot-beating 18/18 needs. Pair with: pillars rebuild only on round 3, one chandelier per round, B15 conversion of the x0.05 chip.
7. KEY CARRIERS WHO RUN  (S)   [A2 remix]
   Today four lock gates ask "find the key on one of them, then open the gate" (ward 308, hall 724, chapel 728, altar 682): the same verb four times. Make the sentry the carrier in two of them: catch him before he rings and the key drops on him; let him ring and he runs the key up the stair. Where: ward 286, hall 706. Cost S. 

### TOP-3 RECOMMENDATION
1. IDEA 1 (bailey opens with a gate you can hold) - REQUIRED by the cut: it restores the first teach and gives the Kitchen Gate hand-off a scene. S-M.
2. IDEA 3 (vestibule exam) - REQUIRED by the Armoury cut: it stops two hazard sections colliding and puts a real exam + checkpoint where the smith was. S-M.
3. IDEA 2 (ring it yourself) - the verb the level is named after, and the best cheap prep for the Queen. M.
Riders: IDEA 6 + the B15 conversion as ONE boss retune (do not ship the B15 conversion alone: it makes her easier); IDEA 4 if Daniel still thinks the level is long after the cuts.

## 4. THE CUTS: EXACT COLUMNS AND JOINS (current FINAL columns)
### 4a. THE ARMOURY (Forgemaster mini)  -> the Queen's Forge
- DELETE cols 488-587 (100 columns) = the forge-house roof (468-585, rows 46-49), the chimney 522-525, the east end walls + the PORT gate at 575 (rows 50-63), the rail line (row 64, 465-583) and 2 carts (516/580, 568 on the upper rail), hammer 534, anvil 542, boiler ~552, 6 hotplates (3 furnace-line 482/494/503 + 3 forge), the Forgemaster (556), his slag/beam (R.mini, mini.beamL/R, slag x3), 4 torches, the furnace-line sign (473) hearthgob + heavy (487/499), and the gantry silver.
- KEEP cols 464-487 as the VESTIBULE: remove the forge-house west wall (468-469) and the roof stub (468-487, rows 46-49) so it is open ward, keep check 465 (moves to 487 with Idea 3), sign 466 reworded.
- JOIN: pit far bank ground (row 64 from 454) runs through the vestibule to 487; the bakehouse yard's west lip is block(588-595, 64..BOT) at the SAME row 64 - butt them: new col 487 meets old col 588 with no step. Walls: none. Chasm facade 'burning' [596-651] shifts left by 100.
- ALSO REWRITE: R.tints [548,617] -> the fire tint now starts at the bakehouse lip; R.ambient 'fire' 468-545 DELETE and 'hall' now starts at the bakehouse; R.weather snow zone ends at old 468 -> ends at the vestibule's end; R.calm [468,545,36,49] DELETE; interiors 'forge' x2 DELETE; masonry/facades for the forge-house; checkpoint 589 (bakehouse) DROP or keep 487's (pick ONE: spacing becomes 5 columns).
- Do it with ONE helper cutColumns(R, x0, x1) (inverse of grow()) that shifts grid, ents, moversExtra, pools, falls, alarms (gates, garrison, wake), arena (x0/x1/wallL/wallR/trigger/hole/rubble), mini, masonry, facades, tints, calm, weather, ambient, winds, interiors, `trial`/reach tables; apply it LAST in highcrownWhole() (after R.winds) so no literal in the source changes. It is the same shape as shiftCrown() (src/level.js ~3220) run backwards.
### 4b. THE OPENING (road + siege lines + gatehouse approach)
- DELETE cols 0-230 (231 columns): the gully + five terraces (0-64), eyrie, watchtower (51-55), gorge + rope bridge (65-78), barbican (79-92), broken stone bridge (93-111), the siege lines (112-191: burning ditch, two siege towers, 3 firevents), the castle rock (192-222), the moat + drawbridge (223-230), winch 228, sign 226, hound 235.
- NEW START: x 238, y 63, inside the gatehouse passage (tower 231-241 rows 44-57 stays and becomes the level's west wall; its PORT at 236 is permanently shut behind you). The kitchen stair arrives behind that port (a facade / door prop on the passage's west face). R.START {x:238,y:63}; the old check 242 stays as the start checkpoint (no checkpoint at 12,95 any more).
- WHAT DIES WITH IT: 5 checkpoints (44,71 / 114,65 / and the road's), the silver 54,59, the cascade ent, 5 harpies, the goats, the two siege towers, 'fire' ambient/tint [112-191], R.weather snow 0-468 (start it at the tower), winds none. The level-quality 'flat'/'bands' stats re-measure.
- RESULT: W 940 -> 609 columns (940 - 231 - 100); route ~2/3 of today (894 of 1398 manhattan route tiles remain after both cuts of the pacing route: 64%); bot time ~490 s -> ~330 s (and the mini's 75-120 s fight leaves with the Forgemaster); human first run ~7-10 min before the Queen.
### 4c. WHAT THE KITCHEN GATE SHOULD NOT DOUBLE
The keep's own F1 KITCHENS floor (hearthgob x3, brazier x2, folk x2, brute, barrels/wares, 'cold larder') is the Kitchen Gate's content; keep the STAIR and drop/reskin the floor (Idea 4) or the two levels will feel like the same room. The bell + gate of that floor (none) is not lost.

## QUESTIONS FOR DANIEL (rec first; none blocked me)
1. Start the level at the gatehouse passage (cut 0-230, rec) or at the ward proper (cut 0-241)? Rec: keep the tower: it is the landmark behind you and the 'gatehouse passage' of the Kitchen Gate brief.
2. The pit -> bakehouse join: 24-column vestibule exam + one checkpoint (rec, Idea 3) vs a pure cut? A pure cut puts the worst two hazard sections 5 columns apart.
3. Garrison: is `soldier/javelin/heavy/pike` a goblin skin in this level? 65% of the roster is that kit; the Queen's castle should read as goblins (the standard allows undead/humans only past the Queen). If not goblin-skinned, reskin them (cnSkin) in the same pass.
4. The Queen at 18/18: retune with Idea 6 + the B15 chip conversion together (rec) - or ship the conversion first and expect her to get easier?
5. Hall music: keep the borrowed goblinroyal until Daniel picks a track, or compose-in-code a Highcrown boss synth now (the quality tool counts it as a FAIL).
