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
| `SLOW` | odd | the worst frame in the level cost more than 18ms |
| `DARK` | odd | more than half the sweep frames were nearly black |
| `LONGGAP` | odd | more than 150 columns with no checkpoint |
| `THIN` | odd | fewer than three kinds of creature in the whole level |
| `RAMP` | odd | a level out of line with the one before it |
| `BRUTAL` | odd/note | the bot died a great many times getting through |
| `ASSISTED` | note | outside the reach fill on a level with movers, gusts or doors: may be a ride away |
| `UNWEIGHED` | note | an entity type with no threat weight, so the balance figures do not count it |

**Keeping it honest.** Two sets in `playtest.js` hold the things that LOOK wrong and are not: `INROCK_OK`
(a gunport is a hole in a hull, a window is a hole in a house) and `INROCK_FOE` (an urchin lives in the sea
bed, a grub lives in the rock). A silver is a collectable and hangs in the air on purpose, so it is not
furniture. Add to those sets rather than ignoring a finding — an ignored finding comes back every run.

**When to run it.** Before every deploy that touched a level, a creature or the draw. It takes about a minute
for the whole campaign. If the BUGS column is not empty, do not ship.
