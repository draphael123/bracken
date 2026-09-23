// src/marks.js — THE MARK OVER A WINDUP, in one place.
//
// Over a creature's head there are exactly two marks and they answer one question, can I block this: a yellow !
// the shield turns it, a red !! nothing turns it, and a windup that throws no blow wears no mark at all (rule H).
// The mark the creature CALLS as it starts is typed at the tell site and audited by tools/tells.mjs. The mark that
// STAYS over it for the whole windup was drawn by drawWorld, and drawWorld drew a yellow ! over every windup in the
// game: over every red !! slam, over a priest's rite that strikes nobody, over the drain. The audit and the screen
// disagreed, and the screen was the one the player reads.
//
// Now there is one table. tools/tells.mjs follows every windup to the blow behind it and WRITES the table below
// (node tools/tells.mjs --write); drawWorld reads it; and the audit fails when the table is not what it would write,
// so the screen and the audit cannot disagree again. The hand-kept parts are the three lists the audit cannot work
// out for itself: the blows thrown by something else, the windups that throw nothing, and the creatures written
// inline in updateEnemies, whose windups are if-chains the audit cannot follow.

// THE HONESTY LIST. A windup whose blow is not thrown by the creature at all - the Forgemaster does not
// strike you, he HURLS A CART, and the cart is a mover that does its own unblockable damage somewhere else.
export const THROWN = new Set(['updateForgemaster|hurlTell', 'updateForgemaster|dragTell',
  'updateTippler|heaveTell',        /* THE TIPPLER heaves the bar and a SKIP OF ORE goes over: falling rock, thrown by nobody, and no shield turns it */
  'updateCaptain|shootTell',        // capShoot: a shot seed, unblockable
  'updateCaptain|kegTell',          // the keg: a bomb, and a blast turns on no shield
  'updateTollmaster|tollTell',      // lead on a chain: noBlock
  'updateForgemaster|anvilTell',    // hammer rocks: no shield turns the roof
  'updateForgemaster|breathTell',   // fires: the flame on the floor is unblockable
  'updatePyromancer|wallTell',      // THE FIRE WALL: five flames marching along the floor, and floor fire is unblockable
  'updateGQueen|chandTell',         // the chandelier: a crush
  'updateGrandmother|throwTell',    // her sticks fly noBlock
  'updateHillTroll|ripTell',        // a crane stone, rolled along the floor: no shield turns it
  'updateHerald|raise',             // THE TIDE HERALD'S WAVE: heraldWave crosses the square on its own, unblockable
  'updateStrawKing|baleTell',       // THE SCARECROW KING'S BALE rolls along the floor on its own, unblockable
  'updateStrawKing|lanternTell',    // his lantern, thrown: fire on landing, unblockable
  'updateHomunculus|poundTell',     // THE HOMUNCULUS'S POUND: a wave along the floor each way, unblockable
  'updateHomunculus|flaskTell',     // THE HOMUNCULUS'S FLASK: the glass breaks where the ring was and leaves acid, unblockable
  'updateArchmage|slamTell']);      // THE FAMILIAR'S SLAM: the same wave, the size of the room

