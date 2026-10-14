# claude/cqueenrework - THE CISTERN QUEEN rework (level `underwell`)

Base: origin/master **a0e14160** (batch89). claude/flasklever was not merged, so it is not in this base. Port 8890.

## What changed (Daniel's three asks, 10-13)

**1. Fire and water are ONE LOOP (her central mechanic, B17 - the Underwell's own verbs LIGHT + POUR).**
- **HOT** (orange word, `SCORCHED: HOT` on her bar, flames, gold ring + clock, fire sound). Fire under her (a thrown torch on her floor oil, her burrow run up into it) or a hero's own fire on her. Her body takes blows WHOLE from any side, her heat scorches anyone close, her stinger tells come x1.3 slower. Lasts 6 s. Then she burns out (told), gets her 3 s ward, and her shell is **BLACKENED** for 10 s: no fire takes her (told `HER SHELL IS BLACKENED: NOT YET`).
- **The pyro's own fire** uses the same rule. It has to burn on her for 2.5 s before she catches (heat builds, and cools when it stops). Her HOT from it is 0.6 as long, and blackening and wetness block it. So the pyro lights her no more often than a torch would.
- **DOUSED** (blue word, `DOUSED` on her bar, drips + clock, splash sound). A pour on her from the floor, or the bucket while she is under the shaft. She is slowed (tells x1.25, walk/scuttle x0.7), and her burrow floods: she dives into wet sand and comes up SLIPPING (open). Wet oil will not catch, so no HOT while she drips (told). Her shell stays at the 0.4 floor.
- **STEAM = HOT then WATER**: a pour (or the bucket) on her while she is HOT cracks her shell. This is the SOAKED opening (x1.9, capped 14%, 3.2 s), and she is doused after it. Every water opening leaves her doused.
- Phase two no longer keeps her alight the whole phase (the old "hot shell turns blows, douse, flare" sub-loop is gone). The wall pour from her ledge and the mound pour (SLIP) stay.

**2. THE WELLHEAD, her perch (she no longer hangs on nothing).**
- A 10-tile stone beam across the sump under the shaft, at the ledges' height. It is ONEWAY tiles, so the Underwell dress gives it supports. A third rope runs from the floor up its west end.
- She leaps up ONTO it, upright, and stays about 5-6 s (spit, rubble slam, sweep or spit), then pounces off it in an arc. She is no longer drawn upside down under the vault.
- The bucket now comes down the shaft onto the beam and knocks her off (ON HER BACK). A pour from the beam beside her does the same.
- The lab bot climbs the rope, walks the beam and pours: seen in a fight probe ("onto the wellhead / along the wellhead to her / pour on her from the wellhead"). Otherwise it drops the bucket.

**3. Her stinger: always hittable, but no longer a free 24/7 weak spot.**
- Outside her openings the free stinger is ARMOURED: x0.4 (B15), with a clank and the word WHEN IT STICKS. The ring on it is steel, not gold.
- Stuck in the floor after a sting, or while she is HOT: x1.75. In a body opening: x1.9 under the opening cap.
- Every blow on it draws on a PURSE of **6% of her bar per phase**, clamped on what lands. Her take runs inside main.js `wardedDamage`, after every multiplier, and damage-caps now proves it.
- When the purse is spent, HER STINGER BREAKS (told): she reels for 1.6 s on the floor, and every stinger move is gone for the rest of the phase, swapped for claws, rubble and waves (the Great Drill gears pattern). The grab ends in a crush instead of a sting.
- At the next phase she MOULTS: the stinger is whole again and the purse is full (told).

**Shell (B15).** Her claws turn a frontal blow to x0.4 (GO ROUND, said through BR.turned). Her back, her flanks, her on a wall or on the beam take x0.55. Her ward is x0.4 (WARDED; it was a flat 0). She is off boss-read's GUARD 'front', because the angle's x0.5 on top of her own take put her under 0.4. Her chip is 1 because her own take is the floor. A blow on her free stinger outside an opening now counts as greed.

## Numbers
hp 1950 -> **2300**. Her blows dmgK 0.62 -> **2.9**: she hits hard (a lunge is about 60, the stinger slam about 87, at L36 / 268 hp).

## Checks (all on this branch, PORT 8890, one browser at a time)
- GREEN: tools/cistern-queen.mjs (147; 31 new checks for the loop, the perch and the stinger purse), underwell.mjs, boss-openings, boss-fight-end, untold-told, tells, boss-read, hint-shown, damage-caps (now 10 caps, adding the Queen's opening and her stinger purse), boss-greed.
- RED, not from this lane:
  - mark-integrity: `undeadmage|markTell` PHANTOM POSE (the Archmage).
  - textfit --strict: coophelp page 2 OFFSCREEN/COLLIDE, and COVERS on fallingtower and fair signs. None are Queen strings; her new lines fit.
- MISSING: the cast-poses tool does not exist on master, so it was not run.

## Rates (boss-rates underwell, practiced, L36, profile human)
- **WITH flasks (campaign kit), 10 seeds: knight 8/10, warden 4/10, pyro 8/10 = 67%** (in the 60-70 target; no hero at 0).
- **DRY (human+dry), 3 seeds: 0/3 0/3 0/3 = 0%**. She hits hard, and the flasks carry the fight (see questions).
- **The base a0e14160 measured the same way: 6/6 6/6 6/6 = 100%** (already out of band with the flask kit).
- **Mash bot: 0/6** (the level was re-stamped first, then the boss; docs/mash-bot.json). The mash hero dies with her at 73-94%.
- Tuning trail (10 seeds, flasks): x1.6/2700 83%, x2.0/2700 72%, x2.6/2400 73%, x2.9/2300 67%, x2.4/2700 77%.

## Changed tests (deliberate design changes, said where they changed)
- **underwell.mjs** queen ward: it took `take === 0`; it now takes `0 < take <= 0.4 x` (B15, never nothing).
- **boss-openings.mjs**: E at her on the open floor used to spend no sip. It now spends ONE sip and must leave her DOUSED, and it still must not open her.

## ART (for a sonnet art lane; every item below is a PLACEHOLDER pose or draw)
1. **HOT**: a proper burning-carapace pass (cracked glowing seams). Today this is the old scorch strokes + hands flames.
2. **DOUSED**: a dripping, darkened, wet shell. Today this is drips + one sheen line + `o.wet`.
3. **BLACKENED** shell (charT): no art yet. It needs a sooty char tint.
4. **STINGER BROKEN**: a stump frame. Today the tail is one segment short with a cracked cap.
5. **REEL** pose (B16): its own frame. Today she is tilted back with claws up and legs splayed.
6. **THE WELLHEAD**: a stone lintel with a pulley block and the bucket tipping its water onto it. Today it is tile-kit slabs + a placeholder pulley block. The **perch stance** on it (crouched, legs gripping the beam edge) needs its own frame too.
7. **Armoured stinger glint** (steel) against the **gold** one: check how they read at game scale.
8. Sounds: HOT uses fireWhoosh, DOUSED uses soak, the break uses snap. A distinct crack for the stinger breaking would help.

## QUESTIONS FOR DANIEL
1. **How hard should her blows land?** In band WITH flasks she hits hard and her DRY rate is near zero. Rec + built: hp 2300 / blows x2.9 (67% with flasks). Alternative: hp 2700 / x2.4 measured 77% with a worse hero spread.
2. **The pyro's own fire**: rec + built: it lights her like a torch, after 2.5 s of burn, for 0.6 of a HOT, and never while she is blackened or wet. Alternative: hero fire never lights her, and only her hall's oil does.
3. **Tail purse 6% of her bar per phase** (built). Is that small enough? At 10% the tail was about 30% of the whole fight's damage.
4. **Warden is the weakest hero here** (about 50% against knight 90%) because his fights run longest. Rec: leave it to claude/flasklever's parry/heavy bots and re-measure, rather than give her a warden-only rule.
