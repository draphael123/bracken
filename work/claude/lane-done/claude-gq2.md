# GQ2 lane report (claude/gq2) - THE GOBLIN QUEEN 2 (Highcrown boss rework), code-only

Branch `claude/gq2` off master 42a1d4cd, worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-gq2`. NOT merged, NOT deployed. No browser and no headless Chrome were opened; only Node tools, each run on its own (tools/check.mjs was NOT run).

## 1. Design plan (short)
- **Reuse, don't rebuild.** `claude/gqueen3` (b18b2e49, 11-04, plan `scratch/plan-goblinqueen3-1104.md`, recs approved by Daniel 11-04 10:09) already builds the whole brief as Daniel decided it on 10-29: P1 crown + portal rock shards PARRY -> STUNNED, bell + grate as the 2nd opening, NO pillars (pillars, plate bar and chandelier pins retired), flee -> full heal -> burning-hall escape climb -> roof shrine -> step into her portal -> P2 on a sealed tower top (full damage, banner lash high/low, portal ambush, rubble geyser, stomp, crown toss, shards < 60%, crown storm < 30%, hatch guards at 66/33%). Royal Decree, hall leap + quake and the gallery point are kept. So this lane **merged claude/gqueen3 onto today's master** and spent its time on the gaps:
- **Gap 1 - 1-4 seats.** The gqueen3 hands tested hits against `ctx.P()` only. Her projectiles fly in the world update, where P is seat one, so in co-op a crown or shard went straight through seat 2-4. Fixed (see 2b).
- **Gap 2 - a boss-lab harness for the 3-stage fight**, so a later lane can run `bossLab` n=6 and read the result per stage (see 2c).
- **Gap 3 - node tests** for both (tools/gq2-lab.mjs).

## 2. What was built
### 2a. Merge (1696d213)
`git merge claude/gqueen3`: one conflict in tools/check.mjs (the node-check list). Resolved by keeping master's list, dropping `queen-court` + `queen-chandelier` (they assert the retired pillars and plate) and registering `gqueen3`. Everything else auto-merged. **tools/gqueen3.mjs is green on the merged tree.**

### 2b. 1-4 seats (cd55eb84)
- src/gqueen-hands.js: `seats(fn)` (every hero still on his feet), `everyone(fn)` (every seat) and `target()` (the hero she means). The crown, shards, crown storm, geyser, banner lash, ambush, stomp, burning floor (each hero has his own tick clock), crumbling rafters and slates, the shrine and the portal step now test **every** seat. The flee FULLY HEALS **the whole party**, each hero from his own save's flask count. Walking into her portal takes **the whole party** to the tower top, set down a step apart. Hall portals aim at `target()` (the nearest upright hero), not always seat one.
- src/main.js GQH ctx: `eachHero` / `allHeroes` use the same `asPlayer` swap the other bosses use; `target` = `nearestHero(boss)` in co-op. Single player is unchanged (asPlayer calls straight through).

### 2c. Boss-lab harness (bc4c58f8)
- NEW `src/lab-gqueen.js` (name checked against ad-block words). `bossLab` runs while `boss.alive`, so one row already plays hall -> escape -> tower top; this file adds:
  - stage clocks and stun count;
  - `opts.gqEscape` (or `LABP.gqEscape`): `'play'` (default: the gqueen3 climbing bot `gqEscapeBot` does the escape) or `'skip'` (straight to the tower top: the King Gorm `gormSkipRun` precedent);
  - a **75 s stall guard**: a played escape that has not reached the roof by then is skipped and the row says `skip:'stall'`, so a bot stuck on a rafter does not turn the row into a timeout;
  - row field `gq = { stage, stuns, skip, p1Secs, escSecs, p2Secs, escHp0, escHpEnd, barLeft }`. `barLeft` is the CURRENT bar; the generic `hpLeftPct` is still measured against the P1 bar.
- `GQH.skipRoof()` in the hands lights the shrine (checkpoint + persist 'roof') and does the portal step. Only the lab calls it, and it refuses in the hall.
- src/lab.js: 3 lines (import, step every frame before the hands, `gq` on the row).
- tools/boss-run.mjs: returns and prints `gq`. `ROW_MIN_SECS = { crown: 360 }`, so her row never runs on the 240 s default clock (her targets add up to P1 70-100 + escape 30-40 + P2 60-90 s).

### 2d. Node tests (tools/gq2-lab.mjs, registered in check.mjs next to gqueen3) - all GREEN
- **SKIP:** refused in the hall; from the escape: roof, 1600 hp, shrine lit, hero at the exit.
- **RETRY:** a death on the tower top -> back in the escape with the shrine lit; the tower top restarts at her full second bar.
- **CLOCKS:** stun count; the escape starts at 100% (full heal); 75 s stall -> skip 'stall'; the stage clocks add up to the whole row; `barLeft` reads the current bar; `skip` mode goes up straight after the 1.6 s flee.
- **WIRING:** the static checks on lab.js and boss-run.
- **CO-OP (2 seats, asPlayer-style swap):**
  - the crown meets seat 2 while the world frame runs as seat 1, and seat 2's parry stuns her;
  - shards hit seat 2;
  - the flee heals both seats (3 / 5 flasks, each his own);
  - the fire ticks both (6 each in 3 s);
  - seat 2 steps into her portal -> both heroes land at the exit;
  - the low lash hits both;
  - a dead seat is never hit.
- **PARRY:** every hero in `HERO_IDS` (all 9) has a parry hand (`parryAt`) that holds C at 0.5 s to impact and presses it at 0.03 s; `parryShot` ignores a crown flying away or already going home.

## 3. Node results (on the merged tip)
- **GREEN:** gqueen3, gq2-lab, tells, answer-tags, comments, architecture, checkpoints, boss-checkpoint, anchor-lint, signs, goblin-lint, blow-tags, level-quality crown, crown-exam, crown-requests, boss-rows, elites, kitchengate, curve-gate (exit 0).
- **dangling-paths:** went red on the merged tree because the gqueen3 lane report cited `audio/file.ogg` in its text. I reworded that citation and it is green again.
- **`node --check`:** clean on every file touched (main.js, gqueen-hands.js, lab.js, lab-gqueen.js, level.js, highcrown2.js, marks.js, boss-run.mjs, check.mjs, gqueen3*.mjs, gq2-lab.mjs). I stopped a whole-`src/` sweep part-way because it was too slow; no file it reached failed.
- **curve-gate:** the `crown` row is **stale** (the level changed). It needs a browser restamp: `node tools/level1-pilot.mjs crown --curve`.

## 4. OWED (later sonnet lanes)
- **BROWSER PROOF** (one browser at a time, >= 1500 MB free):
  - `node tools/gqueen3-page.mjs` (written blind by gqueen3: all 9 heroes parry a forced crown / shard, a plain block does not stun, flee, portal);
  - add co-op page proof (2 seats: crown at seat 2, party portal step);
  - untold-told, attack-tokens, textfit, the curve restamp;
  - rewrite the page parts of rule-openings, boss-fight-end, boss-music, bosszoom-shots, highcrown2.mjs ('ring'/'b15' still assert the plate) and queen-pilot for the 3-stage fight;
  - confirm in the page that `gqueenReact` hooks before the generic block keys and that the escape bot climbs (the stall guard covers a stuck bot, and the row says so).
- **ART PASS:**
  - crown toss/catch, stunned pose, portal glow + shards;
  - burning rafters + slates, the tower-top deck + backdrop (the smoking castle below);
  - banner lash, geyser, crown storm, hatch; contact sheet.
  - All poses are placeholders (frames 2/6/7/8/10/15). Art before live.
- **n=6 TUNE**, command ready:
  `PORT=8644 node tools/boss-rates.mjs crown --seeds=6 --ways=built --heroes=knight,warden,geomancer,ranger,berserker,pyro,paladin,pirate,reaper --jobs=1`
  - her row runs on a 360 s clock automatically;
  - read `gq` per row: stage reached, stuns, p1/esc/p2 seconds, skip;
  - target 60-70% pooled BUILT with flasks, 40% per-hero floor, mash 0/6;
  - starting numbers: P1 2400 hp, P2 1600 hp, chip 0.4x outside openings, P2 1.0x.

## 5. Questions for Daniel (rec first - all BUILT as the rec)
1. **The lab and the escape.** Rec: **the lab PLAYS the escape** (the brief tunes the whole fight: P1 + escape + P2), with a 75 s stall skip that the row flags. Alt: always skip it like King Gorm's wood and measure the climb with the level walker.
2. **Co-op portal step.** Rec: **one hero walking into her portal takes the whole party** (a downed seat too). Alt: each hero steps in on his own; stragglers are pulled in after N s.
3. **Co-op flee heal.** Rec: **every seat is fully healed**, each to his own flask count. Alt: only the heroes in the hall.
4. **Heroes without a parry.** All 9 have one: shield heroes' perfect guard, the warden/berserker/ranger beat deflect, the pyro's ward, the pirate's hook catch. All of them reach the shared `RP.parried`, which is what stuns her. Rec: **no extra verb.** The bell + grate is the 2nd opening anyone can use, and she always takes >= 0.4x. Alt: let a blade strike-back also stun for 2 s (FT4 Archmage style).
5. The gqueen3 lane's 5 questions still stand (riposte on top of the stun, stun HP cost, the runtime roof shrine, the 0.9 s glow, chandeliers kept as scenery). Rec: keep all as built.
6. Hatch adds and roof throwers are `soldier` / `javelin` (garrison kit; she is not beaten yet, so the goblin rule holds). Rec: **keep**; the art lane gives them a goblin skin if the garrison is not one already.
