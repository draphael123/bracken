// src/redraw/cistern_queen_art.js - THE CISTERN QUEEN, drawn (claude/welltown3). A giant scorpion matriarch, drawn live from her pose (not a sprite
// sheet: she is too big and too many-jointed for one) - a dark chitin body as long as a cart, eight legs, two great claws held up in GUARD, and her tail
// curled up over her back to a LIT STINGER (amber, white-hot while it is told). Her size is the read: on the floor she stands three heroes tall to the
// tip of the tail and ten long. Every pose is the same body turned: clinging to a wall (turned on end, claws to the hall), hanging in the shaft (upside
// down), SOAKED (wet and slumped, the guard down), ON HER BACK (legs kicking), REARING (up on her tail, underbelly bare), the DEATH ROLL (spinning).
// Also: the hall's windlass, the shaft's bucket and rope, the two side tunnels, and over everything her tells on the floor and what she throws.
//   drawQueen(g, e, S, x, y, time)   x, y = her feet on screen.   bakeCisternQueen() -> a sprite set for the bestiary and her body (CQ_F names its frames)
import { TAIL, tailPose } from '../cistern-queen.js';   /* (claude/underwell3) her tail's one table, and the pose that picks a path */
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

export const QC = { chit0: '#1a100c', chit1: '#5a3c2e', chit2: '#86593f', chit3: '#b8805a', rim: '#f2cf90', sand: '#d8b47a', belly: '#9a7a58', bellyL: '#c8a87c', leg: '#a06c46', legD: '#6e4630', legL: '#d9a56c',
  eye: '#ff6a3a', eyeL: '#ffd0a0', sting: '#ffb84a', stingHot: '#fff2c0', stingCore: '#ff6a2a', venom: '#a6e04a', venomD: '#4e7a24', wet: '#7ab8e8', wetL: '#d8eef8', claw: '#9c6642', clawL: '#e4a86c' };
const R = Math.round;
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, c, x, y, rx, ry, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(R(x), R(y), Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); g.fill(); };
const ln = (g, c, w, pts) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };

/* THE BODY in her own frame: origin at her feet (the floor under her middle), +x forward (her head), -y up. o = { t, walk, claw: 'guard'|'down'|'forward'|'snap'|'up',
   tail: 'curl'|'lance'|'sweep'|'flick'|'high'|'pin'|'down', clawReach, lanceTo: [dx, dy], hot (the stinger told), wet, flash, legs: 'walk'|'splay'|'kick'|'still' } */
