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
  'updateGQueen|chandTell',         // the chandelier: a crush
  'updateGrandmother|throwTell',    // her sticks fly noBlock
  'updateHillTroll|ripTell',        // a crane stone, rolled along the floor: no shield turns it
  'updateHerald|raise',             // THE TIDE HERALD'S WAVE: heraldWave crosses the square on its own, unblockable
  'updateStrawKing|baleTell',       // THE SCARECROW KING'S BALE rolls along the floor on its own, unblockable
  'updateStrawKing|lanternTell',    // his lantern, thrown: fire on landing, unblockable
  'updatePloughman|headTell',       // THE PLOUGHMAN'S HEAD (claude/weakboss): a burning seed lobbed onto the ring, noBlock, and it burns where it lands
  'updateHomunculus|poundTell',     // THE HOMUNCULUS'S POUND: a wave along the floor each way, unblockable
  'updateHomunculus|flaskTell',     // THE HOMUNCULUS'S FLASK: the glass breaks where the ring was and leaves acid, unblockable
  'updateArchmage|slamTell',        // THE FAMILIAR'S SLAM: the same wave, the size of the room
  'updateHorn|tell']);              // THE HORN'S GUST (the combat pass, part 2): the wind is the blow, it shoves you toward whatever is behind you, and no shield holds against wind

// THE QUIET WINDUPS. A tell that throws NO blow at all - she listens, he calls, the square floods - wears no
// mark: a mark is a promise about your shield, and there is nothing here for the shield to do.
export const QUIET = new Set(['updateBellcrab|broodTell',   // the rim lifting throws no blow: the brood it pours bites for itself (the prise's own reachTell)
  'updateTollmaster|floodTell', 'updateTollmaster|darkTell', 'updateLampreeve|snuffTell',
  'updateLampreeve|takeTell',       // THE LAMPREEVE TAKES YOUR LIGHT (his phase two, claude/weakboss): the light in your hand goes out, and nobody is struck
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
  'updateEliteRule|rallyTell', 'updateEliteRule|wallTell', 'updateEliteRule|callTell',   // AN ELITE'S war cry, shield wall and call: the foes it rallies, covers or calls strike on their own marks
  'updateEliteShield|elWallTell',   // THE SHIELD CAPTAIN'S WALL: shields up round him, and nobody struck
  'updateEliteBrute|elCryTell',     // THE GOBLIN CAPTAIN'S WAR CRY: his goblins strike faster, and he strikes nobody
  'updateGobPriest|riteTell',       // THE GOBLIN PRIEST'S RITE mends and blesses its own side and touches nobody: it says THE RITE, not a mark (its CENSER and its BELL are blows, each a yellow ! the audit follows for itself)
  'updateGraveWarden|tollTell',
  'updateOwl|ropeTell',             // THE OWL REEVE CUTS THE HOIST (phase two): she saws at a rope, and nobody is struck - it says THE ROPE, not a mark
  ]);   // THE GRAVE WARDEN TOLLS: the dead climb out and strike on their own marks; the bell strikes nobody     // THE GOBLIN PRIEST'S RITE mends and blesses its own side and touches nobody: it says THE RITE, not a mark

