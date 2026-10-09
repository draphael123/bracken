# claude/towpath - THE TOWPATH greybox + THE FOG KNIGHT (2026-10-08, Opus)

## FIX PASS (2026-10-08 afternoon, TOWPATH FIX lane, Opus) - scratch/review-towpath.md MUST-FIX M1-M6 + SHOULD-FIX S1 S2 S4
Merged claude/batch79 e5d54026 first (check.mjs conflict: their list + 'towpath'). Everything below is on claude/towpath.
**M5 F3 gate rat**: F2 narrowed to cols 169-172 (punt 4, bed paddle 172, the pair at 170/172); F2's top landing `ground(173,176,22)` (a 4-col duel floor);
the river rat at 174. `inGate()` holds the gate for a HERO anywhere in the doorway, for a FOE only when his middle is in the gate column above the sill;
a foe holding it says once SOMETHING STANDS IN THE GATE. The walker's hint now reads the widened landing as F3's bank (its STUCK at 182,26 is gone).
Real-key route pilot WITH FOES (scripted hand that does not fight): F3 passes for knight/warden/pyro (was LIFTED for all three).
**M1 weight** (no extra foe count): BARGEMAN CHAMPION (gaffer elite, SWIFT) at col 196 on the flight's top deck in place of the dozer at 200 (the review
said 190: at 190 he met the rising punt at the lip and spun the walker back down every run - 12 cols gives a player room to step off; the lip is still
behind you); the beam watchman to col 188. RIVER-RAT CHAMPION (gaffer elite, WARDING, dozing) at 239 in place of the rat at 243; that rat became a
watchman (S1). Hedge champion SHIELDED, foreman UNSTOPPABLE (src/elite-kit.js AFFIX_AT towpath rows). A placed elite's own weight row: new ent field
`wKey` (main.js: L.foeHp / L.foeHit look up `wKey || cnSkin`) - foeHp hedgechampion 2.0, bargechampion 2.2, ratchampion 2.2, deckforeman 2.4;
foeHit 1.7 / 3.6 / 3.6 / 3.6; the common men's hit up a notch (bargeman/riverrat 3.4, watchman 2.8). THIRD SHRINE at col **244** (after the basin's
champion), not 218: tools/checkpoint-gaps measured 218 at 65 route tiles from the hut's shrine (gate MIN 80); 244 reads 89 (A10b report-only still
lists it under 140 - three shrines in 162 columns cannot make 140 each). tools/towpath.mjs's shrine rows rewritten for three (each after its elite).
**THE LAST GATE (elites check, red on the lane's head too)**: the deck foreman now holds a gate at col 311 (`gate: 311`; the crane jib removed - the gate
was walked round over it and he perched on it); src/reachcore.js learns the towpath (a drained race's wheel stair, a swing bridge across, a lock is
water only below its LOW level) - tools/elites.mjs ok for towpath.
**M2 the cut**: `FK.cutTell 0.5 -> 0.62`, and a cut / step-out cut is read at most `FK.cutDark` 0.06 late when dim (was darkLate 0.14 + 0.04 in P3).
Health given back: hp 1450 -> **1850** (1600 = 72%, 1750 = 72%, 2000 = 44%, 1850 = 58%).
**M3 lantern**: taken walking INTO the hut (col 156, no E) with the E-lights-it line. REQUIRED LIT USE: the last lock's bank paddle (266) is `dark`:
in the fog under the unlit lamp it shows only a post's shape and does nothing until it stands in a light (a LIT lantern - a dim ember does not count -
or the lamp struck); E there with a dim lantern lights the lantern first; THE LAMP IS OUT: STRIKE IT, OR LIGHT THE LANTERN (line + STUCK_HANDS step
`xlamp`, handsState lamp.x). **M4 approach**: the lock-keeper's empty armour on its stand in the hut (fog in the visor) + sign "THE LOCK-KEEPER WENT UP
TO THE LAST GATE. ONLY HIS ARMOUR CAME BACK."; a knight's plate shape held in the fog by the flight's top lamp (191) and across the last cut (309) -
it thins as you come and is gone for good at 4 cols, and the lamps by it gutter. **M6 map**: towpath (41,153) on the path, canal (41,122), theatre
(111,134), fair (130,115), INLAND_PATH as the review gave; tools/additional-areas.mjs's chain rows now waymeet>towpath>canal.
**S1** gaffer family 8/24 = 33%. **S2** the lock / race / bridge signs say STRIKE. **S4** STUCK_HANDS.towpath += the stilled wheel's climb, the
warehouse ladder, the culvert (glint after a stall; tools/towpath.mjs checks each is on its climb). Not done: S3 (church door left as the hook, per
the coordinator), S5 (vault / exam silver - the level already has its 3 silvers), S6, S9.

