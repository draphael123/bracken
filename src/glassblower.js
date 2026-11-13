// src/glassblower.js - THE GLASSBLOWER, BURIED CITY 5's MINI (claude/bc5, 11-10, the SONNET code lane). Pure: no DOM, no main.js, no imports but buried-city5.js's words;
// src/glassblower-hands.js binds it. Sources: scratch/lane-reports/desert-next-plan.md s5 (the Opus plan, all recs accepted 11-10), brief-newminis-1015 (!! 10-15 DANIEL
// APPROVED THE KITS: four told attacks + the level-verb opening; lanes tune numbers, never swap moves), brief-buriedcity5-1014.
//
// WHO: the keeper of the Glass Works' kilns - a broad man in a scorched leather apron, a long BLOWPIPE in his hands and a molten gather on its end, in THE GLASSBLOWER'S HALL
//   (columns 389-407, the Glass Works' floor) between two kiln stubs and two of the city's hourglasses. THE RULE IS THE LEVEL'S: A STRUCK GLASS RUNS THE SAND BACKWARD.
// HIS KIT (each told: its own windup + release pose, its own sound, a mark):
//   1 MOLTEN GOB     '!'  he swings the pipe and LOBS a gather of molten glass to a marked spot: it HARDENS into a glass spike (hot: it burns whoever stands on it) and, cooled,
//                    is a brief one-row STEP you can use. MOVE OFF the mark.
//   2 BLOWPIPE BLAST '!!' he puts the pipe to his mouth: a cone of scalding sand along the floor. A KILN STUB between you and him stops it (the cone ends on the stub); or ROLL.
//   3 FLIP THE GLASS '!!' he turns an hourglass: the sand UNDER YOU rises or sinks (the hall's own risers and sinkers run on his glass for its dur) - reposition, or ride it.
//                    And the glass he turned GLINTS for GB.glintT s: that is his opening.
//   4 SHATTER BULB   '!'  (phase two) he smashes a glass bulb: a fan of shards, two low, two chest-high - JUMP the low, BLOCK the high.
// HIS OPENING (the level's verb): STRIKE HIS HOURGLASS WHILE IT GLINTS - its sand runs back and BURIES HIM TO THE WAIST: OPEN x GB.openMul for GB.openT s (a gold ring and a timer,
//   B10), at most GB.openCap of him a window; then a told GB.wardT s ward (B3). Struck when it does not glint, a glass only says IT HOLDS (told once): never a punishment.
// THE FLOOR (B15/B13): outside the opening his leather apron and the kiln's heat take a blow at GB.rest (0.5x) - never invulnerable; in the ward at GB.floor (0.4x).
// PHASES: P1 (100-50%) gob / blast / flip; P2 (50-0%) + SHATTER BULB and a SECOND glass he turns in turn (the one he just turned glints; the other is dull).
// MINI BAND (plan s5): 70-80% WITH flasks, mash 0/6, 60-120 s - the tune lane's (browser). The toy duel in tools/buried-city5.mjs is a flow sim, not the rate.
import { BC5_SAY } from './buried-city5.js';

export const GB = {
  hp: 1500, w: 18, h: 30, markH: 46,
  rest: 0.5, floor: 0.4, openMul: 1.75, openT: 3.5, openCap: 0.14, wardT: 2.0, glintT: 7.0, staggerT: 0.5,
  walk: 50, keep: 44, turn: 0.45, gap: [1.0, 0.8],
  gobTell: 0.85, gobFly: 0.7, gobHot: 2.4, gobStep: 3.0, gobR: 7, gobH: 22,
  blastTell: 0.95, blastT: 0.45, blastLen: 124, blastH: 26,
  flipTell: 1.0, flipT: 0.4,
  bulbTell: 0.8, bulbV: 150, bulbLife: 1.5, bulbR: 4, bulbLow: 4, bulbHigh: 14, bulbHit: 2,
  p2: 0.5,
  dmg: { gob: 26, blast: 36, bulb: 24, spike: 14 },
};
export const MOVES = {
  gobTell: { mark: '!', answer: 'move', pose: ['gbGobWind', 'gbGobRel'], sound: 'lob' },
  blastTell: { mark: '!!', answer: 'roll', pose: ['gbBlastWind', 'gbBlastRel'], sound: 'blast' },
  flipTell: { mark: '!!', answer: 'move', pose: ['gbFlipWind', 'gbFlipRel'], sound: 'flip' },
  bulbTell: { mark: '!', answer: 'block', pose: ['gbBulbWind', 'gbBulbRel'], sound: 'shatter' },
};
export const MOVE_NAME = { gob: 'THE MOLTEN GOB', blast: 'THE BLOWPIPE', bulb: 'THE SHATTERED BULB', spike: 'HOT GLASS' };
export const NEW_MOVES = { 1: ['gob', 'blast', 'flip'], 2: ['bulb'] };
export const CYCLES = {
  1: [['gob', 'blast', 'flip'], ['blast', 'gob', 'flip'], ['gob', 'flip', 'blast']],
  2: [['bulb', 'flip', 'blast', 'gob'], ['gob', 'bulb', 'flip', 'blast'], ['blast', 'flip', 'bulb', 'gob']],
};

