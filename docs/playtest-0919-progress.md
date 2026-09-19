## Item 2 — flashing

Reproduced the full-height band in Stockade tiles 140–145 with the pyromancer: the foreground coverage state toggled at tile 142 and the old fade divided the band into rectangular brightness regions. Decorative trunks and parallax columns now draw softly behind the tiles and actors. Remaining near foliage uses one continuous radial mask rather than threshold-switched rectangles. Night-light code was inspected; this reproduction traced to the foreground composition, not a darkness-mask toggle.

Before/after frames inspected. `npm run check` exit 0 (19 checks); render-layer rule included in the suite. Unverified: Daniel's exact original screenshot location, which was not supplied, and a human playthrough.

## Item 3 — pyromancer heat

Successful direct hits grant 12 heat, jet hits 4, and attributed burn ticks 1.5; the meter's variety floor is 85%. Missed swings, shots and skills no longer grant cast-time heat, and an empty jet cannot fill it. Hits refresh a four-second grace; cooling is 3/s afterwards. Pilot Light, Inferno and the banked-pyre behavior remain.

Fight lab sequence (sprig, shield, brute, archer): peaks 13.8, 31.8, 87.05, 100, with exactly one fill; all foes killed. Before this change, the first three peaked at 11.9, 7.58 and 28.34 with no fills. Empty swings and a six-second held jet measured zero heat. Timing/floor regressions are part of the check. `npm run check` exit 0, all 20 checks passed. Unverified: extended human balance playtest and multiplayer burn attribution.

## Item 4 — Hornet Queen

The fight keeps its wide camera through rendering. The ceiling comb is decoration; slams shake four warned wax chunks loose, which shatter without adding platforms. Low arena ledges remain. A machine check covers ceiling collision, the three-piece cap, warning time, unchanged footing and persistent zoom. Wide-view frames inspected. All six boss labs killed her (40.1, 79.2, 24.3, 43.0, 35.1, 57.4 seconds); these remain below the requested 90–150 seconds, as the baseline mostly was. Timing balance remains for item 13. `npm run check` exit 0, all 21 checks. Human combat feel unverified.

## Item 5 — decoration kits, monastery and runtime footing

Every registered level now has an explicit ground kit and a decoration allowlist covering scatter, DRESS and authored entities. Stormhold keeps its scatter density with camp objects and replaces its cairn with a skull totem. The monastery swaps tents for pilgrim lean-tos and adds herb beds, stone lanterns, prayer flags, incense stands and animated monks at chores; its existing wells, shrines, statues, cloister and bells remain. Grounded arcades support the first terrace visually.

Seven support-loss tests reproduce a removed floor outside the active range: snuffer, lookout, two wights, marine, sworn sword and shardling each fall 80 pixels onto the lower floor. Marines no longer reset their height; wights follow footing, and these walkers settle before distance sleeping. Targeted floaters, spawn and decoration audits passed. Gate, terrace, cloister and Stormhold frames inspected. `npm run check` exit 0; all 23 checks passed, including the two new audits. Human traversal and final combat balance remain unverified.

## Item 6 — Kingswood and supported fixtures

Added THE HUNTING STANDS after the fired wood and THE OLD STONE before the processional: two climbable framed stands, rope bridge/swing, archers, a cuttable patrol stand, and a masonry gatehouse/aqueduct climb with a ram set piece. Older canopy platforms have legs and the swing logs remain. Standing props move to permanent bridge banks; a rule rejects props on breakable spans. Authored torches and perched lamps draw holders anchored in terrain, preserving dark lamps. Existing firepits stand on floors.

Two actual sword presses cut the stand, remove its deck and kill the patrol. Trap, pickup, spawn, elite and holder/bridge checks pass. The pixel pass caught a checkpoint intersecting a stair; moved it onto the ledge. Final `npm run check` exit 0, all 25 checks. Three views inspected. Curve introduces no new out-of-line steps; the pre-existing Fields/Mage steps remain.

