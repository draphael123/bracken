# claude/redgorge - THE GREAT RED CRAB, HARDENED (crabharden lane, Opus, 2026-10-02)

Brief: Daniel (10-02) wants a NEW boss at 50-60% human-speed bot wins (he found a 71% boss "way too easy"), with no hero under ~35% or over ~75%, no added boss hp, and openings of 3 s or more. The mash bot must still lose 0/6. Before this lane the crab was at 67% (knight 4/7, warden 4/7, pyro 6/7).

## Merge first
- Merged origin/master 007b5b54 (batch56) into claude/redgorge (merge commit e3f131da). The conflicts:
  - tools/check.mjs: every name kept from both sides; `weighty` stays deleted, as do `tide-reaver` and `queen-pillars`.
  - src/boss-greed.js: both OPEN_RULE rows kept (gorgecrab and banditking from here, grandmother from master).
  - tools/boss-openings.mjs: master's two THEATRE3 puppeteer asserts, plus the gorgecrab and banditking asserts from here.
  - tools/audio-assets.mjs: master's set ('theatre' is a file now), plus 'banditking' and 'gorgecrab'.
  - tools/level-quality.mjs: master lifted the theatre's roles row. The welltown music row is kept.
  - src/main.js:
    - the import takes master's line plus MUSIC_CREDITS_ROW (musicBox is gone on master);
    - beastName takes master's line plus the bandit name;
    - the sprite line takes master's cnSkin line plus the gorge's RGSET swap;
    - the BK lab line takes master's (WEIGHTY retired) plus the banditKing and gorgeCrab hooks.
  - src/marks.js: regenerated with `node tools/tells.mjs --write`.
  - docs/slopes-trace.json: master's file, plus this branch's welltown rows.

## What changed (one mechanic, no hp, no new opening length)

**THE SPRAY DAMPS FIRE** (src/gorge-crab-hands.js `take`, `CRAB.douse` in src/gorge-crab.js):
- While the released burst is still running over him in the spillway, the pyromancer's blows on his back land at x0.8 instead of the opening's x1.6.
- The blows are told: steam over him, a hiss, and once a fight the line `THE SPRAY DAMPS YOUR FIRE` (src/hint-lines.js).
- Once the burst has passed (1.6 s of his 4.0 s opening), she gets the whole x1.6 back.
- The knight and warden are untouched.
- **Why the pyro:** the pilot's rows show she cut him from the bank all through the burst. Her staff reaches 30 (+23, half his shell). The knight's sword reaches only 22, so from the bank he cannot touch him until the burst passes.
- That reach advantage was the whole 6/7.
- **Tried first:** a full douse (x0.05, a scratch) took her to 1/4 in the first four salts, which is too hard. x0.8 lands her at 4/7.

New assert in tools/redgorge.mjs (pure, fake ctx):
- the pyro's blow in the spray is x0.8;
- a sword's blow is x1.6;
- hers after the burst is x1.6;
- the line is said.

The old take() returned x1.6 in all three cases, and `CRAB.douse` did not exist, so the assert fails on the old code.

Kept as is: the 4.0 s opening, his hp 1900, every tell, his chains, the greed reprisal (global, combat3).

Tool: tools/redgorge-pilot.mjs now replaces a page that will not reload ("the fresh lab page did not initialize", under load) with a fresh browser, up to twice, instead of dying mid-run. Its band comment now says 50-60%.

## Numbers before -> after (tools/redgorge-pilot.mjs 1..7 knight,warden,pyro, ONE FIGHT A PAGE, 21 fights, L31, normal health)

| | knight | warden | pyro | total | median win |
|---|---|---|---|---|---|
| before (after the merge) | 4/7 | 4/7 | 6/7 | **14/21 = 67%** | 91.2 s |
| after | 4/7 | 4/7 | 4/7 | **12/21 = 57%** | 95.5 s |

- The knight's and warden's 14 rows are identical, fight for fight, before and after. The runs are deterministic per salt when each fight gets its own page.
- The pyro's new rows:
  - salts 2 and 4 now die with him at 3% and 1%;
  - salt 7 dies with him at 13%;
  - her wins take 69-110 s (before: 69-107 s).
- Every hero sits at 57%, inside 35-75%. Most deaths come with him under 25%: a near thing, as the target wants.

**Mash bot** (re-stamped, `node tools/mash-bot.mjs redgorge --arena-only --write`): 0/6, unchanged. Every mash hero dies with him at 95-99%. The pyro deals no extra damage under the mash bot because it never releases the dam.

## Checks (named, never the suite)
See the list in the final message. Green before this report: tells, hint-shown, architecture, dangling-paths, redgorge (+ the new spray assert), audio-assets.

## UNVERIFIED
- Not played by hand. The steam and the hiss over him are seen only in code. The line goes through the hint box like the gorge's other lines (hint-shown is green).
- In co-op, `ctx.pyro()` asks the game's current hero (isPyro()). A mixed-hero co-op pair is judged by whichever hero is current when the blow lands.
- The pyro's burn ticks on him are damped in the spray too (they go through the same wardedDamage). That is consistent, but it was not measured on its own.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The spray damps the pyromancer's fire (x0.8 while the burst runs, x1.6 after).** *Rec:* keep. It is told (steam, hiss, a line), it fits the place, and it evens her with the knight, who cannot reach him from the bank during the burst. *Alternative:* a full douse (a scratch); it took her to about 25% in a short sample, which is too hard.
2. **The opening stays 4.0 s** (the brief offered 3.5 s together with the spray). 3.5 s would cut the knight's usable window from about 2.4 s to about 1.9 s, since he waits out the burst, and would put him and the warden near 2-3/7. *Rec:* keep 4.0. *Alternative:* 3.5 s with the spray at x1.0. Not built.
3. **The warden's 40-reach blade also cuts from the bank during the burst** (she is 4/7, so it is fair today). *Rec:* leave her alone. *Alternative:* if your playtest finds her too safe there, let the burst knock a hero standing within a tile of the channel back a step.
4. **57% is at the top half of the band.** *Rec:* ship it to your playtest gate. *If it plays easy:* the next lever is phase-two pressure (his pause between blows in phase two, x0.8 -> x0.65 of his 0.8 s cd, src/desert-bosses.js), not hp.
