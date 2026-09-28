/* tools/courtyard-shots.mjs <tag> — the real page, captured: THE MAGE'S FOLLY's opening (claude/courtyard, 2026-09-28). One sheet of
   four panels across the level's first section (the overgrown grounds before, THE WARDED COURTYARD after), camera parked on each beat,
   god mode, foes left where they stand. Writes work/courtyard/<tag>.png. Not in the suite. Run it before a change and after it.
   The columns are read off the level: its first section runs from 0 to L.mage.outside (the tower's door). */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const tag = process.argv[2] || 'now', dir = new URL('../work/courtyard/', import.meta.url); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
const cv=document.querySelector('canvas'),W=cv.width,H=cv.height,panels=[];const snap=label=>{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(cv,0,0);g.fillStyle='#000';g.fillRect(0,0,W,14);g.fillStyle='#fff';g.font='10px monospace';g.fillText(label,4,10);panels.push(c);};
BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='mage'));BK.state='play';BK.god=true;BK.sim(30);
const out=BK.L.mage.outside,G=40;
for(const f of [0.06,0.3,0.55,0.86]){const x=Math.round(out*f);BK.tp(x,G-1);BK.sim(40);BK.step(0);snap('x '+x+' of '+out+' (the tower door)');}
const S=document.createElement('canvas');S.width=W*2;S.height=H*2;const sg=S.getContext('2d');panels.forEach((c,i)=>sg.drawImage(c,(i%2)*W,Math.floor(i/2)*H));
return {sheet:S.toDataURL('image/png')};})()`, 600000);
  writeFileSync(new URL(tag + '.png', dir), Buffer.from(r.sheet.split(',')[1], 'base64')); console.log('work/courtyard/' + tag + '.png');
  if (pg.errors.length) { console.log(pg.errors); process.exitCode = 1; } } finally { pg.close(); }
