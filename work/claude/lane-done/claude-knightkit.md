# KNIGHTKIT (claude/knightkit, worktree bracken-knightkit, from 1b93f610e) - Daniel 11-05
Status: READY for the SAT 11-07 cut on features and checks; one soft item owed (boss-rate read, below). Not merged, not deployed.

## Built
1. FULL-CHARGE HEAVY CUT = GROUND-SHAKER AoE. The knight's held swing already existed (0.5 s chop, breaks a guard). knightid had left a dormant stage 3 (cutQuake) unreachable; it is now live and tuned:
   - HOLD X: 0.5 s = the chop (gold pip, as before). 0.9 s = FULL CHARGE (orange pip, ring + note at the blade, pulsing glint). Release: the chop AND a shockwave both ways from his feet, 3 tiles (48 px, speed 160 x 0.3 s), floors small foes (1.2 s down, stood broken), heavy blow at 0.4 x swordDmg.
   - Minis/bosses are never thrown (rocked only), take the quake wave at normal boss scaling, and the blade on a boss is the same bite of the poise bar as the plain chop (the old stage-3 extras of 0.5 s stagger / 35% poise were removed; boss resist floor untouched).
   - Cost 1.5 x the heavy price (50 st vs 33); too tired -> it falls back to the plain chop. Cooldown 2.5 s (QUAKE in src/main.js): on cooldown a full hold is just the chop and the pip stays grey.
   - Auto-release at 1.8 s now fires whatever stage the hold earned (it used to force stage 3 even though it was unreachable). 3-cut chain and held block untouched. The charge bar is now two pips.
2. DOUBLE-TAP C = SHIELD BASH. Two taps: first held <= 0.18 s, second pressed within 0.3 s of the first (DTAP in main.js). First tap raises the shield as always; the bash drops it. Lunge driven ~25 px (~1.5 tiles) for the double-tap only (UP+C keeps its half step). Same hit code as UP+C, same 0.55 s cooldown and 12 st (no double fire). Held C, long-hold-then-tap, slow taps never bash. UP+C kept.
   - Also: the bash (both inputs) now BREAKS A RAISED GUARD on non-elite, non-boss foes (0.9 s, "GUARD BROKEN"), as the third jab does; it did not before. Elites keep the stagger, bosses are braced.
3. Text: controls card shield-bash row "SWING x3, OR TAP C x2" (toggle mode: "OR UP+C"), heavy row "HOLD SWING (LONG: QUAKE)"; two loading-screen tips.
   Touch: the block button sets the same key, so double-tapping it works. In block-TOGGLE mode a second tap lowers the shield, so there UP+C (stick up + block) is the bash (card says so).

## Checks (all real page, one browser at a time, RAM >= 1.9 GB each)
- tools/knight-kit.mjs (new): quake floors all four foes within 3 tiles both sides, not the one at 90 px; cost 50, cooldown works (chop only, 33); 0.6 s hold = chop no quake; minis not floored; double tap fires exactly once, shield down, guard broken (0.88), stagger 0.33, lunge 25 px; burst of taps fires <= 1; hold-then-tap and slow taps do not bash; UP+C still fires. PASS.
- tools/knight-chain.mjs PASS (perfect guard, chain, third jab, heavy cut, charge). tools/hero-pass.mjs knight PASS.
- tools/textfit.mjs --strict practice,settings: 0 knight issues after rewording (1 COLLIDE left: ranger "HOLD DOWN (STILL), +C SNARE", pre-existing, not mine).
- Stills on Kingswood: scratch/lane-reports/knightkit-quake.png (hold, flash, quake, pack down), knightkit-bash.png (double tap, lunge, INTERRUPTED + GUARD BROKEN). Console/page errors: 0 in both runs. (Order-knight bodies: the shield foe on kings stood in for them; guard-break path is the same guardedFoe.)
- Not run: hero-pass dodges/warden/etc, the full suite (not this lane). Page crashed once or twice on boot under other lanes' RAM; retried and passed.

## Boss-rate read (n=6, wood, knight L3, practiced, with kit flasks)
Wins 4 of 5 valid fights (s2 = page crash, not a loss): 80%, 95% CI wide (n=5 spans the 60-70 band). It is a quick read, not a verdict. Caveat: the bot's heavies release near 0.56 s, so it rarely earns the 0.9 s quake; this read mostly proves the chop path is unchanged. No baseline run on master (credits). Owed if you want it: the same command on bracken/ master for a before/after, and a human-ish pass holding to full charge on a mini. Quake on a boss adds only 0.4 x swordDmg per side wave, once per 2.5 s, and costs 50 st.

## Questions (rec built)
1. Full charge 0.9 s / 3 tiles / 2.5 s cd / 1.5x stamina - built. Alternative: 1.0 s hold, 4 tiles.
2. Bash guard-break on UP+C too (built) vs double-tap only.
3. Quake does damage to bosses (built, 0.4x) vs knock-only.
4. Toggle-block players get UP+C only (built) vs a separate double-tap rule.
5. Trial text for the heavy cut (level.js) not changed; say if the first-level lesson should teach the quake.

Commits on claude/knightkit: f09dea458 b6b611941 32ce96922 2dad03191 6baff66d4 231211f97 69cd822b5 648595403 (pushed).
