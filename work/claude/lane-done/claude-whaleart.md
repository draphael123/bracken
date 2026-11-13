# WHALEART DONE - claude/whaleart (off claude/d3art d98aecfe2; pushed; no merge, no deploy; Whale flag stays OFF, WH_SHIPS=false)
Worktree LANES\bracken-whaleart. Code-only: no browser, no tools/check.mjs. Draw-only: src/whale-hands.js draw hooks only (drawBack, drawMover, drawEnt, drawOver); the sim modules (whale.js, gastric-polyp.js, parasite-queen.js), level data and main.js are untouched, so OFF = base and every sim tool has the same count.

## What was drawn
- src/redraw/whale_art.js (the level kit):
  - FLESH over every solid tile, by section: maw (pale gums), tongue (papillae on top), gullet (throat ridges), stomach (acid-etched pits, yellow-green stain creeping up from below), rib cage (bone striations, knobs, polished edge), heart chamber (deep red, thick purple veins). Fibres, pores, veins, a wet sheen on every exposed edge with a moving glint, sinew strands with bulbs hung off every ceiling, bile drips.
  - NERVE (idle / glow / FLARE with rays and shudder / SPENT with the cooldown bar), MEMBRANE (shut taut vascular sheet with lips, quiver, sealed CARDIA with a puckered sphincter and a gold clasp, open = folds hugging the walls), HEART (vessels, lobes, ventricles, coronary veins, fat knots, wet glints; beats; FAST = flayed raw patches + red cracks; baked per beat bucket so a frame is a rect replay), TONGUE lift (pad with papillae), wreck RAFT (tarred planks, nails, barnacles, rope coil, splintered end), BILE (scum band, bright lip, foam, rising bubbles, drifting shell, caustic specks), LUNG HUD (two lobes + bronchus, fill, white flash on the tell).
