# claude/dances - A DANCE PER HERO

## What changed
- Every hero already had a `dance` frame set, used only on the co-op victory card, while the H key danced a generic mix of idle/crouch/jump poses. Now the H key, the after-boss dance and the long-idle dance all play the hero's OWN frames (`K.R.dance`, src/chars.js). Skins bake it automatically (the frames come out of each hero's own baker, so every skin wears it).
- New drawings to match the brief (src/chars.js): Knight SWORD SALUTE (6 poses: draw, blade upright before the face, glint, sweep out level, glint, bow), Death Knight BLADE-PLANT AND BOW (haul, plant with dust and the helm lights flaring, bow over it, straighten), Paladin MAUL RAISED TO THE LIGHT (across the chest, straight up on both arms, glow and rays pulsing, a strain, lowered), Geomancer STONES ROUND HER STAFF (staff planted, three stones - grey, sand, amber - orbiting, near half bigger). Kept from before: Freebooter hornpipe jig, Warden spear twirl, Pyromancer robe dance with sparks.
- Jingle per hero (src/audio.js `SFX.dance(hero)`), one short phrase each, replayed on each turn of a key-held dance.
- Triggers (src/main.js): EMOTE key H toggles (as before); `danceAfterBoss()` arms every upright player when a boss fight ends (not Boss Rush) and the dance starts as soon as their hands are still; a calm 30 s idle gives one automatic dance. Automatic dances run about 2.5 s (whole turns) and stop. Any step, jump, swing, block, dodge, hit or swim cancels; cue also lapses on a move key. Co-op: each player's own hero, frames, jingle; player two's pad gets the BACK button as its emote key (H stays player one's). The dance keeps going behind the win plate and is cleared on level load.
- Controls list row: `emote | H = DANCE, STOPS ON A MOVE | BACK`.
- Tools: `tools/dances.mjs` (new check, added to tools/check.mjs list), `tools/dance-sheet.mjs` (capture), capture sheet `work/dances/dances.png` (7 heroes, bracken and black skins). `BKT.heroSet/skinIds` exposed for the harness.

## Checks (named runs only)
Green: dances, skins, architecture, checkpoints, dangling-paths, npc-removal, textfit, audio-assets, comments, ability-poses (168 s, passed first time), boss-fight-end, slopes, slopes-trace, tells, attack-animation .
`dances` asserts: 7 heroes x 18 skins baked (R, L, white; >=4 distinct drawings; no two heroes alike); H starts, frames walk, step/jump/H cancel; long idle at ~30 s ends by itself; all 7 heroes dance after killing a real boss (starts ~15 frames after the kill) and the fight still ends and nobody dances during it; a dancing hero walks at once; co-op player two's key dances player two only. Proved to fail without the after-boss cue (knight: "no dance after the boss fell").

## UNVERIFIED
- Sound: jingles only checked to exist and be called, not listened to.
- The frames were judged from one 3x sheet; no animated capture. The Geomancer's stones are small.
- Pad BACK button not tried on a real pad.
- Levels where the win plate lands within ~2 s of the kill show the dance only briefly.

## QUESTIONS FOR DANIEL
1. Pyromancer "fire twirl": I kept her existing robe-and-sparks dance rather than redrawing. Recommend: keep, or a follow-up lane to give her a flame-ring twirl.
2. Freebooter jig and Warden flourish were kept as they were (already match the brief). OK?
3. Gamepad emote: BACK button. Recommend keep; touch screens have no emote button yet (recommend none).
4. Long idle is 30 s and the after-boss dance ~2.5 s. Recommend keep; shorter idle if you want it seen more.
5. Should minis (not bosses) also trigger the dance? Built: bosses only.
