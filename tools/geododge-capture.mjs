// tools/geododge-capture.mjs - claude/geododge: the Geomancer's dodges beside other heroes', frame by frame, from the real page.
//   node tools/geododge-capture.mjs <before|after> [outDir]   -> <outDir>/<tag>/*.gif + <tag>-telemetry.json
// One browser, closed at the end. GIFs are written by the small LZW encoder below (no npm packages).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
const tag = process.argv[2] || 'before', out = join(process.argv[3] || 'out', tag); mkdirSync(out, { recursive: true });
const CW = 110, CH = 70, SC = 3, EVERY = 2;
const pg = await openPage({ audio: false, fonts: false });
function gif(frames, w, h, delay) {   /* frames: Uint8ClampedArray RGBA at w*h; global palette (<=256 colours, else coarse-quantised) */
  const key = (r, g, b) => (r << 16) | (g << 8) | b; let pal = new Map(), q = 0;
  const addAll = () => { pal = new Map(); for (const f of frames) for (let i = 0; i < f.length; i += 4) { const k = key(f[i] >> q << q, f[i + 1] >> q << q, f[i + 2] >> q << q); if (!pal.has(k)) pal.set(k, pal.size); if (pal.size > 256) return false; } return true; };
  while (!addAll()) q++;
  const bytes = []; const w16 = n => bytes.push(n & 255, n >> 8 & 255);
  bytes.push(...Buffer.from('GIF89a')); w16(w); w16(h); bytes.push(0xF7, 0, 0);
  const colors = [...pal.keys()]; for (let i = 0; i < 256; i++) { const k = colors[i] ?? 0; bytes.push(k >> 16 & 255, k >> 8 & 255, k & 255); }
  bytes.push(0x21, 0xFF, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  for (const f of frames) {
    bytes.push(0x21, 0xF9, 4, 0, delay & 255, delay >> 8, 0, 0, 0x2C); w16(0); w16(0); w16(w); w16(h); bytes.push(0, 8);
    const idx = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) idx[i] = pal.get(key(f[i * 4] >> q << q, f[i * 4 + 1] >> q << q, f[i * 4 + 2] >> q << q));
    const dict = new Map(); let next = 258, bits = 9; const buf = []; let acc = 0, nb = 0;
    const put = c => { acc |= c << nb; nb += bits; while (nb >= 8) { buf.push(acc & 255); acc >>= 8; nb -= 8; } };
    put(256); let cur = idx[0];
    for (let i = 1; i < idx.length; i++) { const c = idx[i], k = cur * 256 + c; if (dict.has(k)) cur = dict.get(k); else { put(cur); if (next < 4096) { dict.set(k, next++); if (next > (1 << bits) && bits < 12) bits++; } else { put(256); dict.clear(); next = 258; bits = 9; } cur = c; } }
    put(cur); put(257); if (nb > 0) buf.push(acc & 255);
    for (let i = 0; i < buf.length; i += 255) { const n = Math.min(255, buf.length - i); bytes.push(n, ...buf.slice(i, i + n)); } bytes.push(0);
  }
  bytes.push(0x3B); return Buffer.from(bytes);
}
const scale = (f, w, h) => { const o = new Uint8ClampedArray(w * SC * h * SC * 4); for (let y = 0; y < h * SC; y++) for (let x = 0; x < w * SC; x++) { const s = ((y / SC | 0) * w + (x / SC | 0)) * 4, d = (y * w * SC + x) * 4; o[d] = f[s]; o[d + 1] = f[s + 1]; o[d + 2] = f[s + 2]; o[d + 3] = 255; } return o; };
try {
  await pg.evalp(`(()=>{
    window.__prep=(h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(0);BK.state='play';
      BK.enemies().length=0;BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(40);const P=BK.P;Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,vx:0,face:1,dodgeCd:0,dashCd:0,dodge:0,dash:0});P.st=P.maxSt;BK.sim(1);P.st=P.maxSt;};
    window.__grab=(ax,ay)=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(ax-v.x-v.VW/2)*z,sy=v.VH/2+(ay-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-30),Math.round(sy-${CH - 14}),${CW},${CH},0,0,${CW},${CH});const d=g.getImageData(0,0,${CW},${CH}).data;let s='';const a=new Uint8Array(d.buffer);for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);};
    return 1})()`);
  const tel = {};
  const run = async (name, setup, n) => {
    const r = await pg.evalp(`(()=>{ ${setup}; const P=BK.P, ax=P.x, ay=P.y, fr=[], t=[]; const x0=P.x, y0=P.y;
      for(let i=0;i<${n};i++){ if(i%${EVERY}===0) fr.push(__grab(ax,ay)); BK.step(1); t.push([+(P.x-x0).toFixed(1), +(P.y-y0).toFixed(1), Math.round(P.vx), Math.round(P.vy), +(P.dodge||0).toFixed(3), +((P.dodgeInv||0)).toFixed(3), !!P.ground, P.lastKey||'']); }
      return {fr,t}; })()`);
    const frames = r.fr.map(b => scale(new Uint8ClampedArray(Buffer.from(b, 'base64')), CW, CH));
    writeFileSync(join(out, name + '.gif'), gif(frames, CW * SC, CH * SC, Math.round(EVERY * 100 / 60)));
    tel[name] = r.t;
  };
  const air = h => `__prep('${h}'); BK.press('jump'); BK.keys.jump = true; for(let i=0;i<6;i++) BK.step(1); BK.press('dodge')`;   /* (the 6 steps before are not filmed: the film starts at the dodge) */
  const N = 56;
  for (const h of ['geomancer', 'knight', 'ranger', 'pyro']) await run('air-' + h, air(h), 40);
  for (const h of ['geomancer', 'knight']) await run('ground-' + h, `__prep('${h}'); BK.press('dodge')`, 36);
  writeFileSync(join(out, tag + '-telemetry.json'), JSON.stringify(tel));
  const sum = {}; for (const k in tel) { const t = tel[k], d = t.findIndex(r => r[4] <= 0), end = t[d < 0 ? t.length - 1 : d]; sum[k] = { steps: d, dx: end[0], minY: Math.min(...t.map(r => r[1])), yEnd: end[1], vyAtEnd: end[3], peakVx: Math.max(...t.map(r => Math.abs(r[2]))) }; }
  console.log(JSON.stringify(sum, null, 1)); console.log(JSON.stringify(pg.errors));
} finally { pg.close(); }
