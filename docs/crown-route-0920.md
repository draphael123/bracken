# The crown stays reachable after the wasp falls

The reported Bracken Wood cache was five tiles above its takeoff ledge. Its intended wasp bounce disappeared once the wasp was killed. Two permanent log steps now split the climb into two-tile, two-tile and one-tile rises, with coins indicating the route. The crown stays in its original place.

`tools/crown-route.mjs` starts each fresh class on the ground below the cache, removes enemies and marks ambushes complete to represent the cleared area, then uses only movement and held jump inputs. It asserts each landing and actual crown collection for all six classes, without teleporting during the climb or using attacks, skills, god mode or movement-stat changes. The test runs in `npm run check`.

The focused runtime test passed for all six heroes. The resulting scene was visually inspected. Static pickup and route checks report no stranded crown; this specifically closes a gap in geometry-only checks, which previously saw the crown platform as nearby footing without proving an enemy-independent route onto it.
