/* tools/gq3tune-shots.mjs [outDir] - claude/gq3tune: the burning tower's firelight, the Queen's tower-hop pose, and the P2 blink / stumble / storm rings + burning bays, photographed in the real page.
   ONE headless page (>= 1500 MB free; stop if scratch\GATE-RUNNING.flag exists). Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/gq3tune'); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const info = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const snap = (id) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    const snapAt = (id, wx, wy, w = 160, h = 90) => { const sx = Math.round(wx - BKT.camX - w / 2), sy = Math.round(wy - BKT.camY - h / 2); cg.clearRect(0, 0, 640, 360); cg.drawImage(BK.buf, sx, sy, w, h, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    let pin = null;
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = Math.max(BK.P.inv || 0, 0.5); if (pin) { BK.P.x = pin[0]; BK.P.y = pin[1]; BK.P.vx = 0; BK.P.vy = 0; } };
    const run = n => { for (let i = 0; i < n; i++) { hold(); BK.step(1); } };
    BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); run(60);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300);
    const e = BK.boss; info.queen = !!(e && e.t === 'gqueen'); const H = BK.gqHands(), E = BK.L.gqEscape, F = E.tower.FLOORS;
    e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); BK.tp(E.portal.x, E.portal.y); run(40);
    const esc = H.test.esc(); info.fl = esc.fl.length;
    /* A. the firelight: the floor under the hero is burning (forced), the one beside him smoking */
    pin = [795 * 16 + 8, F[2] * 16 - 40]; BK.tp(795, F[2] - 1); run(2); BK.P.y = pin[1]; esc.fl[1].burning = true; esc.fl[2].smokeAt = esc.fl[2].smokeAt || 1;
    run(30); snap('A-burning-floor-below'); pin = [795 * 16 + 8, F[2] * 16 - 8]; run(20); snap('A2-burning-floor-near'); pin = null;
    /* B. her hop: crouch, then spring */
    BK.tp(790, F[1] - 1); run(20); const qq = esc.q; const qy = F[qq.k] * 16;
    qq.hopAt = 0; /* force a hop soon */ run(1);
    let k = 0; const tn = BK.time ? BK.time() : 0;
    for (let i = 0; i < 260; i++) { hold(); BK.step(1); const m = BK.boss && BK.boss.mode; if ((m === 'towerCrouch' || m === 'towerHop') && !shots['B-' + m]) snapAt('B-' + m, BK.boss.x, BK.boss.y - 30, 200, 112); if (shots['B-towerCrouch'] && shots['B-towerHop']) break; }
    info.hop = Object.keys(shots).filter(s => s.startsWith('B-'));
    /* C. the tower top: blink / stumble / storm / bays */
    BK.tp(E.portal.x, E.portal.y); run(60); info.skip = H.skipRoof(); run(150); BK.tp(812, 19); run(30);
    const qe = BK.boss; qe.hp = qe.maxHp * 0.6; H.test.start('blink'); const seen = {};
    for (let i = 0; i < 400; i++) { hold(); BK.step(1); const m = BK.boss.mode; if (['blinkTell', 'blinkGone', 'stumble'].includes(m) && (seen[m] = (seen[m] || 0) + 1) === 12) snap('C-' + m); }
    H.test.start('storm'); const seen2 = {}; for (let i = 0; i < 360; i++) { hold(); BK.step(1); const m = BK.boss.mode; if (['stormTell', 'stormFire', 'stormOpen'].includes(m) && (seen2[m] = (seen2[m] || 0) + 1) % 30 === 12) snap('D-' + m + '-' + seen2[m]); }
    H.test.start('bays'); run(150); snap('E-bays'); run(60); snap('E-bays2');
    info.modes = [seen, seen2];
    return { shots, info }; })()`, 280000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).join(','), JSON.stringify(d.info)); console.log('errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { await pg.close(); }
