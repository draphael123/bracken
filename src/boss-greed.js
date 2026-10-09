/* THE GLOBAL BOSS RULE AND THE GREED REPRISAL (claude/combat3, the combat pass; Daniel 2026-10-01).

   Daniel, of the Fair, the Theatre and the Puppeteer: "no challenge... the boss is just attack, attack". The mash bot
   (tools/mash-bot.mjs) beat 18 of 34 bosses and 12 of 13 minis by pressing attack and nothing else, because most bosses
   took a full blow whenever a blade reached them and their openings were a bonus on top. The target is HOLLOW KNIGHT /
   SALT & SANCTUARY: a first attempt at a new boss usually ends in death.

   1. THE CHIP. A HERO'S blow on a boss outside one of his openings lands at a twentieth (GREED.chip). One predicate per
      boss says whether he is open (OPEN_RULE, below): the same windows his own code already pays double for, in one
      table, so the rule, the boss lab's bot and the mash bot's probe all ask the same question (BK.bossOpen).
      - Only a hero's blow is chipped (hurtAs, which names the blow) and the burn he lit. What the ROOM does to a boss -
        a cannon, a keg, a falling chandelier, a crate thrown out to the Kraken - is a mechanic and lands whole.
      - It never stacks: a boss with his own ward of a twentieth (the Puppeteer, the Wicker Queen) keeps his own number
        (OWN_WARD) and the rule only counts his greed; anywhere else the blow is the SMALLER of what his code gave and
        the chip, never the chip of the chip.
      - A boss broken by his poise bar (e.broken) is open, whoever he is: the heavy blows, plunges and ripostes that
        fill the bar are an earned opening on every boss that carries one.
      - A boss with NO opening in code is not made unbeatable: he is listed in NO_OPENING and left at full damage, a
        TODO for his boss-wave lane.
   2. THE GREED REPRISAL (new). GREED.n blows outside an opening inside GREED.window seconds and he answers: a TOLD
      counter - the red !! over him and a ring closing on him for GREED.tell seconds - then a burst round his body that
      throws the hero off (unblockable: it is answered by stepping out of it or rolling through it). It runs beside his
      own fight and never takes his turn, so every boss has it without a line of his own code being touched.
   3. MINIS keep their full damage (a mini is a duel, not a puzzle), but a mini mashed GREED.nMini times in a row while
      he is not open answers the same way, and his own blows land GREED.miniHit harder (main.js damagePlayer0).

   main.js wires it: wardedDamage's tail (chipOf), hurtEnemy0 (noteGreed), updateEnemies (greedStep), damagePlayer0
   (GREED.miniHit), BK.bossOpen (openOf). tools/boss-greed.mjs is its check. */
import { abbotOpen } from './false-abbot.js';
import { gargOpen } from './gate-gargoyle.js';
import { winchOpen } from './winchmaster.js';
import { wormOpen } from './dune-worm.js';
import { mageOpen } from './undead-mage.js';
import { pupOpen } from './puppeteer.js';
import { wqOpen } from './wicker-queen.js';
import { leOpen } from './lantern-eater.js';   /* THE LANTERN-EATER (claude/lanterneater) */
import { qOpen } from './cistern-queen.js';
import { matOpen } from './raptor-matriarch.js';
import { colOpen } from './glass-colossus.js';
import { hmOpen } from './hawk-mistress.js';   /* THE HAWK-MISTRESS (claude/ksar) */
import { hmOpen as hnOpen } from './huntmaster.js';   /* THE GOBLIN HUNTMASTER (claude/rootway) */
import { drillHittable } from './great-drill.js';   /* THE GREAT DRILL (claude/minecart) */
import { pbOpen } from './paladin-boss.js';   /* THE PALADIN (claude/litchurch) */
import { fkOpen } from './fog-knight.js';   /* THE FOG KNIGHT (claude/towpath) */
import { glOpen } from './gang-leader.js'; import { djOpen } from './djinn.js';
import { sextonOpen } from './sexton.js';
import { hedgeOpen } from './hedge-warden.js';
import { brOpen, bkOpen } from './unburied-foes.js';
import { wardenOpen as graveOpen } from './grave-warden.js';
import { rocEyrieOpen } from './roc-eyrie.js';   /* THE ROC on her EYRIE (claude/skyroad) */

