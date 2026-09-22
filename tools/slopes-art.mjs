// tools/slopes-art.mjs — renders the sand slope tiles (src/redraw/slopes.js) as a dune to a PNG, in Node, with no browser:
// a thirty-line canvas shim (fillRect only, which is all px.js uses) and a hand-rolled PNG writer.
// usage: node tools/slopes-art.mjs [out.png]      (default docs/slopes-sand.png; scale x4)
import zlib from 'node:zlib'; import { writeFileSync } from 'node:fs';
const parse = c => { if (c.startsWith('#')) { const h = c.slice(1); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16)).concat(255); } return [255,0,255,255]; };
globalThis.document = { createElement: () => { const cv = { width: 1, height: 1, _p: null, getContext() { const ctx = { imageSmoothingEnabled: false, fillStyle: '#000', fillRect(x,y,w,h) { if (!cv._p) cv._p = new Uint8Array(cv.width*cv.height*4); const col = parse(ctx.fillStyle); for (let j=y;j<y+h;j++) for (let i=x;i<x+w;i++) if (i>=0&&j>=0&&i<cv.width&&j<cv.height) cv._p.set(col,(j*cv.width+i)*4); } }; return ctx; } }; return cv; } };
const { bakeSandSlopes } = await import('../src/redraw/slopes.js');
const { SLOPE } = await import('../src/slopes.js');
const A = bakeSandSlopes(), S = 4;
// a dune: flat, R2A R2B R2A R2B, R1 R1, top x3, L1, L2B L2A L2B L2A, flat; rows as in the yard
const cols = [['top',3],['top',3],[SLOPE.R2A,2],[SLOPE.R2B,2],[SLOPE.R2A,1],[SLOPE.R2B,1],[SLOPE.R1,0],['top',0],['top',0],['top',0],[SLOPE.L1,0],[SLOPE.L2B,1],[SLOPE.L2A,1],[SLOPE.L2B,2],[SLOPE.L2A,2],['top',3],['top',3]];
const W = cols.length*16, H = 7*16, img = new Uint8Array(W*H*4);
for (let i=0;i<W*H;i++) img.set([120,170,210,255], i*4);
const blit = (cv, ox, oy) => { if (!cv._p) return; for (let j=0;j<16;j++) for (let i=0;i<16;i++) { const k=(j*16+i)*4; if (cv._p[k+3]) img.set(cv._p.subarray(k,k+4), ((oy+j)*W+ox+i)*4); } };
cols.forEach(([k,row],ci) => { const ox = ci*16, r = row+2; blit((k==='top'?A.top:A[k])[ci%3], ox, r*16); for (let y=r+1;y<7;y++) blit((y===r+1 && k!=='top' ? A.under[k] : A.fill)[(ci+y)%3], ox, y*16); });
// scale up
const SW = W*S, SH = H*S, raw = Buffer.alloc((SW*4+1)*SH);
for (let y=0;y<SH;y++) { raw[y*(SW*4+1)] = 0; for (let x=0;x<SW;x++) { const k=((y/S|0)*W+(x/S|0))*4; raw.set(img.subarray(k,k+4), y*(SW*4+1)+1+x*4); } }
const crc = b => { let c, t=[]; for (let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;} c=0xffffffff; for (const x of b) c=t[(c^x)&255]^(c>>>8); return (c^0xffffffff)>>>0; };
const chunk = (ty, d) => { const l=Buffer.alloc(4); l.writeUInt32BE(d.length); const td=Buffer.concat([Buffer.from(ty),d]); const c=Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l,td,c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(SW,0); ih.writeUInt32BE(SH,4); ih[8]=8; ih[9]=6;
const outPath = process.argv[2] || new URL('../docs/slopes-sand.png', import.meta.url);
writeFileSync(outPath, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',ih), chunk('IDAT',zlib.deflateSync(raw)), chunk('IEND',Buffer.alloc(0))]));
console.log('wrote', SW, 'x', SH);
