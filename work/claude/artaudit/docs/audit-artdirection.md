# BRACKEN ART-DIRECTION AUDIT (read-only) - 2026-10-09
Tree: branch claude/artaudit off batch80 a12b02f4. Shots: `bracken-artaudit/work/claude/artaudit/{desktop,anim}/*.png` (1280x720 headless via tools/cdp.mjs; prefix W below). Scripts: `W_s/shots*.mjs`. Older UI findings (10-03): scratch/audit-ui.md. Level identity sheets: scratch/audit-identity/.

Verdict: the pixel ART (tiles, props, skies, hero/foe sprites) mostly reads hand-made. What reads AI/generated is the SYSTEM around it: one bevelled plate recipe + wide ALL-CAPS type everywhere, code-drawn tweens/boxes for motion and tells, scattered pixel scales, and text that explains instead of showing. Fix the system, not the sprites.

## Cross-cutting causes
1. Type: Press Start 2P everywhere (wide caps) + Silkscreen as a setting + a THIRD face for HUD numbers/timer (thin outlined bitmap; W desktop/hud-redgorge-full.png "0:00.5", "126") + system monospace for boot/DOM (src/main.js:26588 FONTS, touch.js:39, index.html). Same meaning appears at 4 sizes, no ladder.
2. One panel recipe (dark navy plate + gold corner studs) at every scale: HUD, store, settings, map info, title menu. No function-specific shapes. Template look.
3. Tweened / code-drawn motion: poses pop or rotate rigidly, effects are rect/ellipse overlays, tells are coloured boxes/lines (main.js:12718 red fillRect warning bar, :13884 ellipse glyph rings, :20991 glow rect, :21075).
4. Text density: map panel, store, settings (81 rows), controls (20 lines), toasts.

