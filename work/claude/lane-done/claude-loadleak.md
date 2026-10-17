# claude/loadleak - BK.load native-memory growth (Opus lane, 10-16)

Base: origin/master 7ade0605 + origin/claude/leakfix 74bc7014 (live log, rss sampler, heap cap, textfit recycling). Port 8981. One headless browser at a time.

## Cause
Every level load re-bakes the level's tiles, props and backdrop (`bakeAllG`, ~745 canvases, ~1 Mpx). The previous bake's canvases were just dropped.
A dropped canvas keeps its native memory (pixels plus raster state: ~30-50 MB per bake in total, several times its pixel bytes) until a **major** GC, and V8
does not count that memory, so it has no reason to run one. Measured:
- the bake alone: +50 MB per call without a GC; a forced `gc()` frees all of it (so it is **garbage that is collected late**, not retained);
- with a GC after every load, repeated loads are flat (~0.3 MB/load), and first visits to a level keep ~7-20 MB (one-time theme caches, by design);
- the leakfix "40 loads = 2.7 GB" is this garbage piling up in a page that loads level after level with almost no JS allocation to trigger a major GC.
  In the real game the same thing makes a sawtooth (hundreds of MB of dead sheets between collections). Not unbounded there, but wasteful on a phone.
- ruled out: unflushed canvas draw-op recordings (reading a pixel back from every sheet freed nothing), typed arrays/ImageData (~3 MB a load),
  canvases made outside the bake (0.13 Mpx over 6 loads).

## Fix (d0753548)
- `src/px.js`: `bakeScope()` / `bakeScopeEnd()` - while a bake step runs, every sheet `canvas()` makes is written down (only during the bake's own
  synchronous steps, never the loading screen's frames between them).
- `src/main.js`: `bakeAllG` wraps the old generator (`bakeAllG0`) and keeps the last bake's list; `retireBakes()` at the end of `loadLevelG` (and the editor's
  `edMount`) empties (`width = height = 0`, which frees the backing at once) every sheet of the superseded bake that the new TILE/PROP/BG and the long-lived
  caches (LEDGE_SETS, REDRESS_GROUND/PROPS, CROWN, VILL, SHORE, REEF, FLOT, CITY, MONK, RAINART, KRKP) no longer reach.
- No pixel change: only sheets nothing reaches are emptied, and the new check proves nothing still holds one.

## MB per load, before -> after
| measure | before | after |
| tools/load-leak.mjs growth: 30 loads of wood,marsh,stockade,moor,crown,reef, no forced GC | 43.1 MB/load (peak +1294 MB) | 9-11 MB/load (peak ~+300) |
| same level 15x in ONE evaluation (the tool pattern) | 16.7 MB/load | 0.5 MB/load |
| same level 15x, separate evaluations, no GC | ~40 MB/load | ~3-5 MB/load |
| kept (GC after every round) | ~0.3 | 0.0-0.3 |
What is left without a GC is ordinary JS garbage (the JS heap swings ~100 MB) and the small objects the collector takes in its own time.

## New check: tools/load-leak.mjs (in check.mjs's main list, after frame-cost)
1. growth: warm-up round, then 5 rounds of 6 levels with no collection forced; peak renderer private memory <= 20 MB/load (was 43);
2. kept: the same rounds with a collection after each, <= 5 MB/load (a real retention leak);
3. audit: all 62 levels loaded and drawn once with `window.__bakeAudit` on; after six collections at the bottom of the stack, 0 of the 46,278 emptied sheets
   may still be alive (a still-held sheet would draw empty); a FAIL names where it was baked (e.g. `PROP.city.tollPost (longwater)`).
Renderer found via SystemInfo.getProcessInfo (cdp.mjs now returns `dbg`), memory from the OS (Windows/Linux/mac). ~2.5 min.
Note: one collection was not always enough. Twice in ~10 runs, 1-2 random sheets out of 46k showed up as still held after a single gc() (a different one each
time: conservative stack scanning). Six spaced collections from a timer: 0 in 6 runs since.

## Checks (all on port 8981, one browser at a time)
GREEN: load-leak (x6), frame-cost, loading-screen, skins, theatre, zoom-coverage, textfit boss (same 3 known findings as before: glasssea "TO THE SKY" +19,
"TURN THE MIRROR TO HIM" +7, church "LIGHT" +6, which are batch97 content).
RED, not mine: pixels (`headless.mjs floats`): undercrown sign@84,29 and church sign@185,38 run through the ground. Identical on the pre-fix base (ran it).
Not run: the full suite (another suite and lane were on the PC), textfit-full, mobile-perf.

## textfit talk/boss re-measured (TEXTFIT_PAGES=1)
- boss, batched (4 levels a page): finished in 425 s, biggest process 2251 MB private.
- boss, TEXTFIT_BATCH=99 (no recycling): still reaches 4 GB and memguard kills it. The cause is NOT BK.load: each new boss level KEEPS ~55 MB even with a GC
  after it (revisiting the same 4 boss levels stays flat, so these are per-boss one-time caches: the order-knight chapter bakes, rim sets, boss sheets). Bounded
  by the number of bosses, but ~60 bosses x ~55 MB is ~3 GB for a player who fights them all in one session.
- talk, TEXTFIT_BATCH=99: still reaches ~4 GB (memguard kill). A talk-like probe (setHero + load + sim 170 + reset + frames) is ~10 MB/load with a GC (first-visit
  caches) and ~26 MB/load without one. Part of that is `BK.setHero` re-baking the whole hero every call (~13 MB of garbage a call; textfit calls it every level).
=> keep textfit's recycling batches; they are still needed.

## Questions (rec first)
1. Per-boss caches (~55 MB kept per distinct boss fight): REC an Opus follow-up lane: an LRU (e.g. last 3 bosses) over the boss/order-knight art caches,
   released the same way (retire + audit), so a long session stays bounded on mobile. Not done here: the caches are spread across many hands modules and it is not small.
2. `BK.setHero`/applySkin re-bakes the hero even when nothing changed (~1,500 canvases, ~13 MB of garbage a call). REC: give the hero bake the same retire
   (roots: K, players[].set, the loading screen's hero) in a small follow-up. The real game rarely calls it, but tools call it every level.
3. Budget 20 MB/load (not 5) for the no-GC growth: REC keep 20. The no-GC number includes ordinary JS garbage (~3-4 MB/load) and swings with GC timing
   (9-12 measured); 5 is held by the "kept" pass, where a real leak would show.
