/* tools/burial3-shots.mjs — the page, captured (claude/burial3): THE DROWNED OSSUARY (the arcade walk, biers, a drowned hand), the Buried
   Dead's GRAVE HANDS (tell and rise) and GRAVE BREATH. Writes work/burial3/look-<name>.png. Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs'; import { join } from 'path';
const pg = await openPage({ audio: false, fonts: false }), dir = join(ROOT, 'work/burial3'); mkdirSync(dir, { recursive: true });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const o={};
const shot=()=>document.querySelector('canvas').toDataURL('image/png');const walk=n=>{for(let i=0;i<n;i++)BK.step(1);};
const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=true;};
load();BK.tp(205,55);walk(90);o.walkWest=shot();BK.tp(262,55);walk(60);o.walkEast=shot();
BK.tp(222,63);for(const e of BK.enemies())e.alive=false;BK.P.x=222*16;BK.P.y=66*16+18;walk(40);o.biers=shot();
const h=BK.L.drownedHands[5];BK.tp(Math.round(h.x/16),63);BK.P.x=h.x;BK.P.y=h.y+18;walk(36);o.hand=shot();walk(20);o.grab=shot();
BK.tp(296,55);walk(40);o.hoard=shot();
const lair=()=>{load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);for(const e of BK.enemies())if(e!==BK.boss)e.alive=false;return BK.boss;};
let b=lair();BK.P.x=b.x+150;const v=BK.L.gasVents.filter(q=>q.x*16>BK.L.arena.x0&&q.x*16<BK.L.arena.x1).sort((p,q)=>p.x-q.x)[2];v.litT=15;b.turn=2;b.mode='walk';b.modeT=0;walk(40);o.handsTell=shot();walk(30);o.hands=shot();
b=lair();for(const q of BK.L.gasVents)q.litT=15;b.phase=2;BK.P.candle=10;b.mode='breathTell';b.modeT=0.7;walk(30);o.breathTell=shot();walk(40);o.breath=shot();
b=lair();BK.P.x=b.x+60;walk(20);o.face=shot();
return o;})()`, 600000);
  for (const [k, v] of Object.entries(r)) { writeFileSync(join(dir, 'look-' + k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('work/burial3/look-' + k + '.png'); }
  if (pg.errors.length) { console.log(pg.errors); process.exit(1); } } finally { pg.close(); }
