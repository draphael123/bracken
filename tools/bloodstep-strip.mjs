// tools/bloodstep-strip.mjs - THE BLOOD KNIGHT'S STEP, frame by frame as the game draws it (claude/bloodstep).
// The real page in Chrome, stepped with the draw on: the hero 'reaper' steps once (a foe stands ahead), caught every second tick in a crop round him, blown up.
//   PORT=<p> node tools/bloodstep-strip.mjs <out.png> [label]
// Run it in the old checkout and in this one for the before / after strips.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';

const OUT = process.argv[2] || 'work/claude/bloodstep/step.png', LABEL = process.argv[3] || 'blood step';
const CW = 120, CH = 64, SC = 2, PER = 9;
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(()=>{
    BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('reaper');BK.reset({fresh:true});BKT.setHeroLevel('reaper',24);BK.applyUpgrades();BK.load(0);BK.state='play';
    BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
    BK.tp(10,21);BK.sim(120);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;
    const crop=(label)=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 3}),Math.round(sy-${CH - 12}),${CW},${CH},0,0,${CW},${CH});return {c,label};};
    const s=[];BK.step(1);s.push(crop('t0'));BK.keys.right=true;BK.press('dodge');
    for(let i=1;i<=40;i++){BK.step(1);if(i%2===0)s.push(crop('t'+i+(P.dodge>0?' step':'')));}
    const W=${CW * SC},H=${CH * SC},PER=${PER},nr=Math.ceil(s.length/PER),c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=34+nr*(H+18);
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';g.fillText(${JSON.stringify(LABEL)}+' - real page, BK.step, every 2nd tick',8,22);
    s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=34+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,yy+.5,W-1,H-1);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.label,x+1,yy+H+12);});
    return c.toDataURL('image/png')})()`);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + OUT);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
