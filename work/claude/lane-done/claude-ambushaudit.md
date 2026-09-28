AMBUSH PLACEMENT AUDIT (claude/ambushaudit)

Brief: singleAmbush() (src/ambush.js) keeps 1 elite + the first three non-elite, non-overlapping foes in
source order and silently drops the rest of whatever a level's wave table lists (claude/hanging2, 2026-09-28:
the Hanging Village's archer + cutter never spawned in the live game because of exactly this). Build (1) a
check `ambush-listed` that names every level losing foes this way, red on master. (2) Fix each offender's
LEVEL wave table so the foes that matter spawn within the rule, or drop the redundant ones and say which.
(3) List (don't fix) any cutter/tippler/etc. placed with no prop it needs.

WHAT CHANGED

1. New check tools/ambush-listed.mjs (registered in tools/check.mjs's list and header comment). It builds every
   level, reads what each ambush's own wave table LISTS (scans the source for every `waves:` block and its
   ambush `name:`, parsed with real bracket-balancing so it survives nested arrays/objects), then reads what
   L.ambushes actually SPAWNS post-singleAmbush(). It's red whenever a foe TYPE the table lists never spawns
   at all - it does NOT flag simple duplicate-count loss (a second copy of an already-spawning type), only a
   type that vanishes completely, because that's what the hanging finding was about and what actually reads as
   a missing encounter beat in play.
   - It knows about one intentional runtime substitution: src/haunted-coast.js renames a surviving 'wight' to
     'lanternshade'/'bonecorsair' for lamplit only (level review, 2026-09-24) - that's not a drop, so it's
     treated as satisfied.
   - It knows about the four levels explicitly left to their own in-flight branches (hanging, spore, spire,
     oreroad - see below) and excludes them from the pass/fail assertion, but still prints their numbers.
   - On current master (before this lane's fixes) it named 19 of 24 ambushes losing at least one foe type.
     After the fixes below, only the 4 explicitly-excused ones remain red.

2. Fixed 15 levels' AMBUSH wave tables (src/level.js's AMBUSH table, its two inline ambushes.push() calls for
   moor and mage, and src/burial-caverns.js's THE CHARNEL HOUSE) so every foe the table lists is one that
   actually spawns. In every case this meant: collapse the (now-fictional) two-wave table into the single wave
   singleAmbush() really uses, keep the room's existing captain exactly as master already resolves it (double-
   checked against AMBUSH_CAPTAINS / the elite-flag / the AMBUSH_LEADERS fallback search, so no room's leader
   changed), and prefer DISTINCT foe types over a second copy of a type already in the room for the three
   support slots - "fewer, better foes" reads as maximum variety within the 1-elite+3 rule, not a wasted
   duplicate. Where a room genuinely lists more than 4 distinct types (the rule can't be stretched - brief says
   keep it), the extra types are cut from the source table itself and the comment says which and why, instead
   of leaving them in the table to keep vanishing silently.

   Two of these fixes turned out to be the SAME extra bug, not just a reorder: kings' shield and moor's troll
   both carried a {elite:true} flag that was actually vestigial - AMBUSH_CAPTAINS[id] (archer for kings, goat
   for moor) always wins captaincy over a tuple's own elite flag, AND singleAmbush()'s "rest" selection
   explicitly excludes anything flagged elite (`!f[3]?.elite`) - so neither shield nor troll could EVER spawn,
   regardless of source order. Both flags are removed and the foe reordered into a normal rest slot, so they
   now actually appear (shield: the "shield covering an archer" pattern common.md itself gives as the example
   of a designed encounter; troll: restored as the room's one heavy unit instead of a second goat).

PER-LEVEL TABLE (listed = every foe type the source wave table named; spawned = what actually appears in the
built room; before/after are what ambush-listed reports)

| level | ambush | listed (before) | spawned (before) | dropped (before) | spawned (after) | dropped (after) |
|---|---|---|---|---|---|---|
| wood | THE BRAMBLE RIDE | sprig,sprig,thorn,badger,shield,spit,thorn,crow | shield,sprig,sprig,thorn | badger,spit,crow | shield,sprig,thorn,badger | spit,crow (cut, budget: 6 distinct > 4) |
| marsh | THE REED ISLAND | hopper,turtle,thorn,archer,heronfoe,spit | thorn,hopper,turtle,archer | heronfoe,spit | thorn,hopper,turtle,archer (unchanged - already optimal) | heronfoe,spit (cut, budget: 6 distinct > 4) |
| stockade | THE KENNEL YARD | sprig,sprig,hound,hound,shield,archer,sapper | archer,sprig,sprig,hound | shield,sapper | archer,sprig,hound,shield | sapper (cut, budget: 5 distinct > 4) |
| kings | THE KING'S ROAD | thief,thief,sprig,hound,shield,archer,hound | archer,thief,thief,sprig | hound,shield | archer,shield,thief,hound | sprig (cut, budget: 5 distinct > 4; shield's elite flag was vestigial - see above) |
| scree | THE GOAT TRACK | goat,goat,sprig,harpy,shield,archer,troll,rockgoblin | troll,goat,goat,sprig | harpy,shield,archer,rockgoblin | troll,goat,sprig,harpy (unchanged pick - already optimal) | shield,archer,rockgoblin (cut, budget: 7 distinct > 4) |
| storm | THE MARKET SQUARE | sprig,sprig,hearthgob,cutter,shield,archer,pike | pike,sprig,sprig,hearthgob | cutter,shield,archer | pike,sprig,hearthgob,cutter | shield,archer (cut, budget: 6 distinct > 4) |
| longwater | THE SLUICE BRIDGE | scout,scout,crab,crab,tideguard,scout,netter,heronfoe | tideguard,scout,scout,crab | netter,heronfoe | tideguard,scout,crab,netter | heronfoe (cut, budget: 5 distinct > 4) |
| flotilla | THE WAIST | cutlass,cutlass,scout,crab,boarder,marine,bosun,cutlass | boarder,cutlass,cutlass,scout | crab,marine,bosun | boarder,cutlass,scout,crab | marine,bosun (cut, budget: 6 distinct > 4) |
| causeway | THE DROWNED CHAPEL | sailor,sailor,crab,netter,tideguard,scout,sailor,crab | tideguard,sailor,sailor,crab | netter,scout | tideguard,sailor,crab,netter | scout (cut, budget: 5 distinct > 4) |
| hurricane | THE WEATHER DECK | sailor,cutlass,scout,boarder,marine,bosun,lookout | cutlass,sailor,scout,boarder | marine,bosun,lookout | cutlass,sailor,scout,boarder (unchanged - no duplicates to trade, already optimal) | marine,bosun,lookout (cut, budget: 7 distinct, none duplicated, > 4) |
| lamplit | THE LAMP ISLAND | scout,scout,wight,crab,tideguard,scout,watch,snuffer | watch,scout,scout,lanternshade(wight) | crab,tideguard,snuffer | watch,scout,wight(->lanternshade),crab | tideguard,snuffer (cut, budget: 6 distinct > 4) |
| waymeet | THE MARKET HALL | swornsword,runner,swornsword,hedgeknight,swornsword,crossbow,swornsword,hedgeknight | hedgeknight,swornsword,runner,swornsword | crossbow | hedgeknight,swornsword,runner,crossbow | none - only 4 distinct types were ever listed |
| mage | THE READING ROOM | broom,broom,armour,armour,imp,broom,broom | armour,broom,broom,armour | imp | armour,broom,imp,broom | none - only 3 distinct types were ever listed |
| moor | THE CAIRN RIDGE | goat,goat,rockgoblin,crow,rockgoblin,troll,goat | goat,goat,rockgoblin,crow | troll (unspawnable - vestigial elite flag) | goat,troll,rockgoblin,crow | none - troll's elite flag removed, now fits |
| burial | THE CHARNEL HOUSE | zombie,bonegob,zombie,bonearcher,husk,bonegob,zombie,bonearcher,wight | husk,zombie,bonegob,zombie | bonearcher,wight | husk,zombie,bonegob,bonearcher | wight (cut, budget: 4 distinct non-captain types > 3 slots - see QUESTIONS) |

LEFT UNTOUCHED (per brief - merging in from their own in-flight branches; still offend on master, ambush-listed
excuses them by id so they don't fail the suite, and prints them so nobody forgets):

- hanging (THE CLIFF HALL): archer, cutter dropped. Fixed on claude/hanging2 (the finding that opened this
  audit) - not touched here.
- spore (THE UNDERCAP): spitcap, weaver dropped. claude/sporewood2 in flight.
- spire (THE CLOISTER): bat, harpy dropped. claude/monastery3 in flight.
- oreroad (THE SORTING FLOOR): bat, sheargob, tippler dropped. claude/oreroad2 in flight - per this lane's
  instructions, Ore Road's ambushes are explicitly skipped even though the same offense is present. Noting it
  here rather than fixing it.

CUTTER/TIPPLER-STYLE "NO PROP IT NEEDS" AUDIT (listed only, not fixed - out of this lane's scope)

Found something bigger than a per-tuple issue. `updateCutter()` (src/main.js:17978) only performs its bridge-
chop routine when `L.bridges` has an entry matching the cutter's own `bridge:` x-coordinate
(`const br = (L.bridges || []).find(b => b.x === e.bridge)`); otherwise it falls straight into the "the rope is
gone" branch and the cutter behaves as an ordinary chaser from the moment it wakes. Searched the whole src tree
for anywhere `L.bridges` is ever assigned (`grep -rn "\.bridges\s*=" src/*.js`, excluding the unrelated kraken
`e.bridges` mechanic) - there isn't one. `L.bridges` is never populated for ANY level, so no cutter in the game,
even the one instance that already carries a `bridge:` id, has ever actually performed its intended bridge-chop
- every cutter, everywhere, is a plain chaser today. This is a bigger, pre-existing gap than the "one tuple
missing an option" case the brief's example describes, and wiring `L.bridges` up for every level that has a
real rope bridge prop is outside this ambush-wave-table lane. Listed here per level, not fixed:

- storm (THE MARKET SQUARE, ambush): cutter at col 110, no `bridge` key - kept it in the fixed roster (see
  table above) since it's still a fine melee foe, just never chops anything.
- storm (ground, src/stormhold-town.js:171): cutter at col 210 DOES carry `bridge: 207`, and there's still no
  bridge nearby it will ever cut, because `L.bridges` doesn't exist. This is the one cutter in the game whose
  author clearly intended the mechanic to fire.
- hanging (THE CLIFF HALL, ambush, left to claude/hanging2): cutter at col 49, no `bridge` key.
- underleaf (secret sneaking level, src/level.js:1657 and :1664): two cutters, both `sleeper: true`, no
  `bridge` key - but this level's whole premise is sleeping ambient foes ("nothing here can see you, it can
  hear you"), so these read as intentional stealth placements with no bridge nearby, not offenders of the same
  class. Listed for completeness only.
- No `tippler` outside Ore Road (left alone per brief) and no other prop-needing type found placed bare.

CHECKS RUN (all green)

node tools/check.mjs -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,npc-removal,ambush-listed,ambush-single,spawns,elites,one-new-foe,small-adds
node tools/check.mjs -- slopes-trace

 ok  syntax
 ok  dangling-paths   2380 tracked files, every repo path resolves
 ok  elites           40 elites, every elite reachable, every gate it holds opens onto the route
 ok  spawns           2294 creatures checked, none start in rock or out of water
 ok  checkpoints      427 checkpoints, none inside an arena/mini/ambush room, none on a flight
 ok  skins / roofs    44 houses, every roof sits on its slab
 ok  one-new-foe
 ok  ambush-single    25 single-wave rooms: one captain, 2-4 minions, named lock, leader-only clear
 ok  ambush-listed    22 ambushes checked, 0 drop a listed foe type (excluding the 4 left to their own branches)
 ok  boss-fight-end   45 boss/mini fights (32 bosses, 13 minis) all end when the boss dies
 ok  small-adds       18 rows, 5/61 swings missed (8%), worst row 25% (limit 33%)
 ok  architecture     44 levels, 348 built pieces, 2 grandfathered (unaffected)
 ok  npc-removal      every NPC outside shops gone; ferryman/captives are mechanics, no dialogue
 ok  slopes-trace     every frame of every level identical to the pre-slopes build

boss-fight-end and small-adds each took ~3.5 minutes under load from the other 2 lanes running Chrome on this
PC at the same time (29 Chrome processes observed mid-run) - re-ran nothing, they finished green on the first
pass, just slowly. No "target closed" failures hit, so no need for tools/profile-sweep.mjs --kill-orphans.

No bot-pilot runs: this lane only reorders/trims existing wave-table entries and never touches a boss, so
common.md's "bot pilots only for a boss that changed" rule doesn't apply here.

UNVERIFIED

- No manual playtest of any of the 15 fixed rooms in the browser. ambush-listed proves the intended roster now
  spawns; ambush-single proves the room's captain/lock/clear mechanics are unaffected; neither proves the new
  foe combination FEELS right in the room's actual geometry (e.g. scree's troll+harpy, or kings' archer+shield
  pairing) - that's a playtest call, not a check.
- lamplit's crab (restored) sits in shallow water near the quay per its original listed x/y; not verified it
  doesn't clip anything now that a duplicate scout no longer occupies that slot.

QUESTIONS FOR DANIEL

1. singleAmbush()'s own rule - a tuple's own `{elite:true}` always makes it ineligible for a "rest" slot, and
   AMBUSH_CAPTAINS[id] (when set) always wins captaincy over any tuple's elite flag - together these silently
   orphaned kings' shield and moor's troll (both fixed here by removing the now-pointless flag). Is this
   interaction intentional (elite flags should only ever mark the ONE creature meant to be captain, so any
   other elite-flagged tuple in a table is itself always a mistake), or should singleAmbush() warn/assert when
   an elite-flagged, non-captain foe is present, so a future table typo like this is caught by ambush-single.mjs
   instead of silently discovered by ambush-listed.mjs? Recommendation: leave singleAmbush() itself unchanged
   (out of this brief's scope) but add the assert to ambush-single.mjs in a follow-up - built the conservative
   fix here (remove the two vestigial flags) without touching the rule.
2. burial's THE CHARNEL HOUSE: budget is 1 elite (husk) + 3, but 4 distinct non-captain types were listed
   (zombie, bonegob, bonearcher, wight). Built bonearcher in over wight (ranged variety over a second undead
   grunt shape). Recommendation: keep as built; if wight's slow-burn poison/curse behavior is meant to be this
   room's specific lesson, swap it back in for bonearcher instead - it's a one-line change now that the table
   only lists 4 tuples.
3. The `L.bridges` gap above (every cutter in the game is a permanent chaser, never chops a bridge) is bigger
   than this lane's brief. Recommendation: a follow-up lane to either wire `L.bridges` for the one level that
   already declares a cutter's `bridge:` id (storm, col 207) and any other level that wants the mechanic, or -
   if bridge-chopping was intentionally cut as a feature - remove the dead `bridge`/`chopT`/`br` code from
   updateCutter() and stop giving cutters a `bridge` option at all so nobody keeps writing one that does
   nothing. Flagging via spawn_task as well.
4. Ore Road (oreroad: bat, sheargob, tippler dropped) was skipped per this lane's instructions since
   claude/oreroad2 is in flight. Recommendation: whoever merges claude/oreroad2 last should re-run
   `node tools/check.mjs -- ambush-listed` after the merge - if oreroad2 didn't already restructure THE
   SORTING FLOOR's wave table, it'll still be the one red name in the list.

Final commit: see git log -1 at time of this report / the sha in the handback message.
