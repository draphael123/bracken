// tools/bc2art-states.mjs - THE BURIED CITY's rule in motion, for eyes (claude/bc2art): the sand rooms filling and draining, the street sinking, the heap piling, the trap hall fed, the great gate. -> work/claude/shots/bc2art/state-*.png + states.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/bc2art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'buriedcity'); const res = [];
    const shot = (name) => { BK.step(1); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png')]); };
    const fresh = () => { BK.load(i); BK.start(); BK.god = true; BK.sim(300); return BK.buriedCity(); };
    let K = fresh(); const room = id => K.rooms.find(r => r.id === id);
    room('first').gate = 'open'; BK.tp(60, 35); BK.sim(40); shot('first-draining');
    K = fresh(); room('granary').gate = 'shut'; BK.tp(146, 35); BK.sim(160); shot('granary-filling');
    K = fresh(); room('street').gate = 'open'; BK.tp(215, 27); BK.sim(40); shot('street-sinking'); BK.sim(160); shot('street-down');
    K = fresh(); K.chutes[0].at = 'wall'; BK.tp(372, 41); BK.sim(260); shot('sluice-heap'); K.chutes[0].at = 'grate'; BK.tp(358, 41); BK.sim(30); shot('sluice-grate');
    K = fresh(); room('trap').gate = 'shut'; K.chutes[1].at = 'hall'; BK.tp(542, 31); BK.sim(200); shot('trap-fed');
    K = fresh(); K.wheel.turns = 2; room('great').gate = 'open'; room('great').drain = 3; BK.tp(402, 35); BK.sim(60); shot('great-gate');
    return res; })()`);
  const names = []; for (const [n, d] of r) { writeFileSync(join(out, 'state-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); names.push(n); }
  console.log(names.join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
