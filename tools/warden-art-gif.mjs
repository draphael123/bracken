// tools/warden-art-gif.mjs - THE WARDEN'S ART PASS, AS GIFS (claude/wardenart). The ultimate and the three javelin charge tiers + release, as the game draws them.
//   node tools/warden-art-gif.mjs <outdir>     -> <outdir>/ult.gif, <outdir>/charge.gif  (one headless browser, closed at the end)
// A crop of the game's own buffer around the Warden every 3 sim frames, scaled x4, written as a GIF by the small encoder below (no dependencies).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/wardenart/after';
mkdirSync(out, { recursive: true });
const CW = 72, CH = 44, S = 6;

function lzw(idx, minBits) {   // GIF LZW
  const clear = 1 << minBits, eoi = clear + 1, bytes = []; let bits = 0, nb = 0, size = minBits + 1, next = eoi + 1, dict = new Map();
  const put = c => { bits |= c << nb; nb += size; while (nb >= 8) { bytes.push(bits & 255); bits >>= 8; nb -= 8; } };
  put(clear); let cur = idx[0];
  for (let i = 1; i < idx.length; i++) { const k = idx[i], key = cur * 4096 + k;
    if (dict.has(key)) cur = dict.get(key);
    else { put(cur); if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { put(clear); dict = new Map(); next = eoi + 1; size = minBits + 1; } cur = k; } }
  put(cur); put(eoi); if (nb > 0) bytes.push(bits & 255); return bytes;
}
function gif(frames, w, h, delay) {   // frames: Uint8Array RGBA (w*h*4) each
  const pal = new Map(), q = v => v & 0xf8; let reduce = false;
  for (const f of frames) for (let i = 0; i < f.length; i += 4) { pal.set((f[i] << 16) | (f[i + 1] << 8) | f[i + 2], 0); if (pal.size > 255) { reduce = true; break; } }
  const key = (r, g, b) => reduce ? (q(r) << 16) | (q(g) << 8) | q(b) : (r << 16) | (g << 8) | b;
  const cols = new Map(); for (const f of frames) for (let i = 0; i < f.length; i += 4) { const k = key(f[i], f[i + 1], f[i + 2]); cols.set(k, (cols.get(k) || 0) + 1); }
  let list = [...cols.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 255); if (!list.length) list = [0];
  const index = new Map(list.map((c, i) => [c, i])), near = c => { let best = 0, bd = 1e9; const r = c >> 16, g = (c >> 8) & 255, b = c & 255;
    list.forEach((p, i) => { const d = (r - (p >> 16)) ** 2 + (g - ((p >> 8) & 255)) ** 2 + (b - (p & 255)) ** 2; if (d < bd) { bd = d; best = i; } }); return best; };
  const bitsN = Math.max(2, Math.ceil(Math.log2(list.length + 1))), tsize = 1 << bitsN;
  const b = [...Buffer.from('GIF89a'), w & 255, w >> 8, h & 255, h >> 8, 0x80 | (bitsN - 1), 0, 0];
  for (let i = 0; i < tsize; i++) { const c = list[i] ?? 0; b.push(c >> 16, (c >> 8) & 255, c & 255); }
  b.push(0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  const cache = new Map();
  for (const f of frames) { const idx = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const k = key(f[i * 4], f[i * 4 + 1], f[i * 4 + 2]); let v = index.get(k); if (v === undefined) { v = cache.get(k); if (v === undefined) { v = near(k); cache.set(k, v); } } idx[i] = v; }
    b.push(0x21, 0xf9, 4, 0, delay & 255, delay >> 8, 0, 0, 0x2c, 0, 0, 0, 0, w & 255, w >> 8, h & 255, h >> 8, 0, bitsN);
    const data = lzw(idx, bitsN); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); b.push(n); for (let j = 0; j < n; j++) b.push(data[i + j]); } b.push(0); }
  b.push(0x3b); return Buffer.from(b);
}
const up = (rgba) => { const W = CW * S, H = CH * S, o = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((y / S | 0) * CW + (x / S | 0)) * 4, d = (y * W + x) * 4; o[d] = rgba[s]; o[d + 1] = rgba[s + 1]; o[d + 2] = rgba[s + 2]; o[d + 3] = 255; } return o; };

