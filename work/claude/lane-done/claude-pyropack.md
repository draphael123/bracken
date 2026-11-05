# PYROPACK lane report (11-05, code only, unattended) - claude/pyropack = claude/kfork ebffef0df + the Pyromancer kit. Not merged, not deployed. NO browser opened.
Pattern: kfork / rangerpack. Files: src/tech-pyro.js (data + card text), src/pyro-tech.js (numbers + pure rules), src/main.js (effects beside her own pyro code; import alias is PYT because PTK is taken by partnerthrow), src/progression.js (1 import + 2 rows), tools/pyro-tech.mjs (new), tools/tech-cards.mjs (pyro kit check; two old asserts used pyro as the no-kit hero, now paladin), tools/leveling.mjs (same: pyro -> paladin on the no-kit lines).
Identity used: HEAT AND THE LIVING BOMB (heat bar, pips whose 3rd bursts a foe, ward parry, held fireball, STOKE). Both capstones are UP+C at a FULL heat bar (her ultimate input) and reshape (A) or replace (B) METEOR FALL; the bar empties either way. Nothing touches the Little Sun (hold C ~10 s). No heal, no pin, no boss immunity.

## Kit
| L | technique | input | k | what |
|---|---|---|---|---|
| 25 | KINDLING | a living bomb bursts | none | each burst pays +5 heat (raw add; bursts never refilled the bar before) |
| 30 A | WARD NOVA (defence) | tap C on the beat | x0.8 | a ward parry blows a ring (70 px): small foes take x0.8 x heat + a pip; boss/mini a pip only |
| 30 B | TRAILING EMBER (offence) | hold C, release at step 3-5 | ball table (0.9) | a free step-1 ember 0.25 s behind the charged ball; counts toward the 2-in-the-air cap |
| 35 | WHITE HEAT | full bar | none | a full bar holds +3 s (5 -> 8, BLAZE 10 -> 13) |
| 40 A | CONCUSSIVE BURST (control) | a burst | none | small/elite foe staggered 0.5 s (never in a ward/break; boss/mini none) |
| 40 B | PHOENIX STEP (mobility) | the dodge | none | dodge x1.25 further; small foes within ~14 px of the body get a pip + 1.5 s burn; bosses/minis not marked |
| 45 | SLOW FUSE | pips | none | pips last 10 s (was 6); burst reach +16 px |
| 50 A | STAR FALL (capstone, one) | UP+C full bar | meteor k 3.0 x1.5 = 4.5 | tell 0.9 -> 1.2 s, ring R 56 -> 88, boss cap 4 -> 5%, mini 10 -> 12% |
| 50 B | METEOR SHOWER (capstone, many) | UP+C full bar | x1.0 each | 5 small meteors (R 34) 60-300 px ahead 0.3 s apart, each snaps to a foe within 40 px of its spot, 0.7 s ring tell each, 2 pips each; boss 1.4% / mini 3.5% cap per meteor |
Upgrades (8, ranked I/II, all wired): DEEP STOKE (+15/30% fill), WARD HEAT (+3/+6 heat per parry), EASY CHARGE (fireball stamina -10/-20%), LONG BURN (+20/40%), QUICK HEAT (+10/20% heat from hits), HOT FIRE (fire +5/10%, in heatMul), WIDE BURST (+8/+16 px), BANKED COALS (bar falls 15/30% slower).
Bot: no lab change. The lab bot already presses UP+C at a full heat bar; the pick changes what that does (the shower aims by facing + snaps to foes ahead). The lab does not pick techniques.

## Node results (one at a time; none opens a browser)
node --check main / progression / lab / tech-pyro / pyro-tech OK. tools/pyro-tech.mjs PASS (new), tech-cards PASS (with the pyro kit check), leveling PASS, progression PASS (180), coop-progress PASS, keys ok.
Not run: tools/pyro-kit.mjs, ember-flare, hero-trials, textfit, hint-shown, boss-rates (all browser).

