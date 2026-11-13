VERDICT: BOT (both rows). The warden hero is not weak per hit; the lab bot stood her on the wrong spot vs the Freebooter (every blow paid the x0.7 mid-shaft: old `kx + side*30` in src/freebooter-boss.js fbLabPlan = 23 px edge to edge, her tip pays from 28 px: src/warden-id.js band.tipFrom, src/main.js:32041 tipPay) and rolled her the wrong way vs the Kraken (src/lab.js:2550 pressed dodge with no face flip; her button is a BACK-STEP, src/main.js:11857 `dir = P.dbufDir || (isWarden() ? -P.face ...)`). Fixes are bot-only; browser re-measure owed (nothing in this lane ran a browser).

# claude/wardenbot - why the warden loses where knight and pyro win (11-13, code-only lane)

Branch claude/wardenbot off origin/claude/sea5 c57628753. Worktree LANES\bracken-wardenbot. Pushed, NOT merged, NOT deployed. No hero or boss number changed.

## 1. The numbers (L26, swordDmg = base + 16 growth; src/main.js:918)
| | knight | warden | pyro |
|---|---|---|---|
| base dmg per light hit | (10+16) x 1.1 = 29 | 11+16 = 27 x tip pay | (base+16) x 0.7 |
| tip pay (src/main.js:32041, hero-pass TIP) | none | d >= 28 px edge to edge: x1.6 rising to x2.0 at d 40; in his opening x2.0; d 14-28 = mid-shaft x0.7; d < 14 = haft x0.3 | none |
| dmg per hit | 29 | 19 (mid) / 43-54 (tip) / 54 (tip in an opening) / 8 (haft) | - |
| swing cadence (src/commit.js) | art 0.3 s + 0.084 (third +0.12) | same, third +0.30 (long thrust) | same |
| blow reach | 28 | 44 (third 60) | cone |
| hp (rows) | 222 | 222 | 210 |

Per hit she is 0.65x the knight at the mid-shaft and 1.5-1.9x at the tip, same cadence, 1.6x the reach. The hero design (stand off, pay at the point) is fine; the bot has to stand at the point.

