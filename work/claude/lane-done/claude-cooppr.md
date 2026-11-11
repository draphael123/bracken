# COOPPR - bleed-out alone, pings/markers, boss-reward credit (branch claude/cooppr from claude/coopai 21930666, worktree bracken-cooppr)

NOTHING WAS RUN IN A BROWSER (GATE-RUNNING.flag was up). Node-only checks below; page checks OWED.

## What changed
1. DOWNED-AND-REVIVE finish (Daniel 11-04 17:00). A downed hero whose 20 s clock runs out while the OTHER hero still stands no longer wipes the party: only HE wakes (downedPlayer sets p.bled; coopWatch runs bleedBack in his pass). bleedBack: his own deathCost (his XP/gold bundle; P1 also his bank stake; the rescuer is never charged), refilled flasks, full hp/stamina, 2 s grace, "BACK AT THE SHRINE". In a LOCKED boss/mini fight he is let back in at the arena entry (wallL+2 at the floor) instead of being locked out at the shrine. All down at once = today's party wipe (coopFall unchanged). AI bleed-out unchanged (allyStandUp). coopWakeBody() factored out of coopRegroup (shared). Help text (coop-help.js), COOP_RULES updated.
2. PINGS / MARKERS. New pure src/ping.js (pickTarget, makePings, holdSpot). One action `ping`: keyboard Y, pad L3, touch pill (only in a party; touch.js hasPing like hasStance), rebind row "PING / MARK" + card row. Press read in the pinger's own pass (also while downed = HELP mark on himself). Marks the best foe ahead within 96 px (bosses preferred), else the floor spot 56 px ahead. One per seat, 4 s, seat colour, follows the foe, edge arrow when off-screen, drawn by the host so online guests see it. Online: 'ping' added to online.js PRESS and online-guest.js (key, pad, touch env). AI partner (allyTick): a person's foe ping = fought first (-300 score, bypasses stray/near/reach limits), a spot ping = walked to for 6 s (route/lip code reused for a row change), then back to the leader.
3. ITEM / UNLOCK CREDIT (X2). Finding: charms, skins and store items are bought in the store (no pickup exists in a wood), so the real earned things are a boss beaten (PROG.bossDown: the road to buying the hero it opens, e.g. Death Knight) and a boss's weapon (swords.chiefaxes). coop-save.js: credit flags may now be 'bossDown:<level>' / 'swords:<id>' (UNLOCK_RE, validated, junk dropped); applyCredit writes them to HIS save. main.js partyUnlock() called at all 5 bossDown sites + the Chieftain's axes, noting every non-AI seat ledger. Old guests ignore the new flags safely (their cleanCredit drops unknown flags).
4. Level-up card for seats mid-wood: already not shown (ring + heal only, pick owed and offered in his own game) - nothing to build.
5. Pair/synergy: not built (rejected). Co-op scale untouched.

## Files
src/main.js, src/ping.js (new), src/coop-save.js, src/controls.js, src/touch.js, src/online.js, src/online-guest.js, src/coop-help.js, index.html (modulepreload), tools/ping.mjs (new), tools/coop-unlock.mjs (new).
Commits on claude/cooppr: step 1 bleed-out; step 2 pings (+ bleed down-clock fix); step 3 unlock credit; report.

## Node checks run
node --check on main/touch/controls/online/online-guest/coop-save/ping/coop-help: OK. tools/ping.mjs ALL OK (22 cases incl. controls: ping on Y/L3 shares nothing with dodge/guard). tools/coop-unlock.mjs ALL OK (8). tools/xp-share.mjs, tools/ai-route.mjs ALL OK. tools/modulepreload.mjs: 738 listed, 0 missing. NOT run: tools/check.mjs.

## Browser checks OWED (after the gate flag is gone, one at a time, >= 1500 MB free)
- Bleed-out: tools/ai-companion.mjs fight + a 2-seat local run: let P2 bleed 20 s with P1 alive (only P2 respawns, own bundle, P1 keeps going); both down = wipe; revive at 19 s still saves; bleed during a locked boss (entry spot sane for each arena - wallL/floor are assumed to be column/pixels as setWall/doorSpot use them); bleeder as P1 with an AI partner; the leash may pull a respawned hero up beside the leader after ~1.6 s (existing behaviour, probably wanted).
- Pings: press Y / L3 / touch pill in a 2-seat wood (marker colour, edge arrow, HELP while downed); AI goes to a spot ping and fights a pinged foe; online guest press path (online-coop.mjs); touch layout overlap with the new pill (tools/touch.mjs, audit-touch.mjs) and textfit (tools/textfit.mjs) for the new rebind/card rows and help line.
- Credit: coop-progress.mjs / online-coop.mjs; a saved seat beating a boss gets bossDown in his slot.

## Questions (rec held; built the rec)
1. Keyboard ping: Daniel said V, but V is the DODGE default. Built Y (no default shares it). Alternative: move dodge to Shift only and give V to ping. Rec: keep Y.
2. Pad ping: Daniel said LB, but LB/RB are both the C guard. Built L3 (skill-three button, no slot behind it). Alternative: guard on RB only, ping on LB. Rec: keep L3 (does not touch combat feel).
3. Bleeder in a locked fight returns at the arena entry rather than the shrine (otherwise he is locked out until the fight ends). Rec: keep.
4. AI pings back ("ALLY WAITS" marker) not built: it already says WAITS/NO WAY UP/STUCK over its head. Rec: leave.
5. Lever/door verbs for the AI via a spot ping (coopaudit B): a ping only walks it there; pressing is not done. Rec: later lane if levels need it.
6. Hard-drop credit loss (X3), seat bundle not persisted (X5), mixed-level hints (M1/M2): untouched.
