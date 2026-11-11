# KNIGHTFORK lane report (claude/knightfork from origin/claude/forkframe 7723e17ed) - 11-10

Code-only: no browser, no tools/check.mjs, nothing killed, nothing merged or deployed. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-knightfork, 3 commits (f8b321b73, 2b8b51b7b, 90fed2cd1), pushed to claude/knightfork. FORKS_SHIP stays false: flag off every new line reads `kb(id)` = `tech(id)` = the old card read, which is false for the new ids, so the Knight plays as the base (source-audited each edit; asserted in node for the data layer). With FORKS_SHIP on the Knight is COMPLETE: 11 rungs, 10 trait pairs, rider, bakes, one migration.

## Rung table (line numbers are src/main.js unless noted; data in src/forks-knight.js (L27/32/36/50) and src/forks-knight-rungs.js (the rest))
| L | key | A | B | effect code |
|---|---|---|---|---|
| 21 | dash | SHOULDER IN: dodge 0.8x length, shield shoves small foes it meets (reel 0.4 s, no dmg, once each) | SIDESTEP: dodge 0.75x length; a cut started within 0.2 s after it lands x1.2 | cast :11803 (shorten), shove + latch in chainTick (:10190 area), latch in startSwing, x1.2 in swingDmg |
| 22 | skill:shieldThrow | HEAVY SHIELD: 0.6x speed, x2.0, breaks the guard, no return cut (draws 1.3x) | TWIN SHIELDS: two shields fan +-60 px/s drift, x0.6 each way, both come home (new `thrown2`) | cast :11299; updateThrown now steps each shield through `thrownStep` :33291 |
| 24 | chain | SUNDER: the third cut (shield bash) x1.3, +0.08 s recovery, still breaks a guard | QUICK STEEL: the run is FOUR cuts (bash on the 4th), light cuts swing 1.15x faster | :12003 (recovery), swingMul in startSwing, `kRun()` :871 (run length: heavySwing, evade, riposte, flourish, flurry) |
| 27 | block | LONG GUARD (forkframe) | SHIELD ADVANCE (forkframe) | unchanged |
| 29 | skill:risingCut | HIGH CUT: vy -380, hold +0.6 s (`riseHold()` :876), one free air cut (canCut) | DRIVING CUT: vy -90 (no lift), no carry, foe driven away vx 300, +20% hit if a wall is within 4 tiles ("WALL SLAM") | risingCut cast + riseT block |
| 32 | heavy | PUNISH (forkframe) | LINK CUT (forkframe) | unchanged |
| 36 | spender | IRON LINKS (forkframe) | RALLY ORDERS (forkframe) | unchanged |
| 38 | skill:groundSlam | FAULT: one quake the way he faces, life x2, x1.15 | DOUBLE STOMP: two slams (second 0.3 s later, x0.65 each; second pops small foes up 0.5 s) | cast :11298, `stompTwo` :10189 |
| 43 | sig (plunge) | ANVIL: ground ring x1.5 wide, x1.3 dmg, +0.2 s recovery | SHIELD SURF: foe plunge x0.8 and the bounce 1.2x higher (chain counts) | plungeWave :31822, pogo site :12292 |
| 48 | skill:ironclad | IRON WALL: 4 s, blocks cost 0 stamina, dodge shut | IRON MARCH: 2.5 s, move x1.2, every non-perfect blow the shield takes = +1 link | cast :31528, block site :8533-8536, dodge gate, capW |
| 50 | ult | LONG CHARGE (forkframe) | BREAKING WHEEL (forkframe) | unchanged |

Kit rule held: all physical (shield, shove, quake, bounce); no beam, ring of light or flying slash (asserted on the text by tools/knight-forks.mjs). Boss law untouched: no resist pins, no invulnerability; HEAVY SHIELD / the shoves skip bosses and minis (`!e.maxHp && !e.mini`), the slam and rise use the old boss-aware paths.

