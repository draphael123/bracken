// where does the 'first' ride leave the hero? trace the last seconds near the tower's foot
import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
    for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
    const L = BK.L, li = 0, ln = L.cableway.lines[0], P = BK.P, end = ln.pts[ln.pts.length-1];
    let m=null; for (let f=0; f<1200 && !m; f++){ BK.sim(1); m = BK.movers().find(q=>q.kind==='bucket'&&q.line===li&&q.vis&&!q.cracked&&Math.abs(q.x+q.w/2-(ln.pts[0][0]+44))<10); }
    P.x=m.x+m.w/2; P.y=m.y-1; P.vx=0; P.vy=0; BK.sim(2);
    const log=[]; const k=BK.keys; let wait=0;
    for (let f=0; f<3600; f++){ k.left=k.right=k.jump=false;
      const on=P.onMover;
      if (!on && P.ground && Math.abs(P.x-end[0])>40){ const TS=16,row=Math.floor((P.y+1)/TS),ahead=Math.floor((P.x+12)/TS),step=P.x+14;
        const t=L.grid[row*L.W+ahead]; const deck=t===lvm.T.SOLID||t===lvm.T.PLANK||t===lvm.T.ONEWAY||t===lvm.T.NET;
        const skip=deck||BK.movers().some(q=>q.kind==='bucket'&&q.line===li&&q.vis&&!(q.fallen>0)&&step>q.x&&step<q.x+q.w&&q.y>P.y-3&&q.y<P.y+40);
        if(skip) k.right=true; }
      BK.sim(1);
      if (P.x > 128*16 && f%6===0) log.push([f, Math.round(P.x), Math.round(P.y), on?('m'+on.i+(on.vis?'':'H')):'-', P.ground?1:0, P.onMover?Math.round(P.onMover.x+P.onMover.w/2):null]);
      if (P.dead) { log.push('DEAD'); break; }
      if (log.length>80) break;
    }
    return { end, log, tiles: [134,135,136,137,138].map(c=>[c,[35,36,37,38,39].map(r=>L.grid[r*L.W+c])]) };
  })()`, 300000);
  console.log(JSON.stringify(r.end), JSON.stringify(r.tiles));
  for (const x of r.log) console.log(JSON.stringify(x));
  console.log('errors', JSON.stringify(pg.errors.slice(0,3)));
} finally { pg.close(); }
