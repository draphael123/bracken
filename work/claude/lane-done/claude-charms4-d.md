# charms4-d - TWELVE MORE CHARMS, earned by feats (dark behind CHARMS3_SHIP = false)
Branch `claude/charms4-d` off `claude/charms3-d` f042d311c (so it carries the LANTERN / veteran-fall / salt fixes). Worktree `wt-charms4`. Not merged, not deployed; `CHARMS2_SHIP` and `CHARMS3_SHIP` stay false, `coord/desktop` untouched.
Flag pattern = CHARMS2 exactly: flag off -> `rows()` empty, `worn()` null for every id, every multiplier exactly 1, nothing written to a save; page-only override `window.__CHARMS3 = true` (env `BRACKEN_CHARMS3=1` in tools/cdp.mjs). New: `src/charms3.js`, hooks in `src/main.js`, 12 icons + a 3rd pass on THORN / SALT / PILGRIM in `src/art.js`, `tools/charms4.mjs` (node), `tools/charms4-play.mjs` (browser), `tools/charms4-sheet.mjs` (node icon sheet), `tools/charms3-sheet.mjs` (labelled 26-icon sheet).

## What the 14 + my first 7 cover, and what was still empty
| lane | covered by |
|---|---|
| income | LUCKY, GAMBLER |
| survival | IRON, HEART, STONE |
| offence | HOUND, THORN |
| movement stats | FEATHER, SWIFT |
| medal clock | RIBBON |
| exploration / info | LANTERN (walls), SALT (purse) |
| stealth | QUIET |
| progression | PILGRIM |
| (my 7) silver finding, navigation, timing forgiveness, camera, hazard reading, foe info, co-op | MAGPIE, NORTH STAR, SURE FOOT, SCOUT, RED THREAD, BONE-READER, BROTHERHOOD |
Still empty, aimed at by the five new ones: **map / secret memory between runs** (CARTOGRAPHER'S INK), **purse / death economy that is not insurance** (GRAVEDIGGER'S SPADE, a trade), **medal-run tools** (HOURGLASS), **boss-fight READABILITY that is not power** (TELL-LENS, a trade), **walked-ground memory in mazy woods** (BREADCRUMBS). None is a hero trait (the traits are moves and hit rules: AIR ROLL, LIGHT STEP, MOMENTUM, HANGING CUT, SLIPSTREAM, EXECUTIONER, each hero's passive); none adds damage or mitigation; none touches flasks.

## THE TWELVE
| # | name | effect | trade-off | the FEAT (shop line) | veteran save | price | tier |
|---|---|---|---|---|---|---|---|
| 1 | MAGPIE'S EYE | silver within 14 tiles glints; an edge pip points to the nearest off-screen one | - | all 12 silver of the first four woods (n of 12) | **credited** (reads the saved silver) | 70 | early |
| 2 | SURE FOOT | coyote grace x1.5 after a ledge | **jump launches 4% slower** | clear 3 woods in a row without a fall (n of 3) | must do again (an evening) | 80 | early |
| 3 | CARTOGRAPHER'S INK | world map pins the 3 silver pips and the medal on every wood | - | all 3 silver of one wood without a fall | **credited** at 3+ fully-silvered woods | 60 | early |
| 4 | GRAVEDIGGER'S SPADE (hidden: the row shows `???` and a riddle) | a dropped purse is found from 2.2x as far | **only 4 in 5 coins come back** | riddle: "what a thief carries, a hunter returns" = take back a purse a FOE was carrying | must do again | 50 | early |
| 5 | NORTH STAR | after 20 s without getting 8 px nearer the exit, an edge arrow points to it | - | win gold on a wood the first time you clear it | **credited** at 40+ woods cleared | 70 | mid |
| 6 | SCOUT'S CAP | the camera leads 28 px further ahead | **28 px less seen behind** | win gold with the SWIFT CHARM worn (chain) | must do again; needs SWIFT bought (80) | 60 | mid |
| 7 | RED THREAD | spikes outlined in red within 5 tiles | - | clear a wood with spikes and never touch one | must do again | 70 | mid |
| 8 | BONE-READER | a struck common foe shows a health bar (never a boss) | - | beat a mini-boss without taking a hit | must do again | 70 | mid |
| 9 | BREADCRUMBS | a trail of crumbs where you have already walked this wood | - | clear one wood with three different heroes (n of 3) | must do again (one pass per hero) | 60 | mid |
| 10 | BROTHERHOOD KNOT | an ally you lift is up in 2/3 of the usual time | - | revive an ally in the middle of a boss fight (co-op) | must do again | 80 | hard |
| 11 | HOURGLASS | a clock beside the charm shows seconds in hand against the next medal | - | win gold with the RUNNER'S RIBBON worn (chain; the ribbon itself needs 45 medals) | must do again | 90 | hard |
| 12 | TELL-LENS | a foe winding up a blow (boss too) is ringed in red | **the screen corners darken** | beat a boss without drinking a flask | must do again | 100 | hard |
Tiers 4 early / 5 mid / 3 hard. Four trade-offs (SURE FOOT, SPADE, SCOUT, TELL-LENS). Mix of feat kinds: region silver, no-fall streak, one-life silver, riddle (hidden), first-time gold, two chains (SWIFT then gold, RIBBON then gold), no-spike clear, no-hit mini-boss, three heroes on one wood, revive under pressure, no-flask boss.

## How feats are counted (cheese rules, one place: `c3Clean()` in main.js)
A feat counts only on a real run: not under assist / god mode (`assistOn`), dev, the maker, the rush, a boss jump, co-op, nor a hidden non-secret wood; the first wood (`wood`) counts for nothing in any feat (nothing is earned by accident on level one). The streak, the one-life silver and the clean clears also need `deaths === 0` in the wood. BROTHERHOOD (co-op by nature) and the purse feat use the same guards minus the co-op rule. Counted at the same place medals are (`winLevel0`), so every exclusion medals have applies.


## FEATS PROVED EARNABLE (tools/charms4-play.mjs, real page, real `winLevel0` / mini / revive / purse code; "counter fired" = through the real game path, not a unit stub)
| feat | proof | what it shows | caveat |
|---|---|---|---|
| silverin | the first four woods (wood, marsh, stockade, spore) each hold exactly 3 silver ents | 12 exist; the feat reads the persisted mask | - |
| firstgold | win on marsh (2nd wood) with a gold on a first clear: fires; on `wood`: does not; on a replay: does not (node) | reachable on the real clock (gold with a short stay; a real run is slower but the gold times are the existing medal times) | a bot did not RUN the wood; the win call was made at the level start |
| swiftgold / ribbongold | win on marsh with SWIFT / RIBBON worn: fires; with IRON: does not | the chain works | the ribbon itself needs 45 medals |
| clean:3 | wood + three real woods won in a row, streak 3; a death resets it to 0 | counter + reset | - |
| cleanspikes | the STOCKADE has spike tiles: win without touching one fires; `C3.run.hazard=true` (what `spikeBite` sets) spoils it | the level and the counter | the wood was not WALKED by a bot; spikes are avoidable by design |
| bossnoflask | MARSH has a boss arena: a win with `flaskHud.levelDrinks === 0` and no death fires | counter path | **NOT proved winnable**: bosses are tuned WITH flasks (win band 60-70% with); a no-flask kill is the hard tier on purpose. A boss-run bot with flasks disabled is owed |
| silver1life | all 3 silver of marsh picked up with the hero (teleported on to each) then a win: fires; 2 of 3: does not | the pickup hook counts | - |
| heroclear | knight, pyromancer, ranger each win `marsh` (no reset between): 3 OF 3 | - | - |
| minino | the KINGS wood's mini-boss: killed with no blow taken fires; one damagePlayer before the kill spoils it | the real `miniEnd` hook | the mini was killed by a 99999 hit, not fought |
| bossrevive | co-op (knight + ranger ally) in the KINGS mini fight: ally downed (down 20), player one stands by him, up: fires | the real `reviveBy` hook inside a fight | a mini-boss fight stands in for a boss fight (same `miniActive || bossActive` gate) |
| purseback | die carrying coins to a foe, kill the carrier, walk onto the purse: fires; a plain spot purse: does not | the real `dcTouch` path, `where === 'foe'` | - |
| cheese | assist (invincible) win and a co-op win count for NO feat (firstgold and streak stay 0) | `c3Clean()` | level-jump / playtest URLs: covered by `isDev()`, `bossJumpOn`, `rushOn()`, `edTesting`; **not run through the URL** |
Node (tools/charms4.mjs) adds what must NOT count: first wood, replays, wrong charm, silver not gold, a fall in the wood, a spike touched, a hit taken, an AI or seat lifting, a spot purse, two heroes on different woods, cheated runs.

## Effects proved (same tool)
SURE FOOT coyote 0.15 vs 0.10 s, apex 46.7 vs 50.7 px (-8%, 4% slower launch); SCOUT'S CAP camera 28 px further ahead; BONE-READER first-blow hp kept, never a boss; MAGPIE edge pip at 11 tiles (25 px differ, noise 0), none at 20; NORTH STAR no arrow at 5 s, arrow (81 px) after 22 idle s; SPADE a purse 26 px away taken only with it, 11 coins -> 8 back; HOURGLASS clock pixels 153 differ; TELL-LENS corners darker (20441 vs 28625) and ring; RED THREAD near 603 vs 454 red px (control) and far 580 vs 549; BREADCRUMBS 7 crumbs after a walk, 0 without; INK silver pips 7 vs 0 on the map; BROTHERHOOD lift clock x2/3 (and the revive feat above).

## The shop at 27 rows (NONE + 26)
- Desktop 1280x720 and phone landscape 844x390 (touch): 9 rows visible, the `v`/`^` marks, scroll by selection, a touch on the ninth row selects it; buy / wear / swap / one worn pass; textfit store scope with all 26 on is in the checks list.
- **Built the recommendation: a lock-state sort** (flag on only): NONE, then everything you can wear or buy in the old order, then the locked rows by tier (early -> hard). 27 rows stay a slog if the locked ones are mixed in, so the buyable ones now stay on top; the riddle row shows `???` and its line until earned (also in the Unlocks list). Screenshots: `desktop-*` and `phone-landscape-*` in `bracken-scratch/desktop-out/charms4/`.
- Not built (recommend later if 27 grows): tabs or collapsible groups; the sort is enough at this size.

## Icon sheet (`bracken-scratch/desktop-out/charms4/icon-sheet.png`, all 26, labelled, from the real baker; `iter.png` is the unlabelled node-only one)
Read as their object at 1x: BONE (a bone), HOURGLASS, TELL-LENS (a magnifier), BROTHERHOOD (two linked rings, blue + red), NORTH STAR (a four-point star), SURE FOOT (a horseshoe), CARTOGRAPHER'S INK (an ink bottle with a quill), SPADE (a shovel), BREADCRUMBS (a loaf with crumbs), REDTHREAD (a spool), SCOUT'S CAP (a green cap with a red feather). Weakest: **MAGPIE'S EYE** (a white eye with a spark: reads as "an eye", not a magpie's), **SCOUT'S CAP** (a green blob until it is large), **RED THREAD** (the red checker on the spool reads as plaid cloth). The 3rd pass: **THORN** is now a bramble twig with cream thorns and a leaf (good), **SALT** a wooden bowl heaped with white salt (good), **PILGRIM'S KNOT** a woven rope ring with two tails (better than the ball; still more "rope ring" than "knot").

