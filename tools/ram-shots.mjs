// tools/ram-shots.mjs - the Ram Lord's new looks as pictures (claude/scree3). Not in the suite.
//   usage: OUT=<dir> node tools/ram-shots.mjs     -> stomp tell, stomp release (+0.1 s, +0.5 s), boulder tell, boulder rolling, prop armed / in-line / spent
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || 'work/claude/scree3-shots'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const RL = await import('/src/ram-lord.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'scree')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const L = BK.level, A = L.arena, TS = 16;
    for (const e of BK.enemies()) if (!e.boss && e.t !== 'ram') e.alive = false;
    BK.tp(Math.floor((A.x0 + A.x1) / 2 / TS), Math.round(A.floor / TS) - 1); for (let i = 0; i < 200 && !BK.bossActive; i++) BK.sim(1);
    const b = BK.boss, P = BK.P, lips = BK.ramLips(); BK.sim(120);
    const snap = (name) => { const c = document.createElement('canvas'); const SC = 3; c.width = BK.view.VW * SC; c.height = BK.view.VH * SC; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const frames = (n, keep) => { for (let i = 0; i < n; i++) { if (keep) keep(); P.hp = P.maxHp; BK.sim(1); if (i % 2 === 0) BK.step(1); } BK.step(1); };
    const mid = (A.x0 + A.x1) / 2;
    /* stomp: tell, then release */
    b.hp = b.maxHp; b.x = mid; b.y = A.floor; P.x = mid + 100; P.y = A.floor; b.ward = 0; b.mode = 'stampTell'; b.modeT = 0.5; b.vx = 0;
    frames(30, () => { b.vx = 0; }); snap('stomp-1-tell');
    frames(30, () => { b.vx = 0; P.x = mid + 100; }); snap('stomp-2-release');
    frames(22, () => { b.vx = 0; P.x = mid + 100; }); snap('stomp-3-waves');
    frames(14, () => { b.vx = 0; P.x = mid + 100; b.mode = 'pace'; b.modeT = 99; }); snap('stomp-4-fading');
    /* boulder: tell at the east wall, then the boulder rolling */
    b.mode = 'pace'; b.modeT = 99; b.x = A.x1 - 120; P.x = A.x1 - 190; b.face = 1; b.lastB = false; b.bCd = 0; b.bl = { wall: 1, wallX: A.x1 - 22, floor: A.floor, k: 0 }; b.mode = 'boulderTell'; b.modeT = RL.RAM.boulder.tell;
    frames(55, () => { P.x = A.x1 - 190; }); snap('boulder-1-tell');
    frames(48, () => { P.x = A.x1 - 190; }); snap('boulder-2-butt');
    frames(40, () => { P.x = A.x1 - 190; }); snap('boulder-3-rolling');
    /* props: armed, in line (glint), spent */
    b.boulder = null; b.mode = 'pace'; b.modeT = 99; const lip = lips[0]; lip.state = 'armed'; lip.glow = 0; P.x = RL.lipSpot(lip); b.x = A.x1 - 60; frames(8, () => { b.mode = 'pace'; b.modeT = 99; b.x = A.x1 - 60; P.x = RL.lipSpot(lip); }); snap('prop-1-armed');
    b.x = (lip.z0 + lip.z1) / 2; frames(8, () => { b.mode = 'pace'; b.modeT = 99; b.vx = 0; b.x = (lip.z0 + lip.z1) / 2; P.x = RL.lipSpot(lip); }); snap('prop-2-inline');
    lip.state = 'spent'; lip.t = 50; frames(6, () => { b.mode = 'pace'; b.modeT = 99; b.x = A.x1 - 60; P.x = RL.lipSpot(lip); lip.t = 50; }); snap('prop-3-spent');
    return res; })()`, 600000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { await pg.close(); }
