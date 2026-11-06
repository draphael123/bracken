# WINDCALLER 5 (claude/windcaller5, off master 42a1d4cd) - code done, BROWSER OWED

## Changes
1. VISIBILITY (src/main.js drawToldGust, src/redraw/windcaller_fx.js): gust streaks now white bars 2-3px with a dark under-stroke (read on pale sky) + band dimmed + 16 debris bits (leaves/grit); TELL FLASH: gold flash at the gust's source edge on every beat of the build-up (clamped on-screen), white band flash at tell start; hurl wall and gale blades get dark edges/solid white faces; he gets a dark backing + violet rim against the sky.
2. REFLECT: audit - bolt was already turned by: sword parry (knight etc.), any 'blocked' result (knight guard, geomancer ward, berserker take, ranger guard/bash, warden), warden deflect, pirate hook catch, ranger snatch, paladin aegis, blood knight ward, pyro flame ward burn. NEW: GALE BLADES carry a parry body (mirror seed) so every one of those sees them as his bolt; a blade stopped by a block/guard flies home too ("TURNED BACK"). NEW: removed the "TOO FAR" gate - any turned projectile that reaches him knocks him down (up close = big fall, afar = small fall). Cooldown = his existing 3 s ward after each fall (not chainable); resist floor 0.4 unchanged; fall pay capped 10%/15%. Hurl wall / devil / downdraft are wind (brace/jump), not projectiles - left.
3. MOOR RETUNE: nothing else changed yet (the 11-02 21:40 line says week of 11-16; recorded, not started). HP 1000 unchanged pending rates.
4. GALE STAIR softlock: Daniel's 11-02 21:44 correction says the photo was THE ROOKERY. Fix b18129c28 (rookery updrafts in the gale-spires pockets) IS on master 42a1d4cd. The Gale Stair gap already has a told-gust updraft (tools/gale-stair.mjs "THE GAP UP"). Nothing to add.
- New tool tools/windcaller-reflect.mjs (per hero: bolt, blade, warded-no-chain).

## Rate table
NOT RUN. A first n=6 run was started and killed on the coordinator's RAM order (1 fight seen: knight L13 win, 111.7 s). Expect the win rate to rise slightly (far reflects open him) - re-tune HP 1000 if > 70%.

## Browser owed (one at a time, >=1500 MB free)
- PORT=<p> node tools/windcaller-reflect.mjs   (all heroes, ~2 min) - expect ok; failures list which hero's answer misses
- PORT=<p> node tools/boss-rates.mjs moor --ways=practiced --seeds=6 --heroes=knight,warden,pyro,ranger,geomancer,paladin --jobs=1
- node tools/windcaller-gusts.mjs and tools/gale-stair.mjs (regression), tools/moor-shots.mjs (bosszoom) for gust + halo screenshots
- Eyeball: gust streaks/tell flash, halo not too heavy (tune alpha in main.js near 'HIM READABLE AGAINST THE SKY')

## Questions (rec first)
1. Reflect from any range knocks him down (rec, built). Alt: keep TOO FAR for the floor.
2. Moor retune beyond this: wait for week of 11-16 (rec, per 21:40).
