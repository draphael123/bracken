# claude/bosswave1: boss wave 1 (Opus, 2026-10-02)

Daniel's target is Hollow Knight / Salt and Sanctuary. After combat3, the mash bot (`tools/mash-bot.mjs`) still beat these bosses. For each one, the goal was:
- the mash bot loses every fight (0/6);
- the human-speed bot (`tools/combat-pilots.mjs`: knight, warden and pyro, one seed each) wins 60-75%;
- every opening is short (3 s or more), earned and told;
- outside an opening, a blow is the boss rule's x0.05 chip.

Branch `claude/bosswave1`, based on claude/batch55 d12c0941. origin/batch55 and origin/master did not move during the lane.

## Result: every boss and mini in the brief now loses to the mash bot

"Before" is the base code. The numbers come from my own runs at the start of the lane (same seeds, `--probe`). Some cached rows in `docs/mash-bot.json` were stale: Ram and Drowned King were cached at 2/6, but both were already 0/6 on the base code.

| boss (level) | mash before | mash after | human before | human after |
|---|---|---|---|---|
| Windcaller (moor) | 4/6 | **0/6** | 2/3 | 2/3 |
| Owl Reeve (hanging) | 4/6 | **0/6** | 3/3 | 2/3 |
| Grandmother (underleaf) | 2/6 (no opening, full damage) | **0/6** | 3/3 | 3/3 |
| Tollmaster (lamplit) | 1/6 | **0/6** | 3/3 | 2/3 |
| Ram Lord (scree) | 0/6 (one knight run died with him at 1%) | **0/6** (the mash bot lands at most 2 blows a fight) | 3/3 | 2/3 |
| Drowned King (keep) | 0/6 | 0/6 (restamped, code unchanged) | 2/3 | 2/3 |
| Great Hound (kings, mini) | 6/6 | **0/6** | 3/3 | 3/3 |
| Boatswain / salvage captain (harbor, mini) | 6/6 | **0/6** | 3/3 | 2/3 |
| Serjeant / lancer (waymeet, mini) | 6/6 | **0/6** | 3/3 | 3/3 |
| Homunculus (mage, mini) | 5/6 | **0/6** | 3/3 | 3/3 |

**Bosses (6):** the human bot wins 13/18 = 72%, inside the 60-75% target. Before it won 16/18 = 89%.

**Minis (4):** the human bot wins 11/12. Most mini fights are still short (17-50 s). See the questions.

**MASH_REPORT_ONLY.** These entries are deleted, and each one was restamped with `--arena-only` or `--mini-only` plus `--probe --l1 --write`:
- moor boss
- scree boss
- hanging boss (its spider mini stays, wave 2)
- lamplit boss (its lampreeve mini stays, wave 2)
- keep boss (its level part stays)
- underleaf boss
- kings, harbor, waymeet and mage minis

## What changed, per boss (old -> new)

### Windcaller (`src/main.js`, near `callerOpen`)
- **Why mashing won:** `callerOpen` counted cast, twister, lightning, howl and ground as open, so he was open most of the fight.
- **Opening:** `callerOpen` is now `'fallen'` only. He falls in two ways:
  - **A bolt sent back** drops him from any cast (before, only from cast, howl and appear). The fall lasts `CALLER_FALL` 3.4 s, and he gets up after `CALLER_FALL_TAKE` (20%) of his blood.
  - **His howl braced through** is the big fall. It lasts `CALLER_FALL_BIG` 4.4 s, and he gets up after 40%. A mash player never earns it.
- **Outside the fall:** on a stone, a blade reaches him for the chip, and the old "two hits and he blinks" still happens (`callerThere`). He is immune only while blinking or appearing.
- **Told:** "HE FALLS: CUT HIM", "HE RISES ON THE WIND", and the green ring now shows only while he is down.
- **Lab bot:** braces (DOWN held) through the howl, and keeps out of the twister.

