// matriarch_ledge.js - THE NEST LEDGE's SET (claude/redgorge2 art pass): the old dam's face behind the channel (dressed masonry, a broken crown, the SPILLWAY's notch - the landmark behind her),
// two SLUICE GATES that hold and release water, her NEST on a spur of the east wall, the stone string-course she runs along in phase two, the rope bridges (a tall lashed mast at each end,
// a sagging deck between, a hand-rope each side; the lashing at the foot of each mast is the thing you strike), the levers and their gauges, the channel's water, and what lies on the tops.
//   drawNestBackdrop(g, cx, cy, VW, VH, L, time)    STATIC, behind the tiles (src/redraw/redgorge_backdrop.js): the dam, the spillway, the crown, the gates' arches, the string-course, the nest
//   drawLedge(g, cx, cy, time, S, G, o)             DYNAMIC, over the tiles and under the actors (src/raptor-matriarch-hands.js drawBack): the spillway's water, the gates, the levers, the bridges, the
//                                                   channel's water; o = { text, boss, wy, VW, VH }
//   planLedgeDress(L, T)                            the props lying on the tops (bones, feathers, a rope coil, pebbles): each STANDS on a solid top (tools/redgorge2-aloft.mjs)
//   ledgeShadow...                                  (none: she throws her own shadow in drawOver)
import { canvas, mulberry } from '../px.js';
import { STAGE } from '../raptor-matriarch.js';
import { nestArt } from './redgorge_props.js';
import { drawPlume } from './redgorge2_art.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const S = { s0: '#2a1210', s1: '#46221a', s2: '#6a3626', s3: '#8e4e34', s4: '#b06a44', s5: '#d08a5a', l1: '#eaa468', l2: '#fad39c', dk: '#180a0a' };
const WOOD = { w0: '#1e1208', w1: '#3a2614', w2: '#5e4022', w3: '#86602e', w4: '#b08848', rope: '#c8a868', ropeD: '#7a5c34', ropeL: '#ecd49c', iron: '#3a3a44', ironL: '#8a8a98' };
const CREST_Y = 8.5 * TS, NOTCH = { w: 96, y: 11 * TS };   /* the dam's crown (world y) and the spillway's notch */

/* ---- the dam's face, baked once: the ledge's width x (crown to bed) ---- */
function damFace(w, h) {
  return once('damface' + w + 'x' + h, () => { const [c, g] = canvas(w, h), r = mulberry(2610);
    const cols = ['#2c1614', '#341a18', '#3c201c', '#442620', '#301816', '#38201c']; let y = 0, row = 0;
    while (y < h) { const th = 13 + (row % 3 === 0 ? 2 : 0); let x = -((row * 11) % 24); while (x < w) { const bw = 26 + ((r() * 22) | 0), col = cols[(r() * cols.length) | 0]; rc(g, x + 1, y + 1, bw - 1, th - 1, col); rc(g, x + 1, y + 1, bw - 1, 1, '#4e2c24'); rc(g, x + 1, y + th - 1, bw - 1, 1, '#140808'); for (let i = 0; i < 3; i++) rc(g, x + 2 + ((r() * (bw - 4)) | 0), y + 2 + ((r() * (th - 4)) | 0), 2, 1, '#180a0a'); x += bw; } rc(g, 0, y, w, 1, '#120808'); y += th; row++; }
    { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,170,110,0.2)'); gr.addColorStop(0.3, 'rgba(120,50,50,0.0)'); gr.addColorStop(1, 'rgba(8,2,6,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }   /* the crown catches the dusk; the foot is in the channel's gloom */
    /* the face is darkest at the foot (the channel's damp) and where the water has run: long weep stains */
    for (let i = 0; i < 16; i++) { const sx = (r() * w) | 0, len = 20 + ((r() * 120) | 0), sy = (r() * (h - len)) | 0; g.globalAlpha = 0.22; rc(g, sx, sy, 1 + ((r() * 2) | 0), len, '#0e0608'); g.globalAlpha = 1; }
    for (let i = 0; i < 30; i++) { g.globalAlpha = 0.5; rc(g, (r() * w) | 0, (r() * h) | 0, 1 + ((r() * 4) | 0), 1, S.s0); g.globalAlpha = 1; }
    return c; });
}
/* the spillway's notch (a weir: the crown is cut down here; a stone apron below it, stepped) */
const gateArch = (open) => once('gatearch' + (open ? 1 : 0), () => { const [c, g] = canvas(34, 36);
  rc(g, 0, 0, 34, 36, S.s0); rc(g, 2, 2, 30, 34, S.s2); for (let i = 0; i < 6; i++) rc(g, 3 + i * 5, 2, 3, 6, i % 2 ? S.s3 : S.s4);   /* the voussoirs of the arch */
  rc(g, 6, 8, 22, 28, '#10080c'); rc(g, 6, 8, 22, 1, S.s1);
  for (let x = 8; x < 27; x += 4) rc(g, x, 9, 2, 27, WOOD.iron); rc(g, 7, 20, 20, 2, WOOD.iron); rc(g, 7, 30, 20, 2, WOOD.iron);   /* the grate */
  for (let x = 8; x < 27; x += 4) rc(g, x, 9, 1, 27, WOOD.ironL);
  rc(g, 0, 34, 34, 2, S.s1); return c; });

