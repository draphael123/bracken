/* tools/gargoyle-shots.mjs <tag> — the real page, captured: THE GATE GARGOYLE's fight as the player sees it (the view he wakes into,
   his dive's shadow on your slab, and his opening - hanging from an edge before the 2026-09-25 rework, crashed and stunned on the
   garden floor after it). Writes work/gargoyle/<tag>-<name>.png. Not in the suite. Run it before a change and after it. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const tag = process.argv[2] || 'now', dir = new URL('../work/gargoyle/', import.meta.url); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const o={};
const shot=()=>document.querySelector('canvas').toDataURL('image/png');const walk=n=>{for(let i=0;i<n;i++)BK.step(1);};
BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;const sl=BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);
const on=m=>{BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vy=0;BK.P.onMover=m;BK.P.ground=true;};
on(sl[1]);walk(150);g.cd=99;walk(40);o.view={VW:BK.view.VW,VH:BK.view.VH};o.wake=shot();
const m=sl[Math.min(3,sl.length-1)];on(m);g.mode='diveTell';g.modeT=0.9;g.tgt=m;g.off=m.w/2;g.cd=99;g.queue=[];walk(40);o.diveTell=shot();
const nx=sl.filter(q=>q!==m&&!q.broken).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];
for(let i=0;i<200&&g.mode==='diveTell';i++){on(m);walk(1);}on(nx);for(let i=0;i<200&&g.mode==='dive';i++)walk(1);walk(6);o.smash=shot();
for(let i=0;i<120&&!g.open;i++)walk(1);walk(20);o.open=shot();o.mode=g.mode;
return o;})()`, 600000);
  for (const [k, v] of Object.entries(r)) { if (typeof v !== 'string' || !v.startsWith('data:')) { console.log(k, JSON.stringify(v)); continue; }
    writeFileSync(new URL(tag + '-' + k + '.png', dir), Buffer.from(v.split(',')[1], 'base64')); console.log('work/gargoyle/' + tag + '-' + k + '.png'); }
  if (pg.errors.length) { console.log(pg.errors); process.exitCode = 1; } } finally { pg.close(); }
