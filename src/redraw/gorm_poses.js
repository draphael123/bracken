// src/redraw/gorm_poses.js - KING GORM 2's POSES (claude/gorm2art, Sonnet art pass; greybox by claude/gorm2). B16: every move its own windup and release, each a REAL baked frame now (src/redraw/gorm_frames.js:
// the sceptre raised high / swept level, the limb torn off the oak, the burning club cocked behind the head / swung at the head / dragged and swept low, the boot cocked / kicking, the crouch / the leap / the flop,
// the fist drawn back / into the oak, the horn raised / at his lips, the claws drawn back / lunging; seated: the sceptre levelled for the charge, the claws, the horn, the fright of the flee). HIS LOOK STAYS: the
// same green jowls, crown and fur-trimmed robe; his old frames (stand, walk, kneel, held, litter idle) are still the baked ones from src/chars.js bakeKingBig.
// What is drawn at run time over a frame is only what MOVES: flames set on the club / limb tips (TIPS), the sweep's streak, the horn's rings, dust, the told marks.
import { UP, SEAT, BEARER, TIPS, upFrame, seatFrame } from './gorm_frames.js';
import * as FX from './gorm_fx.js';
import * as KP from './kingswood_props.js';
const R = Math.round;
const f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
/* the move -> [sheet, frame, prop]: 'seat' / 'up' are his baked sheets; 'seat2' / 'up2' are the poses of this pass (frames by name) */
const MARKS = { chargeTell: '!!', grabTell: '!!', sweepTell: '!', hornTell: '', limbTell: '', clubHiTell: '!', clubLoTell: '!!', logTell: '!!', quakeTell: '!!', shakeTell: '!!' };
export const POSES = {
  carried: ['seat2', 'idle'], chargeTell: ['seat2', 'chargeTell', 'rock'], charge: ['seat2', 'charge'], grabTell: ['seat2', 'grabTell'], grab: ['seat2', 'grab'], hornTell: ['seat2', 'hornTell', 'hornUp'], horn: ['seat2', 'horn', 'hornBlow'],
  held: ['seat2', 'held'], fleeTell: ['seat2', 'fleeTell', 'bearers'], fleeCarried: ['seat2', 'fleeCarried', 'bearers'], sleep: ['seat2', 'idle'], wake: ['seat2', 'wake'],
  walk: ['up2', 'stand'], rise: ['up2', 'rise'], sweepTell: ['up2', 'sweepTell', 'sceptreHigh'], sweep: ['up2', 'sweep', 'sceptreArc'], grabTellUp: ['up2', 'grabTellUp'], grabUp: ['up2', 'grabUp'],
  hornTellUp: ['up2', 'hornTellUp', 'hornUp'], hornUp: ['up2', 'hornUp', 'hornBlow'], heldUp: ['up2', 'heldUp'],
  limbTell: ['up2', 'limbTell', 'limbTear'], clubHiTell: ['up2', 'clubHiTell', 'clubFire'], clubHi: ['up2', 'clubHi', 'clubHiArc'], clubLoTell: ['up2', 'clubLoTell', 'clubFire'], clubLo: ['up2', 'clubLo', 'clubLoArc'],
  logTell: ['up2', 'logTell', 'logFeet'], log: ['up2', 'log', 'kick'], quakeTell: ['up2', 'quakeTell', 'crouch'], quakeAir: ['up2', 'quakeAir', 'air'], quake: ['up2', 'quake', 'flop'],
  toOak: ['up2', 'stand'], throneSleep: ['up2', 'throneSleep', 'stump'], throneWake: ['up2', 'throneWake', 'stump'], shakeTell: ['up2', 'shakeTell', 'fistBack'], shake: ['up2', 'shake', 'punch'], downed: ['up2', 'downed', 'downed'], stung: ['up2', 'stung', 'stung'],
};
export function poseOf(e) {
  const up = e.phase >= 2 || e.stage === 'glade';
  let k = e.mode;
  if (up && (k === 'grabTell' || k === 'grab' || k === 'hornTell' || k === 'horn' || k === 'held')) k = { grabTell: 'grabTellUp', grab: 'grabUp', hornTell: 'hornTellUp', horn: 'hornUp', held: 'heldUp' }[k];
  if (e.stage === 'glade' && (e.mode === 'sleep' || e.mode === 'wake')) k = e.mode === 'sleep' ? 'throneSleep' : 'throneWake';
  return POSES[k] || (up ? POSES.walk : POSES.carried);
}
/* (claude/gormanim) what he has WALKED, kept per king for the drawing only (a WeakMap: nothing of his state is touched): the step cycle and the bearers' feet are timed by the distance covered, so the feet never skate */
const WALKED = new WeakMap();
function walked(e) { let st = WALKED.get(e); if (!st) { st = { x: e.x, d: 0, still: 99 }; WALKED.set(e, st); }
  const dx = e.x - st.x; st.x = e.x; if (Math.abs(dx) < 40) st.d += Math.abs(dx); st.still = Math.abs(dx) > 0.02 ? 0 : st.still + 1; return st; }
