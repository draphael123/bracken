# SMALL FIX 8 (claude/smallfix8, off smallfix7 a98d7c31 + origin/claude/maproad merged)

## Built
1. SOAKED reads soaked: immunity (10 s) kept. Flames within ~24 px of a soaked hero (and no unsoaked hero in reach) draw dim (alpha .36, small) in main.js fireDim() - main fire loop, pillars, village-hands oil flames; steam wisps off each such flame (village-hands update); hero drips more (16/s, bigger drops). A co-op hero who is NOT soaked in the same flame keeps full flame and takes the damage.
2. Co-op Gorm credit: gormBeaten() notes a `burningOpen` ledger flag on every profiled human seat (not AI) when the run had no shrine respawn, then creditAll(). src/coop-save.js: ledger flags, CREDIT_FLAGS whitelist, credit `flags`, applyCredit writes p.burningOpen (dup-safe, xpOnly skipped). Banner now 'A NEW ROAD OFF KINGSWOOD'. Seats already holding it take nothing twice; host-already-open still credits seats.
3. Spur node moved: opensOn.level 'kings'; node at (120,36) plate below (spur band 4-25 px, next-nearest road pt ok, clear of the Kingswood->crags road at y~23). Key from Kingswood: DOWN (or LEFT). maproad merged (compatible, map-roads green).
4. Tools: gorm-unlock.mjs (+ node co-op credit cases), class-spurs.mjs (rewritten to kings/ArrowDown; its old assertions still expected the Stockade rule - smallfix7 had not updated them), map-forks.mjs, douse-agree.mjs (straw needs 10 s, >=1 alight cell).

## Checks (browser ones ran at the OLD node spot (118,50); BROWSER-HOLD stopped the re-run at the final spot)
- PASS: map-forks (all green), level-reach (burning off kings, ArrowDown), map-roads, map-spacing + map-grammar + node --check at the FINAL spot (120,36), gorm-unlock node co-op half ('co-op credit: ok'), textfit scope hints (103 hint screens, incl. the new lines).
- douse-agree page half: flames/steam/same-frame agreement fine (missing 0, stray 0, steam 31, after 0); only my threshold (>=3 alight) failed - relaxed, NOT re-run.
- class-spurs: failed once on stale burningOpen between cases (fixed in wipe(), NOT re-run).
- gorm-unlock page half: CDP Input.dispatchKeyEvent timeout (machine at <1 GB; not re-run).
- RED not mine/unresolved: textfit scope bestiary - page crashed (memory); hintlevel - 3 ungated hintMsg sites (hint fn itself, reeveCoat, FL2H), none in my code; map-scale (browser) at the old spot: palisadewood board over own node, hornetsnest card hides plate, 5 board/critter overlaps - the palisade/hornetsnest ones are not from this move (map-spacing, same solver, is clean at (120,36)); re-run map-scale at (120,36).
- TO RE-RUN after BROWSER-HOLD lifts, one at a time: gorm-unlock, douse-agree, class-spurs, map-forks, level-reach, map-scale, textfit bestiary.

## QUESTIONS FOR DANIEL
1. Co-op credit counts only a shrine respawn as 'going down' (a downed-and-lifted hero is not a fall). Rec/built: that. Alternative: any hero downed voids it.
2. Spur sits W-SW of Kingswood; DOWN or LEFT steps on. OK?
