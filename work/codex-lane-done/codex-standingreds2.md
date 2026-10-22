# codex/standingreds2

Status: Partial - cause fixes are in progress. Not ready to merge; required 3x proofs and full serial gate remain incomplete.
Base: BATCH112 `5e44cddd`, refreshed from origin/master on 2026-10-22.
Dependencies: Task 1 and Task 2 checker/CI commits are included as prerequisites; merge those branches first.

## Current cause fixes

- New-opening stale penalty: amFrame runs before the enemy's state machine, so a state transition can open a boss
  later in that frame. A blow before the next enemy update could inherit the previous opening's stale multiplier.
  The shared damage path now observes the opening before applying staleMul. Damage values, stale pay and boss
  behaviour numbers are unchanged. The existing Dune Worm first-blow assertion is the regression proof.
- Berserker and poise fixture: commit `97206a12f35597b23c5a120ba07f725216d56996` deliberately replaced the old
  poise formula with the universal verb-based break bar. Berserker's guarded heavy is now exactly
  26*0.6 + 30*1.4 = 57.6, rather than the obsolete >=60 threshold. The fixture asserts that exact value. The
  rule-openings fixture now sends actual light/heavy blow tags, resets its mix-up chain between independent cases,
  and asserts exact guarded-heavy 15.6 / open-cut 3 / guarded-cut 0. This is an expectation migration tied to that
  deliberate game commit, not a tolerance relaxation.
- Gargoyle fixture sampled only AFTER its 20-frame strike. It missed the entire crash while seeing the subsequent
  stun. It now observes during the strike too. The original crash, caught, duration and miss assertions remain.
- Levelcard was omitted from textfit's load batching. Added one-level batches, preserving every campaign level,
  all screen assertions and report order. Layout pages now block recorded audio files before initialization: they
  still dismiss the sound banner, but do not decode 867 unrelated clips. The normal audio tests remain unchanged.
- Spire used width-specified masonry piers but the shared kind `pier` selected the Church renderer first. All 32
  failed spans reported that their drawn post never reached the deck. Dispatch now uses the existing Monastery
  renderer for width-specified piers; Church piers are unchanged. No tile, entity or support data changed.

## Before / after evidence

Clean BATCH112 checks with the checker safety prerequisites:

```text
dune-worm: first ledge-opening blow dealt 26, expected >=28 (x1.5 of 20)
rule-openings: gargIn crash=false / stunned=3.5 / caught=1; poise tap=0 heavy=0 inOpen=0
slopes-trace: wood frame count differs; kings/burial/canal frame differences; keep/welltown identical
visible-supports-strict: scree 0/56 findings; spire 32/129 findings
reed-island: PASS standalone (six rows opened)
curve-gate: moor and oreroad stale; mash-gate: oreroad stale
```

After first rule-openings fix:

```text
gargIn: crash=true, stunned=3.5, caught=1
poise: tap=0, heavy=15.6, inOpen=3
rule-openings: ok
```

Local artifacts are retained beside the worktrees in standingreds2-before and standingreds2-after-1.
The latter's Berserker/Dune Worm attempts are Unknown: unrelated memory pressure fell to 503 MB and 2 MB
free and the guard stopped only their own browsers. They are not counted as either passes or game failures.

## Validation and outstanding work

- Changed source/tool syntax, whitespace and exact 425-check inventory: passed.
- Rule-openings first standalone pass and Reed Island initial pass are verified; 3x proofs are pending.
- Cloud standalone proof runs each named check three times and stops at its first red, keeping logs, exact PIDs,
  source SHA and an occurrence-specific receipt. Talk proof is explicitly scoped to stockade/fallingtower/fair
  for all six talk heroes. Levelcard proof covers the full campaign.
- Pending: direct Dune Worm regression pass, remaining bells/small-adds cause fixes, text layout fixes,
  deliberate-change evidence/re-recording for stale mash/curve/trace rows, all 3x proofs, full serial gate.
- No assertion deletion, tolerance widening, new skip, master merge or deployment.

## QUESTIONS FOR DANIEL

- Poise migration: recommend keeping the exact formula assertions tied to `97206a12`; built that migration
  and actual tagged blows, with no game stat changes.
- Local memory: recommend recorded-PID safeguards and cloud proofs. No other Bracken runs were verified;
  the October 22 process inventory found no active Bracken test browser. Full local serial equivalence remains outstanding.

## Second cause-fix checkpoint

- Dialogue now owns the foreground while open: the HUD is hidden in talk state. This resolves overlapping
  Stockade combat prompts and the Falling Tower/Fair HUD digit that overlapped sign detection. The strict
  checker is unchanged. Local receipt `talk-fixed-proof/receipt.json`: three passes, 318 screens / 1058 strings
  each, all six heroes, no COVERS or COLLIDE findings.
- The level intro hides the clock during its name card; its counting is unchanged. Four-level layout batches
  still crossed the 1536 MB renderer limit on the second cloud repetition, so levelcard now closes the page
  after each level. All 48 campaign screens and assertions remain; the interrupted attempt is not a pass.
- Abbot's special lab add handler bypassed the generic small-foe height test. It now waits for the actual
  cut/sweep hit band before spending a swing. The original miss ledger and one-third threshold are unchanged.
  First local run passed (127186 ms); three consecutive passes remain to be verified.
- Bells fixture: a route cart hit the alarm sentry for 30 damage at about 0.516 seconds (22 HP), before it
  could ring. The controlled alarm fixture parks unrelated carts before simulation. All sentry, bell, gate,
  garrison, timeout and reset assertions remain, and production carts/placements/behaviour are unchanged.
  First local run passed; three consecutive passes remain to be verified.
- Cloud run https://github.com/draphael123/bracken/actions/runs/39785422615 proved three consecutive passes
  for Berserker, Dune Worm, rule-openings, Reed Island, and strict visible supports. Curve-gate exited zero
  three times but printed stale rows, so it does not satisfy the requested curve work yet.

These recommendations do not require a reply before safe independent work continues.
