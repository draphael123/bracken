/* tools/gargoyle-fire-shots.mjs <tag> — the real page, captured: THE GATE GARGOYLE's fire (claude/gargoyle5, 2026-09-28). One sheet of four
   panels: the breath half-way out along its line, the fireball's windup (his pose and the fire in his jaws), the first ball in the air,
   and a beat later (the second throw, since gargoyle5). Writes work/gargoyle5/<tag>-fire.png. Not in the suite. Run it before a change
   and after it. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const tag = process.argv[2] || 'now', dir = new URL('../work/gargoyle5/', import.meta.url); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
const cv=document.querySelector('canvas'),W=cv.width,H=cv.height,panels=[];const snap=label=>{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(cv,0,0);g.fillStyle='#000';g.fillRect(0,0,W,14);g.fillStyle='#fff';g.font='10px monospace';g.fillText(label,4,10);panels.push(c);};
const walk=n=>{for(let i=0;i<n;i++)BK.step(1);};
BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;const sl=BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);
const low=sl.filter(m=>m.y===Math.max(...sl.map(q=>q.y)));const m=low[Math.min(2,low.length-1)];
const on=()=>{BK.P.windRide=null;BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vy=0;BK.P.vx=0;BK.P.onMover=m;BK.P.ground=true;BK.P.face=1;};
on();walk(150);for(const q of sl)if(q!==m)q.broken=true;g.cd=99;g.queue=[];
const run=(n,stop)=>{for(let i=0;i<n;i++){on();for(const q of sl)if(q!==m){q.broken=true;q.brokenT=0;}g.cd=99;walk(1);if(stop&&stop())break;}};
g.x=BK.P.x+140;g.y=BK.P.y-10;g.mode='breathTell';g.modeT=1.5;g.sd=1;g.aim=null;run(400,()=>g.mode==='breath'&&g.jet&&g.jet[4]>130);snap('BREATH: the jet half-way out');run(200,()=>g.mode!=='breath');
g.mode='hover';run(60);g.x=BK.P.x+130;g.y=BK.P.y-12;g.mode='fireballTell';g.modeT=1.1;g.sd=1;g.balls=[];g.ball=null;run(48);snap('FIREBALL: the windup');
run(200,()=>g.mode==='fireball');run(20);snap('FIREBALL: the first throw');
run(200,()=>(g.balls||[]).length>1||g.mode==='recover'||g.mode==='hover');run(15);snap('A BEAT LATER: '+g.mode+', balls '+((g.balls||[]).length||(g.ball?1:0)));
const S=document.createElement('canvas');S.width=W*2;S.height=H*2;const sg=S.getContext('2d');panels.forEach((c,i)=>sg.drawImage(c,(i%2)*W,Math.floor(i/2)*H));
return {sheet:S.toDataURL('image/png')};})()`, 600000);
  writeFileSync(new URL(tag + '-fire.png', dir), Buffer.from(r.sheet.split(',')[1], 'base64')); console.log('work/gargoyle5/' + tag + '-fire.png');
  if (pg.errors.length) { console.log(pg.errors); process.exitCode = 1; } } finally { pg.close(); }
