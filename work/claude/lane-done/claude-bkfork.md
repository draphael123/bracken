# BKFORK lane report (claude/bkfork from origin/claude/knightfork 028f1af9f) - 11-10

Code-only: no browser, no tools/check.mjs, nothing killed, nothing merged or deployed, no git stash. scratch\GATE-RUNNING.flag was present: only pure-node tools were run (every tool's imports were read first; blood-kit.mjs, dk2.mjs, heroblocksa.mjs, crouch-b.mjs and textfit use cdp/headless and were NOT run - listed browser-owed). Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-bkfork, commits 6c189bfed + 1c80ee01e (+ this report), pushed to claude/bkfork. FORKS_SHIP stays false. With FORKS_SHIP on the Blood Knight (hero id `reaper`) is COMPLETE: 11 rungs, 10 trait pairs, rider (generic ENDURANCE, already live), one fold (OVERFLOW). He never had technique/upgrade cards (hasKit false), so NO save migration, NO bakes, NO PROGRESSION_VERSION bump.

## BASE: bkrework is NOT merged (heroaudit and forkplan disagree with master here; I followed Daniel's rule: forks of EXISTING abilities)
`claude/bkrework` (11-04: RED REQUIEM on UP+C, DEBT DRAIN third cut, THE ANSWER, nova heal removed, Frenzy removed) is in neither master nor knightfork. I built on master's Blood Knight: CRIMSON FRENZY (HOLD F at full VITAE), the blood-lash third cut, the ward-release nova. forkplan's BK table (written from the bkpack idea list) names moves master does not have (PLANT THE BLADE, PAY IT FORWARD UP+C wave, MORTGAGE double-tap, REQUIEM UNBOUND, THE RECKONING): NOT built (new moves). Where forkplan and heroaudit/passiveplan conflict I followed passiveplan row 8 (the folded OVERFLOW is the ward B side) and heroaudit (sides must not repeat another hero's A, no dash-strike, VITAE/DEBT nouns on the L36 card).

CONFLICT SITES for when bkrework lands (src/main.js unless noted):
1. CRIMSON FRENZY: `bkFzMod()` (helpers after `const kb`), `crimsonFrenzy()` (P.bkFrenzyMax), the swing read at the atk clock (`DK2.rhythm.rate * ... bkFzMod().swing`), the frenzy tint / HUD clock reads, `BKIT.frenzySteal(P, dmg, bkFzMod())` in bkReclaim; src/blood-kit.js `frenzySteal(p, dmg, mod)`. Requiem replaces Frenzy: re-point rung L50 (ult A/B) and trait lastRites to the Requiem clock (8 s HEMORRHAGE) and the input text ('FULL VITAE, HOLD F' -> 'UP + C').
2. THE LASH: `lashReach()`, `lashBox(..., reach)`, `bkReap` / `bkLashPull` and their call in dkLanded. The rework turns the third cut into DEBT DRAIN (weight 0.9, x1.15, bleed 2 s): L24 CRIMSON REACH / REAP THE BLEED must hang off the new drain3 block.
3. THE NOVA: `bloodNova` lance / overflow / deepRed edits. The rework sets NOVA_HEAL 0 and deletes the heal block, so DEEP RED's two sides (MARKED DRAW / BIG DRAW) have nothing to boost: re-point (the rework's own Q4 says the L25-50 lane does it).
4. `reclaimOf` signature: the rework adds `{weight, hem}`; my `k` (QUICK SETTLE x1.5) is one more key.
5. `bkBloodStep` / VITAE: the rework changes the gain table (per 0.6 -> 0.35, per-blow gains); DRINKER x1.35 / MARTYR x0.75 + taken/2 read `P.bkVitIn` / `P.bkTaken`.
6. Debt hold/drain: the rework's THE LONG RALLY (hold 2.0 / drain 8 s) is the base my DEBT fork modifies. LONG LEDGER (+2/+2) and QUICK SETTLE (-1.5 drain) are DELTAS on `BLOOD.debt`, so they carry, but the card text (7 s / 3.5 s) must be re-derived (rework base 8 s -> 10 s / 6.5 s).
7. src/progression.js hero hp 95 -> 105: no clash. Text-only clashes: the L36 / L50 cards name HOLD F.

## Rung table (data src/forks-bloodknight.js; blood-kit.js carries the debt/frenzy/lash/price numbers; effect code inline in src/main.js behind bb())
| L | key | A | B | effect site |
|---|---|---|---|---|
| 21 | dash (BLOOD STEP) | CRIMSON STEP: foes the step passes through bleed 2.5 s (no damage) | DEBT STEP: no wind, each step books 3% hp as debt (payBlood) | dodge gate `(isReaper() && bb('bkdebtstep')) \|\| spend`, passT block |
| 22 | skill:soulReap (BLOODLETTING) | DEEP CUT: nearest foe only, 1.6x, bleed 4 s x2, drink 4% | SPRAY: 190 px forward, up to 5 foes at 0.7x, bleed 1.5 s | cast ~11347 |
| 24 | chain (3rd cut = the lash) | CRIMSON REACH: lash 2x as far (24 -> 48 px), drags small foes a step in (never boss/mini/heavy) | REAP THE BLEED: the 3rd cut on a bleeding foe pops it: 0.25 sword per bleed-second (x bleedN), max 2 | lashBox / lashReach, dkLanded, bkReap, bkLashPull |
| 27 | block (BLOOD WARD) | WARD LANCE: release is a forward lance 1.7x long, 25% harder | DEEP WARD (= folded OVERFLOW): ward fills +33%, a full ward bursts twice | bloodNova, wardStop |
| 29 | skill:boneArmor (BLOOD MAIL) | THICK MAIL: 4 blows at 0.45, 14 s, 0.5 s cast, cooldown x1.15 | THIN MAIL: 3 blows at 0.4, 6 s, 16 wind (not 26), cooldown x0.8 | cast, damage site, cdOf |
| 32 | heavy (hold X, five tiers) | FULL TIERS: as built, T5 BLOOD MOON x1.15 | SHORT TIERS: stops at T3, every tier 40% quicker | bkTier, bkQuick, bkHeavyStart |
| 36 | spender (VITAE) | DRINKER: drinking back fills VITAE x1.35 | MARTYR: half the debt taken/warded also fills VITAE; drinking back x0.75 | bkBloodStep (+ blood-kit bkTaken) |
| 38 | price (BLOOD PRICE, DOWN+C) | LASTING EDGE: 10 s at x1.15, same 10% blood | HEAVY EDGE: 3.5 s at x1.45, 14% blood | bkPrice, bkPriceMod, swordDmg |
| 43 | sig (THE DEBT) | LONG LEDGER: holds +2 s, lasts +2 s (7 s in all, was 5) | QUICK SETTLE: every blow drinks x1.5, drains in 3.5 s | blood-kit debtAdd / payBlood read p.bdFk, reclaimOf k |
| 48 | spike (BLOOD SPIKE, kneel on the beat) | ONE SPIKE: the thrower takes x1.5, reels x1.5, wind back x2 | SPIKE RING: every foe within 90 px takes 0.8 and reels (boss only 0.35 s) | bloodSpike |
| 50 | ult (CRIMSON FRENZY, full VITAE) | LONG FRENZY: 6.5 s, cuts +10% (not 20%) | DEEP FRENZY: 4 s, cuts +40%, drinks 20% of every blow (cap 16% hp) | crimsonFrenzy, bkFzMod, frenzySteal |

Kit rule held: blood only (asserted: no shield / spear / hammer / arrow / flame / stone / holy words, none of the plan's new-move names). Boss law: no new invulnerability, resist, pin or freeze; every drag / stagger skips a boss or runs the told 0.35 s; no new key (all on existing inputs). Slot rule: skill forks apply while the skill is slotted (soulReap, boneArmor); price / spike / debt / vitae / ward / dash / chain / heavy / ult are always on.

## Rider / bakes / fold
- Rider: the generic ENDURANCE 20-pick rider (skills cool 10% quicker) is already live for every hero (knightfork). No class bake: he had no TECHNIQUE / UPGRADE cards, so nothing is cut or returned.
- FOLDED: `overflow -> ward:DEEP WARD` (traits-b.js) now carries `foldRetire: true` and traits.js has wardenfork's flag-aware `foldGone` hook (the same additive edits, identical text, so the two lanes merge clean): flag on, OVERFLOW leaves the slots and the traits menu and lives as block B; flag off it stays slottable. The effect line reads `tal('overflow') || bb('bkdeepward')`.
- DEAD-ON-MASTER passive: LAST RITES (it boosts bloodSurge() / lastHarvest(), both uncalled since CRIMSON FRENZY replaced the surge). Its pair is rewired to the live ult: LONG RITES = frenzy +1 s x rank, DEEP RITES = frenzy drink / cap x(1 + 0.5 x rank). The base LAST RITES stays dead until the rework re-points it.

## Trait pairs (key trait:<id>, open at L20 while WORN; live only with TRAITS_SHIP on). Bonuses scale with the rank (trk 0.70 / 0.85 / 1, exactly 1 flag off); discrete sides do not.
| trait | A | B |
|---|---|---|
| QUICKENED BLOOD (gleaner) | SHORT WAIT: BLOODWORMS cools a further 2 s x rank quicker | LONG LEASH: no cooling cut, worms wait +3 s x rank, +1 bite at rank II+ |
| THE BROOD (press) | BIG BROOD: four worms (rank III), not three | HEAVY BITE: three worms, each bite x trm(1.6) |
| BURST VESSEL (secondDeath) | BIG BURST: reach x trm(1.6) | BLEEDING BURST: bleeds 2 + 2 x rank s, wins back 2 x rank debt per foe |
| LONG PASSING | FAR PASS: +0.9 x rank of a step (base 0.5) | LONG DECOY: no extra distance, the left-behind shape stands x(1 + rank) as long |
| THE RED VOLLEY (fullCircle) | HARD VOLLEY: bolts x1.4 | WIDE VOLLEY: a third bolt between the two |
| DUE RITES | WIDE RITES: reach x1.6, chance as rank | SURE HEART: reach x0.7, always |
| LAST RITES | LONG RITES: frenzy +1 s x rank | DEEP RITES: frenzy drink and cap x(1 + 0.5 x rank) |
| DEEP RED | MARKED DRAW: +8 (not 4) per marked foe x rank | BIG DRAW: heal +0.9 x rank (not 0.5), marks add nothing |
| KEEN PRICE (coldComfort) | LONG KEEN: edge +3 s | KEENER: x(1 + 0.45 x rank), edge -2 s |
| THE WHOLE ROW (gripAll) | DEEP ROW: chain +50 px x rank | HELD ROW: stagger +0.7 s x rank |

## Node checks (all PASS, no browser)
New tools/bloodknight-forks.mjs: 11 rungs on the ladder (21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50), 10 trait pairs one per trait, 42 unique side ids (bk prefix, none shared with the Knight), name <= 14 / what <= 96 / teach <= 175 / caps, skill keys are his ACTIVE catalog skills, blood-only wording, no invented move, every side id read through `bb()` and nowhere else, ~25 effect-site fragments present, flag off reads null / no card owed / hasKit false, flag on reads respect pick + level + slot / worn, owed 11, free swap + level lock, strip 11 pips, board 11 + 10 rows, bots all A, PvP EVEN off, THE FOLD (traitIds 11 flag off / 10 on).
BLOOD-KIT FLAG-OFF PROOF: the ORIGINAL src/blood-kit.js (git show 028f1af9f) and the new module run the same seeded walk (4000 ops x 6 seeds: debt step, payBlood, payPrice, guardPay, drainGive, reclaim, frenzySteal, reclaimOf, lashBox, tierFor) -> byte-identical state and outputs (only the new `bkTaken` field is ignored). The fork numbers do what the cards say (7 s / 3.5 s debt, x1.5 reclaim, 14% price, lash +24 px, 16% / 20% frenzy). The main.js helper expressions (bkFzMod / bkPriceMod / lashReach) with every side off equal the base numbers. Boss-law scan, balance hand math.
Also PASS: tools/forks.mjs, knight-forks.mjs, tech-cards.mjs, progression.mjs, coop-progress.mjs, traits.mjs, old-save-traits.mjs; flag ON (globalThis.location ?forks=on): progression, coop-progress, old-save-traits, traits, knight-forks, bloodknight-forks. node --check on main.js and every touched file.
Flag-off proof for the inline main.js code is an edit-by-edit source audit (no node harness exists for the inline Blood Knight code, as for the Warden): every new read is `bb(id)` = `hero()==='reaper' && tech(id)` = false (techOn answers the old card read, false for the new ids), and each edited expression's false branch is the old expression (x1, +0, `undefined`, the old constants). blood-kit.js is the only module and it IS proven byte-identical.
NOT run: tools/check.mjs, textfit, blood-kit.mjs, dk2.mjs, heroblocksa.mjs (cdp), anything with a browser.

## Shared-file edits (additive, for merging beside warden / ranger / freefork / geofork)
- src/forks.js (3 lines): `import { BLOODKNIGHT_FORKS } from './forks-bloodknight.js';` right after the LADDER_LV line, `REG.reaper = BLOODKNIGHT_FORKS;` right after `unregisterFork`, and the legacyTech line `if (h !== 'knight' && !hasForks(h)) return false;` BYTE-IDENTICAL to the warden / ranger / pyro / geo lanes (take any).
- src/traits.js: the warden lane's foldRetire hook (import forksShip, `foldGone`, its use in kindOf / slottable / traitIds / traitUpText): same text as claude/wardenfork, expect an identical hunk (take either). src/traits-b.js: one line `foldRetire: true` in the reaper row.
- src/blood-kit.js: debtAdd / payBlood read optional `p.bdFk` {hold, drain}; debtStep and guardPay add the new `p.bkTaken`; `reclaimOf` `o.k`; `frenzySteal(p, dmg, mod)`; `lashBox(..., reach)`; `payPrice(p, free, pct)` (all optional, defaults = old).
- src/main.js: helper block after `const kb` (bb, bkFzMod, bkPriceMod, lashReach), 51 one-line edits at the sites above, `bkReap` / `bkLashPull` bodies before `bkLashHit`, `BK_FK_*` consts before `bkReclaim`. Nothing in damagePlayer, the card code, tavern, progression or the save (cdOf gained three bb terms).
- New files: src/forks-bloodknight.js, tools/bloodknight-forks.mjs, this report. No crossroads / tavern / progression / save change. tools/forks.mjs untouched (its empty-hero asserts use 'pyro' / 'warden'; they fail on any branch that gives those heroes data: use a nobody-hero when merging).

## Browser proof owed (sequential, one browser at a time, >= 1500 MB free, no GATE-RUNNING / BROWSER-HOLD; lab ?forks=on&traits=...)
1. Flag OFF smoke: the Blood Knight plays as base (blood step, BLOODLETTING, rhythm + lash, ward + nova + parry, BLOOD MAIL, five-tier heavy, price, spike, frenzy): tools/blood-kit.mjs (page run), dk2, heroblocksa, crouch-b, reaper-input, one yard run with the debt HUD.
2. Flag ON fresh Blood Knight (gainXp): one card per rung 21..50 with the stat card first; strip 11 pips on 320x180; THE CROSSROADS board 11 rows + TRAITS 10 rows; OVERFLOW gone from the traits menu; the L36 and L50 card text fits.
3. Per side, one use each on a dummy: CRIMSON STEP (bleed ticks on foes passed) / DEBT STEP (no wind drop, 3% debt red segment); DEEP CUT / SPRAY (cone, 5 foes, the facing); CRIMSON REACH (lash draw at 48 px: the whip sprite length, the drag) / REAP THE BLEED (REAPED pop, bleed gone); WARD LANCE (forward-only damage; the ring VISUAL is still a ring: art owed) / DEEP WARD (fill speed, second nova on a full ward); THICK / THIN MAIL (blow count, 6 s expiry, cooldown); FULL / SHORT TIERS (T5 x1.15; the SHORT meter still draws 5 segments: cosmetic, art owed); DRINKER / MARTYR (VITAE after a taken blow and after a drink); LASTING / HEAVY EDGE (edge timer, debt size); LONG LEDGER / QUICK SETTLE (red segment 7 s / 3.5 s; the red edge pulse and heartbeat keep running); ONE SPIKE / SPIKE RING (two foes beside a kneel); LONG / DEEP FRENZY (HUD clock = P.bkFrenzyMax, the plate tint ramp, drink cap).
4. Trait pairs one use each (TRAITS_SHIP on, trait worn, first-wear card at L20+): the worm pairs need BLOODWORMS slotted, WHOLE ROW needs BLOOD CHAIN, VOLLEY needs an EXSANGUINATE / BLOOD MOON that lands.
5. textfit: the 22 fork cards (names <= 14, what <= 96, teach <= 175), 10 trait cards, the strip, THE CROSSROADS rows ('CRIMSON FRENZY' is exactly 14).
6. Duel: EVEN L1 vs YOUR LEVEL with a forked Blood Knight (EVEN must play base).
7. Co-op / bots: bots take A on every rung; check the partner client draws a LONG / DEEP FRENZY clock without a crash (P.bkFrenzyMax).
8. ART OWED (effects in, greybox only): lance-shaped release for WARD LANCE, a meter that stops at 3 segments for SHORT TIERS, thicker / thinner mail tint, ring spikes wider than 22 px, a crimson line behind the step, per-side SFX. Flip FORKS_SHIP only after TRAITS_SHIP (folded OVERFLOW) and after bkrework merges and the re-point pass.

## n=6 power check plan (not run: no browser, a gate may own the machine)
n=6 WITH flasks, the 60-70% band, levels 30 and 50, on the rows bkrework named: Chieftain, Bog Troll, Hornet Queen (+ watch the Unburied Field at 92%). Order: (1) all A + default traits (deepRed / longPassing); (2) all B; (3) re-run the worse side to n=12 only if a side sits more than 8 points from the other. Re-run after bkrework merges (the drain and the requiem change the whole table).
Hand math (per use, one target): DEEP CUT 1.6x one foe vs SPRAY 0.7x per foe (parity at 2.3 foes: the crowd side is not the boss side, expect SPRAY to read lower on bosses); HEAVY EDGE x1.45 for 3.5 s costs 14% debt, LASTING x1.15 for 10 s: edge-score 1.58 vs 1.50 (B higher on a quick boss opening); THICK MAIL absorbs 1.9 per cooldown, THIN 2.25 but only if all three blows land inside 6 s; FRENZY haste-seconds A 7.15, B 5.6 plus the 20% drink; SHORT TIERS gives T3 in ~0.78 s (first to watch: a quick T3 spam vs FULL's T5 x1.15; expect SHORT to need a trim if it over-reads). Bot blind spots: the standard bot never kneels on the beat (SPIKE sides read low), rarely slots BLOOD MAIL / BLOODLETTING, and does not pick lash targets (CRIMSON REACH / REAP under-read).

## Questions (recs built; none blocking)
Q1 bkrework unmerged: build on master's Frenzy / lash / nova (done) and re-point after it lands? REC yes; the conflict sites are listed above, about half a lane. Alternative: merge bkrework first (it is code-only, unchecked in a browser).
Q2 The plan's NEW-MOVE sides (PLANT THE BLADE, PAY IT FORWARD's UP+C wave, MORTGAGE, REQUIEM UNBOUND / THE RECKONING) are not built under 'existing abilities only'. L38 / L43 are parameter forks of BLOOD PRICE / THE DEBT instead. REC accept; ask later if a real new-move lane wants them.
Q3 L43 sig = THE DEBT (forkplan), not the generic plunge the other heroes fork. REC keep (the ledger is his signature).
Q4 L27 B DEEP WARD is the folded OVERFLOW + 33% fill (passiveplan row 8), not forkplan's 'drunk blood repays DEBT'. REC keep.
Q5 LAST RITES is dead on master; its pair is rewired to the Frenzy. REC keep, or cut LAST RITES in the rework.
Q6 CRIMSON REACH is x2 lash reach (24 -> 48 px), not forkplan's 120 px (it would out-reach the T4 lunge). REC keep; widen only after the proof.
Q7 L48 crouch-spike forks (forkplan said 'lane'): built as ONE SPIKE / SPIKE RING. REC keep.
Q8 Skill forks (BLOODLETTING, BLOOD MAIL) read only while slotted; a BK with neither slotted gets the card and plays base. REC keep (as the Knight's Q4).
Q9 Heroaudit sec 5 clarity items (VITAE / DEBT HUD labels, the first-time card, ULT_NAMES.reaper) are another lane; this lane only reuses the nouns (DEBT = owed health, VITAE = frenzy fuel) on the L36 card. REC leave to the clarity / rework lane.
Q10 FLIP ORDER: TRAITS_SHIP first, then FORKS_SHIP (OVERFLOW only retires under the forks flag, and the ten trait pairs need worn traits). REC yes (the Warden's Q10).
Q11 Numbers to tune after the n=6: DRINKER x1.35 / MARTYR 0.75 + half the debt taken, HEAVY EDGE 0.14 / x1.45, THIN MAIL cd x0.8. REC leave to the tune lane (all are single constants in the main.js helpers / data).
