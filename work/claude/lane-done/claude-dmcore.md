# DMCORE (lane 1 of dirmoves-plan sec 11) - READY (code + node proof; stills owed)
Branch claude/dmcore, worktree bracken-dmcore. Flag DM.on = false: with it off every hook is a no-op (tools/dirmoves.mjs asserts it).

## Built
- src/dirmoves.js: DM table + pure rules; preloaded in index.html.
- FLOW 1 launcher -> air hits: rise that launched stamps P.dmLaunchAt; JUMP-key (not UP-key) cancels the rise swing for 0.20 s; air blows on a launched foe hang +0.25 s, max 2, the 3rd knocks it down (main.js OFF THE GROUND site). x1.3 kept.
- FLOW 2 plunge bounce -> air dash: pogo-chain bounce() gets an api.after hook; plunge pogo off a head and wardenVault(e) refresh P.dashedAir/airDashN (+ airRolled). Air jump not refreshed. Bare floor never. 'AIR DASH BACK' number. (Freebooter boarding leap already clears dashedAir today; untouched.)
- FLOW 3 trip -> ground hit: a TRIPPING sweep sets P.dmWin = 0.15; commit.js committed/committedNext/inRecovery read winOf(P) = P.dmWin || WINDOW (inert unset). Closes on the next non-sweep swing or after 1 s.
- PvP caps: launch on a duel proxy (e.t duelist / pvpSeat) = kvy x0.5, no stamp, no hang (airBlow pvp), so no juggle.
- Plunge air refresh: see FLOW 2.
- CLASHES (DM.on): X held >= HEAVY_START (or charge>0) on the ground + an UP-key jump = suppressed (Z/Space jump still jumps); P.ducking suspended while winding (not Ranger: her kneel draw IS hold+down, DMHEROES-C retunes it); ladder UP-grab ignored while winding. Drop-through stays DOWN+JUMP (untouched).
- SEAT BUG fixed under DM.on: jumpUpKey was a global read by every seat's pass, so seat 2's pad/partner jump inherited seat 1's ArrowUp. pressRead now carries jumpUp, pressWrite restores it per seat.

## DM table API (src/dirmoves.js, `import * as DMX`)
DM.on; DM.flow {launchCancel .20, hang .25, hangMax 2, airMul 1.3, refreshOnHit, refreshAirJump false, tripCancel .15, trippedMul 1.5}; DM.pvp {launchHeight .5, hang false, juggle false}; DM.clash {heldAtk .14}; shared numbers for later lanes (unused here): DM.foe {leapSwatFloor 1.0, leapSwatMul 1.5, highGuardUp 1.5, helmCrackLight 1.0, beastStagger .6, beastPoiseLean 1.5}, DM.charge {step .45, scale per hero, launcherMul 2.0, slamMul 1.6, launchT 1.6, slamHalfW 40, tripBeast .7, guardBreak 1.4}.
Functions: dmOn, onLaunch(P,e,now), jumpCancelOpen(P,now,jbufUp), airBlow(e,now,{pvp}), launchVy(vy,isHero), isHeroTarget(e), refreshAirDash(P,hit), onTrip(P,now), tickWindow(P,now), upJumpSuppressed(s), duckTwistSuspended(s), upGrabIgnored(s), dropThroughAllowed(s). s = {atkHeld, charge, upKeyJump, ground, jump, down}; main.js builds it with dmS().

## Tests
- node tools/dirmoves.mjs: 58 checks OK (off = inert; each flow link; PvP caps; seat 1 vs seat 2 clash states; source-wiring greps; commit.js unchanged without dmWin). node --check on main/commit/pogo-chain/dirmoves/audit-input OK.
- tools/audit-input.mjs: new `dmClash` block (seat 1, DM.on forced in the page): knight run = upKeyJumpWhileXHeld false, zJumpWhileXHeld true, duckWhileXHeld false -> CLEAN. Existing rows unchanged. Caveat: not run with DM.on off as a control, so the UP-key event path is not proven to jump when off; seat 2 is node-only (per-seat state).
- Not run: tools/check.mjs (forbidden), the other 5 hero audits, pogo-chain.mjs.

## Owed
- Stills of the 3 links (launch -> 2 air hits; plunge bounce -> air dash; trip -> hit) to a browser lane (need DM.on = true in page: `(await import('/src/dirmoves.js')).DM.on = true`).
- Co-op seat 2 live input audit in a browser (two seats, both on keyboard/pad); door UP-grabs not found as a single site (only ladders gated) - DMCHARGE lane should grep door/lift UP use.
- tripCancel widens the whole commit window (any action) for 0.15 s after a trip, not only the next ground swing: simplest honest reading of the brief.

## Questions (rec first)
1. tripCancel: widen only swing presses (rec: leave all actions; trips are rare)?
2. Charged-wind duck suspension also drops the crouch hurt-box while X is held with DOWN (rec: fine, it is a 0.14 s+ commitment to the charge).
