// tools/cqart-shots.mjs - THE CISTERN QUEEN's reworked states, in the real hall (claude/cqart). Not in the suite: god mode, set straight on her show (a picture, not a playtest).
//   PORT=<yours> node tools/cqart-shots.mjs [tag=after]   -> work/claude/shots/cqart/<tag>/*.png (3x crops of the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/shots/cqart', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'underwell'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(10);
    const L = BK.L, A = L.arena; for (const e of BK.enemies()) if (e.t !== 'cisternqueen' && !e.maxHp) e.alive = false;
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
    const q = BK.boss, H = BK.cisternQueenHands(), S = () => H.show();
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 99; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snap = (name, k, crop) => { const W = BK.view.VW, Hh = BK.view.VH, [sx, sy, sw, sh] = crop || [0, 0, W, Hh]; const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const G = S().G, tx = G.mid / 16, set = (o, eo) => { Object.assign(S(), o); Object.assign(q, eo || {}); };
    const W = BK.view.VW, Hh = BK.view.VH;
    /* hold(): n frames with the fight frozen on the state a picture wants (the mode's clock kept long), then the picture is the last frame */
    const hold = (n, fn) => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 99; fn(); BK.sim(1); } fn(); BK.step(1); };
    const floorAt = dx => ({ pose: 'floor', shaftK: null, wallK: 0 });
    /* frame(): the queen (or the wellhead, with qx) set up and held, the hero parked at the arena's east end (the boss camera frames the hall), a crop of w x h game px centred on (centre) at k x */
    const frame = (name, o) => { const { qx, qy, mode = 'walk', st = {}, eo = {}, centre, k = 3, w = 260, h = 170, n = 30, face = 1, pre } = o;
      hold(n, () => { Object.assign(S(), { pose: 'floor', shaftK: null, wallK: 0, ward: 0, stinger: null, scorch: 0, wet: 0, charT: 0, broken: false }, st); Object.assign(q, { x: qx ?? G.mid - 120, y: qy ?? G.floor, mode, modeT: 99, face, gone: 0, open: 0, scorch: st.scorch || 0, flash: 0, guardFx: 0 }, eo); if (pre) pre(); BK.P.x = G.x1 - 24; BK.P.y = G.floor; });
      BK.step(2); const cam = { cx: BK.view.x, cy: BK.view.y };
      const c = centre || [q.x, Math.min(q.y, G.floor) - 50];
      snap(name, k, [Math.round(c[0] - cam.cx - w / 2), Math.round(c[1] - cam.cy - h / 2), w, h]); };
    try { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' })); } catch {}   /* the 'press a key for sound' line */
    hold(260, () => { BK.P.x = G.x1 - 24; BK.P.y = G.floor; });   /* her opening words fade first */
    frame('01-guard', {});
    frame('02-hot', { st: { scorch: 5 } });
    frame('02b-hot-dying', { st: { scorch: 0.8 } });
    frame('03-doused', { st: { wet: 6 } });
    frame('04-blackened', { st: { charT: 8 } });
    frame('04b-blackened-fresh', { st: { charT: 10 } });
    frame('05-stinger-broken', { st: { broken: true } });
    frame('06-reel', { mode: 'reel', st: { broken: true }, eo: { modeT: 1.2 } });
    frame('07-perch', { qx: G.mid, qy: G.beamY, st: { pose: 'shaft', shaftK: 1 }, mode: 'cling' });
    frame('08-perch-spit', { qx: G.mid, qy: G.beamY, st: { pose: 'shaft', shaftK: 1 }, mode: 'spitTell' });
    frame('09-wellhead-bare', { qx: G.x0 + 60, st: {}, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('10a-pour-landing', { qx: G.x0 + 60, st: { bucket: { st: 'down', t: 6.8 } }, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('10b-pour-tipped', { qx: G.x0 + 60, st: { bucket: { st: 'down', t: 6.4 } }, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('10c-pour-runs', { qx: G.x0 + 60, st: { bucket: { st: 'down', t: 5.5 } }, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('10d-pour-drying', { qx: G.x0 + 60, st: { bucket: { st: 'down', t: 3.5 } }, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('11-wellhead-bucket-fall', { qx: G.x0 + 60, st: { bucket: { st: 'fall', t: 0.2 } }, centre: [G.mid, G.beamY - 20], w: 300, h: 150 });
    frame('12-stinger-steel', { mode: 'walk', st: {}, w: 240, h: 170 });
    frame('13-stinger-gold-hot', { mode: 'walk', st: { scorch: 5 }, w: 240, h: 170 });
    frame('14-stinger-gold-stuck', { mode: 'planted', st: { stinger: { x: G.mid - 60, y: G.floor - 6, t: 9, k: 'slam', big: true } }, w: 240, h: 170 });
    /* the stinger at GAME scale: steel (armoured) beside gold (HOT, and stuck in the floor), 2x of the game's own pixels */
    frame('15a-glint-steel-2x', { st: {}, k: 2, w: 150, h: 110, centre: [G.mid - 150, G.floor - 80] });
    frame('15b-glint-gold-hot-2x', { st: { scorch: 5 }, k: 2, w: 150, h: 110, centre: [G.mid - 150, G.floor - 80] });
    frame('15c-glint-gold-stuck-2x', { mode: 'planted', st: { stinger: { x: G.mid - 60, y: G.floor - 6, t: 9, k: 'slam', big: true } }, k: 2, w: 150, h: 110, centre: [G.mid - 80, G.floor - 40] });
    /* the contact sheet: every frame, labelled, at half size */
    const imgs = await Promise.all(res.map(([n, d]) => new Promise(r => { const i = new Image(); i.onload = () => r([n, i]); i.src = d; })));
    const cols = 3, cw = Math.max(...imgs.map(([, i]) => i.width)) / 2, ch = Math.max(...imgs.map(([, i]) => i.height)) / 2 + 14, rows = Math.ceil(imgs.length / cols);
    const sc = document.createElement('canvas'); sc.width = cw * cols; sc.height = ch * rows; const sg = sc.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#101010'; sg.fillRect(0, 0, sc.width, sc.height); sg.font = '11px monospace';
    imgs.forEach(([n, i], k) => { const x = (k % cols) * cw, y = Math.floor(k / cols) * ch; sg.drawImage(i, x, y + 14, i.width / 2, i.height / 2); sg.fillStyle = '#e8e0cc'; sg.fillText(n, x + 4, y + 11); });
    res.push(['contact', sc.toDataURL('image/png')]);
    return res; })()`, 300000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
