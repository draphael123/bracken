// src/tide-kit.js — THE TIDE KIT (claude/waterkit, 11-05; scratch/plan-water-1105.md section 3a). ONE ENGINE FOR EVERY SEA LEVEL'S WATER LINE.
// Today each sea level rolls its own tide (Saltreach's streetTide cosine, the Causeway's CT machine, the Herald's arena tideY, the Tollmaster's rising
// square). This is the one they all become: a level DECLARES its tide in a few lines and the kit runs the cycle, TELLS every turn before it comes
// (rule C4: a sound, a foam line, the gauge), floods what it floods, floats what floats, wakes and buries what lives by it, and hands the player the
// verbs (BELL calls it in early, SLUICE holds it out, LEVER floods or drains one chamber).
// Pure: no DOM, no main.js. main.js hands in poolLevel and reads events for the SFX/foam; docs/waterkit.md is the level API; tools/tide-kit.mjs proves it.
//
//   L.tides = [{ id: 'saltreach', pools: ['harbour'],              pools it drives (by pool.id; or pool.tide === id)
//                lo: 40, hi: 31,                                    the water line at LOW and at HIGH, in TILE rows (hi < lo: y grows down)
//                cycle: { low: 9, warn: 3, rise: 3, high: 7, turn: 2, fall: 3 },   seconds per phase (defaults below); warn and turn are THE TELLS
//                rate: 1,                                           per-act tempo: 1.25 = a quarter faster (Causeway 2's storm: 1 -> 1.35 -> 2)
//                first: 'low', mode: 'cycle' | 'manual',             manual = a CHAMBER: it only moves when a lever says (Keep 2 floodgates)
//                floods: [{ x0, y0, x1, y1, from: 0.5 }],           tile boxes that are UNDER WATER from k >= from (default: when the line covers them)
//                floats: [{ id, x0, x1, y, draft: 1, top: 28 }],     platforms that ride the surface: y = rest row on the bed, top = the highest row they reach
//                lifts:  [{ id, x0, x1, yLo, yHi }],                 platforms driven by k, not by the surface (a counterweight, a whale's rib)
//                bites:  [{ x0, y0, x1, y1, when: 'low'|'high', kind }],   hazards live only at one end (tide-pool crab flats, the high-water eel lane)
//                foes:   { crab: 'low', eel: 'swim', sailor: 'flee', bonegob: 'drown' },   how each foe kind lives by the tide (see foeTide)
//                verbs:  [{ t: 'bell'|'sluice'|'lever', x, y, hold: 6, chamber: 'id' }],   world props the player strikes
//                safe: 'low', grace: 6 }]                           a respawn puts this tide at `safe` with at least `grace` s before it turns
//
//   const kit = tideInit(L, { off })          build every tide's state (off = main.js marks: a lever thrown stays thrown through a death)
//   tideStep(kit, dt) -> events               [{ t: 'toll', id, n }, { t: 'phase', id, ph }, { t: 'turn', id }, { t: 'float', id, dy }] - the SFX/foam hooks
//   tideApply(kit, pools, poolLevel)          write each tide's line into its pools (main.js poolLevel: p.y, dry/depth/shallow)
//   tideStrike(kit, hb, bodies?) -> verb|null  a blow on a bell/sluice/lever prop (hb = the attack box {l,r,t,b}); any seat's blow counts
//   tideRespawn(kit)                          a death/checkpoint: every tide to its safe phase with grace, sluices released, chambers as their levers
//   gauge(kit, id)                            { k, ph, next, left, tell, held } - the one A3 water-line dial every level draws
//   lineY(kit, id) / kOf(kit, id)             the water line now (px) / 0 = low, 1 = high
//   flooded(kit, tx, ty)  bites(kit, tx, ty)  is this tile under the tide now / is a tide-bound hazard live here now
//   floatY(kit, id)  liftY(kit, id)           a float's / lift's top now (px); riders(bodies, dy, x0, x1, top) carries every seat standing on it (co-op safe)
//   foeTide(kit, e)                           { active, swim, flee, drown } for a foe kind by the tide's table
//   lintTide(L, o) -> [problems]              the static checks tools/tide-kit.mjs runs on every level that declares a tide
export const TS = 16;
export const TIDE = {
  cycle: { low: 9, warn: 3, rise: 3, high: 7, turn: 2, fall: 3 },
  next: { low: 'warn', warn: 'rise', rise: 'high', high: 'turn', turn: 'fall', fall: 'low' },
  tolls: 3,            /* the warn is three bell strokes, evenly; the turn is one */
  minTell: 1.5,        /* no tell shorter than this at any rate (C4: you hear it before it has you) */
  bellWarn: 2,         /* a struck BELL at low water: the tide comes NOW, but still through a (shortened) told warn - never untold */
  sluiceHold: 6,       /* a struck SLUICE holds the water out this long (or `hold` on the verb) */
  grace: 6,            /* a respawn has at least this long before the tide moves */
};
const phases = ['low', 'warn', 'rise', 'high', 'turn', 'fall'];
const ease = f => { const x = Math.max(0, Math.min(1, f)); return x * x * (3 - 2 * x); };   /* slow, then all at once, then slow (the Causeway's curve) */
const dur = (T, ph) => { const d = (T.cycle[ph] ?? TIDE.cycle[ph]) / (T.rate || 1); return ph === 'warn' || ph === 'turn' ? Math.max(TIDE.minTell, d) : d; };
const kIn = (ph, t, d) => ph === 'rise' ? ease(1 - t / d) : ph === 'fall' ? ease(t / d) : ph === 'high' || ph === 'turn' ? 1 : 0;
const verbKey = (T, v) => 'tide:' + T.id + ':' + v.t + ':' + v.x + ',' + v.y;

