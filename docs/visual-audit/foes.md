# Foes and bosses, every type (2026-09-28)

## What could and couldn't be measured this pass

`SPR`, the table that holds every foe's baked frames, is a module-private variable in `src/main.js` (not exported,
not on `window.BK`) — a read-only audit lane changes no game code, so it can't be exposed to pull exact per-pose
frame counts for all ~150 types without a code change. What this pass DID pull, live from the running game, and
what it reused from the two existing measured audits:

- **`BK.HAS_HURT`** (live, authoritative): the exact set of foe types with a dedicated hurt frame (the last frame of
  `SPR[t].R`, per `src/main.js` line ~5168/~24017). Everything not in it either has no hurt feedback beyond a flash,
  or is a boss/mini using phase-based feedback instead (bosses are excluded from the "missing" list below on
  purpose — a boss showing hurt through mode/phase changes is a different, legitimate convention, not a bug).
- **Camouflage / L* / colour count / outline** for all 133 foe sets met in the campaign: already measured and
  ranked in `docs/sprite-quality-audit.md` — this pass did not re-run that measurement, it reads it.
- **Grounding, hover, weapon-in-floor, shadow-tracking**: already measured per-foe in `audits/animation-audit.md`
  (2026-09-15, stale but not re-disproven this pass — spot-checked below).
- **Bestiary card captures** (`work/visual-audit/best/*.png`, 59 shots: all 25 `BOSS_T` bosses, 9 minis/late bosses
  not in `BOSS_T`, and 20 common foes spanning every arc) — this pass's own look at silhouette, palette fit and
  size, at the scale the card actually draws them (2-3x, similar order to in-world).

## Missing hurt poses (foes only, bosses excluded — see above)

Live from `BK.HAS_HURT` against every non-zero-threat foe in `src/threat.js`, minus effects/props/set-pieces
(courtier, minerlamp, timber, gas, ballast, krakenarm, etc. — not creatures). **124 foe/mini/boss tokens** come back
without a body hurt-frame; most of the boss-tier ones (frog, king, chief, queen, mother, gqueen, roc, owl,
windcaller, kraken, abbot, winchmaster, strawking, forgemaster, reefmaw, quarter, herald, lance, master) are the
expected exception (phase/mode feedback). **The common foes worth a look, because they're ALSO on the camouflage
list** (`sprite-quality-audit.md`) — hard to see AND no hurt flash to help the player confirm a hit:
**the bat** (Falling Tower), **the snuffer** (Lamplit Street), **the lamprey** (Underwater Keep), **the petrel**
(Drowned Causeway). These four compound: hard to see when idle, hard to confirm when hit. Two more borderline
camo cases, **the spider** (Stormhold) and **the urchin** (the Reef), are IN `HAS_HURT`, so at least they flash.

Other foes with no hurt pose, not camo-flagged, lower priority: spit, hopper, spitter, turtle, sapper, hound,
javelin, crow, lurker, spitcap, weaver, shaman, thief, troll, sailer, cutter, shardling, fledgling, suncatcher,
sentry, lookout, bosun, eel, siren, gull, wight, assassin, berserker, grandmother, netter, gill, heart, bearer,
kite, grub, miner, drone, tippler, sheargob, gaffer, merrowcaller, propman, clinger, prise, holdfast, hedgeknight,
runner, crossbow, zombie, bonegob, bonearcher, apprentice, husk, burieddead, undeadmage, puffer, jelly, manta,
vulture, sandgob, bandit, duneworm, whelp.

## Bestiary data-hygiene finds (not primarily visual, but they touch "does this creature read as what it is")

- **THE FACET (`golem`, the Undercrown/crag mini-boss line) has no bestiary entry at all** — not in `BEASTS`. Every
  other named boss has a card; this one is invisible in the menu that's supposed to be the game's own creature
  reference.
- **Nine real bosses/minis are filed under the FOES tab, not BOSSES**, because `BOSS_T` (`src/main.js` ~4317)
  wasn't updated when they shipped: `winchmaster`, `abbot`, `hedgewarden`, `gargoyle`, `homunculus`, `duneworm`,
  `sexton`, `gravewarden`, `harbormaster`, `deathknight`, `bloodknight`. Doesn't change their in-level art, but it's
  the kind of drift that makes "does this read as a boss" harder to audit from the menu — worth a five-minute fix
  outside this lane's scope (it's a data list, not art).
