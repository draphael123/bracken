# Lane report: claude/lance (THE QUEEN'S LANCE: slower, platforms, archer support)

Branch `claude/lance` off master 0264d19. origin/master had not moved when I finished, so the merge was a no-op
("Already up to date"). `tools/check.mjs` still spawns `['tools/' + t + '.mjs']` (grep verified), and `lance-support`
sits inside the list.

## Commits

| commit | what |
|---|---|
| 995ea35 | the brief, `docs/briefs/lance-support.md` (written first, as asked) |
| 442510f | before: `tools/lance-pilot.mjs`, before pilot numbers, before captures (`work/lance/before-*.png`) |
| 1f109be | the build: slower, two end lookouts, the Queen's bows, the lab's hands, `tools/lance-support.mjs` (in the suite), bestiary line |
| d40b45a | after: pilot numbers, a "slower only" control run, after captures (`work/lance/after-*.png`) |
| (this) | this report |

## What I built

1. **Slower (about 15%).** Walk 52 to 44. Charge 250 to 212. Walk behind the shield (phase two) 78 to 66. Shield rush
   230 to 196, and the rush now lasts 0.65 s instead of 0.55 s, so it still covers the ~126 px it was aimed across. The
   charge keeps its 3.2 s. Every windup is a time rather than a distance, so none of them changed.
2. **Two end lookouts.** One on the first pier (302-306) and one on the last (410-414). They are built like the five
   existing mid-bridge lookouts: a 5-tile one-way deck 3 rows up, a `bridgetower` on the pier under it, and a brazier.
   Every hero's held jump measures 3.17 tiles in the page, the same for all seven, so every hero can reach them. The
   code is `src/lance-support.js` `lanceLookouts()`, keyed off the bridge's first pier. The arena carries the lookouts
   as `arena.bows`.
3. **The Queen's bows.** The first call comes 12 s after he wakes, then one every 15 s, at most 2 of his up at once.
   Each call is told for 1.2 s before anyone arrives:
   - the Stockade horn note;
   - a pulsing amber ring on the lookout;
   - a bar above it that fills from amber to red;
   - sparks.

   When the lookout is off screen, the bar is held at the screen edge with an arrow pointing to it.

   Then a plain `archer` (not a fire archer, 10 hp) drops onto the end lookout nearer you. It never lands on the one
   you're standing on. He fires nothing for his first 1.4 s. He pays no XP, because he has no xpKey, so the calls
   can't be farmed. When the Lance dies, his bowmen vanish in a puff of smoke in `bossEnd`. They're off in the Boss
   Rush, which is parked.
   - Why the nearer lookout and not the farther one (the brief first said farther): a foe more than 420 px from you
     isn't updated at all. A bowman on the far end of the 127-tile bridge would just stand there frozen.
   - Why there's no text announcement: `number()` only shows MOVE_WORDS, so text callouts like his own "HE LEVELS IT"
     never show. The tell is drawn and heard instead.
4. **Bestiary.** The stale "his charges take the deck out behind him" line is replaced with the horn and the bowmen.
5. **Lab hands (`src/lab.js`, only when the boss is the Lance).** Shielded heroes block his bowmen's arrows. The bot
   goes and cuts a bowman down, jumping up through the one-way lookout, when:
   - the bowman is within 200 px;
   - the Lance isn't open;
   - the Lance isn't coming at you (couch, charge, vault, rush or gale).

   Rows now carry `archers` and `archersCut`.
6. **`tools/lance-support.mjs`, in the suite.** It checks the lookouts' geometry and the call's rules with a fake
   world, then in the page: walk 44, charge 212, the bowman is an archer with no XP who lands on a lookout, he's gone
   at the Lance's death, and the fight ends. On the old code it fails, with the module missing, and with the old
   level it fails "two end lookouts".

## Numbers

These come from `tools/lance-pilot.mjs`, which uses the ranking's settings: refill health, a 150 s cap, speed 1,
modes on, 2 salted passes. It then runs one pass at normal health with a 300 s cap. All 7 heroes, geomancer included.
Raw data is in `work/lance/pilot-*.json` and `.log`.

| | before | after | after, bowmen switched off (control) |
|---|---|---|---|
| refill wins | 8/14 (4 of 7 heroes) | **12/14 (6 of 7)** | 5/7 |
| refill median win | 131.7 s | **111.8 s** | - |
| refill median damage taken | 429 | **298** | - |
| normal-health wins | 0/7 (dies in 18-42 s) | 0/7 (dies in 13-84 s) | - |

