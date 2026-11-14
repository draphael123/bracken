// src/skyhook2.js - SKYHOOK 2: THE LEVERS ARE THE FIGHT (claude/sky2grey, 11-14; scratch/lane-reports/skyhook2-plan.md lane 1, approved by Daniel 11-14 with all five answers).
// Behind the flag SKY2 (SKY2_DEFAULT false; ?sky2=1 page, globalThis.__SKY2 / BRACKEN_SKY2=1 node). OFF = src/skyhook.js, the live fight, byte for byte (this file is not read).
// After the flip ?sky2=0 (or __SKY2 = false / BRACKEN_SKY2=0) is the old fight again. PURE: his moves, 3 phases, the 3 levers' states, the bot's plan (sky2Plan).
// src/skyhook2-hands.js binds it to the world and draws it (GREYBOX: the art lane SKY2ART draws it). tools/sky2.mjs is its check.
// HEADER (design-standard B1 / B3 / B5 / B10 / B15 / B16; Daniel 11-12: full immunity OK when every class can break it, the switch exception):
//   OUT OF REACH: on his SKY line or a CROWN he takes 0 - told by a chain-hatch ring on him, the bar 'SKYHOOK  OUT OF REACH', a clank and
//     'OUT OF REACH - THROW THE POINTS' on the first blow, and the POINTS lamp blinking. A lever breaks it, and every lever takes any blow or shot of all 9 heroes.
//   THE 3 LEVERS (props on the floor): POINTS (W) sends his next ride onto the LOW line (x0.75) - a hero only ever SETS it (co-op cannot undo itself); only he
//     hooks it back (told 1.0 s; strike POINTS in the tell = HELD). WEIGHT (E) drops him DOWN (x2, purse) while he is on the LOW line. CRANE (mid, lit in P3)
//     swings the ORE SKIP: it hits everyone in its arc - heroes, co-op partners and him (on SKY it snaps the line: DOWN; on LOW: SMASHED).
//   3 PHASES: P1 (100-65%) the sky line; P2 (65-35%) he cuts the LOW line (strike WEIGHT in the fray = he drops early); P3 (35-0%) the crane.
//   ENRAGE: hp <= 20% or 270 s from his wake: 'HE CUTS THE GUY', rides 20% faster, THE RUNAWAY SKIP swings by itself every 2.4 s (CRANE pauses it 3 s).
//   3 NEW ATTACKS: A1 THE COUNTERWEIGHT RUN (P1-3, red), A2 RIVET RAIN (P2-3, yellow), A3 THE RUNAWAY SKIP (enrage, red). Every one told with its own marks row.
//   FALLS: knocked or cut off a winch = 5 dmg + 0.4 s on the floor, never lethal (the hands).
//   NO SOFT-LOCK: every cut restrings (LOW 6 s, SKY 6 s), a locked POINTS unlocks with it, the weight re-hangs in 6 s, he rides at least every 3rd move.
import { SH } from './skyhook.js';
const sky2Forced = () => { try { const g = typeof globalThis !== 'undefined' ? globalThis : null; if (g && (g.__SKY2 === true || g.__SKY2 === '1')) return true; if (g && g.location && /[?&]sky2=1(&|#|$)/.test(String(g.location.search || ''))) return true; } catch { /* no globals */ } try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_SKY2 === '1') return true; } catch { /* no node */ } return false; };
const sky2OptOut = () => { try { const g = typeof globalThis !== 'undefined' ? globalThis : null; if (g && (g.__SKY2 === false || g.__SKY2 === '0')) return true; if (g && g.location && /[?&]sky2=0(&|#|$)/.test(String(g.location.search || ''))) return true; } catch { /* no globals */ } try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_SKY2 === '0') return true; } catch { /* no node */ } return false; };
export const SKY2_DEFAULT = false;   /* SKY2REL flips this; ?sky2=0 stays the old fight for a week after (Daniel 11-14 answer 5) */
export const SKY2 = sky2Forced() || (SKY2_DEFAULT && !sky2OptOut());
const up = v => Math.round(v * 1.15);   /* the plan's first tune: the old moves x1.15 (weightier), tells unchanged */
export const SK = {
  hp: 2600, w: 18, h: 32, markH: 44, hang: 40,
  p2: 0.65, p3: 0.35, enrage: { hp: 0.20, t: 270, tell: 1.4, speed: 1.2 },
  low: 0.75, wardMul: 0.4,                                            /* on the LOW line (and anywhere off his SKY line / crowns): his coat; warded */
  rest: [0.9, 0.75, 0.65],
  ride: { tell: [0.6, 0.5, 0.45], v: [140, 175, 190], lowV: 0.7, trolley: 16, dmg: up(SH.ride.dmg) },
  hook: { ...SH.hook, tell: [0.75, 0.65, 0.65], dmg: up(SH.hook.dmg), range: 380 },
  drop: { ...SH.drop, tell: [0.95, 0.85, 0.85], chance: [0.55, 0.7, 0.7], land: [1.0, 0.8, 0.8], dmg: up(SH.drop.dmg) },
  jarred: { t: [1.2, 1.0, 1.0], mul: 1.5, cap: 0.08 },
  sweep: { ...SH.sweep, tell: [0.75, 0.65, 0.65], chance: [0.4, 0.5, 0.5], dmg: up(SH.sweep.dmg) },
  climb: { tell: 0.3, t: 0.7 },
  rise: { ...SH.rise, dmg: up(SH.rise.dmg) },
  cut: { tell: 1.4, restring: 6 },
  swing: { ...SH.swing, dmg: up(SH.swing.dmg) },
  phase: { tell: 1.4 },
  leverHook: { tell: [0.7, 0.6, 0.6], range: 64 },
  points: { rehook: [2.6, 1.9, 1.5], tell: 1.0, onRise: true },       /* KNOB 1: how long a route stays. onRise (lane decision, see the report): back on a crown after a DOWN / SMASHED he hooks the points first (the same told, holdable re-hook) - without it one POINTS strike sets the LOW route for the rest of the fight and WEIGHT loops him */
  weight: { rehang: 6, fall: 0.45 },
  downed: { t: 3.0, mul: 2.0, cap: 0.15 },                             /* KNOB 2: DOWN purse / window */
  smashed: { t: 4.0, mul: 2.0, cap: 0.30, capSky: 0.25, capRun: 0.20 },
  fray: { tell: 1.4, restring: 6, dmg: 9, h: 14, back: 0.6 },
  crane: { tell: 1.0, sweep: 1.2, cool: 9, dmg: 14, push: 240, r: 14, amp: 170, len: 264, him: 22 },
  run: { every: 2.4, tell: 0.7, pause: 3 },
  cw: { every: 4, tell: 0.9, fall: 0.35, r: 28, dmg: 13, up: -300, step: 4 },
  rivet: { every: 3, tell: 0.8, fall: 0.3, n: 5, r: 9, dmg: 6, gap: 40 },
  fall: { dmg: 5, stun: 0.4 },
  camPad: 30,   /* (sky2tune) the camera rises until his head is this far under the top of the view (main.js -> hands camY), never past the hero's feet + the boss plate */
};
export const SKY2_SAY = { wake: 'SKYHOOK', rule: 'THROW THE POINTS: BRING HIM DOWN TO THE LOW LINE', reach: 'OUT OF REACH', reachTip: 'OUT OF REACH - THROW THE POINTS',
  set: 'THE POINTS ARE SET', already: 'THE POINTS ARE SET', locked: 'THE LOW LINE IS DOWN', rehook: 'HE HOOKS THE POINTS', held: 'HELD', snapBack: 'THE POINTS SNAP BACK',
  weight: 'THE WEIGHT DROPS', notLow: 'HE IS NOT ON THE LOW LINE', spent: 'THE WEIGHT IS SPENT', downed: 'DOWN ON THE ROCK', jarred: 'JARRED', smashed: 'SMASHED',
  craneDark: 'THE CRANE IS DARK', crane: 'THE SKIP SWINGS', cooling: 'THE CRANE IS COOLING', pause: 'THE SKIP HOLDS', snap: 'THE SKY LINE SNAPS',
  p2: 'HE DRAWS HIS CUTTER', p3: 'THE CRANE IS LIT', fray: 'HE CUTS THE LOW LINE', enrage: 'HE CUTS THE GUY', cw: 'THE COUNTERWEIGHT RUNS', rivet: 'RIVETS',
  cut: 'HE CUTS YOUR LINE', swing: 'HE SWINGS LOW', ward: 'HE SHRUGS IT OFF', hooked: 'HOOKED', rise: 'HE GETS UP', guard: 'RIGGER\'S COAT' };
export const OPEN_NAME2 = { downed: 'DOWN', jarred: 'JARRED', smashed: 'SMASHED' };
export const sky2Open = e => !!e && (e.mode === 'downed' || e.mode === 'jarred' || e.mode === 'smashed');
const TELLS = new Set(['crownHookTell', 'rideTell', 'hookTell', 'dropTell', 'sweepTell', 'cutTell', 'swingTell', 'rise', 'climbTell', 'phaseTell', 'enrageTell', 'cwTell', 'rivetTell', 'rehookTell', 'frayTell']);
export const sky2Telling = e => TELLS.has(e.mode);
/* WHERE HE IS: 'crown' | 'sky' | 'low' | 'floor' (in the air on a drop / climb / swing counts as floor: off his lines) */
const CROWN = new Set(['crownHookTell', 'sleep', 'wake', 'perch', 'phaseTell', 'enrageTell', 'rideTell', 'hookTell', 'hook', 'cutTell', 'cut', 'cwTell', 'cw', 'rivetTell', 'rivet', 'swingTell']);
const LOWM = new Set(['rehookTell', 'frayTell', 'rampUp', 'swingBack']);
export const sky2Where = e => !e ? 'floor' : CROWN.has(e.mode) ? 'crown' : (e.mode === 'ride' && e.route === 'sky') || e.mode === 'dropTell' ? 'sky' : (e.mode === 'ride' && e.route === 'low') || LOWM.has(e.mode) ? 'low' : 'floor';
export const sky2Immune = e => { const w = sky2Where(e); return w === 'crown' || w === 'sky'; };
export const sky2OnLow = e => sky2Where(e) === 'low';
/* B16: every told move a windup and a release that differ (src/skyhook2-hands.js POSE2) */
export const MOVES2 = [['rideTell', 'ride'], ['hookTell', 'hook'], ['dropTell', 'drop'], ['sweepTell', 'sweep'], ['cutTell', 'cut'], ['swingTell', 'swing'], ['rise', 'climb'], ['phaseTell', 'perch'],
  ['enrageTell', 'perch'], ['cwTell', 'cw'], ['rivetTell', 'rivet'], ['rehookTell', 'rampUp'], ['crownHookTell', 'hook'], ['frayTell', 'swingBack']];

/* ---------- THE STATION (px). A = main.js's arena (src/highlines.js, unchanged). o.feet = { W: { x, y }, E: { x, y } } the winch lines' feet (the kit's SW / SE) ---------- */
export function geom2(A, o = {}) {
  const x0 = A.x0, x1 = A.x1, floorY = A.floor, mid = (x0 + x1) / 2, roof = A.roofY ?? floorY - 288;   /* the chamber's roof (row 30 over a row-48 floor) */
  const crown = { W: { x: x0 + 20, y: roof + 48 }, E: { x: x1 - 20, y: roof + 48 } }, skyY = crown.W.y - 16, lowY = floorY - 48;
  const ramp = { W: x0 + 104, E: x1 - 104 };   /* the LOW line's ends: a short ramp from each crown down to them */
  const lv = id => (A.levers.find(l => l.id === id) || {}).x;
  const feet = o.feet || { W: { x: x0 + 192, y: floorY - 22 }, E: { x: x1 - 208, y: floorY - 22 } };
  const G = { x0, x1, floorY, mid, roof, crown, skyY, lowY, ramp, feet, winch: { ...A.winch }, line: { ...(A.line || {}) },
    levers: [{ id: 'POINTS', x: lv('W') ?? x0 + 40 }, { id: 'WEIGHT', x: lv('E') ?? x1 - 56 }, { id: 'CRANE', x: Math.round(mid) - 8 }],
    pivot: { x: mid, y: roof + 6 } };
  /* the rope under him: SKY crown to crown; LOW = a ramp down from each crown to the low line */
  G.ropeY = (route, x) => { if (route === 'sky') return skyY; const a = crown.W.x, b = crown.E.x;
    if (x <= ramp.W) return skyY + (lowY - skyY) * Math.max(0, Math.min(1, (x - a) / (ramp.W - a)));
    if (x >= ramp.E) return skyY + (lowY - skyY) * Math.max(0, Math.min(1, (b - x) / (b - ramp.E)));
    return lowY; };
  return G;
}
export function newFight2(G) {
  return { G, v2: true, ph: 1, ward: 0, act: 0, restT: 1, side: 'E', last: [], moves: 0, sinceRide: 0, sinceSwing: 0, sinceCw: 0, sinceRivet: 0, dropsThisRide: 0, purse: null, hooks: [], leverHook: null,
    t: 0, woke: false, enraged: false, points: 'SKY', held: false, onLow: 0, lowVisit: 0, weightT: 0, craneT: 0, lowCut: 0, skyCut: 0,
    skip: { st: 'rest', t: 0, dir: 1, key: '', from: '', pauseT: 0, cycle: 0, hitHim: false }, cw: null, rivets: [], whip: null, told: {}, struck: [],
    n: { ride: 0, lowRide: 0, skyRide: 0, pointsSet: 0, held: 0, rehook: 0, weightDown: 0, smashed: 0, skySnap: 0, crane: 0, pause: 0, downed: 0, jarred: 0, hook: 0, hooked: 0, drop: 0, sweep: 0, cut: 0, swing: 0,
      leverHook: 0, clank: 0, fray: 0, lowCut: 0, cw: 0, rivet: 0, run: 0, enrage: 0, phase: 0 } };
}
const other = s => (s === 'W' ? 'E' : 'W');
const near = (heroes, x, y) => { let b = null, bd = 1e9; for (const h of heroes) { if (!h.alive) continue; const d = Math.abs(h.x - x) + Math.abs(h.y - y) * 0.5; if (d < bd) { bd = d; b = h; } } return b; };
const onFloor = (G, h) => h.alive && !h.lk && h.y >= G.floorY - 2;
const iOf = S => Math.min(2, S.ph - 1);
export function atCrown(e, S) { const c = S.G.crown[S.side]; e.x = c.x; e.y = c.y; }
export function hangOn(e, S, route, x) { e.route = route; e.x = x; e.y = S.G.ropeY(route, x) + SK.hang; }
const speed = S => SK.ride.v[iOf(S)] * (S.enraged ? SK.enrage.speed : 1);
const lineUp = (S, route) => (route === 'sky' ? S.skyCut <= 0 : S.lowCut <= 0);
/* the route his next ride takes: the POINTS (LOW only while the low line is strung) */
export const nextRoute = S => (S.points === 'LOW' && S.lowCut <= 0 ? 'low' : 'sky');
export const pointsLocked = S => S.lowCut > 0;
/* THE SKIP: a pendulum under the roof jib. k 0..1 across one pass; dir +1 = west to east */
export function skipAt(S, k, dir) {
  const G = S.G, th0 = Math.asin(SK.crane.amp / SK.crane.len), th = -dir * th0 * Math.cos(Math.PI * Math.max(0, Math.min(1, k)));
  return { x: G.pivot.x + SK.crane.len * Math.sin(th), y: G.pivot.y + SK.crane.len * Math.cos(th) };
}
/* the chain's x at height y (pivot to skip) */
export const chainX = (S, q, y) => { const P = S.G.pivot, k = (y - P.y) / Math.max(1, q.y - P.y); return k < 0 || k > 1.05 ? null : P.x + (q.x - P.x) * k; };

/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, lk, pp }]; w: the world (src/skyhook2-hands.js world2()): w.hit(box, dmg, name, o) -> per hero,
   w.lineUp(id), w.cutLine(id, s), w.riders(id), w.knock(id, fromX) (riderHit: knocked off a winch), w.step(x, on) (the iron step), number / sound / shake / mark / fx / music ---------- */
export function stepSky2(e, S, dt, heroes, w) {
  const G = S.G, i = iOf(S);
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.sk2Immune = sky2Immune(e);
  if (S.woke) S.t += dt;
  S.weightT = Math.max(0, S.weightT - dt); S.craneT = Math.max(0, S.craneT - dt); S.skyCut = Math.max(0, S.skyCut - dt);
  if (S.lowCut > 0) { S.lowCut = Math.max(0, S.lowCut - dt); }
  stepHooks(S, dt, heroes, w); stepSkip(e, S, dt, heroes, w); stepCw(S, dt, heroes, w); stepRivets(S, dt, w); stepWhip(S, dt, w);
  if (S.leverHook) { if (sky2Where(e) !== 'sky') S.leverHook = null; else { S.leverHook.t -= dt; if (S.leverHook.t <= 0) { const lh = S.leverHook; S.leverHook = null; throwHook(e, S, lh.tx, G.floorY - 8, lh.key, w); } } }
  if (e.mode === 'sleep') { atCrown(e, S); return; }
  e.modeT -= dt;
  const P = near(heroes, e.x, e.y), face = x => { e.face = Math.sign(x - e.x) || e.face; };
  switch (e.mode) {
    case 'wake': atCrown(e, S); S.woke = true; if (P) face(P.x); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = 0.6; } return;
    case 'perch': {
      atCrown(e, S); if (P) face(P.x); S.restT -= dt;
      /* THE PHASES and THE ENRAGE: only at a crown (never through an opening), one at a time */
      if (S.ph < 2 && e.hp <= e.maxHp * SK.p2) { S.ph = 2; e.phase = 2; S.n.phase++; S.ward = SK.phase.tell; e.mode = 'phaseTell'; e.modeT = SK.phase.tell; w.sound('cutter'); w.number(e.x, e.y - 60, SKY2_SAY.p2, '#ff6b6b'); w.music(2); S.act++; return; }
      if (S.ph === 2 && e.hp <= e.maxHp * SK.p3) { S.ph = 3; e.phase = 3; S.n.phase++; S.ward = SK.phase.tell; e.mode = 'phaseTell'; e.modeT = SK.phase.tell; w.sound('crane'); w.number(G.mid, G.floorY - 90, SKY2_SAY.p3, '#ffd36b'); w.music(2); S.act++; return; }
      if (!S.enraged && (e.hp <= e.maxHp * SK.enrage.hp || S.t >= SK.enrage.t)) { S.ward = SK.enrage.tell; e.mode = 'enrageTell'; e.modeT = SK.enrage.tell; S.n.enrage++; w.sound('cutter'); w.number(G.mid, G.floorY - 90, SKY2_SAY.enrage, '#ff6b6b'); S.act++; return; }
      if (S.restT > 0 || !P) return;
      pick2(e, S, heroes, w); return; }
    case 'phaseTell': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = 0.4; } return;
    case 'enrageTell': atCrown(e, S); if (e.modeT <= 0) { S.enraged = true; S.skip.cycle = 0.6; e.mode = 'perch'; S.restT = 0.4; w.sound('crane'); } return;
    /* THE RIDE: hooked on at his crown, out along the route the POINTS set */
    case 'rideTell': atCrown(e, S); if (e.modeT <= 0) { const route = nextRoute(S); if (!lineUp(S, route)) { e.mode = 'perch'; S.restT = 0.3; return; }
        e.mode = 'ride'; e.rideTo = other(S.side); hangOn(e, S, route, G.crown[S.side].x); S.dropsThisRide = 0; S.n.ride++; e.hitKey = 'tr' + S.act; w.sound('ride');
        if (route === 'low') { S.n.lowRide++; S.onLow = 0; S.held = false; S.lowVisit++; e.lowDir = S.side === 'W' ? 1 : -1; }
        else { S.n.skyRide++; const lv = G.levers.map(l => ({ l, h: near(heroes.filter(q => onFloor(G, q)), l.x, G.floorY) })).filter(o => o.h && Math.abs(o.h.x - o.l.x) < SK.leverHook.range)[0];
          if (lv) { S.leverHook = { t: SK.leverHook.tell[i], tx: lv.h.x, lever: lv.l.id, key: 'lh' + S.act }; S.n.leverHook++; w.sound('hookTell'); w.number(lv.l.x, G.floorY - 40, '!', '#ffd36b'); } } }
      return;
    case 'ride': return e.route === 'low' ? rideLow(e, S, dt, heroes, w) : rideSky(e, S, dt, heroes, w, P);
    case 'dropTell': { e.noHit = false;
      if (!e.locked) { if (P && onFloor(G, P)) { const d = P.x - e.x; hangOn(e, S, 'sky', Math.max(G.crown.W.x + 8, Math.min(G.crown.E.x - 8, e.x + Math.sign(d) * Math.min(Math.abs(d), SK.drop.trackV * dt)))); } e.lockX = e.x;
        if (e.modeT <= SK.drop.tell[i] - SK.drop.track) { e.locked = true; w.sound('lock'); } }
      else hangOn(e, S, 'sky', e.lockX);
      if (e.modeT <= 0) { e.mode = 'drop'; e.modeT = SK.drop.fall; e.vy0 = e.y; e.hitKey = 'dr' + S.act; w.sound('drop'); } return; }
    case 'drop': {
      const k = 1 - Math.max(0, e.modeT) / SK.drop.fall; e.x = e.lockX; e.y = e.vy0 + (G.floorY - e.vy0) * k * k;
      if (e.modeT <= 0 && e.noHit) { e.y = G.floorY; e.noHit = false; e.mode = 'landed'; e.modeT = SK.drop.land[i]; w.fx('dust', e.x, G.floorY); return; }
      if (e.modeT <= 0) { e.y = G.floorY; w.shake(7); w.sound('slam'); w.fx('dust', e.x, G.floorY);
        const res = w.hit([e.x - SK.drop.r, e.x + SK.drop.r, G.floorY - 20, G.floorY + 2], SK.drop.dmg, 'drop', { key: e.hitKey, up: SK.drop.kick });
        if (!res || !res.some(r => r === 'hit' || r === 'blocked')) { openUp(e, S, 'jarred', SK.jarred.t[i], SK.jarred.cap, w); }
        else { e.mode = 'landed'; e.modeT = SK.drop.land[i]; } }
      return; }
    case 'landed': e.y = G.floorY; if (P) face(P.x);
      if (e.modeT <= 0) { if (P && onFloor(G, P) && Math.abs(P.x - e.x) < SK.sweep.reach + 20 && Math.random() < SK.sweep.chance[i]) { e.mode = 'sweepTell'; e.modeT = SK.sweep.tell[i]; S.act++; S.n.sweep++; w.mark('!!'); w.sound('sweepTell'); }
        else startClimb(e, S, w); }
      return;
    case 'jarred': e.y = G.floorY; if (e.modeT <= 0) startClimb(e, S, w); return;
    case 'sweepTell': e.y = G.floorY; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = SK.sweep.t; e.hitKey = 'sw' + S.act; w.sound('sweep'); } return;
    case 'sweep': e.y = G.floorY; w.hit([e.x - SK.sweep.reach, e.x + SK.sweep.reach, G.floorY - SK.sweep.h, G.floorY + 2], SK.sweep.dmg, 'sweep', { key: e.hitKey });
      if (e.modeT <= 0) startClimb(e, S, w); return;
    /* THE GRAPPLE: from the floor up to the nearest crown */
    case 'climbTell': if (e.modeT <= 0) { e.mode = 'climb'; e.modeT = SK.climb.t; e.cx0 = e.x; e.cy0 = e.y; w.sound('grapple'); } return;
    case 'climb': { const p = G.crown[e.climbTo], k = 1 - Math.max(0, e.modeT) / SK.climb.t; e.x = e.cx0 + (p.x - e.cx0) * k; e.y = e.cy0 + (p.y - e.cy0) * k - Math.sin(k * Math.PI) * 18;
      if (e.modeT <= 0) { S.side = e.climbTo; e.mode = 'perch'; S.restT = SK.rest[i]; atCrown(e, S);
        if (e.fromDown && SK.points.onRise && S.points === 'LOW') { e.mode = 'crownHookTell'; e.modeT = SK.points.tell; S.held = false; S.act++; w.sound('rehook'); w.number(G.levers[0].x, G.floorY - 50, SKY2_SAY.rehook, '#ff9a5c'); } e.fromDown = false; } return; }
    /* HE HOOKS THE POINTS from his crown (back up after a DOWN): the same told re-hook; a strike on POINTS in the tell holds them */
    case 'crownHookTell': atCrown(e, S); if (e.modeT <= 0) { if (!S.held) { S.points = 'SKY'; S.n.rehook++; w.sound('clank'); w.number(G.levers[0].x, G.floorY - 50, SKY2_SAY.snapBack, '#ff9a5c'); } e.mode = 'perch'; S.restT = SK.rest[i] * 0.5; } return;
    /* OFF A LINE ONTO THE ROCK: the weight dropped, or the skip snapped the sky line (leverStruck2 / stepSkip start it) */
    case 'slip': { const k = 1 - Math.max(0, e.modeT) / SK.weight.fall; e.y = e.vy0 + (G.floorY - e.vy0) * k * k;
      if (e.modeT <= 0) { e.y = G.floorY; openUp(e, S, 'downed', SK.downed.t, e.slipCap || SK.downed.cap, w); w.shake(9); } return; }
    case 'downed': case 'smashed': e.y = G.floorY; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = SK.rise.tell; e.hitKey = 'ri' + S.act; S.act++; w.sound('rise'); w.mark('!'); w.number(e.x, G.floorY - 50, SKY2_SAY.rise, '#ff9a5c'); } return;
    case 'rise': e.y = G.floorY; if (e.modeT <= 0) { w.hit([e.x - SK.rise.r, e.x + SK.rise.r, G.floorY - 30, G.floorY + 2], SK.rise.dmg, 'rise', { key: e.hitKey, pushFrom: e.x, push: SK.rise.push, yellow: true });
        S.ward = SK.rise.ward; e.ward = S.ward; w.fx('ward', e.x, G.floorY); w.number(e.x, G.floorY - 62, SKY2_SAY.ward, '#c8d8e8'); startClimb(e, S, w); }
      return;
    case 'hookTell': atCrown(e, S); if (e.modeT > SK.hook.lock && e.target) { e.aimX = e.target.x; e.aimY = e.target.y - 8; }
      if (e.modeT <= 0) { e.mode = 'hook'; e.modeT = 0.35; throwHook(e, S, e.aimX, e.aimY, 'hk' + S.act, w); } return;
    case 'hook': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SK.rest[i] * 0.6; } return;
    /* P2+: HE CUTS YOUR LINE - the winch line under his crown's side, while a hero hauls up it */
    case 'cutTell': { atCrown(e, S); const id = G.winch[S.side];
      if (!w.lineUp(id)) { e.mode = 'perch'; S.restT = 0.3; return; }
      if (e.modeT <= 0) { e.mode = 'cut'; e.modeT = 0.4; if (w.riders(id).length) { w.cutLine(id, SK.cut.restring); S.n.cut++; w.sound('cut'); w.number(e.x, e.y - 50, SKY2_SAY.cut, '#ff6b6b'); } else w.sound('perch'); }
      return; }
    case 'cut': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SK.rest[i] * 0.6; } return;
    /* P2+: THE LOW SWING - crown to crown on a hanging rope; the arc's low point skims the floor at the middle */
    case 'swingTell': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = SK.swing.t; e.swFrom = S.side; e.swTo = other(S.side); e.hitKey = 'sg' + S.act; S.n.swing++; w.sound('swing'); } return;
    case 'swing': { const q = swingAt2(S, e.swFrom, 1 - Math.max(0, e.modeT) / SK.swing.t); e.x = q.x; e.y = q.y; e.face = e.swTo === 'E' ? 1 : -1;
      w.hit([e.x - SK.w / 2, e.x + SK.w / 2, e.y - SK.h, e.y], SK.swing.dmg, 'swing', { key: e.hitKey, push: e.face * SK.swing.push });
      if (e.modeT <= 0) { S.side = e.swTo; e.mode = 'perch'; S.restT = SK.rest[i]; atCrown(e, S); } return; }
    /* A1 THE COUNTERWEIGHT RUN: he unlatches an iron weight down a winch line (stepCw drops it) */
    case 'cwTell': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'cw'; e.modeT = SK.cw.fall; if (S.cw) { S.cw.st = 'fall'; S.cw.t = SK.cw.fall; } w.sound('cw'); } return;
    case 'cw': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SK.rest[i] * 0.6; } return;
    /* A2 RIVET RAIN: he hammers the sky line; the dots are set at the tell (stepRivets drops them) */
    case 'rivetTell': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'rivet'; e.modeT = SK.rivet.fall + 0.05; for (const r of S.rivets) { r.st = 'fall'; r.t = SK.rivet.fall; } w.sound('rivet'); } return;
    case 'rivet': atCrown(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SK.rest[i] * 0.6; } return;
    /* HE HOOKS THE POINTS (on the LOW line, after SK.points.rehook s): told 1.0 s - a strike on POINTS in the tell HOLDS them (leverStruck2) */
    case 'rehookTell': hangOn(e, S, 'low', e.x); if (e.modeT <= 0) { S.points = 'SKY'; S.n.rehook++; w.sound('clank'); w.number(G.levers[0].x, G.floorY - 50, SKY2_SAY.snapBack, '#ff9a5c'); toCrown(e, S); } return;
    /* P2+: HE CUTS THE LOW LINE (told 1.4 s, a fray bar on the line): WEIGHT in the fray drops him early; else the line parts, the rope whips the floor */
    case 'frayTell': hangOn(e, S, 'low', e.x); if (e.modeT <= 0) { S.lowCut = SK.fray.restring; S.points = 'SKY'; S.n.lowCut++; S.whip = { t: 0.05, key: 'wp' + S.act }; w.sound('cut'); w.shake(5);
        w.number(e.x, e.y - 50, SKY2_SAY.locked, '#ff6b6b'); e.mode = 'swingBack'; e.modeT = SK.fray.back; e.bx0 = e.x; e.by0 = e.y; e.climbTo = Math.abs(e.x - G.crown.W.x) <= Math.abs(e.x - G.crown.E.x) ? 'W' : 'E'; } return;
    case 'swingBack': { const p = G.crown[e.climbTo], k = 1 - Math.max(0, e.modeT) / SK.fray.back; e.x = e.bx0 + (p.x - e.bx0) * k; e.y = e.by0 + (p.y - e.by0) * k - Math.sin(k * Math.PI) * 24;
      if (e.modeT <= 0) { S.side = e.climbTo; e.mode = 'perch'; S.restT = SK.rest[i]; atCrown(e, S); } return; }
    /* he cranks back up the ramp to the nearest crown */
    case 'rampUp': { const c = G.crown[e.climbTo], dir = Math.sign(c.x - e.x) || 1; e.face = dir; hangOn(e, S, 'low', e.x + dir * Math.min(Math.abs(c.x - e.x), speed(S) * dt));
      if (S.lowCut > 0) { toFloor(e, S, w); return; }
      if (Math.abs(e.x - c.x) < 1) { S.side = e.climbTo; e.mode = 'perch'; S.restT = SK.rest[i]; atCrown(e, S); w.sound('perch'); } return; }
    default: e.mode = 'perch';
  }
}
function toCrown(e, S) { const G = S.G; e.climbTo = Math.abs(e.x - G.crown.W.x) <= Math.abs(e.x - G.crown.E.x) ? 'W' : 'E'; e.mode = 'rampUp'; e.modeT = 9; }
function toFloor(e, S, w) { e.mode = 'drop'; e.modeT = SK.drop.fall; e.lockX = e.x; e.vy0 = e.y; e.hitKey = null; e.noHit = true; S.act++; w.sound('drop'); }   /* his line parted under him: down onto the rock, no blow (untold) */
function openUp(e, S, mode, t, cap, w) {
  e.mode = mode; e.modeT = t; e.openT0 = t; S.purse = e.maxHp * cap; e.fromDown = mode !== 'jarred'; S.leverHook = null; e.y = S.G.floorY;
  if (mode === 'downed') S.n.downed++; else if (mode === 'jarred') S.n.jarred++; else if (mode === 'smashed') S.n.smashed++;
  w.fx('open', e.x, S.G.floorY); w.sound(mode === 'jarred' ? 'jarred' : 'downed'); w.number(e.x, S.G.floorY - 50, SKY2_SAY[mode], '#ffd36b');
}
function rideSky(e, S, dt, heroes, w, P) {
  const G = S.G, i = iOf(S), to = G.crown[e.rideTo].x, dir = Math.sign(to - e.x) || 1; e.face = dir;
  if (S.skyCut > 0) { toFloor(e, S, w); return; }
  hangOn(e, S, 'sky', e.x + dir * Math.min(Math.abs(to - e.x), speed(S) * dt));
  w.hit([e.x - SK.ride.trolley, e.x + SK.ride.trolley, e.y - SK.h - SK.hang, e.y - SK.h + 4], SK.ride.dmg, 'trolley', { key: e.hitKey, ridersOnly: G.line.id });
  const below = heroes.find(h => onFloor(G, h) && Math.abs(h.x - e.x) < 10);
  if (below && S.dropsThisRide === 0 && Math.abs(e.x - to) > 24) { S.dropsThisRide = 1; if (Math.random() < SK.drop.chance[i]) { e.mode = 'dropTell'; e.modeT = SK.drop.tell[i]; e.locked = false; e.lockX = e.x; S.act++; S.leverHook = null; S.n.drop++; w.mark('!!'); w.sound('dropTell'); return; } }
  if (Math.abs(e.x - to) < 1) { S.side = e.rideTo; e.mode = 'perch'; S.restT = SK.rest[i]; atCrown(e, S); w.sound('perch'); }
}
/* THE LOW LINE: down the ramp, then up and down the low line (SK.ride.lowV of his speed) until he hooks the POINTS back (P1; P2+ every other visit) or cuts the line (P2+) */
function rideLow(e, S, dt, heroes, w) {
  const G = S.G, i = iOf(S); if (S.lowCut > 0) { toFloor(e, S, w); return; }
  const onSpan = e.x > G.ramp.W - 1 && e.x < G.ramp.E + 1, v = speed(S) * (onSpan ? SK.ride.lowV : 1);
  let nx = e.x + e.lowDir * v * dt; if (nx >= G.ramp.E && e.lowDir > 0 && e.x >= G.ramp.W) { nx = G.ramp.E; e.lowDir = -1; } else if (nx <= G.ramp.W && e.lowDir < 0 && e.x <= G.ramp.E) { nx = G.ramp.W; e.lowDir = 1; }
  hangOn(e, S, 'low', nx); e.face = e.lowDir;
  if (onSpan) S.onLow += dt;
  if (S.onLow >= SK.points.rehook[i]) {
    const fray = S.ph > 1 && S.lowVisit % 2 === 1;
    if (fray) { e.mode = 'frayTell'; e.modeT = SK.fray.tell; S.n.fray++; S.act++; w.mark('!!'); w.sound('cutTell'); w.number(e.x, e.y - 50, SKY2_SAY.fray, '#ff6b6b'); }
    else { e.mode = 'rehookTell'; e.modeT = SK.points.tell; S.held = false; S.act++; w.sound('rehook'); w.number(G.levers[0].x, G.floorY - 50, SKY2_SAY.rehook, '#ff9a5c'); }
    S.onLow = 0;
  }
}
/* THE SWING'S ARC between the crowns: feet SK.swing.low over the floor at the bottom */
export function swingAt2(S, from, k) {
  const G = S.G, a = G.crown[from], b = G.crown[other(from)], x = a.x + (b.x - a.x) * k;
  const lowY = G.floorY - SK.swing.low, edgeY = Math.min(a.y, b.y), y = lowY - (lowY - edgeY) * Math.pow(Math.abs(2 * k - 1), 2);
  return { x, y };
}
function startClimb(e, S, w) { const G = S.G; e.climbTo = Math.abs(e.x - G.crown.W.x) <= Math.abs(e.x - G.crown.E.x) ? 'W' : 'E'; e.mode = 'climbTell'; e.modeT = SK.climb.tell; w.sound('grappleTell'); }
function throwHook(e, S, tx, ty, key, w) {
  const dx = tx - e.x, dy = ty - (e.y - 20), d = Math.hypot(dx, dy) || 1;
  S.hooks.push({ x: e.x, y: e.y - 20, vx: dx / d * SK.hook.v, vy: dy / d * SK.hook.v, t: 0, T: Math.min(SK.hook.life * 1.4, d / SK.hook.v + 0.05), key, ox: e.x, oy: e.y - 20 }); S.n.hook++; w.sound('hook');
}
function stepHooks(S, dt, heroes, w) {
  for (const h of S.hooks) { h.t += dt; h.x += h.vx * dt; h.y += h.vy * dt; if (h.t >= h.T) h.done = true;
    const res = w.hit([h.x - SK.hook.r, h.x + SK.hook.r, h.y - SK.hook.r, h.y + SK.hook.r], SK.hook.dmg, 'hook', { key: h.key, pullTo: h.ox, pull: SK.hook.pull, yellow: true });
    if (res && res.some(r => r === 'hit' || r === 'blocked' || r === 'parried')) { h.done = true; if (res.includes('hit')) S.n.hooked++; } }
  S.hooks = S.hooks.filter(h => !h.done);
}
/* ---------- THE SKIP: the CRANE lever (P3) swings it once; enraged it runs by itself (A3) every SK.run.every s; the CRANE lever pauses it ---------- */
function stepSkip(e, S, dt, heroes, w) {
  const K = S.skip, C = SK.crane;
  if (S.enraged && K.st === 'rest' && !(K.pauseT > 0)) { K.cycle -= dt; if (K.cycle <= 0) startSkip(S, 'run', w); }
  if (K.pauseT > 0) K.pauseT = Math.max(0, K.pauseT - dt);
  if (K.st === 'tell') { K.t -= dt; if (K.t <= 0) { K.st = 'sweep'; K.t = C.sweep; K.hitHim = false; w.sound('skip'); } return; }
  if (K.st !== 'sweep') return;
  K.t -= dt; const k = 1 - Math.max(0, K.t) / C.sweep, q = skipAt(S, k, K.dir); K.x = q.x; K.y = q.y;
  w.hit([q.x - C.r, q.x + C.r, q.y - C.r, q.y + C.r], C.dmg, 'skip', { key: K.key, push: K.dir * C.push });
  /* it hits HIM too: the chain crosses his SKY trolley (the line snaps), or the skip meets him on the LOW line (SMASHED) */
  if (!K.hitHim && e.alive !== false && e.hp > 0) { const where = sky2Where(e);
    if (where === 'sky' && e.mode === 'ride') { const cx = chainX(S, q, e.y - SK.h / 2); if (cx !== null && Math.abs(cx - e.x) < C.him) { K.hitHim = true; S.skyCut = SK.cut.restring; S.n.skySnap++; e.slipCap = SK.smashed.capSky; e.mode = 'slip'; e.modeT = SK.weight.fall; e.vy0 = e.y; S.leverHook = null; S.act++; w.sound('slip'); w.shake(6); w.number(e.x, e.y - 60, SKY2_SAY.snap, '#ffd36b'); } }
    else if (where === 'low') { if (Math.abs(q.x - e.x) < C.him && q.y > e.y - SK.h && q.y < e.y + C.r) {   /* the skip itself at his body's height: only the low part of its arc (mid +-105 px) - at the ends of the LOW line it passes over him (mistimed) */ K.hitHim = true; e.x = Math.max(S.G.x0 + 20, Math.min(S.G.x1 - 20, e.x + K.dir * 24)); openUp(e, S, 'smashed', SK.smashed.t, K.from === 'run' ? SK.smashed.capRun : SK.smashed.cap, w); w.shake(9); } } }
  if (K.t <= 0) { K.st = 'rest'; K.x = K.y = undefined; K.dir = -K.dir; if (K.from === 'run') K.cycle = Math.max(0.01, SK.run.every - SK.run.tell - C.sweep); }
}
function startSkip(S, from, w) { const K = S.skip; K.st = 'tell'; K.t = from === 'run' ? SK.run.tell : SK.crane.tell; K.from = from; K.key = 'sk' + (++S.act); if (from === 'run') S.n.run++; else S.n.crane++; w.sound('skipTell'); w.markAt && w.markAt(S.G.pivot.x, S.G.pivot.y + 30, '!!'); }
/* ---------- A1: the weight down the winch line, its slam at the foot, the iron step it leaves ---------- */
function stepCw(S, dt, heroes, w) {
  const c = S.cw; if (!c) return; c.t -= dt;
  if (c.st === 'fall' && c.t <= 0) { const f = S.G.feet[c.side], fy = S.G.floorY;
    w.hit([f.x - SK.cw.r, f.x + SK.cw.r, fy - SK.cw.r, fy + 2], SK.cw.dmg, 'counterweight', { key: c.key, up: SK.cw.up }); w.knock(S.G.winch[c.side], f.x); w.shake(8); w.sound('slam'); w.fx('dust', f.x, fy);
    c.st = 'step'; c.t = SK.cw.step; w.step(f.x, true); }
  else if (c.st === 'step' && c.t <= 0) { w.step(S.G.feet[c.side].x, false); S.cw = null; }
}
function stepRivets(S, dt, w) {
  for (const r of S.rivets) { if (r.st !== 'fall') continue; r.t -= dt; if (r.t <= 0) { r.st = 'done'; const fy = S.G.floorY; w.hit([r.x - SK.rivet.r, r.x + SK.rivet.r, fy - 24, fy + 2], SK.rivet.dmg, 'rivet', { key: r.key, yellow: true }); w.fx('spark', r.x, fy); } }
  if (S.rivets.length && S.rivets.every(r => r.st === 'done')) S.rivets = [];
}
function stepWhip(S, dt, w) {
  const q = S.whip; if (!q) return; q.t -= dt;
  if (q.t <= 0) { const G = S.G; w.hit([G.ramp.W, G.ramp.E, G.floorY - SK.fray.h, G.floorY + 2], SK.fray.dmg, 'whip', { key: q.key }); S.whip = null; }
}
/* WHICH MOVE, from a crown. A ride at least every 3rd move (the lever's chance comes round); A1 every 4th; A2 every 3rd from P2; never one move three times running */
function pick2(e, S, heroes, w) {
  const G = S.G, i = iOf(S), last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  const P = near(heroes, e.x, e.y), mine = G.winch[S.side];
  const onMine = S.ph > 1 && w.lineUp(mine) && w.riders(mine).length > 0;
  const rideOk = lineUp(S, nextRoute(S));
  let k;
  if (onMine) k = 'cut';
  else if (rideOk && S.sinceRide >= 2) k = 'ride';
  else if (S.sinceCw >= SK.cw.every - 1 && !S.cw) k = 'cw';
  else if (S.ph > 1 && S.sinceRivet >= SK.rivet.every - 1 && !S.rivets.length) k = 'rivet';
  else if (rideOk && Math.random() < 0.5) k = 'ride';
  else k = P && Math.hypot(P.x - e.x, P.y - e.y) < SK.hook.range ? 'hook' : rideOk ? 'ride' : 'hook';
  if ((k === 'ride' || k === 'hook') && S.ph > 1 && S.sinceSwing >= SK.swing.every - 1 && (S.sinceSwing >= SK.swing.every || Math.random() < 0.5) && !(rideOk && S.sinceRide >= 2)) k = 'swing';
  if (k === 'hook' && twice('hook') && rideOk) k = 'ride';
  if (k === 'ride' && twice('ride') && !(S.sinceRide >= 2)) k = 'hook';
  last.unshift(k); last.length = Math.min(last.length, 3); S.moves++; S.act++;
  S.sinceRide = k === 'ride' ? 0 : S.sinceRide + 1; S.sinceSwing = k === 'swing' ? 0 : S.sinceSwing + 1; S.sinceCw = k === 'cw' ? 0 : S.sinceCw + 1; S.sinceRivet = k === 'rivet' ? 0 : S.sinceRivet + 1;
  switch (k) {
    case 'ride': e.mode = 'rideTell'; e.modeT = SK.ride.tell[i]; w.sound('rideTell'); break;
    case 'hook': e.mode = 'hookTell'; e.modeT = SK.hook.tell[i]; e.target = P; e.aimX = P ? P.x : e.x; e.aimY = P ? P.y - 8 : G.floorY - 8; w.mark('!'); w.sound('hookTell'); break;
    case 'cut': e.mode = 'cutTell'; e.modeT = SK.cut.tell; w.mark('!!'); w.sound('cutTell'); break;
    case 'swing': e.mode = 'swingTell'; e.modeT = SK.swing.tell; w.mark('!!'); w.sound('swingTell'); w.number(G.mid, G.floorY - 70, SKY2_SAY.swing, '#ff6b6b'); break;
    case 'cw': { const side = cwSide(S, heroes, w); S.cw = { side, st: 'tell', t: SK.cw.tell, key: 'cw' + S.act }; S.n.cw++; e.mode = 'cwTell'; e.modeT = SK.cw.tell; w.mark('!!'); w.sound('cwTell'); w.number(G.feet[side].x, G.floorY - 60, SKY2_SAY.cw, '#ff6b6b'); break; }
    case 'rivet': S.rivets = rivetDots(S, heroes); S.n.rivet++; e.mode = 'rivetTell'; e.modeT = SK.rivet.tell; w.mark('!'); w.sound('rivetTell'); break;
  }
}
/* A1's line: the winch with a rider on it, else the one whose foot is nearest a hero */
function cwSide(S, heroes, w) {
  const G = S.G; for (const s of ['W', 'E']) if (w.lineUp(G.winch[s]) && w.riders(G.winch[s]).length) return s;
  let b = 'W', bd = 1e9; for (const h of heroes) { if (!h.alive) continue; for (const s of ['W', 'E']) { const d = Math.abs(h.x - G.feet[s].x); if (d < bd) { bd = d; b = s; } } } return b;
}
/* A2's 5 dots: one on whoever stands nearest a lever (no camping), the rest spread over the floor, at least SK.rivet.gap apart */
export function rivetDots(S, heroes, rnd = Math.random) {
  const G = S.G, dots = [], lo = G.x0 + 14, hi = G.x1 - 14; let best = null, bd = 1e9;
  for (const h of heroes) { if (!h.alive) continue; for (const l of G.levers) { const d = Math.abs(h.x - l.x) + (h.y < G.floorY - 4 ? 400 : 0); if (d < bd) { bd = d; best = h; } } }
  if (best) dots.push(Math.max(lo, Math.min(hi, best.x)));
  for (let tries = 0; dots.length < SK.rivet.n && tries < 200; tries++) { const x = lo + rnd() * (hi - lo); if (dots.every(d => Math.abs(d - x) >= SK.rivet.gap)) dots.push(x); }
  for (let x = lo; dots.length < SK.rivet.n && x <= hi; x += SK.rivet.gap) if (dots.every(d => Math.abs(d - x) >= SK.rivet.gap)) dots.push(x);
  return dots.map((x, j) => ({ x, st: 'tell', t: SK.rivet.tell, key: 'rv' + S.act + '_' + j }));
}

