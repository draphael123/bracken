# Playtest notes — 2026-09-18

The original ignored brief was not included in the GitHub clone. Scope comes from Daniel's pasted handoff of 2026-09-19. The tracked implementation and verification record is docs/playtest-0919-raft.md.

## #5 / item 1 — RAFT RETURNS WHEN YOU FALL OFF ALIVE
DONE 67113df7961487852539799f3eb78e8967924b6b — check exit 0 — full Long Water swim-back/reboard/crossing and three raft respawn resets pass; enemy-populated human playthrough and multiplayer unverified.

## #7 + #14 / item 2 — FLASHING
DONE b55bea2 — check exit 0 — Stockade before/after pixels inspected; original screenshot location and human playthrough unverified.

## #9 / item 3 — HEAT
DONE d15e7a3 — check exit 0 — four common foes filled heat once; empty attacks gained zero; extended human balance and multiplayer unverified.
DONE item 4: persistent wide Queen view; decorative falling comb; six heroes kill; full check 0. Duration target tracked for item 13.
DONE item 5: per-level allowed kits; monastery terrace art and grounded arcade; seven support-loss regressions; full check 0.
DONE item 6: two Kingswood sections, cuttable stand, fixture holders and bridge-bank rule; full check 0. King lab Warden/Reaper reliability tracked for item 13.
7 DONE: readable background scenery, climb grip feedback, hanging town; full check 0.
8 IMPLEMENTED: Owl lamps and sprite; full check 0; duration balance remains item 13.
9 IMPLEMENTED: Roc belfry and reusable bell loop; full check 0; faster-hero duration remains item 13.
10: Gale Moor wind sections and summit attacks; 30 checks pass; duration balance remains item 13.
11: Three Stormhold watchtowers, payoffs and rope slides; 31 checks pass.
12: Sporewood root-knot/bounce loop, mycelium steps, no sleep or respawners; 32 checks pass.

13. COMBAT: committed swings, shared impact/finishers, fewer/deadlier garrisons, paid plunge chains; full check 0, pogo 36/36; boss duration and controlled plunge-share acceptance remain open.

14. ONE CAPTAIN: one named elite plus three minions at lock, captain death releases and survivors flee; 18/18 live mechanic tests, full check 0 (34); timing 92/108 opens and 36/108 within target remains partial.

15. PROGRESSION PLAN ONLY: design and versioned, backed-up, idempotent migration drafted; no progression/save code changed; Daniel review before implementation.
