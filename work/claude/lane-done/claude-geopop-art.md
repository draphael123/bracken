# claude/geopop - GEOMANCER POPULARITY PASS, ART+SFX lane (11-03/05)
Branch claude/geopop (from BUILD tip 47433de5). Not merged, not deployed. Art/feel only: NO timing, damage or hitstop change (the detonate clip numbers were already built by BUILD: hitstop 0.06, shakeCam 5/6/8, zoomKick 1.04, 1.2 s crack).

## What changed (all behind GEO.pop.feel unless noted)
- SFX (src/audio.js, audio/manifest.json, audio/CREDITS.txt). NO new files, NO downloads. Two pools re-list files already on disk: `crack_rock` = crack2_3-5 (the rock breaks), `stone_geo` = stone2_0-5. Names start crack/stone so they stay in the combat mix category (not ad-block bait).
  - SFX.geoFist (new key, called by fistHit): bd_stone_1-4 + a synth 70 Hz sub-thump (always, it is the weight); synth noise/triangle only if the clip is not loaded.
  - SFX.geoPlant: crack_rock + r_thud (0.78 rate) + a soft 80 Hz sub. SFX.geoBlast: r_rumble + crack_rock + r_stones (golemShatter's clip) + a 62 Hz sub. SFX.geoCrumble: stone_geo (stone2) + low grit. Synth fallbacks all kept (the old REC placeholder rows for geoPlant/geoBlast were replaced by direct layers).
- Geode glow (geomancer.js draw0): additive pixel-disc halo r 5-7 on the staff tip: dim with 0 stones, +1/2/3 stones brighter, flash fading over 0.3 s on every landed blow (blowPulse), grows through the detonate tell.
- X-blow debris (main.js geoBlowFx, hooked where heroCut lands): 4-6 rock chips (gravity 300, board-stone palette) + 2 dust puffs + geode pulse on every landed blow; the stone fist keeps its own jabart chips (pulse only, no doubling). Fist camera kick: the fist already carries shakeCam(3, face*2) from jabart and the plant shakeCam(1, face), so I added nothing further (reads as the 1 px kick asked for; say if you want more).
- Detonate: 0.2 s tell = gHeave pose (BUILD) + staff slam at 60% of the tell (grit, ring, shake 1) + stones pulse amber/shudder with 3 widening cracks and rising motes + an amber seam along the floor from the staff to each stone + the geode flaring. Blast: shockwave ring (D.r) + second floor ring + the existing inner ring, 10 rock chips + 4 big chips flung radially per stone, a dust ring running out along the floor (api.dustRing), floor CRACK decal per stone redrawn (56 px jagged, 2 branches, amber seam glowing for the first 0.45 s, fades over the 1.2 s). The 'DETONATE' number, shake, zoomKick, hitstop are BUILD's. Replaced the BUILD placeholders.
- Knee stone sprite (drawKneeStone, piece.knee on fist plants; gated by feel): a squat boulder with rounded shoulders, board-stone palette, moss, a lit amber rune and a chip of amber geode on the crown (so it reads as hers). Rises over GEO.rise = 0.12 s (already the board's rise).
- Hero desc: 'SHE BUILDS SOMETHING IN ITS WAY: hold C' -> 'SHE BUILDS THE BATTLEFIELD: hold C' (the identity line goes in the description; HERO_LOOP stays BUILD's 2-line card). textfit store/pick/practice/arena: 0 findings of every kind.
- tools/geopop-gif.mjs: new args `<outdir> <name> yard|boss <feel 1|0>` (boss = the Wood Troll arena, god mode; feel 0 = the BUILD look for the BEFORE gif); SHEET=1,2,.. env writes a PNG contact sheet.

## Samples and licences (all already credited in audio/CREDITS.txt; CREDITS got one explanatory line)
- bd_stone_1-4: Kenney "Impact Sounds", CC0. crack2_3-5, stone2_0-5: rubberduck "75 CC0 breaking / falling / hit sfx", CC0. r_thud: Kenney "RPG Audio", CC0. r_rumble, r_stones: rubberduck "80 CC0 RPG SFX", CC0. 70/62/80 Hz subs are synth (no licence).

## Checks (all green)
geomancer.mjs (incl. the pop cases), geo-board.mjs, arena-yard.mjs (incl. the geo yard run), textfit (store,pick,practice,arena: all 0), audio-assets.mjs, audio-mix.mjs (197 pools, 0 problems), attack-animation.mjs, ability-poses.mjs (77/77; one transient 'page CRASHED' on the first run, green on the immediate rerun, no related change). NOT run: check.mjs, boss win rates. Sounds are not listened to here (headless): levels follow the existing REC volumes for the same clips; TUNE/Daniel should give the plant/blast a listen.

## GIFs (scratch\lane-reports\geopop\)
art-yard.gif (AFTER: 3 combos -> 3 stones -> DOWN+C) vs art-yard-before.gif (feel off = BUILD look; yard-run.gif is BUILD's own). art-boss.gif (AFTER: Wood Troll arena, 3 combos, DOWN+C; the boss walks into her, god mode) vs art-boss-before.gif.

## Notes for TUNE
- No numbers changed: win rates/avalanche casts are unaffected by this lane. GEO.pop.feel=false restores the BUILD look/sound (knee sprite + glow + debris + new SFX layers).
- Seen in the GIFs (BUILD behaviour, not changed): a second plant can land on top of the first stone's column (floorRow treats a stone as floor), so two stones stack. It reads fine, but if you dislike it, skip columns whose cell is a stone in fistPlant.
- Boss fights: a boss body on the plant columns blocks the plant (freeCell), so against a big boss standing close she may plant 0 - the GIF tool needed a retry for that reason.

## Questions (each built with the rec)
1. Stacked plants (above): keep. REC keep, they build a wall of knee stones in practice.
2. The fist's 1 px camera kick: already provided by jabart/BUILD. REC keep as is.
