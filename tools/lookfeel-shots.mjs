/* tools/lookfeel-shots.mjs [level,level,...] - THE LOOK-AND-FEEL REVIEW'S CAMERA (docs/look-and-feel/wood-to-highcrown.md).
   Not a check (not in tools/check.mjs): a capture script. For each level it walks the real page along the pacing route
   (tools/pacing.mjs, the same route the review reads) and saves the page's own 320x180 buffer at 2x:
     00 the opening (the title card over the first screen), 01-NN evenly along the route (foes left alive, god mode),
     the mini room and the boss arena once the fight is up, the kill, and the win card.
   Beside every picture it records what the page is playing (music wanted, ambience) and the screen's value numbers
   (L* spread p10-p90, median chroma, warm-minus-cool share: docs/art-direction.md's measures, approximated in the page),
   into work/lookfeel/shots.json. Pictures go to work/lookfeel/<level>-NN-<what>.png.
   One headless Chrome, closed at the end (tools/cdp.mjs). */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';

const ALL = ['wood', 'marsh', 'stockade', 'burning', 'spore', 'kings', 'underleaf', 'scree', 'hanging', 'shopCrag', 'spire', 'moor', 'oreroad', 'storm', 'crown'];
const want = process.argv[2] ? process.argv[2].split(',') : ALL;
const N = +(process.env.SHOTS || 10);
const out = join(ROOT, 'work/lookfeel'); mkdirSync(out, { recursive: true });
const jsonPath = join(out, 'shots.json');
const log = existsSync(jsonPath) ? JSON.parse(readFileSync(jsonPath, 'utf8')) : {};

/* the numbers, measured in the page on the 320x180 buffer: sRGB -> L*a*b* (D65) */
const STATS = `(() => { const c = BK.buf, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; const Ls = [], Cs = []; let warm = 0, cool = 0, n = 0;
  const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  for (let i = 0; i < d.length; i += 8) { const r = lin(d[i]), gg = lin(d[i + 1]), b = lin(d[i + 2]);
    const X = (0.4124 * r + 0.3576 * gg + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * gg + 0.0722 * b, Z = (0.0193 * r + 0.1192 * gg + 0.9505 * b) / 1.08883;
    const L = 116 * f(Y) - 16, A = 500 * (f(X) - f(Y)), B = 200 * (f(Y) - f(Z)), C = Math.hypot(A, B), h = (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
    Ls.push(L); Cs.push(C); n++; if (C > 6) { if (h < 100 || h > 330) warm++; else if (h > 150 && h < 300) cool++; } }
  Ls.sort((a, b) => a - b); Cs.sort((a, b) => a - b); const q = (a, p) => a[Math.floor(a.length * p)];
  return { spread: +(q(Ls, 0.9) - q(Ls, 0.1)).toFixed(1), meanL: +(Ls.reduce((s, v) => s + v, 0) / n).toFixed(1), chroma: +q(Cs, 0.5).toFixed(1), warmth: +((warm - cool) / n).toFixed(2) }; })()`;
const SNAP = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
const AUD = `(() => { const a = BK.audio(); return { music: a.wantTrack, amb: a.ambKind }; })()`;

const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 16000 }); return true; })()`);
  for (const id of want) {
    const idx = LEVELS.findIndex(l => l.id === id); if (idx < 0) { console.log('no level', id); continue; }
    const rows = log[id] = [];
    let n = 0;
    const save = async (what, extra = {}) => {
      const r = await pg.evalp(`({ png: ${SNAP}, st: ${STATS}, au: ${AUD}, p: [Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)], state: BK.state })`);
      const f = id + '-' + String(n++).padStart(2, '0') + '-' + what + '.png';
      writeFileSync(join(out, f), Buffer.from(r.png.split(',')[1], 'base64'));
      rows.push({ f, what, at: r.p, state: r.state, ...r.st, ...r.au, ...extra });
      console.log(f.padEnd(34), JSON.stringify({ at: r.p, ...r.st, ...r.au }));
    };
    const boot = `(() => { BK.load(${idx}); BK.start(); BK.god = true; return true; })()`;
    /* 00: THE OPENING - the title card at full strength over the first screen (the banner fades in over 0.4 s of its 2.6) */
    await pg.evalp(boot); await pg.evalp(`(() => { for (let k = 0; k < 50; k++) BK.step(1); return true; })()`);
    await save('opening');
    if (id.startsWith('shop')) { await pg.evalp(`(() => { for (let k = 0; k < 200; k++) BK.step(1); return true; })()`); await save('inside'); continue; }
    /* 01..N: ALONG THE ROUTE, in the order it is walked, stopping short of the arena. The level is reloaded for every picture: an ambush
       room that shuts on one spot holds the hero in it, and every later teleport lands back inside its walls */
    const P = pacing(LEVELS[idx]); const route = P.route, cum = [0];
    for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
    const L = await pg.evalp(`(() => { const L = BK.L; return { arena: L.arena ? { trigger: L.arena.trigger, floor: L.arena.floor, x0: L.arena.x0, y0: L.arena.y0 } : null, mini: L.mini ? { trigger: L.mini.trigger, floor: L.mini.floor, x0: L.mini.x0 } : null }; })()`);
    const stopAt = (() => { if (!L.arena) return cum[cum.length - 1]; const tx = L.arena.x0 / 16; const i = route.findIndex(([x, y]) => x >= tx - 2 && (!L.arena.y0 || Math.abs(y - L.arena.floor / 16) < 8)); return i > 0 ? cum[i] : cum[cum.length - 1]; })();
    for (let k = 0; k < N; k++) {
      const d = stopAt * (k + 0.5) / N; let i = cum.findIndex(c => c >= d); if (i < 0) i = route.length - 1;
      const [x, y] = route[i];
      await pg.evalp(boot); await pg.evalp(`(() => { BK.sim(200); BK.tp(${x}, ${y}); BK.sim(30); for (let k = 0; k < 90; k++) BK.step(1); return true; })()`);
      await save('route' + (k + 1), { routeTile: Math.round(d) });
    }
    /* THE MINI ROOM, then THE ARENA: step in, let the fight come up and the music hand over */
    for (const [key, what] of [['mini', 'mini'], ['arena', 'boss']]) { const A = L[key]; if (!A) continue;
      await pg.evalp(boot); await pg.evalp(`(() => { BK.sim(200); BK.tp(${Math.round(A.trigger / 16) + 3}, ${Math.round(A.floor / 16) - 1}); BK.sim(20); for (let k = 0; k < 200; k++) BK.step(1); return true; })()`);
      await save(what);
    }
    /* THE END: the boss dies; what the next few seconds look like, and the card */
    if (L.arena) {
      const r = await pg.evalp(`(() => { const s = BK.slay(); for (let k = 0; k < 60; k++) BK.step(1); return String(s); })()`);
      await save('kill', { slay: r });
      await pg.evalp(`(() => { for (let k = 0; k < 600 && BK.state === 'play'; k++) BK.step(1); for (let k = 0; k < 90; k++) BK.step(1); return true; })()`);
      await save('after');
    }
  }
  writeFileSync(jsonPath, JSON.stringify(log, null, 1));
  console.log('errors', JSON.stringify([...new Set(pg.errors)].slice(0, 8)));
} finally { await pg.close(); }
