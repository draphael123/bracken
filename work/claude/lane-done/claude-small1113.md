# SMALL1113 (code-only, node only; no browser launched). Branch claude/small1113 off 120218424. Nothing merged or deployed.
Player-facing change: only job 6a (one co-op rules line, shortened). A What's New line is optional; suggest none.

## 1. gq2-lab 'her portal shards fly at seat two' - DONE (test only)
Cause (proved by a seeded sweep and a node ray check): src/gqueen-hands.js openPortals picks 2 of 6 wall anchors with Math.random (3 per wall, x A.x0+4 / A.x1-4). The test stepped 60*4 = 4.0 s after the tell. Timeline: tell 1.0 + glow 0.9 (+0.35 gap for the 2nd) = 1.9-2.25 s to fire, then a shard from the EAST wall flies ~480 px at 210 px/s = 2.3 s, so 4.2-4.6 s > 4.0 s. Both portals on the east wall = C(3,2)/C(6,2) = 20% of casts => 0 hits (matches ~2 in 6). A ray check showed all six anchors hit seat two when given time (no geometry block).
Fix: tools/gq2-lab.mjs step(60 * 4) -> step(60 * 8) on that line, arithmetic in a comment. No game change.
Proof: seeded Math.random (LCG preloaded with node -r): seed 11 failed before; seeds 1..40 now 0 fails; plain `node tools/gq2-lab.mjs` ok; gq2mech all ok.
Browser owed: none. gq2-lab does not need to go on the release.sh flake list.

## 2. weak-bosses (phase two furrow hit under load) - DONE as a tolerant change, cause NOT pinned (needs a browser)
Read: the sim is manual and fixed-step (BK.sim = update(1/60)), so frame counts are not load-sensitive. Wall-clock inputs found: performance.now() in hitstop's coopStop duty (src/main.js 8307, src/juice.js) which changes freeze LENGTHS run to run; and leftover hero state (P.dodge / P.knock / P.vx / a live hitstop) from the preceding head() test, which fresh() does not clear. The furrow burn (main.js 16163) needs P.y > floor-10 and damagePlayer returning 'hit' (inv / dodge / knock / a live stop change that).
Change (tools/weak-bosses.mjs furrow()): clear P.dodge/knock/vx/vy and sim 40 frames to drain any leftover stop before fresh(); P.inv=0 every frame; loop cap 150 -> 420 frames (it still breaks as soon as the mode is back to walk). Second likely cause if it still fails: the 150-frame cap itself (tell 60 f + burst 27 f + any hitstop) - already widened.
Proof: node --check only (the tool is browser). BROWSER OWED: run `WB_ONLY=plough node tools/weak-bosses.mjs` 3x inside a loaded gate.

## 3. hc3art-sheet rewrites tracked pngs - DONE
tools/hc3art-sheet.mjs default output is now an untracked audits folder (gitignored; created on demand); an explicit path arg still works. Run: "hc3art: all ok (47 frames)", git status clean afterwards. The header comment names no path (dangling-paths lint flagged my first wording; fixed and green). The two tracked pngs in work/claude/lane-done stay as they are.

## 4. the whale tool - skipped (sea branches only). Note: the relay says its '30 s blows' roll is flaky; the same seeded-roll treatment applies when it lands on master.

## 5. 'bar notch on struck teach shard' - DESCRIBED ONLY, not a draw bug
It was never built: the gq5q2 report (item 1) says the notch is NOT built, only the number, ring, burst, shake and flash. The hook is on the UNMERGED branch origin/claude/gq5q2 (its gq5q2 module, line 65) sets e.q52Notch = tn() + 0.9 on a struck teach shard. Nothing on master reads q52Notch (0 hits in src) and that module is not on master, so there is nothing to fix on this base.
Exact change (after gq5q2 merges): in the boss bar draw (the CF4 ghost/chip bar; src/cf-hud.js ghostOf feeds bar(..., frac, col, ghost)), when boss.q52Notch > time draw a 2 px bright tick across the 8% span left of the current HP edge, alpha = (q52Notch - time)/0.9. Needs a browser look. REC: fold into the gq5q2 release or the next HUD pass.

## 6. By reading only (nothing run)
a) textfit 'coop locked' OFFSCREEN - APPLIED. src/main.js COOP_RULES line 2 ('LEAVE HIM 20s AND HE WAKES AT THE SHRINE ALONE, PAYING HIS OWN COST') measured 359 px on the 320 px view (box [-19,135,359,7] in scratch/lane-reports/cf4/logs/tfm/textfit.json; the old code comment claiming it was measured to VW-8 is stale). Now 'LEAVE HIM 20s: HE WAKES AT THE SHRINE, PAYING HIS COST' (54 vs 66 chars, ~294 px at the same px/char). Browser owed: textfit frame 'coop locked' to confirm x0 >= 0 and width <= 312. The line shows only on the co-op pick screen; no tool greps the old text.
b) textfit 'boss fight witchlight mini' OFFSCREEN 'HE CHARGES' (main.js:36706, the CF4 number draw) - DESCRIBED. The clamp is horizontal on nw = inkW(text, TYPE.popup) and vertical py4 = min(VH-9, py); the saved json kept only the coop box, so I cannot see which edge fails. Candidates: (1) the 'outline' stamp is wider than inkW by its pad, so x0+w passes VW+1 at the view edge: clamp with textW(...)+4; (2) the stamp is taller than 9 at the bottom: use VH-12. REC: rerun textfit once, read box[] for that row, apply the matching one. Not applied (needs the box).
c) textfit 'whatsnew scroll 0' CLIPPED ('- Groundwork for a new Goblin Princess fight is in; it is switched off', docs/updates.json:33) - DESCRIBED. The draw loop (main.js ~37256) already refuses a wrapped row that will not fit whole (r.more guard), so the clip is the textfit's wrap vs the panel wrap or the row against the footer. Safest fix is content: shorten the entry to one line ('Groundwork for a new Goblin Princess fight (switched off).'). Not applied: updates.json has seed/hash tests (wnseedproof) I cannot run without a browser.
d) mobile-perf title 38 fps vs 40 (37.6 on untouched master too) - DESCRIBED. The title has no frame skip and per frame does 2 full-screen 'multiply' fills, a 'lighter' createRadialGradient whose radius moves (46 + sin*2) every frame (main.js ~37655, a new gradient object per frame), cloud rects, 16 smoke rects and the cast walk-in. Proposed: bake the campfire glow once into a small canvas and drawImage it (drop the radius wobble or scale 0.96-1.04); cache the two multiply washes as one layer. Alternative: a per-scene fpsMin table in tools/mobile-perf.mjs line 81 (title 35). Not applied (needs the fps run). REC: the gradient bake, then rerun MP_SCENES=title.

## Checks run
node tools/gq2-lab.mjs ok (plain + 40 seeds), gq2mech ok, hc3art-sheet ok, architecture ok, comments ok, dangling-paths ok, node --check on src/main.js and the three tools ok.
Not run (browser): weak-bosses, textfit, mobile-perf.
Files: tools/gq2-lab.mjs, tools/weak-bosses.mjs, tools/hc3art-sheet.mjs, src/main.js (one string).
