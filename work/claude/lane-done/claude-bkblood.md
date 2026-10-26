# LANE BKBLOOD (opus) - THE BLOOD KNIGHT'S BLOOD PASS, 2026-10-26

Brief: scratch/brief-bkblood-1023.md (Daniel 10-23, all recs picked except "armour gets bloodier" - skipped).
Branch claude/bkblood off claude/batch122 72bb1c7b. Worktree bracken-lanes/bracken-bkblood. Not merged, not deployed.

## What changed (src/blood-kit.js numbers + pure helpers, src/main.js hooks, src/chars.js pose, src/attack-animation.js, src/audio.js, src/level.js trial sign)
1. **LOUD, LONGER RALLY** - BLOOD DEBT `share 0.5 -> 0.6, cap 0.25 -> 0.3, drainT 3 -> 5 s, hold 0.45 -> 0.8 s, reclaim 0.45 -> 0.5, reclaimMin 1 -> 2`.
   Feedback on every reclaiming blow: a **blood stream** (drops fly out of the foe along an arc into him + the old tether, thicker), a wet **DRINK** (new SFX.bkDrink, deeper
   for more), a big **'+N'** (pale for a big drink). While he owes: a **HEARTBEAT** (SFX.bkHeart, 70 -> 140 bpm with the debt) and a **red screen-edge pulse** on each beat,
   scaled by the debt - off with REDUCE MOTION or flashes off. The debt segment is **brighter** (hatched #ff2a40/#ff6b78, pulsing white edge) and, the real bug, it is now
   **SEEN**: it sat under the HP number on the bar's end (see bkblood-rally-hud-before/after) - while he owes the number steps to the bar's head.
2. **BLOODY BASIC ATTACKS** - blood spray per landed blow by what is struck (flesh: blood; stone/steel/glass/shell/wood/constructs: sparks; bone/chitin/fungus: dark dust;
   blood-kit.js sprayKind), crimson trails kept (dk2b), the **dripping blade** at idle/walk (faster while he owes).
   **THE BLOOD LASH** = the rhythm's 3rd cut: the blade's blood whips out **+24 px past the steel** at chest height (late in the cut, lashBox), bleeds what it lands on
   (2 s), its own crack (SFX.bkLash), name pop, and its **own pose `bloodLash`** (B16: hauled high over the shoulder -> snapped level at the chest -> held at full stretch ->
   dropped dripping; greybox, art lane redraws). The third-cut hint now teaches it for him.
   **BLEEDING FOES** drip (existing) and feed the rally: his blow on a bleeding foe reclaims x1.25, each bleed tick wins 1 hp of debt back.
3. **VITAE** (folds his old BLOOD SURGE bar, `P.harvest`): fills ONLY from reclaimed health (every debtReclaim point; 60% of max hp reclaimed = full). Kills, blocks,
   culls and the nova no longer fill it (gainHarvest is a no-op). **CRIMSON FRENZY** (full VITAE, HOLD F - same input as the surge): 5 s, every landed blow reclaims
   ALL of itself, past the debt a lifesteal of 12% of the blow capped at 10% max hp a frenzy, the rhythm x1.2 faster, the debt does not drain, armour glow (aura + motes),
   HUD bar = the frenzy running out, label CRIMSON FRENZY. **No invulnerability, no resist (B15).** BLOOD SURGE (freeze + burst) is unbound (function kept, dead).
   Texts: hero card, key list, HUD prompt (HOLD F  FRENZY), trial meter sign + name. Teach-once hints: the rally (first real debt) and VITAE (first full bar).
4. Kept: Blood Price, Blood Step, parry/spike, tiers, Red Host.
5. Tools: tools/blood-kit.mjs extended (pure: rally numbers, bleed/frenzy reclaim, VITAE, steal cap, heartbeat, sprayKind, lash box; page: VITAE fills from reclaim only,
   not kills / debt-free cuts; heartbeat; frenzy on HOLD F, no inv, whole-blow reclaim, capped steal, ends; lash reaches past the steel, only the 3rd cut finds a far foe, bleeds).
   tools/boss-run.mjs reaper rows log `frz, stole, lash, bfed`. New tools/bkblood-shots.mjs (stills, runs on any branch). tools/hint-shown-silent.txt shrank by the BLOOD SURGE line.

## Numbers (Blood Knight, boss-rates practiced, profile human WITH flasks (kit), campaign level)
| row | BEFORE (72bb1c7b) | first build (share .65 cap .35 reclaim .6 vitae .5) | AFTER (shipped), seeds 1-12 + 13-24 | k/w/p today (n=6 each) |
|---|---|---|---|---|
| stockade L4 | 2/12 = 17% | 3/12 = 25% | 7/12 + 6/12 = **13/24 = 54%** | 2/6 5/6 3/6 = 56% |
| unburied L36 | 11/12 = 92% | 12/12 = 100% | 11/12 + 11/12 = **22/24 = 92%** | 82% (bkbot 10-23 ref) |
| waymeet L28 | 9/12 = 75% | 11/12 = 92% | 8/12 + 10/12 = **18/24 = 75%** | 4/6 5/6 4/6 = 72% |
Act I (n=8, after): wood 8/8, marsh 8/8, fenroad 8/8, spore 4/8 (spore before: 5/8 - same within noise). DRY (human+dry, n=6, after): stockade 1/6, unburied 6/6, waymeet 2/6
(bkbot dry ref 0/6, 4/6, 0/6). MASH (mash-bot, reaper x 6 seeds, stockade/unburied/waymeet boss + minis): **0/30** (every row DEAD).
Reclaimed per fight: 122 hp avg before -> 207 after (stockade/unburied/waymeet). Frenzy: 0-2 a fight (avg ~0.8), lash hits ~6 a fight, bleed feed ~20 hp a fight (unburied ~40).
Read: he is no longer the stockade's weakest (17% -> 54%, beside k/w/p 56%), and unchanged where he was high (unburied 92% = before; it is high for everyone; waymeet 75% =
before, k/w/p 72%). Not the strongest by a mile. The first, louder numbers put him at 100% / 92% - trimmed the rally numbers, the feedback is untouched.

