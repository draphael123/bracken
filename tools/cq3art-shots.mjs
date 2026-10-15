// tools/cq3art-shots.mjs - THE CISTERN QUEEN 3 states: thrash, sag, slip, tail, jars, the burst cue, in the real hall (claude/cq3art). Not in the suite: god mode, set straight on her show (a picture, not a playtest).
//   PORT=<yours> node tools/cq3art-shots.mjs [tag=after]   -> work/claude/shots/cq3art/<tag>/*.png (3x crops of the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/shots/cq3art', tag); mkdirSync(out, { recursive: true });
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
    const tail = (x, k, t = 4) => ({ x, y: G.floor - 6, t, k, big: true });
    const qx0 = G.mid - 120;
    frame('01-guard', {});
    frame('02a-thrash-early', { mode: 'thrash', st: { scorch: 0.75 }, eo: { modeT: 0.75 } });
    frame('02b-thrash-late', { mode: 'thrash', st: { scorch: 0.25 }, eo: { modeT: 0.25 } });
    frame('03a-sag', { mode: 'ablaze', eo: { open: 4, modeT: 4 }, st: { stinger: tail(qx0 - 76, 'ablaze') } });
    frame('03b-sag-2x', { mode: 'ablaze', k: 2, w: 220, h: 120, centre: [qx0 - 20, G.floor - 40], eo: { open: 2, modeT: 2 }, st: { stinger: tail(qx0 - 76, 'ablaze', 2) } });
    frame('04a0-skid', { mode: 'slip', n: 3, eo: { open: 4.35, modeT: 4 }, st: { stinger: tail(qx0 - 76, 'slip') } });
    frame('04a-slip', { mode: 'slip', eo: { open: 3, modeT: 3 }, st: { stinger: tail(qx0 - 76, 'slip', 3) } });
    frame('04b-slip-2x', { mode: 'slip', k: 2, w: 220, h: 120, centre: [qx0 - 20, G.floor - 40], eo: { open: 2, modeT: 2 }, st: { stinger: tail(qx0 - 76, 'slip', 2) } });
    frame('04c-thrash-3x', { mode: 'thrash', k: 3, w: 200, h: 150, centre: [qx0, G.floor - 60], st: { scorch: 0.75 }, eo: { modeT: 0.75 } });
    frame('05-fallen', { mode: 'fallen', eo: { open: 4, modeT: 4 }, st: { stinger: tail(qx0 - 76, 'fallen') } });
    frame('06-soaked', { mode: 'soaked', eo: { open: 4, modeT: 4 }, st: { stinger: tail(qx0 - 76, 'soaked') } });
    frame('07-blackened', { st: { charT: 8 } });
    frame('08a-burst-bulge', { qx: qx0, st: { pose: 'burrow', mound: { x: qx0, t: 2, wet: 0 }, cur: { x: qx0 } }, mode: 'burrow', eo: { gone: 1 }, w: 220, h: 110, centre: [qx0, G.floor - 30], pre: () => {} });
    frame('08b-burst-tell', { qx: qx0, st: { pose: 'burrow', mound: { x: qx0, t: 2, wet: 0 }, cur: { x: qx0 } }, mode: 'strikeTell', eo: { gone: 1, modeT: 0.9 }, w: 220, h: 110, centre: [qx0, G.floor - 30] });
    frame('08c-burst-NOW', { qx: qx0, st: { pose: 'burrow', mound: { x: qx0, t: 2, wet: 0 }, cur: { x: qx0 } }, mode: 'strikeTell', eo: { gone: 1, modeT: 0.3 }, w: 220, h: 110, centre: [qx0, G.floor - 30] });
    frame('09-jars-rack', { k: 4, w: 120, h: 80, centre: [S().racks[0].x, G.floor - 20] });
    frame('09b-jars-rack-2x', { k: 2, w: 260, h: 110, centre: [S().racks[0].x + 40, G.floor - 30] });
    frame('11a-jar-fly', { k: 3, w: 160, h: 90, centre: [qx0 + 120, G.floor - 50], pre: () => { S().splashes = []; S().jars = [{ t: 'cqjar', state: 'fly', x: qx0 + 120, y: G.floor - 60, vx: 140, vy: -40, holder: null, counted: true }]; } });
    frame('11b-shatter-early', { k: 3, w: 160, h: 90, centre: [qx0 + 120, G.floor - 40], pre: () => { S().jars = []; S().splashes = [{ x: qx0 + 120, y: G.floor - 8, fy: G.floor, t: 0.1 }]; } });
    frame('11c-shatter-mid', { k: 3, w: 160, h: 90, centre: [qx0 + 120, G.floor - 40], pre: () => { S().jars = []; S().splashes = [{ x: qx0 + 120, y: G.floor - 8, fy: G.floor, t: 0.4 }]; } });
    frame('11d-shatter-late', { k: 3, w: 160, h: 90, centre: [qx0 + 120, G.floor - 40], pre: () => { S().jars = []; S().splashes = [{ x: qx0 + 120, y: G.floor - 8, fy: G.floor, t: 0.75 }]; } });
    frame('12-oil-glow-2x', { k: 2, w: 330, h: 110, centre: [G.mid, G.floor - 30], qx: G.x1 - 90 });
    frame('10-tail-gold-open-1x', { mode: 'ablaze', k: 1, w: 330, h: 150, centre: [qx0 - 20, G.floor - 60], eo: { open: 4, modeT: 4 }, st: { stinger: tail(qx0 - 76, 'ablaze') } });
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
