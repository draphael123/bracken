// wicker_fx.js - THE WICKER QUEEN's new fires and blows, drawn (claude/fairfix3; Daniel 2026-10-01: "Queen 6-7/10" - more fire pits, faster, leaps, a burning wicker toss,
// a ribbon sweep). Pure drawing from canvas primitives; src/main.js calls drawPits from drawWickerGround and drawOver from drawWickerOver.
//   drawPits  the RING PITS: embers on the boards that ride with the carousel, dimming as they burn out
//   drawOver  her WICKER BALLS rolling and burning; THE RIBBON SWEEP (told: the ribbons pull taut from the maypole's crown to both walls at the height they will fly, an arrow
//             at each hero; then the ribbon's end whipping along the ring); her LEAP (the landing marked on the boards or on the horse, a ring that closes as she comes);
//             the CENTRE POLE's collar when she stands on it
//   drawReal  (claude/fairfix4) HER tells against her copies: real fire flickering in her wheat crown and her ribbons blowing in the wind - always moving, even held
//   drawRing  (claude/fairfix4) THE BONFIRE RING: told, a row of lanterns over the ring FLARES - all but the ones over the gap, which stay dark; then a wall of fire
//             along the boards with its one gap (a bright edge each side of it)
import { WQ, lashBand, sweepFront, gapOf } from '../wicker-queen.js';
const RB = ['#b8382c', '#e8c23a', '#3a7ab8', '#8fd160', '#c9a0ff', '#f4ead0'];
export function drawPits(g, cx, cy, VW, pits, floor, time) {
  const fy = Math.round(floor - cy);
  for (const p of pits || []) { const life = Math.max(0, Math.min(1, (p.life || 0) / 3));
    for (let x = p.x0; x <= p.x1; x += 3) { const sx = Math.round(x - cx); if (sx < -4 || sx > VW + 4) continue; const k = 0.5 + 0.5 * Math.sin(time * 6 + x * 0.4);
      g.fillStyle = k > 0.75 * (2 - life) ? '#ffc850' : k > 0.35 ? '#f08a28' : '#a01c10'; g.globalAlpha = 0.5 + 0.5 * life; g.fillRect(sx, fy - 2, 2, 2);
      if (k > 0.92 && life > 0.3) { g.fillStyle = '#fff0b0'; g.fillRect(sx, fy - 4 - Math.round(k * 3), 1, 1); } }
    g.globalAlpha = 1; }
}
export function drawReal(g, cx, cy, q, time) {
  if (!q || !q.alive || q.mode === 'burn' || q.mode === 'catch') return; const f = q.face || 1, x = Math.round(q.x - cx), y = Math.round(q.y - cy);
  for (let i = 0; i < 5; i++) { const fx = x + f + (i - 2) * 2, h = 2 + Math.round(2 * Math.abs(Math.sin(time * 13 + i * 1.7))), cols = ['#f08a28', '#ffc850', '#fff0b0'];   /* her crown: real fire */
    for (let k = 0; k < h; k++) { g.fillStyle = cols[Math.min(2, k)]; g.fillRect(fx, y - 84 - k, 1, 1); } }
  if (q.alight > 0) drawAlight(g, x, y, f, q, time);   /* (claude/fairfix5) her own fire caught her: only the real Queen burns like this */
  const RB2 = ['#b8382c', '#e8c23a', '#3a7ab8'];
  for (let i = 0; i < 3; i++) for (let k = 0; k < 14; k++) { const wx = x - f * (4 + k), wy = y - 76 + i * 2 + Math.round(Math.sin(time * 9 - k * 0.55 + i) * (k / 5)); g.fillStyle = RB2[i]; g.fillRect(wx, wy, 1, 1); }   /* her ribbons, in the wind */
}
/* (claude/fairfix5) HER OWN FIRE CAUGHT HER: the first breath a FLARE runs up her spear arm into the wicker (the catch), then tongues of fire climb her skirts and
   bodice for the whole window, guttering as it runs out (the window's clock is the fire's height) */
