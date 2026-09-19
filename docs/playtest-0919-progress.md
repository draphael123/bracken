## Item 2 — flashing

Reproduced the full-height band in Stockade tiles 140–145 with the pyromancer: the foreground coverage state toggled at tile 142 and the old fade divided the band into rectangular brightness regions. Decorative trunks and parallax columns now draw softly behind the tiles and actors. Remaining near foliage uses one continuous radial mask rather than threshold-switched rectangles. Night-light code was inspected; this reproduction traced to the foreground composition, not a darkness-mask toggle.

Before/after frames inspected. `npm run check` exit 0 (19 checks); render-layer rule included in the suite. Unverified: Daniel's exact original screenshot location, which was not supplied, and a human playthrough.

## Item 3 — pyromancer heat

Successful direct hits grant 12 heat, jet hits 4, and attributed burn ticks 1.5; the meter's variety floor is 85%. Missed swings, shots and skills no longer grant cast-time heat, and an empty jet cannot fill it. Hits refresh a four-second grace; cooling is 3/s afterwards. Pilot Light, Inferno and the banked-pyre behavior remain.

Fight lab sequence (sprig, shield, brute, archer): peaks 13.8, 31.8, 87.05, 100, with exactly one fill; all foes killed. Before this change, the first three peaked at 11.9, 7.58 and 28.34 with no fills. Empty swings and a six-second held jet measured zero heat. Timing/floor regressions are part of the check. `npm run check` exit 0, all 20 checks passed. Unverified: extended human balance playtest and multiplayer burn attribution.
