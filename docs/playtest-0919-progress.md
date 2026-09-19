## Item 2 — flashing

Reproduced the full-height band in Stockade tiles 140–145 with the pyromancer: the foreground coverage state toggled at tile 142 and the old fade divided the band into rectangular brightness regions. Decorative trunks and parallax columns now draw softly behind the tiles and actors. Remaining near foliage uses one continuous radial mask rather than threshold-switched rectangles. Night-light code was inspected; this reproduction traced to the foreground composition, not a darkness-mask toggle.

Before/after frames inspected. `npm run check` exit 0 (19 checks); render-layer rule included in the suite. Unverified: Daniel's exact original screenshot location, which was not supplied, and a human playthrough.

## Item 3 — pyromancer heat

Successful direct hits grant 12 heat, jet hits 4, and attributed burn ticks 1.5; the meter's variety floor is 85%. Missed swings, shots and skills no longer grant cast-time heat, and an empty jet cannot fill it. Hits refresh a four-second grace; cooling is 3/s afterwards. Pilot Light, Inferno and the banked-pyre behavior remain.

Fight lab sequence (sprig, shield, brute, archer): peaks 13.8, 31.8, 87.05, 100, with exactly one fill; all foes killed. Before this change, the first three peaked at 11.9, 7.58 and 28.34 with no fills. Empty swings and a six-second held jet measured zero heat. Timing/floor regressions are part of the check. `npm run check` exit 0, all 20 checks passed. Unverified: extended human balance playtest and multiplayer burn attribution.

## Item 4 — Hornet Queen

The fight keeps its wide camera through rendering. The ceiling comb is decoration; slams shake four warned wax chunks loose, which shatter without adding platforms. Low arena ledges remain. A machine check covers ceiling collision, the three-piece cap, warning time, unchanged footing and persistent zoom. Wide-view frames inspected. All six boss labs killed her (40.1, 79.2, 24.3, 43.0, 35.1, 57.4 seconds); these remain below the requested 90–150 seconds, as the baseline mostly was. Timing balance remains for item 13. `npm run check` exit 0, all 21 checks. Human combat feel unverified.

## Item 5 — decoration kits, monastery and runtime footing

Every registered level now has an explicit ground kit and a decoration allowlist covering scatter, DRESS and authored entities. Stormhold keeps its scatter density with camp objects and replaces its cairn with a skull totem. The monastery swaps tents for pilgrim lean-tos and adds herb beds, stone lanterns, prayer flags, incense stands and animated monks at chores; its existing wells, shrines, statues, cloister and bells remain. Grounded arcades support the first terrace visually.

Seven support-loss tests reproduce a removed floor outside the active range: snuffer, lookout, two wights, marine, sworn sword and shardling each fall 80 pixels onto the lower floor. Marines no longer reset their height; wights follow footing, and these walkers settle before distance sleeping. Targeted floaters, spawn and decoration audits passed. Gate, terrace, cloister and Stormhold frames inspected. `npm run check` exit 0; all 23 checks passed, including the two new audits. Human traversal and final combat balance remain unverified.

## Item 6 — Kingswood and supported fixtures

Added THE HUNTING STANDS after the fired wood and THE OLD STONE before the processional: two climbable framed stands, rope bridge/swing, archers, a cuttable patrol stand, and a masonry gatehouse/aqueduct climb with a ram set piece. Older canopy platforms have legs and the swing logs remain. Standing props move to permanent bridge banks; a rule rejects props on breakable spans. Authored torches and perched lamps draw holders anchored in terrain, preserving dark lamps. Existing firepits stand on floors.

Two actual sword presses cut the stand, remove its deck and kill the patrol. Trap, pickup, spawn, elite and holder/bridge checks pass. The pixel pass caught a checkpoint intersecting a stair; moved it onto the ledge. Final `npm run check` exit 0, all 25 checks. Three views inspected. Curve introduces no new out-of-line steps; the pre-existing Fields/Mage steps remain.

King lab: knight 19.3s, pyro 22.7s, paladin 18.7s, pirate 39s killed; Warden timed out at 7%, Reaper at 49%. Previous-commit comparison also timed out Warden at 7%, with Reaper winning at 143.6s. These boss duration/bot reliability gaps remain explicitly open for item 13. Human route feel unverified.

## Item 7 — readable scenery and a hanging town

All pass-through scenery draws behind collision tiles with softened colour and stripped dark outer outlines. Solid tiles retain their outlines. The shared rough climb face now has a grip pose, clank and contact dust. Thirteen slung/stilt houses, two public halls, smoke, stalls, washing and a pulley basket give the village a town silhouette. Residents select doors on their own tier, fixing a market resident shutting a roots-tier door.

Five screenshots inspected. Live tests verified the correct door closure and a 24.8px/s wall grip. New readability and town tests are in the suite. `npm run check` exit 0, all 27 checks passed (outputs/07-check.log). Human traversal and combat feel remain unverified.
