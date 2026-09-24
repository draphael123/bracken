# THE FALSE ABBOT'S ROOM — the belfry, built as a room (Lane T, 2026-09-23)

> "The False Abbot needs a better boss room." — Daniel

Read with `docs/briefs/false-abbot.md` (the fight) and RULES A4, A6, A7, A11, A12, B2, B9. This brief changes the ROOM,
not the fight: his numbers stay as they are unless the room forces one (listed at the end).

Before shots (real page, `work/claude/abbot-shots.mjs before`): `work/claude/abbot-room/before-strip.png` (the whole
arena, stitched from the camera's own frames) and `before-fight-{0,1,2}.png`.

## 1. What is wrong with the room he has

He inherited the Roc's summit and nothing about it was rebuilt for him. It is still her room with his name on it.

1. **It is 92 tiles wide** (arena x 2-94, walls at 1 and 94). A7 says about forty: past ~44 the boss is off the screen.
   The camera lock spans four and a half screens. The half of the room west of the trapdoor (x 2-35) is a spike bed, a
   check and three signs that the fight never uses; his procession walks to a wall two screens away.
2. **It is not a belfry.** `drawBelfry` still paints her OPEN summit: five free-standing arch piers, and a roof strip at
   row 20 that is never on screen while you fight (the camera sits on the floor). What you see is the whole sky, a flat
   stone floor, and a goblin twice your size standing in the open. "With its roof ON" is in the brief and not in the game.
3. **The great bell is a small bell.** The Abbot's bell draws with the same 26x30 floor frame and 18px bell as every
   bridge bell on the way up. The one object the whole fight turns on is the smallest thing in the room, and nothing
   about the room says where "under it" is. The fight's own rule - the bell answers only with him within 40px of it -
   is invisible: you learn it by being told HE IS NOT UNDER IT.
4. **The beam walk floats** (B9): four runs of boards at rows 24 and 27 and a ladder, held up by nothing, in the sky.
5. **Nothing reads as his.** Incense stands, two empty bell frames and a statue, scattered at even spacing across 92
   tiles; no chair, no apse, no congregation's door. His adds appear out of the air 110px either side of him.
6. **Spikes inside the arena** (x 80-90, with a stepping-stone hop over them to the gate): the Roc's thorns, a quarter of
   the width a 40-tile room would have, and a place his procession's shove (200 px/s) throws you.

**A12, checked** (`node tools/arena-supplies.mjs --list`): his floor-height guards are censer <32, chain <30, procession
<26 - all under the 51px plain jump, so every one is answerable from the floor, and the old room passes the tool. What
the tool does not read, read by hand:
- THE COALS are floor fire along the boards: the room owes you a step up off the boards near where he tips them. It has
  one, the beam walk, but only in the middle.
- THE PROCESSION "go over him or round him": over is a jump; round needs somewhere to go that he does not walk. He walks
  the floor only (`e.y = floor`), so any tier is "round". 
- THE KNELL reaches the whole room on purpose (phase two's price). Nothing to supply.
- THE BELL: "struck from the floor, with him under it" - the room must let you reach the bell with him beside it, from
  EITHER side (the chain hauls him toward you, so you must be able to stand past it). The old room did; the new one must.
- THE CONGREGATION "up the belfry ladder": the room had no door and no ladder they used.

So the room is not broken by A12 - it is the wrong room: too wide, open to the sky, and silent about the one place in it
that matters.

## 2. The new room: THE BELFRY OF THE MONASTERY

The summit's east half becomes a room: **43 tiles wide (x 51-93) and ten high (rows 20-29)**, walled, roofed and lit,
entered by the west door you come up to from the trapdoor. The west half of the summit (the trapdoor, the check at 18,
the signs) stays outside it as the approach - the check is now outside the arena walls, as B6 asks.

```
 row 18-19  ================================ ROOF (laid stone), a pitched tile roof and a louvre over it
 row 20     |  win      win    (ROSE)    win      win   |
 row 24     |GALLERY==H   .      ||      .   H==GALLERY|   the ringers' galleries, on posts; ladders at 52 and 91
 row 27     |    .   STALL      BELL      STALL   .     |   the choir stalls, on posts: 48px up
 row 29     D  lectern   (  brass ring  )   chair  gate |   D = the west door the arena wall shuts
 row 30     ================================= FLOOR ==========
            51        61  64    72    80  83         93
```

- **THE WALLS AND ROOF.** Laid stone (the level's own masonry), the west wall with a tall round-headed door (rows
  24-29, exactly the span the arena wall shuts), the east wall the mountain's. Over the roof slab a pitched tile roof
  facade, so from the approach it reads as the monastery's tower top and not a ceiling in the sky. `camBelow: 1` frames
  the room ceiling-to-floor on one screen height, so the roof is ON in every frame of the fight.
- **THE NAVE WALL behind the play** (a new `paintRoom` kind, `monkBelfryIn`): darker coursed stone, a lancet window every
  five tiles with the evening sky in it and a slant of light falling from each, the congregation's two stair doors at
  the foot of each end wall, and the abbot's chair painted into the east apse (a room-owned prop, not a collider).
- **THE GREAT BELL at the crossing (x 72, the room's centre).** It hangs from its yoke on the roof beam, three times the
  size of the bridge bells, with its lip a hand over the floor, so it is struck from the floor as before. Its strike box
  grows to match what is drawn (the old 24x30 box on a 52px-wide bell would be a lie).
- **THE ROSE WINDOW over it**, and the one broad shaft of light in the room falls from it onto the floor under the bell.
- **THE RING.** A brass ring inlaid in the flags under the bell, exactly `ABBOT.bellUnder` either side of it - the
  distance the note reaches. It is dull while he is outside it and **burns gold the moment he steps inside**, and the
  shaft of light over it brightens with it. The room says "NOW" before any text does. That is the caused opening made
  readable by the room itself (A11): the bell, the place, and the moment are all drawn.
- **HEIGHT TIERS, all held up (B9):** the choir stalls at 48px (x 61-64 and 80-83, on posts, eight tiles clear of the
  bell either side so they are never a way to ring it from safety), and the ringers' galleries at 96px along both end
  walls (x 51-58, 85-93) on a post each and the wall behind, with a ladder up each. They are the step off his coals,
  the "round him" for the procession, and where the knell finds you just the same.
- **THE CONGREGATION COMES IN AT THE DOORS**: his adds spawn at the foot of the end wall nearer to him (x 53 or 91) - the
  stair doors painted there - instead of out of the air beside him. Same count, same cadence (`ABBOT.adds`, `addEvery`).
- **HE STARTS IN HIS CHAIR** in the east apse (x 80), with the bell between him and the door you come in by: the first
  thing he does is walk toward you under it.
- **THE DRESSING IS HIS**: the psalters and a lectern by the west door, candelabra lighting the choir, the goblins'
  loot heap and bones in the corners, incense stands either side of the chair; the two empty lesser-bell frames stay in
  the approach, where the bells that went down the mountain hung.
- **GONE FROM THE ROOM**: the east spike bed and its stepping stones (the gate stands on the floor in the apse), the
  floating beam walk, the Roc's open-arch piers over this half (`drawBelfry` is clipped to the approach, which is
  Lane G's to decide).

## 3. What must be true when it is done

- A7: the arena interior is 43 tiles (was 92). A12: `arena-supplies` still green, and the room has footing at 48 and
  96 px. B2/B9: nothing floats - `floaters`, `audit`, `killzones`, `traps` green.
- The bell is struck from the floor on EITHER side of it, and the ring lights exactly when `abbotBellRung` would say
  'down' (the same `ABBOT.bellUnder`, read, not copied).
- `false-abbot`, `boss-openings`, `boss-navigation`, `belfry` (re-pointed at the new ladder and gallery), `skins`,
  `dressing`, `tells`, `textfit`, `comments`, `syntax` green.
- Pilot (`bossLab`, normal health, 6 heroes x 4 passes, seeded) before and after, reported side by side. The old
  38% was measured through the burn bug and is not a baseline; the "before" is re-measured on this branch's parent.

## 4. Numbers the room forces (and only these)

- **The bell's strike box** widens from 24 to 36 px to match the drawn bell. Not a buff to the opening: `bellUnder`
  (where HE must be) is unchanged.
- **His procession's walls** move in with the room (it already clamps to `A.x0/x1`); nothing in `ABBOT` changes.
- If the pilot moves out of the 60-75% band because of the narrower room, that is reported, not tuned - rebalancing
  him is not this lane's call.
