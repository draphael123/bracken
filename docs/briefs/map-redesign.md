# THE MAP REDESIGN — a brief

`docs/DESIGN.md` Part Four item 2, and `docs/QUEUE.md` lane B plus §3. **Nothing here is built.** There was no brief
for this, and the standing rule is that nothing gets built without one — so this is the brief. Read it, strike out
what you don't want, and the build is whatever is left.

> **DESIGN.md, on why this comes before the levels and not after:** *"29 nodes become 41, most in a region the map
> has never held. A layout built for 29 and stretched is how the mandatory Ore Road already came to read as a detour."*

**Scope:** the world map only — `src/main.js` 2873–3200 (the node tables, the road polylines, the walk and the draw),
`src/art.js` `bakeMap`/`bakeWorldMap`, and the map half of `tools/additional-areas.mjs`. No level changes. The lane B
cosmetics (side toggle menu, live motion, richer per-region art) are a separate job and are not costed here.

---

## 1. What is on the map today, counted

| region | sheet | level nodes | store nodes | spurs |
|---|---|---|---|---|
| INLAND | `INLAND_Y = 0` (top) | 6 | **0** | 0 |
| COAST | `COAST_Y = 180` | 8 | 1 | 0 |
| CRAG | `CRAG_Y = 360` | 8 | 1 | 1 (undercrown) |
| WOOD | `WOOD_Y = 540` (bottom) | 7 | 1 | 2 (burning, underleaf) |
| | | **29** | **3** | **3** |

Four sheets of 320×180 stacked into one 320×720 canvas, baked once into `MAPC`. Play runs bottom to top: the Wood,
the Crags, the Coast, the road inland. Four hand-written connectors carry the road across the three seams.

**The walk is a one-dimensional array index.** `mapGo(dir)` is `map.node + dir`; `NODE_AT[i]` snaps node *i* to the
nearest point of the global `PATH`; `updateMap` walks segments until it reaches that point. `NODES` order *is* the
campaign order, and `tools/additional-areas.mjs` already asserts that the `needs` chain agrees with it.

**`spur: true` does three things and none of them is traversal.** It moves the token onto the node instead of the road
(`mapPos`), it makes `bakeWorldMap` draw a short dashed stub from the nearest road point, and it is counted by the
check. Left and right still step *through* every spur in array order. There is no branch anywhere in this system.

---

## 2. What is measurably wrong, before a single new node is added

**a. Two required levels are drawn as dead-end limbs, and one of them is the Ore Road.**

`CRAG_PATH` after Stormhold: `[82,150] → [54,162] → [22,140] → [18,118] → [18,100] → [30,66] → [50,40]`. The road
leaves the body of the sheet, drops into the bottom-left corner and crawls up the left margin — with the Undercrown
**spur** hanging off it at (18,88), 12px from the road. The Ore Road node sits at x=18: six pixels off the edge of the
sheet. Daniel's verdict on this is already in `docs/QUEUE.md` §3. **A node in the margin at the end of a limb reads as
optional whatever its data says**, and the Ore Road's data is correct — `crown` has `needs: 'oreroad'`.

**b. Waymeet is the same bug, unnoticed, and it is worse.**

`INLAND_PATH = [[140,176], [95,172], [40,162], [95,172], [150,140], ...]`. The road enters the inland sheet at x=140,
runs 100px left to Waymeet, and **retraces the same two points back**. That out-and-back is drawn at full road weight
(8px dark, 5px sand). Waymeet's own source comment calls it *"a spur of its own"* — but it carries no `spur: true`,
and `THE HEXED FIELDS` has `needs: 'waymeet'`, so **the entire inland act is gated behind a node drawn as a
cul-de-sac.** This is §3's complaint with a second instance nobody has reported.

**c. The Undercrown gets both treatments at once.**

