## Item 2 — flashing

Reproduced the full-height band in Stockade tiles 140–145 with the pyromancer: the foreground coverage state toggled at tile 142 and the old fade divided the band into rectangular brightness regions. Decorative trunks and parallax columns now draw softly behind the tiles and actors. Remaining near foliage uses one continuous radial mask rather than threshold-switched rectangles. Night-light code was inspected; this reproduction traced to the foreground composition, not a darkness-mask toggle.

Before/after frames inspected. `npm run check` exit 0 (19 checks); render-layer rule included in the suite. Unverified: Daniel's exact original screenshot location, which was not supplied, and a human playthrough.
