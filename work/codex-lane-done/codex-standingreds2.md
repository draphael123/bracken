# codex/standingreds2

Status: Partial. Eleven earlier targets and Moor now have strict three-pass evidence. Full serial verification remains incomplete; not ready to merge.
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

## Ore Road and Moor: initial controlled measurements (Moor superseded below)

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

- Moor is resolved by the verified ordinary-input pilot correction below; no balance decision is required.
- A full serial gate on THIS task branch remains outstanding. The separate Task 2 local checkpoint is not that evidence.
- Local gate resource pressure persists; neither the successful standalone cloud checks nor the trace calibration substitutes
  for the requested full serial completion. Task 3 is not DONE.

## QUESTIONS FOR DANIEL

- No Moor decision is needed. Its real taught brace answer passes all three repetitions with unchanged bands.
- Merge: recommend holding this branch until the full serial run is resolved. Built the minimal cause fixes and
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


## Continued native-memory containment

The new local full gate remains on frozen Task 2 source 2a3175b1. Its same-source Linux audit (run39852095702)
retains 382 actual verdicts (364 PASS / 18 FAIL) and 43 unanswered memory interruptions; it is not equivalence proof.
The earlier standingreds serial snapshot cfa373f2 in run39852300871 was cancelled when superseded. Neither is relabelled as this newer source.

Raw Page.navigate discarded the old helper wrapper. Pre-document installation now keeps load/hero/fresh-reset collection
across navigation; the unforced leak control remains unwrapped. The actual raft-recall fixture passes at c6bc30ff:
5 rafts in 2 levels, peak renderer 1180 MB, run39854435726. Native bridge trace run39858523401 proves 256 identical
manual updates/random draws and 64 exact gameplay/pixel samples with collection; raw navigation and opt-out assertions pass.
A later trace attempt failed to launch its browser, not its state/pixel assertions; that failed occurrence is retained.

Collection alone did not contain the longest single-page labs: the protocol completed 33 native collections and the
boss lab still hit 1738 MB. Tighter JS heap and periodic collection experiments also failed and were not substituted
for passing gates. The protocol timer experiment was removed.

The boss lab now executes every original ordered case in bounded fresh browsers. At 7f52f020, run39859520715 passes all
27 cases and all 102 original Node assertion lines in 113656 ms, inside the original 300000 ms overall deadline;
peak renderer 1502 MB under the unchanged 1536 MB ceiling. The Cistern Queen is required at its canonical Underwell ID,
so finding it no longer builds the campaign twice and its case can no longer silently disappear. Two-case batches are
being verified for a larger memory margin. The levelling lab similarly covers all heroes/levels in fresh per-hero pages,
retaining all heal, passive, catch-up and text assertions and its original overall deadline; its full proof is pending.

Between completed manual evaluations, the harness can collect the native canvas heap. Real-time measurements,
mid-boot probes and gcLoads:false controls keep their original path. No simulation step, input or random draw is added.
The runner now waits for estimated renderer headroom before launch and saves an incomplete checkpoint if RAM stays low.
Admission bounds, the hard-killed-writer recovery, full 425-name inventory and gate-result failure-injection checks pass.
The original full-suite checkpoint is not modified to accept these source changes.

## Current continuation verification (2026-10-22)

The renderer recycle threshold is 1536 MB, applied after the current successful pooled check. It is
separate from the 2816 MB emergency ceiling for one check. The earlier implementation incorrectly
used the recycle threshold as a hard kill and prevented a legitimate all-campaign canvas audit.
The corrected default remains below 3 GB; admission requires 4352 MB free, including 1024 MB browser
overhead and the unchanged 512 MB reserve. A sustained shortfall saves an incomplete checkpoint.
No game assertions, tolerances, deadlines, simulation budgets, balance or quality settings changed.