export const GREED = {
  chipBy: { queen: 1, herald: 0.2, cisternqueen: 0.5, owl: 0.4 },   /* (claude/owl2, B15: THE OWL REEVE off the twentieth - wherever she passes at your height she takes 0.4 of a blow, a duelist's trade; her lamp crash x2, src/main.js owlTake) */   /* (claude/burnvillage2, Daniel 10-07: THE PYROMANCER is off the chip - FULL_DAMAGE, below) */   /* (claude/sweep3: the Cistern Queen's shell gives at half - up on her wall, or burning (x hotMul): Daniel 10-06, never fully invulnerable) */   // THE FIRST BOSS TEACHES IT: the Hornet Queen (Kingswood, the game's first fight) keeps her own swarm rule (a blow lands at 0.45 while two
                           // drones are up) and is not chipped: at a twentieth - and at a quarter, and at a half - the human-speed bot lost her 2-3 of 3 (it won
                           // 2 of 3 before; the mash bot never beat her). Her greed reprisal stands. THE PYROMANCER takes a quarter: blows are what open him
                           // (each heats him), and at a twentieth the bot won 1 of 3 (3 of 3 before), at a quarter 2 of 3. THE TIDE HERALD takes a fifth (he took
                           // 0.35 outside mired/reel before): at a twentieth his fight ran 121-365 s for the bot (the reaper 263, the warden 365), at a fifth 63-247. (Qs for Daniel)
  chip: 0.05,      // outside an opening a hero's blow lands at a twentieth (docs/NEW-LEVEL-CHECKLIST.md "x0.05 chip otherwise")
  n: 4,            // blows outside an opening inside `window` that provoke the reprisal (a boss)
  nMini: 4,        // and a mini: he takes his blows whole, so it takes one more to make him answer
  window: 2.5,     // s: the greedy blows have to come this close together to count as one greed
  tell: 0.6,       // s: the reprisal's told windup (two and a half human reactions: ~250 ms each)
  cool: 3.0,       // s after a reprisal before greed is counted again
  reach: 60,       // px either side of his centre the burst reaches (plus half his body)
  reachY: 52,      // px above his feet (and a little below)
  dmgMini: 26,    // a mini's (he is a duel and takes his blows whole: his answer is the harder one)
  coolMini: 1.5,   // s after a mini's reprisal before greed counts again
  dmg: 16,         // the burst's blow, before damagePlayer's difficulty and tier scaling (every blow goes through that line)
  miniHit: 1.3,    // a mini's own blows land this much harder (the combat pass: minis keep their damage taken, and hit harder)
};

/* WHEN EACH BOSS IS OPEN: the windows his own code already pays more for (main.js hurtEnemy0 and each boss's module).
   H is main.js's own helpers for the few that live there (install). */
