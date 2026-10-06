# claude/djinn5 - THE DJINN, after Daniel played DJINN4 (2026-10-06: "still a little too challenging")

Base: origin/master a0a42905 (batch72, has DJINN4) + a merge of origin/claude/bot2 (the standard bot: tools/boss-rates.mjs, src/bot-profile.js,
src/lab-perceive.js). bot2 is already in batch73. The merge had two small conflicts: the F9 recorder key line in src/main.js (both lines kept) and the
check list in tools/check.mjs (master's list plus 'playrec'). The coordinator gets the same result from batch73.
Owned files: src/djinn.js, src/djinn-hands.js, src/redraw/djinn_art.js, src/hint-lines.js (the Djinn's block), tools/djinn.mjs, tools/djinn-pail.mjs.

## What changed, per item

1. **No passive water damage, in any phase** (src/djinn.js stepFlood, DJ.dmg, P3_HARMS, MOVE_NAME; src/djinn-hands.js).
   - The deep-floor tick is gone ('deep' removed from DJ.dmg, P3_HARMS and MOVE_NAME). The dead shallow-flood tick code is gone too (flood was already 0).
     The tide still surges over the ledges and ebbs back. It is told and drawn the same, and it costs nothing.
   - The lines "THE DEEP WATER: GET UP ON A LEDGE" and "THE FLOOD COSTS YOU..." are removed from the code and from hint-lines.
   - Only his told blows hurt: the spout (and its hold), the wave, the slam, the fist from below, and the whirlpool under the shaft.
   - The bot no longer climbs a ledge when the well surges. The answering hero in tools/djinn.mjs stays on the floor through the high water and is
     still never hit. It had a gap: it walked home under the shaft during a wave tell. It now waits 110 px off, as a player would.
   - New check: a hero who stands on the floor by the windlass through two tides and never answers takes 0 blows from the water. Every blow he takes
     is a told move.
2. **Longer staggers**: mud 3.5 -> 4.7 s, douse 4.0 -> 5.4, bail 5.5 -> 7.4 (each x1.34-1.35), choke 2.0 -> 3.0. The 3 s told ward after each is
   unchanged. Asserted against DJINN4's numbers. tools/djinn.mjs's old mud ceiling (<= 3.8) is raised to <= 5.0: a design change from Daniel's brief.
3. **A way to hit him in the water while he moves** (src/djinn.js upInFlood / stepPails / openUp 'reel').
   - **THE REEL**: E throws the pail whenever he is UP in the flood (a column: not spilled, turning or open) and not warded. If he is not rearing, he
     REELS:
     - 1.2 s still (B4) and open, with the shared OPEN ring and clock (B10);
     - his current blow is cut off (rings, hand and hold cleared);
     - the throw takes 0.8% of him, and blades bite x2.5 up to 1.2% more;
     - he turns to the thrower;
     - then his 3 s shroud (B3). Told: "THE PAIL HITS HIM: HE REELS. CUT HIM". The bar reads "REELING".
   - The rear's choke stays the bigger throw (4% max, 3 s) and the bail the biggest (7%, 7.4 s). All asserted.
   - **The pail flies AT HIM** (it follows his core), so a column gliding across the hall is hit too.
   - **No long wait for the middle**: he crosses to the shaft (wave, whirlpool, draw) at colRush 120 px/s instead of 80. From the far side he is
     there in 2.6 s, and the pail reaches him on the way. Blows aimed at you still come from 96 px off you (unchanged).
   - Same verb and keys as DJINN4's pail: E (keyboard) and the INTERACT button (touch) scoop and throw. A strike throws only at a rear, so a cut is
     never eaten by the pail.
   - Bot (djinnPlan 0c): full pail, he is up and in range, ward down; it reads 0.25 s late and lets 25% go. It throws a step off the windlass, but not
     when the bucket hangs ready and he is under the shaft or drawing.
   - tools/djinn-pail.mjs "not rearing" now asserts the reel for all 7 heroes; it used to assert the old splash. tools/djinn.mjs checks the reel
     during hover, glide, upsurgeTell, whirl and drawing; the pail following a gliding column; and the splash off him when he is bailed out.
4. **Numbers**: the standard bot (`PORT=8673 node tools/boss-rates.mjs welltown --ways=practiced --seeds=16 --jobs=1`), profile human, campaign L31,
   16 seeds per hero. Logs are in work/claude/djinn5/r2-r7.log. Tuned only through the P1/P2 opening cap (openCap); health is unchanged.
   | openCap | knight | warden | pyro | all |
   |---|---|---|---|---|
   | 0.046 (DJINN4) + items 1-3 | 13/16 | 3/16 | 11/16 | 56% |
   | 0.048 | 12/16 | 4/16 | 12/16 | 58% |
   | 0.050 | 11/16 | 5/16 | 12/16 | 58% |
   | **0.051 (shipped)** | **11/16** | **6/16** | **12/16** | **60%** |
   | 0.052 / 0.053 | 15/16 | 5/16 | 13/16 | 69% |
   - Why the warden is lowest: per-move damage probes show it is P1/P2. She eats 2-4 dust devils (24 each) and the fire lash, which the knight's
     shield takes. She dies at 36-45% boss health. P3 is now easy for every hero: knight and pyro reach it with most of their health.
5. **Mash**: re-stamped via tools/mash-bot.mjs, LEVEL then BOSS (see below).

## Checks run (green, PORT 8673)
djinn (119, node), djinn-pail (36, page), welltown (42), boss-greed, boss-openings, boss-fight-end, hint-shown, tells, answer-tags, untold-told,
verb-matrix. Mash (tools/mash-bot.mjs --write, LEVEL then BOSS): boss 0/6 (boss left 100% each), mini (the Gang Leader) 0/6, level: every hero dies (knight, warden, pyro lowest 0%). mash-gate green.

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)
1. **The reel is a short OPEN** (1.2 s, ring and clock, then the 3 s shroud), not a stagger you cannot cut. Rec: keep. It reads like every other
   opening (B10), the throw's own 0.8% lands from any range, and close heroes get a cut. Alt: a pure stagger (no cut, no ring), with no shroud after.
2. **A shroud after every reel** stops a scoop-throw-scoop stun-lock, because the scoop is instant. It also turns a bucket for 3 s. Rec: keep.
   Alt: a 3 s pail cooldown with no shroud, so the bucket still works.
3. **He crosses to the shaft at 120 px/s** (DJINN4 slowed all glides to 80 for longer gaps). Rec: keep for the shaft only. Alt: keep 80, since the
   pail now hits him on the way.
4. **The surge stays but is harmless.** The well still rises over the ledges, and the bucket's bail still makes it ebb. Rec: keep it as a told
   change in the hall, which also gives the whirlpool/surge rule a reason. Alt: drop the surge altogether, a calmer P3.
5. **The warden is lowest (6/16) because of P1/P2.** Rec: leave it for your playtest; the overall rate is at the top of the band. Alt: dust devil
   24 -> 20, which helps the shieldless heroes most.
