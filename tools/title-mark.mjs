// tools/title-mark.mjs - THE TITLE MARK (Daniel's logo, 11-08). Node only, no page. Asserts:
//   ASSET    assets/ui/title-mark.png is a real RGBA PNG at native pixel size (it is drawn 1:1 in the 320x180 picture, so it must fit and fit the title), its four corners are TRANSPARENT,
//            the outline is intact (opaque dark-brown edge pixels), it has gold letter pixels and green vine pixels, and no pixel is half-transparent (hard pixel edges); the original webp is kept beside it
//   LISTED   it is preloaded (index.html), kept with the shell (sw.js), shipped in the itch demo build (tools/build-itch.mjs put list) and not hidden from the deploy; the original webp is hidden from the deploy
//   DRAWN    src/main.js draws it on the title (and keeps the plank sign as the not-yet-loaded fallback)
//   NAMES    the shipped file name carries no ad-block word (src/admiral.js stalled the load at 14%, 10-27)
// usage: node tools/title-mark.mjs
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { adblockHits } from './build-itch.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), rd = f => readFileSync(join(ROOT, f), 'utf8');
const PNG = 'assets/ui/title-mark.png';

function decode(buf) {
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'a PNG');
  let p = 8, w = 0, h = 0, ct = -1, bd = 0; const idat = [];
  while (p < buf.length) { const n = buf.readUInt32BE(p), t = buf.toString('latin1', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n); if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; } if (t === 'IDAT') idat.push(d); p += 12 + n; }
  assert.equal(ct, 6, 'RGBA (colour type 6)'); assert.equal(bd, 8, '8 bits a channel');
  const raw = zlib.inflateSync(Buffer.concat(idat)), st = w * 4, out = Buffer.alloc(st * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], line = raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1));
    for (let x = 0; x < st; x++) {
      const a = x >= 4 ? out[y * st + x - 4] : 0, b = y ? out[(y - 1) * st + x] : 0, c = x >= 4 && y ? out[(y - 1) * st + x - 4] : 0;
      let v = line[x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      out[y * st + x] = v & 255;
    }
  }
  return { w, h, px: (x, y) => [...out.subarray(y * st + x * 4, y * st + x * 4 + 4)] };
}

/* ---- ASSET ---- */
assert.ok(existsSync(join(ROOT, PNG)), PNG + ' exists');
const im = decode(readFileSync(join(ROOT, PNG)));
assert.ok(im.w >= 120 && im.w <= 240 && im.h >= 16 && im.h <= 40, 'a native-size mark that fits the 320x180 title (' + im.w + 'x' + im.h + ')');
for (const [x, y] of [[0, 0], [im.w - 1, 0], [0, im.h - 1], [im.w - 1, im.h - 1]]) assert.equal(im.px(x, y)[3], 0, 'corner ' + x + ',' + y + ' is transparent');
let dark = 0, gold = 0, green = 0, half = 0, solid = 0;
for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
  const [r, g, b, a] = im.px(x, y); if (a !== 0 && a !== 255) half++; if (a !== 255) continue; solid++;
  if (r < 100 && g < 50 && b < 60) dark++; if (r > 230 && g > 150 && g < 215 && b < 90) gold++; if (g >= r - 12 && g > b + 30 && r < 190) green++;
}
assert.equal(half, 0, 'hard pixel edges: no half-transparent pixel');
assert.ok(dark > solid * 0.15, 'the dark-brown outline and shadow are intact (' + dark + ' of ' + solid + ' px)');
assert.ok(gold > solid * 0.3, 'the gold letters are there (' + gold + ' px)'); assert.ok(green >= 8, 'the green thorn vines are there (' + green + ' px)');
assert.ok(existsSync(join(ROOT, 'assets/ui/title-mark-original.webp')), 'the original webp is kept beside the PNG');
console.log('ok  ASSET   ' + PNG + ' ' + im.w + 'x' + im.h + ', transparent corners, outline ' + dark + ' px, gold ' + gold + ' px, vines ' + green + ' px, hard edges');

/* ---- LISTED ---- */
assert.ok(rd('index.html').includes('<link rel="preload" as="image" href="./' + PNG + '">'), 'index.html preloads it');
assert.ok(rd('sw.js').includes("'./" + PNG + "'"), 'the service worker shell keeps it');
assert.ok(rd('tools/build-itch.mjs').includes("'" + PNG + "'"), 'the itch demo build ships it (build-itch.mjs static put list)');
const ign = rd('.vercelignore'); assert.ok(!/assets/.test(ign.replace('/assets/ui/title-mark-original.webp', '')), 'the live deploy does not hide assets/'); assert.ok(ign.includes('/assets/ui/title-mark-original.webp'), 'the original webp is not deployed');
console.log('ok  LISTED  preload (index.html), shell (sw.js), itch demo build (build-itch.mjs), live deploy; original webp kept out of the deploy');

/* ---- DRAWN ---- */
const m = rd('src/main.js');
assert.ok(m.includes("src: 'assets/ui/title-mark.png'") && /g\.drawImage\(TITLE_MARK, /.test(m), 'main.js loads and draws the mark on the title');
assert.ok(m.includes('g.drawImage(PROP.plank'), 'the plank sign stays as the fallback until the mark has loaded');
assert.ok(!/imageSmoothingEnabled\s*=\s*true/.test(m.slice(m.indexOf('const useMark'), m.indexOf('const useMark') + 4000)), 'smoothing is not switched on around the mark (the picture buffer has it off: crisp)');
console.log('ok  DRAWN   the title draws the mark 1:1 in the picture (fallback: the plank sign)');

/* ---- NAMES ---- */
assert.deepEqual(adblockHits([PNG, 'assets/ui/title-mark-original.webp']), [], 'no ad-block word in the file names');
console.log('ok  NAMES   no ad-block word in ' + PNG);
