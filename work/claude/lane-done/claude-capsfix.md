# claude/capsfix - damage caps hold against the chain, riposte, broken and talent multipliers

Base origin/master 4fabe26c. Implements the REC of the damage-caps audit (10-11).

## What changed
- src/main.js hurtEnemy0: `wmD0` became `capD0, capFix`. The six early hooks (Wicker Man, Grandmother, Huntmaster, Colossus, Great Drill, Archmage) set them; the line before `e.hp -= dmg` is now `if (capFix && dmg > capD0) dmg = capFix(e, capD0, dmg)`, after every multiplier (chain x1.3, riposte x1.5, broken x1.5, quake / powder / launched, sunder, cutthroat x2, turncoat x2 ...). The safe bosses (counted inside wardedDamage / bossChip) are untouched.
- One fix per boss, same shape as the Wicker `H.fix`: `hush-hands.js H.fix` (purse; `e.pursed` marks that the purse path counted the blow), `huntmaster.js H.fix` (landed room = capLeft x openMul; `F.counted`), `glass-colossus-hands.js H.fix` (crack opening OR knee purse, `S.capKind` from `takeBlow out.cap`), `great-drill-hands.js H.fix` (jam), `main.js archFix` (duel opening 0.18 + the stage gate floor; `archCapE`). A fix that empties its room also closes the opening the way the boss's own hook does.
- Test hooks: `H.fight()` on the colossus and drill hands.
- tools/damage-caps.mjs (wired into tools/check.mjs after boss-openings): real bosses in the page, 12 full blows into one opening under four variants (chain 5 pips; + riposte opening; + poise-broken; + a x2 blow via `e.sunder`), asserts landed <= cap (+1 rounding) and that something landed, plus the Archmage gate floor. Covers Wicker, Colossus crack + knee, Drill jam, Huntmaster, Grandmother back + rap, Archmage duel + gate. Pre-fix it is red for Huntmaster (87 / 132 / 198 / 396 vs cap 67.5), Grandmother (up to 562 vs 96), Archmage (to 440 vs 164, gate -97); green after.

## Checks (PORT 8860, one at a time)
damage-caps, wicker-man, boss-fight-end, riposte, boss-openings, archmage-folly, minecart, rootway, underleaf (Grandmother), glasssea (Colossus), great-hound, boss-greed, boss-read: all green. Logs in bracken-lanes/capsfix-logs.

## QUESTIONS FOR DANIEL (rec / as built)
1. Kraken arms: they return `false` before the chain, so they take no chain / riposte / talents; only the stage-3 last cut re-enters. REC: leave (no flourish on arms). Built: untouched.
2. Whelp xpRole mini finisher: the whelp is NOT a mini anywhere (no `boss: 'whelp'`), so no bug there. The real instance is the ASSASSIN (mini in its level; spawn case has neither `mini` nor `maxHp`): it is finish-able (x2.2 / dmg = hp at <= 35%) before the ward. miniCap still clamps a normal blow, but a finisher could one-shot it. Not clearly a bug (a backstab on an assassin may be wanted), so NOT changed. REC: add `maxHp` to the assassin (or `FINISH_SKIP`) if you want its fight to be a fight.
3. Tide Herald `chipBy.herald = 0.2` is below the B15 0.4 floor (pre-existing, flagged in code). Unchanged.
4. The Archmage familiar eye (`e.fam`, a twelfth cap) is unreachable since folly3, so it is fixed in archFix but not tested.