export function drawBody(g, o) {
  const t = o.t || 0, k = o.walk ? Math.sin(t * 12) : 0, wet = o.wet || 0;
  const C = o.flash ? { chit0: '#fff', chit1: '#fff', chit2: '#fff', chit3: '#fff', rim: '#fff', belly: '#fff', bellyL: '#fff', claw: '#fff', clawL: '#fff', legD: '#fff', leg: '#fff', legL: '#fff' } : QC;
  /* THE LEGS (polish): thick, lighter than the floor and the body, a dark edge under a lit one, a knee and a pale foot-claw - they read on the dark hall */
  const legs = o.legs || 'walk';
  for (let i = 0; i < 4; i++) { const bx = -26 + i * 15, ph = (i % 2 ? 1 : -1) * k;
    for (const side of [0, 1]) { const sh = side ? 0 : 1, col = side ? C.leg : C.legD, hi = side ? C.legL : C.leg;
      let pts;
      if (legs === 'kick') { const a = Math.sin(t * 16 + i * 1.7 + side) * 6; pts = [[bx, -14], [bx - 6 + a, -34], [bx + 4 + a, -46]]; }
      else { const fx = bx + (legs === 'splay' ? (i - 1.5) * 9 : ph * 5 - 4), lift = legs === 'walk' ? Math.max(0, ph) * 4 : 0; pts = [[bx, -14 - sh], [fx - 7, -30 + sh * 2], [fx - 11, -lift]]; }
      ln(g, C.chit0, 7, pts); ln(g, col, 4.6, pts); ln(g, hi, 1.4, pts.map(([x, y]) => [x - 0.8, y - 1]));
      const [kx, ky] = pts[1], [fx2, fy2] = pts[2]; ell(g, hi, kx, ky, 2.6, 2.6); fr(g, C.rim, kx - 1, ky - 3, 2, 2); ell(g, C.legL, fx2, fy2, 2.4, 1.6); fr(g, C.rim, fx2 - 3, fy2 - 1, 5, 1); } }
  /* THE TAIL: seven segments from her rump, curled up over her back to the stinger (or out at what it is doing). Dark edge, lit top. */
  const tail = o.tail || 'curl', segs = [];
  { let px = -42, py = -22; segs.push([px, py]);
    const path = TAIL[tail] || null; /* (claude/underwell3: the one table, src/cistern-queen.js TAIL - the stinger a blow must find is the one drawn) */
    if (tail === 'lance' && o.lanceTo) { const [tx, ty] = o.lanceTo; for (let i = 1; i <= 6; i++) { const q = i / 6, ax = px + (tx - px) * q, ay = py + (ty - py) * q - Math.sin(q * Math.PI) * 70; segs.push([ax, ay]); } }
    else for (const [ax, ay] of path || []) segs.push([ax + (tail === 'curl' ? Math.sin(t * 2.2) * 2 : 0), ay + (tail === 'curl' ? Math.cos(t * 2.2) * 2 : 0)]); }
  for (let i = segs.length - 1; i >= 1; i--) { const [x0, y0] = segs[i - 1], [x1, y1] = segs[i], r = 10.5 - i * 0.7;
    ln(g, C.chit0, r * 2 + 3, [[x0, y0], [x1, y1]]); ln(g, C.chit2, r * 2, [[x0, y0], [x1, y1]]);
    ell(g, C.chit0, x1, y1, r + 1.4, r * 0.85 + 1.4); ell(g, C.chit2, x1, y1, r, r * 0.85); ell(g, C.chit3, x1 - 1, y1 - r * 0.35, r * 0.62, r * 0.36); fr(g, C.rim, x1 - r * 0.6, y1 - r * 0.9, r * 1.2, 1.5); }
  /* THE STINGER (polish): an amber bulb in a real halo (a gradient, not a flat disc), a pale hook and a core - and white-hot, bigger and ringed while it is told */
  { const [sx, sy] = segs[segs.length - 1], [qx, qy] = segs[segs.length - 2] || [sx - 4, sy + 4], a = Math.atan2(sy - qy, sx - qx), green = o.venomHot;
    const hot = o.hot ? 0.6 + 0.4 * Math.abs(Math.sin(t * 18)) : 0, glow = 0.55 + 0.2 * Math.abs(Math.sin(t * 3)) + hot * 0.35, R0 = 22 + hot * 12;
    const cA = green ? '166,224,74' : '255,184,74', cH = green ? '214,255,140' : '255,242,192';
    const gr = g.createRadialGradient(sx, sy, 2, sx, sy, R0); gr.addColorStop(0, 'rgba(' + (o.hot ? cH : cA) + ',' + Math.min(1, glow) + ')'); gr.addColorStop(0.45, 'rgba(' + cA + ',' + (glow * 0.4) + ')'); gr.addColorStop(1, 'rgba(' + cA + ',0)');
    g.fillStyle = gr; g.fillRect(sx - R0, sy - R0, R0 * 2, R0 * 2);
    if (o.hot) { g.strokeStyle = 'rgba(' + cH + ',' + (0.5 + 0.4 * hot) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(sx, sy, 11 + hot * 5, 0, Math.PI * 2); g.stroke(); }
    ell(g, QC.chit0, sx, sy, 11, 10, a); ell(g, green ? QC.venom : QC.stingCore, sx, sy, 9, 8, a); ell(g, o.hot ? (green ? '#eaffb0' : QC.stingHot) : (green ? '#d6f8a0' : '#ffd070'), sx - 1, sy - 1, 5, 4, a);
    const bx = sx + Math.cos(a) * 15, by = sy + Math.sin(a) * 15, h1 = [bx + Math.cos(a + 1.9) * 7, by + Math.sin(a + 1.9) * 7];
    ln(g, QC.chit0, 5, [[sx + Math.cos(a) * 5, sy + Math.sin(a) * 5], [bx, by], h1]); ln(g, o.hot ? QC.stingHot : '#ffe2a0', 2.2, [[sx + Math.cos(a) * 6, sy + Math.sin(a) * 6], [bx, by], h1]); }
  /* THE BODY: a long segmented carapace, the underbelly paler, a continuous sandy rim light along the top and the head */
  ell(g, C.chit0, -4, -24, 50, 18); ell(g, C.belly, -6, -16, 46, 10); ell(g, C.chit1, -4, -24, 48, 16);
  for (let i = 0; i < 5; i++) { const x = -38 + i * 16; ell(g, C.chit0, x, -26, 12.4, 15.4); ell(g, i % 2 ? C.chit3 : C.chit2, x, -26, 11, 14); fr(g, C.chit3, x - 6, -34 + Math.abs(i - 2), 10, 2); }
  ln(g, C.rim, 2, [[-46, -36], [-36, -40], [-20, -42], [-4, -42], [12, -41], [28, -38], [38, -34]]);
  ell(g, C.bellyL, -6, -12, 40, 3);
  /* THE HEAD and the eyes (a cluster, lit) */
  ell(g, C.chit0, 40, -24, 17.5, 14.5); ell(g, C.chit3, 40, -24, 16, 13); fr(g, C.rim, 30, -36, 20, 2);
  for (const [ex, ey] of [[46, -30], [50, -28], [43, -27]]) { ell(g, QC.eye, ex, ey, 2.4, 2.4); fr(g, QC.eyeL, ex - 1, ey - 1, 1.5, 1.5); }
  ln(g, C.chit0, 4, [[52, -20], [59, -15]]); ln(g, C.clawL, 2, [[52, -20], [59, -15]]); ln(g, C.chit0, 4, [[52, -24], [61, -26]]); ln(g, C.clawL, 2, [[52, -24], [61, -26]]);
  /* THE CLAWS (polish): two great pincers on thick lit arms - pale-rimmed, tipped bright, so the GUARD (the raised claws that turn a blow) and every snap read against the hall */
  const claw = o.claw || 'guard', reach = o.clawReach || 0;
  for (const side of [1, 0]) { const col = side ? C.claw : C.chit3, colL = side ? C.clawL : C.claw, dy = side ? 0 : 4;
    let sh = [44, -22 + dy], el, hand, open = 0.3;
    if (claw === 'guard') { el = [62, -40 + dy]; hand = [70 - side * 6, -60 + dy * 2]; open = 0.25 + 0.15 * Math.sin(t * 3 + side); }
    else if (claw === 'down') { el = [60, -14 + dy]; hand = [74, -6 + dy]; open = 0.1; }
    else if (claw === 'up') { el = [56, -60 + dy]; hand = [50 + side * 14, -88 + dy]; open = 0.6 + 0.3 * Math.sin(t * 20 + side * 2); }
    else if (claw === 'snap') { el = [70, -28 + dy]; hand = [94, -26 + dy]; open = side ? 0.05 : 0.9; }
    else { el = [70, -26 + dy]; hand = [86 + reach, -22 + dy]; open = 0.75; }
    ln(g, C.chit0, 11, [sh, el, hand]); ln(g, col, 8, [sh, el, hand]); ln(g, colL, 2, [[sh[0], sh[1] - 3], [el[0], el[1] - 3], [hand[0], hand[1] - 3]]); ell(g, colL, el[0], el[1] - 1, 4, 3); fr(g, C.rim, el[0] - 2, el[1] - 4, 4, 1);
    /* the pincer: a heavy palm and two long fingers that open, the tips bright */
    const [hx, hy] = hand, u = [[hx + 6, hy - 3], [hx + 20, hy - 7 - open * 11]], d = [[hx + 6, hy + 3], [hx + 20, hy + 5 + open * 7]];
    ln(g, C.chit0, 9.5, u); ln(g, C.chit0, 9.5, d); ell(g, C.chit0, hx, hy, 15.5, 12.5);
    ln(g, col, 6.5, u); ln(g, col, 6.5, d); ell(g, col, hx, hy, 14, 11); ell(g, colL, hx - 2, hy - 4, 8, 3.2); ln(g, C.rim, 1.4, [[hx - 8, hy - 6], [hx + 6, hy - 8], u[1]]); fr(g, '#f6e0b0', u[1][0] - 1, u[1][1] - 1, 4, 3); fr(g, '#f6e0b0', d[1][0] - 1, d[1][1] - 1, 4, 3); }
  /* WET: the water running off her */
  if (wet > 0) { g.globalAlpha = 0.35 * wet; ell(g, QC.wet, -4, -26, 50, 16); g.globalAlpha = 1; for (let i = 0; i < 6; i++) { const x = -40 + i * 15, y = -10 + ((t * 40 + i * 13) % 16); fr(g, QC.wetL, x, y, 1, 2); } }
  /* (claude/underwell3) SCORCHED: the fire has cracked her shell - glowing seams across every plate, embers rising off them */
  if (o.scorch > 0) { const p = 0.6 + 0.4 * Math.abs(Math.sin(t * 9)); g.globalAlpha = p; for (let i = 0; i < 5; i++) { const x = -38 + i * 16; ln(g, '#ffb84a', 1.4, [[x - 6, -36], [x - 1, -28], [x - 4, -20], [x + 2, -14]]); fr(g, '#fff2c0', x - 2, -29, 2, 2); }
    ln(g, '#ff9a3c', 1.2, [[30, -34], [36, -26], [32, -18]]); g.globalAlpha = 1; for (let i = 0; i < 5; i++) { const x = -40 + ((i * 23 + t * 30) % 80), y = -40 - ((t * 50 + i * 17) % 22); fr(g, i % 2 ? '#ffd36b' : '#ff9a3c', x, y, 2, 2); } }
}

