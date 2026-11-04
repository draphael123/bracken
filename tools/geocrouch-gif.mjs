// tools/geocrouch-gif.mjs - THE UPPERCUT COMBO and STONE SKIN TAKING HITS AS GIFS (claude/geocrouch, Daniel 11-03), as the game draws them.
//   node tools/geocrouch-gif.mjs <outdir> [which=uppercut,skin]   -> <outdir>/<which>.gif   (one headless browser, closed at the end; a crop of the game buffer every 2 sim frames, x5)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { openPage } from './cdp.mjs';
const out = process.argv[2] || 'work/claude/geocrouch', WANT = (process.argv[3] || 'uppercut,skin').split(',');
mkdirSync(out, { recursive: true });
const CW = 120, CH = 76, S = 5;
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

function crc(b){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;}
function png(rgba,w,h){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const strip=(frames,pick,cols=3,sc=3)=>{const W=CW*S,H=CH*S,fw=W/ (S/sc)|0,fh=H/(S/sc)|0,rows=Math.ceil(pick.length/cols),o=new Uint8Array(fw*cols*fh*rows*4);
  pick.forEach((fi,k)=>{const f=frames[fi],ox=(k%cols)*fw,oy=Math.floor(k/cols)*fh;for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){const s=((Math.floor(y*(S/sc)))*W+Math.floor(x*(S/sc)))*4,d=((oy+y)*fw*cols+ox+x)*4;o[d]=f[s];o[d+1]=f[s+1];o[d+2]=f[s+2];o[d+3]=255;}});return png(o,fw*cols,fh*rows);};
const up = (rgba) => { const W = CW * S, H = CH * S, o = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((y / S | 0) * CW + (x / S | 0)) * 4, d = (y * W + x) * 4; o[d] = rgba[s]; o[d + 1] = rgba[s + 1]; o[d + 2] = rgba[s + 2]; o[d + 3] = 255; } return o; };
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  await pg.evalp(`(async()=>{
    window.__set=(hero,foes)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,12);
      BKT.PROG.skillOwned[hero]={};BKT.PROG.loadouts[hero]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp=9999,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,combo:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=99999;e.cd=99;e.elT=99;e.face=-1;e.speed=0;return e;});};
    window.__cap=()=>{BK.step(1);const v=BK.view,z=v.z||1,P=BK.P,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+16),Math.round(sy-${CH}+10),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));return btoa(s)+'|'+P.lastKey+':'+P.lastFrame;};
    return 1;})()`);
  for (const w of WANT) {
    await pg.evalp("(()=>{window.__e=__set('geomancer',[['sprig',22]])[0];window.__e.biteCd=99;window.__e.px=window.__e.x;BK.sim(300);const P=BK.P,e=window.__e;P.x=e.x-22;P.face=1;P.vx=0;BK.sim(2);return 1;})()");
    const frames = [];
    const cap = async (n, pin = true) => { for (let i = 0; i < n; i++) { const r = await pg.evalp("(()=>{const P=BK.P,e=window.__e;e.cd=99;e.biteCd=99;" + (pin ? "if(e.alive&&!(e.y<P.y-2)){e.x=P.x+22*P.face;e.vx=0;e.kvx=0;}" : "") + "const a=__cap();BK.sim(1);return a;})()"); frames.push(up(new Uint8Array(Buffer.from(r.split('|')[0], 'base64')))); } };
    if (w === 'uppercut') { for (let j = 1; j <= 3; j++) { await pg.evalp("(()=>{BK.press('atk');return 1;})()"); await cap(j === 3 ? 20 : 12, j !== 3 || true); } await cap(26, false); }
    else { // STONE SKIN: down, three blows from the front (the third cracks it), then she stands and it re-forms
      await pg.evalp("(()=>{window.__e.cd=99;window.__e.biteCd=99;BK.keys.down=true;return 1;})()"); await cap(22);
      for (let h = 0; h < 3; h++) { await pg.evalp("(()=>{const P=BK.P;P.inv=0;P.hp=P.maxHp;BK.holyHurt(P,P.x+24,20,{who:window.__e});return 1;})()"); await cap(h < 2 ? 22 : 30); }
      await pg.evalp("(()=>{BK.keys.down=false;return 1;})()"); await cap(10);
      await pg.evalp("(()=>{BK.keys.down=true;return 1;})()"); await cap(18); await pg.evalp("(()=>{BK.keys.down=false;return 1;})()"); }
    writeFileSync(join(out, w + '.gif'), gif(frames, CW * S, CH * S, 6)); const pick = []; for (let i = 0; i < frames.length && pick.length < 12; i += Math.max(1, Math.floor(frames.length / 12))) pick.push(i); writeFileSync(join(out, w + '-strip.png'), strip(frames, pick));
    console.log(w, frames.length + ' frames'); }
} finally { pg.close(); }
