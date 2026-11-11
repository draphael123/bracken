# wispwood: WISPWOOD + THE LANTERN WIDOW (opus greybox, behind WISPWOOD_SHIPS)
Branch `claude/wispwood` (off master 85d152eb8), pushed. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-wispwood`. Not merged, not deployed.
Tip: see `git log -1 origin/claude/wispwood` (the report commit sits on top of 78d03dcce). Plan: scratch/lane-reports/wispwood-plan.md (built as written, except where noted below).
Verdict: READY AS A GREYBOX. It is code only and node-checked. Nobody has walked it in a browser, it has no art, and the boss is not tuned.

## Built
- **Flag:** `src/ww-flag.js` sets WISPWOOD_SHIPS = false. `wwOn()` is true for the flag, for `?ww=1`, or for `globalThis.__WW` (`tools/ww-on.mjs`). With the flag off the game is master's exactly (proved below).
- **Road:** THE BURIAL CAVERNS -> WISPWOOD -> THE WITCHLIGHT STAIR. The LEVELS row is APPENDED only while wwOn(), and then `witchlight.needs = 'wispwood'`.
  - Old saves: `wwRoadMig` runs once with the flag on. If the caverns or the stair are cleared, it sets `PROG.witchlightOpen` (a levelLocked clause).
  - Map node at inland (142,74), with a path vertex between the caverns and the stair.
- **Level** `src/wispwood.js` (330 x 44). Rule: 'WHAT THE LIGHT TOUCHES IS REAL.' Night palette, L.dark 0.42.
  - 0-47 THE PALE EDGE (teach): the barrow mouth, the first pale branch over a shallow ditch, a candle, the first hand pool on firm ground.
  - 48-119 THE HOLLOW OAKS (develop): pale ladders up dead oaks and a crown-to-crown bridge over THE BLACK MERE.
    - The low road is THE ROOT WALK, through the mere's roots and oak two's hollow trunk, in the dark with the hands.
    - Silver 1 is in oak two's crown.
  - 120-179 THE WISP ROAD (twist): a thief over firm ground first, then THE CANDLE BRIDGE (light both candles, then cross under the thief), a waystone and SHRINE 1 (col 172).
  - 180-259 THE DROWNED GLADE (exam): islands, pale stairs and bridges, hands, thieves and the dead. Silver 2 is on a root-shelf down pale rungs off the island.
  - 260-273 THE WIDOW'S GATE: SHRINE 2 (col 265).
  - 274-327 THE WIDOW'S GLADE: the boss. The exit root-hole is a sign plus the arena's `exitHole` (for the art lane).
  - Checkpoints are START + 2 (checkRun 200). Placed by hand (calm).
- **The rule** `src/wispwood-hands.js`:
  - SPECTRAL cells are ONEWAY in the built grid, so reach, pacing and quality read the lit state. The hands make each one AIR while no light reaches it (8 px hysteresis). Originals are kept and a reset restores them.
  - Unlit cells draw a faint dotted GLINT. Lit cells draw pale cyan.
  - LIGHTS and their radii:

    | Light | Radius | Rule |
    |---|---|---|
    | Lantern (every hero) | 72 | |
    | Grave candle | 60 | Strike it with a lit lantern: burns 12 s and gutters first |
    | Hanging lamp | 80 | Burns until snuffed |
    | Waystone | 80 | Always lit |
    | A thief carrying your flame | 44 | |
    | The Widow's lantern | 96 | 120 while she holds the stolen light |
    | False lights | 44 | |

  - A dead lantern relights when it touches any lit light. A drowned one catches again by itself after 15 s, so there is no soft-lock.
  - SHADOW HANDS (pools): a hand rises at the pool's nearest UNLIT column within 112 px, told 0.7 s with a yellow !, and lunges at 300 px/s to where the hero stood. It deals 10 and HELDs him 0.6 s.
    - Answer it with a block, a jump or a blow (BANISHED).
    - With the lantern lit, hands come from the edge of the glow. With it out, they rise under the hero.
  - THE BLACK MERE: a fall is dragged back to the last firm footing for 16 (spare, never a death).
- **New foe: THE WISP THIEF** `wwthief` (18 hp, flies, runner role).
  - Told swoop 0.6 s with a yellow ! (BY_HAND + MARK/ANSWER/HEIGHT rows). A block SCORCHES it: stunned 1.2 s and it takes x2.
  - A hit STEALS the flame and the thief flees with it. Its glow keeps the bridges real near IT, so you chase the glow.
  - Struck down, it gives the flame back. If it escapes (14 s or 520 px), the flame drowns.
- **Boss THE LANTERN WIDOW** `lanternwidow`: the fight is pure in `src/lantern-widow.js`; the world, POSE table and greybox drawing are in `src/lantern-widow-hands.js`.
  - 2600 hp, x0.45 outside openings, x2 in them capped at 12% per opening, P1 floor 50%.
  - The opening is THE RECLAIM: strike HER LANTERN while she holds the stolen light. Every flame comes home and she REELS (open 3.5 s, sinking to the floor).
  - P1 moves:
    - VEIL SWEEP (0.6 s, !, 14, blockable).
    - THE WAIL (0.9 s, !!): a ground ring to 160 px for 16. Jump it. It snuffs the rim lamps it passes.
    - SHADOW HANDS (1.0 s, !!): 3 told ripples per hero, then 12 + held. Move off them.
    - SHE TAKES YOUR LIGHT (1.2 s beckon, !!), every 15 s: lanterns and rim lamps go out, the glade goes dark (L.dark 0.88), and she flies perch to perch. The tiers are real only in her glow.
    - If you do not reclaim within 20 s, she DROWNS the light: the rim lamps relight, and you relight by touching one.
  - P2 at 50%: THE LAMENT (2.0 s, still x0.45), then SHE TAKES ALL THE LIGHT.
    - The glade stays dark. A reclaim lights it for 8 s plus the opening, then she takes it again (told).
    - She adds THE WEDDING MARCH (1.2 s, !!, a red bar at the far wall): a low procession sweeps the floor for 16. Jump it.
    - Two FALSE LIGHTS orbit her. Striking one pops it for nothing, but they also hold the tiers.
  - Every move has its own windup pose, release pose and sound.
- **main.js:** 21 single tagged lines `(claude/wispwood)`, all behind wwOn()/WWH/WDH/their ents:
  - import, wwRoadMig, the reset, the spawn case, the levelLocked clause, WW_NODE plus the map splice, the EHP literal rows, take (with tag), bossEnd, update, boss update, thief AI, construct (TIER 2.68 / TIER_BOSS 2.28), strike, drawBack, the enemy draw, drawOver, the dark-mask holes, barName, the dev entry.
  - Dev URLs: `?ww=1&dev=1`, `&wwsec=1..4`, `&wwboss=1`, `?ww=1&boss=lanternwidow`.
- **Shared one-liners:**
  - `src/level.js`: the import and the guarded push.
  - `src/threat.js`: one Object.assign.
  - `src/marks.js`: one BY_HAND row and one Object.assign. MARK matches with no `--write`.
  - `tools/level-quality.mjs`: GATE, REPORT_ONLY music/pilot/mash/curve, ROLES runner wwthief.
  - `tools/additional-areas.mjs`: the road pair.

## Node checks (no browser, no check.mjs, no map-scale; free RAM was 3.5-4.6 GB before each batch)
- **tools/wispwood.mjs: all ok, flag off and flag on.**
  - Flag off: LEVELS, burial and witchlight have master 85d152eb8's signature (hashed before any edit). The save rule and gate clause run over 4 fake saves exactly as master. All 21 hooks are guarded.
  - Flag on: the road and grandfathering, the build, the fill reaching every shrine, silver, candle, lamp, stone and the Widow.
  - The hands (in a fake world): glow, theft, waystone, candle burn/cold/relight, the 15 s catch, the lamp, hands at the glow edge and under a dark hero, banish, the mere, the reset; the thief's swoop, steal, struck-home, scorched, drowned, and its glow holding the bridge.
  - **The Widow, bot with a 40 sword and a 640 hp pool:**
    - WINS in 67 s with 294/640 left: 4 thefts, 4 reclaims, 31 open blows (1518 open vs 1090 through the veil), P2 with 3 marches, every move out of its own windup.
    - Without ever reclaiming: wins in 104 s, and she drowns the light.
    - Damage maths: a blow lands 18 through the veil and 80 reclaimed. The opening cap holds, and P1 holds at 50%.
- **level-quality wispwood (flag on): CLEARS THE BAR.**
  - Bands 5 with 49% multi-height. 5 gadget kinds, all developed (span/lamp/hands/candle/stone). 2 secrets. 2 checks, 1 per 152 route tiles.
  - Density 1.82 with 0 empty screens. 4 roles. Route 18 rows with 2 pockets.
  - WARN (report-only): pilot, mash, ruleFight, blocking 25%.
  - The full gate passes with the flag on and off.
- **ok with the flag on AND off:** map-grammar, map-spacing, map-roads, additional-areas, tells, answer-tags, blow-tags, foe-pass, one-new-foe, death-fx, threat-holes, spawns, boss-read, checkpoint-gaps, checkpoint-stand, signs, killzones, solid-islands, deadends, goblin-lint, comments, architecture.
  - solid-islands passes because the spans, roots and root-shelf are declared hullZones.
- **Listed only (as for ghosttrain):**
  - floating-geometry: 21 groups (the pale spans themselves).
  - anchor-lint: 11 cantilevers.
- Correction to tourney's note: `tells` passes on master. It failed here only until the thief's row was added to BY_HAND.

## Owed
- **Browser walk** (dev URLs above). Never run in a page. Things to watch:
  - The glint and the real cells flipping as you walk, with no stutter from cellSet per frame.
  - The dark mask holes.
  - The first branch and the ditch, the oak ladders, the root walk under hands, the candle bridge with a thief, the grotto rungs.
  - A thief theft mid-bridge.
  - The mere drag-back.
  - Every Widow move, a theft, the chase up the tiers in her glow, a reclaim, the drown, the lament and P2, the march, the false lights, the win.
  - A co-op still (two lanterns, one stolen).
- **Art lane (sonnet):** everything is greybox.
  - Pale dead oaks and trunks, the hollow trunk, drowned roots and stumps, the mere's black water, and the pale spans (ghost-wood that reads lit vs glint).
  - Lantern on the hero, candles, hanging lamps, waystones, the hand pools and hands, the wisp thief.
  - THE LANTERN WIDOW's POSE art (`src/redraw/lantern_widow_art.js` to come), the veil, the great lantern, the march's mourners, the false lights.
  - The root-hole exit with the first webs.
  - The map node art and blurb, the transition rows (caverns -> wood -> stair), and the music (Daniel picks).
  - Read distinct from Lumber Trail / Palisade / Sporewood / Underleaf: pale, dead, ghost-lit, no logs.
- **Tune (n=6, with flasks, to 60-70%):**
  - boss-run and boss-rates need a `--ww` flag (sets `globalThis.__WW` in the page, as `--gt` / `--ty` do).
  - The page bot has never struck a lantern, so it needs a reclaim pilot (`WDH.reclaim()` exists as a hook).
  - The node bot finishes in 67 s, below the brief's 90-150 s, so hp likely goes up.
- **Page tools not run:** level1-pilot (pilot + curve rows), mash-bot (mash row), map-scale, map-forks, reach-heroes (the 3-row ladder rises for every hero), stuck, textfit (ww-lines), hint-shown, mobile-perf (the per-frame spectral loop + dark mask), boss-openings, boss-greed.
- **Not built:**
  - Bestiary cards (wwthief, lanternwidow).
  - A boss-rush row.
  - MARK rows for the Widow's tells (she wears her own !/!! through ctx.number).
  - SAY_LINES routing of ww-lines.
  - tools/wispwood.mjs is not wired into check.mjs.
  - The skeleton set placements, which wait for beastsbones to merge (Q11).

## Questions (rec = what I built; none block)
1. **Road end:** the wood leads to THE WITCHLIGHT STAIR today, because SILK UNDERCROFT and HOLLOW MANOR are not on master. **Rec:** the Silk lane takes `witchlight.needs` (Wispwood -> Silk -> ... -> Stair) when it lands. The root-hole exit is already drawn there.
2. **The lantern never burns down** (no fuel timer). Light matters through theft, the edge-of-glow hands and how far the glow reaches. **Rec:** keep. The alternative is a 25-30 s flame refilled at candles, more pressure but a timer.
3. **The black mere never kills:** a fall costs 16 (spare) and puts you back. **Rec:** keep (fewer checkpoints; Salt & Sanctuary cost is the death, not the pit). The alternative is that the mere is death.
4. **Spectral spans are ONEWAY, not SOLID** (jump up through, drop through). **Rec:** keep; nothing can be trapped inside a cell that appears.
5. **A thief that escapes drowns the flame**, and you relight at any light or after 15 s by itself. **Rec:** keep (no soft-lock).
6. **The theft cannot be avoided** (it is the rule move: told 1.2 s, no damage). **Rec:** keep. The alternative is that a block during the beckon keeps your own lantern.
7. **The drown at 20 s (P1)** relights the rim lamps instead of healing her. **Rec:** keep (healing bosses read as unfair).
8. **The 4th move is THE WEDDING MARCH, plus FALSE LIGHTS in P2.** **Rec:** keep. It is the bride's own move and lands in a dark phase, where jumping the procession is read by its mourners' glow.
9. **Widow 2600 hp:** the node bot takes 67 s (104 s without reclaims). **Rec:** the tune lane sets it at n=6 with flasks once boss-rates has `--ww`. Probably ~3000 for the 90-150 s band.
10. **Music:** it borrows the benched 'cave' for the level and the pool's 'boss4' for the arena (report-only). **Rec:** Daniel picks CC0/CC-BY tracks (a hollow, music-box ghost-wood tune; a bridal-lament boss theme).
11. **Skeleton set (beastsbones), after it merges:**
    - skelsoldier at the oaks' far bank (col ~92, row 17).
    - skelarcher on the Wisp Road's branch (col ~130, row 20).
    - skelmage in the Drowned Glade's landing (col ~250, row 26).
    - **Rec:** the beastsbones placement walk adds these 3 rows (not placed here).
12. **Map node (142,74):** it is the only spot near the caverns/Unburied/stair cluster that cleared spacing, grammar and roads (10 others tried). **Rec:** keep; the art lane may relay the inland sheet.
13. **Checkpoints:** START + 2 (cols 172, 265). **Rec:** keep.