## 2. Freebooter 0/6 (bot)
- fbLabPlan (src/freebooter-boss.js) stood her at `kx + side*30` for every cut and recovery. He is 14 px wide, so her near edge was 23 px out: below the 28 px tip line, so every blow paid x0.7 (and 9 px closer is the haft, x0.3). The generic hands use WARDEN_TIP + w/2 - 6 and rely on an approach from afar to stop 4-6 px further out; this plan walks to within 3 px of an exact spot, so it stopped inside the line.
- Fix: `standX = s.tip ? s.tip + 2 + w/2 : 14` used at both gx sites (open, recoveries): near edge 34 px out (a tip with 6 px to spare, inside her 44 px reach, outside his cuts' 30 px + 5). Non-warden heroes get the old 14: their plan is unchanged.
- Evidence in the rows (scratch/lane-reports/seawalk1/fb-r3.json): warden presses attack 700-1300 times vs the knight's 240 (presses that never started a blow), 8-16 openings per fight vs 5, and dealt damage per press ~4 vs the knight's ~35.
- Node proof: tools/wardenbot-duel.mjs (new, not in the suite) plays the REAL stepFreebooter / takeAt / parried / landed / fbLabPlan against a hero model with the game's numbers. Phase one to his 55% line, 30 seeds: warden old stand 123 s, dps 32, hits 19% tip / 76% mid-shaft / 5% haft, mean edge d 26.0; warden new stand 60 s, dps 66, hits 94% tip, mean d 34.4 (v2 hands: 128 s -> 67 s). The knight row is identical before and after (140 s, 6382 hits). CAVEAT: the model's knight is 2.7x slower than the browser knight (it lacks whatever makes the real knight land ~76 dps: stagger, plunge verbs, hit-stun), so only the old-to-new ratio (x2.0 warden dps) transfers, not the absolute times. It does NOT prove she now wins in 240 s; the browser re-measure decides that.

## 3. Kraken 1/6 (bot)
- The Kraken block (src/lab.js:2550) rolled out of a slam / grab with `k.left/k.right + BK.press('dodge')`. The warden's dodge is `dir = -P.face` (src/main.js:11857; dbufDir is only a touch double-tap): she steps BACK from the way she faces and keeps facing it. Every other hand with a warden branch sets `P.face = gx > P.x ? -1 : 1` first (lab.js:1690, 1839, 1858 ...); this one did not, so she stepped toward the blow. That fits the row: deaths at 16-27 s, 234 damage taken in three seeds (the same unattributed hits each time), boss at 80-91% left (s2/s3/s4); master gives the identical row because this block is shared.
- Fix: `if (h === 'warden' && LABP.v2) P.face = KA.dodgeDir > 0 ? -1 : 1` before the press. Legacy (non-v2) hands and every other hero unchanged.
- "Threw no attack": rp.verbs {} is the RIPOSTE chain's verb ledger, not her swing count (swings were 70-92 in those fights). She did swing; she died before the arms came round.
- NOT PROVEN: no node harness drives the old Kraken's hands, so this is by code (the missing face flip is the whole difference to the working plans). The re-measure confirms or refutes it. Her other Kraken losses (s1 71 s, s5 57 s, 56/47% left) are not explained by this and may be damage/stand (arm stand LAB_STAND-4 = 30 px from the strike point: not checked against the arm width).

## 4. Same bug elsewhere (not fixed, listed)
About 30 other `BK.press('dodge')` sites in src/lab.js (plan branches near 1783, 1803, 1821, 1875, 2202, 2221, 2239 and hand blocks 418-421, 2396-2412, 2517-2537, 2576, 2701, 2722 ...) set k.left/right then press dodge with no warden face flip, so her dodge direction there is also whatever her face happens to be. One central patch covers them all: in bossLab, for warden + v2, wrap BK.press so a 'dodge' sets `P.face = -(k.right - k.left)` when a key is held. NOT done: it moves EVERY warden row in every boss table already tuned (up), a tune-lane decision (question 2).

## 5. Browser owed (one headless browser at a time; memguard first; BRACKEN_CW3=1 CW3=1 for the sea rows)
From LANES\bracken-wardenbot (RAM >= 1.5 GB free, no BROWSER-HOLD flag):
1. `PORT=8644 node tools/boss-rates.mjs piratefleet --ways=practiced --seeds=6 --heroes=warden,knight,pyro --out=wb-fb.json` (Freebooter + control heroes; before: warden 0/6, 25-59% left)
2. `PORT=8644 BRACKEN_CW3=1 CW3=1 node tools/boss-rates.mjs causeway --ways=practiced --seeds=6 --secs=300 --heroes=warden,knight,pyro --out=wb-kr.json` (Kraken; before: warden 1/6, deaths 16-27 s)
3. `PORT=8644 node tools/boss-rates.mjs flotilla --ways=practiced --seeds=6 --heroes=warden --out=wb-fl.json` (same bot family; she was losing with 51-71% left; the flotilla plan is not touched, so this tells whether the cause was shared)
4. `PORT=8644 node tools/boss-rates.mjs buriedcity:mini --ways=practiced --seeds=6 --heroes=warden --out=wb-gb.json` (Glassblower, before 3/6; must not drop)
5. Control, shipped boss: `PORT=8644 node tools/boss-rates.mjs wood --ways=practiced --seeds=6 --heroes=warden,knight,pyro --out=wb-wood.json` (nothing in its path changed: must equal the last wood table)
6. Optional trace: `BRACKEN_CW3=1 CW3=1 node tools/seawalk-krprobe.mjs warden 2` (position / mode every 1.5 s): she should no longer die in the first 20 s.
Read: the Freebooter overall should rise from 12/18 toward 18/18 (knight and pyro run the same plan code, unchanged), so a tune lane then has to tighten his hp / reload so ALL THREE heroes sit in 60-70% (question 1).

## 6. Questions (rec first)
1. If warden, knight and pyro all win the Freebooter after the re-measure, the band needs re-tuning DOWN (hp 8400 up, or reload shorter). REC: leave the numbers until the browser rows are in; the seawalk1 hp / reload values were chosen with a broken warden.
2. Central warden dodge-face patch in bossLab (section 4). REC: yes, in the next joint tune lane, with a before/after n=6 table on 4-5 duelist bosses; it will raise every warden row.
3. Put tools/wardenbot-duel.mjs into the suite (node only, ~2 s)? REC: yes, as a tip-share check (assert tip hits > 2x mid hits); tools/check.mjs left untouched.

## Changed
src/freebooter-boss.js (standX, warden only), src/lab.js:2550 (warden face flip, v2 only), tools/wardenbot-duel.mjs (new). Checks run: pirate-fleet 136 ok, kraken3 217 ok, wardenbot-duel 3 ok, lab.js imports (75 exports). Not run: any browser, level-quality, the full suite.
