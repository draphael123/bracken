// PAGE TOOL: launches headless Chrome
// tools/cf3-clip.mjs - CF3 boss clip strip (claude/cf3proof): a boss's phase break + death as the game draws it, every 6 frames, plus the sim clock per frame (slow-mo shows as a smaller step).
//   PORT=8796 node tools/cf3-clip.mjs <outdir> [levelId] [normal|reduce|flash0]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'cf3-clip', lvl = process.argv[3] || 'wood', cond = process.argv[4] || 'normal';
mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const res = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const i=LEVELS.findIndex(l=>l.id==='${lvl}');
    BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);BK.reset();BK.SET.speed=1;${cond === 'reduce' ? 'BK.SET.reduceMotion=true;' : ''}${cond === 'flash0' ? 'BK.SET.flashes=0;' : ''}
    const L=BK.L,A=L.arena;const e=BK.enemies().find(q=>q.t===A.boss&&q.alive);if(!e)return {err:'no boss'};
    for(const q of BK.enemies())if(q!==e&&!q.maxHp)q.alive=false;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);
    const W=160,H=96,frames=[],clock=[];const snap=()=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(e.x-v.x-v.VW/2)*z,sy=v.VH/2+(e.y-v.y-v.VH/2)*z;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#222';g.fillRect(0,0,W,H);g.drawImage(v.buf,Math.round(sx-W/2),Math.round(sy-H+20),W,H,0,0,W,H);frames.push(c);};
    let simT=BK.time||0;const stepClock=n=>{const t0=BK.time;BK.step(n);clock.push(+((BK.time-t0)/n*60).toFixed(2));};
    BK.P.inv=99999;
    /* phase break: pull him to 52% then to 48% by real hits */
    e.hp=Math.round(e.maxHp*0.52);for(let k=0;k<3;k++){BKT.hurtEnemy(e,Math.round(e.maxHp*0.02),e.x-10,false);stepClock(6);snap();}
    e.inv=0;BKT.hurtEnemy(e,Math.round(e.maxHp*0.06),e.x-10,false);for(let k=0;k<6;k++){stepClock(6);snap();}
    BK.P.hp=BK.P.maxHp;e.hp=Math.min(e.hp,1);e.inv=0;const pre=clock.length;BKT.hurtEnemy(e,5,e.x-10,false);for(let k=0;k<12;k++){stepClock(6);snap();}
    const S=2,cols=6,sheet=document.createElement('canvas');sheet.width=W*S*cols;sheet.height=H*S*Math.ceil(frames.length/cols);const sg=sheet.getContext('2d');sg.imageSmoothingEnabled=false;
    frames.forEach((c,k)=>sg.drawImage(c,(k%cols)*W*S,Math.floor(k/cols)*H*S,W*S,H*S));
    return {boss:e.t,alive:e.alive,phaseAt:pre,clock,png:sheet.toDataURL('image/png').split(',')[1]};})()`, 100000);
  if (res.png) { writeFileSync(join(out, 'boss-' + lvl + '-' + cond + '.png'), Buffer.from(res.png, 'base64')); console.log(cond, res.boss, 'alive', res.alive, 'clock(sim-s per real-s per 6f)', res.clock.join(' ')); } else console.log(cond, res.err);
} finally { pg.close(); }