King lab: knight 19.3s, pyro 22.7s, paladin 18.7s, pirate 39s killed; Warden timed out at 7%, Reaper at 49%. Previous-commit comparison also timed out Warden at 7%, with Reaper winning at 143.6s. These boss duration/bot reliability gaps remain explicitly open for item 13. Human route feel unverified.

## Item 7 — readable scenery and a hanging town

All pass-through scenery draws behind collision tiles with softened colour and stripped dark outer outlines. Solid tiles retain their outlines. The shared rough climb face now has a grip pose, clank and contact dust. Thirteen slung/stilt houses, two public halls, smoke, stalls, washing and a pulley basket give the village a town silhouette. Residents select doors on their own tier, fixing a market resident shutting a roots-tier door.

Five screenshots inspected. Live tests verified the correct door closure and a 24.8px/s wall grip. New readability and town tests are in the suite. `npm run check` exit 0, all 27 checks passed (outputs/07-check.log). Human traversal and combat feel remain unverified.

## Item 8 — Owl Reeve lamp loop

Six lamps sit on permanent footing, including three on the floor. A strike lights a 14-second wick; melee, plunge/dash contact, jet, fireballs and other player projectile paths share ignition. Their visible 78px glow drops a flying/perching Reeve into a three-second grounded opening. Hoots snuff nearby lamps; phase two tells and flies toward a lamp to beat it out. The lab now lights floor lamps and waits for a grounded opening. The new 116px sprite has barred wings, ear tufts, pale face, pinched dazzled eyes, hooked beak, talons, chain and torn tabard.

Actual strike: lamp lit with 13.69 seconds remaining; moving the flying boss into that glow yielded grounded. Perched/grounded screenshots inspected. Lamp rule tests cover footing, fuel, dazzle, hoot and dive. `npm run check` exit 0, all 28 checks. All six lab heroes killed her in 14.1, 14, 36.3, 13.9, 12.6 and 17.5 seconds. Duration is below target and remains open for item 13; human feel and exhaustive skill-by-skill ignition are not yet verified.

## Item 9 — Roc belfry

The summit is now an open stone belfry with beam walks, a ladder, low parapets and a great bell on a timber frame. The Roc watches from outside through an arch; her wing and talon reach inside. She alternates distant attacks and a nearby bell opening: gust, shadow-marked talon, hit-to-break carry, feather fan and shriek. Phase two tears off the decorative roof and drops seven warned tiles. The bell resets after six seconds and has no charges. A doubled storm-grey/gold full body appears when she falls inside. Removed the old per-opening damage cap from her updater.

All five attacks and carry release verified in the mechanic test; terrain/ladder and phase-two roof hazards covered. Six arena frames inspected. All six heroes killed her in 57.4, 141.9, 65, 70.8, 58.4 and 81.7 seconds, with incoming damage now recorded (23–38/min); faster-hero duration remains item 13. `npm run check` exit 0, all 29 checks. Human encounter feel remains unverified.

## Item 10 — Gale Moor

Added Wind Rivers with jump-release air rails and a downdraft cliff with timed lulls, shelter landings and exposed recovery ladders. Enriched the summit with runes, ribbons, altar, grass and phase-two hail; added lift-capable twister and warned lightning stone attacks. Live rail test carried the hero 80.62px and released at -260 vertical velocity. Three frames inspected. Corrected two buried recovery ladders after reachability checks. Final npm run check exit 0, all 30 checks (10-check-final.log). All six Windcaller labs killed in 21.8–58.5 seconds; duration remains for item 13. Human feel unverified.

## Item 11 — Stormhold watchtowers

Three framed towers have ladders, guarded inner floors, rooftop guards and rope slides. Their tops offer a horn blower, a weight winch and a local camp-gate winch. Live rope attachment, 25.2px travel and jump release verified; three tower frames inspected. The new tower rule test is wired into the suite. npm run check exit 0, all 31 checks (11-check.log). Human traversal and both winch payoff actions remain unverified.

## Item 12 — Sporewood

