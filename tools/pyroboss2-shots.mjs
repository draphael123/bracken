/* tools/pyroboss2-shots.mjs [outDir] - THE PYROMANCER 2 and THE GOBLIN FIRE MAGE, photographed in the real page (claude/pyroboss2), for the report and the
   art lane: his ward (up, guttering), the charge steps (a small one, a big one with its red ring), PHOENIX RISE told, the STOKE, P2's marks told and
   erupting; the fire mage casting (the lob drawn back), his patch, his ward, doused. Each is the page's own 320x180 buffer at 2x.
   PORT=<port> node tools/pyroboss2-shots.mjs ../scratch/lane-reports/pyroboss2-shots */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const out = resolve(process.argv[2] || join(ROOT, 'docs/pyroboss2')); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
const snap = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
const save = (name, png) => { const f = join(out, name + '.png'); writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log(f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })`);
  const boss = (setup, frames = 1) => pg.evalp(`(() => { const i = __LV.findIndex(l => l.id === 'burning'); BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true;
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 240; k++) BK.step(1);
    const b = BK.boss; for (const e of BK.enemies()) if (e !== b) e.alive = false; b.x = (A.x0 + A.x1) / 2 + 20; b.y = A.floor; b.vx = 0; const P = BK.P; P.x = b.x - 90; P.y = A.floor; P.vx = 0;
    const hold = () => { b.cd = 99; b.fwCd = 99; b.stokeCd = 99; P.x = b.x - 90; P.vx = 0; };
    ${setup}
    for (let k = 0; k < ${frames}; k++) { hold(); BK.step(1); }
    return { png: ${snap} }; })()`);
  save('boss-ward-up', (await boss(`b.mode = 'ward'; b.modeT = 0.75; b.face = -1;`, 6)).png);
  save('boss-ward-gutter', (await boss(`b.mode = 'ward'; b.modeT = 0.3; b.face = -1;`, 4)).png);
  save('boss-charge-step2', (await boss(`b.mode = 'chargeTell'; b.modeT = 9; b.chT = 0.5; b.step = 2; b.stepGoal = 5; b.face = -1;`, 6)).png);
  save('boss-charge-step4-ring', (await boss(`b.mode = 'chargeBigTell'; b.modeT = 9; b.chT = 1.45; b.step = 4; b.stepGoal = 5; b.face = -1; P.x = b.x - 150;`, 4)).png);
  save('boss-phoenix-tell', (await boss(`b.mode = 'riseTell'; b.modeT = 0.6; b.riseX = b.x - 200; b.face = -1;`, 18)).png);
  save('boss-stoke', (await boss(`b.mode = 'stoke'; b.modeT = 2.4; b.heat = 40; b.open = 2.4; b.openMax = 2.5;`, 20)).png);
  const marks = `b.hp = Math.floor(b.maxHp * 0.45); b.phase = 2; b.marks = [-130, -70, -10, 60, 120].map(d => ({ x: b.x + d, y: A.floor, t: BK.time }));`;
  save('boss-conflag-tell', (await boss(`${marks} b.mode = 'conflagTell'; b.modeT = 0.8; b.heat = 100;`, 10)).png);
  save('boss-conflag-erupt', (await boss(`${marks} b.mode = 'conflagTell'; b.modeT = 0.02; b.heat = 100;`, 8)).png);
  /* THE FIRE MAGE (the Rootway: his first meeting) */
  const mage = (setup, frames = 1) => pg.evalp(`(() => { const i = __LV.findIndex(l => l.id === 'rootway'); BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true;
    const e = BK.enemies().find(q => q.alive && q.cnSkin === 'firemage'); BK.tp(Math.round(e.x / 16) - 6, Math.round(e.y / 16)); for (let k = 0; k < 60; k++) BK.step(1);
    for (const q of BK.enemies()) if (q !== e && Math.abs(q.x - e.x) < 400) q.alive = false; const P = BK.P; P.x = e.x - 100; P.vx = 0;
    ${setup}
    for (let k = 0; k < ${frames}; k++) { e.cd = 99; e.lobCd = 99; e.fwCd = 99; P.x = e.x - 100; P.vx = 0; BK.step(1); }
    return { png: ${snap} }; })()`);
  save('firemage-casting', (await mage(`e.mode = 'lobTell'; e.modeT = 0.6; e.face = -1;`, 8)).png);
  save('firemage-patch', (await mage(`BK.fireMageHands().lob(e, e.x - 60, e.y); e.mode = 'keep';`, 70)).png);
  save('firemage-ward', (await mage(`e.mode = 'flameWard'; e.modeT = 0.45; e.face = -1;`, 3)).png);
  save('firemage-doused', (await mage(`BK.fireMageHands().douse(e);`, 30)).png);
  /* THE CINDER ACOLYTE (placed nowhere: put down here for the picture) */
  save('cinderacolyte', (await mage(`e.cnSkin = 'cinderacolyte'; e.h = 22; e.mode = 'lobTell'; e.modeT = 0.6; e.face = -1;`, 8)).png);
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
