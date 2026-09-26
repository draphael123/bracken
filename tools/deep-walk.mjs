/* tools/deep-walk.mjs — THE DEEP, WALKED AND LOOKED AT (rule S8; docs/briefs/deep-rework-2.md). Not in the suite.
   The playtest bot's own walker (src/playtest.js makeBot) on the real page, from the shelf to the Diving Bell's door, no god mode,
   with what it cost written down PER SECTION (the level's own named zones, L.deep.zones): blows taken, health lost, deaths, least
   breath, and where it had to be lifted. The Deep is a level you go DOWN, and the walker only knows across: it strokes for the
   surface whenever there is water over its head, so on its own it never leaves the shelf. This tool gives it the one thing it
   lacks - the way on is the nearest opening in the next band of rock or deck under it, and while its breath holds it swims DOWN
   to it - and everything else (the fighting, the jumping, the air, the stones it walks into) is the walker's own.
   Then one capture per section, in god mode with the level as built, into work/deep2/<tag>-*.png.
     node tools/deep-walk.mjs <tag> [hero] [steps]      e.g. node tools/deep-walk.mjs before knight 30000 */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const [tag = 'now', hero = 'knight', steps = '30000'] = process.argv.slice(2);
const out = new URL('../work/deep2/', import.meta.url); mkdirSync(out, { recursive: true });
const pg = await openPage({ fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');const PT=await import('/src/playtest.js');
    BK.manualSimulation=true;BK.SET.speed=1;BK.SET.sfx=0;BK.SET.music=false;const TS=16,idx=LEVELS.findIndex(l=>l.id==='deep');
    const boot=()=>{BK.setHero('${hero}');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);};
    boot();const L=BK.L,W=L.W,at=(x,y)=>x<0||y<0||x>=W||y>=L.H?1:L.grid[y*W+x],hard=t=>t===T.SOLID||t===T.PLANK;
    const zones=(L.deep.zones||[]).slice().sort((a,b)=>(a.x0>=104?1e4+a.x0:a.y0)-(b.x0>=104?1e4+b.x0:b.y0));   /* the route order: down the trench, then east along the bottom */
    const secs=zones.map(z=>({name:z.name,x0:z.x0,x1:z.x1,y0:z.y0,y1:z.y1,blows:0,lost:0,deaths:0,lifts:0,frames:0,minBreath:99}));
    const secOf=(x,y)=>{const tx=x/TS,ty=y/TS;return secs.find(s=>tx>=s.x0&&tx<=s.x1+1&&ty>=s.y0&&ty<=s.y1+1)||secs.reduce((b,s)=>Math.abs(ty-(s.y0+s.y1)/2)<Math.abs(ty-(b.y0+b.y1)/2)?s:b,secs[0]);};
    const A=L.arena,gate=L.ents.find(e=>e.t==='gate'),bed=Math.round(A.floor/TS)-1;
    /* THE WAY ON: the nearest opening in the next band under you (a row that is mostly rock or deck across the trench), or, on the bed, the door */
    const wayOn=(tx,ty)=>{for(let y=ty+1;y<bed;y++){let n=0;for(let x=6;x<=105;x++)if(hard(at(x,y)))n++;if(n<70)continue;
        const runs=[];let a=-1;for(let x=6;x<=106;x++){const o=x<=105&&!hard(at(x,y));if(o&&a<0)a=x;if(!o&&a>=0){runs.push([a,x-1]);a=-1;}}
        if(!runs.length)continue;const best=runs.sort((p,q)=>Math.abs((p[0]+p[1])/2-tx)-Math.abs((q[0]+q[1])/2-tx))[0];return{x:(best[0]+best[1]+1)*TS/2,y:(y+1)*TS,band:y};}
      return{x:A.trigger+2*TS,y:A.floor,band:null};};
    const prog=(x,y)=>Math.floor(y/TS)*4+(y/TS>bed-12?x/TS:0);
    BK.god=false;let bot=PT.makeBot(BK),hp=BK.P.hp,d0=BK.stats().deaths,dieAt=[],best=-1e9,still=0,reached=false,f=0,liftsAt=[];
    const lift=()=>{const P=BK.P,cur=secOf(P.x,P.y),i=secs.indexOf(cur),nx=secs[i+1];if(!nx)return false;
      const c=L.ents.filter(e=>e.t==='check'&&e.x>=nx.x0&&e.x<=nx.x1&&e.y>=nx.y0&&e.y<=nx.y1+1).sort((a,b)=>a.y-b.y||a.x-b.x)[0];
      const [x,y]=c?[c.x,c.y]:[Math.round((nx.x0+nx.x1)/2),nx.y0+2];liftsAt.push(cur.name);cur.lifts++;BK.tp(x,y);BK.P.hp=BK.P.maxHp;BK.P.dead=0;bot=PT.makeBot(BK);best=-1e9;still=0;return true;};
    for(f=0;f<${+steps};f++){if(BK.state!=='play')break;const P=BK.P,tx=Math.floor(P.x/TS),ty=Math.floor(P.y/TS),way=wayOn(tx,ty);
      const res=bot(way.x);
      if(P.swim&&way.band!==null){const br=P.breath??6;if(br>2.5){BK.keys.up=false;const over=Math.abs(P.x-way.x)<20;BK.keys.down=over||hard(at(tx,ty+1))===false;}}
      BK.sim(1);const s=secOf(P.x,P.y);s.frames++;if(P.swim)s.minBreath=Math.min(s.minBreath,+(P.breath??99).toFixed(1));
      if(P.hp<hp){s.blows++;s.lost+=hp-P.hp;}hp=P.hp;
      const pr=prog(P.x,P.y);if(pr>best){best=pr;still=0;}else still++;
      const dn=BK.stats().deaths;if(dn>d0){d0=dn;s.deaths++;dieAt.push(Math.round(P.y/TS));if(dieAt.length>=3&&Math.abs(dieAt[dieAt.length-1]-dieAt[dieAt.length-3])<6){dieAt=[];if(!lift())break;}}
      if(res==='stuck'||still>1500){if(!lift())break;}
      if(P.x>=A.trigger&&Math.abs(P.y-A.floor)<5*TS){reached=true;break;}}
    const walk={hero:'${hero}',frames:f,reachedDoor:reached,deepestRow:Math.round(BK.P.y/TS),deaths:BK.stats().deaths,lifted:liftsAt,
      secs:secs.map(s=>({name:s.name,rows:s.y0+'-'+s.y1,blows:s.blows,lost:Math.round(s.lost),deaths:s.deaths,lifts:s.lifts,seconds:+(s.frames/60).toFixed(1),minBreath:s.minBreath===99?null:s.minBreath}))};
    /* THE LOOK: one frame a section, the level as built, nothing killed - by the section's first checkpoint, or its middle */
    const shots={};
    for(const s of secs){boot();BK.god=true;const c=L.ents.filter(e=>e.t==='check'&&e.x>=s.x0&&e.x<=s.x1&&e.y>=s.y0&&e.y<=s.y1+1).sort((a,b)=>a.y-b.y||a.x-b.x)[0];
      const[x,y]=c?[c.x+2,c.y]:[Math.round((s.x0+s.x1)/2),Math.round((s.y0+s.y1)/2)];BK.tp(x,y);BK.sim(240);BK.tp(x,y);for(let i=0;i<70;i++)BK.step(1);
      shots[s.name.replace(/[^A-Z]+/g,'-').replace(/^-|-$/g,'').toLowerCase()]=document.querySelector('canvas').toDataURL('image/png');}
    return {walk,shots};})()`, 2400000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(new URL(tag + '-' + k + '.png', out), Buffer.from(v.split(',')[1], 'base64'));
  writeFileSync(new URL('walk-' + tag + '.json', out), JSON.stringify(r.walk, null, 1));
  console.log(JSON.stringify(r.walk, null, 1)); console.log(Object.keys(r.shots).length + ' captures in work/deep2/' + tag + '-*.png');
  if (pg.errors.length) { console.log('PAGE ERRORS', pg.errors.slice(0, 5)); process.exitCode = 1; }
} finally { pg.close(); }
