// work/claude/dkmother-diag.mjs - WHERE THE MOTHER CAP FIGHT'S TIME GOES, per hero (refill mode, the dice pinned exactly as tools/mother-pilot.mjs pins them:
// all six heroes in its order, one page). It wraps BK.sim to log every fight frame, then splits the fight into knot windows.
//   node work/claude/dkmother-diag.mjs            SALT=3 for another pinned roll; RAW=1 OUT=x.json keeps every frame
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const heroes = (process.env.HEROES || 'knight,pyro,paladin,pirate,reaper,warden').split(',');
const salt = process.env.SALT || '';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    BK.manualSimulation=true;window.__RAW=${JSON.stringify(!!process.env.RAW)};
    const realSim=BK.sim; const logs={}; let cur=null;
    BK.sim=function(n){
      const b=BK.boss; const P=BK.P;
      if(n===1&&b&&b.t==='mother'&&BK.bossActive&&cur){
        const node=BK.props().find(p=>p.motherNode); const heart=b.heart;
        const s={f:cur.f++,m:b.mode,rest:b.nodeRest||0,hhp:heart?heart.hp:null,px:P.x,py:P.y,vy:P.vy,atk:P.atk,st:P.st,nx:node?node.x:null,ny:node?node.y:null,hx:heart?heart.x:null,hy:heart?heart.y:null,g:P.ground,bx:b.x,heavy:!!P.heavy,sk:P.swingKind,adds:BK.enemies().filter(q=>q.alive&&q.fromMother).map(q=>[Math.round(q.x-P.x),Math.round(q.y-P.y),q.hp,q.mode||""]),cm:P.combo};
        const pre=P.atk;
        const res=realSim.call(this,n);
        s.swingStart=(pre<0&&P.atk>=0);
        s.after={m:b.mode,hhp:heart?heart.hp:null};
        cur.fr.push(s);
        return res;
      }
      return realSim.call(this,n);
    };
    const out={};
    for(const h of ${JSON.stringify(heroes)}){
      cur={f:0,fr:[]};
      const r=await BK.bossLab({bosses:['spore'],heroes:[h],healthMode:'refill',maxSecs:180${salt ? `,salt:${JSON.stringify(salt)}` : ''}});
      const row=r.rows[0]; const fr=cur.fr;
      /* cycles */
      const cyc=[];let c={start:0};
      for(let i=0;i<fr.length;i++){const s=fr[i];
        if(s.m!=='open'&&s.after.m==='open'){c.open=i;c.restAtOpen=s.rest;}
        if(c.open!==undefined&&c.ready===undefined)c.ready=null;
        if(s.m==='open'&&s.swingStart){c.hs=(c.hs||0)+1;c.sw=c.sw||[];c.sw.push([i-c.open,Math.round(s.px-s.hx),Math.round(s.py-s.hy),Math.round(s.vy),s.g?1:0,s.sk||'']);}
        if(s.m!=='open'&&s.swingStart){c.ns=(c.ns||0)+1;}
        if(s.m==='open'&&s.after.m!=='open'){c.close=i;c.hit=s.after.hhp<s.hhp;cyc.push(c);c={start:i+1};}
      }
      /* when the knot rest reached 0 after each close */
      for(const cc of cyc){let i=cc.start;while(i<fr.length&&fr[i].rest>0)i++;cc.readyAt=i;}
      out[h]={raw:(window.__RAW?fr:undefined),secs:row.secs,killed:row.killed,swings:row.swings,frames:fr.length,cyc:cyc.map(x=>({start:x.start,readyAt:x.readyAt,open:x.open,close:x.close,hit:x.hit,winF:x.close-x.open,reachF:x.open-x.readyAt,heartSwings:x.hs||0,nodeSwings:x.ns||0,sw:(x.sw||[]).slice(0,12)})),row:Object.fromEntries(Object.entries(row).filter(([k])=>!['samples'].includes(k)))};

    }
    BK.sim=realSim;
    return out;
  })()`, 900000);
  writeFileSync(process.env.OUT || 'diag.json', JSON.stringify(r, null, 1));
  for (const [h, o] of Object.entries(r)) {
    const hits = o.cyc.filter(c => c.hit).length, miss = o.cyc.filter(c => !c.hit).length;
    console.log(h, 'secs', o.secs, 'killed', o.killed, 'windows', o.cyc.length, 'hits', hits, 'missed', miss,
      'avgReach(s)', (o.cyc.reduce((a, c) => a + c.reachF, 0) / o.cyc.length / 60).toFixed(2),
      'avgHitWin(s)', (o.cyc.filter(c => c.hit).reduce((a, c) => a + c.winF, 0) / Math.max(1, hits) / 60).toFixed(2),
      'heartSwings', o.cyc.reduce((a, c) => a + c.heartSwings, 0));
  }
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
