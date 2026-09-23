# THE MAP: LIFE, AND A LEVEL SELECT THAT SHOWS THE ROAD

**This is a brief. Nothing here is built.** Daniel asked for it on 2026-09-24: *"more life to the overland map, and
adding a level select as a pop out that only shows level available"*.

**It is the other half of the map work.** `docs/briefs/map-redesign.md` (448 lines, on `claude/worldmap`) is the
STRUCTURAL half — where nodes sit, the desert sheet, spurs, and mandatory levels that read as optional — and its §10
says plainly that it does not touch "the side toggle menu, live motion, richer per-region art". That is this brief.

**IT IS SEQUENCED SECOND, AND DANIEL CHOSE THAT.** Both jobs live in `src/art.js` (`bakeMap`, `bakeWorldMap`) and
`main.js` (`drawMap()`, `updateMap()`). Drawing life against node positions that are about to move means drawing it
twice and a hard merge in the worst file in the repo. So: the structural redesign lands, then this.

---

## 1. THE POP-OUT

A panel that toggles open over the map: scroll it, pick a level, and the map goes to that node.

- **LOCKED LEVELS ARE SHOWN, GREYED, AND NOT SELECTABLE.** Daniel, 2026-09-24, choosing this over hiding them. The
  panel is a picture of the campaign and of your progress through it, not a list of what is currently clickable.
  A locked row should say **what unlocks it** — the `needs` level's name — because that is the whole value of
  showing it at all.
- It must not cover the token or the node you are standing on.
- Keyboard and controller reach it, not just the mouse: the map is already driven by `mapGo`.

**THE BUG THAT IS ALREADY IN THIS FEATURE'S PATH.** `docs/briefs/map-redesign.md` §8 records that `nodeLocked`
dereferences `LEVELS[-1]` and throws for a node whose level is not in `LEVELS`. **`nodeLocked` IS the availability
test this panel is built on**, so that is not an adjacent bug, it is the first line of this job. Fix it here rather
than around it, and leave a check behind — a convention nothing checks is a wish.

**THE BUFFER IS 320x180.** Measure every string with `textW`/`fitText`, never `len * 6`. `tools/textfit.mjs` is the
check that catches text running past its plate, and it needs the page. A scrolling list of up to 41 rows on a
180px-tall buffer is the hard part of this: decide how many rows are visible and how scrolling reads before writing
the art.

## 2. THE LIFE

`drawMap()` and `updateMap()`, not the bakers. **THE RULE THAT DECIDES WHERE CODE GOES: IF IT MOVES IT CANNOT BE
BAKED.** `bakeMap`/`bakeWorldMap` run once; anything animated belongs in the frame loop and must be driven by the
map's own clock rather than wall-clock time.

Daniel's own list, from `docs/QUEUE.md` lane B: **smoke off the towns, birds, water shimmer, torch flicker, a
pennant on the token.** Keep it cheap — this draws every frame on a menu screen that people sit on.

**Richer per-style art** across all five styles (wood, coast, crag, haunted, mark) is the last thing, not the first.
It is taste, it is the biggest time sink, and the structural brief is adding a SIXTH style for the desert — so
painting the existing five before that lands is work done twice.

## 3. ORDER, AND WHY

1. **The `nodeLocked` fix**, with a check. Everything else depends on the availability test being sound.
2. **The panel.** Menu before motion: it is the thing Daniel asked for that the game does not have at all.
3. **The motion.** Cheap, in the frame loop, on the map's own clock.
4. **The art.** Only after the desert sheet exists, and **render to PNG and send Daniel images before going far** —
   this is taste and he has said so twice about this lane.

**Node renders lie about light.** `tools/node-canvas.mjs` has no `globalCompositeOperation: 'lighter'`, so glows come
out flat. Torch flicker and shimmer are exactly the things it will be wrong about. Capture the running page for
those: `BK.step` renders and `BK.sim` does not, so capture only after 60+ step frames, and keep the browser pane
FRONTED or `BK.step` stalls without rAF.

## 4. WHAT I AM NOT DECIDING

- **How many rows the panel shows at once**, and whether it scrolls by row or by page. That is a feel call on a
  180px buffer and it wants to be seen rather than specified.
- **Whether a locked row shows its unlock condition as text or as an icon.** Text is clearer; 320x180 may not have
  room for 41 rows of it.
- **Whether the panel replaces the existing level-select interaction or sits beside it.**
- Anything in `docs/briefs/map-redesign.md` §7, which is six questions still waiting on Daniel and which block the
  structural half this one sits on top of.
