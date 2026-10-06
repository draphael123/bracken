// tools/canal4art-shots.mjs - THE LEGGING TUNNEL's and JENNY's RAFT's art-pass pictures (claude/canal4art). Not in the suite. god mode: a picture, not a playtest.
//   usage: PORT=8662 node tools/canal4art-shots.mjs <before|after>   -> work/claude/lane-done/canal4art/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/lane-done/canal4art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = []; const RR = await import("/src/canal-rig.js");
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'canal'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const C = () => BK.canal();
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, bx, hx, hy, lamp, n = 90) => { fresh(); const st = C(); st.barge = RR.newBarge(st, bx * TS, "weir"); st.lamp = lamp; if (hy > 0) BK.tp(hx, hy); else { BK.P.x = st.barge.x + (hx - bx) * TS + 8; BK.P.y = st.barge.y - 2; BK.P.vx = BK.P.vy = 0; } run(n); res.push([name+"-info", JSON.stringify({cam: BK.cam, P: [BK.P.x/TS, BK.P.y/TS], barge: st.barge.x/TS, hp: BK.P.hp})]); snap(name); };
    at('t1-mouth-lit', 250, 253, 0, true);
    at('t2-mouth-dim', 250, 253, 0, false);
    at('t3-stopplanks-lit', 284, 287, 14, true);
    at('t4-stopplanks-dim', 284, 287, 14, false);
    at('t5-windlass', 288, 293, 14, true);
    at('t6-nest-lit', 300, 303, 0, true);
    at('t6b-nest-dim', 300, 303, 0, false);
    at('t7-moon-shaft', 306, 308, 0, false);
    at('t8-deep-lock-top', 322, 328, 14, true);
    at('t9-deep-lock-below', 336, 338, 0, true);
    res.push(['info2', 'done']);
    return res; })()`);
  for (const [n, d] of r) { if (d.startsWith('data:')) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64')); else console.log(n, d); }
} finally { pg.close(); }
