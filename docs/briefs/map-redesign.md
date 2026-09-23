# THE MAP REDESIGN — a brief

`docs/DESIGN.md` Part Four item 2, and `docs/QUEUE.md` lane B plus §3. **Nothing here is built.** There was no brief
for this, and the standing rule is that nothing gets built without one — so this is the brief. Read it, strike out
what you don't want, and the build is whatever is left.

> **DESIGN.md, on why this comes before the levels and not after:** *"29 nodes become 41, most in a region the map
> has never held. A layout built for 29 and stretched is how the mandatory Ore Road already came to read as a detour."*

**Scope:** the world map only — `src/main.js` 2873–3200 (the node tables, the road polylines, the walk and the draw),
`src/art.js` `bakeMap`/`bakeWorldMap`, the map half of `tools/additional-areas.mjs`, and one new check,
`tools/map-grammar.mjs` (§9). No level changes. The lane B cosmetics (side toggle menu, live motion, richer per-region
art) are a separate job and are not costed here.

### What Daniel has answered, and what each answer changed here

| he said | what moved in this brief |
|---|---|
| **Waymeet's location is fine.** | §2b rewritten so the defect is the POLYLINE and not the place, and §6 2b now moves **one** node — THE HEXED FIELDS — with Waymeet, the seam, the Burial Caverns, the Witchlight Stair, the Folly and the tower all staying put. The two options that moved the town or the seam are **withdrawn**. |
| **The doorway is a portal in the Archmage fight, not a sandy ending.** | §5 rewritten around the portal. It also **corrects an error in this brief's first draft**: the sandy path is real and already shipped — it is in `src/sanctum.js`, which I had not read, not in `buildTowerAscent`, which I had. |
| **THE POWDER DECK attaches to THE FLOTILLA**, `needs: 'flotilla'`, per the written brief. | §4.2 carries the Flotilla siting and nothing else; the Hurricane Deck alternative is **withdrawn**. §7.3 keeps the record of why it was a real question. |
| **`.claude/briefs/` has landed** (`5493df8`). | THE UNBURIED FIELD, THE CHURCH and THE POWDER DECK are confirmed from their own briefs instead of inferred. |
| **§7.1: 40, there is no twelfth level** (2026-09-24). | Build to **40 level nodes, 43 nodes** (the three existing stores, see §7.2). The "41" in DESIGN.md and QUEUE §2b was a counting slip. |
| **§7.2: the Well Town IS the desert's shop** — no store node. | Row 3 of §4.1's table is **deleted**: eight desert nodes, not nine. `DESERT_PATH` keeps `[170,136]` only as a bend in the road, not a stop. The inland sheet's missing store is still its own unasked question. |
| **§7.5: step PAST spurs; the side level-select panel reaches them.** | `mapGo` left/right walk the required road only and skip every `spur: true` node. The way onto a spur is the lane-B side toggle menu, so that menu is **no longer cosmetic**: without it, spurs become unreachable. It has to land with (or before) the `mapGo` change, never after. |
| **§7.6: sheet + style only.** | Step 2 of §8 as written: the fifth sheet, a desert `bakeMap` style, the green-to-gold seam and the sand road from THE FALLING TOWER. **No per-node desert scenery** until each level lands. |
| **§7.4: reading (a)** — the existing gold out portal leads to THE SUNKEN CARAVAN. | No fight change. §5 step 2 is a `needs:` link and a node, nothing more. |

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

**This one is the road AND the place**, which is what separates it from (b) below: 18px from the edge of a 320px sheet
is the margin, and no re-drawing of the polyline moves it out of there.

**b. WAYMEET IS DRAWN AS A CUL-DE-SAC. WAYMEET'S POSITION IS NOT THE PROBLEM.**

*(Daniel, on the first draft of this brief: the town's location is fine. It is. Nothing in this brief moves it, and the
first draft buried that under two alternatives that did. Stated plainly this time, because the defect is in one array.)*

**The defect is one line of `src/main.js`, line 2917:**

