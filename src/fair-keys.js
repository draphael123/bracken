// fair-keys.js - THE HARVEST FAIR's KEYS AND SHARPER FOES (claude/fairfix2; Daniel 2026-10-01: "tickets are unclear", "bull's-eyes / hidden paths are underused", "INCREDIBLY EASY
// at level 1 with no abilities"). Pure, no DOM: tools/harvest-fair.mjs proves it headless; src/main.js holds the hands (fairKeysStep, the HUD, the doors).
//
//   TICKETS ARE KEYS   a ticket is never spent. TICKET GATES (L.ticketGates) stand across the mouths of the fair's hidden paths, each with a sign that says its price: SHOW n
//                      TICKETS. Hold n (picked up, or paid by a striker's first ring) and the gate swings open for good. ALL of them open THE BACK LOT (the last gate, `all`),
//                      where the fair's own relic lies. ticketTotal(L) is every ticket the level holds; the HUD says "n/total" and what they open.
//   BULL'S-EYES        a gallery of one target (src/fair-games.js) can OPEN things: planks (a platform runs up), bars (a cage's bars drop), and its target can hang ON A RIDE
//                      (`on: { kind, idx }`: a wheel car or a swing chair) - liveTargets() moves it with the ride every frame.
//   THE MIRROR DOOR    a doorway in the hall of mirrors that is not there: only a TRUE glass in front of you shows it (`mirror: true` on the doorway). mirrorDoorOpen() says when a
//                      hero can use it: standing at it, facing a true mirror within the hall's reach (src/fair-games.js mirrorSees).
//   SHARPER FOES       the fair's mummers and horses are the theatre's, made deadlier one-on-one without a point more health: FAIR_MUMMER creeps faster, glows shorter, cuts
//                      harder and recovers sooner; FAIR_HORSE hits harder and runs further. A crowned mummer of the Wicker Queen's keeps the plain numbers (her fight is tuned).
import { MUMMER, HORSE, TS } from './mummer.js';
import { mirrorSees } from './fair-games.js';

export const FAIR_MUMMER = { ...MUMMER, creep: 54, glow: 0.45, dmg: 18, recover: 0.75 };
export const FAIR_HORSE = { ...HORSE, dmg: 26, dist: 220 };
export const KEYS_TEXT = { gate: n => 'SHOW ' + n + ' TICKETS', open: 'THE GATE SWINGS OPEN', all: n => 'THE BACK LOT. ALL ' + n + ' TICKETS', hud: 'TICKETS OPEN THE GATES; ALL OF THEM, THE BACK LOT' };

/* every ticket the level holds: the ones lying about and what the strikers pay on their first ring */
export const ticketTotal = L => (L.tickets || []).length + (L.strikers || []).reduce((n, s) => n + (s.tickets || 0), 0);
/* a gate's price: `all` is every ticket in the level */
export const gateNeed = (L, g) => (g.all ? ticketTotal(L) : g.need);

export function newKeys(L) { return { gates: (L.ticketGates || []).map((g, i) => ({ ...g, i, open: false, told: 0 })) }; }
/* one frame. heroes [{ x, y, dead }]; tickets = how many the heroes hold. Returns events: { t: 'open', g } (clear its tiles), { t: 'ask', g, have } (a hero at a shut gate) */
export function keysStep(K, L, heroes, tickets, dt) {
  const evs = [];
  for (const g of K.gates) { g.told = Math.max(0, g.told - dt); if (g.open) continue;
    const need = gateNeed(L, g), x0 = g.x * TS - 20, x1 = (g.x + (g.w || 1)) * TS + 20, y0 = g.y0 * TS - 8, y1 = (g.y1 + 1) * TS + 24;
    const at = heroes.some(h => !h.dead && h.x >= x0 && h.x <= x1 && h.y >= y0 && h.y <= y1);
    if (at && tickets >= need) { g.open = true; evs.push({ t: 'open', g }); }
    else if (at && g.told <= 0) { g.told = 3; evs.push({ t: 'ask', g, have: tickets, need }); } }
  return evs;
}

/* a target that hangs on a ride: its live centre from the ride's mover (movers as main.js keeps them: { kind, fair, idx, x, y, w }) */
export function liveTargets(galleries, movers) {
  for (const Gy of galleries || []) for (const t of Gy.targets) { if (!t.on) continue;
    const m = (movers || []).find(q => (t.on.kind === 'gondola' ? q.fair === 'gondola' && q.idx === t.on.idx : q.fair === 'chair' && q.chairI === t.on.idx));
    if (m) { t.px = m.x + m.w / 2; t.py = m.y + (t.on.dy || 14); } }
}

/* can this hero use the mirror door? he stands at it and a true glass ahead of him shows it */
export const mirrorDoorOpen = (L, door, h) => !!door && !!h && Math.abs(h.x - door.x) < 14 && Math.abs(h.y - door.y) < 22 && mirrorSees(L, h);

/* THE FORTUNE-TELLER'S GLASS (the back lot's relic): a hand mirror at the belt. What creeps up within GLASS_R px behind you is seen, as if a true mirror stood in front of you */
export const GLASS_R = 64;
export const glassSees = (p, e) => !!p && !!e && p.relic === 'handglass' && Math.abs(e.x - p.x) < GLASS_R && Math.abs(e.y - p.y) < 40;