export function tideInit(L, { off } = {}) {
  const kit = { tides: [], L };
  for (const T of L.tides || []) {
    const S = { T, id: T.id, ph: T.first || 'low', t: 0, k: 0, toll: 0, hold: 0, floatY: {}, verbs: [] };
    S.t = T.mode === 'manual' ? Infinity : (T.firstT ?? dur(T, S.ph));
    for (const v of T.verbs || []) S.verbs.push({ ...v, swing: 0, cool: 0, thrown: !!(off && off.has(verbKey(T, v))) });
    if (T.mode === 'manual' && S.verbs.some(v => v.t === 'lever' && v.thrown)) { S.ph = T.flip === 'drain' ? 'low' : 'high'; S.k = S.ph === 'high' ? 1 : 0; }
    for (const f of T.floats || []) S.floatY[f.id] = restY(S, f);
    kit.tides.push(S);
  }
  return kit;
}
const byId = (kit, id) => id === undefined ? kit.tides[0] : kit.tides.find(s => s.id === id);
export const kOf = (kit, id) => (byId(kit, id) || { k: 0 }).k;
export function lineY(kit, id) { const S = byId(kit, id); if (!S) return Infinity; const { lo, hi } = S.T; return (lo + (hi - lo) * S.k) * TS; }
function restY(S, f) {   /* a float sits on the water (its draft under the line), never below its rest row, never above its top */
  const ride = (S.T.lo + (S.T.hi - S.T.lo) * S.k) * TS - (f.free ?? 4);   /* its deck stands f.free px (default 4) proud of the water */
  return Math.max((f.top ?? S.T.hi - 1) * TS, Math.min(f.y * TS, ride));
}

