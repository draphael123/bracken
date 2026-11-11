# PREPCF1 - CF1 onto master batch162 (11-11), code-only
Branch claude/prepcf1 (worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-prepcf1) = master df501ad26 + merge of claude/cf1 c0f067f3b. Tip b54dff62a (+ this report commit on top). Not merged to master, not deployed. CF1_SHIPS = false.
FLIP: src/cf-impact.js:7  `export let CF1_SHIPS = false;` -> true (one line). Preview without flipping: ?cf1=1 (main.js line ~358, `if (q.get('cf1') === '1') setCF1(true)`); KEEP that line after the flip (harmless).

## Merge
- Clean auto-merge (ort), ZERO conflicts (main.js auto-merged; imports no overlap). Files: audio.js, cf-impact.js, main.js, tools/cf1.mjs, tools/juice2.mjs (2 greps accept thwack opts arg - keep), CF1 lane report.
- Reviewed the full main.js/audio.js diff: every hunk is CF1_SHIPS-guarded or a pass-through (blowKind -> blowKind0 = old body). Only OFF-state side effect: `P.cf1Half = false` in the charge else-branch (inert field).

## hero-pass exit 1
- NOT RUN here: tools/hero-pass.mjs opens a headless browser (cdp.mjs openPage); this lane is code-only. Evidence is therefore static + history:
  1. OFF identity: all CF1 hunks are guarded, hero-pass never passes ?cf1=1, so with the flag off the game it drives == master. A CF1-caused red is not possible while OFF.
  2. History: RELAY/reports show hero-pass was red before on batch140 (knight UP+C wind-up / shield charge, 'pre-existing', fixed in rel139fix) and green in later gates; CF1 lane said 'exit 1, output cut off, not compared with batch158' (the lane also ran it while other browsers were up -> RAM/crash exit is plausible).
  VERDICT: very likely pre-existing/environmental, UNPROVEN. OWED: one browser lane runs `node tools/hero-pass.mjs` on plain master AND on this branch and diffs the 'HERO PASS FAIL' lines (it prints them).
- Disclosure: I started tools/audit-feel.mjs twice (looked node-only; it uses audit-lib -> a headless browser). 1st run exit 1 (ws error), 2nd killed by my timeout after printing rows. No chrome of mine left (checked by command line); I killed nothing.

## Node checks (this branch, flag OFF unless stated)
cf1.mjs OK (covers OFF no-ops AND ON via setCF1 in-process: class table, limiter 5->3, jet gate, tip/shaft, lean+Reduce motion, charge, pitch/dB, kick, wiring greps, node --check main/audio/cf-impact); juice2 OK; blow-tags ok; combat-feel ok; voices-check ok; footsteps-check ok; audio-mix ok (0 problems); modulepreload ok (1 unlisted reachable module, budget 15 - run `node tools/modulepreload.mjs --write` at release to add cf-impact.js); dangling-paths ok; comments ok; content-audit ok. No reds, nothing to fix. Whole-game flag-ON in node is not possible (flag is module state; only cf1.mjs flips it).
NOT run: any browser check (juice, riposte, boss-openings, audit-feel, hero-pass, whatsnew, shake-mode, attack-animation, audio-assets use pages).

## BROWSER PROOF LIST (one browser, memguard first, >=1500 MB free, no gate running)
Setup: OFF run = this branch as-is. ON run = same worktree with src/cf-impact.js:7 flipped (tools open plain URL, no query) - or page-load ?cf1=1 for hand clips.
1. OFF == batch158/master: juice.mjs, juice2.mjs, riposte.mjs, boss-openings.mjs (frame-sensitive), audit-feel.mjs, hero-pass.mjs (also on master). Must be identical.
2. ON: same set again. Good = all green; audit-feel ON table shows mapped skills (lunge, whirlwind, shieldThrow, groundSlam, swordOfRealm, javelin, rainOfSpears, boulder, spikeRow, faultLine, avalanche, meteor, flashover) at stop 0.11 where OFF showed 0.065; a whirlwind on a pack does not stutter (<=1 heavy stop per foe per 0.30 s).
3. Stills at default speed 60%, demo heroes knight/warden/geomancer/ranger/pyro: strike strip frames 0-4 - hero shifted 2 px (3 heavy) toward face on frame 1, half on 2, back at 3; none with Reduce motion on.
4. One 8 s clip per demo hero, sound on: light string (3rd cut higher pitch), heavy (glint at half charge, white flash on hero at full, smear bright ~2 frames), two skills, one glanced blow (art on recover frame, swing timing unchanged).
5. Warden: tip hit = star + 10 px ring + 65 ms stop; mid-shaft = no star, duller knock. Pyro jet on a foe: flash + 2 embers + soft sizzle, NO freeze. A kill: low boom + music dip, no clipping.
6. n=6 knight vs wood + stockade, OFF vs ON: expect identical outcomes (feel only).
Good = nothing changes OFF; ON feels heavier on capstones only, jabs unchanged, no stutter, no new errors in console.

## What's New lines (<= 90 chars)
- Big skills now hit with real weight: a heavier freeze and kick on every capstone.
- Flames sizzle on foes instead of stuttering the fight.
- The Warden's spear tip now pops with a star; hit with the shaft and it thuds dull.
- Your hero leans into each swing, and heavy swings flash when fully charged.
- Hits sound different on wood, bone and steel; the third cut of a combo rings higher.
- Kills land with a low boom and a short dip in the music.
(check lengths: all under 90; line 3 is 83.)

## CF3 / CF2 / CF4 outlook on top of this branch (git merge-tree, order CF1 -> CF3 -> CF2 -> CF4)
- CF3: 1 conflict, src/main.js, ONE hunk: the adjacent URL-param lines (`?cf1=1` vs `?cf3=`) -> keep both lines.
- CF2: clean.
- CF4: conflicts src/main.js (same hunk: keep `?cf1`, `?cf3`, `?cf4` lines) and src/audio.js (1 hunk, not inspected: CF1 edited thwack/appended cfBoom/cfSizzle; CF4 appends its block at SFX end -> expected keep both).
- Cumulative sequence reproduced the same three files and nothing else. Throwaway branch deleted.

## Not verified
Any in-browser behaviour; hero-pass cause; real audio peak render (CF1 lane only did a naive sum 0.76 < 0.9); Reduce motion/Flashes visuals; demo-heroes' skill ids beyond the 13 table keys (ranger intentionally none).

## Questions (rec first)
1. Ship CF1 as the ONE feature of the next deploy? REC yes, after steps 1-6 pass.
2. Keep 14 px old tip ring beside the new 10 px (CF1 Q3)? REC keep; drop if the clip looks busy.
3. Whirlwind: every ring heavy but limited to 0.30 s (as built) vs last ring only? REC as built.
