# claude/trailer - TRAILER lane (sonnet), 10-24 - DRAFT

Tool: `tools/trailer.mjs` (committed on claude/trailer; tiny hook in src/main.js: `SET.hideHud`, a tool-only flag that skips the HUD block, no gameplay change). Videos live OUTSIDE git in `C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\trailer\`.

## Outputs (scratch/trailer/)
- bracken-trailer-draft.mp4 - 74.6 s, 1920x1080, 30 fps, 24 parts (22 clips + title + end card)
- bracken-trailer-vertical-draft.mp4 - 25.0 s, 1080x1920, 10 parts (216x360 follow-crop of the action, x5)
- bracken-demo-trailer-draft.mp4 - 38.6 s, 1920x1080, act I only (Lumber Trail, Hornet's Nest + Queen, Marsh, Fen Road, Stockade Chieftain, Burning Village as Pyro, Pyromancer duel, Pyro hero)
- shotlist.md - every clip: level / hero / seed / note + timecodes of each cut (re-record with `PORT=<p> node tools/trailer.mjs record --shots=<id>`)
- clips/<shot>/*.png (30 fps frames, 640x360 plate) + clips/<shot>.json; clips/<shot>-sheet.png contact sheets

## How it is made
Bot footage only: boss clips = src/lab.js bossLab, profile `human`, campaign-kit flasks, normal health (one life), hero at L24 (30 for the two hardest) with a 3-skill kit; walks = the playtest walker on the pacing route. Two passes over the same seeded run: pass 1 scores a rolling 6 s window (boss: damage dealt, hero alive; walk: travel, no teleport, no heal), pass 2 replays and keeps just that window. A clip never holds a teleport frame; a boss clip is kept only if the hero won (max 3-4 seeds). No overlay: audio unlocked by a key press (no PRESS A KEY banner), HUD hidden entirely (hideHud), timer/hit numbers/tips/foe bars/hints off. Upscale nearest-neighbour (walk frames x6 exact; 640-wide boss-arena frames cropped to a followed 320x180 window x6). Cards: the game's own title plaque (cropped off the title screen) and Press Start 2P text, 6x NN. Music: audio/boss4.ogg, cuts on its 139.5 bpm beat grid (6-12 beats a shot), fades only at section changes, loudnorm -14 LUFS.

## Shot list used (main cut)
open: Cistern Queen (pyro) | title | heroes: knight v King Gorm (Kingswood 2), warden v Hornet Queen (Hornet's Nest 2 honey hall), geomancer v Mother Cap (Sporewood 2), pyro v Wicker Queen, paladin v Scarecrow King, ranger v Owl Reeve, blood knight v Hourglass King, berserker v Great Drill, freebooter v Kraken | traversal: Ksar zip line, Deep Rails cart, Falling Tower climb, Buried City sand, Towpath, Fen Road 2 | bosses: Dune Worm, Blood Knight (the DK), Glass Colossus (ranger, L30) | world map pan | local co-op (knight + AI warden, Sporewood 2) | Goblin Queen finish | end card.

## Music
"Great Boss" by Spring Spring (Julie Damsgaard / Spring Enterprises), CC0, audio/boss4.ogg (credited on the end card; no credit needed under CC0).

## Weak / known
- Ksar zip line is a 120 px-wide scripted ride (hero put on the rope's high end: a real zip ride but short and not a long set piece).
- Towpath "lock" and Buried City sand windows are atmospheric but the hero is small; no lock-opening moment was found by the scorer.
- Great Drill clip shows the fight's own callout labels (ROOF JUMP / STRIKE IT / DYNAMITE); one boss clip shows the game's red STALLED tag; the world-map clip shows the map's own footer key hints (the map has no HUD flag).
- Boss clips are tuned-down bot fights at L24 (strong heroes), so some are quick; "Death Knight" is the Blood Knight (the DK boss shown with a paladin).
- Sound effects are not in the footage (headless, music only). Music is one 111 s loop-free track; main cut uses 75 s.
- Demo end card says "COMING EARLY NOVEMBER" and uses bracken-nine.vercel.app - placeholders for Daniel to correct once the demo URL exists.
- Heroes in the walk shots look small (native 320x180 view); a closer zoom would need a per-clip crop.

## QUESTIONS FOR DANIEL (rec first)
1. Keep the 139.5 bpm Great Boss track for the final, or pick a calmer opener + this for the montage? (rec: keep)
2. Final cut should wait for the act-1 slice + presentation layer (your 10-16 note): re-record with the same tool, ~1 h unattended. (rec: yes)
3. Demo end card wording / URL (rec: "PLAY THE FREE DEMO" + the itch.io link once it exists).
4. Want SFX in the trailer (needs a real-browser capture or a mixed-in sample set)? (rec: add 8-10 hit/ward samples from audio/sfx in the final)
