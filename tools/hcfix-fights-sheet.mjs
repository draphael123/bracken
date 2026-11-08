/* tools/hcfix-fights-sheet.mjs [out.png] - HCFIX: one labelled contact sheet of BOTH Highcrown fights, in the real page (one headless page, not in the suite).
   THE GOBLIN QUEEN: her intro, the bell lure, the winch gate rising, the grate pin, and one still per told move (its tell on screen: the windup and the mark).
   THE GOBLIN PRINCESS (the fat gpart art): her intro, then the RANGER's arrows landing on the bell rope, on a thrown gem and on the winch in the blaze (the timed pin).
   Every still is taken after ~60 frames of settling (a fresh scene, the camera come to rest) before the moment it shows.
   Writes the sheet (default work/claude/shots/hcfix-fights/sheet.png) and one PNG a still beside it. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
const outSheet = process.argv[2] ? (process.argv[2].includes(':') ? process.argv[2] : join(ROOT, process.argv[2])) : join(ROOT, 'work/claude/shots/hcfix-fights/sheet.png');
const dir = join(dirname(outSheet), 'stills'); mkdirSync(dir, { recursive: true });
const pg = await openPage();
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const log = []; const labels = [];
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const frames = [];
    const snap = (id, label) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); frames.push({ c, label: (frames.length + 1) + '. ' + label }); log.push(id + ': ' + label); };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = 9; };
    const run = k => { for (let i = 0; i < k; i++) { hold(); BK.step(1); } };
    const lvl = LEVELS.findIndex(l => l.id === 'crown');
    const fresh = h => { for (const k in BK.keys) BK.keys[k] = false; BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { [h]: 1e6 }); BK.setHero(h); BK.load(lvl); BK.start(); BK.god = true; BK.sim(30); run(60); };
    /* ======== THE GOBLIN QUEEN ======== */
    const qWake = h => { fresh(h); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); return A; };
    const Q = () => BK.enemies().find(e => e.t === 'gqueen' && e.alive) || BK.boss;
    { qWake('knight'); for (let i = 0; i < 70; i++) { run(1); const q = Q(); if (q && q.mode === 'wake' && i > 30) break; } const q = Q(); snap('q-intro', 'QUEEN: her intro (' + (q ? q.mode : '-') + '), the Princess peeks out: MOTHER! HIM!'); }
    const qReady = () => { const A = qWake('knight'); run(260); const q = Q(); if (q) { q.x = Math.max(A.x0 + 60, Math.min(A.x1 - 200, BK.P.x + 140)); q.y = A.floor; q.vx = 0; q.mode = 'stand'; q.modeT = 1.5; q.crownCd = 99; q.portalCd = 99; } run(60); return { A, q: Q() }; };
    /* the bell lure: a real swing on the hall bell, her charge, then the grate */
    { const { A, q } = qReady(); const b = BK.props().find(p => p.t === 'winch' && p.bell); log.push('bell ' + (b ? Math.round(b.x / 16) + ' gate ' + b.gate : 'none'));
      if (b && q) { BK.P.x = b.x - 6; BK.P.y = A.floor; BK.P.face = 1; q.x = b.gate * 16 + 8 + 150; q.mode = 'stand'; q.modeT = 2; run(60); BK.P.x = b.x - 6; BK.P.face = 1; BK.P.atk = -1; BK.press('atk');
        let lured = false; for (let i = 0; i < 40; i++) { run(1); if (Q().mode === 'lure') { lured = true; if (i > 14) break; } } snap('q-lure', 'QUEEN: the hall bell struck - she STORMS to the sound (' + Q().mode + ')');
        for (let i = 0; i < 300 && Q().mode !== 'pinned'; i++) { run(1); BK.P.x = Math.min(BK.P.x, b.gate * 16 + 8 - 70); } run(10); snap('q-pin', 'QUEEN: the grate drops on her - PINNED, the opening (' + Q().mode + ')'); } }
    /* the winch gate: at 66 % of her hall bar the west gate rises for her guards */
    { const { A, q } = qReady(); if (q) { q.hp = Math.round(q.maxHp * 0.64); run(40); const w = BK.gqHands() && BK.gqHands().read ? BK.gqHands().read() : null; snap('q-gate', 'QUEEN: at 66 % the WEST GATE rises, the horn runs - strike the winch 3x (' + JSON.stringify(w && w.mech ? { wave: w.mech.wave } : {}) + ')'); } }
    /* her told moves in the hall: the crown toss, the portal shards */
    for (const k of ['crown', 'portal']) { const { q } = qReady(); if (!q) continue; const m = BK.gqHands().test.start(k); run(Math.round(60 * 0.35)); snap('q-tell-' + k, 'QUEEN TELL: ' + (k === 'crown' ? 'CROWN TOSS (! parry it: stunned)' : 'PORTAL SHARDS (! parry a shard)') + ' - ' + Q().mode); }
    /* the tower top (phase two): every told move there */
    for (const k of ['lash', 'lash2', 'ambush', 'geyser', 'leap', 'crown']) { const { q } = qReady(); if (!q) continue; const r = BK.gqHands().skipRoof ? BK.gqHands().skipRoof() : false; run(60); const e = Q(); if (!e) continue;
      e.mode = 'stand'; e.modeT = 2; e.crownCd = e.portalCd = 99; run(10); if (k === 'lash2') { BK.gqHands().test.start('lash'); run(30); e.mode = 'stand'; e.modeT = 2; run(5); }
      const m = BK.gqHands().test.start(k === 'lash2' ? 'lash' : k); run(k === 'ambush' ? 30 : 20); snap('q-roof-' + k, 'QUEEN P2 TELL: ' + ({ lash: 'LASH', lash2: 'LASH (the other height)', ambush: 'AMBUSH (! the portal glows behind you)', geyser: 'RUBBLE GEYSER (!! jump the marked tiles)', leap: 'LEAP AND QUAKE (!!)', crown: 'CROWN TOSS on the tower top (!)' })[k] + ' - ' + Q().mode + ' (stage ' + (BK.gqStage ? BK.gqStage() : '-') + ')'); }
    /* ======== THE GOBLIN PRINCESS (the ranger) ======== */
    const GH = () => BK.gprincessHands && BK.gprincessHands(); const gp = () => BK.enemies().find(q => q.t === 'gprincess' && q.alive);
    const pWake = () => { fresh('ranger'); BK.tp(628, 21); for (let i = 0; i < 100; i++) { run(1); const e = gp(); if (e && e.mode === 'wake' && i > 20) break; } };
    pWake(); snap('p-intro', 'PRINCESS: her intro in the bell tower - TSK! YOU AGAIN? (' + (gp() ? gp().mode : '-') + ')');
    const A = () => BK.L.mini; const fl = () => A().floor;
    /* an arrow on the rope rings the bell */
    { pWake(); run(60); const e = gp(); if (e) { e.x = 640 * 16; e.mode = 'walk'; e.modeT = 3; } BK.P.x = A().rope + 56; BK.P.y = fl(); BK.P.face = -1; run(60); BK.P.face = -1; BK.P.atk = -1; BK.press('atk');
      let rung = false; for (let i = 0; i < 40; i++) { run(1); const F = GH().fight(); if (F && F.M.rings) { rung = true; if (i > 3) break; } } snap('p-rope', 'PRINCESS: an ARROW on the bell rope rings it (rings ' + (GH().fight() ? GH().fight().M.rings : '-') + ')');
      /* the blaze, and an arrow in the winch inside it: the timed pin */
      const W = A().winch; for (let i = 0; i < 400; i++) { const F = GH().fight(); BK.P.x = W - 70; BK.P.y = fl(); BK.P.face = 1; BK.P.vx = 0; run(1); if (F && F.bolt && F.bolt.state === 'ready') break; }
      snap('p-blaze', 'PRINCESS: she bolts under the grate - it BLAZES (NOW!): strike the winch (' + (GH().fight().bolt ? GH().fight().bolt.state : '-') + ')');
      BK.P.face = 1; BK.P.atk = -1; BK.press('atk'); for (let i = 0; i < 30 && gp() && gp().mode !== 'pinned'; i++) { BK.P.x = W - 70; run(1); } run(8); snap('p-pin', 'PRINCESS: an ARROW in the winch in the blaze - the grate drops: PINNED (' + (gp() ? gp().mode : '-') + ', pins ' + GH().fight().n.pins + ')'); }
    /* a thrown gem met with an arrow */
    { pWake(); run(60); const e = gp(); if (e) { e.x = BK.P.x + 110; e.y = fl(); e.face = -1; e.mode = 'walk'; e.modeT = 2; } run(60); const e2 = gp(); if (e2) { e2.mode = 'trinketTell'; e2.modeT = 0.3; }
      let shot = false, knocked = false; for (let i = 0; i < 120; i++) { const F = GH().fight(); const g = F && F.gems.find(q => !q.away && Math.abs(q.x - BK.P.x) < 70 && q.y > BK.P.y - 24); if (g && !shot) { BK.P.face = Math.sign(g.x - BK.P.x) || 1; BK.P.atk = -1; BK.press('atk'); shot = true; }
        run(1); if (F && F.n.knocked && !knocked) { knocked = true; run(3); break; } }
      snap('p-gem', 'PRINCESS: an ARROW knocks her thrown gem away (knocked ' + (GH().fight() ? GH().fight().n.knocked : '-') + ')'); }
    /* the sheet: 3 across */
    const cols = 3, rows = Math.ceil(frames.length / cols), sheet = document.createElement('canvas'); sheet.width = 640 * cols; sheet.height = 360 * rows; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#000'; sg.fillRect(0, 0, sheet.width, sheet.height);
    frames.forEach((f, i) => { const x = (i % cols) * 640, y = Math.floor(i / cols) * 360; sg.drawImage(f.c, x, y); sg.fillStyle = 'rgba(0,0,0,0.72)'; sg.fillRect(x, y + 336, 640, 24); sg.fillStyle = '#ffd36b'; sg.font = '13px monospace'; sg.fillText(f.label.slice(0, 92), x + 6, y + 352); sg.strokeStyle = '#333'; sg.strokeRect(x + 0.5, y + 0.5, 639, 359); });
    return { shots, sheet: sheet.toDataURL('image/png'), n: frames.length, log }; })()`, 1200000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(outSheet, Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(outSheet, d.n, 'stills'); console.log(d.log.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
