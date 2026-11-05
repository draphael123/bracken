STATUS: DONE (not merged, not deployed). Branch claude/coopvert off claude/cooppr 2291a172, worktree bracken-cooppr. Browser: one Chrome at a time, 2.9-4.7 GB free each run.

## Vertical levels found (level data: routeOf climb/drop totals)
fallingtower (up 327), redgorge (237), spire (188 pure climb), skyroad (164/136), hornetsnest (106, the zigzag well), hanging, warcairn, underwell. tools/coop-vert.mjs walks each: P1 = playtest walker (lift past what it cannot do), AI behind.

## Cases reproduced (before)
1. Sky Road one-tile ledge: AI oscillated at the lip (goal flipped lip <-> landing at the 10 px line), never left the ledge; stuck clock ran to the told catch-up. Near-him share 45-48%.
2. Hornet's Nest well (zigzag one-way ledges, 4 tiles apart): AI tapped jump every 14 frames = 1-tile hops that never cleared the next ledge; it bounced under the ledge forever (0/5 s arrivals in the new proof case).
3. Mid-jump the route went to 'none' (no footing cell under a body in the air), so the walker fell back to pushing at his x and drifted OFF the ledge it had just cleared.
4. "Never in his way" shove (26 px to the side) walked it off a narrow ledge when he stood on top of it (spire).

## Fixes (src/main.js, allyRoute / allyRouteGoal / allyTick FIVE; ai-companion.js untouched)
- Commit at the lip for 1.5 s (keyed on the lip cell, not the landing which shifts as he moves): no jiggle.
- A climb's hop is HELD while rising (walker released the key), re-pressed at the ground.
- In the air on a committed hop it steers to the landing itself.
- Route keeps the last footing of both ends (self 1 s, leader 2.5 s when the cell is gone) and the last good route 0.67 s: no 'none' during every jump.
- The side-step shove checks for floor on that side, else the other side, else it stands.
- Catch-up (CATCH far 260 / stuck 3.5 s / 'off' picture leash) left as is: with real pathing it fires rarely; raising stuck was NOT needed. Teleport-only-when-off-screen: the party leash already is that ('off'/'stretch'), the AI's own 'far'/'stuck' remain the net.

