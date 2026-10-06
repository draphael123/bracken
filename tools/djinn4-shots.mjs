// tools/djinn4-shots.mjs - THE DJINN4 pass's pictures (claude/djinn4): the pail in the hero's hand (empty, then scooped full), HE REARS UP (his core lit),
// the pail in flight, HE CHOKES (the shared OPEN read: a gold ring, OPEN, a gold clock), and a bail's OPEN ring for comparison. Not in the suite.
//   PORT=8641 node tools/djinn4-shots.mjs <tag>   -> work/claude/djinn4/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/djinn4', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.hud = 'minimal';
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); return pred(); };
    for (const e of BK.enemies()) if (e.t !== 'djinn') e.alive = false; const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); for (let i = 0; i < 210; i++) BK.sim(1);
    const q = BK.boss, S = BK.djinnHands().show(), G = S.G, P = BK.P;
    q.hp = q.maxHp * 0.3; until(() => S.ph === 3 && S.pailsGiven && q.mode !== 'rise', 2400);
    const still = () => { P.hp = P.maxHp; P.x = G.windlass + 60; P.y = G.floor; P.vx = 0; P.vy = 0; P.face = 1; S.tide = { st: 'low', t: 60 }; S.water = 56; };
    for (let i = 0; i < 20; i++) { still(); BK.sim(1); } BK.step(1); snap('1-pail-empty');
    still(); BK.press('talk'); BK.sim(1); for (let i = 0; i < 20; i++) { still(); BK.sim(1); } BK.step(1); snap('2-pail-full');
    q.open = 0; q.mode = 'hover'; q.modeT = 5; S.ward = 0; S.marks = []; S.hand = null; q.x = P.x + 80;
    S.act++; S.cur = { k: 'slam', id: S.act, x: P.x, y: G.floor }; S.marks = [{ x: P.x, y: G.floor, t: 0.9, k: 'slam', key: 'shot' + S.act }]; q.mode = 'slamTell'; q.modeT = 0.9; q.face = -1;
    for (let i = 0; i < 14; i++) { still(); BK.sim(1); } BK.step(1); snap('3-he-rears-up-core-lit');
    still(); BK.press('talk'); BK.sim(1); for (let i = 0; i < 6; i++) { still(); BK.sim(1); } BK.step(1); snap('4-pail-in-flight');
    for (let i = 0; i < 30; i++) { still(); BK.sim(1); } BK.step(1); snap('5-he-chokes-open');
    res.push(['meta', JSON.stringify({ mode: q.mode, open: q.open, chokes: S.n.chokes })]);
    return res; })()`, 600000);
  for (const [name, url] of r) { if (name === 'meta') { console.log(url); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); }
  console.log('wrote', r.length, 'to', out); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
