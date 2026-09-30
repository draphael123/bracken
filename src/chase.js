// src/chase.js - THE CHASE ENGINE (claude/chase). A reusable CHASER for the booked levels: the Minecart side road (a cave-in and THE GREAT
// DRILL down the tunnel), the Rockslide off the Scree Path, the Ore Road collapse. This file is the ENGINE (pure, no DOM: tools/chase.mjs
// drives it headless and through the page); no level uses it yet. src/main.js holds the small hook (chasesLoad, updateChase, drawChase).
//
// A LEVEL OPTS IN with L.chases = [ spec, ... ] (an ordinary array on what build() returns). One chase runs at a time. All positions are
// world PIXELS along the chase's AXIS ('x' across, 'y' down or up): a tile is 16 px. A spec, every field but trigger/end optional:
//   id        'cavein'                          its name (the demo is 'demo')
//   name      'THE CAVE-IN'                     what the death line says
//   axis      'x' | 'y'                         default 'x'
//   dir       1 | -1                            the way it MOVES along the axis (1 = right / down), default 1. The hero runs the same way.
//   trigger   px   THE START LINE: the chase starts when the hero crosses it in the chase's direction
//   end       px   THE SAFE LINE: the hero crosses it, the chase is won; the chaser runs on to it and stops (the crash)
//   from      px   where the chaser starts (default: gap0 behind the trigger)
//   gap0      200  its distance behind the hero-at-the-trigger when it starts; never under rubber.min
//   curve     [[dist, speed, 'WARNING'], ...]  the SPEED CURVE. dist = px the chaser has travelled; speed = px/s from there on. The
//             first row is the base speed and needs no warning ([0, 60]). EVERY LATER ROW NEEDS A WARNING TEXT: it is told (banner,
//             rumble, red glow) `lead` seconds of travel BEFORE the chaser speeds up, and the speed-up waits for the warning.
//   lead      1.6  seconds of warning before a speed-up
//   accel     140  px/s per second the speed eases to a new value
//   rubber    { min: 110, max: 260, slow: 0.35, catch: 1.5 }   THE RUBBER BAND, gap = px between chaser and hero: under min the chaser
//             runs at slow x its speed (so a first try is never unfair and a hero who runs pulls away), over max at catch x (so it is
//             always a threat); a hero who STOPS is caught - the chaser never stops. max must fit the screen (< 300).
//   contact   'kill' | 'hurt'     what the front does to a hero it reaches: 'kill' is instant death (a cave-in), 'hurt' is heavy damage
//   dmg       45   the damage of 'hurt'; the chaser then falls back to rubber.min and holds `hold` seconds (0.7) so it cannot chain-hit
//   autoscroll  true|false, edge px (default off)   THE CAMERA PUSHES: its trailing edge is never behind the chaser's front (minus edge, 24 px), so the
//             hero cannot fall behind the screen without being caught, and the camera cannot run so far ahead that he is off it
//   show      px (optional, with autoscroll): THE CAMERA TIED TO IT - its front is kept at least this far inside the screen's trailing edge, so
//             you see what is coming - never at the cost of the hero: he keeps showKeep (0..1, default 0.1) of the view ahead of him, so a chase whose
//             hero must see what waits ahead (the stair's Archmage over the next landing) lets the front drop off when he is far ahead of it;
//             and never past its zone
//   glow      300  the distance at which the screen-edge danger glow and rumble begin
//   look      'rock' | 'fire' | 'drill' | 'dark' | 'train'    how the chaser is drawn ('dark': the Undead Archmage's magic, his ring's green-black; 'train': THE HARVEST FAIR's
//             ghost train, a painted car with a skull on its nose and a lamp, drawn standing on its zone's floor - claude/fairfix)
//   runsOver  true    (claude/fairfix) the front RUNS OVER the level's foes it overtakes inside its zone as well as the hero (the ghost train through its own cutting)
//   say       'RUN!'   the banner when it starts
//   zone      [x0, x1, y0, y1]  world px (optional): the start line only counts with the hero inside this box, and the chaser is drawn only
//             across x0..x1 - for a chase that shares its rows (or columns) with another part of the level (the spiral stair: claude/towerscroll)
//   music     'boss'    a track name from src/audio.js TRACKS; plays at the start, the level's own track returns at the end / on respawn
//   beams     [{ x0, x1, y, th, dmg, name, period, up }]   OVERHEAD BEAMS / LOW CEILINGS. y = the beam's LOWEST point (world px), th = its
//             thickness (default 6). A standing hero under it is hit; a hero DUCKED under it (src/duck.js duckClears) passes. Beams are
//             live in every phase. DUCKING NEEDS STANDING STILL OR A RIDE (the hero is carried on a cart / boat: the down key held on a
//             mover ducks him while he moves) - on foot a beam is a wall to wait under, so give it period/up (dangerous for the first
//             period - up seconds of every period, raised for `up`) or use it only where the hero rides.
//   checkpoint  [x,y]  (documentation for level lanes; see chaseProblems): the shrine standing before the trigger
// THE CHECKPOINT RULE: a shrine within CHECKPOINT_GAP px before the start line (chaseProblems fails a level that has none), and a death
// puts every chase back to IDLE (chaseReset) - the chaser goes back to its start and the trigger waits for the hero again.
import { DUCK_H } from './duck.js';

