# UNDERCROWN 3 - Firedamp greybox + fallen pillars that never trap (claude/undercrown3, opus, CODE-ONLY, 11-05)
Branch `claude/undercrown3` off master 42a1d4cd. NOT merged, NOT deployed. No browser or headless Chrome was opened.
Everything sits behind a flag: `UC3_SHIPS = false` in src/level.js. Master keeps THE UNDERCROWN 2 byte-for-byte: the master build of the level is unchanged, and every check passes on it.
To turn it on: `?uc3=1` in the page, `BRACKEN_UC3=1` for a node tool, or `BRACKEN_PAGEQ=uc3=1` for a CDP tool such as boss-rates/bossLab.

## Plan (built as planned)
1. Pure models: **src/firedamp.js** handles chambers, flow through doors, holes that only take gas up, dams, ignition, the told fuse, the blast box and the canary. **src/fallen-pillar.js** decides what a fallen slab leaves, gives each body its view of the fallen cells, and holds the Prince's cross/held rules and the watchdog.
2. Level data (UC3 only) in src/level.js `UC3_FIREDAMP`. The sections go TEACH, REMIX, EXAM, then drift and tomb (see Built).
3. Runtime hands in **src/undercrown3.js** with small main.js glue: band, doors, flames, blasts, canaries, FIREMAN, and the Prince's P2/P3 gas, SCORCHED, HOP/DUCK and watchdog.
4. Node tests: **tools/fallen-pillars.mjs** and **tools/firedamp.mjs**.
5. Lab hook: lab.js `princeGas` plus `BK.uc3`/`BK.uc3Chamber`/`BK.fallen`, UC3 counts on the lab row, and `BRACKEN_PAGEQ` in tools/cdp.mjs.
6. Level tools and lints, each run on its own on both builds. Ad-block filename check.

## Built
- **FIREDAMP.** Gas gathers under each chamber's roof as a band whose depth is its fill.
  - At READY (0.6) a flame in the band lights a told 1 s fuse (`!!`, hiss, the band flickers). Then it blasts along the band and the chamber rests 3.5 s.
  - A full band stops 10 px above the floor. A DUCKED hero (8 px) is always under it; a standing one (14 px) is hit only once the band is almost full.
  - **Flames:**
    - A lit lamp's own flame. A floor lamp only meets a band of about 0.96-0.99, so it acts as a natural near-full timer.
    - A lit lamp STRUCK FLARES 64 px up. This is the player's chosen ignition.
    - Embers and floor fires.
    - The FIREMAN's pole.
    - The Prince's own spark in P3.
  - **The blast:**
    - Hurts heroes in the band (22, unblockable; ducking is the answer).
    - Burns and staggers foes (60; the fireman is immune).
    - BREAKS every slab post whose top is in the band, so blasts take posts out from a distance.
    - Blows out plugs (supported; none placed yet).
    - SCORCHES the Prince if he did not light it: -40, stagger 1.8 s, every blow x2.
- **Wind doors (brattice):** strike to toggle open/shut. An open door levels two chambers by volume.
- **Slab doors:** a whole slab is shut; a swung slab opens a hole the gas drains UP through; a slab down flat is shut.
- **Dam doors:** open until their slab lies flat across them.
- **Canary cage:** one per gassy section. It sings slower as the gas rises and stops at READY, with one hiss and a once-a-level tip.
- **FIREMAN:** a navvy (miner) with `fireman:true`. In a READY chamber with a hero within 170 px he raises the pole (`!!`, "HE RAISES THE POLE", 1 s) and lights it, then turns away. 6 s cooldown. Wet sacking: he is not burnt.
- **Sections (UC3):**
  - **S2 first workings = TEACH GAS.** Chambers works/landing/worksUp. Works lamps are cold. Fireman at 64. A wind door at the landing. Cutting a works post opens a hole that drains the works up into the working overhead. The blast drops both works slabs onto the squad.
  - **S3 flooded level = REMIX.** The old vents become chamber floodW, which burns on its lit floor lamp when nearly full. The bridge slab swung = a hole that drains it. Wind door to floodE.
  - **S4 great stope = EXAM.** A cold lamp on the stage is in the band at READY. Strike it and get down: the blast takes BOTH hung-walkway posts and the walkway drops flat as a bridge. A hero left on the stage takes the blast; one on the near walkway does not.
  - **Barrow -> last drift.** The barrow breathes into the drift until the drift slab, cut flat, dams it.
  - **Tomb.** Off in P1 and on from P2 (READY in 12 s). Lit floor lamps burn it at full. In P3 he strikes a spark himself (told 1 s, then the 1 s fuse).
- **FALLEN PILLARS (Daniel 11-04 15:32):**
  - A slab down flat on a floor rests on its rubble one row up: a SHELF. Every course is one-way (hop on from anywhere, jump up through from under). Under it is a 16 px CRAWL GAP; every hero stands 14.
  - A slab down flat over a gap is a bridge, as before, but with a one-way top course.
  - A swung RAMP is still walked up. A body UNDER its surface reads it as air (no ceiling, no wall: the wedge is walked out of either end). DOWN+JUMP on it, or the running slide into its foot, drops you through.
  - The Prince crosses with a told HOP onto a shelf, or a told DUCK under a ramp. He also ducks through a shelf when a hanging wall leaves no room over it, as with tombW.
  - He never crosses while buried, scorched, reeling or staggered; a stunned Prince stays put.
  - Watchdog: wanting to move, not held, and under 2 px of progress for 2 s means stuck. He is ghosted through for 0.6 s and `n.stuck` is counted.
  - A hero standing on a shelf counts as a perch, so after 1.5 s he heaves the slab off. No safe perch.
