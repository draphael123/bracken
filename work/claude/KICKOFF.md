# BRACKEN — kickoff for a fresh session (credit-efficient)

## State (2026-09-21)
- Repo `C:/Users/danie/Documents/Codex/2026-09-19/files-pasted-by-the-user-you/bracken`, branch `codex/playtest-0919`.
- **Production = branch head = `1cfd6c7`** (2026-09-22: batch 4c first half THE WITCHLIGHT STAIR + THE HEDGE WARDEN (pilot 18/24, 75%) + Gale Moor rope fix (the downdraft cliff's lips cut its rope) + cleared levels never re-lock; 103/103 files verified, clean boot. NEXT: the Gate Gargoyle half, then Stormhold longer). Before that `d7d93ae` (2026-09-22: batch 4b BURIAL CAVERNS REWORK + THE GRAVE WARDEN mini - descent to row 102, candles quest, one ambush (house rule), lifts/swings, new mix; Warden pilot 19/24, pyro 0/4; suite 96/96 + undead-foes fixed after. The Hedge Warden and Gate Gargoyle sprites are ALREADY in src/redraw/queue_bosses.js on this branch). Before that `bbe502d` (2026-09-22: the Monastery 'rock glitch' was drawRocArch's shape stand-in for the Roc outside the belfry; she is drawn as her sprite now). Before that `35a486d` (22:44: Owl Reeve lamp change DONE - double damage 4 s after a lamp dazzles/crashes her, lamp reach 110). Before that `e5d9918` (2026-09-21 22:41: Burning Village polish 6596b10 - flame pillars, burning logs over ember pits, fleeing goblins, burning-town backdrop, Pyromander staff + enraged FIRE WALL, pilot 13/24 - suite 96/96; then the barn roof made a route (hatch + fire wall + water butt), targeted checks only). Before that `9d39d7d` (2026-09-21 night: batch 4a Mother Cap harder f1f70fb - pilot 17/24, 71% - plus three playtest fixes: the Burning Village's map board sat on the Store; the Falling Tower cistern's water covered the rope (instant death on the climb); the Mother's open/seal animation). Suite 95/96 (spore-loop's sandbox stub, fixed after). Before that `707067b` (batch 5: THE BURNING VILLAGE + the Pyromander, 2026-09-21; covers e0ab1dc and the
  profile-cleanup fix 9e0e28a), deployed, 98/98 files verified, clean boot. Suite: 95/96 green; the one red (profile-cleanup's
  hard-kill case, a race + a PowerShell JSON control-char crash) was fixed after and passes alone 4/4 - watch it next run.
- Batch 5 notes: the level is APPENDED to LEVELS (map nodes count by index) and is an optional fork (Sporewood still needs the
  Stockade). Pyromander pilot `node tools/pyromander-pilot.mjs 4` = 14/24 (58%) at normal health, median win 76 s (below the
  90-150 band; knight 1/4 is the weakest). Street straw is in bales of 5 (a 23-tile strip burning at once walled the road).
- Two sessions once ran the same batch in one tree: check `git status` for untracked batch files AND for another check.mjs.
- Lesson from batch 3: `shape.mjs` can't measure a vertical level - use `work/claude/vshape.mjs <id> [srcRoot]`. reachcore's
  "crystal gives way" fall runs THROUGH rock; `L.hasCryst` was never set anywhere (Sunspire's ledges may never crack - unchecked).
- Lesson from batch 1: `updateSea` returns early on non-ship levels - never hook a per-level update inside it; call it beside it.
- Done and live: level density fix (GARRISON/calm), Mother Cap, Falling Tower shedding + indoor fight, Burial gallery +
  poison feedback, husk/apprentice/bone goblin/bone archer, four boss openings, Buried Dead nova/throw/body slam,
  haunted map, CC0 music, title screen, Harbor removed, the TOUCH RULE (touch hurts only if spiked, a hazard, or a
  body attack in progress), the RED ✕ unblockable mark, the Grandmother fix.
- Full history: `work/claude/NEXT-SESSION.md`. Briefs: `bracken/.claude/briefs/*.md`. Audit: `bracken/docs/audit-new-levels-0920.md`.

## TWO SESSIONS AT A TIME (Daniel, 2026-09-22: "we can have two at a time actually, not just one")
Two build sessions may run at once, taking the next two items of THE QUEUE - on these terms, because two sessions in ONE
tree overwrote each other before (2026-09-21):
- EACH IN ITS OWN WORKTREE AND BRANCH (`git worktree add ../bracken-<item> -b claude/<item> origin/codex/playtest-0919`), never
  both in `bracken/`. Pick two items that touch different levels; both will edit main.js/level.js, so keep each change in
  its own new module where possible and merge the SECOND one onto the first (rebase or merge, re-run its checks).
- ONE `npm run check` AT A TIME, machine-wide: its ports (5991-5999) and headless Chrome are shared and two suites at once
  flake and take twice as long. Before starting one, look for a running check.mjs; if there is one, wait for it (one
  until-loop), don't start a second. Pilots and page tests also count as browser work: stagger them.
- Deploys go one at a time, from codex/playtest-0919 after the merge, with Daniel's go.

## Credit rules (follow them)
- ONE batch per session: build → targeted tests → ONE `npm run check` (local, ~18 min, run alone, don't poll: one
  until-loop) → commit → push → deploy → verify (sha256 of served files vs `git archive`, browser boot) → stop, report briefly.
- Read only line ranges you need (grep, then sed -n). main.js is 22k lines. No subagents unless truly parallel.
- Numbers before pictures (`work/claude/shape.mjs <level>` = foes & standable heights per 24-tile screen). At most one
  cropped screenshot per visual change.
- Commit and push each finished piece; Daniel's machine sleeps at 23:00.
- Deploy recipe: `git archive <sha> | tar -x` into a fresh `work/claude/deploy-<sha>`, copy `.vercel/project.json` +
  `.vercelignore` from `work/deploy-0df50ca`, `vercel deploy --prod --yes`; verify with `work/claude/verify-prod.mjs`
  and `work/claude/prod-smoke.mjs` (edit the sha/paths at their top). Push/deploy already authorized; no force push, no master.

## OPEN PLAYTEST NOTES (Daniel, 2026-09-21 ~22:40, not yet done - do these FIRST next session, small)
- ~~THE OWL REEVE lamp x2 + wider~~ DONE in `35a486d`.
- ~~THE MONASTERY rock glitch~~ DONE in `bbe502d` (drawRocArch's polygon stand-in replaced by her sprite).
- Asked: does the player get stronger and do enemies scale? ANSWERED: yes - per hero level +3 hp (+8 per 12 lv), +5 stamina,
  +1 damage every 2 levels (+1 per 12), skills +1/120 per level (to +20% at 24); enemies scale by the LEVEL'S place (TIER 0 ->
  2.35): foes' health x(1+0.5*tier) up to x2.2, bosses x(1+0.25*tier) up to x1.6, their damage x(1+0.28*tier) up to x1.66.
  Not by the hero's level: an early wood replayed by a high hero is easy (offer an option if Daniel wants it).

## PREP DONE AHEAD (2026-09-22, branch claude/prep, Node-only drafts - merge it before the matching build)
- tools/route-breaks.mjs + docs/route-breaks-0922.md (no impossible spot; 8 ropes through one-way decks - one-line climb fix proposed).
- src/draft/curtain-wall.js + tools/curtain-wall.mjs (Stormhold's Curtain Wall, spliced and measured).
- src/draft/witchlight-v2.js + tools/witchlight-v2.mjs (the redesigned stair's five places, measured).
- src/draft/unburied-field.js + tools/unburied-field-draft.mjs (the Unburied Field's three acts, measured).
- src/redraw/queue_bosses2.js + docs/queue-bosses2.png (Standard-Bearer, First Death Knight, Gate Serjeant sprites - Daniel to approve).
- audio/witchlight.ogg wired (CC0 'Iremos Forest Theme Loop').
- Briefs (gitignored): witchlight-redesign.md, stormhold-extension.md (+ the Lance's numbers), flotilla-rework.md (+ the
  Quartermaster's numbers), the-powder-deck.md and the-lit-church.md (full build briefs), drowned-king-rework.md and
  bell-crab-rework.md (+ today's numbers).

## THE QUEUE (Daniel, 2026-09-21 - this order wins over the numbering further down)
0. ~~THE SLOPES INTEGRATION (batch A, 2026-09-22)~~ DONE on codex/playtest-0919: the purple-screen fix (DEPLOYED on its own,
   142/142 files verified, clean boot), the REDRESS of 11 levels' art (`36c7934`), the ten redrawn foes + contrast rim + death fx
   (`7856f71`), THE TIDE REAVER made a real mini (`8533182`), and the FODDER x2.4 measured for all six heroes (`5035aa0`).
   ~~LEFT OVER: the longer FALLING TOWER + the TOME~~ DONE 2026-09-22 (7e37f11 the TOME, fa1e71b the two new floors +
   fewer zombies, 9e6cec7 block/dodge/plunge while flipped, 7007f60 the playtest's two bugs). NEXT = Daniel playtests it.
1. ~~THE BURNING VILLAGE~~ DONE in `707067b`
2. ~~Mother Cap made harder~~ DONE in `f1f70fb`
3. ~~Burial Caverns rework + THE GRAVE WARDEN~~ DONE in `d7d93ae`
4. THE WITCHLIGHT STAIR + HEDGE WARDEN mini (DONE `1cfd6c7`) + GATE GARGOYLE boss (NEXT) (`witchlight-stair.md`)
4+. ~~THE WITCHLIGHT STAIR REDESIGN + THE GATE GARGOYLE~~ DONE and MERGED: codex/playtest-0919 @ a73ed90 (suite run on the merged tree; the 5 red were the contention family and pass alone). DEPLOYED 2026-09-22 (prod = a73ed90, verified 149/149 + clean boot) (`witchlight-redesign.md`) - Daniel 2026-09-22 after playtesting 1cfd6c7 ('climb and go right with a massive enemy gauntlet... looks like a repeat'): five distinct places, encounters not a sprinkle, its own look and MUSIC; the Gargoyle built with it. NEXT after the slopes integration, ~2 sessions
4=. HERO VERBS + THE WARDEN'S MISSING KIT + THE STORE (`hero-verbs-and-the-store.md`, Daniel 2026-09-22, approved): the Warden has
   only THREE actives (everyone else 6-7) and her pilots are the worst of the six; the store sells 134 passives out of 168 nodes;
   and every active costs the same 3 points on the same lv1/4/8 ladder. Three sessions: (1) the Warden's three missing actives,
   (2) the store sells the 58 abilities and passives become level-up rewards (migration + coin refund), (3) 24 ATTACK-CHANGING
   nodes, four per hero, one per tier - a button OR a change to what you already swing. DECIDED 2026-09-22: passives are granted automatically at their tier.
4#. THE UNDEAD ARCHMAGE'S ROOM, AND THE TOWER'S LAST STEP (Daniel, 2026-09-23, agreed). TODAY THE FIGHT IS IN THE
   OPEN SKY over the crown and you walk onto the carpet off the parapet. Daniel: "there should be a portal (it looks
   like there's a grass mat to get to the carpet which doesn't make sense). You go through the portal and you're
   fighting over [a hazardous floor]... when the boss ends you enter a portal which takes you to the goal which is on
   a sandy path." Then, on the place: "the tower look works, maybe it just separates to a separate room in the tower
   where the floor is all hazardous? Doesn't necessarily need to be poison water."
   THE GRASS IS A REAL BUG, NOT A LOOK: tower-ascent.js's `skins` list covers the two walls, every floor divider and
   the base - and NOT THE PARAPET (row SKY+1, x 28-43). With no skin it falls through to the default ground kit, and
   the tower's palette declares grass '#4e6a52'. There is literal grass on a stone tower. ONE LINE: add the parapet.
   WHY THE ROOM IS BETTER THAN THE SKY, and worth saying so nobody "simplifies" it back: IT GIVES THE CARPET A REASON.
   You cannot fall off the carpet today - tools/tower-ascent.mjs asserts it - which is right, but it means the engine
   is quietly holding you up. A sealed room with a lethal floor makes that rule DIEGETIC: you fly because you cannot
   land. It also keeps the payoff of a 306-row climb, and it makes the storm walls honest - they are invisible walls
   closing in today, and in a room they are just walls.
   THE FLOOR = HIS SANCTUM, a working ritual circle burning across it. It explains the portal (he made it), explains
   the sealed room, and it is HIS rather than generic. NO NEW SYSTEMS NEEDED: pools already carry harm/acid/deadly and
   `fires` already draw and damage.
   THREE THINGS THE ROOM BUYS: (1) HEIGHT FINALLY MATTERS - flying low over a lethal floor should bite, and a flying
   fight with no reason to care about altitude is using half its axes; (2) his poison and storm get a SURFACE to act
   on, which open sky never gave them; (3) PORTALS BECOME HIS VERB - he already blinks, so he should leave one open
   mid-fight and the player should be able to use it.
   THE SAND IS A WINK AT THE DESERT (Daniel confirmed 2026-09-23), the next set of levels - NOT a road into it. So:
   dressing at the exit only. No map node, no `needs:` link, no progression change.
   AND THE MEASURED PROBLEM WHILE WE ARE IN HERE: tools/curve.mjs says "fallingtower is 44 EASIER than mage before
   it" (INDEX 69 vs 113) - a collapse, where the rule is -8 - and it is the LAST INLAND LEVEL. thr/100 21.1 vs the
   Folly's 27.7, 7 foe kinds vs 12, 22 hazard tiles vs 96. The floors falling behind you is pressure the INDEX cannot
   see, so some of that gap is measurement - but not 44 points of it. If the collapse never actually threatens, it is
   theatre. The boss's own numbers (pilot, 2026-09-22): 5 of 6 heroes win, THE KNIGHT 0/4, median 136-195 s against a
   90-150 s band - long, and one hero cannot do it.

4@. THE ORE ROAD - a new crag level (Daniel, 2026-09-22: "a new mountain goblin level in the second section"; pitch
   agreed, TO BE BUILT AFTER the batch in flight). THE GAP IT FILLS is not a place but a FACT: the crags own a slope,
   ropes, a climb, a moor, a keep, a castle and her mines, and nothing explains how a castle on a peak is SUPPLIED.
   The goblins read as squatters rather than an occupation.
   THE UNIQUE FEATURE IS THAT THE LEVEL MOVES: a goblin cableway hauling rock across a gorge, a continuous line of
   loaded ore buckets arriving on a clock, and for long stretches THE ONLY FLOOR OVER THE DROP. The game has lifts
   (one at a time) and pendulums (short arcs) and nothing that is a CONVEYOR you must time an entry and an exit on.
   THE WINCHMASTER, and every attack is his job: REVERSE THE DRUM (the floor you are on starts going the wrong way) ·
   SEND A BUCKET (a loaded one down the line at speed) · CUT A SPAN (a cable drops and that footing is gone for good) ·
   THE BRAKE LEVER (an iron bar up close, blockable). THE OPENING YOU MAKE: ride a bucket INTO the drum - it jams, the
   cable locks, and he is thrown off the housing. Sprite: a heavy goblin in a leather apron and a counterweight belt,
   all shoulders and iron.
   THE MINERS (Daniel, same message): "miners as enemies who can throw their pick and also have a melee attack with
   it. When their pick is thrown they can't do anything." NOTE THE MINER ALREADY EXISTS - DMG.miner 22, EHP.miner 30,
   a swingTell and a smashTell (QUIET) - so this is an UPGRADE, not a new creature, and it is the reason he was pulled
   out of the Monastery on 2026-09-22 ("a miner belongs in a mine"). The rule is THE TIDE REAVER'S DISARM applied to a
   common foe: thrown, the pick is gone and he has NOTHING until he fetches it, so killing him becomes a question of
   WHEN. Needs: a thrown-pick seed, a fetch walk, a helpless mode with its own pose, and marks rows (the throw and the
   swing both yellow; the smash stays quiet). Watch: he must not be able to throw from off screen, and a pick on the
   floor is a thing the player can be standing on.

4$. THE MOUNTAIN SAG, MEASURED (Daniel approved all four, 2026-09-22). tools/curve.mjs walks the campaign and scores
   each level; after KINGSWOOD's 118 the road falls to SCREE 86 - a 32-point collapse, where threat.js calls anything
   past -8 a collapse and not an act opening. THE MONASTERY IS NOT THE PROBLEM (111, correctly between Kingswood and
   Stormhold 116): its trouble is texture, not difficulty. In payoff order:
   a) THE SCREE PATH: 2.9 foes a screen (the same as Bracken Wood, the TUTORIAL) and ZERO hazard tiles on a mountain
      whose whole premise is loose rock. The rockslide exists as a mechanic and the level never lives with it. Give it
      ground that goes when you stand on it and rock that arrives from above the road. Biggest single win in world one.
   b) THE MONASTERY'S CAST: 18-23 foe kinds, the most of any level in the game (Falling Tower 7, Burial 7, Waymeet 8).
      Nothing repeats often enough to be learned, so no encounter has a shape. Cut to 8-10 and let the bells, the
      prayer wheels, the Guardian and the Abbot carry it. CHEAP, and the biggest return per hour.
      + THE GROUNDING PASS (Daniel confirmed he meant the Monastery's LOOK): it is one tan from foot to belfry, which
      is why a stone lantern read as a sandcastle - nothing in frame tells you the scale or the material.
   c) GALE MOOR: 85% flat screens over 996 columns, against the under-33% bar the Burial rework was held to, with 235
      spike tiles doing the work geometry should.
   d) THE HANGING VILLAGE: 316 standable cells in a 110x132 level, FOUR screens with a floor, worst checkpoint gap 19
      when the rest of world one runs 44-73. Short, safe, nearly all rope. It needs a middle with a floor to fight on.
4%. THE BURNING VILLAGE: THE BACKDROP AND THE STAKES (Daniel, 2026-09-22).
   THE FIRE BEHIND THE TOWN looks wrong for three findable reasons (main.js drawBurningTown ~14957): the glow is two
   flat full-width fillRects at 0.35 and 0.25 alpha (a colour wash, not fire); the smoke is g.arc CIRCLES, anti-aliased
   blobs in a game of placed pixels; and there is only ONE parallax layer, so it has no depth. Fix: a dithered hard-
   banded glow brightest at the rooflines, pixel smoke columns, a second dimmer ridge behind - and TIE THE GLOW TO
   VG.cells, because the village runs a real fire simulation and the backdrop ignores it completely.
   WHAT THE LEVEL IS MISSING IS STAKES, and nearly all the machinery is already there (fire spreads, burngobs light new
   fires behind you, water troughs and a well exist, captives have hot/hotNear doors that water cools for 12 s). But
   NOTHING CAN EVER BE LOST: SAVED 0/6 is guaranteed, so every system is texture. Make a captive LOSABLE - a house
   fully alight long enough and that villager is gone - and all of it becomes a fight against the fire. Second verb:
   smash a trough to soak a STRETCH and make a firebreak, so water has an economy.
4&. THE WORLD MAP, AND OPTIONAL LEVELS TO THE SIDE (Daniel, 2026-09-22) - one problem, not two. The map is ONE
   POLYLINE: `PATH` is a single array and every node (level, store, secret, class level) is a bead on that one string,
   so PATH is doing two jobs - the drawn road AND the walk order - and optional content cannot look optional. The
   Burning Village only LOOKS like a spur; WOOD_PATH runs [296,34] -> [258,22] -> [214,26], so the road DETOURS
   THROUGH IT between the Stockade and Sporewood. Underleaf and the Undercrown are "secrets" sitting on the road too.
   FIX: split it. A main road that never detours, plus `spur: [x, y]` on optional nodes hanging them off it on a short
   branch, drawn thinner or dashed - that is the "to the side", and it fixes the walking too. Then, cheap once done:
   node GLYPHS by kind (store, boss, class level and secret are four identical dots today); per-node STATE (cleared,
   silvers, quest); and SHOW THE ROAD AHEAD (locked nodes are hidden entirely, so the map never says there is more).
4!. THE PYROMANCER, NOT THE PYROMANDER (Daniel, 2026-09-22). His own bestiary entry already promises "he fights with
   the Pyromancer's own kit", and the FIRE STOMP is the one move that breaks it.
   a) RENAME pyromander -> pyromancer: 39 occurrences over 9 files. beastRec(t) keys the bestiary by type id, so a
      straight rename silently wipes a player's seen/slain record - add a save migration mapping the old id.
   b) CUT THE STOMP: `drop`/`dropTell` (DMG.pyroDrop, red !!) out of his order, his modes, PYRO_ANIM and marks.js.
   c) THE DEFAULT OUTFIT: he is baked bakePyro(PYRO_SETS.black); the default is `bracken` (what the class-pick preview
      uses). One word.
   d) HER ACTUAL ABILITIES. FOUR OF HIS SIX ALREADY MAP TO HERS (jet, wall, vent, staff) - only the stomp and the ember
      are off-kit, so this is a swap and not a rebuild. Add the three of hers he lacks: CINDER STEP (her dash, trailing
      fire - as a boss move he CUTS THE ARENA), THE WISP (her flame that hunts on its own: a second threat layer), and
      THE PYRE (her full-bar cast) as his enraged signature. No invented moves at all.
   A BOSS BATCH WITH A PILOT: changing his moveset invalidates his tuning, and he is already 13-14/24 (58%), below the
   60-75% band, so he needs re-piloting regardless.
