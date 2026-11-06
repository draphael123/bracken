// src/keep-floods.js - UNDERWATER KEEP 2: THE FLOODGATES (claude/keepfloods, OPUS greybox, 11-06; scratch/plan-water-1105.md item 8, brief-keep2.md).
// "FOLLOW THE AIR THROUGH THE FLOODED VAULTS." The Keep's whirlpools go (all four) and the level's verb becomes THE FLOODGATE: each chamber has a lever
// that FLOODS or DRAINS it. DRAINED = a hall you walk and breathe in, but the DROWNED KNIGHTS in their plate walk its floor and reach you; FLOODED = you swim
// over them (they are too heavy to rise) on borrowed air. A choice per chamber, never a soft-lock: both states pass (the doors are SUMPS under the walls, so a
// drained chamber still meets its flooded neighbours under water - no water wall anywhere). Teach (the Countercurrent), test (the Flooded Library's stack
// vault: the one air is under the hanging stack, at the knights' feet), remix (the Bell Approach: it starts DRY, the lever stands between two knights).
// THE THRONE: the Drowned King's room gets a floodgate of its own (two levers, one each side of his DECREE GATE) and a second tide for his cursed phase
// (src/drowned-king2.js is the fight, src/keep-floods-hands.js the world binding). Both are the WATER KIT's engine (src/tide-kit.js), declared here.
//
// THE FLAG: KF_SHIPS = false. OFF: src/keep-expansion.js never calls floodKeep - the keep is master's cell for cell (tools/keep-floods.mjs hashes it).
// ON (?kf=1 on the page, globalThis.BRACKEN_KF, or KF=1 in a Node tool's env): floodKeep rebuilds the three chambers and the throne's water in place.
// The tides are declared on L.kfTides, NOT L.tides: claude/water1's generic kit wiring (its pirate-fleet hands) runs every L.tides level, and the
// throne's water must answer the boss, so the keep runs its own tides through the same engine (tools/keep-floods.mjs lints them with lintTide).
export const KF_SHIPS = false;
export function kfOn() {
  if (KF_SHIPS) return true;
  try { if (globalThis.BRACKEN_KF === true || globalThis.BRACKEN_KF === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]kf=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.KF === '1') return true; } catch { /* no node */ }
  return false;
}
export const KF_RULE = 'FOLLOW THE AIR THROUGH THE FLOODED VAULTS.';

/* THE CHAMBERS, in the keep's tiles (after the crop: the approach is 0-559, the inner keep 560+). x0/x1 = the chamber's two walls (inclusive), top = its
   first air row under the ceiling, floor = the row its floor stands on (you walk on floor-1). start = how it is when you first come to it. The DOORS are
   SUMPS: rows sump[0]-58 under each wall (a short swim in either state), then a 4-wide shaft up through the floor beside it - the air halls' own way in
   (KEEP_HALLS), so the movement is the one every hero already routes. exitE/exitW = the neighbour rows the sump opens into, when the neighbour is narrower. */
export const KF_CHAMBERS = [
  { id: 'kf1', name: 'THE FIRST FLOODGATE', role: 'teach', x0: 101, x1: 121, top: 41, floor: 52, sump: 53, start: 'flooded', clearW: [98, 100, 46, 58],
    lever: [107, 51], knights: [[115, 51]], airs: [[110, 113, 41, 43]], room: 'keepCulvert',
    sign: [109, 51, 'A FLOODGATE. ITS LEVER DRAINS THE CHAMBER: DRY, YOU WALK AND BREATHE - AND THE KNIGHTS IN THEIR PLATE WALK TO YOU.'] },
  { id: 'kf2', name: 'THE STACK VAULT', role: 'test', x0: 146, x1: 181, top: 28, floor: 52, sump: 53, start: 'flooded',
    lever: [152, 51], knights: [[160, 51], [175, 51]], airs: [[167, 170, 47, 51]], stack: [167, 170, 28, 46], room: 'keepLibrary',
    sign: [151, 51, 'THE STACK VAULT. FLOODED, ITS ONE AIR IS UNDER THE HANGING STACK - AT THEIR FEET. DRAIN IT AND THEY COME FOR YOU.'] },
  { id: 'kf3', name: 'THE BELL APPROACH', role: 'remix', x0: 352, x1: 371, top: 26, floor: 50, sump: 51, start: 'drained', exitE: [51, 54],
    lever: [361, 49], knights: [[357, 49], [366, 49]], airs: [], room: 'keepChapel',
    sign: [354, 49, 'THE BELL APPROACH. DRY, HIS KNIGHTS HOLD THE FLOOR. THE LEVER BETWEEN THEM FLOODS IT: SWIM OVER THEM, ON WHAT AIR YOU HAVE.'] },
];
/* THE THRONE ROOM (the arena, cols 709-750 inside its walls 708/750). THE DECREE GATE stands in the column between his pillars and his dais; a floodgate
   lever each side of it, so a decree that cuts the room in two never leaves you without one. */