/* ---------------- THE STATIC SET ---------------- */
export function drawNestBackdrop(g, cx, cy, VW, VH, L, time) {
  const q = L.arena && L.arena.mat; if (!q) return; const x0 = q.sx * TS, x1 = (q.sx + STAGE.W) * TS, yT = CREST_Y, yB = (q.R + 1) * TS, sx0 = Math.max(0, R(x0 - cx)), sx1 = Math.min(VW, R(x1 - cx));
  if (sx1 <= sx0 || yB - cy < 0 || yT - cy > VH) return;
  g.save(); g.beginPath(); g.rect(sx0, 0, sx1 - sx0, VH); g.clip();
  const fx = R(x0 - cx), fy = R(yT - cy), fw = x1 - x0, fh = yB - yT;
  /* the reservoir behind the crown: a bar of still water in the dusk, just over the wall */
  rc(g, fx, fy - 7, fw, 7, '#c88a92'); rc(g, fx, fy - 7, fw, 1, '#f0c8b0'); for (let i = 0; i < 24; i++) rc(g, fx + ((i * 61 + R(time * 3)) % fw), fy - 5 + (i % 3), 5, 1, 'rgba(255,224,196,0.55)');
  g.drawImage(damFace(fw, fh), fx, fy);
  /* the crown: coping lit by the dusk, broken crenels, a notch for the spillway, a few stones fallen */
  const notchX = fx + R((fw - NOTCH.w) / 2);
  for (let x = 0; x < fw; x += 24) { if (x + fx + 24 > notchX && x + fx < notchX + NOTCH.w) continue; const h = 5 + ((x * 7 + 3) % 5 < 2 ? 0 : (x % 3) * 3); rc(g, fx + x, fy - h, 22, h, S.s3); rc(g, fx + x, fy - h, 22, 1, S.l2); rc(g, fx + x + 21, fy - h, 1, h, S.s0); }
  rc(g, fx, fy, fw, 3, S.s4); rc(g, fx, fy, fw, 1, S.l1);
  /* THE SPILLWAY: a stepped weir cut into the crown, an apron of three drops under it, dark with old water */
  rc(g, notchX, fy - 2, NOTCH.w, NOTCH.y - CREST_Y + 4, '#12080c'); for (let i = 0; i < 4; i++) { rc(g, notchX + i * 3, fy + 8 + i * 20, NOTCH.w - i * 6, 4, S.s3); rc(g, notchX + i * 3, fy + 8 + i * 20, NOTCH.w - i * 6, 1, S.l1); rc(g, notchX + i * 3, fy + 12 + i * 20, NOTCH.w - i * 6, 2, S.s0); }
  for (const sx of [notchX - 5, notchX + NOTCH.w]) { rc(g, sx, fy - 4, 5, 60, S.s3); rc(g, sx, fy - 4, 5, 1, S.l2); rc(g, sx + (sx < notchX ? 4 : 0), fy - 4, 1, 60, S.s0); }
  /* the gates' arches, over each bank (the water comes out of them at the lever) */
  for (const cxg of [x0 + 48, x1 - 48]) { const a = gateArch(false), ax = R(cxg - cx) - 17, ay = R(q.top * TS - 36 - cy); g.drawImage(a, ax, ay); }
  /* HER STRING-COURSE: the stone band along the wall she runs on in phase two, scored by talons */
  { const wy = R((STAGE.wallRow + 1) * TS - cy); rc(g, fx, wy - 2, fw, 7, S.s4); rc(g, fx, wy - 2, fw, 1, S.l2); rc(g, fx, wy + 4, fw, 1, S.s0); const r = mulberry(88);
    for (let i = 0; i < 70; i++) { const gx = fx + ((r() * fw) | 0); rc(g, gx, wy - 1, 1, 5, S.s0); rc(g, gx + 1, wy, 1, 3, S.s1); if (i % 7 === 0) rc(g, gx + 2, wy - 1, 1, 5, S.s0); }
    for (let x = 18; x < fw; x += 64) { rc(g, fx + x, wy - 5, 3, 6, WOOD.iron); rc(g, fx + x, wy - 5, 1, 6, WOOD.ironL); } }   /* the iron staples she grips */
  /* HER NEST, on a spur of the east wall, over the crown: a bowl of thornwood and bone, lined with plume */
  { const nx = R(x1 - 78 - cx), ny = R(yT - 38 - cy); rc(g, nx + 6, ny + 30, 66, 8, S.s2); rc(g, nx + 6, ny + 30, 66, 1, S.l1); for (let i = 0; i < 6; i++) rc(g, nx + 10 + i * 11, ny + 38, 6, 3 + (i % 3) * 2, S.s1);   /* the spur */
    g.drawImage(nestArt(64, 34, false), nx + 8, ny); for (let i = 0; i < 5; i++) drawPlume(g, nx + 16 + i * 10, ny + 14 + (i % 2) * 3, i);
    rc(g, nx + 14, ny + 16, 6, 3, '#e8dcc0'); rc(g, nx + 46, ny + 15, 8, 2, '#e8dcc0'); rc(g, nx + 50, ny + 17, 2, 3, '#cdbfa0'); }
  /* the dusk's low light, slanting down the face from the upper west (a few bands; they drift) */
  g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 5; k++) { const x = fx + ((k * 133 + 40 + time * 2.4) % (fw + 100)) - 50, a = 0.045 + 0.02 * Math.sin(time * 0.5 + k); g.fillStyle = 'rgba(255,190,120,' + a.toFixed(3) + ')'; g.beginPath(); g.moveTo(x, fy); g.lineTo(x + 26, fy); g.lineTo(x + 126, yB - cy); g.lineTo(x + 100, yB - cy); g.closePath(); g.fill(); } g.globalCompositeOperation = 'source-over';
  g.restore();
}

