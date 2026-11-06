// src/five-seals-king.js - THE KING OF FIVE SEALS, THE KING'S PYRAMID's boss (claude/kingspyramid, 11-06, the OPUS GREYBOX). Pure: no DOM, no main.js (the world
// binding and the greybox drawing are src/kp-hands.js). Proved by tools/kings-pyramid.mjs. Brief: scratch/brief-kingspyramid.md (!! 10-13 DANIEL RESTRUCTURE),
// plan-desert-1105 s1.11 + s2 (boss rules) - built on the model in src/skeleton-king.js (the capstone, the altar mirror, the court, the storm), to today's rules.
//
// CENTRAL MECHANIC (B17): his tomb bears the same FIVE SEALS as your keys. Each phase wakes a seal, and THAT ROOM'S VERB is the opening:
//   P1 SUN (100-75%)          the capstone is open: strike the ALTAR / WALL MIRRORS to carry the sun down a column - the light on him = OPEN ("THE SUN BURNS HIM").
//   P2 FIRE + KEGS (75-50%)   he shuts the capstone (dark, braziers): throw a FIREBRAND (a brazier) or a LIT KEG (a rack) onto him = OPEN.
//   P3 SWITCHES + DEATHLESS (50-25%)  RAISE THE COURT (adds HERE ONLY, max 3: two DEATHLESS guards + a PRIEST who binds a switch) - all killed only by the PRESSES:
//                             the arena's two SPIKED PRESSES slide in from the walls along the floor (drawn as sliding presses, NOT pillars - plan s2) when you strike
//                             their switch (on the ledge over each lane); a press on him = OPEN ("THE PRESS PINS HIM").
//   P4 STORM (25-0%)          he tears the capstone off: sandstorm gusts (told), he is faster, EVERY seal live - any earlier verb opens him, ONE AT A TIME (a verb that
//                             just opened him rests until another verb has: "THE SUN WILL NOT TAKE HIM TWICE RUNNING"); the floor shudders and TOLD BOULDERS fall
//                             (the descent's callback) - BOULDERS ONLY HURT HEROES (never an opening: plan s2, no falling-object openings).
// ALWAYS (B15 / plan s2 / memory boss-resist-floor): GOLD ARMOUR x0.4 outside openings, never invulnerable (the seal transitions and the ward are x0.4 too);
// openings x2 (a purse, then x1 while it lasts); a told ~3 s WARD after each (B3: x0.4, nothing opens him); B10 the read = gold ring + timer + the word.
// TRANSITIONS: a seal cracks, its colour floods the room (a 2.2 s breather: nothing cast through it). EVERY MOVE TOLD (B16): its own windup pose, its own release
// pose, its own sound key; one windup at a time; picked by where you stand; never twice running. 9 told attacks over 4 phases (+ the boulders, a hazard).
import { trace } from './light.js';

