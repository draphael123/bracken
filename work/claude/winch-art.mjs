// work/claude/winch-art.mjs - THE REWORKED WINCHMASTER, rendered in Node so the integrator can show Daniel the fight without a
// browser: work/claude/winch-arena.png (the drum house: three housings, two lines, three ropes, at 2x) and
// work/claude/winch-poses.png (ten 320x180 game-size panels at 2x, left to right, top to bottom):
//   1 SEND, told (the red line)      2 SEND, let go down the low line   3 THE HOOK, told (it swings)    4 THE HOOK, thrown
//   5 THE BRAKE BAR, told (yellow)   6 THE BRAKE BAR, down on the mouth 7 REVERSE (the line's arrows)   8 THROWN off the Great Drum
//   9 DOWNED on its ledge (the ring)  10 the SWING on to the Head Frame
// HONEST ABOUT WHAT IT IS: his sprite and the fight's FX are the real code (bakeWinchmaster, drawWinchFx, drawBucket); the tiles,
// the drums and the hero are flat stand-ins (the knight's baker uses rotate, which node-canvas refuses), and Node renders lie about
// light (AGENT-HANDOFF): nothing here glows. The hero is the grey figure; a raised yellow bar in front of him is his shield.
// usage (from the checkout root): node work/claude/winch-art.mjs
import { install, newCanvas, sheet, savePNG } from '../../tools/node-canvas.mjs';
install();
const { LEVELS, T } = await import('../../src/level.js');
const { OR, cableLines, makeCableway, bucketAt, lineYAt, drawBucket } = await import('../../src/ore-road.js');
const { WINCH, winchFrame, drawWinchFx } = await import('../../src/winchmaster.js');
const { bakeWinchmaster } = await import('../../src/redraw/winchmaster.js');
const TS = 16, L = LEVELS.find(l => l.id === 'oreroad').build(), AR = OR.ARENA, S = bakeWinchmaster();
const Cw = makeCableway(cableLines()), lines = Cw.lines;
const H = AR.housings.map(Hs => { const ln = lines.find(l => l.id === Hs.line), p = ln.pts, near = Hs.at === 'end' ? p[p.length - 1] : p[0], far = Hs.at === 'end' ? p[0] : p[p.length - 1];
  return { id: Hs.id, name: Hs.name, homeX: Hs.home * TS, topY: (Hs.top + 1) * TS, ledgeX: (Hs.at === 'end' ? Hs.ledge[1] + 0.5 : Hs.ledge[0] + 0.5) * TS, ledgeY: (Hs.ledgeTop + 1) * TS, drumX: near[0], mouthY: near[1], away: Math.sign(far[0] - near[0]) || -1, sense: Hs.at === 'end' ? 1 : -1, ln, Hs }; });
