# claude/water1 - THE PIRATE FLEET + THE FREEBOOTER (OPUS greybox, code-only) - 11-05

Branch `claude/water1` off `claude/waterkit` (e08836df8) + master 929cc4786 (BATCH146) merged in clean. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-water1`.
NOT merged, NOT deployed. POST-DEMO work. Tip: see the final commit on the branch (the report commit).

**Which level:** plan-water-1105.md section 5, first row, lane A: THU 11-12 "OPUS Pirate Fleet + Freebooter". (Lane B, the tide kit + pull field, is claude/waterkit.)
The plan says the Pirate Fleet does not *need* the tide kit; it uses it anyway: **the SWELL is the tide kit run fast**, and **the sea is the pull field**. That also made this lane the one that wires the kit into main.js (waterkit Q1 rec).

## Level: `piratefleet` - THE PIRATE FLEET ("open sea, the swell, and the Freebooter")
Row in src/level.js: APPENDED, `hidden: true`, `needs: 'flotilla'` (the gate-chain link to its future spur). No map node, not on the road, not on the demo list. Dev only: `?level=piratefleet`.
Rule: **THE SWELL LIFTS THE BOATS: BOARD WHEN SHE RISES. STRIKE A WINCH AND HAUL A SHIP ALONGSIDE.** 440 x 44. Start + 2 shrines (194 on the galleon's quarterdeck, 373 on his tender).

| band (cols) | what | swell / grapple / sea |
|---|---|---|
| 0-96 THE FLEET'S WAKE (teach) | Flotilla's last hull, the cutter, the sloop-o'-war (deck gun down her deck, deckhouse silver, pistoleer in the top) | one swell boat (board at high: next deck 28 px up; at low 76 px = a wall); then two boats on TWO swells (meet twice a cycle); DRIFT current back to the east-side net |
| 97-196 THE GRAPPLE (teach/test) | brigantine (stern castle, mizzen-yard silver), galleon's waist (grapnel boarders, powder monkey on the quarterdeck) | winch g1 hauls prize p1 alongside from a hull; winch g2 from the castle over a STRONG channel that runs with the swell (back on the rise, on with the fall); SHRINE ONE |
| 197-296 THE SINKING PRIZE (remix) | powder hulk (deck gun, 2 monkeys, keg, captain's cabin silver), gun brig (great cabin three decks high: over it by the shrouds) | the winch rides a bobbing LONGBOAT (g3 on L1); a WHIRL where the prize went down (posts = mast stumps, 3 s release window, silver in its eye); two-swell pairs over it |
| 297-378 THE STORM SWELL (exam) | exam decks one/two (cutlass pair + pistoleer, monkey + keg roller + bosun on a forecastle), his tender | own faster, bigger swell (rate 1.3, 5 rows); winch g4 over a RIP (110 px/s, anchor-chain posts, 2.5 s window); two storm boats on two swells; SHRINE TWO |
| 379-439 THE FREEBOOTER'S FLAGSHIP | his deck 380-411, sea gap 412-415, HIS SLOOP 416-431, exit hull + gate | P2: he hauls his own sloop alongside (the level's verb, his turn) - two decks on the swell |

Foes: cutlass, pistoleer marine, bosun, netter, grapnel boarder, powder monkey, keg-roller sapper, gull-petrels over the swell gaps. **No new foe** (plan: "none"; the counter core's FEINTER is not built). No goblins. Timber only as ships (tarred hulls); no loose logs.

## How the kit is used (src/pirate-fleet-hands.js = THE KIT'S MAIN.JS WIRING, generic for any L.tides/L.pulls level)
- **Tides:** `swell` (drives pools sea/sea2, lo 35 hi 32, 10.4 s cycle, tells 1.6 s), `swellB` (anti-phase, floats only, drawn with its own crest), `storm` + `stormB` (rate 1.3, lo 36 hi 31). Swell boats and prizes are kit FLOATS turned into movers (main.js carries riders by m.dy). Warn = the sea's foam line runs white + a splash tell; A3 gauge greybox bar top-left. `tideRespawn` on load/respawn (grace 3 s).
- **Pulls:** 10 fields: drifts (teach), tide-driven strong channel (test), whirl with posts + release window (remix), rip with posts + window (exam). Every current carries a swimmer to a net (checked). Post grab = hold UP (waterkit Q2 rec). Foes in the water are pulled at 0.6.
- **Grapple:** winch ents `grapplewinch` (L.pfWinches); a blow fires the line (0.45 s) and hauls the prize in from the background (2.2 s, creaks), then she's footing and rides her swell. Mark `pf:haul:<id>` keeps it hauled through death/reload. His sloop is not a mark (resets each attempt).
- Reach model: each float is an `L.rigBands` ride (high deck and low deck both stops) so the reach fill and route see the crossings.

## THE FREEBOOTER (src/freebooter-boss.js pure + src/freebooter-hands.js), hp 4200 (placeholder, untuned)
- P1 his deck: THE PISTOL (!! roll/jump, through any guard; aim line tracks then LOCKS 0.3 s) -> RELOAD 3.6 s = OPEN 1.0x; THE FIVE CUTS (! guard); THE CHEAP SHOT (! low boot, jump it, shoves); guard by angle: a front blow is PARRIED (0.4x) and answered by a told RIPOSTE (!); from behind/above 0.6x; POWDER FLASH dodge after 3 quick hits (moves him 84 px, never i-frames, cd 5 s).
- P2 (<55%): he whistles and hauls HIS SLOOP alongside; NEW MOVE: THE BOARDING PLUNGE (!! red mark follows you, locks, he plunges; missed = STUCK IN THE DECK 2.8 s, OPEN 1.25x); he BOARDS across to whatever deck you're on. Sea gap = hauled out onto his deck (hazard share).
- Resist floor: min 0.4x in every mode/position (tested); ward 1.6 s at 0.4x after each opening; gold ring + timer on openings, grey on ward; tell words name the answer.

## Files
NEW src/pirate-fleet.js, src/pirate-fleet-hands.js, src/freebooter-boss.js, src/freebooter-hands.js, tools/pirate-fleet.mjs. EDITED src/level.js (import + row), src/main.js (19 small hunks: import, EHP, clear x2, spawn x2, take, death case, update dispatch, hands creation, strike, update, mover, drawBack, drawMover, drawBoss, drawOver, hud, bar name, window.BK hooks), src/threat.js (freebooter 6, grapplewinch 0), src/hint-lines.js (PF_SAY/FB_SAY), tools/tide-kit.mjs + tools/pull-field.mjs (lint the BUILT level - they read the row and so saw "none yet" forever), tools/level-quality.mjs (GATE + REPORT_ONLY piratefleet [music, pilot, mash]; ROLES.ranged += pistoleer, powdermonkey), tools/one-new-foe.mjs (GRANDFATHERED piratefleet with the plan's reason), tools/check.mjs (own line, not run), docs/waterkit.md (status: wired).
New filenames checked: no ad/admiral/banner/track/pixel/promo.

## Checks (Node only, one at a time; no browser opened)
pirate-fleet 136 ok | tide-kit 2020 ok (lints piratefleet) | pull-field 77 ok (lints piratefleet) | level-quality piratefleet CLEARS THE BAR (bands 6, mechanics 5/3, secrets 2 off-route, density 1.13, roles 3; REPORT-ONLY music/pilot/mash) and the full gated run exit 0 | anchor-lint piratefleet 2 listed cantilevers (deckhouse/cabin roofs; listed not gated) | floating-geometry ok | dangling-paths ok | one-new-foe ok (grandfathered) | goblin-lint ok | checkpoint-gaps ok | checkpoint-stand ok | foe-footing ok | solid-islands ok | newlevel ok | comments ok | node --check main.js ok.
NOT run: tools/check.mjs (per brief). SKIPPED as browser tools: reach-heroes, lethal-water, level1-pilot, mash-bot, boss-rates, textfit, level-walk.

## Browser owed
- First load + walk of `?level=piratefleet` (main.js wiring is unproven in a page: floats as movers, riders, prize haul, pull on swimmers, pool drawing at moving p.y, foam/gauge).
- Feel: swell timing per hero (tolerances 28 px up at high / 76 at low), the swim bypass (a strong swimmer may climb a hull's west side at high swell - no net there; may need taller freeboard), post-grab key, the rip with the slowest hero.
- level1-pilot + mash-bot rows, reach-heroes, lethal-water, textfit (FB tell words), hint-lines callouts.
- Boss: a lab hook for tools/boss-rates.mjs (fbPlan exists, lab.js branch NOT written) then n=6 per hero toward 60-70% WITH flasks; hp 4200 is a placeholder.
- READ-ONLY reviewer vs Mage's Folly (plan rule for every opus greybox) - not run (code-only lane).

## Art owed (all GREYBOX now)
Swell boats + prizes (tarred hulls far/near, sails), winch + line, mast stumps/anchor chains, foam line, the A3 gauge dial (shared with every sea level), flow streaks, the Freebooter's sheet (windup/release per move, reload, stuck, plunge, fall), his sloop, palette/tile kit for open sea (plan section 4 has no Pirate Fleet palette yet), level music (borrowing the Flotilla's), boss track (boss2 pool now).

## Questions for Daniel (recommended answer first; recs built)
1. **No new foe here** (plan said none; F10 wants one). REC: place the counter core's FEINTER here when it lands and drop the grandfather line. Alt: promote the gull-petrel into a real "storm petrel" sea foe now.
2. **Swell-boat crossings are generous at high swell** (28 px up). REC: keep for the greybox, tune after the first walk. Alt: tighten to ~40 px.
3. **Swim bypass at high swell** (no net on a hull's west side, but a swimmer may climb a 2-row freeboard). REC: let the walk decide; if it happens, raise hull decks one row in the teach gaps. Alt: make the gap currents strong (slow to swim against).
4. **Hauled prizes stay hauled after death** (mark). REC: yes (fewer frustrations; deaths cost via Salt & Sanctuary). Alt: re-haul each attempt.
5. **Freebooter P2 at 55%, plunge + boarding.** REC: as built, tune lane sets numbers. Alt: P2 at 50%.
6. **Hero unlock (beat him + 10 silver)** is NOT wired (brief: ships only when every unlockable hero has a fight). REC: leave to the unlock-rule lane.
