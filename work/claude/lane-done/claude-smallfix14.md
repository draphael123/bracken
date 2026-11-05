# smallfix14 (11-04) - claude/smallfix14, tip 7b0bf2dc (off claude/batch143 now at 29d46d3c, which had moved past 3bd984d6). Worktree bracken-smallfix14. Not merged / deployed.
| # | Fix | Commit | What changed |
|---|---|---|---|
| 5 | PROP.castle TypeError | d7eddf7e | src/main.js map draw: `if (nc && PROP.castle)` guard (crown node castle skipped for the one frame). Verified: wood bake then map then launch, 0 page errors |
| 3 | iOS audio unlock | 8965dca3 | src/touch.js (audio-unlock lines only): touchend also calls env.initAudio(); touchstart/pointerdown kept |
| 2 | Credits | 21c4fc1e | src/credits.js CC_BY: "March of the Wizards" / Aureolus_Omicron / CC-BY 4.0 row, exact lines from licence-audit M1 |
| 1a | Demo map counters | a221f955 | map header `real` list drops `DS.demoLocked` levels: demo shows 0/11 woods, 0/33 medals (full game unchanged) |
| 1b | Demo Sound Test | 57497735 | audio.js `hasTrackFile`; main.js `soundMusic()` = MUSIC_NAMES filtered to shipped tracks when DS.DEMO (the itch build cuts TRACKS, so 125/134 names remain; synth-only names drop out). In a ?demo=1 run of the unbuilt tree TRACKS is full, so only the real build shows the cut list |
| 6 | Caption overlap | 7b0bf2dc (e45bb7bd was a superseded bottom-centre try: it hid under the node card) | src/demo-end.js mapCaption takes the node plates' screen rects and steps down past any it would cover; Kingswood label and caption both read (shot map-kings.png) |
| - | demo-cut pins | bd36ccb0 | two new flag uses pinned in tools/demo-cut.mjs |
| 4 | Touch title rows >= 44 px | NOT DONE | Not possible as a hit-area-only change: the title board has up to 11 rows of 8-11 game px (~17-23 CSS px at 812x375); 11 x 44 CSS px = 484 > 375 px screen height and tap zones cannot overlap. Needs a design call: scrolling/paged title list on touch, or fewer rows (e.g. fold GIVE FEEDBACK/CREDITS/WHAT'S NEW under OPTIONS on touch). Rec: fold the three into OPTIONS when touchOn (11 -> 8 rows), then rows ~ 28 game px still too small - so honestly a paged list. Small separate lane after tonight |
## Checks
node --check main/touch/credits/audio/demo-end OK. demo-cut green (pins updated), demo-save-carry green, itch-build-check ok (922 files, 60.7 MB), demo-end-page 0 errors, comments ok, homepaths ok. Full suite NOT run.
## Shots
scratch\lane-reports\smallfix14-shots\ : map-kings.png (demo map at Kingswood: 0/11, 0/33, caption under the plates), after-launch.png, endcard*.png. One headless browser at a time (3.8 GB free), closed.
## Notes
The itch build must be rebuilt from this branch to carry fixes 1b/6 (node tools/build-itch.mjs). Merge conflicts: only one-line edits in main.js/touch.js/audio.js; geomancer.js and Hornet's Nest art untouched.
