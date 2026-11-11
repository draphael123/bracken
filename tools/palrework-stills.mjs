// tools/palrework-stills.mjs - THE PALADIN REWORK, LOOKED AT (claude/palrework-d; not in the suite, an art proof).
//   usage: node tools/palrework-stills.mjs <outDir> [sections]   sections: frames,strip,live,hammer (default all)
//   -> <outDir>/frames-<skin>-R.png (every baked pose key, facing right, 2x), frames-steel-L.png (facing left: the shield arm when flipped),
//      frames-steel-4x-<n>.png (the same at 4x, in parts), strip-knight-vs-paladin.png, live-moves-R.png / live-moves-L.png (the game drawing him:
//      air-motion's lean/stretch/squash is applied at draw time, so jump/hurt/skid/crouch are only seen here), hammer-crowd.png, hammer-wall.png, hammer-boss.png.
// The page carries BRACKEN_QS (e.g. '?palmace=0' draws the master paladin for a before/after).
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const OUT = process.argv[2] || 'work/claude/shots/palrework', ONLY = process.argv[3] || 'frames,strip,live,hammer'; mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
const save = (name, d) => { if (!d) return; writeFileSync(join(OUT, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(join(OUT, name + '.png')); };
try {
  await pg.reload();
  const R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const HGm = await import('/src/holy-ground.js'); const res = { mace: HGm.PAL_MACE, out: {} };
    const PR = typeof BK.PROG === 'function' ? BK.PROG() : BKT.PROG;
    const sheet = (cells, cols, cw, ch) => { const c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(cells.length / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#1a1a22'; g.fillRect(0, 0, c.width, c.height); cells.forEach((d, n) => { const x = (n % cols) * cw, y = Math.floor(n / cols) * ch; g.fillStyle = n % 2 ? '#3a4a46' : '#34443f'; g.fillRect(x, y, cw, ch); d(g, x, y); }); return c; };
    const frameCells = (set, side, Z, keys) => { const cells = []; for (const k of keys) { const a = set[side][k]; const fs = Array.isArray(a) ? a : a ? [a] : []; fs.forEach((f, i) => cells.push((g, x, y) => { g.drawImage(f, x + 2, y + 14, f.width * Z, f.height * Z); g.fillStyle = '#ffd36b'; g.font = '10px monospace'; g.fillText(k + ' ' + i, x + 2, y + 10); })); } return cells; };
    const setFor = (hero, sword) => { PR.sword = sword; BK.setHero(hero); BK.reset({ fresh: true }); return BK.heroSet; };
    if ('${ONLY}'.includes('frames')) {
      for (const sk of ['steel', 'ember', 'frost', 'moon']) { const S = setFor('paladin', sk); const keys = Object.keys(S.R); res.keys = keys;
        const cells = frameCells(S, 'R', 2, keys); res.out['frames-' + sk + '-R'] = sheet(cells, 14, 92, 132).toDataURL('image/png');
        if (sk === 'steel') { res.out['frames-steel-L'] = sheet(frameCells(S, 'L', 2, keys), 14, 92, 132).toDataURL('image/png');
          const big = frameCells(S, 'R', 4, keys); for (let p = 0; p * 40 < big.length; p++) res.out['frames-steel-4x-' + p] = sheet(big.slice(p * 40, p * 40 + 40), 8, 180, 250).toDataURL('image/png'); } } }
    if ('${ONLY}'.includes('strip')) { const want = ['idle', 'walk', 'atk', 'atkB', 'atkC', 'heavy', 'block', 'jump', 'fall', 'hurt', 'dashAtk', 'plunge'];
      const Kn = setFor('knight', 'steel'), Pa = setFor('paladin', 'steel'), cells = [];
      for (const S of [Kn, Pa]) for (const k of want) { const a = S.R[k] || S.R.idle, f = Array.isArray(a) ? a[Math.min(1, a.length - 1)] : a; cells.push((g, x, y) => { g.drawImage(f, x + 2, y + 14, f.width * 3, f.height * 3); g.fillStyle = '#ffd36b'; g.font = '10px monospace'; g.fillText((S === Kn ? 'KN ' : 'PAL ') + k, x + 2, y + 10); }); }
      res.out['strip-knight-vs-paladin'] = sheet(cells, want.length, 130, 200).toDataURL('image/png'); }
    /* ---- LIVE: the game drawing him (the air-motion transform is a draw-time one) ---- */
    PR.sword = 'steel'; BK.SET.speed = 1; BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.god = false; BK.sim(200);
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16) + 14; x0 < W - 40 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 30 && ok; x++) ok = at(x, y + 1) === 1 && [0,1,2,3,4,5,6,7,8].every(k => at(x, y - k) === 0); if (ok) spot = [x0 + 8, y]; }
    if (!spot) return { ...res, err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk','dodge']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = (face = 1) => { clear(); none(); if (BK.holyHands) BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.light = 0; P.face = face; P.palHamCd = 0; BK.sim(2); };
    const VW = BK.view.VW, VH = BK.view.VH;
    const mk = (cols, n, CW, CH, Z) => ({ c: sheet(Array.from({ length: n }, () => () => {}), cols, CW * Z, CH * Z), cols, CW, CH, Z, i: 0 });
    const cell = (S, label, sx = 0) => { const g = S.c.getContext('2d'); g.imageSmoothingEnabled = false; const x = (S.i % S.cols) * S.CW * S.Z, y = Math.floor(S.i / S.cols) * S.CH * S.Z; S.i++;
      const cam = BK.cam, px = BK.P.x - cam[0], py = BK.P.y - cam[1];
      g.drawImage(BK.buf, Math.max(0, Math.min(VW - S.CW, Math.round(px - S.CW / 2 + sx))), Math.max(0, Math.min(VH - S.CH, Math.round(py - S.CH + 10))), S.CW, S.CH, x, y, S.CW * S.Z, S.CH * S.Z);
      g.fillStyle = '#ffd36b'; g.font = '11px monospace'; g.fillText(label + ' [' + (BK.P.lastKey || '?') + (BK.P.artTurn ? ' r' + (BK.P.artTurn * 57.3).toFixed(0) : '') + (BK.P.artTall && BK.P.artTall !== 1 ? ' s' + BK.P.artTall.toFixed(2) : '') + ']', x + 3, y + 12); g.strokeStyle = '#000'; g.strokeRect(x + 0.5, y + 0.5, S.CW * S.Z - 1, S.CH * S.Z - 1); };
    const shot = (S, label, f = 1, sx = 0) => { BK.sim(f); BK.step(1); cell(S, label, sx); };
    const kd = k => dispatchEvent(new KeyboardEvent('keydown', { key: k })), ku = k => dispatchEvent(new KeyboardEvent('keyup', { key: k }));
    const press = (k, f = 2) => { kd(k); BK.sim(f); ku(k); };   /* (the attack and the dodge are read off the key's PRESS event, not BK.keys) */
    const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(1); K.up = false; };
    if ('${ONLY}'.includes('live')) for (const face of [1, -1]) { const S = mk(6, 48, 64, 44, 3), fw = face > 0 ? 'right' : 'left', bw = face > 0 ? 'left' : 'right';
      home(face); shot(S, 'idle', 30);
      K[fw] = true; shot(S, 'walk', 10); shot(S, 'walk', 5); none();
      home(face); BK.sim(10); press('x'); shot(S, 'jab1', 2); BK.sim(10); press('x'); shot(S, 'jab2', 3); BK.sim(12); press('x'); shot(S, 'overhead', 3); shot(S, 'overhead+', 5); shot(S, 'overhead++', 5); BK.sim(30);
      home(face); K.atk = true; BK.sim(10); shot(S, 'verdict hold', 20); K.atk = false; shot(S, 'verdict rel', 4); BK.sim(30);
      home(face); K.block = true; shot(S, 'ward', 20); none(); BK.sim(20);
      home(face); BK.P.light = 60; tap({ up: true }); shot(S, 'HAMMER cast', 1); shot(S, 'hammer +0.1', 5, face * 16); BK.sim(80);
      home(face); BK.P.light = 20; tap(); shot(S, 'smite', 2); BK.sim(30);
      home(face); BK.P.light = 100; tap(); shot(S, 'RADIANCE+ tap@5', 3); BK.sim(40);
      home(face); BK.P.light = 100; tap({ up: true }); shot(S, 'SUNFALL up+C@5', 3); shot(S, 'sunfall +', 6); BK.sim(40);
      home(face); BK.sim(10); K[fw] = true; BK.sim(6); press('v', 1); BK.sim(2); press('x', 1); shot(S, 'low mace (dash atk)', 2); none(); shot(S, 'low mace +', 4); BK.sim(30);
      home(face); K[fw] = true; BK.sim(20); K.jump = true; shot(S, 'jump takeoff', 1); shot(S, 'jump rise', 5); shot(S, 'jump rise2', 5); K.jump = false; shot(S, 'apex', 6); shot(S, 'fall', 8); shot(S, 'fall2', 6); none(); BK.sim(30);
      home(face); BK.sim(10); kd('z'); BK.sim(14); ku('z'); K.down = true; press('x', 1); shot(S, 'plunge', 3); shot(S, 'plunge+', 6); none(); BK.sim(30);
      home(face); BK.sim(10); kd('z'); BK.sim(12); ku('z'); K.up = true; press('x', 1); shot(S, 'air up', 2); shot(S, 'air up+', 4); none(); BK.sim(40);
      home(face); BK.sim(10); kd('z'); BK.sim(8); ku('z'); BK.sim(6); if (BK.damagePlayer) BK.damagePlayer(BK.P.x + face * 20, 5); else BK.P.hurt = 0.3; shot(S, 'hurt (air)', 2); shot(S, 'hurt (air)+', 4); BK.sim(60);
      home(face); if (BK.damagePlayer) BK.damagePlayer(BK.P.x + face * 20, 5); else BK.P.hurt = 0.3; shot(S, 'hurt (ground)', 2); shot(S, 'hurt+', 5); BK.sim(60);
      home(face); K[fw] = true; BK.sim(45); K[fw] = false; K[bw] = true; shot(S, 'skid', 2); shot(S, 'skid+', 3); none(); BK.sim(30);
      home(face); K.down = true; shot(S, 'crouch in', 2); shot(S, 'crouch', 12); K.down = false; shot(S, 'crouch out', 2); BK.sim(20);
      /* (death: the game cuts to its death card - the slump frames are on the frame sheets) */
      res.out['live-moves-' + (face > 0 ? 'R' : 'L')] = S.c.toDataURL('image/png'); }
    if ('${ONLY}'.includes('hammer')) {
      const run = (name, setup) => { const S = mk(3, 12, 168, 56, 2); home(1); BK.P.light = 60; const f = setup(); shot(S, 'before', 1, 52); tap({ up: true });
        for (let n = 0; n < 11; n++) { for (const q of f) if (q && q.alive) { q.stagger = Math.max(q.stagger || 0, 0.1); q.cd = 99; } shot(S, '+' + ((n * 6 + 4) / 60).toFixed(2) + 's', n === 0 ? 1 : 6, 52); }
        res.out[name] = S.c.toDataURL('image/png'); for (let x = spot[0] + 1; x < spot[0] + 20; x++) for (let k = 0; k <= 4; k++) if (L0.grid[(spot[1] - k) * W + x] === 1 && name === 'hammer-wall') L0.grid[(spot[1] - k) * W + x] = 0; };
      const foe = (t, dx, hp = 900) => { const r = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); const f = Array.isArray(r) ? r[0] : r; if (f) { f.hp = f.maxHp = hp; f.cd = 99; } return f; };
      run('hammer-crowd', () => [foe('sprig', 3), foe('sprig', 5), foe('goblin', 7), foe('sprig', 9), foe('goblin', 11)]);
      run('hammer-wall', () => { for (let k = 0; k <= 4; k++) L0.grid[(spot[1] - k) * W + spot[0] + 5] = 1; return [foe('sprig', 3)]; });
      run('hammer-boss', () => { let b = null; for (const t of ['chief', 'troll', 'ogre', 'brute']) { b = foe(t, 6, 3000); if (b) break; } res.bossT = b && b.t; if (b) { b.maxHp = b.hp; } return [b]; });
    }
    res.errors = (window.__errs || []).slice(0, 5); return res; })()`, 600000);
  if (R.err) console.log('ERR', R.err);
  console.log(JSON.stringify({ mace: R.mace, keys: R.keys, bossT: R.bossT, errors: R.errors }));
  for (const [k, d] of Object.entries(R.out || {})) save(k, d);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 8));
} finally { pg.close(); }
