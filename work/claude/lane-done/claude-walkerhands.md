# claude/walkerhands - THE WALKER'S V2 HANDS (tools/level-walk.mjs)

Brief: raise the campaign-level walker's route coverage toward ~80% and make its deaths mean what a player would suffer, before the per-act
difficulty sweep leans on it. Base claude/levelpilot 92a06720 (walker + survival flasks + marsh/causeway pilot). Port 8716. Bot-side only:
no level or game code changed; the legacy bot and every lab row are byte-identical (src/lab.js only gains an export nothing else calls).

## BUILT
- **ELITE DUELS** (src/walk-duel.js + src/lab.js `labDuelFrame`): an elite on the hero's floor (footing all the way, no water/pit between) within
  9 tiles ahead / 4 behind is fought with the elite lab's own hands (labBotFrame, ~80% human wins in docs/elite-lab.json) under the human gates
  (no swing into a tell, a late roll, half a roll's wind kept), plus the elite's READ from src/elite-kit.js / main.js: guard by angle -> the LOW
  (sweep / crouched trip or poke goes under it and is no cut of the mash); one cut short of the act's mashAt (thornAt for THORNED) he goes low;
  the riposte (yellow !) blocked by a shield / deflected by the warden / stepped out of; the spines (red !!) stood off past their ring; his floor
  mark stepped off; his own tells answered by the lab's defence; while OPEN the lab's cuts go all in. A common foe on top of him is cut first.
  20 s without landing a blow or 90 s in all = written off for 30 s (a gate he holds is then a STUCK). Duel hysteresis: judged again on landing.
  Each row prints `elite duels: kind/AFFIX@x WON|lost secs hp->hp`. `--duel=0` = the old hands.
- **THE MINI HANDED OFF** (`--mini=0` = stop at his door as before): his door hp is kept, he is put down the game's way (BKT.hurtEnemy: his wall
  and gate open, XP paid) and the walk goes on; the section after the door is `postMini` and its arrival is left out of the means. A level-up
  card is tapped through.
- **LEVEL VERBS = BK.walkHint** (the Ksar lane's interface, mirrored unchanged: `{x, y(feet), key, face, r}` + `hold`): the walker asks
  `BK.walkHint()` first (a level module's own), else **src/walk-hints.js `WALK_HINTS[levelId]`** - the same shape, written bot-side, so a level is
  taught without touching its code. Glass sea: the mirrors (it traces the beam with light.js for every notch of the 3 mirrors nearest the next
  unfused bed / ring crack, walks to the first mirror off its notch and turns it, then waits on the bed while it fuses). Documented in both files.
- **Hands**: a climb over ~3.4 rows is a STAIR taken one footing at a time; a slick slope before a gap: hold DOWN and leap at its foot (the glass
  sea's slide gap); a shut lockgate with its key in the open on his floor: the key first (handed to the bot's own key walk); hunts (a locked
  room is a fight) only on his own floor; `--tracefrom=F --tracen=N` for debugging.
- tools/level-walk-selftest.mjs green at every commit.

## COVERAGE AND DEATHS (54 runs each side; full tables in scratch\walker-baseline.md "V2 HANDS")
Coverage mean **39% -> 60.5%**: marsh 32->45, scree 31->56, crown 39->49, causeway 60->80, caravan 64->83, glasssea 9->50.
Elite duels: 77 of 95 won; marsh elite deaths 21 -> 3 in 9 runs; scree/causeway/crown/caravan elites now fought and mostly won (were STUCKs).
Deaths split (foe/elite/hazard) per row are in the baseline. Hazard deaths remaining are concentrated bot limits: crown fire scaffold
(warden 8/run), marsh ferry (warden drowns), glasssea flats cracks (pyro).

## STILL NOT WALKABLE (bot limits; sections not measured)
marsh 229,17 (bank -> river pads), 124,18 (warden), ferry 168 (warden drowns); scree 205,5/210,4 ledge stair, 427,13; crown 737,63 / 746,57 /
688,47 (iron-key hall + the climb back over it), 384,45, warden never past the fire scaffold x123-140; causeway 81,27 (first tide guard
written off on some seeds), 362,26, 426,23, 545,23; caravan 363,29 (knight: LOCKED); glasssea 360,27 (the HEAD's chained mirror B on the top
board), 459,33 / 231,43 (warden). Not built: doors that warp between floors and lift/basket/cart boarding (none of these six levels needed
them on the measured routes; the play bot's own door logic is unchanged).

## CHECKS RUN
level-walk-selftest ok (each commit). Full 54-run walker baselines before and after. src/lab.js change is an added export only (legacy +
every lab row unchanged by construction). No suite (shared PC). Nothing red known from this lane.

## QUESTIONS FOR DANIEL
1. **Mini hand-off** (built): at the mini's door the walk keeps his door hp, puts him down via the game's own kill path (XP paid, gate opens) and
   walks on; post-mini arrivals are excluded from means; boss-rates stays the mini's measure. Rec: yes. Alt: stop at the door (`--mini=0`).
2. **WALK_HINTS bot-side table** (built) vs each level module exposing BK.walkHint. Rec: both - a level lane that owns its module adds
   BK.walkHint (the Ksar did); for levels nobody owns, the per-act sweep lanes add a row to src/walk-hints.js (no game code touched).
3. **Elite write-off** (built: 20 s with no blow landed / 90 s in all, then a STUCK at his gate). Rec: keep - an elite the human-gated duel cannot
   hurt in 20 s is a bot limit, not a measured death.
4. **Merging origin/claude/ksar**: its tools/level-walk.mjs was branched from the pre-levelpilot walker and would drop --from, the flask booking,
   the elite death tags and the pad hands. Rec: on merge take this branch's level-walk.mjs (the walkHint interface is already mirrored here,
   unchanged) and keep ksar's src/ksar-hands.js BK.walkHint as is.
5. **Read hazard and elite deaths apart** in the per-act sweep (the table splits them): rec - judge the 1-2 death target on FOE + ELITE deaths
   and arrival hp; hazard deaths at the listed spots are the bot's platforming.
6. Coverage is 60%, not 80%: the remaining STUCKs above are each a level-specific verb or platforming chain. Rec: a short follow-up (Sonnet is
   enough per level) only for the levels a sweep lane is about to tune; the 80/83% levels (causeway, caravan) are ready now.
