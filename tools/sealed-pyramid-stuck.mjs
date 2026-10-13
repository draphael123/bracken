// tools/sealed-pyramid-stuck.mjs - THE SEALED PYRAMID's GLINT AND 10 s NUDGE, IN THE PAGE (claude/sealedpyramid). tools/stuck.mjs runtime holds the shared guide's
// spots (src/stuck-spots.js STUCK); a level whose hands run their own guide (STUCK_HANDS.sealedpyramid, src/sealed-pyramid-hands.js stall) is held here: for every
// ROUTE need (the robbers' hole, the first counterweight, the weighed pair, the great stone's plate, the second pit, the last shaft) a hero is stood still at a stall
// point in its zone, foes cleared, for 19 s of frames (> 10 s of game time at the 0.6 sim step): the guide must glint that need and say its nudge. The sealed tomb's
// door is a reward, not a route need (it glints only once four seals are carried).
//   PORT=8864 node tools/sealed-pyramid-stuck.mjs
import { openPage } from './cdp.mjs';
import { STUCK_HANDS } from '../src/stuck-spots.js';
const pg = await openPage({ audio: false, fonts: false });
try {
  const spots = STUCK_HANDS.sealedpyramid.filter(sp => sp.id !== 'py-vault').map(sp => ({ id: sp.id, zone: sp.zone, steps: sp.steps }));
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const li = LEVELS.findIndex(l => l.id === 'sealedpyramid'); const out = [];
    const stand = ${JSON.stringify({ 'py-hole': [60, 13], 'py-cw1': [172, 29], 'py-weigh': [205, 39], 'py-great': [262, 29], 'py-pit2': [350, 43], 'py-shaft': [432, 50], 'py-vault': [399, 50], 'py-flood1': [871, 47], 'py-flood2': [915, 53] })};   /* (claude/pyramidlevel: the sluices - the cistern's and the crypt's floors) */
    for (const sp of ${JSON.stringify(spots)}) { BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(5);
      for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      if (sp.id === 'py-vault') { for (let i = 0; i < 4; i++) BK.straysGot && BK.straysGot.add && BK.straysGot.add(1000 + i); }
      const [c, rr] = stand[sp.id]; BK.tp(c, rr); BK.sim(10); const K = BK.sealedPyramid(), n0 = K.n.nudges; let glint = null;
      for (let i = 0; i < 60 * 19; i++) { BK.sim(1); if (K.glint) glint = K.glint.key; BK.P.vx = 0; }
      out.push({ id: sp.id, nudged: K.n.nudges - n0, line: K.lastNudge || null, glint, at: [Math.round(BK.P.x / 16), Math.round(BK.P.y / 16) - 1] }); }
    return out; })()`, 900000);
  let bad = 0; for (const x of r) { if (!(x.nudged > 0)) bad++; console.log((x.nudged > 0 ? 'ok   ' : 'MISS ') + x.id.padEnd(10) + ' nudges ' + x.nudged + '  glint ' + x.glint + '  "' + x.line + '"  at ' + x.at);
  }
  console.log(bad ? bad + ' route need(s) never nudged' : 'ok  sealed-pyramid-stuck: every route need glints and nudges'); console.log('errors', pg.errors.slice(0, 5)); if (bad || pg.errors.length) process.exitCode = 1;
} finally { pg.close(); }