## Baked / rider changes (nothing he had is simply lost)
- ENDURANCE rider (every hero, flag on): 20 ENDURANCE picks = skills cool 10% quicker (`cdOf` :880; THRESH.e[1] text becomes 'A SURGE; SKILLS COOL 10% FASTER' via a flag-aware getter in src/progression.js, 31 chars: textfit owed).
- GUARD STAMINA (ustam 15/25%) -> ENDURANCE 10 for the Knight: blocks cost 10% less (:8533).
- WHIRLWIND CALM (ucalm) -> the cooldown rider above. SHIELD TIMING (utime) -> CUT (as forkplan: free parry windows erase skill).
- DEEP SUNDER (usunder) -> chain A SUNDER (x1.3, which is also what the flag-off upgrade gave, rank II was x1.3). SHIELD THROW+ (uthrow) -> shield throw A HEAVY SHIELD. RISING CUT+ (urise) -> MIGHT: the ten upgrade levels (L27..49) are stat picks again, so the +20/40% is back as MIGHT picks. IRON LINKS / SECOND WIND (ukeep/uwind) -> spender A (forkframe).
- Save migration (src/forks.js, still one-shot on p.fork.knight.v, flag on only): new `KNIGHT_UP_FOLD`: a held DEEP SUNDER rank -> chain A, SHIELD THROW+ -> skill:shieldThrow A, before c.up is deleted (stat picks owed back as before). Fork picks for unreached rungs are harmless (read needs the level).
- PvP: `setPvpEvenForks` (src/forks.js) wired next to the traits one in src/pvp-duel.js: EVEN L1 = no forks, YOUR LEVEL = picks (the open item from forkframe is closed).

## Trait fork pairs (all 10 of his, key trait:<id>, open at L20 while WORN; reads need TRAITS_SHIP on too since "worn" is false otherwise; src/forks-knight-rungs.js, effects in main.js)
| trait | A | B |
|---|---|---|
| PLATED | IRON BACK: a blow covered from behind staggers whoever struck (0.6 s) :8536 | LIGHT PLATE: back cover only while moving (|vx|>20), no extra wind (`backCover` :872) |
| VENGEANCE | GRUDGE: keep up to 45, all spent on one cut :8537 | TITHE: keep up to 15, added to each cut of the run, spent on the bash |
| EVASION | LONG SLIP: the third-cut window after an evade 2 s not 1 :8416 | QUICK RETURN: evade every 0.35 s not 0.7, refund x2 |
| OPEN WOUND | DEEP WOUND: bleeds 4.5 s :9826 | FESTER: bleeds 2 s, +1 per tick |
| BULL RUSH | TRAMPLE: rush/charge reach x1.5 (`bashD` :873) | HALT: no extra reach, bash stagger x1.5 (`bashS`) |
| BOUNDING | RUNNING CLIMB: chain bonus +0.4 per link, cap x1.5 (`boundMul` :874) | SPRING BACK: no chain bonus, refund x2 |
| FLURRY | ALL LIGHT: every cut after the first costs 60% less (`flurryK` :875) | FREE FINISH: only the last cut (bash) is free (the old rank-III behaviour, made explicit) |
| UNBROKEN | LONG RUN: hold the run open x1.6 :31960 | GATHERING: past 6 cuts every cut x1.15 (swingDmg) |
| COUNTERSTROKE | HARD ANSWER: x1.3 (:8544, new `m` arg on counterCut) | TWICE OVER: two answers at 60% each (counterLand schedules the second) |
| ENDLESS SKY | HIGH SKY: air jump x1.25 :11943 | TWIN SKY: the air jump can be taken twice before landing |
FOLDED ids retired: NONE to retire for the Knight. His `folded` list is already empty (riposte went core in RECS158-d and the block fork A is LONG GUARD), so there is nothing to put in `retired`; passiveplan row 8 is satisfied by 'nothing folds'. His SHARED six are untouched.

## Node checks (all PASS)
Flag off (shipped): tools/forks.mjs (updated for 11 rungs / 10 trait pairs / 11-pip strip / 11-row board / TRAITS tab 10 rows / upgrade-fold migration), tools/knight-forks.mjs (NEW: 11 rungs on the ladder, 10 pairs one per trait, 42 unique side ids, name <= 14 / what <= 96, every side id read by main.js, no beam/ring wording, no ad-block-ish filename, flag off = base reads + old ENDURANCE text, flag on reads respect pick+level+slot / worn, PvP EVEN, migration folds + one-shot, effect-site source scan), tools/tech-cards.mjs, tools/progression.mjs, tools/coop-progress.mjs, tools/traits.mjs, tools/old-save-traits.mjs, node --check on main.js and every touched file. Flag ON (globalThis.location ?forks=on): progression, coop-progress, old-save-traits, traits pass (forks.mjs asserts the flag-off world, so it is not run on).
NOT run: tools/check.mjs, textfit, anything with a browser. The main.js effect code is therefore syntax-checked and source-audited, NOT played.

