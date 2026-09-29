# claude/undead3 - THE UNDEAD ARCHMAGE: spell realms and a harder spiral stair

Branch `claude/undead3`, based on `claude/batch44` (ed4b0e7: master + firsthour + halved checkpoints + death cost), origin/master merged in at the end.
Daniel's playtest, 2026-09-29: "needs more portals than just desert; fire/ice/poison portals as his spells; more mechanics; the chase more
difficult, boss music, he blocks sections until you hit him with fire walls".

## What changed

### A. The fight: spell realms by phase (src/mage-realms.js, new)
- At **75%, 50% and 25%** of his health he **tears a portal** (a new told move, `realmTell`, 1.2 s: a great ring of the realm's colour opens by him
  and flares, and the screen says which realm) and pulls you through it, carpet and all. Each realm is used once, in order: FIRE, ICE, POISON.
- A realm is a short room, 420 px wide, the whole of it on the zoomed screen; it is drawn as its own place (walls, ceiling, weather), not a tint.
- In a realm **his ward holds**: a blow does nothing ("HIS REALM WARDS HIM: FIND ITS OPENING") until you find the realm's **one opening**; then he
  is open for 3 s at double damage, and when that runs out the realm tears and you are back in his hall. A realm can take him no lower than the
  next realm's mark, so each realm is always fought. After a realm he has 6 s in his hall before the next can be torn.
- **FIRE - the burning floor.** The floor is seven tiles that burn in a pattern: the columns shimmer and the tiles glow (1.0 s), then stand up as
  pillars of fire floor to ceiling. He rolls a **fire wall** (`wallTell`, `!!`): going out it follows your height slowly (get over or under it);
  it hits the far wall and ROLLS BACK hunting your height, and breaks on the first body it meets. **Opening:** dodge through it on its way back
  (or get past him so he is between you and it) and it runs on into him - SCORCHED. Taken, it breaks on you and opens nothing.
- **ICE - the frozen hall.** The cold takes the carpet's grip (it slides: carpet.js `grip`, 0.3). Icicles hang the length of the ceiling; the one
  over you CRACKS (0.9 s: it shakes and a line of frost runs down to the floor) and falls. He hangs low in a shell of ice, drifting from icicle to
  icicle, throwing his ice lances. **Opening:** strike an icicle over him and it falls on his shell - SHATTERED. Struck anywhere else it opens nothing
  (and an icicle you struck never hurts you).
- **POISON - the mire.** The floor is a mire that rises while you are in the realm; it warns, then bites, poisons and throws you up. He hangs over
  its VENT, fed by a green beam, throwing spore clouds (`sporeTell`, `!!`: three rings on the air where they will bloom) and firebolts.
  **Opening:** casting the spores cuts the beam (the vent bubbles gold); strike the vent then and it bursts up the beam into him - VENTED, and the
  mire drains. Struck while he feeds, "THE MIRE FEEDS HIM: IT HOLDS".
- Everything else about him is as it was: his 600 health (never more), his hall's rotation, rings, death mark, enrage. He dies -> the desert door
  opens as before. The Playtest jump (`?boss=undeadmage`) still stands you at his carpet.
- Marks (src/marks.js BY_HAND, table rewritten by `node tools/tells.mjs --write`): `realmTell` '' (throws nothing), `wallTell` '!!', `sporeTell` '!!';
  the realm's `fireTell`/`iceTell` are his fight's own '!'.

### B. The chase (src/spiral-chase.js)
- **Boss music from the first step**: his fight's track (`boss4`) comes up the moment you are through his ring at the stair's foot, stays on a
  retry on the stair, and runs straight on into the fight without the usual stop-and-restart (bossStart leaves it running for him only).
  (audio.js gained a read-only `music.want`.)
- **Checkpoints 2 -> 1**: the one at the top is gone; the middle landing's stays. Boarding the carpet still sets the door checkpoint (five tiles back
  from the carpet), as before. src/checkpoint-thin.js's pin for it is removed.
- **Faster, denser spells**: 0.6 s between spells (was 1.0), a new landing settles in 0.35 s (was 0.5), and from the third flight his firebolt comes
  in a pair. Every tell is still his fight's full tell and only on the screen.