export function tideStep(kit, dt) {
  const ev = [];
  for (const S of kit.tides) {
    const T = S.T;
    for (const v of S.verbs) { v.swing = Math.max(0, v.swing - dt * 1.5); v.cool = Math.max(0, v.cool - dt); }
    if (T.mode !== 'manual') {
      if (S.hold > 0) {   /* THE SLUICE HOLDS IT: a rising or high tide is turned back and kept out; the timer only runs while it holds */
        S.hold = Math.max(0, S.hold - dt);
        if (S.ph === 'warn' || S.ph === 'rise' || S.ph === 'high') { const k0 = S.k;
          if (k0 <= 0.001) { S.ph = 'low'; S.t = dur(T, 'low'); } else { S.ph = 'fall'; S.t = dur(T, 'fall') * invEase(k0); }
          ev.push({ t: 'phase', id: S.id, ph: S.ph, by: 'sluice' }); }
        if (S.hold === 0) ev.push({ t: 'released', id: S.id });
      }
      if (!(S.hold > 0 && S.ph === 'low')) S.t -= dt;   /* low water stays low while the sluice holds */
      while (S.t <= 0) {
        const nx = TIDE.next[S.ph]; S.ph = nx; S.t += dur(T, nx); S.toll = 0; S.wd = dur(T, nx);
        ev.push({ t: 'phase', id: S.id, ph: nx }); if (nx === 'turn' || nx === 'warn') ev.push({ t: 'turn', id: S.id, to: nx === 'warn' ? 'in' : 'out' });
      }
      if (S.ph === 'warn') { const d = S.wd || dur(T, 'warn'), n = Math.min(TIDE.tolls, 1 + Math.floor((d - S.t) / (d / TIDE.tolls))); if (n > S.toll) { S.toll = n; ev.push({ t: 'toll', id: S.id, n }); for (const v of S.verbs) if (v.t === 'bell') v.swing = 1; } }
      if (S.ph === 'turn' && !S.toll) { S.toll = 1; ev.push({ t: 'toll', id: S.id, n: 1, turn: true }); }
      S.k = kIn(S.ph, S.t, S.ph === 'warn' ? S.wd || dur(T, 'warn') : dur(T, S.ph));
    } else {   /* A CHAMBER: it fills or drains at its own rate toward what its lever says, and that is the whole of its cycle */
      const want = S.ph === 'high' ? 1 : 0, sp = 1 / Math.max(0.5, (T.cycle && T.cycle.rise || 3) / (T.rate || 1));
      const k0 = S.k; S.k = want > S.k ? Math.min(want, S.k + sp * dt) : Math.max(want, S.k - sp * dt);
      if (k0 !== S.k && (S.k === 0 || S.k === 1)) ev.push({ t: 'phase', id: S.id, ph: S.k === 1 ? 'high' : 'low' });
    }
    for (const f of T.floats || []) { const y0 = S.floatY[f.id], y1 = restY(S, f); S.floatY[f.id] = y1; if (y1 !== y0) ev.push({ t: 'float', id: f.id, dy: y1 - y0 }); }
  }
  return ev;
}
const invEase = k => { let a = 0, b = 1; for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (ease(m) < k) a = m; else b = m; } return (a + b) / 2; };

export function tideApply(kit, pools, poolLevel) {
  for (const S of kit.tides) { const y = lineY(kit, S.id), ids = S.T.pools || [];
    for (const p of pools || []) if (p.tide === S.id || (p.id !== undefined && ids.includes(p.id))) { poolLevel(p, y); p.flow = S.ph === 'rise' ? -24 : S.ph === 'fall' ? 24 : 0; p.tideKit = S.id; } }
}

/* A BLOW ON A VERB. Any seat's attack box: the kit is world state, so co-op partners share one bell. Returns the verb struck, or null. */
export function tideStrike(kit, hb) {
  if (!hb) return null;
  for (const S of kit.tides) for (const v of S.verbs) {
    if (v.cool > 0) continue; const x = v.x * TS + 8, y = (v.y + 1) * TS;
    if (!(hb.l < x + 11 && hb.r > x - 11 && hb.t < y - 4 && hb.b > y - 30)) continue;
    v.swing = 1; v.cool = v.t === 'lever' ? 0.6 : v.t === 'bell' ? 4 : 1.2;
    if (v.t === 'bell' && S.T.mode !== 'manual') {   /* CALL IT IN: at low water the warn starts now (short, still three strokes); later in the cycle it is only a bell */
      if (S.ph === 'low') { S.ph = 'warn'; S.t = Math.max(TIDE.minTell, Math.min(TIDE.bellWarn, dur(S.T, 'warn'))); S.toll = 0; S.wd = S.t; S.hold = 0; }
    } else if (v.t === 'sluice' && S.T.mode !== 'manual') { S.hold = v.hold ?? TIDE.sluiceHold; }
    else if (v.t === 'lever') { v.thrown = !v.thrown; if (S.T.mode === 'manual') S.ph = (S.ph === 'high') ? 'low' : 'high'; }
    return { ...v, tide: S.id, key: verbKey(S.T, v) };
  }
  return null;
}

