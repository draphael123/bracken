# LOGO lane (claude/logo) - Daniel's THORNROAD logo is the title mark

Branch claude/logo off master 85d152eb8, worktree bracken-logo. NOT merged, NOT deployed.

## What changed
- assets/ui/title-mark.png (187x29 native RGBA PNG, 7.4 KB) + assets/ui/title-mark-original.webp (2000x667, kept for the record; hidden from the live deploy via .vercelignore).
- The webp already carried a real alpha channel (corners and letter counters transparent), so no white flood-fill was needed; alpha is made hard on/off. The picture's "pixel grid" is NOT even (blocks run ~12-14.5 px), so no true grid exists to detect. It is cut into 10-source-px cells; each cell takes the MOST COMMON colour (no averaged in-between colours), so the palette stays the logo's own. Cell 10 chosen over 13.5 (139x21 lost the vine detail) and 9 (208x32, too wide). tools/title-mark-build.mjs rebuilds it (needs ffmpeg for the webp decode; node has no webp decoder).
- src/main.js: TITLE_MARK Image + draw on the title at scale 1 in the 320x180 picture (so 3x at 960x540, 6x at 1920x1080, always integer; smoothing is off on the picture buffer), centred where the plank sign was, sways with the sign and eases down with the intro. Tagline 'a road, a crown, a mountain' sits on a dim plate under it; PRESS ANY KEY and the menu board unchanged and readable. The plank sign + drawn word remain as the fallback until the PNG has loaded (and for tools without Image). The plank's glint is not drawn with the mark. The mark records itself to the text recorder as 'THORNROAD' (size 22) so titlescene / uiscreens / textfit still see it.
- index.html (<link rel=preload as=image>), sw.js SHELL, tools/build-itch.mjs put list (demo zip), tools/deploy-surface.mjs mustServe, .vercelignore, tools/itch-build-check.mjs (asserts the zip has it), tools/check.mjs (registers 'title-mark').
- New tools/title-mark.mjs (node): PNG is RGBA, native size fits, four corners transparent, outline/gold/vine pixels present, hard edges, original webp kept, listed for preload + sw + itch demo build + deploy, drawn by main.js with plank fallback, no ad-block word.

## Where the logo shows
Title screen only (press-card state and menu state). NOT changed on purpose: loading screen (its own 320x180 canvas, small 5px 'THORNROAD' text, not the big logo), rotate-device overlay (text), demo end card (FOLLOW THORNROAD line is plain text, no big word), What's New (no big word), page title/meta. Owed if Daniel wants it there too: loading screen could use the mark, but it would need a pre-boot image fetch.

## Node results (all green)
title-mark, deploy-surface, demo-cut (incl. flag-use pin), modulepreload, title-region, itch-build-check (925 files, mark shipped). Browser (one headless Chrome, 4 GB free): titlescene OK, uiscreens OK, no page errors.

## Stills (scratch/logo/)
title-960.png, title-1080.png (press card), title-menu-960.png, title-menu-1080.png (menu visible). Console errors: none.

## Owed / notes
- Not run: the full suite (gate does that tonight). demo-cut/itch-qa-* page-level tools not run.
- The old sign glint is gone with the plank on the title; a mark glint would need an offscreen mask (cheap polish, skipped).
- Question for Daniel (rec: yes): use the mark on the loading screen too? Rec: later, as a separate polish.
