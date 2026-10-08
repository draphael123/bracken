// src/foe-react.js - THE COMBAT PASS, PART 2: REACTIVE FOES, VARIED SWINGS, SQUADS WITH ROLES, THE RAMP BY ACT (claude/combat2, 2026-10-05).
//
// Daniel, 2026-10-03: "How can we make regular enemies more difficult and levels more difficult?" - deadlier one-on-one through damage and
// AI, never through more health. Part 1 (src/attack-tokens.js) decides WHO may swing at a hero; src/foe-tempo.js tightens the tells;
// src/foe-tactics.js holds a few swings and gives the shield, the archer and the brute their own way of waiting. This builds the rest on
// the hooks part 1 left (TOKENS.cap / priority / waitMove, claim(), board.on.grant):
//
//   REACTIVE FOES
//     FLANK      a waiting foe on the crowded side, with the hero's back to an empty side, walks round to take the ring BEHIND him.
//     GUARD      cover kinds (a shield, a tide guard, a soldier...) waiting their turn keep their front to the hero at their own pace.
//     BACK OFF   a foe stood in front of a hero whose HEAVY is charging (the told glow) gives ground until it is let go - sometimes.
//     WHIFF      a hero's swing that meets nothing hands the nearest foe its turn early: a token granted now, its blow ready now.
//     MASHED     a common foe cut REACT.mashAt times in a flurry raises its GUARD (told: the guard drawn up in front of it, a clank on
//                every cut it turns, the word COVERED): light cuts off its front are turned until it drops it, and when it drops it, it
//                RIPOSTES (its turn granted at once). A heavy blow breaks the guard; a sweep goes under it; behind it there is none.
//   VARIED SWINGS (board.on.grant) - the same windup with three release timings, each told: QUICK (a white flash at the weapon as it
//     starts), PLAIN, HELD (the weapon glints, held high, until it comes down). And FEINTS for the families whose kit fits a feint
//     (the cutthroat's pattern, generalised): the first release is a STAMP (dust, the feint's scrape, the mark stays up) and the real
//     blow follows a beat later.
//   SQUADS WITH ROLES (e.squad, from the level builder's designed encounters): FRONT (a cover kind) presses in shield-first; BACK (a
//     ranged kind) keeps bow range behind it; FLANK (the rest) goes round the hero to the empty side; a PINCER claims two tokens at once
//     for members on both sides of him. A heavy (red !!) is still thrown alone: it costs the whole purse (TOKENS.cost).
//   THE RAMP BY ACT (ACTS): the purse 2 early -> 3 in the last act, later-act common foes HIT HARDER (a damage tier, never more
//     health), and in later acts a mashed foe guards a cut sooner.
//
// main.js hooks it with: installReact (beside installTactics), RX.frame (top of updateEnemies), RX.pre + RX.hold (beside tokenPre /
// tokenHold), RX.guards (the melee hit loop, beside the brute's braceHit), RX.tier (damagePlayer0) and RX.draw (beside drawPoise).
// FOR ELITES2 and the LEVEL SWEEP: REACT.eligible, roleOf, readyNow, ACTS (purse + damage tier per act) and ROSTER (each act's foes by squad role) are exported; an elite is left out of every rule here (e.elite).

