// PAGE TOOL: launches headless Chrome
// tools/geopop-gif.mjs - THE GEOMANCER POPULARITY PASS AS A GIF (claude/geopop, Daniel 11-03): in the Arena Yard's straw row, three combos -> three knee stones (the third jab plants) -> DOWN+C: DETONATE.
//   node tools/geopop-gif.mjs <outdir> [name=yard-run]   -> <outdir>/<name>.gif   (one headless browser, closed at the end; a crop of the game buffer every 3 sim frames, x4; the waits between combos are jump-cut)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
import { deflateSync } from 'node:zlib';
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
function png(rgba, w, h) { const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const chunk = (ty, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(ty, 4); d.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]); }
const out = process.argv[2] || 'work/claude/geopop', MODE = process.argv[4] === 'boss' ? 'boss' : 'yard', name = process.argv[3] || (MODE === 'boss' ? 'boss-run' : 'yard-run'), FEEL = process.argv[5] !== '0';   // [4] yard|boss (boss = the Wood Troll's arena, god mode), [5] 0 = GEO.pop.feel off (the BUILD look, for the BEFORE gif)
mkdirSync(out, { recursive: true });
const CW = MODE === 'boss' ? 220 : 150, CH = MODE === 'boss' ? 118 : 84, S = MODE === 'boss' ? 3 : 4, STEP = 3;
function lzw(idx, minBits) {   // GIF LZW
  const clear = 1 << minBits, eoi = clear + 1, bytes = []; let bits = 0, nb = 0, size = minBits + 1, next = eoi + 1, dict = new Map();
  const put = c => { bits |= c << nb; nb += size; while (nb >= 8) { bytes.push(bits & 255); bits >>= 8; nb -= 8; } };
  put(clear); let cur = idx[0];
  for (let i = 1; i < idx.length; i++) { const k = idx[i], key = cur * 4096 + k;
    if (dict.has(key)) cur = dict.get(key);
    else { put(cur); if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { put(clear); dict = new Map(); next = eoi + 1; size = minBits + 1; } cur = k; } }
  put(cur); put(eoi); if (nb > 0) bytes.push(bits & 255); return bytes;
}
function gif(frames, w, h, delay) {   // frames: Uint8Array RGBA (w*h*4) each; one shared palette (5-bit quantised when there are more than 255 colours)
  const q = v => v & 0xf8, key = (r, g, b) => (q(r) << 16) | (q(g) << 8) | q(b);
  const cols = new Map(); for (const f of frames) for (let i = 0; i < f.length; i += 4) { const k = key(f[i], f[i + 1], f[i + 2]); cols.set(k, (cols.get(k) || 0) + 1); }
  let list = [...cols.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 255); if (!list.length) list = [0];
  const index = new Map(list.map((c, i) => [c, i])), cache = new Map(), near = c => { let best = 0, bd = 1e9; const r = c >> 16, g = (c >> 8) & 255, b = c & 255;
    list.forEach((p, i) => { const d = (r - (p >> 16)) ** 2 + (g - ((p >> 8) & 255)) ** 2 + (b - (p & 255)) ** 2; if (d < bd) { bd = d; best = i; } }); return best; };
  const bitsN = Math.max(2, Math.ceil(Math.log2(list.length + 1))), tsize = 1 << bitsN;
  const b = [...Buffer.from('GIF89a'), w & 255, w >> 8, h & 255, h >> 8, 0x80 | (bitsN - 1), 0, 0];
  for (let i = 0; i < tsize; i++) { const c = list[i] ?? 0; b.push(c >> 16, (c >> 8) & 255, c & 255); }
  b.push(0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  for (const f of frames) { const idx = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const k = key(f[i * 4], f[i * 4 + 1], f[i * 4 + 2]); let v = index.get(k); if (v === undefined) { v = cache.get(k); if (v === undefined) { v = near(k); cache.set(k, v); } } idx[i] = v; }
    b.push(0x21, 0xf9, 4, 0, delay & 255, delay >> 8, 0, 0, 0x2c, 0, 0, 0, 0, w & 255, w >> 8, h & 255, h >> 8, 0, bitsN);
    const data = lzw(idx, bitsN); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); b.push(n); for (let j = 0; j < n; j++) b.push(data[i + j]); } b.push(0); }
  b.push(0x3b); return Buffer.from(b);
}
const up = rgba => { const W = CW * S, H = CH * S, o = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((y / S | 0) * CW + (x / S | 0)) * 4, d = (y * W + x) * 4; o[d] = rgba[s]; o[d + 1] = rgba[s + 1]; o[d + 2] = rgba[s + 2]; o[d + 3] = 255; } return o; };
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    window.__stand=(p,col)=>{p.x=col*16+8;p.y=22*16-0.01;p.vx=0;p.vy=0;p.face=1;p.ground=true;};
    window.__go=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BK.applyUpgrades();BK.load(IDX);BK.start();BK.god=false;BK.sim(30);
      const P=BK.P;P.hp=P.maxHp=9999;__stand(P,13);BK.sim(20);return 1;};
    window.__cap=()=>{BK.step(STEP);const v=BK.view,z=v.z||1,P=BK.P,mx=window.__mid?window.__mid():P.x,sx=v.VW/2+(mx-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z,c=document.createElement('canvas');c.width=${CW};c.height=${CH};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#223';g.fillRect(0,0,${CW},${CH});g.drawImage(v.buf,Math.round(sx-${CW}/2+40),Math.round(sy-${CH}+22),${CW},${CH},0,0,${CW},${CH});
      const d=g.getImageData(0,0,${CW},${CH}).data;let s='';for(let i=0;i<d.length;i+=8192)s+=String.fromCharCode.apply(null,d.subarray(i,i+8192));return btoa(s);};
    window.__goBoss=()=>{const into=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(120);};
      for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.setHeroLevel('geomancer',20);BK.applyUpgrades();BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.state='play';BK.start&&BK.start();BK.sim(30);BK.god=true;into();BK.sim(100);
      window.__mid=()=>BK.boss?(BK.P.x+BK.boss.x)/2:BK.P.x;window.__bstand=()=>{const P=BK.P,b=BK.boss;P.x=b.x-70;P.face=1;P.vx=0;P.ground=true;};__bstand();BK.sim(10);return BK.boss?1:0;};
    return 1;})()`.replace('STEP', String(STEP)));
  await pg.evalp(MODE === 'boss' ? '__goBoss()' : '__go()');
  if (!FEEL) await pg.evalp('(()=>{BK.geoK.pop.feel=false;return 1;})()');
  const frames = [], grab = async n => { for (let i = 0; i < n; i++) frames.push(up(new Uint8Array(Buffer.from(await pg.evalp('__cap()'), 'base64')))); };
  for (let c = 0; c < 3; c++) {
    await pg.evalp(MODE === 'boss' ? '(()=>{__bstand();return 1;})()' : '__stand(BK.P,13)');
    for (let j = 0; j < 3; j++) { await pg.evalp("(()=>{BK.press('atk');return 1;})()"); await grab(8); }   // the three jabs of a combo (~24 sim frames each)
    await grab(6);
    if (c < 2) await pg.evalp('(()=>{BK.sim(150);return 1;})()');   // the 3 s between plants, jump-cut
  }
  await grab(6);
  await pg.evalp("(()=>{BK.keys.down=true;BK.keys.block=true;return 1;})()"); await grab(2);
  await pg.evalp("(()=>{BK.keys.block=false;BK.keys.down=false;return 1;})()"); await grab(22);
  const st = JSON.parse(await pg.evalp('JSON.stringify({stones:BK.geo().standing(),dets:BK.geo().tierStats().detonates||0,plants:BK.geo().tierStats().fistPlants||0,fists:BK.geo().tierStats().fists||0,boss:!!BK.boss,bx:BK.boss&&BK.boss.x,px:BK.P.x,bhp:BK.boss&&BK.boss.hp})'));
  if (process.env.SHEET) { const pick = process.env.SHEET.split(',').map(Number), W = CW * S, H = CH * S, cols = 2, rows = Math.ceil(pick.length / cols), o = new Uint8Array(W * cols * H * rows * 4);
    pick.forEach((fi, i) => { const f = frames[Math.min(fi, frames.length - 1)], ox = (i % cols) * W, oy = Math.floor(i / cols) * H; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = (y * W + x) * 4, d = ((oy + y) * W * cols + ox + x) * 4; o[d] = f[s]; o[d + 1] = f[s + 1]; o[d + 2] = f[s + 2]; o[d + 3] = 255; } });
    writeFileSync(join(out, name + '-sheet.png'), png(o, W * cols, H * rows)); }
  writeFileSync(join(out, name + '.gif'), gif(frames, CW * S, CH * S, 7));
  console.log(name, frames.length + ' frames', JSON.stringify(st));
} finally { pg.close(); }