/* THE ARENA (tiles from its west wall; rows over the floor). src/kings-pyramid.js carves it, the hands bind it */
export const KS_ARENA = {
  W: 56, roof: 21, capstone: 28, ledgeDy: 3, start: 40,
  ledges: [[3, 9], [25, 31], [47, 53]],                                                      /* three told ledges at 3 rows (the perches, the mirrors' and switches' footing) */
  mirrors: [{ id: 'altar', x: 28, dy: 5, state: '/' }, { id: 'west', x: 6, dy: 5, state: '\\' }, { id: 'east', x: 50, dy: 5, state: '/' }],   /* as built: the light wasted up */
  braziers: [14, 42], racks: [2, 53],                                                        /* P2 + P4: a firebrand at a brazier (E), a keg at a rack (E; one a rack, back 3 s after) */
  presses: [{ id: 'pressW', from: 0, to: 20, sw: 'swW' }, { id: 'pressE', from: 55, to: 35, sw: 'swE' }],   /* P3 + P4: the lanes (cols); 21..34 is the safe middle */
  switches: [{ id: 'swW', x: 5, dy: 4, press: 'pressW' }, { id: 'swE', x: 50, dy: 4, press: 'pressE' }],      /* on the wall ledges, over their own lane */
};
export const KS = {
  hp: 5600, w: 30, h: 50, markH: 62,
  armour: 0.4, openMul: 2, openT: 3.2, purse: 0.11, wardT: 3.0, sealT: 2.2, phaseAt: [0.75, 0.5, 0.25],
  walk: [0, 34, 38, 40, 54], cd: [0, 1.25, 1.15, 1.15, 0.95],                                 /* by phase (1..4) */
  /* THE MOVES: wind = the told windup, act = the release, rec = the recovery; mark '!' = block/parry it, '!!' = dodge it (unblockable); dmg; phase it arrives */
  moves: {
    hook:   { ph: 1, wind: 0.6, act: 0.25, rec: 0.5, mark: '!',  dmg: 38, reach: 60, pose: ['hookWind', 'hookRel'], sound: 'hook', answer: 'BLOCK IT (OR PARRY)' },
    sweep:  { ph: 1, wind: 0.7, act: 0.3, rec: 0.55, mark: '!!', dmg: 44, reach: 70, pose: ['sweepWind', 'sweepRel'], sound: 'sweep', answer: 'JUMP IT' },
    spikes: { ph: 1, wind: 0.9, act: 0.4, rec: 0.6, mark: '!!', dmg: 40, pose: ['spikesWind', 'spikesRel'], sound: 'spikes', answer: 'STEP OFF THE MARKED STONES' },
    urns:   { ph: 2, wind: 0.8, act: 0.6, rec: 0.6, mark: '!!', dmg: 30, pool: 2.0, poolDps: 18, pose: ['urnsWind', 'urnsRel'], sound: 'urns', answer: 'LEAVE THE MARKED SPOTS (THE FIRE LIES 2 S)' },
    court:  { ph: 3, rises: true,   /* (never picked: the court RISES with its seal - the P3 transition is its windup, each body rises 1 s, told) */
              wind: 1.2, act: 0.4, rec: 0.6, mark: '!!', dmg: 0, pose: ['courtWind', 'courtRel'], sound: 'court', answer: 'THE COURT: ONLY THE PRESSES KILL THEM' },
    flare:  { ph: 4, wind: 1.0, act: 0.3, rec: 0.6, mark: '!!', dmg: 34, pose: ['flareWind', 'flareRel'], sound: 'flare', answer: 'GET OUT OF THE BEAMS' },
    charge: { ph: 4, wind: 0.9, act: 0.9, rec: 0.7, mark: '!!', dmg: 46, v: 420, pose: ['chargeWind', 'chargeRel'], sound: 'charge', answer: 'JUMP IT OR TAKE A LEDGE' },
  },
  court: { guards: 2, priest: 1, guardV: 30, swipeWind: 0.6, swipeDmg: 22, swipeReach: 22, priestV: 34, bindWind: 1.0, bindT: 4.0, max: 3 },
  press: { tell: 0.7, slide: 0.3, hold: 0.8, back: 0.9, cd: 3.0, dmg: 40, h: 2 },
  storm: { every: 7.0, warn: 1.2, gust: 1.6, push: 60 },
  boulder: { every: 5.5, warn: 1.0, dmg: 30, w: 20 },
};
export const KS_SAY = {
  wake: 'THE KING OF FIVE SEALS WAKES',
  rule: 'HIS GOLD TURNS YOUR BLADE: WHAT OPENED EACH ROOM OPENS HIM',
  seal: ['', 'THE SEAL OF THE SUN', 'THE SEAL OF FIRE CRACKS: THE CAPSTONE SHUTS', 'THE SEAL OF THE SWITCHES CRACKS: THE COURT RISES', 'THE LAST SEALS CRACK: THE STORM COMES IN'],
  hint: ['', 'STRIKE THE MIRRORS: CARRY THE SUN ONTO HIM', 'THROW FIRE OR A LIT KEG ON HIM', 'LURE HIM INTO A LANE, STRIKE ITS SWITCH: THE PRESS PINS HIM', 'EVERY SEAL IS LIVE: SUN, FIRE, KEG, PRESS - ONE AT A TIME'],
  open: { mirror: 'THE SUN BURNS HIM', fire: 'THE FIRE TAKES HIS LINEN', keg: 'THE KEG BLOWS HIS GOLD OPEN', press: 'THE PRESS PINS HIM' },
  ward: 'HIS GOLD KNITS: WARDED',
  spent: 'THE SAME SEAL WILL NOT TAKE HIM TWICE RUNNING',
  bind: 'THE PRIEST BINDS THE SWITCH',
  turned: 'GOLD: x0.4',
};
/* which verbs open him, by phase */
export const VERBS = { 1: ['mirror'], 2: ['fire', 'keg'], 3: ['press'], 4: ['mirror', 'fire', 'keg', 'press'] };

