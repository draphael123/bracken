// tools/hnlook-walk.mjs - WALK THROUGH THE HORNET'S NEST and record it (claude/hnlook, Daniel 11-03: 'when you move, this area looks weird').  node tools/hnlook-walk.mjs <out.gif> [col=168] [row=43] [frames=330] [hero=geomancer] [every=3] [scale=2]
// A headless page, god mode, the hero walked right on real keys (jumps when stuck); the game buffer every N sim frames; logs the camera's fractional part and view zoom. Writes <out>.gif and <out>-still.png (frame 20).
import { writeFileSync } from 'node:fs'; import { deflateSync } from 'node:zlib'; import { openPage } from './cdp.mjs';
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
const [outP = 'walk.gif', COL = '168', ROW = '43', NF = '330', HERO = 'geomancer', EVERY = '3', SC = '2', END = ''] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
    BK.setHero(${JSON.stringify(HERO)}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(60); BK.tp(${+COL}, ${+ROW}); BK.sim(30);
    const frames = [], cam = []; let last = BK.P.x, stuck = 0;
    for (let f = 0; f < ${+NF}; f++) { BK.keys.right = true; if (f % 20 === 0) { if (Math.abs(BK.P.x - last) < 4) BK.keys.jump = true; last = BK.P.x; } else BK.keys.jump = false; BK.step(1);
      if (f % ${+EVERY} === 0) { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const g = c.getContext('2d'); g.drawImage(b, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let s = ''; for (let i = 0; i < d.length; i += 8192) s += String.fromCharCode.apply(null, d.subarray(i, i + 8192)); frames.push(btoa(s)); const v = BK.view; cam.push([+(v.x).toFixed(3), +(v.y).toFixed(3), v.z, Math.round(BK.P.x), Math.round(BK.P.y)]); } }
    BK.keys.right = false; BK.keys.jump = false; return { frames, cam, w: BK.buf.width, h: BK.buf.height }; })()`, 600000);
  const SCn = +SC, W = r.w, H = r.h, up = rgba => { const o = new Uint8Array(W * SCn * H * SCn * 4); for (let y = 0; y < H * SCn; y++) for (let x = 0; x < W * SCn; x++) { const s = ((y / SCn | 0) * W + (x / SCn | 0)) * 4, d = (y * W * SCn + x) * 4; o[d] = rgba[s]; o[d + 1] = rgba[s + 1]; o[d + 2] = rgba[s + 2]; o[d + 3] = 255; } return o; };
  const fr = r.frames.map(b => up(Uint8Array.from(Buffer.from(b, 'base64'))));
  writeFileSync(outP, gif(fr, W * SCn, H * SCn, Math.round(+EVERY * 1.67)));
  writeFileSync(outP.replace(/\.gif$/, '') + '-still.png', png(fr[Math.min(20, fr.length - 1)], W * SCn, H * SCn));
  if (process.env.PNGS) for (const i of process.env.PNGS.split(',').map(Number)) if (fr[i]) writeFileSync(outP.replace(/.gif$/, '') + '-f' + i + '.png', png(fr[i], W * SCn, H * SCn));
  console.log(fr.length + ' frames', W, H, 'cam sample', JSON.stringify(r.cam.slice(0, 6)), '... last', JSON.stringify(r.cam.slice(-2)), 'errors', JSON.stringify(pg.errors.slice(0, 3)));
  const zs = new Set(r.cam.map(c => c[2])), fx = r.cam.filter(c => c[0] % 1 !== 0).length; console.log('view.z values', [...zs], 'fractional cam.x frames', fx + '/' + r.cam.length);
} finally { pg.close(); }