/* ---------- THE HALL (local columns 0..W-1 from the west edge sx; floor surface row R, he stands on R-1). The east wall at col W is the mini's portcullis; the west
   wall is the high kiln's pillar (the way in is a DROP off the kiln, the shrine is behind you: the stub covers, the sinkers, risers and the two glasses stand on the floor) ---------- */
export const GB_STAGE = { sx: 389, W: 18, R: 32, him: 14,
  heroFrom: 0, him0: 11,                                     /* he keeps to the east of local col 11 (the stubs stand between the dropped hero and him) */
  sink: [{ glass: 'gb', c: [2, 4] }, { glass: 'gb2', c: [15, 17] }],   /* footing that sinks while his glass runs (two rows: a hole a body climbs out of) */
  cover: [[5, 6], [10, 11]],                                   /* the kiln stubs (solid, three rows, a told cover from the blowpipe) */
  glass: [{ id: 'gb', c: 7, dur: 6 }, { id: 'gb2', c: 12, dur: 6 }],
  riser: [{ glass: 'gb', c: [8, 9], top: 30, rows: 2 }, { glass: 'gb2', c: [13, 14], top: 30, rows: 2 }] };
export function gbGeom(M, TS = 16) {
  const q = M.gb, S = GB_STAGE, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, minX: X(S.him0), maxX: X(S.W) - 14,
    covers: S.cover.map(([a, b]) => [X(a), X(b + 1)]), glasses: S.glass.map(g => ({ id: g.id, x: X(g.c) + 8 })), cols: { x0: q.sx, R: q.R } };
}

