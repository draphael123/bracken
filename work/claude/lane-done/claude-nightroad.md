# nightroad: integration of the four flag-off road areas (+ art), one map relayout
Branch `claude/nightroad` off master 9f29067e9 (live). Status: **READY (node-checked only, NOT browser-seen).** Not merged, not deployed. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\wt-nightroad.
Road confirmed against the reports: Burial Caverns > Wispwood > Silk Undercroft > Hollow Manor > Witchlight Stair > Mage Academy > Mage's Folly. All four flags stay false (WISPWOOD/SILK/MANOR/ACADEMY_SHIPS).

## Merges (--no-ff, in order) and conflicts
1. claude/wispart: src/level.js (master's desert pushes/applyInserts vs the wisp push: kept both), src/main.js x3 (EHP literal: master line + wwthief/lanternwidow head; reset line: master's + WWH/WDH line; levelLocked: master's roadKept version + the witchlightOpen clause). Cause: wispwood branched off older master.
2. claude/silkart: src/marks.js (BY_HAND merged; the foot Object.assign lines kept both), tools/additional-areas.mjs (road pairs), tools/level-quality.mjs (GATE, runner list).
3. claude/manorart: src/level.js, src/main.js x6 (import, EHP rows, tile hook, reset, map-node line, dev entry), additional-areas, GATE. 
4. claude/academyart: src/level.js, src/main.js x17 (every hook line), marks.js x2, threat.js, additional-areas, GATE, runner list. All kept all sides.
Resolutions: additional-areas road pairs are now ONE generated list in road order (`['burial','wispwood','silk','manor','witchlight','academy','mage']` filtered to what is present). GATE gained wispwood, silk, manor, academy; runner list gained wwthief, skling, acbooks. level.js pushes are in road order (wispwood, silk, applyInserts, manor, academy) so each takes the stair's current needs; all-on needs chain verified: wispwood<-burial, silk<-wispwood, manor<-silk, stair<-manor, academy<-stair, Folly<-academy. No regenerated files were involved (marks rows are by-hand + Object.assign; MARK matches). Silk's map node line stays before manor's (as the reports asked).
Tool fixes carried: tools/wispwood.mjs now passes roadKept to the lifted levelLocked clause (master's route-insert); tools/academy.mjs GATE regex accepts the longer list; tools/dangling-paths.mjs lists src/gt-flag.js (ghosttrain, not merged) as ON A BRANCH (silk's sk-flag citation cleared by the merge).

## Map relayout (inland sheet coords; flag-off identical to master)
Before (all-on, the four crowded and doubled back: 4 offences): wispwood 142,74 / silk 168,70 / manor 192,78 / academy 184,58 (path ran east then back west to the stair).
After: wispwood 147,106 (plate left) / silk 164,107 (above) / manor 170,73 (left) / academy 185,31 (below). Road: burial 124,83 > wispwood > silk (south-east hook) > manor > stair 159,43 (unchanged) > academy > Folly 208,64 (unchanged). Burial, stair, Folly, tower, unburied spur and every other node unchanged. Found by search against the game's own plate/panel layout, and it holds for ALL 16 flag combinations, not just all-on.
New check: tools/road-map.mjs (16 combinations, each in a child): no two nodes/plates/boxes overlap, nodes + painted road + `needs` all in road order, flag-off adds none of the four nodes/levels. Helper tools/road-on.mjs turns all four on for any node tool.

## Checks (node only; no browser, no check.mjs)
OK flag off AND all four on: tells, answer-tags, blow-tags, foe-pass, one-new-foe, death-fx, threat-holes, spawns, boss-read, checkpoint-gaps, checkpoint-stand, signs, killzones, solid-islands, deadends, audio-assets, map-grammar, map-roads, map-spacing, additional-areas, level-quality (every gated level clears, incl. the four), architecture, goblin-lint, route-insert (38). Flag off only (flag-independent): comments, dangling-paths (now clean), road-map (16 combos). Each area's own tool, flag off and on, all ok: wispwood, silk, manor, academy; art-draw: wisp, silk, manor, academy all ok.
Not run (need a page): map-forks, save-safety, save-slots (no save-future-guard exists); tools/check.mjs.

## Still owed per area
- All four: browser walk of the whole road with all flags on; stills of the art (sheets exist per art lane); hitbox checks; the map seen drawn (plate/signpost look of the new hook); music (silk/manor/academy borrow benched cave/boss3, report-only warnings); boss n=6 with flasks to 60-70% (Lantern Widow, Crypt Mother, Castellan 3200hp?, Headmistress 2600hp? - tune lanes; boss-run needs --ww/--sk/--mn/--ac flags); map-forks page run; mapToSaved legacy list + a saves-by-index check when the flags flip live (levels are appended; the nodes are spliced into the road).
- Wispwood: skeleton set placements wait for beastsbones. Silk: pilot/mash/blocking WARNs. Manor: no relic by design; blocking 18%. Academy: lesson pilots, no bestiary cards.
- Manor/Academy/Silk/Wispwood art lanes: not browser-seen.

## Questions (rec = built; none block)
1. Map: the hook south-east of the Burial-Stair diagonal reads slightly odd (road goes south then back north through manor). Rec: keep; a browser look decides, the coords are one line each in src/main.js (WW_NODE, SK_NODE, MN_NODE, AC_NODE).
2. Ship all four in one batch or staged? Rec: one batch after the browser walk, because the relayout is verified for all, and any subset also passes.
3. Add the four node ids to mapToSaved's legacy list at ship time? Rec: yes when the first flag flips (the grammar check will tell).
