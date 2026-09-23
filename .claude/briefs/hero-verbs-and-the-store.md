# HERO VERBS, THE WARDEN'S MISSING KIT, AND THE STORE (brief, Daniel 2026-09-22)

> "Are abilities satisfying and balanced? Do all heroes have at least 6-7? I'd also like to remove the passive abilities from the
> store, it doesn't really make sense. Do you think adding abilities that give new attacks by default would be a good idea?"

Three changes, in the order they should be built. PLANNING ONLY so far: nothing below is written.

## WHY (read off the code and this session's measurements, 2026-09-22)

**The store is a wall of percentages.** 168 nodes are sold; **134 of them are passive** (prices 60-360). Buying is shopping, not
choosing.

**The actives are a ladder, not a fork.** Every active costs exactly **3 points**, and five of the six heroes carry the same shape:
one at level 1, two at level 4, three at level 8. Nothing at 12 is active for anyone. The choice at each tier is "which of two
same-priced buttons", which is why none of them feel like a decision.

| hero | actives | levels | passives |
|---|---|---|---|
| knight | 6 | 1, 4, 4, 8, 8, 8 | 22 |
| pyro | 6 | 1, 4, 4, 8, 8, 8 | 23 |
| paladin | 6 | 1, 4, 4, 8, 8, 8 | 21 |
| Freebooter | 6 | 1, 4, 4, 8, 8, 8 | 23 |
| reaper | 7 | 1, 4, 4, 4, 8, 8, 8 | 21 |
| **warden** | **3** | **1, 4, 4** | 24 |

**The Warden is half a hero.** `skewer`, `setSpears`, `harrier`, and nothing at level 8 or 12 at all. It shows: her boss pilots this
session were the worst of the six every time - 0/4 then 2/4 against the Tide Reaver (`tools/tide-reaver-pilot.mjs`), 0/4 against the
Hedge Warden (`tools/hedge-warden-pilot.mjs`), while the knight and paladin went 4/4.

