# claude/bkpolish - Red Host / Red Rhythm renames + Blood Knight boss look + parry/hold art (sonnet, 10-21)

Base: origin/claude/bkfeel a221cdeb. Player-facing names only; every skill id, save key and code path is unchanged (summonSkeleton, graveTide, deathGrip, unholyGround ... stay).

## NAMES (old -> new)
| old | new |
|---|---|
| tree GRAVELORD (reaper branch 1 label, F hint, hero text) | THE RED HOST |
| REAPER'S RHYTHM (hero text, boss kit label, comments) | THE RED RHYTHM |
| SUMMON SKELETON | SUMMON THRALL (desc: "a blood thrall rises beside him") |
| GRAVE GOODS | BLOODED STEEL |
| GLEANER | QUICKENED BLOOD |
| THE PRESS, BIDDEN, COLD COMFORT, WINNOWED, DUE RITES | kept (still read; descs say thrall) |
| UNHOLY GROUND | RED GROUND |
| OSSUARY (skill) | SPENT BLOOD |
| GRAVECALL | THE RED CALL |
| SECOND DEATH | BURST VESSEL |
| THE GRAVE PROVIDES | THE BLOOD PROVIDES |
| GRAVE TIDE | CRIMSON TIDE |
| GRAVE CHAIN | BLOOD CHAIN |
Also renamed where the same move is shown: the Blood Knight boss tells/kit labels/hit names (BK_SAY, BK_KIT, DK_SAY), the number() popups, F-slot hint, hint-shown-silent entries, bot/pose/test comments, tools/unburied-fights messages. THE SKILL descs now say thrall(s) not skeleton(s). Level names THE OSSUARY / THE DROWNED OSSUARY are untouched (places, not the skill).

## ART
- BOSS: SPR.bloodknight now bakes through new `bakeReaperBoss` (chars.js): same body + every pose as the hero, plus bigger curved horns (bone-dark stem, blood-red tip). Darker: bkHeroSet multiplier 0.74 -> 0.6. Fixed a bug on the way: its "keep the lights lit" test looked for the OLD GREEN helm lights, so the crimson lights were being darkened with everything else; it now keeps red lights + horn tips lit. Checked side by side (work/tmp-bkpolish/cmp.png, not committed): reads apart from the hero on sight.
- HIS OWN PARRY (B16): F.parry for the reaper redrawn - blade swept UP across the body in both fists, a CRIMSON bind star + blood flung off the flat, then the hold with the blade levelled and blood running; was the knight-style guard under a gold star with GREEN helm lights (also fixed in his riposte frames).
- T4/T5 TREMBLE: exsWind 2 -> 4 frames, moonWind 3 -> 5 (body shakes a pixel, blood shivers on the blade); bkWindPose cycles T4/T5 at 13/s (T1-T3 stay 6/s).
- THE FLICK (tap C): new pose key `bkFlick` (2 beats: blade snapped up, left quivering) via kitPose in bkFlick(); table entry in hero-poses.js.

## CHECKS (PORT 8789, one Chrome at a time)
GREEN: syntax, comments, hint-shown, skill-icons, skill-menu, skill-passives, talents, progression, pose-frames, blood-kit, dk2, unburied-fights, hero-roster, boss-read, ability-poses (76/76 own bodies; REAPER rows list the old ids: fine). textfit --strict hints,boss,bestiary,plates,pick,tree,store,hud: all 0 (1410 screens on the second run; boss/plates on the first).
Not run: full suite, commitment/riposte/crouch (no timing touched), skills/hero named checks beyond those listed (no such files).

## REDS
None.

## QUESTIONS FOR DANIEL
1. Names chosen by me (rec built): CRIMSON TIDE, BLOOD CHAIN, RED GROUND, THE RED CALL, BLOODED STEEL, QUICKENED BLOOD, SPENT BLOOD, BURST VESSEL, THE BLOOD PROVIDES. Say if any should change - names are one-line edits.
2. Boss tells share the hero skill names now (e.g. the boss shows BLOOD CHAIN). OK, or keep the old words on the boss only?
3. The meter blade-frame art note (bkfeel) was not done (not cheap).