4*. THE GATE GARGOYLE REWORKED (Daniel, 2026-09-22, mid-session): "much zoomed out, and have the fight be just with
   platforms over spikes. Make the gargoyle a bit slower to account for this difficulty change. I'd like him to have a
   fire breath attack as well." So: a zoomed-out arena (the camera pulls back the way the boss-intro zoom does, held
   for the fight), the floor replaced by PLATFORMS OVER SPIKES, every tell and recovery lengthened (gate-gargoyle.js
   GARG.tell/rec - measure, do not eyeball), and a FIFTH attack, a fire breath. Watch: his dive already reads the slab
   the hero is on, so slabs-over-spikes changes what a missed dive costs; and the glyph flare (P.flareSlab) puts the
   hero on a slab's UNDERSIDE, which over spikes is a different promise. Re-run tools/witchlight.mjs, the Gargoyle
   pilot (target 15-18/24) and the marks table. ITS OWN SESSION - it is a boss batch.
4^. THE MONASTERY'S BOSS: NOT THE ROC (Daniel, 2026-09-22: "I think I'd like a different boss than the Roc in the
   monastery. Maybe a goblin priest or something like that?"). RECOMMENDED SHAPE, agreed reasoning: a goblin priest as
   he stands is a SUPPORT unit (DMG.gobpriest is 0 - he blesses, and a blessed foe takes half of every blow), so he is
   not a boss on his own; but the Monastery's whole engine is already THE BELL (strike a bell over the golem and the
   note cracks it; strike the nest bell under the Roc and she falls). So: THE FALSE ABBOT, the priest in the abbot's
   chair, fought in three CONCURRENT layers - the congregation coming up the stair, his RITE making them take half,
   and the monastery's own bells as the opening YOU make (a bell rung over him breaks the rite and puts him down).
   That reuses the level's own machinery instead of inventing a system, and the opening is player-made. The Roc is a
   good fight in the wrong building: MOVE her (an open-sky level) rather than delete her - she has 1100 hp, her own
   music, her own mark rows and the nest's architecture. A boss batch of its own: sprite, ~5 attacks, marks rows,
   boss-openings + boss-navigation, threat/EHP/DMG, a pilot of 21+ runs.