// THE QUIET WINDUPS. A tell that throws NO blow at all - she listens, he calls, the square floods - wears no
// mark: a mark is a promise about your shield, and there is nothing here for the shield to do.
export const QUIET = new Set(['updateTollmaster|floodTell', 'updateTollmaster|darkTell', 'updateLampreeve|snuffTell',
  'updateHerald|callTell', 'updateMiner|smashTell', 'updateWindcaller|howlTell', 'updatePropman|setTell',
  'updateForgemaster|leapTell', 'updateGolem|shroudTell', 'updateGQueen|gLeapTell', 'updateRoc|gustTell',
  'updateGrandmother|listenTell', 'updateGrandmother|vanishTell', 'updateLance|galeTell', 'updateSnuffer|snuffTell',
  'updateMaster|whistleTell', 'updateWhipper|whistleTell',   // the whistle throws no blow: the dogs it calls bite for themselves
  'updatePrince|callTell',          // the Buried Prince calls his court: the courtiers rake for themselves, on their own yellow marks
  'updateRam|callTell',             // the Ram Lord calls the flock: the goats run for themselves
  'updateStrawKing|callTell',       // the Scarecrow King calls the rooks: each marks its own dive
  'updateStrawKing|lightTell',      // he lights the field: the fire is on the floor, and it throws no blow
  'updateArchmage|blinkTell', 'updateArchmage|wardTell', 'updateArchmage|openTell',   // THE ARCHMAGE blinks away, raises his runes, and the familiar lowers its head: none of them a blow
  'updateKraken|lookTell',          // THE KRAKEN COMES UP TO LOOK: the sea stands up behind the end of the road and he rises there, and his arms lie still. An OPENING, not a blow - there is nothing here for a shield to do
  'updateHorn|tell',                // THE HORN is a gust, not a blow: it shoves you, it cuts nobody, and a shield does nothing about wind
  'updateEliteRule|rallyTell', 'updateEliteRule|wallTell', 'updateEliteRule|callTell',   // AN ELITE'S war cry, shield wall and call: the foes it rallies, covers or calls strike on their own marks
  'updateEliteShield|elWallTell',   // THE SHIELD CAPTAIN'S WALL: shields up round him, and nobody struck
  'updateEliteBrute|elCryTell',     // THE GOBLIN CAPTAIN'S WAR CRY: his goblins strike faster, and he strikes nobody
  'updateGobPriest|riteTell',       // THE GOBLIN PRIEST'S RITE mends and blesses its own side and touches nobody: it says THE RITE, not a mark
  'updateGraveWarden|tollTell',
  'updatePyromancer|wispTell']);   /* THE PYROMANCER CALLS A WISP: it drifts off and burns whoever it touches on its own account, and he strikes nobody. A mark is a promise about your shield, and there is nothing here for the shield to do */   // THE GRAVE WARDEN TOLLS: the dead climb out and strike on their own marks; the bell strikes nobody     // THE GOBLIN PRIEST'S RITE mends and blesses its own side and touches nobody: it says THE RITE, not a mark

