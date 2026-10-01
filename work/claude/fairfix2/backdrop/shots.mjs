// pictures of THE HARVEST FAIR's backdrop at the spots in STOPS: node work/claude/fairfix2/backdrop/shots.mjs <before|after> [names] [--burn]
import { openPage, ROOT } from '../../../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
void 0;const tag = process.argv[2] || 'after', only = (process.argv[3] || '').split(',').filter(Boolean), burn = process.argv.includes('--burn');
const out = join(ROOT, 'work/claude/fairfix2/backdrop', tag); mkdirSync(out, { recursive: true });
const STOPS = [['01-gate', 20, 27, 1, 40, ''], ['02-stalls', 150, 27, 1, 40, ''], ['03-midway', 300, 27, 1, 40, ''], ['04-harvest', 420, 27, 1, 40, ''], ['05-last-round', 580, 27, 1, 40, ''], ['06-high', 428, 11, 1, 40, ''],
  ['07-effigy-burn', 458, 27, 1, 40, 'BK.fair().effigyBurnT=3;', 'l.effigies.push({x:461,stage:3,burns:true,world:true});'], ['08-effigy-blaze', 458, 27, 1, 40, 'BK.fair().effigyBurnT=7;', 'l.effigies.push({x:461,stage:3,burns:true,world:true});'], ['09-effigy-ash', 458, 27, 1, 40, 'BK.fair().effigyBurnDone=true;', 'l.effigies.push({x:461,stage:3,burns:true,world:true});'], ['10-effigy-before', 458, 27, 1, 40, '', 'l.effigies.push({x:461,stage:3,burns:true,world:true});'], ['11-far-ash', 592, 27, 1, 40, 'BK.fair().effigyBurnDone=true;', 'for(const e of l.effigies)if(e.stage===4)e.stage="ash";']];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];const only=${JSON.stringify(only)};
    const snap=(name)=>{const c=document.createElement('canvas');const sc=2;c.width=BK.view.VW*sc;c.height=BK.view.VH*sc;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    const fi=LEVELS.findIndex(l=>l.id==='fair');
    for(const [name,x,y,face,n,js,mod] of ${JSON.stringify(STOPS)}){ if(only.length&&!only.some(o=>name.includes(o)))continue; if(mod&&!only.length)continue;
      const ob=LEVELS[fi].build;if(mod)LEVELS[fi].build=function(){const l=ob.call(this);eval(mod);return l;};BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);LEVELS[fi].build=ob;BK.state='play';BK.god=true;BK.sim(10);
      BK.tp(x,y);BK.P.face=face;if(js)eval(js);run(n);snap(name); }
    return res;})()`, 900000);
  r.forEach(([name, d]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/fairfix2/backdrop/' + tag + '/' + name + '.png'); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
