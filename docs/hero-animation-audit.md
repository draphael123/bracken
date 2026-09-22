# Hero animation audit (2026-09-22): the heroes are not the weak point

Measured in the live game (`BK.heroSet` for each hero): every frame of every pose, identical frames counted once.

| hero | frames | distinct | canvas |
|---|---|---|---|
| knight | 117 | 90 | 34x56 |
| pyromancer | 112 | 94 | 34x56 |
| paladin | 115 | 90 | 34x56 |
| freebooter | 119 | 93 | 34x56 |
| death knight | 121 | 90 | 34x56 |
| warden | 120 | 101 | 34x56 |

Each has an 8-frame idle, a 6-frame run, a three-cut combo of 5 frames a cut (atk, atkB, atkC), a 5-frame air attack, rising cut and low
sweep, a 3-frame heavy and dash attack, a 4-frame roll, swimming and treading (4 + 4), and ~20 fidgets and a dance. The warden adds
her wind-up, deflect, vault and pin.

**The thin spots are small:** jump, fall and land (2 each), apex, skid, plunge and crouch (1 each), hurt (2), climb and block (2). A
3-4 frame jump arc (take-off, rise, apex, fall) and a 3-frame landing would be the only hero animation work worth doing soon.

**So the animation effort belongs on the enemies** (`docs/animation-audit.md`: median ~5 frames, 126 of 185 with no hurt frame), which
is where the ten redraws in `src/redraw/foes_v2.js` started. This corrects my earlier advice that the hero pass was the next big art job.
