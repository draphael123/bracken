# KINGSCENE lane report (11-04) - Kingswood -> Burning Village redo
Branch claude/kingscene (worktree bracken-kingscene), base claude/batch143 e9f7015c. Not merged, not deployed.

## What changed
- NEW BEAT (scene 'smoke', src/transitions.js + src/transitions-art.js), scene 5.4 s (was 8.0), row = walk-out 1.6 + scene 5.4 + fade 0.8:
  walk in (1 s) -> leader STOOPS and picks up Gorm's crown, raises it overhead (1.15-2.3 s) -> looks BACK at the wood (-face) as the smoke stands up and the goblin WAR HORN sounds (2.4 s, SFX.hornBlast = the Stockade/Chieftain horn, +2 px shake unless reduce-motion) -> turns (3.0 s) and the camera PANS right (2.2 s, parallax: hills 15%, trees 35/90%, road details 100%, fronds 130%) while the village scales from 46% to 100% of the screen width (a far smudge -> a burning town: 7 flame roofs, 3 big plumes, halos, ash) -> caption THE VILLAGE BURNS (house text, fitText'd, on the grass band, fades in 3.3 s, fades with the fade beat) -> fade -> MAP.
- Red standard heap, stump and the old crown-on-ground picture DROPPED (the crown is its own 16x12 sprite now). Sky/sunset palette, smoke columns kept.
- Thinner bars: entry.bar = 12 (was 22) via TRM.barIn(t, bar); skip hint 5 px, 45% opacity, tucked into the bar (other transitions unchanged: 22 / size 6).
- Map: ends on the map as before (endOnMap, never auto-loads, 11-02 17:53 rule kept); the spur node pulse stays and now the PATH from Kingswood to the village is LIT too (ember dots draw out from the junction in ~1 s and pulse).
- Co-op: every seated hero walks in (leader in front takes the crown, the others stand behind and turn with him). Reduce-motion: no pan/zoom/shake/flicker; one dip to dark at the cut to the village (smokePan(s, true) is a 0/1 step).
- Tool: tools/demo-transitions.mjs - updated SMOKE test, +6 KINGSCENE checks (beat length/order, stance, pan, reduce, caption, source wiring), DT_ONLY=kings>burning [DT_SEATS=3] [DT_REDUCE=1] env for six pictures of the one row.

## Checks run
node --check (transitions.js, transitions-art.js, main.js, demo-transitions.mjs): ok. node tools/demo-transitions.mjs: all 120 green (node mode). --browser, kings>burning row only, solo + 3 seats + reduce: all 142 green (clear credited, plays, ends ON THE MAP with the node lit, skip works, reduce, no errors). tools/demo-cut.mjs: all green. Browser used once at a time, gate flag absent, RAM ~4-6 GB free.
Proof strip: scratch\lane-reports\kingscene-shots\kings-only-k1..k6.png (solo, at scene 0.9/1.9/2.7/3.7/4.5/5.2 s), kings-only3-k*.png (3 seats), kings-onlyr-k*.png (reduce-motion). (after-kings-map-lit.png = the map the row ends on.)

## Owed
- Full suite not run (a gate runs this evening); only the transition-specific checks above. textfit not run (the caption is fitText'd to VW-40; one string, caps only).
- Horn is the shared SFX.hornBlast; no new audio. Daniel to hear it.

## Questions (recommended first)
1. Horn: keep the one blast at the crown lift (rec), or the Stockade's drawn breath (hornDraw) then blast, ~1 s longer?
2. Scene length 5.4 s + walk-out 1.6 + fade 0.8 = ~7.8 s total from the kill (the 'beat' proper is ~5.4 s): keep (rec), or trim the pan to 1.8 s?
3. Caption placement on the grass band under the village (rec) vs top of the sky.
