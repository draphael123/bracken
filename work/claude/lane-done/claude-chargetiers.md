# claude/chargetiers - CHARGE TIERS: RANGER, then BERSERKER + GEOMANCER (opus, 10-22)

Base master 5e44cddd (BATCH112). Brief: scratch/brief-chargetiers-1021.md (Daniel 10-21, approved). PORT 8789, one headless Chrome at a time.
Commits: **342dca1c** (Ranger) + **8fa9681d** (ranger report, boss-run tier column) - the Ranger ships on its own from these two.
**0ffa803f** + the final commit (Berserker + Geomancer, bot-hand fixes) follow on the same branch.

## THE SHARED PIECE: ONE TIER METER (bkfeel's, made general)
The Blood Knight's five-segment meter is now `drawTierMeter` in main.js (drawBkMeter calls it with his numbers - his look is unchanged, blood-kit green). Every tiered hero gets: n segments over the head, each filling over its own stretch of the hold, lit in the tier's colour with a white top edge, a white pop on the newest, the tier's NAME over it, and an optional blinking underline (BK: BLOOD-FED; ranger: FOCUSED; berserker: RAGE winds them quicker; geomancer: EMPOWERED). Each tier also arrives with its own note (SFX.rgTier / bzTier / geoTier), a ring at the weapon, a body ring from T2, a breath of the hero's colour (P.rpTintT), and a small shake on T3. Held at T3 for a little longer, the blow goes by itself.

## RANGER - THE THREE-TIER DRAW (built, green, pushed: 342dca1c)
A TAP is still the QUICK SHOT. Held (bow stance, arrows in the quiver), the draw climbs:

