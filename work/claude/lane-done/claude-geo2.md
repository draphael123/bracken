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

## Where the old wall went: PARKED (superseded: STONE WALL at level 9, see FOLLOW-UP)
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

## FOLLOW-UP (Daniel's answers to the parked questions, 2026-09-24)

| # | answer | sha |
|---|---|---|
| 1 | The wall comes back as a bought ability, swapped for LODESTONE at level 9 | 3573d75 |
| 2 | Burrow stays floor-only; off the floor she dodges normally. It already did; now it is asserted | 31173cc |
| 3 | The boss bot taps her shield on the beat and mends between attacks | the commit that adds this section |
| 4 | Arrows use up a shield hit unless STONEFACE throws them back | kept as built |
| 5 | The pillar's shatter does not hurt foes | kept as built |

### 1. STONE WALL
- The new ability, `stoneWall`, takes LODESTONE's slot: SHIELD branch, row 2, level 9. It keeps LODESTONE's price (240)
  and cooldown (7 s), costs 18 wind, and works on the ground only.
- Its menu wording: "a wall of stone rises in front of her for four seconds: it stops a YELLOW blow and a shot, and one
  raised as the blow lands bounces their weapon off. a RED blow smashes through it".
- It has its own pose, `gWall` (three frames: the stave swung up, then the butt driven in).
- LODESTONE's code, draw, pose and catalog row are removed.
- **Save fix:** a save that bought LODESTONE would have been refused outright ("Invalid owned skill"). `renameSkills` in
  src/progression.js now runs before the save is checked and gives it STONE WALL in the same loadout slot.
- **Proved red first:** the bought ability raised no wall, and the old save still owned lodestone.

### 2. Burrow off the floor
tools/geomancer.mjs `dodges` now asserts:
- **Swimming:** her dodge is the ordinary swimming dash (it fires) and never burrows.
- **In the air:** nothing burrows. She has no air roll of her own, so she has no air dodge, the same as any hero without
  the talent.
- **On a ceiling** (magePlayer): the dodge is the ordinary roll. This one is checked in the source, not at runtime.

The behaviour was already correct, so I proved the check red by breaking the code on purpose: letting the burrow start in
water made the swimming assertion fail.

### 3. The boss bot and her shield (src/lab.js runbossLab)
- **Yellow tell within 50 px:** she taps C on the beat. That is a perfect block, which costs the shield nothing.
- **Red tell, or a blow from further off:** she rolls, as before. Tapping at every tell was worse at the Abbot (154/min
  against 105), because his area attacks come from further out; that is why the 50 px limit is there.
- **Cracked or broken shield, nothing winding up, boss more than 110 px away:** she mends (DOWN+C) and stands still until
  it finishes.

Boss lab, geomancer only, same pinned seeds, run with the same tool (work/claude/geo2/bosslab.mjs, not committed). "Before"
is the old bot on today's code:

| boss | before | after |
|---|---|---|
| king | win 33.6 s, 0 taken/min | win 33.6 s, 0 taken/min |
| abbot | win 79.3 s, 105/min, 1 blow thrown back | win **67.2 s, 91/min**, 2 thrown back |
| queen | win 35.1 s, 55/min | win 35.1 s, 55/min |

- **King and queen are unchanged:** the queen's hits come from her drones and red tells, and the king never touched her.
- **The shield never cracked** in any of the three fights, so the mend never ran here.
- **These numbers depend on run order.** Each fight's result changes with what ran before it on the page: the Abbot on his
  own gives old-bot timeout 120 s / 166 per min against new-bot win 85.8 s / 138 per min. So they do not line up with the
  earlier table, which ran the knight and the warden first.

### Checks for the follow-up (subset, all green in one run)
geomancer, starter-kits, ability-poses, attack-animation, combat-feel, render-layers, skill-menu, skill-passives,
skill-balance-probe, talents, levelling (+ levelling-runtime), progression (+ progression-runtime), tells, textfit,
boss-openings, arena-supplies, comments, syntax, hero-trials, pixels, homepaths.

Nothing needed a re-run. The full `npm run check` was not run.
