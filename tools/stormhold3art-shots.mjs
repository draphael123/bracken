// tools/stormhold3art-shots.mjs - STORMHOLD 3, THE OUTER WORKS and THE QUEEN'S LANCE, in the real page (claude/stormhold3art): `node tools/stormhold3art-shots.mjs [name:x:y ...]` (x, y in tiles).
// No arguments = a shot per section of the level + sheet.png. BOSS=1 = the Lance's poses (every mode forced) on the bridge + boss-sheet.png. Not in the suite: pictures are for eyes. PORT from the environment.
// env: SHOTS=work/claude/shots-stormhold3art, SIM=60, ONLY=a,b, SCALE=1, ZOOM=k (crop the 320x180 frame around the boss at k x), DEBUG=1 (keeps the HUD)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots-stormhold3art'); mkdirSync(out, { recursive: true });
const ALL = [['road-in', 12, 35], ['road-gatewatch', 46, 35], ['road-dogs', 66, 35], ['barbican-gate', 92, 35], ['barbican-holes', 116, 35], ['barbican-exam', 136, 35],
  ['bailey-stables', 160, 33], ['bailey-smithy', 187, 33], ['bailey-bell', 207, 33], ['bailey-belltower', 222, 33], ['bailey-moat', 245, 33],
  ['curtain-ditch', 285, 43], ['curtain-face', 325, 43], ['wallwalk-1', 345, 28], ['wallwalk-2', 365, 28], ['wallwalk-3', 385, 28],
  ['gatehouse-1', 405, 28], ['gatehouse-2', 430, 28], ['gatehouse-3', 462, 28], ['bridgehead', 484, 28], ['bridge-1', 505, 29], ['bridge-2', 540, 29], ['bridge-3', 580, 29], ['bridge-gate', 608, 29]];
let want = process.argv.slice(2).map(a => a.split(':')); if (!want.length && !process.env.BOSS) want = ALL.map(a => a.map(String));
if (process.env.ONLY) { const o = process.env.ONLY.split(','); want = want.filter(w => o.includes(w[0])); }
const pg = await openPage({ audio: false });
const save = (name, d) => writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
const sheet = async (items, file, cols = 2) => { const sc = +(process.env.SCALE || 1), cw = 640 * sc, ch = 360 * sc, rows = Math.ceil(items.length / cols);
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(items.map(q => [q[0], q[1]]))}; const c = document.createElement('canvas'); c.width = ${cw * cols}; c.height = ${ch * rows}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); const x = (k % ${cols}) * ${cw}, y = Math.floor(k / ${cols}) * ${ch}; g.drawImage(im, x, y, ${cw}, ${ch}); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y + ${ch} - 14, 150, 14); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(items[k][0], x + 4, y + ${ch} - 4); }
    return c.toDataURL('image/png'); })()`); writeFileSync(join(out, file), Buffer.from(d.split(',')[1], 'base64')); };
try {
  if (want.length) {
    const r = await pg.evalp(`(async () => {
      const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'storm'); const res = []; const sim0 = ${+(process.env.SIM || 60)};
      for (const [name, xs, ys, sims] of ${JSON.stringify(want)}) {
        BK.load(i); BK.start(); BK.god = true; ${process.env.DEBUG ? '' : "try { BK.SET.hud = 'minimal'; } catch (e) {}"} BK.sim(300);
        BK.tp(+xs, +ys); for (let k = 0; k < (+sims || sim0); k++) BK.step(1); BK.sim(200); BK.step(1);
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
        res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]); }
      return res; })()`, 300000);
    r.forEach(([name, d, x, y]) => { save(name, d); console.log(name, 'at', x, y); });
    await sheet(r, 'sheet.png');
  }
  if (process.env.BOSS) {
    const modes = (process.env.MODES || 'ride,couch,charge,wheel,rearTell,rear,volleyTell,volley,pennantTell,thrown,rise,guard,thrustTell,thrust,sweepTell,sweep,bashTell,bash,vaultTell,vaultUp,perch,stab,planted,wallTell,shieldwall,wallTurned,fallback,reel').split(',');
    const zoom = +(process.env.ZOOM || 2);
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const res=[];
      for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.state='play';BK.god=false;BK.sim(5);
      try { BK.SET.hud = 'minimal'; } catch (e) {}
      const A=BK.L.arena,P=BK.P,fl=A.floor,row=fl/16;BK.tp(Math.round(A.trigger/16)+1,row-1);for(let i=0;i<200;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);}
      const b=BK.enemies().find(e=>e.t==='lance'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;
      const hold=()=>{for(const k of ['chargeT','rearT','volleyT','thrustT','sweepT','bashT','vaultT','wallT'])b[k]=99;b.penT=99;};
      for(let i=0;i<400;i++){hold();P.hp=P.maxHp;P.inv=9;b.hp=b.maxHp;BK.sim(1);} const bx=A.x0+300; const grab=(name)=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
        const cx=BK.cam?BK.cam.x:0; g.drawImage(BK.buf,0,0,640,360);res.push([name,c.toDataURL('image/png')]);};
      for(const m of ${JSON.stringify(modes)}){ const foot=['thrown','rise','guard','thrustTell','thrust','sweepTell','sweep','bashTell','bash','vaultTell','vaultUp','perch','stab','planted','wallTell','shieldwall','wallTurned','fallback','reel'].includes(m);
        if(foot){ if(b.mounted){ b.mounted=false; b.phase=2; b.w=26; b.h=34; } } else if(!b.mounted){ b.mounted=true; b.phase=1; b.w=36; b.h=50; }
        hold(); b.mode=m; b.modeT=m==='charge'?3:99; b.x=bx; b.y=fl; b.vx=0; b.vy=0; b.face=1; if(m==='perch'||m==='vaultUp'||m==='stab'){ b.stab={x:bx+40,y:fl}; b.y=fl-48; }
        if(m==='charge')b.vx=200; if(m==='fallback')b.vx=0;
        P.x=bx+110;P.y=fl;P.vx=0;P.inv=9;P.hp=P.maxHp;BK.keys.left=BK.keys.right=false;
        for(let i=0;i<3;i++){hold();b.mode=m;b.modeT=99;b.x=bx;if(m!=='perch'&&m!=='vaultUp'&&m!=='stab'){b.y=fl;}b.vx=m==='charge'?200:0;b.flash=0;b.hurtT=0;b.breakFlash=0;b.enrageT=0;P.hp=P.maxHp;P.x=bx+110;BK.step(1);} 
        grab(m); }
      return res;})()`, 300000);
    r.forEach(([name, d]) => save('boss-' + name, d));
    await sheet(r.map(q => ['boss ' + q[0], q[1]]), 'boss-sheet.png', 3);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
