# claude/warcairn2art - WAR CAIRN 2 ART PASS 2 (Sonnet)
Branch claude/warcairn2art off claude/warcairn2 2fbb9887. Pushed. NOT merged, NOT deployed. **Level hash unchanged: warcairn 79d686debf12** (draw-only: no tile, entity or number; pilot/mash stamps stand).

## What changed (src/redraw/warcairn_art2.js new + hooks)
- **Slate + snow**: palette to cold blue-grey slate / snow tops; a new SOLID tile in warcairn_tiles.js (strata, seams, flecks, snow cap with lipped corners, wind-scoured streaks, no roots); granite one-way slabs recoloured slate with a snow cap. Bright morning and war-paint red kept.
- **War-paint banners** (16, antler poles, cloth snaps in the wind; red hand / crossed axes / antler sigil), **hide tents + fire pits with smoke** (Drum Gates yard, Clan Ring rim), **4 antler totems** (skull stack, crossed-axe post). All are art-only tables placed by column+feet row (no entity; checked on solid floor with headroom).
- **Hatchet kit**: rack (carved post, stump with 3 hatchets), hatchet (lying / flying with trail / held over the shoulder / throw smear), glints, hauled gorge bridge (slate treads, ropes, iron), haul rope, tie post + cut rope end, swing-down, **swung-down bridge now drawn** (the PLANK cells were set but the tile layer is not re-baked, so it was invisible in the greybox), hanging cairn stone + landed block + dust, hanging totem + shatter, harpy nests (twig bowl, bone, feathers, snow) + fall/debris.
- **Summit**: bigger cairn (nine slate courses, skull niche, driven hatchets, red hands, antler pole, red banner) + 2 drum braziers (iron bowl on antler legs, soft glow, flare red on beat/frenzy/his drum).
- **Chieftain**: iron-framed RAGE bar (bone tines, hotter fill, flame when full) on the plate and over him; frenzy = flame ring + soft glow (no pink block); COUNTER arc; STAGGERED with his hatchet in the shoulder; braided TUG thong.
- **Elite berserkers**: antler crown, red band, bone necklace, red pulse (yard + low line).
- Hero carry pose: hatchet over shoulder + throw smear (the hero sprite arm itself is unchanged).

## Checks (one browser at a time, port 6741, RAM >= 3 GB each)
Green: warcairn.mjs, warcairn-probe (all ok, no page error; real-key hatchet + boss), level-quality warcairn (clears), tells, comments, homepaths, floaters, dressing, readability, solid-islands, goblin-lint, reach-heroes (0 crossings), stuck static + runtime, footing-art warcairn, hint-shown, textfit mapcard --strict (53 screens, 0 findings: the War Cairn map board is untouched), mobile-perf.
mobile-perf (915x412@2.625, 4x CPU) warcairn@14:95 / 222:39 / 366:24 / 420:19: ART 57.2 / 56.0 / 54.9 / 56.9 fps, busy 12.6 / 14.2 / 15.0 / 12.5 ms; base (warcairn2, noisy PC) 55.4 / 34.5 / 53.2 / 51.8 fps, busy 6.9 / 12.8 / 16.5 / 5.8. Budget holds; start and summit cost ~+6 ms busy (banners/braziers/gradients) - cheap to trim if needed.
Not run: textfit other scopes (no text/sprite-sheet change), full suite (forbidden).

## Screenshots (scratch/lane-reports/)
warcairn2art-before-<tag>.png / -after-<tag>.png (start, gully, shoulder, gorge, gates, yard camp, face, totems, ring, summit, plus after-only hatchet/stone/totem/nest/chief/elite states). Contact sheets: warcairn2art-sheet-before-after.png, -sheet-hatchet-kit.png, -sheet-chief-summit.png. Tools: tools/warcairn2art-shots.mjs, warcairn2art-sheet.mjs.

## Notes for the tune lane
- **The "ELITE berserkers" are not elites in play**: the level flags foe('berserker',...,{elite:true}) but src/main.js ELITE has no 'berserker' row, so eliteMake ignores them (plain berserkers, no gate/hp scale). I painted the mark from the level flag. Decide: add an ELITE row, or accept them as plain.
- No numbers changed. The frenzy in the shots still shows the boss sprite's white hit flash (existing).
- Tile layer is not re-baked on cellSet (bridge); any future dynamic cell needs its own draw.

## QUESTIONS FOR DANIEL (rec first)
1. Make the two berserkers real elites (add an ELITE row, tune lane)? Rec: yes. Alt: leave plain, drop the mark.
2. Slate tile reads a little brick-busy up close. Rec: keep. Alt: fewer seams.
3. Hero arm pose for the hatchet (a sprite change). Rec: later, with the next hero-art pass.
