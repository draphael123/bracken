# STORMHOLD, THE CASTLE TOWN — brief (lane S, 2026-09-24)

**Status: BRIEF + BUILT ON `claude/stormhold`, NOT MERGED. Daniel reviews before it ships.**

Daniel: *"Stormhold is too short, and I think should look more like a castle town. Some areas where you climb watchtowers
to get keys to get through gates would make the level more interesting."*

Where it sits: **Gale Moor -> THE ORE ROAD (116) -> STORMHOLD -> HIGHCROWN (124).** Today Stormhold is 430 columns (span
478), INDEX 116, four sections (Under Street, Smoke Row, the Halls, the Long Bridge) plus a pass of extras (the Chimneys,
the feast). Its three keys are all indoors and its three "watchtowers" (horn / weight / camp-gate levers, commit 0ddf270)
are side-climbs with nothing you need at the top.

This also absorbs **THE CURTAIN WALL** (`.claude/briefs/stormhold-extension.md`, agreed 2026-09-22, greybox in
`src/draft/curtain-wall.js`): the climb up the outside of the town wall becomes section 6 and the third tower stands on it.
The Lance's two new attacks from that brief (THE HOOK, CALLING THE BOLT) are **not** in this branch - they are a boss job
and stay queued.

---

## 1. THE ONE SENTENCE (F8)

> **STORMHOLD IS LOCKED FROM ABOVE: every gate's key hangs at the top of a watchtower, and the tower's rope is the way
> back down to its gate.**

Level card rule: **`THREE GATES. EVERY KEY HANGS IN A WATCHTOWER.`**

Said three ways (C4):
1. **You SEE it from the gate.** Each tower wears a lit brazier and the key's gold glow on its top deck, and each gate is in
   sight of its tower - you stand at the lock plate and look up at what you need.
2. **The gate SAYS it.** The lock plate reads LOCKED; the way-on arrow points at the key, which is up; the sign at the foot
   of every tower names the key it holds and the gate it opens.
3. **The ROPE draws it.** A slide-rope runs from every tower top down to the foot of its own gate. You can follow the line
   with your eye from the gate to the key, and once you hold the key the rope is the fast way back (UP grabs it, JUMP lets
   go). The ladder down always works too: the reach model does not ride ropes, so nothing depends on one.

## 2. SEVEN SECTIONS, FIVE PLACES (F1, F2, F4)

~650 columns (was 430). Street rows step up the mountain as before: the road stands on row 35, the town on 31, the Halls
on 29, the wall-walk on 23, the bridge on 29. Rows 0-18 stay the indoor band (house interiors, `indoorRow: 18`).

| # | section | cols | what you do there | kind (F4) |
|---|---|---|---|---|
| 1 | **THE ROAD IN** | 0-89 | snow road under the town wall, the first cottages (the Hearth House, open on the latch), **THE GATE WATCH** (tower 1, brass key), the **barbican** gate | fight -> **climb** |
| 2 | **THE MARKET SQUARE** | 90-179 | stalls, a well, bunting between the houses, a market cross; **the ambush room**; a rooftop road over the square with its archer; the Smithy's door | **ambush** |
| 3 | **SMOKE ROW** | 180-269 | forges and tanneries, sappers and a brute; **THE CHIMNEYS** (the sootworks gorge, stacks a hop apart, sweeps) | fight -> **crossing** |
| 4 | **THE BELL CLOSE** | 270-349 | a churchyard close under **THE BELL WATCH** (tower 2, iron key): in through its arch, or over the roofs to its window | **climb** |
| 5 | **THE HALLS** | 350-429 | the officers' houses, **the Longhouse** feast, **THE KEEP GATE** portcullis on its winch (F5), the Pike Serjeant elite | fight + machine |
| 6 | **THE CURTAIN WALL** | 430-521 | down the sally stair into the gorge, **up the face of the town wall** (sills and ledges, ~20 rows), the wall-walk and its wall towers, **THE WALL WATCH** (tower 3, bone key) | **climb** -> fight |
| 7 | **THE LONG BRIDGE** | 522-651 | seven spans, six piers, the Queen's Lance (unchanged, shifted right) | boss |

