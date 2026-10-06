// tools/gear-sheet.mjs - CONTACT SHEET OF THE GEAR TIERS: every hero x tier 0..4 in idle, run, a swing, a jump (x3).
//   PORT=8648 node tools/gear-sheet.mjs out.png [heroes,comma] [scale]
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'gear-sheet.png', only = process.argv[3] && process.argv[3] !== '-' ? process.argv[3].split(',') : null, Z = +(process.argv[4] || 3);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{const Z=${Z},HS=${JSON.stringify(only || ['knight', 'warden', 'pirate', 'paladin', 'geomancer', 'reaper', 'pyro'])},POSES=${JSON.stringify((process.argv[5] || 'idle:0,run:2,atk:1,jump:0').split(',').map(s => [s.split(':')[0], +s.split(':')[1]]))};
    const sets=HS.map(h=>[0,1,2,3,4].map(t=>BKT.heroSet('bracken','steel',false,h,t)));
    const CW=46,CH=60,cols=POSES.length*5,c=document.createElement('canvas');c.width=cols*CW*Z+8;c.height=HS.length*CH*Z+8;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#6a7a60';g.fillRect(0,0,c.width,c.height);
    HS.forEach((h,i)=>{let n=0;POSES.forEach(([k,j])=>{sets[i].forEach(K=>{const f=K.R[k]||K.R.idle,cv=Array.isArray(f)?f[j%f.length]:f;
      const x=4+n*CW*Z+(14-K.ax)*Z, y=4+i*CH*Z+(CH-6-(K.ay||22))*Z; g.drawImage(cv,x,y,cv.width*Z,cv.height*Z);
      g.fillStyle='rgba(255,255,0,.35)';g.fillRect(4+n*CW*Z,y+(K.ay)*Z,CW*Z,1);n++;});});});
    return c.toDataURL('image/png')})()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + out);
} finally { pg.close(); }
