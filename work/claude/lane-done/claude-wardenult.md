# WARDENULT report (claude/wardenult, tip d650bdd6b, off 95bc267a4; worktree bracken-wardenult). Not merged, not deployed, not pushed.

## Changes (numbers)
1. ULT LOOK - she WIELDS it. New src/warden-reach.js = one pose table (both hands per frame + point position). chars.js bakes 8 new bare-set pose keys from it (reachHold 2, reachRun 6, reachJump 2, reachA/B/C 4 beats each = thrust / rising sweep / long drive, reachWind 1, reachThrow 2) with arm AND arm2 on the shaft. main.js: during wReachT the chosen key is mapped (reachPoseFor) onto these; the ghost spear (4 px shaft, white core, light running up the haft, collar, heel spike, leaf head, glow) is laid through the same hand points: shaft drawn BEFORE the body (hands close over it), head/glow/wake after; 3 green afterimages on every thrust beat; ring at the tip on the full beat. Point drawn at ~86-100 px (hit line 88). The old floating line only shows on frames not drawn wielded (hurt/roll/climb stay armed).
2. ULT POWER: per hit x1.0 -> 1.4 (skill-k K_WARDEN_REACH.perHit), final thrust x2.5 -> 4.0. Boss: each hit leans +4 on the break bar up to 70% of it (hits alone never break); final thrust adds a skill-weight fill (x0.6 outside an opening) on top of its heavy (about +32 of 100) and a 1.2 s stagger (was 0.6), once per ult (6 s gate), none while BROKEN. Resist floors / openings untouched, no pull. Small foes unchanged (1.2 s stagger, 320 knock).
3. THROWS IN THE ULT: hold C works (bail removed). Always PIN, wound in 0.20 s (vs 1.45), 3 pips fill across that; cost 12 stamina (vs 24), breath 0.35 s (vs 0.5); giant ghost spear (58 px shaft, leaf head), speed 640, range 270, band +-15 px taller; dmg swordDmg x 2.8 (2.0 x 1.4); boss: hit + 0.6 s flinch on the usual 3 s cd; spear returns as today. She stays armed in the ult (the thrown one is a conjured copy).
4. PIPS: 3 pips over the head from 0.10 s of hold; lit pips take the tier colour (pale green / green / gold), next pip fills as the hold nears it, tier word shown, ding (SFX.fbStep) + ring per tier. Text: hero card, WARDEN_KEYS.brace, loop line, HUD hint now say SPEAR THROW + three pips (the throw is called SPEAR THROW everywhere, so it is not confused with the skill).
5. TETHER SPEAR: catalog name JAVELIN -> TETHER SPEAR, id 'javelin' unchanged (old saves keep it, no migration needed), F, L9, wall foothold unchanged. F again: a pinned/carried non-boss foe is YANKED (knocked along the floor to 26 px in front of her, max 700 px/s, 0.7 s stagger, pin dropped, 'YANKED'); a boss/mini it hit is only staggered 0.5 s ('TETHERED', 4 s cd, within 300 px), never pulled.

## Verified (node only)
node --check all touched files; tools/warden-reach.mjs (NEW, 39 checks GREEN: power, pips, poses, both hands, key map, tether, catalog); tools/warden-id.mjs 35/36 (updated the ult assertion to 1.4/4.0); tools/progression.mjs OK (180 nodes, legacy saves, rollback). Headless bake of chars.js bakeWarden with a stubbed canvas: all 8 reach keys bake, bare + mirrored sets, no throw.
RED, not mine: warden-id 'DUEL_HERO: no warden row' - DUEL_HERO has real tuned warden rows (lance 1.65, closedhelm 2.8...) from other boss lanes; the assertion is stale policy, not trivial, left. Rec: delete that assertion or turn it into 'every row is documented'.
SLIP (reporting): I ran tools/progression-runtime.mjs, progression-economy.mjs and walk-controls.mjs without opening them first - they use tools/cdp.mjs and launched headless Chrome + serve.mjs. I killed only the PIDs that run spawned (walk-controls node 33472, its serve 26336 and chrome 7408, timeout 35060); the other lanes' processes were untouched. progression-runtime passed, progression-economy hit a websocket error (not investigated), walk-controls was killed. Daniel's browser was not touched.

## OWED (browser, later)
- Stills: ult hold / run / each of reachA, B, C beats (facing both ways), reachWind + reachThrow, afterimages, hand-on-shaft alignment (the shaft is anchored to the table's hand points; if a pixel off, tweak fx/fy/rx/ry in warden-reach.js only), spear tip vs hit line at 88 px.
- Pips over the head (3 states + ult), ding audible, text fit (tools/textfit.mjs - starts Chrome, not run).
- Tether yank: pin a foe on a ledge/wall, F again; boss TETHERED.
- n=6 boss check with the ult (Warden, bosses with ult-capable fights: e.g. Ram Lord, Closed Helm, Lance) to confirm the 60-70% band; expected effect small (ult needs a full band, ~+40% hit damage for 6 s plus a 4x finisher; ~13 hits + final). Also run the lab bot: it never casts ult (lab.js 3107 does cast it) - check it does not break.
- heroblocks-b.mjs / ability-poses.mjs not run (unknown if browser).

## Questions (recs built)
1. Tap C inside the ult still deflects (bare 'reachHold' pose). Rec: keep.
2. Ult throw stamina 12 / cd 0.35 s could spam: ~3 throws in 1 s. Rec: keep, watch in n=6; raise rec to 0.5 if bosses melt.
3. Rename of skill only changes the display name (id javelin, bot-profile, saves). Rec: keep.