export const KF_THRONE = { x0: 709, x1: 750, top: 24, gateCol: 729, levers: [[711, 58], [747, 58]], rise: 2.2 };
/* THE CURSED KING'S TIDE (phase two): he calls it, told by the kit (3 tolls in, 1 out); LOW = he is beached (open), HIGH = he is home (x0.4) */
export const KF_CURSE = { low: 4.5, warn: 1.8, rise: 2, high: 7, turn: 1.6, fall: 2 };

const lev = (c) => [c.lever[0], c.lever[1]];
/* the chamber's tide, as the kit declares one (docs/waterkit.md): a MANUAL chamber that moves only by its lever. lo = the floor's top (drained: the sump
   water stands at the floor), hi = the ceiling row (flooded: the line is inside the stone, so no surface to breathe at). `flip` keeps the kit's lever mark
   honest: a thrown lever = the other state from the chamber's start. */
export function chamberTide(c) {
  const fl = c.start === 'flooded';
  return { id: c.id, mode: 'manual', lo: c.floor, hi: c.top - 1, cycle: { rise: 2.5 }, first: fl ? 'high' : 'low', flip: fl ? 'drain' : 'fill',
    floods: [{ x0: c.x0, y0: c.top, x1: c.x1, y1: 58 }], verbs: [{ t: 'lever', x: lev(c)[0], y: lev(c)[1], swim: true }], chamber: c.name };
}
export function throneTides() {
  const A = KF_THRONE;
  return [
    { id: 'throne', mode: 'manual', lo: 59, hi: A.top - 1, cycle: { rise: A.rise }, first: 'high', flip: 'drain', throne: true,
      floods: [{ x0: A.x0, y0: A.top, x1: A.x1, y1: 58 }], verbs: A.levers.map(([x, y]) => ({ t: 'lever', x, y, swim: true })) },
    { id: 'curse', lo: 59, hi: A.top - 1, cycle: { ...KF_CURSE }, first: 'high', safe: 'high', grace: KF_CURSE.high, throne: true,
      floods: [{ x0: A.x0, y0: A.top, x1: A.x1, y1: 58 }] },
  ];
}