```
const INLAND_PATH = [[140, 176], [95, 172], [40, 162], [95, 172], [150, 140], ...];
                                  ^^^^^^^^^             ^^^^^^^^^
                                  the same point, twice
```

The road enters the inland sheet at `[140,176]`, walks out to Waymeet at `[40,162]`, and then **walks back over the
points it just came in on.** `bakeMap` draws every segment of that array at full road weight — 8px dark, 5px sand — so
the return leg is painted on top of the outbound one and the whole entrance reads as a limb with a town on the end of
it. **Waymeet is at exactly the right place; the road is drawn going nowhere and coming back.**

And it is required, twice over:

- `src/level.js:7176` — `{ id: 'fields', name: 'THE HEXED FIELDS', … needs: 'waymeet' }`, verbatim.
- `tools/additional-areas.mjs:30` — a **green suite check** asserts it:
  `for (const [a,b] of [['causeway','waymeet'], ['waymeet','fields'], …]) assert.equal(LEVELS.find(l=>l.id===b).needs, a)`.

*(This was queried as unreproducible. Both lines are above; `grep -n "needs: 'waymeet'" src/level.js` returns
7176. A search for `needs:'waymeet'` without the space, or one restricted to the map section of `src/main.js`, finds
nothing — the gate is on the LEVEL, not the node.)*

So the entire inland act is gated behind a node the map paints as a dead end. It carries no `spur: true` — correctly —
yet its own source comment calls it *"a spur of its own"*, which is how the polyline came to be written that way. This
is `docs/QUEUE.md` §3's complaint with a second instance nobody has reported, and **the fix is the polyline** (§6, 2b).

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
| 6 | **THE SUN TEMPLE** | level, `spur: true` | 44,64 | optional, forks off the Glass Sea; gates the Sun Priest |
| 7 | THE BURIED CITY | level | 98,58 | |
| 8 | THE SEALED PYRAMID | level | 150,44 | |
| 9 | THE KING'S PYRAMID | level | 248,14 | the Skeleton King, at the top of the world |

`DESERT_PATH = [[274,174], [248,158], [206,146], [170,136], [136,120], [92,102], [60,78], [98,58], [150,44], [206,30], [248,14]]`

One entry at the bottom-right, one continuous S that climbs to the apex, no retrace. The Sun Temple's junction is
`[60,78]` at **21.3px**, inside the cap proposed in §6.5 and 61px from the next nearest road point, so the snap is not
fragile. **Every coordinate in this brief is indicative and wants a rendered sheet before it is believed**
(`ART.bakeWorldMap` is the only thing that can show label crowding).

### 4.2 Three class-level spurs

`docs/QUEUE.md` §3: *"each gets `spur: true` the day it is placed."* **All three briefs are now in the repository**
(`.claude/briefs/`, landed in `5493df8`), so these are confirmed from source rather than inferred.

- **THE UNBURIED FIELD** — off **THE WITCHLIGHT STAIR**. `.claude/briefs/unburied-field.md`, first line and §"Where it
  sits": *"A side road off THE WITCHLIGHT STAIR on the world map, revealed when the Stair is cleared. Optional: it
  gates nothing … `needs: 'witchlight'`."* Inland sheet, node **(158,46)**, junction the Witchlight node (170,66) at
  **23.3px**; next nearest road point 63px away.
- **THE CHURCH** — off **WAYMEET**. Confirmed by its own design: it renames Waymeet's boss to THE CRUSADER so the
  church's boss can be THE PALADIN (`.claude/briefs/the-lit-church.md`, `docs/briefs/hero-kits.md` §7). Inland sheet,
  node **(32,140)**, junction Waymeet (40,162) at **23.4px**; next nearest 35px.
- **THE POWDER DECK** — off **THE FLOTILLA**, settled by Daniel and matching its own brief:
  `.claude/briefs/the-powder-deck.md` §Placement, *"A prize ship at anchor off THE FLOTILLA, on the coast sheet beside
  its node: `{ id: 'powder', name: 'THE POWDER DECK', needs: 'flotilla' }`."* Coast sheet, node **(232,36)**, junction
  the Flotilla (220,55) at **22.5px**; next nearest road point 61px. `needs: 'flotilla'`. (§7.3 keeps the record of
  why this had to be asked.)

