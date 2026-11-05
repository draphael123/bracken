// src/sky-mount-draw.js - THE DRAKE'S BACK, GREYBOX PICTURES (lane S1 SKYMOUNT). Art before live: these flat shapes stand in until the art
// lane (S4 SKYART: the drake mount ~300x90, the back strip, 4 parallax layers x 3 altitudes) paints them. Ids/kinds come from src/sky-mount.js SKY.
// Canvas only, no main.js: main.js calls drawSky (backdrop pass) and drawDrake (world pass, under the heroes) through src/sky-mount-hands.js.
import { paintAltitude } from './redraw/sky_layers_art.js';
import * as MA from './redraw/sky_mount_art.js';
import { SKY, SKM, surfaceY, layerShift, skyNow, banking, bankTelling } from './sky-mount.js';

const R = Math.round;
function layerPass(g, alt, b, VW, VH, time, dy, alpha, full) {
  const S = SKY[alt]; if (!S) return;
  g.globalAlpha = alpha;
  const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, S.top); gr.addColorStop(1, S.bot); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  for (const ly of S.layers) {
    if (!full && ly.kind === 'motes' && ly.k > 1) continue;   /* (parallax 'low': no near embers) */
    const y = R(ly.y * VH + dy), h = R(ly.h * VH); g.fillStyle = ly.col;
    if (ly.kind === 'band') { const P = 160, o = layerShift(ly, b.scroll, P); for (let x = o - P; x < VW + P; x += P) { g.fillRect(R(x), y, 110, h); g.fillRect(R(x + 60), y + R(h * 0.3), 90, R(h * 0.7)); } }
    else if (ly.kind === 'ridge') { const P = 96, o = layerShift(ly, b.scroll, P); for (let x = o - P; x < VW + P; x += P) { g.beginPath(); g.moveTo(R(x), y + h); g.lineTo(R(x + 30), y); g.lineTo(R(x + 52), y + R(h * 0.4)); g.lineTo(R(x + 70), y + R(h * 0.15)); g.lineTo(R(x + P), y + h); g.closePath(); g.fill(); } g.fillRect(0, y + h, VW, VH - y - h); }
    else if (ly.kind === 'cone') { const P = 900, o = layerShift(ly, b.scroll, P); for (let x = o + VW * 0.6; x > -P; x -= P) for (const cx0 of [x, x + P]) {
        if (cx0 < -200 || cx0 > VW + 200) continue; const w = h * 1.6; g.fillStyle = ly.col; g.beginPath(); g.moveTo(R(cx0 - w), y + h); g.lineTo(R(cx0 - 14), y); g.lineTo(R(cx0 + 14), y); g.lineTo(R(cx0 + w), y + h); g.closePath(); g.fill();
        g.fillStyle = S.glow; for (let i = 0; i < 6; i++) { const t = (time * 0.9 + i / 6) % 1; g.globalAlpha = alpha * (1 - t) * 0.8; g.fillRect(R(cx0 - 3 + Math.sin(i * 2.1) * t * 20), R(y - t * 50), 4, 4); } g.globalAlpha = alpha;
        if (ly.fx === 'lightning' && Math.floor(time * 3 + cx0) % 9 === 0) { g.fillStyle = '#e8d8ff'; g.fillRect(R(cx0 + 20), R(y - 80), 1, 70); } } }
    else if (ly.kind === 'motes') { for (let i = 0; i < 24; i++) { const px = ((i * 53 - b.scroll * ly.k) % VW + VW) % VW, py = (i * 37 + Math.sin(time * 1.3 + i) * 8 + VH) % VH; g.fillRect(R(px), R(py), 1, 1); } }
  }
  g.globalAlpha = 1;
}
/* THE SKY (backdrop pass, screen space): the altitude's gradient and its four layers; during a climb the next altitude fades in as the old slides down */
function greySky(g, b, VW, VH, time, parallax = 'full') {
  if (!b) return; const s = skyNow(b), full = parallax !== 'low' && parallax !== 'off';
  layerPass(g, s.a, b, VW, VH, time, s.rise, 1, full);
  if (s.b) layerPass(g, s.b, b, VW, VH, time, s.rise - SKM.CLIMB.rise, s.k, full);
}
const BODY = '#5a2a20', BODYD = '#3a1a16', SCALE = '#a0503a', SCALEL = '#d07a4a', SPINE = '#e0c090', WING = 'rgba(90,40,34,0.85)';
/* THE DRAKE (world pass, under the heroes): the body below the back, the back strip on the surface line (tilted, bobbing), the neck
   with its spines (the neck wall), the tail with its fin (the tail wall), the wings beating - drawn, never solid. The bank's tell:
   the head turns and the near wing dips toward the bank. */
