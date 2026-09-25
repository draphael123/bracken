# THE FALLING TOWER, REWORKED: a design brief (lane claude/fallingtower, 2026-09-25)

> Daniel's review: **"needs work"**. Approved asks, in his order: its own mechanic (floors that start collapsing under
> you on a counted warning), a named mini at the Bell Loft and an ambush room, a look of its own, and an INDEX back in
> line with the Folly - through those three things, not padding. Its boss (the Undead Archmage) is NOT retuned here.

Sources: `level-review/group-b.md` (THE FALLING TOWER: "needs work"), `docs/audit/ranking-2026-09-24.md` on `claude/audit`
(bottom five: "the finale dips 26 below the Mage's Folly and has no ambush room"), RULES A/B/C/F/Q, DESIGN.md.

## 0. Where it stands (measured on master 4cc3bb4, before this lane)

| | today |
|---|---|
| INDEX (`tools/curve.mjs`) | **96** after the Folly's **122**: a **-26** dip, the finale is the easiest level of its act |
| threat / kinds / hazard / checkpoints | 256 over a span of 900; 11 kinds; 22 hazard tiles; 11 checkpoints, worst gap 50 |
| named fights before the sky | **none** - no mini (the Bell Loft's warden is an elite armour), no ambush room |
| the rule | "every floor you leave falls" - but a floor only goes once you are ABOVE it, so it is a backdrop, not a thing you play against |
| the look | the Folly's library backdrop and its grey-olive brick (`L.mage` paints every room with `MW.paintRoom`); F6 fails at a glance |
| the boss | THE UNDEAD ARCHMAGE, 4/21 wins (19%), median win 89 s (`LEVEL=fallingtower node tools/duneworm-pilot.mjs`, salts 1-3, 7 heroes) |

## 1. The one sentence (F8)

**"THE TOWER IS FALLING: STONE THAT CRACKS COUNTS DOWN, AND THEN IT GOES."**

Said three ways (C4): you SEE it (every failing section wears its cracks and trickles dust before anything happens), you
READ it (a count - 3, 2, 1 - hangs over the stone the moment weight is on it, yellow to red), and you HEAR it (a crack on
every count, a groan on the last, the crash). A hazard without a telegraph is a memory test (C3); this one tells where
(the cracks are on the stone that will go) and when (the count).

## 2. THE MECHANIC: FAILING STONE (`src/tower-collapse.js`)

A **failing section** is a run of floor tiles (`L.crumbles`: `{ x0, x1, row, count, kind, chain?, opens? }`).

- **Told before it is touched:** hairline cracks drawn over its tiles and a slow trickle of dust under it, always.
- **Weight starts it:** a hero standing on it starts the count (default 3 s). The count is drawn over the section as a big
  numeral (3 yellow, 2 orange, 1 red), with a crack sound on each whole second and dust thickening.
- **Then it goes:** the tiles become air, rubble falls, the camera shakes.
- **It is never the route cut for good (B4):** a section that fell comes back 4 s later (never into anybody standing in
  its tiles), and every section is whole again on a respawn (`towerAscentReset`).
- **A fall is never a death (C5):** every failing section has footing under it within reach of a climb back - a lower
  tier, the floor, the bell pit, or a rope hung for exactly that.
- **The reach model is told** (`src/reachcore.js`): a section marked `opens` can be dropped through (it is the way on),
  exactly as the Reading Room's flip is told through `L.glyphBridges`.

### Its uses, in route order (each a different question)

| # | floor | use | what it asks |
|---|---|---|---|
| 1 | THE LIBRARY STACKS | **TAUGHT SAFE** | the stair's second tier fails, three rows over the library floor, beside the sign. A fall costs nothing. You learn the count where it cannot hurt you |
| 2 | THE ORRERY CAGE (the observers' gallery) | **A COLLAPSE THAT OPENS THE WAY DOWN** | the gallery you come up into is closed; its floor is failing stone and the only way on is to stand on it and let it take you down - into the orrery pit, where the AMBUSH shuts |
| 3 | THE ORRERY CAGE (the shaft) | **A RACE UP A FAILING STAIR** | out of the pit, the stair up the shaft fails from the bottom up once you step on it: each tier's count starts when the one under it goes. Fall and you land on the tiers below and the pit's roof; the stair is back 4 s after it finished |
| 4 | THE PENDULUM GALLERY | **A FLOOR YOU MUST LEAVE IN TIME** | the landing after the first ride counts the moment you land (2.5 s): step up the wall stair before it goes. Under it is the gallery floor, clear of the gear pit, with a rope back up (C5) |
| 5 | THE BELL LOFT | **THE MINI'S ROOM** | the bell deck is failing planks over a shallow bell pit. The mini's toll starts them counting; your weight starts them too; and his charge breaks a counting plank outright - see §3 |

The whole-floor fall ("every floor you leave falls") stays as the tower's frame: a floor goes once you are above it and
its rope is sealed. It was never dangerous and is not made so.

## 3. THE MINI: THE SEXTON, at the Bell Loft (`src/sexton.js`, art `src/redraw/sexton.js`)

The tower's bell-ringer, dead and still on duty: a tall, stooped figure in a grey-violet cassock with a bronze hand-bell
on a short chain. He replaces the Bell Loft's elite warden. Id `sexton`, `L.mini.name = 'THE SEXTON'`, THREAT 4 (a mini,
as the Grave Warden and the Barrow Rider), a bestiary row, `BEAST_SHORT`, his own death and hurt voices, `MINI_DONE`.

**His room (A12):** the bell deck spans the loft, planks over a three-row bell pit on joists. Two stone **ringers' walks**
stand three rows over the deck (the height his toll cannot reach). The way up is shut by a portcullis (the mini gate)
until he falls; the bell frame over the deck is the room's roof.

**His kit - four told attacks, every one in `windingUp()` (A1/A2), colours to the MARK:**

| attack | tell | mark | the blow | the answer |
|---|---|---|---|---|
| THE SWING | the bell drawn back on its chain | `!` yellow | the bell swung through the space in front of him | guard it, or step back |
| THE RUSH | head down, bell lowered like a ram | `!` yellow | he charges the length of the deck | guard it, or jump him |
| THE TOLL | the bell raised in both hands | `!!` red | a ring along the deck and the pit - anyone standing on them is struck | get OFF THE DECK: a ringers' walk, a jump, a joist does not save you |
| THE BELL DROPS | he hauls on a bell-rope; a shadow marks your spot | `!!` red | a bell falls from the frame onto the marked spot | leave the shadow |

**THE TOLL is the room's clock:** every plank section within five tiles of him starts counting (3 s).

**THE OPENING IS CAUSED (A11):** he never walks onto counting planks of his own accord - he stops at their edge. But his
RUSH is committed: **rush him across a counting section and it breaks under his charge**. He goes through into the bell
pit, CAUGHT, open for 3 s at double damage, then heaves himself out. Left alone - no counting planks between you - the
rush is only a rush and opens nothing. You make the opening: let a toll or your own weight start the planks, get beyond
them, and make him come for you.

**PHASE TWO (A10), at half:** *"he rings the whole deck at once."* His toll counts every plank in the room on a shorter
count (2 s), and the bells come down in pairs. What it asks: the deck is no longer somewhere to stand - you live on the
ringers' walks and the joists and cross the planks between counts, and every toll is also an invitation to bait a rush.

Forced in a harness (A3): `tools/sexton.mjs` forces each of the four attacks and asserts it fires and lands; the
opening is proved caused in `tools/boss-openings.mjs` (a rush over whole planks opens nothing; over counting planks it
does).

## 4. THE AMBUSH ROOM (rule Q): THE ORRERY PIT

The orrery's pit, under its observers' gallery. You come down into it through the failing gallery floor (use 2 above)
and the gates drop at both ends: **one captain and one crowd**, one wave only - the orrery's armour, now the room's elite
captain (it leaves the ELITES table), with apprentices and a tome. The door checkpoint is on the gallery above, so a
death inside wakes you over the room and the room is put back. 32 tiles between the gates, a low roof (the gallery) so the
room holds you. Measured with `BK.ambushLab` against Q's 15-35 s window for every hero; `ambush-single` and
`ambush-reach` green. Never back to back with the mini: two floors and the pendulums lie between them.

## 5. THE LOOK (F6): A TOWER THAT IS FALLING

Today it is the Folly's library and brick. The tower gets its own, distinct from the Folly and readable:

- **Its own stone:** cold slate-blue ashlar, heavier and older than the Folly's violet brick, with mortar that runs out
  of true (the tower leans) and cracks you can read across a room - its own skin set (`fallen`), not the Folly's `tower`.
- **Its own back walls** (`paintFallenRoom`): every floor keeps its identity (stacks, reading room, orrery, clock,
  cistern, bell loft, crown) but is painted as a broken room: the back wall **holed through to the night sky** with wind
  streaks crossing the holes, leaning buttresses, hanging chains and bells, dust sifting down. No occluder indoors.
- **Its own palette** for the sky and the haze (dust-grey, moonlit, not the Folly's violet-green night).
- **Motion:** dust sifting from cracks, chains swaying, wind through the holes.

Checked by `skins`, `occluders`, `dressing`, `floaters`, `pixels`; captured before and after under `docs/fallingtower/`.

## 6. THE INDEX (§4 of the ask)

The dip is closed by what the level now contains, not by padding: THE SEXTON (a mini is counted twice its weight and is
a new kind), the ambush's crowd, and the failing stone, which is a hazard the index cannot see today - `tools/curve.mjs`
counts only spikes and harmful pools. **Fix the rule, not the row:** a section of floor that gives way under you is a
hazard in every level that has one (the tower's failing stone, the Hurricane's splitting deck, the Burning Village's
logs), so `curve.mjs` learns to count them; every level's number is re-printed, not just this one. Target: a step of no
worse than -8 from the Folly (RAMP_DROP).

## 7. What does NOT change

The Undead Archmage (numbers reported before and after only), the carpet, the sanctum and the sandy path; the Reading
Room's flip and the Pendulum Gallery's rides (both load-bearing); the cistern's poison; the Tome; the tower's shape
(seven floors, 306 rows).
