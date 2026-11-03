/* src/transitions-art.js - THE PICTURES OF THE TRANSITION SYSTEM (claude/transwm, ART PASS claude/transwmart).
   ART ONLY: the timing, the flow and the save are src/transitions.js and main.js's; nothing here changes them.
   Both ends match their levels: the Wood end is the LUMBER TRAIL's kit (bark, cut pine, needle greens, rope, the felled-log pile and stump from src/redraw/lumber_trail_art.js);
   the Marsh end is MARSH WOOD 2/3's (bog oak, lashed reed cord, bound reed stands, moss and its cold marsh light and pale moon, src/redraw/marsh2_art.js + marsh3_art.js).
   drawFerryScene: the whole screen, scene 'ferry', at scene time s: a jetty of bog-oak piles and rope over a Wood bank (stump, log pile), the Marsh ferry (lashed bog-oak logs,
     plank deck, reed-bundle prow, lantern), the ferryman poling (plant, push, lift, with a ring where the pole bites and a wake), a painted pine treeline receding and the Marsh's
     stilt huts, reed stands and cold lights arriving, three parallax reed layers, a heron on a snag, dragonflies, two mist layers, a warm-to-cool grade and a light shaft.
   drawArrivalFerry: the ferry the Marsh begins on, in WORLD space (moored: post, rope, lantern). drawWayGate: the Wood's east gate in WORLD space (rails that fall, a header that stays).
   drawBars: the letterbox with a film-edge line. Everything static is baked ONCE (per viewport size) and blitted; the per-frame work is a few drawImage calls, a handful of 1 px
   rects and two or three gradients. Every loop is bounded and hashed, never random. No dialogue: this file never writes text. */
import { FERRY, sceneScroll, heroOnScene, ferryX, ROAD, roadScroll, roadGrowth, roadHero, SMOKE, smokeHero, smokeRise, smokeGlow } from './transitions.js';
import { canvas, outline } from './px.js';
import { BARK, CUT, NEEDLE, logPileSprite, drawStump } from './redraw/lumber_trail_art.js';
import { OAK, BOARD, CORD, CORD_D } from './redraw/marsh2_art.js';

const OUT = '#1b1626';
const RDS = ['#1d3320', '#2f4a26', '#3f6a30', '#4a7a3a', '#5a8a4a', '#7fb24e', '#8fd160'];   /* the Marsh's reed greens (marsh3_art): dark -> lit */
const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h, fn, line = true) => { const [c, g] = canvas(w, h); fn(g); return line ? outline(c, OUT) : c; };

export function drawBars(g, VW, VH, bar) {
  if (bar <= 0.5) return; const b = Math.round(bar);
  g.fillStyle = '#05040a'; g.fillRect(0, 0, VW, b); g.fillRect(0, VH - b, VW, b);
  g.fillStyle = 'rgba(214,200,160,0.20)'; g.fillRect(0, b, VW, 1); g.fillRect(0, VH - b - 1, VW, 1);   /* the film edge: a soft 1 px line where the bar ends */
  g.fillStyle = 'rgba(5,4,10,0.35)'; g.fillRect(0, b + 1, VW, 1); g.fillRect(0, VH - b - 2, VW, 1);
}