### 4.3 The counts do not reconcile, and this matters

- Today: **29 level nodes, 32 nodes** (three stores).
- The queue's eleven: eight desert + three class levels.
- Proposed: **40 level nodes, 44 nodes** (four stores).

`docs/DESIGN.md` and `docs/QUEUE.md` §2b both say **41**. 29 + 11 = 40. Either one more level is intended than the
queue lists, or 41 counts the desert store while 29 does not count the three that exist. **Nobody should build to 41
until that is settled** (§7.1).

---

## 5. How the desert attaches: THE DOORWAY IS A PORTAL, AND IT IS ALREADY BUILT

**The best statement of what the map work is for is already in the game, in `src/sanctum.js:25–26`:**

> *"THE SANDY PATH is dressing and nothing else: **no map node, no `needs:` link, no level behind it.** It is the last
> ten seconds of the world, and it is warm and full of sand, because the next world is."*

**A map node, a `needs:` link and a level behind it are exactly what this brief places.** The doorway does not need
building; it needs somewhere to go.

> Daniel, now: *"The falling tower needs a portal that takes you to the sandy level, and that's the final phase of the
> undead archmage fight. There are portals that move you through the fight."*

**Correction to the first draft of this brief, which said there was no sandy path.** There is, and it is shipped. It
lives in `src/sanctum.js`, not in `buildTowerAscent` — I looked in the tower's ascent builder and reported an absence
from the wrong file. What the code actually has, today:

- The Archmage's sanctum has **two portals** (`src/sanctum.js`, `drawPortal`, `PORT`). The **in** portal stands where
  the rug used to lie and is violet — *"a well going down into his tower"*; boarding the carpet carries you through it.
  The **out** portal is gold — *"a hole full of MORNING … so that after a whole level of violet night you can see where
  it goes before you reach it."*
- `openSanctumDoor` is called from `src/main.js:18106` **when the Archmage falls**, and it opens where he fell,
  *"because the hole he leaves IS the way out, and it is walked into, never pressed, so it cannot be missed."*
- Walking into it (`updateSanctum` → `ctx.leave`, `src/main.js:13620`) sets `L.sandWalk` and puts you on
  `L.sanctum.sand` — **the sandy path** — with `drawSandDawn` painting dunes at sunrise behind it, and the level's GATE
  rather than the kill is what ends the level (`src/main.js:7079`).
- Daniel, quoted at the head of `src/sanctum.js`: *"When the boss ends you enter a portal which takes you to the goal,
  which is on a sandy path"*, and on the sand itself: *"wink at the desert, which will be the next set of levels."*

So the doorway is built, told, and gold — and the comment at the top of this section is the module's own account of
what it is still waiting for. The seam work is therefore small:

1. **On the map (this brief).** The road leaves the inland sheet at THE FALLING TOWER (260,34), already the last point
   of `INLAND_PATH`. A fifth connector joins it to the desert sheet's entry at `[274,174]`; the seam runs almost
   straight up at x≈260–274, exactly as the other three do. **The connector is drawn in sand, not road-brown** —
   `#c9b27c` over `#e0d0a0`, the same pair `bakeMap` already uses for the road's surface and its pebbles — and the
   INLAND/DESERT seam gradient goes green-to-gold instead of the grey-green the others use. The road changes material
   as it crosses, answering the gold portal on the level side. One `bakeWorldMap` argument, no new art.
2. **In the fight (NOT this brief).** `THE SUNKEN CARAVAN` becomes the node the out portal leads to, with
   `needs: 'fallingtower'`. Whether that means the existing out portal simply now *goes somewhere*, or a new portal
   during a late stage of the fight, is a fight question — **see §7.4, which is narrower than it was, not closed.**

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