Measured causes are retained native canvas allocations during synchronous lab evaluations, wrappers
lost on raw navigation, and repeated hero-art builds. The harness reinstalls opt-out-aware collection
before navigation, yields at existing forced-GC audit boundaries and uses fresh browsers for the
original ordered boss cases and per-hero levelling cases. All unforced growth controls remain unforced.

Verified immutable-source Actions receipts:
- 39860029941, source 63cd8719: all 27 boss cases / 102 assertion lines pass in 254736 ms
  inside the original 300000 ms deadline, renderer peak 1321 MB; levelling passes 4029 passive reads
  and 234 level-up cases in 639091 ms, peak 1400 MB, inside its original 1800000 ms deadline.
- 39860788572: native bridge preserves 256 exact updates/random draws and 64 state/pixel samples,
  raw navigation/reload and the explicit gcLoads:false opt-out; no extra simulation steps.
- 39864754648, source ae573a03: all 64 levels / 47769 returned sheets freed, zero held; both original
  growth limits pass. Injecting one held sheet produces the real assertion failure (exit 1), not an
  interruption. Peaks 2526/2554 MB calibrated the separate emergency margin.
- 39865884558, source 55b757c6: a 1 MB injected soft threshold keeps both successful verdicts
  and changes the browser PID before the second check. Memory/admission/kill-resume/fault tests pass.

The prior source 2a3175b1 Linux full gate retains 382 real verdicts (364 PASS, 18 FAIL) and 43
interruptions; missing-verdict summary rows are not game failures or completion. It is not current
equivalence proof. Earlier serial snapshots are preserved with their exact identities. Final full
serial and matching-source sharded runs are required; no incomplete run is described as green.

## QUESTIONS FOR DANIEL - current

None for these reversible harness corrections. Remaining combat reds stay visible; no balance change
is authorized or proposed as a way to make the gate pass.

## Stabilized continuation candidate

Moor and the eleven earlier target proofs remain valid: no game source changed during this continuation.
The complete copy-of-master CI at 7936d68f (39867091429) returned 422 actual verdicts: 407 PASS, 15 FAIL,
with unanswered mark-integrity, no-hidden-hits and textfit-full memory interruptions. No missing-verdict
row is treated as a game failure or a completed check.

The better verified native cleanup is retained. Mark-integrity completes every original fight without
skips (39870079601, 217915ms, renderer2804MB). Hidden-hit collection completes all64 levels and both
336-second tunnel runs (39869515850, 384729ms, renderer2730MB); its original visibility assertion exposes
a Canal bargeman haft at59.1,37 (zero qualifying pixels, maxRGBdelta57). That actual FAIL remains.
No visibility threshold, known-exception list, fight length, sample, balance value or time budget changed.

The shared-server lifetime race is fixed: a closing page releases only its lease; replacements wait
for a final owned server to exit. External servers are never killed. Real browser proof39871196174
verifies five pages, two peer-close/reload cases, simultaneous final closes and a successful new boot.

Layout pages collect at existing safe boundaries and between all original levelcard measurements,
with six levels per page. All48 title-card cases and strict analysis remain. The complete layout tool
still exceeds its original ten-minute gate deadline in39870370061; that is an actual timeout FAIL,
not a pass. Fresh-document/browser-cache reuse did not resolve the deadline (39872506004), so it is
not retained. Paint waits preserve256 updates/RNG draws and64 exact state/pixel samples (39872938100),
but do not give reliable memory headroom in the long audits, so that experiment is not retained either.

Final full-suite execution permits one source-bound resume only for unanswered checks. Saved assertion
FAILs are retained and never rerun to seek green. Both attempts share the original330-minute serial
budget (40minutes for each release-gate shard); the outer job deadline is unchanged. Interruptions
remain in the checkpoint and logs. A still-incomplete second attempt remains explicitly incomplete.

No balance or quality decision is required for these harness changes. Genuine remaining gameplay,
visibility and frame-budget failures are reported for coordinator review; no budget reduction is proposed.
