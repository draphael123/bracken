/* tools/coop-vert.mjs - CO-OP VERTICAL FOLLOW (claude/coopvert, Daniel 11-04 'the AI partner isn't great'): player one walks the climb/well/shaft route of a vertical level (the
   playtest walker; a lift past what it cannot do) with an AI partner behind him; what is measured is how well the AI keeps him in reach: share of samples near him (10 tiles across,
   4 rows up/down), the longest apart, the told catch-up puffs by reason (far / stuck / wait), falls into hazards and deaths. The numbers print as JSON on one line per level.
   PORT=8789 node tools/coop-vert.mjs [levelids]  (default: the set below)   LIMIT=<seconds> caps each walk   HERO=warden BEH=balanced */
import { openLevelPage } from './boss-level.mjs';
import { LEVELS } from '../src/level.js';
import { routeOf } from './level-walk.mjs';
const SET = ['hornetsnest', 'hanging', 'spire', 'skyroad', 'warcairn', 'fallingtower', 'redgorge', 'underwell'];
const argv = process.argv.slice(2).filter(a => !a.startsWith('--')), WANT = argv.length ? argv[0].split(',') : SET;
const TF0 = +(process.env.TF0 || 0), TF1 = +(process.env.TF1 || 0), TRACE = +(process.env.TRACE || 0), HERO = process.env.HERO || 'warden', BEH = process.env.BEH || 'balanced', LIMIT = +(process.env.LIMIT || 420), fails = [], res = {};
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const pg = await openLevelPage({ audio: false, fonts: false }), E = (x, t = 900000) => pg.evalp(x, t);
try {
  await E(`(()=>{window.__keys=()=>{for(const k in BK.keys)BK.keys[k]=false;};
    window.__level=async(id,seats)=>{__keys();BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();BK.aiComp.arm(seats.map(s=>s[0]),seats.map(s=>s[1]),seats.length);const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.sim(5);return BK.players().length;};
    window.__P=n=>BK.players()[n-1];window.__ai=()=>BK.players().find(p=>p.ai);return true;})()`);
  for (const id of WANT) {
    const lv = LEVELS.find(l => l.id === id); if (!lv) { console.log('no level ' + id); continue; }
    const Lb = lv.build(), A = Lb.arena, route = routeOf(lv), stopX = A ? Math.floor(A.x0 / 16) - 3 : 1e9, nodes0 = route.filter(([x]) => x < stopX), nodes = nodes0.length >= 8 ? nodes0 : route;
    const r = await E(`(async()=>{await __level(${JSON.stringify(id)},[[${JSON.stringify(HERO)},${JSON.stringify(BEH)}]]);const PT=await import('/src/playtest.js');const walk=PT.makeBot(BK);BK.god=true;const N=${JSON.stringify(nodes)};
      const a=__P(1),q=__ai(),o={frames:0,lifts:0,samples:0,near:0,maxApart:0,apartRun:0,why:{},stuckMax:0,noWayMax:0,belowSamples:0,fellStart:BK.coopFell?BK.coopFell():0,end:null,err:'',trace:[]};let i=0,bestI=0,still=0,liftF=-999,lw=q.leashes||0;
      for(let f=0;f<60*${LIMIT}&&i<N.length-1;f++){
        while(i<N.length-1&&Math.abs(N[i][0]*16+8-a.x)<20&&Math.abs((N[i][1]+1)*16-a.y)<40)i++;
        if(i>bestI){bestI=i;still=0;}else if(++still>240){i=Math.min(N.length-1,i+3);BK.tp(N[i][0],N[i][1]);a.vx=a.vy=0;still=0;o.lifts++;bestI=i;liftF=f;}
        walk(N[i][0]*16+8);BK.sim(1);o.frames++;if(BK.state!=='play')BK.state='play';
        if((q.leashes||0)>lw){lw=q.leashes;const w=q.leashWhy||'?';o.why[w]=(o.why[w]||0)+1;}
        if(${process.env.HURT ? 1 : 0}){(o.ring||(o.ring=[])).push([f,Math.round(q.x),Math.round(q.y),q.ground?'g':'a',Math.round(q.vy),'goal',Math.round((q.aiS||{}).dbgGoal||0),'rt0',JSON.stringify(((q.aiS||{}).route||[]).slice(0,2)),'hop',(q.aiS||{}).hop?1:0,'P1',Math.round(a.x),Math.round(a.y)].join(' '));if(o.ring.length>40)o.ring.shift();const dn=q.down>0?1:0;if(dn&&!o.wasDn&&o.trace.length<200)o.trace.push(...o.ring.filter((_,k)=>k%3==0).map(r=>'   R '+r),[f,'DOWN',Math.round(q.x),Math.round(q.y),'by',JSON.stringify(q.killer&&q.killer.name||q.killer),'g',q.ground?1:0,'vy',Math.round(q.vy),'P1',Math.round(a.x),Math.round(a.y),'hazT',q.hazT>0?1:0,(BK.enemies?BK.enemies():[]).filter(e=>e.alive&&Math.abs(e.x-q.x)<90&&Math.abs(e.y-q.y)<90).map(e=>e.t).join('+')]);o.wasDn=dn;}
        const S=q.aiS||{};o.stuckMax=Math.max(o.stuckMax,S.stuckT||0);o.noWayMax=Math.max(o.noWayMax,S.noWayT||0);
        if(${TF0}>0&&f>=${TF0}&&f<${TF1}&&f%6===0){const S2=q.aiS||{};o.trace.push([f,'P1',Math.round(a.x),Math.round(a.y),'AI',Math.round(q.x),Math.round(q.y),q.ground?'g':'a','vx',Math.round(q.vx),'vy',Math.round(q.vy),'route',JSON.stringify((S2.route||[]).slice(0,4)),'nw',S2.noWay?1:0,'dn',Math.round((q.down||0)*10)/10,'hp',Math.round(q.hp),'stk',Math.round((S2.stuckT||0)*10)/10,'foe',(BK.enemies?BK.enemies():[]).filter(e=>e.alive&&Math.abs(e.x-q.x)<150&&Math.abs(e.y-q.y)<80).map(e=>e.t+':'+Math.round(e.x-q.x)+','+Math.round(e.y-q.y)).join('+'),'keys',Object.keys(BK.keys).filter(k=>BK.keys[k]).join('+')].join(' '));}
        if(${TRACE}&&f%20===0&&(Math.abs(q.y-a.y)>48||Math.abs(q.x-a.x)>160||S.stuckT>1.5)&&o.trace.length<${TRACE}+${TF1})o.trace.push([f,'P1',Math.round(a.x),Math.round(a.y),'AI',Math.round(q.x),Math.round(q.y),q.ground?'g':'a',q.climb?'cl':'','stk',+(S.stuckT||0).toFixed(1),'nw',S.noWay?1:0,'rt',S.route?S.route.length:-1,'lf',f-liftF,q.leashWhy||'',(q.leash||0).toFixed?(+q.leash).toFixed(1):''].join(' '));
        if(f%30===0&&f-liftF>360){o.samples++;const dx=Math.abs(q.x-a.x)/16,dy=(q.y-a.y)/16;if(dx<=10&&Math.abs(dy)<=4)o.near++;if(dx>12||Math.abs(dy)>5){o.apartRun+=0.5;o.maxApart=Math.max(o.maxApart,o.apartRun);}else o.apartRun=0;if(dy>4)o.belowSamples++;}
      }
      for(let f=0;f<60*8;f++){__keys();BK.sim(1);}
      o.end=BK.aiComp.seats()[0];o.reached=i>=N.length-1;o.gapEnd=+(Math.abs(q.x-a.x)/16+Math.abs(q.y-a.y)/16).toFixed(1);o.pulls=q.leashes||0;o.deaths=o.end&&o.end.deaths;o.nodes=N.length;return o;})()`);
    res[id] = r; if (r.trace) for (const t of r.trace) console.log('   T ' + t);
    console.log(id + ' ' + JSON.stringify({ secs: Math.round(r.frames / 60), nodes: r.nodes, reached: r.reached, lifts: r.lifts, nearPct: Math.round(100 * r.near / Math.max(1, r.samples)), maxApartS: r.maxApart, pulls: r.pulls, why: r.why, stuckMax: +r.stuckMax.toFixed(1), noWayMax: +r.noWayMax.toFixed(1), below: r.belowSamples, gapEnd: r.gapEnd, deaths: r.deaths }));
    ok(r.reached, id + ': player one walked the route (' + r.lifts + ' lifts)');
    ok(r.near / Math.max(1, r.samples) >= (+process.env.NEAR || 0.5), id + ': AI near him most of the climb (' + Math.round(100 * r.near / Math.max(1, r.samples)) + '%)');
    ok(r.maxApart <= (+process.env.APART || 12), id + ': never apart longer than the catch-up allows (' + r.maxApart + ' s)');
    ok(r.pulls - r.lifts <= (+process.env.PULLS || 6), id + ': catch-up puffs beyond the harness lifts stay rare (' + (r.pulls - r.lifts) + ')');
  }
} finally { pg.close(); }
console.log(fails.length ? '\ncoop-vert: ' + fails.length + ' FAILED' : '\ncoop-vert: GREEN');
process.exit(fails.length ? 1 : 0);
