# claude/dkhero - DEATH KNIGHT HERO kit fixes (hero id 'reaper'; base claude/herobots 516c4cd2)

Measured with `PORT=8677 node tools/boss-rates.mjs <rows> --heroes=reaper --seeds=6` (profile human, normal health, campaign level). Noise is +-2 of 6.

## Changes
1. **Fair floorTell** (src/wicker-queen.js): 1.5 -> 1.66 s. NOTE: the herobots report said "0.59 s"; the repo's WQ.floorTell is 1.5 s (verified in the page). I applied the approved +0.16 s
   (0.59 -> 0.75). Findings: the floor is NOT the Death Knight's win lever - 1.9 s and 2.4 s cut floor damage (220 -> 98 hp over 3 fights at 2.4) but the other Queen mechanics took it back; 1.9 s cost the knight 5/6 -> 3/6 and the warden 6/6 -> 5/6. 1.66 is inside the noise for the others (fair: knight/warden/pyro 5/5/5 of 6 vs 5/6/6 before).
2. **Ward cuts the last 0.25 s of his swing** (src/commit.js `DK_WARD_CUT`, `swingLeft`; src/main.js ward raise). His recovery alone is only 0.10 s (swing 0.88 s art + 0.10), so "the last 0.25 s" is read as the last 0.25 s to free (art tail + recovery). The ward press cancels the swing (atk, atkRec cleared) and raises the ward; not for plunges, dash cuts or while hurt/rolling. tools/commitment.mjs: the reaper's `c` rows now expect the window at (art + recovery - 0.25 s) - a deliberate, approved change, the check is otherwise as strict (217 rows ok).
3. **Armoured swings**: ALREADY there for the swing itself (x0.75, "SWUNG THROUGH", no flinch). Added: the swing's recovery takes x0.75 too ("PLATE"), and both show a dark steel-plate flash (`P.plateFlash`, drawn as a #2a2634 tint). The recovery keeps his flinch and mercy window (making it fully armoured, 0.55 s inv, cost stockade 4/6 -> 1-2/6).
4. **Bone Armor + Soul Reap in the typical build** (src/bot-profile.js TYPICAL_SKILLS.reaper, SKILL_RANGE; src/lab-perceive.js makeSkillHands, v2 only via a new `v2` argument from src/lab.js). Bone Armor (L14) is cast when a tell is seen in reach; Soul Reap (L20) in reach. Never pressed while the blood bar is full (F is also the surge), warding, hurt or casting. Legacy profiles: byte-identical (hands still return for the reaper unless v2).

## Table (6 seeds, wins/6, Death Knight, practiced; built where the build has skills)
| row | before (herobots) | after practiced | after built |
|---|---|---|---|
| fair L25 | 0 | 0 (boss left 18-38%) | 1 |
| unburied L29 | 0 | 1 | 6 |
| stockade L3 | 4 | 4 (12-seed run: 6/12) | = (L3: no skills) 4 |
| marsh L3 | 4 | 4 (12 seeds: 10/12) | 4 |
| burning L3 | 2 | 2 (12 seeds: 5/12) | 2 |
| welltown L31 | 1 | 1 | 6 |
Knight/warden/pyro, practiced, 6 seeds: fair 5/5/5 (before 5/6/6; floorTell +0.16), unburied 6/6/6 (no change by construction: every other change is reaper-only).
Bone Armor + Soul Reap make the built Death Knight win Unburied and the Djinn 6/6 each (casts 5-7 of each a fight). The practiced (bare) bot stays at 0-1 on Fair/Unburied/Djinn: those are the "no build" floor.

## Checks run (all green): commitment (217 rows), ability-poses, starter-kits, wicker-queen, wicker-man, fair-folk, normal-health, small-adds, hero-trials. Not run: the full suite.

## QUESTIONS FOR DANIEL (recommendation first)
1. floorTell was 1.5 s, not 0.59: keep +0.16 (1.66, rec), or revert (it is not what moves the Death Knight on Fair)?
2. The Death Knight's practiced (bare) rate on Fair is still 0/6 (the boss is left at 18-38%); the built one is 1/6. A Queen-vs-slow-hero fix is a Queen change (the ring fire and the spear take as much as the floor): rec, leave it; a Death Knight at L25 is expected to carry Bone Armor and Soul Reap.
3. "Armoured swings x0.75" already existed for the swing itself; I extended it to the recovery. Say if you wanted the stronger (no-flinch) recovery - it measured worse.
