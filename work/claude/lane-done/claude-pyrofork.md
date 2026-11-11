# PYROFORK lane report (claude/pyrofork from origin/claude/knightfork 028f1af9f) - 11-10

Code-only: no browser, no tools/check.mjs, no Chrome/CDP, nothing killed, nothing merged or deployed, no stash. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-pyrofork, pushed to claude/pyrofork. FORKS_SHIP stays false: every new read is `pyb(id)` = `isPyro() && FRK.forksShip() && forkOn(...)`, false with the flag off, so she plays as the base (audited line by line: every changed constant keeps its base value when pb is false, e.g. `* 1`, `(pyb() ? x : base)`; asserted in tools/pyro-forks.mjs). With the flag on she is COMPLETE: 11 rungs, 10 trait pairs, blaze/inferno retired, no migration owed. The Paladin and palfork data are untouched.

## Rung table (data src/forks-pyro.js; numbers PF in the same file; effect code src/main.js behind pyb('<id>'))
| L | key | A | B | effect code |
|---|---|---|---|---|
| 21 | dash | PHOENIX STEP: dodge x1.25 pace; small foes brushed get a pip + 1.5 s burn (bosses/minis not marked) | SMOKE STEP: dodge x0.8 long, +0.1 s untouchable, a puff at the start eats the first shot that crosses it | pace in updatePlayer (`isPyro() ? 300 * ...`), `pySmokeStart` after the dodge start, wake + puff in `pyTechTick` |
| 22 | skill:fireWall | RAMPART: two rows tall, 4 s | ROLLING WALL: walks 120 px in 1.5 s (80 px/s) | cast line (fires get `vx`, gen 3), fires loop `f.x += f.vx*dt` |
| 24 | chain | BELLOWS: third cut +5 heat (`pyHeatRaw`) | SPARK STAFF: each cut 2 pips, x0.85 | swingDmg, pyBlowStack |
| 27 | block (flame ward) | WARD NOVA: a parry bursts a ring r70, small foes x0.8 + a pip, boss only a pip | WARD SWALLOW: a parried SHOT is eaten, next ball within 6 s +1 size | ward `parried` hook -> `pyParryFork`; ball in `pyBallForks` |
| 29 | skill:wisp | GREAT WISP: x1.5, x1.2 speed, seeks from 125 px | THREE WISPS: lead + two orbiters (`wispX`, `pyWispX`), x0.5 each | cast, updateWisp, hit line (`wispK()`) |
| 32 | heavy (carried ball) | TRAILING EMBER: step 3-5 ball followed 0.25 s later by a free step-1 ember | GREAT BALL: +1 size step, pays the bigger step's stamina, x0.8 speed, wider burst | castFireball cost, `pyBallForks`, `pyTechTick` |
| 36 | spender (living-bomb pips) | SLOW FUSE: pips 10 s, burst +16 px | SHORT FUSE: burst on 2 pips, x0.7 (boss cap x0.7 too), -14 px, a common foe staggers 0.5 s | `lbNeed()` / `lbLife()`, pyStack, pyDetonate |
| 38 | skill:firestorm | ANCHORED STORM: 3 s ring (r90) stands where cast, 0.5 s ticks | WALKING STORM: follows her, x0.7 | `pyStormCast`, ticks in `pyTechTick` (greybox ring) |
| 43 | sig (heat bar) | WHITE HEAT: full bar holds +3 s | BELLOWED: heat comes 25% faster (hits, stoke, parry) and falls 25% faster | bankHeat, gainHeat, stokeTick, coolHeat |
| 48 | skill:flashover | SEARING FLASH: reach 90, burning foes pop x1.5 | CHAIN FLASH: pop x0.8, each popped foe lights foes within 60 px (4 s + a pip; a chain-lit foe is not popped in the same flash) | cast line, `pyChainFlash` |
| 50 | ult (METEOR FALL) | STAR FALL: tell 1.2 s, R88, x1.5, boss cap 5% / mini 12% | METEOR SHOWER: five small meteors 60-300 px ahead 0.3 s apart, snap to foes, boss cap 1.4% each, 2 pips each | castMeteorFall, meteorTick, `showerLand`, HUD word |
Kit rule held: only heat, pips, burn, the bar and fire. Boss law untouched: no pins, stagger sides skip bosses/minis (SHORT FUSE, ember shove), caps kept, nothing heals.

