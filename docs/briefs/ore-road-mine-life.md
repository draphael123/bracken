# THE ORE ROAD — MINE LIFE

Daniel, 2026-09-25 (approved): *the mine level should feel like a working goblin mine.* Three asks, in this order:
**more ore**, **goblins actively mining**, and **mine theming**. This is the design; each section is one commit.

Nothing here changes the level's shape. Round three's geometry stays exactly as it is (the bigger platforms, the spike pit
with its turbines, recovery ledges and ladders, the bats, the bomb goblins) and **the Winchmaster's room is not touched** —
no prop, no worker and no ore is laid past column 475. His fight is piloted before and after to prove it (bossLab, dice
pinned, salted passes), and the INDEX is read before and after with `tools/curve.mjs`.

## The sentence (F8)

**THE ORE ROAD IS A WORKING MINE, AND YOU ARE THE INTERRUPTION.**

Said three ways (C4):
1. **You see the work.** Seams glinting in every rock face, heaps on the floors, carts full of ore on their rails, and goblins
   at it: picking, pushing, hauling, sorting, cranking.
2. **You hear the work** before you see it: the tink of a pick on rock, a cart's wheels on the rail, the ratchet of a winch.
3. **You watch it stop.** A goblin who sees you drops what he is doing — the sack hits the floor, the cart stands where it was,
   the winch runs back and its cage bangs down — shouts, and comes for you.

The cableway (the buckets, the brake, the tip, the pit) is still the level's rule. This does not replace it; it is the
place the rule happens in.

## 1. MORE ORE

- **Seams in the rock faces.** Every face of rock the route shows — the yard's ground under the floor, the crusher's walls, the
  sorting tower's rock, the chute's foot, the wreck's head, the brakeman's pillar, the winch house's cliff — carries ore in it:
  drawn onto the rock tiles, never onto a tile a hero can stand in. **Varied, not one stamp:** four ores (copper-green,
  iron-rust, gold, violet gem), four seam shapes (a streak, a cluster, a fleck run, a fat nugget), chosen by a hash of the tile,
  never by the dice (the Winchmaster's pilot pins its dice, and a draw that rolls them would change his fight).
- **Glints**: a few flecks in each seam catch the light on their own slow clock; gem seams glow.
- **Ore heaps** on the floors (three sizes, the four ores), **carts full of ore** parked on short rails, **ore spilled** from the
  bucket stations.
- **Readable at 1x**: a seam is 3–6 bright pixels on dark rock, never a one-pixel speckle.
- **Never over a hazard or a tell.** No heap, cart or pile stands on a spike, on the crusher, over a pit, under a rockfall's
  column (its ring lands there), under a tippler's stream, on a rope or ladder, on a checkpoint or a sign, or in the ambush room.
  **Checked** (`tools/ore-road.mjs`): every prop against every one of those, and every heap and cart on footing (B2).

## 2. GOBLINS ACTIVELY MINING

The miner already works the veins while no hero is near (round three). Four more loops join it, on goblins already in the
level — **no creature is added**, so the INDEX and the density do not move; the level's own three (tippler, sheargob, gaffer),
the elite and the ambush crowd never work.

| loop | who | what it looks and sounds like |
|---|---|---|
| **PICK** | miners | at a seam: the pick up and down, chips flying, a *tink* on every blow; six blows and he carries the ore to a station (existing) |
| **CART** | rock goblins | pushing an ore cart along its rail to the end, tipping it (ore tumbles), and pushing it back empty; wheels rumble |
| **SACK** | sappers, sprigs | hauling a sack from a heap to a cart and back, bent under it; a thud as it is dropped |
| **SORT** | javelins | at a sorting table, picking ore off the pile and flicking it into the bins at each end |
| **WINCH** | heavies | cranking a winch; the rope runs up to a hoist and a lift cage rises and falls; the ratchet clicks |

**THE ALERT, AND THE RULE THAT MAKES IT FAIR.** A working goblin is not fighting, and **nothing about a working goblin may hurt
you before its alert.** While it works, its own update does not run at all — the loop owns it — so no swing, throw, bomb or
bite can start. The cart, the sack, the table and the cage are drawn things, not movers: none of them can hit anyone.
It notices you:
- **by sight**, ahead of it, within 150 px and 60 px up or down (the same distance every goblin notices you in `temper`);
- **by ear**, behind it, within 56 px — so you can creep up on a goblin with his back to you, and that is a reward, not a trick;
- **when struck**, and **when a goblin at work within 110 px calls the alert** (they shout to each other).

The alert is told: the goblin drops the work (visibly — sack, stalled cart, cage), jumps with the startled mark every goblin
uses, shouts **OI** (narration, not a guard mark: no `!`), and plays its notice sound; then a **0.6 s startle** in which it
still does nothing, and only then does it fight, from its own update, with its own tells and marks. It never goes back to work.
A sapper struck dead before its alert drops no bomb: his bomb was never lit.

**Checked** (`tools/ore-work.mjs`, a page check in the suite):
- **A working goblin never deals damage before its alert.** Every worker, the hero stood in front of it and behind it, near and
  at a throw's reach, with every other creature gone: every blow the hero takes is logged, and each must come from a goblin
  whose alert has played out.
- **Every work loop returns to fighting when it sees the hero.** Each loop kind, walked into from ahead: it alerts, its work is
  dropped, and after the startle it is fighting (its own mode, facing the hero).
- **They work.** Left alone for ten seconds, every loop moves: the cart travels, the sack goes back and forth, the cage rises.

## 3. MINE THEMING

Distinct places along the route, each with a landmark you would give as a meeting place (F2). In route order:

| place | columns | landmark and dressing |
|---|---|---|
| THE ORE YARD | 0–50 | **THE CRUSHER** (existing) with its feed rail: a cart on it, pushed to the crusher's lip and tipped; spoil heap, ore heaps, timber shoring |
| THE LOADING HOUSE | 51–67 | **THE TOOL RACK** under its roof, sacks stacked, a hanging lantern, the tally board by the door |
| THE FIRST SPAN | 68–135 | the pylons (existing) — lookouts, not workers |
| THE SORTING TOWER | 136–203 | **THE LIFT CAGE** on the tower's hoist arm, worked from a winch; **sorting tables** and bins on the yard floor, ore chutes down the tower face |
| THE TIPPLE HOUSE | 228–240 | an ore heap and spilled skip on the stage |
| THE COLLAPSED SPAN | 272–339 | overturned carts and a broken rail in the wreck, timber down everywhere |
| THE BRAKEMAN'S HUT | 340–352 | the brake winch and its lantern |
| THE WINCH HOUSE | 408–445 | **THE MINE OFFICE**: a shed with a desk and a **TALLY BOARD** of chalk strokes; tool racks, a rail yard with carts |
| THE DRUM YARD | 446–475 | spoil heaps and full carts waiting for the drum; the last loading house |

Plus, all along: **timber props and shoring** (posts and caps against the ceiling, braces on the rock), **hanging lanterns**
on chains from the timbers (lights, in the level's dark), and **rails** wherever a cart stands.

Everything is drawn behind the play, stands on footing or hangs from timber (B2, B9), and is kept off hazards and tells by the
same check as the ore. None of it is solid and none of it moves the route, the checkpoints or the kill zones.

## What is not decided here

- The Winchmaster's own open questions (the review's "0.5x except while jammed") stay open — this brief does not touch him.
- The music is still the integrator's.