export function drawAlight(g, x, y, f, q, time) {
  const k = Math.max(0, Math.min(1, q.alight / WQ.alightT)), fresh = WQ.alightT - q.alight < 0.35;
  if (fresh) { const u = (WQ.alightT - q.alight) / 0.35; g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,200,90,' + (0.7 * (1 - u)).toFixed(2) + ')'; g.beginPath(); g.arc(x + f * 12, y - 40 - u * 20, 10 + u * 16, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; }
  g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y - 34, 2, x, y - 34, 34); gl.addColorStop(0, 'rgba(255,150,50,' + (0.35 * k + 0.1).toFixed(2) + ')'); gl.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gl; g.fillRect(x - 34, y - 68, 68, 68); g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 9; i++) { const fx = x - 10 + i * 2.5, base = y - 4 - ((i * 7) % 5) * 6, h = Math.round((6 + 10 * k) * (0.5 + 0.5 * Math.abs(Math.sin(time * 12 + i * 1.9)))), cols = ['#c8401a', '#f08a28', '#ffc850', '#fff0b0'];
    for (let j = 0; j < h; j++) { g.fillStyle = cols[Math.min(3, Math.floor(j / Math.max(1, h / 4)))]; g.fillRect(Math.round(fx), Math.round(base - j * 2), 2, 2); } }
}
export function drawRing(g, cx, cy, VW, q, A, floor, time) {
  if (!q || (q.mode !== 'ringTell' && q.mode !== 'ring')) return; const [ga, gb] = gapOf(q), ly = Math.round(floor - 100 - cy), k = q.mode === 'ringTell' ? 1 - Math.max(0, q.modeT) / WQ.ringTell : 1;
  for (let x = A.x0 + 20; x < A.x1; x += 32) { const sx = Math.round(x - cx); if (sx < -10 || sx > VW + 10) continue; const dark = x >= ga - 10 && x <= gb + 10;   /* the lanterns: over the gap they stay dark */
    g.fillStyle = '#4e321a'; g.fillRect(sx, ly - 6, 1, 6); g.fillStyle = dark ? '#2a2030' : '#e8c23a'; g.fillRect(sx - 2, ly, 5, 6);
    if (!dark) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,170,60,' + (0.25 + 0.5 * k * (0.7 + 0.3 * Math.sin(time * 25 + x))).toFixed(2) + ')'; g.beginPath(); g.arc(sx, ly + 3, 6 + 6 * k, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; } }
  const fy = Math.round(floor - cy), gx0 = Math.round(ga - cx), gx1 = Math.round(gb - cx);
  if (q.mode === 'ringTell') { g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#ff6b2c'; for (let x = A.x0; x < A.x1; x += 4) { const sx = Math.round(x - cx); if (sx >= gx0 && sx <= gx1) continue; g.fillRect(sx, fy - 2, 3, 2); } g.globalAlpha = 1;
    g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(gx0 + 0.5, fy - WQ.ringTop + 0.5, gx1 - gx0, WQ.ringTop - 1); return; }   /* the gap marked on the boards as the tell runs */
  for (let x = A.x0; x < A.x1; x += 3) { const sx = Math.round(x - cx); if (sx < -4 || sx > VW + 4 || (x >= ga && x <= gb)) continue;   /* THE WALL OF FIRE: flickering tongues to WQ.ringTop */
    const h = Math.round(WQ.ringTop * (0.55 + 0.45 * Math.abs(Math.sin(time * 11 + x * 0.21)))); g.fillStyle = '#a01c10'; g.fillRect(sx, fy - Math.round(h * 0.4), 3, Math.round(h * 0.4));
    g.fillStyle = '#f08a28'; g.fillRect(sx, fy - Math.round(h * 0.75), 2, Math.round(h * 0.35)); g.fillStyle = '#ffc850'; g.fillRect(sx + 1, fy - h, 1, Math.round(h * 0.3)); }
  g.fillStyle = '#fff0b0'; g.fillRect(gx0 - 1, fy - WQ.ringTop, 1, WQ.ringTop); g.fillRect(gx1, fy - WQ.ringTop, 1, WQ.ringTop);
}
export function drawOver(g, cx, cy, VW, q, A, floor, mx, balls, players, time) {
  /* THE WICKER BALL: a woven ball, alight, turning as it rolls */
  for (const b of balls || []) { const x = Math.round(b.x - cx), y = Math.round(floor - 7 - cy - (b.ret ? 6 : 0)), a = b.x / 7;
    if (b.ripe && !b.ret) { g.globalAlpha = 0.6 + 0.4 * Math.sin(time * 40); g.strokeStyle = '#fff6c8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 10, 0, 6.3); g.stroke(); g.globalAlpha = 1; }   /* (claude/fairfix4) in your reach: STRIKE IT BACK now */
    if (b.ret) { g.fillStyle = 'rgba(255,240,176,0.5)'; g.fillRect(x - b.dir * 16, y - 1, 14 * 1, 2); }   /* struck back: a streak behind it */
    g.fillStyle = '#4e3a1a'; g.beginPath(); g.arc(x, y, 7, 0, 6.3); g.fill(); g.strokeStyle = '#b89050'; g.lineWidth = 1;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(x, y, 6, 2 + i * 1.5, a + i, 0, 6.3); g.stroke(); }
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,' + (140 + 60 * Math.sin(time * 20) | 0) + ',40,0.55)'; g.beginPath(); g.moveTo(x - 5, y - 3); g.lineTo(x + 5, y - 3); g.lineTo(x + Math.sin(time * 15) * 2, y - 14); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; }
  if (!q) return;
  /* THE RIBBON SWEEP: told, the ribbons go taut from the crown to both walls at their height (tighter as the tell runs out); then the end whips along the ring and back */
  const sweepK = q.mode === 'sweepLowTell' ? 'low' : q.mode === 'sweepHighTell' ? 'high' : q.mode === 'sweep' ? q.sweepKind : null;
  if (sweepK) { const [t, bt] = lashBand(sweepK, floor), my = t + (bt - t) / 2, top = floor - 100;
    if (q.mode !== 'sweep') { const k = 1 - Math.max(0, q.modeT) / WQ.sweepTell, sag = (1 - k) * 26;
      for (let i = 0; i < 6; i++) { g.strokeStyle = RB[i]; g.lineWidth = 1; g.globalAlpha = 0.45 + 0.5 * k;
        for (const ex of [A.x0, A.x1]) { const yy = t + (bt - t) * (i / 5); g.beginPath(); g.moveTo(Math.round(mx - cx) + 0.5, Math.round(top - cy) + 0.5); g.quadraticCurveTo(Math.round((mx + ex) / 2 - cx), Math.round(yy + sag - cy), Math.round(ex - cx) + 0.5, Math.round(yy - cy) + 0.5); g.stroke(); } }
      g.globalAlpha = 0.3 + 0.5 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(A.x0 - cx), Math.round(t - cy), A.x1 - A.x0, 1); g.fillRect(Math.round(A.x0 - cx), Math.round(bt - 1 - cy), A.x1 - A.x0, 1);
      for (const pp of players || []) { if (pp.dead) continue; const px2 = Math.round(pp.x - cx), py2 = Math.round(pp.y - 32 - cy); g.fillRect(px2 - 2, py2, 5, 1); g.fillRect(px2 - 1, sweepK === 'low' ? py2 - 1 : py2 + 1, 3, 1); g.fillRect(px2, sweepK === 'low' ? py2 - 2 : py2 + 2, 1, 1); }
      g.globalAlpha = 1; }
    else { const fx = sweepFront(A, q.sweepK || 0, q.sweepDir || 1);
      for (let i = 0; i < 6; i++) { g.strokeStyle = RB[i]; g.lineWidth = 1; const yy = t + (bt - t) * (i / 5) + Math.sin(time * 40 + i) * 1; g.beginPath(); g.moveTo(Math.round(mx - cx) + 0.5, Math.round(top - cy) + 0.5); g.lineTo(Math.round(fx - cx) + 0.5, Math.round(yy - cy) + 0.5); g.stroke(); }
      g.fillStyle = '#fff6c8'; g.fillRect(Math.round(fx - cx) - 1, Math.round(t - cy), 3, Math.max(2, Math.round(bt - t))); } }
  /* HER LEAP: where she will come down, marked from the crouch - a ring on the boards (or over the horse's saddle) that closes as she comes */
  if ((q.mode === 'leapTell' || q.mode === 'leap') && q.leapTo) { const T = q.leapTo, k = q.mode === 'leapTell' ? 1 - Math.max(0, q.modeT) / WQ.leapTell : 1, x = Math.round(T.x - cx), y = Math.round(floor - (T.lift || 0) - cy);
    g.globalAlpha = 0.45 + 0.4 * Math.sin(time * 24); g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 1, 30 - 12 * k, 5, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1;
    if (T.kind === 'floor') { g.fillStyle = 'rgba(255,107,107,0.25)'; g.fillRect(x - WQ.stompR, y - 2, WQ.stompR * 2, 2); } }
  /* THE CENTRE POLE's collar she stands on: a brass ring round the maypole at her perch height */
  if (q.perch === 'pole' || (q.mode === 'leap' && q.leapTo && q.leapTo.kind === 'pole')) { const x = Math.round(mx - cx), y = Math.round(floor - WQ.poleLift - cy); g.fillStyle = '#a87a18'; g.fillRect(x - 14, y, 28, 4); g.fillStyle = '#e8c23a'; g.fillRect(x - 14, y, 28, 1); }
}
