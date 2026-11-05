// tools/harpy-women-sheet.mjs - node-only contact sheets for the harpy-women redraw (claude/harpyart2). NO browser.
//   node tools/harpy-women-sheet.mjs <out-prefix> [scale]  -> <prefix>-zoom.png (sisters, big), <prefix>-mock.png (1x in the Rookery sky colour AND 3x), <prefix>-small.png (gust/gale/carrier/crag)
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }
const SA = await import('../src/redraw/shriek_sisters_art.js'), HS = await import('../src/shriek-sisters-hands.js'), GA = await import('../src/redraw/gale_harpy_art.js'), RF = await import('../src/redraw/rookery_foes.js'), F1 = await import('../src/redraw/foes1.js');
const out = process.argv[2], S = +process.argv[3] || 3;
const up = (c, s) => { const o = newCanvas(c.width * s, c.height * s), g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * s, c.height * s); return o; };
const SS = SA.SHEET(HS.POSE);
const roles = ['diver', 'shrieker', 'snatcher'], poses = ['hover', 'screamTell', 'scream', 'diveTell', 'stuck', 'snatchTell'];
const zoom = []; for (const r of roles) for (const p of ['hover', 'scream']) if (SS[r + '-' + p]) zoom.push(SS[r + '-' + p]);
savePNG(sheet(zoom.map(c => up(c, 3)), { maxW: 3 * 500 + 20, bg: '#554466', pad: 6 }), out + '-zoom.png');
const all = []; for (const r of roles) for (const p of poses) if (SS[r + '-' + p]) all.push(SS[r + '-' + p]);
const x1 = sheet(all, { maxW: 6 * 165 + 10, bg: '#7aa0c8', pad: 4 });   /* 1x on a Rookery sky blue */
savePNG(x1, out + '-mock1x.png'); savePNG(up(x1, 2), out + '-mock2x.png');
const small = []; for (const set of [GA.bakeGustHarpy(), GA.bakeGaleHarpy(), GA.bakeCarrierHarpy(), RF.bakeCragHarpy(), RF.bakeShrieker(), F1.bakeHarpy()]) for (const c of set.R) small.push(c);
const sm = sheet(small, { maxW: 6 * 60 + 10, bg: '#7aa0c8', pad: 4 }); savePNG(sm, out + '-small1x.png'); savePNG(up(sm, 3), out + '-small3x.png');
console.log('ok', all.length, small.length);