`CRAG_PATH` ends `... [30,66], [50,40], [38,54], [26,66], [38,54], [50,40]` — a literal out-and-back appended for the
Undercrown, comment and all. But `NODE_AT` resolves the Undercrown to `[18,100]` (**12.0px** away, global segment 38),
not to `[26,66]` (23.4px), so **the retrace the polyline exists for is not the road the walk uses.** Highcrown resolves
to segment **40**, so the Undercrown is the one node in the game whose segment goes *backwards* as its array index goes
forwards, and `updateMap` reaches it by overshooting and snapping. What the retrace does do is draw full-weight road to
the one node on that sheet that is genuinely optional, on top of its dashed stub — and make leaving the Undercrown for
the Coast walk the zig-zag twice.

Measured over the whole global `PATH`: **exactly three points are revisited** — `[38,414]`, `[50,400]` (the Undercrown
retrace) and `[95,172]` (Waymeet's). There are no others. Both retraces are the bug in 2a and 2b, and nothing else in
the map does this.

**d. The dotted "not yet walked" overlay is driven by the highest unlocked index.**

`let last = 0; for (let k = 0; k < NODES.length; k++) if (!nodeLocked(NODES[k])) last = k;` — one unlocked node late in
the array collapses the whole dotted section. A spur is precisely a node that unlocks out of order. At three spurs this
is a curiosity; at seven it is the feature switching itself off.

**e. `mapToSaved`'s legacy list is hand-maintained and grows with every node.**

`NODES.filter(n => !['harbor','burial','keep','fallingtower','burning','witchlight'].includes(n.id))` reconciles a
numeric `PROG.mapNode` from an old save against nodes added since. Twelve new nodes means twelve more strings in that
array, or old saves land on the wrong node — and nothing checks it.

**f. The label solver has no last resort.** Seven candidate offsets, and if all seven collide the label stays at the
default position and overlaps. The inland sheet already carries `THE WITCHLIGHT STAIR` and `THE MAGE'S FOLLY` 46px
apart on a 320px sheet.

**g. Small rot.** `CRAG_H` (`src/main.js:2873`) is declared and never read, and the comment on that line still says
*"three regions stacked"* with four in the list.

**h. Nothing in `bakeMap` can paint a desert.** Four styles: `wood`, `crag`, `coast`, `haunted`. A fifth sheet needs a
fifth, and the per-node scenery in `drawMap` (the queen over the Wood, the castle at Highcrown, the ram at the Scree
Path, the lamplit glow) is a hand-written list of ids — a new sheet with no entries paints as empty ground.

---

## 3. The one sentence

**The road is a spine, and a spur is a limb — and the map must never draw a spine as a limb.**

Three levers, each of which is allowed to say exactly one thing:

| lever | required | optional |
|---|---|---|
| **weight** | full road, 8px dark + 5px sand | dashed stub, 3px dark + 1px light |
| **continuity** | road enters the node and road leaves it | road enters and stops |
| **place** | in the body of the sheet | anywhere, including the margin |

And one rule that falls out of all three: **a road polyline never revisits a point.** Every out-and-back in `PATH`
today exists to serve a spur, and the dashed stub already serves it better.

That grammar is learnable in the Wood, where the Burning Village and Underleaf teach it on optional levels the player
can safely ignore, and it then reads on every sheet above.

---

## 4. Where the twelve new nodes go

### 4.1 A fifth sheet, on top: THE DESERT

`DESERT_Y = 0`, every other region +180, `MAPH = 900`. Appending the desert at the **end** of `NODES` (after INLAND)
keeps every existing index stable, which matters for `PROG.mapNode` (§2e). Note that the `NODES` concat order is play
order while the `bakeWorldMap` region array is drawn top-down — they are already opposites, and adding a fifth sheet
must not tempt anyone to make them agree.

Nine nodes, from `docs/desert-arc-brief.md` and the greyboxes in `src/draft/`:

| # | node | kind | indicative (x,y) | note |
|---|---|---|---|---|
| 1 | THE SUNKEN CARAVAN | level | 248,158 | the doorway node — see §5 |
| 2 | THE WELL TOWN | level | 206,146 | the arc's hub |
| 3 | *(the desert store)* | store | 170,136 | **open — see §7.2** |
| 4 | THE RED GORGE | level | 136,120 | |
| 5 | THE GLASS SEA | level | 92,102 | |
| 6 | **THE SUN TEMPLE** | level, `spur: true` | 34,62 | optional, forks off the Glass Sea; gates the Sun Priest |
| 7 | THE BURIED CITY | level | 98,58 | |
| 8 | THE SEALED PYRAMID | level | 150,44 | |
| 9 | THE KING'S PYRAMID | level | 248,14 | the Skeleton King, at the top of the world |

`DESERT_PATH = [[274,174], [248,158], [206,146], [170,136], [136,120], [92,102], [60,78], [98,58], [150,44], [206,30], [248,14]]`

One entry at the bottom-right, one continuous S that climbs to the apex, no retrace. The Sun Temple's junction is
`[60,78]` at 30.5px — inside the 4–44px band `tools/additional-areas.mjs` already enforces, and 70px from the next
nearest road point, so the snap is not fragile. **Every coordinate in this brief is indicative and wants a rendered
sheet before it is believed** (`ART.bakeWorldMap` is the only thing that can show label crowding).

### 4.2 Three class-level spurs

`docs/QUEUE.md` §3: *"each gets `spur: true` the day it is placed."*

- **THE UNBURIED FIELD** — off **THE WITCHLIGHT STAIR**, stated in the greybox's own header
  (`src/draft/unburied-field.js:1`: *"the optional Death Knight level off the Witchlight Stair"*). Inland sheet,
  indicative (140,44), junction the Witchlight node at 34.4px.
- **THE CHURCH** — off **WAYMEET**, which its own design requires: it renames Waymeet's boss to THE CRUSADER so the
  church's boss can be THE PALADIN (`docs/briefs/hero-kits.md` §7). Inland sheet, indicative (28,134), junction
  Waymeet at 30.5px.
- **THE POWDER DECK** — coast sheet, off **THE HURRICANE DECK**, indicative (128,52), junction at 27.1px.
  **This one is a reading, not a fact — see §7.3.**

### 4.3 The counts do not reconcile, and this matters

- Today: **29 level nodes, 32 nodes** (three stores).
- The queue's eleven: eight desert + three class levels.
- Proposed: **40 level nodes, 44 nodes** (four stores).

`docs/DESIGN.md` and `docs/QUEUE.md` §2b both say **41**. 29 + 11 = 40. Either one more level is intended than the
queue lists, or 41 counts the desert store while 29 does not count the three that exist. **Nobody should build to 41
until that is settled** (§7.1).

---

## 5. How the desert attaches

The road leaves the inland sheet at THE FALLING TOWER (260,34), which is already the last point of `INLAND_PATH`. A
fifth connector joins it to the desert sheet's entry at `[274,174]`, so the seam crossing runs almost straight up at
x≈260–274. The other three seams already work exactly this way.

**And the doorway is told, not just drawn.** `docs/DESIGN.md`: *"the sandy path at the end of THE FALLING TOWER is its
doorway."* That phrase appears in `docs/DESIGN.md` and `docs/QUEUE.md` and **nowhere in the level** — there is no sandy
path in `buildTowerAscent` today. Two halves, and they are separable:

1. **On the map (this brief).** The seam connector is drawn in the road's browns for the three existing seams; the
   desert connector is drawn in sand (`#c9b27c` over `#e0d0a0`, the same pair `bakeMap` already uses for the road's
   surface and its pebbles), and the seam gradient between INLAND and DESERT goes green-to-gold instead of the
   grey-green it uses now. The road changes material as it crosses. One `bakeWorldMap` argument, no new art.
2. **In the level (NOT this brief).** If the Falling Tower is to end on sand, that is a level change and wants its own
   brief. **Flagged, not proposed** (§7.4).

---

## 6. How a mandatory level stops reading as optional

In force order. The first two are the whole answer; the rest keep it true.

**1. Delete both retraces.** `CRAG_PATH`'s Undercrown out-and-back and `INLAND_PATH`'s Waymeet out-and-back are the
only two places a road polyline revisits a point, and both are drawn at full road weight. Neither is used by the walk
that motivated it (§2c). Remove them and let the dashed stub be the only way the map draws going out and coming back.

**2. Put required nodes in the body of the sheet.** A margin rule — no road point within 24px of a sheet edge except
the entry and exit — and the Ore Road corner goes away.

*Indicative crag tail (replacing indices 17–27):*
`... [108,144], [82,150] storm, [60,132], [44,112] oreroad, [36,88], [44,64], [50,40] crown`
with the Undercrown moved to (24,54), junction `[44,64]` at 22.4px, hanging down-left out of Highcrown's cellars as
its fiction says. One climb, no corner, no margin, no retrace, and the Ore Road sits on it with road on both sides.

*Indicative inland (replacing the whole polyline):*
`[[140,176], [40,162] waymeet, [74,126] fields, [112,96] burial, [160,72] witchlight, [214,76] mage, [260,34] tower]`
The road enters bottom-right, runs left along the bottom **through** Waymeet, then climbs right. An L, not an
out-and-back. It moves three nodes (fields, burial, witchlight) and it makes the required town a place you pass
through. Two cheaper variants and their costs are in §7.5.

**3. Give each sheet one direction.** The road advances and turns at most twice. A node you pass through is required;
a node you step off to is optional. Once that holds the grammar is the map's, not each sheet's.

**4. Fix the dotted overlay** to follow the road from the last *required* node walked, not from the highest unlocked
index (§2d). Otherwise seven spurs switch it off.

**5. Cap the spur stub.** The check's band is 4–44px, and 44px is long enough for a stub to read as a second road on a
320px sheet. Measured, today: the Burning Village **24.2px**, Underleaf **24.2px**, the Undercrown **12.0px**. Nothing
live uses more than 25, so the band is nearly twice as loose as anything in it, and **the number the map actually uses
is about 24.** The four new spurs in §4 are sited at 27–34px and should be pulled in to match once the cap is agreed —
they are drawn that long only because §4's coordinates were chosen for room, not for the cap. A number for Daniel, and
then a straightforward adjustment of four pairs of coordinates.

---

## 7. NEEDS DANIEL — do not decide these alone

**7.1 Is it 40 or 41?** §4.3. The queue lists eleven levels; DESIGN.md says twelve nodes. If there is a twelfth level,
naming it changes the desert sheet's layout. (STORMWRECK HARBOR is the only unmapped level in `LEVELS` and is
**shelved on purpose** — `docs/QUEUE.md` §6 — so it is not the answer unless Daniel says it is.)

