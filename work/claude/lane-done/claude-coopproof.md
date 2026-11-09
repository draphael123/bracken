STATUS: DONE - every owed co-op browser check ran and is green; 3 real bugs found and fixed; branch claude/cooppr ready to merge after the SAT 11-07 cut (not merged, not deployed).

# COOPPROOF - browser proof of coopai + cooppr (worktree bracken-cooppr, branch claude/cooppr, master 42a1d4cd merged in cleanly first)

## Checks (one browser at a time, >= 2.5 GB free each time)
| check | result |
| tools/ai-companion.mjs follow | PASS Lumber Trail: 83% near, 9-10 catch-ups (was 8-11), longest apart 3-4 s, ended 0.9-1.4 tiles from P1, 0 deaths |
| ai-companion.mjs fight, raft | PASS (405 dmg on Old Tusker, AI lifts P1 in 1.5 s; raft rides/not stranded) |
| ai-companion.mjs board,save,linked,pausebd,reload | PASS |
| ai-companion.mjs chain | 1 FAIL "on the map (after a card...)" - SAME FAIL ON MASTER 42a1d4cd (pre-existing, not co-op code; test/post-integ112 map state). Not touched. |
| tools/coop-progress.mjs (node) + xp-share, ai-route, ping, coop-unlock | PASS |
| tools/coop-flasks.mjs (2 and 3 seats, allyShrine path) | PASS |
| tools/online-coop.mjs | was RED on the branch (bug 1), PASS after the fix (guest slot pick, touch, pause banner, guest earns into his own slot, credit, rejoin, clear) |
| tools/touch.mjs | PASS |
| tools/textfit.mjs settings,party,hud --strict | 1 COLLIDE "controls [ranger]: HOLD DOWN (STILL), +C SNARE x HOLD D-DOWN" - IDENTICAL on master (pre-existing, ranger card text); the new PING card row/help line/rebind rows are clean. (Full textfit needs >480 s per scope run; only the co-op-relevant scopes ran.) |
| NEW tools/coop-proof.mjs bleed | PASS: down clock 20 s; at 19 s still down; P2 bled out with P1 standing = only P2 wakes (full hp, flasks refilled, 1 death counted, P1 not moved/sent back); both down = party wipe; lift at 18.5 s still saves him; bleed in a LOCKED Old Tusker fight = he wakes at the arena entry (x 8248 inside 8224..8752), bossActive still on, no wipe |
| coop-proof ping | PASS: Y with nothing ahead = floor spot; near a foe = foe mark that follows it (2 px); a seat's own press marks; one per seat; downed seat's press = HELP on himself; marks expire at 4 s |
| coop-proof ai | PASS: AI walks to a spot ping (5 px from it), fights a pinged foe (62 dmg) |
| coop-proof xp (new) | PASS after fix 3 (XP share: P2 hit + P1 kill pays P1; lent seat's kill folds into P1; AI kill pays P1) |
| NEW tools/touch-ping.mjs | PASS after fix 2: no PING pill solo; in a party it exists, in the safe area, overlaps nothing, outside the stick zone, both presets x both hands x sizes 0.7/1/1.4, with a notch, beside the ranger stance pill; a real touch on it marks |
| per-seat credit | node coop-progress/coop-unlock PASS + online-coop credit path PASS (guest earns into his own slot, no double credit, partial on a drop, rejoin, final on leave); XP share browser check above |
| not run | tools/check.mjs (forbidden); boss win-rate runs (not in brief); a live seat-on-own-save boss kill for bossDown (covered in node by coop-unlock) |

## Bugs found and fixed (each committed + pushed)
1. e24ecb19 merge, then "KEYS.ping default" - REGRESSION from cooppr: main.js KEYS table had no `ping`, applyBinds only refills existing keys, so `isKey(e, KEYS.ping)` threw `names.includes of undefined` on EVERY keydown - before the left/right/pause lines ran. Esc/pause and arrows were dead on keyboard in every mode. Node tests could not see it; tools/online-coop.mjs ("HOST PAUSED") did. Fix: ping: ['y','Y'] in KEYS.
2. SIMPLE touch column PING pill weight 0.58 -> 0.64 (src/touch.js): at touch size 1.4 it was 14.9 px, under the 15 px hit floor tools/touch.mjs enforces.
3. asPlayer(P1) nested inside a seat's pass left PROG.hero = the seat's hero, so when a lent/guest seat landed a kill the XP share paid player one's XP into the LENT hero's row (warden +10, knight +0) - i.e. also gave a saved hero levels it never earned. Fix: remember the host's hero while a seat's pass runs and restore it in the nested P1 pass (src/main.js asPlayer, seatHostHero).

## Added
tools/coop-proof.mjs (bleed, ping, xp, ai), tools/touch-ping.mjs; BK probe reads pings/coopDeaths/coopFell/asPlayer. Shots: scratch\lane-reports\coopproof-pings.png (P2 mark + foe), coopproof-downed.png (HELP mark + downed plate), coopproof-aicue.png (AI "WAITS" cue + ALLY tag).

## Tip / merge-readiness
Tip a6b90b23 on claude/cooppr (includes claude/coopai). Merge-ready: yes, after the SAT 11-07 cut. Bug 1 means the branch must NOT be merged without that fix (it is in). Run tools/online-coop.mjs in the gate again after the merge.

## Questions (rec built)
1. Ping keys stay Y / pad L3 (V and LB clash) pending Daniel - rec keep.
2. AI cue strings (WAITS / NO WAY UP / STUCK) verified for WAITS only; NO WAY UP/STUCK need a vertical level run (rec: later, with the lip-jump tuning). The vertical-level follow run for the route/lip logic (Hanging Village / Sky Road) was not run: only Lumber Trail (flat) was measured.
3. Pre-existing reds on master, rec leave to their owners: ai-companion chain (map state), textfit ranger controls COLLIDE.
