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
