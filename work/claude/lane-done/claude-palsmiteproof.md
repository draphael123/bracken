# claude/palsmite browser proof (PROOF2, 11-04) - Sonnet
STATUS: MERGE-READY = YES (numbers still the tune lane's). No bug found, no source change. Not merged, not deployed. Pushed.

## Merge
master 42a1d4cd merged in clean (580d242e), node --check src/main.js ok.

## Checks (one browser at a time, >= 4.6 GB free)
- node tools/paladin-kit.mjs: GREEN (39 s) - tiers, light-ward, step, prayer, dawnfall, verdict, spear, co-op aegis all unchanged by the smite.
- Probe scratch/palsmiteproof-probe.mjs (stockade flat floor, real keys, held attack chain, 3 swings x 2 foes, console clean):
  - the THIRD cut sets P.palSmite3 (+ heavySwing); cuts 1-2 never do.
  - common foe: third cut 21 dmg (1.5x chain), Conviction +10 on that swing (3 base + 0.5 pip x 20 = 13-14 total), paid once per swing; stagger set 0.8 s but reads 0.49 right after the hit (stagger diminishing on a just-staggered foe, not changed here).
  - boss-class foe (maxHp set): third cut 26 dmg = 21 + the x0.35 light chip (5), stagger ~0.28 (0.3), poise leans (9.5 -> 47), +0.5 pip once. Cuts 1-2 unchanged (14, +3 light).
  - repeated chain (two smites in 260 ticks) behaves the same each time; no state leaks to cuts 1-2.
- Look: scratch\lane-reports\palsmiteproof-smite.png (12 frames, 3x): gold ring at the hammer head as the tell, then a wide holy flash over the foe with the 21 number, pips row shows the half pip. Reads clearly; the white flash is large and hides the foe for ~6 frames (taste call, not a bug).

## Owed (not run)
- A GUARDED boss gets no extra chip/guard break: read from the code (`guardedFoe` early return), not exercised in a fight.
- Boss win-rate re-check with the Paladin (chip is small, +5 per smite): a joint tune lane's.
- Conviction pacing (+0.5 pip per third cut) in a long fight.
- A human eye on the flash size at phone width.

## Questions (rec first)
Same as palsmite.md (Conviction +0.5 rec; AFTERSHOCK stays; hero blurb at next copy pass). Q4: flash size over the foe - rec leave, shrink only if play-testers lose the foe.
