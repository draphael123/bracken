# claude/rootwayfix - THE ROOTWAY: the "impossible jump" + its own music (2026-10-09, sonnet, PORT 8798)

Branch `claude/rootwayfix` = origin/claude/batch81 + small commits (jump fix, music). reachcore: batch81 has no `reach-heroes` / `REACH_HERO`, and a plain
`git merge origin/claude/reachcore` conflicts in 6 files, so the work and its checks ran on a dev branch cut from `origin/claude/reachcore-b81`
(the coordinator's resolved batch81+reachcore trial); the commits on `claude/rootwayfix` are cherry-picked onto batch81 and touch only
src/main.js (1 token), src/rootway-hands.js, src/rootway.js, src/audio.js, src/credits.js, audio/*, tools/boss-music.mjs.

## 1. THE JUMP
- Where: the photo is the LOOKOUT CHASM, columns 304-311 (8 wide, floorless, A10-amended exam gap) of the live Rootway: HUD "TROPHY TAGS 2/4" (tag two at 272 is
  taken, tag three at 338 is past the gap), the near platform 297-303 (sign + checkpoint 299), hoist ropes hanging over the gap (hunter C at 301, the lookout's span at 308).
  Live (batch80) has no zip line at all (ziproot adds the gantry at 281-296 only; the live road 269-303 is flat), so this is not a ziproot gap.
- Cause: it is not a jump. The gap is crossed by a VERB (strike the lookout scout's arrow back through his rope and the span drops). Nothing told the player:
  the scout stands 17 tiles (272 px) from the checkpoint and fires only inside 230 px, so a hero at the checkpoint/sign sees an 8-wide hole, no scout and no arrow
  (verified: a hero at 297 for 40 s of game time = 0 shots). The player reads it as an impossible jump.
- Fix (small, level-side): the Rootway's scout sees 320 px (`LOOKOUT.sight` in src/rootway-hands.js, applied to the scout and to the respawned one; main.js archer
  range reads `e.sight || 230`, every other archer unchanged). From the checkpoint he now draws ('!') and fires; the arrow lands short in the hole (told), and the
  hero at the lip strikes it back. No tile moved, so no hash / stamp moved.
- Proof, per hero (base movement, the game's own sim, hero at col 303, no god-mode shortcut for the verb, blade swung when an arrow is within 40 px): knight, warden,
  pyro, paladin, pirate, reaper, geomancer all drop the span (first arrow at 1.7-2.4 s; done in 3.3-6.1 s game time). `tools/rootway-probe.mjs` green.
  `REACH_HERO` / `node tools/reach-heroes.mjs rootway`: every hero 0 required crossings his own legs cannot make (7 route targets each, 0 known crossings). No jump in
  the Rootway is required of any hero beyond the verbs; no other frame-perfect crossing found (the Rootway has no entry in reach-heroes KNOWN).
- Not done on purpose: no jumpable alternative at the chasm. tools/rootway.mjs pins that the road past it is out of reach without the span (a required use, A4);
  weakening that would be weakening a test.

## 2. MUSIC (Daniel 10-09: its own music, both)
Downloads each in its own new folder (scratch/rwf/dl-forestwhisper, dl-calltowar), header checked (RIFF/WAVE, PK zip -> OggS/RIFF), nothing executed; the zip
extracted into its own folder. Licence read on each track's own OpenGameArt page.
- LEVEL: "Forest Whisper Theme" by Cleyton Kauffman, CC0 (page: "CC0", notice "Music by Cleyton Kauffman - soundcloud.com/cleytonkauffman"),
  https://opengameart.org/content/forest-whisper-theme - 1:22 seamless loop (author's note: loops seamlessly). Mono, +7.3 dB, -1 dBFS limiter, q4 ogg; -24.2 LUFS
  (old track -24.7, ksar -19.6). Acoustic/woody, quiet. -> audio/rootway.ogg (replaces Lanterns; canal.ogg still has Lanterns, so it stays credited under 'canal').
- BOSS: "Call to War" by Umplix, CC0 (page: "CC0", snare + horn samples, "battle theme"), https://opengameart.org/content/call-to-war - 76 s, 120 bpm. A 9.5 s build
  plays once (TRACK_INTRO.huntmaster = 9.5), then the 62 s body (31 bars) loops; cut at 71.5 s on the beat, before the track's ending tail. Mono, -1.6 dB, limiter,
  q4; -15.5 LUFS (= winchmaster). -> audio/huntmaster.ogg; arena music 'boss3' -> 'huntmaster' in src/rootway.js.
- Wired/credited: TRACKS, TRACK_INTRO, MUSIC_NAMES (Sound Test), CREDITS_ROW, MUSIC_CREDITS in src/audio.js; src/credits.js (rootway, huntmaster, canal rows);
  audio/CREDITS.txt. Not used elsewhere in the game (checked CREDITS.txt; the author Umplix has another track, "Cathedral", which is a different one).
  tools/boss-music.mjs now also requires the Huntmaster's arena off the generic pool. Old rootway.ogg replaced in place (nothing else used that file).
- Could not listen: loudness, loop length and the beat grid were measured (ffmpeg ebur128), not heard. The 62 s seam (71.5 -> 9.5) lands on the beat but is
  untested by ear.

## Checks (PORT 8798; the PC was loaded, one tool at a time)
ok: rootway (all green), rootway-probe, reach-heroes rootway, level-reach rootway, death-cost, zipline (289 s; 25/25 lines on every hero), boss-music, audio-assets
(static), soundtest, dangling-paths, homepaths, modulepreload (2 reachable not listed, budget 15).
Red, NOT mine (all are on the trial base): level-quality + curve-gate: scree is out of its act-2 band (482% / 11 deaths); stuck runtime: sp-terrace-3;
checkpoint-stand: glasssea @548,33 and church @82,18; mash-gate: oreroad (stale, reachcore's ore plug) and rootway (stale - see below).
audio-assets --decode: the page did not answer in 121 s under load (cdp timeout) - re-run when the PC is quiet.
Stamps: see the commit that restamps docs/level1-pilot.json, level1-curve.json, mash-bot.json (rootway; level then boss).

## QUESTIONS FOR DANIEL
1. Is the lookout chasm the spot in your photo? (Blurry; the tag count 2/4 and the hanging ropes say yes.) Built: the scout is seen/heard from the checkpoint. REC also: a
   second, louder tell (a horn blast when he first spots you)? Not built.
2. Music: Forest Whisper (acoustic, quiet) vs cynicmusic's "Dark Forest Theme" (CC0, guitar + strings, mp3 - brooding, not a clean loop) for the level; Call to War vs
   Tsorthan Grove's "Bamboo Blitz" (CC0, tribal drums, bright) for the hunt. Built the first of each. Please listen.
3. tools/reach-heroes.mjs in the reachcore-b81 trial has a syntax error (an apostrophe in a KNOWN reason string); fixed on my dev branch, one line.
