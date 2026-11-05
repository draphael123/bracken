# SKYTUNE (lane S5, Sonnet) - the Demon King sky fight tuned in bossLab (branch claude/skytune)
Not merged, not deployed. Base: claude/reflectkit (b2f7e06bf) + claude/skyart (3748698e) merged (one conflict, the HUD bar y: kept y 19 from S3 plus S4's painted bar).
BOSSLAB COULD NOT RUN THE KING: skylab has no arena and bossLab had no bot for him. Built both (tools only + lab, no game logic): see "Changes".

## Win rate (bossLab via tools/boss-rates.mjs skylab, hero L40, flasks 'kit', human profile, normal, practiced way)
Final numbers (commit below), n=6 a hero: knight 5/6, warden 3/6, pyro 3/6 = 11/18 = 61% [39-80] -> IN BAND (60-70), every hero >= 50% (floor 40 met).
Same numbers before the last P3 soften (seeds 1-12 at bar 550, 18-24 at bar 580): knight 8/12 + 4/6, warden 9/12 + 2/6, pyro 5/12 + 1/6 (pyro 33% in the 24 fights that fell under the floor; that is what the P3 soften fixed: she died at ~30% left, right as P3 began).
Path (pooled n=18 each): start 6% (knight 1/6) -> found the real killers (the imps' bolt did 84 a hit; the king's own bolts were 9) -> 17% -> 33% -> 28% -> 61%.
MASH BOT (tools/mash-bot.mjs, MASH_LEVEL=40, knight/warden/pyro x 2): 0/6, dead in 78-98 s with the king at 94-98%.
CO-OP with an AI partner (tools/sky-coop.mjs, BK.aiComp.arm): THE PARTNER TRIVIALISES IT. Solo 61%; knight+warden AI 6/6 in 60-107 s (health scale only, DK.coop x1); pyro+knight AI 6/6. With the extra bar built (below, x2.2 on top of Daniel's scale) pyro+knight: 6/6 in 123-222 s (P1's damage taken 44-373). x1.8: 12/12 at 110-195 s; x2.8: 9/12 with 3 timeouts at 240 s (too long). x2.2 is the interpolated rec, only the pyro seat re-measured.
Fights (solo wins) 50-150 s; plan 120-170 s. Shorter than planned: the knight kills him in ~60-90 s when he reads it.

## Changes (numbers only, no new moves)
src/demon-king.js DK: bar 1200 -> 580 (x(1+0.25x2.8) x0.9 normal bhp = ~890 a bar in game); rest between moves 1.05/.85/.7 -> 1.4/1.25/1.1 s; downed 4.5/4.0/3.6 -> 6.0/5.5/5.0 s; bolt dmg 11 -> 10; swoop 15 -> 14; whip 16 -> 15; bomb 13 -> 10 and every 5.0 -> 6.0 s; imp bolt 1.2 (new use), imp cooldown 7 -> 9 s; `coop.hp` [1,1,2.2,2.8,3.4] (new).
 - KEY FINDING: the king's blows run through damagePlayer with no boss-pressure scaling (he is not `boss`/bossActive) so a bolt landed ~9-17 against a 264-276 hp hero; the real killer was the existing imp foe's bolt at the act-7 dial (84). Imp bolts now take DK.imps.dmg (main.js one-liner + `impDmg()` in the hands) so the tune owns them.
src/demon-king-hands.js: spawn scales the bar by DK.coop.hp[seats]; `impDmg()`.
src/main.js: TIER skylab 3.4, TIER_BOSS skylab 2.8 (as drakelab's rows); the king's `scale()` now also takes the mode's bhp and coopMul() (every other boss bar already does - the king was missing both: Daniel's co-op scale 2/2.6/3.2 -> the game's 1.5 at 2 seats applies to him now); imp-bolt dmg hook. src/foe-react.js: ACTS_LATE act 7 lists 'skylab' (dmg 4.5).
src/lab.js (bossLab): arena-less skylab row (A = demonking, hero stays on the back); a `demonking` bot branch: swings a bolt back 75% / guards it 20% (held C for shield heroes, a deflect tap for the warden, a roll for the rest) / misses 5% (once per bolt, human-fallible), reads 85% of swoops/whips/bombs, ducks swoop+high whip, jumps low whip, steps off bomb rings, stands still from a swoop/whip tell, runs to him and cuts while DOWNED, cuts imps in P3; ends when f.beaten. Per-hero reach table DK_REACH (warden 32, pyro 110).
tools: mash-bot.mjs (MASH_LEVEL=N and the sky row), sky-probe.mjs (one fight + mode ledger + hit log: HERO= SEED= HITLOG=1), sky-coop.mjs (the AI-partner runner), demon-king.mjs (hard-coded 1200s now read DK.bar; "knockdowns are the fight" median >= 3, was 6: the bars are smaller), reflect-kit.mjs (the imp-hook string).

## Checks
node: demon-king 262 ok; reflect-kit 183 ok; sky-mount 175 ok; sky-art 89 checked 0 bad; goblin-lint, one-new-foe, architecture, foe-glue, boss-rows, level-quality exit 0; node --check main/lab/demon-king(+hands)/boss-rates.
browser (one headless at a time, 3-4.4 GB free, memguard not needed): boss-rates (above), mash-bot, sky-coop, tools/reflect-probe.mjs -> ok after the tune (every hero's returns/power/guard rows).
Not run: tools/check.mjs, tools/reflect-owed.mjs, tools/sky-art-shots.mjs (no art changed), boss-fight-end for skylab (the king ends at `beaten`, not death), the full suite.

## Owed / honest gaps
1. The bot is mine and crude (swing/guard odds, 85% reads): the 61% is "this bot", not a human. n=18 is +-20 pts; the rate wandered 33-61% across batches. A joint tune lane should read n>=12 a hero (pyro is the thin one; page crashes cost 3 fights, rerun by seed).
2. Fights end in 50-150 s, under the 120-170 s plan: the king dies fast to a reading knight. If Daniel wants longer, raise `bar` and lower `down` together (the dial pair); this tune does not.
3. Co-op x2.2 is interpolated between two measured points (1.8 and 2.8); re-measure with a human-ish seat. The AI partner swats ~every bolt; a "AI returns count half a pip" alternative (reflectkit Q4) was NOT built.
4. Heart level: must list its own id in TIER/TIER_BOSS/ACTS_LATE like drakelab/skylab (a row is the stand-in), and when claude/draketune merges its edit of the same two main.js lines and foe-react `levels: [...]` will conflict textually with mine (keep both ids).
5. P3 imps hover and are cut by the bot at pyro range 60 / others 14: a player with a slower hero may find them more or less annoying. Imp hp 20 unchanged.
6. Knight-only wins are 5/6, warden/pyro 3/6: warden/pyro suffer at the P2->P3 line.

## Questions for Daniel (rec built)
1. Sky fight length: 50-150 s vs the plan's 120-170 s. REC keep (in band, short fights suit a no-checkpoint retry); alt: bar x1.4 + downed -1 s.
2. Co-op: the AI partner trivialised it. REC a sky-fight-only extra bar on top of your 2/2.6/3.2 (built: x2.2 at 2 seats, DK.coop.hp); alt leave your scale only and let co-op be easy.
3. The king previously ignored the mode's boss-hp factor and the co-op scale (he was spawned outside the level-load boss loop). REC the fix I built (his bar now takes both).
4. Imps' bolts: they ran at 84 a hit at the act-7 dial. REC the tune owns them (DK.imps.dmg, ~25 a hit).
