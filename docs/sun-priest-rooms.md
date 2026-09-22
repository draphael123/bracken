# The rooms the Sun Priest solves alone (`node tools/sun-priest.mjs`)

His beam powers sun-doors (docs/sun-priest-design.md), so in the two light levels some rooms are his without the sun. This is the
table the class batch decides from, room by room ("a Priest shortcut is fine if the room still says what it says"). **sun** = the
fewest mirror turns that open it with the sun (the best hour, in the temple); **priest** = the fewest with his beam alone, from the
best tile he can stand on, and where (E/W along the row, UP the column; the pyramid's y is rows above the gallery floor, the
temple's is the tile row).

**If his beam powered the doors, he would open 35 of 35 with no turn at all, and 35 with fewer turns than the sun.** Decided (Daniel, 2026-09-21): **sun-doors and plates answer to the sun only** (doorsLit), so the table below is the case against it, kept for the record.

**So as designed, his beam skips the arc's light puzzles.** A mirror always turns a beam 90 degrees, and he can come at it from
any side (UP from under it, or along its row from a ledge), so whatever state a mirror is in, some line of his reaches the plate.
The rule taken: **sun-doors and plates answer to the SUN only** (`lights().sun.hit`, the same rule as the Skeleton King). His beam
still lights the dark, burns the dead, shows the way and chips the King: it is his answer to the DARK, not to the puzzles.
(Alternatives: a few "priest rooms" per level where his beam is the intended key, or plates that need the sun AND his beam.)

| level | room | sun | priest | from |
|---|---|---|---|---|
| King's Pyramid | gallery 1 | 1 | 0 | UP from (12,0) |
| King's Pyramid | gallery 2 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 3 | 1 | 0 | UP from (24,0) |
| King's Pyramid | gallery 4 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 5 | 1 | 0 | UP from (24,0) |
| King's Pyramid | gallery 6 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 7 | 1 | 0 | UP from (24,0) |
| King's Pyramid | gallery 8 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 9 | 1 | 0 | UP from (12,0) |
| King's Pyramid | gallery 10 | 3 | 0 | UP from (4,0) |
| King's Pyramid | gallery 11 | 1 | 0 | UP from (24,0) |
| King's Pyramid | gallery 12 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 13 | 3 | 0 | UP from (47,0) |
| King's Pyramid | gallery 14 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 15 | 3 | 0 | UP from (47,0) |
| King's Pyramid | gallery 16 | 1 | 0 | UP from (4,0) |
| King's Pyramid | gallery 17 | 3 | 0 | UP from (47,0) |
| King's Pyramid | gallery 18 | 3 | 0 | UP from (4,0) |
| King's Pyramid | gallery 19 | 1 | 0 | UP from (24,0) |
| King's Pyramid | gallery 20 | 3 | 0 | UP from (4,0) |
| King's Pyramid | gallery 21 | 3 | 0 | UP from (47,0) |
| Sun Temple | chamber 1 | 1 | 0 | E from (13,20) |
| Sun Temple | chamber 2 | 1 | 0 | UP from (22,23) |
| Sun Temple | chamber 3 | 1 | 0 | E from (16,20) |
| Sun Temple | chamber 4 | 1 | 0 | UP from (27,23) |
| Sun Temple | chamber 5 | 1 | 0 | UP from (22,23) |
| Sun Temple | chamber 6 | 1 | 0 | UP from (27,23) |
| Sun Temple | chamber 7 | 1 | 0 | E from (4,20) |
| Sun Temple | chamber 8 | 1 | 0 | UP from (27,23) |
| Sun Temple | chamber 9 | 1 | 0 | UP from (22,23) |
| Sun Temple | chamber 10 | 1 | 0 | UP from (27,23) |
| Sun Temple | chamber 11 | 1 | 0 | E from (16,20) |
| Sun Temple | chamber 12 | 1 | 0 | UP from (22,23) |
| Sun Temple | chamber 13 | 1 | 0 | UP from (27,23) |
| Sun Temple | chamber 14 | 1 | 0 | E from (16,20) |

Levers if a room is too easy for him: move its plate off every row and column he can stand in line with; hang a pillar across his
line (the temple's chamber 6 does this to the sun already); or make the door a SUN-door proper (it answers to `lights().sun` only,
like the Skeleton King). The last is a one-word change per door and keeps the puzzle whole for everyone.