function greyDrake(g, b, cx, cy, time) {
  if (!b) return; const sy = x => surfaceY(b, x) - cy, X = x => R(x - cx);
  const flap = Math.sin(b.t * Math.PI * 2 * SKM.BOB.hz), tell = bankTelling(b) ? b.bank.dir || 1 : 0;
  // far wing (behind the body)
  { const rx = b.x1 - 46, ry = sy(rx); g.fillStyle = 'rgba(70,30,28,0.7)'; g.beginPath(); g.moveTo(X(rx - 30), R(ry + 2)); g.lineTo(X(rx - 70), R(ry - 40 - flap * 22)); g.lineTo(X(rx + 10), R(ry - 30 - flap * 18)); g.lineTo(X(rx + 6), R(ry + 2)); g.closePath(); g.fill(); }
  // tail: from the tail root back to a point, the fin standing at the root (the wall)
  { const tx = b.x0, ty = sy(tx); g.fillStyle = BODY; g.beginPath(); g.moveTo(X(tx), R(ty)); g.lineTo(X(tx - 90), R(ty + 10 + Math.sin(time * 2) * 4)); g.lineTo(X(tx), R(ty + 16)); g.closePath(); g.fill();
    g.fillStyle = SPINE; g.beginPath(); g.moveTo(X(tx), R(ty)); g.lineTo(X(tx + b.wall), R(ty)); g.lineTo(X(tx + 2), R(ty - 24)); g.closePath(); g.fill(); }
  // the body under the back: a belly curve 26 px deep in the middle
  for (let x = b.x0; x < b.x1; x += 2) { const u = (x - b.x0) / b.len, y = sy(x), d = 10 + Math.sin(u * Math.PI) * 18; g.fillStyle = BODY; g.fillRect(X(x), R(y + 3), 2, R(d)); g.fillStyle = BODYD; g.fillRect(X(x), R(y + 3 + d - 3), 2, 3);
    g.fillStyle = (x >> 1) % 4 === 0 ? SCALEL : SCALE; g.fillRect(X(x), R(y), 2, 3); }   /* the back strip: the walking line */
  // neck and head past the ridge; the spines at the ridge are the neck wall
  { const nx = b.x1, ny = sy(nx), hx = nx + 64 + tell * 4, hy = ny - 34 + flap * 2; g.strokeStyle = BODY; g.lineWidth = 10; g.beginPath(); g.moveTo(X(nx - 4), R(ny + 6)); g.quadraticCurveTo(X(nx + 34), R(ny - 4), X(hx), R(hy)); g.stroke(); g.lineWidth = 1;
    g.fillStyle = BODY; g.fillRect(X(hx) - 6, R(hy) - 6, 18, 10); g.fillStyle = tell ? '#ffd36b' : '#ff7a2a'; g.fillRect(X(hx) + (tell < 0 ? -2 : 6), R(hy) - 4, 2, 2);   /* the eye: gold while it tells */
    g.fillStyle = SPINE; for (let i = 0; i < 3; i++) { const sx = nx - b.wall + i * 2; g.beginPath(); g.moveTo(X(sx), R(sy(sx))); g.lineTo(X(sx + 3), R(sy(sx))); g.lineTo(X(sx + 1), R(sy(sx) - 28 + i * 6)); g.closePath(); g.fill(); } }
  // near wing (in front of the body, under the back line); it dips toward a told bank
  { const rx = b.x1 - 40, ry = sy(rx), dip = tell ? 10 : 0; g.fillStyle = WING; g.beginPath(); g.moveTo(X(rx - 34), R(ry + 8)); g.lineTo(X(rx - 80), R(ry + 30 + flap * 26 + dip)); g.lineTo(X(rx + 14), R(ry + 26 + flap * 20 + dip)); g.lineTo(X(rx + 8), R(ry + 8)); g.closePath(); g.fill(); }
  // greybox read of the bank: a tilt arrow on the back while it tilts
  if (banking(b)) { const d = Math.sign(b.bank.ang); if (d) { g.fillStyle = 'rgba(255,211,107,0.55)'; const mx = b.cx + d * 20; for (let i = 0; i < 3; i++) g.fillRect(X(mx + d * i * 4), R(sy(mx + d * i * 4) + 8), 2, 2); } }
}

