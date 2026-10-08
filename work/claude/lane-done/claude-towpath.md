# claude/towpath - THE TOWPATH greybox + THE FOG KNIGHT (2026-10-08, Opus)

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
