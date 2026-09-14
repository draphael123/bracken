# Rules for any level or boss we build from here

Every rule below was earned by something going wrong in the last few rounds, and where a rule can be checked by
a machine it is: `node tools/newlevel.mjs` enforces fifteen of them and prints design advice separately.
Run the staples after any level edit:

```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs && node tools/newlevel.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```

---

## A. The fight

**A1. Four told attacks, minimum.** A boss needs three or four distinct things it does, and every one of them
told before it lands — a named `<thing>Tell` mode with its own pose, its own sound and its own tell colour.
*Earned:* the first Drowned Bosun shipped with three and read as one idea; the Windcaller shipped with a single
told attack and was still flagged as thin a round later. **Checked** (the tool reads the update function).

**A2. Every tell must be in `windingUp()`.** Otherwise the wind-up plays no tell sound and you cannot hear a
blow coming from off screen. *Earned:* the whole sea arc, the King and the Owl Reeve had been winding up in
silence since they were built. **Checked.**

**A3. A cooldown that is never initialised does not exist.** `undefined <= 0` is false forever, so the attack
simply never fires and nothing tells you. *Earned:* two of the Tide Herald's six attacks had never once fired
in play; the Captain's keg never fired because a sibling branch always won the turn. **Test every attack by
forcing it in the harness before calling a boss finished.**

**A4. The signature mechanic must be the room's, and the room must be able to give it.** A boss whose trick
depends on a level system (a wave, a tide, holes in the floor, cuttable lines) can only live in a level that
has one. *Earned:* the Drowned Bosun's ride-the-wave was tied to `L.wash`, so when he had to leave the
Hurricane Deck there was nowhere in the game he could go and he was deleted whole.

**A5. Nothing is untouchable for longer than about two seconds.** An invulnerable phase is a punctuation mark,
not a paragraph. *Earned:* the wave used to cross the entire ship, so the Captain rode it — untouchable — for
half a minute. A wave passes you now.

**A6. Every untouchable phase owes an open one.** If it cannot be cut while the sea has it, it must be beached
after: a named, visible window with a damage multiplier on it.

**A7. An arena is about forty tiles.** Past ~44 the boss can be off the screen, and a boss dispatched below the
420 px range cull in `updateEnemies` freezes at that distance. Bosses go **above** the cull; anything that
carries a boss (a wave, a charge, a glide) is clamped to the player. *Earned:* the Captain froze 32 tiles away
in an 84-tile room. **Advised** by the tool, with the exceptions listed.

**A8. A boss needs all twelve wiring points** or it is broken in a way playtesting finds slowly: TIER,
EHP/DMG/COLS, a spawn case, an update function, a frame table, `bigF` if it is big, a death case, a corpse
case, a bestiary row, a hurt voice, the **boss-death list** (or the arena walls never open and the level never
ends) and a branch on the **boss bar** (or it is called HORNET QUEEN). **Four of these are checked.**

**A9. Give it a mid-level fight too.** A level of 450+ columns wants something named before the last thing.
*Earned:* the Reefmaw and the mid-fights land well; the Flotilla and the Long Water went trash-to-boss for
three rounds. **Advised.**

---

## B. The room

