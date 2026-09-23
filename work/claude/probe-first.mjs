// localise the first-span ride failure: trace the hero frame by frame and say what took him off the line.
import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
    const killed = []; for (const e of BK.enemies()) if (!e.maxHp) { e.alive = false; killed.push(e.t); }
    const L = BK.L, li = L.cableway.lines.findIndex(l => l.id === 'first'), ln = L.cableway.lines[li], P = BK.P;
    const end = ln.pts[ln.pts.length - 1], dir = Math.sign(end[0] - ln.pts[0][0]);
    const alive = BK.enemies().filter(e => e.alive).map(e => e.t + '@' + Math.round(e.x/16));
    let m = null; for (let f = 0; f < 60 * 20 && !m; f++) { BK.sim(1); m = BK.movers().find(q => q.kind === 'bucket' && q.line === li && q.vis && !q.cracked && Math.abs(q.x + q.w / 2 - (ln.pts[0][0] + dir * 44)) < 10); }
    if (!m) return { why: 'no bucket came out' };
    P.x = m.x + m.w / 2; P.y = m.y - 1; P.vx = 0; P.vy = 0; BK.sim(2);
    const tr = []; let hp = P.hp, f = 0, walks = 0; const k = BK.keys;
    for (; f < 60 * 60; f++) {
      k.left = k.right = k.jump = false;
      const on = P.onMover;
      if (on && on.cracked && on.crackT > 0.25 && P.ground) { k[dir > 0 ? 'right' : 'left'] = true; BK.press('jump'); P.labHop = 14; }
      if (P.labHop > 0) { P.labHop--; k.jump = true; k[dir > 0 ? 'right' : 'left'] = true; }
      else if (!on && P.ground && Math.abs(P.x - end[0]) > 40) { k[dir > 0 ? 'right' : 'left'] = true; walks++; }
      const wasOn = !!P.onMover, wasG = P.ground;
      BK.sim(1);
      const nowOn = !!P.onMover;
      /* record: any change of footing, any loss of health, and every frame once he is falling past the deck row */
      if (wasOn !== nowOn || wasG !== P.ground || P.hp !== hp)
        tr.push({ f, x: +(P.x/16).toFixed(1), y: +(P.y/16).toFixed(1), vy: Math.round(P.vy), on: nowOn ? 'bucket' : '-', ground: !!P.ground, hp: P.hp, why: P.hp !== hp ? 'HURT' : (wasOn && !nowOn ? 'left bucket' : nowOn && !wasOn ? 'boarded' : P.ground ? 'landed' : 'left ground') });
      hp = P.hp;
      if (P.dead) { tr.push({ f, x: +(P.x/16).toFixed(1), y: +(P.y/16).toFixed(1), why: 'DEAD' }); break; }
      if (!P.onMover && P.ground && Math.abs(P.x - end[0]) < 40 && Math.abs(P.y - end[1]) < 6) break;
    }
    /* and where the buckets were when he last left the ground */
    return { killed: [...new Set(killed)], alive, end: [Math.round(end[0]/16), Math.round(end[1]/16)], frames: f, walks, dead: !!P.dead, trace: tr.slice(-40) };
  })()`, 300000);
  console.log(JSON.stringify(r, null, 1));
  console.log('page errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
