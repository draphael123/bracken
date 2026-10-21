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
import { FERRY, sceneScroll, heroOnScene, ferryX } from './transitions.js';
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
  LAY = { VW, VH, skyA, skyB: sky('#768a9e', '#acc0b2'), watA: wat('#6e908a', '#2c4a46', 'rgba(242,226,180,0.30)'), watB: wat('#587a64', '#233a2c', 'rgba(172,192,178,0.30)'), shaft };
  return LAY;
}
let JET = null;   /* the jetty + the Wood's bank, in GROUND coordinates (screen x = gx - ground); gx runs from -40 to jx1; JT is the plank top (sprite row 34) */
function jetty(VW) {
  if (JET && JET.VW === VW) return JET;
  const jx1 = Math.round(VW * FERRY.dockAt) + 6, W = jx1 + 44, H = 130;
  const spr = mk(W, H, g => {
    const gx = x => x + 40, JT = 34;
    /* the Wood's bank: autumn grass over bark-brown earth, roots, ferns, an undercut lip over the water */
    const bx1 = gx(46);
    R(g, '#463624', 0, JT, bx1, H); R(g, '#6a5238', 0, JT + 3, bx1 - 4, 14); R(g, '#80664a', 2, JT + 4, 6, 3); R(g, '#2e1c0f', 0, JT + 18, bx1 - 8, H);
    for (let x = 0; x < bx1; x++) { const dy = (x > bx1 - 7 ? Math.round((x - (bx1 - 7)) * 0.7) : 0); R(g, '#4e6a28', x, JT - 1 + dy, 1, 5); R(g, '#7a9a3a', x, JT - 1 + dy, 1, 2); if (hash(x) > 0.55) P(g, '#a8c050', x, JT - 2 + dy); if (hash(x + 3) > 0.9) P(g, '#d9a63a', x, JT - 2 + dy); }
    for (const x of [10, 30, 58]) { R(g, BARK[2], gx(x - 40), JT + 4, 2, 9); R(g, BARK[3], gx(x - 40) + 2, JT + 11, 7, 2); R(g, BARK[1], gx(x - 40) + 8, JT + 12, 4, 2); P(g, BARK[4], gx(x - 40), JT + 4); }   /* roots gripping the bank */
    for (const x of [-34, -3, 32]) for (let b = 0; b < 5; b++) for (let i = 0; i < 7; i++) P(g, NEEDLE[(b + 3) % 3 + 2], gx(x) + (b - 2) * 2 + Math.round((b - 2) * i * 0.3), JT - 1 - i - (b % 2));   /* fern fronds */
    g.drawImage(logPileSprite(), gx(-38), JT - 34);                       /* the woodsmen's log pile (the Lumber Trail's own) */
    drawStump(g, gx(12), JT + 1, 1);                                      /* and a stump */
    R(g, BARK[1], gx(12) - 4, JT - 21, 3, 7); R(g, '#8a929a', gx(12) - 6, JT - 24, 5, 4); R(g, '#c4ccd4', gx(12) - 6, JT - 24, 5, 1);   /* an axe left in it */
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
  JET = { VW, jx1, spr, JT: 34, lanternAt: [jx1 + 40 - 38 + 9, 34 - 18] };
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
  const L = layers(VW, VH, wl), J = jetty(VW);
  /* SKY: the Wood's gold morning, grading to the Marsh's cool grey-green; the sun low left, a pale day-moon rising right (the Marsh's night piece), a light shaft that fades out */
  g.drawImage(L.skyA, 0, 0); if (kk > 0.01) { g.globalAlpha = kk; g.drawImage(L.skyB, 0, 0); g.globalAlpha = 1; }
  if (kk > 0.25) { g.globalAlpha = smooth((kk - 0.25) / 0.6) * 0.7; g.drawImage(moonSprite(), Math.round(VW * 0.8), Math.round(VH * 0.13)); g.globalAlpha = 1; }
  /* FAR: the Wood's painted treeline recedes left; the Marsh's huts, stands and lamps arrive from the right */
  const far = scroll * P_.far, pineX = -Math.round(far), marshX = Math.round(VW + 30 - far);
  g.drawImage(pineStrip(), pineX, wl - 78 + 3);
  g.drawImage(marshStrip(), marshX, wl - 70 + 3);
  /* the water, graded the same way; the treeline reflected under the far shore, trembling */
  g.drawImage(L.watA, 0, wl - 3); if (kk > 0.01) { g.globalAlpha = kk; g.drawImage(L.watB, 0, wl - 3); g.globalAlpha = 1; }
  g.save(); g.globalAlpha = 0.16; g.translate(0, wl * 2 - 1); g.scale(1, -0.28); g.translate(0, -wl); g.drawImage(pineStrip(), pineX, wl - 78 + 3); g.drawImage(marshStrip(), marshX, wl - 70 + 3); g.restore();
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
  if (kk < 0.99) { g.globalAlpha = (1 - kk) * 0.9; g.drawImage(L.shaft, 0, 0); g.globalAlpha = 1; }
  g.fillStyle = 'rgba(255,214,140,' + ((1 - kk) * 0.07).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
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
const RAILS = 5;
function gateRail(g, len, lit) {
  R(g, BARK[0], 0, 0, len, 13); R(g, BARK[3], 1, 1, len - 2, 5); R(g, BARK[5], 1, 1, len - 2, 1); R(g, BARK[2], 1, 6, len - 2, 5); R(g, BARK[1], 1, 10, len - 2, 2);
  R(g, CUT[1], 0, 2, 2, 9); R(g, CUT[3], 0, 5, 2, 1); R(g, CUT[1], len - 2, 2, 2, 9); R(g, CUT[3], len - 2, 5, 2, 1);
  for (let k = 0; k < 3; k++) P(g, BARK[1], 4 + Math.round(hash(k + len) * (len - 9)), 3 + (k & 1) * 3);
  if (lit) R(g, CORD, 5, 0, 2, 13);
}
export function drawWayGate(env, o, cx, cy, t, opened, time, reduce) {
  const { g } = env, X0 = o.col * 16 - cx, GX = X0 - 12, Y0 = o.rows[0] * 16 - cy, Hh = (o.rows[1] - o.rows[0] + 1) * 16, floor = Y0 + Hh;
  if (X0 > env.VW + 40 || X0 < -60) return;
  const T0 = 0.25, falling = opened || t >= T0, tau = t - T0;
  const rails = once('gateRails', () => { const r = []; for (let i = 0; i < RAILS; i++) { const [c, gg] = canvas(30, 13); gateRail(gg, 30, i % 2 === 0); r.push(c); } return r; });
  /* the header beam (stays): a squared pine across the top with two rope ends hanging, swinging after the gate has gone */
  const hb = Y0 - 3; R(g, BARK[0], GX - 7, hb - 1, 40, 9); R(g, BARK[3], GX - 6, hb, 38, 4); R(g, BARK[5], GX - 6, hb, 38, 1); R(g, BARK[1], GX - 6, hb + 4, 38, 3); R(g, CUT[1], GX - 7, hb, 2, 7); R(g, CUT[1], GX + 31, hb, 2, 7);
  for (const [rx, ph] of [[GX - 2, 0], [GX + 26, 1.7]]) { const sw = falling && !reduce ? Math.round(Math.sin(time * 2.4 + ph) * Math.min(2, tau * 3)) : 0; for (let i = 0; i < 11; i++) P(g, i % 3 === 2 ? CORD_D : CORD, rx + Math.round(sw * i / 10), hb + 7 + i); R(g, CORD, rx - 1 + sw, hb + 18, 3, 2); }
  if (!falling) {
    /* the shut gate: posts, rails with their ends cut and lashed, a diagonal brace, an iron strap at each hinge */
    const jx = t > 0.1 && !reduce ? Math.round(Math.sin(t * 90) * (t - 0.1) * 5) : 0;   /* a shiver just before it goes */
    for (const px of [GX - 4, GX + 20]) { R(g, BARK[0], px + jx, Y0 + 2, 6, Hh); R(g, BARK[3], px + 1 + jx, Y0 + 2, 4, Hh); R(g, BARK[5], px + 1 + jx, Y0 + 2, 1, Hh); R(g, BARK[1], px + 4 + jx, Y0 + 2, 1, Hh); R(g, CUT[1], px + jx, Y0 + 2, 6, 2); }
    for (let i = 0; i < RAILS; i++) g.drawImage(rails[i], GX - 4 + jx, Y0 + 8 + i * 17);
    for (let i = 0; i < 28; i++) P(g, BARK[1], GX + 1 + Math.round(i * 0.5) + jx, Y0 + 14 + Math.round(i * 3)); for (let i = 0; i < 28; i++) P(g, BARK[4], GX + 2 + Math.round(i * 0.5) + jx, Y0 + 14 + Math.round(i * 3));   /* the brace */
    for (const y of [Y0 + 16, Y0 + Hh - 22]) { R(g, '#3c424a', GX - 4 + jx, y, 6, 3); R(g, '#7d868f', GX - 4 + jx, y, 6, 1); P(g, '#a8b0b8', GX - 3 + jx, y + 1); }
    return;
  }
  /* it gives way: each rail falls from its place (closed-form: gravity until the floor, a small bounce), spinning a little and settling on the pile */
  const gv = 520;
  for (let i = RAILS - 1; i >= 0; i--) {
    const d = i * 0.05, ta = Math.max(0, tau - d), y0 = Y0 + 8 + i * 17, rest = floor - 13 - (i % 2) * 2 - Math.floor(i / 2) * 3 + 3, drop = Math.min(rest - y0, 0.5 * gv * ta * ta), landed = y0 + drop >= rest - 0.5;
    const tb = landed ? ta - Math.sqrt(2 * Math.max(0, rest - y0) / gv) : 0, bounce = landed ? Math.max(0, Math.sin(Math.min(1, tb * 5) * Math.PI)) * 2.5 * Math.max(0, 1 - tb * 2.5) : 0;
    const rot = (i % 2 ? 1 : -1) * (0.12 + i * 0.07) * Math.min(1, ta / 0.5), sx = GX - 4 + (i - 2) * (landed ? 4 : 0) * Math.min(1, ta * 3);
    g.save(); g.translate(Math.round(sx + 12), Math.round(y0 + drop - bounce + 6)); g.rotate(rot); g.drawImage(rails[i], -12, -6); g.restore();
  }
  /* the posts topple east across the path (a trunk to hop), pivoting about their feet */
  for (const [px, dly, fin] of [[GX - 4, 0.12, 1.42], [GX + 20, 0.22, 1.5]]) {
    const ta = Math.max(0, tau - dly), a = fin * (1 - Math.pow(1 - Math.min(1, ta / 0.7), 2.4)), fall = ta > 0.7 ? Math.max(0, Math.sin(Math.min(1, (ta - 0.7) * 6) * Math.PI)) * 1.2 * Math.max(0, 1 - (ta - 0.7) * 3) : 0;
    g.save(); g.translate(Math.round(px + 3), Math.round(floor - 1 - fall)); g.rotate(a); R(g, BARK[0], -3, -Hh - 1, 6, Hh + 1); R(g, BARK[3], -2, -Hh, 4, Hh); R(g, BARK[5], -2, -Hh, 1, Hh); R(g, BARK[1], 1, -Hh, 1, Hh); R(g, CUT[1], -3, -Hh - 1, 6, 2); g.restore();
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
