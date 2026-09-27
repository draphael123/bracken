/* tools/burial-shots.mjs — the real page, captured: THE BURIED DEAD's new sprite in his tells over the ossuary's platforms, a skull in
   flight at a hero on the high tier, THE ROTTEN BRIDGES and THE BLIND VAULT. Writes docs/burial/page-<name>.png. Not in the suite. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const pg = await openPage({ audio: false, fonts: false }); mkdirSync(new URL('../docs/burial/', import.meta.url), { recursive: true });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const o={};
const shot=()=>document.querySelector('canvas').toDataURL('image/png');const walk=n=>{for(let i=0;i<n;i++)BK.step(1);};
const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);for(const e of BK.enemies())if(e!==BK.boss)e.alive=false;return BK.boss;};
const hold=(b,m)=>{b.mode=m;b.modeT=.5;walk(3);};
let b=boot();BK.tp(1092,25);walk(40);b.mode='walk';b.modeT=5;walk(30);o.arena=shot();
b=boot();BK.tp(1092,25);walk(30);b.skullAt={x:BK.P.x,y:BK.P.y-10};hold(b,'skullTell');o.skullTell=shot();b.skullAt={x:BK.P.x,y:BK.P.y-10};b.modeT=0;walk(22);o.skull=shot();
b=boot();BK.P.x=b.x+100;walk(20);hold(b,'slamTell');o.slamTell=shot();
b=boot();BK.P.x=b.x+100;walk(20);hold(b,'novaTell');o.novaTell=shot();
b=boot();BK.P.x=b.x+100;walk(20);hold(b,'clawTell');o.clawTell=shot();
b=boot();BK.P.x=b.x+80;walk(20);b.mode='stuck';b.modeT=3;b.open=3;walk(3);o.stuck=shot();
BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=true;for(const e of BK.enemies())if(e.x>920*16&&e.x<990*16)e.alive=false;BK.tp(936,31);walk(12);o.bridge=shot();
BK.tp(345,31);for(const e of BK.enemies())if(e.x>330*16&&e.x<360*16)e.alive=false;walk(90);o.vault=shot();
return o;})()`, 600000);
  for (const [k, v] of Object.entries(r)) { writeFileSync(new URL('../docs/burial/page-' + k + '.png', import.meta.url), Buffer.from(v.split(',')[1], 'base64')); console.log('docs/burial/page-' + k + '.png'); }
  if (pg.errors.length) { console.log(pg.errors); process.exit(1); } } finally { pg.close(); }