### Numbers (fix pass)
- **FOG KNIGHT dry** (practiced, human+dry, L22, 8 seeds): knight 3/8, warden 6/8, pyro 5/8 = **58% in band**, no hero under 2/6. Fights 55-113 s
  (was 58-124; still a little short of 90-150 in the losses). **With flasks** (profile human, 6 seeds): 6/6 6/6 6/6 = 100% (HIGH +40) - reported, not tuned to.
- **Mash BOSS** re-stamped: 0/6 (knight 0 blows land, warden boss 91% left, pyro 89% left). **Mash LEVEL** re-stamped: every hero dies (knight 3, warden 5, pyro 4).
- **Level-1 pilot** re-stamped: 34 blows, 8 deaths, walked 100%. **Curve** act 4: 352% / 7 deaths (band 120-600%, 1-12). level-quality: CLEARS THE BAR.
- **Walker** (campaign L22, typical build, human+first, 3 seeds a hero): knight 0.7 deaths, arrive 60% (min 10); warden 2.0 deaths, 54% (min 13);
  pyro 0.0 deaths, 41% (min 7). Was 0/0/0 deaths, 69/76/69%. Elite duels now 13-60 s and cost 0-60% hp. Deaths mostly the bargeman champion's haft
  spin at the F3 lip and the foreman. Still a MISS on the letter for knight/pyro (deaths < 1) and knight/warden (arrive >= 50) - close.
  Walker hand gaps left (real keys pass): warden at the basin's west grindylow (230,26); the foreman's gate (314,23) when the duel hands land nothing
  in 20 s on him (UNSTOPPABLE) and write him off; once the alley pocket (255,23).
