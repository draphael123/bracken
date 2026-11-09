# claude/gq3tune - GQ3 tune + art gaps (off claude/gq3art 29f44739c). NOT merged, NOT deployed.
Worktree bracken-gq3tune. Verdict: **NOT READY for batch156** (Queen below band, one bot/reach question open; Princess in band).

## Art fixed
- Queen tower-hop: two NEW frames (src/chars.js, 41 crouch at the portal lip, 42 spring with legs tucked, sceptre blazing); the tower hands now pose her towerWatch (stand) / towerCrouch (0.7 s before each hop) / towerHop (while her exit flash lives) instead of the stand frame. GQ_FRAME in main.js maps them. gqueen-art + gq3art-sheet lints now expect 43 frames.
- BURNING TOWER light: gq3_art.js drawTimberFloor 'burn' now throws banded firelight up the shaft and over the walls, a hot core on the boards and an ember glow below; 'smoke' now glows red-orange (the seam about to catch). Flames were always drawn; the old stills put the burning floor off-screen (a storey is 192 px, the view 180).
- In-play stills (new tools/gq3tune-shots.mjs, one page, zero page errors; H.test.start now also takes 'blink' | 'storm' | 'bays'): burning floor, hop crouch + spring, P2 blink tell / exit ring glowing / stumble, portal storm tell + rings firing + stumble-out, burning bays x2. Sheet: scratch/lane-reports/gq3tune-sheet.png (stills in gq3tune-stills/).

## Tune (built, flasks kit, L21, n=6 per run: knight/ranger/pyro x2 unless noted; 360-450 s clock)
Princess (crown:mini): before hp 1080: 3/6 (50%) -> after hp 1000: **4/6 (67%) n=6**. In band. gprincess.mjs updated (hp 1000).
Queen (crown) - changes made: hp2 1400 -> 1150, geode cd 9/7 -> 11/9, geode hit 18 -> 12 (shard 8 -> 6), P1 portal shard 10 -> 8, crown 16 -> 14, P1 portal cast cd 8/6 -> 10/8. Resist 0.5 and blink cd 5 untouched (resist floor holds).
| run | config | result |
| 1 | before (knight/ranger/pyro) | 3/6 = 50% |
| 2 | hp2 1150 + geode cd (same heroes) | 1/6 = 17% |
| 3 | + geode dmg (same, 450 s) | 1/6 = 17% |
| 4 | + shard/crown dmg (ranger/pyro/warden) | 2/6 = 33% |
| 5 | + portal cd 10/8 (same) | 1/6 = 17% |
Pooled n=30 over the five configs is noise-bound (95% intervals 3-56 each); the final config (run 5) measured 1/6 but it is the softest of all five, so the true rate is higher than 17%. NOT confirmed in 60-70.
Findings that matter more than the number:
1. **Melee heroes do 0 damage in P2.** Knight s1+s2 and warden s1: p2 203-319 s, bar 100%, roof.open [0 dmg]. A direct hit on her in a page probe lands (1147 -> 1097), so she is hittable; the bot never connects (reach onto the rings / parapets, or a blink gate). Ranger and pyro clear P2 in 50-260 s. Needs a bot/reach look before any P2 number is trusted (cannot be solved by numbers).
2. **The tower bot stalls 90 s every run** (esc 90s(stall) = the lab skips it): the measured fights lose 90 s of the clock, hence --secs=450.
3. Deaths are in P1 (hall): 8 of 11 losses, usually at 1-28% bar left: her bell-lure contact 'HER CHARGE' (47 a hit, 91-188 a run) and portal shards are the biggest takers. That is the OLD hall design (not touched: designs unchanged); the lever left is the lure's contact damage (GM.contact).
Timing: P1 40-115 s, tower 90 (stall)/target 50-70, P2 50-260 s.

## Checks (node, exit 0 unless noted)
gqueen3, gq2-lab, gq2mech, gprincess (after hp 1000 in its assert), queen-stair, gobgeo, gqueen-art (43 frames), gq3art-sheet, level-quality crown (clears), checkpoint-gaps, goblin-lint, dangling-paths, modulepreload, tells, hint-shown: all ok. textfit: browser sweep cut by the 590 s shell limit at levelcard 2/9 (every earlier scope clean, 0 overflow lines) - owed in full. mash/pilot rows: no geometry changed, stamps not touched (the boss mash rows gqueen/gprincess still owed; the damage/hp changes alter them).

## Owed / questions (rec first)
1. Look at why melee bots never hurt her in P2 (rec: lab trace of knight hero/queen positions in P2; maybe a blink-chase/reach fix) BEFORE re-tuning.
2. Then n=6 again after (1); if P1 still kills: soften GM.contact 47 -> 38 (rec).
3. Tower bot stall (90 s) in lab-gqueen: rec fix so row clocks are honest.
4. Remaining owed: full textfit, boss mash rows, camera 8.3 feel check (unchanged).