**7.2 Does the desert get a store *node*, or does the Well Town carry the shop inside it?** Every region above the
Wood has a store node on the road (`shop`, `shopCrag`, `shopSea`) — but `docs/desert-arc-brief.md` says the Well Town
*is* the arc's shop and hub, which would make it an in-level shop with no node. **And the inland sheet has no store at
all, which is its own question**: six levels, nothing to spend on, and F7 asks for a shop or a shrine inside the arc.

**7.3 Which level does THE POWDER DECK hang off?** Its brief is in the ignored directory `docs/QUEUE.md` §2 describes
— it is in no commit, and `tools/dangling-paths.mjs` lists that hole every run. All this repo knows is
`docs/QUEUE.md` §2: *"An optional ship level going between decks, unlocking doors — deliberately not a fourth
above-deck level."* THE HURRICANE DECK is the obvious host and is what §4.2 proposes, but **that is a guess about a
document no clone has** and it should be confirmed rather than built on. Same directory, same caveat, for anything
else the class-level briefs decided about placement.

**7.4 Does the Falling Tower actually get a sandy ending?** §5. The phrase is in two design documents and in no level.
If yes it is a level brief of its own; if no, the map carries the whole doorway and the phrase should come out of
`docs/DESIGN.md` and `docs/QUEUE.md` so nobody builds to it.

