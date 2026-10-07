# claude/walker - THE CAMPAIGN-LEVEL LEVEL WALKER

Brief: scratch/brief-levelsweep.md (difficulty v2: "WALKER FIRST") and scratch/audit-healing.md sec.2 (levels were tuned by a level-0 pilot
that lifts past what it cannot work). Base master b4300130.

## BUILT
- `tools/level-walk.mjs` - plays a whole level as a player arriving there:
  - hero at the level's CAMPAIGN LEVEL (tools/boss-level.mjs campaignLevel) with a TYPICAL BUILD: `src/bot-profile.js typicalWalkCard`
    (typicalCard + the L5-20 small perks RICH TONIC / his own / GRIT / MENDING + his own perk at L30; typicalCard itself unchanged for the
    boss rates), his best damaging skills in the slots his level has (TYPICAL_SKILLS, as boss-rates 'built'), the smith's gear of every wood
    beaten before it (BK.UPGRADES `needs` on the gate chain, basics from depth 2), tonics 1/3/5 by depth, HEART CHARM from depth 4, 60 gold a depth.
  - the human profile's EYES on every level foe, as a FIRST RUN (`human+first`): `src/lab-perceive.js makePerception` now takes boss = null
    (greed = a hit on any tracked foe). With a boss nothing changes (same dice, same order; stockade knight s1 boss row identical before/after);
    the legacy bot never calls it, so it is byte-identical.
  - hands: the play bot (makeBot) plus a player's additions - aim along the route's floor, the jump up to the next route node from its take-off,
    ropes/vines, steering a fall onto a lily pad, swimming to the route's depth, a locked room is a fight (hunt, never across a deadly pit),
    the level's machines (crank, sluice, lever...) and the ferryman's toll, fresh hands after deep water hands him back.
  - ONE DRINK HOOK (`drinkJs`): under 35% hp with a flask/tonic held -> `BK.drinkFlask()` if the game has it, else `BK.press(BK.flaskKey)`;
    today the tonic auto-drinks (main.js) and the hook leaves it. Drinks counted by the held count (`BK.flasks()` or PROG.flasks/tonics).
  - NO LIFTS inside a section: a node not passed in --stuck frames = STUCK, reported (spot, foes, props) and the section is not measured; he
    restarts at the next shrine as a respawn would (--strict: stop instead). Deaths are the game's own (checkpoint, death cost). Ends at a
    mini's door or the boss arena (both are boss-rates rows).
  - output per run: deaths (+ killer, hazard split), hp% on arrival at each shrine (frame before the touch), per section hp lost / healing
    used (drinks + small heals) / deaths / hits / kills / time, kills, time, stuck spots, % of the route measured; a summary table vs the targets.
- `tools/level-walk-selftest.mjs` in the check list (`level-walk-selftest`): one 1500-frame marsh walk, asserts the hero/kit/eyes/fields; ~25 s.
- Baseline: scratch/walker-baseline.md (+ .json/.log).

## BASELINE (6 levels x knight/warden/pyro x 2 seeds)
From act 2 on no foe kills the campaign-level hero (0 foe deaths in 24 runs) and he reaches shrines at a median 92-100% hp; caravan costs 0-6%
a section. Deaths come only from the marsh's locked elite room (bot can't duel it) and hazards (crown fire scaffold, glass cracks). Coverage
0-98% of a route (causeway best). Pilot rec: MARSH (level 2) + CAUSEWAY (mid-game, best measured; caravan as the fallback).

## CHECKS RUN
level-walk-selftest ok; boss-read ok; boss-rates stockade knight s1 (human) identical before/after the perception change. Full suite not run
(shared PC). Nothing red known.

## QUESTIONS FOR DANIEL
1. STUCK = restart at the next shrine (section not measured) vs stop the run (--strict). Rec + built: restart (default) - with stop-only the
   bot measured 0-13% of most levels; the stuck section itself is never lifted through or counted.
2. The walk ends at a MINI's door (like the boss arena); minis stay measured by boss-rates `level:mini`. Rec + built: yes.
3. Kit a player carries (tonics 1/3/5 by depth, HEART CHARM from depth 4, gear by beaten gates, 60 gold a depth). Rec + built: as listed.
4. First-run eyes (`human+first`) as the level standard (the boss standard is practiced). Rec + built: yes, the target says "first run".
5. Judge the 1-2 deaths target on FOE deaths + arrival hp while the hands are weaker than a player at hazards/elites (hazard deaths shown
   apart). Rec: yes, until the hands improve.
6. SURVIVAL lane: expose `BK.drinkFlask()` (drink one, if held) and `BK.flasks()` (held count) - or set `BK.flaskKey` to the press name -
   and the walker drinks manual flasks with no change here. Rec: yes.
7. A follow-up HANDS lane for the walker (doors between floors, lifts/carts boarding, jump arcs over fire, a mini fight via the lab's hands) to
   lift coverage from ~37% toward 80%+. Rec: yes, Opus (it is bot-navigation work), after the 2-level pilot starts.
