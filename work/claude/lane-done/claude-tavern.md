# claude/tavern - THE TAVERN, CO-OP PHASE 2 (opus)

Branch `claude/tavern` off master e0436ee8. Brief: scratch brief-tavern.md (Daniel approved all recs 10-12) + brief-onlinecoop.md 'ADDED 10-03'.
The ARENA PIT stays COMING SOON (next week's ARENA lane builds on this).

## WHAT IS BUILT

### The place: WAYMEET'S CROSSROADS INN (hidden level `tavern`, appended to LEVELS - no index or save moves)
One warm 68x26-tile room (src/level.js `theTavern`, layout in src/tavern.js `ROOM` / `STATIONS`): the fireplace (hearth), two long tables with benches and
Waymeet's own drinkers (the beer garden's `guest` props), the bar (counter, cask rack, mug shelf, kegs), a window onto the road, torches, a carpet;
the training yard at the back; the arena pit roped off at the east end. Ambient `tavern` (the town crowd low-passed + a hum + the fire's crackle),
music `store`. No foe, hazard, coin or pool; `openYard` so there is no death cost. Greybox furniture for the stations (plain fills in src/tavern.js `draw`).

### Reach (co-op open from the start - the lock was already gone on master since coopjoin 10-15; old saves fine)
- Title **LOCAL CO-OP** -> into the inn. Title **ONLINE CO-OP** -> into the inn with the online room card up (HOST A GAME / JOIN).
- Map **F** -> into the inn (was the co-op on/off toggle; footer now `F TAVERN  G ONLINE`, touch pill `TAVERN`). CO-OP OFF stays in the pause menu.
- The party comes and goes with P1: whatever party is armed walks in with him; the door / table take it back out to the map.

### Joining (up to 4, local + online mixed)
- **Local walk-in**: in the inn, any pad that is not a seat's and not the one P1 last played on pressing JUMP or START seats a new player on THAT pad.
  He appears in the doorway and the room walks him in (0.9 s), then lets go of RIGHT. Hero = the first free starter not already in the party.
- **Online walk-in**: src/online.js now hosts up to THREE guests (one stream, one media call each; each guest's keys drive his own seat, keyed by a
  guest id). A guest who picks his hero walks in through the door as the next seat (P2..P4). Full party -> the guest is told THAT GAME IS FULL.
  He leaves -> only his seat goes. In a wood a guest still stands up beside P1; on the title/map he joins the party for the next wood.
- **Seats**: `players` holds up to 4 bodies; each carries `src` (`pad` + index, `online` + gid, or the ALLY). pollGamepad hands each seat its pad /
  guest (a seat with no pad named takes the next free pad in seat order = today's P2 rule; P1 takes the first pad left). `coopWant.seats` carries
  the whole party into the next wood (coopWant.hero/ally kept for every old reader). The fifth join is refused ("THE INN IS FULL").
- P2..P4 HUD plates stack down the right; the victory/win tally card still compares P1 and P2 only (see questions).

### The stations (walk up, INTERACT: E/T, UP on a pad, the touch USE button names the station)
| Station | What it does |
|---|---|
| DOOR (west) | the walk-in door (opens while somebody walks in). P1: OUT TO THE MAP with the party. P2-P4: LEAVE THE PARTY (others close up). |
| INVITE BOARD | opens the online room card (HOST A GAME / JOIN A FRIEND); while hosting, the four-letter code is chalked on the board's slate. |
| CAMPAIGN TABLE | THE ROAD: the party as it stands goes to the map armed; the next wood starts with all of them, each on his own pad / link. |
| WARDROBE | that player's OWN card (driven by his own hands, several at once): HERO (P1: heroes his save owns; P2-4: the co-op roster, duplicates allowed), WEAPON (the weapon skins the save owns; P1 writes his save, P2-4 their seat), COLOUR (8 colours; never one another seated player wears), RING (floor rings on/off). The card holds his feet; INTERACT/X/dodge closes it; walking/thrown away closes it. |
| PARTNER DRILLS board | names the three drills; a chalk tally of each (PROG.tavern.drills). |
| SPARRING BELL | a partner (the nearest other) goes DOWN for 12 s: stand on him to lift him = REVIVE drill. Left alone he is stood up ON YOUR FEET (no death, no shrine, no cost). Alone: "it wants a partner". |
| TRAINING YARD | two straw dummies (respawn like the open yard): TEAM HIT = two different players' blows on one dummy inside 1 s. The HAY TARGET: a partner thrown (the partner throw) landing within 22 px of its centre = BULLSEYE. |
| PRACTICE door | the Practice yards list (the game's Practice mode now lives here too; the title row stays). |
| ARENA PIT | roped off, sign SOON; INTERACT: "THE ARENA PIT IS ROPED OFF: FRIENDS AGAINST FRIENDS IS COMING SOON." |
| First visit | every unused station glints (sparkle + bobbing mark) until used once (PROG.tavern.seen); the first approach to each says what it does. |

### Colours, rings, tags
8 colours (src/party.js COLOURS), seat defaults P1 gold / P2 green (as always) / P3 blue / P4 rose, saved in PROG.tavern.colours. Each hero gets a
floor ring in his colour (drawn in two halves: the far half behind him, the near half over the floor's near layer and the night wash, so it always
reads and never covers his legs) and a P1..P4 tag over his head; the HUD plate's name and the downed tag use it too. Two seats never share a colour.

### The shared camera + the leash (numbers in src/party.js)
- ONE camera, the midpoint of the upright players (as before), no split screen, one stream for guests.
- **Party view** ('coop' view mode): one whole pixel-scale step out from the normal view, capped at **1.25x (400x225)** - e.g. 1280x720 -> 400x225,
  1920x1080 -> 384x216, 2560x1440 -> 365x205. On with **3-4 players always**; with 2 when they spread past **60% of 320 px across (192)** or 55% of
  180 down; back to normal once inside **40% / 35% for 1.2 s** (no pumping). Boss/mini zoom (wider) still wins.
- The frame stays a wall across (the existing soft stop, 10 px edge).
- **Leash**: a player is too far behind when he is **off the picture by > 40 px up or down**, or the party is **stretched across >= 90% of the frame
  while the leader pushes on at the front edge** (and he is the back one). Told for **1.6 s** (a dotted rope in his colour to the leader, CATCH UP +
  a meter over his head), then a **puff**: smoke where he stood and where he lands, PULLED ALONG, beside the leader (14 px behind him), **1 s grace**.
  The meter drains at 2x when the reason goes. Never a downed, dead, carried or thrown hero; never into the air (waits for the leader's feet).
  Leader = the upright hero nearest the exit gate (the furthest right without one).

### Save compatibility
PROG.tavern = `{ seen, colours[4], ring, drills{throw,revive,team} }` - optional. `cleanTavern` reads any shape (missing, null, string, array,
garbage colours/drills) into a whole record and never throws. An old save with no record loads, plays the inn, and gets the record written back;
nothing else in the save moves (tested against the same save loaded+saved without the inn: only normal play bookkeeping - heardMusic, coopTips,
crouchFirst). Runtime-only party state (coopWant, seats) is never saved, as before.

### Join snapshot (coordination with brief-coopprogress step 1, portable guest saves)
Defined here (it landed first): the guest's hello is `{ t:'hi', v:2, snap? }`, snap = `{ hero, level, sword, colour }` from HIS OWN save. Phase 2
reads only `snap.colour` (his seat colour if free); the guest page sends no snap yet (it still never reads the save). Step 1 fills snap from the
chosen slot, spawns the seat from it and adds the reward messages; the host already keeps `q.snap` per guest. `go` now carries the seat number.

## FILES
New: `src/party.js` (seats, colours, camera, leash, drills - pure), `src/tavern.js` (stations, drills, glints, wardrobe cards, greybox draw, ART list),
`tools/tavern.mjs`. Changed: `src/main.js` (seats/party, pollGamepad, camera view + leash, rings/tags/HUD, tavern glue + BK.tavern, title/map
entries, dummy-hit + revive hooks), `src/level.js` (theTavern + LEVELS entry), `src/online.js` (multi-guest rewrite, same board/test surface),
`src/online-guest.js` (v2 hello, seat number), `src/online-net.js` (full text), `src/touch.js` (TAVERN pill), `tools/check.mjs` (tavern wired in).

## CHECKS (PORT 8737, relay 8738, one browser at a time)
- **tavern (new, tools/tavern.mjs): GREEN, 116 asserts** - pure (party/tavern tables, cleanTavern on 10 save shapes, view sizes at 8 displays,
  camera hysteresis, every leash case, the room's geometry) + join + stations + camera + leash + rings + save + online (two browsers: a guest walks
  in through the door as P3 beside a local P2, his keys drive his seat, the code is drawn on the board, a full party tells a guest THAT GAME IS FULL).
- **online-coop: GREEN** 3 of 4 runs (one run had 2 fails I could not reproduce in three reruns - two browsers beside the BATCH101 gate; flagged).
- **ending, death-cost, save-safety, titlescene, touch, leveling, map-footer, zoom-coverage, hint-shown: GREEN.**
  hint-shown: the inn's words go through the hint box (callout), not number() (words do not float); the silent baseline shrank by one
  (the map's old CO-OP OFF) and was rewritten with --write as the tool says.
- **partner-throw: 1 RED, PRE-EXISTING** - "a boss takes a CHIPPED hero blow (captain: 0 of a raw 30)" fails the same way on master e0436ee8
  (run on the main checkout, PORT 8738). Not this lane's.
- Not run: the full suite (QUICK gate + church3 share the PC); textfit (the co-op pick card it frames is unchanged).

## ART LIST (for the sonnet ART lane - src/tavern.js TAVERN_ART holds the same list; tools/tavern.mjs checks every station is on it)
- tiles: inn floorboards (worn oak, a hearth-stone patch before the fire), plastered back wall with timber framing, beamed ceiling; the yard's packed-sand floor and open back wall
- door: oak with iron straps, a lamp over it, shut/open frames, the road and a signpost through it
- invite board: cork-and-timber notice board, pinned bills, chalk slate for the 4-letter code (blank/chalked)
- campaign table: heavy map table, world map spread, pins, a candle
- wardrobe: tall painted cupboard, doors open on hanging cloaks and a weapon rack, a standing mirror
- drills board: chalkboard with THROW / REVIVE / TEAM HIT drawn and tally marks
- sparring bell: brass bell on a post with pull rope (rest / swinging)
- dummies: two tavern straw dummies (sack heads, dented pot helm) - the yard's own
- hay target: ring of hay bales on the yard floor with a painted bullseye
- practice door: arched yard gate with the practice yards' light behind it
- arena pit: sunken sanded pit behind rope on posts, COMING SOON board, an empty stage board for VERSUS
- dressing: lit fireplace + cauldron, long tables/benches with Waymeet's drinkers, the bar + barkeep, window onto the road (day/night), hanging lanterns, hearth glow light
- glint: 4-frame first-visit sparkle + bobbing ! over an unused station
- rings: the floor ring (2 shimmer frames) and a tag plate for P1..P4
Theme fit: timber is furniture only (no plank platforms; the room has no platforms at all). The station stand-ins are plain fills.

## REDS / KNOWN GAPS
- partner-throw's boss-chip assert (pre-existing on master, above).
- The victory / win tally card still compares P1 and P2 only; the map token shows P1 + P2 only (questions 4-5).
- Leaving Practice from the inn goes to the title (question 7).
- The inn's art is greybox (plain-fill stations, the store's furniture) - the ART lane's list is below; per C. ART BEFORE LIVE the coordinator
  decides whether the greybox inn ships Monday (the brief says greybox is fine for this lane; the ARENA lane builds on it).
- No 3-guest online test (memory: two pages at a time); the 3-guest path is the same code as 1 guest x3 (per-guest hands/calls), proven for 1 + locals.

## QUESTIONS FOR DANIEL (rec first; what is built)
1. **Map F now goes to the tavern** (it toggled co-op on/off). Rec: keep - co-op lives in the inn; CO-OP OFF stays in the pause menu. Built: F = TAVERN.
2. **3-4 players always take the party view (1.25x)**; 2 players only when spread. Rec: keep. Alternative: always wide in co-op.
3. **Leash numbers**: 1.6 s told, off-screen > 40 px vertically, stretched >= 90% with the leader pushing. Rec: keep; tune after a 4-player playtest.
4. **The win/victory tally card** still shows P1 vs P2 (seats 3-4 are not on it). Rec: a four-column card in the SONNET test/fix lane. Built: unchanged.
5. **Map token** shows P1 + P2 only. Rec: small party pips under the token (sonnet). Built: unchanged.
6. **Local keyboard player two**: joining locally needs a pad (as before). Rec: keep (a split keyboard is cramped); a phone joins online by the board.
7. **Practice door** opens the Practice list; leaving Practice goes where the Practice screen always went (title), not back to the inn. Rec: return to the inn when entered from it (sonnet follow-up).
8. **An online guest at the tavern door** LEAVES THE PARTY like a local seat: his page shows YOU LEFT THE GAME (the room stays open, same code). Rec: keep.