export const ACTS = [
  /* act: the purse (TOKENS.cap), the damage tier on a common foe's blow, and the cut of a flurry that raises a mashed foe's guard */
  { act: 1, name: 'THE GREENWOOD', cap: 2, dmg: 1.0, mashAt: 3, levels: ['wood', 'marsh', 'stockade', 'spore', 'burning', 'kings'] },
  { act: 2, name: 'THE CRAGS', cap: 2, dmg: 1.1, mashAt: 3, levels: ['scree', 'underleaf', 'hanging', 'spire', 'moor', 'skyroad', 'oreroad', 'storm', 'crown', 'undercrown'] },
  { act: 3, name: 'THE SEA', cap: 2, dmg: 1.2, mashAt: 2, levels: ['longwater', 'reef', 'flotilla', 'hurricane', 'lamplit', 'deep', 'keep', 'causeway', 'harbor'] },
  { act: 4, name: 'THE OLD KINGDOM', cap: 2, dmg: 1.25, mashAt: 2, levels: ['waymeet', 'canal', 'theatre', 'fair', 'fields', 'burial', 'witchlight', 'mage', 'unburied', 'fallingtower', 'church'] },
  { act: 5, name: 'THE DESERT', cap: 3, dmg: 1.3, mashAt: 2, levels: ['caravan', 'welltown', 'underwell', 'redgorge', 'glasssea', 'ksar'] },
];
/* THE DIFFICULTY PILOT'S WEIGHT (claude/levelpilot, scratch/brief-levelsweep.md v2: SALT & SANCTUARY - fewer, weightier foes, every one a 1v1 threat at the
   campaign level; 'act damage scaling, no hp sponges'). A level reworked to the v2 recipe may stand its common foes' blows a step over its act's tier
   (x this on ACTS[act].dmg; health never moves). The walker (tools/level-walk.mjs) read a campaign-level hero (L20, three skills) at THE DROWNED CAUSEWAY
   taking 5-28 blows a whole run and reaching every shrine at 70-90%: a blow cost him a sixth of his bar. x1.5 puts a common blow near a fifth
   (1.4 / 1.5 / 1.7 were walked: the bot is hit too rarely for it to move his numbers much - most of what lands is from range - so this is set for a
   person, who is hit more often than the walker). The per-act lanes fold this into ACTS[].dmg
   once Daniel has played the pilot; until then it is one level's knob, so the rest of the act is untouched. */
export const LEVEL_DMG = { causeway: 1.5, church: 1.5 };   /* (claude/litchurch: THE LIT CHURCH, built to difficulty v2 - its dead and its clergy alike) */
/* a level not in the table (a new one, a trial, the shop) takes the act of its depth on the gate chain, else act 1 */
const DEPTH_ACT = [[29, 5], [21, 4], [12, 3], [5, 2], [0, 1]];
export function actOf(id, depth) {
  const a = ACTS.find(q => q.levels.includes(id)); if (a) return a;
  if (typeof depth === 'number') for (const [d, n] of DEPTH_ACT) if (depth >= d) return ACTS[n - 1];
  return ACTS[0];
}

export const REACT = {
  on: true,
  // MASHED: the guard
  mashWindow: 2.0,    // s: cuts closer together than this are one flurry (a masher lands one about every second: the ring and the push keep him off)
  pendT: 1.5,         // s: a flurry that ended in its windup or its recovery (the hero's openings, left whole) raises the guard when it is next stood about
  guardT: 1.0,        // s the guard stays up
  guardTurns: 3,      // cuts it turns before it drops it anyway
  guardCd: 2.2,       // s after it drops before it can guard again (mashing still gets through - slowly, and paid for)
  push: 130,          // px/s: the hero is pushed off a turned cut
  // WHIFF
  whiffR: 90, whiffChance: 0.6, whiffCd: 0.9,
  // BACK OFF a told heavy
  backR: 80, backChance: 0.6, backT: 0.7, backCd: 1.2, backSpd: 1.3,
  // FLANK
  flankChance: 0.5, flankCd: 2.5, flankSpd: 1.15,
  // GUARD (waiting cover kinds turn their front round at this pace)
  coverTurn: 0.8,
  // VARIED SWINGS
  heldChance: 0.25, heldAdd: [0.2, 0.3], quickChance: 0.15, quick: 0.8, quickFloor: 0.3,
  feintChance: 0.22, feintPause: 0.32,
  // SQUADS
  pincerR: 150, pincerCd: 4, backRing: 112, frontPress: 16,
  // which foes take part (a kind not walking - a flyer, a swimmer - waits on its own AI; an elite is ELITES2's)
  eligible: null,     // set by installReact
};