const STRIDE = 7.5;   /* px of ground per frame of his six-frame step: his planted boot slides back by exactly this much a frame */
/* flames on a pose's tips (face right: x mirrored for a left-facing king) */
function fire(g, name, x, y, face, time, big) {
  const t = TIPS[name]; if (!t) return;
  for (let i = 0; i < t.length; i++) { const [tx, ty] = t[i]; FX.flame(g, x + face * tx, y + ty + 2, i === 0 ? (big ? 'L' : 'M') : 'S', time, i * 3 + x * 0.1); }
  const [tx, ty] = t[0]; FX.glow(g, x + face * tx, y + ty - 6, 30, 0.2);
}
/* api: { drawSet(set, key, frame, x, y, face, white, sx, sy, alpha, rot), SPR, PROP, text, bossActive, floor } */
export function drawGorm(g, e, cx, cy, time, api) {
  let [sheet, fr0, prop] = poseOf(e); const face = e.face || 1, white = e.flash > 0, x = e.x - cx, y = e.y - cy - (e.lift || 0);
  const tell = /Tell$/.test(e.mode), jig = tell ? R(Math.sin(e.anim * 50)) : 0;
  /* in the glade he walks with the burning club on his shoulder */
  const st = walked(e), afoot = sheet === 'up2' && fr0 === 'stand' && !prop;
  if (afoot) { const club = e.stage === 'glade' && e.club, moving = Math.abs(e.vx || 0) > 6 && st.still < 6, i = Math.floor(st.d / STRIDE) % 6;
    if (club) { fr0 = moving ? 'wc' + i : 'walkClub'; prop = 'walkClub'; } else fr0 = moving ? 'walk' + i : 'stand'; }
  const set = sheet === 'seat' ? api.SPR.king : sheet === 'up' ? api.SPR.kingUp : sheet === 'seat2' ? SEAT.set : UP.set;
  const fr = typeof fr0 === 'string' ? (sheet === 'seat2' ? seatFrame(fr0) : upFrame(fr0)) : fr0;
  const litter = (lx, ly) => g.drawImage(api.PROP.palanquin, R(lx) - 48, R(ly) - 36, 96, 45);
  /* the ward (B3): a pale shell round him while the hangings glance off */
  if (e.ward > 0 && e.alive) { g.save(); g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 8); g.strokeStyle = '#dfe8ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(x), R(y - (e.h || 45) / 2), 40, (e.h || 45) / 2 + 8, 0, 0, 6.283); g.stroke(); g.restore(); }
  if (sheet === 'seat' || sheet === 'seat2') {
    const ct = e.mode === 'chargeTell', carriedOn = st.still < 6 && e.mode !== 'charge' && e.mode !== 'fleeCarried' && !ct, bob = e.mode === 'charge' || e.mode === 'fleeCarried' ? R(Math.sin(e.anim * 40)) : ct ? -1 - R(Math.abs(Math.sin(e.anim * 24)) * 2) : carriedOn ? -(Math.floor(st.d / 6) & 1) : 0;
    bearers(g, x, y, e, face, true, st);   /* (behind the litter: the back pair) */
    litter(x - (ct ? face * (3 + R(Math.sin(e.anim * 30))) : 0), y + bob);
    for (const wx of [-22, 22]) { const cxw = R(x + wx), cyw = R(y + 6); g.fillStyle = '#3a2416'; g.beginPath(); g.arc(cxw, cyw, 5, 0, 7); g.fill(); g.fillStyle = '#8b6a2a'; g.beginPath(); g.arc(cxw, cyw, 2, 0, 7); g.fill(); }
    if (tell) api.drawSet(set, null, fr, x + jig, y + bob - 6, face, true, 1.06, 1.06, 0.3 + 0.25 * Math.sin(time * 22));   /* the tell's rim, not a white blob */
    api.drawSet(set, null, fr, x + jig, y + bob - 6, face, white, 1, 1);
    bearers(g, x, y, e, face, false, st);
  } else {
    const yy = y;   /* (the step cycle's own frames carry the bob now) */
    if (tell) api.drawSet(set, null, fr, x + jig, yy, face, true, 1.05, 1.05, 0.3 + 0.25 * Math.sin(time * 22), 0);   /* the tell's rim */
    api.drawSet(set, null, fr, x + jig, yy, face, white, 1, 1, 1, 0);
  }
  if (e.mode === 'rise' && e.stage !== 'glade') scatter(g, x, y, e);   /* (claude/gormfinish) the litter breaks: the four bearers drop the poles and bolt */
  overProp(g, e, prop, x, y, face, time, fr0);
  /* B10: the read over him - gold motes while the crown turns blades, a green ring and a timer bar while he is open */
  if (api.bossActive && e.alive && e.mode !== 'sleep') { const hx = R(x), hy = R(y - (e.h || 45)) - 8, op = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.open > 0;
    if (op) { const left = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' ? Math.max(0, e.modeT) / (e.mode === 'held' ? 3.2 : e.mode === 'downed' ? 3.5 : 4) : e.open / 4;
      g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(hx, R(y) - 2, 30, 6, 0, 0, 6.283); g.stroke(); g.restore();
      f(g, '#1a1a1a', hx - 16, hy - 4, 32, 3); f(g, '#8fd160', hx - 16, hy - 4, 32 * Math.min(1, left), 3); }
    else for (let q = 0; q < 4; q++) { const a = time * 5 + q * 1.6, gx = hx + R(Math.cos(a) * 16), gy = hy + R(Math.sin(a) * 4); g.fillStyle = q % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3); } }
  const mk = tell ? MARKS[e.mode] : ''; if (mk && api.text) api.text(mk, x, y - (e.h || 45) - 26, mk === '!!' ? '#ff6b6b' : '#ffd36b', 'center');   /* the mark src/marks.js holds for it: !! nothing turns it, ! a shield does */
}
/* THE BEARERS: four goblins of the court under the litter's poles - they crouch to lift it (the tell), then run it off. back = the pair behind the litter, front = the pair before it */
function bearers(g, x, y, e, face, back, st) {
  const run = e.mode === 'charge' || e.mode === 'fleeCarried', tellM = e.mode === 'fleeTell' || e.mode === 'chargeTell', walk = !run && !tellM && st.still < 6, set = BEARER;
  for (const [dx, k] of [[-40, 0], [-18, 1], [18, 2], [40, 3]]) { if ((k < 2) !== !!back) continue;
    /* their feet are timed by the ground the litter covers (st.d): a stride of 6 px at the walk (stand, step, stand, step), 12 at the run, so they never skate; at the tell they crouch and rock under the poles */
    const ph = Math.floor(st.d / (run ? 12 : 6)) + (k & 1) * (run ? 1 : 2);
    const fr = tellM ? (Math.floor(e.anim * 5 + k) % 2 ? 5 : 0) : run ? 3 + (ph & 1) : walk ? [1, 0, 2, 0][ph & 3] : 0, c = set[face < 0 ? 'L' : 'R'][fr], ax = face < 0 ? c.width - set.ax : set.ax;
    g.drawImage(c, R(x + dx) - ax, R(y + 9) - set.ay + (run || walk ? -((ph & 1) === (run ? 0 : 1) ? 0 : 1) : 0)); }
}
/* (claude/gormfinish) THE LITTER BREAKS (phase 2 'rise', 1.3 s): the bearers keep their places for a beat, then run off outward and fade; timed by the ground they have run (12 px a frame), draw-side only */
function scatter(g, x, y, e) {
  const t = Math.max(0, 1.3 - e.modeT), set = BEARER, go = Math.max(0, t - 0.15);
  for (const [dx, k] of [[-40, 0], [-18, 1], [18, 2], [40, 3]]) {
    const dir = dx < 0 ? -1 : 1, run = go * (110 + (k === 0 || k === 3 ? 25 : 0)), ph = Math.floor(run / 12), fr = go <= 0 ? 5 : 3 + ((ph + k) & 1), a = Math.max(0, Math.min(1, (1.3 - t) / 0.45));
    const c = set[dir < 0 ? 'L' : 'R'][fr], ax = dir < 0 ? c.width - set.ax : set.ax;
    g.save(); g.globalAlpha = a; g.drawImage(c, R(x + dx + dir * run) - ax, R(y + 9) - set.ay - (go > 0 && (ph + k) & 1 ? 1 : 0)); g.restore(); }
}
function arc(g, x, y, face, r, y0, y1, col) {
  g.save(); g.strokeStyle = col;
  for (let k = 0; k < 3; k++) { g.globalAlpha = 0.62 - k * 0.18; g.lineWidth = 3 - k; g.beginPath(); g.ellipse(R(x), R((y0 + y1) / 2), r - k * 5, Math.max(2, Math.abs(y1 - y0) / 2 + 3 - k), 0, face > 0 ? -1.2 + k * 0.25 : Math.PI - 1.2 + k * 0.25, face > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); }
  g.restore(); }
