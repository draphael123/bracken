# THE MONASTERY REWORK — grounded, themed, and a goblin priest worth learning (Daniel, 2026-09-25)

> "A lot of the Monastery's architecture floats (walls, arches, buildings, towers, platforms of masonry with nothing
> under them). Ground all of it." — "It should read as a monastery, not generic stone." — "Make goblin priests a real
> enemy of this level."

Level id `spire` (`theMonastery()` in `src/level.js`), 96 x 222, climbed bottom to top. **The route does not move.**
Every tile the hero stands on, every checkpoint, the braziers, the wheels, the hoist, the bells, the golem's hall, the
Cloister ambush and the Abbot's belfry keep their coordinates. Chunks 1 and 2 are drawn BEHIND the play (facades, rooms,
props); chunk 3 adds creatures and a kit, not geometry. The rule line stays: **WHAT THE MONKS BUILT STILL ANSWERS A
BLOW. CLIMB.**

## What is wrong today (measured, not remembered)

A whole-level capture of the real page (`docs/monastery/before-*.png`) shows it plainly: the level is nine floor slabs,
each three rows of stone spanning wall to wall, with open sky under almost every one of them. The towers stand on their
own doorways, the cloister stands on a slab over nothing, the chapel's floor is a shelf in the air, and the belfry roof
is a ninety-tile beam held up by the two side walls. Below the cloud the slabs are grass-topped crag, so the lower half
reads as the Scree Path cut into strips, not as a building.

## CHUNK 1 — NOTHING THAT WAS BUILT STANDS ON NOTHING (the rule, then the level)

**The rule, `tools/architecture.mjs` (in the suite as `architecture`).** `floaters` sets every PROP down; nothing asked
the same of the STRUCTURE. The check reads what each level declares BUILT - `masonry` (laid stone tiles), `facades`
(wall faces drawn behind the play), `structures`/`watchtowers` (posts, pillars, frames), `houses`, `stone` (menhirs) -
and runs a load path from the bottom of the level up:

- a cell is **held from below** when the tile under it is the mountain (natural rock), a held piece of structure, or a
  room (a grounded interior carries its own ceiling); or when it is laid stone keyed into the mountain beside it or hung
  from the mountain over it;
- a cell is **carried by a lintel** when an unbroken run of structure reaches it from a held cell within `SPAN = 4`
  tiles (two piers eight apart carry a seven-tile arch). Carried cells hold themselves and nothing above them, so a slab
  cannot corbel four tiles further out with every course;
- a facade that says `spans: true` is ONE ARCH: it stands if both its springings stand, whatever its width (the arches
  between the bell towers);
- a post, a house or a standing stone needs a column with ground under it within `SPAN` of every column it has.

Natural rock is the mountain and is not judged (see the question at the end). Levels that fail the day it lands are
named in the tool's grandfather list with what fails and why, and a listed level that passes fails the check until its
entry comes out, so the list can only shrink. The Monastery is NOT on the list: it is fixed here.

**The Monastery's floors become what they are: built.** Every floor slab is tagged laid stone (`masonry`), so the rule
judges all of them and they draw as the monks' limestone instead of grass-topped crag. Then each storey gets what holds
its floor up, behind the play:

| storey (rows) | under the floor at | what holds it |
|---|---|---|
| gatehouse (199-217) | 196 | the gate tower and curtain walls (there already) + **the guest-house arcade** 29-71 behind the pilgrims' stair |
| herb garden (175-195) | 172 | **the garden's retaining wall**: coursed, buttressed every 8 tiles, an espalier on it |
| scriptorium, refectory | 152, 132 | the rooms themselves (interiors wall to wall: already held) |
| bell yard (118-131) | the tower walls | **tower feet**: the doorway through each tower's foot gets its arch and the wall over it stands on the tower face behind |
| bell arches (103-117) | 100 | **the three towers rise to the cloister** (the belfry is an open stage in a tower now, not a hut on top of one) and **two great arches** span between them; the flue becomes a chimney stack |
| cloud cloister (83-99) | 80 | **the cloister range**: the arcade walk below, the dormitory gallery over it, across the ledge |
| upper shrines (59-79) | 56 | **the shrine piers**: a pier every 8 tiles, each with a niche, the prayer-flag lines strung between them |
| chapel storey (39-55) | 36 | **the chapel** rises to the next floor (a gable with the rose window over the hall), **buttresses** either side |
| the crawl (35) | 30-34 | **stubby piers** every 8 tiles in the crawl, holding the belfry floor over it |

Checks that must stay green on this chunk: the new one, plus every level check (none of it touches the grid).

## CHUNK 2 — IT READS AS A MONASTERY: ELEVEN PLACES UP ONE MOUNTAIN

