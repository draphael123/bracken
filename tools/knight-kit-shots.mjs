// tools/knight-kit-shots.mjs - KNIGHTKIT stills + console check (claude/knightkit, Daniel 11-05), in a REAL level (Kingswood) / the order knights.
//   node tools/knight-kit-shots.mjs quake <out.png>   hold X to the full charge in front of a pack on kings; crops: charge, full flash, the quake, the pack down
//   node tools/knight-kit-shots.mjs bash  <out.png>   double-tap C at a shield foe (guard up) on kings; crops: tap, tap, the lunge, GUARD BROKEN
// One headless browser; prints the foes' states and any page console errors (0 expected).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';

const MODE = process.argv[2] || 'quake', OUT = process.argv[3] || 'scratch/knightkit-' + MODE + '.png', LV = process.argv[4] || 'kings';
const IDX = LEVELS.findIndex(l => l.id === LV);
const CW = 170, CH = 70, SC = 3, PER = 3;
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(()=>{
    for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',14);
    BKT.PROG.skillOwned.knight={};BKT.PROG.loadouts.knight=[];BKT.PROG.card.knight.ms={};BKT.PROG.card.knight.up={};BK.applyUpgrades();BK.load(${IDX});BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
    BK.sim(40);const P=BK.P;const L=BK.L;
    /* a flat strip of floor under him: the real level's art and light, the test's footing */
    const gx=Math.floor(P.x/16),gy=Math.round(P.y/16);for(let x=gx-8;x<=gx+10;x++){for(let y=gy-6;y<gy;y++)L.grid[y*L.W+x]=0;L.grid[gy*L.W+x]=1;}P.y=gy*16;BK.sim(10);
    Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,links:0,linkT:0,linkKeep:0,quakeReadyAt:0});BK.sim(1);P.st=P.maxSt;
    const mk=(t,dx,guard)=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:gy-1});const e=BK.enemies().at(-1);e.hp=e.hp0=e.maxHp0=5000;e.cd=99;e.elT=99;e.face=dx>0?-1:1;e.speed=0;if(guard)e.guardT=9;return e;};
    const foes=${MODE === 'quake' ? "[mk('sprig',-40),mk('sprig',-22),mk('sprig',24),mk('sprig',44),mk('sprig',100)]" : "[mk('shield',30,true)]"};
    const crop=(label)=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 2}),Math.round(sy-${CH - 14}),${CW},${CH},0,0,${CW},${CH});return {c,label};};
    const s=[],info=[];const tick=(n,lab,every)=>{for(let i=0;i<n;i++){P.inv=5;BK.step(1);if(${MODE === 'quake'}){foes.forEach(e=>{e.vx=0;});}else{foes[0].x=P.x+30+(P.kBashT>0?0:0);foes[0].vx=0;foes[0].guardT=foes[0].broken>0?0:9;}if(lab&&(i%(every||1)===0))s.push(crop(lab+' '+i));}};
    BK.step(1);
    if('${MODE}'==='quake'){BK.keys.atk=true;tick(20,'hold');tick(34,'hold',17);BK.keys.atk=false;tick(26,'release',4);tick(40,'after',10);}
    else {BK.keys.block=true;tick(4,'tap1',3);BK.keys.block=false;tick(5,'gap',4);BK.keys.block=true;tick(2,'tap2',1);tick(12,'bash',3);BK.keys.block=false;tick(30,'after',10);}
    info.push(foes.map(e=>({t:e.t,floored:+(e.floored||0).toFixed(1),broken:+(e.broken||0).toFixed(1),stagger:+(e.stagger||0).toFixed(2),dx:Math.round(e.x-P.x)})));
    const W=${CW * SC},H=${CH * SC},PER=${PER},nr=Math.ceil(s.length/PER),c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=34+nr*(H+18);
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';g.fillText('knightkit ${MODE} on ${LV}',8,22);
    s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=34+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,yy+.5,W-1,H-1);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.label,x+1,yy+H+12);});
    return JSON.stringify({url:c.toDataURL('image/png'),n:s.length,info})})()`);
  const o = JSON.parse(out);
  writeFileSync(OUT, Buffer.from(o.url.split(',')[1], 'base64'));
  console.log('wrote ' + OUT + ' ' + o.n + ' crops; foes ' + JSON.stringify(o.info));
  console.log('console/page errors: ' + pg.errors.length + (pg.errors.length ? ' ' + JSON.stringify(pg.errors.slice(0, 5)) : ''));
} finally { pg.close(); }
