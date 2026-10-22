# codex/balance-report

Status: Success (read-only analysis). No balance/game change was built on this branch.
Source: BATCH112 5e44cddd; tooling SHA 840ee5adf66f8d92a7b41631ec1d59b5c04eae9f.
Receipt: https://github.com/draphael123/bracken/actions/runs/39806876460, six jobs passed.
All 216 fights and six validated receipts were read back. Last completion: 2026-10-22T15:50:08.071Z
(11:50:08 AM EDT). Raw results, hit logs and owned PIDs are retained in the run artifacts and locally
outside git in work/balance-cloud.

## Method and limits

Canonical boss-rates: --profile=human --flasks=kit --ways=practiced,built --seeds=24
--built-seeds=12 --jobs=1 --secs=240, normal health and campaign level. Each pair has 36 unique,
error-free samples. Actual starting flasks were verified: one at L3, two at L10/11. HITLOG and
BOSS_MODES enable existing telemetry. No src/ byte changed. A supplied flask is not proof that it
was safely drunk; drink counts and continuous time at zero stamina are Unknown in these raw results.

TYPICAL_SKILLS in src/bot-profile.js has empty arrays for Pirate, Berserker and Geomancer: their
built rows change the card, not an active-skill rotation. GEO_FELL=false in src/lab.js disables its
special ranged pine-priming plan. These rates describe the canonical hands, not an expert's ceiling.
The named hit is more precise than the boss mode at impact for delayed projectiles. DIED records
provide fatal causes and are not additional damaging blows. Fight secs and hit-log timestamps use
different clocks and must not be subtracted. Small samples are not exact population probabilities.

## Current results

Times are medians of canonical fight secs. Loss HP is boss HP remaining.

| Pair | Practiced wins | Built wins | Practiced win / loss time | Loss HP |
|---|---:|---:|---:|---:|
| Pyromancer / Windcaller, Moor L11 | 10/24 (42%) | 7/12 (58%) | 100.0 / 106.6 s | 37% |
| Pirate / Chieftain, Stockade L3 | 9/24 (38%) | 2/12 (17%) | 60.2 / 39.8 s | 38% |
| Berserker / Old Tusker, Wood L3 | 9/24 (38%) | 5/12 (42%) | 71.2 / 88.6 s | 25% |
| Geomancer / Old Tusker, Wood L3 | 0/24 | 0/12 | no win / 74.0 s | 30% |
| Geomancer / Windcaller, Moor L11 | 18/24 (75%) | 10/12 (83%) | 177.4 / 166.8 s | 12% |
| Geomancer / False Abbot, Spire L10 | 1/24 (4%) | 0/12 | 126.2 / 86.0 s | 41% |

The current Pyromancer result replaces the older 7/24 estimate for this source/fixture. Pirate's
built 2/12 is reproduced. No boss band, expectation, behavior, layout or hero number was altered.

## Pyromancer / Windcaller

Bolts and ledge pressure end the fight, rather than exhaustion. Of 14 practiced deaths, ten name
THE BOLT, three spikes and one THE CAST; four of five built deaths name THE BOLT. The cast-mode
bolt alone accounts for 1216 damage in practiced losing fights. None of their damaging-hit stamina
samples is below 26. She sees a median seven openings; the existing blade-parry/returnBolt path
already offers an answer and the logs contain reflections. Access is unreliable, not absent.
Practiced median anti-mash damage lost is 128, versus 24 built. Built winning time improves to
89.9 s with meteor/fireWall, yet five of twelve die before converting the remaining boss HP.
Opening count alone does not measure usable window duration.

Proposals (not built):
1. Re-measure after Task 3's first-opening-hit stale-multiplier correctness fix. Then validate a
   Pyro plan that prioritizes the existing told bolt return over beginning another cast. Keep the
   human reaction/greed profile unchanged and report strategy separately from baseline.
2. If player trials still show the gap, make a successful Pyro bolt return visibly cancel the next
   queued bolt through the existing fallen window. Preserve the authored window and damage; this
   is a proposed safe follow-through for a told answer, not a demonstrated fix.

## Pirate / Stockade Chieftain

He dies before he kills: practiced losses 39.8 s versus wins 60.2 s; built losses 52.3 s versus
wins 65.2 s. Practiced fatal causes: fire five, tower arrows five, sprig bites two, and one each
bash/slash/slam. Built: fire three, tower arrows three, sprigs two, bash/slash one each. Median
openings are only two practiced and one built. Just 3.5% / 5.3% of hurt stamina samples are below
26. The exposure is to the set-piece rather than a general stamina shortage.