- src/redraw/gastric_polyp_art.js: a rooted stalk, swollen head with a crown of warts, a FACE (white eye + yellow iris + pupil, a far eye, a heavy brow, lips, tongue, teeth). Poses: In (a shut knot: seam, shut eyes, bile bead), Swell / Shrink (drawn from the sim's stalk height), Out, SpitWind (TELL: head thrown back, cheeks swollen and glowing green, eyes narrowed), Spit (RELEASE: head thrust, mouth wide), Rec, Hurt, Dead + a fall. Bile glob in flight.
- src/redraw/parasite_queen_art.js: THE QUEEN as outlined masses: 8 IK legs (each its own mass), an engorged abdomen (blood belly under pale banded plates, veins), thorax, a HEAD with a carapace mask, a crown of bone spikes, a heavy brow, TWO ember eyes (near 5x4, far peeking), cheek ridges, hooked palps and a beak that open and swell. 25 poses: Sleep, Wake, Idle (rooted), SkitIdle (P2: low, glowing gold ROOT-KNOT), Skitter (gait), Hop, Rec, Hurt, Ward (roots re-grip), a WINDUP + a RELEASE for all six moves (lash, spit, thrum, constrict, brood, crush), Flushed (belly up, legs thrashing, torn roots), Stranded, Uproot, Reroot, Dead. P3 = raw flayed patches. Fall (legs curl, blood pools, roots go slack, eyes go out, fades). Floor pieces: lash tell stretch + root burst, thrum ridges, CONSTRICT tendrils (thin and wavering in the tell, thick and barbed in the pull), egg sacs that ripen, heart-crush floor (tell wash, heave), spit/egg globs. Gold OPEN ring / grey WARD ring reuse the Deep's (deep3_art.js).
- Wired in whale-hands.js (greybox shapes gone). Falls are driven from the hands' own `seen` record (as Siren Rocks does), so the Queen's and the polyp's death falls play WITHOUT a main.js hook. TELL_ROWS untouched (1 polyp + 8 Queen), marks unchanged.

## Proofs (node only, counts before = after)
whale 414 | siren-rocks 773/786 | deep3 696 | d3-art-lint 531 | sr-art-lint 201 | k2-art-lint 319 | tide-kit 2022 | pull-field 79 | pf-art-lint 5135 | pirate-fleet 136 | sea-gadget 403 | keep-floods 105 | kraken3 217 | longwater3 91 | tells 1233 rows, architecture 610, answer-tags, one-new-foe, goblin-lint, threat-holes all ok. NEW wh-art-lint 293 ok: modes -> poses (queen x 3 phases), mirror exactness, poses distinct, windup != release != idle, windup >= 0.3 s, BODY silhouette (queen smallest windup-vs-idle 34%, windup-vs-release 31%; polyp tell-vs-watch 39%, tell-vs-spit 64%), face pixel counts, boxes round the feet, falls, every kit piece, the REAL hands on a stub world drawing every polyp mode and every Queen mode x phase (tendrils, rings, eggs, globs, crush) and both falls, flag OFF draws nothing, palette (122 colours, worst distance 34 to the Whale/Deep/Keep/Reef set), wiring, main.js untouched, WH_SHIPS false. node --check on every touched file. modulepreload --write (905 modules; index.html +3). tools/whale.mjs flaky '30 s blows' roll did not fail in the before or after run. No tool launched a browser.

## Sheets (LANES\scratch\lane-reports\whaleart\)
wh-room.png (maw/tongue, stomach, heart chamber, composed) | wh-queen-poses.png (every pose + fall) | wh-queen-phases.png (P1/P2/P3 + the four tells) | wh-queen-face.png | wh-polyp-poses.png | wh-polyp-face.png | wh-kit.png (nerve, membrane, heart, tongue, raft, lung, bile, flesh by section) | wh-kit2.png (Queen floor pieces). Tool: node tools/wh-art-sheet.mjs [outdir].

## Honest view - still weak
- The Queen reads as a big pale tick/spider on a sheet; at 1x her head is ~20 px wide and the near eye 5x4. The mouthparts are tucked under the mask and do not read much until the spit tell. Browser look decides.
- Flesh wash over the engine's own tile art is a guess: I laid a 0.6-0.7 alpha wash; the real tiles under it may show through or fight. The rib cage rule is "solid at row <= 43 in columns 263-322 = bone", so the shrine-two floor (rock 314-322 at row 32) will look like bone, not flesh.
- No backdrop (ribs, light shafts): the hands' drawBack runs after the tiles, so a full backdrop would cover them. NET (sinew) tiles and PORT tiles are drawn by the engine; only the membrane overlay is mine.
- The Heart is a big berry-like mass; dither texture shows as dots. Reads as a heart mostly through the vessels.
- Flushed pose: the raised legs are thin spikes; at speed this may read as noise.
- Polyp hurt/dead poses are not triggered by e.flash unless the engine sets it (siren hands use the same field).
- Cost unmeasured: flesh texture is per-tile rects (view-limited, ~340 tiles, a few rects each); Queen = ~12 Layer maps per frame; polyp ~5. Heart is baked.
- Bestiary cards, HUD name art for the polyp/Queen, sounds, music not done.

## BROWSER OWED (?level=whale, one at a time, memguard first)
1 Flesh wash vs the real tiles in each section (maw, tongue, gullet, stomach, rib, heart): does the engine tile show through? the rib bone rule, the shrine-two floor.
2 Nerve flare shudder + the cooldown bar; the membrane lips vs the PORT tile (no tile showing, no gap), sealed cardia clasp; quiver on the warn.
3 Tongue lift and raft z-order vs the hero's feet (pad drawn 10 px tall from the mover's y; box is 8).
4 Heart vs the Queen's roots (her roots end at the floor, not at the heart); beat swell; P3 fast look.
5 Queen at speed: every windup and release, tendrils vs the pull field, the lash stretch vs its hit box (PQ.lash.w 22 / h 30), thrum ridge height 12, crush heave, gold ring and the timer bar at y-66, grey ring. Her hitbox (30 x 34) vs the 48 px body: P2 scale 0.84.
6 Polyp: swell/shrink from e.h, glob vs hit box 12, the eyes in the flesh state ('in').
7 Death falls (Queen 2.6 s, polyp 0.8 s) from the seen record; cost of drawFleshTex + the Layer poses on a slow laptop.

## Questions (rec first, all built as the rec)
1 Bake the Queen and polyp poses to a cache if the page shows cost? REC wait for the browser look (the heart is already baked).
2 Backdrop (rib silhouettes, light shafts) in the flip lane via one main.js hook before tiles? REC yes, later, small.
3 Make the Queen's mouthparts bigger so the jaw reads? REC after the browser look.
4 Bestiary cards + HUD name art for the polyp and the Queen with the boss-cards pass? REC yes.
5 Rib cage bone rule by column band vs a real per-tile flag from whale.js (a tiny data change)? REC keep the band until the browser look.
