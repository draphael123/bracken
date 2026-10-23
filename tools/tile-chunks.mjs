// tools/tile-chunks.mjs - THE TILE CHUNKS DRAW WHAT THE PER-TILE LOOP DREW (claude/kingsfix).
// src/main.js drawTileChunks() blits 8x8-tile chunk canvases instead of ~550 sixteen-pixel drawImage calls. This loads levels, parks the hero at several spots (normal view and the
// boss view, which zooms out to 640x360), draws frames with BK.tileChunks(false) (the per-tile path) and with it on, and compares the display canvas pixel for pixel. A frame has
// pixels that move on their own between two draws (fire, smoke, bees), so any pixel that differs between two draws of the SAME path is masked out; every other pixel must match.
// The first 24 display pixels at the left/top edge are not compared: a sprite that overhangs its cell by 2 px from the column left of the view is one the per-tile loop never drew.
//   PORT=<n> node tools/tile-chunks.mjs        TC_LEVELS=kings,wood (default: a spread of kits)        fails when any unmasked pixel differs
import { openPage } from './cdp.mjs';
const LEVELS = (process.env.TC_LEVELS || 'kings,wood,welltown,redgorge,marsh,storm,desert,mage,sporewood,waymeet').split(',');
const SPOTS = [0.08, 0.3, 0.55, 0.8];
const pg = await openPage({ audio: false, fonts: false });
const E = (x, t = 120000) => pg.evalp(x, t);
const fails = [], rows = []; let skipped = 0;
try {
  const ids = await E("import('/src/level.js').then(m => m.LEVELS.map(l => l.id))");
  for (const id of LEVELS) {
    if (!ids.includes(id)) { skipped++; continue; }
    for (const zoom of [false, true]) for (const f of SPOTS) {
      let res; for (let attempt = 0; attempt < 2; attempt++) { res = await E(`(async () => { const { LEVELS } = await import('/src/level.js'); const li = LEVELS.findIndex(l => l.id === ${JSON.stringify(id)}); BK.load(li); BK.state = 'play'; BK.god = true; BK.setView('normal'); BK.step(2);
        const P = BK.P, L = BK.L, w = L.W * 16; P.x = Math.max(200, Math.min(w - 200, Math.floor(w * ${f}) + 8)); BK.step(1); BK.setView(${zoom ? "'zoom'" : "'normal'"}); BK.step(240);
        const cv = document.getElementById('c'), c2 = cv.getContext('2d'), W = cv.width;
        const seed = () => { performance.now = () => 5000; Date.now = () => 1700000000000; let x = 12345; Math.random = () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; };
        const grab = () => { seed(); BK.draw1(); return c2.getImageData(0, 0, cv.width, cv.height).data; };
        BK.tileChunks(false); grab(); const a = grab(), a2 = grab(), a3 = grab(); BK.tileChunks(true); grab(); const b = grab(), b2 = grab();
        let moving = 0, bad = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let i = 0; i < a.length; i += 4) { const x = (i / 4) % W, y = Math.floor(i / 4 / W); const ne = (p, q) => p[i] !== q[i] || p[i + 1] !== q[i + 1] || p[i + 2] !== q[i + 2];
          if (ne(a, a2) || ne(a2, a3) || ne(b, b2)) { moving++; continue; } if (x < 24 || y < 24) continue;
          if (ne(a, b)) { bad++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
        return { moving, bad, box: [x0, y0, x1, y1], st: BK.tileChunkStats(), size: cv.width + 'x' + cv.height, view: [BK.P.x | 0] }; })()`).catch(e => ({ err: String(e) })); if (res.err || !res.bad) break; }   /* (a mote that blinks between two draws can slip the mask once: a real difference shows twice) */
      if (res.err) { fails.push(id + ': ' + res.err); break; }
      rows.push({ id, zoom, f, ...res });
      console.log((id + (zoom ? ' zoom' : '')).padEnd(16), String(f).padEnd(5), res.size, 'moving', String(res.moving).padStart(6), 'DIFF', res.bad, res.bad ? JSON.stringify(res.box) : '', JSON.stringify(res.st));
      if (res.bad) fails.push(id + (zoom ? ' zoom' : '') + ' @' + f + ': ' + res.bad + ' pixels differ between the chunk path and the per-tile path, in ' + JSON.stringify(res.box));
    }
  }
  if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { await pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('tile chunks: the chunk path draws the per-tile path\'s pixels on ' + rows.length + ' frames (' + LEVELS.length + ' levels' + (skipped ? ', ' + skipped + ' not in this build' : '') + ').');
