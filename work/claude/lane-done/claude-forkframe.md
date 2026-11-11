# FORKFRAME lane report (claude/forkframe, from origin/claude/traittune-d 0a10c8de4) - 11-10

Code-only: no browser, no tools/check.mjs, nothing killed, nothing merged or deployed. Everything is behind FORKS_SHIP (src/forks.js, default false). Flag off = the base: tech()/upg() read the card as before, no fork card, no strip change, no inn station, no p.fork written (asserted in tools/forks.mjs).

## What was built (file:line)
- src/forks.js (NEW, pure): FORKS_SHIP + setForksShip + the lab's ?forks=on read at load (:20-24); FORK_LADDER L21,22,24,27,29,32,36,38,43,48,50 (:33); registry + registerFork for tools (:44-52); forkSide / forkOn (picked AND level reached AND, for a skill fork, slotted / for a trait fork, worn) (:65); forksOwed / traitForksOwed / owedCount; forkCard (:78); setFork = pick AND free swap, level-gated (:84); boardRows (the inn board) (:85); roadStrip (:91); botForks; validateForks (drops, never throws); migrateForks (Knight, one-shot on p.fork.knight.v) (:114); legacyTech / legacyUpg (:128). Save = p.fork[hero] = {key:'A'|'B', v:1}; NO version bump (a flag-off or older build just ignores p.fork; tested: a flag-on save loads with the flag off).
- src/forks-knight.js (NEW): the four Knight forks that already have effect code: BLOCK L27 (A LONG GUARD | B SHIELD ADVANCE), HEAVY L32 (A PUNISH | B LINK CUT), SPENDER L36 (A IRON LINKS = ukeep+uwind | B RALLY ORDERS = korders), CAPSTONE L50 (A LONG CHARGE | B BREAKING WHEEL). Names <= 14, trade line + what + teach each.
- src/progression.js: imports/exports FRK (:8); hasKit(h) is false while the flag is on for a hero with forks (:100) = the one choke point that cuts his technique + upgrade cards, turns his L25-L50 levels into stat cards, and brings the major perks back (forkplan sec 1: "upgrade levels -> stat, milestone perks back"); validateForks in validateProgress (:319); migrateForks in both migrateProgress paths (:367).
- src/main.js: tech()/upg() answer from the forks while the flag is on (:866); fkOwed + cardOwed count fork cards (:5039); cardNow deals the FORK CARD after the stat card (a reached rung, or a trait worn at L20+ with no pick); cardTake writes setFork + the unlock banner; drawCard: "CHOOSE YOUR PATH: <ability>" title, trade line, "SWAP FREE AT THE INN" label, no RECOMMENDED; the strip is FRK.roadStrip with the flag on and goes compact (L## + A/B) past 6 pips (:5081); wearing an unforked trait at L20+ opens its path card (first-wear card, skills-menu trait branch); levelUpLine counts fork cards; XRDUI wiring: import, instance (:5115), frame in update(), draw, attract overlay, inn api openCrossroads.
- src/crossroads.js (NEW, pure, same shape as unlocks.js): THE CROSSROADS board, tabs ABILITIES / TRAITS, LEFT/RIGHT picks A or B, Z sets (free, unlimited), UP/DOWN rows, TAB next list, ESC back; a locked rung shows "? L<n>"; an unslotted skill / unworn trait shows a note and keeps the pick; the TRAITS tab says "PATHS OPEN WITH THIS HERO'S ROAD" until a hero lane writes pairs.
- src/tavern.js + tavern-art.js: station 'crossroads' x:20 (a signpost by the hearth, right of the fireplace; 3+ tile spacing kept), its ART-list entry, use branch, greybox art TA.crossroads. Station and art exist only while the flag is on at load.
- campaign-kit.js: bots / AI partners / lab take side A (c.fork 'B' or {key:side} for a tune lane). coop-save.js: 'fork' joins the per-hero snapshot.
- tools/forks.mjs (NEW, node-only): the checks listed below. tools/tech-cards.mjs back to the injected-pair form (synthetic pair; the real Knight data no longer holds pairs).

## Came from ltfork / kfork vs new
- Merged whole (commit 059aff2a4, 2 trivial import/migrate conflicts): the pair-card machinery (techniquesAt, forkLocked, respecForks, grantForkRepick, roadToL50, the "forks only" respec toggle, pair card UI/strip), the effect code in main.js (LINK CUT, SHIELD HOOK, BREAKING WHEEL), knight-chain probes, forkproof strip fixes, the three lane reports.
- Used: the effect code for kwheel / klinkcut (ult B, heavy B) is the kfork code, untouched; the strip drawing and its forkproof layout fix are reused.
- DROPPED (forkplan supersedes): kfork's L30/L40/L50 pair DATA in tech-knight.js (restored to base: one technique per level, so the flag-off Knight is exactly today's); COUNTER-THRUST as a block side (riposte is CORE since RECS158-d, so block A is LONG GUARD alone); SHIELD HOOK (parked: forkplan Q4, SHIELD THROW B = TWIN SHIELDS; its code stays in main.js, reachable only by id 'kshook', which nothing grants and legacyTech answers false). The ltfork pair-in-ms machinery is now dormant generic code (no hero has a pair): cleanup candidate, left in to keep this lane's blast radius small.
- NEW: everything in forks.js / forks-knight.js / crossroads.js, the migration, the legacy reads, the fork card kind, the strip compact mode, the inn station, trait-fork keys ('trait:<id>', open at L20 while worn) and the first-wear card, bots/co-op.