Per hero, refill, before and after:

| hero | before | after |
|---|---|---|
| knight | timeout, 19% of him left, 505 dmg | timeout, 11% left, 444 dmg |
| warden | timeout, 19% left, 534 dmg | win, 111.8 s, 385 dmg |
| pyro | win, 143.9 s, 496 dmg | win, 104.2 s, 298 dmg |
| paladin | timeout, 19% left, 429 dmg | win, 143.3 s, 291 dmg |
| pirate | win, 131.7 s, 384 dmg | win, 125.1 s, 371 dmg |
| reaper | win, 108.8 / 112.8 s | win, 100 / 122.8 s |
| geomancer | win, 80.7 s, 218 dmg | win, 70.1 s, 141 dmg |

The bot calls in 2-8 bowmen a fight and cuts most of them down.

Read with care:
- The two salted passes replay identically except for the reaper. This fight draws almost no dice.
- The control run (slower, no bowmen) came out at 5/7, which is worse for the bot than with the bowmen. Chasing
  bowmen moves the bot around the bridge, and that appears to help it. The bot's result on this fight is chaotic.
- The ranking's audit on claude/audit had this boss at 6/6, 91 s. The before run on current master is 4/7, so
  something else changed him or the bot between then and now. I didn't chase it.
- I did no tuning.

## UNVERIFIED

- **Nobody has played it.** Unverified by a person:
  - whether the tell reads (ring, bar and horn, with no text);
  - whether a bowman on the lookout feels like support or clutter;
  - whether 15 s is the right rhythm.
- **Arrow damage isn't separated out.** `hitBy` is keyed by the Lance's mode, so arrow hits show up under whatever he
  was doing at the time ("pace", "guard"). How much of the after damage came from the bowmen is not measured.
- **Normal-health numbers are still 0/7.** The bot dies long before the bowmen matter (the geomancer met 0 of them).
  That's a bot limit, not a verdict on the fight.
- **The existing bridge garrison.** Three fire archers and a rock goblin (322, 358, 394, 412) already stand inside his
  walls at the start. bossLab clears them before it fights, so no pilot number, before or after, includes them. A
  real player faces them plus his bowmen.
- **The Boss Rush.** The lookouts are level geometry, so they would appear there too if the Rush uses this arena. The
  bowmen are switched off there. I didn't open the Rush.
- **The held Stormhold rebuild.** `claude/stormhold` moves the bridge to 544 in `src/stormhold-town.js`. It does not
  get any of this until someone adds one `lanceLookouts({ plat, ent }, P0, BY)` call there and `bows:` on its arena.
  I didn't touch that branch.

## QUESTIONS FOR DANIEL

1. **The bridge already has three fire archers and a rock goblin inside his walls when he wakes.** With his bowmen
   added, that's up to five archers at once. Should the fire archers go, so the bowmen he calls are his only ranged
   support?
   *Recommendation:* remove the three fire archers inside the arena (322, 358, 412) and keep the rock goblin. Then the
   bowmen are the ranged pressure you asked for, and they arrive told and at a pace.
2. **Nearer lookout rather than farther.** The brief first said farther, but a foe more than 420 px from you freezes, so
   a far bowman would do nothing. OK to keep "nearer, never the one you're on"?
   *Recommendation:* yes.
3. **Is 15 s with a cap of 2 right?** The bot sees 2-8 bowmen a fight.
   *Recommendation:* play it once before changing anything. If it feels busy, go to 20 s, not a lower cap.
4. **The tell has no text**, because the game only shows move words. Is the horn plus the amber ring and filling bar
   enough, or should "THE QUEEN'S BOWS" be added to MOVE_WORDS so it shows?
   *Recommendation:* add it. It's one word list, and the fight's other callouts are silent for the same reason.
5. **When `claude/stormhold` ships**, should the end lookouts and bowmen go onto its new bridge (one call plus `bows:`
   on its arena)?
   *Recommendation:* yes, in the same batch as the ship.
6. **The pilot numbers moved the easy way** (refill 8/14 to 12/14, median win 132 s to 112 s). That's mostly the bot
   moving differently, not the fight being easier; normal health is 0/7 both before and after. Any tuning?
   *Recommendation:* none until you've played it.
