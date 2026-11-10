# academyart: art pass for THE MAGE ACADEMY + THE HEADMISTRESS (branch claude/academyart off claude/academy 7f1489972; ACADEMY_SHIPS stays false)
Status: READY (code-only, node-checked, NOT browser-seen). Not merged, not deployed.

## Drawn
- src/redraw/academy_art.js: per-room tile kit (steps limestone, library plum stone + wool carpet, lecture slate + brass inlay, yard pale flagstone, exam/Examination black-and-white marble + gold); bookstack cells are carved-stone SHELVING (rows of spines, crown on top; no wood); one-way galleries = corbelled slabs; summoned floating stones = runestones with lit underside; ward-rail cells = dark glass; shutter tile; the Examination's EXIT GATE (5 tiles, east wall; light shows when she closes the register). Backdrop: parallax back walls per room (library shelving + moon windows + candle rings, lecture stained windows + house banners + chalkboards, yard cloister + towers + stars, marble pillars), gallery chains, four pit looks (archive, orchestra, summoning vortex, exam gap), the library door's light. Decor (candelabra, globes, book piles, easels, desks). Props: lecterns (3 spells x lit/dark), ward rails, conjured steps (flicker), runes, spell auras (levitate meter + float wisps). THE SPELLBOOK FLOCK: wheel / told gather (white flash, closed line) / stream (trail) / scattered / regroup, books by hp.
- src/redraw/headmistress_art.js: THE HEADMISTRESS own pose for every POSE mode (19) + dead (closes the register, fades), lesson air (blue halo / violet ward glyph / gold floating desk / finale cycling), hit flash; chalk sigil (told/falling), chalk bolt, shield book.
- Wired: academy-hands / headmistress-hands draw through the art (greybox rects gone); main.js 2 tagged lines (import, tile hook guarded by L.academy) + HDH.drawBoss now called for the dead boss too. Flag-off game never reaches any of it.
## Checks (node only)
tools/academy-art-draw.mjs all ok (80 checks: every solid cell tiled, 6 lecterns distinct, 5 flock modes distinct, 20 Headmistress poses distinct, hands run through the art); tools/academy-art-sheet.mjs -> scratch/lane-reports/academyart-sheet.png (12 real-level scenes + props + tiles + flock + poses); tools/academy.mjs all ok flag off+on; architecture, comments, goblin-lint, audio-assets ok.
## Owed
- Browser stills (tile contrast vs dark mask, shelf read vs hitboxes, rail light vs the 16px cell, Headmistress scale vs hitbox 14x30 (art ~22x46), flock vs its 18x12 box, dead-pose fade).
- Not drawn: map node art + blurb, bestiary cards (acbooks, headmistress), music, transition rows, existing foe skins (the level reuses apprentice/broom/armour/imp/bat - no new skins needed). n=6 boss tune still owed (greybox report).
## Questions (rec = built)
1. Headmistress stays seated ~2.5 s then fades after the win. Rec: keep.
2. Shelving drawn as carved stone, not wood (theme rule). Rec: keep.
3. Backdrop is screen-space parallax strips, not tied to level columns. Rec: keep.