/* A DEATH. Every cycling tide back to its safe phase with at least `grace` before it moves; held sluices let go; chambers keep their lever (it is a mark). */
export function tideRespawn(kit) {
  for (const S of kit.tides) {
    const T = S.T; S.hold = 0; S.toll = 0;
    if (T.mode === 'manual') { S.k = S.ph === 'high' ? 1 : 0; continue; }
    S.ph = T.safe || 'low'; S.t = Math.max(T.grace ?? TIDE.grace, dur(T, S.ph)); S.k = kIn(S.ph, S.t, dur(T, S.ph)); if (S.ph === 'high') S.k = 1;
    for (const f of T.floats || []) S.floatY[f.id] = restY(S, f);
  }
}

export function gauge(kit, id) {
  const S = byId(kit, id); if (!S) return null;
  const tell = S.ph === 'warn' || S.ph === 'turn';
  return { k: S.k, ph: S.ph, next: TIDE.next[S.ph], left: S.t, tell, held: S.hold > 0, holdLeft: S.hold, coming: S.ph === 'warn' ? 'in' : S.ph === 'turn' ? 'out' : null };
}

/* the tile under the tide now: inside a declared flood box and below the line (or past the box's own `from`) */
export function flooded(kit, tx, ty) {
  for (const S of kit.tides) { const ly = (S.T.lo + (S.T.hi - S.T.lo) * S.k);
    for (const b of S.T.floods || []) if (tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1) { if (b.from !== undefined ? S.k >= b.from : ty + 1 > ly) return S.id; } }
  return null;
}
export function bites(kit, tx, ty) {
  for (const S of kit.tides) for (const b of S.T.bites || []) {
    if (tx < b.x0 || tx > b.x1 || ty < b.y0 || ty > b.y1) continue;
    if (b.when === 'low' ? S.k <= (b.at ?? 0.15) : S.k >= (b.at ?? 0.85)) return b;
  }
  return null;
}
export const floatY = (kit, id) => { for (const S of kit.tides) if (id in S.floatY) return S.floatY[id]; return null; };
export function liftY(kit, id) { for (const S of kit.tides) for (const f of S.T.lifts || []) if (f.id === id) return (f.yLo + (f.yHi - f.yLo) * S.k) * TS; return null; }
/* EVERY SEAT ON IT RIDES IT: bodies = [P, P2, ...]; a body stands on it if its feet are on the top (within 3 px) and over its span. Returns who moved */
export function riders(bodies, dy, x0, x1, top) {   /* x0, x1, top in px; top = its top NOW (after the move) */
  const out = []; if (!dy) return out;
  for (const b of bodies || []) { if (!b || b.dead) continue;
    if (b.x >= x0 && b.x <= x1 && Math.abs(b.y - (top - dy)) <= 3 && !(b.vy < -20)) { b.y += dy; out.push(b); } }
  return out;
}
/* HOW A FOE LIVES BY THE TIDE. table: 'low' = only out at low water (buried/hidden otherwise), 'high' = only in high water,
   'swim' = rides the water line (stays in it, never stranded: it follows the line down), 'flee' = a land foe that climbs away
   from a rising tide (to its `home` row) instead of drowning, 'drown' = the land-foes-drown rule: it dies in the water. */