function overProp(g, e, prop, x, y, face, time, fr0) {
  if (!prop) return; const top = y - (e.h || 45);
  switch (prop) {
    case 'hornBlow': for (let k = 0; k < 3; k++) { const r = 8 + ((time * 40 + k * 10) % 30); g.save(); g.globalAlpha = 0.5 * (1 - r / 38); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(R(x + face * 40), R(top + 20), r, face > 0 ? -0.8 : Math.PI - 0.8, face > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); g.restore(); } break;
    case 'sceptreArc': arc(g, x + face * 20, y, face, 50, top + 4, y - 6, '#ffd36b'); break;
    case 'clubFire': fire(g, fr0, x, y, face, time, true); break;
    case 'walkClub': fire(g, fr0, x, y, face, time, false); break;
    case 'limbTear': fire(g, 'limbTell', x, y, face, time, false); for (let k = 0; k < 3; k++) { const t = (time * 1.4 + k / 3) % 1; g.globalAlpha = 1 - t; f(g, '#ffb04a', x - face * 18 + k * 14 * face, y - 64 - t * 20, 2, 2); g.globalAlpha = 1; } break;
    case 'clubHiArc': fire(g, 'clubHi', x, y, face, time, true); arc(g, x + face * 30, y, face, 56, top + 4, top + 34, '#ff9a5c'); break;
    case 'clubLoArc': fire(g, 'clubLo', x, y, face, time, true); arc(g, x + face * 30, y, face, 56, y - 18, y - 2, '#ff9a5c'); break;
    case 'logFeet': KP.drawLog(g, x + face * 34, y, 40, time, false, 0); for (let k = 0; k < 3; k++) FX.flame(g, x + face * (24 + k * 10), y - 12, 'M', time, k * 5 + 1); break;
    case 'kick': { KP.drawLog(g, x + face * 72, y, 40, time, false, 0); for (let k = 0; k < 3; k++) FX.flame(g, x + face * (62 + k * 10), y - 12, 'M', time, k * 5 + 1);
      for (let k = 0; k < 3; k++) f(g, '#fff6e0', x + face * (22 + k * 5), y - 22 - k * 3, 8 - k * 2, 1); break; }
    case 'crouch': for (let k = 0; k < 4; k++) FX.smoke(g, x - 34 + k * 22, y - 4 - (time * 8 + k * 3) % 6, (time * 1.5 + k * 0.25) % 1, 0.7); break;
    case 'air': g.save(); g.globalAlpha = 0.35; g.fillStyle = '#000'; g.beginPath(); g.ellipse(R(x), R(y + (e.lift || 0)), 30 - (e.lift || 0) * 0.3, 4, 0, 0, 6.283); g.fill(); g.restore(); break;
    case 'flop': for (let k = -2; k <= 2; k++) FX.smoke(g, x + k * 22, y - 6 - Math.abs(k), Math.min(1, 0.15 + 0.1 * Math.abs(k)), 1); break;
    case 'punch': for (let k = 0; k < 5; k++) { const a = (k / 5) * 2 - 1; f(g, '#ffd36b', x + face * (96 + (k % 2) * 3), top + 30 + a * 14, 2, 2); } break;
    case 'downed': for (let k = 0; k < 3; k++) { const a = time * 5 + k * 2.1, sx = x + R(Math.cos(a) * 18), sy = top + 18 + R(Math.sin(a) * 3); f(g, '#ffd36b', sx, sy - 1, 1, 3); f(g, '#ffd36b', sx - 1, sy, 3, 1); } break;
    case 'stung': for (let k = 0; k < 10; k++) { const a = time * (4 + k % 3) + k; f(g, k % 3 ? '#e0b040' : '#1a0e08', x + R(Math.cos(a) * 30), top + 10 + R(Math.sin(a * 1.3) * 22), 2, 1); } break;
  }
}
/* bake everything now (the level's load) */
export function warm() { void UP.set; void SEAT.set; void BEARER.R; }
