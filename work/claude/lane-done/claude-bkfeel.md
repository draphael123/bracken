# claude/bkfeel - THE BLOOD KNIGHT: parry impact + five real tiers (opus, 10-21)

Base: live master b4dfa014 (BATCH109). Daniel's 10-21 playtest: "his PARRY ... doesn't feel great - the Warden's feels good" and "his charge meter ... looks like it's just one or two ... a much longer charge ... five tiers".

## WHY IT FELT WEAK (found in the code)
- **Parry**: the ward-release THROWN BACK already had a 0.15 s stop, but (a) its 240 px/s knockback was zeroed by the shared parry reel (riposte.js tick sets vx = 0) the next frame - the foe read as not moving; (b) his riposte window was the shared 0.6 s and a plain cut, short for a greatsword; (c) camera shake and zoom are hidden under the default SHAKE MODE 'on hit' for EVERY hero's parry, so the Warden's and his both live on hitstop + flash + sound. The Warden's deflect plays the punchy `parry` sample + her shaft layer; his had synth bells + a clang. (d) A C tapped quicker than the ward's 0.08 s rise did nothing at all. (e) His riposte glint was still the old necrotic green.
- **Tiers**: the meter over his head was the GENERIC heavy bar (22 px, filled in 0.46 s, necrotic green) - it showed nothing past "armed". T4/T5 NEEDED debt, so a player with no debt reached T3 at most and the tick sounds were capped at the knight's 3 notes. Hence "one or two".

## WHAT CHANGED
Numbers in **src/blood-kit.js** (`BLOOD.tiers`, `BLOOD.empower`, `BLOOD.parry`); hooks in main.js tagged `claude/bkfeel`.

