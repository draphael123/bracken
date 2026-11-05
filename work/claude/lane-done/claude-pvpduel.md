# PVPDUEL lane (claude/pvpduel, opus, 11-05) - DUEL (BETA): a basic PvP mode for the demo

Branch `claude/pvpduel` off master 42a1d4cd, worktree `bracken-lanes\bracken-pvpduel`. NOT merged, NOT deployed. Code-only lane: NO browser was opened.

## Design plan (written before the build)
- **Arena:** the tavern's DUEL PIT is the way in; the fight happens in a new small hidden ring, `duel_pit` (26x20 tiles, walled, three oak one-way planks). It is not new art: it wears THE ARENA SET (the Arena Yard's sand, ashlar, planks, crowd stand). A fresh level was needed because the tavern pit is decoration inside the inn and the Arena Yard is 164 tiles of training stations with dummies that attack you.
- **How heroes hit each other:** each seat gets a PROXY in `enemies` (`t:'duelist'`, `pvpSeat` = the body) that stands where he stands. Every kit already hits enemies, so every move, skill and projectile reaches the other hero with no per-kit code. `hurtEnemy` sends any blow on a proxy straight to `src/pvp-duel.js`, BEFORE any foe rule runs. The blow goes onto the victim through the game's own `damagePlayer`, so his guard, parry, roll, ward, catch and duck answer a hero's blow exactly as they answer a foe's. A seat's own proxy is OFF during his own pass, so he cannot hit himself or auto-aim at himself.
- **Whose blow:** inside a seat's pass, the blow is that seat's. Effects that the world moves outside the passes (embers, meteors, pyres, blood bolts, balls and so on, 26 arrays) are tagged with their owner after each pass. A blow from one of them is credited to the nearest tagged effect, and a seat's own effect never hurts him.
- **PvP-only rules (PvE is untouched):**
  - Every seat hits at his L1 weight (level and smith edges divided out), times 0.8, on a PvP pool of 100.
  - 0.4 s of grace after a landed blow (PvE gives 0.8 s).
  - Anti-juggle: the 3rd blow inside 1.5 s gives 1.1 s of grace and shows BREAK.
  - No flasks.
  - No death cost (`openYard`). A K.O. is a co-op DOWN that nobody can lift and that never sends anyone to the shrine.
  - Sudden death at 90 s: blows ramp from x1.5 to x3 over 45 s. At 150 s TIME is called and the higher health share takes the round.
  - No ring-out: the ring has no hazard.
- **Rounds:** best of 3 (first to 2). Each round starts ROUND n, 3-2-1, FIGHT!; it ends on K.O./TIME/DRAW. A double K.O. is a drawn round. After 5 rounds the most round wins takes the match, or it is a drawn match. Then the winner screen (REMATCH / BACK TO THE INN).
- **Points and rankings:** 10 points to the match winner and 2 per round won. They are stored per SAVE SLOT on this device under one localStorage key, `bracken.duelRanks`, never inside a save file. Erasing a save removes its row. The RANKINGS board shows wins, losses and points.

## Built
- `src/pvp-duel.js` (new) holds the rules, the round machine, attribution, rankings, the bot brain and the runtime `makeDuel(api)`. It also draws the HUD: per-seat bars in each seat's colour with round pips; over-head bars; the clock and SUDDEN DEATH xN; the count; the banners; the winner screen with the rankings; the DUEL (BETA) card. Hit feedback: every landed blow floats `P1 -8` in the hitter's colour over the victim, plus BREAK and K.O.
- `src/duel-pit.js` (new) builds the ring. `src/level.js` appends `duel_pit`, hidden (no index moves). The demo slice allows hidden levels, so it is in the demo.
- `src/main.js` hooks:
  - `hurtEnemy` early route.
  - `updateEnemies` and the draw skip proxies.
  - `damagePlayer0`'s `pvpBlow` skips the foe tables, difficulty, co-op take and the red number.
  - `die` / `coopWatch` / revive / `tryDrink` guards.
  - `duelPass` (proxy sync and owner tags around each pass); hands before the buffers; `DUELO.post` after the passes.
  - `asSeat`, which gives player one his own hero when he is hit inside another seat's pass. Plain `asPlayer` keeps the running seat's `PROG.hero` there.
  - `duelNorm`, `duelEnter` / `duelLeave` / `duelAtPit`.
  - The title row **DUEL (BETA)**, the pause menu "Return to map", the arena-set art hooks, `eraseSlot`, and `BK.duel()`.
