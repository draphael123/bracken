// tools/dr5-art-shots.mjs - DEEP RAILS 5's art-pass pictures (claude/dr5art). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8934 node tools/dr5-art-shots.mjs <tag> [name,name]  -> work/claude/dr5-art/<tag>/*.png (2x frames from the game's canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', only = (process.argv[3] || '').split(',').filter(Boolean);
const out = join(ROOT, 'work/claude/dr5-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const only = ${JSON.stringify(only)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const snap = (name) => { if (only.length && !only.includes(name)) return; const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(document.querySelector('canvas'), 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const foot = (name, x, row) => { BK.tp(x, row - 1); run(12); BK.look(x, row - 1); snap(name); };
    for (const [n, x, row] of [['01-pits-teach', 984, 30], ['02-pits-catwalk', 995, 26], ['03-pits-test', 1006, 30], ['04-pits-remix', 1018, 26], ['05-pits-exam', 1034, 26], ['06-pits-brute', 1047, 30], ['07-pits-cart', 1060, 30], ['08-pits-start', 973, 30], ['09-pit-floor', 987, 34], ['10-pit-exam', 1031, 34], ['11-tipple', 1052, 30]]) foot(n, x, row);
    /* THE FOREMAN's boom and tipped ore; the parked-cart gates */
    { const M0 = BK.L.mini; BK.tp(M0.x0 / 16 + 8, M0.floor / 16 - 2); run(30); const fm = BK.minecart().foreman();
      if (fm) { const S2 = fm.S, e2 = fm.e; const fz = (name, fn) => { if (only.length && !only.includes(name)) return; fn(); BK.P.hp = BK.P.maxHp; BK.sim(1); BK.look(BK.P.x / 16, BK.P.y / 16); snap(name); };
        const FM = 1; fz('17-boom-tell', () => { S2.mode = 'boomTell'; S2.mT = 0.5; }); fz('18-boom-swing', () => { S2.mode = 'boom'; S2.mT = 0.3; });
        fz('19-tip-tell', () => { S2.mode = 'tipTell'; S2.mT = 0.4; }); fz('20-ore-lumps', () => { S2.mode = 'idle'; S2.lumps = [{ x: BK.P.x + 60, id: 1 }, { x: BK.P.x + 110, id: 2 }]; }); } }
    for (const [n, x] of [['21-gate-wreck', 674], ['22-gate-lift', 783], ['23-gate-pits', 1062]]) { const fo = BK.L.mcFoot.find(q => Math.abs(q.board - x) < 3); if (!fo) continue; const row = 30; BK.tp(fo.board - 6, row - 1); run(12); BK.look(fo.board - 3, row - 1); snap(n); }
    /* THE GREAT DRILL's new attacks: the cutter's boom, the cutter rolling and struck back, the claw dropping, its mark, the torn rail */
    const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); BK.minecart().cart(BK.P).v = 0; run(10);
    for (let i = 0; i < 160; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); }
    const H = BK.drillHands(), S = H.show(), b = BK.enemies().find(e => e.t === 'greatdrill'); const DR = 1;
    const force = (name, fn) => { if (only.length && !only.includes(name)) return; fn(); BK.P.hp = BK.P.maxHp; BK.sim(1); BK.look(A.start[0], A.start[1] - 3); snap(name); };
    if (S && b) { S.ph = 3; S.cd = 99;
      force('12-cutter-tell', () => { b.mode = 'cutterTell'; S.cutPend = { lane: 0 }; S.mT = 0.55; });
      force('13-cutter-roll', () => { b.mode = 'idle'; S.cutPend = null; S.cutters.length = 0; const x = H.show().G.x0 + 150; S.cutters.push({ x, x0: x, tx: x - 30, fly: 0, lane: 0, id: 1, back: false }); });
      force('14-cutter-back', () => { S.cutters[0].back = true; });
      force('15-claw-tell', () => { S.cutters.length = 0; b.mode = 'clawTell'; S.clawPend = { lane: 0, x: 0 }; S.mT = 0.45; });
      force('16-torn-rail', () => { b.mode = 'idle'; const x = H.show().G.x0 + 150; S.clawPend = null; S.tears.push({ x, lane: 0, id: 1 }); }); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/dr5-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
