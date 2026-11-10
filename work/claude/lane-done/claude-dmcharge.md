# DMCHARGE - READY (code + node + one-page proof; stills owed). Branch claude/dmcharge off claude/dmfoes 555798665 + merge of claude/dmlint 0068ff73c (no conflicts). Flag DM.on=false: off = today's behaviour.

## Built
- ONE CHARGED GRAMMAR (src/dirmoves.js chargeOn/chargeDir/chargeReady*/chargeBox/chargeName/chargeMove/launchWeight/tripTime + main.js fireCharged/dmAim/dmWindFx/drawDmAim): HOLD UP+X = CHARGED LAUNCHER, HOLD DOWN+X = CHARGED SLAM/SWEEP. Ground/swim only. The tap still swings; direction read LIVE (aim glyph: arrow + ONE pip, no new bar), fired by the direction held AT RELEASE (a key let go within 0.07 s of X still counts). ONE step at HEAVY_START + 0.45 x scale (pirate .85, paladin/BK 1.2); let go before it = nothing + SFX.ui. Holding up/down FREEZES the tier ladder (no tier climb, no auto-loose) at the one step. Ranger excluded (her kneel draw = hold+down, DMHEROES-C).
- Blows tagged ['rise','heavy'] / ['sweep','heavy'] (meleeBlow0), cost heavyCost(), swingMul x2.0 launcher / x1.6 slam, goes through a raised guard, longer recovery (heavy), P.atk speed x0.72 like a heavy. The tags drive the DMFOES hooks already in: wing + rise/heavy = GROUNDED, high guard + sweep/heavy = GUARD BROKEN 1.4 s.
- Launcher: rise box +24 px tall; launches ANY common incl brute/beast (elite 0.6, boss/mini never), 1.6 s, past liftImm; a wing-family foe is grounded instead. Slam: +-40 px both sides, trips everything incl beast (0.7 s heavy bodies, 1.1 s others), through tripImm; feeds the trip->hit window.
- ROWS: KNIGHT HEAVEN CUT (he hops after it: vy -190) / SHIELD DRIVE (drives forward, vx 200); WARDEN POLE HOIST (tall narrow tip box) / HAMSTRING (one side, shaft at 58 px). Every other hero gets the generic launcher/sweep (named CHARGED LAUNCH / CHARGED SWEEP, their own specialCol fx) so DMHEROES-B/C/FREE/PAL only add flavour.
- Input guards: dmcore's (UP-key jump suppressed while X held, duck twists suspended, ladder grab ignored) kept; DOOR/LIFT UP-grabs now gated the same way: rookery harpy lift grab, zipline catch, airship stoke/vent station (doorways are on TALK, not UP - nothing to gate).
- FIXED a DMFOES bug: `famName` was block-scoped but read on the next line under DM.on (ReferenceError on the first DM.on blow in hurtEnemy0). Found by the live probe; hoisted.
- tools/dir-mix.mjs imports DM.FAMILY_ADD (DM.on only).

## dir-mix before / after (DM.on): 11 misses -> 7 (acts I-II still 0). --live (DM.on false) 13, unchanged (FAMILY_ADD is DM.on only).
Cleared: caravan, glasssea, sealedpyramid, underwell; narrowed: welltown (now PLUNGE only), buriedcity (UP+PLUNGE). Still missing (theme swaps, level lanes): towpath DOWN; canal UP+DOWN+PLUNGE; fair UP+DOWN; burial PLUNGE; unburied PLUNGE; welltown PLUNGE; buriedcity UP+PLUNGE.

## Tests
- node tools/dirmoves-charge.mjs 28 OK (new: off inert, direction, per-hero step, tags, boxes, rows, launch weight, source wiring); dirmoves 58 OK; dirmoves-foes 98 OK; blow-tags ok (meleeBlow line untouched: P.swingRiposte is cleared in fireCharged so the array never nests); answer-tags exit 0; node --check main/dirmoves/audit-input.
- tools/audit-input.mjs dmClash block now runs DM.on forced AND off, plus a charged probe (hold X 20 f, UP/DOWN, release): DM.on knight, warden, pyro, pirate, geomancer, berserker CLEAN (aim up/down, fired up->rise, down->sweep, no UP-key jump, no duck, Z jump still jumps); paladin + reaper fire the charged moves but their Z-jump-while-X-held is already false (identical with DM.on OFF, pre-existing, not this lane). DM.on OFF control: knight/geo/bz/warden/pyro/pirate UP-key jump true, duck true (pre-existing), no charged move ever.
- tools/dirmoves-charge-live.mjs (new, headless one page, 3.3 GB free): knight/warden/pyro, brute + UP = launched 1.6 s, hurt; DOWN on brute/shield/sprig all tripped/broken. Not run: the other 5 hero audits' charged rows beyond the above, tools/check.mjs (forbidden), PvP/co-op seat 2 live.

## Owed / notes
- Stills (aim glyph, HEAVEN CUT hop, slam ring) to a browser lane (DM.on via `(await import('/src/dirmoves.js')).DM.on = true`).
- Heavy tags poise-break commons: in the live probe every charged blow left the foe BROKEN ~2.4 s (the existing +30 heavy poise), which swallows the 0.7 s beast trip. Rec: accept (a charged heavy that opens the foe is the point; 33 st + 0.6 s wind); else suppress heavy poise for dmCharged in addPoise.
- Neutral hold auto-looses at full wind for pyro/warden/pirate/paladin: UP/DOWN must be held BEFORE that (about 0.5 s), same as the tier ladders - a late UP after the auto-loose is just a heavy. Rec: fine, the glyph teaches it (DMTEACH).
- A hound was not launched (probably KNOCK_SKIP); not checked. Wing-foe GROUNDED live not probed (needs a flier at height; node asserts the tag rule).
- Art v1: reuses rise/sweep crescents + the existing swing frames; a charge-pose art lane is owed before the flip.

## Questions (rec first)
1. Suppress the heavy poise-break on a charged blow so the 0.7 s beast trip is real? Rec no (see above).
2. Directional hold auto-loose cap (hold UP+X forever)? Rec: leave it waiting; release fires.