Each place is a room with its own furniture, its own backdrop and one landmark you would tell somebody to meet you at.
Mostly existing art (the Hexed Fields' graves, the Folly's desks and candles, Waymeet's long tables) plus a handful of
new monastery pieces; the per-level sprinkler stops scattering herb beds on the belfry and the chapel floor (zoned kits).

| # | place (floor row) | landmark | furniture |
|---|---|---|---|
| 1 | THE GATEHOUSE (217, west) | the gate tower, its fallen portcullis | pilgrims' lean-to, the guest-house arcade |
| 2 | THE MONKS' GRAVEYARD (217, east + the ossuary cellar) | the lychgate and the yew | headstones, crosses, bones in the ossuary |
| 3 | THE HERB GARDEN AND THE ORCHARD (195) | three fruit trees and the beehives | herb beds, bean poles, skeps, garden walls, the well, the incense braziers |
| 4 | THE SCRIPTORIUM (171) | the prayer wheel under the copyists' desks | writing desks, candles, lecterns, book piles, shelves |
| 5 | THE REFECTORY (151, loft, walkway) | the reader's pulpit (the old reading loft) | long tables, benches, the kitchen hearth; the book hoist is the kitchen hoist |
| 6 | THE DORTER (131, between the towers) | the row of cell doors | cots, the looters' camp in the monks' beds |
| 7 | THE BELL TOWERS (117) | three belfries and the arches between them | the bells, bell ropes |
| 8 | THE CLOUD CLOISTER (99) | the arcade in the sun | the garth, the dormitory gallery over the walk |
| 9 | THE UPPER SHRINES (79) | the prayer flags on every line | shrines in the piers, the bellows braziers, the scaffold shrine |
| 10 | THE CHAPEL (55, the golem's hall) | the rose window | stained-glass lancets, the guardian's statue |
| 11 | THE BELFRY (29) | the great bell | untouched: the Abbot's room |

**The squire's lines** (Tam) still talk about the glass mountain and the Roc. Rewritten around the Abbot and the bells:
the Hanging Village's closing line points at the monastery and its bells; the Monastery's opening lines say who took
it (a goblin in the abbot's chair) and what answers him (the monks' bells); the closing lines say the great bell rang;
the map lines and the bead errand likewise. The level's first sign stops blaming the Roc.

## CHUNK 3 — THE GOBLIN PRIEST, A REAL ENEMY OF THIS LEVEL

Today the priest (`gobpriest`, `updateGobPriest`) has one move, the rite, and "alone it is a free kill". It stays a
support unit - the rite is still the thing it is about, at the TOP of its chain (E2) - but it gets an answer at every
range, so meeting one is a small fight and not a chase:

| move | mode | mark | what it does |
|---|---|---|---|
| THE RITE | `riteTell` 1.5 s | none (QUIET: it strikes nobody) | unchanged: censer up, bell rung; every goblin in the smoke is mended and BLESSED (takes half) for 6 s. **Any blow breaks it.** |
| THE CENSER | `censerTell` 0.65 s | `!` yellow | at 56-170 px: the censer swung back, then thrown on its chain in a lob that lands where you stood. A shield turns it. It is the Abbot's cast, one size down. |
| THE BELL | `bellTell` 0.45 s | `!` yellow | inside 30 px: it swings the hand bell into you, a short shove to make room, then backs off. A shield turns it. |

Each has its own pose (four new frames: censer back, censer out, bell up, bell swung; the hurt pose stays last), its
own sound, a mark written by hand in `src/marks.js` and then `node tools/tells.mjs --write`, and sits in `windingUp()`.
`tools/gob-priest.mjs` lifts `updateGobPriest` out of `src/main.js` and forces every move (A3): each fires, each lands
what its mark promises, a blow on the rite breaks it and mends nobody, and every priest in the Monastery stands with a
flock to bless. The bestiary row says what it does now.

**Placed so the rite is something you learn to interrupt**, one lesson a floor, always with goblins to bless:

1. the herb garden (26,195): the first one, between two rock goblins, and the terraces' sign says what the robe does;
2. the scriptorium (74,171): behind the troll, so the blessed thing is the big thing;
3. the refectory (17,151): saying grace between the rock goblin and the sentry;
4. the dorter (61,131): with the two looters over the bead;
5. and 6. the upper shrines (41,79 and 57,79): already there, the pair;
7. the crawl (80,35): the garrison's own.

## Proving it

- `node tools/architecture.mjs` fails on the old Monastery (13 pieces, 934 cells) and passes on the new; it lists every
  other level's hits (the grandfather list) for Daniel.
- F9: walk it with the knight and the Warden in the page (the bot, and by hand in the harness) start to gate.
- The Abbot, piloted before and after (bossLab, normal health, six heroes, three salted passes): nothing in his room
  changes, so the win rate and the median time must not move beyond the dice.
- INDEX before/after (`tools/curve.mjs`): 92 before; four more priests will raise it a little, and that is said, not hidden.
- Before/after real-page captures in `docs/monastery/`.

## Questions this brief leaves for Daniel

- Natural rock is not judged by the architecture rule. The same load path over the mountain's own rock would catch a
  crag slab over sky, but it would also have to learn caves, overhangs and hanging rock, and on the Monastery every slab
  is built now. Worth doing as a second rule?
