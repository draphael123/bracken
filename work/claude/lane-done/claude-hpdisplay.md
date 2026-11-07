# claude/hpdisplay - HP / DAMAGE DISPLAY /10 (Daniel 11-07 approved hpscale option A), sonnet lane, code-only
Branch claude/hpdisplay off master 95bc267a4, worktree bracken-hpdisplay. NOT merged, NOT deployed. No browser run (Daniel playtesting). Internals, saves, tuning: UNCHANGED.

## The rule (src/num-display.js, the ONE helper)
shownHp(n) / shownDmg(n) = n / 10: one decimal under 10 (a trailing .0 is dropped: 9, not 9.0), whole at 10+ (11.4 -> 11), a real amount never reads 0 (floors at 0.1). shownLabel(txt, col) = what a floater draws: a NUMBER or a signed digit string ('-14', '+28') is health/damage and is divided; words, unsigned counts ('3' countdowns) and coin gold (a number in #ffd34a) are left alone. Floater text stays the raw internal value in nums[] (merging, tools and popclutter still see internals); only the DRAW routes through numTxt().

## Every readout changed
1. Hero HP number on the HUD bar (normal and the Blood Knight debt placement), main.js ~37000: shownHp(P.hp).
2. Co-op / seat plate HP number (also the duel HUD, which mirrors hp onto the plates), main.js 1912.
3. Boss and mini bar numbers (BAR+NUMBERS) bossHpText: shownHp(cur)/shownHp(max). The % mode is unchanged (a percent).
4. ALL floating damage / heal numbers: one chokepoint, the number() draw sites (play view, map/store view, numBox for the clutter solver). Covers every '-'+dmg, '+'+heal, Math.round(dmg), burn ticks and the module calls (ctx.number from ~15 boss modules) with no per-site edits. One site changed at source: stockade-hands.js crush hit passed String(n); it now passes the number.
5. Level-up line (levelUpLine): '+N HEALTH' now shownHp.
6. Level card (drawCard): VIGOR 'what' '+8 HEALTH' -> '+0.8 HEALTH' (progression.js CARD, built from shownHp(8); hp:8 internal kept); the card's running total shownHp(gr.hp) + ' HEALTH'; the half-value line '+0.4 HEALTH (HALF)'. MIGHT (hpscale rec): number HIDDEN: 'HARDER BLOWS' / 'HARDER BLOWS (HALF)', its running-total line reads 'HARDER BLOWS' (damage:1 internal kept).
7. Store: HEART OF OAK '+2.5 max health'; KEEN / RAZOR / MASTERWORK / RUNED EDGE '+0.3 ... damage' (via shownHp(25) / shownHp(3)).
8. Hero blurbs: the store hero descs (9) and the hero picker LINES (9) 'N health' via shownHp (knight 10, pyro 8.8, paladin 12, pirate 9, reaper 9.5, warden 10, geomancer 9.5, berserker 11, ranger 11).
9. Skill info line 'HEAL 20% -> N HP' (rum) shownHp.
10. Skill catalog descs (progression-catalog.js, the 3 absolute numbers): SCATTER 6 damage -> 0.6; 'gives you back 8 health' -> 0.8; 'every coin mends 2 health' -> 0.2.
NOT changed on purpose: percent texts (flask 25/30/35/40% of health, '+10% MAX HEALTH', a tenth less damage), duel rules (HEALTH 50/100/150% is a percent), co-op/first-card prose, foe bars (no numbers), the flask COUNT, stamina, gold.

## Decisions
- Tiny floaters (0.3 raw): SHOWN, floored at 0.1 (never hide a hit; a burn tick of 2 reads 0.2). Sub-1 chip floaters (<1 raw) were already suppressed by the existing chipHit rule.
- Trailing .0 dropped (a hit of 10 reads 1, not 1.0). Say if you want '1.0'.
- Co-op reads the real seat-scaled number /10 (hpscale rec Q3).

## Checks run (node only; no browser, no suite)
node --check main.js, progression.js, progression-catalog.js, stockade-hands.js, num-display.js, check.mjs: ok. NEW tools/num-display.mjs (added to check.mjs's small-tool list): helper table (18 cases), floater labels (gold/counts/words untouched), readouts routed, VIGOR /10 + MIGHT hidden, internals unchanged, ceiling rule present: ok. Also green: first-cards, leveling, levelling, progression, tech-cards, shop-gates, coop-progress, rule-state, hint-shown, architecture, comments, hero-hp. No tool pinned an old HP string; tools/hud-default.mjs (browser) regexes widened to allow decimals ('4.5/390', '5.7'): OWED a run.

## 2. Design rule
Written: repo RULES-LEVELS-AND-BOSSES.md A13 'NO BOSS ABOVE 5,000 BASE HP' (tracked, survives) and scratch/design-standard.md B.6 (the doc briefs read; gitignored). There is NO existing boss-number/HP lint (boss HP lives in ~60 module constants plus main.js EHP, not importable in node), so no lint was extended; tools/num-display.mjs pins that A13 exists. Cheap lint for later: boss-rates already reads each boss's maxHp in the page, so a few lines in tools/boss-run.mjs (base = maxHp / (DIFF.bhp x (1+0.25T) x coop)) could flag a base over 5,000 (needs a browser lane). Ram Lord is 6,000 (src/ram-lord.js:20), the only live boss above the ceiling (Tomb King sits exactly at 5,000).

## 3. LANCE CUT - NOT TAKEN (stale premise, needs your word)
claude/lance6 (tip 22936f34e) is ALREADY an ancestor of master. Its HP cut (d2f63a7a9: 4650 -> 3000) merged, then Daniel REVERTED it on 11-05: commit aa07ec0e5 'lance146: EHP.lance 3000 -> 4650 (Daniel 11-05 feel; every lance6 mechanic kept)', from the priority lines '!! 11-05 15:05' and '!! 11-05 15:58' (stays at 4650 even with the bot at 33%; 4000 is the fallback). hpscale (11-07) read main.js:572's comment and thought the cut unmerged. So there is nothing to cherry-pick, and cutting again would overrule the 11-05 call. 4650 already satisfies the 5,000 ceiling and now reads about 544 on the bar (4650 x 1.17 / 10). Left at 4650.
Q: Lance at 3000 after /10, or keep 4650? REC: keep (4000 stays the fallback if the playtest feels hard). One-line change if yes: main.js EHP.lance.

## 4. RAM LORD n=6 measure plan (needs a browser lane; not run here)
Now: base 6000 (src/ram-lord.js:20), shows ~6,400 solo and reads ~640 after /10, at campaign L7 (hero ~138 HP). It was last banded at 3600 = 67% (claude-ramtune, n=12) before Ram Lord 3 raised it; the current rate is unverified.
1. BASELINE first (do not retune blind): PORT=8644 node tools/boss-rates.mjs scree --ways=practiced,built --seeds=6 --heroes=knight,warden,pyro --jobs=1 (flasks kit, profile human, normal) = 18 practiced + 18 built fights, one browser at a time, RAM >= 1500 MB. Read the band on the built way (60-70%, no hero at 0, fights 90-150 s).
2. If in band: leave it (only the ceiling rule objects: ask Daniel about 6000 vs 5000). If high (>70%): no cut. If low or too long: try 5000, then 4200: same command with the EHP.ram edit, n=6 per hero; add --adaptive --cap=12 --step=6 only where the interval spans a band edge.
3. Per candidate re-run: boss-read, boss-openings, ram-lord, ram-bank, scree-rework, boss-fight-end (the ramtune checklist), mash-bot scree 0/6.
4. Co-op: coop-boss-rates scree at 2 seats if a cut lands.
Rec: cut only if the baseline is outside the band; to meet the ceiling keep fight length 90-150 s by trimming openings' pay rather than base alone.

## OWED browser stills (headless, one at a time, RAM >= 1500 MB)
HUD (knight start reads 11; at 50% 5.7; Blood Knight debt placement; MINIMAL HUD), boss bar in BAR+NUMBERS mode (Hornet Queen ~40, Highcrown Queen ~390, Tomb King ~750; a 4-seat 2.4k fits the 8px row), floaters (a 108 hit reads 11; an 11 hit 1.1; a burn tick 0.2; a gold pickup still 10; a countdown 3/2/1 still whole; a '-14' hazard reads -1.4), level-up card (VIGOR / MIGHT / HALF line fit in two lines at 6px), level-up hint line, store (HEART OF OAK, KEEN EDGE), hero picker (health lines), skill info (rum). Run tools/hud-default.mjs, tools/textfit.mjs (cards, store, picker) and tools/popclutter.mjs once.

## Questions for Daniel (rec first)
1. Lance: keep 4650 (REC, your 11-05 word) or cut to 3000 after /10.
2. Trailing .0 dropped (a hit of 10 = '1'): keep (REC) or show '1.0'.
3. Prose with relative numbers is untouched; a full audit of every 'for N' phrase in skill descs can follow (REC: only if you spot one in playtest).
