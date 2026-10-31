// deeprails6_art.js - DEEP RAILS 6's GREYBOX art (claude/deeprails6, the Opus pass; a Sonnet art lane polishes it): the Great Drill's P3 ONE RAIL (the LOW line under rubble up to
// the MID rail, the red lamp strip that quickens as its bar falls), THE SLAG LADLE (the boom rising over the cab with its ladle, the marked line, the glob, the pool), THE POINTS
// LEVER's throw (the clunk and spark as the hand-lever comes down) and the ORE STREAM from the rig's chute into its gears. Plain rects and arcs; every piece keeps its read (B10/B16).
import { MP, glow } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };

/* P3 ONE RAIL: the LOW line buried - a heap of broken rock from the floor up to the MID rail's bed, running past at the tunnel's pace; k 0..1 the rubble still coming down */
export function oneRailRubble(g, x0, x1, yMid, yLow, scroll, k, time) {
  const w = x1 - x0; if (w <= 0) return; const kk = Math.max(0, Math.min(1, k)), top = R(yLow - (yLow - yMid) * kk), off = R(scroll) % 14;
  rc(g, x0, top, w, yLow - top + 2, '#3a2c22');
  for (let x = x0 - 14 - off; x < x1 + 14; x += 14) { const s = ((x + R(scroll)) / 14) | 0, h = 3 + ((s * 7) & 3); rc(g, x, top - h + 2, 13, h, s & 1 ? '#5e4a38' : '#4a3a2c'); rc(g, x, top - h + 2, 13, 1, '#8a7660'); rc(g, x + 12, top - h + 2, 1, h, '#241a14'); }
  for (let x = x0 - 22 - (R(scroll) % 22); x < x1 + 22; x += 22) { const s = ((x + R(scroll)) / 22) | 0; rc(g, x + 3, top + 5 + (s % 3) * 3, 8, 4, '#6b5a48'); rc(g, x + 3, top + 5 + (s % 3) * 3, 8, 1, '#9a8670'); }
  if (kk < 1) for (let i = 0; i < 16; i++) { const t = (time * 1.4 + i * 0.29) % 1; rc(g, x0 + ((i * 53) % Math.max(1, w)), yMid - 60 + t * (top - yMid + 60), 3, 3, i % 2 ? '#8a7660' : '#5e4a38'); }   /* still coming down */
}
/* the RED LAMP STRIP along the roof: pulses faster (and redder) as its bar falls - t 0..1 */
export function tensionLamps(g, x0, x1, yCeil, t, time) {
  const tt = Math.max(0, Math.min(1, t)), rate = 2 + 10 * tt, on = 0.5 + 0.5 * Math.sin(time * rate * Math.PI);
  for (let x = x0 + 12; x < x1; x += 40) { rc(g, x - 3, yCeil + 2, 6, 3, '#2a1a18'); rc(g, x - 2, yCeil + 3, 4, 2, on > 0.5 ? '#ff4a3a' : '#7a1c16');
    add(g, () => { g.globalAlpha = (0.25 + 0.55 * tt) * on; g.drawImage(glow(18, '255,60,40'), x - 18, yCeil + 4 - 18); }); }
}
/* THE POINTS THROWN: the clunk as the hand-lever comes down - a spark burst at its head (k 0..1 over the 0.25 s pull) */
export function leverClunk(g, x, y, k, time) {
  const a = 1 - k; add(g, () => { g.globalAlpha = 0.7 * a; g.drawImage(glow(16, '255,210,120'), x - 16, y - 16); });
  for (let i = 0; i < 8; i++) { const an = i * 0.785 + time * 3, d = 4 + k * 14; rc(g, x + Math.cos(an) * d, y + Math.sin(an) * d + k * k * 6, 2, 1, i % 2 ? '#ffd36b' : '#ffffff'); }
}
/* THE ORE STREAM: from the rig's chute mouth (x0,y0) in an arc down into its gear housing (x1,y1), k 0..1 over the pour; smoke at the gears as they choke */
export function oreStream(g, x0, y0, x1, y1, k, time) {
  rc(g, x0 - 7, y0 - 3, 14, 3, MP.i3); rc(g, x0 - 7, y0 + R(4 * Math.min(1, k * 3)), 14, 2, MP.i5);   /* the hatch drops */
  for (let i = 0; i < 18; i++) { const t = (time * 3 + i / 18) % 1; if (t > Math.min(1, k * 2.5)) continue; const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 14;
    rc(g, x - 1 + ((i * 5) % 3), y, 3, 2, i % 4 === 0 ? MP.go2 : i % 3 === 0 ? MP.cu2 : '#8a5a38'); }
  for (let i = 0; i < 6; i++) { const t = (time * 1.5 + i * 0.17) % 1; g.fillStyle = 'rgba(120,110,104,' + (0.5 * (1 - t) * Math.min(1, k * 2)).toFixed(2) + ')'; g.fillRect(R(x1 - 8 + i * 3 - t * 6), R(y1 - 6 - t * 22), 5 + R(t * 4), 4); }
}
/* B16 - THE SLAG LADLE's windup: from the cab's roof (cx, top) the boom rises, a ladle on its end glowing with slag; k 0..1 through the tell */
export function ladleArm(g, cx, top, k, time) {
  const a = -0.3 - 1.4 * k, len = 30, bx = cx, by = top - 2, ex = bx + Math.cos(a) * len * -1, ey = by + Math.sin(a) * len;
  g.strokeStyle = '#4a4e5a'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by); g.lineTo(R(ex), R(ey)); g.stroke(); g.strokeStyle = '#8a8e9a'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by - 1); g.lineTo(R(ex), R(ey) - 1); g.stroke();
  rc(g, bx - 3, by - 2, 6, 4, '#2a2830');
  rc(g, ex - 6, ey - 2, 12, 6, '#2a2228'); rc(g, ex - 5, ey - 3, 10, 3, k > 0.2 ? '#ff7a2a' : '#8a3a1a'); rc(g, ex - 3, ey - 3, 6, 1, '#ffd36b');   /* the ladle, brimming */
  add(g, () => { g.globalAlpha = 0.4 + 0.5 * k; g.drawImage(glow(16, '255,120,40'), R(ex) - 16, R(ey) - 16); });
  if (k > 0.5) for (let i = 0; i < 3; i++) { const t = (time * 4 + i / 3) % 1; rc(g, ex - 2 + i * 2, ey + 3 + t * 10, 1, 2, '#ff9a3c'); }   /* drips */
}
/* the line the ladle aims at: an orange marked stretch of rail (x0..x1 screen px) - brighter as the tell runs out */
export function ladleMark(g, x0, x1, y, k, time) {
  const on = Math.floor(time * 10) % 2; g.fillStyle = 'rgba(255,130,40,' + (0.2 + 0.4 * k).toFixed(2) + ')'; for (let x = x0; x < x1; x += 10) g.fillRect(x, y - 3, 6, 2);
  if (on && k > 0.4) { g.fillStyle = '#ffd36b'; for (let x = x0 + 5; x < x1; x += 20) g.fillRect(x, y - 4, 2, 1); }
}
/* the glob in the air */
export function slagGlob(g, x, y, time) { rc(g, x - 3, y - 3, 6, 6, '#ff7a2a'); rc(g, x - 2, y - 3, 4, 2, '#ffd36b'); add(g, () => { g.globalAlpha = 0.6; g.drawImage(glow(12, '255,120,40'), x - 12, y - 12); }); }
/* THE POOL on the line: a red-orange strip, crusting as it cools (life 1..0) */
export function slagPool(g, x, y, w, life, time) {
  const l = Math.max(0, Math.min(1, life)), x0 = R(x - w / 2); rc(g, x0, y - 3, w, 4, l > 0.3 ? '#c8401a' : '#5a2a1a');
  for (let i = 0; i < w; i += 5) { const f = 0.5 + 0.5 * Math.sin(time * 6 + i); rc(g, x0 + i, y - 3, 4, 1, f > 0.5 && l > 0.2 ? '#ffb040' : '#8a3a1a'); }
  add(g, () => { g.globalAlpha = 0.5 * l; g.drawImage(glow(R(w / 2 + 6), '255,110,40'), R(x) - R(w / 2 + 6), y - R(w / 2 + 6)); });
  for (let i = 0; i < 3; i++) { const t = (time * 1.2 + i / 3) % 1; g.fillStyle = 'rgba(200,180,160,' + (0.35 * (1 - t) * l).toFixed(2) + ')'; g.fillRect(x0 + 6 + i * 12, R(y - 6 - t * 14), 3, 3); }   /* steam */
}

