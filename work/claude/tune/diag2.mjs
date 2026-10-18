import { openRetry, fightJs, diffJs } from '../../../tools/boss-run.mjs';
const [h, s, secs] = process.argv.slice(2);
const pg = await openRetry();
try { await pg.reload(); await pg.evalp(diffJs());
  const { js } = fightJs({ r: 'flotilla', way: 'practiced', h, s: +s, profile: 'human', flasks: 'kit' }, +secs);
  const row = await pg.evalp(js, 1200000);
  console.log(row.outcome, row.secs, row.bossLeft, row.taken);
  console.log(JSON.stringify(await pg.evalp('(()=>{const H=BK.championHands(),r=H.read();const b=BK.enemies().find(e=>e.t==="champion");return {px:Math.round(BK.P.x),py:Math.round(BK.P.y),ground:BK.P.ground,hp:BK.P.hp,bx:b&&Math.round(b.x),bmode:b&&b.mode,why:r.why,vx:Math.round(BK.P.vx),duck:BK.P.ducking,climb:BK.P.climb,swim:BK.P.swim,dodge:BK.P.dodge,hurt:BK.P.hurt,inv:BK.P.inv,atk:BK.P.atk,keys:Object.keys(BK.keys).filter(k=>BK.keys[k]),mode:r.mode,hull:[r.G.hulls,r.G.floorY],guns:BK.props().filter(q=>q.t==="cannon"&&q.deck).map(q=>[Math.round(q.x),q.cool||0]),st:BK.P.st,nq:BK.rg&&BK.rg().q}})()')));
} finally { pg.close(); }
