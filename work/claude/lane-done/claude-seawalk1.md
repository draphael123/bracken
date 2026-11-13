# claude/seawalk1 - Pirate Fleet + Freebooter, Causeway 2 + Kraken: browser walk, stills, boss tune (11-13, one headless browser at a time)

Branch `claude/seawalk1` = claude/whaleart 1fab58c87 + tune/tools. Worktree `LANES\bracken-seawalk1`. Pushed. NOT merged, NOT deployed, no flag flipped. Stills + logs: `scratch/lane-reports/seawalk1/` (pf-NN-xCOL.png 18, cw-NN-xCOL.png 31, fb-r0..r3.log/json, kr-r0.log/json).

## Tools added (not in the suite)
- `tools/seawalk-stills.mjs <level> [every] [tag]` - fresh level load per shot, hero on every Nth pacing waypoint, god mode, 640x360 buffer to PNG. Causeway 2: `BRACKEN_CW3=1 CW3=1`.
- `tools/seawalk-krprobe.mjs [hero] [seed]` - one Kraken fight with a 1.5 s position / hp / mode trace.
- `tools/cdp.mjs`: `BRACKEN_CW3=1` env hook (same pattern as BRACKEN_COL4): puts `window.BRACKEN_CW3=true` in every document of that page, so bossLab / boss-rates / level-walk can run Causeway 2 + the raft. Without it a lab run measures master's Kraken. Always set `CW3=1` too for the node half (pacing, level-quality).

## 1. Flag-off identity + loads (page)
No flag: L1 W=550, no cw3, no pirateFleet, 0 console errors. `?level=piratefleet`: W=440, pirateFleet, 0 errors. `?cw3=1` (title/L1): unchanged W=550, 0 errors. `?cw3=1&level=causeway`: W=980, cw3 on, 0 errors. Node tools green on this branch: pirate-fleet 136, causeway3 98 (flag off and CW3=1), kraken3 217, tide-kit 2022, pull-field 79, lethal-water, signs, level-quality gate.

## A. PIRATE FLEET
**Walk verdict: playable end to end, reads well, no softlock found.** level-walk (knight L26, 1 seed): reached the boss, 0 deaths, 94% of route walked, 4 kills, 5 hits (MISS vs the act target: deaths 0 < 2; measured only 2% of the route, so it mostly swims/waits).
Stills: pf-01 (wake, dusk fleet backdrop), pf-05 (swim + DOWN-arrow sign), pf-09 (watch is up), pf-15 (hulls), pf-18 (Freebooter arena, bar + "THE CHEAP SHOT: JUMP IT" tell).
Weak spots:
1. Two bot STUCKs at hull faces (route node 12, hero 62,32 vs hull top row 30 at col 63; node 44, hero 226,31, hull col 229): you board only by the swell lifting you; no rope/ladder fallback, a player who mistimes waits for the next swell. Bot resumed after its lift. Not a softlock (the swell repeats), but the dead-wait is long for a first-timer. Rec: one rope or a low crate per hull face on the TEACH hulls.
2. Difficulty: the walk is too easy (4 foes in 400 columns, 0 deaths, 5 hits). Foe density in swim stretches is thin (x 100-230 mostly water between hulls).
3. A sign banner ("THE WATCH IS UP") covers half the screen on every still taken right after a teleport (it stays on while the hero stays near the sign); on a real walk it fades, but it is a wide banner over the play field near the powder monkeys.
4. Several route waypoints sit in water (hero at y 33-36): the route swims between hulls; fine, but the checkpoint rows next to water are unmarked in the stills.
5. Not checked: swell phase tell colours, winch haul, gauge dial in motion (stills are static), co-op, mash bot, reach-heroes --page, pilot --write.

**Freebooter win rate (flasks ON = the kit default, L26, practiced, human profile, n=6 per hero):**

| round | change | knight | warden | pyro | overall | knight time |
|---|---|---|---|---|---|---|
| r0 | hp 8200 (as found) | 6/6 | 0/6 | 4/6 | 10/18 = 56% [34-75] | 98-157 s |
| r1 | hp 7000, reload 3.6->4.0, cuts dmg 11->9 | 6/6 | 0/6 | 6/6 | 12/18 = 67% | 57-157 s |
| r2 | hp 7600, guard .5->.7, flank .6->.8, ward .4->.5 | 6/6 | 0/6 | 6/6 | 12/18 = 67% | 79-126 s |
| r3 (SHIPPED) | hp 8400, reload 5.5, stuck 3.4 (+r1/r2 values) | 6/6 | 0/6 | 6/6 | 12/18 = 67% [44-84] | 92-126 s |

