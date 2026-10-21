/* src/frog-king.js - THE BULLFROG KING: THE PAD CHASE (claude/frogking2; scratch/brief-playtest-1021b.md item 2, Daniel 10-21: "FROG KING doesn't use the
   level's mechanics -> rework: he is (almost) always vulnerable but you must CROSS PADS to reach him - a longer pad section, sinking/holding pads, he sits
   on a big pad/platform you can hit, then LEAPS away to another and it repeats").
   B1, THE RULE IS THE OPENING: the marsh's rule is PADS SINK. His court is open biting water with three ROYAL PADS standing out of it (src/frog-court.js)
   and lanes of lily pads between them - the yellow ones sink under you, the cool green ones hold. He sits on a royal pad and there he is HITTABLE: no
   hide, no shell (B13: no waiting room). Reaching him IS the fight. Take a share of him (FK.quota) - or stand on his pad long enough (FK.stay) - and he
   LEAPS to another royal pad (on along the court, then back): the lanes RESHUFFLE as he lands, and you cross again.
     PHASE 1  THE COURT      (100% -> 50%)  his tongue, his spit, his belly-flop, his flies, his leap
     PHASE 2  HIS POND STIRS  (50% -> 0)    one great croak on the throne bank: the yellow pads sink 1.6x faster and fewer pads hold; his tongue reaches
                                            further, his spit comes twice, and he is restless (a shorter stay)
   HIS MOVES, each told, each its own windup + release pose (src/redraw/frogking.js, B16), each with its answer (B10, B14, B15, B17 four+):
     THE TONGUE LASH   tongueTell (yellow !) - out it comes at the height you stood at: SHIELD it (he bites his tongue: DAZED) or JUMP it. Taken, it GRABS:
                       on his pad it reels you to his feet; anywhere else it drops you IN THE WATER (the marsh's hurting water: a quarter of you, back to
                       the last footing you stood on)
     THE SPIT          spitTell (yellow !) - his cheeks fill; three globs lobbed onto the spot you stand on (twice in phase 2): a shield turns venom, or move
     THE BELLY-FLOP    flopTell (red !!) - he rears up and comes down flat: a SHOCKWAVE runs out both ways, over the water too. Jump it: on a bank or a
                       royal pad it hurts; on a lily pad it SINKS THE PAD under you. Then he lies WINDED a moment (x1.5): the reward for being there
     THE FLY SWARM     swarmTell (quiet: the flies throw nothing) - a cloud trails you; his tongue snaps at it (snapTell, yellow !). Lead them onto his
                       head (stand at his mouth on his pad as the tongue comes) and he BITES HIMSELF: DAZED (x2)
     THE LEAP          crouch (yellow !) - he squats, and bounds to another royal pad (a long told arc: leave the spot he comes down on, or shield the
                       landing: TURNED, DAZED). He lands with a shockwave and the lanes RESHUFFLE: every leaf nobody stands on goes under and comes up
                       somewhere else (firm or sinking anew)
   His openings: DAZED x2 (a bitten tongue, the flies, a turned landing), WINDED x1.5 (after the flop); one opening pays at most FK.take of him, the rest
   at 1x. In the air (mid-leap) a blow takes 0.4x (B15, 'IN THE AIR'). Numbers here; the machine is updateFrog in src/main.js. */
import * as M2A from './redraw/marsh2_art.js';

