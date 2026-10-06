# SWEEP1 report - claude/sweep1 (base claude/bot2 38fe2c46) - the boss retune sweep, ACT I

Brief: scratch/retune-list-bot2.md sections 5-7, ACT I rows + the ACT I audit flags; design-standard B10-B13. Daniel asleep: every call
below was built on the recommended option, and the calls are listed under QUESTIONS.

Standard measure throughout: `tools/boss-rates.mjs <row> --ways=practiced --seeds=4` (profile human, campaign level, NORMAL health, 240 s),
n=12. A borderline row was sampled a second time on seeds 5-8 (`work/tmp/rates-off.mjs`, the same runner, not committed) and is quoted at n=24.

## 1. The shared read (first commit, `boss-read helper`)
`src/boss-read.js` - a small, stable API for every sweep lane (claude/sweep2 merges this branch to reuse it):
- `const BR = makeBossRead(api)` with api = `{ time, clank, sparks, ring, word, hitstop }` (main.js builds it once)
- `BR.turned(e, fromX, word?)` - a blow met him and did nothing: CLANK + a flash where it struck (pale ring + sparks) + a short word over
  him (renewed in place, never stacked; once a frame per boss)
- `BR.auto(e, fromX, was)` - main.js `hurtEnemy` calls it after EVERY hero blow on a boss or a mini: struck, not hurt, not moved off his mode
  and not broken -> turned. This covers the chip that rounds to 0 on every boss, so every boss and mini in the game now says a word.
- `BR.beats(e, fromX, air, low)` - B11 guard by angle: a duelist in `GUARD` (`front` / `high` / `low`) guards one way; from the other way
  the blow is not chipped and lands at `ANGLE.mul` (0.5), and does not count as greed.
- `TURN` (WARDED, GO ROUND, GUARDS HIGH, GUARDS LOW, STONE, ARMOURED, NOT THERE), `TURN_WORD` (per-boss word), `GUARD` (per-boss guard).
  A lane adds a boss by adding a row, never by changing a call.
- `tools/boss-read.mjs` (no browser) checks the helper and the main.js wiring; it is on the check list.
- `BOSS_HIT` (main.js, by damagePlayer0): one number per boss for how hard his own blows land (and what he throws where the throw names him
  as `owner`). The bosses' own damage tables are untouched.

## 2. Per row (practiced kn/wa/py; "before" = the bot2 list, then the read fix alone where it was measured)

