# COMBAT VARIETY — PHASE 1 SURVEY

Nothing was built. This reads the code as it stands on this worktree (base `a046a60` in name, but the actual
checked-out tip is `5dbadb6` — see **A DISCREPANCY WORTH FLAGGING** at the very end; the elite-per-kind moves and
`src/marks.js` the task brief for this survey described are not present here) and `audits/combat-audit.md` (the
fairness audit from 2026-09-15, not redone). Every "best answer" below is read from one of three places, in this
order of trust: (1) the engine code itself — `hurtEnemy0` (~main.js 4729-4884), the guard checks in the swing
resolver (~main.js 6570-6617), a creature's own `update<Kind>` function; (2) the bestiary text in `BEASTS`
(main.js:3461-3588), which is written for the player and is usually exact; (3) `audits/combat-audit.md`'s frame-data
and mark columns. Where none of the three answers the question, it says **GUESS** and the fight lab was used —
sparingly, four short `BK.fightLab` runs, noted where they appear. Level+count columns come from a small read-only
script built for this survey (`LEVELS[i].build()` walked for every level, ambush waves included, non-creature
props excluded) — it is not part of the deliverable and was deleted before committing.

**The marks.** There is no `src/marks.js` on this tree. The one true table is enforced by `tools/tells.mjs`, which
reads every creature update function and checks the `!`/`!!`/`LOW`/`HIGH` printed over a windup against whether its
blow is actually blockable. That tool, not a data file, is the source of truth here; its findings agree with
`combat-audit.md`'s "mark" column, which is what the per-creature table below quotes.

---

## 0. ENGINE MECHANISMS ALREADY IN PLACE (read before proposing new ones)

The diagnosis in the brief is broadly right, but the code already carries more of the PLAN's machinery than the
brief credits it for. Anyone building Phase 2 should extend these, not duplicate them:

1. **A front guard that only a HEAVY blow or a flank opens, on nine creature kinds already.** The swing resolver
   (main.js:6570-6617) special-cases `shield`, `soldier`, `heavy`, `watch`, `pike`, `turtle`, `crab`, `chief`
   (`chiefShielded`) and `king`: hit them from the front without `throughGuard()` (`const throughGuard = () =>
   P.heavy`, main.js:5097) and the blow bounces outright — `SFX.clank()`, a shove or knockback, zero damage, a
   named callout ("SHIELD", "PIKE", "HORNS", "THE HAFT"). A HEAVY blow, or an attack from behind/the side, is the
   only way through. **This is already "the wrong verb visibly fails," for the game's whole front-guard family.**
   What it is missing is not the mechanic — it is that dodging behind them is always available, costs nothing, and
   answers every one of these the same way a heavy blow does, so heavy stays optional in practice even though a
   light hit from the front is a hard no.
2. **A poise bar that a heavy blow (and only a heavy blow, mostly) fills**, on `POISE_HEAVY` (main.js:4565):
   `lancer, brute, heavy, hedgeknight, troll, shield, swornsword, pike, berserker, watch, tideguard, bosun, boarder,
   soldier, hound`. This is the "armour → stagger then the gap" engine hook the brief's plan asks for, already
   wired for fifteen kinds. `poiseMax` (main.js:4567) gives every elite one too (`EL.poise = 80`), and minis/bosses
   carry a 100-point one by default unless `POISE_SKIP` (main.js:4566) exempts them.
3. **A one-hit-kill list for small fliers**, `ONE_HIT` (main.js:4531): `rook, wasp, harpy, bat, kite, drone, crow`.
   Any hit of any kind ends these. This cuts against the brief's proposed "flyers → plunge or throw" key: for six
   of the seven common fliers, the verb question is already moot — nothing needs a specific answer because
   anything works and it dies in one. Only the flying BOSSES (owl, roc) and the ones with a real HP pool
   (petrel, harpy is one-hit but still needs a landed hit while airborne) have a real "how do I reach it" problem.
4. **A shield already screens a shooter standing behind it.** `COVERED` (main.js:5215): `archer, javelin, spit,
   scout, marine, lookout, sapper, crossbow, spitcap`. A `shield` within 260px of a `COVERED` foe on its own level
   stops chasing and plants itself between the player and the shooter (main.js:16029-16035). **"Shield in front of
   a covered shooter," the plan's #3 example verbatim, already exists as creature AI** — what does not exist is
   the level design putting them near each other on purpose outside ambush rooms; GARRISON scatters them across a
   route (see §3), so the behaviour rarely triggers.
