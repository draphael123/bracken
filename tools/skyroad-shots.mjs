// tools/skyroad-shots.mjs - THE SKY ROAD's pictures (claude/skyroad, the greybox), for the reviewer and Daniel's look before art. Not in the suite.
//   work/claude/skyroad/full-level.png   the whole level drawn by the game itself (frames from BK.look stitched), half size, the sections named
//   work/claude/skyroad/<n>-*.png        moments: a thermal ride, the glide, the reel, the roost chain, the disc road, the spans, the Eyrie
// God mode (a picture, not a playtest). usage: node tools/skyroad-shots.mjs [full|moments|all]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const want = process.argv[2] || 'all';
const out = join(ROOT, 'work/claude/skyroad'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [], WANT = ${JSON.stringify(want)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'skyroad'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name, note) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png'), note]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    if (WANT === 'all' || WANT === 'full') {
      fresh(); BK.sim(10); const S = BK.skyroad(); for (const id of ['s1', 's2', 's3', 's4', 's5']) S.setStone(id, true);
      const L = BK.L, W = L.W * TS, H = L.H * TS, big = document.createElement('canvas'); big.width = W / 2; big.height = H / 2 + 28; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false;
      bg.fillStyle = '#0c0e10'; bg.fillRect(0, 0, big.width, big.height);
      const VW = BK.view.VW, VH = BK.view.VH;
      for (let y = 0; y < H + VH; y += VH - 20) for (let x = 0; x < W + VW; x += VW - 20) { const v = BK.look(Math.min(L.W - 2, Math.floor((x + VW / 2) / TS)), Math.min(L.H - 2, Math.floor((y + VH * 0.6) / TS)));
        BK.sim(1); BK.step(1); bg.drawImage(BK.buf, 0, 0, VW, VH, v.cx / 2, v.cy / 2 + 28, VW / 2, VH / 2); }
      bg.fillStyle = '#0c0e10'; bg.fillRect(0, 0, big.width, 28); bg.font = 'bold 11px monospace'; bg.textBaseline = 'top';
      const secs = [['THE MESA STEPS', 0, 'teach: rise, cloud'], ["THE RIDERS' STATION", 104, 'cloak, stone; SET PIECE A: the kite reel'], ['THE HARPY ROOSTS', 190, 'test + remix: the chain'], ['THE BROKEN SKY BRIDGE', 298, 'SET PIECE B: the disc; EXAM: the spans'], ['THE EYRIE', 388, 'THE ROC']];
      for (const [n, x, b] of secs) { bg.fillStyle = '#4a7ad0'; bg.fillRect(x * 8, 0, 2, big.height); bg.fillStyle = '#e8dcc0'; bg.fillText(n, x * 8 + 4, 2); bg.fillStyle = '#ffd36b'; bg.fillText(b, x * 8 + 4, 14); }
      for (const e of L.ents) { const mk = e.t === 'check' ? '#40e060' : e.t === 'silver' ? '#ffd34a' : e.t === 'stray' ? '#ff9a5c' : null; if (!mk) continue; bg.strokeStyle = mk; bg.lineWidth = 2; bg.strokeRect(e.x * 8 - 6, e.y * 8 + 28 - 10, 16, 16); }
      res.push(['full-level', big.toDataURL('image/png'), 'the whole level, every stone turned (checkpoints green, silvers gold, kite cloths orange)']);
    }
    if (WANT === 'all' || WANT === 'moments') {
      fresh(); BK.tp(34, 51); run(50); snap('1-thermal-one', 'THE MESA STEPS: riding thermal one up the face of mesa A');
      fresh(); BK.tp(97, 33); run(10); BK.tp(103, 33); run(4); BK.keys.right = true; BK.keys.jump = true; run(50); BK.keys.right = false; BK.keys.jump = false; snap('2-the-glide', "THE RIDERS' STATION: the cloak taken, gliding the first gap");
      fresh(); BK.tp(139, 25); BK.skyroad().setStone('s2', true); run(130); snap('3-the-kite-reel', 'THE GREAT KITE REEL: the chimney hot, the kite up, the cage hauled');
      fresh(); BK.skyroad().setStone('s3', true); BK.tp(212, 17); run(60); snap('4-the-roosts', 'THE HARPY ROOSTS: roost two, its stone turned, the chain and the cloud bank');
      fresh(); BK.tp(294, 17); BK.P.face = 1; BK.press('atk'); run(80); snap('5-the-disc-road', 'THE SUN-DISC struck: the road of thermals over the chasm');
      fresh(); BK.tp(351, 19); run(30); snap('6-the-spans', 'THE EXAM: span A counting down, its stone, R5, span B');
      fresh(); BK.tp(400, 17); run(150); snap('7-the-eyrie', 'THE EYRIE: the Roc wakes');
    }
    return res; })()`, 900000);
  for (const [name, data, note] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(data.split(',')[1], 'base64')); console.log(name + '.png  ' + note); }
} finally { await pg.close(); }