/* ---------------- WHAT LIES ON THE TOPS ---------------- */
export function planLedgeDress(L, T) {
  const q = L.arena && L.arena.mat; if (!q) return []; const W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]), out = [];
  const top = (tx, ty) => at(tx, ty) === T.SOLID && at(tx, ty - 1) === T.AIR;
  const put = (k, lx, o = 0) => { const tx = q.sx + lx, ty = q.top; if (top(tx, ty)) out.push({ k, x: tx * TS + 8 + o, y: ty * TS, tx, ty }); };
  put('bones', 2, 4); put('feather', 3, 2); put('coil', 36); put('bones', 39, -2); put('feather', 37, 6);   /* the banks (not by a lever: 1 and 38) */
  put('pebbles', 9); put('feather', 14); put('pebbles', 16); put('bones', 24, 3); put('pebbles', 25); put('feather', 30);   /* the pillars */
  return out;
}
const dressDraw = (g, d, x, y) => { const k = d.k;
  if (k === 'bones') { rc(g, x - 8, y - 2, 12, 2, '#e8dcc0'); rc(g, x - 10, y - 4, 3, 3, '#e8dcc0'); rc(g, x - 9, y - 3, 1, 1, '#1a1008'); rc(g, x - 4, y - 7, 1, 5, '#cdbfa0'); rc(g, x - 1, y - 8, 1, 6, '#e8dcc0'); rc(g, x + 2, y - 7, 1, 5, '#cdbfa0'); rc(g, x + 5, y - 5, 1, 3, '#a89878'); }
  else if (k === 'feather') drawPlume(g, x, y, d.tx);
  else if (k === 'coil') { rc(g, x - 5, y - 3, 10, 3, WOOD.rope); rc(g, x - 5, y - 3, 10, 1, WOOD.ropeL); rc(g, x - 4, y - 2, 8, 1, WOOD.ropeD); rc(g, x + 4, y - 1, 6, 1, WOOD.rope); }
  else if (k === 'pebbles') { for (const [dx, w, h] of [[-5, 4, 2], [-1, 3, 3], [3, 5, 2], [8, 2, 1]]) { rc(g, x + dx, y - h, w, h, S.s3); rc(g, x + dx, y - h, w, 1, S.s5); } } };

