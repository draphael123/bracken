# claude/keyscore - KEYS-CORE (B14) + B13/B15 CHIP SWEEP (first four)

Base: claude/batch79 11c4b577. Opus lane, PORT 8736. Bots: human+dry via `BOT_PROFILE=human+dry` (NB: `--profile=human+dry` is silently
ignored - tools/boss-level.mjs profileOverride's regex `[w+]+` only matches the letters w and +; worth a one-line fix by whoever owns it).

## 1. KEYS-CORE (B14) - infrastructure only, no boss re-keyed
- `src/boss-read.js`: `KEYS` - plunge FROM ABOVE, rise FROM BELOW, sweep SWEEP LOW, behind FROM BEHIND, throw THROW IT, heavy HEAVY,
  riposte PARRY HIM, verb USE THE PLACE - each with colour, glyph, tags, teaching trial yard, how every hero makes it. `KEY_ROWS` (EMPTY:
  per-act lanes add `{ ph, key, word? }`), `keyOf`, `keyed`, `BR.takes`, `BR.turnedKey`, `BR.drawKey`, `drawKeyGlyph` + `glyphAt` (shared
  per-key visual: chevrons down / up, sweep line at the feet, arc round the back, target ring, crack seam, crossed blades, the place's ring),
  exported `behind`, `ROOM_TAGS` / `roomBlow` / `tagHas`. `BR.auto` names a keyed boss's key on a silent hit.
- `src/main.js`: `hurtEnemy` splits the TAG (every blow's name) from the BLOW (a hero's hand). The tag reaches all 28 boss/mini hooks in
  hurtEnemy0 + wardedDamage. `BR.takes` is asked once before the per-boss ladder (marks `e.keyHit`, or turns + NAMES the key) and the key
  glyph is drawn over a keyed boss - both no-ops until a KEY_ROWS row exists.
- New tags: `'throw'` (a thrown carry - bucket/stone/pot - and the Underwell's thrown torch), `'reflect'` (a seed sent back onto a foe),
  `'riposte'` (`[verb, 'riposte']` on a swing out of a parry; verb first, so elite-kit / family readers are unchanged). Throw and reflect stay
  the ROOM's blow (never chipped, greed or turned) exactly as before.
- THE PYRO BUG: `pl = plunge || blowHas(tag, 'plunge')` gates the Bullfrog's head, the Scarecrow King's lantern, the Colossus x2.4, the Kraken
  arms and the Roc's thermal plunge. The Drowned King's swim-plunge PENALTY stays on the body boolean (exempt, named in the check).
  Audit corrections: the Gargoyle's stomp is body geometry (stompOn) - the pyro was never excluded; the Colossus already read `blow === 'plunge'`.
- Checks (both in tools/check.mjs): `tools/blow-tags.mjs` (node) - every boss hook gets `tag` (hooks found by pattern; non-boss exemptions
  named), no boss gates on the bare plunge boolean, the tags exist where struck, the 8-key table / takes / turnedKey / drawKey, nobody keyed,
  and the B13/B15 wall. `tools/firedrop-plunge.mjs` (page) - a firedrop as struck ablazes the Scarecrow King and counts on the Bullfrog's head:
  FAILS on batch79 (strawDrop idle, frogDrop 0), passes here.

### Re-measure, pyro on the bosses whose plunge gate now admits her (human+dry, campaign level, 10 seeds)
| boss | batch79 | keyscore |
|---|---|---|
| Bullfrog (marsh L3) | 8/10 | 8/10 |
| Scarecrow King (fields L25) | 10/10 | 10/10 |
| Roc (skyroad L10) | 6/10 | 6/10 |
| Glass Colossus (glasssea L34) | 8/10 | 8/10 |
Rows byte-identical: the human bot never firedrops onto those gates, so the rates do not move; the page proof shows a player now can.
(Scarecrow King pyro 10/10 dry is above band on batch79 already.)

## 2. B13 + B15 - THE FOUR WAITING ROOMS -> THE DUELIST'S WALL
`src/boss-read.js` GUARD `'wall'` + `ANGLE.front 0.4 / ANGLE.wall 1`; the four are on `FULL_DAMAGE` (off the x0.05 chip, greed still counted
outside OPEN_RULE). A hero's blow from the FRONT at his height outside his opening takes 0.4 with a told clank + GO ROUND (+ a hint the first 3
times); from BEHIND, or from ABOVE (a plunge, or the hero in the air with his feet over the duelist's waist) it lands whole; his openings pay
1.5-2x (Lance committed x1.5 / stuck x1.6, Paladin ward broken x2, Captain beached x2 / reel x1.5, Quartermaster blade in a rope x1.5).
Gone: HIS PLATE TURNS IT, the Paladin's flat ward NO (his sword met on the beat still breaks it), THE SEA HAS HIM (the Captain riding his wave),
HER GUARD HOLDS (the Quartermaster's 16 s deck guard; a cannon still breaks it whole). The Quartermaster DROPS her wall to commit (slash and
pistol, tell + blow: whole from any side - the time given back to attacks) and still answers a cut into EN GARDE.
Boss bot (v2 only): a roll hero goes OVER the wall (jump, cut once above his waist); a shield hero keeps his guard and cuts into it.
Bestiary text updated for the Lance / Captain / Quartermaster (the Paladin's left alone: same line as the CRUSADER rename).
Tests: tools/boss-greed.mjs - the four added to its named DUELISTS list (its comment: a new name is a design call -> Daniel's B13/B15), and
its hurricane sample now asserts the wall exactly (a blow of 40 takes 16, 20x20 takes 160, the burn lands) instead of the retired twentieth.

| boss (L) | HP | batch79 (6 seeds) | after, n=24 | K / W / P | fight s |
|---|---|---|---|---|---|
| Queen's Lance (storm L11) | 305 -> 800 | 14/18 78% | 13/24 54% | 2/8 5/8 6/8 | 23-81 |
| Waymeet Paladin (waymeet L21) | 2150 -> 2800 | 12/18 67% | 14/24 58% | 2/8 4/8 8/8 | 50-127 |
| Salvage Captain (hurricane L16) | 860 -> 1700 | 13/18 72% | 14/24 58% | 5/8 5/8 4/8 | 48-118 |
| Quartermaster (flotilla L15) | 920 -> 1150 | 14/18 78% | 13/24 54% | 6/8 4/8 3/8 | 38-84 |
Mash: 0/6 on all four, boss rows re-stamped (re-stamped boss rows only: `node tools/mash-bot.mjs storm,waymeet,hurricane,flotilla --arena-only --write`).
Noise at n=6-8 is +-20% (the Lance read 71% at 750 and 46% / knight 0/8 at 850 before 54% at 800). Round or over the wall is still GREED outside his openings (a masher who walked through the Lance to his back beat him 2/6 until it was); the Lance's openings are what he is LEFT in (stuck, reel, stumble, recover, empty hands) - his thrust/sweep/guard swing are wall like any other moment.

## 3. STILL ON x0.05 (GREED.chip) after this lane - for tonight's chip sweep (B15)
Openings = OPEN_RULE in src/boss-greed.js (+ the boss's own multiplier); "own 0" = his own code ALSO returns nothing outside it (B15 hits).
| boss / mini | level | openings today | also fully turned by his own code? |
|---|---|---|---|
| frog (Bullfrog King) | marsh | dazed / croaking / in the mud (x2 throat) | hide halves (0.5) before the chip |
| chief (Goblin Chieftain) | stockade | club planted (x2); GUARD front: behind x0.5 | front chipped |
| king (King Gorm) | kings | held in a cage (x2) / e.open | own 0: crown turns every blade (B15's named exception is the cage move only) |
| ram (Ram Lord) | scree | into the wall / off his leap (H.ramOpen) | own 0 from the front (horns, swing pass) |
| owl (Owl Reeve) | hanging | crash / grounded (x1.3) / pinned (x1.6), lamp x2 | - |
| abbot (False Abbot) | spire | the bell has him down (abbotOpen) | blessed = 1/5 |
| windcaller | moor | FALLEN (bolt sent back / howl braced) | own 0 between stones (NOT THERE) |
| gqueen (Goblin Queen) | crown | pinned (pillar/chandelier) / plate off; P2 back while pointing cracks plate | own 0: WARDED return outside a pin |
| reefmaw | reef | stuck / reel / beached (x2) | own 0 lurking/sinking/draining (ITS HIDE TURNS IT) |
| tollmaster | lamplit | ledger turned on a shield (x2) | bier x0.7 |
| bellcrab (Diving Bell) | deep | stone on his crown (e.open, BELL.openMul) / phase 3 | shutMul |
| drownedking | keep | e.open (x1.35) | swim-plunge x0.5 |
| harbormaster (Breakwater Warden) | harbor | e.open (x1.3) | - |
| prince (Buried Prince) | undercrown | buried / reel / bareheaded | princeHurt null = 0 in places |
| strawking (Scarecrow King) | fields | e.open (pole / vines / lantern ablaze x2.2) | straw x0.45; own 0 rebuilding |
| burieddead | burial | gas vent lit under him (x1.3) | own 0 burrowed |
| archmage | mage | strike what glows (x2) | own 0 through the runes |
| undeadmage (Undead Archmage) | fallingtower | mageOpen (ring dodged, mark returned...) | own 0 blinking/waking/realm ward |
| gargoyle (Gate Gargoyle) | witchlight | stunned on the spikes - only the STOMP lands | own 0: STONE except the stomp |
| winchmaster | oreroad | jammed drum (x2) | iron x0.5 while the drum runs |
| gorgecrab (Great Red Crab) | redgorge | on his back (mode open, x1.6) | shell |
| grandmother | underleaf | rap after a silent listen / feel turned on a shield | own 0 vanished |
| djinn | welltown | mud / doused / bailed (x2.5), his slammed hand | blade passes through sand otherwise |
| herald (Tide Herald) | longwater | mired (x1.5) / reel | chipBy 0.2, plate 0.35 |
| pyromancer | burning | overheated (x1.5), thrown bucket | chipBy 0.25; third light blow turned |
| cisternqueen | underwell | soaked / on her back / rearing / stinger / scorched (x2.2) | chipBy 0.5 |
| MINI homunculus | mage | bare (e.open) | own 0 hidden in smoke; jar x0.3 |
| MINI lancer (Serjeant) | waymeet | unhorsed / reared on a shield / swipe or cut answered (3 s) | barding x0.6 |
| MINI greathound | kings | lunge taken on a shield / pups killed (3 s) | - |
| MINI bosun | harbor | belaying pin parried (3 s) | plate family |
| MINI hedgewarden | witchlight | move answered / sword stuck (3 s) | stump regrows |
(queen: chipBy 1 = not chipped - her swarm rule 0.45. Off the chip already: FULL_DAMAGE bloodknight, matriarch, roc, hawkmistress + the four
above; OWN_WARD duneworm, wickerqueen, puppeteer, lanterneater, colossus - their own wards may still be a twentieth (B15: check them too);
NO_OPENING mother, kraken; full-damage minis lampreeve, ploughman, gravewarden, forgemaster, golem (own 0: STONE), barrowrider, sexton, gangleader.)

## Checks run
node: syntax, comments, boss-read, blow-tags. page (PORT 8736): boss-greed, firedrop-plunge, throwables, pyro-duel, firsthour, underwell,
paladin-enrage, salvage-captain, lance-support, rule-openings, boss-openings, boss-navigation, boss-fight-end, lab-reach, weak-bosses,
mash-gate, textfit (scoped), verb-matrix - all green. elites: ksar FAIL - pre-existing on batch79 (same on 11c4b577). Not the full suite.

## QUESTIONS FOR DANIEL
1. PER-HERO SKEW on the walls: the pyro leads (Paladin 8/8 - 6/6 on batch79 too; her airborne embers count as "from above"), the knight trails
   on the Paladin (2/8). Rec: per-act lanes give the shield a wall answer (a perfect guard into the wall = a short opening). Built: one HP each.
2. "ABOVE" = a plunge or the hero airborne with feet over the duelist's waist (the Hawk-Mistress uses any jump 10 px up). Rec: keep. Built.
3. The Quartermaster's 16 s deck guard is no longer a melee wall of nothing (0.4 front, whole round/over); the cannon still breaks it whole. Rec: keep. Built.
4. KEYS.riposte also takes 'reflect' (any swing sends an owned seed back) so the warden and pyro have the key. Rec: keep; or give the Ember
   FLARE a riposteT. Built: reflect.
5. Fight length: the Lance still runs 23-81 s (base 15-63 s), under 90-150 s. Rec: more moves per phase in his act lane, not more HP.
