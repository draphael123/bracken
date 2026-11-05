# claude/lance6 PROOF 11-05 (sonnet) - the Queen's Lance page checks, n=12 rates, fixes
Branch claude/lance6, worktree bracken-lance6. NOT merged, NOT deployed (merge after the SAT 11-07 cut). Level hash unchanged (no level data touched).

## Checks passed (page, headless, one at a time, RAM >= 1500 MB each time)
- tools/lance4.mjs full (node + page): green after fixing a stale probe (the gate catch now reads STUNNED x3.5, was OVERRUN). LANCE4_NODE, stormhold4, watchtowers: green.
- NEW tools/lance6-page.mjs, per hero x8 (knight warden geomancer ranger pyro paladin pirate reaper), 30 checks each, real keys: span lines span1/3/5 (UP from the west lookout takes it, rides east to the far tower alive unhurt; a jump from the deck boards touches it; ridden WEST from the far end, facing west), gate stun (3 of 3 gates path: he runs into the dropped gate, STUNNED, x3.5, open), a blow lands >= 1.5x harder stunned, spear return (rolled with the real dodge key / missed by < 10 px / struck while stuck; a far spear gives none; one per window; none while stunned; ignores his shield), 15 bridge/road braziers+bells+lamps stand on a board or stone. 8/8 heroes green after the fixes below (pirate/reaper re-run after the timing tune; geomancer..paladin run in the same batch).
- tools/zipline.mjs storm, 7 heroes: green (39/39 each).
- hint-shown OK; textfit hints+bestiary: 453 screens, 0 overflow/truncation (the longer bestiary text fits).
- reach-heroes storm (--page): ok, 0 new crossings, 11 route targets for all 9 heroes.
- Node tools, each on its own: floating-geometry, floaters, demo-floats, anchor-lint, solid-islands, architecture, storm-floats: green (storm level: nothing floats). tells, boss-read, answer-tags, combat-feel, goblin-lint, one-new-foe: green. level-quality storm: only the long-standing 'bands' FAIL (8 bands, 32% second height; before and after, not mine).
- Screenshot: scratch\lane-reports\lance6proof-stun-clock-<hero>.png ("STUNNED X3.5" + the green clock bar over his helm, ring on the deck, "THE LANCE  OPEN" on the bar).

## Reds found and fixed
1. tools/lance4.mjs page probe still expected OVERRUN on a gate catch (lance6 made it STUNNED x3.5): probe updated.
2. tools/zipline.mjs counted ropes then took zipLines[0..n): the span lines are appended after the haul lines, so "ropes 4-6" were haul lines B/L1/L2 (the warden "failed" those) and the Lance's span lines were never covered. Now iterates indices and leaves the flat span lines to lance6-page.
3. REAL GAME BUG: THE RANGER COULD NOT RING A TOWER BELL, hit a signal post or send back a stuck spear. Her X is a shot unless a foe/gadget is in knife reach (ranger.js pointBlank -> main.js gadgetInKnifeReach), and arrows ignore props. Now a lance bell, a signal post and a stuck volley spear in knife reach are point-blank (X = knife). src/main.js gadgetInKnifeReach (+4 lines). Her gate/strike checks pass.

## Rate table: storm L18, BUILT (typical card + skills) WITH flasks (kit), human profile, normal, n=12/hero
| run | dials | kn | wa | ge | ra | py | pooled |
|---|---|---|---|---|---|---|---|
| a (seeds 1-12) | DUEL_HERO kn 1.1 wa 1.35 ge 0.85 ra 1.2 py 1.9 | 9/12 | 11/12 | 5/12 | 10/12 | 9/12 | 44/60 = 73% [61-83] HIGH-edge |
| b (seeds 1-12) | kn 1.2 wa 1.65 ge 0.7 ra 1.4 py 2.0 | 6/12 | 10/11 | 7/10 | 9/12 | 9/12 | 41/57 = 72% [59-82] (3 Chrome crashes) |
| **c FINAL (seeds 13-24)** | b's DUEL_HERO + timings: gate stun 3.0>2.6 s, spear stun 1.4>1.2 s, one return per 7 s (was 5) | 7/12 | 9/12 | 7/12 | 10/12 | 5/12 | **38/60 = 63% [51-74]** in band 60-70 |
The warden's wins are kiting wins (33-36 s, damage taken 0) so his DUEL_HERO dial barely moves him (11/12 -> 10/11 -> 9/12): the stun timings did the work, not HP (HP stays 3000). Resist floor untouched (only his damage on heroes + the stun windows moved). Individual heroes are +-25 pts at n=12; every hero >= 5/12 on the final run. Logs: scratch\lance6proof\rates12{,b,c}.log/json.

## Fixes (commits on claude/lance6)
tools/lance4.mjs probe; tools/zipline.mjs indices; tools/lance6-page.mjs (new); src/main.js DUEL_HERO.lance {knight 1.2, warden 1.65, geomancer 0.7, ranger 1.4, pyro 2.0} + gadgetInKnifeReach (lance bell/post/spear); src/lance-support.js LANCE4.stun gate.t 2.6, spear.t 1.2, spear.every 7.

## Still owed
- Co-op seats 2-4: not checked (the lance code reads the lead seat's P; the partner seats' spear return / span pickup / bell are unverified; the span lines + zip step are the shared engine).
- The span-ride screenshot came out black (headless camera on a zip), only the stun-clock shots are saved. The 'sign' at 225,17 still hangs 3 px (generic engine, post-demo).
- Mash row not run (mash-bot is a 40-min-class tool).
- A second n=12 on seeds 25-36 is the cheap way to firm 63% (CI 51-74), if the band matters before the merge.

## Questions (rec first)
1. Ranger knife-point-blank on bells/posts/stuck spears (REC built). ALT: let a fully drawn arrow ring a bell and spike a stuck spear (more ranger-feel, touches arrow code; post-demo).
2. Keep per-hero DUEL_HERO rows + the 7 s spear window (REC). ALT: one pooled scale.
3. The warden kites him in 33-36 s with 0 damage taken (spearDance): leave (REC, it is his kit), or give the Lance a reach answer later.

Final tip: see git log (branch claude/lance6 pushed).
