// tools/nestshot.mjs - stills of the Hornet's Nest at given spots (claude/nestwalk2).  node tools/nestshot.mjs <outdir> x,y [x,y ...]  (x tile, y = FEET row; the hero is stood there in god mode, 30 frames settled)
import { writeFileSync, mkdirSync } from 'node:fs'; import { deflateSync } from 'node:zlib'; import { openPage } from './cdp.mjs';
const crc = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function png(rgba, w, h) { const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ch = (t, d) => { const b = Buffer.concat([Buffer.from(t), d]); const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(b)); return Buffer.concat([l, b, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6; return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ih), ch('IDAT', deflateSync(raw)), ch('IEND', Buffer.alloc(0))]); }
const [out, ...spots] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  for (const s of spots) { const [x, y] = s.split(',').map(Number);
    const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(60); BK.tp(${x}, ${y - 1}); for (let i = 0; i < 330; i++) BK.step(1);
      const b = BK.buf, c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const g = c.getContext('2d'); g.drawImage(b, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data; let t = ''; for (let i = 0; i < d.length; i += 8192) t += String.fromCharCode.apply(null, d.subarray(i, i + 8192));
      return { f: btoa(t), w: b.width, h: b.height, px: BK.P.x / 16, py: BK.P.y / 16, g: !!BK.P.ground }; })()`, 120000);
    writeFileSync(`${out}/spot-${x}-${y}.png`, png(Uint8Array.from(Buffer.from(r.f, 'base64')), r.w, r.h)); console.log(s, 'hero at', r.px.toFixed(1), r.py.toFixed(1), 'ground', r.g); }
} finally { await pg.close?.(); }