stockade-hands.js already gives the room's answer: strike a rolling keg away; its blast takes
the tower lashings and opens IN THE WRECK. kegStep checks the melee attack box. The short cutlass
must approach the hazard while the pistol is the natural ranged answer. Per-seed tower/stat strings
are retained; a low opening count does not prove every death missed the same interaction.

Proposals (not built):
1. Route a pistol collision with the live Stockade keg into its existing lit-keg answer, sending
   it away from the shot's origin with the existing fuse/blast/tower rules and matching feedback.
2. Teach the Stockade plan to use that interaction and leave the fire before attacking the wreck.
   Measure bot and player results separately; do not lengthen the opening by default.

## Berserker / Old Tusker

Tusker's hide turns ground cuts to 0.4x; plunges land whole and a correctly felled pine pins him
for the rule opening (src/old-tusker.js). The 18 px reach axe hands record a median five practiced
/ six built openings, but committed swings leave little reserve for the next sweep/stomp/charge.
In losing fights 86.7% practiced / 89.4% built of damaging-hit stamina samples are below 26. This
is conditioned on being hurt, not time spent exhausted. Practiced fatal blows: stomp six, sweep
four, charge four, clod one; built stomp four and one each sweep/charge/clod. Sweep damage is the
largest named source (982 across practiced losses). Built losses last longer and leave 29% boss HP:
survivability alone can prolong the losing exchange. Empty built kits do not test every rage option.

Proposals (not built):
1. Validate axe hands that preserve the existing roll reserve during live tells and finish a pine/
   pinned punish before another speculative swing. Do not silently improve the human profile.
2. If player-facing help is needed, explicitly test the downward axe blow against Tusker's existing
   above/hide exception with matching told feedback. Verify the current plunge first; do not grant
   all ground axe hits a hide bypass or change HP.

## Geomancer's stamina wall

It is encounter-dependent: Wood 0/36 and Spire 1/36, but Moor 28/36. A blanket stamina buff would
strengthen a pair already above the boss band. Wood loses at 74-77 s with a quarter to a third of
Tusker's HP left. Hurt samples are below 26 stamina 69.1% practiced / 68.4% built. Stomps/sweeps
dominate fatalities; pines kill four of 36. Its special ranged-felling plan is disabled, so that
appealing route is not being measured as a complete strategy.

The shared budget is concrete: main.js heavyCost rounds the base 15 x2.2 to 33; Fault Line winds
0.5 s and puts its strongest spike at the full line tip. Felling consumes attack actions from that
same bar. Rune-Ward takes 0.1 s to rise, has a 0.07 s perfect beat, costs 20 on a held block and
drains 19/s after the beat, while rooting her (src/geomancer.js). A perfect ward is free and empowers
her but refunds no stamina. Regeneration is 90/s after a 0.3 s delay, paused by attacks/rolls/guard;
her busyRegen is zero. Exhaustion adds a 0.6 s delay and reduced recovery until 20% (src/commit.js).
High nominal regeneration cannot help if successive commitments keep resetting the pause.

Spire is broader than this wall: censer, fire, arrows and sprigs dominate. Only 7.5-8.4% of hurt
samples are below 26. Both ways have a median eight openings; stale lost damage is 286 practiced /
213 built. Evaluate add/hazard handling and Task 3's separate add-height/opening fixes before a
global buff. Moor is the control: she wards/reflects successfully, wins slowly (177.4 s median),
rarely takes a low-stamina hit, and loses mainly to HIS BLAST.

Proposals (not built):
1. Validate explicit safe ranged felling: prime a pine while Tusker is far away, keep ward reserve,
   release the fourth stroke only under him, avoid her own fall line. Same seeds; separate strategy
   from baseline rather than silently flipping GEO_FELL.
2. If player trials confirm resource lockout, test a small capped stamina return for a correctly
   timed perfect Rune-Ward or successful rule-opening hit. Reward a visible success while preserving
   held drain/heavy costs; re-check Moor to avoid a blanket buff. No return amount is implemented.

## QUESTIONS FOR DANIEL

- Approve strategy validation before balance edits? Recommend yes. Built 216 canonical read-only
  samples and this report; none of the proposed strategies or gameplay changes is implemented.
- Which player-facing prototype first? Recommend Pirate pistol-to-keg, reusing an existing room
  rule, then a Geomancer rewarded answer if live play confirms the wall. Both need your approval.