let H = {};
export const OPEN_RULE = {
  queen: e => e.mode === 'winded' || e.mode === 'stuck',                     // a dive taken on the shield, or her sting in the wood
  frog: e => H.frogOpen(e),                                                  // dazed, croaking, in the mud
  chief: e => e.mode === 'planted',                                          // his club in the ground
  king: e => e.mode === 'held' || e.open > 0,                                // held in a cage (his crown turns everything else already)
  ram: e => H.ramOpen(e),                                                    // (claude/scree2) STUNNED under a fold overhang he was lured beneath, or into the wall off a dodged charge (src/ram-lord.js)
  owl: e => e.mode === 'crash' || e.mode === 'grounded' || e.mode === 'pinned',   // (claude/bosswave1) down on the boards only: lampT open in the air made a lit lamp a free window
  abbot: e => abbotOpen(e),                                                  // the bell has him down
  windcaller: e => H.callerOpen(e),                                          // (claude/bosswave1) FALLEN only: his bolt sent back, or his howl braced through
  lance: e => H.lanceOpen(e),                                                // committed: planted, thrusting, reeling
  gqueen: e => H.gqOpen(e),                                                  // pinned, or her plate off
  herald: e => e.mode === 'mired' || e.mode === 'reel',
  reefmaw: e => e.mode === 'stuck' || e.mode === 'reel' || e.mode === 'beached',
  quarter: e => e.mode === 'cut' || e.mode === 'reel',                       // her blade in a rope
  captain: e => e.mode === 'beach' || e.mode === 'reel',                     // beached on his own planking
  tollmaster: e => e.open > 0,                                               // (claude/bosswave1) the ledger turned on a shield, only (THE DARK is no longer open)
  bellcrab: e => e.phase === 3 || e.open > 0,                                // a stone on his crown, or out of the bell
  drownedking: e => e.open > 0,
  harbormaster: e => e.open > 0,
  closedhelm: e => e.open > 0,                                               // the ward down (it is a NO anywhere else already)
  prince: e => e.mode === 'buried' || e.mode === 'reel' || e.bare > 0,
  strawking: e => e.open > 0,
  burieddead: e => e.open > 0,
  archmage: e => e.open > 0,
  undeadmage: e => mageOpen(e),
  pyromancer: e => e.open > 0,                                               // overheated, venting
  gargoyle: e => gargOpen(e),                                                // stunned on the spikes (only a stomp lands anyway)
  winchmaster: e => winchOpen(e),                                            // the jammed drum has him down
  bloodknight: e => bkOpen(e),                                               // the blade stuck in the floor, or reeling from his broken ward (claude/dk3: his openings pay x1.6; he is on FULL_DAMAGE, below - the chip never applies, greed still counts)
  duneworm: e => !!(e.st && wormOpen(e.st)),                                 // tangled in the awning
  wickerqueen: e => wqOpen(e),                                               // burning, or alight from her own fire (claude/fairfix5: >= 3 s, x1.2)
  puppeteer: e => pupOpen(e),
  matriarch: e => matOpen(e),                                                // THE RAPTOR MATRIARCH (claude/redgorge2): thrown by a narrow pillar, stunned off her dive, tangled in a cut bridge - and her beats (the skid, the rake's breath)
  gorgecrab: e => e.mode === 'open',                                         // THE GREAT RED CRAB: thrown on his back by a released burst (claude/redgorge)
  grandmother: e => H.granOpen(e),                                           // (claude/underleaf2) her BACK while she lashes at a lure, or her rap after a silent listen (src/hush-hands.js granOpen)
  lanterneater: e => leOpen(e) || !!e.keyHit,                               // (claude/lanterneater) snagged / its teeth in the timber - or a blow at its KEY on what is in reach (B14: the keyed angle lands whole and is not greed; the wrong one is; its own ward of a twentieth: OWN_WARD)  //                                 // (claude/canal4) stuck in the raft - or a blow at her BARE angle (the kelp guard: always hittable, the right blow is not greed; her own ward of a twentieth: OWN_WARD)                                                // downed or jolted
  cisternqueen: e => qOpen(e) || e.sting > 0 || e.scorch > 0 || !!(e.cqBare && e.cqBare()),   /* (claude/underwell3, Daniel 10-07: her STINGER is her weak spot - a blow on it, wherever it is (e.cqBare: the hands ask the blow's box), and her body while the fire SCORCHES her) */                                             // soaked out of her burrow, on her back off her wall (doused), rearing from a broken grab (claude/welltown3); her STUCK STINGER (claude/welltown5)
  paladinboss: e => pbOpen(e),                                               // THE PALADIN (claude/litchurch): his light starved, he FALTERS on one knee - open
  hawkmistress: e => hmOpen(e),                                              // THE HAWK-MISTRESS (claude/ksar): the hawk wheeled off by a gong or blinded by a flash - she whistles it back, open
  huntmaster: e => hnOpen(e),                                               // THE GOBLIN HUNTMASTER (claude/rootway): his own gold arrow struck home (a weak point broken, or a stagger), or caught in his own cage
  greatdrill: e => drillHittable(e),                                         // THE GREAT DRILL (claude/minecart): a CONSTRUCT whose cab is ALWAYS hittable (B13/B14, Daniel 10-07) - only its told ward after a jam turns a blow, so only a blow on the ward is greed; the jam (a routed ore cart in its gears) pays x2 in its own code
  fogknight: e => fkOpen(e) || e.mode === 'reel',                            // THE FOG KNIGHT (claude/towpath): the armour standing empty - the lantern burnt the fog out of it, or the swing bridge scattered it - and reeling from a plunge through his full guard
  colossus: e => colOpen(e),                                                 // THE GLASS COLOSSUS (claude/glasssea): its chest cracked by its own lance off a mirror, its shoulders blazing (the swarm held by firelight), its crown dazzled by the dawn - its legs are its own purse (OWN_WARD)
  /* THE MINIS (greed only: they keep their damage) */
  lampreeve: e => e.open > 0, homunculus: e => e.open > 0, ploughman: e => e.open > 0,
  gravewarden: e => graveOpen(e), forgemaster: e => H.forgeOpen(e), golem: e => e.open > 0,   /* (claude/monastery2) staggered by a bell's note or its own thrown stone (src/temple-guardian.js) */
  lancer: e => e.open > 0,   // (claude/bosswave1) unhorsed, reared on a shield, or his swipe or cut answered: 3 s each (on foot or after every charge was open before)
  greathound: e => e.open > 0,   // (claude/bosswave1) its lunge taken on a shield (it skids), or its pups killed in time (it whines)
  bosun: e => e.open > 0,   // (claude/bosswave1, the mini) his belaying pin parried
  barrowrider: e => brOpen(e), sexton: e => sextonOpen(e), hedgewarden: e => hedgeOpen(e),
  djinn: e => djOpen(e) || e.hand > 0,                                      // THE DJINN (claude/welltown5): mud, doused, bailed out by the bucket - and his slammed hand
  roc: e => rocEyrieOpen(e),                                                 // THE ROC (claude/skyroad): stuck in the nest off a dive, or knocked down - a thermal plunge, the lightning on her mast
  gangleader: e => glOpen(e),                                                // burning: his own bottle, struck home (claude/welltown3)
};
/* BOSSES WITH THEIR OWN TWENTIETH: the rule leaves their number alone (it would be a twentieth of a twentieth) and only counts greed */
/* BLOWS ARE HIS MECHANIC: the Pyromancer is opened by being HIT while he runs hot (every blow heats him, src/main.js hurtEnemy0), so a run of
   blows is the answer, not greed: no reprisal (claude/burnvillage2: and no chip either - he is a duelist on FULL_DAMAGE) */
