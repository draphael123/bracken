# REVIEW: THE TOWPATH ('towpath') + THE FOG KNIGHT - read-only, TOWREVIEW lane, 2026-10-08
Worktree bracken-towreview (claude/towreview off claude/towpath 43ad40d6), port 8744 only (own PIDs, all exited). No gameplay code committed. One temporary experiment
(FK.cutTell 0.5 -> 0.64, pyro boss rows) was reverted (`git restore`); nothing under src/ or tools/ is changed in the commit.
Read: common-1008, design-standard, concept-towpath, the greybox lane report, src/towpath.js, towpath-hands.js, fog-knight.js (+ hands), stuck-spots, elite-kit, map-plates.
Evidence: scratch/review-towpath-shots/ (page shots, hero holds the lantern, foes cleared), scratch/review-towpath-tools/ (probes: `_tr_fast.mjs` map checker, `_tr_s5.mjs` layout search,
`_tr_patchmain.mjs`, `_tr_mkroutef3.mjs` F3 probe, `_tr_hill.mjs` hill-path hops, `_tr_shots.mjs`). Logs: scratch/_tr_walk.log, _tr_mash.log, _tr_bossdry.log, _tr_boss.log, _tr_route.log.

## 0. HEADLINE
The rule is the best-built of the road so far (verbs both ways, gauge + FILLING/DRAINING drawn, foes drowned/stranded by it, a real exam with irons) and the Fog Knight is a clean
duelist. What is wrong is weight and the edges: (1) EVERY run of every hero survives (walker 0 deaths in 9 runs, arrive 49-95%) and the elites fall in 8-25 s for ~0 net hp;
(2) the pyro is 1/6 on the dry boss rows because his 0.5 s cut tell (0.36 s when you are dim) is shorter than the human reaction (0.42 s) and she cannot block;
(3) the lantern - the boss's whole rule - is never REQUIRED before the boss (A4) and the boss's approach shows nothing of him (B8); (4) the F2-landing river rat stands IN
F3's gate doorway and hooks you off its punt (walker STUCK there 7/9 runs, route pilot lifted on F3 with all 3 heroes, 7.7 s pass when he is dead); (5) the inland map sheet needs
4 nodes moved - a concrete layout that passes map-spacing + map-grammar is in section 3 (it also fixes a second red the lane did not list: `additional-areas` "towpath map path mismatch").

## 1. MUST-FIX (ranked)