/* ---------- ONE FIGHT ---------- */
export function newGlassFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, behindT: 0, stagger: 0, gobs: [], shards: [], blast: null, mark: null, glint: null, lastGlass: 'gb', told: {},
    n: { cycles: 0, opens: 0, glints: 0, glintsMissed: 0, strikesDull: 0, staggers: 0, gobs: 0, gobsHit: 0, blasts: 0, blastsCovered: 0, flips: 0, bulbs: 0, wards: 0, warded: 0, rested: 0, steps: 0, moves: {} } };
}
export const gPhase = e => (e.hp <= e.maxHp * GB.p2 ? 2 : 1);
export const gbOpen = e => !!e && e.mode === 'buried' && (e.open || 0) > 0;
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.minX, Math.min(G.maxX, x));
function tell(e, F, c, mode, t) { setMode(e, mode, t); F.act++; F.n.moves[mode] = (F.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; e.pose = mv.pose[0]; c.mark(mv.mark); c.sound(mv.mark === '!!' ? 'tellHard' : 'tell'); }
const nextScript = F => { const set = CYCLES[F.ph]; return set[F.cycle % set.length].slice(); };
/* which glass he turns now: P1 the first; P2 in turn (the one he did NOT turn last) */
const glassFor = F => (F.ph === 2 ? (F.lastGlass === 'gb' ? 'gb2' : 'gb') : 'gb');

/* A HERO STRUCK A GLASS (the hands: the flip's hook). Returns 'open' | 'dull' | 'busy' */
export function hourStruck(e, F, c, id) {
  if (!e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (gbOpen(e) || F.ward > 0) return 'busy';   /* one opening at a time */
  if (!F.glint || F.glint.t <= 0 || F.glint.id !== id) { F.n.strikesDull++; if (!F.told.dull) { F.told.dull = 1; c.number(e.x, e.y - 60, BC5_SAY.gbNotYet, '#ffd36b'); } return 'dull'; }
  /* THE OPENING: the sand runs back and buries him to the waist */
  F.glint = null; F.mark = null; F.blast = null; F.gobs = F.gobs.filter(g => g.cooled);
  setMode(e, 'buried', GB.openT + 0.05); e.open = GB.openT; e.openT0 = GB.openT; F.openTaken = 0; F.n.opens++; e.pose = 'gbBuried';
  c.fx('open', e.x, e.y); c.sound('clank'); c.number(e.x, e.y - 70, BC5_SAY.gbOpen, '#8fd160');
  return 'open';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, ducking, pp }]; c = the world:
   c.hit(box, dmg, name, o) -> landed   o: { key, low (a jump clears it), duck (a duck clears it), blockable, roll }
   c.number  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.flip(glassId)  (he turns his glass: the hall's risers and sinkers run)   c.step(x, on)  (a cooled gob is a one-row step) ---------- */
export function stepGlassblower(e, F, dt, h, c) {
  const G = F.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (F.ward > 0) F.ward = Math.max(0, F.ward - dt); e.ward = F.ward;
  if (F.glint) { F.glint.t -= dt; if (F.glint.t <= 0) { F.n.glintsMissed++; F.glint = null; } }
  e.glint = F.glint ? F.glint.id : null;
  stepGobs(e, F, dt, c); stepShards(e, F, dt, c); if (F.blast) stepBlast(e, F, dt, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { F.script = nextScript(F); F.step = 0; setMode(e, 'walk', 0.6); } return; }
  if (F.stagger > 0) { F.stagger -= dt; if (!gbOpen(e)) { e.pose = 'gbStagger'; return; } }
  const want = gPhase(e);
  if (want > F.ph && !gbOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    F.ph = want; F.cycle = 0; F.step = 0; F.script = null; e.phase = want; c.music(want);
    c.number(e.x, e.y - 70, BC5_SAY.gbP2, '#ff9a5c'); c.sound('tellHard'); setMode(e, 'recover', 0.8); return; }
  switch (e.mode) {
    case 'buried': if (e.open <= 0) { e.open = 0; F.ward = GB.wardT; F.n.wards++; c.number(e.x, e.y - 66, BC5_SAY.gbWard, '#9ab0c0'); c.fx('ward', e.x, e.y); setMode(e, 'recover', 0.5); } return;
    case 'recover': e.pose = 'gbIdle'; if (e.modeT <= 0) nextMove(e, F, P, c); return;
    case 'walk': { e.pose = 'gbWalk'; const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { F.behindT += dt; if (F.behindT > GB.turn) { e.face = Math.sign(d) || e.face; F.behindT = 0; } } else F.behindT = 0;
      if (Math.abs(d) > GB.keep) e.x = clampX(G, e.x + Math.sign(d) * GB.walk * dt); else if (Math.abs(d) < GB.keep * 0.6) e.x = clampX(G, e.x - Math.sign(d) * GB.walk * 0.7 * dt);
      if (e.modeT <= 0) nextMove(e, F, P, c); return; }
  }
  stepMove(e, F, dt, P, c);
}
function nextMove(e, F, P, c) {
  if (F.blast || F.shards.length > 2) { setMode(e, 'walk', 0.15); return; }   /* one windup at a time */
  if (!F.script || F.step >= F.script.length) { F.cycle++; F.n.cycles++; F.script = nextScript(F); F.step = 0; }
  const m = F.script[F.step++]; e.face = Math.sign(P.x - e.x) || e.face;
  switch (m) {
    case 'gob': { tell(e, F, c, 'gobTell', GB.gobTell); F.mark = { x: clampMark(F.G, P.x), key: 'gob' + F.act }; if (!F.told.gob) { F.told.gob = 1; c.number(e.x, e.y - 60, BC5_SAY.gbGob, '#ffd36b'); } return; }
    case 'blast': tell(e, F, c, 'blastTell', GB.blastTell); if (!F.told.blast) { F.told.blast = 1; c.number(e.x, e.y - 60, BC5_SAY.gbBlast, '#ff6b6b'); } return;
    case 'flip': tell(e, F, c, 'flipTell', GB.flipTell); F.flipGlass = glassFor(F); if (!F.told.flip) { F.told.flip = 1; c.number(e.x, e.y - 60, BC5_SAY.gbFlip, '#ffd36b'); } return;
    case 'bulb': tell(e, F, c, 'bulbTell', GB.bulbTell); if (!F.told.bulb) { F.told.bulb = 1; c.number(e.x, e.y - 60, BC5_SAY.gbBulb, '#ffd36b'); } return;
  }
  setMode(e, 'walk', 0.5);
}
const clampMark = (G, x) => Math.max(G.x0 + 24, Math.min(G.x1 - 24, x));
function stepMove(e, F, dt, P, c) {
  const G = F.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? GB.gap[F.ph - 1]);
  switch (e.mode) {
    case 'gobTell': if (e.modeT <= 0) { e.pose = MOVES.gobTell.pose[1]; setMode(e, 'gobThrow', 0.3); F.n.gobs++; c.sound('lob');
        const mk = F.mark || { x: clampMark(G, P.x), key: 'gob' + F.act }; F.gobs.push({ x0: e.x + f * 10, x: e.x + f * 10, tx: mk.x, t: GB.gobFly, fly: true, hot: 0, cool: 0, key: mk.key, cooled: false, hit: false }); } return;
    case 'gobThrow': if (e.modeT <= 0) { F.mark = null; after(); } return;
    case 'blastTell': if (e.modeT <= 0) { e.pose = MOVES.blastTell.pose[1]; setMode(e, 'blastGo', GB.blastT); F.n.blasts++; c.sound('blast'); c.shake(2);
        F.blast = { dir: f, x: e.x, t: GB.blastT, key: 'blast' + F.act, len: GB.blastLen, covered: false }; } return;
    case 'blastGo': if (e.modeT <= 0) { F.blast = null; after(); } return;
    case 'flipTell': if (e.modeT <= 0) { e.pose = MOVES.flipTell.pose[1]; setMode(e, 'flipGo', GB.flipT); F.n.flips++; c.sound('flip'); c.shake(2);
        const id = F.flipGlass || 'gb'; F.lastGlass = id; c.flip(id); F.glint = { id, t: GB.glintT }; F.n.glints++;
        c.number(e.x, e.y - 60, BC5_SAY.gbGlint, '#8fd160'); } return;
    case 'flipGo': if (e.modeT <= 0) after(0.7); return;
    case 'bulbTell': if (e.modeT <= 0) { e.pose = MOVES.bulbTell.pose[1]; setMode(e, 'bulbGo', 0.3); F.n.bulbs++; c.sound('shatter'); c.shake(3); c.fx('shatter', e.x, G.floorY);
        const k = 'bulb' + F.act; F.shards.push(
          { x: e.x, dir: f, y: G.floorY - GB.bulbLow, ht: 'low', t: GB.bulbLife, key: k + 'a' }, { x: e.x, dir: f, y: G.floorY - GB.bulbHigh, ht: 'high', t: GB.bulbLife, key: k + 'b' },
          { x: e.x, dir: -f, y: G.floorY - GB.bulbHigh, ht: 'high', t: GB.bulbLife, key: k + 'c' }, { x: e.x, dir: -f, y: G.floorY - GB.bulbLow, ht: 'low', t: GB.bulbLife, key: k + 'd' }); } return;
    case 'bulbGo': if (e.modeT <= 0) after(); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE GOB: it flies to its mark, lands, is HOT (a glass spike: burns whoever stands in it) GB.gobHot s, then COOLED (a one-row step) GB.gobStep s, then gone */
function stepGobs(e, F, dt, c) {
  const G = F.G;
  for (const g of F.gobs) {
    if (g.fly) { g.t -= dt; const k = 1 - Math.max(0, g.t) / GB.gobFly; g.x = g.x0 + (g.tx - g.x0) * k; g.y = G.floorY - 10 - Math.sin(Math.PI * k) * 46;
      if (g.t <= 0) { g.fly = false; g.x = g.tx; g.hot = GB.gobHot; c.fx('gob', g.x, G.floorY); c.sound('shatter'); } continue; }
    if (g.hot > 0) { g.hot -= dt; c.hit([g.x - GB.gobR, g.x + GB.gobR, G.floorY - GB.gobH, G.floorY + 2], GB.dmg.gob, MOVE_NAME.gob, { key: g.key, blockable: false }); F.n.gobsHit += 0;
      if (g.hot <= 0) { g.cooled = true; g.cool = GB.gobStep; F.n.steps++; if (c.step) c.step(g.x, true); if (!F.told.cooled) { F.told.cooled = 1; c.number(g.x, G.floorY - 30, 'IT COOLS: A STEP', '#8fd160'); } } continue; }
    if (g.cooled) { g.cool -= dt; if (g.cool <= 0) { g.dead = true; if (c.step) c.step(g.x, false); } }
  }
  F.gobs = F.gobs.filter(g => !g.dead);
}
/* THE BLAST: a cone of scalding sand along the floor in front of him for GB.blastT s; a KILN STUB in its path stops it (the cone ends on the stub's face) */
function stepBlast(e, F, dt, c) {
  const B = F.blast, G = F.G; B.t -= dt; const x0 = e.x + B.dir * 8; let far = x0 + B.dir * B.len;
  for (const [a, b] of G.covers) { const face = B.dir > 0 ? a : b; if ((B.dir > 0 && face > x0 && face < far) || (B.dir < 0 && face < x0 && face > far)) { far = face; B.covered = true; } }
  B.x = x0; B.far = far;
  c.hit([Math.min(x0, far), Math.max(x0, far), G.floorY - GB.blastH, G.floorY + 2], GB.dmg.blast, MOVE_NAME.blast, { key: B.key, roll: true });
}
/* THE SHARDS: low ones along the floor (JUMP), chest-high ones (BLOCK) */
function stepShards(e, F, dt, c) {
  if (!F.shards.length) return; const G = F.G;
  for (const s of F.shards) { s.t -= dt; s.x += s.dir * GB.bulbV * dt;
    c.hit([s.x - GB.bulbR, s.x + GB.bulbR, s.y - GB.bulbR, s.y + GB.bulbR], GB.dmg.bulb, MOVE_NAME.bulb, { key: s.key, blockable: true, low: s.ht === 'low' });
    if (s.x < G.x0 + 4 || s.x > G.x1 - 4) s.t = 0; }
  F.shards = F.shards.filter(s => s.t > 0);
}
/* A BLOW ON HIM: buried x openMul (a window holds openCap of him); warded x floor; otherwise his apron x rest - never 0 (B15) */
export function gbTake(e, F, dmg) {
  if (!F || e.mode === 'sleep' || e.mode === 'wake') return 0;
  if (gbOpen(e)) { const cap = e.maxHp * GB.openCap, d = Math.min(dmg * GB.openMul, Math.max(0, cap - F.openTaken)); F.openTaken += d; return Math.max(d, dmg * GB.floor); }
  if (F.ward > 0) { F.n.warded++; return dmg * GB.floor; }
  F.n.rested++; return dmg * GB.rest;
}

/* ---------- THE BOT'S READING (tools/buried-city5.mjs toy duel; src/lab.js later) ----------
   A HUMAN BOT: a tell seen PLAN.react s late, some misread; it MOVES OFF the gob's mark, ROLLS the blast (or sits behind a stub), JUMPS the low shard and BLOCKS the high, and
   between his blows it goes to the glass that glints and STRIKES it, then cuts him hard while he is buried.
   s = { P: { x, y, ground }, e, F, t, rng, mem } -> { gx, atk, jump, dodge, duck, block, why } */
export const PLAN = { react: 0.25, miss: 0.14, cutR: 12 };
export function gbPlan(s) {
  const { P, e, F } = s, rng = s.rng || Math.random, mem = s.mem || {}, out = { gx: null, atk: false, jump: false, dodge: false, duck: false, block: false, why: '' };
  mem.seen = mem.seen || new Map(); const key = e.mode + F.act, t = s.t || 0;
  if (!mem.seen.has(key)) mem.seen.set(key, { t, miss: rng() < PLAN.miss });
  const sn = mem.seen.get(key), late = t - sn.t < PLAN.react, wrong = sn.miss, near = Math.abs(P.x - e.x), G = F.G;
  for (const g of F.gobs) if (!g.fly && g.hot > 0 && Math.abs(g.x - P.x) < 14) { out.gx = g.x + (P.x < g.x ? -30 : 30); out.why = 'off the hot glass'; return out; }
  if (F.mark && e.mode === 'gobTell' && Math.abs(P.x - F.mark.x) < 24 && !late && !wrong) { out.gx = F.mark.x + (P.x < F.mark.x ? -50 : 50); out.why = 'off the gob mark'; return out; }
  for (const sh of F.shards) if (Math.abs(sh.x - P.x) < 40 && Math.sign(P.x - sh.x) === sh.dir && !wrong) { if (sh.ht === 'low') { if (P.ground) out.jump = true; } else out.block = true; out.why = 'the shards'; }
  if (e.mode === 'blastTell' && e.modeT < 0.28 && near < GB.blastLen + 10 && !late && !wrong) { out.dodge = true; out.why = 'roll the blast'; return out; }
  if (F.blast && Math.abs(P.x - e.x) < GB.blastLen && !wrong) { out.dodge = true; out.why = 'roll the blast'; return out; }
  if (gbOpen(e)) { out.gx = e.x - Math.sign(e.x - P.x || 1) * 18; out.atk = near < 30; out.why = 'cut him: buried'; return out; }
  const gl = F.glint && F.glint.t > 0 ? (G.glasses || []).find(q => q.id === F.glint.id) : null;
  if (gl && !(F.ward > 0)) { out.gx = gl.x; out.atk = Math.abs(P.x - gl.x) < PLAN.cutR; out.why = 'strike the glinting glass'; return out; }
  out.gx = near > 60 ? e.x : null; out.atk = near < 30 && rng() < 0.3; out.why = 'chip / wait';
  return out;
}