/* ------------------------------------------------------------------ baked pieces */
/* a painted pine for the far treeline: tiers of needles, the sunlit side left, a few autumn tips (the Lumber Trail's gold) */
function pine(g, x, base, h, hi, mid, lo, autumn) {
  const w = Math.max(9, Math.round(h * 0.46)), n = Math.max(3, Math.round(h / 10));
  R(g, BARK[1], x, base - 5, 2, 5);
  for (let t = 0; t < n; t++) {
    const top = base - h + Math.round(t * (h - 8) / n * 0.8), rows = Math.round(h / n * 1.2), tw = Math.round(w * (0.38 + 0.62 * (t + 1) / n));
    for (let r = 0; r < rows; r++) {
      const hw = Math.max(1, Math.round(tw / 2 * (r + 1) / rows)), y = top + r;
      R(g, mid, x - hw, y, hw * 2 + 1, 1); R(g, hi, x - hw, y, Math.max(1, Math.round(hw * 0.9)), 1);
      if (r === rows - 1) R(g, lo, x - hw, y, hw * 2 + 1, 1);
      if (autumn && r % 3 === 1 && hash(x + t * 7 + r) > 0.7) P(g, hash(x + r) > 0.5 ? '#d9a63a' : '#d9782a', x - hw + 1 + Math.floor(hash(x * 3 + r) * hw), y);
    }
  }
}
function fogOver(g, w, h, rgba) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = rgba; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
/* THE WOOD'S TREELINE: two rows of pines, the back row hazier; recedes left through the ride */
const pineStrip = () => once('pines', () => mk(760, 78, g => {
  for (let i = 0; i < 40; i++) { const x = 4 + i * 19 + Math.round(hash(i) * 8), h = 34 + Math.round(hash(i + 3) * 24); pine(g, x, 75, h, NEEDLE[3], NEEDLE[2], NEEDLE[1], i % 3 === 0); }
  fogOver(g, 760, 78, 'rgba(206,214,184,0.42)');
  for (let i = 0; i < 28; i++) { const x = 12 + i * 27 + Math.round(hash(i + 50) * 10), h = 30 + Math.round(hash(i + 60) * 22); pine(g, x, 77, h, NEEDLE[3], NEEDLE[2], NEEDLE[1], i % 4 === 0); }
  fogOver(g, 760, 78, 'rgba(206,214,184,0.14)');
}, false));
/* THE MARSH, FAR: reed spires, bound reed stands, stilt huts with thatch and a lit lamp, a pole with a lantern, in cool haze */
const marshStrip = () => once('marsh', () => mk(700, 70, g => {
  const hut = (x, y) => {
    R(g, OAK[2], x + 1, y + 8, 1, 9); R(g, OAK[2], x + 12, y + 8, 1, 9); R(g, OAK[1], x + 6, y + 10, 1, 7);
    R(g, BOARD[1], x, y + 3, 14, 6); R(g, BOARD[3], x, y + 3, 14, 1); R(g, BOARD[0], x, y + 8, 14, 1); R(g, '#ffd36b', x + 9, y + 5, 2, 2); R(g, '#7a5a30', x + 3, y + 4, 3, 5);
    for (let r = 0; r < 5; r++) R(g, r % 2 ? '#8a7a48' : '#a89860', x - 2 + r, y + 2 - r, 18 - r * 2, 1);   /* thatch */
    R(g, '#6a5a34', x - 2, y + 3, 18, 1); R(g, BOARD[2], x + 14, y + 8, 5, 1); R(g, OAK[2], x + 17, y + 8, 1, 8);   /* a landing board */
  };
  for (let i = 0; i < 70; i++) { const x = 6 + i * 9 + Math.round(hash(i + 90) * 6), hh = 8 + Math.round(hash(i + 40) * 11);
    R(g, RDS[2], x, 66 - hh, 1, hh); R(g, RDS[3], x + 1, 66 - hh + 3, 1, hh - 3); P(g, RDS[1], x - 1, 66 - hh + 2); if (hash(i + 7) > 0.55) { R(g, '#6b4a2c', x, 66 - hh - 3, 2, 4); P(g, CUT[0], x, 66 - hh - 4); } }
  for (const [x, y] of [[40, 46], [190, 44], [330, 47], [470, 45], [600, 46]]) hut(x, y);
  for (const x of [150, 405, 545]) { R(g, OAK[2], x, 42, 1, 26); R(g, OAK[3], x, 42, 4, 1); R(g, OAK[0], x + 3, 42, 1, 3); R(g, '#ffd36b', x + 2, 45, 2, 3); }
  fogOver(g, 700, 70, 'rgba(172,192,178,0.46)');
}, false));
/* THE NEST'S MARSH EDGE, far (the nest ferry's left bank): dead pines standing in the reeds with grey paper nests hung in them, a few old live pines behind, a ragged reed bed, a sunk fence line - cool haze */
const nestEdge = () => once('nestEdge', () => mk(760, 78, g => {
  for (let i = 0; i < 9; i++) { const x = 20 + i * 86 + Math.round(hash(i + 70) * 30), h = 34 + Math.round(hash(i + 71) * 22); pine(g, x, 73, h, NEEDLE[2], NEEDLE[1], NEEDLE[0], false); }
  fogOver(g, 760, 78, 'rgba(182,196,176,0.55)');
  for (let i = 0; i < 100; i++) { const x = 2 + i * 7 + Math.round(hash(i + 190) * 5), hh = 8 + Math.round(hash(i + 140) * 13);
    R(g, RDS[1 + (i % 3 === 0 ? 1 : 0)], x, 73 - hh, 1, hh); R(g, RDS[3], x + 1, 73 - hh + 3, 1, hh - 3); if (hash(i + 17) > 0.7) { R(g, '#6b4a2c', x, 73 - hh - 3, 2, 4); P(g, CUT[0], x, 73 - hh - 4); } }
  for (const [x, h, nest] of [[70, 52, 1], [190, 44, 0], [330, 56, 1], [468, 48, 1], [590, 42, 0], [700, 54, 1]]) { deadPine(g, x, 74, h); if (nest) paperNest(g, x + 6, 74 - h + 9, 1); }
  for (let x = 20; x < 740; x += 11) { if (hash(x) > 0.45) { R(g, '#3a3026', x, 70 - (x % 3), 2, 6 + (x % 3)); P(g, '#8a8070', x, 70 - (x % 3)); } }   /* the sunk fence line */
  fogOver(g, 760, 78, 'rgba(172,192,178,0.34)');
}, false));
/* a bound reed stand for the mid/near layers: stems in the Marsh's greens, a cord band, bulrush blades fanning out, cattail heads */
function reedSprite(h, seed, bright) {
  return once('reed' + h + '_' + seed + '_' + bright, () => {
    const W = 26; return mk(W, h + 6, g => {
      const lo = bright ? 3 : 1, base = h + 5;
      for (let k = 0; k < 8; k++) {
        const hh = Math.round(h * (0.55 + hash(seed * 11 + k) * 0.45)), x = 3 + k * 3 + Math.round(hash(seed + k * 5) * 2), lean = k < 3 ? -1 : k > 4 ? 1 : 0;
        for (let y = 0; y < hh; y++) { const sx = x + (y > hh * 0.62 ? lean : 0) + (y > hh * 0.88 ? lean : 0); P(g, RDS[lo + ((y + k) & 1)], sx, base - y); }
        if (k % 3 === 1) { const hx = x + lean * 2; R(g, '#5a3a22', hx, base - hh - 5, 2, 6); P(g, '#2a1a10', hx, base - hh - 6); P(g, CUT[0], hx, base - hh - 7); P(g, RDS[lo], hx, base - hh + 1); }
      }
      for (let b = 0; b < 4; b++) { const dir = b < 2 ? -1 : 1, by = base - 8 - b * 3; for (let i = 0; i < 9; i++) P(g, RDS[lo + (b & 1) + 1], 13 + dir * (3 + i), by - Math.round(i * 0.6) - (i > 6 ? 1 : 0)); }
      R(g, CORD, 7, base - 7, 12, 1); R(g, CORD_D, 7, base - 6, 12, 1); P(g, CORD, 19, base - 6); P(g, CORD, 19, base - 4);
      R(g, RDS[0], 6, base - 2, 14, 3); P(g, RDS[1], 4, base); P(g, RDS[1], 22, base - 1);
    });
  });
}
/* a lamp's soft halo and the marsh light (cold teardrop flame: white heart, green skirt) */
const halo = (r, rgb) => once('halo' + r + rgb, () => { const [c, g] = canvas(r * 2, r * 2), gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, 'rgba(' + rgb + ',0.55)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.18)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c; });
const marshLight = () => once('mlight', () => mk(9, 12, g => {
  R(g, '#4a9a6e', 3, 6, 3, 4); R(g, '#8fd1a0', 2, 4, 5, 5); R(g, '#8fd1a0', 3, 2, 3, 3); P(g, '#8fd1a0', 4, 1); R(g, '#e8fff0', 3, 4, 3, 4); P(g, '#ffffff', 4, 5); P(g, '#4a9a6e', 4, 10); P(g, '#2f6e50', 5, 11);
}, false));
const moonSprite = () => once('moon', () => mk(18, 18, g => {
  const c = 9; for (let y = 0; y < 18; y++) for (let x = 0; x < 18; x++) { const d = Math.hypot(x - c + 0.5, y - c + 0.5); if (d < 8) P(g, d > 6.6 ? '#c8d4de' : '#e4ecf2', x, y); }
  for (const [x, y] of [[6, 6], [11, 8], [8, 12], [12, 12]]) { P(g, '#b4c2cf', x, y); P(g, '#b4c2cf', x + 1, y); }
}, false));
/* a heron on a snag: grey-blue back, pale belly, a long S neck, a yellow bill; the snag is bog oak */
const heronSprite = () => once('heron', () => mk(24, 40, g => {
  R(g, OAK[2], 10, 26, 3, 14); R(g, OAK[4], 10, 26, 1, 14); R(g, OAK[1], 12, 26, 1, 14); R(g, OAK[3], 4, 28, 7, 2); R(g, OAK[3], 2, 26, 3, 2); R(g, OAK[3], 13, 33, 6, 2); R(g, OAK[3], 18, 31, 2, 3);   /* the snag */
  R(g, '#3a3a30', 10, 21, 1, 6); R(g, '#3a3a30', 13, 21, 1, 6);                                                  /* legs */
  R(g, '#7e909e', 8, 12, 8, 9); R(g, '#9fb0bc', 8, 12, 5, 4); R(g, '#d8e0e2', 9, 17, 5, 4); R(g, '#5a6a78', 14, 14, 3, 5);   /* body, wing */
  R(g, '#7e909e', 6, 10, 2, 4); R(g, '#9fb0bc', 5, 6, 2, 5); R(g, '#7e909e', 4, 3, 2, 4); R(g, '#d8e0e2', 4, 1, 4, 3);       /* neck, head */
  P(g, '#1b1626', 5, 2); R(g, '#d8b040', 1, 3, 3, 1); R(g, '#1b1626', 7, 1, 4, 1); P(g, '#1b1626', 11, 2);          /* bill, eye, crest plume */
}));
/* two soft mist bands, tileable (a puff is drawn at x and x +- the width so the edge wraps) */
const MISTW = 384;
const mistBand = k => once('mist' + k, () => mk(MISTW, 40, g => {
  for (let i = 0; i < 16; i++) {
    const x = Math.round(hash(i + k * 20) * MISTW), y = 20 + Math.round((hash(i + 5 + k * 20) - 0.5) * 12), rx = 30 + hash(i + 9 + k * 20) * 40, ry = 6 + hash(i + 13 + k * 20) * 8;
    for (const o of [-MISTW, 0, MISTW]) { const gr = g.createRadialGradient(x + o, y, 0, x + o, y, rx); gr.addColorStop(0, 'rgba(236,242,230,0.55)'); gr.addColorStop(1, 'rgba(236,242,230,0)'); g.save(); g.translate(0, y); g.scale(1, ry / rx); g.translate(0, -y); g.fillStyle = gr; g.fillRect(x + o - rx, y - rx, rx * 2, rx * 2); g.restore(); }
  }
}, false));

/* the viewport-sized layers: sky A (the Wood's gold morning) and B (the Marsh's cool grey-green), water A and B, the sun glow, the light shaft */
let LAY = null;
function layers(VW, VH, wl) {
  if (LAY && LAY.VW === VW && LAY.VH === VH) return LAY;
  const sky = (a, b) => { const [c, g] = canvas(VW, wl), gr = g.createLinearGradient(0, 0, 0, wl); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, VW, wl); return c; };
  const wat = (a, b, s) => { const [c, g] = canvas(VW, VH - wl + 3), gr = g.createLinearGradient(0, 0, 0, VH - wl + 3); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, VW, VH - wl + 3);
    const sr = g.createLinearGradient(0, 0, 0, 16); sr.addColorStop(0, s); sr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sr; g.fillRect(0, 0, VW, 16); return c; };
  const skyA = sky('#a8c4b2', '#f2e2b4'), gA = skyA.getContext('2d'), sun = gA.createRadialGradient(VW * 0.22, wl - 6, 0, VW * 0.22, wl - 6, VW * 0.5); sun.addColorStop(0, 'rgba(255,236,170,0.55)'); sun.addColorStop(1, 'rgba(255,236,170,0)'); gA.fillStyle = sun; gA.fillRect(0, 0, VW, wl);
  const shaft = (() => { const [c, g] = canvas(VW, VH); for (let i = 0; i < 3; i++) { const x0 = VW * (0.04 + i * 0.17), gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, 'rgba(255,238,184,0.20)'); gr.addColorStop(1, 'rgba(255,238,184,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 18 + i * 6, 0); g.lineTo(x0 + 120 + i * 20, VH); g.lineTo(x0 + 62 + i * 10, VH); g.closePath(); g.fill(); } return c; })();
  LAY = { VW, VH, skyA, skyB: sky('#768a9e', '#acc0b2'), skyN: sky('#8d9a8c', '#d9d2b0'), watA: wat('#6e908a', '#2c4a46', 'rgba(242,226,180,0.30)'), watB: wat('#587a64', '#233a2c', 'rgba(172,192,178,0.30)'), shaft };
  return LAY;
}
/* THE HORNETS' PAPER NEST: a grey papery teardrop in shaved bands, a dark mouth at the foot, hung by a thread; s scales it (1 = 11 x 15 px) */
function paperNest(g, x, y, s) {
  const w = 11 * s, h = 15 * s;
  for (let r = 0; r < h; r++) { const hw = Math.round(Math.sin(Math.min(1, (r + 1.5) / (h * 0.75)) * Math.PI * 0.5) * (w / 2) * (r > h * 0.8 ? 1 - (r - h * 0.8) / (h * 0.2) * 0.55 : 1)), band = (r >> 1) & 1;
    R(g, band ? '#8e8878' : '#b8b2a0', x - hw, y + r, hw * 2 + 1, 1); R(g, '#d6d0be', x - hw, y + r, Math.max(1, hw >> 1), 1); R(g, '#6e6a5c', x + hw - 1, y + r, 1, 1); }
  R(g, '#2a2420', x - s, y + h - 2, 2 * s + 1, 2); R(g, '#6e6a5c', x, y - 3, 1, 3);
}
/* a dead pine: a grey snag with broken branches, bark peeling in pale strips (the nest's old pines, standing in the marsh edge) */
function deadPine(g, x, base, h) {
  R(g, '#241d16', x, base - h, 5, h); R(g, '#574a3a', x + 1, base - h, 3, h); R(g, '#8a8070', x + 1, base - h, 1, h); R(g, '#3a3026', x + 4, base - h, 1, h);
  for (let i = 0; i < 5; i++) { const by = base - h + 6 + i * 9, dir = i & 1 ? 1 : -1, l = 8 + (i * 5) % 9; for (let k = 0; k < l; k++) { P(g, '#3a3026', dir > 0 ? x + 5 + k : x - 1 - k, by - Math.round(k * 0.35)); P(g, '#574a3a', dir > 0 ? x + 5 + k : x - 1 - k, by - Math.round(k * 0.35) - 1); } }
  for (let i = 0; i < 6; i++) P(g, '#c9c2ac', x + 1 + (i & 1), base - h + 8 + i * 6);
}

let JET = null;   /* the jetty + the Wood's bank, in GROUND coordinates (screen x = gx - ground); gx runs from -40 to jx1; JT is the plank top (sprite row 34) */
function jetty(VW, bank = 'wood') {
  if (JET && JET.VW === VW && JET.bank === bank) return JET;
  const jx1 = Math.round(VW * FERRY.dockAt) + 6, W = jx1 + 44, H = 130;
  const spr = mk(W, H, g => {
    const gx = x => x + 40, JT = 34;
    /* the Wood's bank: autumn grass over bark-brown earth, roots, ferns, an undercut lip over the water */
    const bx1 = gx(46), nestB = bank === 'nest';
    if (nestB) {   /* the nest's marsh edge: dark peat under a lip of sedge and moss, wet at the foot */
      R(g, '#2b261e', 0, JT, bx1, H); R(g, '#463e30', 0, JT + 3, bx1 - 4, 14); R(g, '#5a5040', 2, JT + 4, 6, 3); R(g, '#16130f', 0, JT + 18, bx1 - 8, H); R(g, '#3a4a3a', 0, JT + 12, bx1 - 6, 2);
      for (let x = 0; x < bx1; x++) { const dy = (x > bx1 - 7 ? Math.round((x - (bx1 - 7)) * 0.7) : 0); R(g, '#34442a', x, JT - 1 + dy, 1, 5); R(g, '#5a7040', x, JT - 1 + dy, 1, 2); if (hash(x) > 0.5) P(g, '#8a9a5a', x, JT - 2 + dy); if (hash(x + 3) > 0.92) P(g, '#c4b872', x, JT - 3 + dy); }
      for (const x of [14, 36, 54]) { R(g, '#2b261e', gx(x - 40), JT + 5, 2, 8); R(g, '#463e30', gx(x - 40) + 2, JT + 11, 7, 2); }   /* sunk roots */
    } else {
    R(g, '#463624', 0, JT, bx1, H); R(g, '#6a5238', 0, JT + 3, bx1 - 4, 14); R(g, '#80664a', 2, JT + 4, 6, 3); R(g, '#2e1c0f', 0, JT + 18, bx1 - 8, H);
    for (let x = 0; x < bx1; x++) { const dy = (x > bx1 - 7 ? Math.round((x - (bx1 - 7)) * 0.7) : 0); R(g, '#4e6a28', x, JT - 1 + dy, 1, 5); R(g, '#7a9a3a', x, JT - 1 + dy, 1, 2); if (hash(x) > 0.55) P(g, '#a8c050', x, JT - 2 + dy); if (hash(x + 3) > 0.9) P(g, '#d9a63a', x, JT - 2 + dy); }
    for (const x of [10, 30, 58]) { R(g, BARK[2], gx(x - 40), JT + 4, 2, 9); R(g, BARK[3], gx(x - 40) + 2, JT + 11, 7, 2); R(g, BARK[1], gx(x - 40) + 8, JT + 12, 4, 2); P(g, BARK[4], gx(x - 40), JT + 4); }   /* roots gripping the bank */
    for (const x of [-34, -3, 32]) for (let b = 0; b < 5; b++) for (let i = 0; i < 7; i++) P(g, NEEDLE[(b + 3) % 3 + 2], gx(x) + (b - 2) * 2 + Math.round((b - 2) * i * 0.3), JT - 1 - i - (b % 2));   /* fern fronds */
    }
    if (bank === 'wood') {
    g.drawImage(logPileSprite(), gx(-38), JT - 34);                       /* the woodsmen's log pile (the Lumber Trail's own) */
    drawStump(g, gx(12), JT + 1, 1);                                      /* and a stump */
    R(g, BARK[1], gx(12) - 4, JT - 21, 3, 7); R(g, '#8a929a', gx(12) - 6, JT - 24, 5, 4); R(g, '#c4ccd4', gx(12) - 6, JT - 24, 5, 1);   /* an axe left in it */
    } else {   /* THE NEST'S BANK (art lane): peat and sedge, a dead pine with a hornet's paper nest hung in it, the old stump, a smoke pot still smouldering, a scrap of grey nest paper */
      drawStump(g, gx(12), JT + 1, 1);
      for (const [x, s] of [[-34, 1], [-14, 2], [40, 3]]) { const sp = reedSprite(16 + s * 3, s, false); g.drawImage(sp, gx(x) - 13, JT + 1 - sp.height + 1); }                        /* sedge + cattails along the lip */
      deadPine(g, gx(-28), JT + 1, 52); paperNest(g, gx(-28) + 5, JT - 30, 1);
      R(g, '#3a3026', gx(-12), JT - 8, 9, 8); R(g, '#5a4a36', gx(-12), JT - 8, 9, 2); R(g, '#1b1626', gx(-9), JT - 11, 3, 3); R(g, '#9aa0a6', gx(-10), JT - 17, 2, 6); R(g, '#c9ced0', gx(-8), JT - 21, 2, 4);   /* the pot, and its curl */
      R(g, '#b8b2a0', gx(2), JT - 3, 8, 3); R(g, '#8e8878', gx(4), JT - 5, 5, 2); R(g, '#d6d0be', gx(3), JT - 3, 3, 1);   /* a scrap of nest paper */
    }
    /* the jetty: bog-oak piles (lit left), a plank deck, rope lashings, a sagging rope rail, reed bundles */
    const x0 = gx(24), x1 = jx1 + 40;
    for (let x = x0 + 10; x <= x1 - 2; x += 30) { R(g, OAK[1], x - 1, JT - 9, 5, 34); R(g, OAK[3], x, JT - 9, 3, 34); R(g, OAK[4], x, JT - 9, 1, 34); R(g, CORD, x - 1, JT - 7, 5, 1); R(g, CORD_D, x - 1, JT - 6, 5, 1); R(g, CORD, x - 1, JT + 6, 5, 1); R(g, CORD_D, x - 1, JT + 7, 5, 1); P(g, OAK[5], x, JT - 10); }
    for (let x = x0 + 10; x + 30 <= x1 - 2; x += 30) { for (let i = 0; i <= 30; i++) P(g, i % 7 === 3 ? CORD_D : CORD, x + 1 + i, JT - 6 + Math.round(Math.sin(i / 30 * Math.PI) * 3)); }
    R(g, OAK[2], x0, JT + 3, x1 - x0, 2); R(g, OAK[1], x0, JT + 5, x1 - x0, 1);                    /* the stringer under the boards */
    R(g, BOARD[1], x0, JT, x1 - x0, 4); R(g, BOARD[3], x0, JT, x1 - x0, 2); R(g, BOARD[4], x0, JT, x1 - x0, 1); R(g, BOARD[0], x0, JT + 3, x1 - x0, 1);
    for (let x = x0 + 5; x < x1; x += 9) { R(g, BOARD[0], x, JT, 1, 3); P(g, '#2a2f36', x + 3, JT + 1); }   /* the joints and the nails */
    for (const x of [x0 + 26, x0 + 74]) { for (let i = 0; i < 5; i++) { for (let y = 0; y < 8 - Math.abs(i - 2) * 2; y++) P(g, RDS[2 + ((y + i) & 1)], x + i, JT - 10 - y); } R(g, CORD, x, JT - 11, 5, 1); }   /* reed bundles lashed at the rail */
    /* the lantern gallows near the end, and the mooring post (thick, a coil of cord, the line's end) */
    const lg = x1 - 38; R(g, OAK[2], lg, JT - 26, 3, 27); R(g, OAK[4], lg, JT - 26, 1, 27); R(g, OAK[3], lg, JT - 26, 11, 2); R(g, OAK[1], lg + 8, JT - 26, 2, 5); R(g, '#1b1626', lg + 7, JT - 20, 4, 1); R(g, '#ffd36b', lg + 7, JT - 19, 4, 4); R(g, '#fff2b0', lg + 8, JT - 18, 2, 2); R(g, '#1b1626', lg + 7, JT - 15, 4, 1);
    const mp = jx1 + 40 - 2; R(g, OAK[1], mp - 1, JT - 16, 6, 22); R(g, OAK[3], mp, JT - 16, 4, 22); R(g, OAK[4], mp, JT - 16, 1, 22); for (let i = 0; i < 4; i++) { R(g, CORD, mp - 1, JT - 14 + i * 2, 6, 1); R(g, CORD_D, mp - 1, JT - 13 + i * 2, 6, 1); } P(g, OAK[5], mp + 1, JT - 17);
  });
  JET = { VW, bank, jx1, spr, JT: 34, lanternAt: [jx1 + 40 - 38 + 9, 34 - 18] };
  return JET;
}
/* THE MARSH FERRY (w wide deck): two lashed bog-oak logs with pale round ends, a plank deck, cord lashings, reed-bundle prow and stern, posts, a coil, a barrel.
   The sprite's deck top is at row DK; the sprite starts 8 px left of the stern. */
const DK = 12;
const ferrySprite = w => once('ferry' + w, () => mk(w + 18, 30, g => {
  const x0 = 9, d = DK;
  R(g, OAK[1], x0 + 3, d + 14, w - 6, 2);                                                               /* keel shadow */
  R(g, OAK[2], x0, d + 4, w, 10); R(g, OAK[3], x0 + 1, d + 5, w - 2, 3); R(g, OAK[4], x0 + 2, d + 5, w - 4, 1); R(g, OAK[1], x0, d + 11, w, 3); R(g, OAK[0], x0 + 2, d + 13, w - 4, 1);
  for (let k = 0; k < 14; k++) { const x = x0 + 3 + Math.round(hash(k + 70) * (w - 8)); P(g, OAK[1], x, d + 6 + (k % 3)); P(g, OAK[1], x + 1, d + 6 + (k % 3)); }   /* bark nicks and knots */
  R(g, '#d8cc84', x0 + w, d + 4, 2, 9); R(g, '#ece4ac', x0 + w, d + 5, 1, 3); R(g, '#8a8440', x0 + w + 1, d + 8, 1, 5);   /* the bow's pale round log-end */
  R(g, '#d8cc84', x0 - 2, d + 4, 2, 9); R(g, '#ece4ac', x0 - 2, d + 5, 1, 3); R(g, '#8a8440', x0 - 2, d + 8, 1, 5);
  R(g, OAK[3], x0 + w - 6, d + 1, 7, 4); R(g, OAK[4], x0 + w - 6, d + 1, 7, 1); R(g, OAK[3], x0 - 4, d + 1, 6, 4); R(g, OAK[4], x0 - 4, d + 1, 6, 1);   /* stem and stern rise */
  R(g, BOARD[1], x0, d, w, 5); R(g, BOARD[3], x0, d, w, 2); R(g, BOARD[4], x0, d, w, 1); R(g, BOARD[0], x0, d + 4, w, 1);   /* the plank deck */
  for (let x = x0 + 7; x < x0 + w - 2; x += 7 + (Math.round(x) % 3)) { R(g, BOARD[0], x, d, 1, 4); P(g, '#2a2f36', x + 3, d + 2); }
  for (const xl of [10, 31, 54, w - 14]) { R(g, CORD, x0 + xl, d, 3, 14); R(g, CORD_D, x0 + xl + 2, d, 1, 14); for (let i = 0; i < 4; i++) P(g, CORD_D, x0 + xl + (i & 1), d + 1 + i * 3); }   /* the lashings */
  for (let i = 0; i < 6; i++) { const hh = 11 - (i >> 1) * 2 - (i & 1); for (let y = 0; y < hh; y++) P(g, RDS[2 + ((y + i) & 1)], x0 + w - 1 + i - (y > 6 ? 0 : 0) + (y > 8 ? 1 : 0), d + 1 - y); }   /* the reed-bundle prow */
  R(g, CORD, x0 + w - 2, d - 3, 8, 1); R(g, CORD_D, x0 + w - 2, d - 2, 8, 1);
  for (let i = 0; i < 4; i++) { const hh = 7 - i; for (let y = 0; y < hh; y++) P(g, RDS[2 + ((y + i) & 1)], x0 - 5 + i, d + 1 - y); }   /* and the stern's */
  R(g, OAK[3], x0 + 3, d - 8, 3, 9); R(g, OAK[4], x0 + 3, d - 8, 1, 9); R(g, OAK[3], x0 + 2, d - 8, 5, 1); P(g, OAK[3], x0 + 2, d - 9); P(g, OAK[3], x0 + 6, d - 9);   /* the stern's pole fork */
  R(g, OAK[3], x0 + w - 11, d - 12, 3, 13); R(g, OAK[4], x0 + w - 11, d - 12, 1, 13); R(g, OAK[3], x0 + w - 11, d - 12, 8, 2); R(g, OAK[1], x0 + w - 4, d - 12, 1, 4); P(g, '#aab0b8', x0 + w - 4, d - 8);   /* the bow post and its lantern hook */
  for (let i = 0; i < 3; i++) R(g, i % 2 ? CORD_D : CORD, x0 + 9 + i, d - 1 - i, 8 - i * 2, 1);              /* a rope coil on the deck */
  R(g, OAK[2], x0 + 66, d - 5, 6, 5); R(g, OAK[4], x0 + 66, d - 5, 1, 5); R(g, '#5a6068', x0 + 66, d - 4, 6, 1); R(g, '#5a6068', x0 + 66, d - 1, 6, 1); R(g, '#1c120a', x0 + 67, d - 5, 4, 1);   /* a bailing barrel */
}));
/* the world's sliding things: a bark-and-needle pole */

/* ------------------------------------------------------------------ the dragonflies (back + front) and rings */
function dragonfly(g, x, y, time, k) {
  const f = ((time * 18 + k * 3) | 0) & 1, bx = Math.round(x), by = Math.round(y);
  R(g, '#2f8f9a', bx - 2, by, 5, 1); P(g, '#9ae0e8', bx + 2, by); R(g, '#c8f0f4', bx - 1, by - 1 - f, 2, 1); R(g, '#c8f0f4', bx - 1, by + 1 + f, 2, 1);
}
function ring(g, x, y, age) {
  if (age < 0 || age > 1.4) return; const r = 2 + age * 13, a = (1 - age / 1.4) * 0.55;
  g.strokeStyle = 'rgba(232,242,236,' + a.toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(Math.round(x) + 0.5, Math.round(y) + 0.5, r, r * 0.28, 0, 0, 6.2832); g.stroke();
}

/* THE FERRY SCENE. env: { g, VW, VH, time, n (heroes), drawHero(i, x, y, face, key, frame), drawFerryman(x, y, face, frame), reduce, alpha } */
export function drawFerryScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, calm = !!reduce;
  const wl = Math.round(VH * 0.62), scroll = sceneScroll(s, calm), P_ = FERRY.parallax, sway = calm ? 0 : Math.sin(time * 1.6) * 1.2;
  const prog = clamp01((s - FERRY.poleAt) / 8), kk = smooth((s - FERRY.poleAt - 0.8) / 6.4);   /* the crossing: 0 at the push-off, 1 at the Marsh; kk is the Wood->Marsh grade */
  const L = layers(VW, VH, wl), J = jetty(VW, env.bank || 'wood'), nest = env.bank === 'nest', leftFar = nest ? nestEdge : pineStrip;
  /* SKY: the Wood's gold morning, grading to the Marsh's cool grey-green; the sun low left, a pale day-moon rising right (the Marsh's night piece), a light shaft that fades out */
  g.drawImage(nest ? L.skyN : L.skyA, 0, 0); if (kk > 0.01) { g.globalAlpha = kk; g.drawImage(L.skyB, 0, 0); g.globalAlpha = 1; }
  if (kk > 0.25) { g.globalAlpha = smooth((kk - 0.25) / 0.6) * 0.7; g.drawImage(moonSprite(), Math.round(VW * 0.8), Math.round(VH * 0.13)); g.globalAlpha = 1; }
  /* FAR: the Wood's painted treeline recedes left; the Marsh's huts, stands and lamps arrive from the right */
  const far = scroll * P_.far, pineX = -Math.round(far), marshX = Math.round(VW + 30 - far);
  g.drawImage(leftFar(), pineX, wl - 78 + 3);
  g.drawImage(marshStrip(), marshX, wl - 70 + 3);
  /* the water, graded the same way; the treeline reflected under the far shore, trembling */
  g.drawImage(L.watA, 0, wl - 3); if (kk > 0.01) { g.globalAlpha = kk; g.drawImage(L.watB, 0, wl - 3); g.globalAlpha = 1; }
  g.save(); g.globalAlpha = 0.16; g.translate(0, wl * 2 - 1); g.scale(1, -0.28); g.translate(0, -wl); g.drawImage(leftFar(), pineX, wl - 78 + 3); g.drawImage(marshStrip(), marshX, wl - 70 + 3); g.restore();
  /* ripples drifting with the world: pale glints and a few dark lines */
  for (let i = 0; i < 18; i++) {
    const y = wl + 2 + i * 5 + (i % 2), x = ((hash(i + 9) * VW * 1.6 - scroll * (0.5 + i * 0.05) - (calm ? 0 : time * (4 + i % 3))) % (VW + 40) + VW + 40) % (VW + 40) - 20;
    g.fillStyle = i % 4 === 3 ? 'rgba(20,34,30,0.22)' : 'rgba(236,244,230,' + (0.16 + (i % 3) * 0.05).toFixed(2) + ')'; g.fillRect(Math.round(x), y, 12 + (i % 4) * 7, 1);
  }
  /* MID: reed stands along the channel's far side (parallax 0.8), the heron on its snag, dragonflies hovering */
  const mid = scroll * P_.mid;
  for (let i = 0; i < 22; i++) { const px = i * 31 + 14 - mid + (i % 3) * 6; if (px < -30 || px > VW + 30) continue; const sp = reedSprite(22 + (i % 3) * 5, i % 4, false), bx = Math.round(px - 13), sw = Math.round(sway * 0.8), top = Math.floor(sp.height * 0.5);
    g.drawImage(sp, 0, 0, sp.width, top, bx + sw, wl - 3 - sp.height + 7, sp.width, top); g.drawImage(sp, 0, top, sp.width, sp.height - top, bx, wl - 3 - sp.height + 7 + top, sp.width, sp.height - top); }
  { const hx = Math.round(VW + 70 - mid * 1.0); if (hx > -30 && hx < VW + 30) { const hs = heronSprite(); g.drawImage(hs, hx, wl - 3 - 33); } }
  /* THE JETTY and the Wood's bank (parallax 1: the ground the ferry leaves) */
  const ground = scroll, jxs = Math.round(-40 - ground), jt = wl + 4, jy = jt - 34;
  if (jxs + J.spr.width > -4) g.drawImage(J.spr, jxs, jy);
  /* lantern glow on the gallows: a slow warm flicker (the Lumber Trail's gold) */
  { const lx = jxs + J.lanternAt[0] + 1, ly = jy + J.lanternAt[1] + 1; if (lx > -30 && lx < VW + 30) { g.globalAlpha = 0.85 + (calm ? 0 : Math.sin(time * 7) * 0.12 + Math.sin(time * 11.3) * 0.06); g.drawImage(halo(18, '255,214,120'), lx - 18, ly - 18); g.globalAlpha = 1; } }
  /* THE FERRY: she does not move on the screen (the world slides under her); she rocks, and the line to the mooring post drops when the ferryman poles off */
  const fx = Math.round(ferryX(VW)), fy = jt + 2, bob = calm ? 0 : Math.round(Math.sin(time * 2.2) * 0.7 + (s > FERRY.poleAt ? Math.sin(time * 3.1) * 0.4 : 0));
  const fsp = ferrySprite(FERRY.deckW);
  g.drawImage(fsp, fx - 9, fy + bob - DK);
  if (s < FERRY.poleAt + 0.35) {   /* the bow line to the post: taut, then it drops into the water */
    const px0 = Math.round(jxs + J.jx1 + 40 - 2 + 1), drop = clamp01((s - FERRY.poleAt) / 0.35), ax = fx + 3, ay = fy + bob - 6;
    for (let i = 0; i <= 12; i++) { const t = i / 12; P(g, i % 3 === 2 ? CORD_D : CORD, Math.round(px0 + (ax - px0) * t), Math.round(jt - 12 + (ay - jt + 12) * t + Math.sin(t * Math.PI) * (2 + drop * 12))); }
  }
  /* the foam at her hull: small broken dashes along the waterline, a bow wave and a wake once she is moving */
  { const wy = fy + bob + 9, moving = scroll > 0 ? Math.min(1, scroll / 14) : 0;
    g.fillStyle = 'rgba(236,244,236,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(fx - 4 + i * 17 + ((time * 8 | 0) + i) % 3, wy + (i & 1), 7, 1);
    if (moving > 0) {
      for (let i = 0; i < 5; i++) { const f = (time * 1.4 + i * 0.2) % 1; g.fillStyle = 'rgba(236,246,240,' + ((1 - f) * 0.75 * moving).toFixed(3) + ')'; g.fillRect(fx + FERRY.deckW + 3 + Math.round(f * 9), wy - ((i + 1) >> 1) + (i & 1) * 2, 4 - (f > 0.6 ? 1 : 0), 1); }
      for (let i = 0; i < 8; i++) { const f = (time * 1.1 + i * 0.125) % 1; g.fillStyle = 'rgba(' + (i & 1 ? '190,226,230' : '236,246,240') + ',' + ((1 - f) * 0.65 * moving).toFixed(3) + ')'; g.fillRect(fx - 6 - Math.round(f * 56), wy + 1 + (i % 3) * 2, 6 - Math.round(f * 3), 1); }
    } }
  /* the lantern at the bow post */
  { const lx = fx + FERRY.deckW - 4, ly = fy + bob - 6; g.fillStyle = OUT; g.fillRect(lx - 1, ly - 1, 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(lx, ly, 2, 3); g.fillStyle = '#fff2b0'; g.fillRect(lx, ly, 1, 1);
    g.globalAlpha = 0.8 + (calm ? 0 : Math.sin(time * 6.2) * 0.12); g.drawImage(halo(14, '255,214,120'), lx - 13, ly - 12); g.globalAlpha = 1; }
  /* THE FERRYMAN poling: plant -> push -> lift -> swing back, 2.4 s a cycle, the pole's tip held still in the world (so it slides aft along her as she goes), a ring where it bites */
  const fmx = fx + 80, T = 2.4, going = s >= FERRY.poleAt - 0.2, ps = Math.max(0, s - FERRY.poleAt), cyc = Math.floor(ps / T), u = (ps - cyc * T) / T;
  let tipX = -8, tipY = -4, lean = 0, frame = 0;
  if (!going) { tipX = -6; tipY = 15; }   /* waiting, the pole standing in the water at the jetty */
  else if (calm) { tipX = -16; tipY = 16; }
  else if (u < 0.14) { const k = u / 0.14; tipX = -8; tipY = -4 + k * 20; }              /* plant: the tip drops to the bottom */
  else if (u < 0.72) { const k = (u - 0.14) / 0.58; tipX = -8 - k * 28; tipY = 16; lean = k < 0.7 ? -1 : 0; frame = 1; }   /* push: the boat goes on, the tip stays, he leans into it */
  else if (u < 0.86) { const k = (u - 0.72) / 0.14; tipX = -36 + k * 4; tipY = 16 - k * 22; frame = 1; }   /* lift: the pole comes out, dripping */
  else { const k = (u - 0.86) / 0.14; tipX = -32 + k * 24; tipY = -6 - Math.sin(k * Math.PI) * 6; }   /* swing back, held up in the air */
  env.drawFerryman(fmx + lean, fy + bob, -1, frame);
  { const hx = fmx - 4 + lean, hy = fy + bob - 8, tx = fmx + tipX, ty = fy + bob + tipY, ex = hx + (hx - tx) * 0.3, ey = hy + (hy - ty) * 0.3;
    g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.moveTo(Math.round(tx) + 0.5, Math.round(ty) + 0.5); g.lineTo(Math.round(ex) + 0.5, Math.round(ey) + 0.5); g.stroke();
    g.strokeStyle = OAK[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(tx) + 0.5, Math.round(ty) + 0.5); g.lineTo(Math.round(ex) + 0.5, Math.round(ey) + 0.5); g.stroke();
    P(g, CORD, Math.round(hx + (ex - hx) * 0.45), Math.round(hy + (ey - hy) * 0.45));
    if (tipY > 8 && tipY < 20 && going) { g.fillStyle = 'rgba(236,244,236,0.55)'; g.fillRect(Math.round(tx) - 2, Math.round(ty) - 1, 5, 1); }
    if (u > 0.72 && u < 0.86 && !calm) { P(g, 'rgba(236,244,236,0.9)', Math.round(tx), Math.round(ty) + 3 + ((u - 0.72) * 90 | 0) % 5); } }
  if (going && !calm) { for (let c2 = Math.max(0, cyc - 1); c2 <= cyc; c2++) { const t0 = FERRY.poleAt + c2 * T + 0.14 * T, ageT = s - t0; if (ageT < 0) continue; const slid = scroll - sceneScroll(t0, false); ring(g, fmx - 8 - slid, fy + bob + 16, ageT); } }
  /* THE HEROES: they walk in over the bank and the jetty and step aboard, then stand - every seat, its own skin */
  for (let i = 0; i < n; i++) {
    const h = heroOnScene(i, n, s, VW);
    const onJetty = h.x < fx - 2, yy = onJetty ? jt - 1 : fy + bob, hop = !h.aboard && h.x > fx - 14 && h.x < fx + 4 ? -3 : 0;   /* a hop over the gap at the gunwale */
    env.drawHero(i, h.x, yy + hop, 1, h.walking ? 'run' : 'idle', h.walking ? Math.floor(time * 12) : Math.floor(time * 4.5));
  }
  /* the Marsh's cold lights over the water ahead (they come up as the Marsh arrives); dragonflies over the reeds */
  if (kk > 0.3) { const ka = smooth((kk - 0.3) / 0.5);
    for (let i = 0; i < 3; i++) { const lx = Math.round(VW + 30 + 120 + i * 105 - far * 1.25), ly = Math.round(wl + 8 + i * 6 + (calm ? 0 : Math.sin(time * 1.7 + i * 2) * 2)); if (lx < -12 || lx > VW + 12) continue;
      g.globalAlpha = ka * 0.7; g.drawImage(halo(12, '143,209,160'), lx - 12, ly - 8); g.globalAlpha = ka; g.drawImage(marshLight(), lx - 4, ly - 6);
      g.globalAlpha = ka * 0.25; g.fillStyle = '#8fd1a0'; g.fillRect(lx - 2, ly + 8, 5, 1); g.fillRect(lx - 4, ly + 11, 9, 1); g.globalAlpha = 1; } }
  if (!calm) for (let i = 0; i < 3; i++) { const dx = ((i * 137 + 60 - scroll * (0.9 + i * 0.1) + Math.sin(time * 0.9 + i) * 24) % (VW + 60) + VW + 60) % (VW + 60) - 30; dragonfly(g, dx, wl - 8 - i * 7 + Math.sin(time * 2.3 + i * 2) * 3, time, i); }
  /* NEAR: big reeds in front (parallax 1.25), sliding past and over the bow: they are what says "moving" */
  const near = scroll * P_.near;
  for (let i = 0; i < 9; i++) {
    const px = ((i * 71 + 30 - near) % (VW + 90) + VW + 90) % (VW + 90) - 30; if (s < FERRY.poleAt + 0.5 && i < 4) continue;
    const sp = reedSprite(34 + (i % 3) * 8, 4 + (i % 4), true), top = Math.floor(sp.height * 0.45), bx = Math.round(px - 13), by = VH + 3 - sp.height + (i % 2) * 3, sw = Math.round(sway * 1.6);
    g.drawImage(sp, 0, 0, sp.width, top, bx + sw, by, sp.width, top); g.drawImage(sp, 0, top, sp.width, sp.height - top, bx, by + top, sp.width, sp.height - top);
  }
  /* MIST: two bands drifting over the water, thickening to the end, then the grade (warm -> cool) and the closing veil */
  { const ma = (0.30 + 0.38 * prog) * (calm ? 0.8 : 1), my0 = wl - 24, drift = scroll * 0.6 + (calm ? 0 : time * 5);
    for (let b = 0; b < 2; b++) { const mb = mistBand(b), off = Math.round((drift * (b ? 1.4 : 0.8)) % MISTW), my = my0 + b * 20; g.globalAlpha = ma * (b ? 0.8 : 1);
      for (let x = -off; x < VW; x += MISTW) g.drawImage(mb, x, my); }
    g.globalAlpha = 1; }
  if (kk < 0.99) { g.globalAlpha = (1 - kk) * (nest ? 0.35 : 0.9); g.drawImage(L.shaft, 0, 0); g.globalAlpha = 1; }
  g.fillStyle = 'rgba(255,214,140,' + ((1 - kk) * (nest ? 0.02 : 0.07)).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
  g.fillStyle = 'rgba(140,172,190,' + (kk * 0.14).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
  if (prog > 0.6) { g.fillStyle = 'rgba(214,226,214,' + (((prog - 0.6) / 0.4) * 0.36).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
  /* the scene's own fade in at the start (out of the dark the walk left on) */
  const a = s < 0.45 ? 1 - s / 0.45 : 0; if (a > 0) { g.fillStyle = 'rgba(8,6,14,' + (a * a).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
}

/* THE ARRIVAL FERRY, in the Marsh's world: moored at the bank's west end (a post with its coil and line, a lantern, a reed bundle), the heroes stand on her at the start, then walk off.
   cx/cy: the camera. floorY: the bank's top (px). */
export function drawArrivalFerry(env, cx, cy, floorY, time, mooredAt) {
  const { g, reduce } = env, bob = reduce ? 0 : Math.round(Math.sin(time * 2.2) * 0.6), W = 84, x = -28 - cx, y = floorY - cy;
  if (x > env.VW + 10 || x < -160) return;
  g.drawImage(ferrySprite(W), Math.round(x) - 9, y + bob - DK);
  /* the bow line to the mooring post, slack, and the post (the same bog oak as the jetty at the Wood end) */
  const px0 = Math.round(66 - cx), by = y;
  R(g, OAK[1], px0 - 1, by - 15, 6, 17); R(g, OAK[3], px0, by - 15, 4, 17); R(g, OAK[4], px0, by - 15, 1, 17); for (let i = 0; i < 3; i++) { R(g, CORD, px0 - 1, by - 13 + i * 2, 6, 1); R(g, CORD_D, px0 - 1, by - 12 + i * 2, 6, 1); }
  for (let i = 0; i <= 14; i++) { const t = i / 14, ax = Math.round(x) + W - 2, ay = y + bob - 7; P(g, i % 3 === 2 ? CORD_D : CORD, Math.round(ax + (px0 + 2 - ax) * t), Math.round(ay + (by - 12 - ay) * t + Math.sin(t * Math.PI) * 3)); }
  const lx = Math.round(x) + W - 4, ly = y + bob - 6; g.fillStyle = OUT; g.fillRect(lx - 1, ly - 1, 4, 5); g.fillStyle = '#ffd36b'; g.fillRect(lx, ly, 2, 3); g.fillStyle = '#fff2b0'; g.fillRect(lx, ly, 1, 1);
  g.globalAlpha = 0.75 + (reduce ? 0 : Math.sin(time * 6.2) * 0.12); g.drawImage(halo(14, '255,214,120'), lx - 13, ly - 12); g.globalAlpha = 1;
  env.drawFerryman(Math.round(x + 8), y + bob, 1, 0);
}

/* THE WOOD'S EAST GATE, in WORLD space (the clearing's last column): from the start of the open beat it is a lashed pine gate (five rails, two posts, a brace, a rope and iron strap) over the
   tiles; at tOpen 0.25 s it gives way: the rails fall one after another and settle, the posts topple across the path (what the hero hops), the header beam stays with its rope ends swinging, and
   the way beyond is lit - a warm spill of morning along the floor. o: { col, rows: [r0, r1] }; t: seconds since the open beat began; opened: the tiles are already air. */
/* THE GATE'S LOOK per open.kind (claude/demotransitions): pine = the Lumber Trail's lashed pine; bog = the Marsh's bog-oak palisade with reed cord; palisade = the goblins' weathered wall; leaf = Underleaf's living hedge-gate;
   light = no wall at all (the arena just ends): only the spill of light beyond is drawn. GREYBOX-PLUS: recoloured rails, the art lane draws each its own. */
const GATE_PAL = {
  pine: { bark: BARK, cut: CUT, cord: CORD, cordD: CORD_D },
  bog: { bark: [OAK[0], OAK[1], OAK[2], OAK[3], OAK[4], OAK[5]], cut: ['#d4dcc4', '#b2bea4', '#8e9e86', '#6a7a64', '#4a5a46'], cord: CORD, cordD: CORD_D, reed: [RDS[0], RDS[2], RDS[3], '#9a9a52', '#c4b872'] },   /* the Marsh's bog oak, and bundled reed stems green -> dry straw */
  palisade: { bark: ['#14110d', '#241d16', '#3a3026', '#574a3a', '#76674f', '#968565'], cut: ['#d8cfae', '#b8ab82', '#8e7f58', '#665a3c', '#463c28'], cord: '#9a8a60', cordD: '#6e6040' },
  leaf: { bark: ['#16200e', '#25361a', '#38541f', '#4f7a2a', '#6d9c3a', '#94c254'], cut: ['#ecf4bc', '#cfdc8a', '#aab864', '#7f9040', '#58682c'], cord: '#d9c58a', cordD: '#a08c58' },
};
const RAILS = 5;
/* one rail (len x 13) in the gate's look. pine: the lashed pine log. palisade: a panel of sharpened-log stakes side by side. bog: a bundle of reed stems with cord wraps. leaf: living hedge (leaf clumps, a few flowers + berries). */
function gateRail(g, len, lit, pal, kind) {
  if (kind === 'palisade') {
    for (let x = 0; x < len; x += 5) {
      const w = Math.min(4, len - x), tone = hash(x * 0.7 + len) > 0.6 ? 2 : 3;
      R(g, pal.bark[0], x, 0, w + 1, 13); R(g, pal.bark[tone], x + 1, 1, Math.max(1, w - 1), 11); R(g, pal.bark[5], x + 1, 1, 1, 11); R(g, pal.bark[1], x + w - 1, 1, 1, 11);
      if (hash(x + 4) > 0.7) P(g, pal.bark[1], x + 2, 4 + Math.round(hash(x) * 5));
    }
    R(g, pal.cord, 0, 3, len, 1); R(g, pal.cordD, 0, 4, len, 1); R(g, pal.cord, 0, 9, len, 1); R(g, pal.cordD, 0, 10, len, 1);   /* the two rope bands */
    return;
  }
  if (kind === 'bog') {
    R(g, pal.reed[0], 0, 0, len, 13);
    for (let x = 0; x < len; x++) { const tone = 1 + ((x * 7 + (x >> 2)) % 4 === 0 ? 2 : (x & 1)), y0 = hash(x + len) > 0.8 ? 1 : 0, y1 = 13 - (hash(x + 9) > 0.85 ? 1 : 0); R(g, pal.reed[tone], x, y0, 1, y1 - y0); if (x % 3 === 0) P(g, pal.reed[4], x, 1 + (x % 4)); }
    for (let x = 4; x < len - 2; x += 11) { R(g, pal.cord, x, 0, 2, 13); R(g, pal.cordD, x + 2, 0, 1, 13); P(g, pal.cord, x - 1, 6); P(g, pal.cord, x + 3, 7); }   /* cord lashings, a loose end each */
    R(g, pal.reed[0], 0, 12, len, 1);
    return;
  }
  if (kind === 'leaf') {
    R(g, pal.bark[1], 1, 1, len - 2, 11);
    for (let y = 0; y < 13; y++) for (let x = 0; x < len; x++) {
      const hh = hash(x * 3.1 + y * 17.3 + len);
      if ((y === 0 || y === 12) && hh > 0.45) continue; if ((x === 0 || x === len - 1) && hh > 0.5) continue;
      const tone = Math.min(5, (hh * 6 | 0) % 4 + 1 + (y < 5 ? 1 : 0)); P(g, pal.bark[tone], x, y);
    }
    for (let k = 0; k < 6; k++) { const x = 1 + Math.floor(hash(k + len * 0.3) * (len - 3)), y = 1 + Math.floor(hash(k * 2 + 1) * 10); R(g, pal.bark[5], x, y, 2, 1); P(g, pal.cut[0], x, y - 1); }   /* sunlit leaf tips */
    for (let k = 0; k < 4; k++) { const x = 2 + Math.floor(hash(k + 40 + len) * (len - 5)), y = 2 + Math.floor(hash(k + 50) * 8); if (k % 2) { P(g, '#fff6d8', x, y); P(g, '#f0c850', x + 1, y); } else { P(g, '#d0584a', x, y); P(g, '#8c2c2a', x, y + 1); } }   /* a few flowers + haws */
    return;
  }
  R(g, pal.bark[0], 0, 0, len, 13); R(g, pal.bark[3], 1, 1, len - 2, 5); R(g, pal.bark[5], 1, 1, len - 2, 1); R(g, pal.bark[2], 1, 6, len - 2, 5); R(g, pal.bark[1], 1, 10, len - 2, 2);
  R(g, pal.cut[1], 0, 2, 2, 9); R(g, pal.cut[3], 0, 5, 2, 1); R(g, pal.cut[1], len - 2, 2, 2, 9); R(g, pal.cut[3], len - 2, 5, 2, 1);
  for (let k = 0; k < 3; k++) P(g, pal.bark[1], 4 + Math.round(hash(k + len) * (len - 9)), 3 + (k & 1) * 3);
  if (lit) R(g, pal.cord, 5, 0, 2, 13);
}
/* a gate post (6 wide) at x,y of height h, in the gate's look: palisade = a sharpened tip; bog = bundled reeds with a frayed head and cord; leaf = a hedge-wrapped post with leaves and a flower; pine = the squared pine */
function gatePost(g, pal, kind, x, y, h) {
  if (kind === 'bog') {
    R(g, pal.reed[0], x, y, 6, h); for (let i = 0; i < 6; i++) R(g, pal.reed[1 + (i & 1) + (i === 2 ? 1 : 0)], x + i, y + 1, 1, h - 1); R(g, pal.reed[4], x + 1, y + 1, 1, h - 1);
    for (let j = 6; j < h - 4; j += 12) { R(g, pal.cord, x, y + j, 6, 1); R(g, pal.cordD, x, y + j + 1, 6, 1); }
    for (let i = 0; i < 6; i++) { P(g, pal.reed[2 + (i & 1)], x + i, y - 1 - (i % 3)); P(g, pal.reed[1], x + i, y - 3 - (i % 2)); } P(g, pal.reed[4], x + 1, y - 4); P(g, pal.reed[4], x + 4, y - 3);
    return;
  }
  if (kind === 'leaf') {
    R(g, pal.bark[0], x, y, 6, h); R(g, pal.bark[2], x + 1, y, 4, h);
    for (let j = 0; j < h; j++) for (let i = -1; i < 7; i++) { const hh = hash(i * 5.1 + j * 2.3 + x); if (hh > 0.45 || (i >= 0 && i < 6 && j < 2)) P(g, pal.bark[2 + (hh * 4 | 0) % 4], x + i, y + j); }
    P(g, pal.cut[0], x + 2, y + 4); P(g, '#f0c850', x + 3, y + 4); P(g, '#d0584a', x + 4, y + 18);
    return;
  }
  R(g, pal.bark[0], x, y, 6, h); R(g, pal.bark[3], x + 1, y, 4, h); R(g, pal.bark[5], x + 1, y, 1, h); R(g, pal.bark[1], x + 4, y, 1, h);
  if (kind === 'palisade') { R(g, pal.bark[0], x + 1, y - 2, 4, 3); R(g, pal.bark[3], x + 2, y - 2, 2, 3); R(g, pal.bark[0], x + 2, y - 4, 2, 3); R(g, pal.bark[4], x + 2, y - 4, 1, 3); R(g, pal.cut[1], x + 2, y - 5, 1, 1); R(g, pal.cord, x, y + 10, 6, 1); R(g, pal.cordD, x, y + 11, 6, 1); }
  else R(g, pal.cut[1], x, y, 6, 2);
}
/* THE ROOT-ARCH (kind 'light', Sporewood's exit): two root pillars (twisted dark roots) meet in a knotted arch over the opening, fungus clusters lit violet + green on the feet and on the crown, rootlets hanging; it grows in as the knot parts. */
const rootArch = () => once('rootArch', () => mk(70, 120, g => {
  const RT = ['#1c1420', '#33262a', '#4a3a3c', '#5e4c4a', '#7a6458'], H = 120, fl = H - 2;
  const strand = (pts, w0) => { for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n), w = Math.max(2, Math.round(w0 * (1 - 0.35 * (i / pts.length))));
    R(g, RT[0], x - 1, y, w + 2, 2); R(g, RT[2], x, y, w, 2); R(g, RT[3], x, y, 1, 2); if (k % 4 === 0) P(g, RT[1], x + w - 1, y); } } };
  strand([[8, fl], [10, 90], [7, 70], [12, 50], [20, 30], [34, 14]], 8); strand([[18, fl], [15, 96], [19, 74], [16, 54], [26, 34], [36, 20]], 5);
  strand([[60, fl], [58, 90], [61, 70], [56, 50], [50, 30], [36, 14]], 8); strand([[50, fl], [53, 96], [49, 74], [52, 54], [44, 34], [34, 20]], 5);
  strand([[22, 36], [28, 26], [35, 22], [42, 26], [48, 36]], 4);                                                         /* the knot across the crown */
  R(g, RT[1], 4, fl - 3, 18, 4); R(g, RT[2], 5, fl - 3, 14, 1); R(g, RT[1], 46, fl - 3, 18, 4); R(g, RT[2], 47, fl - 3, 14, 1);   /* roots splaying into the ground */
  for (const x of [26, 33, 40, 31]) { const l = 6 + (x * 3) % 9; for (let i = 0; i < l; i++) P(g, i % 3 === 2 ? RT[3] : RT[1], x + (i & 1), 22 + (x % 5) + i); }   /* rootlets hanging */
  const shroom = (x, y, s) => { R(g, '#3a2a4c', x, y + 1, 1, 2); R(g, '#66507e', x - s, y, s * 2 + 1, 2); R(g, '#9a5aa8', x - s + 1, y - 1, s * 2 - 1, 1); P(g, '#b4cc68', x - s + 2, y); P(g, '#e8f0a0', x, y - 1); };
  for (const [x, y, s] of [[9, 82, 3], [13, 70, 2], [20, 100, 3], [58, 86, 3], [61, 64, 2], [50, 106, 3], [26, 30, 2], [44, 30, 2], [35, 17, 2], [6, 104, 2], [64, 108, 2]]) shroom(x, y, s);
  for (const [x, y] of [[11, 76], [59, 78], [23, 38], [47, 38], [35, 12]]) { P(g, '#b4cc68', x, y); P(g, '#7ac860', x + 1, y + 1); }   /* spore-lights */
}));
export function drawWayGate(env, o, cx, cy, t, opened, time, reduce) {
  const kind = o.kind || 'pine', pal = GATE_PAL[kind] || GATE_PAL.pine, { g } = env, wc = Math.max(1, o.w || 1), GL = 30 + (wc - 1) * 16, XW = (wc - 1) * 16;   /* GL: the gate's length (the rails), XW: the extra width of a 2+ tile gap */
  const X0 = o.col * 16 - cx, GX = X0 - 12, Y0 = o.rows[0] * 16 - cy, Hh = (o.rows[1] - o.rows[0] + 1) * 16, floor = Y0 + Hh;
  if (X0 > env.VW + 40 || X0 < -60) return;
  const T0 = 0.25, falling = opened || t >= T0, tau = t - T0, bare = kind === 'light';   /* bare: no wall to open - the root-arch grows in instead */
  if (bare && !falling) return;
  const rails = once('gateRails' + kind + GL, () => { const r = []; for (let i = 0; i < RAILS; i++) { const [c, gg] = canvas(GL, 13); gateRail(gg, GL, i % 2 === 0, pal, kind); r.push(c); } return r; });
  if (bare) { const a = opened ? 1 : smooth(tau / 0.7), spr = rootArch(); g.globalAlpha = a; g.drawImage(spr, Math.round(X0 + 8 - 35), Math.round(floor - spr.height + 1)); g.globalAlpha = 1; }
  if (!bare) {
  /* the header (stays): pine = a squared beam with rope ends; palisade = a crest of sharpened stakes; bog = a lashed reed bundle; leaf = a hedge arch with hanging vines */
  const hb = Y0 - 3, HL = 40 + XW;
  if (kind === 'palisade') {
    for (let x = GX - 7; x < GX - 7 + HL; x += 5) { const th = 9 + Math.round(hash(x * 0.37) * 5), tp = hb + 8 - th; R(g, pal.bark[0], x, tp + 3, 5, th - 3); R(g, pal.bark[3], x + 1, tp + 3, 3, th - 3); R(g, pal.bark[5], x + 1, tp + 3, 1, th - 3); R(g, pal.bark[1], x + 3, tp + 3, 1, th - 3);
      R(g, pal.bark[0], x + 1, tp + 1, 3, 3); R(g, pal.bark[3], x + 2, tp + 1, 1, 3); R(g, pal.bark[0], x + 2, tp - 1, 1, 3); P(g, pal.cut[1], x + 2, tp - 1); }
    R(g, pal.cord, GX - 7, hb + 4, HL, 1); R(g, pal.cordD, GX - 7, hb + 5, HL, 1);
  } else if (kind === 'bog') {
    R(g, pal.reed[0], GX - 7, hb - 1, HL, 9); for (let x = 0; x < HL; x++) R(g, pal.reed[1 + (x + (x >> 3)) % 3], GX - 7 + x, hb + (hash(x + 3) > 0.85 ? 1 : 0), 1, 7); for (let x = 3; x < HL - 2; x += 9) { R(g, pal.cord, GX - 7 + x, hb - 1, 2, 9); R(g, pal.cordD, GX - 5 + x, hb - 1, 1, 9); }
    for (let x = 0; x < HL; x += 4) { P(g, pal.reed[3], GX - 7 + x, hb - 2); P(g, pal.reed[2], GX - 6 + x, hb - 3 - (x % 8 === 0 ? 1 : 0)); }
  } else if (kind === 'leaf') {
    for (let x = 0; x < HL; x++) { const top = hb - 2 - Math.round(Math.sin(x / HL * Math.PI) * 4); for (let y = top; y < hb + 8; y++) { const hh = hash(x * 4.1 + y * 1.7); if (hh > 0.18 || y > hb + 5) P(g, pal.bark[1 + (hh * 5 | 0) % 5], GX - 7 + x, y); } }
    for (let k = 0; k < 6; k++) { const x = GX - 5 + k * (HL - 6) / 5; P(g, pal.cut[0], x, hb - 3 - (k % 2) * 2); P(g, '#f0c850', x + 1, hb - 3 - (k % 2) * 2); }
  } else { R(g, pal.bark[0], GX - 7, hb - 1, HL, 9); R(g, pal.bark[3], GX - 6, hb, HL - 2, 4); R(g, pal.bark[5], GX - 6, hb, HL - 2, 1); R(g, pal.bark[1], GX - 6, hb + 4, HL - 2, 3); R(g, pal.cut[1], GX - 7, hb, 2, 7); R(g, pal.cut[1], GX + 31 + XW, hb, 2, 7); }
  for (const [rx, ph] of [[GX - 2, 0], [GX + 26 + XW, 1.7]]) { const sw = falling && !reduce ? Math.round(Math.sin(time * 2.4 + ph) * Math.min(2, tau * 3)) : 0;
    if (kind === 'palisade') continue;
    if (kind === 'leaf') { for (let i = 0; i < 13; i++) P(g, i % 4 === 3 ? pal.bark[5] : pal.bark[3], rx + Math.round(sw * i / 12), hb + 7 + i); P(g, pal.bark[5], rx + sw + 1, hb + 15); P(g, pal.cut[0], rx + sw, hb + 20); continue; }
    for (let i = 0; i < 11; i++) P(g, i % 3 === 2 ? pal.cordD : pal.cord, rx + Math.round(sw * i / 10), hb + 7 + i); R(g, pal.cord, rx - 1 + sw, hb + 18, 3, 2); }
  if (!falling) {
    /* the shut gate: posts, rails in the gate's look, a diagonal brace (pine, palisade), an iron strap at each hinge (not on the living hedge) */
    const jx = t > 0.1 && !reduce ? Math.round(Math.sin(t * 90) * (t - 0.1) * 5) : 0;   /* a shiver just before it goes */
    for (const px of [GX - 4, GX + 20 + XW]) gatePost(g, pal, kind, px + jx, Y0 + 2, Hh);
    for (let i = 0; i < RAILS; i++) g.drawImage(rails[i], GX - 4 + jx, Y0 + 8 + i * 17);
    if (kind === 'pine' || kind === 'palisade') { const bw = 24 + XW; for (let i = 0; i < 28; i++) P(g, pal.bark[1], GX + 1 + Math.round(i * bw / 56) + jx, Y0 + 14 + Math.round(i * 3)); for (let i = 0; i < 28; i++) P(g, pal.bark[4], GX + 2 + Math.round(i * bw / 56) + jx, Y0 + 14 + Math.round(i * 3)); }
    if (kind !== 'leaf') for (const y of [Y0 + 16, Y0 + Hh - 22]) { R(g, '#3c424a', GX - 4 + jx, y, 6, 3); R(g, '#7d868f', GX - 4 + jx, y, 6, 1); P(g, '#a8b0b8', GX - 3 + jx, y + 1); }
    return;
  }
  /* it gives way: each rail falls from its place (closed-form: gravity until the floor, a small bounce), spinning a little and settling on the pile */
  const gv = 520;
  for (let i = RAILS - 1; i >= 0; i--) {
    const d = i * 0.05, ta = Math.max(0, tau - d), y0 = Y0 + 8 + i * 17, rest = floor - 13 - (i % 2) * 2 - Math.floor(i / 2) * 3 + 3, drop = Math.min(rest - y0, 0.5 * gv * ta * ta), landed = y0 + drop >= rest - 0.5;
    const tb = landed ? ta - Math.sqrt(2 * Math.max(0, rest - y0) / gv) : 0, bounce = landed ? Math.max(0, Math.sin(Math.min(1, tb * 5) * Math.PI)) * 2.5 * Math.max(0, 1 - tb * 2.5) : 0;
    const rot = (i % 2 ? 1 : -1) * (0.12 + i * 0.07) * Math.min(1, ta / 0.5), sx = GX - 4 + (i - 2) * (landed ? 4 : 0) * Math.min(1, ta * 3);
    g.save(); g.translate(Math.round(sx + GL / 2), Math.round(y0 + drop - bounce + 6)); g.rotate(rot); g.drawImage(rails[i], -GL / 2, -6); g.restore();
  }
  /* the posts topple east across the path (a trunk to hop), pivoting about their feet */
  for (const [px, dly, fin] of [[GX - 4, 0.12, 1.42], [GX + 20 + XW, 0.22, 1.5]]) {
    const ta = Math.max(0, tau - dly), a = fin * (1 - Math.pow(1 - Math.min(1, ta / 0.7), 2.4)), fall = ta > 0.7 ? Math.max(0, Math.sin(Math.min(1, (ta - 0.7) * 6) * Math.PI)) * 1.2 * Math.max(0, 1 - (ta - 0.7) * 3) : 0;
    g.save(); g.translate(Math.round(px + 3), Math.round(floor - 1 - fall)); g.rotate(a); gatePost(g, pal, kind, -3, -Hh - 1, Hh + 1); g.restore();
  }
  }
  /* the way beyond, lit: a warm spill of morning along the floor and up the gap, and motes drifting in it */
  const lit = smooth((tau - 0.05) / 1.1);
  if (lit > 0) {
    const gr = g.createLinearGradient(X0 - 120, 0, X0 + 130, 0); gr.addColorStop(0, 'rgba(255,230,160,0)'); gr.addColorStop(0.5, 'rgba(255,230,160,' + (0.5 * lit).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,230,160,0)');
    g.fillStyle = gr; g.fillRect(X0 - 120, Y0 - 10, 250, Hh + 10);
    const fl = g.createLinearGradient(0, floor - 14, 0, floor); fl.addColorStop(0, 'rgba(255,236,176,0)'); fl.addColorStop(1, 'rgba(255,236,176,' + (0.4 * lit).toFixed(3) + ')'); g.fillStyle = fl; g.fillRect(X0 - 20, floor - 14, 170, 14);
    if (!reduce) for (let i = 0; i < 9; i++) { const mx = X0 + 8 + ((i * 41 + time * (6 + i)) % 130), my = Y0 + 10 + ((i * 29 - time * (9 + i % 3) + 400) % (Hh - 16)); g.fillStyle = 'rgba(255,244,200,' + (0.5 * lit * (0.4 + 0.6 * hash(i + 2))).toFixed(3) + ')'; g.fillRect(Math.round(mx), Math.round(my), 1, 1); }
  }
  /* the dust of it going, rising and spreading from the floor */
  if (tau < 1.6) for (let i = 0; i < 7; i++) { const k = tau / 1.6, r = 6 + k * 18 + i * 1.5, dx = (i - 3) * 6 + k * (i - 3) * 6, dy = -k * (14 + i * 3);
    g.fillStyle = 'rgba(190,172,132,' + ((1 - k) * 0.35).toFixed(3) + ')'; g.beginPath(); g.ellipse(Math.round(GX + 8 + dx), Math.round(floor - 4 + dy), r, r * 0.55, 0, 0, 6.2832); g.fill(); }
}

/* =====================================================================================================================================================================================================
   THE ROAD SCENE (scene 'road', claude/demotransitions): FEN ROAD -> THE STOCKADE. The laid boardwalk runs on, the world slides under the party, and the goblins' STOCKADE stands up on the skyline:
   a smudge in the haze at first (its horn towers and torch glows), then a wall of sharpened points that fills the right of the screen as they come up to it. Reuses the ferry's marsh kit (haze strip, reeds,
   bog-oak piles and cord, the boardwalk's own planks, mist). ART PASS (claude/demotransitionsart): the skyline is a goblin camp - war-flags, an iron-banded gate under a horned skull, braziers, skull stakes. env: as drawFerryScene. */
const STOCKADE_FIRES = [[10, 36], [194, 45], [228, 45], [298, 28], [370, 42]];   /* where the sprite's fires burn (sprite px): the halos in drawRoadScene sit on them */
const stockadeSkyline = () => once('stockadeSky', () => mk(420, 100, g => {
  const base = 99, wood = ['#1c150f', '#2e241a', '#463826', '#65513a', '#86704e'], IRON = ['#14161a', '#2c3036', '#4a5058', '#7d868f'], CLOTH = ['#0e1a0c', '#1d3a1a', '#2f5a26', '#4a7a36'];
  const hh = x => 30 + Math.round(hash(Math.floor(x / 5) * 5 * 0.37) * 7);
  const fire = (x, y) => { R(g, '#5a1a0c', x - 3, y + 4, 8, 2); R(g, '#c83a14', x - 2, y + 1, 6, 4); R(g, '#ff7a20', x - 1, y - 1, 4, 4); R(g, '#ff7a20', x, y - 3, 2, 2); P(g, '#ff9a30', x + 2, y - 2); R(g, '#ffc040', x, y + 1, 2, 3); P(g, '#fff0a0', x, y + 2); };
  const skull = (x, y) => { R(g, '#d8d0b4', x, y, 5, 4); R(g, '#a89c80', x + 1, y + 4, 3, 1); P(g, '#1b1626', x + 1, y + 1); P(g, '#1b1626', x + 3, y + 1); P(g, '#7d745c', x + 2, y + 3); };
  const flag = (px, top) => {                                                                     /* a war-flag: an iron-tipped pole, a tattered green cloth with a crude red eye over two fangs */
    R(g, wood[1], px, top, 2, 24); R(g, wood[3], px, top, 1, 24); R(g, IRON[2], px - 1, top - 4, 4, 2); R(g, IRON[3], px, top - 6, 2, 2); P(g, IRON[3], px, top - 7);
    for (let r = 0; r < 18; r++) { const wv = 12 - (r > 13 ? (r - 13) : 0) - (r % 5 === 4 ? 1 : 0), x0 = px + 2 + (r > 9 ? 1 : 0); R(g, r < 2 || r > 15 ? CLOTH[0] : CLOTH[2], x0, top + 2 + r, Math.max(2, wv), 1); R(g, CLOTH[1], x0, top + 2 + r, 2, 1); R(g, CLOTH[3], x0 + 2, top + 2 + r, 1, r < 14 ? 1 : 0); }
    R(g, '#c8321c', px + 5, top + 7, 5, 3); P(g, '#ffe08a', px + 7, top + 8); P(g, '#1b1626', px + 8, top + 8); P(g, '#e8dcb0', px + 5, top + 11); P(g, '#e8dcb0', px + 9, top + 11); P(g, '#e8dcb0', px + 5, top + 12); P(g, '#e8dcb0', px + 9, top + 12);
  };
  /* the earth berm and the ditch's spikes: crossed stakes pointing out along the foot of the wall */
  R(g, '#16100b', 0, base - 4, 420, 5); R(g, '#2a1f14', 0, base - 5, 420, 1);
  for (let x = 4; x < 416; x += 13) { if (Math.abs(x - 210) < 34) continue; for (let i = 0; i < 9; i++) { P(g, wood[3], x + i, base - 2 - Math.round(i * 0.9)); P(g, wood[3], x + 9 - i, base - 2 - Math.round(i * 0.9)); } P(g, wood[4], x + 9, base - 10); P(g, wood[4], x, base - 10); }
  /* the wall: sharpened logs, uneven, the sunny side lighter, bound with two ropes + iron straps */
  for (let x = 0; x < 420; x += 5) {
    const h = hh(x);
    R(g, wood[1], x, base - h, 5, h); R(g, wood[2], x + 1, base - h + 3, 3, h - 3); R(g, wood[4], x + 1, base - h + 3, 1, h - 3); R(g, wood[0], x + 4, base - h + 2, 1, h - 2);
    R(g, wood[1], x + 1, base - h - 2, 3, 2); R(g, wood[1], x + 2, base - h - 4, 1, 2); P(g, wood[4], x + 2, base - h - 3);
    if (hash(x * 1.9) > 0.72) P(g, wood[0], x + 2, base - h + 8 + (x % 7));   /* a knot / a hack mark */
  }
  R(g, wood[0], 0, base - 19, 420, 3); R(g, wood[3], 0, base - 19, 420, 1); R(g, CORD_D, 0, base - 17, 420, 1);   /* the rail-beam the logs are lashed to */
  R(g, IRON[1], 0, base - 8, 420, 2); R(g, IRON[3], 0, base - 8, 420, 1); for (let x = 3; x < 420; x += 10) P(g, IRON[3], x, base - 7);   /* the iron strap with studs */
  for (let x = 20; x < 420; x += 10) if (hash(x * 0.9) > 0.55) { R(g, CORD, x, base - 19, 2, 4); R(g, CORD_D, x + 2, base - 19, 1, 4); }   /* rope lashings */
  for (const x of [34, 96, 154, 270, 322, 398]) { skull(x, base - hh(x) + 6); R(g, '#7a1c14', x + 1, base - hh(x) + 11, 2, 3); }   /* skulls on the stakes, red smears under */
  for (const [x, top] of [[62, base - 60], [128, base - 58], [262, base - 62], [348, base - 56]]) flag(x, top);
  /* the gate-house: two squat log towers with spiked heads, braziers burning on them, a heavy lintel with a horned skull, double doors iron-banded and studded, shut and barred */
  for (const px of [184, 224]) { R(g, wood[0], px, base - 50, 12, 50); R(g, wood[2], px + 1, base - 50, 10, 50); R(g, wood[4], px + 1, base - 50, 1, 50); R(g, wood[0], px + 10, base - 50, 2, 50);
    for (let y = base - 46; y < base - 4; y += 7) { R(g, wood[1], px + 1, y, 10, 1); }                                                       /* log courses */
    for (let i = 0; i < 4; i++) { R(g, wood[1], px + 1 + i * 3, base - 56, 2, 6); P(g, wood[4], px + 1 + i * 3, base - 58); P(g, wood[3], px + 2 + i * 3, base - 57); }   /* spiked head */
    R(g, IRON[0], px + 1, base - 52, 10, 3); R(g, IRON[2], px + 1, base - 52, 10, 1);                                                        /* iron brazier bowl */
    R(g, IRON[1], px, base - 24, 12, 2); R(g, IRON[3], px, base - 24, 12, 1); }
  R(g, wood[0], 196, base - 40, 28, 40); R(g, '#0a0709', 197, base - 32, 26, 32);                                                            /* the passage, dark */
  for (const dx of [197, 210]) { R(g, wood[2], dx, base - 32, 13, 32); R(g, wood[1], dx + 6, base - 32, 1, 32); R(g, wood[3], dx, base - 32, 1, 32);
    for (const y of [base - 28, base - 17, base - 6]) { R(g, IRON[1], dx, y, 13, 3); R(g, IRON[3], dx, y, 13, 1); P(g, IRON[3], dx + 2, y + 1); P(g, IRON[3], dx + 10, y + 1); }
    for (let y = base - 30; y < base - 2; y += 5) P(g, IRON[3], dx + 4 + (y & 1) * 3, y); }                                                 /* studs */
  R(g, IRON[0], 196, base - 21, 28, 2); R(g, IRON[3], 196, base - 21, 28, 1);                                                                  /* the bar */
  R(g, wood[3], 192, base - 44, 36, 6); R(g, wood[4], 192, base - 44, 36, 1); R(g, wood[0], 192, base - 39, 36, 1); R(g, IRON[1], 192, base - 41, 36, 1);   /* the lintel */
  for (let i = 0; i < 7; i++) { R(g, wood[2], 193 + i * 5, base - 48, 3, 4); P(g, wood[4], 194 + i * 5, base - 50); }                         /* stakes along it */
  { const cx = 210; R(g, '#d8d0b4', cx - 3, base - 43, 7, 5); R(g, '#a89c80', cx - 2, base - 38, 5, 1); P(g, '#1b1626', cx - 2, base - 42); P(g, '#1b1626', cx + 2, base - 42); P(g, '#7a1c14', cx, base - 41);
    for (let i = 0; i < 4; i++) { P(g, '#e8dcb0', cx - 4 - i, base - 44 - Math.round(i * i * 0.35)); P(g, '#e8dcb0', cx + 4 + i, base - 44 - Math.round(i * i * 0.35)); } }   /* the horned skull */
  /* the horn towers: stilted legs braced with crossed lashed poles, a platform with a rail, a hide roof with a war-flag, the horn jutting out, a torch fire */
  const tower = (x, th) => {
    R(g, wood[1], x, base - th, 3, th); R(g, wood[1], x + 16, base - th, 3, th); R(g, wood[2], x + 1, base - th, 1, th); R(g, wood[2], x + 17, base - th, 1, th);
    for (let i = 0; i < 3; i++) R(g, wood[1], x + 3, base - th + 8 + i * 8, 13, 1);
    for (let i = 0; i < 13; i++) { P(g, wood[3], x + 3 + i, base - th + 8 + Math.round(i * (th - 18) / 13)); P(g, wood[2], x + 15 - i, base - th + 8 + Math.round(i * (th - 18) / 13)); }   /* the crossed braces */
    R(g, wood[3], x - 4, base - th - 3, 27, 4); R(g, wood[4], x - 4, base - th - 3, 27, 1); R(g, wood[0], x - 4, base - th, 27, 1);
    for (let i = 0; i < 6; i++) R(g, wood[1], x - 3 + i * 5, base - th - 7, 1, 4);                                                           /* the rail posts */
    R(g, wood[1], x - 2, base - th - 11, 23, 8); R(g, wood[0], x - 2, base - th - 11, 1, 8); R(g, '#0a0709', x + 3, base - th - 8, 13, 5);   /* the lookout's shelter, dark inside */
    for (let i = 0; i < 6; i++) R(g, '#4a3a2c', x - 4 + i, base - th - 14 + i, 27 - i * 2, 1);                                              /* hide roof */
    for (let i = 0; i < 5; i++) { R(g, '#5a4a38', x - 1 + i * 5, base - th - 14 + 5, 2, 3); }                                                /* the hide's stitched seams hanging */
    for (let i = 0; i < 9; i++) P(g, '#cfc6a8', x + 22 + i, base - th - 9 - Math.round(i * i * 0.07));                                       /* the horn: a pale curve out to the right */
    R(g, '#e8dcb0', x + 30, base - th - 11, 2, 3);
    skull(x + 7, base - th - 22 + 6);                                                                                                         /* a trophy on the roof's peak */
  };
  tower(12, 46); tower(300, 54); tower(372, 40);
  for (const [fx, fy] of STOCKADE_FIRES) fire(fx, fy);
}));
export function drawRoadScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, calm = !!reduce;
  const wl = Math.round(VH * 0.56), rt = wl + 34, scroll = roadScroll(s, calm), gr = roadGrowth(s), P_ = ROAD.parallax, L = layers(VW, VH, wl);
  /* SKY: the fen's cool grey going to a smoky amber at the horizon; it warms and darkens a little as the wall comes up */
  g.drawImage(L.skyB, 0, 0); { const am = g.createLinearGradient(0, wl - 70, 0, wl); am.addColorStop(0, 'rgba(214,150,84,0)'); am.addColorStop(1, 'rgba(214,150,84,' + (0.16 + gr * 0.2).toFixed(3) + ')'); g.fillStyle = am; g.fillRect(0, wl - 70, VW, 70); }
  /* FAR: the haze of the fen's reed flats (slow), then THE STOCKADE: grows from a smudge, hazy at first, sharper and darker as it comes up */
  { const k = 0.34 + 0.98 * gr, w = Math.round(420 * k), h = Math.round(100 * k), xc = VW * (0.80 - 0.14 * gr), baseY = wl + 3 + Math.round(16 * gr), sky = stockadeSkyline();
    const farX = -Math.round(scroll * P_.far) % 700; for (let x = farX; x < VW + 700; x += 700) g.drawImage(marshStrip(), x, wl - 70 + 3);
    g.globalAlpha = 0.52 + 0.48 * gr; g.drawImage(sky, Math.round(xc - w / 2), baseY - h, w, h); g.globalAlpha = 1;
    /* (the haze is the alpha above and the mist bands below: a flat wash over the sprite's box drew a visible rectangle) */
    for (const [fxp, fyp] of STOCKADE_FIRES) { const lx = Math.round(xc - w / 2 + fxp * k), ly = Math.round(baseY - h + fyp * k), fl = calm ? 1 : 0.85 + Math.sin(time * 9 + fxp * 0.37) * 0.12;
      g.globalAlpha = (0.35 + 0.55 * gr) * fl; g.drawImage(halo(16, '255,170,70'), lx - 16, ly - 16); g.globalAlpha = 1; }
    if (!calm) for (let i = 0; i < 3; i++) { for (let j = 0; j < 7; j++) { const u = ((time * 0.07 + j / 7 + i * 0.31) % 1), x = xc - w / 2 + (0.2 + i * 0.28) * w + Math.sin(u * 4 + i) * 6 + u * 10 * k, y = baseY - h * 0.9 - u * 34 * k;
      g.fillStyle = 'rgba(86,76,70,' + ((1 - u) * 0.22).toFixed(3) + ')'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), 3 + u * 7 * k, 2 + u * 4 * k, 0, 0, 6.2832); g.fill(); } } }
  /* the flats between: dark teal water with the reed stands' reflections and drifting glints */
  { const fl = g.createLinearGradient(0, wl, 0, VH); fl.addColorStop(0, '#46605a'); fl.addColorStop(0.5, '#2c4640'); fl.addColorStop(1, '#14221f'); g.fillStyle = fl; g.fillRect(0, wl + 2, VW, VH - wl);
    for (let i = 0; i < 16; i++) { const y = wl + 5 + i * 5 + (i % 2), x = ((hash(i + 9) * VW * 1.6 - scroll * (0.5 + i * 0.05) - (calm ? 0 : time * (4 + i % 3))) % (VW + 40) + VW + 40) % (VW + 40) - 20;
      g.fillStyle = i % 4 === 3 ? 'rgba(10,22,20,0.28)' : 'rgba(226,236,222,' + (0.10 + (i % 3) * 0.04).toFixed(2) + ')'; g.fillRect(Math.round(x), y, 12 + (i % 4) * 7, 1); } }
  /* MID: reed stands along the far side (parallax 0.5) */
  { const mid = scroll * P_.mid, sway = calm ? 0 : Math.sin(time * 1.6) * 1.2;
    for (let i = 0; i < 24; i++) { const px = i * 31 + 14 - mid + (i % 3) * 6; if (px < -30 || px > VW + 30) continue; const sp = reedSprite(20 + (i % 3) * 5, i % 4, false), bx = Math.round(px - 13), top = Math.floor(sp.height * 0.5);
      g.drawImage(sp, 0, 0, sp.width, top, bx + Math.round(sway * 0.8), wl + 8 - sp.height + 7, sp.width, top); g.drawImage(sp, 0, top, sp.width, sp.height - top, bx, wl + 8 - sp.height + 7 + top, sp.width, sp.height - top); } }
  /* THE BOARDWALK: weathered boards (18 px, a joint each), the bog-oak piles every 72 px going down into the water, a rope rail with a lamp-post every 144 px; the lamps are lit */
  { const bw = 18, off = scroll % bw, bt = rt;
    for (let x = -bw - off; x < VW + bw; x += bw) { const k = Math.round((x + scroll) / bw), tone = hash(k) > 0.6 ? 2 : 3; R(g, BOARD[tone - 2], x, bt, bw - 1, 5); R(g, BOARD[tone], x, bt, bw - 1, 2); R(g, BOARD[4], x, bt, bw - 1, 1); R(g, BOARD[0], x + bw - 1, bt, 1, 5); P(g, '#2a2f36', x + 3, bt + 2); P(g, '#2a2f36', x + bw - 5, bt + 2); }
    R(g, OAK[1], 0, bt + 5, VW, 2);
    const pOff = scroll % 72; for (let x = -72 - pOff; x < VW + 72; x += 72) { R(g, OAK[1], x, bt + 5, 5, 30); R(g, OAK[3], x + 1, bt + 5, 3, 30); R(g, OAK[4], x + 1, bt + 5, 1, 30); R(g, CORD, x, bt + 8, 5, 1); }
    const lOff = scroll % 144; for (let x = -144 - lOff, i = 0; x < VW + 144; x += 144, i++) { const lx = x + 36; R(g, OAK[2], lx, bt - 28, 3, 28); R(g, OAK[4], lx, bt - 28, 1, 28); R(g, OAK[3], lx, bt - 28, 12, 2);
      R(g, OUT, lx + 9, bt - 25, 4, 6); R(g, '#ffd36b', lx + 10, bt - 24, 2, 4); g.globalAlpha = 0.75 + (calm ? 0 : Math.sin(time * 6 + i) * 0.1); g.drawImage(halo(16, '255,214,120'), lx + 11 - 16, bt - 22 - 16); g.globalAlpha = 1;
      for (let j = 0; j <= 20; j++) P(g, j % 7 === 3 ? CORD_D : CORD, lx + 3 + j * 6, bt - 12 + Math.round(Math.sin(j / 20 * Math.PI) * 3)); } }
  /* THE PARTY on the boards: in from the left, then walking in place, every seat its own skin */
  for (let i = 0; i < n; i++) { const h = roadHero(i, n, s, VW); env.drawHero(i, h.x, rt, 1, 'run', Math.floor(time * 12) + i * 2); }
  /* NEAR: tall reeds in front (parallax 1.3), the fen's mist over the water */
  { const near = scroll * P_.near, sway = calm ? 0 : Math.sin(time * 1.6) * 1.2;
    for (let i = 0; i < 9; i++) { const px = ((i * 71 + 30 - near) % (VW + 90) + VW + 90) % (VW + 90) - 30; const sp = reedSprite(30 + (i % 3) * 8, 4 + (i % 4), true), top = Math.floor(sp.height * 0.45), bx = Math.round(px - 13), by = VH + 3 - sp.height + (i % 2) * 3, sw = Math.round(sway * 1.6);
      g.drawImage(sp, 0, 0, sp.width, top, bx + sw, by, sp.width, top); g.drawImage(sp, 0, top, sp.width, sp.height - top, bx, by + top, sp.width, sp.height - top); }
    const drift = scroll * 0.5 + (calm ? 0 : time * 4); for (let b = 0; b < 2; b++) { const mb = mistBand(b), off = Math.round((drift * (b ? 1.4 : 0.8)) % MISTW); g.globalAlpha = (b ? 0.28 : 0.38); for (let x = -off; x < VW; x += MISTW) g.drawImage(mb, x, wl - 6 + b * 22); }
    g.globalAlpha = 1; }
  /* the grade: warmer and darker as the walls come up; the scene fades in out of the dark the walk left on */
  g.fillStyle = 'rgba(60,30,14,' + (0.06 + gr * 0.16).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
  const a = s < 0.45 ? 1 - s / 0.45 : 0; if (a > 0) { g.fillStyle = 'rgba(8,6,14,' + (a * a).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
}

