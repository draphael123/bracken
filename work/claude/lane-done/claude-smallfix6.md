# claude/smallfix6 - Stockade horn soft-lock + music not starting (Daniel 11-01 live)

Branch claude/smallfix6 off origin/master 0fe14c26 (BATCH135). Not merged, not deployed. Gate136 was running the whole lane (GATE-RUNNING.flag), so CODE-ONLY: no headless browser was launched.

## 1. STOCKADE HORN SOFT-LOCK
Root cause: the only horn in the level is the dozing blower's (u12 on the inner-palisade walk). The walk is the only way on, he sleeps (wake radius 36 px), so a hero can walk straight past him, go down the rope at u32 into the yard and meet THE BARRED GATE (opens only to a horn blown within GATE.r) with no horn. The reach tools can't see it: L.reachDoors counts the gate open for every hero. The route-guide glint (stuck-spots sk-horn-gate) only fires after a 10 s stall. Also: a dropped horn (dropHorn) fell with no floor check (a blower dying over nothing = horn lost forever).
Fixes:
- THE SPARE HORN: hung on a post at the foot of the gate tower (tile 482/19, `L.stockade.spare`), drawn on its post, owed ONLY while no horn is held (any horn in hand removes it; it re-hangs after a death only if you never had one). Pick-up = held (E blows it, gate opens as for the blower's horn).
- Told twice: a sign beside it 'A HORN OPENS THE GATE. A SPARE HANGS ON THE POST.' (stuck:true, so levelHash is unchanged - verified 74827c0946e6 before and after) and a number over the hero 'A HORN OPENS THE GATE' (once per 9 s) when he nears the gate with no horn. Pick-up says 'THE SPARE HORN: E BLOWS IT'.
- Intended route stays first: the blower is first on the walk, the spare is ~50 tiles later.
- Dropped horn never out of reach: lands on the first footing under the blower; a blower who dies over nothing leaves it on the spare post; per-frame guard moves any horn that falls past the map to the post.
- One-way drops: checked with a sealed-gate reach fill - from the yard the blower's walk and its far end are reachable again (the u32 rope), so there is no one-way trap past him.
Files: src/stockade-hands.js, src/level.js (stockadeWatchtowers), new tools/stockade-nohorn.mjs (wired into tools/check.mjs).

## 2. MUSIC SOMETIMES DOESN'T START
Code-read root causes (all in src/audio.js), each now fixed and each red on master in the new mock test:
1. A failed file was never asked for again: 3 quick tries -> trackFailed, then the synth stood in (or silence) for the rest of the level. Now retried every 4 s (max 10) while it is still the wanted track.
2. A fetch that never answers left trackPending true for good (no music, and the 867 sound clips WAIT behind a pending track). Now each fetch has a 20 s abort timeout and retries.
3. Context only resumed when state === 'suspended' (and only on input); 'interrupted' (Safari after a call/tab switch) or a context made by a gamepad poll stayed silent. Now resumeAudio() at creation, every input, every music.play and when the tab becomes visible.
4. music.play(X) for the track already marked playing but with no copy running (timers throttled in a hidden tab) returned early = silence. Now restarts it.
5. Unknown / mis-spelt music key: played the generic synth arpeggio. Now warns once and plays 'theme' (musicKnown()).
Levels with no L.music key: only the editor's 'custom' (main.js already does L.music || 'theme'). Every other level/arena/mini music key resolves to a known track (tools/audio-assets.mjs agrees: 53 levels, 53 arenas, 15 minis).
Honest limit: I could not reproduce a specific start race in a real browser (gate running); the five above are the plausible silent paths. If it still happens after this, the log line to look for is 'Music track X failed to load'.
New tool tools/music-levelstart.mjs (mock AudioContext + network, wired into check.mjs): static key check + late context, interrupted context, level/title/map hop with out-of-order files, failed-3x file, hung fetch, restart-with-no-copy, unknown key -> theme.

## Checks run
- node tools/stockade-nohorn.mjs: OK (RED on master: spare missing)
- node tools/music-levelstart.mjs: OK (RED on master: 6 failures)
- node tools/deadends.mjs stockade: 6 dead ends, every one pays
- node tools/signs.mjs: OK; node tools/audio-assets.mjs: ok
- node tools/boss-music.mjs: ok (exit 0; slow on its mock clock)
- NOT run (browser, gate running): tools/stockade-horns.mjs, stockade2, stuck.mjs, music-start.mjs, music-priority.mjs, textfit (new sign text is 2 lines, signs.mjs passes). Please run those once the gate flag is gone.

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Spare horn always at the gate if you hold none (BUILT) vs only after you have skipped the blower? Rec: as built - simplest, can never lock.
2. STOCKADE LEVEL + BOSS using the level's mechanics more (your 07:47 ask) was not part of this lane; coordinator thoughts pending.
3. If music still drops sometimes: want an in-game 'MUSIC LOADING' tell? Rec: no, only if it recurs.
