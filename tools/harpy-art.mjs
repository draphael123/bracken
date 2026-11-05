// tools/harpy-art.mjs - THE HARPY PASS's art, rendered and linted in Node (claude/harpyart). No browser.
//   node tools/harpy-art.mjs [out-prefix] -> <prefix>-harpies.png (gust + carrier sheets), <prefix>-sisters.png (the three harpy-women), <prefix>-fx.png (egg, lane, blast)
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }
const GA = await import('../src/redraw/gale_harpy_art.js'), SA = await import('../src/redraw/shriek_sisters_art.js'), HF = await import('../src/redraw/harpy_fx_art.js'), HS = await import('../src/shriek-sisters-hands.js');
const bad = []; let n = 0; const out = process.argv[2];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
const GU = GA.bakeGustHarpy(), CA = GA.bakeCarrierHarpy(), GL = GA.bakeGaleHarpy();
if (GU.R.length !== 6) bad.push('gust: ' + GU.R.length + ' frames (6)'); if (CA.R.length !== 8) bad.push('carrier: ' + CA.R.length + ' frames (8)');
for (const [nm, S] of [['gust', GU], ['carrier', CA]]) { const s = S.R.map(sig); n += s.length; s.forEach((q, i) => { if (q.k < 150) bad.push(nm + ' ' + i + ': barely drawn'); for (let j = 0; j < i; j++) if (s[j].h === q.h) bad.push(nm + ' ' + i + ' == ' + j); });
  S.white.R.forEach((c, i) => { if (sig(c).k !== s[i].k) bad.push(nm + ' ' + i + ': flash silhouette differs'); }); }
if (sig(GU.R[0]).h === sig(GL.R[0]).h) bad.push('gust hover == gale hover (same colours)');
if (sig(GU.R[4]).h === sig(GU.R[2]).h) bad.push('gust: tell == clap (B16)');
if (out) savePNG(big([...GU.R, ...CA.R], { maxW: 8 * 50, bg: '#46506a', pad: 4 }, 2), out + '-harpies.png');
const SS = SA.SHEET(HS.POSE), ks = ['diver-hover', 'shrieker-hover', 'snatcher-hover', 'diver-screamTell', 'shrieker-screamTell', 'shrieker-scream', 'snatcher-snatchTell', 'diver-diveTell', 'diver-dive'].filter(k => SS[k]); n += ks.length;
if (!SA.WOMAN) bad.push('sisters: WOMAN flag off'); for (const k of ks) if (sig(SS[k]).k < 800) bad.push('sister ' + k + ': barely drawn');
if (out) savePNG(big(ks.map(k => SS[k]), { maxW: 3 * 165, bg: '#554466', pad: 4 }, 2), out + '-sisters.png');
const cell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#2a2a3a'; g.fillRect(0, 0, w, h); fn(g); return c; };
const fx = [cell(150, 40, g => { for (let i = 0; i < 5; i++) HF.drawEgg(g, 14 + i * 28, 34, i / 4.5, 0.2); }), cell(130, 40, g => HF.drawGustTell(g, 4, 20, 1, 120, 0.7, 0.3)), cell(150, 50, g => { HF.drawGustBlast(g, 30, 25, 1, 36, 1, false, 0.3); HF.drawGustBlast(g, 90, 25, 1, 36, 1, true, 0.3); })];
n += 3; for (const c of fx) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size < 4) bad.push('fx cell: ' + seen.size + ' colours'); }
if (out) savePNG(big(fx, { maxW: 320, bg: '#000', pad: 4 }, 3), out + '-fx.png');
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