## Checks (all exit 0)
node: charms2, charms4 (new), unlocks, shop-gates, traits, talents, coop-progress, progression, architecture; `node --check` main / art / charms3 / unlocks. Browser, one at a time: tools/charms4-play.mjs (shop at 27 rows desktop + phone, 12 effects, 12 feats + cheese; run in two pieces: the first full run failed 3 probes of mine that I fixed - an input name, a camera clamp, a draw-only frame - and section 4 alone was re-run with `ONLY4=1`), textfit store scope with every charm on. Not run: check.mjs, gates, the other textfit scopes.

## OWED / UNVERIFIED
- A bot RUN of cleanspikes (Stockade), bossnoflask (Marsh boss with flasks disabled), minino (a fought, not one-hit, Kings mini), firstgold and silver1life as played; only the counters were fired through the real hooks.
- bossrevive used a mini fight; a real boss fight shares the gate but was not run.
- Level-jump / playtest URL cheese not exercised through the URL.
- QUIET BOOTS (previous lane) still reaches only some foes.
- ONLY4=1 skips sections 1-3 for a quick re-run; a final all-in-one run of the tool was done before the last section-4 probe fixes (sections 1-3 passed unchanged in that run).
## QUESTIONS (rec first)
1. Flip CHARMS3_SHIP after CHARMS2_SHIP ships? REC: yes, together or next, after Daniel looks at the sheet; keep the hidden SPADE riddle.
2. Raise or lower the veteran credits (firstgold at 40 cleared woods; silver1life at 3 full-silver woods)? REC: keep.
3. bossnoflask is the one feat I could not show is winnable; REC: keep as the capstone but run the no-flask boss bot before shipping, and swap it for "beat a boss without being hit" if the bot fails.
