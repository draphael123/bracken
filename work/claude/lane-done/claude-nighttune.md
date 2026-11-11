# nighttune: joint n=6 tune of the four night bosses (claude/nightroad, worktree wt-nightroad, tip 46e209d65)
Setup: BRACKEN_ROAD=ww,sk,mn,ac + node --import tools/road-on.mjs tools/boss-rates.mjs <level> --ways=built --heroes=knight,warden,pyro --seeds=2 (n=6) --profile=human --secs=180 --jobs=1; flasks kit; hero at campaign level (L37/38/39/41). One headless Chrome at a time, 5.2-5.5 GB free before each launch. Flags only in the test page; no flips committed. Logs/JSON: scratch\lane-reports\nighttune\ (<boss>-rN.log/.json, run.sh). Not merged, not deployed, no check.mjs.
KEY FINDING: the boss bot (src/lab.js) has NO hands for these four bosses (generic walker). It never cuts the Mother's knot (0 openings in 6 fights), never answers a Headmistress lesson (she stays at 100% in all 6 fights), and only sometimes reclaims the Widow's lantern. So Mother and Headmistress rates are the bot's blindness, not the tune; I did not tune them (the numbers would be noise).

## Lantern Widow (wispwood, L37)  NOT READY
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| r1 base | hp 2600, resist .45, openCap .12, theft every 15, MERE 16 | 6 | 1 (17%) | 0/1/0 |
| r2 | hp 2000, resist .55, openCap .16, theft every 20 | 6 | 0 (0%) | 0/0/0 |
| r3 | + theft every 28, drown 24, MERE dmg 16->8 | 6 | 3 (50%) | 0/2/1 |
| r4 | + hp 1800, reclaim open 3.5->4.5 | 6 | 0 (0%) | 0/0/0 |
| r5 | + P2 lit 8->14, march dmg 16->12 cd 9->12 | 6 | 1 (17%) | 0/1/0 |
Deaths: hero HP ~650 gone to the Widow (~300) plus falls in THE BLACK MERE (~250, bots miss tiers in the dark); at 48-50% left they die at the P1->P2 lament. Knight never wins. Final values kept (r5): hp 1800, resist .55, openCap .16, theft every 28 / drown 24, reclaim open 4.5, p2 lit 14, march dmg 12 cd 12, MERE dmg 8 (all >= .4 resist, only told damage lowered). Commit 8a851f2e9. Pooled 5 rounds is noise-dominated; best guess true rate 15-35%.

## Crypt Mother (silk, L38)  NOT READY (not tuned)
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| r1 base | none (hp 3000, resist .45) | 6 | 0 (0%) | 0/0/0 |
Boss left 66-93% (pyro timeout 81%). 0 knot cuts: the bot cannot play the fight. Rounds 2-4 not spent.

## Castellan's Ghost (manor, L39)  READY
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| r1 base | hp 3200 | 6 | 6 (100%) | 2/2/2 |
| r2 | hp 3200->4400 | 6 | 4 (67%) | 1/1/2 |
| r2 more seeds 3-4 | same | 6 | 3 (50%) | 0/1/2 |
| r2 more seeds 5-6 | same | 6 | 5 (83%) | 1/2/2 |
Confirmed n=18: 12/18 = 67% (kn 2/6, wa 4/6, py 6/6). Knight is lowest; no hero at 0. Final hp 4400, nothing else touched (resist .45 / shield .4 / openCap .12 unchanged). Commit 14fbabece.

## Headmistress (academy, L41)  NOT READY (not tuned)
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| r1 base | none (hp 2600) | 6 | 0 (0%) | 0/0/0 |
Boss at 100% in all 6: the bot never answers a lesson / breaks the book shield. Needs bot hands first.

## Small fixes (commit 46e209d65)
- Crypt Mother hitbox: the art's origin sat ~6 px behind her mass, so the 30x20 box hung left/high. Drawn 6 px forward (by facing) and 6 up in crypt-mother-hands.js drawBoss; box now covers the body (checked in a nightwalk still, silk-boss-04-sweepTell). Hit rect unchanged.
- Headmistress head clip: rafterY lowered one row (A.gallery*TS, was (gallery-1)*TS) in src/academy.js; headmistress-hands.js onGallery check follows (rafterY, not rafterY+TS). Still checked in academy-boss-03-chalk: head fully on screen.
- Crypt Mother hang point off screen from the floor: NOT fixed (a camera bias is not simple/safe in this lane). Rec below.
- tools/wispwood.mjs pins (3 asserts: thefts >= 2, node-bot fight >= 30 s, veil blow = round(40 x WD.resist)) follow the tune.

## Checks after the changes
Node tools: wispwood, silk, manor, academy (each runs flag off + on): all ok; wisp/silk/manor/academy art-draw: all ok (flag on); tells, boss-read, boss-read-audit, threat-holes, blow-tags, level-quality (road-on): ok; answer-tags ran (no FAIL line). Browser stills: nightwalk silk + academy, 0 errors. Not run: check.mjs, map-forks / save tools (no change there).

## Questions (rec = built; none block)
1. Build boss-bot hands for Lantern Widow, Crypt Mother, Headmistress (src/lab-mother.js pattern: strike the knot / lantern / answer lessons)? Rec: YES, a bot-hands lane (Opus, 1 per boss, can share one lane) BEFORE any more tuning; until then only the Castellan's number means anything.
2. Widow: keep the r5 values as a starting point? Rec: yes; after hands, re-run n=18. If the Mere stays the main killer, make the dark-phase tiers solid under the mere edge (level-side) rather than lower damage further.
3. Ship Castellan alone? Rec: hold it for the batch of four (Daniel's earlier rec: one batch); if staged, Manor needs the Silk (it is road-gated) so batch it.
4. Crypt Mother camera bias while hanging (frame her from the floor)? Rec: yes, small, with the hands lane.