export const NO_GREED = new Set(['pyromancer']);
/* (claude/minecart) THE GREAT DRILL is on OWN_WARD: its number is its own (src/great-drill.js takeBlow: the cab ALWAYS takes a whole blow - B13/B14, Daniel 10-07 - x2 jammed, nothing while warded); greed is still counted */
export const OWN_WARD = new Set(['greatdrill', 'puppeteer', 'wickerqueen', 'lanterneater', 'duneworm', 'colossus']);   /* (claude/duneworm2) THE DUNE WORM's ward is his CROWN PLATES (src/dune-worm.js wormTake): nothing from the front, whole from behind or on his reared belly, double tangled - B11's guard by angle, not a chip to wait out (B13) */
/* NO OPENING IN CODE, OR NO BLADE EVER REACHES THE BODY: left at full damage (a boss-wave TODO), never made unbeatable */
export const NO_OPENING = {
  mother: 'her body is armoured to every blade already (ARMOURED); the heart node is her opening and it is not the boss',
  kraken: 'no blade reaches the body; the arms carry his openings (knelled, pinned, looking) in krakenHurt',
};
/* MINIS WITH NO OPENING IN CODE: every blow on them counts toward their greed (they keep their damage, so nothing is made unbeatable) */
/* A DUELIST, NOT A PUZZLE: full damage on every hero blow (no chip), his own defence instead - ward faces, dodges, guards (the design standard, B2).
   His OPEN_RULE still names his openings (they pay more in his own code), and greed is still counted outside them (the mash reprisal stays). */
