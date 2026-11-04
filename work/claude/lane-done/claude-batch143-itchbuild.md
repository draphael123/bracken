# claude/batch143 - BATCH143 base (master d57c3475 + demoend) + TRIMMED ITCH BUILD (11-04)
Branch claude/batch143, worktree bracken-batch143. Not merged, not deployed, nothing published. Tip = see the last commit (code commits f1c43cb7, e6f02e26 on top of the merge a557d312).

## A. Base
- Merged claude/demoend (0a0052b1) into d57c3475: clean, no conflicts (a557d312). demo-cut + demo-save-carry green; ?demo=1 and flag-off both load clean (tools/demo-end-page.mjs: card, 5 buttons, feedback, keep, credits, map; flag-off no card; 0 page errors).

## B. Itch build
- `node tools/build-itch.mjs [--out dist-itch] [--no-zip] [--quiet]` -> dist-itch/site/ (unpacked, index.html at root), dist-itch/thornroad-demo-<sha>.zip, build-report.json. dist-itch/ is gitignored and .vercelignore'd; the zip is NOT committed.
- esbuild bundle (code-split ESM: main.js 2.7 MB + loading-screen.js + online-guest.js + 38 small chunks) instead of 736 module files. esbuild comes from node_modules, $ESBUILD_DIR, or the global vercel package (already installed; no download).
- DEMO_BUILD flipped to true in the bundle only (src/demo-flag.js untouched: full game byte-identical with the flag off, demo-cut green). Three in-memory rewrites, each guarded (build fails if the line moved): demo flag, audio.js TRACKS cut to shipped files, loading-screen module count 190 -> 5 (the bar counts scripts).
- Audio: 876 sfx clips (832 files; all kept, some are loaded by built names), ambience beds, and 29 music tracks = the 12 demo levels' own + arena + mini tracks + theme/select/store/ending/boss/minicharge. 106 other tracks left out (~140 MB). docs/updates.json replaced by a 4-line demo WHAT'S NEW.
- index.html: modulepreload block, manifest link and service-worker script removed; sw.js / manifest not shipped.
- Result: 922 files, 60.7 MB unpacked, zip 53.4 MB. Every shipped path checked against ad-block words (none; admiral track is not shipped).
- Q4 (demoend): five heroes (knight, warden, geomancer, ranger, pyro) in the pick, store HEROES rows and co-op; hidden: berserker, paladin, pirate, reaper (demo-flag.js DEMO_HEROES, 2 pinned uses). Map caption THE ROAD CONTINUES... (plate under the header) shows while the hero stands at Kingswood or a shut node. 3 new pinned flag uses in demo-cut (11 total), + MENUS assertions.

## Checks (all node unless noted)
GREEN: demo-cut, demo-save-carry, itch-build-check (NEW, registered in check.mjs: build to temp, <1000 files, index at root, no src/, no ad-block word, zip CRC/central-dir parse, repo untouched), modulepreload, comments, homepaths, deploy-surface, demo-floats, shop-gates, node --check main.js. Windows Expand-Archive/ZipFile opens the zip (922 entries).
RED (pre-existing): dangling-paths = tools/level-quality.mjs:124 audio/file.ogg + queengloss prior_queen_set.js citations (not from this lane).
Browser (1 headless each, 6 GB free): tools/itch-embed-page.mjs (NEW, by hand, not in suite) on the unpacked build in a 960x540 CROSS-SITE iframe (localhost host page, 127.0.0.1 game, itch's allow list): see scratch report.
Not run: full suite, boss rates, touch/phone, Safari/iOS/Firefox, the real itch sandbox.

## Notes / owed
- Sound Test and the map still list the full game's tracks/levels (a left-out track plays the theme; no 404, no error). Map counter shows 0/53 woods and 0/159 gold (full-game totals).
- esbuild is a build-machine dependency (global vercel copy); not added to package.json.
