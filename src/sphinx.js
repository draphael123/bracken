// src/sphinx.js - THE SPHINX OF THE HIGH GATE, the boss of THE FLYING CARPET (claude/carpet, 11-06, the OPUS GREYBOX: the pure fight, no DOM, no main.js).
// Sources: scratch/plan-desert-1105.md s1.6 (Daniel approved 11-05 14:07: "riddle glyph -> strike the matching glyph stone = struck dumb ~3 s OPEN; wrong glyph
// = told pounce. Uses the SANDSTORM rule for her P3 glyph storm"), scratch/brief-flyingcarpet.md (BOSS section; the plan wins where they differ).
// src/carpet-hands.js binds it to the world (the carpet's arena ride, the stones, the drawing); tools/carpet.mjs proves it and runs the toy duel.
//
// SHE GUARDS THE KSAR'S CLIFF GATE, SWOOPING ROUND THE CARPET. THE OPENING IS A RIDDLE:
//   every few seconds she SPEAKS (pose riddleSpeak, her own sound): her chest shows a GLYPH and a short plain riddle stands on the screen
//   (the answer IS the glyph: sun, moon, water, eye, key, scarab). THREE GLYPH STONES float in the sky, one of them hers.
//   STRIKE the matching stone (or fly through it) -> she is STRUCK DUMB: SX.openT s OPEN (gold ring + timer), blows x SX.openK for a purse
//   of SX.purse of her health, then a told WARD (x SX.ward) for SX.wardT s.
//   A WRONG stone -> she POUNCES (told: pose pounceRear + roar, a ring on your spot, SX.moves.pounce.wind s; leave the ring).
//   No answer in SX.riddleT s -> the stones crumble and she laughs (no punishment; the next riddle comes).
// ALWAYS HITTABLE (B15, Daniel's resist floor): her stone hide x SX.armour (0.5) outside the openings - in a pounce, a gust, a breather, the
//   storm - and x SX.ward (0.4) in the ward. Never 0.
// ONE NEW MOVE A PHASE, every move told (windup pose, release pose, its own sound key - SX_POSES):
//   P1 (100-66%) THE SWOOP RAKE  a drawn line from her through your spot; she stoops along it (leave the line: climb or dive; blockable)
//   P2 (66-33%)  + THE WING GUST  wings raised 1 s (an arrow), then a headwind that pitches the carpet up and eats its speed (LIE FLAT: half)
//   P3 (33-0%)   + THE GLYPH STORM  the SANDSTORM rule (src/desert-rules.js newStorm / stormStep, not a copy): calm -> warn -> gust; in a gust
//                the view closes, the wind drives the carpet, and THE STONES WHIRL with it (her riddles go on inside the storm)
//   Phase changes are SX.breath s breathers: the sky changes (dusk -> night -> storm), nothing is cast.
import { newStorm, stormStep } from './desert-rules.js';

export const SX = { hp: 3200, w: 30, h: 24, markH: 44, armour: 0.5, ward: 0.4, wardT: 2.2, openK: 1.8, openT: 3.0, purse: 0.1, breath: 2.2, phaseAt: [0.66, 0.33],
  intro: 1.6, riddleEvery: [8, 7, 6], firstRiddle: 3.5, riddleT: 7, stoneR: 11, stones: 3, orbit: 110, speed: 120, dumbV: 60, cd: [1.6, 1.3, 1.1],
  moves: {
    rake: { wind: 0.9, run: 0.6, rest: 0.7, dmg: 18, reach: 280, half: 14 },
    pounce: { wind: 0.8, run: 0.4, rest: 1.0, dmg: 24, r: 22 },
    gust: { wind: 1.0, run: 1.4, rest: 0.6, slow: 110, vy: -50 },
  },
  stormDirs: [-1, 1, -1, -1], whirl: 0.35 };