**Here the NODE has to move and not only the road**, which is what separates the Ore Road from Waymeet below: at
(18,118) it is 18px from the edge of a 320px sheet, and no polyline redrawn around it takes it out of the margin.
Moving it inboard to (44,112) is the direct answer to Daniel's own complaint in `docs/QUEUE.md` §3.

**2b. Waymeet — the road is redrawn and the town does not move.**

**Waymeet stays at (40,162). The seam stays at x=140. THE BURIAL CAVERNS, THE WITCHLIGHT STAIR, THE MAGE'S FOLLY and
THE FALLING TOWER all stay exactly where they are.** One node moves, and it is not the town.

*Proposed `INLAND_PATH` (`src/main.js:2917`):*

```
[[140,176], [40,162] waymeet, [62,122] fields, [130,82] burial, [170,66] witchlight, [214,76] mage, [260,34] tower]
```

The road enters bottom-right, runs left along the bottom **through** Waymeet, and then climbs away to the right. An L
with one turn, no repeated point, and the required town is a place you pass through rather than the end of a limb.

**Why something has to move at all, since the town does not.** Deleting the duplicated `[95,172]` is not enough on its
own. With Waymeet at (40,162) and THE HEXED FIELDS at its present (150,140), the road still has to come in from
`[140,176]` and go back out to `[150,140]` — two full-weight 8px roads whose legs are within about 14px of each other
for most of their length. They would overlap into one fat limb and read exactly as they do now. **The road can only
leave Waymeet in a new direction if the node after Waymeet is in a new direction**, so:

> **THE HEXED FIELDS moves from (150,140) to (62,122)** — up-left of Waymeet instead of back across the entrance. It is
> the only node in this fix that moves, and the fiction survives it: the farms sit under the Archmage's hill, and the
> hill (the Folly, the tower) is still up and to the right of them.

If even that one move is unwanted, the fallback is to accept the V and narrow it — but the V is the defect, and
narrowing it only makes the limb shorter, not a road.

**3. Give each sheet one direction.** The road advances and turns at most twice. A node you pass through is required;
a node you step off to is optional. Once that holds the grammar is the map's, not each sheet's.

**4. Fix the dotted overlay** to follow the road from the last *required* node walked, not from the highest unlocked
index (§2d). Otherwise seven spurs switch it off.

**5. Cap the spur stub at 24px.** The check's band is 4–44px, and 44 is long enough for a stub to read as a second road
on a 320px sheet. Measured, today: the Burning Village **24.2px**, Underleaf **24.2px**, the Undercrown **12.0px** —
nothing live uses more than 25, so the band is nearly twice as loose as anything in it, and **24 is the number the map
already uses.** Every spur proposed in §4 has been sited to fit it:

| spur | junction | stub | next nearest road point |
|---|---|---|---|
| THE SUN TEMPLE (44,64) | `[60,78]` | 21.3px | 61px |
| THE UNBURIED FIELD (158,46) | witchlight (170,66) | 23.3px | 63px |
| THE CHURCH (32,140) | waymeet (40,162) | 23.4px | 35px |
| THE POWDER DECK (232,36) | flotilla (220,55) | 22.5px | 61px |
| THE UNDERCROWN, re-sited (24,54) | `[44,64]` | 22.4px | 29px |

So the cap costs nothing: it is a tightening of the check from 44 to 24 and not a redesign. The "next nearest" column
matters as much as the stub — a spur whose two nearest road points are a pixel apart has a `NODE_AT` junction that can
flip under any later edit to the polyline.

---

## 7. NEEDS DANIEL — do not decide these alone

**7.1 Is it 40 or 41?** §4.3. The queue lists eleven levels; DESIGN.md says twelve nodes. If there is a twelfth level,
naming it changes the desert sheet's layout. (STORMWRECK HARBOR is the only unmapped level in `LEVELS` and is
**shelved on purpose** — `docs/QUEUE.md` §6 — so it is not the answer unless Daniel says it is.)

