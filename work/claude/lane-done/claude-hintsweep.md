# claude/hintsweep: hint lines that never show, and the Mage's Folly elite

## Task 1: the sweep

**The bug.** `number()` in src/main.js drops any string with a capital letter unless it is on MOVE_WORDS (by design: "words never float in play").
So every `number(x, y, 'HE IS OPEN')`-style line in the game was silent. The archfix lane found it for the Undead Archmage's realms.

**The sweep.** tools/hint-shown.mjs reads every `number()` (and `api.number()`) call in src/, takes the text argument's string literals (including the
pieces of a `'A ' + n + ' B'` join, and both sides of a ternary) and tests them against the real MOVE_WORDS list. Result on the base: **1012 literals dropped**
(990 main.js, 19 geomancer.js, 1 ember-ward.js, 1 pogo-chain.js). Nearly all are silent combat/state flavour that already has a tell, a sound, a spark, a
bestiary card or a hint-box message beside it (THROWN BACK, TIRED, THE TIDE HOLDS ...).

**What I did with them.**
- (a) **Routed: 95 calls (79 distinct lines) now draw.** The lines that TEACH (name an opening, say what to strike/jump, say a way is open) are the
  exact-string list `CALL_LINES` in the new src/hint-lines.js, plus four counted patterns (THE ROAD COMES UP: n LAMPS, SAVED n OF m, THE VALVE COOKS: n MORE,
  THE GATE TAKES n). number() sends them to a new `callout()` in main.js, which draws them in the existing hint box (direct-drawn, the same box the boss
  hints use): one line, 1.8 s, the same text at most once per 4 s, never over a longer hint being read, not in the trial, not tied to the Hit numbers
  option. I reused the hint box rather than archfix's `drawRealmBanner`, because that banner is built from the Archmage's realm state (`mageRealm`/`realmCue`)
  and cannot carry a general string; the hint box is the game's one general direct-drawn line, and it already waits for the intro card, banner and tells.
  A boss-name label with a state ("THE GOBLIN QUEEN  OPEN") shows as "THE GOBLIN QUEEN: OPEN".
- (b) **Deleted: 0.** The other **917 calls (757 distinct file+text rows) are left in place** and counted in tools/hint-shown-silent.txt. Deleting ~900
  one-line calls from main.js would collide with the four other lanes editing it right now, and some sit inside expressions. The check lets that list
  only shrink: a new dead line fails, so the bug cannot come back. `node tools/hint-shown.mjs --list` prints every dropped literal with file:line
  (routed ones marked). Changing number()'s filter itself: I did not; the only change in number() is one early branch for lines in CALL_LINES.
- One line I chose NOT to route: the bare hit counters ("3 MORE", "2 OF 3", ...) - without the prop they mean nothing in a hint box. See questions.

