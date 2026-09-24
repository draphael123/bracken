# Lane geo2: THE GEOMANCER REWORK (branch `claude/geo2`)

Built on `origin/master` + `origin/claude/polish` (merge 072de41: master's SPEARHEAD kept in main.js; dressing.js keeps
master's bones on the Unburied Field plus polish's two practice-yard kits). All four items were approved by Daniel. There is
one commit per item, each was green on the keep-green subset before it was pushed, and docs/briefs/geomancer.md was updated
with each one (section "THE REWORK").

| item | sha | what |
|---|---|---|
| 1 HEAVY / UPHEAVAL | ab1688b | The charge sets the distance. A quick release is a spike at her front foot, so a foe touching her is hit. Holding walks the eruption point from 12 px out to 132 px (2x the old 66). The floor marker uses the same aim as the blow. The pillar shatters 0.42 s after it rises (a crack frame, then shards). |
| 2 SPRITE | 777bce4 | Slate-grey robe. Rune-carved stone plates on her shoulders. Standing-stone stave (kept). Pebbles and grit float round her while she casts. Only the palette and body rows changed, so frame counts and timing are unchanged. |
| 3 ROCK SHIELD | 1be7b15 | C held = shield. It takes 2 hits and shows a crack after the first. A red blow shatters it. A perfect block costs nothing. No wind cost and no passive refill. THE MEND (DOWN+C) is the only refill. The WALL branch is re-worded to the shield. |
| 4 BURROW | 5576fae | Her dodge now goes under the floor. It only travels through floor and never crosses a gap. She never comes up inside rock or a foe. X as she surfaces kicks the ROLLING STONE. It has its own sink, under and burst frames. |
| pictures | 1ac505e | The after-pictures are retaken with the shield, mend and burrow in them. |

## Before/after (committed)
- docs/geomancer/frames-before.png -> frames-after.png: every frame.
- docs/geomancer/look-before.png -> look-after.png: 5x beside the Pyromancer and the Knight, then in the first level
  standing, running, winding and with C held. Made by the new tools/geomancer-look.mjs, run as `before` or `after`.
- docs/geomancer/moves.png: regenerated. It now has cells for the shield, perfect block, crack, mend and burrow.

## Item 1: what the short pillar life costs
Nothing. No level has a Geomancer-only shortcut (the brief's "Open" question was never acted on), and no check stood on a
pillar. STONE STEP and ARCHWAY are separate pieces and keep their own lifetimes. BEDROCK no longer extends the pillar; its
text now says "every stone piece of hers but the pillar". Her yard's UPHEAVAL station held X to a full wind; it now holds
for the 60 px it needs. Her wind is now 0.5 s (the other heroes' is 0.32), and any release past the first beat fires.

## Item 3: the new WALL-passive wording (branch renamed WALL -> SHIELD, "THE SHIELD: WHAT IT TURNS BACK")
- STONEFACE: "a shield raised on the beat throws an arrow back the way it came"
- SHRAPNEL: "a shield that is broken or shattered bursts into shards that fly at the nearest foe"
- BULWARK: "a RED blow that shatters her shield finds her at half its force". It can no longer keep the shield whole,
  because the rule is that a red blow always breaks the shield.

## Where the old wall went: PARKED
No slot fits: the nine actives fill her ladder (levels 1-20, three per branch). `raiseWall` and `wallTakes` are kept whole
in src/geomancer.js but are no longer bound to C. tools/geomancer.mjs still holds them to THE CAP and to the grid rules; the
test now raises them directly. **Recommendation:** if Daniel wants it back, swap it in for LODESTONE (level 9, the least
distinct of her nine) rather than adding a tenth rung.

## Her lab numbers (tools/geomancer-pilots.mjs fight,boss; bots, 2 reps; a report, not tuning evidence)
Fight lab (wood). Columns are TTK s / defends; she took 0% damage and died 0 times in every row, before and after.

| foe | before | after items 1-4 |
|---|---|---|
| sprig | 5.47 / 133 | **1.38** / 75 |
| shield | 0.59 | 0.59 |
| swornsword | 0.64 | 0.69 |
| archer | 0.61 | 0.61 |
| hedgeknight | 7.07 / 106 | **4.34** / 83 |

The sprig and hedge-knight gains come mostly from item 1: she can now hit what is touching her.

Boss lab (120 s cap). All wins, before and after:

| boss | before (secs, taken/min) | after 1-3 | after 1-4 |
|---|---|---|---|
| queen | 22.8 s, 0 | 36.4 s, 40 | **49.5 s, 78** |
| king | 33.6 s, 0 | 33.6 s, 0 | 33.6 s, 0 |
| abbot | 72.1 s, 146 | 70.0 s, 30 | **59.0 s, 35** |

- **Guard effect:** the bot's shield is a tap on the beat. That is a perfect block, so it is free. Against the abbot this
  cut damage taken from 146/min to 30-35/min.
- **Queen:** she got slower and started taking damage. In boss fights the bot rolls, and that roll is now a burrow that
  stops at floor edges. The shield also breaks where the wall did not. Worth a human look.
- **Not SHIELDED:** she is still not in `SHIELDED` in lab.js, so boss fights never raise her shield. Parked question 3
  below covers this.

## Checks
The keep-green subset was run on every item. All were green on every run: geomancer, starter-kits, ability-poses,
attack-animation, combat-feel, render-layers, skill-menu, skill-passives, talents, levelling (+ levelling-runtime),
progression (+ progression-runtime), tells, textfit, boss-openings, arena-supplies, comments, syntax.

I also ran hero-trials (the polish lane's yard), pixels and homepaths; all green.

Every new assertion was proved RED on the old code first:
- **heavy:** the old code did 0 damage at contact, reached 64 px, and the pillar was still standing.
- **shield:** the old wall took a third yellow blow, and there was no shield state.
- **burrow:** the old roll fell 84 px into the pit, ended inside the foe, and kicked no stone.

The burrow stone test was first written with a timing bug (it pressed X in the dodge's own frame). I fixed it and re-proved
it red, then green.

The full `npm run check` was NOT run, as instructed. dangling-paths fails on 9 citations that were already failing before
this lane. None are mine: they are in docs/SECOND-PC.md and docs/INTEGRATOR.md, both from master.

## Parked questions (with recommendations)
1. **RAISE WALL back as a bought ability?** Swap it for LODESTONE; do not add a tenth rung.
2. **Should burrow cross one-way platforms and ledges it can walk off?** Right now it only moves over floor (solid or
   one-way). Walking on a ceiling or swimming, she still rolls. Recommendation: keep it this way.
3. **Should she be SHIELDED for the boss lab (hold C on tells like the Knight)?** It would probably fix the queen's
   numbers. But two hits make holding C risky, so a better bot rule is: tap on the beat, and mend between tells.
4. **Should arrows cost the shield a hit?** Today they do, unless STONEFACE throws them back. Watch archer-heavy rooms in
   play.
5. **The pillar's shatter is visual only.** Recommendation: leave it visual. If it should hurt foes, the SHRAPNEL-style
   shards are one line away, but they would add damage to every heavy.
6. **The hero-pick description now names the shield and the mend.** It does not mention burrow; I kept it short for the
   text-fit check.