- No instance of an actual **wrong-icon / off-theme borrowed-sprite bug** (the class of bug the brief's "Geomancer-
  icons" example points at) was found on the sample captured this pass (59 bestiary cards + 35 level screens). Not
  a clean bill of health for all ~150 types — a full per-icon pass wasn't in this pass's time budget — but nothing
  in the sample stood out as visibly wrong-set.

## Size ladder and silhouette, spot-checked from the bestiary captures

Rule 9 (`art-direction.md`): hero ~16-18px, common foes 10-26px, elites a head taller, minis 32-48px, bosses 48-80px
and "not twice the hero's height does not read as a boss."

- **THE GOBLIN QUEEN and KING GORM UNDERLEAF** (the brief's flagged pair, "fatter Goblin Queen + King Gorm"): both
  captured (`best/boss-gqueen.png`, `best/boss-king.png`). At the card's own scale neither reads dramatically
  larger than a Shieldbearer or a Heavy would at the same scale — the Queen is crowned and robed (reads regal) but
  is not visually much wider than her own throne guard; King Gorm, seated, reads more "large goblin on a throne"
  than "three times the goblin" his own bestiary line claims ("Three times the goblin. Rides a litter that four
  bearers can barely lift"). The text promises a size the sprite doesn't deliver — this matches Daniel's ask
  directly: **both read under rule 9 for a top-tier boss.**
- **CAVE BAT**: genuinely close to invisible even in the bestiary's own dark-purple card background, let alone in
  the Falling Tower's murk — confirms `sprite-quality-audit.md`'s "genuinely hard to see" call.
- **THE WINCHMASTER**: reads as a small goblin figure on a plain drum-and-lever rig, not as the boss of a whole
  level — no size read at all versus a common miner. Matches `bar.md`'s Ore Road finding #3 (the shaft is a void,
  the boss isn't framed) and compounds it: even isolated on a card, he doesn't look like a boss.
- Common foes checked (sprig, archer, scorpion, vulture, sandgob, merrowspear, zombie, husk, apprentice, thief,
  goat, harpy, eel, wight): all read at a consistent, appropriately small scale with clear silhouettes on the
  bestiary's own backdrop — no further finding.

## Roster (by arc) — full list from `src/threat.js`, for reference

**Wood/marsh/stockade/sporewood:** sprig, shield, spit, hopper(+colours), sapper, bomb, brute, hound, fox, chief,
sporeling, lurker, drone, shaman, spitcap, weaver, thief, pike, folk, frog, queen, mother, greathound.
**Kingswood/crag/monastery/moor:** archer, thorn, watch, wight, lance, rockgoblin, golem, windcaller, roc, owl,
king, assassin, berserker, grandmother, goat, ramlord, dog.
**Highcrown/undercrown:** gqueen, throne, ram, shepherd, sheep, keeper, woodsman, ferryman, squire, elder, master,
king(seated/standing), miner, horn, sweep, propman, clinger, prince, courtier.
**Sea arc (Long Water/Reef/Flotilla/Hurricane/Lamplit/Deep/Keep/Causeway/Harbor):** eel, urchin, angler, siren,
crab, scout, tideguard, petrel, gull, sailer, snuffer, cutter, hearthgob, temperer, scalder, kraken, feeler,
reefmaw, quarter, captain, masthead, lampreeve, tollmaster, sailor, netter, gill, heart, bearer, kite, hare, grub,
merrowspear, merrowcaller, merrowbrute, drownedknight, drownedcaptain, prise, holdfast, bellcrab, bellguard,
drownedking, puffer, jelly, lamprey, manta, harbormaster, stormshaman, seawitch, tippler, sheargob, gaffer.
**Waymeet/fields/burial/mage/tower/witchlight:** swornsword, hedgeknight, runner, crossbow, closedhelm, familiar,
lanternshade, bonecorsair, tidemarauder, scarecrow, rook, farmhand, pumpkin, marshlight, haunt, boo, ploughman,
strawking, zombie, bonegob, bonearcher, apprentice, husk, corpse, bannerbearer, barrowrider, deathknight,
bloodknight, topiary, armour, piece, broom, mimic, imp, turret, tome, homunculus, archmage.
**Burning/unburied/desert:** hearthgob(reused), burieddead, undeadmage, hedgewarden, gargoyle, gravewarden,
sexton, scorpion, vulture, sandgob, bandit, cutthroat, slinger, ambusher, duneworm.
**Ore Road/Stormhold:** miner, rockgoblin(reused), heavy, sentry, lookout, bosun, cutlass, boarder, marine,
winchmaster, gobpriest, gobmage.

This roster is the full inventory; the entries flagged above (missing hurt pose + camouflage overlap, the two
undersized bosses, the two bestiary data gaps) are the ones worth spending art budget on. The rest read fine on
the sample checked.
