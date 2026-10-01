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

export const FAIR_MUMMER = { ...MUMMER, creep: 64, glow: 0.42, dmg: 22, recover: 0.6 };
export const FAIR_HORSE = { ...HORSE, dmg: 30, dist: 240 };
export const KEYS_TEXT = { gate: n => 'SHOW ' + n + ' TICKETS', open: 'THE GATE SWINGS OPEN', all: n => 'THE BACK LOT. SHOW ' + n + ' TICKETS', hud: 'TICKETS OPEN THE GATES; 30 OPEN THE BACK LOT' };

/* every ticket the level holds: the ones lying about and what the strikers pay on their first ring */
export const ticketTotal = L => (L.tickets || []).length + (L.strikers || []).reduce((n, s) => n + (s.tickets || 0), 0);
/* a gate's price: its `need`; `all` with no need is every ticket in the level (claude/fairfix3: the back lot asks 30 of the 35 now - review #5, one ticket missed
   behind the slide made it unopenable) */
export const gateNeed = (L, g) => (g.need !== undefined ? g.need : g.all ? ticketTotal(L) : 0);
/* TICKETS LEFT, AREA BY AREA (claude/fairfix3; Daniel: "the HUD shows tickets LEFT PER AREA"): the level's sections (L.arc, or L.ticketAreas) and how many of each
   section's tickets are still lying there or unpaid by its striker. G: the games' state (src/fair-games.js newGames: taken, strikers[].paid) */
export const TICKET_AREAS = [['GATE', 'teach'], ['STALLS', 'develop'], ['MIDWAY', 'twist'], ['HARVEST', 'combine'], ['LAST ROUND', 'exam']];   /* (short: they stand in a narrow column under the plate) */
export function ticketsLeft(L, G) {
  const arc = L.arc || {}, rows = TICKET_AREAS.map(([name, k]) => ({ name, x0: (arc[k] || [0, 0])[0], x1: k === 'exam' ? L.W : (arc[k] || [0, 0])[1], left: 0, all: 0 }));
  const area = x => rows.find(r => x >= r.x0 && x < r.x1) || rows[rows.length - 1];
  (L.tickets || []).forEach((t, i) => { const r = area(t.x); r.all++; if (!(G && G.taken && G.taken.has(i))) r.left++; });
  for (const s of (L.strikers || [])) { const r = area(s.x), st = G && G.strikers && G.strikers.find(q => q.x === s.x); r.all += s.tickets || 0; if (!(st && st.paid)) r.left += s.tickets || 0; }
  return rows;
}
/* which area a column stands in (its index in TICKET_AREAS) */
export const areaAt = (L, x) => { const rows = ticketsLeft(L, null); const i = rows.findIndex(r => x >= r.x0 && x < r.x1); return i < 0 ? rows.length - 1 : i; };

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

/* THE RANGED PAIR, made deadly by their hands, not their health (claude/fairfix2: "INCREDIBLY EASY at level 1"):
   THE KNIFE JUGGLER (the archer's AI) throws FLAT and FAST - a knife at chest height, 300 px/s, aimed where you will be when it arrives - every 1.7 s, after a told 0.45 s draw.
   THE COCONUT SHY (the drunk's AI) throws every 1.4-1.9 s, and at the release he leads you: the coconut comes down where you are running to (its ring shows it in the air). */
export const JUGGLER = { draw: 0.45, every: 1.7, speed: 300, dy: 120, rethrow: 0.5 };   /* dy: he throws down from a roof or a tower top, further than an archer looks. rethrow: after a look breaks his draw, the beat before he can draw again (claude/fairfix3) */
/* THE FAIR'S RULE FOR ITS THROWERS (claude/fairfix3; review UPGRADE A): a knife juggler or the coconut shy's stallholder throws only at a TURNED BACK - while a hero LOOKS at
   him (src/mummer.js looks: the same look that holds a mummer, shortened by the night, turned by the glass, stopped by a wall) he only juggles. WATCH: how far that look reaches
   him in the light (past his own throwing range, so a look from where he can hit you always counts) */
export const WATCH = { sight: 320, sightY: 160 };
export const SHY = { every: 1.4, lead: 0.8, coconut: 14, ball: 18 };
export function knifeShot(sx, sy, tx, ty, tvx) {
  let T = Math.max(0.2, Math.hypot(tx - sx, ty - sy) / JUGGLER.speed); const ax = tx + tvx * T; T = Math.max(0.2, Math.hypot(ax - sx, ty - sy) / JUGGLER.speed);
  const lx = tx + tvx * T * 0.9, d = Math.hypot(lx - sx, ty - sy) || 1;
  return { x: sx, y: sy, vx: (lx - sx) / d * JUGGLER.speed, vy: (ty - sy) / d * JUGGLER.speed };
}
export function shyLead(e, P, surfaceUnder) { if (!P || P.dead) return; const tx = P.x + Math.max(-110, Math.min(110, (P.vx || 0) * SHY.lead)); e.aimX = tx; e.aimY = surfaceUnder ? surfaceUnder(tx, P.y - 8) : P.y; }

/* THE DROP (the fair's mummers, claude/fairfix2): a mummer at a roof's edge may step off after you if footing lies within DROP rows below - and it is not spikes or a pit.
   tileAt(x, y) -> tile id; the column tx, the row ty under its feet */
export const DROP = 4;
export function dropOk(tileAt, tx, ty, T) {
  for (let y = ty; y <= ty + DROP; y++) { const t = tileAt(tx, y); if (t === T.SPIKE) return false; if (t !== T.AIR) return true; }
  return false;
}
