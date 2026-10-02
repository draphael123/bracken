# claude/welltown - THE WELL TOWN, the greybox (desert arc level 2) and THE BANDIT KING wired

A GREYBOX for review (next: the reviewer against THE MAGE'S FOLLY). Nothing ships without Daniel. Concept: `docs/concepts/the-well-town.md`
(the old brief `docs/briefs/well-town.md` overridden by the 2026-10-01 desert-arc concept).

## What changed
- **The level** `src/well-town.js` (522 x 44), appended to LEVELS as `{ id: 'welltown', name: 'THE WELL TOWN', needs: 'caravan' }`; map node after the
  caravan (206,146, where `docs/briefs/map-redesign.md` 4.1 puts it). `?level=welltown` works. Seven sections: the caravan gate, the lower market and
  the covered bazaar, the well square, the cisterns, the mud quarter and the dovecote, the bandits' roost, the Kasbah.
- **The rule, the skin** (`src/well-town-hands.js`): E at a well fills (3 sips), E facing mud or fire pours (mud walls open; fires are burning
  barricades, solid until poured), E with nothing to pour on and the sun on you drinks (sunstroke cured). The HUD shows the sips under the sun meter.
  Poured walls/fires stay open after a death; unpoured fires stay lit (they are part of grid0; opened cells go in `destroyed`).
  REQUIRED: 3 mud walls + 2 fires each alone shut the courtyard (`tools/welltown.mjs` proves each); 2 optional ones teach (the gate house door, the
  bazaar stall fire - or climb over the roof past its bowmen).
- **The set piece: THE GREAT WELL's windlass.** The street is down (rubble); a blow on the windlass sends the bucket (a lift that moves only on a
  windlass) down the well into the cisterns, a blow on the bottom one brings it up. The bucket left at the top plugs the well's mouth.
- **Climbing**: the bazaar posts, THE DOVECOTE (the only way up to the roofs), the roost's alley ladders, the dry cistern's ladder.
- **The themed key**: four WATER-SKINS (quest counter on the HUD), poured into THE DRY CISTERN under the Kasbah street (E) -> its VAULT opens:
  relic THE WELL-KEEPER'S GOURD (a 4th sip) + the third silver. Hint lines say what the cistern wants.
- **Foes**: reused cutthroats and scorpions; THE BANDIT BOWMAN = the archer AI reskinned (`bandit: true`, man-height, sees 150 px down off a roof);
  THE WATER-THIEF = the ONE new kind (cutthroat AI reskinned: his landed cut takes a sip and he runs; cut him down and it comes back); elite THE OLD
  STINGER holds the cisterns' gate. 20 designed squads, nothing sprinkled. Roles melee/ranged/runner.
- **The shop**: the market checkpoint is THE MARKET SHRINE (lit = a shop, per onestore's mayBuy) and THE WELL STORE (`shopWell`, a walk-in room,
  `SHOP_START.shopWell = 'weapons'`) is the desert map's store node after the town (`needs: 'caravan'`). `tools/store.mjs` now walks four keepers.