## Checks run (one headless browser at a time, PORT 6603, free RAM checked before each - 4.2-6.7 GB)
GREEN: blood-kit (extended), unburied-fights, hint-shown, textfit hud,card,pick,store --strict (919 screens, 0 issues), textfit hints --strict, ability-poses (77/77),
mobile-perf (inside budget at 4x CPU), crouch-b, attack-animation, hero-roster, hero-trials, reaper-input, dk2, hud-default. Boss rates + mash above.
Not run: the full suite (by rule), pilots (no level changed), visual-supports etc. (no level geometry touched).

## Stills (scratch/lane-reports/bkblood-*.png, also work/claude/lane-done/bkblood-*.png)
lash-after (+ -b) vs lash-before (the old drag); frenzy, frenzy-start, frenzy-cut vs surge-before; rally-edge-after vs rally-before (the red edge on a heartbeat);
rally-hud-after vs rally-hud-before (the debt segment now visible); rally-drink-after vs -before (stream + '+8'). Regenerate: PORT=<p> node tools/bkblood-shots.mjs <dir> <prefix>.

## QUESTIONS FOR DANIEL (built the rec in each case)
1. CRIMSON FRENZY replaces BLOOD SURGE outright (no freeze-everything burst any more). REC: yes (the brief's "fold it"; it becomes ULT 1). Built.
2. "Every landed hit reclaims fully" read as: each blow wins back ALL of its own damage from the debt (not the whole segment per hit), plus a lifesteal past the debt capped
   at 10% max hp a frenzy. REC: keep (whole-segment-per-hit made every frenzy a full heal). Built.
3. HOLD F stays the trigger (same as the surge; a tap still casts the F skill). REC: keep. Built.
4. Rally numbers landed at share 0.6 / cap 0.3 / reclaim 0.5 (brief said ~0.6-0.7 / ~0.35) because 0.65 / 0.35 / 0.6 put him at 100% unburied, 92% waymeet. REC: keep the trim. Built.
5. While he owes, his HP number moves to the head of the bar (the debt segment was hidden under it). REC: keep. Built.
6. Heartbeat SOUND stays on in reduce-motion (only the screen edge turns off). REC: keep (it is audio, the cue that matters). Built.

## ART LIST for the follow-up sonnet art pass
- `bloodLash` pose (chars.js reaperBloodPoses): greybox 4 beats + rest - redraw with his crimson art (wind high over the shoulder, the snap, the full stretch, the drop).
- The lash whip itself (main.js drawBkBlood): a 1-3 px procedural ribbon - make it a proper sprite strip (a thick wet whip with a hot tip, a crack flash at full reach).
- The blood stream into him (bkStreams): 2 px drops along an arc - reads weakly in the dark Stockade; give it a ribbon/sprite and a splash at his chest.
- Frenzy armour glow: an ellipse aura + motes - should be a tint on the plate (drawTinted pass, red veins NOT picked - just a glow) + the helm lights flaring.
- The dripping blade: drip spawns at a fixed offset (P.x + face*9..12, P.y-3..6) - align to each idle/walk frame's blade point.
- VITAE HUD icon: still the little greatsword; a blood-drop / chalice icon would say VITAE.
- Blood spray by material: uses the shared chips(); a proper per-material decal (blood splats on the floor) would sell it.
- Re-measure after the art pass is not needed for rates (art only), but re-run tools/bkblood-shots.mjs for the stills.
