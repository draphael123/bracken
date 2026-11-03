# claude/jabart - jab art fix (Daniel 11-03 14:49), art/feel only, no damage/timing change
- KNIGHT 3rd jab: now drawn as a shield bash (src/chars.js F.kBash3, 5 beats on the jab clock: cock / step / bash with kite shoved out at arm length / ring / recover); main.js draw hook; landing FX (steel flash, ring, sparks, dust, clank) in knightRider.
- GEOMANCER 2nd jab: redrawn as staff swung geode-first (F.atkB: heft / over / swing / follow), not a level spear thrust.
- GEOMANCER 3rd jab: stone fist visible (F.gFist): rock gauntlet gathers, forms, big grey fist with amber crack punched out, crumbles; knock-up FX via geoFistFx (grit, ring, chips).
- Checks: node --check chars.js/main.js OK; tools/attack-animation.mjs PASS. No full suite run.
- GIFs/strips: scratch\lane-reports\jabart\ (before-*/after-k3, after-g2, after-g3, *-strip.png).
- Questions: none blocking. Rec: ship with the demo; eyeball after-g2 (geomancer sprite reads dark in the strip at 1x).