/* the arena in px (from the hands: x0 = the arena's west wall column, floor = its floor row) */
export function geom(x0, floor, TS = 16) {
  const A = KS_ARENA, px = c => (x0 + c) * TS + TS / 2;
  return { TS, x0, floor, X0: x0 * TS, X1: (x0 + A.W) * TS, floorY: floor * TS, px, colOf: x => Math.floor(x / TS) - x0, ledgeY: (floor - A.ledgeDy) * TS };
}
/* the arena's own little tile map for the light (arena-local tile columns 0..W-1, rows 0..roof from the floor up: y = floor - dy) */
function arenaTile(G) {
  const A = KS_ARENA;
  return (x, y) => {
    const c = x - G.x0, dy = G.floor - y;
    if (c < 0 || c >= A.W) return 1;
    if (dy <= 0) return 1;                                                                   /* the floor */
    if (dy > A.roof) return c === A.capstone ? 0 : 1;                                        /* the roof (the capstone's hole) */
    if (dy === A.ledgeDy && A.ledges.some(([a, b]) => c >= a && c <= b)) return 2;           /* a ledge: light passes */
    return 0;
  };
}
export function newFight(G) {
  const A = KS_ARENA;
  return { G, ph: 1, mode: 'sleep', t: 0, cd: 1.4, last: null, cur: null, face: -1, x: G.px(A.start), y: G.floorY, hp: KS.hp, maxHp: KS.hp,
    open: 0, openKind: null, purse: 0, ward: 0, seal: 0, lastVerb: null, capstone: true, storm: false, dark: false,
    mirrors: A.mirrors.map(m => ({ ...m, tx: G.x0 + m.x, ty: G.floor - m.dy, cd: 0 })), light: null,
    presses: A.presses.map(p => ({ ...p, st: 'idle', t: 0, cd: 0 })), switches: A.switches.map(s => ({ ...s, lock: 0 })),
    court: [], spikes: null, urns: [], pools: [], charge: null, gust: { t: KS.storm.every, st: 'calm', dir: 1 }, boulders: [], boulderT: KS.boulder.every,
    racks: A.racks.map(c => ({ c, has: true, t: 0 })), told: {}, n: { opens: 0, byVerb: {}, moves: {}, hits: 0, courtKilled: 0, binds: 0, boulders: 0, gusts: 0 } };
}
export const ksOpen = S => S.open > 0;
export const ksBox = S => [S.x - KS.w / 2, S.x + KS.w / 2, S.y - KS.h, S.y];
const overlapX = (a0, a1, b0, b1) => a0 < b1 && a1 > b0;
/* THE LIGHT this moment (the capstone's sun via the mirrors), as light.js segments + lit tiles */
export function ksLight(S) {
  if (!S.capstone) return (S.light = null);
  const G = S.G, src = [{ x: G.x0 + KS_ARENA.capstone, y: G.floor - KS_ARENA.roof - 1, dir: 'S' }];
  return (S.light = trace(arenaTile(G), src, S.mirrors.map(m => ({ x: m.tx, y: m.ty, state: m.state })), [], { opaque: t => t === 1 }));
}
/* is a px box in the light (a lit tile it covers) */
export function litBox(S, [l, r, t, b]) {
  const L = S.light; if (!L) return false; const TS = S.G.TS;
  for (let ty = Math.floor(t / TS); ty <= Math.floor((b - 0.01) / TS); ty++) for (let tx = Math.floor(l / TS); tx <= Math.floor((r - 0.01) / TS); tx++) if (L.lit.has(tx + ',' + ty)) return true;
  return false;
}
/* the floor columns the light lands on (for the read, the bot and the tests) */
export function litFloorCols(S) { const out = []; if (!S.light) return out; for (let c = 0; c < KS_ARENA.W; c++) if (S.light.lit.has((S.G.x0 + c) + ',' + (S.G.floor - 1))) out.push(c); return out; }

