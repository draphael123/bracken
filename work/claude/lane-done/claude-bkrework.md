# BKREWORK lane report (11-04) - claude/bkrework, worktree bracken-bkrework, base claude/batch143 e9f7015c
Branch tip: `git -C bracken-bkrework log -1` (this report is committed last). NOT merged, NOT deployed. CODE-FIRST: no browser was launched (suite running; before 19:00).
Plan: scratch/plan-bloodknight-1103.md (all 6 recs approved 11-03 12:05) + addendum (distinct DEBT-DRAIN 3rd hit).

## Built vs plan
| plan | built | where |
|---|---|---|
| 1a THE LONG RALLY | hold 2.0 s / drain 8 s, share 0.7, cap 0.4, min per blow 4 | blood-kit.js BLOOD.debt |
| 1b debt holds while the BLOOD WARD is up | debtStep freeze: `P.wardHeld>0 \|\| P.warding` (and through HEMORRHAGE) | main.js ~10569 |
| 1c reward by weight | BLOOD.reclaimW light 0.6 / third 0.9 / heavy 1.0; T4/T5 empower heal 0.5 -> 0.75; `reclaimOf(dmg,{weight,hem,bleeding})` | blood-kit.js, main.js bkReclaim/dkLanded |
| 1d THE ANSWER | first cut (combo 1) out of a debt >= 3% maxHp, once per new debt (`debtAdd` re-arms p.bkAnswered): 32 px over 0.15 s with the swing, no i-frames, swing/walk speed unchanged; says 'THE ANSWER' | main.js bkSwingStart + swing loop |
| addendum: DEBT DRAIN 3rd hit | the rhythm's third cut (it was the BLOOD LASH cut) is now DEBT DRAIN: reclaim weight 0.9, x1.15 blow on top of the third cut's 1.5, bleed 2 -> total 2 s on the whip, name pop, its own SFX (bkDebtDrain), VITAE +6, existing bloodLash pose + whip | BLOOD.drain3, main.js |
| 2 VITAE from offence | per 0.6 -> 0.35; landed rhythm cut +4, third +6, held heavy +6/8/10/12/14 by tier, parry/spike +20, ward-held blow +3 (one cut per swing); gainHarvest stays a no-op for legacy callers | blood-kit.js BLOOD.vitae.gain/vitaeGain, main.js bkVitae |
| 3 RED REQUIEM | UP+C at full VITAE, grounded (ultRegister('reaper'), ULT_NAMES/NEEDS). 0.45 s told windup (breakable by a hit: no meter spent), geyser column + 110 px ring, swordDmg x k 6 (skill-k.js K_BK.redRequiem, via hurtAs('heavy') so boss floors apply); commons stagger 1.2 s + bleed 4 s; bosses/minis no stagger; HEMORRHAGE 8 s on every foe hit: his blows x1.25 + reclaim ALL, debt does not drain, brand drawn on the foe; UNFLINCHING to light blows (<=15% maxHp) for 8 s with NO resist and no i-frames; VITAE bar = the 8 s clock. HOLD F inert (F = plain skill tap). Frenzy code removed. | main.js bkRequiem*, swingDmg, damagePlayer0 |
| 4 punishment | HP 95 -> 105, swing stamina 23 -> 18, dodge 25 -> 22, WARD_PRICE 0.35 -> 0.25. Light recovery untouched. Hidden per-boss handicap rows NOT touched (TUNE lane). | progression.js, commit.js, main.js |
| Q6 heal sources 7 -> 3 | NOVA_HEAL 0 and the nova heal block deleted; frenzy steal gone with Frenzy; BLOODLETTER (perk 'leech') heals no Blood Knight; (leech 7% was already gone). Remaining: rally, flask, parry/spike reclaim-all | main.js |
| texts | hero card (105 HP, 2 s/8 s, DEBT DRAIN, ANSWER, REQUIEM), DK_KEYS + HUD prompt, BK_TEACH, trial meter sign, controls card (no SURGE; ULT row via ULT_NAMES), MOVE_WORDS, trialName | main.js, level.js, controls.js |
| bot | lab.js ULT_BOT reaper: UP+C at full VITAE with a foe < 90 px; HOLD F bot lines removed | lab.js |
Also tools: balance.mjs reaper hp 105; commitment.mjs roll cost 22.

## Checks run (node only)
node --check on every touched file: green. `node tools/blood-rework.mjs` (NEW, node only; pure rules + source wiring, incl. "a first light cut 1.2 s after a hit wins back >= 9 of an 11.2 segment"): green. The pure half of tools/blood-kit.mjs (run sliced, no page): green.

## Placeholders (ART lane next week)
- Requiem pose: reuses the 'blast' frames (blastT); geyser = 3 BLOOD SPIKE tongues + 40 particles + rings; HEMORRHAGE brand = a 5x6 px red drop over the foe; unflinching tint = the old frenzy plate tint; helm flare = the old frenzy flare.
- DEBT DRAIN: the existing bloodLash third-cut pose + whip (a dedicated heavier pose frame is owed).
- THE ANSWER: no smear frame (number + streaks only).
- SFX bkToll / bkRequiem / bkDebtDrain are quick synth placeholders in audio.js.
- VITAE chalice HUD icon still owed (unchanged drop icon).

## OWED browser checks (after 19:00 / art + tune lanes)
tools/blood-kit.mjs full page run (edited, UNVERIFIED: the new requiem/answer page cases are written blind); reaper-input; hero-trials; hint-shown; textfit hud/card/hints --strict (the hero card text grew); ability-poses; commitment (reaper mash count may rise with stamina 18 - MASH_MAX reaper 9 untouched); a real look at Requiem (windup, geyser, brand, bar clock), THE ANSWER step, DEBT DRAIN on a Stockade run; bot win-rates (TUNE: n=6 Chieftain / Bog Troll / Hornet Queen with flasks, mash-bot sanity, Unburied 92% watch).

## Questions for Daniel (recommended first)
1. VITAE pace: the plan's table fills ~21 cuts (a chain = 4+4+6 = 14 per 3 cuts), not the plan's ~14. Rec: leave for the TUNE lane to raise cut 4 -> 5 / third 6 -> 8 if the bot shows < 2 Requiems a fight. Alt: raise now.
2. DRAIN (the Red Host spell) still heals `over` 0.4 of a tick past the debt = a 4th heal source. Rec: set BLOOD.host.drain.over to 0 in TUNE (3 sources exactly). Alt: keep.
3. BLOODLETTER is a global perk; I switched it off for the Blood Knight only (other heroes keep it). Rec: keep that. Alt: delete the perk for all.
4. With the nova heal gone, the DEEP DRAW perk and DEEP RED talent have no heal to boost (the L25-50 BK opus lane should re-point them). Rec: yes, in that lane.
5. UNFLINCHING cutoff: "light blow" = <= 15% of max hp. Rec: keep. Alt: only blows <= 10.
