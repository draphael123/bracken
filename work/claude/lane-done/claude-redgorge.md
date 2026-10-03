# claude/redgorge - THE RED GORGE, the greybox (desert arc level 3), and THE GREAT RED CRAB wired

This is a GREYBOX for review. The next step is the reviewer against THE MAGE'S FOLLY. Nothing ships without Daniel.

- Concept: `docs/concepts/red-gorge.md`. It commits the Red Gorge parts of the desert-arc concept of 2026-10-01, which until now lived on this PC only. It also has the level's concept page in the checklist's format.
- Base: claude/batch55 d12c0941 plus a merge of origin/claude/welltown 52c948d2 (the desert L2 greybox, so the desert road exists).
- Merge resolution: every check name from both sides in tools/check.mjs, both hint-line blocks, and the Bandit King's `bossOpen` fallback kept under combat3's `GB.openOf`.

## What changed

### The level: `src/red-gorge.js`
- 96 x 170, a CLIMB. It is appended to LEVELS as `{ id: 'redgorge', needs: 'welltown' }`.
- Its map node is at (136,120), where `docs/briefs/map-redesign.md` 4.1 puts it, and the desert road runs on to it. `?level=redgorge` works.
- Six sections, each ending on a rope bridge across the channel (an overhang caps every climbing side):
  1. THE GORGE MOUTH (the flood taught on the floor crossing)
  2. THE DRY FALLS (the terrace, the first gate, a 17-row rope up the falls' face IN the channel)
  3. THE RAPTOR LEDGES (a sheer face: the first required basket)
  4. THE CAVE OF HANDS (THE JAM seals bridge four)
  5. THE NARROWS (the exam)
  6. THE SUMMIT (the old nest)
- Then THE OLD DAM (the boss plateau, east of the summit).
- The whole gorge is in the canyon's shadow: no sun damage (the WELLTOWN review lesson, built in from the start).

### The rule and the machines: `src/red-gorge-hands.js`
- **THE FLOOD.** One clock: dry 6 s, the HORN 2 s (a trickle in the channel, HORN on the HUD), the TORRENT 2.4 s. A hero in the channel is hurt once, dropped through the bridge, pushed down and out to the bank. A bandit standing in it is taken by it.
- **THE SLUICE GATE** (E at a wheel; four gates, six wheels).
  - Shut, it holds the next flood, and the channel below it stays dry.
  - When it is full, E releases it: a burst down the channel below, at once.
  - Only a burst washes out THE JAM (7 rows of flotsam on bridge four).
- **THE BASKETS** (three). A water-wheel winds a basket up while water runs past it:
  - the mouth's is optional (it carries you to a silver);
  - the ledges' and the narrows' are required.
- **THE THEMED KEY.** Four RAPTOR FEATHERS (the quest, FEATHERS n/4). Laid in THE OLD NEST (E), they open its vault: THE RAPTOR'S PLUME (relic: the flood pushes you and hurts you half as much) and a silver.
- **THE EXAM (the narrows).** Ride the basket on a flood (its gate must be open), shut that gate from the top wheel, let the next horn bank, then climb the 16-row rope in the channel under a raptor and a slinger.

### Foes
- Reused:
  - cutthroats (melee);
  - scorpions, plus THE FALLS' KEEPER, an elite scorpion holding the gate to the falls' foot;
  - the caravan's slingers (ranged) on the lips across the channel.
- THE ONE NEW KIND: THE CLIFF RAPTOR (runner). It is the vulture's marked dive, reskinned rust. It keeps one bridge (it hunts only within 150 px of that row) and lands where it struck.
- Roles: melee, ranged, runner. Designed encounters only, nothing sprinkled.

### THE GREAT RED CRAB: `src/gorge-crab.js` + `src/gorge-crab-hands.js`
- He runs on the desert boss engine. His blows: PINCH (!), CRUSH (X, low), BOULDER (X, a red mark where you stand; two in phase two), SCUTTLE (X, low, to where you stood; he digs in after it).
- THE OPENING: shut the dam's gate, let a flood bank, then release it while he is IN the spillway. He goes ON HIS BACK for 3.5 s, and a blow lands x1.6.
  - A natural flood never opens him: he walks out at the horn and never walks into running water.
  - A release while he is out of the channel is wasted, and he says so.
- The x0.05 chip comes from the GLOBAL rule: his row in `OPEN_RULE` (`e.mode === 'open'`).
- He always fights. Every pass of his chain is a new order.
- PHASE TWO: faster floods, two boulders, and he will not walk into the channel while the gate holds water. Only his scuttle carries him in, so you bait it.
- Touch rule: he does no body damage.
- Music: a placeholder synth theme `'gorgecrab'` (`src/boss-music.js`).
- The bot: `gorgeCrabPlan`, the human-speed reading in `src/lab.js`.

### Tables and tools
- Tables:
  - marks: BY_HAND rows, ANSWER and HEIGHT for the raptor, `tells --write`;
  - THREAT, hint lines, the bestiary and the boss tables in main.js;
  - EHP and TIER 2.5;
  - dressing kits, `NO_FILE_BY_DESIGN`.
- level-quality:
  - GATEs redgorge, with music report-only (the placeholder);
  - ROLES: raptor = runner;
  - NEW: on a TALL level a mechanic's "place" is a cluster of ROWS, not columns (a climb's machines stand one above another). Only the not-gated tall levels' report changes.
