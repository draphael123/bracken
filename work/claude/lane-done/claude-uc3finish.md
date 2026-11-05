# UC3FINISH lane report (Sonnet, 11-05) - Undercrown 3 art pass, finished in code
Code-only: NO browser opened. Nothing merged or deployed. UC3_SHIPS still false. Branch claude/undercrown3, tip bbb3ebf95 (pushed). Hitboxes, AI, balance untouched (drawing + one music key only).

## Commits (on fb01b38ed)
- 19e145bb9 tile kit overlay + room architecture (src/redraw/uc3_tiles.js new; main.js 3 small hooks; undercrown_art.js exports isWholePass)
- afa3055ab tools/uc3-kit.mjs (node check + contact sheets), vault rib proportions
- 662ad7bae music first try underkeep (superseded) / bbb3ebf95 music = cave + credits note

## 1. Tile kit (UC2 already had its own kit, ucKit; UC3 adds an overlay on it, not a second kit)
src/redraw/uc3_tiles.js uc3Tile(base,...): cells inside a firedamp chamber (L.firedamp) get an overlay on the kit's own 16x16 (memoised): CEIL = lamp-black bloom + black fingers + sulphur blisters on seams; TOP (floor) = coal dust, grit, a coal chip (the lip stays lit: checked >= 70% of lip pixels kept); FACE = sulphur bloom frost + soot at the foot. Tomb: soot only, no sulphur (royal stone). Wired in main.js tile bake after UCT.ucTile, only if L.uc3 && L.ucKit, try/catch. Master/non-chamber cells untouched.
## 2. Architecture (rooms; roomOver, called after UCA.paintRoom, skipped in the whole-view far-wall pass)
Soot hood under every chamber roof; brick PORTALS (jambs, impost, springing arch) round the 2 wind doors; old VENTILATORS (bricked arched airways, rusted bars, draught-black fan; wet/green in the flooded level) every 9 tiles in the works/landing/flood galleries, clear of the kit's piers; the stope's UPCAST FLUES (brick chimneys in the foundation, black mouth); barrow + tomb VAULT RIBS. Pixel rects only (node-renderable).
## 3. Music
UC3 level track = cave.mp3 ("8-Bit Cave Loop", Wolfgang_, CC0, already credited, gain 2.1 already set; the mine theme, nothing else plays it). level.js: music: UC3 ? 'cave' : 'barrows' (master keeps barrows). I first tried underkeep (Sinking Feeling, Umplix) but level-quality flagged it BORROWED (deep-split 'keep' plays it); cave passes. CREDITS.txt note appended. No download.
## 4. Checks (all node-only; tools using cdp/headless skipped: audio-assets, music-priority/-start/-slowfile, audit-audio)
- uc3-art 12 ok; uc3-kit (new) 659 checked, 0 bad (642 cells overlaid, 7/12 interior rooms painted, the other 5 meet no chamber, wind doors get portals)
- firedamp 100/100; fallen-pillars 184/184; music-levelstart OK; architecture ok (both builds); anchor-lint ok; floating-geometry ok; platforming-lint, goblin-lint ok (both builds)
- level-quality undercrown: UC3 all ok incl. music (cave) except pilot + mash STALE (level hash; need a browser, same as before); master: all ok. node --check main.js ok.
- Sheets: scratch/lane-reports/uc3finish-kit-tiles.png, -kit-rooms.png.
## Owed
- Browser shots (?uc3=1): tile overlay read at game zoom (is the soot too dark on the lip/roof at dark:0.14?), portals vs brattice alignment (portal centre = door x*16+8, door cloth drawn on top), ventilators vs piers/cribbing, stope flues vs the hanging piers, vault rib span 11 tiles vs room height, the tomb in P2 gas.
- Pilot + mash re-stamp under BRACKEN_PAGEQ=uc3=1; the rest from undercrown3.md (tune, bossLab, textfit, reviewer).
- Not done: "row 9 arch re-point" (level data at col 99 untouched, nothing to point at in UC3); slab "course one row up" detail; ear check of cave.mp3 in the level.
## Questions (rec built)
1. Music: cave (rec, built) vs barrows kept for UC3 (no change) vs a dread layer (deepdread) under barrows - ear call.
2. Overlay vs own tile set: rec built = overlay (UC2 kit is already the level's; UC3 stretches differ by history, not material).