export function foeTide(kit, e, tideId) {
  const S = byId(kit, tideId ?? (e.tide || undefined)) || kit.tides[0]; if (!S) return { active: true };
  const how = (S.T.foes || {})[e.t] || e.tideHow || null, k = S.k, rising = S.ph === 'warn' || S.ph === 'rise';
  if (how === 'low') return { active: k <= 0.2, buried: k > 0.2, how };
  if (how === 'high') return { active: k >= 0.8, how };
  if (how === 'swim') return { active: true, swim: true, lineY: lineY(kit, S.id), how };
  if (how === 'flee') return { active: true, flee: rising || k > 0.5, how };
  if (how === 'drown') return { active: true, drown: e.y !== undefined && e.y > lineY(kit, S.id) + 8, how };
  return { active: true };
}

/* THE STATIC CHECKS (tools/tide-kit.mjs runs these on every level with L.tides, and the lab room):
   tells long enough at its rate; lo below hi; each pool it names exists; each float/lift has a range; each checkpoint in its flood boxes is either dry
   at high water, or its respawn grace is long enough to walk out (o.run px/s, o.dryX = tile column of the nearest dry ground from that checkpoint);
   each verb is not under water at the end it is needed (a sluice / bell stands above high water, a chamber lever can be reached either way: above
   the high line or flagged swim: true); a manual chamber has a lever. */
export function lintTide(L, o = {}) {
  const bad = [], run = o.run || 96;
  for (const T of L.tides || []) {
    const id = T.id || '?';
    if (!(T.hi < T.lo)) bad.push(id + ': hi (' + T.hi + ') must be above lo (' + T.lo + ')');
    if (T.mode !== 'manual') for (const ph of ['warn', 'turn']) { const raw = ((T.cycle || {})[ph] ?? TIDE.cycle[ph]) / (T.rate || 1); if (raw < TIDE.minTell) bad.push(id + ': the ' + ph + ' tell is shorter than ' + TIDE.minTell + ' s (' + raw.toFixed(2) + '; the kit stretches it, declare it)'); }
    if (T.mode !== 'manual' && (T.rate || 1) > 2.5) bad.push(id + ': rate ' + T.rate + ' is past the readable cap 2.5');
    for (const pid of T.pools || []) if (!(L.pools || []).some(p => p.id === pid)) bad.push(id + ': pool ' + pid + ' is not in L.pools');
    for (const f of T.floats || []) if (!(f.top < f.y)) bad.push(id + ': float ' + f.id + ' has no range (top ' + f.top + ', rest ' + f.y + ')');
    for (const f of T.lifts || []) if (f.yLo === f.yHi) bad.push(id + ': lift ' + f.id + ' does not move');
    for (const v of T.verbs || []) {
      if ((v.t === 'bell' || v.t === 'sluice') && v.y + 1 > T.hi && !v.swim) bad.push(id + ': the ' + v.t + ' at ' + v.x + ',' + v.y + ' drowns at high water');
      if (v.t === 'lever' && T.mode === 'manual' && v.y + 1 > T.hi && !v.swim) bad.push(id + ': the chamber lever at ' + v.x + ',' + v.y + ' is under a full chamber (flag swim: true if it is meant to be reached swimming)');
    }
    if (T.mode === 'manual' && !(T.verbs || []).some(v => v.t === 'lever')) bad.push(id + ': a manual chamber with no lever never moves');
    const grace = Math.max(T.grace ?? TIDE.grace, dur(T, T.safe || 'low'));
    for (const c of L.checkpoints || []) {
      const inBox = (T.floods || []).some(b => c.x >= b.x0 && c.x <= b.x1 && c.y >= b.y0 && c.y <= b.y1);
      if (!inBox || c.y + 1 <= T.hi) continue;
      const dry = c.dryX ?? o.dryX; if (dry === undefined) { bad.push(id + ': checkpoint ' + c.x + ',' + c.y + ' floods at high water and names no dry ground (dryX)'); continue; }
      const t = Math.abs(dry - c.x) * TS / run; if ((T.safe || 'low') !== 'low' || t > grace + dur(T, 'warn')) bad.push(id + ': checkpoint ' + c.x + ',' + c.y + ' needs ' + t.toFixed(1) + ' s to dry ground, respawn gives ' + (grace + dur(T, 'warn')).toFixed(1));
    }
  }
  return bad;
}
export const tidePhases = phases;