/* ---------------- THE DYNAMIC SET ---------------- */
let lastGate = 'W';
const pour = (g, x, y0, y1, w, time, speed, col, foam) => { if (y1 <= y0) return; g.fillStyle = col; g.fillRect(x, y0, w, y1 - y0); g.fillStyle = foam; for (let k = 0; k < w; k += 3) { const off = ((time * speed + k * 17) % 46); for (let y = y0 - 46 + off; y < y1; y += 46) { const a = Math.max(y, y0), b = Math.min(y + 14 + (k % 4) * 3, y1); if (b > a) g.fillRect(x + k, a, 2, b - a); } } };
export function drawLedge(g, cx, cy, time, S_, G, o) {
  const text = o.text, VW = o.VW, VH = o.VH, wy = o.wy;
  if (S_.pending.length) lastGate = S_.pending[0].id;
  const fx = R(G.x0 - cx), fw = G.x1 - G.x0, topY = G.topY, floorY = G.floorY, running = S_.flood || S_.burst > 0 || (S_.ph === 3 && S_.water > 0.05), horn = S_.horn && !running;
  /* THE SPILLWAY: a thread always; thicker on the horn; the whole curtain when the dam lets go */
  { const nx = R((G.x0 + G.x1) / 2 - NOTCH.w / 2 - cx), ny = R(NOTCH.y - cy), bottom = R((wy < 1e8 ? Math.min(wy, floorY) : floorY - 2) - cy), k = running ? 1 : horn ? 0.4 : 0.1, w = Math.max(3, R(NOTCH.w * k));
    const mx = nx + R((NOTCH.w - w) / 2); if (nx > -NOTCH.w - 20 && nx < VW + 20) { pour(g, mx, ny, bottom, w, time, running ? 170 : 90, running ? 'rgba(150,200,236,0.78)' : 'rgba(150,200,236,0.45)', 'rgba(244,251,255,0.9)');
      if (running) { for (let i = 0; i < 12; i++) { const t = (time * 1.6 + i * 0.29) % 1; rc(g, nx + 6 + ((i * 29) % (NOTCH.w - 12)), bottom - 4 - t * 16, 2, 2, 'rgba(255,255,255,' + (1 - t).toFixed(2) + ')'); } }
      else if (horn) { for (let i = 0; i < 5; i++) rc(g, mx + w / 2 + R(Math.sin(time * 9 + i) * 3), bottom - 3 - ((time * 24 + i * 5) % 6), 2, 1, 'rgba(255,255,255,0.8)'); } } }
  /* THE GATES: shut and dry (empty) / shut and weeping (held: the water's dark line behind the grate) / raised, and a jet over the bank (the release) */
  for (const l of G.levers) { const gx = R((l.id === 'W' ? G.x0 + 48 : G.x1 - 48) - cx) - 17, gy = R(topY - 36 - cy), full = !!S_.sluice[l.id], pend = S_.pending.some(p => p.id === l.id), jet = (S_.burst > 0 && lastGate === l.id) || pend;
    if (gx < -40 || gx > VW + 40) continue; const dir = l.id === 'W' ? 1 : -1;
    if (full) { rc(g, gx + 7, gy + 9, 20, 8, 'rgba(60,110,170,0.7)'); rc(g, gx + 7, gy + 9, 20, 1, 'rgba(180,220,255,0.8)'); for (let i = 0; i < 4; i++) { const t = (time * 1.1 + i * 0.27) % 1; rc(g, gx + 9 + i * 5, gy + 30 + t * 6, 1, 2, 'rgba(160,210,240,' + (1 - t).toFixed(2) + ')'); } rc(g, gx + 4, gy + 34, 26, 2, 'rgba(60,110,170,0.5)'); }   /* held: seeping */
    if (jet) { rc(g, gx + 7, gy + 8, 20, 28, '#06080c');   /* the door is up: black behind it */
      const n = 22, str = S_.burst > 0 ? 1 : 0.5; for (let i = 0; i < n; i++) { const t = i / n, jx = gx + 17 + dir * (t * 70 * str + 6), jy = gy + 28 + t * t * 50 - Math.sin(t * Math.PI) * 6 * str; rc(g, jx, jy, 4, 3 + (1 - t) * 4, i % 3 ? 'rgba(150,200,236,0.85)' : 'rgba(244,251,255,0.95)'); } } }
  /* THE LEVERS: a stone plinth, an iron post, a long lever with a wooden grip (up and back when the sluice is full, pulled forward when it is empty or letting go), a gauge tube beside it */
  for (const l of G.levers) { const x = R(l.x - cx), y = R(topY - cy), full = !!S_.sluice[l.id], pend = S_.pending.some(p => p.id === l.id); if (x < -30 || x > VW + 30) continue;
    rc(g, x - 6, y - 5, 12, 5, S.s2); rc(g, x - 6, y - 5, 12, 1, S.s4); rc(g, x - 3, y - 20, 6, 15, WOOD.iron); rc(g, x - 3, y - 20, 1, 15, WOOD.ironL); rc(g, x - 4, y - 21, 8, 2, WOOD.iron);
    const ang = pend || !full ? 0.95 : -0.55, lx = x, ly = y - 18; g.save(); g.translate(lx, ly); g.rotate(ang); g.fillStyle = WOOD.ironL; g.fillRect(-1, -16, 3, 16); g.fillStyle = WOOD.w3; g.fillRect(-2, -20, 5, 6); g.fillStyle = WOOD.w4; g.fillRect(-2, -20, 5, 1); g.restore();
    const gxx = x + (l.id === 'W' ? 9 : -13); rc(g, gxx, y - 24, 5, 22, WOOD.iron); rc(g, gxx + 1, y - 23, 3, 20, '#10181c'); if (full) { rc(g, gxx + 1, y - 22, 3, 19, '#4a8ac8'); rc(g, gxx + 1, y - 22, 3, 1, '#c8e8ff'); rc(g, gxx + 2, y - 20 + R((time * 8) % 5), 1, 1, '#ffffff'); } else rc(g, gxx + 1, y - 6, 3, 3, '#2a3a4a');
    const pulse = full && !pend && S_.ph === 1 ? 0.5 + 0.5 * Math.sin(time * 4) : 0; if (pulse > 0) { g.globalAlpha = 0.2 + 0.25 * pulse; g.strokeStyle = '#ffe9a0'; g.beginPath(); g.arc(x, y - 22, 9 + pulse * 2, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* the lever glints while it can still throw her */
    text(full ? 'FULL' : 'EMPTY', x, y - 34, full ? '#7ab8e8' : '#9aa39a', 'center', 5); }
  /* THE ROPE BRIDGES: a lashed mast at each end (the lashing at its foot is what you strike), a sagging deck of boards, hand-ropes each side; a cut deck hangs off the far mast */
  for (const b of G.bridges) { const st = S_.bridges[b.id], ax = R(b.a - cx), bx = R(b.b - cx), top0 = R(G.bridgeY - 24 - cy), deck = R(G.bridgeY - cy), foot = R(topY - cy), perched = S_.perch === b.id && o.boss && o.boss.mode === 'perch';
    if (bx < -20 || ax > VW + 20) continue;
    for (const px of [ax, bx]) { rc(g, px - 3, top0, 6, foot - top0, WOOD.w2); rc(g, px - 3, top0, 2, foot - top0, WOOD.w3); rc(g, px + 2, top0, 1, foot - top0, WOOD.w1); rc(g, px - 5, top0 + 2, 10, 3, WOOD.w3); rc(g, px - 5, top0 + 2, 10, 1, WOOD.w4);   /* a mast and its crosstree */
      rc(g, px - 4, top0 - 3, 8, 3, WOOD.iron); rc(g, px - 4, top0 - 3, 8, 1, WOOD.ironL);
      for (let y = foot - 34; y < foot - 8; y += 4) { rc(g, px - 4, y, 8, 3, WOOD.rope); rc(g, px - 4, y, 8, 1, WOOD.ropeL); rc(g, px - 4, y + 2, 8, 1, WOOD.ropeD); }   /* THE LASHING: bright, thick, six turns - the thing to cut */
      rc(g, px - 6, foot - 8, 12, 8, S.s3); rc(g, px - 6, foot - 8, 12, 1, S.l1); rc(g, px - 6, foot - 1, 12, 1, S.s0);   /* a cairn at its foot */
      if (perched) { const k = 0.5 + 0.5 * Math.sin(time * 8); g.globalAlpha = 0.4 + 0.5 * k; g.strokeStyle = '#ffe9a0'; g.lineWidth = 1; g.beginPath(); g.arc(px, foot - 20, 10 + 2 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
    if (st === 'up') { g.strokeStyle = WOOD.rope; g.lineWidth = 1; for (const off of [-14, -2]) { g.beginPath(); g.moveTo(ax + 3, top0 + 4 + off + 14); g.quadraticCurveTo((ax + bx) / 2, deck + 8 + off + 14, bx - 3, top0 + 4 + off + 14); g.stroke(); }   /* the hand-ropes */
      g.beginPath(); g.moveTo(ax + 3, deck - 1); g.quadraticCurveTo((ax + bx) / 2, deck + 8, bx - 3, deck - 1); g.stroke();
      for (let x = ax + 5; x < bx - 4; x += 5) { const u = (x - ax) / (bx - ax), sy = deck + R(Math.sin(Math.PI * u) * 7); rc(g, x, sy, 4, 3, u > 0.4 && u < 0.45 ? WOOD.w2 : WOOD.w3); rc(g, x, sy, 4, 1, WOOD.w4); if (x % 20 < 5) { rc(g, x + 1, sy - 12 - R(Math.sin(Math.PI * u) * 0), 1, 12, WOOD.ropeD); } } }   /* boards with a gap between, hangers up to the hand-rope */
    else { const sw = Math.sin(time * 2.6) * 3; g.strokeStyle = WOOD.rope; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 3, deck - 1); g.lineTo(bx - 8 + sw, deck + 70); g.moveTo(bx + 3, deck - 1); g.lineTo(bx - 3 + sw, deck + 70); g.stroke(); for (let i = 0; i < 9; i++) rc(g, bx - 9 + sw * (i / 9) - i * 0.5, deck + 4 + i * 8, 7, 3, WOOD.w3);
      rc(g, ax - 1, deck - 2, 3, 3, WOOD.ropeD); rc(g, ax - 3, deck + 3, 2, 5 + R(Math.sin(time * 3) * 1.5), WOOD.rope); } }   /* the near end cut: a frayed tail */
  /* THE CHANNEL'S WATER: a wash that builds on the horn, a flood, a burst, the cracked dam's rising water */
  if (wy < 1e8 || S_.horn) { const yy = R((wy < 1e8 ? wy : floorY - 3) - cy), bot = R(floorY - cy), big = S_.burst > 0, fast = running ? (big ? 150 : 70) : 20;
    if (bot > 0 && yy < VH + 4) { const gr = g.createLinearGradient(0, yy, 0, bot); gr.addColorStop(0, big ? 'rgba(170,214,244,0.78)' : S_.horn && wy > 1e8 ? 'rgba(170,150,130,0.5)' : 'rgba(110,170,214,0.66)'); gr.addColorStop(1, 'rgba(34,64,110,0.82)'); g.fillStyle = gr; g.fillRect(fx, yy, fw, bot - yy);
      g.fillStyle = 'rgba(255,255,255,0.8)'; for (let x = 0; x < fw; x += 7) { const sx = fx + ((x + R(time * fast)) % fw), hh = 1 + ((x * 13 + R(time * 6)) % 3 === 0 ? 1 : 0); g.fillRect(sx, yy - hh, 4, hh + 1); }
      g.fillStyle = 'rgba(200,232,255,0.5)'; for (let x = 0; x < fw; x += 19) g.fillRect(fx + ((x * 3 + R(time * fast * 0.6)) % fw), yy + 4 + (x % 4) * 3, 8, 1);
      for (const t of G.tops) { for (const ex of [t.l, t.r]) { const sx = R(ex - cx); if (sx < -10 || sx > VW + 10) continue; for (let k = 0; k < 4; k++) rc(g, sx + (ex === t.l ? -2 - (k & 1) : 0), yy - 2 - k, 3, 1, 'rgba(255,255,255,' + (0.9 - k * 0.15).toFixed(2) + ')'); } } } }   /* foam clinging to every pillar and bank */
  /* THE DAM'S LOOSE TIMBERS, as wreckage (drawn here so the art is one hand): see matriarch hands */
  /* what lies on the tops */
  for (const d of o.dress || []) { const x = R(d.x - cx), y = R(d.y - cy); if (x < -16 || x > VW + 16) continue; dressDraw(g, d, x, y); }
}