**The five places (F2):** the Gate Watch, the Market Square, the Chimneys, the Bell Watch, the Longhouse - with the
Curtain Wall and the Long Bridge as the two the level ends on. Every one is a thing you DO (climb it, fight in it, cross
it, sit at its table and cut its chandeliers down, walk its wall).

## 3. THE WATCHTOWERS

A watchtower is a place you **climb for a reason**: the key is on its top deck, beside a brazier, and the rope off its top
lands you at the foot of the gate that key opens. Each is always LEFT of its gate (the rope runs east, as the tower-slide
code does), and the gate column is sealed from the indoor band to the street, so the only way through is the key.

| tower | key | height | how you get up | what is on the climb | on top | down |
|---|---|---|---|---|---|---|
| **THE GATE WATCH** (timber, outside the barbican) | brass | 12 rows | two rope ladders in a switchback with a landing between | a sprig on the landing; **one Scalder** over the upper ladder - the lesson: step onto the landing when his pot tips | key, brazier, the Scalder in reach of your sword | rope to the barbican gate, or the ladders |
| **THE BELL WATCH** (stone, the close) | iron | 11 rows | EITHER through its arch and up the shaft (three ladders, ledges alternating sides) OR up the lean-to, over three roofs, to a window halfway up | **two Scalders** stacked over the shaft; an archer on the far roof shooting at the shaft windows; a harpy round the top | key, brazier, the bell | rope over the close to the iron gate |
| **THE WALL WATCH** (stone, on the curtain wall) | bone | ~23 rows (gorge -> wall -> tower) | down the sally stair, up the wall face on sills and ledges, the wall-walk, then the tower's own ladder | **Scalders in the wall's murder holes** pouring down the face; archers in two wall towers; the Pike Serjeant's line on the walk | key, brazier | rope down to the bone gate at the bridgehead |

The three climbs escalate by what is overhead, not by jump difficulty: one pourer and a landing to hide on; two pourers,
a shooter across the gap and a second route; then a wall where the whole face is poured on and the top is held.
Every step on every climb is two rows (E4); every tower has a ladder back down; a fall lands on the street or the gorge
floor, which has a ladder out (B3, C5).

The old tower payoffs (horn, weight-lever, camp-gate lever) go: a tower with a key on it is the answer to "why climb".
`tools/watchtowers.mjs` is rewritten to assert the new contract: three towers, three keys, each key on its tower's top
deck, each rope ending left of the gate its key opens, and the ladder reaching the top.

## 4. THE LOOK - A CASTLE TOWN AT NIGHT IN SNOW (F6)

Neighbours: the Ore Road is a brown timber-shored **cavern**; Highcrown is a grey-granite **castle interior** with purple
hangings. Stormhold is the one between them that is **outdoors and lived in**:

