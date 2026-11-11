# juiceproof-d (D1) - 11-10
Branch claude/juiceproof-d off claude/juice2 (334db4b77). Not merged, not deployed.

## Flip (exact)
src/juice.js l.93: `export let JUICE2_SHIPS = true;` (was false). ON. One-line rollback = set it false. Old values 65/110/130 ms, boss floor 55, weapon x1.15 maul/axes (paladin, berserker), x0.85 cutlass/bow (pirate, ranger) are the J1 table as built.

## Tool results (flag ON unless noted)
- juice.mjs: was RED after J1 for a STATIC assert (blowStop wiring regex wanted stopFor( but J1 calls stopFor2( ), not the page half. Fixed; asserts now flag-aware (ON 65/110/130, OFF 40/90/90). GREEN (page: light .065, heavy .11).
- demo-impact.mjs: flag-aware (65/110, shake bound uses landShakeShare 0.65). GREEN.
- shake-mode.mjs GREEN. combat-feel.mjs GREEN. attack-animation.mjs GREEN. attack-buffer.mjs GREEN. air-motion.mjs GREEN. audit-anim.mjs GREEN (usual identical-frame list).
- riposte.mjs: ON full run GREEN x2. ONE intermittent red on the elite section ("one riposte does not break his guard", d1 57 vs 38 = riposte cut was the heavy 3rd cut) appeared with the flag OFF too (OFF 1 red / 1 green, ON 3 green): pre-existing combo-state flake, not JUICE2. The Warden 90 ms parry assert stayed green (parryStop untouched).
- juice2.mjs (node; toggles the flag itself, keeps the OFF path asserted): OK.
- Other tools reading BK.stop (ability-poses, commitment, finishers, berserker, pose-*) only wait out a stop, no old-value asserts.
- Co-op duty cap: asserted at 4P in juice2.mjs (node). A page-level 4P check NOT run (no cheap hook for 4 local players in the test API); owed, low risk. Reduce-motion/Flashes/Hit-stop toggles: page-asserted by juice.mjs (reduce -> shake 0) and demo-impact (reduce/off), jitter+star gating by juice2.mjs.

## Built (J1 skips)
- Clink recoil: a blow that glances on a guard sets the swing to frame >= 3 for the rest of that swing (draw only; main.js hero pose branch + glanceBeat stamp P.clinkAtT, 0.22 s). Verified in frames (atk:3 held, no flicker back).
- NOT built: kill-pop white silhouette x1.15 and the 40% white tint after 0.05 s pure white. Reason: foe white-flash is drawn by a per-type draw ladder (hundreds of sites pick a pre-baked white sprite on e.flash>0); there is no generic silhouette path, so it is not cheap. Kill still has the 130 ms freeze, finish star, ring, chips.

## Proof (SCRATCH\desktop-out\juice\)
juice2-4still-strip.png (contact star, smear, clink, kill pop); knight/pyro/ranger-combo-kill.gif (3-hit combo + kill, ~real time); knight-clink.gif; frames/ (PNGs + meta). Tool: tools/juice-proof.mjs.
Smear doubling (juice2 Q2): YES on the knight. A tan old arc wedge AND the new white streak both draw on cut frames 2-3 (it reads busy when the hit snaps it bright). Paladin/pirate use the same additive path (not captured separately). Rec: drop the old generic arc under the flag for light cuts on knight/paladin/pirate.
Ranger freeze is 55 ms (65 x0.85) - correct per spec.

## Boss rates (n=6, knight, practiced, flasks=kit, normal)
wood:     OFF 5/6 = 83%   ON 5/6 = 83%
stockade: OFF 5/6 = 83%   ON 5/6 = 83%
Identical. Both above the 60-70 band at n=6 (CI 44-97, "UNSURE"), same as before the flag - not a JUICE2 effect.

## Owed
- Page-level 4P co-op stutter eyeball; 20 s audio clip (J3); paladin/pirate smear stills; kill-pop silhouette (needs per-type art path).
## Questions (rec first)
1. Drop old generic arc under JUICE2 on knight/paladin/pirate light cuts? REC YES (tiny change, after a look at the GIF).
2. Kill-pop silhouette: worth a per-type pass after the demo? REC NO for 11-14, maybe later (star+ring+chips already read).