## Rider / bakes
- ENDURANCE rider (20 picks = skills cool 10% quicker): already global from KNIGHTFORK; applies to her unchanged.
- NO bakes and NO migration: on master she has no L25-L50 technique or upgrade cards (claude/pyropack was never merged), so nothing is lost and `migrateForks` is a no-op for her (asserted). Pyropack's KINDLING and eight upgrades are deliberately not carried (BELLOWS is the heat verb). WARD NOVA, TRAILING EMBER, WHITE HEAT, SLOW FUSE, PHOENIX STEP, STAR FALL, METEOR SHOWER were ported by hand from the donor (rules re-expressed in PF on the current 5-step ball code).
- FOLDED ids retired: blaze -> L43 WHITE HEAT, inferno -> L43 BELLOWED. `retired` is a flag-aware getter in src/traits-b.js: flag off they stay slottable folded traits (FOLD RULE, no gap); flag on they retire (kept in the catalog, never slot). phoenixTrail (merged into phoenix) is PHOENIX fork B; with HIGH RISE (A) the trail is off.

## Trait fork pairs (key trait:<id>, open at L20 while WORN; need TRAITS_SHIP on too)
| trait | A | B |
|---|---|---|
| EMBER SKIN | LONG EMBERS: attacker burns 4 s | COAL SHOVE: burns 1.5 s and is shoved back (not bosses) |
| HEAT SHIELD | EARLY SHIELD: works from 25 heat | DEEP SHIELD: only from 75 heat, cuts 40% |
| BRAND | MARKED TOO: a pipped foe counts as burning | SEARING BRAND: only burning, bonus +80% not +50% |
| EMBER HEART | CORNERED: under half hp, +30% | LAST EMBER: under a quarter hp, +100% |
| WILDFIRE | FAR LEAP: leap reach x1.6 | DOUBLE LEAP: a second leap |
| PHOENIX | HIGH RISE: revive hp x1.5, no dodge trail | PHOENIX TRAIL: revive hp x0.7, dodge leaves fire |
| LONG FLAME | LONG JET: jet x1.35 long | HOT JET: jet x0.9 long, ticks every 0.28 s not 0.4 |
| WALKING FLAME | SURE FOOT: full walk pace with the jet lit | HOVER: air fall held to 20, walk x0.7 |
| SCATTER | WIDE SCATTER: sparks reach 50 px not 30 | HEAVY SCATTER: sparks x2 |
| TWIN EMBER | LONG TWIN: second ember x1.5 | THREE EMBERS: a middle ember too, the extra two at x0.6 |

## Node checks (all PASS; nothing here starts a browser)
Flag off (shipped): tools/pyro-forks.mjs (NEW: 11 rungs on the ladder, skill keys = catalog skills, 10 pairs one per trait, 42 unique side ids, name <= 14 / what <= 96 / teach, no heal/pin/immunity wording, every side id read by main.js, fork hands + gating exist, no ad-block filename, flag off = base reads + blaze/inferno slottable, flag on reads respect pick+level+slot/worn, blaze/inferno retire, PvP EVEN off, owed queue/pick/swap/board/strip/bots/validation, no migration, boss-law caps + A/B parity math, showerPlan, flag-off source audit), tools/forks.mjs (one assert now uses warden as the no-fork hero), tools/knight-forks.mjs, tech-cards, progression, coop-progress, traits, old-save-traits, node --check on main.js and every touched file. Flag ON (globalThis.location ?forks=on): progression, coop-progress, old-save-traits, traits pass.
NOT run: tools/check.mjs, textfit, anything with a browser. The main.js effect code is syntax-checked and source-audited, NOT played.

## Shared-file edits (for the merge with claude/palfork; all additive, one-line style)
- src/forks.js: +1 import line (PYRO_FORKS) after the KNIGHT_FORKS import, +1 line `REG.pyro = PYRO_FORKS;` right after `const REG = {...}`. palfork touches the same two spots: keep both lines.
- src/traits-b.js: +1 import (forksShip); pyro `folded` ids renamed 'heat:' -> 'sig:'; pyro `retired` becomes `get retired()`. (traits.js Object.assign keeps the getter: asserted.)
- tools/forks.mjs line 56: `'pyro'` -> `'warden'` (the hero with no fork data); palfork may need the same on a different hero; pick any hero without forks.
- src/main.js (NO edits to tech/upg/kb/legacyTech/progression.js/crossroads.js/tavern.js): the PF import appended to the existing pyro-art import line (:106); a helper block (`pb`, lbNeed, lbLife, wispK, jwK, forked state) before `let IMPACT`; ~45 one-line substitutions at pyro-only sites (dodge pace, fire wall, fires loop, swingDmg + one pyro statement, pyBlowStack, ward parried hook, heat gain/cool/stoke/bank, castFireball, pyStack/pyDetonate, wisp, firestorm, flashover, meteor, HUD word, ten trait sites); new functions before drawPyroKit; four greybox draw lines in drawPyroKit. The one line palfork could also touch: swingDmg's `let extra = 0, mul = 1;`.
- NEW: src/forks-pyro.js (data + PF numbers + showerPlan), tools/pyro-forks.mjs.