- **THE BANDIT KING** (`src/bandit-king.js` + `src/bandit-king-hands.js`, staged by `stageBanditKing` in the Kasbah courtyard, 474-513): the desert
  engine's BANDIT_KING (sweep !, knives !, oil jar X, charge X) run in his courtyard's coordinates. OPENING = pour on him while he burns (he walks
  through his own fire): 3.0 s at x2.6, the steam douses the fire under him; a dry pour runs off; **x0.05 chip otherwise** - implemented LOCALLY
  (COMBAT3's global chip rule is not on master). He always fights; EVERY CYCLE CHANGES (3 chain orders a phase); phase 2: two jars at once and two
  lieutenants (cutthroats) take the courtyard well. Touch rule: no body damage. The courtyard is shade. `BANDIT_KING` itself is untouched
  (`tools/desert-bosses.mjs` unchanged and green); his in-game charge box is lower (28 px).
- **Music**: level plays `'caravan'` as a PLACEHOLDER (TODO, report-only in level-quality); boss room plays a placeholder synth hook
  `'banditking'` (`src/boss-music.js`, TODO). Nothing downloaded.
- Tools: `tools/welltown.mjs` (the level's own Node check, in check.mjs), `tools/welltown-probe.mjs` (in-page smoke, 13 asserts),
  `tools/welltown-route.mjs` (route pilot with real keys), `tools/welltown-pilot.mjs` (boss human-bot pilot); lab.js has his bot branch;
  boss-openings asserts his opening; level-quality GATEs welltown (+ROLES runner waterthief, REPORT_ONLY music); one-new-foe pins `waterthief`;
  slopes-trace traces welltown (its own baseline via `--rebase=welltown`; the other five unchanged); dressing kits; marks/answer rows; THREAT rows.
- Map: the caravan node moved 4 px up (248,158 -> 248,154) so the road through it clears map-grammar's 24 px margin.

## Numbers
- level-quality welltown: CLEARS (flat 0%/27%, 7 bands / 50%, 6 gadget kinds 3 developed, 4 secrets, 4 checkpoints one per 128 route tiles,
  density 1.11 encounters/screen, 16% empty screens, ranged 9 bowmen, roles 3, route 24 rows + 8 pockets; music WARN = placeholder).
- Level-1 pilot (knight, 3 runs): 81 blows, 3 deaths, 75 lifts. Mash bot: boss holds 0/6 (knight, warden, pyro); level mode: knight and
  warden die, pyro drops to 6%.
- Human-bot pilot, 21 fights at normal health: **15/21 = 71%** (knight 7/7, warden 3/7, pyro 5/7), median win 74.5 s. History: x1.6 -> 0/6;
  x2.4 -> 12/21; charge lowered + jar dodge -> 15/21.
- Route pilot (real keys, god): knight, warden and pyro walk start -> courtyard (~240-290 s). Without god the scripted hand (no block, no drink)
  reaches the roofs at 6-37 hp and dies on the roost.

## Checks (all green, run by name)
draft-level well-town, desert-bosses, level-quality, architecture, checkpoints, checkpoint-gaps (welltown worst gap 198), skins, dangling-paths,
slopes-trace, npc-removal, hint-shown, audio-assets, tells, answer-tags, boss-openings, boss-fight-end, boss-navigation, elites, one-new-foe,
sprinkle-cap, floaters, dressing, pixels, signs, caravan, store, shop-gates, boss-music, map-grammar, additional-areas, welltown, welltown-probe.

## UNVERIFIED
- Not played by hand; no screenshots taken. All art is placeholder (procedural wells/mud/fire, recoloured cutthroat, a baked king).
- The warden is the weakest hero vs. the King (3/7) and the knight the strongest (7/7: his shield takes knives and sweep).
- Level difficulty for a human: the square and the mud-quarter lane hit a level-1 knight hard (tier 2.45, like the caravan's 2.4).
- The thief flee freezes when >420 px away (the engine's far-foe rule): a thief that got away holds your sip until you chase him into range.
- Coop: INTERACT is wired for player 1 only. The full suite was not run (by the lane rules).

## QUESTIONS FOR DANIEL (rec built by default)
1. Music: pick the level's CC0/CC-BY track (one batch) and should the King keep a synth theme? REC: a desert track for the town; compose a synth
   theme for him from the hook. Built: caravan placeholder + hook.
2. Water-thief: steal on any landed cut (built) or only when you are not blocking? REC: as built (a block already stops the cut).
3. The King's courtyard is shade (built) - or keep the sun on so drinking competes with pouring in the fight? REC: shade (the sun killed the bot in 17 s).
4. Phase 2 trough fire (brief: "the fire spreads along the troughs' oil") is NOT built (two jars + lieutenants instead). REC: add it in the fixes lane only if the review asks for more phase-2 change.
5. Market shrine as the shop (built) plus THE WELL STORE map node - keep both? REC: yes.
6. Tier 2.45 (just over the caravan's 2.4) - REC keep; ease the square encounter in the review if Daniel finds it too hard.
7. The caravan's map node moved 4 px for the margin rule - OK? REC: yes.