- **Three sealed sections** (flights 1, 4 and 6): a column of his green light 8 rows tall stands on the landing's near end; he stops above it and
  casts. Only a **fire wall** breaks it: strike the flight's **brazier** and its fire rolls up the stair along the steps, climbs the ward and burns
  him - the ward goes, he reels and flees on up the stair. Waiting does nothing; a blow on him does nothing; the brazier's fire hurts only him.
  The FIRST seal is taught: a sign on the flight ("HIS WARD BARS THE STAIR. STRIKE THE BRAZIER...") and the brazier ringed and marked. Seal 2 (THE
  STONES) has its brazier on a two-tile foothold under his ice and fire; seal 3 (THE LAST STAIR) on the failing step, so you strike and get off.
  A death wakes you on the middle landing with the ward under you already burnt and the ones over you standing. The wards are real stone in the
  grid (a `ward` ent tells the reach fill a blow opens it, like a bell's bridge - src/reachcore.js).

## Numbers
- Bot pilots, knight / warden / pyro, salt 1, REFILL health, 150 s cap (tools/archmage-pilot.mjs):
  - BEFORE: knight win 57.9 s, warden timeout (16% left), pyro win 113.4 s - 2/3 wins.
  - AFTER: knight timeout (29% left), warden timeout (48% left), pyro timeout (42% left) - 0/3. The bot knows nothing of the realms: it cannot find
    an opening except by accident (all three got through the fire realm that way, none further), and it stands in the hazards (knight took 495 damage, 417 of it in realms,
    refilled). This measures the bot, not a hand; the openings are proved to work in tools/undead-realms.mjs with the game's own swing and dodge.
- The climb with the game's own jump and a brazier strike at each seal: 28 s from foot to carpet (tools/tower-chase.mjs).

## Checks
- New: **undead-realms** (in tools/check.mjs). **tower-chase** extended (music from the first step, one checkpoint, three wards that the fill cannot
  pass each alone, only the brazier's fire breaks them, he waits over a ward, faster spells and the pair, respawn state).
  Both were RED on the base (ed4b0e7): tower-chase on "ONE checkpoint on the stair", undead-realms on the missing module.
- Green on this branch: tower-chase, undead-realms, tells, boss-fight-end, boss-openings, boss-jump, checkpoint-gaps, checkpoints, death-cost,
  architecture, skins, dangling-paths, slopes-trace (unchanged for every level, no rebase), npc-removal, undead-foes, tower-ascent, tower-collapse,
  tower-cutouts, tower-flyers, tower-hall, archmage-rings, archmage-room.
- Fixtures changed (not weakened): tools/archmage-rings.mjs and tools/tower-ascent.mjs test his HALL kit at low health, so their rigs now say his
  three realms were had (`realmN: 3`) - under 75% he would tear a realm first; archmage-rings' source check reads `mageOpen(e)` (breached,
  gathering, or a realm's opening) instead of the two mode names.
- **untold-told** fails on the crow (stockade) - a flake that is on the base too (base ed4b0e7: 1 pass, 1 fail with the same untold crow hits in two
  runs; this branch: 1 fail, 1 pass). Nothing of this lane touches the crow.

## UNVERIFIED
- No hands on it: the realms' feel (fire wall speed 120 px/s, the icicle cadence 1.7 s, the mire's rise 5 px/s, the slick carpet) is tuned on
  paper and by the Node rigs only. Pictures: `node tools/realm-shots.mjs <dir>` renders the first seal, the fire going up the stair, each tear and
  each realm's hazard.
- Co-op on the carpet in a realm was not tried.
- The Boss Rush and the Level Editor are parked and untouched; the realms would come with him if he were ever rushed.

## QUESTIONS FOR DANIEL (built the recommendation in each case)
1. **Carpet or on foot in the realms?** Built: the realms are fought on the carpet (the fight's own flight; "slick floor" became a slick carpet,
   "stay above the rising mire" is flying above it). Recommendation: keep the carpet - the alternative is three walkable arenas and a second
   movement mode inside one fight.
2. **Is he warded in the whole realm?** Built: yes - no damage until the opening, so the opening IS the realm. Alternative: normal damage in a realm,
   the opening only doubles it and ends the realm.
3. **The fire wall's opening**: built as "dodge through it on its way back (or put him between you and it)". Recommendation: keep; the pure
   "lure him into its path" version was automatic in testing because he always keeps your height.
4. **The brazier's fire on the stair is harmless to you.** Recommendation: keep (it is your fire). Alternative: it burns you too, so you strike and
   jump it.
5. **Seal difficulty**: seals 2 and 3 are "tested" only by where the brazier stands (a two-tile stone under his fire; the failing step). Want more
   (a brazier he douses, or one down behind you)?
6. **The bot pilot** cannot play the realms. Worth teaching bossLab the three openings so pilots stay a tuning tool for him? (Recommend yes, small.)

# undead4 (follow-up round, same branch)

Daniel decided 2026-09-29: KEEP realms on the carpet, fully warded until the opening, the fire opening as built. CHANGE 1-3 below.

## What changed
- **CHANGE 1 - the brazier's fire burns the hero too** (src/spiral-chase.js `SEAL`). Struck, a brazier FLARES for 0.8 s (the tell: it
  blazes up), then its wall rolls up the stair. Where it passes you it burns you once, 12 damage, no shield turns it. It stands 34 px, under
  every hero's jump: feet above its top as it goes by and it misses. It still climbs the ward, breaks it and burns him. It climbs the ward's
  own face (its middle), so nobody standing at the ward is caught by the climb.
