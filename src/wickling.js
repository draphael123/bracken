// src/wickling.js - THE WICKLING (claude/lamplit3, Daniel 10-18; the Lamplit Street 3's one new foe, built to be reused: the Lit Church, the Fog Canal /
// Lantern-Eater 2, the haunted manor). A small living lamp-flame: a wick-stub body of grey wax with a flame for a head, drifting a hand over the ground.
//   IT DRINKS LAMPS     it drifts to the nearest lit lamp and curls round the flame (snuffTell, told: the flame leans into it, 'IT DRINKS THE LAMP'); the lamp
//                       gutters out (the host's own told gutter) and the Wickling burns brighter (fed, up to WK.fedMax)
//   IT STEALS YOUR FIRE a hero carrying a flame within WK.sight is what it wants most: it hovers and flares (stealTell, a red '!!': no shield keeps a flame), then darts; a touch takes the
//                       flame out of your hand ('IT TAKES YOUR FLAME') - with no flame to take, the touch only scorches
//   STRUCK, IT BURSTS   any blow (or thrown fire, or burning oil) and it SWELLS (burstTell, a red '!!' and a ring: step clear) and bursts into fire - a burst that
//                       catches oil, lights the dead lamps in reach, burns a tar net and burns whoever stands in it. A threat and a tool: pop it beside the oil
//                       you want lit, never beside yourself. It is gone after its burst (the host spawns it again where the level asks)
//   IN THE DARK         only its flame shows: the body is drawn only where there is light (the host's lit test) or within the hero's own glow
//   THE WATER           it will not go under the water line; pushed in, it is DOUSED (a puff, no burst)
// Pure rules: wicklingStep(e, world, dt) -> events; world = { heroes: [{ x, y, flame, pp }], lamps: [{ x, y, lit, gut, ref }], water(x, y), floorBelow(x, y) }.
// makeWicklingHands(ctx) binds them (a level calls step / struck / fire / draw). WK_SAY lines are routed in src/hint-lines.js SAY_LINES.
export const WK = { w: 8, h: 10, hp: 12, speed: 34, hover: 18, sight: 150, lampSight: 260, snuffR: 8, snuffTell: 0.9, stealTell: 0.45, dart: 175, dartT: 0.42, touchR: 10,
  stealCd: 2.4, recoil: 0.8, burstTell: 0.38, burstR: 34, burstGrow: 0.25, burstDmg: 12, burstFoe: 26, touchDmg: 5, fedMax: 3, bob: 3 };
export const WK_SAY = { seen: 'A WICKLING: IT DRINKS LAMPS AND STEALS YOUR FIRE. STRUCK, IT BURSTS INTO FLAME', drink: 'IT DRINKS THE LAMP', steal: 'IT TAKES YOUR FLAME',
  swell: 'IT SWELLS: GET CLEAR', burst: 'THE WICKLING BURSTS', doused: 'DOUSED' };