## Checks (log: scratch\lane-reports\coopvert-checks.log; tools run directly, NOT check.mjs)
- tools/coop-proof.mjs (bleed, ping, xp, ai + NEW vert): GREEN. vert = 5 deterministic cases (hornetsnest climb + drop, skyroad hop up + drop, spire climb): the AI reaches him grounded within 28x30 px with no puff in 1.3-4.2 s. Before the fix the hornetsnest climb case: never (best 4 tiles).
- tools/coop-vert.mjs (NEW, walk measure, defaults near >= 50%, puffs beyond harness lifts <= 6): GREEN on all 8. After: hornetsnest 95% near (was 77-80), skyroad 57-91% (was 45-48), hanging 86, spire 65-89, warcairn 74-81, fallingtower 67 (3 AI deaths, 22 below samples), redgorge 61, underwell 90. The measure is noisy +-15 points run to run (P1 lifts differ), treat as a floor not a score.
- tools/ai-companion.mjs follow (Lumber Trail, balanced warden / support knight): 84% / 91% near, 10 catch-ups, 0 deaths (same as before). raft, fight, chain, linked: as before.
- tools/coop-progress.mjs: OK. tools/touch-ping.mjs: GREEN. tools/online-coop.mjs: OK on rerun (and on base); the first full sequence run crashed the page (memory, other lanes' Chromes) - not code.
- ai-companion.mjs 'pure': FAIL "the stuck clock runs while it does not close on him (3.3 s)" - src/ai-companion.js is unchanged by this lane, so pre-existing on cooppr (owner: whoever tuned CATCH.stuck 2.5 -> 3.5; the test still expects 3.3 s <= stuck). Rec: update the test to CATCH.stuck.
- A page crash on warcairn in a long multi-level coop-vert session and in coop-proof ai after bleed/ping/xp (memory). Runs one level per process pass.

## Shots
scratch\lane-reports\coopvert-well.png (AI on the floor of the Hornet's Nest well, P1 on the ledge above, before it climbs).

## Owed / not done
- fallingtower: AI died 3 times and trails (22 samples below him): falling hazards, drop-heavy; needs a drop-aware step (wait for a fall, do not follow into spikes) + the 'NO WAY UP / STUCK' cue strings still unverified in a live shot.
- Levers/ropes/chests/bells verbs (coopaudit item 3), foe above/below filter (|dy|>56), boss hazards: untouched.
- The measure moves P1 with lifts; a human-paced P1 run (or the second bot as P1) would be cleaner.

## Questions (rec built)
1. Keep CATCH.stuck 3.5 s? rec yes (built); the vertical fixes cut the stuck pulls (hornetsnest 'stuck' 2 -> 0).
2. Merge order: coopvert is on top of cooppr; merge both after the SAT 11-07 cut, then run online-coop in the gate.

## COOPVERT2 (11-05, branch claude/coopvert, not merged, not deployed)
Fixes (src/main.js unless noted; ai-companion.js untouched):
1. FALLING TOWER. Cause found with a DOWN ring buffer added to tools/coop-vert.mjs (HURT=1, TF0/TF1 still trace): the orrery pit is full of DEADLY poison pools (y 2436, x 336-384 / 448-480 / 544-768 / 832-864) under 4-tile pillars (cols 24-27, 30-33, 48-51, row 150) and failing floors. The AI went down there 1-3x per walk, never from debris/timing rooms: (a) a stone the graph has no footing for (failing floor) made the AI route from a STALE footing rows away, so it walked off the ledge; (b) drift in the air carried it past the ledge end; (c) it followed player one INTO a pool (the harness P1 is a god; a swimmer/knocked human can be there too).
   Fix: allyLanding(x,y,maxRows) + allyAirGuard (in the air it steers to where it will LAND at its speed, not under it; on the ground in a fight it will not step off a ledge it cannot land from; a jump at the lip is exempt); stale selfCell only used in the air; allySafeGoal refuses a goal inside a deadly pool he stands in.
   Numbers (coop-vert fallingtower, noisy): AI downs/deaths 3 -> 0-1 per walk (runs: 3,2,3,1,1,2 before; 1,0,0,1 after), near 47-58% -> 58-78% (final run 72%), 'below' samples 22 -> 5-17.
   Proof: coop-proof vert has two pit cases (gap between two pillars, pillar edge with P1 on the next pillar). HONEST NOTE: they are smoke tests - they pass with the guard disabled too (NOGUARD=1 env flips it; the AI usually clears these jumps), so the real regression signal is coop-vert fallingtower deaths.
2. ai-companion 'pure': RED ON BASE 2291a172 (test ran 200 frames = 3.33 s < CATCH.stuck 3.5 s). Test only; now loops (stuck + 0.5) s. Behaviour unchanged. GREEN.
3. CUES live (tools/coop-proof.mjs ai now shoots coopproof-aicue.png WAITS, -aicue-noway.png, -aicue-stuck.png in scratch\lane-reports): all three show over the AI's head and fit at 6 px, but green on a forest backdrop was hard to read. Now drawn on a dark plate, NO WAY UP / STUCK in amber (#ffd36b), WAITS stays the ally colour. Re-shot, reads clearly.
4. Lever / rope / chest while following: ropes - the walker takes NET itself (playtest.js), fine. Levers (a prop hit by the sword box of whoever swings) and chests/crates are only struck when the AI fights or hits them in a duel; it never walks to or pulls a lever, and never stands in the way (no body block - they are props). So: no block, no stuck. NOT done (owed, bigger): AI does not pull a lever / open a chest a person wants (a ping 'spot' on a lever + AI strikes it), foe |dy|>56 filter, boss hazards.
Checks (each run as its own process; sections together crash the page on memory): coop-proof bleed, ping, xp, ai, vert GREEN; ai-companion pure/board/save, raft, fight, linked, pausebd, reload GREEN; follow: balanced warden 74/91/79/80% (threshold 80, base 81 - noise, the P1 lifts differ), support knight 90/78/88/88, 0 deaths, no page error; coop-progress OK; online-coop OK (one run timed out on a busy machine, rerun on another port OK); touch-ping GREEN; coop-vert hornetsnest 81, skyroad 65, spire 90, redgorge 59, fallingtower 72 all GREEN.
RED, NOT THIS LANE: ai-companion 'chain' (map after the road stops: expects want.seats === 2, party of three) is red on base 2291a172 too - test expectation vs seat count; owner coop/party. Rec: make it want === roster.length - 1 after checking what tavern.want() holds.
Questions: (1) Should the AI follow a human into a deadly pool? Built: no (holds, the stuck puff pulls it). (2) ai-companion 'follow' threshold 0.8 flaps at 74-91; rec: 0.7 or n=2 runs.
