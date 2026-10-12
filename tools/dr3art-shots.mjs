// tools/dr3art-shots.mjs - DEEP RAILS 3 ART pictures (claude/dr3art). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8851 node tools/dr3art-shots.mjs <group[,group]>  -> work/claude/shots/dr3art/<name>.png (crops from the game's canvas) + sheet.png (every crop, labelled)
//   groups: foreman (his poses, boarded, braced, dents, corpse), rails (low roofs, the switch and its bridge), foes (perch, swing, leap), drill (Great Drill 3), card (the bestiary card)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const groups = (process.argv[2] || 'foreman,rails,foes,drill,card').split(',');
const out = join(ROOT, 'work/claude/shots/dr3art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const G = ${JSON.stringify(groups)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snapZ = (name, sx, sy, sw, sh, k) => { const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const zoom = (name, wx, wy, w, h, k) => { const V = BK.view; snapZ(name, Math.round(wx - V.x - w / 2), Math.round(wy - V.y - h / 2), w, h, k || 6); };
    const full = (name) => snapZ(name, 0, 0, BK.view.VW, BK.view.VH, 2);
    const rowAt = x => { let best = null; for (const [a, b, row] of BK.L.mcTrack) if (x >= a && x <= b && (best === null || row > best)) best = row; return best; };
    const at = (x, row) => { const rw = row || rowAt(x); BK.tp(x, rw - 1); BK.minecart().cart(BK.P).v = 0; run(10); BK.look(x, rw - 1); };
    const MH = BK.minecart();
    if (G.includes('foreman')) {
      const M = BK.L.mini; BK.tp(Math.round(M.trigger/16)+1, Math.round(M.floor/16)-1); run(150);
      const F = () => MH.foreman(); const e = F().e, S = () => F().S, fc = () => F().cart;
      { const set = BK.SPR.foremancart, K = set.R.length, c = document.createElement('canvas'); c.width = K * 26 * 6; c.height = 34 * 6; const g = c.getContext('2d'); g.fillStyle = '#2a2230'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; set.R.forEach((f, i) => g.drawImage(f, i * 26 * 6, 0, f.width * 6, f.height * 6)); res.push(['f-frames (idle drift pick ram lurch duck hurt)', c.toDataURL('image/png')]); }
      full('f0-loop');
      const pose = (nm, mode) => { for (let i = 0; i < 3; i++) { BK.P.hp = BK.P.maxHp; S().ward = 0; S().mode = mode; S().mT = 5; S().cd = 9; e.flash = 0; BK.sim(1); } BK.step(1); zoom(nm, fc().x, fc().y - 14, 90, 60, 7); };
      pose('f1-drift', 'driftTell'); pose('f2-pick', 'pickTell'); pose('f3-ram', 'ramTell'); pose('f4-lurch', 'lurchTell'); pose('f5-idle', 'idle');
      e.flash = 0.2; BK.step(1); zoom('f6-hurt', fc().x, fc().y - 14, 90, 60, 7); e.flash = 0;
      S().stomps = 3; S().ward = 0.3; S().mode = 'away'; BK.step(1); zoom('f7-braced-dented', fc().x, fc().y - 14, 90, 60, 7); S().ward = 3.0; BK.step(1); zoom('f8-braced-up', fc().x, fc().y - 14, 90, 60, 7);
      /* boarded: the hero comes down on his cart from above */
      S().ward = 0; S().stomps = 1; S().mode = 'idle'; S().cd = 9; e.flash = 0; BK.P.x = fc().x; BK.P.y = S().G.topY - 26; BK.P.vy = 160; BK.P.ground = false; for (let i = 0; i < 4; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1);
      for (let i = 0; i < 10; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); zoom('f9-boarded', fc().x - 10, fc().y - 18, 120, 80, 5);
    }
    const hz = (name, dx, dy) => { BK.look((BK.P.x + (dx || 0)) / 16, (BK.P.y + (dy || 0)) / 16 - 1); BK.step(1); BK.step(1); const V = BK.view; snapZ(name, Math.round(V.VW / 2 - 120), Math.round(V.VH / 2 - 68), 240, 136, 4); };
    const put = (x, row, n) => { BK.tp(x, row - 1); MH.cart(BK.P).v = 0; run(n || 8); };
    if (G.includes('rails')) {
      const roofs = BK.L.decor.filter(d => d.kind === 'lowroof');
      for (const [nm, x] of [['r1-roof-yard', 150], ['r2-roof-drift', 180], ['r3-roof-works', 754], ['r4-roof-flood', 862]]) { const d = roofs.find(r => x >= r.x0 && x <= r.x1); if (!d) continue; put(d.x0 + 4, rowAt(d.x0 + 4)); MH.cart(BK.P).v = 0; hz(nm, 40, -26, 220, 124, 4); }
      for (const [nm, id, x] of [['r5-switch-out', 'yardSw', 151], ['r5b-switch-out-drift', 'driftSw', 180]]) { MH.setPoints(id, 'open'); put(x - 7, rowAt(x - 7)); hz(nm, 40, -24, 220, 124, 4); }
      MH.setPoints('yardSw', 'open'); put(145, rowAt(145)); MH.setPoints('yardSw', 'set'); BK.step(1); BK.sim(9); BK.step(1); hz('r6-bridge-swinging', 90, -20, 260, 150, 4); BK.sim(12); BK.step(1); hz('r6b-bridge-late', 90, -20, 260, 150, 4); BK.sim(40); BK.step(1); hz('r7-bridge-laid', 90, -20, 260, 150, 4);
    }
    if (G.includes('foes')) {
      const perch = BK.L.decor.find(d => d.kind === 'perch'); put(perch.x0 - 12, rowAt(perch.x0 - 12), 4); hz('p1-perch-crouch', 120, -40, 200, 120, 5);
      for (let i = 0; i < 40; i++) { BK.P.hp = BK.P.maxHp; BK.P.x = (perch.x0 - 3) * 16; BK.sim(1); if (i % 2 == 0) BK.step(1); if (i === 6) { BK.step(1); hz('p2-perch-tell', 0, -30, 200, 120, 5); } if (i === 22) { BK.step(1); hz('p3-perch-chop', 0, -30, 200, 120, 5); } }
      put(713, rowAt(713), 6); hz('s1-swing-rest', 30, -24, 200, 120, 5); for (let i = 0; i < 90; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 3 === 0) BK.step(1); if (i === 60) hz('s2-swing-later', 30, -24, 200, 120, 5); }
      put(905, rowAt(905), 2); hz('l1-leap-crouch', 150, -30, 240, 130, 4); for (const [nm, n] of [['l2-leap-tell-shadow', 24], ['l3-leap-air', 22], ['l4-leap-landed', 20]]) { run(n); hz(nm, 90, -30, 240, 130, 4); }
    }
    if (G.includes('drill')) {
      const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); BK.minecart().cart(BK.P).v = 0; run(10); for (let i = 0; i < 160; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.look(A.start[0], A.start[1] - 3);
      const H = BK.drillHands(), S = H.show(), b = BK.enemies().find(e => e.t === 'greatdrill');
      const force = (ph, i) => { S.ph = ph; b.phase = ph; S.i = i; S.cd = 0; S.oreT = 99; S.lever = null; S.chute = null; S.lunge = null; S.hook = null; S.snag = null; S.dyn = []; S.dynPend = []; S.spots = []; b.mode = 'idle'; b.open = 0; if (ph === 3) S.highDown = true; };
      const go = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 3 === 0) BK.step(1); } BK.step(1); };
      force(1, 0); S.oreT = 0; go(24); full('d1-points-lever'); if (S.lever) S.lever.x = BK.P.x + 4; H.interact(BK.P); go(8); full('d2-lever-thrown-dump'); go(30); full('d3-jammed-dump');
      force(1, 0); b.open = 0; b.mode = 'idle'; go(14); full('d4-dynamite-throw'); go(22); full('d5-dynamite-fuse');
      force(2, 0); go(18); full('d6-lunge-spinup'); go(52); full('d7-lunge-cutter');
      force(2, 2); go(24); full('d8-hook-swing'); go(40); full('d9-hook-flies'); S.snag = { pp: BK.P, t: 1, lane: 0 }; go(2); full('d10-chain-snag'); S.snag = null;
      force(3, 0); go(24); full('d11-collapse-tell'); go(40); full('d12-rubble'); go(30); full('d13-p3-gouges');
    }
    if (G.includes('card')) {
      const src = await (await fetch('/src/main.js')).text(); const body = src.slice(src.indexOf('const BEASTS = ['), src.indexOf('const BOSS_T'));
      const ts = [...body.matchAll(/\\{ t: '([a-z0-9]+)', name:/g)].map(m => m[1]); const bt = (src.match(/const BOSS_T = \\[([^\\]]*)\\]/) || [, ''])[1].match(/'[a-z0-9]+'/g).map(s => s.slice(1, -1));
      const list = ts.filter(t => !bt.includes(t)), i = list.indexOf('foremancart'); BKT.PROG.beasts = BKT.PROG.beasts || {}; for (const q of ts) BKT.PROG.beasts[q] = { seen: true, slain: 1 };
      BK.state = 'bestiary'; BK.step(2); BK.bestTab = 0; BK.bestI = 0; for (let n = 0; n < i; n++) { for (const type of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(type, { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })); BK.step(2); } for (let k = 0; k < 40; k++) BK.step(1); snapZ('c1-bestiary-foreman-' + i + '-' + list.length + '-' + BK.bestI, 0, 0, BK.view.VW, BK.view.VH, 2); BK.state = 'play';
    }
    if (G.includes('foreman') && !G.includes('nocorpse')) {
      const F = () => MH.foreman(); const e = F().e, S = () => F().S, fc = () => F().cart;
      /* him dead, in his own skin */
      S().mode = 'idle'; S().ward = 0; if (BK.P.mcBoard) BK.P.mcBoard = null; e.hp = 1; e.shield = 0; e.armor = 0; const n0 = BK.corpses().length; e.frozen = 0; BK.combat2().strike(e, 'heavy', 1); const c = BK.corpses().slice(n0)[0]; for (let i = 0; i < 90; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); BK.step(1); } 
    }
    /* the contact sheet: every crop in a grid, labelled */
    const cols = 3, cw = 600, ch = 340, rows = Math.ceil(res.length / cols), sc = document.createElement('canvas'); sc.width = cols * cw; sc.height = rows * (ch + 16); const sg = sc.getContext('2d'); sg.fillStyle = '#0b0910'; sg.fillRect(0, 0, sc.width, sc.height); sg.imageSmoothingEnabled = false;
    for (let i = 0; i < res.length; i++) { const im = new Image(); await new Promise(ok => { im.onload = ok; im.src = res[i][1]; }); const k = Math.min((cw - 8) / im.width, (ch - 4) / im.height), x = (i % cols) * cw + 4, y = Math.floor(i / cols) * (ch + 16);
      sg.drawImage(im, x, y + 14, im.width * k, im.height * k); sg.fillStyle = '#ffd36b'; sg.font = '11px monospace'; sg.fillText(res[i][0], x, y + 10); }
    res.push(['sheet', sc.toDataURL('image/png')]);
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, (process.argv[3] ? process.argv[3] + '-' : '') + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/dr3art/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
