/* tools/qt2-stills.mjs (QUEENTUNE-2) - stills of the phase-1 hall fight: the barracks soldiers, a throne-fire burn, a crown blow.
   BRACKEN_GQ5Q1=1 node tools/qt2-stills.mjs <dir>. A god-mode knight stands in the hall; the Queen runs her own fight; a frame is kept when an event shows. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ5Q1 = '1';
const OUT = resolve(ROOT, process.argv[2] || 'work/claude/qt2-stills');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
  const hold=()=>{if(BK.state==='card')BK.cardClose();};
  const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
  const cv=document.createElement('canvas');cv.width=640;cv.height=360;const cg=cv.getContext('2d');cg.imageSmoothingEnabled=false;const shots={};
  const snap=id=>{BK.step(1);cg.drawImage(BK.buf,0,0,640,360);shots[id]=cv.toDataURL('image/png');};`;
try {
  const r = await pg.evalp(`(async()=>{${PRE}
    load('knight'); const q=wake(); const P=BK.P; P.maxHp=99999; P.hp=99999; P.inv=0; const H=BK.gqHands(), G5=H.q5(); const log=[]; let n=0;
    const want={soldier:1,tell:1,burn:1,crown:1,soldierHit:1}; const got={};
    for (let f=0; f<60*240 && Object.keys(got).length<5; f++) {
      hold(); BK.sim(1); if (f>0 && f%420===0 && q.hp>q.maxHp*0.3) { q.hp=Math.round(q.hp*0.82); }
      const sol=BK.enemies().filter(e=>e.alive&&e.t==='soldier');
      if (!got.soldier && sol.length>=2 && Math.abs(sol[0].x-P.x)<150) { snap('soldiers-in-the-hall'); got.soldier=1; log.push('soldiers '+f); }
      const tl=sol.find(e=>e.mode==='slashTell'&&Math.abs(e.x-P.x)<90); if (!got.soldierHit && tl) { snap('soldier-slash-tell'); got.soldierHit=1; log.push('slashTell '+f); }
      if (!got.tell && q.mode==='fireTell') { for(let k=0;k<100&&q.mode==='fireTell';k++){hold();BK.sim(1);} if(q.mode==='fireTell'){} snap('fire-tell-glow'); got.tell=1; log.push('fireTell '+f); }
      if (!got.burn && q.mode==='fireBurn') { for(let k=0;k<45;k++){hold();BK.sim(1);} snap('throne-fire-burn'); got.burn=1; log.push('burn '+f); }
      const cs=BK.gqShots().find(s=>s.kind==='crown'&&!s.home); if (!got.crown && cs) { for(let k=0;k<6;k++){hold();BK.sim(1);} snap('crown-blow-in-flight'); got.crown=1; log.push('crown '+f); }
      P.hp=99999;
    }
    return { log, got:Object.keys(got), shots };
  })()`, 300000).catch(err => ({ err: String(err && err.message || err).slice(0, 300) }));
  if (r && r.err) { console.log('FAILED: ' + r.err); process.exitCode = 1; }
  else { console.log(JSON.stringify({ log: r.log, got: r.got })); for (const [id, png] of Object.entries(r.shots)) { writeFileSync(join(OUT, id + '.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('still: ' + id + '.png'); } }
} finally { await pg.close(); }
