# Combat recovery and reliable measurement

The previous timing matrices were diagnostic, not final acceptance. Fresh pages now start a new hero body, level and encounter. Manual simulation begins before the lab module imports, removing an initialization race. Two identical fresh seeded encounters must agree on all reported measurements in the regression suite.

Boss openings are counts; they must never count as kills. Acceptance reports now require the explicit killed flag (or the ambush opened flag), and reject unknown level IDs before launching a browser.

Actual game corrections:

- King Gorm's completely spent cage rack recovers after the current opening ends. Previously the refill depended on a cage attack whose trigger required an unused cage.
- Gorm can hop over his own fallen throne rather than become separated from the remaining cages. The throne remains in the room.
- Falling Tower has a stable lower-floor checkpoint at column 172. Its largest checkpoint gap falls from 128 to 91 columns; route/reward validation includes the new checkpoint.
- Pyromancer's shop description now agrees with her 88 base health.

Pilot corrections:

- Rest decisions happen before queuing attacks; Pirate makes space to wind his pistol.
- Elite enemy families remain visible to the combat pilot, while actual elite damage rules are unchanged. This lets the pilot use shield-breaking attacks.
- Red elite tells are dodged by shielded pilots as well as by Warden.
- Gorm's closed-crown destination is a lure location, not a sword-range target. The existing cage activation assist remains; these runs do not prove manual pressure-plate execution.

Evidence before the final pilot corrections: 33/36 early boss kills, 3/36 within 90–150 seconds; 107/108 ambush clears, 61/108 within 15–35 seconds. A later boss batch stopped after 24 valid rows because its requested level list contained an invalid forge ID; its 24 rows are partial diagnostic data only.

Focused corrected runs: all six heroes now finish Gorm (17.4–58.8 seconds), and all six clear Sporewood's ambush (5.4–9.2 seconds). These solve stalls, not pacing. Both timing targets remain unmet. Health is replenished in these labs; results do not establish player survival. No boss health, damage or plunge costs were changed in this recovery pass.