/* ===== S4 SKYART: the painted versions (claude/skyart). The greybox above is the fallback if a sprite throws. ===== */
let artBad = false;
export function drawSky(g, b, VW, VH, time, parallax = 'full') {
  if (!b) return;
  if (artBad) return greySky(g, b, VW, VH, time, parallax);
  try {
    const s = skyNow(b), full = parallax !== 'low' && parallax !== 'off';
    paintAltitude(g, SKY[s.a], b, VW, VH, time, s.rise, 1, full, layerShift);
    if (s.b) paintAltitude(g, SKY[s.b], b, VW, VH, time, s.rise - SKM.CLIMB.rise, s.k, full, layerShift);
  } catch (e) { artBad = true; if (typeof console !== 'undefined') console.warn('sky art failed, greybox', e); greySky(g, b, VW, VH, time, parallax); }
}
/* the drake mount: far wing, tail, the back + flank (sheared in 2 px slices to the tilting, bobbing surface line), neck + head, the two walls, the near wing. */
export function drawDrake(g, b, cx, cy, time) {
  if (!b) return;
  if (artBad) return greyDrake(g, b, cx, cy, time);
  try {
    const sy = x => surfaceY(b, x) - cy, X = x => R(x - cx), flap = Math.sin(b.t * Math.PI * 2 * SKM.BOB.hz * 1.6), telling = bankTelling(b), tilting = banking(b);
    const wingFar = MA.wingSprite(-flap * 0.9, false), wingNear = MA.wingSprite(flap + (telling ? 0.7 : 0), true);
    { const rx = b.x1 - 48; g.drawImage(wingFar, X(rx) - MA.WING_ROOT.x, R(sy(rx)) - MA.WING_ROOT.y + 2); }
    { const tk = Math.max(0, Math.min(4, Math.round(2 + Math.sin(time * 2) * 2))), tl = MA.tailSprite(tk); g.drawImage(tl, X(b.x0) - MA.TAIL_AT.x + 4, R(sy(b.x0)) - MA.TAIL_AT.y + 3); }
    const tile = MA.backTile();
    for (let x = 0; x < b.len; x += 2) g.drawImage(tile, x, 0, 2, MA.BACK.h, X(b.x0 + x), R(sy(b.x0 + x)), 2, MA.BACK.h);
    { const fin = MA.finWall(); g.drawImage(fin, X(b.x0) - 1, R(sy(b.x0 + 3)) - 29); }
    { const head = MA.neckHead(telling ? (b.bank.t > 0.62 ? 'roar' : 'tell') : tilting ? 'tell' : 'calm'), bob = Math.round(flap * 1.5); g.drawImage(head, X(b.x1) - MA.NECK_AT.x + 3, R(sy(b.x1)) - MA.NECK_AT.y + 3 + bob); }
    { const sp = MA.spineWall(); g.drawImage(sp, X(b.x1) - 12, R(sy(b.x1 - 3)) - 33); }
    { const rx = b.x1 - 42; g.drawImage(wingNear, X(rx) - MA.WING_ROOT.x, R(sy(rx)) - MA.WING_ROOT.y + 10 + (telling ? 6 : 0)); }
    /* embers shed from the belly (the volcano's heat under it) */
    for (let i = 0; i < 7; i++) { const t = (time * 0.7 + i * 0.143) % 1, x = b.x0 + 14 + ((i * 47) % (b.len - 28)), y = sy(x) + 32 - 12 * Math.sin(((x - b.x0) / b.len) * Math.PI) + 3 + t * 22;
      g.fillStyle = t < 0.4 ? '#ffe08a' : t < 0.7 ? '#ff7a2a' : '#7a2a1c'; g.fillRect(X(x), R(y), 1, 1); }
    if (tilting) { const d = Math.sign(b.bank.ang); if (d) { g.fillStyle = 'rgba(255,211,107,0.55)'; const mx = b.cx + d * 20; for (let i = 0; i < 3; i++) g.fillRect(X(mx + d * i * 4), R(sy(mx + d * i * 4) + 8), 2, 2); } }
  } catch (e) { artBad = true; if (typeof console !== 'undefined') console.warn('drake mount art failed, greybox', e); greyDrake(g, b, cx, cy, time); }
}