## Screen by screen (sev = HIGH / MED / LOW)
1. TITLE (HIGH) W desktop/title-after-key.png. Menu panel is pasted over the right third of the arch art, hiding the scene's focal point and the knight; the BRACKEN sign bleeds off the left edge; the tagline "a knight, a wood, a mountain" runs into the panel in a small lowercase style (third look); footer mixes sizes/cases. FIX: compose as one scene: logo fully on-screen, menu as 5-6 plateless words (or hanging-sign props) on the dark side, tagline one size under the logo with a gap, drop footer.
2. TITLE MENU (MED) same shot. 7 top-level items; settings/sound/controls/credits are all peers. FIX: CONTINUE / SAVES / CO-OP / PRACTICE / OPTIONS (settings, sound, controls) / CREDITS.
3. SAVES (LOW) W desktop/saves.png. 5 full-width plates, "NEW GAME" x4, footer mixes CAPS "ARROWS" with lowercase verbs and a bare "ESC". FIX: empty slots = one line "+ new"; glyph footer.
4. HERO PICK / TRIAL PROMPT (MED) W desktop/heropick-warden.png, heropick-knight.png, hero-trial-prompt.png. Seven banners, label zig-zag, clipping per the 10-03 audit (recheck). FIX: one row of 7 idle-animated portraits, name + 1-line flavour.
5. MAP (HIGH) W desktop/map-welltown.png (+ map-canal, map-theatre). Mixed scales: store/house/landmark sprites ~3-4x, hero ~2x, node rings and road dither ~1x; soft-edged cloud on a hard-pixel map; node labels are dark wide-caps plates that overlap nodes and each other ("THE GLASS SEA" sits over its node, "THE UNDERWELL" under a road) and are half-hidden by the info panel ("THE WITCHCRAFT STATE", "FALLING TOWER", "MAGE'S FOLLY" cut by it) and dither. Queen bee sprite not captured (see below) - the brief reports it as oversized. FIX: one map scale (2x for everything), one label style (small ink on a wood/parchment strip), label only the selected node + neighbours, hard-pixel clouds, panel <= 30% height and never over the selected node.
6. MAP FIRST FRAME (MED) W desktop/map-wood.png is pure black (fade/bake gap). FIX: draw the map under the fade from frame 0.
7. MAP INFO PANEL (MED) same as 5. Name, blurb truncated mid-sentence ("only blue in"), status, 3 medal times, coins, quest, recommended Lv, difficulty; thumbnail = 3 flat rects. FIX: name + 1-line blurb that fits + 3 medal icons + recommended Lv pip + real level thumbnail.
8. HUD (HIGH) W desktop/hud-welltown-full.png, hud-redgorge-full.png vs hud-*-minimal.png. Corner plate is ~470x180 (37% of width); heart/bolt/flask/shield icons at different scales; labels "LV 0 x3" vs "LEVEL 40" differ; sun bar, water icons and orange outlined "FILL AT A WELL" float with no grid; "WATER-SKINS 0/4" uses a translucent bar unlike neighbours. FIX: make the MINIMAL layout the default: hp+stamina bars with 1px outline, no plate, flask/xp as icon+count, one status row, one objective line.
9. STORE (MED) W desktop/store-tab1.png. Cleanest screen. Issues: 8 tabs in two wide-caps rows; preview pane is an empty box with a tiny 1x hero beside 3x rows; coin icon scale differs from row icon; "v" scroll cue sits outside the list; grey caps footer. FIX: preview with 4x hero + stats + one line; single tab row of icons; "n/N".
10. SETTINGS (MED) W desktop/settings-display-top.png (+ settings-*). 36-81 rows in a 9-row window; title "SETTINGS DISPLAY" + tab + section "PICTURE" says the same thing 3x; mixed-case labels vs CAPS values (only Mixed-case screen); Back row + "ESC close" duplicate. FIX: single heading, scroll count, no duplicate exits.
11. PAUSE / DEATH / WIN (LOW) W desktop/pause.png, death-30-8h.png, win-40.png. Same plate again; death card is mostly numbers. FIX: one statement + the one number that matters.
12. BOSS BAR (MED) W desktop/boss-welltown-both.png (+ -bar/-num/-pct). Intro banner strip across the screen covers the boss's head; bottom bar repeats the name ("THE DJINN SAND"), shows 900/1451 AND 62% AND bar with different glyph widths. FIX: one bottom bar, name once, bar only (numbers behind a setting), intro 1.5s in the top fifth.
13. TOASTS / HINTS (LOW) W desktop/toast-*.png. Translucent web-style plates stacked on the HUD. FIX: plateless one-liner by the hero.
14. SIGNS / DIALOGUE (MED) W anim/level-wood.png, desktop/hud-redgorge-full.png. Sign props are good pixel art, but the "E" prompt is a bare floating glyph in another font; dialogue ('talk', main.js:25615) uses the standard plate. FIX: button glyph on the sign; speech plate at the speaker, <= 2 lines x 28 chars.
15. LEVELS sample (LOW; best part of the game) W anim/level-wood.png, level-welltown.png, level-canal.png, level-theatre.png, level-reef.png + scratch/audit-identity/*. Layered parallax, per-biome palettes, hand-placed props read as authored. Welltown has translucent flat-edged light columns (x~900-960 and ~1020-1150) that look like UI overlays. FIX: dither-edged shafts; keep the rest.
16. HERO ANIMATION (HIGH) W anim/hero-attack-strip.png, hero-jump-strip.png, hero-run-strip.png. Attack: 1-2 frame wind-up, the slash arc appears whole, the blade rotates as one rigid sprite; no crouch, weight shift or follow-through. Reads as a rotated sprite, not drawn frames. FIX: keyframe 6 drawn poses (anticipate 2f, strike 1f held with smear, follow 2f, recover).
17. FOE ANIMATION + TELLS (HIGH) W anim/foe-sprig-strip.png. 2-frame bob idle; attacks warned by flat red/yellow rects, ellipse rings and glow boxes (main.js:12718, :13884, :20991, :21075). Most "AI" element in combat. FIX: tell = the foe's own wind-up pose + a 1-frame white flash + sound; boxes only as accessibility option.
18. BOSS TELLS (MED) W desktop/boss-welltown-both.png. Pose pops between frames; danger zones are translucent flat areas. FIX: as 17; zones = dithered floor decals in the biome accent.

## Not captured (carry to fix lanes)
Queen bee map sprite (map-wood is black), pause skills tree, phone profiles (see 10-03 audit), mid-attack boss frames, strips are only 2-tick samples.

## PROPOSED FIX LANES (one Sonnet lane each, priority order)
1. FONT-PAIR: Press Start 2P + Silkscreen only, size ladder 8/12/24, kill system monospace + the third HUD face, make Settings font switch a readability option; text-fit lint.
2. TITLE-SCENE: recompose title (logo on-screen, plateless menu, tagline gap, grouped items) + first-frame map black fix.
3. MAP-SCALE: one 2x scale for all map sprites (Queen bee, store, clouds hard-pixel), new label style, label only selected+neighbours, info panel shrink/reposition + real thumbnail, no label overlap (add lint).
4. HUD-SLIM: minimal layout as default, outline-not-plate bars, unify icon scale and LV label, one status strip/objective line, boss bar single-name/bars-only.
5. HERO-KEYFRAMES: knight attack/jump/run as drawn keyframe poses (anticipation/follow-through), then other heroes by the same recipe (tools/pose-shots.mjs for review).
6. TELLS-AS-POSES: replace red rect/ring/glow tells (main.js:12718, 13884, 20991, 21075 and per-foe equivalents) with wind-up pose + white flash frame; accessibility toggle keeps the box.
7. PANEL-SHAPES: wood/parchment/ledger plate variants; settings/store/save/pause/death text trim (single heading, n/N, footers as glyphs).
8. SIGN-DIALOGUE: button glyph prompt, speech plate at the speaker, 2x28 text cap, toast shortening.

## QUESTIONS (rec first)
- Strict pair vs single font? Rec: pair (Press Start display, Silkscreen body).
- Default HUD = minimal for everyone? Rec: yes, plate HUD as opt-in.
- Keep the 7-banner hero pick or portrait row? Rec: portrait row.
