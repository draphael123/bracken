# LATE-GAME LANE B - FOES HARDER BY ACT VIA SMARTER / MIXED PACKS (claude/lategameb, sonnet, 10-31)

Base master 416af6c2. Code + static tests only (a release gate was running: no headless browser was started). Nothing merged or deployed. Lane A (claude/lategamea: hero taper, mitigation floor, skill k) touches progression / survival / skill-k / berserker / ranger and the skill sites of main.js; this lane touches only foe-side files and small hook lines in main.js, so there is no logical overlap (main.js will merge textually, different regions).

## WHAT CHANGED PER ACT

### The dial (data, all acts)
- PURSE (src/foe-react.js ACTS.cap): 2 / 2 / 2 / 3 / 3 -> **2 / 2 / 3 / 3 / 4** (act III three attackers, act V four).
- AFFIX DENSITY (src/foe-pass.js AFFIX_ACT): 0 / .15 / .20 / .25 / .30 -> **0 / .15 / .25 / .40 / .50** (+ .50 / .55 / .60 for the three later arcs; densityOf still caps a level at .60).
- **ACTS III-V WERE NOT LIVE AT ALL.** FOEPASS (pursuit, archer lead, affixes) listed only act I-II levels, so the sea, the old kingdom and the desert stood no lever - the real reason the walker read 0.1 deaths a run in act III. All 29 levels of acts III-V now carry `{ pursue, lead, affix }` (one shared LATE row; delete a level's row to take it back out).
- THE THREE LATER ARCS: `ACTS_LATE` (frost 3.75 / hp 1.15 / purse 4, volcano 4.5 / 1.2 / 4, demon 5.25 / 1.3 / 5, empty `levels` until those levels exist; `actOf` reads them). Kept out of ACTS because act-cards / secrets / curve tools need a level in every ACTS row.
- ROSTER act V: second front kind = construct, third heavy = mummy (kinds the game already spawns). A ksar plate-bearer / brass-scorpion variant would be content (see questions).

### Act III (the sea) - src/foe-glue.js (new), hooked from main.js
- **TIDEGUARD PLATE STEP**: beside a winding scout / netter / marine (or with the hero on top of it) and the hero closing, the tideguard steps in front of its partner and PLANTS its plate 1.2 s: the front turns every light cut ("COVERED"), and a skill / AoE / projectile off the front lands at 0.2. A heavy blow breaks it (reel), a sweep goes under, behind it there is none; then a 0.55 s recovery with the plate down (the opening). Word PLATE STEP, plate drawn.
- **SCOUT RECALL LINE**: a harpoon that missed (stuck, rolled) is not spent: a taut dotted line from the scout, a yellow !, 0.5 s later the harpoon is HAULED BACK along it as a real seed (same blockable harpoon damage). Struck / parried / reflected harpoons are not recalled; kill or stagger the scout and the line goes slack; never chains.
- **SCOUT HOLD FIRE**: a scout with a tideguard / watch beside it throws only once that front is on the hero (<=3.5 s, then it throws anyway). Front first, back second.

### Act IV (the old kingdom)
- **ZOMBIE CLINCH**: a landed grab snares 1.1 s (was 0.75; mash or turn to break it, P.snare) and a held hero is the **apprentice's** cue: his told EMBER (0.65 s) comes at once (3.2 s gap). src/buried-dead.js.
- **ARMOUR WHIRL**: the Warden Armour's elite WHIRL promoted to the base suit (37 placements, one move before): red !! 0.8 s tell, spin 0.85 s at 85 px/s, 1.25 x armour damage, unturnable (roll away / through), 1.2 s dizzy opening; used from act IV when the hero is crowded or every third blow. Marks rows already existed (armour|ekWhirlTell).
- **ARCHER PIN SHOT** (act IV+, archer / bone archer / crossbow): an arrow that was ROLLED brings the next draw at once (rest skipped) with the shot led (the existing lead machinery); told as ever (draw !), word PIN SHOT, 4.5 s gap.

### Act V (the desert)
- **SHIELD BRACE FOR AN ARCHER / SLINGER** (act V): shield, hero in front, archer or slinger drawing behind it within 110 px -> the shield plants 1.4 s (full front guard like the plate, 0.6 s recovery). The act's one front kind now covers a bow, and a braced front is the "AoE-resistant front": whirlwind / rain of spears do not clear a braced pack.
- **CUTTHROAT SIDE-STEP COMBO**: every SECOND feint he rolls PAST the hero (harmless, touch rule), turns and cuts low from behind: a red !! 0.5 s tell, unturnable, JUMP. First feint still ends in the plain slash (old lesson kept). Plain act-V cutthroats only (not the Ksar's posted men, not reskins), only with ground to land on.
- **THE PAIR**: when a packmate cutthroat is feinting, this one does not feint - it throws a LOW cut (red !!, jump). Block the high, jump the low.
- **SCORPION CLAW-STING COMBO**: a claw the shield TURNED is followed at once by the tail (red X, 0.5 s instead of 0.75). Hold the shield and the second beat is the one you move for.

## FOE MOVES ADDED (12): plate step, recall line, hold fire, clinch, apprentice-on-held, armour whirl, pin shot, brace, side-step combo, pair low cut, claw-sting combo (+ roster). Every one is told (word, drawn guard / line, mark row) and ends in an opening; none adds health.

## TESTS RUN (all static, no browser)
- NEW tools/foe-glue.mjs (wired into tools/check.mjs): stance machine + gates (act, elite, ledge, stagger, partner, side, far hero, cooldown), turns / take / heavy-breaks, recall (miss, hit, reflect, slack, no chain), hold fire (max 3.5 s), pin shot (window, act, elite), cutthroat / scorpion / zombie / armour / marks rows / dial values / main.js hook text. PASS.
- tools/tells.mjs (427 tells, table regenerated with --write: 60-line mechanical reflow of the generated MARK table + 4 new rows), answer-tags, blow-tags (GLU.take listed in NOT_BOSS), foe-pass, curve-shape, act-cards, caravan, bandits (one assertion widened: the real blow behind a feint can now be the back-cut), undead-moves, combat-feel, sprinkle-cap, architecture, comments, mash-gate, curve-gate (report-only), desert-foes art, level-quality, elites: PASS.
- tools/combat-part2.mjs and attack-tokens.mjs expectations updated to the new purse (browser tests, NOT run).
- NEW tools/pack-mix.mjs (report only): 446 designed squads in acts III-V, 85% are ONE role (a front with a back is the cheap fix for the level lanes).

## STILL NEEDS A BROWSER (none done)
1. **Walker / curve** (tools/level-walk.mjs, walk-curve.json) for every act III-V level: purse 3 / 3 / 4, affixes 25 / 40 / 50 %, pursuit + lead are all new at once. Targets: arrival A3 71 -> ~55 %, A4 78 -> ~50 %, A5 68 -> ~45 %; deaths 1.5-2.5 / 2-3 / 2.5-3.5. Expect to back individual levels down (FOEPASS rows, like scree / crown 0.1) - burning and kings were backed off the same way in act I.
2. **fodder-tuning** (tools/fodder-tuning.mjs) for tideguard, scout, shield, archer, armour, zombie, cutthroat, scorpion (new moves + affix density change time-to-kill and hits taken).
3. **mash-gate / pilots / combat-part2 / attack-tokens / foe-pass-page / mark-integrity / told-sweep12 / untold-told / caravan pages** in a browser (mash rows: shield / tideguard braced = a mashed hero meets 100 % turns now).
4. **Boss rates**: no boss changed. But boss rooms with common adds (harbor / flotilla / hurricane / welltown / sealedpyramid / ksar waves) now carry affixes and bigger purses: re-run tools/boss-rates.mjs (profile human) for bosses with common adds in acts III-V.
5. Look at the new poses: cutthroat roll-past reuses the feint frame; the base armour whirl has no spin pose of its own (alternates raised / swing frames); the plate and brace are drawn as bars (greybox). Art lane if Daniel likes them.

## NOT BUILT (and why)
- **Elite density** (one elite per two combat rooms from act IV, one per room in act V): placement is hand-set per level (ELITES / AFFIX_AT) and needs the walker per level; I did not blind-place. See question 2.
- netter CORD PULL, sailor HOOK DRAG, slinger CROSS PAIR, eel TAIL FLIP, cutlass lunge-stab, bonearcher skull-lob, hound pounce-hold: the audit's second tier, not in the folded list.
- THIN BOSSES / minis (Lantern-Eater, Gargoyle, Buried Prince, Bog Troll, Serjeant, Foreman, Sexton): queued after the reworks per Daniel; not this lane.

## QUESTIONS FOR DANIEL (recommended answer first; what I built)
1. Enable pursuit + lead + affixes on ALL 29 act III-V levels at once? REC: yes, then the act sweeps back off any level that fails the walker (as burning / kings / scree). BUILT: all on.
2. Elite density from act IV (1 per 2 combat rooms; 1 per room in act V)? REC: yes, as a level-lane job per act with the walker, not blind placement. BUILT: nothing; the affix density rise carries the "elite" feel for now.
3. Brace gate: act V only (your list) or from act IV (swornsword / archer packs)? REC: act V first, widen after the walker. BUILT: act V.
4. Pin shot / plate step also for the hero-boss-room adds? REC: no. BUILT: commons only (elite, mini, boss never take a stance).
5. A second act-V front kind as content (ksar plate-bearer as its own kind, brass scorpion)? REC: yes, one content lane after the walker. BUILT: roster data only (construct front, mummy heavy).
6. Ksar's posted cutthroats and the reskinned bandits keep the old feint-slash for now (combo skips cnSkin / ks). REC: add them with the Ksar pass. BUILT: plain cutthroats only.