## Flag behaviour
- OFF (shipped): identical to the base. Verified in node: hasKit true, tech cards L25-L50 + upgrade cards, no p.fork written on a save round trip, no station/art, setFork refuses ("Forks are not open yet"), legacy reads return null.
- ON (lab ?forks=on, or FORKS_SHIP=true): the Knight's technique/upgrade cards are cut; his save migrates once (p.fork.knight.v): old techniques -> sides (klong A, kadvance B, kpunish A, klinkcut B, korders B, kcharge2 A, kwheel B; both of a pair held -> A), every ms[n] that held a technique or upgrade is deleted (that major perk is owed again), c.up deleted (those levels are stat picks again), one free card respec, cardNew set so the map opens the card. Rungs reached with no old technique are dealt as fork cards. A save written with the flag on loads fine with it off (the technique cards are simply owed again). Seven Knight rungs have no data yet (plain levels, below).

## Node checks run (all PASS; main.js node --check OK)
tools/forks.mjs (new); tools/tech-cards.mjs; tools/progression.mjs; tools/coop-progress.mjs; tools/traits.mjs; tools/old-save-traits.mjs; and progression / coop-progress / old-save-traits again with the forks flag ON (globalThis.location ?forks=on). tools/forks.mjs covers: shipped flag false; flag-off base (no write, no station, save untouched); data shape (names <= 14, ids unique, capstone = ult, rungs off every milestone, every side id the Knight code asks for is covered, kshook/kcounter deliberately not); flag-on hasKit / milestones / stat picks; owed queue; pick/swap free + level gate + the read needs the level; skill fork (slotted) and trait fork (L20, worn, first-wear card owed once); validation drops bad entries on and off; migration at L24 / L27 / L35 / L50 + both-sides + idempotence + flag gate; legacy tech()/upg(); flag-on round trip stable; flag-on save loads flag-off; card / strip / board shapes; THE CROSSROADS screen through a fake api; bots; co-op snapshot key.
NOT run: tools/check.mjs, textfit, anything with a browser.

## Browser checks owed (one sequential list; lab ?forks=on, one browser at a time, >= 1500 MB free, no GATE/BROWSER-HOLD flags)
1. Flag OFF smoke: load, Knight L30 card is still a technique card (SHIELD ADVANCE), the inn has no signpost (tools/tavern.mjs, tools/unlocks.mjs spacing, tools/knight-chain.mjs).
2. Flag ON, fresh Knight to L27 (gainXp): stat card, then CHOOSE YOUR PATH: THE SHIELD UP; A/B halves, trade line, SWAP FREE AT THE INN; take B; banner; hold C + walk marches.
3. L32 / L36 / L50 cards the same; the capstone card has no gold frame on the options (label only): look; UP+C at 3 links does LONG CHARGE vs BREAKING WHEEL.
4. Strip: 4 pips on the Knight with full names - look for overlap with the next-perk line; compact A/B mode only appears at 7+ pips (force with registerFork in the console).
5. Old-save migration live: a real L35 and L50 Knight save loaded with the flag on: perks owed back at 25-50, stat picks owed, free respec, no crash; then flag off: loads.
6. THE CROSSROADS: walk to the signpost (tile 20, right of the hearth): glint, prompt "PATHS", opens; flip, set, locked row, TAB, ESC; layout at 320x180 (rows 24 px, 4 rows + detail); touch taps on the halves and BACK.
7. Trait wear at L20+ with TRAITS_SHIP on: no data pair exists yet, so register a synthetic one in the console and check the first-wear card opens from the skills menu and returns sensibly (closeCard goes back to the pause menu: known).
8. textfit scope card + the new board; tools/tavern.mjs full (15 stations with the flag on: g0 === STATIONS.length); hero-keys-sheet / mash-gate stay in the suite.

