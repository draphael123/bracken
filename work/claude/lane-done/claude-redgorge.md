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

NUMBERS / CHECKS / UNVERIFIED / QUESTIONS: below.
