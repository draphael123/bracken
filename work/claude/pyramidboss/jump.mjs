// work/claude/pyramidboss/jump.mjs - can each hero jump from the burial chamber's floor onto a side ledge? (a probe)
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { console.log(await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const out=[];
  for (const h of ['knight','warden','pyro']) { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.state = 'play'; BK.god = true; BK.sim(5);
    for (const e of BK.enemies()) if (e.t==='tombking') e.alive=false;
    const P = BK.P, k = BK.keys, L = BK.L, ly = L.arena.tk.ledges[1].y * 16; P.x = 1038*16 + 8; P.y = L.arena.floor; P.vx=0; P.vy=0; BK.sim(10); let minY = 999;
    BK.press('jump'); for (let i = 0; i < 50; i++) { k.jump = i < 18; k.right = i > 2 && i < 30; BK.sim(1); minY = Math.min(minY, P.y); } k.jump=false; k.right=false; BK.sim(20);
    out.push(h+': apex feet '+minY.toFixed(1)+' (ledge '+ly+') end y '+P.y.toFixed(1)+' x '+(P.x/16).toFixed(1)); }
  return out.join(' | '); })()`, 120000)); } finally { pg.close(); }
