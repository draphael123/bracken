# ORE ROAD FIX (claude/oreroadfix, from master 42a1d4cd) - code only, no browser opened

## Sections added (src/ore-road.js only)
1. THE RAIL GAUNTLET = THE COLLAPSED SPAN, x283-317 (5b/34t, 0 fight inside). The third fallen deck is split (x311-314, x317-322, one row higher), so the crossing is hop, rope climb, drop-jump, two gaps, and a gap onto the wreck head. Upper wreckage catwalk extended x283-294. The wreck crew (sapper, rockgoblin, goat, sheargob, gaffer) moved off the span: sapper/rockgoblin/gaffer to the wreck head and a new gantry over it; goat+sheargob became 2 bats (x316/x322). Sack-work sapper in WORKS moved 300 -> 335 (head).
2. THE BROKEN RAILS, x7-8: a 2-tile cut (spikes) in the yard floor, 1 tile after the first checkpoint. Joins the old yard near-miss (4b/22t) into a section: 5b/26t, x9-35.
## Second-height band (bands row)
- THE FEED GANTRY: catwalk x38-50 over the cart rail (rope at 51 off the loading house).
- THE WRECK HEAD GANTRY: catwalk x327-339 (rope 328).
- Upper wreckage x283-294.
## Lint before -> after (oreroad)
- level-quality: MISSES bands (6 bands, 36% second height) -> CLEARS (6 bands, 41%); blocking 42% -> 40% (still ok); ruleFight/density ok.
- platforming-lint: 0 sections -> 2 sections (5b/26t + 5b/34t).
- anchor-lint: 19 faults (11 island, 8 cantilever) -> 19 (same kinds); floating-geometry 20 groups -> 20; new plats attach to ropes/rock, nothing new floats. Existing faults not fixed (report-only, art-side routeSupports).
- tools/ore-road.mjs: all pass (a first try broke wreckcart@326 and the miner@337 seam; both fixed).
- Fight stretches: strip F/H count unchanged at 13 of 37. The wreck's 2 F buckets are now clean but the crew is concentrated at the head, which sits beside the Brakeman's hut (a 4-bucket fight run, c224-256). A foot-guard at the chute foot to spread it cost the section (5b exactly) and the blocking row, so it was reverted. Total foe threat ~ same (23.5 -> 20.5).
## Browser owed
- tools/level1-pilot.mjs oreroad --write (+ --curve), tools/mash-bot.mjs oreroad: hash stale (22d06c9289d8 -> ff9f9069a274).
- tools/ore-work.mjs, tools/reach-heroes.mjs, tools/oreroad-walk.mjs (use cdp): not run. reach: the new gantries and split deck need a per-hero reach pass (jump gaps are 2 wide, rope-climbs).
- Eye-check of the wreck crossing and the head gantry.
## Art owed
- Rails and ties along the fallen decks and in the Broken Rails cut; feed-gantry and head-gantry drawn as timber catwalks with legs (still 'islands' to anchor-lint); a broken-tie cut tell at x7-8.
## Questions (rec first)
1. Spread the head crew back along the span as bats/loose fliers? Rec: leave it; the head is the fight room, the span is the crossing.
2. Is a spike cut 1 tile after the first checkpoint too early? Rec: keep (2 wide, 1 row deep); drop spikes if the playtest bites.
3. Pit-hit: should a deck-gap fall on the wreck bed stay a spike hit? Rec: yes, as before.
## Final tip
Branch claude/oreroadfix, see tip below; not merged, not deployed.
