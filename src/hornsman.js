// src/hornsman.js - THE HORNSMAN, THE PALISADE WOOD's one new foe (claude/palisadefoe, Daniel 10-25: "Palisade Wood should get its own unique new foe" - the
// siege-crew handler of the Battering Beast, promoted from a boss add to a real foe of the level). Pure, no DOM: tools/hornsman.mjs drives it headless and in the
// page; src/main.js holds its hands (updateHornsman).
//
//   WHO       A human siege-crewman, NOT a goblin: soot-black face, a riveted iron kettle hat with the crew's red crest, a rust tunic under a leather apron, iron-grey
//             gauntlets, and a brass-bound ORDER HORN slung at his hip and a wooden maul. He is the crew's HANDLER: he does not shoot; he commands the towers.
//   THE ORDER Every few seconds, while he can see you and an archer of the wall stands within earshot, he raises the horn (orderTell: the horn up at his mouth, a bar
//             filling over him, a climbing note, and the word THE ORDER) and blows. A blast that lands is a VOLLEY ORDER: every archer in earshot DRAWS AT ONCE and then
//             shoots at a hurried beat for ORDER.len seconds (each arrow still told by its own '!' and draw pose, but they come in quick order, from all the towers
//             together). KILL HIM, or HIT HIM WHILE THE HORN IS UP, and the order dies in his throat ("ORDER LOST"): the archers keep their own slow beat. Out of
//             sight of the towers he is only a man with a maul.
//   THE MAUL  Within a maul's length he swings it (maulTell, a yellow !: the shield turns it).
// A foe's state is kept in e.st, as fair-foes.js keeps the barker's: the step sets s.vx (px/s) and the HOST moves the body and writes the real x back.
import { nearestHero } from './mummer.js';

export const HORNSMAN = { w: 10, h: 22, hp: 26, walk: 30, keep: 60, first: 1.6, every: 5.6, orderTell: 0.95, order: 0.45, sight: 300, sightY: 150, earR: 330, earY: 220,
  len: 2.6, rate: 1.25, maulReach: 24, maulTell: 0.5, maul: 0.14, dmg: 11, recover: 0.75, lost: 1.0 };
export const ORDER = { len: HORNSMAN.len, rate: HORNSMAN.rate, first: 0.3 };   /* an ordered archer's NEXT shot comes in ORDER.first s, then every ORDER.rate s for ORDER.len s */

export const newHornsman = (x, y, face = -1) => ({ x, y, face, mode: 'stand', t: 0, vx: 0, orderT: HORNSMAN.first, hornK: 0 });

/* one frame. world = { heroes, canStep(x, dir), archers: count of live archers within earshot }. Events:
   orderTell { dur }, order { }, lost (the horn cut short), maulTell, maul { box, dmg } */
export function hornsmanStep(s, w, dt) {
  const evs = [], C = HORNSMAN; s.vx = 0;
  const near = nearestHero(s, w.heroes, C.sight, C.sightY);
  switch (s.mode) {
    case 'stand': case 'walk': {
      if (!near) { s.mode = 'stand'; s.orderT = Math.max(s.orderT, C.first); break; }
      s.face = Math.sign(near.x - s.x) || s.face;
      const d = Math.abs(near.x - s.x);
      if (d <= C.maulReach && Math.abs((near.y || 0) - (s.y || 0)) < 40) { s.mode = 'maulTell'; s.t = C.maulTell; evs.push({ t: 'maulTell' }); break; }
      if ((w.archers | 0) > 0) { s.orderT -= dt; if (s.orderT <= 0) { s.mode = 'orderTell'; s.t = C.orderTell; s.hornK = 0; evs.push({ t: 'orderTell', dur: C.orderTell }); break; } }
      /* he keeps his distance: backs off a hero who comes in, and holds his post otherwise */
      if (d < C.keep && (!w.canStep || w.canStep(s.x, -s.face))) { s.vx = -s.face * C.walk; s.mode = 'walk'; } else s.mode = 'stand';
      break; }
    case 'orderTell':
      s.face = near ? (Math.sign(near.x - s.x) || s.face) : s.face;
      s.t -= dt; s.hornK = 1 - Math.max(0, s.t) / C.orderTell;
      if (s.t <= 0) { s.mode = 'order'; s.t = C.order; s.orderT = C.every; evs.push({ t: 'order' }); }
      break;
    case 'order': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'maulTell':
      s.t -= dt; if (s.t <= 0) { s.mode = 'maul'; s.t = C.maul; const x0 = s.face > 0 ? s.x : s.x - (C.maulReach + 8);
        evs.push({ t: 'maul', dmg: C.dmg, box: [x0, x0 + C.maulReach + 8, s.y - C.h, s.y] }); }
      break;
    case 'maul': s.t -= dt; if (s.t <= 0) { s.mode = 'recover'; s.t = C.recover; } break;
    case 'recover': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    case 'lost': s.t -= dt; if (s.t <= 0) s.mode = 'stand'; break;
    default: s.mode = 'stand';
  }
  return evs;
}
/* a blow that lands on him: cut the horn short (the order is lost, and he has to start the breath again) or spoil the maul */
export function hornsmanStruck(s) {
  if (s.mode === 'orderTell') { s.mode = 'lost'; s.t = HORNSMAN.lost; s.orderT = HORNSMAN.every * 0.6; s.hornK = 0; return 'lost'; }
  if (s.mode === 'maulTell') { s.mode = 'stand'; s.orderT = Math.max(s.orderT, 1.2); return 'maul'; }
  return null;
}
