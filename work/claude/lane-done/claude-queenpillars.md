# claude/queenpillars — lane report (2026-09-25)

Highcrown's Goblin Queen gets pillars she breaks herself, the boss-lab bot plays them, and the invisible platforms are
fixed across the game. Everything is on `claude/queenpillars` and pushed. I did not touch master or deploy, and I did
not run the full suite.

## Commits

| sha | what |
|---|---|
| `72eb699` | THE INVISIBLE PLATFORMS: castle ledges were two-thirds undrawn; new check `footing-art`; the floating Temperer moved |
| `e0e9e97` | the brief, `docs/briefs/queen-pillars.md`, written before the build |
| `1246163` | THE QUEEN'S PILLARS: the mechanic, the art, the tells, the sign; new check `queen-pillars` |
| `b9fd8c0` | THE BOT: baits her charge into a pillar; the shelf rule no longer cancels its strikes mid-hop |
| `b69a9e2` | three-seed pilots before and after; the brief's as-built notes |
| `6c64f4c` | merge origin/master (check.mjs: kept all 145 names from both sides; `sexton`/`tower-collapse` and `footing-art`/`queen-pillars`) |
| (this) | this report |

## What I built

**1. The pillars.**
- There are three cracked, load-bearing pillars (`qpillar` props) on her hall floor, at final columns 899, 904 and 911.
  They stand between the chandeliers and clear of the windows. The 911 torch moved to 916.
- Her charge breaks the first standing pillar it runs into, provided the charge started short of that pillar. The
  pillar pins her.
- The pin goes through **one shared `gqPin`**. It is the chandelier's code lifted out whole: 4.6 s (3.8 s in round
  three), 7% of her max HP, plate open. The chandelier calls the same function now, and `e.pinBy` records which of
  the two caused the pin.
- The pillar falls back over her. It leaves rubble: three one-way tiles on the row above the floor, drawn as a heap
  of broken drums. A hero can stand on the rubble.
- A pillar stands again when her round changes (at 66% and 33%) and on a retry. When it stands, its rubble goes.
- **A plain wall only dazes her (no opening).** I had to change code for this. `hurtEnemy` used to let blades through
  while she was `dazed`, even though `gqOpen` said only a pin opens her and the ward shell was still drawn on her. It
  now asks `gqOpen`. See question 1.
- **How the player is told:**
  - Every pillar is drawn cracked: a split down the shaft, chips out of the drums, and a capital pressed into the
    ceiling. Grit trickles from the cracks now and then.
  - During her `chargeTell`, the pillar in her line shakes and sheds grit.
  - A sign at her door says "HER PLATE TURNS BLADES. STAND BEHIND A PILLAR AND LET HER CHARGE: IT COMES DOWN ON HER."
  - The hint after her first warded blow now names both ways: the pillar and the chandelier.
- **Her pathing (rule E2).** When a standing pillar is between her and a hero more than 100 px away, her existing
  charge goes to the top of her attack chain. Otherwise her chain is unchanged, and none of her numbers changed.
- The chandeliers stay as the second way to pin her. `queen-chandelier` is still green.
- **Pictures:**
  - `work/queenpillars/before-*.png` is master.
  - `after3-*.png` is final: the hall, the pillar shaking through her tell, and her pinned with the shaft falling on
    her.

**2. The bot (`src/lab.js`).**
- While a pillar stands, the bot goes to stand past the nearest one, on the side away from her. It stays on the hall
  floor and more than 104 px from her, then waits for her charge. A spot it would have to cross her to reach costs
  more.
- It rides the charge out by standing still. If she is coming and nothing is between them, it jumps. It also jumps
  her decree's floor waves.
- Nothing is dropped for the bot.
- **Daniel's "FIX THE BOT" was right, and the suspect rule was the cause.** The shelf rule ("a blade cannot reach down
  from a step") fired on the bot's own hops over her. I instrumented it on the pillar build: it cancelled 742-1726
  frames of strikes per fight, and 288-843 of those frames were while she was PINNED. For her, the rule now applies
  only when the bot is standing. Other bosses are unchanged (question 3).
- `OPEN0` now counts only her pin as her opening.

**3. The invisible platforms.**
- **Cause.** The foes were standing on real one-way tiles. Ledges inside `L.masonry` take their picture from
  `LEDGE_SETS.masonry`, which has ONE canvas. `resolveTiles` picked from it with `ledge[(rnd()*3)|0]`, so two middle
  tiles in three got `undefined` and were never drawn.
- **Fix.** `pick3()` indexes modulo the list length, using the same single roll. Every level that already drew
  correctly draws exactly the same.
- **New check `tools/footing-art.mjs`** (in check.mjs). It loads every level in the page and fails on any cell you
  can stand on that has no tile sprite. It lists what stands on such cells first: level ents, ambush waves and alarm
  garrisons.