### Owl Reeve
- **Why mashing won:** the mash bot lit floor lamps by swinging at them. A lit lamp near her dazzled her over and over (a stun-lock), and each grounded window paid double. One window took 92% of her.
- **Opening:** `OPEN_RULE` is now crash, grounded or pinned. `lampT` in the air is no longer open.
- **Damage:**
  - Crash and grounded pay x1.3 (was x2).
  - Pinned pays x1.6 (was x2.5).
- **No stun-lock:** after she rises from the boards, a lamp cannot dazzle her again for `OWL_EYES` 7 s.
- **Lab bot:** puts a lit lamp between itself and her swoop.

### Grandmother
- **Before:** she had no opening, was listed in `NO_OPENING`, and took full damage.
- **Openings:** `granOpen` is either of these, 3.2 s each (they were 1.9 s and 1.5 s, and neither was an opening):
  - her rap after a silent listen ("SHE RAPS THE FLOOR: CUT HER");
  - her feel turned on a shield ("NOTHING THERE: CUT HER").
- **Chip:** she is off `NO_OPENING` and on the x0.05 chip.
- **Lab bot:** stands still and silent through her listen.

### Tollmaster
- **Why mashing won:** THE DARK came on his own clock and was open at double for 2 s. The mash bot took 70-77% of him in it.
- **Now:** THE DARK is not an opening. His only opening is the ledger parried: 3 s (was 1.2 s), still at double.
- **Heroes with no shield** get in through poise breaks.

### Ram Lord
- **Charge:** a charge that hits you, or is blocked, stops on you. Only a charge you jumped or rolled through carries him into the wall.
- **Daze:** 3 s in both phases (was 2.4 / 1.7). It lands whole (was x2; one daze took 100% of him), and he shakes it off after 40% ("HE SHAKES IT OFF").
- **Leap:** the 1 s landing off his leap is not open.
- **Lab bot:** rolls through the charge, and does not swing while his head is down.

### Minis on the chip (`src/boss-greed.js` `CHIP_MINI`)
`chipped()` now covers a mini (`xpRole` 'mini') that is in `CHIP_MINI` and has a rule. The clank and the "A SCRATCH" line work for these minis too.

- **Broken is not open.** A chipped mini broken by his poise bar is stood still, not opened. The mash bot broke minis with taps, and the warden's spear-brace impaled the Serjeant mid-charge. Bosses keep "broken = open".
- **Great Hound:** `e.open` is set on these, 3 s each, and a window is worth at most a third of it:
  - a blocked lunge (it skids);
  - pups killed in time (it whines).

  The kennel hound's bite is a 1.6 s stagger, not an opening: it bites every 3.5 s, and as a 3 s opening it held the hound open all fight. The 0.8 s landing off a pounce is not open.