Removed authored puffballs, rollers, nests, shamans, drones and sleep regions; sleep-cloud producers no longer put heroes to sleep. Replaced the summoning elite with a shield guard. Struck mycelium nodes grow the two temporary cap steps, and glowbuds still light the cellar. The Mother now occupies 31 tiles: strike a reusable root knot, bounce to the heart and cut it, then repeat. Root fan, root stab, folding cap and seed rain have tells; no brood returns. The heart ignores lingering burns/bleeds.

Actual node strike grew both steps 56px; staircase and open-heart frames inspected. Six heroes killed in 92.6–98.6 seconds before the final root-stab addition; repeat in item 13. Final npm run check exit 0, all 32 checks (12-check-complete.log); newlevel spore passes. Human pacing, particularly the knot reset, remains unverified.

## Item 13 — committed combat and paid plunge chains

Swings cannot roll-cancel; Light Step discounts dodge cost instead. Shared combat values distinguish small flinches and big staggers, scale hitstop and knockback, strengthen impact/landing sounds, linger falling corpses and support riposte/rear-heavy finishers. Garrison counts are reduced by a quarter (48 fewer built creatures overall), with common blows raised 25%. Plunges cost x1/x1.6/x2.5 and suppress passive regeneration until grounded. No new boss bucking or stagger caps were added.

Actual inputs verified swing commitment, 28/45 stamina spending, no airborne recovery, recovery on landing, and finisher kills. Pogo pilots now clear stale attempt state, track the body just bounced from, and count real foot overlap with the landing. Lowered unreachable wasps and shortened two overlong transfers without changing the stamina costs. All 36 route/hero combinations crossed in the focused receipts; revised geometry and impact frames inspected. Final npm run check exit 0, all 33 checks (13-check-final.log/exit). Spawn and 120 paid-dead-end checks pass. Stormhold follow-up: actual strikes release the weight and open all three local gate tiles.

**Acceptance still partial:** 138 randomized boss samples across all six heroes, with navigation/recovery retests, yielded 115 kills and 38 within 90–150 seconds. The Mother passed all six at 90–116.2 seconds. Several other bosses still time out or finish too fast; these are not called verified. The damage ledger does not yet constitute a controlled plunge-versus-mixed-strategy comparison. Human combat feel is also unverified. See combat-acceptance-0919.json.

## Item 14 — one captain holds the room

All 18 rooms now lock around one named elite and three complementary minions already on their footing. Captains retain their regular sprites and increased health; kinds without bespoke elite moves alternate told slam/lunge attacks instead of summoning another wave. Adjacent rooms retain different captain types. Captain death opens the gates immediately; survivors become harmless, run away and leave. Removed wave transitions and timer-based clears. The target is now 15–35 seconds, recorded in shared data and section Q. The pilot now targets the captain, handles ledges and rests without injected stamina.

All 18 live mechanic tests verified four fighters at lock, exactly one elite, captain-death clear with all three minions still alive, and three moving, harmless fleeing survivors. Lock/clear screenshots inspected; widened the captain HUD plate after the pixel review. All 26 world-elite gates and 1,628 creature spawns pass. Final npm run check exit 0, all 34 checks (14-check.log/exit). Tell marks regenerated by tools/tells.mjs.

**Timing acceptance remains partial:** latest available randomized samples opened 92/108 rooms; 36/108 met 15–35 seconds. Pilot/navigation and pacing gaps remain, so these numbers are not a claim that every six-hero room is tuned. The live mechanic test isolates release by forcing captain death; it is separate from the real-input combat timing lab. See ambush-acceptance-0919.json.

## Item 15 — design for review only

The progression design and save-migration plan is in progression-rework-plan.md. It proposes automatic stats, level-scaled skills bought from the shared coin wallet, per-hero ownership, two slots growing to four, grandfathered learned skills and a one-time 25-coin refund per legitimately earned talent point. Prices, slot levels and refund rate are review proposals. No progression runtime or save-migration code was implemented. This is documentation only; the unchanged code is covered by the final item-14 full check (exit 0, 34 checks). Daniel review is required before building, as requested.
## 16. Camera-stable interior textures
Implemented a room-local paint origin and clipping at authored room boundaries. This removes camera-driven colour/pattern changes in royal, chapel, forge, ship and other shared interiors. It does not yet claim the separate barn facade or level geometry requests are resolved.

