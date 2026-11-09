# claude/gq3art - GQ3 art pass (Frog King bar), off claude/gq3 (f42b911ca). NOT merged, NOT deployed.
Drawing only: no gameplay number changed. Cosmetic: the Princess's boss body now lies 3.2 s (was 1.4) so her body reads.

## Drawn
- Queen poses 28-40 (src/chars.js, GQ_FRAME in main.js): geodeTell x2, geodeThrow, blink-in x2, stumble-out x2, desperation (stormTell/stormFire), kneel-beaten, rise-clutching-crown, back-into-portal x2, intro rage (wake). Old ids 0-27 unchanged (41 frames).
- Princess (goblin_princess_art.js, 40 frames): reel 33, kneel-ringing 34-35 (bell swings per ring), collapse 36-37, hurt moved to 38 (main.js shows length-2 as hurt: gprincess added to C3_DEAD), body 39 (tiara rolled, handbell on its side; spawnCorpse sets lastFrame).
- src/redraw/gq3_art.js (new): ROYAL PORTAL 48 px (open x3, idle x4, snap x2; tints royal / white exit / gold crown / green reinforcement / step = the player's shortcut with chevrons), rings (dormant + lit), geode x3 rot + grinding tell + landing mark + shatter + floor shards, tower shaft room (ashlar, slit windows) + timber floors smoke/burn + stairwell curbs + falling beam (2 lean variants) + impact + hatch, parapet walks, stone steps, bell cupola (replaces the chimney art), bays idle/smoke/burn, new roof back (hatch fire column, spires), Stair: dropped portcullis gate, flights + rails, catwalks, geode grille (intact/smashed), counterweights (hung/dropped) + pivot slabs, geode store room, hoard alcove, gallery balustrade + banners.
- Hooks: gqueen-hands (art3 fallback to greybox), gobgeo-hands (weights/grille), main.js (paintRoom styles gq3shaft/gq3store, roof back), interiors renamed in gq3-tower.js / queen-stair.js, modulepreload --write (780).

## Checks (node, exit 0)
gq3art-sheet (new lint), gqueen-art (41 frames), hc3art-sheet, gqueen3, gq2-lab, gq2mech, gprincess, queen-stair, gobgeo, goblin-lint, dangling-paths, modulepreload. In-play stills: tools/gq3art-shots.mjs, zero page errors. textfit NOT re-run.
Stills + sheet: scratch/lane-reports/gq3art-sheet.png (+ gq3art-stills/, gq3art-parts.png).

## Owed / weak
- Stills not captured: P2 blink/stumble/storm ring tints and bays burning in play (the random chooser did not reach them in 100 s); art is in the Node sheet. Queen flee stills are small (wide camera).
- The Queen's tower "seen ahead" pose is still the stand frame; her hop art unchanged.
- textfit full sweep, n=6 tune, camera 8.3 feel check, boss mash rows: unchanged owed from gq3.