/* ---------- A LEVER STRUCK (any blow, any shot of any hero) -> what came of it: 'set' | 'held' | 'down' | 'swing' | 'pause' | 'clank' ---------- */
export function leverStruck2(e, S, id, w) {
  const G = S.G, at = (G.levers.find(l => l.id === id) || { x: G.mid }).x, say = (k, col = '#c8d8e8') => { if (w) w.number(at, G.floorY - 50, SKY2_SAY[k], col); };
  const clank = (k, once = true) => { S.n.clank++; if (w) { w.sound('clank'); if (!once || !S.told[k]) { S.told[k] = 1; say(k); } } S.struck.push({ id, out: 'clank', why: k }); return 'clank'; };
  if (!e || e.hp <= 0 || e.mode === 'sleep' || e.mode === 'wake') { S.n.clank++; if (w) w.sound('clank'); return 'clank'; }   /* before he wakes: iron only */
  if (id === 'POINTS') {
    if (e.mode === 'crownHookTell' && !S.held) { S.held = true; S.n.held++; e.mode = 'perch'; if (w) { w.sound('held'); say('held', '#ffd36b'); } S.struck.push({ id, out: 'held' }); return 'held'; }
    if (e.mode === 'rehookTell' && !S.held) { S.held = true; S.n.held++; S.onLow = 0; e.mode = 'ride'; e.route = 'low'; if (w) { w.sound('held'); say('held', '#ffd36b'); } S.struck.push({ id, out: 'held' }); return 'held'; }
    if (pointsLocked(S)) return clank('locked');
    if (S.points === 'LOW') return clank('already');
    S.points = 'LOW'; S.n.pointsSet++; if (w) { w.sound('points'); say('set', '#ffd36b'); } S.struck.push({ id, out: 'set' }); return 'set';   /* a hero only ever SETS them: never back to SKY (co-op cannot undo itself) */
  }
  if (id === 'WEIGHT') {
    if (S.weightT > 0) return clank('spent');
    if (!sky2OnLow(e)) return clank('notLow');
    S.weightT = SK.weight.rehang; S.n.weightDown++; S.leverHook = null; e.slipCap = SK.downed.cap; e.mode = 'slip'; e.modeT = SK.weight.fall; e.vy0 = e.y; S.act++;
    if (w) { w.sound('slip'); w.shake(5); say('weight', '#ffd36b'); } S.struck.push({ id, out: 'down' }); return 'down';
  }
  if (id === 'CRANE') {
    if (S.enraged) { if (S.skip.pauseT > 0) return clank('pause', false); S.skip.pauseT = SK.run.pause; if (S.skip.st === 'tell') { S.skip.st = 'rest'; S.skip.cycle = 0.01; } else if (S.skip.st === 'rest') S.skip.cycle = Math.max(S.skip.cycle, 0.01); S.n.pause++;
      if (w) { w.sound('points'); say('pause', '#ffd36b'); } S.struck.push({ id, out: 'pause' }); return 'pause'; }
    if (S.ph < 3) return clank('craneDark');
    if (S.craneT > 0 || S.skip.st !== 'rest') return clank('cooling', false);
    S.craneT = SK.crane.cool + SK.crane.tell + SK.crane.sweep; startSkip(S, 'crane', w || { sound() {} }); if (w) say('crane', '#ff6b6b'); S.struck.push({ id, out: 'swing' }); return 'swing';
  }
  return clank('craneDark');
}
/* ---------- A BLOW ON HIM -> [what lands, the word or null]. 0 only OUT OF REACH (SKY line / a crown: a lever breaks it); >= 0.4x everywhere else ---------- */
export function takeBlow2(e, S, dmg) {
  if (dmg <= 0) return [0, null];
  if (sky2Open(e)) { const mul = e.mode === 'jarred' ? SK.jarred.mul : e.mode === 'smashed' ? SK.smashed.mul : SK.downed.mul, d = Math.round(dmg * mul), left = S.purse ?? Infinity;
    if (d >= left) { S.purse = 0; e.modeT = Math.min(e.modeT, 0.05); return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (sky2Immune(e)) return [0, SKY2_SAY.reach];
  if (S.ward > 0 || e.mode === 'rise') return [Math.max(1, Math.round(dmg * SK.wardMul)), 'WARDED'];
  return [Math.max(1, Math.round(dmg * SK.low)), SKY2_SAY.guard];
}
/* the lamps (src/skyhook2-hands.js draws them; the bot reads them): POINTS 'SKY' (blinks while he is out of reach) | 'LOW' | 'LOCKED' | 'HOOKING' | 'HELD';
   WEIGHT 'READY' (lit while he is on the LOW line) | 'SPENT'; CRANE 'DARK' | 'READY' | 'SWINGING' | 'COOLING' | 'PAUSE' (enraged) | 'HOLDS' */
export function lamps(e, S) {
  const P = e && (e.mode === 'rehookTell' || e.mode === 'crownHookTell') ? 'HOOKING' : pointsLocked(S) ? 'LOCKED' : S.held && sky2OnLow(e) ? 'HELD' : S.points;
  const W = S.weightT > 0 ? 'SPENT' : 'READY';
  const C = S.enraged ? (S.skip.pauseT > 0 ? 'HOLDS' : 'PAUSE') : S.ph < 3 ? 'DARK' : S.skip.st !== 'rest' ? 'SWINGING' : S.craneT > 0 ? 'COOLING' : 'READY';
  return { POINTS: P, WEIGHT: W, CRANE: C, blink: { POINTS: P === 'SKY' && sky2Immune(e), WEIGHT: W === 'READY' && sky2OnLow(e), CRANE: C === 'READY' || C === 'PAUSE' } };
}

/* ---------- THE BOT (src/lab.js; tools/sky2.mjs): what a player reads - the lamps, his tells a reaction late, the rings, the dots, the arcs - and THE RULE:
   throw the POINTS while he is out of reach, hold them when he hooks them, WEIGHT while he is on the LOW line or in the fray, CRANE when he will be in the arc.
   CO-OP: the hero nearest a lit lever takes it; the others hit him. s.levers === false: the levers-off bot (it must lose) ---------- */
export const PLAN2 = { react: 0.2, miss: 0.1, missLever: 0.12, craneLead: 0.12 };
/* where he will be in t s (his trolley: a ride or the low line, straight-line; null when he will not be on a line) */
export function predictX(e, S, t) {
  const G = S.G; if (e.mode === 'ride' && e.route === 'sky') { const to = G.crown[e.rideTo].x, d = Math.sign(to - e.x); return e.x + d * Math.min(Math.abs(to - e.x), speed(S) * t); }
  if (e.mode === 'ride' && e.route === 'low') { let x = e.x, dir = e.lowDir || 1, left = t; const v = speed(S) * SK.ride.lowV;
    for (let k = 0; k < 6 && left > 0; k++) { const end = dir > 0 ? G.ramp.E : G.ramp.W, dd = Math.abs(end - x), tt = dd / v; if (tt >= left) { x += dir * v * left; left = 0; } else { x = end; dir = -dir; left -= tt; } } return x; }
  if (e.mode === 'rehookTell' || e.mode === 'frayTell') return e.x;
  return null;
}
export function sky2Plan(s) {
  const { P, e, S } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '', lever: null };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, reach = s.reach || 22, levers = s.levers !== false, team = s.team || [P];
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0.05 : PLAN2.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const dx = Math.abs(e.x - P.x), side = Math.sign(P.x - e.x) || 1, onFl = P.y >= G.floorY - 2 && !P.lk;
  const swingAtHim = () => { out.face = Math.sign(e.x - P.x) || out.face; out.atk = P.atk < 0; };
  const L = lamps(e, S), lev = id => G.levers.find(l => l.id === id);
  const PYRO = s.hero === 'pyro';   /* (sky2tune) the pyro is 'ranged' for the levers but his flame is 30-48 px: standing 40-90 px off him he never burned anything (0/48 wins) */
  const standOff = PYRO ? 26 : s.ranged ? 96 : Math.max(10, reach - 6);
  const leverSpot = l => clamp(l.x + (P.x < l.x ? -1 : 1) * standOff);
  const mine = id => { const l = lev(id); let best = null, bd = 1e9; for (const q of team) { const d = Math.abs(q.x - l.x); if (d < bd) { bd = d; best = q; } } return best === P || team.length < 2; };
  const strike = (id, why) => { const l = lev(id), sx = leverSpot(l); out.gx = sx; out.lever = id; out.face = Math.sign(l.x - P.x) || 1; if (Math.abs(P.x - sx) < (s.ranged ? 40 : 8) && P.ground) out.atk = P.atk < 0; out.why = why; return out; };
  if (P.lk) { out.down = true; out.why = 'off the line'; return out; }
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; return out; }
  /* 1. THE HOOK in the air at me */
  for (const h of S.hooks) { const d = Math.hypot(h.x - P.x, h.y - (P.y - 8)), key = 'h' + h.key;
    if (d < 70 && seenFor(key, 0.05) && !roll(key + 'm', s.v2 ? 0 : PLAN2.miss)) {
      if (s.shield) { out.block = true; out.gx = P.x; out.face = Math.sign(h.x - P.x) || P.face; out.why = 'block the hook'; return out; }
      if (s.dodge && P.ground) { out.dodge = true; out.gx = P.x + Math.sign(P.x - h.x || 1) * 30; out.why = 'roll the hook'; return out; }
      if (P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the hook'; return out; } } }
  /* 2. THE SKIP (the crane's swing or the runaway): to a wall while it is told; jump it at its low point if caught */
  const K = S.skip; if (K.st === 'tell' || K.st === 'sweep') { const key = 'k' + K.key, danger = 112;
    if (K.st === 'sweep' && K.x !== undefined && Math.abs(K.x - P.x) < 34 && K.y > P.y - 40 && P.ground && seenFor(key + 's', 0.05)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the skip'; return out; }
    if (Math.abs(P.x - G.mid) < danger && onFl && seenFor(key, 0.15) && !roll(key + 'm', s.v2 ? 0 : PLAN2.miss)) { out.gx = P.x < G.mid ? G.mid - danger - 14 : G.mid + danger + 14; out.why = 'out of the skip\'s arc'; return out; } }
  /* 3. A1: out of the foot circle of the told winch; off its line */
  if (S.cw && S.cw.st !== 'step') { const f = G.feet[S.cw.side], need = SK.cw.r + 14, key = 'c' + S.cw.key;
    if (Math.abs(P.x - f.x) < need && seenFor(key, 0.15) && !roll(key + 'm', s.v2 ? 0 : PLAN2.miss)) { out.gx = clamp(P.x < f.x ? f.x - need - 8 : f.x + need + 8); out.why = 'out of the weight\'s circle'; return out; } }
  /* 4. A2: between the dots (or block a yellow rivet) */
  if (S.rivets.length) { const key = 'r' + S.rivets[0].key, on = S.rivets.find(r => r.st !== 'done' && Math.abs(r.x - P.x) < SK.rivet.r + 8);
    if (on && seenFor(key, 0.15)) { if (s.shield && on.st === 'fall' && on.t < 0.2) { out.block = true; out.gx = P.x; out.why = 'block the rivet'; return out; }
      const free = [P.x - 24, P.x + 24, P.x - 44, P.x + 44].map(clamp).find(x => S.rivets.every(r => Math.abs(r.x - x) >= SK.rivet.r + 8)); if (free !== undefined) { out.gx = free; out.why = 'between the rivets'; return out; } } }
  /* 5. THE LOW LINE'S FRAY: WEIGHT now (the counter) if it is mine, else jump the whip */
  if (e.mode === 'frayTell') { if (levers && L.WEIGHT === 'READY' && mine('WEIGHT') && seenFor('f' + S.act, 0.15) && !roll('f' + S.act + 'm', s.v2 ? 0 : PLAN2.missLever)) return strike('WEIGHT', 'WEIGHT in the fray: he drops early');
    if (P.x > G.ramp.W - 10 && P.x < G.ramp.E + 10 && onFl && e.modeT < 0.12 && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the whip'; return out; } }
  /* 6. THE DROP's ring, THE SWEEP, THE LOW SWING, HE GETS UP (as the live fight) */
  if (e.mode === 'dropTell' && onFl) { const key = 'd' + S.act, need = SK.drop.r + 10;
    if (Math.abs(P.x - e.lockX) < need && (e.locked ? seenFor(key + 'l', 0.12) : seenFor(key, 0.3)) && !roll(key + 'm', s.v2 ? 0 : PLAN2.miss)) { const l = e.lockX - need - 6, r = e.lockX + need + 6;
      out.gx = clamp(Math.abs(P.x - l) < Math.abs(P.x - r) && l > lo ? l : r); out.why = 'out of the drop\'s ring'; return out; } }
  if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < SK.sweep.reach + 8) { const key = 's' + S.act;
    if (seenFor(key) && !roll(key + 'm', s.v2 ? 0 : PLAN2.miss) && (e.mode === 'sweep' || e.modeT < 0.2) && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the sweep'; return out; }
    out.gx = P.x; out.why = 'the sweep: ready to jump it'; return out; }
  if (e.mode === 'swingTell' || e.mode === 'swing') { const key = 'g' + S.act, edge = P.x < G.mid ? lo + 4 : hi - 4;
    if (e.mode === 'swing' && Math.abs(e.x - P.x) < 40 && P.ground && seenFor(key + 's', 0.05)) { if (s.dodge && !roll(key + 'd', 0.5)) { out.dodge = true; out.gx = P.x - (e.face || 1) * 30; out.why = 'roll through the swing'; return out; }
      out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the swing'; return out; }
    if (seenFor(key)) { out.gx = edge; out.why = 'to the wall: the arc is high there'; return out; } }
  if (e.mode === 'rise') { out.gx = clamp(e.x + side * (SK.rise.r + 24)); out.why = 'he gets up: off him'; return out; }
  /* 7. HE HOOKS THE POINTS: hold them (strike POINTS in the tell) */
  if (levers && (e.mode === 'rehookTell' || e.mode === 'crownHookTell') && !S.held && mine('POINTS')) { const key = 'p' + S.act; if (seenFor(key, s.v2 ? 0.05 : PLAN2.react) && !roll(key + 'm', s.v2 ? 0 : PLAN2.missLever)) return strike('POINTS', 'hold the points: he hooks them'); }
  /* 8. OPEN: strike him */
  if (sky2Open(e)) { const sd = PYRO ? 30 : s.ranged ? Math.min(90, Math.max(40, dx)) : s.tip ? SK.w / 2 + s.tip : SK.w / 2 + Math.max(6, reach - 8); out.gx = clamp(e.x + side * sd);
    if (dx < sd + 10) swingAtHim(); out.why = 'strike him: ' + e.mode; return out; }
  /* 9. P3: CRANE when he will be in the arc as the skip comes through (the tell + half the sweep, a lead), then the wall */
  if (levers && L.CRANE === 'READY' && mine('CRANE')) { const tHit = SK.crane.tell + SK.crane.sweep / 2 + PLAN2.craneLead, px = predictX(e, S, tHit);
    if (px !== null && Math.abs(px - G.mid) < 60 && (sky2OnLow(e) || (e.mode === 'ride' && e.route === 'sky'))) { const key = 'cr' + Math.round(t * 2); if (!roll(key + 'm', s.v2 ? 0 : PLAN2.missLever)) return strike('CRANE', 'CRANE: he will be in the arc'); } }
  if (levers && L.CRANE === 'PAUSE' && s.ranged && mine('CRANE') && K.st === 'rest' && K.cycle < 0.6) return strike('CRANE', 'pause the runaway skip');
  /* 10. HE IS ON THE LOW LINE: WEIGHT if it is mine and ready; the rest hit him */
  if (sky2OnLow(e)) {
    if (levers && L.WEIGHT === 'READY' && mine('WEIGHT')) return strike('WEIGHT', 'WEIGHT: he is on the low line');
    const sd = s.ranged ? Math.min(110, Math.max(50, dx)) : SK.w / 2 + Math.max(6, reach - 8); out.gx = clamp(e.x + side * sd); if (dx < sd + 10 && (s.ranged || Math.abs(e.y - P.y) < 40)) swingAtHim(); out.why = 'cut him on the low line'; return out; }
  /* 11. HE IS OUT OF REACH: throw the POINTS (the lamp blinks) */
  if (levers && L.POINTS === 'SKY' && mine('POINTS')) return strike('POINTS', 'throw the points: he is out of reach');
  /* 12. on the floor (landed, climbing): a cut while he is in reach */
  if (['landed', 'climbTell', 'climb', 'drop'].includes(e.mode) && e.y > G.floorY - 30) { const sd = s.ranged ? 60 : SK.w / 2 + Math.max(6, reach - 8); out.gx = clamp(e.x + side * sd); if (dx < sd + 10) swingAtHim(); out.why = 'a cut while he is down here'; return out; }
  if (s.ranged && Math.abs(e.y - P.y) < 20 && dx < 200) { swingAtHim(); out.gx = P.x; out.why = 'a shot at him'; return out; }
  /* 13. WAIT: by the lever that is coming (WEIGHT when the points are set, else POINTS), not under the middle */
  const wait = levers ? (S.points === 'LOW' ? lev('WEIGHT') : lev('POINTS')) : null;
  if (wait) { out.gx = leverSpot(wait); out.face = Math.sign(wait.x - P.x) || 1; out.why = 'wait by ' + wait.id; return out; }
  out.gx = clamp(P.x < G.mid ? G.mid - 140 : G.mid + 140); out.why = 'wait'; return out;
}
