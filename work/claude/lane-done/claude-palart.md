# claude/palart - PALADIN 2 ART (sonnet, art + draw code only)

Branch claude/palart on claude/paladin2 92cb1d6d. No hp, damage, timing, cost or hit-box changed (the throw's box still flies where it did; the catch is drawn only).
Contact sheets (before / after, trial_paladin yard, 3x crops): work/claude/shots/palart/{before,after}-{poses,circle,circlez,throw,smite,aegis,hud,yard}.png, after-extra-poses.png (5x frames + the 8 hammer turns).

## The 8 art needs
1. EMPOWER pose `sanctify` (src/chars.js paladinKitPoses, still 2 frames, beats unchanged): WINDUP up on his toes, helm tipped back, maul straight up two-handed, head lit white with a halo ring, a ray up and motes falling either side; RELEASE driven straight down in front of him, head bowed, a flash at the head, and a white-to-gold column of light going up off the ground on BOTH sides with a splash at each foot. Its own windup + release (B16).
2. CONSECRATE plant: `hallow` read fine as a plant, but its 0.4 s outlasted the 0.22 s root (he ran on one knee). A REPLANT/MOVE (a circle already stands) now plays `hallowQ` (the same two frames, beat 0.07, 0.25 s); the first plant keeps 0.4 s. main.js plantCircle; src/hero-poses.js POSE_BEATS.
3. HAMMER THROW: src/holy-fx.js - a spinning hammer of light (eight pre-baked 45-degree turns of a cream/white-core head on a pale haft, dark rim so it reads on a bright floor), a three-ghost trail, a glow and motes; for the last 0.22 s of its way back it is DRAWN flying in to his off hand, with a CATCH FLASH (ring + burst) there.
4. SMITE: windup - a white-gold bloom at the maul head growing with the wind (only when he stands in the circle with the Light to spend), motes rising, white at full wind; release - a column of light standing where the maul lands (white core, gold edge, floor flash + ring, motes); its waves (w.holy) are a flame-shaped SPIRE OF LIGHT, 14 px, white heart, with a floor flash and motes - clearly apart from the brown 8 px hammerfall mound.
5. THE CIRCLE (src/holy-ground.js draw): a ground sigil - dark line under a double rim (reads on a bright floor), a band of 12 runes (four 3x4 glyphs: arrow, fork, ladder, hook) turning slowly, a sun-and-cross in the middle with diagonal rays and a pulsing white heart; capped edge posts; EMPOWERED: 16 runes turning faster, a second breathing ring, posts to 17 px with cross caps plus two more behind, 12 rising motes; PLANT/MOVE: a 1 px ring runs out from the middle past the rim (empowered: two); GOING OUT: the rim blinks AND the runes go dark one after another, the sun last. Owner-agnostic: colours come from the exported HG_PAL[c.side] ('hero' and 'foe' - foe is the same gold today so LIT CHURCH 2 can retint floor/rim/rune/under without touching the draw); the draw only reads circle fields (x, y, r, life, emp, side, at).
6. PARTNER AEGIS: the circle's host hook api.tethers(c) (main.js) names each covered partner; a solid thread of light with a sag and a running bead goes from his shield hand to the partner, glints at both ends; HGR.ward(partner) on a cover draws a shield of light, a flash and a ring on the partner and flares the tether. (HIS AEGIS text and the old rings stay.)
7. HUD Light bar: three spend ticks from HG.smite.cost / HG.throw.cost / HG.empower.cost (20 / 25 / 35) - light on the dark track, dark through the gold once the Light has reached them, with notches in the plate outline.
8. Yard straw men (src/level.js): HOLY GROUND station gets two (11 and 14 tiles in: one circle between them holds both and the burn shows); HAMMER station's one at 16 became two at 8 and 12 (the first inside the throw's 7 tiles of the sign - out and back both strike it - the second a step on or with BLESSED HAMMER's reach).

New: src/holy-fx.js (hammer, SMITE glow/column, holy waves, catch flash; makeHolyFx). Tools: tools/palart-shots.mjs (sheets in game, ONLY=/LV=/SPOTW= env), tools/palart-poses.mjs (5x pose sheet), tools/palart-perf.mjs (phone spot with the circle up).

## Grade (polish scorecard)
B+. The circle, the pillar/spire SMITE and the tether read clearly at game scale and each new ability has its own windup + release (B16). Weak spots keeping it from A: the rune glyphs are small at 1-2x (they read as a sigil, not as letters); the hammer at 3x is mostly a gold bar when edge-on; the circle on a very bright daylight level (wood) washes in the game's own bloom (it is clear on the yard, dusk and night levels).

## Checks (PORT 8900, one browser at a time, --jobs 1)
- tools/paladin-kit.mjs: ok. tools/ability-poses.mjs: 67 of 67 actives have a body, debt 0 (hallowQ + sanctify counted). tools/skill-icons.mjs: ok.
- textfit hud: 30 screens, 0 findings (all categories 0). online-coop: OK. uiscreens: ok (all rows).
- Mobile spot (tools/palart-perf.mjs, 915x412@2.625, 4x CPU, wood): nothing up 15.56 ms/frame, circle 16.48 (+0.92), empowered 16.21 (+0.65), throw + smite fx 17.52. Passes the 1.5 ms guard.
- `pixels` tool: not present in this checkout - not run.

## Reds / not run
- textfit `talk` scope (run beside hud by mistake): 4 of 8 hero scopes hit the 480 s per-scope limit on this busy PC (no finding printed); nothing I changed touches a sign's text (only dummy ents moved), so I did not rerun it. Run textfit-full in the suite.
- The full suite, boss rates and mash stamps not run (art-only lane).
- Level hashes: src/level.js trial yard ents changed (the paladin trial level only): any level-hash/route stamp for `trial_paladin` will need a re-stamp if the suite keeps one.

## QUESTIONS FOR DANIEL (rec first)
1. The foe circle ('foe' side) is the same gold as his, so a player reads the church boss's circle as the same thing. REC: keep, and let LIT CHURCH 2 add only a thin crimson under-line via HG_PAL.foe.under. BUILT: identical.
2. The replant pose is 0.25 s vs the first plant's 0.4 s. REC: keep (it matches the 0.22 s root). BUILT: so.
3. Rune glyphs could go 4x5 for the near half if the circle is meant to read from across a screen. REC: leave until a playtest says so. BUILT: 3x4.