/* THE ROLES (squads and the rules above). A COVER kind holds a guard of its own (a shield, a haft, a plate): it is never 'mashed', it
   guards by facing you. A RANGED kind keeps its distance. Everything else is melee and may flank. */
export const COVER = new Set(['shield', 'tideguard', 'soldier', 'watch', 'merrowbrute', 'heavy', 'swornsword', 'bellguard', 'pike', 'turtle', 'crab', 'brute']);
export const RANGED = new Set(['archer', 'crossbow', 'javelin', 'spit', 'spitter', 'spitcap', 'thorn', 'shaman', 'stormshaman', 'bonearcher', 'slinger', 'scout', 'rockgoblin', 'netter', 'drunk', 'tippler', 'scalder',
  'apprentice', 'gobmage', 'undeadmage', 'seawitch', 'merrowcaller', 'priest', 'gobpriest', 'marine', 'merrowspear', 'boarder', 'sapper', 'haunt', 'weaver', 'horn', 'lanternshade']);
export const roleOf = e => COVER.has(e.t) ? 'front' : RANGED.has(e.t) ? 'back' : 'flank';
/* the windups a FEINT fits: a blade or a haft drawn back in the hands (a bite, a spit, a grab or a spell does not feint) */
export const FEINT = new Set(['soldier|slashTell', 'cutlass|slashTell', 'sailor|hookTell', 'tideguard|thrustTell', 'bonecorsair|cutTell', 'farmhand|swingTell', 'miner|swingTell',
  'armour|swingTell', 'assassin|stabTell', 'burngob|swingTell', 'drownedknight|lungeTell', 'drownedcaptain|lungeTell', 'bellguard|hookTell', 'snuffer|swipeTell', 'watch|thrustTell']);

/* THE ACT ROSTER (for the level difficulty sweep, Daniel 10-05): which foe families - and which regional variants of a proven AI - belong to each act,
   by squad role (roleOf: front = a cover kind, flank = melee, back = ranged/caster), plus the act's heavy and support. Read off the levels as built
   (every kind below stands in that act's levels today). A designed squad for a level of act N is made from act N's roster; a kind from an EARLIER
   act may come back reskinned (cnSkin) to fit the place, never a living goblin past the Goblin Queen (theme fit; undead bonegob is fine). */
export const ROSTER = {
  1: { front: ['shield', 'pike', 'soldier'], flank: ['sprig', 'hound', 'thief', 'badger', 'lurker', 'swornsword'], back: ['archer', 'thorn', 'spit', 'spitcap', 'weaver', 'stormshaman'],
       heavy: ['brute', 'heavy'], support: ['sapper', 'horn'], note: 'goblin woods and the stockade: the shield-covers-the-bow lesson' },
  2: { front: ['shield', 'pike', 'soldier'], flank: ['sprig', 'cutter', 'miner', 'goat', 'hound', 'assassin', 'hearthgob', 'sheargob'], back: ['rockgoblin', 'archer', 'javelin', 'gobmage', 'scalder', 'skybolt'],
       heavy: ['brute', 'troll', 'heavy', 'berserker', 'golem'], support: ['gobpriest', 'horn', 'sentry', 'snuffer', 'sapper'], note: 'the crags and the goblin court: priests and bells to kill first' },
  3: { front: ['tideguard', 'watch', 'bellguard', 'merrowbrute'], flank: ['cutlass', 'sailor', 'boarder', 'bonecorsair', 'drownedknight', 'crab', 'wight'], back: ['scout', 'netter', 'marine', 'merrowspear', 'lookout', 'seawitch'],
       heavy: ['merrowbrute', 'drownedknight', 'holdfast', 'tidemarauder'], support: ['bosun', 'merrowcaller', 'lanternshade', 'snuffer'], water: ['eel', 'angler', 'urchin', 'puffer', 'lamprey', 'siren', 'manta', 'jelly'],
       note: 'the sea: fights in the tide and the swim; water foes hold the water, boarders the decks' },
  4: { front: ['swornsword', 'hedgeknight', 'armour', 'heavy'], flank: ['zombie', 'husk', 'runner', 'hound', 'bonegob', 'farmhand', 'mummer', 'hobbyhorse', 'broom'], back: ['bonearcher', 'crossbow', 'apprentice', 'haunt', 'drunk', 'archer'],
       heavy: ['hedgeknight', 'armour', 'barrowrider', 'brute'], support: ['bannerbearer', 'gobpriest', 'barker', 'snuffer'], note: 'the old kingdom: knights, the risen dead and the fair folk - a banner or a priest to kill first' },
  5: { front: ['shield'], flank: ['cutthroat', 'scorpion', 'waterthief', 'ambusher', 'raptor'], back: ['slinger', 'archer', 'gobmage'], heavy: ['scorpion', 'sandworm'], support: ['sapper', 'vulture'],
       note: 'the desert: feinting cutthroats, slingers on the ledges, every fight in the sun or the flood' },
};
let ACT = ACTS[0];
export const act = () => ACT;