## Browser owed
tools/pyro-kit.mjs (existing asserts on the meteor/parry paths I edited: castMeteorFall now sets m.R/m.mul/cap fields, the ward `parried` hook, castFireball spend, hurtFire burn), textfit (new names/what/teach/trade lines; HUD prompt now reads 'METEOR SHOWER: UP + C' / 'STAR FALL: UP + C' - check it fits), hint-shown, hero-trials 'meter'. Real-key look: KINDLING heat tick, WARD NOVA ring on a real parry, TRAILING EMBER spacing/position, WHITE HEAT bar hold, CONCUSSIVE stagger on a pack chain, PHOENIX STEP distance (does 375 px/s dodge clip walls/gaps?) and the wake, SLOW FUSE pips 10 s, STAR FALL ring size/readability, METEOR SHOWER placement on uneven ground (y is the hero's floor y, as the base meteor's no-foe fallback; foe-snapped spots use the hero's y too, so foes on other heights within 90 px are caught by the 34 px box only if close vertically). Co-op: tech ids are not in the partner hero snapshot.
Art owed: STAR FALL reuses the meteor body/ring scaled (ring R only; sprite not scaled); SHOWER reuses meteor ring + body (placeholders, smaller fall); no new SFX; no capstone preview clip; controls.js row still says 'METEOR FALL' (static; the HUD prompt and ult word follow the pick); no yard TRY station.

## Boss-rate impact (no win-rate run; for the tune lanes)
- Pyro sits 80-85% on bosses (Daniel 11-04 18:36): nothing here is meant to push it up much. 25-45: KINDLING = a little more heat (more meteors, +5 per burst, a boss burst every ~3 hits); WARD NOVA is a pack tool (boss: a pip only); TRAILING EMBER = +0.9 sword on a step-3..5 ball (+13..25% on that throw, the biggest direct damage pick at L30); WHITE HEAT +3 s on a full bar = easier to land a cast; CONCUSSIVE/PHOENIX STEP = crowd control/mobility, no boss damage; SLOW FUSE = pips survive a boss's pauses (more bursts on him, still capped 3%/4.5% each). Upgrades stack to about +10% fire, +20% heat gain, -20% charge cost.
- Capstones: STAR FALL: boss cap 4 -> 5% (+25%) and a wider ring (easier to land on a boss) but a longer tell (1.2 s; he can leave). METEOR SHOWER: a lone ~40 px boss catches ~2 of 5 meteors = 2.8% of his HP vs the star's 5% and the old meteor's 4% (test asserts shower < star on a lone boss); packs take 5 x 1.0 sword + 10 pips each spot, i.e. a chain of bursts. Net: no capstone makes her boss fights materially easier; MASTER bosses (25-40% with flasks) should not move more than a point or two from these. Unmeasured: no boss-rates run.

## Questions (rec first, none block)
1. TRAILING EMBER is the strongest L30 offence pick; rec keep (free, small, cap-respecting); alt drop to k 0.6 by using a custom ember.
2. KINDLING +5 heat per burst: a 6-foe chain refills 30 heat. Rec keep (small foes only matter in packs); alt boss bursts pay nothing.
3. STAR FALL boss cap 5% vs the old 4%: rec keep (it is the 'one big foe' capstone); alt keep 4% and take only the width.
4. PHOENIX STEP x1.25 on top of the pyro's already fast 300 px/s dodge: rec keep, browser check owed for wall/gap clipping; alt x1.15.
5. A 30-40 s clock on the capstones like geopack/bkpack: rec none (a full heat bar is the gate and it falls away in 5-8 s).
6. Merge note: tools/tech-cards.mjs / leveling.mjs on rangerpack and wardenpack may also edit their 'pyro is the no-kit hero' lines; the merge lane must switch whichever remain to a hero with no kit (paladin here).
