// src/redraw/gorm_poses.js - KING GORM 2's POSES (claude/gorm2, GREYBOX - B16: every move its own windup and release; the Sonnet art lane repaints).
// His baked sheets (src/chars.js bakeKingBig): SEATED (on the litter) 0 idle, 1 throw, 2 shout, 3 reach, 4 held; STANDING 0 stand, 1 walk, 2 slam, 3 reach,
// 4 grab, 5 lift, 6 kneel. Every move below picks its own pair from those AND carries its own prop drawn over him (the horn, the sceptre high, the burning
// branch high or low, the log at his feet, the oak's trunk under his fist), so no two windups read alike. The art lane's hooks (lane report): real frames
// for each windup/release named in POSES, the bearers carrying him off, the downed and stung bodies, the club's fire.
const R = Math.round;
const f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
function flame(g, x, y, h, time, seed) { const k = Math.sin(time * 11 + seed) * 0.5 + 0.5, hh = h * (0.75 + 0.25 * k);
  f(g, '#a8301a', x - 3, y - hh, 6, hh); f(g, '#e0601a', x - 2, y - hh * 0.85, 4, hh * 0.85); f(g, '#ffb04a', x - 1, y - hh * 0.55, 2, hh * 0.55); f(g, '#fff0a8', x, y - hh * 0.3, 1, hh * 0.3); }