/* ---------- THE OPENING ---------- */
function canOpen(S, verb) {
  if (S.open > 0 || S.ward > 0 || S.seal > 0 || ['sleep', 'wake', 'dead'].includes(S.mode)) return false;
  if (!VERBS[S.ph].includes(verb)) return false;
  if (S.ph === 4 && S.lastVerb === verb) return false;                                       /* one at a time: the same seal rests until another has opened him */
  return true;
}
export function openHim(S, verb, ev) {
  if (!canOpen(S, verb)) { if (S.ph === 4 && S.lastVerb === verb && S.open <= 0 && S.ward <= 0) ev.push({ t: 'say', text: KS_SAY.spent, col: '#9aa39a', once: 'spent' + S.n.opens }); return false; }
  S.open = KS.openT; S.openKind = verb; S.purse = KS.purse * S.maxHp; S.lastVerb = verb; S.cur = null; S.mode = 'open'; S.t = KS.openT; S.charge = null; S.spikes = null;
  S.n.opens++; S.n.byVerb[verb] = (S.n.byVerb[verb] || 0) + 1;
  ev.push({ t: 'open', verb, text: KS_SAY.open[verb], x: S.x }); return true;
}
/* THE BLOW: x2 open (a purse, then x1), x0.4 everywhere else - never 0 (B15) */
export function takeBlow(S, dmg) {
  if (dmg <= 0 || S.mode === 'dead') return [0, null];
  let d, word = null;
  if (S.open > 0) { const full = dmg * KS.openMul; if (S.purse > 0) { d = full; S.purse -= full; } else d = dmg; }   /* the purse spent, the rest of the opening is x1 */
  else { d = Math.max(1, dmg * KS.armour); word = S.ward > 0 ? 'WARDED' : S.seal > 0 ? 'THE SEAL HOLDS' : 'GOLD'; }
  d = Math.round(d); S.hp = Math.max(0, S.hp - d); S.n.hits++;
  return [d, word];
}
/* the room-verbs, from the world (the hands call these) */
export function ksThrown(S, kind, box, ev) { if (!overlapX(box[0], box[1], ...ksBox(S).slice(0, 2)) || box[2] > S.y || box[3] < S.y - KS.h) return false; return openHim(S, kind === 'keg' ? 'keg' : 'fire', ev); }
export function ksStrikeMirror(S, id) { const m = S.mirrors.find(q => q.id === id); if (!m || m.cd > 0) return null; m.state = m.state === '/' ? '\\' : '/'; m.cd = 0.3; ksLight(S); return m; }
export function ksStrikeSwitch(S, id, ev) {
  const sw = S.switches.find(q => q.id === id); if (!sw) return 'none';
  if (sw.lock > 0) { ev.push({ t: 'say', text: 'THE SWITCH IS BOUND', col: '#c8a0ff' }); return 'bound'; }
  if (S.ph < 3) return 'cold';                                                               /* the presses wake with their seal */
  const p = S.presses.find(q => q.id === sw.press); if (!p || p.st !== 'idle' || p.cd > 0) return 'busy';
  p.st = 'tell'; p.t = KS.press.tell; p.act = (p.act || 0) + 1; ev.push({ t: 'press', id: p.id, st: 'tell' }); return 'fired';
}
/* a press's box now (px): the floor band from its wall to how far it has come */
export function pressBox(S, p) {
  const G = S.G, k = p.st === 'slide' ? 1 - p.t / KS.press.slide : p.st === 'hold' ? 1 : p.st === 'back' ? p.t / KS.press.back : 0;
  if (k <= 0) return null;
  const a = G.px(p.from) - G.TS / 2, b = G.px(p.to) + G.TS / 2, dir = Math.sign(b - a), reach = Math.abs(b - a) * k;
  const l = dir > 0 ? a : a - reach + G.TS, r = dir > 0 ? a + reach : a + G.TS;
  return [Math.min(l, r), Math.max(l, r), G.floorY - KS.press.h * G.TS, G.floorY];
}
export const pressLane = (S, p) => { const G = S.G, a = G.px(p.from), b = G.px(p.to); return [Math.min(a, b) - G.TS / 2, Math.max(a, b) + G.TS / 2]; };

/* ---------- THE PICK: by where you stand, never twice running ---------- */
function pick(S, h) {
  const d = Math.abs(h.x - S.x), perch = h.y < S.G.floorY - S.G.TS * 1.5, pool = [];
  const have = id => KS.moves[id].ph <= S.ph && S.last !== id;
  if (!perch && d < 64) { if (have('hook')) pool.push('hook'); if (have('sweep')) pool.push('sweep'); }
  else if (!perch && d < 130) { for (const id of ['sweep', 'spikes', 'urns', 'charge']) if (have(id)) pool.push(id); }
  else { for (const id of ['spikes', 'urns', 'charge', 'flare']) if (have(id)) pool.push(id); }   /* far or perched: the anti-perch moves */
  if (S.ph >= 4 && S.capstone && have('flare') && !pool.includes('flare') && litFloorCols(S).length) pool.push('flare');
  if (!pool.length) for (const id of Object.keys(KS.moves)) if (have(id) && id !== 'court') pool.push(id);
  return pool.filter(id => id !== 'court');
}
const nearest = (S, heroes) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - S.x) - Math.abs(b.x - S.x))[0] || null;