// BY HAND: THE CREATURES WRITTEN INLINE IN updateEnemies. Their windups are if-chains, not a switch, so the audit
// cannot follow them to the blow; each row here was read off the code, and the audit still checks it against the mark
// the creature calls where it calls one. 'type|mode' -> '!' | '!!' | '' ('draw' is the archer's bow, e.draw > 0.3).
export const BY_HAND = {
  'waterthief|feintTell':'','waterthief|slashTell':'!',   /* THE WATER-THIEF (claude/welltown, by hand: the cutthroat's machine in desert-foes.js, run by src/well-town-hands.js thiefStep): the feint throws nothing, the cut a shield turns */
  'cisternqueen|pincerTell':'!','cisternqueen|snapTell':'!','cisternqueen|snap2Tell':'!','cisternqueen|lungeTell':'!!','cisternqueen|lanceTell':'!!','cisternqueen|flickTell':'!','cisternqueen|strikeTell':'!!','cisternqueen|chargeTell':'!!','cisternqueen|spitTell':'!','cisternqueen|sweepLowTell':'!!','cisternqueen|sweepHighTell':'!!','cisternqueen|slamTell':'!!','cisternqueen|pinTell':'!!','cisternqueen|pounceTell':'!!','cisternqueen|ambushTell':'!!','cisternqueen|waveTell':'!!','cisternqueen|grabTell':'!!','cisternqueen|rollTell':'!!','cisternqueen|tidalTell':'!!','cisternqueen|barbTell':'!!','cisternqueen|diveTell':'','cisternqueen|climbTell':'','cisternqueen|floodTell':'','cisternqueen|broodTell':'',   /* THE CISTERN QUEEN (claude/welltown3, by hand: src/cistern-queen.js MOVES, a module-file boss the audit cannot follow): her pincers, the sand she flicks and her venom spit a shield turns; the lunge, the lance, the eruption, the dune wave, the tail's sweeps, the rubble, the pin, the pounce, the ambush, the waves, the grab, the roll, the tidal tail and the sting nothing does; her dive, her climb, the flood and the brood's call strike nobody */
  'gangleader|cutTell':'!','gangleader|cut2Tell':'!','gangleader|crossTell':'!','gangleader|whirlTell':'!!','gangleader|throwTell':'!','gangleader|riposteTell':'!!','gangleader|dashTell':'!!','djinn|lashTell':'!','djinn|upsurgeTell':'!!','djinn|blastTell':'!','djinn|devilTell':'!!','djinn|flashTell':'!','djinn|breathTell':'!!','djinn|pillarTell':'!!','djinn|spoutTell':'!!','djinn|waveTell':'!!','djinn|slamTell':'!!','djinn|spearsTell':'!!','djinn|firedevilTell':'!!','djinn|whirlTell':'!!','djinn|spearsTell':'!!','djinn|firedevilTell':'!!','djinn|whirlTell':'!!',   /* THE GANG LEADER (claude/welltown3, by hand: src/gang-leader.js GL_MODES): his cuts, his riposte and his bottle a shield turns (and a blow sends the bottle home); his whirl nothing does */
  'greenteeth|slamTell':'!!','greenteeth|chargeTell':'!!','greenteeth|netTell':'!!','greenteeth|vineTell':'!!',   /* JENNY GREENTEETH (jenny-greenteeth.js, by hand: a module-file boss the audit cannot follow). claude/canal4, THE RAFT DUEL: her four blows - the slam on the deck, her charge under the raft, her weed net, her vine - none of which a shield turns (her grab, lash, reach, bite, tear and surge, and the flood and the fog, went with the lock's machinery) */
  'duneworm|rippleTell':'!!','duneworm|spitTell':'!','duneworm|lungeTell':'!!','duneworm|swallowTell':'!!','duneworm|sweepTell':'!!',   /* THE DUNE WORM (dune-worm.js, by hand: a module-file boss the audit cannot follow). The breach comes up from under you and the swallow opens under you - no shield faces down; the lunge is his whole weight; his spit is grit thrown from the front, and a shield takes grit */
  'cutthroat|feintTell':'','cutthroat|slashTell':'!','slinger|slingTell':'!','slinger|kickTell':'!','ambusher|cutTell':'!',   /* THE CARAVAN'S BANDITS (desert-foes.js, by hand, 2026-09-25): the cutthroat's FEINT throws nothing, so it wears no mark (rule H) - the real cut behind it wears the yellow one; a shield turns a slingstone, a kick and the ambusher's knife */
  'sandworm|lungeTell':'!!',   /* THE SANDWORM (claude/desertfoes, by hand: src/desert-foes2.js on the desert engine): the sand domes on its spot and it comes up there - nothing turns it, be off the spot */
  'kiterider|swoopTell':'!','kiterider|kickTell':'!','roc|diveTell':'!!',   /* THE SKY ROAD (claude/skyroad, by hand: the kite-rider is a CV machine in src/sky-road-hands.js riderStep, the Roc on her eyrie is src/roc-eyrie.js): the swoop and the kick a shield turns; her dive nothing turns */
  'raptor|watch':'!!',   /* THE CLIFF RAPTOR (claude/redgorge, by hand: the vulture's machine run by src/red-gorge-hands.js raptorStep): its stoop on the spot it marked, as the vulture's */
  'gorgecrab|pinchTell':'!','gorgecrab|crushTell':'!!','gorgecrab|boulderTell':'!!','gorgecrab|scuttleTell':'!!',   /* THE GREAT RED CRAB (claude/redgorge, by hand: src/gorge-crab.js on the desert engine) - ! the shield turns the pinch; X move: the crush, the boulder, the scuttle */
  'scorpion|clawTell':'!','scorpion|tailTell':'!!','sandgob|knifeTell':'!','vulture|watch':'!!',   /* THE SUNKEN CARAVAN (desert-foes.js, by hand): the claw and the knife a shield turns; the sting over its back and the vulture's dive nothing does */
  'corpse|cutTell':'!','corpse|riseTell':'','bannerbearer|plantTell':'','bannerbearer|poleTell':'!',   /* THE UNBURIED FIELD (unburied-foes.js, by hand): a dead man's cut and the standard's pole a shield turns; rising and planting strike nobody */
  'barrowrider|rideTell':'!!','barrowrider|trampleTell':'!','barrowrider|fireTell':'!','barrowrider|lanceTell':'!!','barrowrider|thrustTell':'!','barrowrider|remountTell':'',   /* THE BARROW RIDER (2026-09-24, in the Standard-Bearer's place): the ride-through and the lance line no shield turns; the trample, the grave-fire and the thrust it does; the bones crawling back strike nobody */
  'bloodknight|swingTell':'!','bloodknight|cleaveTell':'!','bloodknight|bladeTell':'!!','bloodknight|gripTell':'!!','bloodknight|boilTell':'!!','bloodknight|coilTell':'!','bloodknight|tideTell':'!!','bloodknight|wardTell':'','bloodknight|novaTell':'!!','bloodknight|raiseTell':'','bloodknight|callTell':'','bloodknight|surgeTell':'!!',   /* THE DEATH KNIGHT (claude/dk3, rebuilt from the hero's kit): his cuts, the Cleave and the Coil a shield turns; the bolts, the chain, the boil, the tide, the nova and the surge nothing does; the ward and the raising strike nobody */
  'deathknight|cleaveTell':'!','deathknight|gripTell':'!!','deathknight|boilTell':'!!','deathknight|passTell':'!!','deathknight|wardTell':'','deathknight|novaTell':'!!','deathknight|raiseTell':'','deathknight|callTell':'','deathknight|surgeTell':'!!',   /* THE FIRST DEATH KNIGHT, with the hero's kit (2026-09-24): the cleave guarded; the grip, the boil, the passing, the nova and the surge answered with the feet; the ward, the summon and the gravecall strike nobody */
  'sexton|swingTell':'!','sexton|rushTell':'!','sexton|tollTell':'!!','sexton|dropTell':'!!',   /* THE SEXTON (sexton.js, by hand): the swing and the charge a shield turns; the toll along the deck and the bell off the frame nothing does */
  'hedgewarden|cutTell':'!','hedgewarden|rushTell':'!','hedgewarden|thornTell':'!!','hedgewarden|lashTell':'!','hedgewarden|rootsTell':'!!',   /* THE HEDGE WARDEN (hedge-warden.js, by hand): the cut, the rush and the thorn lash a shield turns; the thorns and the roots nothing does (claude/hedgewarden2: the lash and the roots) */
  'greathound|lungeTell':'!','greathound|pounceTell':'!!','greathound|howlTell':'','greathound|snapTell':'!',   /* THE GREAT HOUND (claude/sweep1, B10: its four windups wore no mark - a tell() helper the audit cannot follow): the lunge and the snap a shield turns, the pounce comes down where you stood, the howl strikes nobody */
  'broom|sweepTell':'!',
  'winchmaster|reverseTell':'','winchmaster|sendTell':'!!','winchmaster|hookTell':'!!','winchmaster|leverTell':'!','winchmaster|leapTell':'!!','winchmaster|descendTell':'!!','winchmaster|whirlTell':'!!','winchmaster|wrenchTell':'!','winchmaster|rideTell':'!!',   /* THE WINCHMASTER (winchmaster.js, by hand): the send and the hook no shield turns, the brake bar it does, and the reverse throws no blow so it is QUIET */
  'abbot|censerTell':'!','abbot|castTell':'!','abbot|processTell':'!!','abbot|coalsTell':'!!','abbot|knellTell':'!!','abbot|riteTell':'',   /* THE FALSE ABBOT (false-abbot.js, by hand: a module-file boss the audit cannot follow): the censer and the chain a shield turns; the procession, the coals and the knell nothing does; the rite throws no blow at all */
  'wickerqueen|tossTell':'!!','wickerqueen|sweepLowTell':'!!','wickerqueen|sweepHighTell':'!!','wickerqueen|leapTell':'!!','wickerqueen|stabTell':'!!','wickerqueen|lashLowTell':'!!','wickerqueen|lashHighTell':'!!','wickerqueen|floorTell':'!!','wickerqueen|thrustHighTell':'!!','wickerqueen|thrustLowTell':'!!','wickerqueen|crownTell':'','wickerqueen|ringTell':'!!',   /* THE WICKER QUEEN (wicker-queen.js, by hand: a module-file boss the audit cannot follow; claude/fair3, the carousel claude/fairboss, her spear claude/fairfix2-spear): no shield turns any of them - her spear stabbed from behind a turned back, her spear thrust high or low along the ride, the ribbons over the whole green, fire under your feet; the crowning calls mummers who strike on their own marks */
  'puppeteer|snareLowTell':'!!','puppeteer|snareHighTell':'!!','puppeteer|dropTell':'!!','marionette|chopTell':'!!','marionette|slamTell':'!!','marionette|grabTell':'!!','harlequin|jabTell':'!','harlequin|kickTell':'!!','masterpiece|swatTell':'!','masterpiece|stompTell':'!!','masterpiece|reachTell':'!!',   /* THE PUPPETEER (puppeteer.js, by hand: a module-file boss the audit cannot follow; claude/puppeteer, PUPPETEER3): his whip is string, and no shield turns string; the masterpiece's swat a shield turns, THE BRUTE's heavy chop, his slam (a shock along the boards) and grab and the masterpiece's stomp and reach nothing does; THE HARLEQUIN's quick jab a shield turns, his low kick nothing does */
  'mummer|lungeTell':'!!',   /* (claude/theatre4) THE THEATRE's VILLAIN MASK: a told red lunge out of the light at the nearest hero - unblockable (src/theatre-masks.js, by hand: main.js theatreMask) */
  'mummer|mimeTell':'!',   /* (claude/fairfix6) THE FAIR's MUMMER MIMES its watcher: his swing answered after a told beat - a yellow blow, the shield turns it */
  'wickerman|throwTell':'!!','wickerman|swingTell':'!',   /* THE WICKER MAN (claude/fairfix6, by hand: src/wicker-man.js on its own hands): its fire is bowled along the ground and no shield turns it - jump it, or strike it back; its arms come down and the shield takes them */
  'tome|tell':'!',   /* THE TOME (tome.js, by hand: a module-file foe the audit cannot follow): the dart is a blow, and the shield does not just turn it - it SHUTS the book */
  'grindylow|rippleTell':'!!','willowisp|flareTell':'!','grindylow|deckTell':'!!','grindylow|boardTell':'!!',   /* THE FOG CANAL (canal-foes.js, by hand: module-file foes the audit cannot follow): no shield turns a hand round your ankle - jump the ring; the wisp's flare a shield turns */
  'gargoyle|diveTell':'!!','gargoyle|fireballTell':'!','gargoyle|breathTell':'!','gargoyle|flareTell':'!!',   /* THE GATE GARGOYLE (gate-gargoyle.js, by hand): the dive and the flare wear the red cross; the fireball (the wing gust's place, 2026-09-28) and the fire breath a shield turns */   /* THE WITCHLIGHT STAIR's aqueduct broom (sweepBroom, by hand): a sweep at the ankles a shield braces against */
  'gravewarden|cleaveTell':'!','gravewarden|tossTell':'!','gravewarden|swingTell':'!!','gravewarden|digTell':'!!','gravewarden|tollTell':'',   /* THE GRAVE WARDEN (grave-warden.js, by hand like the Archmage): spade and dirt a shield turns; the lantern and the hand nothing does; the toll strikes nobody */
  'undeadmage|fireTell':'!','undeadmage|iceTell':'!','undeadmage|stormTell':'!!','undeadmage|poisonTell':'!','undeadmage|handTell':'!','undeadmage|markTell':'!!','undeadmage|bendTell':'!','undeadmage|stepTell':'','undeadmage|decoyTell':'','undeadmage|trapTell':'!',   /* (round 3: the decoy throws nothing of its own, as the step; the trap's bolts are fire a shield turns) (round 2) HIS RINGS: the bent bolts are fire, a shield turns them; the step throws no blow of its own - the spell he comes out casting wears its own mark */
  'undeadmage|orbitTell':'!!','undeadmage|scriptTell':'!!',   /* (claude/archmage3, by hand) HIS ORRERY: no shield turns a world - keep between its orbits; THE GRAVE SCRIPT: nothing turns the lines - fly to the dark one */
  'undeadmage|boneTell':'!!','undeadmage|pullTell':'!!',   /* (claude/archmage2b, by hand) THE BONE STORM: no shield turns a skull - fly out through a gap; THE GRAVE PULL: the void it drags you to hurts, and nothing turns it */
  'undeadmage|realmTell':'','undeadmage|wallTell':'!!','undeadmage|sporeTell':'!!',   /* HIS SPELL REALMS (mage-realms.js, by hand, claude/undead3): the tear throws no blow - the realm it opens tells its own; the fire wall is a sheet of flame and the spores a cloud, and no shield turns either */
  'magechase|fireTell':'!','magechase|iceTell':'!','magechase|markTell':'!!',   /* THE SPIRAL STAIR's chase (spiral-chase.js, by hand): his fight's firebolt and ice a shield turns; his death mark nothing does - step out of the ring */
 'burieddead|clawTell':'!!','burieddead|slamTell':'!!','burieddead|cleaveTell':'!','burieddead|callTell':'','burieddead|sinkTell':'','burieddead|eruptTell':'!!','burieddead|skullTell':'!','burieddead|handsTell':'!!','burieddead|breathTell':'!','zombie|riseTell':'','zombie|grabTell':'!',
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
  /* THE UNTOLD, TOLD (the combat pass, part 2, 2026-09-28): the common foes whose harm came with no windup, inline in updateEnemies */
  'spit|spitTell': '!',        // the spitter fills its cheeks: a seed, and a shield turns a seed
  'hopper|hopTell': '!',       // the hopper squats and swells its throat: the leap is a body blow the shield turns
  'lurker|springTell': '!',    // the lurker's cap lifts: a lunge the shield turns
  'spitcap|swellTell': '!!',   // the spitcap swells: a shield stops the spore and the cloud comes up where it stopped all the same
  'weaver|spitTell': '!',      // the weaver rears: web, and a shield turns web
  'sapper|lightTell': '!!',    // the sapper holds the lit bomb up: a blast, and no shield turns a blast
  'hound|pounceTell': '!!',    // the hound drops on its haunches: the leap goes low, for the legs, under any shield - jump it
  'thief|snatchTell': '!!',    // the thief crouches for the grab: a shield keeps nothing out of a pocket
  'sporeling|biteTell': '!',   // the sporeling sits back: the bite, as the sprig's
  'bonearcher|draw': '!',      // the bone archer IS an archer (t: 'archer', bone: true): his draw is the archer's, and this row is for the tables that read the level's name for him
  'husk|grabTell': '!', 'husk|riseTell': '',   // THE GRAVE HUSK and THE DEAD APPRENTICE are the Burial Caverns' zombie raised elsewhere (buried-dead.js): the same told grab, the
  'archer|bagTell': '!!',   // THE FLYMAN (the Maskwright's Theatre, claude/theatre3: the archer reskinned, main.js flymanStep, by hand): the sandbag over his head - no shield turns a sandbag (his tool is the archer's own draw, a yellow !)
  'stagehand|swingTell': '!!', 'stagehand|dropTell': '!!',   // THE STAGEHAND (the Maskwright's Theatre, src/theatre-foes.js, by hand: a module-file foe): the sandbag swung down in front of him and the one dropped from the flies onto you - no shield turns a sandbag
  'mummer|glow': '!!', 'hobbyhorse|rear': '!!',   // THE HARVEST FAIR (src/mummer.js): both blows come from BEHIND a hero with his back turned, so no shield turns either (unblockable): the answer to the mask's glow is to LOOK (it cancels), to the horse's rear to jump the charge
  'stringjack|jerk': '!', 'barker|caneTell': '!', 'barker|callTell': '',   // THE HARVEST FAIR's new pair (claude/fairfix, src/fair-foes.js): the marionette cuts only while it is LOOKED AT, so the hero faces it and the shield turns the cut; the barker's cane is a plain swing the shield turns; his CALL throws no blow (it turns you round: told by the trumpet, the rings and the horn, no mark)
  'apprentice|grabTell': '!', 'apprentice|riseTell': '', 'apprentice|castTell': '!',   // same rise that strikes nobody, and the apprentice's ember (a seed a shield turns). They wore no mark: their rows were missing
};