Verified: regression test covers eight interior styles with identical drawing commands after camera translation; captured and inspected five game views; complete suite passes (35 checks), `outputs/16-check.log`, direct exit 0. Additional scope is tracked in `docs/additional-changes-0919.md`.
## 17. Highcrown expansion and Queen openings
Added 40 columns of furnace approach and 48 columns of captains' gallery, with hot plates, guards, decoration, checkpoints and three unstable chandeliers that warn before dropping. Increased Queen gallery supports from three to five. Pillars visibly rotate as they fall; dropping a gallery section never damages the player. The Queen accepts damage while dazed after a wall charge, and at low health gains a told three-projectile crown rain. Updated the lab to recognize that dazed opening.

Verified: live ward-versus-dazed damage comparison, new attack tell and three projectiles; collapse fixture verifies unchanged player health and Queen damage; room/attack screenshots inspected. Full 36-check suite passes, direct exit 0 (`outputs/17-check.log`). Six-hero Queen lab: 52.6/64.5/66/83/49.7/75.3 seconds, all kills, but below the 90–150 second target. Timing acceptance remains open.

## 18–19. Sea rules and a shared store theme

- The Deep consumes breath at half its previous rate. Hurricane waves now respect a successful guard or dodge without applying hit knockback.
- Tollmaster replaces the final-phase flood with a lamp blackout and an exposed attack window.
- Kraken tentacles have health bars, lose health alongside the boss and remain severed. With all arms gone he continues cargo and water attacks. Diving below the road shelters the hero from surface jets; jets flood above the road.
- Fixed zero-health defeat handling for reflected water, cargo and bell blows; all three final-blow paths passed the browser regression.
- All three shops share the original 40-second Warm Counter loop. WAV structure and browser decoding verified.
- Validation: 39 checks passed, direct exit 0 (`outputs/18-check.log` and `.exit`). Live sea mechanics: `outputs/18-sea/result.json`.
- Timing remains open. Pre-final-blow-fix boss lab: Kraken knight 144s, five timeouts (including the now-fixed zero-HP case); Tollmaster five kills 61.5–93.1s, Warden timeout at 12%. A passing harness exit is not acceptance.

## 20. Approved progression implementation

Replaced the talent-point screen with coin-purchased skills and per-hero loadouts. Two slots grow to three at level 8 and four at level 16; automatic growth preserves basic health, stamina and damage progression. All 181 old nodes have explicit destinations: 168 skills, eight growth effects and five baseline heavy attacks. Skills scale with level; keyboard, touch and controller support all four slots. Loadout changes require a safe location.

Save migration preserves a verified raw backup before writing, retains learned skills, and refunds 25 coins per legitimately earned talent point once. Corrupt or unsupported saves are protected from overwrite. Added save export/import with destination and source backups.

Verified: 41 checks passed, direct exit 0 (`outputs/20-check.log` and `.exit`). Regression fixtures cover all six heroes across six legacy versions, repeat migration, purchases, slot limits, backups, corrupt data and storage failures. Browser checks cover six heroes buying/equipping/casting skills, touch/controller/rebinding, combat restrictions and corrupt-save protection. Full text-fit audit passed. Campaign economy, co-op gameplay and final boss timing remain acceptance work.

## 21. Gallery drops, scenery joins and captain defeat

Three goblins now wait on supported Highcrown balconies, warn, and drop into the hall. Ambush captains must reach the normal defeat path to clear a room; accidental boundary escapes or despawns restore them at their authored footing. Fixed the waterfall lip so it meets its supplying stream, scales to the authored width and no longer draws a raised rectangular cap. Barn skins cover their foundation and climbable/breakable masonry without covering openings. Removed obsolete Sporewood sleep/storm instructions. Runtime footing fixtures now select levels by ID before campaign insertions.

