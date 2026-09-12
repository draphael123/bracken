# Where BRACKEN is, and what is next

Live at bracken-nine.vercel.app. Deploy with `vercel deploy --prod --yes`, then `git push`.

## What just shipped (the playtest queue, worked through end to end)

Daniel played the sea arc and the drowned city and filed sixteen reports. All of them are in, plus the first
slice of the polish pass he asked for after them. In the order they were fixed:

**THE HURRICANE DECK stopped being seven hundred tiles of the same planking.** Five things you remember, each
a place rather than a stretch, and each built out of a verb the game already has: HER HEAD (the figurehead
hung under your feet at the bow, her bell, her anchor); HER GUN DECK (four laid guns on the orlop, the last
trained on her own magazine bulkhead — fire it and the powder room is yours); HER OIL PUMP (work the beam and
the foul water goes down to her bilge for twenty seconds, which is the only way to walk under the wreck); THE
DARK HOLD (no lamp back here in a year: the only light is the sky through her deck seams); and her waist is
no longer a pavement — rot that gives under a standing weight, fallen spars, holes to jump, three more
swinging cargoes, and the great cabin at the end of her.

**NOTHING STANDS IN THE AIR.** The floating-props sweep the audit had been asking for since the barrels: the
bell, the anchor and the oil sign on deck, the plunder on her bottom (she is aground now, so the oil has a
floor), the two rams that a lever DROPS saying so with `hang`, the ravine cache lying in its net on purpose,
the ditch coffer down the two rows to the floor. All sixteen levels: zero floating props.

**THE QUARTERMASTER'S CLIPPING.** Her deck span was the whole main deck and the only thing that had ever
stopped her was that span's two ends, so she strode straight through the companion house amidships and leapt
through it as well. The ship is in her way the way it is in yours now, and the leap goes up her own rigging,
along above the deck she is leaving, and down onto the one she is taking. Measured over all three phases,
twice: zero frames with any part of her inside a solid tile. Her ship also keeps its footings — the planking
that falls away in phase three used to run out from under the companion house and the stern castle.

**A BODY LIES ON THE BRIDGE IT DIED ON.** Corpses only ever stopped on solid rock, so everything killed on a
rope bridge, a gangplank or a one-way deck fell through the boards and came to rest underneath — dead men
hanging off nothing below the walkway, which is exactly what was reported. A plank catches a body from above
the same way it catches your feet, and rests it on the board; a rope net still does not.

**FOUR FLOORS, FOUR ROOMS.** "Something got mixed up with the goblin queen's area, it's right after the
forgemaster?" It was not — the chapel is between them — but every room in Highcrown was drawn with HER wall,
so you came up out of the armoury into gilt pilasters and hung tapestries and the Queen appeared to be
standing behind her own smith. The castle wears a room per floor now: the guardroom (cold ashlar, a black
wainscot, an arrow loop with the night through it, a shield hung beside each), the kitchens (soot, a chimney
breast with the fire still in it, a pot crane, onions on a nail), the armoury (iron lit from the floor by the
coal, a rack of blades and a bellows per bay, sparks), the chapel (pale stone, a rib vault, a lancet of
coloured glass on a sill laying its bar of colour down the wall) — and HER HALL, the only royal room in the
castle and richer than it was: a gilt cornice over a frieze of lozenges, a bay every four tiles with a
tapestry hung on its rod in an arched recess (folds, gold border, fringe, her device woven in the middle), a
green-and-gold chequer dado, and her chandeliers burning.

**THE FIRST POLISH SLICE**, all of it read off screenshots of the real game: the gold count ran off the right
edge of the screen at six characters, so the whole right cluster hangs off one margin now and its plate is cut
to fit; the quest line got a plate; the timer stopped being a bare mono readout in the middle of the sky; the
talent badge went from a green banner the width of a sentence to a tab; "press a key for sound" went from grey
text parked over the play field forever to a plate for ten seconds and then a speaker glyph in the corner; and
the win and death panels, which were laid straight over a bright busy level so the trees read through the
text, now drop the world two thirds behind them. The map's header strip is solid, so the town on its north
edge stops being cut off by the top of the screen.

## The polish pass

The core was not the problem. The world art, the combat feedback, the transitions (there is an iris on
entering a level and a fade between screens) and the audio were all already there, and the player himself has
squash, dust off his heels, skid, landing rings, hitstop, zoom kicks and per-surface footsteps. What read as
prototype was the furniture around it. Done so far:

1. **THE HUD.** A right margin (the gold count used to run off the screen at six characters), plates under the
   quest line and the timer, a tab instead of a green banner for unspent points, and a sound notice that is a
   plate for ten seconds and then a speaker glyph. The win and death panels drop the world behind them. The
   map's header strip is solid.
2. **THE GROUND.** Strata by depth - loam with root hair, clay with gravel seams, a cold bottom with bedrock -
   and about one tile in twelve holds a sherd, a bone, a nail or a coin nobody came back for.
3. **THE SECOND READ ON EVERY ENEMY.** A wind-up wears a pulsing amber rim (one hue, one meaning, all eighty
   creatures); white is back to meaning "you hit it". Being struck throws the body along the line of the BLOW
   and leans it. Anything that whips round at speed skids first. `drawSet` learned to rotate.
4. **THE END OF A LEVEL.** The tally comes in a line at a time with the figures counting up, and the medal is
   stamped on at the end of it with a ring, a shake and a zoom kick.

Left on that list:

5. **THE FIRST NINETY SECONDS.** The wood opens on a sign and a sprig. What a new player sees first is what
   they judge the whole thing by.
6. **THE STORE AND EQUIP SCREENS** - the store is in better shape than expected (tabs, preview panel, footer);
   its currency row at the top right is three unlabelled icons and a bare number.

## Still open from before the playtest

- **Balance the boss-rush ramp.** Nineteen fights in an order nobody has measured. A `bench(ix)` harness is
  written and works (the Hornet Queen measures 42.1 s); the sweep of all nineteen was interrupted.
- **Play the old levels with the new verbs.** The dash and the mantle change what a gap means and the first
  fourteen woods were authored without them.
- **The reef's either-way stretch**, the archer's bow and the cook sprite, and teaching `reach.mjs` to swim.

## The tools, every time

```
node --check src/main.js && node --check src/level.js
node tools/comments.mjs && node tools/content-audit.mjs && node tools/audit.mjs
node tools/newlevel.mjs && node tools/reach.mjs && node tools/deadends.mjs && node tools/traps.mjs && node tools/quality.mjs
```

`RULES-LEVELS-AND-BOSSES.md` is the law and the tools enforce sixteen of it.