// GENERATED by node tools/tells.mjs --write. Do not edit by hand: the audit fails when this is not what it writes.
// 'type|mode' -> '!' (a shield turns it) | '!!' (nothing does) | '' (not a blow). '*|mode' is any elite's own move.
/* MARK:BEGIN */
export const MARK = {
  '*|callTell': '', '*|eliteLungeTell': '!', '*|eliteSlamTell': '!!', '*|rallyTell': '', '*|wallTell': '', 'abbot|castTell': '!',
  'abbot|censerTell': '!', 'abbot|coalsTell': '!!', 'abbot|knellTell': '!!', 'abbot|processTell': '!!', 'abbot|riteTell': '', 'ambusher|cutTell': '!',
  'angler|biteTell': '!', 'angler|castTell': '!', 'angler|dive': '!', 'angler|hookTell': '!', 'angler|swellTell': '!', 'apprentice|castTell': '!',
  'apprentice|grabTell': '!', 'apprentice|riseTell': '', 'archer|bagTell': '!!', 'archer|draw': '!', 'archer|elVolleyTell': '!!', 'archmage|blinkTell': '',
  'archmage|boltTell': '!', 'archmage|booksTell': '!', 'archmage|crushTell': '!!', 'archmage|glyphTell': '!!', 'archmage|openTell': '', 'archmage|pairTell': '!!',
  'archmage|rendTell': '!!', 'archmage|slamTell': '!!', 'archmage|spitTell': '!', 'archmage|swipeTell': '!', 'archmage|wardTell': '', 'armour|swingTell': '!',
  'assassin|markTell': '!!', 'assassin|stabTell': '!', 'badger|chargeTell': '!', 'bale|rollTell': '!!', 'bannerbearer|plantTell': '', 'bannerbearer|poleTell': '!',
  'barker|callTell': '', 'barker|caneTell': '!', 'barrowrider|fireTell': '!', 'barrowrider|lanceTell': '!!', 'barrowrider|remountTell': '', 'barrowrider|rideTell': '!!',
  'barrowrider|thrustTell': '!', 'barrowrider|trampleTell': '!', 'bellcrab|ballastTell': '!!', 'bellcrab|broodTell': '', 'bellcrab|clawTell': '!', 'bellcrab|leapTell': '!',
  'bellcrab|pressureTell': '!', 'bellcrab|scuttleTell': '!!', 'bellcrab|snipTell': '!', 'bellguard|hookTell': '!', 'bellguard|knellTell': '!!', 'berserker|flailTell': '!',
  'berserker|windTell': '!!', 'bloodknight|bladeTell': '!!', 'bloodknight|boilTell': '!!', 'bloodknight|callTell': '', 'bloodknight|cleaveTell': '!', 'bloodknight|coilTell': '!',
  'bloodknight|gripTell': '!!', 'bloodknight|novaTell': '!!', 'bloodknight|raiseTell': '', 'bloodknight|surgeTell': '!!', 'bloodknight|swingTell': '!', 'bloodknight|tideTell': '!!',
  'bloodknight|wardTell': '', 'boarder|shootTell': '!', 'boarder|slashTell': '!', 'boarder|swingTell': '!', 'boarder|throwTell': '!', 'bonearcher|draw': '!',
  'bonecorsair|cleaveTell': '!!', 'bonecorsair|cutTell': '!', 'bonegob|throw': '!', 'boo|swoopTell': '!!', 'bosun|salvageBroadsideTell': '!!', 'bosun|salvageCargoTell': '!!',
  'bosun|salvageCrossfireTell': '!!', 'bosun|salvageHookTell': '!', 'bosun|salvagePinTell': '!', 'bosun|shootTell': '!', 'bosun|slashTell': '!', 'bosun|swingTell': '!',
  'bosun|throwTell': '!', 'broom|dashTell': '!', 'broom|sweepTell': '!', 'brute|elCryTell': '', 'brute|elCut1Tell': '!', 'brute|elCut2Tell': '!',
  'brute|elOverTell': '!!', 'brute|raise': '!!', 'brute|wind': '!', 'burieddead|breathTell': '!', 'burieddead|callTell': '', 'burieddead|clawTell': '!!',
  'burieddead|cleaveTell': '!', 'burieddead|eruptTell': '!!', 'burieddead|handsTell': '!!', 'burieddead|sinkTell': '', 'burieddead|skullTell': '!', 'burieddead|slamTell': '!!',
  'burngob|swingTell': '!', 'captain|hookTell': '!', 'captain|kegTell': '!!', 'captain|sabreTell': '!', 'captain|shootTell': '!!', 'chief|aim': '!',
  'chief|bashWind': '!!', 'chief|crouch': '!!', 'chief|rainAim': '!', 'chief|raise': '!!', 'chief|slashWind': '!', 'chief|whirlWind': '!',
  'chief|wind': '!', 'cisternqueen|ambushTell': '!!', 'cisternqueen|barbTell': '!!', 'cisternqueen|broodTell': '', 'cisternqueen|chargeTell': '!!', 'cisternqueen|climbTell': '',
  'cisternqueen|diveTell': '', 'cisternqueen|flickTell': '!', 'cisternqueen|floodTell': '', 'cisternqueen|grabTell': '!!', 'cisternqueen|lanceTell': '!!', 'cisternqueen|lungeTell': '!!',
  'cisternqueen|pinTell': '!!', 'cisternqueen|pincerTell': '!', 'cisternqueen|pounceTell': '!!', 'cisternqueen|rollTell': '!!', 'cisternqueen|slamTell': '!!', 'cisternqueen|snap2Tell': '!',
  'cisternqueen|snapTell': '!', 'cisternqueen|spitTell': '!', 'cisternqueen|strikeTell': '!!', 'cisternqueen|sweepHighTell': '!!', 'cisternqueen|sweepLowTell': '!!', 'cisternqueen|tidalTell': '!!',
  'cisternqueen|waveTell': '!!', 'clinger|dropTell': '!!', 'closedhelm|bashTell': '!!', 'closedhelm|cutTell': '!', 'closedhelm|judgeTell': '!', 'closedhelm|leapTell': '!!',
  'closedhelm|oathTell': '!!', 'closedhelm|radianceTell': '!!', 'closedhelm|thrustTell': '!', 'corpse|cutTell': '!', 'corpse|riseTell': '', 'courtier|clawTell': '!',
  'crab|lungeTell': '!', 'crab|pinchTell': '!', 'crab|shockTell': '!!', 'crab|snapTell': '!', 'crab|strikeTell': '!', 'crab|thrustTell': '!',
  'crossbow|aim': '!', 'crossbow|cutTell': '!', 'crossbow|leapTell': '!!', 'crossbow|shout': '!', 'crossbow|stabTell': '!', 'crossbow|swingTell': '!',
  'crow|diveTell': '!!', 'cutlass|shootTell': '!', 'cutlass|slashTell': '!', 'cutlass|swingTell': '!', 'cutlass|throwTell': '!', 'cutter|raise': '!',
  'cutthroat|feintTell': '', 'cutthroat|slashTell': '!', 'deathknight|boilTell': '!!', 'deathknight|callTell': '', 'deathknight|cleaveTell': '!', 'deathknight|gripTell': '!!',
  'deathknight|novaTell': '!!', 'deathknight|passTell': '!!', 'deathknight|raiseTell': '', 'deathknight|surgeTell': '!!', 'deathknight|wardTell': '', 'djinn|blastTell': '!',
  'djinn|breathTell': '!!', 'djinn|devilTell': '!!', 'djinn|firedevilTell': '!!', 'djinn|flashTell': '!', 'djinn|lashTell': '!', 'djinn|pillarTell': '!!',
  'djinn|slamTell': '!!', 'djinn|spearsTell': '!!', 'djinn|spoutTell': '!!', 'djinn|upsurgeTell': '!!', 'djinn|waveTell': '!!', 'djinn|whirlTell': '!!',
  'drownedcaptain|comboTell': '!', 'drownedcaptain|lungeTell': '!', 'drownedking|anchorTell': '!', 'drownedking|debtTell': '!', 'drownedking|diveTell': '!!', 'drownedking|gulpTell': '!!',
  'drownedking|haulTell': '!', 'drownedking|ramTell': '!!', 'drownedking|slamTell': '!!', 'drownedking|whirlTell': '!!', 'drownedknight|comboTell': '!', 'drownedknight|lungeTell': '!',
  'drunk|bottleTell': '!!', 'drunk|lobTell': '!', 'duneworm|lungeTell': '!!', 'duneworm|rippleTell': '!!', 'duneworm|spitTell': '!', 'duneworm|swallowTell': '!!',
  'duneworm|sweepTell': '!!', 'eel|leapTell': '!', 'eel|lungeTell': '!', 'eel|pinchTell': '!', 'eel|shockTell': '!!', 'eel|snapTell': '!',
  'eel|strikeTell': '!', 'eel|thrustTell': '!', 'emberwisp|flareTell': '!!', 'familiar|slamTell': '!!', 'familiar|spitTell': '!', 'familiar|swipeTell': '!',
  'familiar|walk': '!', 'farmhand|swingTell': '!', 'feeler|lashTell': '!', 'fledgling|peckTell': '!', 'forgemaster|anvilTell': '!!', 'forgemaster|bellowsTell': '!',
  'forgemaster|breathTell': '!!', 'forgemaster|dragTell': '!!', 'forgemaster|dropTell': '!!', 'forgemaster|hurlTell': '!!', 'forgemaster|ladleTell': '!!', 'forgemaster|leapTell': '',
  'forgemaster|pourTell': '!!', 'forgemaster|slamTell': '!!', 'forgemaster|sprayTell': '!', 'forgemaster|tongsTell': '!', 'forgemaster|whirlTell': '!!', 'frog|crouch': '!',
  'frog|inhaleTell': '!', 'frog|spitTell': '!', 'frog|tongueTell': '!', 'gaffer|haftTell': '!', 'gaffer|hookTell': '!!', 'gangleader|crossTell': '!',
  'gangleader|cut2Tell': '!', 'gangleader|cutTell': '!', 'gangleader|dashTell': '!!', 'gangleader|riposteTell': '!!', 'gangleader|throwTell': '!', 'gangleader|whirlTell': '!!',
  'gargoyle|breathTell': '!', 'gargoyle|diveTell': '!!', 'gargoyle|fireballTell': '!', 'gargoyle|flareTell': '!!', 'gar|lungeTell': '!', 'goat|charge': '!',
  'gobmage|boltTell': '!', 'gobmage|runeTell': '!!', 'gobpriest|bellTell': '!', 'gobpriest|censerTell': '!', 'gobpriest|riteTell': '', 'golem|shroudTell': '',
  'golem|stompTell': '!!', 'golem|sweepTell': '!!', 'golem|throwTell': '!', 'gorgecrab|boulderTell': '!!', 'gorgecrab|crushTell': '!!', 'gorgecrab|pinchTell': '!',
  'gorgecrab|scuttleTell': '!!', 'gqueen|chandTell': '!!', 'gqueen|crownTell': '!', 'gqueen|decreeTell': '!', 'gqueen|gDropTell': '!!', 'gqueen|gLeapTell': '',
  'gqueen|hallLeapTell': '!!', 'gqueen|leapTell': '!!', 'gqueen|sceptreTell': '!', 'gqueen|shadowTell': '!!', 'gqueen|slamTell': '!!', 'gqueen|slateTell': '!',
  'gqueen|sweepTell': '!!', 'grandmother|feelTell': '!', 'grandmother|fireTell': '!', 'grandmother|listenTell': '', 'grandmother|sweepTell': '!', 'grandmother|throwTell': '!!',
  'grandmother|vanishTell': '', 'gravewarden|cleaveTell': '!', 'gravewarden|digTell': '!!', 'gravewarden|swingTell': '!!', 'gravewarden|tollTell': '', 'gravewarden|tossTell': '!',
  'greathound|howlTell': '', 'greathound|lungeTell': '!', 'greathound|pounceTell': '!!', 'greathound|snapTell': '!', 'greenteeth|chargeTell': '!!', 'greenteeth|netTell': '!!',
  'greenteeth|slamTell': '!!', 'greenteeth|vineTell': '!!', 'grindylow|boardTell': '!!', 'grindylow|deckTell': '!!', 'grindylow|rippleTell': '!!', 'grub|spit': '!',
  'harbormaster|anchorTell': '!', 'harbormaster|harpoonTell': '!', 'harbormaster|highTell': '!!', 'harbormaster|lowTell': '!!', 'harbormaster|pressureTell': '!!', 'harbormaster|twinTell': '!!',
  'hare|run': '!', 'harlequin|jabTell': '!', 'harlequin|kickTell': '!!', 'harpy|aim': '!', 'haunt|throwTell': '!', 'hearthgob|raise': '!',
  'heavy|grabTell': '!!', 'heavy|raise': '!!', 'heavy|slashTell': '!', 'heavy|windUp': '!', 'hedgeknight|aim': '!', 'hedgeknight|cutTell': '!',
  'hedgeknight|leapTell': '!!', 'hedgeknight|shout': '!', 'hedgeknight|stabTell': '!', 'hedgeknight|swingTell': '!', 'hedgewarden|cutTell': '!', 'hedgewarden|lashTell': '!',
  'hedgewarden|rootsTell': '!!', 'hedgewarden|rushTell': '!', 'hedgewarden|thornTell': '!!', 'herald|callTell': '', 'herald|glideTell': '!!', 'herald|hurlTell': '!',
  'herald|maelTell': '!', 'herald|raise': '!!', 'herald|spearTell': '!', 'herald|sweepTell': '!!', 'herald|thrustTell': '!', 'heronfoe|lungeTell': '!',
  'heronfoe|pinchTell': '!', 'heronfoe|shockTell': '!!', 'heronfoe|snapTell': '!', 'heronfoe|strikeTell': '!', 'heronfoe|thrustTell': '!', 'hobbyhorse|rear': '!!',
  'holdfast|gripTell': '!!', 'homunculus|flaskTell': '!!', 'homunculus|pounceTell': '!', 'homunculus|poundTell': '!!', 'homunculus|scuttleTell': '!!', 'homunculus|swipeTell': '!',
  'hopper|hopTell': '!', 'horn|tell': '!!', 'horn|whistleTell': '', 'hound|pounceTell': '!!', 'husk|grabTell': '!', 'husk|riseTell': '',
  'imp|throwTell': '!', 'javelin|grabTell': '!!', 'javelin|raise': '!!', 'javelin|slashTell': '!', 'javelin|windUp': '!', 'jelly|biteTell': '!',
  'jelly|castTell': '!', 'jelly|dive': '!', 'jelly|hookTell': '!', 'jelly|swellTell': '!', 'king|cageTell': '!!', 'king|chargeTell': '!!',
  'king|grabTell': '!!', 'king|liftTell': '!!', 'king|shoutTell': '!!', 'king|slamTell': '!!', 'kiterider|kickTell': '!', 'kiterider|swoopTell': '!',
  'kite|dropTell': '!', 'kraken|geyserTell': '!!', 'kraken|grabTell': '!!', 'kraken|hurlTell': '!!', 'kraken|jetTell': '!!', 'kraken|lookTell': '',
  'kraken|lungeTell': '!!', 'kraken|orbTell': '!', 'kraken|rakeTell': '!!', 'kraken|roarTell': '!!', 'kraken|rollTell': '!!', 'kraken|slamTell': '!',
  'kraken|sweepTell': '!!', 'lampreeve|drawTell': '!', 'lampreeve|hookTell': '!', 'lampreeve|lungeTell': '!!', 'lampreeve|snuffTell': '', 'lampreeve|sweepTell': '!',
  'lampreeve|takeTell': '', 'lamprey|lungeTell': '!!', 'lancer|chargeTell': '!', 'lancer|cutTell': '!', 'lancer|swipeTell': '!', 'lance|bashTell': '!!',
  'lance|couch': '!!', 'lance|galeTell': '', 'lance|guardTell': '!', 'lance|javTell': '!', 'lance|rushTell': '!', 'lance|sweepTell': '!!',
  'lance|thrustTell': '!', 'lance|vaultTell': '!', 'lance|whirlTell': '!!', 'lanternshade|flareTell': '!', 'lookout|shootTell': '!', 'lookout|slashTell': '!',
  'lookout|swingTell': '!', 'lookout|throwTell': '!', 'lurker|springTell': '!', 'magechase|fireTell': '!', 'magechase|iceTell': '!', 'magechase|markTell': '!!',
  'manta|diveTell': '!', 'marine|shootTell': '!', 'marine|slashTell': '!', 'marine|swingTell': '!', 'marine|throwTell': '!', 'marionette|chopTell': '!!',
  'marionette|grabTell': '!!', 'marionette|slamTell': '!!', 'marshlight|flareTell': '!', 'masterpiece|reachTell': '!!', 'masterpiece|stompTell': '!!', 'masterpiece|swatTell': '!',
  'master|chargeTell': '!', 'master|crackTell': '!', 'master|lashTell': '!', 'master|leapTell': '!!', 'master|whistleTell': '', 'masthead|boomTell': '!!',
  'masthead|dropTell': '!!', 'masthead|sailTell': '!', 'masthead|slashTell': '!', 'merrowbrute|ramTell': '!', 'merrowcaller|surgeTell': '!!', 'merrowspear|throwTell': '!',
  'mimic|biteTell': '!', 'miner|smashTell': '', 'miner|swingTell': '!', 'miner|throwTell': '!', 'mother|capClapTell': '!!', 'mother|floorSurgeTell': '!!',
  'mother|rootColumnsTell': '!!', 'mother|rootFanTell': '!!', 'mother|rootStabTell': '!!', 'mother|seedRainTell': '!', 'mother|sporeSweepTell': '!!', 'mother|sporeVolleyTell': '!',
  'mother|sporeWheelTell': '!', 'mummer|glow': '!!', 'mummer|lungeTell': '!!', 'mummer|mimeTell': '!', 'netter|biteTell': '!', 'netter|castTell': '!',
  'netter|dive': '!', 'netter|hookTell': '!', 'netter|swellTell': '!', 'owl|fanTell': '!', 'owl|hootTell': '!!', 'owl|riseUp': '!!',
  'owl|ropeTell': '', 'owl|screechTell': '!', 'owl|skimTell': '!!', 'petrel|biteTell': '!', 'petrel|castTell': '!', 'petrel|dive': '!',
  'petrel|diveTell': '!', 'petrel|hookTell': '!', 'petrel|swellTell': '!', 'piece|nipTell': '!', 'pike|elSweepTell': '!', 'pike|tell': '!',
  'ploughman|chargeTell': '!!', 'ploughman|furrowTell': '!!', 'ploughman|goadTell': '!', 'ploughman|headTell': '!!', 'prince|callTell': '', 'prince|crownTell': '!',
  'prince|cutTell': '!', 'prince|sinkTell': '!!', 'prince|snuffTell': '!!', 'prise|reachTell': '!', 'propman|raise': '!', 'propman|setTell': '',
  'propman|throwTell': '!', 'puffer|biteTell': '!', 'puffer|castTell': '!', 'puffer|dive': '!', 'puffer|hookTell': '!', 'puffer|swellTell': '!',
  'pumpkin|biteTell': '!', 'pumpkin|puffTell': '!!', 'puppeteer|dropTell': '!!', 'puppeteer|snareHighTell': '!!', 'puppeteer|snareLowTell': '!!', 'pyromancer|bellowsTell': '!!',
  'pyromancer|cutTell': '!', 'pyromancer|emberTell': '!', 'pyromancer|ventTell': '!!', 'quarter|shootTell': '!!', 'quarter|slashTell': '!', 'quarter|stanceTell': '!!',
  'queen|aim': '!', 'queen|slamHang': '!', 'queen|sweepStart': '!', 'queen|volleyUp': '!', 'ram|buttTell': '!', 'ram|callTell': '',
  'ram|leapTell': '!!', 'ram|lower': '!', 'ram|rear': '!', 'ram|stampTell': '!!', 'ram|tossTell': '!!', 'raptor|watch': '!!',
  'reefmaw|biteTell': '!', 'reefmaw|lungeTell': '!!', 'reefmaw|riseTell': '!', 'reefmaw|spitTell': '!', 'reefmaw|tailTell': '!', 'reefmaw|thrashTell': '!',
  'rockgoblin|throw': '!', 'roc|diveTell': '!!', 'roc|grabTell': '!!', 'roc|gustTell': '', 'roc|roofTell': '!', 'roc|shedTell': '!',
  'roc|shriekTell': '!!', 'roc|talonTell': '!!', 'rook|diveTell': '!', 'runner|aim': '!', 'runner|cutTell': '!', 'runner|leapTell': '!!',
  'runner|shout': '!', 'runner|stabTell': '!', 'runner|swingTell': '!', 'sailer|sail': '!', 'sailor|biteTell': '!', 'sailor|castTell': '!',
  'sailor|dive': '!', 'sailor|hookTell': '!', 'sailor|swellTell': '!', 'sandgob|knifeTell': '!', 'sandworm|lungeTell': '!!', 'sapper|lightTell': '!!',
  'scalder|ladleTell': '!', 'scalder|pourTell': '!!', 'scarecrow|swipeTell': '!', 'scorpion|clawTell': '!', 'scorpion|tailTell': '!!', 'scout|lungeTell': '!',
  'scout|pinchTell': '!', 'scout|shockTell': '!!', 'scout|snapTell': '!', 'scout|strikeTell': '!', 'scout|thrustTell': '!', 'seawitch|callTell': '!!',
  'sexton|dropTell': '!!', 'sexton|rushTell': '!', 'sexton|swingTell': '!', 'sexton|tollTell': '!!', 'shardling|shedTell': '!!', 'sheargob|cutTell': '!!',
  'sheargob|snipTell': '!', 'shield|elChargeTell': '!', 'shield|elWallTell': '', 'shield|shoveTell': '!', 'siren|lungeTell': '!', 'siren|pinchTell': '!',
  'siren|shockTell': '!!', 'siren|snapTell': '!', 'siren|strikeTell': '!', 'siren|thrustTell': '!', 'slinger|kickTell': '!', 'slinger|slingTell': '!',
  'snuffer|snuffTell': '', 'snuffer|swipeTell': '!', 'soldier|grabTell': '!!', 'soldier|raise': '!!', 'soldier|slashTell': '!', 'soldier|windUp': '!',
  'spider|drop': '!', 'spider|dropTell': '!', 'spider|reelTell': '!', 'spider|spitTell': '!', 'spitcap|swellTell': '!!', 'spit|spitTell': '!',
  'sporeling|biteTell': '!', 'sprig|biteTell': '!', 'stagehand|dropTell': '!!', 'stagehand|swingTell': '!!', 'stormshaman|callTell': '!!', 'strawking|baleTell': '!!',
  'strawking|callTell': '', 'strawking|forkTell': '!', 'strawking|lanternTell': '!!', 'strawking|leapTell': '!!', 'strawking|lightTell': '', 'strawking|slamTell': '!',
  'strawking|sweepTell': '!!', 'stringjack|jerk': '!', 'suncatcher|clawTell': '!', 'suncatcher|frostTell': '!!', 'suncatcher|hailTell': '!!', 'suncatcher|shardTell': '!',
  'suncatcher|spireTell': '!!', 'sweep|popTell': '!', 'swornsword|aim': '!', 'swornsword|cutTell': '!', 'swornsword|leapTell': '!!', 'swornsword|shout': '!',
  'swornsword|stabTell': '!', 'swornsword|swingTell': '!', 'temperer|cutTell': '!', 'temperer|quenchTell': '!!', 'temperer|shoveTell': '!', 'thief|snatchTell': '!!',
  'thorn|wind': '!', 'tideguard|lungeTell': '!', 'tideguard|pinchTell': '!', 'tideguard|shockTell': '!!', 'tideguard|snapTell': '!', 'tideguard|strikeTell': '!',
  'tideguard|thrustTell': '!', 'tidemarauder|harpoonTell': '!', 'tidemarauder|rakeTell': '!!', 'tippler|barTell': '!', 'tippler|heaveTell': '!!', 'tollmaster|blackoutTell': '!',
  'tollmaster|darkTell': '', 'tollmaster|ledgerTell': '!', 'tollmaster|rodTell': '!', 'tollmaster|tollTell': '!!', 'tome|tell': '!', 'topiary|swipeTell': '!',
  'troll|hurlTell': '!', 'troll|ripTell': '!!', 'troll|slamTell': '!!', 'troll|swatTell': '!', 'troll|throwTell': '!', 'turret|chargeTell': '!',
  'turtle|lungeTell': '!', 'turtle|pinchTell': '!', 'turtle|shockTell': '!!', 'turtle|snapTell': '!', 'turtle|strikeTell': '!', 'turtle|thrustTell': '!',
  'undeadmage|bendTell': '!', 'undeadmage|boneTell': '!!', 'undeadmage|decoyTell': '', 'undeadmage|fireTell': '!', 'undeadmage|handTell': '!', 'undeadmage|iceTell': '!',
  'undeadmage|markTell': '!!', 'undeadmage|orbitTell': '!!', 'undeadmage|poisonTell': '!', 'undeadmage|pullTell': '!!', 'undeadmage|realmTell': '', 'undeadmage|scriptTell': '!!',
  'undeadmage|sporeTell': '!!', 'undeadmage|stepTell': '', 'undeadmage|stormTell': '!!', 'undeadmage|trapTell': '!', 'undeadmage|wallTell': '!!', 'urchin|biteTell': '!',
  'urchin|castTell': '!', 'urchin|dive': '!', 'urchin|hookTell': '!', 'urchin|swellTell': '!', 'vulture|watch': '!!', 'wasp|stingTell': '!',
  'watch|sweepTell': '!', 'watch|thrustTell': '!', 'waterthief|feintTell': '', 'waterthief|slashTell': '!', 'weaver|spitTell': '!', 'whelp|crouchTell': '!',
  'whelp|fireTell': '!', 'wickerman|swingTell': '!', 'wickerman|throwTell': '!!', 'wickerqueen|crownTell': '', 'wickerqueen|floorTell': '!!', 'wickerqueen|lashHighTell': '!!',
  'wickerqueen|lashLowTell': '!!', 'wickerqueen|leapTell': '!!', 'wickerqueen|ringTell': '!!', 'wickerqueen|stabTell': '!!', 'wickerqueen|sweepHighTell': '!!', 'wickerqueen|sweepLowTell': '!!',
  'wickerqueen|thrustHighTell': '!!', 'wickerqueen|thrustLowTell': '!!', 'wickerqueen|tossTell': '!!', 'wight|graspTell': '!!', 'willowisp|flareTell': '!', 'winchmaster|descendTell': '!!',
  'winchmaster|hookTell': '!!', 'winchmaster|leapTell': '!!', 'winchmaster|leverTell': '!', 'winchmaster|reverseTell': '', 'winchmaster|rideTell': '!!', 'winchmaster|sendTell': '!!',
  'winchmaster|whirlTell': '!!', 'winchmaster|wrenchTell': '!', 'windcaller|howlTell': '', 'windcaller|lightningTell': '!!', 'windcaller|stoneTell': '!', 'windcaller|twisterTell': '!',
  'windcaller|wallTell': '!!', 'zombie|grabTell': '!', 'zombie|riseTell': '',
};
/* MARK:END */