/* =====================================================================================================================================================================================================
   THE SMOKE SCENE (scene 'smoke', claude/demotransitions): KINGSWOOD -> THE BURNING VILLAGE. King Gorm is down. The party walks out along the court road, onto a rise, and STOPS: on the horizon three columns of smoke
   stand up out of the far hills, the sky below them going to ember, ash and sparks drifting in on the wind. At the road's edge, left behind them: his fallen standard and a dented crown. GREYBOX-PLUS (an art lane follows):
   the hills, the tree line and the plumes are drawn here from rects, ellipses and the shared halo sprites. */
const smokeSky = (VW, wl) => once('smokeSky' + VW + 'x' + wl, () => { const [c, g] = canvas(VW, wl), gr = g.createLinearGradient(0, 0, 0, wl); gr.addColorStop(0, '#1b2638'); gr.addColorStop(0.55, '#3b3a52'); gr.addColorStop(1, '#8c5a48'); g.fillStyle = gr; g.fillRect(0, 0, VW, wl); return c; });
const smokeEmber = (VW, wl) => once('smokeEmber' + VW + 'x' + wl, () => { const [c, g] = canvas(VW, wl), gr = g.createLinearGradient(0, 0, 0, wl); gr.addColorStop(0, 'rgba(120,40,30,0)'); gr.addColorStop(0.6, 'rgba(214,92,44,0.55)'); gr.addColorStop(1, 'rgba(255,170,72,0.95)'); g.fillStyle = gr; g.fillRect(0, 0, VW, wl); return c; });
/* KINGSWOOD'S TREELINE at dusk, baked: autumn OAKS (round canopies in russet and gold, lit on the side toward the fire) between dark PINES, the near row shorter so the burning village shows over it. k 0 = far (bluer, hazier), 1 = near. */
function oak(g, x, base, h, c, lit) {
  const cy = base - Math.round(h * 0.62), r = Math.max(7, Math.round(h * 0.34)), blobs = [[0, 0, r], [-r * 0.7, r * 0.25, r * 0.7], [r * 0.7, r * 0.2, r * 0.75], [-r * 0.1, -r * 0.55, r * 0.6], [r * 0.4, -r * 0.35, r * 0.55]];
  R(g, c[0], x - 1, cy + r * 0.4, 3, base - cy - r * 0.4); R(g, c[1], x - 1, cy + r * 0.4, 1, base - cy - r * 0.4);                 /* the trunk */
  for (let y = -r * 1.3; y <= r * 1.1; y++) for (let dx = -r * 1.6; dx <= r * 1.6; dx++) {
    let inside = false; for (const [bx, by, br] of blobs) if ((dx - bx) * (dx - bx) + (y - by) * (y - by) * 1.15 <= br * br) { inside = true; break; }
    if (!inside) continue;
    const n = hash((x + dx) * 1.7 + (cy + y) * 3.1), side = dx / (r * 1.6), up = -y / (r * 1.3), v = side * 0.7 + up * 0.35 + (n - 0.5) * 0.9;   /* lit: right + top */
    P(g, v > 0.7 ? c[4] : v > 0.3 ? c[3] : v > -0.15 ? c[2] : v > -0.55 ? c[1] : c[0], x + dx, cy + y);
  }
  if (lit) for (let i = 0; i < r; i++) P(g, '#e8a040', x + Math.round(r * 1.1) - (i % 3), cy - Math.round(r * 0.5) + i * 1);   /* a rim of firelight on the right edge */
}
const huntTrees = k => once('huntTrees' + k, () => mk(540, 72, g => {
  const OAKC = k ? ['#1c1210', '#3a2214', '#6a3418', '#9a4c1e', '#c8822c'] : ['#1e1a22', '#33242a', '#553428', '#7a4a30', '#a2683a'], PN = k ? ['#22382a', '#14221a', '#0a120c'] : ['#2a3a40', '#1c2a30', '#121c20'];
  const n = k ? 26 : 30;
  for (let i = 0; i < n; i++) { const x = 6 + i * (540 / n) + Math.round(hash(i + k * 40) * 9), h = (k ? 20 : 26) + Math.round(hash(i + 3 + k * 40) * (k ? 16 : 24)), base = 70 + k;
    if (i % 3 === 1) pine(g, x, base, h + 4, PN[0], PN[1], PN[2], false); else oak(g, x, base, h + 2, OAKC, k === 1 && x > 300); }
}, false));
/* THE BURNING VILLAGE on its hill: a roofline in silhouette - gabled houses, a chimney, the watch-tower and a mill - windows lit, rooftops split open and glowing, a rim of ember on the right edge */
const villageLine = () => once('villageLine', () => mk(140, 36, g => {
  const base = 35, W = '#171216', Rf = '#251c1a', Rf2 = '#32252a';
  const house = (x, w, h, ph, broken) => {
    R(g, W, x, base - h, w, h); R(g, '#221a1c', x, base - h, 1, h);
    for (let i = 0; i < ph; i++) R(g, i < 2 ? Rf2 : Rf, x - 2 + i, base - h - (ph - i), w + 4 - i * 2, 1);                    /* the gable roof, stepped */
    R(g, '#a8501f', x + w - 1, base - h, 1, h); if (ph) P(g, '#c8782a', x + w + 1, base - h - 1);                                 /* ember rim on the right wall */
    for (let wx = x + 3; wx < x + w - 3; wx += 5) { R(g, '#ff9a30', wx, base - h + 4, 2, 3); P(g, '#ffe08a', wx, base - h + 4); }  /* lit windows */
    if (broken) { R(g, '#ff6a20', x + 3, base - h - ph + 1, 5, 2); R(g, '#ffc040', x + 4, base - h - ph + 1, 2, 1); R(g, '#0a0709', x + 3, base - h - ph + 3, 5, 1); }   /* the roof has gone: fire in the gap */
  };
  house(2, 14, 11, 5, false); house(20, 16, 14, 6, true); house(40, 12, 9, 4, false); house(58, 20, 12, 6, true);
  R(g, W, 82, base - 28, 9, 28); R(g, '#221a1c', 82, base - 28, 1, 28); for (let i = 0; i < 7; i++) R(g, Rf, 82 + (i >> 1) - 1 + 0, base - 28 - i, 9 - (i >> 1) * 2 + 2 - 2, 1);      /* the watch-tower with its spired roof */
  P(g, '#a8501f', 90, base - 24); R(g, '#a8501f', 90, base - 27, 1, 26); R(g, '#ff9a30', 85, base - 22, 2, 4); R(g, '#ff6a20', 84, base - 31, 3, 3); P(g, '#ffe08a', 85, base - 30);
  house(98, 14, 10, 5, true); house(116, 12, 12, 5, false);
  R(g, W, 130, base - 6, 10, 6); R(g, Rf, 129, base - 8, 12, 2);                                                                     /* a low outbuilding */
  R(g, W, 12, base - 17, 3, 6); R(g, W, 71, base - 21, 3, 8); R(g, W, 105, base - 18, 3, 5);                                          /* chimneys */
}));
/* one puff of painted smoke, baked: a cluster of blobs, dithered between three tones. v 0 = high smoke (dim grey-brown, paler on top); v 1 = low smoke lit orange from the fire under it */
const puffSprite = v => once('puff' + v, () => { const [c, g] = canvas(34, 28), tones = v ? ['#e0782c', '#9a4a30', '#5a3636', '#3a2a2e'] : ['#9a8c86', '#6e605e', '#4a3e40', '#32282c'];
  const blobs = [[17, 15, 11], [9, 17, 7], [25, 17, 8], [15, 8, 7], [22, 9, 6]];
  for (let y = 0; y < 28; y++) for (let x = 0; x < 34; x++) { let d = -1; for (const [bx, by, br] of blobs) { const e = br - Math.hypot(x - bx, (y - by) * 1.08); if (e > d) d = e; } if (d < 0) continue;
    const f = y / 28 * (v ? -1 : 1) + (v ? 1 : 0), t = f * 2.2 + (hash(x * 7 + y * 3) - 0.5) * 0.7 + (d < 1.6 ? 0.55 : 0) - (v ? 0 : 0.2), ti = t < 0.5 ? 0 : t < 1.1 ? 1 : t < 1.7 ? 2 : 3;
    g.fillStyle = tones[Math.min(3, ti)]; g.fillRect(x, y, 1, 1); }
  return c; });