- **CHANGE 2 - seal 3 (THE LAST STAIR)**. Come within 56 px of its brazier and he SNUFFS it: a told `snuffTell` (0.9 s, a thread of his green
  light from his hand to the bowl, "HE REACHES FOR THE BRAZIER"; no mark - it is no blow at you), once, from wherever he is and whatever he was
  casting. The dark bowl smokes and will not light. A SECOND brazier stands behind you on the flight (x98, on the step before the failing one);
  its fire carries up the stair past the dark one to the ward. Seal 2 is unchanged (placement only).
- **CHANGE 3 - the bot pilot learns the realms and the stair** (src/lab.js). On the carpet, in a realm it no longer closes on him (he is
  warded): FIRE - it keeps to dark tiles, gets over or under the wall going out and DODGES THROUGH it coming back; ICE - it sidesteps cracked
  icicles and waits under the ceiling at the icicle over his shell, then swings; POISON - it stays over the mire and out of the spore rings, and
  while the beam is cut goes down to the vent and swings. A new stair bot, `chaseClimb`, knows the flights as a list: it jumps off the very lip
  for the next step, strikes each seal's brazier, jumps its fire, goes back to the second brazier when the first is snuffed, waits at a
  standing ward, and recovers from a fall. tools/tower-chase.mjs and tools/archmage-pilot.mjs both use it (the pilot now climbs the stair per
  hero after the fights; STAIR=0 skips it).

## Checks
- tower-chase extended: in Node the brazier's fire burns you once, unblockable, only after its flare, and a jump clears it; only the third seal
  has a second brazier, standing behind the first where you stand; he snuffs the first as you come at it, told for its whole 0.9 s, once, and it
  will not light; the second lights and its fire carries past the dark one and breaks the ward. In the page, the stair bot climbs past all three
  seals and he snuffs the last one on the way; and EVERY HERO (knight, warden, pyro, paladin, pirate, reaper, geomancer), no god mode, climbs to
  the carpet past all three seals. RED on the previous commit (c725e87): "standing in its road, the brazier's fire does not burn you".
- Green: tower-chase, undead-realms, tells, boss-fight-end, boss-openings, checkpoint-gaps, checkpoints, death-cost, architecture, skins,
  dangling-paths, slopes-trace (unchanged), npc-removal, undead-foes, tower-ascent, tower-collapse, tower-cutouts, tower-flyers, tower-hall,
  archmage-rings, archmage-room, untold-told (the crow passed this run).

## Numbers (bot pilots, salt 1, REFILL, 150 s cap; not tuned)
- The fight: knight WIN 90.4 s (all three realm openings: scorched, shattered, vented), warden timeout 19% left (fire and ice openings, not the
  vent in time), pyro WIN 93.9 s (all three). Round undead3's realm-blind bot: 0/3 (29 / 48 / 42% left); before the realms: 2/3 (57.9 s, warden
  16% left, 113.4 s).
- The stair (no god mode, health held up): knight 78 s / 48 hp taken / burnt 3 times, warden 78 s / 48 / 3, pyro 68 s / 48 / 3; all three at
  the top with all three wards burnt and the last brazier snuffed. In tower-chase's all-hero run: paladin 91 s / 35 / 1, pirate 80 s / 32 / 2,
  reaper 54 s / 0 / 0, geomancer 91 s / 67 / 3. The bot is caught by the fire more than a hand should be (its jump over the wall is timed off a
  fixed distance); the Node rig proves a jump clears it.

## UNVERIFIED
- No hands on it. The paladin's 3-tile stair gaps are within reach only from the very lip (measured: from a standing start on a 2-tile stone
  every hero lands, the paladin 0.2 tiles from the far edge of the next) - this is the stair as it was built, not this round's change.

## QUESTIONS FOR DANIEL
1. The brazier's fire: 12 damage and a 0.8 s flare. Recommendation: keep; if it reads as unfair in hand, lengthen the flare, not lower the
   damage.
2. His snuff is once per life on the stair (a death resets it with the stair). Keep, or once ever?
3. The paladin clears the stair's 3-tile gaps by a hair (pre-existing). Widen nothing now; flag if it bites in hand?