// THE ANSWER TO EVERY BLOW (the combat pass, 2026-09-28). The mark says whether the shield turns it; the ANSWER says what the
// player DOES about it - one of four, and a level's foe mix should ask for at least three (tools/answer-tags.mjs lists the ones
// that do not; fixing a level's mix is the design lanes' job, not this table's):
//   block  the shield (or a parry) - every yellow ! is a block, and nothing else is
//   dodge  the roll, or simply not being there: the ring, the spot, the overhead, the charge
//   jump   over it: a sweep along the floor, a wave, a rolled stone
//   duck   under it: THE UNIVERSAL DUCK (claude/duck) - hold down on the ground and a HIGH blow goes over (HEIGHT below, src/duck.js)
// One row per told blow of every COMMON foe ('type|mode', as MARK above; bosses and minis answer in their own fights), kept by
// hand: tools/answer-tags.mjs fails on a told blow with no row, a row with no blow, and a ! that is not a block.
/* ANSWER:BEGIN */
export const ANSWER = {
  'greathound|lungeTell': 'block', 'greathound|pounceTell': 'dodge', 'greathound|snapTell': 'block',   /* (claude/sweep1) THE GREAT HOUND: block the lunge (it skids past, open), out from under the pounce, block the snap */
  'waterthief|slashTell': 'block',   /* (claude/welltown) the cutthroat's cut */
  'sandworm|lungeTell': 'dodge',   /* (claude/desertfoes) off the domed spot */
  '*|eliteLungeTell': 'block', '*|eliteSlamTell': 'dodge',
  'ambusher|cutTell': 'block',
  'angler|biteTell': 'block', 'angler|castTell': 'block', 'angler|dive': 'block', 'angler|hookTell': 'block', 'angler|swellTell': 'block',
  'archer|draw': 'block', 'archer|elVolleyTell': 'dodge',
  'archmage|boltTell': 'block', 'archmage|booksTell': 'block', 'archmage|crushTell': 'dodge', 'archmage|glyphTell': 'dodge', 'archmage|pairTell': 'dodge', 'archmage|rendTell': 'jump',   // THE ARCHMAGE (a boss: his rows are his fight's, claude/archmage2): the bolt and the flying books a shield turns; out from under the stack, off the glyph and clear of the red circle of a pair (a jump straight up clears a pair too); the rend is jumped
  'armour|swingTell': 'block',
  'assassin|markTell': 'dodge', 'assassin|stabTell': 'block',
  'badger|chargeTell': 'block',
  'bannerbearer|poleTell': 'block',
  'bellguard|hookTell': 'block', 'bellguard|knellTell': 'dodge',
  'berserker|flailTell': 'block', 'berserker|windTell': 'dodge',
  'boarder|shootTell': 'block', 'boarder|slashTell': 'block', 'boarder|swingTell': 'block', 'boarder|throwTell': 'block',
  'bonecorsair|cleaveTell': 'dodge', 'bonecorsair|cutTell': 'block',
  'bonegob|throw': 'block',
  'bosun|salvageBroadsideTell': 'jump', 'bosun|salvageCargoTell': 'dodge', 'bosun|salvageCrossfireTell': 'dodge', 'bosun|salvageHookTell': 'block', 'bosun|salvagePinTell': 'block', 'bosun|shootTell': 'block', 'bosun|slashTell': 'block', 'bosun|swingTell': 'block', 'bosun|throwTell': 'block',
  'broom|dashTell': 'block', 'broom|sweepTell': 'block',
  'brute|elCut1Tell': 'block', 'brute|elCut2Tell': 'block', 'brute|elOverTell': 'dodge', 'brute|raise': 'dodge', 'brute|wind': 'block',
  'burngob|swingTell': 'block',
  'corpse|cutTell': 'block',
  'crab|lungeTell': 'block', 'crab|pinchTell': 'block', 'crab|snapTell': 'block', 'crab|strikeTell': 'block', 'crab|thrustTell': 'block', 'crab|shockTell': 'dodge',
  'crossbow|aim': 'block', 'crossbow|cutTell': 'block', 'crossbow|leapTell': 'dodge', 'crossbow|shout': 'block', 'crossbow|stabTell': 'block', 'crossbow|swingTell': 'block',
  'cutlass|shootTell': 'block', 'cutlass|slashTell': 'block', 'cutlass|swingTell': 'block', 'cutlass|throwTell': 'block',
  'cutter|raise': 'block',
  'cutthroat|slashTell': 'block',
  'archer|bagTell': 'dodge',   // THE FLYMAN's sandbag: off the red ring
  'stagehand|swingTell': 'dodge', 'stagehand|dropTell': 'dodge',   // THE STAGEHAND: out of the swing, off the shadow
  'mummer|lungeTell': 'dodge',   // (claude/theatre4) the villain mask's lunge: out of its line (a roll, a step, or over it)
  'mummer|mimeTell': 'block',   // (claude/fairfix6) the mime's swing back: the shield, or cut between its swings
  'mummer|glow': 'dodge', 'hobbyhorse|rear': 'jump',   // the mummer: not being there - face it and the strike is cancelled; the horse: over the charge (or up a haystack)
  'stringjack|jerk': 'block', 'barker|caneTell': 'block',   // (claude/fairfix) the marionette: take the cut on the shield (or duck it, or turn your back and it goes slack); the barker's cane: the shield
  'drownedcaptain|comboTell': 'block', 'drownedcaptain|lungeTell': 'block',
  'drownedknight|comboTell': 'block', 'drownedknight|lungeTell': 'block',
  'drunk|bottleTell': 'dodge', 'drunk|lobTell': 'block',
  'duneworm|sweepTell': 'jump',   // THE DUNE WORM (a boss, claude/duneworm2): his tail sweeps the floor from behind you - jump it
  'eel|leapTell': 'block', 'eel|lungeTell': 'block', 'eel|pinchTell': 'block', 'eel|snapTell': 'block', 'eel|strikeTell': 'block', 'eel|thrustTell': 'block', 'eel|shockTell': 'dodge',
  'farmhand|swingTell': 'block',
  'feeler|lashTell': 'block',
  'fledgling|peckTell': 'block',
  'frog|crouch': 'block', 'frog|inhaleTell': 'block', 'frog|spitTell': 'block', 'frog|tongueTell': 'block',   // THE BULLFROG KING (a boss, claude/firsthour): every blow of his is a shield's, and a shield on the tongue, the breath or the landing opens him; his spit is told now
  'gaffer|haftTell': 'block', 'gaffer|hookTell': 'duck',
  'gar|lungeTell': 'block',
  'goat|charge': 'block',
  'gobmage|boltTell': 'block', 'gobmage|runeTell': 'dodge',
  'gobpriest|bellTell': 'block', 'gobpriest|censerTell': 'block',
  'gqueen|hallLeapTell': 'jump',   // THE GOBLIN QUEEN'S QUAKE (a boss: her row is her fight's, claude/gqueen2): she lands and it runs the floor - jump it
  /* THE WEAK BOSSES MADE STRONG (minis, claude/weakboss: their rows are their fights'). THE LAMPREEVE's lunge from the dark: roll through it.
     THE HEADLESS PLOUGHMAN: the plough and the waking furrows jumped, his head's ring left, the goad guarded. THE HOMUNCULUS: every trick
     answered makes it miss, and a miss is its opening - the scuttle and the pound jumped, the flask's ring left, the pounce and swipe guarded */
  'lampreeve|lungeTell': 'dodge',
  'ploughman|chargeTell': 'jump', 'ploughman|furrowTell': 'jump', 'ploughman|headTell': 'dodge', 'ploughman|goadTell': 'block',
  'homunculus|scuttleTell': 'jump', 'homunculus|poundTell': 'jump', 'homunculus|flaskTell': 'dodge', 'homunculus|pounceTell': 'block', 'homunculus|swipeTell': 'block',
  'grub|spit': 'block',
  'grindylow|rippleTell': 'jump',   // THE FOG CANAL: the ring on the water is a hand coming for your ankle - be in the air when it closes (or strike the ring first)
  'grindylow|deckTell': 'jump', 'grindylow|boardTell': 'jump',   // (claude/canalfix) aboard: the same hand for your ankle, on her deck
  'wickerman|throwTell': 'jump', 'wickerman|swingTell': 'block',   // (claude/fairfix6) THE WICKER MAN: its fire rolls along the ground - jump it (or strike it back); its arms the shield takes
  'willowisp|flareTell': 'block',   // THE FOG CANAL: the false lantern flares (a yellow !) - the shield turns the burst, as every yellow ! does
  'hare|run': 'block',
  'harpy|aim': 'block',
  'haunt|throwTell': 'block',
  'hearthgob|raise': 'block',
  'heavy|grabTell': 'dodge', 'heavy|raise': 'dodge', 'heavy|slashTell': 'block', 'heavy|windUp': 'block',
  'hedgeknight|aim': 'block', 'hedgeknight|cutTell': 'block', 'hedgeknight|leapTell': 'dodge', 'hedgeknight|shout': 'block', 'hedgeknight|stabTell': 'block', 'hedgeknight|swingTell': 'block',
  'heronfoe|lungeTell': 'block', 'heronfoe|pinchTell': 'block', 'heronfoe|snapTell': 'block', 'heronfoe|strikeTell': 'block', 'heronfoe|thrustTell': 'block', 'heronfoe|shockTell': 'dodge',
  'imp|throwTell': 'block',
  'javelin|grabTell': 'dodge', 'javelin|raise': 'dodge', 'javelin|slashTell': 'block', 'javelin|windUp': 'block',
  'jelly|biteTell': 'block', 'jelly|castTell': 'block', 'jelly|dive': 'block', 'jelly|hookTell': 'block', 'jelly|swellTell': 'block',
  'lanternshade|flareTell': 'block',
  'lookout|shootTell': 'block', 'lookout|slashTell': 'block', 'lookout|swingTell': 'block', 'lookout|throwTell': 'block',
  'manta|diveTell': 'block',
  'marine|shootTell': 'block', 'marine|slashTell': 'block', 'marine|swingTell': 'block', 'marine|throwTell': 'block',
  'marshlight|flareTell': 'block',
  'merrowbrute|ramTell': 'block',
  'merrowcaller|surgeTell': 'jump',
  'merrowspear|throwTell': 'block',
  'mimic|biteTell': 'block',
  'miner|swingTell': 'block', 'miner|throwTell': 'block',
  'netter|biteTell': 'block', 'netter|castTell': 'block', 'netter|dive': 'block', 'netter|hookTell': 'block', 'netter|swellTell': 'block',
  'petrel|biteTell': 'block', 'petrel|castTell': 'block', 'petrel|dive': 'block', 'petrel|diveTell': 'block', 'petrel|hookTell': 'block', 'petrel|swellTell': 'block',
  'pike|elSweepTell': 'block', 'pike|tell': 'block',
  'prise|reachTell': 'block',
  'propman|raise': 'block', 'propman|throwTell': 'block',
  'puffer|biteTell': 'block', 'puffer|castTell': 'block', 'puffer|dive': 'block', 'puffer|hookTell': 'block', 'puffer|swellTell': 'block',
  'pumpkin|biteTell': 'block', 'pumpkin|puffTell': 'dodge',
  'queen|aim': 'block', 'queen|slamHang': 'block', 'queen|sweepStart': 'block', 'queen|volleyUp': 'block',   // THE HORNET QUEEN (a boss, claude/firsthour): the shield turns each; her dive taken on it staggers her, and one lured onto wood and left sticks her sting in it
  'rockgoblin|throw': 'block',
  'rook|diveTell': 'block',
  'runner|aim': 'block', 'runner|cutTell': 'block', 'runner|leapTell': 'dodge', 'runner|shout': 'block', 'runner|stabTell': 'block', 'runner|swingTell': 'block',
  'sailer|sail': 'block',
  'sailor|biteTell': 'block', 'sailor|castTell': 'block', 'sailor|dive': 'block', 'sailor|hookTell': 'block', 'sailor|swellTell': 'block',
  'scalder|ladleTell': 'block', 'scalder|pourTell': 'dodge',
  'scarecrow|swipeTell': 'block',
  'scorpion|clawTell': 'block', 'scorpion|tailTell': 'dodge',
  'scout|lungeTell': 'block', 'scout|pinchTell': 'block', 'scout|snapTell': 'block', 'scout|strikeTell': 'block', 'scout|thrustTell': 'block', 'scout|shockTell': 'dodge',
  'seawitch|callTell': 'dodge',
  'sheargob|cutTell': 'dodge', 'sheargob|snipTell': 'block',
  'shield|elChargeTell': 'block', 'shield|shoveTell': 'block',
  'siren|lungeTell': 'block', 'siren|pinchTell': 'block', 'siren|snapTell': 'block', 'siren|strikeTell': 'block', 'siren|thrustTell': 'block', 'siren|shockTell': 'dodge',
  'slinger|kickTell': 'block', 'slinger|slingTell': 'block',
  'snuffer|swipeTell': 'block',
  'soldier|grabTell': 'dodge', 'soldier|raise': 'dodge', 'soldier|slashTell': 'block', 'soldier|windUp': 'block',
  'spider|drop': 'block', 'spider|dropTell': 'block', 'spider|reelTell': 'block', 'spider|spitTell': 'block',
  'sprig|biteTell': 'block',
  'stormshaman|callTell': 'dodge',
  'swornsword|aim': 'block', 'swornsword|cutTell': 'block', 'swornsword|leapTell': 'dodge', 'swornsword|shout': 'block', 'swornsword|stabTell': 'block', 'swornsword|swingTell': 'block',
  'temperer|cutTell': 'block', 'temperer|quenchTell': 'dodge', 'temperer|shoveTell': 'block',
  'thorn|wind': 'block',
  'tideguard|lungeTell': 'block', 'tideguard|pinchTell': 'block', 'tideguard|snapTell': 'block', 'tideguard|strikeTell': 'block', 'tideguard|thrustTell': 'block', 'tideguard|shockTell': 'dodge',
  'tidemarauder|harpoonTell': 'block', 'tidemarauder|rakeTell': 'jump',
  'tippler|barTell': 'block', 'tippler|heaveTell': 'dodge',
  'magechase|fireTell': 'block', 'magechase|iceTell': 'block', 'magechase|markTell': 'dodge',   /* THE SPIRAL STAIR's chase: guard the fire and the frost, step out of the mark */
  'tome|tell': 'block',
  'topiary|swipeTell': 'block',
  'troll|hurlTell': 'block', 'troll|ripTell': 'jump', 'troll|slamTell': 'dodge', 'troll|swatTell': 'block', 'troll|throwTell': 'block',
  'turret|chargeTell': 'block',
  'turtle|lungeTell': 'block', 'turtle|pinchTell': 'block', 'turtle|snapTell': 'block', 'turtle|strikeTell': 'block', 'turtle|thrustTell': 'block', 'turtle|shockTell': 'dodge',
  'urchin|biteTell': 'block', 'urchin|castTell': 'block', 'urchin|dive': 'block', 'urchin|hookTell': 'block', 'urchin|swellTell': 'block',
  'kiterider|swoopTell': 'block', 'kiterider|kickTell': 'block', 'roc|diveTell': 'dodge',   /* (claude/skyroad) */
  'raptor|watch': 'dodge',   /* (claude/redgorge) as the vulture's */
  'vulture|watch': 'dodge',
  'wasp|stingTell': 'block',
  'watch|sweepTell': 'block', 'watch|thrustTell': 'block',
  'whelp|crouchTell': 'block', 'whelp|fireTell': 'block',
  'zombie|grabTell': 'block',
  /* THE UNTOLD, TOLD (the combat pass, part 2, 2026-09-28): every common foe whose harm had no windup has one now, and its answer */
  'apprentice|castTell': 'block', 'apprentice|grabTell': 'block',
  'bale|rollTell': 'jump',         // a bale that size bowls a shield over: over it
  'bonearcher|draw': 'block',
  'boo|swoopTell': 'dodge',        // through a shield: turn and face it, or be elsewhere
  'clinger|dropTell': 'dodge',     // from above: out from under
  'crow|diveTell': 'duck',         // at the head, over the shield: under it (the universal duck: hold down)
  'emberwisp|flareTell': 'dodge',
  'holdfast|gripTell': 'dodge',
  'horn|tell': 'duck',             // the gust: crouch and brace (the level guide: crouch braces for everyone)
  'hopper|hopTell': 'block',
  'hound|pounceTell': 'jump',      // low, for the legs: over it
  'husk|grabTell': 'block',
  'kite|dropTell': 'block',
  'lamprey|lungeTell': 'dodge',
  'lurker|springTell': 'block',
  'sapper|lightTell': 'dodge',
  'shardling|shedTell': 'dodge',   // all round it: step off
  'spit|spitTell': 'block',
  'spitcap|swellTell': 'dodge',
  'sporeling|biteTell': 'block',
  'sweep|popTell': 'block',
  'thief|snatchTell': 'dodge',
  'weaver|spitTell': 'block',
  /* THE WINCHMASTER (a boss, so not asked for by tools/answer-tags.mjs - kept because his phase three was built to ask for a dodge and a
     block, claude/winch4): on his drums the send, the hook and the leap are sat out in the air or out of the ring; the brake bar is
     shielded. On foot: the descent's ring stepped out of, THE HOOK SWUNG out of its reach or rolled through, THE WRENCH shielded, and
     his ride in a skip jumped as it passes */
  'winchmaster|sendTell': 'jump', 'winchmaster|hookTell': 'jump', 'winchmaster|leverTell': 'block', 'winchmaster|leapTell': 'dodge',
  'winchmaster|descendTell': 'dodge', 'winchmaster|whirlTell': 'dodge', 'winchmaster|wrenchTell': 'block', 'winchmaster|rideTell': 'jump',
  /* THE WICKER QUEEN (a boss; claude/fair3): the stab from behind is answered by the LOOK - turn and it is cancelled, or be out of her reach - so it is a dodge; the low ribbon and the low thrust are jumped, the high ones ducked (src/duck.js) */
  'wickerqueen|tossTell': 'jump', 'wickerqueen|sweepLowTell': 'jump', 'wickerqueen|sweepHighTell': 'duck', 'wickerqueen|leapTell': 'dodge', 'wickerqueen|stabTell': 'dodge', 'wickerqueen|lashLowTell': 'jump', 'wickerqueen|lashHighTell': 'duck', 'wickerqueen|floorTell': 'jump', 'wickerqueen|thrustHighTell': 'duck', 'wickerqueen|thrustLowTell': 'jump', 'wickerqueen|ringTell': 'dodge',   /* the floor: up onto a horse (claude/fairboss); her spear: the high thrust ducked on the boards, the low one jumped (claude/fairfix2-spear) */
  /* JENNY GREENTEETH (a boss; claude/lockkeeper): the ring on the water stepped out of, the lash along it jumped (or dived under), the reach at a ledge ducked, her teeth shielded, the torn weed stepped off, the surge jumped */
  'greenteeth|slamTell': 'dodge', 'greenteeth|chargeTell': 'jump', 'greenteeth|netTell': 'dodge', 'greenteeth|vineTell': 'jump',
  /* THE CISTERN QUEEN (a boss; claude/welltown3, src/cistern-queen.js MOVES): the pincers, the sand and the spit shielded; the lunge, the eruption, the rubble, the pin, the pounce, the grab and the sting stepped or rolled out of; the lance, the dune wave, the low sweep, the ambush, the waves and the roll jumped; the high sweep and the tidal tail ducked. THE GANG LEADER (a mini, src/gang-leader.js): his cuts, riposte and bottle shielded (or the bottle struck back), his whirl stepped out of */
  'cisternqueen|pincerTell': 'block', 'cisternqueen|snapTell': 'block', 'cisternqueen|snap2Tell': 'block', 'cisternqueen|lungeTell': 'dodge', 'cisternqueen|lanceTell': 'jump', 'cisternqueen|flickTell': 'block', 'cisternqueen|strikeTell': 'dodge', 'cisternqueen|chargeTell': 'jump', 'cisternqueen|spitTell': 'block', 'cisternqueen|sweepLowTell': 'jump', 'cisternqueen|sweepHighTell': 'duck', 'cisternqueen|slamTell': 'dodge', 'cisternqueen|pinTell': 'dodge', 'cisternqueen|pounceTell': 'dodge', 'cisternqueen|ambushTell': 'jump', 'cisternqueen|waveTell': 'jump', 'cisternqueen|grabTell': 'dodge', 'cisternqueen|rollTell': 'jump', 'cisternqueen|tidalTell': 'duck', 'cisternqueen|barbTell': 'dodge',
  'gangleader|cutTell': 'block', 'gangleader|cut2Tell': 'block', 'gangleader|crossTell': 'block', 'gangleader|whirlTell': 'dodge', 'gangleader|throwTell': 'block', 'gangleader|riposteTell': 'dodge', 'gangleader|dashTell': 'dodge', 'djinn|lashTell': 'block', 'djinn|blastTell': 'block', 'djinn|devilTell': 'jump', 'djinn|flashTell': 'block', 'djinn|breathTell': 'duck', 'djinn|pillarTell': 'dodge', 'djinn|spoutTell': 'dodge', 'djinn|waveTell': 'jump', 'djinn|slamTell': 'dodge', 'djinn|spearsTell': 'dodge', 'djinn|firedevilTell': 'jump', 'djinn|whirlTell': 'dodge', 'djinn|spearsTell': 'dodge', 'djinn|firedevilTell': 'jump', 'djinn|whirlTell': 'dodge',
  'wight|graspTell': 'dodge',      // mist round a shield: out of its reach
  /* THE PUPPETEER (a boss; claude/puppeteer): every puppet blow can also be answered by cutting the glowing string (it cancels the blow) - the rows say the other answer.
     His whip: low jumped, high ducked; the snare stepped out of; the soldier's chop and the masterpiece's swat blocked; the drop, the stomp stepped out from under; the harlequin's spin jumped; the reach ducked on the catwalk */
  'puppeteer|snareLowTell': 'jump', 'puppeteer|snareHighTell': 'duck', 'puppeteer|dropTell': 'dodge',   /* (claude/puppeteer2: his two slow attacks from the flies - the snare line low jumped, high ducked; the prop drop stepped out from under) */
  'marionette|chopTell': 'dodge', 'marionette|slamTell': 'jump', 'marionette|grabTell': 'dodge', 'harlequin|jabTell': 'block', 'harlequin|kickTell': 'jump',   /* (PUPPETEER3: the duo) */
  'masterpiece|swatTell': 'block', 'masterpiece|stompTell': 'dodge', 'masterpiece|reachTell': 'duck',
  'closedhelm|leapTell': 'dodge',   /* (claude/sweep2 gap-closer) THE PALADIN'S LEAP: his whole weight on the red ring, unblockable - be off it when he lands (and he lands open) */
};
/* ANSWER:END */
// THE HEIGHT OF EVERY BLOW (THE UNIVERSAL DUCK, claude/duck, Daniel 2026-09-29: "crouch = universal duck"). The mark says whether the
// shield turns it and the ANSWER says what the player does; the HEIGHT says whether a ducking hero lets it go over him:
//   high  it flies or swings at the chest and the head and never reaches the floor - an arrow or a bolt loosed level, a thrown
//         line, a pistol ball, a head-high thrust or scythe, a crow coming at the face, the horn's gust (a crouch braces). HOLD DOWN
//         on the ground and it goes over (src/duck.js); its windup wears the DUCK MARK beside its ! or !! (drawTells)
//   low   it reaches the floor - a sweep, a wave, a roll, a slam, a stamp, a lob, a dive from above, a bite, a charge, a grab: a
//         ducking hero is hit by it the same as a standing one. The ones answered 'jump' wear the JUMP MARK beside theirs.
// One row per ANSWER row (every told blow of every common foe, and the few bosses kept there), and the Queen's Lance's thrust
// (high: duck it and it whiffs, as if rolled) and sweep (low: jump it). Kept by hand: tools/answer-tags.mjs fails on a common foe's
// blow with no row, a row that is not high or low, a 'duck' answer that is not high, and a 'jump' answer that is not low.
// A SHOT FROM ABOVE STILL FINDS A DUCKER: a high seed passes over only while it flies near level (src/duck.js seedOver).
/* HEIGHT:BEGIN */
export const HEIGHT = {
  'waterthief|slashTell': 'low',   /* (claude/welltown) as the cutthroat's */
  'sandworm|lungeTell': 'low',   /* (claude/desertfoes) up out of the floor */
  'roc|diveTell': 'low',   /* (claude/skyroad) a dive from above reaches the floor */
'*|eliteLungeTell': 'low', '*|eliteSlamTell': 'low',
  'ambusher|cutTell': 'low',
  'angler|biteTell': 'low', 'angler|castTell': 'low', 'angler|dive': 'low', 'angler|hookTell': 'low', 'angler|swellTell': 'low',
  'apprentice|castTell': 'low', 'apprentice|grabTell': 'low',
  'archer|draw': 'high', 'archer|elVolleyTell': 'low',
  'archmage|boltTell': 'low', 'archmage|booksTell': 'low', 'archmage|crushTell': 'low', 'archmage|glyphTell': 'low', 'archmage|pairTell': 'low', 'archmage|rendTell': 'low',
  'armour|swingTell': 'high',
  'assassin|markTell': 'low', 'assassin|stabTell': 'low',
  'badger|chargeTell': 'low',
  'bale|rollTell': 'low',
  'bannerbearer|poleTell': 'low',
  'bellguard|hookTell': 'low', 'bellguard|knellTell': 'low',
  'berserker|flailTell': 'low', 'berserker|windTell': 'low',
  'boarder|shootTell': 'high', 'boarder|slashTell': 'low', 'boarder|swingTell': 'low', 'boarder|throwTell': 'high',
  'bonearcher|draw': 'high',
  'bonecorsair|cleaveTell': 'low', 'bonecorsair|cutTell': 'low',
  'bonegob|throw': 'low',
  'boo|swoopTell': 'low',
  'bosun|salvageBroadsideTell': 'low', 'bosun|salvageCargoTell': 'low', 'bosun|salvageCrossfireTell': 'low', 'bosun|salvageHookTell': 'low', 'bosun|salvagePinTell': 'low', 'bosun|shootTell': 'high', 'bosun|slashTell': 'low', 'bosun|swingTell': 'low', 'bosun|throwTell': 'high',
  'broom|dashTell': 'low', 'broom|sweepTell': 'low',
  'brute|elCut1Tell': 'low', 'brute|elCut2Tell': 'low', 'brute|elOverTell': 'low', 'brute|raise': 'low', 'brute|wind': 'low',
  'burngob|swingTell': 'low',
  'clinger|dropTell': 'low',
  'corpse|cutTell': 'low',
  'crab|lungeTell': 'low', 'crab|pinchTell': 'low', 'crab|snapTell': 'low', 'crab|strikeTell': 'low', 'crab|thrustTell': 'low', 'crab|shockTell': 'low',
  'crossbow|aim': 'high', 'crossbow|cutTell': 'low', 'crossbow|leapTell': 'low', 'crossbow|shout': 'low', 'crossbow|stabTell': 'low', 'crossbow|swingTell': 'low',
  'crow|diveTell': 'high',
  'cutlass|shootTell': 'high', 'cutlass|slashTell': 'low', 'cutlass|swingTell': 'low', 'cutlass|throwTell': 'high',
  'cutter|raise': 'low',
  'cutthroat|slashTell': 'low',
  'archer|bagTell': 'low',   // it comes down onto the ring at your feet: a duck does not take you out of it
  'stagehand|swingTell': 'low', 'stagehand|dropTell': 'high',
  'mummer|glow': 'low', 'hobbyhorse|rear': 'low', 'mummer|mimeTell': 'low', 'mummer|lungeTell': 'low',
  'stringjack|jerk': 'high', 'barker|caneTell': 'low',   // the marionette's hook at the chest (a ducking hero lets it over him: its box stops 10 px above the floor); the cane swept low
  'drownedcaptain|comboTell': 'low', 'drownedcaptain|lungeTell': 'low',
  'drownedknight|comboTell': 'low', 'drownedknight|lungeTell': 'low',
  'drunk|bottleTell': 'low', 'drunk|lobTell': 'low',
  'eel|leapTell': 'low', 'eel|lungeTell': 'low', 'eel|pinchTell': 'low', 'eel|snapTell': 'low', 'eel|strikeTell': 'low', 'eel|thrustTell': 'low', 'eel|shockTell': 'low',
  'emberwisp|flareTell': 'low',
  'farmhand|swingTell': 'high',
  'feeler|lashTell': 'low',
  'fledgling|peckTell': 'low',
  'frog|crouch': 'low', 'frog|inhaleTell': 'low', 'frog|spitTell': 'low', 'frog|tongueTell': 'low',
  'gaffer|haftTell': 'low', 'gaffer|hookTell': 'high',
  'gar|lungeTell': 'low',
  'goat|charge': 'low',
  'gobmage|boltTell': 'high', 'gobmage|runeTell': 'low',
  'gobpriest|bellTell': 'low', 'gobpriest|censerTell': 'low',
  'gqueen|hallLeapTell': 'low',
  'lampreeve|lungeTell': 'low',   /* (claude/weakboss: the pole comes level at your middle - a duck is still in it) */
  'ploughman|chargeTell': 'low', 'ploughman|furrowTell': 'low', 'ploughman|headTell': 'low', 'ploughman|goadTell': 'low',
  'homunculus|scuttleTell': 'low', 'homunculus|poundTell': 'low', 'homunculus|flaskTell': 'low', 'homunculus|pounceTell': 'low', 'homunculus|swipeTell': 'low',
  'grub|spit': 'low',
  'grindylow|deckTell': 'low', 'grindylow|boardTell': 'low',
  'grindylow|rippleTell': 'low',
  'hare|run': 'low',
  'harpy|aim': 'low',
  'haunt|throwTell': 'low',
  'hearthgob|raise': 'low',
  'heavy|grabTell': 'low', 'heavy|raise': 'low', 'heavy|slashTell': 'low', 'heavy|windUp': 'low',
  'hedgeknight|aim': 'high', 'hedgeknight|cutTell': 'low', 'hedgeknight|leapTell': 'low', 'hedgeknight|shout': 'low', 'hedgeknight|stabTell': 'low', 'hedgeknight|swingTell': 'low',
  'heronfoe|lungeTell': 'low', 'heronfoe|pinchTell': 'low', 'heronfoe|snapTell': 'low', 'heronfoe|strikeTell': 'low', 'heronfoe|thrustTell': 'low', 'heronfoe|shockTell': 'low',
  'holdfast|gripTell': 'low',
  'hopper|hopTell': 'low',
  'horn|tell': 'high',
  'hound|pounceTell': 'low',
  'husk|grabTell': 'low',
  'imp|throwTell': 'low',
  'javelin|grabTell': 'low', 'javelin|raise': 'low', 'javelin|slashTell': 'low', 'javelin|windUp': 'low',
  'jelly|biteTell': 'low', 'jelly|castTell': 'low', 'jelly|dive': 'low', 'jelly|hookTell': 'low', 'jelly|swellTell': 'low',
  'kite|dropTell': 'low',
  'lamprey|lungeTell': 'low',
  'duneworm|sweepTell': 'low',   // THE DUNE WORM's tail (a boss): along the floor, jumped
  'lance|sweepTell': 'low', 'lance|thrustTell': 'high',   // THE QUEEN'S LANCE (a boss): his LOW sweep is jumped; his thrust goes over a ducked hero and he is left reaching, as when it is rolled
  'lanternshade|flareTell': 'low',
  'lookout|shootTell': 'high', 'lookout|slashTell': 'low', 'lookout|swingTell': 'low', 'lookout|throwTell': 'high',
  'lurker|springTell': 'low',
  'magechase|fireTell': 'low', 'magechase|iceTell': 'low', 'magechase|markTell': 'low',
  'manta|diveTell': 'low',
  'marine|shootTell': 'high', 'marine|slashTell': 'low', 'marine|swingTell': 'low', 'marine|throwTell': 'high',
  'marshlight|flareTell': 'low',
  'merrowbrute|ramTell': 'low',
  'merrowcaller|surgeTell': 'low',
  'merrowspear|throwTell': 'high',
  'mimic|biteTell': 'low',
  'miner|swingTell': 'low', 'miner|throwTell': 'low',
  'netter|biteTell': 'low', 'netter|castTell': 'low', 'netter|dive': 'low', 'netter|hookTell': 'low', 'netter|swellTell': 'low',
  'petrel|biteTell': 'low', 'petrel|castTell': 'low', 'petrel|dive': 'low', 'petrel|diveTell': 'low', 'petrel|hookTell': 'low', 'petrel|swellTell': 'low',
  'pike|elSweepTell': 'low', 'pike|tell': 'low',
  'prise|reachTell': 'low',
  'propman|raise': 'low', 'propman|throwTell': 'low',
  'puffer|biteTell': 'low', 'puffer|castTell': 'low', 'puffer|dive': 'low', 'puffer|hookTell': 'low', 'puffer|swellTell': 'low',
  'pumpkin|biteTell': 'low', 'pumpkin|puffTell': 'low',
  'queen|aim': 'low', 'queen|slamHang': 'low', 'queen|sweepStart': 'low', 'queen|volleyUp': 'low',
  'rockgoblin|throw': 'low',
  'rook|diveTell': 'low',
  'runner|aim': 'high', 'runner|cutTell': 'low', 'runner|leapTell': 'low', 'runner|shout': 'low', 'runner|stabTell': 'low', 'runner|swingTell': 'low',
  'sailer|sail': 'low',
  'sailor|biteTell': 'low', 'sailor|castTell': 'low', 'sailor|dive': 'low', 'sailor|hookTell': 'low', 'sailor|swellTell': 'low',
  'sapper|lightTell': 'low',
  'scalder|ladleTell': 'low', 'scalder|pourTell': 'low',
  'scarecrow|swipeTell': 'low',
  'scorpion|clawTell': 'low', 'scorpion|tailTell': 'low',
  'scout|lungeTell': 'low', 'scout|pinchTell': 'low', 'scout|snapTell': 'low', 'scout|strikeTell': 'low', 'scout|thrustTell': 'low', 'scout|shockTell': 'low',
  'seawitch|callTell': 'low',
  'shardling|shedTell': 'low',
  'sheargob|cutTell': 'low', 'sheargob|snipTell': 'low',
  'shield|elChargeTell': 'low', 'shield|shoveTell': 'low',
  'siren|lungeTell': 'low', 'siren|pinchTell': 'low', 'siren|snapTell': 'low', 'siren|strikeTell': 'low', 'siren|thrustTell': 'low', 'siren|shockTell': 'low',
  'slinger|kickTell': 'low', 'slinger|slingTell': 'low',
  'snuffer|swipeTell': 'low',
  'soldier|grabTell': 'low', 'soldier|raise': 'low', 'soldier|slashTell': 'low', 'soldier|windUp': 'low',
  'spider|drop': 'low', 'spider|dropTell': 'low', 'spider|reelTell': 'low', 'spider|spitTell': 'low',
  'spitcap|swellTell': 'low',
  'spit|spitTell': 'low',
  'sporeling|biteTell': 'low',
  'sprig|biteTell': 'low',
  'stormshaman|callTell': 'low',
  'sweep|popTell': 'low',
  'swornsword|aim': 'high', 'swornsword|cutTell': 'low', 'swornsword|leapTell': 'low', 'swornsword|shout': 'low', 'swornsword|stabTell': 'low', 'swornsword|swingTell': 'low',
  'temperer|cutTell': 'low', 'temperer|quenchTell': 'low', 'temperer|shoveTell': 'low',
  'thief|snatchTell': 'low',
  'thorn|wind': 'low',
  'tideguard|lungeTell': 'low', 'tideguard|pinchTell': 'low', 'tideguard|snapTell': 'low', 'tideguard|strikeTell': 'low', 'tideguard|thrustTell': 'low', 'tideguard|shockTell': 'low',
  'tidemarauder|harpoonTell': 'high', 'tidemarauder|rakeTell': 'low',
  'tippler|barTell': 'low', 'tippler|heaveTell': 'low',
  'tome|tell': 'low',
  'topiary|swipeTell': 'low',
  'troll|hurlTell': 'low', 'troll|ripTell': 'low', 'troll|slamTell': 'low', 'troll|swatTell': 'low', 'troll|throwTell': 'low',
  'turret|chargeTell': 'low',
  'turtle|lungeTell': 'low', 'turtle|pinchTell': 'low', 'turtle|snapTell': 'low', 'turtle|strikeTell': 'low', 'turtle|thrustTell': 'low', 'turtle|shockTell': 'low',
  'urchin|biteTell': 'low', 'urchin|castTell': 'low', 'urchin|dive': 'low', 'urchin|hookTell': 'low', 'urchin|swellTell': 'low',
  'kiterider|swoopTell': 'low', 'kiterider|kickTell': 'low',   /* (claude/skyroad) as the harpy's */
  'raptor|watch': 'low',   /* (claude/redgorge) as the vulture's */
  'vulture|watch': 'low',
  'wasp|stingTell': 'low',
  'watch|sweepTell': 'low', 'watch|thrustTell': 'high',
  'weaver|spitTell': 'low',
  'whelp|crouchTell': 'low', 'whelp|fireTell': 'low',
  'wickerqueen|tossTell': 'low', 'wickerqueen|sweepLowTell': 'low', 'wickerqueen|sweepHighTell': 'high', 'wickerqueen|leapTell': 'low', 'wickerqueen|lashHighTell': 'high', 'wickerqueen|lashLowTell': 'low', 'wickerqueen|stabTell': 'low', 'wickerqueen|floorTell': 'low', 'wickerqueen|thrustHighTell': 'high', 'wickerqueen|thrustLowTell': 'low', 'wickerqueen|ringTell': 'low',
  'greenteeth|slamTell': 'low', 'greenteeth|chargeTell': 'low', 'greenteeth|netTell': 'low', 'greenteeth|vineTell': 'low',
  'cisternqueen|pincerTell': 'low', 'cisternqueen|snapTell': 'low', 'cisternqueen|snap2Tell': 'low', 'cisternqueen|lungeTell': 'low', 'cisternqueen|lanceTell': 'low', 'cisternqueen|flickTell': 'low', 'cisternqueen|strikeTell': 'low', 'cisternqueen|chargeTell': 'low', 'cisternqueen|spitTell': 'low', 'cisternqueen|sweepLowTell': 'low', 'cisternqueen|sweepHighTell': 'high', 'cisternqueen|slamTell': 'low', 'cisternqueen|pinTell': 'low', 'cisternqueen|pounceTell': 'low', 'cisternqueen|ambushTell': 'low', 'cisternqueen|waveTell': 'low', 'cisternqueen|grabTell': 'low', 'cisternqueen|rollTell': 'low', 'cisternqueen|tidalTell': 'high', 'cisternqueen|barbTell': 'low',   /* THE CISTERN QUEEN (claude/welltown3): the high sweep and the tidal tail go over a ducking hero */
  'gangleader|cutTell': 'low', 'gangleader|cut2Tell': 'low', 'gangleader|crossTell': 'low', 'gangleader|whirlTell': 'low', 'gangleader|throwTell': 'low', 'gangleader|riposteTell': 'low', 'gangleader|dashTell': 'low', 'djinn|lashTell': 'low', 'djinn|blastTell': 'low', 'djinn|devilTell': 'low', 'djinn|flashTell': 'low', 'djinn|breathTell': 'high', 'djinn|pillarTell': 'low', 'djinn|spoutTell': 'low', 'djinn|waveTell': 'low', 'djinn|slamTell': 'low', 'djinn|spearsTell': 'low', 'djinn|firedevilTell': 'low', 'djinn|whirlTell': 'low', 'djinn|spearsTell': 'low', 'djinn|firedevilTell': 'low', 'djinn|whirlTell': 'low',
  'wight|graspTell': 'low',
  'wickerman|throwTell': 'low', 'wickerman|swingTell': 'low',
  'willowisp|flareTell': 'high',
  'winchmaster|descendTell': 'low', 'winchmaster|hookTell': 'low', 'winchmaster|leapTell': 'low', 'winchmaster|leverTell': 'low', 'winchmaster|rideTell': 'low', 'winchmaster|sendTell': 'low', 'winchmaster|whirlTell': 'low', 'winchmaster|wrenchTell': 'low',
  'zombie|grabTell': 'low',
  'puppeteer|snareLowTell': 'low', 'puppeteer|snareHighTell': 'high', 'puppeteer|dropTell': 'low', 'marionette|chopTell': 'low', 'marionette|slamTell': 'low', 'marionette|grabTell': 'low', 'harlequin|jabTell': 'low', 'harlequin|kickTell': 'low',
  'masterpiece|swatTell': 'low', 'masterpiece|stompTell': 'low', 'masterpiece|reachTell': 'high',   /* THE PUPPETEER (claude/puppeteer): the whip high and the reach go over a ducking hero */
  'closedhelm|leapTell': 'low',   /* (claude/sweep2 gap-closer) THE PALADIN'S LEAP lands on the floor: ducking under it is no answer */
};
/* HEIGHT:END */
// THE COMMON FOES WHOSE HARM IS NOT A TOLD WINDUP (touch, a lunge from hiding, a latch, a burst, a gust), and what the player does
// about each. EMPTY, and tools/answer-tags.mjs keeps it so (the combat pass, part 2: Daniel's "no untold hits"): the 24 that were
// here - the lurker's lunge, the hound's leap, the sapper's bomb and the rest - each wind up on a mark now and answer in ANSWER.
export const UNTOLD = {};
// THE COMMON FOLK THAT NEVER HARM YOU AT ALL: no blow, so nothing to tell and nothing to answer.
export const HARMLESS = new Set(['folk', 'sentry', 'squirrel', 'dummy']);   // townsfolk, a bell-runner, a pickpocket (it is a thief underneath: see thief|snatchTell), a straw man
export const answerOf = (t, mode) => ANSWER[t + '|' + mode] || ANSWER['*|' + mode] || UNTOLD[t] || '';

