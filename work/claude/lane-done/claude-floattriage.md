# floattriage (11-05) - CODE-ONLY, no browser, check.mjs not run. Branch claude/floattriage, tip 088d36cda (+ report commit). Not merged, not deployed.
## 1. Tool change
- NEW tools/float-triage.mjs (+ tools/float-allow.json). tools/floating-geometry.mjs now exports campaign/build/floating and only runs its CLI when run directly (behaviour unchanged: theatre gate still ok).
- Classes per floating group: LEDGE (boards only, 1569 of them: intended), MACHINE (swingcap/chainpost/rope ents touching it), HUNG (every column within 4 of a post/hanger, the demo-floats rule), ALLOWED (float-allow.json, reason each, stale entry fails), INTERIOR (declared L.interiors box covers it, or n>=1000 level body: art-dependent), MOVER-NEAR (a mover beside it; does not hold it up), ART-HELD (tools/solid-islands.mjs supportsOf finds a drawn post/frame/house/rope, but not a post every 4 cols), REAL (nothing drawn under it at all).
- Gate: a REAL group in theatre/welltown/witchlight/skyroad/glasssea, or a stale allow entry, fails. Existing gates still green: floating-geometry, solid-islands, anchor-lint.
- Run: node tools/float-triage.mjs  (ranked REAL), node tools/float-triage.mjs <id> (every class), --json.
## 2. Result over 53 levels (mass groups; 1569 ledges set aside)
HUNG 86, MACHINE 2, ALLOWED 20 (6 allow entries I wrote), INTERIOR 41, MOVER-NEAR 2, ART-HELD 45, REAL 8.
KEY FINDING: the review's big names (palisadewood x165, fields x494, church x83, minecart x26) are NOT bare. The repo already ratchets bare islands (solid-islands ALLOW); what remains is that the data says "held" while the ART must show it. So the honest split is REAL (8) vs NEEDS-EYES (88).
### REAL floaters (nothing drawn under them), ranked
| # | level | tiles @ x,y | why real | owner |
|1| ksar | SOLID x35 @674-680,22-26 | store overhang, only a diagonal corner touch to the raised rope-bridge cell 681,27 (src/ksar.js 306-307: intended overhang, but reads as a slab on nothing) | ksar fix lane |
|2| canal | SOLID x10 @435,25-34 | 1-wide column hanging in fog, nothing above or below | canal lane |
|3| minecart | SOLID x6 @737-742,30 | lone slab (skip list: deeprails/minecart) | minecart lane |
|4| canal | SOLID x6 @56-58,34-35 | 3x2 block over water, no post | canal lane |
|5,6| ksar | SOLID x4 @622-625,21 and @632-635,21 | 4-wide slabs 6 rows over the road (slingers stand on them), no post | ksar fix lane |
|7,8| oreroad | SOLID x2 @334,28-29 and @13,33-34 | 1-tile gap to rock (NEAR): add a tile (skip list: oreroad) | oreroad lane |
Allowed with reasons (in float-allow.json): welltown gate walls 151/473/514 (stage doors, src/well-town.js 147/263), witchlight rune-stone tips x6, skyroad cloud pillars x4, glasssea pedestal 172-180,21.
### NEEDS EYES, ranked (data says held; is it DRAWN well enough?). Biggest open air first
ART-HELD (drawn support exists but sparse, worst gap 5-38 cols): witchlight SOLID x304 @142-217,66-69 (posts only at 9 cols); causeway x216 @165-221,16-21 (post+interior); deep x168 @51-96,104-110; palisadewood x165 @406-416,6-20 (2 posts, 11 wide, 15 tall); waymeet x153 @212-262,29-31 (a 51-wide house roof slab, nets at each end 1 col off); hanging x132/130/116/100/80/72/64 (7 slabs, 2-5 posts each); lamplit x126 @279-299,22-27; welltown x117 @372-384,8-16; spire x107 @41-77,118-128; wood x99 @353-385,11-13 (swing); causeway x90 @438-451; fair x88 @398-437,7-22 and x54 @529-555; glasssea x72 @505-540,27-28; caravan x61/43/34/34/31/22 (wagon roofs, worst gap 9-29); burning x45 x3 and x39 x4 (7 barn roofs 'house'); minecart x26 @272-284,18-19 and spike runs 982-1041; waymeet x21 @170-176 / 651-657 / x15 @699 (hovering 3x7 blocks, 2 rows under the ceiling).
INTERIOR (a declared building / hold; its frame is PAINTED): fields x494 @464-538,4-28 (timber barn); harbor x190 @688-782,16-17 (ship); reef x176 @122-209,6-7 (ship); deep 13 gundeck/galley/cargohold floors x87-123; causeway chapel x125; canal mill x87; lamplit drowned x86; church x83 @106-164,15-19 and x60 @49-96,19-31; stockade x68 @247-263,14-17 (earth); burning x35; towpath mill x29; mage library x20; hurricane hull x4434 / x1822 (level body).
MOVER-NEAR: 2 small groups (see --json).
## 3. Fixes made
NONE to tiles or routes. Reasons: every REAL group in a non-skipped level is already a reasoned, ratcheted allowance of its own lane (ksar 32, canal 2, ...), and each fix I looked at needs eyes: ksar 674 is a deliberate overhang over the rope-bridge chasm; canal 435 is a lone fog pillar whose source I could not find in src/canal*.js; adding a tile or a post to a levelHash-bound level without a browser or the suite is exactly the "works on my machine" risk. Only tooling + allowlist landed.
## 4. Fix lanes to queue (rec: 1 sweep lane per pair, each needs eyes)
1. Ksar fix: overhang 674-680 (add a drawn pier or tie it to the bridge cell with tile 681,26 / 680,27, 1 tile) + slabs 622/632 (posts or tie to the road wall) + 8 ksar2 allowances. Sonnet.
2. Canal fix: pillar 435 and block 56-58 (and the INTERIOR mill x87) - find the source, give them a post/pier or remove. Sonnet.
3. Hanging Village post lane: 7 slabs with 2-5 posts each (worst gap 5-8): run anchor-posts (add 'hanging' to ANCHOR_LEVELS, routeSupports only, no tile/hash change) then screenshot. Also lamplit, glasssea 505-540, witchlight 142-217, palisadewood 406-416, causeway 165-221, spire, welltown 372-384, caravan wagon roofs, waymeet roofs: the same one-line ANCHOR_LEVELS addition per level is the cheapest fix (no tiles); needs one screenshot pass per level to check the new posts do not draw through a street.
4. Painted-frame eyes pass: fields barn, church, harbor/reef ships, deep holds, burning barn roofs: look at each in the browser; if the frame is drawn, add to float-allow.json with the reason.
5. oreroad / minecart / kings etc.: skip-list lanes: oreroad 334,28 and 13,33 are 1-tile NEAR gaps (fill the tile); minecart 737-742,30.
## 5. Browser / eyes owed
All of section 2 NEEDS EYES; no pixels were read. Per level: stand at each listed x,y and see whether something is drawn under/around the slab. Nothing was screenshotted (release gate running).
## Questions (rec first)
1. Add 'hanging','lamplit','witchlight','palisadewood','causeway' etc. to ANCHOR_LEVELS (drawn posts, no tile change)? Rec yes, one lane, per-level screenshots.
2. Wire float-triage into tools/check.mjs (cheap node tool, ~2 s)? Rec yes, next release lane.
3. Keep INTERIOR as allowed-by-data or demand eyes before it counts? Rec: needs eyes once, then allow in float-allow.json with reason.
