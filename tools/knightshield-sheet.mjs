// tools/knightshield-sheet.mjs - a hero's held-charge pose, the run frames and the pose+run-legs composites side by side, big (claude/knightshield).
//   node tools/knightshield-sheet.mjs <hero> <poseKey> <out.png> [poseFrame]
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const HERO = process.argv[2] || 'knight', KEY = process.argv[3] || 'windup', OUT = process.argv[4] || 'work/claude/knightshield/sheet.png', PF = +(process.argv[5] || 8), SC = 8;
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(()=>{
    BK.manualSimulation=true;BK.setHero(${JSON.stringify(HERO)});BK.reset({fresh:true});BKT.setHeroLevel(${JSON.stringify(HERO)},24);BK.applyUpgrades();BK.load(0);BK.state='play';
    const K=BKT.heroFrames,s=K.R,pose=[].concat(s[${JSON.stringify(KEY)}]),run=[].concat(s.run),cf=[].concat(s['cf:'+${JSON.stringify(KEY)}]||[]);
    const pf=pose[Math.min(${PF},pose.length-1)];
    const cells=[['pose',pf],...run.slice(0,6).map((c,i)=>['run'+i,c])];
    const ci=${PF}%pose.length;for(let r=0;r<6;r++){const c=(s['cf:'+${JSON.stringify(KEY)}]||[])[ci*6+r];if(c)cells.push(['cf'+r,c]);}
    const W=pf.width*${SC},H=pf.height*${SC},PER=7,nr=Math.ceil(cells.length/PER),c=document.createElement('canvas');c.width=PER*(W+6)+6;c.height=nr*(H+22)+6;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#8aa0a8';g.fillRect(0,0,c.width,c.height);
    cells.forEach(([n,cv],j)=>{const x=6+(j%PER)*(W+6),y=6+Math.floor(j/PER)*(H+22);g.fillStyle='#5d7078';g.fillRect(x,y,W,H);g.drawImage(cv,0,0,cv.width,cv.height,x,y,cv.width*${SC},cv.height*${SC});
      g.strokeStyle='#f00';g.beginPath();const ax=${SC}*(cv.width-0+0)*0;g.fillStyle='#000';g.font='13px monospace';g.fillText(n,x+2,y+H+14);});
    return JSON.stringify({url:c.toDataURL('image/png'),n:cells.length,wh:[pf.width,pf.height],ax:BKT.heroFrames.ax,ay:BKT.heroFrames.ay,poseN:pose.length})})()`);
  const o = JSON.parse(out); writeFileSync(OUT, Buffer.from(o.url.split(',')[1], 'base64')); console.log('wrote ' + OUT, o.n, o.wh, o.ax, o.ay, o.poseN);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
