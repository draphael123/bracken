// PAGE TOOL: launches headless Chrome
/* tools/gq4l-shots.mjs [outDir] - THE GQ4L PROOF WALK IN THE REAL PAGE (claude/gq4l-d): BRACKEN_GQ4L=1, the page's own 320x180 buffer at 2x: G1, G2, the bell tower shell, B3b, B3c, a burning storey,
   the outside stretch, the Queen mid-hop. ONE headless page (>= 1500 MB free; stop if scratch\GATE-RUNNING.flag / BROWSER-HOLD.flag exists). Not in the suite.
     BRACKEN_GQ4L=1 node tools/gq4l-shots.mjs <outDir> */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const dir = resolve(ROOT, process.argv[2] || 'work/claude/shots/gq4l'); mkdirSync(dir, { recursive: true });
process.env.BRACKEN_GQ4L = '1';
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}, info = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const snap = id => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = Math.max(BK.P.inv || 0, 0.5); };
    const run = n => { for (let i = 0; i < n; i++) { hold(); BK.step(1); } };
    const fresh = () => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); run(60); };
    fresh(); info.W = BK.L.W; info.gq4 = !!BK.L.gq4Room;
    const spots = [['g1-gatehouse', 618, 21], ['g2-leads-walk', 641, 21], ['b3b-landing', 770, 11], ['b3c-roof-leads', 792, 8], ['bell-tower-shell', 676, 21]];
    for (const [id, x, y] of spots) { BK.tp(x, y); run(150); info['pos-' + id] = [Math.round(BK.P.x / 16), Math.round(BK.P.y / 16), Math.round(BKT.camX / 16)]; snap(id); }
    // the Queen, her flee, the tower
    fresh(); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300); const e = BK.boss;
    info.queen = !!(e && e.t === 'gqueen');
    if (e && e.t === 'gqueen') { e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); const H = BK.gqHands(), E = BK.L.gqEscape, F = E.tower.FLOORS, O = E.tower.OUT;
      BK.tp(E.portal.x, E.portal.y); run(40); info.inTower = H.read().esc && H.read().esc.inTower;
      BK.tp(E.tower.SHAFT[0] + 6, F[5] - 1); run(150); snap('tower-burning-storey-6'); run(60); snap('tower-burning-storey-6b');
      BK.tp(E.tower.SHAFT[0] + 20, F[6] - 1); run(150); snap('tower-storey-7-breach');
      BK.tp(O.x0 + 3, 55); run(150); snap('outside-0-breach-lip'); BK.tp(O.x0 + 24, 46); run(150); snap('outside-1-east-landing');
      BK.tp(O.x0 + 3, 38); run(30); BK.tp(O.x0 + 8, 36); run(150); snap('outside-2-hoarding');
      const hh = H.test.esc(); hh.q.k = 8; const modes = new Set(); let k = 0;
      BK.tp(O.x0 + 5, 29); run(20); hh.q.hopAt = 0;
      for (let i = 0; i < 60 * 9; i++) { hold(); BK.step(1); const m = BK.boss && BK.boss.mode; if (m) modes.add(m); if (['towerStride', 'towerOpen', 'towerStepIn', 'towerStepOut', 'towerLook', 'towerTaunt'].includes(m) && !shots['queen-hop-' + m]) snap('queen-hop-' + m); }
      info.modes = [...modes]; info.k = H.read().esc.queenK;
      BK.tp(O.x0 + 24, 22); run(150); snap('outside-3-top-landing'); }
    return { shots, info }; })()`, 280000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots', JSON.stringify(d.info)); console.log('errors', JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
