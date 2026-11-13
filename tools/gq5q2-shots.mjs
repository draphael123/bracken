/* tools/gq5q2-shots.mjs [outDir] - GQ5Q2-TUNE BROWSER OWED 4: 8-10 stills for Daniel. Real page, real swings/physics, flag ON.
   Writes work/claude/shots/gq5q2/ (or outDir) one PNG each (640x360) + sheet.png. One headless page, not in the suite.
   BRACKEN_GQ5Q2=1 node tools/gq5q2-shots.mjs <outDir> */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ5Q2 = '1';
const dir = resolve(ROOT, process.argv[2] || 'work/claude/shots/gq5q2'); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const log = [];
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const sheet = document.createElement('canvas'); sheet.width = 1920; sheet.height = 360 * 4; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; let n = 0;
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const x = (n % 3) * 640, y = Math.floor(n / 3) * 360; sg.drawImage(BK.buf, x, y, 640, 360);
      sg.fillStyle = 'rgba(0,0,0,0.6)'; sg.fillRect(x, y, 640, 22); sg.fillStyle = '#ffd36b'; sg.font = '15px monospace'; sg.fillText((n + 1) + '. ' + label, x + 6, y + 16); n++; };
    const hold = () => { BK.P.hp = BK.P.maxHp; };
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.sim(5);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
    for (let k = 0; k < 300; k++) { hold(); BK.sim(1); }
    let q = BK.boss; q.crownCd = 99; q.portalCd = 99; q.geodeCd = 99; q.slamT = 99; q.sweepT = 99; q.courtT = 99; q.hLeapT = 99; q.decreeT = 99; q.throwT2 = 99; q.ringT = 99;
    const P = BK.P; const run = k => { for (let i = 0; i < k; i++) { hold(); BK.sim(1); } };
    q.hp = 2; const hu = BK.hurt || (BK.env && BK.env().hurt); if (hu) hu(q, 50, P.x); run(140);
    const H = BK.gqHands(); H.skipRoof(); run(6);
    const G52 = H.q52();
    /* 1. THE ENTRY PLATE */
    snap('entry-plate', 'roof entry: the rule hint + the two-line floating plate');
    /* 2. THE TEACH SHARD */
    for (let i = 0; i < 180 && !(G52.state().teach.shard); i++) run(1);
    run(10); snap('teach-shard', 'the teach shard (gold glint, slow) with STRIKE IT!');
    for (let i = 0; i < 400 && !G52.state().teach.struck; i++) run(1);   // let it resolve (struck or missed+retried) before moving on
    log.push('teach after 400f: struck=' + G52.state().teach.struck + ' n=' + G52.state().teach.n);
    /* 3. THE ROPE IDLE */
    const rp0 = G52.rope(); BK.tp(Math.round((rp0.x - 60) / 16), Math.round(A.floor / 16) - 1); P.x = rp0.x - 60; P.y = A.floor; P.face = 1; run(10);
    snap('rope-idle', 'the bell rope hanging from the cupola frame, idle');
    /* 4. THE ROPE READY (gold glow after an idle hit) */
    P.x = rp0.x - 14; P.y = A.floor; P.ground = true; BK.P.atk = -1; BK.press('atk'); run(8);
    snap('rope-ready', 'the rope struck while idle: NOTHING IN THE BELL / gold glow window');
    /* 5. HER ON THE CUPOLA (WARDED) + rockfall shadows */
    q.mode = 'roofStand'; q.modeT = 99; G52.state().perch.phase = 'idle'; G52.state().perch.nextAt = 0;
    G52.perchStart(q); for (let i = 0; i < 60 && q.mode !== 'perch'; i++) run(1);
    run(70);   // past the first rockfall tick (rainEvery 1.2 s)
    snap('cupola-warded', 'she is WARDED on the cupola ring, rockfall shadows falling');
    /* 6. THE ROPE SWINGING */
    P.x = rp0.x - 16; P.y = A.floor; P.ground = true; BK.P.atk = -1; BK.press('atk'); run(6);
    snap('rope-swinging', 'the rope rung: THE BELL SWINGS (1.2 s tell before she falls)');
    /* 7. SHAKEN LOOSE / DOWNED */
    for (let i = 0; i < 120 && q.mode !== 'stunned'; i++) run(1);
    run(4); snap('shaken-loose-downed', 'SHAKEN LOOSE - DOWNED beside the rope');
    for (let i = 0; i < 400 && q.mode === 'stunned'; i++) run(1);   // let the down window clear before the next forced mode
    /* 8. SWEEP WIND-UP */
    q.mode = 'roofStand'; q.modeT = 99; q.x = P.x + 30; q.y = A.floor; q.face = -1; P.face = 1;
    const st = G52.state(); st.sweep.cd = 0; G52.sweepStart(q); run(14);
    snap('sweep-windup', 'THE SCEPTRE SWEEP tell: the "!" and the gold dust at her feet');
    /* 9. SWEEP RELEASE ARC */
    for (let i = 0; i < 60 && q.mode !== 'sceptreSweepCut'; i++) run(1);
    run(2); snap('sweep-release', 'THE SCEPTRE SWEEP release: the chest-height arc over her sceptre pose');
    /* 10. HATCH SMOKE + FIRE COLUMN (bay B lit) */
    q.mode = 'rec'; q.modeT = 0.2; q.hp = Math.round(q.maxHp * 0.5) - 1;
    for (let i = 0; i < 60 * 15 && G52.state().hatch.phase === 'idle'; i++) { run(1); if (q.mode === 'roofStand' || q.mode === 'rec') {} }
    const h = G52.hatch ? null : null; // geometry is internal; use the tower's own HATCH cols to frame the camera
    const Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower);
    const hx = Tw.HATCH.cols[0] * 16 + 16;
    BK.tp(Math.round((hx - 30) / 16), Math.round(A.floor / 16) - 1); P.x = hx - 30; P.y = A.floor; run(20);
    snap('hatch-smoke', 'THE HATCH! seam smoke before the eruption (bay ' + ('ABCDEFGH'[G52.nearestBay()] || '?') + ' lighting with it)');
    for (let i = 0; i < 60 * 3 && G52.state().hatch.phase !== 'fire'; i++) run(1);
    run(4); snap('hatch-fire', 'the fire column (14 dmg + push), bay ' + ('ABCDEFGH'[G52.nearestBay()] || '?') + ' lit with it');
    log.push('hatch bay index ' + G52.nearestBay());
    return { shots, sheet: sheet.toDataURL('image/png'), n, log }; })()`, 300000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); console.log(d.log.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
