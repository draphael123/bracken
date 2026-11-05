// tools/fire-drake-art.mjs - THE FIRE DRAKE's sprites rendered in Node (claude/drakeart): every POSE in src/fire-drake.js drawn, checked (one size, drawn, windup != release,
// chains' collar found), and laid out on a contact sheet. usage: node tools/fire-drake-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { POSE } = await import('../src/fire-drake.js');
const A = await import('../src/redraw/fire_drake_art.js');
const names = Object.keys(POSE), R = [], bad = [];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { n++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + (i >> 2)) >>> 0; } return { h, n }; };
const sigs = {};
for (const m of names) { const s = A.drakeSprite(m, POSE[m], 0.3, false); R.push(s.c); const q = sig(s.c); sigs[m] = q;
  if (s.c.width !== A.DRAKE_ANCHOR.w || s.c.height !== A.DRAKE_ANCHOR.h) bad.push(m + ': size'); if (q.n < 600) bad.push(m + ': barely drawn (' + q.n + ' px)');
  if (!s.collar || !s.jaw) bad.push(m + ': no collar/jaw');
  const w = A.drakeSprite(m, POSE[m], 0.3, true); if (sig(w.c).n !== q.n) bad.push(m + ': flash silhouette differs'); }
const PAIRS = [['clawTell', 'claw'], ['tailTell', 'tail'], ['sweepTell', 'sweep'], ['breathTell', 'breath'], ['lungeTell', 'lunge'], ['tearTell', 'takeoff'], ['diveTell', 'dive'], ['slamTell', 'slam']];
for (const [a, b] of PAIRS) if (sigs[a].h === sigs[b].h) bad.push(a + ' == ' + b + ' (windup and release look the same)');
const seen = new Map(); for (const m of names) { const k = sigs[m].h; if (seen.has(k)) bad.push(m + ' draws identically to ' + seen.get(k)); else seen.set(k, m); }
console.log(JSON.stringify({ poses: names.length, size: A.DRAKE_ANCHOR.w + 'x' + A.DRAKE_ANCHOR.h, bad: bad.length }));
for (const b of bad) console.log('FAIL: ' + b);
if (process.argv[2]) { const sh = sheet(R, { maxW: 5 * (A.DRAKE_ANCHOR.w + 8), bg: '#4a3a44', pad: 4 }); const scale = 2, out = newCanvas(sh.width * scale, sh.height * scale), g = out.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * scale, sh.height * scale); savePNG(out, process.argv[2]); console.log('sheet ' + process.argv[2] + ' order: ' + names.join(' ')); }
process.exit(bad.length ? 1 : 0);