export const FULL_DAMAGE = {
  /* (claude/keyscore, B13 + B15) THE DUELIST'S WALL (src/boss-read.js GUARD 'wall'): off the chip - his front takes ANGLE.front (0.4, told GO ROUND), round or over him whole, his openings 1.5-2x */
  lance: 'B13/B15 (claude/keyscore): plate on his front - 0.4 into it, whole round or over, committed x1.5 (stuck x1.6)', closedhelm: 'B13/B15 (claude/keyscore): his ward faces you - 0.4 into it, whole round or over, his sword on the beat breaks it (x2)',
  captain: 'B13/B15 (claude/keyscore): on his wave or his feet his front is guarded - 0.4 into it, whole round or over, beached x2', quarter: 'B13/B15 (claude/keyscore): her blade offered to the front on guard - 0.4 into it, whole round or over and in her slash and pistol, her blade in a rope x1.5',
  paladinboss: 'a human duelist (design standard B11; Daniel 10-07: "B11 duelist, NOT x0.05 chip"): always hittable, his AEGIS GUARDS BY ANGLE (a blow from the front at his height while he is on guard is turned - and feeds his light; from behind, from above or in his tells and swings it lands and drains it); STARVED of light he FALTERS (x1.8, 3 s): src/paladin-boss.js',
  hawkmistress: 'a human duelist (design standard B11): always hittable, her gauntlet GUARDS BY ANGLE (a blow from the front at her height while she is on guard is turned; from behind or above it lands, and in her tells and strikes every blow lands); her openings pay x1.6 in her own code (claude/ksar)',
  huntmaster: 'a duelist (design standard B11, claude/rootway): always hittable, he GUARDS BY ANGLE between his moves (a blow from his front at his height is turned: GO ROUND, or from above); his openings pay x1.5 (x2 behind the broken mask) in his own code (src/huntmaster.js)',
  fogknight: 'a duelist (design standard B11): always hittable, GUARDS BY STANCE (high: a low blow lands; low: a high blow or a plunge; full: only a plunge, which breaks it); every angle lands in his own blows; his openings pay x1.6 in his own code (claude/towpath)',
  bloodknight: "Daniel 10-03: he shouldn't be invulnerable most of the time, he should play like the player character - FULL DAMAGE, DEFENDS HIMSELF (claude/dk3)",
  roc: 'Daniel 10-06 (claude/roc2): "you can jump on the gliding platforms / thermals and actually hit her, so she does not need to be invulnerable by default" - a beast, always hittable, guarding by HEIGHT (src/roc-eyrie.js take: whole and a little more from the air the level gives, GUARDS LOW from the floor); her plunge and her nest are x1.5',
  greathound: 'Daniel 10-07 (claude/hound): "too difficult simply because he is invincible outside of very small windows ... he should not be invincible" - a beast duelist (B11/B13): always hit for real, his jaws turn part of a blow into his face (GO ROUND), whole from behind or above; his skid and his whine are bonus openings x1.5 (src/great-hound.js)',
  grandmother: 'Daniel 10-08 (claude/underleaf2, scratch/brief-underleaf2.md): "off the x0.05 chip" - always hittable, keyed FROM BEHIND (B11/B13/B14): her front turns a blade (SHE HEARD YOU), her back takes it whole, x2 while she lashes at a lure (a thrown pot, a struck bell-pull), x1.5 in her rap; a told ward after each (src/hush-hands.js granTake)',
  ram: 'a beast duelist (design standard B11, claude/scree2 - Daniel 10-08 "the boss could be better"): always hittable, his HORNS GUARD BY ANGLE (a blow from the front at his height is turned: GO ROUND; from behind, the flank or above it lands); his openings - the cliff dropped on him (x2) and the wall (x1.5) - pay in src/ram-lord.js, and a told ward follows each',
  matriarch: 'a beast duelist (design standard B11): always hittable, her talons GUARD BY ANGLE (a blow from the front at her height is turned; from behind or above it lands); her openings pay x1.6 in her own code (claude/redgorge2)',
  pyromancer: 'Daniel 10-07 (claude/burnvillage2): "the PYROMANCER boss must NEVER be invulnerable: some fire resistance is fine, but he takes real damage normally (B11/B13)" - a hero-turned-boss duelist: a blow lands whole, he READS a run (the third light blow is turned, a heavy goes through) and no burn takes on him (FIREPROOF); water STUNS him x2, then his told steam ward (src/village-water.js)',
};
export const MINI_EVERY_BLOW = new Set(['spider']);   /* (claude/hound: THE GREAT HOUND is off CHIP_MINI and on FULL_DAMAGE - Daniel 10-07, 'he should NOT be invincible') */   /* (claude/bosswave1: the bosun and the great hound have openings now) */
/* MINIS ON THE CHIP (claude/bosswave1, Daniel 10-02: "give each a real opening first, then put minis on the chip"): each has a told opening of
   3 s or more in OPEN_RULE and in its own code, and outside it a hero's blow lands at GREED.chip like a boss's. The rest keep full damage. */