/* HER ON THE SCREEN, by pose */
export function drawQueen(g, e, S, x, y, time, cx, cy) {
  if (S.pose === 'burrow' || S.pose === 'tunnel' || e.gone > 0 && e.mode !== 'pounce') { if (!(S.pose === 'shaft')) return; }
  const m = e.mode, tellHot = /Tell$/.test(m) && m !== 'diveTell' && m !== 'climbTell' && m !== 'floodTell' && m !== 'broodTell', flash = (e.flash > 0) || (tellHot && Math.floor(time * 14) % 2 === 0 && e.modeT < 0.3);
  const o = { t: time, walk: m === 'walk' || m === 'ambush', claw: 'guard', tail: 'curl', hot: tellHot && /lance|pin|sting|tidal|sweep/.test(m), flash, legs: 'walk', wet: S.flood ? 0.4 : 0 };
  if (m === 'pincerTell') { o.claw = 'snap'; } if (m === 'pincer' || m === 'snap' || m === 'snap2') { o.claw = 'forward'; o.clawReach = 8; }
  if (m === 'snapTell' || m === 'snap2Tell') o.claw = 'snap';
  if (m === 'lungeTell' || m === 'lunge') { o.claw = 'forward'; o.clawReach = m === 'lunge' ? 12 : 0; o.tail = 'high'; }
  if (m === 'lanceTell') { o.tail = 'high'; o.hot = true; } if (m === 'lance' && S.cur) { o.tail = 'lance'; o.lanceTo = [(S.cur.x - e.x) * (e.face || 1), 0]; o.hot = true; }
  if (m === 'flickTell' || m === 'flick') o.tail = 'flick';
  if (m === 'barbTell' || m === 'barb') { o.tail = 'pin'; o.hot = true; }
  if (m === 'sweepLowTell') { o.tail = 'back'; o.hot = true; o.claw = 'down'; } if (m === 'sweepHighTell') { o.tail = 'backHigh'; o.hot = true; o.claw = 'up'; } if (m === 'sweepLow' || m === 'sweepHigh') o.tail = 'sweep';
  if (m === 'pinTell') { o.tail = 'pin'; o.hot = true; } if (m === 'pin' || m === 'pinned') { o.tail = 'pin'; o.claw = 'down'; }
  if (m === 'grabTell') { o.claw = 'snap'; } if ((m === 'grab' || m === 'hold') && S.claw) { o.claw = 'forward'; o.clawReach = S.claw.reach; }
  if (m === 'tidalTell') { o.tail = 'high'; o.hot = true; } if (m === 'tidal') o.tail = 'sweep';
  if (m === 'soaked') { o.claw = 'down'; o.tail = 'down'; o.legs = 'splay'; o.wet = 1; o.walk = false; }
  if (m === 'rear') { o.claw = 'up'; o.legs = 'kick'; }
  if (m === 'recover' || m === 'surface') o.legs = 'still';
  if (m === 'slamTell') { o.claw = 'up'; o.hot = false; } if (m === 'spitTell') { o.claw = 'down'; o.tail = 'spit'; o.hot = true; o.venomHot = true; }
  if (m === 'tidalTell') { o.venomHot = true; } if (m === 'waveTell') { o.claw = 'up'; } if (m === 'pounceTell') { o.claw = 'up'; o.tail = 'high'; o.crouch = true; } if (m === 'lungeTell') o.crouch = true; if (m === 'rollTell') { o.claw = 'down'; o.legs = 'still'; o.lean = true; }
  if (e.guardFx > 0) o.flash = true;
  const face = e.face || 1;
  /* (claude/underwell3) HER TAIL by src/cistern-queen.js tailPose - the same choice the hit on her stinger makes; the stinger stuck in the floor (a sting, the slam, the slip) runs the tail down to it, hot-white */
  { const tp = tailPose(e, S); o.tail = tp.tail; o.lanceTo = tp.lanceTo; if (tp.tail === 'lance') o.hot = true; }
  if (m === 'sslamTell') { o.claw = 'up'; o.hot = true; o.crouch = true; } if (m === 'planted') { o.claw = 'down'; o.legs = 'still'; }
  if (m === 'slip') { o.claw = 'down'; o.legs = 'splay'; o.wet = 1; o.walk = false; }
  if (e.scorch > 0) o.scorch = Math.min(1, e.scorch);
  g.save(); g.translate(x, y);
  const onWall = S.pose === 'wall' && m !== 'pin' && m !== 'pinned';
  /* ON A WALL: her legs on the stone, her back to the hall, head down to the floor and her tail up toward the ledge over her */
  if (onWall) { const west = S.wall === 'W'; g.translate(west ? -16 : 16, -84); if (west) g.rotate(Math.PI / 2); else { g.rotate(-Math.PI / 2); g.scale(-1, 1); } g.scale(0.82, 0.82); }
  else if (S.pose === 'shaft') { g.rotate(Math.PI); }
  else if (m === 'fallen') { g.translate(0, -30); g.scale(1, -1); o.legs = 'kick'; o.claw = 'up'; o.tail = 'down'; }
  else if (m === 'rear') { g.translate(-10, 0); g.rotate(-0.55 * face); }
  else if (m === 'roll') { g.translate(0, -24); g.rotate(time * 14 * face); g.translate(0, 24); o.legs = 'still'; o.claw = 'down'; o.tail = 'down'; }
  if (!onWall) g.scale(face, 1);
  if (o.crouch && !onWall) { g.translate(-4, 6); g.rotate(-0.1); } if (o.lean && !onWall) g.rotate(0.14);   /* a CROUCH gathers her low before a lunge or a pounce; the roll's tell leans her back */
  drawBody(g, o);
  g.restore();
  /* the guard's spark: a blow turned on the claws */
  if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; for (let i = 0; i < 4; i++) g.fillRect(x + face * (60 + i * 3), y - 50 - i * 5, 2, 2); }
}