| tier | arrives (held s, base) | the move | numbers |
|---|---|---|---|
| (partial) | 0.14-0.69 | a short draw, as before | 0.9-1.7x |
| T1 **LONG SHOT** | 0.69 (= her full draw, unchanged) | the strong ARCING shot she always had: sweet-spot focus, TWIN NOCK, BODKIN | 1.7x, wind 9 |
| T2 **PIERCING SHOT** | 1.20 | FLAT and fast through a whole line (was the focus spend; now the hold reaches it) | 2.0x (was 1.9), range 240, wind 11 |
| T3 **PINNING SHOT** | 1.75 | a heavy bodkin, flat: a common foe is **PINNED** 2 s (the Warden's pinFoe, written once); a wall right behind it: **NAILED** x1.5; an elite 1 s. A **boss or mini is never held** (B3/B13): 30% of his break bar + a 0.35 s check ("CHECKED") | 2.4x, range 250, wind 13 |

- Auto-loose 2 s after T3 (3.75 s, about the old 3.69 s full-draw hold). The ladder scales with STEADY DRAW (x0.8), the KNEELING DRAW (x0.7: T3 at 1.27 s) and the technique rank.
- **HUNTER'S FOCUS**: "full draw + full focus = piercing shot" moved up the ladder - a T2/T3 loosed on a full focus spends it and is **FOCUSED** (x1.3; the pierce flies a quarter further, the pin holds half again). T1 never spends it. UP+C MARK unchanged.
- **Why PINNING, not the 3-arrow fan**: the fan is her VOLLEY (her level-1 skill: three arrows in a fan) - a T3 fan would make the skill pointless and is a spread, not a new verb. The pin is a verb she has nowhere else at range (the snare is set at her feet, the bear trap thrown), it fits "she covers some of the room, not all of it", it plays off walls (NAILED), and on a boss it is a break-bar tool, never a lock.
- Words: PIERCING SHOT / PINNING SHOT on release (FOCUSED: ...), PINNED / NAILED / CHECKED on the catch. Sounds: string creak + a note climbing D-A-D'; T2 whip-crack, T3 deep thrum; rgPin on the catch.
- Poses (greybox): `rgDraw2`, `rgDraw3` (held, 2-beat tremble), `rgKneelDraw2/3`, `rgLoose2` (flat snap), `rgLoose3` (heavy follow-through).
- **Hands** (src/lab.js): level foes - elite/plate/shell/beast -> PIN, two in a line -> PIERCE, else LONG SHOT (the hands used to hold every draw ~3.7 s until it went by itself); bosses - PIN while he is not broken, PIERCE once he is.
- Text: hero desc, pick card (HOLD X: LONG SHOT, PIERCE, PIN), shot/focus teaching lines, TWIN NOCK ("a LONG SHOT ... two arrows for one").

## BERSERKER - THE RAGE WIND-UP (built, green except a red that is on master)
| tier | arrives (base; L12 0.45/0.88/1.35) | the move |
|---|---|---|
| T1 **OVERHEAD CHOP** | 0.50 (= his old full wind) | the double chop he always had |
| T2 **SPINNING CLEAVE** | ~1.0 | one full turn with both axes out, carried a step and a half in: it cuts **behind him** as well as ahead, longer live window - x1.2, poise x1.15, +6 wind |
| T3 **GROUND-SPLITTER** | ~1.55 | both axes buried in the floor: the ground splits **both ways** (a shockwave with its own blow, 0.45x, that **knocks the small ones down**) - x1.35, poise x1.5 (his heaviest lean on a bar), +12 wind |
- **RAGE winds it quicker**: half a bar x0.8, a frenzy x0.65 (red underline on the meter). Auto 0.8 s after T3. Let go before T1 (past 55% of the wind) is still T1.
- Sound: a growl rising E-G-B over a knock of the hafts, a war-drum on T3; the cleave's two whooshes; the splitter's crack and boom. Poses: `bzWind2` (coiled low, axes swept back), `bzWind3` (up on his toes, axes high), `bzTier2` (4-frame turn), `bzTier3` (axes buried, 3 frames).
- **Hands**: level - foes on both sides -> CLEAVE; elite/plate/shell/beast or 3+ near and RAGING -> SPLITTER; else CHOP. Boss - broken -> CHOP; raging -> SPLITTER; else CLEAVE.
- Text: hero desc (the double chop line -> the rage wind-up's three).
- Note on the **SPIN** overlap: his bought THE SPIN (two turns in place, steering) and GREAT CLEAVE exist; T2 is one travelling turn that reaches behind him - distinct, but the names sit close (question 6).

## GEOMANCER - THE THREE-TIER STAVE (built, green)
| tier | arrives (base) | the move |
|---|---|---|
| (under T1) | 0.14-0.30 | the short crack at her feet, as always (hits what touches her at once) |
| T1 **STONE SHARD** | 0.30 | a wedge of her stone flung FLAT at chest height (330 px/s, 0.95x, a light check) - it reaches what the crack cannot: a flyer, a shooter on a ledge, a foe past 160 px. **Half the wind** of a heavy |
| T2 **FAULT LINE** | 0.64 (= her old full wind) | hers already: the full crack and the spike at its tip |
| T3 **RISING PILLAR** | ~1.2 | the full crack, and where it first finds a foe (in front of a boss/mini - never lifted) or at its tip, a **3-cell pillar** of her stone rises: it strikes 1.6x, LAUNCHES what it lifts, heaves what stands beside it, and **STANDS AS A STEP** (one of her stones: the cap and the 4 s crumble as any) |
- **The stamina wall (time traded for power)**: T3 costs no more wind than the fault line and the stone gives **14 wind back** as it rises; T1 costs half. The hands wind the pillar when her wind is under half.
- The floor preview (C1) now tells the tier: T1 a dotted line of the shard's flight, T2 the full crack + spike point, T3 the crack + the pillar's outline. Meter: grey / amber / ember; amber underline while EMPOWERED. Sound: a struck-slab note going DOWN a tier (A, E, low A), a deep heave on T3.
- Poses: `gWind3` (stave crossways over her head, geode blazing, 2 beats), `gShard` (stave whipped level, 2), `gPillar` (butt driven down, then both hands heaved up, 2). T1/T2 hold keep her wind-up beats.
- **Hands**: level - flyer -> SHARD; elite/plate/shell/beast -> PILLAR; inside the short crack -> short crack; past 160 px -> SHARD; else FAULT LINE. Boss - FAULT LINE; the PILLAR when her wind is under half and he is not broken. The Old Tusker's own geomancer hands let go on a CRACK (never in the shard's band, and at T2 where the full wind used to let itself go - that branch keeps X held between frames, which had her winding a pillar every heavy: 28-52 a fight).
- Text: hero desc, pick card (HOLD X: SHARD, FAULT, PILLAR), her yard's FAULT LINE station line.

## CHECKS (PORT 8789)
GREEN: **ranger** (new TIERS block - the climb 1-2-3, rgDraw2/3 held, T1 keeps the focus, T2 pierce, T3 pin holds a common foe + rgLoose3, NAILED by a wall holds longer, a mini only CHECKED, wind 9/11/13, auto-loose a pin), **geomancer** (new TIERS block - the climb, gWind3, the shard hits past the crack for about half the wind, the pillar launches + stands + refunds, auto-loose a pillar; the "halfway crack" case moved under T1 (0.28 of the wind at 50 px) - deliberate, commented; STAFF_FRAMES + the 3 new keys), **berserker** (new TIERS block - the climb, bzWind2/3, T1/T2/T3 come down, the cleave cuts the foe behind, the splitter floors a foe out past the axes, T3 > T1 on a mini's bar, rage quickens, auto-loose; the double-chop poise case now lets go at 0.47 s where the old auto-fire went - commented), **blood-kit** (meter refactor), **hero-trials** (9 yards), **ability-poses** (77/77), **textfit store,pick,tree,hud,hints,trial --strict: 0** (1117 screens), syntax, comments.
RED (NOT MINE, on master): **berserker** `double chop ... most of a mini's poise bar` - 57.6 < 60 on the untouched base 5e44cddd too (same number with my code).
Not run: the full suite (nightly).

## BOSS RATES (boss-rates practiced, profile human, kit flasks, campaign level, 12 seeds; the heroes are not banded - k/w/p are; no boss number changed)
| row | L | ranger before -> after | berserker before -> after | geomancer before -> after |
|---|---|---|---|---|
| wood (Old Tusker) | 3 | 6 -> **9** | 4 -> **12** | 2 -> 2 |
| stockade | 3 | 8 -> 9 | 11 -> 11 | 7 -> 4 |
| canal | 28 | 0 -> 0 | - | - |
| burning | 4 | 11 -> 11 | 12 -> 10 | 10 -> 11 |
| marsh | 3 | 12/24 -> 10/24 | 5 -> **11** | 2 -> **8** |
- **Ranger**: no boss trivial; the wood rose to 75% (4-8 pins a fight). Marsh/canal draws are rare (she knifes the Frog King; her canal problem is not the draw).
- **Berserker**: wood 12/12 and marsh 11/12 are HIGH. It is **the hands, not the tiers' power**: with the boss tier forced to T1 (the old blow) the wood stayed 12/12. His old hands held X through a chain of self-firing double chops (17 heavies a fight); now they let go on a tier, run short of wind for the rotation more often (rot lowSt 44 of 56) and cut instead (40-54 cuts vs 14) - and take half the damage. Numbers were trimmed once anyway (cleave 1.25->1.2, splitter 1.5->1.35, poise 1.8->1.5, wave 0.6->0.45). See question 5.
- **Geomancer**: marsh 2 -> 8 (the pillar's lift + refund); wood unchanged after the Tusker-hands fix; stockade 7 -> 4 (12 seeds; the stockade hands hold X rarely - heavy 1-2 a fight - so this is mostly noise; worth a 24-seed look).

## ART HOOKS
- RANGER: rgDraw2 / rgDraw3 / rgKneelDraw2 / rgKneelDraw3 / rgLoose2 / rgLoose3 (greybox from her draw frames + pixel bits); the bodkin is procedural (iron head, amber wake); a PINNED foe uses the Warden's pin motes - a cord / arrow-through-the-foot read would sell it; NAILED could leave the arrow standing in the wall.
- BERSERKER: bzWind2 / bzWind3 / bzTier2 (the turn) / bzTier3 (axes buried); the split in the floor is the knight's shockwave dust - a drawn crack running both ways would sell it.
- GEOMANCER: gWind3 / gShard / gPillar; the stone shard is procedural (a wedge + rune glint); the pillar uses her standard stone piece tiles - a taller carved menhir with a rune lit at its top would set it apart from Stone Step.
- The tier meter itself is procedural for all four heroes - per-hero frames (a bow, crossed axes, a slab) could come later.
- Shots (lane-local, uncommitted): work/tmp-chargetiers/shots/ - t0_partial/t1_long/t2_pierce/t3_pin (+ _loose), berserker_t1..t3 (+ _go, _go2), geomancer_t1..t3 (+ _go, _go2).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Ranger T3: PINNING SHOT or the 3-arrow fan?** REC + BUILT: PINNING (the fan is her VOLLEY skill). ALT: fan at T3 (VOLLEY would want a new shape).
2. **Ranger focus**: REC + BUILT: a full focus makes a T2/T3 FOCUSED (x1.3) and is spent; the T2 pierce is free on the hold. ALT: keep "full draw + focus = pierce" and make T2 something else.
3. **Hold lengths**: ranger 0.69/1.20/1.75 (x0.7 from the knee), berserker 0.5/1.0/1.55 (x0.8 raging), geomancer 0.30/0.64/1.2. REC + BUILT. ALT: shorter tops if T3 feels slow in fights.
4. **The pin on a boss**: REC + BUILT: never held - 30% of his break bar + a 0.35 s check. ALT: 20% if the wood (75%) reads too easy for her.
5. **Berserker rates**: the Tusker 12/12, marsh 11/12 with the new hands (the old ones chained self-firing heavies). REC: play him first - the tiers are not the cause; if he feels too strong, the knob is the splitter's poise (1.5) and the hands, not the boss. BUILT: the trims above.
6. **Berserker T2 name**: SPINNING CLEAVE sits close to his bought THE SPIN and GREAT CLEAVE. REC + BUILT: keep the brief's name. ALT: "THE WHEEL".
7. **Geomancer T1 SHARD in the band where the mid-length crack was**: a release at 0.30-0.64 s used to be a mid crack; now it is the shard (under 0.30 s it is still the short crack). REC + BUILT. ALT: keep the mid crack and put the shard on UP+held X.
