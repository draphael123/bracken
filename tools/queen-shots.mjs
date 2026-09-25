/* tools/queen-shots.mjs <tag> [level] [name:x:y,...] - PHOTOGRAPHED IN THE REAL PAGE for the Queen's-pillars lane
   (docs/briefs/queen-pillars.md). Node renders lie about light (docs/AGENT-HANDOFF.md), so every picture is the page's own
   320x180 buffer after 300 BK.step frames, saved at 2x as work/queenpillars/<tag>-NN-<name>.png. With no spots it takes the
   Queen's Great Hall: the hall with her asleep on her throne, and the hall with her awake and walking the floor. Foes are
   left where they are (the invisible-platform shots are OF the foes). Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot', lvl = process.argv[3] || 'crown';
const spots = process.argv[4] ? process.argv[4].split(',').map(s => { const [n, x, y] = s.split(':'); return [n, +x, +y]; }) : null;
const out = join(ROOT, 'work/queenpillars'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const snap = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('work/queenpillars/' + f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  const boot = `const i = __LV.findIndex(l => l.id === '${lvl}'); BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true; BK.sim(60);`;
  if (spots) for (const [name, x, y] of spots) {
    const d = await pg.evalp(`(() => { ${boot} BK.tp(${x}, ${y}); BK.sim(40); for (let k = 0; k < 300; k++) BK.step(1); return { png: ${snap} }; })()`);
    save(name, d.png);
  } else {
    /* the hall before the fight: stood at its door, her asleep on the throne */
    let d = await pg.evalp(`(() => { ${boot} const A = BK.L.arena; BK.tp(Math.round(A.x0 / 16) + 10, Math.round(A.floor / 16) - 1); BK.sim(20); for (let k = 0; k < 300; k++) BK.step(1); return { png: ${snap} }; })()`);
    save('hall-door', d.png);
    /* the hall in the fight: her awake and on the floor, the hero in the middle of it */
    d = await pg.evalp(`(() => { ${boot} const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 420; k++) { BK.P.hp = BK.P.maxHp; BK.step(1); } return { png: ${snap}, mode: (BK.boss || {}).mode }; })()`);
    save('hall-fight', d.png);
    /* her pillars, if the hall has them: one baited charge, photographed in its tell (the pillar shaking) and after it (her pinned, the rubble) */
    const bait = `const A = BK.L.arena, q = BK.boss, ps = BK.props().filter(p => p.t === 'qpillar').sort((a, b) => a.x - b.x), p = ps[2];
      if (p) { q.x = p.x + 60; q.y = A.floor; q.mode = 'stand'; q.modeT = 0; q.slamT = q.sweepT = q.chandT = q.shadowT = q.decreeT = q.throwT2 = 99; q.chargeT = 0; }
      const hold = () => { if (p) { BK.P.x = p.x - 70; BK.P.vx = 0; } BK.P.hp = BK.P.maxHp; BK.P.inv = 9; };`;
    d = await pg.evalp(`(() => { ${boot} const A0 = BK.L.arena; BK.tp(Math.round(A0.trigger / 16) + 1, Math.round(A0.floor / 16) - 1); for (let k = 0; k < 300; k++) { BK.P.hp = BK.P.maxHp; BK.step(1); } ${bait}
      for (let k = 0; k < 90 && q.mode !== 'chargeTell'; k++) { hold(); BK.step(1); } for (let k = 0; k < 30; k++) { hold(); BK.step(1); } const tell = ${snap};
      for (let k = 0; k < 200 && q.mode !== 'pinned'; k++) { hold(); BK.step(1); } for (let k = 0; k < 50; k++) { hold(); BK.step(1); }
      return { tell, pinned: ${snap}, mode: q.mode, has: !!p }; })()`);
    if (d.has) { save('pillar-tell', d.tell); save('pillar-pinned', d.pinned); console.log('her mode after the bait: ' + d.mode); }
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
