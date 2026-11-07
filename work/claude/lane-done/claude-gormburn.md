# GORMBURN (claude/gormburn, off claude/batch149 a18ce8c7e) - code+art, node-only checks, not merged, not deployed

## Changes
1. MOUNTAIN SCENE. src/transitions.js row kings > scree (burningOpen false) is now scene 'mountain': beats walk 1.8 (max 2.8) -> mountain 7.0 (scene) -> fade 0.8, bar 12, demoEnd: true. New MOUNTAIN timeline + mountainHero/Stance/Pan/Rise/Glow. src/transitions-art.js drawMountainScene: party walks onto the court road, leader looks BACK at THE WOOD BURNING (flames along the far tree row, plumes standing up, red glow on the left sky, ash drifting off it), turns, the camera pans right and they walk on in place toward THE MOUNTAIN (baked grey peak with an ember-lit left face and a pale switchback = the Scree Path, two cairns) which grows and fills the right. No text, skippable (same skip as the others), reduce-motion = no pan, one dip to dark. Ambience = forest.
   FULL GAME: after the scene the Scree Path loads and they walk in (arrive row unchanged). DEMO: trnBegin lets a demoEnd row through the demo lock (demoTeaser); trnFinish for entry.demoEnd && DS.DEMO ends on demoEndOpen() (the END CARD) with no level load. So demo order is walk -> mountain scene -> END CARD (Gorm's win card is skipped, as every playing transition skips it; the clear is already credited). If the scene is not played (TRANSITIONS=NEVER, or already seen in FIRST TIME mode) the old flow holds: Gorm's win card -> END CARD. Clean win (spur open) unchanged: smoke scene -> map with the spur lit.
2. BURNING VILLAGE. No row leaves it, so clear -> level-complete card -> map (nothing to change; pinned by a test). First clear (PROG.burning.cleared was false): card line 'THE PYROMANCER CAN NOW BE BOUGHT AT THE STORE' (flashing, replaces the NEXT-medal row that visit), PROG.pyroNew set; the store's Pyromancer row shows a flashing NEW until the row is looked at or he is bought, and the map's store node shows its NEW arrow while it stands. Gold: 25 per villager saved + 50 for all six (max 200) on the card as 'SAVED n/6   +X GOLD   ALL SIX +50'; the card's blocks/dodges and deaths rows give way (foes + deaths share a row).
   REPLAY RULE I CHOSE: pay only villagers beyond the best count already paid (PROG.burning.saved, like the medal purse pays only the improvement) - the whole village is worth 200 gold ONCE, so a replay that saves nobody new reads 'SAVED n/6 (THANKS PAID)'. Rec stands; the alternative (pay per clear) is farmable at 200 a run.
3. Tools: demo-cut.mjs pins updated (trnBegin lock line + the new trnFinish DS.DEMO use); demo-transitions.mjs +8 asserts for the mountain row/timeline/wiring; new tools/gormburn.mjs (8 asserts: bonus maths, once-ever replay, no row from burning, card/store/NEW wiring). Add gormburn.mjs to check.mjs when merging if wanted (not edited here).

## Verified (node only, no browser)
node --check on main.js, transitions.js, transitions-art.js, burning-village.js, the tools; demo-cut.mjs green; demo-transitions.mjs 128 green; transition-woodmarsh.mjs 31 green; gormburn.mjs 8 green; a stubbed-canvas run of drawMountainScene (n 1 and 4, normal and reduce, s 0..7) throws nothing.

## OWED (browser, not run: browsers busy)
- Stills: mountain scene at s=0.5 / 2 (look back) / 4.5 / 6.8, 1 and 4 seats, reduce-motion; touch skip hint; check the mountain's scale/position and that the burning crowns read.
- Demo order: ?demo=1, die once in Gorm's fight then win -> scene -> END CARD; and a clean win -> smoke scene -> map.
- Burning Village card: first clear (Pyromancer line + gold lines fit at 384 px), a replay; the store NEW on the Pyromancer; the map store arrow.
- demo-transitions --browser loop row kings>scree now has a scene beat (its loop treats it as a scene row; in the demo path it ends on the end card, so the loop's 'arrival' wait for kings>scree needs the full-game flag).

## Merge notes
- vs claude/transchoice (46579fca8): both edit trnBegin. After merging transchoice, the choice-card line must skip the demo teaser: `if (!direct && !demoTeaser && TRM.needsChoice(entry)) ...` (demoTeaser is the const this lane adds right after the demo-lock line; otherwise the demo would offer ONWARD to a locked wood). The full game gets the card on kings>scree (ONWARD TO THE SCREE PATH / RETURN TO THE MAP) as any plain row; kings>burning (endOnMap) stays card-free. The burning village has no row, so no card leaves it. demoEnd rows should also be excluded in the transchoice tool's row count (kings>scree now has demoEnd).
- vs batch150 / POLISH150: main.js conflicts are likely only near trnBegin/trnFinish/winLevel0/the win card; the 'KING GORM' name fix is untouched here. Files are CRLF in this worktree.

## Questions (rec first)
1. Play the demo teaser every time (ignore FIRST TIME) so the demo always ends on it? Rec: no, keep the setting; first win is when it matters.
2. Pay the villager gold per clear instead of once? Rec: once (as built).
