// src/hornet-queen-plan.js - THE HORNET QUEEN 2's BOT (claude/hornetsnest; ONE ARENA since claude/hornetsnest2; src/lab.js drives a hero with it). What a player reads - her
// tells a reaction late, the red rings, the stingers, her loop's shadow on the honey, the hanging combs and their plumb lines - and her RULES: in the hall, stand on a comb
// perch as she dives and leave late (a shield takes the dive: STAGGERED); smoke under her when she comes low (a carried pot) for the no-shield heroes; smash a pulsing cell.
// When the hall tears: cut a torn comb down out of the honey (as she passes under it, it pins her), stand on it and bait her stoop into it, and from its inner end cut THE
// LAST COMB as she comes under it.
// s = { P: { x, y, vy, face, ground, atk, held }, e, S, reach, shield, dodge, t, rng, mem, v2, stands: [{ x, y }], rest }
import { HQ, OPEN_NAME, hqOpen, loopAhead, underComb } from './hornet-queen.js';
export const PLAN = { react: 0.25, miss: 0.12, missCut: 0.15, leave: 0.2, cutWait: 5 };
export function hqPlan(s) { const out = hqPlan0(s); if (globalThis.__hqWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__hqWhy[k] = (globalThis.__hqWhy[k] || 0) + 1; } return out; }
function hqPlan0(s) {
  const { P, e, S, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, up: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = HQ.w / 2, dx = Math.abs(e.x - P.x);
  /* in reach: level with the swing, or a little over it - the RISING CUT (UP+X) takes her there (a perch she is stuck in, her low pass) */
  const hitR = reach + half - 4, inReach = () => Math.abs(e.x - P.x) < hitR && e.y > P.y - 58 && e.y - HQ.h < P.y + 2;
  const swing = () => { out.face = Math.sign(e.x - P.x) || out.face; out.atk = P.atk < 0; out.up = e.y < P.y - 16; };
  /* 0. a jump is carried through (a jump attack: the swing comes at the top of it) */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.6) { out.gx = mem.jumpX; out.why = 'in the air'; if (mem.jumpAtk && Math.abs(e.y - HQ.h / 2 - (P.y - 14)) < 22 && dx < hitR + 4) swing(); return out; }
  const jumpTo = (x, atk, why) => { out.jump = P.ground; out.gx = x; mem.jumpT = t; mem.jumpX = x; mem.jumpAtk = !!atk; out.why = why; return out; };
  if (S.stage === 'down') { out.why = 'she is dead'; return out; }
  /* 1. THE COMB COMING DOWN: off its red ring */
  { const rings = S.chunks.filter(c => Math.abs(c.floorY - P.y) <= 10), R = HQ.buzz.r + 10, bad = x => rings.some(c => Math.abs(x - c.x) < R);
    if (rings.length && bad(P.x)) { const lo = S.G.h.x0 + 12, hi = S.G.h.x1 - 12; let best = null;
      for (let d = 8; d < 160 && best === null; d += 8) for (const sg of [-1, 1]) { const x = P.x + sg * d; if (x > lo && x < hi && !bad(x)) { best = x; break; } }
      if (best !== null) { out.gx = best; out.why = 'off the red ring'; return out; } } }
  if (S.stage === 2) return honeyPlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo);
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
    if (sp && onPerch !== sp && inReach()) { swing(); out.gx = P.x; out.why = 'a rising cut at her perch'; return out; }
    if (sp && onPerch !== sp) { const gx = Math.max(sp.x0p + 4, Math.min(sp.x1p - 4, e.x - side * (half + 2)));
      if (P.ground && P.y > sp.y + 4 && Math.abs(P.x - gx) < 26) return jumpTo(gx, true, 'up onto her perch');
      out.gx = gx; out.why = 'to her perch'; return out; }
    out.gx = e.x + side * (half + reach * 0.5); if (inReach()) swing(); out.why = 'strike her: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  /* B. HER TELLS (a reaction late) - before her ward: she strikes through it */
  if (e.mode === 'tearTell' || e.mode === 'tear') { if (onPerch && onPerch.fall) { out.gx = onPerch.x0p - 20 > H.x0 ? onPerch.x0p - 20 : onPerch.x1p + 20; out.why = 'off the shaking perch: the hall tears'; return out; } out.gx = P.x; out.why = 'the hall tears'; return out; }
  if (e.mode === 'sweepTell' || e.mode === 'sweep') {
    if (onPerch) { out.gx = P.x; out.why = 'the sweep passes under the perch'; return out; }
    if (seen && !miss) { if (s.shield && roll(tellKey + 'b', 0.35)) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the sweep'; return out; }
      const coming = e.mode === 'sweep' && (P.x - e.x) * (e.vx || 0) > 0 && dx < 46; if (coming) return jumpTo(P.x + Math.sign(e.vx || 1) * 8, false, 'jump the sweep'); }
    out.gx = P.x; out.why = 'the sweep: ready'; return out; }
  if (e.mode === 'aim' || e.mode === 'dive') {
    if (e.mode === 'aim') {
      if (s.shield) { out.gx = P.x; out.face = Math.sign(e.x - P.x) || 1; out.why = 'her aim: shield ready'; return out; }
      if (P.held && !((e.smokeCd || 0) > 0)) { out.gx = P.x; out.why = 'her aim: the pot in hand'; return out; }
      if (!onPerch && lowNear) { const gx = (lowNear.x0p + lowNear.x1p) / 2; if (P.ground && Math.abs(P.x - gx) < 30) return jumpTo(gx, false, 'onto a perch: bait the dive'); out.gx = gx; out.why = 'to a perch: bait the dive'; return out; }
      out.gx = P.x; out.why = 'on the perch: wait for the stoop'; return out; }
    /* the stoop: a shield takes it; on a perch, leave LATE (her sting goes in the comb); with a pot, let it come (the smoke takes her) */
    const toward = (e.vy || 0) > 0, eta = Math.max(0, P.y - e.y) / Math.max(60, e.vy || 1);
    if (s.shield && seenFor('dv' + S.act, 0.12)) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (P.held && !((e.smokeCd || 0) > 0)) { out.gx = P.x; out.why = 'the dive meets the smoke'; return out; }
    if (toward && eta < PLAN.leave + (s.v2 ? 0 : 0.05) && dx < 40) { if (s.dodge) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'leave late: roll'; return out; } return jumpTo(P.x + side * 40, false, 'leave late: jump'); }
    out.gx = P.x; out.why = 'the stoop: hold'; return out; }
  if (e.mode === 'buzzTell' && onPerch && onPerch.st === 'shake') { out.gx = onPerch.x0p - 20 > H.x0 ? onPerch.x0p - 20 : onPerch.x1p + 20; out.why = 'off the shaking perch'; return out; }
  /* HER BROOD'S DRONES: a cut at one in reach while she is not on you */
  const add = (s.adds || []).filter(a => Math.abs(a.x - P.x) < reach + 8 && a.y > P.y - 40 && a.y < P.y + 4).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (add && !P.held) { out.face = Math.sign(add.x - P.x) || out.face; out.atk = P.atk < 0; out.gx = P.x; out.why = 'cut a drone'; return out; }
  if (S.ward > 0 || e.mode === 'thrash') { if (inReach()) { swing(); out.gx = P.x; out.why = 'a cut through her ward'; return out; } out.gx = e.x + side * 44; out.why = 'her ward: off her'; return out; }
  /* C. A PULSING CELL: smash it while she is not on you */
  const cell = S.cells.find(c => c.st === 'pulse'); if (cell && (e.mode === 'hover' || e.mode === 'rise' || e.mode === 'buzz' || e.mode === 'buzzTell')) {
    if (Math.abs(cell.y - P.y) > 6 && P.ground && Math.abs(P.x - cell.x) < 22) return jumpTo(cell.x, true, 'up to the cell');
    out.gx = cell.x - Math.sign(cell.x - P.x || 1) * 10; out.face = Math.sign(cell.x - P.x) || out.face; if (Math.abs(P.x - cell.x) < reach + 6 && Math.abs(cell.y - P.y) < 6) out.atk = P.atk < 0; out.why = 'smash the pulsing cell'; return out; }
  /* D. SMOKE, for the no-shield heroes: a pot in hand before her next dive */
  if (smoker && !P.held && (e.smokeCd || 0) <= 0 && s.stands && s.stands.length) { const st = s.stands.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (Math.abs(st.x - P.x) < 180) { out.gx = st.x; if (P.ground && P.y < st.y - 10 && Math.abs(st.x - P.x) < 30) { out.drop = true; out.why = 'down off the perch to the pot'; return out; }
      if (Math.abs(st.x - P.x) < 8 && P.ground && Math.abs(st.y - P.y) < 10) out.talk = true; out.why = 'take a smoke pot'; return out; } }
  /* E. IN REACH (she hangs low after a pull-up): a cut, her shell or not */
  if (inReach() && (e.mode === 'skim' || e.mode === 'rise')) { swing(); out.gx = P.x; out.why = 'a cut as she rises'; return out; }
  /* F. stand by a perch, ready to go up onto it */
  if (P.held) { out.gx = Math.max(H.x0 + 30, Math.min(H.x1 - 30, P.x)); out.why = 'carry the pot, wait for her'; return out; }
  if (lowNear && !onPerch) { out.gx = (lowNear.x0p + lowNear.x1p) / 2 + (lowNear.x0p < H.mid ? 22 : -22); out.why = 'by a perch'; return out; }
  out.gx = P.x; out.why = 'wait'; void dx; return out;
}
/* THE HONEY HALL (P2): the hall has torn - honey on the floor, torn combs hanging over her low pass, THE LAST COMB in the vault */
function honeyPlan(s, out, mem, t, seenFor, roll, swing, inReach, jumpTo) {
  const { P, e, S, reach } = s, H = S.G.h, floor = H.floor, half = HQ.w / 2, side = Math.sign(P.x - e.x) || 1, dx = Math.abs(e.x - P.x);
  const tellKey = 'a' + S.act + e.mode, seen = seenFor(tellKey), miss = s.v2 ? false : roll(tellKey + 'm', PLAN.miss);
  /* COMB FOOTING (dry, and her stoop sticks in it): the wall perches still up, and every comb cut down into the honey */
  const foots = [...S.perches.filter(p => p.st !== 'gone').map(p => ({ x0p: p.x0p, x1p: p.x1p, y: p.y, id: p.id })), ...S.combs.filter(c => c.st === 'down').map(c => ({ x0p: c.x0p, x1p: c.x1p, y: c.y, id: c.id, heap: true }))];
  const onFoot = P.ground ? foots.find(f => Math.abs(P.y - f.y) < 3 && P.x > f.x0p - 2 && P.x < f.x1p + 2) : null;
  const nearFoot = foots.slice().sort((a, b) => Math.abs((a.x0p + a.x1p) / 2 - P.x) - Math.abs((b.x0p + b.x1p) / 2 - P.x))[0];
  const hanging = S.combs.filter(c => c.st === 'hang'), last = hanging.find(c => c.last), torn = hanging.filter(c => !c.last);
  const willPass = (c, t0, t1) => { if (e.mode !== 'circle') return false; for (let k = t0; k <= t1 + 1e-6; k += 0.04) if (underComb(c, loopAhead(S, k))) return true; return false; };
  const onTo = (f, why) => { const gx = Math.max(f.x0p + 6, Math.min(f.x1p - 6, P.x)); if (P.ground && P.y > f.y + 4 && Math.abs(P.x - gx) < 30) return jumpTo(gx, false, why); out.gx = gx; out.why = why; return out; };
  /* A. A POT IN HAND: under her low pass (the smoke takes her), or set down when she is open */
  if (P.held) { if (hqOpen(e)) { out.talk = true; out.why = 'set the pot down: she is open'; return out; }
    if (e.mode === 'aim' || e.mode === 'dive') { out.gx = P.x; out.why = 'her dive meets the smoke'; return out; }
    const q = loopAhead(S, 0.7); out.gx = Math.max(H.x0 + 24, Math.min(H.x1 - 24, q.x)); out.why = 'the pot under her low pass'; return out; }
  /* B. STINGERS in the air: a shield takes them; else off their line */
  const st = S.stingers.find(q => Math.abs(q.x - P.x) < 70 && q.y < P.y && (P.x - q.x) * q.vx >= -4);
  if (st) { if (s.shield) { out.block = true; out.face = Math.sign(st.x - P.x) || 1; out.why = 'block the stingers'; return out; } if (s.dodge && !roll('vd' + S.act, 0.3)) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'roll the stingers'; return out; } }
  /* C. OPEN: a comb over her turns it into a pin (cut it); else strike her */
  if (hqOpen(e) && e.mode !== 'pinned') { const over = hanging.find(c => underComb(c, e) && Math.abs(P.y - (c.y + c.rows * 16 + 48)) < 6 && P.x > c.x0p - reach && P.x < c.x1p + reach);
    if (over) { out.gx = Math.max(over.x0p + 6, Math.min(over.x1p - 6, P.x)); out.face = Math.sign(((over.x0p + over.x1p) / 2) - P.x) || out.face; out.atk = P.atk < 0; out.up = true; out.why = 'drop the comb on her: she is open under it'; return out; } }
  if (hqOpen(e)) { const sp = foots.find(f => Math.abs(e.y - f.y) < 4 && e.x > f.x0p - 4 && e.x < f.x1p + 4);
    if (sp && onFoot !== sp && inReach()) { swing(); out.gx = P.x; out.why = 'a rising cut at her comb'; return out; }
    if (sp && onFoot !== sp) { const gx = Math.max(sp.x0p + 4, Math.min(sp.x1p - 4, e.x - side * (half + 2))); if (P.ground && P.y > sp.y + 4 && Math.abs(P.x - gx) < 26) return jumpTo(gx, true, 'up onto her comb'); out.gx = gx; out.why = 'to her comb'; return out; }
    out.gx = e.x + side * (half + reach * 0.5); if (inReach()) swing(); out.why = 'strike her: ' + (OPEN_NAME[e.mode] || 'open').toLowerCase(); return out; }
  /* D. HER DIVE: a shield takes it; on comb, leave late (it sticks); else onto comb to bait it */
  if (e.mode === 'aim') {
    if (s.shield) { out.gx = P.x; out.face = Math.sign(e.x - P.x) || 1; out.why = 'her aim: shield ready'; return out; }
    if (!seen || miss) { out.gx = P.x; out.why = 'her aim'; return out; }
    if (!onFoot && nearFoot && Math.abs((nearFoot.x0p + nearFoot.x1p) / 2 - P.x) < 150) return onTo(nearFoot, 'onto comb: bait the stoop');
    out.gx = P.x; out.why = 'on comb: wait for the stoop'; return out; }
  if (e.mode === 'dive' && (e.vy || 0) > 0) { const eta = Math.max(0, P.y - e.y) / Math.max(60, e.vy);
    if (s.shield && seenFor('dv' + S.act, 0.12)) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (eta < PLAN.leave + (s.v2 ? 0 : 0.05) && dx < 44) { if (s.dodge) { out.dodge = true; out.gx = P.x + side * 40; out.why = 'leave late: roll'; return out; } return jumpTo(P.x + side * 40, false, 'leave late: jump'); }
    out.gx = P.x; out.why = 'the stoop: hold'; return out; }
  if (e.mode === 'volleyTell') { out.gx = P.x + side * 30; out.why = 'the volley: step aside'; return out; }
  if (S.cloak > 0 && dx < 40 && Math.abs(e.y - P.y) < 40) { out.gx = e.x + side * 56; out.why = 'her cloak: off her'; return out; }
  if (S.ward > 0 || e.mode === 'thrash') { if (inReach()) { swing(); out.gx = P.x; out.why = 'a cut through her ward'; return out; } }
  /* E. THE LAST COMB: from the inner end of a torn comb cut down into the honey, cut it as she comes under it */
  if (last) { const heaps = S.combs.filter(c => c.st === 'down' && !c.last && (Math.abs(c.x1p - last.x0p) < 24 || Math.abs(c.x0p - last.x1p) < 24));
    const hp = heaps.sort((a, b) => Math.abs((a.x0p + a.x1p) / 2 - P.x) - Math.abs((b.x0p + b.x1p) / 2 - P.x))[0];
    if (hp) { const spot = hp.x1p <= last.x0p + 4 ? hp.x1p - 5 : hp.x0p + 5, on = P.ground && Math.abs(P.y - hp.y) < 3;
      if (!on) { if (P.ground && P.y > hp.y + 4 && Math.abs(P.x - spot) < 30) return jumpTo(spot, false, 'up onto the cut comb, under the last'); out.gx = spot; out.why = 'to the cut comb under the last'; return out; }
      out.gx = spot; out.face = hp.x1p <= last.x0p + 4 ? 1 : -1;
      if (willPass(last, 0.12, 0.42) && !roll('lc' + Math.floor(t * 2), PLAN.missCut)) { out.atk = P.atk < 0; out.up = true; out.why = 'cut the last comb: she comes under'; return out; }
      if (inReach() && e.mode === 'circle') { swing(); out.why = 'a cut as she passes'; return out; }
      out.why = 'by the last comb: wait for her pass'; return out; } }
  /* F. A TORN COMB: under it, cut it as she passes under (a pin), or - waited long enough - for the step out of the honey */
  if (torn.length) { const c = torn.slice().sort((a, b) => Math.abs((a.x0p + a.x1p) / 2 - P.x) - Math.abs((b.x0p + b.x1p) / 2 - P.x))[0], spot = (c.x0p + c.x1p) / 2;
    if (Math.abs(P.x - spot) > 8 || !P.ground || P.y < floor - 3) { out.gx = spot; if (P.ground && P.y < floor - 3) out.drop = true; out.why = 'under the torn comb'; mem.cutWait = t; return out; }
    out.gx = spot; out.face = P.face; if (mem.cutWait === undefined) mem.cutWait = t;
    if ((willPass(c, 0.02, 0.22) && !roll('tc' + Math.floor(t * 2), PLAN.missCut)) || t - mem.cutWait > PLAN.cutWait) { out.atk = P.atk < 0; out.up = true; out.why = 'cut the torn comb' + (t - mem.cutWait > PLAN.cutWait ? ': a step out of the honey' : ': she comes under'); return out; }
    if (inReach() && e.mode === 'circle') { swing(); out.why = 'a cut as she passes'; return out; }
    out.why = 'under the torn comb: wait for her pass'; return out; }
  /* G. SMOKE for the no-shield heroes: a pot from the stand under a wall perch */
  if (!s.shield && (e.smokeCd || 0) <= 0 && s.stands && s.stands.length) { const sd = s.stands.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    out.gx = sd.x; if (P.ground && P.y < sd.y - 10 && Math.abs(sd.x - P.x) < 30) { out.drop = true; out.why = 'down to the pot'; return out; }
    if (Math.abs(sd.x - P.x) < 8 && P.ground && Math.abs(sd.y - P.y) < 10) out.talk = true; out.why = 'take a smoke pot'; return out; }
  /* H. under her low pass on comb: cut her as she passes */
  if (inReach()) { swing(); out.gx = P.x; out.why = 'a cut as she passes'; return out; }
  if (nearFoot && !onFoot) return onTo(nearFoot, 'onto comb, out of the honey');
  out.gx = P.x; out.why = 'on comb: wait for her pass'; void miss; return out;
}
