# Where BRACKEN is, and what is next

Live at bracken-nine.vercel.app. Deploy with `vercel deploy --prod --yes`, then `git push`.

## What just shipped

**LEVEL 15 — THE LAMPLIT STREET.** A stone city a hundred feet under the sea, 700 columns, and one rule said
three ways: **THE LAMPS ARE AIR.** A lit lamp is a light in the dark, a lungful of air under its hood, and a
thing that can be taken from you; you take fire off a burning one and carry it to a dead one to open a route.
Two roads all the way along — the dry broken roof road at row 22 and the flooded street at row 38, with the
water line inside the masonry between them so nothing in the street can reach a surface. The tide runs down
the street and turns on a timer. Seven sections: the descent past the tribute ship, the fish market, the
market hall (**THE LAMPREEVE**, who walks to the nearest burning lamp and hoods it), the counting house (the
vault crowns ARE the air), the lamp works (work the beam and the procession road drops to wading depth and
its dead lamps come up), the procession road, and the toll gate (**THE TOLLMASTER**, carried on a bier:
parry the ledger, dodge the weight, jump the rod, and he puts the lamps out a ring at a time; phase two sets
the bier down and the bearers come off it, phase three fills the square to its vault).

New art: `city_tiles.js` (drowned masonry, a chain to climb, four parallax layers and no sky at all),
`city_props.js` (the streetlamp in three states plus fifteen more), `redraw/city.js` (the drowned watch, the
Lampreeve, the Tollmaster). New relic: **THE LAMPLIGHTER'S WICK**. Two new boss-rush fights.

**The screens between fights.** The talent tree had three things written on top of each other and cut every
description at two lines; the hero card showed one skill where the hero holds two and ran off its own panel;
the bestiary cut eight of its eighty entries off mid-sentence and pointed F at the wrong boss. All fixed.

**Sound.** Twenty-four of the eighty creatures had no death voice and fell back on one generic noise; all
eighty have their own now. Enemies no longer swing with the player's own sword sound: `foeSlash`, `haft` and
`pole` are theirs.

**The map** has life on the road between woods: boots print in the dirt, dust comes off them, and a bird goes
off its branch, a hare two hops into the bracken, a fish out of the river as you pass. The drowned city's
node breathes bubbles.

## Next, in the order I would take it

1. **Balance the boss-rush ramp.** Nineteen fights in an order nobody has measured. `tools/balance.mjs` plus
   a bot sweep: time-to-kill and idle-survival for each, then re-order.
2. **Play the old levels with the new verbs.** The dash and the mantle change what a gap means and the first
   fourteen woods were authored without them. Nothing became unreachable (the suite reports identical
   numbers) but some gaps are now trivial. That is a design question, not a bug.
3. **The reef's either-way stretch**, and air as a planned resource rather than a timer, now that the city
   has taught the idea properly.
4. **The next feel tier**: hurt poses for the shield goblin, the soldier, the brute and the hound (six are
   done, these are the next most-met); a tell colour on the parry window; skid and turn frames for the
   earned run.
5. **The archer's bow** is one pixel thick and the cook is a pale blob — the two weakest sprites left after
   the contact-sheet pass. The brute was the worst and is fixed.
6. `tools/reach.mjs` calls the reef's start walled in because it cannot swim: teach the model water, or
   whitelist a swim start, so the check keeps its teeth.

## How to work on it

Read `RULES-LEVELS-AND-BOSSES.md` first — every rule in it was earned by something going wrong, and the
tools enforce fifteen of them. Run the staples after any level edit:

```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs && node tools/newlevel.mjs
node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```

Verify in the harness, never by eye: `BK.load(i)` then `BK.state = 'play'`, real `KeyboardEvent`s for input,
`BK.tp(tx, ty)` to move, `BK.rushStart(i)` for one fight, and `BK.SPR` to put a sprite on a contact sheet.
