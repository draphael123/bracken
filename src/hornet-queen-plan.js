// src/hornet-queen-plan.js - THE HORNET QUEEN 2's BOT (claude/hornetsnest; src/lab.js drives a hero with it). What a player reads - her tells a reaction late, the red
// rings, the stingers, her loop's shadow, the pines' tallies, the comb's line - and her RULES: in the hall, stand on a comb perch as she dives and leave late (a shield
// takes the dive: STAGGERED); smoke under her when she comes low (a carried pot) for the no-shield heroes; smash a pulsing cell; down the trunk; under the pine, lay three
// strokes in a pine and strike the fourth when she will be under it as it lands, or cut the last comb from the bough as she passes under it.
// s = { P: { x, y, vy, face, ground, atk, held }, e, S, reach, shield, dodge, t, rng, mem, v2, stands: [{ x, y }], rest }
import { HQ, OPEN_NAME, hqOpen, loopAhead, underPine } from './hornet-queen.js';
export const PLAN = { react: 0.25, miss: 0.12, missFell: 0.2, leave: 0.2 };
export function hqPlan(s) { const out = hqPlan0(s); if (globalThis.__hqWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__hqWhy[k] = (globalThis.__hqWhy[k] || 0) + 1; } return out; }
function hqPlan0(s) {
  const { P, e, S, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, up: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = HQ.w / 2, dx = Math.abs(e.x - P.x);
  const hitR = reach + half - 4, inReach = () => Math.abs(e.x - P.x) < hitR && e.y > P.y - 40 && e.y - HQ.h < P.y + 2;
  const swing = () => { out.face = Math.sign(e.x - P.x) || out.face; out.atk = P.atk < 0; };
  /* 0. a jump is carried through (a jump attack: the swing comes at the top of it) */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.6) { out.gx = mem.jumpX; out.why = 'in the air'; if (mem.jumpAtk && Math.abs(e.y - HQ.h / 2 - (P.y - 14)) < 22 && dx < hitR + 4) swing(); return out; }
  const jumpTo = (x, atk, why) => { out.jump = P.ground; out.gx = x; mem.jumpT = t; mem.jumpX = x; mem.jumpAtk = !!atk; out.why = why; return out; };
  /* 1. THE COMB COMING DOWN: off its red ring */
  if (S.stage === 'escape') return escapePlan(s, out, mem, t);
  { const rings = S.chunks.filter(c => Math.abs(c.floorY - P.y) <= 10), R = HQ.buzz.r + 10, bad = x => rings.some(c => Math.abs(x - c.x) < R);
    if (rings.length && bad(P.x)) { const lo = (S.stage === 2 ? S.G.p.x0 : S.G.h.x0) + 12, hi = (S.stage === 2 ? S.G.p.x1 : S.G.h.x1) - 12; let best = null;
      for (let d = 8; d < 160 && best === null; d += 8) for (const sg of [-1, 1]) { const x = P.x + sg * d; if (x > lo && x < hi && !bad(x)) { best = x; break; } }
      if (best !== null) { out.gx = best; out.why = 'off the red ring'; return out; } } }
  if (S.stage === 2) return pinePlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo);
  return hallPlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo);
}
/* THE HALL (P1) */
function hallPlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo) {
  const { P, e, S, reach } = s, H = S.G.h, floor = H.floor, half = HQ.w / 2, side = Math.sign(P.x - e.x) || 1, dx = Math.abs(e.x - P.x);
  const perches = S.perches.filter(p => p.st !== 'gone'), onPerch = P.ground ? perches.find(p => Math.abs(P.y - p.y) < 3 && P.x > p.x0p - 2 && P.x < p.x1p + 2) : null;
  const low = perches.filter(p => floor - p.y <= 34);   /* the two wall perches (two rows up): a jump from the floor */
  const lowNear = low.slice().sort((a, b) => Math.abs((a.x0p + a.x1p) / 2 - P.x) - Math.abs((b.x0p + b.x1p) / 2 - P.x))[0];
  const tellKey = 'a' + S.act + e.mode, seen = seenFor(tellKey), miss = s.v2 ? false : roll(tellKey + 'm', PLAN.miss);
  const smoker = !s.shield;   /* the no-shield heroes carry smoke: it is their opening (her dive at a carried pot) */
  /* A. HER OPENINGS: strike her. On a perch: up onto it beside her (or a jump attack from below) */
  if (hqOpen(e)) {
    if (P.held) { out.talk = true; out.why = 'set the pot down: she is open'; return out; }
    const sp = perches.find(p => Math.abs(e.y - p.y) < 4 && e.x > p.x0p - 4 && e.x < p.x1p + 4);
    if (sp && onPerch !== sp) { const gx = Math.max(sp.x0p + 4, Math.min(sp.x1p - 4, e.x - side * (half + 2)));
      if (P.ground && P.y > sp.y + 4 && Math.abs(P.x - gx) < 26) return jumpTo(gx, true, 'up onto her perch');
      out.gx = gx; out.why = 'to her perch'; return out; }
    out.gx = e.x + side * (half + reach * 0.5); if (inReach()) swing(); out.why = 'strike her: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  /* B. HER TELLS (a reaction late) - before her ward: she strikes through it */
  if (e.mode === 'sweepTell' || e.mode === 'sweep') {
    if (onPerch) { out.gx = P.x; out.why = 'the sweep passes under the perch'; return out; }
    if (seen && !miss) { if (s.shield && !roll(tellKey + 'b', 0.3)) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the sweep'; return out; }
      const coming = e.mode === 'sweep' && (P.x - e.x) * (e.vx || 0) > 0 && dx < 46; if (coming) return jumpTo(P.x + Math.sign(e.vx || 1) * 8, false, 'jump the sweep'); }
    out.gx = P.x; out.why = 'the sweep: ready'; return out; }
  if (e.mode === 'aim' || e.mode === 'dive') {
    if (e.mode === 'aim') {
      if (s.shield) { out.gx = P.x; out.face = Math.sign(e.x - P.x) || 1; out.why = 'her aim: shield ready'; return out; }
      if (P.held) { out.gx = P.x; out.why = 'her aim: the pot in hand'; return out; }
      if (!onPerch && lowNear) { const gx = (lowNear.x0p + lowNear.x1p) / 2; if (P.ground && Math.abs(P.x - gx) < 30) return jumpTo(gx, false, 'onto a perch: bait the dive'); out.gx = gx; out.why = 'to a perch: bait the dive'; return out; }
      out.gx = P.x; out.why = 'on the perch: wait for the stoop'; return out; }
    /* the stoop: a shield takes it; on a perch, leave LATE (her sting goes in the comb); with a pot, let it come (the smoke takes her) */
    const toward = (e.vy || 0) > 0, eta = Math.max(0, P.y - e.y) / Math.max(60, e.vy || 1);
    if (s.shield && seenFor('dv' + S.act, 0.12)) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (P.held) { out.gx = P.x; out.why = 'the dive meets the smoke'; return out; }
    if (toward && eta < PLAN.leave + (s.v2 ? 0 : 0.05) && dx < 40) { if (s.dodge) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'leave late: roll'; return out; } return jumpTo(P.x + side * 40, false, 'leave late: jump'); }
    out.gx = P.x; out.why = 'the stoop: hold'; return out; }
  if (e.mode === 'buzzTell' && onPerch && onPerch.st === 'shake') { out.gx = onPerch.x0p - 20 > H.x0 ? onPerch.x0p - 20 : onPerch.x1p + 20; out.why = 'off the shaking perch'; return out; }
  /* HER BROOD'S DRONES: a cut at one in reach while she is not on you */
  const add = (s.adds || []).filter(a => Math.abs(a.x - P.x) < reach + 8 && a.y > P.y - 40 && a.y < P.y + 4).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (add && !P.held) { out.face = Math.sign(add.x - P.x) || out.face; out.atk = P.atk < 0; out.gx = P.x; out.why = 'cut a drone'; return out; }
  if (S.ward > 0 || e.mode === 'thrash') { out.gx = e.x + side * 44; out.why = 'her ward: off her'; return out; }
  /* C. A PULSING CELL: smash it while she is not on you */
  const cell = S.cells.find(c => c.st === 'pulse'); if (cell && (e.mode === 'hover' || e.mode === 'rise' || e.mode === 'buzz' || e.mode === 'buzzTell')) {
    if (Math.abs(cell.y - P.y) > 6 && P.ground && Math.abs(P.x - cell.x) < 22) return jumpTo(cell.x, true, 'up to the cell');
    out.gx = cell.x - Math.sign(cell.x - P.x || 1) * 10; out.face = Math.sign(cell.x - P.x) || out.face; if (Math.abs(P.x - cell.x) < reach + 6 && Math.abs(cell.y - P.y) < 6) out.atk = P.atk < 0; out.why = 'smash the pulsing cell'; return out; }
  /* D. SMOKE, for the no-shield heroes: a pot in hand before her next dive */
  if (smoker && !P.held && (e.smokeCd || 0) <= 0 && s.stands && s.stands.length) { const st = s.stands.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (Math.abs(st.x - P.x) < 180) { out.gx = st.x; if (Math.abs(st.x - P.x) < 8 && P.ground && Math.abs(st.y - P.y) < 10) out.talk = true; out.why = 'take a smoke pot'; return out; } }
  /* E. IN REACH (she hangs low after a pull-up): a cut, her shell or not */
  if (inReach() && (e.mode === 'skim' || e.mode === 'rise')) { swing(); out.gx = P.x; out.why = 'a cut as she rises'; return out; }
  /* F. stand by a perch, ready to go up onto it */
  if (P.held) { out.gx = Math.max(H.x0 + 30, Math.min(H.x1 - 30, P.x)); out.why = 'carry the pot, wait for her'; return out; }
  if (lowNear && !onPerch) { out.gx = (lowNear.x0p + lowNear.x1p) / 2 + (lowNear.x0p < H.mid ? 22 : -22); out.why = 'by a perch'; return out; }
  out.gx = P.x; out.why = 'wait'; void dx; return out;
}
/* THE FALLING NEST: the ledges down, one after another, out of the rings */
function escapePlan(s, out, mem, t) {
  const { P, S } = s, X = S.G.x; if (!X) { out.why = 'no escape'; return out; }
  if (P.y <= X.top + 2 && P.x < X.x0) { out.gx = X.x0 + 24; out.why = 'out of the hall'; return out; }
  if (P.y >= X.bottom - 2) { out.gx = S.G.p.trigger + 40; out.why = 'into the clearing'; return out; }
  const below = X.ledges.filter(l => l.y > P.y + 2).sort((a, b) => a.y - b.y), next = below[0];
  /* the ledge he stands on, and its open edge (a west ledge is in the nest's side: off its east end; an east one is on the trunk: off its west end) */
  const here = P.ground ? X.ledges.find(l => Math.abs(l.y - P.y) < 3 && P.x > l.x0 - 4 && P.x < l.x1 + 4) : null, west = here && here.x0 <= X.x0 + 2, edge = here ? (west ? here.x1 + 10 : here.x0 - 10) : null;
  if (!next) { if (here) { out.gx = edge; out.why = 'off the last ledge'; return out; } out.gx = X.x1 - 40; out.why = 'down to the foot'; return out; }
  const cx = (next.x0 + next.x1) / 2; if (!P.ground) { out.gx = cx; out.why = 'falling to the ledge'; return out; }
  /* a ring on the next ledge where it lands: wait a beat on this one (if this one is clear) */
  const ringNext = S.chunks.some(c => Math.abs(c.floorY - next.y) < 4 && Math.abs(c.x - cx) < 40 && c.st === 'told'), ringHere = S.chunks.some(c => Math.abs(c.floorY - P.y) < 4 && Math.abs(c.x - P.x) < HQ.escape.r + 10);
  if (ringNext && !ringHere) { out.gx = P.x; out.why = 'the next ledge is ringed: wait'; return out; }
  out.gx = here ? edge : cx; out.why = 'down the ledges'; void mem; void t; return out;
}
/* THE GREAT PINE (P2) */
function pinePlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo) {
  const { P, e, S, reach } = s, G = S.G.p, floor = G.floor, half = HQ.w / 2, side = Math.sign(P.x - e.x) || 1, dx = Math.abs(e.x - P.x);
  const tellKey = 'a' + S.act + e.mode, seen = seenFor(tellKey), miss = s.v2 ? false : roll(tellKey + 'm', PLAN.miss);
  if (P.held) { out.talk = true; out.why = 'set the pot down'; return out; }
  { const fall = S.pines.find(p => p.st === 'fall' && P.x > Math.min(p.x + p.dir * 8, p.x + p.dir * p.len * 16) - 8 && P.x < Math.max(p.x + p.dir * 8, p.x + p.dir * p.len * 16) + 8);
    if (fall) { out.gx = fall.x - fall.dir * 20; out.why = 'out of the falling pine'; return out; } }
  /* A. STINGERS in the air: a shield takes them; else off their line */
  const st = S.stingers.find(q => Math.abs(q.x - P.x) < 70 && q.y < P.y && (P.x - q.x) * q.vx >= -4);
  if (st) { if (s.shield) { out.block = true; out.face = Math.sign(st.x - P.x) || 1; out.why = 'block the stingers'; return out; } if (s.dodge && !roll('vd' + S.act, 0.3)) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'roll the stingers'; return out; } }
  /* B. OPEN: strike her */
  if (hqOpen(e)) { out.gx = e.x + side * (half + reach * 0.5); if (inReach()) swing(); out.why = 'strike her: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  /* C. HER DIVE: a shield takes it; else leave late */
  if (e.mode === 'aim' && seen && !miss) { out.gx = P.x; out.face = Math.sign(e.x - P.x) || 1; out.why = 'her aim'; return out; }
  if (e.mode === 'dive' && (e.vy || 0) > 0) { const eta = Math.max(0, P.y - e.y) / Math.max(60, e.vy);
    if (s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (eta < PLAN.leave + 0.05 && dx < 44) { if (s.dodge) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'roll the dive'; return out; } return jumpTo(P.x + side * 40, false, 'jump the dive'); }
    out.gx = P.x; out.why = 'the dive: hold'; return out; }
  if (e.mode === 'volleyTell') { out.gx = P.x + side * 30; out.why = 'the volley: step aside'; return out; }
  if (S.cloak > 0 && dx < 40 && Math.abs(e.y - P.y) < 40) { out.gx = e.x + side * 56; out.why = 'her cloak: off her'; return out; }
  /* D. THE LAST COMB: from the bough's east end, cut it as she comes under */
  const c = S.comb, B = G.bough;
  if (c && c.st === 'hang' && B) { const spot = B.x1 - 8, onB = P.ground && Math.abs(P.y - B.y) < 3;
    if (!onB) { const kx = B.x1 + 16, kTop = floor - 32;   /* the root knuckle at the bough's east end: two rows up off the floor, the bough two rows up off it */
      if (P.ground && Math.abs(P.y - kTop) < 3) return jumpTo(spot, false, 'up onto the bough');
      if (P.ground && P.y > kTop + 3 && Math.abs(P.x - kx) < 30) return jumpTo(kx, false, 'up onto the knuckle');
      out.gx = kx + (P.x > kx ? 24 : -24); out.why = 'to the bough'; return out; }
    out.gx = spot; out.face = 1;
    const q = loopAhead(S, 0.42); if (e.mode === 'circle' && q.x > c.x0 - 6 && q.x < c.x1 + 6 && floor - q.y < 60 && !roll('cut' + Math.floor(t), PLAN.missFell)) { out.atk = P.atk < 0; out.why = 'cut the last comb: she comes under'; return out; }
    out.why = 'on the bough: wait for her under the comb'; return out; }
  /* E. THE PINES: three strokes laid in one; the fourth when she will be under it as it lands */
  const cand = S.pines.filter(p => p.st === 'stand'); if (cand.length) {
    const kept = mem.pine !== undefined && cand.find(p => p.id === mem.pine), target = kept || cand.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; mem.pine = target.id;
    const spot = target.x - target.dir * 12; if (Math.abs(P.x - spot) > 6) { out.gx = spot; out.why = 'to the marked pine'; if (inReach()) swing(); return out; }
    out.face = target.dir; if (target.hp > 1) { out.atk = P.atk < 0; out.why = 'lay a stroke in the pine'; return out; }
    const q = loopAhead(S, HQ.pine.fall + 0.1); if (e.mode === 'circle' && underPine(target, { x: q.x, y: q.y }, floor) && !roll('fell' + Math.floor(t * 2), PLAN.missFell)) { out.atk = P.atk < 0; out.why = 'the fourth stroke: she will be under it'; return out; }
    if (inReach()) { swing(); out.why = 'a cut as she passes'; return out; }
    out.why = 'by the primed pine: wait for her pass'; return out; }
  /* F. nothing primed: cut her on her low pass */
  if (inReach()) { swing(); out.gx = P.x; out.why = 'a cut as she passes'; return out; }
  const q = loopAhead(S, 0.6); out.gx = Math.max(G.x0 + 20, Math.min(G.x1 - 20, q.x)); out.why = 'under her low pass'; return out;
}