**B1. The start must be able to reach the end.** A sealed start passes every other tool, because everything
*inside* the box is reachable. *Earned:* the Hurricane Deck's forecastle was a closed room for an hour.
**Checked** (the start must see more than a sliver of the level's footing).

**B2. Nothing stands in the air.** Not a sign, not a prop, not a creature. *Earned:* four hands on the
Flotilla (two in the Quartermaster's arena), two on the Hurricane's breach, three of Stormhold's garrison two
rows above her floor. **Checked** for creatures; the audit covers props, with a hanging whitelist.

**B3. Every pocket has a way out.** A pit you can fall into with nothing in it to kill you is a softlock.
*Earned:* the Fired Wood's floor, the wreck's hold, the Flotilla's sea. **Checked** (`traps.mjs`).

**B4. A cuttable route is never the only route.** If a boss can cut a line or a deck can fall, there must be a
way up that cannot be taken away. *Earned:* the Quartermaster cut both nets and the player could not follow her
onto the poop.

**B5. An interior backdrop is only where the inside is.** A region that reaches above a deck hangs a stone wall
in the open sky. *Earned:* the Flotilla's two big rectangles.

**B6. Checkpoints every 100 columns, and one outside the arena walls.** *Earned:* a 140-tile gap across the
Hurricane's underwater section, and a checkpoint inside the Quartermaster's walls.

**B7. Match the neighbours' density.** `tools/quality.mjs` prints foes/100, signs, deco/100, coins/100 and the
worst checkpoint gap for every level side by side. A new level that is half as populated as its neighbours is
not "sparse", it is unfinished. *Earned:* the sea arc ran a third emptier than the forest arc for four rounds.

**B8. Three encounters, not one encounter three times.** Arrange the same creatures into problems with
different shapes: a crowd in the open, a choke with no room to swing, shooters above a deck you must cross.
*Earned:* the Flotilla's fourteen evenly-spread deckhands.

**B9. Geometry has to look like it is holding itself up.** A mast is stepped into the deck; a floating platform
is rigged to something; a spring cap over open air grows a stalk. *Earned:* all three were noticed by eye in one
playtest.

---

## C. Hazards and legibility

**C1. Anything that hurts must look like it hurts, before it does.** Colour first, then shape, then motion.
*Earned:* the Flotilla's harbour ate swimmers while drawn as clean blue sea; deep water that kills on contact
was drawn exactly like water you can swim in. **Checked** (a `harm` pool must carry a `foulCol`).

**C2. One rule per level, readable from across the room.** The wash. The tide. The pans filling. If a playtester
has to be told the rule, the level has not said it.

**C3. Every hazard tells you where and when.** The wave gets a wall, a counted warning and an arrow to the
nearest line; the lightning says which spot it will hit, a second before it hits it. A hazard without a
telegraph is a memory test.

**C4. Say the same thing three ways.** Foul water: colour, scum, drifting slicks, gas, and the broken spars
standing out of it. One signal is never enough.

**C5. Hazard zones need an escape that is visible from inside them.** A net, a ladder, a lifeline over the bow.

---

## D. Process (how not to break it while building)

**D1. Patch scripts write after every replacement.** A script that writes at the end loses every edit when a
later assert throws.

**D2. Make a patch script idempotent before re-running it.** Duplicated blocks have cost four separate repairs
(`updateCaptain`, the Herald's modes, the boss dispatch, the heavy-blow block).

**D3. Never put a `//` comment in front of code that continues on the same line.** It swallows the rest,
including the closing brace. `tools/comments.mjs` catches it — and was taught the one shape it missed.

**D4. Delete by exact string, never by regex.** Removing the Drowned Bosun's boss-bar branch by pattern took
the fallback and the whole bar draw with it.

**D5. `grow()` shifts coordinates.** Content added after a grow is written in FINAL columns, new swings go on
`F.R.moversExtra`, and custom fields (`wash`, `masts`, `storm2`) are not remapped.

**D6. Verify in the harness, not by eye.** `BK.state = 'play'` after `BK.load(i)`; real `KeyboardEvent`s for
input ('x' attack, 'z' jump, 'c' block); `BK.PROG.talents` is keyed by hero; `BK.rushStart(i)` runs one fight.
Force every boss mode and confirm it fires.

**D7. Measure the fight.** Max-aggression time-to-kill against the previous boss (the Quartermaster is 92 s,
the Captain 79 s), and how long an idle bot survives in the arena (23 s for the Captain). A boss nobody has
measured is a guess.

---

## E. What the fifteenth level added to the list

**E1. Never rename a field with a blanket replace.** `streetTide` was already Saltreach's slow in-and-out
tide (`tidePeriod`/`tideLo`/`tideHi`). Renaming every occurrence to give the drowned city its own running
tide froze three pools in two other levels, and the reef's start went from seeing 98% of its own footing to
0.6%. Grep first, rename the lines you wrote, and re-run `reach.mjs` on every level, not the new one.

**E2. A signature that a sibling branch can starve does not exist.** The Lampreeve never went for a lamp and
the Tollmaster never put one out, because in both chains a closer attack was asked for first and the player
is nearly always close. **The thing the fight is about goes at the TOP of the chain.** (This is A3 again, and
it will happen again: check it by watching a bot stand in the boss's face for a minute.)

**E3. A surface you can tread water at is free air.** The swimmer floats up until their head is out, so any
reachable water surface refills the breath clock whatever the level intended. If air is the resource, the
water has to close over the player's head: the street's water line sits INSIDE the masonry, and the
Tollmaster's square fills to its vault.

**E4. Every step is two rows.** Three rows is 48 px against a 49 px jump. It goes in, but only just, and
`audit.mjs` is right to call it UNREACHED. A climb should never be a pixel-perfect jump.

**E5. A pool needs somewhere to BE.** `newlevel.mjs` used to flag any pool whose surface row was solid. A
drowned street runs under six rows of stone with its water line inside them, which is correct and reads
correctly; what is wrong is a pool with no open space between its surface and its bottom.

**E6. Check the sprite fits its own canvas.** The Lampreeve's snuffer cone — the one shape that says what he
is — was drawn at 22 to 34 px along a pole from a hand 12 rows down a 40-row grid, so it landed at row -22
and was clipped off every frame. Put every set on a contact sheet and look at it (`BK.SPR`).

**E7. A level's name is not the only name.** The boss bar had a branch for every boss; the INTRO BANNER had
its own chain that stopped at the crags, so four bosses announced themselves as THE HORNET QUEEN. If two
places name the same thing, make the second one ask the first (the bestiary names every creature).

**E8. Nothing in a menu may be cut off.** Eight of the eighty bestiary entries lost the end of their
description, one of them more than half. Measure the box, then either page it or shorten the copy.

**E9. Every creature dies in its own voice.** Twenty-four of eighty fell back on one generic sound, and a
drowned man and a sea urchin went out on the same noise. A voice is a BODY, a VENT, and a TAIL on the big
ones. And an enemy must never swing with the player's own `pSlash`: you cannot hear a blow coming if it
sounds like yours.

---

## F. The shape of a level (the template)

Everything above is a rule you can break a level by ignoring. This is the *shape* — what a level has to be
made of before it is worth building. It is written out of one round of playtest notes, most of them a version
of the same sentence: *"the level is a good length, but it's very repetitive and there's no variety."*

**F1. SEVEN SECTIONS, NOT ONE STRETCH.** A level of 400–700 columns is seven named sections of 60–100. Name
them before you place a tile: *the way in, the market, the hall, the vaults, the works, the procession road,
the toll gate.* If two sections could swap places without anybody noticing, they are the same section twice.

**F2. FIVE LANDMARKS, AND EACH ONE IS A PLACE.** A landmark is somewhere you would tell somebody to meet you:
her figurehead, the gun deck, the oil pump, the dark hold, the great cabin. A stretch of the same planking with
more foes on it is not a landmark. Each one must be built out of a verb the game already has, so it is a thing
you *do*, not a thing you walk past. *Earned:* the Hurricane Deck was seven hundred tiles of identical deck.

**F3. THE VERB BUDGET.** Every level uses at least four of the game's verbs and puts one of them somewhere new:
jump, dash, plunge, climb, swim, block/parry, a machine (winch, pump, cannon, lever, cart), a carried thing
(a key, a fire, a bucket), a light, a mover, a breakable wall. A level that is only "walk right and swing" is
one verb, however many foes are on it.

**F4. IT ALTERNATES.** Combat, then a climb or a crossing, then combat. Never two fights with only floor
between them. *Earned:* "make sure there is at least some platforming in the level, not just combat."

**F5. ONE MACHINE YOU CONTROL.** A pump that drops the water, a cannon that opens a wall, a winch that lifts a
gate, a bellows that raises a floor. It must change the ROOM, be usable more than once, and be worth using.

**F6. DISTINCT FROM ITS TWO NEIGHBOURS AT A GLANCE.** Different palette, a different interior kind, at least
one creature the neighbours do not have, and one hazard they do not have. Take a screenshot of all three and
look at them together; if you cannot tell them apart in a thumbnail, it is not a new level.
*Earned:* "it's visually not distinct enough from the prior two levels."

**F7. THE FURNITURE EVERY LEVEL CARRIES.** A shop or a shrine inside the arc. Three quest strays. Three
silvers. A relic. Checkpoints to B6. A mini at roughly a third, the boss at the end — and **somewhere to go
the moment the mini falls**, which is not an invisible unlock. *Earned:* "after beating the lampreeve there's
nowhere to go", and "there needs to be a store in the water level area".

**F8. THE RULE IS THE LEVEL.** Before anything else, write the one sentence the level is about and the three
ways it says it (C2/C4). If the sentence is "there are more goblins", stop.

**F9. WALK IT BEFORE YOU DRESS IT.** The whole level, start to gate, with no god mode, once per hero that can
reach it. Every tool in `tools/` passes before the art goes on, and the audit's FLOAT count is zero.

---

## G. THE PLAYTEST BOT

The tools in `tools/` read the levels as data. They cannot see a sprite, a string that runs off the edge of
the screen, a frame that comes back black, or a crash three thousand frames into the Hurricane. `src/playtest.js`
runs inside the page, on the real loop, with the real art, and looks at what actually comes out of it. It found
the thing that had been wrong with every swinging log in the game since they were written.

**How to run it.**

```
bracken-nine.vercel.app/?playtest=1        every level, both passes, the report left on the page
                       ?playtest=1&mode=sweep      art and geometry only (faster)
                       ?playtest=1&level=reef      one level
```

From the console (or from an agent driving the page):

```js
const r = await BK.playtest();                                  // -> the report object
await BK.playtest({ levels: ['reef', 'lamplit'], mode: 'play' });
console.log(r.text);                                            // the written report
```

**What the two passes do.**

*THE SWEEP* stands the bot on the footing every seven columns, the whole length of the level, and renders
eighteen frames at each stop. That is the pass that sees ART: a prop in the air, a creature spawned inside
rock, a frame with nothing on it, a caption drawn off the edge of a panel, a sprite drawn at NaN, a level that
costs thirty milliseconds a frame.

*THE PLAY* pass puts a greedy bot on the ground with no god mode and lets it fight its way to the gate. When
it dies three times in the same place it NOTES THE PLACE, lifts itself over it and carries on, so the report
ends with every corner a plain run cannot get past instead of only the first one. That is the pass that sees
BALANCE: hits taken, deaths, how far it got, and where it stopped.

*THE SCREENS* pass walks every menu in the game - title, slots, hero pick, map, store, equip, tree, bestiary,
controls, sound test, practice, pause, win, game over, rush over, rush win, hero card - draws each one until
everything has finished sliding in, and measures every string on it. **This is the guard against the oldest
bug in this project: a plate laid out against 400 pixels when the buffer is 320.** It also catches a screen
that throws, which is worse and much easier to miss. Note that `BK.step(n)` is n updates and ONE draw, and a
panel that slides in is animated against the number of DRAWS it has had - so the pass draws fifteen times and
only then judges what is on the screen.

**There is no sprite-clipping check, and there should not be one.** It was tried: every sprite here is
tight-cropped to its widest pose, so the widest pose touches its own border BY DESIGN. "Touches the edge" gave
300 findings; "touches an edge where its brothers have margin" gave 140, all of them lunges and overheads
using a canvas sized for exactly that. Once the pixels are baked, a frame that was cut and a frame that
exactly fits are the same picture. If it needs solving it has to be solved at BAKE time - `knightFrame()`
reporting the extent it drew to, and the bake asserting it fits.

**The findings, and what each one means.**

| kind | severity | what it is |
|---|---|---|
| `CRASH` | bug | an exception thrown while the level was running |
| `NAN` | bug | something drawn at a non-finite coordinate, with the stack |
| `BLANK` | bug | a rendered frame with nothing on it |
| `INSOLID` | bug | a creature or a piece of furniture spawned inside rock |
| `UNREACHABLE` | bug | a gate, checkpoint, silver or quest item the reach model cannot get to on a level with no movers |
| `STUCK` (never died) | bug | the bot could not get past something and was not being killed: that is geometry |
| `TEXTCUT` | odd | a UI string drawn outside the 320-wide buffer |
| `FLOAT` | odd | furniture standing on nothing |
| `DOUBLE` | odd | two creatures on the same tile |
| `SLOW` | odd | nine frames in ten cost more than 16ms (a p90, not a worst case: wall-clock on a shared machine picks up whatever else the computer was doing) |
| `DARK` | odd | more than half the sweep frames were nearly black |
| `LONGGAP` | odd | more than 150 columns with no checkpoint |
| `THIN` | odd | fewer than three kinds of creature in the whole level |
| `RAMP` | odd | a level out of line with the one before it |
| `BRUTAL` | odd/note | the bot died a great many times getting through |
| `ASSISTED` | note | outside the reach fill on a level with movers, gusts or doors: may be a ride away |
| `UNWEIGHED` | note | an entity type with no threat weight, so the balance figures do not count it |

**Keeping it honest.** Three lists in `playtest.js` hold the things that LOOK wrong and are not: `INROCK_OK`
(a gunport is a hole in a hull, a window is a hole in a house), `INROCK_FOE` (an urchin lives in the sea bed,
a grub lives in the rock) and `NOT_A_FOE` (the furniture and machinery, which weighs nothing). A silver is a
collectable and hangs in the air on purpose, so it is not furniture. World-space text is exempt from the
overflow check because `drawWorld` and `drawMap` set `g.__world` — a damage number over a creature at the edge
of the view is not a bug. Add to those lists rather than ignoring a finding — an ignored finding comes back
every run, and a report nobody trusts is a report nobody reads.

**When to run it.** Before every deploy that touched a level, a creature or the draw. It takes about a minute
for the whole campaign. If the BUGS column is not empty, do not ship.

## H. THE MARK, AND WHAT A TALENT COSTS

Two laws that used to be conventions, and drifted because a convention that nothing checks is a wish.
Both are enforced by a tool now; both tools exit non-zero, so a broken one fails the same way a syntax
error does.

**THE MARK — `node tools/tells.mjs`**

Over a creature's head there are exactly two marks, and they answer exactly one question: *can I block
this?*

- **`!` in `#ffd36b` (yellow)** — the shield turns it. Block it, or parry it if you are quick.
- **`!!` in `#ff6b6b` (red)** — no shield in the game turns it. Move.

`LOW` and `HIGH` are the same promise with the *how* attached: the word says which way to get out of it,
the colour still says whether the shield is one of the ways. A low sweep that cannot be blocked is `LOW`
in **red**.

Everything else a creature says over its own head — `WHIRL`, `TOSSED`, `THE STORM`, `HE WILL GO DOWN WITH
HER` — is narration, in whatever colour suits it, and the tool ignores it. The moment you make one of those
a `!` or a `!!` it becomes a promise and gets audited.

Half the damage in BRACKEN is unblockable. If the mark cannot be trusted, the shield is a coin flip and the
player has to memorise fifty movesets instead of reading one symbol. The tool reads every creature update
function, follows each windup down its chain to the blow at the end of it, and fails if a mark disagrees
with what it finds. Windups whose blow is thrown by something else entirely (the Forgemaster does not
strike you, he hurls a cart) are in a written honesty list, not guessed at.

**WHAT A TALENT COSTS — `node tools/talents.mjs`**

A campaign pays **32 points** — two a wood, sixteen woods. A node's price is its shape, not a number typed
at the call site:

- an **active**, or a stacking bump — **1 point a rank**, as they always were.
- a **single-rank node** is a RULE, and a rule is worth more than a percentage — **2 points**, or **3** when
  it sits in the last row of a branch.

And the last row of a branch needs **8 points already spent in that branch**. Three branches with no rung
between them is three ladders, and a tree you can sprinkle across and still reach the bottom of is a
shopping list.

The tool also fails on any node that **nothing reads** — no `tal('id')` anywhere outside the tree, no
`skillPress('id')` for an active. That is the one talent bug you cannot see from inside the game: it does
not crash, it does not look wrong, and the description is right there promising otherwise. It found five.

## I. TWO RULES OF PAINT ORDER (learned building THE UNDERCROWN)

**EVERY LADDER IS HUNG LAST.** A gallery cut after a ladder erases the rungs it runs
through, and it does it silently: the shaft still looks like a shaft, the ladder art is
still drawn above and below, and there is a four-course gap in the middle of it that you
only find by falling down it. Two of the Undercrown's five shafts were broken this way.
Lay every `T.NET` run after the last `cut()`/`block()`/`floor()` in the level, and put a
comment on the line that says nothing is dug after it. (This is the same lesson as
digging the drain last, learned from the other end.)

**A BOSS ARENA IS ENTERED FROM THE LEFT.** The trigger is `P.x > arena.trigger` - there
is no direction flag. A route that lands the player on the RIGHT of the arena means the
fight never starts, `bossActive` stays false, and *the boss cannot be hurt at all*, which
reads as a damage bug and is not one. If the descent arrives on the wrong side, put a
drift or a gallery between the two so the player walks the length of it and comes at the
arena from the left.

**AND A ROOF HAS TO BE A ROOF.** A `timber` set's `row` is the course it opens. Cut the
gallery under it six tall and that course is already air, so the best beat in the level -
the hole opening into the working above you - happens into a hole that was always there.
Galleries that carry a set are four courses, and the course above them is solid.

## J. A LEVEL CAN ASK FOR A BODY COUNT

`needsTime: { id, t }` gates on a best time (UNDERLEAF wants Kingswood in three minutes).
`needsKills: { id, pct }` gates on a FRACTION of a level's garrison (THE UNDERCROWN wants
four goblins in five of Highcrown's). It is stored as a fraction, not a number, so the
gate survives that garrison being retuned under it: `winLevel` writes down `slain` and
`slainOf`, and `slainOf` is counted ONCE, at the start of the level, before anything has
fallen over.

Two gates on the same level should ask for opposite things. Highcrown's gold time wants
you through it; the Undercrown wants you to leave nothing standing in it.

## K. tools/floaters.mjs

`newlevel.mjs` catches a CREATURE standing on nothing. Nothing caught a PROP standing on
nothing, and a banner hanging two tiles over a gallery floor is the same bug with a
quieter failure: it does not break the level, it just looks broken, and you only find it
by walking past it. Run it with the rest. Kinds that are MEANT to hang are named in
`HANGS`; anything carrying `hang: true` says so for itself.

## L. ONE TABLE, ONE INDEX, ONE THRESHOLD — `src/threat.js`

The difficulty ramp was measured twice, by `tools/curve.mjs` and by the bot, and the two
disagreed about the campaign. Three separate reasons, all of them the same reason:

1. **The threat table lived twice** and had drifted by TWENTY entries. `curve.mjs` even
   carried a comment saying "kept in step with the same table in src/playtest.js" — a
   convention nothing checks is a wish. Every level using `miner`, `grub`, `master`,
   `netter`, `sailor`, `kite`, `horn`, `sweep`, `drone` or `stormshaman` was weighted in
   the bot and weighted at ZERO in the tool.
2. **The bot's index was missing a whole term.** It scored threat, kinds and the
   checkpoint gap and did not count HAZARD, so Gale Moor — 235 tiles of spike and drop —
   read thirty-nine points softer in the bot than in the tool.
3. **They disagreed on what counts as out of line**: the bot allowed a drop of 8, the
   tool allowed 6, so the same campaign passed one and failed the other.

`src/threat.js` now holds the table, `spanOf`, `indexOf`, `RAMP_DROP` and `RAMP_WALL`,
and both import it. **If you add a creature, weight it there and nowhere else.**

A hazard the player can turn against them — a battering ram hung on a lever, a firepit —
is weighted LOW. It is not aimed at you until you aim it. `ent('ram')` is a prop, not the
Ram Lord's mount, and scoring it at 4 made Kingswood read eight points harder than it is.

**And the campaign is ACTS, not a line.** Each one opens a little under the last one's
peak and ends above it; that small step down at a boundary is pacing. The rule is there to
catch a COLLAPSE and a WALL, not a breath.

## M. THE BOT CAN PLAY NOW — WHAT IT KNOWS AND WHAT IT STILL DOES NOT

It could only WALK, which is why it reported 16% of Bracken Wood and 7% of the Marsh and
called half the campaign BRUTAL. Those were never findings about the levels; they were the
shape of the bot. It now knows five more things:

- **A MOVER IS FOOTING.** Rafts, pads, lifts, carts, sails and the Undercrown's beam are
  the floor; they are just not tiles. Asking only the tile grid made the whole marsh
  crossing read as a twenty-tile hole.
- **A MOVER'S EDGE IS A GAP, NOT A PLACE TO STAND STILL.** The first riding rule only knew
  how to stop, so it stood politely on a sinking lily pad until it went under.
- **THE JUMP IS SIZED TO THE GAP.** A full 26-frame hold clears six tiles. For a two-tile
  hop it is a way of landing somewhere else.
- **IT POGOS.** A creature under you while you are falling is a STEP, not a threat.
- **IT OPENS DOORS, GOES FOR THE KEY FIRST, AND WALKS BACK FOR ONE.** A shut gate in front
  of it is not "stuck", it is an instruction.

**It still cannot fight.** It swings at whatever is in arm's reach and nothing else - no
blocking, no dodging a tell, no reading a boss. So `BRUTAL` and a low `walked` on a
combat-dense level is still the bot, not the level. What the run genuinely proves is that
nothing crashes, nothing spawns in rock, nothing floats, nothing is unreachable, and the
geometry holds. **It does not prove a level is completable.** Drive it by hand for that.

And when the bot goes BACKWARDS on purpose - forty tiles to a door to fetch the key for the
gate in front of it - `maxX` stops rising and it looks exactly like being stuck. A level
with a door or a gate in it is judged on whether it ever got INDOORS, never on how far
right it walked.

## N. WATER YOU CAN SEE THE BOTTOM OF

`drawWater` has two branches and the one it takes by default paints a swim pool as an
**opaque rectangle over everything inside it**. Every swim pool in the game says
`clear: true` to take the other one - the water goes over the player and the creatures as a
wash, and the level stays visible underneath. The Deep's pool did not say it, and because
that pool is a hundred and fifty rows tall, the *entire level* was hidden: decks, wrecks,
holds, foes, all under one flat sheet of blue, with the creatures apparently standing on
nothing. It took a pixel probe to find, because the tiles were resolved, the sprites were
baked, and the draw call ran - the paint just landed on top of it.

- **Every `swim` pool says `clear: true`.** `tools/newlevel.mjs` fails a level without it.
- A pool the size of a level also wants `wash` (how heavy its water is - 0.5 over a hundred
  and fifty rows is a blue fog) and `grad: false` (the clear-water depth gradient is sized
  for a pond; a level-tall pool carries its own gloom in `L.tall`).
- `L.tall` takes `col` and `deepest` now. Its default is the Hanging Wood's canopy green,
  which is the wrong colour at the bottom of the sea.

And a related one, in the same level and found in the same hour: **one row of planking is a
three-pixel board.** A deck drawn as a single `T.PLANK` row, underwater, in the dark, reads
as nothing at all. A ship has a hull under her deck: lay the board and two courses under it.

## O. ONE REACH MODEL

`src/reachcore.js` is the only flood fill. `tools/reach.mjs`, `tools/audit.mjs`,
`tools/traps.mjs`, `tools/deadends.mjs`, the coin sprinkler and the playtest bot all run on
it. `audit.mjs` used to carry its OWN, written earlier and never updated: it could not climb
DOWN a rope, could not ride a lift, could not follow a door and did not know what swims, so
it called half the Undercrown and the floor of the Deep unreachable and was quietly ignored
for years of rounds. A second opinion nobody trusts is worse than no opinion.

This is the same rule as the THREAT table in `src/threat.js`. When two files answer the same
question, one of them is wrong and nobody knows which.

A rope is climbed DOWN as well as up, by the way - the model had rungs as footing and a jump
that could go up them, and no way to step onto one from directly above. That alone stranded
thirty rows of the mine and everything they led to.

## P. THE BENCH — BOSSES KEPT FOR LEVELS THAT DO NOT EXIST YET

Four fights are still in the code and placed in no level. They are not dead code and they are not
finished: each is waiting for a level that asks its question. Do not delete them, and do not drop
one into an existing level to fill a gap — that is how the Suncatcher ended up on a scree path it
did not belong on.

| Boss | Code | Why it is benched | Before it comes back |
| --- | --- | --- | --- |
| THE HOUND MASTER | `t: 'master'`, `updateMaster` (mounted, whistles pups, flank/pincer calls) | Kingswood already has the Great Hound; two kennel fights in one arc | A kennel or hunt level of its own; its CHARGE is now a yellow `!` (blockable) |
| THE MASTHEAD | `t: 'sailer'` mini, `MINI_NAME.sailer` | The flotilla has the Quartermaster and the Captain already | **Came back** as his own boss, `t: 'masthead'` / `updateMasthead`, at the end of THE SKY SHIP (the sheet winches turn the arena's wind on him). The big `sailer` mini stays benched |
| THE HILL TROLL (big) | `t: 'troll', big: true` (30x36, 3.4x HP) | The scree and moor trolls are regulars; the big one had no room to throw in | A quarry or pass with boulders to answer his |
| THE SUNCATCHER | `updateSuncatcher` | Removed from the Scree: it did not fit the path and its model is poor | A FROST level, a heavy rework, and a new sprite — not a reskin |

A benched boss still has to pass `tools/tells.mjs` while it sits in the code: its marks are audited
like everyone else's, so it comes back honest.

## Q. AMBUSH ROOMS — ONE OR TWO SHORT LOCKED FIGHTS A LEVEL

A corridor never asks for the combat the game has now (stagger bars, knock-into-hazard, shield walls,
wall slams, finishers). An ambush room does. Walk into the middle of a room and both ends drop shut;
dust shows where the first crowd will land; when they are down, a beat, then a second crowd; clear it
and the gates lift with a heart and ten gold.

**What makes a good one**

1. **A place, not a corridor.** A yard, a clearing, a hold, a deck, a cave chamber: somewhere that
   already reads as a spot to be jumped. 25 to 45 tiles between the gates; wider and the fight
   scatters, narrower than the screen (20 tiles) and there is no room to read a tell.
2. **One or two a level**, never back to back, never in a boss or mini room, never over swimming.
   The Shipwreck Reef and The Deep have none for that reason.
3. **Wave one is the crowd; wave two is the lesson.** Two to four foes each from the level's own
   roster (GARRISON/MIX). Wave two is built so the systems matter: a SHIELD (or sworn sword, tideguard)
   in front of a COVERED shooter (archer, crossbow, scout, marine, spitcap...) so the shield plants;
   a POISE_HEAVY body (brute, troll, soldier, pike, boarder, watch) that can be BROKEN; and something
   light enough to throw into the room's own hazard. Where the room has spikes, a crevasse or water,
   put the throwable beside it; where it has none, the shut gates are walls to SLAM them into.
4. **Short.** 20 to 40 seconds for a hero who plays it straight. A wave that runs past 70 seconds
   slinks off by itself, and anything that leaves the room is out of the fight: a room never keeps you.
5. **The door is a checkpoint.** A checkpoint stands just outside every room, never inside it (the
   filler refuses ambush rooms), so a death inside wakes you at the door with the room put back.

**The wiring**

- Data: `AMBUSH[id]` in `src/level.js`, in the level's FINAL coordinates (read them off the built
  grid, `node tools/map.mjs`): `{ name, row, wallL, wallR, y0?, trigger?, check?, gold?, waves }`,
  a wave being `[[creature, x, y?, extra?], ...]`. `row` is the row the floor stands on (an entity's
  y); `check: [x, y]` places the door checkpoint by hand, `false` when one already stands there.
  A builder can also return `ambushes` itself; `grow()` shifts them (they are in tiles).
- `ambushRooms()` runs after REVIEW and before the garrison: it empties the room of its own creatures
  (hazard machinery stays), drops checkpoints inside it and adds the door one. `garrison()` and
  `checkpoints()` both skip ambush rooms.
- Runtime: `updateAmbush` in `src/main.js` (from `updateProps`). The gates are PORT tiles laid over
  AIR by `closeGate` on each wall column's own floor, up to ten high or the ceiling (`ambushWall`); only
  the tiles the room laid are taken up again, so a winch or key gate sharing a column is left alone.
  Foes come through `spawnEnt`, dropped in from above where there is air to fall through (not the
  `AMB_STILL` kinds, which have no legs to fall on). `ambushReset` (from `spawnEntities`) puts an
  unfinished room back on death; a cleared room stays cleared. `BK.ambushes()` shows the state.
- `tools/curve.mjs` counts the waves as part of the level, and `levelFoes` counts them in the body count.
- Prove a new one in the page: it locks, both waves spawn and land, it opens and pays, and a death
  inside resets it and it locks again; then hold a direction with jump, dodge and drop against both
  gates and check the hero stays in. The reach model is not the proof: it hops a one-tile-wide wall
  it should not.

## R. EVERY DEAD END PAYS

Looking at the flooded tunnel in THE DEEP that runs fifty tiles and stops at a rock wall with nothing
in it: *"Whenever there's a dead end like this, like in the deep, there needs to be some type of
collectible."* A walk to a wall and back is a price, and the level has to pay it.

**What a dead end is.** `src/deadends.js` builds the movement graph from the reach fill (rides on)
and gives every tile a DETOUR: distance from the start + distance to the goal - the best route.
Walking into a pocket raises it two a tile (in, and back out); a loop, or a ledge that drops you on
ahead, leaves it flat. A dead end is a peak of detour standing at least FIVE tiles above the junction
it hangs off: on land, in water (a flooded tunnel, a sunken passage, the water under a hull) or up
high (a ledge or a branch that leads nowhere). Not dead ends: open water (a swim more than eight tiles
thick both ways is a room), a boss or mini arena, an ambush room, the tiles behind the start, anything
past the goal, and a pocket with a doorway, gate, keeper, lever or winch at its end - that is why you
went.

**What pays.** Within reach of the last six tiles: a silver, a quest stray, a relic, a key, a stash
heart, or a coin cache of FOUR or more. One coin does not pay. A sign does not pay.

**How it is paid.** `payDeadEnds()` in `src/level.js` runs after `sprinkleCoins` and before
`dressLevel`, on the built level, so a new level is paid without anyone remembering to:
- a cache of 5 coins, one more at 12 tiles, 20 and 32, packed against the far end (two high on land,
  a block under water);
- a heart that waits until you need it (ent `mend`) when the pocket is 20+ tiles, a 12+ tile swim,
  has spikes in it, or ends in a current - a current drifts loose coins (and through rock), so no gold
  is laid in flowing water and the heart, which stays put, pays that pocket; it goes beside the prop,
  never on its tile, or the prop is drawn over it;
- the level's own stash prop on the last floor tile (`STASH`): a sea chest on the bed, a loot heap in
  a goblin place, plunder on a ship, a cairn on the crags, a stump or a mushroom in the woods.
- Never a silver (a level keeps three: `silverTrim`, and the ledger reads three bits), never a quest
  stray or a key (those are counted). Never on spikes, in a deadly pool, or on a sign, door or
  checkpoint.

**The check.** `node tools/deadends.mjs` (`deadends` in `npm run check`) lists every pocket per level -
where, how many tiles, land/water/air, what is at the end - and fails on any that is unpaid. If the
pass cannot pay one (no free tile at its end), hand-place something there in the level's REVIEW entry.
If a pocket is not a dead end at all because the model cannot see the ride out of it, fix the model
(`src/reachcore.js`), not the check. (The model once let a swimmer leap out of a "surface" under two
rows of rock, and that alone hid the Deep's tunnel.)