export const TS = 16;
export const CHECKPOINT_GAP = 240;   // px: a shrine no further than this before the start line
export const RUBBER = { min: 110, max: 260, slow: 0.35, catch: 1.5 };
export const LEASH = 1.25;           // the chaser is never further behind than rubber.max x this
export const HERO_RUN = 92;          // px/s: the hero's run; a chaser's SLOWED speed (speed x rubber.slow) must stay well under it so a hero can pull away
export const MIN_FAIR = 64;          // rubber.min never under this (a first try is never unfair)
export const MAX_SCREEN = 300;       // rubber.max never over this (the hero stays on the screen)
export const BEAM = { th: 6, dmg: 14, cd: 1 };

const num = (v, d) => Number.isFinite(v) ? v : d;
/* A SPEC WITH ITS DEFAULTS, and its curve sorted into rows { at, speed, warn } */
export function chaseSpec(c) {
  const dir = c.dir === -1 ? -1 : 1, rb = { ...RUBBER, ...(c.rubber || {}) };
  rb.min = Math.max(MIN_FAIR, rb.min); rb.max = Math.max(rb.min + 40, rb.max);
  const curve = (c.curve && c.curve.length ? c.curve : [[0, 60]]).map(r => Array.isArray(r) ? { at: r[0], speed: r[1], warn: r[2] || '' } : { at: r.at, speed: r.speed, warn: r.warn || '' }).sort((a, b) => a.at - b.at);
  const trigger = c.trigger, gap0 = Math.max(rb.min, num(c.gap0, 200));
  return { id: c.id || 'chase', name: c.name || 'THE CHASE', axis: c.axis === 'y' ? 'y' : 'x', dir, trigger, end: c.end,
    from: num(c.from, trigger - dir * gap0), gap0, curve, lead: num(c.lead, 1.6), accel: num(c.accel, 140), rubber: rb,
    contact: c.contact === 'hurt' ? 'hurt' : 'kill', dmg: num(c.dmg, 45), hold: num(c.hold, 0.7),
    autoscroll: !!c.autoscroll, edge: num(c.edge, 24), show: Number.isFinite(c.show) ? c.show : null, showKeep: num(c.showKeep, 0.1), glow: num(c.glow, 300), look: c.look || 'rock', music: c.music || null, say: c.say || 'RUN!', zone: Array.isArray(c.zone) && c.zone.length === 4 ? c.zone.slice() : null,
    beams: (c.beams || []).map(b => ({ th: BEAM.th, dmg: BEAM.dmg, name: 'A LOW BEAM', ...b })), checkpoint: c.checkpoint || null, runsOver: !!c.runsOver };
}
export const newChase = () => ({ phase: 'idle', pos: 0, dist: 0, speed: 0, t: 0, warned: {}, warnT: 0, warnText: '', hold: 0, crash: 0, rumT: 0 });
export const chaseReset = st => Object.assign(st, newChase());
/* THE ZONE: is (x, y) where this chase's start line counts (no zone: everywhere) */
export const chaseInZone = (sp, x, y) => !sp.zone || (x >= sp.zone[0] && x < sp.zone[1] && y >= sp.zone[2] && y < sp.zone[3]);