export const FK = {
  hp: 640,
  p2At: 0.5,                       /* HIS POND STIRS */
  drainAt: -1,                     /* (claude/firsthour's plug drain is retired: the court is open water from the start) */
  quota: [0.25, 0.25],             /* the share of him one royal pad is worth before he leaps on, per phase */
  stay: [15, 12],                  /* or this long with you on his pad */
  take: 0.08,                      /* one opening is worth at most this share of him, then he shakes it off */
  dazed: 2, winded: 1.5, air: 0.4, throat: 1.5,
  tongue: { tell: [0.6, 0.5], live: 0.55, max: [175, 210], reel: 330, reelMax: 0.6, dmg: 16 },
  spit: { tell: [0.55, 0.45], shots: [1, 2], flight: 0.8, spread: 18 },
  flop: { tell: 0.8, air: 0.5, rest: 1.6, sp: 170, life: 2.4, dmg: 18, dunk: 0.6 },
  swarm: { tell: 0.6, spit: 0.35, life: 3.2, lag: 0.5, orbit: 13, snapTell: 0.85, snapLive: 0.45, reach: 240, bite: 34, open: 2.4 },
  leap: { tell: [0.65, 0.5], air: 1.2, under: 0.9 },
  sink: [1, 1.6],                  /* the sinking pads' pace, per phase */
  firm: [2, 1],                    /* leaves in a lane that HOLD after a reshuffle, per phase (of four) */
  gap: [1.0, 0.8],                 /* his rest between blows, per phase */
  ripple: { open: 2.4 },           /* (kept for frogFlat) */
  pound: { sink: 1.5 },
};

/* the court's pads: the movers of kind 'pad' inside the arena */
export const courtPads = (movers, A) => movers.filter(m => m.kind === 'pad' && m.x + m.w / 2 > A.x0 && m.x + m.w / 2 < A.x1);
/* which royal pad (station) a point is on, or -1 */
export const stationAt = (A, x) => (A && A.royal ? A.royal.findIndex(r => x >= r.x0 - 2 && x <= r.x1 + 2) : -1);
/* the next royal pad he leaps for: on along the court, and back */
export function nextStation(e, n) { let d = e.stDir || 1; if (e.st + d < 0 || e.st + d >= n) d = -d; e.stDir = d; return e.st + d; }