- **Tavern entry (Daniel's 11-05 add):**
  - The DUEL PIT station opens the **DUEL (BETA) card**: the seats with their heroes, BEST OF 3, FIGHT, BOT HERO (only when alone), RANKINGS, CLOSE.
  - Heroes change at the wardrobe, and friends join as in co-op.
  - The pit's board now reads DUEL (BETA) instead of COMING SOON.
  - Returning from a duel puts the party back in the inn, standing at the pit.
  - The title row goes to the inn with player one at the pit and the card up.
- **Bots:** with one person, the opponent is a bot of the hero he picks. A bot duel is PRACTICE and is not ranked. Bot seats never follow the party out.
- **Tools:** new `tools/pvp-duel.mjs` with sections pure / sim (node) and duel (browser, owed). These skip lists gained `duel_pit`: audit-lib, dressing, level-reach, one-new-foe, sealed-pyramid, ambient-landmarks, geom-report. `tools/tavern.mjs` now expects the pit's card when PVP_SHIPS is on.

## Flag
`PVP_SHIPS` in `src/pvp-duel.js` (true). Setting it false hides the title row, the tavern card and the rankings, puts back the COMING SOON board and line, and makes `duelEnter` refuse.

## Online: YES, free
Online co-op is host-streams / guests-send-inputs: an online guest is just a seat on the host. A guest who walks into the inn can duel with no netcode work, and is drawn and hit like a local pad. Caveats:
- The guest plays through the stream's latency, which is unfair against the host in a reaction duel. Rec: label it.
- A guest is not ranked, because his save is on his own device.

## Node results (no browser)
- `node tools/pvp-duel.mjs pure,sim`: all ok, 45 pure checks and a 216-match abstract sim. Every match ended (500 rounds, 0 by time). The abstract win shares say nothing about balance: equal DPS was built in.
- `node --check` passes on main.js, level.js, tavern.js and tavern-art.js.
- Ran individually, ok: dressing, one-new-foe, sealed-pyramid (240), ambient-landmarks, geom-report, checkpoints, checkpoint-stand (71 levels), music-levelstart, signs, skins.
- Also ok: platforming-lint (rc 0; its FAIL(rpt) rows are on wood / burning / hanging only and have nothing to do with the duel), ground-depth (71 levels), goblin-lint, push-blocks, shop-theme, answer-tags (duel_pit listed with no tags, as expected).
- NOT run: visible-supports (it was slow, so I stopped it), and occluders, foe-footing, threat-holes, ambush-listed, npc-removal. These are pure node tools for the nightly suite; I did not run anything that opens a browser.

## Browser owed (proof lane, one browser)
1. `node tools/pvp-duel.mjs duel`: AI vs AI for all 36 hero pairs at N=2, then N=4 for any hero near the 80% bar. It checks that every match ends, blows land, there are no flasks, and no hero wins over 80%.
2. `tools/tavern.mjs stations`: the pit opens the card.
3. Hand play or a screenshot check:
   - FIGHT from the card with 1 human (bot), 2 local pads, and an online guest.
   - The count holds hands; K.O. and the round banner; the winner screen JUMP = rematch, E = back to the inn at the pit.
   - Pause → Return to map → inn.
4. Kit audit in the real game. Each hero's projectiles and skills should reach the other hero and never himself. Watch the pyro pyre / flame ring, the reaper's risen and blood bolts, the warden's spear rain, the pirate's balls / kegs, and two of the same hero (shared arrays). `BK.duel().debug().stats` gives self / nobody / landed / blocked.
5. HUD layout:
   - The duel's top bars against the co-op HUD plates, at 2-4 seats.
   - The title list fits with one more row (touch included).
   - textfit of the card and the winner panel.
6. Proxy side effects to watch: the foe-react / pack-glue / attack-token frame (RX.frame, GLU.frame, tokenPost) sees two alive 'duelist' entries. They are skipped in updateEnemies and drawn nowhere, but those frames read enemies directly. Also: out-of-pass homing (embers) may chase its own caster's proxy. It does no damage, but the shot is wasted.
7. Tuning: `DUEL.scale` 0.8 / `hp` 100 / `iframe` 0.4 are first guesses. Aim for ~10-14 plain blows to a K.O.

## Questions for Daniel (rec first; the rec is built)
1. Where is a duel fought? **REC (built): a small ring of its own (`duel_pit`) in the arena art, entered from the tavern pit.** Alt: fight inside the tavern room itself (cramped, and stations are in the way).
2. Do bot duels count for the rankings? **REC (built): no, they are PRACTICE.** Otherwise points can be farmed off a bot.
3. Rankings scope: **REC (built): per save slot, on this device, outside the save file.** Online board LATER (it needs a backend: the coop-progress step 2 / accounts lane).
4. Hero level: **REC (built): normalised, so every seat hits at his L1 weight.** Gear mitigation and talents still count (a small edge).
5. Online duels: **REC (built): allowed (free), with no ranking for guests.** Add a "LAG: HOST ADVANTAGE" line on the card later.
6. Should the demo cut ship it? **REC: ship only if the browser-owed items 1-5 pass by SAT. Otherwise set PVP_SHIPS=false (one line) and the pit goes back to COMING SOON.**
