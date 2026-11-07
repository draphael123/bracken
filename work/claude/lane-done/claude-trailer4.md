# ITCHPAGE + TRAILER4 (11-07) - branch claude/trailer4 (off claude/trailer3 ba9b42a3e), worktree bracken-trailer4. Not merged, not deployed.

## Task 1: itch page draft - C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\itch-page\
- ITCH-PAGE.md: title, 1-line tagline, 134-char short description, full page text (what it is, 5 heroes, co-op up to 4 / online, bosses, DUEL (BETA), what's in the demo), controls table, tags (10), itch settings, upload notes, image list, unverified list.
- cover-630x500.png; screenshot-1-king-gorm / 2-co-op-wood / 3-mother-cap / 4-inn-party / 5-duel-beta (.png, 1280x720). Built from the trailer's clip frames (640x360 plates) with whole-number nearest-neighbour scaling (2x / 4x crops), cover has THORNROAD / FREE DEMO in the game's font. I viewed cover, 1, 3 and the rest as contact sheets.
- Verified from code: keyboard + pad defaults (src/controls.js KB_DEFAULT / PAD_DEFAULT), touch scheme (src/touch.js), live title rows (batch148 report), demo card text (zip docs/updates.json), zip index.html (viewport/touch/rotate prompt), zip = 924 files, 57.6 MB.
- Not verified: online co-op inside itch, touch/iOS/itch sandbox, boss count vs level data, licence items (see section 8 of the page doc).

## Task 2: hand-framed vertical - scratch\trailer\
- thornroad-vertical-v4.mp4 (22.3 s, 12 MB), thornroad-vertical-v4-phone.mp4 (20.0 MB), thornroad-vertical-v4-cut.json. Stills: scratch\trailer\stills-v4\vert4-t1.1 / t11.5 / t15 / t18 .png (plus I checked ~12 other frames while iterating).
- Tooling (commit 9f8e514de): tools/trailer.mjs renderClip has a new per-clip `vcrop` { w, h, x (number or [x0,x1] pan), y, follow? } read from the parts JSON (tools/trailer3/vertical-parts-v4.json; `node tools/trailer.mjs cut3 --parts=vertical-parts-v4`, then `phone --in=thornroad-vertical-v4.mp4`). It cuts a w x h window of the 640x360 plate, scales to 1080 wide (6x neighbour then area down) and centres it on a darkened blurred copy of the plate (letterbox); the clip's own mask is applied too; captions sit in the blur below. Clips without vcrop keep the old P1-follow crop.
- Per clip: gorm_pyro 432x252 pan 180->200 (boss + fire in frame); spore + comb unchanged (hero follow was fine); palbeast 432x240 fixed (hero + beast); inn_dance 480x270 pan 20->160 (all partners, no cut banner); duel_2v2 full-width 640x300 (all four fighters + HUD); store_buy full 640x360 (all text readable, bottom hint masked as before). Title/end cards unchanged; end card has no URL (TR_URL unset).
- Bug found + fixed on the way: sendcmd "crop x" hit the blur-background crop in a split graph; the foreground crop is now named crop@fg. (The old vertical path has only one crop so it was unaffected.)
- Caveats: the letterboxed clips (gorm, inn, duel, store) are small on the phone (picture ~2.5x/1.7x, blur above and below); no clip was dropped. Duel HUD is cut at the plate's own right edge ("RANTEP", native to the clip). Not viewed: a playback of the whole video (only 12+ stills).

## Questions for Daniel (rec first)
1. Is the letterbox-on-blur look OK for the vertical, or do you want only full-bleed clips? Rec: keep v4 (nothing important cut); if you want full-bleed, drop duel + store + inn and re-cut with 6 clips.
2. Tagline: use "Walk the thorn road, learn the bosses, bring up to three friends"? Rec: yes.
3. Online co-op claim on the page? Rec: keep it but test one online session on the Draft page first; if it fails, delete the clause (see ITCH-PAGE.md section 8).
4. Mobile friendly flag? Rec: OFF until one real-phone test on the Draft page.
5. After the page exists: send me the itch URL and I re-render the end cards (TR_URL=...). Rec: yes, once, for the final cuts.
