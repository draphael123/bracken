# FREEBOOTERPACK lane report (11-05, code only, unattended) - claude/freebooterpack = claude/kfork ebffef0df + the Freebooter kit. Not merged, not deployed. NO browser opened.
Hero id is 'pirate'. Pattern: kfork / wardenpack. Files: src/tech-freebooter.js (data + card text), src/freebooter-tech.js (numbers + pure rules), src/progression.js (import + 2 rows), src/hook-catch.js (verdict fns take an optional perfect beat), src/main.js (hooks beside his own code), src/lab.js (bot UP+C), tools/freebooter-tech.mjs (new), tools/tech-cards.mjs (freebooter kit check).
Identity used: THE HOOK (tap C catch, hold C throw), THE BALL (hold X pistol; the ball marks, the cutlass cashes it) and the PURSE (P.plunder, never spent until the ultimate). Both capstones spend a FULL purse through UP+C; a plain C stays the hook catch once a capstone is picked (no pick = the old Black Flag on plain C, untouched).

## Kit
| L | technique | input | k | what |
|---|---|---|---|---|
| 25 | STEEL AFTER SMOKE | X after a ball | x1.2 | first cut into a ball-marked foe: x1.2 on top of POWDER AND STEEL (x1.5), +6 plunder, once per mark |
| 30 A | SLIPKNOT (defence) | tap C | none | catch ready in 0.55 s (was 0.85), perfect beat 0.28 s (was 0.2) |
| 30 B | HAUL AND BALL (offence) | hold C hook | x0.6 | hauled small foe is cut at x0.6, powder-marked 2.5 s, the next ball is instant + point-blank (x1.5) |
| 35 | LONG SHOT | pistol at 80+ px | x1.3 | ball x1.3 and +10 plunder |
| 40 A | HIGH TIDE (control) | HEAVY SEAS | none new | reach 160 -> 240, small foes down 2.0 s (was 1.3), a coin (+plunder) from up to 3 knocked over; bosses as before |
| 40 B | QUICK BOARD (mobility) | BOARDING | none new | cd x0.5, +40 px reach, dash 480 vs 420, first foe cut pays +8 plunder |
| 45 | SPLINTER SHOT | pistol | x0.6 | up to 3 small foes within 36 px of the one hit take x0.6 + 0.5 s stagger; never a boss/mini |
| 50 A | THE RAIDING HOUR (capstone, close) | UP+C at a full purse | cutlass x1.25 | 7 s: cutlass x1.25, pistol reseats 0.35 s after each ball, each kill +10 wind; purse empties |
| 50 B | THE GREAT KEG (capstone, far) | UP+C at a full purse | x4.0 / shot x5.5 | rolls a big lit keg (90 px/s, 1.2 s, stops at walls); blows in 2.0 s (r80, 4.0 swords) or AT ONCE if the pistol ball crosses it (r110, 5.5 swords); small foes thrown + 1.5 s stagger, boss/mini: damage only, once; the ball is seated at the cast. This is Daniel's approved POWDER KEG ultimate (11-02) delivered as capstone B |
Upgrades (8, ranked I/II, all wired): FULL PURSE (+20/40% fill), STEADY CATCH (plain catch -15/25% wind), HOT BALL (+8/16% ball), QUICK LOAD (-15/30% reload), LONG GRAPNEL (+20/40% hook reach), SHORT FUSE (powder keg cd -15/30%), BROADSIDE+ (+12/24%), SHARP STEEL (cutlass +6/12%).
Law kept: new blows (haul, splinter, great keg) = swordDmg x k x amul (asserted by reading main.js); the old pistol ball keeps its flat number and only gets multipliers (LONG SHOT, HOT BALL); no pin/floor, bosses never take a new stagger or knock; no heal; FX dice particle-only.
Bot: ULT_BOT has a pirate branch (UP+C at a full purse when a capstone is owned: foe < 110 px for the Raid, 60-200 px for the Keg) and both call sites include pirate. Before this the lab pirate cast the old Black Flag by plain C at a full purse; with a pick the bot now casts the capstone. No-pick bots unchanged.

## Node results (one at a time; no browser)
node --check main.js / lab.js / progression.js / hook-catch.js / tech-freebooter.js / freebooter-tech.js OK. tools/freebooter-tech.mjs PASS (data shape, pair roles + shared trade, card k = rule k, every tech()/upg() id read in main.js, each rule with real numbers incl. catch verdicts with the longer beat, law asserts, wiring asserts, full-kit save + respec). tools/tech-cards.mjs PASS (+ freebooter check), progression PASS (180), coop-progress PASS.
Not run (all open a browser): heroblocksa, riposte, freebooter-kill, textfit, hint-shown, hero-keys-sheet, starter-kits, hero-trials.

## Browser owed
textfit (new names/what/teach/trade lines; HUD labels 'GREAT KEG: UP+C' / 'RAIDING HOUR: UP+C'), hint-shown, heroblocksa (perfect-beat change is a no-op without SLIPKNOT; confirm), a real-key check that tap C = catch, hold C = hook throw and UP+C = capstone stay apart at a full purse, hero-trials 'meter' for the pirate, and a LOOK at every tell: SLIPKNOT's longer gold arc (drawHookSnap uses the new beat), HAUL AND BALL 'BALL READY', LONG SHOT number, HIGH TIDE reach/coins, QUICK BOARD, SPLINTER sparks, the Raid (7 s, no timer on the HUD yet), the great keg roll / blink / blast / shot detonation. Co-op: tech ids are not in the partner snapshot.
Art owed: great keg is the small keg drawn x1.8 (placeholder); no Raid aura/timer bar; no capstone preview clip; no yard TRY station; reuses kitPose 'keg'/'rum', no new SFX.

## Boss-rate impact (no win-rate run; for the tune lane)
- 25-45 are small: STEEL AFTER SMOKE about +20% on one cut per mark (a boss gets marked by every ball, so roughly +1 hit in 4-5 s); LONG SHOT +30% on far balls (the ball is his biggest hit, 26 flat x level growth); SPLINTER and HIGH TIDE/QUICK BOARD matter on crowds only; SLIPKNOT widens perfect catches (boss tells) by 0.08 s, the strongest PvE lever of the early picks for a human, not for the bot; HAUL AND BALL skips bosses (hook hauls small foes only).
- Capstones: RAIDING HOUR is about +25% cutlass for 7 s plus a near-free pistol (reseat 0.35 s: the ball is the heavy part, so this may be the real damage; if the tune lane sees it too strong raise reload to 1.5 s). GREAT KEG is ~4.0 swords timed, 5.5 shot, one hit on a boss (<= Warden's great javelin at 5.0 + 1.5): the conservative capstone. Neither empties faster than the purse refills (coins/catches), no clock added.

## Questions (rec first, none block)
1. RAIDING HOUR pistol reseat 0.35 s: rec keep until the tune lane measures (alt 1.5 s).
2. Capstone B = the approved POWDER KEG ultimate: rec keep as the L50 B choice; the 11-16 rogue rework should then NOT also make it the baseline ultimate (baseline stays Black Flag / its replacement for heroes with no pick).
3. A baseline Black Flag is still plain C for no-pick Freebooters (the rework replaces it): rec leave.
4. GREAT KEG k 4.0 / 5.5: rec keep conservative (alt 6 / 8 if bosses need it).
5. A 30-40 s clock on capstones like geopack/bkpack: rec none (purse refills through play, as the Warden's band).
6. HAUL AND BALL cannot hook bosses (the hook never did): rec keep.