- **Lab:**
  - `princeGas`: duck while a fuse burns in your chamber. When the tomb is READY and his top is in the band, go to the nearest lit tomb lamp and strike it to flare it, then duck.
  - Row field `uc3: {hop, duck, scorched, buried, light, stuck, ...}` (`stuck` is the no-dead-time check).
  - Run it with `BRACKEN_PAGEQ=uc3=1 node tools/boss-rates.mjs ...` (prince, n=6).

## Node / lint results (each run on its own)
| check | UC3 build | master build |
|---|---|---|
| tools/fallen-pillars.mjs | **184/184 pass**: 9 slabs x every way they can lie (7 shelves, 17 ramps, 2 bridges); 9 heroes x 1-4 seats both ways, under/over/slide/drop/from-inside; Prince both ways over all 9 tomb lyings with a told hop/duck, 0 watchdog fires; held x3 modes stays put | n/a |
| tools/firedamp.mjs | **100/100 pass** (model + data + teach/remix/exam/tomb) | n/a |
| tools/level-quality.mjs undercrown | all ok except **pilot + mash: cache stale** (level hash changed; level1-pilot/mash-bot need a browser) | all ok |
| tools/floating-geometry.mjs | ok (undercrown REPORT list unchanged; not gated) | ok |
| tools/anchor-lint.mjs | ok (3 pre-existing listed props on air, not gated) | ok |
| tools/platforming-lint.mjs | ok (undercrown: 1 section, as before) | ok |
| tools/deadends.mjs | 10 dead ends, every one pays | - |
| tools/checkpoint-gaps.mjs | ok | ok |
| tools/goblin-lint.mjs | ok | ok |
| tools/signs.mjs | 1158 signs fit 2 lines | ok |
| tools/slopes.mjs (moveBody changed) | all passed | - |
| tools/dangling-paths.mjs | ok | - |
| node --check main.js / lab.js / cdp.mjs | ok | - |
| ad-block (build-itch adblockHits) | fallen-pillar.js, firedamp.js, undercrown3.js, fallen-pillars.mjs, firedamp.mjs: **0 hits** | - |
tools/check.mjs was NOT run.

## Owed
- **BROWSER PROOF (sonnet):** none of the main.js glue has run in a page.
  - Load `?uc3=1`, walk the level, and check the band, doors, canaries, fireman, blasts, shelves and ramp drop/slide.
  - Re-run `node tools/level1-pilot.mjs undercrown --write` and `node tools/mash-bot.mjs undercrown --level undercrown --write` under `BRACKEN_PAGEQ=uc3=1` (their cache is keyed on the level hash).
  - Run textfit, stuck.mjs, lab-reach, the reviewer vs Mage's Folly, and `BRACKEN_PAGEQ=uc3=1` bossLab **prince n=6**.
- **ART + MUSIC (sonnet), per the plan:**
  - Old-kingdom masonry and barrow kit.
  - Gas band shader-free rects (greybox now).
  - Brattice doors, canary cage, scorch decals, the FIREMAN sprite (wet sacking, candle pole).
  - Prince poses for hop, duck, spark and scorched (greybox reuses sinkTell/rise/heave/snuffTell/reel).
  - Shelf drawing: the course one row up, rubble chocks at the ends (the tile painter draws the ONEWAY cells now).
  - Own loop. Row 9 arch re-point.
- **TUNE (sonnet):**
  - Prince 60-70% with flasks at the new arrival LV (scorch x2/-40, spark cooldown 9 s, tomb src 0.05).
  - Foe TIER. Gas rates and the fireman's cooldown. Lance re-check.
  - Resist floor unchanged: SCORCHED is an opening; nothing else lowers below 0.4x.
- **UCREORDER hooks:**
  - None needed by this branch.
  - When the road moves, the UC3 tomb still ends at gate (90,166).
  - The row 9 arch at col 99 is untouched; Undercrown 3 did not move the tomb.
- Flip `UC3_SHIPS = true` in the batch that ships the art.

## Questions for Daniel (rec first; the rec is what is built)
1. **Fallen pillars and FOES.**
   - REC: a shelf is one-way for everyone, so foes walk through/over it as heroes do. The last drift's slab no longer stops "what walks" and is now a gas DAM, with its sign rewritten.
   - Alt: a foe-only solid view, so the drift stays a wall to foes.
2. **Ramp from the foot side.**
   - REC: DOWN+JUMP on the ramp drops through, and the running slide goes in under its foot.
   - Alt: also let a plain walk pass under from the foot side. This reads oddly, because you would walk into the slope.
3. **The Prince crossing a shelf with a hanging wall over it (tombW).**
   - REC: he ducks through it bent double.
   - Alt: he always hops, and the art lane raises the tomb's hanging-wall stubs.
4. **A standing hero on the tomb floor is only burnt by a nearly full band (0.98).**
   - REC: keep it. Shelves and jumps are what is dangerous; ducking always saves you.
   - Alt: DUCK_ROOM 10 -> 4, so standing heroes must duck at about 0.9.

## Final tip
`fdea8adb3` plus this report commit.