export const CHIP_MINI = new Set(['bosun', 'lancer', 'homunculus', 'hedgewarden']);   /* (claude/hedgewarden4: the Hedge Warden's told opening - his move answered, his sword stuck - 3 s) */
export function install(helpers) { H = helpers || {}; }

/* A MINI'S OPENING IS WORTH A THIRD OF HIM AT MOST (claude/bosswave2, Daniel 10-04, from BOSS WAVE 1's hound and homunculus): one opening
   is never the whole duel. A hero's blows inside one of his openings come off a purse of MINI_CAP of his health; the blow that empties it
   lands what was left, he GATHERS HIMSELF (told over him), and until that opening ends he is shut (openOf false): the rest is his
   outside value - the chip for a mini on CHIP_MINI, his plain blow (no opening's bonus) for the rest. The purse is refilled when the
   opening ends (capStep, every frame). MINI_OWN_CAP already cap their own windows the same way, in their own code. */
export const MINI_CAP = 1 / 3;
export const MINI_OWN_CAP = new Set(['greathound', 'homunculus', 'gangleader']);
const ruleOpen = e => { if (e.broken > 0 && !(e.xpRole === 'mini' && CHIP_MINI.has(e.t))) return true; const r = OPEN_RULE[e.t]; if (!r) return null; try { return !!r(e); } catch { return null; } };
const capped = e => !!e && e.xpRole === 'mini' && !MINI_OWN_CAP.has(e.t);
/* dmg: what his own code made of a hero's blow; raw: the blow before it. Returns what comes off the bar. say(e) tells the shut. */
export function miniCap(e, dmg, raw, say) {
  if (!capped(e) || !(dmg > 0)) return dmg;
  if (e.capShut) return CHIP_MINI.has(e.t) ? dmg : Math.min(dmg, Math.max(1, Math.round(raw)));   /* shut: chipOf already scratched a chip mini; the rest lose the opening's bonus */
  if (ruleOpen(e) !== true) return dmg;
  if (e.capLeft === undefined) e.capLeft = Math.max(1, Math.round((e.maxHp || e.hp0 || e.hp) * MINI_CAP));
  if (dmg < e.capLeft) { e.capLeft -= dmg; return dmg; }
  const out = e.capLeft; e.capLeft = 0; e.capShut = true; e.capN = (e.capN || 0) + 1; if (say) say(e);
  return out;
}
/* every frame for a mini with a purse open: the opening over, the purse is full again and he can be opened again */
export function capStep(e) { if (!capped(e) || (e.capLeft === undefined && !e.capShut)) return; if (ruleOpen(e) !== true) { e.capLeft = undefined; e.capShut = false; } }

