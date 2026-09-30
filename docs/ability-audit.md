# BRACKEN ability audit: do the skills fit the hero who owns them?

Scope: all 196 catalog skills (52 actives, 144 passives) across the seven heroes, plus each hero's innate C / F / G / duck kit. Read-only audit; no game code was changed.

## 0. Status (icons lane, claude/icons)

Fixed in code, guarded by `tools/skill-icons.mjs` (in `npm run check`):

| # | Item | What was done |
|---|---|---|
| 1 | Passive icons | New table `src/skill-glyphs.js`, one row per hero and passive id (144 rows, keyed by hero so the five `sunder`s differ). `talIcon`/`TAL_KIND` read it first; the old regexes only serve growth nodes and old tree ids, and the cross-hero ones (`rum`, `second`, `hook`) are gone. The Geomancer's ten each wear a different glyph (seven new ones drawn in her stone, moss and amber: pillar, slab, fall, stones, shards, rune, wave). RUMBLE is a rune, SECOND BARREL the shot glyph, CUTTHROAT a blade, TURNCOAT the reflect glyph, LONG REACH and THE SECOND VOLLEY the sword glyph (item 17's icon half; the ids are not renamed). |
| 2 | Borrowed active icons | Eight new pixel icons in `MORE_ICONS`: SKEWER, SET THE SPEARS, HARRIER, BLOOD BOIL, GRAVECALL, BROADSIDE, THE BLACK SPOT, KEELHAUL. `SKILL_KIN` is deleted. All 52 actives now have distinct pixels and none falls to the flame default. |
| 3 | HOLY CHARGE | Now "lower the maul and charge." |
| 4 | Hero cards | Freebooter: tap C = parry, hold C = hook, rum is a bought skill. Death Knight: F = summon skeleton (Gravelord tree), G = equipped skill, hold F on a full bar = Blood Surge. Knight: RESOLVE fills on blocks and heavy cuts, not third cuts. |
| 18 | DEEP POCKETS, NO QUARTER | Say "PLUNDER bar". DEEP POCKETS now reads "everything that fills the PLUNDER bar fills it a third faster" because the code (`gainPlunder`, x1.33) scales every plunder gain, not only coins. |
| 19 | Geomancer BULWARK | Text now names the STONE WALL half. |
| 20 | CONSECRATE | "foes on it take a holy tick (the dead burn)". |
| 21 | STOKE | The audit was wrong here: the code refunds 17 wind AND calls `gainHeat(6)`, so the text "and heat with it" is true. Left alone. The unused `PYRO_ICONS.kindle` is left in place (passives never call `skillIcon`); delete it or ignore it. |

Not built, on purpose: item 5 (new late-game actives) is a design question, see **Question** below. Items 6-16, 22, 23 are behaviour, balance or renames and were out of this lane's brief.

**Question (item 5): Pyromancer, Paladin, Freebooter and Death Knight have no active to buy after level 8.** Recommendation: yes, add them, but as a separate designed lane and not as a batch of filler. Two capstone actives per hero at about levels 14 and 20 (360 to 520 coins, like the Knight, Warden and Geomancer), each tied to the hero's own bar (a Pyromancer heat-filler, a Paladin light-filler, a Freebooter called shot, a Death Knight blood-spender), each with its own pose and icon (the pose ratchet and `tools/skill-icons.mjs` will catch a missing one). Cheaper alternative if you want no new art: let two existing passives per hero become buyable actives. Until you decide, nothing is added.

## 1. Method

- Source of truth for the list: `SKILLS` in `src/progression-catalog.js`, read through `skillsFor(hero)` in `src/progression.js` (I loaded the catalog in Node and dumped id, name, active flag, level and description for every hero).
- Real behaviour: for every skill id I grepped every `tal('id')` read in `src/*.js`. Every catalog passive is read at least once (nothing is UNREAD); the Geomancer's ten are read through `geoTal()` in `src/main.js` and `tal()` inside `src/geomancer.js`. Then I read the code behind each active in `updatePlayer`, `knightKit`, `wardenKit`, `geomancerKit`, plus the passives whose descriptions looked doubtful.
- Innate kits: `DK_KEYS`, `WARDEN_KEYS`, `GEO_KEYS`, the `HEROES` cards, and the `isPyro()/isPaladin()/isPirate()/isReaper()/isWarden()/isGeo()/hero()==='knight'` blocks in `updatePlayer`, `src/ember-ward.js`, `src/duck.js`.
- Icons: actives use `skillIcon` (tables `PYRO_ICONS`, `GEO_ICONS`, `PAL_ICONS`, `MORE_ICONS`, `SKILL_KIN`). Passives use `talIcon` / `TAL_KIND` / `TAL_BY_NAME`. I extracted `TAL_KIND` and evaluated it for every passive id to see the glyph each one actually gets.
- Poses: `src/hero-poses.js` (`POSE_BEATS`) and the `kitPose(...)` calls. `tools/ability-poses.mjs` keeps a `KNOWN_POSELESS` ratchet that is empty, so every active has a pose; I did not run it.
- Hotfix history (already fixed, not re-reported): `4886d8e` one name per skill; `119d8ae` every hero's actives show their own icon in the store; `7c0e94e` the Geomancer's own spell icons (actives only); `2879803` LUNGE rebalanced; `2325407` Death Knight poses; `3573d75` LODESTONE replaced by STONE WALL.
- Verdict key: FITS = right hero, honest description. WEAK FIT = on theme but a bare stat bump, a template copy, or half-borrowed. WRONG HERO = the idea belongs to another hero. BROKEN/UNREAD = does nothing or unreachable (none found among catalog skills).
- Icon problems are noted in the Note column but do not by themselves lower a verdict; they are ranked in section 4.

