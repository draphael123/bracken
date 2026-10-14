# claude/feelplatform - FEEL PASS B (Sonnet) - base master 2cf3294b (BATCH91)

## What changed
- GAME SPEED 50..200%: steps 50/60/70/85/100/125/150/175/200 (src/main.js GAME_SPEEDS, row cycles ascending, nearest step for an odd value, menuMsg per side of 100%, value shows "100%" not "FULL").
  Default 100% for a fresh profile. One-time migration `speedV3` (right after the 09-12 speedV2 one): every existing settings file takes 1.0 once and is flagged; after that the number is the player's.
  A migrated player who was NOT already at 100% gets a one-time toast on the first level ("GAME SPEED IS 100% NOW - TURN IT DOWN IN SETTINGS").
- Above 100% the world runs in SUB-STEPS: wdt per sub-step <= one 100% step (125..200% = 2 sub-steps, each <= STEP), so nothing tunnels. Presses are read once (first sub-step), a hitstop or a state change ends the rest of the frame, camera + weather run once (camera dt x speed so it keeps up). Hitstop, slow-mo and the level clock stay on dt exactly as before. <=100% is bit-for-bit the old path (1 sub-step).
- CAMERA LOOKAHEAD: eased lead of VW/6 in the run direction (+ a 24 px facing bias), builds in ~0.5 s and lets go the same way; a long fall adds up to 40 px of lead DOWN after 0.25 s. OFF (camera exactly as before) with Reduce motion, co-op, boss/mini fights, any camLock, any running chase, the spiral stair, the Deep Rails cart, wind/gale rides, flight, dead.
- LANDINGS BY HEIGHT (tiers by fall from the top of the arc, existing airTopY): hop = puff (3 dust, shallow squash, short landing frames); drop = unchanged heavy landing; BIG (>= 80 px, five tiles) = dust ring along the ground + double thump + shake 3.5 + longer crouch-recover (3 existing landing frames over 0.34 s) + held squash. No input lock (a press ends landT as before; verified).
- THE WORLD REACTS (new src/world-react.js, art only, all gated on Reduce motion except the creak sound): wood/rope tiles (PLANK, NET, ONEWAY when surface() is wood) dip 1 px under a landing with the hero drawn 1 px lower, + SFX.creak (the amb_creak clip already on disk, synth fallback); vines/ropes/banners/bunting/pennants/streamers/cloth/moss/kelp/reed/chime/garland/flag deco sway 1 px as you pass through (kind tested once, loop skips non-swayers); bushes join the grass that brushes aside; pebbles skitter off a ledge edge you run along and jump from hard landings (not on wood/water/iron, off on Particles LOW). Collision untouched (tile grid never changes; verified y identical with/without the dip).
- Tools: tools/cdp.mjs PINS the page's speed (settings seeded 0.6 + speedV2/V3 flags, only if the profile has no settings; opts.speed overrides, opts.speed===false = the game's own default+migration, env BRACKEN_SPEED overrides for a run). New tools/feel-speed.mjs, tools/feel-platform.mjs (registered in tools/check.mjs). tools/mobile-perf.mjs now measures at the live default 100% (MP_SPEED=2 for the double step).

