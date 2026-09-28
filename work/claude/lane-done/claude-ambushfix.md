AMBUSH PLACEMENT FOLLOW-UP (claude/ambushfix)

Brief: claude/ambushaudit built `ambush-listed` (a check that names every level losing a listed foe TYPE to
singleAmbush()'s "1 elite + first 3 non-elite in source order" rule) and fixed 15 offenders, but excused four
levels (hanging, spore, spire, oreroad) that were mid-flight on other branches. All four are on master now
(batch38). This lane: (1) removes the excuses, fixes whichever still drop a listed foe type. (2) Proves and adds
the audit's Q1 assert - a non-captain tuple carrying a vestigial `{elite:true}` that can never spawn (the trap
that orphaned Kingswood's shield and Gale Moor's troll).

WHAT CHANGED

1. tools/ambush-listed.mjs's own bug (found first, before any wave-table work): its `name:` lookback window was
   600 chars. hanging/kings/wood's fix-comments (from hanging2 and the earlier audit) pushed the gap between an
   entry's own `name:` and its `waves:` to 628-1015 chars, so those three ambushes silently fell out of the
   check's own report entirely - not "excused", just invisible, a false negative in the check itself. Widened
   the window to 2000 (src/level.js's longest gap measured 1015; 2000 leaves headroom and stays well short of
   the next entry's own name so it can't misattribute). Before the fix: 21 ambushes checked. After: 24 (the
   real total).

2. Removed the LEFT_TO_BRANCH excuse table entirely from tools/ambush-listed.mjs (hanging/spore/spire/oreroad
   are all on master as of batch38). Re-ran and found 3 real offenders still dropping a listed type - hanging
   was NOT actually fixed by hanging2 despite its comment claiming so (see below); spore and spire's excuses
   were literally true (their reworks never touched the wave table); oreroad was also still broken. Fixed all
   three the same way the audit fixed its 15, plus hanging:

   - hanging (THE CLIFF HALL, src/level.js): hanging2's own fix reordered `cutter` within its SECOND mini-wave,
     but missed that singleAmbush() flattens ALL waves into one list before taking the first three non-elite
     entries - the FIRST mini-wave (sprig, snuffer) still preceded brute's whole wave in that flattened order,
     so `archer` was still 4th non-elite and still never spawned. Collapsed to one wave with `cutter` (kept
     with its `bridge: 50` per the brief) and `archer` immediately after the elite; the duplicate sprig is cut
     entirely (budget: sprig x2 + snuffer + cutter + archer = 5 distinct > 4).
   - spore (THE UNDERCAP, src/level.js): identical two-mini-wave trap - shield (captain, wave2) let wave1's
     sporeling/sporeling/lurker fill all three rest slots before spitcap/weaver (wave2) were ever reached.
     Collapsed to one wave: shield, spitcap, weaver, lurker. Duplicate sporeling (listed 3x) cut entirely.
   - spire (THE CLOISTER, src/level.js): same trap - troll (captain via AMBUSH_LEADERS fallback) let wave1's
     fledgling/fledgling/rockgoblin fill all three rest slots before wave2's bat/harpy were reached. Collapsed
     to one wave: troll, bat, harpy, fledgling. rockgoblin cut entirely (it's already this room's own wandering
     foe just outside the ambush - `R.ent('rockgoblin', 32, 195)` in spire's build, so a second copy here was
     redundant); duplicate fledgling trimmed to one.
   - oreroad (THE SORTING FLOOR, src/ore-road.js): same trap - gaffer (captain, wave2) let wave1's
     miner/rockgoblin/sprig fill all three rest slots before wave2's sheargob/tippler (this level's own
     signature creatures - sheargob is named in THE STEEP LINE's own level comment, tippler exists nowhere
     outside Ore Road) were reached. Collapsed to one wave: gaffer, sheargob, tippler, miner. rockgoblin, sprig
     and the duplicate miner cut entirely (common filler seen throughout the level already).

   All four are the SAME bug shape: a "second mini-wave" written to look like a follow-up group, but
   singleAmbush() flattens waves in array order, not by any semantic grouping, so anything in an earlier
   sub-array always wins the first-three race regardless of which foes the room's own text calls out as the
   design intent. Every fix here collapses to one explicit wave, in the order that must survive.