/* ---------------- THE BUILD (called from expandKeep's tail when kfOn()) ---------------- */
export function floodKeep(K, T, TS) {
  const D = K.deep, set = (x, y, t) => { K.grid[y * K.W + x] = t; }, box = (a, b, c, d, t) => { for (let y = c; y <= d; y++) for (let x = a; x <= b; x++) set(x, y, t); };
  const inX = (x, a, b) => x >= a && x <= b, rectIn = (r, a, b) => r[0] <= b && r[1] >= a;
  /* 1. THE WHIRLPOOLS GO, all four (Daniel 10-08: "annoying, off-tone"). src/whirlpools.js stays on disk for its tool; nothing on the road declares one. */
  K.whirlpools = [];
  /* the exam's whirlpool had the hall's one pocket in its pull: the pocket stays (still the only air between the two shrines), the pull goes */
  for (const e of K.ents) if (e.t === 'sign' && e.x === 636) e.text = 'THE KING\'S DOOR. HIS CAPTAIN HOLDS IT. THE LAST AIR IS UNDER HIS NOSE.';
  /* 2. THE CHAMBERS */
  const keepT = new Set(['check', 'gate', 'drownedking', 'silver']);
  const tides = [];
  for (const c of KF_CHAMBERS) {
    const { x0, x1, top, floor, sump } = c, a = x0 - 2, b = x1 + 2;
    if (c.clearW) { const [q0, q1, q2, q3] = c.clearW; box(q0, q1, q2, q3, T.AIR); D.props = D.props.filter(p => !inX(p.x, q0, q1)); }   /* the coral that walled the old low road off from the gate */
    /* clear what stood there: the stacks, the coral, the whirl's sign, the coins over the old floor, the old knight, the grate, the clam, the pockets */
    K.ents = K.ents.filter(e => !inX(e.x, x0, x1) || keepT.has(e.t));
    K.airRooms = K.airRooms.filter(r => !rectIn(r, x0, x1)); D.pockets = D.pockets.filter(r => !rectIn(r, x0, x1));
    for (const k of ['vents', 'clams', 'kelp', 'props']) D[k] = (D[k] || []).filter(p => !inX(p.x, x0, x1));
    K.siphons = (K.siphons || []).filter(s => !inX(s.x, x0, x1)); K.gasVents = (K.gasVents || []).filter(v => !inX(v.x, x0, x1));
    K.keepLandmarks = (K.keepLandmarks || []).filter(m => !inX(m.x, x0, x1));
    D.currents = (D.currents || []).map(z => z.x1 < x0 - 3 || z.x0 > x1 + 3 ? z : z.x0 < x0 - 3 ? { ...z, x1: x0 - 4 } : null).filter(Boolean);   /* the countercurrent stops short of the gate */
    /* the stone, then the hall carved out of it (KEEP_HALLS' grammar) */
    box(x0, x1, 24, 58, T.SOLID);
    box(x0, x0 + 4, sump, 58, T.AIR); box(x0 + 1, x0 + 4, floor, 58, T.AIR);                 /* in: under the west wall, and up a shaft */
    box(x0 + 1, x1 - 1, top, floor - 1, T.AIR);                                              /* the chamber */
    box(x1 - 4, x1 - 1, floor, 58, T.AIR); box(x1 - 4, x1, sump, 58, T.AIR);                 /* out: down a shaft, and under the east wall */
    const [e0, e1] = c.exitE || [sump, 58], [w0, w1] = c.exitW || [sump, 58];
    box(a, x0 - 1, w0, w1, T.AIR); box(x1 + 1, b, e0, e1, T.AIR);                         /* the neighbours open to the sumps */
    if (c.stack) { const [s0, s1, s2, s3] = c.stack; box(s0, s1, s2, s3, T.SOLID); D.props.push({ k: 'bookshelf', x: s0 + 1, y: s3, v: 1 }); }
    for (const r of c.airs) { K.airRooms.push(r.slice()); D.pockets.push(r.slice()); }
    for (const [kx, ky] of c.knights) K.ents.push({ t: 'drownedknight', x: kx, y: ky, face: -1, floorBound: true });
    K.ents.push({ t: 'sign', x: c.sign[0], y: c.sign[1], text: c.sign[2] });
    K.keepLandmarks.push({ k: 'wheel', x: c.lever[0] + 2, y: c.lever[1], room: c.room });
    K.calm = [...(K.calm || []), [x0, x1, 24, 58]];   /* the sprinkler leaves a chamber alone: its knights are the problem, placed */
    tides.push(chamberTide(c));
  }
  /* 3. THE WATER: each chamber its own pool (the kit drives its line), cut out of the long reach it stood in */
  const cut = (pl, x0, x1, extra) => {
    const out = []; let tmpl = null;
    for (const p of K.pools) {
      const px0 = x0 * TS, px1 = (x1 + 1) * TS;
      if (p.x1 <= px0 || p.x0 >= px1 || !p.swim) { out.push(p); continue; }
      tmpl = tmpl || p;
      if (p.x0 < px0) out.push({ ...p, x1: px0 }); if (p.x1 > px1) out.push({ ...p, x0: px1 });
    }
    K.pools = out;
    const base = 59 * TS, t = tmpl || { swim: true, clear: true, wash: 0.28, grad: false };
    K.pools.push({ ...t, ...extra, id: pl, tide: pl, kfPool: true, x0: x0 * TS, x1: (x1 + 1) * TS, base, bottom: base });
  };
  for (const c of KF_CHAMBERS) { const fl = c.start === 'flooded', y = (fl ? c.top - 1 : c.floor) * TS; cut(c.id, c.x0, c.x1, { y, depth: 59 * TS - y, capped: fl, dry: false }); }
  /* 4. THE THRONE: its own pool (his floodgate, then his tide), the decree gate, the two levers */
  const A = KF_THRONE; cut('kfthrone', A.x0, A.x1, { y: (A.top - 1) * TS, depth: 59 * TS - (A.top - 1) * TS, capped: true, tide: 'throne' });
  tides.push(...throneTides());
  K.kfThrone = { ...A, levers: A.levers.map(l => l.slice()) };
  for (const e of K.ents) if (e.t === 'sign' && e.x >= 700 && e.x <= 708 && /THRONE ROOM/.test(e.text || '')) e.text = 'THE THRONE ROOM. HIS FLOODGATE DRAINS IT: ON HIS FLOOR HE IS ONLY A MAN. HIS DECREE BRINGS THE SEA BACK.';
  K.kfTides = tides;
  K.kfLevers = [...KF_CHAMBERS.map(c => ({ x: c.lever[0], y: c.lever[1], chamber: c.id })), ...A.levers.map(([x, y]) => ({ x, y, chamber: 'throne' }))];   /* the level's gadget, as tools/level-quality.mjs counts one (SYSTEM_ARRAYS) */
  K.kfChambers = KF_CHAMBERS.map(c => ({ ...c }));
  K.keepFloods = true;
  return K;
}