function smokePlume(g, bx, by, hMax, rise, time, seed, calm) {
  const N = 16, hh = hMax * rise; if (hh < 2) return;
  for (let j = 0; j < N; j++) {
    const u = ((j / N) + (calm ? 0.3 : time * 0.045) + hash(seed * 7 + j) * 0.04) % 1, y = by - u * hh, x = bx + Math.sin(u * 5 + seed * 2) * u * 16 + u * u * 26, r = 3 + u * 15, a = (1 - u) * 0.8 * Math.min(1, u * 7), low = u < 0.28;
    const spr = puffSprite(low ? 1 : 0), sc = r * 2 / 22;
    g.globalAlpha = Math.max(0, low ? Math.min(0.85, a * 1.1) : a * 0.9); g.drawImage(spr, Math.round(x - 17 * sc), Math.round(y - 14 * sc), Math.round(34 * sc), Math.round(28 * sc));
  }
  g.globalAlpha = 1;
}
/* flames at a burning roof: layered tongues, each licking at its own pace; x,y the base centre, w its half-width */
function flames(g, x, y, w, time, calm, seed) {
  for (let i = -w; i <= w; i += 2) { const ph = hash(seed * 5 + i) * 6.28, hgt = (5 + hash(seed + i * 0.7) * 6) * (1 - Math.abs(i) / (w + 2) * 0.6) * (calm ? 1 : 0.8 + Math.sin(time * 9 + ph) * 0.3), hx = Math.round(x + i + (calm ? 0 : Math.sin(time * 6 + ph) * 0.8));
    R(g, '#c83a14', hx, y - hgt, 2, hgt); R(g, '#ff7a20', hx, y - hgt * 0.75, 2, hgt * 0.75); if (hgt > 5) R(g, '#ffc040', hx, y - hgt * 0.4, 1, hgt * 0.4); P(g, '#fff0a0', hx, y - 1); }
}
/* GORM'S FALLEN STANDARD and CROWN, baked: the snapped pole with a jagged break and its gilded boar-head spear-point, the red cloth torn and mud-spattered with a gold boar and a gold border, a scorch on it; beside it the crown, one point bent, two gems */
const gormStandard = () => once('gormStandard', () => mk(92, 36, g => {
  const py = x => 24 - Math.round(x * 0.2), GR = 33;                                                                               /* the pole leans: its snapped foot on the ground, its head up on a stone */
  for (let x = 2; x < 56; x++) { R(g, '#2e1c0f', x, py(x), 1, 3); R(g, x % 4 === 0 ? '#8a5a30' : '#6a4425', x, py(x), 1, 2); }
  for (const [x, dy] of [[1, 1], [2, -1], [0, 2], [3, 0]]) { P(g, '#d8c498', x, py(x) + dy); P(g, '#a8946a', x + 1, py(x) + dy + 1); }              /* the splintered break */
  R(g, '#a8801c', 55, py(55) - 1, 3, 5); R(g, '#e0b040', 56, py(56) - 1, 2, 5);                                                    /* the gilt collar */
  for (let i = 0; i < 8; i++) R(g, i < 2 ? '#e0b040' : '#c8cfd8', 58 + i, py(58) + 1 - (i >> 2), 1, Math.max(1, 3 - (i >> 1)));   /* the spear-point */
  P(g, '#fff6c8', 59, py(59)); P(g, '#ffffff', 60, py(60) + 1);
  R(g, '#3a3a36', 50, py(50) + 3, 10, GR - py(50) - 3); R(g, '#5a5a52', 50, py(50) + 3, 10, 1); R(g, '#24241f', 57, py(50) + 4, 3, GR - py(50) - 4);   /* the stone it rests on */
  const cx0 = 12, cw = 36;                                                                                                         /* the cloth hangs off the pole to the ground, torn */
  for (let x = cx0; x < cx0 + cw; x++) { const top = py(x) + 2, taper = x > cx0 + cw - 8 ? (x - (cx0 + cw - 8)) * 2 : 0, tear = hash(x * 2.3) > 0.6 ? 2 : 0, bot = GR - tear - taper, fold = ((x - cx0) % 9) < 3;
    R(g, fold ? '#5c1c18' : '#8c2a24', x, top, 1, bot - top); if (!fold && (x - cx0) % 9 === 5) R(g, '#a63830', x, top + 1, 1, Math.max(0, bot - top - 4)); R(g, '#e0b040', x, top, 1, 1);
    P(g, x % 3 === 0 ? '#e0b040' : '#a8801c', x, bot - 1); }                                                                         /* the gold edge, the gold fringe */
  const mx = cx0 + 15, my = py(mx) + 8;                                                                                            /* the boar: body, hump, snout, eye, tusk */
  R(g, '#e0b040', mx, my, 9, 4); R(g, '#e0b040', mx + 2, my - 1, 4, 1); R(g, '#e0b040', mx + 9, my + 1, 2, 2); P(g, '#1b1626', mx + 8, my + 1); P(g, '#f4ecd0', mx + 9, my + 3); P(g, '#a8801c', mx + 1, my + 3); R(g, '#a8801c', mx + 2, my + 4, 1, 2); R(g, '#a8801c', mx + 6, my + 4, 1, 2);
  R(g, '#241a14', cx0 + 3, py(cx0 + 3) + 7, 5, 3); R(g, '#1c1410', cx0 + 25, py(cx0 + 25) + 5, 4, 4); P(g, '#1c1410', cx0 + 8, py(cx0 + 8) + 9);   /* scorch + mud */
  /* the crown on the road beside it: a gold band, five points (the fourth knocked askew), a red gem and a green one, a dent */
  const kx = 70, ky = 28;
  R(g, '#a8801c', kx, ky + 3, 14, 3); R(g, '#e0b040', kx, ky + 2, 14, 3); R(g, '#fff1b0', kx + 1, ky + 2, 5, 1); R(g, '#7a5a14', kx, ky + 5, 14, 1);
  for (let i = 0; i < 5; i++) { const px = kx + i * 3 + (i === 3 ? 1 : 0), bent = i === 3; R(g, '#e0b040', px, ky - (bent ? 1 : 3) + 2, 2, bent ? 2 : 4); P(g, '#fff1b0', px, ky - (bent ? 1 : 3) + 2); P(g, '#a8801c', px + 1, ky - (bent ? 0 : 3) + 2); if (bent) { P(g, '#e0b040', px + 2, ky); P(g, '#a8801c', px + 3, ky + 1); } }
  R(g, '#d03a3a', kx + 3, ky + 3, 2, 2); P(g, '#ff9a8a', kx + 3, ky + 3); R(g, '#3ac870', kx + 9, ky + 3, 2, 2); P(g, '#b8ffd0', kx + 9, ky + 3); P(g, '#7a5a14', kx + 12, ky + 3); P(g, '#7a5a14', kx + 5, ky + 1);
}));
export function drawSmokeScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, calm = !!reduce, wl = Math.round(VH * 0.60), rt = wl + 26, rise = smokeRise(s), glow = smokeGlow(s);
  g.drawImage(smokeSky(VW, wl), 0, 0); g.globalAlpha = glow; g.drawImage(smokeEmber(VW, wl), 0, 0); g.globalAlpha = 1;
  /* the fire on the horizon: three halos low over the far hills at the right (taller + darker plumes as the village burns) */
  [0.70, 0.80, 0.90].forEach((f, i) => { g.globalAlpha = glow * (0.55 + (calm ? 0 : Math.sin(time * 5 + i * 2) * 0.08)); g.drawImage(halo(60, '255,120,50'), Math.round(VW * f) - 60, wl - 60); g.globalAlpha = 1; });
  /* the far hills (static, a dark blue-green with a rim of ember along the fire side) */
  const hy = x => wl - 14 - Math.round(Math.sin(x * 0.021 + 1) * 9 + Math.sin(x * 0.057) * 4);
  { const hs = g.createLinearGradient(0, wl - 30, 0, wl + 2); hs.addColorStop(0, '#202c2a'); hs.addColorStop(1, '#111a18'); g.fillStyle = hs;
    g.beginPath(); g.moveTo(0, wl + 2); for (let x = 0; x <= VW; x += 8) g.lineTo(x, hy(x)); g.lineTo(VW, wl + 2); g.fill();
    g.fillStyle = 'rgba(255,150,70,' + (0.35 * glow).toFixed(3) + ')'; g.beginPath(); g.moveTo(VW * 0.6, hy(VW * 0.6) + 1); for (let x = Math.round(VW * 0.6); x <= VW; x += 8) g.lineTo(x, hy(x) - 1); for (let x = VW; x >= Math.round(VW * 0.6); x -= 8) g.lineTo(x, hy(x) + 1); g.fill(); }
  /* the far tree row (drifting left very slowly), THEN the village on its hill, the fire and the smoke, THEN the near row over their feet */
  const trees = k => { const spr = huntTrees(k), d = calm ? 0 : -Math.round((time * (k ? 2.4 : 1.2)) % 540); for (let x = d; x < VW + 540; x += 540) g.drawImage(spr, x, wl - 54 + k * 14 + 8); };
  trees(0);
  { const vs = villageLine(), vx = Math.round(VW * 0.80 - vs.width / 2), vy = wl - 8 - vs.height + 1; g.globalAlpha = 0.55 + 0.45 * glow; g.drawImage(vs, vx, vy); g.globalAlpha = 1;
    const roofs = [[vx + 27, vy + 22, 5, 1], [vx + 67, vy + 22, 7, 2], [vx + 105, vy + 26, 4, 3], [vx + 84, vy + 4, 3, 4], [vx + 48, vy + 28, 4, 5]], on = glow;
    if (on > 0.1) { g.globalAlpha = Math.min(1, on * 1.2); for (const [fx, fy, fw, sd] of roofs) flames(g, fx, fy, fw, time, calm, sd); g.globalAlpha = 1; }
    smokePlume(g, vx + 28, vy + 18, 120, rise, time, 1, calm); smokePlume(g, vx + 68, vy + 18, 150, rise * 0.95, time, 2, calm); smokePlume(g, vx + 105, vy + 20, 105, rise * 0.9, time, 3, calm); }
  trees(1); g.globalAlpha = 0.25 * glow; g.fillStyle = '#ff7a30'; g.fillRect(Math.round(VW * 0.55), wl - 4, VW, 3); g.globalAlpha = 1;
  /* the ground: the court road, a dirt bed with two ruts and gold leaves; dark grass either side, the ember light on it from the right */
  { const gg = g.createLinearGradient(0, wl, 0, VH); gg.addColorStop(0, '#1d2a1a'); gg.addColorStop(1, '#0b120a'); g.fillStyle = gg; g.fillRect(0, wl + 2, VW, VH - wl);
    R(g, '#4a3a28', 0, rt - 2, VW, 14); R(g, '#5c4a34', 0, rt - 2, VW, 2); R(g, '#33281c', 0, rt + 4, VW, 1); R(g, '#33281c', 0, rt + 8, VW, 1);
    for (let i = 0; i < 40; i++) { const x = Math.round(hash(i + 11) * VW), y = rt + 11 + Math.round(hash(i + 12) * Math.max(1, VH - rt - 14)); R(g, i % 3 ? '#2a3c1c' : '#5a4a1c', x, y, 2 + (i % 3), 1); }
    for (let i = 0; i < 14; i++) { const x = Math.round(hash(i + 31) * VW), y = rt - 1 + Math.round(hash(i + 33) * 11); P(g, i % 2 ? '#d9a63a' : '#c9782a', x, y); }
    const ex = g.createLinearGradient(VW * 0.35, 0, VW, 0); ex.addColorStop(0, 'rgba(255,120,50,0)'); ex.addColorStop(1, 'rgba(255,120,50,' + (0.3 * glow).toFixed(3) + ')'); g.fillStyle = ex; g.fillRect(0, rt - 2, VW, VH - rt); }
  /* GORM'S STANDARD, fallen at the road's edge: the snapped pole, the torn red cloth with its gold boar, and the dented crown, a glint on it now and then */
  { const sp = gormStandard(), bx = Math.round(VW * 0.0) + 2, by = rt - 23; g.globalAlpha = 0.4; g.fillStyle = '#05080a'; g.fillRect(bx + 2, by + 33, 82, 3); g.globalAlpha = 1; g.drawImage(sp, bx, by);
    const tw = calm ? 0.6 : Math.max(0, Math.sin(time * 1.7)) ** 6; if (tw > 0.05) { g.globalAlpha = tw; g.fillStyle = '#fff8d0'; g.fillRect(bx + 77, by + 26, 1, 3); g.fillRect(bx + 76, by + 27, 3, 1); g.globalAlpha = 1; } }
  /* THE PARTY: in from the left over 2.4 s, then stood on the rise, looking right - every seat its own skin */
  for (let i = 0; i < n; i++) { const h = smokeHero(i, n, s, VW); env.drawHero(i, h.x, rt + 7, 1, h.walking ? 'run' : 'idle', h.walking ? Math.floor(time * 12) + i * 2 : Math.floor(time * 4.5) + i); }
  /* ash and sparks, blown in from the right on the wind (more as it burns) */
  { const cnt = Math.round(10 + 22 * glow); for (let i = 0; i < cnt; i++) { const sp = 12 + hash(i + 3) * 22, x = (((hash(i) * (VW + 60)) - (calm ? 0 : time * sp)) % (VW + 60) + VW + 60) % (VW + 60) - 20, y = (((hash(i + 7) * VH) + (calm ? 0 : time * (4 + hash(i + 9) * 9) * (i % 2 ? 1 : -1))) % VH + VH) % VH;
      const spark = i % 3 === 0; g.fillStyle = spark ? 'rgba(255,' + (150 + (i * 13) % 80) + ',70,' + (0.8 * glow).toFixed(2) + ')' : 'rgba(150,140,136,' + (0.5 * glow).toFixed(2) + ')'; g.fillRect(Math.round(x), Math.round(y), spark ? 1 : 2, 1); } }
  /* near: dark bracken fronds along the bottom edge */
  for (let i = 0; i < 12; i++) { const x = Math.round(i * (VW / 11) + (hash(i + 5) - 0.5) * 20), h = 12 + Math.round(hash(i + 2) * 12); for (let k = 0; k < 5; k++) { const lean = (k - 2) * 2; for (let y = 0; y < h - Math.abs(k - 2) * 2; y++) P(g, y % 5 === 4 ? '#0e1a0c' : '#07100a', x + Math.round(lean * y / 5), VH + 2 - y); } }
  g.fillStyle = 'rgba(40,10,10,' + (0.10 * glow).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
  const a = s < 0.45 ? 1 - s / 0.45 : 0; if (a > 0) { g.fillStyle = 'rgba(8,6,14,' + (a * a).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
}
