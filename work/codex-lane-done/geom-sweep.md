# Whole-game geometry sweep

Base: `origin/master` at `c33c3204` (batch 93), 62 built `LEVELS` entries. The browser scans use the game’s own tile sprites, foreground painters and live 320×180 frame; the support scan measures the game’s structure and route-post art at native resolution. Existing Buried City and Unburied Field gates remain intact. The two new full-game checks are **report-only** while the art lanes review the backlog.

**Reading the counts:** “Top art” means fewer than three contiguous opaque pixels in the first four sprite rows of a standable surface; a sprite-less cell is accepted only when exact metadata routes it to a named foreground painter. “Mover” means the settled live frame did not show a three-pixel top difference when that mover was removed for one frame. “Overhang” means at least three rows of air below a standable run, with no validated foreground support or keyed visible exception. These are actionable art-review findings, not claims that every crop is a player-visible bug: themed natural ledges and special movers need human review before a gate.

The rendered crop for **every** finding is linked below and saved as `work/codex/shots/geomsweep/<level>-<col>-<row>.png`. The yellow square marks the named tile. Screenshots are after the game’s startup fade and use `BK.look` with the hero hidden. No collision, grid, or game behavior was changed.

## Ranked levels

| Rank | Level | Top art | Mover | Unsupported overhang | Total |
| ---: | --- | ---: | ---: | ---: | ---: |
| 1 | spire | 0 | 0 | 126 | 126 |
| 2 | crown | 0 | 0 | 113 | 113 |
| 3 | hanging | 76 | 0 | 21 | 97 |
| 4 | kings | 0 | 0 | 79 | 79 |
| 5 | spore | 51 | 0 | 25 | 76 |
| 6 | sealedpyramid | 0 | 0 | 74 | 74 |
| 7 | minecart | 0 | 0 | 73 | 73 |
| 8 | hurricane | 0 | 0 | 68 | 68 |
| 9 | buriedcity | 0 | 0 | 67 | 67 |
| 10 | keep | 0 | 0 | 65 | 65 |
| 11 | welltown | 0 | 0 | 65 | 65 |
| 12 | redgorge | 8 | 0 | 44 | 52 |
| 13 | underwell | 0 | 0 | 52 | 52 |
| 14 | ksar | 0 | 0 | 47 | 47 |
| 15 | canal | 0 | 1 | 45 | 46 |
| 16 | deep | 0 | 0 | 44 | 44 |
| 17 | marsh | 26 | 0 | 18 | 44 |
| 18 | fallingtower | 1 | 6 | 35 | 42 |
| 19 | theatre | 0 | 1 | 41 | 42 |
| 20 | oreroad | 0 | 0 | 40 | 40 |
| 21 | burial | 0 | 1 | 38 | 39 |
| 22 | church | 0 | 0 | 39 | 39 |
| 23 | lamplit | 0 | 0 | 34 | 34 |
| 24 | mage | 0 | 0 | 34 | 34 |
| 25 | storm | 0 | 0 | 32 | 32 |
| 26 | stockade | 0 | 0 | 24 | 24 |
| 27 | undercrown | 0 | 0 | 24 | 24 |
| 28 | waymeet | 0 | 0 | 24 | 24 |
| 29 | fields | 0 | 0 | 23 | 23 |
| 30 | underleaf | 0 | 0 | 23 | 23 |
| 31 | moor | 0 | 0 | 22 | 22 |
| 32 | caravan | 0 | 0 | 20 | 20 |
| 33 | fair | 8 | 0 | 12 | 20 |
| 34 | flotilla | 0 | 0 | 20 | 20 |
| 35 | towpath | 0 | 0 | 20 | 20 |
| 36 | causeway | 0 | 0 | 19 | 19 |
| 37 | reef | 0 | 0 | 19 | 19 |
| 38 | wood | 0 | 1 | 17 | 18 |
| 39 | witchlight | 0 | 0 | 16 | 16 |
| 40 | burning | 0 | 0 | 13 | 13 |
| 41 | skyroad | 0 | 0 | 13 | 13 |
| 42 | rootway | 0 | 0 | 12 | 12 |
| 43 | trial_open | 0 | 0 | 4 | 4 |
| 44 | glasssea | 0 | 0 | 3 | 3 |
| 45 | harbor | 0 | 0 | 2 | 2 |
| 46 | longwater | 0 | 0 | 2 | 2 |
| 47 | shopSea | 0 | 0 | 2 | 2 |
| 48 | shop | 0 | 0 | 1 | 1 |
| 49 | shopCrag | 0 | 0 | 1 | 1 |
| 50 | shopWell | 0 | 0 | 1 | 1 |
| 51 | custom | 0 | 0 | 0 | 0 |
| 52 | scree | 0 | 0 | 0 | 0 |
| 53 | trial_berserker | 0 | 0 | 0 | 0 |
| 54 | trial_geomancer | 0 | 0 | 0 | 0 |
| 55 | trial_knight | 0 | 0 | 0 | 0 |
| 56 | trial_paladin | 0 | 0 | 0 | 0 |
| 57 | trial_pirate | 0 | 0 | 0 | 0 |
| 58 | trial_pyro | 0 | 0 | 0 | 0 |
| 59 | trial_ranger | 0 | 0 | 0 | 0 |
| 60 | trial_reaper | 0 | 0 | 0 | 0 |
| 61 | trial_warden | 0 | 0 | 0 | 0 |
| 62 | unburied | 0 | 0 | 0 | 0 |

Totals: 170 tile-top findings, 10 mover findings, 1656 unsupported overhangs; 720 overhangs accepted by visible supports or keyed reasons.

## Level findings and theme-matched fix

