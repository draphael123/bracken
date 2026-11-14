# GQ6HITCH - the burn-step hitch + joint n=36 (Highcrown pass 6 S2+S3), 11-13
Branch claude/gq6s2 (worktree bracken-gq6s2). Flags GQ6S2_SHIPS / GQ6S3_SHIPS still FALSE. Not merged, not deployed. Data: scratch\lane-reports\gq6hitch\ (before-3.json, after-final2.json, n36a/b.json+log, summ.cjs). Tools (all in tools/): gq6hitch.mjs (frames + --proof), gq6hitch-prof / -hallprof (CPU profile), -probe, -resolve, -still.

## PART 1 - THE HITCH: FIXED at the cause
Cause (profile + probe): the tell frame ran a whole-level resolveTiles (~180 ms) AND, because Highcrown's tile variants came from ONE rng stream read left to right, laying one tier re-rolled the variant of ~58,000 cells (every ground tile on screen changed picture, every chunk re-baked). Fix, flags-on only:
1. src/main.js: with the climb on, Highcrown picks tile variants per cell (shared re-seeded mulberry, same numbers, no closure garbage): a laid tier only moves its own cells, chunks stay valid.
2. src/main.js gqTileKeep/gqTilePut (ctx.tileKeep/tilePut) + src/gq6s2.js E.warm: while the hall fight wakes, ONE level resolve per frame for 4 states (hatch sealed, tiers 1..3 laid), keep the tower's tile columns, put everything back (grid by the same ops a reset uses, picture by copy). layTier then = grid change + copy (fast path only in order, else the old resolve). The sealed-hatch picture is copied in at the roof entry too (skipRoof 243-283 ms -> 15-18 ms).
3. BK.tileProbe (read-only) for the proof. gqueen-hands.js: seal/warmOk env, warm call, sealHatch(defer).
Worst frame, BK.step ms, headless software canvas, knight, 3 runs each (from the tell-start frame to 4 s after the climb):
| step | before (d8d0bf00b): tell frame / worst | after: tell frame / worst |
| 1 deck (85) | 195, 288, 194 / 254, 458, 204 | 13, 18, 14 / 357*, 31, 35 |
| 2 hoardings (70) | 235, 228, 228 / 235, 228, 228 | 11, 7, 9 / 11, 14, 17 |
| 3 loft (50) | 189, 217, 171 / 396, 217, 218 | 9, 8, 10 / 31, 30, 29 |
Before also had a second 150-460 ms frame 5-37 frames into most tells; after, 8 of 9 windows <= 35 ms. *One 357 ms frame at tell+18 (heap flat, not reproduced in 2 CPU-profile runs; cause NOT found). Separate ~300-450 ms frames occur about once a run in both builds with the JS heap dropping 30-50 MB = V8 major GC (130-170 MB heap), not the burn; not fixed here.
COST: the hall wake now has 3 extra ~200 ms frames (the 4 warms, behind the name card; frame 0 is already 1.3-1.8 s on master). Hall steady frames unchanged (flags off identical timings).
IDENTITY PROOF: node pins green (gq6s2 off 4 / on 68; gq6s3 off 5 / S2-only 6 / on 108). Flags-off pixel hash of the whole picture, branch vs d8d0bf00b (= master b211d645b): wood, shopSea, redgorge, crown identical after 90 frames and after forced resolve + 30 frames (the first cold run of the branch differed in 3 hashes, the next two matched the base exactly; base reproduced itself twice - treat as cold-start noise). No generic chunk-bake change was made (tcBake untouched). Flags-on: the cached tier state vs a full resolve of the same grid, 3 tiers: 0 of 124,621 sprites differ in pixels, 0 ground-depth diffs, 0 object diffs, decor = same items (array order differs: window decor is re-listed). Side effect: flags-on Highcrown tile variants differ from master's (per-cell), cosmetic.

## PART 2 - JOINT n=36 (practiced bot, flasks kit, both flags on, L22, 360 s clock; rows carry the climb now: boss-rates prints s2 {seconds per tier, tier/phase at end, lifts, crown tosses})
Run A (lift 60/45 s, as built): 19/36 = 53% [37-68] - knight 8/12, warden 3/12 [9-53] (under floor), pyro 8/12.
ONE roof step (2 numbers, S3N): last-resort lift 60 s hold / 45 s after a fall -> 30 / 20 s (a human needs < 8 s; reason: warden bot sat 200-244 s on tier 1 with 3-5 lifts). Run B, fresh n=36:
| hero | wins/12 | losses |
| knight | 8 | hall death 3, platform death 1 |
| warden | 4 | hall death 5, tier-1 timeout 1, platform timeout 1, platform death 1 |
| pyro | 8 | hall death 4 |
| POOLED | 20/36 = 56% [40-70] | hall 12 (75% of losses), tier 1 1 timeout, platform 3 (1 timeout, 2 deaths), tiers 2/deck 0 |
Fight length: wins 142-322 s (avg 230; hall 132, roof 96); losses at the hall 111-205 s. Timeouts 2 (both warden). Seconds per tier avg: deck 22, hoardings 28, loft 28, platform 37. Last-resort lifts: 14 in B across 24 climbing fights (10 in A) - all on warden/knight stuck seats, none lethal. Crown toss FIRES on the tiers: 6 on hoardings, 16 on loft, 6 on platform in B (20 on the deck): the look lane's "never in 26 s" was a short window.
Verdict on band: 56% point, CI 40-70 spans the band; warden 4/12 meets the floor. 12 of the 16 losses are the HALL (untouched, accepted live). Roof side is 4 losses of 24 climbing fights.

## VERDICT: hitch READY; fight NOT READY TO FLIP-PREP yet (56% vs 60-70, and the hall is the whole gap)
Not seen: a human's feel of the hall-wake 3 x 200 ms; real GPU timings; the 357 ms outlier's cause; 4-seat co-op; art (greybox tiers still stands: ART BEFORE LIVE).

## QUESTIONS (recommended first)
1. Out of band by 4 points, all of it hall deaths. Rec: do not touch the roof further; give the HALL a one-step ease in a separate lane (it is live, so Daniel decides), then re-run n=36. (alt: accept 56% [40-70] as in band by interval and go to flip prep.)
2. Keep the 30/20 s last-resort lift? Rec: yes. (alt: back to 60/45.)
3. The hall-wake warm (3 x ~200 ms behind the name card)? Rec: keep. (alt: warm at level load, hidden by the loading screen.)
4. Per-cell Highcrown variants flags-on (cosmetic change vs master)? Rec: keep, it is what removes the re-roll.