/* THE STEP. hero = the hero's centre along the axis (px). Returns the events this step made: start, warn, speedup, contact, end. */
export function chaseStep(sp, st, hero, dt) {
  const ev = [], d = sp.dir, ahead = (a, b) => (a - b) * d;   // ahead(a,b) > 0: a is further along the chase than b
  if (st.phase === 'idle') {
    if (ahead(hero, sp.trigger) >= 0 && ahead(hero, sp.end) < 0) { Object.assign(st, newChase(), { phase: 'run', pos: sp.from, speed: sp.curve[0].speed }); st.warned[0] = true; ev.push({ k: 'start' }); }
    else return ev;
  }
  st.t += dt; st.warnT = Math.max(0, st.warnT - dt);
  if (st.phase === 'done') {   // the crash: it runs on to the safe line and stops there
    st.crash += dt; if (ahead(st.pos, sp.end) < 0) { st.pos += d * st.speed * dt; if (ahead(st.pos, sp.end) >= 0) { st.pos = sp.end; st.speed = 0; ev.push({ k: 'crash' }); } } return ev; }
  // THE WARNING, then the speed-up it told
  let tgt = sp.curve[0].speed;
  for (let i = 1; i < sp.curve.length; i++) { const r = sp.curve[i];
    if (!st.warned[i] && r.at - st.dist <= sp.lead * Math.max(st.speed, 30)) { st.warned[i] = true; st.warnT = 2.2; st.warnText = r.warn || 'IT QUICKENS'; ev.push({ k: 'warn', i, text: st.warnText, dist: st.dist, at: r.at }); }
    if (st.warned[i] && st.dist >= r.at) tgt = r.speed; }
  if (tgt > st.speed + 0.01 && !(st.rose === tgt)) { st.rose = tgt; ev.push({ k: 'speedup', speed: tgt, dist: st.dist }); }
  if (st.speed < tgt) st.speed = Math.min(tgt, st.speed + sp.accel * dt); else if (st.speed > tgt) st.speed = Math.max(tgt, st.speed - sp.accel * dt);
  // THE RUBBER BAND
  const gap = ahead(hero, st.pos), rb = sp.rubber; let k = gap < rb.min ? rb.slow : gap > rb.max ? rb.catch : 1;
  if (st.hold > 0) { st.hold -= dt; k = 0; }
  const step = st.speed * k * dt; st.pos += d * step; st.dist += step;
  const far = rb.max * LEASH; if (ahead(hero, st.pos) > far) st.pos = hero - d * far;   // THE LEASH: a hero who outruns even the catch-up is never left more than this ahead
  // THE SAFE LINE
  if (ahead(hero, sp.end) >= 0) { st.phase = 'done'; ev.push({ k: 'end' }); return ev; }
  // THE FRONT REACHES THE HERO
  if (ahead(hero, st.pos) <= 0) { ev.push({ k: 'contact', mode: sp.contact, dmg: sp.dmg });
    if (sp.contact === 'hurt') { st.pos = hero - d * rb.min; st.hold = sp.hold; } }
  return ev;
}
/* THE GAP the rubber band works on, and how close the danger feels: 0 far / idle, 1 at the front */
export const chaseGap = (sp, st, hero) => (hero - st.pos) * sp.dir;
export function chaseDanger(sp, st, hero) {
  if (st.phase !== 'run') return 0;
  const gap = chaseGap(sp, st, hero); return Math.max(0, Math.min(1, 1 - (gap - 40) / Math.max(1, sp.glow - 40)));
}
/* AUTOSCROLL: the camera's position along the axis (its low edge), the size of the view along it, and the hero. Never behind the front, never so
   far ahead of the hero that he is off it (see the header). */
export function chaseCam(sp, st, cam, view, hero) {
  if (!sp.autoscroll || st.phase !== 'run') return cam;
  const e = sp.edge;
  let c; if (sp.dir > 0) { const lo = st.pos - e, hi = hero - e; c = Math.min(Math.max(cam, lo), Math.max(hi, lo)); }
  else { const hi = st.pos + e - view, lo = hero + e - view; c = Math.max(Math.min(cam, hi), Math.min(lo, hi)); }
  if (sp.show === null || sp.show === undefined) return c;
  const z = sp.zone, lim = !z ? null : sp.axis === 'y' ? (sp.dir < 0 ? z[3] : z[2]) : (sp.dir < 0 ? z[1] : z[0]), p = lim === null ? st.pos : sp.dir < 0 ? Math.min(st.pos, lim) : Math.max(st.pos, lim);   /* (a front still under its zone's floor is in the stone: show the floor) */
  return sp.dir < 0 ? Math.max(c, Math.min(p + sp.show - view, hero - sp.showKeep * view)) : Math.min(c, Math.max(p - sp.show, hero - (1 - sp.showKeep) * view));
}
/* A BEAM against a hero: box = duckBox(P) {l,r,t,b}; clears = duckClears(P, beam.y) - the DUCK's answer, never the down key. t = the clock. */
export function beamLive(b, t) { return !b.period || (t % b.period) >= (b.up || 0); }
export function beamHit(box, clears, b, t) {
  return beamLive(b, t) && box.r > b.x0 && box.l < b.x1 && box.t < b.y && box.b > b.y - (b.th || BEAM.th) && !clears;
}
export { DUCK_H };

