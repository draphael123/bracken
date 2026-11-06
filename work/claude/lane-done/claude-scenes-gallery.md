SCENES DONE 11-06 NOT READY tip b974e519c
(NOT READY only because no browser run: node checks green, browser owed. Code complete.)

BRANCH: claude/scenes-gallery (worktree bracken-scenes). The name claude/scenes was taken by the old Heart-of-the-Mountain lane, so this is a new branch off origin/master 6f3b00e2e. Merge after the SAT 11-07 cut.

BUILT
- src/scenes-gallery.js (pure): NAMES for all 11 rows, rows() in TABLE order, unlock rules, markSeen, standCol.
- Title: SCENES row after BOSS SELECT, shown only when the save has a scene to show (or ?scenes=all).
- Inn: station THE STORYTELLER (x 19, by the hearth, verb SCENES, first-visit glint and line), art tavern-art.js storyteller() (chair, rug, old man with book, raised hand 2 frames, sparks), ART list row added.
- Card state 'scenes' in main.js: numbered list, '???' when locked, FILM mark on ferry/road/smoke rows, N/total, touch rows, ESC back (title / map / inn; from the inn a replay returns to the room with the party).
- Seen: trnBegin now records transSeen when a real transition plays AND when the setting (NEVER / FIRST TIME seen) skips it. Old saves back-fill: row unlocked if the 'from' or 'to' level is cleared; Kingswood rows follow PROG.burningOpen.
- Replay = Boss Select style sandbox: bossJumpOn set first (saveProgress writes nothing), no winLevel, loadThen(from level), heroes stood 9 tiles short of the way out on the arena floor, creatures cleared, trnBegin(row) with TRN.replay, trnFinish -> scenesEnd (loadSlot read-back, lock off, back on the card). Skippable as usual. Runner walk/land logic untouched.
- Hidden ?scenes=all unlocks every row (also shows demo-locked rows).

CHECKS
- node tools/scenes.mjs: 40/40 ok (road order = TABLE, names, textfit-safe charset, unlock and back-fill, rows() never mutates, every row's timeline finishes/skips, source guards: no winLevel/saveProgress/PROG write in the replay block, lock before load, replay branch returns before the seen/save lines).
- node tools/demo-transitions.mjs: 120 green. node --check src/main.js ok.
- tools/tavern.mjs: new browser block added (storyteller opens card, closes back); also the 'every station used once' check now includes it. NOT RUN.
- Accident: I once started tools/check.mjs by mistake (the --help trap); stopped within seconds via TaskStop, no stray node left.

BROWSER OWED
1. Title SCENES row fits (the title list is now 1 row longer, row height shrinks at 14 rows: check textfit title/pick).
2. Replay of every row (esp. ferry, road, smoke; open-gate rows: gate wall drawn, heroes stand on solid floor, stand spot valid on each arena; gate-end rows Fen Road/Rootway have no open col so they stand 9 tiles before the level end/walk.to).
3. Save untouched after a replay (compare localStorage before/after), then party return in the inn with 2 pads.
4. Storyteller art and REACH spacing in the room; tools/tavern.mjs, tools/textfit.mjs, tools/transition-woodmarsh.mjs (it deletes transSeen then tests NEVER; NEVER now still doesn't play but does mark seen: check no assertion on that).
5. Blocked by TRANSLAND: nothing, but its float fix is in the shared runner; rebase check.

MERGE SPOTS: src/tavern.js STATIONS next to INNSAVES' 'guestbook'/'saves' rows (my row sits between 'saves' x14 and 'table' x36; INNSAVES edits the saves line: trivial conflict, keep both) and its TAVERN_ART saves line, use() and draw() lists; src/main.js titleTop line, trnBegin top, tavern api line (near openParty/openSaves), BK debug object. SHRINEKEY's rename of the lesson row is not touched by me.

QUESTIONS (recs built)
1. Kingswood 'kings>scree' row is beyond the demo: shown in the full game only when kings cleared with the spur shut (demo hides it). Rec: keep.
2. SCENES row hidden on the title until a scene is unlocked (saves title length for new players). Rec: keep; ?scenes=all always shows.
3. Names are mine; Daniel may rename in NAMES (src/scenes-gallery.js).
