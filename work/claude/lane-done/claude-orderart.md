# claude/orderart: THE ROAD WARDENS, painted (Sonnet art lane, 2026-10-11)
Branch claude/orderart on claude/order 2557f60f. PORT 8846. Sheet: work/claude/shots/orderart/sheet.png (also skins.png, cards.png, fx.png via tools/order-art-sheet.mjs).

## Code items
1. RENAME: THE OATHBROKEN -> THE ROAD WARDENS everywhere (ORDER.name/short, the 4 plates/cards, comments). Ids stable. Bestiary list column is 96 px, so BEAST_SHORT gives WARDEN DUELIST / LANCER / MAGE (textfit TRUNCATED 3 -> 0).
2. KNOCK-INTO: src/knock-into.js throwFoe now spends the break AFTER api.knock succeeds, so a BROKEN UNSTOPPABLE elite and the brute are thrown by the finisher-on-break (before, the break was spent first and knockFoe refused). tools/knock-into.mjs gained two rows (UNSTOPPABLE brute 27 px, order brute 63 px). knock-into and elites stay green.

## Art (src/redraw/order_art.js, new; src/order-knights.js bakeSet now calls it)
- One painter (IK limbs, polygons, outline, bake-time edge check) for 4 bodies; 12 frames each: 0-1 walk, 2 windup, 3 blow, 4 recovery, 5/6 the body's own, 7 TEETER, 8 INTERRUPTED, 9 DEATH (over backwards), 10 CORPSE (heap), 11 HURT (last, HAS_HURT). MODE_FRAME updated (lancer dazed -> 8, teeter -> 7, mage castBroken -> 8). Corpses fall as 9 and lie as 10 (main.js c.kn).
- Heraldry: the broken milestone on the surcoat, the shield and the banner.
- Chapter skins: palette + PROPS table. THORN = briar wraps, leaf crest; BOG = mud-caked greaves/hem, reed plume; ORE = pauldron sockets + live studs. The 7 other chapters read CHAPTERS.pal with the plain plume: a later chapter is a palette row (+ an optional PROPS entry). skins.png shows all ten.
- ORE plates: whole/cracked stud sprites drawn over the pauldrons (position from per-frame META), intact for i < okPlate, cracked after (also shown at 0).
- Gate banner: baked per chapter (5 sway phases), lazily once a chapter.
- FX (all baked once, none per frame): vine lash (segments + barbed tip), snare briars (sprout/rise/sprung, also the cage around a held hero), mud patch, rust patch + flakes, felled pine (rotates as it falls, baked per length) + chips + gash where a blade bites, mage bolt per element (10 + the gold sent-back one), parry glint over the blade point (drawn after the sprite: new OK.drawOver hook), lamp-snuff spark.
- 4 bestiary portraits: SPR[t+'Card'], 8 frames, chosen in drawBestiary.
- SIZE CHANGE (state): knights were drawn at EL.big x1.5; they are now painted at their struck size and drawn at x1 (main.js bigF and eliteMake bodyK = 1 for knights). Hit boxes (w/h x1.5) and plate/mark heights are unchanged. Anchor moved from the old placeholder (feet 1 px low) to the Crusader convention: feet on ay-1, canvas 92x72, ax 38, ay 68.

## Checks (PORT 8846, sequential)
order-knights 91/91 | elites 77 | corpses ok (3 knight skins) | tells ok (910 rows) | mark-integrity ok | pixels (headless floats) ok | knock-into ok | textfit plates,bestiary --strict 0 issues | mobile-perf in budget | modulepreload 417 listed, 0 missing (index.html rewritten).

## Questions (rec first)
1. Painted look vs the Crusader: the figures are ~30 px (struck size), so detail is chunkier than the 64 px Crusader. Rec: accept; the alternative is drawing knights at x1.5 with a 45 px figure (bigger than the hit box).
2. The bestiary portraits use the forest grey-green palette for every body. Rec: keep; per-chapter cards would need a card per chapter.
3. Sprite atlas is large (92x72 x 12 frames x 4 variants per body per skin, ~5 MB each skin). Rec: if memory matters later, crop frames to their box with per-frame offsets.
