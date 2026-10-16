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

/* THE WAR HAMMER, EIGHT TURNS (PALADIN 3 ART: ~70% of the old maul-head, a compact SQUARE head on a long haft): an 11 x 11 sprite, the head up, turned by 45 degrees a frame (nearest pixel, so it stays crisp) */
export function bakeHammer() {
  const N = 11, mid = 5, base = [];   /* base[y][x]: 0 clear, 1 rim, 2 head gold, 3 head white, 4 haft, 5 haft light */
  for (let y = 0; y < N; y++) base.push(new Array(N).fill(0));
  for (let y = 1; y <= 6; y++) for (let x = 1; x <= 9; x++) base[y][x] = 1;                                    /* the rim of the head, 9 x 6: a block */
  for (let y = 2; y <= 5; y++) for (let x = 2; x <= 8; x++) base[y][x] = y === 2 || y === 5 ? 2 : (x > 2 && x < 8 ? 3 : 2);   /* gold at its edges, cream across it */
  for (let y = 3; y <= 4; y++) for (let x = 4; x <= 6; x++) base[y][x] = 6;                                      /* a white core */
  base[1][1] = base[1][9] = base[6][1] = base[6][9] = 0;                                                         /* the corners off */
  for (let y = 7; y <= 10; y++) { base[y][mid - 1] = 1; base[y][mid + 1] = 1; base[y][mid] = y & 1 ? 4 : 5; }     /* the long haft, with its rim */
  base[10][mid] = 5; base[10][mid - 1] = 1; base[10][mid + 1] = 1;
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
  let hammerFrames = null, spearFrame = null, flashes = [], columns = [], bursts = [], falls = [], vstrikes = [], starbursts = [], dawns = [], judges = [], shards = [], prays = [];   /* (PALADIN 4 ART) DAWNFALL's pillar, JUDGED's gavel and scales, the ward's SHATTER, the prayer's rising ring */   /* (PALADIN 3 ART) RADIANCE's ring, SUNFALL's falling light, VERDICT's columns, the perfect guard's flash */
  const parts = api.parts, B = (g, ...a) => { api.bloom(...a); g.globalAlpha = 1; };   /* (main.js bloom leaves its alpha set) */
  const frames = () => hammerFrames || (hammerFrames = bakeHammer());
  /* THE HAMMER IN FLIGHT. m: main.js's { x, y, t, dir, x0, y0 }; hand: where it is caught (the off hand) or null; returns where it was drawn */
  function hammer(g, m, cx, cy, now, hand) {
    const T = 1.4, back = Math.max(0, Math.min(1, (m.t - (T - 0.22)) / 0.22)), s = back * back * (3 - 2 * back);   /* the last 0.22 s it flies in to the hand */
    let x = m.x, y = m.y; if (hand && s > 0) { x += (hand.x - x) * s; y += (hand.y - y) * s; }
    const f = frames(), turn = Math.floor(m.t * 18) & 7;
    /* THE TRAIL: the same hammer, two and four turns behind it, fainter, a few px back along its way (the way it is going: out, then back) */
    const dir = m.t < T / 2 ? m.dir : -m.dir;
    for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.28 - k * 0.06; g.drawImage(f[(turn + 8 - k * 2) & 7], Math.round(x - cx - 7.5 - dir * k * 5), Math.round(y - cy - 7.5 + Math.sin((m.t - k * 0.03) * 9) * 0)); }
    g.globalAlpha = 1; g.drawImage(f[turn], Math.round(x - cx - 7.5), Math.round(y - cy - 7.5));
    B(g, x - cx, y - cy, 10, 0.5, 'gold'); B(g, x - cx, y - cy, 5, 0.45, 'gold');
    if (Math.random() < 0.6) parts({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8, vx: -dir * 20, vy: -10 - Math.random() * 14, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? C : G, size: 1, grav: -6, glow: true });
    return { x, y, caught: m.t >= T - 0.03 }; }
  /* THE CATCH: a ring off the hand and a burst of motes */
  function catchAt(x, y) { flashes.push({ x, y, t: 0, max: 0.3 }); for (let i = 0; i < 9; i++) { const a = Math.random() * 6.283, v = 30 + Math.random() * 40; parts({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8, life: 0.4, max: 0.4, col: i & 1 ? C : G, size: 1, grav: 20, glow: true }); } }
  /* SMITE'S RELEASE: a column of light standing on the spot, white core, gold edge, a flash on the floor */
  function smite(x, y, emp) { columns.push({ x, y, t: 0, max: emp ? 0.62 : 0.5, emp: !!emp }); if (emp) { flashes.push({ x, y: y - 2, t: 0, max: 0.4 }); bursts.push({ x, y: y - 6, r: 26, t: 0, max: 0.36, small: true }); }
    for (let i = 0; i < 16; i++) parts({ x: x + (Math.random() - 0.5) * 8, y: y - 2, vx: (Math.random() - 0.5) * 40, vy: -50 - Math.random() * 70, life: 0.55, max: 0.55, col: i % 3 ? C : G, size: 1, grav: -10, glow: true }); }
  /* RADIANCE (3 pips): a flat ring of light running out from his feet to the burst's radius, sixteen spokes going off ahead of it, a white flash at the heart */
  function radiance(x, y, r, plus) { bursts.push({ x, y, r, t: 0, max: plus ? 0.62 : 0.5, plus: !!plus }); if (plus) for (let i = 0; i < 10; i++) parts({ x: x + (Math.random() - 0.5) * 18, y: y - 4, vx: (Math.random() - 0.5) * 14, vy: -22 - Math.random() * 30, life: 0.8, max: 0.8, col: i & 1 ? '#8fd160' : W, size: 1, grav: -8, glow: true });   /* RADIANCE+: green motes of the mend lift off him */
    for (let i = 0; i < (plus ? 28 : 18); i++) { const a = i / (plus ? 28 : 18) * 6.283, v = 40 + Math.random() * 50 * (plus ? 1.3 : 1); parts({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5 - 12, life: 0.45, max: 0.45, col: i % 3 ? C : G, size: 1, grav: -4, glow: true }); } }
  /* SUNFALL (5 pips): five heads of light fall out of the sky on him and either side, a streak behind each; where one lands it becomes a column and a ring */
  function sunfall(x, y) { for (let k = -2; k <= 2; k++) falls.push({ x: x + k * 44, y, t: -Math.abs(k) * 0.05, hit: false }); }
  /* VERDICT: light strikes down on one marked foe - a narrow tall column (a third taller than smite's) with a sigil ring flat on the floor */
  function verdict(x, y) { vstrikes.push({ x, y, t: 0, max: 0.55 });
    for (let i = 0; i < 12; i++) parts({ x: x + (Math.random() - 0.5) * 6, y: y - 2, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 80, life: 0.5, max: 0.5, col: i % 3 ? C : G, size: 1, grav: -10, glow: true }); }
  /* THE PERFECT GUARD's HOLY FLASH: a four-point star of light at the aegis (long spokes level and plumb, short ones on the diagonals), a ring running out, a white heart */
  function flash(x, y, dir) { starbursts.push({ x, y, dir, t: 0, max: 0.34 });
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; parts({ x, y, vx: Math.cos(a) * 55, vy: Math.sin(a) * 55, life: 0.3, max: 0.3, col: i & 1 ? W : C, size: 1, grav: 0, glow: true }); } }
  /* VERDICT'S SIGIL, over a marked foe (g: the buffer, x, y: the centre on screen, age: seconds since it was marked, now: the clock): it opens from a point
     (a diamond, a cross in it, a tick at each corner), turns its corner ticks slowly, breathes, and hangs a plumb line of light down to the foe */
  function sigil(g, x, y, age, now, foeY) { const o = Math.min(1, age / 0.16), r = Math.max(1, Math.round(5 * (0.35 + 0.65 * o))), pu = 0.75 + 0.25 * Math.sin(now * 8 + x), sp = Math.floor(now * 3) & 3;
    g.fillStyle = D; for (let i = -r; i <= r; i++) { const h = r - Math.abs(i); g.fillRect(x + i, y - h - 1, 1, 1); g.fillRect(x + i, y + h + 1, 1, 1); }                              /* the dark rim, so it reads on a bright sky */
    g.fillStyle = G; for (let i = -r; i <= r; i++) { const h = r - Math.abs(i); g.fillRect(x + i, y - h, 1, 1); g.fillRect(x + i, y + h, 1, 1); }                                          /* the diamond */
    if (o >= 1) { g.globalAlpha = pu; g.fillStyle = C; g.fillRect(x - 3, y, 7, 1); g.fillRect(x, y - 3, 1, 7); g.fillStyle = W; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.globalAlpha = 1;   /* the cross */
      const T = [[-7, 0], [7, 0], [0, -7], [0, 7]]; g.fillStyle = C; for (let i = 0; i < 4; i++) { const [tx, ty] = T[(i + sp) & 3]; g.fillRect(x + tx, y + ty, 1, 1); }                                      /* the four ticks, going round a quarter at a time */
      if (foeY !== undefined && foeY > y + 8) { g.globalAlpha = 0.45 * pu; g.fillStyle = G; for (let yy = y + r + 3; yy < foeY - 2; yy += 3) g.fillRect(x, yy, 1, 1); g.globalAlpha = 1; } }   /* the plumb line to the foe, a dotted thread */
    else { g.globalAlpha = 1 - o; g.fillStyle = W; g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; }
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 * pu; g.fillStyle = G; g.fillRect(x - r, y - 1, r * 2 + 1, 3); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
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
  /* DAWNFALL (the plunge's landing): a PILLAR OF DAWN - a wide fan of light standing out of the sky on the landing (broad at the foot, a clean tall shaft at the heart), eight rays on the floor, a ring running out to
     the burst's radius and a second behind it, and motes falling down the shaft (not Verdict's narrow gavel-strike) */
  function dawn(x, y, r) { dawns.push({ x, y, r, t: 0, max: 0.78 });
    for (let i = 0; i < 16; i++) parts({ x: x + (Math.random() - 0.5) * 20, y: y - 70 - Math.random() * 20, vx: (Math.random() - 0.5) * 8, vy: 70 + Math.random() * 60, life: 0.5, max: 0.5, col: i % 3 ? C : G, size: 1, grav: 0, glow: true });
    for (let i = 0; i < 10; i++) { const a = Math.PI + i / 9 * Math.PI, v = 50 + Math.random() * 40; parts({ x, y: y - 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.45, life: 0.45, max: 0.45, col: i & 1 ? W : G, size: 1, grav: 30, glow: true }); } }
  /* JUDGED (the Verdict at five pips): the strike is a GOLDEN GAVEL - a broad column with a crown, and a pair of SCALES (a bar, two pans) falling down the column and snapping level on the foe; a ring of eight ticks flat on the floor */
  function judged(x, y) { judges.push({ x, y, t: 0, max: 0.8 });
    for (let i = 0; i < 14; i++) parts({ x: x + (Math.random() - 0.5) * 12, y: y - 2, vx: (Math.random() - 0.5) * 50, vy: -70 - Math.random() * 80, life: 0.55, max: 0.55, col: i % 3 ? C : G, size: 1, grav: -8, glow: true }); }
  /* THE LIGHT-WARD, drawn: an all-round DOME - a faint filled bubble, a bright rim, the far (back) half dotted and dim, three meridian ribs turning slowly, a glint at the crown; brighter for a beat after a blow (k: 0..1) */
  function ward(g, x, y, now, hit) { const pu = 0.5 + 0.5 * Math.sin(now * 8), rx = 17, ry = 19, h = hit || 0;
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(x, y, 3, x, y, ry); gr.addColorStop(0, 'rgba(255,246,200,0.04)'); gr.addColorStop(0.75, 'rgba(255,230,150,' + (0.14 + 0.08 * pu + 0.25 * h) + ')'); gr.addColorStop(1, 'rgba(255,211,107,' + (0.28 + 0.3 * h) + ')');
    g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill();
    g.strokeStyle = G; g.lineWidth = 1; g.globalAlpha = 0.5 + 0.3 * pu + 0.2 * h; g.beginPath(); g.ellipse(x, y, rx + pu * 0.6, ry + pu * 0.6, 0, 0, 7); g.stroke();   /* the rim */
    const rot = now * 0.9;
    for (let m = 0; m < 3; m++) { const ph = rot + m * Math.PI / 3, wx = Math.abs(Math.cos(ph)) * rx, front = Math.cos(ph) > 0;   /* the ribs: each an ellipse of one width, turning; the back-turned half dimmer */
      g.globalAlpha = (front ? 0.4 : 0.2) + 0.15 * h; g.strokeStyle = front ? C : G; g.beginPath(); g.ellipse(x, y, Math.max(1, wx), ry, 0, 0, 7); g.stroke(); }
    g.globalAlpha = 0.35 + 0.25 * pu; g.strokeStyle = W; g.beginPath(); g.ellipse(x, y, rx * 0.98, ry * 0.3, 0, 0, 7); g.stroke();   /* the equator, so it reads round and not flat */
    g.globalAlpha = 0.8 + 0.2 * pu; g.fillStyle = W; g.fillRect(x - 5, y - ry + 3, 2, 1); g.fillRect(x - 6, y - ry + 4, 1, 2);   /* the glint on the crown */
    g.fillStyle = C; for (let i = 0; i < 6; i++) { const a = rot * 1.7 + i * 1.0472; g.globalAlpha = Math.sin(a) < 0 ? 0.35 : 0.9; g.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), 1, 1); }   /* six motes round the equator */
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  /* WARD BROKEN: the dome flares white, its rim cracks into shards that fly out and fall, a ring of dust-bright motes, and a ghost of the rim for a beat */
  function shatter(x, y) { shards.push({ shard: false, x, y, t: 0, max: 0.4 });
    for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + Math.random() * 0.3, v = 55 + Math.random() * 60; shards.push({ shard: true, x: x + Math.cos(a) * 15, y: y + Math.sin(a) * 17, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 25, w: 1 + (i % 3), h: 1 + ((i + 1) % 2) * 2, col: i % 3 === 0 ? W : i % 3 === 1 ? C : G, t: 0, max: 0.55 + Math.random() * 0.25 }); } }
  /* A PIP EARNED ON HIS KNEES: a thin ring of light rises off the floor up the length of him to above his head, where a small cross glints and goes */
  function pray(x, y) { prays.push({ x, y, t: 0, max: 0.65 }); }
  /* THE SPEAR OF LIGHT, drawn: a baked 21 x 5 spear pointing right (white-gold shaft with a dark rim, a leaf head, a fletched tail of light), flipped for the other way; the trail is the shaft's own ghost three times behind */
  function spearSprite() { if (spearFrame) return spearFrame; const c = document.createElement('canvas'); c.width = 23; c.height = 7; const g = c.getContext('2d'); const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    for (let x = 1; x <= 16; x++) { px(x, 2, D); px(x, 4, D); px(x, 3, x & 1 ? G : H); } for (let x = 3; x <= 16; x++) px(x, 3, x > 12 ? C : x & 1 ? C : G);
    for (const [x, ys] of [[17, [2, 3, 4]], [18, [1, 2, 3, 4, 5]], [19, [2, 3, 4]], [20, [3]]]) for (const y of ys) px(x, y, y === 3 ? W : C); px(17, 1, D); px(17, 5, D); px(18, 0, D); px(18, 6, D); px(19, 1, D); px(19, 5, D); px(21, 3, W); px(22, 3, C);
    px(0, 3, C); px(0, 2, G); px(0, 4, G); px(1, 1, G); px(1, 5, G); return (spearFrame = c); }
  function spear(g, x, y, d, age) { const sp = spearSprite(); g.save(); g.translate(x, y); if (d < 0) g.scale(-1, 1);
    for (let k = 3; k >= 1; k--) { g.globalAlpha = 0.34 - k * 0.08; g.drawImage(sp, -21 - k * 8, -3); }   /* the shaft's ghosts behind it */
    g.globalAlpha = 0.4; g.fillStyle = G; g.fillRect(-46, 0, 26, 1); g.globalAlpha = 0.18; g.fillRect(-46, -1, 26, 3);   /* the light it trails */
    g.globalAlpha = 1; g.drawImage(sp, -21, -3);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7 + 0.3 * Math.sin(age * 40); g.fillStyle = W; g.fillRect(-3, -1, 3, 3); g.globalCompositeOperation = 'source-over'; g.restore(); g.globalAlpha = 1; B(g, x + d * 1, y, 12, 0.4, 'gold'); }
  function update(dt) { for (const f of flashes) f.t += dt; flashes = flashes.filter(f => f.t < f.max); for (const c of columns) c.t += dt; columns = columns.filter(c => c.t < c.max);
    for (const b of bursts) b.t += dt; bursts = bursts.filter(b => b.t < b.max); for (const v of vstrikes) v.t += dt; vstrikes = vstrikes.filter(v => v.t < v.max); for (const s of starbursts) s.t += dt; starbursts = starbursts.filter(s => s.t < s.max);
    for (const f of falls) { f.t += dt; if (f.t >= 0.2 && !f.hit) { f.hit = true; columns.push({ x: f.x, y: f.y, t: 0, max: 0.55 }); flashes.push({ x: f.x, y: f.y - 2, t: 0, max: 0.35 }); for (let i = 0; i < 8; i++) parts({ x: f.x + (Math.random() - 0.5) * 8, y: f.y - 2, vx: (Math.random() - 0.5) * 50, vy: -40 - Math.random() * 60, life: 0.5, max: 0.5, col: i % 3 ? C : G, size: 1, grav: 10, glow: true }); } }
    falls = falls.filter(f => f.t < 0.6);
    for (const v of dawns) v.t += dt; dawns = dawns.filter(v => v.t < v.max); for (const v of judges) v.t += dt; judges = judges.filter(v => v.t < v.max); for (const v of prays) v.t += dt; prays = prays.filter(v => v.t < v.max);
    for (const s of shards) { s.t += dt; if (s.shard) { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 150 * dt; s.vx *= 0.97; } } shards = shards.filter(s => s.t < s.max); }
  function draw(g, cx, cy) {
    for (const c of columns) { const k = c.t / c.max, a = 1 - k, x = Math.round(c.x - cx), y = Math.round(c.y - cy), em = c.emp ? 1 : 0, w = Math.max(2, Math.round((7 + 3 * em) * (1 - k * 0.6))), h = Math.round((46 + 14 * em) * Math.min(1, c.t / 0.08));
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.45 * a; g.fillStyle = G; g.fillRect(x - Math.ceil(w / 2) - 1, y - h, w + 2, h);                    /* the edge */
      g.globalAlpha = 0.9 * a; g.fillStyle = C; g.fillRect(x - Math.floor(w / 2), y - h, w, h);                             /* the body of it */
      g.globalAlpha = a; g.fillStyle = W; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 2), y - h, Math.max(1, w - 4), h);   /* the white core */
      g.globalAlpha = 0.6 * a; g.fillStyle = G; g.beginPath(); g.ellipse(x, y - 1, 6 + 20 * k, 2 + 3 * k, 0, 0, 7); g.fill();   /* the flash on the floor */
      g.globalAlpha = a; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 4 + 26 * k, 1.5 + 4 * k, 0, 0, 7); g.stroke();
      if (em) { g.globalAlpha = 0.8 * a; g.fillStyle = W; g.fillRect(x - 4 - Math.round(k * 3), y - h, 1, h); g.fillRect(x + 4 + Math.round(k * 3), y - h, 1, h); g.fillRect(x - 6, y - h - 1, 13, 1); g.fillStyle = C; g.fillRect(x - 3, y - h - 3, 7, 1); g.fillRect(x - 1, y - h - 5, 3, 1);   /* TWIN SMITE: two edges of white standing off the column and a crown on it */
        g.globalAlpha = 0.9 * a; g.strokeStyle = C; g.beginPath(); g.ellipse(x, y - 1, 3 + 30 * k, 1 + 5 * k, 0, 0, 7); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 20, 22 + 6 * em, 0.35 * a + 0.1 * em, 'gold'); }
    for (const f of falls) { if (f.t < 0 || f.hit) continue; const u = f.t / 0.2, x = Math.round(f.x - cx), yb = Math.round(f.y - cy), yh = Math.round(yb - 130 * (1 - u * u)), len = 28;   /* the head of it falls (quickening), a streak standing behind it */
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.fillStyle = G; g.fillRect(x - 1, yh - len, 3, len); g.globalAlpha = 0.9; g.fillStyle = C; g.fillRect(x, yh - len, 1, len); g.globalAlpha = 1; g.fillStyle = W; g.fillRect(x - 1, yh - 3, 3, 4);
      g.globalCompositeOperation = 'source-over'; B(g, x, yh, 12, 0.45, 'gold'); }
    for (const b of bursts) { const k = b.t / b.max, a = 1 - k, x = Math.round(b.x - cx), y = Math.round(b.y - cy), r = b.r * (0.15 + 0.85 * Math.sqrt(k));
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = G; g.globalAlpha = 0.5 * a; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y + 6, r, r * 0.4, 0, 0, 7); g.stroke();
      g.strokeStyle = W; g.globalAlpha = a; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + 6, r, r * 0.4, 0, 0, 7); g.stroke();
      g.fillStyle = C; for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283, r0 = r * 0.55, r1 = r * 0.95; if (r1 - r0 < 2) continue; g.globalAlpha = a * 0.8; for (let rr = r0; rr < r1; rr += 3) g.fillRect(Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr * 0.8), 1, 1); }
      g.globalAlpha = a * 0.7; g.fillStyle = W; g.beginPath(); g.arc(x, y, 8 * (1 - k) + 2, 0, 7); g.fill();
      if (b.plus) { g.globalAlpha = a * 0.28; g.fillStyle = G; g.beginPath(); g.ellipse(x, y + 6, r, r * 0.4, 0, 0, 7); g.fill();   /* RADIANCE+: the whole disc lit, a second ring close behind the first, a halo standing over him, and a green ring of the mend */
        const r2 = r * 0.82 * Math.min(1, k * 1.6); g.globalAlpha = a * 0.9; g.strokeStyle = C; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y + 6, r2, r2 * 0.4, 0, 0, 7); g.stroke();
        g.globalAlpha = a; g.strokeStyle = W; g.beginPath(); g.ellipse(x, y - 14 - 6 * k, 8, 2.4, 0, 0, 7); g.stroke(); g.strokeStyle = G; g.beginPath(); g.ellipse(x, y - 13 - 6 * k, 9, 2.8, 0, 0, 7); g.stroke();
        g.globalAlpha = a * 0.8; g.strokeStyle = '#8fd160'; g.beginPath(); g.ellipse(x, y - 4, 10 + 6 * k, 14 + 6 * k, 0, 0, 7); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y, r * 0.8, 0.35 * a + (b.plus ? 0.15 * a : 0), 'gold'); }
    for (const v of vstrikes) { const k = v.t / v.max, a = 1 - k * k, x = Math.round(v.x - cx), y = Math.round(v.y - cy), h = Math.round(120 * Math.min(1, v.t / 0.06)), w = Math.max(3, Math.round(7 * (1 - k * 0.5)));
      g.globalAlpha = 0.8 * a; g.fillStyle = '#e8a82c'; g.fillRect(x - Math.ceil(w / 2) - 2, y - h, w + 4, h); g.globalAlpha = 0.9 * a; g.fillStyle = G; g.fillRect(x - Math.ceil(w / 2) - 1, y - h, w + 2, h);   /* (the golden body in plain colour so it stays gold over a night sky) */
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.85 * a; g.fillStyle = C; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 1), y - h, Math.max(1, w - 2), h); g.globalAlpha = a; g.fillStyle = W; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 2), y - h, Math.max(1, w - 4), h);
      g.globalAlpha = 0.7 * a; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 3 + 15 * k, 1 + 4 * k, 0, 0, 7); g.stroke();   /* the sigil's ring, flat on the floor */
      g.globalAlpha = 0.5 * a; g.strokeStyle = G; g.beginPath(); g.ellipse(x, y - 1, 2 + 9 * k, 1 + 2.5 * k, 0, 0, 7); g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 24, 20, 0.35 * a, 'gold'); }
    for (const s of starbursts) { const k = s.t / s.max, a = 1 - k, x = Math.round(s.x - cx), y = Math.round(s.y - cy), L = Math.round(5 + 11 * Math.sqrt(k)), Ld = Math.round(3 + 5 * Math.sqrt(k));
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.fillStyle = C; g.fillRect(x - L, y, L * 2 + 1, 1); g.fillRect(x, y - L, 1, L * 2 + 1);                    /* the long spokes */
      g.globalAlpha = a * 0.8; g.fillStyle = G; for (let i = 1; i <= Ld; i++) { g.fillRect(x - i, y - i, 1, 1); g.fillRect(x + i, y - i, 1, 1); g.fillRect(x - i, y + i, 1, 1); g.fillRect(x + i, y + i, 1, 1); }   /* the diagonals */
      g.globalAlpha = a; g.fillStyle = W; g.fillRect(x - 1, y - 1, 3, 3); g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5);
      g.strokeStyle = W; g.globalAlpha = a * 0.8; g.beginPath(); g.arc(x, y, 3 + 14 * k, 0, 7); g.stroke();
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y, 16, 0.6 * a, 'gold'); }
    for (const v of dawns) { const k = v.t / v.max, a = 1 - k * k, x = Math.round(v.x - cx), y = Math.round(v.y - cy), grow = Math.min(1, v.t / 0.07), h = Math.round(110 * grow), w0 = Math.max(4, Math.round(13 * (1 - k * 0.5))), w1 = Math.max(2, Math.round(7 * (1 - k * 0.5)));
      g.globalCompositeOperation = 'lighter';
      for (let j = 0; j < h; j += 2) { const u = j / 110, w = Math.round(w0 + (w1 - w0) * u * 0.8 + 3 * Math.max(0, 1 - u * 6)), yy = y - j;   /* broad at the foot, a clean shaft above */
        g.globalAlpha = 0.28 * a * (1 - u * 0.5); g.fillStyle = G; g.fillRect(x - Math.ceil(w / 2) - 2, yy - 1, w + 4, 2);
        g.globalAlpha = 0.75 * a * (1 - u * 0.4); g.fillStyle = C; g.fillRect(x - Math.floor(w / 2), yy - 1, w, 2);
        g.globalAlpha = a * (1 - u * 0.3); g.fillStyle = W; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 3), yy - 1, Math.max(1, w - 6), 2); }
      for (let i = 0; i < 8; i++) { const an = i / 7 * Math.PI; const ux = Math.cos(an) * v.r * (0.35 + 0.65 * Math.min(1, v.t / 0.2)); g.globalAlpha = 0.6 * a; g.fillStyle = i & 1 ? C : G; for (let t = 0.25; t <= 1; t += 0.15) g.fillRect(Math.round(x + ux * t), y - 1 - Math.round(Math.abs(Math.sin(an)) * 3 * t), 1, 1); }   /* the rays flat on the floor, left to right */
      g.globalAlpha = 0.6 * a; g.fillStyle = G; g.beginPath(); g.ellipse(x, y - 1, v.r * (0.3 + 0.7 * Math.min(1, v.t / 0.22)), 4, 0, 0, 7); g.fill();
      g.globalAlpha = a; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 4 + v.r * Math.min(1, v.t / 0.3), 1.5 + 4 * Math.min(1, v.t / 0.3), 0, 0, 7); g.stroke();
      if (v.t > 0.12) { const k2 = Math.min(1, (v.t - 0.12) / 0.4); g.globalAlpha = a * 0.6; g.strokeStyle = G; g.beginPath(); g.ellipse(x, y - 1, 2 + v.r * 1.15 * k2, 1 + 5 * k2, 0, 0, 7); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 30, 30, 0.4 * a, 'gold'); }
    for (const v of judges) { const k = v.t / v.max, a = 1 - k * k, x = Math.round(v.x - cx), y = Math.round(v.y - cy), h = Math.round(140 * Math.min(1, v.t / 0.06)), w = Math.max(5, Math.round(11 * (1 - k * 0.5)));
      g.globalAlpha = 0.85 * a; g.fillStyle = '#e8a82c'; g.fillRect(x - Math.ceil(w / 2) - 2, y - h, w + 4, h); g.globalAlpha = 0.95 * a; g.fillStyle = G; g.fillRect(x - Math.ceil(w / 2) - 1, y - h, w + 2, h);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.9 * a; g.fillStyle = C; g.fillRect(x - Math.floor(w / 2) + 1, y - h, Math.max(1, w - 2), h); g.globalAlpha = a; g.fillStyle = W; g.fillRect(x - Math.max(0, Math.floor(w / 2) - 2), y - h, Math.max(1, w - 4), h);
      for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283 + k * 0.6; g.globalAlpha = a * 0.9; g.fillStyle = i & 1 ? W : G; g.fillRect(Math.round(x + Math.cos(an) * (6 + 22 * k)), Math.round(y - 1 + Math.sin(an) * (1.6 + 5 * k)), 2, 1); }   /* the ring of eight ticks, going round */
      g.globalAlpha = 0.7 * a; g.strokeStyle = W; g.beginPath(); g.ellipse(x, y - 1, 4 + 20 * k, 1.5 + 5 * k, 0, 0, 7); g.stroke();
      g.globalCompositeOperation = 'source-over';
      { const fall = Math.min(1, v.t / 0.14), sy = Math.round(y - 96 + 78 * fall * fall), tilt = fall < 1 ? Math.round((1 - fall) * 3) * (Math.floor(v.t * 40) & 1 ? 1 : -1) : 0, al = Math.min(1, a * 1.4);   /* THE SCALES fall down the column and snap level on him */
        g.globalAlpha = al; g.fillStyle = D; g.fillRect(x - 10, sy - 1 + tilt, 21, 3); g.fillRect(x - 1, sy - 6, 3, 6); g.fillStyle = G; g.fillRect(x - 10, sy + tilt, 21, 1); g.fillStyle = W; g.fillRect(x, sy - 6, 1, 6); g.fillRect(x - 1, sy - 7, 3, 1);
        for (const sx of [-10, 10]) { const py = sy + 5 + (sx < 0 ? tilt : -tilt); g.fillStyle = C; g.fillRect(x + sx, sy + 1 + tilt * (sx < 0 ? 1 : -1), 1, py - sy - 1 - tilt * (sx < 0 ? 1 : -1)); g.fillStyle = D; g.fillRect(x + sx - 4, py, 9, 3); g.fillStyle = G; g.fillRect(x + sx - 4, py, 9, 1); g.fillStyle = C; g.fillRect(x + sx - 3, py + 1, 7, 1); } }
      g.globalAlpha = 1; B(g, x, y - 28, 26, 0.4 * a, 'gold'); }
    for (const s of shards) { const k = s.t / s.max;
      if (!s.shard) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy), a = 1 - k; g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 17 + 5 * k, 19 + 5 * k, 0, 0, 7); g.stroke();   /* the rim, flaring white as it goes */
        g.globalAlpha = a * 0.6; g.strokeStyle = G; for (let i = 0; i < 5; i++) { const an = i * 1.3 + 0.4; g.beginPath(); g.moveTo(x + Math.cos(an) * 6, y + Math.sin(an) * 7); g.lineTo(x + Math.cos(an + 0.2) * 17, y + Math.sin(an + 0.2) * 19); g.stroke(); }   /* the cracks */
        g.globalAlpha = a * 0.5; g.fillStyle = C; g.beginPath(); g.ellipse(x, y, 16, 18, 0, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y, 22, 0.5 * a, 'gold'); }
      else { g.globalAlpha = 1 - k * k; g.fillStyle = D; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) + 1, s.w + 1, s.h); g.fillStyle = s.col; g.fillRect(Math.round(s.x - cx), Math.round(s.y - cy), s.w, s.h); g.globalAlpha = 1; } }
    for (const v of prays) { const k = v.t / v.max, a = 1 - k, x = Math.round(v.x - cx), y = Math.round(v.y - cy), ry = Math.round(30 * k);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = a * 0.9; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - ry, 8, 2, 0, 0, 7); g.stroke(); g.globalAlpha = a * 0.5; g.strokeStyle = G; g.beginPath(); g.ellipse(x, y - ry + 2, 7, 1.6, 0, 0, 7); g.stroke();   /* the ring climbing him */
      if (k > 0.55) { const u = (k - 0.55) / 0.45; g.globalAlpha = (1 - u); g.fillStyle = W; g.fillRect(x, y - 36 - Math.round(u * 4), 1, 5); g.fillRect(x - 2, y - 34 - Math.round(u * 4), 5, 1); g.fillStyle = G; g.fillRect(x - 1, y - 33 - Math.round(u * 4), 3, 1); }   /* the cross glinting over his head */
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y - 12, 12, 0.3 * a, 'gold'); }
    for (const f of flashes) { const k = f.t / f.max, x = Math.round(f.x - cx), y = Math.round(f.y - cy);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.strokeStyle = W; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 3 + 11 * k, 0, 7); g.stroke();
      g.globalAlpha = 0.6 * (1 - k); g.fillStyle = C; g.fillRect(x - 1, y - 1, 3, 3); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; B(g, x, y, 14, 0.5 * (1 - k), 'gold'); } }
  const clear = () => { dawns = []; judges = []; shards = []; prays = []; flashes = []; columns = []; bursts = []; falls = []; vstrikes = []; starbursts = []; };
  return { hammer, wave, smite, catchAt, windup, update, draw, clear, radiance, sunfall, verdict, flash, sigil, dawn, judged, ward, shatter, pray, spear };
}