const MISSED = new Set();
// THE MARK OVER THIS CREATURE NOW: '!', '!!', or '' for none. A windup with no row wears no mark - and says so once in
// the console, because a windup the table does not know is a hole in the audit, not a quiet tell.
/* THE KEY A WINDUP IS READ BY ('type|mode', or an elite's own '*|mode'), the same one markOf reads the mark by: the duck reads its
   HEIGHT and the tell its lane off it (src/duck.js) */
export const tellKey = e => { const mode = e.t === 'archer' && e.draw > 0.3 && !(typeof e.mode === 'string' && e.mode.endsWith('Tell')) ? 'draw' : e.mode;
  return e.elite && ('*|' + mode) in MARK ? '*|' + mode : e.t + '|' + mode; };
export const heightOf = k => HEIGHT[k] || '';
/* THE LANE BESIDE THE MARK: 'duck' over a high blow, 'jump' over a blow answered with a jump, '' over the rest */
export const laneOf = k => HEIGHT[k] === 'high' ? 'duck' : (ANSWER[k] || ANSWER['*|' + k.split('|')[1]]) === 'jump' ? 'jump' : '';
export function markOf(e) {
  const mode = e.t === 'archer' && e.draw > 0.3 && !(typeof e.mode === 'string' && e.mode.endsWith('Tell')) ? 'draw' : e.mode;
  if (e.elite && ('*|' + mode) in MARK) return MARK['*|' + mode];
  const k = e.t + '|' + mode;
  if (k in MARK) return MARK[k];
  if (!MISSED.has(k)) { MISSED.add(k); console.warn('[marks] a windup with no row in src/marks.js: ' + k + ' - it wears no mark'); }
  return '';
}
export const marksMissed = () => [...MISSED];