Headline: the catalog is in good shape on behaviour (no dead skills, no fire on the Geomancer, no hero holding another hero's mechanic outright). The real problems are (a) icons, especially passive icons and eight borrowed active icons, (b) a few descriptions that are stale or wrong, (c) a lot of shared templates across heroes, (d) four heroes with nothing to buy after level 8, and (e) a handful of stat-bump passives with no character.

## 2. Per hero

### 2.1 Knight (runs on RESOLVE)

Innate kit: shield on C (perfect guard on the beat), heavy cut (hold X), LAST CHARGE on full RESOLVE (tap C), shoulder charge, pogo plunge. Resolve is filled by shield blocks (`gainResolve` in the guard code) and by heavy swings (`swingDmg`). No skill in the catalog feeds, spends or reads Resolve except BULL RUSH (lengthens the Last Charge).

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| thirdCut | THIRD CUT | P | third cut of a run throws further, hits a quarter harder | FITS | combo identity |
| shieldThrow | SHIELD THROW | A | hurls the shield, it returns; no shield while out | FITS | own icon, own pose (toss) |
| plated | PLATED | P | shield covers the back too | FITS | same effect as Paladin WARDED |
| risingCut | RISING CUT | A | upward cut, carries first foe up and holds it | FITS | own icon and pose |
| momentum | MOMENTUM | P | a second of running gives +12% next blow | WEAK FIT | pure stat |
| bounding | BOUNDING | P | pogo chain hits harder, refunds stamina | FITS | ties to his pogo |
| riposte | RIPOSTE | P | turned blow makes next swing x2 | FITS | the "next blow x2" template (section 3) |
| groundSlam | GROUND SLAM | A | quake both ways from the floor | WEAK FIT | same effect as Paladin HAMMER LEAP and its whole quake passive line; Geomancer also quakes |
| sunder | SUNDER | P | heavy-cut target takes next blow x2 | FITS | icon is a sword glyph, shared with three other heroes' "sunder" |
| lunge | LUNGE | A | dash-thrust through foes, invulnerable while going | FITS | dash template shared by five heroes; name also used for the Warden's dodge ("THE LUNGE") |
| parry | PERFECT GUARD | P | perfect-guard window x2, foe reels | FITS | |
| vengeance | VENGEANCE | P | turned damage kept, next swing carries it (max 30) | FITS | |
| whirlwind | WHIRLWIND | A | two spinning cuts around him | FITS | Warden WHEEL is the same shape on a low sweep |
| evasion | EVASION | P | dodge through a blow: +20 stamina, next swing is a third cut | WEAK FIT | stamina rebate; icon is the generic stamina bolt |
| airRoll | AIR ROLL | P | air dodge lifts a little | WEAK FIT | movement tweak, identical to Freebooter SWASHBUCKLE |
| bleed | OPEN WOUND | P | cuts leave a 3 s bleed | FITS | |
| warCry | WAR CRY | A | staggers near foes, +30 stamina, quarter less damage 4 s | WEAK FIT | good knight shout, but pays stamina, not Resolve; orange icon and ring read as fire |
| execute | EXECUTION | P | heavy or third cut finishes foes under a quarter | FITS | same rule as Death Knight WINNOWED |
| bash | BULL RUSH | P | Last Charge +4 tiles, longer stagger, knocks back projectiles | FITS | only skill that touches his resource |
| disarm | DISARM | A | strips shield or weapon for the fight, opens a boss briefly | FITS | own icon and pose |
| bulwark | BULWARK | P | shield sends arrows, seeds, spells back | FITS | reflect template shared with Paladin, Geomancer, Warden; name shared with Geomancer |
| lightStep | LIGHT STEP | P | dodges cost 3 less stamina | WEAK FIT | pure stat |
| ironclad | IRONCLAD | A | 4 s no stagger, blows still hurt | FITS | |
| hangCut | HANGING CUT | P | every jump swing holds him in the air | FITS | |
| flurry | FLURRY | P | swings cost half stamina | WEAK FIT | stat; a big number with no character |
| holdLine | STEADY ARM | P | holding the shield costs half wind | WEAK FIT | stat (already renamed away from the Warden's HOLD THE LINE) |
| swordOfRealm | SWORD OF THE REALM | A | 10 s of light waves along the floor per swing, great wave on a third cut | WEAK FIT | "wave of light" is the Paladin's element; the Knight has no light. Gold sparkle icon and gold rings back this up |
| airDash | SLIPSTREAM | P | two air dodges | WEAK FIT | movement stat |
| unbroken | UNBROKEN | P | combo never restarts while hitting | FITS | |
| counterstroke | COUNTERSTROKE | P | perfect guard strikes back by itself | FITS | same idea as Freebooter THE CUTLASS ANSWERS |
| endlessSky | ENDLESS SKY | P | a landed plunge returns air dodge and jump | FITS | pogo identity |

### 2.2 Pyromancer (runs on HEAT)

Innate kit: tap C ember, hold C jet, full bar then C = the Pyre, down-held EMBER WARD (`src/ember-ward.js`, a fire dome that burns melee and melts projectiles, runs on its own ward heat), firedrop plunge. Only six actives, all bought by level 8.

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| skip | SKIPPING EMBER | P | ember bounces once and burns | FITS | |
| vent | VENT | A | dumps all heat as a blast, lights lamps | FITS | reads and spends heat: perfect |
| stoke | STOKE | P | an ember on a burning foe refunds 17 stamina | FITS | description says heat as well; code refunds wind only (small mismatch) |
| longFlame | LONG FLAME | P | jet reaches 11% further | WEAK FIT | stat |
| pilot | PILOT LIGHT | P | heat never falls below a third | FITS | |
| wisp | WISP | A | a flame familiar that lights lamps and dives at foes | FITS | |
| fireWall | FIRE WALL | A | five-flame line for 3 s | FITS | |
| emberSkin | EMBER SKIN | P | whatever strikes you catches fire | FITS | icon is the steel "reflect" shield |
| twin | TWIN EMBER | P | a tap throws two embers | FITS | |
| scatter | SCATTER | P | ember bursts for 6 splash | FITS | |
| meteor | METEOR | A | fire from the sky on the nearest foe, scales with heat | FITS | |
| updraft | UPDRAFT | P | jet lights in the air and holds her up | FITS | |
| flameRing | RING OF FIRE | A | ring of flame rolls out, knocks back, eats projectiles | FITS | |
| cinderStep | CINDER STEP | A | burning invulnerable dash | FITS | dash template |
| searing | SEARING | P | jet burns 3x longer | FITS | |
| kindle | KINDLE | P | fire mends instead of burning | FITS | a dedicated `PYRO_ICONS.kindle` exists but passives never use `skillIcon`, so it is never shown |
| heatShield | HEAT SHIELD | P | above half heat, a quarter less damage | FITS | |
| brand | BRAND | P | burning foe takes 1.5x | FITS | |
| conflagration | CONFLAGRATION | P | burning foe that dies ignites neighbours | FITS | |
| jetWalk | WALKING FLAME | P | walk slowly while the jet burns | FITS | |
| blaze | BLAZE | P | full heat lasts 10 s not 5 | WEAK FIT | duration stat, but it changes the Pyre's window |
| smoulder | SMOULDER | P | standing in any fire fills heat | FITS | |
| emberHeart | EMBER HEART | P | under a third health, x1.5 damage | FITS | |
| sunder | SCORCHED EARTH | P | held flame leaves burning ground | FITS | icon is a sword glyph (shared id "sunder") |
| backdraft | BACKDRAFT | P | reaching full heat throws a flame ring | FITS | |
| phoenix | PHOENIX | P | once a wood, a killing blow leaves her standing | FITS | |
| wildfire | WILDFIRE | P | embers jump between burning foes | FITS | |
| inferno | INFERNO | P | full heat = 6 s unending jet, then heat gone | FITS | |
| phoenixTrail | PHOENIX TRAIL | P | phoenix returns every shrine and life; dodges leave fire | FITS | |

### 2.3 Paladin (runs on LIGHT)

Innate kit: tap C MEND (half the bar), hold C AEGIS (a ward, not a shield: "it cannot turn what a shield cannot"), full bar then C = JUDGEMENT, maul with quake, HAMMERFALL plunge, SHIELDLESS CHARGE dodge. Six actives, all by level 8.

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| litany | LITANY | P | mend no longer roots him | FITS | |
| consecrate | CONSECRATE | A | holy ground, 4 damage ticks, heals 2.5% health a second | FITS | description says foes "burn with holy fire"; only wights actually burn, others just take a tick |
| warded | WARDED | P | aegis covers the back too | FITS | same as Knight PLATED |
| shockwave | SHOCKWAVE | P | hammerfall waves go twice as far | FITS | maul identity |
| reflect | REFLECTION | P | aegis sends projectiles back | FITS | reflect template |
| holyCharge | HOLY CHARGE | A | maul-levelled invulnerable charge, throws foes aside | WEAK FIT | (text FIXED: now "lower the maul and charge") description said "charge shield-first" but the Paladin has no shield (pose is "maul levelled like a ram"); dash template |
| blessedHammer | BLESSED HAMMER | A | spiral of light hammers | FITS | |
| mercy | MERCY | P | mend also gives 30 stamina | FITS | |
| zeal | ZEAL | P | judgement kills give 8 health per foe struck | FITS | |
| lightLance | SPEAR OF LIGHT | A | light beam to the first wall | FITS | its icon is also used by the Warden's SKEWER |
| unwavering | UNWAVERING | P | aegis lasts as long as wind allows | WEAK FIT | duration stat |
| divineShield | DIVINE SHIELD | A | 2 s invulnerability | FITS | name says shield on a shieldless hero; the effect is a light ward |
| hammerLeap | HAMMER LEAP | A | leap and slam, quake both ways | FITS | overlaps Knight GROUND SLAM |
| sunder | SHATTER | P | overhead waves stagger what they pass | FITS | sword glyph icon (shared id) |
| heavyTread | HEAVY TREAD | P | shoulder dodge sends a quake ahead | FITS | |
| smite | SMITE | P | judgement leaves foes burning 3 s | WEAK FIT | burn is the Pyromancer's status |
| beacon | BEACON | P | at full light, foes near you catch fire | WEAK FIT | burn again; a full-light aura is a good idea, fire is the wrong element |
| retribution | RETRIBUTION | P | foe that hits the aegis reels | FITS | |
| crusade | CRUSADE | P | dropping the aegis throws back near foes | FITS | |
| concuss | CONCUSSION | P | third maul blow staggers any foe | FITS | |
| earthshaker | EARTHSHAKER | P | high drop quakes both ways | FITS | quake line overlaps Geomancer's earth theme |
| martyr | MARTYR | P | once a life under a quarter health fills the light | FITS | |
| sanctuary | SANCTUARY | P | 3 health a second while holding the aegis | FITS | |
| wrath | WRATH | P | each kill fills a tenth of the light | FITS | |
| doubleJudge | DOUBLE JUDGEMENT | P | judgement falls twice | FITS | |
| fortress | MOVING FORTRESS | P | walk at full pace behind the aegis, parry on the beat | FITS | |
| aftershock | AFTERSHOCK | P | every third maul blow quakes | FITS | name shared with Geomancer AFTERSHOCK |

### 2.4 Freebooter (runs on PLUNDER)

Innate kit: cutlass run of five, HOLD X pistol (one ball, then empty until gold reloads it), tap C parry, hold C hook, full plunder then C = BLACK FLAG. Six actives, all by level 8. Eight of the passives run on coins, which fits the theme but is dead weight in arenas with no coins.

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| longBarrel | LONG BARREL | P | pistol range x2 | WEAK FIT | stat |
| grapeshot | GRAPESHOT | A | cone of shot, spent even if it misses | FITS | own icon |
| deepPockets | DEEP POCKETS | P | plunder bar fills a third faster | FITS | wording says "every coin is worth more to the purse"; the code widens the PLUNDER bar gain, and "purse" is the coin counter elsewhere |
| greased | GREASED PALM | P | coin pickup gives 6 wind | FITS | |
| rum | RUM | A | heal 20%, then reckless for 4 s | FITS | the hero card still says hold C = RUM (see 4.4) |
| longLine | LONG LINE | P | hook reach and haul | FITS | |
| boarding | BOARDING PARTY | A | hook-and-swing dash through foes | FITS | dash template |
| cutthroat | CUTTHROAT | P | fifth blow of a run x2 | FITS | icon is the grapnel glyph |
| powderBurn | POWDER BURN | P | ball leaves foe burning | FITS | gunpowder burn is fine; second burn source in the roster |
| quickHands | QUICK HANDS | P | pistol in the air and out of a roll | FITS | |
| broadside | BROADSIDE | A | five-ball line through everything | FITS | uses Grapeshot's icon |
| looter | LOOTER | P | blade kills shake gold loose | FITS | |
| blackSpot | THE BLACK SPOT | A | mark a foe: +33% damage 8 s, pays double | FITS | uses Grapeshot's icon; feeds plunder on the kill |
| keelhaul | KEELHAUL | A | hook a foe and drag it past him | FITS | uses Boarding's icon; skips bosses |
| shareOut | FAIR SHARES | P | every coin heals 2 | FITS | |
| haulCut | HAUL AND CUT | P | hooked foe counts as fourth blow of the run | FITS | |
| turncoat | TURNCOAT | P | turned blow makes next cutlass blow x2 | FITS | next-blow-x2 template; grapnel icon |
| deadEye | DEAD EYE | P | ball into staggered foe x2 | FITS | |
| sunder | HOLED | P | ball leaves foe taking next blow x2 | FITS | sword glyph icon |
| ransom | RANSOM | P | Black Flag gives half wind back | FITS | |
| pieces | PIECES OF EIGHT | P | every eighth coin worth ten | FITS | |
| swash | SWASHBUCKLE | P | air roll lifts a little | WEAK FIT | identical to Knight AIR ROLL |
| runThrough | RUN THROUGH | P | fifth blow goes through a raised guard | FITS | name collides with the Warden's innate RUN-THROUGH |
| secondBarrel | SECOND BARREL | P | pistol fires twice | FITS | icon is a SKULL (regex match on "second") |
| noQuarter | NO QUARTER | P | each kill fills 10 plunder | FITS | description says "purse"; it fills the plunder bar |
| rollCut | TUMBLING CUT | P | dash attack from anywhere in a roll | FITS | |
| hotBarrel | HOT BARREL | P | kill reloads every barrel, pistol comes up instantly 3 s | FITS | |
| paidInGold | PAID IN GOLD | P | a waiting skill fires for 15 gold; coins shorten waits | FITS | strong on-theme idea |
| parryCut | THE CUTLASS ANSWERS | P | turned blow answers with a cut | FITS | same as Knight COUNTERSTROKE |

### 2.5 Death Knight, id `reaper` (runs on BLOOD)

Innate kit: slow cleave, planted blade fan of blood bolts, hold C BLOOD WARD then BLOOD NOVA, RETURN on the beat, F = SUMMON SKELETON or BLOOD SURGE on a full bar. Coherent and the most internally consistent hero. Eight passives only matter if a particular active is owned (`SKILL_NEEDS` in `src/main.js` shows this in the menu).

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| longHaft | LONG REACH | P | cleave and planted blade reach further | WEAK FIT | stat; icon is a scythe glyph on a greatsword hero |
| summonSkeleton | SUMMON SKELETON | A | one random skeleton for 10 s, 18 s wait | FITS | own icon, F key |
| gleaner | GLEANER | P | summon wait 12 s | WEAK FIT | timer stat, needs the active |
| drainWalk | WARD WALK | P | walk while the ward is up | FITS | |
| harvestMoon | BLOOD BOIL | A | boiling ground for 3 s | FITS | id and helpers still say "harvest moon"; icon is DEATH COIL's (scythe) |
| unholyGround | UNHOLY GROUND | A | his patch of floor: foes marked and bleeding, skeletons refreshed | FITS | |
| scytheThrown | DEATH COIL | A | blood coil goes out, returns as health | FITS | id and code comments say "scythe thrown"; he carries a greatsword |
| sunder | LAID OPEN | P | blood bolts leave foes taking next blow x2 | FITS | next-blow-x2 template |
| bloodMark | MARKED IN BLOOD | P | cleave marks | FITS | |
| press | THE PRESS | P | two skeletons at once | FITS | needs summon |
| graveTide | GRAVE TIDE | A | hands out of the floor hold foes | FITS | row-from-floor template |
| bidden | BIDDEN | P | summons go for your last target | FITS | needs summon or gravecall |
| gravecall | GRAVECALL | A | one of each skeleton for 5 s | FITS | uses Grave Tide's icon |
| deathGrip | DEATH GRIP | A | drags the nearest thing to his feet, marked | FITS | |
| longPassing | LONG PASSING | P | dodge goes further and marks | FITS | skull glyph icon |
| wardPull | THE PULL | P | nova drags foes a step in | FITS | |
| fullCircle | THE SECOND VOLLEY | P | planted blade looses a second volley | FITS | scythe glyph icon |
| rend | REND | P | marked foes bleed when cut | FITS | |
| ossuary | OSSUARY | P | a lost skeleton shortens the summon wait | FITS | needs summon |
| dueRites | DUE RITES | P | a kill inside a full nova leaves a heart | FITS | |
| lastRites | LAST RITES | P | blood surge takes more, reaches further | FITS | |
| deepRed | DEEP RED | P | nova heals more, more per marked foe | FITS | |
| coldComfort | COLD COMFORT | P | greatsword cuts 1.5x while the summon is on wait and none stands | FITS | needs summon |
| secondDeath | SECOND DEATH | P | a skeleton that comes apart takes near foes with it | FITS | needs summon or gravecall |
| gripAll | THE WHOLE ROW | P | Death Grip takes the whole line | FITS | needs Death Grip |
| winnow | WINNOWED | P | marked foe under a quarter dies to the next hit | WEAK FIT | the Knight's EXECUTION rule again |
| graveProvides | THE GRAVE PROVIDES | P | a kill is a free summon | FITS | needs summon |
| overflow | OVERFLOW | P | a full ward bursts twice | FITS | |

### 2.6 Warden (runs on VIGIL)

Innate kit: reach spear (tip pays), tap C DEFLECT (yellow only), impale with no button, full vigil then C = PHALANX, hold X RUN-THROUGH, plunge pin, step-and-jump VAULT. Passives are the richest and most on-theme in the game (nearly all read or feed the pin, tip, vigil or vault). Actives are the weak spot: five of nine are an innate verb "asked for on a key" (that is the stated design in the `wardenKit` header comment), which makes them feel repeated.

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| keenPoint | KEEN POINT | P | tip zone 4 px larger | WEAK FIT | stat |
| skewer | SKEWER | A | driven thrust pins first foe | FITS | icon is the Paladin's SPEAR OF LIGHT (SKILL_KIN); overlaps the plunge pin |
| wideGuard | WIDE GUARD | P | sweep reaches further, point catches charges off her level | WEAK FIT | stat |
| vaulter | VAULTER | P | vault costs no wind | FITS | |
| harrier | HARRIER | A | vault over the nearest foe | WEAK FIT | the innate step-and-jump vault on a key; uses the Freebooter hook icon |
| throughAndThrough | THROUGH AND THROUGH | P | run-through a tile longer | FITS | |
| openPoint | OPENED | P | run-through target takes next blow x2 | FITS | template |
| setSpears | SET THE SPEARS | A | three spears out of the ground pin | WEAK FIT | a small copy of her innate PHALANX (same `phalanx` array); uses the Death Knight Grave Tide icon |
| standFast | STAND FAST | P | turned blow pays double vigil, foe reels longer | FITS | |
| sendBack | SEND IT BACK | P | swatted projectiles go back | FITS | reflect template |
| wheel | THE WHEEL | A | low sweep, everything goes down | FITS | own icon; near cousin of Knight WHIRLWIND |
| giveGround | GIVE GROUND | P | back step staggers foes inside the spear | FITS | |
| longVault | LONG VAULT | P | vault further, thrust out of it | FITS | |
| javelin | JAVELIN | A | hurl the spear: carries, pins, or becomes a wall step; F again recalls | FITS | one of the best actives in the game |
| ringing | RINGING | P | tip hit pays double vigil | FITS | |
| driveHome | DRIVE HOME | P | run-through slams the first foe into a wall | FITS | |
| exact | EXACTNESS | P | tip hit on a wind-up opens it | FITS | |
| poleSpring | POLE SPRING | A | vault up, come down point first, pins | WEAK FIT | vault plus her innate plunge pin |
| counterpoise | COUNTERPOISE | P | turned blow leaves the thrower opened | FITS | template |
| widerRow | A WIDER ROW | P | phalanx spears closer and further | FITS | applies to the vigil Phalanx, not to SET THE SPEARS |
| fullStretch | FULL STRETCH | A | 5 s reach x1.5, every blow lands as the tip | FITS | |
| everReady | EVER READY | P | a sweep that turns something has no recovery | FITS | |
| pinTwist | TWIST IT | P | stabs into a pin leave a bleed | FITS | |
| freeHand | FREE HAND | P | pulling free costs nothing, +20 wind | FITS | |
| spearDance | SPEAR DANCE | A | six quick thrusts | FITS | |
| airPoint | AIR POINT | P | leaving a pin returns jump and air step | FITS | |
| deepSet | DEEP SET | P | up to a fifth more at full stretch | WEAK FIT | stat |
| spitted | SPITTED | P | a charge on her point is held as well as broken | FITS | |
| rainOfSpears | RAIN OF SPEARS | A | shadowed spears fall across the room | FITS | |
| holdThem | HOLD THEM DOWN | P | pin holds longer, a fourth stab | FITS | |
| spearhead | SPEARHEAD | P | run-through needs no wind-up after two thrusts | FITS | |
| holdTheLine | HEDGE OF SPEARS | P | phalanx stays up 3 s | FITS | id is the old HOLD THE LINE |
| skirmisher | SKIRMISHER | P | pull free and hurl the body off the point | FITS | |

### 2.7 Geomancer (runs on TREMOR)

Innate kit: C = RUNE-WARD (the code header calls it "the Knight's guard, sidegraded": hold to block, yellow blocked, red breaks through, perfect beat throws a shot back and EMPOWERS), held X = FAULT LINE, UP+X spur, third blow spin, STONEFALL plunge, rolling stone dodge, full TREMOR then C = THE QUAKE. Actives are the right idea (she builds something in the way); no fire anywhere on her. Passives are the weakest set in the game.

| id | Name | A/P | What it really does | Verdict | Note |
|---|---|---|---|---|---|
| stoneStep | STONE STEP | A | pillar under her feet, one more jump in air | FITS | own icon (hotfixed) |
| geoTall | HIGHER GROUND | P | pillar one stone taller, fault spike throws higher | WEAK FIT | stat; sword glyph icon |
| boulder | BOULDER | A | rolling boulder, bounces off a wall | FITS | |
| geoRumble | RUMBLE | P | TREMOR fills half as fast again | FITS | feeds her resource; icon is a COIN (regex hit on "rum") |
| spikeRow | SPIKE ROW | A | spikes erupt in a row and hold foes | FITS | row-from-floor template |
| geoReturn | STONEFACE | P | ward throws back every shot, not only on the beat | WEAK FIT | reflect template again; sword glyph icon |
| archway | ARCHWAY | A | bridge over a gap, or an arch that shelters | FITS | |
| geoLasting | BEDROCK | P | her stones last 2 s longer | WEAK FIT | stat; sword glyph icon |
| stoneWall | STONE WALL | A | wall stops yellow blows and shots, bounces weapons on the beat, red smashes it | FITS | overlaps her own C ward (two guard tools) |
| geoAftershock | AFTERSHOCK | P | STONEFALL knocks down 1.5x longer | FITS | name shared with Paladin AFTERSHOCK |
| entomb | ENTOMB | A | seals a foe in stone 3 s | FITS | |
| faultLine | THE RIFT | A | crack along the floor throws foes into the air | WEAK FIT | id, pose (`gFault`), icon and code all repeat her innate FAULT LINE (held X); differs only by not needing a wind-up |
| geoShrapnel | SHRAPNEL | P | broken stone or ward bursts into shards | FITS | sword glyph icon |
| golem | GOLEM | A | stone golem fights 10 s | FITS | |
| geoHardLand | THROWN DOWN | P | foes she throws up land hard | FITS | sword glyph icon |
| avalanche | AVALANCHE | A | boulders rain, each told by a shadow | FITS | |
| geoFourth | THE FOURTH STONE | P | four stones at once | FITS | it lifts her own rule cap; sword glyph icon |
| geoBulwark | BULWARK | P | a red blow through the ward hits at half force; STONE WALL survives one smash | FITS | description mentions only the ward half; name shared with Knight BULWARK; sword glyph icon |
| geoWideQuake | THE WIDE QUAKE | P | THE QUAKE reaches 1.5x, more rock | FITS | |

## 3. Cross-hero: duplicates and shared templates

Same effect under different names (each hero's version should have its own flavour, or only one hero should own it):

| Template | Where it repeats | Comment |
|---|---|---|
| Projectile reflect | Knight BULWARK, Paladin REFLECTION, Geomancer STONEFACE, Warden SEND IT BACK | four heroes, one effect. `reflectSeed` is common code. |
| Covers your back too | Knight PLATED, Paladin WARDED | identical. |
| Air roll lifts | Knight AIR ROLL, Freebooter SWASHBUCKLE | identical. |
| Perfect guard strikes back | Knight COUNTERSTROKE, Freebooter THE CUTLASS ANSWERS (Paladin MOVING FORTRESS parry is similar) | |
| "Next blow lands x2" on a marked foe | Knight RIPOSTE, SUNDER; Pyromancer none; Freebooter HOLED, TURNCOAT, DEAD EYE; Death Knight LAID OPEN; Warden OPENED, COUNTERPOISE | about eight passives are the same rule with a different trigger. The catalog also reuses the literal id `sunder` for five heroes with different behaviour (Pyromancer's is burning ground, Paladin's is a stagger), so a single icon and a single name key covers all. |
| Execute below a quarter | Knight EXECUTION, Death Knight WINNOWED | |
| Dash active with invulnerability | Knight LUNGE, Pyromancer CINDER STEP, Paladin HOLY CHARGE, Freebooter BOARDING PARTY, Warden HARRIER and SKEWER | six heroes have a "dash through them" active. |
| Row erupts out of the floor and holds foes | Death Knight GRAVE TIDE, Warden SET THE SPEARS, Geomancer SPIKE ROW | same shape three times. |
| Quake both ways | Knight GROUND SLAM, Paladin HAMMER LEAP plus SHOCKWAVE/SHATTER/HEAVY TREAD/EARTHSHAKER/AFTERSHOCK, Geomancer QUAKE/STONEFALL | the Paladin's earth line steps on the Geomancer's whole identity. |
| Line through everything | Paladin SPEAR OF LIGHT, Freebooter BROADSIDE | fine, different weapons. |
| Whirl/sweep | Knight WHIRLWIND, Warden THE WHEEL | acceptable. |
| Burn status | Pyromancer (everything), Paladin SMITE, BEACON, CONSECRATE, Freebooter POWDER BURN | Paladin fire is the one that blurs identity. |
| Invulnerable/armoured window | Knight IRONCLAD, Paladin DIVINE SHIELD | different (no stagger vs no damage); fine. |

Name collisions with different effects: BULWARK (Knight, Geomancer), AFTERSHOCK (Paladin, Geomancer), RUN THROUGH (Freebooter passive) vs RUN-THROUGH (Warden innate move), LUNGE (Knight active) vs THE LUNGE (Warden dodge), SKIRMISHER / SPEARHEAD (Warden passives that are also legacy tree names in `TBR`).

Borrowed by design (not bugs, listed so Daniel can decide): the Geomancer's C RUNE-WARD is explicitly the Knight's guard sidegraded (`src/geomancer.js` header), and her STONE WALL active is her old C bought back, so she now carries two guard tools.

Every hero's stat-only passives (no rule change): Knight MOMENTUM, LIGHT STEP, FLURRY, STEADY ARM, SLIPSTREAM; Pyromancer LONG FLAME, BLAZE; Paladin UNWAVERING; Freebooter LONG BARREL; Death Knight LONG REACH, GLEANER; Warden KEEN POINT, WIDE GUARD, DEEP SET; Geomancer HIGHER GROUND, BEDROCK, THE FOURTH STONE.

Resource support (does the skill list touch the hero's own bar?): Pyromancer heat, Paladin light, Freebooter plunder, Death Knight blood, Warden vigil and Geomancer tremor are all fed or spent by several skills. Knight RESOLVE is fed by nothing in the catalog and spent only by the Last Charge; only BULL RUSH reads it.

Late-game active gap: Pyromancer, Paladin, Freebooter and Death Knight have no active after level 8. Knight, Warden and Geomancer get capstone actives at levels 12 to 20 costing 360 to 520 coins. Those four heroes have nothing to spend on after early levels apart from passives (which are free).

Hidden growth: `src/progression-catalog.js` still holds "growth" nodes (STEADY, STALWART, ASH CLOAK, QUICK SHAFT, DEATH WATCH, GRAVE GOODS, LIGHT FOOT, RADIANCE). `tal()` in `src/main.js` gives them a rank of 0, 1 or 2 by level (`growthAt` in `src/progression.js`), so they work, but they are not in any skill list, so the player never sees them (for example GRAVE GOODS makes skeletons last 3 s longer and hit 2 harder per rank).

Icons, structural cause: `TAL_KIND` picks a passive's glyph by id in `TAL_BY_NAME`, then by regex on the id text, then falls back to a sword. Only about 15 glyphs exist for 144 passives, and the regex crosses heroes: "rum" matches Geomancer RUMBLE (coin), "second" matches Freebooter SECOND BARREL (skull), "hook" matches CUTTHROAT and TURNCOAT (grapnel), and every `geo*` passive except AFTERSHOCK/WIDE QUAKE (which match "shock"/"quake") falls through to the sword. The hotfix commits fixed active icons only.

Borrowed active icons (`SKILL_KIN` in `src/main.js`): Warden SKEWER shows the Paladin's SPEAR OF LIGHT, Warden SET THE SPEARS shows the Death Knight's GRAVE TIDE, Warden HARRIER shows the Freebooter's BOARDING PARTY hook, Death Knight BLOOD BOIL shows DEATH COIL, Death Knight GRAVECALL shows GRAVE TIDE, Freebooter BROADSIDE and THE BLACK SPOT both show GRAPESHOT, Freebooter KEELHAUL shows BOARDING PARTY. Eight of 52 actives have no icon of their own.

Poses: every active has a pose (`KNOWN_POSELESS` is empty); no pose belongs to another hero. Descriptions in `POSE_BEATS` match the abilities they name.

## 4. Ranked proposed changes

Size: S = under an hour of copy or one small table; M = a few hours; L = design plus tuning. Risk is to balance or saves.

| # | Hero | Skill | Problem | Proposed change | Size | Risk |
|---|---|---|---|---|---|---|
| 1 | Geomancer (and others) | **FIXED.** all passive icons | 7 of 10 Geomancer passives show a sword; RUMBLE shows a coin; Freebooter SECOND BARREL shows a skull; CUTTHROAT/TURNCOAT a grapnel; all `sunder` passives a sword | Add explicit `TAL_BY_NAME` keys for every `geo*` id, pin SECOND BARREL to the shot glyph, drop the cross-hero regexes (`rum`, `second`, `hook`), and key `sunder` per hero. Optionally add 3 Geomancer glyphs (stone, rune, crumbling piece). | S | none |
| 2 | Warden, Death Knight, Freebooter | **FIXED.** SKEWER, SET THE SPEARS, HARRIER, BLOOD BOIL, GRAVECALL, BROADSIDE, THE BLACK SPOT, KEELHAUL | Eight actives wear another skill's icon, three of them another hero's | Draw eight icons in `MORE_ICONS` and empty `SKILL_KIN`. | M | none |
| 3 | Paladin | HOLY CHARGE | **FIXED.** Description says "charge shield-first"; the Paladin has no shield | Reword to "charge maul-first" or "lower the maul and charge". | S | none |
| 4 | Freebooter, Death Knight, Knight | **FIXED.** hero cards in `HEROES` | Pirate card says tap C = hook, hold C = rum; code: tap C = parry, hold C = hook, rum is a bought active. Death Knight card says tap F is the equipped skill; `DK_KEYS` says F is summon. Knight card says third cuts fill RESOLVE; code fills it on blocks and heavy cuts. | Rewrite the three cards from the code. | S | none |
| 5 | Pyromancer, Paladin, Freebooter, Death Knight | **QUESTION, not built (section 0).** new actives | Nothing to buy after level 8, while Knight, Warden and Geomancer have capstones at 12 to 20 | Add two actives each at about levels 14 and 20, priced 360 to 520, each tied to the hero's bar (for example Pyromancer: a BONFIRE that fills heat; Paladin: a HALLOWED BANNER that fills light; Freebooter: a CANNON called shot; Death Knight: a BONE PRISON that holds foes for his blood). | L | balance, new art and poses; run the pose ratchet |
| 6 | Paladin | SMITE, BEACON, CONSECRATE text | Burning is the Pyromancer's status; the Paladin's holy ideas are wearing fire | Re-theme to holy effects: SMITE marks foes "judged" (take +25%), BEACON blinds or slows foes near you at full light, CONSECRATE text says they take holy damage. Remove the flame particle calls. | M | balance |
| 7 | Knight | SWORD OF THE REALM | Light waves are the Paladin's element; gold sparkle icon and rings | Recolour to steel-white, rename (e.g. THE KING'S CUT), keep the mechanic. | S | none |
| 8 | Knight | resource | RESOLVE is fed by blocks and heavy cuts and touched by no skill except BULL RUSH | Give WAR CRY a Resolve link (a fifth of the bar on cast) and turn two stat passives (FLURRY, STEADY ARM) into Resolve-aware ones (for example a perfect guard gives double Resolve). | M | balance |
| 9 | Warden | HARRIER, SET THE SPEARS, POLE SPRING (SKEWER) | Innate verbs (vault, phalanx, plunge pin, thrust pin) resold as actives | Give each a job the innate move lacks: HARRIER lands a stabbing dive that shoves everything near the landing; SET THE SPEARS becomes a "spear trap" that stays armed until stepped on; POLE SPRING a long tall vault that carries her over a wall. Or cut two and replace with new verbs. | M | balance, poses |
| 10 | Geomancer | THE RIFT | Same as her innate FAULT LINE in id, pose, icon and code | Replace with a distinct verb (CHASM: a pit that swallows small foes and traps big ones, or QUAKE FOOTING: stone stands where each of her next three steps lands), or cut and give the slot to something new. | M | balance |
| 11 | Geomancer | C RUNE-WARD, STONE WALL | The ward is the Knight's guard by design; the wall is her former C; two guard tools | Decide one guard. Suggest keeping the ward and moving STONE WALL to an offensive "rise a wall under a foe" (a launch) so her bought kit builds, not defends. | M | design call |
| 12 | Knight, Paladin, Geomancer, Warden | BULWARK, REFLECTION, STONEFACE, SEND IT BACK | One reflect effect on four heroes | Keep it on the Knight and Warden; re-theme Paladin REFLECTION to send light back as a stagger, Geomancer STONEFACE to send back shards that pin. | M | balance |
| 13 | Knight, Paladin | GROUND SLAM vs HAMMER LEAP and the Paladin's five quake passives | Knight and Paladin share a quake; the Paladin's earth line overlaps the Geomancer | Recast Knight GROUND SLAM as a shield bash (a short forward stagger, no ring) and spread three of the Paladin's quake passives into light-flavoured ones. | M | balance |
| 14 | All | stat-only passives (list in section 3) | 17 passives are a number and nothing else | Replace each with a rule-changer over time (one per lane). Examples: Knight FLURRY becomes "a third cut costs nothing", Pyromancer LONG FLAME becomes "the jet wets the ground: burning ground for 2 s", Geomancer BEDROCK becomes "a crumbling piece bursts into shards", Warden KEEN POINT becomes "a tip hit rings the foe: staggered for 0.3 s". | L | balance, many small edits |
| 15 | Knight, Freebooter, Warden | LUNGE, RUN THROUGH, THE LUNGE | Same word, different moves | Rename Freebooter's to CUTLASS THROUGH (or THE RAKE) and Knight's active to FENCER'S LUNGE (or keep and rename the Warden's dodge). | S | none |
| 16 | Knight, Geomancer, Paladin | BULWARK, AFTERSHOCK | Two names shared across heroes | Rename Geomancer's to KEYSTONE and STONEFALL RECOIL. | S | none |
| 17 | Death Knight | **ICONS FIXED, ids not renamed.** LONG REACH, THE SECOND VOLLEY, DEATH COIL | Scythe glyph and "scythe thrown" ids on a greatsword hero | Move both passives to the sword glyph; rename the internal id (with `RENAMED_SKILLS` in `src/progression.js`) only if you want the code to read cleanly. | S | saves (id rename needs migration) |
| 18 | Freebooter | **FIXED.** DEEP POCKETS, NO QUARTER | Descriptions say "purse"; the code fills the plunder bar | Say "plunder bar" in the descriptions. | S | none |
| 19 | Geomancer | **FIXED.** BULWARK | Description omits that a smashed STONE WALL survives once | Add the second half to the description. | S | none |
| 20 | Paladin | **FIXED.** CONSECRATE | Text says foes burn with holy fire; only wights do | Reword to a holy damage tick (or implement the burn if kept). | S | none |
| 21 | Pyromancer | **PARTLY WRONG (section 0).** STOKE, KINDLE | STOKE text says heat comes back too (code only refunds wind); PYRO_ICONS.kindle is never displayed | Fix the text; delete or use the kindle icon. | S | none |
| 22 | All | growth nodes | Silent level-12 and level-24 stat bumps never appear in a list | Show them in the PASSIVES ladder at levels 12 and 24, or fold them into `growthAt`. | S | none |
| 23 | Death Knight | 8 passives depending on SUMMON SKELETON etc. | Do nothing unless the active is owned | Already shown by `SKILL_NEEDS`; acceptable. Only revisit if new players report dead passives. | S | none |

## 5. What I could not verify

- I did not play the game or run any check (no tests, no `tools/ability-poses.mjs`, no probes); every verdict is from reading code, so tuning judgements (damage, cost, cooldowns) are not made here.
- I did not open every pixel icon or pose frame; icon comments compare the glyph tables and id mapping, not the art itself.
- About 25 passive descriptions were spot-checked against code (the ones that looked doubtful); the rest I trusted because each id is read by a `tal()` call whose surrounding comment matches the description. A description can still be off in a number or an edge case.
- Whether the "one word per skill" pass in `4886d8e` fully removed all duplicate visible names in the store (I found the collisions listed in section 3 only).
- Co-op behaviour: passives read `tal()` through `hero()`, and I did not trace what a second player's loadout reads.
- Save migration effects of the id renames suggested in items 15 to 17 (they need a `RENAMED_SKILLS` entry in `src/progression.js`).
- I have not compared against the design briefs in `docs/briefs/hero-kits.md` or `docs/briefs/geomancer.md`; some borrowings (the Geomancer's ward) are intentional there.