function crc(b){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;}
function png(rgba,w,h){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const strip=(frames,pick,cols=4,sc=3)=>{const W=CW*S,H=CH*S,fw=W/ (S/sc)|0,fh=H/(S/sc)|0,rows=Math.ceil(pick.length/cols),o=new Uint8Array(fw*cols*fh*rows*4);
  pick.forEach((fi,k)=>{const f=frames[fi],ox=(k%cols)*fw,oy=Math.floor(k/cols)*fh;for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){const s=((y*(S/sc))*W+(x*(S/sc)))*4,d=((oy+y)*fw*cols+ox+x)*4;o[d]=f[s];o[d+1]=f[s+1];o[d+2]=f[s+2];o[d+3]=255;}});return png(o,fw*cols,fh*rows);};
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  await pg.evalp(`(async()=>{
    window.__set=(foes)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('warden');BK.reset({fresh:true});BKT.setHeroLevel('warden',10);
      BKT.PROG.skillOwned.warden={};BKT.PROG.loadouts.warden=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=9999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,vigil:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=99999;e.cd=99;e.elT=99;e.face=-1;e.speed=0;return e;});};
    window.__cap=()=>{BK.step(1);const v=BK.view,z=v.z||1,P=BK.P,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+6),Math.round(sy-${CH}+8),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));return btoa(s)+'|'+P.lastKey+':'+P.lastFrame+'|'+(P.wthHold||0);};
    return 1;})()`);
  const grab = async n => { const frames = [], keys = []; for (let i = 0; i < n; i++) { const r = await pg.evalp('(()=>{const a=__cap();BK.sim(2);return a;})()'); const [b64, k, h] = r.split('|'); frames.push(up(new Uint8Array(Buffer.from(b64, 'base64')))); keys.push(k + (h !== '0' ? '/t' + h : '')); } return { frames, keys }; };
  const run = async (js, n) => { await pg.evalp(js); return grab(n); };
  const ult = await run(`(()=>{const [e]=__set([['sprig',70]]);const P=BK.P;e.hp=e.hp0=99999;P.vigil=100;BK.keys.up=true;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.up=false;BK.sim(1);return 1;})()`, 40);
  const ult2 = await run(`(()=>{BK.press && BK.press('attack');return 1;})()`, 14);
  writeFileSync(join(out, 'ult.gif'), gif([...ult.frames, ...ult2.frames], CW * S, CH * S, 5)); {const all=[...ult.frames,...ult2.frames];writeFileSync(join(out,'ult-strip.png'),strip(all,[0,1,2,3,6,10,16,24,32,40,46,52]));}
  console.log('ult', [...new Set([...ult.keys, ...ult2.keys])].join(' '));
  const ch = await run(`(()=>{const [e]=__set([['sprig',90]]);BK.sim(20);BK.keys.block=true;return 1;})()`, 56);   // 112 sim frames of hold: past 1.45 s (87 frames)
  await pg.evalp('(()=>{BK.keys.block=false;return 1;})()');
  const rel = await grab(24);
  writeFileSync(join(out, 'charge.gif'), gif([...ch.frames, ...rel.frames], CW * S, CH * S, 5)); {const all=[...ch.frames,...rel.frames];const k=ch.keys.concat(rel.keys);const pick=[];let last='';k.forEach((x,i)=>{if(x!==last&&pick.length<12){pick.push(i);}last=x;});writeFileSync(join(out,'charge-strip.png'),strip(all,pick.slice(0,12)));writeFileSync(join(out,'charge-zoom.png'),strip(all,pick.slice(1,7),3,6));console.log(pick.map(i=>k[i]).join(' '));}
  console.log('charge', [...new Set([...ch.keys, ...rel.keys])].join(' '));
} finally { pg.close(); }
