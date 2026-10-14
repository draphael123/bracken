# claude/rangerart - THE RANGER'S OWN RIG (sonnet art, 2026-10-14)
Branch claude/rangerart on claude/ranger 2ce67d88. Art only (src/chars.js, src/ranger.js draw code, src/main.js RG_ICONS); no number, timer or box changed. Tools: tools/rgart-poses.mjs (pose sheet, no sim), tools/rangerart-shots.mjs (in-game crops). Sheets: work/claude/shots/rangerart/.

## Drawn
- bakeRanger is now her own baker (no longer bakeGeomancer(rg=true); Geomancer code restored). Body: green hood with drooping peak, lit face + eye, RED FEATHER (3 swept variants), green-brown CLOAK drawn behind that streams further when she runs/jumps, laced leather jerkin, tan BRACERS + bare hands, belt/sheath, QUIVER with white/red fletchings over the shoulder in every pose, taller-than-her LONGBOW (red grip, horn nocks, nocked arrow), HUNTING KNIFE (steel, brass guard) replacing the brown-bar blade.
- Own carry (bow low and ahead, off hand free): idle x8, run x6, jump/fall, takeoff, apex, land x3, skid, climb, crouch, slide, hurt, slump, swim/tread, fidget (tries the string), dance (hunting horn + notes), dance2 (checks an arrow, sights, knife flick), dance3 (victory shot at the sun); drink frames come off her idle (SPEC unchanged, checked).
- Knife: atk/atkB/atkC, air, follow, heavy, dashAtk, rise/sweep/airUp (short blade).
- Bow: windup x3 (nock/half/full), rgLoose, rgShot, rgAirShot, rgRise (bow flat overhead), rgDown (bow under her + hop), NEW rgFlip x4 (coil + three quarter-turns head-back, bow tucked; main.js already plays it), roll x4 (forward, tucked).
- Defence: rgBash (draw-in, shove), parry x2 (star), ripo x3 (riposte arrow).
- Kit, each its own windup + release (B16): snare (peg+cord -> loop laid), mark (shade eyes -> point, red tick), hawk (bird on gauntlet -> flung), leap, volley (fan of 3), bear trap (lift -> lob), arrow rain, smoke arrow, second quiver, heartseeker (black arrow), wild hunt (horn, red wind).
- FX/props (src/ranger.js render): arrow (shaft/steel head/white-red fletching), pierce trail (glow + white core), stuck/lying glint kept, snare (peg, cord ring, sprung knot), bear trap (iron plate, open/shut teeth), hawk (wings flap, beak, eye), arrow rain (fletched shafts with trails), bash arc (3 px, gold star on the beat), MARK reticle (dark-rimmed red ring + tick, pulses in its last 2 s).
- Nine skill icons (RG_ICONS) redrawn with arrow/hood/iron colours (PIX_PAL gained e E h t u U l). Pick portrait + store card come from her new idle/draw frames.

## Grade (scorecard): B
Reads clearly at game scale as a hooded green ranger with a red feather and a tall bow; every pose on the list exists with its own windup/release. Not an A: arm lines are 2 px so knife swings look pole-thin, the rolled/flip frames show the 22 px bow as a wide bar, the horn and hawk props in the poses are tiny, and the cloak and hood are close greens. Smoke burst particles are unchanged.

## Checks (PORT 8914, one page at a time)
GREEN: tools/ranger.mjs (skinDiff 32 < 40), ability-poses (78/78, debt 0), skill-icons, weapon-skins, skins, dances, attack-animation, hero-keys-strip, hero-trials (all 9 yards), mobile-perf (inside budget), textfit scoped pick/tree/store --strict (0 findings). The `pixels` tool and corpses are not in this checkout / n/a.
RED (inherited, not from this lane, not weakened): tools/titlescene.mjs asserts the 7-hero pick order takes "3:berserker"; since claude/ranger put the Ranger at PICK[3] it takes "3:ranger". Needs the check updated by the owner of the pick order (a stated design change); I left it.

## QUESTIONS FOR DANIEL
1. Cloak and hood are both green: REC keep (brief says green-brown); alternative: brown cloak for stronger split. Built: green.
2. Flip/roll show the whole longbow: REC keep. Alternative: bow slung shorter (not possible without redrawing the bow shorter in those frames).