4-. STORMHOLD LONGER + THE LANCE'S TWO NEW ATTACKS (`stormhold-extension.md`: THE CURTAIN WALL climb with lightning rods + optional GATE SERJEANT mini; THE HOOK and CALLING THE BOLT) - Daniel 2026-09-22: approved, right after the Gate Gargoyle half
4=. THE FLOTILLA LONGER + THE QUARTERMASTER SLOWER (`flotilla-rework.md`: THE RIGGING - climb the masts and cross at the top between hulls; her tells 0.42/0.30 s -> 0.55/0.50 etc.) - Daniel 2026-09-22, after Stormhold
4~. THE HURRICANE DECK: PLACES + A STORM WITH A SHAPE (the heel, the eye, the fallen mainmast); THE CAPTAIN gets platforms + one berserk attack (`hurricane-rework.md`) - Daniel 2026-09-22, after the Flotilla
4a. THE DROWNED KING rework (`drowned-king-rework.md`: sluice wheels shut the siphons, sunken-castle dressing, a trident + throw, slower with longer staggers) - Daniel 2026-09-21: after the Burial rework and the Witchlight Stair
4b. THE DIVING BELL -> GIANT CRAB (`bell-crab-rework.md`: rock throw, scuttle charge, swim charge, stretching claws; fish + atmosphere)
5. THE UNBURIED FIELD, optional Death Knight coin unlock off the Stair (`unburied-field.md`) - ~2 sessions
6. SLOPES engine batch (`slopes.md`) - before any desert level
7. THE SUNKEN CARAVAN, first desert level, DUNE WORM boss, no mini (`sunken-caravan.md`) - ~2 sessions
8. THE POWDER DECK (`the-powder-deck-pitch.md`)   9. THE LIT CHURCH (`the-lit-church-pitch.md`; closedhelm -> THE CRUSADER)
Class levels (Burning Village, Unburied Field, Powder Deck, Lit Church): clearing opens a ~800-coin purchase for that class;
heroes otherwise cost 10 silver; NO consolation prize for owners.

