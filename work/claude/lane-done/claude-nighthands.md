# nighthands: boss-bot HANDS for the Crypt Mother, the Headmistress and the Lantern Widow + the n=6 / n=18 retune (claude/nightroad, worktree wt-nightroad)
Base 899240399, final tip 2767e9015. My commits are the `WIP nighthands:` ones from 9aefcdbfc on. A SECOND instance of this lane ("NIGHTHANDS-RESUME", started by the coordinator at 07:10 from my first commit because it thought I had died) has been working in the SAME worktree the whole time: it committed my uncommitted edits in its own commits (dca454561, beb4e4298 ...), tuned the Headmistress hp (2600 -> 3000 -> 2800) and owns the Widow retune (commits 67e20bf5d .. 8557554eb). Both of us are in the tables below; the Widow rounds between r1d and final-check are its (its own report: nighthands-resume.md; this file merges both). Setup everywhere: BRACKEN_ROAD=ww,sk,mn,ac, tools/boss-rates.mjs <row> --ways=built --heroes=knight,warden,pyro --profile=human --secs=180 --jobs=1 (flasks = the campaign kit), hero at the campaign level (L37/38/41), one headless Chrome at a time, 4.4-6.1 GB free before each launch. Logs/JSON: scratch\lane-reports\nighthands\. Not merged, not deployed, no check.mjs, no flag committed.