/* THE HALL'S MACHINES */
export function drawWindlass(g, x, y, b, time) {
  fr(g, '#4a3424', x - 9, y - 20, 3, 20); fr(g, '#4a3424', x + 6, y - 20, 3, 20); fr(g, '#6a4a30', x - 8, y - 18, 16, 7); fr(g, '#c9b27c', x - 8, y - 16, 16, 2);
  const a = b.st === 'fall' ? time * 30 : b.st === 'down' ? time * 3 : 0; fr(g, '#2a1c12', x + 8 + R(Math.cos(a) * 3), y - 15 + R(Math.sin(a) * 3), 5, 2);
  ln(g, '#c9b27c', 1, [[x, y - 18], [x, y - 40]]);   /* its rope runs up to the vault's pulley */
  if (b.st === 'up') { fr(g, '#7ab8e8', x - 1, y - 26, 3, 3); }
}
export function drawBucket(g, mx, vy, b, CQ, time) {
  const k = b.st === 'fall' ? 1 - Math.max(0, b.t) / CQ.bucketFall : b.st === 'down' ? 1 : 0, by = vy - 60 + k * 90;
  ln(g, '#c9b27c', 1, [[mx, vy - 200], [mx, by]]);
  if (b.st !== 'down' || b.t > CQ.bucketCd - 0.3) { fr(g, '#5a3a22', mx - 9, by, 18, 14); fr(g, '#8a5a32', mx - 8, by + 2, 16, 3); fr(g, '#3a7ab8', mx - 7, by + 1, 14, 2); }
  if (b.st === 'down') { const up = 1 - b.t / CQ.bucketCd; fr(g, '#5a3a22', mx - 9, vy + 30 - up * 90, 18, 14); }
}
export function drawTunnels(g, x0, x1, fy, S, time) {
  for (const [x, d] of [[x0, 1], [x1, -1]]) { g.fillStyle = '#0a0808'; g.beginPath(); g.ellipse(x + d * 2, fy - 12, 10, 13, 0, 0, Math.PI * 2); g.fill(); fr(g, '#5a5048', x + d * 6 - (d < 0 ? 4 : 0), fy - 26, 4, 2); }
  /* THE AMBUSH'S TELL: dust trickles over the tunnel she will come out of */
  const e = S.cur; if (S.pose === 'tunnel' && e && e.side) { const x = e.side === 'W' ? x0 + 8 : x1 - 8; for (let i = 0; i < 8; i++) { const yy = fy - 60 + ((time * 70 + i * 9) % 50); fr(g, '#c9a46a', x + ((i * 5) % 9) - 4, yy, 1, 2); } }
}

