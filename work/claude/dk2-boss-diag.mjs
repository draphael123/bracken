// work/claude/dk2-boss-diag.mjs - WHERE A BOSS FIGHT'S TIME GOES, per hero (bossLab, dice pinned, refill mode unless MODE=normal).
// It wraps BK.sim to see every fight frame and splits the fight by the boss's mode: seconds in each mode, the damage dealt in it,
// the swings started in it and how many of them touched the boss (P.hitSet), and each VULNERABLE window (VULN=stuck,reel) with
// where the hero stood when it opened, when his first swing came, and whether it drew blood.
//   BOSS=reef HEROES=knight,reaper VULN=stuck,reel node work/claude/dk2-boss-diag.mjs      SALT=n  MAXSECS=120  OUT=x.json
//   GQ=1 also logs the Goblin Queen's chandeliers: every drop, what it hit, and the bot's cut at it
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const heroes = (process.env.HEROES || 'knight,pyro,paladin,pirate,reaper,warden,geomancer').split(',');
const boss = process.env.BOSS || 'reef', vuln = (process.env.VULN || '').split(',').filter(Boolean);
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    BK.manualSimulation=true;const VULN=${JSON.stringify(vuln)};
    const realSim=BK.sim;let cur=null;
    BK.sim=function(n){
      const b=BK.boss,P=BK.P;
      if(n!==1||!b||!BK.bossActive||!cur)return realSim.call(this,n);
      const m=b.mode,hp0=b.hp,a0=P.atk,dx=Math.round(P.x-b.x),dy=Math.round(P.y-b.y),blk=!!BK.keys.block,gr=!!P.ground;
      const chs=${!!process.env.GQ}?BK.props().filter(p=>p.t==='weight'&&p.gq).map(p=>p.state):null;
      const res=realSim.call(this,n);
      const s=cur.mode[m]=cur.mode[m]||{f:0,dmg:0,sw:0,swHit:0,blockF:0,airF:0};
      s.f++;s.dmg+=Math.max(0,hp0-b.hp);if(blk)s.blockF++;if(!gr)s.airF++;
      if(a0<0&&P.atk>=0){s.sw++;cur.swing={m,f:cur.f,dx,dy,swim:!!P.swim,ground:gr,vy:Math.round(P.vy),bx:Math.round(b.x),by:Math.round(b.y),bh:b.h,face:P.face,hit:false,kind:P.swingKind||'',heavy:!!P.heavy};cur.swings.push(cur.swing);}
      if(cur.swing&&P.atk>=0&&P.hitSet&&P.hitSet.has(b)&&!cur.swing.hit){cur.swing.hit=true;cur.mode[cur.swing.m].swHit++;}
      if(P.atk<0)cur.swing=null;
      /* vulnerable windows */
      const vin=VULN.includes(b.mode),vwas=VULN.includes(m);
      if(vin&&!vwas){cur.win={f:cur.f,dx:Math.round(P.x-b.x),dy:Math.round(P.y-b.y),dmg:0,firstSw:null,sw:0,hitSw:0};}
      if(cur.win){cur.win.dmg+=Math.max(0,hp0-b.hp);if(a0<0&&P.atk>=0){cur.win.sw++;if(cur.win.firstSw===null)cur.win.firstSw=cur.f-cur.win.f;}}
      if(cur.win&&!vin){cur.win.len=cur.f-cur.win.f;cur.wins.push(cur.win);cur.win=null;}
      if(chs){BK.props().filter(p=>p.t==='weight'&&p.gq).forEach((p,i)=>{if(chs[i]!==p.state)cur.ch.push([cur.f,i,chs[i]+'>'+p.state,Math.round(p.x-b.x),Math.round(p.x-P.x),b.mode,Math.max(0,hp0-b.hp)]);});}
      cur.f++;return res;
    };
    const out={};
    try{for(const h of ${JSON.stringify(heroes)}){
      cur={f:0,mode:{},swings:[],swing:null,wins:[],win:null,ch:[]};
      const r=await BK.bossLab({bosses:[${JSON.stringify(boss)}],heroes:[h],healthMode:${JSON.stringify(process.env.MODE || 'refill')},maxSecs:${+(process.env.MAXSECS || 120)}${process.env.SALT ? ',salt:' + JSON.stringify(process.env.SALT) : ''},modes:true});
      const row=r.rows[0];
      out[h]={secs:row.secs,killed:row.killed,hpLeftPct:row.hpLeftPct,swings:row.swings,hitBy:row.hitBy,frames:cur.f,
        mode:Object.fromEntries(Object.entries(cur.mode).map(([k,v])=>[k,{s:+(v.f/60).toFixed(1),dmg:v.dmg,sw:v.sw,swHit:v.swHit,block:+(v.blockF/60).toFixed(1),air:+(v.airF/60).toFixed(1)}])),
        wins:cur.wins,ch:cur.ch,swingList:cur.swings,swingsMissedByMode:cur.swings.filter(x=>!x.hit).reduce((a,x)=>(a[x.m]=(a[x.m]||0)+1,a),{})};
    }}finally{BK.sim=realSim;}
    return out;
  })()`, 3600000);
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(r, null, 1));
  for (const [h, o] of Object.entries(r)) {
    console.log('\n' + h, 'secs', o.secs, o.killed ? 'KILLED' : 'alive ' + o.hpLeftPct + '%', 'swings', o.swings);
    const tot = Object.values(o.mode).reduce((a, v) => a + v.dmg, 0);
    for (const [m, v] of Object.entries(o.mode).sort((a, b) => b[1].s - a[1].s)) console.log('  ', m.padEnd(14), String(v.s).padStart(6) + 's', 'dmg', String(v.dmg).padStart(4), 'swings', v.sw, 'touched', v.swHit, 'block', v.block + 's', 'air', v.air + 's');
    if (o.wins.length) { const hit = o.wins.filter(w => w.dmg > 0); console.log('   windows', o.wins.length, 'drew blood', hit.length, 'avg len', (o.wins.reduce((a, w) => a + w.len, 0) / o.wins.length / 60).toFixed(2) + 's',
      'avg |dx| at open', Math.round(o.wins.reduce((a, w) => a + Math.abs(w.dx), 0) / o.wins.length), 'first swing (s)', JSON.stringify(o.wins.map(w => w.firstSw === null ? null : +(w.firstSw / 60).toFixed(2)))); }
    if (o.ch.length) console.log('   chandeliers', JSON.stringify(o.ch));
  }
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