// BY HAND: THE CREATURES WRITTEN INLINE IN updateEnemies. Their windups are if-chains, not a switch, so the audit
// cannot follow them to the blow; each row here was read off the code, and the audit still checks it against the mark
// the creature calls where it calls one. 'type|mode' -> '!' | '!!' | '' ('draw' is the archer's bow, e.draw > 0.3).
export const BY_HAND = {
  'corpse|cutTell':'!','corpse|riseTell':'','bannerbearer|plantTell':'','bannerbearer|poleTell':'!',   /* THE UNBURIED FIELD (unburied-foes.js, by hand): a dead man's cut and the standard's pole a shield turns; rising and planting strike nobody */
  'standardbearer|sweepTell':'!','standardbearer|bashTell':'!','standardbearer|chargeTell':'!!','standardbearer|plantTell':'',   /* THE STANDARD-BEARER: the pole a shield turns, the lowered banner at the ankles nothing does, the plant strikes nobody */
  'deathknight|swatheTell':'!!','deathknight|reapTell':'!!','deathknight|passTell':'!!','deathknight|cutTell':'!','deathknight|raiseTell':'',   /* THE FIRST DEATH KNIGHT: the swathe, the reaping and the mark answered with the feet; the short cut guarded; the raise strikes nobody */
 'bellguard|vaultHookTell':'!', 'bellguard|vaultSpearTell':'!', 'bellguard|vaultRingTell':'!!', 'bellguard|vaultPressureTell':'!!', 'bellguard|vaultBandTell':'!!',
  'tidemarauder|thrustTell':'!','tidemarauder|castTell':'!','tidemarauder|reelThrust':'!','tidemarauder|undertowTell':'!!',   /* THE TIDE REAVER (tide-reaver.js, by hand): the thrust, the cast and the thrust after the reel a shield turns; the rake and the wave nothing does */
  'hedgewarden|cutTell':'!','hedgewarden|rushTell':'!','hedgewarden|thornTell':'!!',   /* THE HEDGE WARDEN (hedge-warden.js, by hand): the cut and the rush a shield turns; the thorns nothing does */
  'broom|sweepTell':'!',
  'winchmaster|reverseTell':'','winchmaster|sendTell':'!!','winchmaster|hookTell':'!!','winchmaster|leverTell':'!',   /* THE WINCHMASTER (winchmaster.js, by hand): the send and the hook no shield turns, the brake bar it does, and the reverse throws no blow so it is QUIET */
  'abbot|censerTell':'!','abbot|castTell':'!','abbot|processTell':'!!','abbot|coalsTell':'!!','abbot|knellTell':'!!','abbot|riteTell':'',   /* THE FALSE ABBOT (false-abbot.js, by hand: a module-file boss the audit cannot follow): the censer and the chain a shield turns; the procession, the coals and the knell nothing does; the rite throws no blow at all */
  'tome|tell':'!',   /* THE TOME (tome.js, by hand: a module-file foe the audit cannot follow): the dart is a blow, and the shield does not just turn it - it SHUTS the book */
  'gargoyle|diveTell':'!!','gargoyle|gustTell':'!','gargoyle|spitTell':'!','gargoyle|flareTell':'!!',   /* THE GATE GARGOYLE (gate-gargoyle.js, by hand): the dive and the flare wear the red cross; the gust and the spit a shield turns */   /* THE WITCHLIGHT STAIR's aqueduct broom (sweepBroom, by hand): a sweep at the ankles a shield braces against */
  'gravewarden|cleaveTell':'!','gravewarden|tossTell':'!','gravewarden|swingTell':'!!','gravewarden|digTell':'!!','gravewarden|tollTell':'',   /* THE GRAVE WARDEN (grave-warden.js, by hand like the Archmage): spade and dirt a shield turns; the lantern and the hand nothing does; the toll strikes nobody */
  'undeadmage|fireTell':'!','undeadmage|iceTell':'!','undeadmage|stormTell':'!!','undeadmage|poisonTell':'!','undeadmage|handTell':'!','undeadmage|markTell':'!!','burieddead|clawTell':'!!','burieddead|slamTell':'!!','burieddead|cleaveTell':'!','burieddead|callTell':'','burieddead|sinkTell':'','burieddead|eruptTell':'!!','zombie|riseTell':'','zombie|grabTell':'!',
  'harbormaster|anchorTell': '!', 'harbormaster|harpoonTell': '!', 'harbormaster|lowTell': '!!', 'harbormaster|highTell': '!!', 'harbormaster|pressureTell': '!!', 'harbormaster|twinTell': '!!',
  'bosun|salvagePinTell':'!', 'bosun|salvageHookTell':'!', 'bosun|salvageCargoTell':'!!', 'bosun|salvageBroadsideTell':'!!', 'bosun|salvageCrossfireTell':'!!',
  'mother|sporeVolleyTell': '!', 'mother|floorSurgeTell': '!!', 'mother|sporeSweepTell': '!!', 'mother|rootColumnsTell': '!!', 'mother|sporeWheelTell': '!',
  'brute|raise': '!!',       // the overhead: damagePlayer(DMG.bruteOver, { unblockable: true })
  'brute|wind': '!',         // the sweep: a plain damagePlayer, and it can be blocked
  'pike|tell': '!',          // the thrust: blocked, it staggers the pike
  'archer|draw': '!',        // an arrow: a seed the shield turns
  'sprig|biteTell': '!',     // the bite: a plain damagePlayer
  'shield|shoveTell': '!',   // the shove: a plain damagePlayer, blocked it only pushes
  'thorn|wind': '!',         // the charge: contact damage the shield turns
  'wasp|stingTell': '!',     // the river wasp's dart: a shield turns it
  'sailer|sail': '!',        // (updateSailer, not inline, but an if-chain) the big sailer under canvas: blocked, she spills
};

