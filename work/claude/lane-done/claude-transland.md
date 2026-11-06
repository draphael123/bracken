TRANSLAND DONE 11-06 16:03 READY tip 0ad7b27a5

PART 1 - float fix (src/main.js trnBegin/trnUpdate/draw)
Cause: the transition walk-out is kinematic (tr.pos[i] copied the hero's x,y at trnBegin and only x moved), so a hero airborne at that moment (jump, dash, plunge, cling, swim, ladder/rope) was drawn at that frozen y for the whole cutscene.
Fix: every seat now gets landY (first floor below: SOLID/CRATE/PALISADE/PORT/SOFT/ICE/WEB, three foot columns) and FALLS under the normal GRAV (cap 400) from the moment the transition begins, lands with the hero's own 'land' pose frames + dust + land sound, and only THEN walks (x is held until grounded and landing pose done; walk 'ready' waits too; walk cap +1.0 s when anyone starts airborne). A drop over 7 tiles starts from 7 tiles above the floor (placed, not a long tumble). p.y follows so the camera is not left floating. Fall pose uses 'fall'/'jump' frames.
Arrival side: unchanged code already places heroes on the START floor (y = (START.y+1)*TS); the new rows assert solid footing after arrival. Skip: MIN_SKIP 0.8 s is longer than any fall (<= ~0.55 s), so a skip cannot land mid-fall; a skip right after an airborne start (air-skip row) goes through fine. The kill-to-win delay runs normal physics, so in play the airborne window is the one at trnBegin (gate-end rows, quick kills); the test hovers the party at trnBegin to reproduce it.
Evidence: tools/demo-transitions.mjs --browser: 221/221 green, includes 4 new airborne rows (marsh>fenroad, spore>rootway with 3 seats, palisadewood>kings with skip in walk, hornetsnest gate-end): every seat starts above its floor, falls, shows the landing pose, never walks before landing, transition plays through, arrival on solid ground. Before the harness fix the same rows' pre-fix state showed grounded (no repro) - rows were re-aimed to hover the party at begin. Logs: scratch/lane-reports/transland-run3.log.
Branch claude/transland pushed (worktree bracken-transland). Not merged, not deployed. Owed: hand check in a real mid-air boss kill and with a rope/ladder/swim hero.

PART 2 - review clips (tools/transition-clips.mjs: in-page canvas.captureStream + MediaRecorder at the game's own speed, ffmpeg found on this PC -> H.264 .mp4, 1258x622, 30 fps, faststart)
Each clip runs from the boss kill (gate rows: from the party at the gate) to control on arrival (row 10: to the world map). Dir: C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/01-wood-hornetsnest.mp4  13.4 s  1.60 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/02-hornetsnest-marsh.mp4  16.3 s  1.28 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/03-marsh-fenroad.mp4  14.0 s  1.70 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/04-fenroad-stockade.mp4  13.9 s  1.32 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/05-stockade-spore.mp4  6.2 s  0.56 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/06-spore-rootway.mp4  14.5 s  0.79 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/07-rootway-underleaf.mp4  5.4 s  0.52 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/08-underleaf-palisadewood.mp4  13.9 s  0.93 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/09-palisadewood-kings.mp4  14.5 s  1.14 MB
- C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/10-kings-burning.mp4  13.3 s  1.29 MB
Contact sheet (3 frames per row): C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports/transclips/contact-sheet.png
Not clipped: kings>scree (the shut-spur fallback beyond the demo; locked in the demo build, never plays there - the recording did not finish). All 10 demo rows ok.
Notes: clips start in the boss-kill beat so the tutorial hint box and "PRESS A KEY FOR SOUND" (headless, audio off) show; clips have no audio.