/* B16: every move has a windup pose, a release pose and its own sound (the art lane draws the poses; the greybox prints the pose's name under her) */
export const SX_POSES = {
  rake: { wind: 'rakeCrouch', rel: 'rakeStoop', sfx: ['sxHiss', 'sxRake'] },
  pounce: { wind: 'pounceRear', rel: 'pounceLeap', sfx: ['sxRoar', 'sxPounce'] },
  gust: { wind: 'wingsRaised', rel: 'wingsBeat', sfx: ['sxInhale', 'sxGust'] },
  riddle: { wind: 'riddleSpeak', rel: 'riddleWait', sfx: ['sxRiddle', 'sxLaugh'] },
  dumb: { wind: 'struckDumb', rel: 'wardRise', sfx: ['sxDumb', 'sxWard'] },
  storm: { wind: 'stormCall', rel: 'stormRide', sfx: ['sxStorm', 'sxStormGust'] },
};
export const GLYPHS = ['sun', 'moon', 'water', 'eye', 'key', 'scarab'];
/* plain and fair: the answer is the thing the glyph draws */
export const RIDDLES = {
  sun: 'I WALK THE SKY BY DAY AND BURN THE SAND BENEATH ME.',
  moon: 'I WALK THE SKY BY NIGHT AND HAVE NO FIRE OF MY OWN.',
  water: 'I RUN WITHOUT LEGS, AND FOR WANT OF ME THE DESERT KILLS.',
  eye: 'I SEE THE WHOLE ROAD, AND I SLEEP UNDER A LID.',
  key: 'I HAVE TEETH AND NO MOUTH, AND I OPEN THE HIGH GATE.',
  scarab: 'I ROLL THE SUN ACROSS THE SAND ON SIX LEGS.',
};
export const SX_SAY = { name: 'THE SPHINX OF THE HIGH GATE', intro: 'ANSWER ME, RIDER, OR FALL.', open: 'STRUCK DUMB', wrong: 'WRONG - SHE POUNCES', late: 'SHE LAUGHS: TOO SLOW',
  ward: 'SHE FINDS HER VOICE', hide: 'HER STONE HIDE', warded: 'WARDED', phase: ['', '', 'THE SUN GOES DOWN: SHE BEATS HER WINGS', 'SHE CALLS THE GLYPH STORM'] };