// GENERATED by node tools/tells.mjs --write. Do not edit by hand: the audit fails when this is not what it writes.
// 'type|mode' -> '!' (a shield turns it) | '!!' (nothing does) | '' (not a blow). '*|mode' is any elite's own move.
/* MARK:BEGIN */
export const MARK = {
  '*|callTell': '', '*|eliteLungeTell': '!', '*|eliteSlamTell': '!!', '*|rallyTell': '', '*|wallTell': '', 'abbot|castTell': '!',
  'abbot|censerTell': '!', 'abbot|coalsTell': '!!', 'abbot|knellTell': '!!', 'abbot|processTell': '!!', 'abbot|riteTell': '', 'angler|biteTell': '!',
  'angler|castTell': '!', 'angler|dive': '!', 'angler|hookTell': '!', 'angler|swellTell': '!', 'archer|draw': '!', 'archer|elVolleyTell': '!!',
  'archmage|blinkTell': '', 'archmage|boltTell': '!', 'archmage|openTell': '', 'archmage|rendTell': '!!', 'archmage|slamTell': '!!', 'archmage|spitTell': '!',
  'archmage|swipeTell': '!', 'archmage|wardTell': '', 'armour|swingTell': '!', 'assassin|markTell': '!!', 'assassin|stabTell': '!', 'badger|chargeTell': '!',
  'bannerbearer|plantTell': '', 'bannerbearer|poleTell': '!', 'bellcrab|ballastTell': '!!', 'bellcrab|clawTell': '!', 'bellcrab|pressureTell': '!', 'bellcrab|scuttleTell': '!!',
  'bellguard|hookTell': '!', 'bellguard|knellTell': '!!', 'bellguard|vaultBandTell': '!!', 'bellguard|vaultHookTell': '!', 'bellguard|vaultPressureTell': '!!', 'bellguard|vaultRingTell': '!!',
  'bellguard|vaultSpearTell': '!', 'berserker|flailTell': '!', 'berserker|windTell': '!!', 'boarder|shootTell': '!', 'boarder|slashTell': '!', 'boarder|swingTell': '!',
  'boarder|throwTell': '!', 'bonecorsair|cleaveTell': '!!', 'bonecorsair|cutTell': '!', 'bonegob|throw': '!', 'bosun|salvageBroadsideTell': '!!', 'bosun|salvageCargoTell': '!!',
  'bosun|salvageCrossfireTell': '!!', 'bosun|salvageHookTell': '!', 'bosun|salvagePinTell': '!', 'bosun|shootTell': '!', 'bosun|slashTell': '!', 'bosun|swingTell': '!',
  'bosun|throwTell': '!', 'broom|dashTell': '!', 'broom|sweepTell': '!', 'brute|elCryTell': '', 'brute|elCut1Tell': '!', 'brute|elCut2Tell': '!',
  'brute|elOverTell': '!!', 'brute|raise': '!!', 'brute|wind': '!', 'burieddead|callTell': '', 'burieddead|clawTell': '!!', 'burieddead|cleaveTell': '!',
  'burieddead|eruptTell': '!!', 'burieddead|sinkTell': '', 'burieddead|slamTell': '!!', 'burngob|swingTell': '!', 'captain|hookTell': '!', 'captain|kegTell': '!!',
  'captain|sabreTell': '!', 'captain|shootTell': '!!', 'chief|bashWind': '!!', 'chief|crouch': '!!', 'chief|rainAim': '!', 'chief|raise': '!!',
  'chief|slashWind': '!', 'chief|whirlWind': '!', 'chief|wind': '!', 'closedhelm|bashTell': '!!', 'closedhelm|cutTell': '!', 'closedhelm|judgeTell': '!',
  'closedhelm|oathTell': '!!', 'closedhelm|radianceTell': '!!', 'closedhelm|thrustTell': '!', 'corpse|cutTell': '!', 'corpse|riseTell': '', 'courtier|clawTell': '!',
  'crab|lungeTell': '!', 'crab|pinchTell': '!', 'crab|snapTell': '!', 'crab|strikeTell': '!', 'crab|thrustTell': '!', 'crossbow|aim': '!',
  'crossbow|cutTell': '!', 'crossbow|leapTell': '!!', 'crossbow|shout': '!', 'crossbow|stabTell': '!', 'crossbow|swingTell': '!', 'cutlass|shootTell': '!',
  'cutlass|slashTell': '!', 'cutlass|swingTell': '!', 'cutlass|throwTell': '!', 'cutter|raise': '!', 'deathknight|cutTell': '!', 'deathknight|passTell': '!!',
  'deathknight|raiseTell': '', 'deathknight|reapTell': '!!', 'deathknight|swatheTell': '!!', 'drownedking|anchorTell': '!', 'drownedking|debtTell': '!', 'drownedking|diveTell': '!!',
  'drownedking|gulpTell': '!!', 'drownedking|haulTell': '!', 'drownedking|ramTell': '!!', 'drownedking|slamTell': '!!', 'drownedking|whirlTell': '!!', 'drunk|bottleTell': '!!',
  'drunk|lobTell': '!', 'eel|leapTell': '!', 'eel|lungeTell': '!', 'eel|pinchTell': '!', 'eel|snapTell': '!', 'eel|strikeTell': '!',
  'eel|thrustTell': '!', 'familiar|slamTell': '!!', 'familiar|spitTell': '!', 'familiar|swipeTell': '!', 'familiar|walk': '!', 'farmhand|swingTell': '!',
  'feeler|lashTell': '!', 'fledgling|peckTell': '!', 'forgemaster|anvilTell': '!!', 'forgemaster|bellowsTell': '!', 'forgemaster|breathTell': '!!', 'forgemaster|dragTell': '!!',
  'forgemaster|dropTell': '!!', 'forgemaster|hurlTell': '!!', 'forgemaster|ladleTell': '!!', 'forgemaster|leapTell': '', 'forgemaster|pourTell': '!!', 'forgemaster|slamTell': '!!',
  'forgemaster|sprayTell': '!', 'forgemaster|tongsTell': '!', 'forgemaster|whirlTell': '!!', 'frog|crouch': '!', 'frog|inhaleTell': '!', 'frog|tongueTell': '!',
  'gaffer|haftTell': '!', 'gaffer|hookTell': '!!', 'gargoyle|diveTell': '!!', 'gargoyle|flareTell': '!!', 'gargoyle|gustTell': '!', 'gargoyle|spitTell': '!',
  'gar|lungeTell': '!', 'goat|charge': '!', 'gobmage|boltTell': '!', 'gobmage|runeTell': '!!', 'gobpriest|riteTell': '', 'golem|shroudTell': '',
  'golem|stompTell': '!!', 'golem|sweepTell': '!!', 'golem|throwTell': '!', 'gqueen|chandTell': '!!', 'gqueen|chargeTell': '!!', 'gqueen|crownTell': '!',
  'gqueen|decreeTell': '!', 'gqueen|gDropTell': '!!', 'gqueen|gLeapTell': '', 'gqueen|leapTell': '!!', 'gqueen|sceptreTell': '!', 'gqueen|shadowTell': '!!',
  'gqueen|slamTell': '!!', 'gqueen|slateTell': '!', 'gqueen|sweepTell': '!!', 'grandmother|feelTell': '!', 'grandmother|fireTell': '!', 'grandmother|listenTell': '',
  'grandmother|sweepTell': '!', 'grandmother|throwTell': '!!', 'grandmother|vanishTell': '', 'gravewarden|cleaveTell': '!', 'gravewarden|digTell': '!!', 'gravewarden|swingTell': '!!',
  'gravewarden|tollTell': '', 'gravewarden|tossTell': '!', 'grub|spit': '!', 'harbormaster|anchorTell': '!', 'harbormaster|harpoonTell': '!', 'harbormaster|highTell': '!!',
  'harbormaster|lowTell': '!!', 'harbormaster|pressureTell': '!!', 'harbormaster|twinTell': '!!', 'hare|run': '!', 'harpy|aim': '!', 'haunt|throwTell': '!',
  'hearthgob|raise': '!', 'heavy|grabTell': '!!', 'heavy|raise': '!!', 'heavy|slashTell': '!', 'heavy|windUp': '!', 'hedgeknight|aim': '!',
  'hedgeknight|cutTell': '!', 'hedgeknight|leapTell': '!!', 'hedgeknight|shout': '!', 'hedgeknight|stabTell': '!', 'hedgeknight|swingTell': '!', 'hedgewarden|cutTell': '!',
  'hedgewarden|rushTell': '!', 'hedgewarden|thornTell': '!!', 'herald|callTell': '', 'herald|glideTell': '!!', 'herald|hurlTell': '!', 'herald|maelTell': '!',
  'herald|raise': '!!', 'herald|spearTell': '!', 'herald|sweepTell': '!!', 'herald|thrustTell': '!', 'heronfoe|lungeTell': '!', 'heronfoe|pinchTell': '!',
  'heronfoe|snapTell': '!', 'heronfoe|strikeTell': '!', 'heronfoe|thrustTell': '!', 'homunculus|flaskTell': '!!', 'homunculus|pounceTell': '!', 'homunculus|poundTell': '!!',
  'homunculus|scuttleTell': '!!', 'homunculus|swipeTell': '!', 'horn|tell': '', 'horn|whistleTell': '', 'imp|throwTell': '!', 'javelin|grabTell': '!!',
  'javelin|raise': '!!', 'javelin|slashTell': '!', 'javelin|windUp': '!', 'jelly|biteTell': '!', 'jelly|castTell': '!', 'jelly|dive': '!',
  'jelly|hookTell': '!', 'jelly|swellTell': '!', 'king|cageTell': '!!', 'king|chargeTell': '!!', 'king|grabTell': '!!', 'king|liftTell': '!!',
  'king|shoutTell': '!!', 'king|slamTell': '!!', 'kraken|geyserTell': '!!', 'kraken|grabTell': '!!', 'kraken|hurlTell': '!!', 'kraken|jetTell': '!!',
  'kraken|lookTell': '', 'kraken|lungeTell': '!!', 'kraken|orbTell': '!', 'kraken|rakeTell': '!!', 'kraken|roarTell': '!!', 'kraken|rollTell': '!!',
  'kraken|slamTell': '!', 'kraken|sweepTell': '!!', 'lampreeve|drawTell': '!', 'lampreeve|hookTell': '!', 'lampreeve|snuffTell': '', 'lampreeve|sweepTell': '!',
  'lancer|chargeTell': '!', 'lancer|cutTell': '!', 'lancer|swipeTell': '!', 'lance|bashTell': '!!', 'lance|couch': '!!', 'lance|galeTell': '',
  'lance|guardTell': '!', 'lance|javTell': '!', 'lance|rushTell': '!', 'lance|sweepTell': '!!', 'lance|thrustTell': '!', 'lance|vaultTell': '!',
  'lance|whirlTell': '!!', 'lanternshade|flareTell': '!', 'leadfoot|anchorTell': '!!', 'leadfoot|plantTell': '!', 'leadfoot|sweepTell': '!', 'lookout|shootTell': '!',
  'lookout|slashTell': '!', 'lookout|swingTell': '!', 'lookout|throwTell': '!', 'manta|diveTell': '!', 'marine|shootTell': '!', 'marine|slashTell': '!',
  'marine|swingTell': '!', 'marine|throwTell': '!', 'marshlight|flareTell': '!', 'master|chargeTell': '!', 'master|crackTell': '!', 'master|lashTell': '!',
  'master|leapTell': '!!', 'master|whistleTell': '', 'masthead|boomTell': '!!', 'masthead|dropTell': '!!', 'masthead|sailTell': '!', 'masthead|slashTell': '!',
  'merrowbrute|ramTell': '!', 'merrowcaller|surgeTell': '!!', 'merrowspear|throwTell': '!', 'mimic|biteTell': '!', 'miner|smashTell': '', 'miner|swingTell': '!',
  'miner|throwTell': '!', 'mother|capClapTell': '!!', 'mother|floorSurgeTell': '!!', 'mother|rootColumnsTell': '!!', 'mother|rootFanTell': '!!', 'mother|rootStabTell': '!!',
  'mother|seedRainTell': '!', 'mother|sporeSweepTell': '!!', 'mother|sporeVolleyTell': '!', 'mother|sporeWheelTell': '!', 'netter|biteTell': '!', 'netter|castTell': '!',
  'netter|dive': '!', 'netter|hookTell': '!', 'netter|swellTell': '!', 'owl|fanTell': '!', 'owl|hootTell': '!!', 'owl|riseUp': '!!',
  'owl|screechTell': '!', 'owl|skimTell': '!!', 'petrel|biteTell': '!', 'petrel|castTell': '!', 'petrel|dive': '!', 'petrel|diveTell': '!',
  'petrel|hookTell': '!', 'petrel|swellTell': '!', 'piece|nipTell': '!', 'pike|elSweepTell': '!', 'pike|tell': '!', 'ploughman|chargeTell': '!!',
  'ploughman|goadTell': '!', 'ploughman|headTell': '!', 'prince|callTell': '', 'prince|crownTell': '!', 'prince|cutTell': '!', 'prince|sinkTell': '!!',
  'prince|snuffTell': '!!', 'prise|reachTell': '!', 'propman|raise': '!', 'propman|setTell': '', 'propman|throwTell': '!', 'puffer|biteTell': '!',
  'puffer|castTell': '!', 'puffer|dive': '!', 'puffer|hookTell': '!', 'puffer|swellTell': '!', 'pumpkin|biteTell': '!', 'pumpkin|puffTell': '!!',
  'pyromancer|emberTell': '!', 'pyromancer|jetTell': '!', 'pyromancer|staffTell': '!', 'pyromancer|stepTell': '!', 'pyromancer|ventTell': '!!', 'pyromancer|wallTell': '!!',
  'pyromancer|wispTell': '', 'quarter|shootTell': '!!', 'quarter|slashTell': '!', 'quarter|stanceTell': '!!', 'queen|aim': '!', 'queen|slamHang': '!',
  'ram|buttTell': '!', 'ram|callTell': '', 'ram|leapTell': '!!', 'ram|lower': '!', 'ram|rear': '!', 'ram|stampTell': '!!',
  'ram|tossTell': '!!', 'reefmaw|biteTell': '!', 'reefmaw|riseTell': '!', 'reefmaw|spitTell': '!', 'reefmaw|thrashTell': '!', 'rockgoblin|throw': '!',
  'roc|grabTell': '!!', 'roc|gustTell': '', 'roc|roofTell': '!', 'roc|shedTell': '!', 'roc|shriekTell': '!!', 'roc|talonTell': '!!',
  'rook|diveTell': '!', 'runner|aim': '!', 'runner|cutTell': '!', 'runner|leapTell': '!!', 'runner|shout': '!', 'runner|stabTell': '!',
  'runner|swingTell': '!', 'sailer|sail': '!', 'sailor|biteTell': '!', 'sailor|castTell': '!', 'sailor|dive': '!', 'sailor|hookTell': '!',
  'sailor|swellTell': '!', 'scarecrow|swipeTell': '!', 'scout|lungeTell': '!', 'scout|pinchTell': '!', 'scout|snapTell': '!', 'scout|strikeTell': '!',
  'scout|thrustTell': '!', 'seawitch|callTell': '!!', 'sheargob|cutTell': '!!', 'sheargob|snipTell': '!', 'shield|elChargeTell': '!', 'shield|elWallTell': '',
  'shield|shoveTell': '!', 'siren|lungeTell': '!', 'siren|pinchTell': '!', 'siren|snapTell': '!', 'siren|strikeTell': '!', 'siren|thrustTell': '!',
  'snuffer|snuffTell': '', 'snuffer|swipeTell': '!', 'soldier|grabTell': '!!', 'soldier|raise': '!!', 'soldier|slashTell': '!', 'soldier|windUp': '!',
  'spider|drop': '!', 'spider|dropTell': '!', 'spider|reelTell': '!', 'spider|spitTell': '!', 'sprig|biteTell': '!', 'standardbearer|bashTell': '!',
  'standardbearer|chargeTell': '!!', 'standardbearer|plantTell': '', 'standardbearer|sweepTell': '!', 'stormshaman|callTell': '!!', 'strawking|baleTell': '!!', 'strawking|callTell': '',
  'strawking|forkTell': '!', 'strawking|lanternTell': '!!', 'strawking|leapTell': '!!', 'strawking|lightTell': '', 'strawking|slamTell': '!', 'strawking|sweepTell': '!!',
  'suncatcher|clawTell': '!', 'suncatcher|frostTell': '!!', 'suncatcher|hailTell': '!!', 'suncatcher|shardTell': '!', 'suncatcher|spireTell': '!!', 'swornsword|aim': '!',
  'swornsword|cutTell': '!', 'swornsword|leapTell': '!!', 'swornsword|shout': '!', 'swornsword|stabTell': '!', 'swornsword|swingTell': '!', 'temperer|cutTell': '!',
  'temperer|quenchTell': '!!', 'temperer|shoveTell': '!', 'thorn|wind': '!', 'tideguard|lungeTell': '!', 'tideguard|pinchTell': '!', 'tideguard|snapTell': '!',
  'tideguard|strikeTell': '!', 'tideguard|thrustTell': '!', 'tidemarauder|castTell': '!', 'tidemarauder|harpoonTell': '!', 'tidemarauder|rakeTell': '!!', 'tidemarauder|reelThrust': '!',
  'tidemarauder|thrustTell': '!', 'tidemarauder|undertowTell': '!!', 'tippler|barTell': '!', 'tippler|heaveTell': '!!', 'tollmaster|blackoutTell': '!', 'tollmaster|darkTell': '',
  'tollmaster|ledgerTell': '!', 'tollmaster|rodTell': '!', 'tollmaster|tollTell': '!!', 'tome|tell': '!', 'topiary|swipeTell': '!', 'troll|hurlTell': '!',
  'troll|ripTell': '!!', 'troll|slamTell': '!!', 'troll|swatTell': '!', 'troll|throwTell': '!', 'turret|chargeTell': '!', 'turtle|lungeTell': '!',
  'turtle|pinchTell': '!', 'turtle|snapTell': '!', 'turtle|strikeTell': '!', 'turtle|thrustTell': '!', 'undeadmage|fireTell': '!', 'undeadmage|handTell': '!',
  'undeadmage|iceTell': '!', 'undeadmage|markTell': '!!', 'undeadmage|poisonTell': '!', 'undeadmage|stormTell': '!!', 'urchin|biteTell': '!', 'urchin|castTell': '!',
  'urchin|dive': '!', 'urchin|hookTell': '!', 'urchin|swellTell': '!', 'wasp|stingTell': '!', 'watch|sweepTell': '!', 'watch|thrustTell': '!',
  'winchmaster|hookTell': '!!', 'winchmaster|leverTell': '!', 'winchmaster|reverseTell': '', 'winchmaster|sendTell': '!!', 'windcaller|howlTell': '', 'windcaller|lightningTell': '!!',
  'windcaller|stoneTell': '!', 'windcaller|twisterTell': '!', 'windcaller|wallTell': '!!', 'zombie|grabTell': '!', 'zombie|riseTell': '',
};
/* MARK:END */

const MISSED = new Set();
// THE MARK OVER THIS CREATURE NOW: '!', '!!', or '' for none. A windup with no row wears no mark - and says so once in
// the console, because a windup the table does not know is a hole in the audit, not a quiet tell.
export function markOf(e) {
  const mode = e.t === 'archer' && e.draw > 0.3 && !(typeof e.mode === 'string' && e.mode.endsWith('Tell')) ? 'draw' : e.mode;
  if (e.elite && ('*|' + mode) in MARK) return MARK['*|' + mode];
  const k = e.t + '|' + mode;
  if (k in MARK) return MARK[k];
  if (!MISSED.has(k)) { MISSED.add(k); console.warn('[marks] a windup with no row in src/marks.js: ' + k + ' - it wears no mark'); }
  return '';
}
export const marksMissed = () => [...MISSED];
