# claude/bloodstep - THE BLOOD STEP (Daniel 10-22 ~19:00)
Base ef52534e (BATCH113). Not merged, not deployed.

## What changed
1. RESKIN (timing/speed/inv unchanged: HP.reaper.step t 0.2, inv 0.14, speed 350): crimson mist and a red after-image instead of the shade, no 'shadowed' body (he is drawn whole),
   droplets flicked off his armour at the start, the dark passing-ghost trail and smoke and the WAKE decoy are all crimson now (src/hero-pass.js, src/main.js, src/chars.js pose colours).
   Sound: wet heavy step + armour clank (src/audio.js pDodge reaper branch, synth). Ids (shadowStep, 'shade') kept; player-facing text says BLOOD STEP (trial line, hero card).
2. PERFECT STEP (src/blood-kit.js BLOOD.step {debt 0.05, edge 1.2, cd 1}; main.js bkPerfectStep): a blow with an attacker that would have landed inside the step's 0.14 s untouchable window
   bleeds off 5% of max hp of blood debt (as a reclaim: heals that much, never past the debt), edges the blade 1.2 s (BLOOD PRICE's cut, free), crimson flick + "+N" (or BLOOD STEP with no debt).
   At most one per second; hazards with no attacker give nothing.
3. Text: hero card sentence, trial line ('dodge' yard: THE BLOOD STEP ... STEP THROUGH A BLOW AT THE LAST MOMENT AND IT BLEEDS HIS DEBT AWAY).
4. tools/blood-kit.mjs: new check 5c (refund once, edge, once a second, none late, none from a hazard). tools/bloodstep-strip.mjs: the before/after strip.

## Boss rates (Blood Knight, human profile with flasks, practiced way, n=12, lab bot)
before (BLOOD.step zeroed) -> after: stockade 1/12 -> 1/12, unburied 4/12 -> 4/12, waymeet 0/12 -> 0/12. Identical: the lab bot almost certainly never perfect-steps
(it dodges on tells but its inv window does not coincide with a landing blow), so these rates do NOT test the refund. Absolute rates are the existing low Blood Knight rates, not this lane's.
Refund ceiling: 5 hp of 100 (5%) once a second, only while he owes debt; edge +20% blade for 1.2 s.

## Checks (all green)
blood-kit (+new 5c), riposte, hero-trials, ability-poses, dk2, hero-pass, textfit --strict store,pick,tree,hud,hints,trial (0 on everything, 25 s).

## PNGs
work/claude/bloodstep/step-before.png (shadow step, old), work/claude/bloodstep/step-after.png (blood step).

## QUESTIONS FOR DANIEL
- "A small free Blood Price": built as a reclaim of 5% of max hp of debt + a 1.2 s free blood edge. Rec kept; if you meant only the edge, or a bigger/smaller refund, it is BLOOD.step.
- The lab bot cannot show the refund in rates; want a scripted perfect-step probe in the suite (blood-kit 5c already forces one)?