| # | row (boss) | read fixes | number / bot changes | before -> after |
|---|---|---|---|---|
| 1 | spire:mini (golem) | turned blows say STONE (100%); a pyro's burn could take him under 0 and he never died (240 s timeout at -10%) - fixed | BOT GAP (v2 only): the knight's jump tops out ~27 px under a hung bell, so the lab never rang it - it now strikes UP (air up-slash) near the top of the jump. Then GOLEM_CRACK 3.6 -> 2.0 s, EHP 400 -> 660, BOSS_HIT 2.2 | 17% (0/4 1/4 1/4) -> read 25% -> bot fix 100% -> **75% (3/4 4/4 2/4)** |
| 2 | oreroad (winchmaster) | IRON on every turned blow (6% -> 100% said) | BOT GAP (v2 only): on his housing and in the phase-3 duel the lab cut him whenever in reach, so the greed burst took ~60% of the knight's health; both branches now answer BK.greed like the other duels. WINCH.hp 600 -> 360, every blow x0.55 (WINCH_HIT) | 0% (0/4 0/4 0/4) -> **58% (4/4 1/4 2/4)** |
| 3 | underleaf (grandmother) | WARDED / NOT THERE (9% -> 100% said); her quiet windups (listen, vanish) stay unmarked by rule H | she calls the street only while fewer than 1 caller stands, one caller from her far side (uncapped, sprigs did most of the killing); her sticks carry owner; BOSS_HIT 0.55; EHP 430 -> 300 | 8% (0/4 0/4 1/4) -> **50% (3/4 1/4 2/4)** |
| 4 | scree (ram) | B11: DUELIST, guards FRONT - his horns turn a blade from the front only (was: from every side), GO ROUND (5% -> 100% said) | none | 17% (0/4 0/4 2/4) -> **50% n=24 (3/8 5/8 4/8)** |
| 5 | spore (mother) | ARMOURED, and THE HEART when her cap is up and a blade finds her body, not the heart (0% -> 29%, the heart line after the audit; it takes no hitstop - with one, small-adds saw the legacy pilot miss its sporelings) | none (heart 6 and 7 and BOSS_HIT were tried and put back) | 17% (1/4 1/4 0/4) -> **58% n=24 (5/8 5/8 4/8)** |
| 6 | wood (queen) | clean | EHP 105 -> 200, BOSS_HIT 1.5 | 100% -> **50% (3/4 1/4 2/4)** |
| 7 | kings (king) | THE CROWN on every turned blade (said) | EHP 420 -> 700, BOSS_HIT 1.3 (he died in 17 s taking 0-19 damage). **STILL OUT**: at 1000 / 1.5 he measured 58% (1/4 4/4 2/4), but tools/normal-health.mjs needs a level-1 legacy reaper to WIN King Gorm at normal health (its winnable row) - he dies at 760+ hp, and every value the reaper wins at, the standard bot wins 100% (700 / 1.3, 700 / 2.2 both 12/12). Kept the suite green: see QUESTION 7 | 100% -> **100% (8/8 8/8 8/8 at 700 / 1.3)** |
| 8 | burning (pyromancer) | clean | BOSS_HIT 0.75 (his health stays 587: tools/pyro-duel.mjs asserts ~15% over his old 510) | 25% (2/4 0/4 1/4) -> **50% n=24 (7/8 4/8 1/8)** |
| 9 | spire (abbot) | WARDED (14% -> 100%); his 29 unmarked windups are all riteTell - quiet by rule H | ABBOT.hp 900 -> 1900, BOSS_HIT 1.8 | 92% -> **58% (2/4 1/4 4/4)** |
| 10 | moor (windcaller) | **B12: blinks at most once a cycle (10 s, 8 s in phase 2), never during or within 3 s after his fall; after a fall or his gathering he RISES to his nearest stone on the wind (150 px/s, followable).** A blink not due is not taken (struck, he holds his stone). Words 14% -> 100%. Audit: 8.7 blinks/min (8 in/after open) -> 4/min (0) | bolts carry owner; CALLER_FALL_TAKE 0.2 -> 0.16 (braced howl 0.4 -> 0.32) | 42% (0/4 3/4 2/4) -> **58% n=24 (3/8 6/8 5/8)** |
| 11 | stockade (chief) | B11: DUELIST, guards FRONT (his shield, as before) - from behind he is not chipped now; GO ROUND (29% -> 98% said) | EHP 215 -> 268 (B11 had made him 75%) | 42% (1/4 4/4 0/4) -> **50% n=24 (2/8 6/8 4/8)** |
| 12 | marsh (frog) | THE HIDE (0% -> 71% said; the rest are the idle hit that makes him hop away) | none | 75% -> **58% (2/4 3/4 2/4)** (no number changed) |
| 13 | kings:mini (greathound) | its four windups wear their marks now (lunge !, pounce !!, snap !, howl quiet; marks.js BY_HAND + ANSWER) - 11/11 unmarked -> 4 (the howl, quiet) | none | 83% -> **75% (4/4 1/4 4/4)** |
| 14 | hanging (owl) | his unmarked windups are ropeTell (quiet, rule H) | none | 67% -> **58% (1/4 4/4 2/4)** |
| 15 | hanging:mini (spider) | clean | none | 67% -> **75% n=24 (6/8 4/8 8/8)** |

**In band: 14 of 15 Act I rows, no hero at 0. Still out: kings (King Gorm), held by a suite check (QUESTION 7).** Mash: re-stamped LEVEL then BOSS for oreroad, underleaf, moor, spire, wood, kings, burning,
scree, stockade, spore (see section 4 for each verdict).

B13 (waiting room) read for Act I: none is a waiting room. The Mother Cap's heart opens when YOU strike her living node (a core mechanic, as
King Gorm's cages); the Ram and the Chieftain are duelists now (always hittable from behind); the Winchmaster's jam is something you do.

