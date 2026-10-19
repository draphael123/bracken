# claude/marsh2 - MARSH WOOD targeted fixes + THE BULLFROG KING rework (opus)

Base: claude/batch104 f95390f0. Briefs: brief-first2.md 2 (incl. !! lines), brief-thinbosses.md FROG KING + !! 10-14 LATE, review-first2.md, audit-polish-1018.md,
review-rootway-recipe-1014.md, design-standard.md, foepass report. PORT 8769 (8770 for one base-tree walker), one headless Chrome at a time, only my own PIDs.

## WHAT LANDED

### THE BULLFROG KING (src/frog-king.js numbers + court state + bot plan; machine in main.js updateFrog)
- 180 -> **740 hp**, three phases: THE COURT (100-75%), HIS POND (75-50%: one great croak makes the court pond DEEP - its lily pads sink under you,
  the level's rule), THE PIT (50-0%: he pulls the plug - kept from claude/firsthour, still at half).
- New told moves, each its own windup + release pose (src/redraw/frogking.js frames 7-17, FROG_FRAME), each with its answer:
  - **TONGUE GRAB** (tongueTell, yellow !): a shield bites his tongue (DAZED); taken, it REELS you to his mouth over the water (P.frogReel) - in his deep
    pond it lets go over the water and you swim out (the deep-water drain).
  - **BELLY-FLOP SHOCKWAVE** (flopTell, red !!): rears up, comes down flat - an unblockable shockwave runs the court both ways (jump it); in his pond it
    sends every pad under.
  - **FLY SWARM** (swarmTell, quiet - the flies strike nobody) + **snapTell** (yellow !): the flies trail you half a second behind; his tongue snaps at
    them. Lead them onto his head and he BITES HIMSELF (DAZED 2.6 s).
  - **CROAK RIPPLE** (rippleTell, red !!): a ring along the bank (jump it) that TIPS every pad it crosses (gold rim, 1.4 s); a tipped pad throws you
    up and over to him - come down on him and he is KNOCKED FLAT (FROM ABOVE, open).
  - **SLAP / SINKING LILY PADS** (poundTell, red !!): every court pad goes under at once - be off them.
- Kept: the 0.5x HIDE outside openings (B15 floor), the leap-left-late flop, choke on the shield, the throat (now x1.5), the mud. Openings capped at
  7.5% of him each, counted as the blows land (a flurry inside a hit-stop ran past the old per-frame cap); his leap now hangs (700 px/s/s) and only his
  body coming DOWN hurts (it hit at take-off), the hop's gather and the rear-up never touch. Hopper adds cut (1 in his court, 2 in his pond).
- Bot hands: src/frog-king.js frogPlan + a frog branch in src/lab.js (leave the leap the right way, jump waves, swim out of his pond, lead the flies,
  ride a tipped pad, sweep hoppers, the pyro's EMBER WARD on his yellow blows, step-ups hopped).
- Every new line is routed (src/hint-lines.js) - tell narration duplicating the marks was deleted.

### MARSH WOOD (src/marsh2.js, applied to the built level in final columns; level id/needs/start unchanged - the Wood->Marsh ferry still lands at col 3)
- **THE SLUICE HOUSE - the channel's third use, and the one REQUIRED drain** (rec: the village sluice -> mud route). The drowned village is two basins
  with a timber dam (347-349). The far basin's boards rotted away: climb the sluice-house ladder (col 349), break the gate (347,10, three blows), the
  far basin (350-369) drains to a mud bed (row 24) - a gar, an eel and a hopper come up in it, the roof archer shoots into it - and a stair of boards
  climbs out to the checkpoint plank. L.routeVia sends the route up to the gate and down through the mud. Ferry (pay/drain) and grove (raft/drain) stay
  choices. The court's silver moved to the miller's loft over the gate deck (2nd secret off-route).
- **Rule line**: 'PADS SINK. THE CHANNEL IS DEEP: PAY THE FERRYMAN OR DRAIN IT.'
- **Signs**: the spitter sign off the archers' tile (58 -> 85; an explicit spitter at 91 so it always has its spitter); a sluice-house sign at 346.
- **Guides** (src/stuck-spots.js): the ferry spot glints the FERRYMAN, his CRANK and the SLUICE together with one nudge ('FERRYMAN: TEN GOLD. CRANK:
  CALLS HIS RAFT. OR BREAK THE SLUICE'), off while you ride; the sluice house ladder -> gate chain; the boards out of the mud; grove kept.
- **Stilts (bands)**: a landing jetty at the start bank, a lookout up a rope ladder over the archers' stilts, the shallows boardwalk with a rope rail
  (the sign always said KEEP TO THE PLANKS), heron hides by the gar hole, high boards over both halves of the long river, a hut walk on the reed island
  and the grove bank. Foe-free (calm) so the road's fights stay the road's.
- **Supports**: src/forest-supports.js 'marsh' kit - bog-oak stilts under boards, reed bundles under tufts (into the water where there is no bed);
  drawn in src/forest-supports-art.js. solid-islands allowance marsh 14 -> **0**.
- **Foes**: garrison row re-weighted (archer 3->1, spit 4->2, thorn 3->2, turtle/heron +1): ranged 20/68 = 29%; roles heavy/melee/ranged; the BOG
  order knight (oathblade) already held col 98 (its gate still can't be walked round - elites ok). Checkpoint 369 dropped (CHECK_DROP; the pinned grove
  dock 391 closes the sluice house): 4 shrines, 110 route tiles each.

## CHECKS
GREEN: **marsh2-beats** (new, registered in tools/check.mjs; RED on base f95390f0 - 22 fails, run in a throwaway worktree), **level-quality marsh CLEARS
THE BAR** (was 4 FAILs: bands 5 bands / 40%, mechanics pad x4 sluice x3 ropes x3, secrets 2, checks 110/shrine), **solid-islands** (marsh 0), marsh-exam,
rafts, raft-call, reed-island, elites, spawns, one-new-foe, signs, stuck (static all; runtime: only sk-pit - RED ON BASE too, stockade), checkpoint-gaps,
dangling-paths, level-reach, hint-shown, tells (MARK rewritten by --write), answer-tags, attack-tokens, untold-told, firsthour, boss-fight-end (64/64),
normal-health (marsh/paladin L1 wins 141 s), foe-pass, textfit levelcard (0 problems), mash-gate, curve-gate, lethal-water static (LISTED marsh 9 -> 10:
the far basin).
REPORT: visible-supports marsh 16 of 29 overhangs unverified (report-only - the art lane draws them).
RED NOT MINE: blow-tags (SKD.towerTake / FOA.shellTake - same on base), stuck runtime sk-pit (same on base).
NOT RUN: boss-openings (no frog row in it; it boots ~25 bosses - left to the suite), the full suite.

## ROWS RE-STAMPED (with reasons)
- docs/mash-bot.json marsh: LEVEL (knight/warden/pyro all die, 8-11 deaths) THEN BOSS 0/6 (boss left 94-100%) - the level hash moved (sluice house,
  stilts) and the King was reworked. (Boss hp went 760 -> 740 after the stamp; the mash boss left him at 94-100%, hp is not in the hash.)
- docs/level1-pilot.json + docs/level1-curve.json marsh: L1 knight 20 hits / 0 deaths / 102% hp a run (band 40-250, was 129%/1).

## NUMBERS
- **Frog King, human profile, campaign L3, 12 seeds, flasks=kit: knight 10/12, warden 9/12, pyro 4/12 = 64% (in band)**; wins 52-157 s (median knight
  107, warden 87, pyro 129). **Dry (human+dry): 10/12, 8/12, 2/12 = 56%.** Before: 100%, 12-37 s. Mash 0/6. Measured hp ladder: 560 72%, 620 67%,
  700 72%, 720 75%, 760 64%/56% (noise ~+-8 per 12-seed run).
- **Walker (9 heroes, campaign L3, human+first, 1 seed)**: 8/9 reach the King (paladin ends 'stuck' at the mud-flats exam 455,17 - base's knight ends
  stuck at 445,17 too). Deaths 0-3 a run; arrive 50-77%. STUCKs are the walker's known marsh limits: 312,17 (the river's last bud onto the lip, every
  hero), 85,15 and 153,17 (also on base f95390f0: paladin/berserker/reaper). No stuck at the sluice house after the fixes.

## ART LANE NOTES (greybox - draw these)
1. THE SLUICE HOUSE: timber-and-clay dam (347-349, rows 18-27), a tall stilt mill on it with the ladder (col 349, rows 11-17), the gate deck (346-348
   row 11) and a breakable SLUICE GATE (ent sluice at 347,10 - its open/broken state), the miller's loft (340-343 row 8) with a roof, water sheeting
   through the gate as the basin drains; the drained basin's MUD bed (350-369 row 25: wet mud, stranded fish traps, the huts' stilts standing in it), the
   board stair out (363-364 r22, 365-366 r20).
2. THE STILTS: the start JETTY (5-23 row 19, also the ferry transition's landing), the stilt lookout (57-70 row 11 + rope ladder col 57), the shallows
   boardwalk + rope rail (112-129 row 16), heron hides (132-137, 150-158 row 15), river boards (226-236, 261-271, 293-300 row 15), reed-island hut walk
   (378-388 row 14), grove bank walk (429-443 row 15). The support kit: src/forest-supports-art.js 'stilt' and 'reed' are placeholders.
3. THE KING's poses 7-17 (src/redraw/frogking.js, procedural from his own frame() builder): the grab's head-low windup, the tongue lunge, the rear-up,
   flat on his belly, cheeks full of flies, the spit, the swelling throat, the ripple let go, the raised hand, the slap, his eye on the flies.
4. THE KING's effects (FKC.draw, main.js waves): the fly swarm (dots), the ripple ring, the TIPPED pad (gold rim + the end it throws from), the
   belly-flop's mud-and-water crest, the deep pond's level (deepLift) - his court needs a deep-water look in phase 2.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. THE THIRD CHANNEL USE: REC + BUILT the village sluice house (required drain, a mud route under the huts). ALT: a mid-river ferry stop (optional).
2. THE PYRO IS THE WEAK HERO vs the King (4/12 with flasks, knight 10/12): she cannot shield his grabs/leaps, her ward is the answer. REC + BUILT: tune
   on the overall (64%) and report; ALT: a pyro-specific tell window (longer tongue tell) or a lower leap damage.
3. THE ADDS: his croak's hoppers cut to 1 (court) / 2 (pond). REC + BUILT: keep a few (they were his own before). ALT: no adds (B-standard says adds only
   when a brief asks).
4. Swimming the deep far basin is possible (deep water drains you ~9%/s since 10-18). REC + BUILT: leave it (costly, "the channel is deep"). ALT: make
   that basin lethal-hand-back so the drain is truly the only way.
5. normal-health's winnable row (marsh paladin L1) still WINS (141 s) - no move needed.

## FILES
src/frog-king.js (new), src/marsh2.js (new), tools/marsh2-beats.mjs (new); src/main.js, src/lab.js, src/marks.js, src/redraw/frogking.js, src/level.js,
src/forest-supports.js, src/forest-supports-art.js, src/stuck-spots.js, src/hint-lines.js, src/checkpoint-thin.js, tools/check.mjs, tools/solid-islands.mjs,
tools/lethal-water.mjs, docs/mash-bot.json, docs/level1-pilot.json, docs/level1-curve.json. Helpers in work/tmp-marsh2/ (uncommitted).
