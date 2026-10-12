# claude/shipfix - SHIP FIXES 1 (sonnet, 2026-10-12) - from scratch/brief-finish.md section 5 + scratch/audit-ship.md

Base: origin/master 4fabe26c (batch86). Branch claude/shipfix. Cheats LEFT AS IS (untouched).

## What shipped
- REPORT A BUG = a pasteable code, no email, no network. Rows: pause menu "Report a bug", title OPTIONS "REPORT A BUG". A DOM board (src/bug-report-ui.js, the online-coop board look) asks "what happened?" (one line, optional), then builds
  `BRK1-` + base64url(deflate-raw(JSON)) (src/bug-report.js), <= 1500 chars (oldest console/event lines dropped first), copies it (clipboard, else the code is selected on screen), says PASTE THIS TO THE DEVELOPER.
  Content: batch/date/sha, level, col/row, hero, hp, flasks, save slot number (never save contents), 11 settings that change play, device (size, dpr, touch, UA), the note, the last 20 console errors/warnings (console + window error + unhandledrejection taps installed first-import), the last 20 level events (load, died: killer @col,row, shrine lit, boss start, flask drunk, level won, screen changes, end of the road).
  `node tools/bug-decode.mjs <code>` (or `--json`, or stdin) prints it readable; it finds the code inside a chat message and across wrapped lines; a cut code is refused with a message.
- BUILD LINE small on the title: `BATCH 86 - 11 OCT` (from docs/updates.json, so it is always the batch the deploy guard required); `src/build.js` holds `sha: ''` for the release to stamp.
- END OF THE ROAD - FOR NOW (src/ending.js, main.js drawVictory): the end of the main-road gate chain (campaign-order.js - currently The Buried City, never a hard-coded id). Solo: road cleared n/41, best-run time and deaths added up, G/S/B medal counts, completion %, MORE ROAD IS COMING, Z back to the map, music 'ending'. Co-op: the same card keeps its two columns. THE MAGE'S FOLLY is now a plain win card in solo and co-op (the co-op "THE ARCHMAGE IS DOWN" card fired there mid-road).
- SAVES (src/save-safety.js): a corrupt slot is shown CORRUPT (a later-version save NEWER SAVE) in the picker, never EMPTY; Z opens FIX IT = RESTORE the last good copy (or a pre-migration backup that reads clean) / EXPORT THE FILE / ERASE THE SLOT / BACK; X on a damaged slot asks ERASE (it said "already empty"); the damaged text is kept as key.corrupt before any restore/erase; the title's CONTINUE/PRACTICE/CO-OP/RUSH doors open the picker for a damaged current slot instead of loading it blocked; `.lastgood` copy refreshed whenever a clean slot opens. saveProgress now goes through safeSet: a failed write sets 'SAVE FAILED - STORAGE FULL' (or COULD NOT WRITE), paints a banner on every screen + a toast, buzzes once, keeps the old stored text, retries on every later save and clears when one lands; on a full disk it first frees only safety copies (migration backups, corrupt copies, this slot's last-good) and retries - never another slot. Migration backups are pruned to the one just written.
- BERSERKER VOICE: setHeroVoice accepts him (HERO_KIT already had his kit) + the jump voice line.
- FAVICON/ICONS: favicon.ico (16/32/48), icons/favicon-32.png, new app icons (steel pixel B, red plume, gilt frame, fronds); tools/make-icons.mjs rewritten to generate them; manifest description refreshed; serve.mjs knows .ico.
- DEPLOY SURFACE (.vercelignore): hides tools/*, docs/*, work, audits, src/benched, root *.md; KEEPS docs/updates.json (WHAT'S NEW + the release guard's source), tools/fixtures/campaign-xp.json (?campaign=1), and src/draft (levels import their geometry from it - it cannot be hidden).
- CREDITS: 15 more CC0 authors (artisticdude, HaelDB, cicifyre, thebardofblasphemy, Badre-Eddine, Ogrebane, Rango Mango, wolfwoot, ArcadeParty, Exewin, StarNinjas, RandomMind, Zane Little Music, jasinski, Independent.nu) onto the credits page beside Kenney/rubberduck/StumpyStrust.
- Opening panels: "a first draft" removed from the file's header (the shown lines were never labelled).

## Checks (PORT 8862, one page at a time) - all green
New: save-safety, bug-report, ending, ship-fixes, deploy-surface (all in tools/check.mjs). Re-run green: uiscreens, save-slots, textfit --strict title,menu,credits,slots,erase,hints,press,opening (+ new slots-damaged/fix-it frames and an 'ending' scope added to textfit, which caught and fixed a truncated line), whatsnew, online-coop, hud-default, modulepreload (419 listed, 0 missing; index.html block regenerated), ui-hud, settings-tabs, berserker, progression, audio-assets, touch, titlescene, fonts, loading-screen, level-jump, death-screen, level-complete.
Test edits (stated, deliberate): tools/titlescene.mjs - the OPTIONS list is now SETTINGS/SOUND TEST/CONTROLS/REPORT A BUG/BACK (Daniel's new row). tools/textfit.mjs only gained scopes/frames. No test weakened.

## Reds
- textfit `whatsnew` scope: 1 CLIPPED ("- 67 recorded sound effects, and real bells for the bell bosses") + 1 COLLIDE ("- Deep Rails redrawn..." x "v") on the batch-86 entries of docs/updates.json. Not touched by this lane (entry text + drawing unchanged); coordinator's entry needs shorter lines or the panel a line more. Not in the asked scopes.

## QUESTIONS FOR DANIEL (rec as built)
1. Build sha: the title shows batch + date. Rec (not built, it is in scratch/release.sh): the deploy step stamps `sha: ''` in src/build.js (`sed -i "s/sha: ''/sha: '$(git rev-parse --short HEAD)'/" src/build.js`) before `vercel deploy`; reports then carry the sha.
2. The END card shows on EVERY clear of the last road level (replays too). Rec as built: yes; alternative: first clear only.
3. Completion % on the card = (levels cleared + medal 0-3 each) / (4 x levels). Time/deaths are "best runs added up" because the save keeps no lifetime clock. Rec: the later completion lane adds a play-time counter and replaces src/ending.js completion().
4. HaelDB's file is OGA-BY 3.0 used under its CC0 offer and is credited; confirm that file may be shown under CC0 (audit item).
5. .vercelignore negations (docs/*, !docs/updates.json) are checked by tools/deploy-surface.mjs against a gitignore matcher, not by a live deploy. Rec: after the first deploy curl /docs/updates.json (200) and /tools/check.mjs (404); release.sh's verify loop could add both.
6. work/ (345 MB) and audits/ are no longer deployed; nothing loads them. Rec: keep.
