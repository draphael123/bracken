# DKLIFT (claude/dklift, 11-08) - DEATH KNIGHT "TOPPLE THE STANDARD", code only, flag OFF
Brief: scratch/brief-bosslift-1108.md 2 (Daniel approved). Plan: scratch/lane-reports/bosslift-plan.md (DK section, all 8 recs accepted).
Branch: claude/dklift off master 85d152eb8. Tip: e30582577 (pushed; this report rides in it). Worktree: bracken-lanes/bracken-dklift

## Flag
- `BOSSLIFT_DK_SHIPS = false` in src/unburied-foes.js. Switch to see it: `?bosslift` in the URL, or `globalThis.__BOSSLIFT = true` (the same switch as the Frog lift; PVP_SHIPS pattern). `bkLiftOn()` is read live.
- Flag OFF = live fight unchanged: tools/dk-topple.mjs (f) - a fixed-seed 240 s scripted fight (hero circling, swings, heavies, dodges, blows landing, both poles cut on a clock, adds,
  P1 -> P2) through updateBloodKnight + bkHurt hashes db0e8493a98ac40e with the flag off, the SAME hash as master's src/unburied-foes.js; flag on hashes differently (teeth).
  Flag off the poles stand at the old stdIn 64. The one main.js hook is reached only by the lift-only 'pinned' mode; the lab.js bot lines are behind bkLiftOn().

## What's built (numbers in UNB.bk.lift)
1. TELL: each standing pole has a greybox FALL SHADOW (violet strip arc0..arc1 = 4..52 px out on both sides), red + pulsing on the side he stands in.
   First time he is ROOTED under a pole: "HE STANDS UNDER HIS STANDARD" (once a fight) + a 'creak' sound key (unmapped - art lane).
2. ACTION: cut a pole with any blade (existing hitbox). It falls the way the blow travels (the hero's facing), fallT 0.35 s (the greybox fall anim uses it).
3. PAYOFF: it lands on him while ROOTED (committed drag cleaveTell, cleave, stuck, wrench, priceTell, crescent, ward, drain, raiseTell/callTell/raise, + reel) ->
   "THE STANDARD FALLS ON HIM": PINNED 2.6 s (P2 2.2 s) at openMul 1.6x, the ward breaks if up (breaks++), price/drag/drain/raise in flight are cancelled.
   A pin pays at most 0.10 of his HP (170 of 1700): the blow that reaches the cap lands (never less than 1x) and "HE THROWS THE STANDARD OFF" -> wrench 0.35 s -> his usual guard.
   main.js: hitstop 0.12 + burst on the pin; module: shake 7, 'heavy'+'crack'. Greybox: the pole across his back; frame 25 (reel) for 'pinned'.
   A cut while he wards breaks the ward at once (existing rule) and the pole then lands on him reeling -> pinned too.
4. FAILURE: in the arc but not rooted -> "HE STEPS CLEAR" (he steps to arc1+8 past the pole), no pin, the pole is spent until the surge. Out of the arc: the old result.
5. Poles stand lift.stdIn 84 from the walls (was 64) - arena is 624 px; tomb ledges at 128-192 px from each wall, poles at 84.
6. PHASE 2: every dead man he raises is BOUND to the nearest standing pole (greybox violet thread to it). When the LAST pole falls in P2:
   "THE LAST STANDARD FALLS: HIS DEAD LIE DOWN" - all lie down for good (layDown, laid, modeT 1e9), 'call' leaves his rotation (becomes 'string', also the surge's own call),
   and the ward breaks on fill as normal (no pole up). The surge re-stands the poles once (existing): the last P2 fall is final.
7. BOT / AI partner (src/lab.js bloodknight branch): TOPPLE - he is rooted in a standing pole's arc and the bot within 60 px on its far side -> walk to pole-12, face him, strike.
   LURE - ~30% of his P1 walks (rolled per stalk), back behind the nearer pole on its own side. The fed-ward pole cut now goes from the pole's far side. 'pinned' joins the open set.
Resist: unchanged - FULL DAMAGE outside openings (no passive shell, Q4); the ward face is a guard broken by fill or a pole. Never invulnerable.

## Files
src/unburied-foes.js (UNB.bk.lift, flag, bkRooted/bkInArc, bkLiftStep, pinned in bkOpen/bkHurt/updateBloodKnight/bkFrame, call removal, greybox bkLiftDraw, BK_LIFT_SAY in BK_LINES);
src/main.js 1 tagged hook line (updateBloodKnightBoss, pin hitstop/burst); src/lab.js bloodknight branch; tools/dk-topple.mjs (new); tools/unburied-fights.mjs (last line imports dk-topple, so the suite carries it - check.mjs untouched to merge clean beside froglift).

## Checks run (node, one at a time, no browser)
dk-topple ok (a-h; mutation-checked: bkRooted forced false -> 8 reds) | unburied-fights ok | unburied ok | unburied-art ok | comments ok | blow-tags ok | answer-tags ok | first-cards ok | node --check main.js / lab.js ok.
ai-companion: 5 FAILED - the SAME 5 fail on master's src (title-menu/PLAY WITH AI rows from batch154), not this lane.

## Owed
- ART (BOSSLIFT-DKART, sonnet): pole topple 3 frames with cloth whip, PINNED pose (reel + pole across back, ward shatter), fall-shadow strip, bound-thrall thread, collapse puff; sounds 'creak' + a heavier pin impact.
- Page tools NOT run (release gate holds RAM; no headless browser): deathknight-pilot (plan: topples >= 4/6 with the flag on), dk2, blood-kit, boss-openings, boss-greed, rule-openings, untold-told,
  mark-integrity, lab-reach, no-hidden-hits, hint-shown, weak-bosses, unburied2/3-shots, boss-rates. Browser stills: topple -> pin, P2 collapse, the 84 px poles against the chapel walls.
- n=6 tune (BOSSLIFT-TUNE) with the flag on: knight/warden/pyro, kit flasks, NORMAL, unburied L29-32. The pin is an extra opening - HP or a shorter pin likely; not tuned here.
- Nightly suite.

## Questions (rec built)
1. A cut during the ward breaks it at once (old rule) and the falling pole then pins him reeling - so a ward cut in the arc gives break + pin. Rec: keep (the brief's "breaks the ward" moment, now with weight); tune lane watches the rate.
2. 'reel' counts as rooted (beyond the plan's list) so (1) works. Rec: keep.
3. Stepping clear moves him to 8 px past the arc (reads as a sidestep). Rec: keep; art lane gives it a step pose.
4. Adds raised in P1 that live into P2 are bound too (all lie down with the last pole). Rec: keep (simpler, matches "his dead lie down").