/* IS HE OPEN? true / false for a boss or mini with a rule, null for anything else (the boss lab's own fallback then answers) */
export function openOf(e) {
  if (!e) return null;
  if (e.capShut && capped(e)) return false;   /* (claude/bosswave2) a mini who has given a third of himself to this opening has gathered himself: shut until it ends */
  if (e.broken > 0 && !(e.xpRole === 'mini' && CHIP_MINI.has(e.t))) return true;   /* (claude/bosswave1) a mini on the chip is open only in his own told opening: broken he is stood still, not opened - the
     mash bot broke them with taps and a spear held out, and took the Serjeant and the Great Hound in those breaks */
  const r = OPEN_RULE[e.t]; if (!r) return null;
  try { return !!r(e); } catch { return null; }
}
/* DOES THE CHIP APPLY TO HIM? (a boss, with a rule, not on the no-opening list) */
export const chipped = (e, isBoss) => !!(e && (isBoss || (e.xpRole === 'mini' && CHIP_MINI.has(e.t))) && OPEN_RULE[e.t] && !NO_OPENING[e.t] && !FULL_DAMAGE[e.t]);

/* THE CHIP, at the tail of wardedDamage: dmg is what his own code made of the blow, raw what the blow was before any of it.
   Returns what comes off the bar. Called only for a hero's blow (or his burn) on THE boss. */
export function chipOf(e, dmg, raw) {
  if (!(dmg > 0) || OWN_WARD.has(e.t) || openOf(e)) return dmg;
  const c = Math.max(0, raw) * (GREED.chipBy[e.t] ?? GREED.chip);
  if (dmg <= c) return dmg;                       /* his own ward already took it lower: never a chip of a chip */
  e.chipAcc = (e.chipAcc || 0) + c;               /* a twentieth of a small blow is a fraction: it is kept, not rounded up to a whole point */
  const out = Math.floor(e.chipAcc); e.chipAcc -= out; e.chipT = 0.25;
  return out;
}

/* A HERO'S BLOW LANDED ON HIM OUTSIDE AN OPENING: count it, and start the reprisal when it is greed. Returns true if it began. */
export function noteGreed(e, time, isBoss, isMini) {
  if (!e || !e.alive || !(isBoss || isMini) || e.mode === 'sleep' || NO_OPENING[e.t] || NO_GREED.has(e.t)) return false;
  if (openOf(e)) { e.greedLog = []; return false; }   /* a blow in an opening is the right blow: the count starts again */
  if (e.greedT > 0 || (e.greedCd || 0) > time) return false;
  const log = (e.greedLog || []).filter(t => time - t <= GREED.window); log.push(time); e.greedLog = log;
  if (log.length < (isBoss ? GREED.n : GREED.nMini)) return false;
  e.greedLog = []; e.greedT = GREED.tell; e.greedCd = time + GREED.tell + (isBoss ? GREED.cool : GREED.coolMini); e.greedMini = !isBoss; e.greedN = (e.greedN || 0) + 1;
  return true;
}
/* how many greedy blows he has taken toward the next reprisal (the boss lab's bot reads it, as a player reads the boss) */
export const greedCount = (e, time) => (e && e.greedLog ? e.greedLog.filter(t => time - t <= GREED.window).length : 0);

/* EVERY FRAME, for a boss or mini whose reprisal is coming. c = { P, dt, time, hurt(e, dmg), ring(x, y, r, col, life), mark(e), boom(e) } */
export function greedStep(e, c) {
  if (e.chipT > 0) e.chipT -= c.dt;
  if (!(e.greedT > 0)) return;
  if (!e.alive) { e.greedT = 0; return; }
  const t0 = e.greedT; e.greedT -= c.dt;
  if (t0 >= GREED.tell - 1e-6) c.mark(e);                                                  /* the !! goes up as it begins */
  const k = Math.max(0, e.greedT / GREED.tell), r = (GREED.reach + (e.w || 20) / 2) * (0.35 + 0.65 * k);
  if (Math.floor(t0 * 20) !== Math.floor(e.greedT * 20)) c.ring(e.x, e.y - (e.h || 20) / 2, r, '#ff6b6b', 0.12);   /* the ring closes on him */
  if (e.greedT > 0) return;
  e.greedT = 0; c.boom(e);
  const P = c.P; if (!P || P.dead) return;
  if (Math.abs(P.x - e.x) <= GREED.reach + (e.w || 20) / 2 && P.y > e.y - (e.h || 20) - GREED.reachY && P.y < e.y + 24) c.hurt(e, e.greedMini ? GREED.dmgMini : GREED.dmg);
}
