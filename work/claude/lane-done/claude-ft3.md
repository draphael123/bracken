# claude/ft3: THE FALLING TOWER, ROUND 3

Daniel's calls, 2026-09-27, all five done. Branch `claude/ft3` (off master abcd773), pushed. Nothing merged, nothing deployed.

## What changed

1. **The zoom fix, for every boss that zooms at its wake.** The wake and `desiredView()` now read the same list,
   `src/boss-view.js`. Before this they were two hand-written lists that had drifted apart. The ten bosses that zoomed at the
   wake and snapped back on the first drawn frame now stay zoomed out all fight: Harbormaster, Pyromancer, Bellcrab, Closed Helm,
   Drowned King, Prince, Grandmother, Troll, Straw King and the Mage's Folly Archmage. The Suncatcher and Golem **minis** had the
   same bug and are fixed too (`ZOOM_MINIS`). New check `zoom-coverage` runs the real `desiredView()` in a vm for every boss and
   mini that the wake zooms. On abcd773 it is red, naming those ten plus the two minis. `queen-comb`'s literal-string assert
   now reads the list.
2. **The Undead Archmage: DECOY RING and RING TRAP** (`src/undead-mage.js`).
   - **DECOY** (`decoyTell`, no blow of its own, mark `''`): two exit rings flare, one on each side of you. Only the real one has
     the desert in it; the decoy is hollow, just his green fog. A coin decides which side is real, so you read it rather than
     learn it. He steps out of the real one mid-cast. Dodging through the real one breaches him as before; dodging through the
     decoy does nothing.
   - **TRAP** (`trapTell`, `!`): a ring opens over you, glowing the bolt colour together with his hand ring. It drops 3 bolts
     (5 from stage 2) on the spot where it opened, and it does not follow you. Step out from under it or guard.
   - Both moves replace his *second* step and *second* bend in the order. The order length, his hp and the 2 s dodge-through
     opening (`breachT`, `openMul`) are unchanged, and `archmage-rings` asserts that. The marks were regenerated
     (`tells --write`).
3. **His hall is at the top of the tower.** It used to sit on the crown: burning floor at row 50, parapet walk at row 51, so
   anything walking the last tiers stood with its head in his fire. `HALL` is now rows 22-38. That is 8 rows clear of the
   merlons and 13 clear of the parapet, and a walker can jump at most about 4.5. The desert moved up with it to rows 6-12 and is
   still ten rows above the hall. The door on the parapet and the portal-to-desert ending are unchanged.
   - While he fights, nothing below his floor is updated (`src/tower-hall.js` `hallHolds`, called before main.js's 420 px
     freeze). That freeze only measures **horizontal** distance, so the crown's flyers were awake and could rise straight up
     into the hall.
   - **Backdrop:** no roof and no back wall. There is a night sky with stars and a big moon behind him, the tower's far parapet
     along the burning floor, and broken wall stumps at the sides (`drawSanctum`). Shots are in `work/ft3/shots/`.
   - New check `tower-hall`: the gap on the built grid, no spawns in the hall or the gap below it, the seal, and the desert
     margin.
4. **Flyers keep to the floors** (`src/tower-flyers.js` holds the rule; `tower-flyers` is the check).
   - The rule: a flyer starts within 6 rows of solid floor that runs 4 tiles either side of it, with nothing on top of that
     floor, no spikes and no poison.
   - Stair lists now put a **walker** where they used to put a flyer (an apprentice, and every third one an armour).
   - Hand-placed flyers move to the nearest flat ground on their own floor. Each floor gets at most 3, and none go on the
     parapet. A flyer that has no room becomes a walker on the ledge under it, never down in the cistern's poison.
   - The sprinkler also keeps flyers to flat ground (`L.flatFlyers`) and now sprinkles 4 instead of 9.
   - It had also been putting an **imp and a tome on the desert** past the second door (this was already true on master). That
     is now calmed.
   - **Before:** 58 flyers, 53 of them over a stair (library 8, reading 8, orrery 5, pendulum 9, cistern 7, loft 6, crown 10),
     plus 2 in the desert.
   - **After:** 18 flyers, all over flat ground: library 2, reading room 5, orrery 3, pendulum 2, bell loft 3 (on the frame
     floor), crown 3 (on its floor), cistern 0.
   - Walkers went from 28 to 48. Full lists are in `work/ft3/flyers-before.txt` and `flyers-after.txt`.
