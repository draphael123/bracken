// tools/swing-arc-proof.mjs - RECS158-d: mid-light-cut frames of knight / paladin / pirate / geomancer / berserker / ranger (old arc + smear vs smear alone). Same capture helpers as tools/juice-proof.mjs.
//   node tools/swing-arc-proof.mjs <outdir>   (run from the build to be shown; the before still is the same tool on the build without the arc skip)
// (copied from) tools/juice-proof.mjs - JUICE2 PROOF FRAMES (claude/juiceproof-d, 2026-11-10): captures the game buffer, one PNG per rendered step, for a knight / ranger / pyro combo + a kill, and a
// knight CLINK (a light blow on a plate foe). Stitching (strip, GIF) is done outside by ffmpeg / PIL.  node tools/juice-proof.mjs <outdir>
// Heroes: ranger is a no-op proof (her light is a shot, no arc is drawn either way).
// One headless browser. Flag state is whatever src/juice.js ships (ON). Each step waits 17 ms of real time so the freeze jitter (frame parity from performance.now) alternates as it does live.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/juiceproof', CW = 64, CH = 36, SC = 4;   // crop around the hero, written at 4x (256x144 per frame, nearest)
const up = (a) => { const o = new Uint8Array(CW * SC * CH * SC * 4); for (let y = 0; y < CH * SC; y++) for (let x = 0; x < CW * SC; x++) { const i = ((y / SC | 0) * CW + (x / SC | 0)) * 4, j = (y * CW * SC + x) * 4; o[j] = a[i]; o[j + 1] = a[i + 1]; o[j + 2] = a[i + 2]; o[j + 3] = a[i + 3]; } return o; };
mkdirSync(out, { recursive: true });
function crc(b){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;}
function png(rgba,w,h){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  await pg.evalp(`(async()=>{
    window.__set=(hero)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.SET.hitstop=true;BK.SET.shake=true;BK.SET.shakeMode='hit';BK.SET.reduceMotion=false;BK.SET.impact=true;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,12);
      BKT.PROG.skillOwned[hero]={};BKT.PROG.loadouts[hero]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=9999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,combo:0});BK.sim(1);P.st=P.maxSt;};
    window.__foe=(t,dx,hp)=>{const P=BK.P;BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;e.elT=99;e.face=-1;e.speed=0;e.__dx=dx;return e;};
    window.__cap=()=>{const t0=performance.now();while(performance.now()-t0<17);BK.step(1);const v=BK.view,z=v.z||1,P=BK.P,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+12),Math.round(sy-${CH}+12),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));
      return {b:btoa(s),m:{stop:+BK.stop.toFixed(3),k:P.lastKey+':'+P.lastFrame,clink:+(P.clinkT||0).toFixed(3),sh:+BK.shake.toFixed(2)}};};
    window.__pin=(e)=>{const P=BK.P;if(e&&e.alive&&!(e.y<P.y-2)){e.x=P.x+e.__dx*P.face;e.vx=0;e.kvx=0;}};
    return 1;})()`);
  const save = async (name, plan) => {   // plan: [{foe:[t,dx,hp], presses:[frame idx...], n:frames}]
    const meta = []; let idx = 0;
    for (const ph of plan) { await pg.evalp(`(()=>{window.__e=__foe(${JSON.stringify(ph.foe[0])},${ph.foe[1]},${ph.foe[2]});return 1;})()`);
      for (let i = 0; i < ph.n; i++) { const press = ph.presses.includes(i);
        const r = await pg.evalp(`(()=>{${press ? "BK.press('atk');" : ''}__pin(window.__e);return __cap();})()`);
        writeFileSync(join(out, name + '-' + String(idx).padStart(3, '0') + '.png'), png(up(new Uint8Array(Buffer.from(r.b, 'base64'))), CW * SC, CH * SC)); meta.push({ i: idx, ph: plan.indexOf(ph), ...r.m }); idx++; } }
    writeFileSync(join(out, name + '-meta.json'), JSON.stringify(meta)); console.log(name, meta.length, 'frames, max stop', Math.max(...meta.map(m => m.stop)), 'keys', [...new Set(meta.map(m => m.k))].slice(0, 8).join(' ')); };
  for (const hero of ['knight', 'paladin', 'pirate', 'geomancer', 'berserker', 'ranger']) {
    await pg.evalp(`(()=>{__set(${JSON.stringify(hero)});return 1;})()`);
    await save(hero, [{ foe: ['brute', +(process.env.DX || 22), 99999], presses: [3], n: 16 }]);
  }
} finally { pg.close(); }
