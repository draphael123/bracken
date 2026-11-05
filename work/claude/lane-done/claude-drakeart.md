# DRAKEART (lane D2, Sonnet) - THE FIRE DRAKE's art, set and sounds (branch claude/drakeart from claude/drakewire)
Not merged, not deployed. The first run died at 23:00; its uncommitted work was already sound and committed (b7069547); this run finished and verified.

## What changed
- `src/redraw/fire_drake_art.js` (new): the drake drawn, one sprite per POSE (26 poses, 200x104, anchor + collar/jaw points); windup and release poses differ; flash silhouette identical. `fire-drake-hands.js` draws it (falls back to the greybox if a sprite throws); the chains hang from the sprite's collar point.
- `src/redraw/fire_drake_set.js` (new): the SEAL (4 stages, glows on slam/tear tells), linked CHAINS (sag / taut white-hot), the scorched RING + posts, basalt LEDGES, VENTS + geysers, magma CREST, and THE CALDERA's own BACKDROP (black sky, far cones with lava glow, basalt column wall, rising ash). main.js: 2 thin hooks (import, backdrop branch).
- `src/audio.js`: 20 drake sounds (one `drake*` per move, picked up by the hands' B16 sound table).
- `tools/fire-drake-art.mjs` (node sheet + lint: 26 poses, 0 bad), `tools/fire-drake-art-shots.mjs` (browser shots in drakelab).
- THIS RUN's fix: the caldera still drew the forest foreground trees + trunks (BG.fg / near) over the new backdrop - `src/drake-caldera.js` palette now `noFg: true, noNear: true` (the desert levels' pattern). Verified in the screenshots.

## Checks
- node: fire-drake 78 ok; fire-drake-hands 296/285 ok (count varies run to run with the random blows; 0 fails); fire-drake-art 26 poses 0 bad; anchor-lint ok; goblin-lint, level-quality, one-new-foe, dressing, ambient-landmarks exit 0; node --check on every changed file.
- browser (one headless, ~5 GB free): tools/fire-drake-art-shots.mjs, errors none. Screenshots in C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\lane-reports\: drakeart-caldera-sleep, -wake, -walk, -clawTell, -claw, -tailTell, -tail, -breathTell, -breath, -lungeTell, -jerked, -tearTell, -hover, -slamTell .png (shots taken after the noFg fix).

## Owed
- The floor is still the generic grass-over-dirt tile kit (the room is a lab greybox; GROUND_KITS fallback). A basalt/scorched ground kit for the caldera tiles (and the 2 left-wall stem tiles) belongs in the Heart level's art pass. Off-theme until then; the room is hidden (not on any road).
- Not shot: P2/P3 states with real play (seal stage 2/3, vents geysering, ledges sinking), the spare -> beaten -> shrine sequence, bestiary card + beastSeen (waits on this art; now unblocked), hint-shown runtime, boss-greed page part, visible-supports, nightly suite. bossLab bands are D3's.
- Drake sounds are synthesized (no CC0 samples sourced); fine for a first pass, listen once.

## Questions for Daniel (rec built)
1. Add the Bestiary card + beastSeen for the drake now that its art exists? REC yes, in D3 / the Heart level lane (kept off here so nothing goes live before the Heart ships).
2. Ground kit for the caldera: scorched basalt with ember cracks? REC yes, one tile set shared by drakelab and the Heart arena.
