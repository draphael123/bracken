// tools/canal-shots.mjs - THE FOG CANAL's pictures (claude/canal, greybox), for Daniel's look before art. Not in the suite.
//   work/claude/canal/full-level.png   the whole level drawn by the game itself (frames from BK.look stitched), half size, the sections named
//   work/claude/canal/map.png          the inland sheet of the world map, with the canal's node
//   work/claude/canal/1-..6-*.png      moments: the barge ride, a lock filling, the fog (and a horn clearing it), the weir chase in motion
//   work/claude/canal/weir-*.png       the weir run, frame by frame (IN MOTION: three frames a second apart)
// God mode (a picture, not a playtest). usage: node tools/canal-shots.mjs [full|moments|all]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const want = process.argv[2] || 'all';
const out = join(ROOT, 'work/claude/canal'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [], WANT = ${JSON.stringify(want)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'canal'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const C = () => BK.canal(), P = () => BK.P;
    const snap = (name, note) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png'), note]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    if (WANT === 'all' || WANT === 'full') {
      // ---- THE WHOLE LEVEL, stitched from the game's own frames (the fog off, so the ground reads) ----
      fresh(); C().noFog = true; BK.sim(10);
      const L = BK.L, W = L.W * TS, H = L.H * TS, big = document.createElement('canvas'); big.width = W / 2; big.height = H / 2 + 28; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false;
      bg.fillStyle = '#0c0e10'; bg.fillRect(0, 0, big.width, big.height);
      const VW = BK.view.VW, VH = BK.view.VH;
      for (let y = 0; y < H + VH; y += VH - 20) for (let x = 0; x < W + VW; x += VW - 20) { const v = BK.look(Math.min(L.W - 2, Math.floor((x + VW / 2) / TS)), Math.min(L.H - 2, Math.floor((y + VH * 0.6) / TS)));
        for (const f of C().fogs) { f.fade = 0; f.clear = 9999; } BK.step(1);
        bg.drawImage(BK.buf, 0, 0, VW, VH, v.cx / 2, v.cy / 2 + 28, VW / 2, VH / 2); }
      bg.fillStyle = '#0c0e10'; bg.fillRect(0, 0, big.width, 28); bg.font = 'bold 11px monospace'; bg.textBaseline = 'top';
      const secs = [['THE WAYMEET QUAY', 0, 'teach: barge, weed, grindylow'], ['FIRST LOCK + MILL', 68, 'teach: lock, bridge'], ['THE FOG BANK', 122, 'twist: barge; fog; horn'], ['THE FLIGHT', 186, 'develop: locks'],
        ['THE WEIR', 248, 'SET PIECE: the chase'], ['THE BASIN', 326, 'EXAM'], ["JENNY'S LOCK", 370, 'boss (reserved)']];
      for (const [n, x, b] of secs) { bg.fillStyle = '#4a7ad0'; bg.fillRect(x * 8, 0, 2, big.height); bg.fillStyle = '#e8dcc0'; bg.fillText(n, x * 8 + 4, 2); bg.fillStyle = '#ffd36b'; bg.fillText(b, x * 8 + 4, 14); }
      for (const e of L.ents) { const mk = e.t === 'check' ? '#40e060' : e.t === 'silver' ? '#ffd34a' : null; if (!mk) continue; bg.strokeStyle = mk; bg.lineWidth = 2; bg.strokeRect(e.x * 8 - 6, e.y * 8 + 28 - 10, 16, 16); }
      res.push(['full-level', big.toDataURL('image/png'), 'the whole level, fog lifted so the ground reads (checkpoints boxed green, silvers gold)']);
    }
    if (WANT === 'all' || WANT === 'moments') {
      // ---- 1. THE BARGE RIDE: aboard, under the towpath bargee, the low bridge ahead ----
      fresh(); BK.tp(40, 38); run(20); for (let i = 0; i < 120; i++) { BK.keys.down = true; BK.sim(1); } BK.keys.down = false; run(4); snap('1-the-barge-ride', 'THE WAYMEET POUND: riding the barge under the towpath, the low bridge ahead (duck)');
      // ---- 2. A LOCK FILLING: the barge in the first lock, the paddle struck, the water half up ----
      fresh(); const b = C().barge; b.x = 72 * TS; BK.tp(78, 38); run(10); const r1 = C().reaches.find(q => q.id === 'L1'); r1.to = 33 * TS + 4; run(70); snap('2-a-lock-filling', 'THE FIRST LOCK: the paddle up, the chamber filling, the barge and the hero rising to the mill pound');
      run(140); snap('2b-the-lock-full', 'THE FIRST LOCK, full: the upper gate open, the mill ahead');
      // ---- 3. THE FOG: at the fog wall, the barge held, a wisp; then the horn ----
      fresh(); b.x = 159 * TS; C().barge.x = 159 * TS; BK.tp(163, 29); run(40); snap('3-the-fog-wall', 'THE FOG WALL: the barge held at the thick bank; the horn on the bank, a wisp in the fog (cold green), lanterns (warm)');
      const h = C().horns[0]; h.cd = 0; for (const f of C().fogs) if (h.fogs.includes(f.id)) f.clear = 8; run(60); snap('3b-the-horn-clears-it', 'THE FOG WALL, the horn blown: the bank cleared for a while, the archer on the footbridge sees you now');
      // ---- 4. THE WEIR, IN MOTION: aboard at the summit, the gate bursts, three frames a second apart ----
      fresh(); const cb = C(); for (const id of ['L2', 'L3', 'L4']) { const q = cb.reaches.find(r => r.id === id); q.y = q.to = q.hi * TS + 4; } cb.bridges[2].across = false; cb.bridges[2].k = 1; cb.barge.x = 240 * TS; cb.barge.reach = cb.reaches.findIndex(r => r.id === 'P4');
      BK.tp(243, 16); run(30); cb.barge.helm = 'cut';
      for (let k = 0; k < 4; k++) { run(60); snap('4-weir-' + k, 'THE WEIR RUN, frame ' + (k + 1) + ' (a second apart): loose down the race, the flood behind, the low beams (ducked)'); if (k === 1) BK.keys.down = true; }
      BK.keys.down = false;
      // ---- 5. THE BASIN: the exam in the fog ----
      fresh(); C().barge.x = 326 * TS; BK.tp(333, 40); run(40); snap('5-the-basin-exam', 'THE THEATRE BASIN (exam): the thick fog, the bridge across, the island with the horn and the foreman, the theatre bridge archers, the weed');
      // ---- 6. THE ROOFTOPS: the barge gone on through the arch ----
      fresh(); C().barge.x = 136 * TS; BK.tp(137, 21); run(30); snap('6-the-rooftops', 'THE LONG ARCH: the barge goes on under the warehouses without you; over the rooftops, the light-well and its wisp');
    }
    return res; })()`, 900000);
  for (const [name, d, note] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/canal/' + name + '.png  -  ' + note); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