## Browser proof owed (sequential; lab ?forks=on&traits..., one browser at a time, >= 1500 MB free, no GATE/BROWSER-HOLD)
1. Flag OFF smoke: Knight L30 still gets SHIELD ADVANCE as a technique card; inn has no signpost; tools/knight-chain.mjs, tools/tavern.mjs, tools/unlocks.mjs spacing.
2. Flag ON fresh Knight (gainXp): one card per rung at 21,22,24,27,29,32,36,38,43,48,50 with the stat card first; no level deals two choice cards; the strip at 11 pips compact (A/B letters) and its width on 320x180.
3. Per side, one use each (bot-free, a dummy): SHOULDER IN reel + length; SIDESTEP x1.2 window (hit number); HEAVY SHIELD speed/guard-break/no return, TWIN SHIELDS two sprites and both return (watch the `thrown`/`thrown2` hand-off, the wheel ult still fires with `!thrown`); SUNDER recovery feel; QUICK STEEL four-cut run (bash on the 4th, riposte/evade still land on a bash); HIGH CUT free air cut; DRIVING CUT wall slam; FAULT length; DOUBLE STOMP second slam + pop; ANVIL ring; SHIELD SURF chain; IRON WALL (dodge shut, block free); IRON MARCH (+links).
4. THE CROSSROADS board with 11 rows + TRAITS tab 10 rows at 320x180 (4 rows + detail); locked rows; a trait pair opened by the first-wear card at L20+ with TRAITS_SHIP on.
5. Old-save migration live: real L35 and L50 Knight with DEEP SUNDER / SHIELD THROW+ ranks, flag on then off.
6. textfit: the 21 fork cards (names <= 14, what <= 96, teach <= 155 chars), THRESH 'A SURGE; SKILLS COOL 10% FASTER', the strip.
7. Duel: EVEN L1 vs YOUR LEVEL with a forked Knight (EVEN must play base).
8. Art owed (not built, per brief only data+effects): second shield sprite is the same sprite drawn twice (no copy art), horn prop for RALLY ORDERS, surf pose, wheel art, per-side SFX. Flip FORKS_SHIP only after these + the TRAITS_SHIP playtest.

## Knight power check plan (not run: no browser; the open knight-at-Crusader trait bisect is queued separately after the demo)
n=6 vs Crusader (with flasks, the 60-70% band), levels 30 and 50, in this order: (1) forks ON all A, traits as default; (2) all B; (3) the worse side re-run to n=12 only if a side sits more than 8 points off the other (forkplan rule: A/B within ~10% dps-equivalent). Hand math for the sides most likely off: SIDESTEP (+20% on one cut, only after a dodge) is the weakest dps side vs SHOULDER IN (utility): expect SHOULDER IN to need no tune. TWIN SHIELDS = 1.2x total dmg when both hit (x0.6 out + x0.6 back each) plus the return hits, vs HEAVY SHIELD x2.0 one way and no return: near parity on a lone target, TWIN better on groups. QUICK STEEL (+15% light cuts, bash every 4th) vs SUNDER (bash +30%): QUICK STEEL is the higher dps; first to watch. ANVIL (x1.3 ring) vs SURF (x0.8 chain): SURF can out-dps on a boss with a chain; watch it. Missing ustam/uthrow/usunder/urise effects are replaced by returned stat picks (about +10 picks of MIGHT/ENDURANCE), so the flag-on Knight is a bit stronger on stats and weaker on those specific boosts: compare before/after at L50.

## Questions (recs built; none blocking)
Q1 QUICK STEEL changes the run length to 4 for riposte/evade/flourish/flurry too (one `kRun()`). REC keep; if it feels wrong in the proof, revert to "15% quicker only" (one line).
Q2 FREE FINISH (flurry B) equals the old rank-III behaviour; ALL LIGHT is the new shape. REC keep (B = base is the safe side).
Q3 With TRAITS_SHIP off, no trait is "worn", so the 10 pairs sit dark even with FORKS_SHIP on. REC accept; they come alive together with TRAITS_SHIP.
Q4 SHIELD THROW forks apply only while the skill is slotted (skill fork rule); a Knight with no throw slotted gets the card but plays base. REC keep.
Q5 DRIVING CUT's wall check is "a solid tile within 4 tiles ahead of the foe", not a true collision. REC keep for now, refine if the proof shows false slams.
Q6 The upgrade levels become stat picks (plan) so flag-on Knights get ~10 extra picks; if the power check shows him too strong, cap the returned picks at 6. REC wait for the n=6.
Q7 TWIN SHIELDS reuse the same sprite (no copy art) and HEAVY SHIELD draws it 1.3x; real art stays on the knight art lane. REC yes.