/* A FOE'S TURN, NOW (the whiff, the riposte, the pincer): its rest and its denial cleared, its blow off cooldown, and a token claimed for it
   if the purse has room. It still winds up with its own told windup: nothing here is untold. */
export function readyNow(board, hero, e, claim, tail = 1.0) {
  e.tokRest = 0; e.tokDeny = 0; e.tokOut = false; if (typeof e.cd === 'number') e.cd = Math.min(e.cd, 0.05);
  if (e.tokHeld) return true;
  if (claim(board, hero, e)) { e.tokTail = tail; return true; }
  return false;
}

export function installReact(board, TOKENS, api) {
  /* api: { levelId(), depth(id), claim, windingUp(e), walker(e), safeStep(x, y), move(e, dx), charging(hero), sfx: { clank, feint }, dust(x, y) } */
  REACT.eligible = e => !!(e && e.alive && !e.elite && !TOKENS.exempt(e) && !e.big && api.walker(e));
  const stats = board.stats;
  /* THE PURSE BY ACT: what part 1 and the squad hook already add, plus the act's step over two */
  const prevCap = TOKENS.cap;
  TOKENS.cap = hero => prevCap(hero) + Math.max(0, ACT.cap - TOKENS.perHero);
  /* WHO IS SERVED FIRST: a riposte and a punished whiff come before anyone else's ordinary turn */
  const prevPri = TOKENS.priority;
  TOKENS.priority = e => prevPri(e) + (e.rxFirst > 0 ? 2 : 0);

  /* VARIED SWINGS AND FEINTS, on the grant (after the tempo cut and the tactics' held wind-ups) */
  const prevGrant = board.on.grant;
  board.on.grant = e => {
    if (prevGrant) prevGrant(e);
    e.rxVary = null; e.rxFeint = false;
    if (!REACT.on || e.tokHeavy || e.heldWind || (e.tokSnap && e.tokSnap.wu) || !(e.modeT > REACT.quickFloor) || !REACT.eligible(e) || !api.windingUp(e)) return;   /* (a token claimed for a foe not yet winding up - a whiff, a riposte, a pincer - varies nothing: its timer is not a tell) */
    const key = e.t + '|' + e.mode, r = Math.random();
    if (FEINT.has(key) && r < REACT.feintChance) { e.rxFeint = true; stats.feints = (stats.feints || 0) + 1; return; }
    if (r < REACT.feintChance + REACT.heldChance) { const add = REACT.heldAdd[0] + Math.random() * (REACT.heldAdd[1] - REACT.heldAdd[0]); e.modeT += add; e.rxVary = 'held'; stats.helds = (stats.helds || 0) + 1; }
    else if (r < REACT.feintChance + REACT.heldChance + REACT.quickChance && e.modeT * REACT.quick >= REACT.quickFloor) { e.modeT *= REACT.quick; e.rxVary = 'quick'; e.rxFlash = 0.12; stats.quicks = (stats.quicks || 0) + 1; }
  };

  /* WAITING BY ROLE, AND THE FLANK */
  const prevWait = TOKENS.waitMove;
  const coverWait = (e, hero, a, dt) => {   /* the front holds its guard to you, and comes round at its own pace */
    const f0 = e.face; prevWait(e, hero, a, dt); const want = Math.sign(hero.x - e.x) || f0;
    if (f0 !== want) { e.rxTurnT = (e.rxTurnT || 0) + dt; if (e.rxTurnT >= REACT.coverTurn) { e.face = want; e.rxTurnT = 0; } else e.face = f0; } else e.rxTurnT = 0;
  };
  TOKENS.waitMove = (e, hero, a, dt) => {
    if (!REACT.on || !REACT.eligible(e)) return prevWait(e, hero, a, dt);
    const side = Math.sign(e.x - hero.x) || 1, role = roleOf(e);
    if (e.squad && role === 'back') e.tokRing = Math.max(e.tokRing || 0, REACT.backRing);
    if (e.squad && role === 'front' && e.t !== 'shield') e.tokRing = Math.max(30, (e.tokRing || 0) - REACT.frontPress);
    if (e.rxFlank) { if (flankStep(e, hero, a, dt)) return; }
    else if (role === 'flank' && !(e.rxFlankCd > 0)) {
      const sides = board.rxSides && board.rxSides.get(hero), here = sides ? sides[side > 0 ? 1 : 0] : 0, there = sides ? sides[side > 0 ? 0 : 1] : 0;
      const farOne = (e.tokRing || 0) > TOKENS.ring + 1;   /* not the nearest on its side: the nearest holds the front */
      const backTurned = (Math.sign(hero.face || 1) === side) || !!e.squad;   /* his back is to the empty side (a squad goes round anyway) */
      if (here >= 2 && there === 0 && farOne && backTurned) {
        if (Math.random() < REACT.flankChance) { e.rxFlank = -side; stats.flanks = (stats.flanks || 0) + 1; if (flankStep(e, hero, a, dt)) return; }
        else e.rxFlankCd = REACT.flankCd;
      }
    }
    if (COVER.has(e.t) && e.t !== 'shield') return coverWait(e, hero, a, dt);   /* (the shield has its own in src/foe-tactics.js) */
    return prevWait(e, hero, a, dt);
  };
  /* ROUND THE HERO: past him (a weapon foe's touch costs nothing - the touch rule) to the ring on his other side. False when done or blocked */
  function flankStep(e, hero, a, dt) {
    const s = e.tokSnap; if (!s || Math.abs(e.x - s.x) > 6 || e.knock > 0 || e.stagger > 0) { e.rxFlank = 0; return false; }
    const goal = hero.x + e.rxFlank * (TOKENS.ring + 6), dx = goal - s.x;
    if (Math.abs(dx) < 6 || (e.rxFlankT = (e.rxFlankT || 0) + dt) > 3) { e.rxFlank = 0; e.rxFlankT = 0; e.rxFlankCd = REACT.flankCd; e.rxFlanked = (e.rxFlanked || 0) + 1; return false; }
    const v = Math.sign(dx) * Math.min(e.speed || 40, 60) * REACT.flankSpd;
    if (!a.safeStep(s.x + Math.sign(v) * ((e.w || 10) / 2 + 3), e.y)) { e.rxFlank = 0; e.rxFlankT = 0; e.rxFlankCd = REACT.flankCd; return false; }
    e.x = s.x; e.vx = v; e.face = Math.sign(hero.x - e.x) || e.face; a.move(e, v * dt);
    return true;
  }

  /* ONCE A FRAME, BEFORE ANY FOE THINKS: the act, the ring's sides, the hero's whiff, the squads' pincers */
  function frame(heroes, enemies, dt) {
    { const id = api.levelId(), a = actOf(id, api.depth(id)), k = LEVEL_DMG[id]; ACT = k ? (ACT.lvlId === id ? ACT : { ...a, dmg: Math.round(a.dmg * k * 100) / 100, lvlId: id }) : a; }   /* (LEVEL_DMG: the difficulty pilot's weight on top of the act) */
    const sides = board.rxSides = new Map();
    for (const e of enemies) { if (!e.alive || !e.tokRing || !e.tokHero) continue; let s = sides.get(e.tokHero); if (!s) sides.set(e.tokHero, s = [0, 0]); s[e.x > e.tokHero.x ? 1 : 0]++; }
    if (!REACT.on) return;
    for (const hero of heroes) {
      /* THE WHIFF: a swing (not a plunge) that ended having met nothing */
      const sw = hero.rxSw || (hero.rxSw = { on: false, hit: 0 }); if (hero.rxWhiffCd > 0) hero.rxWhiffCd -= dt;
      if (hero.atk >= 0 && !hero.plunge && !hero.dead) { if (!sw.on) { sw.on = true; sw.hit = 0; } sw.hit = Math.max(sw.hit, hero.hitSet ? hero.hitSet.size : 0); }
      else if (sw.on) { sw.on = false;
        if (!sw.hit && !hero.dead && !(hero.rxWhiffCd > 0)) { let best = null, bd = REACT.whiffR;
          for (const e of enemies) { if (!REACT.eligible(e) || e.tokHero !== hero || api.windingUp(e) || e.rxGuard > 0 || e.knock > 0 || e.stagger > 0.3 || Math.abs(e.y - hero.y) > 30) continue; const d = Math.abs(e.x - hero.x); if (d < bd) { bd = d; best = e; } }
          if (best) { hero.rxWhiffCd = REACT.whiffCd; if (Math.random() < REACT.whiffChance && readyNow(board, hero, best, api.claim, 0.9)) { best.rxFirst = 0.6; best.face = Math.sign(hero.x - best.x) || best.face; stats.whiffs = (stats.whiffs || 0) + 1; } } } }
      /* THE PINCER: two of one squad, one on each side of him, and nobody else swinging - both are given their turn at once */
      if ((board.held.get(hero) || new Set()).size === 0) {
        const near = enemies.filter(e => e.squad && REACT.eligible(e) && e.tokHero === hero && !e.tokHeld && !api.windingUp(e) && !(e.rxGuard > 0) && roleOf(e) !== 'back' && Math.abs(e.x - hero.x) < REACT.pincerR && Math.abs(e.y - hero.y) < 30);
        const bySq = new Map(); for (const e of near) { let l = bySq.get(e.squad); if (!l) bySq.set(e.squad, l = []); l.push(e); }
        for (const [sq, l] of bySq) { const pc = board.rxPincer || (board.rxPincer = new Map()); if ((pc.get(sq) || 0) > 0) continue;
          const L0 = l.filter(e => e.x < hero.x).sort((a, b) => b.x - a.x)[0], R0 = l.filter(e => e.x >= hero.x).sort((a, b) => a.x - b.x)[0];
          if (L0 && R0 && TOKENS.cap(hero) >= 2) { readyNow(board, hero, L0, api.claim, 1.2); readyNow(board, hero, R0, api.claim, 1.2); L0.rxFirst = R0.rxFirst = 0.6; pc.set(sq, REACT.pincerCd); stats.pincers = (stats.pincers || 0) + 1; break; } }
      }
    }
    if (board.rxPincer) for (const [k, v] of board.rxPincer) board.rxPincer.set(k, v - dt);
  }

  /* BEFORE ONE FOE THINKS: its timers, the feint, backing off a charging heavy. (hero: the hero it answers to this frame) */
  function pre(e, hero, dt) {
    if (e.rxFirst > 0) e.rxFirst -= dt; if (e.rxFlash > 0) e.rxFlash -= dt; if (e.rxClank > 0) e.rxClank -= dt; if (e.rxStamp > 0) e.rxStamp -= dt;
    if (e.rxFlankCd > 0) e.rxFlankCd -= dt; if (e.rxBackCd > 0) e.rxBackCd -= dt; if (e.rxGuardCd > 0) e.rxGuardCd -= dt;
    if (e.rxGuard > 0 && (e.rxGuard -= dt) <= 0) dropGuard(e, hero);
    const wu = api.windingUp(e);
    if (e.rxGuardPend > 0) { e.rxGuardPend -= dt; if (!wu && !(e.rxGuard > 0) && !e.tokHeld && TOKENS.standing(e) && !(e.stagger > 0) && REACT.eligible(e)) raiseGuard(e); }   /* (a pending guard: up when its blow and its recovery are done) */
    if (!wu) { e.rxVary = null; if (e.rxFeint && !e.tokHeld) e.rxFeint = false; }
    /* THE FEINT: about to come down, it stamps instead - and the real one follows */
    if (wu && e.rxFeint && e.modeT > 0 && e.modeT <= dt * 1.5) { e.rxFeint = false; e.modeT += REACT.feintPause; e.rxStamp = 0.25; if (api.dust) api.dust(e.x + (e.face || 1) * 5, e.y); if (api.sfx.feint) api.sfx.feint(); stats.stamps = (stats.stamps || 0) + 1; }
    /* BACKING OFF: a foe in front of a charging heavy, not mid-blow, sometimes gives ground until it is let go */
    if (REACT.on && !wu && !(e.rxBack > 0) && !(e.rxBackCd > 0) && hero && api.charging(hero) && REACT.eligible(e) && !e.tokHeld && Math.abs(e.x - hero.x) < REACT.backR && Math.abs(e.y - hero.y) < 30 && Math.sign(e.x - hero.x) === (hero.face || 1)) {
      e.rxBackCd = REACT.backCd; if (Math.random() < REACT.backChance) { e.rxBack = REACT.backT; stats.backs = (stats.backs || 0) + 1; } }
    if (e.rxBack > 0 && (!hero || !api.charging(hero))) e.rxBack = Math.min(e.rxBack, 0.15);
  }
  /* SITTING ITS OWN AI OUT: guarding, or giving ground. True: skip the creature's update this frame (it still falls) */
  function hold(e, hero, dt) {
    if (!(e.rxGuard > 0) && !(e.rxBack > 0)) return false;
    if (e.knock > 0 || e.broken > 0 || e.pinned > 0 || e.carried > 0 || !api.walker(e)) { e.rxBack = 0; if (e.rxGuard > 0) dropGuard(e, hero, true); return false; }
    e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); const r = api.fall(e, e.vy * dt); if (r && r.ground) e.vy = 0;
    if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
    if (e.rxBack > 0) { e.rxBack -= dt; const away = Math.sign(e.x - (hero ? hero.x : e.x)) || -e.face, v = away * Math.min(e.speed || 40, 60) * REACT.backSpd;
      if (api.safeStep(e.x + away * ((e.w || 10) / 2 + 3), e.y)) { e.vx = v; api.move(e, v * dt); } else e.rxBack = 0; }
    else e.vx = 0;
    return true;
  }
  function raiseGuard(e) { e.rxGuardPend = 0; e.rxGuard = REACT.guardT; e.rxTurned = 0; e.rxClank = 0.12; stats.guards = (stats.guards || 0) + 1; if (api.sfx.clank) api.sfx.clank(); }
  function dropGuard(e, hero, broken) {
    e.rxGuard = 0; e.rxGuardCd = REACT.guardCd; e.rxCuts = 0;
    if (broken || !e.alive || !hero || hero.dead) return;
    /* THE RIPOSTE: it lowers the guard into its own blow */
    if (readyNow(board, hero, e, api.claim, 0.9)) { e.rxFirst = 0.6; stats.ripostes = (stats.ripostes || 0) + 1; }
  }
  /* THE MASHED FOE (the melee hit loop, a cut that met e): true means the cut is TURNED. heavy: a heavy blow (it goes through, and breaks a
     guard that is up) - the HELD heavy (P.heavy), not a combo's third cut, which a mashing hand throws for free; front: the cut came off its
     front (a sweep is never 'front': it goes under). */
  function guards(e, now, heavy, front) {
    if (!REACT.on || !REACT.eligible(e) || COVER.has(e.t) || RANGED.has(e.t)) return false;
    if (e.rxGuard > 0) {
      if (heavy || !front) { if (heavy) { dropGuard(e, null, true); e.stagger = Math.max(e.stagger || 0, 0.6); stats.guardBreaks = (stats.guardBreaks || 0) + 1; } return false; }
      e.rxClank = 0.12; e.rxTurned = (e.rxTurned || 0) + 1; stats.turned = (stats.turned || 0) + 1;
      if (e.rxTurned >= REACT.guardTurns) e.rxGuard = Math.min(e.rxGuard, 0.05);   /* it has turned enough: it drops it (into its riposte) */
      return true;
    }
    if (heavy || e.broken > 0 || e.knock > 0 || (e.stagger || 0) > 0.9) { e.rxCuts = 0; return false; }   /* (a cut's own flinch is part of the flurry; a heavy, a break or a throw ends it) */
    if (!(now - (e.rxCutAt ?? -99) < REACT.mashWindow)) e.rxCuts = 0;
    e.rxCutAt = now; e.rxCuts = (e.rxCuts || 0) + 1;
    if (e.rxCuts >= ACT.mashAt && !(e.rxGuardCd > 0)) {   /* this cut lands; the NEXT ones meet the guard - at once if it is stood about, else the moment it is again */
      e.rxCuts = 0; if (TOKENS.standing(e) && !api.windingUp(e)) raiseGuard(e); else e.rxGuardPend = REACT.pendT; }
    return false;
  }
  /* THE DAMAGE TIER: a common foe's blow, in a later act, lands harder */
  function tier(src, dmg) { return src && dmg > 0 && !src.maxHp && !src.mini && !src.xpRole && !src.elite && !TOKENS.exempt(src) ? Math.round(dmg * ACT.dmg) : dmg; }
  /* WHAT IS TOLD, DRAWN (beside the poise bar): the raised guard, the held swing's glint, the quick swing's flash, the feint's stamp */
  function draw(g, e, cx, cy, time) {
    if (!e.alive) return; const w = e.w || 10, h = e.h || 16, f = e.face || 1;
    if (e.rxGuard > 0) {   /* THE GUARD: a bar of steel held up across its front, and a white edge on the cut it turns */
      const x = Math.round(e.x + f * (w / 2 + 2) - cx), y = Math.round(e.y - h - cy);
      g.fillStyle = 'rgba(12,10,20,0.8)'; g.fillRect(x - 2, y + 1, 4, Math.round(h * 0.7) + 2);
      g.fillStyle = e.rxClank > 0 ? '#fff6e0' : '#c9d1dc'; g.fillRect(x - 1, y + 2, 2, Math.round(h * 0.7));
      g.fillRect(x - 3 * f - (f < 0 ? 0 : 0), y + 2, 3, 1);
    }
    const wx = Math.round(e.x + f * (w / 2) - cx), wy = Math.round(e.y - h - 2 - cy);
    if (e.rxVary === 'held' && api.windingUp(e)) { const k = 0.5 + 0.5 * Math.sin(time * 18); g.fillStyle = k > 0.5 ? '#fff6e0' : '#ffd36b'; g.fillRect(wx - 1, wy - 1, 3, 3); g.fillRect(wx, wy - 3, 1, 7); }   /* HELD: the glint, up and steady */
    if (e.rxFlash > 0) { g.fillStyle = '#fff6e0'; g.fillRect(wx - 3, wy, 7, 1); g.fillRect(wx, wy - 3, 1, 7); }   /* QUICK: a flash as it starts */
    if (e.rxStamp > 0) { g.fillStyle = '#c9b27c'; g.fillRect(Math.round(e.x - cx) - 4, Math.round(e.y - cy) - 1, 8, 1); }   /* THE FEINT'S STAMP */
  }
  return { frame, pre, hold, guards, tier, draw, act: () => ACT, REACT };
}
