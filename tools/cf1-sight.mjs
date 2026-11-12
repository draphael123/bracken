// tools/cf1-sight.mjs - CF1 PRE-DEPLOY SIGHT CHECK (claude/rel165, 2026-11-12): REAL key events (CDP Input.dispatchKeyEvent, key 'x' = attack), the sim stepped by hand between them.
//   node tools/cf1-sight.mjs <outdir>     one headless browser. Run it on a tree where CF1_SHIPS is true (or add ?cf1=1). Not a check; a looking tool.
//   Writes one PNG strip a scene (3x, hero crop) + sight.json (per-frame probe values). Scenes: heavy charge pyro/warden (glint at half, flash at full), warden tip / shaft.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/cf1sight', CW = 96, CH = 64, S = 3;
mkdirSync(out, { recursive: true });
function crc(b){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;}
function png(rgba,w,h){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
const res = {};
const key = async (type) => pg.send('Input.dispatchKeyEvent', { type, key: 'x', code: 'KeyX', windowsVirtualKeyCode: 88, text: type === 'keyDown' ? 'x' : undefined });
try {
  await pg.evalp(`(async()=>{
    window.__set=(hero)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=0.6;BK.SET.hitstop=true;BK.SET.shake=true;BK.SET.shakeMode='hit';BK.SET.reduceMotion=false;BK.SET.flashes=true;BK.SET.impact=true;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,12);
      BKT.PROG.skillOwned[hero]={};BKT.PROG.loadouts[hero]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=9999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,combo:0});BK.sim(1);P.st=P.maxSt;};
    window.__foe=(t,dx,hp)=>{const P=BK.P;BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;e.elT=99;e.face=-1;e.speed=0;e.__dx=dx;return e;};
    window.__pin=(e)=>{const P=BK.P;P.inv=5;P.hurt=0;if(e&&e.alive){e.x=P.x+e.__dx*P.face;e.vx=0;e.kvx=0;e.cd=99;}};
    window.__cap=()=>{const t0=performance.now();while(performance.now()-t0<17);BK.step(1);const v=BK.view,z=v.z||1,P=BK.P,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+16),Math.round(sy-${CH}+14),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='',white=0;for(let i=0;i<d.length;i+=4){if(d[i]>235&&d[i+1]>235&&d[i+2]>235)white++;}for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));
      const e=window.__e||{};return {b:btoa(s),m:{stop:+BK.stop.toFixed(3),k:P.lastKey+':'+P.lastFrame,half:P.cf1Half?1:0,flashAt:P.cf1FlashAt==null?null:+P.cf1FlashAt.toFixed(3),relAt:P.cf1RelAt==null?null:+P.cf1RelAt.toFixed(3),held:+(P.atkHeld||0).toFixed(3),chg:+(P.charge||0).toFixed(3),full:P.chargeFull?1:0,white,tip:e.cf1TipT?1:0,shaft:e.cf1ShaftT?1:0,sh:+BK.shake.toFixed(2),hp:e.hp}};};
    return 1;})()`);
  const strip = (name, frames) => {
    const n = frames.length, GAP = 2, SW = n * (CW * S + GAP), SH = CH * S, img = new Uint8Array(SW * SH * 4); for (let i = 0; i < img.length; i += 4) { img[i] = 20; img[i + 1] = 20; img[i + 2] = 28; img[i + 3] = 255; }
    frames.forEach((f, ci) => { const px = new Uint8Array(Buffer.from(f.b, 'base64')), ox = ci * (CW * S + GAP); for (let y = 0; y < SH; y++) for (let x = 0; x < CW * S; x++) { const s = ((y / S | 0) * CW + (x / S | 0)) * 4, d = (y * SW + ox + x) * 4; img[d] = px[s]; img[d + 1] = px[s + 1]; img[d + 2] = px[s + 2]; img[d + 3] = 255; } });
    writeFileSync(join(out, name + '.png'), png(img, SW, SH));
  };
  /* a scene: hero, foe or null, steps: [{at:n, k:'keyDown'|'keyUp'}], n steps; keep(i, m) says which frames go on the strip */
  const scene = async (name, hero, foe, acts, n, keep) => {
    await pg.evalp(`(()=>{__set(${JSON.stringify(hero)});window.__e=${foe ? `__foe(${JSON.stringify(foe[0])},${foe[1]},${foe[2]})` : 'null'};return 1;})()`);
    const all = [], kept = [];
    for (let i = 0; i < n; i++) {
      if (acts[i]) await key(acts[i]);   /* a real key event; the page's handler has run when this resolves */
      const r = await pg.evalp('(()=>{__pin(window.__e);return __cap();})()');
      all.push({ i, ...r.m }); if (keep(i, r.m, all)) kept.push(r);
    }
    strip(name, kept); res[name] = { frames: all, kept: kept.length };
    const first = (f) => all.find(f); console.log(name, 'kept', kept.length, 'maxStop', Math.max(...all.map(m => m.stop)), 'half@', (first(m => m.half) || {}).i, 'flashAt set@', (first(m => m.flashAt != null) || {}).i, 'maxWhite', Math.max(...all.map(m => m.white)), 'tip', all.some(m => m.tip) ? 1 : 0, 'shaft', all.some(m => m.shaft) ? 1 : 0);
  };
  /* 1. heavy charge, no foe near: hold X until the heavy goes by itself (pyro / warden), release; keep every 6th frame plus the ones around the half-charge and the flash */
  for (const hero of ['pyro', 'warden', 'ranger']) {
    let halfI = null, flashI = null;
    await scene('heavy-' + hero, hero, null, { 2: 'keyDown', 150: 'keyUp' }, 170, (i, m) => { if (m.half && halfI === null) halfI = i; if (m.flashAt != null && flashI === null) flashI = i; return i === 1 || (halfI !== null && i >= halfI - 2 && i <= halfI + 3) || (flashI !== null && i >= flashI - 1 && i <= flashI + 5) || i % 20 === 0; });
  }
  /* 2. the warden's point and the shaft: the foe at distance dx, one real X tap on frame 4. Scan dx for what registers. */
  for (const [nm, dx] of [['warden-tip', 38], ['warden-tip-b', 34], ['warden-shaft', 26], ['warden-shaft-b', 22]]) {
    await scene(nm, 'warden', ['brute', dx, 99999], { 4: 'keyDown', 6: 'keyUp' }, 22, (i) => i >= 3 && i <= 14);
  }
} finally { pg.close(); }
writeFileSync(join(out, 'sight.json'), JSON.stringify(res));