Final numbers in src/freebooter-boss.js: hp 8400, pistol reload 5.5 s, plunge stuck 3.4 s, cuts dmg 9, k = floor .4 / guard .7 / flank .8 / open 1.0 / stuck 1.25 / ward .5 (nothing under 0.4x, no invulnerable window). pirate-fleet node tool stays 136 ok.
**Verdict: overall 67% is in the band but it is two heroes at 100% and the warden at 0%. NOT "every hero can win".** The warden times out at 240 s with 9-59% of his bar left, landing ~80 hits in 240 s (openHits 0-1 per fight); her flotilla row (same bot) dies with 51-71% left, so this is the warden bot / warden damage against any duelist, not a Freebooter number. Lengthening the openings and softening guard multipliers did not move her. 3 tune rounds used; stopped as instructed.

## B. CAUSEWAY 2 + KRAKEN
**Walk verdict: loads clean, whole 980-column road reachable, art reads (lighthouse from screen one, storm, pavilion/shrine, submerged stretches).** level-walk (knight L30, `BRACKEN_CW3=1 CW3=1`): boss reached, 0 deaths, 98% walked, 16 kills, 8 hits, 4 STUCKs (all resumed): 245,23 / 316,11 / 440,27 / 704,20. Stills: cw-05 (x129 swim, tide gauge HUD), cw-17 (x508 pavilion + knight, lighthouse), cw-24 (x746 lighthouse over high water), cw-31 (x956 Kraken reach, underwater, RUN word).
Weak spots:
1. The submerged tunnel x 406-450, rows 27-38 (road above is solid rows 20-26): the bot fell to row 39 and its escape sub-route DROPPED 15 s six times in a row from 432,39 before the walker lifted it. A player is not stuck (the tunnel is open and swimmable), but I found no air room listed in that range (`L.airRooms` is empty there) - verify the breath budget by hand (~40 columns of swim) and that a fall to row 39 can climb out.
2. Column 404 rows 20-31 is a solid wall after the hero walks past the Tideguard at (399,20) (my stills tool could not teleport past it until the level was reloaded per shot). Looks like the elite's gate (by design: kill the Tideguard); not confirmed in play.
3. Route waypoints at x 129 and 746 are under high water (act II/III over the road), so the stills show swimming where the road should be; the walk is mostly swim on those stretches (intended: tides), but few dry-land beats.
4. Too easy for the knight (0 deaths, arrival 96% vs target 55%).
5. Not checked: bells/sluice/gun/lamp/collapse in motion, ferry, tolls, co-op, coop respawn, mash bot, pilot --write, the raft planks / ink / arms stills (the fight ran in the lab; I did not photograph the raft phase).

**Kraken win rate (flasks ON, L30, practiced, `BRACKEN_CW3=1`, --secs 300, n=6 per hero), raft phase confirmed in the trace (mode `k3` from ~70 s):**

| round | change | knight | warden | pyro | overall | time |
|---|---|---|---|---|---|---|
| r0 (no tune) | none | 5/6 | 1/6 | 6/6 | 12/18 = 67% [44-84] | wins 73-98 s |

In band at the first measure, so NO number changed (no tune rounds spent). Notes: wins are 73-98 s, under the 90-150 s target; the 5 warden losses are the lab bot, not the Kraken: warden s2/s3/s4 die in 16-27 s having thrown no attack at all (verbs {}); master (flag OFF) gives the IDENTICAL warden s2 row (death 15.9 s, taken 234), so it predates this branch. Resist floor is held by the kraken3 node tool (217 ok: face >= x0.4, no invulnerable window).

## Bugs
None fixed (nothing found that was a real softlock/broken route). Bot-only STUCKs listed above.

## Owed
Mash bots, pilot --write, reach-heroes --page, co-op on both levels, raft-phase and Kraken-face stills, moving-state stills (swell/tide phases), a human look at the two hull faces and the x406-450 tunnel. Warden bot against duelists (Q1). Kraken length (73-98 s).

## Questions (recs first)
1. Warden 0/6 on the Freebooter and 1/6 on the Kraken: REC treat it as a warden bot/damage lane across all the duelist bosses (flotilla warden also loses), do not hand-tune the Freebooter for her. Alt: keep tuning the Freebooter down until she wins (would put knight under 60 s).
2. Freebooter hp 8400 / reload 5.5 now committed on the branch. REC keep (knight 92-126 s, pyro 130-200 s, overall 67%). Alt: revert to 8200 and the old values.
3. Kraken fights are 73-98 s. REC leave (in band; lengthening risks the 5/6 knight). Alt: +15% raft phase hp for the 90 s floor.
4. TEACH hull faces: add a rope or step. REC yes, small, flag-gated.