export function newWickling(x, y, face) { return { mode: 'drift', modeT: 0.4 + Math.random() * 0.6, x, y, home: { x, y }, face: face || -1, fed: 0, cd: 0, target: null, bobT: Math.random() * 6, dx: 0, dy: 0 }; }
export const burstRadius = s => WK.burstR * (1 + WK.burstGrow * (s.fed || 0));
/* one frame of one Wickling. s: its state (newWickling); returns [{ t, ... }] for the host to act on */
export function wicklingStep(s, w, dt) {
  const ev = []; s.modeT -= dt; s.cd = Math.max(0, s.cd - dt); s.bobT += dt;
  const hov = (fx, fy) => ({ x: fx, y: fy - WK.hover + Math.sin(s.bobT * 3) * WK.bob });
  const toward = (tx, ty, v) => { const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy) || 1, k = Math.min(d, v * dt); s.dx = dx / d * k; s.dy = dy / d * k; if (Math.abs(dx) > 1) s.face = Math.sign(dx); return d; };
  s.dx = 0; s.dy = 0;
  if (s.mode === 'burstTell') { if (s.modeT <= 0) { s.mode = 'gone'; ev.push({ t: 'burst', x: s.x, y: s.y - 4, r: burstRadius(s) }); } return ev; }
  if (s.mode === 'gone') return ev;
  if (s.mode === 'snuffTell') { const L = s.target; if (!L || !L.lit) { s.mode = 'drift'; s.modeT = 0.4; s.target = null; return ev; }
    toward(L.x, L.y - 40, WK.speed); if (s.modeT <= 0) { ev.push({ t: 'snuff', lamp: L }); s.fed = Math.min(WK.fedMax, s.fed + 1); s.mode = 'drift'; s.modeT = 0.8; s.target = null; } return ev; }
  if (s.mode === 'stealTell') { const h = s.prey; if (h) s.face = Math.sign(h.x - s.x) || s.face; if (s.modeT <= 0) { s.mode = 'dart'; s.modeT = WK.dartT; const tx = h ? h.x : s.x + s.face * 40, ty = h ? h.y - 22 : s.y, d = Math.hypot(tx - s.x, ty - s.y) || 1; s.vx = (tx - s.x) / d * WK.dart; s.vy = (ty - s.y) / d * WK.dart; ev.push({ t: 'dart' }); } return ev; }
  if (s.mode === 'dart') { s.dx = s.vx * dt; s.dy = s.vy * dt; s.face = Math.sign(s.vx) || s.face;
    for (const h of w.heroes) if (Math.abs(h.x - (s.x + s.dx)) < WK.touchR && Math.abs(h.y - 18 - (s.y + s.dy)) < WK.touchR + 8) { ev.push({ t: h.flame ? 'steal' : 'touch', hero: h }); if (h.flame) s.fed = Math.min(WK.fedMax, s.fed + 1); s.mode = 'recoil'; s.modeT = WK.recoil; s.cd = WK.stealCd; return ev; }
    if (s.modeT <= 0) { s.mode = 'recoil'; s.modeT = WK.recoil; s.cd = WK.stealCd; } return ev; }
  if (s.mode === 'recoil') { const p = hov(s.x - s.face * 30, w.floorBelow(s.x, s.y)); toward(p.x, p.y, WK.speed * 1.5); if (s.modeT <= 0) { s.mode = 'drift'; s.modeT = 0.3; } return ev; }
  /* DRIFT: a carried flame first, then the nearest lit lamp, else home */
  if (s.cd <= 0) { let best = null, bd = WK.sight; for (const h of w.heroes) if (h.flame) { const d = Math.hypot(h.x - s.x, h.y - 18 - s.y); if (d < bd) { bd = d; best = h; } }
    if (best) { s.prey = best; if (bd < 46) { s.mode = 'stealTell'; s.modeT = WK.stealTell; ev.push({ t: 'stealTell' }); return ev; } toward(best.x, best.y - 26, WK.speed * 1.4); return ev; } }
  if (!s.target || !s.target.lit) { s.target = null; let bd = WK.lampSight; for (const L of w.lamps) if (L.lit && !(L.gut > 0) && Math.abs(L.y - 40 - s.y) < 90 && !w.water(L.x, L.y - 40)) { const d = Math.abs(L.x - s.x); if (d < bd) { bd = d; s.target = L; } } }
  if (s.target) { const d = toward(s.target.x, s.target.y - 40, WK.speed); if (d < WK.snuffR) { s.mode = 'snuffTell'; s.modeT = WK.snuffTell; ev.push({ t: 'snuffTell', lamp: s.target }); } return ev; }
  const p = hov(s.home.x + Math.sin(s.bobT * 0.5) * 24, w.floorBelow(s.home.x, s.home.y)); toward(p.x, p.y, WK.speed * 0.6);
  return ev;
}
/* a blow, thrown fire or burning oil on it: it swells, told, and bursts (once) */
export function wicklingStruck(s) { if (s.mode === 'burstTell' || s.mode === 'gone') return false; s.mode = 'burstTell'; s.modeT = WK.burstTell; return true; }
/* ITS POSES (B16: its own windup and release for every move; finished by claude/lamplit3art):
     drift      a teardrop flame swaying over a stub of grey wax, two drip-arms hanging, a wick thread between them; a tail of sparks
     snuffTell  leaning in, mouth open: the lamp's flame is drawn in as wisps spiralling to it (more as the drink goes on), the flame swelling
     stealTell  crouched back on its stub, arms flung out behind, the flame flared tall with red-edged spikes, eyes narrowed: the windup
     dart       stretched flat along its flight: a comet of flame laid back, the face forward, a spark tail: the release
     recoil     squashed small, the flame ducked low and dim, eyes screwed shut, sparks scattered
     burstTell  swollen white-hot: cracks of light across body and flame, eyes wide, mouth gaping, sparks radiating (and the dashed ring)
   in the dark only the flame and its halo show (the body where the host says it is seen) */
