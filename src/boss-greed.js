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
import { sextonOpen } from './sexton.js';
import { hedgeOpen } from './hedge-warden.js';
import { brOpen, bkOpen } from './unburied-foes.js';
import { wardenOpen as graveOpen } from './grave-warden.js';

export const GREED = {
  chip: 0.05,      // outside an opening a hero's blow lands at a twentieth (docs/NEW-LEVEL-CHECKLIST.md "x0.05 chip otherwise")
  n: 4,            // blows outside an opening inside `window` that provoke the reprisal (a boss)
  nMini: 5,        // and a mini: he takes his blows whole, so it takes one more to make him answer
  window: 2.5,     // s: the greedy blows have to come this close together to count as one greed
  tell: 0.6,       // s: the reprisal's told windup (two and a half human reactions: ~250 ms each)
  cool: 3.0,       // s after a reprisal before greed is counted again
  reach: 60,       // px either side of his centre the burst reaches (plus half his body)
  reachY: 52,      // px above his feet (and a little below)
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
  ram: e => H.ramOpen(e),                                                    // into the wall, or off his leap
  owl: e => e.mode === 'crash' || e.mode === 'grounded' || e.mode === 'pinned' || e.lampT > 0,
  abbot: e => abbotOpen(e),                                                  // the bell has him down
  windcaller: e => H.callerOpen(e),                                          // between stones nothing is there anyway
  lance: e => H.lanceOpen(e),                                                // committed: planted, thrusting, reeling
  gqueen: e => H.gqOpen(e),                                                  // pinned, or her plate off
  herald: e => e.mode === 'mired' || e.mode === 'reel',
  reefmaw: e => e.mode === 'stuck' || e.mode === 'reel' || e.mode === 'beached',
  quarter: e => e.mode === 'cut' || e.mode === 'reel',                       // her blade in a rope
  captain: e => e.mode === 'beach' || e.mode === 'reel',                     // beached on his own planking
  tollmaster: e => e.open > 0,                                               // both hands over his head
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
  bloodknight: e => bkOpen(e),                                               // stuck
  duneworm: e => !!(e.st && wormOpen(e.st)),                                 // tangled in the awning
  wickerqueen: e => wqOpen(e),                                               // burning
  puppeteer: e => pupOpen(e),                                                // downed or jolted
  /* THE MINIS (greed only: they keep their damage) */
  lampreeve: e => e.open > 0, homunculus: e => e.open > 0, ploughman: e => e.open > 0,
  gravewarden: e => graveOpen(e), forgemaster: e => H.forgeOpen(e), golem: e => e.crackT > 0 || e.mode === 'stagger',
  lancer: e => !e.mounted || e.mode === 'blown' || e.mode === 'rear' || e.mode === 'reel' || e.open > 0,
  barrowrider: e => brOpen(e), sexton: e => sextonOpen(e), hedgewarden: e => hedgeOpen(e),
};
/* BOSSES WITH THEIR OWN TWENTIETH: the rule leaves their number alone (it would be a twentieth of a twentieth) and only counts greed */
export const OWN_WARD = new Set(['puppeteer', 'wickerqueen', 'greenteeth']);
/* NO OPENING IN CODE, OR NO BLADE EVER REACHES THE BODY: left at full damage (a boss-wave TODO), never made unbeatable */
export const NO_OPENING = {
  grandmother: 'TODO boss wave: no opening in code (only a vanish that nothing hits); left at full damage',
  mother: 'her body is armoured to every blade already (ARMOURED); the heart node is her opening and it is not the boss',
  kraken: 'no blade reaches the body; the arms carry his openings (knelled, pinned, looking) in krakenHurt',
};
/* MINIS WITH NO OPENING IN CODE: every blow on them counts toward their greed (they keep their damage, so nothing is made unbeatable) */
export const MINI_EVERY_BLOW = new Set(['bosun', 'greathound', 'spider']);
export function install(helpers) { H = helpers || {}; }

/* IS HE OPEN? true / false for a boss or mini with a rule, null for anything else (the boss lab's own fallback then answers) */
export function openOf(e) {
  if (!e) return null;
  if (e.broken > 0) return true;
  const r = OPEN_RULE[e.t]; if (!r) return null;
  try { return !!r(e); } catch { return null; }
}
/* DOES THE CHIP APPLY TO HIM? (a boss, with a rule, not on the no-opening list) */
export const chipped = (e, isBoss) => !!(e && isBoss && OPEN_RULE[e.t] && !NO_OPENING[e.t]);

/* THE CHIP, at the tail of wardedDamage: dmg is what his own code made of the blow, raw what the blow was before any of it.
   Returns what comes off the bar. Called only for a hero's blow (or his burn) on THE boss. */
export function chipOf(e, dmg, raw) {
  if (!(dmg > 0) || OWN_WARD.has(e.t) || openOf(e)) return dmg;
  const c = Math.max(0, raw) * GREED.chip;
  if (dmg <= c) return dmg;                       /* his own ward already took it lower: never a chip of a chip */
  e.chipAcc = (e.chipAcc || 0) + c;               /* a twentieth of a small blow is a fraction: it is kept, not rounded up to a whole point */
  const out = Math.floor(e.chipAcc); e.chipAcc -= out; e.chipT = 0.25;
  return out;
}

/* A HERO'S BLOW LANDED ON HIM OUTSIDE AN OPENING: count it, and start the reprisal when it is greed. Returns true if it began. */
export function noteGreed(e, time, isBoss, isMini) {
  if (!e || !e.alive || !(isBoss || isMini) || e.mode === 'sleep' || NO_OPENING[e.t]) return false;
  if (openOf(e)) { e.greedLog = []; return false; }   /* a blow in an opening is the right blow: the count starts again */
  if (e.greedT > 0 || (e.greedCd || 0) > time) return false;
  const log = (e.greedLog || []).filter(t => time - t <= GREED.window); log.push(time); e.greedLog = log;
  if (log.length < (isBoss ? GREED.n : GREED.nMini)) return false;
  e.greedLog = []; e.greedT = GREED.tell; e.greedCd = time + GREED.tell + GREED.cool; e.greedN = (e.greedN || 0) + 1;
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
  if (Math.abs(P.x - e.x) <= GREED.reach + (e.w || 20) / 2 && P.y > e.y - (e.h || 20) - GREED.reachY && P.y < e.y + 24) c.hurt(e, GREED.dmg);
}