**7.5 Waymeet: re-route the inland road, or move the seam?** §6 proposal 2 moves three nodes and keeps the seam at
x=140. The alternative is to move the COAST→INLAND connector to the left so the road arrives *at* Waymeet — cleaner in
principle, but the coast sheet's top-left already holds THE LAMPLIT STREET and its road, and a new leg up to x≈44
passes within about 5px of the Hurricane-to-Lamplit road. Two 8px roads 5px apart merge into one. **The cheap third
option is to move Waymeet right, onto the road between the seam and the Hexed Fields** — that shrinks the limb from
100px to about 28px without removing it, and it changes where the town *is*, which is fiction and not layout.

**7.6 Do left and right step through a spur, or past it?** `mapGo` skips secrets and unearned hidden levels and
nothing else, so today you walk through every optional node to reach the next required one. At three spurs that is
fine. At seven — four class levels plus Underleaf, the Undercrown and the Burning Village — it is most of the road.
If spurs should be stepped *onto* rather than through, that needs an input, and up/down are already taken by the
difficulty toggle.

**7.7 How much of the desert sheet is worth painting now?** `docs/QUEUE.md` §2b, on scope: *"eleven levels is months
at the pace this has gone."* A fifth `bakeMap` style plus per-node desert scenery is real work for a sheet with no
playable levels on it yet.