/* the arena in px: { X0, X1, Y0 (sky top), Y1 (lowest she flies), floorY (the gate's apron) } */
export function geom(x0, x1, y0, y1, floorY) { return { X0: x0, X1: x1, Y0: y0, Y1: y1, floorY }; }
export function newFight(G, o = {}) {
  const hp = o.hp || SX.hp;
  return { G, hp, maxHp: hp, ph: 1, x: (G.X0 + G.X1) / 2 + 80, y: G.Y0 + 70, face: -1, a: 0, mode: 'sleep', t: 0, cur: null, cd: 2, last: null, riddle: null, riddleCd: SX.firstRiddle,
    lastGlyph: null, open: 0, purse: 0, ward: 0, breath: 0, storm: null, st: null, stormPh: 'calm', pose: 'perch', k: 0,
    n: { opens: 0, wrong: 0, late: 0, riddles: 0, moves: { rake: 0, pounce: 0, gust: 0 }, phases: [] } };
}
const ev = (a, t, x) => { a.push(Object.assign({ t }, x || {})); return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function flyTo(S, tx, ty, v, dt) { const G = S.G; tx = clamp(tx, G.X0 + 20, G.X1 - 20); ty = clamp(ty, G.Y0 + 20, G.Y1); const dx = tx - S.x, dy = ty - S.y, d = Math.hypot(dx, dy) || 1, s = Math.min(d, v * dt); S.x += dx / d * s; S.y += dy / d * s; if (Math.abs(dx) > 2) S.face = Math.sign(dx); }
/* the riddle: her glyph, and three stones (hers + two others) spread across the sky at differing heights */
function startRiddle(S, rng, out) {
  const G = S.G, pool = GLYPHS.filter(g => g !== S.lastGlyph), glyph = pool[Math.floor(rng() * pool.length) % pool.length];
  const others = GLYPHS.filter(g => g !== glyph).sort(() => rng() - 0.5).slice(0, SX.stones - 1), set = [glyph, ...others].sort(() => rng() - 0.5);
  const w = (G.X1 - G.X0) / SX.stones;
  const stones = set.map((g, i) => ({ glyph: g, x: G.X0 + w * (i + 0.5) + (rng() - 0.5) * w * 0.3, y: G.Y0 + 50 + rng() * Math.max(40, G.Y1 - G.Y0 - 90), bx: 0, by: 0, hit: false }));
  for (const s of stones) { s.bx = s.x; s.by = s.y; }
  S.riddle = { glyph, t: SX.riddleT, stones, text: RIDDLES[glyph] }; S.lastGlyph = glyph; S.n.riddles++; S.pose = SX_POSES.riddle.wind;
  ev(out, 'riddle', { glyph, text: RIDDLES[glyph], sfx: SX_POSES.riddle.sfx[0], pose: SX_POSES.riddle.wind });
}
function startMove(S, id, hero, out) {
  const M = SX.moves[id], Po = SX_POSES[id]; S.n.moves[id]++;
  const c = S.cur = { id, st: 'wind', t: M.wind };
  if (id === 'rake') { const dx = hero.x - S.x, dy = hero.y - 10 - S.y, d = Math.hypot(dx, dy) || 1; c.ux = dx / d; c.uy = dy / d; c.x0 = S.x; c.y0 = S.y; c.x1 = S.x + c.ux * M.reach; c.y1 = S.y + c.uy * M.reach; }
  if (id === 'pounce') { c.tx = hero.x; c.ty = hero.y - 8; }
  if (id === 'gust') c.dir = Math.sign(hero.x - S.x) || S.face;
  S.pose = Po.wind;
  ev(out, 'tell', { id, mark: '!!', pose: Po.wind, sfx: Po.sfx[0], line: id === 'rake' ? [c.x0, c.y0, c.x1, c.y1] : null, spot: id === 'pounce' ? [c.tx, c.ty, M.r] : null, dir: c.dir || 0, wind: M.wind });
}
/* the hit boxes [l, r, t, b] px */
export function rakeBox(S) { const h = SX.moves.rake.half; return [S.x - h, S.x + h, S.y - h, S.y + h]; }
export function pounceBox(c) { const r = SX.moves.pounce.r; return [c.tx - r, c.tx + r, c.ty - r, c.ty + r]; }

/* ONE STEP. w = { hero: { x, y, alive }, rng }. Returns events: intro, riddle, late, open, ward, wrong, tell, release, hit {box, dmg, name, blockable, once},
   gust {dir, slow, vy}, storm {phase, ...}, phase {ph, text}, dead. */
export function sxStep(S, dt, w) {
  const out = [], hero = w.hero || { x: S.x, y: S.y, alive: false }, rng = w.rng || Math.random, G = S.G;
  if (S.mode === 'dead') return out;
  if (S.hp <= 0) { S.mode = 'dead'; S.cur = null; S.riddle = null; S.storm = null; S.st = null; return ev(out, 'dead'); }
  if (S.mode === 'sleep') { S.mode = 'intro'; S.t = SX.intro; ev(out, 'intro', { text: SX_SAY.intro }); }
  if (S.mode === 'intro') { S.t -= dt; flyTo(S, (G.X0 + G.X1) / 2, G.Y0 + 70, SX.speed, dt); if (S.t > 0) return out; S.mode = 'fight'; }
  /* THE PHASES (one at a time: a breather, nothing cast) */
  const k = S.hp / S.maxHp;
  if (S.ph < 3 && k < SX.phaseAt[S.ph - 1]) {
    S.ph++; S.breath = SX.breath; S.cur = null; S.riddle = null; S.open = 0; S.ward = 0; S.purse = 0; S.riddleCd = 1.2 + SX.breath; S.n.phases.push(S.ph);
    if (S.ph === 3) { S.storm = newStorm(SX.stormDirs); S.stormPh = 'calm'; }
    ev(out, 'phase', { ph: S.ph, text: SX_SAY.phase[S.ph], pose: S.ph === 3 ? SX_POSES.storm.wind : 'roar', sfx: S.ph === 3 ? SX_POSES.storm.sfx[0] : 'sxRoar' });
  }
  if (S.breath > 0) { S.breath -= dt; flyTo(S, (G.X0 + G.X1) / 2, G.Y0 + 50, SX.speed, dt); S.pose = S.ph === 3 ? SX_POSES.storm.wind : 'roar'; return out; }
  /* THE GLYPH STORM (P3): the sandstorm rule's own cycle */
  if (S.storm) { S.st = stormStep(S.storm, dt);
    if (S.st.phase !== S.stormPh) { S.stormPh = S.st.phase; if (S.st.phase === 'warn') ev(out, 'storm', { phase: 'warn', dir: S.st.dir, sfx: SX_POSES.storm.sfx[0] }); else if (S.st.phase === 'gust') ev(out, 'storm', { phase: 'gust', dir: S.st.dir, sfx: SX_POSES.storm.sfx[1] }); }
    if (S.riddle) for (const s of S.riddle.stones) { s.bx += S.st.dir * S.st.push * SX.whirl * dt; if (s.bx < G.X0 + 16) s.bx = G.X1 - 16; if (s.bx > G.X1 - 16) s.bx = G.X0 + 16; } }
  if (S.riddle) for (const s of S.riddle.stones) { s.x = s.bx; s.y = s.by + Math.sin(S.riddle.t * 2 + s.bx * 0.02) * 4; }   /* they bob where they float (and whirl in the storm) */
  /* STRUCK DUMB -> WARD */
  if (S.open > 0) { S.open -= dt; S.pose = SX_POSES.dumb.wind; flyTo(S, hero.x + S.face * 40, hero.y - 14, SX.dumbV, dt);
    if (S.open <= 0) { S.open = 0; S.purse = 0; S.ward = SX.wardT; ev(out, 'ward', { text: SX_SAY.ward, pose: SX_POSES.dumb.rel, sfx: SX_POSES.dumb.sfx[1] }); } return out; }
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt);
  /* THE RIDDLE */
  if (S.riddle) { S.riddle.t -= dt; if (S.riddle.t <= 0) { S.riddle = null; S.n.late++; S.riddleCd = SX.riddleEvery[S.ph - 1]; ev(out, 'late', { text: SX_SAY.late, sfx: SX_POSES.riddle.sfx[1] }); } }
  else if (!(S.cur && S.cur.id === 'pounce')) { S.riddleCd -= dt; if (S.riddleCd <= 0 && !S.cur) startRiddle(S, rng, out); }
  /* THE MOVES */
  const c = S.cur;
  if (c) { const M = SX.moves[c.id], Po = SX_POSES[c.id]; c.t -= dt;
    if (c.st === 'wind') { if (c.id === 'pounce') flyTo(S, S.x, S.y - 10, 30, dt); else if (c.id === 'gust') flyTo(S, S.x - c.dir * 20, S.y, 30, dt);
      if (c.t <= 0) { c.st = 'run'; c.t = M.run; c.once = c.id + ':' + (S.n.moves[c.id]); S.pose = Po.rel; ev(out, 'release', { id: c.id, pose: Po.rel, sfx: Po.sfx[1] }); if (c.id === 'pounce') { c.fx = S.x; c.fy = S.y; } } }
    else if (c.st === 'run') {
      if (c.id === 'rake') { const v = M.reach / M.run; S.x += c.ux * v * dt; S.y += c.uy * v * dt; S.x = clamp(S.x, G.X0 + 10, G.X1 - 10); S.y = clamp(S.y, G.Y0 + 10, G.floorY - 12); S.face = Math.sign(c.ux) || S.face;
        ev(out, 'hit', { box: rakeBox(S), dmg: M.dmg, name: 'THE SWOOP RAKE', blockable: true, once: c.once }); }
      else if (c.id === 'pounce') { const q = 1 - Math.max(0, c.t) / M.run; S.x = c.fx + (c.tx - c.fx) * q; S.y = c.fy + (c.ty - c.fy) * q; if (c.t <= 0) ev(out, 'hit', { box: pounceBox(c), dmg: M.dmg, name: 'HER POUNCE', blockable: false, once: c.once }); }
      else if (c.id === 'gust') ev(out, 'gust', { dir: c.dir, slow: M.slow, vy: M.vy });
      if (c.t <= 0) { c.st = 'rest'; c.t = M.rest; S.pose = 'hover'; } }
    else if (c.t <= 0) { S.last = c.id; S.cur = null; S.cd = SX.cd[S.ph - 1]; }
    return out; }
  /* between moves she wheels round you */
  S.a += dt * 0.9; S.pose = S.riddle ? SX_POSES.riddle.rel : 'hover';
  flyTo(S, hero.x + Math.cos(S.a) * SX.orbit, hero.y - 50 + Math.sin(S.a * 1.3) * 40, SX.speed, dt);
  if (hero.alive) { S.cd -= dt; if (S.cd <= 0) { const list = S.ph === 1 ? ['rake'] : ['rake', 'gust']; let id = list[Math.floor(rng() * list.length) % list.length]; if (list.length > 1 && id === S.last) id = list.find(x => x !== S.last); startMove(S, id, hero, out); } }
  return out;
}
/* THE ANSWER: the hero struck (or flew through) a stone. Right: STRUCK DUMB (OPEN). Wrong: the told pounce. */
export function answer(S, glyph, hero) {
  const out = []; if (!S.riddle || S.mode !== 'fight' || S.open > 0) return out;
  const want = S.riddle.glyph; S.riddle = null; S.riddleCd = SX.riddleEvery[S.ph - 1];
  if (glyph === want) { S.open = SX.openT; S.purse = S.maxHp * SX.purse; S.ward = 0; S.cur = null; S.n.opens++; S.pose = SX_POSES.dumb.wind; return ev(out, 'open', { text: SX_SAY.open, pose: SX_POSES.dumb.wind, sfx: SX_POSES.dumb.sfx[0] }); }
  S.n.wrong++; ev(out, 'wrong', { text: SX_SAY.wrong, glyph }); startMove(S, 'pounce', hero || { x: S.x, y: S.y + 40 }, out); return out;
}
/* A BLOW ON HER. B15: never under SX.ward (0.4); the opening pays x openK until its purse is spent, then x1. Returns [dmg, word]. */
export function takeBlow(S, dmg) {
  if (!(dmg > 0)) return [0, null];
  if (S.open > 0) { const full = dmg * SX.openK, d = S.purse > 0 ? Math.max(dmg, Math.min(full, S.purse)) : dmg; S.purse = Math.max(0, S.purse - d); return [d, null]; }
  if (S.ward > 0) return [dmg * SX.ward, SX_SAY.warded];
  return [dmg * SX.armour, SX_SAY.hide];
}
export const resistNow = S => (S.open > 0 ? SX.openK : S.ward > 0 ? SX.ward : SX.armour);