/* THE LEVEL LINT (tools/chase.mjs runs it on every level that has L.chases, and on the demo): the fairness the engine cannot make up for */
export function chaseProblems(list, checkpoints) {   // checkpoints: [{x, y}] in px (the level's shrines and its start); left out, the checkpoint rule is not asked
  const bad = [];
  for (const raw of list || []) { const id = raw.id || '?';
    if (!Number.isFinite(raw.trigger) || !Number.isFinite(raw.end)) { bad.push(id + ': trigger and end must be px numbers'); continue; }
    const sp = chaseSpec(raw), d = sp.dir;
    if ((sp.end - sp.trigger) * d <= 0) bad.push(id + ': the safe line is not past the start line in the chase\'s direction');
    if (raw.rubber && raw.rubber.min !== undefined && raw.rubber.min < MIN_FAIR) bad.push(id + ': rubber.min under ' + MIN_FAIR + ' px is unfair on a first try');
    if (sp.rubber.max > MAX_SCREEN) bad.push(id + ': rubber.max ' + sp.rubber.max + ' is over ' + MAX_SCREEN + ' px - the hero would be off the screen');
    for (let i = 1; i < sp.curve.length; i++) if (!sp.curve[i].warn) bad.push(id + ': curve row ' + i + ' speeds the chaser up with no warning text');
    if (sp.curve.some(r => !(r.speed > 0))) bad.push(id + ': a speed is not positive');
    if (sp.curve[0].at !== 0) bad.push(id + ': the first curve row must start at 0');
    for (const r of sp.curve) if (r.speed * sp.rubber.slow > HERO_RUN * 0.8) bad.push(id + ': speed ' + r.speed + ' x slow ' + sp.rubber.slow + ' is too fast for a hero to pull away from (he runs ' + HERO_RUN + ')');
    const cps = (checkpoints || []).map(c => sp.axis === 'x' ? c.x : c.y).filter(c => (sp.trigger - c) * d >= 0 && (sp.trigger - c) * d <= CHECKPOINT_GAP);
    if (checkpoints && !cps.length) bad.push(id + ': no checkpoint within ' + CHECKPOINT_GAP + ' px before the start line');
    for (const b of sp.beams) if (!(b.x1 > b.x0) || !Number.isFinite(b.y)) bad.push(id + ': a beam needs x0 < x1 and a y');
  }
  return bad;
}

/* ---------- THE DRAWING (world space; g = the frame's 2d context, cx/cy the camera) ---------- */
const LOOKS = { rock: { body: '#2a2119', edge: '#6b5a48', deb: '#8a7660' }, fire: { body: '#4a1408', edge: '#ff8a2a', deb: '#ffd36b' },
  drill: { body: '#1c2026', edge: '#a9b4c2', deb: '#e0a040' }, train: { body: '#2a0e14', edge: '#9ae0a8', deb: '#ffd36b', wash: '120,230,150' }, dark: { body: '#07120c', edge: '#6fe08a', deb: '#c8ffd8', deep: '#1f4a2c', haze: 'rgba(111,224,138,', wave: true, wash: '60,190,110' } };
