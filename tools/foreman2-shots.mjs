// tools/foreman2-shots.mjs - FOREMAN2 proof pictures (claude/proof146b). Not in the suite. god mode, pictures not a playtest.
//   usage: PORT=8861 node tools/foreman2-shots.mjs <outdir>   -> <outdir>/f2-*.png (crops from the game's canvas)
//   stills: plates off per stomp stage (0..3), the stomp debris burst, the braced cart, the points notches on the rail, + a numeric braced-poke check
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const out = resolve(process.argv[2] || 'shots'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [], info = {};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snapZ = (name, sx, sy, sw, sh, k) => { const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const zoom = (name, wx, wy, w, h, k) => { const V = BK.view; snapZ(name, Math.round(wx - V.x - w / 2), Math.round(wy - V.y - h / 2), w, h, k || 5); };
    const full = (name) => snapZ(name, 0, 0, BK.view.VW, BK.view.VH, 2);
    const MH = BK.minecart();
    const M = BK.L.mini; BK.tp(Math.round(M.trigger/16)+1, Math.round(M.floor/16)-1); run(150);
    const F = () => MH.foreman(); const e = F().e, S = () => F().S, fc = () => F().cart;
    const idle = () => { S().ward = 0; S().mode = 'idle'; S().mT = 5; S().cd = 9; e.flash = 0; };
    for (const st of [0, 1, 2, 3]) { idle(); S().stomps = st; for (let i = 0; i < 3; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); zoom('f2-stomps' + st + '-front', fc().x, fc().y - 14, 90, 60, 7); }
    /* the stomp itself: hero lands on his cart -> debris burst + sparks */
    idle(); S().stomps = 0; BK.P.x = fc().x; BK.P.y = S().G.topY - 26; BK.P.vy = 160; BK.P.ground = false;
    for (let i = 0; i < 4; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
    info.stompsAfter = S().stomps; info.modeAfter = S().mode;
    for (const k of [0, 2, 4, 7]) { BK.sim(k ? 2 : 0); BK.step(1); zoom('f2-stomp-burst-' + k, fc().x - 6, fc().y - 20, 120, 80, 5); }
    /* braced: he lurches us off, spikes up */
    idle(); S().stomps = 2; S().ward = 0.4; S().mode = 'away'; BK.step(1); zoom('f2-brace-rising', fc().x, fc().y - 14, 90, 60, 7); S().ward = 2.4; BK.step(1); zoom('f2-brace-up', fc().x, fc().y - 14, 90, 60, 7);
    info.wardT = (await import('/src/foreman.js')).FOREMAN.wardT; info.bracedPoke = (await import('/src/foreman.js')).FOREMAN.bracedPoke;
    /* THE POINTS: notches ahead of the gap on the rail */
    idle(); S().stomps = 1; S().tipQ = [{ t: 0.001, gap: true }]; S().mode = 'idle';
    for (let i = 0; i < 400; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); const L0 = (S().lumps || []).find(l => l.gap); if (L0) { for (const [nm, n] of [['a', 0], ['b', 10], ['c', 14]]) { BK.sim(n); BK.step(1); full('f2-points-notches-' + nm); const L1 = (S().lumps || []).find(l => l.gap); if (L1) zoom('f2-points-notches-zoom-' + nm, L1.x - 30, BK.P.y, 220, 90, 4); } info.pointsFound = i; break; } }
    return { res, info }; })()`, 900000);
  console.log(JSON.stringify(r.info));
  for (const [name, d] of r.res) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  console.log('console errors: ' + pg.errors.length + (pg.errors.length ? ' ' + pg.errors.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