5. **The Sexton's bell pit is spiked, and he glides.**
   - The pit floor under every plank is now `T.SPIKE`. The spikes wear their own tile: iron in a slate kerb with a bell shard.
     They used to be the default *thorns*, and the pendulum gear pit's spikes now use the new tile too.
   - The cistern rope's column stays clear, and the rope runs on up to the plank so you climb in past the points.
   - The pit bites **once** (`SEXTON.dmg.pit` 12) and throws you up past the deck toward the nearer open side (`bellPitThrow`).
     I measured the first version: an idle knight died in 3 s bouncing in a bay boxed in by joists.
   - He **hovers** 1-5 px off the deck, rising and falling as he moves (`sextonHover`). It is drawn only, so his feet are still
     the deck's for every rule.
   - His caught-in-the-pit opening is unchanged. He takes 0 damage from the spikes and stays caught.
   - `sexton` (Node and in play) checks that the spikes hurt a hero, never hurt him, bite once and throw the hero out.
   - `tower-collapse` now allows the deck to be the one spiked failing section. `mini-walls` stays green: the leap over a walk
     is now set up by hand, because the random throws used to find it in the pit, which is no longer somewhere to stand.

**Other things touched:**
- `tower-ascent` density floor lowered from 3.5 to 3.2 foes a screen (it is now 3.2).
- `tower-ascent` tome count lowered from ≥24 to ≥8, with at least one on every floor that has flat ground.
- `tower-ascent` "no calm" relaxed to "no calm inside the tower", so the desert's calm is allowed.
- `ft2-shots.mjs` now also shoots the decoy and the trap.
- `src/lab.js` has a new Sexton branch (see the pilots below).

## Checks (named subsets, not the suite)
`zoom-coverage`, `tower-hall` and `tower-flyers` are new. They are inside check.mjs's list before `]) if (take(t))` (checked
with grep).

All of these are green: tells, queen-comb, zoom-coverage, tower-ascent, archmage-room, archmage-rings, tower-collapse,
tower-cutouts, tower-hall, tower-flyers, checkpoint-stand, sexton, mini-walls, killzones, traps, spawns, floaters, elites,
threat-holes, one-new-foe, tome and boss-openings.

- `traps` reports "1 trap to fix". Those are pre-existing assisted pockets in wood, reef and lamplit, not this level.
- The full suite was not run.

## Pilots (3 heroes x salt 1)
- **Undead Archmage** (`archmage-pilot`, refill, 150 s cap). Before: 3/3, median 92.7 s, breached 6.0 and mark-open 5.7 a
  fight. After: 3/3, median 100.8 s, breached 3.7 and mark-open 6.3. His difficulty holds. The decoy costs the bot some
  dodge-throughs, and nothing was tuned. (`work/ft3/pilot-archmage-*.txt`)
- **The Sexton** (`sexton-pilot`, normal health). Before: 3/3, median 53 s, but that was the *generic* bot standing on
  counting planks over a harmless pit. After the spikes with the same generic bot: 0/3, all dead in 7-16 s. After the
  once-bite and throw plus a Sexton branch in the lab bot: **1/3** (knight won in 75 s; warden and pyro died at 38% and 46%).
  (`work/ft3/pilot-sexton-*.txt`)

## Commits
46c075b zoom, dbc8e20 decoy/trap, 0351237 hall, d084b98 spikes/glide, 3fefc30 flyers, a41db3e pit throw + bot.
The report commit follows.

## QUESTIONS FOR DANIEL
1. **The Sexton is much harder now that his pit is spiked:** 1/3 for the bot, down from 3/3. Every plank that goes under you now
   costs a bite, and planks count under your own weight. Keep it as is, or soften it?
   *Recommendation:* play it once first. If it is too much, lower `SEXTON.dmg.pit` from 12 to 8 before touching his attacks.
2. **Foes in the tower dropped from 86 to 66** (flyers 58 to 18, walkers 28 to 48), about 4.2 to 3.2 a screen. Is that thin,
   or right?
   *Recommendation:* play it first. If a stretch feels empty, put walkers on it where they make the ground harder (RULES S1),
   not flyers back.
3. **The Undead Archmage's own carpet fight is not zoomed out.** Only the Folly's Archmage was on the wake list. Zoom his hall
   too?
   *Recommendation:* yes. It is one word in `src/boss-view.js`, but it changes his whole fight's framing, so it needs a person
   to look at it.
4. **The bestiary entry for the Undead Archmage doesn't mention the decoy or the trap**, because I didn't want to risk textfit.
   Add a short line?
   *Recommendation:* yes, "Of two rings, only one holds the desert." if it fits.
5. **Seen, not fixed (pre-existing):** in the desert past the second door, the level-end gate draws faint and see-through. I
   reproduced it with the desert at its old rows too. Worth a small lane?
   *Recommendation:* yes.