/* THE COURT'S OWN STATE: the swarm, the lanes' reshuffle. One per level load. */
export function makeFrogCourt(ctx) {
  const S = { swarm: null, ripples: [], hist: [], fling: null, reel: null, sinkK: 1, n: { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0, reshuffles: 0, leaps: 0, padSunk: 0 } };
  const P = () => ctx.P(), R = Math.round;
  S.reset = () => { S.swarm = null; S.ripples = []; S.hist = []; S.fling = null; S.reel = null; S.sinkK = 1; S.n = { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0, reshuffles: 0, leaps: 0, padSunk: 0 }; };
  const pads = () => { const A = ctx.arena(); return A ? courtPads(ctx.movers(), A).filter(m => m.frogLane !== undefined || A.frogChase) : []; };
  /* the flies: a cloud that trails the hero by FK.swarm.lag s (the history of where he stood) */
  S.spitSwarm = e => { const p = P(); S.swarm = { x: e.x + e.face * 20, y: e.y - 18, t: FK.swarm.life, eaten: false, ph: 0 }; S.hist = [{ x: p.x, y: p.y - 12, t: 0 }]; };
  S.step = (dt, e) => {
    const p = P(), now = ctx.time();
    S.hist.push({ x: p.x, y: p.y - 12, t: now }); while (S.hist.length > 2 && now - S.hist[1].t > FK.swarm.lag) S.hist.shift();
    if (S.swarm) { const sw = S.swarm, h = S.hist[0]; sw.ph += dt * 9; sw.t -= dt;
      const k = Math.min(1, dt * 5); sw.x += (h.x - sw.x) * k; sw.y += (h.y - sw.y) * k;
      if (Math.random() < dt * 6) ctx.buzz(); if (sw.t < -2.5 || !e || !e.alive) S.swarm = null; }
    /* THE RESHUFFLE: a leaf that went under comes up again in its new place, with its new kind */
    for (const m of pads()) { m.sinkK = S.sinkK; if (m.rockT > 0) m.rockT -= dt; if (m.slapT > 0) { m.slapT -= dt; m.sink = 1; }
      if (m.shufTo && m.sink >= 0.99) { m.x = m.x0 = m.shufTo.x; m.firm = m.shufTo.firm; m.shufTo = null; } }
  };
  /* every lane leaf nobody stands on goes under (FK.leap.under s) and comes up somewhere else in its lane, firm or sinking anew */
  S.reshuffle = (ph, rng = Math.random) => { const A = ctx.arena(); if (!A || !A.lanes) return 0; let n = 0; const riders = ctx.riders ? ctx.riders() : [P().onMover], heroes = ctx.heroes ? ctx.heroes() : [P()];
    for (const lane of A.lanes) { if (heroes.some(h => !h.dead && h.x > lane.x0 - 8 && h.x < lane.x1 + 8)) continue;   /* a lane a hero is crossing keeps its leaves: a reshuffle never pulls them from under a jump */ const ls = pads().filter(m => m.x + m.w / 2 > lane.x0 && m.x + m.w / 2 < lane.x1).sort((a, b) => a.x - b.x); if (!ls.length) continue;
      const hold = new Set(); while (hold.size < Math.min(FK.firm[ph] || 1, ls.length)) hold.add((rng() * ls.length) | 0);
      ls.forEach((m, k) => { if (riders.includes(m)) return; const slot = lane.x0 + (lane.x1 - lane.x0) * (k + 0.5) / ls.length - m.w / 2, jig = Math.round((rng() - 0.5) * 12);
        m.slapT = FK.leap.under; m.shufTo = { x: Math.max(lane.x0 + 10, Math.min(lane.x1 - 10 - m.w, Math.round(slot + jig))), firm: hold.has(k) }; n++; }); }
    S.n.reshuffles++; return n; };
  S.stir = ph => { S.sinkK = FK.sink[ph] || 1; return S.reshuffle(ph); };
  /* the flop's wave over the water: a leaf it passes rocks; under a hero standing on it, it goes under */
  S.waveOver = (w, dt) => { for (const m of pads()) { const c = m.x + m.w / 2; if (Math.abs(c - w.x) < m.w / 2 + 2) { if (!(m.rockT > 0)) m.rockT = 0.35;
      const p = P(); if (w.flop && p.onMover === m && p.ground && !p.dead && !(m.slapT > 0)) { m.slapT = FK.flop.dunk; S.n.padSunk++; ctx.number(p.x, p.y - 26, 'THE WAVE SINKS YOUR PAD', '#bfe6f5'); ctx.splash && ctx.splash(); } } } };
  S.ripple = () => {}; S.slap = () => { for (const m of pads()) { m.slapT = FK.pound.sink; } };
  S.throwOff = () => {};   /* (the croak ripple's throw is retired with his shallow pond) */
  S.show = () => ({ swarm: S.swarm ? { x: S.swarm.x, y: S.swarm.y, t: S.swarm.t } : null, ripples: [], fling: false, reel: !!S.reel, n: S.n, sinkK: S.sinkK });
  S.draw = (g, cx, cy, time) => { if (S.swarm) M2A.swarm(g, S.swarm, cx, cy, time, FK.swarm.orbit); };
  return S;
}

