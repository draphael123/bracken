// src/holy-fx.js - THE PALADIN'S LIGHT, DRAWN (claude/palart, Daniel 10-13): art only - nothing here reads or writes a number the fight uses.
//   THE HAMMER OF LIGHT: the UP+C throw was a 12 px light blob; it is a spinning hammer now (eight pre-baked turns of a white-gold head on a pale
//     haft, a dark rim so it reads on a bright floor, a glow, and a fading trail behind it), drawn flying to the hand it is thrown from at the end of its
//     way back, with a CATCH FLASH (a ring and a burst of motes) when it lands there.
//   SMITE: the held overhead spent on holy ground. Its WINDUP glows (a white-gold bloom at the head of the maul, motes rising off it, growing with the
//     wind), its RELEASE is a column of light standing on the spot the maul comes down (white core, gold edge, a ground flash), and its waves are drawn
//     WHITE-GOLD with a light trail - never the brown hammerfall dust the plain overhead sends.
//   All of it is drawn from state main.js already keeps (hammers, pwaves, P.charge); the module keeps only its own short-lived flashes.
//   makeHolyFx({ bloom, parts }) -> { hammer, wave, smite, catchAt, windup, update, draw, clear }
const G = '#ffd36b', C = '#fff6c8', W = '#ffffff', D = '#8a5a14', H = '#e0b858';

/* THE HAMMER, EIGHT TURNS: a 13 x 13 sprite, the head up, turned by 45 degrees a frame (nearest pixel, so it stays crisp) */
export function bakeHammer() {
  const N = 13, mid = 6, base = [];   /* base[y][x]: 0 clear, 1 rim, 2 head gold, 3 head white, 4 haft, 5 haft light */
  for (let y = 0; y < N; y++) base.push(new Array(N).fill(0));
  for (let y = 1; y <= 6; y++) for (let x = 1; x <= 11; x++) base[y][x] = 1;                                   /* the rim of the head, 11 x 6 */
  for (let y = 2; y <= 5; y++) for (let x = 2; x <= 10; x++) base[y][x] = y === 2 || y === 5 ? 2 : (x > 2 && x < 10 ? 3 : 2);   /* gold at its edges, cream across it, a white core below */
  for (let y = 3; y <= 4; y++) for (let x = 4; x <= 8; x++) base[y][x] = 6;
  base[1][1] = base[1][11] = base[6][1] = base[6][11] = 0;                                                       /* the corners off */
  for (let y = 7; y <= 12; y++) { base[y][mid - 1] = 1; base[y][mid + 1] = 1; base[y][mid] = y & 1 ? 4 : 5; }     /* the haft, with its rim */
  base[12][mid] = 5; base[12][mid - 1] = 1; base[12][mid + 1] = 1;
  const col = { 1: D, 2: G, 3: C, 4: H, 5: W, 6: W };
  const frames = [];
  for (let k = 0; k < 8; k++) { const c = document.createElement('canvas'); c.width = c.height = N + 4; const g = c.getContext('2d'); const a = k * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a), ctr = (N + 4) / 2 - 0.5, src = mid;
    for (let y = 0; y < N + 4; y++) for (let x = 0; x < N + 4; x++) {   /* inverse-rotate about the middle of the head-and-haft (its centre of mass sits at the head's lower edge) */
      const dx = x - ctr, dy = y - ctr, sx = Math.round(ca * dx + sa * dy + src), sy = Math.round(-sa * dx + ca * dy + 5);
      if (sx < 0 || sy < 0 || sx >= N || sy >= N) continue; const v = base[sy][sx]; if (!v) continue; g.fillStyle = col[v]; g.fillRect(x, y, 1, 1); }
    frames.push(c); }
  return frames;
}