/* THE HUMAN BOT (the toy duel's and the lab's): h = { x, y }. Returns { gx, gy, act: 'answer'|'swing'|'dodge'|'wait', duck, glyph } */
export function sxPlan(S, h) {
  const G = S.G, c = S.cur;
  if (c && c.id === 'pounce' && c.st !== 'rest') { const away = h.x < c.tx ? -1 : 1; return { gx: clamp(c.tx + away * 90, G.X0 + 20, G.X1 - 20), gy: h.y, act: 'dodge' }; }
  if (c && c.id === 'rake' && c.st !== 'rest') { const nx = -c.uy, ny = c.ux, side = ((h.x - c.x0) * nx + (h.y - c.y0) * ny) >= 0 ? 1 : -1; return { gx: h.x + nx * side * 70, gy: h.y + ny * side * 70, act: 'dodge' }; }
  if (c && c.id === 'gust' && c.st !== 'rest') return { gx: h.x, gy: h.y, act: 'wait', duck: true };
  if (S.riddle && S.open <= 0) { const s = S.riddle.stones.find(q => q.glyph === S.riddle.glyph); return { gx: s.x, gy: s.y + 6, act: 'answer', glyph: s.glyph }; }
  return { gx: S.x - S.face * 6, gy: S.y + 12, act: 'swing' };
}