**New check: hint-shown** (in tools/check.mjs's list). Red on the base: the new tool run on a base worktree fails with 79 unrouted teaching literals
listed (WARDED x3, THE WAY OPENS, THE GOBLIN QUEEN  OPEN, ...). Green now. Runtime probe in the real page: HE IS OPEN, STRIKE ITS LEVER, THE FIRE IS OUT - GO,
THE GOBLIN QUEEN: OPEN and a counted line are all DRAWN (seen in the recorded text); TIRED (flavour) is not; the same line said twice inside 4 s does not
restart the hint. `BKT.number` and `BKT.hintNow` were added to the test hook for this.

### The 95 routed calls (file:line, text; lines as of this commit)
- src/geomancer.js:240  "WARDED"
- src/hint-lines.js:2  "HE IS OPEN"
- src/main.js:5798  "THE IRON TAKES HALF: JAM HIS DRUM"
- src/main.js:5866  "WARDED"
- src/main.js:5923  "WARDED"
- src/main.js:8192  "THE WAY OPENS"
- src/main.js:8222  "THE BURIED PRINCE  BAREHEADED"
- src/main.js:8222  "THE BURIED PRINCE  IN THE LIGHT"
- src/main.js:8222  "THE FORGEMASTER  SCALDED"
- src/main.js:8222  "THE FORGEMASTER  STUNNED"
- src/main.js:8222  "THE GOBLIN QUEEN  OPEN"
- src/main.js:8222  "THE PALADIN  THE WARD IS DOWN"
- src/main.js:8222  "THE QUEEN'S LANCE  OPEN"
- src/main.js:8222  "THE RAM LORD  DAZED"
- src/main.js:8222  "THE RIMEWRIGHT  THAWED"
- src/main.js:8222  "THE ROC  GROUNDED"
- src/main.js:8222  "THE WINDCALLER  HOLD ON"
- src/main.js:8481  "HER GUARD IS BROKEN"
- src/main.js:8632  "GET CLEAR"
- src/main.js:10030  "THE ROD: JUMP"
- src/main.js:10041  "THE BOOK TURNS: CUT HIM"
- src/main.js:10058  "HIS HANDS ARE UP: CUT HIM"
- src/main.js:10072  "HIS HANDS ARE UP: CUT HIM"
- src/main.js:10122  "LOW: JUMP IT"
- src/main.js:10138  "STRETCHED: CUT HIM"
- src/main.js:10273  "HE IS DOWN: CUT HIM"
- src/main.js:11315  "THE VAULT OPENS"
- src/main.js:11595  "OPEN"
- src/main.js:11620  "OPEN"
- src/main.js:11856  "A PORTAL OPENS"
- src/main.js:12834  "STUNG: HIS ARMS LIE STILL"
- src/main.js:13233  "BEHIND HER GUARD: BRING A GUN TO BEAR"
- src/main.js:13424  "STUCK: JUMP ON IT"
- src/main.js:13500  "STRIKE ITS LEVER"
- src/main.js:13657  "IN THE MUD: CUT HIM"
- src/main.js:14209  "THE CAMP GATE OPENS"
- src/main.js:14520  "DOWN: CUT HER"
- src/main.js:14548  "IT SKIDS: HIT IT"
- src/main.js:14550  "IT LANDS: HIT IT"
- src/main.js:14554  "KILL THE PUPS FAST"
- src/main.js:14558  "IT WHINES: HIT IT"
- src/main.js:14637  "INTO THE LANTERN: HIT IT"
- src/main.js:14650  "INTO THE LANTERN: HIT IT"
- src/main.js:14654  "PINNED: HIT IT"
- src/main.js:14658  "ON THE GROUND: HIT IT"
- src/main.js:14663  "INTO THE LANTERN: HIT IT"
- src/main.js:14668  "ON THE GROUND: HIT IT"
- src/main.js:14669  "HIT IT"
- src/main.js:14937  "CUT HIM"
- src/main.js:15213  "OPEN"
- src/main.js:15237  "OPEN"
- src/main.js:15275  "OPEN"
- src/main.js:15513  "OPEN"
- src/main.js:15526  "OPEN"
- src/main.js:16211  "THE COLD TAKES YOUR FIRE: A CANDLE AT THE WALL"
- src/main.js:16628  "THE FURNACE OPENS"
- src/main.js:17364  "HIT THE TALON"
- src/main.js:17413  "THE RIME RUNS OFF IT: CUT IT"
- src/main.js:17939  "IT FALLS - FINISH IT"
- src/main.js:17971  "THE TOWER BREAKS OPEN AT THE FOOT"
- src/main.js:18245  "JUMP! AND KEEP JUMPING"
- src/main.js:18388  "JUMP! AND KEEP JUMPING"
- src/main.js:18483  "THE FIRE IS OUT - GO"
- src/main.js:18580  "HURRY!"
- src/main.js:18587  "HELP! CUT THE BOARDS!"
- src/main.js:18587  "HELP! THE DOOR IS HOT!"
- src/main.js:18635  "IT BURNS DOWN - THE STREET IS OPEN"
- src/main.js:18643  "THE FIRE IS OUT - GO"
- src/main.js:18911  "DOUSED - HE IS OPEN"
- src/main.js:19128  "OPEN"
- src/main.js:19215  "OPEN"
- src/main.js:19337  "THE LANCE STICKS: CUT HIM"
- src/main.js:19404  "THE POINT STICKS: CUT HIM"
- src/main.js:19481  "INTO THE STONE: CUT HER"
- src/main.js:19645  "DAZED: HIT HIM"
- src/main.js:19648  "JUMP THE FLOCK"
- src/main.js:19690  "THE DOOR OPENS"
- src/main.js:19690  "THE HATCH OPENS"
- src/main.js:19833  "FROM BOTH WALLS: JUMP"
- src/main.js:19895  "HIS HEAD IS UP. HE IS OPEN"
- src/main.js:19962  "HOLD HIM"
- src/main.js:20318  "HER SIDE IS OPEN"
- src/main.js:20441  "THE GRATE IS UP"
- src/main.js:20441  "THE HOIST IS FREE"
- src/main.js:21333  "THE HEART OPENS. TAKE THE SPRING."
- src/main.js:21382  "GET ABOVE THE ROOTS - AND THE SPORES"
- src/main.js:21382  "GET ABOVE THE ROOTS"
- src/main.js:21382  "LEAVE THE MARKS - SEEDS FALLING"
- src/main.js:21382  "LEAVE THE MARKS"
- src/main.js:21382  "STAY LOW OR CLIMB"
- src/main.js:21401  "HER CAP JAMS. THE HEART OPENS."
- src/main.js:21638  "LOOK UP"
- src/main.js:23108  "SCALDED: HIT HIM"
- src/main.js:23159  "STRIKE IT AGAIN"
- src/main.js:23182  "OPEN"

### The 917 flavour calls left silent
Counted per file and text in tools/hint-shown-silent.txt (757 rows; e.g. TIRED x38 in main.js, THROWN BACK, THE TIDE HOLDS, SPLASH, every "TURNED").
`node tools/hint-shown.mjs --list` gives file:line for each. Examples of the kinds: attack-name flavour (BUCKS, HORNS, PIKE), boss narration
("HE CALLS THE STORM", "THE SKY DARKENS"), damage flavour (STUNNED, DAZED, SWATTED), prop feedback (SPLASH, PUT OUT), stat lines (" GOLD", " LOST").

## Task 2: the Mage's Folly elite
`ELITES.mage = [['armour', 447, 39, { face: -1 }]]` in src/level.js. The Warden Armour on the Rune Library's floor at column 447: outside THE READING ROOM
(314-330), the mini room (334-358), the arena, and 19 tiles from the nearest checkpoint (466); it upgrades the library's own armour there, so no foe is added.
No gate: the level has a mini (the homunculus), and the elites rule wants a gated elite only from levels with none. I did not use the Head Novice
(apprentice): it is the Falling Tower's captain, kept different from the Folly per rule Q. tools/elites.mjs: `ok mage armour@447,39`.

## Checks
Run alone with named checks (not the suite): hint-shown, elites, tells, untold-told, textfit, comments, architecture, checkpoints, skins, dangling-paths,
boss-fight-end, slopes-trace, npc-removal: all OK. **signs FAILS on one sign that is not mine**: the Falling Tower's sign at 81 runs 3 lines
("HIS DARK MAGIC FLOODS UP THE STAIR BEHIND YOU..."), from the towerscroll work already in the base (5b0ec84); this lane touches no sign.
No pilots (no fight logic changed). slopes-trace unchanged for every level.

## UNVERIFIED
- How the routed lines feel in a real fight (a state line such as "THE GOBLIN QUEEN: OPEN" repeats every 4 s while its state lasts). Only the probe was run.
- Whether any of the 95 calls fire on a frame the hint box is held by hintWaits (they wait behind tells and cards, like every hint).

## QUESTIONS FOR DANIEL
1. Delete the ~917 silent flavour calls? Recommendation: yes, but as its own quiet lane after the current main.js lanes merge (one-line deletes collide with them). Built: kept, counted, cannot grow.
2. Route the bare hit counters ("3 MORE" over a gate, brazier or valve)? Recommendation: no as text; draw a pip row over the prop instead. Built: left silent.
3. Should the routed state lines be a bigger, red/gold strip like the Archmage banner instead of the hint box? Recommendation: keep the hint box; promote only if playtest misses them.
4. The Folly elite is an ungated armour at 447 (the level has a mini). Want it to hold a gate? Recommendation: no.
