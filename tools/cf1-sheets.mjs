// tools/cf1-sheets.mjs <off.json> <on.json> <outdir>: stitches two tools/cf1-proof.mjs runs into one PNG a sheet (top row OFF, bottom row ON, 2x nearest).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
const [fa, fb, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const A = JSON.parse(readFileSync(fa, 'utf8')), B = JSON.parse(readFileSync(fb, 'utf8')), S = 2, W = A.CW, H = A.CH;
function crc(b){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;}
function png(rgba,w,h){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1);}
  const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const meta = {};
for (const name of Object.keys(A.sheets)) {
  const rows = [A.sheets[name], B.sheets[name] || []], n = Math.max(...rows.map(r => r.length)), GAP = 2, SW = n * (W * S + GAP), SH = 2 * (H * S + GAP);
  const img = new Uint8Array(SW * SH * 4); for (let i = 0; i < img.length; i += 4) { img[i] = 20; img[i + 1] = 20; img[i + 2] = 28; img[i + 3] = 255; }
  rows.forEach((row, ri) => row.forEach((f, ci) => { const px = new Uint8Array(Buffer.from(f.b, 'base64')), ox = ci * (W * S + GAP), oy = ri * (H * S + GAP);
    for (let y = 0; y < H * S; y++) for (let x = 0; x < W * S; x++) { const s = ((y / S | 0) * W + (x / S | 0)) * 4, d = ((oy + y) * SW + ox + x) * 4; img[d] = px[s]; img[d + 1] = px[s + 1]; img[d + 2] = px[s + 2]; img[d + 3] = 255; } }));
  writeFileSync(join(out, name + '.png'), png(img, SW, SH));
  meta[name] = { off: A.sheets[name].map(f => f.m), on: (B.sheets[name] || []).map(f => f.m) };
}
writeFileSync(join(out, 'sheets-meta.json'), JSON.stringify(meta, null, 1)); console.log(Object.keys(meta).length, 'sheets ->', out);
