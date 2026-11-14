// PAGE TOOL: launches headless Chrome
// tools/cf3-stills.mjs - CF3 proof stills (claude/cf3proof): a frame strip per foe of a blow, the flash fade and the kill, as the game draws it.
//   PORT=8796 node tools/cf3-stills.mjs <outdir> [foe,foe,...] [on|off]      -> <outdir>/<foe>.png  (frames: before, +1,+3,+6,+12 after a hit; a stagger hit; kill +1,+3,+6,+10)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'cf3-stills', foes = (process.argv[3] || 'sprig,soldier,brute,wolf,skeleton,bat').split(','), mode = process.argv[4] || 'on';
mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  for (const foe of foes) {
    const res = await pg.evalp(`(async()=>{const CF=await import('/src/cf-foe.js');CF.setCF3(${mode === 'on'});
      BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(60);BK.P.hp=BK.P.maxHp=9999;BK.P.inv=99999;BK.P.face=1;
      BK.spawnEnt({t:'${foe}',x:(BK.P.x+40)/16,y:21});const e=BK.enemies().at(-1);if(!e)return {foe:'${foe}',err:'no spawn'};e.hp=e.hp0=400;e.vx=0;
      const CW=96,CH=64,frames=[],tags=[];
      const snap=t=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(e.x-v.x-v.VW/2)*z,sy=v.VH/2+(e.y-v.y-v.VH/2)*z;const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#222';g.fillRect(0,0,CW,CH);
        g.drawImage(v.buf,Math.round(sx-CW/2),Math.round(sy-CH+14),CW,CH,0,0,CW,CH);frames.push(c);tags.push(t);};
      BK.step(1);snap('pre');
      BKT.hurtEnemy(e,6,e.x-10,false);for(const n of [1,3,6,12]){BK.step(n===1?1:n===3?2:n===6?3:6);snap('hit+'+n);}
      BK.step(30);e.hp=e.hp0=400;BKT.hurtEnemy(e,60,e.x-10,false);e.stagger=Math.max(e.stagger||0,2);e.broken=true;BK.step(8);snap('stagger');
      BK.step(30);BKT.hurtEnemy(e,99999,e.x-10,false);for(const n of [1,3,6,10]){BK.step(n===1?1:n===3?2:n===6?3:4);snap('kill+'+n);}
      const S=3,sheet=document.createElement('canvas');sheet.width=CW*S*5;sheet.height=CH*S*2;const sg=sheet.getContext('2d');sg.imageSmoothingEnabled=false;
      frames.forEach((c,k)=>sg.drawImage(c,(k%5)*CW*S,Math.floor(k/5)*CH*S,CW*S,CH*S));
      return {foe:'${foe}',tags,hasHurt:!!(BK.HAS_HURT&&BK.HAS_HURT.has('${foe}')),png:sheet.toDataURL('image/png').split(',')[1]};})()`);
    if (res.png) { writeFileSync(join(out, foe + '-' + mode + '.png'), Buffer.from(res.png, 'base64')); console.log(foe, mode, res.tags.join(' ')); } else console.log(foe, res.err);
  }
} finally { pg.close(); }