const CORE = ['#ff6b2c', '#ff9a3c', '#ffd36b', '#fff6c8'];
function flameShape(g, X, yb, h, w, lean, time, hot) {
  const R = Math.round;
  for (let r = 0; r < h; r++) { const f = r / h, wf = f < 0.28 ? 0.62 + f * 1.35 : Math.sqrt(Math.max(0, 1 - Math.pow((f - 0.28) / 0.72, 1.7))), ww = Math.max(1, R(w * wf)), sh = R(lean * f * f + Math.sin(time * 10 + r * 0.55) * 0.7 * f), x = X - (ww >> 1) + sh, y = yb - r - 1;
    g.fillStyle = hot ? '#ffb040' : CORE[0]; g.fillRect(x, y, ww, 1);
    if (ww >= 3) { g.fillStyle = hot ? '#ffe090' : CORE[1]; g.fillRect(x + 1, y, ww - 2, 1); }
    if (ww >= 4 && f < 0.7) { g.fillStyle = hot ? '#fff6c8' : CORE[2]; g.fillRect(x + 1, y, ww - 2, 1); }
    if (ww >= 5 && f < 0.42) { g.fillStyle = hot ? '#ffffff' : CORE[3]; g.fillRect(x + 2, y, ww - 4, 1); } }
}
export function drawWickling(g, s, x, y, time, seen) {
  const R = Math.round, fl = Math.floor(time * 14 + x) % 2, fed = s.fed || 0, f = s.face || 1, X = R(x), Y = R(y), m = s.mode;
  const tellK = m === 'burstTell' ? 1 - Math.max(0, s.modeT) / WK.burstTell : 0, sw = 1 + tellK * 0.8;
  const drink = m === 'snuffTell' ? 1 - Math.max(0, s.modeT) / WK.snuffTell : 0;
  const lean = m === 'snuffTell' ? 3 : m === 'dart' ? 6 : m === 'stealTell' ? -3 : m === 'recoil' ? -1 : R(Math.sin(time * 2.1 + x * 0.2) * 1.4);
  const crouch = m === 'stealTell' ? 3 : m === 'recoil' ? 4 : 0;
  const fh = m === 'recoil' ? 4 : R(((m === 'dart' ? 5 : 7) + fed + (m === 'stealTell' ? 5 : 0) + drink * 4 + (fl ? 1 : 0)) * sw);
  const fw = m === 'dart' ? 4 : R((5 + (fed > 1 ? 1 : 0) + (m === 'stealTell' ? 1 : 0)) * sw);
  const yb = Y - 8 + crouch;                                                       /* where the flame stands on the wick */
  /* the halo: all that tells you it is there in the dark */
  const hr = (11 + fed * 3 + drink * 4) * sw, hx = X + f * lean, hy = yb - fh * 0.5;
  g.save(); g.globalAlpha = m === 'burstTell' ? 0.55 : m === 'recoil' ? 0.2 : 0.34; const gr = g.createRadialGradient(hx, hy, 1, hx, hy, hr); gr.addColorStop(0, m === 'burstTell' ? '#fff6c8' : '#ffb050'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); g.restore();
  /* the comet tail of a dart: the flame laid back along its flight */
  if (m === 'dart') { const vx = s.vx || f, vy = s.vy || 0, sp = Math.hypot(vx, vy) || 1, tx = -vx / sp, ty = -vy / sp; for (let k = 1; k < 11; k++) { const w = Math.max(1, 5 - (k >> 1)); g.globalAlpha = 1 - k / 12; g.fillStyle = k < 4 ? '#ffd36b' : k < 7 ? '#ff9a3c' : '#ff6b2c'; g.fillRect(R(X + tx * k * 2.2 - w / 2), R(yb - 4 + ty * k * 2.2 - w / 2), w, w); } g.globalAlpha = 1; }
  /* the wax body (where it is seen): a stub of wick-wax on a melted foot, two drip-arms, a black wick thread */
  if (seen || m === 'burstTell') {
    const by = Y - 8 + crouch, bh = 8 - crouch, bx = X - 3 + R(f * lean * 0.4);
    g.fillStyle = '#6a655a'; g.fillRect(bx - 2, Y - 1, 10, 2); g.fillStyle = '#8a8478'; g.fillRect(bx - 1, Y - 1, 8, 1);                          /* the melted foot */
    g.fillStyle = m === 'burstTell' ? '#e8e0c8' : '#8a8478'; g.fillRect(bx, by, 6, bh); g.fillStyle = m === 'burstTell' ? '#fffbe8' : '#b8b0a0'; g.fillRect(bx, by, 2, bh); g.fillStyle = '#4a4640'; g.fillRect(bx + 5, by + 1, 1, bh - 1);
    g.fillStyle = m === 'burstTell' ? '#fff6c8' : '#b8b0a0'; g.fillRect(bx + 1, by + 3, 1, 4 + (fl && m === 'drift' ? 1 : 0)); g.fillRect(bx + 4, by + 4, 1, 3);   /* wax runs */
    g.fillStyle = m === 'burstTell' ? '#fff6c8' : '#2a2620'; g.fillRect(bx + 2, by - 1, 2, 2);                                                         /* the wick */
    const arm = m === 'stealTell' ? -3 : m === 'dart' ? 4 : m === 'snuffTell' ? 2 : m === 'recoil' ? -1 : 0, ay = by + 2 + (m === 'stealTell' ? -1 : m === 'snuffTell' ? -2 : 0);
    g.fillStyle = '#8a8478'; g.fillRect(bx - 3 + f * arm - (m === 'stealTell' ? 1 : 0), ay, 3, 1); g.fillRect(bx + 6 + f * arm, ay, 3, 1); g.fillStyle = '#b8b0a0'; g.fillRect(bx - 3 + f * arm, ay, 1, 1); g.fillRect(bx + 6 + f * arm, ay, 1, 1);
    if (m === 'stealTell') { g.fillStyle = '#8a8478'; g.fillRect(bx - 4 - f, ay - 2, 1, 2); g.fillRect(bx + 9 - f, ay - 2, 1, 2); }                           /* claws spread */
  }
  /* the flame head */
  flameShape(g, X + f * lean, yb, fh, fw, lean * f * 0.6, time, m === 'burstTell');
  if (m === 'stealTell') { for (let k = -2; k <= 2; k += 2) { g.fillStyle = '#ff5030'; g.fillRect(X + f * lean + k * 2, yb - fh - 2 - Math.abs(k), 1, 3); } }   /* the flare's red spikes */
  /* its face, in the flame: two dark eyes, and what it is doing with them */
  const ex = X + f * (lean + 1), ey = yb - 4 - (m === 'dart' ? 1 : 0);
  g.fillStyle = '#1b1626';
  if (m === 'stealTell') { g.fillRect(ex - 2, ey, 2, 1); g.fillRect(ex + 1, ey, 2, 1); g.fillRect(ex - 2, ey - 1, 1, 1); g.fillRect(ex + 2, ey - 1, 1, 1); g.fillRect(ex - 1, ey + 2, 3, 1); }           /* narrowed, angry, teeth */
  else if (m === 'recoil') { g.fillRect(ex - 2, ey - 1, 1, 1); g.fillRect(ex - 1, ey, 1, 1); g.fillRect(ex - 2, ey + 1, 1, 1); g.fillRect(ex + 1, ey - 1, 1, 1); g.fillRect(ex, ey, 1, 1); g.fillRect(ex + 1, ey + 1, 1, 1); }   /* >< */
  else if (m === 'burstTell') { g.fillStyle = '#fff'; g.fillRect(ex - 2, ey - 1, 2, 3); g.fillRect(ex + 1, ey - 1, 2, 3); g.fillStyle = '#1b1626'; g.fillRect(ex - 1, ey, 1, 1); g.fillRect(ex + 1, ey, 1, 1); g.fillRect(ex - 1, ey + 3, 3, 2); }   /* wide eyes, a gaping mouth */
  else if (m === 'snuffTell') { g.fillRect(ex - 1, ey, 1, 2); g.fillRect(ex + 1, ey, 1, 2); g.fillRect(ex, ey + 3, 1, 1 + (Math.floor(time * 10) & 1)); }   /* eyes shut tight on it, a small mouth working */
  else { g.fillRect(ex - 1, ey, 1, 2); g.fillRect(ex + 1, ey, 1, 2); }
  /* what is happening round it */
  if (m === 'snuffTell') { for (let k = 0; k < 6; k++) { const q = (drink * 1.2 + k / 6) % 1, ang = k * 1.05 + time * 5, rad = 14 * (1 - q); g.globalAlpha = 0.4 + 0.6 * q; g.fillStyle = q > 0.6 ? '#fff6c8' : q > 0.3 ? '#ffd36b' : '#ff9a3c'; g.fillRect(R(X + f * lean + Math.cos(ang) * rad), R(yb - 5 + Math.sin(ang) * rad * 0.8), 1 + (q > 0.5 ? 1 : 0), 1); } g.globalAlpha = 1; }   /* the lamp's flame drawn into it */
  if (m === 'recoil') { for (let k = 0; k < 4; k++) { const q = (time * 3 + k / 4) % 1; g.globalAlpha = 1 - q; g.fillStyle = k & 1 ? '#ffd36b' : '#ff6b2c'; g.fillRect(R(X + (k - 1.5) * 4 + Math.sin(q * 5 + k) * 3), R(yb - 3 - q * 9), 1, 1); } g.globalAlpha = 1; }
  if (m === 'burstTell') {
    g.fillStyle = '#ffffff'; for (let k = 0; k < 4; k++) { const ax = X - 2 + k * 2 - 1, ao = Math.floor(time * 20 + k) % 2; g.fillRect(ax + ao, Y - 7 + k, 1, 3); }                                  /* cracks of white light across the body */
    for (let k = 0; k < 10; k++) { const ang = k * 0.63 + time * 9, rad = (7 + tellK * 12) * (1 + (k & 1) * 0.3); g.fillStyle = k & 1 ? '#fff6c8' : '#ffd36b'; g.fillRect(R(X + Math.cos(ang) * rad), R(Y - 8 + Math.sin(ang) * rad), 1, 1); }   /* sparks radiating */
    g.globalAlpha = 0.5 + 0.4 * fl; g.strokeStyle = '#ff6b6b'; g.setLineDash([3, 3]); g.beginPath(); g.arc(X, Y - 4, burstRadius(s), 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
  if (m === 'drift' || m === 'snuffTell') for (let k = 0; k < 2; k++) { const q = (time * 1.4 + k * 0.5 + x * 0.01) % 1; g.globalAlpha = 0.8 * (1 - q); g.fillStyle = '#ffd36b'; g.fillRect(R(X + Math.sin(q * 7 + k * 3) * 4), R(yb - fh - q * 8), 1, 1); g.globalAlpha = 1; }   /* sparks off the tip */
}
/* THE HANDS: ctx = { hero(), players(), lamps(), water(x, y), floorBelow(x, y), snuff(lamp), steal(pp), touch(pp, x), burst(x, y, r, e), mark(e, txt, col), number(x, y, txt, col), sfx(k), seen(e) -> bool (lit or in the hero's glow), parts(p) } */
export function makeWicklingHands(ctx) {
  const H = { n: { snuffs: 0, steals: 0, touches: 0, bursts: 0, doused: 0 } }, said = {};
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  const st = e => { if (!e.wk) e.wk = newWickling(e.x, e.y - 6, e.face); return e.wk; };
  H.owns = e => !!e && e.t === 'wickling';
  H.reset = () => { for (const k in said) delete said[k]; };
  H.step = (e, dt) => {
    const s = st(e), P = ctx.hero(); if (!P || Math.abs(e.x - P.x) > 460) return;
    if (Math.abs(e.x - P.x) < 220) { if (ctx.beast) ctx.beast(); if (once('seen')) ctx.number(P.x, P.y - 40, WK_SAY.seen, '#ffd36b'); }
    s.x = e.x; s.y = e.y - 6;
    const evs = wicklingStep(s, { heroes: ctx.players().filter(p => !p.dead).map(p => ({ x: p.x, y: p.y, flame: ctx.hasFlame(p), pp: p })), lamps: ctx.lamps(), water: ctx.water, floorBelow: ctx.floorBelow }, dt);
    e.x += s.dx; e.y += s.dy; s.x = e.x; s.y = e.y - 6; e.face = s.face; e.mode = s.mode; e.vx = s.dx / Math.max(dt, 1e-4); e.stagger = 0;
    if (ctx.water(e.x, e.y - 6) && s.mode !== 'burstTell' && s.mode !== 'gone') { s.mode = 'gone'; H.n.doused++; ctx.number(e.x, e.y - 20, WK_SAY.doused, '#9fb4bd'); ctx.sfx('puff'); e.alive = false; return; }
    for (const v of evs) {
      if (v.t === 'snuffTell') { ctx.number(e.x, e.y - 30, WK_SAY.drink, '#ff9a5c'); ctx.sfx('gutter'); }
      else if (v.t === 'snuff') { H.n.snuffs++; ctx.snuff(v.lamp.ref || v.lamp); }
      else if (v.t === 'stealTell') { ctx.mark(e, '!!', '#ff6b6b'); ctx.sfx('snuffer'); }
      else if (v.t === 'dart') ctx.sfx('throwWhoosh');
      else if (v.t === 'steal') { H.n.steals++; ctx.steal(v.hero.pp); ctx.number(v.hero.x, v.hero.y - 36, WK_SAY.steal, '#ff9a5c'); }
      else if (v.t === 'touch') { H.n.touches++; ctx.touch(v.hero.pp, e.x); }
      else if (v.t === 'burst') { H.n.bursts++; ctx.number(e.x, e.y - 24, WK_SAY.burst, '#ff9a3c'); ctx.burst(v.x, v.y, v.r, e); e.alive = false; e.dying = 0; }
    }
    if (Math.random() < dt * (8 + s.fed * 6)) ctx.parts({ x: e.x + (Math.random() - 0.5) * 4, y: e.y - 14, vx: (Math.random() - 0.5) * 10, vy: -24, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ffd36b' : '#ff9a3c', size: 1, grav: -20 });
  };
  /* a blow / fire on it: the swell, told (the blow itself does nothing else - it is a flame) */
  H.struck = e => { const s = st(e); if (!wicklingStruck(s)) return false; e.mode = s.mode; ctx.mark(e, '!!', '#ff6b6b'); ctx.number(e.x, e.y - 30, WK_SAY.swell, '#ff6b6b'); ctx.sfx('ignite'); return true; };
  H.draw = (g, e, cx, cy, time) => { const s = st(e); drawWickling(g, s, e.x - cx, e.y - cy, time, ctx.seen(e)); };
  H.light = e => (e.wk && e.wk.mode !== 'gone' ? 30 + (e.wk.fed || 0) * 8 + (e.wk.mode === 'burstTell' ? 30 : 0) : 0);
  return H;
}