- **Boatswain:** the harbor mini is the salvage captain (`src/salvage-captain.js`). His pin answered (a block, or the warden's deflect) rests him `PIN_OPEN` 3 s, open (it was 1.8 s and not an opening). His other rests are not open. Lab bot:
  - stops two blows short of his greed and steps out of the ring;
  - the warden deflects his pin.
- **Serjeant / lancer:** `OPEN_RULE` is `e.open > 0`. On foot, and after every charge, he was open before. As a mini, each of these lasts `LANCER_OPEN` 3 s:
  - unhorsed;
  - reared on a shield;
  - his swipe or cut answered.

  Common lancers are unchanged.
- **Homunculus:**
  - bare is at least 3 s (it was 1.3-2.2 s, and x0.85 in phase 2);
  - it takes x1.15 (was 1.6);
  - it closes after a third of its blood ("IT GATHERS ITS GLASS"). One flask that missed was the whole fight.
- **Greed is unchanged** (4 blows, 26 burst, 1.5 s cooldown, x1.3 blows). The lab bot stops two blows short on a chipped mini.

### Checks changed (each comment dated to this lane)
- `tools/boss-openings.mjs`: the Windcaller's fall is open 3 s or more, and casting is not open. On the old code castOpen was true.
- `tools/boss-greed.mjs`:
  - Grandmother sampled as a chipped boss with her rap as the opening.
  - Node: `NO_OPENING` is never chipped, `CHIP_MINI` all have rules, and the spider keeps full damage.
  - The bosun sample: chipped outside his opening, whole in it. Before, it asserted that a mini keeps his damage, which is Daniel's 10-02 change.
- `tools/salvage-captain.mjs`: a parried pin opens him 3 s or more, and a pin that lands opens nothing. Shown red on the old file.
- `tools/moor-gusts.mjs`: its regex pin now expects `knockCaller(e, true)`.
- `tools/hint-shown-silent.txt`: shrank by 3 lines (`--write`). The other 'HE SHAKES IT OFF' line in main.js is now drawn too, since that string is a routed line.

## Checks run (named, never the suite)
- **Green on the final commit:** boss-greed, mash-gate, boss-openings, boss-fight-end (48 fights), slopes-trace, tells, hint-shown, architecture, checkpoints, skins, dangling-paths, npc-removal, moor-gusts, owl-lamps, salvage-captain, weak-bosses.
- **Green earlier on this branch:** hanging-hoist, small-adds.
- **slopes-trace: kings rebased (--rebase=kings) and nothing else.**
  - The Great Hound is the kings mini. A walk in that trace fights him, and his new opening rule (greed is not counted inside an opening, plus his window cap) changes what happens.
  - Proved by bisecting: ee9e2b8c's main.js is identical; this lane's mini commit's main.js differs at kings walk 11.
  - wood, keep, burial and canal are unchanged.
- **Known red:** attack-tokens (pre-existing on master; not run).

## UNVERIFIED
- Nothing was looked at on screen: the fall and green ring, the new hint-box lines, and the 3 s opening timings as felt.
- Human-bot numbers are one seed per hero. Some mash margins are thin:
  - Windcaller warden: 7% left.
  - Homunculus: knight 18% left, pyro 16%.
- The lab bot changes are boss-specific (windcaller, owl, grandmother, ram, salvage captain), plus the "two short" greed stop on chipped minis.
- Co-op is not tried.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The minis are still quick for the human bot** (11/12, mostly 17-50 s). *Rec:* cap each window at a third, as I did for the hound and the homunculus, for all four. *Alternative:* give minis more health.
2. **The pyro cannot open the salvage captain** (no shield, so no answer to the pin). She timed out at 57% left. *Rec:* let a roll through the pin answer it (`dodgedIt` is already accepted). The lab bot rolls away instead of through.
3. **"Broken = open" (combat3) is a mash leak on every boss**, not just these minis. A light tap fills about 6+ of the bar. I turned it off only for chipped minis. *Rec:* wave 2 decides it globally (weight-only poise outside openings, as POISE_LIGHT already does).
4. **The Grandmother is at 3/3 for the human bot**, a little easy. *Rec:* leave it; her listen is the level's lesson.
5. **Owl's `OWL_EYES` 7 s, Windcaller's 20/40% fall caps, Ram's 40% daze cap.** *Rec:* keep. These are the knobs that put the human bot at 2/3.

## WAVE 2 NOTES (not touched)
- **Spore Mother, Kraken:** still listed in `NO_OPENING`. Their openings are the heart and the arms; give each a 3 s told window, then chip them.
- **Remaining minis**, still on `MASH_REPORT_ONLY`:
  - Lampreeve, Ploughman, Spider, Sexton, Gravewarden, Hedgewarden, Barrowrider, Forgemaster.
  - The pattern found here applies to them: their opening is often free (a rest after every attack), and poise breaks from taps open them. Add each to `CHIP_MINI` once it has a 3 s earned opening.
- The Puppeteer and the Wicker Queen belong to other lanes (THEATRE3, FAIRFIX4).
