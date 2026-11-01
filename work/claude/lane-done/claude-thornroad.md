# THORNROAD rename lane (11-01) - branch claude/thornroad

## Name check: CLEAR (details: scratch/lane-reports/thornroad-namecheck.md)
Steam search "thornroad" = 0 results; itch.io search = no match; web search found no game or obvious video-game trademark named Thornroad / Thorn Road (only different names: THORN tabletop RPG, Thorn Knight, Thornbound, THORNADO, THUNDER ROAD). Web search is not a registry search: run USPTO/EUIPO class 9 + 41 before a PAID release (free demo = low risk).

## Changed player-visible strings (internal ids, save keys, localStorage keys, repo, URL, file names untouched)
- Title: src/title-card.js (press card wordmark + tagline), src/main.js (title sign wordmark + tagline), src/loading-screen.js (loading wordmark + tip line). Wordmark is font text on the plank, not baked art, so no redraw needed; THORNROAD at size 22 fits the plank (textfit title/press: 0 issues).
- Tagline "a knight, a wood, a mountain" -> "a road, a crown, a mountain" (title, press card, loading tip "A ROAD, A CROWN, A MOUNTAIN.").
- index.html: <title>, apple-mobile-web-app-title, rotate-phone screen (2 strings). manifest.webmanifest: name + short_name.
- Save UI / co-op / online: "FROM A NEWER BRACKEN" -> "NEWER THORNROAD" in src/main.js (slot picker x4), coop-save.js, ai-companion.js, online-guest.js (also its document.title), progression.js (error text).
- Credits row fallback "made for THORNROAD" (main.js). Bug report header "THORNROAD BUG REPORT" (bug-report.js). Skin label BRACKEN BLUE -> THORN BLUE (id 'bracken' kept, so saves load).
- What's New: docs/updates.json entry 2026-11-01 batch 137 "BRACKEN is now THORNROAD..." (3 lines).
- Tools updated to match: tools/titlescene.mjs, tools/touch.mjs (manifest name), tools/uiscreens.mjs (last panel = hero name), tools/textfit.mjs (opening scope tests every hero name).
- Deliberately NOT changed: "bracken" the fern in level text/signs (THE DRIVE sign, A BOAR IN THE BRACKEN, "the bracken has grown over the old road" tip) - it is the plant; audio credit rows "- BRACKEN" (credits.js uses it as the 'made for the game' marker); level.js hash untouched; PLAYTEST/dev console strings; docs/*.md; the loading-screen scene still draws a knight by the fire (art, hero-agnostic redraw = a later art task; question 3).
- No "Brackenwood" / "knight in the wood" strings existed outside the tagline; there is no share-text feature.

## Intro (src/opening-panels.js + src/main.js)
The old opening was the first-run 4 panels before the hero pick, all assuming the knight and the wood. Now: pages 1-3 play before the pick, page 4 plays RIGHT AFTER the pick and carries the picked hero's name (HEROES name, e.g. THE WARDEN) and cloth colour (HERO_COLOR.mid) on the walking figure. Same timing/skip keys. Flow tested (opening -> pick -> hero page -> map/trial). Skip (X/ESC) still works; flag key bracken.openingSeen unchanged.
Lines shipped (set A, rec):
1 THE ROAD: the road runs out of the wood. / nobody has walked it in years.
2 THE MOUNTAIN: past the wood, past the sea, / there is a light on a mountain.
3 THE GOBLINS: torches and drums on the road. / they are coming down it.
4 <HERO NAME>: one against the whole road. / so you go up it.
Set B (goblins first, shorter):
1 THE ROAD: the wood ends here. / the road does not.
2 THE GOBLINS: drums, torches, a long line / coming down the road to you.
3 THE LIGHT: a fire on a mountain far past them.
4 <HERO NAME>: they are many. you are here. / go.
Set C (names the hero in the line):
1 THE ROAD: out of the wood and over the hills,
2 THE GOBLINS: the whole horde comes down it.
3 THE MOUNTAIN: someone must climb to the light.
4 <HERO NAME>: this one is yours. / do not stop.

## Stills (scratch/lane-reports/thornroad/)
title.png, press-card.png, intro-1.png, intro-2.png, intro-3.png, intro-4-knight.png, intro-4-warden.png, intro-4-pyro.png (ghost text behind the hero title in the stills is only the 2-frame screenshot not yet faded; the plate repaints every frame in play).

## Checks (all green)
tools/titlescene.mjs ok; textfit opening,press,title --strict: 14 screens, 0 issues; uiscreens ok; whatsnew ok; save-safety ok (old saves/newer-save label). Two earlier crashes of whatsnew/uiscreens were page OOM at ~1 GB free RAM; green when rerun at 2-4 GB. Not run: full suite / levelcard / touch.mjs (no level or touch change; touch.mjs only asserts the manifest name, updated).

## QUESTIONS FOR DANIEL (rec first)
1. Intro set A, B or C? Rec A. (built: A)
2. Tagline "a road, a crown, a mountain" ok? Rec yes; alt "one road, no way back".
3. Redraw the loading-screen campfire scene to be hero-agnostic (it shows a knight)? Rec yes, small art task after the demo.
4. Rename the vercel URL and itch slug? Rec URL/itch slug at demo launch (11-09/10) so the demo page already says THORNROAD; repo and internal ids never.
5. Run a USPTO/EUIPO class 9+41 search before any paid release? Rec yes.
