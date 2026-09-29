# claude/deathcost - the death cost, game-wide

Daniel, 2026-09-28 (Salt & Sanctuary / Shovel Knight direction): dying drops what you have not banked.

## What changed
- src/death-cost.js (new): the rules with no game in them - the save shape (PROG.deathCost), the carry {coins, purse, xp}, the drop, `doorSpot` (where a boss bundle lies), `normalizeDeathCost` (the save migration).
- src/main.js: a section "THE DEATH COST" (before `die`) plus small hooks:
  - CARRIED = gold and XP picked up since the last shrine, counted per hero (`dcCarry`): coins at both coin pickups, XP in gainXp, the direct purse payments (elite, shut room, weapon spoils).
  - A death (`die`, the two mage-form falls, and both heroes going down in co-op) takes exactly the carry out of the level count / purse / XP and makes ONE bundle.
  - FOE: the creature that killed you (killerOf now names it) carries the bundle - a warm glow and a small bag over its head. A respawn rebuilds the room, so the bundle is handed to the same placed foe by its XP key; an ambusher is waited for until the room is tripped again. When the carrier dies, goes harmless, leaves the board or falls off the world, the bundle drops there (falls to the floor).
  - NO FOE (pit, spikes, water, a trap): it lies where you died if that is footing, else on the last spot you stood still on for a fifth of a second, else at the shrine you woke at.
  - BOSS: a boss, a mini, or anything killing you during a boss fight never carries one; it lies at the arena door (`doorSpot`: the trigger column, first standing tile, out to ten columns back toward the shrine; a flight arena falls back to the shrine).
  - SECOND DEATH before recovering: the first bundle is gone (a line under the death says so).
  - BANK: touching any shrine (lit or not), boarding the carpet, or winning a wood banks everything carried ("BANKED" pop). A wood start banks too.
  - Recovering: touch it. The gold goes back into the wood's count (same start) or the purse (a later visit), XP back to the hero (a level-up can fire); it is carried again, still at risk.
  - Co-op: each hero has his own bundle and carry; neither can pick up the other's (the pair's XP rule is unchanged: XP is player one's).
  - Death screen: a line under the killer line ("DROPPED 6 GOLD AND 30 XP: SPRIG HAS IT" / "WHERE YOU FELL" / "AT THE ARENA DOOR"); the first two deaths also show a one-line hint.
- Save: `PROG.deathCost = {v, carried:{xp:{hero:n}, purse}, bundle, told}`. Written on every drop/pickup/bank; never holds a creature (the live parts are non-enumerable). progression.js migrates: an old save gets an empty cost, so everything it holds is banked.
- tools/death-cost.mjs (new, in check.mjs). tools/progression.mjs: one migration assertion.

## Bug found on the way
My first field name `p.carry` collided with the existing throw/carry system (`P.carry`), which slowed the hero 4 px/s and broke slopes-trace on 4 levels. Renamed `dcCarry`; slopes-trace identical again.

## The check (tools/death-cost.mjs)
Rules, migration (old v2 and v0 saves, hand-edited corrupt saves), round trip, every arena/mini door in all levels is standing room the reach fill reaches (wood/moor/oreroad doors sit beside shrines that checkpoint-stand already lists as reach-model gaps, so they are exempted by the same list), and in the page: drop is exactly the carry; foe carries, is drawn as a carrier, is handed to the new room's foe, killing it drops it, picking up restores everything; a harmless carrier lets go; boss role goes to the door; second death loses the first; shrine banks; co-op separate; save text holds a live bundle, loads back the same and a reload hands it back to its foe; old save loses nothing; pit and spike deaths leave it on footing the fill reaches; an ambusher's bundle waits for the ambush and attaches when it is tripped.
- Red on the base (0b84079, throwaway worktree): fails immediately (no migration, no BK.dc). Mutation proof on this tree: no-bank, keep-old-bundle, no-ambush-wait, boss-carries each turn it red.

## Reachability guarantee for a spot drop
It is always a place the hero stood still on (or died standing on), or the shrine he wakes at; it is re-checked for spikes / deadly water / world bottom on release and every half second (a flood), and moved to the safe footing then the shrine if bad. The pit and spike cases are asserted, and the pit spot is asserted reachable by the reach fill. Boss doors are asserted statically over every arena.

## Checks run
Green: death-cost, progression, progression-runtime, levelling, levelling-runtime, checkpoint-gaps, architecture, checkpoints, skins, dangling-paths, npc-removal, tells, comments, slopes-trace (after the rename), boss-fight-end, textfit, collectables, ambush-single (see final message for any not listed).

## UNVERIFIED
No bot pilot, no full suite. Not exercised in a page: real boss doors on a live boss fight, water/swim deaths, the mage-form deaths, carpet (flight) arenas (they fall back to the shrine, so dying there costs nothing to recover), the ferry/raft levels, Iron Knight. One capture only (foe carrying, death line) looked right.

## QUESTIONS FOR DANIEL (each built as recommended)
1. Dropped XP can de-level you (level follows XP; never below the level you had at the last shrine). Built: yes. Rec: keep - it is the cost. Alternative: floor at your current level.
2. A recovered bundle is carried again (unbanked until a shrine). Rec: keep.
3. A second death with NOTHING carried still destroys the old bundle (literal "die again = gone"). Rec: soften to "only a death that drops something replaces it" - a bundle lost to an empty death feels unfair. Built literal.
4. Leaving a wood (quit to map) banks what you carry; only death costs. Rec: keep.
5. Boss door: the bundle lies at the arena trigger, so it is picked up on the walk back in, before the fight. That makes a boss death nearly free. Rec: put it a few tiles before the door only if you want it costlier; built at the door as briefed.
6. One bundle per save slot (another hero's death replaces it; a bundle waits dormant while a different hero plays). Rec: keep.
7. Silver coins, keys and relics save instantly and are not part of the carry. Rec: keep.
8. Dying within a step of a shrine leaves the bundle inside pickup range at wake-up (free). Rec: accept.
