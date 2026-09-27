// work/claude/knight-shots.mjs - THE KNIGHT REWORK drawn by the REAL renderer (BK.step renders; the frame is BK.buf at 2x).
//   1-2  the wood's PERFECT GUARD lesson: the lesson swordsman's cut turned on the beat (the flash), then the riposte cut
//   3-4  a third cut thrown AGAINST A WALL, and one thrown ONTO THE SPIKES (rock and spikes laid on the wood's opening flat)
// usage: node work/claude/knight-shots.mjs    -> work/claude/kn-shot-<n>.png
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const pg = await openPage({ port: portFor(8), audio: false, fonts: false });
try {
  const shots = await pg.evalp(`(async () => {
    const LV = (await import('/src/level.js')), T = LV.T, i = LV.LEVELS.findIndex(l => l.id === 'wood'), res = [];
    const grab = label => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push({ label, d: c.toDataURL('image/png') }); };
    const load = () => { for (const k in BK.keys) BK.keys[k] = false; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = false; BK.sim(420); BK.P.hp = BK.P.maxHp; };
    load(); const L = BK.L, z = L.lessons.find(q => q.kind === 'parry'), sw = BK.enemies().find(e => e.t === 'swornsword' && e.lesson);
    for (const e of BK.enemies()) if (e !== sw && Math.abs(e.x - sw.x) < 400) e.alive = false;
    BK.tp(Math.round(sw.x / 16) - 3, Math.round(sw.y / 16) - 1); BK.P.face = 1; for (let k = 0; k < 60; k++) BK.step(1);
    let raised = false, got = false;
    for (let k = 0; k < 900 && !got; k++) { BK.P.hp = BK.P.maxHp; BK.P.face = Math.sign(sw.x - BK.P.x) || 1;
      if (sw.mode === 'cutTell' && sw.modeT < 0.05 && !raised) { BK.keys.block = true; raised = true; }
      if (sw.mode !== 'cutTell' && raised && !(BK.P.parryT > 0)) { raised = false; BK.keys.block = false; }
      BK.step(1); if (BK.P.parryT > 0 && BK.P.riposteHeavy) got = true; }
    BK.step(1); grab('the perfect guard: the flash, the star off the shield and the word' + (got ? '' : ' (NOT MET)'));
    BK.keys.block = false; BK.step(2); BK.press('atk'); for (let k = 0; k < 20 && !(BK.P.atk >= 0.06); k++) BK.step(1); grab('the riposte: a heavy cut out of the guard (heavySwing ' + BK.P.heavySwing + ')');
    /* the wood's OWN rock and spikes: a flat run of floor ending in a wall three tiles tall, or in spikes on the same row */
    const solid = (x, y) => L.grid[y * L.W + x] === 1, air = (x, y) => L.grid[y * L.W + x] === 0;
    const find = kind => { for (let x = 30; x < L.W - 10; x++) for (let y = 8; y < L.H - 1; y++) {
        let flat = true; for (let k = kind === 'spikes' ? -3 : -6; k <= 0; k++) flat = flat && solid(x + k, y) && air(x + k, y - 1) && air(x + k, y - 2);
        if (!flat) continue;
        if (kind === 'wall' && solid(x + 1, y - 1) && solid(x + 1, y - 2) && solid(x + 1, y - 3)) return [x - 3, y - 1, x];
        if (kind === 'spikes' && [0, 1].some(d => L.grid[(y + d) * L.W + x + 1] === T.SPIKE && L.grid[(y + d) * L.W + x + 2] === T.SPIKE) && air(x + 1, y - 1)) return [x - 2, y - 1, x]; } return null; };
    for (const kind of ['wall', 'spikes']) { load(); const at = find(kind); if (!at) { res.push({ label: kind + ': NO PLACE FOUND', d: 'x,' }); continue; }
      for (const e of BK.enemies()) if (Math.abs(e.x - at[0] * 16) < 300) e.alive = false;
      BK.tp(at[0], at[1]); BK.sim(40); BK.spawnEnt({ t: 'sprig', x: (BK.P.x + 18) / 16, y: at[1] }); const e = BK.enemies().at(-1); e.hp = 200; e.cd = 99; BK.P.face = 1; for (let k = 0; k < 10; k++) BK.step(1);
      e.x = BK.P.x + 18; BK.P.combo = 2; BK.P.swingEndT = BK.time; BK.P.lastSwingT = BK.time; BK.press('atk'); const n0 = BK.P.thirdPays || 0;
      const tr = []; for (let k = 0; k < 90 && (BK.P.thirdPays || 0) === n0; k++) { BK.step(1); if (k < 30 && k % 3 === 0) tr.push([k, +BK.P.atk.toFixed(2), BK.P.combo, !!BK.P.heavySwing, +(e.knock||0).toFixed(2), Math.round(e.x - BK.P.x), e.broken > 0 ? 'B' : '']); } console.log(kind, JSON.stringify(tr)); BK.step(2); grab('a third cut ' + (kind === 'wall' ? 'AGAINST THE WALL' : 'ONTO THE SPIKES') + ' at wood column ' + at[2] + ' (paid: ' + BK.P.thirdPayLast + ') ' + JSON.stringify(tr)); }
    return res; })()`, 900000);
  shots.forEach((s, j) => { const f = join(ROOT, 'work/claude', 'kn-shot-' + (j + 1) + '.png'); writeFileSync(f, Buffer.from(s.d.split(',')[1], 'base64')); console.log(f, '|', s.label); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