- **It was red first**, in 4 levels, and all four were fixed by the one rule:

  | level | undrawn floor cells | what stood on them |
  |---|---|---|
  | Highcrown | 74 | javelin 704,33, archer 732,33, javelin 706,13 (the gallery and chapel ledges; also the Queen's roof steps) |
  | Kingswood | 28 | a shield, a silver at 550,6, the checkpoint at 566,11 |
  | Monastery | 56 | 2 checkpoints, a stray at 38,29, a gob mage at 34,79 |
  | Unburied Field | 7 | nothing |

- It skips five levels that are painted by their own code: fields, mage, fallingtower, witchlight and caravan.
- **Also in Highcrown:** the second Temperer stood at 624,61, three tiles past the end of the forge boards, with
  nothing under him down to the bottom of the level. He hung there until woken and then fell out of the level. He now
  stands at 621,61. `newlevel.mjs` had flagged him, but only as advice.
- **I checked the removed gallery's row:** it is empty, with nothing left standing where it was.

## Numbers

These come from the boss lab on Highcrown with 7 heroes, refill health and a 300 s cap, which are 6ac9c23's settings.
There are three seeds per hero, so 21 fights each. The tool is `tools/queen-pilot.mjs` and the logs are in
`work/queenpillars/pilot-*.txt`.

| build | won | median win | range | timeouts |
|---|---|---|---|---|
| **before** (master: chandelier, old bot) | 16/21 (76%) | 129.9 s | 38.7-264.8 | knight 1, warden 2, pirate 2 |
| **after** (pillars, bait, shelf fix) | **21/21 (100%)** | **113.7 s** | 61.6-167.3 | none |

Other measurements, on one seed each:
- **Master build with only the shelf fix:** 6/7 won, median 114.2 s. The warden still timed out at 37%.
- **Pillars with the old shelf rule:** 7/7 won, but median 184.4 s.
- **Pins per fight, after:** 2-6 from pillars and 0-3 from chandeliers. On master she charged 0 times in 7 fights.
- **Damage taken per minute:** 109-304 after, against 91-328 before.

I did not tune her numbers.

## Checks

Checks run after the merge:
- queen-pillars, footing-art, queen-chandelier, crown-requests, crown-route, queen-comb
- arena-supplies, boss-openings, boss-fight-end, bells
- floaters, spawns, audit, content-audit, traps, killzones, collectables, deadends, checkpoints
- signs, textfit, tells, comments, syntax, homepaths, dangling-paths
- lab-clock, temperer

The results are in `work/queenpillars/checks-after-merge.txt`. Before the merge, `boss-fight-end` held her open with
`dazed`; it now holds `pinned`, which is her only opening.

Two new checks, both shown to fail on the old code first:
- `queen-pillars`: three pillars; she picks the charge at a hero behind a pillar even with her decree and sceptre
  ready; the pillar shakes through her tell; she is pinned 4.6 s for 7% with her plate open; the rubble is drawn
  floor you can stand on; her round change stands the pillar again; a wall only dazes her and her plate holds; every
  hero can do it from both sides; the lab knight gets at least one pillar pin in 60 s.
- `footing-art`: described in section 3 above.

## UNVERIFIED

- **Not played by hand.** The bot's bait stands in for a player's. Nobody has judged by eye in motion whether the
  shake and the cracks read.
- **The rubble heap in the pinned picture is hidden behind her sprite.** The check proves the tiles are drawn and you
  can stand on them, but nobody has looked at the heap after she walks off it.
- **A tracing oddity, not this lane's.** In one debug trace run without `BK.SET.speed = 1`, her 0.8 s tell lasted about
  90 sim frames. The checks set the speed to 1. This is existing timing that the lane did not change.
- **footing-art skips five levels**, the ones listed in section 3. Their floors are painted by their own code, which
  this check does not read.

## QUESTIONS FOR DANIEL

1. **Should a wall still open her?** Under the old code, a charge into a wall dazed her and blades got through. Her
   old hint even said "bait her charge into a wall". I followed the brief's "a plain wall only makes her stumble", so
   a wall is no opening now. *Recommendation: keep it that way.* The pillars are the lesson, and the daze window was
   drawn with her ward still up, so it was never told.
2. **She is now 21/21 for the bot** (it was 76%, and 6/7 in 6ac9c23's run). The Ore Road target was 60-75%. *My
   recommendation: don't tune until you have played her.* If she is too easy, shorten the pillar pin to round
   three's 3.8 s throughout, or have only one pillar stand again per round. Don't raise her health.
3. **Should the shelf-rule fix apply to every boss?** It is fixed for her only. The same rule (no strike from more
   than 24 px above a boss, even mid-jump) also covers the chief, frog, king, ram, windcaller, closedhelm, prince and
   strawking pilots, and it probably costs them the same way. *Recommendation: yes, but only after a full boss-lab
   run on the integrator,* because it will move their numbers.
4. **Is the rubble dodge OK?** The rubble is 16 px high, so standing on it dodges her decree's floor waves until her
   round changes. *Recommendation: keep it.* It is a reward for having made the opening.
5. **Other levels' creatures placed on nothing** (`newlevel.mjs` lists these, but only as advice):
   - the Monastery fledgling at 58,110 drops 7 rows onto planks when woken;
   - the Undercrown rock goblin at 144,121 falls down a shaft when woken;
   - the Unburied bone archer at 74,36 is not there at load.

   *Recommendation:* set the first two down on their floors, and make that `newlevel` line a failure, the way
   `footing-art` is.
