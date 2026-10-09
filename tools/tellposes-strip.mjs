// tools/tellposes-strip.mjs - FRAME STRIPS OF A FOE'S WIND-UP, as the game draws it (claude/tellposes).
//   PORT=8796 node tools/tellposes-strip.mjs <outdir> <foe,foe,...>      -> <outdir>/<foe>.png
// A held foe stands ahead of the hero on a flat floor; the strip is its crop every 2 frames from the moment its mode becomes a wind-up
// ('...Tell' / wind / raise / aim ...) for 22 frames, then the frames of the blow. The hero stands still beside it so the foe throws.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/tellposes/after', foes = (process.argv[3] || 'sprig,soldier,brute').split(',');
mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  for (const foe of foes) {
    const res = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(60);BK.P.hp=BK.P.maxHp=9999;BK.P.inv=99999;BK.P.face=1;
      BK.spawnEnt({t:'${foe}',x:(BK.P.x+34)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=99999;
      const CW=96,CH=64,frames=[];let began=-1,n=0,modes=[];
      for(let i=0;i<420&&frames.length<16;i++){BK.step(1);const m=String(e.mode),tell=/Tell$|wind|raise|aim|couch|crouch|lower|watch/i.test(m);
        if(tell&&began<0)began=i;
        if(began>=0&&(i-began)%2===0&&(i-began)<40){const v=BK.view,z=v.z||1,sx=v.VW/2+(e.x-v.x-v.VW/2)*z,sy=v.VH/2+(e.y-v.y-v.VH/2)*z;
          const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#222';g.fillRect(0,0,CW,CH);
          g.drawImage(v.buf,Math.round(sx-CW/2),Math.round(sy-CH+12),CW,CH,0,0,CW,CH);frames.push(c);modes.push(m);}
        if(began>=0&&i-began>60)break;}
      if(!frames.length)return {foe:'${foe}',err:'no wind-up seen',mode:String(e.mode)};
      const S=3,sheet=document.createElement('canvas');sheet.width=CW*S*Math.min(8,frames.length);sheet.height=CH*S*Math.ceil(frames.length/8);const sg=sheet.getContext('2d');sg.imageSmoothingEnabled=false;
      frames.forEach((c,k)=>sg.drawImage(c,(k%8)*CW*S,Math.floor(k/8)*CH*S,CW*S,CH*S));
      return {foe:'${foe}',n:frames.length,modes,png:sheet.toDataURL('image/png').split(',')[1]};})()`);
    if (res.png) { writeFileSync(join(out, foe + '.png'), Buffer.from(res.png, 'base64')); console.log(foe, res.n, 'frames', [...new Set(res.modes)].join(',')); } else console.log(foe, res.err, res.mode);
  }
} finally { pg.close(); }