## Browser proof owed (sequential; lab ?forks=on&traits..., one browser at a time, >= 1500 MB free, no GATE-RUNNING / BROWSER-HOLD)
1. Flag OFF smoke: pyro L30 plays as before (tools/pyro-kit.mjs, ember-flare, flame-ward asserts, hero-trials 'meter'); no inn signpost.
2. Flag ON fresh Pyromancer (gainXp): one fork card per rung at 21,22,24,27,29,32,36,38,43,48,50, stat card first, no level deals two choice cards; the 11-pip strip; blaze/inferno gone from the TRAITS list.
3. Per side, one use each on a dummy: PHOENIX STEP distance vs walls/gaps + wake pips; SMOKE STEP puff eats a shot (and the i-frame feel); RAMPART two rows / ROLLING WALL path on slopes; BELLOWS heat on the third cut; SPARK STAFF 2 pips; WARD NOVA ring on a real parry; WARD SWALLOW (confirm the shot parry reaches the hook with f null); GREAT WISP vs THREE WISPS (extras are greybox); TRAILING EMBER spacing; GREAT BALL cost/size/speed; SLOW vs SHORT FUSE (pips strip draws 3 slots); ANCHORED vs WALKING STORM (ring is greybox); WHITE HEAT hold, BELLOWED rates; SEARING vs CHAIN FLASH; STAR FALL ring readability; METEOR SHOWER placement on uneven ground.
4. THE CROSSROADS board with 11 rows + TRAITS tab 10 rows at 320x180; first-wear trait card at L20+ with TRAITS_SHIP on.
5. Old-save: a real L25/L50 pyro save loads with the flag on then off (no p.fork read off); blaze/inferno equipped in a TRAITS-on save when the flag flips.
6. textfit: the 21 fork cards (names <= 14, what <= 96, teach), the HUD word 'METEOR SHOWER: UP + C', the strip.
7. Duel: EVEN L1 vs YOUR LEVEL with a forked pyro (EVEN must play base).
8. Art owed (not built): extra wisp sprites, wall roll fx, smoke puff art, storm ring art, shower/star meteors (placeholders reuse the meteor ring/body), per-side SFX, capstone preview clip.

## n=6 power check plan (not run: no browser; after the gate/demo, one browser at a time)
Pyro sits about 80-85% on bosses with flasks (Daniel 11-04), so the risk is a side that pushes her over the 60-70 band, not under. n=6 vs Stockade, Warcairn and the Rookery (flasks, practiced), at L30 and L50: (1) all A; (2) all B; (3) re-run a side to n=12 only if A and B sit more than 8 points apart. Hand math, first to watch: SPARK STAFF (cuts x0.85 but a burst every 2nd cut, about +25% bursts; boss bursts capped 3%/4.5% each) is the strongest boss side at rung 24. SHORT FUSE is damage-neutral per pip by design (0.35 vs 0.333 per pip) and its boss cap scales x0.7, so bursts do not out-cap. STAR FALL (5% cap, R88) vs SHOWER (a lone boss catches about 2 of 5 at 1.4% = 2.8%): STAR higher on a boss, SHOWER higher on packs. ANCHORED STORM adds about 6 ticks of 3 x amul per foe: the biggest add on a pack, small on a boss (resist floor applies). GREAT BALL is a strict damage upgrade that pays one step more stamina and flies 20% slower: if it sits 8+ points over TRAILING EMBER give it a longer hold. Flag-on is strictly additive for her (no kit existed before), so expect +3 to +8 points on bosses; if the all-A or all-B run lands above 70, trim the ANCHORED STORM tick k first.

## Questions (recs built, none blocking)
Q1 SMOKE STEP: forkplan said the puff lets "shots pass through"; built as the puff clears the first hostile shot that crosses it (1.2 s). REC keep.
Q2 FIRESTORM and FLASHOVER are instant bursts on master, not storms: both FIRESTORM sides ADD a 3 s ring after the base burst rather than rebuilding the skill. REC keep; trim in the n=6.
Q3 GREAT BALL pays the stamina of the bigger step. REC keep.
Q4 blaze/inferno retire with the flag (a worn one is dropped when FORKS_SHIP flips). REC yes (FOLD RULE: the L43 sig fork ships its sides).
Q5 She has no L25-L50 kit on master, so flag-on is purely additive and pyropack's KINDLING and eight upgrades are NOT carried. REC accept.
Q6 WARD SWALLOW fires on a parry where the ward melts a shot (parry(p, null)); a blow through takes() with a foe in reach counts as a foe parry and does not swallow. REC accept.
Q7 PHOENIX: HIGH RISE (A) switches the old dodge trail off; PHOENIX TRAIL (B) pays 30% less revive hp. REC keep.
Q8 The dash forks are the plain DODGE only, not the CINDER STEP skill. REC keep.
Q9 SHORT FUSE shows pips on 3 slots (the third reads empty at need 2). REC accept; a one-line art fix in PA.pips if it reads wrong.
