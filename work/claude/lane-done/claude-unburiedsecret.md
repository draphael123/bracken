# claude/unburiedsecret - THE UNBURIED FIELD IS A SECRET (resumed lane)

## Built (commits e4c8d09a core, b64aa855 ghost-spur fix, this one = report + test close)
- Three LOST BANNERS (`lostbanner` ents, one per level, added via `withBanner` in src/level.js so the other lanes' level builders are untouched; coords in `LOST_BANNERS`): Hexed Fields (538,3), Burial Caverns (293,55), Witchlight Stair (249,76). 9-22 tiles off the main route, outside arenas, clear air, reachable with base moves by every hero.
- Pickup: sting + 'LOST BANNER n/3', saved per profile; 3/3 -> toast 'THE FIELD REMEMBERS'. Silver-medal rule removed.
- Map: before unlock a dim unmarked spot, no path, no tip, UP/DOWN at the Witchlight does not step onto it; on unlock a ghost-path draws itself from the Witchlight. Save migration: old silver-on-Witchlight or cleared-field saves keep it open; a fresh save earning silver later does not.

## Checks (PORT 8778, run alone, all green)
map-grammar, map-spacing, dangling-paths, class-spurs, level-reach, tools/unburied-secret.mjs (8 heroes through the real loop).
tools/unburied-secret.mjs takes ~3.5 min and its Chrome teardown is slow on a loaded machine (close can take 20 s to minutes); the test now awaits pg.close(). No assertion was touched.

## Not done
- Map screenshots of the dim spot / ghost-path (tools/_tmp/shots.mjs is an untracked scratch, not committed).
- Full suite not run (40 min); no level hash changed beyond the banner ent - re-stamp rows only if the suite flags the Fields/Burial/Witchlight hashes (banner ent is added after build, so builders are unchanged; check level hashes in the suite).

## QUESTIONS FOR DANIEL
- Banner placement (Fields 538,3 is very high/far up the map): happy with it, or want an easier nook?