3. Stray elite-flag assert (audit Q1, approved) - added to tools/ambush-single.mjs. singleAmbush() resolves the
   captain via AMBUSH_CAPTAINS[id] first (by type name, no elite flag needed), THEN a first elite-flagged
   AMBUSH_LEADERS member, THEN a fallback search - but separately excludes ANY tuple whose own `{elite:true}` is
   set from every rest slot, regardless of whether that tuple won captaincy. So whenever AMBUSH_CAPTAINS[id] is
   set, a DIFFERENT tuple that still carries `elite:true` can never spawn either way (this orphaned Kingswood's
   shield and Gale Moor's troll, both already fixed by the audit). Simply counting `elite:true` occurrences per
   ambush does NOT catch this - Kingswood's table only ever had exactly one literal `elite: true` tuple (shield);
   the bug is the flag landing on the wrong TYPE, not on too many types. The new assert: for every ambush whose
   level id has an AMBUSH_CAPTAINS override, no source tuple of a type OTHER than that captain may carry
   `elite: true`. Name -> id is read off the real built LEVELS (same trick ambush-listed already uses), since
   moor/mage's ambushes are pushed inline inside their build functions rather than keyed by id in the static
   AMBUSH{} object.

   Proved red first in a throwaway worktree (`git worktree add`, never git stash) at old master, by manually
   reintroducing the historical Kingswood/Gale Moor tuples from `git log -p`:
     kings: `waves: [[['thief',282],['thief',303],['sprig',292],['hound',286]],
             [['shield',296,null,{elite:true}],['archer',305],['hound',286]]]`
     moor:  `waves: [[['goat',o+7],['goat',o+33],['rockgoblin',o+20],['crow',o+17,7]],
             [['rockgoblin',o+31],['troll',o+9,null,{elite:true}],['goat',o+25]]]`
   Each one independently threw the new assert ("... also carries elite:true - it can never spawn"). Removed
   the worktree afterward. On the current (already-fixed) source, the assert passes clean - `singleAmbush()`'s
   own rule was NOT touched, per the brief.

CHECKS RUN (all green)

node tools/check.mjs -- ambush-listed,ambush-single,spawns,elites,one-new-foe,small-adds,spore-exam,hanging-exam,monastery3-beats,ore-exam
node tools/check.mjs -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,npc-removal
node tools/check.mjs -- slopes-trace

 ok  syntax
 ok  elites            40 elites, every elite reachable, every gate it holds opens onto the route
 ok  spawns            2303 creatures checked, none start in rock or out of water
 ok  one-new-foe       harbor shelved on purpose (no map node)
 ok  ambush-single     25 single-wave rooms: one captain, 2-4 minions, named lock, leader-only clear
 ok  small-adds        17 rows, 3/66 swings missed (5%), worst row 29% (limit 33%)
 ok  spore-exam
 ok  hanging-exam      bridge 64-75 cut by a sprig at 77 (1.31s in the cut zone at a walk)
 ok  monastery3-beats
 ok  ore-exam
 ok  ambush-listed     24 ambushes checked, 0 drop a listed foe type
 ok  dangling-paths    2417 tracked files, every repo path resolves
 ok  checkpoints       428 checkpoints, none inside an arena/mini/ambush room, none on a flight
 ok  skins / roofs     44 houses, every roof sits on its slab
 ok  boss-fight-end    45 boss/mini fights (32 bosses, 13 minis) all end when the boss dies
 ok  architecture      44 levels, 348 built pieces, 2 grandfathered (harbor, waymeet - unaffected)
 ok  npc-removal       every NPC outside shops gone; ferryman/captives are mechanics, no dialogue
 ok  slopes-trace      every frame of every level identical to the pre-slopes build (unchanged, as expected -
                        this lane only reorders/collapses existing wave-table entries, no geometry touched)

small-adds took ~3.4 minutes, boss-fight-end ~3.9 minutes - both finished green on the first pass under the
other lanes' load, no re-runs needed.

No bot-pilot runs: no boss changed in this lane.

PER-LEVEL TABLE (the 4 excused levels, before this lane vs after)

| level | ambush | listed | spawned (before) | dropped (before) | spawned (after) | dropped (after) |
|---|---|---|---|---|---|---|
| hanging | THE CLIFF HALL | sprig,snuffer,brute,cutter,archer,sprig | brute,sprig,snuffer,cutter | archer x1 | brute,cutter,archer,snuffer | sprig (cut, budget: 5 distinct > 4) |
| spore | THE UNDERCAP | sporeling,sporeling,lurker,shield,spitcap,weaver,sporeling | shield,sporeling,sporeling,lurker | spitcap x1, weaver x1 | shield,spitcap,weaver,lurker | sporeling (cut, budget: 5 distinct > 4) |
| spire | THE CLOISTER | fledgling,fledgling,rockgoblin,bat,rockgoblin,troll,harpy,fledgling | troll,fledgling,fledgling,rockgoblin | bat x1, harpy x1 | troll,bat,harpy,fledgling | rockgoblin (cut, budget: 5 distinct > 4) |
| oreroad | THE SORTING FLOOR | miner,rockgoblin,sprig,bat,gaffer,sheargob,tippler,miner | gaffer,miner,rockgoblin,sprig | bat x1, sheargob x1, tippler x1 | gaffer,sheargob,tippler,miner | rockgoblin,sprig (cut, budget: 6 distinct > 4) |

UNVERIFIED

- No manual playtest of the 4 rooms fixed here or the 2 (hypothetical) rooms proven red in the throwaway
  worktree - ambush-listed and ambush-single prove the mechanics, not the in-room feel.
- The `ambush-listed.mjs` lookback-window widening (600 -> 2000) was checked for false-attribution risk by hand
  (confirmed all 24 rows still map to the right level/name after the change) but not exhaustively fuzzed against
  every possible future comment length - a sufficiently long future comment block could in principle still
  exceed 2000 chars and repeat this exact failure mode. Flagged as a fragility, not fixed structurally (would
  need parsing the AMBUSH{} object's own key syntax instead of a text window - out of this lane's small scope).

QUESTIONS FOR DANIEL

1. tools/ambush-listed.mjs's `name:`-to-`waves:` lookback window is a fixed character count (was 600, now
   2000). It is inherently fragile to comment length and will silently drop an ambush from the report again if
   some future fix-comment exceeds it - exactly what happened to hanging/kings/wood here, and it was invisible
   until I went looking (nothing flagged it as broken; it just under-reported). Recommendation: leave the 2000
   window as the pragmatic fix now (proven correct for every current entry), but flag a follow-up to make the
   check assert on its OWN coverage - e.g. compare `rows.length` against a hard-coded expected ambush count (or
   `LEVELS.filter(l => l.build().ambushes?.length).length`) so a future silent drop fails loudly instead of just
   quietly checking fewer rooms.
2. hanging2's own commit message/comment claimed its reorder fixed the cutter+archer drop, but it only fixed
   cutter - archer was still silently dropped until this lane. Recommendation: no code action needed (fixed
   here), but worth noting for future single-wave-table edits: verify with `ambush-listed` itself after any
   wave-table reorder, not just by re-reading the intended order - the flattening behavior (across ALL
   sub-arrays, not within one) is easy to get wrong by eye, as both hanging2 and the original tables did.
3. Same as the audit's own Q2 (still open, not re-litigated here): burial's THE CHARNEL HOUSE dropped `wight`
   in favor of `bonearcher` for the last rest slot - untouched by this lane, still worth a design look per the
   audit's original note.

Final commit: see git log -1 / the sha in the handback message.
