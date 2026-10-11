// tools/order-art-sheet.mjs - THE ROAD WARDENS' ART, LOOKED AT (claude/orderart): bakes the painter's sets in a bare page (no game boot) and writes
//   work/claude/shots/orderart/sheet.png   4 bodies x 3 built chapters x 12 frames (x3)
//   work/claude/shots/orderart/skins.png   every body in all ten chapters' palettes, frame 2 and 3
//   work/claude/shots/orderart/cards.png   the four bestiary portraits (8 frames each, x3)
//   work/claude/shots/orderart/fx.png      the FX sheet
// node tools/order-art-sheet.mjs [sheet,skins,cards,fx]      (PORT from the environment)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const want = (process.argv[2] || 'sheet,skins,cards,fx').split(','), dir = join(ROOT, 'work/claude/shots/orderart'); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, noWait: true });
const save = (name, url) => { writeFileSync(join(dir, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote work/claude/shots/orderart/' + name + '.png'); };
const wait = ms => new Promise(r => setTimeout(r, ms));
try {
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/tools/order-art-lab.html' }); await wait(1500);
  const head = `const OA = await import('/src/redraw/order_art.js'), OC = await import('/src/order-chapters.js'), OK = await import('/src/order-knights.js');
    OA.LENIENT.on = true; const T = ['oathblade', 'oathmaul', 'oathlance', 'oathmage'], mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#56606c'; g.fillRect(0, 0, w, h); g.font = 'bold 12px monospace'; return [c, g]; };`;
  if (want.includes('sheet')) save('sheet', await pg.evalp(`(async()=>{${head}
    const S = 3, CH = ['forest', 'marsh', 'mine'], cw = OA.W * S, ch = OA.H * S, [c, g] = mk(70 + 12 * cw, T.length * CH.length * ch); let row = 0;
    for (const t of T) for (const k of CH) { const set = OK.bakeSet(t, k); g.fillStyle = '#fff'; g.fillText(t.slice(4), 4, row * ch + 16); g.fillText(OC.CHAPTERS[k].id, 4, row * ch + 32);
      set.R.forEach((f, i) => { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(70 + i * cw, row * ch + OA.AY * S, cw, S); g.drawImage(f, 70 + i * cw, row * ch, f.width * S, f.height * S); }); row++; }
    return c.toDataURL('image/png'); })()`, 120000));
  if (want.includes('close')) save('close', await pg.evalp(`(async()=>{${head}
    const S = 6, F = [0, 2, 3, 6, 9, 11], [c, g] = mk(F.length * 92 * S / 1.6, 4 * 72 * S / 1.6 * 0.8); const cw = 92 * S / 1.6, ch = 72 * S / 1.6 * 0.8;
    T.forEach((t, r) => { const set = OK.bakeSet(t, 'forest'); F.forEach((i, j) => { const f = set.R[i]; g.drawImage(f, 24, 14, 66, 56, j * cw, r * ch, 66 * S, 56 * S); }); });
    return c.toDataURL('image/png'); })()`, 120000));
  if (want.includes('skins')) save('skins', await pg.evalp(`(async()=>{${head}
    const S = 3, KS = Object.keys(OC.CHAPTERS), cw = OA.W * S, ch = OA.H * S, [c, g] = mk(70 + 8 * cw, KS.length * ch * 2); let row = 0;
    for (const k of KS) for (const [a, b] of [['oathblade', 'oathmaul'], ['oathlance', 'oathmage']]) { g.fillStyle = '#fff'; g.fillText(OC.CHAPTERS[k].id, 4, row * ch + 16);
      [[a, 2], [a, 3], [b, 2], [b, 3]].forEach(([t, i], j) => { const set = OK.bakeSet(t, k); g.drawImage(set.R[i], 70 + j * 2 * cw, row * ch, set.R[i].width * S, set.R[i].height * S); }); row++; }
    return c.toDataURL('image/png'); })()`, 120000));
  if (want.includes('cards')) save('cards', await pg.evalp(`(async()=>{${head}
    const S = 3, [c, g] = mk(8 * 76 * S, 4 * 64 * S);
    T.forEach((t, r) => { const set = OK.bakeCardFor ? OK.bakeCardFor(t) : null; if (set) set.R.forEach((f, i) => g.drawImage(f, i * 76 * S, r * 64 * S, f.width * S, f.height * S)); });
    return c.toDataURL('image/png'); })()`, 120000));
  console.log('overflow:', JSON.stringify([...new Set(await pg.evalp(`(async()=>(await import('/src/redraw/order_art.js')).LENIENT.log)()`))]));
  if (want.includes('fx')) save('fx', await pg.evalp(`(async()=>{${head}
    const S = 4, fx = OA.bakeFx(), [c, g] = mk(1500, 640); let x = 8, y = 8; const put = (cv, dx = 0) => { g.drawImage(cv, x, y, cv.width * S, cv.height * S); x += cv.width * S + 6; };
    for (const k in fx.bolt) fx.bolt[k].forEach(f => put(f)); x = 8; y += 70; fx.glint.forEach(f => put(f)); fx.vine.seg.forEach(f => put(f)); put(fx.vine.tip); fx.snare.forEach(f => put(f)); x = 8; y += 90;
    fx.mud.mid.forEach(f => put(f)); put(fx.mud.l); put(fx.mud.r); fx.rust.mid.forEach(f => put(f)); fx.rust.flake.forEach(f => put(f)); fx.snuff.forEach(f => put(f)); put(fx.stud.whole); put(fx.stud.cracked); fx.wood.chips.forEach(f => put(f)); put(fx.wood.gash); x = 8; y += 90; put(OA.trunkFor(60).c);
    x = 8; y += 90; for (const k in OC.CHAPTERS) { const fr = OA.bakeBanner(OC.CHAPTERS[k].pal); put(fr[0]); put(fr[2]); put(fr[4]); } return c.toDataURL('image/png'); })()`, 120000));
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { await pg.close(); }