## Batches, in order (one per session)
(Daniel, 2026-09-21: the NEXT session does batch 3 AND writes the batch-4 brief - one suite run, one deploy. Batch 4's
build stays its own session; batch 5's three levels one per session.)
1. ~~**Burial geometry**~~ DONE in `1a18842` (flat screens 33%→27%, `tools/burial-geometry.mjs` in check) — applied `burial-geometry-patch.py`: lower crypt under a
   fallen wall, three poison pits with stepping stones, the climb over a walled road at the Bone Stairs, and 11 gas
   vents (idle → hiss/wisps → poison column). Apply it (`python3 work/claude/burial-geometry-patch.py`), then prove:
   vents poison only when puffing, the crypt is the only way past the wall, pits hurt, everything reachable
   (`tools/additional-areas.mjs`, `deadends.mjs`, `burial-route.mjs`), flat screens fall below 33% (`shape.mjs burial`).
   Add a `tools/burial-geometry.mjs` check to `tools/check.mjs`.
2. ~~**Underwater Keep**~~ DONE in `dc1a4c2` (approach 400→560 tiles; SIPHON GALLERIES + BLIGHTED CISTERN; siphons/blight in
   `src/keep-passages.js`; `tools/keep-passages.mjs` in check; patch `keep-passages-patch.py`). Lesson: moving a level's inner
   part shifts hand-placed coords in level.js ELITES (the suite's `elites`/`spawns` caught it) - grep level.js for the level id.
3. ~~**Undercrown**~~ DONE in `db0499a` (104->154 wide; THE GLITTER VEIN on CRYST ledges over poison + THE GOBLIN BARROW,
   both on the route; Prince's goblin head in `src/redraw/prince.js`; `tools/undercrown-variety.mjs` in check; patch `undercrown-patch.py`).
4. ~~**Falling Tower redesign**~~ DONE in `6dc96ff` (72x240 ascent, src/tower-ascent.js + src/carpet.js + src/redraw/lich.js; tools/tower-ascent.mjs; carpet pilot 17/24 normal-health wins, median 122 s; medal climb time is an ESTIMATE - no climbing pilot exists). (use Opus; BRIEF WRITTEN: `bracken/.claude/briefs/falling-tower-redesign.md` - follow it): mostly an UPWARD ascent through the collapsing
   tower, ending on a player-flown MAGIC CARPET; the Undead Archmage floats, looks properly undead, casts dodgeable
   spells (some from the first fight) plus poison and death magic, and when enraged is much faster and teleports more.
4a. (queued AFTER the Burning Village, BEFORE 4b; a SMALL batch, Daniel 2026-09-21) **Mother Cap made harder**: 'way, way too easy' (pilot 6/6, zero damage) - brief `bracken/.claude/briefs/mother-cap-challenge.md` (less downtime, position-read shuffle, layered phase 2 + sporelings, creeping mycelium, phase 3, a bit more damage; target 60-75% pilot wins).
4b. (queued AFTER the Burning Village, Daniel 2026-09-21) **Burial Caverns rework**: it still plays as 'walk right' - brief `bracken/.claude/briefs/burial-rework.md` (descent in three depths, grave-candle quest, two ambushes, THE GRAVE WARDEN mini, enemy mix, movers).
4c. (queued AFTER the Burial rework, Daniel 2026-09-21) **THE WITCHLIGHT STAIR** - new level between the Burial Caverns and the Mage's Folly: brief `bracken/.claude/briefs/witchlight-stair.md` (loose magic, HEDGE WARDEN mini, GATE GARGOYLE boss). Folly then needs 'witchlight'. Probably two sessions.
4d. (queued AFTER the Witchlight Stair, Daniel 2026-09-21) **THE UNBURIED FIELD** - optional Death Knight level, a fork off the Stair; clearing it opens the Death Knight for ~800 coins: brief `bracken/.claude/briefs/unburied-field.md` (the ghost battle: volleys + cover, arrow pegs, cavalry charge, siege engines, STANDARD-BEARER mini, FIRST DEATH KNIGHT boss). Probably two sessions.
5. **The Burning Village** (`.claude/briefs/burning-village-pitch.md` + `-design.md`), then **The Powder Deck**
   (`the-powder-deck-pitch.md`), then **The Lit Church** (`the-lit-church-pitch.md`; rename Waymeet's `closedhelm`
   THE PALADIN → THE CRUSADER). Each clears a coin purchase (~800) for its class; heroes otherwise cost 10 silver.
