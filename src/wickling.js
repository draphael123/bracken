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
/* ITS POSES (B16: its own windup and release for every move - greybox shapes, the art lane draws them): drift, snuffTell (leaning into the flame, drinking), stealTell
   (crouched back, the flame flaring - the windup), dart (stretched forward - the release), recoil, burstTell (swollen white-hot) */
export function drawWickling(g, s, x, y, time, seen) {
  const R = Math.round, fl = Math.floor(time * 14 + x) % 2, fed = s.fed || 0, f = s.face || 1, X = R(x), Y = R(y);
  const sw = s.mode === 'burstTell' ? 1 + (1 - Math.max(0, s.modeT) / WK.burstTell) * 0.8 : 1;
  const lean = s.mode === 'snuffTell' ? 3 : s.mode === 'dart' ? 4 : s.mode === 'stealTell' ? -2 : 0, crouch = s.mode === 'stealTell' ? 2 : 0;
  const fh = R((5 + fed + (s.mode === 'stealTell' ? 3 : 0) + (fl ? 1 : 0)) * sw);
  /* the flame head - all that shows in the dark */
  g.globalAlpha = 0.28; g.fillStyle = s.mode === 'burstTell' ? '#fff6c8' : '#ff9a3c'; g.beginPath(); g.arc(X + f * lean, Y - 8 + crouch, R((7 + fed * 2) * sw), 0, 7); g.fill(); g.globalAlpha = 1;
  g.fillStyle = s.mode === 'burstTell' ? (fl ? '#ffffff' : '#fff6c8') : fl ? '#ff6b2c' : '#ff9a3c'; g.fillRect(X - 2 + f * lean, Y - 8 - fh + crouch, R(5 * sw), fh);
  g.fillStyle = '#ffd36b'; g.fillRect(X - 1 + f * lean, Y - 7 - R(fh * 0.6) + crouch, 3, R(fh * 0.6)); g.fillStyle = '#fff6c8'; g.fillRect(X + f * lean, Y - 6 + crouch, 1, 2);
  if (s.mode === 'snuffTell') { g.fillStyle = '#ffd36b'; for (let k = 0; k < 3; k++) g.fillRect(X + f * (4 + k * 2), Y - 10 - k, 1, 1); }   /* the lamp's flame drawn into it */
  if (!seen && s.mode !== 'burstTell') return;
  /* the wax body: a stub of grey wick-wax, two arms of drip */
  const by = Y - 6 + crouch;
  g.fillStyle = '#8a8478'; g.fillRect(X - 2 + R(f * lean * 0.5), by, 4, 6 - crouch); g.fillStyle = '#b8b0a0'; g.fillRect(X - 2 + R(f * lean * 0.5), by, 1, 6 - crouch); g.fillStyle = '#4a4640'; g.fillRect(X + 1 + R(f * lean * 0.5), by + 1, 1, 5 - crouch);
  const arm = s.mode === 'stealTell' ? -1 : s.mode === 'dart' ? 2 : 0;
  g.fillStyle = '#8a8478'; g.fillRect(X - 4 + f * arm, by + 2, 2, 1); g.fillRect(X + 2 + f * arm, by + 2, 2, 1);
  g.fillStyle = '#1b1626'; g.fillRect(X - 1 + f * (lean + 1), Y - 7 + crouch, 1, 1); g.fillRect(X + 1 + f * (lean + 1), Y - 7 + crouch, 1, 1);   /* its two black wick-eyes in the flame */
  if (s.mode === 'burstTell') { g.globalAlpha = 0.5 + 0.4 * fl; g.strokeStyle = '#ff6b6b'; g.setLineDash([3, 3]); g.beginPath(); g.arc(X, Y - 4, burstRadius(s), 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
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