5. **Per-boss/mini/elite weak-and-resist multipliers already fill most of `hurtEnemy0`** (main.js:4729-4884): the
   Paladin's ward (no damage until his own sword opens it, ×2 after), the Tollmaster/Lampreeve (×2 while
   stretched), the Hound Master (⅓ damage while the hound takes the cut, ×1.6 when it doesn't), the Herald (0.35×
   in plate, ×1.5 mired), the Golem ("STONE DOES NOT BLEED" — a flat no outside a crack window), the Forgemaster
   (½ armoured / ×2 scalded), the Reefmaw (×0.5 hide / ×2 stuck jaw), the tideguard (½ from the front unless
   staggered — this is a REGULAR foe, not a boss, and already has a directional weak point), the goblin priest's
   blessing (`PRIEST.take = 0.5` on anyone under the rite), an elite's `wallT` (½ from the front). **None of this
   exists for the ordinary trash roster** (sprig, archer, brute, the fields' ghosts, the mage's constructs, the
   sea's wildlife) — that gap is real and is where Phase 2's "per-family weak/resist table" has to land.
6. **`varietyMul`/`noteVerb` (main.js:4941-4949) is exactly what the brief says: a meter-fill multiplier and a
   "MIXED UP" number**, nothing else. It tracks eleven verbs by name — `swing, heavy, rise, sweep, dash, plunge,
   vault, parry, cast, skill, finish` — over the last 8 presses in a 4-second window: 3+ distinct verbs = ×1.5 meter
   fill, 2 = ×1.15, the same verb 4+ times running = ×0.6. It touches Resolve/Vigil/Heat/Plunder/Harvest — never
   damage, never a foe's poise, never anything the player sees on a foe. Confirmed: **the diagnosis is exactly
   right here**, this is the whole "reward."
7. **ELITE is one small rule table, not per-kind moves.** `ELITE` (main.js:2343-2349) assigns one of five generic
   rules to a base kind: `wall` (shield, pike, tideguard), `rally` (brute, hearthgob, cutlass — halves damage on
   nearby allies for a few seconds), `call` (thorn, goat, watch, scarecrow — summons 1-2 of its own kind),
   `slam` (hopper, troll, armour — one AoE ground pound), `lunge` (boarder, hedgeknight, heavy — one dash grab).
   There is no `updateEliteArcher`/`updateEliteShield`/`updateEliteGoblin` dispatch, no Archer Captain rain of
   arrows, no dodge roll, no three-cut Goblin Captain — **that content is not on this tree.** See the note at the
   end of this document.

---

## 1. THE FAMILIES, EVERY CREATURE

Fourteen families cover the roster. A creature that is reused by more than one family (mostly `miner`,
`rockgoblin`, `shardling`, which the mine reuses from the goblin camp roster) is given a full row once, in the
family it reads most naturally for, and referenced by name where it recurs. **Levels** lists every built level the
creature appears in with its GARRISON/hand-placed count (ambush waves included, secret levels `underleaf` and
`undercrown` included, `shop*`/`trial_*` excluded). **Marks** is quoted from `combat-audit.md`'s frame table where
the creature was measured; a bare `—` means the audit did not measure it (small, no windup, or a mode never fired
naturally) or it has no scripted attack at all (touch/contact only, or none — a lookout, a folk). **Best answer**
is the fastest/safest kill per the sources above. **Useless verbs** are the hero verbs that this creature's fight
never asks for and answers no differently for. **Existing gate** notes any of the mechanisms from §0 that already
apply to this creature by name.

### FAMILY A — THE GOBLIN LINE (the standing army: Bracken Wood through Highcrown)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **sprig** | wood(9), marsh(2), stockade(16), kings(12), underleaf(11), undercrown(6) | biteTell `!` | any swing; stomp/plunge also kill it clean | heavy, throw, dash, skill — it dies to one light hit | none |
| **shield** (SHIELDBEARER) | wood(9), marsh?, moor?, quarry/scree(3), hanging(4), storm(4), crown(2), spore(3), underleaf(5), kings(3), hunt-trial | shoveTell `!` | flank it (it turns in 0.8s) or a HEAVY blow through the front | throw, skill vs. it alone | **front guard (heavy-or-flank), POISE_HEAVY, COVERED-screener** |
| **spit** (SPITTER) | wood(5), marsh(3), hanging(1) | seed spat straight on | block, slash the seed back, or close and swing | plunge, dash | none |
| **wasp** | wood(12), marsh(10), kings(9) | touch only | any hit; it is a stepping stone as much as a foe | everything but a tap | **ONE_HIT** |
| **thorn** (SPIKE GOBLIN) | wood(8), marsh(4), storm(7 sic? see census), hanging(3), spire(3) | chargeTell (implied `!`, not in audit) | block the charge to stagger, or dodge and hit him resting; **no stomp** (spikes) | plunge (explicitly punished) | none coded (desc-only warning) |
| **hopper** (marsh frog) | marsh(13) | leap, bites landing | swing on landing, stomp, or block the leap | dash, skill | elite: `hopper→THE OLD BULLFROG, rule: slam` |
| **archer** (GOBLIN ARCHER) | marsh(12), stockade(8), kings(6), hanging(3), storm(8), scree(3), crown(7), hunt-trial | arcing arrow | block, or slash the arrow back to kill it in one | plunge, heavy | **COVERED** (shielded by a nearby `shield`) |
| **sapper** | stockade(7), storm(2), spire? underleaf(4) | drops a lit bomb at your feet | block him (bomb drops on himself) or dodge through | heavy, plunge | **COVERED** |
| **hound** (WAR HOUND) | stockade(7), crown(3), kings(4), hunt-trial | leaps low at last stride | stomp, swing as it lands, or fire between you | dash, skill | **POISE_HEAVY** |
| **pike** (PIKEMAN) | stockade(3), storm(4), kings(4), spore? | thrust, blocked = parried open | jump it, flank, or throw the shield | dash | **front guard (heavy-or-flank), POISE_HEAVY** |
| **javelin** (JAVELINEER) | kings(1), crown(20), hunt-trial | thrown javelin, parriable | parry it back, or close (it runs) | plunge | none coded |
| **soldier** | kings(3), crown(24), hunt-trial | slashTell `!` | flank, or block the swing to open him | throw | **front guard, POISE_HEAVY** |
| **heavy** (HEAVY KNIGHT) | kings(2), waymeet(6), crown(11) | double mark = overhead (dodge), single = sweep (block) | block the sweep, dodge the overhead, plunge while he drags his blade out | throw | **front guard (0.35× if not through), POISE_HEAVY, elite: `heavy→THE KING'S CHAMPION, rule: lunge`** |
| **brute** | stockade(8), kings(5), underleaf(3), hunt-trial | double mark = overhead (dodge, unblockable), single = sweep (block) | hit while club is raised, or while resting | throw | **POISE_HEAVY, elite: `brute→THE GOBLIN CAPTAIN, rule: rally`** |
| **sentry** (CASTLE SENTRY) | spire(2), storm(2), undercrown(1) | none (flees to ring a bell) | catch him before the bell, or break the bell | everything — he never fights | none |
| **rockgoblin** | scree(4), hanging(2), spire(9), moor(7), storm(2), frost(6), quarry-arc, undercrown(11) | lobs a lit lantern | close the distance (it has nothing up close) | plunge, throw | none |
| **shardling** | spire? undercrown(5), frost(6) | bursts on death | kill it AWAY from allies — the death-burst hurts everyone nearby | anything, carefully | none (a hazard on death, not a defence) |
| **miner** (GOBLIN MINER) | spire(3), storm(1), undercrown(11) | slow heavy pick swing | block to open him | dash | **POISE_HEAVY? no — not listed; treat as GUESS: block confirmed by desc, poise unconfirmed** |
| **queen** (boss, hive) | wood(1) | dive (block=stagger+2×dmg), low sweep | block the dive, jump/block the sweep, hit while winded | — (boss) | `e.mode==='winded'` ×2 dmg |
| **chief** (boss, Stockade) | stockade(1) | swaps club/sword+shield/bow at wall racks | break the weapon rack he is heading for; club: dodge slam then hit planted; sword: block to parry | — (boss) | `e.mode==='planted'` ×2 dmg; **its `reach` windup is unmarked and silent — combat-audit finding #2** |
| **gqueen** (boss, Highcrown) | crown(1) | on throne: points, gallery shoots; on feet: sceptre, charge; roof: lightning | bring the gallery down on her (only opening); nothing else scratches her | most verbs, until the gallery falls | full damage-immune (`SFX.clank(); return`) outside `e.mode==='pinned'` — a genuine hard gate, no soft answer |

### FAMILY B — GOBLIN CAMP & ROAD SPECIALISTS

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **thief** (GOBLIN THIEF) | kings(15) | touch-steal, then flees | catch him fast (a thrown shield is too slow per desc); kill = gold back "with interest" | heavy, plunge, skill | none |
| **kite** (KITE GOBLIN) | spire(2), moor(12), spore-adjacent | drops a stone from above | one cut to string or goblin drops both (goblin lands as a sprig) | heavy, dash | **ONE_HIT** |
| **horn** (HORNBLOWER) | moor(2) | wind gust, ground-slide/air-throw | get under it or reach him — one cut ends the horn | dash, throw | none |
| **sailer** (SAIL GOBLIN) | moor(8) | rams under a gust | block her (she spills) or step aside (stone takes her) | most; positioning beats damage | none |
| **stormshaman** (STORM SHAMAN) | kings(2), storm(2) | slow bolt | strike it or shield it back | dash | none |
| **hearthgob** (HEARTH GOBLIN) | storm(13), crown(10), underleaf(2) | stool swing | swing on approach — not a soldier | plunge, skill | elite: `hearthgob→THE HEARTH BOSS, rule: rally, hp×4` |
| **sweep** (CHIMNEY SWEEP) | storm(3) | soot throw, then hides in the flue | hit it only in the moment it watches its own throw land | most — a narrow window fight | none |
| **snuffer** (THE SNUFFER, regular) | hanging(8), spire(1), lamplit(13) | swingTell `!` if crowded | light what it snuffs, or cut it (lamps stay dark) | heavy, dash | none |
| **gobpriest** (GOBLIN PRIEST) | spire(2) | none — only the rite | kill FIRST, before the rite finishes; any hit on it breaks the rite | most; it cannot fight back | none of its own — but see the family key below (it is the key) |
| **gobmage** (GOBLIN MAGE) | spire(2) | bolt (block/return), rune underfoot (unblockable) | block/return the bolt; move off the rune | throw | none coded — desc says the bolt is returnable, unverified in code this pass |

### FAMILY C — CRAG & MOOR BEASTS

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **harpy** (CRAG HARPY) | scree(19 — read as `harpy` key, moor also has 28), hanging, spire(11), storm(1), crown(5), frost(6) | dive, straight line | block the dive (stuns her on the ground) then plunge | dash | **ONE_HIT** once grounded |
| **goat** (CRAG RAM) | scree(15), spire(2), moor(9), storm?, crown(3) | charges, hops ledges | block the charge (rears, open) | throw, skill | elite: `goat→THE HERD BILLY, rule: call, calls: goat, hp×5` |
| **troll** (HILL TROLL) | scree(6), spire(3), moor(4), storm? | boulder throw at range, swat up close | watch shadow/whistle for the throw; block the swat; sword/plunge both bite (soft hide) | — | elite: `troll→THE CRAG TROLL, rule: slam`; **bench note:** the BIG troll variant (30x36, 3.4×hp) is coded but unplaced |
| **crow** (STORM CROW) | wood(3), kings(2), spire(2), moor(11), fields(9) | none scripted; comes in strings, does not turn | go over/under/through — geometry, not a fight | most | **ONE_HIT** |
| **hare** (MOOR HARE) | moor(10) | bolts straight through you | jump it | most — a hazard, not a fight | none |
| **ram** (boss, THE RAM LORD, Scree) | scree(1) | charge, leap-land, stamp, butt | dodge/jump the charge into the wall (dazed), plunge between the horns | — | `ramOpen(e)` ×2 dmg, else his horns bounce a front hit |
| **windcaller** (boss, moor) | moor(1) | sky bolts, wind pull, triple bolt below half | cut him twice per perch to force him to jump; the wind IS the traversal, not a hazard to dodge | — | `!callerOpen(e)` → damage-immune between stones |

### FAMILY D — HOUNDS

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **hound** | (see Family A — the same `t:'hound'`) | | | | |
| **greathound** (mini, Kingswood) | kings(1) | lunge (jump/block, skids past open), pounce (dodge sideways, stunned), howl (calls 2 pups) | kill the pups fast to end the howl window; open him after a lunge or pounce | — | past half hp, snaps at anything beside it (indiscriminate) |
| **master** (THE HOUND MASTER, mounted) | **BENCHED — not placed in any built level** (RULES-LEVELS-AND-BOSSES.md §P confirms) | charge (block, hound rears), leap (roll), lash (parry), crack-whip (jump), whistle (calls dogs) | — not currently reachable in play | — | hound takes ⅓ of every blow unless reared/sprawled/shied/bitten (`e.t==='master'`, hurtEnemy0:4761) |

### FAMILY E — THE HEXED FIELDS (ghosts, and what floats)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **scarecrow** | fields(7) | sickle swing, only while your back is turned | face it (it freezes) and close in; swing on the yellow mark | dash, skill | elite: `scarecrow→THE TALL MAN, rule: call, calls: rook` |
| **rook** (FIELD ROOK) | fields(6/7) | marks a spot, dives | one blow, any kind, brings it down | — | **ONE_HIT** |
| **farmhand** (GHOST FARMHAND) | fields(4) | slow hoe swing, walks through walls | block/dodge the slow yellow swing; walls do not save you (positioning is moot) | plunge | none |
| **pumpkin** (PUMPKIN LURKER) | fields(9) | spore puff (red `!!`, step back) then bites on legs | back off the puff, then swing | dash | none |
| **marshlight** (MARSHLIGHT) | fields(6) | flares if approached | strike it to plant phantom planks | — | none |
| **haunt** (POLTERGEIST FORK) | fields(8), mage(8) | shakes (yellow `!`) then throws itself | shield it — it drops stunned | dash | none |
| **wight** (PEAT WIGHT) | moor?, causeway?, lamplit(17/9? see census — 17 lamplit, 9 deep, 12 deep-again, fields(7)), deep(12), undercrown-adjacent | rises beside you if you stand still, drains on hold | keep moving — it never surfaces | most; movement is the whole answer | Paladin-only: `isPaladin() && e.t==='wight'` → ×2 dmg |
| **ploughman** (boss, THE HEADLESS PLOUGHMAN, fields) | fields(1) | burning head throw, goad up close, red-mark plough charge | jump the charge (share sticks at the end — cut him then) | — | open>0 → ×1.8, else ×0.6 (share stuck in front of him takes nothing) |
| **strawking** (boss, THE SCARECROW KING, fields) | fields(1) | pole-mounted, grows bigger, burns | cut the pole; a vine-held trough holds a bigger build; a heavy/dash/plunge knocks his lantern into his own straw to burn him | — | custom `strawHurt()` gate, not read in full this pass — **GUESS** on the exact multiplier |

### FAMILY F — THE DROWNED REALM (the sunken city's own military and fisherfolk)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **watch** (THE DROWNED WATCH) | causeway(4), deep(7), lamplit(23), waymeet(10) | thrust `!`, sweep `!` | HEAVY only gets through the haft guard from the front; step in/out of the long thrust, never back | throw | **front guard (0.35× unless through), POISE_HEAVY, elite: `watch→THE WATCH SERJEANT, rule: call, calls: wight`**; light/dark hearing/sight (see §2) |
| **tideguard** | longwater(5), reef(4/5), causeway(11), lamplit(13), deep(9) | thrustTell `!` | the trident reaches further than expected — step out of its line, or block it (opens him) | throw | **front-facing ½ dmg unless staggered (hurtEnemy0:4798, a REGULAR foe with a directional weak point already coded), POISE_HEAVY, elite: `tideguard→THE TIDE CAPTAIN, rule: wall, hp×2.2`** |
| **netter** (NETTER) | longwater(6), reef(6), deep(6), causeway(7) | throws a weighted net, one-shot | mash out if netted; rush while its hands are empty | dash | none |
| **scout** (TIDEBOUND SCOUT) | longwater(13), reef(7), deep(5), causeway(12), lamplit(15) | throws a harpoon twice, then teleports | a parried harpoon goes back and kills it | dash, plunge | none coded — parry-return per desc |
| **herald** (boss, THE TIDE HERALD, longwater) | longwater(1) | sweep `!!`, thrust, glide `!!`, hurl | get onto the stones when the sea comes; cut him only once beached in the mud | — | plate on: ×0.35 unless `mode==='mired'` → ×1.5 — a directional/state gate exactly like the plan wants, already built |
| **drownedking** (boss, THE DEEP) | deep(1) | swim-circle line-charge, THE FALL, THE UNDERTOW, THE ANCHOR, THE SLAM | be across his charge line with a pillar behind you; a stone in hand beats the undertow | — | `e.open > 0` → ×1.35 |
| **tollmaster** (boss, lamplit) | lamplit(1) | ledgerTell `!` (PARRY = stagger), coin weight (dodge-only), rod (jump) | parry the ledger outright; dodge the weight; jump the rod; hit him hard when he sets the bier down | — | both hands up (open) → ×2; on the bier (`!onFoot`) → ×0.7 |
| **lampreeve** (boss, hanging→lamplit street) | lamplit(1) | sweep `!`, low pole jump, black-water breath (blinds), hook | jump the low sweep; a line beats the hook; hit him hard while stretched hooding a lamp | — | `e.open > 0` → ×2 |

### FAMILY G — SEA WILDLIFE

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **turtle** (SNAPPING TURTLE) | marsh(2), longwater(6), reef(2) | snaps on a tell, neck out after | wait the snap, hit the exposed neck | throw | **front guard (shell), POISE_SKIP not set so it can be staggered** |
| **eel** | marsh(5), longwater(15), reef(6), deep(12), causeway(6) | lungeTell `!` | be at the surface, or be out — a positioning fight, not a damage one | most | none |
| **heronfoe** (GREY HERON) | marsh(3), longwater(6), causeway(1) | neck coils back, then spears | one cut ends it once you catch the coil | most | **ONE_HIT-adjacent (one cut kills, per desc, though not on the coded `ONE_HIT` set — GUESS/discrepancy, worth a fight-lab check in Phase 2)** |
| **crab** (SHORE CRAB) | longwater(6), reef(2), deep(8), causeway(11) | claws up = guard | plunge it (flips it over, then soft) | dash | **front guard while `e.guardT>0`; stomp flips it — an existing plunge-specific answer for a whole kind** |
| **urchin** | longwater(4), reef(7), deep(10), causeway(7) | none — spines only | go around it or kill at range; no window up close | melee entirely, per desc | none coded — desc says "there is no window," worth confirming a melee swing truly can't touch it |
| **angler** (ANGLER) | longwater(3), reef(10) | biteTell `!`, lure flares first | be off the straight line the lure telegraphs | most | none |
| **petrel** (STORM PETREL) | reef(9), hurricane(11), causeway(13) | dives on a line at your current spot | walk out of the line, or hit it out of the air | plunge (it's airborne, timing-gated) | none |
| **siren** (SIREN) | longwater(11), reef(5), lamplit(2), causeway(1) | pulls you toward her | hit her (she dives for a while) | most | none |
| **feeler** (an arm in the flats) | causeway(15) | lash (shield turns it, then lies out to be cut), hidden = untouchable | wait for the lash, cut it while it lies out | — | hidden state = fully immune (`krakenHurt` shared code with kraken) |
| **holdfast** (THE HOLDFAST, Deep) | deep(7) | grabs and holds you under — no rising with or without a stone | cut it off you once caught | most | none — pure grapple, damage-gated by escape not by verb |
| **prise** (THE PRISE, Deep) | deep(7) | claw-open tell, steals your STONE | kill before picking anything up, or carry nothing through | — | none |
| **frog** (boss, BULLFROG KING, marsh) | marsh(1) | tongue, leap, venom, great-breath drag | block the breath to dig in; stomp the soft throat mid-croak (×2), two stomps on the head end the phase | — | `croak`/`dazed` → ×2; `idle` 2 hits forces a hop-away; plunge on non-dazed builds head-hit progress |
| **reefmaw** (boss, THE REEFMAW, reef) | reef(1) | rise, bite, reef-spit | wait for a coral-stuck bite (jaw sticks, that's the cut window) | — | hide (lurk/sleep/sink) = immune; `stuck`/`reel` ×2, `recoil` ×1.2, `riseTell`/`rise` ×0.7, else ×0.5 — a five-state gate already fully built |

### FAMILY H — SHIP CREW (living pirate crews and their drowned holdovers)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **cutlass** (DECKHAND) | flotilla(11), hurricane(17) | slashTell `!`, wide swing | hit him at the END of his own swing (he guards mid-wind-up) — timing, not a verb | throw | elite: `cutlass→THE FIRST MATE, rule: rally` |
| **boarder** (BOARDER) | flotilla(7), hurricane(12), deep(6) | throws a grapple, hauls you in | put something solid between you, or kill him mid-haul (he can't let go) | plunge | elite: `boarder→THE BOARDING MASTER, rule: lunge` |
| **marine** (MARINE, in the rigging) | flotilla(7), hurricane(10), deep(1) | shoots down the deck, must stand to aim | climb to him — nothing up close; the deck is not cover (his shot skips once) | most; positioning beats damage | none |
| **bosun** (BOSUN) | flotilla(5), hurricane(6), deep(1) | door-heavy pin swing, whistle if he sees you first | close distance before the whistle | dash | none |
| **lookout** (LOOKOUT) | flotilla(3), hurricane(6), reef(3), deep(1) | cannot fight — only sees, then whistles | kill him in the breath before the whistle lands | everything else | none |
| **sailor** (DROWNED SAILOR) | reef(8), deep(6), lamplit(4), hurricane(14) | sweep boathook, low | jump it or shield it (parried hook opens him); hit him AFTER his own swing | throw | none |
| **quarter** (boss, THE QUARTERMASTER, flotilla) | flotilla(1) | cutlass swings (shield), pistol shot (cannot block), EN GARDE bait | shield the cutlass; dodge the shot; WAIT out EN GARDE, never swing into it | — | blade-in-rope (`cut`/`reel`) → ×1.5; `guard` → full immune; EN GARDE punishes an attack — see §2 |
| **captain** (boss, THE CAPTAIN, hurricane) | hurricane(1) | sabre cuts, pistol brace, grapnel haul, lit keg | cut him only in the breath after he beaches from the sea (untouchable while it carries him) | — | `mode==='beach'` ×2, `mode==='reel'` ×1.5 |

### FAMILY I — THE MAGE'S FOLLY (tower constructs)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **topiary** (TOPIARY BEAST) | mage(11) | shivers, then hops+swipes `!` | leave it (it re-roots) or hit it on the swipe's tell | dash | none |
| **armour** (ANIMATED ARMOUR) | mage(14) | long yellow overhead | block it; broken, it splits into crawling pieces | dash | elite: `armour→THE WARDEN ARMOUR, rule: slam` |
| **piece** (A CRAWLING PIECE) | (spawned from armour, not GARRISON-placed — no standalone count) | ankle grab | one blow | most | none |
| **broom** (BROOM AND BUCKET) | mage(19) | tips back `!`, rams | shield it (knocks it silly); weak, but swarms | plunge, skill | none |
| **mimic** (MIMIC CHEST) | mage(3) | snap `!` when approached | step back off the mark, cut while it chews air | dash | none |
| **imp** (IMP) | mage(17) | fire throw `!`, puffs away after | hit before the puff | dash | none |
| **turret** (ARCANE TURRET) | mage(5) | long charge, slow orb | outrun it, or shield it | dash, plunge | none |
| **homunculus** (mini, THE HOMUNCULUS) | mage(1, mini) | red SCUTTLE (jump), yellow POUNCE (shield), red POUND (jump), red FLASK (move) | cut it in the pant after every trick — a clean four-state rotation already built | — | `homHurt()` gates damage while it is mid-trick — GUESS on the exact multiplier, not read this pass |
| **archmage** (boss, THE MAGE'S FOLLY) | mage(1) | blink, circle-mark (yellow=shield, red=move), ward (cut 3 runes) | cut the runes to open the ward; final phase, wait for the familiar's head and cut the eye | — | `archHurt()` custom gate, three-stage — **GUESS**, not read line-by-line this pass |

### FAMILY J — WAYMEET ROAD (living men-at-arms, not goblins)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **swornsword** (SWORN SWORD) | waymeet(19), underleaf(0 — none placed), fields(2) | one cut, shown half a second early | raise the shield AS the blow lands (parry-timed), not held early — per desc this is the game's first real duel-timing lesson (unverified against code this pass — **GUESS**, flagged for a closer read before Phase 2 relies on it) | dash | none coded that this pass could confirm |
| **hedgeknight** (HEDGE KNIGHT) | waymeet(11), hanging?, fields(3) | single mark = side swing (beat it), double = jump (unanswerable, leave it); sometimes feints | guard the SECOND swing when the first is a feint | dash | elite: `hedgeknight→A HEDGE KNIGHT CHAMPION, rule: lunge, hp×1.6` |
| **runner** (THE RUNNER) | waymeet(4), fields(1) | none — only the shout that calls every sworn sword in earshot | reach him before he shouts, or be ready for the trot-in reinforcements | most | none |
| **crossbow** (CROSSBOWMAN) | waymeet(14), fields(2) | bolt, timed to where you stood when he levelled | shield the bolt on landing (sends it back up the stair) — a guard raised early does not work | dash, plunge | none coded — timing-only per desc |
| **drunk** (THE DRUNK) | waymeet(6) | thrown junk (yellow, shield) or a bottle (red, unblockable, leaves glass) | block the junk, dodge the bottle, watch the ring on the ground | most | none |
| **lancer** (SERJEANT, mounted) | waymeet(3) | charge `!` (shield=he goes over the horse), close-in swipe | shield the charge, or jump/roll it; unhorsed he is just a man with a sword | — | mounted: ×0.6 (barding) unless blown/reared/reeling; open → ×1.5 |
| **closedhelm** (boss, THE PALADIN, waymeet) | waymeet(1) | cut `!`, thrust `!`, bash `!!` (a red line — roll through or be gone), judgement (marks a spot) | meet the cut/thrust on the beat (parry, timed ward-drop, or a roll through it) to break the ward; only his own sword opens him | — | full immune outside `e.open>0`, then ×2 — the single cleanest "one verb, and only that verb" gate on the whole roster; a template for Phase 2's per-family key |

### FAMILY K — THE MONASTERY (Cloud Cloister)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **fledgling** (ROC FLEDGLING) | spire(15) | rears back, pecks | shield the beak | throw | none |
| **bat** (CAVE BAT) | spire(10), moor?, undercrown(12), mage(12), fields(7) | none — reacts to light, not to you | carry no light through its roost, or accept the one hit it takes to kill it | most | **ONE_HIT** |
| **golem** (mini, spire) | spire(1, mini) | stomp `!!`, drink-then-counter (unmarked — audit finding #2) | wait for a crack window; STONE DOES NOT BLEED outside it | — | full immune unless `crackT>0` or `mode==='stagger'` (then ×1.5) |
| **roc** (boss, THE ROC, spire) | spire(1) | shadow-marked dive, wing-beat throw onto thorns | force her down (something has to knock her down), then punish — she is a tenth as fragile in the air | — | airborne + not "open": ×0.1 (a near-total damage gate in the air); grounded/open: ×1.5 |

### FAMILY L — SPOREWOOD FUNGUS

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **sporeling** (SPORELING) | spore(24) | bites | kill at range or step back — it bursts into a slowing cloud on death | — | none |
| **spitcap** (SPITCAP) | spore(10) | lobs a sleep-cloud bomb | one blow while swollen (before it throws) | most | none |
| **weaver** (WEAVER) | spore(8) | web spit, holds your feet | mash out; cut the curtain it hides behind | plunge | none |
| **lurker** (LURKER) | wood(3), spore(12) | ambush lunge from cover | walk, don't run, through groves; hit caps that look "too plump" before they move | dash | none |
| **drone** (SPORE DRONE) | spore(10) | none — drifts and bursts | stomp or plunge it out of the air; swords bounce off | swing | **ONE_HIT**; explicitly sword-resistant — this is a REAL existing "wrong verb glances" case for a common foe |
| **shaman** (TOAD SHAMAN) | spore(3) | raises sporelings, vanishes ("poof") when struck | chase it down first, before its summons pile up | most | teleports on any hit that doesn't kill — a real "reads a strike" reaction, see §2 candidate list |
| **mother** (boss, THE MOTHER CAP, spore) | spore(1) | roots/pods/sleep spores while sealed; nothing while flared open | bounce off her caps when the gills flare, cut them then; cut all four, then six hits of anything on the exposed heart | — | fully gated by `gillsOpen`/`e.t==='gill'` state — a big multi-part boss puzzle, not a damage table |

### FAMILY M — UNDERCROWN (the mine under the castle)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **propman** (THE PROPMAN) | undercrown(7) | slow, wide, heavy prop-swing | kill him before cutting the timber he is bracing (he puts the blow back in faster than you take it out) | dash | none — an ORDER-of-operations puzzle, not a verb one |
| **clinger** (THE CLINGER) | undercrown(7) | commits only when you are airborne beside it | swing while it has you (it lets go) | most while grounded | none — a state that only exists in the air |
| **grub** (CAVE GRUB) | spire(2), undercrown(2) | acid spit at range; burns on touch | cut it (never stomp — it burns bare skin) | — | none coded, per desc a touch-punish not read this pass |
| *(miner, rockgoblin, shardling recur here — see Family B)* | | | | | |
| **prince** (boss, THE BURIED PRINCE, undercrown) | undercrown(1) | royal cut `!`, calls courtiers, throws his crown (bareheaded = open) | block the cut to reel him; relight lamps when he is SHROUDED past half; bring a timber set down on him to bury him again | — | `princeHurt()` custom gate — **GUESS**, not read line-by-line this pass |

### FAMILY N — UNDERLEAF (the secret night village)

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **assassin** (GOBLIN ASSASSIN) | underleaf(12) | markTell `!!` (an unavoidable warning, no blow), stabTell `!` (from behind, parriable) | parry the stab specifically — the mark itself cannot be blocked, only the followed thrust can | throw | none coded — a two-stage tell (warn, then a parriable stab) confirmed by both the desc and the audit's frame table |
| **berserker** (GOBLIN BERSERKER) | underleaf(2), waymeet (a chained one, unique) | runs in a straight line, cannot turn while doing it | dodge through him and hit his back; a whiffed swing (or a wall) drops him on his face | most; his own aggression is the opening | **POISE_HEAVY, HEAVY** (big-bodied set); no shield, no guard at all — the opposite problem from every guard-front kind above |
| **grandmother** (boss, THE GRANDMOTHER, underleaf) | underleaf(1) | stick strike toward the last NOISE made (unblockable); groped reach up close (shield turns it) | move/attack quietly (blocking halves footstep noise, per `groundVol() * (P.block ? 0.4 : 1)`, main.js:6495); make one noise on purpose to bait the stick, or none at all and wait for her temper-rap opening | most; this fight is entirely about sound discipline | **a genuine existing "reads how you play" boss — see §2** |

### STANDALONE COURT BOSS

| creature | levels (count) | attacks + marks | best answer | useless verbs | existing gate |
|---|---|---|---|---|---|
| **king** (boss, KING GORM UNDERLEAF, Kingswood) | kings(1) | sceptre sweep, hand-hurl, dropped cages, court throws | cut the four litter-bearers to drop the throne; the crown is otherwise immune | — | full immune outside `mode==='held'` (caged) → ×2 |

---

## 2. FIVE "READS YOU" BEHAVIOURS THAT ALREADY EXIST

The brief's diagnosis item 5 ("FOES DO NOT REACT TO HOW YOU FIGHT") is largely true for the trash roster, but it is
not true of the whole game. These five are already in the code, confirmed against `main.js` except where noted:

1. **The Grandmother (Underleaf boss) tracks NOISE, not position.** Every footstep and swing calls `noiseAt`
   (main.js:6220, 6495) when `L.hush` is set; her `listenTell`→stick strike lands wherever the last noise was made,
   full-blooded and unblockable. Blocking while you walk quiets your steps to 0.4× (`main.js:6495`). Counterplay:
   move and swing sparingly, or make one deliberate noise to bait the stick where you want it. **Tell:** her
   `listenTell` pose. **Confirmed in code.**
2. **The Quartermaster (Flotilla boss) baits an attack and punishes it.** On the same deck, within 56px, not
   already guarding, she stops and says EN GARDE (`main.js:10658`, a red `!!`): if you cut into it "nothing turns
   her answer" (per the bestiary); the correct read is to wait her out and let the point drop. **Tell:** the `!!`
   and the "EN GARDE" callout. **Confirmed in code** (the trigger condition at 10658; the "why" — that a swing
   during it is punished — is the bestiary's own claim, not re-derived from `hurtEnemy0` this pass).
3. **The toad shaman (Sporewood) teleports the instant it is struck and not killed** (main.js:4863): a burst,
   then it repositions ~70px away, favouring the side that keeps it on solid ground. This reads whether you landed
   a hit at all, not a pattern, but it is a direct reaction to the player's last action. **Tell:** a "POOF" number
   and a burst. **Confirmed in code.**
4. **The Watch (Drowned Realm) reads where you choose to stand relative to light**, per its bestiary entry: it
   cannot see you under a burning lamp, and out of the light it hears you sooner and closes faster. This is a
   reaction to the player's chosen position, not a combo pattern, but it is the game rewarding a specific kind of
   play (staying lit) with a specific kind of safety. **Not re-derived from code this pass — GUESS**, sourced from
   the bestiary text only; worth a fight-lab confirmation before Phase 2 leans on it.
5. **The Sworn Sword (Waymeet)'s guard-timing lesson**, per its bestiary entry: hold the shield up early through
   his whole windup and he shoves you; raise it exactly as the blow lands and he is wide open for 1.5 seconds. If
   this is coded as stated, it already IS "a duellist that punishes turtling" — the exact shape of the brief's plan
   item 2's brute example, just on a regular foe instead of an elite. **GUESS — flagged as the single highest-value
   thing to verify before Phase 2**, because if it is real and reliable it is a template to copy onto other duel
   kinds (hedge knight, heavy, soldier) rather than invent from scratch.

---

## 3. PER-HERO VERB-USAGE PICTURE

`noteVerb` tracks eleven named verbs (§0.6): `swing, heavy, rise, sweep, dash, plunge, vault, parry, cast, skill,
finish`. Block/dodge are not tracked verbs (they gate the front-guard mechanic in §0.1 but do not feed variety).
Reading which of these a hero's kit ever puts to REQUIRED use (not merely available) against the roster above:

- **Knight** (block+parry hero; `SHIELDED` per `lab.js:16`). **Never required:** `sweep` (low sweep has no foe that
  answers differently to it than a light swing — same numbers per combat-audit finding #9), `vault` (a
  traversal move, not combat), `cast` (not in kit). **Sometimes required, rarely forced:** `heavy` — genuinely the
  only way through nine front-guard kinds (§0.1) from the front, but flanking is a strict substitute that costs
  nothing, so no fight FORCES it. **Never forced:** `finish`/`skill` — combat-audit shows most of his skills land
  zero damage on a boss-flagged target (light Lance, Whirlwind, Rising Cut skill, War Cry).
- **Pyromancer** (dodge hero). **Never required:** `parry` (no `parryFoe` combo triggers for her — that combo is
  knight-only per hurtEnemy0:4820), `finish` similarly optional. Her `heavy` connects for only 3 damage against a
  common foe (combat-audit table) — technically "used," never rewarding.
- **Paladin** (`SHIELDED`). **Never required:** `sweep` (identical numbers to light per audit), `cast` (not in
  kit). Her signature combo (`quakedUntil`→maul, hurtEnemy0:4821) is the one hero-combo actually worth chasing, but
  nothing in the roster requires it — the basic combo still kills without it.
- **Freebooter/Pirate**. **Never required:** `heavy` connects for a strong 38 damage but no fight demands it over
  three lights; `vault`, `cast` not applicable. His hero-combo (Powder and Steel, hurtEnemy0:4822) again exists but
  is never mandatory.
- **Death Knight/Reaper**. **Never required:** `plunge` (does 1 damage per the audit — essentially a traversal
  tool wearing a combat label, not a verb any fight asks for), most skills against a boss-flagged target show "no
  hit."
- **Warden** (sixth hero, spear/tap-deflect; not in `combat-audit.md`'s measured set, no `trial_warden` level in
  `LEVELS` — she is real and playable, with her own talent tree and `bakeWarden`, but unmeasured here). Her whole
  kit is organised around ONE verb the others do not have — tip-vs-shaft placement on the thrust — which nothing
  else in this survey speaks to; flagged as **out of scope for Phase 1's cross-hero comparison**, not a gap in the
  survey method.

**The pattern that repeats across every hero:** `heavy` is the one verb the roster's guard mechanic (§0.1) already
rewards, but never demands, because flanking a guard-front foe is free. `plunge`/`throw`/most named skills are
close to decorative against the common roster — they exist, they do something, but nothing the roster does
currently punishes not using them. This matches the brief's diagnosis closely, with the one correction that it is
not that the game never gates verbs (§0.1, §0.5 show it does, repeatedly, for guard-fronts and for most bosses) —
it is that the TRASH roster (as opposed to bosses/minis/elites) is almost entirely ungated, and even where a gate
exists (front guard) a zero-cost alternative (flanking) removes the pressure to use the intended verb.

---

## 4. TOP 10, RANKED BY (FIGHTS TOUCHED) × (HOW DIFFERENT THEY BECOME)

| # | change | fights touched | how different | size |
|---|---|---|---|---|
| 1 | **Extend the existing front-guard mechanic (§0.1) to a full per-family weak/resist table in `hurtEnemy0`**, so light-from-the-front on a shielded/armoured trash kind does a visible glance (not zero — a small chip, so the tool isn't a hard wall) unless flanked or through-guarded, and give ARCHERS/CASTERS a return-fire punish for not closing distance. This is the brief's plan item 1, but for the ~40 creatures that currently have NO gate at all (sprig-tier melee, the fields' ghosts, the tower's constructs, most sea wildlife), not rebuilding what shield/soldier/heavy/watch/pike/turtle/crab already have. | every level, every garrison encounter | high — the single biggest lever; turns "swing until it dies" into "read what it is" for the whole common roster | **L** |
| 2 | **Make flanking cost something**, or make the front-guard bounce meaningfully worse than a flank (a stagger, a shove, lost stamina) so `heavy` stops being a free-to-ignore alternative to walking behind a shield. Small, surgical, touches the same nine kinds already in §0.1. | shield, soldier, heavy, watch, pike, turtle, crab, chief, king — every level with them | high for those fights specifically, low elsewhere — makes an EXISTING mechanic actually bite | **S** |
| 3 | **Turn `varietyMul`'s "MIXED UP" into a foe-facing effect** (a visible bonus stagger or damage tick on the CREATURE, not just a meter multiplier), per plan item 5. The hook (`noteVerb`, `verbs[]`, the 3-in-4s window) already exists and is well-tested; this is purely "read the same signal a second way." | every fight, cosmetically at first | medium at first (a number/particle), but sets up every later verb-gate to have a visible payoff | **S** |
| 4 | **Give ARCHER/JAVELIN/CROSSBOW/SCOUT/GOBMAGE — the parry-return family — an explicit "closing the distance ends it" rule**, since the bestiary already claims most of them (archer, javelin, crossbow per desc; scout, gobmage unconfirmed). Half of them (archer, javelin) are confirmed in the bestiary text only, not re-derived from code. Wire the ones that are missing it and confirm the rest with `tools/tells.mjs`. | marsh, stockade, kings, hanging, storm, scree, crown, waymeet, fields, longwater, reef, deep, causeway, spire — nearly every level has at least one | medium — turns "ranged foe" into one legible family instead of six different half-implementations | **M** |
| 5 | **Composed pairs by design, not accident (plan item 3).** The COVERED/shield-wall AI (§0.4) already exists; GARRISON just never places a `shield` and a `COVERED` kind close enough together outside ambush rooms. Hand-place 1-2 deliberate shield+archer or brute+goblin-mage pairs per level's GARRISON call (not a new system — a placement change). | every level's route (currently zero intentional pairs outside ambush rooms) | high — this is the plan's "fewer foes, more decisions" delivered with code that already exists | **M** |
| 6 | **A poise/stagger threshold on the un-gated trash tiers** (sprig, spit, archer, thief, kite, sailer, stormshaman, broom, mimic, imp, sporeling, spitcap, weaver) using the existing `POISE_HEAVY`/`poiseMax` machinery, so a heavy blow visibly rocks even the small stuff instead of doing generic knockback. | every early-to-mid level | medium — makes "the same swing on everything" read differently even before verb GATES land | **S** |
| 7 | **Verify and then lean on the Sworn Sword's guard-timing lesson (§2.5)**, and copy it onto Hedge Knight/Soldier/Heavy — currently guard is binary (through/not through `throughGuard()`), never timing-sensitive for those three, only implied for swornsword. If real, this is the cheapest possible "duellist parries the pattern" (plan item 2) because the parry-timing code plausibly already exists somewhere in the guard resolver and just needs to be generalised. | waymeet primarily, then crown/kings/stockade if copied onto soldier/heavy | high, IF confirmed — a genuine skill test rather than a stat check | **M**, pending a **S** verification pass |
| 8 | **A hazard-adjacent throw target next to at least one fight per level** (plan item 4): `knock-into-hazard` already exists per the brief, and several levels already have obvious candidates unused (the Deep's water for `holdfast`, the crag's ledges for goats, Highcrown's dropped cages). Catalogue the 8-10 best existing hazards and wire one throwable-adjacency each. | 8-10 specific fights, not every level | medium per fight, but each one is a genuinely new solved problem, not a reskin | **M** |
| 9 | **A `wrong-verb glance` sound/VFX pass**, cheap and orthogonal to any of the above: right now a guard-front bounce already plays `SFX.clank()` and a callout; extend the SAME pattern (a distinct sound + a named number, e.g. "GLANCES") to the new gates from #1 and #6, so the feedback loop is consistent game-wide rather than invented per-family. | every fight touched by #1/#6 | low on its own, but it is what makes #1 legible rather than "my hits just do less now" | **S** |
| 10 | **Confirm/replace the archmage's, strawking's, prince's, and homunculus's custom `*Hurt()` gate functions** (all flagged GUESS above — not read line-by-line this pass) against `tools/tells.mjs` and a short fight-lab pass, since three of these are among the most content-dense bosses in the game and this survey could not fully verify their per-state multipliers sit where the bestiary claims. | mage's folly, hexed fields, undercrown — 3 bosses + 1 mini | low variety-wise, but high risk if Phase 2 builds new verb-gates on top of an assumption that turns out wrong | **S** (verification only) |

---

## #10 VERIFIED (PHASE 2A, against master 95b6479)

The four custom gates this survey marked GUESS, read line by line and then watched in `BK.bossLab` (knight and Death
Knight, 150 s cap, every blow on the boss logged as damage asked against health taken, bucketed by mode). All four
were killed by both heroes. What the code does, and what the lab saw:

| gate | code (main.js) | lab ratio taken/asked | where the survey was wrong |
|---|---|---|---|
| `archHurt` (archmage) | **nothing** in `change`/`swallow`/`blink`/`wake`, while any rune stands, or on the orrery's arm in stage 2 (the counterweight is the only way down); **open ×2** (stage 1-2) or **×3.2** (stage 3, the eye), each opening capped at 18% / 8% of max health, then HE RECOVERS; stage 3 closed **×0.3** (the hide); stage 1-2 closed and unwarded **×1**; and `archGate` floors his health at 66% / 55-44-33% so no blow skips a stage | ward/change/swallow 0.00; open s1 1.9-2.0, s2 1.6-1.8 (the cap), s3 3.2; s3 hide 0.28 | "three-stage" is right; it is not a plain multiplier but a cap per opening plus a health floor per stage |
| `strawHurt` (strawking) | **nothing** in `rebuild`/`lightTell`/`poleLeap`; stage 3 with his lantern, not open, and `P.heavySwing \|\| P.dashAtk \|\| plunge` sets him **ablaze ×2.2** (5 s open); **open ×2**; otherwise **×0.45** | rebuild 0.00; walk/sweep 0.44-0.50; tangled/ablaze 2.0 | `P.heavySwing` is also true on **every third cut of a run**, so the lantern does not need the held heavy blow: any hero's third cut, a dash attack or a plunge knocks it |
| `homHurt` (homunculus, mini) | **open ×2**, otherwise **×0.55** (min 1) - one line, no per-trick state | pant (`spent`, open) 2.3-2.7 (its 70-point poise break adds ×1.5 on top); every trick 0.53-0.55 | it does not "gate damage while mid-trick": it takes 55% at all times outside the pant, trick or not |
| `princeHurt` (buried prince) | **nothing** while `sunk`; buried **×2**, reel **×1.5**, bareheaded **×1.5** (stacks), shrouded (tomb dark) **×0.35** else in lamplight **×1.25** | stalk 1.0, buried 2.4-2.6, reel 1.8, bare 1.5, lit snuff 1.3 | nothing wrong; the lab bot lights lamps first, so the ×0.35 shroud never came up in these runs (read from code only) |

None of these reads any hero verb except the Scarecrow King's lantern (heavySwing/dashAtk/plunge), so the family
table Phase 2A adds (trash only: no `maxHp`, `mini`, `elite` or `big`) cannot reach them.

---

## A DISCREPANCY WORTH FLAGGING

The task that launched this survey described this worktree as cut from `master a046a60`, and stated that master
"now has `src/marks.js`" (one table for every windup's mark) and elite signature moves — `updateElite` dispatching
to `updateEliteArcher`/`updateEliteShield`/`updateEliteGoblin`, an Archer Captain with a dodge roll, a Shield
Captain charge that pins to a wall, a Goblin Captain's three cuts.

This worktree's actual `HEAD` (`5dbadb6`) is a strict ancestor of `a046a60` (`git merge-base a046a60 HEAD` returns
`HEAD` itself) — i.e. **this checkout is older than the `master` tip the task described**, not equal to it. Its
`git log` last entries are the recent Tower rework, the Homunculus, and the Goblin Clergy (gobpriest/gobmage) — all
present and surveyed above — but the commit titled "AMBUSHES LED BY ELITES, batch one" (which is `a046a60` on the
real `master` branch, per `git log --all`) is **not** in this branch's history. Consequently:

- There is no `src/marks.js` on this tree. The mark table lives only as the derivation logic inside
  `tools/tells.mjs`, which reads it out of the update functions directly — used as the source of truth throughout
  this survey instead.
- `ELITE` (main.js:2343) is the five-generic-rule table described in §0.7, not per-kind moves. No Archer Captain,
  Shield Captain charge-pin, or Goblin Captain three-cut exists in this tree's `main.js`.
- The Homunculus, gobpriest/gobmage, and the Tower rework the task described as recent ARE present and were
  surveyed as current content (Families I and B, and the mine table).

Everything in this survey is accurate to what is actually in this worktree. Phase 2 planning should re-check
against the real current `master` tip before assuming the ELITE-dispatch and `src/marks.js` details apply, since
this worktree could not see them.