export function makeHolyFx(api) {
  let hammerFrames = null, flashes = [], columns = [];
  const parts = api.parts, B = (g, ...a) => { api.bloom(...a); g.globalAlpha = 1; };   /* (main.js bloom leaves its alpha set) */
  const frames = () => hammerFrames || (hammerFrames = bakeHammer());
  /* THE HAMMER IN FLIGHT. m: main.js's { x, y, t, dir, x0, y0 }; hand: where it is caught (the off hand) or null; returns where it was drawn */
  function hammer(g, m, cx, cy, now, hand) {
    const T = 1.4, back = Math.max(0, Math.min(1, (m.t - (T - 0.22)) / 0.22)), s = back * back * (3 - 2 * back);   /* the last 0.22 s it flies in to the hand */
    let x = m.x, y = m.y; if (hand && s > 0) { x += (hand.x - x) * s; y += (hand.y - y) * s; }
    const f = frames(), turn = Math.floor(m.t * 18) & 7;
    /* THE TRAIL: the same hammer, two and four turns behind it, fainter, a few px back along its way (the way it is going: out, then back) */
    const dir = m.t < T / 2 ? m.dir : -m.dir;
    for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.28 - k * 0.06; g.drawImage(f[(turn + 8 - k * 2) & 7], Math.round(x - cx - 8.5 - dir * k * 5), Math.round(y - cy - 8.5 + Math.sin((m.t - k * 0.03) * 9) * 0)); }
    g.globalAlpha = 1; g.drawImage(f[turn], Math.round(x - cx - 8.5), Math.round(y - cy - 8.5));
    B(g, x - cx, y - cy, 13, 0.5, 'gold'); B(g, x - cx, y - cy, 7, 0.45, 'gold');
    if (Math.random() < 0.6) parts({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8, vx: -dir * 20, vy: -10 - Math.random() * 14, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? C : G, size: 1, grav: -6, glow: true });
    return { x, y, caught: m.t >= T - 0.03 }; }
  /* THE CATCH: a ring off the hand and a burst of motes */
  function catchAt(x, y) { flashes.push({ x, y, t: 0, max: 0.3 }); for (let i = 0; i < 9; i++) { const a = Math.random() * 6.283, v = 30 + Math.random() * 40; parts({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8, life: 0.4, max: 0.4, col: i & 1 ? C : G, size: 1, grav: 20, glow: true }); } }
  /* SMITE'S RELEASE: a column of light standing on the spot, white core, gold edge, a flash on the floor */
  function smite(x, y) { columns.push({ x, y, t: 0, max: 0.5 });
    for (let i = 0; i < 16; i++) parts({ x: x + (Math.random() - 0.5) * 8, y: y - 2, vx: (Math.random() - 0.5) * 40, vy: -50 - Math.random() * 70, life: 0.55, max: 0.55, col: i % 3 ? C : G, size: 1, grav: -10, glow: true }); }
  /* SMITE'S WINDUP: held at the head of the maul. k 0..1 the wind; x, y the head. Drawn over him, every frame he holds it */
  function windup(g, x, y, k, now) {
    B(g, x, y, 10 + 12 * k, 0.28 + 0.4 * k, 'gold'); B(g, x, y, 5 + 4 * k, 0.3 + 0.4 * k, 'gold');
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const u = (now * 1.6 + i / 3) % 1; g.globalAlpha = (1 - u) * (0.4 + 0.5 * k); g.fillStyle = i === 1 ? W : C; g.fillRect(Math.round(x + Math.sin(now * 9 + i * 2.1) * (3 + 2 * k)), Math.round(y - 3 - u * (8 + 10 * k)), 1, 1); }
    if (k > 0.75) { g.globalAlpha = 0.5 + 0.3 * Math.sin(now * 30); g.fillStyle = W; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); }   /* the head is white at full wind */
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  /* A HOLY WAVE: not the hammerfall's low brown mound but a SPIRE OF LIGHT that runs along the floor - a flame-shaped pillar, white at the heart, gold at its
     edge, 14 px tall (the mound is 8), a ground flash under it, motes lifting off it and a glow; it never reads as the plain overhead's dust */
  function wave(g, w, cx, cy, now) { const x = Math.round(w.x - cx), y = Math.round(w.y - cy), fl = Math.floor(now * 14 + w.x / 9) & 1;
    const ROWS = [[0, 1], [1, 3], [1, 3], [2, 5], [2, 5], [2, 5], [3, 7], [3, 7], [3, 7], [3, 7], [3, 7], [3, 7], [3, 7], [3, 7]];   /* top to bottom: [half-width, width] - the tip flickers a pixel */
    const top = y - 14 - fl;
    g.fillStyle = D; ROWS.forEach(([hw], j) => { if (j > 2) { g.fillRect(x - hw - 1, top + j + fl, 1, 1); g.fillRect(x + hw + 1, top + j + fl, 1, 1); } });   /* a one-pixel dark edge on the lower rows only, so it reads on a bright floor */
    ROWS.forEach(([hw, wd], j) => { const yy = top + j + fl; g.fillStyle = G; g.fillRect(x - hw, yy, wd, 1); if (wd > 1) { g.fillStyle = C; g.fillRect(x - hw + 1, yy, wd - 2, 1); } if (wd > 3) { g.fillStyle = W; g.fillRect(x - 1, yy, 2, 1); } });
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.55; g.fillStyle = G; g.beginPath(); g.ellipse(x, y - 1, 9, 2.5, 0, 0, 7); g.fill();   /* the flash on the floor under it */
    for (let i = 1; i <= 4; i++) { g.globalAlpha = 0.7 / i; g.fillStyle = i & 1 ? C : G; g.fillRect(x - w.dir * (3 + i * 4) + (i & 1 ? 1 : -1), y - 3 - ((now * 22 + i * 5) % 12), 1, 1); }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 7, 11, 0.4, 'gold'); }
  function update(dt) { for (const f of flashes) f.t += dt; flashes = flashes.filter(f => f.t < f.max); for (const c of columns) c.t += dt; columns = columns.filter(c => c.t < c.max); }
  function draw(g, cx, cy) {
    for (const c of columns) { const k = c.t / c.max, a = 1 - k, x = Math.round(c.x - cx), y = Math.round(c.y - cy), w = Math.max(2, Math.round(7 * (1 - k * 0.6))), h = Math.round(46 * Math.min(1, c.t / 0.08));
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45 * a; g.fillStyle = G; g.fillRect(x - Math.ceil(w / 2) - 1, y - h, w + 2, h);                    /* the edge */
      g.globalAlpha = 0.9 * a; g.fillStyle = C; g.fillRect(x - Math.floor(w / 2), y - h, w, h);                             /* the body of it */
      g.globalAlpha = a; g.fillStyle = W; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 2), y - h, Math.max(1, w - 4), h);   /* the white core */
      g.globalAlpha = 0.6 * a; g.fillStyle = G; g.beginPath(); g.ellipse(x, y - 1, 6 + 20 * k, 2 + 3 * k, 0, 0, 7); g.fill();   /* the flash on the floor */
      g.globalAlpha = a; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 4 + 26 * k, 1.5 + 4 * k, 0, 0, 7); g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 20, 22, 0.35 * a, 'gold'); }
    for (const f of flashes) { const k = f.t / f.max, x = Math.round(f.x - cx), y = Math.round(f.y - cy);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3 + 11 * k, 0, 7); g.stroke();
      g.globalAlpha = 0.6 * (1 - k); g.fillStyle = C; g.fillRect(x - 1, y - 1, 3, 3); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y, 14, 0.5 * (1 - k), 'gold'); } }
  const clear = () => { flashes = []; columns = []; };
  return { hammer, wave, smite, catchAt, windup, update, draw, clear };
}
