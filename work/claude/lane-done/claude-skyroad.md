# Lane report: claude/skyroad (THE SKY ROAD, Opus GREYBOX)

Branch `claude/skyroad`, from claude/moor2art 44e6fb3e (master 2423ff42 + Gale Moor 2 and its art). Master moved to batch69 (COMBAT PART 2) during the lane, and it is merged (a88a13f9). The level is in act II of src/foe-react.js ACTS. Brief: `docs/concepts/sky-road.md` (the section-by-section
structure is at the top; pushed first). This is a GREYBOX for the reviewer (against THE MAGE'S FOLLY and the design standard), then the
Sonnet art and music pass. Nothing ships without Daniel's playtest.

## What it is

**Placement.** On the main road: Gale Moor > THE SKY ROAD > the Ore Road > Stormhold > Highcrown. It is appended to LEVELS as
`{ id: 'skyroad', needs: 'moor' }`, and `oreroad.needs` is now `'skyroad'`. Map node: crag sheet (268,108), with the road
moor > skyroad > oreroad. The crag sheet is crowded, so the only spot map-spacing passes is below the moor/Ore Road line (see question 5).
The level is before the Goblin Queen, so living goblins are fine.

**The rule** (`L.rule`): THE SUN WARMS THE ROCK AND THE AIR RISES: RIDE IT, GLIDE INTO IT. A CLOUD ON IT KILLS IT.

| Verb (the player changes the rule's state) | How it works |
|---|---|
| **Ride** a thermal | A column of rising air over sun-hot rock. It lifts you to its top, which overshoots the reach model's top by 2.5 rows, so you crest it and drift onto the ledge. |
| **Glide** | THE RIDER'S CLOAK, taken off its mast at the station. Hold jump as you fall. Gliding into a column lifts you harder. |
| **Turn a SUN-STONE** | Strike it. Its thermal is dead until you do. |
| **Strike THE SUN-DISC** | It wakes a road of four thermals over a chasm, one after another, for 16 s. |
| **Time the CLOUDS** | Cloud banks drift east. A shadow on a column's foot kills it (fading 0.45 s). The shadow is drawn down through everything, and a column about to die flickers 1.2 s ahead. |

**THE CLOUD SEA** lies under every chasm. A fall into it costs 14, is told (THE DROP), and the updraft puts you back on the last *solid* footing
(never a crumbling span or a mover). It is never an untold death.

### The five sections

| Section | Cols | Arc | What happens |
|---|---|---|---|
| THE MESA STEPS | 0-104 | teach | Two thermals up mesa faces that no jump can climb. The second is under a cloud bank. Failure is cheap (sand under you). |
| THE RIDERS' STATION | 104-190 | teach cloak and stone; SET PIECE A | The cloak. A glide over a sand shelf, where a miss rides a thermal back up. The first stone wakes a thermal over the chasm, and you glide INTO it. **THE GREAT KITE REEL**: the reel's stone heats the flue, the war-kite climbs, and it hauls the cage 12 rows up the cliff, only while no cloud is on the flue. The cage is the only way up. |
| THE HARPY ROOSTS | 190-298 | test and remix | A chain of roost pillars and pinnacle thermals under a rolling cloud bank. Roost two's stone is a lock, because THE SPIRE, rock down to the cloud sea, blocks every glide but the one off R2's top. |
| THE BROKEN SKY BRIDGE | 298-388 | SET PIECE B, then the EXAM | **THE SUN-DISC** wakes a road of thermals across a 34-column chasm. THE EXAM is three cracked spans (three beats each) between two stones, each on a span (s4 wakes R5; s6 on span B wakes R6), with clouds, harpies, a goat and a shield-and-bow head. |
| THE EYRIE | 388-442 | boss | THE ROC. |

After the Eyrie, the road goes down, and the cloak is hung back on a mast (THE CLOAK GOES BACK ON ITS MAST).

**Checkpoints:** four, at 72, 181, 278 and 383 (the Eyrie door). That is one per 105 route tiles.

**Silvers:** three.
- the T4 pinnacle over the cloud sea
- the low roost under roost two (a dead end; R2 takes you back up)
- THE RIDERS' LOFT, the vault: four KITE CLOTHS (quest, `KITE CLOTHS n/4`) and E at the loft open its woven door

Pockets: the wind cave under mesa B, a hollow under mesa A, the riders' store under the lower deck, and the upper deck's undercroft.

### Foes (designed squads, nothing sprinkled)

- **THE GOBLIN KITE-RIDER** (`kiterider`) is the ONE new type (role: runner). It is a CV machine in `src/sky-road-hands.js` riderStep.
  - He circles at his thermal's top.
  - His SWOOP is told with a yellow ! and a dashed line to your spot. It is a kick that a shield turns, and a turned swoop knocks him out of the sky.
  - Any blow while he flies cuts his line, and he falls to fight on foot (or into the cloud sea).
  - A cloud on his thermal sinks him to the rock.
  - A hornblower's horn calls every rider in range into a swoop.
- **CRAG HARPY** + SNATCH: her dive that lands TAKES you, carries you up and out over the drop, and lets go. Mash to break free. A block knocks her down, as before.
- **Goblin KITES** (the moor's) hang high in their thermal and sink into reach when it dies.
- **POT-SLINGER**: the reskinned shooter, the moor's rock goblin AI under `cnSkin: 'gobslinger'`.
- **CRAG CROWS** (the moor's strings): a crow's shadow crossing a thermal kills it for a beat.
- **HORNBLOWERS** are support. **Archers**, **shield goblins** (heavy) and a **goat** are also used.
- Roles: melee, ranged, heavy, runner, support (5).

### THE ROC: `src/roc-eyrie.js`

She was unplaced since the Monastery rework. Her belfry fight in main.js is untouched; main.js hands her body to this module when `L.arena.eyrie` is set.

**Kept from her kit:**
- in the air nearly always, at the global x0.05 chip;
- THE DIVE: a shadow and a red !!; onto the nest's woven boards she STICKS (open 3.4 s); onto stone she skids;
- THE GALE: unmarked, a wind that walks you onto the thorny rim;
- SHED FEATHERS;
- THE SNATCH: talons spread and a red !!; struggle free, and she drops you.

**New:**
- **THE THERMAL PLUNGE** (her main opening): ride a rim thermal over her and plunge onto her back. She goes down, open 3.2 s, and is read at the blow (main.js hurtEnemy0).
- **HER ANSWER**: she drags a cloud over the thermal nearest you, and over the one you plunged from.
- **PHASE 2 (half her blood), THE STORM:** the rim thermals die, and only the nest's sun-stone thermal still rises. Lightning finds the three iron kite-masts on a told crackle (a red !! at the mast). A bolt while she perches on that mast knocks her down. The storm dive comes in twos.
- **ANTI-SPAM WARD:** after every opening, a told 3.5 s ward (HER FEATHERS BRISTLE, a ring). In it a plunge does nothing and a dive skids.

Her other details:
- **Readability:** her greed reprisal comes from the global rule (her OPEN_RULE row is `rocEyrieOpen`).
- **Numbers:** 850 hp; talons x1.9, the drop x1.3.
- **Bot:** `src/roc-eyrie.js` rocEyriePlan, which the lab branch uses.

## Files

**New:**
- `src/sky-road.js` (the level)
- `src/sky-road-hands.js` (the rule and its machines)
- `src/roc-eyrie.js` (the boss and its bot plan)
- `src/redraw/skyroad_art.js` (greybox sprites)
- `tools/skyroad.mjs` (Node: placement, the reach with and without the cloak, every stone, the disc, the reel and the loft proved a LOCK, checkpoints, silvers, cloths, thermal columns)
- `tools/skyroad-probe.mjs` (in page: 15 asserts)
- `tools/skyroad-pilot.mjs` (the human-bot boss pilot)
- `tools/skyroad-shots.mjs` (pictures)

**main.js (small local hooks):**
- the import and construction (SKY, ROCE)
- `thermal`/`src` on vent props
- the kite-rider spawn and the CV tables
- `riderHurt`, `riderStruck`
- the harpy and kite hooks
- the vent-loop branch
- the player hook (glide and the cloud sea)
- the update and crumbles
- strike, interact (E at the loft), the cage mover
- draws
- the guide's extra props
- the Roc dispatch and the plunge read at the blow
- the map node and CRAG_PATH, TIER, MEDALS, EHP
- the bestiary card, BEAST_SHORT, COLS
- BK accessors

**Other files:**
- `src/level.js`: the LEVELS row; Ore Road needs skyroad
- `src/reachcore.js`: THE CLOAK in the fill; L.skyroad only, never the plain fill or `opts.noGlide`. A glide reaches 6 + 2 columns a row dropped, sinking as it goes past rock, and a glide that meets a thermal rides it. The loft's door is counted as done.
- `src/boss-greed.js`: the `roc` OPEN_RULE row
- `src/lab.js`: the eyrie branch
- `src/marks.js`: BY_HAND, ANSWER, HEIGHT rows, then `tells --write`
- `src/threat.js`
- `src/hint-lines.js`
- `src/stuck-spots.js`: a glint and a nudge on every route need — both thermals of section 1, the cloak, every stone on the route, the reel's cage, the disc
- `tools/level-quality.mjs`: GATE skyroad, ROLES runner kiterider, REPORT_ONLY music, the flat fix (question 4)
- `tools/one-new-foe.mjs`: skyroad = kiterider
- `tools/corpses.mjs`: skyroad
- `tools/boss-openings.mjs`: the Roc
- `tools/check.mjs`: skyroad, skyroad-probe
- `tools/hint-shown-silent.txt`: one line routed, so it shrank
- `docs/mash-bot.json`, `docs/level1-pilot.json`
- after the merge: `src/foe-react.js` (ACTS: the Sky Road is act II), `tools/rule-state.mjs` (RULE_KEYS gains clouds and skyThermals, so fight-during-the-rule reads 18 of 18 encounters), `docs/level1-curve.json` (its curve row)
- pictures for the reviewer: `work/claude/skyroad/` (full-level.png and seven moments, from `tools/skyroad-shots.mjs`)

## Numbers

**level-quality skyroad: CLEARS** (music report-only, the placeholder):
- flat 18% / 25%
- 11 bands; 41% of the width offers a second height
- 8 gadget kinds, 3 developed (thermal, stone, mast)
- 2 secrets
- 4 checkpoints, one per 105 route tiles
- 1.13 encounters per screen
- 5 ranged foes, 5 roles
- 3 pockets

**Level-1 no-ability pilot** (knight, 3 runs), re-stamped after the merge: 21 blows, 0 deaths, walked 100%. The act-II curve row (`--curve`) reads 111% health lost and 0 deaths, inside act II's band (70-400%, 0-6 deaths). curve-gate is green.

**Mash bot.** Level first, then boss; tools/mash-bot.mjs, level then boss.
- Level, re-stamped after the merge: knight dies, warden lowest 18%, pyro dies.
- Boss: **0/6**; she is left at 60-64%.

**Human-speed bot** (`tools/skyroad-pilot.mjs`, L9 = the Sky Road's campaign depth, normal health). The pass is capped at about 20 fights per hero.

| Config | Fights | Wins | Median win | Notes |
|---|---|---|---|---|
| first (1100 hp, no tuning) | 6 | 6/6 | 162 s | |
| x2.0 talons | 9 | 33% | | |
| x1.7 | 9 | 56% | | warden 0/3 |
| x1.7, new grab plan | 9 | 22% | | |
| x1.7, rim clamp | 9 | 78% | | |
| x1.9 | 9 | 89% | | |
| **FINAL** (x1.9, plus her cloud after a plunge) | 6 | **3/6 = 50%** | 113 s | knight 2/2, **warden 0/2**, pyro 1/2 |

The salts are noisy, so I stopped at the cap (see the questions). On average she is opened 10-15 times a fight: about 60% plunges and 30% dives stuck in the nest, plus 4-9 lightning bolts in phase 2.

## Checks (by name, PORT 8622 only)

All green, run by name on PORT 8622 after the merge of origin/master (batch69, COMBAT PART 2), 31 checks:

- **Required:** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (every level identical; skyroad is not traced), npc-removal.
- **This level's own:** skyroad, skyroad-probe (15 asserts in the page).
- **The rest:**
  - level-quality (every gated level clears), mash-gate, curve-gate, combat-part2
  - stuck (66 spots, static + runtime), corpses, boss-openings (the Roc: alone 0 s open, plunge 3 s+), boss-greed
  - one-new-foe, hint-shown, tells, untold-told
  - audio-assets, map-grammar, map-spacing, checkpoint-gaps, threat-holes, moor-rocks, signs, collectables, weapon-skins

Earlier in the lane, before the merge, these were also green: checkpoint-stand, death-cost, deadends.

## UNVERIFIED

- **Not played by hand.** All art is greybox:
  - shimmer columns, cloud bodies and shadow bands;
  - plain-shape stones, disc, flue, war-kite, cage frame, masts, loft door and nests;
  - the kite-rider is a small goblin sprite with the kite drawn over him;
  - the pot-slinger is a rock-goblin recolour.
  The backdrop is the crag palette; the level-wide sky gradient should be checked in the art pass.
- **Per-hero base-movement reach** was reasoned from the physics, not walked by a scripted hand:
  - glide is about 2.4 columns per row at run speed;
  - every route glide has margin in the reach model's terms (6 + 2/row);
  - the closest is the mesa B to ledge one gap (12 columns, 4 rows of drop), but a miss lands on the sand shelf and its thermal takes you back up.
  - A reviewer should walk it with real keys on knight, warden and pyro.
- **The Roc's bot number has wide variance** (22-89% across configs of the same shape). The final 6-fight sample is in band, but has the warden at 0/2. Daniel's playtest gate applies.
- **Co-op:** the loft's E and the cloak are wired for player 1 (as in the gorge and the well town). The thermals lift every player.

## QUESTIONS FOR DANIEL (each built as recommended)

1. **Road order.** Daniel's words were "right after Gale Moor ... > Stormhold", but the Ore Road sits between them. I built moor > SKY ROAD > Ore Road > Stormhold, which means `oreroad.needs` is now `'skyroad'`. A save that cleared the moor but not the Ore Road now meets the Sky Road first.
   - *Rec:* keep.
   - *Alternative:* moor > Ore Road > Sky Road > Stormhold.
2. **Sun-stones and the sun-disc** are my addition. Standard A2 asks for a verb that CHANGES the rule's state; riding and gliding only use it. Striking a stone wakes a dead thermal, and the disc wakes a road of four. They make the stones locks (proved in tools/skyroad.mjs) and give set piece B.
   - *Rec:* keep.
3. **Reskins.**
   - The brief's goblin slinger (on the caravan slinger) and crag hawk (on the vulture) failed one-new-foe. That tool counts by base kind, and both are the DESERT's foes, met later in the campaign.
   - Built instead: the reskinned shooter is the POT-SLINGER (the moor's rock goblin under `cnSkin`), and the birds are the moor's CRAG CROWS (a crow's shadow kills a thermal for a beat).
   - *Rec:* keep.
   - *Alternative:* teach one-new-foe to count a `cnSkin` as its own kind.
4. **A measurement fix in tools/level-quality.mjs (flat runs).** A run that crossed a gap with no footing used to count the gap's columns as flat empty ground. A glide over a 30-column chasm read as 30 flat columns. It now ends where the floor ends. Every gated level still clears, and the level-quality check is green.
   - *Rec:* keep (it reads what the comment says it reads).
   - The reviewer should say whether this counts as a weakened test.
5. **Map node.** The crag sheet is crowded. Every spot between the moor and the Ore Road broke map-spacing, so the node is at (268,108): the road dips south from the moor to the Sky Road and comes back up to the Ore Road.
   - *Rec:* keep for the greybox; the map lane can relayout the crag sheet.
6. **Music is a placeholder, report-only in level-quality.**
   - The level plays `skysail`, the retired sky ship's track.
   - The Roc plays her old `roc` track, which the Monastery's abbot arena still plays.
   - *Rec:* Daniel picks a soaring CC0/CC-BY track for the level (no download until his yes), and the Roc gets her own synth theme in the art/music pass.
7. **The Roc's number.**
   - The final 6 fights were 3/6 = 50%, median win 113 s: knight 2/2, warden 0/2, pyro 1/2.
   - Across the ~20-fight cap per hero, the same shapes swung from 22% to 89%, because her fights are noisy per salt.
   - I stopped at the cap.
   - *Rec:* the reviewer re-runs `tools/skyroad-pilot.mjs 9,10,11` once. If the warden stays at 0, ease her snatch for him (the struggle per press, `EYRIE.mash`) rather than her health.
   - Daniel's playtest gate applies.
8. **No crosswind SHEAR** on the sky bridge (the draft concept had it). The moor owns sideways gusts, so I left it out to keep the two levels distinct.
   - *Rec:* keep it out.
9. **The difficulty index** (tools/curve.mjs, informational) reads 62, against the moor's 89 (after moor2) and the Ore Road's 127. A flight level stands fewer foes per column. The level-1 curve row is inside act II's band.
   - *Rec:* keep. If Daniel wants it harder, add a designed squad on the far cliff, rather than sprinkling foes.
10. **Moor's curve row is stale.** The moor's level-1 curve row (docs/level1-curve.json) is stale on this branch, because Gale Moor 2 changed the moor after COMBAT PART 2 measured it. curve-gate prints it and does not fail.
    - *Rec:* the moor2 lane, or the batch integrator, re-runs `node tools/level1-pilot.mjs moor --curve`.

---

# FIX PASS (claude/skyroad, Opus, overnight 10-05/06), against scratch/review-skyroad.md

Merged origin/master 85e13368 (batch71) first. The conflicts were unions: both new levels' imports and LEVELS rows (the gorge needs the
Underwell; the Sky Road needs the moor), SKY next to UWH in main.js's shared lines, both reachcore vault fills, both hint-line blocks,
check.mjs, the level-quality GATE and ROLES, one-new-foe, and the docs json rows. marks.js was regenerated with `tools/tells.mjs --write`.
One criss-cross hunk in spawnEntities needed a hand fix: the reset line now has both UWH and SKY, and the old xpKey line is gone.

## What changed

| # | Review item | Done |
|---|---|---|
| 1 MUST | THE GREAT KITE REEL cage must be boardable | **The reel is now a state machine** (`src/sky-road-hands.js` H.mover, `REEL = { up 3.4, down 2.6, delay 3, rest 3 }`): cold, then wait, then up, then down, then wait again. The first haul waits 3 s after the strike, and a told line says THE KITE TAKES THE LINE: STEP ON THE CAGE. A cloud on the chimney now takes the cage **all the way down to the deck** (committed: it does not stop when the cloud passes), and the cage rests 3 s there. New sign at the berth: A CLOUD BRINGS THE CAGE DOWN TO THE DECK. STEP ON IT THERE. The nudge says THE CAGE COMES DOWN TO THE DECK: STEP ON IT THERE. **Scripted real-key hand** (scratchpad cage.mjs; god, foes dead): knight, warden and pyro, each arriving 0/4/9/15/22/30 s after the strike, wait at the deck edge, walk on and ride up. **18/18 boarded on the first try**; the longest wait was 19.8 s (one cloud cycle). |
| 2 MUST | Glide nudges and signs | Four glide nudges as stuck-spot steps: mesa B's edge to ledge one (once the cloak is taken); ledge one into thermal four (once s1 is turned); the deck's edge to roost one; the lit disc road. New and changed signs: s3, the lock (A SUN-STONE. STRIKE IT TO WAKE THE AIR OVER THE SPIRE.); s4 and s6 share one sign on the east tower, THE SPANS ARE CRACKED. STRIKE EACH STONE BEFORE ITS SPAN GOES. A sign standing on a crumbling span would hang in the air once the span falls. The disc sign now says ...THEN CROSS WHILE THE AIR RISES, and the roosts sign says ...A CLOUD KILLS THE AIR: WAIT FOR IT TO PASS, THEN GLIDE. |
| 3 MUST | The rule line names the verb | `L.rule` is now THE SUN WARMS THE ROCK AND THE AIR RISES. STRIKE A SUN-STONE TO WAKE ITS AIR; RIDE IT, GLIDE INTO IT. A CLOUD ON IT KILLS IT. The same line is in the file headers and the brief. It is what the code does: natural thermals rise, a stone wakes a dead one, and a cloud's shadow kills one. |
| 4 MUST | The flat measure | **The narrowed rule the coordinator ratified, exactly.** A run ends where the floor ends only at a gap **wider than LIM.chasm = 5 columns**; a jump-sized pit cuts on its far side, as it did before the greybox. I compared the old (master) code with the new over every level. 8 levels' flat numbers change: marsh, spore, moor, reef, fields, mage, oreroad and skyroad. **No other gated level's numbers change.** Only two verdicts move: the Sky Road (gated; 44% to 18%, now clears) and the Ore Road's flat row (not gated; its overall verdict is unchanged). |
| 5 MUST | THE ROC into 50-60% | **One change: the snatch drop, `EYRIE.dropK` 1.3 to 2.0.** The drop is unblockable, so it is the one hit that reaches the knight behind his shield; he was 7/7 before. The Roc's health, ward and openings are untouched. Measured at campaign level (L9, `tools/skyroad-pilot.mjs`, human bot); see the table below. |
| 6 MUST | Foreshadow her (B8) | A sign at the Eyrie door: THE ROOSTS ARE HERS. THE ROC NESTS PAST THIS DOOR. A feather trail along the bridge (5 greybox `feather` decor). Her shadow crosses the bridge **once**, the first time a hero is out on the last spans (cols 368-389): a shriek, a dark band with wings over it, and the told line A GREAT SHADOW CROSSES THE BRIDGE. |
| 8 SHOULD | The spire hop | The plank now runs to 232, so the gap is 1 column and needs no running jump. |
| 9 SHOULD | A heavy past the roosts | A shield goblin at (283,17) on the far cliff, in the slinger's squad. |
| 12 SHOULD | Mash, re-stamp | Level first, then boss (below). |

Not done: 7 (s3 got its sign; s4/s6 share the tower sign, see #2); 10 (the first harpy is still over the shelf: moving a flyer off a glide line needs a hand check I did not spend; it is cheap for the art lane or a later pass); 11 (no change asked).

## THE ROC, campaign level L9 (`node tools/skyroad-pilot.mjs`, PORT 8643)

| Config | Fights | Knight | Warden | Pyro | Total | Median win |
|---|---|---|---|---|---|---|
| talons hitK 2.1 (stopped early) | 12 | 4/4 | 3/4 | 3/4 | 83% | |
| talons hitK 2.4 | 21 | 7/7 | 4/7 | 3/7 | 67% | 117 s |
| **FINAL: dropK 2.0 (hitK back at 1.9)** | 18 | **5/6** | **3/6** | **2/6** | **56%** | 117 s |

- hitK only scales her rake and the lightning, so it barely moves the knight.
- 17 seeds per hero in all, inside the ~20 cap. I stopped once the number was in band.
- Warden wins take 136-144 s, inside the 90-150 s window; the review had him at 163-167 s.
- **Mash boss: 0/6** (she is left at 62-67%).

## Re-stamped (tools/mash-bot.mjs, level THEN boss; tools/level1-pilot.mjs)

- **Mash level (L9):** none of the three clears.
  - knight: lowest health 7%
  - warden: lowest health 6% (the review had 18%)
  - pyro: dies
- **Mash boss:** 0/6.
- **Level-1 pilot:** 24 hits, 0 deaths, walked 100%.
- **The act-II curve row:** re-stamped.

## Checks (PORT 8643)

Green: skyroad, skyroad-probe, level-quality (every gated level clears), mash-gate, curve-gate, tells, boss-greed, boss-openings, boss-fight-end, architecture, checkpoints, skins, dangling-paths, npc-removal, map-spacing, map-grammar, signs, hint-shown, one-new-foe, corpses, threat-holes, rule-state, underwell, comments, checkpoint-gaps, and stuck --static (90 steps in 72 spots).

**Not run:**
- the stuck **runtime** check (it walks every level's spots);
- the 40-minute suite (the coordinator runs suites).

Port note: boss-openings and boss-fight-end failed once to bring up a server or browser on 8643 (the PC was under load), then passed on a re-run. One batch of checks right after the merge (hint-shown, boss-openings, boss-greed) ran on the checkout's default port block before I set PORT=8643. Each one starts and kills its own server, and nothing was left running.

## QUESTIONS FOR DANIEL (each built as recommended)

1. **The Roc's one change is the snatch drop** (x1.3 to x2.0, 30 to 46 damage, unblockable).
   - *Rec:* keep. It is her most told move (talons spread, a red !!, struggle free), and the only one the knight's shield cannot turn.
   - *Alternative:* health up, but that makes the warden's fights longer.
   - Your playtest gate stands.
2. **The reel cage now always comes down to the deck and rests there.** This was the review's question 3.
   - *Rec:* keep. A player who just missed it waits at most one cloud cycle (about 20 s).
   - *Alternative:* a shorter cloud gap over the chimney, if the wait feels long in play.
3. **s4 and s6 share one sign on the east tower.** A sign on a crumbling span would float once the span falls.
   - *Rec:* keep. The nudges still name each stone.

## ART PASS (claude/skyroadart work on claude/skyroad, Sonnet)

Art only: no geometry, route, foe, rule or number moved (the level data edits are the look: `ambient` -> its own bed; the greybox palette stays as the sky). Pictures: docs/skyroad/before (the greybox) and docs/skyroad/after (art-01..22 plus the seven moments and full-level.png). Tools: tools/skyroad-art-shots.mjs, tools/skyroad-shots.mjs, tools/skyroad-aloft.mjs.

### What changed
- TILE KIT src/redraw/skyroad_tiles.js (hooked in main.js after the moor's kit): WIND-CUT STRATA laid by world row so a bed runs across a whole mesa, scoured flutes, a lit lip on a bleached cap, drift sand in the joints, overhang undersides; five stones, one per section (ochre sandstone, cream limestone with rose beds, slate-violet roost pillars streaked with guano, pale cut ashlar for the bridge, basalt for the Eyrie); below row 44 every rock fades into the cloud sea's violet-white, so pillars go DOWN INTO the cloud. The three cracked spans (L.crumbles) are fractured slabs with orange accent seams.
- PLATFORM VARIETY: lashed stone slabs on iron straps (mesas, bridge), KITE-CLOTH DECKS (red/cream sail-cloth on a bone rail, scalloped hem; the roosts and the hanging kite platform), woven reed-and-bone boards (the Eyrie), cracked spans, plus the supports below.
- BACKDROP + LANDMARKS src/redraw/skyroad_backdrop.js (replaces the stock crag far/mid): a far mesa range with a kite fleet drifting on the wind, a nearer mesa range, and a LANDMARK every 300 px on a 0.32 parallax (THE SUN-RING spire with a tethered war-kite, THE MAST SPIRE with a streaming banner, THE BROKEN ARCH) so one is in view on almost every screen; THE EYRIE (the Roc's black spire, nest crown, iron masts, her shape circling) on the horizon from the first screen, sliding left and clearing the haze as the road goes on; low sun shafts (additive).
- DRESSING src/redraw/skyroad_dress.js, read off the grid (hash-safe): about 120 items, 18 kinds - waymark cairns, bones, kite-line spools, folded war-kites, jars, sacks, rope coils, bird nests (roosts), mooring bollards, masts with streaming pennants, rubble, dry tufts; sun-wheels, iron rings and guano streaks on the faces; kite-tail ribbons hanging under every cloth deck and slab. 
- SUPPORTS: every ledge is keyed to rock with a corbel, stands on a stone pier or bone-and-iron pole to rock, is STAYED by a cable to an iron ring in the rock (the hanging kite platform), or - a short ledge let into a wall - carried by a girder. 34 piers, 2 stays, 6 rock keys, 5 girders over 22 runs.
- LIGHTS: braziers (every checkpoint, the Eyrie doors) and lantern poles throw flickering additive pools; a turned sun-stone, the burning disc and its beam, every live thermal's foot, the flue's mouth, the Roc's nest all glow.
- THE RULE'S STATES, DRAWN (src/redraw/skyroad_world.js, called from src/sky-road-hands.js): THERMAL live = rising gold bands, motes and a torn scrap of kite-cloth riding it, an orange glowing plate and a light pool; DEAD (stone not turned) = a slate plate and a dotted ghost of the column; ABOUT TO DIE = flickers; SHADED = a frost-pale plate. CLOUD = a lit crown over a grey belly with a ragged cool shadow band down the whole screen. SUN-STONE = a carved glyph slab: slate when off, rolls over when struck, gold with rays and sparks when on. SUN-DISC = bronze disc with 16 rays on an iron post; dull and a dotted line when unlit; burning with a beam and a pool when lit. The reel: the flue, the war-kite, the cage (iron-framed reed basket); the cloak's mast; the loft's woven door; the Roc's nest mat.
- AMBIENT: its own synth bed 'highair' (src/audio.js): a thin whistle through rock that swells and fades, a deep rush, kite-cloth cracking in a gust, a taut line humming, grit on stone, a far raptor, a loaded rope (the creak clip already on disk). Nothing downloaded.
- NOTHING FLOATS: tools/skyroad-aloft.mjs (in check.mjs, Node; `--page` proves the piers are drawn): all 22 ledge runs held, every pier/stay/girder real, every prop held up, 42 grounded things on a foothold.
- MUSIC stays the placeholder (`skysail`). Picks below (NOT downloaded).

### Identity self-score /18 (greybox review 10): KIT 2, PAL 2, PLAT 2, LMK 2, SET 2, DRESS 1, LIGHT 2, AMB 2, THEME 2 = 17/18
(From stills only: DRESS is 1 because the long plain mesa tops between the dressed stretches are still sparse.)

### MUSIC PICKS (Daniel decides; nothing downloaded)
1. "Bring Me The Sky" - Scott Buckley - CC-BY 4.0 - https://www.scottbuckley.com.au/2021/10/new-library-track-bring-me-the-sky/ (soft piano opening into soaring brass and strings: the level track).
2. "Born Of The Sky" - Scott Buckley - CC-BY 4.0 - https://www.scottbuckley.com.au/library/born-of-the-sky/ (uplifting, heroic, punchier).
3. "Phoenix (2026)" - Scott Buckley - CC-BY 4.0 - https://www.scottbuckley.com.au/library/phoenix-2026/ (chamber strings, tension and release: a candidate for the Roc's own theme).
Credit exactly as the licence asks (as for Ossuary 6 - Air).

### THE ROC cross-check at campaign level (report-only, no tuning): `node tools/harnesscard-rates.mjs skyroad --mode=new --seeds=6` (L9, normal health, 18 fights)
| hero | wins | median win | notes |
|---|---|---|---|
| knight | 5/6 (83%) | 103 s | |
| warden | 3/6 (50%) | 141 s | slowest, as in the review |
| pyro | 2/6 (33%) | 59-106 s | dies fast when he dies (33-74 s), 130 hp |
Total 10/18 = 56%, the same as the fix pass's 10/18 from skyroad-pilot (56%). On target overall; no hero at 0/6; but the spread is wide (knight 83% vs pyro 33%). Rec: leave for Daniel's playtest gate; if pyro feels harsh the lever is the snatch drop, not anything in the art.

### Checks (PORT 8652)
Green: skyroad, skyroad-probe, skyroad-aloft (new, in check.mjs), level-quality, mash-gate, signs, hint-shown, audio-assets, boss-music, ambient-landmarks, comments, homepaths, syntax, floaters, render-layers, footing-art, ground-depth.
Reds not mine: modulepreload FAILs on 19 modules (archmage-acts, foe-react, moor-rocks-hands ...; fix is `node tools/modulepreload.mjs --write`, the coordinator's). The machine ran out of memory/time under the other lanes: the first batch OOM'd level-quality/signs/audio-assets/hint-shown/boss-music (all re-run alone and green) and textfit's plates/bossfix/tree scopes timed out under load (the hints, bestiary and store scopes passed); textfit re-run noted in the final message.

### UNVERIFIED
Stills only, no human eye in play; the Roc's fight not replayed with the new nest mat (draw only); frame cost of the new backdrop and additive glows not timed on a phone (a handful of drawImage calls and a few radial gradients a frame; frame-cost not run under load).

### QUESTIONS FOR DANIEL (each built as recommended)
1. MUSIC: pick one of the three above for the level (and Phoenix for the Roc). Rec: "Bring Me The Sky" for the level.
2. The Roc's pyro rate (2/6) vs the knight's (5/6): Rec: leave; Daniel's playtest decides.
3. Piers in the thermal path: a short ledge let into a wall is now carried by a girder, not a pier, so no post stands in a climb. Rec: keep.