const c = { H, lineY: (h, x) => lineYAt(H[h].ln, x) };
const COL = { [T.SOLID]: ['#5e5446', '#766a58'], [T.NET]: ['#8a6a44', '#8a6a44'], [T.PLANK]: ['#6a4a2c', '#8a6a44'], [T.SPIKE]: ['#8a3a2a', '#c9463d'] };
function scene(W, Hh, cx, cy, st) {
  const cv = newCanvas(W, Hh), g = cv.getContext('2d');
  g.fillStyle = '#9aa8c0'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#b8b8bc'; g.fillRect(0, Math.round(Hh * 0.62), W, Hh);
  /* the two high housings' legs and every drum, flat */
  for (const q of H) { const Hs = q.Hs;
    if (Hs.id !== 'A') { g.fillStyle = '#4a321e'; for (const x of [Hs.x0 * TS + 4, (Hs.x1 + 1) * TS - 9]) g.fillRect(Math.round(x - cx), Math.round((Hs.top + 3) * TS - cy), 5, Hh + 400); }
    const dx = Math.round(q.drumX + (Hs.at === 'end' ? 12 : -12) - cx), dy = Math.round(q.mouthY - OR.BUCKET.hang - cy), r = Hs.id === 'A' ? 18 : 12;
    g.fillStyle = '#2a2a30'; g.fillRect(dx - r - 2, dy - r - 2, 2 * r + 4, 2 * r + 4); g.fillStyle = '#4a4a52'; g.fillRect(dx - r, dy - r, 2 * r, 2 * r); g.fillStyle = '#c9a44a'; for (let k = -r + 3; k < r - 3; k += 3) g.fillRect(dx - 2, dy + k, 4, 1); }
  for (let ty = Math.max(0, Math.floor(cy / TS)); ty <= Math.min(L.H - 1, Math.floor((cy + Hh) / TS)); ty++) for (let tx = Math.max(0, Math.floor(cx / TS)); tx <= Math.min(L.W - 1, Math.floor((cx + W) / TS)); tx++) {
    const t = L.grid[ty * L.W + tx], col = COL[t]; if (!col) continue; const x = tx * TS - cx, y = ty * TS - cy;
    if (t === T.NET) { g.fillStyle = col[0]; g.fillRect(x + 6, y, 1, TS); g.fillRect(x + 10, y, 1, TS); for (let k = 2; k < TS; k += 5) g.fillRect(x + 6, y + k, 5, 1); continue; }
    g.fillStyle = col[0]; g.fillRect(x, y, TS, TS); const up = ty > 0 ? L.grid[(ty - 1) * L.W + tx] : T.AIR; if (up !== t) { g.fillStyle = col[1]; g.fillRect(x, y, TS, 2); } }
  /* the hauling cables, and the skips on them (the real drawBucket) */
  for (const l of lines) { g.fillStyle = '#2a2a30'; for (let x = l.pts[0][0]; x <= l.pts[l.pts.length - 1][0]; x += 2) g.fillRect(Math.round(x - cx), Math.round(lineYAt(l, x) - OR.BUCKET.hang - cy), 2, 2); }
  for (const b of st.buckets || []) drawBucket(g, { vis: true, x: b.x - OR.BUCKET.w / 2, y: b.y, w: OR.BUCKET.w, h: OR.BUCKET.h, ore: true, lift: 0, brake: 0 }, cx, cy, 0);
  /* HIM: his real sprite and his real FX */
  const e = st.e, img = (e.face > 0 ? S.R : S.L)[winchFrame(e)], ax = e.face > 0 ? S.ax : img.width - S.ax;
  g.drawImage(img, Math.round(e.x - cx - ax), Math.round(e.y - cy - S.ay));
  drawWinchFx(g, { alive: true, anim: 0.3, ...e }, c, cx, cy, st.time || 0.1);
  /* the hero stand-in: a grey knight's box, and his shield if it is up */
  if (st.hero) { const [hx, hy] = st.hero, x = Math.round(hx - cx), y = Math.round(hy - cy);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 6, y - 18, 12, 18); g.fillStyle = '#c9d1dc'; g.fillRect(x - 5, y - 17, 10, 16); g.fillStyle = '#6a7284'; g.fillRect(x - 4, y - 16, 8, 5); g.fillStyle = '#3a4a6a'; g.fillRect(x - 5, y - 9, 10, 4);
    if (st.shield) { g.fillStyle = '#ffd36b'; g.fillRect(x + (st.shield > 0 ? 6 : -9), y - 16, 3, 13); } }
  return cv;
}
const ly = (h, x) => lineYAt(H[h].ln, x), LOW = 0, AT = (h, dist) => H[h].drumX + H[h].away * dist;
const home = h => ({ x: H[h].homeX, y: H[h].topY });
const frame = (fx, fy) => [Math.round(fx - 160), Math.round(fy - 108)];
const P = [];
{ const hx = AT(0, 200); const [cx, cy] = frame((hx + H[0].homeX) / 2, 196);   /* 1 SEND told, at the Great Drum, at a rider on the low line */
  P.push(scene(320, 180, cx, cy, { e: { ...home(0), at: 0, face: -1, mode: 'sendTell', modeT: WINCH.tell.send * 0.25 }, buckets: [{ x: hx, y: ly(LOW, hx) }, { x: hx - 90, y: ly(LOW, hx - 90) }], hero: [hx, ly(LOW, hx)] })); }
{ const hx = AT(0, 200); const [cx, cy] = frame((hx + H[0].homeX) / 2, 196);   /* 2 SEND let go: the runaway coming, the rider in the air over it */
  P.push(scene(320, 180, cx, cy, { e: { ...home(0), at: 0, face: -1, mode: 'send', modeT: 0.2, runaway: { at: 0, s: 150, delay: 0 } }, buckets: [{ x: hx + 10, y: ly(LOW, hx + 10) }], hero: [hx + 8, ly(LOW, hx) - 34] })); }
{ const hx = AT(1, 110); const [cx, cy] = frame((hx + H[1].homeX) / 2, 130);   /* 3 THE HOOK told, from the Head Frame, at a rider on the high line */
  P.push(scene(320, 180, cx, cy, { e: { ...home(1), at: 1, face: 1, mode: 'hookTell', modeT: WINCH.tell.hook * 0.2 }, buckets: [{ x: hx, y: ly(1, hx) }], hero: [hx, ly(1, hx)], time: 0.3 })); }
{ const hx = AT(1, 110); const [cx, cy] = frame((hx + H[1].homeX) / 2, 130);   /* 4 THE HOOK thrown: the chain out to where the rider is going */
  const x0 = H[1].homeX + 10, y0 = H[1].topY - 26, tx = hx - 8, ty = ly(1, hx) - 9, k = 0.7;
  P.push(scene(320, 180, cx, cy, { e: { ...home(1), at: 1, face: 1, mode: 'hook', modeT: 0.3, hk: { x: x0 + (tx - x0) * k, y: y0 + (ty - y0) * k, st: 'out' } }, buckets: [{ x: hx, y: ly(1, hx) }], hero: [hx, ly(1, hx)] })); }
{ const hx = AT(2, 60); const [cx, cy] = frame(hx - 10, 150);    /* 5 THE BRAKE BAR told, at the Tail Wheel's mouth, the rider's shield up */
  P.push(scene(320, 180, cx, cy, { e: { ...home(2), at: 2, face: -1, mode: 'leverTell', modeT: WINCH.tell.lever * 0.2 }, buckets: [{ x: hx, y: ly(1, hx) }], hero: [hx, ly(1, hx)], shield: 1 })); }
{ const hx = AT(2, 40); const [cx, cy] = frame(hx - 10, 150);    /* 6 THE BRAKE BAR down on the mouth, turned */
  P.push(scene(320, 180, cx, cy, { e: { ...home(2), at: 2, face: -1, mode: 'lever', modeT: 0.2 }, buckets: [{ x: hx, y: ly(1, hx) }], hero: [hx, ly(1, hx)], shield: 1 })); }
{ const hx = AT(0, 180); const [cx, cy] = frame((hx + H[0].homeX) / 2, 196);   /* 7 REVERSE: the low line running back out, and the rider on it */
  P.push(scene(320, 180, cx, cy, { e: { ...home(0), at: 0, face: -1, mode: 'reverse', modeT: 0.2, revT: 1.5, revAt: 0 }, buckets: [{ x: hx, y: ly(LOW, hx) }, { x: hx + 90, y: ly(LOW, hx + 90) }], hero: [hx, ly(LOW, hx)], time: 0.2 })); }
{ const q = H[0], k = 0.5, x = q.homeX + (q.ledgeX - q.homeX) * k, y = q.topY + (q.ledgeY - q.topY) * k - 24; const [cx, cy] = frame(q.drumX, 190);   /* 8 THE JAM: thrown off the housing */
  P.push(scene(320, 180, cx, cy, { e: { x, y, at: 0, face: -1, mode: 'thrown', modeT: 0.3 }, buckets: [{ x: q.drumX - 6, y: q.mouthY }], hero: [q.drumX - 12, q.mouthY] })); }
{ const q = H[0]; const [cx, cy] = frame(q.drumX, 190);           /* 9 DOWNED on the ledge, double: the hero on the jammed skip, cutting */
  P.push(scene(320, 180, cx, cy, { e: { x: q.ledgeX, y: q.ledgeY, at: 0, face: -1, mode: 'downed', modeT: 3 }, buckets: [{ x: q.drumX - 6, y: q.mouthY }], hero: [q.ledgeX - 26, q.mouthY], time: 0.15 })); }
{ const a = H[0], b = H[1], k = 0.45, x = a.ledgeX + (b.homeX - a.ledgeX) * k, y = a.ledgeY + (b.topY - a.ledgeY) * k + Math.sin(k * Math.PI) * 30; const [cx, cy] = frame(x, 150);   /* 10 THE SWING to the Head Frame */
  P.push(scene(320, 180, cx, cy, { e: { x, y, at: 0, face: -1, mode: 'swing', modeT: 0.5 } })); }
savePNG(sheet(P, { maxW: 2 * (320 + 6) + 6, pad: 6, bg: '#2a2630', scale: 2 }), new URL('./winch-poses.png', import.meta.url));
/* THE ROOM: the whole drum house, him on the Great Drum, a skip every 90 px on both lines */
{ const x0 = 468 * TS, y0 = 0, W = 56 * TS, Hh = 24 * TS, bs = [];
  for (const l of lines) for (let i = 0; i < l.n; i++) { const b = bucketAt(l, i); if (b.vis) bs.push({ x: b.x, y: b.y }); }
  savePNG(sheet([scene(W, Hh, x0, y0, { e: { ...home(0), at: 0, face: -1, mode: 'stalk' }, buckets: bs, hero: [478 * TS, 208] })], { maxW: W + 12, pad: 6, bg: '#2a2630', scale: 2 }), new URL('./winch-arena.png', import.meta.url)); }
console.log('work/claude/winch-poses.png (10 panels) and work/claude/winch-arena.png written');
