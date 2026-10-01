// src/wicker-queen.js - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3; rebuilt ON THE CAROUSEL by claude/fairboss, Daniel 2026-09-30;
// her SPEAR replaces her sickle, claude/fairfix2-spear, Daniel 2026-10-01).
// A tall wicker effigy crowned in wheat, at nightfall, on the fair's great carousel, a long ash-shafted spear in her hands: the green is one turning ride now
// (src/wicker-carousel.js - the floor ring carries everything on its boards, the painted horses bob on their poles as platforms). She is the fair's own rule
// made into a fight: DON'T TURN YOUR BACK ON HER.
//
// THE RULE (src/mummer.js's facing rule, the same one the mummers keep): her FEET move only while no hero looks at her. Co-op: any hero facing her freezes
// her. But the RIDE carries her while she stands, frozen or at her blows (it carries you too; walking, she strides against it at her own pace), and HER
// ARMS ARE NOT HER FEET: a look stops her feet, not the ribbons - and it is the look that brings the spear (held, she answers with her arms; with your
// back turned she walks to you instead, and stabs).
//
// THE READ BETWEEN UP AND DOWN (every blow told, rule A1; every one wears its mark, and every one is in windingUp() by its 'Tell'):
//   LOW LASH         !!  LOW   the ribbons sweep out from the centre column along the boards at ankle height: JUMP it, or be UP ON A HORSE.
//   HIGH LASH        !!  HIGH  the ribbons fly from the canopy at the horses' height: a rider is in them, and so is a hero standing on the boards.
//                              GET DOWN on the boards and DUCK (src/duck.js).
//   HIGH THRUST      !!  HIGH  a hero LOOKING AT HER within her spear's reach (WQ.thrustReach px): she draws the spear back to her shoulder for
//                              WQ.thrustTell s - the red line runs out along the ride at the height and the length it will cover, and when it has run
//                              its length she lunges - then the spear goes out flat at the height of a standing hero and of a rider on any horse.
//                              DUCK on the boards.
//   LOW THRUST       !!  LOW   the same told draw, crouched, the spear at her knee; it skims the boards at ankle height. JUMP it (a rider is over it).
//   THE FLOOR BURNS  !!  LOW   she drives her spear's butt into the boards and the whole ring floor catches: told for WQ.floorTell s (the boards glow the
//                              length of the ride), then it burns for WQ.floorT s. Anything with its feet on the boards burns: GET UP ON A HORSE.
//   THE STAB         !!        if she reaches you unseen she draws her spear back and her eye holes burn red (the mummers' glow), then she stabs. Nothing
//                              turns a blow from behind; a LOOK during the glow freezes her and cancels it.
//   THE CROWNING     (no mark) she lifts her wheat crown and the crowd sends in mummers: never more than WQ.crownCap of hers alive (the QUIET list).
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
//                   burns more often, she thrusts more often, and the ride quickens again.
// Touching her never hurts (the touch rule): her damage is the lashes, the burning floor, and her spear (thrust, and stabbed from behind).
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`; updateWickerQueen returns the events of the frame (for tools/wicker-queen.mjs,
// which proves every line above in Node and in the page). The host moves her by e.vx (her feet), adds the ride's carry, and clamps her to the ring.
import { facedBy, nearestHero } from './mummer.js';

export const WQ = {
  hp: 640, w: 22, h: 60,
  creep: 58, creepP3: 88,             // px/s while nobody looks (a hero runs 92; she is never faster). The ride's carry is on top of it
  sight: 720, sightY: 170,            // the look reaches across the whole ride (phases 1 and 3)
  nearR: 96, nearY: 64,               // PHASE 2, FULL DARK: the look reaches only this far (a radius on the side you face)
  reach: 26, glow: 0.6, strike: 0.2, recover: 1.0, stabReach: 46,   // THE STAB: the mummers' reach and glow to start it; her spear's jab reaches stabReach px
  lashEvery: [6.5, 5.5, 4.8], lashFirst: 3.2, lashTell: 1.0, lashT: 0.5, lashReach: 460,
  lowTop: 10,                         // the LOW ribbon runs from the boards to 10 px up: a hero in a jump or on a horse (16+) is over it
  highTop: 64, highBot: 10,           // the HIGH ribbon runs 10-64 px up: a standing hero (14) and every rider (saddle 16-40) are in it, a ducked one (8) is under it
  floorEvery: [12, 10, 8], floorFirst: 7.5, floorTell: 1.5, floorT: 1.8, floorTick: 0.6,   // THE FLOOR BURNS: its told time, how long it burns, a burn's tick
  /* HER SPEAR, THRUST: at a hero looking at her within its reach (from her middle); told for thrustTell s (the red line runs out to its length), the lunge takes
     thrustT s to carry the blade from her hand (thrustFrom) to the end of its reach, it is held out thrustHold s and drawn back over thrustBack s */
  thrustEvery: [7, 6, 5], thrustFirst: 4.5, thrustTell: 1.1, thrustT: 0.25, thrustHold: 0.3, thrustBack: 0.45, thrustFrom: 14, thrustReach: 96, thrustY: 70,
  spearLen: 76,                       // the spear, butt to point: an ash shaft, wheat bound under a leaf blade (src/redraw/wicker_queen.js draws it)
  spearHighTop: 46, spearHighBot: 10, // the HIGH thrust flies 10-46 px up: a standing hero and a rider on any horse, never a ducked one
  spearLowTop: 10,                    // the LOW thrust skims the boards to 10 px up: a hero in a jump or on a horse is over it
  spearHighY: 14, spearLowY: 5,       // where the shaft is DRAWN: the high one at a standing hero's head (a ducked one, 8, is plainly under it), the low one at his ankles
  rest: 1.4,                          // a breath between one of her blows and the next (and a way for her to walk to you between them)
  crownEvery: [13, 10, 9], crownFirst: 7, crownTell: 1.2, crownCap: 2,
  emberHalf: 40,                      // the embers: this far each side of the firebox's middle
  catchT: 0.4, burnT: 2.8, burnTP3: 2.4, riseT: 0.6, throwBack: 44, bankT: 6,
  burnMul: 1.35, ward: 0.25,           // what a blow is worth burning, and against the standing wicker
  rustle: 0.35,                       // her audio tell while she moves: the wicker creaks
  dmg: { stab: 26, lash: 20, floor: 16, thrust: 22 },
  p2: 2 / 3, p3: 1 / 3,
};
/* THE LASH ORDER: low and high mixed, never three alike, so the height has to be READ, not remembered */
export const LASH_ORDER = ['low', 'high', 'low', 'low', 'high', 'high', 'low', 'high'];
/* THE THRUST ORDER: the same rule, out of step with the lash's, so a high lash is not the cue for a high thrust */
export const THRUST_ORDER = ['high', 'low', 'high', 'high', 'low', 'low', 'high', 'low', 'low', 'high'];
/* the frames of bakeWickerQueen (src/redraw/wicker_queen.js) */
export const WQ_F = { still: 0, creep: [1, 2], stabTell: 3, stab: 4, lashTell: 5, lash: 6, crownTell: 7, catch: 8, burn: [9, 10], rise: 11, hurt: 12, dead: 13,
  thrustHighTell: 14, thrustHigh: 15, thrustLowTell: 16, thrustLow: 17, floorTell: 18, floor: 19 };
export const WQ_FRAMES = 20;

export const wqPhase = e => (e.hp <= e.maxHp * WQ.p3 ? 3 : e.hp <= e.maxHp * WQ.p2 ? 2 : 1);
export const wqSight = ph => (ph === 2 ? [WQ.nearR, WQ.nearY] : [WQ.sight, WQ.sightY]);
/* IS SHE LOOKED AT (the facing rule, with the phase's reach): any living hero facing her side, near enough */
export const wqSeen = (e, heroes) => { const [s, sy] = wqSight(e.phase || 1); return facedBy(e, heroes, s, sy); };
export const onEmbers = (x, emb) => !!emb && x >= emb.x0 && x <= emb.x1;
export const embersOf = bonfireX => ({ x0: bonfireX - WQ.emberHalf, x1: bonfireX + WQ.emberHalf, mid: bonfireX });
export const wqOpen = e => e.mode === 'burn';
/* WHAT A BLOW IS WORTH: burning, WQ.burnMul; the rest of the time the wicker takes it and stands */
export const wqTake = e => (wqOpen(e) ? WQ.burnMul : WQ.ward);
export const WQ_TELLS = ['stabTell', 'lashLowTell', 'lashHighTell', 'floorTell', 'thrustHighTell', 'thrustLowTell', 'crownTell'];
/* THE RIBBON'S BAND, in world y: [top, bottom] */
export const lashBand = (kind, floor) => (kind === 'low' ? [floor - WQ.lowTop, floor] : [floor - WQ.highTop, floor - WQ.highBot]);
/* does a ribbon at this height catch a hero whose hurt box runs from t to b (world y; src/duck.js duckBox gives it ducked or standing)? */
export const lashCatches = (kind, floor, box) => { const [t, b] = lashBand(kind, floor); return box.b > t && box.t < b; };
/* HER SPEAR's band for a thrust, in world y, and whether it catches a hurt box */
export const spearBand = (kind, floor) => (kind === 'low' ? [floor - WQ.spearLowTop, floor] : [floor - WQ.spearHighTop, floor - WQ.spearHighBot]);
export const spearCatches = (kind, floor, box) => { const [t, b] = spearBand(kind, floor); return box.b > t && box.t < b; };
/* the height the shaft is drawn at (inside its band, where it reads against the hero: src/redraw/wicker_queen.js puts her hands there) */
export const spearY = (kind, floor) => floor - (kind === 'low' ? WQ.spearLowY : WQ.spearHighY);
/* THE FLOOR BURNS whom? a hero whose feet are on the boards (not in the air, not on a horse) */
export const floorCatches = (floor, feetY, onHorse) => !onHorse && Math.abs(feetY - floor) < 3;
/* where the blade is, px in front of her middle along e.thrustDir, through a thrust: drawn back in the tell, out to its reach in the lunge, held, drawn back */
export function thrustTip(e) {
  if (e.mode === 'thrustHighTell' || e.mode === 'thrustLowTell') return WQ.thrustFrom - 6 * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.thrustTell);
  if (e.mode !== 'thrust') return 0;
  const T = WQ.thrustT + WQ.thrustHold + WQ.thrustBack, el = T - Math.max(0, e.modeT), span = WQ.thrustReach - WQ.thrustFrom;
  if (el < WQ.thrustT) return WQ.thrustFrom + span * (el / WQ.thrustT);
  if (el < WQ.thrustT + WQ.thrustHold) return WQ.thrustReach;
  return WQ.thrustReach - span * Math.min(1, (el - WQ.thrustT - WQ.thrustHold) / WQ.thrustBack);
}

export function wqFrame(e) {
  switch (e.mode) {
    case 'stabTell': return WQ_F.stabTell; case 'stab': return WQ_F.stab;
    case 'thrustHighTell': return WQ_F.thrustHighTell; case 'thrustLowTell': return WQ_F.thrustLowTell;
    case 'thrust': { const out = (e.tip || 0) > (WQ.thrustFrom + WQ.thrustReach) / 2, low = e.thrustKind === 'low';   /* out: the lunge; drawn back: the tell's pose */
      return low ? (out ? WQ_F.thrustLow : WQ_F.thrustLowTell) : (out ? WQ_F.thrustHigh : WQ_F.thrustHighTell); }
    case 'lashLowTell': case 'lashHighTell': return WQ_F.lashTell; case 'lash': return WQ_F.lash;
    case 'floorTell': return WQ_F.floorTell; case 'floor': return WQ_F.floor;
    case 'crownTell': case 'crown': return WQ_F.crownTell;
    case 'catch': return WQ_F.catch; case 'burn': return WQ_F.burn[Math.floor((e.anim || 0) * 8) % 2];
    case 'rise': return WQ_F.rise;
    case 'creep': return WQ_F.creep[Math.floor((e.anim || 0) * 5) % 2];
  }
  if (e.flash > 0.05) return WQ_F.hurt;
  return WQ_F.still;
}

export function newWickerQueen(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, bank: 0, lashCd: WQ.lashFirst, crownCd: WQ.crownFirst, floorCd: WQ.floorFirst, thrustCd: WQ.thrustFirst,
    lashN: 0, thrustN: 0, rest: 0, rustleT: 0, anim: 0, vx: 0, lashR: 0, lashKind: null, thrustKind: null, thrustDir: 1, tip: 0, seen: false,
    n: { catch: 0, burn: 0, lash: 0, stab: 0, crown: 0, floor: 0, thrust: 0 } });
}

/* ONE FRAME OF HER. c = { heroes: [{x, y, face, alive}], A: {x0, x1, floor}, embers: {x0, x1, mid} | null, ringDir (the ride's way, 1 or -1; 0: no ride),
   canStep(dir), number(x, y, text, col) (her lines: '!!' floats, a teaching line goes to the hint box), sound(key), hit(box [l, r, t, b], dmg, name),
   lash(kind, r0, r1), thrust(kind, x0, x1) (the blade swept from x0 to x1 this frame, world x), summon(n), adds() }.
   Returns the frame's events. */
export function updateWickerQueen(e, dt, c) {
  const ev = [];
  if (!e.alive || e.mode === 'sleep') return ev;
  if (c.anim !== false) e.anim = (e.anim || 0) + dt;   /* (the game ticks it for every creature: its hands pass anim: false) */
  e.modeT -= dt; e.vx = 0;
  e.bank = Math.max(0, (e.bank || 0) - dt); e.rest = Math.max(0, (e.rest || 0) - dt);
  const busy = e.mode === 'catch' || e.mode === 'burn' || e.mode === 'rise';
  if (!busy) { e.lashCd -= dt; e.crownCd -= dt; e.floorCd -= dt; e.thrustCd -= dt; }
  const ph = wqPhase(e);
  if (ph !== e.phase) { e.phase = ph; ev.push({ t: 'phase', ph });
    c.number(e.x, e.y - 78, ph === 2 ? 'FULL DARK: THE RIDE QUICKENS' : 'SHE IS ALIGHT: THE RIDE QUICKENS', '#ff6b6b'); c.sound(ph === 2 ? 'dark' : 'alight'); }
  const heroes = c.heroes || [], seen = wqSeen(e, heroes), near = nearestHero(e, heroes, WQ.sight, WQ.sightY);
  e.seen = seen;
  const toward = () => { if (near) e.face = Math.sign(near.x - e.x) || e.face || -1; };
  if (e.mode === 'wake') { if (e.modeT <= 0) e.mode = 'still'; return ev; }
  e.open = wqOpen(e) ? Math.max(0, e.modeT) : 0;
  const tipWas = e.tip || 0; e.tip = thrustTip(e);
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
    case 'stabTell':
      if (seen) { e.mode = 'still'; ev.push({ t: 'freeze', cancel: 'stab' }); c.sound('still'); return ev; }
      toward();
      if (e.modeT <= 0) { e.mode = 'stab'; e.modeT = WQ.strike; e.n.stab++;
        const x0 = e.face > 0 ? e.x - 4 : e.x - WQ.stabReach, box = [x0, x0 + WQ.stabReach + 4, (c.A.floor) - 44, c.A.floor];
        ev.push({ t: 'stab', box }); c.sound('stab'); c.hit(box, WQ.dmg.stab, 'HER SPEAR'); }
      return ev;
    case 'stab': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = WQ.recover; } return ev;
    case 'recover': if (e.modeT <= 0) e.mode = 'still'; return ev;
    case 'thrustHighTell': case 'thrustLowTell':   /* the spear is drawn back at the height it will fly: the thrust is committed (a look does not stop her arms) */
      if (e.modeT <= 0) { e.thrustKind = e.mode === 'thrustLowTell' ? 'low' : 'high'; e.mode = 'thrust'; e.modeT = WQ.thrustT + WQ.thrustHold + WQ.thrustBack; e.n.thrust++;
        e.tip = WQ.thrustFrom; ev.push({ t: 'thrust', kind: e.thrustKind, dir: e.thrustDir }); c.sound('thrust'); }
      return ev;
    case 'thrust': {   /* the lunge: the blade runs out along the ride; each hero is judged once, the moment it reaches him (the host's c.thrust) */
      const was = tipWas, tip = e.tip;
      if (tip > was && c.thrust) { const a = e.x + e.thrustDir * was, b = e.x + e.thrustDir * tip; c.thrust(e.thrustKind, Math.min(a, b), Math.max(a, b)); }
      if (e.modeT <= 0) { e.mode = 'still'; e.tip = 0; e.rest = WQ.rest; e.thrustCd = WQ.thrustEvery[ph - 1]; }
      return ev; }
    case 'lashLowTell': case 'lashHighTell':   /* the ribbons are wound up at the height they will fly: a look does not stop them */
      if (e.modeT <= 0) { e.lashKind = e.mode === 'lashLowTell' ? 'low' : 'high'; e.mode = 'lash'; e.modeT = WQ.lashT; e.lashR = 0; e.n.lash++;
        ev.push({ t: 'lash', kind: e.lashKind }); c.sound('lash'); }
      return ev;
    case 'lash': {
      const r0 = e.lashR || 0, r1 = WQ.lashReach * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.lashT); e.lashR = r1;
      c.lash(e.lashKind, r0, r1);
      if (e.modeT <= 0) { e.mode = 'still'; e.lashCd = WQ.lashEvery[ph - 1]; e.lashR = 0; e.rest = WQ.rest; }
      return ev; }
    case 'floorTell':   /* the spear butt raised over the boards, and they glow the length of the ride: a look does not stop it */
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
  if (near && !seen && dx <= WQ.reach && Math.abs((near.y || 0) - (e.y || 0)) < 40) {
    toward(); e.mode = 'stabTell'; e.modeT = WQ.glow; ev.push({ t: 'glow' }); c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.sound('stabTell'); return ev; }
  if (!(e.rest > 0)) {
    if (near && seen && e.thrustCd <= 0 && dx <= WQ.thrustReach - 8 && Math.abs((near.y || 0) - (e.y || 0)) < WQ.thrustY) {   /* LOOKED AT, IN HER SPEAR'S REACH: her feet are held, so her arms answer - she thrusts */
      toward(); const kind = THRUST_ORDER[(e.thrustN++) % THRUST_ORDER.length]; e.thrustDir = e.face; e.thrustKind = kind;
      e.mode = kind === 'low' ? 'thrustLowTell' : 'thrustHighTell'; e.modeT = WQ.thrustTell; e.tip = thrustTip(e); ev.push({ t: 'thrustTell', kind, dir: e.thrustDir });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, kind === 'low' ? 'HER SPEAR, LOW: JUMP' : 'HER SPEAR, HIGH: DUCK', '#ff6b6b'); c.sound('thrustTell'); return ev; }
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
