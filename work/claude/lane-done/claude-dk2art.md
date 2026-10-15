# claude/dk2art - THE DEATH KNIGHT 2 ART (Sonnet, 2026-10-15)
Branch claude/dk2art (off dk2b ea3b335a, merged origin/claude/dk2b d8d0a89c: THE REAPING / OSSUARY MAIL names used - no art/label/yard text carries the old SOUL REAP / BONE ARMOR). PORT 8936. Art only: no boss/kit number changed.

## BUILT
HERO (src/chars.js reaperRhythmPoses, all with headroom + crimson smear that never goes under the floor; tools/dk2art-sheet.mjs = contact sheet)
- REAPER'S RHYTHM: three different 5-beat cuts - rising low diagonal (blade swept back at the heel, whipped up, held high), THE HOOK (flat behind, laid along the shins, point curls back, hauled in), THE DRAG (blade overhead behind the head, over, brought down heavy with blood climbing the steel, dragged on the floor). Crimson smear + a drawn blood-trail ribbon following the blade tip (main.js dkTrail).
- GRAVE KNEEL x3: knee down, blade planted point-down, both fists on the pommel, red gleam breathing at the point; third beat = a low blow turned (braced, red flung up), driven by P.dkKneelHit.
- BLOOD PRICE held x4 (longer, redder blade, red helm lights, stance dropping; last = white-hot) + a halo/motes at the drawn tip, bigger per price (drawPriceBlade).
- CRESCENT CLEAVE: haul / level full stretch / follow-through poses + a DRAWN crescent (outer rim, wet body, dark inner edge) as wide as what he paid (dkArcs), landed drain/back-double now also draws a red thread (surgeLinks).
- Lingering dead: breathing red pool, widening ring, rising blood motes (fades with the body).
BOSS (1.4x, src/unburied-foes.js): BK_POSES rebuilt (price x4, crescent x3, hook tell+point, his own DRAIN pose 'drainPull' x2, the drag's four, hurt last); price glow on the blade tip + the crescent's whole sweep told in dashes + reach line; the crescent drawn in flight; THE DRAIN = curved thread foe->hand->chest with drops and a hand glow; the TWO CHAPEL STANDARDS = the Order's own banner (drawStandard, big) with feed threads into the ward, a fall (tilt + dust, lies torn), and a rise (tilt up + red flare ring) when the surge raises them; OPEN read is now a gold ring + gold clock (B10; was the shared green ring); THE HOOK pull has dust + sparks. Sounds mapped: price tick/drain tick = bloodDraw, crescent = heavy+dkWard, standard falls = crack+stone, rise = wightMoan, kneel block = lowGuard+clank (hero, already).
YARD (Daniel Q6): his trial now drills REAPER'S RHYTHM, BLOOD PRICE (heavyblow step reworded) and a new GRAVE KNEEL step (a cutthroat's low slash turned on the planted blade; trialEvent 'kneel'); practice line: 'rhythm, blood price, grave kneel, ward, blood surge, dash attack, rise and sweep'.
Tools added: tools/dk2art-sheet.mjs, tools/dk2art-shots.mjs (not in the suite).

## CHECKS (one page at a time, PORT 8936) - all green
ability-poses (76/76), skill-icons, hero-trials, boss-openings, boss-read, corpses, dk2, unburied-fights, unburied, attack-animation, crouch-b, textfit practice,hints,boss,pick --strict (1848 screens, 0 issues), mobile-perf. No hash moved; nothing re-stamped.

## SELF-GRADE: B
Strong: distinct cut poses, boss told reads, standards, gold OPEN. Held back from B+: hero-side FX (trail ribbon, drawn crescent, price halo, corpse glow) verified by the dk2/ability checks and code but not eyeballed in a live hero fight (headless camera/intro card got in the way); the kneel yard step is not played by hero-trials (only warden/geomancer are); the crescent's pink body is a little heavy.

## QUESTIONS FOR DANIEL
1. The Grave Kneel yard uses the cutthroat's low slash (waterthief) as the low-blow dummy. REC: keep; BUILT: that.
2. Gold OPEN ring+clock now replaces the green ring on the Death Knight only. REC: keep. BUILT: that.
