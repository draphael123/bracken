/* tools/highcrown2bell-shots.mjs [outDir] - the Goblin Queen ringing her own bell (claude/highcrown2bell), in the real page: the tell at four moments, the toll, the grate landing, the recovery.
   Same setup as tools/highcrown2art-shots.mjs. Saved at 2x to work/claude/shots/highcrown2bell/. Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/highcrown2bell'); mkdirSync(dir, { recursive: true });
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}, info = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 520; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const snap = id => { cg.clearRect(0, 0, 640, 520); cg.drawImage(BK.buf, 0, 0, BK.buf.width, BK.buf.height, 0, 0, 640, 360); const full = cv.toDataURL('image/png'); cg.clearRect(0, 0, 640, 520); cg.drawImage(BK.buf, ${process.env.CROP || '250, 60, 200, 160'}, 0, 0, 640, 512); shots[id] = cv.toDataURL('image/png'); shots['full-' + id] = full; };
    BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 300; k++) { BK.P.hp = BK.P.maxHp; BK.step(1); }
    const q = BK.boss, b = BK.props().find(p => p.t === 'winch' && p.bell && p.bossGate), gx = b.gate * 16 + 8;
    info.buf = [BK.buf.width, BK.buf.height]; info.bell = [b.x, b.y, b.gate, b.gy0, b.gy1, A.floor]; info.q0 = [q.x, q.y];
    q.phase = 2; q.plate = 6; q.plateOff = false; q.hp = Math.floor(q.maxHp * 0.6); q.x = gx + ${process.env.QDX || 95}; q.mode = 'stand'; q.modeT = 0; q.ringT = 99; q.enrageT = 0;
    for (const k of ['slamT', 'sweepT', 'chandT', 'decreeT', 'throwT2', 'gLeapT', 'shadowT', 'courtT', 'hLeapT']) q[k] = 99;
    const keep = () => { BK.P.x = gx - 20; BK.P.vx = 0; BK.P.hp = BK.P.maxHp; };
    for (let i = 0; i < 40; i++) { keep(); BK.step(1); } q.ringT = 0; for (let i = 0; i < 120 && q.mode !== 'ringTell'; i++) { keep(); BK.step(1); } info.tellStart = q.mode; info.qx = q.x;
     let n = 0; for (const at of [8, 20, 32, 44, 53]) { while (n < at && q.mode === 'ringTell') { keep(); q._twAt = -9; BK.step(1); n++; } q._twAt = -9; info['f' + at] = Object.fromEntries(['flash','hitT','breakFlash','wardHit','stagger','fa','open'].map(k => [k, q[k]])); info['q' + at] = [q.x, q.y, q.face, q.modeT, q.mode]; snap('tell-' + at); }
    let m = 0; while (q.mode === 'ringTell' && m++ < 120) { keep(); BK.step(1); } info.afterTell = q.mode; snap('toll-0');
    for (const at of [6, 12, 22, 40]) { for (let i = 0; i < ${process.env.STEP || 6}; i++) { keep(); BK.step(1); } snap('after-' + at); }
    return { shots, info }; })()`);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots', JSON.stringify(d.info)); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
