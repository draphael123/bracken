# LANE REPORT: hookpolish (sonnet) - boss-hook polish: STOCKADE, SUNKEN CARAVAN, UNDERWELL
Branch claude/hookpolish (worktree bracken-hookpolish), base a36bf11c (claude/batch125 tip). Not merged, not deployed.
Nothing was run beyond the checks below; no playtest by a human. All rates: tools/boss-rates.mjs, profile human, flasks kit, campaign level, n=12 per hero (knight/warden/pyro), "practiced" way.

## WHAT CHANGED
### STOCKADE (Goblin Chieftain)
The audit (hook-audit-1027) was partly stale: claude/chief3 (10-21) had ALREADY built his war horn (every 17 s he winds it, a told draw bar; two blows silence it = SILENCED opening; left to sound it calls 2 crew in at the hall's doors) and "horn answers horn" (your captured horn blown WHILE he winds his stops the crew coming). What was missing, and is now built:
- YOUR HORN PULLS HIS CREW AWAY (src/stockade-hands.js blow()): if his crew are already in the hall, E with the captured horn sends every crew goblin running back to the door it came in by (LURE.crewSpeed 125 px/s), where it stands looking up for LURE.t = 6 s (it notices you if you walk within 40 px, or if struck - the existing lure rules). Told: the word "YOUR HORN SENDS HIS CREW HOME" over him, the horn ring, the crew's shock emote. He stands alone for the window. Only an actual blow on him opens him (unchanged); the pull is a tool, not an opening.
  (First version sent them to the far end of the hall; the powder store's crates are a 2-tile wall in the middle that the sprigs cannot climb, so they stalled. Home-to-the-door is robust and reads clearly.)
- Told attacks kept: club chain + horn + keg + tower (>= 6).
- Numbers: Chieftain hp 585 -> 530 (src/main.js EHP.chief) - baseline 53% was under the band.
### SUNKEN CARAVAN (Dune Worm)
- Phase 2 keeps the sun on: src/main.js cvShaded() no longer treats the whole hollow as shade under the storm (inHollowStorm removed from the shade test; the HUD status no longer shows the storm icon as shade). The storm still blows (gusts shove you on the told WARN clock) and the false-ripple/third-stone phase-2 changes stay. Shade in P2 = the three standing stones (keep2 = 3, each 64 px wide, gap cap 6 s with none up) and the rim's overhang at the west end. Told: on "HE CALLS THE STORM" a second line "THE SUN STAYS: STONES ARE SHADE". Header comments + docs/briefs/dune-worm.md updated.
- Shade reachable / fair: stones rise at fair slots (edge 64 px, clear 44 px of you, never under you), so >= 2 of 3 are always within a short dash; sunstroke only drains after 2 s on the meter and shade resets in 1.2 s. tools/dune-worm.mjs assertion flipped: the sun now builds in the hollow in phase 2 (0.8 on the meter after 4 s in open sand at the gate end).
- No HP/damage change (rates in band).
### UNDERWELL (Cistern Queen)
- The "light her oil" opening ALREADY EXISTS (claude/cisternqueen3, 10-14: SET HER ALIGHT - torch from the cresset thrown on her floor oil, or her burrow run up into burning oil: she THRASHES then SAGS, tail drooping to the floor, gold ~4.8 s window, then ward + blackened shell cooldown; no fire in the flood). The audit row ("all her openings are water") is stale. tools/cistern-queen.mjs (162 checks) and tools/boss-openings.mjs cover it (open.ablaze >= 3). Nothing new built for the mechanic; I kept the water openings (slip/soaked/fallen/rear) untouched.
- Numbers only: hp 2300 -> 3400 (src/cistern-queen.js CQ.hp). At 2300 she measured 81% (HIGH).

## WIN RATES WITH FLASKS (n=12 per hero; knight/warden/pyro)
| boss | before (a36bf11c) | after | band |
|---|---|---|---|
| Goblin Chieftain (L4) | 5/12 9/12 5/12 = 53% LOW | 6/12 10/12 7/12 = 64% | in band |
| Dune Worm (L40) | 8/12 7/12 12/12 = 75% HIGH | 5/12 6/12 12/12 = 64% (P2 sun on) | in band |
| Cistern Queen (L42) | 10/12 8/12 11/12 = 81% HIGH | 10/12 4/12 8/12 = 61% (hp 3400) | in band |
Stockade note: the pull-away change alone gave the identical 53% (bot never blows the captured horn); the 64% is the 585 -> 530 hp trim.
Underwell tuning log (hp -> result): 2300 81%; 2700 75% (12/12 3/12 12/12); 2900 75% (same); 3400 61%. Warden is the weak hero in the bot (3-8/12), knight and pyro are strong - per-hero spread is large but nobody is at 0.
Dune Worm: pyro 12/12 is high vs knight 5/12; overall in band, left alone (hero spread is the bot's, not the P2 sun).

## CHECKS RUN (all on branch tip 58962e58, level geometry unchanged)
- tools/chief3.mjs: PASS (new assertion: his called crew run home to the doors on your horn) | tools/stockade2.mjs PASS
- tools/dune-worm.mjs: PASS (flipped P2-sun assertion) | tools/underwell.mjs PASS | tools/cistern-queen.mjs 162 checks PASS
- tools/level-quality.mjs stockade caravan underwell: all CLEAR THE BAR (mash bot holds 0/6 in each, solid; room fights/ruleFight ok)
- boss-fight-end (copy of tools/boss-fight-end.mjs restricted to these 3 levels; full tool not run): all 3 end on the boss's death
- tools/reach-heroes.mjs stockade / caravan / underwell: 0 known crossings, nothing new (9 heroes route)
- tools/stuck.mjs --static: OK (3130 checks). Page half of stuck.mjs not run.
- tools/mash-gate.mjs: 1 FAIL = "crown: the level changed since the mash bot ran" (PRE-EXISTING from batch125's Highcrown change; not mine; needs `node tools/mash-bot.mjs crown --level crown --write`).
- NOT run: tools/textfit.mjs (the new strings are world callouts via number(), 29-31 chars, same size as existing "THE POWDER TAKES THE LASHINGS"); full stuck page run; boss-openings.mjs.
- New files: none (no ad-block-name risk).

## COMMITS (claude/hookpolish): 306815e6, 21883dd8, 8fb95012, 11df2afd, 5661f12c, 157670e9, 75ca650f, 58962e58 (tip). Report copy committed at work/claude/lane-done/claude-hookpolish.md.
Browsers/servers: every run closed itself; PIDs in work/hookpolish-pids.txt (in the worktree, uncommitted); baseline worktree bracken-hookbase removed. The release gate had not started (batch125-resume.log still "waiting for 18:00 and 6 GB free") at every browser launch; free RAM was 4.6-5.3 GB each time.

## QUESTIONS FOR DANIEL (rec first, built the rec)
1. Stockade horn: I sent the crew HOME to their doors (not to a log pile / far side). Rec built. Alternative: also drop a log pile on them when they bunch at a door (the piles are mid-level, not in the hall) - not worth it.
2. Dune Worm P2 now drains in the open. Rec built (stones + overhang are shade). If playtest finds P2 too punishing at the gust moments, the cheapest knob is WORM.LEDGE.keep2 3 -> 4 or a longer life[]; I did not touch it.
3. Underwell: the audit said the torch half is unused - it isn't (cisternqueen3). Do you want the fire opening MORE prominent (e.g. a sign at the cresset, or her P1 burrow forced across the oil pool)? Rec: leave; a human playtest first. Hp 3400 is a +48% jump - if you prefer, drop it and lower her damage instead (knight/pyro win by taking ~400 hp, warden loses on mechanics, so hp is a blunt tool here).
4. Hero spread: warden is 3-6/12 on Cistern Queen/Worm vs knight/pyro 10-12/12 - a bot/hero issue, not a hook issue; flagging for the boss-tuning lane.