- one-new-foe pins `raptor`.
- reachcore treats the jam and the vault door as done for the model, as welltown does for its mud walls. `tools/redgorge.mjs` proves both are real locks with a real jump.
- boss-openings asserts his opening.
- New tools:
  - `tools/redgorge.mjs`: the level's Node check, in check.mjs;
  - `tools/redgorge-probe.mjs`: an in-page smoke test, 13 asserts;
  - `tools/redgorge-pilot.mjs`: the human-bot boss pilot at the campaign hero level.

### Merge glue
- `src/boss-greed.js` has one `banditking` OPEN_RULE row, so boss-greed passes with welltown merged. The coordinator said the welltown fix lane adds the same row.

- Two pilots now reach a waypoint only at its own height on a TALL level: `tools/mash-bot.mjs` (level mode) and `tools/level1-pilot.mjs`. They used to reach it by column alone, which met a climb's waypoints on the floor under them and never met the ledges' foes. Only tall levels change. Their cached rows stay valid until someone re-runs them.

## Numbers

- **level-quality redgorge: CLEARS.**
  - Flat 0%. 32 height bands.
  - 5 gadget kinds, 3 developed (sluice, water-wheel and basket, each in 3 places).
  - 4 secrets. 2 checkpoints, one per 121 route tiles.
  - Ranged: 9 slingers. Roles: melee, ranged, runner.
  - Unlocks declared. Route spans 144 rows, with 11 pockets.
  - Music WARN: the placeholder borrow (report-only).
- **Level-1 no-ability pilot** (knight, 3 runs): 9 blows, 0 deaths, 48 lifts. This clears the floor of 2 but is low: the Folly reads 3, the theatre 16, welltown 81. The bot is lifted past every rope and basket, which are where the flood hurts.
- **Mash bot:**
  - Boss: holds 0/6. Every mash hero dies with the crab at 95-99%.
  - Level (hero L31): knight dies; warden lowest 37%; pyro 33%. All are under the 40% bar.
- **Human-bot boss pilot** (`tools/redgorge-pilot.mjs`, hero L31, normal health), 21 fights:
  - **14/21 = 67%** (knight 3/7, warden 4/7, pyro 7/7). Median win 84.5 s, 5-8 openings a fight.
  - Every death had the crab at 1-18% left.
  - Tuning history:
    - hp 760, x2.4: 3/3 wins in 19-50 s
    - hp 1800: 3/3
    - hp 2100, x1.6: 3/3 in 110-166 s
    - more damage: 6/6, then 4/6
    - one step too far: 8/16
    - final (hp 1900, x1.6, pinch 30, crush 38, boulder 30, scuttle 31, phase two x1.3): 14/21
