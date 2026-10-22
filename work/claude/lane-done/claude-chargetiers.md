# claude/chargetiers - CHARGE TIERS: THE RANGER FIRST (opus, 10-22)

Base master 5e44cddd (BATCH112). Brief: scratch/brief-chargetiers-1021.md (Daniel 10-21, approved). PORT 8789, one headless Chrome at a time.

## RANGER - THE THREE-TIER DRAW (built, green, pushed)
Hold X with arrows in the quiver (bow stance). A TAP is still the QUICK SHOT. Held, the draw now climbs three tiers; let go on a tier and that shot goes. Each tier is a different move from her kit:

| tier | arrives (held s, base) | the move | numbers |
|---|---|---|---|
| (partial) | 0.14-0.69 | a short draw, as before: weaker and shorter the less it was drawn | 0.9-1.7x |
| T1 **LONG SHOT** | 0.69 (= her full draw, unchanged) | the strong ARCING shot she always had: sweet-spot focus, TWIN NOCK, BODKIN | 1.7x, wind 9 |
| T2 **PIERCING SHOT** | 1.20 | FLAT and fast through a whole line (was the focus spend; now the hold reaches it) | 2.0x (was 1.9), range 240, wind 11 |
| T3 **PINNING SHOT** | 1.75 | a heavy bodkin, flat: a common foe is **PINNED** where it stands 2 s (no walk, no swing, poise gone - the Warden's pinFoe, written once); with a wall right behind it **NAILED** x1.5; an elite 1 s. A **boss or mini is never held** (B3/B13): the pin bites 30% of his break bar and checks him 0.35 s ("CHECKED") | 2.4x, range 250, wind 13 |

- Held at T3 for 2 s more it goes by itself (auto 3.75 s - about the old 3.69 s full-draw hold).
- The ladder scales with the draw's quickness: STEADY DRAW (x0.8), the KNEELING DRAW (x0.7: T3 at 1.27 s from the knee), the technique rank.
- **HUNTER'S FOCUS**: the old spend "full draw + full focus = piercing shot" moved up the ladder - a T2/T3 loosed on a full focus spends it and is **FOCUSED** (x1.3; the pierce flies a quarter further, the pin holds half again). A T1 LONG SHOT never spends it. UP+C MARK unchanged.
- **Why the PINNING SHOT, not the 3-arrow fan**: the fan is her VOLLEY (her level-1 bought skill: three arrows in a fan) - a T3 fan would make the skill pointless and is a damage spread, not a new verb. The pin is a new verb she has nowhere else at range (the snare is set at her feet, the bear trap is thrown; the pin is AIMED), it fits "she covers some of the room, not all of it" (one target, held), it plays off walls (NAILED), and on a boss it is a break-bar tool rather than a lock.

### Feel (the bkfeel system, reused)
- **Meter**: the Blood Knight's five-segment meter is now ONE general `drawTierMeter` (main.js; drawBkMeter calls it with his numbers - his look unchanged, blood-kit green). Hers: 3 wider segments (bone / green / amber), each filling over its own stretch, white pop on arrival, the tier's NAME over it, and a blinking green underline under T2/T3 while her focus is full (they will go FOCUSED).
- **Per tier**: SFX.rgTier - a string creak that tightens under a note climbing D-A-D' (a bell on T3, a shimmer when it will be focused); a ring at the bow, a body ring from T2, a breath of her colour on her body (P.rpTintT), a small shake on T3. Release: SFX.rgTierLoose (T2 a whip-crack and a hiss; T3 a deep thrum and a wooden knock), SFX.rgPin on the catch.
- **Words**: PIERCING SHOT / PINNING SHOT on release (FOCUSED: ... when spent), PINNED / NAILED / CHECKED on the catch.

### Poses (greybox, chars.js rgKitPoses - list for the art lane)
`rgDraw2` (T2 held: past the ear, elbow high, bow dead level, green glint - 2-beat tremble), `rgDraw3` (T3 held: wide braced stance, bow canted, the dark bodkin head, amber glint - 2-beat tremble), `rgKneelDraw2` / `rgKneelDraw3` (the same from the knee), `rgLoose2` (the flat snap, a green line out of the bow), `rgLoose3` (the heavy follow-through: rocked back a step, bow arm kicked up, amber sparks). T1 keeps the windup's last beat + rgLoose. Shots: work/tmp-chargetiers/shots/*.png (uncommitted, lane-local) - t0_partial, t1_long, t2_pierce, t3_pin, and each _loose.

### Bot hands (src/lab.js)
- **Level foes** (strike, the kneeling draw): she lets go on the tier the foe asks for (`rgFoeTier`): an ELITE or a plate/shell/beast not already held -> PINNING SHOT; two or more in the line within 240 px -> PIERCING SHOT; else LONG SHOT. (Before, the hands held every draw ~3.7 s until it went by itself.)
- **Bosses** (the mixed heavy in his openings and the rotation): `rgBossTier` - the PINNING SHOT while he is NOT broken (it bites the break bar), the quicker PIERCING SHOT once he IS broken (the window on damage). Measured: 4-8 pins a fight on the wood, 0-1 draws on the marsh (she knifes the Frog King).
- tools/boss-run.mjs prints an `rg {t1,t2,t3,pin,big,foc,...}` column for ranger rows (stats reset per fight).

### Text
Hero desc (store/pick), the pick card line (HOLD X: LONG SHOT, PIERCE, PIN), the shot and focus teaching lines, TWIN NOCK ("a LONG SHOT ... looses two arrows for one" - it is T1 only now). The straw yard's "heavy blow" counts every drawn tier.

### Checks (PORT 8789)
GREEN: **ranger** (pierce block moved to the T2 hold + FOCUSED; new TIERS block: the climb 1-2-3 >= 0.4 s apart, rgDraw2/rgDraw3 shown held, T1 long shot keeps the focus, T2 pierce, T3 pin holds a common foe + rgLoose3, NAILED by a wall holds longer, a mini is only CHECKED, wind per tier rises 9/11/13, the auto-loose at T3 is a pin; art list + the 6 new keys), **blood-kit** (the meter refactor), **hero-trials** (9 yards), **ability-poses** (77/77), **textfit store,pick,tree,hud,hints,trial --strict: 0** (1117 screens), syntax, comments.
Not run: the full suite (nightly).

### Boss rates - ranger only (boss-rates practiced, profile human, kit flasks, campaign level)
| row | L | before (5e44cddd) | after | |
|---|---|---|---|---|
| wood | 3 | 6/12 (50%) | **9/12 (75%)** | 4-8 pins a fight - the pin is her break-bar tool |
| stockade | 3 | 8/12 (67%) | 9/12 (75%) | |
| canal | 28 | 0/12 | 0/12 | unchanged - her canal problem is not the draw (heavies 8/fight both) |
| burning | 4 | 11/12 (92%) | 11/12 (92%) | unchanged (she was already strong here) |
| marsh | 3 | 12/24 (50%) | 10/24 (42%) | noise: 0-1 draws a fight there (she knifes the Frog King) |
No boss became trivial (nothing at 100%; the strong one is unchanged). The ranger is not one of the banded heroes (k/w/p); no boss number changed.

## PROPOSALS (Berserker, Geomancer)
see the sections below (built after the ranger if time allowed).

## ART HOOKS
- the six ranger keys above (greybox from her draw frames + pixel bits);
- the tier meter is procedural for every tiered hero - a bow-shaped frame for hers could come later;
- the bodkin (pin arrow) is drawn procedurally (10 px, iron head, amber wake); a PINNED foe uses the Warden's pin motes - a cord/arrow-through-the-foot read would sell it; NAILED could leave the arrow standing in the wall.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **T3: PINNING SHOT or the 3-arrow fan?** REC + BUILT: PINNING (the fan is her VOLLEY skill). ALT: fan at T3 (VOLLEY would want a new shape).
2. **Focus**: REC + BUILT: a full focus makes a T2/T3 FOCUSED (x1.3) and is spent; the T2 pierce is free on the hold. ALT: keep "full draw + focus = pierce" and make T2 something else.
3. **Hold lengths** 0.69 / 1.20 / 1.75 s (auto 3.75; x0.7 from the knee). REC + BUILT. ALT: tighter top (1.5 s) if T3 feels slow in fights.
4. **The pin on a boss**: REC + BUILT: never held - 30% of his break bar + a 0.35 s check. ALT: 20% if the wood (now 75%) reads too easy for her.