## Not built (owed to later lanes)
- The seven other Knight rungs (dash L21, shield throw L22, chain L24, rising cut L29, ground slam L38, plunge L43, ironclad L48) = KNIGHTFORK (forkplan lane 2). Until then those levels are plain.
- ENDURANCE 20-pick rider (skills -10% cooldown) and baking the cut upgrades (usunder/uthrow/urise -> MIGHT, ustam/ucalm -> ENDURANCE): with the flag on upg() reads 0 except ukeep/uwind (IRON LINKS), so GUARD STAMINA / WHIRLWIND CALM / DEEP SUNDER / SHIELD THROW+ / RISING CUT+ effects are gone (by plan; the rider and the bakes belong with KNIGHTFORK).
- ability-law.mjs (tool still absent; the static pair rules are inside tools/forks.mjs), capstone preview clip, yard TRY station, a ?fork= lab URL param (campaign-kit c.fork exists; main.js does not parse a URL param), PvP: the fork map is in PROG so tech() answers in a duel, but EVEN L1 = no forks is NOT wired (owed), AI-companion pose drawing, per-side SFX / art.
- Trait fork DATA (every hero's 10 pairs) belongs to each hero lane (passiveplan row 8).

## Next lanes (recommended order)
1. KNIGHTFORK (sonnet; forkplan lane 2): the seven rungs, ENDURANCE rider + bakes, knight art (twin shield, horn, surf pose), PvP EVEN-L1 gate, then n=6 on 3 bosses; flip FORKS_SHIP only after this + art (and after the TRAITS_SHIP playtest).
2. PALADIN REWORK in fork shape (opus design then sonnet build).
3. Per hero, one lane each in this order (most played / most merged first): PYRO, GEOMANCER, BERSERKER, RANGER, WARDEN, FREEBOOTER; each also writes that hero's 10 trait-fork pairs and retires its FOLDED ids.
4. BLOOD KNIGHT (opus), then RIMEBINDER / DEMON HUNTER / DESERT PRIEST inside their integ lanes.
5. Cleanup lane: remove the dormant ltfork pair-in-ms machinery once KNIGHTFORK has shipped (progression.js techniquesAt / forkLocked / respecForks / grantForkRepick / roadToL50, the forks-only respec toggle in main.js).

## Questions (recs built, none blocking)
Q1 Flip order: keep FORKS_SHIP dark until KNIGHTFORK + art, even though the 4 built Knight forks work today? REC yes (a Knight with 4 forks, 7 plain rungs and no ENDURANCE rider loses upgrade effects).
Q2 Block side A: forkplan said RIPOSTE, but riposte is core now; built LONG GUARD alone as A. REC keep (A turns shots, B marches).
Q3 Spender A: IRON LINKS reuses ukeep+uwind (chain holds longer, flask gives a link) instead of forkplan's "+8% cut damage per link". REC keep for now; KNIGHTFORK may rebalance.
Q4 Names over 14 chars were shortened on the card (RALLY ORDERS for STANDING ORDERS, LONG CHARGE, BREAKING WHEEL; full wording stays in what/teach). REC keep.
Q5 The first-wear trait card, opened from the skills menu, returns to the pause menu on close (existing closeCard behaviour for back='menu'). REC accept; a one-line fix if it feels wrong in the proof.
Q6 THE CROSSROADS keys: Z set, TAB next list (X is "back" on other screens). REC keep.
