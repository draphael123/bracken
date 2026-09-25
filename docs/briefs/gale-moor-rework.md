# GALE MOOR — the rework

Daniel approved the review's plan on 2026-09-25 (`level-review/group-a.md` §9, verdict *needs work*) in three parts.
This brief is written before any of it is built, and each part is its own commit, green at every push:

1. **Cut it to about 700 columns**, keeping its best places and landmarks and dropping the dead stretches.
2. **The wind becomes a real mechanic**: told gusts over pits, with a rhythm you learn, used in three different ways,
   taught safely first, and carried into the Windcaller's fight where it fits the A rules.
3. **Checkpoints**: one on firm ground past the kite ride, so that no walked stretch runs past 150 route tiles. Gale
   Moor's KNOWN line in `tools/checkpoint-gaps.mjs` goes, and the kite-ride soft-lock stays fixed.

The level keeps its id (`moor`), its place in `LEVELS` (an append log, so no index moves), `needs: 'spire'`, its map node
and its place in the campaign. The level editor and Boss Rush are parked and are not touched.

---

## 0. What is measurably wrong (origin/master e7846f3)

| | now |
|---|---|
| size | **996 columns** (908 built, then two `grow()`s: +48 at 240 for the Wind Rivers, +40 at 558 for the Downdraft Cliff) |
| pacing (`tools/pacing.mjs moor`) | 958 route tiles: 19 EMPTY stretches and 45 light ones out of 120 |
| INDEX (`tools/curve.mjs`) | **115**. The Monastery before it is 92, the Ore Road after it is 114. |
| worst checkpoint run | **187 route tiles** from route 753 (the kite post to the landing at 952), on the KNOWN list |
| the wind | 13 gust zones. It is **required** in four places (the Gallery, the Whistle Stones, two headwinds). The mill gust is scenery (k 0.35), two Flag Road zones overlap and stack, and a gust's only warning is a 0.5 s blink at the screen edge. On the ground a gust is nothing: the legs' 1000 px/s² beat its 320. |
| the kite | one untaught 194-column ride over a gorge of spikes it never lets you touch |
| hand-written columns | `AMBUSH.moor` (walls 596–633), `ELITES.moor` (168 and 432), `tools/moor-wind.mjs` (W 996, x1 952, rope 283, rail 250, cliff 583), `tools/route-breaks.mjs` (rope 583), `tools/checkpoints.mjs` (952,12) |

**What works and stays:** the Wind Rivers' air rail, the Downdraft Cliff (already a timed wind you climb in the lull),
the Mills' sails, the Kite Field and its three lost kites (the quest), the Stone Circle and its silver, the Bothy,
the Cairn Ridge ambush, the Tumble's bales and hornblowers, the Sky Road and the Windcaller's kit.

## 1. The one sentence (F8)

> **THE WIND COMES IN GUSTS, AND YOU CAN HEAR EACH ONE COMING.**

The banner's rule line becomes that sentence. It is said three ways (C4):

- **You see it.** Before every gust the flags lift, a streak of blown heather gathers at the edge it will come from and
  runs in over the pit, and a chevron at the pit's edge blinks the beats.
- **You hear it.** A rising whistle through the stones, a second and a fifth before the gust lands; the gust itself
  is the existing roar.
- **You feel it.** A told gust shoves: on the ground it walks you back off a ledge, in the air it carries you, and you
  hold still only by bracing (hold the guard key on the ground, C for every hero).

## 2. The cut (part 1)

Seven named sections of 60–100 (F1), then the summit. Everything is written in its FINAL column, relative to its
section's origin, and the builder no longer calls `grow()`. The ambush room and the elites move into the builder, so
no table outside it holds a Gale Moor column.

| | section | columns | what it is |
|---|---|---|---|
| 1 | THE MOOR GATE & THE CAUSEWAY | 0–91 | still air, the squire; planks over the bog. **Gusts taught here, over a bog that cannot hurt you.** |
| 2 | THE STONE CIRCLE & THE BOTHY | 92–149 | the silver on the centre stone; Tam's lee, **cleared of foes** (a `calm` box) |
| 3 | THE KITE FIELD & THE WIND RIVERS | 150–253 | the three lost kites on their posts; the air rail |
| 4 | THE BRACING STONES & THE GALLERY OF GUSTS | 254–361 | **new**: the climb from row 20 to 14 on stones over a thorn gully, into a headwind; then the gallery |
| 5 | THE DOWNDRAFT CLIFF & THE MILLS | 362–454 | the review's "move the cliff next to the mills so they read as one windy section" |
| 6 | THE CAIRN RIDGE & THE TUMBLE | 455–534 | the ambush room, then bales and hornblowers |
| 7 | THE KITE POST & THE SKY ROAD | 535–654 | the ride, cut from 194 columns to 104 |
| – | THE SUMMIT | 655–702 | the Windcaller's room, 48 wide as before |

**Cut:** the Ridge Run (60; its climb is the Bracing Stones now), the Howling Gap (96) and the Whistle Stones (72) —
the review's own finding that they say the same thing as the Gallery — and 90 columns of the Sky Road (the teeth, the
flock, the organ pipes and the storm each keep their best stretch). **Kept whole:** everything in "what works" above.

**Density.** The garrison is a fixed count, so a level cut by 30% with the same garrison is 40% denser. It is cut in
proportion (23 to 16), and the INDEX is kept between the Monastery (92) and the Ore Road (114): above the first by less
than a wall (26) and below the second by no more than a collapse (8).

## 3. The told gust (part 2)