## The hands (src/lab-night.js, one branch in src/lab.js runbossLab: `boss.t==='cryptmother'||'headmistress'||'lanternwidow'`, the pattern of src/lab-mother.js)
Read only what a player's screen shows (BK.nightHands() = the three hands' fight states: the glinting knot, her shadow, the flying glob, the circles of chalk, the lit lectern, the called lesson, the shield books, the dark glade, the rings/ripples/march, where she flies); answer only TOLD cues.
- **A small platform navigator (navStep)** reads the LIVE grid (lit spectral tiers, conjured steps, fallen strands are what they are this frame): runs of standable cells, 3-row hops (jump = 49 px, held through its rise), spring webs (a held bounce = 7 rows, the PLUNGE onto the web = -560 = 9 rows: the Mother's wall ledges are 8 rows up, so the hands jump off the web, plunge back onto it and are thrown up), drops (DOWN+JUMP through a one-way floor), ward rails as walls.
- **Crypt Mother**: goes to the platform under the knot that glints (web plunge -> wall ledge -> tiers -> top tier), waits until she has walked over the perch (a cut while she is far end drops her out of reach), cuts it with a STANDING swing (the knot is 24 px over the feet; at the top of a jump it is below the blow). Opening: drops through the one-way floor (down+jump) and strikes her on her back with each hero's own verb; stands on the nearest floor that is still there (P2 strands). Told answers: glob (step out of its line), pounce (leave the shadow), sweep (in the air as the leg lands), P2 flashing strand (off it), spiderlings cut as they close, never a blow on her outside the opening (a twentieth + greed).
- **Headmistress**: touches the lit lectern (waits at the NEXT lectern during the bell: the rail and the dismissed floor are only whole for a moment), then P1 float to the gallery (hold jump), pop shield books, strike her at <= 2 books; P2 stand out past her ward rail, BLINK through it (dodge, held direction; the unfiltered press, a cantrip is not a roll), strike her back inside the window; P3 jump off the rim, jump again in the air for a step (never during coyote: that is a real jump), strike from the step, be in the air at the dispel; finale: float up beside her station / blink / conjure per call. Chalk circles (never step INTO one), bolt (jump), ruler (block or out of reach), greed ring (stand clear; one blow short of the count).
- **Lantern Widow**: lit glade: wait by the left bank's lamp (a drowned lantern is lit again at a lit lamp), on the told theft stand on the left tier (the first perch she takes is learned from play); stolen: nav to her lantern over the tiers that are real in her glow, strike the lantern; reel: down at her and strike. Wail (airborne as the ring front arrives), hands (out of the ripples), march (jump), veil (block / step out). Never walks off a platform toward an unreachable perch (the dark mere): that was 100+ hp of falls.
- **Lab plumbing**: BK.labHoldSkills (the built way's skill hands cast at a boss outside its opening: a twentieth + the greed reprisal; now held outside openings for these three), BK.labPressRaw, opts.nhHp (dev). tools/nighthands-dev.mjs = one fight with the lab's samples.

## REAL BUG found (fix in src/boss-greed.js): the three had NO OPEN_RULE
noteGreed counts a hero's blow as greed whenever openOf(e) is falsy; with no rule it is null, so every blow IN an opening counted and HIS REPRISAL came down on the hero mid-opening (35-210 hp a fight in the old rows, incl. the Castellan's). Added OPEN_RULE (cmOpen / hmOpen / wdOpen) and OWN_WARD (their own x0.45 / x0.4 / x0.55 numbers are kept; only greed is counted outside openings). The Castellan has the same gap and was NOT touched (see Q1).

## Tune tables (n = wins; kn/wa/py)
### Crypt Mother (silk, L38)  READY (n=18 11/18 = 61%)
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| b0 | hands v1 (hp 3000) | 6 | 0 | 0/0/0 (all timeouts, boss 16-90% left; skills fed greed) |
| b1 | skills held outside openings | 6 | 0 | 0/0/0 (stood under the top knot jumping: a cut from the apex misses) |
| r1 | hp 3000->1800, openCap .12->.14, drop.open 3.0->4.0, hands cut standing | 6 | 0 | 0/0/0 |
| r1b | + no swing at her outside an opening, wait for her over the perch | 6 | 1 | 1/0/0 |
| r1c | + OPEN_RULE/OWN_WARD, stand on floor that is still there | 6 | 4 | 1/1/2 |
| r1d | same, seeds 3-6 | 12 | 7 | 3/3/1 |
Pooled r1c+r1d n=18: 11/18 = 61% [38-80] (kn 4/6 wa 4/6 py 3/6). Final: hp 1800, openCap .14, drop.open 4.0, everything else untouched (resist .45, every move's tell/damage as built). Timeouts (bot 180 s clock) are the losses: wins 111-148 s.
### Headmistress (academy, L41)  READY (n=18 12/18 = 67%)
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| b0 | hands, hp 2600 | 6 | 2 | 0/2/0 |
| b1 | + greed hold (one blow short, off the ring) unless the blow is the answer | 6 | 5 | 1/2/2 (83%, high) |
| r1 | chalk 14->20, ruler 16/18->22/24, bolt 16->22 (and hp 2800 from the other instance) | 6 | 4 | 2/2/0 |
| r1d | same, seeds 3-6 | 12 | 8 | 1/4 4/4 3/4 |
Pooled n=18: 12/18 = 67% [44-85] (kn 3/6, wa 6/6, py 3/6). Final: hp 2800, chalk 20, ruler 22 (back 24), bolt 22; openCap .12, open 3.0, fin.wait 7 untouched. The warden's fights are near-identical across seeds (6/6): the bot's signature.
### Lantern Widow (wispwood, L37)  READY (n=18 11/18 = 61%; the warden is weak: 1/6)
| round | change | n | wins | kn/wa/py |
|---|---|---|---|---|
| b0 | hands on nighttune's r5 values (hp 1800, resist .55, openCap .16, theft 28/drown 24) | 6 | 2 | 2/0/0 |
| r1 | theft every 28->20, drown 24->16 | 6 | 4 | 0/2/2 |
| r1d | same, seeds 3-6 | 12 | 10 | 4/2/4 (pooled 14/18 = 78%, high) |
| (second instance, 9 rounds r1..r9 in ww-r*.log) | PERCH RULE (below), hp 1800->3000->4000, told damage x1.2-1.5 (veil 14->34, wail 16->40, hands 12->30, march 12->30), cooldowns x0.7 (veil 1.0, wail 4.5, hands 5.0, march 8) | 6 each | 100% .. 100% .. 83% / 67% | its last: r8 5/6, r9 4/6 |
| final-check | the above, seeds 1-6, 240 s | 17 (1 memguard kill) | 13 | 6/6 1/5 6/6 (76%, high) |
| a1 | hp 4000->4800 | 6 | 4 | 2/0/2 |
| a1d | same, seeds 3-6 | 12 | 7 | 3/1/3 |
Pooled a1+a1d n=18: 11/18 = 61% [39-80] (kn 5/6 wa 1/6 py 5/6). Final: hp 4800, resist .55, openCap .16, veil 34 (cd 1.0) / wail 40 (cd 4.5) / hands 30 (cd 5.0) / march 30 (cd 8), theft every 20, drown 16, reclaim open 4.5, P2 lit 14 - all >= .4 resist, only told damage, timing and hp moved. 240 s clock (the theft cycle makes 180 s a bot artefact). 
FINDING (the second instance's, I confirm it): she flew to the perch FARTHEST from the hero, but the pale tiers and the bridge are real only inside 120 px of her lantern, so the far bank cannot be climbed in the dark: the hands sat on the left bank 'stuck' 60-100 s per fight (hero fell into THE BLACK MERE walking at it: 100+ hp) while she cycled the right tiers; the first perch after a quick P1 reclaim is the top-centre one, also out of reach. src/lantern-widow.js flyToPerch now chooses the far perch ON THE HERO'S OWN BANK (the high middle one only when the hero is on the bridge). Bot rate 17% -> 100% before the damage was raised. This is gameplay logic, not hp/timing/threat: Q3.

## Camera (Crypt Mother's hang point on screen from the floor)
Arena-only, two parts (src/crypt-mother-hands.js H.camY, src/main.js 2 tagged lines): (1) while she hangs the camera target rises toward her but never so far that the hero's feet + 28 px leave the bottom: camY = max(feet+28-VH, min(ty, her y - markH - 34)); (2) a 'zoomfar' view for her fight only (viewFor/desiredView): one pixel-scale step further out (S0/2 instead of S0/1.5), the same 640x360 cap, so a 1080p screen gets 640x360 instead of 480x270. Measured (headless 1280x720, hero on the floor): VH 360, camY 179, her hang point 13 px under the top edge, legs and thread on screen (scratch\lane-reports\nighthands-cam.png); before: VH 311, camY 229, she was 37 px ABOVE the top. A pure bias cannot do more: hang 192 -> floor 512 is 320 px and the view is at most 360 with the HUD at the bottom. zoom-coverage ok, comments ok, architecture ok.

## Checks after the changes (node, flag off and on where the tool has both)
silk / academy / wispwood / manor level tools: all ok (flag off and on). silk-art-draw, wisp-art-draw, academy-art-draw, manor-art-draw: all ok. tells, boss-read, boss-read-audit, threat-holes, blow-tags, level-quality (road-on): ok. zoom-coverage, architecture, comments: ok. NOT run: check.mjs (never), page tools other than boss-rates and the camera still.

Page crashes (Inspector.targetCrashed) seen in rows of both instances: those are scratch/memguard.log KILL events (free RAM under the floor while two lanes ran browsers at once: 07:14, 07:22, 07:37-38), not game errors; a re-run of the same seed (Widow warden 6) did not crash. Rows lost to a kill are counted as errors, not losses.

## Questions (rec = built; none block)
1. The Castellan's Ghost has the same missing OPEN_RULE (reprisal in its openings): add OPEN_RULE + OWN_WARD for it and re-baseline hp (4400 now gives 67% WITH the bug). Rec: yes, in the batch, hp re-run n=18 after.
2. Crypt Mother camera: accept the arena-only 'zoomfar' view + bias (her hang point barely on screen)? Rec: yes. Alt: lower her hang point 3 rows (192 -> 240), level-side.
3. Widow: keep the "perch on the hero's own bank" change (it makes the dark climb possible; without it P2 after a quick reclaim is unreachable)? Rec: yes (alt: a bridge lit by the rim lamps during the theft, level-side). The warden is the weak hero (1/6, deaths at 115-150 s to the Widow's own moves): rec leave, or make the warden's hands block-step like the knight's.
4. Mother's wall ledges are 8 rows over the floor but a held spring rises 7: the only way up is jump + PLUNGE onto the web (-560). Is that intended? Rec: tell it (a sign / hint near the first arena web) or raise the web throw one row.
5. Finale of the Headmistress: the blink lectern is behind her rail and the conjure lectern past the dismissed floor, a hero on the wrong side cannot learn it before the call changes (fin.wait 7 s). Rec: fin.wait 7 -> 9.
6. Ship the four as one batch (Castellan n=18 67% from nighttune; Mother 61%, Headmistress 67%, Widow 61%). Rec: yes, after the Castellan rule (Q1) and one nightly n=18 per boss on the final tip.