### M1. TOO EASY - put weight where the standard puts it (cols below are DESIGN columns; sheet rows are +10)
Measured (walker, campaign L22, typical build 249/249/237 hp, 3 flasks, heart charm, 3 seeds a hero, profile human+first): deaths 0/0/0 (target 1-2), arrive at the shrine
knight 69% (min 49) / warden 76% (64) / pyro 69% (57) (target < 50%). Per section: #0 start->shrine 151 lost 11-54%, #1 151->313 lost 48-125% (all heal 53-126% with 1-2 drinks, so nothing sticks),
boss approach 0. Who hurts: bargemen/river rats ("gaffer") 2-5 hits = 41-100% hp a run; the rest is "other" (hazard water). ELITE DUELS (walker, knight/warden/pyro): the hedge
champion @144-152 WON in 8-23 s with 47->49%, 94->74%, 63->65%, 100->61%, 88->90% (net ~0 after heals); the deck foreman @302-310 WON in 9.6-25 s, 37->67%, 72->77%, 48->69%
(he HEALS the hero: kill heals > his damage). Mash LEVEL (no --write): knight dies 3x (hp lost 307%), warden 2x (275%), pyro 2x (300%) - OK (A10 met). Level-1 pilot (lane stamp) 26 blows / 3 deaths OK.
So the foes that exist are not heavy enough and there is no exam between col 151 and col 313 except the last lock.
Fix in four moves (do not add foe count; ELITES are the weight, v2):
 a. MAKE THE TWO EXISTING ELITES WEIGHTY: target = the walker's duel 25-40 s, 25-40% hp lost, no net heal. Levers that exist: `L.foeHp.deckforeman 1.3 -> 2.2`, `L.foeHit.deckforeman 2.6 -> 3.2`
    (src/towpath.js ~255), per-kind tune in src/elite-kit.js (hedgeknight `{dmg:1.8,tell:.85,every:.55}` -> hp 1.5, every .5) and AFFIX rows (none exist for towpath):
    `'towpath|hedgeknight': 'SHIELDED'` (the champion at 145: shield faces the cut, the cut at your back is the hazard), `'towpath|gaffer#1': 'SWIFT'`, `'#2': 'WARDING'`, `'#3': 'UNSTOPPABLE'` (the foreman).
 b. ADD AN ELITE TO SECTION 3 (THE LOCK FLIGHT): ONE bargeman champion (gaffer elite, cnSkin 'bargeman') at col 190, row 16 (on the top deck, `ground(183,221,17)`), squad 'flightExam',
    standing 6 cols from F3's lip (col 183). HAZARD BEHIND YOU: F3's chamber (cols 177-182, 11 rows of fall into the grindylow's water) - a heavy blow off the lip is the punishment.
    Delete the dozing bargeman at col 200 (net foe count unchanged); keep the watchman on the beam (186) but move him to the beam's east end (col 188) so he covers the lip, not the elite.
 c. ADD AN ELITE TO SECTION 4 (THE BASIN): replace the second dozing river rat (col 243) with a river-rat elite (gaffer elite, cnSkin 'riverrat', tp `{bargee:true,tpDoze:true}`) at col 239, row 16,
    7 cols off the bridge's east lip: it sleeps; you pass inside its 44 px elbow whatever you do, so a DIM approach buys the first free blow (the lantern verb pays), a LIT one wakes him with the squad.
    HAZARD BEHIND YOU: the basin pound (cols 222-234, 8 rows, bites ~27% and returns you) and the swing bridge you can swing out from under HIM (he follows you onto the deck).
 d. ONE MORE SHRINE at col 218 (end of the flight deck, row 16, before the basin bridge at 220) -> 3 checkpoints: 151 / 218 / 313 (level-quality "checks" stays >= 90: 337 route tiles / 3 = ~112).
    Spacing: 151->218 = 67 cols but ~117 route tiles with the three climbs; 218->313 = 95 cols ~150 route tiles (X's 11-row descent, Y's 13-row ride). Do NOT add a 4th (the lint then reads 84 < 90).
 Re-measure with the walker (`level-walk.mjs towpath --seeds=3`): target 1-2 deaths a first run, arrival < 50%. Re-run curve/mash level, re-stamp mash LEVEL then BOSS.

### M2. PYRO 1/6 ON THE DRY BOSS ROWS (and the smallest fix that keeps the stance design)
Rows, practiced, human+dry (my run, 6 seeds a hero, campaign L22): knight 5/6, warden 4/6, pyro 1/6 = 56% (the lane's numbers reproduce exactly; wins 58-124 s, one pyro win 190 s).
With flasks (profile human): 6/6, 5/6, 6/6 = 94% ("HIGH +34"); first attempts 3/3, 2/3, 3/3. The standard says DRY; the flask regime is Daniel's call (QUESTION 2).
Why pyro: bare build maxHp pyro 196 vs knight 208; damage TAKEN per fight pyro 196-210 (dead at 47-102 s with 9-46% of him left, i.e. she did 54-91% of his hp) vs knight 60-68 in his wins.
The cut (30, `blockable`) is the move that eats her: `FK.cutTell` 0.5 s, SHORTENED by `darkLate` 0.14 to 0.36 s whenever the hero is not lit (`tellLen`), against the human profile's reaction
~0.42 s (rt 418-445 in every row). The knight/warden answer it with the shield (block, no step needed); the pyro has no block - she must roll or back off 46 px (cutReach) in the
0.08 s that is left, the bot's roll only fires if `modeT < 0.16` - it cannot. Her fire blow is not the problem (`fire`: half a blow, any stance, feeds the burn; it keeps her always hitting).
SMALLEST FIX: lengthen the cut tell, nothing in the stance design: `FK.cutTell 0.5 -> 0.62` and floor it so a dim hero never reads it under 0.5 s (`tellLen` for 'cutTell'/'stepTell': darkLate 0.14 -> 0.06).
MEASURED (temporary edit, cutTell 0.64 only): pyro 4/6 = 67% (was 1/6). Knight and warden were NOT re-run with it - expect them to rise to ~6/6 and ~5/6, so give the 10 points back in health:
`FK.hp 1450 -> ~1600` (then re-run all three heroes x 6 seeds; target 50-60% overall, pyro >= 2/6). Fight length is 58-124 s today (standard 90-150): the extra hp also lengthens it.
Second lever if the first is not enough (not measured): let her thrown fire also feed the burn faster (`FK.fireBurn 0.06 -> 0.09`) so she earns the x1.6 opening from range.
Mash BOSS 0/6 is the lane's stamp (cache): knight 0 blows land, warden 93% left, pyro 87% left; I did not re-run it (the boss changes above need a re-stamp anyway).

### M3. THE LANTERN IS NEVER REQUIRED BEFORE THE BOSS (A4: one REQUIRED use) - and the boss's whole rule rides on it
The hut's lantern is taken with E at col 156 only if the player presses E on a hook he walks through; the arena then hands it to a player who never took it (`arenaStart`), watchmen and dozers only
see the LIT, so skipping it is the dominant way to play and the boss is its first use. Fixes (pick both small ones):
 a. THE LANTERN IS TAKEN BY WALKING THROUGH THE HUT (col 156, no E) with the "E LIGHTS IT" line; every player holds it before the flight.
 b. A REQUIRED LIT USE in the exam: the last lock's bank paddle (col 266, row 16) stands in fog 0.7 under an UNLIT lamp (`lamp(267,16,false)`); draw/glint the paddle only inside a light (lit lantern, lit
    lamp: tplamp ent exists) and add `STUCK_HANDS.towpath` step `{key:'xlamp', is:['lamp.x','out'], at:[266,26], line:'THE LAMP IS OUT: STRIKE IT, OR LIGHT THE LANTERN'}`. The exam's warning ("here the irons kill") then arrives lit.

### M4. THE FOG KNIGHT HAS NO APPROACH (B8) - he comes from nowhere
The last 3 columns before the door (313 shrine -> 316) show nothing of him; the arena's knight stands asleep 28 columns from the trigger (visible only when the camera scrolls in). Foreshadow with data the level already owns:
 - the lock-keeper's hut (col 154-157, row 31): an EMPTY rust-black armour on a stand with fog in the visor (decor `emptyArmour`), sign: "THE LOCK-KEEPER WENT UP TO THE LAST GATE. ONLY HIS ARMOUR CAME BACK." (two lines);
 - the foreman's arena-side (col 308-312): a fog-pooled armour silhouette across the last cut (cols 300-312, row 13) that is gone when you step to it - and the lamp (303,13) gutters as you pass;
 - the flight's fog (156-221) already thickens; make the fog edge HOLD A KNIGHT SHAPE once per flight (a faint plate outline at the top lamp, col 189).
 One sign + two decor pieces, no code.

### M5. F2 -> F3: THE RIVER RAT STANDS IN F3's GATE DOORWAY AND HOOKS YOU OFF THE PUNT (walker STUCK, route pilot lifted)
Evidence: walker STUCK at (182,26) in 7 of 9 runs (all three heroes; "near grindylow lurk@181.5" is the nearest foe, not the cause); real-key route pilot with foes on (god or not) is LIFTED on
the F3 leg for knight, warden AND pyro (3 tries, 208 s, F3 reaches 'hi' while the hero stands back on the F2 landing at 175,31). Probe (`_tr_routeF3.mjs knight`, same keys): rat alive -> LIFT;
rat dead (watchman + grindylow alive) -> F3 walked in 7.7 s; everything dead -> 7.7 s. Cause: `riverrat(176,21,'f2Landing')` stands on col 176 = F3's lower-gate column (`gate:[176,17,21]`), so
(a) `inGate` holds the gate open while he lives (the water "waits": src/towpath-hands.js stepLocks), (b) his hook (a bargee) pulls the hero off the punt back onto the 2-column landing (175-176), after which F3 is full and
the lower gate shut under you - recoverable only by the twin paddle at col 175 (drain, retry). A player who kills him first is fine; a player who steps on the punt first is hooked off AND the chamber fills.
Fix: (1) move the rat to col 174 on a widened landing (`ground(173,176,22)` instead of (175,176): a 4-col duel floor; F2's punt deck ends at col 174, so make the landing start where the punt lets off);
(2) `inGate()` should ignore bodies standing on the landing floor row, only count ones in the doorway rows 17-21 above the sill; (3) when the gate is held by a foe say it once: "SOMETHING STANDS IN THE GATE".
This is the one place the route pilot/walker cannot pass with foes on - make it pass before the weight in M1 goes in around it.

### M6. MAP: THE INLAND SHEET NEEDS A 4-NODE RELAYOUT (section 3) - and the lane's list of reds missed `additional-areas`
`node tools/additional-areas.mjs` fails on this branch with "towpath map path mismatch" (a node must sit ON its road to the pixel; the towpath node (31,137) is not a path vertex; the
ksar mismatch beneath it is pre-existing on base). The relayout below makes the towpath a path vertex too.

## 2. SHOULD-FIX
S1. GAFFER FAMILY = 9 of 24 foes (37.5%) over the ~35% cap (bargemen x5, river rats x3, deck foreman x1; 3 skins on one AI: fine for variety, heavy for the count); M1c/M1b swap a dozer for an elite (same count) - also turn one of the S4 river rats (col 240)
    into a watchman variant or a lock rat with the grindylow's wet twist, or drop the crossbow at col 72 (S1 teach has 3 foes + an elite before the first lock is understood).
S2. THE LOCK SIGN NEVER SAYS THE VERB (A6: "Reef said TURN for STRIKE"): sign(45,37) "A LOCK. ITS PADDLE FILLS IT, AND THE WATER LIFTS THE PUNT." -> "A LOCK: STRIKE ITS PADDLE (OR E) AND THE WATER LIFTS THE PUNT." (two lines). The race sign (96,33) and the
    bridge sign (129,31) likewise: "STRIKE THE CAPSTAN".
S3. THE CHURCH DOOR SHIPS AS A DEAD END: `tpchurch` at col 38 says "THE LIT CHURCH: THE WAY UP IS NOT OPEN YET" and the hill path (4 board steps, all 3 rows - every hero makes them, 60-67% of 27 timings each; `_tr_hill.mjs`) leads to it.
    Until claude/litchurch lands, hide the ent (and the hill path's boards) behind `if (LEVELS.some(l => l.id === 'church'))` so the fork is not a promise the game breaks.
S4. STUCK GUIDE (A6) covers every paddle and capstan (10 spots, good) but not: the stilled mill wheel after the race is drained (the climb), the warehouse ladder (col 245), the culvert, the lantern (E) and the lamps.
    Add 4 entries to STUCK_HANDS.towpath (`handsState` already reports wheel/lantern/lamp states). The glint after M3 must exist for the lit paddle.
S5. REWARDS (A11): 3 silvers (cottage roof col 70, flight beam col 184 behind the watchman, alley pocket col 254), none in the exam section; 0 collectible kinds -> no themed vault. Add one risk-reward in the exam:
    a silver on the drained X bed's LEDGE over the irons (col 276, row 23) - only reachable while the chamber is drained, a real-death pit under it; and a lock-keeper's till in the hut (the vault ent) if a collectible kind is wanted.
S6. THE EXAM'S RULE-WITH-FOES: the foreman (col 306) stands past the last cut - swing the cut's bridge clear while he crosses to dunk him (the S4 trick again, now with an elite: "elite is stop" - let `swing` shove him off, B-side). Today the elite is outside the rule.
S7. BOSS FIGHT LENGTH 58-124 s (standard 90-150 s): with the M2 health change expect ~90 s. Check after.
S8. WALKER HAND GAPS (not level bugs; real keys pass): warden STUCK at (81,41) (2-row stile at cols 80-83: the walker's jump planner) and at (230,26) near the first basin grindylow; the route pilot with foes off walks all seven heroes with 0 lifts.
    Teach the walker the locks (a `walkHint` exists: `BK.walkHint` in towpath-hands) so the next measure covers the whole level: knight and pyro measured 78%, warden 33%.
S9. GREYBOX STILL CHECK-ONLY: the lane drew nothing by eye. I looked (shots): the dusk start reads as Waymeet's sky/roofs and the lantern clearing in fog reads well; the mill (wheel behind the loft), lock gauge posts, arena (dusk sky, silhouette knight)
    work. Missing for the art pass: the canal-town brick kit (warehouses read as plain grey blocks), a chimney-skyline landmark, the lit church on its hill in the first screens, the lock gates' art.
S10. ELITE AFFIXES: no `towpath|...` rows in src/elite-kit.js AFFIX (falls back to the default) - add them with M1a.
S11. COMMENTS: `lock('F1',..., 'hi', {gate:[160,26,31]})`: the gate column 160 has `block(160,160,32,..)` below - fine; but `punt('F1', 161, 6)` reach model rides lo..hi = 6 rows: that is the A7 hop limit with the walker; OK for base movement (pilot passes all 7 heroes).

## 3. THE INLAND MAP RELAYOUT (for the fix lane) - verified
Cause: the towpath node box overlaps WAYMEET (31,137) vs (25,153): dx 6, dy 16 (< 16 / 26) and the plates are 76-154 px wide ("THE MASKWRIGHT'S THEATRE" 154): the left column has no free strip. The empty part of the sheet is the right-hand
half below y 90. Moved nodes (sheet-local coords, INLAND_Y 180 added by main.js):

| node | now | proposed |
|---|---|---|
| waymeet | (25,153) | (25,153) unchanged |
| towpath | (31,137) off-vertex | (41,153) - a road vertex, a hop east of Waymeet on the same row (dx 16) |
| canal | (38,120) | (41,122) |
| theatre | (90,149) | (111,134) |
| fair | (104,122) | (130,115) |
| fields, burial, witchlight, mage, falling tower, unburied (spur) | | unchanged |

INLAND_PATH = `[[140,176],[25,153],[41,153],[41,122],[111,134],[130,115],[93,86],[124,83],[159,43],[208,64],[260,34]]` (adds the towpath vertex; the old path skipped it).
In src/main.js: four `x:, y:` edits on the node lines at ~4283-4286 and the one INLAND_PATH line (4297). Plate sides stay `'left'`.
Verified by patching a COPY of main.js in memory (not committed): `tools/map-spacing.mjs` -> "ok: 45 nodes, every plate clear"; `tools/map-grammar.mjs` -> "The map grammar holds" (no road crossing, margins, spur bands,
required nodes resolve forward); `additional-areas.mjs` passes the towpath row (its remaining ksar failure is on base too). Search script: scratch/review-towpath-tools/_tr_s5.mjs (annealing over towpath/canal/theatre/fair, cost = offences then movement + path length;
2-node moves (towpath+canal) have NO solution at 8 px - the long theatre/fair plates are what pins it). The THEATRE and FAIR moves also clear the pre-existing "fair/burial/witchlight info panel" notes.
Church spur (litchurch) is not in the map yet; a free hang-off exists up-right of the towpath (about (60,140)) - not validated.

## 4. SCORES (design-standard v2)

### Rule use (A1-A5, 12-point): 11/12 (T2 E2 R2 V2 B2 S1)
T2 teach safe: mill-pond lock's low water only wets you; the tail race bridge has nobody on it; the race drains for the wheel. E2 escalation, >= 3 distinct uses of each verb: LOCK = ride (A), drain a race to still a wheel,
drain F1 to bring the punt down, FILL F2 to DROWN the pair or fight them in the bed, ride F3 dim, X drained to ledges over irons (real death), Y refilled, the arena's lock drained to sink the double;
BRIDGE = tail (safe), basin (strand a squad), last cut, the arena's scatter; LANTERN = lit/dim, watchmen/dozers, the burn. R2: gauge post on every gate, FILLING/DRAINING word, wheel stills visibly, bridge arc drawn;
signs miss the VERB (S2). V2: every machine changes the rule's state and the route. B2: the boss reuses all three (lantern burn, bridge scatter, lock drains the double). S1: glint + 10 s nudge on every paddle/capstan, but not the lantern, wheel, ladder (S4), and the F3 gate edge (M5).
A1 line "THE LOCKS LIFT THE WATER, AND THE WATER LIFTS YOU." equals the code (tools/towpath.mjs holds it). A4: required use before the boss: locks and bridges yes, LANTERN NO (M3). A5 fights during the rule: 8 of 19 encounters stand where the rule is active; the best is the dry F2 bed and the basin squad;
the elites (col 145, 306) are outside the rule (S6).

### Identity (A8): ~14/18 as greybox (KIT 1, PAL 1, PLAT 2, LMK 1, SET 2, DRESS 1, LIGHT 2, AMB 2, THEME 2) - projects to 16-17 after the Sonnet art pass
KIT 1: Waymeet's village set + staging ledges; the canal-town brick kit does not exist yet. PAL 1: dusk sky + haze/murk bands do the fade, no per-section palette shift on the ground. PLAT 2: 6 height bands, 46% second height, punts, wheel paddles, boards, ladders, drained ledges, swing bridges.
LMK 1: the mill wheel only; no chimney skyline, no lit church in the opening screens. SET 2: the lock flight + the drained last lock + the mill wheel are only-here AND verbs. DRESS 1: milestones, willow, cattle, bollards, sparse. LIGHT 2: the lantern clearing and the lamps ARE the rule.
AMB 2: own `towpath` bed + synth bed. THEME 2: no goblins, canal men, undead none; the lychgate is the church's own, not Waymeet's (A8 ok). Props borrowed from Waymeet: none (the cottage/mill/hut are drawn by the level).

### Enemies (A9)
24 foes: gaffer-family 9 (bargeman 5, river rat 3, deck foreman 1) 37.5% (S1), watchman 4, grindylow 4, sworn sword 3, hedge knight 2 (1 elite), crossbow 2. Roles heavy 11 / melee 3 / ranged 6 / runner 4 (>= 3 ok). One new type (grindylow, the canal's, no new AI) ok.
One reskinned ranged foe: the watchman (archer, cnSkin). Reskins via cnSkin (corpses die in their skin). Twist tied to the rule: bargeman hook pulls you toward the water; drowned in a filled chamber; the squad stranded by the bridge; watchman sees only the lit: strong.
Goblin check: road order waymeet > towpath > canal; no goblin on this level (grindylow is a water imp): fine. Foes at platforming moments: yes (the flight, the culvert's rim, the last cut).

### Difficulty v2
- Walker (campaign L22, 3 seeds a hero, profile human+first, NOT written): knight 0 deaths, arrive 69/49, measured 78%; warden 0 deaths, arrive 76/64, measured 33% (STUCK 81,41 / 182,26 / 230,26: hand gaps + M5); pyro 0 deaths, arrive 69/57, measured 78%. All three MISS the v2 target ("1-2 deaths, arrive < 50%").
- Level mash bot (`mash-bot.mjs --level towpath`, no --write): knight lowest hp 0%, hp lost 307%, 3 deaths, walked 100%, 30 lifts, 15 blows; warden 275%, 2 deaths, 14 blows; pyro 300%, 2 deaths, 13 blows. Every hero loses the level (A10 ok).
- Level-quality `towpath`: CLEARS THE BAR (flat 0%, bands 6, mechanics 7 kinds, checkpoints 2 = one per 169, ruleFight 8/19, curve act 4: 242% / 3 deaths in band). Only 2 shrines: 151 and 313; M1d adds the third.
- Spacing today: start -> 151 = 151 cols ending in the elite (exam -> CP after: right shape); 151 -> 313 = 162 cols holding the whole flight/basin/last lock: too long for the section count (M1d).
- A10 amended: the exam (cols 268-301) has real-death irons, told on entry ("THE EXAM: HERE THE SPIKES KILL"); falls elsewhere return you (waterHurts). Fine.

### Stuck points per hero (real keys, base movement)
- Route pilot `towpath-route.mjs`, foes OFF, god (the lane's run; I re-ran knight/warden/pyro with foes ON, non-god, scripted hand with no fighting):
  knight 6 deaths / 2 LIFTED (F3, and the basin or last cut), warden 5 / 2 (F3, basin), pyro 5 / 2 (F3, last cut). The lifts are a hand that cannot fight; the F3 one is M5 (reproduced with the rat dead: pass).
- With foes OFF: all 7 heroes walk the whole route with 0 lifts (lane stamp); hill path hops (3-row boards) pass for knight/warden/pyro (60-67% of 27 timings a step); the 2-row stile and the 4-row punt lifts pass.
- No pinned-under-ceiling, no dead pad found; punts/gates never shut on a body (the gate waits - which is M5's mechanism). Drowning/hooks tell their cause ("THE WATER TAKES HIM", "YOU WADE OUT TO THE BANK").

### Boss B1-B14 (duelist, FULL_DAMAGE)
B1 yes (lantern burn, bridge scatter, lock vs double = the rule). B2 duelist: always hittable, guards by angle; no chip wall. B3 3 s told ward after every opening. B4 open = stands where he is. B5 moves from the stance kit; P1 lunge, P2 double, P3 shroud: one new move per phase, arena changes.
B6 numbers in section M2 (dry 56% in band, pyro 1/6, mash 0/6 lane stamp, length 58-124 s a little short). B7 no soft-lock found (capstans on both banks; the bot swings back when he is across). B8 NO (M4). B9 Daniel's playtest gate stands.
B10 ring + bar + words (greybox draws them; I saw "GUARDS HIGH" on the bar and the name card in the arena shot). B11 yes. B12 dissolve after 3 quick hits once a cycle, never in/after an opening. B13 the only immunity is the told ward and the sleep/wake beat.
B14 duelist exempt; the FULL GUARD plunge key is named ("FULL GUARD: FROM ABOVE") and every hero makes it (pyro's firedrop counts). Check against the neighbouring boss (Lanterneater, a beast) - different keys: ok.
Per hero (dry, practiced, L22, 6 seeds): knight 5/6, warden 4/6, pyro 1/6. Deaths: knight s3 (70.9 s, 5% left), warden s1 (85 s, 6% left) and s4 (20 s, 83% left), pyro 5 of 6.
First-attempt profile (with flasks): 3/3, 2/3, 3/3.

## 5. WHERE THE ONE WEIGHTY ELITE A SECTION GOES (cols, design)
| section | now | add / change |
|---|---|---|
| 0 LYCHGATE (0-39) | sworn sword @42 | nothing (fork, teach by choice) |
| 1 MILL-POND LOCK (40-95) | hedge knight @60 (lockTop), crossbow @72, sworn @82 | nothing heavy (teach); drop the crossbow @72 or the stile sword @82 for S1 |
| 2 THE MILLS (96-160) | hedge champion @145 (elite) + shrine 151 | KEEP, make weighty (M1a: SHIELDED, hp x1.5) |
| 3 LOCK FLIGHT (161-221) | 2 bargemen in F2's bed, rat @176, watchman @186, dozer @200 | ADD bargeman champion @190 (row 16, the F3 lip 7 cols behind) in place of the dozer @200; shrine @218; fix rat (M5) |
| 4 THE BASIN (222-264) | 2 dozing rats @240/243, bargeman @250 (roof), watchman @261 | ADD river-rat champion @239 (dozing, row 16, basin lip 5 cols behind) in place of the rat @243 |
| 5 LAST LOCK (265-315) | deck foreman @306 (elite) + shrine 313 | KEEP, make weighty (M1a: hp 2.2 x, hit 3.2 x, affix) ; optional S6 |
| 6 BOSS (316-360) | Fog Knight | M2, M4 |

## 6. QUESTIONS FOR DANIEL
1. M1: add two elites and a third shrine (rec: yes - cols above), and make the two existing ones fight 25-40 s? The current level cannot kill anyone at L22.
2. The boss reads 56% dry but 94% with flasks (the walker's typical build holds 3). The standard measures dry; is the flask regime intended to make every boss trivial, or should the rows move to human with flasks? (Same question for every boss this week.)
3. M2: lengthening the cut's tell for everyone (rec) vs a pyro-only dodge window - rec for everyone: the human reaction is 0.42 s against a 0.36-0.5 s tell, a knight blocks it by habit, nobody else can.
4. M3: the lantern taken by walking through the hut (rec) vs required E.
5. S3: hide the church door until its level exists (rec).