/* ---------------- THE STATIC CHECKS (tools/keep-floods.mjs) ---------------- */
/* each chamber: the sumps open both sides (water in both states), the shafts reach the floor, the lever stands on the floor, the knights stand on the floor,
   the airs are open air tiles, no chamber overlaps another, the floor is >= 6 tiles long, the ceiling is closed (no surface to breathe at when flooded). */
export function lintFloods(L, T) {
  const bad = [], at = (x, y) => L.grid[y * L.W + x], air = (x, y) => at(x, y) === T.AIR, solid = (x, y) => at(x, y) === T.SOLID;
  const cs = L.kfChambers || [];
  for (const c of cs) {
    const id = c.id;
    for (const y of [c.sump, 58]) { if (!air(c.x0 - 1, y) || !air(c.x0, y)) bad.push(id + ': west sump closed at row ' + y); }
    const e0 = (c.exitE || [c.sump])[0]; if (!air(c.x1, e0) || !air(c.x1 + 1, e0)) bad.push(id + ': east sump closed at row ' + e0);
    for (let x = c.x0 + 1; x <= c.x0 + 4; x++) if (!air(x, c.floor) || !air(x, c.floor - 1)) bad.push(id + ': the west shaft is shut at col ' + x);
    for (let x = c.x1 - 4; x <= c.x1 - 1; x++) if (!air(x, c.floor)) bad.push(id + ': the east shaft is shut at col ' + x);
    for (let x = c.x0; x <= c.x1; x++) if (!solid(x, c.top - 1)) bad.push(id + ': the ceiling is open at col ' + x + ' (a flooded chamber would have a surface)');
    const [lx, ly] = c.lever; if (!(air(lx, ly) && solid(lx, ly + 1))) bad.push(id + ': the lever at ' + lx + ',' + ly + ' does not stand on the floor');
    for (const [kx, ky] of c.knights) if (!(air(kx, ky) && solid(kx, ky + 1))) bad.push(id + ': a knight at ' + kx + ',' + ky + ' does not stand on the floor');
    let run = 0, best = 0; for (let x = c.x0 + 1; x <= c.x1 - 1; x++) { if (solid(x, c.floor) && air(x, c.floor - 1)) { run++; best = Math.max(best, run); } else run = 0; }
    if (best < 6) bad.push(id + ': the floor is ' + best + ' tiles (a fight wants >= 6)');
    for (const r of c.airs) for (let y = r[2]; y <= r[3]; y++) for (let x = r[0]; x <= r[1]; x++) if (!air(x, y)) bad.push(id + ': air ' + r.join(',') + ' is stone at ' + x + ',' + y);
    for (const o of cs) if (o !== c && o.x0 <= c.x1 && o.x1 >= c.x0) bad.push(id + ': overlaps ' + o.id);
    const p = (L.pools || []).find(q => q.id === c.id); if (!p) bad.push(id + ': no pool');
    else for (const q of L.pools) if (q !== p && q.swim && q.x0 < p.x1 && q.x1 > p.x0) bad.push(id + ': pool overlaps another swim pool at ' + q.x0 / 16 + '-' + q.x1 / 16);
  }
  if ((L.whirlpools || []).length) bad.push('a whirlpool is still declared');
  const A = L.kfThrone; if (A) { for (let y = A.top; y <= 58; y++) if (solid(A.gateCol, y)) bad.push('throne: the decree gate column ' + A.gateCol + ' is stone at row ' + y);
    for (const [x, y] of A.levers) if (!(air(x, y) && !air(x, y + 1))) bad.push('throne: a lever at ' + x + ',' + y + ' does not stand on the floor');
    if (!(A.levers[0][0] < A.gateCol && A.levers[1][0] > A.gateCol)) bad.push('throne: the levers are not one each side of the gate'); }
  return bad;
}