## 3. Bot changes (v2 profiles only; the legacy bot is byte-identical, so the suite's bossLab checks are unchanged)
- src/lab.js golem branch: the up-strike under a hung bell.
- src/lab.js winchmaster branch: BK.greed answered on his housing and in the duel (out of the told burst; no 5th cut in a row outside an opening).

## 4. Checks
See the final batch at the end (work/tmp/final-checks.log): tells, answer-tags, boss-greed, boss-openings, rule-openings, boss-fight-end,
hint-shown, boss-read, each level's own check (pyre-pilot, pyro-duel, burning-village, false-abbot, gob-priest, bells, monastery3-beats,
spore-loop, mother-cap, mother-pilot, spore-exam, spore-caps, marsh-exam, hanging-exam, owl-lamps, firsthour, stockade-horns, scree-rework,
ram-bank, ore-road, ore-ride, ore-work, ore-exam, moor-gusts, moor-wind, moor-rocks, moor-aloft, wood2-beats, kings2-beats, king-refill,
queen-comb, weak-bosses, small-adds, elites), normal-health, boss-navigation, lab-reach, lab-clock, combat-replay, modulepreload, comments,
homepaths, dangling-paths. tools/hint-shown-silent.txt lost four dead lines (HORNS, SHIELD, ARMOURED, HE SHRUGS IT OFF - the helper says
them now) via its own --write, as its header asks.

Results (final tree): all green except as noted. normal-health, pyro-duel and small-adds each went red once on an intermediate value and are green on
the final one (King Gorm 700 / x1.3; the Pyromancer keeps 587 health; the Mother's heart line without hitstop). lab-clock timed out once under load
(CDP) and passed alone. **mash-gate**: the Mother Cap's boss row holds 0/6 now, so it came OFF tools/level-quality.mjs MASH_REPORT_ONLY (a gate
made stricter, as the gate asks). Pre-existing, not mine: tools/level-quality.mjs spore misses the bar on bands / mechanics / secrets (same on the base;
Sporewood is not a gated level).

## 5. Machine note (for the coordinator)
At ~05:55 the C: drive hit 0 bytes free. 445 `%TEMP%\bracken-look-*` Chrome profiles (~50 MB each) had piled up: tools/browser-profile.mjs
does not remove them on this machine (each of my runs left a few more too). I removed the 82 that had not been written to in over two hours
(+4.6 GB). Rec: a coordinator-side sweep of profiles idle > 2 h after each batch, and a look at why the remove-on-close fails on Windows.

## QUESTIONS FOR DANIEL (recommendation first; what I built)
1. **B10's word on every turned blow, for every boss** (BR.auto runs for all bosses and minis, not only Act I). Rec: keep it - it is the
   one shared read B10 asks for, and Act II/III lanes only add rows to TURN_WORD. Built: on for all; the default word is WARDED.
2. **Duelists by angle (B11): the Ram Lord and the Goblin Chieftain** guard FRONT; from behind a blow is not chipped and lands at half.
   Rec: keep; add more duelists per lane (GUARD table). Built: these two. (The Bullfrog stays a puzzle wall: his openings are made.)
3. **Windcaller B12**: rise-on-the-wind after a fall instead of a blink, blink gap 10 s / 8 s. Rec: keep, and play it - it is your
   complaint. Built.
4. **BOSS_HIT** (one per-boss multiplier on his own blows) instead of editing each DMG key. Rec: keep (one knob a lane can read). Built.
5. **The Grandmother's callers capped at one** (was two per call, uncapped). Rec: keep - the adds were the fight. Built.
6. **Daniel's playtest gate**: the Hornet Queen (now 200 hp, 1.5x) moved most. Rec: play her and King Gorm first.
7. **King Gorm vs tools/normal-health.mjs.** Its WINNABLE ROW is a level-1 legacy reaper beating King Gorm at normal health (seed 1919).
   At the standard's band (1000 hp, x1.5 = 58%) that reaper dies at 20% boss left. Rec: move normal-health's winnable row to a boss that
   stays easy for a level-1 hero by design (the assertions unchanged: health reconciles on a win), then set King Gorm to 1000 / 1.5.
   Built: NOT the test change (never weaken a test); King at 700 / x1.3, the most the row allows - still 100% for the standard bot.