**7.2 Does the desert get a store *node*, or does the Well Town carry the shop inside it?** Every region above the
Wood has a store node on the road (`shop`, `shopCrag`, `shopSea`) — but `docs/desert-arc-brief.md` says the Well Town
*is* the arc's shop and hub, which would make it an in-level shop with no node. **And the inland sheet has no store at
all, which is its own question**: six levels, nothing to spend on, and F7 asks for a shop or a shrine inside the arc.

**7.3 SETTLED — THE POWDER DECK attaches to THE FLOTILLA.** Daniel, choosing the written brief's reading:
`needs: 'flotilla'`. §4.2 has the siting. Kept here rather than deleted, because *why* it had to be asked is worth
remembering when the next placement is read off a brief:

- `.claude/briefs/the-powder-deck.md` §Placement says Flotilla — but that section is headed **PROPOSED**, and the
  brief's own preamble says *"decisions marked PROPOSED are Daniel's to change"*. Its pitch
  (`.claude/briefs/the-powder-deck-pitch.md`, open question 1) left it genuinely open: *"a wreck reachable from the
  Flotilla, or a sail-away from Stormwreck Harbor?"*
- Daniel, in passing since: *"after the stormy ship level, as an optional level."* The pitch's other option,
  **Stormwreck Harbor, could not host it** — shelved on purpose, and the one level in `LEVELS` with no map node
  (`docs/QUEUE.md` §6). And **`src/storm-ship.js` is not a level**: it is `stormShipPolish`, a dressing pass whose
  first line is `if(!['flotilla','hurricane'].includes(id)) return L`, so "the storm ship level" resolves in code to
  *both* ship levels and chose neither.

**The lesson, for the next time:** a `PROPOSED` heading means a brief records a preference, not a decision, and a
remark in passing does not overrule a written brief in either direction. Ask.

**7.4 — SETTLED 2026-09-23: reading (a).** Daniel: the gold out portal that already opens when the Undead Archmage falls
now LEADS to THE SUNKEN CARAVAN (`needs: 'fallingtower'`, a map node, no fight change). No mid-fight portal, no boss brief owed.

**7.4 "The final phase of the undead archmage fight" — which moment, exactly?** *(the question as it was asked)* §5 shows the doorway is already built:
a gold out portal that opens when he falls and puts you on the sandy path. Daniel's phrasing — *"that's the final phase
of the undead archmage fight"* — has two readings, and **the map is identical under both**, so this blocks nothing here:

- **(a) The portal that already exists now leads somewhere.** `openSanctumDoor` fires at `src/main.js:18106` on his
  death, which is the end of the fight; `src/sanctum.js` already calls the sand *"the last ten seconds of the world"*.
  This is a `needs:` link and a map node — no fight change at all.
- **(b) A new portal during a late stage of the fight**, before he dies. That is a boss change and wants its own brief.
  Worth saying that `src/undead-mage.js` has **no `phase` or `stage` field** (125 lines, zero matches for either), so
  there is no "final phase" in the code to hang it on yet — it would have to be built.

(a) is what the code and Daniel's earlier quote at the head of `src/sanctum.js` both describe. If he means (b), this
brief is unaffected and a fight brief is owed.

**7.5 Do left and right step through a spur, or past it?** `mapGo` skips secrets and unearned hidden levels and
nothing else, so today you walk through every optional node to reach the next required one. At three spurs that is
fine. At seven — four class levels plus Underleaf, the Undercrown and the Burning Village — it is most of the road.
If spurs should be stepped *onto* rather than through, that needs an input, and up/down are already taken by the
difficulty toggle.

**7.6 How much of the desert sheet is worth painting now?** `docs/QUEUE.md` §2b, on scope: *"eleven levels is months
at the pace this has gone."* A fifth `bakeMap` style plus per-node desert scenery is real work for a sheet with no
playable levels on it yet.

---

## 8. Landing order — and the thing that blocks it

