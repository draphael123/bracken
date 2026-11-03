# claude/smallfix10 (sonnet) - report (rides BATCH140 with herofeel)
Branch claude/smallfix10 off claude/herofeel (c1b3d074), worktree bracken-smallfix10, pushed. Not merged, not deployed.

## Changes
1. ANTI-KITE OPENING AUDIT (src/main.js, the boss dt line): the batch139 A11 fix was already in the herofeel base (windcaller howl in windingUp, fall skipped). Generalised: the anti-kite call now also skips whenever `GB.openOf(e) === true` (the OPEN_RULE table in src/boss-greed.js = every boss's authored opening). Same mechanism as the windcaller fix, one clause, so every boss's opening keeps the length the anti-kite clock would have cut (clock up to x1.45 after 5 s out of reach). New probe tools/kite-openings.mjs (KITE_FROM/KITE_TO split the level range; page memory crashes on a full sweep).
2. SIGNS (src/level.js, per-hero `warden:` line, other heroes unchanged): moor wind sign -> "WIND FROM AHEAD OVER THE POSTS. CROSS IN THE STILL, OR CROUCH BEHIND ONE." Gale harpy sign -> "A GALE HARPY BEATS HER WINGS: HIT HER AS SHE DRAWS THEM BACK, OR HOLD C AND LET GO." (hold C winds the javelin, release throws). tools/signs.mjs: both are 2 lines (its 18 failures are older signs, none of these).
3. hint-shown.mjs GREEN (exit 0, ran alone, PORT=8242): the 18 dead literals added to the MOVE_WORDS literal (ROCK BREAKS, AVALANCHE, KNOCKED UP, REELED, MARKED, CHAIN: FULL, STANDING ORDERS, THE SHIELD CHARGE, SHOVED, LONG GUARD, VOLLEY NEEDS 2 ARROWS, WARDEN'S REACH, GREAT ARROW, DRAW BROKEN ...). The number-suffixed ones ('GREAT ARROW x2.0', 'STEADY x1.4', 'FAR x1.3', 'CHAIN 3') are listed by stem ('GREAT ARROW x', 'CHAIN ') and number() now reads word + trailing number as that stem (new `moveWord` in main.js, used by both gates). Test untouched; silent-flavour baseline shrank by 4 rows (--write, ALMOST, MARKED, SHOVED, THE LAST CHARGE are now routed). These words now FLOAT in play for the first time (throttled by MOVE_WORD_GAP like the others).

## Audit table (boss | opening | designed s | measured s before | after)
Probe: boss put in the mode with its designed timer, hero 300 px away, kiteT held at 30 (clock at its x1.45 ceiling). "before" = fix clause removed, "after" = fix in.
| boss | opening mode | designed | before | after |
| chief (War Chieftain) | planted | 2.6 | 1.62 | 2.33 |
| herald | mired | 3.6 | 1.57 | 2.25 |
| captain | beach | 2.6 | 1.13 | 1.63 |
| reefmaw | beached | 2.0 | 1.27 | 1.27 (kite never touched it) |
| owl | crash / grounded | 2.2 / 2.8 | 2.22 / 2.82 | 2.22 / 2.82 (e.stagger already protects it) |
| windcaller | fallen | 4.6 (3.68 dial) | fixed in A11 | 3.68 (A11) |
Not measured (page crashed on RAM in the later level ranges; OWED, re-run `KITE_FROM=16 KITE_TO=24 ... ` etc. with RAM free): hornet queen / queen 'winded' 2.0, closedhelm cutRec/thrustRec 0.6, grabMiss 1.0, brandRec 1.0, grandmother opened/floated 3.2, hourglassking turn 0.6, prince buried, grubbag hot/drop. By the source (non-FROZEN mode, no e.open/stagger) all of these were cut by the kite clock before and are covered by the openOf clause now (each is an OPEN_RULE row). Openings that use e.open / e.stagger / broken / FROZEN modes (stun, stuck, reel, open, downed ...) were never touched.

Why "after" is still under "designed": the remaining 0.63-0.9x is the ACT GAP DIAL (bpGap), not the kite: it speeds a boss's idle clock by the act's gap factor and only skips windups, e.open/stagger/broken and FROZEN modes, so a mode-only opening is also run fast by it (master has the same: windcaller fall 4.6 -> 3.68). I left it alone (combat number): see QUESTIONS.

## Checks
- hint-shown.mjs: GREEN (alone, 2nd try; 1st try Page.navigate timeout under load).
- signs.mjs: my two signs 2 lines (node only).
- kite-openings.mjs: ran levels 0-16 only (table above); passes 16-72 crashed the page (RAM).
- textfit (talk scope): CRASHED twice (page crash, RAM) - OWED: `node tools/textfit.mjs talk` for the warden (signs are 2 lines at 46 chars/line per signs.mjs, so a fit risk is low).
- boss-openings.mjs / full suite: not run (OWED to the release gate).

## QUESTIONS (rec first)
1. The act gap dial (src/boss-pressure.js gapFactor) also shortens mode-only openings (chief planted 2.6 -> ~1.6 at the top, herald mired 3.6 -> ~2.3 before kite; windcaller fall 4.6 -> 3.68). Rec: pass `|| GB.openOf(e) === true` to bpGap's `winding` argument too so every opening keeps its designed length - BUT it lengthens windows on every late-act boss (an easier game), so run the 60-70% win-band re-tunes first. Not applied.
2. The other heroes' "HOLD C" texts: pyro hold C = fireball charge, ranger/others also differ from "BRACE" on those two signs. Rec: give pyro/ranger/geomancer/freebooter the same short per-hero variants (small sign pass).
3. reefmaw beached is not shortened by the kite clock at all (1.27 both) but is 1.27 of 2.0 - same dial question as 1.