- **Route pilot** (real keys, god, no foes): all 7 heroes walk the whole route, 0 lifts.
### Checks run green (fix pass)
towpath (169), elites, stuck, hint-shown, signs, checkpoints, checkpoint-gaps, sprinkle-cap, map-spacing, map-grammar, additional-areas (+runtime),
level-quality, mash-gate, curve-gate, one-new-foe, skins, comments, threat-holes, tells, goblin-lint, corpses, boss-greed, boss-openings, boss-read,
boss-fight-end, level-jump, verb-matrix, answer-tags, architecture, audio-assets, npc-removal, slopes, slopes-trace, floating-geometry, keys, killzones,
collectables, spawns, deadends, homepaths, dangling-paths, weapon-skins, burial3-keys. (tools/check.mjs with a list - note it runs profile-sweep
--kill-orphans first, which ends ORPHANED headless bracken browsers only.)
### QUESTIONS FOR DANIEL (fix pass)
1. Third shrine at 244 (after the basin's champion) instead of 218 (checkpoint-gaps' MIN 80). Rec: keep 244. Built.
2. The deck foreman now HOLDS THE LAST GATE (311) - the elites check wants a gated elite where there is no mini. Rec: keep (it is the lock-keeper's
   "last gate", and the canal's foreman does the same). Built.
3. The flight's champion at 196 not 190 (he met the punt at the lip every time). Rec: 196. Built.
4. Flask regime: the Fog Knight is 58% dry but 100% with three flasks (same question as every boss this week). Rec: decide game-wide; not tuned here.
5. The Fog Knight stays DANIEL'S PLAYTEST GATE (B9).

Base: claude/batch79 11c4b577 (still current at report time). Concept: scratch/concept-towpath.md (Daniel 10-07, Fog Knight approved ~12:45).

## What was built
**THE TOWPATH** (`src/towpath.js`, id `towpath`, appended to LEVELS; road WAYMEET > TOWPATH > FOG CANAL: canal `needs: 'towpath'`).
Rule line: THE LOCKS LIFT THE WATER, AND THE WATER LIFTS YOU. Greybox art only (plain shapes; the art pass is a Sonnet lane).
- 0 THE LYCHGATE (fork): the church's own lychgate, the hill path (four steps) up to the `tpchurch` door, and the river path down to the bank.
- 1 MILL-POND LOCK (teach): onto the punt, strike its paddle, the water lifts you 6 rows; its low water only wets you (you wade back to the bank).
- 2 THE MILLS (test): drain the race (its paddle on the bank): the wheel slows and stands still, its paddles a stair up to the loft, under the
  loft's crossbow. The tail race's swing bridge (capstan, taught safe), the first grindylow under the far lip, the HEDGE KNIGHT CHAMPION (elite)
  with the cut at your back, then the shrine and the lock-keeper's hut: THE LANTERN.
- 3 THE LOCK FLIGHT (set piece, fog comes in): F1 moored HIGH (drain it from the bank, ride it up); F2 DRY with two bargemen in its bed (fight
  them in the pit, or fill it from the landing and drown them, drain again, ride); F3 in fog under a watchman on the gate beam (ride it dim).
- 4 THE BASIN (remix): the basin's swing bridge (capstan each bank) and a dozing river-rat squad on the far bank (lit, they wake and cross:
  swing the deck from under them); grindylows; the warehouse roofs (ladder, a gap, a watchman; the alley pocket's silver).
- 5 THE LAST LOCK (exam, examSpans: the irons kill): drain X from the bank, jump down its two ledges over the old gate irons under a watchman,
  the culvert, refill Y on its punt under a bargeman's hook, swing the last cut across to THE DECK FOREMAN (elite) + a watchman; shrine after.
- 6 THE FOG KNIGHT's towpath end: the cut under its swing bridge (a capstan each bank), the lock gate's beams (plunge heights), the lock paddle,
  two lock lamps. Gate after the boss.
Rule code: `src/towpath-hands.js` (locks/gates/punts, race+wheel, bridges, lantern lit/dim (E with no gadget in reach), fog bands with lantern/lamp
clearings, watchmen see only the lit, dozers wake to a lit hero, drowning in filled chambers, glint + 10 s nudge via STUCK_HANDS.towpath, the
walker's walkHint). Foes: Waymeet's swornsword/hedgeknight/crossbow early; bargemen/river rats (gaffer, cnSkin), watchmen (archer, cnSkin,
`tpSight`), grindylows (the canal's foe, met first here = the level's one "new" type, no new AI), elites hedge knight + deck foreman.
L.foeHit/L.foeHp by skin (canal men hit like act 4). 2 shrines (cols 151, 313), 3 silvers off route (no relic). Music: synth level bed `towpath`
+ its own ambient bed `towpath` (water lap, weir, owl, drips, paddle ratchet).

**THE FOG KNIGHT** (`src/fog-knight.js` pure fight + `fkPlan` bot; `src/fog-knight-hands.js` binding + greybox drawing). B11 duelist, FULL_DAMAGE:
stances GUARDS HIGH (low lands) / GUARDS LOW (high or plunge lands) / FULL GUARD (only a plunge; it breaks it -> REELING); every angle lands in his
blows' recovery; wrong angle clanks + names the stance (boss-read). Openings (gold ring + bar, x1.6, cap 12%): THE LANTERN BURN (lit lantern within
84 px fills a burn bar, 3.6 s -> armour stands EMPTY 3.4 s) and THE BRIDGE SCATTER (capstan swung while he is in the cut's arc -> EMPTY 3 s); 3 s told
ward after. A boss blow that lands gutters your lantern (E relights). Lit = he sees you; dim = he goes to where he last saw you, tells come late.
P1 FOG LUNGE (!! roll in its last beat; early roll -> TOO SOON); P2 FOG DOUBLE (copies his stance + cut a beat late from your other side; real one's
visor glows; draining the lock grounds it, it refills in 12 s); P3 THE SHROUD (fog floods the arena, thinner per lit lock lamp; once a cycle he
dissolves and steps out at your back with a told cut). B12 dissolve/re-form after 3 quick hits, once a cycle. Pyro's thrown fire "burns the fog":
half a blow whatever his stance, and feeds the burn. Synth theme `fogknight` with :p2/:p3. Rows: boss-greed OPEN_RULE + FULL_DAMAGE (+ DUELISTS in
tools/boss-greed.mjs), boss-read word, marks BY_HAND/ANSWER/HEIGHT (tells --write), threat, bestiary, lab.js branch, BOSS_FELL 'THE FOG LIFTS'.

## Numbers
- Boss, practiced human+dry, campaign L22, 6 seeds a hero: **knight 5/6, warden 4/6, pyro 1/6 = 56% (in band, no hero at 0)**. (Earlier reads: hp 1400 ->
  83%; hp 1850 + harder blows -> 8%; hp 1650 -> 42%; hp 1550 -> 39% pyro 0/6; then the pyro fire rule + hp 1450 -> 56%.) Final: hp 1450, cut 30, lunge 38.
- Mash BOSS 0/6 (knight 0 blows land, warden 93% left, pyro 87% left). Mash LEVEL: every hero dies (knight 3, warden 2, pyro 2 deaths).
- Level-1 pilot: 26 blows, 3 deaths, walked 100% (50 lifts). Curve act 4: 242% lost, 3 deaths (in band). level-quality: GATE += towpath, clears.
- Walker (campaign L22, typical build, 1 seed): knight 0 deaths, arrive 73/69%; pyro 0 deaths, 82/68%; warden STUCK in walker hands (81,41 stile;
  182,26 F3 top) - earlier run warden 1 death, 32% arrival. **MISS vs v2 target (1-2 deaths, arrive < 50%)**: the level is still on the easy side for
  knight/pyro at L22 - see questions.
- Route pilot `tools/towpath-route.mjs` (god, no foes, base movement): **all 7 heroes walk the whole route, 0 lifts.**

## Checks run (green)
towpath (148), one-new-foe, boss-greed, hint-shown, tells, audio-assets, campaign-order, threat-holes, signs, stuck, architecture, checkpoints,
skins, npc-removal, map-grammar, checkpoint-gaps, sprinkle-cap, goblin-lint, homepaths, comments, boss-fight-end, boss-openings, boss-read,
level-jump, corpses, rule-state, answer-tags, level-quality (all gated).
## Red
- **map-spacing (mine)**: an 11th node on the inland sheet leaves no free plate side for canal/theatre and the panel hides fair/burial/witchlight
  plates at every position tried (searched 9 positions x 4 plate sides, with/without a path vertex). Needs the map layout lane (as the minecart's node).
- Pre-existing on base 11c4b577 (verified on a clean worktree): dangling-paths (35 Jenny Greenteeth citations), slopes-trace (canal lip probe 17),
  canal's level-1 pilot row stale (lanterneater merge; re-stamped here it reads a WALL for act 4: 635%/15 deaths - I did NOT commit that canal row).

## Integrator notes
- THE LIT CHURCH hook: ent `tpchurch` (design col 38, on the hill path off the lychgate) with `to: 'church'`; E there calls main.js ctx
  `enterLevel('church')` = `loadThen(LEVELS index, startGame)`; with no 'church' level it says 'THE LIT CHURCH: THE WAY UP IS NOT OPEN YET'. If
  claude/litchurch names it otherwise, change `to` (src/towpath.js) and `fork.church`. Its `needs` can stay 'waymeet' (concept) or be 'towpath'.
- Inserting the towpath shifts the campaign depth of every level after it by one (tools/boss-level.mjs now reads canal L23, theatre L24). tools/fixtures/campaign-xp.json:
  ONLY the towpath row was added (a full --write-xp re-measures every level and was reverted - out of scope).
- tools/level-walk.mjs: a `hold` hint now also holds jump/down and skips the pad-hop (no hop off a rising punt). tools/boss-rows.mjs += towpath.
- New ents: tppaddle, tpcapstan, tplamp, tplantern, tplychgate, tpchurch (+ `tp` flag rows on foes: bargee, tpSight, tpDoze).

## Music picks (CC-BY 4.0, Kevin MacLeod, incompetech.com - read the licence on the page; download nothing until Daniel says yes)
1. "Dark Fog" - Kevin MacLeod - CC BY 4.0 - https://incompetech.com/music/royalty-free/music.html (search "Dark Fog") - THE FOG KNIGHT.
2. "Clean Soul" - Kevin MacLeod - CC BY 4.0 - same page - the towpath at dusk (sections 0-2).
3. "Lightless Dawn" - Kevin MacLeod - CC BY 4.0 - same page - alt for the boss / the night half.
(Synth stand-ins `towpath` and `fogknight` are live until a pick lands.)

## UNVERIFIED
- The boss lab rows don't print his counters: I did not read how often the bot gets burns vs scatters vs plunge reels, nor whether it drains the
  lock under the double in P2 (fkPlan does all of it; tools/towpath.mjs proves each mechanic in a fake world).
- Greybox drawing only checked through checks, not by eye in a browser. Daniel's playtest gate applies to the boss.

## QUESTIONS FOR DANIEL
1. Level difficulty at L22 is below the v2 target for knight/pyro (0 deaths, ~70% arrival). Rec: let the review/sweep lane add one more weighty
   encounter per section (e.g. a hedge-knight champion on the F1 landing) rather than raise foe numbers. Built: foeHit/foeHp by skin only.
2. Grindylows now first appear on the Towpath (one-new-foe: towpath = ['grindylow'], canal = ['willowisp']). Rec: keep (the concept asked for
   "first grindylows"). Built that way.
3. Pyro is the weak hero vs the Fog Knight (1/6). Rec: keep her fire-burns-fog rule and look again in your playtest. Built: 56% overall.
4. The map node: rec a map-layout lane re-spaces the inland sheet for the 11th node. Built: node in road order at (31,137), plate left.
5. The lychgate is drawn as the church's own (roof + lamp), not Waymeet's prop (A8). OK?
