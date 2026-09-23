# THE BURNING VILLAGE — build plan

Setup agreed with Daniel in `.claude/briefs/burning-village-pitch.md`. This is how it gets built, in the
order it gets built, against the rules the campaign already keeps (`RULES-LEVELS-AND-BOSSES.md`) and the
density bar the audit set (`docs/audit-new-levels-0920.md` §8): >=3.5 creatures a screen, >=3 standable
heights on most screens, a prop the player works every three screens, >=4 creature types with different
answers, and a boss with a loop the player drives.

## Where it sits

`{ id: 'burning', name: 'THE BURNING VILLAGE', sub: 'the goblins came down the road', needs: 'stockade' }`,
between THE STOCKADE and SPOREWOOD, on the wood sheet of the world map between those two nodes. Music: one
of the existing CC0 chiptunes until a track of its own is picked (never a synthesised placeholder - that is
what the four new levels got wrong).

## The five systems, cheapest first

### 1. FIRE THAT SPREADS (the level's own mechanic)
A `L.fires` grid of burnable cells over thatch, timber and hay tiles. A cell has `heat` and three states:
unlit -> catching (dust of embers, ~1.2s warning) -> alight (damages, lights the room) -> burnt out (safe,
black). Spread is to neighbours on a timer, and ONLY from a cell lit by the Pyromander or one of his burning
goblins: Daniel's rule is that the village's own background fire is authored dressing and does not creep.
Water (troughs, the well) sets a cell back to unlit. This is the one new system; everything else reuses what
exists.

### 2. THE VILLAGERS (the goal)
`folk` entities in burning buildings, marked `trapped`. Cutting the boards frees one; it runs for the gate
and is counted. Cannot die - the fire only pins them. HUD count like the crown cache's, and the level card
shows rescued/total. They are the reason to go INTO the burning buildings rather than past them.

### 3. THE BURNING GOBLIN (new creature)
A goblin already alight: the Stockade's goblin build with permanent `burn`, its own light, and embers coming
off it. It fights like the goblins the player knows, but what it walks past catches, and where it dies the
ground catches. Killing it near thatch is a mistake - that is its whole idea. Reuses: goblin sprite and AI,
the existing `burn` field, the fire grid above.

### 4. THE WISP (new creature)
A drifting ember-spirit whose TOUCH is the attack - almost unique in this game; the contact-damage exclusion
list in `main.js` (~line 6858) is where it must NOT go. Because a touch-attacker has no windup, it gets its
readability from colour and pace: bright, slow, wide turning circle, and it never traps you in a corner.
Two or three per screen at most.

### 5. THE PYROMANDER (the boss)
A renegade human Pyromancer, fought in the village square. He runs **the player class's own kit**: the
firedrop plunge, ember shots, the bellows cone and Vent - and **the class's heat meter**, drawn over his bar.

- Heat rises as he attacks, exactly as it does for the player.
- **At full heat he overheats: that is the opening** - the same rule the class lives by, taught by fighting it.
- **The square catches as his heat climbs** (Daniel's answer): patches of the village square go from catching
  to alight as the bar fills, and clear when he vents. So his heat is both his damage and the floor the
  player has left, and the player chooses between punishing him (more heat, less floor) and letting him vent
  (safe ground, no opening). That is the loop.
- No mini-boss in the level: the fire is the obstacle.

## The route (about 520 tiles, six sections)

1. **THE ROAD IN** - the first burning goblin, one wisp, a cart alight. Teaches: fire hurts, and what the
   burning goblin does to thatch.
2. **THE CROFTS** - first trapped villager behind a burning door; a water trough that puts a cell out.
   Teaches: fire can be fought locally, and rescues are the point.
3. **THE LONG STREET** - the density section. Goblins, burning goblins and wisps together, roofs to climb
   so the street has three heights, and beams that drop when their cell burns out.
4. **THE BARN** - the set piece: one big interior, two villagers, the fire crossing it while you work.
   A backdraft when a door is opened at the wrong moment.
5. **THE WELL YARD** - a breather with water, the last rescues, and the way up to the square.
6. **THE SQUARE** - the Pyromander.

## Tests it must ship with (`tools/burning-village.mjs`, in `check.mjs`)

- Fire spreads only from the Pyromander's and the burning goblins' fires; authored background fire does not creep.
- Water sets a catching cell back to unlit.
- A trapped villager is freed by a real attack input, runs, and is counted - and cannot be killed by fire.
- The wisp damages on contact and nothing else; every other new creature damages only by its attack.
- The Pyromander's heat rises with his attacks, overheat opens him, the square burns with the bar and clears
  when he vents.
- All six heroes clear him on normal health, and the 90-150s timing band.
- The level meets the density bar: >=3.5 creatures a screen, and no run of flat screens like Burial's.