/* the move -> [sheet ('seat' | 'up'), frame, prop] (windups end in Tell; their releases are the plain names) */
const MARKS = { chargeTell: '!!', grabTell: '!!', sweepTell: '!', hornTell: '', limbTell: '', clubHiTell: '!', clubLoTell: '!!', logTell: '!!', quakeTell: '!!', shakeTell: '!!' };
export const POSES = {
  carried: ['seat', 0], chargeTell: ['seat', 2, 'rock'], charge: ['seat', 2], grabTell: ['seat', 1, 'handBack'], grab: ['seat', 3, 'handOut'], hornTell: ['seat', 1, 'hornUp'], horn: ['seat', 2, 'hornBlow'],
  held: ['seat', 4], fleeTell: ['seat', 4, 'bearers'], fleeCarried: ['seat', 0, 'bearers'], sleep: ['seat', 0], wake: ['seat', 2],
  walk: ['up', 0], rise: ['up', 6], sweepTell: ['up', 5, 'sceptreHigh'], sweep: ['up', 2, 'sceptreArc'], grabTellUp: ['up', 3, 'handBack'], grabUp: ['up', 4, 'handOut'],
  hornTellUp: ['up', 5, 'hornUp'], hornUp: ['up', 3, 'hornBlow'], heldUp: ['up', 6],
  limbTell: ['up', 5, 'limbTear'], clubHiTell: ['up', 5, 'clubHigh'], clubHi: ['up', 4, 'clubHiArc'], clubLoTell: ['up', 2, 'clubLow'], clubLo: ['up', 4, 'clubLoArc'],
  logTell: ['up', 2, 'logFeet'], log: ['up', 4, 'kick'], quakeTell: ['up', 2, 'crouch'], quakeAir: ['up', 5, 'air'], quake: ['up', 2, 'flop'],
  toOak: ['up', 0], throneSleep: ['up', 6, 'stump'], throneWake: ['up', 5, 'stump'], shakeTell: ['up', 3, 'fistBack'], shake: ['up', 4, 'punch'], downed: ['up', 6, 'downed'], stung: ['up', 3, 'stung'],
};
export function poseOf(e) {
  const up = e.phase >= 2 || e.stage === 'glade';
  let k = e.mode;
  if (up && (k === 'grabTell' || k === 'grab' || k === 'hornTell' || k === 'horn' || k === 'held')) k = { grabTell: 'grabTellUp', grab: 'grabUp', hornTell: 'hornTellUp', horn: 'hornUp', held: 'heldUp' }[k];
  if (e.stage === 'glade' && (e.mode === 'sleep' || e.mode === 'wake')) k = e.mode === 'sleep' ? 'throneSleep' : 'throneWake';
  return POSES[k] || (up ? POSES.walk : POSES.carried);
}
/* api: { drawSet(set, key, frame, x, y, face, white, sx, sy, alpha, rot), SPR, PROP, text, bossActive, floor } */
export function drawGorm(g, e, cx, cy, time, api) {
  const [sheet, fr0, prop] = poseOf(e), face = e.face || 1, white = e.flash > 0, x = e.x - cx, y = e.y - cy - (e.lift || 0);
  const tell = /Tell$/.test(e.mode), jig = tell ? R(Math.sin(e.anim * 50)) : 0;
  const litter = (lx, ly) => g.drawImage(api.PROP.palanquin, R(lx) - 48, R(ly) - 36, 96, 45);
  /* the ward (B3): a pale shell round him while the hangings glance off */
  if (e.ward > 0 && e.alive) { g.save(); g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 8); g.strokeStyle = '#dfe8ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(x), R(y - (e.h || 45) / 2), 40, (e.h || 45) / 2 + 8, 0, 0, 6.283); g.stroke(); g.restore(); }
  if (sheet === 'seat') {
    const ct = e.mode === 'chargeTell', bob = e.mode === 'charge' || e.mode === 'fleeCarried' ? R(Math.sin(e.anim * 40)) : ct ? -1 - R(Math.abs(Math.sin(e.anim * 24)) * 2) : 0;
    litter(x - (ct ? face * (3 + R(Math.sin(e.anim * 30))) : 0), y + bob);
    for (const wx of [-22, 22]) { const cxw = R(x + wx), cyw = R(y + 6); g.fillStyle = '#3a2416'; g.beginPath(); g.arc(cxw, cyw, 5, 0, 7); g.fill(); g.fillStyle = '#8b6a2a'; g.beginPath(); g.arc(cxw, cyw, 2, 0, 7); g.fill(); }
    if (tell) api.drawSet(api.SPR.king, null, fr0, x + jig, y + bob - 6, face, true, 1.06, 1.06, 0.3 + 0.25 * Math.sin(time * 22));   /* the tell's rim, not a white blob */
    api.drawSet(api.SPR.king, null, fr0, x + jig, y + bob - 6, face, white, 1, 1);
    if (prop === 'bearers') bearers(g, x, y, e.anim, e.mode === 'fleeCarried');
  } else {
    let sx = 1, sy = 1, rot = 0, yy = y;
    if (prop === 'crouch') { sy = 0.86; sx = 1.08; } else if (prop === 'flop') { sy = 0.78; sx = 1.14; } else if (prop === 'downed') { rot = -face * 1.2; yy = y - 8; } else if (prop === 'stung') rot = Math.sin(time * 18) * 0.12;
    if (tell) api.drawSet(api.SPR.kingUp, null, fr0, x + jig, yy, face, true, sx * 1.05, sy * 1.05, 0.3 + 0.25 * Math.sin(time * 22), rot);   /* the tell's rim */
    api.drawSet(api.SPR.kingUp, null, fr0, x + jig, yy, face, white, sx, sy, 1, rot);
  }
  overProp(g, e, prop, x, y, face, time);
  /* the club he carries in the glade, walking */
  if (e.stage === 'glade' && e.club && !prop) club(g, x + face * 22, y - 30, face, 0.5, time);
  /* B10: the read over him - gold motes while the crown turns blades, a green ring and a timer bar while he is open */
  if (api.bossActive && e.alive && e.mode !== 'sleep') { const hx = R(x), hy = R(y - (e.h || 45)) - 8, op = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.open > 0;
    if (op) { const left = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' ? Math.max(0, e.modeT) / (e.mode === 'held' ? 3.2 : e.mode === 'downed' ? 3.5 : 4) : e.open / 4;
      g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(hx, R(y) - 2, 30, 6, 0, 0, 6.283); g.stroke(); g.restore();
      f(g, '#1a1a1a', hx - 16, hy - 4, 32, 3); f(g, '#8fd160', hx - 16, hy - 4, 32 * Math.min(1, left), 3); }
    else for (let q = 0; q < 4; q++) { const a = time * 5 + q * 1.6, gx = hx + R(Math.cos(a) * 16), gy = hy + R(Math.sin(a) * 4); g.fillStyle = q % 2 ? '#ffd36b' : '#fff6c8'; g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3); } }
  const mk = tell ? MARKS[e.mode] : ''; if (mk && api.text) api.text(mk, x, y - (e.h || 45) - 26, mk === '!!' ? '#ff6b6b' : '#ffd36b', 'center');   /* the mark src/marks.js holds for it: !! nothing turns it, ! a shield does */
}
function bearers(g, x, y, t, run) { for (const [dx, k] of [[-34, 0], [-18, 1], [18, 2], [34, 3]]) { const st = run ? R(Math.sin(t * 20 + k * 1.6) * 2) : 0, bx = R(x + dx);
  f(g, '#3f6e2c', bx - 3, y - 12 + st, 6, 9); f(g, '#6faa4a', bx - 3, y - 17 + st, 6, 5); f(g, '#8a5a32', bx - 4, y - 8 + st, 8, 3); f(g, '#2a1a10', bx - 2 + st, y - 3, 2, 3); f(g, '#2a1a10', bx + 1 - st, y - 3, 2, 3);
  f(g, '#c9b27c', bx - 5, y - 15 + st, 10, 1); } }
function horn(g, x, y, face, up) { const s = face; f(g, '#e8dcc0', x, y, s * 10, 3); f(g, '#c9b27c', x + s * 8, y - 2, s * 5, 6); f(g, '#e0b040', x + s * 3, y, s * 1, 3); if (up) f(g, '#a83a2a', x + s * 2, y + 3, s * 2, 4); }
function club(g, x, y, face, ang, time) { const len = 34, dx = Math.cos(ang) * len * face, dy = -Math.sin(ang) * len;
  for (let i = 0; i <= 12; i++) { const t = i / 12; f(g, '#3a2214', x + dx * t - 2, y + dy * t - 2, 4, 4); f(g, '#5a3a24', x + dx * t - 1, y + dy * t - 2, 2, 2); }
  flame(g, x + dx, y + dy + 2, 12, time, x); flame(g, x + dx * 0.8, y + dy * 0.8 + 2, 8, time, x + 3); }