### 1. spire — 126 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [43-51,24](../codex/shots/geomsweep/spire-43-24.png), [59-67,24](../codex/shots/geomsweep/spire-59-24.png), [35-45,30](../codex/shots/geomsweep/spire-35-30.png), [3-16,31](../codex/shots/geomsweep/spire-3-31.png), [70-93,31](../codex/shots/geomsweep/spire-70-31.png), [40-42,33](../codex/shots/geomsweep/spire-40-33.png), [52-66,36](../codex/shots/geomsweep/spire-52-36.png), [92-93,36](../codex/shots/geomsweep/spire-92-36.png), [1-51,38](../codex/shots/geomsweep/spire-1-38.png), [67-90,38](../codex/shots/geomsweep/spire-67-38.png), [57-60,39](../codex/shots/geomsweep/spire-57-39.png), [60-63,41](../codex/shots/geomsweep/spire-60-41.png)
[63-66,43](../codex/shots/geomsweep/spire-63-43.png), [30-56,45](../codex/shots/geomsweep/spire-30-45.png), [66-69,45](../codex/shots/geomsweep/spire-66-45.png), [69-72,47](../codex/shots/geomsweep/spire-69-47.png), [29,49](../codex/shots/geomsweep/spire-29-49.png), [72-75,49](../codex/shots/geomsweep/spire-72-49.png), [91,50](../codex/shots/geomsweep/spire-91-50.png), [75-78,51](../codex/shots/geomsweep/spire-75-51.png), [23-27,56](../codex/shots/geomsweep/spire-23-56.png), [1-22,58](../codex/shots/geomsweep/spire-1-58.png), [28-94,58](../codex/shots/geomsweep/spire-28-58.png), [22-27,62](../codex/shots/geomsweep/spire-22-62.png)
[84-86,62](../codex/shots/geomsweep/spire-84-62.png), [78-81,64](../codex/shots/geomsweep/spire-78-64.png), [88-90,64](../codex/shots/geomsweep/spire-88-64.png), [74-77,66](../codex/shots/geomsweep/spire-74-66.png), [84-86,66](../codex/shots/geomsweep/spire-84-66.png), [69-72,68](../codex/shots/geomsweep/spire-69-68.png), [88-90,68](../codex/shots/geomsweep/spire-88-68.png), [16-26,69](../codex/shots/geomsweep/spire-16-69.png), [64-67,70](../codex/shots/geomsweep/spire-64-70.png), [84-86,70](../codex/shots/geomsweep/spire-84-70.png), [59-62,72](../codex/shots/geomsweep/spire-59-72.png), [88-90,72](../codex/shots/geomsweep/spire-88-72.png)
[1-11,73](../codex/shots/geomsweep/spire-1-73.png), [54-57,74](../codex/shots/geomsweep/spire-54-74.png), [84-86,74](../codex/shots/geomsweep/spire-84-74.png), [49-52,76](../codex/shots/geomsweep/spire-49-76.png), [88-90,76](../codex/shots/geomsweep/spire-88-76.png), [4-9,80](../codex/shots/geomsweep/spire-4-80.png), [31-37,80](../codex/shots/geomsweep/spire-31-80.png), [10-30,82](../codex/shots/geomsweep/spire-10-82.png), [38-78,82](../codex/shots/geomsweep/spire-38-82.png), [79-91,83](../codex/shots/geomsweep/spire-79-83.png), [78-90,90](../codex/shots/geomsweep/spire-78-90.png), [88-90,92](../codex/shots/geomsweep/spire-88-92.png)
[91-93,94](../codex/shots/geomsweep/spire-91-94.png), [88-90,96](../codex/shots/geomsweep/spire-88-96.png), [85-89,100](../codex/shots/geomsweep/spire-85-100.png), [1-83,102](../codex/shots/geomsweep/spire-1-102.png), [90-94,102](../codex/shots/geomsweep/spire-90-102.png), [85-88,110](../codex/shots/geomsweep/spire-85-110.png), [84,114](../codex/shots/geomsweep/spire-84-114.png), [9-14,118](../codex/shots/geomsweep/spire-9-118.png), [42-47,118](../codex/shots/geomsweep/spire-42-118.png), [49-69,118](../codex/shots/geomsweep/spire-49-118.png), [71-76,118](../codex/shots/geomsweep/spire-71-118.png), [12-14,120](../codex/shots/geomsweep/spire-12-120.png)
[45-47,120](../codex/shots/geomsweep/spire-45-120.png), [74-76,120](../codex/shots/geomsweep/spire-74-120.png), [9-11,122](../codex/shots/geomsweep/spire-9-122.png), [42-44,122](../codex/shots/geomsweep/spire-42-122.png), [71-73,122](../codex/shots/geomsweep/spire-71-122.png), [12-14,124](../codex/shots/geomsweep/spire-12-124.png), [45-47,124](../codex/shots/geomsweep/spire-45-124.png), [74-76,124](../codex/shots/geomsweep/spire-74-124.png), [9-11,126](../codex/shots/geomsweep/spire-9-126.png), [42-44,126](../codex/shots/geomsweep/spire-42-126.png), [71-73,126](../codex/shots/geomsweep/spire-71-126.png), [8,128](../codex/shots/geomsweep/spire-8-128.png)
[12-15,128](../codex/shots/geomsweep/spire-12-128.png), [41,128](../codex/shots/geomsweep/spire-41-128.png), [45-48,128](../codex/shots/geomsweep/spire-45-128.png), [70,128](../codex/shots/geomsweep/spire-70-128.png), [74-77,128](../codex/shots/geomsweep/spire-74-128.png), [2-3,132](../codex/shots/geomsweep/spire-2-132.png), [5-18,134](../codex/shots/geomsweep/spire-5-134.png), [26-59,137](../codex/shots/geomsweep/spire-26-137.png), [60-62,138](../codex/shots/geomsweep/spire-60-138.png), [63-65,140](../codex/shots/geomsweep/spire-63-140.png), [66-68,142](../codex/shots/geomsweep/spire-66-142.png), [27-40,144](../codex/shots/geomsweep/spire-27-144.png)
[69-71,144](../codex/shots/geomsweep/spire-69-144.png), [4,146](../codex/shots/geomsweep/spire-4-146.png), [66-68,146](../codex/shots/geomsweep/spire-66-146.png), [69-71,148](../codex/shots/geomsweep/spire-69-148.png), [31-37,152](../codex/shots/geomsweep/spire-31-152.png), [57-64,152](../codex/shots/geomsweep/spire-57-152.png), [92-93,152](../codex/shots/geomsweep/spire-92-152.png), [1-30,154](../codex/shots/geomsweep/spire-1-154.png), [38-56,154](../codex/shots/geomsweep/spire-38-154.png), [65-90,154](../codex/shots/geomsweep/spire-65-154.png), [33-35,155](../codex/shots/geomsweep/spire-33-155.png), [35-37,157](../codex/shots/geomsweep/spire-35-157.png)
[37-39,159](../codex/shots/geomsweep/spire-37-159.png), [39-41,161](../codex/shots/geomsweep/spire-39-161.png), [41-43,163](../codex/shots/geomsweep/spire-41-163.png), [43-45,165](../codex/shots/geomsweep/spire-43-165.png), [91,166](../codex/shots/geomsweep/spire-91-166.png), [45-47,167](../codex/shots/geomsweep/spire-45-167.png), [73-77,172](../codex/shots/geomsweep/spire-73-172.png), [1-72,174](../codex/shots/geomsweep/spire-1-174.png), [78-94,174](../codex/shots/geomsweep/spire-78-174.png), [4-6,178](../codex/shots/geomsweep/spire-4-178.png), [73-77,178](../codex/shots/geomsweep/spire-73-178.png), [8-10,180](../codex/shots/geomsweep/spire-8-180.png)
[4-6,182](../codex/shots/geomsweep/spire-4-182.png), [8-10,184](../codex/shots/geomsweep/spire-8-184.png), [4-6,186](../codex/shots/geomsweep/spire-4-186.png), [72-80,186](../codex/shots/geomsweep/spire-72-186.png), [8-10,188](../codex/shots/geomsweep/spire-8-188.png), [4-6,190](../codex/shots/geomsweep/spire-4-190.png), [8-10,192](../codex/shots/geomsweep/spire-8-192.png), [53-67,196](../codex/shots/geomsweep/spire-53-196.png), [1-12,198](../codex/shots/geomsweep/spire-1-198.png), [24-52,198](../codex/shots/geomsweep/spire-24-198.png), [68-94,198](../codex/shots/geomsweep/spire-68-198.png), [13-23,199](../codex/shots/geomsweep/spire-13-199.png)
[86-88,204](../codex/shots/geomsweep/spire-86-204.png), [90-92,206](../codex/shots/geomsweep/spire-90-206.png), [86-88,208](../codex/shots/geomsweep/spire-86-208.png), [90-92,210](../codex/shots/geomsweep/spire-90-210.png), [86-88,212](../codex/shots/geomsweep/spire-86-212.png), [90-92,214](../codex/shots/geomsweep/spire-90-214.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with monastery stone corbels and chain hangers, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 2. crown — 113 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [748-750,8](../codex/shots/geomsweep/crown-748-8.png), [678-704,9](../codex/shots/geomsweep/crown-678-9.png), [708-713,9](../codex/shots/geomsweep/crown-708-9.png), [715-747,9](../codex/shots/geomsweep/crown-715-9.png), [751-760,9](../codex/shots/geomsweep/crown-751-9.png), [762-851,9](../codex/shots/geomsweep/crown-762-9.png), [890-933,9](../codex/shots/geomsweep/crown-890-9.png), [682-685,12](../codex/shots/geomsweep/crown-682-12.png), [761,13](../codex/shots/geomsweep/crown-761-13.png), [888-889,13](../codex/shots/geomsweep/crown-888-13.png), [685-686,14](../codex/shots/geomsweep/crown-685-14.png), [694-707,14](../codex/shots/geomsweep/crown-694-14.png)
[775-776,14](../codex/shots/geomsweep/crown-775-14.png), [791-792,14](../codex/shots/geomsweep/crown-791-14.png), [803-804,14](../codex/shots/geomsweep/crown-803-14.png), [866-868,14](../codex/shots/geomsweep/crown-866-14.png), [708-710,15](../codex/shots/geomsweep/crown-708-15.png), [688-690,16](../codex/shots/geomsweep/crown-688-16.png), [852-853,19](../codex/shots/geomsweep/crown-852-19.png), [754-756,22](../codex/shots/geomsweep/crown-754-22.png), [757-759,24](../codex/shots/geomsweep/crown-757-24.png), [678-753,25](../codex/shots/geomsweep/crown-678-25.png), [754-756,26](../codex/shots/geomsweep/crown-754-26.png), [757-759,28](../codex/shots/geomsweep/crown-757-28.png)
[754-756,30](../codex/shots/geomsweep/crown-754-30.png), [757-759,32](../codex/shots/geomsweep/crown-757-32.png), [693-712,34](../codex/shots/geomsweep/crown-693-34.png), [726-738,34](../codex/shots/geomsweep/crown-726-34.png), [754-756,34](../codex/shots/geomsweep/crown-754-34.png), [689-691,36](../codex/shots/geomsweep/crown-689-36.png), [740-742,36](../codex/shots/geomsweep/crown-740-36.png), [757-759,36](../codex/shots/geomsweep/crown-757-36.png), [399-414,40](../codex/shots/geomsweep/crown-399-40.png), [417-421,40](../codex/shots/geomsweep/crown-417-40.png), [423-428,40](../codex/shots/geomsweep/crown-423-40.png), [432-440,40](../codex/shots/geomsweep/crown-432-40.png)
[442-449,40](../codex/shots/geomsweep/crown-442-40.png), [678,41](../codex/shots/geomsweep/crown-678-41.png), [679-682,42](../codex/shots/geomsweep/crown-679-42.png), [711-716,43](../codex/shots/geomsweep/crown-711-43.png), [660-665,44](../codex/shots/geomsweep/crown-660-44.png), [680-683,44](../codex/shots/geomsweep/crown-680-44.png), [625-635,45](../codex/shots/geomsweep/crown-625-45.png), [399-405,46](../codex/shots/geomsweep/crown-399-46.png), [418-424,46](../codex/shots/geomsweep/crown-418-46.png), [684-687,46](../codex/shots/geomsweep/crown-684-46.png), [729-732,46](../codex/shots/geomsweep/crown-729-46.png), [442-447,48](../codex/shots/geomsweep/crown-442-48.png)
[688-691,48](../codex/shots/geomsweep/crown-688-48.png), [734-736,48](../codex/shots/geomsweep/crown-734-48.png), [470-582,49](../codex/shots/geomsweep/crown-470-49.png), [390-392,50](../codex/shots/geomsweep/crown-390-50.png), [399-405,50](../codex/shots/geomsweep/crown-399-50.png), [242-294,52](../codex/shots/geomsweep/crown-242-52.png), [418-424,52](../codex/shots/geomsweep/crown-418-52.png), [532-535,52](../codex/shots/geomsweep/crown-532-52.png), [530-531,53](../codex/shots/geomsweep/crown-530-53.png), [678-735,53](../codex/shots/geomsweep/crown-678-53.png), [737-751,53](../codex/shots/geomsweep/crown-737-53.png), [756-760,53](../codex/shots/geomsweep/crown-756-53.png)
[266-269,54](../codex/shots/geomsweep/crown-266-54.png), [354-357,54](../codex/shots/geomsweep/crown-354-54.png), [390-392,54](../codex/shots/geomsweep/crown-390-54.png), [399-405,54](../codex/shots/geomsweep/crown-399-54.png), [526-528,54](../codex/shots/geomsweep/crown-526-54.png), [540-542,54](../codex/shots/geomsweep/crown-540-54.png), [311-316,55](../codex/shots/geomsweep/crown-311-55.png), [523-524,55](../codex/shots/geomsweep/crown-523-55.png), [152-156,56](../codex/shots/geomsweep/crown-152-56.png), [262-265,56](../codex/shots/geomsweep/crown-262-56.png), [441-447,56](../codex/shots/geomsweep/crown-441-56.png), [520-522,56](../codex/shots/geomsweep/crown-520-56.png)
[615-620,56](../codex/shots/geomsweep/crown-615-56.png), [622-624,56](../codex/shots/geomsweep/crown-622-56.png), [750-753,56](../codex/shots/geomsweep/crown-750-56.png), [185-191,57](../codex/shots/geomsweep/crown-185-57.png), [231-235,57](../codex/shots/geomsweep/crown-231-57.png), [237-241,57](../codex/shots/geomsweep/crown-237-57.png), [321,57](../codex/shots/geomsweep/crown-321-57.png), [323,57](../codex/shots/geomsweep/crown-323-57.png), [468-469,57](../codex/shots/geomsweep/crown-468-57.png), [584-585,57](../codex/shots/geomsweep/crown-584-57.png), [677,57](../codex/shots/geomsweep/crown-677-57.png), [258-261,58](../codex/shots/geomsweep/crown-258-58.png)
[390-392,58](../codex/shots/geomsweep/crown-390-58.png), [399-405,58](../codex/shots/geomsweep/crown-399-58.png), [417-424,58](../codex/shots/geomsweep/crown-417-58.png), [627-628,58](../codex/shots/geomsweep/crown-627-58.png), [631-633,58](../codex/shots/geomsweep/crown-631-58.png), [643-645,58](../codex/shots/geomsweep/crown-643-58.png), [746-749,58](../codex/shots/geomsweep/crown-746-58.png), [524-568,59](../codex/shots/geomsweep/crown-524-59.png), [122-126,60](../codex/shots/geomsweep/crown-122-60.png), [166-169,60](../codex/shots/geomsweep/crown-166-60.png), [254-257,60](../codex/shots/geomsweep/crown-254-60.png), [603-605,60](../codex/shots/geomsweep/crown-603-60.png)
[647-649,60](../codex/shots/geomsweep/crown-647-60.png), [742-745,60](../codex/shots/geomsweep/crown-742-60.png), [152-157,62](../codex/shots/geomsweep/crown-152-62.png), [161-163,62](../codex/shots/geomsweep/crown-161-62.png), [180-182,62](../codex/shots/geomsweep/crown-180-62.png), [399-406,62](../codex/shots/geomsweep/crown-399-62.png), [615-621,62](../codex/shots/geomsweep/crown-615-62.png), [139-141,63](../codex/shots/geomsweep/crown-139-63.png), [145-149,64](../codex/shots/geomsweep/crown-145-64.png), [223-230,64](../codex/shots/geomsweep/crown-223-64.png), [123-128,66](../codex/shots/geomsweep/crown-123-66.png), [79-92,67](../codex/shots/geomsweep/crown-79-67.png)
[65-78,72](../codex/shots/geomsweep/crown-65-72.png), [3-35,73](../codex/shots/geomsweep/crown-3-73.png), [7-40,79](../codex/shots/geomsweep/crown-7-79.png), [3-36,85](../codex/shots/geomsweep/crown-3-85.png), [9-40,91](../codex/shots/geomsweep/crown-9-91.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with castle masonry and arch corbels, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 3. hanging — 97 finding(s)

- Tile top: [40,9](../codex/shots/geomsweep/hanging-40-9.png), [41,9](../codex/shots/geomsweep/hanging-41-9.png), [42,9](../codex/shots/geomsweep/hanging-42-9.png), [43,9](../codex/shots/geomsweep/hanging-43-9.png), [44,9](../codex/shots/geomsweep/hanging-44-9.png), [63,9](../codex/shots/geomsweep/hanging-63-9.png), [64,9](../codex/shots/geomsweep/hanging-64-9.png), [65,9](../codex/shots/geomsweep/hanging-65-9.png), [66,9](../codex/shots/geomsweep/hanging-66-9.png), [67,9](../codex/shots/geomsweep/hanging-67-9.png), [60,10](../codex/shots/geomsweep/hanging-60-10.png), [61,10](../codex/shots/geomsweep/hanging-61-10.png)
[34,11](../codex/shots/geomsweep/hanging-34-11.png), [35,11](../codex/shots/geomsweep/hanging-35-11.png), [36,11](../codex/shots/geomsweep/hanging-36-11.png), [47,11](../codex/shots/geomsweep/hanging-47-11.png), [48,11](../codex/shots/geomsweep/hanging-48-11.png), [70,11](../codex/shots/geomsweep/hanging-70-11.png), [71,11](../codex/shots/geomsweep/hanging-71-11.png), [74,11](../codex/shots/geomsweep/hanging-74-11.png), [75,11](../codex/shots/geomsweep/hanging-75-11.png), [76,11](../codex/shots/geomsweep/hanging-76-11.png), [51,12](../codex/shots/geomsweep/hanging-51-12.png), [52,12](../codex/shots/geomsweep/hanging-52-12.png)
[53,12](../codex/shots/geomsweep/hanging-53-12.png), [54,12](../codex/shots/geomsweep/hanging-54-12.png), [55,12](../codex/shots/geomsweep/hanging-55-12.png), [56,12](../codex/shots/geomsweep/hanging-56-12.png), [29,14](../codex/shots/geomsweep/hanging-29-14.png), [30,14](../codex/shots/geomsweep/hanging-30-14.png), [31,14](../codex/shots/geomsweep/hanging-31-14.png), [79,14](../codex/shots/geomsweep/hanging-79-14.png), [80,14](../codex/shots/geomsweep/hanging-80-14.png), [81,14](../codex/shots/geomsweep/hanging-81-14.png), [24,17](../codex/shots/geomsweep/hanging-24-17.png), [25,17](../codex/shots/geomsweep/hanging-25-17.png)
[26,17](../codex/shots/geomsweep/hanging-26-17.png), [84,17](../codex/shots/geomsweep/hanging-84-17.png), [85,17](../codex/shots/geomsweep/hanging-85-17.png), [86,17](../codex/shots/geomsweep/hanging-86-17.png), [43,43](../codex/shots/geomsweep/hanging-43-43.png), [44,43](../codex/shots/geomsweep/hanging-44-43.png), [45,43](../codex/shots/geomsweep/hanging-45-43.png), [66,44](../codex/shots/geomsweep/hanging-66-44.png), [67,44](../codex/shots/geomsweep/hanging-67-44.png), [68,44](../codex/shots/geomsweep/hanging-68-44.png), [38,45](../codex/shots/geomsweep/hanging-38-45.png), [39,45](../codex/shots/geomsweep/hanging-39-45.png)
[72,46](../codex/shots/geomsweep/hanging-72-46.png), [73,46](../codex/shots/geomsweep/hanging-73-46.png), [56,48](../codex/shots/geomsweep/hanging-56-48.png), [57,48](../codex/shots/geomsweep/hanging-57-48.png), [58,48](../codex/shots/geomsweep/hanging-58-48.png), [76,49](../codex/shots/geomsweep/hanging-76-49.png), [77,49](../codex/shots/geomsweep/hanging-77-49.png), [78,49](../codex/shots/geomsweep/hanging-78-49.png), [40,51](../codex/shots/geomsweep/hanging-40-51.png), [38,102](../codex/shots/geomsweep/hanging-38-102.png), [39,102](../codex/shots/geomsweep/hanging-39-102.png), [40,102](../codex/shots/geomsweep/hanging-40-102.png)
[24,104](../codex/shots/geomsweep/hanging-24-104.png), [25,104](../codex/shots/geomsweep/hanging-25-104.png), [26,104](../codex/shots/geomsweep/hanging-26-104.png), [47,123](../codex/shots/geomsweep/hanging-47-123.png), [48,123](../codex/shots/geomsweep/hanging-48-123.png), [49,123](../codex/shots/geomsweep/hanging-49-123.png), [50,123](../codex/shots/geomsweep/hanging-50-123.png), [51,123](../codex/shots/geomsweep/hanging-51-123.png), [33,127](../codex/shots/geomsweep/hanging-33-127.png), [34,127](../codex/shots/geomsweep/hanging-34-127.png), [35,127](../codex/shots/geomsweep/hanging-35-127.png), [36,127](../codex/shots/geomsweep/hanging-36-127.png)
[65,127](../codex/shots/geomsweep/hanging-65-127.png), [66,127](../codex/shots/geomsweep/hanging-66-127.png), [67,127](../codex/shots/geomsweep/hanging-67-127.png), [68,127](../codex/shots/geomsweep/hanging-68-127.png)
- Mover top: none
- Unsupported overhang: [60,10](../codex/shots/geomsweep/hanging-60-10.png), [47,11](../codex/shots/geomsweep/hanging-47-11.png), [6-108,23](../codex/shots/geomsweep/hanging-6-23.png), [52-57,38](../codex/shots/geomsweep/hanging-52-38.png), [1-13,41](../codex/shots/geomsweep/hanging-1-41.png), [38-108,55](../codex/shots/geomsweep/hanging-38-55.png), [70-72,63](../codex/shots/geomsweep/hanging-70-63.png), [1-35,69](../codex/shots/geomsweep/hanging-1-69.png), [6-108,83](../codex/shots/geomsweep/hanging-6-83.png), [66-67,94](../codex/shots/geomsweep/hanging-66-94.png), [69-71,94](../codex/shots/geomsweep/hanging-69-94.png), [1-27,97](../codex/shots/geomsweep/hanging-1-97.png)
[56-65,97](../codex/shots/geomsweep/hanging-56-97.png), [72-99,97](../codex/shots/geomsweep/hanging-72-97.png), [32-40,115](../codex/shots/geomsweep/hanging-32-115.png), [42-51,115](../codex/shots/geomsweep/hanging-42-115.png), [53-62,115](../codex/shots/geomsweep/hanging-53-115.png), [64-69,115](../codex/shots/geomsweep/hanging-64-115.png), [71-79,121](../codex/shots/geomsweep/hanging-71-121.png), [20-31,123](../codex/shots/geomsweep/hanging-20-123.png), [47-51,123](../codex/shots/geomsweep/hanging-47-123.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with cliff ropes and timber hangers, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 4. kings — 79 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [606-608,3](../codex/shots/geomsweep/kings-606-3.png), [651-653,3](../codex/shots/geomsweep/kings-651-3.png), [609-614,5](../codex/shots/geomsweep/kings-609-5.png), [618-623,5](../codex/shots/geomsweep/kings-618-5.png), [636-641,5](../codex/shots/geomsweep/kings-636-5.png), [645-650,5](../codex/shots/geomsweep/kings-645-5.png), [413-416,7](../codex/shots/geomsweep/kings-413-7.png), [430-432,7](../codex/shots/geomsweep/kings-430-7.png), [529-536,7](../codex/shots/geomsweep/kings-529-7.png), [591-593,7](../codex/shots/geomsweep/kings-591-7.png), [61-62,8](../codex/shots/geomsweep/kings-61-8.png), [64-66,8](../codex/shots/geomsweep/kings-64-8.png)
[427-428,8](../codex/shots/geomsweep/kings-427-8.png), [542-543,8](../codex/shots/geomsweep/kings-542-8.png), [576-578,8](../codex/shots/geomsweep/kings-576-8.png), [582-584,8](../codex/shots/geomsweep/kings-582-8.png), [614-616,8](../codex/shots/geomsweep/kings-614-8.png), [626-628,8](../codex/shots/geomsweep/kings-626-8.png), [640-642,8](../codex/shots/geomsweep/kings-640-8.png), [155-156,9](../codex/shots/geomsweep/kings-155-9.png), [164-167,9](../codex/shots/geomsweep/kings-164-9.png), [291-293,9](../codex/shots/geomsweep/kings-291-9.png), [393-397,9](../codex/shots/geomsweep/kings-393-9.png), [453-455,9](../codex/shots/geomsweep/kings-453-9.png)
[539-541,9](../codex/shots/geomsweep/kings-539-9.png), [563-565,9](../codex/shots/geomsweep/kings-563-9.png), [587-589,9](../codex/shots/geomsweep/kings-587-9.png), [602-607,9](../codex/shots/geomsweep/kings-602-9.png), [650-654,9](../codex/shots/geomsweep/kings-650-9.png), [90-92,10](../codex/shots/geomsweep/kings-90-10.png), [99-100,10](../codex/shots/geomsweep/kings-99-10.png), [116-118,10](../codex/shots/geomsweep/kings-116-10.png), [249-250,10](../codex/shots/geomsweep/kings-249-10.png), [264-265,10](../codex/shots/geomsweep/kings-264-10.png), [532-534,10](../codex/shots/geomsweep/kings-532-10.png), [543-545,10](../codex/shots/geomsweep/kings-543-10.png)
[553-555,10](../codex/shots/geomsweep/kings-553-10.png), [570-573,10](../codex/shots/geomsweep/kings-570-10.png), [103-105,11](../codex/shots/geomsweep/kings-103-11.png), [121-123,11](../codex/shots/geomsweep/kings-121-11.png), [261-262,11](../codex/shots/geomsweep/kings-261-11.png), [266-267,11](../codex/shots/geomsweep/kings-266-11.png), [321-323,11](../codex/shots/geomsweep/kings-321-11.png), [16-19,12](../codex/shots/geomsweep/kings-16-12.png), [38-40,12](../codex/shots/geomsweep/kings-38-12.png), [86-88,12](../codex/shots/geomsweep/kings-86-12.png), [95-97,12](../codex/shots/geomsweep/kings-95-12.png), [107-109,12](../codex/shots/geomsweep/kings-107-12.png)
[112-114,12](../codex/shots/geomsweep/kings-112-12.png), [125-127,12](../codex/shots/geomsweep/kings-125-12.png), [129-132,12](../codex/shots/geomsweep/kings-129-12.png), [244-246,12](../codex/shots/geomsweep/kings-244-12.png), [253-254,12](../codex/shots/geomsweep/kings-253-12.png), [270-272,12](../codex/shots/geomsweep/kings-270-12.png), [316-318,12](../codex/shots/geomsweep/kings-316-12.png), [336-338,12](../codex/shots/geomsweep/kings-336-12.png), [345-347,12](../codex/shots/geomsweep/kings-345-12.png), [341-343,13](../codex/shots/geomsweep/kings-341-13.png), [11-13,14](../codex/shots/geomsweep/kings-11-14.png), [22-24,14](../codex/shots/geomsweep/kings-22-14.png)
[33-35,14](../codex/shots/geomsweep/kings-33-14.png), [331-333,14](../codex/shots/geomsweep/kings-331-14.png), [480-515,14](../codex/shots/geomsweep/kings-480-14.png), [403-452,15](../codex/shots/geomsweep/kings-403-15.png), [455-466,15](../codex/shots/geomsweep/kings-455-15.png), [6-8,16](../codex/shots/geomsweep/kings-6-16.png), [27-29,16](../codex/shots/geomsweep/kings-27-16.png), [45-84,16](../codex/shots/geomsweep/kings-45-16.png), [133-198,16](../codex/shots/geomsweep/kings-133-16.png), [490-492,17](../codex/shots/geomsweep/kings-490-17.png), [502-504,17](../codex/shots/geomsweep/kings-502-17.png), [513-514,17](../codex/shots/geomsweep/kings-513-17.png)
[484-486,18](../codex/shots/geomsweep/kings-484-18.png), [496-498,18](../codex/shots/geomsweep/kings-496-18.png), [508-510,18](../codex/shots/geomsweep/kings-508-18.png), [481-482,20](../codex/shots/geomsweep/kings-481-20.png), [314-316,21](../codex/shots/geomsweep/kings-314-21.png), [336-338,21](../codex/shots/geomsweep/kings-336-21.png), [484-485,22](../codex/shots/geomsweep/kings-484-22.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with branch hangers and rope ties, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 5. spore — 76 finding(s)

- Tile top: [153,8](../codex/shots/geomsweep/spore-153-8.png), [139,9](../codex/shots/geomsweep/spore-139-9.png), [90,11](../codex/shots/geomsweep/spore-90-11.png), [123,11](../codex/shots/geomsweep/spore-123-11.png), [304,13](../codex/shots/geomsweep/spore-304-13.png), [377,17](../codex/shots/geomsweep/spore-377-17.png), [378,17](../codex/shots/geomsweep/spore-378-17.png), [379,17](../codex/shots/geomsweep/spore-379-17.png), [389,17](../codex/shots/geomsweep/spore-389-17.png), [390,17](../codex/shots/geomsweep/spore-390-17.png), [391,17](../codex/shots/geomsweep/spore-391-17.png), [49,18](../codex/shots/geomsweep/spore-49-18.png)
[27,19](../codex/shots/geomsweep/spore-27-19.png), [173,19](../codex/shots/geomsweep/spore-173-19.png), [180,19](../codex/shots/geomsweep/spore-180-19.png), [185,19](../codex/shots/geomsweep/spore-185-19.png), [196,19](../codex/shots/geomsweep/spore-196-19.png), [202,19](../codex/shots/geomsweep/spore-202-19.png), [336,19](../codex/shots/geomsweep/spore-336-19.png), [337,19](../codex/shots/geomsweep/spore-337-19.png), [338,19](../codex/shots/geomsweep/spore-338-19.png), [339,19](../codex/shots/geomsweep/spore-339-19.png), [346,19](../codex/shots/geomsweep/spore-346-19.png), [347,19](../codex/shots/geomsweep/spore-347-19.png)
[348,19](../codex/shots/geomsweep/spore-348-19.png), [349,19](../codex/shots/geomsweep/spore-349-19.png), [350,19](../codex/shots/geomsweep/spore-350-19.png), [358,19](../codex/shots/geomsweep/spore-358-19.png), [359,19](../codex/shots/geomsweep/spore-359-19.png), [360,19](../codex/shots/geomsweep/spore-360-19.png), [361,19](../codex/shots/geomsweep/spore-361-19.png), [362,19](../codex/shots/geomsweep/spore-362-19.png), [383,19](../codex/shots/geomsweep/spore-383-19.png), [384,19](../codex/shots/geomsweep/spore-384-19.png), [385,19](../codex/shots/geomsweep/spore-385-19.png), [395,19](../codex/shots/geomsweep/spore-395-19.png)
[396,19](../codex/shots/geomsweep/spore-396-19.png), [397,19](../codex/shots/geomsweep/spore-397-19.png), [508,19](../codex/shots/geomsweep/spore-508-19.png), [514,19](../codex/shots/geomsweep/spore-514-19.png), [48,25](../codex/shots/geomsweep/spore-48-25.png), [375,25](../codex/shots/geomsweep/spore-375-25.png), [381,25](../codex/shots/geomsweep/spore-381-25.png), [387,25](../codex/shots/geomsweep/spore-387-25.png), [393,25](../codex/shots/geomsweep/spore-393-25.png), [398,25](../codex/shots/geomsweep/spore-398-25.png), [478,25](../codex/shots/geomsweep/spore-478-25.png), [479,25](../codex/shots/geomsweep/spore-479-25.png)
[480,25](../codex/shots/geomsweep/spore-480-25.png), [481,25](../codex/shots/geomsweep/spore-481-25.png), [482,25](../codex/shots/geomsweep/spore-482-25.png)
- Mover top: none
- Unsupported overhang: [121-125,4](../codex/shots/geomsweep/spore-121-4.png), [143-145,4](../codex/shots/geomsweep/spore-143-4.png), [156-158,4](../codex/shots/geomsweep/spore-156-4.png), [133-135,6](../codex/shots/geomsweep/spore-133-6.png), [148-150,6](../codex/shots/geomsweep/spore-148-6.png), [91-93,7](../codex/shots/geomsweep/spore-91-7.png), [96-97,8](../codex/shots/geomsweep/spore-96-8.png), [174-177,8](../codex/shots/geomsweep/spore-174-8.png), [290-293,8](../codex/shots/geomsweep/spore-290-8.png), [302-306,8](../codex/shots/geomsweep/spore-302-8.png), [431-447,9](../codex/shots/geomsweep/spore-431-9.png), [132-133,10](../codex/shots/geomsweep/spore-132-10.png)
[210-244,10](../codex/shots/geomsweep/spore-210-10.png), [48-50,12](../codex/shots/geomsweep/spore-48-12.png), [52-54,12](../codex/shots/geomsweep/spore-52-12.png), [56-58,12](../codex/shots/geomsweep/spore-56-12.png), [135-170,13](../codex/shots/geomsweep/spore-135-13.png), [501-503,14](../codex/shots/geomsweep/spore-501-14.png), [519-521,14](../codex/shots/geomsweep/spore-519-14.png), [497-499,16](../codex/shots/geomsweep/spore-497-16.png), [523-525,16](../codex/shots/geomsweep/spore-523-16.png), [394-397,17](../codex/shots/geomsweep/spore-394-17.png), [431-432,17](../codex/shots/geomsweep/spore-431-17.png), [47-49,19](../codex/shots/geomsweep/spore-47-19.png)
[434-435,21](../codex/shots/geomsweep/spore-434-21.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with fungal stems and mycelium shelves, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 6. sealedpyramid — 74 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [1019-1023,1](../codex/shots/geomsweep/sealedpyramid-1019-1.png), [1030-1034,1](../codex/shots/geomsweep/sealedpyramid-1030-1.png), [1007-1018,3](../codex/shots/geomsweep/sealedpyramid-1007-3.png), [1024-1029,3](../codex/shots/geomsweep/sealedpyramid-1024-3.png), [1035-1046,3](../codex/shots/geomsweep/sealedpyramid-1035-3.png), [38-42,13](../codex/shots/geomsweep/sealedpyramid-38-13.png), [80-85,13](../codex/shots/geomsweep/sealedpyramid-80-13.png), [963-1003,13](../codex/shots/geomsweep/sealedpyramid-963-13.png), [64-67,15](../codex/shots/geomsweep/sealedpyramid-64-15.png), [71-79,15](../codex/shots/geomsweep/sealedpyramid-71-15.png), [86-121,15](../codex/shots/geomsweep/sealedpyramid-86-15.png), [172-215,15](../codex/shots/geomsweep/sealedpyramid-172-15.png)
[27-31,17](../codex/shots/geomsweep/sealedpyramid-27-17.png), [250-325,17](../codex/shots/geomsweep/sealedpyramid-250-17.png), [1004-1006,17](../codex/shots/geomsweep/sealedpyramid-1004-17.png), [1047-1050,17](../codex/shots/geomsweep/sealedpyramid-1047-17.png), [14-18,21](../codex/shots/geomsweep/sealedpyramid-14-21.png), [125-126,21](../codex/shots/geomsweep/sealedpyramid-125-21.png), [100-117,23](../codex/shots/geomsweep/sealedpyramid-100-23.png), [121-124,23](../codex/shots/geomsweep/sealedpyramid-121-23.png), [127-171,23](../codex/shots/geomsweep/sealedpyramid-127-23.png), [216-249,23](../codex/shots/geomsweep/sealedpyramid-216-23.png), [951-962,23](../codex/shots/geomsweep/sealedpyramid-951-23.png), [990-992,24](../codex/shots/geomsweep/sealedpyramid-990-24.png)
[995-997,24](../codex/shots/geomsweep/sealedpyramid-995-24.png), [885-950,25](../codex/shots/geomsweep/sealedpyramid-885-25.png), [980-982,26](../codex/shots/geomsweep/sealedpyramid-980-26.png), [985-987,26](../codex/shots/geomsweep/sealedpyramid-985-26.png), [970-972,28](../codex/shots/geomsweep/sealedpyramid-970-28.png), [975-977,28](../codex/shots/geomsweep/sealedpyramid-975-28.png), [797-852,29](../codex/shots/geomsweep/sealedpyramid-797-29.png), [250-305,30](../codex/shots/geomsweep/sealedpyramid-250-30.png), [328-333,30](../codex/shots/geomsweep/sealedpyramid-328-30.png), [965-967,30](../codex/shots/geomsweep/sealedpyramid-965-30.png), [303-306,32](../codex/shots/geomsweep/sealedpyramid-303-32.png), [344-347,33](../codex/shots/geomsweep/sealedpyramid-344-33.png)
[360-363,33](../codex/shots/geomsweep/sealedpyramid-360-33.png), [863-884,33](../codex/shots/geomsweep/sealedpyramid-863-33.png), [194-198,34](../codex/shots/geomsweep/sealedpyramid-194-34.png), [334-343,35](../codex/shots/geomsweep/sealedpyramid-334-35.png), [348-359,35](../codex/shots/geomsweep/sealedpyramid-348-35.png), [364-405,35](../codex/shots/geomsweep/sealedpyramid-364-35.png), [669-726,35](../codex/shots/geomsweep/sealedpyramid-669-35.png), [741-796,35](../codex/shots/geomsweep/sealedpyramid-741-35.png), [854-862,35](../codex/shots/geomsweep/sealedpyramid-854-35.png), [608-609,37](../codex/shots/geomsweep/sealedpyramid-608-37.png), [806-818,37](../codex/shots/geomsweep/sealedpyramid-806-37.png), [389-392,38](../codex/shots/geomsweep/sealedpyramid-389-38.png)
[619-668,38](../codex/shots/geomsweep/sealedpyramid-619-38.png), [557-607,39](../codex/shots/geomsweep/sealedpyramid-557-39.png), [728-740,41](../codex/shots/geomsweep/sealedpyramid-728-41.png), [452-491,42](../codex/shots/geomsweep/sealedpyramid-452-42.png), [524-525,42](../codex/shots/geomsweep/sealedpyramid-524-42.png), [677-690,42](../codex/shots/geomsweep/sealedpyramid-677-42.png), [693-699,42](../codex/shots/geomsweep/sealedpyramid-693-42.png), [744-751,42](../codex/shots/geomsweep/sealedpyramid-744-42.png), [763-766,42](../codex/shots/geomsweep/sealedpyramid-763-42.png), [412-418,43](../codex/shots/geomsweep/sealedpyramid-412-43.png), [493-523,44](../codex/shots/geomsweep/sealedpyramid-493-44.png), [526-556,44](../codex/shots/geomsweep/sealedpyramid-526-44.png)
[612-618,44](../codex/shots/geomsweep/sealedpyramid-612-44.png), [393-396,45](../codex/shots/geomsweep/sealedpyramid-393-45.png), [404-411,45](../codex/shots/geomsweep/sealedpyramid-404-45.png), [419-425,45](../codex/shots/geomsweep/sealedpyramid-419-45.png), [427-441,45](../codex/shots/geomsweep/sealedpyramid-427-45.png), [886-890,46](../codex/shots/geomsweep/sealedpyramid-886-46.png), [926-930,47](../codex/shots/geomsweep/sealedpyramid-926-47.png), [549-552,50](../codex/shots/geomsweep/sealedpyramid-549-50.png), [896-900,50](../codex/shots/geomsweep/sealedpyramid-896-50.png), [912-916,50](../codex/shots/geomsweep/sealedpyramid-912-50.png), [442-451,52](../codex/shots/geomsweep/sealedpyramid-442-52.png), [510-515,53](../codex/shots/geomsweep/sealedpyramid-510-53.png)
[529-532,53](../codex/shots/geomsweep/sealedpyramid-529-53.png), [543-545,53](../codex/shots/geomsweep/sealedpyramid-543-53.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with pyramid stone and tomb corbels, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 7. minecart — 73 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [366-378,8](../codex/shots/geomsweep/minecart-366-8.png), [200-225,9](../codex/shots/geomsweep/minecart-200-9.png), [227-239,9](../codex/shots/geomsweep/minecart-227-9.png), [226,10](../codex/shots/geomsweep/minecart-226-10.png), [240,10](../codex/shots/geomsweep/minecart-240-10.png), [270-282,10](../codex/shots/geomsweep/minecart-270-10.png), [190-199,12](../codex/shots/geomsweep/minecart-190-12.png), [241-258,12](../codex/shots/geomsweep/minecart-241-12.png), [263-268,12](../codex/shots/geomsweep/minecart-263-12.png), [346-365,12](../codex/shots/geomsweep/minecart-346-12.png), [379-444,12](../codex/shots/geomsweep/minecart-379-12.png), [456-477,12](../codex/shots/geomsweep/minecart-456-12.png)
[860-872,12](../codex/shots/geomsweep/minecart-860-12.png), [259-262,13](../codex/shots/geomsweep/minecart-259-13.png), [586-592,13](../codex/shots/geomsweep/minecart-586-13.png), [769-781,13](../codex/shots/geomsweep/minecart-769-13.png), [1012-1024,13](../codex/shots/geomsweep/minecart-1012-13.png), [51-63,14](../codex/shots/geomsweep/minecart-51-14.png), [807-819,14](../codex/shots/geomsweep/minecart-807-14.png), [956-968,14](../codex/shots/geomsweep/minecart-956-14.png), [64-94,15](../codex/shots/geomsweep/minecart-64-15.png), [164-171,15](../codex/shots/geomsweep/minecart-164-15.png), [269,15](../codex/shots/geomsweep/minecart-269-15.png), [445-455,15](../codex/shots/geomsweep/minecart-445-15.png)
[478-495,15](../codex/shots/geomsweep/minecart-478-15.png), [104-142,16](../codex/shots/geomsweep/minecart-104-16.png), [510-522,16](../codex/shots/geomsweep/minecart-510-16.png), [561-573,16](../codex/shots/geomsweep/minecart-561-16.png), [837-851,16](../codex/shots/geomsweep/minecart-837-16.png), [982-994,16](../codex/shots/geomsweep/minecart-982-16.png), [11-30,17](../codex/shots/geomsweep/minecart-11-17.png), [95-103,17](../codex/shots/geomsweep/minecart-95-17.png), [496-509,17](../codex/shots/geomsweep/minecart-496-17.png), [523-560,17](../codex/shots/geomsweep/minecart-523-17.png), [574-578,17](../codex/shots/geomsweep/minecart-574-17.png), [593-609,17](../codex/shots/geomsweep/minecart-593-17.png)
[762-768,17](../codex/shots/geomsweep/minecart-762-17.png), [782-806,17](../codex/shots/geomsweep/minecart-782-17.png), [820-836,17](../codex/shots/geomsweep/minecart-820-17.png), [852-859,17](../codex/shots/geomsweep/minecart-852-17.png), [873-888,17](../codex/shots/geomsweep/minecart-873-17.png), [944-955,17](../codex/shots/geomsweep/minecart-944-17.png), [969-981,17](../codex/shots/geomsweep/minecart-969-17.png), [1004-1011,17](../codex/shots/geomsweep/minecart-1004-17.png), [1025-1028,17](../codex/shots/geomsweep/minecart-1025-17.png), [35-50,18](../codex/shots/geomsweep/minecart-35-18.png), [721-733,18](../codex/shots/geomsweep/minecart-721-18.png), [889-894,18](../codex/shots/geomsweep/minecart-889-18.png)
[734-736,19](../codex/shots/geomsweep/minecart-734-19.png), [1029-1065,19](../codex/shots/geomsweep/minecart-1029-19.png), [0-10,20](../codex/shots/geomsweep/minecart-0-20.png), [31-34,20](../codex/shots/geomsweep/minecart-31-20.png), [579-585,20](../codex/shots/geomsweep/minecart-579-20.png), [610-630,20](../codex/shots/geomsweep/minecart-610-20.png), [652-664,20](../codex/shots/geomsweep/minecart-652-20.png), [708-720,20](../codex/shots/geomsweep/minecart-708-20.png), [737-746,20](../codex/shots/geomsweep/minecart-737-20.png), [895-921,20](../codex/shots/geomsweep/minecart-895-20.png), [923-926,20](../codex/shots/geomsweep/minecart-923-20.png), [995-1003,20](../codex/shots/geomsweep/minecart-995-20.png)
[198-217,21](../codex/shots/geomsweep/minecart-198-21.png), [694-707,24](../codex/shots/geomsweep/minecart-694-24.png), [280-305,25](../codex/shots/geomsweep/minecart-280-25.png), [314-344,25](../codex/shots/geomsweep/minecart-314-25.png), [642-651,25](../codex/shots/geomsweep/minecart-642-25.png), [152-155,26](../codex/shots/geomsweep/minecart-152-26.png), [162-168,26](../codex/shots/geomsweep/minecart-162-26.png), [564-572,27](../codex/shots/geomsweep/minecart-564-27.png), [631-641,27](../codex/shots/geomsweep/minecart-631-27.png), [668-693,27](../codex/shots/geomsweep/minecart-668-27.png), [737-742,30](../codex/shots/geomsweep/minecart-737-30.png), [857-882,30](../codex/shots/geomsweep/minecart-857-30.png)
[985-1005,30](../codex/shots/geomsweep/minecart-985-30.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with rail trestles and mine timber, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 8. hurricane — 68 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [690-699,10](../codex/shots/geomsweep/hurricane-690-10.png), [702-710,10](../codex/shots/geomsweep/hurricane-702-10.png), [272-288,11](../codex/shots/geomsweep/hurricane-272-11.png), [602-616,11](../codex/shots/geomsweep/hurricane-602-11.png), [74-85,12](../codex/shots/geomsweep/hurricane-74-12.png), [88,12](../codex/shots/geomsweep/hurricane-88-12.png), [250-262,12](../codex/shots/geomsweep/hurricane-250-12.png), [292-299,12](../codex/shots/geomsweep/hurricane-292-12.png), [302-306,12](../codex/shots/geomsweep/hurricane-302-12.png), [580-585,12](../codex/shots/geomsweep/hurricane-580-12.png), [588-594,12](../codex/shots/geomsweep/hurricane-588-12.png), [620-629,12](../codex/shots/geomsweep/hurricane-620-12.png)
[632-634,12](../codex/shots/geomsweep/hurricane-632-12.png), [102-103,14](../codex/shots/geomsweep/hurricane-102-14.png), [262-265,14](../codex/shots/geomsweep/hurricane-262-14.png), [612-613,14](../codex/shots/geomsweep/hurricane-612-14.png), [137-140,15](../codex/shots/geomsweep/hurricane-137-15.png), [155-158,15](../codex/shots/geomsweep/hurricane-155-15.png), [497-500,15](../codex/shots/geomsweep/hurricane-497-15.png), [520-523,15](../codex/shots/geomsweep/hurricane-520-15.png), [542-545,15](../codex/shots/geomsweep/hurricane-542-15.png), [22-45,16](../codex/shots/geomsweep/hurricane-22-16.png), [47-52,16](../codex/shots/geomsweep/hurricane-47-16.png), [184-216,16](../codex/shots/geomsweep/hurricane-184-16.png)
[126-133,19](../codex/shots/geomsweep/hurricane-126-19.png), [136-142,19](../codex/shots/geomsweep/hurricane-136-19.png), [145-151,19](../codex/shots/geomsweep/hurricane-145-19.png), [154-160,19](../codex/shots/geomsweep/hurricane-154-19.png), [163-169,19](../codex/shots/geomsweep/hurricane-163-19.png), [172-174,19](../codex/shots/geomsweep/hurricane-172-19.png), [336-350,19](../codex/shots/geomsweep/hurricane-336-19.png), [414-418,19](../codex/shots/geomsweep/hurricane-414-19.png), [486-493,19](../codex/shots/geomsweep/hurricane-486-19.png), [496-511,19](../codex/shots/geomsweep/hurricane-496-19.png), [514-547,19](../codex/shots/geomsweep/hurricane-514-19.png), [550-554,19](../codex/shots/geomsweep/hurricane-550-19.png)
[20-65,20](../codex/shots/geomsweep/hurricane-20-20.png), [68-94,20](../codex/shots/geomsweep/hurricane-68-20.png), [97-125,20](../codex/shots/geomsweep/hurricane-97-20.png), [175-235,20](../codex/shots/geomsweep/hurricane-175-20.png), [238-242,20](../codex/shots/geomsweep/hurricane-238-20.png), [245-265,20](../codex/shots/geomsweep/hurricane-245-20.png), [289-333,20](../codex/shots/geomsweep/hurricane-289-20.png), [351-369,20](../codex/shots/geomsweep/hurricane-351-20.png), [376-413,20](../codex/shots/geomsweep/hurricane-376-20.png), [419-427,20](../codex/shots/geomsweep/hurricane-419-20.png), [430-475,20](../codex/shots/geomsweep/hurricane-430-20.png), [478-485,20](../codex/shots/geomsweep/hurricane-478-20.png)
[559-578,20](../codex/shots/geomsweep/hurricane-559-20.png), [581-593,20](../codex/shots/geomsweep/hurricane-581-20.png), [606-635,20](../codex/shots/geomsweep/hurricane-606-20.png), [638-663,20](../codex/shots/geomsweep/hurricane-638-20.png), [666-699,20](../codex/shots/geomsweep/hurricane-666-20.png), [702-729,20](../codex/shots/geomsweep/hurricane-702-20.png), [732-740,20](../codex/shots/geomsweep/hurricane-732-20.png), [272-282,21](../codex/shots/geomsweep/hurricane-272-21.png), [604-605,22](../codex/shots/geomsweep/hurricane-604-22.png), [506-511,24](../codex/shots/geomsweep/hurricane-506-24.png), [514-519,24](../codex/shots/geomsweep/hurricane-514-24.png), [522-537,24](../codex/shots/geomsweep/hurricane-522-24.png)
[540,24](../codex/shots/geomsweep/hurricane-540-24.png), [500-503,25](../codex/shots/geomsweep/hurricane-500-25.png), [541-544,25](../codex/shots/geomsweep/hurricane-541-25.png), [16-333,27](../codex/shots/geomsweep/hurricane-16-27.png), [351-413,27](../codex/shots/geomsweep/hurricane-351-27.png), [419-485,27](../codex/shots/geomsweep/hurricane-419-27.png), [557-744,27](../codex/shots/geomsweep/hurricane-557-27.png), [486-556,35](../codex/shots/geomsweep/hurricane-486-35.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with wreck timber and mast stays, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 9. buriedcity — 67 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [337-408,5](../codex/shots/geomsweep/buriedcity-337-5.png), [798-799,14](../codex/shots/geomsweep/buriedcity-798-14.png), [845-884,14](../codex/shots/geomsweep/buriedcity-845-14.png), [721-725,16](../codex/shots/geomsweep/buriedcity-721-16.png), [727-730,16](../codex/shots/geomsweep/buriedcity-727-16.png), [769-770,16](../codex/shots/geomsweep/buriedcity-769-16.png), [812-814,16](../codex/shots/geomsweep/buriedcity-812-16.png), [5-8,19](../codex/shots/geomsweep/buriedcity-5-19.png), [112-123,19](../codex/shots/geomsweep/buriedcity-112-19.png), [130-139,19](../codex/shots/geomsweep/buriedcity-130-19.png), [142-155,19](../codex/shots/geomsweep/buriedcity-142-19.png), [157-233,19](../codex/shots/geomsweep/buriedcity-157-19.png)
[817-819,20](../codex/shots/geomsweep/buriedcity-817-20.png), [17-21,21](../codex/shots/geomsweep/buriedcity-17-21.png), [468-538,21](../codex/shots/geomsweep/buriedcity-468-21.png), [586-590,21](../codex/shots/geomsweep/buriedcity-586-21.png), [593-597,21](../codex/shots/geomsweep/buriedcity-593-21.png), [599-700,21](../codex/shots/geomsweep/buriedcity-599-21.png), [702-706,21](../codex/shots/geomsweep/buriedcity-702-21.png), [822-843,22](../codex/shots/geomsweep/buriedcity-822-22.png), [38-51,23](../codex/shots/geomsweep/buriedcity-38-23.png), [56-60,23](../codex/shots/geomsweep/buriedcity-56-23.png), [75-111,23](../codex/shots/geomsweep/buriedcity-75-23.png), [282-291,24](../codex/shots/geomsweep/buriedcity-282-24.png)
[812-814,24](../codex/shots/geomsweep/buriedcity-812-24.png), [149-151,25](../codex/shots/geomsweep/buriedcity-149-25.png), [156,25](../codex/shots/geomsweep/buriedcity-156-25.png), [217-222,25](../codex/shots/geomsweep/buriedcity-217-25.png), [413-451,25](../codex/shots/geomsweep/buriedcity-413-25.png), [293-313,26](../codex/shots/geomsweep/buriedcity-293-26.png), [321-336,26](../codex/shots/geomsweep/buriedcity-321-26.png), [844,26](../codex/shots/geomsweep/buriedcity-844-26.png), [237-270,27](../codex/shots/geomsweep/buriedcity-237-27.png), [655-659,27](../codex/shots/geomsweep/buriedcity-655-27.png), [702-706,27](../codex/shots/geomsweep/buriedcity-702-27.png), [821,27](../codex/shots/geomsweep/buriedcity-821-27.png)
[62-73,28](../codex/shots/geomsweep/buriedcity-62-28.png), [113-116,28](../codex/shots/geomsweep/buriedcity-113-28.png), [271-280,28](../codex/shots/geomsweep/buriedcity-271-28.png), [409-412,28](../codex/shots/geomsweep/buriedcity-409-28.png), [701,28](../codex/shots/geomsweep/buriedcity-701-28.png), [710-809,28](../codex/shots/geomsweep/buriedcity-710-28.png), [817-819,28](../codex/shots/geomsweep/buriedcity-817-28.png), [40-43,29](../codex/shots/geomsweep/buriedcity-40-29.png), [281,29](../codex/shots/geomsweep/buriedcity-281-29.png), [292,29](../codex/shots/geomsweep/buriedcity-292-29.png), [326-332,29](../codex/shots/geomsweep/buriedcity-326-29.png), [406-408,29](../codex/shots/geomsweep/buriedcity-406-29.png)
[593-598,29](../codex/shots/geomsweep/buriedcity-593-29.png), [296-300,30](../codex/shots/geomsweep/buriedcity-296-30.png), [453-467,30](../codex/shots/geomsweep/buriedcity-453-30.png), [648-652,30](../codex/shots/geomsweep/buriedcity-648-30.png), [118-121,31](../codex/shots/geomsweep/buriedcity-118-31.png), [134-138,31](../codex/shots/geomsweep/buriedcity-134-31.png), [452,31](../codex/shots/geomsweep/buriedcity-452-31.png), [61,33](../codex/shots/geomsweep/buriedcity-61-33.png), [74,33](../codex/shots/geomsweep/buriedcity-74-33.png), [140-141,33](../codex/shots/geomsweep/buriedcity-140-33.png), [540-584,33](../codex/shots/geomsweep/buriedcity-540-33.png), [342-344,34](../codex/shots/geomsweep/buriedcity-342-34.png)
[346-348,34](../codex/shots/geomsweep/buriedcity-346-34.png), [234-236,35](../codex/shots/geomsweep/buriedcity-234-35.png), [416-420,39](../codex/shots/geomsweep/buriedcity-416-39.png), [547-551,39](../codex/shots/geomsweep/buriedcity-547-39.png), [565-569,39](../codex/shots/geomsweep/buriedcity-565-39.png), [539,40](../codex/shots/geomsweep/buriedcity-539-40.png), [585,41](../codex/shots/geomsweep/buriedcity-585-41.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with sandstone corbels, pipe brackets and chains, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 10. keep — 65 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [642-652,15](../codex/shots/geomsweep/keep-642-15.png), [629-641,19](../codex/shots/geomsweep/keep-629-19.png), [653-668,19](../codex/shots/geomsweep/keep-653-19.png), [1-71,23](../codex/shots/geomsweep/keep-1-23.png), [125-166,23](../codex/shots/geomsweep/keep-125-23.png), [171-186,23](../codex/shots/geomsweep/keep-171-23.png), [223-320,23](../codex/shots/geomsweep/keep-223-23.png), [351-371,23](../codex/shots/geomsweep/keep-351-23.png), [602-628,23](../codex/shots/geomsweep/keep-602-23.png), [712-718,23](../codex/shots/geomsweep/keep-712-23.png), [726-732,23](../codex/shots/geomsweep/keep-726-23.png), [740-746,23](../codex/shots/geomsweep/keep-740-23.png)
[676-681,25](../codex/shots/geomsweep/keep-676-25.png), [687-693,25](../codex/shots/geomsweep/keep-687-25.png), [699-704,25](../codex/shots/geomsweep/keep-699-25.png), [480-522,27](../codex/shots/geomsweep/keep-480-27.png), [733-739,27](../codex/shots/geomsweep/keep-733-27.png), [602-606,28](../codex/shots/geomsweep/keep-602-28.png), [431-434,29](../codex/shots/geomsweep/keep-431-29.png), [682-686,29](../codex/shots/geomsweep/keep-682-29.png), [694-698,29](../codex/shots/geomsweep/keep-694-29.png), [188-219,30](../codex/shots/geomsweep/keep-188-30.png), [322-347,30](../codex/shots/geomsweep/keep-322-30.png), [418-430,32](../codex/shots/geomsweep/keep-418-32.png)
[435-453,32](../codex/shots/geomsweep/keep-435-32.png), [609-613,32](../codex/shots/geomsweep/keep-609-32.png), [721-722,34](../codex/shots/geomsweep/keep-721-34.png), [602-606,36](../codex/shots/geomsweep/keep-602-36.png), [656-668,37](../codex/shots/geomsweep/keep-656-37.png), [745-749,38](../codex/shots/geomsweep/keep-745-38.png), [72-124,40](../codex/shots/geomsweep/keep-72-40.png), [609-613,40](../codex/shots/geomsweep/keep-609-40.png), [618-623,41](../codex/shots/geomsweep/keep-618-41.png), [626-629,41](../codex/shots/geomsweep/keep-626-41.png), [632-635,41](../codex/shots/geomsweep/keep-632-41.png), [709-713,41](../codex/shots/geomsweep/keep-709-41.png)
[167-170,44](../codex/shots/geomsweep/keep-167-44.png), [333-340,44](../codex/shots/geomsweep/keep-333-44.png), [372-396,44](../codex/shots/geomsweep/keep-372-44.png), [568-571,44](../codex/shots/geomsweep/keep-568-44.png), [579-582,44](../codex/shots/geomsweep/keep-579-44.png), [590-593,44](../codex/shots/geomsweep/keep-590-44.png), [602-606,44](../codex/shots/geomsweep/keep-602-44.png), [538-541,46](../codex/shots/geomsweep/keep-538-46.png), [560-567,47](../codex/shots/geomsweep/keep-560-47.png), [572-578,47](../codex/shots/geomsweep/keep-572-47.png), [583-589,47](../codex/shots/geomsweep/keep-583-47.png), [594-601,47](../codex/shots/geomsweep/keep-594-47.png)
[187,49](../codex/shots/geomsweep/keep-187-49.png), [220-222,49](../codex/shots/geomsweep/keep-220-49.png), [321,49](../codex/shots/geomsweep/keep-321-49.png), [348-350,49](../codex/shots/geomsweep/keep-348-49.png), [400-417,49](../codex/shots/geomsweep/keep-400-49.png), [523-537,49](../codex/shots/geomsweep/keep-523-49.png), [542-556,49](../codex/shots/geomsweep/keep-542-49.png), [624-625,49](../codex/shots/geomsweep/keep-624-49.png), [630-631,49](../codex/shots/geomsweep/keep-630-49.png), [636-637,49](../codex/shots/geomsweep/keep-636-49.png), [454-479,50](../codex/shots/geomsweep/keep-454-50.png), [557-559,51](../codex/shots/geomsweep/keep-557-51.png)
[614-615,51](../codex/shots/geomsweep/keep-614-51.png), [617,51](../codex/shots/geomsweep/keep-617-51.png), [670-672,51](../codex/shots/geomsweep/keep-670-51.png), [707-708,52](../codex/shots/geomsweep/keep-707-52.png), [750-756,52](../codex/shots/geomsweep/keep-750-52.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with keep masonry and buttresses, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 11. welltown — 65 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [321,11](../codex/shots/geomsweep/welltown-321-11.png), [323,11](../codex/shots/geomsweep/welltown-323-11.png), [324,14](../codex/shots/geomsweep/welltown-324-14.png), [345-346,15](../codex/shots/geomsweep/welltown-345-15.png), [348-349,15](../codex/shots/geomsweep/welltown-348-15.png), [367,15](../codex/shots/geomsweep/welltown-367-15.png), [369-370,15](../codex/shots/geomsweep/welltown-369-15.png), [151,19](../codex/shots/geomsweep/welltown-151-19.png), [473,21](../codex/shots/geomsweep/welltown-473-21.png), [514,21](../codex/shots/geomsweep/welltown-514-21.png), [450-454,22](../codex/shots/geomsweep/welltown-450-22.png), [480-485,22](../codex/shots/geomsweep/welltown-480-22.png)
[504-509,22](../codex/shots/geomsweep/welltown-504-22.png), [91,23](../codex/shots/geomsweep/welltown-91-23.png), [130,23](../codex/shots/geomsweep/welltown-130-23.png), [29-41,24](../codex/shots/geomsweep/welltown-29-24.png), [92-97,24](../codex/shots/geomsweep/welltown-92-24.png), [99-107,24](../codex/shots/geomsweep/welltown-99-24.png), [109-117,24](../codex/shots/geomsweep/welltown-109-24.png), [122-129,24](../codex/shots/geomsweep/welltown-122-24.png), [460-463,24](../codex/shots/geomsweep/welltown-460-24.png), [465-468,24](../codex/shots/geomsweep/welltown-465-24.png), [98,25](../codex/shots/geomsweep/welltown-98-25.png), [108,25](../codex/shots/geomsweep/welltown-108-25.png)
[118,25](../codex/shots/geomsweep/welltown-118-25.png), [47-52,26](../codex/shots/geomsweep/welltown-47-26.png), [320,26](../codex/shots/geomsweep/welltown-320-26.png), [432-440,28](../codex/shots/geomsweep/welltown-432-28.png), [442-446,28](../codex/shots/geomsweep/welltown-442-28.png), [198-238,30](../codex/shots/geomsweep/welltown-198-30.png), [514-519,30](../codex/shots/geomsweep/welltown-514-30.png), [522-529,30](../codex/shots/geomsweep/welltown-522-30.png), [531-543,30](../codex/shots/geomsweep/welltown-531-30.png), [545-555,30](../codex/shots/geomsweep/welltown-545-30.png), [557-577,30](../codex/shots/geomsweep/welltown-557-30.png), [666-669,30](../codex/shots/geomsweep/welltown-666-30.png)
[530,31](../codex/shots/geomsweep/welltown-530-31.png), [544,31](../codex/shots/geomsweep/welltown-544-31.png), [556,31](../codex/shots/geomsweep/welltown-556-31.png), [166-175,33](../codex/shots/geomsweep/welltown-166-33.png), [178-187,33](../codex/shots/geomsweep/welltown-178-33.png), [189-196,33](../codex/shots/geomsweep/welltown-189-33.png), [239-250,33](../codex/shots/geomsweep/welltown-239-33.png), [252-254,33](../codex/shots/geomsweep/welltown-252-33.png), [198-199,34](../codex/shots/geomsweep/welltown-198-34.png), [201-211,34](../codex/shots/geomsweep/welltown-201-34.png), [213-223,34](../codex/shots/geomsweep/welltown-213-34.png), [225-235,34](../codex/shots/geomsweep/welltown-225-34.png)
[237,34](../codex/shots/geomsweep/welltown-237-34.png), [188,35](../codex/shots/geomsweep/welltown-188-35.png), [200,35](../codex/shots/geomsweep/welltown-200-35.png), [212,35](../codex/shots/geomsweep/welltown-212-35.png), [224,35](../codex/shots/geomsweep/welltown-224-35.png), [236,35](../codex/shots/geomsweep/welltown-236-35.png), [560-566,38](../codex/shots/geomsweep/welltown-560-38.png), [648-665,40](../codex/shots/geomsweep/welltown-648-40.png), [670-687,40](../codex/shots/geomsweep/welltown-670-40.png), [570-603,41](../codex/shots/geomsweep/welltown-570-41.png), [618-646,43](../codex/shots/geomsweep/welltown-618-43.png), [604-610,44](../codex/shots/geomsweep/welltown-604-44.png)
[613-617,44](../codex/shots/geomsweep/welltown-613-44.png), [648-653,48](../codex/shots/geomsweep/welltown-648-48.png), [682-687,48](../codex/shots/geomsweep/welltown-682-48.png), [689-699,49](../codex/shots/geomsweep/welltown-689-49.png), [647,52](../codex/shots/geomsweep/welltown-647-52.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with sandstone walls and cistern arches, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 12. redgorge — 52 finding(s)

- Tile top: [107,23](../codex/shots/geomsweep/redgorge-107-23.png), [108,23](../codex/shots/geomsweep/redgorge-108-23.png), [113,23](../codex/shots/geomsweep/redgorge-113-23.png), [114,23](../codex/shots/geomsweep/redgorge-114-23.png), [117,23](../codex/shots/geomsweep/redgorge-117-23.png), [118,23](../codex/shots/geomsweep/redgorge-118-23.png), [123,23](../codex/shots/geomsweep/redgorge-123-23.png), [124,23](../codex/shots/geomsweep/redgorge-124-23.png)
- Mover top: none
- Unsupported overhang: [96-135,3](../codex/shots/geomsweep/redgorge-96-3.png), [49-56,11](../codex/shots/geomsweep/redgorge-49-11.png), [58-94,11](../codex/shots/geomsweep/redgorge-58-11.png), [95,15](../codex/shots/geomsweep/redgorge-95-15.png), [136-141,15](../codex/shots/geomsweep/redgorge-136-15.png), [44-48,18](../codex/shots/geomsweep/redgorge-44-18.png), [82-85,22](../codex/shots/geomsweep/redgorge-82-22.png), [3-8,26](../codex/shots/geomsweep/redgorge-3-26.png), [17-29,32](../codex/shots/geomsweep/redgorge-17-32.png), [4-16,33](../codex/shots/geomsweep/redgorge-4-33.png), [23-38,42](../codex/shots/geomsweep/redgorge-23-42.png), [58-73,43](../codex/shots/geomsweep/redgorge-58-43.png)
[27-38,48](../codex/shots/geomsweep/redgorge-27-48.png), [58-62,49](../codex/shots/geomsweep/redgorge-58-49.png), [57,55](../codex/shots/geomsweep/redgorge-57-55.png), [8-21,59](../codex/shots/geomsweep/redgorge-8-59.png), [34-44,64](../codex/shots/geomsweep/redgorge-34-64.png), [19-21,65](../codex/shots/geomsweep/redgorge-19-65.png), [5-16,70](../codex/shots/geomsweep/redgorge-5-70.png), [19-44,70](../codex/shots/geomsweep/redgorge-19-70.png), [45-53,77](../codex/shots/geomsweep/redgorge-45-77.png), [16-21,80](../codex/shots/geomsweep/redgorge-16-80.png), [3-21,90](../codex/shots/geomsweep/redgorge-3-90.png), [3-44,94](../codex/shots/geomsweep/redgorge-3-94.png)
[38-44,97](../codex/shots/geomsweep/redgorge-38-97.png), [22-44,114](../codex/shots/geomsweep/redgorge-22-114.png), [3-16,118](../codex/shots/geomsweep/redgorge-3-118.png), [19-23,118](../codex/shots/geomsweep/redgorge-19-118.png), [3-21,128](../codex/shots/geomsweep/redgorge-3-128.png), [28-44,132](../codex/shots/geomsweep/redgorge-28-132.png), [27-31,136](../codex/shots/geomsweep/redgorge-27-136.png), [32-44,137](../codex/shots/geomsweep/redgorge-32-137.png), [3-26,138](../codex/shots/geomsweep/redgorge-3-138.png), [3-44,142](../codex/shots/geomsweep/redgorge-3-142.png), [4-12,148](../codex/shots/geomsweep/redgorge-4-148.png), [48-78,149](../codex/shots/geomsweep/redgorge-48-149.png)
[29-33,156](../codex/shots/geomsweep/redgorge-29-156.png), [45-47,160](../codex/shots/geomsweep/redgorge-45-160.png), [48-56,166](../codex/shots/geomsweep/redgorge-48-166.png), [48-57,175](../codex/shots/geomsweep/redgorge-48-175.png), [51-57,191](../codex/shots/geomsweep/redgorge-51-191.png), [79-141,199](../codex/shots/geomsweep/redgorge-79-199.png), [63-78,205](../codex/shots/geomsweep/redgorge-63-205.png), [48-55,207](../codex/shots/geomsweep/redgorge-48-207.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with gorge rock and camp timber, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 13. underwell — 52 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [3-14,2](../codex/shots/geomsweep/underwell-3-2.png), [3-9,7](../codex/shots/geomsweep/underwell-3-7.png), [9-14,12](../codex/shots/geomsweep/underwell-9-12.png), [3-8,17](../codex/shots/geomsweep/underwell-3-17.png), [157-222,21](../codex/shots/geomsweep/underwell-157-21.png), [232-277,21](../codex/shots/geomsweep/underwell-232-21.png), [280-298,21](../codex/shots/geomsweep/underwell-280-21.png), [9-14,22](../codex/shots/geomsweep/underwell-9-22.png), [45-131,23](../codex/shots/geomsweep/underwell-45-23.png), [590-624,23](../codex/shots/geomsweep/underwell-590-23.png), [150-155,25](../codex/shots/geomsweep/underwell-150-25.png), [444-507,26](../codex/shots/geomsweep/underwell-444-26.png)
[513-517,26](../codex/shots/geomsweep/underwell-513-26.png), [519-534,26](../codex/shots/geomsweep/underwell-519-26.png), [625-666,26](../codex/shots/geomsweep/underwell-625-26.png), [3-8,27](../codex/shots/geomsweep/underwell-3-27.png), [394-409,27](../codex/shots/geomsweep/underwell-394-27.png), [412-430,27](../codex/shots/geomsweep/underwell-412-27.png), [433-437,27](../codex/shots/geomsweep/underwell-433-27.png), [285-288,28](../codex/shots/geomsweep/underwell-285-28.png), [535-561,29](../codex/shots/geomsweep/underwell-535-29.png), [565-577,29](../codex/shots/geomsweep/underwell-565-29.png), [580-589,29](../codex/shots/geomsweep/underwell-580-29.png), [410-411,30](../codex/shots/geomsweep/underwell-410-30.png)
[141-158,31](../codex/shots/geomsweep/underwell-141-31.png), [161-212,31](../codex/shots/geomsweep/underwell-161-31.png), [280-283,31](../codex/shots/geomsweep/underwell-280-31.png), [9-14,32](../codex/shots/geomsweep/underwell-9-32.png), [438-447,32](../codex/shots/geomsweep/underwell-438-32.png), [449-459,32](../codex/shots/geomsweep/underwell-449-32.png), [489-497,32](../codex/shots/geomsweep/underwell-489-32.png), [285-288,34](../codex/shots/geomsweep/underwell-285-34.png), [586-589,34](../codex/shots/geomsweep/underwell-586-34.png), [460-488,35](../codex/shots/geomsweep/underwell-460-35.png), [535-538,35](../codex/shots/geomsweep/underwell-535-35.png), [640-657,36](../codex/shots/geomsweep/underwell-640-36.png)
[662-679,36](../codex/shots/geomsweep/underwell-662-36.png), [3-8,37](../codex/shots/geomsweep/underwell-3-37.png), [280-283,37](../codex/shots/geomsweep/underwell-280-37.png), [299-393,37](../codex/shots/geomsweep/underwell-299-37.png), [463-487,37](../codex/shots/geomsweep/underwell-463-37.png), [15-23,38](../codex/shots/geomsweep/underwell-15-38.png), [26-35,38](../codex/shots/geomsweep/underwell-26-38.png), [37-44,38](../codex/shots/geomsweep/underwell-37-38.png), [118-131,38](../codex/shots/geomsweep/underwell-118-38.png), [134-140,38](../codex/shots/geomsweep/underwell-134-38.png), [285-288,40](../codex/shots/geomsweep/underwell-285-40.png), [586-589,40](../codex/shots/geomsweep/underwell-586-40.png)
[562-564,41](../codex/shots/geomsweep/underwell-562-41.png), [640-645,44](../codex/shots/geomsweep/underwell-640-44.png), [656-664,44](../codex/shots/geomsweep/underwell-656-44.png), [674-679,44](../codex/shots/geomsweep/underwell-674-44.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with cistern stone and arches, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 14. ksar — 47 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [562-575,13](../codex/shots/geomsweep/ksar-562-13.png), [485-489,15](../codex/shots/geomsweep/ksar-485-15.png), [543-552,15](../codex/shots/geomsweep/ksar-543-15.png), [812-857,15](../codex/shots/geomsweep/ksar-812-15.png), [358-363,16](../codex/shots/geomsweep/ksar-358-16.png), [497-520,17](../codex/shots/geomsweep/ksar-497-17.png), [542,17](../codex/shots/geomsweep/ksar-542-17.png), [553,17](../codex/shots/geomsweep/ksar-553-17.png), [383-387,19](../codex/shots/geomsweep/ksar-383-19.png), [783-786,19](../codex/shots/geomsweep/ksar-783-19.png), [382,21](../codex/shots/geomsweep/ksar-382-21.png), [388,21](../codex/shots/geomsweep/ksar-388-21.png)
[622-625,21](../codex/shots/geomsweep/ksar-622-21.png), [632-635,21](../codex/shots/geomsweep/ksar-632-21.png), [109-121,22](../codex/shots/geomsweep/ksar-109-22.png), [258-268,23](../codex/shots/geomsweep/ksar-258-23.png), [783-786,23](../codex/shots/geomsweep/ksar-783-23.png), [108,24](../codex/shots/geomsweep/ksar-108-24.png), [122,24](../codex/shots/geomsweep/ksar-122-24.png), [165-186,24](../codex/shots/geomsweep/ksar-165-24.png), [417-430,25](../codex/shots/geomsweep/ksar-417-25.png), [239-251,26](../codex/shots/geomsweep/ksar-239-26.png), [674-680,26](../codex/shots/geomsweep/ksar-674-26.png), [330-346,27](../codex/shots/geomsweep/ksar-330-27.png)
[423-425,27](../codex/shots/geomsweep/ksar-423-27.png), [601-606,27](../codex/shots/geomsweep/ksar-601-27.png), [783-786,27](../codex/shots/geomsweep/ksar-783-27.png), [811,27](../codex/shots/geomsweep/ksar-811-27.png), [830-839,27](../codex/shots/geomsweep/ksar-830-27.png), [42-50,28](../codex/shots/geomsweep/ksar-42-28.png), [240-242,28](../codex/shots/geomsweep/ksar-240-28.png), [73-79,29](../codex/shots/geomsweep/ksar-73-29.png), [258-272,29](../codex/shots/geomsweep/ksar-258-29.png), [308-326,29](../codex/shots/geomsweep/ksar-308-29.png), [569-574,29](../codex/shots/geomsweep/ksar-569-29.png), [754-758,29](../codex/shots/geomsweep/ksar-754-29.png)
[41,30](../codex/shots/geomsweep/ksar-41-30.png), [51,30](../codex/shots/geomsweep/ksar-51-30.png), [243-245,30](../codex/shots/geomsweep/ksar-243-30.png), [281-284,30](../codex/shots/geomsweep/ksar-281-30.png), [290-293,30](../codex/shots/geomsweep/ksar-290-30.png), [334-337,30](../codex/shots/geomsweep/ksar-334-30.png), [687-692,30](../codex/shots/geomsweep/ksar-687-30.png), [720-724,30](../codex/shots/geomsweep/ksar-720-30.png), [767-772,30](../codex/shots/geomsweep/ksar-767-30.png), [813-820,30](../codex/shots/geomsweep/ksar-813-30.png), [849-856,30](../codex/shots/geomsweep/ksar-849-30.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with desert sandstone and fort corbels, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 15. canal — 46 finding(s)

- Tile top: none
- Mover top: [lift@400,41](../codex/shots/geomsweep/canal-400-41.png)
- Unsupported overhang: [304-308,1](../codex/shots/geomsweep/canal-304-1.png), [236-242,9](../codex/shots/geomsweep/canal-236-9.png), [279-298,10](../codex/shots/geomsweep/canal-279-10.png), [323,11](../codex/shots/geomsweep/canal-323-11.png), [244-247,12](../codex/shots/geomsweep/canal-244-12.png), [248-257,13](../codex/shots/geomsweep/canal-248-13.png), [260-265,13](../codex/shots/geomsweep/canal-260-13.png), [268-276,13](../codex/shots/geomsweep/canal-268-13.png), [299-300,13](../codex/shots/geomsweep/canal-299-13.png), [303-304,13](../codex/shots/geomsweep/canal-303-13.png), [306,13](../codex/shots/geomsweep/canal-306-13.png), [309-310,13](../codex/shots/geomsweep/canal-309-13.png)
[313-315,13](../codex/shots/geomsweep/canal-313-13.png), [318-322,13](../codex/shots/geomsweep/canal-318-13.png), [86-103,15](../codex/shots/geomsweep/canal-86-15.png), [258-259,15](../codex/shots/geomsweep/canal-258-15.png), [266-267,15](../codex/shots/geomsweep/canal-266-15.png), [277-278,15](../codex/shots/geomsweep/canal-277-15.png), [301-302,15](../codex/shots/geomsweep/canal-301-15.png), [305,15](../codex/shots/geomsweep/canal-305-15.png), [311-312,15](../codex/shots/geomsweep/canal-311-15.png), [316-317,15](../codex/shots/geomsweep/canal-316-15.png), [215-218,16](../codex/shots/geomsweep/canal-215-16.png), [232-246,16](../codex/shots/geomsweep/canal-232-16.png)
[110-112,18](../codex/shots/geomsweep/canal-110-18.png), [14-29,19](../codex/shots/geomsweep/canal-14-19.png), [86-94,21](../codex/shots/geomsweep/canal-86-21.png), [203-208,25](../codex/shots/geomsweep/canal-203-25.png), [85,29](../codex/shots/geomsweep/canal-85-29.png), [14-17,30](../codex/shots/geomsweep/canal-14-30.png), [86-123,30](../codex/shots/geomsweep/canal-86-30.png), [127-129,30](../codex/shots/geomsweep/canal-127-30.png), [139,30](../codex/shots/geomsweep/canal-139-30.png), [148-164,30](../codex/shots/geomsweep/canal-148-30.png), [393-395,33](../codex/shots/geomsweep/canal-393-33.png), [360-368,34](../codex/shots/geomsweep/canal-360-34.png)
[370-379,34](../codex/shots/geomsweep/canal-370-34.png), [396,34](../codex/shots/geomsweep/canal-396-34.png), [435,34](../codex/shots/geomsweep/canal-435-34.png), [56-58,35](../codex/shots/geomsweep/canal-56-35.png), [59-67,37](../codex/shots/geomsweep/canal-59-37.png), [16-22,41](../codex/shots/geomsweep/canal-16-41.png), [24-34,41](../codex/shots/geomsweep/canal-24-41.png), [346-369,41](../codex/shots/geomsweep/canal-346-41.png), [380-391,49](../codex/shots/geomsweep/canal-380-49.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with canal brick, lock beams and weed mats, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 16. deep — 44 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [4-107,9](../codex/shots/geomsweep/deep-4-9.png), [58-107,26](../codex/shots/geomsweep/deep-58-26.png), [6-50,33](../codex/shots/geomsweep/deep-6-33.png), [58-99,33](../codex/shots/geomsweep/deep-58-33.png), [101-105,33](../codex/shots/geomsweep/deep-101-33.png), [30-58,44](../codex/shots/geomsweep/deep-30-44.png), [66-96,50](../codex/shots/geomsweep/deep-66-50.png), [14-44,58](../codex/shots/geomsweep/deep-14-58.png), [102-105,61](../codex/shots/geomsweep/deep-102-61.png), [58-90,66](../codex/shots/geomsweep/deep-58-66.png), [6-73,73](../codex/shots/geomsweep/deep-6-73.png), [83-105,73](../codex/shots/geomsweep/deep-83-73.png)
[12-40,84](../codex/shots/geomsweep/deep-12-84.png), [62-98,90](../codex/shots/geomsweep/deep-62-90.png), [20-52,98](../codex/shots/geomsweep/deep-20-98.png), [63-96,106](../codex/shots/geomsweep/deep-63-106.png), [6-29,113](../codex/shots/geomsweep/deep-6-113.png), [39-105,113](../codex/shots/geomsweep/deep-39-113.png), [6-10,123](../codex/shots/geomsweep/deep-6-123.png), [58-98,124](../codex/shots/geomsweep/deep-58-124.png), [14-52,132](../codex/shots/geomsweep/deep-14-132.png), [56-94,140](../codex/shots/geomsweep/deep-56-140.png), [100-105,143](../codex/shots/geomsweep/deep-100-143.png), [16-54,148](../codex/shots/geomsweep/deep-16-148.png)
[8-13,157](../codex/shots/geomsweep/deep-8-157.png), [23-103,157](../codex/shots/geomsweep/deep-23-157.png), [84-89,162](../codex/shots/geomsweep/deep-84-162.png), [91-96,162](../codex/shots/geomsweep/deep-91-162.png), [8-53,168](../codex/shots/geomsweep/deep-8-168.png), [56-103,168](../codex/shots/geomsweep/deep-56-168.png), [8-15,179](../codex/shots/geomsweep/deep-8-179.png), [18-103,179](../codex/shots/geomsweep/deep-18-179.png), [8-89,189](../codex/shots/geomsweep/deep-8-189.png), [92-103,189](../codex/shots/geomsweep/deep-92-189.png), [8-43,201](../codex/shots/geomsweep/deep-8-201.png), [50-103,201](../codex/shots/geomsweep/deep-50-201.png)
[8-24,211](../codex/shots/geomsweep/deep-8-211.png), [88-103,215](../codex/shots/geomsweep/deep-88-215.png), [8-22,219](../codex/shots/geomsweep/deep-8-219.png), [112-154,223](../codex/shots/geomsweep/deep-112-223.png), [96-103,225](../codex/shots/geomsweep/deep-96-225.png), [8-16,227](../codex/shots/geomsweep/deep-8-227.png), [104-111,231](../codex/shots/geomsweep/deep-104-231.png), [155-160,237](../codex/shots/geomsweep/deep-155-237.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with mine stone and iron braces, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 17. marsh — 44 finding(s)

- Tile top: [120,14](../codex/shots/geomsweep/marsh-120-14.png), [121,14](../codex/shots/geomsweep/marsh-121-14.png), [331,15](../codex/shots/geomsweep/marsh-331-15.png), [364,15](../codex/shots/geomsweep/marsh-364-15.png), [365,15](../codex/shots/geomsweep/marsh-365-15.png), [390,15](../codex/shots/geomsweep/marsh-390-15.png), [391,15](../codex/shots/geomsweep/marsh-391-15.png), [392,15](../codex/shots/geomsweep/marsh-392-15.png), [452,15](../codex/shots/geomsweep/marsh-452-15.png), [457,15](../codex/shots/geomsweep/marsh-457-15.png), [458,15](../codex/shots/geomsweep/marsh-458-15.png), [55,16](../codex/shots/geomsweep/marsh-55-16.png)
[259,16](../codex/shots/geomsweep/marsh-259-16.png), [260,16](../codex/shots/geomsweep/marsh-260-16.png), [274,16](../codex/shots/geomsweep/marsh-274-16.png), [275,16](../codex/shots/geomsweep/marsh-275-16.png), [292,16](../codex/shots/geomsweep/marsh-292-16.png), [459,16](../codex/shots/geomsweep/marsh-459-16.png), [460,16](../codex/shots/geomsweep/marsh-460-16.png), [478,16](../codex/shots/geomsweep/marsh-478-16.png), [479,16](../codex/shots/geomsweep/marsh-479-16.png), [52,18](../codex/shots/geomsweep/marsh-52-18.png), [53,18](../codex/shots/geomsweep/marsh-53-18.png), [54,18](../codex/shots/geomsweep/marsh-54-18.png)
[50,20](../codex/shots/geomsweep/marsh-50-20.png), [51,20](../codex/shots/geomsweep/marsh-51-20.png)
- Mover top: none
- Unsupported overhang: [124-125,11](../codex/shots/geomsweep/marsh-124-11.png), [120-121,14](../codex/shots/geomsweep/marsh-120-14.png), [241-247,14](../codex/shots/geomsweep/marsh-241-14.png), [251-256,14](../codex/shots/geomsweep/marsh-251-14.png), [283-289,14](../codex/shots/geomsweep/marsh-283-14.png), [347-348,14](../codex/shots/geomsweep/marsh-347-14.png), [331-332,15](../codex/shots/geomsweep/marsh-331-15.png), [334-339,15](../codex/shots/geomsweep/marsh-334-15.png), [350-356,15](../codex/shots/geomsweep/marsh-350-15.png), [364-365,15](../codex/shots/geomsweep/marsh-364-15.png), [259-260,16](../codex/shots/geomsweep/marsh-259-16.png), [274-275,16](../codex/shots/geomsweep/marsh-274-16.png)
[292-293,16](../codex/shots/geomsweep/marsh-292-16.png), [326-330,16](../codex/shots/geomsweep/marsh-326-16.png), [342-346,16](../codex/shots/geomsweep/marsh-342-16.png), [359-363,16](../codex/shots/geomsweep/marsh-359-16.png), [367-370,17](../codex/shots/geomsweep/marsh-367-17.png), [52-54,18](../codex/shots/geomsweep/marsh-52-18.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with bog-oak piles and reed lashings, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 18. fallingtower — 42 finding(s)

- Tile top: [19,150](../codex/shots/geomsweep/fallingtower-19-150.png)
- Mover top: [wheel@93,87](../codex/shots/geomsweep/fallingtower-93-87.png), [wheel@91,91](../codex/shots/geomsweep/fallingtower-91-91.png), [wheel@88,87](../codex/shots/geomsweep/fallingtower-88-87.png), [wheel@103,86](../codex/shots/geomsweep/fallingtower-103-86.png), [wheel@100,89](../codex/shots/geomsweep/fallingtower-100-89.png), [wheel@99,85](../codex/shots/geomsweep/fallingtower-99-85.png)
- Unsupported overhang: [0-109,12](../codex/shots/geomsweep/fallingtower-0-12.png), [28-43,51](../codex/shots/geomsweep/fallingtower-28-51.png), [80-105,69](../codex/shots/geomsweep/fallingtower-80-69.png), [80-88,79](../codex/shots/geomsweep/fallingtower-80-79.png), [12-48,85](../codex/shots/geomsweep/fallingtower-12-85.png), [50-59,85](../codex/shots/geomsweep/fallingtower-50-85.png), [45-53,90](../codex/shots/geomsweep/fallingtower-45-90.png), [80-83,91](../codex/shots/geomsweep/fallingtower-80-91.png), [101-105,97](../codex/shots/geomsweep/fallingtower-101-97.png), [80-84,102](../codex/shots/geomsweep/fallingtower-80-102.png), [12-51,103](../codex/shots/geomsweep/fallingtower-12-103.png), [53-55,103](../codex/shots/geomsweep/fallingtower-53-103.png)
[100-105,109](../codex/shots/geomsweep/fallingtower-100-109.png), [80-83,114](../codex/shots/geomsweep/fallingtower-80-114.png), [12-42,121](../codex/shots/geomsweep/fallingtower-12-121.png), [44-59,121](../codex/shots/geomsweep/fallingtower-44-121.png), [80-84,130](../codex/shots/geomsweep/fallingtower-80-130.png), [102-105,137](../codex/shots/geomsweep/fallingtower-102-137.png), [12-18,157](../codex/shots/geomsweep/fallingtower-12-157.png), [20-59,157](../codex/shots/geomsweep/fallingtower-20-157.png), [15-22,171](../codex/shots/geomsweep/fallingtower-15-171.png), [14-18,183](../codex/shots/geomsweep/fallingtower-14-183.png), [34-44,193](../codex/shots/geomsweep/fallingtower-34-193.png), [46-59,193](../codex/shots/geomsweep/fallingtower-46-193.png)
[12-33,207](../codex/shots/geomsweep/fallingtower-12-207.png), [12-21,219](../codex/shots/geomsweep/fallingtower-12-219.png), [25-57,219](../codex/shots/geomsweep/fallingtower-25-219.png), [12-21,229](../codex/shots/geomsweep/fallingtower-12-229.png), [23-59,229](../codex/shots/geomsweep/fallingtower-23-229.png), [18-26,234](../codex/shots/geomsweep/fallingtower-18-234.png), [17-59,241](../codex/shots/geomsweep/fallingtower-17-241.png), [12-25,265](../codex/shots/geomsweep/fallingtower-12-265.png), [27-59,265](../codex/shots/geomsweep/fallingtower-27-265.png), [14-23,273](../codex/shots/geomsweep/fallingtower-14-273.png), [24-32,276](../codex/shots/geomsweep/fallingtower-24-276.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with tower masonry and iron ties, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 19. theatre — 42 finding(s)

- Tile top: none
- Mover top: [fly@275,33](../codex/shots/geomsweep/theatre-275-33.png)
- Unsupported overhang: [200-294,3](../codex/shots/geomsweep/theatre-200-3.png), [200-214,8](../codex/shots/geomsweep/theatre-200-8.png), [216-217,8](../codex/shots/geomsweep/theatre-216-8.png), [10-56,11](../codex/shots/geomsweep/theatre-10-11.png), [297-371,11](../codex/shots/geomsweep/theatre-297-11.png), [373-443,11](../codex/shots/geomsweep/theatre-373-11.png), [212-216,16](../codex/shots/geomsweep/theatre-212-16.png), [230-284,16](../codex/shots/geomsweep/theatre-230-16.png), [161-182,17](../codex/shots/geomsweep/theatre-161-17.png), [106-141,18](../codex/shots/geomsweep/theatre-106-18.png), [143-160,18](../codex/shots/geomsweep/theatre-143-18.png), [445-482,18](../codex/shots/geomsweep/theatre-445-18.png)
[57-71,20](../codex/shots/geomsweep/theatre-57-20.png), [239-246,20](../codex/shots/geomsweep/theatre-239-20.png), [397-417,22](../codex/shots/geomsweep/theatre-397-22.png), [420-423,22](../codex/shots/geomsweep/theatre-420-22.png), [58-63,24](../codex/shots/geomsweep/theatre-58-24.png), [178-182,24](../codex/shots/geomsweep/theatre-178-24.png), [19-38,25](../codex/shots/geomsweep/theatre-19-25.png), [230-234,25](../codex/shots/geomsweep/theatre-230-25.png), [288-293,25](../codex/shots/geomsweep/theatre-288-25.png), [311-316,25](../codex/shots/geomsweep/theatre-311-25.png), [447-482,25](../codex/shots/geomsweep/theatre-447-25.png), [2-9,26](../codex/shots/geomsweep/theatre-2-26.png)
[74-128,26](../codex/shots/geomsweep/theatre-74-26.png), [137-160,26](../codex/shots/geomsweep/theatre-137-26.png), [183-203,26](../codex/shots/geomsweep/theatre-183-26.png), [326-371,26](../codex/shots/geomsweep/theatre-326-26.png), [444,27](../codex/shots/geomsweep/theatre-444-27.png), [483,27](../codex/shots/geomsweep/theatre-483-27.png), [72-73,29](../codex/shots/geomsweep/theatre-72-29.png), [372,29](../codex/shots/geomsweep/theatre-372-29.png), [10-18,33](../codex/shots/geomsweep/theatre-10-33.png), [232-235,34](../codex/shots/geomsweep/theatre-232-34.png), [236-246,35](../codex/shots/geomsweep/theatre-236-35.png), [252-269,35](../codex/shots/geomsweep/theatre-252-35.png)
[275-299,35](../codex/shots/geomsweep/theatre-275-35.png), [303-308,35](../codex/shots/geomsweep/theatre-303-35.png), [218-227,37](../codex/shots/geomsweep/theatre-218-37.png), [247-251,40](../codex/shots/geomsweep/theatre-247-40.png), [270-274,40](../codex/shots/geomsweep/theatre-270-40.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with stage trusses and fly ropes, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 20. oreroad — 40 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [451-460,4](../codex/shots/geomsweep/oreroad-451-4.png), [462,4](../codex/shots/geomsweep/oreroad-462-4.png), [412,6](../codex/shots/geomsweep/oreroad-412-6.png), [414-440,6](../codex/shots/geomsweep/oreroad-414-6.png), [397-400,8](../codex/shots/geomsweep/oreroad-397-8.png), [416,9](../codex/shots/geomsweep/oreroad-416-9.png), [418-423,9](../codex/shots/geomsweep/oreroad-418-9.png), [453-460,9](../codex/shots/geomsweep/oreroad-453-9.png), [476-483,10](../codex/shots/geomsweep/oreroad-476-10.png), [505-512,10](../codex/shots/geomsweep/oreroad-505-10.png), [485-487,13](../codex/shots/geomsweep/oreroad-485-13.png), [502-504,13](../codex/shots/geomsweep/oreroad-502-13.png)
[376-384,17](../codex/shots/geomsweep/oreroad-376-17.png), [396-400,18](../codex/shots/geomsweep/oreroad-396-18.png), [427-429,20](../codex/shots/geomsweep/oreroad-427-20.png), [136-142,22](../codex/shots/geomsweep/oreroad-136-22.png), [144-191,22](../codex/shots/geomsweep/oreroad-144-22.png), [193-203,22](../codex/shots/geomsweep/oreroad-193-22.png), [231-238,24](../codex/shots/geomsweep/oreroad-231-24.png), [303,26](../codex/shots/geomsweep/oreroad-303-26.png), [305-308,26](../codex/shots/geomsweep/oreroad-305-26.png), [228-240,28](../codex/shots/geomsweep/oreroad-228-28.png), [289-294,28](../codex/shots/geomsweep/oreroad-289-28.png), [315,28](../codex/shots/geomsweep/oreroad-315-28.png)
[317-320,28](../codex/shots/geomsweep/oreroad-317-28.png), [55-67,29](../codex/shots/geomsweep/oreroad-55-29.png), [136-138,29](../codex/shots/geomsweep/oreroad-136-29.png), [140-195,29](../codex/shots/geomsweep/oreroad-140-29.png), [197-203,29](../codex/shots/geomsweep/oreroad-197-29.png), [297-308,31](../codex/shots/geomsweep/oreroad-297-31.png), [55,33](../codex/shots/geomsweep/oreroad-55-33.png), [57-66,33](../codex/shots/geomsweep/oreroad-57-33.png), [283-294,33](../codex/shots/geomsweep/oreroad-283-33.png), [311-322,33](../codex/shots/geomsweep/oreroad-311-33.png), [28-29,35](../codex/shots/geomsweep/oreroad-28-35.png), [96-104,37](../codex/shots/geomsweep/oreroad-96-37.png)
[120-128,37](../codex/shots/geomsweep/oreroad-120-37.png), [96-104,41](../codex/shots/geomsweep/oreroad-96-41.png), [121-127,41](../codex/shots/geomsweep/oreroad-121-41.png), [79-85,44](../codex/shots/geomsweep/oreroad-79-44.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with ore-road pylons and iron trestles, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 21. burial — 39 finding(s)

- Tile top: none
- Mover top: [platform@361,56](../codex/shots/geomsweep/burial-361-56.png)
- Unsupported overhang: [2-77,5](../codex/shots/geomsweep/burial-2-5.png), [83-187,5](../codex/shots/geomsweep/burial-83-5.png), [360-377,5](../codex/shots/geomsweep/burial-360-5.png), [384-429,5](../codex/shots/geomsweep/burial-384-5.png), [435-512,5](../codex/shots/geomsweep/burial-435-5.png), [514-525,5](../codex/shots/geomsweep/burial-514-5.png), [126-133,12](../codex/shots/geomsweep/burial-126-12.png), [78-82,13](../codex/shots/geomsweep/burial-78-13.png), [430-434,13](../codex/shots/geomsweep/burial-430-13.png), [121-125,14](../codex/shots/geomsweep/burial-121-14.png), [488-494,14](../codex/shots/geomsweep/burial-488-14.png), [116-120,16](../codex/shots/geomsweep/burial-116-16.png)
[448-452,16](../codex/shots/geomsweep/burial-448-16.png), [482-485,16](../codex/shots/geomsweep/burial-482-16.png), [497-500,16](../codex/shots/geomsweep/burial-497-16.png), [378-383,17](../codex/shots/geomsweep/burial-378-17.png), [70-73,18](../codex/shots/geomsweep/burial-70-18.png), [111-115,18](../codex/shots/geomsweep/burial-111-18.png), [402-405,18](../codex/shots/geomsweep/burial-402-18.png), [389-400,22](../codex/shots/geomsweep/burial-389-22.png), [408-418,22](../codex/shots/geomsweep/burial-408-22.png), [188-290,24](../codex/shots/geomsweep/burial-188-24.png), [291-296,26](../codex/shots/geomsweep/burial-291-26.png), [184-282,32](../codex/shots/geomsweep/burial-184-32.png)
[286-290,32](../codex/shots/geomsweep/burial-286-32.png), [190-301,44](../codex/shots/geomsweep/burial-190-44.png), [302-358,55](../codex/shots/geomsweep/burial-302-55.png), [178-183,56](../codex/shots/geomsweep/burial-178-56.png), [191-199,56](../codex/shots/geomsweep/burial-191-56.png), [202-212,56](../codex/shots/geomsweep/burial-202-56.png), [227-240,56](../codex/shots/geomsweep/burial-227-56.png), [255-265,56](../codex/shots/geomsweep/burial-255-56.png), [279-288,56](../codex/shots/geomsweep/burial-279-56.png), [292-301,56](../codex/shots/geomsweep/burial-292-56.png), [216-224,57](../codex/shots/geomsweep/burial-216-57.png), [243-251,57](../codex/shots/geomsweep/burial-243-57.png)
[268-276,57](../codex/shots/geomsweep/burial-268-57.png), [360-361,60](../codex/shots/geomsweep/burial-360-60.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with crypt stone and ossuary piers, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 22. church — 39 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [46-54,5](../codex/shots/geomsweep/church-46-5.png), [56-178,5](../codex/shots/geomsweep/church-56-5.png), [130-139,9](../codex/shots/geomsweep/church-130-9.png), [55,14](../codex/shots/geomsweep/church-55-14.png), [46-49,19](../codex/shots/geomsweep/church-46-19.png), [56-96,19](../codex/shots/geomsweep/church-56-19.png), [106-164,19](../codex/shots/geomsweep/church-106-19.png), [168-178,19](../codex/shots/geomsweep/church-168-19.png), [180-237,20](../codex/shots/geomsweep/church-180-20.png), [241-282,20](../codex/shots/geomsweep/church-241-20.png), [49-54,23](../codex/shots/geomsweep/church-49-23.png), [160-178,29](../codex/shots/geomsweep/church-160-29.png)
[55,31](../codex/shots/geomsweep/church-55-31.png), [69-77,31](../codex/shots/geomsweep/church-69-31.png), [113-120,31](../codex/shots/geomsweep/church-113-31.png), [194-201,32](../codex/shots/geomsweep/church-194-32.png), [29-31,33](../codex/shots/geomsweep/church-29-33.png), [58-66,33](../codex/shots/geomsweep/church-58-33.png), [104-110,33](../codex/shots/geomsweep/church-104-33.png), [123-134,33](../codex/shots/geomsweep/church-123-33.png), [143-150,33](../codex/shots/geomsweep/church-143-33.png), [240,34](../codex/shots/geomsweep/church-240-34.png), [185-187,37](../codex/shots/geomsweep/church-185-37.png), [46-106,38](../codex/shots/geomsweep/church-46-38.png)
[109-140,38](../codex/shots/geomsweep/church-109-38.png), [143-179,38](../codex/shots/geomsweep/church-143-38.png), [159-163,40](../codex/shots/geomsweep/church-159-40.png), [46-52,42](../codex/shots/geomsweep/church-46-42.png), [170-178,42](../codex/shots/geomsweep/church-170-42.png), [159-163,44](../codex/shots/geomsweep/church-159-44.png), [49-55,46](../codex/shots/geomsweep/church-49-46.png), [172-174,46](../codex/shots/geomsweep/church-172-46.png), [107-108,48](../codex/shots/geomsweep/church-107-48.png), [141-142,48](../codex/shots/geomsweep/church-141-48.png), [159-163,48](../codex/shots/geomsweep/church-159-48.png), [46-52,50](../codex/shots/geomsweep/church-46-50.png)
[93-98,50](../codex/shots/geomsweep/church-93-50.png), [154-156,50](../codex/shots/geomsweep/church-154-50.png), [172-174,50](../codex/shots/geomsweep/church-172-50.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with church masonry and iron stays, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 23. lamplit — 34 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [576-695,7](../codex/shots/geomsweep/lamplit-576-7.png), [364-391,11](../codex/shots/geomsweep/lamplit-364-11.png), [393-423,11](../codex/shots/geomsweep/lamplit-393-11.png), [4-38,13](../codex/shots/geomsweep/lamplit-4-13.png), [196-239,13](../codex/shots/geomsweep/lamplit-196-13.png), [574-575,17](../codex/shots/geomsweep/lamplit-574-17.png), [331-334,23](../codex/shots/geomsweep/lamplit-331-23.png), [471-478,23](../codex/shots/geomsweep/lamplit-471-23.png), [521-528,23](../codex/shots/geomsweep/lamplit-521-23.png), [44-57,27](../codex/shots/geomsweep/lamplit-44-27.png), [60-62,27](../codex/shots/geomsweep/lamplit-60-27.png), [65-76,27](../codex/shots/geomsweep/lamplit-65-27.png)
[80-87,27](../codex/shots/geomsweep/lamplit-80-27.png), [90-91,27](../codex/shots/geomsweep/lamplit-90-27.png), [96-113,27](../codex/shots/geomsweep/lamplit-96-27.png), [116-128,27](../codex/shots/geomsweep/lamplit-116-27.png), [136-141,27](../codex/shots/geomsweep/lamplit-136-27.png), [144-167,27](../codex/shots/geomsweep/lamplit-144-27.png), [170-179,27](../codex/shots/geomsweep/lamplit-170-27.png), [184-186,27](../codex/shots/geomsweep/lamplit-184-27.png), [188-252,27](../codex/shots/geomsweep/lamplit-188-27.png), [254-259,27](../codex/shots/geomsweep/lamplit-254-27.png), [262-267,27](../codex/shots/geomsweep/lamplit-262-27.png), [279-299,27](../codex/shots/geomsweep/lamplit-279-27.png)
[311-325,27](../codex/shots/geomsweep/lamplit-311-27.png), [327-329,27](../codex/shots/geomsweep/lamplit-327-27.png), [341-349,27](../codex/shots/geomsweep/lamplit-341-27.png), [352-356,27](../codex/shots/geomsweep/lamplit-352-27.png), [358-428,27](../codex/shots/geomsweep/lamplit-358-27.png), [430-441,27](../codex/shots/geomsweep/lamplit-430-27.png), [446-470,27](../codex/shots/geomsweep/lamplit-446-27.png), [481-520,27](../codex/shots/geomsweep/lamplit-481-27.png), [530-555,27](../codex/shots/geomsweep/lamplit-530-27.png), [559-568,27](../codex/shots/geomsweep/lamplit-559-27.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with town brick and iron brackets, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 24. mage — 34 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [689-796,1](../codex/shots/geomsweep/mage-689-1.png), [661-665,3](../codex/shots/geomsweep/mage-661-3.png), [479-594,5](../codex/shots/geomsweep/mage-479-5.png), [597-598,5](../codex/shots/geomsweep/mage-597-5.png), [600-616,5](../codex/shots/geomsweep/mage-600-5.png), [620-660,5](../codex/shots/geomsweep/mage-620-5.png), [666-686,5](../codex/shots/geomsweep/mage-666-5.png), [783,5](../codex/shots/geomsweep/mage-783-5.png), [791,5](../codex/shots/geomsweep/mage-791-5.png), [617-619,6](../codex/shots/geomsweep/mage-617-6.png), [595-596,7](../codex/shots/geomsweep/mage-595-7.png), [561-563,9](../codex/shots/geomsweep/mage-561-9.png)
[573-576,11](../codex/shots/geomsweep/mage-573-11.png), [579-581,11](../codex/shots/geomsweep/mage-579-11.png), [687-688,11](../codex/shots/geomsweep/mage-687-11.png), [565-570,12](../codex/shots/geomsweep/mage-565-12.png), [585-592,12](../codex/shots/geomsweep/mage-585-12.png), [66-117,13](../codex/shots/geomsweep/mage-66-13.png), [119-207,13](../codex/shots/geomsweep/mage-119-13.png), [209-211,13](../codex/shots/geomsweep/mage-209-13.png), [216-357,13](../codex/shots/geomsweep/mage-216-13.png), [285-287,17](../codex/shots/geomsweep/mage-285-17.png), [554-558,19](../codex/shots/geomsweep/mage-554-19.png), [359-475,21](../codex/shots/geomsweep/mage-359-21.png)
[274-283,31](../codex/shots/geomsweep/mage-274-31.png), [302-308,31](../codex/shots/geomsweep/mage-302-31.png), [585-589,33](../codex/shots/geomsweep/mage-585-33.png), [32,34](../codex/shots/geomsweep/mage-32-34.png), [64-65,35](../codex/shots/geomsweep/mage-64-35.png), [212-215,35](../codex/shots/geomsweep/mage-212-35.png), [476-478,35](../codex/shots/geomsweep/mage-476-35.png), [424-427,40](../codex/shots/geomsweep/mage-424-40.png), [402-423,41](../codex/shots/geomsweep/mage-402-41.png), [428,41](../codex/shots/geomsweep/mage-428-41.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with runed stone and library shelves, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 25. storm — 32 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [106-160,3](../codex/shots/geomsweep/storm-106-3.png), [6-30,5](../codex/shots/geomsweep/storm-6-5.png), [38-66,5](../codex/shots/geomsweep/storm-38-5.png), [74-98,5](../codex/shots/geomsweep/storm-74-5.png), [0-81,18](../codex/shots/geomsweep/storm-0-18.png), [89-295,18](../codex/shots/geomsweep/storm-89-18.png), [349-395,18](../codex/shots/geomsweep/storm-349-18.png), [403-567,18](../codex/shots/geomsweep/storm-403-18.png), [572-699,18](../codex/shots/geomsweep/storm-572-18.png), [296,21](../codex/shots/geomsweep/storm-296-21.png), [298-302,21](../codex/shots/geomsweep/storm-298-21.png), [207-209,24](../codex/shots/geomsweep/storm-207-24.png)
[568-569,24](../codex/shots/geomsweep/storm-568-24.png), [571,24](../codex/shots/geomsweep/storm-571-24.png), [396-402,25](../codex/shots/geomsweep/storm-396-25.png), [344-345,26](../codex/shots/geomsweep/storm-344-26.png), [347-348,26](../codex/shots/geomsweep/storm-347-26.png), [296,27](../codex/shots/geomsweep/storm-296-27.png), [303,27](../codex/shots/geomsweep/storm-303-27.png), [298-302,28](../codex/shots/geomsweep/storm-298-28.png), [82-83,29](../codex/shots/geomsweep/storm-82-29.png), [85-88,29](../codex/shots/geomsweep/storm-85-29.png), [496-499,29](../codex/shots/geomsweep/storm-496-29.png), [577-589,30](../codex/shots/geomsweep/storm-577-30.png)
[595-607,30](../codex/shots/geomsweep/storm-595-30.png), [613-625,30](../codex/shots/geomsweep/storm-613-30.png), [631-643,30](../codex/shots/geomsweep/storm-631-30.png), [649-661,30](../codex/shots/geomsweep/storm-649-30.png), [667-679,30](../codex/shots/geomsweep/storm-667-30.png), [685-693,30](../codex/shots/geomsweep/storm-685-30.png), [496-499,34](../codex/shots/geomsweep/storm-496-34.png), [496-499,38](../codex/shots/geomsweep/storm-496-38.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with weathered ship timber and rigging, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 26. stockade — 24 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [427-428,8](../codex/shots/geomsweep/stockade-427-8.png), [470-474,9](../codex/shots/geomsweep/stockade-470-9.png), [462-465,10](../codex/shots/geomsweep/stockade-462-10.png), [466-468,11](../codex/shots/geomsweep/stockade-466-11.png), [475-477,11](../codex/shots/geomsweep/stockade-475-11.png), [86-90,12](../codex/shots/geomsweep/stockade-86-12.png), [102-105,12](../codex/shots/geomsweep/stockade-102-12.png), [398-401,12](../codex/shots/geomsweep/stockade-398-12.png), [410,12](../codex/shots/geomsweep/stockade-410-12.png), [464-465,12](../codex/shots/geomsweep/stockade-464-12.png), [478-479,12](../codex/shots/geomsweep/stockade-478-12.png), [402-409,13](../codex/shots/geomsweep/stockade-402-13.png)
[411-412,13](../codex/shots/geomsweep/stockade-411-13.png), [90-91,14](../codex/shots/geomsweep/stockade-90-14.png), [461-462,14](../codex/shots/geomsweep/stockade-461-14.png), [481-482,14](../codex/shots/geomsweep/stockade-481-14.png), [99-100,16](../codex/shots/geomsweep/stockade-99-16.png), [457-459,16](../codex/shots/geomsweep/stockade-457-16.png), [484-486,16](../codex/shots/geomsweep/stockade-484-16.png), [232-244,17](../codex/shots/geomsweep/stockade-232-17.png), [247-263,17](../codex/shots/geomsweep/stockade-247-17.png), [111-114,20](../codex/shots/geomsweep/stockade-111-20.png), [115-126,21](../codex/shots/geomsweep/stockade-115-21.png), [336-373,21](../codex/shots/geomsweep/stockade-336-21.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with palisade stakes and stockade braces, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 27. undercrown — 24 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [24-36,14](../codex/shots/geomsweep/undercrown-24-14.png), [2-45,19](../codex/shots/geomsweep/undercrown-2-19.png), [56-84,24](../codex/shots/geomsweep/undercrown-56-24.png), [86-91,25](../codex/shots/geomsweep/undercrown-86-25.png), [40-45,29](../codex/shots/geomsweep/undercrown-40-29.png), [52-85,29](../codex/shots/geomsweep/undercrown-52-29.png), [47-51,34](../codex/shots/geomsweep/undercrown-47-34.png), [10-85,49](../codex/shots/geomsweep/undercrown-10-49.png), [6-9,55](../codex/shots/geomsweep/undercrown-6-55.png), [10-15,90](../codex/shots/geomsweep/undercrown-10-90.png), [17-22,94](../codex/shots/geomsweep/undercrown-17-94.png), [74-77,100](../codex/shots/geomsweep/undercrown-74-100.png)
[79,100](../codex/shots/geomsweep/undercrown-79-100.png), [97-150,105](../codex/shots/geomsweep/undercrown-97-105.png), [46-51,106](../codex/shots/geomsweep/undercrown-46-106.png), [68-73,106](../codex/shots/geomsweep/undercrown-68-106.png), [96-143,130](../codex/shots/geomsweep/undercrown-96-130.png), [10-95,136](../codex/shots/geomsweep/undercrown-10-136.png), [4-9,143](../codex/shots/geomsweep/undercrown-4-143.png), [16-28,143](../codex/shots/geomsweep/undercrown-16-143.png), [76-98,143](../codex/shots/geomsweep/undercrown-76-143.png), [30-74,155](../codex/shots/geomsweep/undercrown-30-155.png), [29,160](../codex/shots/geomsweep/undercrown-29-160.png), [75,160](../codex/shots/geomsweep/undercrown-75-160.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with mine stone and crystal buttresses, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 28. waymeet — 24 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [20-62,7](../codex/shots/geomsweep/waymeet-20-7.png), [30-54,14](../codex/shots/geomsweep/waymeet-30-14.png), [0-29,24](../codex/shots/geomsweep/waymeet-0-24.png), [50-347,24](../codex/shots/geomsweep/waymeet-50-24.png), [349-775,24](../codex/shots/geomsweep/waymeet-349-24.png), [30-49,29](../codex/shots/geomsweep/waymeet-30-29.png), [150-155,29](../codex/shots/geomsweep/waymeet-150-29.png), [170-176,29](../codex/shots/geomsweep/waymeet-170-29.png), [651-657,29](../codex/shots/geomsweep/waymeet-651-29.png), [699-703,29](../codex/shots/geomsweep/waymeet-699-29.png), [212-262,31](../codex/shots/geomsweep/waymeet-212-31.png), [132-136,32](../codex/shots/geomsweep/waymeet-132-32.png)
[378-388,32](../codex/shots/geomsweep/waymeet-378-32.png), [399-410,32](../codex/shots/geomsweep/waymeet-399-32.png), [578-586,32](../codex/shots/geomsweep/waymeet-578-32.png), [591-598,32](../codex/shots/geomsweep/waymeet-591-32.png), [684-688,32](../codex/shots/geomsweep/waymeet-684-32.png), [431-443,33](../codex/shots/geomsweep/waymeet-431-33.png), [358-366,34](../codex/shots/geomsweep/waymeet-358-34.png), [473-485,37](../codex/shots/geomsweep/waymeet-473-37.png), [488-499,37](../codex/shots/geomsweep/waymeet-488-37.png), [502-513,37](../codex/shots/geomsweep/waymeet-502-37.png), [516-527,37](../codex/shots/geomsweep/waymeet-516-37.png), [530-539,37](../codex/shots/geomsweep/waymeet-530-37.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with quay timber and mooring posts, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 29. fields — 23 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [429-432,8](../codex/shots/geomsweep/fields-429-8.png), [468-535,8](../codex/shots/geomsweep/fields-468-8.png), [341-391,12](../codex/shots/geomsweep/fields-341-12.png), [394-399,12](../codex/shots/geomsweep/fields-394-12.png), [417-420,14](../codex/shots/geomsweep/fields-417-14.png), [422-427,14](../codex/shots/geomsweep/fields-422-14.png), [341-360,19](../codex/shots/geomsweep/fields-341-19.png), [372-385,19](../codex/shots/geomsweep/fields-372-19.png), [390-399,19](../codex/shots/geomsweep/fields-390-19.png), [424-427,21](../codex/shots/geomsweep/fields-424-21.png), [341-355,26](../codex/shots/geomsweep/fields-341-26.png), [360-365,26](../codex/shots/geomsweep/fields-360-26.png)
[377-399,26](../codex/shots/geomsweep/fields-377-26.png), [328-331,27](../codex/shots/geomsweep/fields-328-27.png), [340,29](../codex/shots/geomsweep/fields-340-29.png), [416,29](../codex/shots/geomsweep/fields-416-29.png), [182-187,33](../codex/shots/geomsweep/fields-182-33.png), [190-194,33](../codex/shots/geomsweep/fields-190-33.png), [209-219,34](../codex/shots/geomsweep/fields-209-34.png), [223-235,34](../codex/shots/geomsweep/fields-223-34.png), [239-251,34](../codex/shots/geomsweep/fields-239-34.png), [255-267,34](../codex/shots/geomsweep/fields-255-34.png), [271-281,34](../codex/shots/geomsweep/fields-271-34.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with dead orchard trunks and bale props, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 30. underleaf — 23 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [96-124,4](../codex/shots/geomsweep/underleaf-96-4.png), [140-196,4](../codex/shots/geomsweep/underleaf-140-4.png), [210-258,6](../codex/shots/geomsweep/underleaf-210-6.png), [0-519,18](../codex/shots/geomsweep/underleaf-0-18.png), [225-226,26](../codex/shots/geomsweep/underleaf-225-26.png), [177-178,27](../codex/shots/geomsweep/underleaf-177-27.png), [193-194,27](../codex/shots/geomsweep/underleaf-193-27.png), [209-210,27](../codex/shots/geomsweep/underleaf-209-27.png), [243-251,27](../codex/shots/geomsweep/underleaf-243-27.png), [310-312,27](../codex/shots/geomsweep/underleaf-310-27.png), [330-332,27](../codex/shots/geomsweep/underleaf-330-27.png), [180-192,28](../codex/shots/geomsweep/underleaf-180-28.png)
[212-224,28](../codex/shots/geomsweep/underleaf-212-28.png), [274-278,28](../codex/shots/geomsweep/underleaf-274-28.png), [228-240,29](../codex/shots/geomsweep/underleaf-228-29.png), [30-44,30](../codex/shots/geomsweep/underleaf-30-30.png), [118-139,30](../codex/shots/geomsweep/underleaf-118-30.png), [164-176,30](../codex/shots/geomsweep/underleaf-164-30.png), [196-208,30](../codex/shots/geomsweep/underleaf-196-30.png), [352-356,30](../codex/shots/geomsweep/underleaf-352-30.png), [386-390,30](../codex/shots/geomsweep/underleaf-386-30.png), [420-430,30](../codex/shots/geomsweep/underleaf-420-30.png), [452-462,30](../codex/shots/geomsweep/underleaf-452-30.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with roots and canopy trunks, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 31. moor — 22 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [663-670,7](../codex/shots/geomsweep/moor-663-7.png), [681-688,7](../codex/shots/geomsweep/moor-681-7.png), [338-339,8](../codex/shots/geomsweep/moor-338-8.png), [551-562,9](../codex/shots/geomsweep/moor-551-9.png), [384-386,10](../codex/shots/geomsweep/moor-384-10.png), [483-484,10](../codex/shots/geomsweep/moor-483-10.png), [414-415,12](../codex/shots/geomsweep/moor-414-12.png), [182,13](../codex/shots/geomsweep/moor-182-13.png), [608-639,13](../codex/shots/geomsweep/moor-608-13.png), [277-278,14](../codex/shots/geomsweep/moor-277-14.png), [281-282,14](../codex/shots/geomsweep/moor-281-14.png), [285-286,14](../codex/shots/geomsweep/moor-285-14.png)
[384-386,14](../codex/shots/geomsweep/moor-384-14.png), [160,15](../codex/shots/geomsweep/moor-160-15.png), [273-274,15](../codex/shots/geomsweep/moor-273-15.png), [200,16](../codex/shots/geomsweep/moor-200-16.png), [269-270,16](../codex/shots/geomsweep/moor-269-16.png), [111,17](../codex/shots/geomsweep/moor-111-17.png), [238-241,17](../codex/shots/geomsweep/moor-238-17.png), [265-266,17](../codex/shots/geomsweep/moor-265-17.png), [594-629,17](../codex/shots/geomsweep/moor-594-17.png), [384-386,18](../codex/shots/geomsweep/moor-384-18.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with moor stone and rooted heather, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 32. caravan — 20 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [480-482,17](../codex/shots/geomsweep/caravan-480-17.png), [152-166,18](../codex/shots/geomsweep/caravan-152-18.png), [44-46,20](../codex/shots/geomsweep/caravan-44-20.png), [50-78,20](../codex/shots/geomsweep/caravan-50-20.png), [81-103,20](../codex/shots/geomsweep/caravan-81-20.png), [111-144,20](../codex/shots/geomsweep/caravan-111-20.png), [146-148,20](../codex/shots/geomsweep/caravan-146-20.png), [208-226,20](../codex/shots/geomsweep/caravan-208-20.png), [228-230,20](../codex/shots/geomsweep/caravan-228-20.png), [234-242,20](../codex/shots/geomsweep/caravan-234-20.png), [400-402,21](../codex/shots/geomsweep/caravan-400-21.png), [480-482,21](../codex/shots/geomsweep/caravan-480-21.png)
[105-107,22](../codex/shots/geomsweep/caravan-105-22.png), [410-412,22](../codex/shots/geomsweep/caravan-410-22.png), [44-46,24](../codex/shots/geomsweep/caravan-44-24.png), [146-148,24](../codex/shots/geomsweep/caravan-146-24.png), [228-230,24](../codex/shots/geomsweep/caravan-228-24.png), [400-402,25](../codex/shots/geomsweep/caravan-400-25.png), [420-422,25](../codex/shots/geomsweep/caravan-420-25.png), [480-482,25](../codex/shots/geomsweep/caravan-480-25.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with sandstone, wagon ribs and dune-rock, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 33. fair — 20 finding(s)

- Tile top: [402,26](../codex/shots/geomsweep/fair-402-26.png), [403,26](../codex/shots/geomsweep/fair-403-26.png), [404,26](../codex/shots/geomsweep/fair-404-26.png), [405,26](../codex/shots/geomsweep/fair-405-26.png), [556,26](../codex/shots/geomsweep/fair-556-26.png), [557,26](../codex/shots/geomsweep/fair-557-26.png), [558,26](../codex/shots/geomsweep/fair-558-26.png), [559,26](../codex/shots/geomsweep/fair-559-26.png)
- Mover top: none
- Unsupported overhang: [398-410,12](../codex/shots/geomsweep/fair-398-12.png), [176-195,13](../codex/shots/geomsweep/fair-176-13.png), [563-571,14](../codex/shots/geomsweep/fair-563-14.png), [590-594,14](../codex/shots/geomsweep/fair-590-14.png), [418-436,18](../codex/shots/geomsweep/fair-418-18.png), [373,20](../codex/shots/geomsweep/fair-373-20.png), [529-555,20](../codex/shots/geomsweep/fair-529-20.png), [621,23](../codex/shots/geomsweep/fair-621-23.png), [198-214,28](../codex/shots/geomsweep/fair-198-28.png), [321-337,28](../codex/shots/geomsweep/fair-321-28.png), [597-608,28](../codex/shots/geomsweep/fair-597-28.png), [340-347,29](../codex/shots/geomsweep/fair-340-29.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with ride frames and fairground timber, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 34. flotilla — 20 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [144,10](../codex/shots/geomsweep/flotilla-144-10.png), [47-49,11](../codex/shots/geomsweep/flotilla-47-11.png), [52-53,11](../codex/shots/geomsweep/flotilla-52-11.png), [336-365,11](../codex/shots/geomsweep/flotilla-336-11.png), [368-369,11](../codex/shots/geomsweep/flotilla-368-11.png), [372-376,11](../codex/shots/geomsweep/flotilla-372-11.png), [198-209,14](../codex/shots/geomsweep/flotilla-198-14.png), [212-223,14](../codex/shots/geomsweep/flotilla-212-14.png), [304-305,16](../codex/shots/geomsweep/flotilla-304-16.png), [308-309,16](../codex/shots/geomsweep/flotilla-308-16.png), [312-329,16](../codex/shots/geomsweep/flotilla-312-16.png), [332-371,16](../codex/shots/geomsweep/flotilla-332-16.png)
[116-119,23](../codex/shots/geomsweep/flotilla-116-23.png), [122-133,23](../codex/shots/geomsweep/flotilla-122-23.png), [139-169,23](../codex/shots/geomsweep/flotilla-139-23.png), [248-309,23](../codex/shots/geomsweep/flotilla-248-23.png), [312-340,23](../codex/shots/geomsweep/flotilla-312-23.png), [23-26,25](../codex/shots/geomsweep/flotilla-23-25.png), [34-57,25](../codex/shots/geomsweep/flotilla-34-25.png), [61-93,25](../codex/shots/geomsweep/flotilla-61-25.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with ship hull frames and rigging, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 35. towpath — 20 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [316-360,5](../codex/shots/geomsweep/towpath-316-5.png), [351-357,17](../codex/shots/geomsweep/towpath-351-17.png), [315,18](../codex/shots/geomsweep/towpath-315-18.png), [319-325,20](../codex/shots/geomsweep/towpath-319-20.png), [343-349,20](../codex/shots/geomsweep/towpath-343-20.png), [183-188,23](../codex/shots/geomsweep/towpath-183-23.png), [195-212,23](../codex/shots/geomsweep/towpath-195-23.png), [222-234,27](../codex/shots/geomsweep/towpath-222-27.png), [109-124,29](../codex/shots/geomsweep/towpath-109-29.png), [269-273,31](../codex/shots/geomsweep/towpath-269-31.png), [32-39,32](../codex/shots/geomsweep/towpath-32-32.png), [280-284,32](../codex/shots/geomsweep/towpath-280-32.png)
[125,33](../codex/shots/geomsweep/towpath-125-33.png), [27-30,35](../codex/shots/geomsweep/towpath-27-35.png), [280-284,36](../codex/shots/geomsweep/towpath-280-36.png), [154-157,37](../codex/shots/geomsweep/towpath-154-37.png), [22-25,38](../codex/shots/geomsweep/towpath-22-38.png), [141-148,38](../codex/shots/geomsweep/towpath-141-38.png), [68-74,39](../codex/shots/geomsweep/towpath-68-39.png), [84-92,40](../codex/shots/geomsweep/towpath-84-40.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with canal brick and towpath posts, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 36. causeway — 19 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [537-539,7](../codex/shots/geomsweep/causeway-537-7.png), [545-546,7](../codex/shots/geomsweep/causeway-545-7.png), [266-296,9](../codex/shots/geomsweep/causeway-266-9.png), [366-373,12](../codex/shots/geomsweep/causeway-366-12.png), [375-382,12](../codex/shots/geomsweep/causeway-375-12.png), [184-188,17](../codex/shots/geomsweep/causeway-184-17.png), [210-214,17](../codex/shots/geomsweep/causeway-210-17.png), [234-238,17](../codex/shots/geomsweep/causeway-234-17.png), [83-92,18](../codex/shots/geomsweep/causeway-83-18.png), [362-385,24](../codex/shots/geomsweep/causeway-362-24.png), [340-348,25](../codex/shots/geomsweep/causeway-340-25.png), [386-388,25](../codex/shots/geomsweep/causeway-386-25.png)
[569-574,25](../codex/shots/geomsweep/causeway-569-25.png), [577-582,25](../codex/shots/geomsweep/causeway-577-25.png), [585-590,25](../codex/shots/geomsweep/causeway-585-25.png), [593-598,25](../codex/shots/geomsweep/causeway-593-25.png), [601-606,25](../codex/shots/geomsweep/causeway-601-25.png), [312-326,26](../codex/shots/geomsweep/causeway-312-26.png), [443-447,26](../codex/shots/geomsweep/causeway-443-26.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with sea stone and bridge piers, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 37. reef — 19 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [257-300,2](../codex/shots/geomsweep/reef-257-2.png), [122-209,7](../codex/shots/geomsweep/reef-122-7.png), [233-256,12](../codex/shots/geomsweep/reef-233-12.png), [303-337,12](../codex/shots/geomsweep/reef-303-12.png), [341-389,12](../codex/shots/geomsweep/reef-341-12.png), [393-410,12](../codex/shots/geomsweep/reef-393-12.png), [266-282,13](../codex/shots/geomsweep/reef-266-13.png), [285-300,13](../codex/shots/geomsweep/reef-285-13.png), [464-477,17](../codex/shots/geomsweep/reef-464-17.png), [400-408,19](../codex/shots/geomsweep/reef-400-19.png), [119-121,20](../codex/shots/geomsweep/reef-119-20.png), [467-480,21](../codex/shots/geomsweep/reef-467-21.png)
[213-229,24](../codex/shots/geomsweep/reef-213-24.png), [338-340,24](../codex/shots/geomsweep/reef-338-24.png), [390-392,26](../codex/shots/geomsweep/reef-390-26.png), [301,27](../codex/shots/geomsweep/reef-301-27.png), [210-212,28](../codex/shots/geomsweep/reef-210-28.png), [230-232,28](../codex/shots/geomsweep/reef-230-28.png), [162-172,32](../codex/shots/geomsweep/reef-162-32.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with reef rock and coral ribs, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 38. wood — 18 finding(s)

- Tile top: none
- Mover top: [pushblock@157,21](../codex/shots/geomsweep/wood-157-21.png)
- Unsupported overhang: [492-495,5](../codex/shots/geomsweep/wood-492-5.png), [339-340,6](../codex/shots/geomsweep/wood-339-6.png), [275-276,8](../codex/shots/geomsweep/wood-275-8.png), [287-300,8](../codex/shots/geomsweep/wood-287-8.png), [341-342,8](../codex/shots/geomsweep/wood-341-8.png), [380-383,8](../codex/shots/geomsweep/wood-380-8.png), [247-249,9](../codex/shots/geomsweep/wood-247-9.png), [272-273,10](../codex/shots/geomsweep/wood-272-10.png), [466-468,13](../codex/shots/geomsweep/wood-466-13.png), [271-273,14](../codex/shots/geomsweep/wood-271-14.png), [229-230,16](../codex/shots/geomsweep/wood-229-16.png), [231-262,17](../codex/shots/geomsweep/wood-231-17.png)
[90-95,18](../codex/shots/geomsweep/wood-90-18.png), [159,18](../codex/shots/geomsweep/wood-159-18.png), [271-273,18](../codex/shots/geomsweep/wood-271-18.png), [114-115,22](../codex/shots/geomsweep/wood-114-22.png), [118-119,22](../codex/shots/geomsweep/wood-118-22.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with living boughs and rooted trunks, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 39. witchlight — 16 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [502,13](../codex/shots/geomsweep/witchlight-502-13.png), [548,13](../codex/shots/geomsweep/witchlight-548-13.png), [485-488,16](../codex/shots/geomsweep/witchlight-485-16.png), [491-493,17](../codex/shots/geomsweep/witchlight-491-17.png), [436,18](../codex/shots/geomsweep/witchlight-436-18.png), [458,18](../codex/shots/geomsweep/witchlight-458-18.png), [496-498,19](../codex/shots/geomsweep/witchlight-496-19.png), [408,20](../codex/shots/geomsweep/witchlight-408-20.png), [413,20](../codex/shots/geomsweep/witchlight-413-20.png), [543-546,20](../codex/shots/geomsweep/witchlight-543-20.png), [505-507,23](../codex/shots/geomsweep/witchlight-505-23.png), [566-571,33](../codex/shots/geomsweep/witchlight-566-33.png)
[355,35](../codex/shots/geomsweep/witchlight-355-35.png), [357-358,35](../codex/shots/geomsweep/witchlight-357-35.png), [240-248,51](../codex/shots/geomsweep/witchlight-240-51.png), [0-9,74](../codex/shots/geomsweep/witchlight-0-74.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with runed stone and stair buttresses, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 40. burning — 13 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [323-357,11](../codex/shots/geomsweep/burning-323-11.png), [359-389,11](../codex/shots/geomsweep/burning-359-11.png), [393-397,11](../codex/shots/geomsweep/burning-393-11.png), [287-295,14](../codex/shots/geomsweep/burning-287-14.png), [272-286,16](../codex/shots/geomsweep/burning-272-16.png), [340-341,16](../codex/shots/geomsweep/burning-340-16.png), [343-357,16](../codex/shots/geomsweep/burning-343-16.png), [359-375,16](../codex/shots/geomsweep/burning-359-16.png), [377-380,16](../codex/shots/geomsweep/burning-377-16.png), [358,19](../codex/shots/geomsweep/burning-358-19.png), [327-357,20](../codex/shots/geomsweep/burning-327-20.png), [359-393,20](../codex/shots/geomsweep/burning-359-20.png)
[322,22](../codex/shots/geomsweep/burning-322-22.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with charred beams and stone hearths, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 41. skyroad — 13 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [360-364,5](../codex/shots/geomsweep/skyroad-360-5.png), [228-232,10](../codex/shots/geomsweep/skyroad-228-10.png), [359-369,11](../codex/shots/geomsweep/skyroad-359-11.png), [388-389,11](../codex/shots/geomsweep/skyroad-388-11.png), [441-442,11](../codex/shots/geomsweep/skyroad-441-11.png), [151-189,17](../codex/shots/geomsweep/skyroad-151-17.png), [363-366,17](../codex/shots/geomsweep/skyroad-363-17.png), [376-379,17](../codex/shots/geomsweep/skyroad-376-17.png), [349-353,20](../codex/shots/geomsweep/skyroad-349-20.png), [134-147,29](../codex/shots/geomsweep/skyroad-134-29.png), [70-99,38](../codex/shots/geomsweep/skyroad-70-38.png), [37-51,43](../codex/shots/geomsweep/skyroad-37-43.png)
[205-213,46](../codex/shots/geomsweep/skyroad-205-46.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with cloud-stone pillars, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 42. rootway — 12 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [111-150,6](../codex/shots/geomsweep/rootway-111-6.png), [365-371,8](../codex/shots/geomsweep/rootway-365-8.png), [387,11](../codex/shots/geomsweep/rootway-387-11.png), [447,11](../codex/shots/geomsweep/rootway-447-11.png), [151-156,18](../codex/shots/geomsweep/rootway-151-18.png), [71-96,19](../codex/shots/geomsweep/rootway-71-19.png), [163-168,23](../codex/shots/geomsweep/rootway-163-23.png), [1-70,25](../codex/shots/geomsweep/rootway-1-25.png), [111-133,26](../codex/shots/geomsweep/rootway-111-26.png), [134-144,27](../codex/shots/geomsweep/rootway-134-27.png), [103-110,31](../codex/shots/geomsweep/rootway-103-31.png), [61-70,39](../codex/shots/geomsweep/rootway-61-39.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with root arches and living trunks, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 43. trial_open — 4 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [80-85,8](../codex/shots/geomsweep/trial_open-80-8.png), [57-60,13](../codex/shots/geomsweep/trial_open-57-13.png), [50-53,15](../codex/shots/geomsweep/trial_open-50-15.png), [43-46,17](../codex/shots/geomsweep/trial_open-43-17.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with the trial’s existing stone dais, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 44. glasssea — 3 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [172-180,21](../codex/shots/geomsweep/glasssea-172-21.png), [631-634,25](../codex/shots/geomsweep/glasssea-631-25.png), [637-639,28](../codex/shots/geomsweep/glasssea-637-28.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with glass-rock fins and dune stone, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 45. harbor — 2 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [189-196,25](../codex/shots/geomsweep/harbor-189-25.png), [228-235,25](../codex/shots/geomsweep/harbor-228-25.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with quay stone and bollards, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 46. longwater — 2 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [179,28](../codex/shots/geomsweep/longwater-179-28.png), [172-178,29](../codex/shots/geomsweep/longwater-172-29.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with river rock and reed pilings, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 47. shopSea — 2 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [6-9,18](../codex/shots/geomsweep/shopSea-6-18.png), [12-14,18](../codex/shots/geomsweep/shopSea-12-18.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with ship timber and pier posts, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 48. shop — 1 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [2-37,12](../codex/shots/geomsweep/shop-2-12.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with the shop’s existing timber frame, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 49. shopCrag — 1 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [2-37,12](../codex/shots/geomsweep/shopCrag-2-12.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with crag stone, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 50. shopWell — 1 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: [2-37,12](../codex/shots/geomsweep/shopWell-2-12.png)
- Suggested fix: Draw a continuous three-pixel foreground footing with wellspring sandstone, joined visibly to the ground or a solid wall. For a deliberate floating form, add a coordinate-keyed reason and retain its crop.

### 51. custom — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 52. scree — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 53. trial_berserker — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 54. trial_geomancer — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 55. trial_knight — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 56. trial_paladin — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 57. trial_pirate — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 58. trial_pyro — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 59. trial_ranger — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 60. trial_reaper — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 61. trial_warden — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

### 62. unburied — 0 finding(s)

- Tile top: none
- Mover top: none
- Unsupported overhang: none
- Suggested fix: No art change indicated by this sweep.

## QUESTIONS FOR DANIEL

1. **Recommendation:** Send the ranked crop links to the corresponding art lanes, starting with spire, crown and hanging; keep these new checks report-only until each candidate is either fixed or keyed with a visible reason. The existing Buried City gate remains a gate.
2. **Recommendation:** Review the tile-top and mover crops before treating every automated pixel finding as confirmed invisible geometry. The live mover test can flag a special carrier whose painted surface is offset from its collision top; the tool leaves it visible in the report rather than weakening the three-pixel rule.
3. **Recommendation:** Keep theme-specific materials in the fixes; the desert and crypt should use their established stone, chain or bone language, and the post-Queen route should use undead or scenery rather than living goblins.