- **Route:** pacing reads 241 route tiles, because the reach model takes the climb's short cuts. The real walk is longer: the ropes, the baskets and the waits for a flood.

## Checks (all green, run by name, never the suite)

- **Required:** architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, boss-fight-end, slopes-trace (every level unchanged; redgorge is not traced), npc-removal.
- **This level's own:** redgorge, redgorge-probe.
- **Also green:**
  - level-quality, mash-gate, one-new-foe, tells, answer-tags, hint-shown, sprinkle-cap
  - spawns, traps, elites, collectables, deadends, killzones, keys, content-audit, dressing, audio-assets, boss-music
  - map-grammar, shop-gates, floaters, signs, audit, threat-holes, boss-openings, boss-greed, level-jump, untold-told, foe-tactics
  - welltown, store
- **Flake:** untold-told once failed with "fresh lab page did not initialize" while it ran beside another page check. It was green alone.

## UNVERIFIED

- Not played by hand, and no screenshots were taken. All the art is greybox:
  - procedural water, gates, wheels, baskets, jam and nests;
  - the raptor is the vulture tinted rust;
  - the crab is a baked placeholder.
- No route pilot with real keys was written. The level walks in the reach model with a real jump (`tools/redgorge.mjs`) and in the probe by teleport, but no scripted hand has climbed it end to end.
- The flood's sweep through a bridge and the push to the bank were tested once (the probe), not felt. A hero swept on a rope falls to the bridge below: that is the intended cost.
- The raptor lands where it struck. On a rope or the basket, that means it perches in the air for a moment.
- The answer mix (answer-tags report): the gorge asks for only block and dodge among its common foes. The crab's crush and scuttle ask for a jump, but bosses are not counted.
- Co-op: E (the wheels, the nest) is wired for player 1 only, as in welltown.

## QUESTIONS FOR DANIEL (the recommended option is built)

1. **Music.** Pick the gorge's CC0/CC-BY track (in one batch with the Well Town's). Should the crab keep his synth theme? *Rec:* a canyon track for the level, and compose the crab's theme properly from the placeholder. *Built:* the caravan track as a placeholder, and the 'gorgecrab' hook.
2. **The boss's name and kind.** THE GREAT RED CRAB, a giant canyon crab, is the concept's own example. *Rec:* keep it. *Alternative:* "the sluice warden" (a man at the dam).
3. **His opening** is a released burst while he is in the spillway (3.5 s, x1.6). In phase two only his scuttle carries him in. *Rec:* keep. The reviewer should feel whether phase two's "stand in the channel and make him scuttle" reads without a sign.
4. **Hero level for the pilot.** I tuned at the campaign depth (L31, as combat-pilots does). Welltown's pilot used the default hero. *Rec:* tune every desert boss at the campaign depth.
5. **The raptor's role** is counted as RUNNER (hit and run) for the roles measure. *Rec:* keep. *Alternative:* a hornblower bandit as a support role.
6. **Two checkpoints** (the terrace, and the dam's door), so a death in the narrows costs the climb from the falls. *Rec:* keep (the Salt & Sanctuary direction). If the reviewer finds it harsh, put one back at bridge four.
7. **The flood's bite:** 25 base in the gorge, 10 in the dam's spillway, plus heavier gorge stones (13) and raptor stoops (20). This is what makes a mashing hero drop under 40%. *Rec:* keep it, and let the reviewer judge the falls' rope race.
8. **Tool changes to shared files:**
   - the level-quality tall-row places;
   - the mash-bot and level1-pilot tall-height waypoints.
   *Rec:* keep. They only change how TALL levels are read. Re-stamp the other tall levels' rows in their own lanes.
9. **The Bandit King's OPEN_RULE row** was added here so boss-greed passes with welltown merged. The welltown fix lane adds the same row, so expect a duplicate key at merge. *Rec:* keep one copy.