/* ================= DEEP RAILS 6 ART (claude/deeprails6art, Sonnet): the polish pass over the greybox above. Art only: no hit box, timing or tune is read or changed here. ================= */
/* a hard 1 px line (Bresenham, no antialiasing), w px thick */
function pline(g, x0, y0, x1, y1, w, col) { x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); g.fillStyle = col; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (let n = 0; n < 400; n++) { g.fillRect(x0, y0, w, w); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
/* THE GOBLIN DRIVER (Daniel 10-29: 'the goblin in the cart looks low-poly / off'): a hand-set 22 x 15 sprite in the cab window - a mining helm with a lit lamp and a rust streak, a 3/4 face
   looking back at you (brows, slit-pupil red eyes, a flat nose, tusks and a snarl), big ears, a knotted red rag at the collar, a leather jerkin with a strap, a hand on the lever. The game's
   screen is the pixel (640 x 360), so 'finer' is more pixels spent on the face: this head is 13 x 12 against the old 10 x 9, with a dark outline so it reads against the amber glass. */
const GD_PAL = { h: '#a08a70', H: '#5e4a3a', r: '#a8622a', V: '#fff0b0', l: '#d0b898', g: '#2c5524', G: '#4a7a30', L: '#6aa048', B: '#10260f', N: '#1f3a18', I: '#b0645a', E: '#ff4a30', P: '#1a0606', M: '#1a0808', T: '#f0e8cc', J: '#3a281a', j: '#5e4630', S: '#a0702c', R: '#a02a22', q: '#e0603e', y: '#9acc66' };
const GD_ROWS = [
  '......................',
  '........lhhhhhh.......',
  '.......hhHHHHHHh......',
  '.....VHhHHrHHHHHHh....',
  '....hhhhhhhhhhhhhhh.gg',
  '.....ggBBggggBBggg.ggg',
  '..gg.gLPEEggPEEgLggg..',
  '.gIIgGGGGNNGGGGGGgIg..',
  '..g..gGGGNNNGGGGGggg..',
  '.....gMTMMMMMMMTMg....',
  '.....gGgMTMTMTMgGg....',
  '......gGGGGGGGGGg.....',
  '....RRqRRRRRRRRqRR....',
  '..JjJJJJJJSJJJJJJJjJ..',
  '.JJJJjJJJJSJJJJJJJjJJJ',
];
for (let i = 0; i < GD_ROWS.length; i++) if (GD_ROWS[i].length !== 22) throw new Error('goblin driver row ' + i + ' is ' + GD_ROWS[i].length);
/* (wx, wy) = the window's top-left (inside the frame), w x h = 22 x 15; o: { jam, slump, look, time } */
export function goblinDriver(g, wx, wy, o) {
  const time = o.time || 0, jam = !!o.jam, slump = o.slump > 0.5;
  /* the glass: a warm gradient, a light streak, grime (dim when the lamp is out: slumped = bright gold alarm glass) */
  const bands = jam ? ['#ffe27a', '#ffd36b', '#f0b840', '#d8982c'] : ['#f6cf74', '#eab050', '#d89238', '#b87428'];
  for (let i = 0; i < 4; i++) rc(g, wx, wy + R(i * 3.75), 22, i === 3 ? 15 - 11 : 4, bands[i]);
  rc(g, wx + 2, wy + 1, 1, 6, 'rgba(255,248,210,0.55)'); rc(g, wx + 19, wy + 8, 1, 5, 'rgba(90,50,10,0.35)');
  const bob = !slump && Math.floor(time * 9) % 4 === 0 ? 1 : 0, dy = slump ? 3 : 0, dx = slump ? 1 : 0;   /* the engine shakes his head a pixel on a beat; slumped, his head is down */
  const blink = (time % 3.7) < 0.12, glance = o.look || (time % 5.3) > 4.9;
  g.save(); g.beginPath(); g.rect(wx, wy, 22, 15); g.clip();
  const rows = GD_ROWS.map((s, i) => { if (i === 6) { if (slump || blink) return '..gg.gLBBBggBBBgLggg..'; if (glance) return '..gg.gLEEPggEEPgLggg..'; } if (slump && (i === 9 || i === 10)) return i === 9 ? '.....gMMMMMMMMMMg.....' : '.....gGgMMTTMMgGg.....'; return s; });
  const grid = rows.map((s, i) => { const yo = i < 12 ? bob + dy : 0, xo = i < 12 ? dx : 0; return { s, yo, xo }; });
  /* the outline first (every empty cell touching a sprite cell), then the sprite */
  const solid = (r, c) => r >= 0 && r < 15 && c >= 0 && c < 22 && rows[r][c] !== '.';
  g.fillStyle = 'rgba(22,12,6,0.85)';
  for (let r = 0; r < 15; r++) { const { yo, xo } = grid[r]; for (let c = 0; c < 22; c++) { if (rows[r][c] !== '.') continue; if (solid(r - 1, c) || solid(r + 1, c) || solid(r, c - 1) || solid(r, c + 1)) g.fillRect(wx + c + xo, wy + r + yo, 1, 1); } }
  for (let r = 0; r < 15; r++) { const { s, yo, xo } = grid[r]; for (let c = 0; c < 22; c++) { const ch = s[c]; if (ch === '.') continue; g.fillStyle = GD_PAL[ch]; g.fillRect(wx + c + xo, wy + r + yo, 1, 1); } }
  /* light from the lamp on the near cheek, a cheek-bone highlight, rust flecks on the helm */
  if (!slump) { rc(g, wx + 6, wy + 7 + bob, 1, 1, GD_PAL.y); rc(g, wx + 16, wy + 7 + bob, 1, 1, GD_PAL.L); rc(g, wx + 9, wy + 3 + bob, 1, 1, '#c8803a'); }
  /* his lamp: lit (flickers); out when slumped */
  if (!slump) add(g, () => { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 11) * Math.sin(time * 3.1); g.drawImage(glow(8, '255,240,170'), wx + 5 - 8, wy + 3 + bob - 8); });
  /* the rag's tails flutter in the engine's draught */
  rc(g, wx + 4 + (Math.floor(time * 6) % 2), wy + 13, 2, 1, GD_PAL.R); rc(g, wx + 18 - (Math.floor(time * 6 + 1) % 2), wy + 13, 2, 1, GD_PAL.q);
  /* a hand on the lever: the lever rocks with the cab (slumped: the hand slides off) */
  const lv = slump ? 0 : Math.floor(time * 5) % 3 === 0 ? 1 : 0;
  rc(g, wx + 19 + lv, wy + 7, 1, 7, MP.i4); rc(g, wx + 19 + lv, wy + 7, 1, 1, MP.i5); rc(g, wx + 18 + lv, wy + 5, 3, 3, '#d8261c'); rc(g, wx + 18 + lv, wy + 5, 3, 1, '#ff7a6a');
  rc(g, wx + (slump ? 17 : 17 + lv), wy + (slump ? 13 : 11), 4, 2, GD_PAL.G); rc(g, wx + (slump ? 17 : 17 + lv), wy + (slump ? 13 : 11), 4, 1, GD_PAL.L);   /* his hand (green, three knuckles) */
  g.restore();
}