Verified: 43 checks passed, direct exit 0 (`outputs/21-check.log` and `.exit`). Browser regression verifies all three warned drops; captain fixtures reject escape/despawn and accept a real defeat. Captured and inspected waterfall, barn loft and gallery views (`outputs/21-joins-live`).

## 22. A working climbing reward and new enraged Paladin attacks

Climbing spurs now grip ordinary stone and ice walls while holding toward them, instead of only stopping slides on specially marked climbing tiles. All six heroes held a plain stone wall and jumped away in the browser regression. The Paladin gains a low unblockable oath sweep (jump it) and three fixed unblockable radiance columns (move between them), both restricted to enrage and followed by a 1.6-second opening. Added ground/column warnings, poses and bestiary instructions; regenerated tell metadata with the approved tool.

Verified: forced both attacks in the live boss fight, including recovery openings; regression proves enrage gates, unblockable damage, jump/position counters. Full 45-check suite passed, direct exit 0 (`outputs/22-check.log` and `.exit`). Live attack receipt and captures: `outputs/22-paladin-live/result.json`. Final six-hero timing remains open.

## 23. Stormwreck Harbor and the Burial Caverns

Added two complete connecting stages. Stormwreck Harbor has broken quays, swim recovery nets, a customs hold and gallery, salvage cranes with high cargo, and a guarded inland exit. The Burial Caverns descend through candle paths, ossuary shelves, a sunken bridge with permanent recovery stairs/nets, and the sexton's guarded vault. Both have rewards, checkpoints, medals, their own original music, and named mini-boss encounters. The caverns use a new camera-stable ossuary wall style; harbor rain stops inside covered rooms.

Campaign now follows Causeway -> Harbor -> Waymeet -> Hexed Fields -> Burial Caverns -> Mage. Map stop indices are derived from actual node positions, and saved map locations use stable IDs with a legacy-index fallback.

Verified: every intended destination reachable in both levels, no trapped pockets, guardian gates hold the exits with each guardian reachable from the entrance. Live defeats open both gates and both exits finish their levels; music decodes at 48 and 53.33 seconds. Inspected four level views and both map connections. Full 47-check suite passed, direct exit 0 (`outputs/23-check.log` and `.exit`); live receipt `outputs/23-areas-live/result.json`. Final campaign economy and encounter timing remain open.

## 24 — The Deep and the Underwater Keep
- Split the authored castle from the trench, translating its water, air, gates, lights, architecture and king arena together. Deep retains all three tribute coffers; Keep has three new silver rewards and its own map node/music.
- Added the Diving Bell: original brass diving-bell crab art, claw/ballast/pressure/scuttle tells, positional counters, venting vulnerability and faster enraged charge.
- Added the Keep-only Bellguard with original diver art, a blockable hook, an unblockable knell and a recovery window.
- Preserve the Drowned King's swimming, pillars, anchor and air-pressure mechanics in the translated throne room.
- Targeted verification: both stages reachable; no embedded creatures, impossible pickups or traps; required Keep air leg 2.89 seconds, arena round trip 3.0 seconds; both boss defeats reach the win screen; original 60-second Keep music decodes.
- Added a Bellguard captain guarding the great hall. Its gate blocks the throne route, the captain can be reached with the gate shut, and the encounter activates while swimming.
- Full suite and final six-hero timing are separate acceptance gates; timing remains pending.

## 25 — Coastal cargo platforms and Waymeet activity
- Reef now places interior walls only inside the carrack and stern cabin, with separate open-water/coral/wreck tint bands and nautical decorations.
- Replaced Reef ledges and Reef/Long Water moving stone/log platforms with cargo decking and grounded timber hoists. Waymeet uses cloth-edged awnings and work platforms, with visible posts supporting raised ledges.
- Extended Waymeet house facades to their roof width, removed mismatched dressing and added two bottle-throwing patrons to the beer garden.
- Live captures: outputs/25-coast-live/result.json and eight views; no browser exceptions. Full suite recorded separately in outputs/25-check.log.
- This pass preserves required route geometry; remaining Waymeet stone-block cleanup is still tracked.

