# claude-partnerthrow (CO-OP PARTNER THROW, 2026-10-12, sonnet)

Daniel 10-12 (after his online co-op test passed): "pick up players and they dangle and scream and throw them into enemies."
Spec: scratch/brief-throw.md part 2 (CO-OP: grab your partner). Part 3 (ENEMIES: grab staggered small foes) was NOT built - see below.

## What existed (checked first)
- NO dedicated THROW key: F is "skill one" (named THROW only in the touch glue); carried objects (P.carry, buckets/jugs/pots, THROW_KIND, src/throwables.js, src/carry-throw.js) throw on ATTACK; objects are picked up with the talk key.
- src/knock-into.js (heavy / riposte / finisher-on-break throws a small foe along the blow, hazards say INTO THE SPIKES ...) covers a lot of foe throwing; its helper KI.throwFoe is reused here, not duplicated.
- src/damage-pct.js is NOT on master 4099648d (no such file); the hazard rule that exists is damagePlayer's `pct` / SV.HAZARD.pct (spikes and deep water cost a share of health and put you back) - the thrown partner just runs that code.
- Nothing for grabbing a partner, nothing for a staggered-foe grab.

## What was built
- src/partner-throw.js (new, ~270 lines, one module; hooks in src/main.js each commented `(claude/partnerthrow)`):
  - GRAB: a new rebindable action (default I; pad R3, shared only with the empty fourth skill slot; the touch layer's second contextual button reads GRAB beside a partner who can be lifted and THROW while he is up). Costs 14 stamina. The same key THROWS A CARRIED OBJECT (bucket, jug, pot) - ATTACK still does too.
  - CARRY: the partner is lifted overhead and DANGLES (hurt/jump frames alternating + a swinging rotation) and SCREAMS (SFX.partnerScream: the hero's own hurt cry pitched up, over the recorded CC0 vo_scream clips already on disk; per-hero pitch from the voice kit table; synth only as the load-time fallback) every 1.05 s. The carrier walks at 54 px/s, cannot swing, roll, guard, use a skill/flask or climb; a blow on the carrier drops him (DROPPED).
  - WIGGLE: any of jump/attack/dodge/grab fills a bar (5 presses; drains 10%/s); WIGGLED FREE; a computer ally wriggles free by itself in 3 s. First time held: hint MASH ANY BUTTON TO WRIGGLE FREE.
  - HEAVE: GRAB again = a TOLD 0.34 s wind-up (HEAVE, amber ring closing, carrier planted, the hero's own windup frame + a lean), then the partner flies along the arc that was SHOWN (the told arc + landing ring drawn from the moment he is up; UP lobs). DOWN + GRAB sets him down gently. The told arc uses the hero's own gravity (light apex, heavy fall): in the checks the ring is within 1-3 px of where he lands, for mid and lob, four hero pairs.
  - FLIGHT = his own body on the hero's own physics with his hands taken (so spikes, deep water, pits, fire and every other room hazard hurt him by the room's own rules - FRIENDLY FIRE, nothing re-implemented: a pit puts him DOWN (20 s, revivable), spikes cost the hazard share and put him back).
  - HITS: a common foe is knocked down (KI.throwFoe, why 'partner': it flies, INTO THE SPIKES applies to it) and takes max(26, 70% of its bar); an elite takes 25% of its bar + a stagger and is never killed by it; a boss or mini takes a CHIPPED hero blow (tag 'partner' goes the hero-blow way: GB chip, B14 turned-and-named on a keyed boss, greed counts) - never thrown. Each foe once per throw. Credited to the thrower.
  - SPIKED FOES hurt him: the spike goblin, the urchin, a THORNED elite bite the thrown partner for 20 and bounce him off.
  - CAN'T GRAB: dodging, i-frames, grace, hurt, dead, DOWN (the revive stands as it was - tested), airborne/swimming/climbing/plunging, or just freed/landed (1.5 s). "TOO QUICK" is told once. Can't lift while winded, swinging, hurt, dodging, carrying a thing.
  - First time both players stand close (twice per save): a one-line hint (PRESS GRAB ...). Co-op guide page 2 has the new lines; controls card has a GRAB row.
  - ONLINE: the guest drives player two through the local slot, so all of it is the host's simulation. The guest's GRAB press travels with the other one-shot presses (src/online-guest.js / online.js); the host's 4 Hz state now carries the GRAB / THROW label so the guest's touch button appears; the scream plays on the host's master and rides the stream audio (checked by tapping the guest's stream).

## Checks
- NEW tools/partner-throw.mjs (pure + page): 70+ assertions: table, key defaults/no conflicts, rebinding, card row, scream clips on disk; grab/carry/stamina/touch label, dangle position, flail frames, scream cadence, carry pace, no swing/roll; told wind-up frames; told arc vs landing (4 pairs, mid + lob); set down; carrier hit drops; impact on a common foe / 200-hp foe / elite / two real bosses (chipped) / each foe once; friendly fire (spikes, pit, spiked foe + bounce); wiggle (5 presses, slow taps fail, ally); 14 can't-grab cases; the revive untouched; TOO QUICK once; a carried bucket thrown by GRAB; one hero alone; reset; the hint.
- EXTENDED tools/online-coop.mjs (section 10): the guest GRABS the host's hero and throws him, the guest's touch button is told GRAB/THROW, the scream is in the guest's stream audio (analyser on the stream), the host grabs the guest's hero who wriggles free with his own jump key, no stall, no page error.
- Regression results: see the end of this file.

## NOT built (and why)
- Part 3 of the brief (grab a STAGGERED small foe): knock-into (heavy / riposte / finisher-on-break throws) already makes a staggered small foe fly into hazards and the third-cut throw already bowls foes into foes. A hand-pip + grab on a stagger would be a second system for the same verb; left out unless Daniel wants it (QUESTION 6).
- Bespoke art: the heave uses the hero's own windup frame + a lean, the dangle uses the hurt/jump frames + rotation. B16 (own windup + release pose per ability) would want a per-hero carry/heave frame set in an art pass (QUESTION 5).

## QUESTIONS FOR DANIEL (recs as built)
1. KEY: GRAB = I on the keyboard, R3 on a pad, a touch button; rebindable. Rec: keep (V/Y are taken or common rebinds). 
2. COST: 14 stamina to lift, free to throw. Rec: keep. The wind-up (0.34 s) is the commitment.
3. IMPACT NUMBERS: common foe max(26, 70% of its bar) + knocked down; elite 25% + stagger; boss/mini raw 30 through the chip. Friendly fire from a spiked foe: 20. Hazards: the room's own rules. Rec: playtest and tell me which end feels off - all in PT.hit / PT.spikedDmg.
4. A thrown partner into a PIT puts him DOWN (the co-op rule, revivable) rather than a death. Rec: keep; it is a joke you pay for, not a run-ender.
5. ART: own carry/heave/dangle frames per hero (B16)? Rec: yes as a Sonnet art pass; today it reuses the hero's windup/hurt/jump frames.
6. PART 3 (grab a staggered small foe)? Rec: no, knock-into covers it.
7. Thrown-partner hits count as a hero blow on a boss (greed reprisal can start, a keyed boss turns it and names the key). Rec: keep - it is chipped like any blow outside an opening.
8. The computer ALLY never grabs you (it can be grabbed, and wriggles free in 3 s). Rec: keep.

## Regression results (PORT 8869, one page at a time)
GREEN: partner-throw, online-coop (incl. new section 10), throwables, knock-into, touch, uiscreens (controls list / rebind page with the 17th row), combat-damage, attack-buffer, death-cost, dances (co-op).
RED / NOT PROVEN: textfit - twice. First run: scope "boss" timed out at 480 s; second run (limit 1500 s): "Input.dispatchKeyEvent did not answer within 15000ms". Both while the PC was loaded by the BATCH88 suite / after the reboot - not a text overflow report, but the new words (co-op guide page-2 lines, the GRAB hint, controls-card row, rebind row) are UNCHECKED by textfit; rerun it on a quiet machine.
Not run: damage-pct (no such file on master 4099648d), the full `npm run check` (hint-shown, comments, audio-assets, homepaths, dangling-paths, blow-tags were not run).
online-coop section 10: the stream-AUDIO level could not be asserted (the host's wood is never silent: baseline peak 0.385); it asserts the guest stream has a live audio track and that the scream fires on the host (same master the stream taps).
