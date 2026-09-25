/* tools/keep-walk.mjs — THE UNDERWATER KEEP, WALKED AND LOOKED AT (rule S8; docs/briefs/keep-rework-2.md). Not in the suite.
   The playtest bot's own greedy walker (src/playtest.js makeBot) on the real page, start to the Drowned King's door, no god mode,
   with what it cost written down PER SECTION (L.keepSections): blows taken, health lost, deaths, and where it had to be lifted.
   Then one capture per section (and the exam), in god mode with the level as built, into work/keep2/<tag>-*.png.
     node tools/keep-walk.mjs <tag> [hero] [steps]      e.g. node tools/keep-walk.mjs before knight 16000 */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const [tag = 'now', hero = 'knight', steps = '16000'] = process.argv.slice(2);
const out = new URL('../work/keep2/', import.meta.url); mkdirSync(out, { recursive: true });
const pg = await openPage({ fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const PT=await import('/src/playtest.js');
    BK.manualSimulation=true;BK.SET.speed=1;BK.SET.sfx=0;BK.SET.music=false;const TS=16,idx=LEVELS.findIndex(l=>l.id==='keep');
    const boot=()=>{BK.setHero('${hero}');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);};
    boot();const L=BK.L,secs=(L.keepSections||[]).map(s=>({...s,blows:0,lost:0,deaths:0,lifts:0,frames:0,minBreath:99}));
    const secOf=x=>{const tx=x/TS;return secs.find(s=>tx>=s.x0&&tx<=s.x1)||secs[secs.length-1];};
    const A=L.arena,goal=A?A.trigger+2*TS:(L.W-3)*TS;BK.god=false;
    let bot=PT.makeBot(BK),hp=BK.P.hp,d0=BK.stats().deaths,dieAt=[],maxX=BK.P.x,reached=false,f=0;
    const lift=()=>{const tx=Math.round(Math.max(maxX,BK.P.x)/TS)+6;for(let x=tx;x<L.W-2;x++)for(let y=2;y<L.H-2;y++){const t=L.grid[(y+1)*L.W+x],a=L.grid[y*L.W+x],b=L.grid[(y-1)*L.W+x];if(t===1&&a===0&&b===0){BK.tp(x,y);BK.P.hp=BK.P.maxHp;BK.P.dead=0;bot=PT.makeBot(BK);return true;}}return false;};
    for(f=0;f<${+steps};f++){if(BK.state!=='play')break;const res=bot(goal);BK.sim(1);const P=BK.P,s=secOf(P.x);s.frames++;if(P.swim)s.minBreath=Math.min(s.minBreath,+(P.breath??99).toFixed(1));
      if(P.hp<hp){s.blows++;s.lost+=hp-P.hp;}hp=P.hp;maxX=Math.max(maxX,P.x);
      const dn=BK.stats().deaths;if(dn>d0){d0=dn;s.deaths++;dieAt.push(Math.round(P.x/TS));if(dieAt.length>=3&&Math.abs(dieAt[dieAt.length-1]-dieAt[dieAt.length-3])<9){secOf(P.x).lifts++;dieAt=[];if(!lift())break;}}
      if(res==='stuck'){secOf(P.x).lifts++;if(!lift())break;}
      if(A&&P.x>=A.trigger){reached=true;break;}}
    const walk={hero:'${hero}',frames:f,reachedDoor:reached,maxTile:Math.round(maxX/TS),deaths:BK.stats().deaths,secs:secs.map(s=>({name:s.name,x0:s.x0,x1:s.x1,blows:s.blows,lost:Math.round(s.lost),deaths:s.deaths,lifts:s.lifts,seconds:+(s.frames/60).toFixed(1),minBreath:s.minBreath===99?null:s.minBreath}))};
    /* THE LOOK: one frame a section, the level as built, nothing killed */
    const shots={};const spot=(x0,x1)=>{const c=L.ents.find(e=>e.t==='check'&&e.x>=x0&&e.x<=x1&&e.y<50);if(c)return[c.x+3,c.y];   /* a hall: stand on its floor, by its shrine */const mid=Math.round((x0+x1)/2);for(let d=0;d<30;d++)for(const x of [mid+d,mid-d]){for(let y=3;y<L.H-2;y++){if(L.grid[(y+1)*L.W+x]!==0&&L.grid[y*L.W+x]===0&&L.grid[(y-1)*L.W+x]===0)return[x,y];}}return[mid,40];};
    for(const s of secs){boot();BK.god=true;const[x,y]=spot(s.x0,s.x1);BK.tp(x,y);BK.sim(420);BK.tp(x,y);for(let i=0;i<70;i++)BK.step(1);shots[s.name.replace(/[^A-Z]+/g,'-').replace(/^-|-$/g,'').toLowerCase()]=document.querySelector('canvas').toDataURL('image/png');}
    return {walk,shots};})()`, 1500000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(new URL(tag + '-' + k + '.png', out), Buffer.from(v.split(',')[1], 'base64'));
  writeFileSync(new URL('walk-' + tag + '.json', out), JSON.stringify(r.walk, null, 1));
  console.log(JSON.stringify(r.walk, null, 1)); console.log(Object.keys(r.shots).length + ' captures in work/keep2/' + tag + '-*.png');
  if (pg.errors.length) { console.log('PAGE ERRORS', pg.errors.slice(0, 5)); process.exitCode = 1; }
} finally { pg.close(); }
