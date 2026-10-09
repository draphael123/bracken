# FAIRCREEPY (claude/faircreepy, off master 3595a284) - art/sound only
Level hash fd51c55d8516 before and after (levelHash unchanged; no geometry, foe, timing or rule touched).
Built (all four picks): src/redraw/fair_creep.js (new) + small hooks in main.js, fair_backdrop.js, fair_world.js, audio.js.
1. Day dies: night wash + stars over the dusk sky, moon (orange -> bone white), edge vignette growing with depth, low 3-bank fog (warm -> cold), lanterns snuffed behind you (render-only `cb`; lit/life untouched).
2. Mid-layer scarecrows turn heads toward you (hold while anything is within 150 px or a boss is up), offerings at their feet; empty carousels creak round and swing boats rock; ride/tent/string lights stutter (flick).
3. music.warp(k): the fair file detunes flat + wow/flutter LFO with depth (stale-guarded); fair bed: crowd thins, wind rises, slowing far laughs, a children's rhyme, crows; back lot too. Composed in code, no downloads.
4. Vanishing townsfolk silhouettes at stalls (alpha = distance to you, gone behind you), fortune-teller card flips as you pass the caravan, Wicker Queen figure on the skyline (ember eyes), moon + Queen shine through the height night via skyHoles.
Shots: work/claude/faircreepy/{before,after}/ (tools/fair-creepy-shots.mjs).
Checks (port 8767): render-layers, readability, frame-cost, floaters, dressing, harvest-fair, audio-assets OK. fair-pilot RED but IDENTICAL on untouched master 3595a284 (knight dies at the swingboats to the wicker man, 13 deaths; logs/pilot-base.log vs checks1.log) = pre-existing. textfit: not re-run clean (no text added; it timed out under load).
## QUESTIONS FOR DANIEL
- Moon barely shows at road level in headless shots (sky mostly behind tents/HUD); say if you want it larger/higher.
- Pilot red at the swingboats on master: needs a separate look.
