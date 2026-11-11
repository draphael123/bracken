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

(PROOFS, SHOP AT 27 ROWS, ICON SHEET, OWED: see below - filled from the runs.)