**No node can be added before its level exists.** `NODES` rows read `LEVELS.findIndex(l => l.id === '…')`, which is
**−1** for a level that is not in `LEVELS`; `nodeLocked` then dereferences `LEVELS[-1]` and throws on the map's first
frame. None of the twelve levels is in `LEVELS` today — the eight desert levels and the Unburied Field exist only as
greyboxes in `src/draft/`, and the Powder Deck and the Church have briefs (`.claude/briefs/`, landed in `5493df8`)
but no greybox.

So "the map before the levels" cannot mean shipping forty-four rows. It means **decide the layout now, land the
geometry now, and let each node row arrive with its level**:

1. **The grammar and the geometry.** The two retraces deleted, the crag tail and the inland road re-routed, the margin
   rule, the dotted-overlay fix, the spur cap. Twenty-nine levels, no new ones. **This is the item that fixes the Ore
   Road, and it is worth landing on its own.**
2. **The fifth sheet, empty.** `MAPH = 900`, the region offsets, the desert `bakeMap` style, the sand-coloured seam,
   the connector from the Falling Tower — with `DESERT_NODES = []`. A sheet you can scroll onto and see, with nothing
   on it yet. Costs nothing later and proves the seam.
3. **`tools/map-grammar.mjs`** (§9), which locks 1 and 2 in before anything is stretched again.
4. **Each node row, with its level**, at the coordinates this brief reserved — plus its id in `mapToSaved`'s legacy
   list and, if it has a `needs`, its pair in the check's ordering list.

---

## 9. `tools/map-grammar.mjs` — the check that makes it stick

The repo's own answer to this class of problem — `tools/dangling-paths.mjs`: *"not a fix to the row, a check that
fails the next one."* The map already has half of one, in `tools/additional-areas.mjs` (every non-spur node on the road
to the pixel, every spur 4–44px off its junction, at least three spurs, the `needs` chain in `NODES` order) — but that
tool is mostly about the Harbor and Burial levels and the map rules are a tenant in it. **`tools/map-grammar.mjs` is
the sibling: the grammar of §3, enforced.** It needs no page and no port — `tools/additional-areas.mjs:17` already
shows how to read `NODES`/`NODE_AT`/`PATH` out of `src/main.js` with `vm.runInContext`, and this tool is that trick
and nothing else. Add it to the list in `tools/check.mjs:74`. It asserts:

- **no road polyline revisits a point** — catches both retraces, today;
- **a non-spur node has road on both sides of it** — i.e. its `NODE_AT` index is neither the first nor the last point
  of its region's polyline, unless it is a seam entry or exit. Catches the Ore Road's corner and Waymeet's limb;
- **no road point within 24px of a sheet edge**, except an entry or exit;
- **each region's road turns at most twice** (a direction-change count on the polyline);
- **the spur stub is within the agreed cap** — the band tightened from 4–44 to 4–24 (§6, item 5), plus **the next
  nearest road point is at least twice the stub away**, so a `NODE_AT` junction cannot flip under a later polyline
  edit;
- **every node's `level` index is ≥ 0** — the −1 crash in §8, which would have been caught the first time anyone
  added a node ahead of its level;
- **every node id added since the last save format is in `mapToSaved`'s legacy list** — §2e, currently guarded by
  nothing but memory;
- **every label places without overlap** at every sheet, by running the same solver `drawMap` uses.

The last one is the only expensive one and it is the one that will actually fail when the sheet gets to forty-four.

*(This tool went unnamed in the first two drafts. `b70847c` exempted briefs from citation scanning but covered
`.claude/briefs/` only, so naming a not-yet-written file from `docs/briefs/` would have failed
`tools/dangling-paths.mjs`. **`ea4a04f` widened the exemption to `docs/briefs/` as well**, on the grounds that the
split between the two directories is an accident of which machine a file was written on — so a brief in either one may
now name the work it is asking for, which is what a brief is.)*

---

## 10. What this brief does not touch

The lane B cosmetics (`docs/QUEUE.md`): the side toggle menu, live motion, richer per-region art. The desert sheet's
scenery beyond "it needs a style". Any level. Any `needs`, `coinNeeds`, `spur` **data** decision already made in
`docs/QUEUE.md` §3 and §4 — those are settled and this brief only draws them.
