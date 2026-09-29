// src/wicker-queen.js - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3; Daniel approved the design 2026-09-29). Brief: docs/briefs/harvest-fair.md.
// A tall wicker effigy crowned in wheat, on the maypole green at nightfall. She is the fair's own rule made into a fight: DON'T TURN YOUR BACK ON HER.
//
// THE RULE (src/mummer.js's facing rule, the same one the mummers keep): she MOVES ONLY WHILE NO HERO LOOKS AT HER. Co-op: any hero facing her freezes her.
// But HER MAYPOLE RIBBONS KEEP TURNING while she is frozen: looking at her stops her feet, not the dance.
//
// FOUR TOLD THINGS (rule A1; every one wears its mark, and every one is in windingUp() by its 'Tell'):
//   RIBBON LASH   !!  LOW or HIGH  the ribbons fly out from the maypole across the whole green at ankle height (JUMP it) or head height (DUCK it,
//                                  src/duck.js). Told for WQ.lashTell s: the mark over her, the word LOW or HIGH, the ribbons drawn at the height they
//                                  will pass, a swish. It turns while she is frozen: that is the point of it.
//   THE SICKLE    !!               if she reaches you UNSEEN she lifts her sickle and her eye holes burn red (the mummers' glow, the same 0.6 s), then she
//                                  reaps. Nothing turns a blow from behind; a LOOK during the glow freezes her and cancels it.
//   THE CROWNING  (no mark)        she lifts her wheat crown and the crowd sends in mummers: never more than WQ.crownCap of hers alive. They strike on
//                                  their own marks; the call itself throws no blow (the QUIET list).
//   THE BONFIRE   (the opening)    NOT an attack: the thing YOU do (rule A11). Turn your back to draw her across the green; turn round while she stands on
//                                  the embers and the look FREEZES HER ON THEM: the wicker catches and burns open. A blow in the burn is worth WQ.burnMul;
//                                  anywhere else the wicker takes a blow and stands (WQ.ward). After a burn she is flung back off the embers and they are
//                                  BANKED for WQ.bankT s. Crossing the embers unseen does nothing; freezing her anywhere else does nothing.
// THREE PHASES, each one a thing you can say (rule A10):
//   1  DUSK         the look reaches across the whole green
//   2  FULL DARK    (at 2/3) the bonfire gutters and the green goes black: your look freezes her only NEAR you - a radius of WQ.nearR px on the side you
//                   face (the light of your look). So she has to be let close before she can be frozen on the embers. The crowd's mummers keep the
//                   same near look.
//   3  ALIGHT       (at 1/3) she catches for good and lights the green herself: the look reaches across it again, but she creeps half as fast again and
//                   leaves FIRE behind her where she goes. The embers still flare her open.
// Touching her never hurts (the touch rule): her damage is the lash, the sickle and the fire.
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`; updateWickerQueen returns the events of the frame (for tools/wicker-queen.mjs,
// which proves every line above in Node and in the page). The host moves her by e.vx (and clamps her to the green).
import { facedBy, nearestHero } from './mummer.js';

export const WQ = {
  hp: 640, w: 22, h: 60,
  creep: 58, creepP3: 88,             // px/s while nobody looks (a hero runs 92; she is never faster)
  sight: 720, sightY: 170,            // the look reaches across the whole green (phases 1 and 3)
  nearR: 96, nearY: 64,               // PHASE 2, FULL DARK: the look reaches only this far (a radius on the side you face)
  reach: 26, glow: 0.6, strike: 0.2, recover: 1.0,   // THE SICKLE: the mummers' reach and glow, her own blow
  lashEvery: [5.2, 4.6, 4.0], lashFirst: 3.2, lashTell: 1.0, lashT: 0.5, lashReach: 460,
  lowTop: 10,                         // the LOW ribbon runs from the floor to 10 px up: a hero in a jump is over it
  highTop: 24, highBot: 10,           // the HIGH ribbon runs 10-24 px up: a standing hero (14) is in it, a ducked one (8) is under it
  crownEvery: [13, 10, 9], crownFirst: 7, crownTell: 1.2, crownCap: 2,
  emberHalf: 40,                      // the embers: this far each side of the bonfire's middle
  catchT: 0.4, burnT: 3.6, burnTP3: 3.0, riseT: 0.6, throwBack: 44, bankT: 5,
  burnMul: 2.2, ward: 0.3,            // what a blow is worth burning, and against the standing wicker
  trailStep: 22, trailLife: 2.6,      // PHASE 3: a fire every trailStep px she creeps
  rustle: 0.35,                       // her audio tell while she moves: the wicker creaks
  dmg: { sickle: 26, lash: 16 },
  p2: 2 / 3, p3: 1 / 3,
};
/* THE LASH ORDER: low and high mixed, never three alike, so the height has to be READ, not remembered */
export const LASH_ORDER = ['low', 'high', 'low', 'low', 'high', 'high', 'low', 'high'];
/* the frames of bakeWickerQueen (src/redraw/wicker_queen.js) */
export const WQ_F = { still: 0, creep: [1, 2], sickleTell: 3, sickle: 4, lashTell: 5, lash: 6, crownTell: 7, catch: 8, burn: [9, 10], rise: 11, hurt: 12, dead: 13 };

export const wqPhase = e => (e.hp <= e.maxHp * WQ.p3 ? 3 : e.hp <= e.maxHp * WQ.p2 ? 2 : 1);
export const wqSight = ph => (ph === 2 ? [WQ.nearR, WQ.nearY] : [WQ.sight, WQ.sightY]);
/* IS SHE LOOKED AT (the facing rule, with the phase's reach): any living hero facing her side, near enough */
export const wqSeen = (e, heroes) => { const [s, sy] = wqSight(e.phase || 1); return facedBy(e, heroes, s, sy); };
export const onEmbers = (x, emb) => !!emb && x >= emb.x0 && x <= emb.x1;
export const embersOf = bonfireX => ({ x0: bonfireX - WQ.emberHalf, x1: bonfireX + WQ.emberHalf, mid: bonfireX });
export const wqOpen = e => e.mode === 'burn';
/* WHAT A BLOW IS WORTH: burning, WQ.burnMul; the rest of the time the wicker takes it and stands */
export const wqTake = e => (wqOpen(e) ? WQ.burnMul : WQ.ward);
export const WQ_TELLS = ['sickleTell', 'lashLowTell', 'lashHighTell', 'crownTell'];
/* THE RIBBON'S BAND, in world y: [top, bottom] */
export const lashBand = (kind, floor) => (kind === 'low' ? [floor - WQ.lowTop, floor] : [floor - WQ.highTop, floor - WQ.highBot]);
/* does a ribbon at this height catch a hero whose hurt box runs from t to b (world y; src/duck.js duckBox gives it ducked or standing)? */
export const lashCatches = (kind, floor, box) => { const [t, b] = lashBand(kind, floor); return box.b > t && box.t < b; };

export function wqFrame(e) {
  switch (e.mode) {
    case 'sickleTell': return WQ_F.sickleTell; case 'sickle': return WQ_F.sickle;
    case 'lashLowTell': case 'lashHighTell': return WQ_F.lashTell; case 'lash': return WQ_F.lash;
    case 'crownTell': case 'crown': return WQ_F.crownTell;
    case 'catch': return WQ_F.catch; case 'burn': return WQ_F.burn[Math.floor((e.anim || 0) * 8) % 2];
    case 'rise': return WQ_F.rise;
    case 'creep': return WQ_F.creep[Math.floor((e.anim || 0) * 5) % 2];
  }
  if (e.flash > 0.05) return WQ_F.hurt;
  return WQ_F.still;
}

export function newWickerQueen(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, bank: 0, lashCd: WQ.lashFirst, crownCd: WQ.crownFirst, lashN: 0, trail: 0, rustleT: 0,
    anim: 0, vx: 0, lashR: 0, lashKind: null, seen: false, n: { catch: 0, burn: 0, lash: 0, sickle: 0, crown: 0, fire: 0 } });
}

/* ONE FRAME OF HER. c = { heroes: [{x, y, face, alive}], A: {x0, x1, floor}, embers: {x0, x1, mid} | null, canStep(dir), say(text, col), sound(key),
   hit(box [l, r, t, b], dmg, name), lash(kind, r0, r1), fire(x), summon(n), adds() }.  Returns the frame's events. */
export function updateWickerQueen(e, dt, c) {
  const ev = [];
  if (!e.alive || e.mode === 'sleep') return ev;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  e.bank = Math.max(0, (e.bank || 0) - dt);
  const busy = e.mode === 'catch' || e.mode === 'burn' || e.mode === 'rise';
  if (!busy) { e.lashCd -= dt; e.crownCd -= dt; }
  const ph = wqPhase(e);
  if (ph !== e.phase) { e.phase = ph; ev.push({ t: 'phase', ph });
    c.say(ph === 2 ? 'THE BONFIRE GUTTERS: FULL DARK' : 'SHE IS ALIGHT', '#ff6b6b'); c.sound(ph === 2 ? 'dark' : 'alight'); }
  const heroes = c.heroes || [], seen = wqSeen(e, heroes), near = nearestHero(e, heroes, WQ.sight, WQ.sightY);
  e.seen = seen;
  const toward = () => { if (near) e.face = Math.sign(near.x - e.x) || e.face || -1; };
  if (e.mode === 'wake') { if (e.modeT <= 0) e.mode = 'still'; return ev; }
  e.open = wqOpen(e) ? Math.max(0, e.modeT) : 0;
  /* ---- THE OPENING FIRST (rule E2: the thing the fight is about goes at the top of the chain): frozen ON the embers, and they are not banked ---- */
  if ((e.mode === 'still' || e.mode === 'creep') && seen && onEmbers(e.x, c.embers) && !(e.bank > 0)) {
    e.mode = 'catch'; e.modeT = WQ.catchT; e.n.catch++; ev.push({ t: 'catch' });
    c.say('THE WICKER CATCHES', '#ffb040'); c.sound('catch'); return ev; }
  switch (e.mode) {
    case 'catch':
      if (e.modeT <= 0) { e.mode = 'burn'; e.modeT = ph === 3 ? WQ.burnTP3 : WQ.burnT; e.open = e.modeT; e.n.burn++; ev.push({ t: 'burn' }); c.say('SHE BURNS: CUT HER', '#8fd160'); c.sound('burn'); }
      return ev;
    case 'burn':
      if (e.modeT <= 0) {   /* the fire goes out of the wicker; she is flung back off the embers, the side she came from, and they are banked */
        const emb = c.embers || { x0: e.x, x1: e.x, mid: e.x }, side = near ? (Math.sign(e.x - near.x) || 1) : (e.face > 0 ? -1 : 1);
        e.throwTo = Math.max(c.A.x0 + 16, Math.min(c.A.x1 - 16, emb.mid + side * ((emb.x1 - emb.x0) / 2 + WQ.throwBack)));
        e.mode = 'rise'; e.modeT = WQ.riseT; e.open = 0; e.bank = WQ.bankT; ev.push({ t: 'banked' });
        c.say('THE EMBERS ARE BANKED', '#c9d1dc'); c.sound('rise'); }
      return ev;
    case 'rise': {   /* flung, not creeping: this is the fire throwing her off, and a look does not hold it */
      const k = Math.min(1, dt * 7); e.vx = ((e.throwTo ?? e.x) - e.x) * k / Math.max(dt, 1e-4);
      if (e.modeT <= 0) { e.mode = 'still'; e.vx = 0; }
      return ev; }
    case 'sickleTell':
      if (seen) { e.mode = 'still'; ev.push({ t: 'freeze', cancel: 'sickle' }); c.say('STILL', '#c9d1dc'); c.sound('still'); return ev; }
      toward();
      if (e.modeT <= 0) { e.mode = 'sickle'; e.modeT = WQ.strike; e.n.sickle++;
        const x0 = e.face > 0 ? e.x - 4 : e.x - (WQ.reach + 12), box = [x0, x0 + WQ.reach + 16, (c.A.floor) - 44, c.A.floor];
        ev.push({ t: 'sickle', box }); c.sound('sickle'); c.hit(box, WQ.dmg.sickle, 'THE SICKLE'); }
      return ev;
    case 'sickle': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = WQ.recover; } return ev;
    case 'recover': if (e.modeT <= 0) e.mode = 'still'; return ev;
    case 'lashLowTell': case 'lashHighTell':   /* the ribbons are wound up at the height they will fly: a look does not stop them */
      if (e.modeT <= 0) { e.lashKind = e.mode === 'lashLowTell' ? 'low' : 'high'; e.mode = 'lash'; e.modeT = WQ.lashT; e.lashR = 0; e.n.lash++;
        ev.push({ t: 'lash', kind: e.lashKind }); c.sound('lash'); }
      return ev;
    case 'lash': {
      const r0 = e.lashR || 0, r1 = WQ.lashReach * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.lashT); e.lashR = r1;
      c.lash(e.lashKind, r0, r1);
      if (e.modeT <= 0) { e.mode = 'still'; e.lashCd = WQ.lashEvery[ph - 1]; e.lashR = 0; }
      return ev; }
    case 'crownTell':
      if (e.modeT <= 0) { const n = Math.max(0, WQ.crownCap - c.adds()); if (n > 0) c.summon(n); e.n.crown++; ev.push({ t: 'crown', n });
        e.mode = 'crown'; e.modeT = 0.5; c.sound('crown'); }
      return ev;
    case 'crown': if (e.modeT <= 0) { e.mode = 'still'; e.crownCd = WQ.crownEvery[ph - 1]; } return ev;
  }
  /* ---- STILL OR CREEPING: choose ---- */
  if (near && !seen && Math.abs(near.x - e.x) <= WQ.reach && Math.abs((near.y || 0) - (e.y || 0)) < 40) {
    toward(); e.mode = 'sickleTell'; e.modeT = WQ.glow; ev.push({ t: 'glow' }); c.say('!!', '#ff6b6b'); c.sound('sickleTell'); return ev; }
  if (e.lashCd <= 0) { const kind = LASH_ORDER[(e.lashN++) % LASH_ORDER.length];
    e.mode = kind === 'low' ? 'lashLowTell' : 'lashHighTell'; e.modeT = WQ.lashTell; ev.push({ t: 'lashTell', kind });
    c.say('!!', '#ff6b6b'); c.say(kind === 'low' ? 'LOW' : 'HIGH', '#ff6b6b', true); c.sound('lashTell'); return ev; }
  if (e.crownCd <= 0) {
    if (c.adds() < WQ.crownCap) { e.mode = 'crownTell'; e.modeT = WQ.crownTell; ev.push({ t: 'crownTell' }); c.say('THE CROWNING', '#e8c23a'); c.sound('crownTell'); return ev; }
    e.crownCd = 2;   /* her court is full: she asks again in a moment */ }
  if (near && !seen) {
    toward(); const dir = e.face, sp = ph === 3 ? WQ.creepP3 : WQ.creep;
    if (!c.canStep || c.canStep(dir)) e.vx = dir * sp;
    if (e.mode !== 'creep') ev.push({ t: 'wake' });
    e.mode = 'creep';
    e.rustleT = (e.rustleT || 0) - dt; if (e.vx && e.rustleT <= 0) { e.rustleT = WQ.rustle; c.sound('rustle'); }
    if (ph === 3 && e.vx) { e.trail = (e.trail || 0) + Math.abs(e.vx) * dt; if (e.trail >= WQ.trailStep) { e.trail = 0; e.n.fire++; ev.push({ t: 'fire' }); c.fire(e.x - dir * 8); } }
  } else {
    if (e.mode === 'creep') { ev.push({ t: 'freeze' }); c.sound('still'); }
    e.mode = 'still';
  }
  return ev;
}
