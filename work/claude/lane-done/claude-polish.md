# POLISH lane: done (claude/polish)

All five items are pushed to `origin/claude/polish`. Nothing went to master, nothing was deployed, and the full `npm run check` was not run. Every commit is green on the subset checks listed below. `origin/master` was merged in first (1a8b793).

## Commits per item

| Item | Commit(s) | What |
|---|---|---|
| 1. Geomancer art | **9a1c1a3** (verified here after the merge; pushed as 1a8b793) | Grey-brown hood and robe, with moss kept on the mantle stones, the rune and the stave crown. Stave head is a lopsided, blunt standing stone lashed to a thick shaft. |
| 2. Practice yards | **cc14a7a** | THE WARDEN'S TRIAL and THE GEOMANCER'S TRIAL, plus a new check `tools/hero-trials.mjs`. |
| 3. Unburied creatures | **613c157**, then **3c52ae5** | First Death Knight: great helm (fin crest, bone horn, visor slit, breaths), tattered cloak, crescent scythe. **Standard-Bearer skipped on Daniel's instruction.** 3c52ae5 puts his art back byte-for-byte. |
| 4. Hero pick | **8f5ef85** | DEATH KNIGHT's name is clamped on-screen, HARDER moved onto the health line, and textfit now draws `pick` and `practice`. |
| 5b. Death Knight hero art meets hitbox | **07d27eb** | Only the art is longer; his reach is unchanged. |
| 5a. Queen: chandelier replaces walkway | **6ac9c23** | Gallery removed. Six low chandeliers; cutting one pins her exactly as the gallery did. New check `tools/queen-chandelier.mjs`. |

## Before/after images (all committed)

- Item 1: `docs/polish/geomancer-frames-{before,after}.png`, `docs/polish/geomancer-ingame-{before,after}.png`, `docs/polish/geomancer-ingame-before-after.png`
- Item 3: `docs/polish/unburied-foes-{before,after}.png` (Node sheet), `docs/polish/unburied-bigs-ingame-{before,after}.png` (real page, BK.step renders; the Standard-Bearer row is unchanged)
- Item 4: `docs/polish/hero-pick-{before,after}.png`
- Item 5b: `docs/polish/deathknight-blade-{before,after}.png` (the red line is the box's front)

## Item 5: what was already built

- **(a) Queen's walkway / chandelier: NOT built.** `gqOpen` was still `mode==='pinned'`, and only `gqDropSection` (the gallery pillars) set it. A falling chandelier only dazed her, and only in round two. The chandeliers hung 112 px up. Built in 6ac9c23. A11 and A12 still hold (arena-supplies is green).
- **(b) Death Knight art vs hitbox: NOT built.** Measured with `audit-hitboxes --hero`: the live swathe frame was drawn to 22 px against a 31 px box, because its point was cut off at the 34-px canvas edge. The planted heavy was drawn to 18.3 px against 31. After 07d27eb both are drawn to 31.7 px against 31, and the box is untouched. (The 24/28 px in QUEUE were measured on older boxes.)

## Checks (subset runs; all green at push)

`hero-trials` (new), `queen-chandelier` (new), textfit (the check's full list, now with pick and practice), skill-menu, starter-kits, ability-poses, attack-animation, combat-feel, render-layers, geomancer, unburied, unburied-fights, tells, boss-openings, arena-supplies, boss-fight-end, crown-route, crown-requests, gallery-runtime, queen-comb, progression, progression-runtime, comments, syntax. Also signs, dressing, floaters, audit, content-audit, traps, killzones, collectables, spawns, deadends, keys, elites, one-new-foe, threat-holes, talents, skill-passives, pixels, skins, store-preview, readability, undercrown-variety, homepaths, dangling-paths.

**Re-runs:**
- gallery-runtime failed once in a batch (it uses a fixed port, 5995) and was green when re-run alone.
- hero-trials and signs failed on their first run, and those failures were real. The Warden's first sign ran to 3 lines, so it was shortened. The harness also had two bugs of its own: it did not release the pin before moving to the next station, and it ran with god mode on, so the drills' blows never reached the deflect or the wall.

**Red-first proofs:**
- hero-trials: failed on the old code (no yards; "not built" lines). The off-beat Geomancer wall counted when the old palOpened rule was put back.
- textfit pick: OFFSCREEN "DEATH KNIGHT" and COLLIDE "HARDER" on the old draw code.
- queen-chandelier: every assertion failed on the gallery build.

## Parked questions, with recommendations

1. **The Queen is harder than she was.** Boss lab, crown, 7 heroes, refill health:
   - Before (gallery): 7/7 won in 70-117 s.
   - After (chandeliers): 6/7 won (warden 96 s, geomancer 60, pyro 231, paladin 65, pirate 132, reaper 89); the knight timed out at 16%.
   - Damage taken per minute rose (136-420, up from 34-180). The bot gets roughly 4-7 pins a fight, fewer than the gallery's wide sections gave it.

   **Recommendation:** play her by hand before tuning. If she drags, widen the chandelier's catch on her (now `e.w/2+7`) or shorten the re-hang time, rather than lengthening the pin, so she stays pinned "exactly as the gallery did".

2. **Her gallery-leap attack (gLeap/gPerch/gDrop) is now unreachable**, because it needs gallery pillars. Round two still changes (the windows go out and the storm gusts start), but it has lost an attack. **Recommendation:** decide whether round two wants a replacement, for example a leap onto the dais.
3. **The Geomancer's beat in her yard is GEO.perfect (0.2 s flash-to-cut).** That is honest to her wall's real window, but tight for a human. **Recommendation:** keep it; if it proves too tight in play, widen GEO.perfect itself rather than the yard.
4. **The Death Knight hero's rising cut (rise:1) is still drawn 4.2 px short of its box.** It comes from the shared directionalPoses and was not part of the decision. **Recommendation:** fix it with the next pose pass.
5. **Item 3 was seen on the forest look only**, because this branch does not carry claude/unburied-look. **Recommendation:** after merging, re-shoot the captures on the graveyard look.
6. **Item 4's name clamp puts DEATH KNIGHT a little left of its own card.** Nothing collides and it reads fine. **Recommendation:** leave it.

## Unverified
None of this was played by hand. The yards were played by the harness, the Queen by the boss-lab bot, and the art was judged in page captures.