| | before | now |
|---|---|---|
| tier holds (s) | 0.3 / 0.6 / 1.0 / 1.4 / 1.9, auto 2.5 | **0.35 / 0.8 / 1.3 / 1.9 / 2.6, auto 3.3** (knight: 0.3/0.7/1.1, auto 1.8) |
| T4 / T5 | NEED 6% / 14% debt | **reached by the hold alone**; debt (>= 3% max hp) **EMPOWERS** them: spent in at x(1 + 3 x spent/max) and **half of it drunk back when it lands** (never above pre-hit) |
| multipliers | 1.5 / 1.8 / 2.0 / 2.4 / 2.6 | 1.5 / 1.9 / 2.3 / 2.8 / 3.4 |
| meter | generic 22 px bar | **5-segment crimson meter** (each segment fills over its own stretch, lit in its tier colour, white pop on arrival), **tier name over it**, a pulsing red underline under T4/T5 while debt can feed them |
| per-tier feedback | knight's 3 ticks, capped | **SFX.bkTier**: a note climbing A-C-E-G-A + a heartbeat that hardens, deeper bell at T5, wet draw when fed; crimson body flash each tier; body ring from T3; small screen flash at T5; debt motes run up the blade when fed. Windup poses = the art lane's per-tier keys (unchanged) |
| parry freeze | 0.15 s | **0.20 s + 0.16 s crimson held breath** (world at 0.3, after the freeze; off with hitstop off / reduce motion) |
| parry screen | white kill flash 0.06 | white 0.05 + **crimson wash with closing edges** (0.24 s; flashes setting) |
| parry sound | dkReturn + dkClang | + **SFX.bkParry** (parry sample pitched to a greatsword bind, steel, sub boom, blood rush, low minor bell) |
| foe | 240 px/s shove (zeroed), 0.7 s stagger | **18 px real stumble (stays in reach), 1.0 s reel**, blood sprayed off it the way it is thrown |
| counter | shared 0.6 s, plain cut | **0.9 s, HEAVY third cut** (as the knight's riposte) |
| debt reclaim | +N number + motes | + **HUD pulse**: the refilled stretch of the health bar flashes white-hot, the bar is ringed crimson (wider/longer for a parry's ALL-back); also on every landed reclaim and the fed T4/T5 drink |
| tap C | nothing (ward never rose) | **THE FLICK**: a tap too short to stand the ward up opens the same 0.22 s release beat (costs the ward's raise wind, nova cooldown) |
| glint | green #dfffc0 | crimson #ff9aa6 / flash #ff6b6b |

Timing window (WARD_BEAT 0.22 s) unchanged. Movement/stamina while holding = the knight's (feet planted, debt frozen while wound, a hit drops it).

Text: hero desc (store/pick) - five reached by a long hold, debt spent into the last two hits harder and drinks some back; parry line mentions the tap + heavy riposte. Skill THE FIVE-TIER HEAVY (progression-catalog). Trial text unchanged (still true).

Lab bot: new opt-in profile modifier **`+tiers`** (src/bot-profile.js, src/lab.js rotHold): the Blood Knight joins THE ROTATION and winds SUNDER in an opening (CRIMSON CRESCENT on a broken boss; T4/T5 sit past the rotation's 110-frame hold cap). Opt-in so no standing row moves.

## CHECKS (PORT 8785, one Chrome at a time)
GREEN: **blood-kit** (rewritten asserts: all five by the hold alone with no debt, spread >= 0.4 s apart to >= 2.4 s, rising mul, fed T4 spends + drinks back; new PARRY block: freeze, held breath, wash flag, 0.9 s heavy riposte, foe reels inside 48 px, all debt back with the bar pulse; THE FLICK throws the blow back), **riposte** (assert moved: the reaper's window <= 0.95 and his riposte ratio bound = knight/berserker's 3.8 - deliberate, commented), dk2, foe-pass, foe-pass-page, crouch-b, crouch-hint, hint-shown, juice, commitment, verb-matrix, ability-poses (76/76), hero-trials, skill-icons, talents, reaper-input, attack-animation, unburied-fights, syntax, comments.
**textfit --strict store,pick,tree,hud,hints: 0** (1110 screens).
Flaky under PC load (not reds): ability-poses and riposte stalled inside one `check.mjs` subset run while other lanes ran boss-rates; both pass alone (riposte needs ~250 s); commitment timed out once at 600 s, passed on rerun.

## RATES (boss-rates practiced, profile human, kit flasks, reaper only)
| row | base b4dfa014 | lane | lane `human+tiers` |
|---|---|---|---|
| stockade (L3) | 5/12 | 5/12 | 1/6 (base 6-seed run: 1/6) |
| marsh (L3) | 5/6 | 5/6 | 5/6 |
| canal (L27) | 0/6 | 0/6 | 1/6 |

Identical: the default bot almost never parries (par 0 in 34 of 36 fights) and does not hold X for the reaper, so this lane cannot move his rows; k/w/p rows untouched (no foe/boss number changed). The reaper is not banded; nothing to tune. The +tiers hands (6-30 held heavies a fight) are about even - noise at 6 seeds.

## REDS
None open. Not run: full suite (nightly). An orphan headless Chrome from 10-19 (PID 6584, profile bracken-look-*) is still alive - not mine, left alone.

## ART NOTES
- A **parry pose** of his own (P.rpPoseT: today the shared squash) - blade swept up across the body, blood flung off the flat. Key suggestion `bkParry`, 2 beats.
- The 5-segment meter is procedural; an art pass could give it a blade-shaped frame with blood filling it.
- T4/T5 windup poses exist (exsWind/moonWind) but are now held much longer (to 1.9/2.6 s): a 2-3 frame trembling loop for each long hold would sell the wait.
- The FLICK has no pose (uses the ward's raise streak); a quick blade-flick frame would help.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **T4/T5 and debt.** REC + BUILT: reached by holding alone; debt EMPOWERS them (spent in for damage, half drunk back when it lands). ALT: keep debt as a gate for T5 only.
2. **Hold lengths.** REC + BUILT 0.35/0.8/1.3/1.9/2.6 s (auto 3.3). ALT: shorter top end (2.2 s) if T5 feels too slow to use in fights.
3. **The FLICK** (tap C = parry beat without standing the ward up). REC + BUILT: yes, same 0.22 s window. ALT: off (`BLOOD.parry.tap = false`).
4. **Held breath (0.16 s slow-mo after the freeze).** REC + BUILT: on (off with hitstop off / reduce motion). ALT: freeze only.
5. **Shake on parries.** Every hero's parry shake is hidden by the default SHAKE MODE 'on hit'. REC: leave (respect the setting); NOT built. ALT: tag parry shakes so they show by default for all heroes.
6. **Bot tiers.** REC: keep `+tiers` opt-in until you've played; BUILT opt-in only.
