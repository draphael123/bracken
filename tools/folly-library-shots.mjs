/* tools/folly-library-shots.mjs <tag> - the real page, captured: THE MAGE'S FOLLY at columns 64-213 (claude/follylib, 2026-09-29). One sheet of four panels
   (the sliding case over its pit, the first vault door, the spiked crossing under the squad, the timed exam and its stack), camera parked on each
   beat, god mode, foes left where they stand. Writes work/folly-library/<tag>.png. Not in the suite. Run it before a change (those columns are the old
   great library) and after it. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const tag = process.argv[2] || 'now', dir = new URL('../work/folly-library/', import.meta.url); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
const cv=document.querySelector('canvas'),W=cv.width,H=cv.height,panels=[];const snap=label=>{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(cv,0,0);g.fillStyle='#000';g.fillRect(0,0,W,14);g.fillStyle='#fff';g.font='10px monospace';g.fillText(label,4,10);panels.push(c);};
BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='mage'));BK.state='play';BK.god=true;BK.sim(30);
const G=40;
for(const x of [84,110,127,190]){BK.tp(x,G-1);BK.sim(40);BK.step(0);snap('column '+x);}
const S=document.createElement('canvas');S.width=W*2;S.height=H*2;const sg=S.getContext('2d');panels.forEach((c,i)=>sg.drawImage(c,(i%2)*W,Math.floor(i/2)*H));
return {sheet:S.toDataURL('image/png')};})()`, 600000);
  writeFileSync(new URL(tag + '.png', dir), Buffer.from(r.sheet.split(',')[1], 'base64')); console.log('work/folly-library/' + tag + '.png');
  if (pg.errors.length) { console.log(pg.errors); process.exitCode = 1; } } finally { pg.close(); }