function arc(g, x, y, face, r, y0, y1, col) { g.save(); g.globalAlpha = 0.55; g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.ellipse(R(x), R((y0 + y1) / 2), r, Math.max(2, Math.abs(y1 - y0) / 2 + 3), 0, face > 0 ? -1.2 : Math.PI - 1.2, face > 0 ? 1.2 : Math.PI + 1.2); g.stroke(); g.restore(); }
function overProp(g, e, prop, x, y, face, time) {
  if (!prop) return; const top = y - (e.h || 45);
  switch (prop) {
    case 'hornUp': horn(g, x + face * 14, top + 22, face, true); break;
    case 'hornBlow': horn(g, x + face * 14, top + 20, face, false); for (let k = 0; k < 3; k++) { const r = 8 + ((time * 40 + k * 10) % 30); g.save(); g.globalAlpha = 0.5 * (1 - r / 38); g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(R(x + face * 30), R(top + 22), r, face > 0 ? -0.8 : Math.PI - 0.8, face > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); g.restore(); } break;
    case 'handBack': f(g, '#6faa4a', x - face * 30, top + 18, 8, 8); f(g, '#3f6e2c', x - face * 30, top + 25, 8, 1); break;
    case 'handOut': f(g, '#6faa4a', x + face * 34 - 4, top + 24, 10, 9); break;
    case 'rock': break;
    case 'sceptreHigh': f(g, '#8b6a2a', x - face * 6, top - 18, 2, 30); f(g, '#ffd36b', x - face * 6 - 3, top - 24, 8, 7); f(g, '#c9463d', x - face * 6 - 1, top - 22, 4, 3); break;
    case 'sceptreArc': f(g, '#8b6a2a', x + face * 10, top + 26, face * 36, 2); f(g, '#ffd36b', x + face * 44 - 3, top + 22, 7, 7); arc(g, x + face * 20, y, face, 46, top + 6, y - 6, '#ffd36b'); break;
    case 'limbTear': club(g, x - face * 4, top + 6, face, 1.7, time); break;
    case 'clubHigh': club(g, x - face * 8, top + 10, -face, -0.6, time); break;
    case 'clubHiArc': club(g, x + face * 16, top + 22, face, 0.05, time); arc(g, x + face * 26, y, face, 54, top + 4, top + 34, '#ff9a5c'); break;
    case 'clubLow': club(g, x - face * 10, y - 16, -face, 0.25, time); break;
    case 'clubLoArc': club(g, x + face * 16, y - 10, face, -0.12, time); arc(g, x + face * 26, y, face, 54, y - 18, y - 2, '#ff9a5c'); break;
    case 'logFeet': f(g, '#2a1410', x + face * 18, y - 12, face * 26, 12); f(g, '#5a3a24', x + face * 19, y - 11, face * 24, 3); flame(g, x + face * 30, y - 10, 8, time, x); break;
    case 'kick': f(g, '#3f6e2c', x + face * 18, y - 14, face * 14, 8); break;
    case 'crouch': for (let k = 0; k < 3; k++) f(g, '#c9b27c', x - 30 + k * 30, y - 2, 6, 2); break;
    case 'air': g.save(); g.globalAlpha = 0.35; g.fillStyle = '#000'; g.beginPath(); g.ellipse(R(x), R(y + (e.lift || 0)), 30 - (e.lift || 0) * 0.3, 4, 0, 0, 6.283); g.fill(); g.restore(); break;
    case 'flop': for (let k = -2; k <= 2; k++) f(g, '#c9b27c', x + k * 14 - 3, y - 4 - (2 - Math.abs(k)) * 2, 6, 3); break;
    case 'fistBack': f(g, '#6faa4a', x - face * 30, top + 22, 9, 9); break;
    case 'punch': f(g, '#6faa4a', x + face * 36 - 4, top + 22, 11, 10); for (let k = 0; k < 4; k++) f(g, '#ffd36b', x + face * (44 + k * 3), top + 18 + k * 4, 2, 2); break;
    case 'stump': break;
    case 'downed': for (let k = 0; k < 3; k++) { const a = time * 5 + k * 2.1; f(g, '#ffd36b', x + R(Math.cos(a) * 18), top + 26 + R(Math.sin(a) * 3), 2, 2); } break;
    case 'stung': for (let k = 0; k < 10; k++) { const a = time * (4 + k % 3) + k; f(g, k % 3 ? '#e0b040' : '#1a0e08', x + R(Math.cos(a) * 30), top + 10 + R(Math.sin(a * 1.3) * 22), 2, 1); } break;
  }
}