**The budget is the real constraint.** Points are `min(30, level)` (src/progression.js), so **30 is the ceiling**, and one hero's
whole tree already costs 67 (the knight's). A player buys about 45% of a tree. That gap is what makes a fork a fork - and it is also
why the answer to "how many new nodes" is four per hero and not six.

## 1. FOUR ATTACK-CHANGING NODES PER HERO ("VERB NODES"), 24 IN ALL

A verb node changes an attack the hero already throws. It is felt on every swing rather than every eight seconds, and it is what
this game already does best (the Freebooter's pistol as his heavy, the Warden's tip zone, the Reaper's ward). One per tier, so
every tier becomes **a button, or a change to what you already do**. 3 points each: all four costs 12 of 30, so a verb build is
affordable and skipping them is still a build.

RULES FOR EVERY NODE BELOW: it changes a DEFAULT attack, never adds a cooldown. It keeps the touch rule. It may not make a hero's
blow unblockable by default. It states one clear answer for the foe where that applies. It must show up in a measurement (reach,
damage, hit count, a new box, or a state), or it is a passive wearing a costume.

### THE KNIGHT (sword, shield, a run of three, pogo plunge, shield charge, RESOLVE)
- **lv1 SHIELD FIRST** - with the guard up, the run's first blow is a shield bash: half damage, staggers, and the run carries on
  from the second cut. Turns his opener into a way in against a guard.
- **lv4 HALF-SWORD** - the heavy becomes a short two-part thrust: reach 0.6x, but it goes through a guard (the guard family's key).
- **lv8 THE ANSWER** - after a parry, the next light is a riposte without the timing window: the parry teaches the cut.
- **lv12 THE WHEEL** - the run gains a FOURTH cut, a full circle that hits both sides and ends the run where it started.

### THE WARDEN (spear, the tip zone, the run-through, DEFLECT, VIGIL/phalanx)
- **lv1 BUTT-STROKE** - up close the haft stops being a shove and becomes a blow: it staggers, and it still sends them back out to
  the point. Fixes the zone she is worst in, which is the zone every boss stands in.
- **lv4 SET AND RECEIVE** - holding the guard as a charge comes plants the spear, spitting it without waiting for VIGIL.
- **lv8 TWO ENDS** - the up-thrust becomes a spin: the point up, the haft behind, so nothing flies over her or stands behind her.
- **lv12 THE LINE** - the run-through drags the whole skewered line back with her instead of leaving them where they stood.

### THE PYROMANCER (staff, ember tap, jet hold, HEAT, the pyre, fire stomp)
- **lv1 EMBER RUN** - every light leaves a live ember where it lands, which burns anything that walks through it for 2 s.
- **lv4 THE SWEEP** - the jet may be walked: it swings with her instead of holding one line.
- **lv8 BACKDRAFT STEP** - the dash-attack ignites what it passes rather than only what it ends on.
- **lv12 THE PYRE SPLITS** - the pyre spends the bar as three smaller fireballs on three lines instead of one great one.

### THE PALADIN (maul, the LIGHT bar, mend, aegis, judgement, hammerfall)
- **lv1 THE TOLL** - every third blow rings: a short stagger on everything within a body's width.
- **lv4 AEGIS FORWARD** - the aegis may be walked one step and ends in a shove that throws a guard wide.
- **lv8 HAMMERFALL CRACK** - the plunge leaves a pool of light for 3 s: standing in it, his blows fill the bar twice as fast.
- **lv12 JUDGEMENT DIVIDED** - judgement falls as two smaller strikes a beat apart, so it catches what stepped out of the first.

### THE FREEBOOTER (cutlass, a run of five, the pistol as his heavy, parry tap, hook hold, PLUNDER)
- **lv1 FAN THE HAMMER** - the pistol fires twice at half damage: two chances to break a guard, same ammunition.
- **lv4 THE HOOK CUT** - the hook's pull ends in a free light, so the hook becomes an opener instead of a repositioning tool.
- **lv8 POWDER AND STEEL** - the run's fifth blow reloads the pistol: the run and the gun become one loop.
- **lv12 BOTH BARRELS** - the heavy fires both: double damage, and it throws HIM backwards out of reach.

### THE DEATH KNIGHT (two-handed cleave, the planted fan, the BLOOD WARD, nova, grave burst)
- **lv1 THE DRAG** - the cleave's tip drags what it kills a step towards him (his harvest wants bodies close).
- **lv4 PLANTED WIDE** - holding the swing plants faster and the fan of bolts is half again as wide.
- **lv8 THE RETURN CUT** - a ward released as a blow lands answers with a cleave instead of a nova, for no blood.
- **lv12 THE REAPING** - the cleave becomes a full circle, slower, that pulls everything it kills to his feet.

## 2. THE WARDEN'S MISSING ACTIVES (three, so she matches the others: 6)
- **lv8 THE CAST** - she throws the spear on its line and it returns to her hand; she is haft-only until it does (the gap is the cost).
- **lv12 THE PIN** - drives a foe back to the nearest wall and holds it there for 2 s; the hold is the opening, for her or for an ally.
- **lv12 STAND YOUR GROUND** - plants a row of spears facing BOTH ways for 6 s, so a room she is surrounded in has two fronts.
Her pilots are the measurement: she must come out of the 0/4-2/4 hole and land inside the same 60-75% band as the rest.

## 3. THE STORE SELLS ABILITIES, NOT PERCENTAGES
- The store sells the **34 actives + the 24 verb nodes = 58 items** (plus heroes and relics as today).
- The **134 passives become level-up rewards, GRANTED AUTOMATICALLY at their tier** (Daniel, 2026-09-22: decided - no one-of-three
  picker, no second progression screen). Levelling reads as growth; the choosing lives in the store, where the abilities are.
- **MIGRATION MATTERS.** `PROG.skillOwned` and the loadouts carry bought passives, and progression.js already has a refund path
  (`refund = 25 * points`). The build must bump `PROGRESSION_VERSION`, refund coins for passives already bought, and leave every
  loadout valid - a save that loses a hero's kit is worse than the store it fixes.

## THE PROOFS A BUILD MUST PASS
1. `tools/skill-balance-probe.mjs` extended to the verb nodes: each must change a MEASURED property of the attack it names (reach,
   damage, hit count, a new box, or a state), and every node must still execute with a sane cooldown and stamina cost.
2. `BK.fightLab` for all six heroes, with and without each hero's four nodes, in an early, a middle and a late level (the method in
   docs/combat-tuning.md). No node may return the fodder to one-swing fights (the tuning just moved middle/late to 2.15 swings), and
   none may more than double a hero's damage per swing.
3. The boss pilots stay in the 60-75% band: `tools/hedge-warden-pilot.mjs`, `tools/tide-reaver-pilot.mjs`, `tools/gargoyle-pilot.mjs`.
   The WARDEN's own rows are the point of change - she must climb, and nobody else may drop out of the band.
4. `npm run check` on its own, green, including `skill-menu`, `skill-passives`, `skill-balance-probe`, `talents` and `progression*`.
5. A save from before the change must load with its coins refunded, its loadouts intact and no hero left without a kit.

## SIZE
Three sessions, in this order, each its own commit and suite:
1. **The Warden's three actives** (smallest, biggest gameplay win, and her pilots are the proof).
2. **The store change** (mostly progression/migration work, no new combat).
3. **The 24 verb nodes** (the big one; probably split knight/warden/pyro and paladin/pirate/reaper if it runs long).