---

## 8. Landing order — and the thing that blocks it

**No node can be added before its level exists.** `NODES` rows read `LEVELS.findIndex(l => l.id === '…')`, which is
**−1** for a level that is not in `LEVELS`; `nodeLocked` then dereferences `LEVELS[-1]` and throws on the map's first
frame. None of the twelve levels is in `LEVELS` today — the eight desert levels and the Unburied Field exist only as
greyboxes in `src/draft/`, and the Powder Deck and the Church have neither.

So "the map before the levels" cannot mean shipping forty-four rows. It means **decide the layout now, land the
geometry now, and let each node row arrive with its level**:

1. **The grammar and the geometry.** The two retraces deleted, the crag tail and the inland road re-routed, the margin
   rule, the dotted-overlay fix, the spur cap. Twenty-nine levels, no new ones. **This is the item that fixes the Ore
   Road, and it is worth landing on its own.**
2. **The fifth sheet, empty.** `MAPH = 900`, the region offsets, the desert `bakeMap` style, the sand-coloured seam,
   the connector from the Falling Tower — with `DESERT_NODES = []`. A sheet you can scroll onto and see, with nothing
   on it yet. Costs nothing later and proves the seam.
3. **The check** (§9), which locks 1 and 2 in before anything is stretched again.
4. **Each node row, with its level**, at the coordinates this brief reserved — plus its id in `mapToSaved`'s legacy
   list and, if it has a `needs`, its pair in the check's ordering list.

---

## 9. The check that makes it stick

The repo's own answer to this class of problem — `tools/dangling-paths.mjs`: *"not a fix to the row, a check that
fails the next one."* The map already has one, in `tools/additional-areas.mjs` (every non-spur node on the road to the
pixel, every spur 4–44px off its junction, at least three spurs, the `needs` chain in `NODES` order). It should grow,
or a sibling should sit beside it, asserting:

- **no road polyline revisits a point** — catches both retraces, today;
- **a non-spur node has road on both sides of it** — i.e. its `NODE_AT` index is neither the first nor the last point
  of its region's polyline, unless it is a seam entry or exit. Catches the Ore Road's corner and Waymeet's limb;
- **no road point within 24px of a sheet edge**, except an entry or exit;
- **each region's road turns at most twice** (a direction-change count on the polyline);
- **the spur stub is within the agreed cap**, once §6.5 is settled;
- **every node's `level` index is ≥ 0** — the −1 crash in §8, which would have been caught the first time anyone
  added a node ahead of its level;
- **every node id added since the last save format is in `mapToSaved`'s legacy list** — §2e, currently guarded by
  nothing but memory;
- **every label places without overlap** at every sheet, by running the same solver `drawMap` uses.

The last one is the only expensive one and it is the one that will actually fail when the sheet gets to forty-four.

---

## 10. What this brief does not touch

The lane B cosmetics (`docs/QUEUE.md`): the side toggle menu, live motion, richer per-region art. The desert sheet's
scenery beyond "it needs a style". Any level. Any `needs`, `coinNeeds`, `spur` **data** decision already made in
`docs/QUEUE.md` §3 and §4 — those are settled and this brief only draws them.