export function drawChaser(g, sp, st, cx, cy, VW, VH, time) {
  if (st.phase === 'idle') return;
  const L = LOOKS[sp.look] || LOOKS.rock, x = Math.round(st.pos - (sp.axis === 'x' ? cx : cy)), depth = 260;
  g.save();
  if (sp.zone) { const zx = sp.zone[0] - cx, zy = sp.zone[2] - cy; g.beginPath(); g.rect(Math.round(zx), Math.round(zy), Math.round(sp.zone[1] - sp.zone[0]), Math.round(sp.zone[3] - sp.zone[2])); g.clip(); }   /* only over its own place */
  const jag = i => Math.round(Math.sin(i * 1.7 + time * 9) * 3 + Math.sin(i * 0.6) * 4);
  if (sp.look === 'train' && sp.axis === 'x') { drawTrain(g, sp, x, (sp.zone ? Math.floor(sp.zone[3] / TS) * TS : cy + VH) - cy, time);   /* on the zone's floor tile */ g.restore(); return; }
  if (sp.axis === 'x') { const lo = sp.dir > 0 ? x - depth : x, hi = sp.dir > 0 ? x : x + depth;
    g.fillStyle = L.body; g.fillRect(lo, 0, hi - lo, VH);
    for (let y = 0; y < VH; y += 8) { const j = jag(y / 8), ex = sp.dir > 0 ? x + j : x + j - 6; g.fillStyle = L.body; g.fillRect(Math.min(ex, ex + 6 * sp.dir), y, 10, 8); g.fillStyle = L.edge; g.fillRect(sp.dir > 0 ? ex - 2 : ex + 4, y, 3, 8); }
    for (let i = 0; i < 6; i++) { const yy = (time * 90 + i * 53) % VH, xx = x - sp.dir * (10 + (i * 37) % 80); g.fillStyle = L.deb; g.fillRect(Math.round(xx), Math.round(yy), 3, 3); }
  } else if (L.wave && sp.dir < 0) {   /* A FLOOD RISING (the 'dark' look): a slow swell for a surface, a bright rim, the body to the foot of the screen */
    g.fillStyle = L.body; g.fillRect(0, x + 6, VW, Math.max(0, VH - x));
    for (let xx = 0; xx < VW; xx += 2) { const w = Math.sin(xx * 0.045 + time * 2.2) * 3 + Math.sin(xx * 0.11 - time * 3.1) * 2, ey = Math.round(x + w);
      g.fillStyle = L.body; g.fillRect(xx, ey, 2, 8); g.fillStyle = L.edge; g.fillRect(xx, ey, 2, 1); g.fillStyle = L.deep; g.fillRect(xx, ey + 14 + Math.round(w), 2, 2); }
    for (let i = 0; i < 6; i++) { const xx = (time * 40 + i * 97) % VW, yy = x + 10 + ((i * 37 + time * 20) % 90); g.fillStyle = L.deb; g.fillRect(Math.round(xx), Math.round(yy), 2, 2); }
    if (L.haze) { const grad = g.createLinearGradient(0, x, 0, x - 40); grad.addColorStop(0, L.haze + '0.28)'); grad.addColorStop(1, L.haze + '0)'); g.fillStyle = grad; g.fillRect(0, x - 40, VW, 40);   /* a haze of his light over it */
      for (let i = 0; i < 9; i++) { const xx = (i * 71 + time * 23 * (i % 2 ? 1 : -1)) % VW, rise = ((time * 26 + i * 17) % 34); g.fillStyle = i % 3 ? L.edge : L.deb; g.fillRect(Math.round((xx + VW) % VW), Math.round(x - rise), 2, 2); } }   /* sparks off its surface */
  } else { const lo = sp.dir > 0 ? x - depth : x, hi = sp.dir > 0 ? x : x + depth;
    g.fillStyle = L.body; g.fillRect(0, lo, VW, hi - lo);
    for (let xx = 0; xx < VW; xx += 8) { const j = jag(xx / 8), ey = sp.dir > 0 ? x + j : x + j - 6; g.fillStyle = L.body; g.fillRect(xx, Math.min(ey, ey + 6 * sp.dir), 8, 10); g.fillStyle = L.edge; g.fillRect(xx, sp.dir > 0 ? ey - 2 : ey + 4, 8, 3); }
    for (let i = 0; i < 6; i++) { const xx = (time * 90 + i * 53) % VW, yy = x - sp.dir * (10 + (i * 37) % 80); g.fillStyle = L.deb; g.fillRect(Math.round(xx), Math.round(yy), 3, 3); } }
  g.restore();
}
/* THE GHOST TRAIN (claude/fairfix): three painted cars on the zone's floor, the front one with a skull on its nose, a lamp and green ghost-light round it; its wheels turn */
function drawTrain(g, sp, x, fy, time) {
  const d = sp.dir, car = (x1, nose) => { const lo = d > 0 ? x1 - 76 : x1, top = fy - 50;
    g.fillStyle = '#2a0e14'; g.fillRect(lo, top + 8, 76, 36); g.fillStyle = '#6a1a24'; g.fillRect(lo, top + 8, 76, 4); g.fillStyle = '#c8a040'; g.fillRect(lo, top + 20, 76, 2);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#140608'; g.fillRect(lo + 10 + i * 22, top + 26, 14, 12); g.fillStyle = 'rgba(154,224,168,' + (0.25 + 0.2 * Math.sin(time * 6 + i)).toFixed(2) + ')'; g.fillRect(lo + 12 + i * 22, top + 28, 10, 8); }
    for (const wx of [lo + 14, lo + 62]) { g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(wx, fy - 5, 6, 0, 6.3); g.fill(); g.strokeStyle = '#8a8a8a'; g.lineWidth = 1; const a = time * 12 * d; g.beginPath(); g.moveTo(wx + Math.cos(a) * 5, fy - 5 + Math.sin(a) * 5); g.lineTo(wx - Math.cos(a) * 5, fy - 5 - Math.sin(a) * 5); g.stroke(); }
    if (nose) { const nx = d > 0 ? x1 : x1 - 0, fx = nx - d * 4; g.fillStyle = '#3a1218'; g.beginPath(); g.moveTo(nx - d * 6, top + 6); g.lineTo(nx + d * 8, top + 20); g.lineTo(nx + d * 8, fy - 10); g.lineTo(nx - d * 6, fy - 6); g.fill();
      g.fillStyle = '#ece0c4'; g.beginPath(); g.arc(fx + d * 4, top + 22, 8, 0, 6.3); g.fill(); g.fillStyle = '#120e14'; g.fillRect(fx + d * 4 - 5, top + 19, 3, 4); g.fillRect(fx + d * 4 + 2, top + 19, 3, 4); g.fillRect(fx + d * 4 - 3, top + 27, 6, 2);   // the skull
      const gl = g.createRadialGradient(nx + d * 10, top + 8, 1, nx + d * 10, top + 8, 40); gl.addColorStop(0, 'rgba(255,230,140,0.9)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gl; g.fillRect(nx + d * 10 - 40, top - 32, 80, 80); } };
  g.fillStyle = 'rgba(120,230,150,0.12)'; g.fillRect(d > 0 ? x - 260 : x, fy - 64, 260, 64);   // the ghost-light it trails
  car(x, true); car(x - d * 80, false); car(x - d * 160, false);
  for (let i = 0; i < 5; i++) { const px2 = x - d * (20 + ((time * 120 + i * 37) % 160)), py = fy - 56 - ((time * 30 + i * 13) % 20); g.fillStyle = 'rgba(154,224,168,0.5)'; g.fillRect(Math.round(px2), Math.round(py), 2, 2); }   // wisps off its roof
}
/* THE DANGER GLOW: a red wash (a look's own `wash` colour: the dark's is his green, not fire) on the screen edge the chaser comes from, k = chaseDanger (0..1), still (reduce motion) = steady, no pulse */
export function drawGlow(g, sp, st, k, VW, VH, time, still) {
  if (!(k > 0.02)) return;
  const a = k * (still ? 0.5 : 0.42 + 0.18 * Math.sin(time * (6 + 8 * k))), size = 30 + 60 * k, from = sp.dir > 0 ? 0 : 1, vert = sp.axis === 'y';
  const grad = vert ? g.createLinearGradient(0, from ? VH : 0, 0, from ? VH - size : size) : g.createLinearGradient(from ? VW : 0, 0, from ? VW - size : size, 0);
  const wc = (LOOKS[sp.look] || {}).wash || '255,60,30'; grad.addColorStop(0, 'rgba(' + wc + ',' + a.toFixed(3) + ')'); grad.addColorStop(1, 'rgba(' + wc + ',0)');
  g.fillStyle = grad; if (vert) g.fillRect(0, from ? VH - size : 0, VW, size); else g.fillRect(from ? VW - size : 0, 0, size, VH);
}
/* THE RUMBLE the chaser gives through the shake budget: how strong a shake to ask of shakeCam this beat (0 = none), and how long to wait */
export const rumbleFor = k => k > 0.12 ? { n: 1 + 2.5 * k, every: 0.36 - 0.16 * k } : null;