## Checks (all PORT 8907, one page at a time)
- feel-speed ok (range, fresh default 1.0, migration 0.6->1.0 once, a v3 file keeps 0.7, 200% = 2.0x ground in the same frames with 2 sub-steps, 50% = 0.45x ...).
- feel-platform ok (lead 15.7/41.1/53.1 px at 10/40/150 frames = eased, ~1/6 of 320; 0 after a stop; 0 with Reduce motion; landing lengths hop 0.07 < drop 0.16 < big 0.20, crouch art 0.16/0.26/0.34, dust 3/15/34; jump press after a big landing takes; wood ledge dips, Reduce motion does not, same ground y).
- boss-fight-end: 62/62 end on the boss's death at the pinned 0.6 AND at BRACKEN_SPEED=2.
- level1-pilot: wood at 100% (walked 100%, 0 deaths), at 200% (100%, 3 deaths), at 50% (100%, 1 death); marsh/stockade/minecart(Deep Rails, cart) at 200%: all walked 100% of waypoints (deaths 7/2/3). chase.mjs ok, cart-pilot ok, stair-pilot ran (spiral).
- mash-bot wood boss: knight/warden/pyro all DEAD at 100% and at 200%; mash-gate (cache) ok.
- pixels (headless floats) ok: 47 levels, 3003 sprites. uiscreens ok. settings-tabs ok. mobile-perf ok at 100% (60 fps title/map/wood, welltown/redgorge 59) and wood/redgorge at 200% (56.8 / 57.5 fps, busy 11.4 / 14.9 ms, inside budget at 4x throttle).
- textfit (settings, menu, hints, --strict): speed row fits; ONE red - OFFSCREEN+COLLIDE on `coophelp page 2` (main.js:32103), which is IDENTICAL on untouched master 2cf3294b (checked in the main clone): not mine, not touched.

## Reds / not done
- The one pre-existing textfit coophelp red above.
- Not run: the full suite, the complete boss-rates sweep at 100% (see Q1), co-op camera visual check (lookahead is simply off there).
- tools/headless.mjs (floats) opens its own browser and is not pinned by cdp.mjs; it is passive (no physics) so speed cannot change its result.

## WHAT'S NEW line for integ (I did not touch docs/updates.json: the whatsnew check pins the newest entry and the combat lane will add one too)
- "Game speed is 50-200% now, and 100% is the new default" (+ "Smoother camera, landings and a world that moves as you pass" if a 4th/5th line is wanted)

## QUESTIONS FOR DANIEL
1. Boss/pilot/curve rates were all tuned with tools pinned at 0.6 (the old default). At the new default 100% every tell gives 40% less real reaction time, so bosses WILL feel harder than their 60-70% target (the 200% level1 pilot above already shows 3 deaths on wood). Rec (what I built): tools stay pinned at 0.6 so the suite is unchanged and comparable; a lane should run boss-rates at BRACKEN_SPEED=1 and either retune or let the Game speed row be the difficulty lever. Say if you would rather the default stay 0.6/85% for the numbers to hold.
2. Row order: ascending (right arrow = faster). The old row went 100% down to 50%. Say if you want it reversed.
3. Lookahead is always on (no settings row; Reduce motion turns it off). Rec built; a LOOK AHEAD row would add a line to the Gameplay tab.
4. updateCharge (heavy-charge timer) and a few input timers run on wall time, not world time (as they did at 60%): at 200% a heavy charge takes twice the world time per wall second. Not changed here; flag for the combat feel lane if it matters.

## UPDATE 10-14 (Daniel's answers, applied)
- Default speed stays 60% (SPEED_DEFAULT = 0.6): new profiles get the 0.6 step, old saves are NOT migrated, no toast. The speedV3 migration + toast stay behind `SPEED_MIGRATE = false` (flip SPEED_DEFAULT to 1 and SPEED_MIGRATE to true after a boss-rates re-measure at 100%). 50-200% range, 60% step, ascending row and sub-steps unchanged.
- NEW settings row LOOK AHEAD (Gameplay > World, after Look down), default ON (SET.lookAhead), Reduce motion still forces it off.
- feel-speed updated to the new rule (default 0.6, no migration, a chosen speed is kept); mobile-perf default measures 60% (MP_SPEED=1/2 for the sub-step).
- Re-run green at the default: feel-speed, feel-platform, settings-tabs (76 rows), uiscreens, mobile-perf (60 fps, inside budget), textfit settings/menu/hints strict (only the pre-existing coophelp red, identical on master).
- Q4 (wall-time charge/input timers at >100%) is for the combat feel lane.