## 26 — Storm-battered ship routes
- Lowered four Flotilla and eight Hurricane swings toward their boarding decks and replaced their log surfaces with iron-bound cargo planks.
- Added three warned deck collapses into pirate-occupied holds, each with a rope escape; the falling deck itself does not damage the hero.
- Fixed Hurricane bulkhead cannons to preserve their authored target direction. The aft gun now fires left and opens its door.
- Live gameplay verified all three collapses and all three doors. Six captures and exact results: outputs/26-ship-live/result.json. Full suite: outputs/26-check.log.

## 27 — Ghosts and the drowned pirate road
- Added three original foes with their own art, attacks, tells, recovery windows, damage tables and bestiary entries: Lantern Shade, Bone Corsair and Tide Marauder.
- Lamplit now replaces its wights with ghosts/corsairs, excludes goblin archers, has additional dock debris, downward chain markers and full-height climb alternatives at four roof steps.
- Causeway wrecks have timber hulls and enclosed ship walls. The large hold stays flooded at low tide and contains skeleton pirates; added living pirates elsewhere on the road.
- Added the Tide Reaver miniboss and a gate that really holds the onward route until defeat. Its yellow harpoon is blockable; the red low rake is jumped.
- Corrected four signs/checkpoints whose support was a chain or hatch, including three affected by the previous ship pass.
- VM tests verify five attacks, defense marks and range counters. Geometry verifies gate closure, underwater hold and rope alternatives. Live checks verify every foe plus mini activation/defeat/opening; outputs/27-haunted-live/result.json and eight views. Full suite: outputs/27-check.log.


## 28 � Mage Tower and Falling Tower
- Replaced outdoor mountain dressing with masonry, arcane platforms, ribs and windows; removed mismatched campfires, garden objects and two non-boss floor vats.
- Pressure gates hold eight seconds and wait for either co-op player. The Archmage remains the final boss through all room phases.
- Added the collapsing Falling Tower sequel, four warned collapses and return routes, rewards/checkpoints, original music, and the Familiar as its miniboss.
- Full suite: outputs/28-check.log, exit 0, 55 checks. Focused live gates, phases, collapses, miniboss and exit: outputs/28-tower-live/result.json.

## 29 � Progression input and economy follow-up
- Death Knight short-release F casts the equipped skill; holding full blood triggers Blood Surge without also casting that skill. Verified independent co-op input.
- Audited affordability using half of placed coins and a 30-coin reserve per stage. Every hero can afford the cheapest available active loadout at the sampled milestones; Warden has only three authored active skills.
- Full suite: outputs/29-check.log, exit 0, 56 checks. See progression-followup-0919.md and progression-economy-0919.json.

## 30 � Waymeet final cleanup
- Removed eight redundant floating platform tiles, adjusted their coins, retained two refuges, and replaced four stepped bridge ornaments with lantern posts.
- Full suite: outputs/30-check.log, exit 0, 57 checks. Four visual captures inspected; all reward and exit routes remain reachable.

## 31 � Combat lab reliability (acceptance still open)
- Boss pilots recognize both new underwater encounters, seek air, traverse the Archmage flood platforms, and use the Flotilla's surviving rigging and cut-deck gaps.
- Ambush pilots leave shelves and choose clear landing positions instead of repeatedly bouncing on enemy heads.
- Added optional plunge-only and mixed-attack comparison modes; they use real inputs and stamina.
- Isolated boss/ambush simulation from animation and watchdog updates during asynchronous yields. A regression checks manual stepping, normal-loop resumption and cleanup after a thrown lab callback.
- Broad timing receipts before this isolation are exploratory; they cannot establish repeatable acceptance. Isolated matrices and the full suite are recorded separately in outputs/31-*. No combat balance target is marked complete on the strength of pilot-only changes.

- Isolated matrix: 119/144 boss kills, 54/144 in 90�150 seconds; 106/108 ambushes opened, 59/108 in 15�35 seconds. Strategy comparison: 24/24 kills, only 7/12 mixed cases keep plunge damage below other damage. Acceptance remains Partial. Full data: combat-acceptance-isolated-0919.json.