A gust zone may say `told: true`. Its clock is the old one (`period`, `on`, `phase`, `alt`), plus:

- **The build-up** (`TELL` 1.2 s before `on`): the flags lengthen and flutter, heather streaks gather at the upwind
  edge of the zone and run in, a chevron at that edge blinks, and `SFX.gustRise` plays once if you are within 260 px of
  the zone. The screen-edge chevrons (`windFx.soon`) run for the whole build-up instead of the last half second.
- **The shove** (`shove` px/s): while it blows and you are inside it, your speed is pulled toward `dir × shove` (fast on
  the ground, a little slower in the air). Unbraced on a two-tile stone, a headwind walks you off it in a quarter of a
  second; jumping into a tailwind carries you nine or ten tiles instead of six.
- **The brace**: on the ground with the guard key held, the gust cannot move you (you can still shuffle at 40 px/s). The
  same key for every hero, so the answer never depends on a kit (F3).
- **Where it acts**: in the player's own update (`updateMoorWind`), after the legs and the ground's friction and before the
  move. Anywhere later and the friction eats it: the Windcaller's old howl, applied from his own update, came to 17 px/s.

**One rhythm.** Every gust on the moor that shoves keeps the same beat, period 5: 1.2 s of build-up, 1.8 s of gust, 2 s of
still air. Crossings differ in phase, direction and what they ask, not in tempo.

**Four uses, in order:**

1. **Taught, safely — THE CAUSEWAY.** Over the bog (a wade, never a wound). First a tailwind over an eight-tile gap, two
   tiles wider than a jump: *ride it*. Then a headwind over two posts, three short hops that one still spell holds: *cross
   in the still air*.
2. **Brace — THE BRACING STONES.** Seven stone tops climbing out of a thorn gully into a headwind, eight short hops. The
   crossing takes longer than one lull, so you stand on a stone through a gust: brace, or it puts you in the thorns (20, and a walk
   back along the gully under the stones and a two-row climb to the near ledge).
3. **Ride and cross — THE GALLERY OF GUSTS.** An eight-tile thorn pit with a tailwind over it, then three posts over a
   second pit into a headwind (four hops: cross in one still spell if you are quick, or brace on a post).
4. **The Downdraft Cliff** keeps its own clock, and gets the same build-up, so it reads as the same wind.

**The reach model learns the ride.** A zone that says `carry: n` lets a jump inside it go `n` tiles further downwind
(`src/reachcore.js`, with the other rides, `opts.rides` only). Without it every tool would call the far bank of a
ride-gap unreachable, and fixing that one row by hand would be a lie.

**Checked:** `tools/moor-gusts.mjs` (new, in the suite) — every told gust keeps the one rhythm; every ride-gap is wider
than a jump and narrower than a carry; every brace stone is shorter than a lull; the build-up is drawn and sounded; and
the shove, the carry and the brace behave as written, run in a VM on main.js's own code.

## 4. The Windcaller (part 2, A rules)

**What changes, exactly:**

- **His HOWL is a told gust.** It already has a told windup (`howlTell`, 1.1 s, "HE CALLS THE WIND", a chant); it
  now also plays the moor's build-up whistle, and it shoves with the same model as the level's gusts (it used to add
  210 px/s² and was beaten by walking).
- **A11, a second caused opening: brace through it.** Hold your ground through the whole howl and his own wind fails
  him: "HIS WIND FAILS", and he falls, open, exactly as a bolt sent back knocks him down (`knockCaller`). Left unbraced,
  the same howl opens nothing: it walks you to the wall and he blinks away.
- **The room's own gust** (`arena: true`) gets the build-up too.

**Why:** the review's one note on him was that his opening is waited for. The fight's only caused opening was the
reflected bolt. This gives the level's own lesson — brace — a payoff in the one place the moor asks it hardest, and it
costs no new attack. A1 (four told attacks) and A2 (tells in `windingUp()`) are unchanged; A10 is unchanged (phase two
still adds the white wall, faster bolts and one-hit blinks); A12 needs nothing new, because a brace needs only floor.
`tools/boss-openings.mjs` gains his row: brace through the howl and he falls; the same howl unbraced does not.

## 5. Checkpoints (part 3)

- **A landing shelf outside the walls.** The Sky Road ends over an eight-tile stone shelf west of the Windcaller's
  wall; the string is cut over it (`flight.x1`), and a checkpoint stands on it.
- **The 952 question** (levelfix report, question 1). Its recommendation was *keep the landing checkpoint inside the
  walls*, because the only ground outside them was the kite post 200 columns back. The shelf removes the reason: the
  landing checkpoint moves out onto it, B6 holds strictly ("one outside the arena walls"), a death in the fight still
  costs nothing but the fight, and `tools/checkpoints.mjs` loses its one INSIDE_OK entry. That list then fails on an
  entry that no longer matches a checkpoint, as the KNOWN list does, so it can only shrink.
- **The soft-lock stays fixed:** the filler still refuses the flight's columns, and the check still fails a checkpoint
  on the ride.

## 6. How it is proved

- F9: `tools/moor-walk.mjs` (the play bot, knight and warden, no god mode) before and after, and
  `tools/moor-gusts-walk.mjs` (real keys, every told crossing, knight and warden).
- The Windcaller: `tools/moor-pilots.mjs` (bossLab, six heroes, two salted passes, dice pinned) before and after.
- INDEX before and after (`tools/curve.mjs`).
- Real-page captures before and after in `docs/galemoor/` (`tools/moor-shots.mjs`).