/* ---------- ONE STEP. w = { heroes: [{ x, y, alive, ground, block, id }], rng } -> events ---------- */
export function ksStep(S, dt, w) {
  const ev = [], A = KS_ARENA, G = S.G, rng = w.rng || Math.random, h = nearest(S, w.heroes);
  for (const m of S.mirrors) m.cd = Math.max(0, m.cd - dt);
  for (const s of S.switches) s.lock = Math.max(0, s.lock - dt);
  if (S.mode === 'dead') return ev;
  if (S.mode === 'sleep') { if (h && Math.abs(h.x - S.x) < 26 * G.TS) { S.mode = 'wake'; S.t = 1.6; ev.push({ t: 'say', text: KS_SAY.wake, col: '#ffd36b' }); } ksLight(S); return ev; }
  if (S.hp <= 0) { S.mode = 'dead'; S.court = []; ev.push({ t: 'dead' }); return ev; }
  S.t -= dt;
  if (S.mode === 'wake') { if (S.t <= 0) { S.mode = 'walk'; S.cd = 1.0; ev.push({ t: 'say', text: KS_SAY.rule, col: '#ffd36b' }, { t: 'say', text: KS_SAY.hint[1], col: '#fff6c8' }); } ksLight(S); return ev; }
  /* THE PHASE: a seal cracks (not mid-opening: the opening is yours) */
  const frac = S.hp / S.maxHp, want = 1 + KS.phaseAt.filter(f => frac <= f).length;
  if (want > S.ph && S.open <= 0 && S.seal <= 0) { S.ph = S.ph + 1;   /* one seal at a time: a huge blow never skips a phase's set-up */ S.seal = KS.sealT; S.mode = 'seal'; S.cur = null; S.spikes = null; S.charge = null; S.ward = 0; S.lastVerb = null;
    ev.push({ t: 'seal', ph: S.ph, text: KS_SAY.seal[S.ph] }); }
  if (S.seal > 0) { S.seal -= dt; if (S.seal <= 0) { S.mode = 'walk'; S.cd = 0.8; phaseSetup(S, ev); ev.push({ t: 'say', text: KS_SAY.hint[S.ph], col: '#fff6c8' }); } ksLight(S); hazards(S, dt, w, ev); return ev; }
  /* THE OPENING runs out -> THE WARD (told) */
  if (S.open > 0) { S.open -= dt; if (S.open <= 0) { S.open = 0; S.openKind = null; S.ward = KS.wardT; S.mode = 'walk'; S.cd = Math.max(S.cd, 0.6); ev.push({ t: 'ward', text: KS_SAY.ward }); } }
  else if (S.ward > 0) S.ward = Math.max(0, S.ward - dt);
  ksLight(S);
  /* THE SUN on him (P1, P4): the instant */
  if (S.open <= 0 && litBox(S, ksBox(S))) openHim(S, 'mirror', ev);
  /* THE MOVE */
  if (S.open <= 0 && h) {
    if (S.cur) runMove(S, dt, h, w, ev);
    else if (S.mode === 'walk') {
      const d = h.x - S.x; S.face = Math.sign(d) || S.face;
      if (Math.abs(d) > 40) S.x = clampX(S, S.x + S.face * KS.walk[S.ph] * dt);
      S.cd -= dt;
      if (S.cd <= 0) { const pool = pick(S, h); if (pool.length) { const id = pool[Math.floor(rng() * pool.length) % pool.length]; startMove(S, id, h, ev); } else S.cd = 0.3; }
    }
  }
  hazards(S, dt, w, ev);
  return ev;
}
const clampX = (S, x) => Math.max(S.G.X0 + KS.w / 2 + 4, Math.min(S.G.X1 - KS.w / 2 - 4, x));
function phaseSetup(S, ev) {
  const G = S.G;
  if (S.ph === 2) { S.capstone = false; S.dark = true; ev.push({ t: 'dark' }); }
  if (S.ph === 3) {                                                                          /* RAISE THE COURT: adds here only, max 3 */
    S.court = [];
    for (let i = 0; i < KS.court.guards; i++) S.court.push({ kind: 'guard', x: G.px(i ? 46 : 10), y: G.floorY, st: 'rise', t: 1.0, alive: true, face: -1 });
    for (let i = 0; i < KS.court.priest; i++) S.court.push({ kind: 'priest', x: G.px(28), y: G.floorY, st: 'rise', t: 1.0, alive: true, face: -1, target: null });
    ev.push({ t: 'court', n: S.court.length, text: 'THE COURT RISES: ONLY THE PRESSES KILL THEM' });
  }
  if (S.ph === 4) { S.capstone = true; S.dark = false; S.storm = true; ev.push({ t: 'storm' }); }
}
function startMove(S, id, h, ev) {
  const M = KS.moves[id]; S.cur = { id, st: 'wind', t: M.wind }; S.last = id; S.n.moves[id] = (S.n.moves[id] || 0) + 1;
  if (id === 'spikes') S.spikes = [-1, 0, 1].map(k => S.G.colOf(h.x) + k).map(c => ({ c, perch: h.y < S.G.floorY - S.G.TS * 1.5 }));
  if (id === 'urns') S.urnMarks = [-3, 0, 3].map(k => Math.max(1, Math.min(KS_ARENA.W - 2, S.G.colOf(h.x) + k)));
  if (id === 'charge') S.charge = { dir: Math.sign(h.x - S.x) || S.face, x0: S.x };
  ev.push({ t: 'tell', id, mark: M.mark, pose: M.pose[0], sound: M.sound + 'Wind', answer: M.answer, ...(S.spikes && id === 'spikes' ? { cols: S.spikes.map(s => s.c) } : {}), ...(id === 'urns' ? { cols: S.urnMarks.slice() } : {}) });
}
function runMove(S, dt, h, w, ev) {
  const c = S.cur, M = KS.moves[c.id], G = S.G; c.t -= dt;
  if (c.st === 'wind' && c.t <= 0) {
    c.st = 'act'; c.t = M.act; ev.push({ t: 'release', id: c.id, pose: M.pose[1], sound: M.sound });
    const f = S.face;
    if (c.id === 'hook') ev.push({ t: 'hit', id: 'hook', name: 'THE CROOK HOOK', box: [f > 0 ? S.x : S.x - M.reach, f > 0 ? S.x + M.reach : S.x, S.y - 34, S.y - 6], dmg: M.dmg, blockable: true, pull: f });
    if (c.id === 'sweep') ev.push({ t: 'hit', id: 'sweep', name: 'THE FLAIL SWEEP', box: [S.x - M.reach, S.x + M.reach, S.y - 12, S.y], dmg: M.dmg, blockable: false });
    if (c.id === 'spikes') { for (const s of S.spikes) { const y = s.perch ? G.ledgeY : G.floorY; ev.push({ t: 'hit', id: 'spikes', name: 'THE SAND SPIKES', box: [G.px(s.c) - 8, G.px(s.c) + 8, y - 20, y], dmg: M.dmg, blockable: false }); } S.spikes = null; }
    if (c.id === 'urns') { for (const col of S.urnMarks) { ev.push({ t: 'hit', id: 'urns', name: 'THE URN VOLLEY', box: [G.px(col) - 10, G.px(col) + 10, G.floorY - 20, G.floorY], dmg: M.dmg, blockable: false }); S.pools.push({ c: col, t: M.pool }); } }
    if (c.id === 'flare' && S.light) ev.push({ t: 'flare', name: 'THE SUN FLARE', dmg: M.dmg });   /* the hands hurt whoever stands in a lit tile (src/kp-hands.js) */
    if (c.id === 'court') { /* (the court rises in phaseSetup; kept as a move so a P3 re-raise stays told) */ }
  }
  if (c.st === 'act') {
    if (c.id === 'charge' && S.charge) { S.x = clampX(S, S.x + S.charge.dir * M.v * dt); ev.push({ t: 'hit', id: 'charge', name: 'THE STORM CHARGE', box: [S.x - KS.w / 2 - 6, S.x + KS.w / 2 + 6, S.y - 30, S.y], dmg: M.dmg, blockable: false, once: 'charge' + S.n.moves.charge });
      if (S.x <= S.G.X0 + KS.w / 2 + 5 || S.x >= S.G.X1 - KS.w / 2 - 5) c.t = 0; }
    if (c.t <= 0) { c.st = 'rec'; c.t = M.rec; S.charge = null; }
  }
  if (c.st === 'rec' && c.t <= 0) { S.cur = null; S.mode = 'walk'; S.cd = KS.cd[S.ph]; }
}
/* ---------- the arena's own pieces: presses, the court, the urns' fire, the storm, the boulders ---------- */
function hazards(S, dt, w, ev) {
  const P = KS.press, G = S.G;
  for (const pl of S.pools) pl.t -= dt; S.pools = S.pools.filter(p => p.t > 0);
  for (const pl of S.pools) ev.push({ t: 'hit', id: 'pool', name: 'THE URN FIRE', box: [G.px(pl.c) - 10, G.px(pl.c) + 10, G.floorY - 10, G.floorY], dmg: KS.moves.urns.poolDps * dt, blockable: false, tick: true });
  for (const r of S.racks) if (!r.has) { r.t -= dt; if (r.t <= 0) r.has = true; }
  /* THE PRESSES: tell -> slide -> hold -> back -> rest */
  for (const p of S.presses) {
    p.cd = Math.max(0, p.cd - dt); if (p.st === 'idle') continue; p.t -= dt;
    if (p.st === 'tell' && p.t <= 0) { p.st = 'slide'; p.t = P.slide; ev.push({ t: 'press', id: p.id, st: 'slide' }); }
    else if (p.st === 'slide' && p.t <= 0) { p.st = 'hold'; p.t = P.hold; }
    else if (p.st === 'hold' && p.t <= 0) { p.st = 'back'; p.t = P.back; }
    else if (p.st === 'back' && p.t <= 0) { p.st = 'idle'; p.cd = P.cd; p.hitKing = false; }
    const b = pressBox(S, p);
    if (b && (p.st === 'slide' || p.st === 'hold')) {
      const kb = ksBox(S); if (!p.hitKing && overlapX(b[0], b[1], kb[0], kb[1])) { p.hitKing = true; openHim(S, 'press', ev); }
      for (const q of S.court) if (q.alive && q.st !== 'rise' && q.x > b[0] && q.x < b[1]) { q.alive = false; S.n.courtKilled++; ev.push({ t: 'crushed', kind: q.kind, x: q.x, text: q.kind === 'priest' ? 'THE PRESS TAKES THE PRIEST' : 'THE PRESS TAKES THE DEATHLESS' }); }
      ev.push({ t: 'hit', id: 'press', name: 'THE PRESS', box: b, dmg: P.dmg, blockable: false, once: p.id + ':' + p.act, shove: p.from < p.to ? 1 : -1 });
    }
  }
  /* THE COURT (P3 on): two deathless guards walk to you and swipe (told); the priest walks to a switch and BINDS it (told) */
  for (const q of S.court) {
    if (!q.alive) continue; q.t -= dt;
    if (q.st === 'rise') { if (q.t <= 0) { q.st = 'walk'; q.t = 0; } continue; }
    if (q.kind === 'guard') {
      const hh = nearest({ x: q.x }, w.heroes); if (!hh) continue; const d = hh.x - q.x; q.face = Math.sign(d) || q.face;
      if (q.st === 'walk') { if (Math.abs(d) > KS.court.swipeReach) q.x = clampX(S, q.x + q.face * KS.court.guardV * dt); else { q.st = 'wind'; q.t = KS.court.swipeWind; ev.push({ t: 'courtTell', kind: 'guard', x: q.x, mark: '!' }); } }
      else if (q.st === 'wind' && q.t <= 0) { q.st = 'rec'; q.t = 0.8; ev.push({ t: 'hit', id: 'courtSwipe', name: 'THE DEATHLESS', box: [q.x + (q.face > 0 ? 0 : -KS.court.swipeReach - 6), q.x + (q.face > 0 ? KS.court.swipeReach + 6 : 0), G.floorY - 26, G.floorY], dmg: KS.court.swipeDmg, blockable: true }); }
      else if (q.st === 'rec' && q.t <= 0) q.st = 'walk';
    } else {
      if (!q.target) { const free = S.switches.filter(s => s.lock <= 0); q.target = free.length ? free[Math.floor((w.rng || Math.random)() * free.length) % free.length].id : null; }
      const sw = S.switches.find(s => s.id === q.target); if (!sw) { q.target = null; continue; }
      const tx = G.px(sw.x), d = tx - q.x; q.face = Math.sign(d) || q.face;
      if (q.st === 'walk') { if (Math.abs(d) > 6) q.x = clampX(S, q.x + q.face * KS.court.priestV * dt); else { q.st = 'bind'; q.t = KS.court.bindWind; ev.push({ t: 'courtTell', kind: 'priest', x: q.x, mark: '!!', text: 'THE PRIEST REACHES FOR THE SWITCH' }); } }
      else if (q.st === 'bind' && q.t <= 0) { sw.lock = KS.court.bindT; S.n.binds++; q.st = 'walk'; q.target = null; ev.push({ t: 'say', text: KS_SAY.bind, col: '#c8a0ff', x: tx }); }
    }
  }
  S.court = S.court.filter(q => q.alive);
  /* THE STORM (P4): told gusts */
  if (S.storm) { const g = S.gust; g.t -= dt;
    if (g.st === 'calm' && g.t <= KS.storm.warn) { g.st = 'warn'; g.dir = (w.rng || Math.random)() < 0.5 ? -1 : 1; ev.push({ t: 'gustWarn', dir: g.dir }); }
    else if (g.st === 'warn' && g.t <= 0) { g.st = 'gust'; g.t = KS.storm.gust; S.n.gusts++; ev.push({ t: 'gust', dir: g.dir }); }
    else if (g.st === 'gust') { ev.push({ t: 'push', dir: g.dir, v: KS.storm.push }); if (g.t <= 0) { g.st = 'calm'; g.t = KS.storm.every; } }
    /* THE BOULDERS: told (a ring + dust) at a hero's column, then the stone - they only ever hurt heroes */
    S.boulderT -= dt;
    if (S.boulderT <= 0 && w.heroes.some(x => x.alive)) { const hh = w.heroes.filter(x => x.alive)[0]; S.boulders.push({ x: Math.max(G.X0 + 12, Math.min(G.X1 - 12, hh.x)), t: KS.boulder.warn }); S.boulderT = KS.boulder.every; ev.push({ t: 'boulderWarn', x: hh.x }); }
    for (const b of S.boulders) { b.t -= dt; if (b.t <= 0 && !b.done) { b.done = true; S.n.boulders++; ev.push({ t: 'hit', id: 'boulder', name: 'THE FALLING STONE', box: [b.x - KS.boulder.w / 2, b.x + KS.boulder.w / 2, G.floorY - 40, G.floorY], dmg: KS.boulder.dmg, blockable: false, heroesOnly: true }); } }
    S.boulders = S.boulders.filter(b => !b.done || b.t > -0.4);
  }
}

