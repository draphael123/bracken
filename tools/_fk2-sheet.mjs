// scratch (claude/frogking2): the Bullfrog King's frames on a contact sheet, in Node (tools/node-canvas.mjs + source-atop + rotate)
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs'; install();
const P = Object.getPrototypeOf(newCanvas(1, 1).getContext('2d'));
const put0 = P._put; P._put = function (i, c) { if (this.globalCompositeOperation === 'source-atop') { const d = this.data, k = i * 4; if (!d[k + 3]) return; const a = d[k + 3]; this.globalCompositeOperation = 'source-over'; put0.call(this, i, c); this.globalCompositeOperation = 'source-atop'; d[k + 3] = a; return; } return put0.call(this, i, c); };
P.rotate = function (a) { const m = this.m, c = Math.cos(a), s = Math.sin(a); this.m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; };
const F = await import('../src/redraw/frogking.js'); const set = F.bakeFrog();
const pick = (process.argv[3] || '').split(',').filter(Boolean).map(Number);
const items = (pick.length ? pick : set.R.map((_, i) => i)).flatMap(i => [set.R[i], set.p2.R[i]]);
savePNG(sheet(items, { maxW: 560, scale: 4, bg: '#3f6a7a' }), process.argv[2]); console.log('frames', set.R.length, 'mouth', JSON.stringify(set.mouth));
