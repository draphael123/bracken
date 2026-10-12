// tools/dr4-shots.mjs - DEEP RAILS 4 pictures (claude/deeprails4, the Opus greybox: the art lane's reference). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8868 node tools/dr4-shots.mjs <group[,group]>  -> work/claude/shots/dr4/<name>.png (crops from the game's canvas) + sheet.png (every crop, labelled)
//   groups: drill (the gear tower per phase, each gear's windup pose, a broken gear, the jam's slump and lift, the floor), rails (the duck + switch sections),
//           sides (the switch-sides track), raiders (the cart combat stretch)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const groups = (process.argv[2] || 'drill,rails,sides,raiders').split(',');
const out = join(ROOT, 'work/claude/shots/dr4'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const G = ${JSON.stringify(groups)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snapZ = (name, sx, sy, sw, sh, k) => { const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const zoom = (name, wx, wy, w, h, k) => { const V = BK.view; snapZ(name, Math.round(wx - V.x - w / 2), Math.round(wy - V.y - h / 2), w, h, k || 5); };
    const full = name => snapZ(name, 0, 0, BK.view.VW, BK.view.VH, 2);
    const rowAt = x => { let best = null; for (const [a, b, row] of BK.L.mcTrack) if (x >= a && x <= b && (best === null || row > best)) best = row; return best; };
    const at = (x, row) => { const rw = row || rowAt(x); BK.tp(x, rw - 1); BK.minecart().cart(BK.P).v = 0; run(10); BK.look(x, rw - 1); };
    const MH = BK.minecart();
    if (G.includes('drill')) {
      const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); MH.cart(BK.P).v = 0; run(10); for (let i = 0; i < 160; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.look(A.start[0], A.start[1] - 3);
      const GD = await import('/src/great-drill.js'); const H = BK.drillHands(), S = H.show(), b = BK.enemies().find(e => e.t === 'greatdrill');
      const force = (ph, i) => { S.ph = ph; b.phase = ph; S.i = i; S.cd = 9; S.oreT = 99; S.lever = null; S.chute = null; S.lunge = null; S.hook = null; S.snag = null; S.dyn = []; S.dynPend = []; S.spots = []; S.rocks = []; b.mode = 'idle'; b.open = 0; S.ward = 0; S.highDown = ph === 3; GD.armGears(S); };
      const go = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 3 === 0) BK.step(1); } BK.step(1); };
      const tower = nm => zoom(nm, GD.rearX(S) + 30, S.G.laneY[1] - 10, 150, 150, 4);
      force(1, 0); go(6); full('g1-p1-tower-full'); tower('g1b-p1-tower');
      force(2, 0); go(6); tower('g2-p2-tower'); force(3, 0); go(6); tower('g3-p3-tower');
      /* each gear-driven windup: its pose and its gear spun up */
      for (const [ph, i, nm] of [[1, 0, 'g4-dynamite-windup'], [2, 0, 'g5-lunge-windup'], [2, 2, 'g6-chain-windup'], [1, 2, 'g7-rocks-windup'], [3, 0, 'g8-collapse-windup']]) { force(ph, i); S.cd = 0; go(10); tower(nm); }
      /* a gear broken: smoking, stopped, the stall */
      force(1, 0); const c0 = { number: () => {}, sound: () => {}, shake: () => {} }; GD.hitGear(b, S, 'dyn', 999, c0); go(4); tower('g9-dyn-broken-stall'); go(40); tower('g10-broken-later');
      /* THE JAM: the slump coming in, held, and lifting as the window closes */
      force(1, 0); S.oreT = 0; go(24); if (S.lever) S.lever.x = BK.P.x + 4; H.interact(BK.P); go(30); full('j1-jam-full'); tower('j1b-jam-early');
      go(60); tower('j2-jam-held'); while (b.open > 0.25) go(4); tower('j3-jam-lifting'); go(30); tower('j4-plates-up');
      /* the gate: its gears hold it */
      force(1, 0); b.hp = Math.round(b.maxHp * 0.6) + 1; go(4); full('k1-gate-holds');
      /* THE FLOOR (Daniel's photo: the final phase) */
      force(3, 0); go(20); full('f1-p3-floor');
    }
    if (G.includes('rails')) {
      for (const [nm, id, x] of [['r1-yard-switch', 'yardSw', 151], ['r2-drift-switch', 'driftSw', 180], ['r3-works-switch', 'worksSw', 755], ['r4-exam-switch', 'examSw', 865]]) { MH.setPoints(id, 'open'); at(x - 9); full(nm); }
    }
    if (G.includes('sides')) { at(788, 27); full('s1-twin-teach'); at(806, 27); full('s2-twin-test'); at(797, 30); full('s3-low-side-beam'); MH.setPoints('twinA', 'open'); at(789, 27); run(30); full('s4-side-switch-dropped'); MH.setPoints('twinA', 'set'); at(856, 27); full('s5-exam-fork'); }
    if (G.includes('raiders')) { BK.tp(812, 29); MH.cart(BK.P).v = 150; for (let i = 0; i < 240; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); const c = MH.state().carts.find(q => q.raid && q.tell > 0); if (c) { BK.step(1); full('w' + (c.boarding ? 'b' : 't') + '-raider-' + (c.boarding ? 'boarding' : 'throw') + '-' + i); break; } } for (let i = 0; i < 300; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); const c = MH.state().carts.find(q => q.raid && q.tell > 0 && q.boarding); if (c) { BK.step(1); full('w2-raider-boarding'); break; } } BK.sim(40); BK.step(1); full('w3-after'); }
    /* the contact sheet */
    const cols = 3, cw = 600, ch = 340, rows = Math.ceil(res.length / cols), sc = document.createElement('canvas'); sc.width = cols * cw; sc.height = rows * (ch + 16); const sg = sc.getContext('2d'); sg.fillStyle = '#0b0910'; sg.fillRect(0, 0, sc.width, sc.height); sg.imageSmoothingEnabled = false;
    for (let i = 0; i < res.length; i++) { const im = new Image(); await new Promise(ok => { im.onload = ok; im.src = res[i][1]; }); const k = Math.min((cw - 8) / im.width, (ch - 4) / im.height), x = (i % cols) * cw + 4, y = Math.floor(i / cols) * (ch + 16);
      sg.drawImage(im, x, y + 14, im.width * k, im.height * k); sg.fillStyle = '#ffd36b'; sg.font = '11px monospace'; sg.fillText(res[i][0], x, y + 10); }
    res.push(['sheet', sc.toDataURL('image/png')]);
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, (process.argv[3] ? process.argv[3] + '-' : '') + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/dr4/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