/* ---------- THE BOT'S HANDS (src/lab.js): what a player sees of him, a reaction late ---------- */
export const PLAN = { react: 0.25, miss: 0.12, missLead: 0.35 };
/* footing: the royal pads and banks (solid), the leaves that are up */
function footings(F) {
  const out = (F.royal || []).map((r, i) => ({ x0: r.x0, x1: r.x1, solid: true, st: i }));
  if (F.bank) out.push({ x0: F.bank[0], x1: F.bank[1], solid: true, st: -1 });
  for (const q of F.pads || []) if (q.sink < 0.3 && !q.slap && !q.shuf) out.push({ x0: q.x - q.w / 2, x1: q.x + q.w / 2, pad: true, firm: q.firm, sink: q.sink, m: q.id });
  return out.sort((a, b) => a.x0 - b.x0);
}
export function frogPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0; mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 400) { mem.seen.clear(); mem.roll.clear(); }
  const react = s.eyes ? 0 : PLAN.react, miss = s.eyes ? 0 : PLAN.miss;
  const key = e.mode + ':' + (e.actN || 0), seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const A = F.A, m = e.mode, side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  const royal = F.royal || [], his = royal[e.tst !== undefined && (m === 'leap' || m === 'crouch') ? e.tst : e.st] || royal[0];
  const onSt = i => i >= 0 && royal[i] && P.x >= royal[i].x0 + 2 && P.x <= royal[i].x1 - 2 && P.y <= royal[i].top + 3;
  const myFoot = () => { if (!P.ground) return null; const fs = footings(F); return fs.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3 && (f.solid ? P.y <= (royal[0] ? royal[0].top + 3 : 1e9) : true)) || null; };
  const open = e.mode === 'dazed' || e.mode === 'flopRest' || e.mode === 'croak';
  out.face = toHim;
  if (F.reel) { out.why = 'reeled in'; return out; }
  /* IN THE WATER (the marsh's drain): to the nearest footing that holds - a leaf that is up or a royal pad - and out onto it */
  if (P.swim) { mem.land = null; const fs = footings(F).filter(f => !f.pad || f.sink < 0.2); const c = fs.sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - P.x) - Math.abs((b.x0 + b.x1) / 2 - P.x))[0];
    const tx = c ? Math.max(c.x0 + 6, Math.min(c.x1 - 6, P.x)) : P.x; out.gx = tx; out.up = true; out.jump = Math.abs(tx - P.x) < 20; out.why = 'out of the water'; return out; }
  /* a shockwave coming along at me: jump it (on a leaf it sinks the leaf) */
  const lowNear = (F.waves || []).some(w => (P.x - w.x) * w.dir > -4 && (P.x - w.x) * w.dir < (P.onPad ? 34 : 30));
  if (lowNear && P.ground) { out.jump = true; out.why = 'jump the wave'; out.gx = P.x; return out; }
  const stHis = royal.indexOf(his), there = onSt(stHis) && m !== 'leap' && m !== 'crouch';
  /* HIS TELLS, read a reaction late (some misread) */
  if (/Tell$|^crouch$/.test(m) && seen() && !roll(key, miss)) {
    const leading = !!F.swarm && !roll('lead' + (e.actN || 0), PLAN.missLead);
    if (m === 'snapTell' && there && leading && Math.abs(P.x - (e.x + (e.face || 1) * 18)) < 30) { out.gx = e.x + (e.face || 1) * 18; out.why = 'hold the flies on his head'; return out; }
    if ((m === 'tongueTell' || m === 'snapTell') && ad < (m === 'snapTell' ? 260 : (F.tongueMax || 175) + 30)) { if (s.shield) { out.block = true; out.why = 'shield the tongue'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the tongue'; return out; } if (s.deflect && e.modeT < 0.3) { out.block = true; out.face = toHim; out.why = 'deflect the tongue on the beat'; return out; } out.jump = P.ground && e.modeT < 0.2; out.gx = P.x; out.why = 'jump the tongue'; return out; }
    if (m === 'spitTell' && ad < 330) { if (s.shield) { out.block = true; out.why = 'shield the spit'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the spit'; return out; } }
    if (m === 'flopTell' && there && ad < 60) { out.gx = e.x + side * 70; out.why = 'clear of the flop'; return out; }
    if (m === 'crouch' && e.tst !== undefined && onSt(e.tst)) { const r = royal[e.tst]; out.gx = Math.abs(P.x - r.x0) > Math.abs(P.x - r.x1) ? r.x0 + 10 : r.x1 - 10; out.why = 'off the spot he leaps for'; return out; } }
  if (m === 'leap' && e.vy > 0 && Math.abs(e.x - P.x) < 50 && P.ground && onSt(stationAt(A, e.x))) { if (s.shield) { out.block = true; out.why = 'shield the landing'; return out; } out.gx = P.x + side * 60; out.why = 'out from under him'; return out; }
  if ((m === 'tongue' || m === 'snap' || m === 'spit') && s.shield && ad < 330) { out.block = true; out.why = 'hold the shield'; return out; }
  if ((m === 'tongue' || m === 'snap' || m === 'spit') && s.ward && ad < 330) { out.ward = true; out.gx = P.x; out.why = 'hold the ward'; return out; }
  /* ON HIS PAD: the fight */
  if (there) {
    if (F.swarm && m !== 'flopTell' && m !== 'flop' && !open && !roll('lead' + (e.actN || 0), PLAN.missLead)) { out.gx = e.x + (e.face || 1) * 18; out.why = 'lead the flies onto him'; return out; }
    if (m === 'flop' && ad < 60) { out.gx = e.x + side * 70; out.why = 'clear of the flop'; return out; }
    if (s.rest && !open) { out.gx = e.x + side * 60; out.why = 'catch my breath'; return out; }
    const stand = s.tip ? 20 + s.tip : Math.max(12, (open ? reach * 0.6 : reach - 4)); let gx = e.x - toHim * stand;
    gx = Math.max(his.x0 + 6, Math.min(his.x1 - 6, gx)); if (Math.abs(gx - e.x) < 10) gx = e.x + side * stand;
    out.gx = gx; out.atk = ad < reach + 14 && P.atk < 0 && !F.greedNear && m !== 'flopTell' && m !== 'leap' && m !== 'crouch';
    out.why = open ? 'cut him: ' + m : 'cut him on his pad'; return out; }
  /* CROSSING: leaf to leaf to his pad */
  const goal = his ? (his.x0 + his.x1) / 2 : e.x, dir = Math.sign(goal - P.x) || 1;
  if (!P.ground) { if (mem.land) out.gx = (mem.land.x0 + mem.land.x1) / 2; else out.gx = goal; out.why = 'in the air'; return out; }
  /* he is gathering to leap or in the air: wait where you stand (the lanes reshuffle as he lands) */
  if ((m === 'crouch' || m === 'leap') && !onSt(e.tst)) { const fs0 = footings(F), c0 = fs0.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3); if (c0 && (!c0.pad || c0.firm)) { out.gx = Math.max(c0.x0 + 8, Math.min(c0.x1 - 8, P.x)); out.why = 'wait for him to land'; return out; } }
  const fs = footings(F), cur = fs.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3) || null;
  if (!cur) { out.gx = goal; out.why = 'cross'; return out; }
  const far = dir > 0 ? cur.x1 : cur.x0, ahead = fs.filter(f => f !== cur && (dir > 0 ? f.x0 > cur.x1 - 2 : f.x1 < cur.x0 + 2)).sort((a, b) => dir > 0 ? a.x0 - b.x0 : b.x1 - a.x1);
  const next = ahead[0], gap = next ? (dir > 0 ? next.x0 - cur.x1 : cur.x0 - next.x1) : 1e9;
  /* a leaf is under (the reshuffle): wait on footing that holds; on a sinking leaf, go on or back */
  if (!next || gap > 62) { const back = fs.filter(f => f !== cur && (dir > 0 ? f.x1 < cur.x0 + 2 : f.x0 > cur.x1 - 2)).sort((a, b) => dir > 0 ? b.x1 - a.x1 : a.x0 - b.x0)[0];
    if (cur.pad && !cur.firm && back) { mem.land = back; out.gx = (back.x0 + back.x1) / 2; out.jump = true; out.why = 'back off a sinking leaf'; return out; }
    out.gx = (cur.x0 + cur.x1) / 2; out.why = 'wait for the leaves'; return out; }
  /* on footing that holds, a wave or his tongue coming: wait */
  if (!cur.pad || cur.firm) { if (m === 'flopTell' || (m === 'tongueTell' && ad < 240)) { out.gx = Math.max(cur.x0 + 6, Math.min(cur.x1 - 6, P.x)); out.why = 'wait on firm footing for his blow'; return out; } }
  const take = far - dir * (cur.pad ? 4 : 7);
  if (cur.pad || Math.abs(P.x - take) < 7 || (dir > 0 ? P.x > take : P.x < take)) { mem.land = next; out.gx = (next.x0 + next.x1) / 2; out.jump = true; out.why = next.pad ? (next.firm ? 'hop to a leaf that holds' : 'hop a sinking leaf') : 'hop onto the royal pad'; return out; }
  out.gx = take; out.why = 'to the edge'; return out;
}