- **Stone townhouses**, not goblin huts: courses of pale honey limestone (warm, not the Queen's blue granite), a timber
  jetty under the eaves, shuttered windows lit amber, a door and a hanging shop sign. New front baker
  (`src/stormhold-town.js`, `h.stone`); the snowy slate roofs stay and are still walkable - **the rooftops are a road**.
- **Walls with towers**: the barbican and the curtain wall are laid stone (`L.masonry`), with crenellated wall faces and
  drum towers drawn behind the play (`L.facades`, in the same warm stone - a new `town` palette on the facade baker, so it
  is not Highcrown's granite).
- **A market square**: stalls, a well, bunting strung between the houses, a market cross, lanterns on posts.
- **Palette**: night sky over snow, the old crag range and the castle drawn far behind (`castle: true`), warm window light
  against cold snow and blue-black slate. No cave brown, no purple.
- New ground kit: cobbled street, snow on everything flat, the goblin camp dressing thinned to what an occupying army
  leaves (pennants, stakes, spear racks) over a real town's furniture.

## 5. THE NEW FOE (F10): THE SCALDER

**Gap:** nothing in the roster attacks **the climb**. Every foe in BRACKEN fights you on a floor or shoots across one; on a
ladder you are only ever in danger from a stray arrow. A level about climbing towers needs the thing that makes a ladder a
place you think about.

**THE SCALDER** - a squat goblin behind a pot of boiling pitch on the lip of a landing, a ladle in his fist.
- **POUR** (`pourTell` 0.7 s, **red `!!`**, steam boils over the pot, the pot tips toward the drop): when you are BELOW
  him in his column (within ~a tile either side), he tips it and a gout of pitch falls straight down. Unblockable - it
  comes from above. It hurts what it touches, and where it lands it burns for a moment (a short fire on the footing).
  **Answer:** step off the ladder onto a landing, time the climb between pours (he refills: 2.8 s, visible - he stirs the
  coals), or come up beside him instead of under him.
- **LADLE** (`ladleTell` 0.45 s, yellow `!`): level with him he swings the hot ladle - a short, blockable poke.
- 26 health. Weak once you are up; the danger is the approach. Weighed **2.5** in `src/threat.js` (an archer's reach
  aimed down a column; less than a soldier because he never leaves his post).
- Own silhouette (the pot is the shape), own death voice (the pot goes over, a hiss), own hurt voice; bestiary row.
- Where (as built): one on the Gate Watch, two in the Bell Watch, one on the hoarding over the curtain wall's face, one on
  the Wall Watch - five.

## 6. THE MACHINE (F5): THE KEEP GATE PORTCULLIS

In the Halls, the passage to the curtain wall runs under a **portcullis held up on a winch** (the kennel winch, `winch`
with `drop: true`, already in the game). Strike the winch and the gate comes down on whatever is under it; it winds itself
back up after six seconds. A line of pikes marches through that passage - drop it on them, twice if you like. It changes
the room (the passage shut or open), is usable any number of times, and is worth using. The Long Bridge's fire cages
remain the boss's machine.

## 7. THE AMBUSH ROOM (Q): THE MARKET SQUARE

The square is the room (~40 tiles between the gates, row 31): shut in among the stalls. Captain: **THE PIKE SERJEANT**
(pike, elite) - the level's own roster; crowd: two sprigs, a cutter, a hearth goblin. Door checkpoint outside the west
gate. (It replaces THE HEARTH HALL, which was on Smoke Row.) The ELITES pike keeps holding a gate in the Halls; it is not
back to back with the ambush.

## 8. THE BOSS

**THE QUEEN'S LANCE stays**, on the same Long Bridge, built by the same code, only shifted right by the new sections (the
arena is relative, `updateLance` reads `L.arena`). He is the right boss for this level: the town's last gate opens on his
bridge. His HOOK and BOLT attacks are the separate queued job from the 2026-09-22 brief.

## 9. FURNITURE (F7, B6, R)

- Three hill folk (quest strays) in the Smithy, the Tannery and the Longhouse; three silvers (one on the Market's rooftop
  road, one in the Bell Watch's window, one on the bridge); relic unchanged (`shoes`, quest reward).
- Checkpoints every <= ~70 columns, one at the barbican door, one outside the ambush, one at each tower's foot, one on the
  wall-walk, one at the bridgehead outside the arena.
- Dead ends paid by `payDeadEnds`; signs two lines max.

## 10. NUMBERS

- **Length:** ~650 columns (F1 400-700), span ~700.
- **INDEX target: 118-122** (Ore Road 116 before it, Highcrown 124 after). Today 116 at 31.2 threat/100 over 17 kinds.
  Holding the same density over the longer level, plus one new kind, lands ~119-121; GARRISON is the dial.
- Foes a screen: match the neighbours (B7), ~3.5-4.5, with the climbs lighter and the square/halls heavier (F4).

## 11. WHAT IS REUSED, WHAT IS NEW

Reused as-is: lock gates and keys, doorways and the indoor band, the slide-ropes (`zipLines`, `updateTowerSlides`),
drawn tower frames (`structures`), the drop-winch, the Chimneys, the Longhouse and its chandeliers, the Long Bridge and the
Lance, the ambush runtime, the facade baker, masonry skinning.

New: the level builder (moved to `src/stormhold-town.js` so the rebuild does not churn `level.js`), the stone house
front, the town facade palette, THE SCALDER (update, sprite, tells, voice, bestiary, threat), `tools/watchtowers.mjs`
rewritten for keys.

## 12. PARKED FOR DANIEL (with a recommendation each)

1. **Should any key stay indoors?** The old rule was "every key is indoors". Recommended: **no** - one rule the level says
   one way (C2); the houses keep the hill folk and the loot, so going indoors still pays.
2. **The Gate Serjeant mini** from the Curtain Wall brief. Recommended: **not in this pass** - the Pike Serjeant elite
   already holds the wall-walk, and a mini back to back with the ambush breaks Q2.
3. **Lightning rods on the wall-walk** (same brief). Recommended: **leave for the Lance job** - they are the setup for his
   CALLING THE BOLT, and building one without the other teaches a rule that pays off nowhere.

---

## 13. AS BUILT (branch `claude/stormhold`, 2026-09-24)

- **`src/stormhold-town.js`** builds the level (the old `stormhold()` is gone from `level.js`); 672 columns, span 720.
  **INDEX 120** (Ore Road 116 before it, Highcrown 124 after), 18 kinds, 31.6 threat a hundred, worst checkpoint gap 57.
- Every climb was checked two ways: the reach model (`tools/keys.mjs`, `tools/reach.mjs`, the new
  `tools/watchtowers.mjs`) and the real physics (the curtain wall's zig-zag was jumped sill to board to the hoarding by
  scripted input in the page). The ladders were moved so no rope leaves from the top of a ladder: UP at the top of a
  ladder used to grab the rope and throw you off the tower before you had the key.
- **The camera looks up a ladder** in this level (`L.climbLook`): from the landing the Scalder and his red mark are on the
  screen before his pitch is. Without it he stood six rows above the top of the picture.
- **The look**: stone house fronts (`src/redraw/stone-town.js` `bakeStoneFront`), gabled town rows standing behind the
  square, the close, the Halls and the road (`bakeTownRow`, facade kind `townrow`), the walls in the monks' warm limestone
  (`L.masonryKit`), a cobbled street (the village tile set), a market of counters, shelves, kegs, hay, a cart and a well.
- **The bot** (`src/playtest.js`) now fetches a key from a tower: a shut gate whose key is outdoors sends it up the nearest
  ladder toward the key instead of to a door.
- **Walked (F9)** with `work/stormhold/walk.mjs`, knight and warden, no god mode, start to the win screen: all three keys,
  all three gates. The bot cannot fight a locked room or the Lance, so the ambush and the boss were cleared for it, and it
  was lifted past its own limits (the chimney shafts, a ladder it would not line up on, the shield captain) - every one
  logged. Knight 4 deaths, warden 6.
- **Where the build differs from the plan above:** sections 6 and 7 are 430-543 and 544-671 (the wall section runs 114
  columns); the Wall Watch is timber, standing on the wall's east end; the gated elite is a SHIELD CAPTAIN on the wall-walk
  holding the way to the Wall Watch (the ambush captain is already a pike, and Q3 wants a different type next door); the
  Bell Watch's harpy went (two pourers and the archer across were enough); the curtain wall's face is a zig-zag between the
  masons' old scaffold and the wall's own sills, with one Scalder on a hoarding, not a ladder; the market is counters and
  shelves, not stalls (the only `stall` sprite is the Mage's Folly's).
- Screens: `docs/stormhold/before-*.png` (the old level) and `docs/stormhold/after-*.png` (this one), from the real page.
