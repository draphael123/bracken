# GQ2MECH lane report (claude/gq2mech, off claude/gq2) - code-only, greybox

Tip: see the last commit on claude/gq2mech (pushed). NOT merged, NOT deployed. No browser, no headless Chrome; Node tools only, one at a time (free RAM 2.5-4.5 GB before each). tools/check.mjs was NOT run.

## Built (Daniel 11-06 20:19 brief, items 1 and 2)
### 1. The player's bell lure = the main opening (src/gqueen-hands.js, GQ3.mech)
- Her hall bell is now the HANDS' (the generic winch strike in main.js steps aside for it): a blow from ANY seat rings it (told "YOU RING THE BELL"). 10 s cooldown (a ring inside it says STILL SWINGING). A ring while she is mid-move is queued 1.5 s and answered when she is free (stand / rec / point / sceptreWait); it is never allowed to steal a leap, crown or portal.
- She STORMS to the sound (mode 'lure', 250 px/s vs 55-70 walking; told '!!' + SHE HEARS IT + bellow). The charge is a BLOCKABLE hit (14) on any hero it meets; a PARRY on it stuns her (same stun as the crown/shard, so the skill opening is one verb) and cancels the drop.
- The grate column glows (existing tellUntil/tellK, 0.9 s) as she closes the last 225 px and for the 0.9 s she stops under it; then the grate drops (art lane's iron grate + slam dust, via the new main.js gqGrateDrop). Under it = PINNED 4.0 s (pin by 'lure'; -7% hp as every pin) and every blow x1.35 (GQ3.mech.pinMul). Not under it = no pin, "SHE MISSED THE GRATE", she recovers 0.8 s. A hero standing in the column at the drop is crushed (unblockable, shoved clear): ring from beside it.
- Her own bell ring (ringTell/gqRing) is unchanged: it is now the tell for the old rule (do not stand by the grate). Crown/shard parry stays the skill opening.
### 2. Winch gate vs guard waves (hall)
- At 66% and 33% of her HALL bar (P1 bar, hall only) her BARRACKS GATE (the hall's west door, the wall the fight shut at her waking; gqWestGate) rises with a told "HER GUARDS COME" / CRANK THE WINCH and a 5.5 s horn clock (greybox bar over the door).
- A winch stands at arena col +9 (a drum and a rope, greybox draw). Three blows, each within 2 s of the last, from ANY seat (a slow hand starts again) drop the gate: "GUARDS KEPT OUT". Fail and at 5.5 s one soldier joins (66%) / a soldier and a javelin (33%); the gate drops behind them 1.5 s later.
- While the door is open, no hero can walk out of it (clamped inside). One wave per threshold per fight. Retry resets (per-fight state).
- The tower top is untouched: its hatch guards at 66/33% of the P2 bar stay (no barracks there).
- Texts: bestiary desc, first-WARDED tip, hall bell sign rewritten, new sign by the winch (col 216) in src/level.js.
### Resist floor, buttons, co-op
- 0.4x outside openings untouched; she is never invulnerable. No new buttons (a blow on the bell / winch only). 1-4 seats: the bell, the winch and the clamp all test every seat (ctx.eachHero + each hero's own hitSet).
### Lab
- src/lab.js: the old "ring when she is under the grate" bell hand is off; new `labDuty` (hands): crank the winch while a wave is open, ring the bell when ready and she is free, then stand clear of the grate while she storms.

## Checks (node only), all GREEN
tools/gq2mech.mjs (NEW, registered in check.mjs beside gq2-lab; 50 asserts: ring, storm, tell, pin 4 s, x1.35, cooldown, queue, miss, parry on charge, blockable charge, crush-clear, 66/33 waves, kept out / joins, blow window, 2-4 seats, no walk-out, hall-only, wiring); gq2-lab, gqueen3, crown-exam, signs, tells, level-quality crown, answer-tags, comments, architecture, boss-rows, goblin-lint, blow-tags, boss-read, checkpoints, boss-checkpoint, anchor-lint, crown-requests, elites, dangling-paths (the gq2 report cited an example audio path in its own text - reworded). node --check clean on main.js, gqueen-hands.js, level.js, lab.js.
SKIPPED: nothing for RAM. No boss-lab n=6 / page runs (no browser allowed).

## OWED
- BROWSER: real-swing proof that a hero's blow rings the bell and cranks the winch (attackBox is the melee box: ranged-only blows are untested - the pyro / ranger / geomancer need a look), the storm reads, the lab bot (labDuty) rings, clears, cranks; textfit for the new signs; the page parts of rule-openings / highcrown2.mjs ('ring'/'b15' still assert the plate) / boss rows; the curve restamp (level hash changed by the new sign ent; crown row was already stale).
- ART: winch + barracks gate (west door rising/dropping uses the plain portcullis wall), her storm pose (reuses stand/run frames), guard entrance, pin-by-lure pose (reuses 'pinned').
- TUNE (n=6, `boss-rates.mjs crown`): bell cooldown 10, pin 4.0, x1.35, horn 5.5 s, winch 3 blows, guard counts, charge speed 250 / damage 14. The lure should now be the main opening, so P1 time per heroes will move.

## Questions (rec first; all BUILT as the rec)
1. Waves at 66/33% of the P1 HALL bar through the west door (the hall has no room for a portcullis in the east wall: its wall is the arena wall, rewritten by setWall). Rec: keep; alt: carve a real barracks alcove into the dais wall with a dedicated portcullis tile column (level lane).
2. The tower-top hatch guards stay (P2 66/33%). Rec: keep; alt: drop them so guard waves are a P1 thing only.
3. A parry on the lure charge stuns her. Rec: keep (one verb, any hero); alt: charge is parry-proof (red).
4. Winch crank = 3 blows (no hold button). Rec: keep (no new buttons; the level's winch is blow-driven); alt: stand-and-hold E.
5. Lab bot rings and cranks via labDuty; the old hbell hand is disabled with `&& false` (rec: delete it in the integ pass).
