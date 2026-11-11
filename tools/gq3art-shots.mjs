/* tools/gq3art-shots.mjs [outDir] - THE GQ3 ART PHOTOGRAPHED IN THE REAL PAGE (claude/gq3art): the page's own 320x180 buffer at 2x to work/claude/shots/gq3art/ (or outDir) plus a contact sheet.
   GQ3_GROUPS=princess,stair,geode,tower,roof,flee picks parts. ONE headless page (>= 1500 MB free; stop if scratch\GATE-RUNNING.flag exists). Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, process.argv[2] || 'work/claude/shots/gq3art'); mkdirSync(dir, { recursive: true });
const GROUPS = process.env.GQ3_GROUPS ? process.env.GQ3_GROUPS.split(',') : ['princess', 'stair', 'geode', 'tower', 'roof', 'flee'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const shots = {}; const G = ${JSON.stringify(GROUPS)}; const info = {};
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); cg.imageSmoothingEnabled = false;
    const snap = (id) => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    const snapAt = (id, wx, wy, w = 160, h = 90) => { const cxv = BKT.camX, cyv = BKT.camY; const sx = Math.round(wx - cxv - w / 2), sy = Math.round(wy - cyv - h / 2); if (!Number.isFinite(sx) || !Number.isFinite(sy)) return snap(id); cg.clearRect(0, 0, 640, 360); cg.drawImage(BK.buf, sx, sy, w, h, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
    const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = Math.max(BK.P.inv || 0, 0.5); };
    const run = n => { for (let i = 0; i < n; i++) { hold(); BK.step(1); } };
    const fresh = () => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30); run(60); };
    const toQueen = () => { fresh(); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300); return BK.boss; };
    /* ---- THE PRINCESS DIES ---- */
    if (G.includes('princess')) { fresh(); const M = BK.L.mini; BK.tp(Math.round(M.trigger / 16) + 1, Math.round(M.floor / 16) - 1); run(300);
      const e = BK.enemies().find(q => q.t === 'gprincess' && q.alive); info.princess = !!e;
      if (e) { BK.P.x = e.x - 80; e.hp = 3; BKT.hurtEnemy(e, 50, e.x - 10, false); let k = 0; const at = [4, 20, 36, 44, 62, 82, 100, 115, 140, 260];
        for (let i = 0; i <= 260; i++) { if (at.includes(i)) snapAt('princess-' + String(k++).padStart(2, '0') + '-' + i, e.x, e.y - 24); BK.P.hp = BK.P.maxHp; BK.step(1); } } }
    /* ---- THE QUEEN'S STAIR ---- */
    if (G.includes('stair')) { fresh(); const spots = [['gate', 652, 19], ['gate2', 659, 13], ['landing', 666, 11], ['catwalk', 676, 7], ['grille', 680, 5], ['ledge', 683, 4], ['store', 688, 8], ['store2', 697, 8], ['alcove', 687, 19], ['gallery', 708, 11]];
      for (const [id, x, y] of spots) { BK.tp(x, y); run(50); snap('stair-' + id); } }
    /* ---- THE GEODE LOB ---- */
    if (G.includes('geode')) { const e = toQueen(); const A = BK.L.arena; info.geode = !!(e && e.t === 'gqueen');
      if (info.geode) { const H = BK.gqHands(); e.x = Math.min(A.x1 - 80, BK.P.x + 130); e.y = A.floor; e.mode = 'stand'; e.modeT = 0; e.crownCd = e.portalCd = 99; H.test.geodeBegin(); let k = 0; const at = [8, 30, 55, 80, 100, 118, 128, 140, 160];
        for (let i = 0; i <= 200; i++) { if (at.includes(i)) snapAt('geode-' + String(k++).padStart(2, '0') + '-' + i + '-' + e.mode, (e.x + BK.P.x) / 2, e.y - 38, 240, 135); BK.P.hp = BK.P.maxHp; BK.step(1); } } }
    /* ---- THE BURNING TOWER ---- */
    if (G.includes('tower')) { const e = toQueen(); if (e && e.t === 'gqueen') { e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); const H = BK.gqHands(), E = BK.L.gqEscape, F = E.tower.FLOORS;
        snap('tower-0-hall-portal'); BK.tp(E.portal.x, E.portal.y); run(30); snap('tower-1-foot'); BK.tp(795, F[1] - 1); run(75); snap('tower-2-smoke-or-burn'); run(70); BK.tp(790, F[2] - 1); run(10); snap('tower-3-floor-burning-below');
        let got = { tell: 0, fall: 0, hop: 0 }; for (let i = 0; i < 60 * 30 && (got.tell < 1 || got.fall < 1 || got.hop < 1); i++) { hold(); BK.step(1); const r = H.read(); if (r.esc && r.esc.beams > 0 && !got.tell) { got.tell = 1; snap('tower-4-beam-tell'); run(63); if (H.read().esc.beams > 0) { got.fall = 1; snap('tower-5-beam-fall'); } else got.fall = 1; }
          const es = BK.gqHands().test && BK.gqHands().test.esc ? BK.gqHands().test.esc() : null; void es; if (r.esc && r.esc.queenK != null && i % 30 === 0 && !got.hop && i > 600) { snap('tower-6-queen-' + i); got.hop = 1; } }
        info.tower = got; } }
    /* ---- THE TOWER TOP: P2 ---- */
    if (G.includes('roof')) { const e = toQueen(); if (e && e.t === 'gqueen') { e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); const H = BK.gqHands(), E = BK.L.gqEscape; BK.tp(E.portal.x, E.portal.y); run(60); info.skip = H.skipRoof(); run(150);
        snap('roof-0-arena'); BK.tp(792, 19); run(30); snap('roof-1-hatch'); BK.tp(806, 19); run(30); snap('roof-2-cupola'); BK.tp(782, 19); run(40); snap('roof-3-west'); BK.tp(830, 15); run(40); snap('roof-4-east-parapet');
        BK.tp(812, 19); const seen = new Set(); for (let i = 0; i < 60 * 100 && seen.size < 12; i++) { hold(); BK.step(1); const q = BK.boss; if (q && q.alive && q.stage === 'roof' && !seen.has(q.mode) && !['roofStand', 'rec', 'stand', 'gone'].includes(q.mode)) { seen.add(q.mode); snap('roof-5-' + q.mode); } if (i % 400 === 399) BK.tp(812, 19); } info.modes = [...seen]; } }
    /* ---- THE QUEEN FLEES ---- */
    if (G.includes('flee')) { const e = toQueen(); if (e && e.t === 'gqueen') { e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); const H = BK.gqHands(), E = BK.L.gqEscape; BK.tp(E.portal.x, E.portal.y); run(60); info.skip = H.skipRoof(); run(150);
        e.hp = 1; BKT.hurtEnemy(e, 500, e.x - 10, false); BK.P.x = e.x - 90; BK.P.y = e.y; let k = 0; const at = [10, 40, 56, 70, 85, 100, 116, 132, 150, 170, 200];
        for (let i = 0; i <= 220; i++) { if (at.includes(i)) snapAt('flee-' + String(k++).padStart(2, '0') + '-' + i + '-' + e.mode, e.x - 20, e.y - 34, 200, 112); BK.P.hp = BK.P.maxHp; BK.step(1); } } }
    const SH = [["princess-02", "1. THE PRINCESS: reel / kneel-ringing"], ["princess-04", "1b. the last ring, the collapse"], ["princess-08", "1c. her body, the tiara rolled"], ["stair-gate2", "2. THE QUEEN'S STAIR: the dropped portcullis"], ["stair-catwalk", "2b. the wind stair catwalk"], ["stair-store", "2c. the geode store: weights"], ["stair-gallery", "2d. the gallery over her door"], ["geode-02", "3. GEODE LOB: the tell"], ["geode-05", "3b. the lob"], ["tower-3", "4. BURNING TOWER: floors catching"], ["tower-4", "4b. a beam told"], ["tower-5", "4c. the beam falls"], ["roof-0", "5. P2 ARENA: the tower top"], ["roof-2", "5b. the bell cupola"], ["roof-5-geyser", "5c. a P2 move"], ["flee-04", "6. QUEEN ESCAPES: kneel / slam"], ["flee-06", "6b. the royal portal opens"], ["flee-09", "6c. backing in"]];
    const keys = Object.keys(shots), sel = SH.map(([p, l]) => [keys.find(k => k.startsWith(p)), l]).filter(([k]) => k); const cols = 3, rows = Math.ceil(sel.length / cols); const sheet = document.createElement("canvas"); sheet.width = 640 * cols; sheet.height = 360 * rows; const sg = sheet.getContext("2d");
    for (let i = 0; i < sel.length; i++) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = shots[sel[i][0]]; }); const x = (i % cols) * 640, y = Math.floor(i / cols) * 360; sg.drawImage(im, x, y); sg.fillStyle = "rgba(0,0,0,0.65)"; sg.fillRect(x, y + 338, 640, 22); sg.fillStyle = "#ffd36b"; sg.font = "15px monospace"; sg.fillText(sel[i][1], x + 6, y + 354); }
    return { shots, info, sheet: sheet.toDataURL("image/png") }; })()`, 280000);
  for (const [id, png] of Object.entries(d.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  writeFileSync(join(dir, 'sheet.png'), Buffer.from(d.sheet.split(',')[1], 'base64'));
  console.log(dir, Object.keys(d.shots).length, 'shots', JSON.stringify(d.info)); console.log('errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { await pg.close(); }