/* ---------- THE HUMAN BOT (the lab / the node toy): what a player who has learned the rule does now. -> { goX, act, id } ---------- */
export function ksPlan(S, h) {
  const G = S.G, A = KS_ARENA;
  if (S.mode === 'sleep' || S.mode === 'wake' || S.seal > 0) return { goX: G.px(22), act: 'wait' };
  if (S.open > 0) return { goX: S.x - Math.sign(S.x - h.x || 1) * 24, act: 'attack' };
  if (S.cur && KS.moves[S.cur.id].mark === '!' && S.cur.st === 'wind') return { goX: h.x, act: 'block' };
  if (S.cur && S.cur.st === 'wind') return { goX: h.x + (h.x < S.x ? -60 : 60), act: 'dodge' };
  const can = v => VERBS[S.ph].includes(v) && !(S.ph === 4 && S.lastVerb === v) && S.ward <= 0;
  /* THE SUN: turn the mirrors so a column is lit on HIS side, then stand past it so his walk crosses it */
  if (can('mirror') && S.capstone) {
    const cols = litFloorCols(S);
    if (!cols.length) { const side = S.x < G.px(28) ? 'west' : 'east', m = S.mirrors.find(q => q.id === side), alt = S.mirrors.find(q => q.id === 'altar');
      const wantAlt = side === 'west' ? '/' : '\\', wantWall = side === 'west' ? '/' : '\\';
      if (alt.state !== wantAlt) return { goX: G.px(alt.x), act: 'turn', id: 'altar', perch: true };
      if (m.state !== wantWall) return { goX: G.px(m.x), act: 'turn', id: m.id, perch: true }; }
    else { const c = G.px(cols[0]); return { goX: c + (S.x > c ? -40 : 40), act: 'lure' }; }
  }
  if ((can('keg') || can('fire'))) { if (!h.carry) { const r = S.racks.find(q => q.has); const b = A.braziers[0]; return r && can('keg') ? { goX: G.px(r.c), act: 'take', id: 'rack' } : { goX: G.px(b), act: 'take', id: 'brazier' }; }
    return { goX: S.x + (h.x < S.x ? -90 : 90), act: 'throw' }; }
  if (can('press')) { const p = S.presses.find(q => { const [l, r] = pressLane(S, q); return S.x > l && S.x < r; }), sw = p && S.switches.find(s => s.press === p.id);
    if (p && sw && p.st === 'idle' && p.cd <= 0 && sw.lock <= 0) return { goX: G.px(sw.x), act: 'switch', id: sw.id, perch: true };
    const lure = S.presses[(S.n.opens) % 2], swl = S.switches.find(s => s.press === lure.id); return { goX: G.px(swl.x), act: 'lure', perch: true }; }
  return { goX: S.x + (h.x < S.x ? -50 : 50), act: 'attack' };
}
