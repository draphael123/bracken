# codex/standingreds2

Status: Partial. Eleven target checks have strict three-pass evidence; Moor remains red. Not ready to merge.
Base: BATCH112 `5e44cddd`. Task 1/2 harness prerequisites are included; coordinator merges those first.
No master merge or deployment. No game balance number, level layout, tolerance, skip or exception-list change.

## Cause fixes

- Boss openings could begin after amFrame and carry the previous opening's stale multiplier into the first blow.
  The shared damage path observes the new opening before applying staleMul. Dune Worm's unchanged first-blow assertion passes.
- `97206a12f35597b23c5a120ba07f725216d56996` deliberately changed poise to the universal verb-based bar.
  Berserker now asserts the exact guarded-heavy formula 26*0.6+30*1.4=57.6; rule-openings sends real verb tags
  and independently resets mix-up state (guarded-heavy 15.6, open-cut 3, guarded-cut 0). No widened tolerance.
  The rend fixture isolates first light cuts from the separately tested natural fifth-cut finisher.
- Gargoyle's fixture now observes during its 20-frame strike, when the crash actually occurs, preserving every assertion.
- Bells: an unrelated cart killed the 22-HP alarm sentry for 30 damage before it could ring. Only the isolated alarm
  fixture parks those carts; production carts and all alarm/garrison/gate/reset checks remain.
- Small-adds: Abbot's special handler ignored the actual sweep/cut height band. It now checks that band before swinging.
  All 36 rows, seeds, fight lengths and miss thresholds remain. The tool closes its browser every three heroes.
- Talk layout: HUD is hidden while dialogue owns the foreground. Strict talk collision detection is unchanged.
  Stockade/Falling Tower/Fair: three local passes, each 318 screens and 1058 strings across all six heroes.
- Levelcards hide the clock while the card is displayed. The layout checker now uses one level per page and blocks
  unrelated recorded audio before initialization. All 48 campaign screens and original assertions remain.
  Three full runs take about 9.4 minutes each; this is containment of native memory growth, not a claim the whole leak is fixed.
- Width-specified Monastery piers were routed to the Church renderer by their shared kind. Correct dispatch removes
  Spire's 32 drawn-support findings without changing entity/tile/support data; Church piers are unchanged.

## Three consecutive standalone proofs

Run https://github.com/draphael123/bracken/actions/runs/39791214554 verifies Berserker, Dune Worm, bells,
rule-openings, strict visible supports, Reed Island, small-adds, talk, levelcard and mash-gate, three times each.
The run's old trace and curve failures remain visible. Its levelcard repetitions all completed.

Slopes calibration run https://github.com/draphael123/bracken/actions/runs/39820439479 at `2982b4bd`
verifies three strict passes, an intentionally failing one-character ledge-assist mutation (6 to 5), and a restored pass.
Receipt time: 2026-10-22T17:13:02.190Z. Controlled audio-off seed 1919, fresh clock/hero, separate actor/simulation dice.
All six original walk scripts, all lip depths and exact comparisons remain. The old mover also passes 400,000-case Node fuzz.
Keep/Welltown match historical `2cf3294b` exactly. Only intentionally changed rows were calibrated:
Wood rebuild `c16af026`/`3c30b273`/`7729bcd2`; Kings pursuit `bc14ff36`/`b497d195`;
Burial pressure `9fd45022`; Canal pressure `9fd45022` plus Fog Knight retune `53c5225f`.
Those proposed rows were imported at `f02d78e4`; no unexplained trace was re-stamped.

## Ore Road and Moor: current measured rows

The pilot previously depended on an unseeded stream. House seed 1919 is now reset by level/hero/run key before
EACH load, rather than depending on preceding levels or cosmetic boot calls. Original three runs, steps and bands remain.
Seeded measurement run https://github.com/draphael123/bracken/actions/runs/39793679713 completed successfully.
Only Ore Road/Moor curve rows were imported; all other parsed rows were verified unchanged.
Deliberate content changes: Ore Road squads `bc14ff36` and WORKS coordinates `1547a2c8`; Moor room/ledge/fall-clear `bd35f8a3`.

Ore Road hash `2cab5480c620`: 5 deaths / 217% average HP lost, within its unchanged band; mash row is current and passes.
Moor hash `c02b3f362c10`: **8 deaths / 438% average HP lost**, above act II's unchanged 6-death ceiling and 70-400% HP band.
The earlier unseeded result was 7 deaths / 400%; it is superseded by the controlled measurement, not silently counted as a pass.
Recorded deaths cluster at posts/spikes around columns 261-319, with enemy deaths at 346 and 476. Signs tell players to
brace/crouch on stones and hop in the still; the generic pilot has no explicit gust/brace policy. That observation is not
proof that either the level or pilot should be changed. No seed shopping or easier band was used.

## Outstanding

- Moor needs a cause-based decision and another unchanged strict proof before this task can be green.
- A full serial gate on THIS task branch remains outstanding. The separate Task 2 local checkpoint is not that evidence.
- Local gate resource pressure persists; neither the successful standalone cloud checks nor the trace calibration substitutes
  for the requested full serial completion. Task 3 is not DONE.

## QUESTIONS FOR DANIEL

- Moor: recommend coordinator review of the eight recorded deaths and the taught wind/brace answer before changing balance.
  Built deterministic measurement and retained the real red. Approve any intended layout/balance adjustment separately;
  current work makes none. A faithful pilot correction would first need evidence against the taught mechanic.
- Merge: recommend holding this branch until Moor and the full serial run are resolved. Built the minimal cause fixes and
  eleven strict three-pass proofs; this report is the reviewable handoff, not a green release claim.

## Continued Moor resolution (no game balance change)

Run https://github.com/draphael123/bracken/actions/runs/39850933226, source b2a1e081, completed
2026-10-22T20:44:17.889Z. Original seeded pilot reproduced 8 deaths / 438% HP, 120 forced lifts, 100% route.
The pilot now follows the existing sign: crouch while the told ground gust blows/whistles, hop in still air.
It uses ordinary inputs, keeps all enemies, no god mode, no abilities and the same bare knight/three runs/30000-step
cap. Waiting uses the pre-existing 900-frame controlled-hands allowance, not a larger global step budget.
All three repetitions are identical: **6 deaths / 318% HP**, 119 forced lifts, 100% route, within the unchanged band.
Thus neither route coverage shrank nor forced teleports increased. An isolated existing-stone control moves an
unbraced knight 67.25 px while ordinary crouch holds within 0.94 px; no game wind/geometry/health value was changed.
All other curve rows are unchanged. Moor's measured row is imported; curve-gate passes three times in that run.
No design decision or balance permission is needed for this correction. The remaining task requirement is its full
serial branch run. The measured Task 2 hero-art collection and cleanup receipt fixes are included for that proof.
