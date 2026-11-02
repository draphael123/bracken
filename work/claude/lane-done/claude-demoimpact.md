# claude/demoimpact - DEMO IMPACT PASS (11-02) - READY for BATCH138 (not merged, not deployed)
Branch claude/demoimpact (base master 5b184cd5). Files: src/juice.js, src/main.js (shared hit path), tools/shake-mode.mjs (test updated), tools/demo-impact.mjs (new check, wired into tools/check.mjs).

## Changes (all tunable in JUICE, src/juice.js)
1. Default shake: ON HIT now shakes on a landed heavy/finish blow: JUICE.landShake 0.5 of the row (heavy 3/kick 3 -> 1.5/1.5; finish 3/2 -> 1.5/1; big-foe kill 8 -> 4). New tag 'land' in shakeCam (main.js landShake()). Light blows 0. FULL unchanged (whole row). OFF and reduce-motion: 0 (shakeCam gate unchanged). Shake strength LOW halves it.
2. Hit-stop from the blow: blowKind(e,dmg,tag) - hurtAs('heavy'|'dash') (HEAVY_TAGS) is the heavy class (40 -> 90 ms; boss x0.8, opening x1.25, Blood Knight x1.3 as before). 'shot'/'light' stay 40. hitstop() is still a max (no stacking). Covers lunge, holyCharge, boarding (dash) and the heavy-tagged skill lands (Blood Knight blades/wells/chain, Verdict, Geomancer waves).
3. Rumble: landRumble() on landed heavy 70 ms / 0.3, finish 90 ms / 0.4; none on light; min gap 0.25 s (JUICE.landRumbleGap) so DOT/volleys don't buzz; SET.rumble gates it.
4. Parry floor: Warden on-the-beat deflect hitstop 70 -> 80 ms (JUICE.parryStop), ring 14 -> 18, word 'TURNED IT' -> 'PARRY'; off-beat stays 70 ms / 'TURNED IT' (so beat vs off-beat now differ). Pyromancer: already 100 ms + rings + 'PARRY' + wardParry sound since the Flame Ward (pyrokit, master) - matrix 60 ms is stale, untouched. Knight 90 / Paladin 90 / Freebooter 100 / Ranger, Berserker, Geomancer 80 already mid pack. Blood Knight reference parry untouched.

## Checks
- tools/juice.mjs green; tools/shake-mode.mjs green (UPDATED: ON HIT heavy foe hit now small >0 and <=0.6x full; light foe 0); tools/demo-impact.mjs green (new: stops, shake, buzz, Rumble OFF, reduce-motion, shake OFF); tools/riposte.mjs green; node --check main.js ok; page errors none.
- Boss spot check (knight, boss-rates, n=6, flasks=kit, master vs branch): practiced wood 5/6 vs 5/6, stockade 4/6 vs 4/6; built wood 6/6 vs 6/6, stockade 2/6 vs 2/6. Fight lines identical (bot sim deterministic): no easier/harder.
- NOT run: full suite (nightly gate owns it).
## Notes
- parryStop 0.09 turned tools/riposte.mjs Warden red (riposte cut timing is frame-sensitive at 90 ms); 80 ms is green and is the mid pack's low end.
- No clip: freeze/rumble can't be shown in stills; numbers are in the demo-impact check output.
