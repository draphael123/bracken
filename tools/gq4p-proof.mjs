/* tools/gq4p-proof.mjs [outDir] [part] - THE GQ4P PROOF IN THE REAL PAGE (claude/gq4p-d): BRACKEN_GQ4L=1 + BRACKEN_GQ4P=1, the page's own 320x180 buffer at 2x.
   part 'pins'   (default) : each of the 9 heroes knocks a gate's chain pin shut (G-W adjacent, G-U from the FLOOR, ranged heroes from a few tiles) -> a table
   part 'phase'            : GUARDS! lanterns + goblins, the key, ALL GATES! (invincible shimmer, last ad -> dazed -> phase 2), the 40 s failsafe, the pirouette (stand in it / jump it) + stills
   ONE headless page; >= 1500 MB free; stop if scratch\GATE-RUNNING.flag / BROWSER-HOLD.flag exists. Not in the suite.
     node tools/gq4p-proof.mjs <outDir> pins|phase */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ4L = '1'; process.env.BRACKEN_GQ4P = '1';
const dir = resolve(ROOT, process.argv[2] || 'work/claude/shots/gq4p'); mkdirSync(dir, { recursive: true });
const part = process.argv[3] || 'pins';
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const { LEVELS } = await import('/src/level.js'); const shots = {}, info = {}, log = [];
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
  const snap = id => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
  const keep = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = Math.max(BK.P.inv || 0, 0.5); };
  const run = (n, hold = true) => { for (let i = 0; i < n; i++) { if (hold) keep(); BK.step(1); } };
  const fresh = h => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { [h]: 1e6 }); BK.setHero(h); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); run(60);
    const A = BK.L.mini; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300); return BK.gprincessHands(); };`;
try {
  const js = part === 'pins' ? `(async () => { ${PRE}
    const rows = [];
    for (const h of ${JSON.stringify((process.env.HEROES || 'knight,pyro,reaper,pirate,paladin,geomancer,warden,berserker,ranger').split(','))}) {
      const row = { h }; try { const H = fresh(h); const F0 = H.fight(); F0.callAt = 1e9; const G = H.test.gates();
        for (const k of ['W', 'U', 'E']) { const r = {};
          for (const [nm, dx, press] of [['ctl', -1, false], ['adj', -1, true], ['far', -4, true]]) { for (const q of Object.values(G)) { q.lock = false; q.open = true; } const pinCol = Math.floor(G[k].pinX / 16), floorRow = Math.round(BK.L.mini.floor / 16) - 1;
            BK.tp(pinCol + dx, floorRow); run(100); BK.P.face = 1; const e = BK.boss; if (e) { e.x = G[k].pinX + 250; e.mode = 'walk'; e.modeT = 9; } F0.callAt = 1e9;
            if (nm === 'far' && h === 'pyro') { for (let a = 0; a < 3 && G[k].open; a++) { const K = BK.keys; K.block = true; run(45); K.block = false; run(60); } } else if (nm === 'far') { for (let a = 0; a < 90 && G[k].open; a++) { BK.press('atk'); run(1); } } else for (let a = 0; a < 3 && G[k].open; a++) { if (press) BK.press('atk'); run(26); }
            run(120);
            r[nm] = !G[k].open; if (nm === 'ctl' && r[nm]) { G[k].open = true; } }
          row[k] = r; }
      } catch (err) { row.err = String(err && err.message || err); } rows.push(row); }
    info.rows = rows; return { shots, info }; })()` : `(async () => { ${PRE}
    const H = fresh('knight'); const F = H.fight(), G = H.test.gates(), e = () => BK.boss; const st = () => H.read();
    info.start = st().gates; snap('01-room-west'); BK.tp(Math.round(G.E.pinX / 16) + 2, 21); run(60); snap('02-room-east');
    BK.tp(Math.round(G.W.pinX / 16) - 4, 21); run(20);
    // GUARDS!
    F.callAt = 0; e().mode = 'walk'; e().modeT = 0.01; let t0 = 0; for (let i = 0; i < 200 && !F.call; i++) run(1); run(65); snap('03-guards-call-lanterns-lit'); info.call = st().call; info.litGates = Object.values(G).map(g => g.lit); run(60 * 4); info.adsAfterCall = st().ads;
    // THE KEY
    G.E.open = false; e().mode = 'walk'; e().modeT = 9; H.test.keyBegin(e()); for (let i = 0; i < 200 && e().mode !== 'keyTell'; i++) run(1); snap('04-key-turn-tell'); run(80); info.keyOpened = st().gates.E;
    // ALL GATES + the add phase
    F.callAt = 1e9; e().mode = 'walk'; e().hp = e().maxHp * 0.49; run(30); snap('05-all-gates-tell'); run(60 * 3); snap('06-add-phase-shimmer'); info.add = st().add; info.adsAdd = st().ads; info.gatesAdd = st().gates;
    const hp0 = e().hp; BK.tp(Math.round(e().x / 16) - 1, 21); BK.P.face = 1; BK.press('atk'); run(30); info.hpAfterBlowShim = Math.round(e().hp - hp0);
    run(60 * 2); for (const g of BK.enemies ? BK.enemies() : []) if (g.gpGuard && g.alive) { g.hp = 1; BKT.hurtEnemy(g, 999, g.x - 5, false); } run(40); info.afterKill = { mode: e().mode, add: st().add }; snap('07-dazed'); run(60 * 3); info.phase = H.fight().ph; info.gatesAfter = st().gates;
    // failsafe, fresh
    const H2 = fresh('knight'); const F2 = H2.fight(); F2.callAt = 1e9; const e2 = BK.boss; e2.hp = e2.maxHp * 0.49; run(60 * 2); info.add2 = H2.read().add; BK.tp(Math.round(BK.L.mini.x0 / 16) + 2, 21); run(60 * 38.5); info.at38 = H2.read().add; run(60 * 2.5); info.at40 = { add: H2.read().add, shim: !!e2.shimmer, ph: H2.fight().ph, adsAlive: H2.read().ads, fs: H2.fight().n.failsafes };
    // the pirouette
    const H3 = fresh('knight'); const F3 = H3.fight(); F3.callAt = 1e9; F3.ph = 2; const e3 = BK.boss; e3.phase = 2; BK.god = false;
    const trial = jump => { F3.chain = ['pirouette']; F3.step = 0; F3.pirAt = 0; e3.mode = 'walk'; e3.modeT = 0.01; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; BK.tp(Math.round(e3.x / 16) + (jump ? -3 : -2), 21); run(6, false); const hp1 = BK.P.hp; let told = false, snapped = false;
      for (let i = 0; i < 60 * 6 && e3.mode !== 'dizzy'; i++) { if (e3.mode === 'pirouetteTell') { told = true; if (!jump && !snapped) { snap('08-pirouette-tell-skid'); snapped = true; } }
        if (jump && e3.mode === 'pirouette' && BK.P.ground && Math.abs(e3.x - BK.P.x) < 60) BK.press('jump'); if (!jump && e3.mode === 'pirouette' && !jump && !F3._s) { F3._s = 1; snap('09-pirouette-spin'); } BK.step(1); }
      return { told, lost: Math.round(hp1 - BK.P.hp), end: e3.mode }; };
    info.stand = trial(false); info.jump = trial(true);
    return { shots, info }; })()`;
  const d = await pg.evalp(js, 580000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots'); console.log(JSON.stringify(d.info, null, 1)); console.log('errors', JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
