// src/wicker-queen.js - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3; rebuilt ON THE CAROUSEL by claude/fairboss, Daniel 2026-09-30).
// A tall wicker effigy crowned in wheat, at nightfall, on the fair's great carousel: the green is one turning ride now (src/wicker-carousel.js - the floor
// ring carries everything on its boards, the painted horses bob on their poles as platforms). She is the fair's own rule made into a fight: DON'T TURN
// YOUR BACK ON HER.
//
// THE RULE (src/mummer.js's facing rule, the same one the mummers keep): her FEET move only while no hero looks at her. Co-op: any hero facing her freezes
// her. But the RIDE carries her while she stands, frozen or at her blows (it carries you too; walking, she strides against it at her own pace), and HER RIBBONS KEEP TURNING while she is frozen: a look stops her feet, not the dance.
//
// THE READ BETWEEN UP AND DOWN (every blow told, rule A1; every one wears its mark, and every one is in windingUp() by its 'Tell'):
//   LOW LASH        !!  LOW   the ribbons sweep out from the centre column along the boards at ankle height: JUMP it, or be UP ON A HORSE.
//   THE FLOOR BURNS !!  LOW   she drives her sickle into the boards and the whole ring floor catches: told for WQ.floorTell s (the boards glow the
//                             length of the ride), then it burns for WQ.floorT s. Anything with its feet on the boards burns: GET UP ON A HORSE.
//   HIGH LASH       !!  HIGH  the ribbons fly from the canopy at the horses' height: a rider is in them, and so is a hero standing on the boards.
//                             GET DOWN on the boards and DUCK (src/duck.js).
//   HER SICKLE      !!  HIGH  turn your back on her from across the ride and she THROWS it: told WQ.throwTell s (the red line at the height it will
//                             fly), then it flies flat at the height of a rider and a standing hero, out to the wall and BACK to her hand. Down, ducked.
//   THE REAP        !!        if she reaches you unseen she lifts her sickle and her eye holes burn red (the mummers' glow), then she reaps. Nothing turns
//                             a blow from behind; a LOOK during the glow freezes her and cancels it.
//   THE CROWNING    (no mark) she lifts her wheat crown and the crowd sends in mummers: never more than WQ.crownCap of hers alive (the QUIET list).
// THE FIRE (the opening, rule A11: the thing YOU do): the engine's firebox under the centre column, its embers on the boards. Look at her while she
//   stands ON the embers and the look FREEZES HER ON THEM: the wicker catches and burns open. A blow in the burn is worth WQ.burnMul; anywhere else the
//   wicker takes a blow and stands (WQ.ward). Two ways onto it: UPSTREAM of the fire, hold her in your look and the ride brings her onto it; DOWNSTREAM,
//   turn your back and she walks to you against the ride, across it - and turn on her there. After a burn she is flung off the fire the ride's way and
//   the embers are BANKED for WQ.bankT s. Crossing the embers unseen does nothing; freezing her anywhere else does nothing.
// THREE PHASES, each one a thing you can say (rule A10); each one QUICKENS THE RIDE (told) and changes the horses' bob:
//   1  DUSK         the look reaches across the whole ride
//   2  FULL DARK    (at 2/3) the green goes black: your look freezes her only NEAR you (WQ.nearR px on the side you face; half as far again with the
//                   Maypole Ribbon). The crowd's mummers keep the same near look. The ride quickens.
//   3  ALIGHT       (at 1/3) she catches for good and lights the green herself: the look reaches across it again, but she walks faster, the floor
//                   burns more often, and the ride quickens again.
// Touching her never hurts (the touch rule): her damage is the lashes, the burning floor, the sickle thrown and the sickle reaped.
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`; updateWickerQueen returns the events of the frame (for tools/wicker-queen.mjs,
// which proves every line above in Node and in the page). The host moves her by e.vx (her feet), adds the ride's carry, and clamps her to the ring.
import { facedBy, nearestHero } from './mummer.js';

export const WQ = {
  hp: 640, w: 22, h: 60,
  creep: 58, creepP3: 88,             // px/s while nobody looks (a hero runs 92; she is never faster). The ride's carry is on top of it
  sight: 720, sightY: 170,            // the look reaches across the whole ride (phases 1 and 3)
  nearR: 96, nearY: 64,               // PHASE 2, FULL DARK: the look reaches only this far (a radius on the side you face)
  reach: 26, glow: 0.6, strike: 0.2, recover: 1.0,   // THE REAP: the mummers' reach and glow, her own blow
  lashEvery: [6.5, 5.5, 4.8], lashFirst: 3.2, lashTell: 1.0, lashT: 0.5, lashReach: 460,
  lowTop: 10,                         // the LOW ribbon runs from the boards to 10 px up: a hero in a jump or on a horse (16+) is over it
  highTop: 64, highBot: 10,           // the HIGH ribbon runs 10-64 px up: a standing hero (14) and every rider (saddle 16-40) are in it, a ducked one (8) is under it
  floorEvery: [12, 10, 8], floorFirst: 7.5, floorTell: 1.5, floorT: 1.8, floorTick: 0.6,   // THE FLOOR BURNS: its told time, how long it burns, a burn's tick
  throwEvery: [10, 9, 8], throwFirst: 6, throwTell: 0.8, throwMin: 110, throwSpd: 240, throwReach: 520,   // HER SICKLE, thrown: only unseen, only from across the ride
  sickleTop: 46, sickleBot: 10,       // the thrown sickle flies 10-46 px up: a standing hero and a rider on any horse, never a ducked one
  rest: 1.4,                          // a breath between one of her blows and the next (and a way for her to walk to you between them)
  crownEvery: [13, 10, 9], crownFirst: 7, crownTell: 1.2, crownCap: 2,
  emberHalf: 40,                      // the embers: this far each side of the firebox's middle
  catchT: 0.4, burnT: 2.8, burnTP3: 2.4, riseT: 0.6, throwBack: 44, bankT: 6,
  burnMul: 1.35, ward: 0.25,           // what a blow is worth burning, and against the standing wicker
  rustle: 0.35,                       // her audio tell while she moves: the wicker creaks
  dmg: { sickle: 26, lash: 20, floor: 16, thrown: 18 },
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
export const WQ_TELLS = ['sickleTell', 'lashLowTell', 'lashHighTell', 'floorTell', 'throwTell', 'crownTell'];
/* THE RIBBON'S BAND, in world y: [top, bottom] */
export const lashBand = (kind, floor) => (kind === 'low' ? [floor - WQ.lowTop, floor] : [floor - WQ.highTop, floor - WQ.highBot]);
/* does a ribbon at this height catch a hero whose hurt box runs from t to b (world y; src/duck.js duckBox gives it ducked or standing)? */
export const lashCatches = (kind, floor, box) => { const [t, b] = lashBand(kind, floor); return box.b > t && box.t < b; };
/* THE THROWN SICKLE's band, and whether it catches a hurt box */
export const sickleBand = floor => [floor - WQ.sickleTop, floor - WQ.sickleBot];
export const sickleCatches = (floor, box) => { const [t, b] = sickleBand(floor); return box.b > t && box.t < b; };
/* THE FLOOR BURNS whom? a hero whose feet are on the boards (not in the air, not on a horse) */
export const floorCatches = (floor, feetY, onHorse) => !onHorse && Math.abs(feetY - floor) < 3;

export function wqFrame(e) {
  switch (e.mode) {
    case 'sickleTell': case 'throwTell': return WQ_F.sickleTell; case 'sickle': case 'throw': return WQ_F.sickle;
    case 'lashLowTell': case 'lashHighTell': case 'floorTell': return WQ_F.lashTell; case 'lash': case 'floor': return WQ_F.lash;
    case 'crownTell': case 'crown': return WQ_F.crownTell;
    case 'catch': return WQ_F.catch; case 'burn': return WQ_F.burn[Math.floor((e.anim || 0) * 8) % 2];
    case 'rise': return WQ_F.rise;
    case 'creep': return WQ_F.creep[Math.floor((e.anim || 0) * 5) % 2];
  }
  if (e.flash > 0.05) return WQ_F.hurt;
  return WQ_F.still;
}

export function newWickerQueen(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, bank: 0, lashCd: WQ.lashFirst, crownCd: WQ.crownFirst, floorCd: WQ.floorFirst, throwCd: WQ.throwFirst,
    lashN: 0, rest: 0, rustleT: 0, sk: null, anim: 0, vx: 0, lashR: 0, lashKind: null, seen: false, n: { catch: 0, burn: 0, lash: 0, sickle: 0, crown: 0, floor: 0, thrown: 0 } });
}

/* THE THROWN SICKLE in flight, whatever she is doing: out to the wall (or WQ.throwReach), then back to her hand. c.sickle(x0, x1, pass) sweeps it */
function flySickle(e, dt, c) {
  const k = e.sk; if (!k) return;
  const x0 = k.x; k.x += k.dir * WQ.throwSpd * dt; k.d += WQ.throwSpd * dt; k.spin = (k.spin || 0) + dt;
  if (k.out && (k.d >= WQ.throwReach || k.x <= c.A.x0 + 6 || k.x >= c.A.x1 - 6)) { k.x = Math.max(c.A.x0 + 6, Math.min(c.A.x1 - 6, k.x)); k.out = false; k.dir = -k.dir; k.pass++; }
  if (c.sickle) c.sickle(Math.min(x0, k.x), Math.max(x0, k.x), k.pass);
  if (!k.out && Math.sign(e.x - k.x) !== k.dir) e.sk = null;   /* back in her hand */
}

/* ONE FRAME OF HER. c = { heroes: [{x, y, face, alive}], A: {x0, x1, floor}, embers: {x0, x1, mid} | null, ringDir (the ride's way, 1 or -1; 0: no ride),
   canStep(dir), number(x, y, text, col) (her lines: '!!' floats, a teaching line goes to the hint box), sound(key), hit(box [l, r, t, b], dmg, name), lash(kind, r0, r1), sickle(x0, x1, pass), summon(n), adds() }.
   Returns the frame's events. */
export function updateWickerQueen(e, dt, c) {
  const ev = [];
  if (!e.alive || e.mode === 'sleep') return ev;
  if (c.anim !== false) e.anim = (e.anim || 0) + dt;   /* (the game ticks it for every creature: its hands pass anim: false) */
  e.modeT -= dt; e.vx = 0;
  e.bank = Math.max(0, (e.bank || 0) - dt); e.rest = Math.max(0, (e.rest || 0) - dt);
  flySickle(e, dt, c);
  const busy = e.mode === 'catch' || e.mode === 'burn' || e.mode === 'rise';
  if (!busy) { e.lashCd -= dt; e.crownCd -= dt; e.floorCd -= dt; e.throwCd -= dt; }
  const ph = wqPhase(e);
  if (ph !== e.phase) { e.phase = ph; ev.push({ t: 'phase', ph });
    c.number(e.x, e.y - 78, ph === 2 ? 'FULL DARK: THE RIDE QUICKENS' : 'SHE IS ALIGHT: THE RIDE QUICKENS', '#ff6b6b'); c.sound(ph === 2 ? 'dark' : 'alight'); }
  const heroes = c.heroes || [], seen = wqSeen(e, heroes), near = nearestHero(e, heroes, WQ.sight, WQ.sightY);
  e.seen = seen;
  const toward = () => { if (near) e.face = Math.sign(near.x - e.x) || e.face || -1; };
  if (e.mode === 'wake') { if (e.modeT <= 0) e.mode = 'still'; return ev; }
  e.open = wqOpen(e) ? Math.max(0, e.modeT) : 0;
  /* ---- THE OPENING FIRST (rule E2: the thing the fight is about goes at the top of the chain): frozen ON the embers, and they are not banked ---- */
  if ((e.mode === 'still' || e.mode === 'creep') && seen && onEmbers(e.x, c.embers) && !(e.bank > 0)) {
    e.mode = 'catch'; e.modeT = WQ.catchT; e.n.catch++; ev.push({ t: 'catch' });
    c.number(e.x, e.y - 78, 'THE WICKER CATCHES', '#ffb040'); c.sound('catch'); return ev; }
  switch (e.mode) {
    case 'catch':
      if (e.modeT <= 0) { e.mode = 'burn'; e.modeT = ph === 3 ? WQ.burnTP3 : WQ.burnT; e.open = e.modeT; e.n.burn++; ev.push({ t: 'burn' }); c.number(e.x, e.y - 78, 'SHE BURNS: CUT HER', '#8fd160'); c.sound('burn'); }
      return ev;
    case 'burn':
      if (e.modeT <= 0) {   /* the fire goes out of the wicker; she is flung off the embers THE RIDE'S WAY (no ride: the side she came from), and they are banked */
        const emb = c.embers || { x0: e.x, x1: e.x, mid: e.x }, side = c.ringDir ? Math.sign(c.ringDir) : near ? (Math.sign(e.x - near.x) || 1) : (e.face > 0 ? -1 : 1);
        e.throwTo = Math.max(c.A.x0 + 16, Math.min(c.A.x1 - 16, emb.mid + side * ((emb.x1 - emb.x0) / 2 + WQ.throwBack)));
        e.mode = 'rise'; e.modeT = WQ.riseT; e.open = 0; e.bank = WQ.bankT; ev.push({ t: 'banked' });
        c.number(e.x, e.y - 78, 'THE FIRE IS BANKED', '#c9d1dc'); c.sound('rise'); }
      return ev;
    case 'rise': {   /* flung, not creeping: this is the fire throwing her off, and a look does not hold it */
      const k = Math.min(1, dt * 7); e.vx = ((e.throwTo ?? e.x) - e.x) * k / Math.max(dt, 1e-4);
      if (e.modeT <= 0) { e.mode = 'still'; e.vx = 0; }
      return ev; }
    case 'sickleTell':
      if (seen) { e.mode = 'still'; ev.push({ t: 'freeze', cancel: 'sickle' }); c.sound('still'); return ev; }
      toward();
      if (e.modeT <= 0) { e.mode = 'sickle'; e.modeT = WQ.strike; e.n.sickle++;
        const x0 = e.face > 0 ? e.x - 4 : e.x - (WQ.reach + 12), box = [x0, x0 + WQ.reach + 16, (c.A.floor) - 44, c.A.floor];
        ev.push({ t: 'sickle', box }); c.sound('sickle'); c.hit(box, WQ.dmg.sickle, 'THE SICKLE'); }
      return ev;
    case 'sickle': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = WQ.recover; } return ev;
    case 'recover': if (e.modeT <= 0) e.mode = 'still'; return ev;
    case 'throwTell':   /* her arm is back: the throw is committed (a look now does not stop it - she is not walking) */
      if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.25; e.n.thrown++; e.sk = { x: e.x + e.throwDir * 12, dir: e.throwDir, out: true, d: 0, pass: e.n.thrown * 2 };
        ev.push({ t: 'throw', dir: e.throwDir }); c.sound('throw'); }
      return ev;
    case 'throw': if (e.modeT <= 0) { e.mode = 'still'; e.rest = WQ.rest; e.throwCd = WQ.throwEvery[ph - 1]; } return ev;
    case 'lashLowTell': case 'lashHighTell':   /* the ribbons are wound up at the height they will fly: a look does not stop them */
      if (e.modeT <= 0) { e.lashKind = e.mode === 'lashLowTell' ? 'low' : 'high'; e.mode = 'lash'; e.modeT = WQ.lashT; e.lashR = 0; e.n.lash++;
        ev.push({ t: 'lash', kind: e.lashKind }); c.sound('lash'); }
      return ev;
    case 'lash': {
      const r0 = e.lashR || 0, r1 = WQ.lashReach * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.lashT); e.lashR = r1;
      c.lash(e.lashKind, r0, r1);
      if (e.modeT <= 0) { e.mode = 'still'; e.lashCd = WQ.lashEvery[ph - 1]; e.lashR = 0; e.rest = WQ.rest; }
      return ev; }
    case 'floorTell':   /* the boards glow the length of the ride: a look does not stop it */
      if (e.modeT <= 0) { e.mode = 'floor'; e.modeT = WQ.floorT; e.n.floor++; ev.push({ t: 'floor' }); c.sound('floor'); }
      return ev;
    case 'floor': if (e.modeT <= 0) { e.mode = 'still'; e.floorCd = WQ.floorEvery[ph - 1]; e.rest = WQ.rest; ev.push({ t: 'floorOut' }); } return ev;
    case 'crownTell':
      if (e.modeT <= 0) { const n = Math.max(0, WQ.crownCap - c.adds()); if (n > 0) c.summon(n); e.n.crown++; ev.push({ t: 'crown', n });
        e.mode = 'crown'; e.modeT = 0.5; c.sound('crown'); }
      return ev;
    case 'crown': if (e.modeT <= 0) { e.mode = 'still'; e.crownCd = WQ.crownEvery[ph - 1]; } return ev;
  }
  /* ---- STILL OR CREEPING: choose ---- */
  const dx = near ? Math.abs(near.x - e.x) : 1e9;
  if (near && !seen && dx <= WQ.reach && Math.abs((near.y || 0) - (e.y || 0)) < 40 && !e.sk) {
    toward(); e.mode = 'sickleTell'; e.modeT = WQ.glow; ev.push({ t: 'glow' }); c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.sound('sickleTell'); return ev; }
  if (!(e.rest > 0) && !e.sk) {   /* (nothing new while her sickle is in the air: a HIGH blow and a LOW one at once would have no answer) */
    if (near && !seen && e.throwCd <= 0 && dx >= WQ.throwMin && dx <= WQ.throwReach) {   /* A BACK TURNED FROM ACROSS THE RIDE: she throws */
      toward(); e.throwDir = e.face; e.mode = 'throwTell'; e.modeT = WQ.throwTell; ev.push({ t: 'throwTell' });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, 'HER SICKLE FLIES: DUCK', '#ff6b6b'); c.sound('throwTell'); return ev; }
    if (e.lashCd <= 0) { const kind = LASH_ORDER[(e.lashN++) % LASH_ORDER.length];
      e.mode = kind === 'low' ? 'lashLowTell' : 'lashHighTell'; e.modeT = WQ.lashTell; ev.push({ t: 'lashTell', kind });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, kind === 'low' ? 'LOW: JUMP IT' : 'HIGH: DUCK IT', '#ff6b6b'); c.sound('lashTell'); return ev; }
    if (e.floorCd <= 0) { e.mode = 'floorTell'; e.modeT = WQ.floorTell; ev.push({ t: 'floorTell' });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, 'THE FLOOR BURNS: RIDE A HORSE', '#ff6b6b'); c.sound('floorTell'); return ev; }
    if (e.crownCd <= 0) {
      if (c.adds() < WQ.crownCap) { e.mode = 'crownTell'; e.modeT = WQ.crownTell; ev.push({ t: 'crownTell' }); c.number(e.x, e.y - 78, 'THE CROWNING', '#e8c23a'); c.sound('crownTell'); return ev; }
      e.crownCd = 2;   /* her court is full: she asks again in a moment */ }
  }
  if (near && !seen) {
    toward(); const dir = e.face, sp = ph === 3 ? WQ.creepP3 : WQ.creep;
    if (!c.canStep || c.canStep(dir)) e.vx = dir * sp;
    if (e.mode !== 'creep') ev.push({ t: 'wake' });
    e.mode = 'creep';
    e.rustleT = (e.rustleT || 0) - dt; if (e.vx && e.rustleT <= 0) { e.rustleT = WQ.rustle; c.sound('rustle'); }
  } else {
    if (e.mode === 'creep') { ev.push({ t: 'freeze' }); c.sound('still'); }
    e.mode = 'still';
  }
  return ev;
}