/* OVER EVERYTHING: the water, the mound, her tells on the floor, what flies, the venom, the opening's clock */
export function drawOver(g, e, S, cx, cy, time, CQ) {
  const G = S.G, F = G.floor - cy, X = x => R(x - cx);
  /* THE FLOOD */
  if (S.water > 0.5) { const top = R(F - S.water); g.globalAlpha = 0.5; g.fillStyle = '#2a5a7a'; g.fillRect(X(G.x0), top, X(G.x1) - X(G.x0), R(S.water)); g.fillRect(X(G.sump[0]), R(F), X(G.sump[1]) - X(G.sump[0]), 32);
    g.globalAlpha = 0.85; g.fillStyle = '#7ab8e8'; for (let x = G.x0; x < G.x1; x += 6) g.fillRect(X(x), top + R(Math.sin(time * 4 + x * 0.1)), 4, 1); g.globalAlpha = 1;
    if (S.flood && S.water < CQ.waterH + 1) for (let i = 0; i < 10; i++) { const yy = G.vault + ((time * 260 + i * 37) % (G.floor - G.vault)); fr(g, '#7ab8e8', X(G.mid - 20 + i * 4), R(yy - cy), 2, 6); } }
  /* THE MOUND: her back moving under the sand (and a POUR marker over it while you carry water) */
  if (S.mound && S.pose === 'burrow') { const x = X(S.mound.x), hot = e.mode === 'strikeTell' || e.mode === 'chargeTell', bul = hot ? 6 + 3 * Math.sin(time * 20) : 3 + Math.sin(time * 8);
    g.fillStyle = '#b08a56'; g.beginPath(); g.ellipse(x, R(F), 26, bul + 4, 0, Math.PI, 0); g.fill(); g.fillStyle = '#d8b47a'; g.beginPath(); g.ellipse(x - 4, R(F - 2), 14, bul, 0, Math.PI, 0); g.fill();
    for (let i = 0; i < 5; i++) fr(g, '#d8b47a', x - 20 + ((time * 60 + i * 11) % 40), R(F - 6 - ((time * 30 + i * 7) % 8)), 1, 1);
    if (hot) { g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 2), 30, 6, 0, 0, Math.PI * 2); g.stroke(); }
    fr(g, '#ffb84a', x + 10, R(F - bul - 6), 3, 3); }
  /* HER TELLS ON THE FLOOR */
  const cur = S.cur || {}, m = e.mode, blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
  if (m === 'lanceTell' && cur.x != null) { const x = X(cur.x), k = 1 - Math.max(0, e.modeT) / CQ.lanceTell; g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 1), 16 - k * 8, 3, 0, 0, Math.PI * 2); g.stroke(); fr(g, '#ff6b6b', x - 1, R(F - 3), 2, 2); }
  if (m === 'sslamTell' && cur.x != null) { const x = X(cur.x), k = 1 - Math.max(0, e.modeT) / CQ.sslamTell; g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(x, R(F - 1), CQ.slamR + 6 - k * 8, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;   /* (claude/underwell3) THE STINGER SLAM's spot: red, the width of the blow */
    g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.beginPath(); g.ellipse(x, R(F - 1), (CQ.slamR - 4) * k + 4, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; fr(g, '#ff6b6b', x - 1, R(F - 14), 2, 8); fr(g, '#ff6b6b', x - 1, R(F - 4), 2, 2); }
  if (m === 'pinTell' && cur.x != null) { g.strokeStyle = 'rgba(255,107,107,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(e.x), R(e.y - 50 - cy)); g.lineTo(X(cur.x), R(cur.y - 8 - cy)); g.stroke(); g.strokeStyle = blink; g.beginPath(); g.ellipse(X(cur.x), R(G.floor - 1 - cy), 20, 4, 0, 0, Math.PI * 2); g.stroke(); }
  if (m === 'pounceTell' && cur.x != null) { const k = 1 - Math.max(0, e.modeT) / CQ.pounceTell; g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = '#1a1210'; g.beginPath(); g.ellipse(X(cur.x), R(F), 10 + k * CQ.pounceR, 3 + k * 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(X(cur.x), R(F), CQ.pounceR, 5, 0, 0, Math.PI * 2); g.stroke(); }
  if ((m === 'sweepLowTell' || m === 'sweepHighTell') ) { const hi = m === 'sweepHighTell', y = R(F - (hi ? 22 : 6)); g.globalAlpha = 0.35 + 0.3 * Math.abs(Math.sin(time * 14)); g.fillStyle = hi ? '#ffb84a' : '#ff6b6b'; g.fillRect(X(G.x0), y - 1, X(G.x1) - X(G.x0), 3); g.globalAlpha = 1; }
  if (m === 'tidalTell') { const fx = e.face || 1, x0 = fx > 0 ? e.x : e.x - CQ.tidalReach, x1 = fx > 0 ? e.x + CQ.tidalReach : e.x; g.globalAlpha = 0.3 + 0.3 * Math.abs(Math.sin(time * 14)); g.fillStyle = '#a6e04a'; g.fillRect(X(x0), R(F - 22), X(x1) - X(x0), 3); g.globalAlpha = 1; }
  if (m === 'grabTell') { const fx = e.face || 1, x = X(e.x + fx * (CQ.w / 2 + CQ.grabReach)); g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 1), 14, 3, 0, 0, Math.PI * 2); g.stroke(); }
  /* THE BANDS: a dune wave, the tail's sweep, the thrash's waves, the death roll's wake */
  for (const b of S.bands) { const x = X(b.x), y0 = R(b.y[0] - cy), y1 = R(b.y[1] - cy);
    const col = b.k === 'dune' ? '#d8b47a' : b.k === 'wave' ? '#7ab8e8' : b.k === 'tailHigh' ? '#ffb84a' : '#c9a46a';
    g.fillStyle = col; g.beginPath(); g.moveTo(x - b.dir * 22, y1); g.quadraticCurveTo(x - b.dir * 4, y0 - 2, x + b.dir * 6, y1); g.fill();
    if (b.k === 'tailHigh' || b.k === 'tailLow') { fr(g, '#ffb84a', x - 2, y0, 4, y1 - y0); fr(g, '#fff2c0', x - 1, y0 + 1, 2, 2); }
    for (let i = 0; i < 4; i++) fr(g, '#e8f4f8', x - b.dir * (8 + i * 5), y0 + ((i * 3) % 6), 1, 1); }
  /* THE RUBBLE: a shadow growing where each stone will land, then the stone */
  for (const r of S.rubble) { const y = r.ledge ? G.ledgeY : G.floor, k = Math.max(0, Math.min(1, 1 - r.t / CQ.rubbleFall));
    if (!r.landed) { g.globalAlpha = 0.2 + 0.5 * k; g.fillStyle = '#100a08'; g.beginPath(); g.ellipse(X(r.x), R(y - cy), 6 + k * CQ.rubbleR, 2 + k * 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      const ry = r.y0 + (y - r.y0) * k * k; fr(g, '#6a7480', X(r.x) - 6, R(ry - cy) - 10, 12, 10); fr(g, '#9aa4ae', X(r.x) - 6, R(ry - cy) - 10, 12, 2); } }
  /* WHAT FLIES: sand stones, venom globs */
  for (const s of S.shots) { if (s.k === 'venom') { fr(g, QC.venomD, X(s.x) - 3, R(s.y - cy) - 3, 6, 6); fr(g, QC.venom, X(s.x) - 2, R(s.y - cy) - 2, 3, 3); } else { fr(g, '#8a6a3e', X(s.x) - 2, R(s.y - cy) - 2, 4, 4); fr(g, '#d8b47a', X(s.x) - 2, R(s.y - cy) - 2, 2, 1); } }
  for (const p of S.puddles) { g.globalAlpha = Math.min(1, p.t); g.fillStyle = QC.venomD; g.beginPath(); g.ellipse(X(p.x), R(F - 1), 15, 3, 0, 0, Math.PI * 2); g.fill(); fr(g, QC.venom, X(p.x) - 8 + R(Math.sin(time * 3 + p.x) * 3), R(F - 2), 3, 1); g.globalAlpha = 1; }
  /* HER CLAW holding you: the line of her arm */
  if (S.claw && S.claw.caught) { fr(g, '#ffd36b', X(S.claw.x) - 1, R(F - 40), 2, 6); }
  /* HER OPENING, said over her with its clock */
  if (e.open > 0) { const x = X(e.x), y = R(e.y - 92 - cy), k = Math.max(0, e.open / CQ.openT); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y, 40, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 20, y, R(40 * k), 3); }
}

/* THE SPRITE SET for the bestiary card and the body she leaves: her body drawn into canvases (frame 0 standing in guard, 1 rearing, 2 on her back) */
export const CQ_F = { stand: 0, rear: 1, dead: 2 };
let SET = null;
export function bakeCisternQueen() {
  if (SET) return SET;
  const W = 200, H = 130, ax = 100, ay = 124;
  const F = [0, 1, 2].map(f => { const [c, g] = canvas(W, H); g.save(); g.translate(ax, ay);
    if (f === 1) { g.translate(-10, 0); g.rotate(-0.5); drawBody(g, { t: 0.3, claw: 'up', legs: 'kick' }); }
    else if (f === 2) { g.translate(0, -30); g.scale(1, -1); drawBody(g, { t: 0.3, claw: 'down', legs: 'splay', tail: 'down' }); }
    else drawBody(g, { t: 0.3, claw: 'guard', legs: 'still' });
    g.restore(); outline(c, OUT); return c; });
  SET = { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax, ay, w: CQ_W, h: CQ_H };
  return SET;
}
const CQ_W = 76, CQ_H = 38;
